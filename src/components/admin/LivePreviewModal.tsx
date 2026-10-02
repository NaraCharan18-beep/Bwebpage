'use client';

import React, { useState } from 'react';
import { X, Smartphone, Monitor, ExternalLink, RotateCw } from 'lucide-react';

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LivePreviewModal({ isOpen, onClose }: LivePreviewModalProps) {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
  const [key, setKey] = useState(0);

  if (!isOpen) return null;

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-6xl h-[94vh] bg-[#1C1917] rounded-3xl overflow-hidden shadow-2xl border border-stone-700 flex flex-col z-10">
        
        {/* Preview Control Bar */}
        <div className="bg-[#2A2524] px-4 py-3 border-b border-stone-800 flex items-center justify-between text-xs text-stone-200">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-sm text-[#D4AF37]">
              Customer Showroom Live Preview
            </span>
            <span className="text-[11px] text-stone-400 hidden sm:inline">
              Simulates visiting card QR scan
            </span>
          </div>

          {/* Device Toggles */}
          <div className="flex items-center gap-1.5 bg-stone-800 p-1 rounded-xl">
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                deviceMode === 'mobile'
                  ? 'bg-[#800020] text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Phone</span>
            </button>

            <button
              onClick={() => setDeviceMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                deviceMode === 'desktop'
                  ? 'bg-[#800020] text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Full Desktop</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-700"
              title="Refresh Preview"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-stone-400 hover:text-[#D4AF37] rounded-lg hover:bg-stone-700"
              title="Open full page in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-700"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Frame Area */}
        <div className="flex-1 bg-stone-900 overflow-hidden flex items-center justify-center p-3 sm:p-6">
          <div
            className={`transition-all duration-300 h-full overflow-hidden bg-white shadow-2xl relative ${
              deviceMode === 'mobile'
                ? 'w-[390px] max-w-full rounded-[40px] border-[10px] border-stone-800 ring-2 ring-stone-700'
                : 'w-full rounded-xl border border-stone-700'
            }`}
          >
            {/* Simulated iPhone notch/island for mobile mode */}
            {deviceMode === 'mobile' && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-stone-800 rounded-full z-20 pointer-events-none"></div>
            )}

            <iframe
              key={key}
              src="/"
              title="Live Customer Website"
              className="w-full h-full border-0"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
