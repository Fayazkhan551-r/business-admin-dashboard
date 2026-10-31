'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Moon,
  Plus,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  Grid,
  X,
} from 'lucide-react';
import {
  PortalView,
  DEMO_CREDENTIALS,
  INITIAL_CLIFTON_COURTS,
  INITIAL_PARTNER_CLUBS,
  CliftonCourtItem,
  PartnerClubRecord,
  authenticatePartner,
  calculateCommissionSummary,
} from '@/lib/pakpadel-auth';
import { PAKPADEL_TOKENS } from '@/lib/tokens';
import { formatPkr } from '@/lib/club-logic';
import { PakPadelDashboard } from './PakPadelDashboard';
import { PadelCommunitySection } from './PadelCommunitySection';
import { PakPadelCommercialSections } from './PakPadelCommercialSections';

interface CityNetworkInfo {
  city: 'Islamabad' | 'Rawalpindi' | 'Lahore' | 'Karachi';
  clubsCount: number;
  courtsCount: number;
  flagshipVenue: string;
  avgRatePkr: string;
  utilization: string;
  description: string;
}

const CITY_NETWORK_DATA: CityNetworkInfo[] = [
  {
    city: 'Islamabad',
    clubsCount: 8,
    courtsCount: 28,
    flagshipVenue: 'F-7 / E-7 Sports Enclave & Sector I-8 Arena',
    avgRatePkr: 'PKR 4,000 – 7,000/hr',
    utilization: '89% Evening Peak',
    description:
      'Climate-controlled indoor panoramic courts and pine-lined outdoor floodlit arenas across F-6, F-7, E-7, and Gulberg Greens.',
  },
  {
    city: 'Rawalpindi',
    clubsCount: 5,
    courtsCount: 16,
    flagshipVenue: 'Bahria Town Phase 7 & DHA Phase 2 Central',
    avgRatePkr: 'PKR 3,500 – 6,500/hr',
    utilization: '84% Evening Peak',
    description:
      'High-ceiling super-panoramic cages with 150kVA generator backup and automated tournament scoreboards.',
  },
  {
    city: 'Lahore',
    clubsCount: 14,
    courtsCount: 52,
    flagshipVenue: 'Gulberg III Main Boulevard & DHA Phase 5',
    avgRatePkr: 'PKR 4,500 – 8,000/hr',
    utilization: '93% Evening Peak',
    description:
      'Pakistan’s largest competitive padel circuit featuring FIP-certified turf, pro shops, and specialty recovery cafes.',
  },
  {
    city: 'Karachi',
    clubsCount: 12,
    courtsCount: 46,
    flagshipVenue: 'Clifton Block 4 Enclave & DHA Phase 8 Creek',
    avgRatePkr: 'PKR 4,500 – 7,500/hr',
    utilization: '94% Evening Peak',
    description:
      'Late-night floodlit coastal venues operating until 02:00 AM PKT with instant split-payment player checkout.',
  },
];

const QUICK_BOOKING_SLOTS = [
  {
    time: '18:00 PKT',
    court: 'Clifton Court 1 (Indoor)',
    rate: 'PKR 7,000',
    spots: '1 spot left',
  },
  {
    time: '19:30 PKT',
    court: 'F-7 Center Court (Indoor)',
    rate: 'PKR 7,000',
    spots: 'Available',
  },
  {
    time: '21:00 PKT',
    court: 'Gulberg Arena 2 (Outdoor)',
    rate: 'PKR 7,500',
    spots: 'Available',
  },
  {
    time: '22:30 PKT',
    court: 'Bahria Phase 7 (Indoor)',
    rate: 'PKR 6,500',
    spots: '2 spots left',
  },
];

const HERO_LIFESTYLE_PANELS = [
  {
    id: 'action',
    tag: '01 · Action',
    title: 'High-Octane Jump Smash',
    caption: 'FIP Pro-Turf · Championship Cages',
    replacementPath: '/hero-action.jpg',
    src: 'https://images.unsplash.com/photo-1658723826297-fe4d1b1e6600?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
    alt: 'Padel player executing a high-octane jump smash at the net',
    badge: null,
  },
  {
    id: 'social',
    tag: '02 · Social',
    title: 'Post-Rally Net High-Five',
    caption: 'Community Matchmaking & Club Leagues',
    replacementPath: '/hero-social.jpg',
    src: 'https://images.unsplash.com/photo-1770230901556-4e1c0bacfb09?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
    alt: 'Smiling padel players celebrating a point at the net',
    badge: '⚡ Mixed Doubles & Social Ladders',
  },
  {
    id: 'court',
    tag: '03 · Atmosphere',
    title: 'Panoramic Floodlit Turf',
    caption: '500-Lux LED Night Arenas Until 02:00 AM',
    replacementPath: '/hero-court.jpg',
    src: 'https://images.unsplash.com/photo-1767128890583-b3f8dc30bdbc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
    alt: 'Panoramic floodlit padel court glowing green at night',
    badge: '🔥 24/7 Floodlit Action',
  },
] as const;

