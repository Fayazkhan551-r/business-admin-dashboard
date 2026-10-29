export type CourtType =
  | 'Full Panoramic Glass'
  | 'Super Panoramic'
  | 'Standard Mesh';

export type CourtEnvironment = 'Indoor' | 'Outdoor';
export type CourtStatus = 'Active' | 'In Maintenance';
export type CourtLightingType =
  | 'LED Floodlights (Included)'
  | 'LED Floodlights (Extra)';

export interface Court {
  id: string;
  name: string;
  type: CourtType;
  environment: CourtEnvironment;
  baseRatePkr: number;
  peakRatePkr: number;
  status: CourtStatus;
  surface: string;
  lighting: CourtLightingType;
  utilizationPct: number;
  bookingsToday: number;
  photoUrl: string;
}

export interface AmenityItem {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface ClubBranch {
  id: string;
  label: string;
  name: string;
  city: string;
  address: string;
  openingTime: string;
  closingTime: string;
  peakStartTime: string;
  peakEndTime: string;
  contactPhone: string;
  managerName: string;
  bannerUrl: string;
  isLive: boolean;
  amenities: AmenityItem[];
  courts: Court[];
}

export interface NewCourtInput {
  name: string;
  type: CourtType;
  environment: CourtEnvironment;
  baseRatePkr: string | number;
  peakRatePkr: string | number;
  lighting?: CourtLightingType;
  photoUrl?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export type BookingSlotState = 'available' | 'paid' | 'pending_cash' | 'blocked';
export type BookingDurationMins = 60 | 90 | 120;
export type BookingPaymentMethod = 'Cash on Arrival' | 'Online';

export interface MatrixBookingSlot {
  id: string;
  courtId: string;
  dateIso: string; // e.g. '2026-10-23'
  timeSlot: string; // e.g. '18:00'
  state: Exclude<BookingSlotState, 'available'>;
  playerName: string;
  phoneNumber: string;
  durationMins: BookingDurationMins;
  paymentMethod: BookingPaymentMethod;
  amountPkr: number;
}

export const MATRIX_TIME_SLOTS: string[] = [
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
  '24:00',
];

export function formatMatrixDateLabel(
  dateIso: string,
  todayIso = '2026-10-23'
): string {
  const [year, month, day] = dateIso.split('-').map(Number);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const formatted = `${day} ${months[(month || 1) - 1]} ${year}`;
  return dateIso === todayIso ? `Today: ${formatted}` : formatted;
}

export function stepMatrixDate(dateIso: string, deltaDays: number): string {
  const [year, month, day] = dateIso.split('-').map(Number);
  const dt = new Date(Date.UTC(year, (month || 1) - 1, day || 1));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calculateWalkInPricePkr(
  court: Court,
  timeSlot: string,
  durationMins: BookingDurationMins,
  peakStartTime = '17:00'
): number {
  const isPeak = timeSlot >= peakStartTime;
  const hourlyRate = isPeak ? court.peakRatePkr : court.baseRatePkr;
  return Math.round(hourlyRate * (durationMins / 60));
}

export function validateWalkInBookingInput(input: {
  playerName: string;
  phoneNumber: string;
}): ValidationResult {
  const errors: Record<string, string> = {};
  if (!input.playerName || input.playerName.trim().length < 2) {
    errors.playerName = 'Player name is required (at least 2 characters).';
  }
  if (!input.phoneNumber || input.phoneNumber.trim().length < 7) {
    errors.phoneNumber = 'Valid phone number is required.';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function formatPkr(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return 'PKR 0';
  return `PKR ${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatHourlyRateTag(
  amount: number,
  tier: 'Base' | 'Peak'
): string {
  return `${formatPkr(amount)}/hr (${tier})`;
}

export function validateCourtInput(input: NewCourtInput): ValidationResult {
  const errors: Record<string, string> = {};
  const trimmedName = (input.name || '').trim();

  if (!trimmedName) {
    errors.name = 'Court name is required.';
  } else if (trimmedName.length < 3) {
    errors.name = 'Court name must be at least 3 characters.';
  }

  const baseRate =
    typeof input.baseRatePkr === 'string'
      ? Number(input.baseRatePkr)
      : input.baseRatePkr;
  const peakRate =
    typeof input.peakRatePkr === 'string'
      ? Number(input.peakRatePkr)
      : input.peakRatePkr;

  if (input.baseRatePkr === '' || !Number.isFinite(baseRate) || baseRate <= 0) {
    errors.baseRatePkr = 'Enter a valid hourly base rate greater than 0 PKR.';
  } else if (baseRate < 1000) {
    errors.baseRatePkr = 'Base rate must be at least 1,000 PKR.';
  }

  if (input.peakRatePkr === '' || !Number.isFinite(peakRate) || peakRate <= 0) {
    errors.peakRatePkr = 'Enter a valid peak hour rate greater than 0 PKR.';
  } else if (Number.isFinite(baseRate) && peakRate < baseRate) {
    errors.peakRatePkr =
      'Peak hour rate must be greater than or equal to the base rate.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateClubProfileInput(input: {
  name: string;
  city: string;
  openingTime: string;
  closingTime: string;
}): ValidationResult {
  const errors: Record<string, string> = {};
  if (!input.name || input.name.trim().length < 3) {
    errors.name = 'Club name must be at least 3 characters.';
  }
  if (!input.city || input.city.trim().length < 2) {
    errors.city = 'City is required.';
  }
  if (!input.openingTime) {
    errors.openingTime = 'Opening time is required.';
  }
  if (!input.closingTime) {
    errors.closingTime = 'Closing time is required.';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function calculateClubMetrics(courts: Court[]) {
  if (courts.length === 0) {
    return {
      totalCourts: 0,
      activeCourts: 0,
      maintenanceCourts: 0,
      indoorCount: 0,
      outdoorCount: 0,
      avgBaseRatePkr: 0,
      avgPeakRatePkr: 0,
      avgUtilizationPct: 0,
      estimatedDailyRevenuePkr: 0,
    };
  }

  const activeCourts = courts.filter((c) => c.status === 'Active');
  const maintenanceCourts = courts.filter(
    (c) => c.status === 'In Maintenance'
  ).length;
  const indoorCount = courts.filter((c) => c.environment === 'Indoor').length;
  const outdoorCount = courts.filter((c) => c.environment === 'Outdoor').length;

  const totalBase = courts.reduce((sum, c) => sum + c.baseRatePkr, 0);
  const totalPeak = courts.reduce((sum, c) => sum + c.peakRatePkr, 0);
  const totalUtil = activeCourts.reduce((sum, c) => sum + c.utilizationPct, 0);

  const estimatedDailyRevenuePkr = activeCourts.reduce((sum, c) => {
    const offPeakBookings = Math.floor(c.bookingsToday * 0.45);
    const peakBookings = c.bookingsToday - offPeakBookings;
    return (
      sum + offPeakBookings * c.baseRatePkr + peakBookings * c.peakRatePkr
    );
  }, 0);

  return {
    totalCourts: courts.length,
    activeCourts: activeCourts.length,
    maintenanceCourts,
    indoorCount,
    outdoorCount,
    avgBaseRatePkr: Math.round(totalBase / courts.length),
    avgPeakRatePkr: Math.round(totalPeak / courts.length),
    avgUtilizationPct:
      activeCourts.length > 0
        ? Math.round(totalUtil / activeCourts.length)
        : 0,
    estimatedDailyRevenuePkr,
  };
}

export function filterCourts(
  courts: Court[],
  options: {
    query?: string;
    environment?: 'All' | CourtEnvironment;
    type?: 'All' | CourtType;
  }
): Court[] {
  const q = (options.query || '').trim().toLowerCase();
  const env = options.environment || 'All';
  const type = options.type || 'All';

  return courts.filter((court) => {
    const matchesQuery =
      !q ||
      court.name.toLowerCase().includes(q) ||
      court.type.toLowerCase().includes(q) ||
      court.surface.toLowerCase().includes(q);
    const matchesEnv = env === 'All' || court.environment === env;
    const matchesType = type === 'All' || court.type === type;
    return matchesQuery && matchesEnv && matchesType;
  });
}

export const INITIAL_MATRIX_BOOKINGS: Record<string, MatrixBookingSlot> = {
  // Court 1 - Full Panoramic (isb-center)
  'court-1__2026-10-23__08:00': {
    id: 'b-1',
    courtId: 'court-1',
    dateIso: '2026-10-23',
    timeSlot: '08:00',
    state: 'paid',
    playerName: 'Ali R.',
    phoneNumber: '+92 300 8541120',
    durationMins: 60,
    paymentMethod: 'Online',
    amountPkr: 4000,
  },
  'court-1__2026-10-23__09:00': {
    id: 'b-2',
    courtId: 'court-1',
    dateIso: '2026-10-23',
    timeSlot: '09:00',
    state: 'pending_cash',
    playerName: 'Hamza M.',
    phoneNumber: '+92 321 4490123',
    durationMins: 90,
    paymentMethod: 'Cash on Arrival',
    amountPkr: 6000,
  },
  'court-1__2026-10-23__11:00': {
    id: 'b-3',
    courtId: 'court-1',
    dateIso: '2026-10-23',
    timeSlot: '11:00',
    state: 'paid',
    playerName: 'Saad A.',
    phoneNumber: '+92 333 5120988',
    durationMins: 60,
    paymentMethod: 'Online',
    amountPkr: 4000,
  },
  'court-1__2026-10-23__14:00': {
    id: 'b-4',
    courtId: 'court-1',
    dateIso: '2026-10-23',
    timeSlot: '14:00',
    state: 'blocked',
    playerName: 'Glass Polishing',
    phoneNumber: 'Internal Ops',
    durationMins: 60,
    paymentMethod: 'Online',
    amountPkr: 0,
  },
  'court-1__2026-10-23__18:00': {
    id: 'b-5',
    courtId: 'court-1',
    dateIso: '2026-10-23',
    timeSlot: '18:00',
    state: 'paid',
    playerName: 'Zain K.',
    phoneNumber: '+92 301 7762341',
    durationMins: 90,
    paymentMethod: 'Online',
    amountPkr: 10500,
  },
  'court-1__2026-10-23__20:00': {
    id: 'b-6',
    courtId: 'court-1',
    dateIso: '2026-10-23',
    timeSlot: '20:00',
    state: 'paid',
    playerName: 'Omar S.',
    phoneNumber: '+92 345 8112290',
    durationMins: 60,
    paymentMethod: 'Online',
    amountPkr: 7000,
  },

  // Court 2 - Standard Glass
  'court-2__2026-10-23__09:00': {
    id: 'b-7',
    courtId: 'court-2',
    dateIso: '2026-10-23',
    timeSlot: '09:00',
    state: 'paid',
    playerName: 'Daniyal Q.',
    phoneNumber: '+92 300 9123400',
    durationMins: 60,
    paymentMethod: 'Online',
    amountPkr: 4000,
  },
  'court-2__2026-10-23__12:00': {
    id: 'b-8',
    courtId: 'court-2',
    dateIso: '2026-10-23',
    timeSlot: '12:00',
    state: 'blocked',
    playerName: 'Net Tensioning',
    phoneNumber: 'Internal Ops',
    durationMins: 60,
    paymentMethod: 'Online',
    amountPkr: 0,
  },
  'court-2__2026-10-23__17:00': {
    id: 'b-9',
    courtId: 'court-2',
    dateIso: '2026-10-23',
    timeSlot: '17:00',
    state: 'pending_cash',
    playerName: 'Bilal S.',
    phoneNumber: '+92 334 5509112',
    durationMins: 60,
    paymentMethod: 'Cash on Arrival',
    amountPkr: 7000,
  },
  'court-2__2026-10-23__19:00': {
    id: 'b-10',
    courtId: 'court-2',
    dateIso: '2026-10-23',
    timeSlot: '19:00',
    state: 'paid',
    playerName: 'Hina T.',
    phoneNumber: '+92 322 6129901',
    durationMins: 90,
    paymentMethod: 'Online',
    amountPkr: 10500,
  },

  // Court 3 - Super Panoramic
  'court-3__2026-10-23__08:00': {
    id: 'b-11',
    courtId: 'court-3',
    dateIso: '2026-10-23',
    timeSlot: '08:00',
    state: 'pending_cash',
    playerName: 'Faisal M.',
    phoneNumber: '+92 312 9981234',
    durationMins: 60,
    paymentMethod: 'Cash on Arrival',
    amountPkr: 4500,
  },
  'court-3__2026-10-23__10:00': {
    id: 'b-12',
    courtId: 'court-3',
    dateIso: '2026-10-23',
    timeSlot: '10:00',
    state: 'paid',
    playerName: 'Taimur H.',
    phoneNumber: '+92 300 4118822',
    durationMins: 120,
    paymentMethod: 'Online',
    amountPkr: 9000,
  },
  'court-3__2026-10-23__18:00': {
    id: 'b-13',
    courtId: 'court-3',
    dateIso: '2026-10-23',
    timeSlot: '18:00',
    state: 'paid',
    playerName: 'Ayesha N.',
    phoneNumber: '+92 331 7001122',
    durationMins: 60,
    paymentMethod: 'Online',
    amountPkr: 7500,
  },
  'court-3__2026-10-23__21:00': {
    id: 'b-14',
    courtId: 'court-3',
    dateIso: '2026-10-23',
    timeSlot: '21:00',
    state: 'pending_cash',
    playerName: 'Kamran J.',
    phoneNumber: '+92 302 5567890',
    durationMins: 90,
    paymentMethod: 'Cash on Arrival',
    amountPkr: 11250,
  },

  // Court 4 - Championship Glass
  'court-4__2026-10-23__07:00': {
    id: 'b-15',
    courtId: 'court-4',
    dateIso: '2026-10-23',
    timeSlot: '07:00',
    state: 'paid',
    playerName: 'Waqas B.',
    phoneNumber: '+92 345 5009182',
    durationMins: 60,
    paymentMethod: 'Online',
    amountPkr: 4000,
  },
  'court-4__2026-10-23__15:00': {
    id: 'b-16',
    courtId: 'court-4',
    dateIso: '2026-10-23',
    timeSlot: '15:00',
    state: 'blocked',
    playerName: 'Turf Brushing',
    phoneNumber: 'Internal Ops',
    durationMins: 60,
    paymentMethod: 'Online',
    amountPkr: 0,
  },
  'court-4__2026-10-23__19:00': {
    id: 'b-17',
    courtId: 'court-4',
    dateIso: '2026-10-23',
    timeSlot: '19:00',
    state: 'paid',
    playerName: 'Shehryar A.',
    phoneNumber: '+92 300 2233445',
    durationMins: 60,
    paymentMethod: 'Online',
    amountPkr: 7000,
  },
  'court-4__2026-10-23__22:00': {
    id: 'b-18',
    courtId: 'court-4',
    dateIso: '2026-10-23',
    timeSlot: '22:00',
    state: 'pending_cash',
    playerName: 'Rizwan K.',
    phoneNumber: '+92 333 8877665',
    durationMins: 60,
    paymentMethod: 'Cash on Arrival',
    amountPkr: 7000,
  },
};

export const INITIAL_CLUBS: ClubBranch[] = [
  {
    id: 'isb-center',
    label: 'PakPadel Club - Islamabad Center',
    name: 'PakPadel Club - Islamabad Center',
    city: 'Islamabad',
    address: 'Plot 14, Park Road, Sector F-8/E-7 Sports Enclave, Islamabad',
    openingTime: '07:00',
    closingTime: '23:30',
    peakStartTime: '17:00',
    peakEndTime: '23:00',
    contactPhone: '+92 51 844 9200',
    managerName: 'Zainab Qureshi',
    bannerUrl: 'preset:stadium-night',
    isLive: true,
    amenities: [
      {
        id: 'generator',
        label: 'Generator Backup',
        description:
          '150kVA automatic switchover standby power for uninterrupted floodlights & HVAC',
        enabled: true,
      },
      {
        id: 'floodlights',
        label: 'Floodlights',
        description:
          'FIP-certified 500-lux anti-glare LED linear mast lighting across all courts',
        enabled: true,
      },
      {
        id: 'racket_rental',
        label: 'Racket Rental',
        description:
          'Bullpadel, Nox & Babolat carbon rackets + fresh pressurized ball cans at reception',
        enabled: true,
      },
      {
        id: 'pro_shop',
        label: 'Pro Shop',
        description:
          'On-site grip tape service, overgrips, court shoes, and official club merchandise',
        enabled: true,
      },
      {
        id: 'cafe',
        label: 'Cafe',
        description:
          'Specialty espresso bar, electrolyte recovery smoothies, and courtside lounge seating',
        enabled: true,
      },
    ],
    courts: [
      {
        id: 'court-1',
        name: 'Court 1 - Full Panoramic',
        type: 'Full Panoramic Glass',
        environment: 'Indoor',
        baseRatePkr: 4000,
        peakRatePkr: 7000,
        status: 'Active',
        surface: 'Mondo Supercourt XN Blue',
        lighting: 'LED Floodlights (Included)',
        utilizationPct: 94,
        bookingsToday: 11,
        photoUrl: 'super-panoramic-blue',
      },
      {
        id: 'court-2',
        name: 'Court 2 - Standard Glass',
        type: 'Standard Mesh',
        environment: 'Indoor',
        baseRatePkr: 4000,
        peakRatePkr: 7000,
        status: 'Active',
        surface: 'Mondo Supercourt XN Blue',
        lighting: 'LED Floodlights (Included)',
        utilizationPct: 88,
        bookingsToday: 9,
        photoUrl: 'panoramic-indoor-emerald',
      },
      {
        id: 'court-3',
        name: 'Court 3 - Super Panoramic',
        type: 'Super Panoramic',
        environment: 'Outdoor',
        baseRatePkr: 4500,
        peakRatePkr: 7500,
        status: 'Active',
        surface: 'Textured Fibrillated Turf',
        lighting: 'LED Floodlights (Included)',
        utilizationPct: 82,
        bookingsToday: 8,
        photoUrl: 'outdoor-sunset-court',
      },
      {
        id: 'court-4',
        name: 'Court 4 - Championship Glass',
        type: 'Full Panoramic Glass',
        environment: 'Outdoor',
        baseRatePkr: 4000,
        peakRatePkr: 7000,
        status: 'Active',
        surface: 'Pro-Turf High Density',
        lighting: 'LED Floodlights (Extra)',
        utilizationPct: 76,
        bookingsToday: 7,
        photoUrl: 'standard-academy-court',
      },
    ],
  },
  {
    id: 'lhr-gulberg',
    label: 'PakPadel Club - Lahore Gulberg Arena',
    name: 'PakPadel Club - Lahore Gulberg Arena',
    city: 'Lahore',
    address: 'Block L, Gulberg III Commercial Zone, Lahore',
    openingTime: '06:30',
    closingTime: '23:59',
    peakStartTime: '17:30',
    peakEndTime: '23:30',
    contactPhone: '+92 42 357 61900',
    managerName: 'Hamza Tariq',
    bannerUrl: 'preset:stadium-night',
    isLive: true,
    amenities: [
      {
        id: 'generator',
        label: 'Generator Backup',
        description: 'Dual diesel generator backup with zero-downtime UPS bridge',
        enabled: true,
      },
      {
        id: 'floodlights',
        label: 'Floodlights',
        description: 'Tournament-spec 500-lux LED court illumination',
        enabled: true,
      },
      {
        id: 'racket_rental',
        label: 'Racket Rental',
        description: 'Full fleet of rental rackets and ball machines',
        enabled: true,
      },
      {
        id: 'pro_shop',
        label: 'Pro Shop',
        description: 'Dedicated retail corner for gear and accessories',
        enabled: false,
      },
      {
        id: 'cafe',
        label: 'Cafe',
        description: 'Artisanal coffee & protein bar overlooking Court 1',
        enabled: true,
      },
    ],
    courts: [
      {
        id: 'lhr-court-1',
        name: 'Court 1 - Full Panoramic',
        type: 'Full Panoramic Glass',
        environment: 'Indoor',
        baseRatePkr: 4500,
        peakRatePkr: 7500,
        status: 'Active',
        surface: 'Mondo Supercourt XN Blue',
        lighting: 'LED Floodlights (Included)',
        utilizationPct: 96,
        bookingsToday: 12,
        photoUrl: 'super-panoramic-blue',
      },
      {
        id: 'lhr-court-2',
        name: 'Court 2 - Standard Glass',
        type: 'Standard Mesh',
        environment: 'Indoor',
        baseRatePkr: 4000,
        peakRatePkr: 7000,
        status: 'Active',
        surface: 'Mondo Supercourt XN Blue',
        lighting: 'LED Floodlights (Included)',
        utilizationPct: 89,
        bookingsToday: 10,
        photoUrl: 'panoramic-indoor-emerald',
      },
    ],
  },
  {
    id: 'khi-clifton',
    label: 'PakPadel Club - Karachi Clifton Courts',
    name: 'PakPadel Club - Karachi Clifton Courts',
    city: 'Karachi',
    address: 'Block 4, Clifton Marine Drive Precinct, Karachi',
    openingTime: '07:00',
    closingTime: '23:59',
    peakStartTime: '18:00',
    peakEndTime: '23:59',
    contactPhone: '+92 21 358 34410',
    managerName: 'Bilal Lakhani',
    bannerUrl: 'preset:stadium-night',
    isLive: true,
    amenities: [
      {
        id: 'generator',
        label: 'Generator Backup',
        description: 'Full facility solar + generator hybrid power backup',
        enabled: true,
      },
      {
        id: 'floodlights',
        label: 'Floodlights',
        description: 'Marine-grade corrosion-resistant LED floodlights',
        enabled: true,
      },
      {
        id: 'racket_rental',
        label: 'Racket Rental',
        description: 'Pro & beginner padel rackets available on demand',
        enabled: true,
      },
      {
        id: 'pro_shop',
        label: 'Pro Shop',
        description: 'Full padel pro shop and stringing/grip station',
        enabled: true,
      },
      {
        id: 'cafe',
        label: 'Cafe',
        description: 'Rooftop sea-breeze juice bar and player lounge',
        enabled: true,
      },
    ],
    courts: [
      {
        id: 'khi-court-1',
        name: 'Court 1 - Full Panoramic',
        type: 'Super Panoramic',
        environment: 'Outdoor',
        baseRatePkr: 4500,
        peakRatePkr: 7500,
        status: 'Active',
        surface: 'Mondo Supercourt XN Blue',
        lighting: 'LED Floodlights (Included)',
        utilizationPct: 91,
        bookingsToday: 10,
        photoUrl: 'outdoor-sunset-court',
      },
      {
        id: 'khi-court-2',
        name: 'Court 2 - Standard Glass',
        type: 'Full Panoramic Glass',
        environment: 'Indoor',
        baseRatePkr: 4000,
        peakRatePkr: 7000,
        status: 'Active',
        surface: 'Mondo Supercourt XN Blue',
        lighting: 'LED Floodlights (Included)',
        utilizationPct: 93,
        bookingsToday: 11,
        photoUrl: 'super-panoramic-blue',
      },
    ],
  },
];
