import { 
  ShopSettings, 
  HomepageContent, 
  AboutContent, 
  ProcessStep, 
  Collection, 
  Album, 
  AlbumPhoto, 
  Enquiry, 
  AdminMetrics,
  SareeItem
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
  SETTINGS: 'pochampally_settings_v5',
  HOMEPAGE: 'pochampally_homepage_v5',
  ABOUT: 'pochampally_about_v5',
  STEPS: 'pochampally_steps_v5',
  COLLECTIONS: 'pochampally_collections_v5',
  ALBUMS: 'pochampally_albums_v5',
  ENQUIRIES: 'pochampally_enquiries_v5',
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
  if (typeof window !== 'undefined' && !cachedData.initialized) {
    cachedData.settings = getFromStorage(STORAGE_KEYS.SETTINGS, initialShopSettings);
    if (!cachedData.settings.shop_name || cachedData.settings.shop_name.includes('Charan')) {
      cachedData.settings = { ...cachedData.settings, shop_name: 'SRI LAXMI NARSHIMA SARES HOUSE' };
      setToStorage(STORAGE_KEYS.SETTINGS, cachedData.settings);
    }
    if (!cachedData.settings.admin_pin || cachedData.settings.admin_pin === 'admin123') {
      cachedData.settings = { ...cachedData.settings, admin_pin: '7579' };
      setToStorage(STORAGE_KEYS.SETTINGS, cachedData.settings);
    }
    if (!cachedData.settings.whatsapp_group_url) {
      cachedData.settings = { ...cachedData.settings, whatsapp_group_url: 'https://chat.whatsapp.com/J9afqXLrDfR7fhsHYffP9r' };
      setToStorage(STORAGE_KEYS.SETTINGS, cachedData.settings);
    }
    if (!cachedData.settings.website_url) {
      cachedData.settings = { ...cachedData.settings, website_url: 'https://bwebpage-szwt.vercel.app' };
      setToStorage(STORAGE_KEYS.SETTINGS, cachedData.settings);
    }

    cachedData.homepage = getFromStorage(STORAGE_KEYS.HOMEPAGE, initialHomepageContent);
    cachedData.about = getFromStorage(STORAGE_KEYS.ABOUT, initialAboutContent);
    cachedData.steps = getFromStorage(STORAGE_KEYS.STEPS, initialProcessSteps);
    
    // Load collections
    const storedCols = getFromStorage<Collection[]>(STORAGE_KEYS.COLLECTIONS, initialCollections);
    // Ensure every collection has a valid sarees array
    cachedData.collections = storedCols.map(col => {
      const matchInitial = initialCollections.find(ic => ic.id === col.id);
      return {
        ...col,
        sarees: Array.isArray(col.sarees) && col.sarees.length > 0 
          ? col.sarees 
          : (matchInitial?.sarees || []),
      };
    });

    cachedData.albums = getFromStorage(STORAGE_KEYS.ALBUMS, initialAlbums);
    cachedData.enquiries = getFromStorage(STORAGE_KEYS.ENQUIRIES, []);
    cachedData.initialized = true;
  }
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

export async function updateShopSettings(newSettings: Partial<ShopSettings>): Promise<ShopSettings> {
  initLocalStore();
  cachedData.settings = {
    ...cachedData.settings,
    ...newSettings,
    updated_at: new Date().toISOString(),
  };
  setToStorage(STORAGE_KEYS.SETTINGS, cachedData.settings);

  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      await client.from('shop_settings').upsert(cachedData.settings);
    } catch (e) {
      console.error('Supabase update settings failed:', e);
    }
  }
  return cachedData.settings;
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

export async function updateHomepageContent(content: Partial<HomepageContent>): Promise<HomepageContent> {
  initLocalStore();
  cachedData.homepage = {
    ...cachedData.homepage,
    ...content,
    updated_at: new Date().toISOString(),
  };
  setToStorage(STORAGE_KEYS.HOMEPAGE, cachedData.homepage);

  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      await client.from('homepage_content').upsert(cachedData.homepage);
    } catch (e) {
      console.error('Supabase update homepage failed:', e);
    }
  }
  return cachedData.homepage;
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

