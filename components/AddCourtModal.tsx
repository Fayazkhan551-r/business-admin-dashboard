'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Home,
  Sun,
  Zap,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  Court,
  CourtType,
  CourtEnvironment,
  CourtLightingType,
  validateCourtInput,
  formatHourlyRateTag,
} from '@/lib/club-logic';
import { CourtVisualPreview } from './CourtVisualPreview';

interface AddCourtModalProps {
  isOpen: boolean;
  initialCourt?: Court | null;
  onClose: () => void;
  onSaveCourt: (court: Court, isEdit: boolean) => void;
}

const COURT_TYPE_OPTIONS: CourtType[] = [
  'Full Panoramic Glass',
  'Super Panoramic',
  'Standard Mesh',
];

const LIGHTING_OPTIONS: CourtLightingType[] = [
  'LED Floodlights (Included)',
  'LED Floodlights (Extra)',
];

const PHOTO_PRESETS = [
  { id: 'super-panoramic-blue', label: 'Mondo Blue Supercourt' },
  { id: 'panoramic-indoor-emerald', label: 'Indoor Arena View' },
  { id: 'outdoor-sunset-court', label: 'Outdoor Floodlit Turf' },
];

export function AddCourtModal(props: AddCourtModalProps) {
  if (!props.isOpen) return null;

  return (
    <AddCourtModalContent
      key={props.initialCourt?.id ?? 'new-court'}
      {...props}
    />
  );
}

