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
 * Upload an image to Supabase Storage bucket 'saree-images', or return base64 data URI
 */
export async function uploadSareeImage(file: File): Promise<string> {
  const client = getSupabaseClient();
  
  if (client && isSupabaseConfigured()) {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `sarees/${fileName}`;

      const { data, error } = await client.storage
        .from('saree-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.warn('Supabase storage upload error, falling back to local base64:', error);
      } else if (data) {
        const { data: publicUrlData } = client.storage
          .from('saree-images')
          .getPublicUrl(filePath);
        return publicUrlData.publicUrl;
      }
    } catch (err) {
      console.warn('Storage exception, using base64 fallback:', err);
    }
  }

  // Fallback: compress and convert to base64 Data URL so image is instantly viewable and persistable
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  });
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

