import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function sanitizeUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  url = url.replace(/\/+$/, '');
  url = url.replace(/\/(rest|storage)(\/v[0-9]+)?\/?$/i, '');
  url = url.replace(/\/+$/, '');
  return url;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawUrl = body.url || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = (body.key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

    if (!rawUrl || !key) {
      return NextResponse.json({
        success: false,
        configured: false,
        error: 'Supabase URL or Publishable/Anon Key is missing. Please configure credentials first.',
      });
    }

    const cleanUrl = sanitizeUrl(rawUrl);
    const accessToken = (body.accessToken || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '').trim();

    // Standard client with authenticated admin session if available
    const client = createClient(cleanUrl, key, {
      auth: { persistSession: false },
      global: {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
    });

    let authUser: { id: string; email: string | null } | null = null;
    if (accessToken) {
      try {
        const { data: uData } = await client.auth.getUser(accessToken);
        if (uData?.user) {
          authUser = {
            id: uData.user.id,
            email: uData.user.email || null,
          };
        }
      } catch {
        // token might be expired or invalid
      }
    }

    const report: {
      timestamp: string;
      url: string;
      sanitizedUrl: string;
      hadDuplicatedRestPath: boolean;
      connected: boolean;
      connectionError: string | null;
      connectionCode: string | null;
      auth: {
        hasSession: boolean;
        userEmail: string | null;
        userId: string | null;
      };
      tables: Record<string, any>;
      columns: Record<string, boolean>;
      storage: Record<string, any>;
      writeTest: {
        attempted: boolean;
        success: boolean;
        error: string | null;
        code: string | null;
      };
      recommendations: string[];
    } = {
      timestamp: new Date().toISOString(),
      url: rawUrl,
      sanitizedUrl: cleanUrl,
      hadDuplicatedRestPath: /\/(rest|storage)/i.test(rawUrl),
      connected: false,
      connectionError: null,
      connectionCode: null,
      auth: {
        hasSession: Boolean(accessToken && authUser),
        userEmail: authUser?.email || null,
        userId: authUser?.id || null,
      },
      tables: {},
      columns: {
        hasSareesColumn: false,
        hasIsFeatured: false,
        hasSectionId: false,
      },
      storage: {
        hasSareeImages: false,
        hasCollectionPdfs: false,
        bucketsFound: [],
        error: null,
      },
      writeTest: {
        attempted: false,
        success: false,
        error: null,
        code: null,
      },
      recommendations: [],
    };

    if (report.hadDuplicatedRestPath) {
      report.recommendations.push(
        `Note: Your URL contained a trailing '/rest/v1'. It has been automatically sanitized to '${cleanUrl}'.`
      );
    }

    // -------------------------------------------------------------------------
    // 1. Independent Database Connectivity Test
    // -------------------------------------------------------------------------
    try {
      // Test basic connection by querying just the primary ID
      const { data, error } = await client.from('collections').select('id').limit(1);
      if (error) {
        // If error is 42703 (column error) or 42501 (RLS), the database IS connected
        if (error.code === '42501' || error.code === '42703' || error.code === 'PGRST116') {
          report.connected = true;
        } else if (error.code === 'PGRST125' || error.message?.includes('Invalid path')) {
          report.connected = false;
          report.connectionError = 'Invalid path specified in request URL. Ensure URL does not contain /rest/v1.';
          report.connectionCode = error.code;
        } else if (error.message?.includes('Failed to fetch') || error.message?.includes('ENOTFOUND')) {
          report.connected = false;
          report.connectionError = `Could not reach ${cleanUrl}. Check network or project URL.`;
          report.connectionCode = 'NETWORK_ERROR';
        } else if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('apikey')) {
          report.connected = false;
          report.connectionError = 'Invalid Publishable/Anon Key. Check Supabase API keys.';
          report.connectionCode = error.code || 'AUTH_ERROR';
        } else {
          // Other PostgreSQL error means host responded
          report.connected = true;
          report.connectionError = error.message;
          report.connectionCode = error.code;
        }
      } else {
        report.connected = true;
      }
    } catch (connErr: any) {
      report.connected = false;
      report.connectionError = connErr.message || 'Unknown network error';
    }

    // Fallback: If collections test had network error, try shop_settings
    if (!report.connected) {
      try {
        const { error: sErr } = await client.from('shop_settings').select('id').limit(1);
        if (!sErr || sErr.code === '42501') {
          report.connected = true;
          report.connectionError = null;
        }
      } catch {
        // keep previous error
      }
    }

    // -------------------------------------------------------------------------
    // 2. Required Tables & Sarees Column Verification
    // -------------------------------------------------------------------------
    if (report.connected) {
      const coreTables = ['collections', 'shop_settings', 'homepage_content', 'about_content', 'process_steps', 'albums', 'enquiries'];
      for (const tbl of coreTables) {
        try {
          const { data, error } = await client.from(tbl).select('id').limit(1);
          if (error) {
            report.tables[tbl] = { exists: false, error: error.message, code: error.code };
          } else {
            report.tables[tbl] = { exists: true, count: data?.length || 0 };
          }
        } catch (e: any) {
          report.tables[tbl] = { exists: false, error: e.message };
        }
      }

      // Check specific sarees column
      try {
        const { error: sareesErr } = await client.from('collections').select('sarees').limit(1);
        if (sareesErr) {
          report.columns.hasSareesColumn = false;
          report.recommendations.push(
            'The "sarees" JSONB column is missing from "collections". Run the migration script in supabase_schema_v2.sql to add it.'
          );
        } else {
          report.columns.hasSareesColumn = true;
        }
      } catch {
        report.columns.hasSareesColumn = false;
      }
    }

    // -------------------------------------------------------------------------
    // 3. Storage Bucket Availability
    // -------------------------------------------------------------------------
    try {
      const { data: buckets, error: bError } = await client.storage.listBuckets();
      if (bError) {
        report.storage.error = bError.message;
        // In some Supabase setups, listBuckets() is restricted for anon. Test public access to the bucket directly:
        const { data: probeData } = client.storage.from('saree-images').getPublicUrl('test.jpg');
        report.storage.probeUrl = probeData?.publicUrl || null;
      } else {
        const names = buckets?.map((b) => b.name) || [];
        report.storage.bucketsFound = names;
        report.storage.hasSareeImages = names.includes('saree-images');
        report.storage.hasCollectionPdfs = names.includes('collection-pdfs');
      }

      if (!report.storage.hasSareeImages) {
        report.recommendations.push(
          'Storage bucket "saree-images" was not found in storage.buckets. Create it using supabase_schema_v2.sql or in Supabase Storage dashboard.'
        );
      }
      if (!report.storage.hasCollectionPdfs) {
        report.recommendations.push(
          'Storage bucket "collection-pdfs" was not found in storage.buckets. Create it using supabase_schema_v2.sql or in Supabase Storage dashboard.'
        );
      }
    } catch (storageErr: any) {
      report.storage.error = storageErr.message;
    }

    // -------------------------------------------------------------------------
    // 4. Admin Write & RLS Test
    // -------------------------------------------------------------------------
    if (report.connected) {
      report.writeTest.attempted = true;
      const testId = `diag-${Date.now()}`;
      try {
        const { error: insErr } = await client.from('collections').insert({
          id: testId,
          name: 'Supabase Diagnostic Test',
          slug: `diag-${Date.now()}`,
          description: 'Temporary verification test record',
          cover_image: '/images/hero_saree.jpg',
          display_order: 9999,
          status: 'hidden',
          updated_at: new Date().toISOString(),
        });

        if (insErr) {
          report.writeTest.success = false;
          report.writeTest.error = insErr.message;
          report.writeTest.code = insErr.code;
          if (insErr.code === '42501') {
            if (!accessToken) {
              report.recommendations.push(
                'Row Level Security (RLS) properly blocked anonymous write. Sign in to your admin account using "Supabase Auth" on the admin login page to verify authorized write access.'
              );
            } else {
              report.recommendations.push(
                `Authenticated user ${authUser?.email || 'session'} was blocked by RLS. Ensure your account is registered in admin_users by executing "SELECT public.register_super_admin('${authUser?.email || 'owner@email.com'}');" in Supabase SQL Editor.`
              );
            }
          }
        } else {
          report.writeTest.success = true;
          // Guaranteed cleanup of temporary verification test record
          try {
            await client.from('collections').delete().eq('id', testId);
          } catch (delErr) {
            console.warn('Diagnostic test row cleanup notice:', delErr);
          }
        }
      } catch (wErr: any) {
        report.writeTest.success = false;
        report.writeTest.error = wErr.message;
        // Attempt cleanup just in case insert succeeded before exception
        try {
          await client.from('collections').delete().eq('id', testId);
        } catch {}
      }
    }

    const allHealthy =
      report.connected &&
      report.columns.hasSareesColumn &&
      report.storage.hasSareeImages &&
      report.writeTest.success;

    return NextResponse.json({
      success: allHealthy,
      report,
      summary: allHealthy
        ? '✓ Supabase is 100% connected and operational! Cloud database, storage, and admin permissions are ready.'
        : 'Action required: Some Supabase checks need attention. See the diagnostic items below and apply the migration script.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
