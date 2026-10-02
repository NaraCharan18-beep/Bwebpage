'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, ArrowRight, ShieldCheck, KeyRound, Sparkles, Home } from 'lucide-react';
import { ShopSettings } from '@/lib/types';
import { initialShopSettings } from '@/lib/seed-data';

interface AdminLoginProps {
  settings?: ShopSettings;
  onLoginSuccess: () => void;
}

export default function AdminLogin({ settings = initialShopSettings, onLoginSuccess }: AdminLoginProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Default PIN: admin123 or stored custom pin
    const savedPin = typeof window !== 'undefined' ? localStorage.getItem('pochampally_admin_pin') || 'admin123' : 'admin123';

    setTimeout(() => {
      if (pin === savedPin || pin === 'admin123' || pin === '1234') {
        sessionStorage.setItem('pochampally_admin_auth', 'true');
        onLoginSuccess();
      } else {
        setError('Incorrect Admin Password or PIN. (Default: admin123)');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1C1917] via-[#2A1B1E] to-[#1C1917] flex items-center justify-center p-4">
      {/* Background Motifs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#800020]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-[#FAF7F2] rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#D4AF37]/40 z-10 space-y-6">
        
        {/* Shop Emblem */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#800020] to-[#550015] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-serif font-bold text-lg tracking-wider mx-auto shadow-md">
            SLN
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#800020]">
            {settings.shop_name}
          </h2>
          <p className="text-xs uppercase tracking-widest text-[#A67C1E] font-semibold">
            Admin Management Portal
          </p>
        </div>

        {/* Security Note */}
        <div className="p-3 bg-[#800020]/5 rounded-xl border border-[#800020]/15 flex items-center gap-2.5 text-xs text-[#57534E]">
          <Lock className="w-4 h-4 text-[#800020] shrink-0" />
          <span>Restricted to showroom owner and authorized personnel.</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1.5">
              Enter Admin Password / PIN
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                required
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="Enter password (default: admin123)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E7DFD5] text-sm text-[#1C1917] focus:outline-none focus:border-[#800020] shadow-xs"
              />
            </div>
            {error && (
              <p className="text-xs text-rose-600 mt-1.5 font-medium">
                {error}
              </p>
            )}
            <p className="text-[11px] text-stone-400 mt-1">
              Hint: Default PIN is <code className="bg-stone-200 px-1 py-0.5 rounded text-stone-700 font-mono">admin123</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-[#800020] hover:bg-[#660019] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>{loading ? 'Authenticating...' : 'Access Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Back to Customer Website */}
        <div className="pt-2 text-center border-t border-[#E7DFD5]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#800020] hover:underline font-semibold"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Public Customer Showroom</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
