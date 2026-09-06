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
  FileCheck,
  CalendarCheck2,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  Sliders,
  Settings
} from 'lucide-react';
import {
  HemData,
  SchoolProfile,
  Staff,
  StudentRecord,
  StudentAbsenceRecord,
  SchoolHoliday,
  UserRole,
  isTeacherRole,
  canEditHem,
  HemRuleItem,
  HemOfficer,
  HemRmtMenuItem
} from '../../types';
import { initialHemData, initialSchoolHolidays } from '../../data/initialData';
import { initialStudentsList } from '../../data/studentsData';
import { initialAbsenceRecords } from '../../data/initialAttendance';
import { HemAttendanceSubSection } from './HemAttendanceSubSection';
import { TeacherRmtSubSection } from './TeacherRmtSubSection';
import { formatGoogleDriveUrl } from '../../utils/imageHelpers';
import {
  findPkHemStaff,
  findPkPentadbiranStaff,
  findPkKokurikulumStaff
} from '../../utils/staffHelpers';
import { getActiveSchoolHoliday } from '../../utils/studentHelpers';
import { loadHemData, saveHemData } from '../../utils/storage';
import {
  EditStatsModal,
  EditSpeechModal,
  EditRuleModal,
  EditUbkModal,
  EditRmtModal,
  EditOfficerModal,
  EditPointModal
} from './HemEditModals';

interface HemSectionProps {
  hemData?: HemData;
  onSaveHemData?: (data: HemData) => void;
  profile?: SchoolProfile;
  staffList?: Staff[];
  students?: StudentRecord[];
  absenceRecords?: StudentAbsenceRecord[];
  schoolHolidays?: SchoolHoliday[];
  onSaveSchoolHolidays?: (holidays: SchoolHoliday[]) => void;
  onAddAbsenceRecord?: (
    record: Omit<StudentAbsenceRecord, 'id' | 'refNo' | 'createdAt'>
  ) => StudentAbsenceRecord;
  onUpdateAbsenceRecord?: (record: StudentAbsenceRecord) => void;
  onDeleteAbsenceRecord?: (id: string) => void;
  initialSubTab?: 'semua' | 'kehadiran' | 'disiplin' | 'kebajikan' | '3k';
  isAdmin?: boolean;
  isTeacher?: boolean;
  userRole?: UserRole | null;
  onOpenStudentPortal?: () => void;
  onOpenRmtPortal?: () => void;
  onOpenLogin?: () => void;
}

