'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/customer/Navbar';
import HeroSection from '@/components/customer/HeroSection';
import AboutSection from '@/components/customer/AboutSection';
import ProcessStorySection from '@/components/customer/ProcessStorySection';
import CollectionAlbumBrowser from '@/components/customer/CollectionAlbumBrowser';
import StoreInfoSection from '@/components/customer/StoreInfoSection';
import ContactSection from '@/components/customer/ContactSection';
import Footer from '@/components/customer/Footer';
import QrCodeModal from '@/components/customer/QrCodeModal';
import { 
  getShopSettings, 
  getHomepageContent, 
  getAboutContent, 
  getProcessSteps, 
  getCollections, 
  getAlbums 
} from '@/lib/data-store';
import { 
  ShopSettings, 
  HomepageContent, 
  AboutContent, 
  ProcessStep, 
  Collection, 
  Album 
} from '@/lib/types';
import { 
  initialShopSettings, 
  initialHomepageContent, 
  initialAboutContent, 
  initialProcessSteps, 
  initialCollections, 
  initialAlbums 
} from '@/lib/seed-data';
import { MessageCircle, QrCode } from 'lucide-react';

export default function CustomerHomePage() {
  const [settings, setSettings] = useState<ShopSettings>(initialShopSettings);
  const [homepage, setHomepage] = useState<HomepageContent>(initialHomepageContent);
  const [about, setAbout] = useState<AboutContent>(initialAboutContent);
  const [steps, setSteps] = useState<ProcessStep[]>(initialProcessSteps);
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [s, h, a, st, col, alb] = await Promise.all([
        getShopSettings(),
        getHomepageContent(),
        getAboutContent(),
        getProcessSteps(),
        getCollections(true),
        getAlbums({ onlyActive: true }),
      ]);
      setSettings(s);
      setHomepage(h);
      setAbout(a);
      setSteps(st);
      setCollections(col);
      setAlbums(alb);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to data update events dispatched from Admin or storage changes
    const handleDataChange = () => {
      loadData();
    };

    window.addEventListener('pochampally-data-updated', handleDataChange);
    window.addEventListener('storage', handleDataChange);

    return () => {
      window.removeEventListener('pochampally-data-updated', handleDataChange);
      window.removeEventListener('storage', handleDataChange);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917] selection:bg-[#800020] selection:text-white">
      {/* Customer Header Navbar */}
      <Navbar settings={settings} onOpenQr={() => setIsQrModalOpen(true)} />

      {/* Main Page Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection content={homepage} settings={settings} />

        {/* Collection & Photo Albums Browser (Cotton, Sico, Pure Silk, etc.) */}
        <CollectionAlbumBrowser
          collections={collections}
          albums={albums}
          settings={settings}
        />

        {/* Heritage & GI Indication Information */}
        <AboutSection content={about} />

        {/* Storytelling: How Our Sarees Are Made */}
        <ProcessStorySection steps={steps} />

        {/* Physical Showroom & Google Maps Location */}
        <StoreInfoSection settings={settings} />

        {/* Customer Consultation & Contact Form */}
        <ContactSection settings={settings} />
      </main>

      {/* Footer */}
      <Footer settings={settings} sections={collections as any} />

      {/* Visiting Card QR Code Modal */}
      <QrCodeModal
        settings={settings}
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* Floating WhatsApp Action Pill for Mobile Experience */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
        <button
          onClick={() => setIsQrModalOpen(true)}
          className="w-11 h-11 rounded-full bg-white text-[#800020] shadow-lg border border-[#D4AF37] flex items-center justify-center hover:scale-105 transition-transform"
          title="Show Showroom QR Code"
        >
          <QrCode className="w-5 h-5 text-[#800020]" />
        </button>

        <a
          href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
            `Hello ${settings.shop_name}, I am visiting your website and would like assistance viewing your Pochampally saree collections.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-3 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs shadow-xl flex items-center gap-2 hover:scale-105 transition-all group"
          title="Chat with Weaving Team"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">WhatsApp Showroom</span>
        </a>
      </div>
    </div>
  );
}
