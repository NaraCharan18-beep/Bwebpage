'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  MessageCircle, 
  Share2, 
  Tag, 
  Check, 
  Phone,
  ShieldCheck,
  Eye,
  Sparkles
} from 'lucide-react';
import { Album, AlbumPhoto, ShopSettings } from '@/lib/types';

interface AlbumLightboxModalProps {
  album: Album | null;
  initialPhotoIndex?: number;
  settings: ShopSettings;
  onClose: () => void;
}

export default function AlbumLightboxModal({
  album,
  initialPhotoIndex = 0,
  settings,
  onClose,
}: AlbumLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialPhotoIndex);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialPhotoIndex);
  }, [initialPhotoIndex, album]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, album]);

  if (!album || !album.photos || album.photos.length === 0) return null;

  const currentPhoto = album.photos[currentIndex] || album.photos[0];
  const details = currentPhoto.details;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? album.photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === album.photos.length - 1 ? 0 : prev + 1));
  };

  const getWhatsAppUrl = () => {
    const sareeName = details?.saree_name || currentPhoto.caption || `Photo #${currentIndex + 1}`;
    const code = details?.code || album.code || '';
    const text = `Hello ${settings.shop_name}, I am interested in this saree from the "${album.name}" album${code ? ` (Code: ${code})` : ''}. Is this piece currently available at your showroom?`;
    return `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  const handleShare = async () => {
    const text = `Check out this Pochampally saree from ${settings.shop_name} (${album.name}):`;
    if (navigator.share) {
      try {
        await navigator.share({ title: album.name, text, url: window.location.href });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div className="fixed inset-0" onClick={onClose}></div>

      {/* Lightbox Container */}
      <div className="relative w-full max-w-5xl h-[95vh] bg-[#1C1917] rounded-3xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col z-10">
        
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-[#2A2524] border-b border-stone-800 flex items-center justify-between text-white z-20">
          <div className="overflow-hidden">
            <span className="text-[11px] text-[#D4AF37] font-semibold uppercase tracking-wider block">
              {album.name}
            </span>
            <span className="text-xs text-stone-300 font-medium">
              Photo {currentIndex + 1} of {album.photos.length}
              {details?.code && <span className="ml-2 font-mono text-[#D4AF37]">({details.code})</span>}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-stone-300 hover:text-white rounded-full hover:bg-stone-800 transition-colors flex items-center gap-1 text-xs"
              title="Share photo"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-300 hover:text-white rounded-full hover:bg-stone-800 transition-colors"
              aria-label="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area: Large Photo & Side Details */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* Main Photo Viewer Frame */}
          <div className="flex-1 relative bg-black flex items-center justify-center p-2 sm:p-4 overflow-hidden">
            <div className="relative w-full h-full max-h-[80vh] flex items-center justify-center">
              <Image
                src={currentPhoto.url}
                alt={details?.saree_name || currentPhoto.caption || album.name}
                fill
                priority
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 70vw"
              />
            </div>

            {/* Navigation Arrows */}
            {album.photos.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all shadow-lg"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all shadow-lg"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Saree Info Sidebar (Optional details or quick WhatsApp enquiry) */}
          <div className="w-full md:w-80 bg-[#FAF7F2] p-5 border-t md:border-t-0 md:border-l border-stone-200 flex flex-col justify-between overflow-y-auto max-h-[35vh] md:max-h-full">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#A67C1E] block mb-1">
                  {album.name}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#1C1917] leading-snug">
                  {details?.saree_name || currentPhoto.caption || `Pochampally Saree #${currentIndex + 1}`}
                </h3>
              </div>

              {/* Handcrafted Saree Badge */}
              <div className="p-3.5 bg-white rounded-xl border border-[#E7DFD5] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#800020]">
                  <Sparkles className="w-3.5 h-3.5 text-[#A67C1E]" />
                  <span>Authentic Handloom Saree</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Handcrafted by master weavers in Bhoodan Pochampally. Contact us on WhatsApp or call for showroom enquiry and availability.
                </p>
              </div>

              {/* Optional details pills */}
              {(details?.fabric || details?.color || details?.code) && (
                <div className="space-y-1.5 text-xs">
                  {details.code && (
                    <div className="flex justify-between py-1 border-b border-stone-200">
                      <span className="text-stone-500">Saree Code:</span>
                      <strong className="font-mono text-stone-800">{details.code}</strong>
                    </div>
                  )}
                  {details.fabric && (
                    <div className="flex justify-between py-1 border-b border-stone-200">
                      <span className="text-stone-500">Fabric:</span>
                      <strong className="text-stone-800">{details.fabric}</strong>
                    </div>
                  )}
                  {details.color && (
                    <div className="flex justify-between py-1 border-b border-stone-200">
                      <span className="text-stone-500">Color:</span>
                      <strong className="text-stone-800">{details.color}</strong>
                    </div>
                  )}
                </div>
              )}

              {details?.description && (
                <p className="text-xs text-stone-600 leading-relaxed italic">
                  &ldquo;{details.description}&rdquo;
                </p>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-4 space-y-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold shadow transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enquire on WhatsApp</span>
              </a>

              <a
                href={`tel:${settings.phone}`}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#800020] text-[#800020] text-xs font-semibold hover:bg-[#800020] hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Showroom</span>
              </a>
            </div>

          </div>

        </div>

        {/* Bottom Thumbnails Strip */}
        {album.photos.length > 1 && (
          <div className="bg-[#1C1917] p-2.5 border-t border-stone-800 flex items-center gap-2 overflow-x-auto scrollbar-none z-20">
            {album.photos.map((photo, idx) => (
              <button
                key={photo.id || idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-12 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  currentIndex === idx
                    ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 scale-105'
                    : 'border-stone-700 opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={photo.url}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover object-top"
                />
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
