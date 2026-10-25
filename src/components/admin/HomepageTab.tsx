'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Upload, CheckCircle2, Sparkles, Image as ImageIcon, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { HomepageContent, SareeItem } from '@/lib/types';
import { uploadSareeImage } from '@/lib/supabase';
import { getCollections } from '@/lib/data-store';

interface HomepageTabProps {
  homepage: HomepageContent;
  onSaveHomepage: (content: HomepageContent) => Promise<void>;
}

export default function HomepageTab({ homepage, onSaveHomepage }: HomepageTabProps) {
  const [form, setForm] = useState<HomepageContent>({ ...homepage });
  const [isUploading, setIsUploading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCatalogPicker, setShowCatalogPicker] = useState(false);
  const [catalogSarees, setCatalogSarees] = useState<SareeItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize form when prop updates
  useEffect(() => {
    if (homepage) {
      setForm((prev) => ({
        ...prev,
        ...homepage,
      }));
    }
  }, [homepage]);

  // Load uploaded sarees so the user can easily select one as hero
  useEffect(() => {
    getCollections()
      .then((cols) => {
        const all: SareeItem[] = [];
        cols.forEach((col) => {
          if (Array.isArray(col.sarees)) {
            col.sarees.forEach((s) => {
              if (s.image_url && !all.some((item) => item.image_url === s.image_url)) {
                all.push(s);
              }
            });
          }
        });
        setCatalogSarees(all);
      })
      .catch(() => {});
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset target value so choosing the same file again triggers onChange
    e.target.value = '';

    setIsUploading(true);
    setUploadFeedback(null);

    try {
      const url = await uploadSareeImage(file);
      if (!url) {
        throw new Error('Failed to process image file');
      }

      const updatedForm: HomepageContent = {
        ...form,
        hero_image_url: url,
      };

      setForm(updatedForm);

      // Auto-save immediately so the customer page receives the hero photo right away!
      await onSaveHomepage(updatedForm);

      setUploadFeedback({
        type: 'success',
        message: 'Hero photo uploaded and published live to customer website successfully!',
      });
      setTimeout(() => setUploadFeedback(null), 5000);
    } catch (err: any) {
      console.error('Hero upload error:', err);
      setUploadFeedback({
        type: 'error',
        message: err?.message || 'Failed to upload photo. Please try a different photo.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectSareeAsHero = async (saree: SareeItem) => {
    const updatedForm: HomepageContent = {
      ...form,
      hero_image_url: saree.image_url,
    };
    setForm(updatedForm);
    setShowCatalogPicker(false);
    setIsUploading(true);
    try {
      await onSaveHomepage(updatedForm);
      setUploadFeedback({
        type: 'success',
        message: `Set "${saree.name || saree.code}" as Hero photo and published live!`,
      });
      setTimeout(() => setUploadFeedback(null), 5000);
    } catch (e: any) {
      console.error(e);
      setUploadFeedback({
        type: 'error',
        message: 'Failed to update hero photo.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetToDefault = async () => {
    const updatedForm: HomepageContent = {
      ...form,
      hero_image_url: '/images/hero_saree.jpg',
    };
    setForm(updatedForm);
    setIsUploading(true);
    try {
      await onSaveHomepage(updatedForm);
      setUploadFeedback({
        type: 'success',
        message: 'Reset hero photo to default showroom saree.',
      });
      setTimeout(() => setUploadFeedback(null), 4000);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveHomepage(form);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-5 rounded-2xl border border-[#E7DFD5] shadow-xs">
        <h2 className="font-serif text-xl font-bold text-[#1C1917]">
          Homepage Hero & Banner Content
        </h2>
        <p className="text-xs text-stone-500">
          Modify the primary headline, hero image, and call-to-action buttons without writing code
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DFD5] shadow-sm space-y-6">
        
        {/* Hero Title */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Hero Main Title *
          </label>
          <input
            type="text"
            required
            value={form.hero_title}
            onChange={(e) => setForm({ ...form, hero_title: e.target.value })}
            placeholder="e.g. Where Tradition Meets Timeless Elegance"
            className="w-full px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-sm text-stone-900 font-serif font-bold focus:outline-none focus:border-[#800020]"
          />
        </div>

        {/* Hero Subtitle */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Hero Subtitle
          </label>
          <input
            type="text"
            value={form.hero_subtitle}
            onChange={(e) => setForm({ ...form, hero_subtitle: e.target.value })}
            placeholder="e.g. Authentic Pochampally Silk & Double Ikat Weaves"
            className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
          />
        </div>

        {/* Hero Description */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Brand Narrative Description
          </label>
          <textarea
            rows={3}
            value={form.hero_description}
            onChange={(e) => setForm({ ...form, hero_description: e.target.value })}
            placeholder="Short introductory text for visitors..."
            className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
          ></textarea>
        </div>

        {/* Hero Badge */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Header Highlight Pill Text
          </label>
          <input
            type="text"
            value={form.hero_badge}
            onChange={(e) => setForm({ ...form, hero_badge: e.target.value })}
            placeholder="e.g. GI Tagged Heritage • 100% Pure Silk Mark Certified"
            className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
          />
        </div>

        {/* Hero Image Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-stone-800">
              Hero Saree Photo *
            </label>
            <span className="text-[11px] text-stone-500">
              Primary photo displayed on customer homepage
            </span>
          </div>

          {/* Feedback banner */}
          {uploadFeedback && (
            <div
              className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
                uploadFeedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              } animate-in fade-in`}
            >
              {uploadFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{uploadFeedback.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
            {/* Image Preview Container */}
            <div className="sm:col-span-5 relative aspect-[3/4] sm:aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 border-2 border-[#D4AF37]/40 shadow-md">
              <Image
                src={form.hero_image_url || '/images/hero_saree.jpg'}
                alt="Hero banner preview"
                fill
                unoptimized
                className="object-cover object-top"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2 p-4 text-center">
                  <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold">Compressing & Publishing Live...</span>
                </div>
              )}
              <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                Live Preview
              </div>
            </div>

            {/* Upload controls */}
            <div className="sm:col-span-7 space-y-3.5">
              {/* Primary Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-3.5 px-4 bg-[#800020] hover:bg-[#660019] text-white rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-[#D4AF37]" />
                <span>{isUploading ? 'Uploading & Publishing...' : 'Upload Photo from Device (Phone / PC)'}</span>
              </button>

              {/* Secondary Actions: Pick from uploaded sarees or Reset */}
              <div className="flex flex-wrap gap-2">
                {catalogSarees.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowCatalogPicker(!showCatalogPicker)}
                    className="flex-1 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#800020]" />
                    <span>{showCatalogPicker ? 'Hide Saree Catalog' : `Pick from Uploaded Sarees (${catalogSarees.length})`}</span>
                  </button>
                )}

                {form.hero_image_url && form.hero_image_url !== '/images/hero_saree.jpg' && (
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    disabled={isUploading}
                    className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-xs font-semibold text-stone-600 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Default</span>
                  </button>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                style={{ display: 'none' }}
              />

              {/* Catalog Sarees Picker Grid (if toggled) */}
              {showCatalogPicker && catalogSarees.length > 0 && (
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E7DFD5] space-y-2">
                  <span className="text-[11px] font-bold text-stone-700 block">
                    Click any saree from your collection to set as Hero:
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                    {catalogSarees.map((saree) => {
                      const isSelected = form.hero_image_url === saree.image_url;
                      return (
                        <button
                          key={saree.id}
                          type="button"
                          onClick={() => handleSelectSareeAsHero(saree)}
                          className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                            isSelected ? 'border-[#800020] ring-2 ring-[#800020]/30 scale-95' : 'border-stone-200 hover:border-[#800020]'
                          }`}
                        >
                          <Image
                            src={saree.image_url}
                            alt={saree.name || saree.code}
                            fill
                            unoptimized
                            className="object-cover object-top"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-[#800020]/40 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Direct Image URL input */}
              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">
                  Or enter image URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.hero_image_url}
                    onChange={(e) => setForm({ ...form, hero_image_url: e.target.value })}
                    placeholder="/images/... or https://..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!form.hero_image_url) return;
                      await onSaveHomepage(form);
                      setUploadFeedback({
                        type: 'success',
                        message: 'Hero image URL saved and published live!',
                      });
                      setTimeout(() => setUploadFeedback(null), 4000);
                    }}
                    className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-stone-500 leading-relaxed">
                Recommended aspect ratio: 3:4 or 4:5 vertical portrait showing the full draped saree or bridal look. Images are automatically compressed for lightning-fast loading on mobile phones.
              </p>
            </div>
          </div>
        </div>

        {/* Button Labels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Explore Button Label
            </label>
            <input
              type="text"
              value={form.explore_btn_text}
              onChange={(e) => setForm({ ...form, explore_btn_text: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Contact Button Label
            </label>
            <input
              type="text"
              value={form.contact_btn_text}
              onChange={(e) => setForm({ ...form, contact_btn_text: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-[#E7DFD5] flex items-center justify-between">
          <div>
            {savedSuccess && (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Published to Customer Website Successfully!</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow transition-all disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? 'Publishing...' : 'Save & Publish Homepage'}
          </button>
        </div>

      </form>
    </div>
  );
}
