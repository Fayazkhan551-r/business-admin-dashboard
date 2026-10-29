export type PortalView =
  | 'landing'
  | 'login'
  | 'dashboard_club'
  | 'dashboard_super';

export type PartnerRole = 'club_admin' | 'super_admin';

export interface AuthValidationResult {
  valid: boolean;
  targetView?: PortalView;
  role?: PartnerRole;
  emailError?: string;
  passwordError?: string;
  formError?: string;
}

export interface CliftonCourtItem {
  id: string;
  name: string;
  surface: 'Full Panoramic Glass' | 'Super Panoramic' | 'Standard Glass';
  environment: 'Indoor' | 'Outdoor';
  baseRatePkr: number;
  peakRatePkr: number;
  status: 'Active' | 'Maintenance';
  todayBookings: number;
}

export interface PartnerClubRecord {
  id: string;
  name: string;
  city: 'Karachi' | 'Islamabad' | 'Lahore' | 'Rawalpindi';
  courtsCount: number;
  monthlyGrossPkr: number;
  commissionRatePercent: number;
  status: 'Live' | 'Onboarding';
}

export const DEMO_CREDENTIALS = {
  clubAdmin: {
    email: 'admin@clifton.pk',
    password: 'pakpadel2026',
    role: 'club_admin' as PartnerRole,
    targetView: 'dashboard_club' as PortalView,
    title: 'Karachi Clifton Courts Manager',
  },
  superAdmin: {
    email: 'super@pakpadel.pk',
    password: 'pakpadel2026',
    role: 'super_admin' as PartnerRole,
    targetView: 'dashboard_super' as PortalView,
    title: 'PakPadel Super Admin',
  },
};

export function authenticatePartner(
  rawEmail: string,
  rawPassword: string
): AuthValidationResult {
  const email = rawEmail.trim().toLowerCase();
  const password = rawPassword.trim();

  if (!email) {
    return {
      valid: false,
      emailError: 'Please enter your partner email address.',
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      valid: false,
      emailError: 'Enter a valid email address (e.g., admin@clifton.pk).',
    };
  }

  if (!password) {
    return {
      valid: false,
      passwordError: 'Please enter your account password.',
    };
  }

  if (password.length < 4) {
    return {
      valid: false,
      passwordError: 'Password must be at least 4 characters.',
    };
  }

  if (email === DEMO_CREDENTIALS.clubAdmin.email) {
    return {
      valid: true,
      role: 'club_admin',
      targetView: 'dashboard_club',
    };
  }

  if (email === DEMO_CREDENTIALS.superAdmin.email) {
    return {
      valid: true,
      role: 'super_admin',
      targetView: 'dashboard_super',
    };
  }

  return {
    valid: false,
    formError:
      'Unrecognized partner account. Use admin@clifton.pk (Club Admin) or super@pakpadel.pk (Super Admin).',
  };
}

export function calculateCommissionSummary(
  clubs: PartnerClubRecord[],
  globalCommissionPercent: number
) {
  const totalGrossPkr = clubs.reduce((sum, c) => sum + c.monthlyGrossPkr, 0);
  const totalCommissionPkr = Math.round(
    clubs.reduce(
      (sum, c) => sum + (c.monthlyGrossPkr * globalCommissionPercent) / 100,
      0
    )
  );
  const totalCourts = clubs.reduce((sum, c) => sum + c.courtsCount, 0);

  return {
    totalGrossPkr,
    totalCommissionPkr,
    totalCourts,
    activeClubsCount: clubs.filter((c) => c.status === 'Live').length,
  };
}

export const INITIAL_CLIFTON_COURTS: CliftonCourtItem[] = [
  {
    id: 'clifton-c1',
    name: 'Court 1 — Arabian Sea Panoramic',
    surface: 'Super Panoramic',
    environment: 'Indoor',
    baseRatePkr: 4500,
    peakRatePkr: 7500,
    status: 'Active',
    todayBookings: 11,
  },
  {
    id: 'clifton-c2',
    name: 'Court 2 — Clifton Enclave Glass',
    surface: 'Full Panoramic Glass',
    environment: 'Indoor',
    baseRatePkr: 4500,
    peakRatePkr: 7500,
    status: 'Active',
    todayBookings: 9,
  },
  {
    id: 'clifton-c3',
    name: 'Court 3 — Championship Mondo Turf',
    surface: 'Full Panoramic Glass',
    environment: 'Outdoor',
    baseRatePkr: 4000,
    peakRatePkr: 6500,
    status: 'Active',
    todayBookings: 8,
  },
  {
    id: 'clifton-c4',
    name: 'Court 4 — Pro Training Court',
    surface: 'Standard Glass',
    environment: 'Outdoor',
    baseRatePkr: 3500,
    peakRatePkr: 6000,
    status: 'Maintenance',
    todayBookings: 3,
  },
];

export const INITIAL_PARTNER_CLUBS: PartnerClubRecord[] = [
  {
    id: 'club-clifton',
    name: 'Karachi Clifton Courts',
    city: 'Karachi',
    courtsCount: 4,
    monthlyGrossPkr: 6480000,
    commissionRatePercent: 8,
    status: 'Live',
  },
  {
    id: 'club-isb-f7',
    name: 'PakPadel Club — Islamabad F-7 Enclave',
    city: 'Islamabad',
    courtsCount: 4,
    monthlyGrossPkr: 5920000,
    commissionRatePercent: 8,
    status: 'Live',
  },
  {
    id: 'club-lhr-gulberg',
    name: 'Lahore Gulberg Padel Arena',
    city: 'Lahore',
    courtsCount: 6,
    monthlyGrossPkr: 8150000,
    commissionRatePercent: 8,
    status: 'Live',
  },
  {
    id: 'club-rwp-bahria',
    name: 'Rawalpindi Bahria Phase 7 Club',
    city: 'Rawalpindi',
    courtsCount: 3,
    monthlyGrossPkr: 3840000,
    commissionRatePercent: 8,
    status: 'Live',
  },
];
