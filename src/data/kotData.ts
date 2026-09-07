export interface RumahSukanStat {
  id: 'merah' | 'biru' | 'kuning' | 'hijau';
  name: string;
  colorName: string;
  colorClass: string;
  badgeClass: string;
  bgLightClass: string;
  borderClass: string;
  emas: number;
  perak: number;
  gangsa: number;
  keempat: number;
  mataPingat: number;
  mataSukantara: number;
  mataKeseluruhan: number;
  kedudukan: number;
  gelaran: string;
}

export interface KotEvent {
  bil: number;
  acara: string;
  kategori?: string;
  merah: { emas: number; perak: number; gangsa: number; keempat: number };
  biru: { emas: number; perak: number; gangsa: number; keempat: number };
  kuning: { emas: number; perak: number; gangsa: number; keempat: number };
  hijau: { emas: number; perak: number; gangsa: number; keempat: number };
}

export interface TokohOlahraga {
  kategori: string;
  nama: string;
  pencapaian: string;
  emas: number;
  perak: number;
  gangsa: number;
  ikon?: string;
}

export const KOT_RUMAH_SUKAN: RumahSukanStat[] = [
  {
    id: 'biru',
    name: 'Rumah Biru',
    colorName: 'Biru',
    colorClass: 'text-blue-400',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
    bgLightClass: 'bg-blue-600/10 hover:bg-blue-600/20',
    borderClass: 'border-blue-500/30',
    emas: 17,
    perak: 12,
    gangsa: 8,
    keempat: 7,
    mataPingat: 210,
    mataSukantara: 485,
    mataKeseluruhan: 695,
    kedudukan: 1,
    gelaran: 'Juara Keseluruhan'
  },
  {
    id: 'kuning',
    name: 'Rumah Kuning',
    colorName: 'Kuning',
    colorClass: 'text-amber-400',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    bgLightClass: 'bg-amber-600/10 hover:bg-amber-600/20',
    borderClass: 'border-amber-500/30',
    emas: 10,
    perak: 14,
    gangsa: 11,
    keempat: 11,
    mataPingat: 184,
    mataSukantara: 504,
    mataKeseluruhan: 688,
    kedudukan: 2,
    gelaran: 'Naib Juara'
  },
  {
    id: 'hijau',
    name: 'Rumah Hijau',
    colorName: 'Hijau',
    colorClass: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    bgLightClass: 'bg-emerald-600/10 hover:bg-emerald-600/20',
    borderClass: 'border-emerald-500/30',
    emas: 11,
    perak: 7,
    gangsa: 13,
    keempat: 12,
    mataPingat: 163,
    mataSukantara: 457,
    mataKeseluruhan: 620,
    kedudukan: 3,
    gelaran: 'Tempat Ketiga'
  },
  {
    id: 'merah',
    name: 'Rumah Merah',
    colorName: 'Merah',
    colorClass: 'text-rose-400',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    bgLightClass: 'bg-rose-600/10 hover:bg-rose-600/20',
    borderClass: 'border-rose-500/30',
    emas: 4,
    perak: 9,
    gangsa: 10,
    keempat: 12,
    mataPingat: 115,
    mataSukantara: 474,
    mataKeseluruhan: 589,
    kedudukan: 4,
    gelaran: 'Tempat Keempat'
  }
];

export const KOT_TOKOH: TokohOlahraga[] = [
  {
    kategori: 'Olahragawan 2026',
    nama: 'MUHAMMAD RASUL RAYYAN BIN MOHD ZAWAWI',
    pencapaian: '3 Pingat Emas',
    emas: 3,
    perak: 0,
    gangsa: 0
  },
  {
    kategori: 'Olahragawati 2026',
    nama: 'SITI UMAIRA BINTI CHE HALIJAN',
    pencapaian: '2 Pingat Emas',
    emas: 2,
    perak: 0,
    gangsa: 0
  },
  {
    kategori: 'Olahragawan Harapan 2026',
    nama: 'MUHAMMAD RIZQ ANAQI BIN ABDULLAH',
    pencapaian: '3 Pingat Emas',
    emas: 3,
    perak: 0,
    gangsa: 0
  },
  {
    kategori: 'Olahragawati Harapan 2026',
    nama: 'NUR ARISSA NAILA BINTI MOHD SAIFUL',
    pencapaian: '3 Pingat Emas',
    emas: 3,
    perak: 0,
    gangsa: 0
  }
];

export const KOT_CALON_TOKOH: string[] = [
  'MUHAMMAD AIDIL MIKAIL BIN MOHTAR',
  'MUHAMMAD RASUL RAYYAN BIN MOHD ZAWAWI',
  'SITI UMAIRA BINTI CHE HALIJAN',
  'TUAN NUR SUMAYYAH BINTI TUAN ABDUL HALIM',
  'NOR DHIYA ADRIANA BINTI MOHD KHAIRUL NIZAM'
];