function AddCourtModalContent({
  initialCourt = null,
  onClose,
  onSaveCourt,
}: AddCourtModalProps) {
  const isEditMode = Boolean(initialCourt);

  const [name, setName] = useState(initialCourt?.name || '');
  const [type, setType] = useState<CourtType>(
    initialCourt?.type || 'Full Panoramic Glass'
  );
  const [environment, setEnvironment] = useState<CourtEnvironment>(
    initialCourt?.environment || 'Indoor'
  );
  const [baseRatePkr, setBaseRatePkr] = useState(
    initialCourt ? String(initialCourt.baseRatePkr) : '4000'
  );
  const [peakRatePkr, setPeakRatePkr] = useState(
    initialCourt ? String(initialCourt.peakRatePkr) : '7000'
  );
  const [lighting, setLighting] = useState<CourtLightingType>(
    initialCourt?.lighting || 'LED Floodlights (Included)'
  );
  const [photoUrl, setPhotoUrl] = useState(
    initialCourt?.photoUrl || 'super-panoramic-blue'
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePhotoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        photo: 'Please select a valid PNG, JPG, or WEBP image.',
      }));
      return;
    }
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setPhotoUrl(e.target.result);
        setErrors((prev) => {
          const next = { ...prev };
          delete next.photo;
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCourtInput({
      name,
      type,
      environment,
      baseRatePkr,
      peakRatePkr,
      lighting,
      photoUrl,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    const savedCourt: Court = {
      id: initialCourt?.id || `court-${Date.now()}`,
      name: name.trim(),
      type,
      environment,
      baseRatePkr: Number(baseRatePkr),
      peakRatePkr: Number(peakRatePkr),
      status: initialCourt?.status || 'Active',
      surface:
        type === 'Standard Mesh'
          ? 'Pro-Turf High Density'
          : 'Mondo Supercourt XN Blue',
      lighting,
      utilizationPct: initialCourt?.utilizationPct ?? 88,
      bookingsToday: initialCourt?.bookingsToday ?? 9,
      photoUrl,
    };

    onSaveCourt(savedCourt, isEditMode);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="court-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Smooth Backdrop Blur */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Modal Header (Dark Slate Accent Header) */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4 text-white">
          <div>
            <span className="text-[11px] font-semibold text-emerald-400">
              PakPadel Court Configuration
            </span>
            <h2
              id="court-modal-title"
              className="font-display text-lg font-bold tracking-tight text-white"
            >
              {isEditMode ? `Edit ${initialCourt?.name}` : '+ Add New Court'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="max-h-[82vh] overflow-y-auto p-6 space-y-5"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* 1. Court Name */}
            <div className="sm:col-span-2">
              <label
                htmlFor="modal-court-name"
                className="block text-xs font-semibold text-slate-700"
              >
                Court Name
              </label>
              <input
                ref={nameInputRef}
                id="modal-court-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Court 5 - Full Panoramic"
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              {errors.name && (
                <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {errors.name}
                </p>
              )}
            </div>

            {/* 2. Court Type Dropdown */}
            <div>
              <label
                htmlFor="modal-court-type"
                className="block text-xs font-semibold text-slate-700"
              >
                Court Type
              </label>
              <select
                id="modal-court-type"
                value={type}
                onChange={(e) => setType(e.target.value as CourtType)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {COURT_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Environment Toggle: Indoor vs Outdoor */}
            <div>
              <span className="block text-xs font-semibold text-slate-700">
                Environment
              </span>
              <div
                role="group"
                aria-label="Court Environment Toggle"
                className="mt-1.5 grid grid-cols-2 gap-1.5 rounded-lg bg-slate-100 p-1"
              >
                <button
                  type="button"
                  onClick={() => setEnvironment('Indoor')}
                  aria-pressed={environment === 'Indoor'}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    environment === 'Indoor'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Home className="h-3.5 w-3.5 text-emerald-400" />
                  Indoor
                </button>
                <button
                  type="button"
                  onClick={() => setEnvironment('Outdoor')}
                  aria-pressed={environment === 'Outdoor'}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    environment === 'Outdoor'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  Outdoor
                </button>
              </div>
            </div>

            {/* 4. Base Hourly Rate (PKR) */}
            <div>
              <label
                htmlFor="modal-base-rate"
                className="block text-xs font-semibold text-slate-700"
              >
                Base Hourly Rate (PKR)
              </label>
              <input
                id="modal-base-rate"
                type="number"
                min={1000}
                step={500}
                value={baseRatePkr}
                onChange={(e) => setBaseRatePkr(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 tabular-nums transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <span className="mt-1 block font-mono text-[11px] text-slate-500 tabular-nums">
                Preview: {formatHourlyRateTag(Number(baseRatePkr) || 0, 'Base')}
              </span>
              {errors.baseRatePkr && (
                <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {errors.baseRatePkr}
                </p>
              )}
            </div>

            {/* 5. Peak Hourly Rate (PKR) */}
            <div>
              <label
                htmlFor="modal-peak-rate"
                className="block text-xs font-semibold text-slate-700"
              >
                Peak Hourly Rate (PKR)
              </label>
              <input
                id="modal-peak-rate"
                type="number"
                min={1000}
                step={500}
                value={peakRatePkr}
                onChange={(e) => setPeakRatePkr(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 tabular-nums transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <span className="mt-1 block font-mono text-[11px] text-emerald-600 tabular-nums">
                Preview: {formatHourlyRateTag(Number(peakRatePkr) || 0, 'Peak')}
              </span>
              {errors.peakRatePkr && (
                <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {errors.peakRatePkr}
                </p>
              )}
            </div>

            {/* 6. Lighting Type: LED Floodlights (Included / Extra) */}
            <div className="sm:col-span-2">
              <label
                htmlFor="modal-lighting-type"
                className="block text-xs font-semibold text-slate-700"
              >
                Lighting Type
              </label>
              <div className="mt-1.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {LIGHTING_OPTIONS.map((option) => {
                  const selected = lighting === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLighting(option)}
                      aria-pressed={selected}
                      className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-xs font-semibold transition-colors ${
                        selected
                          ? 'border-emerald-500 bg-emerald-50/70 text-slate-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Zap
                          className={`h-4 w-4 ${
                            selected ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        />
                        <span>{option}</span>
                      </span>
                      {selected && (
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. Court Photo Upload Preview Zone */}
            <div className="sm:col-span-2">
              <span className="block text-xs font-semibold text-slate-700">
                Court Photo Upload & Live Card Preview
              </span>
              <div className="mt-1.5 grid grid-cols-1 gap-4 sm:grid-cols-12 items-stretch">
                {/* Live Visual Preview */}
                <div className="sm:col-span-5 overflow-hidden rounded-xl border border-slate-200">
                  <CourtVisualPreview
                    photoUrl={photoUrl}
                    courtName={name || 'New Padel Court'}
                    courtType={type}
                    environment={environment}
                    className="h-36"
                  />
                </div>

                {/* Upload Dropzone & Presets */}
                <div className="sm:col-span-7 flex flex-col justify-between space-y-2.5">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handlePhotoFile(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    aria-label="Upload Court Photo"
                    className={`flex flex-1 cursor-pointer items-center justify-between gap-3 rounded-xl border-2 border-dashed px-4 py-3 transition-colors ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50/60'
                        : 'border-slate-300 bg-slate-50 hover:border-emerald-500 hover:bg-slate-100/60'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      aria-label="Court photo file input"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoFile(file);
                      }}
                    />
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-emerald-400">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">
                          {uploadedFileName || 'Drop court photo or browse'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          High-res 16:9 JPG, PNG or WEBP
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600">
                      Browse
                    </span>
                  </div>

                  {/* Quick Camera Angle Presets */}
                  <div className="flex flex-wrap gap-1.5">
                    {PHOTO_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setPhotoUrl(preset.id);
                          setUploadedFileName(null);
                        }}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                          photoUrl === preset.id
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {errors.photo && (
                <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {errors.photo}
                </p>
              )}
            </div>
          </div>

          {/* Modal Action Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-xs transition-colors hover:bg-emerald-400 whitespace-nowrap shrink-0"
            >
              <Check className="h-4 w-4 stroke-[2.5]" />
              <span>Save Court</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
