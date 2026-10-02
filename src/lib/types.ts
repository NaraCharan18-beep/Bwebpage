// Types for Pochampally Silk Saree Platform
// Supports both Album-based Photo Galleries and Optional Detailed Sarees

export interface PhotoDetails {
  saree_name?: string;
  price?: number | null;
  code?: string;
  saree_code?: string;
  color?: string;
  fabric?: string;
  availability?: 'available' | 'sold' | 'sold_out' | 'in_stock' | 'made_to_order';
  description?: string;
}

export interface AlbumPhoto {
  id: string;
  url: string;
  caption?: string;
  is_cover: boolean;
  order: number;
  details?: PhotoDetails;
}

export interface Album {
  id: string;
  collection_id: string; // Foreign key to Collection (e.g. Cotton, Pure Silk, etc.)
  name: string;
  code?: string;
  description: string;
  cover_image: string;
  photos: AlbumPhoto[];
  display_order: number;
  status: 'active' | 'hidden';
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string; // e.g. "Cotton", "Sico", "Pure Silk", "Silk Mix", "Pochampally Ikat"
  slug: string;
  description: string;
  cover_image: string;
  display_order: number;
  status: 'active' | 'hidden';
  section_id?: string;
  is_featured?: boolean;
  created_at: string;
  updated_at?: string;
}

export type AvailabilityStatus = 'available' | 'sold' | 'out_of_stock' | 'made_to_order' | 'hidden';
export type PublicationStatus = 'draft' | 'published' | 'hidden';

export interface SareeImage {
  id: string;
  url: string;
  is_primary: boolean;
  order: number;
  alt?: string;
}

export interface Saree {
  id: string;
  sku: string;
  name: string;
  section_id: string;
  collection_id: string;
  description: string;
  price: number | null;
  show_price: boolean;
  fabric: string;
  color: string;
  border_color?: string;
  pallu_details?: string;
  pattern: string;
  weaving_type: string;
  occasion: string;
  blouse_included: boolean;
  silk_mark_certified: boolean;
  availability: AvailabilityStatus;
  status: PublicationStatus;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_active: boolean;
  images: SareeImage[];
  created_at: string;
  updated_at: string;
}

export interface ShopSection {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_image: string;
  display_order: number;
  status: 'active' | 'hidden';
  created_at: string;
}

export interface ProcessStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface ShopSettings {
  id: string;
  shop_name: string;
  tagline: string;
  logo_url: string;
  description: string;
  about_shop: string;
  address: string;
  phone: string;
  alternate_phone?: string;
  whatsapp: string;
  email: string;
  opening_hours: string;
  timings?: string;
  google_maps_url: string;
  google_maps_embed: string;
  instagram_url: string;
  facebook_url: string;
  youtube_url?: string;
  silk_mark_certified?: boolean;
  admin_pin?: string;
  updated_at: string;
}

export interface HomepageContent {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  hero_image_url: string;
  hero_badge: string;
  explore_btn_text: string;
  contact_btn_text: string;
  updated_at: string;
}

export interface AboutContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  history_text: string;
  ikat_explanation: string;
  craftsmanship_text: string;
  image_url: string;
  highlights: string[];
  years_of_heritage?: number;
  weavers_supported?: number;
  updated_at: string;
}

export interface Enquiry {
  id: string;
  customer_name: string;
  phone: string;
  album_name?: string;
  photo_code?: string;
  saree_name?: string;
  saree_sku?: string;
  message: string;
  created_at: string;
  status: 'new' | 'contacted' | 'resolved';
}

export interface AdminMetrics {
  totalCollections: number;
  totalAlbums: number;
  totalPhotos: number;
  activeAlbums: number;
  featuredAlbums: number;
  totalEnquiries: number;
}
