'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Phone, 
  MessageCircle, 
  QrCode,
  Menu, 
  X, 
  MapPin, 
  ShieldCheck, 
  Lock
} from 'lucide-react';
import { ShopSettings } from '@/lib/types';

interface NavbarProps {
  settings: ShopSettings;
  onOpenQr?: () => void;
}

export default function Navbar({ settings, onOpenQr }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Recommended clean navigation: Home | Collections | Heritage | Contact
  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'Collections', href: '#collections' },
    { label: 'Heritage', href: '#about' },
    { label: 'Craft Process', href: '#process' },
    { label: 'Visit Store', href: '#store' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      {/* Top Banner with Silk Mark Handloom Certification */}
      <div className="bg-[#800020] text-[#FAF7F2] text-xs py-2 px-4 text-center border-b border-[#D4AF37]/30 flex items-center justify-between sm:justify-center gap-4">
        <div className="flex items-center gap-2 mx-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="tracking-wider uppercase font-medium text-[11px] sm:text-xs">
            100% Authentic Handloom • Silk Mark Certified • Bhoodan Pochampally
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs font-light text-[#F7E7B4]">
          <span>Mon-Sun: 9:30 AM - 8:30 PM</span>
          <span>•</span>
          <a href={`tel:${settings.phone}`} className="hover:underline flex items-center gap-1 font-medium">
            <Phone className="w-3 h-3 text-[#D4AF37]" /> {settings.phone}
          </a>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E7DFD5] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo / Shop Name */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#800020] to-[#550015] border-2 border-[#D4AF37] flex items-center justify-center shadow-md text-[#D4AF37] font-serif font-bold text-xs sm:text-sm tracking-wider group-hover:scale-105 transition-transform shrink-0">
                <span>SLN</span>
              </div>
              <div className="overflow-hidden">
                <span className="block font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#800020] group-hover:text-[#660019] truncate">
                  {settings.shop_name}
                </span>
                <span className="block text-[10px] sm:text-xs text-[#A67C1E] tracking-widest uppercase font-medium truncate">
                  Bhoodan Pochampally • Telangana
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-semibold tracking-wide text-[#2B2625] hover:text-[#800020] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#800020] hover:after:w-full after:transition-all"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Header Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Preserved Visiting Card QR Code Button */}
              {onOpenQr && (
                <button
                  onClick={onOpenQr}
                  title="Show Visiting Card & WhatsApp QR Codes"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#800020] bg-white border border-[#D4AF37] rounded-full hover:bg-[#800020] hover:text-white transition-all shadow-xs cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-[#D4AF37]" />
                  <span className="hidden sm:inline">Visiting & WhatsApp QR</span>
                </button>
              )}

              {/* WhatsApp Quick Action */}
              <a
                href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
                  `Hello ${settings.shop_name}, I am visiting your website and would like assistance viewing your Pochampally saree collections.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] rounded-full shadow-sm transition-all hover:scale-105"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>

              {/* Direct Call Button */}
              <a
                href={`tel:${settings.phone}`}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#800020] bg-white border border-[#D4AF37]/50 rounded-full hover:bg-[#800020] hover:text-white transition-all shadow-xs"
                title="Call Showroom"
              >
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Call Us</span>
              </a>

              {/* Shop Owner Admin Link (Discreet) */}
              <Link
                href="/admin"
                title="Shop Owner Admin"
                className="p-2 text-[#78716C] hover:text-[#800020] hover:bg-[#F3ECE2] rounded-full transition-colors"
                aria-label="Admin Login"
              >
                <Lock className="w-4 h-4" />
              </Link>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-[#2B2625] hover:text-[#800020] focus:outline-none cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FAF7F2] border-b border-[#E7DFD5] px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top duration-200">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-base font-semibold text-[#1C1917] hover:bg-[#800020] hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            
            <div className="pt-3 border-t border-[#E7DFD5] flex flex-col gap-2">
              {onOpenQr && (
                <button
                  onClick={() => {
                    onOpenQr();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#800020] font-bold text-left cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-[#D4AF37]" /> Show Visiting & WhatsApp QRs
                </button>
              )}
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#800020] font-bold"
              >
                <Phone className="w-4 h-4 text-[#D4AF37]" /> Call: {settings.phone}
              </a>
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#25D366] font-bold"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp Us
              </a>
              <div className="flex items-center gap-2 px-3 py-1 text-xs text-[#57534E]">
                <MapPin className="w-3.5 h-3.5 text-[#800020]" /> Bhoodan Pochampally, Telangana
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
