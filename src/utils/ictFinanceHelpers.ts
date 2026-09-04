import { IctCashFlowRecord } from '../types';

export const STORAGE_KEY_ICT_CASHFLOW = 'skmp_ict_cashflow_records_v1';

function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export function generateDigitalReceiptSvgUrl(record: {
  refNo: string;
  date: string;
  type: 'masuk' | 'keluar';
  category: string;
  description: string;
  amount: number;
  payerOrPayee?: string;
  notes?: string;
}): string {
  const isMasuk = record.type === 'masuk';
  const title = isMasuk ? 'BAUCAR PENERIMAAN / WARAN DANA ICT' : 'RESIT RASMI & BUKTI PEMBELIAN ICT';
  const titleColor = isMasuk ? '#059669' : '#dc2626';
  const badgeText = isMasuk ? 'DANA MASUK DISAHKAN' : 'PEMBELIAN & BAYARAN SAH';
  const safeRef = record.refNo || 'REF-ICT-2026';
  const safeAmt = (record.amount || 0).toFixed(2);
  const payerTitle = isMasuk ? 'Diterima Daripada' : 'Dibayar Kepada / Pembekal';
  const payerVal = record.payerOrPayee || (isMasuk ? 'Peruntukan Rasmi Kerajaan / PIBG' : 'Pembekal Sah Berdaftar');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 760" width="600" height="760">
    <defs>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <linearGradient id="stampGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${isMasuk ? '#10b981' : '#f43f5e'}" />
        <stop offset="100%" stop-color="${isMasuk ? '#047857' : '#be123c'}" />
      </linearGradient>
    </defs>
    
    <rect width="600" height="760" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
    <rect width="600" height="110" rx="16" fill="url(#headerGrad)"/>
    <rect y="96" width="600" height="14" fill="${isMasuk ? '#10b981' : '#f59e0b'}"/>
    
    <text x="300" y="38" text-anchor="middle" fill="#f8fafc" font-size="16" font-weight="900" font-family="sans-serif" letter-spacing="1">SEKOLAH KEBANGSAAN MERBAU PULAS</text>
    <text x="300" y="58" text-anchor="middle" fill="#94a3b8" font-size="11" font-weight="600" font-family="sans-serif">KOD SEKOLAH: KBA5012 | 09300 KUALA KETIL, KEDAH</text>
    <text x="300" y="78" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="800" font-family="sans-serif">UNIT TEKNOLOGI MAKLUMAT &amp; KOMUNIKASI (ICT)</text>
    
    <text x="300" y="145" text-anchor="middle" fill="${titleColor}" font-size="18" font-weight="900" font-family="sans-serif" letter-spacing="0.5">${escapeXml(title)}</text>
    
    <rect x="200" y="160" width="200" height="24" rx="12" fill="${isMasuk ? '#ecfdf5' : '#fff1f2'}" stroke="${isMasuk ? '#10b981' : '#f43f5e'}" stroke-width="1.5"/>
    <text x="300" y="176" text-anchor="middle" fill="${isMasuk ? '#065f46' : '#9f1239'}" font-size="10.5" font-weight="800" font-family="sans-serif">${badgeText}</text>
    
    <rect x="35" y="200" width="530" height="360" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
    
    <text x="55" y="235" fill="#64748b" font-size="11" font-weight="600" font-family="sans-serif">No. Rujukan / Baucar</text>
    <text x="55" y="255" fill="#0f172a" font-size="14" font-weight="800" font-family="monospace">${escapeXml(safeRef)}</text>
    
    <text x="350" y="235" fill="#64748b" font-size="11" font-weight="600" font-family="sans-serif">Tarikh Dokumen / Bayaran</text>
    <text x="350" y="255" fill="#0f172a" font-size="13" font-weight="700" font-family="sans-serif">${escapeXml(record.date)}</text>
    
    <line x1="55" y1="272" x2="545" y2="272" stroke="#f1f5f9" stroke-width="1.5"/>
    
    <text x="55" y="300" fill="#64748b" font-size="11" font-weight="600" font-family="sans-serif">Kategori Aliran</text>
    <text x="55" y="320" fill="#1e293b" font-size="12.5" font-weight="700" font-family="sans-serif">${escapeXml(record.category)}</text>
    
    <text x="350" y="300" fill="#64748b" font-size="11" font-weight="600" font-family="sans-serif">${payerTitle}</text>
    <text x="350" y="320" fill="#1e293b" font-size="12" font-weight="700" font-family="sans-serif">${escapeXml(payerVal)}</text>
    
    <line x1="55" y1="337" x2="545" y2="337" stroke="#f1f5f9" stroke-width="1.5"/>
    
    <text x="55" y="365" fill="#64748b" font-size="11" font-weight="600" font-family="sans-serif">Perincian Item / Transaksi</text>
    <text x="55" y="390" fill="#1e293b" font-size="13" font-weight="700" font-family="sans-serif">${escapeXml(record.description)}</text>
    ${record.notes ? `<text x="55" y="415" fill="#64748b" font-size="11" font-style="italic" font-family="sans-serif">Nota: ${escapeXml(record.notes)}</text>` : ''}
    
    <line x1="55" y1="445" x2="545" y2="445" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4,4"/>
    
    <rect x="55" y="465" width="490" height="70" rx="8" fill="${isMasuk ? '#ecfdf5' : '#fef2f2'}" stroke="${isMasuk ? '#a7f3d0' : '#fecdd3'}" stroke-width="1.5"/>
    <text x="75" y="508" fill="#475569" font-size="13" font-weight="700" font-family="sans-serif">JUMLAH BESAR (RM):</text>
    <text x="525" y="511" text-anchor="end" fill="${isMasuk ? '#047857' : '#be123c'}" font-size="24" font-weight="900" font-family="sans-serif">RM ${safeAmt}</text>
    
    <g transform="translate(390, 580) rotate(-6)">
      <circle cx="65" cy="65" r="58" fill="none" stroke="url(#stampGrad)" stroke-width="2.5" stroke-dasharray="6,3"/>
      <circle cx="65" cy="65" r="48" fill="none" stroke="url(#stampGrad)" stroke-width="1"/>
      <text x="65" y="44" text-anchor="middle" fill="${isMasuk ? '#047857' : '#be123c'}" font-size="8.5" font-weight="900" font-family="sans-serif">SK MERBAU PULAS</text>
      <text x="65" y="62" text-anchor="middle" fill="${isMasuk ? '#047857' : '#be123c'}" font-size="12" font-weight="900" font-family="sans-serif">DISAHKAN</text>
      <text x="65" y="76" text-anchor="middle" fill="${isMasuk ? '#047857' : '#be123c'}" font-size="8" font-weight="800" font-family="sans-serif">UNIT ICT KBA5012</text>
      <text x="65" y="90" text-anchor="middle" fill="${isMasuk ? '#047857' : '#be123c'}" font-size="7.5" font-weight="700" font-family="monospace">${record.date}</text>
    </g>
    
    <text x="55" y="595" fill="#64748b" font-size="11" font-weight="700" font-family="sans-serif">Pengesahan Dokumen Elektronik</text>
    <text x="55" y="615" fill="#94a3b8" font-size="10" font-family="sans-serif">Bukti pembelian ini direkodkan dan disahkan dalam</text>
    <text x="55" y="630" fill="#94a3b8" font-size="10" font-family="sans-serif">Sistem Pengurusan Aliran Tunai ICT SK Merbau Pulas.</text>
    
    <g transform="translate(55, 655)">
      <rect x="0" y="0" width="3" height="35" fill="#1e293b"/>
      <rect x="5" y="0" width="2" height="35" fill="#1e293b"/>
      <rect x="9" y="0" width="4" height="35" fill="#1e293b"/>
      <rect x="16" y="0" width="2" height="35" fill="#1e293b"/>
      <rect x="20" y="0" width="6" height="35" fill="#1e293b"/>
      <rect x="29" y="0" width="2" height="35" fill="#1e293b"/>
      <rect x="34" y="0" width="5" height="35" fill="#1e293b"/>
      <rect x="42" y="0" width="3" height="35" fill="#1e293b"/>
      <rect x="48" y="0" width="2" height="35" fill="#1e293b"/>
      <rect x="53" y="0" width="5" height="35" fill="#1e293b"/>
      <rect x="61" y="0" width="2" height="35" fill="#1e293b"/>
      <rect x="66" y="0" width="4" height="35" fill="#1e293b"/>
      <rect x="73" y="0" width="3" height="35" fill="#1e293b"/>
      <rect x="79" y="0" width="2" height="35" fill="#1e293b"/>
      <rect x="84" y="0" width="6" height="35" fill="#1e293b"/>
      <rect x="93" y="0" width="3" height="35" fill="#1e293b"/>
      <rect x="99" y="0" width="2" height="35" fill="#1e293b"/>
      <rect x="104" y="0" width="5" height="35" fill="#1e293b"/>
      <rect x="112" y="0" width="3" height="35" fill="#1e293b"/>
      <rect x="118" y="0" width="4" height="35" fill="#1e293b"/>
      <rect x="125" y="0" width="2" height="35" fill="#1e293b"/>
      <rect x="130" y="0" width="6" height="35" fill="#1e293b"/>
      <rect x="139" y="0" width="2" height="35" fill="#1e293b"/>
      <rect x="144" y="0" width="4" height="35" fill="#1e293b"/>
      <rect x="151" y="0" width="3" height="35" fill="#1e293b"/>
      <text x="75" y="47" text-anchor="middle" fill="#64748b" font-size="9" font-family="monospace">*SKMP-${safeRef}*</text>
    </g>
    
    <text x="300" y="742" text-anchor="middle" fill="#94a3b8" font-size="9.5" font-weight="600" font-family="sans-serif">Cetakan Digital Sistem Kewangan ICT SK Merbau Pulas (KBA5012)</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function compressReceiptImageFile(file: File): Promise<{ dataUrl: string; fileName: string }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve({ dataUrl: reader.result as string, fileName: file.name });
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve({ dataUrl: compressedDataUrl, fileName: file.name });
        } else {
          resolve({ dataUrl: e.target?.result as string, fileName: file.name });
        }
      };
      img.onerror = () => resolve({ dataUrl: e.target?.result as string, fileName: file.name });
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const ICT_INFLOW_CATEGORIES = [
  'Peruntukan LPBT Kerajaan (KPM/JPN/PPD)',
  'Sumbangan PIBG',
  'Baki Bawa Ke Hadapan',
  'Sumbangan Agensi Luar / Korporat',
  'Lain-lain Penerimaan'
];

