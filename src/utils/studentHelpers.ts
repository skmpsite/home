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

