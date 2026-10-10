import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default environment variables
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// In browser context, allow dynamic override from Admin Database Settings
if (typeof window !== 'undefined') {
  const customUrl = localStorage.getItem('pochampally_supabase_url');
  const customKey = localStorage.getItem('pochampally_supabase_key');
  if (customUrl) supabaseUrl = customUrl;
  if (customKey) supabaseAnonKey = customKey;
}

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseUrl.startsWith('https://')
  );
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    return null;
  }
};

export const supabase = getSupabaseClient();

/**
 * Client-side high performance image compressor.
 * Downscales huge phone/camera photos (e.g. 5-10MB) to crisp web-optimized resolution (~1600px, ~150-250KB).
 */
export async function compressImage(file: File, maxDimension = 1600, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If not an image or SVG, return as is
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      resolve(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Calculate aspect ratio downscaling if larger than maxDimension
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

      // Smooth sampling
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
 * Upload an image to Supabase Storage bucket 'saree-images', or return compressed base64 data URI
 */
export async function uploadSareeImage(file: File): Promise<string> {
  try {
    // Compress first for fast upload and lightweight storage
    const compressedBlob = await compressImage(file, 1600, 0.82);
    const client = getSupabaseClient();
    
    if (client && isSupabaseConfigured()) {
      try {
        const fileExt = 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `sarees/${fileName}`;

        const { data, error } = await client.storage
          .from('saree-images')
          .upload(filePath, compressedBlob, {
            contentType: 'image/jpeg',
            cacheControl: '31536000',
            upsert: false,
          });

        if (error) {
          console.warn('Supabase storage upload error, falling back to local storage:', error);
        } else if (data) {
          const { data: publicUrlData } = client.storage
            .from('saree-images')
            .getPublicUrl(filePath);
          return publicUrlData.publicUrl;
        }
      } catch (err) {
        console.warn('Storage exception, using fallback:', err);
      }
    }

    // Fallback: convert compressed blob to base64 Data URL so image is instantly viewable and persistable
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(compressedBlob);
    });
  } catch (e) {
    console.error('Error in uploadSareeImage:', e);
    // Ultimate fallback to direct read
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target?.result as string);
      reader.readAsDataURL(file);
    });
  }
}

export const getSupabaseConfig = () => {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (typeof window !== 'undefined') {
    url = localStorage.getItem('pochampally_supabase_url') || url;
    key = localStorage.getItem('pochampally_supabase_key') || key;
  }
  return { url, key };
};

export const setSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem('pochampally_supabase_url', url);
    else localStorage.removeItem('pochampally_supabase_url');
    if (key) localStorage.setItem('pochampally_supabase_key', key);
    else localStorage.removeItem('pochampally_supabase_key');
  }
};
