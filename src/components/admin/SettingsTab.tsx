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
  AlertTriangle
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
  const [pin, setPin] = useState(settings.admin_pin || 'admin123');
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
    await onSaveSettings({ ...settings, admin_pin: pin.trim() });
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

  const liveShowroomUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(liveShowroomUrl)}`;

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
          This PIN is required to log in to this private management dashboard. Default is <code className="bg-stone-100 px-2 py-0.5 rounded font-mono text-[#800020]">admin123</code>.
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

      {/* 2. Showroom Visiting Card QR Code */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DFD5] shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <QrCode className="w-5 h-5 text-[#800020]" />
          <h3 className="font-serif text-base font-bold text-stone-900">
            Showroom Visiting Card QR Code
          </h3>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-[#D4AF37] shadow-sm shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt="Visiting Card QR Code"
              className="w-36 h-36 rounded-lg object-contain"
            />
          </div>

          <div className="space-y-3 text-xs text-stone-600">
            <p className="leading-relaxed">
              Print this QR code on your shop visiting cards, display stands, or fabric tags. When customers scan it with any smartphone camera, your public mobile-first saree catalog opens instantly.
            </p>
            <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E7DFD5] font-mono text-[11px] text-stone-700 truncate">
              Target URL: <strong>{liveShowroomUrl}</strong>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <a
                href={qrCodeUrl}
                download="pochampally-visiting-card-qr.png"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#FAF7F2] hover:bg-stone-200 text-[#800020] border border-[#E7DFD5] font-bold text-xs inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download High-Res QR</span>
              </a>

              <a
                href={liveShowroomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs inline-flex items-center gap-1.5"
              >
                <span>Open Showroom</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
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
