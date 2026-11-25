'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { 
  X, 
  FileText, 
  Upload, 
  Check, 
  AlertCircle, 
  Layers, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  RefreshCw,
  Eye,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { Collection, SareeItem } from '@/lib/types';
import { uploadSareeImage, uploadCollectionPdf, isSupabaseConfigured } from '@/lib/supabase';
import { saveCollection, replaceCollection } from '@/lib/data-store';

interface ExtractedSaree {
  id: string;
  code: string;
  name: string;
  fabric: string;
  color: string;
  price?: number;
  blob: Blob;
  previewUrl: string;
  isCover: boolean;
  selected: boolean;
}

interface PdfCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCollections: Collection[];
  onSuccess: (collection: Collection) => void;
}

// Dynamically load PDF.js in the browser
async function loadPdfJs(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if ((window as any).pdfjsLib) {
    return (window as any).pdfjsLib;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(pdfjsLib);
      } else {
        reject(new Error('PDF.js failed to initialize'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js from CDN'));
    document.head.appendChild(script);
  });
}

export default function PdfCollectionModal({
  isOpen,
  onClose,
  existingCollections,
  onSuccess,
}: PdfCollectionModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [extractedSarees, setExtractedSarees] = useState<ExtractedSaree[]>([]);
  
  // Publish mode
  const [publishMode, setPublishMode] = useState<'new' | 'replace'>('new');
  const [targetCollectionId, setTargetCollectionId] = useState<string>(
    existingCollections[0]?.id || ''
  );

  // New collection form state
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState(
    'Exclusive master weaver collection extracted directly from our authentic artisan catalog.'
  );

  // Publishing progress
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle PDF file selection and page-by-page rendering
  const handlePdfSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setErrorMessage('Please select a valid PDF document.');
      return;
    }

    setFile(selectedFile);
    setErrorMessage(null);
    setIsProcessingPdf(true);
    setProgressText('Loading PDF engine...');

    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      const totalPages = pdfDoc.numPages;

      setProgressText(`Extracting ${totalPages} saree pages...`);

      const defaultPrefix = selectedFile.name
        .replace(/\.pdf$/i, '')
        .split(/[\s-_]+/)
        .map((w) => w[0]?.toUpperCase())
        .join('')
        .slice(0, 4) || 'PSS';

      setCollectionName(
        selectedFile.name
          .replace(/\.pdf$/i, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())
      );

      const items: ExtractedSaree[] = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setProgressText(`Rendering page ${pageNum} of ${totalPages}...`);
        const page = await pdfDoc.getPage(pageNum);

        // 1.8x scale for crisp 1200px+ high resolution saree photo
        const viewport = page.getViewport({ scale: 1.8 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;

          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.85);
          });

          const previewUrl = URL.createObjectURL(blob);
          const sareeCode = `${defaultPrefix}-${String(pageNum).padStart(3, '0')}`;

          items.push({
            id: `saree-pdf-${Date.now()}-${pageNum}`,
            code: sareeCode,
            name: `Pochampally Saree ${pageNum}`,
            fabric: '100% Pure Silk',
            color: 'Multicolor',
            blob,
            previewUrl,
            isCover: pageNum === 1,
            selected: true,
          });
        }
      }

      setExtractedSarees(items);
      setProgressText('');
    } catch (err: any) {
      console.error('PDF processing error:', err);
      setErrorMessage(`Failed to process PDF: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessingPdf(false);
      e.target.value = '';
    }
  };

  const handleToggleSelect = (index: number) => {
    setExtractedSarees((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, selected: !s.selected } : s))
    );
  };

  const handleSetCover = (index: number) => {
    setExtractedSarees((prev) =>
      prev.map((s, idx) => ({ ...s, isCover: idx === index }))
    );
  };

  const handleUpdateSareeDetail = (index: number, field: keyof ExtractedSaree, value: any) => {
    setExtractedSarees((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, [field]: value } : s))
    );
  };

  // Publish or Replace in Supabase
  const handlePublish = async () => {
    const selectedItems = extractedSarees.filter((s) => s.selected);
    if (selectedItems.length === 0) {
      setErrorMessage('Please select at least one saree photograph to publish.');
      return;
    }

    if (publishMode === 'new' && !collectionName.trim()) {
      setErrorMessage('Please enter a collection name.');
      return;
    }

    setIsPublishing(true);
    setErrorMessage(null);

    try {
      const colSlug = (
        publishMode === 'new'
          ? collectionName
          : existingCollections.find((c) => c.id === targetCollectionId)?.name || 'collection'
      )
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // 1. Upload original PDF to Supabase Storage if file is present and Supabase is configured
      let pdfUrl: string | undefined;
      if (file && isSupabaseConfigured()) {
        setPublishProgress('Uploading master PDF catalog to Supabase Storage...');
        try {
          pdfUrl = await uploadCollectionPdf(file, colSlug);
        } catch (pdfErr) {
          console.warn('PDF catalog archive error:', pdfErr);
        }
      }

      // 2. Upload extracted saree images to Supabase Storage 'saree-images'
      const uploadedSarees: SareeItem[] = [];
      const parentColId = publishMode === 'new' ? `col-${Date.now()}` : targetCollectionId;
      const parentColName =
        publishMode === 'new'
          ? collectionName.trim()
          : existingCollections.find((c) => c.id === targetCollectionId)?.name || 'Collection';

      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i];
        setPublishProgress(`Uploading photograph ${i + 1} of ${selectedItems.length} to Supabase...`);

        const photoUrl = await uploadSareeImage(item.blob, item.code);

        uploadedSarees.push({
          id: `saree-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          code: item.code,
          name: item.name,
          image_url: photoUrl,
          collection_id: parentColId,
          collection_name: parentColName,
          fabric: item.fabric,
          color: item.color,
          price: item.price ?? null,
          show_price: Boolean(item.price),
          order: i + 1,
          is_cover: item.isCover || (i === 0 && !selectedItems.some((s) => s.isCover)),
          availability: 'available',
          created_at: new Date().toISOString(),
        });
      }

      const coverPhotoUrl =
        uploadedSarees.find((s) => s.is_cover)?.image_url || uploadedSarees[0]?.image_url;

      setPublishProgress('Saving collection & synchronizing across all devices...');

      let finalCollection: Collection;

      if (publishMode === 'new') {
        finalCollection = {
          id: parentColId,
          name: collectionName.trim(),
          slug: colSlug,
          description: collectionDescription.trim(),
          cover_image: coverPhotoUrl,
          display_order: existingCollections.length + 1,
          status: 'active',
          is_featured: true,
          sarees: uploadedSarees,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await saveCollection(finalCollection);
      } else {
        // REPLACE MODE: replaces previous saree records with new PDF sarees
        finalCollection = await replaceCollection(targetCollectionId, {
          name: collectionName.trim() || undefined,
          cover_image: coverPhotoUrl,
          sarees: uploadedSarees,
          updated_at: new Date().toISOString(),
        });
      }

      onSuccess(finalCollection);
      onClose();
    } catch (err: any) {
      console.error('Publish error:', err);
      setErrorMessage(`Publish failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsPublishing(false);
      setPublishProgress('');
    }
  };

  const selectedCount = extractedSarees.filter((s) => s.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border-2 border-[#D4AF37] flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E7DFD5] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#800020] text-[#D4AF37] flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1C1917]">
                Import Saree Collection from PDF Catalog
              </h3>
              <p className="text-xs text-stone-600">
                Upload your wholesale or artisan PDF catalog, extract photographs, and publish directly to Supabase
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-800 rounded-full hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Upload PDF File */}
          {extractedSarees.length === 0 ? (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#D4AF37] hover:border-[#800020] rounded-3xl p-10 sm:p-14 text-center bg-[#FAF7F2] hover:bg-[#F6EFE6] transition-all cursor-pointer space-y-4 group"
              >
                <div className="w-16 h-16 rounded-3xl bg-white border border-[#D4AF37] text-[#800020] mx-auto flex items-center justify-center shadow group-hover:scale-105 transition-transform">
                  <Upload className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <div className="space-y-1">
                  <span className="block font-serif text-base font-bold text-stone-900">
                    Click to browse or drop your Saree Catalog PDF here
                  </span>
                  <span className="block text-xs text-stone-600">
                    Supports multi-page PDF catalogs. Each page will be extracted into a crisp high-res photograph.
                  </span>
                </div>
                <button
                  type="button"
                  disabled={isProcessingPdf}
                  className="px-6 py-2.5 rounded-xl bg-[#800020] text-white text-xs font-bold shadow-md hover:bg-[#660019] transition-colors inline-flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-[#D4AF37]" />
                  <span>{isProcessingPdf ? 'Processing PDF Pages...' : 'Select PDF Catalog'}</span>
                </button>
              </div>

              {isProcessingPdf && (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-[#800020] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <span className="text-xs font-bold text-stone-700 block">{progressText}</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePdfSelected}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            /* STEP 2: Configure & Review Extracted Sarees */
            <div className="space-y-6">
              {/* Publication Mode (New vs Replace) */}
              <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E7DFD5] space-y-3">
                <span className="block font-serif text-xs font-bold uppercase tracking-wider text-[#800020]">
                  Publication Destination:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                      publishMode === 'new'
                        ? 'border-[#800020] bg-white ring-2 ring-[#800020]/20'
                        : 'border-stone-200 bg-white/60 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pubMode"
                      checked={publishMode === 'new'}
                      onChange={() => setPublishMode('new')}
                      className="mt-0.5 text-[#800020]"
                    />
                    <div>
                      <span className="block font-bold text-xs text-stone-900">
                        1. Publish as a New Collection
                      </span>
                      <span className="block text-[11px] text-stone-500 mt-0.5">
                        Creates an entirely new collection category in your digital showroom.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                      publishMode === 'replace'
                        ? 'border-[#800020] bg-white ring-2 ring-[#800020]/20'
                        : 'border-stone-200 bg-white/60 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pubMode"
                      checked={publishMode === 'replace'}
                      onChange={() => setPublishMode('replace')}
                      className="mt-0.5 text-[#800020]"
                    />
                    <div>
                      <span className="block font-bold text-xs text-stone-900">
                        2. Replace an Existing Collection
                      </span>
                      <span className="block text-[11px] text-stone-500 mt-0.5">
                        Replaces all previous photos in a collection with this new PDF catalog.
                      </span>
                    </div>
                  </label>
                </div>

                {publishMode === 'replace' ? (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Choose which existing collection to replace:
                    </label>
                    <select
                      value={targetCollectionId}
                      onChange={(e) => setTargetCollectionId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E7DFD5] text-xs text-stone-900 font-semibold focus:outline-none focus:border-[#800020]"
                    >
                      {existingCollections.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.sarees?.length || 0} existing sarees)
                        </option>
                      ))}
                    </select>
                    <span className="text-[11px] text-amber-700 mt-1 block">
                      ⚠ Confirming replace will remove previous photos from this collection and update it with the {selectedCount} photographs from this PDF.
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        New Collection Name *
                      </label>
                      <input
                        type="text"
                        value={collectionName}
                        onChange={(e) => setCollectionName(e.target.value)}
                        placeholder="e.g. Pochampally Ikat Bridal Collection"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E7DFD5] text-xs text-stone-900 font-semibold focus:outline-none focus:border-[#800020]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Short Description
                      </label>
                      <input
                        type="text"
                        value={collectionDescription}
                        onChange={(e) => setCollectionDescription(e.target.value)}
                        placeholder="Master weavers authentic handlooms..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E7DFD5] text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Extracted Sarees Preview Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm font-bold text-stone-900">
                      Extracted Saree Pages ({selectedCount} of {extractedSarees.length} selected)
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    Click radio to select Cover Photo
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto p-1 border border-stone-200 rounded-2xl bg-stone-50">
                  {extractedSarees.map((saree, idx) => (
                    <div
                      key={saree.id}
                      className={`relative bg-white rounded-xl overflow-hidden border-2 transition-all p-2 space-y-2 ${
                        saree.selected ? 'border-[#800020]' : 'border-stone-200 opacity-60'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-stone-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={saree.previewUrl}
                          alt={saree.code}
                          className="w-full h-full object-cover object-top"
                        />

                        {/* Select Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleSelect(idx)}
                          className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                            saree.selected ? 'bg-[#800020] text-white' : 'bg-black/50 text-white'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        {/* Cover Radio */}
                        <button
                          type="button"
                          onClick={() => handleSetCover(idx)}
                          title="Set as Collection Cover"
                          className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            saree.isCover
                              ? 'bg-[#D4AF37] text-stone-900 shadow'
                              : 'bg-black/50 text-white hover:bg-black/70'
                          }`}
                        >
                          {saree.isCover ? 'Cover' : 'Set Cover'}
                        </button>
                      </div>

                      {/* Metadata Inputs */}
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={saree.code}
                          onChange={(e) => handleUpdateSareeDetail(idx, 'code', e.target.value)}
                          placeholder="Code"
                          className="w-full px-2 py-1 rounded bg-stone-50 border border-stone-200 text-[11px] font-mono font-bold text-[#800020]"
                        />
                        <input
                          type="text"
                          value={saree.name}
                          onChange={(e) => handleUpdateSareeDetail(idx, 'name', e.target.value)}
                          placeholder="Saree Name"
                          className="w-full px-2 py-1 rounded bg-stone-50 border border-stone-200 text-[10px] text-stone-800"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#E7DFD5] bg-[#FAF7F2] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-600 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#800020]" />
            <span>
              {isSupabaseConfigured()
                ? 'Cloud connected: Saree photographs will be stored permanently in Supabase'
                : 'Warning: Supabase credentials not set in Settings'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {extractedSarees.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setExtractedSarees([]);
                  setFile(null);
                }}
                disabled={isPublishing}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-700 cursor-pointer"
              >
                Reset PDF
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={isPublishing}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#E7DFD5] hover:bg-stone-100 text-xs font-semibold text-stone-700 cursor-pointer"
            >
              Cancel
            </button>

            {extractedSarees.length > 0 && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || selectedCount === 0}
                className="px-6 py-2.5 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isPublishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{publishProgress || 'Publishing to Supabase...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>
                      {publishMode === 'new'
                        ? `Publish New Collection (${selectedCount} Sarees)`
                        : `Replace Collection (${selectedCount} Sarees)`}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
