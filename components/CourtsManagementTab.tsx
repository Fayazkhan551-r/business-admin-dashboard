'use client';

import React, { useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  Wrench,
  CheckCircle2,
  Zap,
  Check,
} from 'lucide-react';
import {
  Court,
  CourtType,
  CourtEnvironment,
  formatPkr,
  formatHourlyRateTag,
  filterCourts,
  calculateClubMetrics,
} from '@/lib/club-logic';
import { CourtVisualPreview } from './CourtVisualPreview';

interface CourtsManagementTabProps {
  courts: Court[];
  clubName: string;
  peakWindowLabel: string;
  lastSavedMessage?: string | null;
  onOpenAddModal: () => void;
  onOpenEditModal: (court: Court) => void;
  onUpdateCourt: (court: Court) => void;
  onDeleteCourt: (courtId: string) => void;
}

export function CourtsManagementTab({
  courts,
  clubName,
  peakWindowLabel,
  lastSavedMessage,
  onOpenAddModal,
  onOpenEditModal,
  onUpdateCourt,
  onDeleteCourt,
}: CourtsManagementTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [envFilter, setEnvFilter] = useState<'All' | CourtEnvironment>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | CourtType>('All');

  const filteredCourts = filterCourts(courts, {
    query: searchQuery,
    environment: envFilter,
    type: typeFilter,
  });

  const metrics = calculateClubMetrics(courts);

  const handleToggleStatus = (court: Court) => {
    onUpdateCourt({
      ...court,
      status: court.status === 'Active' ? 'In Maintenance' : 'Active',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Courts Telemetry Summary with "Configured Padel Courts" counter */}
      <section
        aria-label="Courts summary metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            Configured Padel Courts
          </p>
          <p
            data-testid="configured-courts-counter"
            className="mt-1.5 font-mono text-2xl font-bold text-slate-900 tabular-nums"
          >
            {metrics.activeCourts} / {metrics.totalCourts}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {metrics.indoorCount} Indoor · {metrics.outdoorCount} Outdoor
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            Average Base Rate
          </p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {formatPkr(metrics.avgBaseRatePkr)}/hr
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Standard daytime court tariff
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            Average Peak Rate
          </p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-emerald-600 tabular-nums">
            {formatPkr(metrics.avgPeakRatePkr)}/hr
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500 tabular-nums">
            Peak window: {peakWindowLabel}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">
            Operational Status
          </p>
          <p className="mt-1.5 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {metrics.activeCourts} Active
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {metrics.maintenanceCourts} In Maintenance
          </p>
        </div>
      </section>

      {/* Confirmation Banner when a court is added or edited */}
      {lastSavedMessage && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-xs font-semibold text-emerald-950"
        >
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{lastSavedMessage}</span>
          </div>
          <span className="font-mono text-emerald-700 tabular-nums">
            Total Courts: {metrics.totalCourts}
          </span>
        </div>
      )}

      {/* Filter, Search & "+ Add New Court" Action Bar */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search courts by name or surface"
            placeholder="Search courts by title, glass type, or lighting..."
            className="min-h-[44px] w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented Environment Filter */}
          <div
            role="group"
            aria-label="Filter courts by environment"
            className="flex flex-1 sm:flex-initial items-center gap-1 rounded-lg bg-slate-100 p-1"
          >
            {(['All', 'Indoor', 'Outdoor'] as const).map((env) => (
              <button
                key={env}
                type="button"
                onClick={() => setEnvFilter(env)}
                className={`min-h-[36px] flex-1 sm:flex-initial rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  envFilter === env
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {env}
              </button>
            ))}
          </div>

          {/* Court Type Filter */}
          <select
            aria-label="Filter by court glass type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'All' | CourtType)}
            className="min-h-[44px] flex-1 sm:flex-initial rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="All">All Court Types</option>
            <option value="Full Panoramic Glass">Full Panoramic Glass</option>
            <option value="Super Panoramic">Super Panoramic</option>
            <option value="Standard Mesh">Standard Mesh</option>
          </select>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-400" />
            <span>Add Court</span>
          </button>
        </div>
      </div>

      {/* Responsive Grid of Configured Padel Courts */}
      {filteredCourts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <p className="font-display text-base font-bold text-slate-900">
            No matching padel courts found
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Clear your search filters or add a new padel court to {clubName}.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setEnvFilter('All');
                setTypeFilter('All');
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
            >
              <Plus className="h-3.5 w-3.5" />
              + Add New Court
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourts.map((court) => {
            const isActive = court.status === 'Active';

            return (
              <article
                key={court.id}
                className="flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-slate-300"
              >
                <div>
                  {/* 1. Court Image with "Indoor" or "Outdoor" glass badge */}
                  <CourtVisualPreview
                    photoUrl={court.photoUrl}
                    courtName={court.name}
                    courtType={court.type}
                    environment={court.environment}
                    className="h-44"
                  />

                  <div className="p-5">
                    {/* 2. Court Title & Status Toggle */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-base font-bold tracking-tight text-slate-900">
                          {court.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {court.type} · {court.surface}
                        </p>
                      </div>

                      {/* 4. Interactive Status Toggle: Active / In Maintenance */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isActive}
                        aria-label={`Status toggle for ${court.name}: currently ${court.status}`}
                        onClick={() => handleToggleStatus(court)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                          isActive
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                        }`}
                      >
                        {isActive ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Wrench className="h-3.5 w-3.5 text-amber-600" />
                        )}
                        <span>{court.status}</span>
                      </button>
                    </div>

                    {/* 3. Pricing Summary: "PKR 4,000/hr (Base)" and "PKR 7,000/hr (Peak)" */}
                    <div className="mt-4 grid grid-cols-2 gap-3 border-y border-slate-100 py-3.5">
                      <div>
                        <span className="block text-[11px] font-medium text-slate-500">
                          Off-Peak Tariff
                        </span>
                        <span className="mt-0.5 block font-mono text-xs font-bold text-slate-900 tabular-nums">
                          {formatHourlyRateTag(court.baseRatePkr, 'Base')}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] font-medium text-slate-500">
                          Floodlight Peak Tariff
                        </span>
                        <span className="mt-0.5 block font-mono text-xs font-bold text-emerald-600 tabular-nums">
                          {formatHourlyRateTag(court.peakRatePkr, 'Peak')}
                        </span>
                      </div>
                    </div>

                    {/* Lighting & Utilization Line */}
                    <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 truncate">
                        <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{court.lighting}</span>
                      </span>
                      <span className="font-mono tabular-nums whitespace-nowrap shrink-0">
                        {court.bookingsToday} slots · {court.utilizationPct}% util
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Edit and Delete Action Icons Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-3">
                  <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                    ID: {court.id.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenEditModal(court)}
                      aria-label={`Edit ${court.name}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-emerald-500 hover:text-emerald-700 whitespace-nowrap shrink-0"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCourt(court.id)}
                      aria-label={`Delete ${court.name}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 whitespace-nowrap shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {/* Interactive "+ Add New Court" Grid Trigger Card */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-6 text-center transition-colors hover:border-emerald-500 hover:bg-emerald-50/30 group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-emerald-400 transition-transform group-hover:scale-105">
              <Plus className="h-6 w-6" />
            </div>
            <span className="mt-3.5 font-display text-base font-bold text-slate-900">
              + Add New Court
            </span>
            <span className="mt-1 max-w-[220px] text-xs text-slate-500">
              Configure glass specification, Indoor/Outdoor environment, LED floodlights, and PKR rates.
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
