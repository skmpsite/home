import React, { useState, useEffect, useMemo } from 'react';
import { FullStudentRecord } from '../../types';
import {
  fetchGoogleSheetStudents,
  GOOGLE_SHEET_STUDENTS_EDIT_URL,
  getLastSyncTimestamp
} from '../../utils/googleSheetsStudentSync';
import {
  Search,
  X,
  RefreshCw,
  ExternalLink,
  Users,
  User,
  Phone,
  MessageCircle,
  MapPin,
  GraduationCap,
  HeartHandshake,
  CreditCard,
  Briefcase,
  Copy,
  Check,
  Printer,
  ShieldAlert,
  Building,
  Calendar,
  Filter,
  Eye,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Camera,
  Image as ImageIcon,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { getYearSortRank, getClassSortRank, ORDERED_CLASS_PILLS, getStudentClassCode } from '../../utils/studentHelpers';
import { StudentPhotoCaptureModal } from './StudentPhotoCaptureModal';

interface StudentSearchPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSearchQuery?: string;
}

export const StudentSearchPortalModal: React.FC<StudentSearchPortalModalProps> = ({
  isOpen,
  onClose,
  initialSearchQuery = ''
}) => {
  const [students, setStudents] = useState<FullStudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedClassCode, setSelectedClassCode] = useState<string>('semua');
  const [selectedYear, setSelectedYear] = useState<string>('semua');
  const [selectedClass, setSelectedClass] = useState<string>('semua');
  const [selectedGender, setSelectedGender] = useState<string>('semua');
  const [selectedSpecialStatus, setSelectedSpecialStatus] = useState<string>('semua');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<FullStudentRecord | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Photo Capture Modal State
  const [photoModalStudent, setPhotoModalStudent] = useState<FullStudentRecord | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Contact Action Modal (WhatsApp / Call Selection for Bapa, Ibu, Penjaga)
  const [contactModalStudent, setContactModalStudent] = useState<FullStudentRecord | null>(null);
  const [contactModalType, setContactModalType] = useState<'whatsapp' | 'call'>('whatsapp');

  // Load students on open
  useEffect(() => {
    if (isOpen) {
      loadData(false);
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handlePhotoSaved = (studentKey: string, newPhotoUrl: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentKey || s.studentId === studentKey || s.ic === studentKey) {
          return { ...s, photoUrl: newPhotoUrl };
        }
        return s;
      })
    );
    if (
      selectedStudent &&
      (selectedStudent.id === studentKey ||
        selectedStudent.studentId === studentKey ||
        selectedStudent.ic === studentKey)
    ) {
      setSelectedStudent((prev) => (prev ? { ...prev, photoUrl: newPhotoUrl } : null));
    }
    showToast('Gambar murid berjaya disimpan & disegerakkan ke Google Sheets!');
  };

  const loadData = async (force: boolean) => {
    if (force) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const result = await fetchGoogleSheetStudents(force);
      setStudents(result.students);
      setLastUpdated(result.lastUpdated);
      if (force) {
        showToast('Data murid berjaya disegerakkan daripada Google Sheets!');
      }
    } catch (err) {
      console.error('Failed to load students:', err);
      showToast('Menggunakan data sandaran murid tempatan.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Extract distinct Years and Classes
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.year) set.add(s.year.trim().toUpperCase());
    });
    return Array.from(set).sort((a, b) => getYearSortRank(a) - getYearSortRank(b));
  }, [students]);

  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (selectedYear === 'semua' || s.year?.trim().toUpperCase() === selectedYear) {
        if (s.className) set.add(s.className.trim().toUpperCase());
      }
    });
    return Array.from(set).sort((a, b) => getClassSortRank(a) - getClassSortRank(b));
  }, [students, selectedYear]);

  // Filter students
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return students.filter((s) => {
      // Direct class code filter (6IS, 6IK, 5IS, 5IK, etc.)
      if (selectedClassCode !== 'semua') {
        const studentCode = getStudentClassCode(s);
        if (studentCode !== selectedClassCode) {
          return false;
        }
      }
      // Year filter
      if (selectedYear !== 'semua' && s.year?.toUpperCase() !== selectedYear) {
        return false;
      }
      // Class filter
      if (selectedClass !== 'semua' && s.className?.toUpperCase() !== selectedClass) {
        return false;
      }
      // Gender filter
      if (selectedGender !== 'semua' && s.gender !== selectedGender) {
        return false;
      }
      // Special status filter
      if (selectedSpecialStatus === 'oku' && (!s.isOku || s.isOku.toLowerCase() === 'tidak' || s.isOku === '-')) {
        return false;
      }
      if (selectedSpecialStatus === 'yatim' && (!s.orphanStatus || s.orphanStatus === '-' || s.orphanStatus.toLowerCase().includes('bukan'))) {
        return false;
      }
      if (selectedSpecialStatus === 'b40') {
        const income1 = parseFloat((s.parent1Income || '0').replace(/[^0-9.]/g, '')) || 0;
        const income2 = parseFloat((s.parent2Income || '0').replace(/[^0-9.]/g, '')) || 0;
        const total = income1 + income2;
        if (total > 3000 || total === 0) return false;
      }

      // Search Query
      if (!q) return true;
      return (
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.ic && s.ic.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, ''))) ||
        (s.studentId && s.studentId.includes(q)) ||
        (s.className && s.className.toLowerCase().includes(q)) ||
        (s.year && s.year.toLowerCase().includes(q)) ||
        (s.classTeacher && s.classTeacher.toLowerCase().includes(q)) ||
        (s.parent1Name && s.parent1Name.toLowerCase().includes(q)) ||
        (s.parent1Phone && s.parent1Phone.includes(q)) ||
        (s.parent2Name && s.parent2Name.toLowerCase().includes(q)) ||
        (s.parent2Phone && s.parent2Phone.includes(q)) ||
        (s.fullAddress && s.fullAddress.toLowerCase().includes(q))
      );
    });
  }, [students, searchQuery, selectedClassCode, selectedYear, selectedClass, selectedGender, selectedSpecialStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const lelaki = students.filter((s) => s.gender === 'LELAKI').length;
    const perempuan = students.filter((s) => s.gender === 'PEREMPUAN').length;
    const oku = students.filter((s) => s.isOku && s.isOku.toLowerCase() !== 'tidak' && s.isOku !== '-').length;
    const yatim = students.filter((s) => s.orphanStatus && s.orphanStatus !== '-' && !s.orphanStatus.toLowerCase().includes('bukan')).length;
    return { total, lelaki, perempuan, oku, yatim };
  }, [students]);

  // Count active filters (excluding default 'semua')
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedClassCode !== 'semua') count++;
    if (selectedYear !== 'semua') count++;
    if (selectedClass !== 'semua') count++;
    if (selectedGender !== 'semua') count++;
    if (selectedSpecialStatus !== 'semua') count++;
    return count;
  }, [selectedClassCode, selectedYear, selectedClass, selectedGender, selectedSpecialStatus]);

  const handleResetFilters = () => {
    setSelectedClassCode('semua');
    setSelectedYear('semua');
    setSelectedClass('semua');
    setSelectedGender('semua');
    setSelectedSpecialStatus('semua');
    setSearchQuery('');
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    showToast(`Disalin: ${label}`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handlePrintStudent = () => {
    window.print();
  };

  const formatCleanPhone = (phoneStr?: string): string => {
    if (!phoneStr) return '';
    const digits = phoneStr.replace(/[^0-9]/g, '');
    if (digits.startsWith('60')) return digits;
    if (digits.startsWith('0')) return `60${digits.substring(1)}`;
    return digits;
  };

  const generateStudentSummaryText = (s: FullStudentRecord): string => {
    return `MAKLUMAT MURID SK MERBAU PULAS
Nama: ${s.name}
No. KP / MyKid: ${s.ic} (ID: ${s.studentId || '-'})
Kelas: ${s.year} - ${s.className}
Guru Kelas: ${s.classTeacher || '-'}
Jantina: ${s.gender} | Tarikh Lahir: ${s.dob || '-'}
Penjaga 1: ${s.parent1Name || '-'} (${s.parent1Rel || 'Penjaga'})
No. Tel Penjaga 1: ${s.parent1Phone || '-'}
Pekerjaan Penjaga 1: ${s.parent1Job || '-'} (${s.parent1Employer || '-'})
Penjaga 2: ${s.parent2Name || '-'} (${s.parent2Rel || 'Ibu/Bapa'})
No. Tel Penjaga 2: ${s.parent2Phone || '-'}
Alamat: ${s.fullAddress || '-'}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 lg:p-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[60] bg-emerald-600 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-2 text-xs sm:text-sm font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-slate-900 border-0 sm:border sm:border-white/20 rounded-none sm:rounded-3xl w-full max-w-7xl h-[100dvh] sm:h-auto sm:max-h-[94vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 px-3 py-2.5 sm:p-5 border-b border-white/10 flex items-center justify-between gap-2 sm:gap-4 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md border border-emerald-400/40">
              <Users className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="hidden sm:flex px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/30 items-center gap-1">
                  <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                  <span>Google Sheets APDM Rasmi</span>
                </span>
                <span className="text-[10px] text-slate-300 font-mono hidden sm:inline">
                  {students.length > 0 ? `${students.length} Murid Terdaftar` : 'Memuat data...'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-xl font-black text-white tracking-tight truncate">
                  Portal Carian Murid SKMP
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/30 flex-shrink-0 sm:hidden">
                  {students.length} Murid
                </span>
              </div>
              <p className="text-xs text-slate-300 hidden sm:block">
                Pangkalan data komprehensif maklumat murid, kelas, ibu bapa/penjaga dan alamat kediaman.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="p-2 sm:px-3 sm:py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 border border-emerald-400 shadow-md"
              title="Segar semula data terus daripada Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? 'Menyegerak...' : 'Segar Semula'}</span>
            </button>

            <a
              href={GOOGLE_SHEET_STUDENTS_EDIT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:px-3 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-white/20"
              title="Buka fail Google Sheets di tab baharu"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Google Sheets</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-red-600/80 text-slate-300 hover:text-white rounded-xl transition border border-white/10"
              title="Tutup Portal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="bg-slate-950/70 px-3 sm:px-6 py-1.5 sm:py-2 border-b border-white/10 flex items-center justify-between gap-2 text-[11px] sm:text-xs flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 text-slate-300 truncate">
            <div className="flex items-center gap-1">
              <span className="text-slate-400 hidden sm:inline">Jumlah:</span>
              <strong className="text-white font-bold">{stats.total} Murid</strong>
            </div>
            <span className="text-white/20">•</span>
            <div className="flex items-center gap-1">
              <span className="text-blue-300">Lelaki:</span>
              <strong className="text-white font-bold">{stats.lelaki}</strong>
            </div>
            <span className="text-white/20">•</span>
            <div className="flex items-center gap-1">
              <span className="text-rose-300">Perempuan:</span>
              <strong className="text-white font-bold">{stats.perempuan}</strong>
            </div>
            {stats.oku > 0 && (
              <>
                <span className="text-white/20 hidden xs:inline">•</span>
                <div className="hidden xs:flex items-center gap-1 text-amber-300">
                  <span>OKU:</span>
                  <strong className="font-bold">{stats.oku}</strong>
                </div>
              </>
            )}
            {stats.yatim > 0 && (
              <>
                <span className="text-white/20 hidden xs:inline">•</span>
                <div className="hidden xs:flex items-center gap-1 text-purple-300">
                  <span>Yatim:</span>
                  <strong className="font-bold">{stats.yatim}</strong>
                </div>
              </>
            )}
          </div>

          <div className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Kemaskini: <span className="text-slate-200 font-mono">{lastUpdated || 'Terkini'}</span></span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-2.5 sm:p-4 bg-slate-900/95 border-b border-white/10 space-y-2 flex-shrink-0">
          {/* Main Search Input + Mobile Filter Toggle Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama murid, No. KP, penjaga, tel..."
                className="w-full pl-9 sm:pl-10 pr-8 py-2 sm:py-2.5 bg-slate-950 border border-white/15 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Filter Expand/Collapse Button */}
            <button
              type="button"
              onClick={() => setShowMobileFilters((prev) => !prev)}
              className={`sm:hidden px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border flex-shrink-0 ${
                showMobileFilters || activeFilterCount > 0
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                  : 'bg-white/10 text-slate-200 border-white/15 hover:bg-white/20'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Tapis</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-emerald-900 text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              {showMobileFilters ? (
                <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
              )}
            </button>

            {/* Reset Filter Button if any filter active */}
            {(activeFilterCount > 0 || searchQuery) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="hidden sm:flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-white/15 transition"
                title="Padam semua penapis carian"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Quick Horizontal Class Filter Pills (6IS, 6IK, 5IS, 5IK, ..., P.In, P.Ber) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
            <button
              type="button"
              onClick={() => {
                setSelectedClassCode('semua');
                setSelectedYear('semua');
                setSelectedClass('semua');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-black whitespace-nowrap transition flex-shrink-0 border ${
                selectedClassCode === 'semua' && selectedYear === 'semua' && selectedClass === 'semua'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              Semua ({students.length})
            </button>
            {ORDERED_CLASS_PILLS.map((pill) => {
              const isSelected = selectedClassCode === pill.code;
              const countInClass = students.filter((s) => getStudentClassCode(s) === pill.code).length;
              return (
                <button
                  key={pill.code}
                  type="button"
                  title={pill.fullName}
                  onClick={() => {
                    setSelectedClassCode(isSelected ? 'semua' : pill.code);
                    setSelectedYear('semua');
                    setSelectedClass('semua');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition flex-shrink-0 border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm font-black'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{pill.label}</span>
                  {countInClass > 0 && (
                    <span className={`text-[10px] ml-1 font-mono ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                      ({countInClass})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Detailed Filter Grid (Shown always on Desktop, collapsible on Mobile) */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-white/10 sm:border-t-0 sm:pt-0 ${
              showMobileFilters ? 'grid' : 'hidden sm:grid'
            }`}
          >
            {/* Year Filter */}
            <div>
              <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                Tahun / Aliran
              </label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedClassCode('semua');
                  setSelectedYear(e.target.value);
                  setSelectedClass('semua');
                }}
                className="w-full px-2.5 py-1.5 sm:py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="semua">Semua Tahun ({students.length})</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div>
              <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                Kelas
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClassCode('semua');
                  setSelectedClass(e.target.value);
                }}
                className="w-full px-2.5 py-1.5 sm:py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="semua">Semua Kelas</option>
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                Jantina
              </label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full px-2.5 py-1.5 sm:py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="semua">Semua Jantina</option>
                <option value="LELAKI">Lelaki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
            </div>

            {/* Special Status Filter */}
            <div>
              <label className="block text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                Status Khas
              </label>
              <select
                value={selectedSpecialStatus}
                onChange={(e) => setSelectedSpecialStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 sm:py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="semua">Semua Status</option>
                <option value="oku">Murid OKU</option>
                <option value="yatim">Anak Yatim</option>
                <option value="b40">Bantuan / B40</option>
              </select>
            </div>

            {/* Mobile Reset Action Button inside expanded filter */}
            {activeFilterCount > 0 && (
              <div className="col-span-2 sm:hidden pt-1">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full py-1.5 px-3 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Padam Semua Penapis ({activeFilterCount})</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-sm font-bold text-white">Memuat pangkalan data murid dari Google Sheets...</p>
              <p className="text-xs text-slate-400">Sila tunggu sebentar.</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-slate-950/40 border border-dashed border-white/15 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3 my-8">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-base font-black text-white">Tiada Rekod Murid Ditemui</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tiada murid yang sepadan dengan carian &ldquo;{searchQuery}&rdquo; atau penapis yang dipilih. Sila cuba kata kunci lain.
              </p>
              {(searchQuery || selectedClassCode !== 'semua' || selectedYear !== 'semua' || selectedClass !== 'semua' || selectedGender !== 'semua' || selectedSpecialStatus !== 'semua') && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition"
                >
                  Padam Semua Penapis
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  Menunjukkan <strong className="text-white font-bold">{filteredStudents.length}</strong> daripada {students.length} orang murid
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Klik mana-mana murid untuk membuka <strong>Profil Lengkap APDM</strong>
                </span>
              </div>

              {/* Student Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredStudents.map((student) => {
                  const isMale = student.gender === 'LELAKI';
                  const classCode = getStudentClassCode(student);
                  const cleanPhone1 = formatCleanPhone(student.parent1Phone);
                  const cleanPhone2 = formatCleanPhone(student.parent2Phone);

                      return (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className="bg-slate-950/70 hover:bg-slate-900 border border-white/10 hover:border-emerald-500/50 rounded-2xl p-2.5 sm:p-4 transition-all duration-200 shadow-lg hover:shadow-emerald-900/20 flex flex-col justify-between cursor-pointer group relative active:scale-[0.99]"
                    >
                      <div className="space-y-2 sm:space-y-3">
                        {/* Header: Bil + Year/Class + Gender Badge */}
                        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded bg-white/10 text-slate-300 font-bold">
                              #{student.bil}
                            </span>
                            <span
                              className={`text-[9px] sm:text-[10px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-md border ${
                                isMale
                                  ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                              }`}
                            >
                              {student.gender}
                            </span>
                            {classCode && (
                              <span className="text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-500/25 text-emerald-300 border border-emerald-400/40">
                                {classCode}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 truncate max-w-[120px] sm:max-w-[180px]">
                              {student.year} • {student.className}
                            </span>
                          </div>
                        </div>

                        {/* Main Student Info with Avatar / Photo & Quick Camera Button */}
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          {/* Student Photo or Gender Avatar */}
                          <div className="relative group/avatar flex-shrink-0">
                            {student.photoUrl ? (
                              <img
                                src={student.photoUrl}
                                alt={student.name}
                                className="w-12 h-14 sm:w-16 sm:h-18 rounded-xl sm:rounded-2xl object-cover border-2 border-emerald-400/60 shadow-md shadow-emerald-950/40 bg-slate-950"
                              />
                            ) : (
                              <div
                                className={`w-12 h-14 sm:w-16 sm:h-18 rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center shadow-inner transition ${
                                  isMale
                                    ? 'bg-gradient-to-b from-blue-950/80 to-slate-950 border-blue-400/40 text-blue-300'
                                    : 'bg-gradient-to-b from-rose-950/80 to-slate-950 border-rose-400/40 text-rose-300'
                                }`}
                              >
                                <User className="w-5 h-5 sm:w-7 sm:h-7 mb-0.5" />
                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight">
                                  {isMale ? 'Lelaki' : 'Perempuan'}
                                </span>
                              </div>
                            )}

                            {/* Quick Camera Snapshot Button on Avatar Corner */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPhotoModalStudent(student);
                                setIsPhotoModalOpen(true);
                              }}
                              className="absolute -bottom-1 -right-1 p-1 sm:p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg sm:rounded-xl shadow-lg border border-emerald-300 transition active:scale-95"
                              title="Tangkap / Muat Naik Gambar Murid (Kamera)"
                            >
                              <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                          </div>

                          {/* Student Name & IC & APDM ID */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-emerald-300 transition leading-snug line-clamp-2">
                              {student.name}
                            </h4>
                            <div className="flex flex-col gap-0.5 mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-slate-300 font-mono">
                              <span>
                                KP: <strong className="text-slate-100">{student.ic || '-'}</strong>
                              </span>
                              {student.studentId && (
                                <span className="text-[10px] text-slate-400">
                                  ID: {student.studentId}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Mobile Action Buttons (WhatsApp & Phone Call) shown directly on the right in Phone mode */}
                          {(student.parent1Phone || student.parent2Phone) && (
                            <div
                              className="flex sm:hidden flex-col items-center gap-1.5 flex-shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setContactModalStudent(student);
                                  setContactModalType('whatsapp');
                                }}
                                className="w-8 h-8 rounded-xl bg-emerald-500/25 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 flex items-center justify-center border border-emerald-400/40 transition active:scale-95 shadow-sm"
                                title="Pilihan WhatsApp Penjaga (Bapa / Ibu)"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setContactModalStudent(student);
                                  setContactModalType('call');
                                }}
                                className="w-8 h-8 rounded-xl bg-blue-500/25 hover:bg-blue-500 text-blue-300 hover:text-slate-950 flex items-center justify-center border border-blue-400/40 transition active:scale-95 shadow-sm"
                                title="Pilihan Panggilan Telefon Penjaga (Bapa / Ibu)"
                              >
                                <Phone className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Teacher & Parent Quick Info (Hidden on Mobile, shown on tablet/desktop) */}
                        <div className="hidden sm:block space-y-1.5 pt-2 border-t border-white/10 text-xs text-slate-300">
                          {student.classTeacher && (
                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                              <GraduationCap className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                              <span className="truncate">Guru: {student.classTeacher}</span>
                            </div>
                          )}

                          {student.parent1Name && (
                            <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                              <User className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                              <span className="truncate">
                                {student.parent1Rel || 'Penjaga'}:{' '}
                                <strong className="text-slate-200">{student.parent1Name}</strong>
                              </span>
                            </div>
                          )}

                          {(student.parent1Phone || student.parent2Phone) && (
                            <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                              <Phone className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                              <span className="font-mono text-yellow-300">
                                {student.parent1Phone || student.parent2Phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Actions (Hidden on Mobile, shown on tablet/desktop) */}
                      <div
                        className="hidden sm:flex mt-3 pt-2.5 border-t border-white/10 items-center justify-between gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(student)}
                          className="flex-1 py-1.5 px-2 bg-white/5 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Profil</span>
                        </button>

                        {/* Camera Studio button */}
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoModalStudent(student);
                            setIsPhotoModalOpen(true);
                          }}
                          className="p-1.5 bg-white/10 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-xl transition border border-white/10 flex items-center gap-1 text-xs font-bold px-2"
                          title="Tangkap / Muat Naik Gambar Murid (Kamera)"
                        >
                          <Camera className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                          <span className="hidden sm:inline">Foto</span>
                        </button>

                        {/* WhatsApp Parent Button with Choices */}
                        {(student.parent1Phone || student.parent2Phone) && (
                          <button
                            type="button"
                            onClick={() => {
                              setContactModalStudent(student);
                              setContactModalType('whatsapp');
                            }}
                            className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 rounded-xl transition border border-emerald-400/30"
                            title="Pilihan WhatsApp Penjaga (Bapa / Ibu)"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Call Parent Button with Choices */}
                        {(student.parent1Phone || student.parent2Phone) && (
                          <button
                            type="button"
                            onClick={() => {
                              setContactModalStudent(student);
                              setContactModalType('call');
                            }}
                            className="p-1.5 bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-slate-950 rounded-xl transition border border-blue-400/30"
                            title="Pilihan Panggilan Telefon Penjaga (Bapa / Ibu)"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950/80 px-3 sm:px-6 py-2 sm:py-3 border-t border-white/10 flex items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-400 flex-shrink-0">
          <span className="truncate">
            <span className="hidden sm:inline">Pangkalan Data Murid </span>SK Merbau Pulas (KBA5012) • Sumber: APDM
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition text-xs flex-shrink-0"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONTACT SELECTION MODAL (WHATSAPP / PANGGILAN BAPA & IBU / PENJAGA)       */}
      {/* ========================================================================= */}
      {contactModalStudent && (
        <div
          className="fixed inset-0 z-[75] bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
          onClick={() => setContactModalStudent(null)}
        >
          <div
            className="bg-slate-900 border-t sm:border border-white/20 rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-4 sm:p-5 border-b border-white/15 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg border ${
                    contactModalType === 'call'
                      ? 'bg-blue-600/30 text-blue-300 border-blue-400/40'
                      : 'bg-emerald-600/30 text-emerald-300 border-emerald-400/40'
                  }`}
                >
                  {contactModalType === 'call' ? (
                    <Phone className="w-5 h-5" />
                  ) : (
                    <MessageCircle className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-white truncate">
                    {contactModalType === 'call'
                      ? 'Pilihan Panggilan Telefon'
                      : 'Pilihan WhatsApp Penjaga'}
                  </h3>
                  <p className="text-xs text-emerald-300 font-bold truncate">
                    {contactModalStudent.name}
                  </p>
                  <p className="text-[11px] text-slate-300 truncate">
                    {contactModalStudent.year} • {contactModalStudent.className}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setContactModalStudent(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body: Parent/Guardian Selection List */}
            <div className="p-4 sm:p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Pilih nombor bapa, ibu atau penjaga yang ingin dihubungi:
              </p>

              {/* 1. Penjaga 1 (Bapa / Penjaga Utama) */}
              {contactModalStudent.parent1Phone ? (
                <div className="bg-slate-950/80 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-3.5 space-y-2.5 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center flex-shrink-0 font-black text-[11px]">
                        {contactModalStudent.parent1Rel?.toUpperCase().includes('IBU')
                          ? 'IBU'
                          : 'BAPA'}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300">
                          {contactModalStudent.parent1Rel || 'Penjaga 1 (Utama)'}
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-white truncate mt-0.5">
                          {contactModalStudent.parent1Name || 'Penjaga 1'}
                        </h4>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-yellow-300 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-400/20 flex-shrink-0">
                      {contactModalStudent.parent1Phone}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`https://wa.me/${formatCleanPhone(contactModalStudent.parent1Phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setContactModalStudent(null)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md border ${
                        contactModalType !== 'call'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/60 ring-2 ring-emerald-400/30'
                          : 'bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border-emerald-400/40'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`tel:${contactModalStudent.parent1Phone}`}
                      onClick={() => setContactModalStudent(null)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md border ${
                        contactModalType === 'call'
                          ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400/60 ring-2 ring-blue-400/30'
                          : 'bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border-blue-400/40'
                      }`}
                    >
                      <Phone className="w-4 h-4" />
                      <span>Panggil</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-3 text-xs text-slate-400 flex items-center justify-between">
                  <span>Penjaga 1: {contactModalStudent.parent1Name || 'Tiada Nama'}</span>
                  <span className="italic text-[11px] text-slate-300">(Tiada No. Tel)</span>
                </div>
              )}

              {/* 2. Penjaga 2 (Ibu / Penjaga Kedua) */}
              {contactModalStudent.parent2Phone ? (
                <div className="bg-slate-950/80 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-3.5 space-y-2.5 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center justify-center flex-shrink-0 font-black text-[11px]">
                        {contactModalStudent.parent2Rel?.toUpperCase().includes('BAPA')
                          ? 'BAPA'
                          : 'IBU'}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/10 text-slate-300">
                          {contactModalStudent.parent2Rel ||
                            (contactModalStudent.parent1Rel?.toUpperCase().includes('BAPA')
                              ? 'IBU KANDUNG'
                              : 'Penjaga 2')}
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-white truncate mt-0.5">
                          {contactModalStudent.parent2Name || 'Penjaga 2'}
                        </h4>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-yellow-300 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-400/20 flex-shrink-0">
                      {contactModalStudent.parent2Phone}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`https://wa.me/${formatCleanPhone(contactModalStudent.parent2Phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setContactModalStudent(null)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md border ${
                        contactModalType !== 'call'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/60 ring-2 ring-emerald-400/30'
                          : 'bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border-emerald-400/40'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`tel:${contactModalStudent.parent2Phone}`}
                      onClick={() => setContactModalStudent(null)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md border ${
                        contactModalType === 'call'
                          ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400/60 ring-2 ring-blue-400/30'
                          : 'bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border-blue-400/40'
                      }`}
                    >
                      <Phone className="w-4 h-4" />
                      <span>Panggil</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-3 text-xs text-slate-400 flex items-center justify-between">
                  <span>Penjaga 2: {contactModalStudent.parent2Name || 'Tiada Maklumat'}</span>
                  <span className="italic text-[11px] text-slate-300">(Tiada No. Tel)</span>
                </div>
              )}

              {!contactModalStudent.parent1Phone && !contactModalStudent.parent2Phone && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/20 text-center text-xs text-amber-200">
                  Tiada nombor telefon bapa, ibu atau penjaga didaftarkan dalam sistem APDM bagi murid ini.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-950 p-3 sm:p-4 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setSelectedStudent(contactModalStudent);
                  setContactModalStudent(null);
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lihat Profil Penuh APDM</span>
              </button>
              <button
                onClick={() => setContactModalStudent(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED STUDENT PROFILE MODAL (PROFIL LENGKAP APDM) */}
      {/* ========================================================================= */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[70] overflow-hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 lg:p-6 animate-fadeIn">
          <div className="bg-slate-900 border-0 sm:border sm:border-white/25 rounded-none sm:rounded-3xl w-full max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 px-3 py-3 sm:p-6 border-b border-white/15 flex items-start justify-between gap-3 flex-shrink-0">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                {/* Large Portrait Photo or Gender Avatar */}
                <div className="relative flex-shrink-0 flex flex-col items-center">
                  {selectedStudent.photoUrl ? (
                    <img
                      src={selectedStudent.photoUrl}
                      alt={selectedStudent.name}
                      className="w-16 h-20 sm:w-24 sm:h-28 rounded-2xl object-cover border-2 border-emerald-400 shadow-2xl shadow-emerald-950/60 bg-slate-950"
                    />
                  ) : (
                    <div
                      className={`w-20 h-24 sm:w-24 sm:h-28 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 shadow-lg border ${
                        selectedStudent.gender === 'LELAKI'
                          ? 'bg-gradient-to-b from-blue-950 to-slate-950 text-blue-300 border-blue-400/50'
                          : 'bg-gradient-to-b from-rose-950 to-slate-950 text-rose-300 border-rose-400/50'
                      }`}
                    >
                      <User className="w-10 h-10 mb-1" />
                      <span className="text-[10px] font-black uppercase tracking-tight">
                        {selectedStudent.gender}
                      </span>
                    </div>
                  )}

                  {/* Button to Capture/Change Photo */}
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoModalStudent(selectedStudent);
                      setIsPhotoModalOpen(true);
                    }}
                    className="mt-2 w-full py-1 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black transition flex items-center justify-center gap-1 border border-emerald-400/60 shadow-md"
                    title="Tangkap / Muat Naik Gambar Murid (Kamera)"
                  >
                    <Camera className="w-3 h-3" />
                    <span>{selectedStudent.photoUrl ? 'Tukar Foto' : 'Kamera'}</span>
                  </button>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 font-bold">
                      Bil. {selectedStudent.bil}
                    </span>
                    <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {selectedStudent.year} • {selectedStudent.className}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                        selectedStudent.gender === 'LELAKI'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                      }`}
                    >
                      {selectedStudent.gender}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black text-white mt-1">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">
                    No. KP: <strong className="text-yellow-300">{selectedStudent.ic || '-'}</strong> | ID APDM: {selectedStudent.studentId || '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() =>
                    handleCopy(generateStudentSummaryText(selectedStudent), 'Maklumat Penuh Murid')
                  }
                  className="p-2 bg-white/10 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
                  title="Salin semua maklumat murid"
                >
                  {copiedText === 'Maklumat Penuh Murid' ? (
                    <Check className="w-4 h-4 text-yellow-300" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Salin</span>
                </button>

                <button
                  onClick={handlePrintStudent}
                  className="p-2 bg-white/10 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
                  title="Cetak Profil Murid"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Cetak</span>
                </button>

                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 bg-white/10 hover:bg-red-600 text-slate-300 hover:text-white rounded-xl transition border border-white/10"
                  title="Tutup Profil"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Section 1: Maklumat Peribadi & Akademik */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1.1 Peribadi Murid */}
                <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-emerald-400 text-xs font-black uppercase tracking-wider">
                    <User className="w-4 h-4" />
                    <span>1. Maklumat Peribadi Murid</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">No. Kad Pengenalan</span>
                      <span className="font-mono text-white font-bold">{selectedStudent.ic || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Jenis Pengenalan</span>
                      <span className="text-slate-200">{selectedStudent.idType || 'KAD PENGENALAN'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Tarikh Lahir</span>
                      <span className="text-slate-200 font-mono">{selectedStudent.dob || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Jantina</span>
                      <span className="text-slate-200">{selectedStudent.gender}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Kaum / Bangsa</span>
                      <span className="text-slate-200">{selectedStudent.race || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Agama</span>
                      <span className="text-slate-200">{selectedStudent.religion || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Kewarganegaraan</span>
                      <span className="text-slate-200">{selectedStudent.citizenship || 'WARGANEGARA'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Status Pengajian</span>
                      <span className="text-emerald-300 font-bold">{selectedStudent.studyStatus || 'BERSEKOLAH'}</span>
                    </div>
                  </div>
                </div>

                {/* 1.2 Maklumat Kelas & Enrolmen */}
                <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-blue-400 text-xs font-black uppercase tracking-wider">
                    <GraduationCap className="w-4 h-4" />
                    <span>2. Maklumat Kelas & Enrolmen</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Tahun / Tingkatan</span>
                      <span className="text-white font-bold">{selectedStudent.year || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Nama Kelas</span>
                      <span className="text-blue-300 font-bold">{selectedStudent.className || '-'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[11px] block">Nama Guru Kelas</span>
                      <span className="text-slate-200 font-bold">{selectedStudent.classTeacher || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Tarikh Masuk Sekolah</span>
                      <span className="text-slate-300 font-mono">{selectedStudent.dateEnrolledSchool || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Tarikh Masuk Kelas</span>
                      <span className="text-slate-300 font-mono">{selectedStudent.dateEnrolledClass || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Jenis / Aliran Kelas</span>
                      <span className="text-slate-300">{selectedStudent.streamDesc || 'PERDANA / AKADEMIK'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Status DLP</span>
                      <span className="text-slate-300">{selectedStudent.dlpStatus || 'TIDAK'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Maklumat Ibu Bapa & Penjaga */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 2.1 Penjaga 1 (Utama) */}
                <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 text-yellow-400 text-xs font-black uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4" />
                      <span>3. Maklumat Penjaga 1 (Utama)</span>
                    </div>
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded border border-yellow-400/30">
                      {selectedStudent.parent1Rel || 'Penjaga Utama'}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Nama Penuh</span>
                      <span className="text-white font-black text-sm">{selectedStudent.parent1Name || '-'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 text-[11px] block">No. Kad Pengenalan</span>
                        <span className="font-mono text-slate-200">{selectedStudent.parent1Ic || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Pekerjaan</span>
                        <span className="text-slate-200">{selectedStudent.parent1Job || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Nama Majikan</span>
                        <span className="text-slate-300">{selectedStudent.parent1Employer || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Pendapatan Bulanan</span>
                        <span className="text-emerald-300 font-bold">
                          {selectedStudent.parent1Income ? `RM ${selectedStudent.parent1Income}` : '-'}
                        </span>
                      </div>
                    </div>

                    {/* Contact Phone & WhatsApp */}
                    <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-slate-400 text-[11px] block">No. Telefon Bimbit</span>
                        <span className="font-mono text-yellow-300 font-bold text-sm">
                          {selectedStudent.parent1Phone || '-'}
                        </span>
                      </div>

                      {selectedStudent.parent1Phone && (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`https://wa.me/${formatCleanPhone(selectedStudent.parent1Phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-md"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={`tel:${selectedStudent.parent1Phone}`}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-md"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Panggil</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2.2 Penjaga 2 */}
                <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 text-rose-400 text-xs font-black uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4" />
                      <span>4. Maklumat Penjaga 2</span>
                    </div>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-400/30">
                      {selectedStudent.parent2Rel || 'Penjaga 2'}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Nama Penuh</span>
                      <span className="text-white font-black text-sm">{selectedStudent.parent2Name || '-'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 text-[11px] block">No. Kad Pengenalan</span>
                        <span className="font-mono text-slate-200">{selectedStudent.parent2Ic || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Pekerjaan</span>
                        <span className="text-slate-200">{selectedStudent.parent2Job || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Nama Majikan</span>
                        <span className="text-slate-300">{selectedStudent.parent2Employer || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Pendapatan Bulanan</span>
                        <span className="text-emerald-300 font-bold">
                          {selectedStudent.parent2Income ? `RM ${selectedStudent.parent2Income}` : '-'}
                        </span>
                      </div>
                    </div>

                    {/* Contact Phone & WhatsApp */}
                    <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-slate-400 text-[11px] block">No. Telefon Bimbit</span>
                        <span className="font-mono text-yellow-300 font-bold text-sm">
                          {selectedStudent.parent2Phone || '-'}
                        </span>
                      </div>

                      {selectedStudent.parent2Phone && (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`https://wa.me/${formatCleanPhone(selectedStudent.parent2Phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-md"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={`tel:${selectedStudent.parent2Phone}`}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-md"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Panggil</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Alamat Kediaman & Maklumat Bantuan/Khas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 3.1 Alamat Kediaman */}
                <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-emerald-400 text-xs font-black uppercase tracking-wider">
                    <MapPin className="w-4 h-4" />
                    <span>5. Alamat Tempat Tinggal</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="text-white font-medium leading-relaxed bg-slate-900 p-3 rounded-xl border border-white/10">
                      {selectedStudent.fullAddress || 'Tiada maklumat alamat lengkap'}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Poskod</span>
                        <span className="font-mono text-slate-200 font-bold">{selectedStudent.postcode || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Bandar</span>
                        <span className="text-slate-200">{selectedStudent.city || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Daerah</span>
                        <span className="text-slate-200">{selectedStudent.district || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Negeri</span>
                        <span className="text-slate-200">{selectedStudent.state || 'KEDAH'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3.2 Status Khas, Yatim & Akaun Bank */}
                <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-purple-400 text-xs font-black uppercase tracking-wider">
                    <CreditCard className="w-4 h-4" />
                    <span>6. Status Khas, Kebajikan & Akaun Bank</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Status OKU</span>
                      <span className="text-slate-200 font-bold">{selectedStudent.isOku || 'TIDAK'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Status Anak Yatim</span>
                      <span className="text-slate-200 font-bold">{selectedStudent.orphanStatus || 'BUKAN'}</span>
                    </div>
                    {selectedStudent.okuCategory && (
                      <div className="col-span-2">
                        <span className="text-slate-400 text-[11px] block">Kategori OKU</span>
                        <span className="text-amber-300">{selectedStudent.okuCategory} ({selectedStudent.okuSubCategory || '-'})</span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400 text-[11px] block">Nama Bank</span>
                      <span className="text-slate-200">{selectedStudent.bankName || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">No. Akaun Bank</span>
                      <span className="font-mono text-slate-200">{selectedStudent.bankAccountNo || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950/80 px-4 sm:px-6 py-3 border-t border-white/10 flex items-center justify-between gap-3 flex-shrink-0">
              <span className="text-xs text-slate-400 font-mono">
                Rekod APDM SK Merbau Pulas
              </span>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition shadow-lg"
              >
                Tutup Profil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Photo Camera & Upload Studio Modal */}
      <StudentPhotoCaptureModal
        isOpen={isPhotoModalOpen}
        student={photoModalStudent}
        onClose={() => {
          setIsPhotoModalOpen(false);
          setPhotoModalStudent(null);
        }}
        onPhotoSaved={handlePhotoSaved}
      />
    </div>
  );
};
