import { 
  ShopSettings, 
  HomepageContent, 
  AboutContent, 
  ProcessStep, 
  Collection, 
  Album, 
  AlbumPhoto, 
  Enquiry, 
  AdminMetrics 
} from './types';
import { 
  initialShopSettings, 
  initialHomepageContent, 
  initialAboutContent, 
  initialProcessSteps, 
  initialCollections, 
  initialAlbums 
} from './seed-data';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  SETTINGS: 'pochampally_settings_v4',
  HOMEPAGE: 'pochampally_homepage_v4',
  ABOUT: 'pochampally_about_v4',
  STEPS: 'pochampally_steps_v4',
  COLLECTIONS: 'pochampally_collections_v4',
  ALBUMS: 'pochampally_albums_v4',
  ENQUIRIES: 'pochampally_enquiries_v4',
};

// Memory cache
let cachedData = {
  settings: initialShopSettings,
  homepage: initialHomepageContent,
  about: initialAboutContent,
  steps: initialProcessSteps,
  collections: initialCollections,
  albums: initialAlbums,
  enquiries: [] as Enquiry[],
  initialized: false,
};

function notifyDataChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('pochampally-data-updated'));
  }
}

// Local Storage Helpers
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyDataChanged();
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export function initLocalStore() {
  if (typeof window === 'undefined' || cachedData.initialized) return;
  cachedData.settings = getFromStorage(STORAGE_KEYS.SETTINGS, initialShopSettings);
  if (cachedData.settings.shop_name.includes('Charan')) {
    cachedData.settings = { ...cachedData.settings, shop_name: 'SRI LAXMI NARSHIMA SARES HOUSE' };
    setToStorage(STORAGE_KEYS.SETTINGS, cachedData.settings);
  }
  cachedData.homepage = getFromStorage(STORAGE_KEYS.HOMEPAGE, initialHomepageContent);
  cachedData.about = getFromStorage(STORAGE_KEYS.ABOUT, initialAboutContent);
  cachedData.steps = getFromStorage(STORAGE_KEYS.STEPS, initialProcessSteps);
  cachedData.collections = getFromStorage(STORAGE_KEYS.COLLECTIONS, initialCollections);
  cachedData.albums = getFromStorage(STORAGE_KEYS.ALBUMS, initialAlbums);
  
  // Strip any price tags from all albums
  cachedData.albums = cachedData.albums.map((alb) => ({
    ...alb,
    photos: alb.photos.map((p) => ({
      ...p,
      details: p.details ? { ...p.details, price: null } : undefined,
    })),
  }));

  cachedData.enquiries = getFromStorage(STORAGE_KEYS.ENQUIRIES, []);
  cachedData.initialized = true;
}

// ==========================================
// 1. SHOP SETTINGS
// ==========================================
export async function getShopSettings(): Promise<ShopSettings> {
  initLocalStore();
  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      const { data, error } = await client.from('shop_settings').select('*').eq('id', 'primary').single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetch settings failed, using local store:', e);
    }
  }
  return cachedData.settings;
}

export async function updateShopSettings(settings: ShopSettings): Promise<void> {
  cachedData.settings = { ...settings, updated_at: new Date().toISOString() };
  setToStorage(STORAGE_KEYS.SETTINGS, cachedData.settings);

  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      await client.from('shop_settings').upsert(cachedData.settings);
    } catch (e) {
      console.error('Supabase upsert settings failed:', e);
    }
  }
}

// ==========================================
// 2. HOMEPAGE CONTENT
// ==========================================
export async function getHomepageContent(): Promise<HomepageContent> {
  initLocalStore();
  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      const { data, error } = await client.from('homepage_content').select('*').eq('id', 'primary').single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetch homepage failed, using local store:', e);
    }
  }
  return cachedData.homepage;
}

export async function updateHomepageContent(content: HomepageContent): Promise<void> {
  cachedData.homepage = { ...content, updated_at: new Date().toISOString() };
  setToStorage(STORAGE_KEYS.HOMEPAGE, cachedData.homepage);

  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      await client.from('homepage_content').upsert(cachedData.homepage);
    } catch (e) {
      console.error('Supabase upsert homepage failed:', e);
    }
  }
}

// ==========================================
// 3. ABOUT CONTENT
// ==========================================
export async function getAboutContent(): Promise<AboutContent> {
  initLocalStore();
  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      const { data, error } = await client.from('about_content').select('*').eq('id', 'primary').single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetch about failed, using local store:', e);
    }
  }
  return cachedData.about;
}

