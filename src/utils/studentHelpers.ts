import { SchoolHoliday } from '../types';

/**
 * Helper sorting functions for school Years and Classes
 *
 * Urutan Tahun:
 * 1. Tahun Enam (TAHUN 6)
 * 2. Tahun Lima (TAHUN 5)
 * 3. Tahun Empat (TAHUN 4)
 * 4. Tahun Tiga (TAHUN 3)
 * 5. Tahun Dua (TAHUN 2)
 * 6. Tahun Satu (TAHUN 1)
 * 7. Pra Sekolah (PRASEKOLAH / PRA SEKOLAH)
 *
 * Urutan Kelas:
 * 1. Ibnu Sina
 * 2. Ibnu Khaldun
 * 3. Pra Intan
 * 4. Pra Berlian
 */

export const getYearSortRank = (yearStr: string): number => {
  const y = (yearStr || '').toUpperCase().trim();
  if (y.includes('6') || y.includes('ENAM')) return 1;
  if (y.includes('5') || y.includes('LIMA')) return 2;
  if (y.includes('4') || y.includes('EMPAT')) return 3;
  if (y.includes('3') || y.includes('TIGA')) return 4;
  if (y.includes('2') || y.includes('DUA')) return 5;
  if (y.includes('1') || y.includes('SATU')) return 6;
  if (y.includes('PRA')) return 7;
  return 8;
};

export const getClassSortRank = (classStr: string): number => {
  const c = (classStr || '').toUpperCase().trim();
  if (c.includes('SINA')) return 1;
  if (c.includes('KHALDUN')) return 2;
  if (c.includes('INTAN')) return 3;
  if (c.includes('BERLIAN')) return 4;
  return 5;
};

export const sortYears = (years: string[]): string[] => {
  return [...years].sort((a, b) => {
    const rA = getYearSortRank(a);
    const rB = getYearSortRank(b);
    if (rA !== rB) return rA - rB;
    return a.localeCompare(b);
  });
};

export const sortClasses = (classes: string[]): string[] => {
  return [...classes].sort((a, b) => {
    const rA = getClassSortRank(a);
    const rB = getClassSortRank(b);
    if (rA !== rB) return rA - rB;
    return a.localeCompare(b);
  });
};

export const sortClassBreakdown = <T extends { year: string; className: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const yrA = getYearSortRank(a.year);
    const yrB = getYearSortRank(b.year);
    if (yrA !== yrB) return yrA - yrB;
    const clA = getClassSortRank(a.className);
    const clB = getClassSortRank(b.className);
    if (clA !== clB) return clA - clB;
    return a.className.localeCompare(b.className);
  });
};

