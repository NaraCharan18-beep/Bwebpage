'use client';

import React, { useState } from 'react';
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Clock, 
  Globe, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { ShopSettings } from '@/lib/types';

interface ContactInfoTabProps {
  settings: ShopSettings;
  onSaveSettings: (settings: ShopSettings) => Promise<void>;
}

export default function ContactInfoTab({
  settings,
  onSaveSettings,
}: ContactInfoTabProps) {
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
          <Phone className="w-5 h-5 text-[#800020]" />
          <h2 className="font-serif text-xl font-bold text-[#1C1917]">
            Contact Information & Location
          </h2>
        </div>
        <p className="text-xs text-stone-500">
          Manage phone numbers, WhatsApp, physical showroom address, operating hours, and Google Maps embed
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Contact information updated successfully! All WhatsApp and Call buttons on the customer website are now updated.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DFD5] shadow-sm space-y-6">
        
        {/* Direct Communication */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase font-bold text-[#A67C1E] tracking-wider border-b border-stone-200 pb-1">
            Calling & WhatsApp Numbers
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#800020]" />
                <span>Primary Phone *</span>
              </label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>Secondary Phone</span>
              </label>
              <input
                type="text"
                value={form.alternate_phone || ''}
                onChange={(e) => setForm({ ...form, alternate_phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                placeholder="+91 94400 12345"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp Number *</span>
              </label>
              <input
                type="text"
                required
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                placeholder="919876543210 (with country code)"
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Digits only (e.g. 919876543210) for direct WhatsApp links
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#800020]" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
              placeholder="contact@pochampallysarees.com"
            />
          </div>
        </div>

        {/* Physical Showroom Location & Timings */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase font-bold text-[#A67C1E] tracking-wider border-b border-stone-200 pb-1">
            Physical Showroom & Visiting Hours
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#800020]" />
                <span>Complete Showroom Address *</span>
              </label>
              <textarea
                rows={3}
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                placeholder="Door No, Main Road, Bhoodan Pochampally, Yadadri Bhuvanagiri District, Telangana 508284"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#800020]" />
                <span>Store Timings & Open Days</span>
              </label>
              <textarea
                rows={3}
                value={form.timings}
                onChange={(e) => setForm({ ...form, timings: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                placeholder="Monday – Sunday: 9:30 AM – 8:30 PM (All 7 Days Open)"
              ></textarea>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#800020]" />
                <span>Google Maps Embed URL</span>
              </label>
              <input
                type="text"
                value={form.google_maps_url || ''}
                onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <span className="text-[10px] text-stone-400 mt-1 block">
                Paste the embed URL from Google Maps (Share → Embed a map → copy the src URL).
              </span>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase font-bold text-[#A67C1E] tracking-wider border-b border-stone-200 pb-1">
            Social Media & Web Presence
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Instagram URL
              </label>
              <input
                type="text"
                value={form.instagram_url || ''}
                onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                placeholder="https://instagram.com/yourshop"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Facebook Page URL
              </label>
              <input
                type="text"
                value={form.facebook_url || ''}
                onChange={(e) => setForm({ ...form, facebook_url: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                placeholder="https://facebook.com/yourshop"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                YouTube Channel URL
              </label>
              <input
                type="text"
                value={form.youtube_url || ''}
                onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                placeholder="https://youtube.com/@yourshop"
              />
            </div>
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
            <span>{isSubmitting ? 'Saving...' : 'Save Contact Information'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
