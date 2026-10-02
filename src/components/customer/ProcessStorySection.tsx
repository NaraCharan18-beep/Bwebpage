'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronRight, Sparkles, Check, Play } from 'lucide-react';
import { ProcessStep } from '@/lib/types';

interface ProcessStorySectionProps {
  steps: ProcessStep[];
}

export default function ProcessStorySection({ steps }: ProcessStorySectionProps) {
  const activeSteps = steps
    .filter((s) => s.is_active)
    .sort((a, b) => a.display_order - b.display_order);

  const [selectedStepIndex, setSelectedStepIndex] = useState(0);

  if (activeSteps.length === 0) return null;

  const currentStep = activeSteps[selectedStepIndex] || activeSteps[0];

  return (
    <section id="process" className="py-16 md:py-24 bg-[#F4ECE1]/60 border-b border-[#E7DFD5] relative overflow-hidden">
      {/* Background Motifs */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <span className="text-xs uppercase tracking-widest text-[#A67C1E] font-bold block mb-2">
            The Soul Behind The Silk
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1C1917] mb-3">
            How Our Sarees Are Made
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#800020] to-transparent mx-auto mb-3"></div>
          <p className="text-sm sm:text-base text-[#57534E]">
            A step-by-step journey of 45 days of ancestral mathematical precision, tie-dye mastery, and pit-loom weaving.
          </p>
        </div>

        {/* Desktop Horizontal Step Navigation Tabs */}
        <div className="hidden lg:block mb-10">
          <div className="relative">
            {/* Connecting Track Line */}
            <div className="absolute top-6 left-8 right-8 h-1 bg-[#D6C7B2] -z-0"></div>

            <div className="flex justify-between items-start relative z-10">
              {activeSteps.map((step, idx) => {
                const isSelected = idx === selectedStepIndex;
                const isPassed = idx < selectedStepIndex;

                return (
                  <button
                    key={step.id}
                    onClick={() => setSelectedStepIndex(idx)}
                    className="flex flex-col items-center group focus:outline-none max-w-[120px] text-center"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-serif text-sm font-bold transition-all duration-300 shadow-md ${
                        isSelected
                          ? 'bg-[#800020] text-[#D4AF37] ring-4 ring-[#D4AF37]/40 scale-110'
                          : isPassed
                          ? 'bg-[#A67C1E] text-white'
                          : 'bg-white text-[#57534E] border-2 border-[#D6C7B2] group-hover:border-[#800020]'
                      }`}
                    >
                      {step.step_number || idx + 1}
                    </div>
                    <span
                      className={`mt-2.5 text-xs font-medium leading-tight transition-colors line-clamp-2 ${
                        isSelected
                          ? 'text-[#800020] font-bold'
                          : 'text-[#78716C] group-hover:text-[#1C1917]'
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Scrollable Step Bar */}
        <div className="lg:hidden flex overflow-x-auto gap-2.5 pb-4 mb-6 scrollbar-none snap-x">
          {activeSteps.map((step, idx) => {
            const isSelected = idx === selectedStepIndex;
            return (
              <button
                key={step.id}
                onClick={() => setSelectedStepIndex(idx)}
                className={`snap-start shrink-0 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 border transition-all ${
                  isSelected
                    ? 'bg-[#800020] text-[#FAF7F2] border-[#800020] shadow-sm'
                    : 'bg-white text-[#57534E] border-[#D6C7B2]'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
                  {step.step_number || idx + 1}
                </span>
                <span className="truncate max-w-[140px]">{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Step Spotlight Showcase Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E7DFD5] shadow-xl relative overflow-hidden transition-all duration-500">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Step Visual Image */}
            <div className="md:col-span-6 relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md bg-stone-100 border border-[#E7DFD5]">
                <Image
                  src={currentStep.image_url || '/images/craft_tie_dye.jpg'}
                  alt={currentStep.title}
                  fill
                  className="object-cover object-center transition-all duration-500 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
                <div className="absolute top-3 left-3 bg-[#800020] text-[#D4AF37] px-3 py-1 rounded-full text-xs font-serif font-bold shadow-md">
                  Step {currentStep.step_number || selectedStepIndex + 1} of {activeSteps.length}
                </div>
              </div>
            </div>

            {/* Step Story Information */}
            <div className="md:col-span-6 space-y-4">
              <div className="inline-block px-3 py-1 rounded-md bg-[#FAF7F2] text-[#A67C1E] border border-[#D4AF37]/40 text-xs font-semibold uppercase tracking-wider">
                Weaving Process
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                {currentStep.title}
              </h3>

              <p className="text-sm sm:text-base text-[#57534E] leading-relaxed">
                {currentStep.description}
              </p>

              {/* Navigation Controls between steps */}
              <div className="pt-4 flex items-center justify-between border-t border-[#E7DFD5]">
                <button
                  disabled={selectedStepIndex === 0}
                  onClick={() => setSelectedStepIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#D6C7B2] disabled:opacity-40 disabled:pointer-events-none hover:bg-[#FAF7F2] transition-colors"
                >
                  ← Previous Step
                </button>

                <span className="text-xs text-[#78716C] font-medium">
                  {selectedStepIndex + 1} / {activeSteps.length}
                </span>

                <button
                  disabled={selectedStepIndex === activeSteps.length - 1}
                  onClick={() => setSelectedStepIndex((prev) => Math.min(activeSteps.length - 1, prev + 1))}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#800020] text-white disabled:opacity-40 disabled:pointer-events-none hover:bg-[#660019] transition-colors flex items-center gap-1"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
