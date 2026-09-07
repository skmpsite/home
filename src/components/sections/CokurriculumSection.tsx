import React, { useState, useMemo, useEffect } from 'react';
import {
  CoCurriculumUnit,
  SchoolProfile,
  Staff,
  UserRole,
  canEditKokurikulum
} from '../../types';
import {
  Trophy,
  Shield,
  Heart,
  Award,
  Cpu,
  BookOpen,
  Target,
  Clock,
  User,
  Sparkles,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Sliders,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Check,
  LogIn,
  Calendar,
  Layers,
  ExternalLink,
  CheckCircle2,
  Info,
  Medal
} from 'lucide-react';
import { formatGoogleDriveUrl } from '../../utils/imageHelpers';
import { findPkKokurikulumStaff } from '../../utils/staffHelpers';
import { saveCoCurriculum } from '../../utils/storage';
import { EditUnitModal, EditKokoBannerModal } from './KokoEditModals';
import { KotSubSection } from './KotSubSection';

interface CokurriculumSectionProps {
  units: CoCurriculumUnit[];
  onSaveCoCurriculum?: (units: CoCurriculumUnit[]) => void;
  profile?: SchoolProfile;
  staffList?: Staff[];
  isAdmin?: boolean;
  isTeacher?: boolean;
  userRole?: UserRole | null;
  onOpenLogin?: () => void;
  initialSubTab?: 'utama' | 'jadual' | 'pajsk' | 'kot';
}

