'use client';

import React, { useState } from 'react';
import {
  Users,
  CreditCard,
  Trophy,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export interface PadelCommunitySectionProps {
  isDarkMode?: boolean;
  onDownloadClick?: () => void;
}

const CORE_VALUE_PILLARS = [
  {
    icon: Users,
    title: 'Open Match Discovery',
    description:
      'Need one more for a doubles rally? Open your game to verified local players in Islamabad, Lahore, or Karachi.',
  },
  {
    icon: CreditCard,
    title: 'Automated Split Payments',
    description:
      'Split the PKR court booking evenly in real time via Raast or cards—no more awkward follow-ups for court fees.',
  },
  {
    icon: Trophy,
    title: 'Verified Player Leveling (PPR)',
    description:
      'Dynamic skill rating system (1.0 to 6.0) ensuring every match is balanced, competitive, and recorded.',
  },
  {
    icon: CheckCircle2,
    title: 'Instant Confirmed Slots',
    description:
      'Direct API lock with venue management—zero double-bookings, guaranteed floodlights.',
  },
] as const;

export function PadelCommunitySection({
  isDarkMode = false,
  onDownloadClick,
}: PadelCommunitySectionProps) {
  const [downloadStatusMessage, setDownloadStatusMessage] = useState<
    string | null
  >(null);

  const handlePrimaryCtaClick = () => {
    setDownloadStatusMessage(
      'PakPadel Player App (iOS & Android) — Matchmaking & Raast 4-way split links ready. Instant court lock active.'
    );
    if (onDownloadClick) {
      onDownloadClick();
    }
  };

  return (
    <section
      id="community-matchmaking"
      aria-labelledby="padel-match-engine-heading"
      className={`relative overflow-hidden border-b transition-colors duration-300 ${
        isDarkMode
          ? 'bg-[#080F0A] text-[#F5FFF7] border-[#293A2E]'
          : 'bg-[#F7FAF8] text-[#102117] border-[#D7E3D9]'
      }`}
    >
      {/* Subtle Ambient Pakistan Green Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_50%,rgba(34,139,78,0.12),transparent_60%)]"
      />

      <div className="relative z-10 mx-auto max-w-[1360px] px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* LEFT SIDE (5 Columns): Tall Portrait Image Card + 2 Floating UI Widgets */}
          <div className="lg:col-span-5 relative mx-auto w-full max-w-[520px] lg:max-w-none">
            {/* Base Portrait Card */}
            <div
              className={`group relative h-[480px] sm:h-[560px] w-full rounded-3xl shadow-2xl overflow-hidden border transition-all duration-150 ease-out ${
                isDarkMode
                  ? 'border-[#293A2E] bg-[#101A13]'
                  : 'border-[#D7E3D9] bg-[#FFFFFF]'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/aistudio/Padel_Club_Victory_Snapshot_9f9a89c1.png"
                alt="Four Pakistani padel players smiling around a smartphone on a court after a match"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-center transition-transform duration-200 ease-out group-hover:scale-105"
              />

              {/* Subtle Pakistan Green Duotone & Bottom Vignette for Widget Contrast */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[#01411C]/15 mix-blend-overlay"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080F0A]/75 via-transparent to-transparent"
              />
            </div>

            {/* FLOATING APP WIDGET (Bottom / Left Offset): Split Payment Confirmation */}
            <div
              className={`relative mt-3 sm:mt-0 sm:absolute sm:-bottom-5 sm:-left-5 lg:-left-6 z-20 w-full sm:w-[275px] rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-150 ease-out hover:-translate-y-1 ${
                isDarkMode
                  ? 'border-[#293A2E] bg-[#101A13]/95 text-[#F5FFF7]'
                  : 'border-[#D7E3D9] bg-[#FFFFFF]/95 text-[#102117]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-semibold ${
                    isDarkMode ? 'text-[#F5FFF7]/80' : 'text-[#102117]/75'
                  }`}
                >
                  Court Fee Split (4 Players)
                </span>
                <CreditCard className="h-4 w-4 text-[#228B4E] shrink-0" />
              </div>

              <p className="mt-1 font-mono text-lg font-bold text-[#228B4E] tabular-nums">
                PKR 1,750 / player
              </p>

              <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#228B4E]/15 px-2.5 py-1 text-[11px] font-bold text-[#228B4E]">
                <span>✓ Paid via Raast Instant</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE (7 Columns): Narrative Storytelling, 4 Core Value Pillars & CTA */}
          <div className="lg:col-span-7 space-y-8 lg:pl-4">
            {/* Header Copy */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-lg border border-[#228B4E]/35 bg-[#01411C] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
                <span className="h-2 w-2 rounded-full bg-[#228B4E]" />
                <span>COMMUNITY &amp; MATCHMAKING</span>
              </div>

              <h2
                id="padel-match-engine-heading"
                className="font-display text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight leading-[1.12]"
                style={{ textWrap: 'balance' }}
              >
                Never Cancel a Match for Want of a Fourth.
              </h2>

              <p
                className={`max-w-2xl text-base sm:text-lg leading-relaxed ${
                  isDarkMode ? 'text-[#F5FFF7]/80' : 'text-[#102117]/75'
                }`}
              >
                Say goodbye to chaotic WhatsApp group chats and manual bank
                transfers. PakPadel matches you with players at your exact skill
                level and splits court fees automatically across Pakistan&apos;s
                premier panoramic venues.
              </p>
            </div>

            {/* 4 Core Value Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CORE_VALUE_PILLARS.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className={`group rounded-2xl border p-5 transition-all duration-150 ease-out hover:-translate-y-1 hover:shadow-lg ${
                      isDarkMode
                        ? 'border-[#293A2E] bg-[#101A13] hover:border-[#228B4E]/60'
                        : 'border-[#D7E3D9] bg-[#FFFFFF] hover:border-[#228B4E]/60'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#01411C] text-[#FFFFFF] border-b-2 border-[#003014] transition-transform duration-150 ease-out group-hover:scale-105">
                        <IconComponent className="h-5 w-5 text-[#228B4E]" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-display text-base font-bold">
                          {pillar.title}
                        </h3>
                        <p
                          className={`text-xs sm:text-sm leading-relaxed ${
                            isDarkMode
                              ? 'text-[#F5FFF7]/75'
                              : 'text-[#102117]/70'
                          }`}
                        >
                          {pillar.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Primary CTA Row & Subtitle */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handlePrimaryCtaClick}
                  className="min-h-[52px] inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#01411C] border border-[#228B4E]/40 border-b-4 border-b-[#003014] px-6 py-3.5 font-display text-sm sm:text-base font-bold text-[#FFFFFF] transition-all duration-150 ease-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#228B4E] whitespace-nowrap"
                >
                  <span>Download the Player App</span>
                  <ArrowRight className="h-4 w-4 text-[#228B4E] transition-transform duration-150 ease-out" />
                </button>

                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#228B4E]">
                    Available on iOS &amp; Android
                  </span>
                  <span
                    className={`text-xs ${
                      isDarkMode ? 'text-[#F5FFF7]/65' : 'text-[#102117]/65'
                    }`}
                  >
                    Instant Raast split-pay &amp; PPR skill matchmaking
                  </span>
                </div>
              </div>

              {downloadStatusMessage && (
                <div
                  role="status"
                  className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs font-semibold transition-all duration-150 ease-out ${
                    isDarkMode
                      ? 'border-[#228B4E]/45 bg-[#101A13] text-[#F5FFF7]'
                      : 'border-[#228B4E]/40 bg-[#FFFFFF] text-[#01411C]'
                  }`}
                >
                  <span>{downloadStatusMessage}</span>
                  <button
                    type="button"
                    onClick={() => setDownloadStatusMessage(null)}
                    className="rounded-md px-2 py-1 font-bold text-[#228B4E] hover:underline whitespace-nowrap shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
