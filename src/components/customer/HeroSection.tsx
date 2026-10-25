'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { HomepageContent, ShopSettings } from '@/lib/types';

interface HeroSectionProps {
  content: HomepageContent;
  settings: ShopSettings;
}

export default function HeroSection({ content, settings }: HeroSectionProps) {
  const handleScrollToCollections = (e: React.MouseEvent) => {
    e.preventDefault();
    const elem = document.getElementById('collections');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF7F2] via-[#F6EFE6] to-[#FAF7F2] py-12 md:py-20 lg:py-24 border-b border-[#E7DFD5]">
      {/* Decorative Gold & Subtle Vignette */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#800020]/5 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Brand & Direct Call To Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* GI Tag & Authenticity Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#800020]/10 border border-[#800020]/20 text-[#800020] text-xs font-semibold tracking-wide shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{content.hero_badge || 'Direct Master Weavers of Bhoodan Pochampally'}</span>
            </div>

            {/* Shop Brand Name Sub-heading */}
            <p className="font-serif text-sm sm:text-base font-bold tracking-widest text-[#A67C1E] uppercase">
              {settings.shop_name}
            </p>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1C1917] leading-[1.18] tracking-tight">
              {content.hero_title || 'Where Tradition Meets Timeless Elegance'}
            </h1>

            {/* Subtitle / Tagline */}
            <p className="text-base sm:text-lg text-[#800020] font-serif font-semibold tracking-wide">
              {settings.tagline || 'Master Weavers of Bhoodan Pochampally • Authentic Pure Silk & Double Ikat'}
            </p>

            {/* Short Description */}
            <p className="text-sm sm:text-base text-[#57534E] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
              {content.hero_description || 'Direct handlooms from master artisans. Choose your collection, browse authentic saree photos, and enquire directly on WhatsApp.'}
            </p>

            {/* ONE Main Prominent Button: "Explore Sarees" */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="#collections"
                onClick={handleScrollToCollections}
                className="w-full sm:w-auto px-10 py-4 sm:py-4.5 bg-[#800020] hover:bg-[#660019] text-[#FAF7F2] font-serif font-bold text-base sm:text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 group border border-[#D4AF37]/50 hover:scale-[1.02]"
              >
                <span>Explore Sarees</span>
                <ArrowRight className="w-5 h-5 text-[#D4AF37] group-hover:translate-x-1.5 transition-transform" />
              </a>
            </div>

            {/* Handloom Trust Pillars */}
            <div className="pt-6 border-t border-[#E7DFD5] grid grid-cols-3 gap-4 text-left max-w-lg mx-auto lg:mx-0">
              <div className="space-y-0.5">
                <span className="block font-serif text-lg sm:text-xl font-bold text-[#800020]">100% Pure</span>
                <span className="block text-[11px] sm:text-xs text-[#57534E]">Mulberry Silk & Cotton</span>
              </div>
              <div className="space-y-0.5">
                <span className="block font-serif text-lg sm:text-xl font-bold text-[#800020]">GI Tagged</span>
                <span className="block text-[11px] sm:text-xs text-[#57534E]">Registered Heritage</span>
              </div>
              <div className="space-y-0.5">
                <span className="block font-serif text-lg sm:text-xl font-bold text-[#800020]">0% Middlemen</span>
                <span className="block text-[11px] sm:text-xs text-[#57534E]">Direct Weaver Handlooms</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Golden Border Offset Frame */}
              <div className="absolute inset-0 border-2 border-[#D4AF37] rounded-3xl translate-x-3 translate-y-3 -z-10 hidden sm:block"></div>

              {/* Main Saree Image Container */}
              <div className="relative aspect-[3/4] sm:aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-[#E7DFD5] border-4 border-white">
                <Image
                  src={content.hero_image_url || '/images/hero_saree.jpg'}
                  alt={content.hero_title || 'Authentic Pochampally Silk Saree'}
                  fill
                  priority
                  unoptimized
                  className="object-cover object-top hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 45vw"
                />

                {/* Gradient Overlay for subtle depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                {/* Floating Authentic Handloom Seal */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-[#D4AF37]/50 shadow-lg flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-[#A67C1E] font-bold">
                      Bhoodan Pochampally
                    </span>
                    <span className="block text-xs sm:text-sm font-serif font-bold text-[#1C1917]">
                      Silk Mark Certified Handlooms
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#800020] text-[#D4AF37] flex items-center justify-center shadow">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
