'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';

export type VenueCityFilter =
  | 'All'
  | 'Islamabad'
  | 'Karachi'
  | 'Lahore'
  | 'Rawalpindi';

export interface TopSearchedVenue {
  id: string;
  name: string;
  city: Exclude<VenueCityFilter, 'All'>;
  location: string;
  courtsLabel: string;
  rateLabel: string;
  rating: string;
  reviewsCount: number;
  imageUrl: string;
  amenities: string[];
}

const VENUE_CITY_FILTERS: VenueCityFilter[] = [
  'All',
  'Islamabad',
  'Karachi',
  'Lahore',
  'Rawalpindi',
];

const TOP_SEARCHED_VENUES: TopSearchedVenue[] = [
  {
    id: 'venue-isb-center',
    name: 'PakPadel Club – Islamabad Center',
    city: 'Islamabad',
    location: 'Sector F-8, Islamabad',
    courtsLabel: '4 Courts',
    rateLabel: 'PKR 6,500/hr',
    rating: '4.9 ★',
    reviewsCount: 184,
    imageUrl:
      'https://images.unsplash.com/photo-1658723826297-fe4d1b1e6600?w=800&auto=format&fit=crop&q=75',
    amenities: ['AC Lounge', 'Free Parking', 'Pro Shop', 'Racket Rental'],
  },
  {
    id: 'venue-khi-clifton',
    name: 'PakPadel Arena – Karachi Clifton',
    city: 'Karachi',
    location: 'Clifton Promenade, Karachi',
    courtsLabel: '2 Courts',
    rateLabel: 'PKR 7,500/hr',
    rating: '4.9 ★',
    reviewsCount: 219,
    imageUrl:
      'https://images.unsplash.com/photo-1767128890583-b3f8dc30bdbc?w=800&auto=format&fit=crop&q=75',
    amenities: ['AC Lounge', 'Free Parking', 'Pro Shop', 'Racket Rental'],
  },
  {
    id: 'venue-lhr-gulberg',
    name: 'Gulberg Padel Club – Lahore',
    city: 'Lahore',
    location: 'Gulberg III, Lahore',
    courtsLabel: '3 Courts',
    rateLabel: 'PKR 6,000/hr',
    rating: '4.8 ★',
    reviewsCount: 162,
    imageUrl:
      'https://images.unsplash.com/photo-1770230901556-4e1c0bacfb09?w=800&auto=format&fit=crop&q=75',
    amenities: ['AC Lounge', 'Free Parking', 'Pro Shop', 'Racket Rental'],
  },
  {
    id: 'venue-rwp-bahria',
    name: 'PakPadel Enclave – Rawalpindi Bahria',
    city: 'Rawalpindi',
    location: 'Bahria Town Phase 7, Rawalpindi',
    courtsLabel: '4 Courts',
    rateLabel: 'PKR 5,500/hr',
    rating: '4.8 ★',
    reviewsCount: 98,
    imageUrl:
      'https://images.unsplash.com/photo-1658723826297-fe4d1b1e6600?w=800&auto=format&fit=crop&q=75',
    amenities: ['AC Lounge', 'Free Parking', 'Pro Shop', 'Racket Rental'],
  },
];

const B2B_FEATURE_CHECKS = [
  'Zero Double-Bookings Guarantee',
  'Instant Raast Settlements',
  'Dynamic Pricing Engine',
  'Member Passes',
] as const;

const B2B_MINI_TIMELINE = [
  {
    time: '18:00 PKT',
    court: 'Court 1 Panoramic (Indoor)',
    player: 'Saad A. + 3 Players',
    status: 'Paid · PKR 6,500',
  },
  {
    time: '19:30 PKT',
    court: 'Court 2 Center (Indoor)',
    player: 'Hamza K. · 4-Way Split',
    status: 'Paid · PKR 6,500',
  },
  {
    time: '21:00 PKT',
    court: 'Court 3 Floodlit (Outdoor)',
    player: 'Corporate League Match',
    status: 'Settled via Raast',
  },
] as const;

