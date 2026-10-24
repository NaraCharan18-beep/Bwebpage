'use client';

import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Store,
  Sparkles,
  BookOpen,
  ListOrdered,
  FolderTree, 
  Phone, 
  Settings, 
  Inbox, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { ShopSettings } from '@/lib/types';

export type AdminTab = 
  | 'dashboard'
  | 'collections'
  | 'shop'
  | 'homepage'
  | 'about'
  | 'steps'
  | 'contact'
  | 'settings'
  | 'enquiries'
  | 'albums'
  | 'saree-details';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  settings: ShopSettings;
  onLogout: () => void;
  collectionCount: number;
  albumCount: number;
  enquiryCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export default function AdminSidebar({
  currentTab,
  onTabChange,
  settings,
  onLogout,
  collectionCount,
  enquiryCount,
  isOpenMobile,
  onCloseMobile,
}: AdminSidebarProps) {
  const menuItems: { 
    id: AdminTab; 
    label: string; 
    icon: React.ElementType; 
    badge?: number | string;
    section?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'collections', 
      label: 'Collections & Sarees', 
      icon: FolderTree, 
      badge: collectionCount, 
      section: 'Saree Catalog' 
    },
    { id: 'enquiries', label: 'Customer Enquiries', icon: Inbox, badge: enquiryCount > 0 ? enquiryCount : undefined },
    { id: 'shop', label: 'Shop Information', icon: Store, section: 'Website Content' },
    { id: 'homepage', label: 'Homepage Banner', icon: Sparkles },
    { id: 'about', label: 'About Pochampally', icon: BookOpen },
    { id: 'contact', label: 'Contact Information', icon: Phone, section: 'Settings' },
    { id: 'settings', label: 'Security & PIN', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-[#1C1917] text-[#FAF7F2] border-r border-stone-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Shop Brand */}
        <div className="p-5 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#800020] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-serif font-bold text-xs tracking-wider shrink-0">
              SLN
            </div>
            <div className="overflow-hidden">
              <span className="block font-serif text-base font-bold text-[#FAF7F2] truncate">
                {settings.shop_name}
              </span>
              <span className="block text-[11px] text-[#A67C1E] uppercase tracking-wider font-semibold">
                Shop Admin Area
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action: + Create Collection Button */}
        <div className="px-4 pt-3 pb-1">
          <button
            onClick={() => {
              onTabChange('collections');
              onCloseMobile();
              // trigger create collection modal if possible
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('open-create-collection-modal'));
              }
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>+ Create Collection</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-none">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === 'collections' && (currentTab === 'albums' || currentTab === 'saree-details'));

            return (
              <React.Fragment key={item.id}>
                {item.section && (
                  <div className={`text-[10px] font-bold text-stone-400 uppercase tracking-widest px-3 ${idx === 0 ? 'py-1' : 'pt-4 pb-1.5'}`}>
                    {item.section}
                  </div>
                )}

                <button
                  onClick={() => {
                    onTabChange(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#800020] text-white shadow-md'
                      : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-stone-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-[#D4AF37] text-[#1C1917]'
                          : 'bg-stone-800 text-stone-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-xs font-semibold text-[#D4AF37] border border-stone-700/60 transition-colors"
          >
            <span>View Customer Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={onLogout}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-stone-400 hover:text-rose-400 hover:bg-stone-900 transition-colors text-center cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
