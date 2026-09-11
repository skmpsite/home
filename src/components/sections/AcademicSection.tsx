import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarEvent,
  SchoolProfile,
  Staff,
  UserRole,
  isTeacherRole,
  canEditKurikulum,
  AcademicSubject,
  AcademicProgram,
  NewsItem
} from '../../types';
import {
  GraduationCap,
  Calendar as CalendarIcon,
  BookOpen,
  Layers,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  Award,
  FileText,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Laptop,
  ExternalLink,
  Globe,
  Wallet,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Sliders,
  Check,
  X
} from 'lucide-react';
import { formatGoogleDriveUrl } from '../../utils/imageHelpers';
import { findPkPentadbiranStaff } from '../../utils/staffHelpers';
import {
  loadAcademicSubjects,
  saveAcademicSubjects,
  loadAcademicPrograms,
  saveAcademicPrograms
} from '../../utils/storage';
import { IctBookingSubSection } from './IctBookingSubSection';
import { IctDelimaSubSection } from './IctDelimaSubSection';
import { IctFinanceSubSection } from './IctFinanceSubSection';
import { UnitNewsSection } from '../common/UnitNewsSection';

interface AcademicSectionProps {
  events: CalendarEvent[];
  onSaveEvents?: (events: CalendarEvent[]) => void;
  profile?: SchoolProfile;
  staffList?: Staff[];
  newsList?: NewsItem[];
  onSaveNews?: (news: NewsItem[]) => void;
  initialSubTab?: 'utama' | 'ict';
  initialIctSubTab?: 'jadual' | 'delima' | 'kewangan';
  isAdmin?: boolean;
  isTeacher?: boolean;
  userRole?: UserRole | null;
  onOpenLogin?: () => void;
}

