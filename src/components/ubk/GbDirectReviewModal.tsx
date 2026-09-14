import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  X,
  AlertCircle,
  Clock,
  UserCheck,
  Calendar,
  Layers,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  Check,
  Building2,
  Search,
  Plus,
  FileText,
  Award,
  User,
  Filter
} from 'lucide-react';
import { UbkRphItem, UserRole } from '../../types';

export interface GbDirectReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  allItems?: UbkRphItem[];
  pendingItems?: UbkRphItem[];
  userRole: UserRole | null;
  isAdmin: boolean;
  onApproveItem: (
    id: string,
    status: 'disemak' | 'pembetulan',
    comment: string,
    reviewerName: string
  ) => void;
  onOpenLogin: () => void;
  onElevateToGuruBesar?: () => void;
  onNavigateToUbk?: () => void;
  onSaveNewRph?: (item: UbkRphItem) => void;
}

const QUICK_COMMENTS = [
  'Rancangan PdP / Perkhidmatan Harian disemak dan menepati piawaian Kurikulum / HEM / B&K KPM. Tahniah.',
  'Penyusunan aktiviti dan objektif pembelajaran tersusun kemas serta berimpak tinggi. Disahkan cemerlang.',
  'Langkah pelaksanaan dan bimbingan murid yang sangat mantap. Teruskan komitmen kecemerlangan SKMP.',
  'Disemak dan disahkan. Sila teruskan pemantauan berfokus bersama barisan pentadbir dan guru bertugas.'
];

