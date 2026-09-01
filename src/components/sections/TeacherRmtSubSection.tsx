import React, { useState, useMemo } from 'react';
import { initialRmtStudentsList, rmtWeeklyMenus, RmtStudentRecord } from '../../data/rmtData';
import { StudentAbsenceRecord, StudentRecord } from '../../types';
import {
  Utensils,
  Search,
  Download,
  Printer,
  Users,
  CheckCircle2,
  AlertCircle,
  Calendar,
  X,
  Coffee,
  Sparkles,
  RefreshCw,
  UserCheck,
  UserX,
  FileText,
  LayoutGrid,
  Table as TableIcon,
  Copy,
  Check,
  Building2,
  Clock,
  ShieldCheck,
  Info
} from 'lucide-react';

interface TeacherRmtSubSectionProps {
  coordinatorName?: string;
  absenceRecords?: StudentAbsenceRecord[];
  students?: StudentRecord[];
  onAddAbsenceRecord?: (
    record: Omit<StudentAbsenceRecord, 'id' | 'refNo' | 'createdAt'>
  ) => StudentAbsenceRecord;
}

// Susunan hierarki kelas: IBNU SINA dahulu, kemudian IBNU KHALDUN
const getClassPriority = (className?: string): number => {
  if (!className) return 99;
  const upper = className.toUpperCase();
  if (upper.includes('SINA')) return 1;
  if (upper.includes('KHALDUN')) return 2;
  return 3;
};

// Fungsi susunan rasmi: Tahun 1 -> 6, kemudian Ibnu Sina -> Ibnu Khaldun, kemudian Nama
const sortRmtStudentsHierarchy = <T extends { year: number; className?: string; name: string }>(
  items: T[]
): T[] => {
  return [...items].sort((a, b) => {
    // 1. Tahun (1, 2, 3, 4, 5, 6)
    if (a.year !== b.year) {
      return a.year - b.year;
    }

    // 2. Kelas: Ibnu Sina (1) kemudian Ibnu Khaldun (2)
    const classDiff = getClassPriority(a.className) - getClassPriority(b.className);
    if (classDiff !== 0) {
      return classDiff;
    }

    // 3. Nama murid
    return a.name.localeCompare(b.name, 'ms');
  });
};

