'use client';

import React from 'react';
import Image from 'next/image';
import { Award, CheckCircle2, Compass, Layers } from 'lucide-react';
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
          
          {/* Left Column: Visual Storytelling of the Loom */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-stone-100 aspect-[4/3] sm:aspect-[16/11]">
              <Image
                src={content.image_url || '/images/weaver_pit_loom.jpg'}
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
                  A master weaver rhythmically crafting double Ikat silk on a traditional pit loom
                </span>
              </div>
            </div>

            {/* Corner Badge */}
            <div className="absolute -bottom-5 -right-3 sm:-right-5 bg-[#800020] text-white p-4 rounded-xl shadow-lg border border-[#D4AF37] max-w-[210px] hidden sm:block">
              <Award className="w-6 h-6 text-[#D4AF37] mb-1" />
              <p className="text-xs font-semibold">GI Registration #4</p>
              <p className="text-[10px] text-[#F7E7B4]">Protected by Geographical Indications of Goods Act</p>
            </div>
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
