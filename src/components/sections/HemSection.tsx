import React, { useState, useMemo, useEffect } from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  UserCheck,
  Scale,
  Smile,
  Heart,
  Utensils,
  BookMarked,
  Coins,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Award,
  Users,
  X,
  PhoneCall,
  Activity,
  Calendar,
  Percent,
  FileCheck
} from 'lucide-react';
import { HemData, SchoolProfile, Staff, StudentRecord, StudentAbsenceRecord } from '../../types';
import { initialHemData } from '../../data/initialData';
import { initialStudentsList } from '../../data/studentsData';
import { initialAbsenceRecords } from '../../data/initialAttendance';
import { HemAttendanceSubSection } from './HemAttendanceSubSection';
import { formatGoogleDriveUrl } from '../../utils/imageHelpers';
import {
  findPkHemStaff,
  findPkPentadbiranStaff,
  findPkKokurikulumStaff
} from '../../utils/staffHelpers';

interface HemSectionProps {
  hemData?: HemData;
  profile?: SchoolProfile;
  staffList?: Staff[];
  students?: StudentRecord[];
  absenceRecords?: StudentAbsenceRecord[];
  onAddAbsenceRecord?: (
    record: Omit<StudentAbsenceRecord, 'id' | 'refNo' | 'createdAt'>
  ) => StudentAbsenceRecord;
  onUpdateAbsenceRecord?: (record: StudentAbsenceRecord) => void;
  onDeleteAbsenceRecord?: (id: string) => void;
  initialSubTab?: 'semua' | 'kehadiran' | 'disiplin' | 'kebajikan' | '3k';
  isAdmin?: boolean;
  isTeacher?: boolean;
  userRole?: 'admin' | 'guru' | null;
  onOpenStudentPortal?: () => void;
  onOpenRmtPortal?: () => void;
  onOpenLogin?: () => void;
}

