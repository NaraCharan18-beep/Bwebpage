'use client';

import React from 'react';
import { Phone, MessageCircle, Clock, CheckCircle2, User, Inbox } from 'lucide-react';
import { Enquiry, ShopSettings } from '@/lib/types';

interface EnquiriesTabProps {
  enquiries: Enquiry[];
  settings: ShopSettings;
}

export default function EnquiriesTab({ enquiries, settings }: EnquiriesTabProps) {
  const getWhatsAppReplyUrl = (enq: Enquiry) => {
    const cleanPhone = enq.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = `Namaste ${enq.customer_name}, this is ${settings.shop_name} responding to your enquiry about ${enq.saree_name || 'our Pochampally silk saree collections'}. How may we assist you today?`;
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-[#E7DFD5] shadow-xs">
        <h2 className="font-serif text-xl font-bold text-[#1C1917]">
          Customer Enquiries & Consultations
        </h2>
        <p className="text-xs text-stone-500">
          Enquiries received from customers browsing the website via QR code or showroom links
        </p>
      </div>

      {enquiries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enquiries.map((enq) => (
            <div
              key={enq.id}
              className="bg-white rounded-2xl p-5 border border-[#E7DFD5] shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#800020]/10 text-[#800020] flex items-center justify-center font-bold text-xs">
                      {enq.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-900 text-sm">
                        {enq.customer_name}
                      </h4>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {enq.phone}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-stone-400">
                    {new Date(enq.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {enq.saree_name && (
                  <div className="p-2 rounded-lg bg-[#FAF7F2] border border-[#E7DFD5] text-xs mb-2">
                    <span className="text-stone-500 block text-[10px] uppercase font-bold">
                      Interested In:
                    </span>
                    <strong className="text-[#800020]">{enq.saree_name}</strong>
                    {enq.saree_sku && (
                      <span className="ml-2 font-mono text-stone-600">({enq.saree_sku})</span>
                    )}
                  </div>
                )}

                <p className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100 italic">
                  &ldquo;{enq.message}&rdquo;
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <a
                  href={`tel:${enq.phone}`}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#800020]" />
                  <span>Call</span>
                </a>

                <a
                  href={getWhatsAppReplyUrl(enq)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Reply on WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E7DFD5] space-y-3 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] text-stone-400 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-stone-800 text-base">
            No Enquiries Yet
          </h3>
          <p className="text-xs text-stone-500">
            When customers submit enquiries from your website or saree detail cards, they will appear here for instant WhatsApp follow-up.
          </p>
        </div>
      )}
    </div>
  );
}
