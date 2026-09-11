import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  HeartHandshake,
  FileText,
  Download,
  CreditCard,
  QrCode,
  Copy,
  Check,
  Printer,
  Send,
  Calendar,
  Building2,
  Sparkles,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  Plus,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
  CheckCircle2,
  Clock,
  BookOpen,
  Filter,
  Eye,
  X,
  Share2,
  Briefcase,
  Edit,
  Pencil,
  Trash2,
  Lock,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { PibgCommittee, PibgActivity, PibgUsul, UserRole, canEditPibg } from '../../types';
import {
  pibgBankingDetails,
  pibgVisionMission,
  initialPibgExtendedActivities,
  initialPibgDocuments,
  initialPibgUsulList,
  ksibSkillAreas,
  PibgOfficialDocument
} from '../../data/pibgData';
import { initialPibgCommittee } from '../../data/initialData';
import { loadPibgCommittee, savePibgCommittee } from '../../utils/storage';
import {
  EditCommitteeModal,
  EditActivityModal,
  EditUsulFeedbackModal,
  EditDocumentModal
} from './pibg/PibgEditorModals';

interface HemPibgSubSectionProps {
  committee?: PibgCommittee[];
  onSaveCommittee?: (committee: PibgCommittee[]) => void;
  isAdmin?: boolean;
  isTeacher?: boolean;
  userRole?: UserRole | null;
  onOpenLogin?: () => void;
}

const LOCAL_STORAGE_USUL_KEY = 'skmp_pibg_usul_v1';
const LOCAL_STORAGE_DONATION_KEY = 'skmp_pibg_donations_v1';
const LOCAL_STORAGE_ACTIVITIES_KEY = 'skmp_pibg_activities_v1';
const LOCAL_STORAGE_DOCS_KEY = 'skmp_pibg_docs_v1';