export const getYearTheme = (yearStr: string) => {
  const rank = getYearSortRank(yearStr);
  switch (rank) {
    case 1: // Tahun 6
      return {
        label: 'Tahun 6',
        badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
        cardBorder: 'border-indigo-500/30 hover:border-indigo-400',
        cardBg: 'bg-indigo-950/25',
        headerAccent: 'text-indigo-300',
        barActive: 'bg-indigo-500',
        lightBg: 'from-indigo-950/40 to-slate-900/80'
      };
    case 2: // Tahun 5
      return {
        label: 'Tahun 5',
        badge: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
        cardBorder: 'border-sky-500/30 hover:border-sky-400',
        cardBg: 'bg-sky-950/25',
        headerAccent: 'text-sky-300',
        barActive: 'bg-sky-500',
        lightBg: 'from-sky-950/40 to-slate-900/80'
      };
    case 3: // Tahun 4
      return {
        label: 'Tahun 4',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
        cardBorder: 'border-emerald-500/30 hover:border-emerald-400',
        cardBg: 'bg-emerald-950/25',
        headerAccent: 'text-emerald-300',
        barActive: 'bg-emerald-500',
        lightBg: 'from-emerald-950/40 to-slate-900/80'
      };
    case 4: // Tahun 3
      return {
        label: 'Tahun 3',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
        cardBorder: 'border-amber-500/30 hover:border-amber-400',
        cardBg: 'bg-amber-950/25',
        headerAccent: 'text-amber-300',
        barActive: 'bg-amber-400',
        lightBg: 'from-amber-950/40 to-slate-900/80'
      };
    case 5: // Tahun 2
      return {
        label: 'Tahun 2',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-400/40',
        cardBorder: 'border-orange-500/30 hover:border-orange-400',
        cardBg: 'bg-orange-950/25',
        headerAccent: 'text-orange-300',
        barActive: 'bg-orange-500',
        lightBg: 'from-orange-950/40 to-slate-900/80'
      };
    case 6: // Tahun 1
      return {
        label: 'Tahun 1',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
        cardBorder: 'border-rose-500/30 hover:border-rose-400',
        cardBg: 'bg-rose-950/25',
        headerAccent: 'text-rose-300',
        barActive: 'bg-rose-500',
        lightBg: 'from-rose-950/40 to-slate-900/80'
      };
    case 7: // Pra Sekolah
    default:
      return {
        label: 'Pra Sekolah',
        badge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40',
        cardBorder: 'border-fuchsia-500/30 hover:border-fuchsia-400',
        cardBg: 'bg-fuchsia-950/25',
        headerAccent: 'text-fuchsia-300',
        barActive: 'bg-fuchsia-500',
        lightBg: 'from-fuchsia-950/40 to-slate-900/80'
      };
  }
};

export interface ClassPillItem {
  code: string;
  label: string;
  fullName: string;
  shortDescription: string;
}

export const ORDERED_CLASS_PILLS: ClassPillItem[] = [
  { code: '6IS', label: '6IS', fullName: 'Tahun Enam Ibnu Sina', shortDescription: 'Tahun 6 Ibnu Sina' },
  { code: '6IK', label: '6IK', fullName: 'Tahun Enam Ibnu Khaldun', shortDescription: 'Tahun 6 Ibnu Khaldun' },
  { code: '5IS', label: '5IS', fullName: 'Tahun Lima Ibnu Sina', shortDescription: 'Tahun 5 Ibnu Sina' },
  { code: '5IK', label: '5IK', fullName: 'Tahun Lima Ibnu Khaldun', shortDescription: 'Tahun 5 Ibnu Khaldun' },
  { code: '4IS', label: '4IS', fullName: 'Tahun Empat Ibnu Sina', shortDescription: 'Tahun 4 Ibnu Sina' },
  { code: '4IK', label: '4IK', fullName: 'Tahun Empat Ibnu Khaldun', shortDescription: 'Tahun 4 Ibnu Khaldun' },
  { code: '3IS', label: '3IS', fullName: 'Tahun Tiga Ibnu Sina', shortDescription: 'Tahun 3 Ibnu Sina' },
  { code: '3IK', label: '3IK', fullName: 'Tahun Tiga Ibnu Khaldun', shortDescription: 'Tahun 3 Ibnu Khaldun' },
  { code: '2IS', label: '2IS', fullName: 'Tahun Dua Ibnu Sina', shortDescription: 'Tahun 2 Ibnu Sina' },
  { code: '2IK', label: '2IK', fullName: 'Tahun Dua Ibnu Khaldun', shortDescription: 'Tahun 2 Ibnu Khaldun' },
  { code: '1IS', label: '1IS', fullName: 'Tahun Satu Ibnu Sina', shortDescription: 'Tahun 1 Ibnu Sina' },
  { code: '1IK', label: '1IK', fullName: 'Tahun Satu Ibnu Khaldun', shortDescription: 'Tahun 1 Ibnu Khaldun' },
  { code: 'P.In', label: 'P.In', fullName: 'Pra Sekolah Intan', shortDescription: 'Pra Intan' },
  { code: 'P.Ber', label: 'P.Ber', fullName: 'Pra Sekolah Berlian', shortDescription: 'Pra Berlian' },
];

