'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Upload, 
  Images, 
  ArrowLeft,
  Check, 
  FolderTree, 
  Folder,
  FolderOpen,
  MoveRight, 
  Star, 
  Search,
  Eye,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Tag,
  Layers
} from 'lucide-react';
import { Collection, Album, SareeItem } from '@/lib/types';
import { uploadSareeImage } from '@/lib/supabase';
import { 
  saveCollection, 
  deleteCollection, 
  addSareesToCollection, 
  updateSaree, 
  deleteSaree, 
  moveSareeToCollection, 
  setCollectionCover,
  reorderCollections 
} from '@/lib/data-store';

interface CollectionsManagerTabProps {
  collections: Collection[];
  albums?: Album[];
  onSaveCollection?: (collection: Collection) => Promise<void>;
  onDeleteCollection?: (id: string) => Promise<void>;
  onNavigateToAlbums?: (collectionId: string) => void;
  onAddAlbumToCollection?: (collectionId: string) => void;
  onRefresh?: () => void;
}

export default function CollectionsManagerTab({
  collections,
  albums,
  onSaveCollection,
  onDeleteCollection,
  onNavigateToAlbums,
  onAddAlbumToCollection,
  onRefresh,
}: CollectionsManagerTabProps) {
  // Active selected collection folder (null = show all collections overview)
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditCollectionModalOpen, setIsEditCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  
  // Saree editing modal
  const [editingSaree, setEditingSaree] = useState<SareeItem | null>(null);

  // Delete confirmation modal
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'collection' | 'saree';
    id: string;
    name: string;
    parentColId?: string;
  } | null>(null);

  // --- Create Collection Form State ---
  const [newColName, setNewColName] = useState('');
  const [newColDescription, setNewColDescription] = useState('');
  const [newColCoverImage, setNewColCoverImage] = useState('');
  const [newColUploadedSarees, setNewColUploadedSarees] = useState<{
    code: string;
    name: string;
    url: string;
    is_cover: boolean;
  }[]>([]);
  const [createUploadProgress, setCreateUploadProgress] = useState('');
  const [isCreateUploading, setIsCreateUploading] = useState(false);

  // --- Bulk Add Sarees to existing collection state ---
  const [bulkUploadProgress, setBulkUploadProgress] = useState('');
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  // Listen to external sidebar event to open create collection modal
  useEffect(() => {
    const handleOpenModal = () => {
      handleOpenCreateModal();
    };
    window.addEventListener('open-create-collection-modal', handleOpenModal);
    return () => window.removeEventListener('open-create-collection-modal', handleOpenModal);
  }, []);

  const selectedCollection = collections.find((c) => c.id === selectedCollectionId);

  // Filtered collections
  const filteredCollections = collections.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.sarees?.some((s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    );
  });

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setNewColName('');
    setNewColDescription('Authentic handwoven collection crafted on pit looms in Bhoodan Pochampally.');
    setNewColCoverImage('');
    setNewColUploadedSarees([]);
    setCreateUploadProgress('');
    setIsCreateModalOpen(true);
  };

  // Generate prefix code from name (e.g. "Pochampally Silk Sarees" -> "PSS")
  const generatePrefix = (name: string) => {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return words.map((w) => w[0].toUpperCase()).join('').slice(0, 4);
    }
    return name.slice(0, 3).toUpperCase();
  };

  // Bulk Upload for New Collection Creation (Requirement #4 & #10)
  const handleBulkUploadForCreate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCreateUploading(true);
    const prefix = generatePrefix(newColName || 'Saree');
    const existingCount = newColUploadedSarees.length;
    const uploadedList: typeof newColUploadedSarees = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCreateUploadProgress(`Uploading photo ${i + 1} of ${files.length}...`);
        const url = await uploadSareeImage(file);
        const index = existingCount + i + 1;
        const code = `${prefix}-${String(index).padStart(3, '0')}`;
        const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || `Saree ${index}`;

        uploadedList.push({
          code,
          name,
          url,
          is_cover: existingCount === 0 && i === 0,
        });
      }

      setNewColUploadedSarees((prev) => {
        const combined = [...prev, ...uploadedList];
        if (!combined.some((s) => s.is_cover) && combined.length > 0) {
          combined[0].is_cover = true;
        }
        return combined;
      });

      if (!newColCoverImage && uploadedList.length > 0) {
        setNewColCoverImage(uploadedList[0].url);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsCreateUploading(false);
      setCreateUploadProgress('');
      e.target.value = '';
    }
  };

  // Submit Create Collection (Requirement #4 & #18)
  const handleSubmitCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    const colId = `col-${Date.now()}`;
    const slug = newColName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const coverImage = newColCoverImage || newColUploadedSarees[0]?.url || '/images/hero_saree.jpg';

    const sarees: SareeItem[] = newColUploadedSarees.map((s, idx) => ({
      id: `saree-${Date.now()}-${idx}`,
      code: s.code,
      name: s.name,
      image_url: s.url,
      collection_id: colId,
      collection_name: newColName.trim(),
      order: idx + 1,
      is_cover: s.is_cover || s.url === coverImage,
      availability: 'available',
      created_at: new Date().toISOString(),
    }));

    const newCollection: Collection = {
      id: colId,
      name: newColName.trim(),
      slug,
      description: newColDescription.trim(),
      cover_image: coverImage,
      display_order: collections.length + 1,
      status: 'active',
      sarees,
      created_at: new Date().toISOString(),
    };

    if (onSaveCollection) {
      await onSaveCollection(newCollection);
    } else {
      await saveCollection(newCollection);
    }
    onRefresh?.();
    setIsCreateModalOpen(false);
    setSelectedCollectionId(colId);
  };

  // Bulk Upload directly into an existing collection (Requirement #10)
  const handleBulkUploadToExisting = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCollection) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsBulkUploading(true);
    const prefix = generatePrefix(selectedCollection.name);
    const existingCount = selectedCollection.sarees?.length || 0;
    const newSarees: Partial<SareeItem>[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setBulkUploadProgress(`Uploading photo ${i + 1} of ${files.length}...`);
        const url = await uploadSareeImage(file);
        const index = existingCount + i + 1;
        const code = `${prefix}-${String(index).padStart(3, '0')}`;
        const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || `Saree ${index}`;

        newSarees.push({
          code,
          name,
          image_url: url,
          availability: 'available',
        });
      }

      await addSareesToCollection(selectedCollection.id, newSarees);
      onRefresh?.();
    } catch (err) {
      console.error('Bulk upload error:', err);
    } finally {
      setIsBulkUploading(false);
      setBulkUploadProgress('');
      e.target.value = '';
    }
  };

  // Set Saree as Collection Cover
  const handleSetSareeAsCover = async (saree: SareeItem) => {
    if (!selectedCollection) return;
    await setCollectionCover(selectedCollection.id, saree.image_url);
    onRefresh?.();
  };

  // Move Saree to another collection
  const handleMoveSaree = async (sareeId: string, toColId: string) => {
    if (!selectedCollection) return;
    await moveSareeToCollection(sareeId, selectedCollection.id, toColId);
    onRefresh?.();
  };

  // Delete Saree
  const handleDeleteSaree = async (sareeId: string) => {
    if (!selectedCollection) return;
    await deleteSaree(selectedCollection.id, sareeId);
    onRefresh?.();
    setDeleteConfirmTarget(null);
  };

  // Delete Collection
  const handleDeleteCollection = async (colId: string) => {
    if (onDeleteCollection) {
      await onDeleteCollection(colId);
    } else {
      await deleteCollection(colId);
    }
    onRefresh?.();
    setSelectedCollectionId(null);
    setDeleteConfirmTarget(null);
  };

  // Reorder Collections
  const handleMoveCollectionOrder = async (colId: string, direction: 'up' | 'down') => {
    const idx = collections.findIndex((c) => c.id === colId);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= collections.length) return;

    const reordered = [...collections];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(targetIdx, 0, moved);

    await reorderCollections(reordered.map((c) => c.id));
    onRefresh?.();
  };

  // Save Saree edits
  const handleSaveSareeEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSaree || !selectedCollection) return;
    await updateSaree(selectedCollection.id, editingSaree);
    onRefresh?.();
    setEditingSaree(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E7DFD5] shadow-xs">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1C1917] flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-[#800020]" />
            <span>Saree Collections & Catalog</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Organize sarees into collections, bulk upload photos, and update saree codes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Create Collection Button (Requirement #4) */}
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>+ Create Collection</span>
          </button>
        </div>
      </div>

      {/* Folder Explorer Tabs (Requirement #11: Easy Folder System) */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7DFD5] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#800020]" />
            <span>Saree Folders / Collections ({collections.length})</span>
          </span>
          {selectedCollectionId && (
            <button
              onClick={() => setSelectedCollectionId(null)}
              className="text-xs text-[#800020] hover:underline font-bold flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Show All Collections</span>
            </button>
          )}
        </div>

        {/* Scrollable Folder Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => setSelectedCollectionId(null)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              selectedCollectionId === null
                ? 'bg-[#800020] text-white shadow-xs'
                : 'bg-[#FAF7F2] text-stone-700 hover:bg-stone-200 border border-[#E7DFD5]'
            }`}
          >
            <FolderTree className="w-4 h-4 text-[#D4AF37]" />
            <span>All Collections ({collections.length})</span>
          </button>

          {collections.map((col) => {
            const isSelected = selectedCollectionId === col.id;
            const count = col.sarees?.length || 0;

            return (
              <button
                key={col.id}
                onClick={() => setSelectedCollectionId(col.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#800020] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-stone-700 hover:bg-stone-200 border border-[#E7DFD5]'
                }`}
              >
                {isSelected ? (
                  <FolderOpen className="w-4 h-4 text-[#D4AF37]" />
                ) : (
                  <Folder className="w-4 h-4 text-stone-400" />
                )}
                <span>{col.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-white text-[#800020]' : 'bg-stone-200 text-stone-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: INSIDE A SPECIFIC FOLDER / COLLECTION */}
      {/* ======================================================== */}
      {selectedCollection ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Collection Header Bar */}
          <div className="bg-white p-5 rounded-2xl border border-[#E7DFD5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border-2 border-[#D4AF37]/50 shrink-0">
                <Image
                  src={selectedCollection.cover_image || '/images/hero_saree.jpg'}
                  alt={selectedCollection.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-bold text-[#1C1917]">
                    {selectedCollection.name}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    {selectedCollection.status}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5 max-w-xl line-clamp-1">
                  {selectedCollection.description}
                </p>
                <span className="text-[11px] font-mono text-[#800020] font-bold">
                  📁 {selectedCollection.sarees?.length || 0} Sarees Uploaded
                </span>
              </div>
            </div>

            {/* Actions: Bulk Upload, Edit Collection Details, Delete */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Bulk Upload Saree Photos Input (Requirement #10) */}
              <label className="px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:scale-105">
                <Upload className="w-4 h-4 text-[#D4AF37]" />
                <span>{isBulkUploading ? bulkUploadProgress : '+ Bulk Upload Sarees'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleBulkUploadToExisting}
                  disabled={isBulkUploading}
                  className="hidden"
                />
              </label>

              {/* Edit Details Button */}
              <button
                onClick={() => {
                  setEditingCollection(selectedCollection);
                  setIsEditCollectionModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Collection</span>
              </button>

              {/* Delete Collection Button */}
              <button
                onClick={() =>
                  setDeleteConfirmTarget({
                    type: 'collection',
                    id: selectedCollection.id,
                    name: selectedCollection.name,
                  })
                }
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                title="Delete Collection"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sarees Grid in this Collection */}
          {selectedCollection.sarees && selectedCollection.sarees.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {selectedCollection.sarees.map((saree, idx) => {
                const isCover = saree.is_cover || saree.image_url === selectedCollection.cover_image;

                return (
                  <div
                    key={saree.id || idx}
                    className={`bg-white rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col justify-between shadow-xs ${
                      isCover ? 'border-[#800020] ring-2 ring-[#800020]/20' : 'border-stone-200 hover:border-[#D4AF37]'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[3/4] w-full bg-stone-100 group">
                      <Image
                        src={saree.image_url}
                        alt={saree.name}
                        fill
                        className="object-cover object-top"
                        sizes="200px"
                      />

                      {/* Cover Badge */}
                      {isCover && (
                        <span className="absolute top-2 left-2 bg-[#800020] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shadow">
                          ★ COVER PHOTO
                        </span>
                      )}

                      {/* Code Badge */}
                      <span className="absolute bottom-2 left-2 bg-black/70 text-white font-mono text-[10px] px-2 py-0.5 rounded shadow">
                        {saree.code || `#${idx + 1}`}
                      </span>
                    </div>

                    {/* Saree Info & Controls */}
                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between bg-stone-50/50">
                      <div>
                        <h4 className="font-serif text-xs font-bold text-stone-900 truncate">
                          {saree.name}
                        </h4>
                        {saree.price ? (
                          <span className="text-[11px] font-bold text-[#800020]">
                            ₹{saree.price.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400">No price set</span>
                        )}
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="pt-2 border-t border-stone-200 flex flex-col gap-1.5 text-[11px]">
                        {/* Make Cover Button */}
                        {!isCover && (
                          <button
                            onClick={() => handleSetSareeAsCover(saree)}
                            className="w-full py-1 text-[10px] font-bold text-[#800020] bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Star className="w-3 h-3 text-[#D4AF37]" />
                            <span>Set as Cover</span>
                          </button>
                        )}

                        {/* Move Saree to another collection */}
                        <div className="flex items-center gap-1">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleMoveSaree(saree.id, e.target.value);
                              }
                            }}
                            defaultValue=""
                            className="flex-1 text-[10px] py-1 px-1.5 bg-white border border-stone-300 rounded-lg text-stone-700"
                          >
                            <option value="" disabled>Move to...</option>
                            {collections
                              .filter((c) => c.id !== selectedCollection.id)
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  📁 {c.name}
                                </option>
                              ))}
                          </select>
                        </div>

                        {/* Edit & Delete row */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingSaree(saree)}
                            className="flex-1 py-1 text-[10px] font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-center cursor-pointer"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              setDeleteConfirmTarget({
                                type: 'saree',
                                id: saree.id,
                                name: saree.code || saree.name,
                                parentColId: selectedCollection.id,
                              })
                            }
                            className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                            title="Delete Saree"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#E7DFD5] p-8 space-y-4">
              <Images className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-stone-800">
                No Sarees in this Collection
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Bulk upload multiple saree photos directly into this collection.
              </p>
              <label className="inline-flex px-5 py-2.5 rounded-xl bg-[#800020] text-white text-xs font-bold cursor-pointer hover:bg-[#660019]">
                <Upload className="w-4 h-4 mr-2" />
                <span>Bulk Upload Sarees</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleBulkUploadToExisting}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      ) : (

        /* ======================================================== */
        /* VIEW 2: ALL COLLECTIONS OVERVIEW CARDS */
        /* ======================================================== */
        <div className="space-y-6">
          {/* Search bar */}
          <div className="max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search collections by name..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-[#E7DFD5] text-stone-900 focus:outline-none focus:border-[#800020]"
              />
            </div>
          </div>

          {/* Collections Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((col, idx) => {
              const count = col.sarees?.length || 0;

              return (
                <div
                  key={col.id}
                  className="bg-white rounded-2xl overflow-hidden border border-[#E7DFD5] hover:border-[#D4AF37] shadow-xs flex flex-col justify-between transition-all"
                >
                  {/* Cover */}
                  <div
                    onClick={() => setSelectedCollectionId(col.id)}
                    className="relative aspect-[16/10] w-full bg-stone-100 cursor-pointer group"
                  >
                    <Image
                      src={col.cover_image || '/images/hero_saree.jpg'}
                      alt={col.name}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>

                    {/* Saree Count Pill */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full bg-[#800020] text-white text-[11px] font-bold shadow flex items-center gap-1 border border-[#D4AF37]/40">
                        <Images className="w-3 h-3 text-[#D4AF37]" />
                        <span>{count} Sarees</span>
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-serif text-lg font-bold truncate">
                        {col.name}
                      </h3>
                      <span className="text-[10px] text-[#F7E7B4]">
                        Click to view folder &amp; sarees →
                      </span>
                    </div>
                  </div>

                  {/* Body & Actions */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-stone-600 line-clamp-2">
                      {col.description}
                    </p>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      {/* Reorder Up/Down */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveCollectionOrder(col.id, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveCollectionOrder(col.id, 'down')}
                          disabled={idx === filteredCollections.length - 1}
                          className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Main Open Folder Button */}
                      <button
                        onClick={() => setSelectedCollectionId(col.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Manage Sarees</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() =>
                          setDeleteConfirmTarget({
                            type: 'collection',
                            id: col.id,
                            name: col.name,
                          })
                        }
                        className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete Collection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: + CREATE COLLECTION (Requirement #4 & #18) */}
      {/* ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto border border-[#E7DFD5]">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1C1917] flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#800020]" />
                  <span>Create Saree Collection</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Enter collection name, upload cover photo, and bulk upload saree photos.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreateCollection} className="space-y-5">
              
              {/* 1. Collection Name */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Collection Name *
                </label>
                <input
                  type="text"
                  required
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. Pochampally Silk Sarees, Cotton Sarees, Sico Sarees..."
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl focus:outline-none focus:border-[#800020] text-stone-900 font-semibold"
                />
              </div>

              {/* 2. Collection Description */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newColDescription}
                  onChange={(e) => setNewColDescription(e.target.value)}
                  placeholder="Short description for customers..."
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl focus:outline-none focus:border-[#800020] text-stone-900"
                />
              </div>

              {/* 3. Add Sarees (Bulk Upload Multi-Photo Picker - Requirement #4 & #10) */}
              <div className="space-y-3 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-800">
                    Add Sarees (Bulk Upload)
                  </label>
                  <span className="text-[11px] text-stone-500">
                    {newColUploadedSarees.length} photos selected
                  </span>
                </div>

                {/* Upload Action Zone */}
                <label className="cursor-pointer flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#800020]/40 hover:border-[#800020] bg-rose-50/20 hover:bg-rose-50/50 rounded-2xl transition-colors text-center">
                  <Upload className="w-8 h-8 text-[#800020] mb-2 animate-bounce" />
                  <span className="text-xs font-bold text-stone-900">
                    {isCreateUploading ? createUploadProgress : '+ Select Multiple Saree Photos At Once'}
                  </span>
                  <span className="text-[11px] text-stone-500 mt-0.5">
                    Select 5, 10, 20 or more saree photos from your phone or computer
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleBulkUploadForCreate}
                    disabled={isCreateUploading}
                    className="hidden"
                  />
                </label>

                {/* Preview Grid of Uploaded Sarees */}
                {newColUploadedSarees.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-2">
                    {newColUploadedSarees.map((s, idx) => (
                      <div
                        key={idx}
                        className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 bg-stone-100 ${
                          s.is_cover ? 'border-[#800020] ring-2 ring-[#800020]/30' : 'border-stone-200'
                        }`}
                      >
                        <Image
                          src={s.url}
                          alt="thumbnail"
                          fill
                          className="object-cover"
                        />
                        {s.is_cover && (
                          <span className="absolute top-1 left-1 bg-[#800020] text-white text-[8px] font-bold px-1 rounded">
                            ★ COVER
                          </span>
                        )}
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white font-mono text-[8px] px-1 rounded">
                          {s.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newColUploadedSarees.filter((_, i) => i !== idx);
                            if (s.is_cover && updated.length > 0) {
                              updated[0].is_cover = true;
                              setNewColCoverImage(updated[0].url);
                            }
                            setNewColUploadedSarees(updated);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreateUploading || !newColName.trim()}
                  className="px-6 py-2.5 bg-[#800020] hover:bg-[#660019] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                  <span>Create Collection</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT COLLECTION DETAILS */}
      {/* ======================================================== */}
      {isEditCollectionModalOpen && editingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-4 border border-[#E7DFD5]">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Edit Collection
              </h3>
              <button
                onClick={() => setIsEditCollectionModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (onSaveCollection) {
                  await onSaveCollection(editingCollection);
                } else {
                  await saveCollection(editingCollection);
                }
                onRefresh?.();
                setIsEditCollectionModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Collection Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingCollection.name}
                  onChange={(e) =>
                    setEditingCollection({ ...editingCollection, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl text-stone-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingCollection.description}
                  onChange={(e) =>
                    setEditingCollection({ ...editingCollection, description: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Status
                </label>
                <select
                  value={editingCollection.status}
                  onChange={(e) =>
                    setEditingCollection({
                      ...editingCollection,
                      status: e.target.value as 'active' | 'hidden',
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl text-stone-900"
                >
                  <option value="active">Active (Visible to customers)</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditCollectionModalOpen(false)}
                  className="px-4 py-2 text-xs text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#800020] text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: EDIT SAREE DETAILS */}
      {/* ======================================================== */}
      {editingSaree && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4 border border-[#E7DFD5]">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Edit Saree Details
              </h3>
              <button
                onClick={() => setEditingSaree(null)}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSareeEdits} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Saree Code (e.g. PSS-001)
                </label>
                <input
                  type="text"
                  value={editingSaree.code}
                  onChange={(e) => setEditingSaree({ ...editingSaree, code: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Saree Name
                </label>
                <input
                  type="text"
                  value={editingSaree.name}
                  onChange={(e) => setEditingSaree({ ...editingSaree, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Optional Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editingSaree.price || ''}
                    onChange={(e) =>
                      setEditingSaree({
                        ...editingSaree,
                        price: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="Leave blank for Enquire"
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Show Price to Customer?
                  </label>
                  <select
                    value={editingSaree.show_price ? 'yes' : 'no'}
                    onChange={(e) =>
                      setEditingSaree({
                        ...editingSaree,
                        show_price: e.target.value === 'yes',
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl"
                  >
                    <option value="no">No (Show &apos;Enquire for Price&apos;)</option>
                    <option value="yes">Yes (Display price)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingSaree.description || ''}
                  onChange={(e) => setEditingSaree({ ...editingSaree, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSaree(null)}
                  className="px-4 py-2 text-xs text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#800020] text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Save Saree
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-4 border border-[#E7DFD5] text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-lg font-bold text-stone-900">
              Confirm Deletion
            </h3>
            <p className="text-xs text-stone-600">
              Are you sure you want to delete {deleteConfirmTarget.type}{' '}
              <strong className="text-stone-900">&quot;{deleteConfirmTarget.name}&quot;</strong>? This action cannot be undone.
            </p>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmTarget.type === 'collection') {
                    handleDeleteCollection(deleteConfirmTarget.id);
                  } else {
                    handleDeleteSaree(deleteConfirmTarget.id);
                  }
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