export const ICT_OUTFLOW_CATEGORIES = [
  'Penyelenggaraan & Servis Komputer',
  'Pembelian Peralatan ICT / Komputer',
  'Rangkaian, Kabel & Aksesori ICT',
  'Bahan Habis Pakai (Toner/Kertas/Pencetak)',
  'Audio Visual / Projektor / Skrin',
  'Perisian & Pelesenan',
  'Perbelanjaan Kecemasan / Lain-lain'
];

export const INITIAL_ICT_CASHFLOW: IctCashFlowRecord[] = [
  {
    id: 'cf-001',
    date: '2026-01-05',
    type: 'masuk',
    category: 'Baki Bawa Ke Hadapan',
    description: 'Baki tunai akaun ICT dibawa ke hadapan dari sesi 2025',
    refNo: 'BKH/2026/001',
    amount: 2450.0,
    payerOrPayee: 'Baki Tahun Lalu',
    notes: 'Baki akaun panitia/unit ICT awal tahun',
    receiptUrl: generateDigitalReceiptSvgUrl({
      refNo: 'BKH/2026/001',
      date: '2026-01-05',
      type: 'masuk',
      category: 'Baki Bawa Ke Hadapan',
      description: 'Baki tunai akaun ICT dibawa ke hadapan dari sesi 2025',
      amount: 2450.0,
      payerOrPayee: 'Baki Akaun ICT 2025',
      notes: 'Disahkan oleh Guru Besar & Penyelaras ICT'
    }),
    receiptFileName: 'Baucar_BKH_2026_001.svg',
    createdAt: '2026-01-05T08:30:00Z',
    createdBy: 'Penyelaras ICT'
  },
  {
    id: 'cf-002',
    date: '2026-02-10',
    type: 'masuk',
    category: 'Peruntukan LPBT Kerajaan (KPM/JPN/PPD)',
    description: 'Peruntukan geran LPBT ICT & Pusat Akses KPM Sesi 1/2026',
    refNo: 'LPBT/ICT/2026/01',
    amount: 4800.0,
    payerOrPayee: 'Kementerian Pendidikan Malaysia (KPM)',
    notes: 'Kemasukan waran peruntukan belanja mengurus ICT',
    receiptUrl: generateDigitalReceiptSvgUrl({
      refNo: 'LPBT/ICT/2026/01',
      date: '2026-02-10',
      type: 'masuk',
      category: 'Peruntukan LPBT Kerajaan (KPM/JPN/PPD)',
      description: 'Peruntukan geran LPBT ICT & Pusat Akses KPM Sesi 1/2026',
      amount: 4800.0,
      payerOrPayee: 'Kementerian Pendidikan Malaysia (KPM)',
      notes: 'Waran No: W-LPBT-ICT-2026-902'
    }),
    receiptFileName: 'Waran_LPBT_ICT_2026_01.svg',
    createdAt: '2026-02-10T10:15:00Z',
    createdBy: 'Penyelaras ICT'
  },
  {
    id: 'cf-003',
    date: '2026-03-02',
    type: 'keluar',
    category: 'Bahan Habis Pakai (Toner/Kertas/Pencetak)',
    description: 'Pembelian 2 set Toner HP LaserJet & 5 rim kertas A4 makmal ICT',
    refNo: 'BB/ICT/2026/001',
    amount: 450.0,
    payerOrPayee: 'Perniagaan Alat Tulis Cemerlang',
    notes: 'Resit No. 78392 disahkan oleh GPK Pentadbiran',
    receiptUrl: generateDigitalReceiptSvgUrl({
      refNo: 'BB/ICT/2026/001',
      date: '2026-03-02',
      type: 'keluar',
      category: 'Bahan Habis Pakai (Toner/Kertas/Pencetak)',
      description: 'Pembelian 2 set Toner HP LaserJet & 5 rim kertas A4 makmal ICT',
      amount: 450.0,
      payerOrPayee: 'Perniagaan Alat Tulis Cemerlang',
      notes: 'No. Resit Kedai: 78392'
    }),
    receiptFileName: 'Resit_Toner_HP_78392.svg',
    createdAt: '2026-03-02T11:00:00Z',
    createdBy: 'Penyelaras ICT'
  },
  {
    id: 'cf-004',
    date: '2026-04-15',
    type: 'masuk',
    category: 'Sumbangan PIBG',
    description: 'Sumbangan PIBG untuk Dana Baik Pulih Komputer & Rangkaian',
    refNo: 'PIBG/SUMB/2026/04',
    amount: 1500.0,
    payerOrPayee: 'Persatuan Ibu Bapa dan Guru (PIBG) SKMP',
    notes: 'Diputuskan dalam Mesyuarat Agung PIBG 2026',
    receiptUrl: generateDigitalReceiptSvgUrl({
      refNo: 'PIBG/SUMB/2026/04',
      date: '2026-04-15',
      type: 'masuk',
      category: 'Sumbangan PIBG',
      description: 'Sumbangan PIBG untuk Dana Baik Pulih Komputer & Rangkaian',
      amount: 1500.0,
      payerOrPayee: 'PIBG SK Merbau Pulas',
      notes: 'Resit Rasmi PIBG No: 04412'
    }),
    receiptFileName: 'Resit_PIBG_2026_04.svg',
    createdAt: '2026-04-15T09:40:00Z',
    createdBy: 'Penyelaras ICT'
  },
  {
    id: 'cf-005',
    date: '2026-05-20',
    type: 'keluar',
    category: 'Rangkaian, Kabel & Aksesori ICT',
    description: 'Pembelian Gigabit Switch 16-Port & 2 kotak kabel LAN Cat6 makmal',
    refNo: 'BB/ICT/2026/002',
    amount: 580.0,
    payerOrPayee: 'Mega Tech Computer Supplies',
    notes: 'Pemasangan kabel internet gantian makmal komputer',
    receiptUrl: generateDigitalReceiptSvgUrl({
      refNo: 'BB/ICT/2026/002',
      date: '2026-05-20',
      type: 'keluar',
      category: 'Rangkaian, Kabel & Aksesori ICT',
      description: 'Pembelian Gigabit Switch 16-Port & 2 kotak kabel LAN Cat6 makmal',
      amount: 580.0,
      payerOrPayee: 'Mega Tech Computer Supplies',
      notes: 'Invois Rasmi: MT-2026-441'
    }),
    receiptFileName: 'Resit_Gigabit_Switch_LAN.svg',
    createdAt: '2026-05-20T14:20:00Z',
    createdBy: 'Penyelaras ICT'
  },
  {
    id: 'cf-006',
    date: '2026-06-18',
    type: 'keluar',
    category: 'Penyelenggaraan & Servis Komputer',
    description: 'Servis penyelenggaraan berkala 20 unit komputer murid & format semula OS',
    refNo: 'BB/ICT/2026/003',
    amount: 920.0,
    payerOrPayee: 'Sinar Komputer Solution',
    notes: 'Invois No: SKS-2026-88',
    receiptUrl: generateDigitalReceiptSvgUrl({
      refNo: 'BB/ICT/2026/003',
      date: '2026-06-18',
      type: 'keluar',
      category: 'Penyelenggaraan & Servis Komputer',
      description: 'Servis penyelenggaraan berkala 20 unit komputer murid & format semula OS',
      amount: 920.0,
      payerOrPayee: 'Sinar Komputer Solution',
      notes: 'No. Invois Servis: SKS-2026-88'
    }),
    receiptFileName: 'Invois_Servis_Komputer_SKS.svg',
    createdAt: '2026-06-18T10:50:00Z',
    createdBy: 'Penyelaras ICT'
  },
  {
    id: 'cf-007',
    date: '2026-07-25',
    type: 'keluar',
    category: 'Audio Visual / Projektor / Skrin',
    description: 'Penggantian lampu mentol projektor Epson Makmal Komputer 1',
    refNo: 'BB/ICT/2026/004',
    amount: 380.0,
    payerOrPayee: 'Vision AV System Sdn Bhd',
    notes: 'Waranti alat ganti 6 bulan',
    receiptUrl: generateDigitalReceiptSvgUrl({
      refNo: 'BB/ICT/2026/004',
      date: '2026-07-25',
      type: 'keluar',
      category: 'Audio Visual / Projektor / Skrin',
      description: 'Penggantian lampu mentol projektor Epson Makmal Komputer 1',
      amount: 380.0,
      payerOrPayee: 'Vision AV System Sdn Bhd',
      notes: 'Waranti alat ganti 6 bulan'
    }),
    receiptFileName: 'Resit_Lampu_Projektor_Epson.svg',
    createdAt: '2026-07-25T11:15:00Z',
    createdBy: 'Penyelaras ICT'
  },
  {
    id: 'cf-008',
    date: '2026-08-14',
    type: 'keluar',
    category: 'Pembelian Peralatan ICT / Komputer',
    description: 'Pembelian 1 unit Wireless Access Point (Wi-Fi 6) untuk Bilik ICT',
    refNo: 'BB/ICT/2026/005',
    amount: 320.0,
    payerOrPayee: 'Mega Tech Computer Supplies',
    notes: 'Meningkatkan kelajuan capaian PdP digital',
    receiptUrl: generateDigitalReceiptSvgUrl({
      refNo: 'BB/ICT/2026/005',
      date: '2026-08-14',
      type: 'keluar',
      category: 'Pembelian Peralatan ICT / Komputer',
      description: 'Pembelian 1 unit Wireless Access Point (Wi-Fi 6) untuk Bilik ICT',
      amount: 320.0,
      payerOrPayee: 'Mega Tech Computer Supplies',
      notes: 'Waranti 1 Tahun'
    }),
    receiptFileName: 'Resit_AccessPoint_Wifi6.svg',
    createdAt: '2026-08-14T15:00:00Z',
    createdBy: 'Penyelaras ICT'
  }
];

