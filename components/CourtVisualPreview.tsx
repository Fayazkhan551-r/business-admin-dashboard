'use client';

import React from 'react';
import { Home, Sun } from 'lucide-react';
import { CourtEnvironment, CourtType } from '@/lib/club-logic';

interface CourtVisualPreviewProps {
  photoUrl: string;
  courtName: string;
  courtType: CourtType;
  environment: CourtEnvironment;
  className?: string;
}

export function CourtVisualPreview({
  photoUrl,
  courtName,
  courtType,
  environment,
  className = 'h-44',
}: CourtVisualPreviewProps) {
  const isCustomDataUrl =
    photoUrl.startsWith('data:image/') ||
    photoUrl.startsWith('blob:') ||
    photoUrl.startsWith('/assets/');

  const isIndoor = environment === 'Indoor';
  const isSuper = courtType === 'Super Panoramic';

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${
        isIndoor
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950'
          : 'bg-gradient-to-br from-slate-900 via-sky-950 to-emerald-950'
      } ${className}`}
    >
      {isCustomDataUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={photoUrl}
          alt={courtName}
          referrerPolicy="no-referrer"
          className={`h-full w-full object-cover ${
            photoUrl.includes('image_83d05dfd.png')
              ? 'object-top scale-[2.1] translate-y-10'
              : 'object-center'
          }`}
        />
      ) : (
        <>
          {/* Top stadium floodlights glow */}
          <div className="pointer-events-none absolute -top-8 left-1/4 h-24 w-24 rounded-full bg-sky-400/20 blur-2xl" />
          <div className="pointer-events-none absolute -top-8 right-1/4 h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl" />

          {/* Architectural Isometric/Top-Down Padel Court SVG */}
          <svg
            viewBox="0 0 400 200"
            className="h-full w-full object-cover opacity-90"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id={`turf-${courtName.replace(/[^a-zA-Z0-9]/g, '')}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={isSuper ? '#1d4ed8' : '#0284c7'}
                />
                <stop
                  offset="100%"
                  stopColor={isSuper ? '#1e3a8a' : '#0369a1'}
                />
              </linearGradient>
            </defs>

            <rect x="0" y="0" width="400" height="200" fill="transparent" />

            {/* Glass / Mesh Perimeter Frame */}
            <rect
              x="56"
              y="26"
              width="288"
              height="144"
              rx="4"
              fill={`url(#turf-${courtName.replace(/[^a-zA-Z0-9]/g, '')})`}
              stroke={isSuper ? '#34d399' : '#94a3b8'}
              strokeWidth={isSuper ? '2.5' : '1.75'}
            />

            {/* Padel Court White Markings */}
            <line
              x1="106"
              y1="26"
              x2="106"
              y2="170"
              stroke="rgba(255,255,255,0.82)"
              strokeWidth="1.5"
            />
            <line
              x1="294"
              y1="26"
              x2="294"
              y2="170"
              stroke="rgba(255,255,255,0.82)"
              strokeWidth="1.5"
            />
            <line
              x1="106"
              y1="98"
              x2="294"
              y2="98"
              stroke="rgba(255,255,255,0.82)"
              strokeWidth="1.5"
            />

            {/* Net assembly across the middle */}
            <line
              x1="200"
              y1="20"
              x2="200"
              y2="176"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
            <circle cx="200" cy="22" r="3" fill="#10b981" />
            <circle cx="200" cy="174" r="3" fill="#10b981" />

            {/* Corner panoramic glass highlights */}
            <path
              d="M 56 50 L 56 26 L 84 26"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeOpacity="0.65"
            />
            <path
              d="M 316 26 L 344 26 L 344 50"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeOpacity="0.65"
            />
            <path
              d="M 56 146 L 56 170 L 84 170"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeOpacity="0.65"
            />
            <path
              d="M 316 170 L 344 170 L 344 146"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeOpacity="0.65"
            />
          </svg>
        </>
      )}

      {/* Contrast Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

      {/* Top-Left Indoor / Outdoor Frosted Glass Badge */}
      <div className="absolute top-3 left-3.5">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-slate-900/65 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
          {isIndoor ? (
            <Home className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-amber-400" />
          )}
          <span>{environment}</span>
        </span>
      </div>

      {/* Bottom Metadata Line */}
      <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between text-xs text-white">
        <span className="font-medium tracking-tight text-white/95">
          {courtType}
        </span>
        <span className="font-mono text-[11px] text-emerald-400 tabular-nums">
          20m × 10m FIP
        </span>
      </div>
    </div>
  );
}
