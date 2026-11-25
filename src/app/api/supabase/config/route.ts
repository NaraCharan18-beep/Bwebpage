import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return NextResponse.json({
    configured: Boolean(url && key && url.startsWith('https://')),
    url: url || null,
    hasKey: Boolean(key),
    keyPreview: key ? `${key.slice(0, 10)}...${key.slice(-6)}` : null,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { url, key } = await req.json();

    if (!url || !key) {
      return NextResponse.json({ error: 'URL and Key are required' }, { status: 400 });
    }

    const trimmedUrl = url.trim();
    const trimmedKey = key.trim();

    // Sanitize URL: ensure https and strip /rest/v1 or trailing slashes
    let sanitizedUrl = trimmedUrl;
    if (!/^https?:\/\//i.test(sanitizedUrl)) {
      sanitizedUrl = `https://${sanitizedUrl}`;
    }
    sanitizedUrl = sanitizedUrl.replace(/\/+$/, '');
    sanitizedUrl = sanitizedUrl.replace(/\/(rest|storage)(\/v[0-9]+)?\/?$/i, '');
    sanitizedUrl = sanitizedUrl.replace(/\/+$/, '');

    // Write to .env.local in project root
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Update or append NEXT_PUBLIC_SUPABASE_URL
    if (/^NEXT_PUBLIC_SUPABASE_URL=/m.test(envContent)) {
      envContent = envContent.replace(/^NEXT_PUBLIC_SUPABASE_URL=.*$/m, `NEXT_PUBLIC_SUPABASE_URL=${sanitizedUrl}`);
    } else {
      envContent += `\nNEXT_PUBLIC_SUPABASE_URL=${sanitizedUrl}`;
    }

    // Update or append NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (/^NEXT_PUBLIC_SUPABASE_ANON_KEY=/m.test(envContent)) {
      envContent = envContent.replace(/^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*$/m, `NEXT_PUBLIC_SUPABASE_ANON_KEY=${trimmedKey}`);
    } else {
      envContent += `\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${trimmedKey}`;
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');

    // Also update runtime process.env
    process.env['NEXT_PUBLIC_SUPABASE_URL'] = sanitizedUrl;
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = trimmedKey;

    return NextResponse.json({
      success: true,
      message: 'Supabase credentials saved permanently to .env.local and activated across all devices!',
      url: sanitizedUrl,
    });
  } catch (error: any) {
    console.error('Error saving Supabase config:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