export const HemSection: React.FC<HemSectionProps> = ({
  hemData = initialHemData,
  profile,
  staffList,
  students = initialStudentsList,
  absenceRecords = initialAbsenceRecords,
  onAddAbsenceRecord,
  onUpdateAbsenceRecord,
  onDeleteAbsenceRecord,
  initialSubTab = 'semua',
  isAdmin = false,
  isTeacher = false,
  userRole,
  onOpenStudentPortal,
  onOpenRmtPortal,
  onOpenLogin
}) => {
  const isAuthorized = isAdmin || isTeacher || userRole === 'admin' || userRole === 'guru';
  const data = hemData || initialHemData;
  const [activeSubTab, setActiveSubTab] = useState<'semua' | 'kehadiran' | 'disiplin' | 'kebajikan' | '3k'>(initialSubTab);

  const handleOpenRmt = () => {
    if (onOpenRmtPortal) {
      onOpenRmtPortal();
    }
  };

  // Auto-hide penerangan HEM selepas 5 saat dan gantikan dengan butang anak panah ringkas
  const [showHemIntro, setShowHemIntro] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHemIntro(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Sync initialSubTab if parent changes it
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [selectedDetailModal, setSelectedDetailModal] = useState<{
    title: string;
    category: string;
    icon: any;
    content: React.ReactNode;
  } | null>(null);

  const principalName = profile?.principalName || "Puan Norhafiza Binti Dolah";
  const principalTitle = profile?.principalTitle || "Guru Besar (DG48)";

  // Ambil maklumat Penolong Kanan Hal Ehwal Murid mengikut Barisan Pentadbir Utama
  const pkHemStaff = useMemo(() => {
    if (staffList && staffList.length > 0) {
      return findPkHemStaff(staffList, profile);
    }
    return undefined;
  }, [staffList, profile]);

  // Today's attendance summary for HEM Sub-tab highlight
  const todayAttendanceStats = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const totalStudents = students.length || 375;
    const absentIds = new Set<string>();
    absenceRecords.forEach((rec) => {
      if (rec.status !== 'ditolak' && todayStr >= rec.dateFrom && todayStr <= rec.dateTo) {
        absentIds.add(rec.studentId);
      }
    });

    const absentCount = absentIds.size;
    const presentCount = Math.max(0, totalStudents - absentCount);
    const percentage = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : '100.0';

    return {
      todayStr,
      totalStudents,
      absentCount,
      presentCount,
      percentage
    };
  }, [students, absenceRecords]);

  const pkPentadbiranStaff = useMemo(() => {
    if (staffList && staffList.length > 0) {
      return findPkPentadbiranStaff(staffList, profile);
    }
    return undefined;
  }, [staffList, profile]);

  const pkKokurikulumStaff = useMemo(() => {
    if (staffList && staffList.length > 0) {
      return findPkKokurikulumStaff(staffList, profile);
    }
    return undefined;
  }, [staffList, profile]);

  // Maklumat Terkini PK HEM
  const pkHemName = pkHemStaff?.name || data.gpkName || "Encik Mohd Ridzuan bin Osman";
  const pkHemTitle = pkHemStaff?.position || data.gpkTitle || "Guru Penolong Kanan Hal Ehwal Murid (PK HEM)";
  const pkHemGrade = pkHemStaff?.grade || "DG44";
  const pkHemInfo = pkHemStaff?.grade
    ? (pkHemStaff.grade.startsWith('DG') ? `Pegawai Perkhidmatan Pendidikan (${pkHemStaff.grade})` : `Gred ${pkHemStaff.grade}`)
    : (data.gpkGrade || "Pegawai Perkhidmatan Pendidikan (DG44)");

  const pkHemPhoto = useMemo(() => {
    if (pkHemStaff?.photoUrl && pkHemStaff.photoUrl.trim() !== '') {
      if (!pkHemStaff.photoUrl.includes('unsplash.com')) {
        return formatGoogleDriveUrl(pkHemStaff.photoUrl);
      }
      return formatGoogleDriveUrl(pkHemStaff.photoUrl);
    }
    return '';
  }, [pkHemStaff]);

  return (
    <div className="space-y-8 animate-fadeIn text-white">
      {/* Title Banner */}
      <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 font-bold rounded-full text-xs border border-emerald-400/30 mb-3">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pengurusan Hal Ehwal Murid</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hal Ehwal Murid (HEM)
            </h2>

            {/* Collapsible Info with 5-second auto-hide & simple arrow toggle */}
            <div className="mt-1 max-w-2xl">
              <div
                className={`transition-all duration-500 overflow-hidden ${
                  showHemIntro ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pb-1">
                  {data.gpkSpeech ||
                    "Pengurusan Hal Ehwal Murid (HEM) komited memastikan kemenjadian sahsiah murid, kebajikan terpelihara serta iklim sekolah yang selamat, sihat dan kondusif berteraskan prinsip Anak yang Baik lagi Cerdik (ABC)."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowHemIntro(!showHemIntro)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-yellow-300 hover:text-yellow-200 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition mt-1 border border-white/10"
                title={showHemIntro ? "Sembunyikan penerangan" : "Baca penerangan penuh"}
              >
                <span>{showHemIntro ? "Sembunyikan Info" : "Info Hal Ehwal Murid"}</span>
                {showHemIntro ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* PK HEM Profile Mini-Card with Picture, Position, Name & Info */}
          <div className="bg-slate-900/85 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/20 flex items-center gap-4 flex-shrink-0 shadow-xl hover:border-emerald-400/50 transition">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-yellow-400 p-0.5 shadow-md overflow-hidden border-2 border-yellow-300 flex items-center justify-center flex-shrink-0">
              {pkHemPhoto && pkHemPhoto.trim() !== '' ? (
                <img
                  src={pkHemPhoto}
                  alt={pkHemName}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    const fallback = parent?.querySelector('.fallback-pkhem-icon');
                    if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                  }}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : null}
              <div
                className={`fallback-pkhem-icon w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-yellow-300 ${
                  pkHemPhoto && pkHemPhoto.trim() !== '' ? 'hidden' : 'flex'
                }`}
              >
                <UserCheck className="w-8 h-8 opacity-80" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {pkHemTitle}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-950 text-yellow-300 border border-white/20">
                  {pkHemGrade}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                {pkHemName}
              </h4>
              <p className="text-xs text-slate-300 font-medium">
                {pkHemInfo}
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Selector: Utama HEM di kiri, e-Kehadiran, dan Carian Murid (Guru/Admin sahaja) */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
          {/* 1. Menu Utama HEM (Di sebelah kiri menu e-Kehadiran) */}
          <button
            type="button"
            onClick={() => setActiveSubTab('semua')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'semua'
                ? 'bg-yellow-400 text-blue-950 shadow-md shadow-yellow-400/20 border border-yellow-300'
                : 'bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Utama HEM</span>
          </button>

          {/* 2. Menu e-Kehadiran (Dikekalkan) */}
          <button
            type="button"
            onClick={() => setActiveSubTab('kehadiran')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'kehadiran'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 border border-emerald-300'
                : 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-400/40'
            }`}
          >
            <UserCheck className={`w-3.5 h-3.5 ${activeSubTab !== 'kehadiran' ? 'text-emerald-400' : ''}`} />
            <span>e-Kehadiran</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                activeSubTab === 'kehadiran' ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-500/30 text-emerald-200'
              }`}
            >
              {todayAttendanceStats.percentage}%
            </span>
          </button>

          {/* 3. Menu Carian Murid (Hanya muncul untuk pengguna log masuk Guru & Admin) */}
          {isAuthorized && onOpenStudentPortal && (
            <button
              type="button"
              onClick={onOpenStudentPortal}
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 bg-white/5 hover:bg-emerald-600 hover:text-white text-slate-200 border border-white/10 hover:border-emerald-400/40 transition active:scale-95 cursor-pointer shadow-sm"
              title="Buka Pangkalan Data & Portal Carian Murid SKMP"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Carian Murid</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {students.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* RENDER SPECIFIC SUB-TAB: KEHADIRAN */}
      {activeSubTab === 'kehadiran' && (
        <HemAttendanceSubSection
          students={students}
          absenceRecords={absenceRecords}
          onAddAbsenceRecord={
            onAddAbsenceRecord ||
            ((rec) => {
              const newRec: StudentAbsenceRecord = {
                ...rec,
                id: `abs_${Date.now()}`,
                refNo: `KHD-${Date.now().toString().slice(-6)}`,
                createdAt: new Date().toISOString()
              };
              return newRec;
            })
          }
          onUpdateAbsenceRecord={onUpdateAbsenceRecord}
          onDeleteAbsenceRecord={onDeleteAbsenceRecord}
          isAdmin={isAdmin}
          isTeacher={isTeacher}
          userRole={userRole}
          onOpenLogin={onOpenLogin}
        />
      )}

      {/* QUICK HIGHLIGHT STATS (Rendered on 'semua') */}
      {activeSubTab === 'semua' && (
        <>
          {/* Spotlight Card: e-Kehadiran Portal Trigger */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-5 sm:p-6 rounded-3xl border border-emerald-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
            <div className="space-y-1.5 z-10">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30">
                <UserCheck className="w-3.5 h-3.5" />
                <span>e-Kehadiran Hari Ini ({todayAttendanceStats.todayStr})</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>Peratus Kehadiran Semasa:</span>
                <span className="text-yellow-400">{todayAttendanceStats.percentage}%</span>
              </h4>
              <p className="text-xs text-slate-300 max-w-xl">
                Enrolmen: <strong>{todayAttendanceStats.totalStudents} murid</strong> | Hadir: <strong>{todayAttendanceStats.presentCount}</strong> | Tidak Hadir: <strong>{todayAttendanceStats.absentCount}</strong>.
                Murid yang tidak mengisi borang ketidakhadiran dikira hadir secara automatik.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center">
                <BookMarked className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-white">{data.stats?.spbtPercentage || '100%'}</span>
                <p className="text-[11px] font-semibold text-slate-300">Penerima SPBT</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-white">{data.stats?.rmtCount || '78 Murid'}</span>
                <p className="text-[11px] font-semibold text-slate-300">Penerima RMT Sihat</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-white">{data.stats?.bapAmount || 'RM150'}</span>
                <p className="text-[11px] font-semibold text-slate-300">BAP Setiap Murid</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-white">{data.stats?.sahsiahPercentage || '96.8%'}</span>
                <p className="text-[11px] font-semibold text-slate-300">Amalan Sahsiah Baik</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* SECTION 1: DISIPLIN & BIMBINGAN KAUNSELING */}
      {(activeSubTab === 'semua' || activeSubTab === 'disiplin') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg sm:text-xl font-black text-white">
                1. Disiplin & Bimbingan Kaunseling
              </h3>
            </div>
            <span className="text-[11px] bg-yellow-400/20 text-yellow-300 font-bold px-3 py-1 rounded-full border border-yellow-400/30">
              Sahsiah & Integriti
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1.1: Peraturan Sekolah */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg flex flex-col justify-between space-y-4 hover:border-yellow-400/40 transition">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-amber-500/20 text-amber-300 rounded-2xl flex items-center justify-center font-bold border border-amber-400/30">
                  <ShieldAlert className="w-5 h-5 text-amber-300" />
                </div>
                <h4 className="font-extrabold text-white text-base">
                  {data.disiplin?.title || 'Peraturan & Kod Disiplin Sekolah'}
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {data.disiplin?.description ||
                    'Garis panduan etika dan tatatertib murid SK Merbau Pulas bagi memupuk keperibadian luhur, ketepatan masa, dan perpaduan warga sekolah.'}
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  {data.disiplin?.rules?.map((rule, idx) => (
                    <div key={rule.id || idx} className="flex items-start gap-2">
                      {rule.type === 'warning' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                      ) : rule.type === 'info' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      )}
                      <span>
                        <strong>{rule.title}:</strong> {rule.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedDetailModal({
                    title: 'Buku Panduan & Kod Disiplin SK Merbau Pulas',
                    category: 'Disiplin Sekolah',
                    icon: ShieldAlert,
                    content: (
                      <div className="space-y-4 text-xs text-slate-200">
                        <div className="p-3 bg-amber-500/10 border border-amber-400/30 rounded-xl text-amber-200">
                          📌 <strong>Matlamat Disiplin:</strong> Membentuk murid yang berdaya tahan, menghormati guru, berakhlak mulia serta menepati masa dalam semua urusan harian.
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl whitespace-pre-line text-slate-200 leading-relaxed">
                          {data.disiplin?.fullGuidelines ||
                            '1. Waktu Persekolahan: 7.30 pagi - 1.00 petang (Tahap 1) / 1.30 petang (Tahap 2).\n2. Hari Rabu: Pemakaian unit beruniform lengkap sepanjang hari persekolahan.\n3. Kebenaran Keluar: Sebarang urusan keluar kawasan sekolah wajib mendapat kelulusan Pentadbir/PK HEM dan dicatat dalam Buku Keluar.'}
                        </div>
                      </div>
                    )
                  })
                }
                className="w-full py-2.5 px-3 bg-white/10 hover:bg-yellow-400 hover:text-blue-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Lihat Kod Peraturan Penuh</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 1.2: Unit Bimbingan & Kaunseling (UBK) */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg flex flex-col justify-between space-y-4 hover:border-yellow-400/40 transition">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-purple-500/20 text-purple-300 rounded-2xl flex items-center justify-center font-bold border border-purple-400/30">
                  <Smile className="w-5 h-5 text-purple-300" />
                </div>
                <h4 className="font-extrabold text-white text-base">
                  {data.disiplin?.ubkTitle || 'Unit Bimbingan & Kaunseling (UBK)'}
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {data.disiplin?.ubkDescription ||
                    'Menyediakan perkhidmatan kaunseling individu & kelompok, pembangunan emosi, bimbingan kerjaya, serta program kesejahteraan mental murid.'}
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  {data.disiplin?.ubkServices?.slice(0, 4).map((srv, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>{srv.title}:</strong> {srv.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedDetailModal({
                    title: 'Perkhidmatan Unit Bimbingan & Kaunseling (UBK)',
                    category: 'Kaunseling & Sahsiah',
                    icon: Smile,
                    content: (
                      <div className="space-y-4 text-xs text-slate-200">
                        <div className="p-3 bg-purple-500/10 border border-purple-400/30 rounded-xl text-purple-200">
                          🤝 <strong>Misi UBK:</strong> "Membimbing Dengan Hati, Membina Insan Sejati" — Menyokong kestabilan psikososial murid dalam suasana pembelajaran yang tenang dan inklusif.
                        </div>

                        <h5 className="font-black text-white text-sm">Aktiviti Teras UBK Sepanjang Tahun:</h5>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {data.disiplin?.ubkServices?.map((srv, idx) => (
                            <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-xl">
                              <h6 className="font-bold text-yellow-300">{srv.title}</h6>
                              <p className="text-[11px] text-slate-300 mt-1">{srv.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })
                }
                className="w-full py-2.5 px-3 bg-white/10 hover:bg-yellow-400 hover:text-blue-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Info Perkhidmatan UBK</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 1.3: SSDM (Sistem Sahsiah Diri Murid) */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg flex flex-col justify-between space-y-4 hover:border-yellow-400/40 transition">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-300 rounded-2xl flex items-center justify-center font-bold border border-emerald-400/30">
                  <Award className="w-5 h-5 text-emerald-300" />
                </div>
                <h4 className="font-extrabold text-white text-base">Sistem Sahsiah Diri Murid (SSDM 2.0)</h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {data.disiplin?.ssdmDescription ||
                    'Sistem rasmi Kementerian Pendidikan Malaysia (KPM) bagi merekodkan amalan baik serta mengurus salah laku murid secara adil dan mendidik.'}
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Amalan Baik:</strong> Pengiktirafan murid berbudi pekerti & suka menolong.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Rekod Digital:</strong> Mata merit dan pemantauan terus oleh guru kelas.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Intervensi Sahsiah:</strong> Sesi kaunseling berfokus bagi kes salah laku.</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href={data.disiplin?.ssdmUrl || "https://ssdm.moe.gov.my/"}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 bg-emerald-500/80 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                >
                  <span>Portal Rasmi SSDM KPM</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: KEBAJIKAN MURID */}
      {(activeSubTab === 'semua' || activeSubTab === 'kebajikan') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" />
              <h3 className="text-lg sm:text-xl font-black text-white">
                2. Kebajikan Murid
              </h3>
            </div>
            <span className="text-[11px] bg-rose-500/20 text-rose-300 font-bold px-3 py-1 rounded-full border border-rose-400/30">
              Bantuan & Hak Murid
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* SPBT */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg space-y-4 hover:border-yellow-400/40 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-blue-500/20 text-blue-300 rounded-2xl flex items-center justify-center font-bold border border-blue-400/30">
                  <BookMarked className="w-5 h-5 text-blue-300" />
                </div>
                <h4 className="font-extrabold text-white text-base">
                  {data.kebajikan?.spbtTitle || 'Skim Pinjaman Buku Teks (SPBT)'}
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {data.kebajikan?.spbtDescription ||
                    'Buku teks dibekalkan 100% secara percuma kepada semua murid warganegara Malaysia dari Tahun 1 hingga Tahun 6.'}
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <span className="font-bold text-yellow-300">Panduan Penjagaan:</span>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5 text-slate-300">
                      {data.kebajikan?.spbtGuidelines?.slice(0, 3).map((g, idx) => (
                        <li key={idx}>{g}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    🏢 <strong>Penyelaras SPBT:</strong> {data.kebajikan?.spbtCoordinator || 'Cikgu Nurul Ain binti Mahadzir'}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedDetailModal({
                    title: 'Skim Pinjaman Buku Teks (SPBT) SK Merbau Pulas',
                    category: 'Pengurusan SPBT',
                    icon: BookMarked,
                    content: (
                      <div className="space-y-4 text-xs text-slate-200">
                        <div className="p-3 bg-blue-500/10 border border-blue-400/30 rounded-xl text-blue-200">
                          📚 <strong>Kelayakan SPBT:</strong> Semua murid warganegara Malaysia di SK Merbau Pulas layak menerima set lengkap buku teks SPBT dan Buku Aktiviti pada setiap awal sesi persekolahan.
                        </div>

                        <h5 className="font-black text-white text-sm">Garis Panduan Penjagaan Buku Teks:</h5>
                        <ol className="list-decimal list-inside space-y-1 text-slate-300">
                          {data.kebajikan?.spbtGuidelines?.map((g, idx) => (
                            <li key={idx}>{g}</li>
                          ))}
                        </ol>
                      </div>
                    )
                  })
                }
                className="w-full py-2.5 px-3 bg-white/10 hover:bg-yellow-400 hover:text-blue-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Info Penuh SPBT</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* RMT & Program Susu Sekolah */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg space-y-4 hover:border-yellow-400/40 transition flex flex-col justify-between">
              <div 
                onClick={handleOpenRmt}
                className="space-y-3 cursor-pointer"
              >
                <div className="w-10 h-10 bg-amber-500/20 text-amber-300 rounded-2xl flex items-center justify-center font-bold border border-amber-400/30">
                  <Utensils className="w-5 h-5 text-amber-300" />
                </div>
                <h4 className="font-extrabold text-white text-base hover:text-amber-300 transition">
                  {data.kebajikan?.rmtTitle || 'Rancangan Makanan Tambahan (RMT) & Susu'}
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {data.kebajikan?.rmtDescription ||
                    'Penyediaan sarapan pagi / makanan seimbang berkhasiat serta Program Susu Sekolah (PSS) bagi membantu murid mencapai tumbesaran fizikal dan daya tumpuan optimum.'}
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <span className="font-bold text-yellow-300">Penyelaras:</span>
                    <p className="text-[11px] text-slate-300">
                      {data.kebajikan?.rmtCoordinator || 'Puan Fazilah binti Mat'}
                    </p>
                    <div className="mt-1.5 pt-1.5 border-t border-white/10">
                      <span className="font-bold text-yellow-300">Contoh Menu RMT:</span>
                      <ul className="text-[11px] space-y-0.5 text-slate-300 mt-1">
                        {data.kebajikan?.rmtMenu?.slice(0, 2).map((m, idx) => (
                          <li key={idx}><strong>{m.day}:</strong> {m.menu}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenRmt();
                  }}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  <Utensils className="w-4 h-4 text-slate-950" />
                  <span>Buka Portal RMT (89 Murid)</span>
                </button>

                <button
                  onClick={() =>
                    setSelectedDetailModal({
                      title: 'Rancangan Makanan Tambahan (RMT) & Susu Sekolah',
                      category: 'Kebajikan Makanan',
                      icon: Utensils,
                      content: (
                        <div className="space-y-4 text-xs text-slate-200">
                          <div className="p-3 bg-amber-500/10 border border-amber-400/30 rounded-xl text-amber-200">
                            🥣 <strong>Objektif RMT:</strong> Memastikan murid daripada keluarga B40 dan berkeperluan khusus mendapat bekalan nutrien secukupnya untuk kecerdasan minda dan kecergasan jasmani di sekolah.
                          </div>

                          <h5 className="font-black text-white text-sm">Jadual Menu Sihat RMT SKMP:</h5>
                          <ul className="list-disc list-inside space-y-1 text-slate-300">
                            {data.kebajikan?.rmtMenu?.map((m, idx) => (
                              <li key={idx}>
                                <strong>{m.day}:</strong> {m.menu}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    })
                  }
                  className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <span>Info Menu & Kelayakan RMT</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* BAP & Bantuan Khas */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg space-y-4 hover:border-yellow-400/40 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-300 rounded-2xl flex items-center justify-center font-bold border border-emerald-400/30">
                  <Coins className="w-5 h-5 text-emerald-300" />
                </div>
                <h4 className="font-extrabold text-white text-base">
                  {data.kebajikan?.bapTitle || 'Bantuan Awal Persekolahan (BAP) & KWAPM'}
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {data.kebajikan?.bapDescription ||
                    'Bantuan tunai kewangan persekolahan RM150 kepada setiap murid warganegara serta bantuan Kumpulan Wang Amanah Pelajar Miskin (KWAPM) & e-Kasih.'}
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <span className="font-bold text-yellow-300">Bantuan Yang Disalurkan:</span>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5 text-slate-300">
                      {data.kebajikan?.bapDetails?.slice(0, 3).map((det, idx) => (
                        <li key={idx}>{det}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedDetailModal({
                    title: 'Bantuan Awal Persekolahan (BAP) & Bantuan Kebajikan',
                    category: 'Bantuan Kewangan',
                    icon: Coins,
                    content: (
                      <div className="space-y-4 text-xs text-slate-200">
                        <div className="p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-xl text-emerald-200">
                          💵 <strong>Bantuan Awal Persekolahan (BAP):</strong> Inisiatif Kementerian Pendidikan Malaysia bagi meringankan beban perbelanjaan ibu bapa dalam menyediakan kelengkapan sekolah anak-anak.
                        </div>

                        <h5 className="font-black text-white text-sm">Maklumat & Skim Bantuan:</h5>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {data.kebajikan?.bapDetails?.map((det, idx) => (
                            <li key={idx}>{det}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  })
                }
                className="w-full py-2.5 px-3 bg-white/10 hover:bg-yellow-400 hover:text-blue-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Info BAP & Bantuan Khas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: KESELAMATAN & KESIHATAN (3K) */}
      {(activeSubTab === 'semua' || activeSubTab === '3k') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg sm:text-xl font-black text-white">
                3. Keselamatan, Kesihatan & Kebersihan (Program 3K)
              </h3>
            </div>
            <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-400/30">
              Persekitaran Kondusif & Selamat
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* 3.1 Keselamatan */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg space-y-4 hover:border-yellow-400/40 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-blue-500/20 text-blue-300 rounded-2xl flex items-center justify-center font-bold border border-blue-400/30">
                  <ShieldAlert className="w-5 h-5 text-blue-300" />
                </div>
                <h4 className="font-extrabold text-white text-base">
                  {data.program3k?.safetyTitle || 'Panduan Keselamatan Murid'}
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {data.program3k?.safetyDescription ||
                    'Langkah menyeluruh menjaga keselamatan fizikal murid di kawasan pagar sekolah, bilik darjah, padang dan semasa aktiviti luar.'}
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  {data.program3k?.safetyPoints?.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedDetailModal({
                    title: 'Prosedur Standard Keselamatan Murid (SOP Keselamatan)',
                    category: 'Keselamatan Sekolah',
                    icon: ShieldAlert,
                    content: (
                      <div className="space-y-4 text-xs text-slate-200">
                        <div className="p-3 bg-blue-500/10 border border-blue-400/30 rounded-xl text-blue-200">
                          🚨 <strong>Polisi Keselamatan:</strong> Tiada kompromi dalam keselamatan warga sekolah. Semua pelawat wajib mendaftar dan memakai Pas Pelawat Rasmi.
                        </div>

                        <h5 className="font-black text-white text-sm">Panduan & Prosedur Keselamatan:</h5>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {data.program3k?.safetyPoints?.map((pt, idx) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  })
                }
                className="w-full py-2.5 px-3 bg-white/10 hover:bg-yellow-400 hover:text-blue-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Lihat SOP Keselamatan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3.2 Kesihatan */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg space-y-4 hover:border-yellow-400/40 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-rose-500/20 text-rose-300 rounded-2xl flex items-center justify-center font-bold border border-rose-400/30">
                  <Activity className="w-5 h-5 text-rose-300" />
                </div>
                <h4 className="font-extrabold text-white text-base">
                  {data.program3k?.healthTitle || 'Kesihatan & Rawatan Murid'}
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {data.program3k?.healthDescription ||
                    'Kerjasama erat bersama Kementerian Kesihatan Malaysia (KKM) bagi pemeriksaan kesihatan, pergigian, imunisasi dan pencegahan wabak penyakit.'}
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  {data.program3k?.healthPoints?.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedDetailModal({
                    title: 'Program Kesihatan & Rawatan Pergigian / Vaksinasi KKM',
                    category: 'Kesihatan Murid',
                    icon: Activity,
                    content: (
                      <div className="space-y-4 text-xs text-slate-200">
                        <div className="p-3 bg-rose-500/10 border border-rose-400/30 rounded-xl text-rose-200">
                          🩺 <strong>Bilik Rawatan Kesihatan:</strong> Bilik Kesihatan dilengkapi katil rehat, peti ubat kecemasan dan dipantau oleh Guru Bertugas Mingguan.
                        </div>

                        <h5 className="font-black text-white text-sm">Program Kesihatan Tahunan:</h5>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {data.program3k?.healthPoints?.map((pt, idx) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  })
                }
                className="w-full py-2.5 px-3 bg-white/10 hover:bg-yellow-400 hover:text-blue-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Info Program Kesihatan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3.3 Kebersihan */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg space-y-4 hover:border-yellow-400/40 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-300 rounded-2xl flex items-center justify-center font-bold border border-emerald-400/30">
                  <Sparkles className="w-5 h-5 text-emerald-300" />
                </div>
                <h4 className="font-extrabold text-white text-base">
                  {data.program3k?.cleanlinessTitle || 'Kebersihan & Keceriaan Bilik Darjah'}
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {data.program3k?.cleanlinessDescription ||
                    'Mewujudkan persekitaran pembelajaran bilik darjah yang bersih, ceria, bermaklumat, dan mengamalkan budaya kelestarian alam (3R).'}
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  {data.program3k?.cleanlinessPoints?.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() =>
                  setSelectedDetailModal({
                    title: 'Program Kebersihan Bilik Darjah & Ekosistem Sekolah Sejahtera',
                    category: 'Kebersihan & Keceriaan',
                    icon: Sparkles,
                    content: (
                      <div className="space-y-4 text-xs text-slate-200">
                        <div className="p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-xl text-emerald-200">
                          ✨ <strong>"Kebersihan Asas Keunggulan":</strong> Setiap bilik darjah dilengkapi jadual bertugas harian murid bagi menyemai nilai tanggungjawab bersama.
                        </div>

                        <h5 className="font-black text-white text-sm">Kriteria & Amalan Kebersihan:</h5>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {data.program3k?.cleanlinessPoints?.map((pt, idx) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  })
                }
                className="w-full py-2.5 px-3 bg-white/10 hover:bg-yellow-400 hover:text-blue-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Info Penilaian Kebersihan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JAWATANKUASA KERJA INDUK UNIT HEM */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <Users className="w-5 h-5 text-yellow-400" />
          <h3 className="text-xl font-black text-white">Jawatankuasa Kerja Induk Pengurusan HEM</h3>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold text-yellow-400 uppercase tracking-wider">Pengerusi</span>
            <h5 className="font-extrabold text-sm text-white">{principalName}</h5>
            <p className="text-xs text-slate-300">{principalTitle}</p>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">Timbalan Pengerusi</span>
            <h5 className="font-extrabold text-sm text-white">{pkHemName}</h5>
            <p className="text-xs text-slate-300">{pkHemTitle} {pkHemGrade ? `(${pkHemGrade})` : ''}</p>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider">Naib Pengerusi I</span>
            <h5 className="font-extrabold text-sm text-white">{pkPentadbiranStaff?.name || "Puan Noraini binti Yusof"}</h5>
            <p className="text-xs text-slate-300">{pkPentadbiranStaff?.position || "PK Pentadbiran"} {pkPentadbiranStaff?.grade ? `(${pkPentadbiranStaff.grade})` : ''}</p>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold text-purple-400 uppercase tracking-wider">Naib Pengerusi II</span>
            <h5 className="font-extrabold text-sm text-white">{pkKokurikulumStaff?.name || "Puan Siti Hajar binti Abdul Rahman"}</h5>
            <p className="text-xs text-slate-300">{pkKokurikulumStaff?.position || "PK Kokurikulum"} {pkKokurikulumStaff?.grade ? `(${pkKokurikulumStaff.grade})` : ''}</p>
          </div>
        </div>

        {/* Dynamic List of HEM Committee Officers */}
        <div className="grid sm:grid-cols-3 gap-3 pt-2">
          {data.committee && data.committee.length > 0 ? (
            data.committee.map((officer) => (
              <div
                key={officer.id}
                className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-white">{officer.role}</p>
                  <p className="text-[11px] text-yellow-300">{officer.name}</p>
                  {officer.phone && (
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <PhoneCall className="w-2.5 h-2.5 text-emerald-400" />
                      <span>{officer.phone}</span>
                    </p>
                  )}
                </div>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300 max-w-[100px] truncate">
                  {officer.unit}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 col-span-3">Tiada jawatankuasa HEM didaftarkan.</p>
          )}
        </div>
      </div>

      {/* DETAIL MODAL POPUP */}
      {selectedDetailModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center">
                  <selectedDetailModal.icon className="w-4 h-4 text-yellow-300" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-yellow-400">
                    {selectedDetailModal.category}
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-white">
                    {selectedDetailModal.title}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetailModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto pr-1">
              {selectedDetailModal.content}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedDetailModal(null)}
                className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs transition shadow"
              >
                Tutup Maklumat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