export const getStudentClassCode = (student: { year?: string; className?: string }): string => {
  const y = (student.year || '').toUpperCase().trim();
  const c = (student.className || '').toUpperCase().trim();

  // Tahun 6
  if (y.includes('6') || y.includes('ENAM')) {
    if (c.includes('SINA')) return '6IS';
    if (c.includes('KHALDUN')) return '6IK';
    return '6IS';
  }
  // Tahun 5
  if (y.includes('5') || y.includes('LIMA')) {
    if (c.includes('SINA')) return '5IS';
    if (c.includes('KHALDUN')) return '5IK';
    return '5IS';
  }
  // Tahun 4
  if (y.includes('4') || y.includes('EMPAT')) {
    if (c.includes('SINA')) return '4IS';
    if (c.includes('KHALDUN')) return '4IK';
    return '4IS';
  }
  // Tahun 3
  if (y.includes('3') || y.includes('TIGA')) {
    if (c.includes('SINA')) return '3IS';
    if (c.includes('KHALDUN')) return '3IK';
    return '3IS';
  }
  // Tahun 2
  if (y.includes('2') || y.includes('DUA')) {
    if (c.includes('SINA')) return '2IS';
    if (c.includes('KHALDUN')) return '2IK';
    return '2IS';
  }
  // Tahun 1
  if (y.includes('1') || y.includes('SATU')) {
    if (c.includes('SINA')) return '1IS';
    if (c.includes('KHALDUN')) return '1IK';
    return '1IS';
  }
  // Pra Sekolah
  if (y.includes('PRA') || c.includes('PRA')) {
    if (c.includes('INTAN')) return 'P.In';
    if (c.includes('BERLIAN')) return 'P.Ber';
    return 'P.In';
  }
  return '';
};

/**
 * Helper to check if a date string (YYYY-MM-DD) or Date is a weekend in Kedah (Jumaat = 5, Sabtu = 6)
 */
export const isKedahWeekend = (
  dateOrStr: string | Date
): { isWeekend: boolean; dayName: 'Jumaat' | 'Sabtu' | '' } => {
  let dt: Date;
  if (typeof dateOrStr === 'string') {
    const parts = dateOrStr.split('-');
    if (parts.length === 3) {
      dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      dt = new Date(dateOrStr);
    }
  } else {
    dt = dateOrStr;
  }
  const day = dt.getDay();
  if (day === 5) return { isWeekend: true, dayName: 'Jumaat' };
  if (day === 6) return { isWeekend: true, dayName: 'Sabtu' };
  return { isWeekend: false, dayName: '' };
};

/**
 * Resolves whether a given date is a school holiday (custom holiday or default Friday/Saturday weekend in Kedah)
 */
export const getActiveSchoolHoliday = (
  dateStr: string,
  schoolHolidays?: SchoolHoliday[]
): SchoolHoliday | undefined => {
  if (!dateStr) return undefined;

  // 1. Check custom / Takwim school holidays first
  if (schoolHolidays && schoolHolidays.length > 0) {
    const customMatch = schoolHolidays.find((h) => dateStr >= h.dateFrom && dateStr <= h.dateTo);
    if (customMatch) return customMatch;
  }

  // 2. Default: Friday (Jumaat) and Saturday (Sabtu) are official weekend holidays in Kedah (Kumpulan A)
  const weekend = isKedahWeekend(dateStr);
  if (weekend.isWeekend) {
    return {
      id: `weekend-${dateStr}`,
      title: `Cuti Hujung Minggu (${weekend.dayName})`,
      dateFrom: dateStr,
      dateTo: dateStr,
      category: 'umum',
      description: `Cuti Hujung Minggu Persekolahan Negeri Kedah (${weekend.dayName})`,
      createdAt: ''
    };
  }

  return undefined;
};


