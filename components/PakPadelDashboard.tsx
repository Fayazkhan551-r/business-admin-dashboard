'use client';

import React, { useState, useEffect } from 'react';
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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
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
            className={`group relative min-h-[44px] w-full flex items-center justify-between rounded-r-lg rounded-l-sm px-3.5 py-2.5 text-sm font-medium transition-all duration-200 active:scale-95 whitespace-nowrap ${
              isActive
                ? 'border-l-4 border-emerald-400 bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent text-white font-semibold shadow-[inset_4px_0_16px_rgba(16,185,129,0.32),0_2px_10px_rgba(2,6,23,0.4)]'
                : 'border-l-4 border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            {isActive && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -left-[3px] top-1.5 bottom-1.5 w-1 rounded-full bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.85)]"
              />
            )}
            <span className="flex items-center gap-3">
              <Icon
                className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isActive
                    ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span>{item.label}</span>
            </span>
            {item.count && (
              <span
                className={`rounded-md px-1.5 py-0.5 font-mono text-xs tabular-nums transition-colors ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                    : 'text-slate-400 group-hover:text-slate-200'
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
    <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
      <div className="rounded-lg bg-slate-800/70 p-3.5 text-xs border border-slate-700/50">
        <div className="flex items-center justify-between text-slate-400">
          <span>Configured Courts</span>
          <span className="font-mono text-emerald-400 tabular-nums">
            {metrics.activeCourts}/{metrics.totalCourts} Active
          </span>
        </div>
        <p className="mt-1 font-mono text-base font-bold text-white tabular-nums">
          {formatPkr(metrics.estimatedDailyRevenuePkr)}
        </p>
        <p className="mt-1 text-[11px] text-slate-400 truncate">
          {currentClub.city} · {currentClub.openingTime}–
          {currentClub.closingTime} PKT
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950">
      {/* Dark Glassmorphism Backdrop Overlay for Mobile (< lg) */}
      <div
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Fixed/Sticky Left Sidebar with Smooth 3D Slide & Fade Reveal */}
      <aside
        aria-label="Sidebar Navigation"
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col justify-between border-r border-slate-800 bg-slate-900 text-slate-200 overflow-y-auto origin-left transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] lg:static lg:z-auto lg:translate-x-0 lg:opacity-100 lg:shadow-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-950/40 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700/80 hover:[&::-webkit-scrollbar-thumb]:bg-emerald-500/80 ${
          mobileMenuOpen
            ? 'translate-x-0 opacity-100 shadow-[24px_0_60px_rgba(2,6,23,0.85)]'
            : '-translate-x-full opacity-95'
        }`}
      >
        <div>
          {/* Brand Lockup + Mobile Close Button */}
          <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 font-display text-sm font-bold text-slate-950 shadow-[0_0_14px_rgba(16,185,129,0.4)]">
                PP
              </div>
              <div>
                <span className="block font-display text-base font-bold tracking-tight text-white whitespace-nowrap">
                  PakPadel
                </span>
                <span className="block text-[11px] font-medium text-emerald-400">
                  Club Manager B2B
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="flex lg:hidden h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition-all duration-200 hover:bg-slate-800 hover:text-white active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {renderSidebarNavItems()}
        </div>

        {renderSidebarFooter()}
      </aside>

      {/* Main Content Area: Independent Vertical Scrolling */}
      <main className="flex-1 h-full overflow-y-auto bg-slate-50 text-slate-900 min-w-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-950/10 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700/75 hover:[&::-webkit-scrollbar-thumb]:bg-emerald-500">
        {/* Top Navbar: Sticky at top of scrollable main container */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left Zone: Hamburger Menu (< lg), Club Selector Dropdown, System Status */}
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
              {/* Mobile Hamburger Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
                className="inline-flex lg:hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition-all duration-200 hover:bg-slate-100 active:scale-95"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Club Selector Dropdown */}
              <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                <label htmlFor="top-club-selector" className="sr-only">
                  Select Club Branch
                </label>
                <select
                  id="top-club-selector"
                  aria-label="Club selector"
                  value={selectedClubId}
                  onChange={(e) => {
                    setSelectedClubId(e.target.value);
                    setLastSavedCourtMessage(null);
                  }}
                  className="min-h-[44px] w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 py-2 pl-3.5 pr-9 font-display text-xs sm:text-sm font-bold text-slate-900 transition-colors hover:border-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none truncate"
                >
                  {clubs.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>

              {/* System Status Control ("Live & Accepting Bookings") */}
              <button
                type="button"
                onClick={handleToggleLiveStatus}
                title="Click to toggle online booking availability"
                className={`min-h-[44px] inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  currentClub.isLive
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                {currentClub.isLive ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <PauseCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                )}
                <span>
                  {currentClub.isLive
                    ? 'Live & Accepting Bookings'
                    : 'Paused — Maintenance Mode'}
                </span>
              </button>
            </div>

            {/* Right Zone: Quick Action "+ Add New Court", Notification Icon, Admin Profile Dropdown */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {/* Quick Action Button "+ Add New Court" */}
              <button
                type="button"
                onClick={handleOpenAddCourtModal}
                className="min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-xs transition-all duration-200 hover:bg-emerald-400 active:scale-95 whitespace-nowrap shrink-0"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>+ Add New Court</span>
              </button>

              {/* Notification Icon & Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  aria-label={`Notifications (${unreadCount} unread)`}
                  aria-expanded={notificationsOpen}
                  onClick={() => {
                    setNotificationsOpen((prev) => !prev);
                    setProfileMenuOpen(false);
                  }}
                  className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 font-mono text-[10px] font-bold text-slate-950 tabular-nums">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-xl border border-slate-200 bg-white p-4 shadow-lg z-40">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="font-display text-xs font-bold text-slate-900">
                        Club Activity & Bookings
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setNotifications((prev) =>
                            prev.map((n) => ({ ...n, unread: false }))
                          )
                        }
                        className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="mt-2 divide-y divide-slate-100">
                      {notifications.map((item) => (
                        <div key={item.id} className="py-2.5 text-xs">
                          <div className="flex items-center justify-between font-semibold text-slate-900">
                            <span>{item.title}</span>
                            <span className="font-mono text-[10px] font-normal text-slate-400 tabular-nums">
                              {item.time}
                            </span>
                          </div>
                          <p className="mt-0.5 text-slate-500">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Profile Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  aria-label="Admin Profile Menu"
                  aria-expanded={profileMenuOpen}
                  onClick={() => {
                    setProfileMenuOpen((prev) => !prev);
                    setNotificationsOpen(false);
                  }}
                  className="min-h-[44px] flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white py-1.5 pl-2 pr-3 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-900 font-display text-xs font-bold text-emerald-400">
                    {currentClub.managerName
                      .split(' ')
                      .map((p) => p[0])
                      .join('')}
                  </div>
                  <div className="hidden md:block">
                    <span className="block text-xs font-bold leading-none text-slate-900">
                      {currentClub.managerName}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-medium text-slate-500">
                      Club Director
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-3 shadow-lg z-40 text-xs">
                    <div className="border-b border-slate-100 pb-2.5">
                      <p className="font-bold text-slate-900">
                        {currentClub.managerName}
                      </p>
                      <p className="text-slate-500">
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
                        className="min-h-[40px] flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                        Club Profile & Facilities
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleSidebarSelect('Settings');
                          setProfileMenuOpen(false);
                        }}
                        className="min-h-[40px] flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Settings className="h-3.5 w-3.5 text-slate-500" />
                        Booking & Payment Policies
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Inner Workspace Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {/* Page Header & Two-Tab Switcher Bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <p className="text-xs font-semibold text-emerald-600">
                Playtomic-Standard Venue Operations · {currentClub.city}, Pakistan
              </p>
              <h1 className="mt-1 font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {currentClub.name}
              </h1>
            </div>

            {/* Primary Workspace Tabs (Tab A & Tab B always accessible) */}
            <div
              role="tablist"
              aria-label="Club Manager Workspace Views"
              className="grid grid-cols-2 sm:flex items-center gap-1.5 rounded-xl bg-slate-200/80 p-1 w-full sm:w-auto"
            >
              <button
                type="button"
                role="tab"
                aria-selected={!isSecondaryView && activeTab === 'profile'}
                onClick={() => handleTabSelect('profile')}
                className={`min-h-[40px] inline-flex items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs font-semibold transition-all duration-200 active:scale-95 whitespace-nowrap shrink-0 ${
                  !isSecondaryView && activeTab === 'profile'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <Building2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Club Profile & Facilities</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={!isSecondaryView && activeTab === 'courts'}
                onClick={() => handleTabSelect('courts')}
                className={`min-h-[40px] inline-flex items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs font-semibold transition-all duration-200 active:scale-95 whitespace-nowrap shrink-0 ${
                  !isSecondaryView && activeTab === 'courts'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <Layers className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
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