export const AcademicSection: React.FC<AcademicSectionProps> = ({
  events,
  onSaveEvents,
  profile,
  staffList,
  newsList = [],
  onSaveNews = () => {},
  initialSubTab = 'utama',
  initialIctSubTab = 'jadual',
  isAdmin = false,
  isTeacher = false,
  userRole = null,
  onOpenLogin
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'utama' | 'ict'>(initialSubTab);
  const [activeIctSubTab, setActiveIctSubTab] = useState<'jadual' | 'delima' | 'kewangan'>(initialIctSubTab);

  // Semak kuasa mengedit Kurikulum: Admin, PK1, SU Kurikulum
  const canEdit = canEditKurikulum(userRole, isAdmin);
  const [isEditMode, setIsEditMode] = useState<boolean>(true);

  // Toast / notification
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const showStatus = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // State untuk Programs
  const [academicPrograms, setAcademicPrograms] = useState<AcademicProgram[]>(() => loadAcademicPrograms());
  // State untuk Subjects
  const [academicSubjects, setAcademicSubjects] = useState<AcademicSubject[]>(() => loadAcademicSubjects());

  // Akses Kewangan ICT hanya dibuka untuk log masuk Guru dan Pentadbir
  const canAccessFinance = isAdmin || isTeacher || isTeacherRole(userRole);

  // Sekiranya pengguna belum log masuk sebagai guru/admin tetapi tab kewangan terpilih, kembali ke jadual
  useEffect(() => {
    if (!canAccessFinance && activeIctSubTab === 'kewangan') {
      setActiveIctSubTab('jadual');
    }
  }, [canAccessFinance, activeIctSubTab]);

  // Sync with initialSubTab prop changes if any
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    if (initialIctSubTab) {
      if (initialIctSubTab === 'kewangan' && !canAccessFinance) {
        setActiveIctSubTab('jadual');
      } else {
        setActiveIctSubTab(initialIctSubTab);
      }
    }
  }, [initialIctSubTab, canAccessFinance]);

  // Listener capaian pantas terus ke tab ICT (contoh: dari butang ICT Sweetbot)
  useEffect(() => {
    const handleNavIct = () => {
      setActiveSubTab('ict');
      setActiveIctSubTab('jadual');
    };
    window.addEventListener('skmp-navigate-ict', handleNavIct);
    return () => window.removeEventListener('skmp-navigate-ict', handleNavIct);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<'semua' | 'peperiksaan' | 'cuti' | 'acara' | 'pibg'>('semua');
  const [selectedEventModal, setSelectedEventModal] = useState<CalendarEvent | null>(null);
  const [showDesc, setShowDesc] = useState<boolean>(true);

  // Edit / Add Modal States
  const [editingProgram, setEditingProgram] = useState<AcademicProgram | null>(null);
  const [isAddingProgram, setIsAddingProgram] = useState<boolean>(false);

  const [editingSubject, setEditingSubject] = useState<AcademicSubject | null>(null);
  const [isAddingSubject, setIsAddingSubject] = useState<boolean>(false);

  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isAddingEvent, setIsAddingEvent] = useState<boolean>(false);

  // Delete Confirm Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'program' | 'subject' | 'event';
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDesc(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Ambil maklumat Penolong Kanan Pentadbiran / Kurikulum mengikut Barisan Pentadbir Utama
  const pkPentadbiranStaff = useMemo(() => {
    if (staffList && staffList.length > 0) {
      return findPkPentadbiranStaff(staffList, profile);
    }
    return undefined;
  }, [staffList, profile]);

  const pkKurikulumName = pkPentadbiranStaff?.name || "Puan Noraini binti Yusof";
  const pkKurikulumTitle = pkPentadbiranStaff?.position || "Guru Penolong Kanan Pentadbiran (PK 1)";
  const pkKurikulumGrade = pkPentadbiranStaff?.grade || "DG44";
  const pkKurikulumInfo = pkPentadbiranStaff?.grade
    ? (pkPentadbiranStaff.grade.startsWith('DG') ? `Pegawai Perkhidmatan Pendidikan (${pkPentadbiranStaff.grade})` : `Gred ${pkPentadbiranStaff.grade}`)
    : "Pegawai Perkhidmatan Pendidikan (DG44)";

  const pkKurikulumPhoto = useMemo(() => {
    if (pkPentadbiranStaff?.photoUrl && pkPentadbiranStaff.photoUrl.trim() !== '') {
      return formatGoogleDriveUrl(pkPentadbiranStaff.photoUrl);
    }
    return '';
  }, [pkPentadbiranStaff]);

  const filteredEvents = events.filter(
    (e) => selectedCategory === 'semua' || e.category === selectedCategory
  );

  // Label peranan pengguna pengurus kurikulum
  const managerRoleLabel = useMemo(() => {
    if (isAdmin || userRole === 'admin') return 'Pentadbir Sistem (Admin)';
    if (userRole === 'pk_kurikulum') return 'GPK Pentadbiran / Kurikulum (PK 1)';
    if (userRole === 'su_kurikulum') return 'Setiausaha Kurikulum';
    return 'Pengurus Kurikulum';
  }, [isAdmin, userRole]);

  // Handler: Reorder & Manage Programs
  const handleMoveProgram = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= academicPrograms.length) return;
    const newPrograms = [...academicPrograms];
    const temp = newPrograms[index];
    newPrograms[index] = newPrograms[targetIdx];
    newPrograms[targetIdx] = temp;
    setAcademicPrograms(newPrograms);
    saveAcademicPrograms(newPrograms);
    showStatus('Susunan program kurikulum berjaya dikemas kini!');
  };

  const handleSaveProgram = (program: AcademicProgram) => {
    let updated: AcademicProgram[];
    const exists = academicPrograms.some((p) => p.id === program.id);
    if (exists) {
      updated = academicPrograms.map((p) => (p.id === program.id ? program : p));
      showStatus(`Program "${program.title}" berjaya dikemas kini!`);
    } else {
      updated = [...academicPrograms, program];
      showStatus(`Program baharu "${program.title}" berjaya ditambah!`);
    }
    setAcademicPrograms(updated);
    saveAcademicPrograms(updated);
    setEditingProgram(null);
    setIsAddingProgram(false);
  };

  const handleDeleteProgram = (id: string) => {
    const updated = academicPrograms.filter((p) => p.id !== id);
    setAcademicPrograms(updated);
    saveAcademicPrograms(updated);
    setDeleteConfirm(null);
    showStatus('Program kurikulum berjaya dipadam.');
  };

  // Handler: Reorder & Manage Subjects
  const handleMoveSubject = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= academicSubjects.length) return;
    const newSubjects = [...academicSubjects];
    const temp = newSubjects[index];
    newSubjects[index] = newSubjects[targetIdx];
    newSubjects[targetIdx] = temp;
    setAcademicSubjects(newSubjects);
    saveAcademicSubjects(newSubjects);
    showStatus('Susunan mata pelajaran berjaya dikemas kini!');
  };

  const handleSaveSubject = (subject: AcademicSubject) => {
    let updated: AcademicSubject[];
    const exists = academicSubjects.some((s) => s.id === subject.id);
    if (exists) {
      updated = academicSubjects.map((s) => (s.id === subject.id ? subject : s));
      showStatus(`Mata pelajaran "${subject.name}" berjaya dikemas kini!`);
    } else {
      updated = [...academicSubjects, subject];
      showStatus(`Mata pelajaran "${subject.name}" berjaya ditambah!`);
    }
    setAcademicSubjects(updated);
    saveAcademicSubjects(updated);
    setEditingSubject(null);
    setIsAddingSubject(false);
  };

  const handleDeleteSubject = (id: string) => {
    const updated = academicSubjects.filter((s) => s.id !== id);
    setAcademicSubjects(updated);
    saveAcademicSubjects(updated);
    setDeleteConfirm(null);
    showStatus('Mata pelajaran berjaya dipadam.');
  };

  // Handler: Reorder & Manage Calendar Events
  const handleMoveEvent = (eventId: string, direction: -1 | 1) => {
    if (!onSaveEvents) return;
    const index = events.findIndex((e) => e.id === eventId);
    if (index === -1) return;
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= events.length) return;
    const newEvents = [...events];
    const temp = newEvents[index];
    newEvents[index] = newEvents[targetIdx];
    newEvents[targetIdx] = temp;
    onSaveEvents(newEvents);
    showStatus('Susunan acara takwim berjaya dikemas kini!');
  };

  const handleSaveEvent = (eventData: CalendarEvent) => {
    if (!onSaveEvents) return;
    let updated: CalendarEvent[];
    const exists = events.some((e) => e.id === eventData.id);
    if (exists) {
      updated = events.map((e) => (e.id === eventData.id ? eventData : e));
      showStatus(`Acara "${eventData.title}" berjaya dikemas kini!`);
    } else {
      updated = [eventData, ...events];
      showStatus(`Acara baharu "${eventData.title}" berjaya ditambah ke takwim!`);
    }
    onSaveEvents(updated);
    setEditingEvent(null);
    setIsAddingEvent(false);
  };

  const handleDeleteEvent = (id: string) => {
    if (!onSaveEvents) return;
    const updated = events.filter((e) => e.id !== id);
    onSaveEvents(updated);
    setDeleteConfirm(null);
    showStatus('Acara takwim berjaya dipadam.');
  };

  const renderProgramIcon = (iconName?: string) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-blue-300" />;
      case 'Award':
        return <Award className="w-5 h-5 text-yellow-300" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-emerald-300" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-purple-300" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5 text-cyan-300" />;
      default:
        return <BookOpen className="w-5 h-5 text-blue-300" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Banner */}
      <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-xs border border-yellow-400/30 mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Pengajian & Kurikulum</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Akademik & Takwim Persekolahan</h2>
            
            {/* Collapsible Info with 5-second auto-hide & simple arrow toggle */}
            <div className="mt-1 max-w-2xl">
              <div
                className={`transition-all duration-500 overflow-hidden ${
                  showDesc ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pb-1">
                  Maklumat kurikulum KSSR Semakan, program Dual Language Programme (DLP), Pentaksiran Bilik Darjah (PBD), dan Takwim Peperiksaan & Cuti Sekolah.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDesc(!showDesc)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-yellow-300 hover:text-yellow-200 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition mt-1 border border-white/10"
                title={showDesc ? "Sembunyikan penerangan" : "Baca penerangan penuh"}
              >
                <span>{showDesc ? "Sembunyikan Info" : "Info Kurikulum"}</span>
                {showDesc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* PK Pentadbiran Profile Mini-Card with Picture, Position, Name & Info */}
          <div className="bg-slate-900/85 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/20 flex items-center gap-4 flex-shrink-0 shadow-xl hover:border-yellow-400/50 transition">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-yellow-400 p-0.5 shadow-md overflow-hidden border-2 border-yellow-300 flex items-center justify-center flex-shrink-0">
              {pkKurikulumPhoto && pkKurikulumPhoto.trim() !== '' ? (
                <img
                  src={pkKurikulumPhoto}
                  alt={pkKurikulumName}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    const fallback = parent?.querySelector('.fallback-pkkurikulum-icon');
                    if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                  }}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : null}
              <div
                className={`fallback-pkkurikulum-icon w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-yellow-300 ${
                  pkKurikulumPhoto && pkKurikulumPhoto.trim() !== '' ? 'hidden' : 'flex'
                }`}
              >
                <UserCheck className="w-8 h-8 opacity-80" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {pkKurikulumTitle}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-950 text-yellow-300 border border-white/20">
                  {pkKurikulumGrade}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                {pkKurikulumName}
              </h4>
              <p className="text-xs text-slate-300 font-medium">
                {pkKurikulumInfo}
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Menu Navigation: Utama Kurikulum & ICT */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Sub Menu: Utama Kurikulum */}
            <button
              type="button"
              onClick={() => setActiveSubTab('utama')}
              className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-sm ${
                activeSubTab === 'utama'
                  ? 'bg-yellow-400 text-blue-950 shadow-md shadow-yellow-400/20 border border-yellow-300'
                  : 'bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Utama Kurikulum</span>
            </button>

            {/* 2. Sub Menu: ICT */}
            <button
              type="button"
              onClick={() => setActiveSubTab('ict')}
              className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-sm ${
                activeSubTab === 'ict'
                  ? 'bg-yellow-400 text-blue-950 shadow-md shadow-yellow-400/20 border border-yellow-300'
                  : 'bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-400/40'
              }`}
            >
              <Laptop className="w-4 h-4 text-blue-400" />
              <span>ICT</span>
              <span className={`text-[9.5px] px-1.5 py-0.5 rounded-full font-black ${
                activeSubTab === 'ict'
                  ? 'bg-blue-950 text-yellow-300'
                  : 'bg-blue-500/30 text-blue-200'
              }`}>
                {canAccessFinance ? 'Jadual • DELIMa • Kewangan' : 'Jadual • DELIMa'}
              </span>
            </button>
          </div>

          <div className="text-[11px] text-slate-300 hidden sm:block font-medium">
            {activeSubTab === 'ict'
              ? activeIctSubTab === 'jadual'
                ? 'Sistem Tempahan Makmal Komputer (Ahad–Kha | 7.45am–1.15pm)'
                : activeIctSubTab === 'delima'
                ? 'Gerbang Semakan ID DELIMa Google Workspace KPM'
                : 'Sistem Aliran Tunai & Penyata Kewangan Makmal Komputer'
              : 'Struktur Kurikulum, DLP & Takwim Akademik SK Merbau Pulas'}
          </div>
        </div>
      </div>

      {/* CONDITIONAL SUB-MENU CONTENT */}
      {activeSubTab === 'ict' ? (
        <div className="space-y-6">
          {/* Sub Menu Navigation under ICT: Jadual ICT | ID DELIMa | Kewangan */}
          <div className="bg-slate-900/90 backdrop-blur-xl p-2.5 rounded-2xl border border-white/15 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* 1. Sub Menu: Jadual ICT */}
              <button
                type="button"
                onClick={() => setActiveIctSubTab('jadual')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-sm ${
                  activeIctSubTab === 'jadual'
                    ? 'bg-yellow-400 text-blue-950 shadow-md shadow-yellow-400/30 border border-yellow-300'
                    : 'bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Jadual ICT</span>
              </button>

              {/* 2. Sub Menu: ID DELIMa (Dibuka terus di page yang sama tanpa buka tab baru) */}
              <button
                type="button"
                onClick={() => setActiveIctSubTab('delima')}
                className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-sm ${
                  activeIctSubTab === 'delima'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30 border border-indigo-400'
                    : 'bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-400/30'
                }`}
                title="Semakan ID DELIMa SK Merbau Pulas"
              >
                <Globe className="w-4 h-4 text-indigo-300" />
                <span>ID DELIMa</span>
              </button>

              {/* 3. Sub Menu: Kewangan (Hanya muncul untuk log masuk Guru dan Admin sahaja) */}
              {canAccessFinance && (
                <button
                  type="button"
                  onClick={() => setActiveIctSubTab('kewangan')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-sm ${
                    activeIctSubTab === 'kewangan'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md shadow-emerald-500/30 border border-emerald-400'
                      : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-400/30'
                  }`}
                  title="Aliran Tunai & Penyata Kewangan ICT (Akses Khas Guru & Admin)"
                >
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>Kewangan</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-black bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 uppercase">
                    Guru & Admin
                  </span>
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-300 hidden md:block font-medium pr-2">
              {activeIctSubTab === 'jadual' && 'Tempahan Slot Makmal Komputer & Rekod Penggunaan'}
              {activeIctSubTab === 'delima' && 'Portal Semakan ID DELIMa Rasmi SK Merbau Pulas'}
              {canAccessFinance && activeIctSubTab === 'kewangan' && 'Aliran Tunai Keluar Masuk & Pengiraan Baki Automatik'}
            </div>
          </div>

          {/* Sub Menu Content */}
          {activeIctSubTab === 'jadual' && (
            <IctBookingSubSection
              isAdmin={isAdmin}
              isTeacher={isTeacher}
              userRole={userRole}
              profile={profile}
              staffList={staffList}
              onOpenLogin={onOpenLogin}
            />
          )}

          {activeIctSubTab === 'delima' && (
            <IctDelimaSubSection />
          )}

          {canAccessFinance && activeIctSubTab === 'kewangan' && (
            <IctFinanceSubSection
              isAdmin={isAdmin}
              isTeacher={isTeacher}
              userRole={userRole}
              profile={profile}
              staffList={staffList}
              onOpenLogin={onOpenLogin}
            />
          )}
        </div>
      ) : (
        <>
          {/* Manager Toolbar for Admin, PK1, and SU Kurikulum */}
          {canEdit && (
            <div className="bg-gradient-to-r from-blue-900/80 via-indigo-900/80 to-purple-900/80 backdrop-blur-xl border-2 border-yellow-400/60 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-blue-950 flex items-center justify-center font-black shadow-md flex-shrink-0">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-yellow-400 text-blue-950">
                        {managerRoleLabel}
                      </span>
                      <span className="text-[10px] font-bold text-yellow-300 bg-white/10 px-2 py-0.5 rounded-md border border-white/15">
                        Akses Pengurusan Langsung
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                      Mod Sunting & Susun Atur Terus Halaman Kurikulum
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md ${
                      isEditMode
                        ? 'bg-yellow-400 text-blue-950 shadow-yellow-400/20'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isEditMode ? 'opacity-100' : 'opacity-40'}`} />
                    <span>{isEditMode ? 'Mod Sunting: AKTIF' : 'Mod Pratonton Sahaja'}</span>
                  </button>
                </div>
              </div>

              {isEditMode && (
                <div className="pt-2 border-t border-white/15 flex flex-wrap items-center gap-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingEvent(true);
                      setEditingEvent({
                        id: 'evt-' + Date.now(),
                        title: '',
                        date: new Date().toISOString().split('T')[0],
                        category: 'acara',
                        description: '',
                        location: 'Dewan Gemilang SKMP',
                        targetGroup: 'Semua Warga SKMP'
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 border border-yellow-400/40 font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Acara Takwim</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingSubject(true);
                      setEditingSubject({
                        id: 'sub-' + Date.now(),
                        name: '',
                        type: 'Teras',
                        icon: '📚'
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/40 font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Mata Pelajaran</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingProgram(true);
                      setEditingProgram({
                        id: 'prog-' + Date.now(),
                        title: '',
                        badge: 'Program Khas',
                        description: '',
                        iconName: 'BookOpen'
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Program Utama</span>
                  </button>

                  <span className="text-[11px] text-slate-300 ml-auto italic">
                    Gunakan butang anak panah untuk menyusun urutan, butang pensel untuk mengedit, atau butang tong sampah untuk memadam.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Toast Notification */}
          {statusMsg && (
            <div className="fixed bottom-6 right-6 z-50 bg-yellow-400 text-blue-950 font-black px-4 py-3 rounded-2xl shadow-2xl border-2 border-white/40 flex items-center gap-3 animate-bounce">
              <Sparkles className="w-5 h-5 text-blue-950" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Bahagian Berita & Pengumuman Kurikulum */}
          <UnitNewsSection
            unit="kurikulum"
            unitTitle="Berita & Pengumuman Kurikulum"
            unitSubtitle="Hebahan program akademik, pentaksiran UASA, dialog prestasi, dan makluman panitia."
            newsList={newsList}
            onSaveNews={onSaveNews}
            canEdit={canEdit}
            managerRoleLabel={managerRoleLabel}
            onOpenLogin={onOpenLogin}
          />

          {/* Curriculum & Key Programs Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-yellow-400" />
                <h3 className="text-xl font-black text-white">Program Utama & Fokus Kurikulum</h3>
              </div>

              {canEdit && isEditMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingProgram(true);
                    setEditingProgram({
                      id: 'prog-' + Date.now(),
                      title: '',
                      badge: 'Program Khas',
                      description: '',
                      iconName: 'BookOpen'
                    });
                  }}
                  className="px-3 py-1 bg-yellow-400 hover:bg-yellow-300 text-blue-950 rounded-xl text-xs font-black transition flex items-center gap-1 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Program</span>
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {academicPrograms.map((prog, idx) => (
                <div
                  key={prog.id}
                  className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg space-y-3 relative group hover:border-yellow-400/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 bg-blue-500/20 text-blue-300 rounded-2xl flex items-center justify-center font-bold border border-blue-400/30">
                      {renderProgramIcon(prog.iconName)}
                    </div>

                    {/* Admin / PK1 / SU Kurikulum controls */}
                    {canEdit && isEditMode && (
                      <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-white/15">
                        <button
                          type="button"
                          onClick={() => handleMoveProgram(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 text-slate-300 hover:text-yellow-300 disabled:opacity-30 transition"
                          title="Pindah ke kiri"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveProgram(idx, 1)}
                          disabled={idx === academicPrograms.length - 1}
                          className="p-1 text-slate-300 hover:text-yellow-300 disabled:opacity-30 transition"
                          title="Pindah ke kanan"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingProgram(false);
                            setEditingProgram(prog);
                          }}
                          className="p-1 text-blue-300 hover:text-blue-200 transition"
                          title="Sunting program"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirm({
                              type: 'program',
                              id: prog.id,
                              title: prog.title
                            })
                          }
                          className="p-1 text-red-400 hover:text-red-300 transition"
                          title="Padam program"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    {prog.badge && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                        {prog.badge}
                      </span>
                    )}
                    <h3 className="font-extrabold text-white text-base mt-1">{prog.title}</h3>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-normal">
                    {prog.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects Directory Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-yellow-400" />
                <h3 className="text-xl font-black text-white">Senarai Mata Pelajaran Teras & Elektif</h3>
              </div>

              {canEdit && isEditMode && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingSubject(true);
                    setEditingSubject({
                      id: 'sub-' + Date.now(),
                      name: '',
                      type: 'Teras',
                      icon: '📚'
                    });
                  }}
                  className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 rounded-xl text-xs font-black transition flex items-center gap-1 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Mata Pelajaran</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {academicSubjects.map((sub, idx) => (
                <div
                  key={sub.id}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition flex flex-col justify-between group relative"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="text-2xl">{sub.icon}</div>

                    {/* Reorder & Edit controls */}
                    {canEdit && isEditMode && (
                      <div className="flex items-center gap-0.5 bg-slate-950/80 p-0.5 rounded-lg border border-white/10">
                        <button
                          type="button"
                          onClick={() => handleMoveSubject(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 text-slate-300 hover:text-yellow-300 disabled:opacity-20 transition"
                          title="Pindah ke kiri"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSubject(idx, 1)}
                          disabled={idx === academicSubjects.length - 1}
                          className="p-1 text-slate-300 hover:text-yellow-300 disabled:opacity-20 transition"
                          title="Pindah ke kanan"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingSubject(false);
                            setEditingSubject(sub);
                          }}
                          className="p-1 text-blue-300 hover:text-blue-200 transition"
                          title="Sunting subjek"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirm({
                              type: 'subject',
                              id: sub.id,
                              title: sub.name
                            })
                          }
                          className="p-1 text-red-400 hover:text-red-300 transition"
                          title="Padam subjek"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h5 className="font-extrabold text-xs text-white line-clamp-1">{sub.name}</h5>
                    <span className="text-[10px] text-yellow-400 font-bold">{sub.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar / Takwim Sekolah Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-yellow-400" />
                <h3 className="text-xl font-black text-white">Takwim & Acara Persekolahan Sesi 2026/2027</h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {canEdit && isEditMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingEvent(true);
                      setEditingEvent({
                        id: 'evt-' + Date.now(),
                        title: '',
                        date: new Date().toISOString().split('T')[0],
                        category: 'acara',
                        description: '',
                        location: 'Dewan Gemilang SKMP',
                        targetGroup: 'Semua Warga SKMP'
                      });
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs transition flex items-center gap-1 shadow-md cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Acara Takwim</span>
                  </button>
                )}

                {/* Filter Categories */}
                {[
                  { id: 'semua', label: 'Semua Takwim' },
                  { id: 'peperiksaan', label: 'Peperiksaan / PBD' },
                  { id: 'cuti', label: 'Cuti Sekolah' },
                  { id: 'acara', label: 'Acara & Program' },
                  { id: 'pibg', label: 'PIBG' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedCategory === tab.id
                        ? 'bg-yellow-400 text-blue-950 font-black shadow-lg shadow-yellow-400/20'
                        : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Events List */}
            <div className="grid md:grid-cols-2 gap-4">
              {filteredEvents.map((evt) => {
                const eventIndex = events.findIndex((e) => e.id === evt.id);
                return (
                  <div
                    key={evt.id}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-400/50 transition shadow-md flex items-start gap-4 relative group"
                  >
                    <div
                      onClick={() => setSelectedEventModal(evt)}
                      className="bg-yellow-400 text-blue-950 rounded-2xl p-3 text-center min-w-[60px] shadow-md flex-shrink-0 cursor-pointer"
                    >
                      <span className="block text-[10px] font-black uppercase text-blue-950">
                        {new Date(evt.date).toLocaleString('ms-MY', { month: 'short' })}
                      </span>
                      <span className="block text-xl font-black text-blue-950 mt-0.5">
                        {new Date(evt.date).getDate()}
                      </span>
                    </div>

                    <div className="space-y-1 overflow-hidden flex-1 cursor-pointer" onClick={() => setSelectedEventModal(evt)}>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
                          {evt.category}
                        </span>
                        {evt.endDate && (
                          <span className="text-[10px] text-slate-300 font-medium">
                            Hingga {evt.endDate}
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-white line-clamp-1">
                        {evt.title}
                      </h4>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                      <div className="pt-1 flex items-center gap-3 text-[11px] text-slate-300">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-yellow-400" />
                          {evt.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-yellow-400" />
                          {evt.targetGroup}
                        </span>
                      </div>
                    </div>

                    {/* Controls for Admin, PK1, SU Kurikulum */}
                    {canEdit && isEditMode && (
                      <div className="flex flex-col gap-1 flex-shrink-0 bg-slate-950/80 p-1.5 rounded-xl border border-white/15">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveEvent(evt.id, -1);
                          }}
                          disabled={eventIndex <= 0}
                          className="p-1 text-slate-300 hover:text-yellow-300 disabled:opacity-20 transition"
                          title="Susun ke atas"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveEvent(evt.id, 1);
                          }}
                          disabled={eventIndex >= events.length - 1}
                          className="p-1 text-slate-300 hover:text-yellow-300 disabled:opacity-20 transition"
                          title="Susun ke bawah"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAddingEvent(false);
                            setEditingEvent(evt);
                          }}
                          className="p-1 text-blue-300 hover:text-blue-200 transition"
                          title="Sunting acara"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm({
                              type: 'event',
                              id: evt.id,
                              title: evt.title
                            });
                          }}
                          className="p-1 text-red-400 hover:text-red-300 transition"
                          title="Padam acara"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event Detail Modal (View Only) */}
          {selectedEventModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900/95 backdrop-blur-2xl text-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-white/20 relative space-y-4">
                <button
                  onClick={() => setSelectedEventModal(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg"
                >
                  ✕
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-400 text-blue-950 rounded-2xl flex items-center justify-center font-black text-lg shadow-md">
                    {new Date(selectedEventModal.date).getDate()}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
                      {selectedEventModal.category}
                    </span>
                    <h3 className="font-extrabold text-base text-white mt-1">
                      {selectedEventModal.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
                  {selectedEventModal.description}
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Tarikh Mula</span>
                    <span className="font-bold text-white">{selectedEventModal.date}</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Lokasi</span>
                    <span className="font-bold text-white">{selectedEventModal.location}</span>
                  </div>
                </div>

                {canEdit && (
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        const target = selectedEventModal;
                        setSelectedEventModal(null);
                        setIsAddingEvent(false);
                        setEditingEvent(target);
                      }}
                      className="px-4 py-2 bg-yellow-400 text-blue-950 font-black rounded-xl text-xs flex items-center gap-2 hover:bg-yellow-300 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sunting Acara Ini</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal: Edit / Add Calendar Event */}
          {editingEvent && (
            <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900/95 backdrop-blur-2xl text-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-white/20 relative space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-black text-white text-base">
                      {isAddingEvent ? 'Tambah Acara Takwim Baharu' : 'Sunting Acara Takwim Persekolahan'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEvent(null);
                      setIsAddingEvent(false);
                    }}
                    className="text-slate-400 hover:text-white font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!editingEvent.title.trim()) return;
                    handleSaveEvent(editingEvent);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Nama / Tajuk Acara Persekolahan *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingEvent.title}
                      onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                      placeholder="Contoh: Ujian Akhir Sesi Akademik (UASA)"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-white font-bold placeholder-slate-400 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Tarikh Mula *
                      </label>
                      <input
                        type="date"
                        required
                        value={editingEvent.date}
                        onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Tarikh Akhir (Jika berbilang hari)
                      </label>
                      <input
                        type="date"
                        value={editingEvent.endDate || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, endDate: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Kategori Acara *
                      </label>
                      <select
                        value={editingEvent.category}
                        onChange={(e) =>
                          setEditingEvent({
                            ...editingEvent,
                            category: e.target.value as any
                          })
                        }
                        className="w-full bg-slate-800 border border-white/20 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
                      >
                        <option value="peperiksaan">Peperiksaan / PBD</option>
                        <option value="cuti">Cuti Persekolahan</option>
                        <option value="acara">Acara & Program Sekolah</option>
                        <option value="pibg">Program PIBG</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Kumpulan Sasaran
                      </label>
                      <input
                        type="text"
                        value={editingEvent.targetGroup || ''}
                        onChange={(e) => setEditingEvent({ ...editingEvent, targetGroup: e.target.value })}
                        placeholder="Contoh: Murid Tahun 4, 5 & 6"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Lokasi / Tempat
                    </label>
                    <input
                      type="text"
                      value={editingEvent.location || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                      placeholder="Contoh: Dewan Gemilang / Bilik Darjah"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Penerangan / Catatan Acara
                    </label>
                    <textarea
                      rows={3}
                      value={editingEvent.description}
                      onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                      placeholder="Masukkan butiran pelaksanaan aktiviti..."
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/15">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEvent(null);
                        setIsAddingEvent(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black transition shadow-md"
                    >
                      {isAddingEvent ? 'Tambah Acara' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Edit / Add Academic Program */}
          {editingProgram && (
            <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900/95 backdrop-blur-2xl text-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-white/20 relative space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-black text-white text-base">
                      {isAddingProgram ? 'Tambah Program Utama Kurikulum' : 'Sunting Program Kurikulum'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProgram(null);
                      setIsAddingProgram(false);
                    }}
                    className="text-slate-400 hover:text-white font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!editingProgram.title.trim()) return;
                    handleSaveProgram(editingProgram);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Nama Program *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProgram.title}
                      onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })}
                      placeholder="Contoh: KSSR Semakan & DLP"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Lencana / Kategori Ringkas
                      </label>
                      <input
                        type="text"
                        value={editingProgram.badge || ''}
                        onChange={(e) => setEditingProgram({ ...editingProgram, badge: e.target.value })}
                        placeholder="Contoh: Kurikulum KPM"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Pilihan Ikon
                      </label>
                      <select
                        value={editingProgram.iconName || 'BookOpen'}
                        onChange={(e) => setEditingProgram({ ...editingProgram, iconName: e.target.value })}
                        className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
                      >
                        <option value="BookOpen">📖 Buku (BookOpen)</option>
                        <option value="Award">🏆 Anugerah (Award)</option>
                        <option value="FileText">📄 Dokumen (FileText)</option>
                        <option value="GraduationCap">🎓 Topi Graduasi</option>
                        <option value="Laptop">💻 Komputer / ICT</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Penerangan Program *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={editingProgram.description}
                      onChange={(e) => setEditingProgram({ ...editingProgram, description: e.target.value })}
                      placeholder="Maklumat terperinci mengenai program ini..."
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/15">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProgram(null);
                        setIsAddingProgram(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black transition shadow-md"
                    >
                      {isAddingProgram ? 'Tambah Program' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Edit / Add Subject */}
          {editingSubject && (
            <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900/95 backdrop-blur-2xl text-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/20 relative space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-black text-white text-base">
                      {isAddingSubject ? 'Tambah Mata Pelajaran' : 'Sunting Mata Pelajaran'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSubject(null);
                      setIsAddingSubject(false);
                    }}
                    className="text-slate-400 hover:text-white font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!editingSubject.name.trim()) return;
                    handleSaveSubject(editingSubject);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Nama Mata Pelajaran *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingSubject.name}
                      onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                      placeholder="Contoh: Bahasa Melayu"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Jenis / Kategori Subjek *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingSubject.type}
                      onChange={(e) => setEditingSubject({ ...editingSubject, type: e.target.value })}
                      placeholder="Contoh: Teras / STEM / Elektif / Kesenian"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Ikon / Emoji Subjek
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={editingSubject.icon}
                        onChange={(e) => setEditingSubject({ ...editingSubject, icon: e.target.value })}
                        className="w-16 text-center text-xl bg-white/10 border border-white/20 rounded-xl py-1.5 text-white font-bold focus:outline-none focus:border-yellow-400"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {['📖', '🇬🇧', '📐', '🔬', '🌙', '🕌', '🏛️', '⚙️', '🎨', '⚽', '💻', '🎵'].map((em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => setEditingSubject({ ...editingSubject, icon: em })}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm transition"
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/15">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSubject(null);
                        setIsAddingSubject(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black transition shadow-md"
                    >
                      {isAddingSubject ? 'Tambah Subjek' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-red-500/30 text-center space-y-4">
                <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-white text-base">Sahkan Pemadaman</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Adakah anda pasti ingin memadam <strong className="text-yellow-300">"{deleteConfirm.title}"</strong>? Tindakan ini tidak boleh dikembalikan.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (deleteConfirm.type === 'program') handleDeleteProgram(deleteConfirm.id);
                      if (deleteConfirm.type === 'subject') handleDeleteSubject(deleteConfirm.id);
                      if (deleteConfirm.type === 'event') handleDeleteEvent(deleteConfirm.id);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition shadow-md shadow-red-600/30"
                  >
                    Ya, Padam
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