export function loadIctCashFlow(): IctCashFlowRecord[] {
  if (typeof window === 'undefined') {
    return INITIAL_ICT_CASHFLOW;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ICT_CASHFLOW);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ICT_CASHFLOW, JSON.stringify(INITIAL_ICT_CASHFLOW));
      return INITIAL_ICT_CASHFLOW;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const enriched = parsed.map((item) => {
        if (!item.receiptUrl) {
          const matchInitial = INITIAL_ICT_CASHFLOW.find((i) => i.id === item.id);
          if (matchInitial?.receiptUrl) {
            return {
              ...item,
              receiptUrl: matchInitial.receiptUrl,
              receiptFileName: matchInitial.receiptFileName
            };
          }
        }
        return item;
      });
      return enriched;
    }
    localStorage.setItem(STORAGE_KEY_ICT_CASHFLOW, JSON.stringify(INITIAL_ICT_CASHFLOW));
    return INITIAL_ICT_CASHFLOW;
  } catch (err) {
    console.error('Failed to load ICT cash flow from storage:', err);
    return INITIAL_ICT_CASHFLOW;
  }
}

export function saveIctCashFlow(records: IctCashFlowRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ICT_CASHFLOW, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save ICT cash flow to storage:', err);
  }
}

export function formatCurrencyRM(val: number): string {
  const safeVal = isNaN(val) ? 0 : val;
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(safeVal).replace('MYR', 'RM');
}