export const HemSection: React.FC<HemSectionProps> = ({
  hemData = initialHemData,
  onSaveHemData,
  profile,
  staffList,
  students = initialStudentsList,
  absenceRecords = initialAbsenceRecords,
  schoolHolidays = initialSchoolHolidays,
  onSaveSchoolHolidays,
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
  const isAuthorized = isAdmin || isTeacher || isTeacherRole(userRole);
  const canEdit = canEditHem(userRole, isAdmin);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentHemData, setCurrentHemData] = useState<HemData>(() => {
    return hemData || loadHemData();
  });
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Sync if hemData prop changes
  useEffect(() => {
    if (hemData) {
      setCurrentHemData(hemData);
    }
  }, [hemData]);

  const showToast = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const handleSaveData = (updated: HemData, msg?: string) => {
    setCurrentHemData(updated);
    saveHemData(updated);
    if (onSaveHemData) {
      onSaveHemData(updated);
    }
    showToast(msg || 'Maklumat HEM berjaya dikemas kini!');
  };

  const data = currentHemData;
  const [activeSubTab, setActiveSubTab] = useState<'semua' | 'kehadiran' | 'disiplin' | 'kebajikan' | '3k'>(initialSubTab);
  const [isRmtModalOpen, setIsRmtModalOpen] = useState(false);

  // Edit Modals State
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSpeechModalOpen, setIsSpeechModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<{ rule: HemRuleItem; isNew: boolean } | null>(null);
  const [editingUbk, setEditingUbk] = useState<{ service: { title: string; desc: string }; isNew: boolean; index?: number } | null>(null);
  const [editingRmt, setEditingRmt] = useState<{ item: HemRmtMenuItem; isNew: boolean; index?: number } | null>(null);
  const [editingOfficer, setEditingOfficer] = useState<{ officer: HemOfficer; isNew: boolean } | null>(null);
  const [editingPoint, setEditingPoint] = useState<{
    title: string;
    categoryLabel: string;
    value: string;
    isNew: boolean;
    onSave: (val: string) => void;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    title: string;
    message?: string;
    onConfirm: () => void;
  } | null>(null);

  // Manager identity label
  const managerRoleLabel = useMemo(() => {
    if (isAdmin) return 'Pentadbir Sistem (Admin)';
    if (userRole === 'pk_hem') return 'Penolong Kanan Hal Ehwal Murid (PK HEM)';
    if (userRole === 'su_hem') return 'Setiausaha HEM (SU HEM)';
    return 'Pengurusan HEM';
  }, [isAdmin, userRole]);

  // Array reorder helper
  const moveItemInArray = <T,>(arr: T[], index: number, direction: -1 | 1): T[] => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= arr.length) return arr;
    const next = [...arr];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    return next;
  };

  // Reorder Disiplin Rules
  const handleMoveRule = (index: number, direction: -1 | 1) => {
    const rules = data.disiplin?.rules || [];
    const updatedRules = moveItemInArray(rules, index, direction);
    const updated = {
      ...data,
      disiplin: {
        ...data.disiplin,
        rules: updatedRules
      }
    };
    handleSaveData(updated, 'Susunan peraturan disiplin dikemas kini!');
  };

  // Reorder UBK Services
  const handleMoveUbk = (index: number, direction: -1 | 1) => {
    const services = data.disiplin?.ubkServices || [];
    const updatedServices = moveItemInArray(services, index, direction);
    const updated = {
      ...data,
      disiplin: {
        ...data.disiplin,
        ubkServices: updatedServices
      }
    };
    handleSaveData(updated, 'Susunan perkhidmatan UBK dikemas kini!');
  };

  // Reorder RMT Menu
  const handleMoveRmt = (index: number, direction: -1 | 1) => {
    const rmtMenu = data.kebajikan?.rmtMenu || [];
    const updatedMenu = moveItemInArray(rmtMenu, index, direction);
    const updated = {
      ...data,
      kebajikan: {
        ...data.kebajikan,
        rmtMenu: updatedMenu
      }
    };
    handleSaveData(updated, 'Susunan jadual menu RMT dikemas kini!');
  };

  // Reorder Committee Officer
  const handleMoveOfficer = (index: number, direction: -1 | 1) => {
    const committee = data.committee || [];
    const updatedCommittee = moveItemInArray(committee, index, direction);
    const updated = {
      ...data,
      committee: updatedCommittee
    };
    handleSaveData(updated, 'Susunan jawatankuasa HEM dikemas kini!');
  };

  // Reorder simple array (SPBT, BAP, 3K)
  const handleMovePointItem = (
    listType: 'spbt' | 'bap' | 'safety' | 'health' | 'cleanliness',
    index: number,
    direction: -1 | 1
  ) => {
    let updated = { ...data };
    if (listType === 'spbt') {
      const list = data.kebajikan?.spbtGuidelines || [];
      updated.kebajikan = { ...updated.kebajikan, spbtGuidelines: moveItemInArray(list, index, direction) };
    } else if (listType === 'bap') {
      const list = data.kebajikan?.bapDetails || [];
      updated.kebajikan = { ...updated.kebajikan, bapDetails: moveItemInArray(list, index, direction) };
    } else if (listType === 'safety') {
      const list = data.program3k?.safetyPoints || [];
      updated.program3k = { ...updated.program3k, safetyPoints: moveItemInArray(list, index, direction) };
    } else if (listType === 'health') {
      const list = data.program3k?.healthPoints || [];
      updated.program3k = { ...updated.program3k, healthPoints: moveItemInArray(list, index, direction) };
    } else if (listType === 'cleanliness') {
      const list = data.program3k?.cleanlinessPoints || [];
      updated.program3k = { ...updated.program3k, cleanlinessPoints: moveItemInArray(list, index, direction) };
    }
    handleSaveData(updated, 'Susunan panduan dikemas kini!');
  };

  // Save / Delete Disiplin Rule
  const handleSaveRule = (savedRule: HemRuleItem) => {
    const rules = [...(data.disiplin?.rules || [])];
    const existingIdx = rules.findIndex((r) => r.id === savedRule.id);
    if (existingIdx !== -1) {
      rules[existingIdx] = savedRule;
    } else {
      rules.push(savedRule);
    }
    const updated = {
      ...data,
      disiplin: {
        ...data.disiplin,
        rules
      }
    };
    handleSaveData(updated, 'Peraturan disiplin berjaya disimpan!');
    setEditingRule(null);
  };

  const handleDeleteRule = (ruleId: string) => {
    const rules = (data.disiplin?.rules || []).filter((r) => r.id !== ruleId);
    const updated = {
      ...data,
      disiplin: {
        ...data.disiplin,
        rules
      }
    };
    handleSaveData(updated, 'Peraturan disiplin dipadamkan!');
  };

  // Save / Delete UBK
  const handleSaveUbk = (service: { title: string; desc: string }, index?: number) => {
    const services = [...(data.disiplin?.ubkServices || [])];
    if (index !== undefined && index >= 0 && index < services.length) {
      services[index] = service;
    } else {
      services.push(service);
    }
    const updated = {
      ...data,
      disiplin: {
        ...data.disiplin,
        ubkServices: services
      }
    };
    handleSaveData(updated, 'Perkhidmatan UBK berjaya disimpan!');
    setEditingUbk(null);
  };

  const handleDeleteUbk = (index: number) => {
    const services = (data.disiplin?.ubkServices || []).filter((_, i) => i !== index);
    const updated = {
      ...data,
      disiplin: {
        ...data.disiplin,
        ubkServices: services
      }
    };
    handleSaveData(updated, 'Perkhidmatan UBK dipadamkan!');
  };

  // Save / Delete RMT Menu
  const handleSaveRmt = (item: HemRmtMenuItem, index?: number) => {
    const menu = [...(data.kebajikan?.rmtMenu || [])];
    if (index !== undefined && index >= 0 && index < menu.length) {
      menu[index] = item;
    } else {
      menu.push(item);
    }
    const updated = {
      ...data,
      kebajikan: {
        ...data.kebajikan,
        rmtMenu: menu
      }
    };
    handleSaveData(updated, 'Menu RMT berjaya disimpan!');
    setEditingRmt(null);
  };

  const handleDeleteRmt = (index: number) => {
    const menu = (data.kebajikan?.rmtMenu || []).filter((_, i) => i !== index);
    const updated = {
      ...data,
      kebajikan: {
        ...data.kebajikan,
        rmtMenu: menu
      }
    };
    handleSaveData(updated, 'Menu RMT dipadamkan!');
  };

  // Save / Delete Committee Officer
  const handleSaveOfficer = (officer: HemOfficer) => {
    const committee = [...(data.committee || [])];
    const existingIdx = committee.findIndex((c) => c.id === officer.id);
    if (existingIdx !== -1) {
      committee[existingIdx] = officer;
    } else {
      committee.push(officer);
    }
    const updated = {
      ...data,
      committee
    };
    handleSaveData(updated, 'Pegawai jawatankuasa HEM berjaya disimpan!');
    setEditingOfficer(null);
  };

  const handleDeleteOfficer = (officerId: string) => {
    const committee = (data.committee || []).filter((c) => c.id !== officerId);
    const updated = {
      ...data,
      committee
    };
    handleSaveData(updated, 'Pegawai jawatankuasa dipadamkan!');
  };

  const handleOpenRmt = () => {
    if (!isAuthorized) return;
    if (onOpenRmtPortal) {
      onOpenRmtPortal();
    }
    setIsRmtModalOpen(true);
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

  // Check if today is a school holiday (or default weekend Friday & Saturday in Kedah)
  const todayHoliday = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    return getActiveSchoolHoliday(todayStr, schoolHolidays);
  }, [schoolHolidays]);

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

    const isHoliday = !!todayHoliday;
    const absentCount = isHoliday ? totalStudents : absentIds.size;
    const presentCount = isHoliday ? 0 : Math.max(0, totalStudents - absentCount);
    const percentage = isHoliday ? '0.0' : totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : '100.0';

    return {
      todayStr,
      totalStudents,
      absentCount,
      presentCount,
      percentage,
      isHoliday,
      holidayTitle: todayHoliday?.title
    };
  }, [students, absenceRecords, todayHoliday]);

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
      {/* Toast Feedback */}
      {statusMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/50 animate-bounce">
          <Check className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-black">{statusMsg}</span>
        </div>
      )}

      {/* Direct Management Toolbar for Admin, PK HEM & SU HEM */}
      {canEdit && (
        <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900/90 to-blue-950/90 border-2 border-emerald-400/40 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Akses Pengurusan Langsung HEM
                  </span>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                    {managerRoleLabel}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                  Mod Sunting & Susun Atur Terus Halaman HEM
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer ${
                  isEditMode
                    ? 'bg-yellow-400 text-blue-950 hover:bg-yellow-300 ring-2 ring-yellow-300/50'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditMode ? 'Mod Sunting: AKTIF' : 'Aktifkan Mod Sunting'}</span>
              </button>
            </div>
          </div>

          {/* Quick Action Shortcut Bar when Edit Mode is active */}
          {isEditMode && (
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-slate-300 whitespace-nowrap flex items-center gap-1.5 mr-1">
                <Settings className="w-3.5 h-3.5 text-yellow-400" />
                Tindakan Pantas:
              </span>
              <button
                type="button"
                onClick={() =>
                  setEditingRule({
                    rule: { id: `rule-${Date.now()}`, title: '', desc: '', type: 'info' },
                    isNew: true
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-slate-950 font-bold text-slate-200 transition whitespace-nowrap border border-white/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Peraturan
              </button>
              <button
                type="button"
                onClick={() => setEditingUbk({ service: { title: '', desc: '' }, isNew: true })}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-purple-400 hover:text-slate-950 font-bold text-slate-200 transition whitespace-nowrap border border-white/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Perkhidmatan UBK
              </button>
              <button
                type="button"
                onClick={() => setEditingRmt({ item: { day: '', menu: '' }, isNew: true })}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-slate-950 font-bold text-slate-200 transition whitespace-nowrap border border-white/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Menu RMT
              </button>
              <button
                type="button"
                onClick={() =>
                  setEditingOfficer({
                    officer: { id: `officer-${Date.now()}`, role: '', name: '', unit: 'HEM' },
                    isNew: true
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-yellow-400 hover:text-blue-950 font-bold text-slate-200 transition whitespace-nowrap border border-white/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Pegawai HEM
              </button>
              <button
                type="button"
                onClick={() => setIsStatsModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-400 hover:text-slate-950 text-emerald-300 font-bold transition whitespace-nowrap border border-emerald-400/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Percent className="w-3.5 h-3.5" />
                Kemas Kini Statistik
              </button>
              <button
                type="button"
                onClick={() => setIsSpeechModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-400 hover:text-slate-950 text-blue-300 font-bold transition whitespace-nowrap border border-blue-400/30 flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Kemas Kini Penerangan
              </button>
            </div>
          )}
        </div>
      )}

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

              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setShowHemIntro(!showHemIntro)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-yellow-300 hover:text-yellow-200 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition border border-white/10 cursor-pointer"
                  title={showHemIntro ? "Sembunyikan penerangan" : "Baca penerangan penuh"}
                >
                  <span>{showHemIntro ? "Sembunyikan Info" : "Info Hal Ehwal Murid"}</span>
                  {showHemIntro ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {canEdit && isEditMode && (
                  <button
                    type="button"
                    onClick={() => setIsSpeechModalOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-500/20 hover:bg-emerald-500/30 px-2.5 py-1 rounded-lg transition border border-emerald-400/30 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sunting Penerangan</span>
                  </button>
                )}
              </div>
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
          schoolHolidays={schoolHolidays}
          onSaveSchoolHolidays={onSaveSchoolHolidays}
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
          <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden transition-all duration-300 ${
            todayAttendanceStats.isHoliday
              ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-amber-400/50 shadow-amber-500/10'
              : 'bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-emerald-500/40'
          }`}>
            <div className="space-y-2 z-10">
              {todayAttendanceStats.isHoliday ? (
                <>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-400/30">
                    <CalendarCheck2 className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Cuti Persekolahan Hari Ini ({todayAttendanceStats.todayStr})</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5 flex-wrap">
                    <span className="text-slate-300">Cuti:</span>
                    <span className="text-yellow-400">{todayAttendanceStats.holidayTitle}</span>
                  </h4>
                  <div className="flex flex-wrap items-center gap-2.5 py-0.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black">
                      Hadir 0%
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-black">
                      Tidak Hadir 100%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-xl">
                    Enrolmen: <strong>{todayAttendanceStats.totalStudents} murid</strong> | Hadir: <strong>0 (0.0%)</strong> | Tidak Hadir: <strong>{todayAttendanceStats.totalStudents} (100.0%)</strong>.
                    Hari cuti persekolahan mengikut takwim ({todayAttendanceStats.holidayTitle}). Tiada sesi persekolahan beroperasi pada hari ini.
                  </p>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>

            <div className="flex items-center gap-2.5 z-10 flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveSubTab('kehadiran')}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Buka e-Kehadiran</span>
              </button>
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

            {canEdit && isEditMode && (
              <div className="col-span-2 sm:col-span-4 flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsStatsModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-yellow-400 text-blue-950 font-black text-xs flex items-center gap-1.5 shadow hover:bg-yellow-300 transition cursor-pointer"
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>Kemas Kini Statistik Utama</span>
                </button>
              </div>
            )}
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
            <div className="flex items-center gap-2">
              {canEdit && isEditMode && (
                <button
                  type="button"
                  onClick={() =>
                    setEditingRule({
                      rule: { id: `rule-${Date.now()}`, title: '', desc: '', type: 'info' },
                      isNew: true
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-yellow-400 text-blue-950 font-black text-xs flex items-center gap-1 shadow hover:bg-yellow-300 transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Peraturan</span>
                </button>
              )}
              <span className="text-[11px] bg-yellow-400/20 text-yellow-300 font-bold px-3 py-1 rounded-full border border-yellow-400/30">
                Sahsiah & Integriti
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1.1: Peraturan Sekolah */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg flex flex-col justify-between space-y-4 hover:border-yellow-400/40 transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-amber-500/20 text-amber-300 rounded-2xl flex items-center justify-center font-bold border border-amber-400/30">
                    <ShieldAlert className="w-5 h-5 text-amber-300" />
                  </div>
                  {canEdit && isEditMode && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingRule({
                          rule: { id: `rule-${Date.now()}`, title: '', desc: '', type: 'info' },
                          isNew: true
                        })
                      }
                      className="p-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Tambah Peraturan Disiplin"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah</span>
                    </button>
                  )}
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
                    <div
                      key={rule.id || idx}
                      className={`flex items-start justify-between gap-2 p-2 rounded-xl transition ${
                        isEditMode ? 'bg-white/5 border border-white/10 hover:border-amber-400/40' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2 flex-1">
                        {rule.type === 'warning' ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                        ) : rule.type === 'info' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        )}
                        <span className="leading-snug">
                          <strong>{rule.title}:</strong> {rule.desc}
                        </span>
                      </div>

                      {canEdit && isEditMode && (
                        <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveRule(idx, -1)}
                            className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 disabled:opacity-30 cursor-pointer"
                            title="Pindah ke atas"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (data.disiplin?.rules?.length || 0) - 1}
                            onClick={() => handleMoveRule(idx, 1)}
                            className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 disabled:opacity-30 cursor-pointer"
                            title="Pindah ke bawah"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRule({ rule, isNew: false })}
                            className="p-1 rounded-md bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 transition cursor-pointer"
                            title="Sunting Peraturan"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                title: `Padam Peraturan "${rule.title}"?`,
                                onConfirm: () => handleDeleteRule(rule.id)
                              })
                            }
                            className="p-1 rounded-md bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition cursor-pointer"
                            title="Padam Peraturan"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {canEdit && isEditMode && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingRule({
                          rule: { id: `rule-${Date.now()}`, title: '', desc: '', type: 'info' },
                          isNew: true
                        })
                      }
                      className="w-full py-1.5 px-2.5 mt-2 rounded-xl border border-dashed border-amber-400/40 text-amber-300 hover:bg-amber-400/10 font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Peraturan Disiplin</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
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
                  className="w-full py-2.5 px-3 bg-white/10 hover:bg-yellow-400 hover:text-blue-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Lihat Kod Peraturan Penuh</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {canEdit && isEditMode && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditingPoint({
                        title: 'Kod Peraturan Disiplin Penuh',
                        categoryLabel: 'Disiplin Sekolah',
                        value: data.disiplin?.fullGuidelines || '',
                        isNew: false,
                        onSave: (val) => {
                          const updated = {
                            ...data,
                            disiplin: {
                              ...data.disiplin,
                              fullGuidelines: val
                            }
                          };
                          handleSaveData(updated, 'Kod peraturan penuh dikemas kini!');
                          setEditingPoint(null);
                        }
                      })
                    }
                    className="w-full py-1.5 px-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold text-xs border border-amber-400/30 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sunting Teks Kod Peraturan Penuh</span>
                  </button>
                )}
              </div>
            </div>

            {/* Card 1.2: Unit Bimbingan & Kaunseling (UBK) */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg flex flex-col justify-between space-y-4 hover:border-yellow-400/40 transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-purple-500/20 text-purple-300 rounded-2xl flex items-center justify-center font-bold border border-purple-400/30">
                    <Smile className="w-5 h-5 text-purple-300" />
                  </div>
                  {canEdit && isEditMode && (
                    <button
                      type="button"
                      onClick={() => setEditingUbk({ service: { title: '', desc: '' }, isNew: true })}
                      className="p-1.5 rounded-lg bg-purple-400/20 hover:bg-purple-400 text-purple-300 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Tambah Perkhidmatan UBK"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah</span>
                    </button>
                  )}
                </div>
                <h4 className="font-extrabold text-white text-base">
                  {data.disiplin?.ubkTitle || 'Unit Bimbingan & Kaunseling (UBK)'}
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {data.disiplin?.ubkDescription ||
                    'Menyediakan perkhidmatan kaunseling individu & kelompok, pembangunan emosi, bimbingan kerjaya, serta program kesejahteraan mental murid.'}
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  {data.disiplin?.ubkServices?.slice(0, isEditMode ? 10 : 4).map((srv, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start justify-between gap-2 p-2 rounded-xl transition ${
                        isEditMode ? 'bg-white/5 border border-white/10 hover:border-purple-400/40' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2 flex-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span className="leading-snug">
                          <strong>{srv.title}:</strong> {srv.desc}
                        </span>
                      </div>

                      {canEdit && isEditMode && (
                        <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveUbk(idx, -1)}
                            className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 disabled:opacity-30 cursor-pointer"
                            title="Pindah ke atas"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (data.disiplin?.ubkServices?.length || 0) - 1}
                            onClick={() => handleMoveUbk(idx, 1)}
                            className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 disabled:opacity-30 cursor-pointer"
                            title="Pindah ke bawah"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingUbk({ service: srv, isNew: false, index: idx })}
                            className="p-1 rounded-md bg-purple-400/20 hover:bg-purple-400 text-purple-300 hover:text-slate-950 transition cursor-pointer"
                            title="Sunting Perkhidmatan"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirm({
                                title: `Padam Perkhidmatan "${srv.title}"?`,
                                onConfirm: () => handleDeleteUbk(idx)
                              })
                            }
                            className="p-1 rounded-md bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition cursor-pointer"
                            title="Padam Perkhidmatan"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {canEdit && isEditMode && (
                    <button
                      type="button"
                      onClick={() => setEditingUbk({ service: { title: '', desc: '' }, isNew: true })}
                      className="w-full py-1.5 px-2.5 mt-2 rounded-xl border border-dashed border-purple-400/40 text-purple-300 hover:bg-purple-400/10 font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Perkhidmatan UBK</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
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
                  className="w-full py-2.5 px-3 bg-white/10 hover:bg-yellow-400 hover:text-blue-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Info Perkhidmatan UBK</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
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
                {canEdit && isEditMode && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditingPoint({
                        title: 'Penerangan SSDM 2.0',
                        categoryLabel: 'Disiplin Sekolah',
                        value: data.disiplin?.ssdmDescription || '',
                        isNew: false,
                        onSave: (val) => {
                          const updated = {
                            ...data,
                            disiplin: {
                              ...data.disiplin,
                              ssdmDescription: val
                            }
                          };
                          handleSaveData(updated, 'Penerangan SSDM dikemas kini!');
                          setEditingPoint(null);
                        }
                      })
                    }
                    className="w-full py-1.5 px-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-400/30 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sunting Penerangan SSDM</span>
                  </button>
                )}

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
            <div className="flex items-center gap-2">
              {canEdit && isEditMode && (
                <button
                  type="button"
                  onClick={() => setEditingRmt({ item: { day: '', menu: '' }, isNew: true })}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow hover:bg-amber-300 transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Menu RMT</span>
                </button>
              )}
              <span className="text-[11px] bg-rose-500/20 text-rose-300 font-bold px-3 py-1 rounded-full border border-rose-400/30">
                Bantuan & Hak Murid
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* SPBT */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg space-y-4 hover:border-yellow-400/40 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-blue-500/20 text-blue-300 rounded-2xl flex items-center justify-center font-bold border border-blue-400/30">
                    <BookMarked className="w-5 h-5 text-blue-300" />
                  </div>
                  {canEdit && isEditMode && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingPoint({
                          title: 'Tambah Panduan Penjagaan SPBT',
                          categoryLabel: 'Kebajikan SPBT',
                          value: '',
                          isNew: true,
                          onSave: (val) => {
                            const list = [...(data.kebajikan?.spbtGuidelines || []), val];
                            const updated = {
                              ...data,
                              kebajikan: { ...data.kebajikan, spbtGuidelines: list }
                            };
                            handleSaveData(updated, 'Panduan SPBT ditambah!');
                            setEditingPoint(null);
                          }
                        })
                      }
                      className="p-1.5 rounded-lg bg-blue-400/20 hover:bg-blue-400 text-blue-300 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Tambah Panduan SPBT"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah</span>
                    </button>
                  )}
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
                    <div className="space-y-1 mt-1">
                      {data.kebajikan?.spbtGuidelines?.map((g, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start justify-between gap-1.5 p-1 rounded-lg text-[11px] ${
                            isEditMode ? 'bg-white/5 border border-white/10' : ''
                          }`}
                        >
                          <span className="leading-tight flex-1">• {g}</span>
                          {canEdit && isEditMode && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMovePointItem('spbt', idx, -1)}
                                className="p-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-300 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (data.kebajikan?.spbtGuidelines?.length || 0) - 1}
                                onClick={() => handleMovePointItem('spbt', idx, 1)}
                                className="p-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-300 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingPoint({
                                    title: 'Sunting Panduan SPBT',
                                    categoryLabel: 'Kebajikan SPBT',
                                    value: g,
                                    isNew: false,
                                    onSave: (val) => {
                                      const list = [...(data.kebajikan?.spbtGuidelines || [])];
                                      list[idx] = val;
                                      const updated = {
                                        ...data,
                                        kebajikan: { ...data.kebajikan, spbtGuidelines: list }
                                      };
                                      handleSaveData(updated, 'Panduan SPBT dikemas kini!');
                                      setEditingPoint(null);
                                    }
                                  })
                                }
                                className="p-0.5 rounded bg-blue-400/20 hover:bg-blue-400 text-blue-300 hover:text-slate-950 cursor-pointer"
                              >
                                <Edit3 className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirm({
                                    title: 'Padam Panduan SPBT?',
                                    message: g,
                                    onConfirm: () => {
                                      const list = (data.kebajikan?.spbtGuidelines || []).filter((_, i) => i !== idx);
                                      const updated = {
                                        ...data,
                                        kebajikan: { ...data.kebajikan, spbtGuidelines: list }
                                      };
                                      handleSaveData(updated, 'Panduan SPBT dipadam!');
                                    }
                                  })
                                }
                                className="p-0.5 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white cursor-pointer"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <p>
                      🏢 <strong>Penyelaras:</strong> {data.kebajikan?.spbtCoordinator || 'Cikgu Nurul Ain binti Mahadzir'}
                    </p>
                    {canEdit && isEditMode && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingPoint({
                            title: 'Penyelaras SPBT',
                            categoryLabel: 'Kebajikan SPBT',
                            value: data.kebajikan?.spbtCoordinator || '',
                            isNew: false,
                            onSave: (val) => {
                              const updated = {
                                ...data,
                                kebajikan: { ...data.kebajikan, spbtCoordinator: val }
                              };
                              handleSaveData(updated, 'Penyelaras SPBT dikemas kini!');
                              setEditingPoint(null);
                            }
                          })
                        }
                        className="p-1 rounded bg-blue-400/20 hover:bg-blue-400 text-blue-300 hover:text-slate-950 text-[10px] font-bold cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
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
                className="w-full py-2.5 px-3 bg-white/10 hover:bg-yellow-400 hover:text-blue-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Info Penuh SPBT</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* RMT & Program Susu Sekolah */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg space-y-4 hover:border-yellow-400/40 transition flex flex-col justify-between">
              <div 
                onClick={isAuthorized && !isEditMode ? handleOpenRmt : undefined}
                className={`space-y-3 ${isAuthorized && !isEditMode ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-amber-500/20 text-amber-300 rounded-2xl flex items-center justify-center font-bold border border-amber-400/30">
                    <Utensils className="w-5 h-5 text-amber-300" />
                  </div>
                  {canEdit && isEditMode && (
                    <button
                      type="button"
                      onClick={() => setEditingRmt({ item: { day: '', menu: '' }, isNew: true })}
                      className="p-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Tambah Menu RMT"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah</span>
                    </button>
                  )}
                </div>
                <h4 className={`font-extrabold text-white text-base ${isAuthorized ? 'hover:text-amber-300' : ''} transition`}>
                  {data.kebajikan?.rmtTitle || 'Rancangan Makanan Tambahan (RMT) & Susu'}
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {data.kebajikan?.rmtDescription ||
                    'Penyediaan sarapan pagi / makanan seimbang berkhasiat serta Program Susu Sekolah (PSS) bagi membantu murid mencapai tumbesaran fizikal dan daya tumpuan optimum.'}
                </p>

                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-yellow-300">Penyelaras RMT:</span>
                      {canEdit && isEditMode && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingPoint({
                              title: 'Penyelaras RMT',
                              categoryLabel: 'Kebajikan RMT',
                              value: data.kebajikan?.rmtCoordinator || '',
                              isNew: false,
                              onSave: (val) => {
                                const updated = {
                                  ...data,
                                  kebajikan: { ...data.kebajikan, rmtCoordinator: val }
                                };
                                handleSaveData(updated, 'Penyelaras RMT dikemas kini!');
                                setEditingPoint(null);
                              }
                            })
                          }
                          className="p-0.5 rounded bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 cursor-pointer"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {data.kebajikan?.rmtCoordinator || 'Puan Fazilah binti Mat'}
                    </p>

                    <div className="mt-1.5 pt-1.5 border-t border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-yellow-300">Jadual Menu RMT:</span>
                        {canEdit && isEditMode && (
                          <button
                            type="button"
                            onClick={() => setEditingRmt({ item: { day: '', menu: '' }, isNew: true })}
                            className="text-[10px] font-bold text-amber-300 hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            Tambah Menu
                          </button>
                        )}
                      </div>

                      <div className="space-y-1">
                        {data.kebajikan?.rmtMenu?.map((m, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start justify-between gap-1.5 p-1 rounded-lg text-[11px] ${
                              isEditMode ? 'bg-white/5 border border-white/10' : ''
                            }`}
                          >
                            <span className="leading-tight flex-1">
                              <strong>{m.day}:</strong> {m.menu}
                            </span>
                            {canEdit && isEditMode && (
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveRmt(idx, -1)}
                                  className="p-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-300 disabled:opacity-30 cursor-pointer"
                                >
                                  <ArrowUp className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === (data.kebajikan?.rmtMenu?.length || 0) - 1}
                                  onClick={() => handleMoveRmt(idx, 1)}
                                  className="p-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-300 disabled:opacity-30 cursor-pointer"
                                >
                                  <ArrowDown className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingRmt({ item: m, isNew: false, index: idx })}
                                  className="p-0.5 rounded bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 cursor-pointer"
                                >
                                  <Edit3 className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteConfirm({
                                      title: `Padam Menu "${m.day}"?`,
                                      message: m.menu,
                                      onConfirm: () => handleDeleteRmt(idx)
                                    })
                                  }
                                  className="p-0.5 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white cursor-pointer"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                {/* Butang Buka Portal RMT: Hanya muncul untuk pengguna log in Guru dan Admin sahaja */}
                {isAuthorized && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenRmt();
                    }}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                  >
                    <Utensils className="w-4 h-4 text-slate-950" />
                    <span>Buka Portal RMT ({data.stats?.rmtCount || '78 Murid'})</span>
                  </button>
                )}

                <button
                  type="button"
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
                  className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Info Menu & Kelayakan RMT</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* BAP & Bantuan Khas */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg space-y-4 hover:border-yellow-400/40 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-emerald-500/20 text-emerald-300 rounded-2xl flex items-center justify-center font-bold border border-emerald-400/30">
                    <Coins className="w-5 h-5 text-emerald-300" />
                  </div>
                  {canEdit && isEditMode && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingPoint({
                          title: 'Tambah Maklumat BAP',
                          categoryLabel: 'Kebajikan BAP',
                          value: '',
                          isNew: true,
                          onSave: (val) => {
                            const list = [...(data.kebajikan?.bapDetails || []), val];
                            const updated = {
                              ...data,
                              kebajikan: { ...data.kebajikan, bapDetails: list }
                            };
                            handleSaveData(updated, 'Maklumat BAP ditambah!');
                            setEditingPoint(null);
                          }
                        })
                      }
                      className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Tambah Maklumat BAP"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah</span>
                    </button>
                  )}
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
                    <div className="space-y-1 mt-1">
                      {data.kebajikan?.bapDetails?.map((det, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start justify-between gap-1.5 p-1 rounded-lg text-[11px] ${
                            isEditMode ? 'bg-white/5 border border-white/10' : ''
                          }`}
                        >
                          <span className="leading-tight flex-1">• {det}</span>
                          {canEdit && isEditMode && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMovePointItem('bap', idx, -1)}
                                className="p-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-300 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (data.kebajikan?.bapDetails?.length || 0) - 1}
                                onClick={() => handleMovePointItem('bap', idx, 1)}
                                className="p-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-300 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingPoint({
                                    title: 'Sunting Butiran BAP',
                                    categoryLabel: 'Kebajikan BAP',
                                    value: det,
                                    isNew: false,
                                    onSave: (val) => {
                                      const list = [...(data.kebajikan?.bapDetails || [])];
                                      list[idx] = val;
                                      const updated = {
                                        ...data,
                                        kebajikan: { ...data.kebajikan, bapDetails: list }
                                      };
                                      handleSaveData(updated, 'Butiran BAP dikemas kini!');
                                      setEditingPoint(null);
                                    }
                                  })
                                }
                                className="p-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 cursor-pointer"
                              >
                                <Edit3 className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteConfirm({
                                    title: 'Padam Butiran BAP?',
                                    message: det,
                                    onConfirm: () => {
                                      const list = (data.kebajikan?.bapDetails || []).filter((_, i) => i !== idx);
                                      const updated = {
                                        ...data,
                                        kebajikan: { ...data.kebajikan, bapDetails: list }
                                      };
                                      handleSaveData(updated, 'Butiran BAP dipadam!');
                                    }
                                  })
                                }
                                className="p-0.5 rounded bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white cursor-pointer"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
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
                className="w-full py-2.5 px-3 bg-white/10 hover:bg-yellow-400 hover:text-blue-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
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

      {/* RMT Portal Modal (Hanya Untuk Guru & Admin) */}
      {isRmtModalOpen && isAuthorized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-950/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-md">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    Portal Rancangan Makanan Tambahan (RMT)
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-black">
                      89 Murid Layak
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pangkalan data murid, semakan kelayakan, menu & perekodan ketidakhadiran RMT
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRmtModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              <TeacherRmtSubSection
                coordinatorName={data.kebajikan?.rmtCoordinator || profile?.hemCoordinator || 'Puan Fazilah binti Mat'}
                students={students}
                absenceRecords={absenceRecords}
                onAddAbsenceRecord={onAddAbsenceRecord}
              />
            </div>
          </div>
        </div>
      )}

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
