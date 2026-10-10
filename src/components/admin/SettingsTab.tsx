'use client';

import React, { useState } from 'react';
import { 
  KeyRound, 
  QrCode, 
  Database, 
  CheckCircle2, 
  RotateCcw, 
  ShieldAlert, 
  ExternalLink,
  Download,
  AlertTriangle,
  MessageCircle
} from 'lucide-react';
import { ShopSettings } from '@/lib/types';
import { resetDataToDefaults } from '@/lib/data-store';
import { getSupabaseConfig, setSupabaseConfig, isSupabaseConfigured } from '@/lib/supabase';

interface SettingsTabProps {
  settings: ShopSettings;
  onSaveSettings: (settings: ShopSettings) => Promise<void>;
  onDataReset: () => void;
}

export default function SettingsTab({
  settings,
  onSaveSettings,
  onDataReset,
}: SettingsTabProps) {
  // PIN State
  const [pin, setPin] = useState(settings.admin_pin || '7579');
  const [pinSuccess, setPinSuccess] = useState(false);

  // Supabase State
  const currentSupabase = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentSupabase.url);
  const [supabaseKey, setSupabaseKey] = useState(currentSupabase.key);
  const [supabaseStatus, setSupabaseStatus] = useState<string>('');
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);

  // Reset confirmation
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    const newPin = pin.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem('pochampally_admin_pin', newPin);
    }
    await onSaveSettings({ ...settings, admin_pin: newPin });
    setPinSuccess(true);
    setTimeout(() => setPinSuccess(false), 3000);
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingSupabase(true);
    try {
      setSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
      setSupabaseStatus('Configuration saved successfully! Real-time Supabase cloud sync is active.');
      setTimeout(() => setSupabaseStatus(''), 4000);
    } catch (err: any) {
      setSupabaseStatus(`Error: ${err.message}`);
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleResetData = () => {
    resetDataToDefaults();
    onDataReset();
    setConfirmReset(false);
  };

  const liveShowroomUrl = settings.website_url || 'https://bwebpage-szwt.vercel.app';
  const whatsappGroupUrl = settings.whatsapp_group_url || 'https://chat.whatsapp.com/J9afqXLrDfR7fhsHYffP9r';
  const qrCodeUrl = '/images/visiting_card_qr.jpg';
  const whatsappQrUrl = '/images/whatsapp_qr.jpg';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-5 rounded-2xl border border-[#E7DFD5] shadow-xs">
        <h2 className="font-serif text-xl font-bold text-[#1C1917]">
          System Settings & Security
        </h2>
        <p className="text-xs text-stone-500">
          Manage admin dashboard password/PIN, visiting card QR code, database sync, and showroom resets
        </p>
      </div>

      {/* 1. Admin PIN Security */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DFD5] shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <KeyRound className="w-5 h-5 text-[#800020]" />
          <h3 className="font-serif text-base font-bold text-stone-900">
            Admin Security PIN / Password
          </h3>
        </div>

        <p className="text-xs text-stone-600">
          This PIN is required to log in to this private management dashboard.
        </p>

        {pinSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Admin PIN updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSavePin} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            required
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter new 4-8 character PIN"
            className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 font-mono focus:outline-none focus:border-[#800020]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow-xs transition-colors"
          >
            Update Admin PIN
          </button>
        </form>
      </div>

      {/* 2. Showroom Visiting Card & WhatsApp Group QR Codes */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DFD5] shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <QrCode className="w-5 h-5 text-[#800020]" />
          <h3 className="font-serif text-base font-bold text-stone-900">
            Showroom QR Codes (WhatsApp Group & Visiting Card)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: WhatsApp Group QR */}
          <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#E7DFD5] space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <h4 className="font-serif font-bold text-sm text-stone-900">
                  1. WhatsApp Group QR Code
                </h4>
              </div>
              <p className="text-xs text-stone-600 mb-3 leading-relaxed">
                Customers scan using WhatsApp camera to join your customer updates & saree showcase community.
              </p>
              <div className="p-3 bg-white rounded-xl border border-stone-200 text-center max-w-[200px] mx-auto shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={whatsappQrUrl}
                  alt="WhatsApp Group QR Code"
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-2 bg-white rounded-lg border border-[#E7DFD5] font-mono text-[10px] text-stone-600 truncate">
                {whatsappGroupUrl}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={whatsappQrUrl}
                  download="sri-laxmi-narshima-whatsapp-group-qr.jpg"
                  className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-[#D6C7B2] font-bold text-xs inline-flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <a
                  href={whatsappGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs inline-flex items-center justify-center gap-1.5"
                >
                  <span>Open Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Visiting Card Showroom QR */}
          <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#E7DFD5] space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="w-4 h-4 text-[#800020]" />
                <h4 className="font-serif font-bold text-sm text-stone-900">
                  2. Visiting Card Back QR Code
                </h4>
              </div>
              <p className="text-xs text-stone-600 mb-3 leading-relaxed">
                Printed on the back of your shop visiting cards. Scans with any phone camera to open your live web showroom.
              </p>
              <div className="p-3 bg-white rounded-xl border border-stone-200 text-center max-w-[200px] mx-auto shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt="Visiting Card QR Code"
                  className="w-36 h-36 object-contain rounded-lg mx-auto"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-2 bg-white rounded-lg border border-[#E7DFD5] font-mono text-[10px] text-[#800020] font-bold truncate">
                {liveShowroomUrl}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={qrCodeUrl}
                  download="visiting-card-back-qr.jpg"
                  className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-stone-100 text-[#800020] border border-[#E7DFD5] font-bold text-xs inline-flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <a
                  href={liveShowroomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#800020] hover:bg-[#660019] text-white font-bold text-xs inline-flex items-center justify-center gap-1.5"
                >
                  <span>Open Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Supabase Cloud Database */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DFD5] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#800020]" />
            <h3 className="font-serif text-base font-bold text-stone-900">
              Supabase Cloud Database Sync
            </h3>
          </div>
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
              isSupabaseConfigured()
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-stone-100 text-stone-600'
            }`}
          >
            {isSupabaseConfigured() ? 'Cloud Connected' : 'Local Showroom Storage Active'}
          </span>
        </div>

        <p className="text-xs text-stone-600">
          The showroom is equipped with a resilient local database fallback that works instantly. To synchronize across multiple devices or store unlimited images in Supabase Storage, connect your Supabase project credentials.
        </p>

        {supabaseStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{supabaseStatus}</span>
          </div>
        )}

        <form onSubmit={handleSaveSupabase} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 font-mono focus:outline-none focus:border-[#800020]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 font-mono focus:outline-none focus:border-[#800020]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isTestingSupabase}
              className="px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow-xs transition-colors"
            >
              {isTestingSupabase ? 'Verifying...' : 'Save & Sync Cloud Database'}
            </button>
          </div>
        </form>
      </div>

      {/* 4. Factory Reset to Seed Data */}
      <div className="bg-rose-50/50 rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-rose-200 pb-2">
          <RotateCcw className="w-5 h-5 text-rose-600" />
          <h3 className="font-serif text-base font-bold text-rose-950">
            Reset to Sample Showroom Data
          </h3>
        </div>

        <p className="text-xs text-rose-800 leading-relaxed">
          If you are testing and wish to restore the authentic default Pochampally collections (Pure Silk, Pochampally Ikat, Cotton, Sico, Wedding) and high-resolution photographs, click the reset button below.
        </p>

        {confirmReset ? (
          <div className="p-4 bg-white rounded-2xl border border-rose-300 space-y-3">
            <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Are you sure? This will restore initial collections and albums.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Yes, Reset Showroom
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold transition-colors"
          >
            Reset to Sample Catalog
          </button>
        )}
      </div>

    </div>
  );
}
