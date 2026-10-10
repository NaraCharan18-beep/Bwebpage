'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  MessageCircle, 
  Phone, 
  Send, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';
import { SareeItem, ShopSettings } from '@/lib/types';
import { submitEnquiry } from '@/lib/data-store';

interface SareeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sarees: SareeItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  collectionName: string;
  settings: ShopSettings;
}

export default function SareeDetailModal({
  isOpen,
  onClose,
  sarees,
  currentIndex,
  onIndexChange,
  collectionName,
  settings,
}: SareeDetailModalProps) {
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const saree = sarees[currentIndex];

  // Keyboard navigation: Escape to close, Left/Right arrows to flip photos
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && sarees.length > 1) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && sarees.length > 1) {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, sarees.length]);

  if (!isOpen || !saree) return null;

  const handleNext = () => {
    if (currentIndex < sarees.length - 1) {
      onIndexChange(currentIndex + 1);
    } else {
      onIndexChange(0); // loop to first
    }
    setShowCallbackForm(false);
    setSubmittedSuccess(false);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    } else {
      onIndexChange(sarees.length - 1); // loop to last
    }
    setShowCallbackForm(false);
    setSubmittedSuccess(false);
  };

  // WhatsApp Enquiry message pre-filled according to Requirement #8
  const whatsappMessage = `Hello ${settings.shop_name}, I am interested in this saree from your website:

• Collection: ${collectionName}
• Saree Code: ${saree.code || `Saree #${currentIndex + 1}`}
• Name: ${saree.name}