export const CokurriculumSection: React.FC<CokurriculumSectionProps> = ({
  units,
  onSaveCoCurriculum,
  profile,
  staffList,
  isAdmin = false,
  userRole = null,
  onOpenLogin,
  initialSubTab = 'utama'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'utama' | 'jadual' | 'pajsk' | 'kot'>(initialSubTab);
  const [showDesc, setShowDesc] = useState<boolean>(true);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  // Sync initialSubTab if changed
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Check authorization: Admin, PK Kokurikulum, SU Kokurikulum
  const canEdit = useMemo(() => {
    return canEditKokurikulum(userRole, isAdmin);
  }, [userRole, isAdmin]);

  // Determine user role badge label
  const roleLabel = useMemo(() => {
    if (isAdmin || userRole === 'admin') return 'Pentadbir (Admin)';
    if (userRole === 'pk_kokurikulum') return 'GPK Kokurikulum (PK Koko)';
    if (userRole === 'su_kokurikulum') return 'Setiausaha Kokurikulum (SU Koko)';
    return '';
  }, [isAdmin, userRole]);

  // Banner / Info Utama Kokurikulum customization state
  const [bannerInfo, setBannerInfo] = useState<{ badge: string; title: string; description: string }>(() => {
    const saved = localStorage.getItem('skmp_koko_banner_info');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // use default
      }
    }
    return {
      badge: 'Aktiviti Luar Bilik Darjah',
      title: 'Utama Kokurikulum & Pembangunan Bakat',
      description: 'Pengurusan bersepadu Kokurikulum menyatukan Badan Beruniform, Kelab & Persatuan, serta Sukan & Permainan bagi memupuk jati diri, sahsiah, kepimpinan, dan kecergasan murid SK Merbau Pulas.'
    };
  });

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<{
    unit: CoCurriculumUnit | null;
    isNew: boolean;
    defaultCategory?: 'beruniform' | 'kelab' | 'sukan';
  } | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDesc(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Ambil maklumat Penolong Kanan Kokurikulum mengikut Barisan Pentadbir Utama
  const pkKokurikulumStaff = useMemo(() => {
    if (staffList && staffList.length > 0) {
      return findPkKokurikulumStaff(staffList, profile);
    }
    return undefined;
  }, [staffList, profile]);

  const pkKokoName = pkKokurikulumStaff?.name || "Puan Siti Hajar binti Abdul Rahman";
  const pkKokoTitle = pkKokurikulumStaff?.position || "Guru Penolong Kanan Kokurikulum (PK Koko)";
  const pkKokoGrade = pkKokurikulumStaff?.grade || "DG44";
  const pkKokoInfo = pkKokurikulumStaff?.grade
    ? (pkKokurikulumStaff.grade.startsWith('DG') ? `Pegawai Perkhidmatan Pendidikan (${pkKokurikulumStaff.grade})` : `Gred ${pkKokurikulumStaff.grade}`)
    : "Pegawai Perkhidmatan Pendidikan (DG44)";

  const pkKokoPhoto = useMemo(() => {
    if (pkKokurikulumStaff?.photoUrl && pkKokurikulumStaff.photoUrl.trim() !== '') {
      return formatGoogleDriveUrl(pkKokurikulumStaff.photoUrl);
    }
    return '';
  }, [pkKokurikulumStaff]);

  const showNotification = (message: string) => {
    setNotificationMessage(message);
    setTimeout(() => {
      setNotificationMessage(null);
    }, 3000);
  };

  const handleSaveUnits = (newUnits: CoCurriculumUnit[], message: string = 'Maklumat kokurikulum disimpan!') => {
    if (onSaveCoCurriculum) {
      onSaveCoCurriculum(newUnits);
    } else {
      saveCoCurriculum(newUnits);
    }
    showNotification(message);
  };

  const handleSaveBannerInfo = (info: { badge: string; title: string; description: string }) => {
    setBannerInfo(info);
    localStorage.setItem('skmp_koko_banner_info', JSON.stringify(info));
    showNotification('Maklumat Utama Kokurikulum berjaya dikemas kini!');
  };

  // Reorder unit within its category
  const handleMoveUnit = (unitId: string, direction: -1 | 1) => {
    const currentIdx = units.findIndex((u) => u.id === unitId);
    if (currentIdx === -1) return;

    const category = units[currentIdx].category;
    const sameCategoryIndices = units
      .map((u, i) => (u.category === category ? i : -1))
      .filter((i) => i !== -1);

    const catPos = sameCategoryIndices.indexOf(currentIdx);
    const targetCatPos = catPos + direction;

    if (targetCatPos < 0 || targetCatPos >= sameCategoryIndices.length) return;

    const targetIndex = sameCategoryIndices[targetCatPos];

    const newUnits = [...units];
    const temp = newUnits[currentIdx];
    newUnits[currentIdx] = newUnits[targetIndex];
    newUnits[targetIndex] = temp;

    handleSaveUnits(newUnits, 'Susunan unit kokurikulum berjaya dikemas kini!');
  };

  // Add / Save unit
  const handleSaveUnit = (savedUnit: CoCurriculumUnit) => {
    const existingIdx = units.findIndex((u) => u.id === savedUnit.id);
    let newUnits: CoCurriculumUnit[];
    if (existingIdx !== -1) {
      newUnits = [...units];
      newUnits[existingIdx] = savedUnit;
    } else {
      newUnits = [...units, savedUnit];
    }
    handleSaveUnits(
      newUnits,
      existingIdx !== -1 ? 'Maklumat unit kokurikulum dikemas kini!' : 'Unit kokurikulum baharu ditambah!'
    );
    setEditingUnit(null);
  };

  // Delete unit
  const handleDeleteUnit = (unitId: string) => {
    const newUnits = units.filter((u) => u.id !== unitId);
    handleSaveUnits(newUnits, 'Unit kokurikulum dipadamkan!');
  };

  const renderUnitIcon = (iconName?: string, category?: string) => {
    switch (iconName) {
      case 'Shield':
        return <Shield className="w-4 h-4 text-blue-300" />;
      case 'Award':
        return <Award className="w-4 h-4 text-amber-300" />;
      case 'Heart':
        return <Heart className="w-4 h-4 text-pink-300" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 text-purple-300" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-cyan-300" />;
      case 'Trophy':
        return <Trophy className="w-4 h-4 text-yellow-300" />;
      case 'Target':
        return <Target className="w-4 h-4 text-emerald-300" />;
      default:
        if (category === 'beruniform') return <Shield className="w-4 h-4 text-blue-300" />;
        if (category === 'kelab') return <BookOpen className="w-4 h-4 text-purple-300" />;
        return <Trophy className="w-4 h-4 text-emerald-300" />;
    }
  };

  const categoriesConfig = [
    {
      id: 'beruniform' as const,
      label: 'Badan Beruniform',
      subtitle: 'Pasukan beruniform memupuk disiplin, kepimpinan, ketahanan diri, dan semangat patriotisme.',
      icon: Shield,
      badgeClass: 'bg-blue-500/20 text-blue-300 border border-blue-400/30',
      iconBoxClass: 'bg-blue-500/20 text-blue-300 border border-blue-400/30',
      borderHover: 'hover:border-blue-400/50'
    },
    {
      id: 'kelab' as const,
      label: 'Kelab & Persatuan',
      subtitle: 'Pengkayaan ilmu, bahasa & sastera, kebudayaan, kesenian, dan kemahiran sains & teknologi (STEM).',
      icon: BookOpen,
      badgeClass: 'bg-purple-500/20 text-purple-300 border border-purple-400/30',
      iconBoxClass: 'bg-purple-500/20 text-purple-300 border border-purple-400/30',
      borderHover: 'hover:border-purple-400/50'
    },
    {
      id: 'sukan' as const,
      label: 'Sukan & Permainan',
      subtitle: 'Pembangunan potensi sukan, kecergasan fizikal, ketangkasan, serta semangat kesukanan yang tinggi.',
      icon: Trophy,
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
      iconBoxClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
      borderHover: 'hover:border-emerald-400/50'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {notificationMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border border-emerald-400/40">
          <Check className="w-5 h-5 text-emerald-200" />
          <span className="text-xs font-bold">{notificationMessage}</span>
        </div>
      )}

      {/* Title Banner (Utama Kokurikulum) */}
      <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-xs border border-yellow-400/30">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span>{bannerInfo.badge}</span>
              </div>

              {/* Status Badge for Authorized Roles */}
              {canEdit && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded-full text-[11px] border border-emerald-400/30">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Akses Pengurusan: {roleLabel}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-black text-white">{bannerInfo.title}</h2>
              {canEdit && isEditMode && (
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(true)}
                  className="p-1.5 bg-yellow-400/20 hover:bg-yellow-400 text-yellow-300 hover:text-blue-950 rounded-xl transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Sunting Tajuk & Info Utama Kokurikulum"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sunting Info Utama</span>
                </button>
              )}
            </div>

            {/* Collapsible Info with 5-second auto-hide & simple arrow toggle */}
            <div className="mt-2 max-w-2xl">
              <div
                className={`transition-all duration-500 overflow-hidden ${
                  showDesc ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pb-1">
                  {bannerInfo.description}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setShowDesc(!showDesc)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-yellow-300 hover:text-yellow-200 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition border border-white/10 cursor-pointer"
                  title={showDesc ? "Sembunyikan penerangan" : "Baca penerangan penuh"}
                >
                  <span>{showDesc ? "Sembunyikan Info" : "Info Kokurikulum"}</span>
                  {showDesc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {/* Direct Edit Mode Toggle for Admin, PK Kokurikulum, SU Kokurikulum */}
                {canEdit ? (
                  <button
                    type="button"
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-lg transition border cursor-pointer ${
                      isEditMode
                        ? 'bg-yellow-400 text-blue-950 border-yellow-300 shadow-md animate-pulse'
                        : 'bg-white/10 hover:bg-yellow-400/20 text-yellow-300 border-yellow-400/30'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{isEditMode ? 'Selesai Menyusun / Sunting' : 'Mod Sunting & Susun Atur'}</span>
                  </button>
                ) : (
                  onOpenLogin && (
                    <button
                      type="button"
                      onClick={onOpenLogin}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition border border-white/10 cursor-pointer"
                      title="Log masuk untuk PK Kokurikulum, SU Kokurikulum & Admin"
                    >
                      <LogIn className="w-3 h-3 text-yellow-400" />
                      <span>Log Masuk Pengurusan</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* PK Kokurikulum Profile Mini-Card with Picture, Position, Name & Info */}
          <div className="bg-slate-900/85 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/20 flex items-center gap-4 flex-shrink-0 shadow-xl hover:border-yellow-400/50 transition">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-yellow-400 p-0.5 shadow-md overflow-hidden border-2 border-yellow-300 flex items-center justify-center flex-shrink-0">
              {pkKokoPhoto && pkKokoPhoto.trim() !== '' ? (
                <img
                  src={pkKokoPhoto}
                  alt={pkKokoName}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    const fallback = parent?.querySelector('.fallback-pkkoko-icon');
                    if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                  }}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : null}
              <div
                className={`fallback-pkkoko-icon w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-yellow-300 ${
                  pkKokoPhoto && pkKokoPhoto.trim() !== '' ? 'hidden' : 'flex'
                }`}
              >
                <UserCheck className="w-8 h-8 opacity-80" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
                  {pkKokoTitle}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-950 text-yellow-300 border border-white/20">
                  {pkKokoGrade}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                {pkKokoName}
              </h4>
              <p className="text-xs text-slate-300 font-medium">
                {pkKokoInfo}
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Menu Navigation Kokurikulum */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Sub Menu: Utama Kokurikulum (Menyatukan Badan Beruniform, Kelab & Persatuan, Sukan & Permainan) */}
            <button
              type="button"
              onClick={() => setActiveSubTab('utama')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-sm ${
                activeSubTab === 'utama'
                  ? 'bg-yellow-400 text-blue-950 shadow-md shadow-yellow-400/20 border border-yellow-300'
                  : 'bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Utama Kokurikulum</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  activeSubTab === 'utama'
                    ? 'bg-blue-950/40 text-yellow-300'
                    : 'bg-white/10 text-slate-300'
                }`}
              >
                {units.length} Unit
              </span>
            </button>

            {/* 2. Sub Menu: Jadual & Takwim Kokurikulum */}
            <button
              type="button"
              onClick={() => setActiveSubTab('jadual')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-sm ${
                activeSubTab === 'jadual'
                  ? 'bg-yellow-400 text-blue-950 shadow-md shadow-yellow-400/20 border border-yellow-300'
                  : 'bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-400/40'
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Jadual & Takwim</span>
            </button>

            {/* 3. Sub Menu: Portal PAJSK & Sistem */}
            <button
              type="button"
              onClick={() => setActiveSubTab('pajsk')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-sm ${
                activeSubTab === 'pajsk'
                  ? 'bg-yellow-400 text-blue-950 shadow-md shadow-yellow-400/20 border border-yellow-300'
                  : 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-400/40'
              }`}
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Portal PAJSK & Sistem</span>
            </button>

            {/* 4. Sub Menu: KOT (Kejohanan Olahraga Tahunan) */}
            <button
              type="button"
              onClick={() => setActiveSubTab('kot')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-sm ${
                activeSubTab === 'kot'
                  ? 'bg-yellow-400 text-blue-950 shadow-md shadow-yellow-400/20 border border-yellow-300'
                  : 'bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 border border-amber-400/40'
              }`}
            >
              <Medal className="w-4 h-4 text-amber-400" />
              <span>KOT</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  activeSubTab === 'kot'
                    ? 'bg-blue-950/40 text-yellow-300'
                    : 'bg-white/10 text-amber-300'
                }`}
              >
                2026
              </span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 font-medium">
            <span className="text-[11px] text-slate-400">Penyatuan 3 Bidang:</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold">Beruniform</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30 font-bold">Kelab & Persatuan</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">Sukan & Permainan</span>
          </div>
        </div>
      </div>

      {/* SUB MENU 1: UTAMA KOKURIKULUM (Menyatukan Badan Beruniform, Kelab & Persatuan, dan Sukan & Permainan) */}
      {activeSubTab === 'utama' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Action Bar when Edit Mode is active */}
          {canEdit && isEditMode && (
            <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-yellow-400/40 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-blue-950 flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                    Mod Sunting Utama Kokurikulum Aktif
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-400 text-blue-950 font-black">
                      {roleLabel}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300">
                    Anda boleh menyusun urutan kedudukan unit, mengubah maklumat unit, menambah unit baharu atau memadam unit secara langsung di halaman Utama Kokurikulum.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setEditingUnit({
                      unit: null,
                      isNew: true,
                      defaultCategory: 'beruniform'
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs flex items-center gap-1.5 transition shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Unit Baharu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
                >
                  Selesai Sunting
                </button>
              </div>
            </div>
          )}

          {/* Kad Penyatuan: Badan Beruniform, Kelab & Persatuan, dan Sukan & Permainan disatukan di bawah Utama Kokurikulum */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                    Sub Menu: Utama Kokurikulum
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Penyatuan 3 Kategori Utama
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Badan Beruniform, Kelab & Persatuan, dan Sukan & Permainan
                </h3>
                <p className="text-xs text-slate-300">
                  Ketiga-tiga bidang kokurikulum kini disatukan sepenuhnya di bawah sub menu Utama Kokurikulum untuk paparan komprehensif, teratur, dan mudah diuruskan secara terus.
                </p>
              </div>

              {/* Ringkasan Bilangan 3 Bidang */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-3 py-2 rounded-2xl bg-blue-500/10 border border-blue-400/20 text-center">
                  <span className="text-[10px] text-blue-300 font-bold block">Beruniform</span>
                  <span className="text-sm font-black text-white">
                    {units.filter((u) => u.category === 'beruniform').length} Pasukan
                  </span>
                </div>
                <div className="px-3 py-2 rounded-2xl bg-purple-500/10 border border-purple-400/20 text-center">
                  <span className="text-[10px] text-purple-300 font-bold block">Kelab</span>
                  <span className="text-sm font-black text-white">
                    {units.filter((u) => u.category === 'kelab').length} Kelab
                  </span>
                </div>
                <div className="px-3 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 text-center">
                  <span className="text-[10px] text-emerald-300 font-bold block">Sukan</span>
                  <span className="text-sm font-black text-white">
                    {units.filter((u) => u.category === 'sukan').length} Sukan
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Units Sections (Disatukan sepenuhnya di bawah Utama Kokurikulum) */}
          <div className="space-y-10">
            {categoriesConfig.map((cat) => {
              const catUnits = units.filter((u) => u.category === cat.id);
              const CatIcon = cat.icon;

              return (
                <div key={cat.id} className="space-y-4">
                  {/* Category Section Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl ${cat.iconBoxClass} flex items-center justify-center shadow-md flex-shrink-0`}>
                        <CatIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-lg sm:text-xl font-black text-white">
                            {cat.label}
                          </h3>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-bold border border-white/10">
                            {catUnits.length} Unit
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {cat.subtitle}
                        </p>
                      </div>
                    </div>

                    {canEdit && isEditMode && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingUnit({
                            unit: null,
                            isNew: true,
                            defaultCategory: cat.id
                          })
                        }
                        className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white/10 hover:bg-yellow-400 text-slate-200 hover:text-blue-950 font-bold text-xs flex items-center gap-1.5 transition border border-white/10 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Unit {cat.label}</span>
                      </button>
                    )}
                  </div>

                  {/* Units Grid */}
                  {catUnits.length === 0 ? (
                    <div className="bg-slate-900/40 border border-dashed border-white/10 rounded-3xl p-8 text-center text-slate-400 text-xs">
                      Tiada unit didaftarkan di bawah kategori ini buat masa ini.
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {catUnits.map((unit, idx) => (
                        <div
                          key={unit.id}
                          className={`bg-white/10 backdrop-blur-md rounded-3xl border ${
                            isEditMode ? 'border-yellow-400/40' : 'border-white/10'
                          } p-6 shadow-lg hover:shadow-xl transition flex flex-col justify-between space-y-4 group ${cat.borderHover} relative`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg ${cat.badgeClass}`}
                              >
                                {cat.label}
                              </span>
                              <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                {renderUnitIcon(unit.iconName, unit.category)}
                              </div>
                            </div>

                            <h4 className="font-extrabold text-base text-white group-hover:text-yellow-300 transition">
                              {unit.name}
                            </h4>

                            <p className="text-xs text-slate-200 leading-relaxed font-normal">
                              {unit.description}
                            </p>
                          </div>

                          <div className="space-y-3 pt-3 border-t border-white/10">
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center gap-2 text-slate-300">
                                <User className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                <span>
                                  <strong>Guru Penasihat:</strong> {unit.advisorTeacher}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-300">
                                <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                <span>
                                  <strong>Masa Perjumpaan:</strong> {unit.meetingTime}
                                </span>
                              </div>
                            </div>

                            {/* Reordering and Edit Controls in Edit Mode */}
                            {canEdit && isEditMode && (
                              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveUnit(unit.id, -1)}
                                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 disabled:opacity-25 transition cursor-pointer"
                                    title="Pindah Unit ke Depan"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === catUnits.length - 1}
                                    onClick={() => handleMoveUnit(unit.id, 1)}
                                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 disabled:opacity-25 transition cursor-pointer"
                                    title="Pindah Unit ke Belakang"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-[10px] text-slate-400 font-bold px-1">
                                    #{idx + 1}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingUnit({ unit, isNew: false })}
                                    className="px-2.5 py-1 rounded-lg bg-yellow-400/20 hover:bg-yellow-400 text-yellow-300 hover:text-blue-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                                    title="Sunting Unit"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Sunting</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeleteConfirm({
                                        title: `Padam Unit ${unit.name}?`,
                                        message: `Adakah anda pasti ingin memadam unit ${unit.name} daripada senarai kokurikulum?`,
                                        onConfirm: () => handleDeleteUnit(unit.id)
                                      })
                                    }
                                    className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition cursor-pointer"
                                    title="Padam Unit"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB MENU 2: JADUAL & TAKWIM KOKURIKULUM */}
      {activeSubTab === 'jadual' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Jadual Perjumpaan Aktiviti Kokurikulum</h3>
                <p className="text-xs text-slate-300">Setiap Hari Rabu (Murid Tahap 2: Tahun 4, 5, dan 6)</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-slate-900/70 p-5 rounded-2xl border border-blue-400/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Sesi 1
                  </span>
                  <Shield className="w-4 h-4 text-blue-400" />
                </div>
                <h4 className="font-extrabold text-white text-base">Badan Beruniform</h4>
                <div className="text-xs text-slate-300 space-y-1">
                  <p><strong>Masa:</strong> 2.00 Petang - 3.00 Petang</p>
                  <p><strong>Tempat:</strong> Dataran Perhimpunan & Dewan</p>
                  <p><strong>Unit:</strong> Pengakap, TKRS, Pandu Puteri Tunas</p>
                </div>
              </div>

              <div className="bg-slate-900/70 p-5 rounded-2xl border border-purple-400/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    Sesi 2
                  </span>
                  <BookOpen className="w-4 h-4 text-purple-400" />
                </div>
                <h4 className="font-extrabold text-white text-base">Kelab & Persatuan</h4>
                <div className="text-xs text-slate-300 space-y-1">
                  <p><strong>Masa:</strong> 3.00 Petang - 4.00 Petang</p>
                  <p><strong>Tempat:</strong> Bilik Darjah & Bilik Khas</p>
                  <p><strong>Unit:</strong> Bahasa, STEM, Agama Islam, Doktor Muda</p>
                </div>
              </div>

              <div className="bg-slate-900/70 p-5 rounded-2xl border border-emerald-400/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Sesi 3
                  </span>
                  <Trophy className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="font-extrabold text-white text-base">Sukan & Permainan</h4>
                <div className="text-xs text-slate-300 space-y-1">
                  <p><strong>Masa:</strong> 4.00 Petang - 5.00 Petang</p>
                  <p><strong>Tempat:</strong> Padang Sekolah & Gelanggang</p>
                  <p><strong>Unit:</strong> Bola Sepak, Bola Jaring, Badminton, Olahraga</p>
                </div>
              </div>
            </div>

            {/* Panduan Etika Pakaian Kokurikulum */}
            <div className="mt-6 pt-6 border-t border-white/10 grid sm:grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                <h5 className="font-bold text-sm text-yellow-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                  Rabu Minggu 1 & 3: Uniform Lengkap
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Murid wajib memakai pakaian seragam unit beruniform yang lengkap (beret, lencana, skaf, dan tali pinggang) sepanjang waktu persekolahan sehingga selesai sesi aktiviti.
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                <h5 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Rabu Minggu 2 & 4: T-Shirt Kokurikulum
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Murid memakai baju T-Shirt Kokurikulum sekolah atau T-Shirt kelab bersama seluar sukan berwarna gelap dan kasut sukan yang sesuai untuk aktiviti padang.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB MENU 3: PORTAL PAJSK & SISTEM */}
      {activeSubTab === 'pajsk' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Portal PAJSK & Pautan Sistem Kokurikulum</h3>
                <p className="text-xs text-slate-300">Pautan rasmi KPM, perekodan kehadiran kokurikulum dan borang penskoran markah.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  title: 'PAJSK Online KPM',
                  desc: 'Sistem Pentaksiran Aktiviti Jasmani, Sukan & Kokurikulum KPM bagi merekod jawatan, kehadiran dan pencapaian.',
                  url: 'https://pajsk.moe.gov.my',
                  badge: 'Portal Rasmi KPM',
                  icon: Trophy
                },
                {
                  title: 'e-Kehadiran Kokurikulum (DELIMa 3.0)',
                  desc: 'Perekodan kehadiran mingguan hari Rabu dan pelaporan mingguan aktiviti oleh guru penasihat unit.',
                  url: 'https://d3.delima.edu.my',
                  badge: 'Kehadiran Koko',
                  icon: Calendar
                },
                {
                  title: 'Borang Penskoran Markah & Merit Kokurikulum',
                  desc: 'Borang penskoran jawatan murid, komitmen tahunan, tahap penglibatan dan anugerah ekstra kurikulum.',
                  url: 'https://drive.google.com',
                  badge: 'Borang Markah',
                  icon: Award
                },
                {
                  title: 'Portal Kejohanan Sukan MSSD / MSSK',
                  desc: 'Pendaftaran atlet murid, jadual kejohanan MSSD Kulim/Bandar Baharu dan keputusan pertandingan sukan.',
                  url: 'https://jpnkedah.moe.gov.my',
                  badge: 'MSSD / MSSK',
                  icon: Target
                }
              ].map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={idx}
                    className="bg-slate-900/70 p-5 rounded-2xl border border-white/10 hover:border-yellow-400/40 transition flex flex-col justify-between space-y-4 shadow-lg group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                          {item.badge}
                        </span>
                        <ItemIcon className="w-5 h-5 text-yellow-400" />
                      </div>
                      <h4 className="font-extrabold text-base text-white group-hover:text-yellow-300 transition">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-yellow-400 hover:text-blue-950 font-bold text-xs text-white transition border border-white/10 cursor-pointer"
                    >
                      <span>Buka Sistem / Pautan</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB MENU 4: KOT (KEJOHANAN OLAHRAGA TAHUNAN 2026) */}
      {activeSubTab === 'kot' && (
        <div className="space-y-8 animate-fadeIn">
          <KotSubSection />
        </div>
      )}

      {/* Edit Unit Modal */}
      <EditUnitModal
        isOpen={Boolean(editingUnit)}
        onClose={() => setEditingUnit(null)}
        initialUnit={editingUnit?.unit}
        defaultCategory={editingUnit?.defaultCategory || 'beruniform'}
        isNew={Boolean(editingUnit?.isNew)}
        onSave={handleSaveUnit}
      />

      {/* Edit Banner / Info Utama Kokurikulum Modal */}
      <EditKokoBannerModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        badge={bannerInfo.badge}
        title={bannerInfo.title}
        description={bannerInfo.description}
        onSave={handleSaveBannerInfo}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-white text-base">{deleteConfirm.title}</h4>
              {deleteConfirm.message && (
                <p className="text-xs text-slate-300">{deleteConfirm.message}</p>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteConfirm.onConfirm();
                  setDeleteConfirm(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Ya, Padam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