export const GbDirectReviewModal: React.FC<GbDirectReviewModalProps> = ({
  isOpen,
  onClose,
  allItems = [],
  pendingItems = [],
  userRole,
  isAdmin,
  onApproveItem,
  onOpenLogin,
  onElevateToGuruBesar,
  onNavigateToUbk,
  onSaveNewRph
}) => {
  // Combine all items, prioritizing allItems if available, otherwise pendingItems
  const rawList = allItems.length > 0 ? allItems : pendingItems;

  const [activeTab, setActiveTab] = useState<'semua' | 'menunggu' | 'disemak'>('semua');
  const [roleFilter, setRoleFilter] = useState<string>('semua');
  const [weekFilter, setWeekFilter] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [status, setStatus] = useState<'disemak' | 'pembetulan'>('disemak');
  const [comment, setComment] = useState(QUICK_COMMENTS[0]);
  const [gbPassword, setGbPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLocallyAuthenticated, setIsLocallyAuthenticated] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form state for creating new e-RPH directly from modal
  const [newRphData, setNewRphData] = useState<Partial<UbkRphItem>>({
    week: 25,
    date: new Date().toISOString().split('T')[0],
    time: '08:30 PG - 09:30 PG',
    sessionType: 'Pengajaran & Pembelajaran (PdP)',
    focus: 'Pengurusan Kurikulum & PdP Berkesan',
    title: '',
    target: 'Tahun 6 Ibnu Khaldun',
    venue: 'Bilik Darjah / Makmal Komputer',
    objective: '',
    steps: ['Set Induksi (10 minit)', 'Aktiviti Pembelajaran Utama (20 minit)', 'Pengukuhan & Penutup (10 minit)'],
    teachingAids: 'Buku Teks, Lembaran Kerja, Projektor LCD',
    reflection: '',
    counselorName: 'Penolong Kanan Pentadbiran (PK 1)',
    authorRole: 'pk_kurikulum'
  });
  const [newStepsText, setNewStepsText] = useState(
    'Set Induksi (10 minit)\nAktiviti Pembelajaran Utama (20 minit)\nPengukuhan & Penutup (10 minit)'
  );

  // Determine if user has reviewer privileges
  const isPentadbir = Boolean(
    isAdmin ||
      userRole === 'admin' ||
      userRole === 'guru_besar' ||
      userRole === 'pk_hem' ||
      userRole === 'pk_kurikulum' ||
      userRole === 'pk_kokurikulum' ||
      isLocallyAuthenticated
  );

  const isGuruBesar = Boolean(
    isAdmin ||
      userRole === 'admin' ||
      userRole === 'guru_besar' ||
      isLocallyAuthenticated
  );

  // Filter items
  const filteredList = useMemo(() => {
    return rawList.filter((item) => {
      // Tab filter
      if (activeTab === 'menunggu' && item.status !== 'menunggu') return false;
      if (activeTab === 'disemak' && item.status !== 'disemak') return false;

      // Role filter
      if (roleFilter !== 'semua') {
        if (roleFilter === 'pk_kurikulum' && item.authorRole !== 'pk_kurikulum' && !item.counselorName.toLowerCase().includes('pentadbiran') && !item.counselorName.toLowerCase().includes('pk 1') && !item.counselorName.toLowerCase().includes('kurikulum')) return false;
        if (roleFilter === 'pk_hem' && item.authorRole !== 'pk_hem' && !item.counselorName.toLowerCase().includes('hem')) return false;
        if (roleFilter === 'pk_kokurikulum' && item.authorRole !== 'pk_kokurikulum' && !item.counselorName.toLowerCase().includes('koko') && !item.counselorName.toLowerCase().includes('kokurikulum')) return false;
        if (roleFilter === 'kaunselor' && item.authorRole !== 'kaunselor' && !item.counselorName.toLowerCase().includes('kaunseling') && !item.counselorName.toLowerCase().includes('ubk') && !item.counselorName.toLowerCase().includes('gbk')) return false;
      }

      // Week filter
      if (weekFilter !== 'semua' && String(item.week) !== weekFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title?.toLowerCase().includes(q);
        const inAuthor = item.counselorName?.toLowerCase().includes(q);
        const inTarget = item.target?.toLowerCase().includes(q);
        const inType = item.sessionType?.toLowerCase().includes(q);
        const inObj = item.objective?.toLowerCase().includes(q);
        if (!inTitle && !inAuthor && !inTarget && !inType && !inObj) return false;
      }

      return true;
    });
  }, [rawList, activeTab, roleFilter, weekFilter, searchQuery]);

  // Selected item
  const activeItem = useMemo(() => {
    if (selectedId) {
      const found = rawList.find((p) => p.id === selectedId);
      if (found) return found;
    }
    return filteredList[0] || rawList[0];
  }, [rawList, filteredList, selectedId]);

  if (!isOpen) return null;

  const handleInlineAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = gbPassword.trim().toUpperCase();
    if (clean === 'GB5012' || clean === 'ADMIN123' || clean === 'SKMP5012') {
      setIsLocallyAuthenticated(true);
      setAuthError('');
      if (onElevateToGuruBesar) {
        onElevateToGuruBesar();
      }
    } else {
      setAuthError('Katalaluan Guru Besar tidak tepat. Sila guna GB5012.');
    }
  };

  const handleApprove = () => {
    if (!activeItem) return;
    const reviewerTitle =
      userRole === 'guru_besar' || isLocallyAuthenticated
        ? 'Guru Besar SK Merbau Pulas'
        : userRole === 'pk_hem'
        ? 'Penolong Kanan HEM'
        : userRole === 'pk_kurikulum'
        ? 'Penolong Kanan Pentadbiran'
        : 'Pentadbir Sekolah';

    onApproveItem(activeItem.id, status, comment, reviewerTitle);

    // Switch to next pending item if available
    const nextPending = filteredList.find(
      (p) => p.id !== activeItem.id && p.status === 'menunggu'
    );
    if (nextPending) {
      setSelectedId(nextPending.id);
      setComment(QUICK_COMMENTS[0]);
    }
  };

  const handleCreateNewRphSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRphData.title?.trim() || !newRphData.objective?.trim()) return;

    const stepsArray = newStepsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const newItem: UbkRphItem = {
      id: `rph-${Date.now()}`,
      week: Number(newRphData.week) || 25,
      date: newRphData.date || new Date().toISOString().split('T')[0],
      time: newRphData.time || '08:00 PG - 09:00 PG',
      sessionType: newRphData.sessionType || 'Pengajaran & Pembelajaran (PdP)',
      focus: newRphData.focus || 'Pengurusan Kurikulum & PdP Berkesan',
      title: newRphData.title.trim(),
      target: newRphData.target || 'Tahun 6',
      venue: newRphData.venue || 'Bilik Darjah',
      objective: newRphData.objective.trim(),
      steps: stepsArray.length > 0 ? stepsArray : ['Aktiviti PdP / Perkhidmatan berstruktur.'],
      teachingAids: newRphData.teachingAids || 'Buku Teks, Modul',
      reflection: newRphData.reflection || 'Aktiviti berjalan lancar.',
      counselorName: newRphData.counselorName || 'Penolong Kanan Pentadbiran (PK 1)',
      authorRole: newRphData.authorRole || 'pk_kurikulum',
      status: 'menunggu',
      submittedAt: new Date().toISOString()
    };

    if (onSaveNewRph) {
      onSaveNewRph(newItem);
    } else {
      // Fallback: update list through onApproveItem or dispatch
      const currentList = allItems.length > 0 ? allItems : pendingItems;
      const updated = [newItem, ...currentList];
      try {
        localStorage.setItem('skmp_ubk_rph', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('skmp-rph-updated', { detail: updated }));
      } catch {}
    }

    setIsCreatingNew(false);
    setSelectedId(newItem.id);
  };

  const pendingCount = rawList.filter((i) => i.status === 'menunggu').length;
  const reviewedCount = rawList.filter((i) => i.status === 'disemak').length;

  // Helper to format author badge
  const getAuthorDisplay = (item: UbkRphItem) => {
    if (item.authorRole === 'pk_kurikulum' || item.counselorName?.toLowerCase().includes('pentadbiran') || item.counselorName?.toLowerCase().includes('pk 1')) {
      return { label: 'GPK Pentadbiran (PK 1)', bg: 'bg-blue-500/20 text-blue-300 border-blue-400/30' };
    }
    if (item.authorRole === 'pk_hem' || item.counselorName?.toLowerCase().includes('hem')) {
      return { label: 'GPK Hal Ehwal Murid (PK HEM)', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' };
    }
    if (item.authorRole === 'pk_kokurikulum' || item.counselorName?.toLowerCase().includes('koko')) {
      return { label: 'GPK Kokurikulum (PK Ko)', bg: 'bg-amber-500/20 text-amber-300 border-amber-400/30' };
    }
    if (item.authorRole === 'kaunselor' || item.counselorName?.toLowerCase().includes('kaunseling') || item.counselorName?.toLowerCase().includes('ubk')) {
      return { label: 'Guru Bimbingan & Kaunseling', bg: 'bg-teal-500/20 text-teal-300 border-teal-400/30' };
    }
    return { label: item.counselorName || 'Guru Pentadbir', bg: 'bg-purple-500/20 text-purple-300 border-purple-400/30' };
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 rounded-3xl max-w-5xl w-full border border-amber-500/40 shadow-2xl overflow-hidden text-white my-auto flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950/80 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Peti Semakan e-RPH Pentadbir (Guru Besar & Barisan GPK)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950">
                  {pendingCount} Menunggu Semakan
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {reviewedCount} Telah Disahkan
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Pengesahan rasmi e-RPH yang dihantar oleh Penolong Kanan (PK 1, PK HEM, PK Ko) dan Guru Kaunselor (UBK) kepada Guru Besar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingNew(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Cipta e-RPH GPK</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Controls & Filters */}
        <div className="bg-slate-950/80 border-b border-white/10 p-3 sm:p-4 space-y-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Main Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('semua')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'semua'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Semua e-RPH ({rawList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('menunggu')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'menunggu'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>Menunggu ({pendingCount})</span>
                {pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('disemak')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'disemak'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Telah Disahkan ({reviewedCount})
              </button>
            </div>

            {/* Mobile Create Button */}
            <button
              type="button"
              onClick={() => setIsCreatingNew(true)}
              className="sm:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Cipta</span>
            </button>
          </div>

          {/* Sub-filters & Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tajuk, pengirim, sasaran..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-white/15 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            {/* Filter by Jawatan / Pengirim */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 shrink-0 text-[11px] font-bold">Pengirim:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="semua">Semua Pentadbir & Guru</option>
                <option value="pk_kurikulum">GPK Pentadbiran (PK 1)</option>
                <option value="pk_hem">GPK HEM (PK HEM)</option>
                <option value="pk_kokurikulum">GPK Kokurikulum (PK Ko)</option>
                <option value="kaunselor">Guru Kaunselor (UBK)</option>
              </select>
            </div>

            {/* Filter by Minggu */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 shrink-0 text-[11px] font-bold">Minggu:</span>
              <select
                value={weekFilter}
                onChange={(e) => setWeekFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="semua">Semua Minggu</option>
                <option value="25">Minggu 25 (Terkini)</option>
                <option value="24">Minggu 24</option>
                <option value="23">Minggu 23</option>
                <option value="22">Minggu 22</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Body: Split view (Item List on Left, Active Item on Right) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          {isCreatingNew ? (
            /* Creation Form for GPK e-RPH */
            <div className="bg-slate-950 rounded-2xl border border-teal-500/40 p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-white">
                      Borang Cipta & Hantar e-RPH Pentadbir (GPK / Guru)
                    </h4>
                    <p className="text-xs text-slate-300">
                      Hantar rancangan pengajaran atau pengurusan untuk semakan rasmi Guru Besar.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-slate-800"
                >
                  Batal
                </button>
              </div>

              <form onSubmit={handleCreateNewRphSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Peranan Pengirim *</label>
                    <select
                      value={newRphData.authorRole}
                      onChange={(e) => {
                        const val = e.target.value;
                        let defName = 'Penolong Kanan Pentadbiran (PK 1)';
                        if (val === 'pk_hem') defName = 'Penolong Kanan Hal Ehwal Murid (PK HEM)';
                        if (val === 'pk_kokurikulum') defName = 'Penolong Kanan Kokurikulum (PK Ko)';
                        if (val === 'kaunselor') defName = 'Guru Bimbingan & Kaunseling (UBK)';
                        if (val === 'guru') defName = 'Guru Akademik SKMP';
                        setNewRphData({ ...newRphData, authorRole: val, counselorName: defName });
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white"
                    >
                      <option value="pk_kurikulum">GPK Pentadbiran (PK 1)</option>
                      <option value="pk_hem">GPK Hal Ehwal Murid (PK HEM)</option>
                      <option value="pk_kokurikulum">GPK Kokurikulum (PK Ko)</option>
                      <option value="kaunselor">Guru Kaunselor (UBK)</option>
                      <option value="guru">Guru Akademik</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Nama / Gelaran Pengirim *</label>
                    <input
                      type="text"
                      required
                      value={newRphData.counselorName}
                      onChange={(e) => setNewRphData({ ...newRphData, counselorName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Minggu Persekolahan *</label>
                    <input
                      type="number"
                      min={1}
                      max={45}
                      required
                      value={newRphData.week}
                      onChange={(e) => setNewRphData({ ...newRphData, week: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Tarikh *</label>
                    <input
                      type="date"
                      required
                      value={newRphData.date}
                      onChange={(e) => setNewRphData({ ...newRphData, date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Waktu Sesi / PdP *</label>
                    <input
                      type="text"
                      required
                      value={newRphData.time}
                      onChange={(e) => setNewRphData({ ...newRphData, time: e.target.value })}
                      placeholder="cth: 08:30 PG - 09:30 PG"
                      className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Jenis Aktiviti / PdP *</label>
                    <input
                      type="text"
                      value={newRphData.sessionType}
                      onChange={(e) => setNewRphData({ ...newRphData, sessionType: e.target.value })}
                      placeholder="cth: Pengajaran & Pembelajaran (PdP)"
                      className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Tajuk Rancangan Harian (e-RPH) *</label>
                  <input
                    type="text"
                    required
                    value={newRphData.title}
                    onChange={(e) => setNewRphData({ ...newRphData, title: e.target.value })}
                    placeholder="cth: PdP Bahasa Melayu Tahun 6: Tatabahasa & Penulisan Karangan"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Sasaran Murid / Kelas *</label>
                    <input
                      type="text"
                      required
                      value={newRphData.target}
                      onChange={(e) => setNewRphData({ ...newRphData, target: e.target.value })}
                      placeholder="cth: Murid Tahun 6 Ibnu Khaldun (34 Murid)"
                      className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Ruang / Tempat *</label>
                    <input
                      type="text"
                      required
                      value={newRphData.venue}
                      onChange={(e) => setNewRphData({ ...newRphData, venue: e.target.value })}
                      placeholder="cth: Bilik Darjah 6 Ibnu Khaldun"
                      className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Objektif Pembelajaran / Sesi *</label>
                  <textarea
                    rows={2}
                    required
                    value={newRphData.objective}
                    onChange={(e) => setNewRphData({ ...newRphData, objective: e.target.value })}
                    placeholder="Nyatakan hasil pembelajaran atau matlamat utama sesi..."
                    className="w-full px-3.5 py-2 bg-slate-900 border border-white/15 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Langkah Pelaksanaan (Satu per baris)
                  </label>
                  <textarea
                    rows={3}
                    value={newStepsText}
                    onChange={(e) => setNewStepsText(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-white/15 rounded-xl text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">BBM / Bahan Bantu Mengajar</label>
                    <input
                      type="text"
                      value={newRphData.teachingAids}
                      onChange={(e) => setNewRphData({ ...newRphData, teachingAids: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Refleksi / Catatan Impak</label>
                    <input
                      type="text"
                      value={newRphData.reflection}
                      onChange={(e) => setNewRphData({ ...newRphData, reflection: e.target.value })}
                      placeholder="cth: 31 daripada 34 murid mencapai objektif..."
                      className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Hantar e-RPH Kepada Guru Besar</span>
                  </button>
                </div>
              </form>
            </div>
          ) : filteredList.length === 0 ? (
            /* Empty State */
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-white">
                  Tiada Rekod e-RPH Dijumpai
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Semua rekod telah diproses atau tiada padanan dengan kriteria carian anda. Anda boleh mencipta e-RPH GPK baharu pada bila-bila masa.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(true)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Cipta e-RPH GPK Baharu</span>
                </button>
              </div>
            </div>
          ) : (
            /* Main 2-Column Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Item Selector (Cards) */}
              <div className="lg:col-span-4 space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
                <div className="text-[11px] font-bold text-slate-400 px-1 flex items-center justify-between">
                  <span>Senarai e-RPH ({filteredList.length})</span>
                  <span>Pilih untuk semak</span>
                </div>
                {filteredList.map((item) => {
                  const isSelected = item.id === activeItem?.id;
                  const author = getAuthorDisplay(item);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full text-left p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400 text-white shadow-lg shadow-amber-950/40'
                          : 'bg-slate-950/60 border-white/10 hover:border-white/20 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 text-[10px]">
                        <span className={`px-2 py-0.5 rounded-full font-bold border ${author.bg}`}>
                          {author.label}
                        </span>
                        <span className="font-extrabold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/20">
                          M{item.week}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h5 className="font-bold text-xs text-white line-clamp-2 leading-snug">
                          {item.title}
                        </h5>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {item.target} • {item.date}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                        <span className="text-slate-400 truncate max-w-[120px]">
                          {item.sessionType}
                        </span>
                        {item.status === 'disemak' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Disahkan</span>
                          </span>
                        ) : item.status === 'pembetulan' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-400">
                            <AlertCircle className="w-3 h-3" />
                            <span>Perlu Baiki</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-400">
                            <Clock className="w-3 h-3" />
                            <span>Menunggu</span>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Full Detail & Action Section */}
              <div className="lg:col-span-8 bg-slate-950/70 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {activeItem && (
                  <>
                    {/* Item Top Metadata */}
                    <div className="border-b border-white/10 pb-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-amber-500 text-slate-950 shadow">
                            Minggu {activeItem.week}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getAuthorDisplay(activeItem).bg}`}>
                            {getAuthorDisplay(activeItem).label}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {activeItem.status === 'disemak' ? (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 inline-flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Telah Disemak & Disahkan</span>
                            </span>
                          ) : activeItem.status === 'pembetulan' ? (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-400/40 inline-flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Perlu Penambahbaikan</span>
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/40 inline-flex items-center gap-1.5 animate-pulse">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Menunggu Semakan Guru Besar</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                        {activeItem.title}
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300 pt-1">
                        <div>
                          <span className="text-slate-500 block">Tarikh:</span>
                          <strong className="text-white">{activeItem.date}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Masa:</span>
                          <strong className="text-white">{activeItem.time}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Sasaran:</span>
                          <strong className="text-white truncate block">{activeItem.target}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Tempat:</span>
                          <strong className="text-white truncate block">{activeItem.venue}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Objektif & Refleksi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Objektif & BBM */}
                      <div className="bg-slate-900/90 rounded-xl p-3.5 border border-white/5 space-y-2.5">
                        <h5 className="font-bold text-teal-300 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          <span>Objektif Pembelajaran / Sesi</span>
                        </h5>
                        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-950 p-2.5 rounded-lg border border-white/5">
                          {activeItem.objective}
                        </p>

                        <div>
                          <span className="font-bold text-slate-400 text-[11px] block mb-0.5">
                            BBM / Bahan Bantu Mengajar:
                          </span>
                          <p className="text-slate-300 bg-slate-950 p-2 rounded-lg border border-white/5 text-[11px]">
                            {activeItem.teachingAids || 'Tiada bahan khusus dinyatakan.'}
                          </p>
                        </div>

                        {activeItem.reflection && (
                          <div>
                            <span className="font-bold text-amber-300 text-[11px] block mb-0.5">
                              Refleksi Guru / GPK:
                            </span>
                            <p className="text-slate-200 bg-amber-950/20 p-2 rounded-lg border border-amber-500/20 italic text-[11px]">
                              "{activeItem.reflection}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Langkah Pelaksanaan */}
                      <div className="bg-slate-900/90 rounded-xl p-3.5 border border-white/5 space-y-2">
                        <h5 className="font-bold text-blue-300 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          <span>Langkah-Langkah Pelaksanaan</span>
                        </h5>
                        <div className="space-y-1.5">
                          {activeItem.steps && activeItem.steps.length > 0 ? (
                            activeItem.steps.map((st, i) => (
                              <div
                                key={i}
                                className="p-2 rounded-lg bg-slate-950 border border-white/5 text-slate-200 flex items-start gap-2 text-[11px]"
                              >
                                <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <span className="leading-relaxed">{st}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-400 italic p-2">
                              Tiada langkah berperingkat dinyatakan.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Official Review Seal if already verified */}
                    {activeItem.status === 'disemak' && activeItem.reviewerName && (
                      <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-300 font-black text-xs">
                            <Award className="w-4 h-4" />
                            <span>Pengesahan Rasmi Guru Besar / Pentadbir</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Tarikh Semakan: <strong className="text-white">{activeItem.reviewedAt || activeItem.date}</strong>
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 bg-slate-950/70 p-2.5 rounded-lg border border-emerald-500/20 italic">
                          "{activeItem.reviewerComment || 'Disemak dan disahkan menepati piawaian KPM.'}"
                        </p>
                        <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Disahkan oleh: {activeItem.reviewerName}</span>
                        </p>
                      </div>
                    )}

                    {/* Authentication or Review Action Form */}
                    {!isPentadbir ? (
                      <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                          <Lock className="w-4 h-4 shrink-0" />
                          <span>Akses Guru Besar Diperlukan untuk Sahkan e-RPH</span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Masukkan katalaluan Guru Besar untuk membuat pengesahan terus secara rasmi.
                        </p>
                        <form onSubmit={handleInlineAuth} className="flex gap-2">
                          <input
                            type="password"
                            value={gbPassword}
                            onChange={(e) => setGbPassword(e.target.value)}
                            placeholder="Katalaluan Guru Besar (GB5012)"
                            className="flex-1 px-3 py-1.5 bg-slate-950 border border-amber-400/50 rounded-xl text-white text-xs"
                          />
                          <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shrink-0"
                          >
                            Buka Akses
                          </button>
                        </form>
                        {authError && (
                          <p className="text-xs text-rose-400 font-semibold">{authError}</p>
                        )}
                      </div>
                    ) : (
                      /* Review Action Form */
                      <div className="bg-slate-900 rounded-xl p-4 border border-emerald-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4" />
                            <span>Tindakan Pengesahan Guru Besar / Pentadbir</span>
                          </h5>
                          <span className="text-[11px] text-slate-400">
                            Penyemak: <strong className="text-white">{userRole === 'guru_besar' || isLocallyAuthenticated ? 'Guru Besar SKMP' : 'Pentadbir Sekolah'}</strong>
                          </span>
                        </div>

                        {/* Status Buttons */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setStatus('disemak')}
                            className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-black transition cursor-pointer ${
                              status === 'disemak'
                                ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
                                : 'bg-slate-950 border-white/10 text-slate-400'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Sahkan & Luluskan</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus('pembetulan')}
                            className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-black transition cursor-pointer ${
                              status === 'pembetulan'
                                ? 'bg-rose-600/30 border-rose-400 text-rose-200'
                                : 'bg-slate-950 border-white/10 text-slate-400'
                            }`}
                          >
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                            <span>Perlu Pembetulan</span>
                          </button>
                        </div>

                        {/* Quick Comment Templates */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>Templat Ulasan Rasmi Guru Besar:</span>
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {QUICK_COMMENTS.map((qc, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setComment(qc)}
                                className="text-left text-[10px] text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 p-1.5 rounded-lg border border-white/5 transition line-clamp-2 cursor-pointer"
                              >
                                "{qc}"
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Comment Input */}
                        <div>
                          <textarea
                            rows={2}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-2.5 bg-slate-950 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-400"
                            placeholder="Catatan ulasan pengesahan e-RPH..."
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={handleApprove}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer active:scale-95 transition"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                            <span>Sahkan e-RPH Ini Sekarang</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div>
            {onNavigateToUbk && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToUbk();
                }}
                className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <span>Buka Modul e-RPH UBK / BRPBK Penuh</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
