'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Trophy,
  Grid,
  Tag,
  Settings,
  Plus,
  Bell,
  ChevronDown,
  CheckCircle2,
  PauseCircle,
  Building2,
  Layers,
  UserCheck,
  Menu,
  X,
} from 'lucide-react';
import {
  INITIAL_CLUBS,
  ClubBranch,
  Court,
  calculateClubMetrics,
  formatPkr,
} from '@/lib/club-logic';
import { ClubProfileTab } from './ClubProfileTab';
import { CourtsManagementTab } from './CourtsManagementTab';
import { AddCourtModal } from './AddCourtModal';
import {
  BookingMatrixView,
  PricingRulesView,
  SettingsView,
} from './SecondaryViews';

type SidebarSection =
  | 'Dashboard'
  | 'My Courts'
  | 'Booking Matrix'
  | 'Pricing Rules'
  | 'Settings';

type MainTab = 'profile' | 'courts';

interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
}

export function PakPadelDashboard() {
  const [clubs, setClubs] = useState<ClubBranch[]>(INITIAL_CLUBS);
  const [selectedClubId, setSelectedClubId] = useState<string>(
    INITIAL_CLUBS[0].id
  );
  const [activeSidebar, setActiveSidebar] =
    useState<SidebarSection>('Dashboard');
  const [activeTab, setActiveTab] = useState<MainTab>('profile');

  // Mobile Drawer State (< lg)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Add / Edit Court Modal State
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [lastSavedCourtMessage, setLastSavedCourtMessage] = useState<
    string | null
  >(null);

  // Interactive header dropdown states
  const [clubDropdownOpen, setClubDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Refs for "Click Outside to Close" behavior
  const clubDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Peak Slot Booked — Court 1',
      detail: 'Saad Afridi reserved 19:00–20:30 PKT (PKR 7,000 paid via Raast)',
      time: '4m ago',
      unread: true,
    },
    {
      id: 'n2',
      title: 'Generator Weekly Load Test Passed',
      detail: '150kVA Cummins backup verified for evening floodlight load',
      time: '1h ago',
      unread: true,
    },
    {
      id: 'n3',
      title: 'Racket Rental Inventory Synced',
      detail: '12 carbon rackets & 36 FIP ball cans checked in at Pro Shop',
      time: '3h ago',
      unread: false,
    },
  ]);

  // "Click Outside to Close" for club selector, notifications, and profile popovers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      if (
        clubDropdownRef.current &&
        !clubDropdownRef.current.contains(target)
      ) {
        setClubDropdownOpen(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }

      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close mobile drawer on Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mobileMenuOpen]);

  const currentClub =
    clubs.find((c) => c.id === selectedClubId) || clubs[0];

  const updateCurrentClub = (updated: ClubBranch) => {
    setClubs((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleToggleLiveStatus = () => {
    updateCurrentClub({
      ...currentClub,
      isLive: !currentClub.isLive,
    });
  };

  const handleOpenAddCourtModal = () => {
    setActiveSidebar('My Courts');
    setActiveTab('courts');
    setEditingCourt(null);
    setMobileMenuOpen(false);
    setIsCourtModalOpen(true);
  };

  const handleOpenEditCourtModal = (court: Court) => {
    setEditingCourt(court);
    setIsCourtModalOpen(true);
  };

  const handleSaveCourtFromModal = (savedCourt: Court, isEdit: boolean) => {
    if (isEdit) {
      updateCurrentClub({
        ...currentClub,
        courts: currentClub.courts.map((c) =>
          c.id === savedCourt.id ? savedCourt : c
        ),
      });
      setLastSavedCourtMessage(
        `Updated "${savedCourt.name}" (${savedCourt.type} · ${savedCourt.environment}).`
      );
    } else {
      updateCurrentClub({
        ...currentClub,
        courts: [...currentClub.courts, savedCourt],
      });
      setLastSavedCourtMessage(
        `Added "${savedCourt.name}" (${savedCourt.type} · ${savedCourt.environment}) to ${currentClub.name}.`
      );
    }
  };

  const handleUpdateCourt = (updatedCourt: Court) => {
    updateCurrentClub({
      ...currentClub,
      courts: currentClub.courts.map((c) =>
        c.id === updatedCourt.id ? updatedCourt : c
      ),
    });
  };

  const handleDeleteCourt = (courtId: string) => {
    const target = currentClub.courts.find((c) => c.id === courtId);
    updateCurrentClub({
      ...currentClub,
      courts: currentClub.courts.filter((c) => c.id !== courtId),
    });
    if (target) {
      setLastSavedCourtMessage(
        `Removed "${target.name}" from ${currentClub.name}.`
      );
    }
  };

  const handleBulkUpdateRates = (deltaPkr: number) => {
    updateCurrentClub({
      ...currentClub,
      courts: currentClub.courts.map((c) => ({
        ...c,
        baseRatePkr: Math.max(1000, c.baseRatePkr + deltaPkr),
        peakRatePkr: Math.max(1500, c.peakRatePkr + deltaPkr),
      })),
    });
  };

  const handleSidebarSelect = (section: SidebarSection) => {
    setActiveSidebar(section);
    setMobileMenuOpen(false);
    if (section === 'Dashboard') {
      setActiveTab('profile');
    } else if (section === 'My Courts') {
      setActiveTab('courts');
    }
  };

  const handleTabSelect = (tab: MainTab) => {
    setActiveTab(tab);
    if (tab === 'profile') {
      setActiveSidebar('Dashboard');
    } else {
      setActiveSidebar('My Courts');
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;
  const metrics = calculateClubMetrics(currentClub.courts);

  const sidebarItems: {
    id: SidebarSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: string;
  }[] = [
    {
      id: 'Dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'My Courts',
      label: 'My Courts',
      icon: Trophy,
      count: String(currentClub.courts.length),
    },
    {
      id: 'Booking Matrix',
      label: 'Booking Matrix',
      icon: Grid,
    },
    {
      id: 'Pricing Rules',
      label: 'Pricing Rules',
      icon: Tag,
    },
    {
      id: 'Settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const isSecondaryView =
    activeSidebar === 'Booking Matrix' ||
    activeSidebar === 'Pricing Rules' ||
    activeSidebar === 'Settings';

  const renderSidebarNavItems = () => (
    <nav
      aria-label="Main Navigation"
      className="px-3 py-5 space-y-1.5"
    >
      {sidebarItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeSidebar === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSidebarSelect(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`group relative min-h-[44px] w-full flex items-center justify-between rounded-r-lg rounded-l-sm px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out active:scale-95 whitespace-nowrap ${
              isActive
                ? 'border-l-4 border-[#228B4E] bg-[#01411C] text-[#FFFFFF] font-semibold shadow-sm'
                : 'border-l-4 border-transparent text-[#F5FFF7]/80 hover:border-[#228B4E]/50 hover:bg-[#18271C] hover:text-[#FFFFFF]'
            }`}
          >
            {isActive && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-[3px] top-1.5 bottom-1.5 w-1 rounded-full bg-[#228B4E]"
              />
            )}
            <span className="flex items-center gap-3">
              <Icon
                className={`h-4 w-4 shrink-0 transition-all duration-200 ease-in-out group-hover:scale-105 ${
                  isActive
                    ? 'text-[#228B4E]'
                    : 'text-[#F5FFF7]/60 group-hover:text-[#F5FFF7]'
                }`}
              />
              <span>{item.label}</span>
            </span>
            {item.count && (
              <span
                className={`rounded-md px-1.5 py-0.5 font-mono text-xs tabular-nums transition-all duration-200 ease-in-out ${
                  isActive
                    ? 'bg-[#228B4E]/25 text-[#FFFFFF] font-bold border border-[#228B4E]/40'
                    : 'text-[#F5FFF7]/60 group-hover:text-[#F5FFF7]'
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  const renderSidebarFooter = () => (
    <div className="p-4 border-t border-[#228B4E]/20 bg-[#080F0A]/70">
      <div className="rounded-lg bg-[#101A13] p-3.5 text-xs border border-[#228B4E]/25 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-center justify-between text-[#F5FFF7]/70">
          <span>Configured Courts</span>
          <span className="font-mono text-[#228B4E] tabular-nums">
            {metrics.activeCourts}/{metrics.totalCourts} Active
          </span>
        </div>
        <p className="mt-1 font-mono text-base font-bold text-[#FFFFFF] tabular-nums">
          {formatPkr(metrics.estimatedDailyRevenuePkr)}
        </p>
        <p className="mt-1 text-[11px] text-[#F5FFF7]/70 truncate">
          {currentClub.city} · {currentClub.openingTime}–
          {currentClub.closingTime} PKT
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-3rem)] lg:h-[calc(100vh-4.5rem)] w-full overflow-x-hidden lg:overflow-hidden bg-[#080F0A]">
      {/* Dark Glassmorphism Backdrop Overlay for Mobile (< lg) */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-[#080F0A]/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Fixed/Sticky Left Sidebar with Smooth 3D Slide & Fade Reveal */}
      <aside
        aria-label="Sidebar Navigation"
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col justify-between border-r border-[#228B4E]/20 bg-[#101A13] text-[#F5FFF7] overflow-y-auto origin-left transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] lg:static lg:z-auto lg:translate-x-0 lg:opacity-100 lg:shadow-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#080F0A] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#01411C] hover:[&::-webkit-scrollbar-thumb]:bg-[#228B4E] ${
          mobileMenuOpen
            ? 'translate-x-0 opacity-100 shadow-[24px_0_60px_rgba(5,11,7,0.9)]'
            : '-translate-x-full opacity-95'
        }`}
      >
        <div>
          {/* Official Brand Logo + Mobile Close Button */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-[#228B4E]/20">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/aistudio/pakpadel_logho_bf2e0951.jpg"
                alt="PakPadel"
                referrerPolicy="no-referrer"
                className="h-8 md:h-10 w-auto object-contain rounded-lg bg-[#FFFFFF] p-0.5 shadow-xs transition-all duration-200 ease-in-out"
              />
              <div>
                <span className="block text-[11px] font-semibold text-[#228B4E]">
                  Club Manager B2B
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="flex lg:hidden h-10 w-10 items-center justify-center rounded-lg text-[#F5FFF7]/80 transition-all duration-200 ease-in-out hover:bg-[#18271C] hover:text-[#FFFFFF] active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {renderSidebarNavItems()}
        </div>

        {renderSidebarFooter()}
      </aside>

      {/* Main Content Area: Independent Vertical Scrolling */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden bg-[#F7FAF8] text-[#102117] min-w-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[#102117]/5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#01411C] hover:[&::-webkit-scrollbar-thumb]:bg-[#228B4E]">
        {/* Top Navbar: Sticky at top of scrollable main container */}
        <header className="sticky top-0 z-30 border-b border-[#102117]/12 bg-[#FFFFFF]/95 backdrop-blur-md px-3.5 py-2.5 sm:px-6 sm:py-3">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            {/* Top Header Row: [Hamburger Menu + PakPadel Club Dropdown] on left, [Bell + Profile Avatar] on right */}
            <div className="flex items-center justify-between gap-2 w-full sm:flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Mobile Hamburger Menu Button */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open navigation menu"
                  aria-expanded={mobileMenuOpen}
                  className="inline-flex lg:hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#102117]/15 bg-[#F7FAF8] text-[#102117] transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50 active:scale-95"
                >
                  <Menu className="h-5 w-5" />
                </button>

                {/* Club Selector Dropdown with "Click Outside to Close" */}
                <div
                  ref={clubDropdownRef}
                  className="relative flex-1 sm:max-w-[280px] min-w-0"
                >
                  <button
                    type="button"
                    aria-label="Club selector"
                    aria-expanded={clubDropdownOpen}
                    aria-haspopup="listbox"
                    onClick={() => {
                      setClubDropdownOpen((prev) => !prev);
                      setNotificationsOpen(false);
                      setProfileMenuOpen(false);
                    }}
                    className="min-h-[40px] sm:min-h-[42px] w-full flex items-center justify-between gap-2 rounded-lg border border-[#102117]/20 bg-[#F7FAF8] py-1.5 pl-3 pr-2.5 font-display text-xs sm:text-sm font-bold text-[#102117] transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50 focus:border-[#228B4E] focus:outline-none"
                  >
                    <span className="truncate">{currentClub.name}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#102117]/60 transition-all duration-200 ease-in-out ${
                        clubDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {clubDropdownOpen && (
                    <div
                      role="listbox"
                      aria-label="Select Club Branch"
                      className="absolute left-0 mt-2 w-72 max-w-[88vw] rounded-xl border border-[#102117]/15 bg-[#FFFFFF] p-1.5 shadow-xl z-40 space-y-0.5"
                    >
                      {clubs.map((branch) => {
                        const active = branch.id === selectedClubId;
                        return (
                          <button
                            key={branch.id}
                            type="button"
                            role="option"
                            aria-selected={active}
                            onClick={() => {
                              setSelectedClubId(branch.id);
                              setLastSavedCourtMessage(null);
                              setClubDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition-all duration-200 ease-in-out ${
                              active
                                ? 'bg-[#01411C] text-[#FFFFFF]'
                                : 'text-[#102117] hover:bg-[#D6EFE0]/50'
                            }`}
                          >
                            <span className="truncate">{branch.name}</span>
                            <span
                              className={`font-mono text-[11px] shrink-0 ml-2 ${
                                active ? 'text-[#FFFFFF]/85' : 'text-[#228B4E]'
                              }`}
                            >
                              {branch.city}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Compact Group on Top Row: [Bell + Profile Avatar] */}
              <div className="flex items-center gap-2 shrink-0 sm:order-last">
                {/* Notification Icon & Dropdown with "Click Outside to Close" */}
                <div ref={notificationsRef} className="relative">
                  <button
                    type="button"
                    aria-label={`Notifications (${unreadCount} unread)`}
                    aria-expanded={notificationsOpen}
                    onClick={() => {
                      setNotificationsOpen((prev) => !prev);
                      setProfileMenuOpen(false);
                      setClubDropdownOpen(false);
                    }}
                    className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg border border-[#102117]/15 bg-[#FFFFFF] text-[#102117]/75 transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50 hover:text-[#102117]"
                  >
                    <Bell className="h-4 w-4 transition-all duration-200 ease-in-out" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#228B4E] px-1 font-mono text-[10px] font-bold text-[#FFFFFF] tabular-nums">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-xl border border-[#102117]/15 bg-[#FFFFFF] p-4 shadow-lg z-40">
                      <div className="flex items-center justify-between border-b border-[#102117]/10 pb-2.5">
                        <span className="font-display text-xs font-bold text-[#102117]">
                          Club Activity & Bookings
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setNotifications((prev) =>
                              prev.map((n) => ({ ...n, unread: false }))
                            )
                          }
                          className="rounded-md px-2 py-0.5 text-[11px] font-semibold text-[#228B4E] transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="mt-2 divide-y divide-[#102117]/10">
                        {notifications.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-lg px-2 py-2.5 text-xs transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50"
                          >
                            <div className="flex items-center justify-between font-semibold text-[#102117]">
                              <span>{item.title}</span>
                              <span className="font-mono text-[10px] font-normal text-[#102117]/55 tabular-nums">
                                {item.time}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[#102117]/70">
                              {item.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Profile Dropdown with "Click Outside to Close" */}
                <div ref={profileMenuRef} className="relative">
                  <button
                    type="button"
                    aria-label="Admin Profile Menu"
                    aria-expanded={profileMenuOpen}
                    onClick={() => {
                      setProfileMenuOpen((prev) => !prev);
                      setNotificationsOpen(false);
                      setClubDropdownOpen(false);
                    }}
                    className="min-h-[40px] sm:min-h-[42px] flex items-center gap-2 rounded-lg border border-[#102117]/15 bg-[#FFFFFF] py-1.5 pl-2 pr-2.5 text-left transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#01411C] font-display text-xs font-bold text-[#FFFFFF]">
                      {currentClub.managerName
                        .split(' ')
                        .map((p) => p[0])
                        .join('')}
                    </div>
                    <div className="hidden md:block">
                      <span className="block text-xs font-bold leading-none text-[#102117]">
                        {currentClub.managerName}
                      </span>
                      <span className="mt-0.5 block text-[10px] font-medium text-[#102117]/65">
                        Club Director
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-[#102117]/55 transition-all duration-200 ease-in-out ${
                        profileMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 rounded-xl border border-[#102117]/15 bg-[#FFFFFF] p-3 shadow-lg z-40 text-xs">
                      <div className="border-b border-[#102117]/10 pb-2.5">
                        <p className="font-bold text-[#102117]">
                          {currentClub.managerName}
                        </p>
                        <p className="text-[#102117]/65">
                          admin@pakpadel.pk · {currentClub.city}
                        </p>
                      </div>
                      <div className="mt-2 space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            handleTabSelect('profile');
                            setProfileMenuOpen(false);
                          }}
                          className="min-h-[40px] flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-[#102117] transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50"
                        >
                          <UserCheck className="h-3.5 w-3.5 text-[#228B4E]" />
                          Club Profile & Facilities
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleSidebarSelect('Settings');
                            setProfileMenuOpen(false);
                          }}
                          className="min-h-[40px] flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-[#102117] transition-all duration-200 ease-in-out hover:bg-[#D6EFE0]/50"
                        >
                          <Settings className="h-3.5 w-3.5 text-[#102117]/65" />
                          Booking & Payment Policies
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sub-Action Row: Place "Live & Accepting Bookings" pill badge and "+ Add New Court" button side-by-side */}
            <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:items-center shrink-0">
              {/* System Status Control ("Live & Accepting Bookings") */}
              <button
                type="button"
                onClick={handleToggleLiveStatus}
                title="Click to toggle online booking availability"
                className={`min-h-[40px] sm:min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 sm:px-3 py-2 text-xs font-semibold transition-all duration-200 ease-in-out hover:-translate-y-0.5 active:translate-y-0 min-w-0 ${
                  currentClub.isLive
                    ? 'border-[#228B4E]/30 bg-[#D6EFE0]/50 text-[#01411C] hover:brightness-105'
                    : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                {currentClub.isLive ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#228B4E] shrink-0" />
                ) : (
                  <PauseCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                )}
                <span className="truncate">
                  {currentClub.isLive
                    ? 'Live & Accepting Bookings'
                    : 'Paused — Maintenance'}
                </span>
              </button>

              {/* Quick Action Button "+ Add New Court" — Primary 3D Tactile Button */}
              <button
                type="button"
                onClick={handleOpenAddCourtModal}
                className="min-h-[40px] sm:min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#01411C] border-b-4 border-[#003014] px-3 sm:px-4 py-2 text-xs font-bold text-[#FFFFFF] shadow-xs transition-all duration-200 ease-in-out hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 min-w-0"
              >
                <Plus className="h-4 w-4 stroke-[2.5] shrink-0" />
                <span className="truncate">+ Add New Court</span>
              </button>
            </div>
          </div>
        </header>

        {/* Inner Workspace Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {/* Page Header & Two-Tab Switcher Bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#102117]/12 pb-5">
            <div>
              <p className="text-xs font-semibold text-[#228B4E]">
                Playtomic-Standard Venue Operations · {currentClub.city}, Pakistan
              </p>
              <h1 className="mt-1 font-display text-xl sm:text-2xl font-bold tracking-tight text-[#102117]">
                {currentClub.name}
              </h1>
            </div>

            {/* Primary Workspace Tabs (Tab A & Tab B evenly sized on mobile without cutting off) */}
            <div
              role="tablist"
              aria-label="Club Manager Workspace Views"
              className="grid grid-cols-2 w-full gap-2 sm:flex sm:w-auto items-center rounded-xl bg-[#102117]/10 p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={!isSecondaryView && activeTab === 'profile'}
                onClick={() => handleTabSelect('profile')}
                className={`min-h-[40px] w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold px-2 sm:px-4 py-2 text-center truncate transition-all duration-200 ease-in-out ${
                  !isSecondaryView && activeTab === 'profile'
                    ? 'bg-[#01411C] text-[#FFFFFF] shadow-xs hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0'
                    : 'text-[#102117]/80 hover:bg-[#D6EFE0]/50 hover:text-[#102117]'
                }`}
              >
                <Building2 className="h-3.5 w-3.5 text-[#228B4E] shrink-0" />
                <span className="truncate">Club Profile & Facilities</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={!isSecondaryView && activeTab === 'courts'}
                onClick={() => handleTabSelect('courts')}
                className={`min-h-[40px] w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold px-2 sm:px-4 py-2 text-center truncate transition-all duration-200 ease-in-out ${
                  !isSecondaryView && activeTab === 'courts'
                    ? 'bg-[#01411C] text-[#FFFFFF] shadow-xs hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0'
                    : 'text-[#102117]/80 hover:bg-[#D6EFE0]/50 hover:text-[#102117]'
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-[#228B4E] shrink-0" />
                <span className="truncate">
                  Courts Management ({currentClub.courts.length})
                </span>
              </button>
            </div>
          </div>

          {/* Active Workspace View */}
          {activeSidebar === 'Booking Matrix' ? (
            <BookingMatrixView
              club={currentClub}
              onSwitchToTab={(tab) => handleTabSelect(tab)}
            />
          ) : activeSidebar === 'Pricing Rules' ? (
            <PricingRulesView
              club={currentClub}
              onUpdateAllRates={handleBulkUpdateRates}
            />
          ) : activeSidebar === 'Settings' ? (
            <SettingsView
              club={currentClub}
              onToggleLiveStatus={handleToggleLiveStatus}
            />
          ) : activeTab === 'profile' ? (
            <ClubProfileTab
              club={currentClub}
              onUpdateClub={updateCurrentClub}
              onNavigateToCourts={() => handleTabSelect('courts')}
            />
          ) : (
            <CourtsManagementTab
              courts={currentClub.courts}
              clubName={currentClub.name}
              peakWindowLabel={`${currentClub.peakStartTime}–${currentClub.peakEndTime} PKT`}
              lastSavedMessage={lastSavedCourtMessage}
              onOpenAddModal={handleOpenAddCourtModal}
              onOpenEditModal={handleOpenEditCourtModal}
              onUpdateCourt={handleUpdateCourt}
              onDeleteCourt={handleDeleteCourt}
            />
          )}
        </div>
      </main>

      {/* "+ Add New Court" & "Edit Court" Modal with Smooth Backdrop Blur */}
      <AddCourtModal
        isOpen={isCourtModalOpen}
        initialCourt={editingCourt}
        onClose={() => setIsCourtModalOpen(false)}
        onSaveCourt={handleSaveCourtFromModal}
      />
    </div>
  );
}