export const HemPibgSubSection: React.FC<HemPibgSubSectionProps> = ({
  committee = [],
  onSaveCommittee,
  isAdmin = false,
  isTeacher = false,
  userRole = null,
  onOpenLogin
}) => {
  const canEdit = canEditPibg(userRole, isAdmin);

  // Committee local state
  const [localCommittee, setLocalCommittee] = useState<PibgCommittee[]>(() => {
    if (committee && committee.length > 0) return committee;
    return loadPibgCommittee();
  });

  useEffect(() => {
    if (committee && committee.length > 0) {
      setLocalCommittee(committee);
    }
  }, [committee]);

  const handleSaveLocalCommittee = (updated: PibgCommittee[]) => {
    setLocalCommittee(updated);
    savePibgCommittee(updated);
    if (onSaveCommittee) {
      onSaveCommittee(updated);
    }
  };

  // Activities state
  const [activities, setActivities] = useState<PibgActivity[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ACTIVITIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Gagal muat data aktiviti:', e);
    }
    return initialPibgExtendedActivities;
  });

  const handleSaveActivities = (updated: PibgActivity[]) => {
    setActivities(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_ACTIVITIES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Documents state
  const [documents, setDocuments] = useState<PibgOfficialDocument[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DOCS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Gagal muat data dokumen:', e);
    }
    return initialPibgDocuments;
  });

  const handleSaveDocuments = (updated: PibgOfficialDocument[]) => {
    setDocuments(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_DOCS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Editor Modal states
  const [editMemberModalOpen, setEditMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<PibgCommittee | null>(null);
  const [isNewMember, setIsNewMember] = useState(false);

  const [editActivityModalOpen, setEditActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<PibgActivity | null>(null);
  const [isNewActivity, setIsNewActivity] = useState(false);

  const [editUsulModalOpen, setEditUsulModalOpen] = useState(false);
  const [editingUsul, setEditingUsul] = useState<PibgUsul | null>(null);

  const [editDocModalOpen, setEditDocModalOpen] = useState(false);

  // Navigation tabs within PIBG portal
  const [activeTab, setActiveTab] = useState<'carta' | 'takwim' | 'dana' | 'usul' | 'dokumen' | 'ksib'>('carta');

  // Carta Organisasi states
  const [chartViewMode, setChartViewMode] = useState<'hierarchy' | 'table'>('hierarchy');
  const [committeeFilter, setCommitteeFilter] = useState<'semua' | 'utama' | 'guru' | 'waris' | 'audit'>('semua');
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedList, setCopiedList] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<PibgCommittee | null>(null);

  // E-Usul states
  const [usulList, setUsulList] = useState<PibgUsul[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USUL_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Gagal muat data usul:', e);
    }
    return initialPibgUsulList;
  });

  const [isSubmittingUsul, setIsSubmittingUsul] = useState(false);
  const [usulFormSuccess, setUsulFormSuccess] = useState(false);
  const [usulFormData, setUsulFormData] = useState({
    parentName: '',
    phone: '',
    studentName: '',
    studentClass: 'Tahun 1',
    category: 'prasarana' as PibgUsul['category'],
    title: '',
    description: ''
  });

  // Donation form states
  const [donationFormSuccess, setDonationFormSuccess] = useState(false);
  const [donationFormData, setDonationFormData] = useState({
    donorName: '',
    phone: '',
    amount: '',
    purpose: 'Tabung Pembangunan ICT & Kemudahan',
    refNo: '',
    notes: ''
  });

  // KSIB volunteer registration states
  const [ksibRegistered, setKsibRegistered] = useState(false);
  const [ksibFormData, setKsibFormData] = useState({
    name: '',
    phone: '',
    job: '',
    skills: [] as string[]
  });

  // Save Usul to LocalStorage
  const handleSaveUsul = (newList: PibgUsul[]) => {
    setUsulList(newList);
    try {
      localStorage.setItem(LOCAL_STORAGE_USUL_KEY, JSON.stringify(newList));
    } catch (e) {
      console.warn('Gagal simpan usul:', e);
    }
  };

  const handleCopyBankAccount = () => {
    navigator.clipboard.writeText(pibgBankingDetails.accountNumber);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const handleCopyCommitteeText = () => {
    const textLines = [
      'SENARAI JAWATANKUASA PERSATUAN IBU BAPA DAN GURU (PIBG)',
      'SEKOLAH KEBANGSAAN MERBAU PULAS',
      'SESI 2026/2027',
      '--------------------------------------------------',
      'PENASIHAT : PN. NORHAFIZA BINTI DOLAH',
      'YANG DIPERTUA : EN. ASMADI BIN MUSA',
      'NAIB YANG DIPERTUA : EN. JAMALUDIN BIN ISMAIL',
      'SETIAUSAHA : EN. MOHAMAD AIZAT BIN AHMAD SOFI',
      'BENDAHARI : PN. NOR ZAMIZI BT SULONG',
      'AHLI JAWATANKUASA (GURU) :',
      '  1. EN. MUAZ BIN ALI',
      '  2. EN. AHMAD ZAWAWI BIN KAMAL',
      '  3. CIK SALNATASHA BINTI MOHAMAD SABRI',
      '  4. PN. NURUL IZZATUL IFFAH BINTI AZIZAN',
      'AHLI JAWATANKUASA (WARIS) :',
      '  1. EN. WAN MOHD NASSIR BIN WAN MOHAMAD',
      '  2. PN. MARIA BINTI MUSTAFA',
      '  3. PN. NORHAFIZA BINTI MOHD FAZLI',
      '  4. PN. SITI SYAFINAZ BINTI YUSOF',
      'JURUAUDIT (GURU) : PN. ROHAIDAH BT ABU BAKAR',
      'JURUAUDIT (WARIS) : PN. SHARIFATUL NUR AMIRA BINTI ANUOR',
      '--------------------------------------------------'
    ].join('\n');

    navigator.clipboard.writeText(textLines);
    setCopiedList(true);
    setTimeout(() => setCopiedList(false), 2500);
  };

  const handlePrintCommittee = () => {
    window.print();
  };

  const handleSubmitUsul = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usulFormData.parentName || !usulFormData.phone || !usulFormData.title || !usulFormData.description) {
      alert('Sila lengkapkan semua ruangan yang diperlukan.');
      return;
    }

    const newUsulItem: PibgUsul = {
      id: `usul-${Date.now()}`,
      parentName: usulFormData.parentName.trim(),
      phone: usulFormData.phone.trim(),
      studentName: usulFormData.studentName.trim() || 'Tidak dinyatakan',
      studentClass: usulFormData.studentClass,
      category: usulFormData.category,
      title: usulFormData.title.trim(),
      description: usulFormData.description.trim(),
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'diterima',
      adminFeedback: 'Usul telah direkodkan dalam sistem pangkalan data PIBG dan akan dibawa ke Mesyuarat Jawatankuasa.'
    };

    const updated = [newUsulItem, ...usulList];
    handleSaveUsul(updated);
    setUsulFormSuccess(true);
    setUsulFormData({
      parentName: '',
      phone: '',
      studentName: '',
      studentClass: 'Tahun 1',
      category: 'prasarana',
      title: '',
      description: ''
    });
    setTimeout(() => setUsulFormSuccess(false), 5000);
  };

  const handleSubmitDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donationFormData.donorName || !donationFormData.amount) {
      alert('Sila isi nama penyumbang dan jumlah sumbangan.');
      return;
    }
    setDonationFormSuccess(true);
    setDonationFormData({
      donorName: '',
      phone: '',
      amount: '',
      purpose: 'Tabung Pembangunan ICT & Kemudahan',
      refNo: '',
      notes: ''
    });
    setTimeout(() => setDonationFormSuccess(false), 5000);
  };

  // Handlers for editing
  const handleSaveMember = (member: PibgCommittee) => {
    let updated: PibgCommittee[];
    const idx = localCommittee.findIndex(m => m.id === member.id);
    if (idx >= 0) {
      updated = [...localCommittee];
      updated[idx] = member;
    } else {
      updated = [...localCommittee, member];
    }
    handleSaveLocalCommittee(updated);
  };

  const handleDeleteMember = (memberId: string) => {
    const updated = localCommittee.filter(m => m.id !== memberId);
    handleSaveLocalCommittee(updated);
  };

  const handleSaveActivity = (activity: PibgActivity) => {
    let updated: PibgActivity[];
    const idx = activities.findIndex(a => a.id === activity.id);
    if (idx >= 0) {
      updated = [...activities];
      updated[idx] = activity;
    } else {
      updated = [activity, ...activities];
    }
    handleSaveActivities(updated);
  };

  const handleDeleteActivity = (actId: string) => {
    const updated = activities.filter(a => a.id !== actId);
    handleSaveActivities(updated);
  };

  const handleUpdateUsulStatus = (usulId: string, newStatus: PibgUsul['status']) => {
    const updated = usulList.map(u => (u.id === usulId ? { ...u, status: newStatus } : u));
    handleSaveUsul(updated);
  };

  const handleUpdateUsulFeedback = (usulId: string, status: PibgUsul['status'], feedback: string) => {
    const updated = usulList.map(u => {
      if (u.id === usulId) {
        return {
          ...u,
          status,
          adminFeedback: feedback
        };
      }
      return u;
    });
    handleSaveUsul(updated);
  };

  const handleSaveUsulFeedback = (updatedUsul: PibgUsul) => {
    const updated = usulList.map(u => (u.id === updatedUsul.id ? updatedUsul : u));
    handleSaveUsul(updated);
  };

  const handleDeleteUsul = (usulId: string) => {
    const updated = usulList.filter(u => u.id !== usulId);
    handleSaveUsul(updated);
  };

  const handleSaveDoc = (doc: PibgOfficialDocument) => {
    const updated = [doc, ...documents];
    handleSaveDocuments(updated);
  };

  const handleDeleteDoc = (docId: string) => {
    const updated = documents.filter(d => d.id !== docId);
    handleSaveDocuments(updated);
  };

  // Filtered committee list based on localCommittee
  const filteredCommittee = useMemo(() => {
    if (committeeFilter === 'semua') return localCommittee;
    if (committeeFilter === 'utama') {
      return localCommittee.filter(c =>
        c.position.toLowerCase().includes('penasihat') ||
        c.position.toLowerCase().includes('ydp') ||
        c.position.toLowerCase().includes('yang dipertua') ||
        c.position.toLowerCase().includes('setiausaha') ||
        c.position.toLowerCase().includes('bendahari')
      );
    }
    if (committeeFilter === 'guru') {
      return localCommittee.filter(c =>
        c.position.toLowerCase().includes('guru') && !c.position.toLowerCase().includes('juruaudit')
      );
    }
    if (committeeFilter === 'waris') {
      return localCommittee.filter(c =>
        (c.position.toLowerCase().includes('waris') || c.category === 'ibu_bapa') &&
        !c.position.toLowerCase().includes('juruaudit')
      );
    }
    if (committeeFilter === 'audit') {
      return localCommittee.filter(c => c.position.toLowerCase().includes('juruaudit'));
    }
    return localCommittee;
  }, [localCommittee, committeeFilter]);

  // Designated officials
  const penasihat = localCommittee.find(c => c.position.toLowerCase().includes('penasihat')) || {
    name: 'Pn. Norhafiza binti Dolah',
    position: 'Penasihat (Guru Besar)'
  };
  const ydp = localCommittee.find(c => c.position.toLowerCase().includes('yang dipertua') && !c.position.toLowerCase().includes('naib')) || {
    name: 'En. Asmadi bin Musa',
    position: 'Yang Dipertua (YDP) PIBG'
  };
  const nydp = localCommittee.find(c => c.position.toLowerCase().includes('naib yang dipertua')) || {
    name: 'En. Jamaludin bin Ismail',
    position: 'Naib Yang Dipertua (NYDP) PIBG'
  };
  const setiausaha = localCommittee.find(c => c.position.toLowerCase().includes('setiausaha')) || {
    name: 'En. Mohamad Aizat bin Ahmad Sofi',
    position: 'Setiausaha PIBG'
  };
  const bendahari = localCommittee.find(c => c.position.toLowerCase().includes('bendahari')) || {
    name: 'Pn. Nor Zamizi bt Sulong',
    position: 'Bendahari PIBG'
  };

  const ajkGuruList = localCommittee.filter(c =>
    c.position.toLowerCase().includes('ahli jawatankuasa (guru)')
  );
  const ajkWarisList = localCommittee.filter(c =>
    c.position.toLowerCase().includes('ahli jawatankuasa (waris)')
  );
  const juruauditList = localCommittee.filter(c =>
    c.position.toLowerCase().includes('juruaudit')
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-12 print:p-0 print:m-0">
      {/* =========================================================================
          HERO BANNER: PORTAL RASMI PIBG SK MERBAU PULAS (SESI 2026/2027)
         ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 border-2 border-yellow-400/40 shadow-2xl p-6 sm:p-8 text-white">
        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sesi Persekolahan 2026/2027 • KBA5012</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3 flex-wrap">
              <span>Persatuan Ibu Bapa & Guru (PIBG)</span>
            </h2>
            <p className="text-base sm:text-lg text-blue-200 font-semibold leading-relaxed">
              Sekolah Kebangsaan Merbau Pulas, 09300 Kuala Ketil, Kedah Darul Aman
            </p>
            <p className="text-xs sm:text-sm text-slate-300 italic border-l-2 border-yellow-400 pl-3">
              "{pibgVisionMission.visi}"
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('usul')}
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-yellow-400/20 transition active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>Hantar E-Usul Waris</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dana')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95 cursor-pointer border border-emerald-400/40"
            >
              <CreditCard className="w-4 h-4" />
              <span>Salur Sumbangan / Tabung</span>
            </button>
            <button
              type="button"
              onClick={handlePrintCommittee}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-2 transition border border-white/20 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-300" />
              <span>Cetak Carta PIBG</span>
            </button>
          </div>
        </div>

        {/* ACCESS / PERMISSION STATUS BANNER */}
        <div className="mt-6 pt-4 border-t border-white/10">
          {canEdit ? (
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-amber-100 text-xs sm:text-sm">Akses Editor Laman PIBG Aktif</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                      {userRole === 'su_pibg' ? 'Setiausaha PIBG (SUPIBG)' : userRole === 'guru_besar' ? 'Guru Besar (Penasihat)' : 'Pentadbir'}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 mt-0.5">
                    Anda dibenarkan mengedit jawatankuasa, takwim program, maklum balas usul waris, dan dokumen rasmi PIBG.
                  </p>
                </div>
              </div>
            </div>
          ) : isTeacher ? (
            <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-400/20 text-blue-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>
                  <strong>Mod Paparan Guru:</strong> Anda mempunyai akses rujukan penuh. Mengikut ketetapan sekolah, hanya <strong>S/U PIBG (ID: SUPIBG)</strong> dan <strong>Pentadbir</strong> dibenarkan mengedit kandungan laman PIBG.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10 text-slate-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Pengeditan portal PIBG hanya dibenarkan untuk <strong>S/U PIBG</strong> dan <strong>Pentadbir</strong>.</span>
              </div>
              {onOpenLogin && (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="px-3 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 rounded-lg text-xs font-bold transition cursor-pointer self-end sm:self-auto"
                >
                  Log Masuk S/U PIBG
                </button>
              )}
            </div>
          )}
        </div>

        {/* SUB-MENU TABS PIBG PORTAL */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('carta')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'carta'
                ? 'bg-yellow-400 text-slate-950 shadow-md border border-yellow-300'
                : 'bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Carta Organisasi 2026/2027</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('takwim')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'takwim'
                ? 'bg-yellow-400 text-slate-950 shadow-md border border-yellow-300'
                : 'bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Takwim & Aktiviti</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dana')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'dana'
                ? 'bg-yellow-400 text-slate-950 shadow-md border border-yellow-300'
                : 'bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Tabung & Sumbangan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('usul')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'usul'
                ? 'bg-yellow-400 text-slate-950 shadow-md border border-yellow-300'
                : 'bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>E-Usul & Cadangan Waris</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-yellow-300 font-black">
              {usulList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dokumen')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'dokumen'
                ? 'bg-yellow-400 text-slate-950 shadow-md border border-yellow-300'
                : 'bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Pusat Muat Turun</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ksib')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'ksib'
                ? 'bg-yellow-400 text-slate-950 shadow-md border border-yellow-300'
                : 'bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Sarana & KSIB</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: CARTA ORGANISASI PIBG SESI 2026/2027 (SESUAI GAMBAR PENGGUNA)
         ========================================================================= */}
      {activeTab === 'carta' && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-yellow-400" />
                <span>Carta Organisasi Jawatankuasa PIBG SKMP (Sesi 2026/2027)</span>
              </h3>
              <p className="text-xs text-slate-300">
                Senarai barisan kepimpinan rasmi Persatuan Ibu Bapa dan Guru SK Merbau Pulas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Toggle Hierarchy vs Table view */}
              <div className="p-1 bg-slate-800 rounded-xl border border-white/10 flex items-center text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setChartViewMode('hierarchy')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    chartViewMode === 'hierarchy'
                      ? 'bg-yellow-400 text-slate-950 font-black shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Carta Visual
                </button>
                <button
                  type="button"
                  onClick={() => setChartViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    chartViewMode === 'table'
                      ? 'bg-yellow-400 text-slate-950 font-black shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Format Jadual KPM
                </button>
              </div>

              {/* Salin Senarai Button */}
              <button
                type="button"
                onClick={handleCopyCommitteeText}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/15 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                title="Salin teks senarai jawatankuasa untuk dokumen rasmi"
              >
                {copiedList ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Telah Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-blue-300" />
                    <span>Salin Senarai</span>
                  </>
                )}
              </button>

              {/* Cetak Button */}
              <button
                type="button"
                onClick={handlePrintCommittee}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak</span>
              </button>

              {/* Editor Buttons for SU PIBG & Admin */}
              {canEdit && (
                <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMember(null);
                      setIsNewMember(true);
                      setEditMemberModalOpen(true);
                    }}
                    className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Ahli</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Tetapkan semula senarai jawatankuasa PIBG ke senarai rasmi asal sesi 2026/2027?')) {
                        handleSaveLocalCommittee(initialPibgCommittee);
                      }
                    }}
                    className="p-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                    title="Set Semula Senarai Asal"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Filter Pills for Committee */}
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Tapis:
            </span>
            {[
              { id: 'semua', label: 'Semua Jawatankuasa' },
              { id: 'utama', label: 'Pegawai Utama' },
              { id: 'guru', label: 'AJK Guru' },
              { id: 'waris', label: 'AJK Waris' },
              { id: 'audit', label: 'Juruaudit' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setCommitteeFilter(f.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  committeeFilter === f.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* VIEW MODE 1: HIERARCHY TREE DIAGRAM (INTERAKTIF & ELEGAN) */}
          {chartViewMode === 'hierarchy' && (
            <div className="space-y-6">
              {/* 1. PENASIHAT CARD (Top Level) */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border-2 border-amber-400/70 p-5 rounded-2xl shadow-xl text-center relative overflow-hidden backdrop-blur-md">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMember(penasihat as PibgCommittee);
                        setIsNewMember(false);
                        setEditMemberModalOpen(true);
                      }}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-200 hover:text-slate-950 transition cursor-pointer"
                      title="Edit Maklumat Penasihat"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="inline-block px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase mb-2">
                    Penasihat PIBG
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-white tracking-wide">
                    {penasihat.name}
                  </h4>
                  <p className="text-xs text-amber-200 font-semibold mt-0.5">
                    Guru Besar SK Merbau Pulas
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-300">
                    <span className="px-2 py-0.5 bg-slate-900/60 rounded border border-white/10">
                      Pentadbir Sekolah
                    </span>
                    <span className="px-2 py-0.5 bg-slate-900/60 rounded border border-white/10">
                      Ex-Officio
                    </span>
                  </div>
                </div>
                {/* Connecting Line */}
                <div className="w-0.5 h-6 bg-gradient-to-b from-amber-400 to-blue-400" />
              </div>

              {/* 2. YANG DIPERTUA (YDP) */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-lg bg-gradient-to-r from-blue-900/70 via-indigo-900/80 to-blue-900/70 border-2 border-blue-400/80 p-5 rounded-2xl shadow-xl text-center relative backdrop-blur-md">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMember(ydp as PibgCommittee);
                        setIsNewMember(false);
                        setEditMemberModalOpen(true);
                      }}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500 text-blue-200 hover:text-white transition cursor-pointer"
                      title="Edit Maklumat YDP"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="inline-block px-3 py-0.5 rounded-full bg-blue-500 text-white font-black text-[10px] tracking-wider uppercase mb-2">
                    Yang Dipertua (YDP)
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-yellow-300 tracking-wide">
                    {ydp.name}
                  </h4>
                  <p className="text-xs text-blue-200 font-semibold mt-0.5">
                    Ketua Barisan Jawatankuasa Ibu Bapa & Guru SKMP
                  </p>
                  <div className="mt-2 text-[11px] text-slate-300 flex items-center justify-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-900/60 rounded text-blue-200 border border-blue-400/20">
                      Wakil Ibu Bapa / Waris
                    </span>
                  </div>
                </div>
                {/* Connecting Line */}
                <div className="w-0.5 h-6 bg-blue-400" />
              </div>

              {/* 3. NAIB YANG DIPERTUA (NYDP) */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-md bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-2 border-indigo-400/60 p-4 rounded-2xl shadow-lg text-center relative backdrop-blur-md">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMember(nydp as PibgCommittee);
                        setIsNewMember(false);
                        setEditMemberModalOpen(true);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500 text-indigo-200 hover:text-white transition cursor-pointer"
                      title="Edit Maklumat NYDP"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="inline-block px-3 py-0.5 rounded-full bg-indigo-600 text-white font-black text-[10px] tracking-wider uppercase mb-1.5">
                    Naib Yang Dipertua (NYDP)
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-white">
                    {nydp.name}
                  </h4>
                  <p className="text-xs text-indigo-200 font-medium">
                    Wakil Ibu Bapa / Waris
                  </p>
                </div>
                {/* Connecting Line Split */}
                <div className="w-0.5 h-6 bg-indigo-400" />
              </div>

              {/* 4. SETIAUSAHA & BENDAHARI (DUAL CARDS) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* Setiausaha */}
                <div className="bg-slate-900/90 border-2 border-emerald-400/50 p-4 rounded-2xl shadow-md text-center relative backdrop-blur-md">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMember(setiausaha as PibgCommittee);
                        setIsNewMember(false);
                        setEditMemberModalOpen(true);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-200 hover:text-white transition cursor-pointer"
                      title="Edit Maklumat Setiausaha"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] tracking-wider uppercase mb-1.5">
                    Setiausaha PIBG
                  </span>
                  <h4 className="text-base font-black text-white">
                    {setiausaha.name}
                  </h4>
                  <p className="text-xs text-emerald-300 font-medium">
                    Guru SK Merbau Pulas
                  </p>
                </div>

                {/* Bendahari */}
                <div className="bg-slate-900/90 border-2 border-teal-400/50 p-4 rounded-2xl shadow-md text-center relative backdrop-blur-md">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMember(bendahari as PibgCommittee);
                        setIsNewMember(false);
                        setEditMemberModalOpen(true);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500 text-teal-200 hover:text-white transition cursor-pointer"
                      title="Edit Maklumat Bendahari"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-teal-600 text-white font-black text-[10px] tracking-wider uppercase mb-1.5">
                    Bendahari PIBG
                  </span>
                  <h4 className="text-base font-black text-white">
                    {bendahari.name}
                  </h4>
                  <p className="text-xs text-teal-300 font-medium">
                    Guru SK Merbau Pulas
                  </p>
                </div>
              </div>

              {/* 5. AJK GURU, AJK WARIS & JURUAUDIT (TWO-COLUMN SECTIONS) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                {/* BIRO GURU (4 ORANG) */}
                <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-black">
                        G
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">
                          Ahli Jawatankuasa (Guru)
                        </h4>
                        <p className="text-[11px] text-blue-200">
                          Tenaga Pengajar SK Merbau Pulas (4 Orang)
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black">
                      4 Ahli
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {ajkGuruList.map((g, idx) => (
                      <div
                        key={g.id || idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-white/5 hover:border-blue-400/40 transition gap-2"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center text-xs font-black shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{g.name}</p>
                            <p className="text-[11px] text-slate-400">{g.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-500/30">
                            Guru SKMP
                          </span>
                          {canEdit && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMember(g);
                                  setIsNewMember(false);
                                  setEditMemberModalOpen(true);
                                }}
                                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                                title="Edit Ahli"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Padam "${g.name}" daripada senarai jawatankuasa?`)) {
                                    handleDeleteMember(g.id);
                                  }
                                }}
                                className="p-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition cursor-pointer"
                                title="Padam Ahli"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BIRO WARIS (4 ORANG) */}
                <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-black">
                        W
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">
                          Ahli Jawatankuasa (Waris)
                        </h4>
                        <p className="text-[11px] text-amber-200">
                          Wakil Ibu Bapa & Komuniti SKMP ({ajkWarisList.length} Orang)
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black">
                      {ajkWarisList.length} Ahli
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {ajkWarisList.map((w, idx) => (
                      <div
                        key={w.id || idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-white/5 hover:border-amber-400/40 transition gap-2"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-amber-600/30 text-amber-300 flex items-center justify-center text-xs font-black shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{w.name}</p>
                            <p className="text-[11px] text-slate-400">{w.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/30">
                            Waris / Penjaga
                          </span>
                          {canEdit && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMember(w);
                                  setIsNewMember(false);
                                  setEditMemberModalOpen(true);
                                }}
                                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                                title="Edit Ahli"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Padam "${w.name}" daripada senarai jawatankuasa?`)) {
                                    handleDeleteMember(w.id);
                                  }
                                }}
                                className="p-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition cursor-pointer"
                                title="Padam Ahli"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 6. JURUAUDIT (GURU & WARIS) */}
              <div className="bg-slate-900/80 border border-purple-500/30 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">
                        Juruaudit Beraudit PIBG (Sesi 2026/2027)
                      </h4>
                      <p className="text-[11px] text-purple-200">
                        Memeriksa & Mengesahkan Penyata Kewangan serta Aliran Tunai PIBG
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black">
                    {juruauditList.length} Juruaudit
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {juruauditList.map((ja, idx) => (
                    <div
                      key={ja.id || idx}
                      className="p-3.5 rounded-xl bg-slate-800/90 border border-purple-400/30 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="inline-block px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-bold border border-purple-500/30 mb-1">
                          {ja.position}
                        </span>
                        <h5 className="text-sm font-bold text-white truncate">{ja.name}</h5>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {canEdit && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMember(ja);
                                setIsNewMember(false);
                                setEditMemberModalOpen(true);
                              }}
                              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                              title="Edit Juruaudit"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Padam "${ja.name}" daripada senarai juruaudit?`)) {
                                handleDeleteMember(ja.id);
                                }
                              }}
                              className="p-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition cursor-pointer"
                              title="Padam Juruaudit"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: TABLE VIEW (SEPERTI DALAM GAMBAR LAMPIRAN PENGGUNA) */}
          {chartViewMode === 'table' && (
            <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-2xl border-4 border-slate-300 overflow-x-auto print:shadow-none print:border-none print:p-0">
              <div className="text-center pb-6 border-b-2 border-slate-800 mb-6">
                <h3 className="text-base sm:text-xl font-black uppercase tracking-wider text-slate-900">
                  SENARAI JAWATANKUASA PERSATUAN IBU BAPA DAN GURU (PIBG)
                </h3>
                <h4 className="text-sm sm:text-lg font-black uppercase text-slate-800">
                  SEKOLAH KEBANGSAAN MERBAU PULAS
                </h4>
                <p className="text-xs sm:text-sm font-bold text-slate-700 tracking-wider">
                  SESI 2026/2027
                </p>
              </div>

              <table className="w-full border-collapse border-2 border-slate-900 text-xs sm:text-sm">
                <tbody>
                  {/* PENASIHAT */}
                  <tr className="border-b-2 border-slate-900 hover:bg-slate-50">
                    <td className="p-3 font-black uppercase border-r-2 border-slate-900 w-1/3 bg-slate-100">
                      PENASIHAT
                    </td>
                    <td className="p-3 font-bold border-r-2 border-slate-900 w-8 text-center bg-slate-100">
                      :
                    </td>
                    <td className="p-3 font-extrabold uppercase text-slate-900">
                      {penasihat.name}
                    </td>
                  </tr>

                  {/* YANG DIPERTUA */}
                  <tr className="border-b-2 border-slate-900 hover:bg-slate-50">
                    <td className="p-3 font-black uppercase border-r-2 border-slate-900 bg-slate-100">
                      YANG DIPERTUA
                    </td>
                    <td className="p-3 font-bold border-r-2 border-slate-900 text-center bg-slate-100">
                      :
                    </td>
                    <td className="p-3 font-extrabold uppercase text-slate-900">
                      {ydp.name}
                    </td>
                  </tr>

                  {/* NAIB YANG DIPERTUA */}
                  <tr className="border-b-2 border-slate-900 hover:bg-slate-50">
                    <td className="p-3 font-black uppercase border-r-2 border-slate-900 bg-slate-100">
                      NAIB YANG DIPERTUA
                    </td>
                    <td className="p-3 font-bold border-r-2 border-slate-900 text-center bg-slate-100">
                      :
                    </td>
                    <td className="p-3 font-extrabold uppercase text-slate-900">
                      {nydp.name}
                    </td>
                  </tr>

                  {/* SETIAUSAHA */}
                  <tr className="border-b-2 border-slate-900 hover:bg-slate-50">
                    <td className="p-3 font-black uppercase border-r-2 border-slate-900 bg-slate-100">
                      SETIAUSAHA
                    </td>
                    <td className="p-3 font-bold border-r-2 border-slate-900 text-center bg-slate-100">
                      :
                    </td>
                    <td className="p-3 font-extrabold uppercase text-slate-900">
                      {setiausaha.name}
                    </td>
                  </tr>

                  {/* BENDAHARI */}
                  <tr className="border-b-2 border-slate-900 hover:bg-slate-50">
                    <td className="p-3 font-black uppercase border-r-2 border-slate-900 bg-slate-100">
                      BENDAHARI
                    </td>
                    <td className="p-3 font-bold border-r-2 border-slate-900 text-center bg-slate-100">
                      :
                    </td>
                    <td className="p-3 font-extrabold uppercase text-slate-900">
                      {bendahari.name}
                    </td>
                  </tr>

                  {/* AHLI JAWATANKUASA (GURU) */}
                  <tr className="border-b-2 border-slate-900 hover:bg-slate-50">
                    <td className="p-3 font-black uppercase border-r-2 border-slate-900 align-top bg-slate-100">
                      AHLI JAWATANKUASA (GURU)
                    </td>
                    <td className="p-3 font-bold border-r-2 border-slate-900 text-center align-top bg-slate-100">
                      :
                    </td>
                    <td className="p-3 space-y-1.5 font-extrabold uppercase text-slate-900">
                      {ajkGuruList.map((g, i) => (
                        <div key={i} className="py-0.5">
                          {g.name}
                        </div>
                      ))}
                    </td>
                  </tr>

                  {/* AHLI JAWATANKUASA (WARIS) */}
                  <tr className="border-b-2 border-slate-900 hover:bg-slate-50">
                    <td className="p-3 font-black uppercase border-r-2 border-slate-900 align-top bg-slate-100">
                      AHLI JAWATANKUASA (WARIS)
                    </td>
                    <td className="p-3 font-bold border-r-2 border-slate-900 text-center align-top bg-slate-100">
                      :
                    </td>
                    <td className="p-3 space-y-1.5 font-extrabold uppercase text-slate-900">
                      {ajkWarisList.map((w, i) => (
                        <div key={i} className="py-0.5">
                          {w.name}
                        </div>
                      ))}
                    </td>
                  </tr>

                  {/* JURUAUDIT (GURU) */}
                  <tr className="border-b-2 border-slate-900 hover:bg-slate-50">
                    <td className="p-3 font-black uppercase border-r-2 border-slate-900 bg-slate-100">
                      JURUAUDIT (GURU)
                    </td>
                    <td className="p-3 font-bold border-r-2 border-slate-900 text-center bg-slate-100">
                      :
                    </td>
                    <td className="p-3 font-extrabold uppercase text-slate-900">
                      {juruauditList.find(j => j.position.toLowerCase().includes('guru'))?.name || 'PN. ROHAIDAH BT ABU BAKAR'}
                    </td>
                  </tr>

                  {/* JURUAUDIT (WARIS) */}
                  <tr className="border-b-2 border-slate-900 hover:bg-slate-50">
                    <td className="p-3 font-black uppercase border-r-2 border-slate-900 bg-slate-100">
                      JURUAUDIT (WARIS)
                    </td>
                    <td className="p-3 font-bold border-r-2 border-slate-900 text-center bg-slate-100">
                      :
                    </td>
                    <td className="p-3 font-extrabold uppercase text-slate-900">
                      {juruauditList.find(j => j.position.toLowerCase().includes('waris'))?.name || 'PN. SHARIFATUL NUR AMIRA BINTI ANUOR'}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4 pt-3 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600">
                <span>Disahkan dan diedarkan rasmi oleh PIBG SK Merbau Pulas</span>
                <span>Tarikh Kemaskini: Sesi 2026/2027</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: TAKWIM & AKTIVITI PIBG 2026/2027
         ========================================================================= */}
      {activeTab === 'takwim' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-400" />
                <span>Papan Takwim, Aktiviti & Sumbangan PIBG</span>
              </h3>
              <p className="text-xs text-slate-300">
                Inisiatif, program bersama dan projek sumbangan pembangunan untuk murid dan sekolah sepanjang sesi 2026/2027.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="px-2.5 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                {activities.length} Program Berimpak
              </span>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingActivity(null);
                    setIsNewActivity(true);
                    setEditActivityModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Aktiviti</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((act) => (
              <div
                key={act.id}
                className="bg-slate-900/85 border border-white/10 rounded-2xl p-5 hover:border-yellow-400/40 transition shadow-lg space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      act.type === 'mesyuarat'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                        : act.type === 'sumbangan'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                    }`}
                  >
                    {act.type}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-yellow-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {act.date}
                    </span>
                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingActivity(act);
                            setIsNewActivity(false);
                            setEditActivityModalOpen(true);
                          }}
                          className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
                          title="Edit Aktiviti"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Padam aktiviti "${act.title}"?`)) {
                              handleDeleteActivity(act.id);
                            }
                          }}
                          className="p-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition cursor-pointer"
                          title="Padam Aktiviti"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h4 className="text-base font-black text-white leading-snug">
                  {act.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {act.description}
                </p>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    {act.organizer}
                  </span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Berjaya Dilaksana
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: TABUNG & SALURAN SUMBANGAN RASMI PIBG
         ========================================================================= */}
      {activeTab === 'dana' && (
        <div className="space-y-6">
          {/* Main Banking Card */}
          <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Akaun Rasmi PIBG SK Merbau Pulas</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Saluran Sumbangan & Tabung Pembangunan
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Setiap sumbangan ikhlas daripada pihak tuan/puan disalurkan terus ke akaun rasmi PIBG yang beraudit bagi membiayai kemudahan pembelajaran murid, pembaikan kelas, kebajikan murid asnaf, dan program kecemerlangan sekolah.
                </p>

                {/* Bank details grid */}
                <div className="pt-2 space-y-2 text-xs sm:text-sm">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] text-emerald-300 font-bold">Nama Bank:</p>
                      <p className="font-extrabold text-white">{pibgBankingDetails.bankName}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-emerald-300 font-bold">Cawangan:</p>
                      <p className="font-semibold text-slate-200">{pibgBankingDetails.branch}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/90 border-2 border-yellow-400/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-yellow-300 font-bold">Nombor Akaun Rasmi:</p>
                      <p className="text-xl sm:text-2xl font-black text-yellow-300 font-mono tracking-wider">
                        {pibgBankingDetails.accountNumber}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {pibgBankingDetails.accountName}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyBankAccount}
                      className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-md"
                    >
                      {copiedBank ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Nombor Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Salin No. Akaun</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* DuitNow QR Box */}
              <div className="bg-white text-slate-950 p-5 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center max-w-[260px] mx-auto lg:mx-0 shrink-0 border-4 border-emerald-400">
                <p className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
                  Imbas Kod DuitNow QR
                </p>
                <div className="w-44 h-44 bg-slate-100 rounded-xl p-2 flex items-center justify-center border border-slate-300 shadow-inner">
                  <img
                    src={pibgBankingDetails.duitNowQrUrl}
                    alt="Kod DuitNow QR PIBG SK Merbau Pulas"
                    className="w-full h-full object-contain rounded"
                  />
                </div>
                <p className="text-[11px] text-slate-600 font-semibold mt-2">
                  Terima semua e-dompet & perbankan atas talian
                </p>
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="mt-2 text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Besarkan Kod QR
                </button>
              </div>
            </div>
          </div>

          {/* Form Pengesahan Resit Sumbangan (Untuk rekod bendahari) */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-yellow-400" />
                <span>Borang Pemberitahuan Sumbangan / Pengesahan Resit</span>
              </h4>
              <p className="text-xs text-slate-300">
                Waris atau penderma boleh mengisi maklumat sumbangan di sini untuk memudahkan pihak Bendahari PIBG ({pibgBankingDetails.treasurerName}) mengeluarkan Resit Rasmi.
              </p>
            </div>

            {donationFormSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Terima kasih! Maklumat sumbangan telah berjaya direkodkan. Bendahari PIBG akan menyemak dan mengeluarkan resit rasmi.</span>
              </div>
            )}

            <form onSubmit={handleSubmitDonation} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nama Penuh Penyumbang / Waris *
                </label>
                <input
                  type="text"
                  required
                  value={donationFormData.donorName}
                  onChange={(e) => setDonationFormData({ ...donationFormData, donorName: e.target.value })}
                  placeholder="Contoh: En. Ahmad bin Razak"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nombor Telefon (WhatsApp)
                </label>
                <input
                  type="text"
                  value={donationFormData.phone}
                  onChange={(e) => setDonationFormData({ ...donationFormData, phone: e.target.value })}
                  placeholder="012-3456789"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Jumlah Sumbangan (RM) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={donationFormData.amount}
                  onChange={(e) => setDonationFormData({ ...donationFormData, amount: e.target.value })}
                  placeholder="Contoh: 50.00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tujuan / Pilihan Tabung
                </label>
                <select
                  value={donationFormData.purpose}
                  onChange={(e) => setDonationFormData({ ...donationFormData, purpose: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-yellow-400"
                >
                  <option value="Tabung Pembangunan ICT & Kemudahan">Tabung Pembangunan ICT & Kemudahan</option>
                  <option value="Tabung Kebajikan Murid Yatim & Asnaf">Tabung Kebajikan Murid Yatim & Asnaf</option>
                  <option value="Tabung Kecemerlangan Akademik & Sukan">Tabung Kecemerlangan Akademik & Sukan</option>
                  <option value="Sumbangan Am PIBG Sesi 2026/2027">Sumbangan Am PIBG Sesi 2026/2027</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nombor Rujukan Transaksi / Tarikh Pindahan
                </label>
                <input
                  type="text"
                  value={donationFormData.refNo}
                  onChange={(e) => setDonationFormData({ ...donationFormData, refNo: e.target.value })}
                  placeholder="Contoh: BIMB Ref: 981240129 / 11 Sept 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Hantar Pengesahan Sumbangan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: E-USUL & SUARA WARIS (PETI CADANGAN DIGITAL)
         ========================================================================= */}
      {activeTab === 'usul' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-yellow-400" />
                <span>E-Usul & Peti Cadangan Waris PIBG SKMP</span>
              </h3>
              <p className="text-xs text-slate-300">
                Saluran rasmi ibu bapa dan penjaga mengemukakan usul penambahbaikan, cadangan kebajikan, dan idea konstruktif untuk dibentangkan kepada Jawatankuasa PIBG dan Pentadbir Sekolah.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSubmittingUsul(!isSubmittingUsul)}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-md transition active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmittingUsul ? 'Tutup Borang' : 'Tulis Usul Baharu'}</span>
            </button>
          </div>

          {/* Form Hantar Usul */}
          {isSubmittingUsul && (
            <div className="bg-slate-900/90 border-2 border-yellow-400/50 rounded-2xl p-6 shadow-2xl space-y-4 animate-fadeIn">
              <div className="border-b border-white/10 pb-3">
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-yellow-400" />
                  <span>Borang Pengemukaan E-Usul Waris Sesi 2026/2027</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Sila pastikan usul dinyatakan dengan jelas, berhemah dan membina demi kepentingan murid dan warga SK Merbau Pulas.
                </p>
              </div>

              {usulFormSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Alhamdulillah, usul anda telah berjaya dihantar dan direkodkan! Jawatankuasa PIBG akan meneliti usul ini.</span>
                </div>
              )}

              <form onSubmit={handleSubmitUsul} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nama Waris / Penjaga *
                  </label>
                  <input
                    type="text"
                    required
                    value={usulFormData.parentName}
                    onChange={(e) => setUsulFormData({ ...usulFormData, parentName: e.target.value })}
                    placeholder="Nama penuh ibu bapa / penjaga"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nombor Telefon Waris *
                  </label>
                  <input
                    type="text"
                    required
                    value={usulFormData.phone}
                    onChange={(e) => setUsulFormData({ ...usulFormData, phone: e.target.value })}
                    placeholder="Contoh: 013-4567890"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nama Anak / Murid
                  </label>
                  <input
                    type="text"
                    value={usulFormData.studentName}
                    onChange={(e) => setUsulFormData({ ...usulFormData, studentName: e.target.value })}
                    placeholder="Nama anak yang bersekolah di SKMP"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tahun / Kelas Anak
                  </label>
                  <select
                    value={usulFormData.studentClass}
                    onChange={(e) => setUsulFormData({ ...usulFormData, studentClass: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-yellow-400"
                  >
                    <option value="Prasekolah">Prasekolah</option>
                    <option value="Tahun 1">Tahun 1</option>
                    <option value="Tahun 2">Tahun 2</option>
                    <option value="Tahun 3">Tahun 3</option>
                    <option value="Tahun 4">Tahun 4</option>
                    <option value="Tahun 5">Tahun 5</option>
                    <option value="Tahun 6">Tahun 6</option>
                    <option value="Pendidikan Khas / Lain-lain">Pendidikan Khas / Lain-lain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Kategori Usul *
                  </label>
                  <select
                    value={usulFormData.category}
                    onChange={(e) => setUsulFormData({ ...usulFormData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-yellow-400"
                  >
                    <option value="prasarana">Prasarana & Kemudahan Sekolah</option>
                    <option value="keselamatan">Keselamatan & Trafik Murid</option>
                    <option value="akademik">Akademik & Pengajaran (PdP)</option>
                    <option value="kebajikan">Kebajikan & Murid Asnaf</option>
                    <option value="kokurikulum">Kokurikulum, Sukan & Ko-Akademik</option>
                    <option value="lain">Lain-lain Usul Membina</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tajuk Ringkas Usul *
                  </label>
                  <input
                    type="text"
                    required
                    value={usulFormData.title}
                    onChange={(e) => setUsulFormData({ ...usulFormData, title: e.target.value })}
                    placeholder="Contoh: Cadangan Pemasangan Kipas Tambahan di Dewan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Perincian Usul & Cadangan Penyelesaian *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={usulFormData.description}
                    onChange={(e) => setUsulFormData({ ...usulFormData, description: e.target.value })}
                    placeholder="Nyatakan latar belakang isu dan cadangan konkrit tindakan yang boleh dipertimbangkan..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSubmittingUsul(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Hantar Usul Sekarang</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Senarai Usul Terkini */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Senarai Usul & Maklum Balas Terkini ({usulList.length})</span>
            </h4>

            <div className="grid grid-cols-1 gap-3">
              {usulList.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/85 border border-white/10 rounded-2xl p-5 space-y-3 hover:border-white/20 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase border border-blue-500/30">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        Dikemukakan oleh: <strong className="text-slate-200">{item.parentName}</strong> ({item.studentClass})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                          item.status === 'diluluskan'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                            : item.status === 'pertimbangan'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                            : item.status === 'selesai'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                        }`}
                      >
                        Status: {item.status}
                      </span>

                      {canEdit && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUsul(item);
                              setEditUsulModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400 text-amber-200 hover:text-slate-950 border border-amber-400/40 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Tindakan / Respon</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Padam usul "${item.title}"?`)) {
                                handleDeleteUsul(item.id);
                              }
                            }}
                            className="p-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition cursor-pointer"
                            title="Padam Usul"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h5 className="text-base font-black text-white leading-snug">
                    {item.title}
                  </h5>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-white/5">
                    "{item.description}"
                  </p>

                  {item.adminFeedback && (
                    <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-400/20 text-xs text-blue-200 space-y-1">
                      <p className="font-bold text-blue-300 flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Tindakan / Maklum Balas Jawatankuasa PIBG:
                      </p>
                      <p className="text-slate-300">{item.adminFeedback}</p>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                    <span>Masa Diterima: {item.submittedAt}</span>
                    <span>Peti E-Usul Rasmi SKMP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: PUSAT MUAT TURUN DOKUMEN PIBG
         ========================================================================= */}
      {activeTab === 'dokumen' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-yellow-400" />
                <span>Pusat Dokumen, Minit Mesyuarat & Pekeliling PIBG</span>
              </h3>
              <p className="text-xs text-slate-300">
                Akses muat turun dokumen rasmi, buku program mesyuarat agung tahunan, dan pekeliling KPM berkaitan PIBG.
              </p>
            </div>
            {canEdit && (
              <button
                type="button"
                onClick={() => setEditDocModalOpen(true)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow transition active:scale-95 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Dokumen</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-900/85 border border-white/10 rounded-2xl p-5 hover:border-yellow-400/40 transition shadow-lg flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase border border-blue-400/30">
                      {doc.category} • {doc.fileType}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Kemaskini: {doc.updatedDate}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-white leading-snug">
                    {doc.title}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold">
                    Saiz: {doc.fileSize}
                  </span>

                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Padam dokumen "${doc.title}"?`)) {
                            handleDeleteDoc(doc.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition cursor-pointer"
                        title="Padam Dokumen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        alert(`Memuat turun fail rasmi: ${doc.title}`);
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Muat Turun</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: SARANA IBU BAPA & SUKARELAWAN KSIB
         ========================================================================= */}
      {activeTab === 'ksib' && (
        <div className="space-y-6">
          {/* Header Info Sarana */}
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-2 border-purple-500/40 rounded-3xl p-6 sm:p-8 text-white space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-black">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Inisiatif Sarana Ibu Bapa & Komuniti KPM</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Kumpulan Sokongan Ibu Bapa (KSIB) SK Merbau Pulas
            </h3>
            <p className="text-xs sm:text-sm text-purple-100 leading-relaxed max-w-3xl">
              KSIB merupakan wadah sokongan komuniti ibu bapa untuk menyumbangkan kepakaran, masa, dan tenaga dalam melengkapkan usaha guru mendidik anak-anak. Tiada sumbangan yang terlalu kecil — setiap kepakaran anda amat dihargai!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {ksibSkillAreas.map((area) => (
                <div
                  key={area.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-purple-400/20 space-y-1.5"
                >
                  <h4 className="text-xs font-black text-yellow-300 uppercase tracking-wide">
                    {area.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {area.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Registration as Volunteer */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-purple-400" />
                <span>Pendaftaran Sukarelawan KSIB Sesi 2026/2027</span>
              </h4>
              <p className="text-xs text-slate-300">
                Ibu bapa yang berminat membantu aktiviti sekolah (seperti kawalan trafik, gotong-royong, klinik sukan, atau motivasi) dialu-alukan mengisi butiran di bawah.
              </p>
            </div>

            {ksibRegistered ? (
              <div className="p-4 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
                <span>Tahniah dan terima kasih! Pendaftaran anda sebagai Sukarelawan KSIB SK Merbau Pulas telah direkodkan. Setiausaha KSIB akan menghubungi anda apabila aktiviti bersesuaian dijalankan.</span>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!ksibFormData.name || !ksibFormData.phone) {
                    alert('Sila lengkapkan nama dan nombor telefon.');
                    return;
                  }
                  setKsibRegistered(true);
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nama Ibu Bapa / Penjaga *
                  </label>
                  <input
                    type="text"
                    required
                    value={ksibFormData.name}
                    onChange={(e) => setKsibFormData({ ...ksibFormData, name: e.target.value })}
                    placeholder="Nama penuh anda"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nombor Telefon (WhatsApp) *
                  </label>
                  <input
                    type="text"
                    required
                    value={ksibFormData.phone}
                    onChange={(e) => setKsibFormData({ ...ksibFormData, phone: e.target.value })}
                    placeholder="012-3456789"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Pekerjaan / Bidang Kepakaran
                  </label>
                  <input
                    type="text"
                    value={ksibFormData.job}
                    onChange={(e) => setKsibFormData({ ...ksibFormData, job: e.target.value })}
                    placeholder="Contoh: Jurutera Elektrik / Jurulatih Bola Sepak / Peniaga"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Bidang Minat Sukarela
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
                  >
                    <option>Kawalan Trafik Pagi / Petang</option>
                    <option>Gotong-royong & Pertukangan / Elektrik</option>
                    <option>Kejurulatihan Sukan & Seni Budaya</option>
                    <option>Perkongsian Motivasi & Kerjaya</option>
                    <option>Bantuan Program Khas / Kebajikan</option>
                  </select>
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>Daftar Sebagai Sukarelawan KSIB</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DUITNOW QR EXPANDED VIEW
         ========================================================================= */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-950 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h4 className="text-base font-black text-slate-900 uppercase tracking-wide">
              Kod DuitNow QR Rasmi PIBG
            </h4>
            <p className="text-xs text-slate-600">
              Sekolah Kebangsaan Merbau Pulas (BIMB: {pibgBankingDetails.accountNumber})
            </p>

            <div className="w-64 h-64 mx-auto p-3 bg-slate-50 border-2 border-emerald-500 rounded-2xl flex items-center justify-center shadow-inner">
              <img
                src={pibgBankingDetails.duitNowQrUrl}
                alt="Kod DuitNow QR PIBG SKMP"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-xs text-slate-500">
              Buka aplikasi Maybank, Bank Islam, CIMB, Touch 'n Go eWallet dll, kemudian imbas kod ini untuk menyalurkan sumbangan.
            </p>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS UNTUK PENGURUSAN PIBG (SU PIBG & ADMIN)
         ========================================================================= */}
      {/* 1. Modal Edit / Tambah Ahli Jawatankuasa */}
      <EditCommitteeModal
        isOpen={editMemberModalOpen}
        member={editingMember}
        isNew={isNewMember}
        onClose={() => {
          setEditMemberModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
      />

      {/* 2. Modal Edit / Tambah Aktiviti Takwim */}
      <EditActivityModal
        isOpen={editActivityModalOpen}
        activity={editingActivity}
        isNew={isNewActivity}
        onClose={() => {
          setEditActivityModalOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivity}
      />

      {/* 3. Modal Tindakan & Maklum Balas E-Usul */}
      <EditUsulFeedbackModal
        isOpen={editUsulModalOpen}
        usul={editingUsul}
        onClose={() => {
          setEditUsulModalOpen(false);
          setEditingUsul(null);
        }}
        onSave={handleUpdateUsulFeedback}
      />

      {/* 4. Modal Tambah Dokumen PIBG */}
      <EditDocumentModal
        isOpen={editDocModalOpen}
        onClose={() => setEditDocModalOpen(false)}
        onSave={handleSaveDoc}
      />
    </div>
  );
};
