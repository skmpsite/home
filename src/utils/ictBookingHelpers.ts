import { IctBookingRecord } from '../types';

export interface TimeSlotDef {
  index: number;
  label: string;
  startTime: string;
  endTime: string;
  isRecess?: boolean;
}

export const ICT_TIME_SLOTS: TimeSlotDef[] = [
  { index: 0, label: '07:45 - 08:15', startTime: '07:45', endTime: '08:15' },
  { index: 1, label: '08:15 - 08:45', startTime: '08:15', endTime: '08:45' },
  { index: 2, label: '08:45 - 09:15', startTime: '08:45', endTime: '09:15' },
  { index: 3, label: '09:15 - 09:45', startTime: '09:15', endTime: '09:45' },
  { index: 4, label: '09:45 - 10:15', startTime: '09:45', endTime: '10:15', isRecess: true },
  { index: 5, label: '10:15 - 10:45', startTime: '10:15', endTime: '10:45' },
  { index: 6, label: '10:45 - 11:15', startTime: '10:45', endTime: '11:15' },
  { index: 7, label: '11:15 - 11:45', startTime: '11:15', endTime: '11:45' },
  { index: 8, label: '11:45 - 12:15', startTime: '11:45', endTime: '12:15' },
  { index: 9, label: '12:15 - 12:45', startTime: '12:15', endTime: '12:45' },
  { index: 10, label: '12:45 - 01:15', startTime: '12:45', endTime: '13:15' }
];

export const ICT_DAYS = [
  { dayIndex: 0, name: 'Ahad', shortName: 'Ahd' },
  { dayIndex: 1, name: 'Isnin', shortName: 'Isn' },
  { dayIndex: 2, name: 'Selasa', shortName: 'Sel' },
  { dayIndex: 3, name: 'Rabu', shortName: 'Rab' },
  { dayIndex: 4, name: 'Khamis', shortName: 'Kha' }
];

export const ICT_ROOMS = [
  {
    id: 'makmal-ict',
    name: 'Makmal ICT',
    capacity: '36 Murid + Guru',
    equipment: '30 PC Murid, 1 PC Guru, Smart TV 65", Rangkaian LAN Berkelajuan Tinggi, Berhawa Dingin'
  }
];

export const ICT_CLASSES = [
  '6 Ibnu Sina',
  '6 Ibnu Khaldun',
  '5 Ibnu Sina',
  '5 Ibnu Khaldun',
  '4 Ibnu Sina',
  '4 Ibnu Khaldun',
  '3 Ibnu Sina',
  '3 Ibnu Khaldun',
  '2 Ibnu Sina',
  '2 Ibnu Khaldun',
  '1 Ibnu Sina',
  '1 Ibnu Khaldun'
];

export const ICT_SUBJECTS = [
  'Reka Bentuk & Teknologi (RBT)',
  'Sains',
  'Matematik',
  'Bahasa Melayu',
  'Bahasa Inggeris',
  'Pendidikan Islam',
  'Bahasa Arab',
  'Sejarah',
  'Pendidikan Seni Visual (PSV)',
  'Aktiviti Kelab Robotik / ICT',
  'Mesyuarat / Bengkel Guru',
  'Lain-lain'
];

export const STORAGE_KEY_ICT_BOOKINGS = 'skmp_ict_room_bookings_v3';

// Letters for the recess slot (09:45 - 10:15) across the school week:
// Ahad -> 'R'
// Isnin -> 'E'
// Selasa -> 'H'
// Rabu -> 'A'
// Khamis -> 'T'
// Spells "R-E-H-A-T"
export const RECESS_DAY_LETTERS: Record<string, string> = {
  'Ahad': 'R',
  'Isnin': 'E',
  'Selasa': 'H',
  'Rabu': 'A',
  'Khamis': 'T'
};

// Check if a specific slot is the current active time
export function isSlotCurrentTime(
  dateStr: string,
  startTime: string,
  endTime: string,
  currentTime: Date
): boolean {
  const todayStr = formatDateYMD(currentTime);
  if (dateStr !== todayStr) return false;

  const curMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const [sH, sM] = startTime.split(':').map(Number);
  const [eH, eM] = endTime.split(':').map(Number);
  const startMin = sH * 60 + sM;
  const endMin = eH * 60 + eM;

  return curMinutes >= startMin && curMinutes < endMin;
}

// Helper to get formatted date YYYY-MM-DD
export function formatDateYMD(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Calculate the 5 Kedah school days for a given date's week (Ahad - Khamis)
export function getSchoolWeekDaysForDate(targetDateStr?: string) {
  const baseDate = targetDateStr ? new Date(targetDateStr + 'T00:00:00') : new Date();
  const dayOfWeek = baseDate.getDay(); // 0 is Sunday, 4 is Thursday, 5 is Friday, 6 is Saturday
  
  // Calculate Sunday of this school week
  const sunday = new Date(baseDate);
  // If Friday or Saturday, show the coming Sunday or the current week's Sunday
  if (dayOfWeek === 5) {
    sunday.setDate(baseDate.getDate() + 2); // Next Sunday
  } else if (dayOfWeek === 6) {
    sunday.setDate(baseDate.getDate() + 1); // Next Sunday
  } else {
    sunday.setDate(baseDate.getDate() - dayOfWeek);
  }

  const result = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const dateStr = formatDateYMD(d);
    const dayMeta = ICT_DAYS[i];
    result.push({
      dateStr,
      dayName: dayMeta.name,
      shortName: dayMeta.shortName,
      dayNumber: d.getDate(),
      monthLabel: d.toLocaleDateString('ms-MY', { month: 'short' }),
      formattedDisplay: `${dayMeta.name}, ${d.getDate()} ${d.toLocaleDateString('ms-MY', { month: 'short' })}`
    });
  }
  return result;
}