export async function updateAboutContent(content: Partial<AboutContent>): Promise<AboutContent> {
  initLocalStore();
  cachedData.about = {
    ...cachedData.about,
    ...content,
    updated_at: new Date().toISOString(),
  };
  setToStorage(STORAGE_KEYS.ABOUT, cachedData.about);

  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      await client.from('about_content').upsert(cachedData.about);
    } catch (e) {
      console.error('Supabase update about failed:', e);
    }
  }
  return cachedData.about;
}

// ==========================================
// 4. PROCESS STEPS (Storytelling)
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
  return cachedData.steps.sort((a, b) => a.display_order - b.display_order);
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
// 5. UNIFIED COLLECTIONS & SAREES
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

  let results = [...cachedData.collections];
  if (onlyActive) {
    results = results.filter(c => c.status === 'active');
  }
  return results.sort((a, b) => a.display_order - b.display_order);
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  initLocalStore();
  return cachedData.collections.find(c => c.id === id) || null;
}

export async function saveCollection(collection: Collection): Promise<void> {
  initLocalStore();
  const index = cachedData.collections.findIndex(c => c.id === collection.id);
  const updated: Collection = {
    ...collection,
    sarees: collection.sarees || [],
    updated_at: new Date().toISOString(),
  };

  if (index >= 0) {
    cachedData.collections[index] = updated;
  } else {
    cachedData.collections.push(updated);
  }
  setToStorage(STORAGE_KEYS.COLLECTIONS, cachedData.collections);

  // Sync to albums for backward compatibility
  syncCollectionToAlbum(updated);

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
  cachedData.albums = cachedData.albums.filter(a => a.collection_id !== id && a.id !== `alb-${id}`);
  
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

// Bulk Add Sarees to Collection
export async function addSareesToCollection(
  collectionId: string,
  newSarees: Partial<SareeItem>[]
): Promise<Collection | null> {
  initLocalStore();
  const colIndex = cachedData.collections.findIndex(c => c.id === collectionId);
  if (colIndex === -1) return null;

  const col = cachedData.collections[colIndex];
  const existingSarees = col.sarees || [];
  
  const createdSarees: SareeItem[] = newSarees.map((s, idx) => ({
    id: s.id || `saree-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
    code: s.code || `S-${col.sarees.length + idx + 1}`,
    name: s.name || `Saree ${col.sarees.length + idx + 1}`,
    image_url: s.image_url || '/images/hero_saree.jpg',
    collection_id: collectionId,
    collection_name: col.name,
    fabric: s.fabric || '',
    color: s.color || '',
    description: s.description || '',
    price: s.price ?? null,
    show_price: s.show_price ?? false,
    order: existingSarees.length + idx + 1,
    is_cover: existingSarees.length === 0 && idx === 0,
    availability: s.availability || 'available',
    created_at: new Date().toISOString(),
  }));

  const updatedSarees = [...existingSarees, ...createdSarees];
  const updatedCol: Collection = {
    ...col,
    cover_image: col.cover_image || createdSarees[0]?.image_url || '/images/hero_saree.jpg',
    sarees: updatedSarees,
    updated_at: new Date().toISOString(),
  };

  cachedData.collections[colIndex] = updatedCol;
  setToStorage(STORAGE_KEYS.COLLECTIONS, cachedData.collections);
  syncCollectionToAlbum(updatedCol);

  return updatedCol;
}

// Update Single Saree inside Collection
export async function updateSaree(collectionId: string, updatedSaree: SareeItem): Promise<void> {
  initLocalStore();
  const colIndex = cachedData.collections.findIndex(c => c.id === collectionId);
  if (colIndex === -1) return;

  const col = cachedData.collections[colIndex];
  const sareeIndex = col.sarees.findIndex(s => s.id === updatedSaree.id);
  if (sareeIndex === -1) return;

  col.sarees[sareeIndex] = { ...updatedSaree, updated_at: new Date().toISOString() };
  if (updatedSaree.is_cover) {
    col.cover_image = updatedSaree.image_url;
    col.sarees.forEach(s => {
      s.is_cover = s.id === updatedSaree.id;
    });
  }

  col.updated_at = new Date().toISOString();
  cachedData.collections[colIndex] = col;
  setToStorage(STORAGE_KEYS.COLLECTIONS, cachedData.collections);
  syncCollectionToAlbum(col);
}

// Delete Single Saree
export async function deleteSaree(collectionId: string, sareeId: string): Promise<void> {
  initLocalStore();
  const colIndex = cachedData.collections.findIndex(c => c.id === collectionId);
  if (colIndex === -1) return;

  const col = cachedData.collections[colIndex];
  col.sarees = col.sarees.filter(s => s.id !== sareeId);
  if (col.sarees.length > 0 && !col.sarees.some(s => s.is_cover)) {
    col.sarees[0].is_cover = true;
    col.cover_image = col.sarees[0].image_url;
  }
  col.updated_at = new Date().toISOString();
  cachedData.collections[colIndex] = col;
  setToStorage(STORAGE_KEYS.COLLECTIONS, cachedData.collections);
  syncCollectionToAlbum(col);
}

// Move Saree to another Collection
export async function moveSareeToCollection(
  sareeId: string,
  fromCollectionId: string,
  toCollectionId: string
): Promise<boolean> {
  initLocalStore();
  if (fromCollectionId === toCollectionId) return true;

  const fromCol = cachedData.collections.find(c => c.id === fromCollectionId);
  const toCol = cachedData.collections.find(c => c.id === toCollectionId);
  if (!fromCol || !toCol) return false;

  const sareeIndex = fromCol.sarees.findIndex(s => s.id === sareeId);
  if (sareeIndex === -1) return false;

  const [saree] = fromCol.sarees.splice(sareeIndex, 1);
  saree.collection_id = toCollectionId;
  saree.collection_name = toCol.name;
  saree.order = toCol.sarees.length + 1;
  saree.is_cover = toCol.sarees.length === 0;

  toCol.sarees.push(saree);
  if (saree.is_cover) {
    toCol.cover_image = saree.image_url;
  }

  setToStorage(STORAGE_KEYS.COLLECTIONS, cachedData.collections);
  syncCollectionToAlbum(fromCol);
  syncCollectionToAlbum(toCol);
  return true;
}

// Set Cover Image for Collection
export async function setCollectionCover(collectionId: string, imageUrl: string): Promise<void> {
  initLocalStore();
  const colIndex = cachedData.collections.findIndex(c => c.id === collectionId);
  if (colIndex === -1) return;

  const col = cachedData.collections[colIndex];
  col.cover_image = imageUrl;
  col.sarees.forEach(s => {
    s.is_cover = s.image_url === imageUrl;
  });
  col.updated_at = new Date().toISOString();
  cachedData.collections[colIndex] = col;
  setToStorage(STORAGE_KEYS.COLLECTIONS, cachedData.collections);
  syncCollectionToAlbum(col);
}

// Reorder Collections
export async function reorderCollections(orderedIds: string[]): Promise<void> {
  initLocalStore();
  cachedData.collections.forEach(col => {
    const idx = orderedIds.indexOf(col.id);
    if (idx >= 0) {
      col.display_order = idx + 1;
    }
  });
  cachedData.collections.sort((a, b) => a.display_order - b.display_order);
  setToStorage(STORAGE_KEYS.COLLECTIONS, cachedData.collections);
}

// Helper to keep albums in sync for backwards-compatibility
function syncCollectionToAlbum(col: Collection) {
  const albIndex = cachedData.albums.findIndex(a => a.id === `alb-${col.id}` || a.collection_id === col.id);
  const syncedAlbum: Album = {
    id: `alb-${col.id}`,
    collection_id: col.id,
    name: col.name,
    code: col.slug.toUpperCase().slice(0, 8),
    description: col.description,
    cover_image: col.cover_image,
    display_order: col.display_order,
    status: col.status,
    is_featured: Boolean(col.is_featured),
    created_at: col.created_at,
    updated_at: new Date().toISOString(),
    photos: col.sarees.map((s, idx) => ({
      id: s.id,
      url: s.image_url,
      is_cover: Boolean(s.is_cover),
      order: s.order || idx + 1,
      caption: s.name,
      details: {
        saree_name: s.name,
        code: s.code,
        price: s.price,
        description: s.description,
        color: s.color,
        fabric: s.fabric,
        availability: s.availability,
      },
    })),
  };

  if (albIndex >= 0) {
    cachedData.albums[albIndex] = syncedAlbum;
  } else {
    cachedData.albums.push(syncedAlbum);
  }
  setToStorage(STORAGE_KEYS.ALBUMS, cachedData.albums);
}

// ==========================================
// 6. PHOTO ALBUMS (Compatibility Layer)
// ==========================================
export async function getAlbums(options?: {
  collectionId?: string;
  onlyActive?: boolean;
  featuredOnly?: boolean;
}): Promise<Album[]> {
  initLocalStore();
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
}

export async function deleteAlbum(id: string): Promise<void> {
  initLocalStore();
  cachedData.albums = cachedData.albums.filter(a => a.id !== id);
  setToStorage(STORAGE_KEYS.ALBUMS, cachedData.albums);
}

// Safety check for deleting collection
export function checkDeleteSafety(collectionId: string): { canDelete: boolean; message?: string } {
  initLocalStore();
  const col = cachedData.collections.find(c => c.id === collectionId);
  if (!col) return { canDelete: true };
  if (col.sarees && col.sarees.length > 0) {
    return {
      canDelete: true,
      message: `This collection contains ${col.sarees.length} saree items. Deleting it will also remove these items from the collection.`
    };
  }
  return { canDelete: true };
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
      console.error('Supabase submit enquiry failed:', e);
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

export async function updateEnquiryStatus(id: string, status: Enquiry['status']): Promise<void> {
  initLocalStore();
  const index = cachedData.enquiries.findIndex(e => e.id === id);
  if (index >= 0) {
    cachedData.enquiries[index].status = status;
    setToStorage(STORAGE_KEYS.ENQUIRIES, cachedData.enquiries);
  }

  const client = getSupabaseClient();
  if (client && isSupabaseConfigured()) {
    try {
      await client.from('enquiries').update({ status }).eq('id', id);
    } catch (e) {
      console.error('Supabase update enquiry status failed:', e);
    }
  }
}

// ==========================================
// 8. ADMIN METRICS
// ==========================================
export async function getAdminMetrics(): Promise<AdminMetrics> {
  initLocalStore();
  const totalCollections = cachedData.collections.length;
  let totalSarees = 0;
  cachedData.collections.forEach(c => {
    totalSarees += c.sarees?.length || 0;
  });

  const totalAlbums = cachedData.albums.length;
  let totalPhotos = 0;
  let activeAlbums = 0;
  let featuredAlbums = 0;

  cachedData.albums.forEach(alb => {
    totalPhotos += alb.photos?.length || 0;
    if (alb.status === 'active') activeAlbums++;
    if (alb.is_featured) featuredAlbums++;
  });

  const totalEnquiries = cachedData.enquiries.length;

  return {
    totalCollections,
    totalAlbums,
    totalPhotos,
    totalSarees,
    activeAlbums,
    featuredAlbums,
    totalEnquiries,
  };
}

// ==========================================
// 9. RESET DATA TO DEFAULTS
// ==========================================
export async function resetDataToDefaults(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.HOMEPAGE);
    localStorage.removeItem(STORAGE_KEYS.ABOUT);
    localStorage.removeItem(STORAGE_KEYS.STEPS);
    localStorage.removeItem(STORAGE_KEYS.COLLECTIONS);
    localStorage.removeItem(STORAGE_KEYS.ALBUMS);
    localStorage.removeItem(STORAGE_KEYS.ENQUIRIES);
  }
  cachedData.settings = initialShopSettings;
  cachedData.homepage = initialHomepageContent;
  cachedData.about = initialAboutContent;
  cachedData.steps = initialProcessSteps;
  cachedData.collections = initialCollections;
  cachedData.albums = initialAlbums;
  cachedData.enquiries = [];
  cachedData.initialized = true;
  notifyDataChanged();
}