export function PakPadelPortalApp() {
  // Core View State: 'landing' | 'login' | 'dashboard_club' | 'dashboard_super'
  const [activeView, setActiveView] = useState<PortalView>('landing');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Landing Page Interactive States
  const [selectedCity, setSelectedCity] =
    useState<CityNetworkInfo['city']>('Karachi');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [instantBookedSlot, setInstantBookedSlot] = useState<string | null>(
    null
  );
  const [storeDownloadBanner, setStoreDownloadBanner] = useState<string | null>(
    null
  );

  // Openable Dropdowns, Menus, City Selectors & User Profile Popovers
  const [citySelectorOpen, setCitySelectorOpen] = useState<boolean>(false);
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [clubProfilePopoverOpen, setClubProfilePopoverOpen] =
    useState<boolean>(false);
  const [superProfilePopoverOpen, setSuperProfilePopoverOpen] =
    useState<boolean>(false);
  const [onboardCityDropdownOpen, setOnboardCityDropdownOpen] =
    useState<boolean>(false);

  // Refs for "Click Outside to Close" behavior
  const citySelectorRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const mobileNavTriggerRef = useRef<HTMLButtonElement>(null);
  const clubProfilePopoverRef = useRef<HTMLDivElement>(null);
  const superProfilePopoverRef = useRef<HTMLDivElement>(null);
  const onboardCityDropdownRef = useRef<HTMLDivElement>(null);

  // Global "Click Outside to Close" effect listening for mousedown and touchstart
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      if (
        citySelectorRef.current &&
        !citySelectorRef.current.contains(target)
      ) {
        setCitySelectorOpen(false);
      }

      if (
        mobileNavRef.current &&
        !mobileNavRef.current.contains(target) &&
        (!mobileNavTriggerRef.current ||
          !mobileNavTriggerRef.current.contains(target))
      ) {
        setMobileNavOpen(false);
      }

      if (
        clubProfilePopoverRef.current &&
        !clubProfilePopoverRef.current.contains(target)
      ) {
        setClubProfilePopoverOpen(false);
      }

      if (
        superProfilePopoverRef.current &&
        !superProfilePopoverRef.current.contains(target)
      ) {
        setSuperProfilePopoverOpen(false);
      }

      if (
        onboardCityDropdownRef.current &&
        !onboardCityDropdownRef.current.contains(target)
      ) {
        setOnboardCityDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Lock body scroll and close on Escape key when mobile slide-over drawer is open
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileNavOpen) {
        setMobileNavOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileNavOpen]);

  // Authentication Form State
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Club Admin Dashboard State (admin@clifton.pk)
  const [cliftonCourts, setCliftonCourts] = useState<CliftonCourtItem[]>(
    INITIAL_CLIFTON_COURTS
  );
  const [cliftonTagline, setCliftonTagline] = useState(
    'Clifton Block 4 Coastal Panoramic Arena · FIP Certified'
  );
  const [cliftonOpeningTime, setCliftonOpeningTime] = useState('07:00');
  const [cliftonClosingTime, setCliftonClosingTime] = useState('23:30');
  const [cliftonPeakStart, setCliftonPeakStart] = useState('17:00');
  const [cliftonBrandingSaved, setCliftonBrandingSaved] = useState<
    string | null
  >(null);
  const [showFullClubScheduler, setShowFullClubScheduler] = useState(true);

  // Super Admin Dashboard State (super@pakpadel.pk)
  const [partnerClubs, setPartnerClubs] = useState<PartnerClubRecord[]>(
    INITIAL_PARTNER_CLUBS
  );
  const [globalCommissionRate, setGlobalCommissionRate] = useState<number>(8);
  const [instantRaastSettlement, setInstantRaastSettlement] =
    useState<boolean>(true);
  const [autoOnboardingVerification, setAutoOnboardingVerification] =
    useState<boolean>(true);
  const [newClubName, setNewClubName] = useState('');
  const [newClubCity, setNewClubCity] =
    useState<PartnerClubRecord['city']>('Islamabad');
  const [newClubCourts, setNewClubCourts] = useState('4');
  const [newClubGrossPkr] = useState('5200000');
  const [superAdminBanner, setSuperAdminBanner] = useState<string | null>(null);

  const logoSrc = isDarkMode
    ? PAKPADEL_TOKENS.logo.dark
    : PAKPADEL_TOKENS.logo.light;

  const navigateToView = (view: PortalView) => {
    setActiveView(view);
    setCitySelectorOpen(false);
    setMobileNavOpen(false);
    setClubProfilePopoverOpen(false);
    setSuperProfilePopoverOpen(false);
    setOnboardCityDropdownOpen(false);
    setEmailError(null);
    setPasswordError(null);
    setFormError(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setPasswordError(null);
    setFormError(null);

    const result = authenticatePartner(emailInput, passwordInput);
    if (!result.valid) {
      if (result.emailError) setEmailError(result.emailError);
      if (result.passwordError) setPasswordError(result.passwordError);
      if (result.formError) setFormError(result.formError);
      return;
    }

    if (result.targetView) {
      navigateToView(result.targetView);
    }
  };

  const handleFillDemoCredential = (roleKey: 'clubAdmin' | 'superAdmin') => {
    const cred = DEMO_CREDENTIALS[roleKey];
    setEmailInput(cred.email);
    setPasswordInput(cred.password);
    setEmailError(null);
    setPasswordError(null);
    setFormError(null);
  };

  const handleToggleCliftonCourtStatus = (courtId: string) => {
    setCliftonCourts((prev) =>
      prev.map((c) =>
        c.id === courtId
          ? { ...c, status: c.status === 'Active' ? 'Maintenance' : 'Active' }
          : c
      )
    );
  };

  const handleAdjustCliftonCourtRate = (courtId: string, delta: number) => {
    setCliftonCourts((prev) =>
      prev.map((c) =>
        c.id === courtId
          ? {
              ...c,
              baseRatePkr: Math.max(2000, c.baseRatePkr + delta),
              peakRatePkr: Math.max(3000, c.peakRatePkr + delta),
            }
          : c
      )
    );
  };

  const handleSaveCliftonBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setCliftonBrandingSaved(
      `Saved Karachi Clifton Courts branding & operating window (${cliftonOpeningTime}–${cliftonClosingTime} PKT).`
    );
  };

  const handleOnboardNewClub = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newClubName.trim();
    if (!trimmedName) {
      setSuperAdminBanner('Please enter a valid club name to onboard.');
      return;
    }
    const courtsNum = Math.max(1, Number(newClubCourts) || 4);
    const grossNum = Math.max(500000, Number(newClubGrossPkr) || 4500000);

    const newRecord: PartnerClubRecord = {
      id: `club-${Date.now()}`,
      name: trimmedName,
      city: newClubCity,
      courtsCount: courtsNum,
      monthlyGrossPkr: grossNum,
      commissionRatePercent: globalCommissionRate,
      status: 'Live',
    };

    setPartnerClubs((prev) => [newRecord, ...prev]);
    setNewClubName('');
    setSuperAdminBanner(
      `Onboarded "${trimmedName}" (${newClubCity} · ${courtsNum} courts) to PakPadel National Network.`
    );
  };

  const activeCityObj =
    CITY_NETWORK_DATA.find((c) => c.city === selectedCity) ||
    CITY_NETWORK_DATA[0];

  const commissionSummary = calculateCommissionSummary(
    partnerClubs,
    globalCommissionRate
  );

  // ============================================================================
  // VIEW 1: MARKETING LANDING PAGE ('landing')
  // ============================================================================
  if (activeView === 'landing') {
    return (
      <div
        className={`min-h-screen w-full overflow-x-hidden scroll-smooth transition-colors duration-300 selection:bg-[#228B4E] selection:text-[#FFFFFF] ${
          isDarkMode
            ? 'bg-[#080F0A] text-[#F5FFF7]'
            : 'bg-[#F7FAF8] text-[#102117]'
        }`}
      >
        {/* Sticky Top Navbar — Pakistan Green (#01411C) with Official Brand Logo */}
        <header className="sticky top-0 z-40 border-b border-[#003014] bg-[#01411C]/95 backdrop-blur-md text-[#FFFFFF]">
          <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-3 sm:gap-8 px-4 py-3 sm:px-8 sm:py-3.5">
            {/* Zone 1: Official Brand Logo (<img> with h-8 md:h-10 w-auto object-contain) */}
            <a
              href="#top"
              aria-label="PakPadel Home"
              className="inline-flex items-center gap-3 whitespace-nowrap shrink-0 rounded-lg transition-all duration-200 ease-in-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#228B4E]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt="PakPadel"
                referrerPolicy="no-referrer"
                className="h-8 md:h-10 w-auto object-contain rounded-lg bg-[#FFFFFF] p-0.5 shadow-xs transition-all duration-200 ease-in-out"
              />
            </a>

            {/* Zone 2: Concise Single-Line Navigation Links + Click-Outside City Selector Popover */}
            <nav
              aria-label="Primary Marketing Navigation"
              className="hidden md:flex items-center gap-2 lg:gap-4 text-sm font-medium text-[#FFFFFF]/90"
            >
              <a
                href="#features"
                className="rounded-lg px-3 py-1.5 transition-all duration-200 ease-in-out hover:bg-[#18271C] hover:text-[#228B4E] whitespace-nowrap shrink-0"
              >
                Features
              </a>
              <a
                href="#for-clubs"
                className="rounded-lg px-3 py-1.5 transition-all duration-200 ease-in-out hover:bg-[#18271C] hover:text-[#228B4E] whitespace-nowrap shrink-0"
              >
                For Clubs
              </a>
              <a
                href="#network"
                className="rounded-lg px-3 py-1.5 transition-all duration-200 ease-in-out hover:bg-[#18271C] hover:text-[#228B4E] whitespace-nowrap shrink-0"
              >
                Network
              </a>

              {/* City Selector Dropdown with "Click Outside to Close" */}
              <div ref={citySelectorRef} className="relative">
                <button
                  type="button"
                  onClick={() => setCitySelectorOpen((prev) => !prev)}
                  aria-expanded={citySelectorOpen}
                  aria-haspopup="listbox"
                  aria-label="Select City Hub"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#228B4E]/40 bg-[#003014]/70 px-3 py-1.5 text-xs font-semibold text-[#FFFFFF] transition-all duration-200 ease-in-out hover:bg-[#18271C] hover:border-[#228B4E] whitespace-nowrap shrink-0"
                >
                  <MapPin className="h-3.5 w-3.5 text-[#228B4E] transition-all duration-200 ease-in-out" />
                  <span>{selectedCity}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-[#FFFFFF]/80 transition-all duration-200 ease-in-out ${
                      citySelectorOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {citySelectorOpen && (
                  <div
                    role="listbox"
                    aria-label="City Hubs"
                    className={`absolute right-0 mt-2 w-56 rounded-xl border p-1.5 shadow-xl z-50 transition-all duration-200 ease-in-out ${
                      isDarkMode
                        ? 'border-[#228B4E]/35 bg-[#101A13] text-[#F5FFF7]'
                        : 'border-[#102117]/15 bg-[#FFFFFF] text-[#102117]'
                    }`}
                  >
                    <div className="px-3 py-1.5 text-[11px] font-bold text-[#228B4E] border-b border-current/10">
                      Active Metropolitan Hubs
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {CITY_NETWORK_DATA.map((item) => {
                        const isSelected = selectedCity === item.city;
                        return (
                          <button
                            key={item.city}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setSelectedCity(item.city);
                              setCitySelectorOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition-all duration-200 ease-in-out ${
                              isSelected
                                ? 'bg-[#01411C] text-[#FFFFFF]'
                                : isDarkMode
                                  ? 'text-[#F5FFF7] hover:bg-[#18271C]'
                                  : 'text-[#102117] hover:bg-[#D6EFE0]/50'
                            }`}
                          >
                            <span>{item.city}</span>
                            <span
                              className={`font-mono text-[11px] tabular-nums ${
                                isSelected
                                  ? 'text-[#FFFFFF]/90'
                                  : 'text-[#228B4E]'
                              }`}
                            >
                              {item.clubsCount} Clubs
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsDarkMode((prev) => !prev)}
                aria-label={
                  isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'
                }
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#FFFFFF]/85 transition-all duration-200 ease-in-out hover:bg-[#18271C] hover:text-[#FFFFFF] whitespace-nowrap shrink-0"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-[#228B4E] transition-all duration-200 ease-in-out" />
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 text-[#228B4E] transition-all duration-200 ease-in-out" />
                    <span>Dark</span>
                  </>
                )}
              </button>
            </nav>

            {/* Zone 3: Single Primary Action ("Partner Login") + Mobile Menu Dropdown */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => navigateToView('login')}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#228B4E] border-b-4 border-[#003014] px-5 py-2.5 font-display text-xs sm:text-sm font-bold text-[#FFFFFF] transition-all duration-200 ease-in-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#228B4E] whitespace-nowrap shrink-0"
              >
                <span>Partner Login</span>
                <ArrowRight className="h-4 w-4 text-[#FFFFFF] transition-all duration-200 ease-in-out" />
              </button>

              {/* Mobile Navigation Menu Trigger (< md) */}
              <div className="relative md:hidden">
                <button
                  ref={mobileNavTriggerRef}
                  type="button"
                  onClick={() => setMobileNavOpen((prev) => !prev)}
                  aria-label="Toggle navigation menu"
                  aria-expanded={mobileNavOpen}
                  aria-controls="pakpadel-mobile-drawer"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#228B4E]/40 bg-[#003014] text-[#FFFFFF] transition-all duration-200 ease-in-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0"
                >
                  {mobileNavOpen ? (
                    <X className="h-5 w-5 transition-all duration-200 ease-in-out" />
                  ) : (
                    <Menu className="h-5 w-5 transition-all duration-200 ease-in-out" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Kinetic Mobile Navigation Slide-Over Drawer + Full-Screen Gaussian Blur Backdrop (< md) */}
        <div
          aria-hidden={!mobileNavOpen}
          className={`fixed inset-0 z-50 md:hidden ${
            mobileNavOpen ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          {/* Full-screen backdrop overlay with heavy gaussian blur */}
          <div
            onClick={() => setMobileNavOpen(false)}
            className={`fixed inset-0 backdrop-blur-md bg-black/75 transition-opacity duration-300 ${
              mobileNavOpen ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Fixed Right Slide-Over Drawer (w-[85%] max-w-sm h-full) with dynamic spring easing */}
          <aside
            id="pakpadel-mobile-drawer"
            ref={mobileNavRef}
            aria-label="Mobile Navigation Drawer"
            className={`fixed inset-y-0 right-0 z-50 flex h-full w-[85%] max-w-sm flex-col justify-between border-l border-[#293A2E] bg-gradient-to-b from-[#080F0A] via-[#101A13] to-[#080F0A] text-[#F5FFF7] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              mobileNavOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Top Zone: Drawer Header + Interactive Nav Item Micro-Cards */}
            <div className="flex-1 overflow-y-auto px-5 pt-5 pb-6 space-y-6">
              {/* Drawer Header: PakPadel logo badge + "Live in PK" pulsing status indicator + Close (X) button */}
              <div className="flex items-center justify-between gap-2 border-b border-[#293A2E] pb-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoSrc}
                    alt="PakPadel"
                    referrerPolicy="no-referrer"
                    className="h-8 w-auto object-contain rounded-lg bg-[#FFFFFF] p-0.5 shrink-0 shadow-xs"
                  />
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#228B4E]/45 bg-[#01411C]/80 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#F5FFF7]">
                    <span className="h-2 w-2 rounded-full bg-[#228B4E] animate-pulse" />
                    <span>Live in PK</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close mobile navigation drawer"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#293A2E] bg-[#101A13] text-[#F5FFF7] transition-all duration-200 hover:border-[#228B4E]/60 hover:bg-[#18271C] hover:text-[#228B4E]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Navigation Micro-Cards List */}
              <nav aria-label="Mobile Primary Links" className="space-y-3">
                {/* 1. Features (with Sparkles icon) */}
                <a
                  href="#features"
                  onClick={() => setMobileNavOpen(false)}
                  className="group flex items-center justify-between gap-3 rounded-2xl bg-[#101A13] hover:bg-[#18271C] border border-[#293A2E] hover:border-[#228B4E]/50 p-3.5 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#228B4E]/35 bg-[#01411C]/70 text-[#228B4E] shadow-inner">
                      <Sparkles className="h-4 w-4 text-[#228B4E]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-bold text-[#F5FFF7]">
                          Features
                        </span>
                        <span className="rounded-md bg-[#228B4E]/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#228B4E]">
                          Raast Split
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#A7B8AB] truncate">
                        15-sec court booking &amp; PPR matchmaking
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#228B4E] transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>

                {/* 2. PakPadel for Clubs (with Building2 icon) */}
                <a
                  href="#for-clubs"
                  onClick={() => setMobileNavOpen(false)}
                  className="group flex items-center justify-between gap-3 rounded-2xl bg-[#101A13] hover:bg-[#18271C] border border-[#293A2E] hover:border-[#228B4E]/50 p-3.5 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#228B4E]/35 bg-[#01411C]/70 text-[#228B4E] shadow-inner">
                      <Building2 className="h-4 w-4 text-[#228B4E]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-bold text-[#F5FFF7]">
                          PakPadel for Clubs
                        </span>
                        <span className="rounded-md bg-[#228B4E]/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#228B4E]">
                          B2B SaaS
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#A7B8AB] truncate">
                        Playtomic-grade court matrix &amp; peak rules
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#228B4E] transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>

                {/* 3. National Network (with Globe icon) */}
                <a
                  href="#network"
                  onClick={() => setMobileNavOpen(false)}
                  className="group flex items-center justify-between gap-3 rounded-2xl bg-[#101A13] hover:bg-[#18271C] border border-[#293A2E] hover:border-[#228B4E]/50 p-3.5 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#228B4E]/35 bg-[#01411C]/70 text-[#228B4E] shadow-inner">
                      <Globe className="h-4 w-4 text-[#228B4E]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-bold text-[#F5FFF7]">
                          National Network
                        </span>
                        <span className="rounded-md bg-[#228B4E]/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#228B4E]">
                          {selectedCity}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#A7B8AB] truncate">
                        39 partner clubs · 142 panoramic courts
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#228B4E] transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>

                {/* 4. Theme Toggle Micro-Card */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDarkMode((prev) => !prev);
                    setMobileNavOpen(false);
                  }}
                  className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-[#101A13] hover:bg-[#18271C] border border-[#293A2E] hover:border-[#228B4E]/50 p-3.5 text-left transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#228B4E]/35 bg-[#01411C]/70 text-[#228B4E] shadow-inner">
                      {isDarkMode ? (
                        <Sun className="h-4 w-4 text-[#228B4E]" />
                      ) : (
                        <Moon className="h-4 w-4 text-[#228B4E]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-bold text-[#F5FFF7]">
                          Theme Toggle
                        </span>
                        <span className="rounded-md bg-[#228B4E]/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#228B4E]">
                          {isDarkMode ? 'Dark' : 'Light'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#A7B8AB] truncate">
                        {isDarkMode
                          ? 'Switch to Light Surface (#F7FAF8)'
                          : 'Switch to Dark Canvas (#080F0A)'}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#228B4E] shrink-0">
                    Switch
                  </span>
                </button>
              </nav>
            </div>

            {/* Drawer Footer: "Club Owner Portal" micro-callout + full-width tactile green button "Launch Partner Workspace" */}
            <div className="border-t border-[#293A2E] bg-[#080F0A]/90 p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#228B4E]">
                    Club Owner Portal
                  </span>
                  <p className="text-xs text-[#A7B8AB]">
                    Manage Clifton, Gulberg &amp; F-8 courts
                  </p>
                </div>
                <ShieldCheck className="h-4 w-4 text-[#228B4E] shrink-0" />
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  navigateToView('login');
                }}
                className="min-h-[48px] w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#01411C] border border-[#228B4E]/45 border-b-4 border-b-[#00280f] px-4 py-3 font-display text-xs sm:text-sm font-bold text-[#F5FFF7] shadow-lg transition-all duration-200 hover:bg-[#228B4E] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#228B4E] whitespace-nowrap"
              >
                <span>Launch Partner Workspace</span>
                <ArrowRight className="h-4 w-4 text-[#228B4E]" />
              </button>
            </div>
          </aside>
        </div>

        {/* Hero Section — 3-Split Sports Lifestyle Visuals + Contrast-Shielded Copy + Responsive Bar/Box Booking Widget */}
        <section
          id="top"
          className="relative overflow-hidden bg-[#080F0A] text-[#F5FFF7] pt-8 pb-12 sm:pt-14 sm:pb-20 border-b border-[#228B4E]/25"
        >
          {/* Ambient Pakistan Green radial highlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(1,65,28,0.6),transparent_65%)]"
          />

          <div className="relative z-10 mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 space-y-8 lg:space-y-12">
            {/* Top Hero Container: flex flex-col lg:flex-row items-center gap-8 px-4 sm:px-6 */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 px-0 sm:px-2">
              {/* Left Column (45% width on desktop): Wrapped in soft gradient for 100% text contrast & alignment */}
              <div className="w-full lg:w-[45%] shrink-0 relative z-20 rounded-2xl bg-gradient-to-r from-[#080F0A] via-[#080F0A]/90 to-transparent p-1 sm:p-2 flex flex-col justify-between space-y-6 text-center lg:text-left">
                <div className="space-y-4 sm:space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-[#228B4E]/35 bg-[#101A13]/90 px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#228B4E] tracking-wide mx-auto lg:mx-0">
                    <span className="h-2 w-2 rounded-full bg-[#228B4E] shrink-0" />
                    <span>Islamabad · Rawalpindi · Lahore · Karachi</span>
                  </div>

                  <h1
                    className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight font-black text-center lg:text-left tracking-tight text-[#F5FFF7]"
                    style={{ textWrap: 'balance' }}
                  >
                    Pakistan&apos;s Premier Padel Network.
                  </h1>

                  <p className="max-w-xl mx-auto lg:mx-0 text-sm sm:text-base lg:text-lg text-[#F5FFF7]/85 leading-relaxed text-center lg:text-left">
                    Book courts instantly, find matches, and manage club
                    operations effortlessly. Connected real-time court
                    scheduling and split payments built for Pakistan&apos;s
                    fastest-growing racquet sport.
                  </p>
                </div>

                {/* Mobile 3-Split Image Grid: Positioned prominently between headline copy and booking preview card on mobile (< lg) */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-md mx-auto my-6 lg:hidden">
                  {HERO_LIFESTYLE_PANELS.map((panel) => (
                    <div
                      key={`mobile-card-${panel.id}`}
                      data-replacement-src={panel.replacementPath}
                      className="aspect-[3/4] rounded-xl overflow-hidden border border-[#228B4E]/40 shadow-md relative bg-[#101A13]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={panel.src}
                        alt={panel.alt}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center transition-transform duration-200 ease-out hover:scale-105"
                      />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080F0A]/55 via-transparent to-[#01411C]/25"
                      />
                    </div>
                  ))}
                </div>

                {/* Dual Call-to-Actions: App Store & Google Play — Tactile 3D Pakistan Green (#01411C) with Official Embedded SVG Vectors */}
                <div className="space-y-4 pt-1 w-full">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 w-full sm:w-auto">
                    {/* Download on the App Store Button — Official Apple Monochrome White SVG */}
                    <button
                      type="button"
                      onClick={() =>
                        setStoreDownloadBanner(
                          'PakPadel iOS App (v4.2) — Instant Apple Pay, Raast & Matchmaking enabled. Scan QR or test live booking below.'
                        )
                      }
                      aria-label="Download on the App Store"
                      className="group min-h-[54px] inline-flex items-center justify-center sm:justify-start gap-3.5 rounded-xl bg-[#01411C] border border-[#228B4E]/40 border-b-4 border-b-[#00280f] px-5 py-3 text-left text-white shadow-md transition-all duration-150 ease-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#228B4E] whitespace-nowrap shrink-0"
                    >
                      <svg
                        viewBox="0 0 384 512"
                        aria-hidden="true"
                        className="h-6 w-6 fill-white text-white shrink-0 transition-transform duration-150 ease-out group-hover:scale-110"
                      >
                        <path
                          fill="#FFFFFF"
                          d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
                        />
                      </svg>
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider leading-none text-[#A7B8AB]">
                          Download on the
                        </span>
                        <span className="mt-1 block font-display text-sm font-bold leading-none text-white">
                          App Store
                        </span>
                      </div>
                    </button>

                    {/* Get it on Google Play Button — Authentic 4-Color Polygon Badge SVG */}
                    <button
                      type="button"
                      onClick={() =>
                        setStoreDownloadBanner(
                          'PakPadel Android APK & Play Store build — Live push alerts for open matches in Karachi, Lahore & Islamabad.'
                        )
                      }
                      aria-label="Get it on Google Play"
                      className="group min-h-[54px] inline-flex items-center justify-center sm:justify-start gap-3.5 rounded-xl bg-[#01411C] border border-[#228B4E]/40 border-b-4 border-b-[#00280f] px-5 py-3 text-left text-white shadow-md transition-all duration-150 ease-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#228B4E] whitespace-nowrap shrink-0"
                    >
                      <svg
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                        className="h-6 w-6 shrink-0 transition-transform duration-150 ease-out group-hover:scale-110"
                      >
                        <path
                          fill="#00D2FF"
                          d="M7.3 4.8C6.5 5.6 6 6.9 6 8.6v30.8c0 1.7.5 3 1.3 3.8l.2.2L26.2 24v-.4L7.5 4.6l-.2.2z"
                        />
                        <path
                          fill="#00F076"
                          d="M32.5 17.7L7.5 3.6C6 2.7 4.7 2.8 3.8 3.7l22.4 20.3 6.3-6.3z"
                        />
                        <path
                          fill="#FF3A44"
                          d="M7.5 44.4l25-14.1-6.3-6.3L3.8 44.3c.9.9 2.2 1 3.7.1z"
                        />
                        <path
                          fill="#FFCE00"
                          d="M41.4 21.8l-8.9-5-6.5 6.6 6.5 6.6 9-5.1c1.6-.9 1.6-2.2-.1-3.1z"
                        />
                      </svg>
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider leading-none text-[#A7B8AB]">
                          GET IT ON
                        </span>
                        <span className="mt-1 block font-display text-sm font-bold leading-none text-white">
                          Google Play
                        </span>
                      </div>
                    </button>
                  </div>

                  {storeDownloadBanner && (
                    <div
                      role="status"
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#228B4E]/45 bg-[#101A13] px-4 py-3 text-xs text-[#F5FFF7] transition-all duration-150 ease-out text-left"
                    >
                      <span>{storeDownloadBanner}</span>
                      <button
                        type="button"
                        onClick={() => setStoreDownloadBanner(null)}
                        className="rounded-md px-2 py-1 font-semibold text-[#228B4E] transition-all duration-150 ease-out hover:bg-[#18271C] whitespace-nowrap shrink-0"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* Active Club Counters Proof Line */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs text-[#F5FFF7]/80 pt-1">
                    <span className="font-mono font-semibold text-[#228B4E] tabular-nums">
                      39 Partner Clubs
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      142 Panoramic Courts
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Instant Raast &amp; Card Split Checkout</span>
                  </div>
                </div>
              </div>

              {/* Right Column (55% width on desktop): 3-Split Sports Lifestyle Visual Panels Tilted Right */}
              <div className="hidden lg:block lg:w-[55%] relative z-10 pr-2">
                {/* Ambient emerald backlight behind tilted panels */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-4 rounded-3xl bg-[radial-gradient(circle_at_50%_50%,rgba(34,139,78,0.28),transparent_70%)] blur-xl"
                />

                {/* 3-Column Angled/Tilted Right Grid (-skew-x-6 + rotate-2) */}
                <div className="relative grid grid-cols-3 gap-4 px-2 py-3">
                  {HERO_LIFESTYLE_PANELS.map((panel, index) => {
                    const staggerClass =
                      index === 0
                        ? 'translate-y-3'
                        : index === 1
                          ? '-translate-y-3'
                          : 'translate-y-1';

                    return (
                      <div
                        key={panel.id}
                        data-replacement-src={panel.replacementPath}
                        className={`group relative h-[380px] xl:h-[410px] overflow-hidden rounded-2xl border border-[#228B4E]/35 bg-[#101A13] shadow-[0_20px_45px_rgba(5,11,7,0.85)] -skew-x-6 rotate-2 ${staggerClass} transition-all duration-150 ease-out hover:-translate-y-2 hover:border-[#228B4E] hover:shadow-[0_24px_55px_rgba(1,65,28,0.65)]`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={panel.src}
                          alt={panel.alt}
                          referrerPolicy="no-referrer"
                          className="h-full w-full scale-110 object-cover object-center transition-transform duration-200 ease-out group-hover:scale-120"
                        />

                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-[#01411C]/25 mix-blend-overlay transition-opacity duration-150 ease-out group-hover:opacity-10"
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080F0A]/55 via-transparent to-[#01411C]/35 transition-opacity duration-150 ease-out group-hover:opacity-40"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Re-Engineered Live Court Availability Widget:
                - Mobile (< lg): Horizontal scrollable slot strip inside compact card
                - Desktop (lg+): Horizontal Docked Command Bar */}
            <div className="relative z-30 rounded-2xl border border-[#228B4E]/35 bg-[#101A13]/95 backdrop-blur-md p-4 sm:p-5 lg:px-6 lg:py-4 shadow-[0_20px_50px_rgba(5,11,7,0.85)] transition-all duration-150 ease-out hover:border-[#228B4E]/60">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-5">
                {/* Segment 1: Live Court Diagram & Title Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 lg:w-[290px] xl:w-[320px] shrink-0 border-b border-[#F5FFF7]/10 pb-3.5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
                  {/* Compact Top-Down Padel Court Schematic */}
                  <div className="relative h-16 w-full sm:w-28 shrink-0 overflow-hidden rounded-xl border border-[#228B4E]/30 bg-[#080F0A] p-2 flex items-center justify-center">
                    <svg
                      viewBox="0 0 320 110"
                      className="h-11 w-full"
                      role="img"
                      aria-label="Top-down Padel Court schematic with active players"
                    >
                      <rect
                        x="8"
                        y="6"
                        width="304"
                        height="98"
                        rx="6"
                        fill="#01411C"
                        stroke="#228B4E"
                        strokeWidth="3"
                      />
                      <line
                        x1="68"
                        y1="6"
                        x2="68"
                        y2="104"
                        stroke="#F5FFF7"
                        strokeOpacity="0.45"
                        strokeWidth="2"
                      />
                      <line
                        x1="252"
                        y1="6"
                        x2="252"
                        y2="104"
                        stroke="#F5FFF7"
                        strokeOpacity="0.45"
                        strokeWidth="2"
                      />
                      <line
                        x1="68"
                        y1="55"
                        x2="252"
                        y2="55"
                        stroke="#F5FFF7"
                        strokeOpacity="0.45"
                        strokeWidth="2"
                      />
                      <line
                        x1="160"
                        y1="2"
                        x2="160"
                        y2="108"
                        stroke="#228B4E"
                        strokeWidth="3"
                        strokeDasharray="4 3"
                      />
                      <circle cx="105" cy="32" r="7" fill="#228B4E" />
                      <circle cx="105" cy="78" r="7" fill="#228B4E" />
                      <circle cx="215" cy="32" r="7" fill="#F5FFF7" />
                      <circle cx="215" cy="78" r="7" fill="#F5FFF7" />
                    </svg>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#228B4E]" />
                      <p className="text-[11px] font-semibold text-[#228B4E]">
                        Tonight&apos;s Prime Evening Window
                      </p>
                    </div>
                    <p className="font-display text-base font-bold text-[#F5FFF7]">
                      Live Court Availability
                    </p>
                    <p className="font-mono text-[11px] text-[#F5FFF7]/70 tabular-nums">
                      60 / 90 Mins · PKT (UTC+5)
                    </p>
                  </div>
                </div>

                {/* Segment 2: Interactive Quick Slot Selector (Horizontal Scroll Row on Mobile, 4-Column Bar on Desktop) */}
                <div className="flex-1 min-w-0">
                  <div className="mb-2 flex items-center justify-between text-xs text-[#F5FFF7]/80 lg:hidden">
                    <span className="truncate pr-2">
                      Swipe &amp; select a live evening slot
                    </span>
                    <span className="font-mono text-[#228B4E] tabular-nums shrink-0">
                      PKT (UTC+5)
                    </span>
                  </div>

                  <div className="overflow-x-auto pb-2 scrollbar-none flex gap-2 lg:grid lg:grid-cols-4 lg:gap-2.5 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {QUICK_BOOKING_SLOTS.map((slot, idx) => {
                      const isSelected = selectedSlotIndex === idx;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => {
                            setSelectedSlotIndex(idx);
                            setInstantBookedSlot(null);
                          }}
                          className={`min-w-[168px] sm:min-w-[185px] lg:min-w-0 shrink-0 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#228B4E] ${
                            isSelected
                              ? 'border-[#228B4E] bg-[#01411C] text-[#FFFFFF] shadow-md'
                              : 'border-[#F5FFF7]/12 bg-[#080F0A] text-[#F5FFF7]/85 hover:border-[#228B4E]/60 hover:bg-[#18271C]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`font-mono text-xs font-bold tabular-nums ${
                                isSelected ? 'text-[#FFFFFF]' : 'text-[#228B4E]'
                              }`}
                            >
                              {slot.time}
                            </span>
                            <span className="font-mono text-[11px] text-[#FFFFFF]/90 tabular-nums">
                              {slot.rate}
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-semibold text-[#FFFFFF] truncate">
                            {slot.court}
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#D6EFE0]/75">
                            {slot.spots}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Segment 3: Selected Slot Readout & Reserve Action Button */}
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#F5FFF7]/10 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5 shrink-0">
                  <div className="text-left lg:text-right xl:text-left">
                    {instantBookedSlot ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#228B4E]">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span className="max-w-[190px] truncate">
                          Reserved {instantBookedSlot}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-[#F5FFF7]/60">
                          Selected Court
                        </span>
                        <span className="block text-xs font-semibold text-[#F5FFF7] max-w-[180px] truncate">
                          {QUICK_BOOKING_SLOTS[selectedSlotIndex].court}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setInstantBookedSlot(
                        `${QUICK_BOOKING_SLOTS[selectedSlotIndex].court} at ${QUICK_BOOKING_SLOTS[selectedSlotIndex].time}`
                      )
                    }
                    className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#228B4E] border-b-4 border-[#003014] px-5 py-2.5 text-xs font-bold text-[#FFFFFF] transition-all duration-150 ease-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#228B4E] whitespace-nowrap shrink-0"
                  >
                    <span>Reserve Slot Now</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-all duration-150 ease-out" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community & Matchmaking Section ("The Padel Match Engine") */}
        <PadelCommunitySection isDarkMode={isDarkMode} />

        {/* 4 Commercial Playtomic-Standard Sections + Enterprise Dark Footer */}
        <PakPadelCommercialSections
          isDarkMode={isDarkMode}
          logoSrc={logoSrc}
          onNavigateToLogin={() => navigateToView('login')}
          onSelectNetworkCity={(city) => setSelectedCity(city)}
        >
          {/* Product Details — Asymmetric Bento Grid Section */}
          <section
            id="features"
            className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 sm:py-24 space-y-12"
          >
          <div
            className={`flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-6 ${
              isDarkMode ? 'border-[#F5FFF7]/12' : 'border-[#102117]/12'
            }`}
          >
            <div>
              <p className="text-xs font-semibold text-[#228B4E]">
                Unified Platform Architecture · Players & Venue Operators
              </p>
              <h2
                className={`mt-1 font-display text-2xl sm:text-4xl font-bold tracking-tight ${
                  isDarkMode ? 'text-[#F5FFF7]' : 'text-[#102117]'
                }`}
                style={{ textWrap: 'balance' }}
              >
                Engineered for Every Court in Pakistan
              </h2>
            </div>
            <p
              className={`max-w-md text-sm ${
                isDarkMode ? 'text-[#F5FFF7]/75' : 'text-[#102117]/75'
              }`}
            >
              One ecosystem connecting mobile players looking for instant evening
              matches with club owners managing multi-court utilization.
            </p>
          </div>

          {/* Asymmetric Bento Grid (3 Features) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feature 1 (For Players — Spans 2 Columns on Desktop) */}
            <div
              className={`lg:col-span-2 rounded-2xl border p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xs transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg ${
                isDarkMode
                  ? 'border-[#228B4E]/25 bg-[#101A13] text-[#F5FFF7]'
                  : 'border-[#102117]/12 bg-[#FFFFFF] text-[#102117]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#228B4E]">
                    01. For Players
                  </span>
                  <span
                    className={
                      isDarkMode ? 'text-[#F5FFF7]/70' : 'text-[#102117]/65'
                    }
                  >
                    Real-Time Court Availability & Instant Bookings
                  </span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold">
                  Book Courts in 15 Seconds with 4-Player Split Checkout
                </h3>
                <p
                  className={`text-sm sm:text-base leading-relaxed max-w-2xl ${
                    isDarkMode ? 'text-[#F5FFF7]/80' : 'text-[#102117]/75'
                  }`}
                >
                  Browse live 60, 90, and 120-minute court slots across indoor
                  climate-controlled and outdoor floodlit venues. Split court
                  fees automatically among four players via Raast, Apple Pay, or
                  debit card—no WhatsApp back-and-forth required.
                </p>
              </div>

              {/* Interactive Player Split-Pay Simulator inside Bento Card 1 */}
              <div
                className={`rounded-xl border p-4 sm:p-5 transition-all duration-200 ease-in-out ${
                  isDarkMode
                    ? 'border-[#228B4E]/25 bg-[#080F0A]'
                    : 'border-[#102117]/10 bg-[#F7FAF8]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold">
                      Instant Match Split Calculator · 90-Min Peak Court
                    </p>
                    <p
                      className={`text-xs ${
                        isDarkMode ? 'text-[#F5FFF7]/75' : 'text-[#102117]/70'
                      }`}
                    >
                      Total Court Fee:{' '}
                      <span className="font-mono font-bold text-[#228B4E] tabular-nums">
                        PKR 7,000
                      </span>{' '}
                      · Divided equally across 4 players
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span
                        className={`block text-[11px] ${
                          isDarkMode ? 'text-[#F5FFF7]/65' : 'text-[#102117]/65'
                        }`}
                      >
                        Per Player Share
                      </span>
                      <span className="font-mono text-lg font-bold text-[#228B4E] tabular-nums">
                        PKR 1,750
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateToView('login')}
                      className="min-h-[42px] rounded-xl bg-[#01411C] border-b-4 border-[#003014] px-4 py-2 text-xs font-bold text-[#FFFFFF] transition-all duration-200 ease-in-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#228B4E] whitespace-nowrap shrink-0"
                    >
                      Try Partner Portal
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 (For Clubs — Spans 1 Column on Desktop, Pakistan Green #01411C Surface with #FFFFFF text) */}
            <div
              id="for-clubs"
              className="lg:col-span-1 rounded-2xl border border-[#003014] bg-[#01411C] text-[#FFFFFF] p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-md transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#FFFFFF]/90">
                  <span className="font-semibold">02. For Clubs</span>
                  <span>B2B Club Manager</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#FFFFFF]">
                  Dedicated B2B Dashboard for Pricing & Peak-Hour Rules
                </h3>
                <p className="text-sm text-[#FFFFFF]/90 leading-relaxed">
                  Configure base vs. floodlit peak-hour PKR tariffs, manage
                  walk-in cash vs. online bookings on a Playtomic-grade matrix,
                  and customize your club&apos;s public facility branding.
                </p>
              </div>

              <div className="space-y-4 pt-2 border-t border-[#FFFFFF]/20">
                <div className="space-y-2 text-xs text-[#FFFFFF]/90">
                  <div className="flex items-center justify-between">
                    <span>Dynamic Peak Pricing</span>
                    <span className="font-mono font-semibold text-[#FFFFFF] tabular-nums">
                      17:00–23:30 PKT
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Generator & Floodlight Tags</span>
                    <span className="font-mono font-semibold text-[#FFFFFF]">
                      Included
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Role-Based Access Control</span>
                    <span className="font-mono font-semibold text-[#FFFFFF]">
                      Club & Super Admin
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigateToView('login')}
                  className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#228B4E] border-b-4 border-[#003014] px-4 py-2.5 font-display text-xs sm:text-sm font-bold text-[#FFFFFF] transition-all duration-200 ease-in-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] whitespace-nowrap"
                >
                  <span>Launch Partner Login</span>
                  <ArrowRight className="h-4 w-4 text-[#FFFFFF] transition-all duration-200 ease-in-out" />
                </button>
              </div>
            </div>

            {/* Feature 3 (Network — Spans Full 3 Columns on Desktop) */}
            <div
              id="network"
              className={`lg:col-span-3 rounded-2xl border p-6 sm:p-8 space-y-6 shadow-2xs transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg ${
                isDarkMode
                  ? 'border-[#228B4E]/25 bg-[#101A13] text-[#F5FFF7]'
                  : 'border-[#102117]/12 bg-[#FFFFFF] text-[#102117]'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[#228B4E]">
                    03. National Network · 4 Major Metropolitan Hubs
                  </p>
                  <h3 className="font-display text-xl sm:text-2xl font-bold">
                    Growing Community Across Islamabad, Rawalpindi, Lahore, and Karachi
                  </h3>
                </div>

                {/* Interactive City Filter Tabs */}
                <div
                  role="tablist"
                  aria-label="PakPadel City Network Filter"
                  className={`flex flex-wrap items-center gap-1.5 rounded-xl p-1.5 ${
                    isDarkMode ? 'bg-[#080F0A]' : 'bg-[#F7FAF8]'
                  }`}
                >
                  {CITY_NETWORK_DATA.map((item) => {
                    const active = selectedCity === item.city;
                    return (
                      <button
                        key={item.city}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setSelectedCity(item.city)}
                        className={`min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#228B4E] whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-[#01411C] text-[#FFFFFF] shadow-xs hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0'
                            : isDarkMode
                              ? 'text-[#F5FFF7]/75 hover:bg-[#18271C] hover:text-[#F5FFF7]'
                              : 'text-[#102117]/75 hover:bg-[#D6EFE0]/50 hover:text-[#102117]'
                        }`}
                      >
                        {item.city}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected City Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div
                  className={`md:col-span-2 rounded-xl border p-5 flex flex-col justify-between transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg ${
                    isDarkMode
                      ? 'border-[#228B4E]/20 bg-[#080F0A]'
                      : 'border-[#102117]/10 bg-[#F7FAF8]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#228B4E]">
                      <MapPin className="h-3.5 w-3.5 text-[#228B4E]" />
                      <span>{activeCityObj.city} Metropolitan Hub</span>
                    </div>
                    <h4 className="mt-1.5 font-display text-lg font-bold">
                      {activeCityObj.flagshipVenue}
                    </h4>
                    <p
                      className={`mt-2 text-xs sm:text-sm leading-relaxed ${
                        isDarkMode ? 'text-[#F5FFF7]/80' : 'text-[#102117]/75'
                      }`}
                    >
                      {activeCityObj.description}
                    </p>
                  </div>
                  <div
                    className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
                      isDarkMode
                        ? 'border-[#F5FFF7]/10'
                        : 'border-[#102117]/10'
                    }`}
                  >
                    <span
                      className={
                        isDarkMode ? 'text-[#F5FFF7]/70' : 'text-[#102117]/70'
                      }
                    >
                      Standard Rate Band
                    </span>
                    <span className="font-mono font-bold text-[#228B4E] tabular-nums">
                      {activeCityObj.avgRatePkr}
                    </span>
                  </div>
                </div>

                <div
                  className={`rounded-xl border p-5 flex flex-col justify-between transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg ${
                    isDarkMode
                      ? 'border-[#228B4E]/20 bg-[#080F0A]'
                      : 'border-[#102117]/10 bg-[#F7FAF8]'
                  }`}
                >
                  <span
                    className={`text-xs font-medium ${
                      isDarkMode ? 'text-[#F5FFF7]/75' : 'text-[#102117]/70'
                    }`}
                  >
                    Active Partner Venues
                  </span>
                  <p className="my-2 font-mono text-3xl font-bold text-[#228B4E] tabular-nums">
                    {activeCityObj.clubsCount} Clubs
                  </p>
                  <p
                    className={`text-xs ${
                      isDarkMode ? 'text-[#F5FFF7]/70' : 'text-[#102117]/70'
                    }`}
                  >
                    {activeCityObj.courtsCount} FIP-standard courts online
                  </p>
                </div>

                <div className="rounded-xl border border-[#003014] bg-[#01411C] text-[#FFFFFF] p-5 flex flex-col justify-between transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg">
                  <span className="text-xs font-semibold text-[#FFFFFF]/90">
                    Prime-Time Utilization
                  </span>
                  <p className="my-2 font-mono text-2xl sm:text-3xl font-bold text-[#FFFFFF] tabular-nums">
                    {activeCityObj.utilization}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateToView('login')}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 -ml-2 text-xs font-bold text-[#FFFFFF] transition-all duration-200 ease-in-out hover:bg-[#18271C] whitespace-nowrap"
                  >
                    <span>Partner Your {activeCityObj.city} Club</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#FFFFFF] transition-all duration-200 ease-in-out" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          </section>
        </PakPadelCommercialSections>
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: UNIFIED AUTHENTICATION PORTAL ('login')
  // ============================================================================
  if (activeView === 'login') {
    return (
      <div className="min-h-screen w-full overflow-x-hidden bg-[#080F0A] text-[#F5FFF7] flex flex-col justify-between p-4 sm:p-8 selection:bg-[#228B4E] selection:text-[#FFFFFF] transition-opacity duration-500">
        {/* Top Bar with Back to Landing button & Official Brand Logo */}
        <div className="mx-auto w-full max-w-[1200px] flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigateToView('landing')}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-[#228B4E]/35 bg-[#101A13] px-4 py-2 text-xs sm:text-sm font-semibold text-[#F5FFF7] transition-all duration-200 ease-in-out hover:bg-[#18271C] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#228B4E] whitespace-nowrap"
          >
            <ArrowLeft className="h-4 w-4 text-[#228B4E] transition-all duration-200 ease-in-out" />
            <span>Back to PakPadel Home</span>
          </button>

          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt="PakPadel"
              referrerPolicy="no-referrer"
              className="h-8 md:h-10 w-auto object-contain rounded-lg bg-[#FFFFFF] p-0.5 transition-all duration-200 ease-in-out"
            />
          </div>
        </div>

        {/* Center Authentication Card */}
        <div className="mx-auto my-8 w-full max-w-[980px] grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-[#228B4E]/30 bg-[#F7FAF8] text-[#102117] overflow-hidden shadow-2xl">
          {/* Left Column: Login Form (#F7FAF8 / #FFFFFF with #102117 text) */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-[#228B4E]">
                  Role-Based Partner Authentication
                </p>
                <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#102117]">
                  Sign in to PakPadel Manager
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-[#102117]/75">
                  Enter your club operator or platform super-admin credentials
                  to route directly to your authorized workspace.
                </p>
              </div>

              <form
                onSubmit={handleLoginSubmit}
                noValidate
                className="space-y-4"
              >
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="partner-login-email"
                    className="block text-xs font-bold text-[#102117] mb-1.5"
                  >
                    Partner Email Address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#228B4E]" />
                    <input
                      id="partner-login-email"
                      type="email"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setEmailError(null);
                        setFormError(null);
                      }}
                      placeholder="admin@clifton.pk or super@pakpadel.pk"
                      className={`min-h-[46px] w-full rounded-xl border bg-[#FFFFFF] pl-10 pr-4 py-2.5 text-sm text-[#102117] placeholder:text-[#102117]/40 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#228B4E]/30 ${
                        emailError
                          ? 'border-red-600 focus:border-red-600'
                          : 'border-[#102117]/20 focus:border-[#228B4E]'
                      }`}
                    />
                  </div>
                  {emailError && (
                    <p
                      role="alert"
                      className="mt-1.5 text-xs font-semibold text-red-700"
                    >
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="partner-login-password"
                    className="block text-xs font-bold text-[#102117] mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#228B4E]" />
                    <input
                      id="partner-login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setPasswordError(null);
                        setFormError(null);
                      }}
                      placeholder="Enter your password"
                      className={`min-h-[46px] w-full rounded-xl border bg-[#FFFFFF] pl-10 pr-11 py-2.5 text-sm text-[#102117] placeholder:text-[#102117]/40 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#228B4E]/30 ${
                        passwordError
                          ? 'border-red-600 focus:border-red-600'
                          : 'border-[#102117]/20 focus:border-[#228B4E]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide secret' : 'Show secret'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#102117]/60 transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50 hover:text-[#228B4E]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 transition-all duration-200 ease-in-out" />
                      ) : (
                        <Eye className="h-4 w-4 transition-all duration-200 ease-in-out" />
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <p
                      role="alert"
                      className="mt-1.5 text-xs font-semibold text-red-700"
                    >
                      {passwordError}
                    </p>
                  )}
                </div>

                {formError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800"
                  >
                    {formError}
                  </div>
                )}

                {/* 3D Tactile Primary Submit Button (bg-[#01411C] + border-[#003014] + #FFFFFF text) */}
                <button
                  type="submit"
                  className="min-h-[48px] w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#01411C] border-b-4 border-[#003014] px-6 py-3 font-display text-sm font-bold text-[#FFFFFF] transition-all duration-200 ease-in-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#228B4E] whitespace-nowrap"
                >
                  <span>Authenticate & Launch Workspace</span>
                  <ArrowRight className="h-4 w-4 text-[#FFFFFF] transition-all duration-200 ease-in-out" />
                </button>
              </form>
            </div>

            {/* Bottom Help Note */}
            <p className="mt-6 pt-4 border-t border-[#102117]/10 text-xs text-[#102117]/65">
              Protected by PakPadel Role-Based Routing Engine · Instant session
              switching enabled for demo evaluation.
            </p>
          </div>

          {/* Right Column: Role-Based Simulation Credentials Box (#101A13 dSurface1) */}
          <div className="lg:col-span-5 bg-[#101A13] text-[#F5FFF7] p-6 sm:p-8 flex flex-col justify-between space-y-6 border-l border-[#228B4E]/20">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#228B4E]">
                <ShieldCheck className="h-4 w-4 text-[#228B4E]" />
                <span>Role-Based Simulation Engine</span>
              </div>
              <h2 className="font-display text-lg font-bold text-[#F5FFF7]">
                Select a Demo Partner Account
              </h2>
              <p className="text-xs text-[#F5FFF7]/80 leading-relaxed">
                Click either credential preset below to populate the login form
                or sign in directly to test the role-based routing architecture:
              </p>

              <div className="space-y-3 pt-1">
                {/* Credential 1: Club Admin */}
                <div className="rounded-xl border border-[#228B4E]/30 bg-[#080F0A] p-4 space-y-2.5 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#228B4E]">
                      Credential 1 · Club Admin
                    </span>
                    <span className="font-mono text-[11px] text-[#F5FFF7]/70">
                      Karachi Clifton
                    </span>
                  </div>
                  <p className="font-mono text-xs font-bold text-[#F5FFF7]">
                    admin@clifton.pk
                  </p>
                  <p className="text-[11px] text-[#F5FFF7]/75">
                    Routes to Club Admin Dashboard (Manage Courts, Branding, and
                    Timings).
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleFillDemoCredential('clubAdmin')}
                      className="min-h-[36px] flex-1 rounded-lg border border-[#228B4E] bg-[#01411C] border-b-2 border-b-[#003014] px-3 py-1.5 text-xs font-bold text-[#FFFFFF] transition-all duration-200 ease-in-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                    >
                      Fill Form
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleFillDemoCredential('clubAdmin');
                        navigateToView('dashboard_club');
                      }}
                      className="min-h-[36px] flex-1 rounded-lg bg-[#228B4E] border-b-2 border-b-[#003014] px-3 py-1.5 text-xs font-bold text-[#FFFFFF] transition-all duration-200 ease-in-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                    >
                      Instant Login
                    </button>
                  </div>
                </div>

                {/* Credential 2: Super Admin */}
                <div className="rounded-xl border border-[#228B4E]/30 bg-[#080F0A] p-4 space-y-2.5 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#228B4E]">
                      Credential 2 · Super Admin
                    </span>
                    <span className="font-mono text-[11px] text-[#F5FFF7]/70">
                      Global HQ
                    </span>
                  </div>
                  <p className="font-mono text-xs font-bold text-[#F5FFF7]">
                    super@pakpadel.pk
                  </p>
                  <p className="text-[11px] text-[#F5FFF7]/75">
                    Routes to Super Admin Dashboard (Global Platform Settings,
                    Onboard Clubs & Commission Reports).
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleFillDemoCredential('superAdmin')}
                      className="min-h-[36px] flex-1 rounded-lg border border-[#228B4E] bg-[#01411C] border-b-2 border-b-[#003014] px-3 py-1.5 text-xs font-bold text-[#FFFFFF] transition-all duration-200 ease-in-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                    >
                      Fill Form
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleFillDemoCredential('superAdmin');
                        navigateToView('dashboard_super');
                      }}
                      className="min-h-[36px] flex-1 rounded-lg bg-[#228B4E] border-b-2 border-b-[#003014] px-3 py-1.5 text-xs font-bold text-[#FFFFFF] transition-all duration-200 ease-in-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                    >
                      Instant Login
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#F5FFF7]/65">
              Any password (4+ characters) is accepted for the two demo emails.
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1200px] text-center text-xs text-[#F5FFF7]/65">
          PakPadel Unified Authentication · Pakistan Green Design System
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 3: CLUB ADMIN DASHBOARD ('dashboard_club' -> admin@clifton.pk)
  // ============================================================================
  if (activeView === 'dashboard_club') {
    return (
      <div className="min-h-screen w-full overflow-x-hidden bg-[#F7FAF8] text-[#102117] transition-opacity duration-500">
        {/* Club Admin Top Navigation Bar — Pakistan Green (#01411C) with #FFFFFF text */}
        <header
          ref={clubProfilePopoverRef}
          className="sticky top-0 z-40 border-b border-[#003014] bg-[#01411C] text-[#FFFFFF]"
        >
          {/* Mobile (< sm): Compact single-line horizontal bar (h-12 flex items-center justify-between px-3) */}
          <div className="h-12 flex sm:hidden items-center justify-between px-3 gap-2">
            {/* Left side: Logo icon + concise truncated label with tooltip */}
            <div
              className="flex items-center gap-2 min-w-0"
              title="Karachi Clifton Courts · Authenticated: admin@clifton.pk · Club Admin Role"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt="PakPadel"
                referrerPolicy="no-referrer"
                className="h-7 w-auto object-contain rounded-md bg-[#FFFFFF] p-0.5 shrink-0"
              />
              <span className="font-display text-xs font-bold text-[#FFFFFF] truncate">
                Clifton Admin
              </span>
            </div>

            {/* Right side: Compact icon buttons + sleek mobile dropdown menu (occupies <= 44px height) */}
            <div className="flex items-center gap-1.5 shrink-0 relative">
              <button
                type="button"
                onClick={() => setShowFullClubScheduler((prev) => !prev)}
                className="h-8 rounded-lg border border-[#FFFFFF]/25 bg-[#003014] px-2.5 text-[11px] font-bold text-[#FFFFFF] whitespace-nowrap"
              >
                {showFullClubScheduler ? 'Summary' : 'Scheduler'}
              </button>

              <button
                type="button"
                onClick={() => navigateToView('login')}
                title="Switch Role / Sign Out"
                aria-label="Switch Role / Sign Out"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#228B4E] text-[#FFFFFF]"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setClubProfilePopoverOpen((prev) => !prev)}
                aria-expanded={clubProfilePopoverOpen}
                aria-haspopup="menu"
                aria-label="Account & Navigation Menu"
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#FFFFFF]/25 bg-[#003014]/80 px-2 text-[11px] font-bold text-[#FFFFFF]"
              >
                <UserCheck className="h-3.5 w-3.5 text-[#228B4E]" />
                <span>Account</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform duration-200 ${
                    clubProfilePopoverOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Desktop (>= sm): Full horizontal layout */}
          <div className="hidden sm:flex mx-auto max-w-[1360px] flex-wrap items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt="PakPadel"
                referrerPolicy="no-referrer"
                className="h-8 md:h-10 w-auto object-contain rounded-lg bg-[#FFFFFF] p-0.5 transition-all duration-200 ease-in-out"
              />
              <div>
                <span className="block font-display text-base font-bold text-[#FFFFFF]">
                  Karachi Clifton Courts
                </span>
                <span className="block font-mono text-[11px] text-[#FFFFFF]/85">
                  Authenticated: admin@clifton.pk · Club Admin Role
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowFullClubScheduler((prev) => !prev)}
                className="min-h-[40px] rounded-xl border border-[#FFFFFF]/30 bg-[#003014] px-3.5 py-2 text-xs font-bold text-[#FFFFFF] transition-all duration-200 ease-in-out hover:bg-[#228B4E] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
              >
                {showFullClubScheduler
                  ? 'Back to Clifton Summary View'
                  : 'Open Full Booking Matrix & Scheduler'}
              </button>

              <button
                type="button"
                onClick={() => setClubProfilePopoverOpen((prev) => !prev)}
                aria-expanded={clubProfilePopoverOpen}
                aria-haspopup="menu"
                className="min-h-[40px] inline-flex items-center gap-2 rounded-xl border border-[#FFFFFF]/25 bg-[#003014]/70 px-3.5 py-2 text-xs font-bold text-[#FFFFFF] transition-all duration-200 ease-in-out hover:bg-[#18271C] whitespace-nowrap"
              >
                <UserCheck className="h-3.5 w-3.5 text-[#228B4E]" />
                <span>Clifton Account</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-all duration-200 ease-in-out ${
                    clubProfilePopoverOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => navigateToView('login')}
                className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-[#228B4E] border-b-4 border-[#003014] px-4 py-2 text-xs font-bold text-[#FFFFFF] transition-all duration-200 ease-in-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
              >
                <LogOut className="h-3.5 w-3.5 text-[#FFFFFF]" />
                <span>Switch Role / Sign Out</span>
              </button>
              <button
                type="button"
                onClick={() => navigateToView('landing')}
                className="min-h-[40px] rounded-xl border border-[#FFFFFF]/25 px-3.5 py-2 text-xs font-semibold text-[#FFFFFF] transition-all duration-200 ease-in-out hover:bg-[#18271C] whitespace-nowrap"
              >
                Landing Page
              </button>
            </div>
          </div>

          {/* Shared Mobile & Desktop Account Popover Menu */}
          {clubProfilePopoverOpen && (
            <div className="mx-auto max-w-[1360px] relative px-3 sm:px-8">
              <div
                role="menu"
                className="absolute right-3 sm:right-8 mt-1.5 w-64 rounded-2xl border border-[#102117]/15 bg-[#FFFFFF] p-2 text-[#102117] shadow-2xl z-50 space-y-1 transition-all duration-200 ease-in-out"
              >
                <div className="px-3 py-2 border-b border-[#102117]/10">
                  <p className="font-display text-xs font-bold text-[#102117]">
                    Karachi Clifton Courts
                  </p>
                  <p className="font-mono text-[11px] text-[#228B4E]">
                    admin@clifton.pk
                  </p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setShowFullClubScheduler(false);
                    setClubProfilePopoverOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#102117] transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50"
                >
                  <span>Clifton Courts &amp; Branding</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setShowFullClubScheduler(true);
                    setClubProfilePopoverOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#102117] transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50"
                >
                  <span>Playtomic Booking Matrix</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => navigateToView('dashboard_super')}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#01411C] transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50"
                >
                  <span>Switch to Super Admin HQ</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#228B4E]" />
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => navigateToView('landing')}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#102117] transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50"
                >
                  <span>Landing Page</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => navigateToView('login')}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-700 transition-all duration-200 ease-in-out hover:bg-red-50"
                >
                  <span>Switch Role / Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </header>

        {showFullClubScheduler ? (
          <PakPadelDashboard />
        ) : (
          <main className="mx-auto max-w-[1360px] px-4 py-6 sm:px-8 sm:py-8 space-y-6 sm:space-y-8">
            {/* Required Welcome Banner (#01411C with #FFFFFF text) */}
            <div className="rounded-2xl border border-[#003014] bg-[#01411C] text-[#FFFFFF] p-5 sm:p-8 shadow-lg transition-all duration-200 ease-in-out">
              <p className="text-xs font-semibold text-[#FFFFFF]/85">
                Club Admin Portal · Clifton Block 4, Karachi
              </p>
              <h1 className="mt-1 font-display text-xl sm:text-3xl font-bold tracking-tight text-[#FFFFFF]">
                Welcome Karachi Clifton Courts Manager - Manage Courts, Branding, and Timings
              </h1>
              <p className="mt-2 max-w-3xl text-xs sm:text-sm text-[#FFFFFF]/90">
                Real-time control over your 4 Clifton panoramic courts, base and
                floodlit peak-hour PKR pricing, and public club profile on the
                PakPadel player app.
              </p>
            </div>

            {/* 4 Top KPI Metric Cards — Pakistan Green Gradient & Glassmorphic Icon Boxes */}
            <section
              aria-label="Club operational metrics"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5"
            >
              {/* KPI Card 1: Active Club Members */}
              <div className="relative overflow-hidden rounded-2xl border border-[#228B4E]/30 hover:border-[#228B4E] bg-gradient-to-br from-[#01411C] to-[#002b12] p-5 shadow-lg shadow-[#01411C]/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#D6EFE0]/80">
                      Active Club Members · Karachi
                    </p>
                    <p className="font-mono text-3xl font-black text-white tracking-tight tabular-nums">
                      3.2K+
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-md text-[#228B4E] shadow-inner">
                    <Users className="h-5 w-5 text-[#228B4E]" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[#D6EFE0]">
                    <span className="font-bold text-white">240+ matches</span> monthly
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#228B4E]/45 bg-[#228B4E]/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#228B4E] animate-pulse" />
                    +12% vs last mo
                  </span>
                </div>
              </div>

              {/* KPI Card 2: Configured Padel Courts */}
              <div className="relative overflow-hidden rounded-2xl border border-[#228B4E]/30 hover:border-[#228B4E] bg-gradient-to-br from-[#01411C] to-[#002b12] p-5 shadow-lg shadow-[#01411C]/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#D6EFE0]/80">
                      Configured Padel Courts
                    </p>
                    <p className="font-mono text-3xl font-black text-white tracking-tight tabular-nums">
                      {cliftonCourts.filter((c) => c.status === 'Active').length} /{' '}
                      {cliftonCourts.length}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-md text-[#228B4E] shadow-inner">
                    <Grid className="h-5 w-5 text-[#228B4E]" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[#D6EFE0]">
                    <span className="font-bold text-white">
                      {cliftonCourts.filter((c) => c.environment === 'Indoor').length} Indoor
                    </span>{' '}
                    ·{' '}
                    <span className="font-bold text-white">
                      {cliftonCourts.filter((c) => c.environment === 'Outdoor').length} Outdoor
                    </span>
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#228B4E]/45 bg-[#228B4E]/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#228B4E] animate-pulse" />
                    FIP Live
                  </span>
                </div>
              </div>

              {/* KPI Card 3: Average Court Utilization */}
              <div className="relative overflow-hidden rounded-2xl border border-[#228B4E]/30 hover:border-[#228B4E] bg-gradient-to-br from-[#01411C] to-[#002b12] p-5 shadow-lg shadow-[#01411C]/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#D6EFE0]/80">
                      Average Court Utilization
                    </p>
                    <p className="font-mono text-3xl font-black text-white tracking-tight tabular-nums">
                      94%
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-md text-[#228B4E] shadow-inner">
                    <TrendingUp className="h-5 w-5 text-[#228B4E]" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[#D6EFE0]">
                    <span className="font-bold text-white">99%</span> member rating
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#228B4E]/45 bg-[#228B4E]/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">
                    +8.4% vs last mo
                  </span>
                </div>
              </div>

              {/* KPI Card 4: Est. Daily Court Revenue (Primary Business Anchor with Brighter Emerald Border Accent) */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-[#228B4E]/80 hover:border-[#228B4E] ring-1 ring-[#228B4E]/30 bg-gradient-to-br from-[#01411C] to-[#002b12] p-5 shadow-lg shadow-[#01411C]/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#228B4E]/20 blur-xl"
                />
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#D6EFE0]/80">
                      Est. Daily Court Revenue
                    </p>
                    <p className="font-mono text-3xl font-black text-white tracking-tight tabular-nums">
                      <span className="font-black text-[#228B4E]">PKR</span>{' '}
                      <span className="text-[#FFFFFF]">
                        {cliftonCourts
                          .filter((c) => c.status === 'Active')
                          .reduce(
                            (sum, c) =>
                              sum + c.baseRatePkr * 4 + c.peakRatePkr * 5,
                            0
                          )
                          .toLocaleString('en-PK')}
                      </span>
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#228B4E]/60 bg-white/15 backdrop-blur-md text-[#228B4E] shadow-inner">
                    <Wallet className="h-5 w-5 text-[#228B4E]" />
                  </div>
                </div>

                <div className="relative z-10 mt-4 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
                  <p className="font-mono text-xs font-semibold text-[#D6EFE0] tabular-nums">
                    Avg Peak:{' '}
                    <span className="font-bold text-[#228B4E]">PKR</span>{' '}
                    <span className="font-bold text-white">
                      {Math.round(
                        cliftonCourts.reduce((s, c) => s + c.peakRatePkr, 0) /
                          Math.max(1, cliftonCourts.length)
                      ).toLocaleString('en-PK')}
                      /hr
                    </span>
                  </p>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#228B4E] bg-[#228B4E]/30 px-2.5 py-0.5 font-mono text-[10px] font-bold text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#228B4E] animate-pulse" />
                    Raast Verified
                  </span>
                </div>
              </div>
            </section>

            {/* Grid: Manage Courts (Left 7 cols) + Manage Branding & Timings (Right 5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Clifton Courts Management */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-[#102117]">
                    01. Clifton Configured Courts ({cliftonCourts.length})
                  </h2>
                  <span className="font-mono text-xs text-[#228B4E] font-semibold tabular-nums">
                    {cliftonCourts.filter((c) => c.status === 'Active').length}/
                    {cliftonCourts.length} Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cliftonCourts.map((court) => (
                    <div
                      key={court.id}
                      className="rounded-2xl border border-[#102117]/12 bg-[#FFFFFF] p-5 flex flex-col justify-between space-y-4 shadow-2xs transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-[#102117]/65">
                          <span>
                            {court.environment} · {court.surface}
                          </span>
                          <span
                            className={`font-semibold ${
                              court.status === 'Active'
                                ? 'text-[#228B4E]'
                                : 'text-amber-700'
                            }`}
                          >
                            {court.status}
                          </span>
                        </div>
                        <h3 className="mt-1 font-display text-base font-bold text-[#102117]">
                          {court.name}
                        </h3>
                        <div className="mt-3 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[#102117]/70">Base Rate</span>
                            <span className="font-mono font-bold text-[#102117] tabular-nums">
                              {formatPkr(court.baseRatePkr)}/hr
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#102117]/70">
                              Peak Floodlit Rate
                            </span>
                            <span className="font-mono font-bold text-[#228B4E] tabular-nums">
                              {formatPkr(court.peakRatePkr)}/hr
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#102117]/10 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleAdjustCliftonCourtRate(court.id, -500)
                            }
                            className="min-h-[34px] rounded-lg border border-[#102117]/20 px-2.5 py-1 font-mono text-xs font-bold text-[#102117] transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50"
                          >
                            -500
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleAdjustCliftonCourtRate(court.id, 500)
                            }
                            className="min-h-[34px] rounded-lg border border-[#102117]/20 px-2.5 py-1 font-mono text-xs font-bold text-[#102117] transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50"
                          >
                            +500
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleCliftonCourtStatus(court.id)
                          }
                          className={`min-h-[34px] rounded-lg px-3 py-1 text-xs font-bold transition-all duration-200 ease-in-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap ${
                            court.status === 'Active'
                              ? 'bg-[#01411C] border-b-2 border-[#003014] text-[#FFFFFF]'
                              : 'bg-[#228B4E] border-b-2 border-[#003014] text-[#FFFFFF]'
                          }`}
                        >
                          {court.status === 'Active'
                            ? 'Set Maintenance'
                            : 'Activate Court'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clifton Branding & Timings Form */}
              <div className="lg:col-span-5">
                <form
                  onSubmit={handleSaveCliftonBranding}
                  className="rounded-2xl border border-[#102117]/12 bg-[#FFFFFF] p-6 space-y-5 shadow-2xs transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg"
                >
                  <div>
                    <h2 className="font-display text-lg font-bold text-[#102117]">
                      02. Club Branding & Operating Timings
                    </h2>
                    <p className="mt-1 text-xs text-[#102117]/70">
                      Changes sync immediately to the Karachi Clifton Courts
                      page on the PakPadel mobile app.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="clifton-tagline"
                      className="block text-xs font-bold text-[#102117] mb-1.5"
                    >
                      Public Venue Headline / Branding Tagline
                    </label>
                    <input
                      id="clifton-tagline"
                      type="text"
                      value={cliftonTagline}
                      onChange={(e) => setCliftonTagline(e.target.value)}
                      className="min-h-[42px] w-full rounded-xl border border-[#102117]/20 bg-[#F7FAF8] px-3.5 py-2 text-sm text-[#102117] transition-all duration-200 ease-in-out focus:border-[#228B4E] focus:outline-none focus:ring-2 focus:ring-[#228B4E]/30"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label
                        htmlFor="clifton-open"
                        className="block text-xs font-bold text-[#102117] mb-1"
                      >
                        Opens At
                      </label>
                      <input
                        id="clifton-open"
                        type="time"
                        value={cliftonOpeningTime}
                        onChange={(e) => setCliftonOpeningTime(e.target.value)}
                        className="min-h-[42px] w-full rounded-xl border border-[#102117]/20 bg-[#F7FAF8] px-2.5 py-1.5 font-mono text-xs text-[#102117] transition-all duration-200 ease-in-out focus:border-[#228B4E] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="clifton-close"
                        className="block text-xs font-bold text-[#102117] mb-1"
                      >
                        Closes At
                      </label>
                      <input
                        id="clifton-close"
                        type="time"
                        value={cliftonClosingTime}
                        onChange={(e) => setCliftonClosingTime(e.target.value)}
                        className="min-h-[42px] w-full rounded-xl border border-[#102117]/20 bg-[#F7FAF8] px-2.5 py-1.5 font-mono text-xs text-[#102117] transition-all duration-200 ease-in-out focus:border-[#228B4E] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="clifton-peak"
                        className="block text-xs font-bold text-[#102117] mb-1"
                      >
                        Peak Starts
                      </label>
                      <input
                        id="clifton-peak"
                        type="time"
                        value={cliftonPeakStart}
                        onChange={(e) => setCliftonPeakStart(e.target.value)}
                        className="min-h-[42px] w-full rounded-xl border border-[#102117]/20 bg-[#F7FAF8] px-2.5 py-1.5 font-mono text-xs text-[#102117] transition-all duration-200 ease-in-out focus:border-[#228B4E] focus:outline-none"
                      />
                    </div>
                  </div>

                  {cliftonBrandingSaved && (
                    <div
                      role="status"
                      className="rounded-xl border border-[#228B4E]/40 bg-[#F7FAF8] px-3.5 py-2.5 text-xs font-semibold text-[#01411C]"
                    >
                      {cliftonBrandingSaved}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="min-h-[44px] w-full rounded-xl bg-[#01411C] border-b-4 border-[#003014] px-5 py-2.5 font-display text-xs sm:text-sm font-bold text-[#FFFFFF] transition-all duration-200 ease-in-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#228B4E]"
                  >
                    Save Branding & Timings
                  </button>
                </form>
              </div>
            </div>
          </main>
        )}
      </div>
    );
  }

  // ============================================================================
  // VIEW 4: SUPER ADMIN DASHBOARD ('dashboard_super' -> super@pakpadel.pk)
  // ============================================================================
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F7FAF8] text-[#102117] transition-opacity duration-500">
      {/* Super Admin Top Navigation Bar — Pakistan Green (#01411C) with #FFFFFF text */}
      <header
        ref={superProfilePopoverRef}
        className="sticky top-0 z-40 border-b border-[#003014] bg-[#01411C] text-[#FFFFFF]"
      >
        {/* Mobile (< sm): Compact single-line horizontal bar (h-12 flex items-center justify-between px-3) */}
        <div className="h-12 flex sm:hidden items-center justify-between px-3 gap-2">
          <div
            className="flex items-center gap-2 min-w-0"
            title="PakPadel Super Admin Control Center · Authenticated: super@pakpadel.pk"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt="PakPadel"
              referrerPolicy="no-referrer"
              className="h-7 w-auto object-contain rounded-md bg-[#FFFFFF] p-0.5 shrink-0"
            />
            <span className="font-display text-xs font-bold text-[#FFFFFF] truncate">
              Super Admin HQ
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 relative">
            <button
              type="button"
              onClick={() => navigateToView('landing')}
              className="h-8 rounded-lg border border-[#FFFFFF]/25 bg-[#003014] px-2.5 text-[11px] font-semibold text-[#FFFFFF] whitespace-nowrap"
            >
              Landing
            </button>
            <button
              type="button"
              onClick={() => navigateToView('login')}
              title="Switch Role / Sign Out"
              aria-label="Switch Role / Sign Out"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#228B4E] text-[#FFFFFF]"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setSuperProfilePopoverOpen((prev) => !prev)}
              aria-expanded={superProfilePopoverOpen}
              aria-haspopup="menu"
              aria-label="Super Admin Account Menu"
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#FFFFFF]/25 bg-[#003014]/80 px-2 text-[11px] font-bold text-[#FFFFFF]"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#228B4E]" />
              <span>Account</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${
                  superProfilePopoverOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Desktop (>= sm): Full horizontal layout */}
        <div className="hidden sm:flex mx-auto max-w-[1360px] flex-wrap items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt="PakPadel"
              referrerPolicy="no-referrer"
              className="h-8 md:h-10 w-auto object-contain rounded-lg bg-[#FFFFFF] p-0.5 transition-all duration-200 ease-in-out"
            />
            <div>
              <span className="block font-display text-base font-bold text-[#FFFFFF]">
                PakPadel Super Admin Control Center
              </span>
              <span className="block font-mono text-[11px] text-[#FFFFFF]/85">
                Authenticated: super@pakpadel.pk · Global Super Admin
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSuperProfilePopoverOpen((prev) => !prev)}
              aria-expanded={superProfilePopoverOpen}
              aria-haspopup="menu"
              className="min-h-[40px] inline-flex items-center gap-2 rounded-xl border border-[#FFFFFF]/25 bg-[#003014]/70 px-3.5 py-2 text-xs font-bold text-[#FFFFFF] transition-all duration-200 ease-in-out hover:bg-[#18271C] whitespace-nowrap"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#228B4E]" />
              <span>Super Admin HQ</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-all duration-200 ease-in-out ${
                  superProfilePopoverOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => navigateToView('login')}
              className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl bg-[#228B4E] border-b-4 border-[#003014] px-4 py-2 text-xs font-bold text-[#FFFFFF] transition-all duration-200 ease-in-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            >
              <LogOut className="h-3.5 w-3.5 text-[#FFFFFF]" />
              <span>Switch Role / Sign Out</span>
            </button>
            <button
              type="button"
              onClick={() => navigateToView('landing')}
              className="min-h-[40px] rounded-xl border border-[#FFFFFF]/25 px-3.5 py-2 text-xs font-semibold text-[#FFFFFF] transition-all duration-200 ease-in-out hover:bg-[#18271C] whitespace-nowrap"
            >
              Landing Page
            </button>
          </div>
        </div>

        {/* Shared Mobile & Desktop Super Admin Popover */}
        {superProfilePopoverOpen && (
          <div className="mx-auto max-w-[1360px] relative px-3 sm:px-8">
            <div
              role="menu"
              className="absolute right-3 sm:right-8 mt-1.5 w-64 rounded-2xl border border-[#102117]/15 bg-[#FFFFFF] p-2 text-[#102117] shadow-2xl z-50 space-y-1 transition-all duration-200 ease-in-out"
            >
              <div className="px-3 py-2 border-b border-[#102117]/10">
                <p className="font-display text-xs font-bold text-[#102117]">
                  PakPadel Global Governance
                </p>
                <p className="font-mono text-[11px] text-[#228B4E]">
                  super@pakpadel.pk
                </p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => navigateToView('dashboard_club')}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#01411C] transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50"
              >
                <span>Switch to Clifton Club Admin</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#228B4E]" />
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => navigateToView('landing')}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#102117] transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50"
              >
                <span>Public Marketing Page</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => navigateToView('login')}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-700 transition-all duration-200 ease-in-out hover:bg-red-50"
              >
                <span>Switch Role / Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-[1360px] px-4 py-6 sm:px-8 sm:py-8 space-y-6 sm:space-y-8">
        {/* Required Super Admin Welcome Banner (#01411C with #FFFFFF text) */}
        <div className="rounded-2xl border border-[#003014] bg-[#01411C] text-[#FFFFFF] p-6 sm:p-8 shadow-lg">
          <p className="text-xs font-semibold text-[#FFFFFF]/85">
            Global Platform Governance · Islamabad, Rawalpindi, Lahore & Karachi
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FFFFFF]">
            Welcome Super Admin - Manage Global Platform Settings, Onboard New Clubs, and View Commission Reports
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-[#FFFFFF]/90">
            Monitor nationwide gross booking volume, adjust platform commission
            tiers, and onboard new partner padel clubs across Pakistan.
          </p>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#102117]/12 bg-[#FFFFFF] p-5 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg">
            <span className="text-xs font-medium text-[#102117]/70">
              Onboarded Partner Clubs
            </span>
            <p className="mt-1 font-mono text-2xl font-bold text-[#102117] tabular-nums">
              {commissionSummary.activeClubsCount} Active Venues
            </p>
            <p className="mt-1 text-xs text-[#228B4E] font-medium">
              {commissionSummary.totalCourts} total panoramic courts
            </p>
          </div>

          <div className="rounded-2xl border border-[#102117]/12 bg-[#FFFFFF] p-5 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg">
            <span className="text-xs font-medium text-[#102117]/70">
              Monthly Gross Booking Volume
            </span>
            <p className="mt-1 font-mono text-2xl font-bold text-[#102117] tabular-nums">
              {formatPkr(commissionSummary.totalGrossPkr)}
            </p>
            <p className="mt-1 text-xs text-[#102117]/65">
              Across 4 metropolitan cities
            </p>
          </div>

          <div className="rounded-2xl border border-[#102117]/12 bg-[#FFFFFF] p-5 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg">
            <span className="text-xs font-medium text-[#102117]/70">
              Global Commission Rate
            </span>
            <p className="mt-1 font-mono text-2xl font-bold text-[#228B4E] tabular-nums">
              {globalCommissionRate}% Platform Fee
            </p>
            <p className="mt-1 text-xs text-[#102117]/65">
              Raast split-checkout enabled
            </p>
          </div>

          <div className="rounded-2xl border border-[#003014] bg-[#01411C] text-[#FFFFFF] p-5 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg">
            <span className="text-xs font-medium text-[#FFFFFF]/85">
              Net Platform Commission (30d)
            </span>
            <p className="mt-1 font-mono text-2xl font-bold text-[#FFFFFF] tabular-nums">
              {formatPkr(commissionSummary.totalCommissionPkr)}
            </p>
            <p className="mt-1 text-xs text-[#FFFFFF]/80">
              Auto-settled to PakPadel Treasury
            </p>
          </div>
        </div>

        {superAdminBanner && (
          <div
            role="status"
            className="rounded-xl border border-[#228B4E]/40 bg-[#FFFFFF] px-4 py-3 text-xs font-semibold text-[#01411C]"
          >
            {superAdminBanner}
          </div>
        )}

        {/* Two-Column Controls: Global Platform Settings + Onboard New Club */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Global Platform Settings */}
          <div className="lg:col-span-5 rounded-2xl border border-[#102117]/12 bg-[#FFFFFF] p-6 space-y-5 shadow-2xs transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg">
            <div>
              <h2 className="font-display text-lg font-bold text-[#102117]">
                01. Global Platform Settings
              </h2>
              <p className="mt-1 text-xs text-[#102117]/70">
                Configure platform-wide commission percentages and settlement
                rules.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#102117] mb-2">
                <label htmlFor="global-commission-slider">
                  Platform Commission Tier (%)
                </label>
                <span className="font-mono text-sm text-[#228B4E] tabular-nums">
                  {globalCommissionRate}%
                </span>
              </div>
              <input
                id="global-commission-slider"
                type="range"
                min={5}
                max={15}
                step={1}
                value={globalCommissionRate}
                onChange={(e) =>
                  setGlobalCommissionRate(Number(e.target.value))
                }
                className="w-full accent-[#01411C] cursor-pointer"
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-[#102117]/10 text-xs">
              <label className="flex items-center justify-between gap-3 cursor-pointer rounded-lg p-1.5 -mx-1.5 transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50">
                <span className="font-semibold text-[#102117]">
                  Instant Raast / IBFT Partner Payouts
                </span>
                <input
                  type="checkbox"
                  checked={instantRaastSettlement}
                  onChange={(e) => setInstantRaastSettlement(e.target.checked)}
                  className="h-4 w-4 accent-[#01411C]"
                />
              </label>

              <label className="flex items-center justify-between gap-3 cursor-pointer rounded-lg p-1.5 -mx-1.5 transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50">
                <span className="font-semibold text-[#102117]">
                  Automated FIP Court Verification on Onboarding
                </span>
                <input
                  type="checkbox"
                  checked={autoOnboardingVerification}
                  onChange={(e) =>
                    setAutoOnboardingVerification(e.target.checked)
                  }
                  className="h-4 w-4 accent-[#01411C]"
                />
              </label>
            </div>
          </div>

          {/* Onboard New Club Form */}
          <div className="lg:col-span-7 rounded-2xl border border-[#102117]/12 bg-[#FFFFFF] p-6 space-y-5 shadow-2xs transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg">
            <div>
              <h2 className="font-display text-lg font-bold text-[#102117]">
                02. Onboard New Partner Club
              </h2>
              <p className="mt-1 text-xs text-[#102117]/70">
                Add a new padel facility to the national directory and
                commission ledger.
              </p>
            </div>

            <form
              onSubmit={handleOnboardNewClub}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="sm:col-span-2">
                <label
                  htmlFor="new-club-name"
                  className="block text-xs font-bold text-[#102117] mb-1"
                >
                  Club Facility Name
                </label>
                <input
                  id="new-club-name"
                  type="text"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  placeholder="e.g., DHA Phase 6 Creek Padel Club"
                  className="min-h-[42px] w-full rounded-xl border border-[#102117]/20 bg-[#F7FAF8] px-3.5 py-2 text-sm text-[#102117] transition-all duration-200 ease-in-out focus:border-[#228B4E] focus:outline-none focus:ring-2 focus:ring-[#228B4E]/30"
                />
              </div>

              {/* Interactive City Hub Selector with Click Outside to Close */}
              <div ref={onboardCityDropdownRef} className="relative">
                <label
                  id="new-club-city-label"
                  className="block text-xs font-bold text-[#102117] mb-1"
                >
                  City Hub
                </label>
                <button
                  type="button"
                  aria-labelledby="new-club-city-label"
                  aria-expanded={onboardCityDropdownOpen}
                  aria-haspopup="listbox"
                  onClick={() => setOnboardCityDropdownOpen((prev) => !prev)}
                  className="min-h-[42px] w-full flex items-center justify-between rounded-xl border border-[#102117]/20 bg-[#F7FAF8] px-3.5 py-2 text-sm font-semibold text-[#102117] transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50 focus:border-[#228B4E] focus:outline-none"
                >
                  <span>{newClubCity}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#102117]/60 transition-all duration-200 ease-in-out ${
                      onboardCityDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {onboardCityDropdownOpen && (
                  <div
                    role="listbox"
                    aria-labelledby="new-club-city-label"
                    className="absolute left-0 right-0 mt-1.5 rounded-xl border border-[#102117]/15 bg-[#FFFFFF] p-1.5 shadow-xl z-40 space-y-0.5"
                  >
                    {(
                      ['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi'] as const
                    ).map((cityOption) => {
                      const active = newClubCity === cityOption;
                      return (
                        <button
                          key={cityOption}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => {
                            setNewClubCity(cityOption);
                            setOnboardCityDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition-all duration-200 ease-in-out ${
                            active
                              ? 'bg-[#01411C] text-[#FFFFFF]'
                              : 'text-[#102117] hover:bg-[#D6EFE0]/50'
                          }`}
                        >
                          <span>{cityOption}</span>
                          {active && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#228B4E]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="new-club-courts"
                  className="block text-xs font-bold text-[#102117] mb-1"
                >
                  Configured Courts Count
                </label>
                <input
                  id="new-club-courts"
                  type="number"
                  min={1}
                  max={20}
                  value={newClubCourts}
                  onChange={(e) => setNewClubCourts(e.target.value)}
                  className="min-h-[42px] w-full rounded-xl border border-[#102117]/20 bg-[#F7FAF8] px-3.5 py-2 font-mono text-sm text-[#102117] transition-all duration-200 ease-in-out focus:border-[#228B4E] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex items-end justify-end pt-1">
                <button
                  type="submit"
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#01411C] border-b-4 border-[#003014] px-5 py-2.5 font-display text-xs sm:text-sm font-bold text-[#FFFFFF] transition-all duration-200 ease-in-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#228B4E]"
                >
                  <Plus className="h-4 w-4 text-[#FFFFFF] transition-all duration-200 ease-in-out" />
                  <span>Onboard Club to Network</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Commission Reports Table */}
        <div className="rounded-2xl border border-[#102117]/12 bg-[#FFFFFF] overflow-hidden shadow-2xs transition-all duration-200 ease-in-out hover:shadow-md">
          <div className="px-6 py-5 border-b border-[#102117]/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold text-[#102117]">
                03. Partner Club Commission Reports
              </h2>
              <p className="text-xs text-[#102117]/70">
                Monthly gross court revenue and platform commission breakdown at{' '}
                {globalCommissionRate}% fee rate.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-[#01411C] tabular-nums">
              Total Commission: {formatPkr(commissionSummary.totalCommissionPkr)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#102117]/10 bg-[#F7FAF8] text-[#102117]/75 text-xs">
                  <th className="py-3.5 px-6 font-bold">Partner Club</th>
                  <th className="py-3.5 px-4 font-bold">City</th>
                  <th className="py-3.5 px-4 font-bold text-right">Courts</th>
                  <th className="py-3.5 px-4 font-bold text-right">
                    Monthly Gross (PKR)
                  </th>
                  <th className="py-3.5 px-4 font-bold text-right">
                    Commission ({globalCommissionRate}%)
                  </th>
                  <th className="py-3.5 px-6 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#102117]/10">
                {partnerClubs.map((club) => {
                  const commissionPkr = Math.round(
                    (club.monthlyGrossPkr * globalCommissionRate) / 100
                  );
                  return (
                    <tr
                      key={club.id}
                      className="transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50"
                    >
                      <td className="py-3.5 px-6 font-display font-bold text-[#102117]">
                        {club.name}
                      </td>
                      <td className="py-3.5 px-4 text-[#102117]/80">
                        {club.city}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        {club.courtsCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold tabular-nums">
                        {formatPkr(club.monthlyGrossPkr)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#228B4E] tabular-nums">
                        {formatPkr(commissionPkr)}
                      </td>
                      <td className="py-3.5 px-6 text-right font-semibold text-[#01411C]">
                        {club.status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
