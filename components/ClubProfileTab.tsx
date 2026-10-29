'use client';

import React, { useState, useRef } from 'react';
import {
  Building2,
  Clock,
  Upload,
  Check,
  Image as ImageIcon,
  RotateCcw,
  Save,
  MapPin,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import {
  ClubBranch,
  validateClubProfileInput,
  calculateClubMetrics,
  formatPkr,
} from '@/lib/club-logic';

interface ClubProfileTabProps {
  club: ClubBranch;
  onUpdateClub: (updated: ClubBranch) => void;
  onNavigateToCourts: () => void;
}

const BANNER_PRESETS = [
  {
    id: 'stadium-night',
    label: 'Center Court Floodlight Arena',
    url: 'preset:stadium-night',
  },
  {
    id: 'indoor-dome',
    label: 'Climate-Controlled Blue Mondo Turf',
    url: 'preset:indoor-dome',
  },
  {
    id: 'emerald-club',
    label: 'Islamabad Enclave Show Court',
    url: 'preset:emerald-club',
  },
];

export function ClubProfileTab({
  club,
  onUpdateClub,
  onNavigateToCourts,
}: ClubProfileTabProps) {
  const [name, setName] = useState(club.name);
  const [city, setCity] = useState(club.city);
  const [address, setAddress] = useState(club.address);
  const [contactPhone, setContactPhone] = useState(club.contactPhone);
  const [openingTime, setOpeningTime] = useState(club.openingTime);
  const [closingTime, setClosingTime] = useState(club.closingTime);
  const [peakStartTime, setPeakStartTime] = useState(club.peakStartTime);
  const [peakEndTime, setPeakEndTime] = useState(club.peakEndTime);
  const [amenities, setAmenities] = useState(club.amenities);
  const [bannerUrl, setBannerUrl] = useState(
    club.bannerUrl.startsWith('data:image/')
      ? club.bannerUrl
      : 'preset:stadium-night'
  );
  const [bannerFileName, setBannerFileName] = useState(
    'islamabad-center-court-cover.jpg'
  );
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync local form when user switches club branch in top navbar
  const [prevClubId, setPrevClubId] = useState(club.id);
  if (club.id !== prevClubId) {
    setPrevClubId(club.id);
    setName(club.name);
    setCity(club.city);
    setAddress(club.address);
    setContactPhone(club.contactPhone);
    setOpeningTime(club.openingTime);
    setClosingTime(club.closingTime);
    setPeakStartTime(club.peakStartTime);
    setPeakEndTime(club.peakEndTime);
    setAmenities(club.amenities);
    setBannerUrl(
      club.bannerUrl.startsWith('data:image/')
        ? club.bannerUrl
        : 'preset:stadium-night'
    );
    setErrors({});
    setSaveSuccessMessage(null);
  }

  const handleAmenityToggle = (amenityId: string) => {
    const next = amenities.map((item) =>
      item.id === amenityId ? { ...item, enabled: !item.enabled } : item
    );
    setAmenities(next);
    setSaveSuccessMessage(null);
    onUpdateClub({
      ...club,
      name,
      city,
      address,
      contactPhone,
      openingTime,
      closingTime,
      peakStartTime,
      peakEndTime,
      bannerUrl,
      amenities: next,
    });
  };

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        banner: 'Please upload a valid PNG, JPG, or WEBP image file.',
      }));
      return;
    }
    setBannerFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setBannerUrl(result);
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.banner;
          return copy;
        });
        onUpdateClub({
          ...club,
          bannerUrl: result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileProcess(droppedFile);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateClubProfileInput({
      name,
      city,
      openingTime,
      closingTime,
    });
    if (!validation.valid) {
      setErrors(validation.errors);
      setSaveSuccessMessage(null);
      return;
    }

    setErrors({});
    const updatedClub: ClubBranch = {
      ...club,
      name: name.trim(),
      label: name.trim(),
      city: city.trim(),
      address: address.trim(),
      contactPhone: contactPhone.trim(),
      openingTime,
      closingTime,
      peakStartTime,
      peakEndTime,
      amenities,
      bannerUrl,
    };
    onUpdateClub(updatedClub);
    setSaveSuccessMessage(
      `Facility profile for "${updatedClub.name}" (${updatedClub.city}) saved and synced.`
    );
  };

  const handleResetDefaults = () => {
    setName(club.name);
    setCity(club.city);
    setAddress(club.address);
    setContactPhone(club.contactPhone);
    setOpeningTime(club.openingTime);
    setClosingTime(club.closingTime);
    setPeakStartTime(club.peakStartTime);
    setPeakEndTime(club.peakEndTime);
    setAmenities(club.amenities);
    setBannerUrl(
      club.bannerUrl.startsWith('data:image/')
        ? club.bannerUrl
        : 'preset:stadium-night'
    );
    setErrors({});
    setSaveSuccessMessage(null);
  };

  const enabledAmenitiesCount = amenities.filter((a) => a.enabled).length;
  const metrics = calculateClubMetrics(club.courts);
  const isCustomBanner = bannerUrl.startsWith('data:image/');

  return (
    <div className="space-y-6">
      {/* Top Metrics & Stats Cards: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 */}
      <section
        aria-label="Club operational metrics"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            Active Club Members · {city}
          </p>
          <p className="mt-1.5 font-mono text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            3.2K+
          </p>
          <p className="mt-1 text-xs text-slate-500">
            240+ matches played monthly
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            Configured Padel Courts
          </p>
          <p className="mt-1.5 font-mono text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {metrics.activeCourts} / {metrics.totalCourts}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {metrics.indoorCount} Indoor · {metrics.outdoorCount} Outdoor
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            Average Court Utilization
          </p>
          <p className="mt-1.5 font-mono text-2xl font-bold tracking-tight text-emerald-600 tabular-nums">
            {metrics.avgUtilizationPct}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            99% member satisfaction rate
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            Est. Daily Court Revenue
          </p>
          <p className="mt-1.5 font-mono text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {formatPkr(metrics.estimatedDailyRevenuePkr)}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500 tabular-nums">
            Avg Peak: {formatPkr(metrics.avgPeakRatePkr)}/hr
          </p>
        </div>
      </section>

      {/* Main Responsive Form Grid: grid-cols-1 lg:grid-cols-2 gap-6 */}
      <form onSubmit={handleSaveProfile} noValidate className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Card 1: 01. Club Identity & Operating Schedule */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-display text-lg font-bold tracking-tight text-slate-900">
                    01. Club Identity & Operating Schedule
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Configure core venue details displayed on the PakPadel booking directory.
                  </p>
                </div>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  Branch ID: {club.id.toUpperCase()}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="club-name-input"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Club Name
                  </label>
                  <div className="relative mt-1.5">
                    <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="club-name-input"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setSaveSuccessMessage(null);
                      }}
                      placeholder="e.g. PakPadel Club - Islamabad Center"
                      className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  {errors.name && (
                    <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="club-city-select"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    City
                  </label>
                  <div className="relative mt-1.5">
                    <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      id="club-city-select"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setSaveSuccessMessage(null);
                      }}
                      className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-8 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="Islamabad">Islamabad</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Multan">Multan</option>
                    </select>
                  </div>
                  {errors.city && (
                    <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="club-phone-input"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Front Desk Phone (PK)
                  </label>
                  <div className="relative mt-1.5">
                    <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="club-phone-input"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 font-mono text-sm text-slate-900 tabular-nums transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="club-address-input"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Venue Street Address
                  </label>
                  <input
                    id="club-address-input"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Operating Hours */}
                <div>
                  <label
                    htmlFor="club-opening-time"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Operating Hours — Opens At
                  </label>
                  <div className="relative mt-1.5">
                    <Clock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="club-opening-time"
                      type="time"
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                      className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 font-mono text-sm text-slate-900 tabular-nums transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="club-closing-time"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Operating Hours — Closes At
                  </label>
                  <div className="relative mt-1.5">
                    <Clock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="club-closing-time"
                      type="time"
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                      className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 font-mono text-sm text-slate-900 tabular-nums transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                {/* Peak Hour Window */}
                <div>
                  <label
                    htmlFor="club-peak-start"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Peak Rate Window — Start
                  </label>
                  <input
                    id="club-peak-start"
                    type="time"
                    value={peakStartTime}
                    onChange={(e) => setPeakStartTime(e.target.value)}
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 tabular-nums transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="club-peak-end"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Peak Rate Window — End
                  </label>
                  <input
                    id="club-peak-end"
                    type="time"
                    value={peakEndTime}
                    onChange={(e) => setPeakEndTime(e.target.value)}
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 tabular-nums transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: 03. Banner Cover Image Upload (No Public Hero Footer Banner) */}
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-display text-lg font-bold tracking-tight text-slate-900">
                    03. Banner Cover Image
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Drag and drop a high-resolution club cover photo (16:9 recommended).
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Cover Synced
                </span>
              </div>

              {/* Full-Width Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Upload Banner Cover Image"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className={`mt-5 w-full flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/60'
                    : 'border-slate-300 bg-slate-50/70 hover:border-emerald-500 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  aria-label="Banner Cover Image File Input"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileProcess(file);
                  }}
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-emerald-400">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="mt-3.5 text-sm font-semibold text-slate-900">
                  Drop club cover image here, or{' '}
                  <span className="text-emerald-600 underline">browse file</span>
                </p>
                <p className="mt-1 font-mono text-xs text-slate-500 tabular-nums">
                  Active file: {bannerFileName} · 1920×1080px PNG/JPG
                </p>
              </div>

              {errors.banner && (
                <p role="alert" className="mt-2 text-xs font-medium text-red-600">
                  {errors.banner}
                </p>
              )}

              {/* Uploaded Custom File Preview (only if user uploads a custom file) */}
              {isCustomBanner && (
                <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bannerUrl}
                    alt="Uploaded club cover preview"
                    referrerPolicy="no-referrer"
                    className="h-32 w-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Quick Cover Preset Selector */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <span className="block text-xs font-semibold text-slate-600">
                Cover theme preset:
              </span>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {BANNER_PRESETS.map((preset) => {
                  const active = bannerUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setBannerUrl(preset.url);
                        setBannerFileName(`${preset.id}.jpg`);
                        onUpdateClub({ ...club, bannerUrl: preset.url });
                      }}
                      className={`min-h-[44px] inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Section: 02. Club Amenities & Infrastructure */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight text-slate-900">
                02. Club Amenities & Infrastructure
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Select active on-site facilities available to players when booking a court.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-medium text-slate-600 tabular-nums">
                {enabledAmenitiesCount} of {amenities.length} Active
              </span>
              <button
                type="button"
                onClick={() => {
                  const allEnabled = amenities.every((a) => a.enabled);
                  const next = amenities.map((a) => ({
                    ...a,
                    enabled: !allEnabled,
                  }));
                  setAmenities(next);
                  onUpdateClub({ ...club, amenities: next });
                }}
                className="min-h-[44px] rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 whitespace-nowrap shrink-0"
              >
                {amenities.every((a) => a.enabled) ? 'Clear All' : 'Enable All'}
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {amenities.map((amenity) => {
              const checkboxId = `amenity-checkbox-${amenity.id}`;
              return (
                <label
                  key={amenity.id}
                  htmlFor={checkboxId}
                  className={`flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-4 transition-colors ${
                    amenity.enabled
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      id={checkboxId}
                      type="checkbox"
                      checked={amenity.enabled}
                      onChange={() => handleAmenityToggle(amenity.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="block text-sm font-semibold text-slate-900">
                        {amenity.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {amenity.description}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-xs font-medium tabular-nums whitespace-nowrap shrink-0 ${
                      amenity.enabled ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {amenity.enabled ? 'Included' : 'Disabled'}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Save & Reset Bar cleanly concluding the form */}
        {saveSuccessMessage && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900"
          >
            <div className="flex items-center gap-2.5">
              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{saveSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={onNavigateToCourts}
              className="text-xs font-semibold text-emerald-700 underline hover:text-emerald-900 whitespace-nowrap shrink-0"
            >
              Manage Courts →
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Changes
          </button>
          <button
            type="submit"
            className="min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-xs transition-colors hover:bg-emerald-400 whitespace-nowrap shrink-0"
          >
            <Save className="h-4 w-4" />
            Save Club Profile
          </button>
        </div>
      </form>
    </div>
  );
}