// Initial sample bookings for realism
export function getInitialIctBookings(): IctBookingRecord[] {
  const now = new Date();
  const weekDays = getSchoolWeekDaysForDate();
  const ahad = weekDays[0]?.dateStr || formatDateYMD(now);
  const isnin = weekDays[1]?.dateStr || formatDateYMD(now);
  const selasa = weekDays[2]?.dateStr || formatDateYMD(now);
  const rabu = weekDays[3]?.dateStr || formatDateYMD(now);
  const khamis = weekDays[4]?.dateStr || formatDateYMD(now);

  return [
    {
      id: 'ict-b1',
      date: ahad,
      dayName: 'Ahad',
      slotIndex: 1, // 08:15 - 08:45
      startTime: '08:15',
      endTime: '08:45',
      timeSlotLabel: '08:15 - 08:45',
      roomName: 'Makmal ICT',
      teacherName: 'Cikgu Ahmad Zaki',
      teacherEmail: 'guru.zaki@moe-dl.edu.my',
      className: '6 Ibnu Sina',
      subject: 'Reka Bentuk & Teknologi (RBT)',
      purpose: 'Amali Pengekodan Blok Scratch & Algoritma Robotik',
      numberOfStudents: 32,
      equipmentNeeded: ['30 PC Murid', 'Smart TV 65"'],
      status: 'disahkan',
      monthKey: ahad.slice(0, 7),
      createdBy: 'Cikgu Ahmad Zaki',
      createdAt: `${ahad}T07:30:00Z`
    },
    {
      id: 'ict-b2',
      date: isnin,
      dayName: 'Isnin',
      slotIndex: 2, // 08:45 - 09:15
      startTime: '08:45',
      endTime: '09:15',
      timeSlotLabel: '08:45 - 09:15',
      roomName: 'Makmal ICT',
      teacherName: 'Cikgu Siti Hajar binti Salleh',
      teacherEmail: 'guru.hajar@moe-dl.edu.my',
      className: '5 Ibnu Sina',
      subject: 'Sains',
      purpose: 'Simulasi Digital Sistem Peredaran Darah Manusia',
      numberOfStudents: 28,
      equipmentNeeded: ['30 PC Murid', 'Projektor LCD'],
      status: 'disahkan',
      monthKey: isnin.slice(0, 7),
      createdBy: 'Cikgu Siti Hajar binti Salleh',
      createdAt: `${isnin}T07:45:00Z`
    },
    {
      id: 'ict-b3',
      date: selasa,
      dayName: 'Selasa',
      slotIndex: 6, // 10:45 - 11:15
      startTime: '10:45',
      endTime: '11:15',
      timeSlotLabel: '10:45 - 11:15',
      roomName: 'Makmal ICT',
      teacherName: 'Puan Noraini binti Yusof (PKP)',
      teacherEmail: 'pkp@moe-dl.edu.my',
      className: '6 Ibnu Khaldun',
      subject: 'Matematik',
      purpose: 'Aplikasi Pembelajaran Interaktif Geometri & Ruang',
      numberOfStudents: 30,
      equipmentNeeded: ['30 PC Murid', 'Smart TV 65"'],
      status: 'disahkan',
      monthKey: selasa.slice(0, 7),
      createdBy: 'Puan Noraini binti Yusof',
      createdAt: `${selasa}T08:00:00Z`
    },
    {
      id: 'ict-b4',
      date: rabu,
      dayName: 'Rabu',
      slotIndex: 9, // 12:15 - 12:45
      startTime: '12:15',
      endTime: '12:45',
      timeSlotLabel: '12:15 - 12:45',
      roomName: 'Makmal ICT',
      teacherName: 'Penyelaras ICT Sekolah',
      teacherEmail: 'ict.skmp@moe-dl.edu.my',
      className: 'Guru & Staf',
      subject: 'Penyelenggaraan Berkala & Kemaskini Rangkaian',
      purpose: 'Penyelenggaraan Perkakasan & Pemeriksaan Rangkaian Wi-Fi KPM',
      numberOfStudents: 0,
      status: 'penyelenggaraan',
      maintenanceReason: 'Pemeriksaan rutin kabel LAN & servis sistem operasi komputer murid.',
      monthKey: rabu.slice(0, 7),
      createdBy: 'Pentadbir Sistem',
      createdAt: `${rabu}T07:00:00Z`
    }
  ];
}

// Load bookings from LocalStorage
export function loadIctBookings(): IctBookingRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ICT_BOOKINGS);
    if (!raw) {
      const initial = getInitialIctBookings();
      localStorage.setItem(STORAGE_KEY_ICT_BOOKINGS, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error('Error loading ICT bookings:', err);
  }
  return getInitialIctBookings();
}

// Save bookings to LocalStorage
export function saveIctBookings(bookings: IctBookingRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ICT_BOOKINGS, JSON.stringify(bookings));
  } catch (err) {
    console.error('Error saving ICT bookings:', err);
  }
}
