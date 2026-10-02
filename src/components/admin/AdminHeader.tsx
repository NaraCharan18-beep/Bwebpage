'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Menu, 
  ExternalLink, 
  Eye, 
  Plus, 
  ShieldCheck, 
  Sparkles,
  Database
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

interface AdminHeaderProps {
  title: string;
  subtitle: string;
  onOpenMobileMenu: () => void;
  onOpenPreview: () => void;
  onQuickCreateAlbum?: () => void;
}

export default function AdminHeader({
  title,
  subtitle,
  onOpenMobileMenu,
  onOpenPreview,
  onQuickCreateAlbum,
}: AdminHeaderProps) {
  const isSupaActive = typeof window !== 'undefined' && isSupabaseConfigured();

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E7DFD5] px-4 sm:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Mobile hamburger & Current page title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-200"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917] leading-tight">
              {title}
            </h1>
            <p className="text-xs text-[#78716C] hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {/* Supabase status badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-[11px] text-stone-600 font-medium">
            <span className={`w-2 h-2 rounded-full ${isSupaActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span>{isSupaActive ? 'Supabase Synced' : 'Local Storage Mode'}</span>
          </div>

          {/* Live Showroom Preview Button */}
          <button
            onClick={onOpenPreview}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#D4AF37] hover:bg-[#FAF7F2] text-[#800020] text-xs font-semibold shadow-xs transition-colors"
            title="Preview how customer website looks"
          >
            <Eye className="w-4 h-4 text-[#D4AF37]" />
            <span className="hidden sm:inline">Live Preview</span>
          </button>

          {/* Quick Create Album Shortcut */}
          {onQuickCreateAlbum && (
            <button
              onClick={onQuickCreateAlbum}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Album</span>
            </button>
          )}

          {/* Open Public Showroom in new tab */}
          <Link
            href="/"
            target="_blank"
            className="p-2 rounded-xl text-stone-600 hover:text-[#800020] hover:bg-stone-200/60 transition-colors"
            title="Open customer website in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </header>
  );
}