const VERIFIED_REVIEWS = [
  {
    id: 'review-ali',
    initials: 'AR',
    name: 'Ali Raza',
    roleBadge: 'Islamabad (PPR 4.2)',
    category: 'Verified Player',
    quote:
      'Whenever our regular fourth drops out an hour before evening prime time in F-8, we open the lobby on PakPadel and get a verified PPR 4.0+ fourth within ten minutes.',
  },
  {
    id: 'review-bilal',
    initials: 'BL',
    name: 'Bilal Lakhani',
    roleBadge: 'Club Director · Karachi Clifton',
    category: 'Partner Venue Operator',
    quote:
      'Switching from manual WhatsApp bookings to PakPadel Manager delivered a 32% occupancy surge in our first month, with peak-rate automation and zero double-bookings.',
  },
  {
    id: 'review-zainab',
    initials: 'ZQ',
    name: 'Zainab Qureshi',
    roleBadge: 'Lahore (PPR 3.8)',
    category: 'Verified Player',
    quote:
      'The automated 4-player Raast split checkout completely changed how our group books Gulberg courts. Everyone pays their exact PKR 1,500 share in seconds.',
  },
] as const;

export interface PakPadelCommercialSectionsProps {
  isDarkMode: boolean;
  logoSrc: string;
  onNavigateToLogin: () => void;
  onSelectNetworkCity?: (
    city: 'Islamabad' | 'Rawalpindi' | 'Lahore' | 'Karachi'
  ) => void;
  children?: React.ReactNode;
}

