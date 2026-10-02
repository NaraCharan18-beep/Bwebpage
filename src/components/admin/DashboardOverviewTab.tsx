'use client';

import React from 'react';
import Image from 'next/image';
import { 
  FolderTree, 
  Images, 
  Camera, 
  Sparkles, 
  Star, 
  Inbox, 
  Plus, 
  ArrowUpRight, 
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { AdminMetrics, Collection, Album, ShopSettings } from '@/lib/types';
import { AdminTab } from './AdminSidebar';

interface DashboardOverviewTabProps {
  metrics: AdminMetrics;
  recentAlbums: Album[];
  collections: Collection[];
  settings: ShopSettings;
  onNavigateTab: (tab: AdminTab) => void;
  onOpenCreateAlbum: () => void;
  onOpenCreateCollection: () => void;
  onOpenManageAlbum: (album: Album) => void;
}

export default function DashboardOverviewTab({
  metrics,
  recentAlbums,
  collections,
  settings,
  onNavigateTab,
  onOpenCreateAlbum,
  onOpenCreateCollection,
  onOpenManageAlbum,
}: DashboardOverviewTabProps) {
  const statCards = [
    {
      title: 'Collections (Cloth Types)',
      value: metrics.totalCollections,
      desc: 'e.g. Cotton, Sico, Pure Silk',
      icon: FolderTree,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      action: () => onNavigateTab('collections'),
    },
    {
      title: 'Photo Albums',
      value: metrics.totalAlbums,
      desc: 'Catalog lines created',
      icon: Images,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      action: () => onNavigateTab('albums'),
    },
    {
      title: 'Total Saree Photos',
      value: metrics.totalPhotos,
      desc: 'Real photographs uploaded',
      icon: Camera,
      color: 'text-[#800020] bg-rose-50 border-rose-200',
      action: () => onNavigateTab('albums'),
    },
    {
      title: 'Active Public Albums',
      value: metrics.activeAlbums,
      desc: 'Visible to QR customers',
      icon: CheckCircle2,
      color: 'text-green-700 bg-green-50 border-green-200',
      action: () => onNavigateTab('albums'),
    },
    {
      title: 'Featured Albums',
      value: metrics.featuredAlbums,
      desc: 'Highlighted on storefront',
      icon: Star,
      color: 'text-purple-700 bg-purple-50 border-purple-200',
      action: () => onNavigateTab('albums'),
    },
    {
      title: 'Customer Enquiries',
      value: metrics.totalEnquiries,
      desc: 'WhatsApp & Form requests',
      icon: Inbox,
      color: 'text-teal-700 bg-teal-50 border-teal-200',
      action: () => onNavigateTab('enquiries'),
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#800020] via-[#5c0017] to-[#1C1917] rounded-3xl p-6 sm:p-8 text-[#FAF7F2] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-xs uppercase tracking-widest text-[#F7E7B4] font-semibold">
            Album-Based Saree Showroom Control
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">
            Namaste, {settings.shop_name}
          </h2>
          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-light">
            Upload multiple real saree photographs in batches without creating individual products. Organize your showroom by custom cloth types (e.g. Cotton, Sico, Pure Silk) and create dedicated photo albums for each new arrival.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={onOpenCreateAlbum}
              className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#bfa02f] text-[#1C1917] text-xs font-bold shadow transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Photo Album</span>
            </button>
            <button
              onClick={onOpenCreateCollection}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
            >
              + Add Cloth / Collection Type
            </button>
            <button
              onClick={() => onNavigateTab('settings')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
            >
              Update Store & WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div>
        <h3 className="font-serif text-lg font-bold text-[#1C1917] mb-4">
          Showroom At A Glance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={card.action}
                className="bg-white rounded-2xl p-4 border border-[#E7DFD5] shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${card.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#800020] transition-colors" />
                </div>
                <div>
                  <span className="font-serif text-2xl font-bold text-[#1C1917] block leading-none mb-1">
                    {card.value}
                  </span>
                  <span className="text-xs font-semibold text-stone-800 block truncate">
                    {card.title}
                  </span>
                  <span className="text-[10px] text-stone-400 block truncate">
                    {card.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Shortcuts */}
      <div className="bg-white rounded-2xl p-6 border border-[#E7DFD5] shadow-xs space-y-3">
        <h3 className="font-serif text-base font-bold text-[#1C1917]">
          Management Shortcuts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateTab('collections')}
            className="p-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#800020] text-stone-700 hover:text-white border border-[#E7DFD5] transition-all text-left group"
          >
            <span className="block text-xs font-bold group-hover:text-white">Cloth Types</span>
            <span className="block text-[11px] text-stone-500 group-hover:text-stone-200">Cotton, Sico, Silk Mix...</span>
          </button>

          <button
            onClick={() => onNavigateTab('albums')}
            className="p-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#800020] text-stone-700 hover:text-white border border-[#E7DFD5] transition-all text-left group"
          >
            <span className="block text-xs font-bold group-hover:text-white">Photo Albums</span>
            <span className="block text-[11px] text-stone-500 group-hover:text-stone-200">Batch upload & cover select</span>
          </button>

          <button
            onClick={() => onNavigateTab('homepage')}
            className="p-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#800020] text-stone-700 hover:text-white border border-[#E7DFD5] transition-all text-left group"
          >
            <span className="block text-xs font-bold group-hover:text-white">Homepage Hero</span>
            <span className="block text-[11px] text-stone-500 group-hover:text-stone-200">Change headline & banner</span>
          </button>

          <button
            onClick={() => onNavigateTab('settings')}
            className="p-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#800020] text-stone-700 hover:text-white border border-[#E7DFD5] transition-all text-left group"
          >
            <span className="block text-xs font-bold group-hover:text-white">Store & Phone</span>
            <span className="block text-[11px] text-stone-500 group-hover:text-stone-200">Timings, WhatsApp, map</span>
          </button>
        </div>
      </div>

      {/* Saree Albums Showcase Table */}
      <div className="bg-white rounded-2xl border border-[#E7DFD5] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E7DFD5] flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#1C1917]">
              Current Saree Photo Albums
            </h3>
            <p className="text-xs text-stone-500">
              Albums active on your customer showroom
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('albums')}
            className="text-xs font-semibold text-[#800020] hover:underline"
          >
            View All ({recentAlbums.length}) →
          </button>
        </div>

        {recentAlbums.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-stone-600 border-b border-[#E7DFD5] uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Album Cover</th>
                  <th className="py-3 px-4">Album Name</th>
                  <th className="py-3 px-4">Cloth Collection</th>
                  <th className="py-3 px-4">Photos</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DFD5]">
                {recentAlbums.map((album) => {
                  const col = collections.find((c) => c.id === album.collection_id);

                  return (
                    <tr key={album.id} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                          <Image
                            src={album.cover_image || '/images/hero_saree.jpg'}
                            alt={album.name}
                            fill
                            className="object-cover object-top"
                          />
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-stone-900 block truncate max-w-xs">
                          {album.name}
                        </span>
                        {album.code && (
                          <span className="text-[11px] text-stone-400 font-mono">
                            {album.code}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-stone-700">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E7DFD5] text-[11px] font-medium text-[#800020]">
                          {col?.name || 'General'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-stone-800">
                        {album.photos.length} photos
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            album.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {album.status === 'active' ? 'Active' : 'Hidden'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onOpenManageAlbum(album)}
                          className="px-3 py-1.5 rounded-lg bg-[#800020] text-white hover:bg-[#660019] text-[11px] font-semibold"
                        >
                          Manage Photos
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-stone-500 text-xs">
            No albums created yet. Click &quot;Create New Photo Album&quot; to add your first photo collection.
          </div>
        )}
      </div>

    </div>
  );
}
