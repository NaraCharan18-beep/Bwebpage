'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  Tag, 
  Search, 
  Filter, 
  Edit3, 
  CheckCircle2, 
  X, 
  Sparkles, 
  AlertCircle,
  Layers,
  Images
} from 'lucide-react';
import { Album, AlbumPhoto, Collection, PhotoDetails } from '@/lib/types';

interface OptionalSareeDetailsTabProps {
  albums: Album[];
  collections: Collection[];
  onSaveAlbum: (album: Album) => Promise<void>;
}

export default function OptionalSareeDetailsTab({
  albums,
  collections,
  onSaveAlbum,
}: OptionalSareeDetailsTabProps) {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('all');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'with-details' | 'photo-only'>('all');
  const [search, setSearch] = useState('');

  // Active editing modal state
  const [editingTarget, setEditingTarget] = useState<{
    album: Album;
    photo: AlbumPhoto;
  } | null>(null);

  const [detailName, setDetailName] = useState('');
  const [detailCode, setDetailCode] = useState('');
  const [detailColor, setDetailColor] = useState('');
  const [detailAvailability, setDetailAvailability] = useState<'available' | 'sold' | 'sold_out' | 'in_stock' | 'made_to_order'>('in_stock');
  const [detailDesc, setDetailDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Flatten all photos with album references
  const allPhotosWithAlbum = useMemo(() => {
    const list: { album: Album; photo: AlbumPhoto }[] = [];
    albums.forEach((alb) => {
      alb.photos.forEach((ph) => {
        list.push({ album: alb, photo: ph });
      });
    });
    return list;
  }, [albums]);

  // Filtered Photos List
  const filteredPhotos = useMemo(() => {
    return allPhotosWithAlbum.filter(({ album, photo }) => {
      // Collection Filter
      if (selectedCollectionId !== 'all' && album.collection_id !== selectedCollectionId) {
        return false;
      }
      // Album Filter
      if (selectedAlbumId !== 'all' && album.id !== selectedAlbumId) {
        return false;
      }
      // Status Filter
      const hasDetails = Boolean(
        photo.details?.saree_name || 
        photo.details?.code ||
        photo.details?.saree_code || 
        photo.details?.color
      );
      if (filterMode === 'with-details' && !hasDetails) return false;
      if (filterMode === 'photo-only' && hasDetails) return false;

      // Search Filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = (photo.details?.saree_name || photo.caption || '').toLowerCase().includes(q);
        const matchesCode = (photo.details?.code || photo.details?.saree_code || '').toLowerCase().includes(q);
        const matchesAlbum = album.name.toLowerCase().includes(q);
        const matchesColor = (photo.details?.color || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesAlbum && !matchesColor) return false;
      }

      return true;
    });
  }, [allPhotosWithAlbum, selectedCollectionId, selectedAlbumId, filterMode, search]);

  const handleOpenEditDetails = (album: Album, photo: AlbumPhoto) => {
    setEditingTarget({ album, photo });
    setDetailName(photo.details?.saree_name || photo.caption || '');
    setDetailCode(photo.details?.code || photo.details?.saree_code || '');
    setDetailColor(photo.details?.color || '');
    setDetailAvailability(photo.details?.availability || 'in_stock');
    setDetailDesc(photo.details?.description || '');
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;

    setIsSaving(true);
    try {
      const { album, photo } = editingTarget;

      const hasAnyDetail = Boolean(
        detailName.trim() || 
        detailCode.trim() || 
        detailColor.trim() || 
        detailDesc.trim()
      );

      const updatedDetails: PhotoDetails | undefined = hasAnyDetail
        ? {
            saree_name: detailName.trim() || undefined,
            price: null, // Price tags disabled
            code: detailCode.trim() || undefined,
            saree_code: detailCode.trim() || undefined,
            color: detailColor.trim() || undefined,
            availability: detailAvailability,
            description: detailDesc.trim() || undefined,
          }
        : undefined;

      const updatedPhotos = album.photos.map((p) => {
        if (p.id === photo.id) {
          return {
            ...p,
            caption: detailName.trim() || p.caption,
            details: updatedDetails,
          };
        }
        return p;
      });

      const updatedAlbum: Album = {
        ...album,
        photos: updatedPhotos,
        updated_at: new Date().toISOString(),
      };

      await onSaveAlbum(updatedAlbum);
      setSuccessToast(`Saved details for saree in "${album.name}"`);
      setTimeout(() => setSuccessToast(''), 3000);
      setEditingTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearDetails = async () => {
    if (!editingTarget) return;
    setIsSaving(true);
    try {
      const { album, photo } = editingTarget;
      const updatedPhotos = album.photos.map((p) => {
        if (p.id === photo.id) {
          const { details, ...rest } = p;
          return rest;
        }
        return p;
      });

      const updatedAlbum: Album = {
        ...album,
        photos: updatedPhotos,
        updated_at: new Date().toISOString(),
      };

      await onSaveAlbum(updatedAlbum);
      setSuccessToast('Cleared optional details. Saree is now photo-only.');
      setTimeout(() => setSuccessToast(''), 3000);
      setEditingTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-[#E7DFD5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag className="w-5 h-5 text-[#800020]" />
            <h2 className="font-serif text-xl font-bold text-[#1C1917]">
              Optional Saree Details
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            Add optional saree name, item code, color, or availability to individual saree photos whenever you want. Price tags are removed from all customer pages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-stone-700 font-semibold flex items-center gap-1.5">
            <Images className="w-4 h-4 text-[#800020]" />
            <span>{allPhotosWithAlbum.length} Total Saree Photos</span>
          </span>
        </div>
      </div>

      {/* Explanatory Callout */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#A67C1E] shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>No Price Tags Policy:</strong> As requested, price tags are completely hidden across all customer web pages and albums. 
          Customers browse your sarees and enquire directly via WhatsApp or Phone to visit your showroom or ask for availability.
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7DFD5] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, or color..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] focus:outline-none focus:border-[#800020] text-stone-900"
            />
          </div>

          {/* Collection Filter */}
          <select
            value={selectedCollectionId}
            onChange={(e) => {
              setSelectedCollectionId(e.target.value);
              setSelectedAlbumId('all');
            }}
            className="text-xs py-2 px-3 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] focus:outline-none text-stone-700"
          >
            <option value="all">All Cloth Types</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Album Filter */}
          <select
            value={selectedAlbumId}
            onChange={(e) => setSelectedAlbumId(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] focus:outline-none text-stone-700"
          >
            <option value="all">All Albums ({albums.length})</option>
            {albums
              .filter((a) => selectedCollectionId === 'all' || a.collection_id === selectedCollectionId)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.photos.length} photos)
                </option>
              ))}
          </select>

          {/* Detail Status Filter */}
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as any)}
            className="text-xs py-2 px-3 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] focus:outline-none text-stone-700"
          >
            <option value="all">Show All Saree Photos</option>
            <option value="with-details">Only with Code / Color Details</option>
            <option value="photo-only">Photo-Only (No details)</option>
          </select>

        </div>
      </div>

      {/* Saree Photos Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredPhotos.map(({ album, photo }) => {
          const parentCol = collections.find((c) => c.id === album.collection_id);
          const hasDetails = Boolean(
            photo.details?.saree_name || 
            photo.details?.code ||
            photo.details?.saree_code || 
            photo.details?.color
          );

          return (
            <div
              key={`${album.id}-${photo.id}`}
              className="bg-white rounded-2xl overflow-hidden border border-[#E7DFD5] hover:border-[#D4AF37] shadow-xs flex flex-col justify-between transition-all"
            >
              {/* Photo Image Box */}
              <div className="relative aspect-[3/4] w-full bg-stone-100 group">
                <Image
                  src={photo.url}
                  alt={photo.details?.saree_name || photo.caption || 'Saree photo'}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                />

                {/* Cover badge if cover */}
                {photo.is_cover && (
                  <span className="absolute top-2 left-2 text-[9px] px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#1C1917] font-bold shadow">
                    ★ COVER
                  </span>
                )}

                {/* Details badge */}
                <div className="absolute bottom-2 left-2 right-2">
                  {hasDetails ? (
                    <span className="inline-block text-[10px] px-2 py-0.5 rounded-md font-bold bg-[#800020] text-white shadow truncate max-w-full">
                      {photo.details?.code || photo.details?.saree_code || 'Details Set'}
                    </span>
                  ) : (
                    <span className="inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold bg-stone-900/60 backdrop-blur-xs text-stone-200">
                      Photo Only
                    </span>
                  )}
                </div>
              </div>

              {/* Card Meta & Action */}
              <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 block truncate font-medium">
                    {parentCol?.name || 'Collection'} • {album.name}
                  </span>

                  <h4 className="text-xs font-serif font-bold text-stone-900 truncate mt-0.5">
                    {photo.details?.saree_name || photo.caption || 'Handloom Saree'}
                  </h4>

                  {(photo.details?.code || photo.details?.saree_code) && (
                    <span className="text-[10px] font-mono text-stone-500 block truncate">
                      Code: {photo.details?.code || photo.details?.saree_code}
                    </span>
                  )}

                  {photo.details?.color && (
                    <span className="text-[10px] text-stone-500 block truncate">
                      Color: {photo.details.color}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleOpenEditDetails(album, photo)}
                  className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors ${
                    hasDetails
                      ? 'bg-[#FAF7F2] hover:bg-stone-200 text-[#800020] border border-[#E7DFD5]'
                      : 'bg-[#800020] hover:bg-[#660019] text-white shadow-xs'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{hasDetails ? 'Edit Details' : '+ Add Details'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E7DFD5] max-w-md mx-auto space-y-3">
          <Tag className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-stone-800">No Sarees Matched Filter</h3>
          <p className="text-xs text-stone-500">
            Try adjusting your search query, collection, or album selection above.
          </p>
          <button
            onClick={() => {
              setSelectedCollectionId('all');
              setSelectedAlbumId('all');
              setFilterMode('all');
              setSearch('');
            }}
            className="px-4 py-2 rounded-full bg-[#800020] text-white text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT OPTIONAL SAREE DETAILS MODAL                        */}
      {/* ======================================================== */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="fixed inset-0" onClick={() => setEditingTarget(null)}></div>

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E7DFD5] overflow-hidden my-auto z-10 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E7DFD5] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#800020]">
                  Optional Saree Details
                </h3>
                <p className="text-xs text-stone-500">
                  Album: <strong>{editingTarget.album.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setEditingTarget(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Saree Photo Thumbnail Preview */}
            <div className="flex items-center gap-4 bg-[#FAF7F2] p-3 rounded-2xl border border-[#E7DFD5]">
              <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                <Image
                  src={editingTarget.photo.url}
                  alt="Saree preview"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="text-xs space-y-1">
                <span className="font-semibold text-stone-800 block">
                  Photo #{editingTarget.photo.order} in Album
                </span>
                <span className="text-stone-500 block">
                  Add optional details below. Note: Price tags are completely disabled.
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Saree Name / Title (Optional)
                </label>
                <input
                  type="text"
                  value={detailName}
                  onChange={(e) => setDetailName(e.target.value)}
                  placeholder="e.g. Royal Peacock Blue Double Ikat Saree"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Saree Code / SKU (Optional)
                  </label>
                  <input
                    type="text"
                    value={detailCode}
                    onChange={(e) => setDetailCode(e.target.value)}
                    placeholder="e.g. SLN-042"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Color / Shade (Optional)
                  </label>
                  <input
                    type="text"
                    value={detailColor}
                    onChange={(e) => setDetailColor(e.target.value)}
                    placeholder="e.g. Turmeric Gold & Crimson Red"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Stock Availability
                </label>
                <select
                  value={detailAvailability}
                  onChange={(e) => setDetailAvailability(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                >
                  <option value="in_stock">In Showroom (Ready for customer)</option>
                  <option value="made_to_order">Made to Order (Weaving time required)</option>
                  <option value="sold_out">Sold Out / Archive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Craft / Weave Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={detailDesc}
                  onChange={(e) => setDetailDesc(e.target.value)}
                  placeholder="e.g. Woven using 8-ply pure mulberry silk warp and weft, featuring Pagdu Bandhu chowka geometric patterns..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-[#E7DFD5] flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleClearDetails}
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  Clear Details (Keep Photo Only)
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTarget(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Saree Details'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
