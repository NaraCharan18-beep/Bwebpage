import { 
  ShopSettings, 
  HomepageContent, 
  AboutContent, 
  ProcessStep, 
  Collection, 
  Album,
  SareeItem
} from './types';

export const initialShopSettings: ShopSettings = {
  id: 'primary',
  shop_name: 'SRI LAXMI NARSHIMA SARES HOUSE',
  tagline: 'Master Weavers of Bhoodan Pochampally • Authentic Pure Silk & Double Ikat Handlooms',
  logo_url: '',
  description: 'Direct master weavers and manufacturers of authentic Pochampally Double Ikat pure silk sarees, handloom cotton sarees, sico weaves, and bridal collections. Located in the Silk City of Bhoodan Pochampally, Telangana.',
  about_shop: 'Founded with a deep devotion to preserving Telangana’s ancestral weaving heritage, SRI LAXMI NARSHIMA SARES HOUSE brings you authentic Pochampally Ikat sarees directly from skilled artisan pit looms to your wardrobe with zero middlemen.',
  address: 'H.No 4-82, Main Bazar Road, Near Gandhi Statue, Bhoodan Pochampally, Yadadri Bhuvanagiri District, Telangana - 508284',
  phone: '+91 80742 57579',
  whatsapp: '918074257579',
  whatsapp_group_url: 'https://chat.whatsapp.com/J9afqXLrDfR7fhsHYffP9r',
  website_url: 'https://bwebpage-szwt.vercel.app',
  email: 'contact@srilaxminarshimasarees.com',
  opening_hours: 'Monday – Sunday: 9:30 AM to 8:30 PM (Open all 7 days)',
  google_maps_url: 'https://maps.google.com/?q=Bhoodan+Pochampally+Telangana',
  google_maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30472.43574996964!2d78.8037346!3d17.3468512!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcba0f8d9fa744f%3A0x6b77ea8269aa5673!2sBhoodan%20Pochampally%2C%20Telangana%20508284!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  instagram_url: 'https://instagram.com/srilaxminarshimasarees',
  facebook_url: 'https://facebook.com/srilaxminarshimasarees',
  youtube_url: 'https://youtube.com/@srilaxminarshimasarees',
  admin_pin: '7579',
  updated_at: new Date().toISOString(),
};

export const initialHomepageContent: HomepageContent = {
  id: 'primary',
  hero_title: 'Where Tradition Meets Timeless Elegance',
  hero_subtitle: 'Authentic Pochampally Silk & Handloom Collections',
  hero_description: 'Handcrafted directly by master weavers in Bhoodan Pochampally, Telangana. Browse our collections by category, view saree photos, and enquire directly on WhatsApp.',
  hero_image_url: '/images/hero_saree_model.jpg',
  hero_images: ['/images/hero_saree_model.jpg'],
  hero_badge: 'GI Tag Protected Heritage • 100% Pure Silk Mark Certified',
  explore_btn_text: 'Explore Sarees',
  contact_btn_text: 'Contact Showroom',
  updated_at: new Date().toISOString(),
};

export const initialAboutContent: AboutContent = {
  id: 'primary',
  title: 'The Royal Legacy of Pochampally Silk',
  subtitle: 'The Silk City of India & The Art of Pagdu Bandhu',
  description: 'Nestled in Yadadri Bhuvanagiri district of Telangana, Bhoodan Pochampally is world-renowned as the Silk City of India. The century-old craft of Pochampally Ikat is globally celebrated for its mathematical complexity and vibrant colors.',
  history_text: 'Pochampally Ikat received India’s prestigious Geographical Indication (GI) protection in 2005. Each saree is an heirloom created through generations of familial knowledge passed down through master weavers.',
  ikat_explanation: 'Known locally as "Pagdu Bandhu", Ikat is a resist-dyeing technique where silk yarns are tied in complex geometric arrangements and dyed with millimeter precision before being placed on the loom.',
  craftsmanship_text: 'A single authentic Pochampally Double Ikat silk saree requires up to 35 to 45 days of patient labor by a dedicated master weaver and their family on traditional wooden pit looms.',
  image_url: '',
  years_of_heritage: 120,
  weavers_supported: 85,
  highlights: [
    'GI Tag Protected Heritage (Registration #4)',
    '100% Pure Mulberry Silk & Silk Mark Certified',
    'Authentic Pagdu Bandhu Ikat geometric resist-dyeing',
    'Handcrafted by Master Weavers in Bhoodan Pochampally'
  ],
  updated_at: new Date().toISOString(),
};

