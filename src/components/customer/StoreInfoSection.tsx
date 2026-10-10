'use client';

import React from 'react';
import { MapPin, Phone, MessageCircle, Clock, Navigation, ExternalLink, QrCode } from 'lucide-react';
import { ShopSettings } from '@/lib/types';

interface StoreInfoSectionProps {
  settings: ShopSettings;
  onOpenQr?: () => void;
}

export default function StoreInfoSection({ settings, onOpenQr }: StoreInfoSectionProps) {
  return (
    <section id="store" className="py-16 md:py-24 bg-[#F4ECE1]/40 border-b border-[#E7DFD5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#A67C1E] font-bold block mb-2">
            Experience Handloom In Person
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1C1917] mb-3">
            Visit Our Showroom & Weaving Loom
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#800020] to-transparent mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-[#57534E]">
            We invite you to touch and feel pure mulberry silk, witness authentic master weavers on pit looms, and choose from hundreds of exclusive Pochampally sarees.
          </p>
        </div>

        {/* Two-Column Grid: Information Cards + Google Maps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Store Details */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DFD5] shadow-md space-y-6">
              
              {/* Store Title */}
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#800020]">
                  {settings.shop_name}
                </h3>
                <p className="text-xs text-[#A67C1E] font-medium tracking-wide uppercase mt-1">
                  Flagship Store & Artisan Weaving Facility
                </p>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-[#800020] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-[#78716C] font-semibold uppercase tracking-wider block">
                    Physical Address
                  </span>
                  <p className="text-sm font-medium text-[#1C1917] mt-0.5 leading-relaxed">
                    {settings.address}
                  </p>
                </div>
              </div>

              {/* Timings */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-[#800020] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-[#78716C] font-semibold uppercase tracking-wider block">
                    Showroom Timings
                  </span>
                  <p className="text-sm font-medium text-[#1C1917] mt-0.5">
                    {settings.opening_hours}
                  </p>
                </div>
              </div>

              {/* Contact Numbers */}
              <div className="pt-2 border-t border-[#F3ECE2] space-y-3">
                <div className="flex items-center justify-between">
                  <a
                    href={`tel:${settings.phone}`}
                    className="flex items-center gap-2 text-sm font-semibold text-[#800020] hover:text-[#660019]"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{settings.phone}</span>
                  </a>
                  <span className="text-xs text-[#78716C]">Call directly</span>
                </div>

                <div className="flex items-center justify-between">
                  <a
                    href={`https://wa.me/${settings.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-semibold text-[#1EBE5D] hover:text-[#189b4b]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Support</span>
                  </a>
                  <span className="text-xs text-[#78716C]">Instant replies</span>
                </div>
              </div>

            </div>

            {/* Direct Directions CTA Button */}
            <a
              href={settings.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-2xl bg-[#800020] hover:bg-[#660019] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 group"
            >
              <Navigation className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              <span>Get Google Maps Directions</span>
              <ExternalLink className="w-4 h-4 opacity-75" />
            </a>

            {/* Preserved QR Code Action */}
            {onOpenQr && (
              <button
                type="button"
                onClick={onOpenQr}
                className="w-full py-3 px-4 rounded-2xl bg-white border border-[#D4AF37] hover:bg-[#FAF7F2] text-[#800020] font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-[#D4AF37]" />
                <span>Show Visiting Card & WhatsApp QR Codes</span>
              </button>
            )}
          </div>

          {/* Right Column: Google Maps Interactive Embed Frame */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden shadow-lg border-2 border-[#E7DFD5] bg-white min-h-[350px] relative">
            {settings.google_maps_embed ? (
              <iframe
                src={settings.google_maps_embed}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '380px' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Store Location Map"
                className="w-full h-full"
              ></iframe>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-stone-100 min-h-[350px]">
                <MapPin className="w-12 h-12 text-[#800020] mb-3" />
                <h4 className="font-serif font-bold text-lg text-stone-800">
                  {settings.shop_name}
                </h4>
                <p className="text-xs text-stone-600 max-w-sm mt-1">
                  {settings.address}
                </p>
                <a
                  href={settings.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 px-5 py-2.5 rounded-full bg-[#800020] text-white text-xs font-semibold"
                >
                  Open in Google Maps
                </a>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
