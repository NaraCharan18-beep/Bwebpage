'use client';

import React, { useState } from 'react';
import { X, QrCode, Share2, Copy, Check, Download, ShieldCheck, Sparkles } from 'lucide-react';
import { ShopSettings } from '@/lib/types';

interface QrCodeModalProps {
  settings: ShopSettings;
  isOpen: boolean;
  onClose: () => void;
}

export default function QrCodeModal({ settings, isOpen, onClose }: QrCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://sricharanpochampally.com';
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&color=80-0-32&bgcolor=FAF7F2&data=${encodeURIComponent(
    currentUrl
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: settings.shop_name,
          text: `Explore authentic Pochampally Silk & Double Ikat Sarees at ${settings.shop_name}:`,
          url: currentUrl,
        });
      } catch (e) {
        // Ignored
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-sm bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-[#D4AF37] text-center z-10 space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-500 hover:text-stone-800 rounded-full hover:bg-stone-200/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Shop Header */}
        <div>
          <div className="w-12 h-12 rounded-full bg-[#800020] text-[#D4AF37] font-serif font-bold text-xl flex items-center justify-center mx-auto mb-2 border border-[#D4AF37]">
            SC
          </div>
          <h3 className="font-serif text-xl font-bold text-[#800020]">
            {settings.shop_name}
          </h3>
          <p className="text-[11px] text-[#A67C1E] uppercase font-semibold tracking-wider">
            Visiting Card Digital QR
          </p>
        </div>

        {/* QR Code Frame */}
        <div className="p-4 bg-white rounded-2xl shadow-inner border border-[#E7DFD5] inline-block">
          <img
            src={qrImageUrl}
            alt="Showroom Visiting Card QR Code"
            className="w-56 h-56 mx-auto object-contain"
          />
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          Scan this QR code with any phone camera to instantly open our digital saree showroom and share it with family and friends.
        </p>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-[#D6C7B2] hover:bg-stone-50 text-xs font-semibold text-stone-800 flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex-1 py-2.5 px-3 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Showroom</span>
          </button>
        </div>

      </div>
    </div>
  );
}
