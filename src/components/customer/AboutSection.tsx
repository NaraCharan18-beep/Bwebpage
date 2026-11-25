'use client';

import React from 'react';
import Image from 'next/image';
import { Award, CheckCircle2, Layers, Sparkles, ShieldCheck, Landmark } from 'lucide-react';
import { AboutContent } from '@/lib/types';

interface AboutSectionProps {
  content: AboutContent;
}

export default function AboutSection({ content }: AboutSectionProps) {
  return (
    <section id="about" className="py-16 md:py-24 bg-[#FAF7F2] border-b border-[#E7DFD5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="text-xs uppercase tracking-widest text-[#A67C1E] font-bold block mb-2">
            Centuries of Handloom Legacy
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1C1917] mb-4">
            {content.title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#800020] to-transparent mx-auto mb-4"></div>
          <p className="text-base sm:text-lg text-[#800020] font-serif font-medium">
            {content.subtitle}
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Visual Heritage Showcase (No sample images) */}
          <div className="lg:col-span-6 relative">
            {content.image_url ? (
              <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-stone-100 aspect-[4/3] sm:aspect-[16/11]">
                <Image
                  src={content.image_url}
                  alt="Master weaver of Pochampally"
                  fill
                  className="object-cover object-center hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white p-2">
                  <span className="text-xs uppercase tracking-widest text-[#F7E7B4] font-medium block">
                    Bhoodan Pochampally, Telangana
                  </span>
                  <span className="text-sm font-serif font-semibold">
                    Traditional double Ikat handloom weaving
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#D4AF37]/40 bg-gradient-to-br from-[#800020] via-[#5C0017] to-[#3B000F] p-8 sm:p-10 text-white select-none">
                {/* Decorative Background Accents */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/30 rounded-full blur-xl pointer-events-none"></div>

                <div className="relative z-10 space-y-6">
                  {/* Crest Header */}
                  <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                      <span className="font-serif text-xs uppercase tracking-widest text-[#F7E7B4] font-bold">
                        Authentic Handloom Heritage
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37]">
                      <Award className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Main GI Title Card */}
                  <div className="space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#F7E7B4] text-xs font-semibold tracking-wider uppercase border border-[#D4AF37]/30">
                      GI Tag Registration #4
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-snug">
                      Bhoodan Pochampally: The Silk City of India
                    </h3>
                    <p className="text-xs sm:text-sm text-[#F7E7B4]/90 font-light leading-relaxed">
                      Globally recognized for mathematical precision in Double Ikat resist-dyeing, preserved across generations of master artisan weaver families.
                    </p>
                  </div>

                  {/* Prestige Pillars */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/15">
                      <ShieldCheck className="w-5 h-5 text-[#D4AF37] mb-1.5" />
                      <h4 className="font-serif text-sm font-bold text-white">Silk Mark Certified</h4>
                      <p className="text-[11px] text-white/80">100% Pure Natural Mulberry Silk Guaranteed</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/15">
                      <Landmark className="w-5 h-5 text-[#D4AF37] mb-1.5" />
                      <h4 className="font-serif text-sm font-bold text-white">120+ Years Legacy</h4>
                      <p className="text-[11px] text-white/80">Traditional Pit Looms with Zero Middlemen</p>
                    </div>
                  </div>

                  {/* Footer Seal */}
                  <div className="pt-2 border-t border-[#D4AF37]/20 text-center">
                    <p className="text-[11px] uppercase tracking-wider text-[#F7E7B4] font-serif">
                      Sri Laxmi Narshima Sares House • Bhoodan Pochampally
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Detailed Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <div className="prose text-[#44403C] space-y-4 text-sm sm:text-base leading-relaxed">
              <p className="font-medium text-[#1C1917] text-base sm:text-lg border-l-4 border-[#800020] pl-4 italic">
                {content.description}
              </p>
              <p>
                {content.history_text}
              </p>
              <div className="bg-[#F3ECE2]/70 p-4 rounded-xl border border-[#E7DFD5]">
                <h4 className="font-serif font-bold text-sm text-[#800020] uppercase tracking-wide mb-1 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#D4AF37]" />
                  The Magic of "Pagdu Bandhu" (Double Ikat)
                </h4>
                <p className="text-xs sm:text-sm text-[#44403C]">
                  {content.ikat_explanation}
                </p>
              </div>
              <p className="text-xs sm:text-sm text-[#57534E]">
                {content.craftsmanship_text}
              </p>
            </div>

            {/* Highlights List */}
            {content.highlights && content.highlights.length > 0 && (
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {content.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-2 bg-white p-3 rounded-lg border border-[#E7DFD5] shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#800020] shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-[#2B2625]">{highlight}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