export async function updateAboutContent(about: AboutContent): Promise<void> {
  cachedData.about = { ...about, updated_at: new Date().toISOString() };
  setToStorage(STORAGE_KEYS.ABOUT, cachedData.about);

  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      await client.from('about_content').upsert(cachedData.about);
    } catch (e) {
      console.error('Supabase upsert about failed:', e);
    }
  }
}

// ==========================================
// 4. PROCESS STEPS
// ==========================================
export async function getProcessSteps(): Promise<ProcessStep[]> {
  initLocalStore();
  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      const { data, error } = await client.from('process_steps').select('*').order('display_order', { ascending: true });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase fetch steps failed, using local store:', e);
    }
  }
  return [...cachedData.steps].sort((a, b) => a.display_order - b.display_order);
}

export async function saveProcessStep(step: ProcessStep): Promise<void> {
  initLocalStore();
  const index = cachedData.steps.findIndex(s => s.id === step.id);
  if (index >= 0) {
    cachedData.steps[index] = step;
  } else {
    cachedData.steps.push(step);
  }
  setToStorage(STORAGE_KEYS.STEPS, cachedData.steps);

  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      await client.from('process_steps').upsert(step);
    } catch (e) {
      console.error('Supabase upsert step failed:', e);
    }
  }
}

export async function deleteProcessStep(id: string): Promise<void> {
  initLocalStore();
  cachedData.steps = cachedData.steps.filter(s => s.id !== id);
  setToStorage(STORAGE_KEYS.STEPS, cachedData.steps);

  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      await client.from('process_steps').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase delete step failed:', e);
    }
  }
}

// ==========================================
// 5. COLLECTIONS (Cloth/Fabric Types: Cotton, Sico, Pure Silk, etc.)
// ==========================================
export async function getCollections(onlyActive = false): Promise<Collection[]> {
  initLocalStore();
  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      let query = client.from('collections').select('*').order('display_order', { ascending: true });
      if (onlyActive) query = query.eq('status', 'active');
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase fetch collections failed, using local store:', e);
    }
  }
  let cols = [...cachedData.collections];
  if (onlyActive) {
    cols = cols.filter(c => c.status === 'active');
  }
  return cols.sort((a, b) => a.display_order - b.display_order);
}

export async function saveCollection(collection: Collection): Promise<void> {
  initLocalStore();
  const index = cachedData.collections.findIndex(c => c.id === collection.id);
  const updated = { ...collection, updated_at: new Date().toISOString() };
  if (index >= 0) {
    cachedData.collections[index] = updated;
  } else {
    cachedData.collections.push(updated);
  }
  setToStorage(STORAGE_KEYS.COLLECTIONS, cachedData.collections);

  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      await client.from('collections').upsert(updated);
    } catch (e) {
      console.error('Supabase upsert collection failed:', e);
    }
  }
}

export async function deleteCollection(id: string): Promise<{ success: boolean; message?: string }> {
  initLocalStore();
  cachedData.collections = cachedData.collections.filter(c => c.id !== id);
  cachedData.albums = cachedData.albums.filter(a => a.collection_id !== id);

  setToStorage(STORAGE_KEYS.COLLECTIONS, cachedData.collections);
  setToStorage(STORAGE_KEYS.ALBUMS, cachedData.albums);

  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      await client.from('collections').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase delete collection failed:', e);
    }
  }
  return { success: true };
}

// ==========================================
// 6. PHOTO ALBUMS (Multiple photos per album)
// ==========================================
export async function getAlbums(options?: {
  collectionId?: string;
  onlyActive?: boolean;
  featuredOnly?: boolean;
}): Promise<Album[]> {
  initLocalStore();
  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      let query = client.from('albums').select('*').order('display_order', { ascending: true });
      if (options?.collectionId && options.collectionId !== 'all') {
        query = query.eq('collection_id', options.collectionId);
      }
      if (options?.onlyActive) {
        query = query.eq('status', 'active');
      }
      if (options?.featuredOnly) {
        query = query.eq('is_featured', true);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase fetch albums failed, using local store:', e);
    }
  }

  let results = [...cachedData.albums];
  if (options?.collectionId && options.collectionId !== 'all') {
    results = results.filter(a => a.collection_id === options.collectionId);
  }
  if (options?.onlyActive) {
    results = results.filter(a => a.status === 'active');
  }
  if (options?.featuredOnly) {
    results = results.filter(a => a.is_featured);
  }

  return results.sort((a, b) => a.display_order - b.display_order);
}