export interface CashFlowTotals {
  totalIn: number;
  totalOut: number;
  balance: number;
  countIn: number;
  countOut: number;
  totalCount: number;
}

export function calculateCashFlowTotals(records: IctCashFlowRecord[]): CashFlowTotals {
  let totalIn = 0;
  let totalOut = 0;
  let countIn = 0;
  let countOut = 0;

  for (const r of records) {
    const amt = Number(r.amount) || 0;
    if (r.type === 'masuk') {
      totalIn += amt;
      countIn += 1;
    } else {
      totalOut += amt;
      countOut += 1;
    }
  }

  return {
    totalIn,
    totalOut,
    balance: totalIn - totalOut,
    countIn,
    countOut,
    totalCount: records.length
  };
}

// Function to calculate running balances ordered chronologically
export interface RecordWithRunningBalance extends IctCashFlowRecord {
  runningBalance: number;
}

export function computeRunningBalances(records: IctCashFlowRecord[]): RecordWithRunningBalance[] {
  // Sort ascending by date for accurate running balance
  const sorted = [...records].sort((a, b) => {
    const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (diff !== 0) return diff;
    return a.id.localeCompare(b.id);
  });

  let balance = 0;
  const result: RecordWithRunningBalance[] = sorted.map((item) => {
    const amt = Number(item.amount) || 0;
    if (item.type === 'masuk') {
      balance += amt;
    } else {
      balance -= amt;
    }
    return {
      ...item,
      runningBalance: balance
    };
  });

  return result;
}

