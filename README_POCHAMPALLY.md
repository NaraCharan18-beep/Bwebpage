# Sri Charan Pochampally Silk Handlooms
### Complete Admin-Controlled Pochampally Silk Saree Business Platform

A premium, elegant, mobile-first website for an authentic **Pochampally Silk & Double Ikat Saree** business based in Bhoodan Pochampally, Telangana.

---

## 🌟 Two Completely Separate Experiences

### 1. Customer Website (`/`)
Designed specifically for customers scanning a QR code on the shop's visiting card from their smartphones:
- **Hero Showcase**: Authentic high-resolution saree visuals, tagline *"Where Tradition Meets Timeless Elegance"*, and trust badges (Silk Mark, GI Registered, 0% Middlemen).
- **Dynamic Saree Catalog**: Real-time filtering by flexible Shop Sections (Pochampally Silk, Ikat, Bridal, Festive, Cotton), sub-collections, color, fabric, and availability.
- **Saree Details Modal**: Multi-photo gallery, detailed specifications (Fabric, Weaving technique, Zari border, Pallu details, Blouse inclusion), and one-click **"Enquire on WhatsApp"** with prefilled saree name and SKU code.
- **Craft Storytelling ("How Our Sarees Are Made")**: 7-step interactive timeline explaining mathematical graph plotting, silk yarn reeling, Ikat tie & dye (*Pagdu Bandhu*), pit-loom weaving, and inspection.
- **The Heritage & GI Tag History**: Explains the significance of Bhoodan Pochampally (The Silk City of India), GI registration #4, and ancestral handloom culture.
- **Physical Store Discovery**: Full address, timings, clickable phone numbers, interactive Google Maps embed, and **"Visiting QR"** modal to share the showroom.

### 2. Admin Dashboard (`/admin`)
Private, secure showroom management interface built for non-technical shop owners:
- **Authentication**: Protected route with PIN login (**Default PIN: `7579`**).
- **Showroom Overview**: 8 real-time metric cards (Sections, Collections, Total Sarees, In-Stock, Sold Out, Featured, New Arrivals, Enquiries).
- **Saree & Inventory Management**:
  - Full CRUD operations with instant search & filter
  - **Multi-Photo Manager**: Upload photos from phone/computer, preview, select primary cover photo, and delete
  - **Duplicate Saree**: 1-click clone to quickly create color variations with unique SKUs
  - **Stock Status**: Quick toggle between *Available in Stock*, *Sold Out*, and *Made to Order*
- **Shop Sections Management**: Create unlimited custom categories (e.g. Pochampally Silk, Ikat, Wedding, Festive, Cotton) with cover images and display order.
- **Collections Management**: Organize curated lines within each section.
- **Weaving Story Steps**: Edit or reorder the 7 craft process steps.
- **Homepage Banner & Hero Management**: Edit hero headlines, narrative description, buttons, and hero photo without code.
- **About Pochampally Content**: Update GI tag history, Ikat explanation, and key highlight badges.
- **Store Information**: Manage shop name, phone number, WhatsApp number, physical address, timings, and Google Maps location.
- **Customer Enquiries**: View customer messages with one-click direct WhatsApp reply.
- **Live Preview Modal**: Test customer mobile view (375px) and desktop view directly inside the Admin interface.
- **Supabase Cloud Sync**: Configure Supabase credentials directly via Admin UI, export/import JSON backups, and reset to defaults.

---

## 🗄️ Database & Supabase Integration

The platform is designed with a **dual-mode resilient architecture**:
1. **Out-of-the-Box Mode**: Ships with pre-seeded authentic Pochampally Silk sarees, real high-resolution photographs, and complete shop sections persisted in browser storage. Every edit made in the Admin immediately updates the customer view!
2. **Supabase Cloud Database**:
   - Schema file: [`supabase_schema.sql`](file:///c:/Users/mailt/OneDrive/Desktop/Charan/supabase_schema.sql)
   - Tables: `shop_settings`, `homepage_content`, `about_content`, `process_steps`, `shop_sections`, `collections`, `sarees`, `enquiries`
   - Row Level Security (RLS) policies configured for secure public read access and authenticated admin write access.

### Connecting to Supabase in 2 Minutes:
1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in Supabase and run the SQL script in `supabase_schema.sql`.
3. Create a public Storage bucket named `saree-images`.
4. In the Admin Dashboard (`/admin`), click **"Supabase & Database"** in the sidebar, paste your **Project URL** and **Anon Key**, and click **Save & Connect**.

---

## 🚀 Running the Project

```bash
# Start local development server
npm run dev

# Open in browser:
# Customer Showroom: http://localhost:3000
# Admin Dashboard:   http://localhost:3000/admin (PIN: 7579)

# Build for production
npm run build
```

---

## 📱 Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom Indian handloom theme & Cormorant Garamond typography
- **Icons**: Lucide React
- **Backend / Database**: Supabase (PostgreSQL, Storage, RLS) + Resilient local fallback