export const initialProcessSteps: ProcessStep[] = [
  {
    id: 'step-1',
    step_number: 1,
    title: 'Pure Mulberry Silk Preparation',
    description: 'Raw silk skeins are carefully selected, boiled in mild soap solution to remove natural gum (sericin), and wound onto spindles.',
    image_url: '',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'step-2',
    step_number: 2,
    title: 'Mathematical Graph Plotting',
    description: 'Master designers plot traditional geometric Chowka, diamond, and chevron patterns onto fine graph sheets. Every millimeter corresponds to individual warp and weft silk threads.',
    image_url: '',
    display_order: 2,
    is_active: true,
  },
  {
    id: 'step-3',
    step_number: 3,
    title: 'Asu Winding & Warping',
    description: 'Using the traditional Asu frame, silk yarns are wound in groups of exact counts corresponding to the saree length and width.',
    image_url: '',
    display_order: 3,
    is_active: true,
  },
  {
    id: 'step-4',
    step_number: 4,
    title: 'Tying (Pagdu Bandhu)',
    description: 'Skilled artisans tie rubber and cotton strips tightly around marked points on the silk yarns to resist dye penetration according to the graph calculation.',
    image_url: '',
    display_order: 4,
    is_active: true,
  },
  {
    id: 'step-5',
    step_number: 5,
    title: 'Multi-Dip Precision Dyeing',
    description: 'The tied bundles are submerged in boiling dye baths. Yarns are untied, shifted, retied, and redyed multiple times to achieve intricate multi-color palettes.',
    image_url: '',
    display_order: 5,
    is_active: true,
  },
  {
    id: 'step-6',
    step_number: 6,
    title: 'Loom Setup & Weft Alignment',
    description: 'The dyed warp threads are meticulously drawn through heddles and reeds on the pit loom, aligning the microscopic colored segments to reveal the intended motif.',
    image_url: '',
    display_order: 6,
    is_active: true,
  },
  {
    id: 'step-7',
    step_number: 7,
    title: 'Pit Loom Weaving with Pure Zari',
    description: 'The master weaver operates foot treadles and hand shuttles in rhythm, interlacing warp and weft to produce the finished Double Ikat masterpiece with pure gold zari borders.',
    image_url: '',
    display_order: 7,
    is_active: true,
  },
];

import catalogCollections from './catalog-data.json';

// Unified Collections (Direct from Owner's PDF Catalogues)
export const initialCollections: Collection[] = catalogCollections as Collection[];

// Backward-compatible initialAlbums mapping for any remaining references
export const initialAlbums: Album[] = initialCollections.map((col, idx) => ({
  id: `alb-${col.id}`,
  collection_id: col.id,
  name: col.name,
  code: `ALB-${idx + 1}`,
  description: col.description,
  cover_image: col.cover_image,
  display_order: col.display_order,
  status: col.status,
  is_featured: Boolean(col.is_featured),
  created_at: col.created_at,
  updated_at: col.created_at,
  photos: col.sarees.map((s, pIdx) => ({
    id: s.id,
    url: s.image_url,
    is_cover: Boolean(s.is_cover),
    order: s.order || pIdx + 1,
    caption: s.name,
    details: {
      saree_name: s.name,
      code: s.code,
      color: s.color,
      fabric: s.fabric,
      availability: s.availability,
      description: s.description,
      price: s.price,
    },
  })),
}));
