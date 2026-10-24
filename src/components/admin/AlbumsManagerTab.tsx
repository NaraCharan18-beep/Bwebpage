'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Upload, 
  Images, 
  Edit3, 
  Trash2, 
  Star, 
  X, 
  Check, 
  AlertTriangle, 
  Search, 
  Eye, 
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Tag,
  Info,
  RefreshCw
} from 'lucide-react';
import { Album, AlbumPhoto, Collection, PhotoDetails, ShopSettings } from '@/lib/types';
import { checkDeleteSafety } from '@/lib/data-store';
import { uploadSareeImage } from '@/lib/supabase';
import { initialShopSettings } from '@/lib/seed-data';
import AlbumLightboxModal from '../customer/AlbumLightboxModal';

interface AlbumsManagerTabProps {
  albums: Album[];
  collections: Collection[];
  initialFilterCollectionId?: string;
  settings?: ShopSettings;
  onSaveAlbum: (album: Album) => Promise<void>;
  onDeleteAlbum: (id: string) => Promise<void>;
}

export default function AlbumsManagerTab({
  albums,
  collections,
  initialFilterCollectionId,
  settings = initialShopSettings,
  onSaveAlbum,
  onDeleteAlbum,
}: AlbumsManagerTabProps) {
  const [selectedCollectionFilter, setSelectedCollectionFilter] = useState<string>(
    initialFilterCollectionId || 'all'
  );
  const [search, setSearch] = useState('');

  // Modal State for Add / Edit Album
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCollectionId, setFormCollectionId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formPhotos, setFormPhotos] = useState<AlbumPhoto[]>([]);
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formStatus, setFormStatus] = useState<'active' | 'hidden'>('active');
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  // Photo Upload & Editing State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [activePhotoForDetails, setActivePhotoForDetails] = useState<AlbumPhoto | null>(null);

  // Preview Lightbox State
  const [previewAlbum, setPreviewAlbum] = useState<Album | null>(null);

  // Delete Safety State
  const [albumToDelete, setAlbumToDelete] = useState<{
    album: Album;
    warning?: string;
  } | null>(null);

  const handleOpenAdd = () => {
    setEditingAlbum(null);
    setFormName('');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFormCode(`ALB-${randomSuffix}`);
    setFormCollectionId(selectedCollectionFilter !== 'all' ? selectedCollectionFilter : collections[0]?.id || '');
    setFormDescription('Authentic handcrafted Pochampally saree collection with intricate geometric motifs.');
    setFormCoverImage('/images/hero_saree.jpg');
    setFormPhotos([
      {
        id: `photo-${Date.now()}-1`,
        url: '/images/saree_peacock_blue.jpg',
        is_cover: true,
        order: 1,
        caption: 'Royal Peacock Blue Double Ikat Saree',
      },
      {
        id: `photo-${Date.now()}-2`,
        url: '/images/hero_saree.jpg',
        is_cover: false,
        order: 2,
        caption: 'Virasat Royal Crimson Bridal Drape',
      },
    ]);
    setFormOrder(albums.length + 1);
    setFormStatus('active');
    setFormIsFeatured(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (album: Album) => {
    setEditingAlbum(album);
    setFormName(album.name);
    setFormCode(album.code || '');
    setFormCollectionId(album.collection_id);
    setFormDescription(album.description);
    setFormCoverImage(album.cover_image);
    setFormPhotos([...album.photos].sort((a, b) => a.order - b.order));
    setFormOrder(album.display_order);
    setFormStatus(album.status);
    setFormIsFeatured(Boolean(album.is_featured));
    setIsModalOpen(true);
  };

  // Toggle Album Active / Hidden Status
  const handleToggleAlbumStatus = async (album: Album) => {
    const newStatus = album.status === 'active' ? 'hidden' : 'active';
    await onSaveAlbum({
      ...album,
      status: newStatus,
      updated_at: new Date().toISOString(),
    });
  };

  // Batch Multi-Photo Upload Handler
  const handleBatchPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newPhotos: AlbumPhoto[] = [];

    try {
      const totalFiles = files.length;
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        setUploadProgress(`Uploading photo ${i + 1} of ${totalFiles}...`);
        const url = await uploadSareeImage(file);

        newPhotos.push({
          id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          url: url,
          is_cover: formPhotos.length === 0 && i === 0, // First uploaded photo becomes cover if none set
          order: formPhotos.length + i + 1,
          caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        });
      }

      setFormPhotos((prev) => {
        const combined = [...prev, ...newPhotos];
        // Ensure at least one cover exists
        if (!combined.some((p) => p.is_cover) && combined.length > 0) {
          combined[0].is_cover = true;
          setFormCoverImage(combined[0].url);
        }
        return combined;
      });

      if (!formCoverImage && newPhotos.length > 0) {
        setFormCoverImage(newPhotos[0].url);
      }
    } catch (err) {
      console.error('Batch upload error:', err);
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      e.target.value = '';
    }
  };

  // Add Photo by URL
  const handleAddPhotoByUrl = () => {
    if (!urlInput.trim()) return;
    const isFirst = formPhotos.length === 0;
    const newPhoto: AlbumPhoto = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      url: urlInput.trim(),
      is_cover: isFirst,
      order: formPhotos.length + 1,
      caption: `Saree Photo ${formPhotos.length + 1}`,
    };
    setFormPhotos([...formPhotos, newPhoto]);
    if (isFirst) {
      setFormCoverImage(newPhoto.url);
    }
    setUrlInput('');
  };

  // Set Album Cover
  const handleSetCoverPhoto = (photo: AlbumPhoto) => {
    const updated = formPhotos.map((p) => ({
      ...p,
      is_cover: p.id === photo.id,
    }));
    setFormPhotos(updated);
    setFormCoverImage(photo.url);
  };

  // Delete Individual Photo
  const handleDeletePhoto = (photoId: string) => {
    const remaining = formPhotos.filter((p) => p.id !== photoId);
    // If deleted photo was cover, select first remaining as cover
    if (remaining.length > 0 && !remaining.some((p) => p.is_cover)) {
      remaining[0].is_cover = true;
      setFormCoverImage(remaining[0].url);
    }
    setFormPhotos(remaining);
  };

  // Move Photo Left (Reorder)
  const handleMovePhotoLeft = (index: number) => {
    if (index === 0) return;
    const updated = [...formPhotos];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    // Re-index orders
    updated.forEach((p, idx) => { p.order = idx + 1; });
    setFormPhotos(updated);
  };

  // Move Photo Right (Reorder)
  const handleMovePhotoRight = (index: number) => {
    if (index >= formPhotos.length - 1) return;
    const updated = [...formPhotos];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    // Re-index orders
    updated.forEach((p, idx) => { p.order = idx + 1; });
    setFormPhotos(updated);
  };

  // Replace Photo
  const handleReplacePhoto = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress('Replacing photo...');
    try {
      const url = await uploadSareeImage(file);
      const updated = [...formPhotos];
      const isCover = updated[index].is_cover;
      updated[index] = {
        ...updated[index],
        url: url,
      };
      setFormPhotos(updated);
      if (isCover) {
        setFormCoverImage(url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      e.target.value = '';
    }
  };

  // Save Album
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCollectionId) return;

    const cover = formCoverImage || formPhotos.find((p) => p.is_cover)?.url || formPhotos[0]?.url || '/images/hero_saree.jpg';

    const newAlbum: Album = {
      id: editingAlbum ? editingAlbum.id : `alb-${Date.now()}`,
      name: formName.trim(),
      code: formCode.trim() || undefined,
      collection_id: formCollectionId,
      description: formDescription.trim(),
      cover_image: cover,
      photos: formPhotos.map((p, idx) => ({ ...p, order: idx + 1 })),
      display_order: Number(formOrder) || 1,
      status: formStatus,
      is_featured: formIsFeatured,
      created_at: editingAlbum ? editingAlbum.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await onSaveAlbum(newAlbum);
    setIsModalOpen(false);
  };

  // Delete Safety Check
  const handleRequestDelete = (album: Album) => {
    const safety = checkDeleteSafety(album.id);
    setAlbumToDelete({
      album,
      warning: safety.message,
    });
  };

  const handleConfirmDelete = async () => {
    if (!albumToDelete) return;
    await onDeleteAlbum(albumToDelete.album.id);
    setAlbumToDelete(null);
  };

  // Filtered Albums List
  const filteredAlbums = useMemo(() => {
    return albums.filter((album) => {
      if (selectedCollectionFilter !== 'all' && album.collection_id !== selectedCollectionFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = album.name.toLowerCase().includes(q);
        const matchesCode = album.code?.toLowerCase().includes(q);
        const matchesDesc = album.description.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesDesc) return false;
      }
      return true;
    });
  }, [albums, selectedCollectionFilter, search]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E7DFD5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Images className="w-5 h-5 text-[#800020]" />
            <h2 className="font-serif text-xl font-bold text-[#1C1917]">
              Photo Albums Management
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            Create albums and upload 10, 20, or 25+ real saree photographs in a single batch without creating individual products
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Album</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7DFD5] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search albums by name or code..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] focus:outline-none focus:border-[#800020] text-stone-900"
            />
          </div>

          {/* Collection Filter */}
          <select
            value={selectedCollectionFilter}
            onChange={(e) => setSelectedCollectionFilter(e.target.value)}
            className="w-full sm:w-64 text-xs py-2 px-3 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] focus:outline-none text-stone-700"
          >
            <option value="all">All Cloth Types ({albums.length} Albums)</option>
            {collections.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* Albums Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlbums.map((album) => {
          const col = collections.find((c) => c.id === album.collection_id);

          return (
            <div
              key={album.id}
              className={`bg-white rounded-2xl overflow-hidden border transition-all duration-300 shadow-xs flex flex-col justify-between ${
                album.status === 'active' ? 'border-[#E7DFD5] hover:border-[#D4AF37]' : 'border-stone-200 opacity-75'
              }`}
            >
              {/* Cover Frame */}
              <div className="relative aspect-[16/10] w-full bg-stone-100 group">
                <Image
                  src={album.cover_image || '/images/hero_saree.jpg'}
                  alt={album.name}
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                {/* Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-[#FAF7F2] text-[#800020] shadow">
                    {col?.name || 'Collection'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {album.status === 'hidden' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-stone-800 text-stone-300">
                        Hidden
                      </span>
                    )}
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-[#800020] text-white flex items-center gap-1 shadow">
                      <Images className="w-3 h-3" />
                      <span>{album.photos.length} Photos</span>
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-serif text-lg font-bold truncate">
                    {album.name}
                  </h3>
                  {album.code && (
                    <span className="text-[10px] text-stone-300 font-mono">
                      {album.code}
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {album.description || 'No description provided.'}
                </p>

                {/* Preview Mini Strip */}
                {album.photos.length > 0 && (
                  <div className="flex gap-1.5 overflow-hidden py-1">
                    {album.photos.slice(0, 5).map((photo, i) => (
                      <div
                        key={photo.id || i}
                        className="relative w-10 h-12 rounded overflow-hidden bg-stone-100 shrink-0 border border-stone-200"
                      >
                        <Image
                          src={photo.url}
                          alt="preview"
                          fill
                          className="object-cover object-top"
                        />
                      </div>
                    ))}
                    {album.photos.length > 5 && (
                      <div className="w-10 h-12 rounded bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-500 border border-stone-200 shrink-0">
                        +{album.photos.length - 5}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions (Section 2 & 13: [Edit] [Manage Photos] [Hide] [Delete] [Preview]) */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleOpenEdit(album)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-stone-200 text-stone-800 font-semibold border border-[#E7DFD5] transition-colors"
                      title="Edit Album Information"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleOpenEdit(album)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#800020] hover:bg-[#660019] text-white font-semibold shadow-xs transition-colors"
                      title="Upload and Manage Saree Photos"
                    >
                      Manage Photos
                    </button>

                    <button
                      onClick={() => handleToggleAlbumStatus(album)}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 font-semibold transition-colors"
                      title={album.status === 'active' ? 'Hide album from customer website' : 'Show album on customer website'}
                    >
                      {album.status === 'active' ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPreviewAlbum(album)}
                      className="p-1.5 text-stone-600 hover:text-[#800020] hover:bg-stone-100 rounded-lg transition-colors"
                      title="Preview Album as Customer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleRequestDelete(album)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Album"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* CREATE / EDIT ALBUM MODAL                                 */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)}></div>

          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#E7DFD5] overflow-hidden my-auto z-10 flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E7DFD5] bg-[#FAF7F2] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#800020]">
                  {editingAlbum ? 'Edit Saree Album' : 'Create New Saree Album'}
                </h3>
                <p className="text-xs text-stone-500">
                  Select multiple photos from your device at once and set your album cover
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-6 flex-1">
              
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Album Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Pochampally Cotton New Collection"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 font-serif font-bold focus:outline-none focus:border-[#800020]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Collection / Cloth Type *
                  </label>
                  <select
                    required
                    value={formCollectionId}
                    onChange={(e) => setFormCollectionId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                  >
                    <option value="">Select Collection</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Album Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. COT-2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 font-mono focus:outline-none focus:border-[#800020]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Album Description
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="e.g. Handwoven lightweight cotton sarees with authentic Ikat border..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                  ></textarea>
                </div>
              </div>

              {/* BATCH PHOTO UPLOAD SECTION */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Images className="w-4 h-4 text-[#800020]" />
                    <span className="font-serif text-sm font-bold text-stone-900">
                      Saree Photos ({formPhotos.length} Photos Uploaded)
                    </span>
                  </div>
                  <span className="text-xs text-stone-500">
                    Click ★ COVER on any photo to set it as the album cover
                  </span>
                </div>

                {/* Upload Action Zone */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  
                  {/* Multi-Photo Picker */}
                  <label className="sm:col-span-8 cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#800020]/40 hover:border-[#800020] bg-rose-50/20 hover:bg-rose-50/50 rounded-2xl transition-colors text-center">
                    <Upload className="w-8 h-8 text-[#800020] mb-2 animate-bounce" />
                    <span className="text-xs font-bold text-stone-900">
                      {isUploading ? uploadProgress : '+ Add Photos (Select Multiple Images Simultaneously)'}
                    </span>
                    <span className="text-[11px] text-stone-500 mt-0.5">
                      Select 5, 10, 20 or more saree photos directly from your computer or mobile gallery
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleBatchPhotoUpload}
                      disabled={isUploading}
                      className="sr-only"
                    />
                  </label>

                  {/* Add by link */}
                  <div className="sm:col-span-4 p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                    <span className="text-[11px] font-semibold text-stone-700 block">Or add photo link:</span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="/images/... or https://..."
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddPhotoByUrl}
                        className="px-3 py-1.5 bg-[#800020] text-white text-xs font-bold rounded-lg"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Uploaded Photos Grid with Controls */}
                {formPhotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-3">
                    {formPhotos.map((photo, idx) => (
                      <div
                        key={photo.id || idx}
                        className={`relative rounded-xl overflow-hidden border-2 bg-stone-50 p-1 flex flex-col justify-between transition-all ${
                          photo.is_cover
                            ? 'border-[#800020] ring-2 ring-[#800020]/30 shadow-md'
                            : 'border-stone-200'
                        }`}
                      >
                        {/* Photo Thumbnail */}
                        <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-stone-100">
                          <Image
                            src={photo.url}
                            alt="photo thumbnail"
                            fill
                            className="object-cover object-top"
                          />
                          {photo.is_cover && (
                            <span className="absolute top-1 left-1 bg-[#800020] text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase shadow">
                              ★ COVER
                            </span>
                          )}
                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1 rounded font-mono">
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Controls underneath */}
                        <div className="pt-2 flex flex-col gap-1 text-[10px]">
                          {/* Set Cover Button */}
                          {!photo.is_cover ? (
                            <button
                              type="button"
                              onClick={() => handleSetCoverPhoto(photo)}
                              className="text-[#800020] hover:underline font-bold text-center py-0.5"
                            >
                              ★ Set as Cover
                            </button>
                          ) : (
                            <span className="text-emerald-700 font-bold text-center py-0.5">Album Cover</span>
                          )}

                          {/* Reordering Controls (Move Left / Right) */}
                          <div className="flex items-center justify-center gap-1 py-0.5 bg-stone-100 rounded">
                            <button
                              type="button"
                              onClick={() => handleMovePhotoLeft(idx)}
                              disabled={idx === 0}
                              className="p-1 hover:text-[#800020] disabled:opacity-20"
                              title="Move Earlier"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <span className="text-[9px] text-stone-400 font-mono">Reorder</span>
                            <button
                              type="button"
                              onClick={() => handleMovePhotoRight(idx)}
                              disabled={idx === formPhotos.length - 1}
                              className="p-1 hover:text-[#800020] disabled:opacity-20"
                              title="Move Later"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Details & Delete & Replace Actions */}
                          <div className="flex items-center justify-between pt-1 border-t border-stone-200">
                            <button
                              type="button"
                              onClick={() => setActivePhotoForDetails(photo)}
                              className="text-stone-600 hover:text-[#800020] flex items-center gap-0.5 font-medium"
                              title="Optional Saree Details (Code, Color)"
                            >
                              <Info className="w-3 h-3" />
                              <span>{photo.details?.code || photo.details?.saree_code ? 'Tagged' : 'Details'}</span>
                            </button>

                            <div className="flex items-center gap-1">
                              {/* Replace image label */}
                              <label className="cursor-pointer text-stone-400 hover:text-stone-700 p-0.5" title="Replace Photo">
                                <RefreshCw className="w-3 h-3" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(e) => handleReplacePhoto(idx, e)}
                                />
                              </label>

                              {/* Delete Photo */}
                              <button
                                type="button"
                                onClick={() => handleDeletePhoto(photo.id)}
                                className="text-stone-400 hover:text-rose-600 p-0.5"
                                title="Delete Photo"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status and Feature Toggles */}
              <div className="pt-3 border-t border-stone-200 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-xs font-medium text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="rounded text-[#800020]"
                  />
                  <span>Feature on Homepage</span>
                </label>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-stone-700">Visibility:</span>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="px-2 py-1 rounded-lg bg-[#FAF7F2] border border-[#E7DFD5]"
                  >
                    <option value="active">Active (Visible to customers)</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#E7DFD5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow"
                >
                  {editingAlbum ? 'Update Album' : 'Save & Publish Album'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* OPTIONAL SAREE DETAILS MODAL                             */}
      {/* ======================================================== */}
      {activePhotoForDetails && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-serif font-bold text-sm text-[#800020]">
                Optional Saree Details (Photo #{activePhotoForDetails.order})
              </h4>
              <button
                type="button"
                onClick={() => setActivePhotoForDetails(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Saree Name / Title (Optional)
                </label>
                <input
                  type="text"
                  value={activePhotoForDetails.details?.saree_name || activePhotoForDetails.caption || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    setActivePhotoForDetails({
                      ...activePhotoForDetails,
                      caption: name,
                      details: {
                        ...(activePhotoForDetails.details || {}),
                        saree_name: name,
                      },
                    });
                  }}
                  placeholder="e.g. Royal Peacock Blue Double Ikat"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Saree Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={activePhotoForDetails.details?.code || activePhotoForDetails.details?.saree_code || ''}
                    onChange={(e) => {
                      const code = e.target.value;
                      setActivePhotoForDetails({
                        ...activePhotoForDetails,
                        details: {
                          ...(activePhotoForDetails.details || {}),
                          code: code,
                          saree_code: code,
                        },
                      });
                    }}
                    placeholder="e.g. SLN-001"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Color / Shade (Optional)
                  </label>
                  <input
                    type="text"
                    value={activePhotoForDetails.details?.color || ''}
                    onChange={(e) => {
                      const c = e.target.value;
                      setActivePhotoForDetails({
                        ...activePhotoForDetails,
                        details: {
                          ...(activePhotoForDetails.details || {}),
                          color: c,
                        },
                      });
                    }}
                    placeholder="e.g. Peacock Blue & Magenta"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormPhotos((prev) =>
                    prev.map((p) =>
                      p.id === activePhotoForDetails.id ? activePhotoForDetails : p
                    )
                  );
                  setActivePhotoForDetails(null);
                }}
                className="w-full py-2.5 rounded-xl bg-[#800020] text-white font-bold"
              >
                Save Details for this Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PREVIEW ALBUM LIGHTBOX (ADMIN PREVIEW)                   */}
      {/* ======================================================== */}
      {previewAlbum && (
        <AlbumLightboxModal
          album={previewAlbum}
          initialPhotoIndex={0}
          settings={settings}
          onClose={() => setPreviewAlbum(null)}
        />
      )}

      {/* ======================================================== */}
      {/* DELETE SAFETY WARNING MODAL                               */}
      {/* ======================================================== */}
      {albumToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="fixed inset-0" onClick={() => setAlbumToDelete(null)}></div>

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-200 p-6 space-y-4 my-auto z-10">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Delete Photo Album?
                </h3>
                <span className="text-xs text-stone-500">
                  {albumToDelete.album.name} ({albumToDelete.album.photos.length} Photos)
                </span>
              </div>
            </div>

            {albumToDelete.warning ? (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 leading-relaxed space-y-2">
                <div className="font-semibold text-rose-900">
                  ⚠️ Deletion Safety Protection:
                </div>
                <div>{albumToDelete.warning}</div>
              </div>
            ) : (
              <p className="text-xs text-stone-600 leading-relaxed">
                Are you sure you want to delete this photo album? All photos inside this album will be permanently removed.
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAlbumToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow"
              >
                Yes, Delete Album
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