export const TeacherRmtSubSection: React.FC<TeacherRmtSubSectionProps> = ({
  coordinatorName = 'Puan Fazilah binti Mat',
  absenceRecords = []
}) => {
  const [activeTab, setActiveTab] = useState<'senarai' | 'menu' | 'kehadiran'>('kehadiran');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | 'semua'>('semua');
  const [selectedClass, setSelectedClass] = useState<'semua' | 'IBNU SINA' | 'IBNU KHALDUN'>('semua');
  const [selectedGender, setSelectedGender] = useState<'semua' | 'L' | 'P'>('semua');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<RmtStudentRecord | null>(null);

  // Status salin laporan teks ke clipboard
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Daily attendance date
  const todayStr = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [attendanceDate, setAttendanceDate] = useState<string>(todayStr);

  // Manual overrides per date: Record<date, Record<ic, boolean>>
  const [manualOverrides, setManualOverrides] = useState<Record<string, Record<string, boolean>>>({});

  // Attendance view mode: grid cards or audit table
  const [attendanceViewMode, setAttendanceViewMode] = useState<'grid' | 'table'>('grid');

  // Attendance filter
  const [attendanceFilterStatus, setAttendanceFilterStatus] = useState<'semua' | 'hadir' | 'tidak_hadir' | 'auto_sync'>('semua');
  const [attendanceFilterYear, setAttendanceFilterYear] = useState<number | 'semua'>('semua');
  const [attendanceFilterClass, setAttendanceFilterClass] = useState<'semua' | 'IBNU SINA' | 'IBNU KHALDUN'>('semua');
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState<string>('');

  // Lightbox modal to view student's absence details from e-Kehadiran
  const [selectedAbsenceDetail, setSelectedAbsenceDetail] = useState<{
    student: RmtStudentRecord;
    record: StudentAbsenceRecord;
  } | null>(null);

  // Calculate Kedah School Week Days (Ahad, Isnin, Selasa, Rabu, Khamis)
  const schoolWeekDays = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - dayOfWeek);

    const days = [
      { name: 'Ahad', offset: 0 },
      { name: 'Isnin', offset: 1 },
      { name: 'Selasa', offset: 2 },
      { name: 'Rabu', offset: 3 },
      { name: 'Khamis', offset: 4 }
    ];

    return days.map((d) => {
      const dt = new Date(sunday);
      dt.setDate(sunday.getDate() + d.offset);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      return {
        name: d.name,
        label: d.name,
        dateStr: `${yyyy}-${mm}-${dd}`,
        formatted: `${dd}/${mm}`
      };
    });
  }, []);

  // 1. Dapatkan senarai rekod ketidakhadiran aktif pada tarikh yang dipilih
  const activeAbsencesForDate = useMemo(() => {
    if (!absenceRecords || absenceRecords.length === 0) return [];
    return absenceRecords.filter((rec) => {
      if (rec.status === 'ditolak') return false;
      return attendanceDate >= rec.dateFrom && attendanceDate <= rec.dateTo;
    });
  }, [absenceRecords, attendanceDate]);

  // 2. Pemetaan murid yang TIDAK HADIR dalam sistem kehadiran sekolah (Auto-Sync Map)
  const absentStudentsMap = useMemo(() => {
    const map = new Map<string, StudentAbsenceRecord>();

    activeAbsencesForDate.forEach((rec) => {
      if (rec.studentIc) {
        const cleanIc = rec.studentIc.replace(/\D/g, '');
        if (cleanIc) {
          map.set(cleanIc, rec);
        }
      }
      if (rec.studentId) {
        const cleanId = rec.studentId.replace(/\D/g, '');
        if (cleanId) {
          map.set(cleanId, rec);
        }
        map.set(rec.studentId.toLowerCase().trim(), rec);
      }
      if (rec.studentName) {
        const cleanName = rec.studentName.trim().toLowerCase();
        map.set(cleanName, rec);
      }
    });

    return map;
  }, [activeAbsencesForDate]);

  // 3. Status Kehadiran Murid RMT (Diselaraskan secara automatik + manual override jika ada)
  const rmtStudentsWithAttendance = useMemo(() => {
    const currentOverrides = manualOverrides[attendanceDate] || {};

    const rawList = initialRmtStudentsList.map((student) => {
      const cleanStudentIc = student.ic.replace(/\D/g, '');
      const cleanStudentName = student.name.trim().toLowerCase();

      // Cari rekod ketidakhadiran dalam sistem e-kehadiran
      const syncedAbsenceRecord =
        absentStudentsMap.get(cleanStudentIc) ||
        absentStudentsMap.get(student.ic) ||
        absentStudentsMap.get(cleanStudentName) ||
        null;

      const isAutoAbsent = !!syncedAbsenceRecord;
      const hasOverride = currentOverrides[student.ic] !== undefined;
      const isPresent = hasOverride ? currentOverrides[student.ic] : !isAutoAbsent;

      return {
        ...student,
        isPresent,
        isAutoAbsent,
        hasOverride,
        syncedAbsenceRecord
      };
    });

    // Susun secara automatik mengikut susunan rasmi: Tahun 1 -> 6, Ibnu Sina -> Ibnu Khaldun, Nama
    return sortRmtStudentsHierarchy(rawList);
  }, [absentStudentsMap, attendanceDate, manualOverrides]);

  // 4. Pengiraan Ringkasan JUMLAH KEHADIRAN / JUMLAH PENERIMA RMT
  const totalCount = initialRmtStudentsList.length; // 89
  const presentCount = useMemo(() => {
    return rmtStudentsWithAttendance.filter((s) => s.isPresent).length;
  }, [rmtStudentsWithAttendance]);

  const absentCount = totalCount - presentCount;
  const presentPercentage = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : '100.0';
  const absentPercentage = totalCount > 0 ? ((absentCount / totalCount) * 100).toFixed(1) : '0.0';

  const autoSyncedAbsentsCount = useMemo(() => {
    return rmtStudentsWithAttendance.filter((s) => !s.isPresent && s.isAutoAbsent).length;
  }, [rmtStudentsWithAttendance]);

  // 5. SENARAI KHAS MURID TIDAK HADIR RMT (DISUSUN MENGIKUT TAHUN 1 -> 6 & IBNU SINA -> IBNU KHALDUN)
  const absentStudentsListSorted = useMemo(() => {
    const absents = rmtStudentsWithAttendance.filter((s) => !s.isPresent);
    return sortRmtStudentsHierarchy(absents);
  }, [rmtStudentsWithAttendance]);

  // Pengelompokan murid tidak hadir mengikut Tahun & Kelas
  const absentStudentsByGroup = useMemo(() => {
    const groups: {
      key: string;
      year: number;
      className: string;
      title: string;
      students: typeof absentStudentsListSorted;
    }[] = [];

    const years = [1, 2, 3, 4, 5, 6];
    const classes = ['IBNU SINA', 'IBNU KHALDUN'];

    years.forEach((yr) => {
      classes.forEach((cls) => {
        const matching = absentStudentsListSorted.filter(
          (s) => s.year === yr && s.className === cls
        );
        if (matching.length > 0) {
          groups.push({
            key: `T${yr}-${cls}`,
            year: yr,
            className: cls,
            title: `Tahun ${yr} ${cls}`,
            students: matching
          });
        }
      });
    });

    return groups;
  }, [absentStudentsListSorted]);

  // Toggle Kehadiran Manual
  const toggleAttendance = (ic: string) => {
    setManualOverrides((prev) => {
      const dateOverrides = { ...(prev[attendanceDate] || {}) };
      const currentStudent = rmtStudentsWithAttendance.find((s) => s.ic === ic);
      const newStatus = currentStudent ? !currentStudent.isPresent : false;
      dateOverrides[ic] = newStatus;
      return {
        ...prev,
        [attendanceDate]: dateOverrides
      };
    });
  };

  // Tanda Semua Hadir / Tidak Hadir
  const markAllAttendance = (status: boolean) => {
    setManualOverrides((prev) => {
      const dateOverrides: Record<string, boolean> = {};
      initialRmtStudentsList.forEach((s) => {
        dateOverrides[s.ic] = status;
      });
      return {
        ...prev,
        [attendanceDate]: dateOverrides
      };
    });
  };

  // Reset ke Auto-Sync Penuh (Kosongkan manual override untuk tarikh ini)
  const handleResetToAutoSync = () => {
    setManualOverrides((prev) => {
      const updated = { ...prev };
      delete updated[attendanceDate];
      return updated;
    });
  };

  // Salin Teks Format WhatsApp ke Clipboard
  const handleCopyWhatsAppReport = () => {
    let reportText = `*LAPORAN KETIDAKHADIRAN RMT - SK MERBAU PULAS*\n`;
    reportText += `📅 Tarikh: ${attendanceDate}\n`;
    reportText += `📊 Status: ${presentCount} / ${totalCount} Murid Hadir (${presentPercentage}%)\n`;
    reportText += `❌ Jumlah Tidak Hadir: ${absentCount} Orang\n\n`;

    if (absentStudentsListSorted.length === 0) {
      reportText += `✅ *Alhamdulillah, semua 89 murid RMT hadir ke sekolah hari ini.*`;
    } else {
      reportText += `*SENARAI MURID TIDAK HADIR (MENGIKUT TAHUN & KELAS):*\n`;
      let count = 1;
      absentStudentsByGroup.forEach((group) => {
        reportText += `\n📌 *${group.title.toUpperCase()} (${group.students.length} Murid):*\n`;
        group.students.forEach((s) => {
          const reason = s.syncedAbsenceRecord
            ? ` (${s.syncedAbsenceRecord.reasonCategory.toUpperCase()}: ${s.syncedAbsenceRecord.reasonDetails})`
            : '';
          reportText += `${count}. ${s.name}${reason}\n`;
          count++;
        });
      });
    }

    reportText += `\n_Diselaraskan secara automatik melalui Portal HEM SK Merbau Pulas (KBA5012)_`;

    navigator.clipboard.writeText(reportText);
    setCopiedNotification(true);
    setTimeout(() => {
      setCopiedNotification(false);
    }, 3000);
  };

  // Senarai Murid RMT Ditapis untuk Tab 1 (Senarai 89)
  const filteredStudents = useMemo(() => {
    const list = initialRmtStudentsList.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.ic.includes(searchQuery) ||
        student.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesYear = selectedYear === 'semua' || student.year === selectedYear;
      const matchesClass = selectedClass === 'semua' || student.className === selectedClass;
      const matchesGender = selectedGender === 'semua' || student.gender === selectedGender;

      return matchesSearch && matchesYear && matchesClass && matchesGender;
    });

    return sortRmtStudentsHierarchy(list);
  }, [searchQuery, selectedYear, selectedClass, selectedGender]);

  // Senarai Murid RMT Ditapis untuk Tab 3 (Rekod Kehadiran Makan Harian)
  const filteredAttendanceStudents = useMemo(() => {
    return rmtStudentsWithAttendance.filter((student) => {
      // Penapis status
      if (attendanceFilterStatus === 'hadir' && !student.isPresent) return false;
      if (attendanceFilterStatus === 'tidak_hadir' && student.isPresent) return false;
      if (attendanceFilterStatus === 'auto_sync' && (!student.isAutoAbsent || student.isPresent)) return false;

      // Penapis Tahun
      if (attendanceFilterYear !== 'semua' && student.year !== attendanceFilterYear) return false;

      // Penapis Kelas
      if (attendanceFilterClass !== 'semua' && student.className !== attendanceFilterClass) return false;

      // Carian
      if (attendanceSearchQuery.trim()) {
        const q = attendanceSearchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(q);
        const matchesIc = student.ic.includes(q);
        const matchesClass = student.className.toLowerCase().includes(q);
        const matchesReason = student.syncedAbsenceRecord?.reasonDetails.toLowerCase().includes(q) || false;
        const matchesReasonCat = student.syncedAbsenceRecord?.reasonCategory.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesIc && !matchesClass && !matchesReason && !matchesReasonCat) return false;
      }

      return true;
    });
  }, [rmtStudentsWithAttendance, attendanceFilterStatus, attendanceFilterYear, attendanceFilterClass, attendanceSearchQuery]);

  // Statistik Am
  const yearCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    initialRmtStudentsList.forEach((s) => {
      if (counts[s.year] !== undefined) counts[s.year]++;
    });
    return counts;
  }, []);

  const totalBoys = initialRmtStudentsList.filter((s) => s.gender === 'L').length;
  const totalGirls = initialRmtStudentsList.filter((s) => s.gender === 'P').length;
  const totalMiskinTegar = initialRmtStudentsList.filter((s) => s.isHardcorePoor).length;

  // Format label kategori sebab
  const getReasonBadge = (cat?: string) => {
    switch (cat) {
      case 'sakit':
        return { label: 'Demam / Sakit (MC)', color: 'bg-amber-500/20 text-amber-300 border-amber-400/30' };
      case 'hospital':
        return { label: 'Temujanji Hospital', color: 'bg-sky-500/20 text-sky-300 border-sky-400/30' };
      case 'kecemasan':
        return { label: 'Kecemasan Waris', color: 'bg-rose-500/20 text-rose-300 border-rose-400/30' };
      case 'keluarga':
        return { label: 'Urusan Keluarga', color: 'bg-purple-500/20 text-purple-300 border-purple-400/30' };
      case 'bencana':
        return { label: 'Bencana / Laluan', color: 'bg-blue-500/20 text-blue-300 border-blue-400/30' };
      default:
        return { label: 'Sebab Munasabah', color: 'bg-slate-500/20 text-slate-300 border-slate-400/30' };
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'BIL',
      'NAMA MURID',
      'NO KAD PENGENALAN',
      'TAHUN',
      'KELAS',
      'JANTINA',
      'ALAMAT RUMAH',
      'PENDAPATAN (RM)',
      'TANGGUNGAN',
      'PERKAPITA (RM)',
      'STATUS PGK PENDAPATAN',
      'STATUS PGK PERKAPITA',
      'STATUS PGK',
      'MISKIN TEGAR'
    ];

    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      `"${s.name}"`,
      `'${s.ic}`,
      s.year,
      `"${s.className}"`,
      s.gender === 'L' ? 'LELAKI' : 'PEREMPUAN',
      `"${s.address}"`,
      s.income.toFixed(2),
      s.dependents,
      s.perCapita.toFixed(2),
      s.pgkIncomeStatus,
      s.pgkPerCapitaStatus,
      s.statusPgk,
      s.isHardcorePoor ? 'YA' : 'TIDAK'
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Senarai_Murid_RMT_SK_Merbau_Pulas_${selectedYear !== 'semua' ? 'Tahun_' + selectedYear : 'Semua'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Attendance CSV
  const handleExportAttendanceCsv = () => {
    const headers = [
      'TARIKH',
      'BIL',
      'NAMA MURID',
      'NO MYKID / IC',
      'TAHUN',
      'KELAS',
      'STATUS KEHADIRAN RMT',
      'STATUS AUTO-SYNC KEHADIRAN',
      'SEBAB TIDAK HADIR',
      'NO RUJUKAN MAKLUMAN'
    ];

    const rows = rmtStudentsWithAttendance.map((s, idx) => [
      attendanceDate,
      idx + 1,
      `"${s.name}"`,
      `'${s.ic}`,
      `Tahun ${s.year}`,
      s.className,
      s.isPresent ? 'HADIR MAKAN' : 'TIDAK HADIR',
      s.isAutoAbsent ? 'AUTO-SYNC E-KEHADIRAN' : s.hasOverride ? 'MANUAL' : 'HADIR SEKOLAH',
      s.syncedAbsenceRecord ? `"${s.syncedAbsenceRecord.reasonDetails}"` : '-',
      s.syncedAbsenceRecord ? `"${s.syncedAbsenceRecord.refNo}"` : '-'
    ]);

    const summaryRow = [
      '',
      '',
      `"RINGKASAN KEHADIRAN RMT PADA ${attendanceDate}"`,
      `"JUMLAH HADIR: ${presentCount} / ${totalCount} MURID (${presentPercentage}%)"`,
      `"JUMLAH TIDAK HADIR: ${absentCount} / ${totalCount} MURID"`,
      `"AUTO-SYNC DARI KEHADIRAN: ${autoSyncedAbsentsCount} MURID"`
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [[`LAPORAN KEHADIRAN MAKAN RMT - SK MERBAU PULAS (${attendanceDate})`], summaryRow, headers, ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Kehadiran_RMT_${attendanceDate}_SK_Merbau_Pulas.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Sub-Header Banner for RMT */}
      <div className="bg-gradient-to-r from-amber-600/30 via-slate-900/90 to-emerald-700/30 border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
              <Utensils className="w-3.5 h-3.5" />
              <span>Sub-Menu Hal Ehwal Murid (HEM)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <span>Senarai Murid Penerima RMT & Susu Sekolah</span>
              <span className="text-sm px-2.5 py-0.5 rounded-xl bg-amber-500 text-slate-950 font-black">
                89 Murid
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pengurusan data lengkap 89 orang murid SK Merbau Pulas yang layak menerima Rancangan Makanan Tambahan (RMT) dan Program Susu Sekolah (PSS) dengan integrasi susunan rasmi mengikut Tahun 1 hingga 6 (Ibnu Sina & Ibnu Khaldun).
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-amber-200/90">
              <span>Penyelaras RMT: <strong>{coordinatorName}</strong></span>
              <span>•</span>
              <span>Kod Sekolah: <strong>KBA5012</strong></span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                <Sparkles className="w-3 h-3" />
                <span>Auto-Sync e-Kehadiran Aktif</span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {activeTab === 'kehadiran' ? (
              <>
                <button
                  onClick={handleCopyWhatsAppReport}
                  className="px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-emerald-950/40 border border-emerald-500/40 flex items-center gap-2 active:scale-95 cursor-pointer"
                  title="Salin laporan ketidakhadiran ke papan keratan (WhatsApp)"
                >
                  {copiedNotification ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedNotification ? 'Disalin ke WhatsApp!' : 'Salin Mesej Cikgu'}</span>
                </button>
                <button
                  onClick={handleExportAttendanceCsv}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-emerald-950/40 border border-emerald-400/40 flex items-center gap-2 active:scale-95 cursor-pointer"
                  title="Eksport rekod kehadiran hari ini ke CSV"
                >
                  <Download className="w-4 h-4" />
                  <span>Eksport CSV</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs sm:text-sm transition border border-white/20 flex items-center gap-2 active:scale-95 cursor-pointer"
                  title="Cetak jadual kehadiran"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleExportCsv}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-emerald-950/40 border border-emerald-400/40 flex items-center gap-2 active:scale-95 cursor-pointer"
                  title="Eksport senarai 89 murid ke CSV / Excel"
                >
                  <Download className="w-4 h-4" />
                  <span>Eksport Excel (CSV)</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs sm:text-sm transition border border-white/20 flex items-center gap-2 active:scale-95 cursor-pointer"
                  title="Cetak senarai rasmi"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Senarai</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 3 Sub-Tabs inside RMT */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('kehadiran')}
            className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'kehadiran'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/40 border border-amber-200'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-950" />
            <span>Kehadiran</span>
            <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-emerald-400 font-mono font-bold">
              {presentCount} / {totalCount} Hadir
            </span>
          </button>

          <button
            onClick={() => setActiveTab('senarai')}
            className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'senarai'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'bg-white/5 hover:bg-white/15 text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Murid RMT</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'bg-white/5 hover:bg-white/15 text-slate-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Menu</span>
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      {activeTab === 'kehadiran' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Jumlah Kehadiran */}
          <div className="bg-gradient-to-br from-emerald-950/80 to-slate-900 border-2 border-emerald-500/40 rounded-2xl p-4.5 space-y-2 shadow-lg shadow-emerald-950/20 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Jumlah Hadir Makan RMT</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black border border-emerald-400/30">
                {presentPercentage}%
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-emerald-400">{presentCount}</span>
                <span className="text-sm font-extrabold text-slate-300">/ {totalCount}</span>
              </div>
              <span className="text-xs text-slate-400 font-semibold">Penerima RMT</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${presentPercentage}%` }}
              />
            </div>
          </div>

          {/* Card 2: Jumlah Tidak Hadir */}
          <div className="bg-gradient-to-br from-rose-950/80 to-slate-900 border-2 border-rose-500/40 rounded-2xl p-4.5 space-y-2 shadow-lg shadow-rose-950/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-rose-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <UserX className="w-3.5 h-3.5 text-rose-400" />
                <span>Jumlah Tidak Hadir</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-black border border-rose-400/30">
                {absentPercentage}%
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-rose-400">{absentCount}</span>
                <span className="text-sm font-extrabold text-slate-300">/ {totalCount}</span>
              </div>
              <span className="text-xs text-rose-300 font-semibold">Murid Tidak Hadir</span>
            </div>
            <p className="text-[10px] text-rose-300/90 leading-tight">
              {absentCount === 0
                ? 'Semua murid hadir ke sekolah hari ini'
                : `${absentCount} murid tidak mengambil makanan RMT`}
            </p>
          </div>

          {/* Card 3: Auto-Sync Dari e-Kehadiran */}
          <div className="bg-gradient-to-br from-amber-950/80 to-slate-900 border border-amber-500/30 rounded-2xl p-4.5 space-y-2 shadow-lg shadow-amber-950/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Auto-Sync e-Kehadiran</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black border border-amber-400/30">
                APDM / MC
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black text-amber-400">{autoSyncedAbsentsCount}</span>
              <span className="text-xs text-slate-400 font-semibold">Murid Disegerakkan</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-tight">
              {autoSyncedAbsentsCount > 0
                ? `${autoSyncedAbsentsCount} murid dikesan tidak hadir dalam sistem e-kehadiran sekolah`
                : 'Tiada rekod ketidakhadiran berdaftar pada tarikh ini'}
            </p>
          </div>

          {/* Card 4: Kotak Susu Sekolah (PSS) */}
          <div className="bg-gradient-to-br from-blue-950/80 to-slate-900 border border-blue-500/30 rounded-2xl p-4.5 space-y-2 shadow-lg shadow-blue-950/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-blue-400" />
                <span>Agihan Susu PSS</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-black border border-blue-400/30">
                UHT 200ml
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-blue-400">{presentCount}</span>
                <span className="text-sm font-extrabold text-slate-300">/ {totalCount}</span>
              </div>
              <span className="text-xs text-slate-400 font-semibold">Kotak Diagihkan</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-tight">
              Agihan susu diselaraskan mengikut jumlah murid yang hadir
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Jumlah Penerima</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-400">{totalCount}</span>
              <span className="text-xs text-slate-400">Orang Murid</span>
            </div>
            <span className="text-[10px] text-slate-300 block">L: {totalBoys} | P: {totalGirls}</span>
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Kategori Miskin Tegar</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-400">{totalMiskinTegar}</span>
              <span className="text-xs text-emerald-300">100% Layak</span>
            </div>
            <span className="text-[10px] text-slate-300 block">Status PGK Disahkan</span>
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Program Susu (PSS)</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-blue-400">{totalCount}</span>
              <span className="text-xs text-blue-300">Kotak / Hari</span>
            </div>
            <span className="text-[10px] text-slate-300 block">Susu UHT Segar KPM</span>
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Pecahan Kelas</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-200">
                T1: {yearCounts[1]} | T2: {yearCounts[2]} | T3: {yearCounts[3]}
              </span>
            </div>
            <span className="text-[10px] text-slate-300 block">
              T4: {yearCounts[4]} | T5: {yearCounts[5]} | T6: {yearCounts[6]}
            </span>
          </div>
        </div>
      )}

      {/* TAB 3: REKOD KEHADIRAN MAKAN HARIAN */}
      {activeTab === 'kehadiran' && (
        <div className="space-y-6">
          {/* Main Control Panel: Date Selector, Weekday Quick Presets, Auto-Sync Reset & Bulk Actions */}
          <div className="bg-slate-900/90 p-4 sm:p-5 rounded-3xl border border-emerald-500/30 shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>Buku Log Kehadiran Makan RMT Harian</span>
                  </h4>
                </div>
                <p className="text-xs text-slate-300">
                  Susunan berkanun: <strong>Tahun 1 hingga 6</strong> &bull; Kelas <strong>Ibnu Sina</strong> dahulu kemudian <strong>Ibnu Khaldun</strong>.
                </p>
              </div>

              {/* Date Selector & Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-2xl border border-white/15 shadow-inner">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-white/10 text-xs">
                  {schoolWeekDays.map((day) => (
                    <button
                      key={day.dateStr}
                      onClick={() => setAttendanceDate(day.dateStr)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition cursor-pointer ${
                        attendanceDate === day.dateStr
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                      title={`${day.name || day.label} (${day.dateStr})`}
                    >
                      {(day.name || day.label || '').slice(0, 3)}
                    </button>
                  ))}
                  {attendanceDate !== todayStr && (
                    <button
                      onClick={() => setAttendanceDate(todayStr)}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 border border-emerald-500/30 cursor-pointer"
                    >
                      Hari Ini
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToAutoSync}
                  className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 rounded-xl text-xs font-bold transition border border-amber-400/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Segerak semula kehadiran dengan sistem e-Kehadiran sekolah"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Segerak Semula (Auto-Sync)</span>
                </button>

                <button
                  type="button"
                  onClick={() => markAllAttendance(true)}
                  className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Tanda Semua Hadir</span>
                </button>

                <button
                  type="button"
                  onClick={() => markAllAttendance(false)}
                  className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Nyah-tanda Semua</span>
                </button>
              </div>

              {/* View Switcher: Grid vs Table */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setAttendanceViewMode('grid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                    attendanceViewMode === 'grid'
                      ? 'bg-white/20 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Kad Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAttendanceViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                    attendanceViewMode === 'table'
                      ? 'bg-white/20 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Jadual Penuh</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BAHAGIAN KHAS: SENARAI MURID TIDAK HADIR RMT (DISUSUN TAHUN 1-6 & IBNU SINA -> IBNU KHALDUN) */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-br from-rose-950/90 via-slate-900 to-slate-950 border-2 border-rose-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-500/20 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30">
                    <UserX className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <span>Senarai Murid Tidak Hadir RMT Hari Ini</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black">
                        {absentCount} Murid
                      </span>
                    </h3>
                    <p className="text-xs text-rose-200/80">
                      Disusun mengikut: <strong>Tahun 1, 2, 3, 4, 5, 6</strong> &rarr; <strong>Kelas Ibnu Sina dahulu kemudian Ibnu Khaldun</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyWhatsAppReport}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                  title="Salin senarai tidak hadir untuk mesej WhatsApp guru & pengusaha kantin"
                >
                  {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNotification ? 'Berjaya Disalin!' : 'Salin Senarai WhatsApp'}</span>
                </button>
              </div>
            </div>

            {absentStudentsListSorted.length === 0 ? (
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-2">
                <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-black text-emerald-300">
                  Alhamdulillah! Semua 89 Murid Hadir Makan RMT
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Tiada rekod ketidakhadiran murid RMT dikesan pada tarikh <strong>{attendanceDate}</strong>. Semua kelas Tahun 1 hingga 6 hadir sepenuhnya.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Paparan Kelompok Mengikut Tahun & Kelas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {absentStudentsByGroup.map((group) => (
                    <div
                      key={group.key}
                      className="bg-slate-900/90 border border-rose-500/30 rounded-2xl overflow-hidden shadow-lg space-y-3 p-4"
                    >
                      {/* Header Kelas */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                              group.className === 'IBNU SINA'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                                : 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                            }`}
                          >
                            Tahun {group.year} {group.className}
                          </span>
                          <span className="text-[11px] text-slate-400 font-bold">
                            ({group.students.length} orang)
                          </span>
                        </div>
                        <span className="text-[10px] text-rose-300 font-mono font-bold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30">
                          Tidak Hadir Makan
                        </span>
                      </div>

                      {/* Senarai Murid dalam Kelas ini */}
                      <div className="space-y-2">
                        {group.students.map((student, idx) => {
                          const badge = student.syncedAbsenceRecord
                            ? getReasonBadge(student.syncedAbsenceRecord.reasonCategory)
                            : null;

                          return (
                            <div
                              key={student.ic}
                              className="bg-slate-950/80 border border-white/10 hover:border-rose-400/50 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition"
                            >
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-mono text-rose-400 font-bold w-5">
                                    {idx + 1}.
                                  </span>
                                  <span className="text-xs font-black text-white hover:text-amber-300 transition">
                                    {student.name}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 pl-7">
                                  <span className="font-mono">MyKid: {student.ic}</span>
                                  <span>&bull;</span>
                                  <span className="font-bold text-amber-200">
                                    Tahun {student.year} {student.className}
                                  </span>
                                </div>

                                {/* Sebab Ketidakhadiran jika dikesan dari e-Kehadiran */}
                                {student.syncedAbsenceRecord && badge && (
                                  <div className="pl-7 pt-1 flex flex-wrap items-center gap-1.5">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                                      <FileText className="w-2.5 h-2.5" />
                                      <span>{badge.label}</span>
                                    </span>
                                    <span className="text-[10px] text-slate-300 italic">
                                      &ldquo;{student.syncedAbsenceRecord.reasonDetails}&rdquo;
                                    </span>
                                    {student.syncedAbsenceRecord.refNo && (
                                      <span className="text-[9px] text-slate-400 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                                        Ref: {student.syncedAbsenceRecord.refNo}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Butang Tukar Hadir jika murid hadir lewat */}
                              <div className="flex items-center justify-end gap-1.5 flex-shrink-0 pt-1 sm:pt-0">
                                <button
                                  type="button"
                                  onClick={() => toggleAttendance(student.ic)}
                                  className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-[10px] font-bold transition border border-emerald-500/30 flex items-center gap-1 cursor-pointer active:scale-95"
                                  title="Tukar status murid ini kepada HADIR jika hadir lewat"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Tukar Hadir</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SEMUA REKOD KEHADIRAN 89 MURID (DENGAN PENAPIS TAHUN & KELAS) */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Semua Rekod Murid Penerima RMT ({totalCount} Orang)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Susunan rasmi: Tahun 1 hingga 6 (Ibnu Sina dahulu kemudian Ibnu Khaldun).
                </p>
              </div>

              {/* Status Ratio Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/15 text-xs">
                <span className="text-slate-400">Kehadiran:</span>
                <span className="font-mono font-black text-emerald-400">{presentCount} / {totalCount}</span>
                <span className="text-slate-500">&bull;</span>
                <span className="text-rose-400 font-bold">{absentCount} Tidak Hadir</span>
              </div>
            </div>

            {/* Attendance Filters Bar */}
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama, MyKid, kelas, atau sebab..."
                  value={attendanceSearchQuery}
                  onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
                {attendanceSearchQuery && (
                  <button
                    onClick={() => setAttendanceSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status Filter */}
                <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10 text-xs">
                  <button
                    onClick={() => setAttendanceFilterStatus('semua')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      attendanceFilterStatus === 'semua'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Semua ({totalCount})
                  </button>
                  <button
                    onClick={() => setAttendanceFilterStatus('tidak_hadir')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      attendanceFilterStatus === 'tidak_hadir'
                        ? 'bg-rose-600 text-white font-black'
                        : 'text-rose-400 hover:text-white'
                    }`}
                  >
                    Tidak Hadir ({absentCount})
                  </button>
                  <button
                    onClick={() => setAttendanceFilterStatus('hadir')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      attendanceFilterStatus === 'hadir'
                        ? 'bg-emerald-600 text-white font-black'
                        : 'text-emerald-400 hover:text-white'
                    }`}
                  >
                    Hadir ({presentCount})
                  </button>
                  {autoSyncedAbsentsCount > 0 && (
                    <button
                      onClick={() => setAttendanceFilterStatus('auto_sync')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        attendanceFilterStatus === 'auto_sync'
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'text-amber-300 hover:text-white'
                      }`}
                    >
                      Auto-Sync ({autoSyncedAbsentsCount})
                    </button>
                  )}
                </div>

                {/* Year Filter */}
                <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10 text-xs">
                  {(['semua', 1, 2, 3, 4, 5, 6] as const).map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setAttendanceFilterYear(yr)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        attendanceFilterYear === yr
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {yr === 'semua' ? 'Semua T' : `T${yr}`}
                    </button>
                  ))}
                </div>

                {/* Class Filter: Ibnu Sina vs Ibnu Khaldun */}
                <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10 text-xs">
                  {(['semua', 'IBNU SINA', 'IBNU KHALDUN'] as const).map((cls) => (
                    <button
                      key={cls}
                      onClick={() => setAttendanceFilterClass(cls)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        attendanceFilterClass === cls
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {cls === 'semua' ? 'Semua Kelas' : cls.replace('IBNU ', '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content: Grid or Table */}
            {attendanceViewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredAttendanceStudents.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-dashed border-white/10">
                    Tiada rekod murid yang sepadan dengan tapisan ini.
                  </div>
                ) : (
                  filteredAttendanceStudents.map((student, index) => {
                    const badge = student.syncedAbsenceRecord
                      ? getReasonBadge(student.syncedAbsenceRecord.reasonCategory)
                      : null;

                    return (
                      <div
                        key={student.ic}
                        onClick={() => toggleAttendance(student.ic)}
                        className={`rounded-2xl p-4 transition-all duration-200 border cursor-pointer select-none relative group ${
                          student.isPresent
                            ? 'bg-emerald-950/30 hover:bg-emerald-950/50 border-emerald-500/30'
                            : 'bg-rose-950/40 hover:bg-rose-950/60 border-rose-500/50 shadow-md shadow-rose-950/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-slate-400 font-bold">
                                #{index + 1}
                              </span>
                              <span className="text-xs font-black text-white group-hover:text-amber-300 transition">
                                {student.name}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-black ${
                                  student.className === 'IBNU SINA'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                                    : 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                                }`}
                              >
                                Tahun {student.year} {student.className}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {student.ic}
                              </span>
                            </div>
                          </div>

                          {/* Status Indicator Button */}
                          <div className="flex-shrink-0">
                            {student.isPresent ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 text-[11px] font-black shadow-md shadow-emerald-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>HADIR</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-600 text-white text-[11px] font-black shadow-md shadow-rose-600/30">
                                <UserX className="w-3.5 h-3.5" />
                                <span>TIDAK</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Absences Reason Note */}
                        {!student.isPresent && student.syncedAbsenceRecord && badge && (
                          <div className="mt-3 pt-2.5 border-t border-rose-500/20 space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className={`px-2 py-0.5 rounded font-bold border ${badge.color}`}>
                                {badge.label}
                              </span>
                              {student.syncedAbsenceRecord.refNo && (
                                <span className="font-mono text-slate-400 text-[9px]">
                                  {student.syncedAbsenceRecord.refNo}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-rose-200 italic line-clamp-1">
                              &ldquo;{student.syncedAbsenceRecord.reasonDetails}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* Table View */
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950/90 text-slate-300 uppercase tracking-wider text-[10px] border-b border-white/10 font-black">
                        <th className="py-3 px-3 text-center w-12">Bil</th>
                        <th className="py-3 px-4">Nama Murid</th>
                        <th className="py-3 px-3">Tahun & Kelas</th>
                        <th className="py-3 px-3">No. MyKid</th>
                        <th className="py-3 px-3 text-center">Status RMT</th>
                        <th className="py-3 px-4">Catatan Ketidakhadiran (e-Kehadiran)</th>
                        <th className="py-3 px-3 text-center">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200">
                      {filteredAttendanceStudents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            Tiada rekod ditemui.
                          </td>
                        </tr>
                      ) : (
                        filteredAttendanceStudents.map((student, idx) => {
                          const badge = student.syncedAbsenceRecord
                            ? getReasonBadge(student.syncedAbsenceRecord.reasonCategory)
                            : null;

                          return (
                            <tr
                              key={student.ic}
                              onClick={() => toggleAttendance(student.ic)}
                              className={`transition cursor-pointer ${
                                student.isPresent
                                  ? 'hover:bg-emerald-500/10'
                                  : 'bg-rose-950/20 hover:bg-rose-950/40'
                              }`}
                            >
                              <td className="py-3 px-3 text-center font-mono text-slate-400 text-[11px] font-bold">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-4 font-bold text-white">
                                {student.name}
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                                    student.className === 'IBNU SINA'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                                      : 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                                  }`}
                                >
                                  T{student.year} {student.className}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-300 text-[11px]">
                                {student.ic}
                              </td>
                              <td className="py-3 px-3 text-center">
                                {student.isPresent ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>HADIR MAKAN</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[10px] font-black">
                                    <UserX className="w-3 h-3" />
                                    <span>TIDAK HADIR</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-xs">
                                {!student.isPresent && student.syncedAbsenceRecord && badge ? (
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${badge.color}`}>
                                        {badge.label}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 italic">
                                      {student.syncedAbsenceRecord.reasonDetails}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-slate-500 text-[11px]">-</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleAttendance(student.ic);
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                                    student.isPresent
                                      ? 'bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white'
                                      : 'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white'
                                  }`}
                                >
                                  {student.isPresent ? 'Tanda Tidak Hadir' : 'Tanda Hadir'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: SENARAI MURID 89 (LENGKAP DENGAN KELAS) */}
      {activeTab === 'senarai' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama murid, No. Kad Pengenalan / Sijil Lahir, alamat, kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/70 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Year Filter */}
              <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-white/10 text-xs">
                <span className="px-2 text-slate-400 text-[11px] font-semibold">Tahun:</span>
                {(['semua', 1, 2, 3, 4, 5, 6] as const).map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setSelectedYear(yr)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedYear === yr
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {yr === 'semua' ? 'Semua' : `T${yr}`}
                  </button>
                ))}
              </div>

              {/* Class Filter */}
              <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-white/10 text-xs">
                {(['semua', 'IBNU SINA', 'IBNU KHALDUN'] as const).map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedClass === cls
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cls === 'semua' ? 'Semua Kelas' : cls.replace('IBNU ', '')}
                  </button>
                ))}
              </div>

              {/* Gender Filter */}
              <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-white/10 text-xs">
                {(['semua', 'L', 'P'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGender(g)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedGender === g
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {g === 'semua' ? 'Semua' : g === 'L' ? 'L' : 'P'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count Banner */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Menunjukkan <strong className="text-white">{filteredStudents.length}</strong> daripada <strong className="text-amber-400">{totalCount}</strong> murid penerima
            </span>
            <span className="text-slate-400 hidden sm:inline">
              *Susunan hierarki: Tahun 1 - 6 (Ibnu Sina dahulu kemudian Ibnu Khaldun)
            </span>
          </div>

          {/* Table of Students */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-300 uppercase tracking-wider text-[10px] border-b border-white/10 font-black">
                    <th className="py-3 px-3 text-center w-12">Bil</th>
                    <th className="py-3 px-4">Nama Murid</th>
                    <th className="py-3 px-3">No. MyKid / IC</th>
                    <th className="py-3 px-3 text-center">Tahun & Kelas</th>
                    <th className="py-3 px-3 text-center">Jantina</th>
                    <th className="py-3 px-4">Alamat Rumah</th>
                    <th className="py-3 px-3 text-right">Pendapatan</th>
                    <th className="py-3 px-3 text-right">Perkapita</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        Tiada rekod murid ditemui dengan carian ini.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => (
                      <tr
                        key={student.ic}
                        onClick={() => setSelectedStudentDetail(student)}
                        className="hover:bg-amber-500/10 transition cursor-pointer group"
                      >
                        <td className="py-3 px-3 text-center font-mono text-slate-400 text-[11px] font-bold">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-bold text-white group-hover:text-amber-300 transition">
                          {student.name}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300 text-[11px]">
                          {student.ic}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                              student.className === 'IBNU SINA'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                                : 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                            }`}
                          >
                            T{student.year} {student.className}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              student.gender === 'L'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-pink-500/20 text-pink-300'
                            }`}
                          >
                            {student.gender === 'L' ? 'L' : 'P'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-[11px] max-w-xs truncate" title={student.address}>
                          {student.address}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-300 text-[11px]">
                          RM {student.income.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-[11px]">
                          RM {student.perCapita.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>LAYAK</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudentDetail(student);
                            }}
                            className="px-2 py-1 bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-lg text-[10px] font-bold transition cursor-pointer"
                          >
                            Perincian
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JADUAL MENU SIHAT RMT */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="space-y-1">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-400" />
                <span>Koleksi 10 Menu Sihat Rancangan Makanan Tambahan (RMT) KPM</span>
              </h4>
              <p className="text-xs text-slate-300">
                Penyediaan sajian berkhasiat mengikut sukatan nutrien Kementerian Pendidikan Malaysia (KPM) bersama susu kotak UHT.
              </p>
            </div>
            <span className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full font-bold border border-emerald-400/30">
              Diselia Pengusaha Kantin SKMP
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rmtWeeklyMenus.map((menu) => (
              <div
                key={menu.id}
                className="bg-slate-900/60 border border-white/10 hover:border-amber-500/40 rounded-2xl p-4 transition space-y-2.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-400/20">
                    Menu #{menu.id} ({menu.day})
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400">
                    {menu.calories}
                  </span>
                </div>
                <h5 className="font-extrabold text-white text-sm group-hover:text-amber-300 transition">
                  {menu.title}
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">{menu.description}</p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {menu.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL / LIGHTBOX: PERINCIAN MAKLUMAT MURID RMT */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold uppercase">
                  Profil Penerima RMT & PSS
                </span>
                <h4 className="text-base font-black text-white pt-1">
                  {selectedStudentDetail.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-white/5">
                <div>
                  <span className="text-slate-400 block text-[10px]">Tahun & Kelas</span>
                  <span className="font-bold text-amber-300">
                    Tahun {selectedStudentDetail.year} {selectedStudentDetail.className}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">No. MyKid / Sijil Lahir</span>
                  <span className="font-mono text-slate-200 font-bold">
                    {selectedStudentDetail.ic}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Jantina</span>
                  <span className="text-slate-200 font-bold">
                    {selectedStudentDetail.gender === 'L' ? 'Lelaki' : 'Perempuan'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Kategori Miskin Tegar</span>
                  <span className="text-emerald-400 font-black">
                    {selectedStudentDetail.isHardcorePoor ? 'Ya (100% Layak)' : 'Layak RMT'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1.5">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Kriteria Penilaian PGK & Sosioekonomi
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-300">Pendapatan Isi Rumah:</span>
                  <span className="font-mono font-bold text-white">
                    RM {selectedStudentDetail.income.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Bilangan Tanggungan:</span>
                  <span className="font-mono font-bold text-white">
                    {selectedStudentDetail.dependents} Orang
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-1">
                  <span className="text-emerald-300 font-bold">Pendapatan Perkapita:</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">
                    RM {selectedStudentDetail.perCapita.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-400 block text-[10px]">Alamat Kediaman</span>
                <p className="text-slate-200 leading-relaxed">
                  {selectedStudentDetail.address}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