Could you please share price, availability, and ordering details? Thank you!`;

  const whatsappUrl = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

  // Handle Quick Callback Enquiry submission
  const handleSubmitCallback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim()) return;

    setIsSubmitting(true);
    try {
      await submitEnquiry({
        customer_name: customerName.trim() || 'Website Visitor',
        phone: customerPhone.trim(),
        saree_code: saree.code,
        collection_name: collectionName,
        saree_name: saree.name,
        message: customerMessage.trim() || `Interested in Saree Code: ${saree.code} (${collectionName})`,
      });
      setSubmittedSuccess(true);
      setCustomerPhone('');
      setCustomerName('');
      setCustomerMessage('');
    } catch (err) {
      console.error('Enquiry error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Background click to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-5xl max-h-[94vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-[#E7DFD5]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Floating Close Button for Mobile */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center shadow-lg md:hidden transition-transform active:scale-95"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Area: Large Saree Photo Viewer */}
        <div className="relative flex-1 bg-stone-900 min-h-[340px] sm:min-h-[460px] md:min-h-[580px] flex items-center justify-center select-none overflow-hidden group">
          <div className="relative w-full h-full aspect-[3/4] sm:aspect-auto">
            <Image
              src={saree.image_url}
              alt={saree.name}
              fill
              priority
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          </div>

          {/* Saree Counter Pill */}
          <div className="absolute top-4 left-4 z-20 bg-black/60 text-white text-xs px-3 py-1 rounded-full font-medium backdrop-blur-xs flex items-center gap-1.5 border border-white/20">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            <span>{currentIndex + 1} of {sarees.length} in {collectionName}</span>
          </div>

          {/* Previous Button */}
          {sarees.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-stone-900 flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95"
              aria-label="Previous Saree"
            >
              <ChevronLeft className="w-6 h-6 -ml-0.5" />
            </button>
          )}

          {/* Next Button */}
          {sarees.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-stone-900 flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95"
              aria-label="Next Saree"
            >
              <ChevronRight className="w-6 h-6 -mr-0.5" />
            </button>
          )}
        </div>

        {/* Right Area: Saree Details & Instant Enquiry */}
        <div className="w-full md:w-[380px] lg:w-[420px] bg-[#FAF7F2] p-6 sm:p-7 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[580px] border-t md:border-t-0 md:border-l border-[#E7DFD5]">
          
          {/* Header & Meta */}
          <div className="space-y-4">
            {/* Desktop Close Button */}
            <div className="hidden md:flex items-center justify-between pb-2 border-b border-[#E7DFD5]">
              <span className="text-[11px] uppercase tracking-widest text-[#A67C1E] font-bold">
                {collectionName}
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Saree Code Badge */}
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 bg-[#800020] text-[#FAF7F2] font-mono font-bold text-xs rounded-full shadow-xs">
                Code: {saree.code || `S-${currentIndex + 1}`}
              </span>
              {saree.availability === 'available' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  In Stock
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full">
                  Handloom Made-to-Order
                </span>
              )}
            </div>

            {/* Saree Title */}
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] leading-tight">
              {saree.name}
            </h2>

            {/* Optional Price Display */}
            {saree.show_price && saree.price ? (
              <div className="flex items-baseline gap-2 pt-1">
                <span className="font-serif text-2xl font-bold text-[#800020]">
                  ₹{saree.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-stone-500 font-medium">Direct Weaver Price</span>
              </div>
            ) : null}

            {/* Description */}
            {saree.description && (
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1">
                {saree.description}
              </p>
            )}

            {/* Saree Specifications Tags */}
            <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
              {saree.fabric && (
                <span className="px-2.5 py-1 bg-white rounded-lg border border-[#E7DFD5] text-stone-700 font-medium">
                  Fabric: {saree.fabric}
                </span>
              )}
              {saree.color && (
                <span className="px-2.5 py-1 bg-white rounded-lg border border-[#E7DFD5] text-stone-700 font-medium">
                  Color: {saree.color}
                </span>
              )}
              <span className="px-2.5 py-1 bg-white rounded-lg border border-[#E7DFD5] text-stone-700 font-medium">
                Pochampally Double Ikat
              </span>
            </div>
          </div>

          {/* Bottom Enquiry Actions (Requirement #7 & #8) */}
          <div className="pt-6 mt-6 border-t border-[#E7DFD5] space-y-3">
            <span className="block text-xs font-serif font-bold text-stone-900 tracking-wide">
              Interested in this saree?
            </span>

            {/* Main WhatsApp Enquiry Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Enquire on WhatsApp</span>
            </a>

            {/* Direct Call Button */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${settings.phone}`}
                className="py-2.5 px-3 rounded-full bg-white hover:bg-[#F3ECE2] text-[#800020] border border-[#D4AF37] text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Call Shop</span>
              </a>

              <button
                type="button"
                onClick={() => setShowCallbackForm(!showCallbackForm)}
                className="py-2.5 px-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Request Call</span>
              </button>
            </div>

            {/* Optional Quick Callback Form (For users who prefer leaving their phone) */}
            {showCallbackForm && (
              <div className="pt-2 animate-in fade-in duration-200">
                {submittedSuccess ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
                    <span className="block text-xs font-bold text-emerald-800">
                      Enquiry Received!
                    </span>
                    <span className="block text-[11px] text-emerald-600">
                      Our weaving team will contact you shortly about {saree.code}.
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitCallback} className="p-3 bg-white border border-[#E7DFD5] rounded-xl space-y-2">
                    <span className="block text-[11px] font-bold text-stone-700">
                      Leave your number for a quick callback:
                    </span>
                    <input
                      type="text"
                      placeholder="Your Name (Optional)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E7DFD5] rounded-lg focus:outline-none focus:border-[#800020]"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E7DFD5] rounded-lg focus:outline-none focus:border-[#800020]"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2 bg-[#800020] text-white text-xs font-bold rounded-lg hover:bg-[#660019] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3 h-3 text-[#D4AF37]" />
                      <span>{isSubmitting ? 'Sending...' : 'Submit Enquiry'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            <p className="text-[10px] text-stone-400 text-center pt-1">
              Direct handloom purchase • No commission or middlemen
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
