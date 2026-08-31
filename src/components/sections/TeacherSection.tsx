import React, { useState, useMemo } from 'react';
import {
  TeacherLinkItem,
  SchoolProfile,
  Staff
} from '../../types';
import {
  GraduationCap,
  HeartHandshake,
  Trophy,
  Briefcase,
  ExternalLink,
  Search,
  Copy,
  Check,
  Plus,
  Edit3,
  Trash2,
  Lock,
  Sparkles,
  Layers,
  Globe,
  RotateCcw,
  X,
  Save,
  CheckCircle2,
  GripVertical,
  ArrowUpToLine,
  ArrowDownToLine,
  ChevronUp,
  ChevronDown,
  ListOrdered,
  Move,
  Info,
  ShieldCheck
} from 'lucide-react';
import { getNavIcon } from '../../utils/iconMap';
import { initialTeacherLinks } from '../../data/initialData';
import { StudentSearchPortalModal } from './StudentSearchPortalModal';

interface TeacherSectionProps {
  profile?: SchoolProfile;
  staffList?: Staff[];
  teacherLinks?: TeacherLinkItem[];
  onSaveTeacherLinks?: (links: TeacherLinkItem[]) => void;
  isAdmin: boolean;
  isTeacher?: boolean;
  userRole?: 'admin' | 'guru' | null;
  onOpenLogin?: () => void;
  onNavigate?: (tab: any) => void;
}

type CategoryType = 'semua' | 'kurikulum' | 'hem' | 'kokurikulum' | 'umum';

const CATEGORY_META = {
  kurikulum: {
    id: 'kurikulum',
    label: 'Kurikulum',
    subtitle: 'Pengurusan PdP, e-RPH, IDME, PBD, DELIMa, dan Pentaksiran Akademik',
    icon: GraduationCap,
    colorClass: 'from-blue-600/20 to-indigo-600/20 border-blue-500/30 text-blue-300',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    iconBgClass: 'bg-blue-600 text-white',
    btnClass: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30'
  },
  hem: {
    id: 'hem',
    label: 'Hal Ehwal Murid',
    subtitle: 'APDM Kehadiran, SSDM Disiplin, SPBT, RMT, BAP, dan Kebajikan Murid',
    icon: HeartHandshake,
    colorClass: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30 text-emerald-300',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    iconBgClass: 'bg-emerald-600 text-white',
    btnClass: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
  },
  kokurikulum: {
    id: 'kokurikulum',
    label: 'Kokurikulum',
    subtitle: 'PAJSK Online, Perekodan Aktiviti Rabu, Skor Merit, dan MSSD/MSSK',
    icon: Trophy,
    colorClass: 'from-amber-600/20 to-yellow-600/20 border-amber-500/30 text-yellow-300',
    badgeClass: 'bg-amber-500/20 text-yellow-300 border-amber-400/30',
    iconBgClass: 'bg-amber-600 text-white',
    btnClass: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
  },
  umum: {
    id: 'umum',
    label: 'Umum & Pentadbiran',
    subtitle: 'HRMIS Cuti, e-Operasi, SPLKPM LDP, SSPA, Penyata Gaji ANM, dan Tempahan',
    icon: Briefcase,
    colorClass: 'from-rose-600/20 to-red-600/20 border-rose-500/30 text-rose-300',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
    iconBgClass: 'bg-rose-600 text-white',
    btnClass: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
  }
};

