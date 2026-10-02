'use client';

import React, { useState } from 'react';
import { Send, Phone, MessageCircle, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { ShopSettings } from '@/lib/types';
import { submitEnquiry } from '@/lib/data-store';

interface ContactSectionProps {
  settings: ShopSettings;
}

export default function ContactSection({ settings }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sareeInterest, setSareeInterest] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    try {
      await submitEnquiry({
        customer_name: name,
        phone: phone,
        saree_name: sareeInterest || undefined,
        message: message || 'Customer requested consultation / availability enquiry.',
      });
      setIsSuccess(true);
    } catch (err) {
      console.error('Error submitting enquiry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendWhatsAppDirect = () => {
    const text = `Hello ${settings.shop_name},\nName: ${name || 'Customer'}\nPhone: ${phone || 'N/A'}\nInterest: ${sareeInterest || 'Pochampally Silk Sarees'}\nMessage: ${message || 'I would like to enquire about saree availability.'}`;
    window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-[#FAF7F2] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#A67C1E] font-bold block mb-2">
            We Are Here To Assist You
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1C1917] mb-3">
            Get in Touch With Our Master Weavers
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#800020] to-transparent mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-[#57534E]">
            Have a custom color requirement, need bridal consultation, or looking for specific double Ikat designs? Send us a message or connect directly.
          </p>
        </div>

        {/* Form and Quick Contact Cards */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Quick Contact Options */}
          <div className="md:col-span-5 space-y-4">
            
            {/* WhatsApp Card */}
            <a
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-5 rounded-2xl border border-[#E7DFD5] hover:border-[#1EBE5D] shadow-xs hover:shadow-md transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 text-[#1EBE5D] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-[#78716C] uppercase font-bold tracking-wider block">
                  Quick Enquiry
                </span>
                <span className="font-serif font-bold text-base text-[#1C1917] group-hover:text-[#1EBE5D] transition-colors block">
                  Chat on WhatsApp
                </span>
                <span className="text-xs text-[#78716C]">Fast video call & photos</span>
              </div>
            </a>

            {/* Direct Phone Call Card */}
            <a
              href={`tel:${settings.phone}`}
              className="bg-white p-5 rounded-2xl border border-[#E7DFD5] hover:border-[#800020] shadow-xs hover:shadow-md transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#800020]/10 text-[#800020] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-[#78716C] uppercase font-bold tracking-wider block">
                  Speak with Showroom
                </span>
                <span className="font-serif font-bold text-base text-[#1C1917] group-hover:text-[#800020] transition-colors block">
                  Call {settings.phone}
                </span>
                <span className="text-xs text-[#78716C]">9:30 AM to 8:30 PM</span>
              </div>
            </a>

            {/* Store Location Card */}
            <a
              href={settings.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-5 rounded-2xl border border-[#E7DFD5] hover:border-[#A67C1E] shadow-xs hover:shadow-md transition-all flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 text-[#A67C1E] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-[#78716C] uppercase font-bold tracking-wider block">
                  Visit in Person
                </span>
                <span className="font-serif font-bold text-base text-[#1C1917] group-hover:text-[#A67C1E] transition-colors block">
                  Bhoodan Pochampally
                </span>
                <span className="text-xs text-[#78716C]">Open all 7 days a week</span>
              </div>
            </a>

          </div>

          {/* Right Column: Enquiry Form */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E7DFD5] shadow-md">
            {isSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1C1917]">
                  Thank You, {name}!
                </h3>
                <p className="text-xs sm:text-sm text-[#57534E] max-w-sm mx-auto">
                  Your enquiry has been received by our store team. We will call or message you shortly.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                  <button
                    onClick={handleSendWhatsAppDirect}
                    className="px-5 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:bg-[#1EBE5D] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Open on WhatsApp</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setName('');
                      setPhone('');
                      setSareeInterest('');
                      setMessage('');
                    }}
                    className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#1C1917] mb-2">
                  Send Showroom Enquiry
                </h3>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#57534E] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Radhika Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-[#1C1917] focus:outline-none focus:border-[#800020]"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-[#57534E] mb-1">
                    Mobile / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98490 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-[#1C1917] focus:outline-none focus:border-[#800020]"
                  />
                </div>

                {/* Saree of Interest */}
                <div>
                  <label className="block text-xs font-semibold text-[#57534E] mb-1">
                    Saree Name or Collection (Optional)
                  </label>
                  <input
                    type="text"
                    value={sareeInterest}
                    onChange={(e) => setSareeInterest(e.target.value)}
                    placeholder="e.g. Bridal Double Ikat or SKU code"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-[#1C1917] focus:outline-none focus:border-[#800020]"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-[#57534E] mb-1">
                    Message or Questions (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what color or occasion you are looking for..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-[#1C1917] focus:outline-none focus:border-[#800020]"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Enquiry...' : 'Submit Enquiry'}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
