'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  Images, 
  ArrowLeft, 
  Sparkles, 
  Eye, 
  MessageCircle, 
  Layers, 
  ChevronRight,
  Search,
  X
} from 'lucide-react';
import { Collection, Album, AlbumPhoto, ShopSettings } from '@/lib/types';
import AlbumLightboxModal from './AlbumLightboxModal';

interface CollectionAlbumBrowserProps {
  collections: Collection[];
  albums: Album[];
  settings: ShopSettings;
}

export default function CollectionAlbumBrowser({
  collections,
  albums,
  settings,
}: CollectionAlbumBrowserProps) {
  const activeCollections = collections.filter((c) => c.status === 'active');
  const activeAlbums = albums.filter((a) => a.status === 'active');

  // Currently selected collection tab (default: first collection or 'all')
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    activeCollections[0]?.id || 'all'
  );

  // Active opened album (if user drilled down to view photos)
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);

  // Lightbox Modal state
  const [lightboxAlbum, setLightboxAlbum] = useState<Album | null>(null);
  const [lightboxPhotoIndex, setLightboxPhotoIndex] = useState<number>(0);

  // Search query within albums
  const [searchQuery, setSearchQuery] = useState('');

  // Selected collection object
  const currentCollection = activeCollections.find((c) => c.id === selectedCollectionId);

  // Albums belonging to selected collection
  const displayedAlbums = useMemo(() => {
    let list = activeAlbums;
    if (selectedCollectionId !== 'all') {
      list = list.filter((a) => a.collection_id === selectedCollectionId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          (a.code && a.code.toLowerCase().includes(q))
      );
    }
    return list;
  }, [activeAlbums, selectedCollectionId, searchQuery]);

  const handleOpenAlbum = (album: Album) => {
    setActiveAlbum(album);
    // Smooth scroll into view
    const elem = document.getElementById('collections');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBackToAlbums = () => {
    setActiveAlbum(null);
  };

  const handleOpenPhotoInLightbox = (album: Album, photoIndex: number) => {
    setLightboxAlbum(album);
    setLightboxPhotoIndex(photoIndex);
  };

  return (
    <section id="collections" className="py-16 md:py-24 bg-[#FAF7F2] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* If inside an Album: Display Photo Gallery View */}
        {activeAlbum ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Back Button & Album Header */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DFD5] shadow-sm space-y-4">
              <button
                onClick={handleBackToAlbums}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#800020] hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All {currentCollection?.name || 'Saree'} Albums</span>
              </button>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-stone-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase font-bold tracking-widest text-[#A67C1E]">
                      {currentCollection?.name || 'Collection'}
                    </span>
                    {activeAlbum.code && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                        {activeAlbum.code}
                      </span>
                    )}
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
                    {activeAlbum.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mt-1">
                    {activeAlbum.description}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs text-stone-500 block">Contains</span>
                    <strong className="text-base text-[#800020]">
                      {activeAlbum.photos.length} Saree Photos
                    </strong>
                  </div>

                  <a
                    href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
                      `Hello ${settings.shop_name}, I am viewing the "${activeAlbum.name}" saree album on your website and would like assistance.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold shadow flex items-center gap-2 transition-transform hover:scale-105"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enquire on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Saree Photos Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {activeAlbum.photos.map((photo, idx) => {
                const details = photo.details;
                return (
                  <div
                    key={photo.id || idx}
                    onClick={() => handleOpenPhotoInLightbox(activeAlbum, idx)}
                    className="group bg-white rounded-2xl overflow-hidden border border-[#E7DFD5] hover:border-[#D4AF37] shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
                  >
                    {/* Photo Box */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100">
                      <Image
                        src={photo.url}
                        alt={details?.saree_name || photo.caption || `${activeAlbum.name} Photo ${idx + 1}`}
                        fill
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />

                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="p-2.5 rounded-full bg-white/90 text-[#800020] shadow">
                          <Eye className="w-5 h-5" />
                        </span>
                      </div>

                      {photo.is_cover && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#800020] text-white text-[9px] font-bold uppercase shadow">
                          Album Cover
                        </span>
                      )}

                      <span className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded font-mono">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Saree Caption */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-1">
                      <div>
                        <h4 className="font-serif text-sm font-bold text-stone-900 group-hover:text-[#800020] transition-colors truncate">
                          {details?.saree_name || photo.caption || `Pochampally Saree #${idx + 1}`}
                        </h4>
                        {details?.color && (
                          <span className="text-[11px] text-stone-500 block truncate">
                            {details.color}
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-stone-500 flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-[#800020]" />
                          <span>Tap to View</span>
                        </span>

                        <span className="text-[11px] text-[#A67C1E] font-semibold group-hover:underline">
                          View Saree →
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Normal View: Collections Tabs -> Album Cards */
          <div className="space-y-10">
            
            {/* Section Heading */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs uppercase tracking-widest text-[#A67C1E] font-bold block">
                Pochampally Handloom Showroom
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1C1917]">
                Explore Our Saree Collections
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#800020] to-transparent mx-auto"></div>
              <p className="text-sm sm:text-base text-[#57534E]">
                Select a collection type below to browse our photo albums. Tap any album to view high-resolution photographs and enquire on WhatsApp.
              </p>
            </div>

            {/* Collection Cloth Type Navigation Tabs */}
            <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-2.5 pb-2 scrollbar-none snap-x">
              <button
                onClick={() => setSelectedCollectionId('all')}
                className={`snap-start shrink-0 px-6 py-3 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  selectedCollectionId === 'all'
                    ? 'bg-[#800020] text-[#FAF7F2] shadow-md border border-[#D4AF37]/50'
                    : 'bg-white text-stone-700 border border-[#E7DFD5] hover:border-[#800020]'
                }`}
              >
                All Collections ({activeAlbums.length} Albums)
              </button>

              {activeCollections.map((col) => {
                const count = activeAlbums.filter((a) => a.collection_id === col.id).length;
                const isSelected = selectedCollectionId === col.id;

                return (
                  <button
                    key={col.id}
                    onClick={() => setSelectedCollectionId(col.id)}
                    className={`snap-start shrink-0 px-6 py-3 rounded-full text-xs font-semibold tracking-wide transition-all ${
                      isSelected
                        ? 'bg-[#800020] text-[#FAF7F2] shadow-md border border-[#D4AF37]/50'
                        : 'bg-white text-stone-700 border border-[#E7DFD5] hover:border-[#800020]'
                    }`}
                  >
                    <span>{col.name}</span>
                    <span className="ml-1.5 opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Collection Description Callout if single collection selected */}
            {currentCollection && selectedCollectionId !== 'all' && (
              <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-5 border border-[#E7DFD5] max-w-3xl mx-auto text-center space-y-1">
                <span className="text-xs uppercase font-bold text-[#A67C1E] tracking-wider">
                  About {currentCollection.name}
                </span>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-serif">
                  {currentCollection.description || 'Authentic handcrafted Pochampally handlooms.'}
                </p>
              </div>
            )}

            {/* Search Input for Albums */}
            <div className="max-w-md mx-auto relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search albums by name or keyword..."
                className="w-full pl-10 pr-9 py-2.5 rounded-full bg-white border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020] shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Albums Cards Grid */}
            {displayedAlbums.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {displayedAlbums.map((album) => {
                  const parentCol = activeCollections.find((c) => c.id === album.collection_id);

                  return (
                    <div
                      key={album.id}
                      onClick={() => handleOpenAlbum(album)}
                      className="group bg-white rounded-3xl overflow-hidden border border-[#E7DFD5] hover:border-[#D4AF37] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
                    >
                      {/* Album Cover Image Frame */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF7F2]">
                        <Image
                          src={album.cover_image || '/images/hero_saree.jpg'}
                          alt={album.name}
                          fill
                          className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold">
                            {parentCol?.name || 'Collection'}
                          </span>

                          <span className="px-3 py-1 rounded-full bg-[#800020] text-white text-[11px] font-bold shadow-md flex items-center gap-1.5">
                            <Images className="w-3.5 h-3.5" />
                            <span>{album.photos.length} Saree Photos</span>
                          </span>
                        </div>

                        {/* Gradient Bottom Shadow */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

                        {/* Title over cover on mobile */}
                        <div className="absolute bottom-3 left-4 right-4 text-white">
                          <h3 className="font-serif text-xl font-bold truncate">
                            {album.name}
                          </h3>
                        </div>
                      </div>

                      {/* Album Info */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {album.description}
                        </p>

                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-[#800020] flex items-center gap-1.5">
                            <Images className="w-3.5 h-3.5 text-[#A67C1E]" />
                            <span>{album.photos.length} Saree Photos</span>
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAlbum(album);
                            }}
                            className="px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1 group-hover:translate-x-0.5"
                          >
                            <span>View Collection</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E7DFD5] max-w-md mx-auto space-y-3">
                <Images className="w-10 h-10 text-stone-400 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-stone-800">
                  No Albums Found
                </h3>
                <p className="text-xs text-stone-500">
                  No photo albums in this collection yet. Check back soon or select another collection above.
                </p>
                <button
                  onClick={() => {
                    setSelectedCollectionId('all');
                    setSearchQuery('');
                  }}
                  className="px-5 py-2 rounded-full bg-[#800020] text-white text-xs font-semibold"
                >
                  View All Collections
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Lightbox Photo Viewer Modal */}
      <AlbumLightboxModal
        album={lightboxAlbum}
        initialPhotoIndex={lightboxPhotoIndex}
        settings={settings}
        onClose={() => setLightboxAlbum(null)}
      />
    </section>
  );
}
