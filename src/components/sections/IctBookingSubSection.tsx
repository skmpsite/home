import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Laptop,
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Trash2,
  Edit3,
  Plus,
  Printer,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  ShieldAlert,
  Download,
  Info,
  LogIn,
  Layers,
  Sparkles,
  Tv,
  Check,
  X,
  Eye
} from 'lucide-react';
import { IctBookingRecord, SchoolProfile, Staff } from '../../types';
import {
  ICT_TIME_SLOTS,
  ICT_DAYS,
  ICT_ROOMS,
  ICT_CLASSES,
  ICT_SUBJECTS,
  TimeSlotDef,
  formatDateYMD,
  getSchoolWeekDaysForDate,
  loadIctBookings,
  saveIctBookings,
  RECESS_DAY_LETTERS,
  isSlotCurrentTime
} from '../../utils/ictBookingHelpers';

interface IctBookingSubSectionProps {
  isAdmin?: boolean;
  isTeacher?: boolean;
  userRole?: 'admin' | 'guru' | null;
  profile?: SchoolProfile;
  staffList?: Staff[];
  onOpenLogin?: () => void;
}

export const IctBookingSubSection: React.FC<IctBookingSubSectionProps> = ({
  isAdmin = false,
  isTeacher = false,
  userRole = null,
  profile,
  staffList,
  onOpenLogin
}) => {
  const isAuthorized = isAdmin || isTeacher || userRole === 'admin' || userRole === 'guru';

  // Bookings list state
  const [bookings, setBookings] = useState<IctBookingRecord[]>(() => loadIctBookings());

  // Selected Room
  const [selectedRoom, setSelectedRoom] = useState<string>(ICT_ROOMS[0].name);

  // Active view: 'jadual' (weekly slot grid), 'harian' (daily focus), 'rekod' (monthly records & PDF)
  // Default to 'harian' on smartphones/mobile screens (<768px), and 'jadual' on desktop/tablets
  const [activeView, setActiveView] = useState<'jadual' | 'harian' | 'rekod'>(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        return 'harian';
      }
    }
    return 'jadual';
  });

  // Ensure smartphone screens default to 'harian' on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setActiveView('harian');
    }
  }, []);

  // Live time tracker for current slot blinking indicator (updates every 10s)
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Week anchor date (defaults to today)
  const [currentAnchorDate, setCurrentAnchorDate] = useState<string>(() => formatDateYMD(new Date()));

  // Selected Date for daily view or single-day focus
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateYMD(new Date()));

  // Monthly Records Filter (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  });

  // Search & filters for monthly record view
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'disahkan' | 'penyelenggaraan'>('semua');

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<IctBookingRecord | null>(null);
  const [deleteConfirmBooking, setDeleteConfirmBooking] = useState<IctBookingRecord | null>(null);
  const [selectedSlotDetail, setSelectedSlotDetail] = useState<IctBookingRecord | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-hide toast notification
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  // Sync with LocalStorage
  const handleUpdateBookings = (newBookings: IctBookingRecord[]) => {
    setBookings(newBookings);
    saveIctBookings(newBookings);
  };

  // Week days calculation (Ahad - Khamis)
  const weekDays = useMemo(() => {
    return getSchoolWeekDaysForDate(currentAnchorDate);
  }, [currentAnchorDate]);

  // Ensure selectedDate defaults to a school day in current week
  useEffect(() => {
    const datesInWeek = weekDays.map((d) => d.dateStr);
    if (!datesInWeek.includes(selectedDate) && weekDays[0]) {
      setSelectedDate(weekDays[0].dateStr);
    }
  }, [weekDays, selectedDate]);

  // Navigate to previous or next school week
  const handleNavigateWeek = (direction: 'prev' | 'next') => {
    const cur = new Date(currentAnchorDate + 'T00:00:00');
    cur.setDate(cur.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentAnchorDate(formatDateYMD(cur));
  };

  const handleResetToCurrentWeek = () => {
    const today = formatDateYMD(new Date());
    setCurrentAnchorDate(today);
    setSelectedDate(today);
  };

  // Map bookings by date and slotIndex for fast grid lookup
  const bookingGridMap = useMemo(() => {
    const map = new Map<string, IctBookingRecord>();
    bookings.forEach((b) => {
      if (
        (b.roomName === selectedRoom || !b.roomName || b.roomName.includes('ICT') || b.roomName.includes('Makmal')) &&
        b.status !== 'dibatalkan'
      ) {
        const key = `${b.date}_${b.slotIndex}`;
        map.set(key, b);
      }
    });
    return map;
  }, [bookings, selectedRoom]);

  // Filtered monthly bookings for the "Rekod Bulanan" view & PDF export
  const monthlyBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        const matchMonth = b.monthKey === selectedMonth || b.date.startsWith(selectedMonth);
        if (!matchMonth) return false;
        if (statusFilter !== 'semua' && b.status !== statusFilter) return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchQ =
            b.teacherName.toLowerCase().includes(q) ||
            b.className.toLowerCase().includes(q) ||
            b.subject.toLowerCase().includes(q) ||
            b.purpose.toLowerCase().includes(q) ||
            b.dayName.toLowerCase().includes(q);
          if (!matchQ) return false;
        }
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.slotIndex - b.slotIndex);
  }, [bookings, selectedMonth, statusFilter, searchQuery]);

  // Statistics for the selected month
  const monthlyStats = useMemo(() => {
    const currentMonthRecords = bookings.filter(
      (b) => (b.monthKey === selectedMonth || b.date.startsWith(selectedMonth)) && b.status !== 'dibatalkan'
    );
    const confirmedCount = currentMonthRecords.filter((b) => b.status === 'disahkan').length;
    const maintenanceCount = currentMonthRecords.filter((b) => b.status === 'penyelenggaraan').length;
    const totalHours = (confirmedCount * 0.5).toFixed(1); // each slot is 30 mins (0.5 hour)
    
    // Unique teachers
    const teachers = new Set(
      currentMonthRecords
        .filter((b) => b.status === 'disahkan' && b.teacherName)
        .map((b) => b.teacherName.trim())
    );

    return {
      totalSlots: currentMonthRecords.length,
      confirmedCount,
      maintenanceCount,
      totalHours,
      uniqueTeachers: teachers.size
    };
  }, [bookings, selectedMonth]);

  // FORM STATE FOR NEW BOOKING
  const [formDate, setFormDate] = useState<string>(() => weekDays[0]?.dateStr || formatDateYMD(new Date()));
  const [formSlotStart, setFormSlotStart] = useState<number>(0);
  const [formSlotEnd, setFormSlotEnd] = useState<number>(0);
  const [formTeacherName, setFormTeacherName] = useState<string>('');
  const [formClass, setFormClass] = useState<string>(ICT_CLASSES[0]); // 6 Ibnu Sina default
  const [formSubject, setFormSubject] = useState<string>(ICT_SUBJECTS[0]);
  const [formCustomSubject, setFormCustomSubject] = useState<string>('');
  const [formPurpose, setFormPurpose] = useState<string>('');
  const [formStudentsCount, setFormStudentsCount] = useState<number>(30);
  const [formEquipment, setFormEquipment] = useState<string[]>(['30 PC Murid', 'Smart TV 65"']);

  // Pre-fill teacher name if staff list or user info is known
  useEffect(() => {
    if (!formTeacherName) {
      if (isAdmin) {
        setFormTeacherName('Pentadbir / Guru Bertugas');
      } else if (staffList && staffList.length > 0) {
        setFormTeacherName(staffList[0].name);
      }
    }
  }, [isAdmin, staffList, formTeacherName]);

  // Open booking modal for a specific slot clicked on the grid
  const handleOpenBookingForSlot = (dateStr: string, slotIdx: number) => {
    if (!isAuthorized) {
      if (onOpenLogin) {
        onOpenLogin();
      } else {
        alert('Sila log masuk sebagai Guru atau Pentadbir untuk membuat tempahan bilik ICT.');
      }
      return;
    }

    setFormDate(dateStr);
    setFormSlotStart(slotIdx);
    setFormSlotEnd(slotIdx);
    setFormCustomSubject('');
    setFormPurpose('');
    setIsBookingModalOpen(true);
  };

  // Submit New Booking
  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTeacherName.trim()) {
      alert('Sila masukkan nama guru penempah.');
      return;
    }

    const effectiveSubject =
      formSubject === 'Lain-lain'
        ? formCustomSubject.trim() || 'Lain-lain'
        : formSubject;

    if (formSubject === 'Lain-lain' && !formCustomSubject.trim()) {
      alert('Sila nyatakan mata pelajaran atau aktiviti PdP.');
      return;
    }

    if (!formPurpose.trim()) {
      alert('Sila nyatakan tujuan PdP atau aktiviti tempahan.');
      return;
    }

    // Determine Day Name
    const d = new Date(formDate + 'T00:00:00');
    const dayNames = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
    const dayName = dayNames[d.getDay()] || 'Hari Persekolahan';

    // Calculate slots range
    const startIdx = Math.min(formSlotStart, formSlotEnd);
    const endIdx = Math.max(formSlotStart, formSlotEnd);
    const totalSlots = endIdx - startIdx + 1;

    // Check if slot or subsequent slots are already booked
    const newRecordsToAdd: IctBookingRecord[] = [];
    for (let i = 0; i < totalSlots; i++) {
      const currentIdx = startIdx + i;
      if (currentIdx >= ICT_TIME_SLOTS.length) break;

      const slotDef = ICT_TIME_SLOTS[currentIdx];
      const collisionKey = `${formDate}_${currentIdx}`;
      const existing = bookingGridMap.get(collisionKey);
      if (existing) {
        alert(
          `Slot ${slotDef.label} pada tarikh ${formDate} telah pun ditempah oleh ${existing.teacherName} (${existing.status === 'penyelenggaraan' ? 'Penyelenggaraan' : existing.className}). Sila pilih slot lain.`
        );
        return;
      }

      newRecordsToAdd.push({
        id: `ict_${Date.now()}_${i}`,
        date: formDate,
        dayName,
        slotIndex: currentIdx,
        startTime: slotDef.startTime,
        endTime: slotDef.endTime,
        timeSlotLabel: slotDef.label,
        roomName: 'Makmal ICT',
        teacherName: formTeacherName.trim(),
        className: formClass,
        subject: effectiveSubject,
        purpose: formPurpose.trim(),
        numberOfStudents: formStudentsCount,
        equipmentNeeded: formEquipment,
        status: 'disahkan',
        monthKey: formDate.slice(0, 7),
        createdBy: formTeacherName.trim(),
        createdAt: new Date().toISOString()
      });
    }

    const updated = [...bookings, ...newRecordsToAdd];
    handleUpdateBookings(updated);
    setIsBookingModalOpen(false);
    setToastMessage(`Berjaya menempah ${newRecordsToAdd.length} slot Makmal ICT untuk kelas ${formClass}!`);
  };

  // FORM STATE FOR MAINTENANCE (Admin Only)
  const [maintDate, setMaintDate] = useState<string>(() => formatDateYMD(new Date()));
  const [maintSlotChoice, setMaintSlotChoice] = useState<'all' | 'single'>('all');
  const [maintSingleSlot, setMaintSingleSlot] = useState<number>(0);
  const [maintReason, setMaintReason] = useState<string>('Penyelenggaraan Rutin & Servis Komputer Makmal');

  const handleCreateMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Hanya pentadbir yang boleh mengunci slot penyelenggaraan.');
      return;
    }

    const d = new Date(maintDate + 'T00:00:00');
    const dayNames = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
    const dayName = dayNames[d.getDay()] || 'Hari Persekolahan';

    let slotsToBlock: number[] = [];
    if (maintSlotChoice === 'all') {
      slotsToBlock = ICT_TIME_SLOTS.map((s) => s.index);
    } else {
      slotsToBlock = [maintSingleSlot];
    }

    // Replace or add maintenance record for these slots
    const filteredExisting = bookings.filter((b) => {
      if (b.roomName === selectedRoom && b.date === maintDate && slotsToBlock.includes(b.slotIndex)) {
        return false; // Remove colliding booking for maintenance takeover
      }
      return true;
    });

    const newMaintRecords: IctBookingRecord[] = slotsToBlock.map((slotIdx, i) => {
      const slotDef = ICT_TIME_SLOTS[slotIdx];
      return {
        id: `maint_${Date.now()}_${i}`,
        date: maintDate,
        dayName,
        slotIndex: slotIdx,
        startTime: slotDef.startTime,
        endTime: slotDef.endTime,
        timeSlotLabel: slotDef.label,
        roomName: selectedRoom,
        teacherName: 'Penyelaras ICT / Pentadbir',
        className: 'Penyelenggaraan Makmal',
        subject: 'Penyelenggaraan ICT',
        purpose: maintReason.trim() || 'Penyelenggaraan Perkakasan & Rangkaian',
        status: 'penyelenggaraan',
        maintenanceReason: maintReason.trim() || 'Penyelenggaraan Perkakasan & Rangkaian',
        monthKey: maintDate.slice(0, 7),
        createdBy: 'Pentadbir Sistem',
        createdAt: new Date().toISOString()
      };
    });

    const updated = [...filteredExisting, ...newMaintRecords];
    handleUpdateBookings(updated);
    setIsMaintenanceModalOpen(false);
    setToastMessage(`Slot penyelenggaraan berjaya dikunci oleh Admin untuk tarikh ${maintDate}.`);
  };

  // Delete Booking (Admin Only)
  const handleDeleteBooking = (booking: IctBookingRecord) => {
    if (!isAdmin) {
      alert('Hanya Admin dibenarkan memadam atau membatalkan slot tempahan.');
      return;
    }
    const updated = bookings.filter((b) => b.id !== booking.id);
    handleUpdateBookings(updated);
    setDeleteConfirmBooking(null);
    setToastMessage('Slot tempahan telah dipadam oleh Admin.');
  };

  // Save Edited Booking (Admin Only)
  const handleSaveEditedBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingBooking) {
      alert('Hanya Admin dibenarkan mengedit tempahan.');
      return;
    }
    const updated = bookings.map((b) => (b.id === editingBooking.id ? editingBooking : b));
    handleUpdateBookings(updated);
    setEditingBooking(null);
    setToastMessage('Maklumat tempahan berjaya dikemaskini oleh Admin.');
  };

  // Print PDF Trigger
  const handleTriggerPrint = () => {
    window.print();
  };

  // Export CSV
  const handleExportCSV = () => {
    if (monthlyBookings.length === 0) {
      alert('Tiada rekod tempahan untuk bulan ini.');
      return;
    }

    const headers = [
      'Tarikh',
      'Hari',
      'Masa Slot',
      'Bilik',
      'Nama Guru',
      'Kelas',
      'Mata Pelajaran',
      'Tujuan / Aktiviti',
      'Status'
    ];

    const rows = monthlyBookings.map((b) => [
      `"${b.date}"`,
      `"${b.dayName}"`,
      `"${b.timeSlotLabel}"`,
      `"${b.roomName}"`,
      `"${b.teacherName.replace(/"/g, '""')}"`,
      `"${b.className.replace(/"/g, '""')}"`,
      `"${b.subject.replace(/"/g, '""')}"`,
      `"${b.purpose.replace(/"/g, '""')}"`,
      `"${b.status === 'penyelenggaraan' ? 'Penyelenggaraan' : 'Disahkan'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekod_Tempahan_Bilik_ICT_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-white animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 px-4 py-3 rounded-2xl shadow-2xl font-black text-sm flex items-center gap-3 border border-emerald-300 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-slate-950 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Status Bilik ICT & Hak Akses */}
      <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 p-5 sm:p-6 rounded-3xl border border-blue-400/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-yellow-400/20 text-yellow-300 font-black text-[11px] rounded-full border border-yellow-400/40 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-yellow-400" />
                Sistem Tempahan Makmal ICT
              </span>
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 font-bold text-[10px] rounded-md border border-blue-400/30">
                Ahad – Khamis (07:45 AM – 01:15 PM)
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Makmal ICT SK Merbau Pulas</span>
            </h3>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Kemudahan 36 kapasiti murid, 30 unit PC terkini, Smart TV 65", sambungan Rangkaian Digital KPM dan talian berkelajuan tinggi. Slot tempahan dibuka setiap 30 minit untuk kegunaan PdP Guru.
            </p>
          </div>

          {/* User Role Indicator & Quick Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 flex-shrink-0">
            {isAdmin ? (
              <div className="px-3.5 py-2 rounded-2xl bg-amber-500/20 text-yellow-300 border border-amber-400/50 flex items-center gap-2 text-xs font-black shadow-lg">
                <ShieldAlert className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <div>
                  <span className="block leading-tight">Akses Pentadbir (Admin)</span>
                  <span className="text-[10px] text-amber-200/80 font-normal">Kawalan Penuh & Penyelenggaraan</span>
                </div>
              </div>
            ) : isTeacher ? (
              <div className="px-3.5 py-2 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-2 text-xs font-black shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="block leading-tight">Akses Guru (Log Masuk)</span>
                  <span className="text-[10px] text-emerald-200/80 font-normal">Dibenarkan Menempah Slot PdP</span>
                </div>
              </div>
            ) : (
              <div className="px-3 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs text-slate-300">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <span className="block font-bold">Mod Paparan Awam</span>
                  <span className="text-[10px] text-slate-400">Guru & Admin sahaja dibenarkan menempah</span>
                </div>
                {onOpenLogin && (
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="ml-1 p-1.5 sm:px-2.5 sm:py-1 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1 cursor-pointer"
                    title="Log Masuk Guru & Admin"
                    aria-label="Log Masuk"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Log Masuk</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Sub-Navigation Bar: Mode Selection (Jadual Mingguan, Harian, Rekod Bulanan) & Action Buttons */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-md">
        {/* View Switcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveView('jadual')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeView === 'jadual'
                ? 'bg-yellow-400 text-blue-950 shadow-md shadow-yellow-400/20 border border-yellow-300'
                : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Jadual Mingguan (Ahad–Kha)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('harian')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeView === 'harian'
                ? 'bg-yellow-400 text-blue-950 shadow-md shadow-yellow-400/20 border border-yellow-300'
                : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Fokus Harian</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('rekod')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeView === 'rekod'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 border border-emerald-300'
                : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Rekod Bulanan & Cetak PDF {isAdmin ? '(Admin)' : ''}</span>
          </button>
        </div>

        {/* Action Buttons: Tempah Slot & Sekat Penyelenggaraan */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Static Lab Badge (Makmal ICT) */}
          <div className="px-3.5 py-2 bg-slate-900/90 border border-white/20 rounded-xl text-xs font-black text-white flex items-center gap-1.5 shadow-sm">
            <Laptop className="w-3.5 h-3.5 text-yellow-400" />
            <span>Makmal ICT</span>
          </div>

          {/* New Booking Button */}
          <button
            type="button"
            onClick={() => {
              if (!isAuthorized) {
                if (onOpenLogin) onOpenLogin();
                else alert('Sila log masuk sebagai Guru atau Pentadbir untuk membuat tempahan.');
                return;
              }
              setFormDate(selectedDate || weekDays[0]?.dateStr || formatDateYMD(new Date()));
              setFormSlotStart(0);
              setFormSlotEnd(0);
              setFormCustomSubject('');
              setIsBookingModalOpen(true);
            }}
            className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 rounded-xl text-xs font-black shadow-md shadow-yellow-400/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tempah Slot Bilik ICT</span>
          </button>

          {/* Admin Maintenance Lock Button */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setMaintDate(selectedDate || formatDateYMD(new Date()));
                setIsMaintenanceModalOpen(true);
              }}
              className="px-3 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold border border-rose-400/40 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Kunci slot untuk penyelenggaraan makmal / acara rasmi (Admin Sahaja)"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Sekat Penyelenggaraan</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: JADUAL MINGGUAN (Ahad - Khamis Grid with 11 Half-Hour Slots) */}
      {activeView === 'jadual' && (
        <div className="space-y-4">
          {/* Week Navigation Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleNavigateWeek('prev')}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10 transition"
                title="Minggu Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleResetToCurrentWeek}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-yellow-300 border border-white/10 transition"
              >
                Minggu Semasa
              </button>

              <button
                type="button"
                onClick={() => handleNavigateWeek('next')}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10 transition"
                title="Minggu Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="text-xs font-bold text-slate-300 ml-2">
                <span>
                  {weekDays[0]?.formattedDisplay} – {weekDays[4]?.formattedDisplay}
                </span>
              </div>
            </div>

            {/* Quick Legend */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-400/40" />
                <span className="text-emerald-300">Sedia Ditempah</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-blue-500/40 border border-blue-400" />
                <span className="text-blue-200">Ditempah (PdP)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-orange-500/40 border border-orange-400" />
                <span className="text-orange-300">Waktu Rehat (R-E-H-A-T)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500/40 border border-rose-400" />
                <span className="text-rose-300">Penyelenggaraan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-400 border border-emerald-300 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="text-emerald-300">Slot Semasa (Berkelip Hijau)</span>
              </div>
            </div>
          </div>

          {/* Matrix Grid: Fit-to-screen table (no horizontal scrollbar needed, responsive columns) */}
          <div className="w-full rounded-2xl border border-white/10 shadow-2xl bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <table className="w-full text-left border-collapse table-fixed select-none">
              <colgroup>
                <col className="w-[13%] sm:w-[12%]" />
                <col className="w-[17.4%] sm:w-[17.6%]" />
                <col className="w-[17.4%] sm:w-[17.6%]" />
                <col className="w-[17.4%] sm:w-[17.6%]" />
                <col className="w-[17.4%] sm:w-[17.6%]" />
                <col className="w-[17.4%] sm:w-[17.6%]" />
              </colgroup>
              <thead>
                <tr className="bg-slate-950/85 border-b border-white/10 text-xs font-black uppercase text-slate-300">
                  <th className="p-1.5 sm:p-2.5 border-r border-white/10 text-center">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 text-yellow-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] sm:text-xs">Masa</span>
                    </div>
                  </th>
                  {weekDays.map((d) => {
                    const isToday = d.dateStr === formatDateYMD(new Date());
                    return (
                      <th
                        key={d.dateStr}
                        className={`p-1.5 sm:p-2.5 border-r border-white/10 text-center transition ${
                          isToday ? 'bg-yellow-500/15 text-yellow-300' : 'text-slate-200'
                        }`}
                      >
                        <div className="font-extrabold text-xs sm:text-sm truncate">{d.dayName}</div>
                        <div className="text-[9px] sm:text-[11px] opacity-80 font-normal truncate">
                          {d.dayNumber} {d.monthLabel} {isToday && '• Hari Ini'}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {ICT_TIME_SLOTS.map((slot) => {
                  return (
                    <tr key={slot.index} className="hover:bg-white/[0.02] transition">
                      {/* Slot Time Label Column */}
                      <td className="p-1 sm:p-2 text-center font-bold text-slate-300 bg-slate-950/50 border-r border-white/10">
                        <div className="flex flex-col items-center justify-center leading-tight">
                          <span className="text-[10px] sm:text-xs font-black text-slate-100">
                            {slot.startTime}
                          </span>
                          <span className="text-[7.5px] sm:text-[9px] text-slate-400 font-medium my-0.5">
                            hingga
                          </span>
                          <span className="text-[10px] sm:text-xs font-black text-slate-100">
                            {slot.endTime}
                          </span>
                        </div>
                        {slot.isRecess && (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-orange-500/25 text-orange-300 border border-orange-400/40 text-[8px] sm:text-[9px] font-black uppercase mt-1">
                            Rehat
                          </span>
                        )}
                      </td>

                      {/* 5 Day Cells: Ahad - Khamis */}
                      {weekDays.map((day) => {
                        const cellKey = `${day.dateStr}_${slot.index}`;
                        const booking = bookingGridMap.get(cellKey);
                        const isCurrent = isSlotCurrentTime(day.dateStr, slot.startTime, slot.endTime, currentTime);
                        const recessLetter = RECESS_DAY_LETTERS[day.dayName] || 'R';

                        // SLOT REHAT JINGGA (Spelling R-E-H-A-T across Ahad-Khamis)
                        if (slot.isRecess) {
                          if (booking) {
                            return (
                              <td
                                key={day.dateStr}
                                className={`p-1 sm:p-1.5 border-r border-white/10 relative transition group bg-orange-950/35 ${
                                  isCurrent ? 'ring-2 ring-emerald-400 bg-emerald-500/20 border-emerald-400 animate-pulse z-10' : ''
                                }`}
                              >
                                <div
                                  onClick={() => setSelectedSlotDetail(booking)}
                                  className={`w-full h-full min-h-[58px] sm:min-h-[66px] p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-orange-500/60 bg-gradient-to-br from-amber-600/25 via-orange-600/30 to-amber-700/25 hover:border-yellow-300 flex flex-col justify-between shadow-sm relative overflow-hidden cursor-pointer active:scale-95 transition ${
                                    isCurrent ? 'ring-2 ring-emerald-400 border-emerald-400 animate-pulse' : ''
                                  }`}
                                  title="Klik untuk lihat maklumat penuh tempahan"
                                >
                                  {isCurrent && (
                                    <div className="absolute top-1 right-1 z-20 flex items-center pointer-events-none">
                                      <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                      </span>
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-[8px] sm:text-[9px] font-black uppercase px-1 py-0.2 rounded bg-orange-500/40 text-orange-200 border border-orange-400/50 truncate">
                                        {recessLetter} • {booking.className}
                                      </span>
                                      {isAdmin ? (
                                        <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingBooking(booking);
                                            }}
                                            className="p-0.5 hover:bg-yellow-400 hover:text-blue-950 rounded transition text-slate-300"
                                            title="Edit Tempahan"
                                          >
                                            <Edit3 className="w-2.5 h-2.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setDeleteConfirmBooking(booking);
                                            }}
                                            className="p-0.5 hover:bg-rose-600 hover:text-white rounded transition text-rose-300"
                                            title="Padam Tempahan"
                                          >
                                            <Trash2 className="w-2.5 h-2.5" />
                                          </button>
                                        </div>
                                      ) : (
                                        <span className="text-[8px] text-orange-200/70 group-hover:text-orange-100 flex items-center gap-0.5">
                                          <Eye className="w-2.5 h-2.5" />
                                        </span>
                                      )}
                                    </div>
                                    <div className="mt-0.5 font-bold text-white text-[10px] sm:text-[11px] truncate">
                                      {booking.teacherName}
                                    </div>
                                    <div className="text-[8px] sm:text-[9px] text-orange-200 truncate font-semibold">
                                      {booking.subject}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            );
                          }

                          // Unbooked Recess slot: prominent orange background with letter R, E, H, A, T
                          return (
                            <td
                              key={day.dateStr}
                              className={`p-1 sm:p-1.5 border-r border-white/10 relative transition group bg-orange-950/25 hover:bg-orange-900/35 ${
                                isCurrent ? 'ring-2 ring-emerald-400 bg-emerald-500/20 border-emerald-400 animate-pulse z-10' : ''
                              }`}
                            >
                              <div
                                onClick={() => handleOpenBookingForSlot(day.dateStr, slot.index)}
                                className={`w-full h-full min-h-[58px] sm:min-h-[66px] rounded-lg sm:rounded-xl border border-orange-500/60 bg-gradient-to-br from-amber-600/30 via-orange-600/35 to-amber-700/30 hover:from-amber-600/45 hover:to-orange-600/50 p-1 flex flex-col items-center justify-center text-center transition cursor-pointer shadow-sm relative overflow-hidden ${
                                  isCurrent ? 'ring-2 ring-emerald-400 border-emerald-400 animate-pulse' : ''
                                }`}
                                title={`Waktu Rehat (${slot.label}) - ${day.dayName} [Huruf ${recessLetter}]`}
                              >
                                {isCurrent && (
                                  <div className="absolute top-1 right-1 z-20 flex items-center pointer-events-none">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                    </span>
                                  </div>
                                )}
                                <span className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow-[0_2px_4px_rgba(245,158,11,0.6)] leading-none tracking-wider">
                                  {recessLetter}
                                </span>
                                <span className="text-[8px] sm:text-[9px] font-black text-orange-100 uppercase tracking-widest mt-0.5">
                                  REHAT
                                </span>
                              </div>
                            </td>
                          );
                        }

                        // STANDARD NON-RECESS BOOKED SLOT
                        if (booking) {
                          const isMaint = booking.status === 'penyelenggaraan';
                          return (
                            <td
                              key={day.dateStr}
                              className={`p-1 sm:p-1.5 border-r border-white/10 relative transition group ${
                                isMaint
                                  ? 'bg-rose-950/40 hover:bg-rose-900/50 border-rose-500/20'
                                  : 'bg-blue-950/40 hover:bg-blue-900/50 border-blue-500/20'
                              } ${
                                isCurrent ? 'ring-2 ring-emerald-400 bg-emerald-500/20 border-emerald-400 animate-pulse z-10' : ''
                              }`}
                            >
                              <div
                                onClick={() => setSelectedSlotDetail(booking)}
                                className={`p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-white/10 hover:border-yellow-300/80 flex flex-col justify-between h-full min-h-[58px] sm:min-h-[66px] shadow-sm relative overflow-hidden cursor-pointer active:scale-95 transition ${
                                  isCurrent ? 'ring-2 ring-emerald-400 border-emerald-400 animate-pulse' : ''
                                }`}
                                title="Klik untuk lihat paparan penuh tempahan"
                              >
                                {isCurrent && (
                                  <div className="absolute top-1 right-1 z-20 flex items-center pointer-events-none">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                    </span>
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span
                                      className={`text-[8px] sm:text-[9px] font-black uppercase px-1 py-0.2 rounded truncate max-w-[70%] ${
                                        isMaint
                                          ? 'bg-rose-500/30 text-rose-300 border border-rose-400/40'
                                          : 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                                      }`}
                                    >
                                      {isMaint ? 'Penyelenggaraan' : booking.className}
                                    </span>

                                    {/* Action Buttons for Admin or Info indicator */}
                                    {isAdmin ? (
                                      <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingBooking(booking);
                                          }}
                                          className="p-0.5 hover:bg-yellow-400 hover:text-blue-950 rounded transition text-slate-300"
                                          title="Edit Tempahan (Admin)"
                                        >
                                          <Edit3 className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteConfirmBooking(booking);
                                          }}
                                          className="p-0.5 hover:bg-rose-600 hover:text-white rounded transition text-rose-300"
                                          title="Padam Tempahan (Admin)"
                                        >
                                          <Trash2 className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-[8px] text-blue-300/80 group-hover:text-yellow-300 flex items-center gap-0.5">
                                        <Eye className="w-2.5 h-2.5" />
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-0.5 font-bold text-white text-[10px] sm:text-[11px] truncate">
                                    {isMaint ? booking.maintenanceReason || 'Penyelenggaraan ICT' : booking.teacherName}
                                  </div>

                                  {!isMaint && (
                                    <div className="text-[8px] sm:text-[9px] text-blue-200 truncate font-semibold">
                                      {booking.subject}
                                    </div>
                                  )}
                                </div>

                                <div className="text-[8px] sm:text-[9px] text-slate-400 truncate mt-0.5 flex items-center justify-between">
                                  <span className="truncate">{booking.purpose}</span>
                                  <span className="text-[7.5px] text-yellow-300/90 font-bold ml-1 shrink-0 opacity-70 group-hover:opacity-100">
                                    Lihat &raquo;
                                  </span>
                                </div>
                              </div>
                            </td>
                          );
                        }

                        // EMPTY AVAILABLE SLOT (Flashing Green when isCurrent is true)
                        return (
                          <td
                            key={day.dateStr}
                            className={`p-1 sm:p-1.5 border-r border-white/10 relative transition group hover:bg-emerald-500/10 ${
                              isCurrent ? 'ring-2 ring-emerald-400 bg-emerald-500/20 border-emerald-400 animate-pulse z-10' : ''
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleOpenBookingForSlot(day.dateStr, slot.index)}
                              className={`w-full h-full min-h-[58px] sm:min-h-[66px] rounded-lg sm:rounded-xl border border-dashed border-white/10 hover:border-emerald-400/50 p-1 flex flex-col items-center justify-center text-center transition group-hover:bg-emerald-500/5 cursor-pointer relative overflow-hidden ${
                                isCurrent ? 'ring-2 ring-emerald-400 border-emerald-400 animate-pulse' : ''
                              }`}
                              title={`Klik untuk menempah slot ${slot.label} pada ${day.dayName} (${day.dateStr})`}
                            >
                              {isCurrent && (
                                <div className="absolute top-1 right-1 z-20 flex items-center pointer-events-none">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                                  </span>
                                </div>
                              )}
                              <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 group-hover:text-emerald-300 transition flex items-center gap-1">
                                <Plus className="w-3 h-3 text-slate-400 group-hover:text-emerald-400 transition" />
                                <span>{isAuthorized ? 'Tempah' : 'Kosong'}</span>
                              </span>
                              <span className="text-[7.5px] sm:text-[8.5px] text-slate-500 group-hover:text-slate-400 transition mt-0.5">
                                30 minit
                              </span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: FOKUS HARIAN (Single Day View with full detail cards) */}
      {activeView === 'harian' && (
        <div className="space-y-4">
          {/* Day Selector (Ahad - Khamis) */}
          <div className="grid grid-cols-5 gap-2">
            {weekDays.map((d) => {
              const isSelected = selectedDate === d.dateStr;
              return (
                <button
                  key={d.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`p-3 rounded-2xl text-center transition flex flex-col items-center justify-center border cursor-pointer ${
                    isSelected
                      ? 'bg-yellow-400 text-blue-950 font-black border-yellow-300 shadow-lg shadow-yellow-400/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  <span className="text-xs uppercase">{d.dayName}</span>
                  <span className="text-lg font-black">{d.dayNumber}</span>
                  <span className="text-[10px] opacity-80">{d.monthLabel}</span>
                </button>
              );
            })}
          </div>

          {/* List of Slots for Selected Day */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {ICT_TIME_SLOTS.map((slot) => {
              const cellKey = `${selectedDate}_${slot.index}`;
              const booking = bookingGridMap.get(cellKey);
              const isCurrent = isSlotCurrentTime(selectedDate, slot.startTime, slot.endTime, currentTime);
              const selectedDayObj = weekDays.find((d) => d.dateStr === selectedDate);
              const recessLetter = RECESS_DAY_LETTERS[selectedDayObj?.dayName || 'Ahad'] || 'R';

              return (
                <div
                  key={slot.index}
                  className={`p-4 rounded-2xl border transition shadow-md flex flex-col justify-between relative overflow-hidden ${
                    isCurrent
                      ? 'ring-2 ring-emerald-400 border-emerald-400 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.45)] animate-pulse'
                      : ''
                  } ${
                    slot.isRecess
                      ? 'bg-gradient-to-br from-amber-950/40 via-orange-950/45 to-amber-950/30 border-orange-500/60'
                      : booking
                      ? booking.status === 'penyelenggaraan'
                        ? 'bg-rose-950/40 border-rose-500/40'
                        : 'bg-blue-950/40 border-blue-500/40'
                      : 'bg-white/5 border-white/10 hover:border-emerald-400/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-yellow-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-yellow-400" />
                          {slot.label}
                        </span>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black uppercase tracking-wider animate-pulse shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                            Slot Semasa
                          </span>
                        )}
                      </div>

                      {slot.isRecess ? (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-orange-500/30 text-orange-200 border border-orange-400/50">
                          Rehat (Huruf {recessLetter})
                        </span>
                      ) : booking ? (
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            booking.status === 'penyelenggaraan'
                              ? 'bg-rose-500/30 text-rose-300 border border-rose-400/40'
                              : 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                          }`}
                        >
                          {booking.status === 'penyelenggaraan' ? 'Penyelenggaraan' : 'Disahkan'}
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          Sedia Ditempah
                        </span>
                      )}
                    </div>

                    {/* Special Recess Banner for Slot Rehat */}
                    {slot.isRecess && (
                      <div className="my-3 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-orange-400/40 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                          {recessLetter}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-black text-orange-200 uppercase tracking-wider">
                            Waktu Rehat Rasmi (Huruf {recessLetter})
                          </div>
                          <div className="text-[10px] text-orange-300/80 font-medium truncate">
                            Jadual rehat sekolah • {slot.label}
                          </div>
                        </div>
                      </div>
                    )}

                    {booking ? (
                      <div className="mt-3 space-y-1.5">
                        <div className="font-extrabold text-sm text-white">
                          {booking.status === 'penyelenggaraan' ? 'Penutupan Makmal' : booking.teacherName}
                        </div>
                        {booking.status !== 'penyelenggaraan' && (
                          <div className="flex items-center gap-2 text-xs text-blue-200">
                            <span className="font-bold">{booking.className}</span>
                            <span>•</span>
                            <span className="truncate">{booking.subject}</span>
                          </div>
                        )}
                        <p className="text-xs text-slate-300 leading-relaxed pt-1">
                          {booking.purpose}
                        </p>

                        {booking.equipmentNeeded && booking.equipmentNeeded.length > 0 && (
                          <div className="pt-2 flex flex-wrap gap-1">
                            {booking.equipmentNeeded.map((eq, i) => (
                              <span
                                key={i}
                                className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300"
                              >
                                {eq}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 text-center py-4 space-y-2">
                        <p className="text-xs text-slate-400">
                          {slot.isRecess
                            ? 'Waktu rehat sekolah (tersedia untuk tempahan guru jika perlu).'
                            : 'Slot ini belum mempunyai sebarang tempahan.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenBookingForSlot(selectedDate, slot.index)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition shadow-md inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tempah Slot Ini</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Booking Actions for Guru & Admin */}
                  {booking && (
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSlotDetail(booking)}
                        className="px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1 border border-blue-400/30 cursor-pointer active:scale-95"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Maklumat Penuh</span>
                      </button>

                      {isAdmin && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingBooking(booking)}
                            className="px-2.5 py-1 bg-white/5 hover:bg-yellow-400 hover:text-blue-950 rounded-lg text-xs font-bold text-slate-300 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmBooking(booking)}
                            className="px-2.5 py-1 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Padam</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: REKOD BULANAN & CETAKAN PDF (Admin Semak, Muat Turun & Cetak) */}
      {activeView === 'rekod' && (
        <div className="space-y-6">
          {/* Month Selector & Controls Bar */}
          <div className="p-4 sm:p-5 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-yellow-400" />
                  <span>Semakan Rekod Tempahan & Laporan Bulanan</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Semak log tempahan mengikut bulan dan jana dokumen rasmi PDF untuk pengesahan pihak pentadbiran.
                </p>
              </div>

              {/* Action Buttons: Cetak PDF & Muat Turun CSV */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrintPreview(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Pratonton & Cetak PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs rounded-xl border border-white/10 flex items-center gap-1.5 transition cursor-pointer"
                  title="Muat turun fail CSV untuk Microsoft Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Eksport CSV</span>
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
              {/* Month Picker */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Pilih Bulan & Tahun:</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Status Tempahan:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/20 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="semua">Semua Status (PdP & Penyelenggaraan)</option>
                  <option value="disahkan">Hanya Tempahan Disahkan (PdP)</option>
                  <option value="penyelenggaraan">Hanya Penyelenggaraan</option>
                </select>
              </div>

              {/* Search Box */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Carian Guru / Kelas / Subjek:</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Contoh: Sains, 6 Inovatif, Cikgu Ahmad..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/20 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Summary Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Jumlah Slot Ditempah</span>
              <span className="text-2xl font-black text-yellow-400 mt-1 block">{monthlyStats.totalSlots}</span>
              <span className="text-[10px] text-slate-400">Bulan {selectedMonth}</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Jumlah Jam Penggunaan</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">{monthlyStats.totalHours} Jam</span>
              <span className="text-[10px] text-slate-400">Waktu PdP Makmal</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Guru Yang Terlibat</span>
              <span className="text-2xl font-black text-blue-400 mt-1 block">{monthlyStats.uniqueTeachers} Orang</span>
              <span className="text-[10px] text-slate-400">Pendidik SKMP</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Slot Penyelenggaraan</span>
              <span className="text-2xl font-black text-rose-400 mt-1 block">{monthlyStats.maintenanceCount} Slot</span>
              <span className="text-[10px] text-slate-400">Servis & Pengujian</span>
            </div>
          </div>

          {/* Monthly Bookings Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-xl bg-slate-900/80 backdrop-blur-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-white/10 text-[11px] font-black uppercase text-slate-300">
                  <th className="p-3">Tarikh & Hari</th>
                  <th className="p-3">Masa Slot</th>
                  <th className="p-3">Guru Penempah</th>
                  <th className="p-3">Kelas & Subjek</th>
                  <th className="p-3">Tujuan / PdP</th>
                  <th className="p-3 text-center">Status</th>
                  {isAdmin && <th className="p-3 text-right">Tindakan Admin</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {monthlyBookings.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="p-8 text-center text-slate-400">
                      Tiada rekod tempahan ditemui bagi bulan {selectedMonth}.
                    </td>
                  </tr>
                ) : (
                  monthlyBookings.map((b) => {
                    const isMaint = b.status === 'penyelenggaraan';
                    return (
                      <tr key={b.id} className="hover:bg-white/[0.02] transition">
                        <td className="p-3 font-bold text-white whitespace-nowrap">
                          <div>{b.date}</div>
                          <div className="text-[10px] text-yellow-400 font-semibold">{b.dayName}</div>
                        </td>
                        <td className="p-3 font-semibold text-slate-200 whitespace-nowrap">
                          {b.timeSlotLabel}
                        </td>
                        <td className="p-3 font-extrabold text-white">
                          {isMaint ? 'Penyelarasan ICT' : b.teacherName}
                        </td>
                        <td className="p-3">
                          {isMaint ? (
                            <span className="text-slate-400">-</span>
                          ) : (
                            <div>
                              <span className="font-bold text-yellow-300">{b.className}</span>
                              <div className="text-[10px] text-slate-300 truncate max-w-[150px]">
                                {b.subject}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-slate-300 max-w-[200px] truncate leading-tight">
                          {b.purpose}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <span
                            className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded ${
                              isMaint
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                            }`}
                          >
                            {isMaint ? 'Penyelenggaraan' : 'Disahkan'}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingBooking(b)}
                                className="p-1.5 hover:bg-yellow-400 hover:text-blue-950 rounded-lg text-slate-300 transition"
                                title="Edit Tempahan"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmBooking(b)}
                                className="p-1.5 hover:bg-rose-600 hover:text-white rounded-lg text-rose-300 transition"
                                title="Padam Tempahan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: BORANG TEMPAHAN SLOT BILIK ICT (Guru & Admin)                    */}
      {/* ========================================================================= */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-yellow-400 text-blue-950 rounded-xl">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Borang Tempahan Makmal ICT</h3>
                  <p className="text-[11px] text-slate-400">Pengesahan slot PdP Makmal ICT SK Merbau Pulas</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
              {/* Bilik & Tarikh */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Bilik / Makmal:</label>
                  <div className="w-full px-3 py-2 bg-slate-950/90 border border-white/20 rounded-xl text-white font-bold flex items-center gap-2 shadow-inner">
                    <Laptop className="w-4 h-4 text-yellow-400" />
                    <span>Makmal ICT</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Tarikh Penggunaan:</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-xl text-white font-bold"
                    required
                  />
                </div>
              </div>

              {/* Slot Mula & Slot Tamat */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Slot Mula:</label>
                  <select
                    value={formSlotStart}
                    onChange={(e) => {
                      const newStart = Number(e.target.value);
                      setFormSlotStart(newStart);
                      if (formSlotEnd < newStart) {
                        setFormSlotEnd(newStart);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-xl text-white font-bold"
                  >
                    {ICT_TIME_SLOTS.map((s) => (
                      <option key={s.index} value={s.index}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Slot Tamat:</label>
                  <select
                    value={formSlotEnd}
                    onChange={(e) => setFormSlotEnd(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-xl text-white font-bold"
                  >
                    {ICT_TIME_SLOTS.filter((s) => s.index >= formSlotStart).map((s) => (
                      <option key={s.index} value={s.index}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nama Guru Penempah */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nama Guru Penempah:</label>
                <input
                  type="text"
                  value={formTeacherName}
                  onChange={(e) => setFormTeacherName(e.target.value)}
                  placeholder="Nama Penuh Guru"
                  className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-xl text-white font-bold"
                  required
                />
              </div>

              {/* Kelas & Subjek */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Kelas / Tahun:</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-xl text-white font-bold"
                  >
                    {ICT_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Mata Pelajaran:</label>
                  <select
                    value={formSubject}
                    onChange={(e) => {
                      setFormSubject(e.target.value);
                      if (e.target.value !== 'Lain-lain') {
                        setFormCustomSubject('');
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-xl text-white font-bold"
                  >
                    {ICT_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pilihan Lain-lain: Kotak teks untuk mengisi mata pelajaran / aktiviti */}
              {formSubject === 'Lain-lain' && (
                <div className="p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-2xl animate-fadeIn space-y-1">
                  <label className="block font-bold text-yellow-300 text-xs">
                    Nyatakan Mata Pelajaran / Aktiviti:
                  </label>
                  <input
                    type="text"
                    value={formCustomSubject}
                    onChange={(e) => setFormCustomSubject(e.target.value)}
                    placeholder="Sila masukkan mata pelajaran atau aktiviti PdP..."
                    className="w-full px-3 py-2 bg-slate-950 border border-yellow-400/50 rounded-xl text-white font-bold placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>
              )}

              {/* Tajuk / Tujuan PdP */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Tajuk / Aktiviti Pembelajaran PdP:</label>
                <textarea
                  rows={2}
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  placeholder="Contoh: Amali Pengekodan Scratch, Simulasi Sains, Kemahiran Canva Digital..."
                  className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-xl text-white"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black shadow-lg shadow-yellow-400/30 transition active:scale-95"
                >
                  Sahkan Tempahan Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SEKAT PENYELENGGARAAN OLEH ADMIN                                 */}
      {/* ========================================================================= */}
      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-600 text-white rounded-xl">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Sekat Penyelenggaraan Makmal</h3>
                  <p className="text-[11px] text-rose-300">Tindakan Khas Pentadbir / Penyelaras ICT</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMaintenanceModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMaintenance} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Tarikh Penutupan / Penyelenggaraan:</label>
                <input
                  type="date"
                  value={maintDate}
                  onChange={(e) => setMaintDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-xl text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Pilihan Slot:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMaintSlotChoice('all')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center cursor-pointer ${
                      maintSlotChoice === 'all'
                        ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                        : 'bg-white/5 text-slate-300 border-white/10'
                    }`}
                  >
                    Semua Slot (Sepanjang Hari)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaintSlotChoice('single')}
                    className={`p-2.5 rounded-xl font-bold border transition text-center cursor-pointer ${
                      maintSlotChoice === 'single'
                        ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                        : 'bg-white/5 text-slate-300 border-white/10'
                    }`}
                  >
                    Satu Slot Spesifik
                  </button>
                </div>
              </div>

              {maintSlotChoice === 'single' && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Pilih Slot Masa:</label>
                  <select
                    value={maintSingleSlot}
                    onChange={(e) => setMaintSingleSlot(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-xl text-white font-bold"
                  >
                    {ICT_TIME_SLOTS.map((s) => (
                      <option key={s.index} value={s.index}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-300 mb-1">Sebab Penutupan / Penyelenggaraan:</label>
                <textarea
                  rows={3}
                  value={maintReason}
                  onChange={(e) => setMaintReason(e.target.value)}
                  placeholder="Contoh: Penyelenggaraan berjadual rangkaian LAN KPM, Servis PC murid, Peperiksaan Bertulis UASA..."
                  className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-xl text-white"
                  required
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMaintenanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black shadow-lg shadow-rose-600/30 transition"
                >
                  Kunci Slot Penyelenggaraan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT TEMPAHAN OLEH ADMIN                                         */}
      {/* ========================================================================= */}
      {editingBooking && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-yellow-400/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-yellow-400 text-blue-950 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Kemaskini Tempahan (Admin)</h3>
                  <p className="text-[11px] text-yellow-300">Pindaan Slot & Maklumat oleh Pentadbir</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingBooking(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedBooking} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Tarikh:</label>
                  <input
                    type="date"
                    value={editingBooking.date}
                    onChange={(e) => setEditingBooking({ ...editingBooking, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-xl text-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Slot Masa:</label>
                  <select
                    value={editingBooking.slotIndex}
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      const sDef = ICT_TIME_SLOTS[idx];
                      setEditingBooking({
                        ...editingBooking,
                        slotIndex: idx,
                        startTime: sDef.startTime,
                        endTime: sDef.endTime,
                        timeSlotLabel: sDef.label
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-xl text-white font-bold"
                  >
                    {ICT_TIME_SLOTS.map((s) => (
                      <option key={s.index} value={s.index}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Nama Guru / Pentadbir:</label>
                <input
                  type="text"
                  value={editingBooking.teacherName}
                  onChange={(e) => setEditingBooking({ ...editingBooking, teacherName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-xl text-white font-bold"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Kelas:</label>
                  <select
                    value={editingBooking.className}
                    onChange={(e) => setEditingBooking({ ...editingBooking, className: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-xl text-white font-bold"
                  >
                    {ICT_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Mata Pelajaran:</label>
                  <select
                    value={editingBooking.subject}
                    onChange={(e) => setEditingBooking({ ...editingBooking, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-xl text-white font-bold"
                  >
                    {ICT_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Tujuan / Catatan PdP:</label>
                <textarea
                  rows={2}
                  value={editingBooking.purpose}
                  onChange={(e) => setEditingBooking({ ...editingBooking, purpose: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-xl text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Status Tempahan:</label>
                <select
                  value={editingBooking.status}
                  onChange={(e) =>
                    setEditingBooking({
                      ...editingBooking,
                      status: e.target.value as any
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-white/20 rounded-xl text-white font-bold"
                >
                  <option value="disahkan">Disahkan (Aktif PdP)</option>
                  <option value="penyelenggaraan">Penyelenggaraan (Tutup Makmal)</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black shadow-lg transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MAKLUMAT PENUH TEMPAHAN BILIK ICT (POPUP SMARTPHONE & DESKTOP)     */}
      {/* ========================================================================= */}
      {selectedSlotDetail && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-blue-400/40 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-400 shadow-md">
                  <Laptop className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                    Maklumat Penuh Tempahan
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {selectedSlotDetail.roomName || selectedRoom}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlotDetail(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Timing Banner */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                selectedSlotDetail.status === 'penyelenggaraan'
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  : 'bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border-blue-400/30 text-blue-200'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-white">
                  <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{selectedSlotDetail.dayName}, {selectedSlotDetail.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-yellow-300 font-bold">
                  <Clock className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{selectedSlotDetail.timeSlotLabel} (Slot {selectedSlotDetail.slotIndex + 1})</span>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                  selectedSlotDetail.status === 'penyelenggaraan'
                    ? 'bg-rose-500/30 text-rose-300 border-rose-400/50'
                    : 'bg-emerald-500/30 text-emerald-300 border-emerald-400/50'
                }`}
              >
                {selectedSlotDetail.status === 'penyelenggaraan' ? 'Penyelenggaraan' : 'Disahkan Aktif'}
              </span>
            </div>

            {/* Booking Details Grid */}
            <div className="space-y-3 text-xs">
              {/* Teacher Info */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Guru Penempah
                </span>
                <div className="text-sm font-black text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{selectedSlotDetail.teacherName}</span>
                </div>
              </div>

              {/* Class & Subject */}
              {selectedSlotDetail.status !== 'penyelenggaraan' && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Kelas
                    </span>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span>{selectedSlotDetail.className}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Mata Pelajaran
                    </span>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{selectedSlotDetail.subject}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Purpose & Activities */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tujuan / Aktiviti Pembelajaran PdP
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                  {selectedSlotDetail.purpose ||
                    (selectedSlotDetail.status === 'penyelenggaraan'
                      ? selectedSlotDetail.maintenanceReason
                      : 'Tiada catatan khusus.')}
                </p>
              </div>

              {/* Equipment Needed if any */}
              {selectedSlotDetail.equipmentNeeded && selectedSlotDetail.equipmentNeeded.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Peralatan Diperlukan
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSlotDetail.equipmentNeeded.map((eq, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Facilities / Equipment info */}
              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-400/20 space-y-1.5">
                <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block flex items-center gap-1">
                  <Info className="w-3 h-3" /> Kemudahan Makmal & Kelengkapan
                </span>
                <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-300">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">36 Kapasiti Murid</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">30 Unit PC</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">Smart TV 65"</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">Talian Digital KPM</span>
                </div>
              </div>
            </div>

            {/* Actions / Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const b = selectedSlotDetail;
                        setSelectedSlotDetail(null);
                        setEditingBooking(b);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs transition shadow flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit (Admin)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const b = selectedSlotDetail;
                        setSelectedSlotDetail(null);
                        setDeleteConfirmBooking(b);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Padam</span>
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedSlotDetail(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PENGESAHAN PADAM TEMPAHAN (ADMIN ONLY)                           */}
      {/* ========================================================================= */}
      {deleteConfirmBooking && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-white text-base">Padam Slot Tempahan?</h4>
              <p className="text-xs text-slate-300">
                Adakah anda pasti ingin memadam tempahan pada tarikh{' '}
                <strong className="text-white">{deleteConfirmBooking.date}</strong> bagi slot{' '}
                <strong className="text-yellow-300">{deleteConfirmBooking.timeSlotLabel}</strong>?
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmBooking(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteBooking(deleteConfirmBooking)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition shadow-lg shadow-rose-600/30"
              >
                Ya, Padam Tempahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: PRATONTON & CETAK DOKUMEN RASMI PDF                              */}
      {/* ========================================================================= */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[96vh] flex flex-col">
            {/* Header with Print & Close Buttons */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-yellow-400" />
                <h3 className="font-black text-base text-white">Pratonton Cetakan Dokumen PDF Rasmi</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTriggerPrint}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintPreview(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Body (A4 Styled White Container) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-white text-slate-900 rounded-2xl shadow-inner print:p-0 print:m-0 print:shadow-none font-sans">
              {/* Official Letterhead Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-900 text-white font-black rounded-xl flex items-center justify-center text-center p-2 text-xs flex-shrink-0 shadow">
                  SKMP KBA5012
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="font-black text-sm sm:text-base tracking-wide uppercase text-slate-900">
                    SEKOLAH KEBANGSAAN MERBAU PULAS
                  </h2>
                  <p className="text-xs text-slate-700 font-semibold">
                    09300 KUALA KETIL, KEDAH DARUL AMAN • KOD SEKOLAH: KBA5012
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Telefon: 04-4161234 • Emel Rasmi: kba5012@moe.edu.my
                  </p>
                  <div className="mt-1 inline-block px-2.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-black text-[11px] text-slate-800 uppercase">
                    UNIT TEKNOLOGI MAKLUMAT & KOMUNIKASI (ICT) • KURIKULUM
                  </div>
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center my-4 space-y-1">
                <h3 className="font-black text-base sm:text-lg uppercase underline tracking-wider text-slate-900">
                  LAPORAN BULANAN PENGGUNAAN & TEMPAHAN BILIK ICT / MAKMAL KOMPUTER
                </h3>
                <p className="text-xs font-bold text-slate-700">
                  Bulan Laporan: <span className="uppercase text-blue-900">{selectedMonth}</span> • Bilik:{' '}
                  {selectedRoom}
                </p>
              </div>

              {/* Summary Badges Box */}
              <div className="grid grid-cols-4 gap-2.5 my-4 p-3 bg-slate-50 border border-slate-300 rounded-xl text-center text-xs">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Jumlah Slot</span>
                  <span className="font-black text-sm text-slate-900">{monthlyStats.totalSlots}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Jumlah Jam PdP</span>
                  <span className="font-black text-sm text-blue-800">{monthlyStats.totalHours} Jam</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Guru Terlibat</span>
                  <span className="font-black text-sm text-emerald-800">{monthlyStats.uniqueTeachers} Orang</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500">Penyelenggaraan</span>
                  <span className="font-black text-sm text-rose-800">{monthlyStats.maintenanceCount} Slot</span>
                </div>
              </div>

              {/* Records Table for Print */}
              <div className="mt-4">
                <table className="w-full text-left border-collapse border border-slate-300 text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-black border-b border-slate-300 uppercase">
                      <th className="p-2 border border-slate-300 text-center w-8">Bil</th>
                      <th className="p-2 border border-slate-300">Tarikh / Hari</th>
                      <th className="p-2 border border-slate-300">Waktu Slot</th>
                      <th className="p-2 border border-slate-300">Nama Guru</th>
                      <th className="p-2 border border-slate-300">Kelas</th>
                      <th className="p-2 border border-slate-300">Mata Pelajaran</th>
                      <th className="p-2 border border-slate-300">Aktiviti / Catatan</th>
                      <th className="p-2 border border-slate-300 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyBookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-4 text-center text-slate-500">
                          Tiada rekod tempahan ditemui bagi bulan ini.
                        </td>
                      </tr>
                    ) : (
                      monthlyBookings.map((b, idx) => (
                        <tr key={b.id} className="border-b border-slate-200">
                          <td className="p-1.5 border border-slate-300 text-center font-bold">{idx + 1}</td>
                          <td className="p-1.5 border border-slate-300 whitespace-nowrap">
                            <span className="font-bold">{b.date}</span> ({b.dayName})
                          </td>
                          <td className="p-1.5 border border-slate-300 whitespace-nowrap">{b.timeSlotLabel}</td>
                          <td className="p-1.5 border border-slate-300 font-bold">
                            {b.status === 'penyelenggaraan' ? 'Penyelaras ICT' : b.teacherName}
                          </td>
                          <td className="p-1.5 border border-slate-300 font-semibold">
                            {b.status === 'penyelenggaraan' ? '-' : b.className}
                          </td>
                          <td className="p-1.5 border border-slate-300">
                            {b.status === 'penyelenggaraan' ? 'Penyelenggaraan' : b.subject}
                          </td>
                          <td className="p-1.5 border border-slate-300 text-slate-700">{b.purpose}</td>
                          <td className="p-1.5 border border-slate-300 text-center font-black uppercase text-[9px]">
                            {b.status === 'penyelenggaraan' ? (
                              <span className="text-rose-700">Penyelenggaraan</span>
                            ) : (
                              <span className="text-emerald-700">Disahkan</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Signatures Section */}
              <div className="mt-12 pt-6 grid grid-cols-2 gap-8 text-xs text-slate-800">
                <div className="space-y-12">
                  <p className="font-bold">Disediakan Oleh:</p>
                  <div className="border-t border-slate-400 pt-1.5">
                    <p className="font-black uppercase">PENYELARAS BILIK ICT / MAKMAL KOMPUTER</p>
                    <p className="text-[11px] text-slate-600">Sekolah Kebangsaan Merbau Pulas</p>
                    <p className="text-[10px] text-slate-500">Tarikh Cetakan: {new Date().toLocaleDateString('ms-MY')}</p>
                  </div>
                </div>

                <div className="space-y-12">
                  <p className="font-bold">Disahkan Oleh:</p>
                  <div className="border-t border-slate-400 pt-1.5">
                    <p className="font-black uppercase">GURU BESAR / GPK PENTADBIRAN</p>
                    <p className="text-[11px] text-slate-600">Sekolah Kebangsaan Merbau Pulas</p>
                    <p className="text-[10px] text-slate-500">Cop Rasmi Sekolah</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
