'use client';

import React, { useState } from 'react';
import { Store, CheckCircle2, Award, Sparkles, ShieldCheck } from 'lucide-react';
import { ShopSettings } from '@/lib/types';

interface ShopInfoTabProps {
  settings: ShopSettings;
  onSaveSettings: (settings: ShopSettings) => Promise<void>;
}

export default function ShopInfoTab({
  settings,
  onSaveSettings,
}: ShopInfoTabProps) {
  const [form, setForm] = useState<ShopSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveSettings(form);
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
        <div className="flex items-center gap-2 mb-1">
          <Store className="w-5 h-5 text-[#800020]" />
          <h2 className="font-serif text-xl font-bold text-[#1C1917]">
            Shop Information
          </h2>
        </div>
        <p className="text-xs text-stone-500">
          Control your showroom brand name, heritage tagline, brand descriptions, and silk mark authenticity badge
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Shop brand information updated successfully and reflected on the customer website!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DFD5] shadow-sm space-y-6">
        
        {/* Brand Identity */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase font-bold text-[#A67C1E] tracking-wider border-b border-stone-200 pb-1">
            Store Identity & Heritage
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Showroom / Business Name *
              </label>
              <input
                type="text"
                required
                value={form.shop_name}
                onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 font-serif font-bold focus:outline-none focus:border-[#800020]"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Appears in website header, navigation, and title tags
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Store Tagline
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Displayed beneath showroom name on the hero banner
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Short Showroom Description (For Header / Footer / Metadata)
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Authenticity & Certification */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase font-bold text-[#A67C1E] tracking-wider border-b border-stone-200 pb-1">
            Certifications & Trust Badges
          </h4>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E7DFD5] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-[#A67C1E]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-sm font-bold text-stone-900 block">
                  100% Silk Mark India Certified
                </span>
                <span className="text-xs text-stone-500 block">
                  Displays official Silk Mark seal across header and footer to guarantee 100% genuine mulberry silk.
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.silk_mark_certified}
                onChange={(e) => setForm({ ...form, silk_mark_certified: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#800020]"></div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-stone-200 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Shop Information'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