export const KOT_EVENTS: KotEvent[] = [
  {
    bil: 1,
    acara: '80 METER (L) TAHUN 1',
    kategori: 'Tahun 1',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    kuning: { emas: 1, perak: 0, gangsa: 1, keempat: 0 },
    hijau: { emas: 0, perak: 1, gangsa: 0, keempat: 1 }
  },
  {
    bil: 2,
    acara: '80 METER (P) TAHUN 1',
    kategori: 'Tahun 1',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    kuning: { emas: 1, perak: 0, gangsa: 1, keempat: 0 },
    hijau: { emas: 0, perak: 1, gangsa: 0, keempat: 1 }
  },
  {
    bil: 3,
    acara: '80 METER (L) TAHUN 2',
    kategori: 'Tahun 2',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    hijau: { emas: 1, perak: 0, gangsa: 0, keempat: 0 }
  },
  {
    bil: 4,
    acara: '80 METER (P) TAHUN 2',
    kategori: 'Tahun 2',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 1, gangsa: 1, keempat: 0 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 1 }
  },
  {
    bil: 5,
    acara: '100 METER (L) TAHUN 3',
    kategori: 'Tahun 3',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 1, perak: 0, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 1, keempat: 1 },
    hijau: { emas: 0, perak: 1, gangsa: 0, keempat: 0 }
  },
  {
    bil: 6,
    acara: '100 METER (P) TAHUN 3',
    kategori: 'Tahun 3',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 1, perak: 1, gangsa: 1, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 1 }
  },
  {
    bil: 7,
    acara: '100 METER (L) TAHUN 4',
    kategori: 'Tahun 4',
    merah: { emas: 1, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    hijau: { emas: 0, perak: 0, gangsa: 1, keempat: 1 }
  },
  {
    bil: 8,
    acara: '100 METER (P) TAHUN 4',
    kategori: 'Tahun 4',
    merah: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    biru: { emas: 1, perak: 0, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    hijau: { emas: 0, perak: 0, gangsa: 1, keempat: 0 }
  },
  {
    bil: 9,
    acara: '100 METER (L) TAHUN 5',
    kategori: 'Tahun 5',
    merah: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    biru: { emas: 1, perak: 0, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 1 }
  },
  {
    bil: 10,
    acara: '100 METER (P) TAHUN 5',
    kategori: 'Tahun 5',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    kuning: { emas: 1, perak: 0, gangsa: 0, keempat: 1 },
    hijau: { emas: 0, perak: 1, gangsa: 0, keempat: 0 }
  },
  {
    bil: 11,
    acara: '100 METER (L) TAHUN 6',
    kategori: 'Tahun 6',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 1, perak: 0, gangsa: 1, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    hijau: { emas: 0, perak: 1, gangsa: 0, keempat: 0 }
  },
  {
    bil: 12,
    acara: '100 METER (P) TAHUN 6',
    kategori: 'Tahun 6',
    merah: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    biru: { emas: 1, perak: 0, gangsa: 0, keempat: 1 },
    kuning: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 0 }
  },
  {
    bil: 13,
    acara: '200 METER (L) TAHUN 4',
    kategori: 'Tahun 4',
    merah: { emas: 1, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 1 }
  },
  {
    bil: 14,
    acara: '200 METER (P) TAHUN 4',
    kategori: 'Tahun 4',
    merah: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    biru: { emas: 1, perak: 0, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 1 }
  },
  {
    bil: 15,
    acara: '200 METER (L) TAHUN 5',
    kategori: 'Tahun 5',
    merah: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    biru: { emas: 1, perak: 0, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    hijau: { emas: 0, perak: 0, gangsa: 1, keempat: 0 }
  },
  {
    bil: 16,
    acara: '200 METER (P) TAHUN 5',
    kategori: 'Tahun 5',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 1, perak: 0, gangsa: 0, keempat: 1 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    hijau: { emas: 0, perak: 1, gangsa: 0, keempat: 0 }
  },
  {
    bil: 17,
    acara: '200 METER (L) TAHUN 6',
    kategori: 'Tahun 6',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 1, perak: 1, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 1 }
  },
  {
    bil: 18,
    acara: '200 METER (P) TAHUN 6',
    kategori: 'Tahun 6',
    merah: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    biru: { emas: 1, perak: 0, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    hijau: { emas: 0, perak: 0, gangsa: 1, keempat: 0 }
  },
  {
    bil: 19,
    acara: 'LOMPAT JAUH (L) KELAS 3',
    kategori: 'Padang',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    kuning: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    hijau: { emas: 1, perak: 0, gangsa: 0, keempat: 0 }
  },
  {
    bil: 20,
    acara: 'LOMPAT JAUH (P) KELAS 3',
    kategori: 'Padang',
    merah: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    biru: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 1, keempat: 1 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 1 }
  },
  {
    bil: 21,
    acara: 'LOMPAT JAUH (L) KELAS 2',
    kategori: 'Padang',
    merah: { emas: 1, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    hijau: { emas: 0, perak: 1, gangsa: 0, keempat: 0 }
  },
  {
    bil: 22,
    acara: 'LOMPAT JAUH (P) KELAS 2',
    kategori: 'Padang',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 1, perak: 0, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 1, keempat: 1 },
    hijau: { emas: 0, perak: 1, gangsa: 0, keempat: 0 }
  },
  {
    bil: 23,
    acara: 'LOMPAT JAUH (L) KELAS 1',
    kategori: 'Padang',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 1, perak: 1, gangsa: 1, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 0 }
  },
  {
    bil: 24,
    acara: 'LOMPAT JAUH (P) KELAS 1',
    kategori: 'Padang',
    merah: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    biru: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    kuning: { emas: 1, perak: 0, gangsa: 1, keempat: 0 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 0 }
  },
  {
    bil: 27,
    acara: 'LOMPAT TINGGI (L) KELAS 2',
    kategori: 'Padang',
    merah: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    biru: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    kuning: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    hijau: { emas: 0, perak: 1, gangsa: 0, keempat: 0 }
  },
  {
    bil: 28,
    acara: 'LOMPAT TINGGI (P) KELAS 2',
    kategori: 'Padang',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 0, perak: 1, gangsa: 0, keempat: 1 },
    kuning: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 1 }
  },
  {
    bil: 29,
    acara: 'LOMPAT TINGGI (L) KELAS 1',
    kategori: 'Padang',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 1, perak: 0, gangsa: 0, keempat: 1 },
    kuning: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 1 }
  },
  {
    bil: 30,
    acara: 'LOMPAT TINGGI (P) KELAS 1',
    kategori: 'Padang',
    merah: { emas: 0, perak: 1, gangsa: 1, keempat: 0 },
    biru: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    hijau: { emas: 0, perak: 0, gangsa: 1, keempat: 0 }
  },
  {
    bil: 31,
    acara: 'LONTAR PELURU (L) KELAS 2',
    kategori: 'Padang',
    merah: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    biru: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 1 }
  },
  {
    bil: 32,
    acara: 'LONTAR PELURU (P) KELAS 2',
    kategori: 'Padang',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    hijau: { emas: 1, perak: 1, gangsa: 1, keempat: 0 }
  },
  {
    bil: 33,
    acara: 'LONTAR PELURU (L) KELAS 1',
    kategori: 'Padang',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 1, perak: 0, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    hijau: { emas: 0, perak: 1, gangsa: 1, keempat: 0 }
  },
  {
    bil: 34,
    acara: 'LONTAR PELURU (P) KELAS 1',
    kategori: 'Padang',
    merah: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    biru: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 1, gangsa: 1, keempat: 1 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 0 }
  },
  {
    bil: 35,
    acara: '4 X 50M (L) KELAS 3',
    kategori: 'Berganti-ganti',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 1, perak: 0, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 1, gangsa: 0, keempat: 1 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 1 }
  },
  {
    bil: 36,
    acara: '4 X 50M (P) KELAS 3',
    kategori: 'Berganti-ganti',
    merah: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    biru: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 1, keempat: 1 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 1 }
  },
  {
    bil: 37,
    acara: '4 X 100M (L) KELAS 2',
    kategori: 'Berganti-ganti',
    merah: { emas: 1, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    hijau: { emas: 0, perak: 1, gangsa: 0, keempat: 0 }
  },
  {
    bil: 38,
    acara: '4 X 100M (P) KELAS 2',
    kategori: 'Berganti-ganti',
    merah: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    biru: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 1 }
  },
  {
    bil: 39,
    acara: '4 X 100M (L) KELAS 1',
    kategori: 'Berganti-ganti',
    merah: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    biru: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 1 }
  },
  {
    bil: 40,
    acara: '4 X 100M (P) KELAS 1',
    kategori: 'Berganti-ganti',
    merah: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    biru: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 1 }
  },
  {
    bil: 41,
    acara: '4 X 200M (L) OPEN',
    kategori: 'Berganti-ganti',
    merah: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    biru: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 1 }
  },
  {
    bil: 42,
    acara: '4 X 200M (P) OPEN',
    kategori: 'Berganti-ganti',
    merah: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    biru: { emas: 0, perak: 1, gangsa: 0, keempat: 0 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 1 }
  },
  {
    bil: 43,
    acara: 'PERBARISAN',
    kategori: 'Khas',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 1, perak: 0, gangsa: 0, keempat: 1 },
    kuning: { emas: 0, perak: 0, gangsa: 1, keempat: 0 },
    hijau: { emas: 0, perak: 0, gangsa: 0, keempat: 1 }
  },
  {
    bil: 44,
    acara: 'TARIK TALI',
    kategori: 'Khas',
    merah: { emas: 0, perak: 0, gangsa: 0, keempat: 0 },
    biru: { emas: 1, perak: 0, gangsa: 0, keempat: 1 },
    kuning: { emas: 0, perak: 0, gangsa: 0, keempat: 1 },
    hijau: { emas: 0, perak: 1, gangsa: 0, keempat: 0 }
  }
];
