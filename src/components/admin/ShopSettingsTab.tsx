'use client';

import React, { useState } from 'react';
import { CheckCircle2, Store, Phone, MessageCircle, MapPin, Clock, Globe } from 'lucide-react';
import { ShopSettings } from '@/lib/types';

interface ShopSettingsTabProps {
  settings: ShopSettings;
  onSaveSettings: (settings: ShopSettings) => Promise<void>;
}

export default function ShopSettingsTab({
  settings,
  onSaveSettings,
}: ShopSettingsTabProps) {
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
        <h2 className="font-serif text-xl font-bold text-[#1C1917]">
          Shop & Contact Information
        </h2>
        <p className="text-xs text-stone-500">
          Control your showroom name, phone numbers, WhatsApp, physical address, timings, and map location
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DFD5] shadow-sm space-y-6">
        
        {/* Basic Brand */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase font-bold text-[#A67C1E] tracking-wider border-b border-stone-200 pb-1">
            Store Identity
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 font-serif font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Store Tagline
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Short Business Description (For Header / Footer)
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Contact Numbers & WhatsApp */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase font-bold text-[#A67C1E] tracking-wider border-b border-stone-200 pb-1">
            Phone & Communication
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Display Phone Number *
              </label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98490 12345"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                WhatsApp Number (with country code, no +) *
              </label>
              <input
                type="text"
                required
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value.replace(/[^0-9]/g, '') })}
                placeholder="919849012345"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 font-mono"
              />
              <span className="text-[10px] text-stone-400">e.g. 919849012345 for India</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="info@sricharanhandlooms.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* Location & Timings */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase font-bold text-[#A67C1E] tracking-wider border-b border-stone-200 pb-1">
            Physical Store Location & Hours
          </h4>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Complete Physical Address *
            </label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Showroom Opening Hours *
              </label>
              <input
                type="text"
                required
                value={form.opening_hours}
                onChange={(e) => setForm({ ...form, opening_hours: e.target.value })}
                placeholder="Monday – Sunday: 9:30 AM to 8:30 PM (All 7 Days Open)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Google Maps Navigation Link
              </label>
              <input
                type="text"
                value={form.google_maps_url}
                onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })}
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Google Maps Embed iframe URL
              </label>
              <input
                type="text"
                value={form.google_maps_embed}
                onChange={(e) => setForm({ ...form, google_maps_embed: e.target.value })}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase font-bold text-[#A67C1E] tracking-wider border-b border-stone-200 pb-1">
            Social Media Profiles
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Instagram URL
              </label>
              <input
                type="text"
                value={form.instagram_url}
                onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                placeholder="https://instagram.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Facebook URL
              </label>
              <input
                type="text"
                value={form.facebook_url}
                onChange={(e) => setForm({ ...form, facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                YouTube URL
              </label>
              <input
                type="text"
                value={form.youtube_url || ''}
                onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                placeholder="https://youtube.com/@..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-[#E7DFD5] flex items-center justify-between">
          <div>
            {savedSuccess && (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Shop Information Saved & Published!</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow transition-all disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Save & Publish Information'}
          </button>
        </div>

      </form>
    </div>
  );
}
