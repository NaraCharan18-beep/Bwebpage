'use client';

import React, { useState, useEffect } from 'react';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminSidebar, { AdminTab } from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import DashboardOverviewTab from '@/components/admin/DashboardOverviewTab';
import CollectionsManagerTab from '@/components/admin/CollectionsManagerTab';
import AlbumsManagerTab from '@/components/admin/AlbumsManagerTab';
import OptionalSareeDetailsTab from '@/components/admin/OptionalSareeDetailsTab';
import ProcessStepsTab from '@/components/admin/ProcessStepsTab';
import HomepageTab from '@/components/admin/HomepageTab';
import AboutTab from '@/components/admin/AboutTab';
import ShopInfoTab from '@/components/admin/ShopInfoTab';
import ContactInfoTab from '@/components/admin/ContactInfoTab';
import SettingsTab from '@/components/admin/SettingsTab';
import EnquiriesTab from '@/components/admin/EnquiriesTab';
import LivePreviewModal from '@/components/admin/LivePreviewModal';

import { 
  getShopSettings, 
  getHomepageContent, 
  getAboutContent, 
  getProcessSteps, 
  getCollections, 
  getAlbums, 
  getEnquiries, 
  getAdminMetrics,
  updateShopSettings,
  updateHomepageContent,
  updateAboutContent,
  saveProcessStep,
  deleteProcessStep,
  saveCollection,
  deleteCollection,
  saveAlbum,
  deleteAlbum
} from '@/lib/data-store';
import { 
  ShopSettings, 
  HomepageContent, 
  AboutContent, 
  ProcessStep, 
  Collection, 
  Album, 
  Enquiry, 
  AdminMetrics 
} from '@/lib/types';
import { 
  initialShopSettings, 
  initialHomepageContent, 
  initialAboutContent, 
  initialProcessSteps, 
  initialCollections, 
  initialAlbums 
} from '@/lib/seed-data';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [filterCollectionId, setFilterCollectionId] = useState<string | undefined>();

  // Data states
  const [settings, setSettings] = useState<ShopSettings>(initialShopSettings);
  const [homepage, setHomepage] = useState<HomepageContent>(initialHomepageContent);
  const [about, setAbout] = useState<AboutContent>(initialAboutContent);
  const [steps, setSteps] = useState<ProcessStep[]>(initialProcessSteps);
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalCollections: 0,
    totalAlbums: 0,
    totalPhotos: 0,
    totalSarees: 0,
    activeAlbums: 0,
    featuredAlbums: 0,
    totalEnquiries: 0,
  });

  // Check auth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('pochampally_admin_auth');
      if (auth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const loadAdminData = async () => {
    try {
      const [s, h, a, st, col, alb, enq, met] = await Promise.all([
        getShopSettings(),
        getHomepageContent(),
        getAboutContent(),
        getProcessSteps(),
        getCollections(),
        getAlbums(),
        getEnquiries(),
        getAdminMetrics(),
      ]);
      setSettings(s);
      setHomepage(h);
      setAbout(a);
      setSteps(st);
      setCollections(col);
      setAlbums(alb);
      setEnquiries(enq);
      setMetrics(met);
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pochampally_admin_auth');
      setIsAuthenticated(false);
    }
  };

  // Mutation Handlers
  const handleSaveSettings = async (newSettings: ShopSettings) => {
    await updateShopSettings(newSettings);
    setSettings(newSettings);
  };

  const handleSaveHomepage = async (newContent: HomepageContent) => {
    await updateHomepageContent(newContent);
    setHomepage(newContent);
  };

  const handleSaveAbout = async (newAbout: AboutContent) => {
    await updateAboutContent(newAbout);
    setAbout(newAbout);
  };

  const handleSaveStep = async (step: ProcessStep) => {
    await saveProcessStep(step);
    await loadAdminData();
  };

  const handleDeleteStep = async (stepId: string) => {
    await deleteProcessStep(stepId);
    await loadAdminData();
  };

  const handleSaveCollection = async (collection: Collection) => {
    await saveCollection(collection);
    await loadAdminData();
  };

  const handleDeleteCollection = async (colId: string) => {
    await deleteCollection(colId);
    await loadAdminData();
  };

  const handleSaveAlbum = async (album: Album) => {
    await saveAlbum(album);
    await loadAdminData();
  };

  const handleDeleteAlbum = async (albumId: string) => {
    await deleteAlbum(albumId);
    await loadAdminData();
  };

  if (!isAuthenticated) {
    return <AdminLogin settings={settings} onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Showroom Control Dashboard',
      subtitle: 'Overview of saree collections, photo albums, and customer enquiries',
    },
    shop: {
      title: 'Shop Information',
      subtitle: 'Storefront brand name, tagline, description, and Silk Mark certification',
    },
    homepage: {
      title: 'Homepage Hero & Banner',
      subtitle: 'Edit main headline, hero photograph, and explore buttons',
    },
    about: {
      title: 'About Pochampally Silk',
      subtitle: 'GI Tag registration history and Double Ikat Pagdu Bandhu craft narrative',
    },
    steps: {
      title: 'How Sarees Are Made',
      subtitle: '7-step authentic craft timeline from raw silk degumming to pit loom weaving',
    },
    collections: {
      title: 'Collections (Cloth Types)',
      subtitle: 'Create and organize cloth types (Cotton, Sico, Pure Silk, Silk Mix, etc.)',
    },
    albums: {
      title: 'Photo Albums',
      subtitle: 'Create albums, batch upload 20+ photographs, set covers, and reorder',
    },
    'saree-details': {
      title: 'Optional Saree Details',
      subtitle: 'Add optional individual saree pricing, codes, colors, or availability tags',
    },
    contact: {
      title: 'Contact Information',
      subtitle: 'Showroom phone numbers, WhatsApp, physical address, timings, and map',
    },
    settings: {
      title: 'Settings & Security',
      subtitle: 'Admin PIN password, visiting card QR code, database sync, and catalog reset',
    },
    enquiries: {
      title: 'Customer Enquiries',
      subtitle: 'Consultation requests from customers scanning visiting QR codes',
    },
  };

  const currentMeta = tabTitles[currentTab] || tabTitles.dashboard;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setFilterCollectionId(undefined);
        }}
        settings={settings}
        onLogout={handleLogout}
        collectionCount={collections.length}
        albumCount={albums.length}
        enquiryCount={enquiries.length}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenPreview={() => setIsPreviewOpen(true)}
          onQuickCreateAlbum={() => setCurrentTab('albums')}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardOverviewTab
              metrics={metrics}
              recentAlbums={albums}
              collections={collections}
              settings={settings}
              onNavigateTab={(tab: any) => setCurrentTab(tab)}
              onOpenCreateAlbum={() => setCurrentTab('albums')}
              onOpenCreateCollection={() => setCurrentTab('collections')}
              onOpenManageAlbum={(album) => {
                setFilterCollectionId(album.collection_id);
                setCurrentTab('albums');
              }}
            />
          )}

          {currentTab === 'shop' && (
            <ShopInfoTab
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}

          {currentTab === 'homepage' && (
            <HomepageTab
              homepage={homepage}
              onSaveHomepage={handleSaveHomepage}
            />
          )}

          {currentTab === 'about' && (
            <AboutTab
              about={about}
              onSaveAbout={handleSaveAbout}
            />
          )}

          {currentTab === 'steps' && (
            <ProcessStepsTab
              steps={steps}
              onSaveStep={handleSaveStep}
              onDeleteStep={handleDeleteStep}
            />
          )}

          {currentTab === 'collections' && (
            <CollectionsManagerTab
              collections={collections}
              albums={albums}
              onSaveCollection={handleSaveCollection}
              onDeleteCollection={handleDeleteCollection}
              onRefresh={loadAdminData}
              onNavigateToAlbums={(colId) => {
                setFilterCollectionId(colId);
                setCurrentTab('albums');
              }}
              onAddAlbumToCollection={(colId) => {
                setFilterCollectionId(colId);
                setCurrentTab('albums');
              }}
            />
          )}

          {currentTab === 'albums' && (
            <AlbumsManagerTab
              albums={albums}
              collections={collections}
              initialFilterCollectionId={filterCollectionId}
              settings={settings}
              onSaveAlbum={handleSaveAlbum}
              onDeleteAlbum={handleDeleteAlbum}
            />
          )}

          {currentTab === 'saree-details' && (
            <OptionalSareeDetailsTab
              albums={albums}
              collections={collections}
              onSaveAlbum={handleSaveAlbum}
            />
          )}

          {currentTab === 'contact' && (
            <ContactInfoTab
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsTab
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onDataReset={loadAdminData}
            />
          )}

          {currentTab === 'enquiries' && (
            <EnquiriesTab
              enquiries={enquiries}
              settings={settings}
            />
          )}
        </main>
      </div>

      {/* Live Preview Modal */}
      <LivePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
}
