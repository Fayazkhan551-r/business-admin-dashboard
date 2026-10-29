'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Plus,
  Check,
  X,
  User,
  Phone,
  CreditCard,
  Banknote,
  Wrench,
  Filter,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import {
  ClubBranch,
  Court,
  MATRIX_TIME_SLOTS,
  INITIAL_MATRIX_BOOKINGS,
  MatrixBookingSlot,
  BookingDurationMins,
  BookingPaymentMethod,
  formatMatrixDateLabel,
  stepMatrixDate,
  calculateWalkInPricePkr,
  validateWalkInBookingInput,
  formatPkr,
} from '@/lib/club-logic';

type CourtFilterOption = 'All Courts' | 'Indoor Only' | 'Outdoor Only';

export function BookingMatrixView({
  club,
  onSwitchToTab,
}: {
  club: ClubBranch;
  onSwitchToTab: (tab: 'profile' | 'courts') => void;
}) {
  const [selectedDateIso, setSelectedDateIso] = useState('2026-10-23');
  const [courtFilter, setCourtFilter] =
    useState<CourtFilterOption>('All Courts');
  const [bookings, setBookings] = useState<Record<string, MatrixBookingSlot>>(
    INITIAL_MATRIX_BOOKINGS
  );
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Walk-in Booking Modal State
  const [activeSlotTarget, setActiveSlotTarget] = useState<{
    court: Court;
    timeSlot: string;
  } | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+92 300 ');
  const [durationMins, setDurationMins] = useState<BookingDurationMins>(60);
  const [paymentMethod, setPaymentMethod] =
    useState<BookingPaymentMethod>('Online');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Selected existing booking popover/modal for quick status management
  const [inspectingBooking, setInspectingBooking] = useState<{
    key: string;
    booking: MatrixBookingSlot;
    courtName: string;
  } | null>(null);

  const playerInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (activeSlotTarget) {
      setTimeout(() => {
        playerInputRef.current?.focus();
      }, 40);
    }
  }, [activeSlotTarget]);

  const filteredCourts = club.courts.filter((c) => {
    if (courtFilter === 'Indoor Only') return c.environment === 'Indoor';
    if (courtFilter === 'Outdoor Only') return c.environment === 'Outdoor';
    return true;
  });

  const getSlotKey = (courtId: string, dateIso: string, timeSlot: string) =>
    `${courtId}__${dateIso}__${timeSlot}`;

  const handleOpenWalkInModal = (court: Court, timeSlot: string) => {
    setActiveSlotTarget({ court, timeSlot });
    setPlayerName('');
    setPhoneNumber('+92 300 ');
    setDurationMins(60);
    setPaymentMethod('Online');
    setFormErrors({});
  };

  const handleConfirmWalkInBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSlotTarget) return;

    const validation = validateWalkInBookingInput({
      playerName,
      phoneNumber,
    });

    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    const { court, timeSlot } = activeSlotTarget;
    const amountPkr = calculateWalkInPricePkr(
      court,
      timeSlot,
      durationMins,
      club.peakStartTime
    );
    const key = getSlotKey(court.id, selectedDateIso, timeSlot);

    const newBooking: MatrixBookingSlot = {
      id: `walkin-${Date.now()}`,
      courtId: court.id,
      dateIso: selectedDateIso,
      timeSlot,
      state: paymentMethod === 'Online' ? 'paid' : 'pending_cash',
      playerName: playerName.trim(),
      phoneNumber: phoneNumber.trim(),
      durationMins,
      paymentMethod,
      amountPkr,
    };

    setBookings((prev) => ({
      ...prev,
      [key]: newBooking,
    }));

    setStatusBanner(
      `Booked ${court.name} at ${timeSlot} (${durationMins} mins) for ${newBooking.playerName} — ${
        newBooking.state === 'paid' ? 'Paid' : 'Pending Cash'
      } (${formatPkr(amountPkr)}).`
    );
    setActiveSlotTarget(null);
  };

  const handleMarkAsPaid = (key: string) => {
    const existing = bookings[key];
    if (!existing) return;
    setBookings((prev) => ({
      ...prev,
      [key]: {
        ...existing,
        state: 'paid',
        paymentMethod: 'Online',
      },
    }));
    setStatusBanner(
      `Marked booking for ${existing.playerName} (${existing.timeSlot}) as Paid.`
    );
    setInspectingBooking(null);
  };

  const handleReleaseSlot = (key: string) => {
    const existing = bookings[key];
    if (!existing) return;
    setBookings((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setStatusBanner(
      `Released ${existing.timeSlot} slot (${existing.playerName}).`
    );
    setInspectingBooking(null);
  };

  // Calculate daily matrix telemetry for currently selected date
  const dayBookings = Object.values(bookings).filter(
    (b) =>
      b.dateIso === selectedDateIso &&
      club.courts.some((c) => c.id === b.courtId)
  );
  const paidCount = dayBookings.filter((b) => b.state === 'paid').length;
  const pendingCashCount = dayBookings.filter(
    (b) => b.state === 'pending_cash'
  ).length;
  const blockedCount = dayBookings.filter((b) => b.state === 'blocked').length;
  const confirmedRevenuePkr = dayBookings
    .filter((b) => b.state === 'paid' || b.state === 'pending_cash')
    .reduce((sum, b) => sum + b.amountPkr, 0);

  return (
    <div className="space-y-5">
      {/* 1. Top Controls Bar: Date Selector & Court Filter Dropdown */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        {/* Left: Date Selector (Previous Day < [ Today: 23 Oct 2026 ] > Next Day) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            role="group"
            aria-label="Booking matrix date navigation"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1"
          >
            <button
              type="button"
              onClick={() =>
                setSelectedDateIso((prev) => stepMatrixDate(prev, -1))
              }
              aria-label="Previous Day"
              className="min-h-[40px] inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-white hover:text-slate-950 whitespace-nowrap shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous Day</span>
            </button>

            <div
              data-testid="matrix-current-date"
              className="mx-1 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 font-mono text-xs font-bold text-white tabular-nums whitespace-nowrap"
            >
              <Calendar className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>{formatMatrixDateLabel(selectedDateIso)}</span>
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedDateIso((prev) => stepMatrixDate(prev, 1))
              }
              aria-label="Next Day"
              className="min-h-[40px] inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-white hover:text-slate-950 whitespace-nowrap shrink-0"
            >
              <span className="hidden sm:inline">Next Day</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {selectedDateIso !== '2026-10-23' && (
            <button
              type="button"
              onClick={() => setSelectedDateIso('2026-10-23')}
              className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 whitespace-nowrap shrink-0"
            >
              Reset to Today
            </button>
          )}
        </div>

        {/* Right: Filter Dropdown (All Courts, Indoor Only, Outdoor Only) & Legend */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
          {/* Status Legend */}
          <div className="hidden xl:flex items-center gap-4 text-xs text-slate-600 mr-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs border border-slate-300 bg-slate-50" />
              Available
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-emerald-500" />
              Booked (Paid: {paidCount})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-amber-400" />
              Pending Cash ({pendingCashCount})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-slate-900" />
              Maintenance ({blockedCount})
            </span>
          </div>

          {/* Filter Dropdown */}
          <div className="relative flex-1 sm:flex-initial min-w-[180px]">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <select
              aria-label="Filter matrix courts"
              value={courtFilter}
              onChange={(e) =>
                setCourtFilter(e.target.value as CourtFilterOption)
              }
              className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-8 text-xs font-semibold text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none"
            >
              <option value="All Courts">All Courts</option>
              <option value="Indoor Only">Indoor Only</option>
              <option value="Outdoor Only">Outdoor Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Confirmation Banner */}
      {statusBanner && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-xs font-semibold text-emerald-950"
        >
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{statusBanner}</span>
          </div>
          <span className="font-mono text-emerald-800 tabular-nums">
            Day Matrix Total: {formatPkr(confirmedRevenuePkr)}
          </span>
        </div>
      )}

      {/* 2. The Matrix Grid (Horizontal Scrollable with overflow-x-auto) */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-900/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700/75 hover:[&::-webkit-scrollbar-thumb]:bg-emerald-500">
          <table
            aria-label="Daily court booking matrix"
            className="w-full border-collapse text-left text-xs"
          >
            <thead>
              <tr className="border-b border-slate-200 bg-slate-900 text-slate-200">
                {/* Fixed Left Header Cell (Y-Axis Column Header) */}
                <th
                  scope="col"
                  className="sticky left-0 z-20 min-w-[210px] max-w-[210px] border-r border-slate-800 bg-slate-900 px-4 py-3.5 font-display text-xs font-bold text-white"
                >
                  <div className="flex items-center justify-between">
                    <span>Court / Surface</span>
                    <span className="font-mono text-[10px] font-normal text-emerald-400 tabular-nums">
                      07:00–24:00
                    </span>
                  </div>
                </th>

                {/* X-Axis Time Timeline Columns (07:00 to 24:00 in 60-minute increments) */}
                {MATRIX_TIME_SLOTS.map((timeSlot) => {
                  const isPeak = timeSlot >= club.peakStartTime;
                  return (
                    <th
                      key={timeSlot}
                      scope="col"
                      className="min-w-[118px] border-r border-slate-800/80 px-2.5 py-3 text-center font-mono font-semibold tabular-nums"
                    >
                      <div className="text-xs font-bold text-white">
                        {timeSlot}
                      </div>
                      <div
                        className={`mt-0.5 text-[10px] font-medium ${
                          isPeak ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        {isPeak ? 'Peak Rate' : 'Base Rate'}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filteredCourts.map((court) => {
                const isCourtMaintenance = court.status === 'In Maintenance';

                return (
                  <tr key={court.id} className="group/row">
                    {/* Fixed Y-Axis Court Info Cell */}
                    <th
                      scope="row"
                      className="sticky left-0 z-10 min-w-[210px] max-w-[210px] border-r border-slate-200 bg-white px-4 py-3.5 text-left align-middle shadow-[2px_0_6px_-2px_rgba(15,23,42,0.06)]"
                    >
                      <div className="font-display text-xs font-bold text-slate-900 truncate">
                        {court.name}
                      </div>
                      <div className="mt-0.5 text-[11px] font-normal text-slate-500 truncate">
                        {court.environment} · {court.type}
                      </div>
                      <div className="mt-1 font-mono text-[10px] font-semibold text-emerald-700 tabular-nums">
                        {formatPkr(court.baseRatePkr)} /{' '}
                        {formatPkr(court.peakRatePkr)}
                      </div>
                    </th>

                    {/* Intersecting Time-Slot Cells */}
                    {MATRIX_TIME_SLOTS.map((timeSlot) => {
                      const key = getSlotKey(
                        court.id,
                        selectedDateIso,
                        timeSlot
                      );
                      const booking = bookings[key];
                      const isPeak = timeSlot >= club.peakStartTime;
                      const slotRate = isPeak
                        ? court.peakRatePkr
                        : court.baseRatePkr;

                      // State 4: Blocked / Maintenance (either court-wide or slot-specific)
                      if (isCourtMaintenance || booking?.state === 'blocked') {
                        return (
                          <td
                            key={key}
                            className="border-r border-slate-100 p-1.5 align-stretch"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (booking?.state === 'blocked') {
                                  setInspectingBooking({
                                    key,
                                    booking,
                                    courtName: court.name,
                                  });
                                } else {
                                  onSwitchToTab('courts');
                                }
                              }}
                              aria-label={`${court.name} at ${timeSlot} — Blocked Maintenance`}
                              className="h-[68px] w-full rounded-lg border border-slate-800 bg-slate-900 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_8px,transparent_8px,transparent_16px)] p-2 text-left text-slate-200 transition-opacity hover:opacity-90 flex flex-col justify-between"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="truncate font-semibold text-[11px] text-white">
                                  {booking?.playerName || 'Maintenance'}
                                </span>
                                <Wrench className="h-3 w-3 shrink-0 text-slate-400" />
                              </div>
                              <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                                Blocked
                              </span>
                            </button>
                          </td>
                        );
                      }

                      // State 2: Booked Slot (Paid) — Solid Emerald Green
                      if (booking?.state === 'paid') {
                        return (
                          <td
                            key={key}
                            className="border-r border-slate-100 p-1.5 align-stretch"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setInspectingBooking({
                                  key,
                                  booking,
                                  courtName: court.name,
                                })
                              }
                              aria-label={`${court.name} at ${timeSlot} — Booked by ${booking.playerName} (Paid)`}
                              className="h-[68px] w-full rounded-lg border border-emerald-600 bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 text-left text-slate-950 shadow-xs transition-transform hover:brightness-105 flex flex-col justify-between"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="truncate font-display text-xs font-bold text-slate-950">
                                  {booking.playerName}
                                </span>
                                <span className="font-mono text-[10px] font-bold text-slate-900 tabular-nums">
                                  {booking.durationMins}m
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] font-bold text-slate-950">
                                  Paid
                                </span>
                                <span className="font-mono text-[10px] font-semibold text-slate-900 tabular-nums">
                                  {formatPkr(booking.amountPkr)}
                                </span>
                              </div>
                            </button>
                          </td>
                        );
                      }

                      // State 3: Booked Slot (Unpaid / Cash) — Amber / Yellow
                      if (booking?.state === 'pending_cash') {
                        return (
                          <td
                            key={key}
                            className="border-r border-slate-100 p-1.5 align-stretch"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setInspectingBooking({
                                  key,
                                  booking,
                                  courtName: court.name,
                                })
                              }
                              aria-label={`${court.name} at ${timeSlot} — Booked by ${booking.playerName} (Pending Cash)`}
                              className="h-[68px] w-full rounded-lg border border-amber-500 bg-gradient-to-br from-amber-300 to-amber-400 p-2 text-left text-slate-950 shadow-xs transition-transform hover:brightness-105 flex flex-col justify-between"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="truncate font-display text-xs font-bold text-slate-950">
                                  {booking.playerName}
                                </span>
                                <span className="font-mono text-[10px] font-bold text-slate-900 tabular-nums">
                                  {booking.durationMins}m
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="truncate text-[10px] font-bold text-slate-950">
                                  Pending Cash
                                </span>
                              </div>
                            </button>
                          </td>
                        );
                      }

                      // State 1: Available Slot — Light transparent gray border + hover to "Create Walk-in Booking"
                      return (
                        <td
                          key={key}
                          className="border-r border-slate-100 p-1.5 align-stretch"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenWalkInModal(court, timeSlot)
                            }
                            aria-label={`Create Walk-in Booking for ${court.name} at ${timeSlot}`}
                            className="group/slot h-[68px] w-full rounded-lg border border-slate-200/80 bg-slate-50/40 p-2 text-left transition-all hover:border-emerald-500 hover:bg-emerald-50/70 flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between text-slate-400 group-hover/slot:text-emerald-700">
                              <span className="font-mono text-[10px] font-medium tabular-nums">
                                {timeSlot}
                              </span>
                              <Plus className="h-3.5 w-3.5 opacity-60 group-hover/slot:opacity-100" />
                            </div>
                            <div>
                              <span className="hidden group-hover/slot:block text-[10px] font-bold leading-tight text-emerald-800">
                                Create Walk-in Booking
                              </span>
                              <span className="block group-hover/slot:hidden font-mono text-[10px] text-slate-400 tabular-nums">
                                {formatPkr(slotRate)}
                              </span>
                            </div>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Walk-in Booking Modal (when clicking an Available slot) */}
      {activeSlotTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="walkin-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop Blur */}
          <div
            onClick={() => setActiveSlotTarget(null)}
            aria-hidden="true"
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity"
          />

          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* Dark Slate Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4 text-white">
              <div>
                <span className="font-mono text-[11px] font-semibold text-emerald-400 tabular-nums">
                  {formatMatrixDateLabel(selectedDateIso)} ·{' '}
                  {activeSlotTarget.timeSlot} PKT
                </span>
                <h2
                  id="walkin-modal-title"
                  className="font-display text-lg font-bold tracking-tight text-white"
                >
                  Create Walk-in Booking
                </h2>
                <p className="text-xs text-slate-300">
                  {activeSlotTarget.court.name} (
                  {activeSlotTarget.court.environment})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSlotTarget(null)}
                aria-label="Close walk-in modal"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleConfirmWalkInBooking}
              noValidate
              className="p-6 space-y-4"
            >
              {/* Player Name */}
              <div>
                <label
                  htmlFor="walkin-player-name"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Player Name
                </label>
                <div className="relative mt-1.5">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={playerInputRef}
                    id="walkin-player-name"
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="e.g., Ali R. or Usman Tariq"
                    className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                {formErrors.playerName && (
                  <p
                    role="alert"
                    className="mt-1 text-xs font-medium text-red-600"
                  >
                    {formErrors.playerName}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="walkin-phone-number"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Phone Number
                </label>
                <div className="relative mt-1.5">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="walkin-phone-number"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 font-mono text-sm text-slate-900 tabular-nums focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                {formErrors.phoneNumber && (
                  <p
                    role="alert"
                    className="mt-1 text-xs font-medium text-red-600"
                  >
                    {formErrors.phoneNumber}
                  </p>
                )}
              </div>

              {/* Duration (60 / 90 / 120 mins) */}
              <div>
                <span className="block text-xs font-semibold text-slate-700">
                  Duration
                </span>
                <div
                  role="group"
                  aria-label="Select match duration"
                  className="mt-1.5 grid grid-cols-3 gap-2"
                >
                  {([60, 90, 120] as BookingDurationMins[]).map((mins) => {
                    const selected = durationMins === mins;
                    return (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDurationMins(mins)}
                        aria-pressed={selected}
                        className={`min-h-[44px] rounded-lg border font-mono text-xs font-bold tabular-nums transition-colors ${
                          selected
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {mins} mins
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method (Cash on Arrival / Online) */}
              <div>
                <span className="block text-xs font-semibold text-slate-700">
                  Payment Method
                </span>
                <div
                  role="group"
                  aria-label="Select payment method"
                  className="mt-1.5 grid grid-cols-2 gap-2.5"
                >
                  {(
                    [
                      {
                        value: 'Online',
                        label: 'Online (Paid)',
                        icon: CreditCard,
                      },
                      {
                        value: 'Cash on Arrival',
                        label: 'Cash on Arrival',
                        icon: Banknote,
                      },
                    ] as const
                  ).map((item) => {
                    const Icon = item.icon;
                    const selected = paymentMethod === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setPaymentMethod(item.value)}
                        aria-pressed={selected}
                        className={`min-h-[44px] flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                          selected
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calculated Total Summary */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <span className="block text-[11px] font-medium text-slate-500">
                    Total Court Fee ({durationMins} mins)
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    Status:{' '}
                    {paymentMethod === 'Online' ? 'Paid' : 'Pending Cash'}
                  </span>
                </div>
                <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                  {formatPkr(
                    calculateWalkInPricePkr(
                      activeSlotTarget.court,
                      activeSlotTarget.timeSlot,
                      durationMins,
                      club.peakStartTime
                    )
                  )}
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveSlotTarget(null)}
                  className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-xs transition-colors hover:bg-emerald-400"
                >
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  <span>Confirm Booking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Booking Inspector Modal when clicking an existing Booked/Blocked slot */}
      {inspectingBooking && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Booking Slot Details"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={() => setInspectingBooking(null)}
            aria-hidden="true"
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-semibold text-emerald-600 tabular-nums">
                  {inspectingBooking.courtName} ·{' '}
                  {inspectingBooking.booking.timeSlot}
                </span>
                <h3 className="mt-0.5 font-display text-lg font-bold text-slate-900">
                  {inspectingBooking.booking.playerName}
                </h3>
                <p className="font-mono text-xs text-slate-500 tabular-nums">
                  {inspectingBooking.booking.phoneNumber} ·{' '}
                  {inspectingBooking.booking.durationMins} mins
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingBooking(null)}
                aria-label="Close slot details"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs">
              <span className="font-medium text-slate-600">
                Status:{' '}
                <strong className="text-slate-900">
                  {inspectingBooking.booking.state === 'paid'
                    ? 'Paid'
                    : inspectingBooking.booking.state === 'pending_cash'
                      ? 'Pending Cash'
                      : 'Blocked / Maintenance'}
                </strong>
              </span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatPkr(inspectingBooking.booking.amountPkr)}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleReleaseSlot(inspectingBooking.key)}
                className="min-h-[40px] inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Release Slot
              </button>
              {inspectingBooking.booking.state === 'pending_cash' && (
                <button
                  type="button"
                  onClick={() => handleMarkAsPaid(inspectingBooking.key)}
                  className="min-h-[40px] inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark Cash Paid
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PricingRulesView({
  club,
  onUpdateAllRates,
}: {
  club: ClubBranch;
  onUpdateAllRates: (deltaPkr: number) => void;
}) {
  const [appliedNote, setAppliedNote] = useState<string | null>(null);

  const handleBulkAdjust = (delta: number, label: string) => {
    onUpdateAllRates(delta);
    setAppliedNote(
      `Applied ${label} across all ${club.courts.length} courts in ${club.city}.`
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Dynamic PKR Pricing Rules & Peak Multipliers
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Adjust base and evening floodlight tariffs across all courts at{' '}
              {club.name}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkAdjust(500, '+PKR 500 Weekend Surge')}
              className="min-h-[44px] rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 whitespace-nowrap shrink-0"
            >
              + PKR 500 Weekend Surge
            </button>
            <button
              type="button"
              onClick={() => handleBulkAdjust(-500, '-PKR 500 Off-Peak Promo')}
              className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              - PKR 500 Off-Peak Promo
            </button>
          </div>
        </div>

        {appliedNote && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-900">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>{appliedNote}</span>
          </div>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="pb-3 pr-4">Court Name</th>
                <th className="pb-3 px-4">Specification</th>
                <th className="pb-3 px-4 text-right">
                  Off-Peak Base ({club.openingTime}–{club.peakStartTime})
                </th>
                <th className="pb-3 px-4 text-right">
                  Evening Peak ({club.peakStartTime}–{club.closingTime})
                </th>
                <th className="pb-3 pl-4 text-right">90-Min Match Package</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {club.courts.map((court) => (
                <tr key={court.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 pr-4 font-semibold text-slate-900 whitespace-nowrap">
                    {court.name}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                    {court.type} · {court.environment}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900 tabular-nums whitespace-nowrap">
                    {formatPkr(court.baseRatePkr)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 tabular-nums whitespace-nowrap">
                    {formatPkr(court.peakRatePkr)}
                  </td>
                  <td className="py-3.5 pl-4 text-right font-mono text-slate-700 tabular-nums whitespace-nowrap">
                    {formatPkr(Math.round(court.peakRatePkr * 1.5))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function SettingsView({
  club,
  onToggleLiveStatus,
}: {
  club: ClubBranch;
  onToggleLiveStatus: () => void;
}) {
  const [autoAcceptOpenMatches, setAutoAcceptOpenMatches] = useState(true);
  const [requireAdvanceDeposit, setRequireAdvanceDeposit] = useState(true);
  const [whatsappConfirmation, setWhatsappConfirmation] = useState(true);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Venue Booking & Payment Policies
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Configure automated booking rules, Raast / JazzCash / Card split-payment settings, and player alerts.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Online Booking Engine Status
            </p>
            <p className="text-xs text-slate-500">
              Control whether {club.name} accepts instant player bookings in the mobile app.
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleLiveStatus}
            className={`min-h-[44px] rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              club.isLive
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
            }`}
          >
            {club.isLive ? 'Live & Accepting Bookings' : 'Paused (Maintenance)'}
          </button>
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-4 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Playtomic Split-Payment (4 Players)
            </p>
            <p className="text-xs text-slate-500">
              Allow each player in a doubles match to pay their 25% PKR share individually via Raast or Visa/Mastercard.
            </p>
          </div>
          <input
            type="checkbox"
            checked={autoAcceptOpenMatches}
            onChange={() => setAutoAcceptOpenMatches(!autoAcceptOpenMatches)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
        </label>

        <label className="flex cursor-pointer items-center justify-between gap-4 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              50% Peak-Hour Advance Deposit
            </p>
            <p className="text-xs text-slate-500">
              Require advance online deposit for bookings during {club.peakStartTime}–{club.closingTime} PKT.
            </p>
          </div>
          <input
            type="checkbox"
            checked={requireAdvanceDeposit}
            onChange={() => setRequireAdvanceDeposit(!requireAdvanceDeposit)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
        </label>

        <label className="flex cursor-pointer items-center justify-between gap-4 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Automated WhatsApp Court PIN & Floodlight Trigger
            </p>
            <p className="text-xs text-slate-500">
              Send access code 15 minutes before match start to registered Pakistani mobile numbers (+92).
            </p>
          </div>
          <input
            type="checkbox"
            checked={whatsappConfirmation}
            onChange={() => setWhatsappConfirmation(!whatsappConfirmation)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
        </label>
      </div>
    </div>
  );
}