export function exportIctFinanceCsv(records: IctCashFlowRecord[]): void {
  const withBalance = computeRunningBalances(records);

  const headers = [
    'Bil',
    'Tarikh',
    'No. Rujukan/Baucar',
    'Jenis',
    'Kategori',
    'Butiran / Keterangan',
    'Duit Masuk (RM)',
    'Duit Keluar (RM)',
    'Baki Semasa (RM)',
    'Penerima/Pembayar',
    'Bukti / Resit',
    'Catatan'
  ];

  const rows = withBalance.map((r, index) => {
    const isMasuk = r.type === 'masuk';
    const masukVal = isMasuk ? r.amount.toFixed(2) : '0.00';
    const keluarVal = !isMasuk ? r.amount.toFixed(2) : '0.00';
    return [
      index + 1,
      r.date,
      `"${(r.refNo || '').replace(/"/g, '""')}"`,
      isMasuk ? 'Duit Masuk' : 'Duit Keluar',
      `"${(r.category || '').replace(/"/g, '""')}"`,
      `"${(r.description || '').replace(/"/g, '""')}"`,
      masukVal,
      keluarVal,
      r.runningBalance.toFixed(2),
      `"${(r.payerOrPayee || '').replace(/"/g, '""')}"`,
      r.receiptUrl ? `"${(r.receiptFileName || 'Ada Resit/Bukti').replace(/"/g, '""')}"` : '"Tiada"',
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  const totals = calculateCashFlowTotals(records);
  const summaryRow = [
    '',
    'JUMLAH KESELURUHAN',
    '',
    '',
    '',
    '',
    totals.totalIn.toFixed(2),
    totals.totalOut.toFixed(2),
    totals.balance.toFixed(2),
    '',
    '',
    ''
  ].join(',');

  const csvContent = '\uFEFF' + [headers.join(','), ...rows, summaryRow].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Penyata_Aliran_Tunai_ICT_SKMP_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
