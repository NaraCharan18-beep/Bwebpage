'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Upload, CheckCircle2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { HomepageContent } from '@/lib/types';
import { uploadSareeImage } from '@/lib/supabase';

interface HomepageTabProps {
  homepage: HomepageContent;
  onSaveHomepage: (content: HomepageContent) => Promise<void>;
}

export default function HomepageTab({ homepage, onSaveHomepage }: HomepageTabProps) {
  const [form, setForm] = useState<HomepageContent>({ ...homepage });
  const [isUploading, setIsUploading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadSareeImage(file);
      setForm((prev) => ({ ...prev, hero_image_url: url }));
    } catch (err) {
      console.error(err);
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
      setTimeout(() => setSavedSuccess(false), 3000);
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

        {/* Hero Image */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-stone-700">
            Hero Image
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Image Preview */}
            <div className="sm:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
              <Image
                src={form.hero_image_url || '/images/hero_saree.jpg'}
                alt="Hero banner preview"
                fill
                className="object-cover object-top"
              />
            </div>

            {/* Upload controls */}
            <div className="sm:col-span-7 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.hero_image_url}
                  onChange={(e) => setForm({ ...form, hero_image_url: e.target.value })}
                  placeholder="/images/... or https://..."
                  className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
                />
              </div>

              <label className="w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 cursor-pointer flex items-center justify-center gap-2 transition-colors">
                <Upload className="w-4 h-4 text-[#800020]" />
                <span>{isUploading ? 'Uploading Hero Photo...' : 'Upload New Hero Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="sr-only"
                />
              </label>

              <p className="text-[11px] text-stone-500">
                Recommended aspect ratio: 4:3 or 16:9 vertical portrait/landscape showing a full draped saree.
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
            className="px-6 py-2.5 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow transition-all disabled:opacity-60"
          >
            {isSubmitting ? 'Publishing...' : 'Save & Publish Homepage'}
          </button>
        </div>

      </form>
    </div>
  );
}
