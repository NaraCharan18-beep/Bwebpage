'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  AlertTriangle, 
  Upload, 
  Images, 
  ArrowRight,
  Eye,
  Check,
  ArrowUp,
  ArrowDown,
  Layers,
  FolderTree,
  LayoutGrid,
  List
} from 'lucide-react';
import { Collection, Album } from '@/lib/types';
import { checkDeleteSafety } from '@/lib/data-store';
import { uploadSareeImage } from '@/lib/supabase';

interface CollectionsManagerTabProps {
  collections: Collection[];
  albums: Album[];
  onSaveCollection: (collection: Collection) => Promise<void>;
  onDeleteCollection: (id: string) => Promise<void>;
  onNavigateToAlbums: (collectionId: string) => void;
  onAddAlbumToCollection?: (collectionId: string) => void;
}

export default function CollectionsManagerTab({
  collections,
  albums,
  onSaveCollection,
  onDeleteCollection,
  onNavigateToAlbums,
  onAddAlbumToCollection,
}: CollectionsManagerTabProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [viewingCollection, setViewingCollection] = useState<Collection | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formStatus, setFormStatus] = useState<'active' | 'hidden'>('active');
  const [isUploading, setIsUploading] = useState(false);

  // Delete safety
  const [collectionToDelete, setCollectionToDelete] = useState<{
    collection: Collection;
    warning?: string;
  } | null>(null);

  const sortedCollections = [...collections].sort((a, b) => a.display_order - b.display_order);

  const handleOpenAdd = () => {
    setEditingCollection(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('Lightweight and comfortable sarees suitable for everyday wear and traditional occasions.');
    setFormCoverImage('/images/hero_saree.jpg');
    setFormOrder(collections.length + 1);
    setFormStatus('active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (col: Collection) => {
    setEditingCollection(col);
    setFormName(col.name);
    setFormSlug(col.slug);
    setFormDescription(col.description);
    setFormCoverImage(col.cover_image);
    setFormOrder(col.display_order);
    setFormStatus(col.status);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadSareeImage(file);
      setFormCoverImage(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const slug = formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newCol: Collection = {
      id: editingCollection ? editingCollection.id : `col-${Date.now()}`,
      name: formName.trim(),
      slug: slug,
      description: formDescription.trim(),
      cover_image: formCoverImage || '/images/hero_saree.jpg',
      display_order: Number(formOrder) || 1,
      status: formStatus,
      created_at: editingCollection ? editingCollection.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await onSaveCollection(newCol);
    setIsModalOpen(false);
  };

  const handleRequestDelete = (col: Collection) => {
    const safety = checkDeleteSafety('collection', col.id);
    setCollectionToDelete({
      collection: col,
      warning: safety.warningMessage,
    });
  };

  const handleConfirmDelete = async () => {
    if (!collectionToDelete) return;
    await onDeleteCollection(collectionToDelete.collection.id);
    setCollectionToDelete(null);
  };

  const handleToggleStatus = async (col: Collection) => {
    const newStatus = col.status === 'active' ? 'hidden' : 'active';
    await onSaveCollection({ ...col, status: newStatus });
  };

  const handleMoveUp = async (col: Collection, index: number) => {
    if (index === 0) return;
    const prevCol = sortedCollections[index - 1];
    const prevOrder = prevCol.display_order;
    const currentOrder = col.display_order;

    await onSaveCollection({ ...col, display_order: prevOrder });
    await onSaveCollection({ ...prevCol, display_order: currentOrder >= prevOrder ? currentOrder + 1 : currentOrder });
  };

  const handleMoveDown = async (col: Collection, index: number) => {
    if (index >= sortedCollections.length - 1) return;
    const nextCol = sortedCollections[index + 1];
    const nextOrder = nextCol.display_order;
    const currentOrder = col.display_order;

    await onSaveCollection({ ...col, display_order: nextOrder });
    await onSaveCollection({ ...nextCol, display_order: currentOrder });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E7DFD5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderTree className="w-5 h-5 text-[#800020]" />
            <h2 className="font-serif text-xl font-bold text-[#1C1917]">
              My Collections (Cloth & Fabric Types)
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            Define any cloth types your shop sells (e.g. Cotton, Sico, Pure Silk, Silk Mix, Pochampally Ikat, Organza, Linen). No names are hardcoded.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#FAF7F2] p-1 rounded-xl border border-[#E7DFD5]">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${viewMode === 'cards' ? 'bg-white shadow text-[#800020]' : 'text-stone-500'}`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${viewMode === 'list' ? 'bg-white shadow text-[#800020]' : 'text-stone-500'}`}
              title="Simple List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Collection</span>
          </button>
        </div>
      </div>

      {/* Explanatory Banner */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed">
        <strong>Flexible Hierarchy:</strong> Each <strong>Collection</strong> represents a cloth type (e.g. <em>Cotton</em>, <em>Sico</em>, <em>Silk Mix</em>). 
        Inside each collection, you can upload multiple <strong>Photo Albums</strong> containing 10, 20, or 25+ real saree photos.
      </div>

      {/* View Mode: Simple List View (Section 8: "My Collections") */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-3xl border border-[#E7DFD5] shadow-xs divide-y divide-stone-100 overflow-hidden">
          {sortedCollections.map((col, idx) => {
            const colAlbums = albums.filter((a) => a.collection_id === col.id);
            const totalPhotos = colAlbums.reduce((sum, a) => sum + a.photos.length, 0);

            return (
              <div key={col.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF7F2]/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                    <Image
                      src={col.cover_image || '/images/hero_saree.jpg'}
                      alt={col.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-base font-bold text-stone-900">
                        {col.name}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        col.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                      }`}>
                        {col.status === 'active' ? 'Active' : 'Hidden'}
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">
                        Order: #{col.display_order}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 max-w-xl line-clamp-1">
                      {col.description || 'No description provided.'}
                    </p>

                    <div className="text-[11px] text-stone-500 flex items-center gap-3 pt-0.5">
                      <span><strong>{colAlbums.length}</strong> Albums</span>
                      <span>•</span>
                      <span><strong className="text-[#800020]">{totalPhotos}</strong> Saree Photos</span>
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  {/* Reorder Buttons */}
                  <button
                    onClick={() => handleMoveUp(col, idx)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(col, idx)}
                    disabled={idx === sortedCollections.length - 1}
                    className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Add Album */}
                  <button
                    onClick={() => {
                      if (onAddAlbumToCollection) onAddAlbumToCollection(col.id);
                      else onNavigateToAlbums(col.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold"
                  >
                    + Add Album
                  </button>

                  {/* View Collection */}
                  <button
                    onClick={() => setViewingCollection(col)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-stone-200 text-[#800020] border border-[#E7DFD5] text-xs font-semibold"
                  >
                    View
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEdit(col)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-stone-200 text-stone-800 border border-[#E7DFD5] text-xs font-semibold"
                  >
                    Edit
                  </button>

                  {/* Hide / Show */}
                  <button
                    onClick={() => handleToggleStatus(col)}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold"
                  >
                    {col.status === 'active' ? 'Hide' : 'Show'}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleRequestDelete(col)}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200"
                    title="Delete Collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View Mode: Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCollections.map((col, idx) => {
            const colAlbums = albums.filter((a) => a.collection_id === col.id);
            const totalPhotos = colAlbums.reduce((sum, a) => sum + a.photos.length, 0);

            return (
              <div
                key={col.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#E7DFD5] hover:border-[#D4AF37] shadow-xs flex flex-col justify-between transition-all"
              >
                {/* Cover Banner */}
                <div className="relative aspect-[16/9] w-full bg-stone-100">
                  <Image
                    src={col.cover_image || '/images/hero_saree.jpg'}
                    alt={col.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow ${
                        col.status === 'active'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-600 text-white'
                      }`}
                    >
                      {col.status === 'active' ? 'Active' : 'Hidden'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-black/60 text-white font-mono">
                      Order: #{col.display_order}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-serif text-lg font-bold">
                      {col.name}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {col.description || 'No description provided.'}
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span className="font-semibold text-stone-800">
                      {colAlbums.length} Photo Albums
                    </span>
                    <span className="font-semibold text-[#800020]">
                      {totalPhotos} Saree Photos
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          if (onAddAlbumToCollection) onAddAlbumToCollection(col.id);
                          else onNavigateToAlbums(col.id);
                        }}
                        className="text-xs px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#800020]" />
                        <span>Add Album</span>
                      </button>

                      <button
                        onClick={() => onNavigateToAlbums(col.id)}
                        className="text-xs text-[#800020] hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>Manage Albums</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-stone-50 text-xs">
                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveUp(col, idx)}
                          disabled={idx === 0}
                          className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(col, idx)}
                          disabled={idx === sortedCollections.length - 1}
                          className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Collection Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewingCollection(col)}
                          className="p-1.5 text-stone-600 hover:text-[#800020] hover:bg-stone-100 rounded-lg text-xs"
                          title="View Collection"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(col)}
                          className="px-2 py-1 rounded text-[10px] font-semibold border border-stone-200 hover:bg-stone-50 text-stone-700"
                        >
                          {col.status === 'active' ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(col)}
                          className="p-1.5 text-stone-600 hover:text-[#800020] hover:bg-stone-100 rounded-lg"
                          title="Edit Collection"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRequestDelete(col)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                          title="Delete Collection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE / EDIT COLLECTION MODAL                            */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)}></div>

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E7DFD5] overflow-hidden my-auto z-10 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7DFD5] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#800020]">
                {editingCollection ? 'Edit Collection' : '+ Create Collection'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Collection Name (e.g. Cotton, Sico, Pure Silk, Silk Mix, Pochampally Ikat, Organza, Linen) *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Cotton"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Comfortable cotton sarees suitable for everyday wear..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                ></textarea>
              </div>

              {/* Cover Image Upload / Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Cover Image
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                    <Image
                      src={formCoverImage || '/images/hero_saree.jpg'}
                      alt="Cover"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-[#E7DFD5]">
                      <Upload className="w-3.5 h-3.5 text-[#800020]" />
                      <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>

                    <input
                      type="text"
                      value={formCoverImage}
                      onChange={(e) => setFormCoverImage(e.target.value)}
                      placeholder="/images/hero_saree.jpg or URL"
                      className="w-full px-3 py-1.5 text-[11px] rounded-lg bg-[#FAF7F2] border border-[#E7DFD5] text-stone-800"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Status
                  </label>
                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-1.5 text-xs text-stone-800 cursor-pointer">
                      <input
                        type="radio"
                        name="col_status"
                        checked={formStatus === 'active'}
                        onChange={() => setFormStatus('active')}
                        className="text-[#800020]"
                      />
                      <span>Active</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-stone-800 cursor-pointer">
                      <input
                        type="radio"
                        name="col_status"
                        checked={formStatus === 'hidden'}
                        onChange={() => setFormStatus('hidden')}
                        className="text-[#800020]"
                      />
                      <span>Hidden</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E7DFD5] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow"
                >
                  Save Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PREVIEW / VIEW COLLECTION MODAL                           */}
      {/* ======================================================== */}
      {viewingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="fixed inset-0" onClick={() => setViewingCollection(null)}></div>

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E7DFD5] overflow-hidden my-auto z-10 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7DFD5] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#A67C1E]">
                  Collection Preview
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {viewingCollection.name}
                </h3>
              </div>
              <button
                onClick={() => setViewingCollection(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {viewingCollection.description}
            </p>

            <div className="space-y-2">
              <h4 className="text-xs uppercase font-bold text-stone-700 tracking-wider">
                Photo Albums in {viewingCollection.name}
              </h4>

              {albums.filter((a) => a.collection_id === viewingCollection.id).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {albums
                    .filter((a) => a.collection_id === viewingCollection.id)
                    .map((alb) => (
                      <div key={alb.id} className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E7DFD5] flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                          <Image
                            src={alb.cover_image || '/images/hero_saree.jpg'}
                            alt={alb.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="overflow-hidden">
                          <h5 className="font-serif text-xs font-bold text-stone-900 truncate">
                            {alb.name}
                          </h5>
                          <span className="text-[11px] text-[#800020] font-semibold">
                            {alb.photos.length} Photos
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-6 bg-stone-50 rounded-2xl text-center text-xs text-stone-500">
                  No albums uploaded yet in {viewingCollection.name}. Click &quot;Add Album&quot; to upload photos.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E7DFD5] flex items-center justify-between">
              <button
                onClick={() => {
                  const id = viewingCollection.id;
                  setViewingCollection(null);
                  if (onAddAlbumToCollection) onAddAlbumToCollection(id);
                  else onNavigateToAlbums(id);
                }}
                className="px-4 py-2 rounded-xl bg-[#800020] text-white text-xs font-bold shadow"
              >
                + Create Album in {viewingCollection.name}
              </button>

              <button
                onClick={() => setViewingCollection(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE SAFETY WARNING MODAL                               */}
      {/* ======================================================== */}
      {collectionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="fixed inset-0" onClick={() => setCollectionToDelete(null)}></div>

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-200 p-6 space-y-4 my-auto z-10">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Delete Collection?
                </h3>
                <span className="text-xs text-stone-500">
                  {collectionToDelete.collection.name}
                </span>
              </div>
            </div>

            {collectionToDelete.warning ? (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 leading-relaxed space-y-2">
                <div className="font-semibold text-rose-900">
                  ⚠️ Deletion Safety Protection:
                </div>
                <div>{collectionToDelete.warning}</div>
              </div>
            ) : (
              <p className="text-xs text-stone-600 leading-relaxed">
                Are you sure you want to delete this collection? This action cannot be undone.
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCollectionToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow"
              >
                Yes, Delete Collection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
