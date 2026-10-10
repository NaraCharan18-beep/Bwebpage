'use client';

import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  MessageCircle, 
  ExternalLink, 
  Sparkles,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { ShopSettings } from '@/lib/types';

interface QrCodeModalProps {
  settings: ShopSettings;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'whatsapp' | 'website';
}

export default function QrCodeModal({ 
  settings, 
  isOpen, 
  onClose,
  initialTab = 'whatsapp'
}: QrCodeModalProps) {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'website'>(initialTab);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const websiteUrl = settings.website_url || (typeof window !== 'undefined' ? window.location.origin : 'https://bwebpage-szwt.vercel.app');
  const whatsappGroupUrl = settings.whatsapp_group_url || 'https://chat.whatsapp.com/J9afqXLrDfR7fhsHYffP9r';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const isWa = activeTab === 'whatsapp';
    const shareUrl = isWa ? whatsappGroupUrl : websiteUrl;
    const shareTitle = isWa 
      ? `${settings.shop_name} WhatsApp Group` 
      : `${settings.shop_name} Digital Showroom`;
    const shareText = isWa
      ? `Join the official WhatsApp group of ${settings.shop_name} for exclusive Pochampally saree arrivals:`
      : `Explore authentic Pochampally Silk & Double Ikat Sarees at ${settings.shop_name}:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (e) {
        // Ignored
      }
    } else {
      handleCopy(shareUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-[#FAF7F2] rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-[#D4AF37] text-center z-10 space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-500 hover:text-stone-800 rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Shop Brand Header */}
        <div className="pt-1">
          <div className="w-11 h-11 rounded-full bg-[#800020] text-[#D4AF37] font-serif font-bold text-base flex items-center justify-center mx-auto mb-2 border border-[#D4AF37] shadow-sm">
            SLN
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#800020] leading-tight">
            {settings.shop_name}
          </h3>
          <p className="text-[11px] text-[#A67C1E] uppercase font-semibold tracking-wider mt-0.5">
            Bhoodan Pochampally Handlooms
          </p>
        </div>

        {/* Segmented Switcher for Both QRs */}
        <div className="bg-[#EFE7DC] p-1 rounded-2xl grid grid-cols-2 gap-1 border border-[#E0D5C7]">
          <button
            type="button"
            onClick={() => { setActiveTab('whatsapp'); setCopied(false); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'bg-[#25D366] text-white shadow-md'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">1. WhatsApp QR</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('website'); setCopied(false); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'website'
                ? 'bg-[#800020] text-white shadow-md'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span className="truncate">2. Visiting Card QR</span>
          </button>
        </div>

        {/* TAB 1: WhatsApp Group QR */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-[#E7DFD5]">
              <div className="relative mx-auto rounded-xl overflow-hidden max-w-[240px] shadow-sm border border-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/whatsapp_qr.jpg"
                  alt="Sri Laxmi Narshima Sares House WhatsApp Group QR"
                  className="w-full h-auto object-contain block mx-auto"
                />
              </div>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Community Group</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Scan using the WhatsApp camera to join our exclusive saree updates group
              </p>
            </div>

            {/* Action Buttons for WhatsApp */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={whatsappGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Join Group</span>
                <ExternalLink className="w-3 h-3 opacity-75" />
              </a>

              <button
                type="button"
                onClick={() => handleCopy(whatsappGroupUrl)}
                className="py-2.5 px-3 rounded-xl bg-white border border-[#D6C7B2] hover:bg-stone-50 text-xs font-semibold text-stone-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Link Copied' : 'Copy Group Link'}</span>
              </button>
            </div>

            <a
              href="/images/whatsapp_qr.jpg"
              download="sri-laxmi-narshima-whatsapp-group-qr.jpg"
              className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download WhatsApp QR Image</span>
            </a>
          </div>
        )}

        {/* TAB 2: Visiting Card Digital Showroom QR */}
        {activeTab === 'website' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-[#E7DFD5]">
              <div className="p-3 bg-white rounded-xl shadow-inner border-2 border-dashed border-[#D4AF37] inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/visiting_card_qr.jpg"
                  alt="Showroom Visiting Card Back QR Code"
                  className="w-48 h-48 sm:w-52 sm:h-52 mx-auto object-contain block"
                />
              </div>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-[#800020]">
                <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Back of Visiting Card QR</span>
              </div>
              <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                Scan with any mobile camera to open our live digital saree showroom:
              </p>
              <div className="mt-1.5 px-2.5 py-1.5 bg-[#FAF7F2] rounded-lg border border-[#E7DFD5] text-[11px] font-mono font-medium text-[#800020] truncate">
                {websiteUrl}
              </div>
            </div>

            {/* Action Buttons for Visiting Card */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Open Showroom</span>
                <ExternalLink className="w-3 h-3 opacity-75" />
              </a>

              <button
                type="button"
                onClick={() => handleCopy(websiteUrl)}
                className="py-2.5 px-3 rounded-xl bg-white border border-[#D6C7B2] hover:bg-stone-50 text-xs font-semibold text-stone-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Link Copied' : 'Copy Website Link'}</span>
              </button>
            </div>

            <div className="flex gap-2">
              <a
                href="/images/visiting_card_qr.jpg"
                download="visiting-card-back-qr.jpg"
                className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download QR Image</span>
              </a>

              <button
                type="button"
                onClick={handleShare}
                className="flex-1 py-2 px-3 rounded-xl bg-[#FAF7F2] border border-[#D6C7B2] hover:bg-stone-200 text-stone-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#800020]" />
                <span>Share with Friends</span>
              </button>
            </div>
          </div>
        )}

        <div className="pt-1 flex items-center justify-center gap-2 text-[10px] text-stone-400 border-t border-stone-200">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Authentic Pochampally Silk Handlooms Direct From Weavers</span>
        </div>

      </div>
    </div>
  );
}