export async function getAlbumById(id: string): Promise<Album | null> {
  initLocalStore();
  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      const { data, error } = await client.from('albums').select('*').eq('id', id).single();
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetch album by id failed, using local store:', e);
    }
  }
  return cachedData.albums.find(a => a.id === id) || null;
}

export async function saveAlbum(album: Album): Promise<void> {
  initLocalStore();
  const index = cachedData.albums.findIndex(a => a.id === album.id);
  const updated = { ...album, updated_at: new Date().toISOString() };
  if (index >= 0) {
    cachedData.albums[index] = updated;
  } else {
    cachedData.albums.unshift(updated);
  }
  setToStorage(STORAGE_KEYS.ALBUMS, cachedData.albums);

  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      await client.from('albums').upsert(updated);
    } catch (e) {
      console.error('Supabase upsert album failed:', e);
    }
  }
}

export async function deleteAlbum(id: string): Promise<void> {
  initLocalStore();
  cachedData.albums = cachedData.albums.filter(a => a.id !== id);
  setToStorage(STORAGE_KEYS.ALBUMS, cachedData.albums);

  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      await client.from('albums').delete().eq('id', id);
    } catch (e) {
      console.error('Supabase delete album failed:', e);
    }
  }
}

// ==========================================
// 7. CUSTOMER ENQUIRIES
// ==========================================
export async function submitEnquiry(enquiry: Omit<Enquiry, 'id' | 'created_at' | 'status'>): Promise<Enquiry> {
  initLocalStore();
  const newEnquiry: Enquiry = {
    ...enquiry,
    id: `enq-${Date.now()}`,
    created_at: new Date().toISOString(),
    status: 'new',
  };
  cachedData.enquiries.unshift(newEnquiry);
  setToStorage(STORAGE_KEYS.ENQUIRIES, cachedData.enquiries);

  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      await client.from('enquiries').insert(newEnquiry);
    } catch (e) {
      console.error('Supabase enquiry submit failed:', e);
    }
  }

  return newEnquiry;
}

export async function getEnquiries(): Promise<Enquiry[]> {
  initLocalStore();
  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      const { data, error } = await client.from('enquiries').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase fetch enquiries failed, using local store:', e);
    }
  }
  return cachedData.enquiries;
}

// ==========================================
// 8. METRICS & DELETE SAFETY
// ==========================================
export async function getAdminMetrics(): Promise<AdminMetrics> {
  initLocalStore();
  const collections = await getCollections();
  const albums = await getAlbums();
  const enquiries = await getEnquiries();

  const totalPhotos = albums.reduce((acc, alb) => acc + (alb.photos?.length || 0), 0);

  return {
    totalCollections: collections.length,
    totalAlbums: albums.length,
    totalPhotos,
    activeAlbums: albums.filter(a => a.status === 'active').length,
    featuredAlbums: albums.filter(a => a.is_featured).length,
    totalEnquiries: enquiries.length,
  };
}

export function checkDeleteSafety(type: 'collection' | 'album', id: string): {
  canDelete: boolean;
  warningMessage?: string;
  associatedCount: number;
} {
  initLocalStore();
  if (type === 'collection') {
    const albList = cachedData.albums.filter(a => a.collection_id === id);
    const photoCount = albList.reduce((acc, a) => acc + (a.photos?.length || 0), 0);
    if (albList.length > 0) {
      return {
        canDelete: true,
        associatedCount: albList.length,
        warningMessage: `This collection contains ${albList.length} album(s) with ${photoCount} total saree photographs. Deleting it will also remove all its albums and photos.`,
      };
    }
  } else if (type === 'album') {
    const alb = cachedData.albums.find(a => a.id === id);
    const photoCount = alb?.photos?.length || 0;
    if (photoCount > 0) {
      return {
        canDelete: true,
        associatedCount: photoCount,
        warningMessage: `This album currently contains ${photoCount} saree photograph(s). Deleting it will remove all photos in this album.`,
      };
    }
  }
  return { canDelete: true, associatedCount: 0 };
}

// Reset data to defaults
export function resetDataToDefaults() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.HOMEPAGE);
  localStorage.removeItem(STORAGE_KEYS.ABOUT);
  localStorage.removeItem(STORAGE_KEYS.STEPS);
  localStorage.removeItem(STORAGE_KEYS.COLLECTIONS);
  localStorage.removeItem(STORAGE_KEYS.ALBUMS);
  localStorage.removeItem(STORAGE_KEYS.ENQUIRIES);
  cachedData.initialized = false;
  initLocalStore();
  notifyDataChanged();
}
