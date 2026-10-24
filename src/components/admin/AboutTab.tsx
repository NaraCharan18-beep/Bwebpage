'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Upload, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { AboutContent } from '@/lib/types';
import { uploadSareeImage } from '@/lib/supabase';

interface AboutTabProps {
  about: AboutContent;
  onSaveAbout: (content: AboutContent) => Promise<void>;
}

export default function AboutTab({ about, onSaveAbout }: AboutTabProps) {
  const [form, setForm] = useState<AboutContent>({ ...about });
  const [newHighlight, setNewHighlight] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadSareeImage(file);
      setForm((prev) => ({ ...prev, image_url: url }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    setForm((prev) => ({
      ...prev,
      highlights: [...(prev.highlights || []), newHighlight.trim()],
    }));
    setNewHighlight('');
  };

  const handleRemoveHighlight = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveAbout(form);
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
          About Pochampally Silk Content
        </h2>
        <p className="text-xs text-stone-500">
          Edit GI tag registration history, Pagdu Bandhu Ikat weaving explanation, and craftsman highlights
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DFD5] shadow-sm space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Section Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 font-serif font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Opening Overview
          </label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
          ></textarea>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Pochampally Handloom & GI Tag History
          </label>
          <textarea
            rows={3}
            value={form.history_text}
            onChange={(e) => setForm({ ...form, history_text: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
          ></textarea>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            The Magic of Pagdu Bandhu (Double Ikat Explanation)
          </label>
          <textarea
            rows={3}
            value={form.ikat_explanation}
            onChange={(e) => setForm({ ...form, ikat_explanation: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
          ></textarea>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Artisan Craftsmanship & Loom Patience
          </label>
          <textarea
            rows={3}
            value={form.craftsmanship_text}
            onChange={(e) => setForm({ ...form, craftsmanship_text: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
          ></textarea>
        </div>

        {/* Feature Image */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-stone-700">
            About Section Illustration Photo
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
              <Image
                src={form.image_url || '/images/weaver_pit_loom.jpg'}
                alt="About section preview"
                fill
                className="object-cover object-center"
              />
            </div>
            <div className="sm:col-span-7 space-y-2">
              <input
                type="text"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
              />
              <label className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 cursor-pointer flex items-center justify-center gap-2">
                <Upload className="w-4 h-4 text-[#800020]" />
                <span>{isUploading ? 'Uploading...' : 'Upload Weaver Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Highlights List */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-stone-700">
            Key Feature Bullets ({form.highlights?.length || 0})
          </label>

          <div className="space-y-2">
            {form.highlights?.map((hl, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={hl}
                  onChange={(e) => {
                    const newArr = [...form.highlights];
                    newArr[idx] = e.target.value;
                    setForm({ ...form, highlights: newArr });
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveHighlight(idx)}
                  className="p-2 text-stone-400 hover:text-rose-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                placeholder="Add new highlight point..."
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#E7DFD5] text-xs text-stone-900"
              />
              <button
                type="button"
                onClick={handleAddHighlight}
                className="px-4 py-2 bg-[#800020] text-white text-xs font-semibold rounded-xl"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-[#E7DFD5] flex items-center justify-between">
          <div>
            {savedSuccess && (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Updated About Section!</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow transition-all disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Save & Publish About Content'}
          </button>
        </div>

      </form>
    </div>
  );
}