export function PakPadelCommercialSections({
  isDarkMode,
  logoSrc,
  onNavigateToLogin,
  onSelectNetworkCity,
  children,
}: PakPadelCommercialSectionsProps) {
  const [selectedCityFilter, setSelectedCityFilter] =
    useState<VenueCityFilter>('All');
  const [bookedVenueMessage, setBookedVenueMessage] = useState<string | null>(
    null
  );
  const [onboardModalToast, setOnboardModalToast] = useState<string | null>(
    null
  );

  // When 'All' is selected, show the 3 flagship venues (Islamabad, Karachi, Lahore) in the 3-column grid;
  // when a specific city is selected, filter by that city.
  const displayedVenues =
    selectedCityFilter === 'All'
      ? TOP_SEARCHED_VENUES.slice(0, 3)
      : TOP_SEARCHED_VENUES.filter((v) => v.city === selectedCityFilter);

  const handleFooterCityClick = (
    city: 'Islamabad' | 'Karachi' | 'Lahore' | 'Rawalpindi'
  ) => {
    setSelectedCityFilter(city);
    if (onSelectNetworkCity) {
      onSelectNetworkCity(city);
    }
    if (typeof document !== 'undefined') {
      const el = document.getElementById('top-searched-clubs');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      {/* =====================================================================
          SECTION 1: "TOP SEARCHED CLUBS IN PAKISTAN" (Venue Directory Grid)
      ===================================================================== */}
      <section
        id="top-searched-clubs"
        aria-labelledby="top-searched-clubs-heading"
        className={`border-b transition-colors duration-300 ${
          isDarkMode
            ? 'bg-[#080F0A] text-[#F5FFF7] border-[#293A2E]'
            : 'bg-[#F7FAF8] text-[#102117] border-[#D7E3D9]'
        }`}
      >
        <div className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 sm:py-24 space-y-10">
          {/* Header & Interactive City Filter Pills */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-lg border border-[#228B4E]/35 bg-[#01411C] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
                <MapPin className="h-3.5 w-3.5 text-[#228B4E]" />
                <span>National Venue Directory</span>
              </div>
              <h2
                id="top-searched-clubs-heading"
                className="font-display text-3xl sm:text-4xl font-bold tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Top Searched Clubs in Pakistan
              </h2>
              <p
                className={`max-w-2xl text-sm sm:text-base ${
                  isDarkMode ? 'text-[#F5FFF7]/75' : 'text-[#102117]/75'
                }`}
              >
                Explore premier panoramic indoor &amp; outdoor courts across
                major cities.
              </p>
            </div>

            {/* Interactive Filter Pills: [All, Islamabad, Karachi, Lahore, Rawalpindi] */}
            <div
              role="tablist"
              aria-label="Filter clubs by city"
              className={`inline-flex flex-wrap items-center gap-1.5 rounded-2xl border p-1.5 ${
                isDarkMode
                  ? 'border-[#293A2E] bg-[#101A13]'
                  : 'border-[#D7E3D9] bg-[#EEF5F0]'
              }`}
            >
              {VENUE_CITY_FILTERS.map((city) => {
                const isActive = selectedCityFilter === city;
                return (
                  <button
                    key={city}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      setSelectedCityFilter(city);
                      setBookedVenueMessage(null);
                    }}
                    className={`min-h-[38px] rounded-xl px-4 py-1.5 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#228B4E] whitespace-nowrap ${
                      isActive
                        ? 'bg-[#01411C] text-[#FFFFFF] shadow-sm'
                        : isDarkMode
                          ? 'text-[#F5FFF7]/80 hover:bg-[#18271C] hover:text-[#FFFFFF]'
                          : 'text-[#102117]/80 hover:bg-[#FFFFFF] hover:text-[#01411C]'
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instant Booking Feedback Banner */}
          {bookedVenueMessage && (
            <div
              role="status"
              className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-3.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isDarkMode
                  ? 'border-[#228B4E]/45 bg-[#101A13] text-[#F5FFF7]'
                  : 'border-[#228B4E]/40 bg-[#EEF5F0] text-[#01411C]'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#228B4E] shrink-0" />
                <span>{bookedVenueMessage}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="font-bold text-[#228B4E] underline underline-offset-4 hover:brightness-110"
                >
                  Open Venue Scheduler
                </button>
                <button
                  type="button"
                  onClick={() => setBookedVenueMessage(null)}
                  className="text-xs opacity-75 hover:opacity-100"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* 3-Column Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedVenues.map((venue) => (
              <article
                key={venue.id}
                className={`group flex flex-col justify-between rounded-3xl border overflow-hidden shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${
                  isDarkMode
                    ? 'border-[#293A2E] bg-[#101A13] text-[#F5FFF7]'
                    : 'border-[#D7E3D9] bg-[#FFFFFF] text-[#102117]'
                }`}
              >
                <div>
                  {/* High-Res Court Photo with Subtle Hover Zoom + Top Badges */}
                  <div className="relative h-56 w-full overflow-hidden bg-[#080F0A]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={venue.imageUrl}
                      alt={venue.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080F0A]/80 via-transparent to-[#080F0A]/30"
                    />

                    {/* Top Left Badge: FIP Certified */}
                    <div className="absolute top-3.5 left-3.5 z-10">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#228B4E]/50 bg-[#01411C]/95 px-2.5 py-1 text-[11px] font-bold text-[#FFFFFF] backdrop-blur-md shadow-sm">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#228B4E]" />
                        <span>FIP Certified</span>
                      </span>
                    </div>

                    {/* Top Right Badge: Star Rating */}
                    <div className="absolute top-3.5 right-3.5 z-10">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-[#293A2E] bg-[#080F0A]/90 px-2.5 py-1 font-mono text-xs font-bold text-[#FFFFFF] backdrop-blur-md">
                        <span className="text-[#228B4E]">{venue.rating}</span>
                        <span className="text-[10px] text-[#F5FFF7]/70">
                          ({venue.reviewsCount})
                        </span>
                      </span>
                    </div>

                    {/* Bottom Image Overlay: Courts & Hourly Rate */}
                    <div className="absolute bottom-3 left-3.5 right-3.5 z-10 flex items-center justify-between text-xs text-[#FFFFFF]">
                      <span className="rounded-md bg-[#080F0A]/80 px-2.5 py-1 font-mono font-semibold backdrop-blur-xs">
                        {venue.courtsLabel}
                      </span>
                      <span className="rounded-md bg-[#228B4E] px-2.5 py-1 font-mono font-bold text-[#FFFFFF] shadow-xs">
                        {venue.rateLabel}
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Venue Title, Location & Amenity Badges */}
                  <div className="p-6 space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#228B4E]">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{venue.location}</span>
                      </div>
                      <h3 className="mt-1 font-display text-lg sm:text-xl font-bold leading-snug">
                        {venue.name}
                      </h3>
                    </div>

                    {/* Amenity Badges: AC Lounge, Free Parking, Pro Shop, Racket Rental */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {venue.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
                            isDarkMode
                              ? 'border-[#293A2E] bg-[#080F0A] text-[#F5FFF7]/85'
                              : 'border-[#D7E3D9] bg-[#EEF5F0] text-[#102117]/85'
                          }`}
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Tactile "Book Court" Button */}
                <div
                  className={`px-6 pb-6 pt-3 border-t flex items-center justify-between gap-3 ${
                    isDarkMode ? 'border-[#293A2E]' : 'border-[#D7E3D9]/70'
                  }`}
                >
                  <div>
                    <span
                      className={`block text-[10px] uppercase tracking-wider font-semibold ${
                        isDarkMode ? 'text-[#F5FFF7]/60' : 'text-[#102117]/60'
                      }`}
                    >
                      Evening Availability
                    </span>
                    <span className="font-mono text-xs font-bold text-[#228B4E]">
                      Instant Raast Split
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setBookedVenueMessage(
                        `Selected ${venue.name} (${venue.location} · ${venue.rateLabel}). Instant 60/90-min evening slots ready.`
                      )
                    }
                    className="min-h-[42px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#01411C] border-b-4 border-[#00280f] px-4 py-2 font-display text-xs sm:text-sm font-bold text-[#FFFFFF] transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#228B4E] whitespace-nowrap"
                  >
                    <span>Book Court</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#228B4E]" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 2: "PAKPADEL FOR CLUBS" (B2B Club Manager Conversion Banner)
      ===================================================================== */}
      <section
        id="for-clubs-b2b"
        aria-labelledby="pakpadel-b2b-heading"
        className={`border-b transition-colors duration-300 ${
          isDarkMode
            ? 'bg-[#080F0A] border-[#293A2E]'
            : 'bg-[#EEF5F0]/60 border-[#D7E3D9]'
        }`}
      >
        <div className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 sm:py-24">
          <div className="relative overflow-hidden rounded-3xl border border-[#293A2E] bg-gradient-to-br from-[#01411C] via-[#01411C]/90 to-[#080F0A] p-6 sm:p-10 lg:p-12 text-[#F5FFF7] shadow-2xl">
            {/* Subtle radial emerald highlight */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,139,78,0.28),transparent_60%)]"
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column (7 Cols): B2B Pitch, Feature Checks & Dual CTAs */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-lg border border-[#228B4E]/45 bg-[#080F0A]/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#228B4E] backdrop-blur-xs">
                  <Building2 className="h-3.5 w-3.5 text-[#228B4E]" />
                  <span>PakPadel Manager B2B</span>
                </div>

                <h2
                  id="pakpadel-b2b-heading"
                  className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#FFFFFF] leading-[1.1]"
                  style={{ textWrap: 'balance' }}
                >
                  Maximize Court Occupancy. Eliminate WhatsApp Chaos.
                </h2>

                <p className="max-w-2xl text-sm sm:text-base text-[#F5FFF7]/85 leading-relaxed">
                  Replace manual chat groups and spreadsheet ledgers with
                  real-time court scheduling, automated peak/off-peak pricing
                  rules, and instant Raast bank settlements directly to your
                  club treasury.
                </p>

                {/* 4 Feature Checks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {B2B_FEATURE_CHECKS.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2.5 rounded-xl border border-[#FFFFFF]/15 bg-[#080F0A]/40 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#FFFFFF]"
                    >
                      <CheckCircle2 className="h-4 w-4 text-[#228B4E] shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs: "Access Club Manager" & "Onboard Your Venue" */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#228B4E] border-b-4 border-[#00280f] px-6 py-3 font-display text-xs sm:text-sm font-bold text-[#FFFFFF] shadow-lg transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] whitespace-nowrap"
                  >
                    <span>Access Club Manager</span>
                    <ArrowRight className="h-4 w-4 text-[#FFFFFF]" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setOnboardModalToast(
                        'Partner Onboarding Fast-Track: Sign in with super@pakpadel.pk or admin@clifton.pk in the Partner Portal to configure your courts.'
                      )
                    }
                    className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border border-[#FFFFFF]/30 bg-[#080F0A]/60 px-6 py-3 font-display text-xs sm:text-sm font-bold text-[#FFFFFF] transition-all duration-200 hover:bg-[#101A13] hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#228B4E] whitespace-nowrap"
                  >
                    <span>Onboard Your Venue</span>
                  </button>
                </div>

                {onboardModalToast && (
                  <div
                    role="status"
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#228B4E]/50 bg-[#080F0A]/90 px-4 py-3 text-xs text-[#F5FFF7]"
                  >
                    <span>{onboardModalToast}</span>
                    <button
                      type="button"
                      onClick={onNavigateToLogin}
                      className="font-bold text-[#228B4E] underline underline-offset-4 whitespace-nowrap shrink-0"
                    >
                      Go to Partner Login
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column (5 Cols): Dark Glassmorphism Dashboard Preview Card (#101A13) */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-[#293A2E] bg-[#101A13]/95 p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-5 transition-all duration-200 hover:-translate-y-0.5">
                  {/* Top Card Header */}
                  <div className="flex items-center justify-between border-b border-[#293A2E] pb-3.5">
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#228B4E]">
                        Live Venue Telemetry
                      </span>
                      <h3 className="font-display text-base font-bold text-[#F5FFF7]">
                        Islamabad Center · Sector F-8
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#228B4E]/20 px-2.5 py-1 font-mono text-[11px] font-bold text-[#228B4E]">
                      <span className="h-2 w-2 rounded-full bg-[#228B4E] animate-pulse" />
                      <span>Raast Auto-Sync</span>
                    </span>
                  </div>

                  {/* Key Metrics Row: "92% Occupied" & "PKR 207,000 Daily Payout" */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#293A2E] bg-[#080F0A] p-3.5">
                      <span className="block text-[11px] text-[#F5FFF7]/65">
                        Prime-Time Utilization
                      </span>
                      <p className="mt-1 font-mono text-xl sm:text-2xl font-bold text-[#228B4E] tabular-nums">
                        92% Occupied
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#293A2E] bg-[#080F0A] p-3.5">
                      <span className="block text-[11px] text-[#F5FFF7]/65">
                        Verified Settlement
                      </span>
                      <p className="mt-1 font-mono text-base sm:text-lg font-bold text-[#FFFFFF] tabular-nums">
                        PKR 207,000 Daily Payout
                      </p>
                    </div>
                  </div>

                  {/* Mini 3-Slot Live Timeline Preview */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-[#F5FFF7]/75">
                      <span className="font-semibold">
                        Live Evening Matrix Feed
                      </span>
                      <span className="font-mono text-[11px] text-[#228B4E]">
                        3 / 3 Courts Locked
                      </span>
                    </div>

                    <div className="space-y-2">
                      {B2B_MINI_TIMELINE.map((slot) => (
                        <div
                          key={slot.time}
                          className="flex items-center justify-between gap-2 rounded-xl border border-[#293A2E] bg-[#080F0A] px-3.5 py-2.5 text-xs transition-all duration-200 hover:border-[#228B4E]/50"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[#228B4E] tabular-nums">
                                {slot.time}
                              </span>
                              <span className="font-semibold text-[#FFFFFF] truncate">
                                {slot.court}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[11px] text-[#F5FFF7]/65 truncate">
                              {slot.player}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-md bg-[#01411C] px-2 py-1 font-mono text-[10px] font-bold text-[#FFFFFF]">
                            {slot.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 3: "COMMUNITY & VERIFIED REVIEWS" (Social Proof Grid)
      ===================================================================== */}
      <section
        id="verified-reviews"
        aria-labelledby="verified-reviews-heading"
        className={`border-b transition-colors duration-300 ${
          isDarkMode
            ? 'bg-[#080F0A] text-[#F5FFF7] border-[#293A2E]'
            : 'bg-[#F7FAF8] text-[#102117] border-[#D7E3D9]'
        }`}
      >
        <div className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 sm:py-24 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-lg border border-[#228B4E]/35 bg-[#01411C] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
                <Sparkles className="h-3.5 w-3.5 text-[#228B4E]" />
                <span>Community &amp; Verified Reviews</span>
              </div>
              <h2
                id="verified-reviews-heading"
                className="font-display text-3xl sm:text-4xl font-bold tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Trusted by Pakistan&apos;s Padel Players &amp; Club Directors
              </h2>
            </div>
            <p
              className={`max-w-md text-sm ${
                isDarkMode ? 'text-[#F5FFF7]/75' : 'text-[#102117]/75'
              }`}
            >
              Verified reviews from competitive PPR players and partner venue
              operators across Islamabad, Karachi, and Lahore.
            </p>
          </div>

          {/* 3 Clean Review Cards (#FFFFFF with #D7E3D9 borders in light mode) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VERIFIED_REVIEWS.map((review) => (
              <div
                key={review.id}
                className={`flex flex-col justify-between rounded-2xl border p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                  isDarkMode
                    ? 'border-[#293A2E] bg-[#101A13] text-[#F5FFF7]'
                    : 'border-[#D7E3D9] bg-[#FFFFFF] text-[#102117]'
                }`}
              >
                <div className="space-y-4">
                  {/* 5-Star Icons + Category Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="flex items-center gap-1 text-[#228B4E]"
                      aria-label="5 out of 5 stars"
                    >
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          className="h-4 w-4 fill-[#228B4E] text-[#228B4E]"
                        />
                      ))}
                    </div>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        isDarkMode
                          ? 'bg-[#080F0A] text-[#228B4E]'
                          : 'bg-[#EEF5F0] text-[#01411C]'
                      }`}
                    >
                      {review.category}
                    </span>
                  </div>

                  {/* Quote */}
                  <p
                    className={`text-sm sm:text-base leading-relaxed ${
                      isDarkMode ? 'text-[#F5FFF7]/90' : 'text-[#102117]/85'
                    }`}
                  >
                    &ldquo;{review.quote}&rdquo;
                  </p>
                </div>

                {/* Reviewer Footer with Avatar Initials */}
                <div
                  className={`mt-6 pt-4 border-t flex items-center gap-3 ${
                    isDarkMode ? 'border-[#293A2E]' : 'border-[#D7E3D9]'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#01411C] font-display text-xs font-bold text-[#FFFFFF]">
                    {review.initials}
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold">
                      {review.name}
                    </p>
                    <p className="font-mono text-xs font-semibold text-[#228B4E]">
                      {review.roleBadge}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {children}

      {/* =====================================================================
          SECTION 4: ENTERPRISE MULTI-COLUMN DARK FOOTER (#050B07 with #293A2E border)
      ===================================================================== */}
      <footer className="border-t border-[#293A2E] bg-[#050B07] text-[#F5FFF7]">
        <div className="mx-auto max-w-[1360px] px-5 py-14 sm:px-8 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#293A2E]">
            {/* Left Column (4 Cols): Brand Logo Badge, Mission Statement & Islamabad Support Desk */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc}
                  alt="PakPadel"
                  referrerPolicy="no-referrer"
                  className="h-9 md:h-10 w-auto object-contain rounded-lg bg-[#FFFFFF] p-0.5 shadow-xs"
                />
                <div>
                  <span className="block font-display text-base font-bold text-[#FFFFFF]">
                    PakPadel Network
                  </span>
                  <span className="block font-mono text-[11px] text-[#228B4E]">
                    Pakistan&apos;s Premier Padel Ecosystem
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#F5FFF7]/75 leading-relaxed max-w-sm">
                Connecting Pakistan&apos;s padel athletes and premier panoramic
                venues through instant court scheduling, PPR skill leveling, and
                automated Raast split checkout.
              </p>

              <div className="pt-1">
                <div className="inline-flex items-center gap-2 rounded-xl border border-[#293A2E] bg-[#101A13] px-3.5 py-2 text-xs text-[#F5FFF7]">
                  <Phone className="h-3.5 w-3.5 text-[#228B4E] shrink-0" />
                  <span className="text-[#F5FFF7]/75">
                    Islamabad Support Desk:
                  </span>
                  <span className="font-mono font-bold text-[#FFFFFF] tabular-nums">
                    +92 51 844 9200
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2 (2.5 Cols): Players */}
            <div className="lg:col-span-3 space-y-3">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#228B4E]">
                Players
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#F5FFF7]/80">
                <li>
                  <a
                    href="#top-searched-clubs"
                    className="inline-block transition-all duration-200 hover:-translate-y-0.5 hover:text-[#228B4E]"
                  >
                    Book Panoramic Courts
                  </a>
                </li>
                <li>
                  <a
                    href="#community-matchmaking"
                    className="inline-block transition-all duration-200 hover:-translate-y-0.5 hover:text-[#228B4E]"
                  >
                    Open Match Discovery (PPR)
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="inline-block transition-all duration-200 hover:-translate-y-0.5 hover:text-[#228B4E]"
                  >
                    4-Player Raast Split Pay
                  </a>
                </li>
                <li>
                  <a
                    href="#verified-reviews"
                    className="inline-block transition-all duration-200 hover:-translate-y-0.5 hover:text-[#228B4E]"
                  >
                    Verified Player Reviews
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3 (2.5 Cols): Club Operators */}
            <div className="lg:col-span-3 space-y-3">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#228B4E]">
                Club Operators
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#F5FFF7]/80">
                <li>
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="text-left transition-all duration-200 hover:-translate-y-0.5 hover:text-[#228B4E]"
                  >
                    PakPadel Manager B2B Login
                  </button>
                </li>
                <li>
                  <a
                    href="#for-clubs-b2b"
                    className="inline-block transition-all duration-200 hover:-translate-y-0.5 hover:text-[#228B4E]"
                  >
                    Playtomic-Standard Matrix
                  </a>
                </li>
                <li>
                  <a
                    href="#for-clubs-b2b"
                    className="inline-block transition-all duration-200 hover:-translate-y-0.5 hover:text-[#228B4E]"
                  >
                    Peak &amp; Floodlit Pricing Engine
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="text-left transition-all duration-200 hover:-translate-y-0.5 hover:text-[#228B4E]"
                  >
                    Onboard Your Padel Venue
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4 (2 Cols): Venues by City */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#228B4E]">
                Venues by City
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#F5FFF7]/80">
                {(
                  ['Islamabad', 'Karachi', 'Lahore', 'Rawalpindi'] as const
                ).map((city) => (
                  <li key={city}>
                    <button
                      type="button"
                      onClick={() => handleFooterCityClick(city)}
                      className="text-left transition-all duration-200 hover:-translate-y-0.5 hover:text-[#228B4E]"
                    >
                      {city} Courts
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Legal Bar: 2026 Copyright, Privacy Policy, Terms & Raast Verified Badge */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F5FFF7]/70">
            <div className="flex flex-wrap items-center gap-5">
              <span>
                © 2026 PakPadel Technologies (Pvt.) Ltd. All rights reserved.
              </span>
              <a
                href="#top"
                className="transition-all duration-200 hover:-translate-y-0.5 hover:text-[#FFFFFF]"
              >
                Privacy Policy
              </a>
              <a
                href="#top"
                className="transition-all duration-200 hover:-translate-y-0.5 hover:text-[#FFFFFF]"
              >
                Terms
              </a>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#228B4E]/45 bg-[#01411C]/70 px-3.5 py-1.5 text-xs font-bold text-[#FFFFFF]">
              <ShieldCheck className="h-4 w-4 text-[#228B4E]" />
              <span>Raast Verified Integration</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
