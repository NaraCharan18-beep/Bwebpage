'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Search, 
  X, 
  ChevronRight, 
  Sparkles, 
  Images, 
  MessageCircle,
  Eye,
  FolderOpen
} from 'lucide-react';
import { Collection, SareeItem, ShopSettings } from '@/lib/types';
import SareeDetailModal from './SareeDetailModal';

interface CollectionAlbumBrowserProps {
  collections: Collection[];
  settings: ShopSettings;
}

export default function CollectionAlbumBrowser({
  collections,
  settings,
}: CollectionAlbumBrowserProps) {
  // Only show active collections
  const activeCollections = useMemo(
    () => collections.filter((c) => c.status === 'active'),
    [collections]
  );

  // Active opened collection (null = showing all collection cards)
  const [activeCollection, setActiveCollection] = useState<Collection | null>(null);

  // Search query (search across collection names or saree codes)
  const [searchQuery, setSearchQuery] = useState('');

  // Saree Detail Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSareeIndex, setSelectedSareeIndex] = useState(0);

  // Filtered collections based on search query
  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return activeCollections;
    const q = searchQuery.toLowerCase().trim();
    return activeCollections.filter(
      (col) =>
        col.name.toLowerCase().includes(q) ||
        col.description.toLowerCase().includes(q) ||
        col.sarees?.some(
          (s) =>
            s.code.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q) ||
            (s.color && s.color.toLowerCase().includes(q))
        )
    );
  }, [activeCollections, searchQuery]);

  // If a specific saree code was searched, find directly matching sarees across all collections
  const matchingSareesAcrossCollections = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    const matches: { saree: SareeItem; collection: Collection }[] = [];
    activeCollections.forEach((col) => {
      col.sarees?.forEach((s) => {
        if (
          s.code.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          (s.color && s.color.toLowerCase().includes(q))
        ) {
          matches.push({ saree: s, collection: col });
        }
      });
    });
    return matches;
  }, [activeCollections, searchQuery]);

  // Handle clicking a collection card
  const handleOpenCollection = (col: Collection) => {
    setActiveCollection(col);
    // Smooth scroll to top of collection section
    const elem = document.getElementById('collections');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Back to All Collections
  const handleBackToCollections = () => {
    setActiveCollection(null);
  };

  // Open Saree Modal
  const handleOpenSareeModal = (index: number) => {
    setSelectedSareeIndex(index);
    setIsModalOpen(true);
  };

  return (
    <section id="collections" className="py-14 sm:py-20 md:py-24 bg-[#FAF7F2] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ======================================================== */}
        {/* VIEW 2: INSIDE A SPECIFIC COLLECTION (Sarees Grid View) */}
        {/* ======================================================== */}
        {activeCollection ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Top Navigation Bar: Back Button & Collection Title */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-[#E7DFD5] shadow-xs">
              
              {/* Obvious Back Button (Requirement #15 & #17) */}
              <button
                onClick={handleBackToCollections}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#800020] hover:text-[#550015] transition-colors group mb-4 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#D4AF37]/50 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                  <ArrowLeft className="w-4 h-4 text-[#800020]" />
                </div>
                <span>Back to All Collections</span>
              </button>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-stone-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] uppercase tracking-widest text-[#A67C1E] font-bold">
                      Saree Collection
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#800020]/10 text-[#800020] font-bold font-mono">
                      {activeCollection.sarees?.length || 0} Sarees
                    </span>
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
                    {activeCollection.name}
                  </h2>
                  {activeCollection.description && (
                    <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mt-1.5 leading-relaxed font-light">
                      {activeCollection.description}
                    </p>
                  )}
                </div>

                {/* Direct WhatsApp Consultation for this Collection */}
                <a
                  href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
                    `Hello ${settings.shop_name}, I am browsing your "${activeCollection.name}" collection on your website and would like assistance.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-105 shrink-0"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enquire on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Sarees Grid (Requirement #6: adapt to mobile, tablet, desktop) */}
            {activeCollection.sarees && activeCollection.sarees.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {activeCollection.sarees.map((saree, idx) => (
                  <div
                    key={saree.id || idx}
                    onClick={() => handleOpenSareeModal(idx)}
                    className="group bg-white rounded-2xl overflow-hidden border border-[#E7DFD5] hover:border-[#D4AF37] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    {/* Saree Image Container */}
                    <div className="relative aspect-[3/4] w-full bg-stone-100 overflow-hidden">
                      <Image
                        src={saree.image_url}
                        alt={saree.name}
                        fill
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      
                      {/* Gradient depth on bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Saree Code Pill */}
                      <div className="absolute top-2.5 left-2.5">
                        <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur-xs shadow">
                          {saree.code || `S-${idx + 1}`}
                        </span>
                      </div>

                      {/* Hover Overlay Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="px-4 py-2 rounded-full bg-white/95 text-[#800020] text-xs font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-xs transform translate-y-2 group-hover:translate-y-0 transition-transform">
                          <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>View Details</span>
                        </span>
                      </div>
                    </div>

                    {/* Saree Card Info */}
                    <div className="p-3 sm:p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-sm sm:text-base font-bold text-[#1C1917] group-hover:text-[#800020] transition-colors line-clamp-1">
                          {saree.name}
                        </h3>
                        {saree.color && (
                          <p className="text-[11px] text-stone-500 truncate">
                            {saree.color}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                        {saree.show_price && saree.price ? (
                          <span className="font-serif text-sm sm:text-base font-bold text-[#800020]">
                            ₹{saree.price.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-[#800020]">
                            Enquire for Price
                          </span>
                        )}

                        <span className="text-[10px] sm:text-xs font-bold text-[#800020] flex items-center gap-0.5 group-hover:underline">
                          <span>Enquire</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#E7DFD5] p-8 space-y-3">
                <Images className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-stone-700">No Sarees in this Collection Yet</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  New sarees are being woven on the loom. Please check back shortly or enquire with us on WhatsApp.
                </p>
                <button
                  onClick={handleBackToCollections}
                  className="px-5 py-2.5 rounded-full bg-[#800020] text-white text-xs font-bold"
                >
                  View Other Collections
                </button>
              </div>
            )}

            {/* Bottom Back Button */}
            <div className="pt-4 text-center">
              <button
                onClick={handleBackToCollections}
                className="px-7 py-3 rounded-full bg-white hover:bg-stone-50 text-[#800020] border border-[#D4AF37] font-semibold text-xs shadow-xs transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Collections</span>
              </button>
            </div>
          </div>
        ) : (

          /* ======================================================== */
          /* VIEW 1: MAIN COLLECTION CARDS VIEW (Requirement #3, 5, 17)*/
          /* ======================================================== */
          <div className="space-y-10">
            
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#800020]/10 border border-[#800020]/20 text-[#800020] text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Handloom Catalog</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1C1917] tracking-tight">
                Our Collections
              </h2>
              <p className="text-sm sm:text-base text-stone-600 font-light leading-relaxed">
                Choose a collection to browse handwoven sarees directly from our artisan pit looms.
              </p>
            </div>

            {/* Simple Search Bar (Requirement #13) */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Pochampally, Silk, Cotton, Sico, or Saree Code (e.g. PSS-001)..."
                  className="w-full pl-12 pr-10 py-3.5 rounded-full bg-white border border-[#E7DFD5] shadow-xs text-xs sm:text-sm text-[#1C1917] focus:outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/10 placeholder:text-stone-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* If direct saree matches found via search */}
            {matchingSareesAcrossCollections.length > 0 && (
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/50 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#800020] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>Matching Sarees ({matchingSareesAcrossCollections.length})</span>
                  </h3>
                  <span className="text-xs text-stone-500">Click any saree to open</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {matchingSareesAcrossCollections.map(({ saree, collection }) => (
                    <div
                      key={saree.id}
                      onClick={() => {
                        setActiveCollection(collection);
                        const idx = collection.sarees.findIndex((s) => s.id === saree.id);
                        if (idx >= 0) {
                          handleOpenSareeModal(idx);
                        }
                      }}
                      className="group bg-[#FAF7F2] p-2.5 rounded-xl border border-stone-200 hover:border-[#800020] cursor-pointer transition-all"
                    >
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-2 bg-stone-200">
                        <Image
                          src={saree.image_url}
                          alt={saree.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="150px"
                        />
                      </div>
                      <span className="block font-mono text-[10px] font-bold text-[#800020]">
                        {saree.code}
                      </span>
                      <h4 className="font-serif text-xs font-bold text-stone-900 truncate">
                        {saree.name}
                      </h4>
                      <span className="block text-[10px] text-stone-500 truncate">
                        {collection.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Collection Cards Grid (Requirement #3 & #5: Display COLLECTION CARDS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredCollections.map((col) => {
                const count = col.sarees?.length || 0;

                return (
                  <div
                    key={col.id}
                    onClick={() => handleOpenCollection(col)}
                    className="group bg-white rounded-3xl overflow-hidden border border-[#E7DFD5] hover:border-[#D4AF37] shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    {/* One Attractive Cover Photo (Requirement #3 & #5) */}
                    <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
                      <Image
                        src={col.cover_image || '/images/hero_saree.jpg'}
                        alt={col.name}
                        fill
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />

                      {/* Subtle Vignette Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>

                      {/* Top Pill: Number of Sarees inside (Requirement #3) */}
                      <div className="absolute top-4 right-4 z-10">
                        <span className="px-3.5 py-1 rounded-full bg-[#800020] text-white text-xs font-bold shadow-md flex items-center gap-1.5 border border-[#D4AF37]/40">
                          <Images className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{count} Sarees</span>
                        </span>
                      </div>

                      {/* Floating Bottom Card Label inside image for rich aesthetics */}
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <span className="block text-[11px] uppercase tracking-widest text-[#F7E7B4] font-semibold mb-0.5">
                          Authentic Handloom
                        </span>
                        <h3 className="font-serif text-2xl sm:text-2xl font-bold leading-tight group-hover:text-[#F7E7B4] transition-colors">
                          {col.name}
                        </h3>
                      </div>
                    </div>

                    {/* Card Body & "View Collection" Button (Requirement #3) */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between bg-white">
                      <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed font-light">
                        {col.description || 'Exclusive handloom sarees handwoven by master weavers in Bhoodan Pochampally.'}
                      </p>

                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-xs text-stone-500 font-medium">
                          Tap to view all sarees
                        </span>

                        <div className="px-4 py-2 rounded-full bg-[#800020] group-hover:bg-[#660019] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm group-hover:translate-x-0.5 transition-all">
                          <span>View Collection</span>
                          <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredCollections.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#E7DFD5] p-8 space-y-3">
                <Search className="w-10 h-10 text-stone-300 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-stone-700">No matching collections found</h3>
                <p className="text-xs text-stone-500">
                  Try searching for &quot;Silk&quot;, &quot;Cotton&quot;, &quot;Sico&quot;, or clear your search query.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-5 py-2 rounded-full bg-[#800020] text-white text-xs font-bold"
                >
                  Show All Collections
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Saree Detail Modal (Requirement #7 & #8) */}
      {activeCollection && (
        <SareeDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          sarees={activeCollection.sarees || []}
          currentIndex={selectedSareeIndex}
          onIndexChange={(idx) => setSelectedSareeIndex(idx)}
          collectionName={activeCollection.name}
          settings={settings}
        />
      )}
    </section>
  );
}