export const TeacherSection: React.FC<TeacherSectionProps> = ({
  profile,
  staffList,
  teacherLinks: controlledLinks,
  onSaveTeacherLinks,
  isAdmin,
  isTeacher,
  userRole,
  onOpenLogin,
  onNavigate
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [orderToast, setOrderToast] = useState<string | null>(null);
  const [isStudentSearchPortalOpen, setIsStudentSearchPortalOpen] = useState(false);

  // Drag and Drop States
  const [draggedLinkId, setDraggedLinkId] = useState<string | null>(null);
  const [dragOverLinkId, setDragOverLinkId] = useState<string | null>(null);

  const canAccess = isAdmin || isTeacher || userRole === 'admin' || userRole === 'guru';

  // Link Management State with auto-preservation of Student Search Portal
  const ensureStudentPortalIncluded = (inputLinks: TeacherLinkItem[]): TeacherLinkItem[] => {
    const list = [...inputLinks];
    const hasStudentPortal = list.some(
      (l) =>
        l.id === 'tlink-h-carian' ||
        l.url.includes('1eODYEpiGFEVRe6RjoxZrPX3bPXpGYOR7l9PaGi8EKEo') ||
        l.title.toLowerCase().includes('carian murid')
    );
    if (!hasStudentPortal) {
      const defaultStudentPortalLink = initialTeacherLinks.find(
        (l) => l.id === 'tlink-h-carian' || l.url.includes('1eODYEpiGFEVRe6RjoxZrPX3bPXpGYOR7l9PaGi8EKEo')
      ) || {
        id: 'tlink-h-carian',
        title: 'Portal Senarai & Carian Murid (Google Sheets)',
        category: 'hem' as const,
        url: 'https://docs.google.com/spreadsheets/d/1eODYEpiGFEVRe6RjoxZrPX3bPXpGYOR7l9PaGi8EKEo/edit?usp=drive_link',
        description: 'Portal carian maklumat lengkap 375 orang murid SKMP (Profil APDM, Kelas, Maklumat Ibu Bapa/Penjaga, No. Telefon & Alamat dari Google Sheets).',
        badge: 'Pangkalan Data Murid',
        iconName: 'Search',
        order: 7
      };
      const hemIdx = list.findIndex((l) => l.category === 'hem');
      if (hemIdx !== -1) {
        list.splice(hemIdx, 0, defaultStudentPortalLink);
      } else {
        list.push(defaultStudentPortalLink);
      }
    }
    return list;
  };

  const [links, setLinks] = useState<TeacherLinkItem[]>(() => {
    if (controlledLinks && controlledLinks.length > 0) {
      return ensureStudentPortalIncluded(controlledLinks);
    }
    return initialTeacherLinks;
  });

  // Sync if controlledLinks changes
  React.useEffect(() => {
    if (controlledLinks && controlledLinks.length > 0) {
      setLinks(ensureStudentPortalIncluded(controlledLinks));
    }
  }, [controlledLinks]);

  // Modal State for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<TeacherLinkItem | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    category: 'kurikulum' | 'hem' | 'kokurikulum' | 'umum';
    url: string;
    description: string;
    badge: string;
    iconName: string;
  }>({
    title: '',
    category: 'kurikulum',
    url: '',
    description: '',
    badge: '',
    iconName: 'GraduationCap'
  });

  const showToast = (msg: string) => {
    setOrderToast(msg);
    setTimeout(() => {
      setOrderToast(null);
    }, 2500);
  };

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAdd = (defaultCat?: 'kurikulum' | 'hem' | 'kokurikulum' | 'umum') => {
    setEditingLink(null);
    setFormData({
      title: '',
      category: defaultCat || (activeCategory !== 'semua' ? activeCategory : 'kurikulum'),
      url: 'https://',
      description: '',
      badge: '',
      iconName: 'Globe'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (link: TeacherLinkItem) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      category: link.category,
      url: link.url,
      description: link.description,
      badge: link.badge || '',
      iconName: link.iconName || 'Globe'
    });
    setIsModalOpen(true);
  };

  const handleDeleteLink = (id: string) => {
    if (window.confirm('Adakah anda pasti ingin memadam pautan ini?')) {
      const updated = links.filter((l) => l.id !== id);
      setLinks(updated);
      if (onSaveTeacherLinks) {
        onSaveTeacherLinks(updated);
      }
      showToast('Pautan berjaya dipadam.');
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Tetapkan semula semua pautan guru kepada senarai rasmi asal?')) {
      setLinks(initialTeacherLinks);
      if (onSaveTeacherLinks) {
        onSaveTeacherLinks(initialTeacherLinks);
      }
      showToast('Pautan guru ditetapkan semula ke tetapan asal.');
    }
  };

  const formatExternalUrl = (rawUrl: string): string => {
    if (!rawUrl) return '#';
    const trimmed = rawUrl.trim();
    if (!trimmed || trimmed === '#') return '#';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) return;

    let cleanUrl = formData.url.trim();
    if (cleanUrl && cleanUrl !== '#' && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('mailto:') && !cleanUrl.startsWith('tel:')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    let updated: TeacherLinkItem[];
    if (editingLink) {
      updated = links.map((l) =>
        l.id === editingLink.id
          ? {
              ...l,
              title: formData.title.trim(),
              category: formData.category,
              url: cleanUrl,
              description: formData.description.trim(),
              badge: formData.badge.trim(),
              iconName: formData.iconName
            }
          : l
      );
    } else {
      const newId = `tlink-${Date.now()}`;
      const newLink: TeacherLinkItem = {
        id: newId,
        title: formData.title.trim(),
        category: formData.category,
        url: cleanUrl,
        description: formData.description.trim(),
        badge: formData.badge.trim(),
        iconName: formData.iconName,
        order: links.length + 1
      };
      updated = [...links, newLink];
    }

    setLinks(updated);
    if (onSaveTeacherLinks) {
      onSaveTeacherLinks(updated);
    }
    setIsModalOpen(false);
    showToast('Pautan guru berjaya disimpan.');
  };

  // --- REORDERING FUNCTIONS (Move to start, move to end, step up, step down, drag-and-drop) ---
  
  // Pindah ke paling Awal (First in Category)
  const handleMoveToStart = (linkId: string, category: string, title?: string) => {
    const targetLink = links.find((l) => l.id === linkId);
    if (!targetLink) return;

    const sameCat = links.filter((l) => l.category === category && l.id !== linkId);
    const otherCat = links.filter((l) => l.category !== category);
    const newCategoryList = [targetLink, ...sameCat];
    const newLinks = [...otherCat, ...newCategoryList];

    setLinks(newLinks);
    if (onSaveTeacherLinks) onSaveTeacherLinks(newLinks);
    showToast(`"${targetLink.title}" dipindahkan ke paling AWAL!`);
  };

  // Pindah ke paling Akhir (Last in Category)
  const handleMoveToEnd = (linkId: string, category: string, title?: string) => {
    const targetLink = links.find((l) => l.id === linkId);
    if (!targetLink) return;

    const sameCat = links.filter((l) => l.category === category && l.id !== linkId);
    const otherCat = links.filter((l) => l.category !== category);
    const newCategoryList = [...sameCat, targetLink];
    const newLinks = [...otherCat, ...newCategoryList];

    setLinks(newLinks);
    if (onSaveTeacherLinks) onSaveTeacherLinks(newLinks);
    showToast(`"${targetLink.title}" dipindahkan ke paling AKHIR!`);
  };

  // Naik 1 anak tangga
  const handleMoveStepUp = (linkId: string, category: string) => {
    const catLinks = links.filter((l) => l.category === category);
    const idx = catLinks.findIndex((l) => l.id === linkId);
    if (idx <= 0) return;

    const reorderedCat = [...catLinks];
    const temp = reorderedCat[idx - 1];
    reorderedCat[idx - 1] = reorderedCat[idx];
    reorderedCat[idx] = temp;

    const otherCat = links.filter((l) => l.category !== category);
    const newLinks = [...otherCat, ...reorderedCat];

    setLinks(newLinks);
    if (onSaveTeacherLinks) onSaveTeacherLinks(newLinks);
    showToast('Kedudukan dinaikkan ke atas.');
  };

  // Turun 1 anak tangga
  const handleMoveStepDown = (linkId: string, category: string) => {
    const catLinks = links.filter((l) => l.category === category);
    const idx = catLinks.findIndex((l) => l.id === linkId);
    if (idx < 0 || idx >= catLinks.length - 1) return;

    const reorderedCat = [...catLinks];
    const temp = reorderedCat[idx + 1];
    reorderedCat[idx + 1] = reorderedCat[idx];
    reorderedCat[idx] = temp;

    const otherCat = links.filter((l) => l.category !== category);
    const newLinks = [...otherCat, ...reorderedCat];

    setLinks(newLinks);
    if (onSaveTeacherLinks) onSaveTeacherLinks(newLinks);
    showToast('Kedudukan diturunkan ke bawah.');
  };

  // HTML5 Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, linkId: string, category: string) => {
    if (!isAdmin) return;
    e.dataTransfer.setData('text/plain', JSON.stringify({ linkId, category }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedLinkId(linkId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverLinkId !== targetId) {
      setDragOverLinkId(targetId);
    }
  };

  const handleDragLeave = () => {
    setDragOverLinkId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string, targetCategory: string) => {
    if (!isAdmin) return;
    e.preventDefault();
    setDraggedLinkId(null);
    setDragOverLinkId(null);

    try {
      const raw = e.dataTransfer.getData('text/plain');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const sourceId = parsed.linkId;
      if (!sourceId || sourceId === targetId) return;

      const sourceLink = links.find((l) => l.id === sourceId);
      if (!sourceLink) return;

      // Filter out dragged item
      const remaining = links.filter((l) => l.id !== sourceId);
      const targetIdx = remaining.findIndex((l) => l.id === targetId);

      const updatedSource = { ...sourceLink, category: targetCategory as any };

      let reordered: TeacherLinkItem[];
      if (targetIdx >= 0) {
        reordered = [
          ...remaining.slice(0, targetIdx),
          updatedSource,
          ...remaining.slice(targetIdx)
        ];
      } else {
        reordered = [...remaining, updatedSource];
      }

      setLinks(reordered);
      if (onSaveTeacherLinks) onSaveTeacherLinks(reordered);
      showToast(`Susunan kedudukan "${sourceLink.title}" berjaya dikemaskini!`);
    } catch (err) {
      console.error('Drag drop error:', err);
    }
  };

  // Filtered links
  const filteredLinks = useMemo(() => {
    return links.filter((l) => {
      const matchesCategory = activeCategory === 'semua' || l.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        (l.badge && l.badge.toLowerCase().includes(q)) ||
        l.url.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [links, activeCategory, searchQuery]);

  // Counts per category
  const counts = useMemo(() => {
    return {
      semua: links.length,
      kurikulum: links.filter((l) => l.category === 'kurikulum').length,
      hem: links.filter((l) => l.category === 'hem').length,
      kokurikulum: links.filter((l) => l.category === 'kokurikulum').length,
      umum: links.filter((l) => l.category === 'umum').length
    };
  }, [links]);

  // If user is neither Admin nor logged-in Guru, show restricted notice
  if (!canAccess) {
    return (
      <div className="bg-slate-900/90 border border-red-500/30 rounded-3xl p-8 text-center max-w-2xl mx-auto my-12 shadow-2xl backdrop-blur-xl animate-fadeIn">
        <div className="w-16 h-16 bg-red-500/20 text-red-400 border border-red-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-red-500/20 text-red-300 rounded-full border border-red-500/30">
          Akses Khas Guru & Pentadbir
        </span>
        <h2 className="text-2xl font-black text-white mt-3">Portal Guru SKMP</h2>
        <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
          Ruang portal ini mengandungi pautan rasmi portfolio guru Kementerian Pendidikan Malaysia (KPM). Sila log masuk untuk mengakses menu ini.
        </p>
        <div className="mt-4 p-3.5 bg-slate-950/70 border border-white/10 rounded-2xl text-xs text-slate-300 max-w-md mx-auto">
          <p className="text-yellow-300 font-bold mb-1">Panduan Log Masuk:</p>
          <p>
            • Untuk <strong>Guru</strong>: Masukkan kata laluan <span className="font-mono text-yellow-300 font-black bg-white/10 px-1.5 py-0.5 rounded">guru5012</span>
          </p>
          <p className="mt-1">
            • Untuk <strong>Pentadbir</strong>: Masukkan <span className="font-mono text-blue-300">adminskmp</span> / <span className="font-mono text-blue-300">123456</span>
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs sm:text-sm transition shadow-lg shadow-red-900/50 flex items-center gap-2 border border-red-400"
            >
              <Lock className="w-4 h-4" />
              <span>Log Masuk (Kata Laluan: guru5012)</span>
            </button>
          )}
          {onNavigate && (
            <button
              onClick={() => onNavigate('utama')}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs sm:text-sm transition border border-white/20"
            >
              Kembali ke Laman Utama
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn relative">
      {/* Toast Notification */}
      {orderToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-2.5 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-yellow-300" />
          <span>{orderToast}</span>
        </div>
      )}

      {/* Red-Themed Executive Title Banner */}
      <div className="bg-gradient-to-r from-red-950/90 via-slate-900/90 to-red-950/90 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-red-500/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-red-600 text-white font-black rounded-full text-xs border border-red-400 shadow-md shadow-red-900/50">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Portal Rasmi Portfolio Guru SKMP</span>
              </span>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600/30 text-blue-300 font-bold rounded-full text-xs border border-blue-400/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Mod Pentadbir (Susunan Drag & Drop Aktif)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded-full text-xs border border-emerald-400/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Log Masuk Guru Aktif (guru5012)</span>
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Portal Guru & Pautan Pantas Sekolah
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
              Pusat sehenti akses pantas sistem dan pautan rasmi Kementerian Pendidikan Malaysia (KPM), Jabatan Perkhidmatan Awam (JPA), dan pengurusan sekolah yang dibahagikan kepada 4 portfolio: <strong className="text-blue-300 font-bold">Kurikulum</strong>, <strong className="text-emerald-300 font-bold">Hal Ehwal Murid</strong>, <strong className="text-yellow-300 font-bold">Kokurikulum</strong>, dan <strong className="text-rose-300 font-bold">Umum</strong>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {isAdmin && (
              <>
                <button
                  onClick={() => setIsReorderMode(!isReorderMode)}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-1.5 border ${
                    isReorderMode
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/30'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                  title="Togol Mod Susun Kedudukan Pantas"
                >
                  <ListOrdered className="w-4 h-4" />
                  <span>{isReorderMode ? 'Tutup Mod Susun' : 'Susun Kedudukan'}</span>
                </button>
                <button
                  onClick={() => handleOpenAdd()}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-red-950/50 border border-red-400 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Pautan</span>
                </button>
                <button
                  onClick={handleResetToDefault}
                  title="Tetapkan semula pautan asal"
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-2xl text-xs transition border border-white/20 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Set Semula</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Drag & Drop Guidance for Admin */}
        {isAdmin && (
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-200 bg-black/20 px-4 py-2.5 rounded-2xl">
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Panduan Susun Pautan:</strong> Pegang & heret (<strong>Drag & Drop</strong>) kad pautan untuk ubah posisi, atau klik butang <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-bold">Ke Awal</span> / <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-bold">Ke Akhir</span>.
              </span>
            </div>
            <span className="text-[11px] text-slate-300 font-mono">
              Auto-Simpan Aktif
            </span>
          </div>
        )}
      </div>

      {/* Category Sub-Menu Pills & Search Bar */}
      <div className="bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/15 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 4 Main Portfolio Sub-Menu Tabs + All */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveCategory('semua')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition ${
                activeCategory === 'semua'
                  ? 'bg-red-600 text-white shadow-md shadow-red-900/40 border border-red-400'
                  : 'bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Semua Portfolio</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950/60 text-white">
                {counts.semua}
              </span>
            </button>

            {/* 1. KURIKULUM */}
            <button
              onClick={() => setActiveCategory('kurikulum')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition ${
                activeCategory === 'kurikulum'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 border border-blue-400'
                  : 'bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
              <span>1. Kurikulum</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950/60 text-blue-300">
                {counts.kurikulum}
              </span>
            </button>

            {/* 2. HAL EHWAL MURID */}
            <button
              onClick={() => setActiveCategory('hem')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition ${
                activeCategory === 'hem'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 border border-emerald-400'
                  : 'bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. Hal Ehwal Murid</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950/60 text-emerald-300">
                {counts.hem}
              </span>
            </button>

            {/* 3. KOKURIKULUM */}
            <button
              onClick={() => setActiveCategory('kokurikulum')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition ${
                activeCategory === 'kokurikulum'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40 border border-amber-400'
                  : 'bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>3. Kokurikulum</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950/60 text-yellow-300">
                {counts.kokurikulum}
              </span>
            </button>

            {/* 4. UMUM */}
            <button
              onClick={() => setActiveCategory('umum')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition ${
                activeCategory === 'umum'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40 border border-rose-400'
                  : 'bg-white/5 hover:bg-white/15 text-slate-200 border border-white/10'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-rose-400" />
              <span>4. Umum</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950/60 text-rose-300">
                {counts.umum}
              </span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari sistem / portal..."
              className="w-full pl-9 pr-8 py-2 bg-slate-950/70 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Link Sections Grid */}
      {(['kurikulum', 'hem', 'kokurikulum', 'umum'] as const).map((catKey) => {
        const catMeta = CATEGORY_META[catKey];
        const sectionLinks = filteredLinks.filter((l) => l.category === catKey);

        // If category is filtered out, skip
        if (activeCategory !== 'semua' && activeCategory !== catKey) {
          return null;
        }

        return (
          <div key={catKey} className="space-y-4">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl ${catMeta.iconBgClass} flex items-center justify-center shadow-md flex-shrink-0`}>
                  <catMeta.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      {catMeta.label}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-bold border border-white/10">
                      {sectionLinks.length} Pautan
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {catMeta.subtitle}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleOpenAdd(catKey)}
                  className="self-start sm:self-auto text-xs px-3 py-1.5 bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white rounded-xl border border-white/10 flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Dalam {catMeta.label}</span>
                </button>
              )}
            </div>

            {/* Links Cards Grid */}
            {sectionLinks.length === 0 ? (
              <div className="bg-slate-900/40 border border-dashed border-white/10 rounded-3xl p-8 text-center text-slate-400">
                <p className="text-sm">Tiada pautan ditemui dalam bahagian ini.</p>
                {isAdmin && (
                  <button
                    onClick={() => handleOpenAdd(catKey)}
                    className="mt-2 text-xs text-red-400 hover:text-red-300 underline font-bold"
                  >
                    Klik untuk tambah pautan baharu
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectionLinks.map((link, idx) => {
                  const IconComponent = getNavIcon(link.iconName || 'Globe');
                  const isCopied = copiedId === link.id;
                  const isDraggingThis = draggedLinkId === link.id;
                  const isDragOverThis = dragOverLinkId === link.id;
                  const isFirst = idx === 0;
                  const isLast = idx === sectionLinks.length - 1;

                  const isStudentPortalLink =
                    link.id === 'tlink-h-carian' ||
                    link.url.includes('1eODYEpiGFEVRe6RjoxZrPX3bPXpGYOR7l9PaGi8EKEo') ||
                    link.title.toLowerCase().includes('carian murid');

                  return (
                    <div
                      key={link.id}
                      draggable={isAdmin}
                      onDragStart={(e) => handleDragStart(e, link.id, link.category)}
                      onDragOver={(e) => handleDragOver(e, link.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, link.id, link.category)}
                      className={`bg-slate-900/85 backdrop-blur-md rounded-3xl p-5 border transition-all duration-200 shadow-xl hover:shadow-2xl flex flex-col justify-between group space-y-4 relative ${
                        isDraggingThis
                          ? 'opacity-40 scale-95 border-dashed border-amber-400'
                          : isDragOverThis
                          ? 'border-2 border-amber-400 bg-amber-950/20 scale-[1.02] shadow-amber-500/20'
                          : isStudentPortalLink
                          ? 'border-emerald-500/40 hover:border-emerald-400 bg-gradient-to-b from-slate-900/95 via-emerald-950/20 to-slate-900/95'
                          : 'border-white/15 hover:border-white/30'
                      }`}
                    >
                      {/* Drag handle & Order Controls for Admin */}
                      {isAdmin && (
                        <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs text-slate-400">
                          {/* Drag Grip Handle */}
                          <div
                            className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing text-slate-400 hover:text-amber-400 transition"
                            title="Klik & heret (Drag & Drop) untuk susun kedudukan pautan ini"
                          >
                            <GripVertical className="w-4 h-4 text-amber-400" />
                            <span className="text-[11px] font-black text-amber-400/90 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                              #{idx + 1}
                            </span>
                            <span className="text-[10px] text-slate-400 hidden sm:inline">
                              Heret
                            </span>
                          </div>

                          {/* Quick Position Reorder Buttons: Paling Awal, Naik, Turun, Paling Akhir */}
                          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-white/10">
                            {/* Pindah ke Paling Awal */}
                            <button
                              type="button"
                              onClick={() => handleMoveToStart(link.id, link.category, link.title)}
                              disabled={isFirst}
                              title="Pindah ke Paling Hadapan (Awal)"
                              className={`p-1 rounded text-[10px] flex items-center gap-0.5 transition ${
                                isFirst
                                  ? 'opacity-30 cursor-not-allowed text-slate-600'
                                  : 'hover:bg-amber-500 hover:text-slate-950 text-amber-400'
                              }`}
                            >
                              <ArrowUpToLine className="w-3.5 h-3.5" />
                              <span className="font-bold text-[9px] hidden xl:inline">Awal</span>
                            </button>

                            {/* Naik 1 Kedudukan */}
                            <button
                              type="button"
                              onClick={() => handleMoveStepUp(link.id, link.category)}
                              disabled={isFirst}
                              title="Naik 1 Kedudukan"
                              className={`p-1 rounded text-[10px] transition ${
                                isFirst
                                  ? 'opacity-30 cursor-not-allowed text-slate-600'
                                  : 'hover:bg-white/15 text-slate-300 hover:text-white'
                              }`}
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>

                            {/* Turun 1 Kedudukan */}
                            <button
                              type="button"
                              onClick={() => handleMoveStepDown(link.id, link.category)}
                              disabled={isLast}
                              title="Turun 1 Kedudukan"
                              className={`p-1 rounded text-[10px] transition ${
                                isLast
                                  ? 'opacity-30 cursor-not-allowed text-slate-600'
                                  : 'hover:bg-white/15 text-slate-300 hover:text-white'
                              }`}
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Pindah ke Paling Akhir */}
                            <button
                              type="button"
                              onClick={() => handleMoveToEnd(link.id, link.category, link.title)}
                              disabled={isLast}
                              title="Pindah ke Paling Belakang (Akhir)"
                              className={`p-1 rounded text-[10px] flex items-center gap-0.5 transition ${
                                isLast
                                  ? 'opacity-30 cursor-not-allowed text-slate-600'
                                  : 'hover:bg-amber-500 hover:text-slate-950 text-amber-400'
                              }`}
                            >
                              <ArrowDownToLine className="w-3.5 h-3.5" />
                              <span className="font-bold text-[9px] hidden xl:inline">Akhir</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Card Header & Content */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-2xl ${catMeta.iconBgClass} p-2.5 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition`}>
                              <IconComponent className="w-full h-full text-white" />
                            </div>
                            <div>
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${catMeta.badgeClass}`}>
                                {link.badge || catMeta.label}
                              </span>
                            </div>
                          </div>

                          {/* Edit / Delete for Admin */}
                          {isAdmin && (
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                              <button
                                onClick={() => handleOpenEdit(link)}
                                title="Sunting Pautan"
                                className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteLink(link.id)}
                                title="Padam Pautan"
                                className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm sm:text-base font-black text-white group-hover:text-yellow-300 transition leading-snug">
                            {link.title}
                          </h4>
                          <p className="text-xs text-slate-300 font-normal mt-1 leading-relaxed line-clamp-2">
                            {link.description}
                          </p>
                        </div>
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                        {isStudentPortalLink ? (
                          <button
                            type="button"
                            onClick={() => setIsStudentSearchPortalOpen(true)}
                            className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition ${catMeta.btnClass}`}
                          >
                            <span>Buka Portal</span>
                            <Search className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <a
                            href={formatExternalUrl(link.url)}
                            target={formatExternalUrl(link.url) !== '#' ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              if (formatExternalUrl(link.url) === '#') {
                                e.preventDefault();
                                showToast('Pautan portal ini belum diisi atau sedang dikemas kini.');
                              }
                            }}
                            className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition ${catMeta.btnClass}`}
                          >
                            <span>Buka Portal</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => handleCopy(formatExternalUrl(link.url), link.id)}
                          title="Salin Pautan URL"
                          className={`p-2.5 rounded-2xl text-xs font-bold border transition flex items-center justify-center ${
                            isCopied
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border-white/10'
                          }`}
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4 text-slate-950" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white">
                  {editingLink ? 'Sunting Pautan Guru' : 'Tambah Pautan Guru Baharu'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tajuk Portal / Sistem *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Cth: IDME KPM / e-RPH Skrip"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-red-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Bahagian Portfolio *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as 'kurikulum' | 'hem' | 'kokurikulum' | 'umum'
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-red-400"
                  >
                    <option value="kurikulum">1. Kurikulum</option>
                    <option value="hem">2. Hal Ehwal Murid</option>
                    <option value="kokurikulum">3. Kokurikulum</option>
                    <option value="umum">4. Umum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Lencana / Label Ringkas
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="Cth: PBD, APDM, HRMIS"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-red-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Pautan URL Penuh *
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://idme.moe.gov.my"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-red-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Penerangan & Kegunaan
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Penerangan ringkas mengenai kegunaan portal ini..."
                  className="w-full px-3.5 py-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-red-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black shadow-lg shadow-red-950/50 transition flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Pautan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Search & Directory Portal Modal */}
      <StudentSearchPortalModal
        isOpen={isStudentSearchPortalOpen}
        onClose={() => setIsStudentSearchPortalOpen(false)}
      />
    </div>
  );
};
