import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache client instance
let cachedClient: SupabaseClient | null = null;

/**
 * Sanitizes Supabase URL to guarantee clean origin without duplicated /rest/v1 or trailing slashes.
 */
export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  url = url.replace(/\/+$/, '');
  // Strip duplicated /rest/v1, /rest, /storage/v1 if accidentally included
  url = url.replace(/\/(rest|storage)(\/v[0-9]+)?\/?$/i, '');
  url = url.replace(/\/+$/, '');
  return url;
}

export const getSupabaseConfig = () => {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (typeof window !== 'undefined') {
    url = url || localStorage.getItem('pochampally_supabase_url') || '';
    key = key || localStorage.getItem('pochampally_supabase_key') || '';
  }
  return { url: sanitizeSupabaseUrl(url), key: key ? key.trim() : '' };
};

export const setSupabaseConfig = async (url: string, key: string) => {
  const sanitizedUrl = sanitizeSupabaseUrl(url);
  const trimmedKey = key ? key.trim() : '';

  if (typeof window !== 'undefined') {
    if (sanitizedUrl) localStorage.setItem('pochampally_supabase_url', sanitizedUrl);
    else localStorage.removeItem('pochampally_supabase_url');

    if (trimmedKey) localStorage.setItem('pochampally_supabase_key', trimmedKey);
    else localStorage.removeItem('pochampally_supabase_key');

    // Also persist to server (.env.local) so every device and server SSR can access it
    if (sanitizedUrl && trimmedKey) {
      try {
        await fetch('/api/supabase/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: sanitizedUrl, key: trimmedKey }),
        });
      } catch (e) {
        console.warn('Failed to sync config to server .env.local:', e);
      }
    }
  }
  // Invalidate cached client so new credentials take effect immediately
  cachedClient = null;
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return Boolean(
    url && 
    key && 
    url !== 'https://your-project.supabase.co' &&
    url.startsWith('https://')
  );
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (cachedClient) {
    return cachedClient;
  }
  const { url, key } = getSupabaseConfig();
  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: typeof window !== 'undefined',
      },
    });
    return cachedClient;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    return null;
  }
};

/**
 * Supabase Auth: Sign in as verified administrator
 */
export async function signInAdmin(email: string, password: string) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured');
  return client.auth.signInWithPassword({ email: email.trim(), password });
}

/**
 * Supabase Auth: Sign out administrator
 */
export async function signOutAdmin() {
  const client = getSupabaseClient();
  if (!client) return;
  return client.auth.signOut();
}

/**
 * Supabase Auth: Get current authenticated admin user
 */
export async function getAdminUser() {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data: { user } } = await client.auth.getUser();
  return user;
}

export const supabase = getSupabaseClient();

/**
 * Client-side high performance image compressor.
 * Downscales camera/phone photos (e.g. 5-15MB) into crisp, beautiful web-optimized images
 * (~1200px max dimension, ~50-80KB).
 */
export async function compressImage(file: File | Blob, maxDimension = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(file);
      return;
    }

    if (file instanceof File && (!file.type.startsWith('image/') && !file.name.match(/\.(jpg|jpeg|png|webp|heic|heif|bmp)$/i))) {
      resolve(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Upload an image to Supabase Storage bucket 'saree-images'.
 * Requires an authenticated administrator session to upload to cloud storage.
 * In PIN mode or local preview, stores optimized web image in the resilient local catalogue.
 */
export async function uploadSareeImage(file: File | Blob, fileNamePrefix?: string): Promise<string> {
  const client = getSupabaseClient();
  const configured = isSupabaseConfigured();

  // Compress image (~1200px max dimension, web-optimized JPEG)
  const compressedBlob = await compressImage(file, 1200, 0.8);

  if (client && configured) {
    try {
      // Check for authenticated administrator session (preserving RLS: no anonymous uploads)
      const { data: { user } } = await client.auth.getUser();

      if (user) {
        const fileExt = 'jpg';
        const cleanPrefix = (fileNamePrefix || 'saree').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20);
        const fileName = `${cleanPrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `sarees/${fileName}`;

        const { data, error } = await client.storage
          .from('saree-images')
          .upload(filePath, compressedBlob, {
            contentType: 'image/jpeg',
            cacheControl: '31536000',
            upsert: true,
          });

        if (error) {
          console.error('Supabase storage upload error:', error);
          throw new Error(`Failed to upload photograph to Supabase Storage: ${error.message}. (Ensure bucket "saree-images" exists and storage policies permit admin uploads)`);
        }

        if (data) {
          const { data: publicUrlData } = client.storage
            .from('saree-images')
            .getPublicUrl(filePath);
          return publicUrlData.publicUrl;
        }
      } else {
        console.info('Showroom PIN session active: image saved locally to catalogue cache. Sign into Supabase Auth for cloud storage writes.');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Failed to upload photograph to Supabase Storage')) {
        throw err;
      }
      console.warn('Supabase auth/storage check exception:', err);
    }
  }

  // Fallback for PIN mode or local catalogue persistence
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.readAsDataURL(compressedBlob);
  });
}

/**
 * Upload a PDF catalog to Supabase Storage bucket 'collection-pdfs'.
 */
export async function uploadCollectionPdf(file: File, collectionSlug?: string): Promise<string> {
  const client = getSupabaseClient();
  const configured = isSupabaseConfigured();

  if (client && configured) {
    const cleanSlug = (collectionSlug || 'catalog').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const fileName = `${cleanSlug}_${Date.now()}.pdf`;
    const filePath = `catalogs/${fileName}`;

    const { data, error } = await client.storage
      .from('collection-pdfs')
      .upload(filePath, file, {
        contentType: 'application/pdf',
        cacheControl: '31536000',
        upsert: true,
      });

    if (error) {
      console.error('Supabase PDF upload error:', error);
      throw new Error(`Failed to upload PDF catalog to Supabase: ${error.message}`);
    }

    if (data) {
      const { data: publicUrlData } = client.storage
        .from('collection-pdfs')
        .getPublicUrl(filePath);
      return publicUrlData.publicUrl;
    }
  }

  throw new Error('Supabase is not configured. Please connect Supabase in Settings before uploading PDF catalogs.');
}
