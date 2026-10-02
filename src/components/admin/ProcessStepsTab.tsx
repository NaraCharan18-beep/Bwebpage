'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  ListOrdered 
} from 'lucide-react';
import { ProcessStep } from '@/lib/types';
import { uploadSareeImage } from '@/lib/supabase';

interface ProcessStepsTabProps {
  steps: ProcessStep[];
  onSaveStep: (step: ProcessStep) => Promise<void>;
  onDeleteStep: (id: string) => Promise<void>;
}

export default function ProcessStepsTab({
  steps,
  onSaveStep,
  onDeleteStep,
}: ProcessStepsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<ProcessStep | null>(null);

  // Form states
  const [formNumber, setFormNumber] = useState<number>(1);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const sortedSteps = [...steps].sort((a, b) => a.display_order - b.display_order);

  const handleOpenAdd = () => {
    setEditingStep(null);
    setFormNumber(steps.length + 1);
    setFormTitle('');
    setFormDescription('');
    setFormImageUrl('/images/craft_tie_dye.jpg');
    setFormOrder(steps.length + 1);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (step: ProcessStep) => {
    setEditingStep(step);
    setFormNumber(step.step_number);
    setFormTitle(step.title);
    setFormDescription(step.description);
    setFormImageUrl(step.image_url);
    setFormOrder(step.display_order);
    setFormIsActive(step.is_active);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadSareeImage(file);
      setFormImageUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newStep: ProcessStep = {
      id: editingStep ? editingStep.id : `step-${Date.now()}`,
      step_number: Number(formNumber) || 1,
      title: formTitle.trim(),
      description: formDescription.trim(),
      image_url: formImageUrl || '/images/craft_tie_dye.jpg',
      display_order: Number(formOrder) || 1,
      is_active: formIsActive,
      created_at: editingStep?.created_at || new Date().toISOString(),
    };

    await onSaveStep(newStep);
    setIsModalOpen(false);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sortedSteps.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const current = sortedSteps[index];
    const target = sortedSteps[targetIndex];

    const tempOrder = current.display_order;
    await onSaveStep({ ...current, display_order: target.display_order });
    await onSaveStep({ ...target, display_order: tempOrder });
  };

  const handleToggleActive = async (step: ProcessStep) => {
    await onSaveStep({ ...step, is_active: !step.is_active });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E7DFD5] shadow-xs">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#1C1917]">
            How Our Sarees Are Made (Craft Story)
          </h2>
          <p className="text-xs text-stone-500">
            Customize the step-by-step handloom weaving narrative shown on the customer website
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#660019] text-white text-xs font-bold shadow transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Weaving Step</span>
        </button>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {sortedSteps.map((step, idx) => (
          <div
            key={step.id}
            className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              step.is_active ? 'border-[#E7DFD5]' : 'border-stone-200 opacity-60'
            }`}
          >
            <div className="flex items-start sm:items-center gap-4">
              {/* Order Controls */}
              <div className="flex flex-col gap-1 items-center">
                <button
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 h-8 rounded-full bg-[#800020] text-[#D4AF37] font-serif font-bold text-xs flex items-center justify-center">
                  {step.step_number || idx + 1}
                </span>
                <button
                  disabled={idx === sortedSteps.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Photo Thumbnail */}
              <div className="relative w-20 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                <Image
                  src={step.image_url || '/images/craft_tie_dye.jpg'}
                  alt={step.title}
                  fill
                  className="object-cover object-center"
                />
              </div>

              {/* Info */}
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-base font-bold text-stone-900">
                    {step.title}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      step.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {step.is_active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                onClick={() => handleToggleActive(step)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700"
              >
                {step.is_active ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => handleOpenEdit(step)}
                className="p-2 text-stone-600 hover:text-[#800020] hover:bg-stone-100 rounded-lg"
                title="Edit Step"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteStep(step.id)}
                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                title="Delete Step"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Step Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)}></div>

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E7DFD5] overflow-hidden my-auto z-10 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7DFD5] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#800020]">
                {editingStep ? 'Edit Process Step' : 'Add Weaving Step'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Step Number
                  </label>
                  <input
                    type="number"
                    value={formNumber}
                    onChange={(e) => setFormNumber(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Step Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Ikat Tie & Resist Dyeing"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Explain how master artisans perform this step..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Step Photo URL or Upload
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="/images/... or https://..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E7DFD5] text-xs text-stone-900"
                  />
                  <label className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? '...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 text-xs font-medium text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded text-[#800020]"
                  />
                  <span>Show this step on customer website</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#E7DFD5] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#800020] text-white text-xs font-bold shadow"
                >
                  Save Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
