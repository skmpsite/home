import React, { useState, useMemo } from 'react';
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  EyeOff,
  Clock,
  User,
  X,
  ExternalLink,
  Sparkles,
  BookmarkCheck,
  Pin,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  FileText,
  Megaphone
} from 'lucide-react';
import { NewsItem, UserRole } from '../../types';
import { getSafeNewsImageUrl, SECONDARY_FALLBACK_PHOTOS } from '../../utils/imageHelpers';

export interface UnitNewsSectionProps {
  unit: 'kurikulum' | 'hem' | 'kokurikulum';
  unitTitle: string;
  unitSubtitle?: string;
  newsList: NewsItem[];
  onSaveNews: (news: NewsItem[]) => void;
  canEdit: boolean;
  managerRoleLabel?: string;
  onOpenLogin?: () => void;
}

export const UnitNewsSection: React.FC<UnitNewsSectionProps> = ({
  unit,
  unitTitle,
  unitSubtitle,
  newsList,
  onSaveNews,
  canEdit,
  managerRoleLabel,
  onOpenLogin
}) => {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [readingItem, setReadingItem] = useState<NewsItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'semua' | 'pengumuman' | 'aktiviti' | 'pekeliling' | 'home'>('semua');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // Unit display labels and colors
  const unitConfig = useMemo(() => {
    switch (unit) {
      case 'kurikulum':
        return {
          label: 'Kurikulum',
          badgeText: 'Unit Kurikulum',
          authorDefault: 'Unit Kurikulum SKMP',
          badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
          accentColor: 'from-blue-600 to-indigo-600',
          btnColor: 'bg-yellow-400 hover:bg-yellow-300 text-blue-950',
          borderColor: 'border-blue-500/30',
          lightAccent: 'text-blue-400'
        };
      case 'hem':
        return {
          label: 'HEM',
          badgeText: 'Unit HEM',
          authorDefault: 'Unit HEM SKMP',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
          accentColor: 'from-emerald-600 to-teal-600',
          btnColor: 'bg-emerald-400 hover:bg-emerald-300 text-slate-950',
          borderColor: 'border-emerald-500/30',
          lightAccent: 'text-emerald-400'
        };
      case 'kokurikulum':
        return {
          label: 'Kokurikulum',
          badgeText: 'Unit Kokurikulum',
          authorDefault: 'Unit Kokurikulum SKMP',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
          accentColor: 'from-amber-600 to-orange-600',
          btnColor: 'bg-amber-400 hover:bg-amber-300 text-slate-950',
          borderColor: 'border-amber-500/30',
          lightAccent: 'text-amber-400'
        };
    }
  }, [unit]);

  // Filter news belonging to this unit
  const unitNews = useMemo(() => {
    return (newsList || []).filter((item) => {
      if (item.unitScope) {
        return item.unitScope === unit;
      }
      // Fallback matching by author
      const author = (item.author || '').toLowerCase();
      if (unit === 'kurikulum') return author.includes('kurikulum') || author.includes('pentadbiran');
      if (unit === 'hem') return author.includes('hem');
      if (unit === 'kokurikulum') return author.includes('koku') || author.includes('sukan');
      return false;
    });
  }, [newsList, unit]);

  // Filtered news based on sub-filter
  const displayedNews = useMemo(() => {
    let list = [...unitNews];
    if (selectedFilter === 'home') {
      list = list.filter((n) => n.showOnHome !== false);
    } else if (selectedFilter !== 'semua') {
      list = list.filter((n) => n.category === selectedFilter);
    }
    // Sort pinned to top, then by date/id descending
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [unitNews, selectedFilter]);

  const homeCount = useMemo(() => {
    return unitNews.filter((n) => n.showOnHome !== false).length;
  }, [unitNews]);

  // Toggle show on home checkbox directly from card
  const handleToggleShowOnHome = (id: string, nextShow: boolean) => {
    if (!canEdit) return;
    const updated = (newsList || []).map((n) => {
      if (n.id === id) {
        return {
          ...n,
          showOnHome: nextShow,
          unitScope: unit
        };
      }
      return n;
    });
    onSaveNews(updated);
    showNotification(
      nextShow
        ? `Berita telah ditandakan untuk dipaparkan di Menu Utama (Berita & Pengumuman Sekolah)!`
        : `Berita dialih keluar daripada paparan Menu Utama.`
    );
  };

  // Toggle isPinned
  const handleTogglePin = (id: string) => {
    if (!canEdit) return;
    const updated = (newsList || []).map((n) => {
      if (n.id === id) {
        return { ...n, isPinned: !n.isPinned };
      }
      return n;
    });
    onSaveNews(updated);
    showNotification('Status keutamaan berita dikemas kini!');
  };

  // Open modal for new item
  const handleOpenAdd = () => {
    const todayStr = new Date().toLocaleDateString('ms-MY', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const defaultImages = {
      kurikulum: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
      hem: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
      kokurikulum: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800'
    };

    setEditingItem({
      id: `news-${unit}-${Date.now()}`,
      title: '',
      date: todayStr,
      category: 'pengumuman',
      summary: '',
      content: '',
      imageUrl: defaultImages[unit],
      author: unitConfig.authorDefault,
      isPinned: true,
      views: 1,
      showOnHome: true,
      unitScope: unit
    });
    setIsNew(true);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (item: NewsItem) => {
    setEditingItem({ ...item, unitScope: unit });
    setIsNew(false);
    setIsModalOpen(true);
  };

  // Save item from modal
  const handleSaveItem = (itemToSave: NewsItem) => {
    let updatedList: NewsItem[];
    const exists = (newsList || []).some((n) => n.id === itemToSave.id);
    if (exists) {
      updatedList = (newsList || []).map((n) => (n.id === itemToSave.id ? itemToSave : n));
      showNotification(`Berita "${itemToSave.title}" berjaya dikemas kini!`);
    } else {
      updatedList = [itemToSave, ...(newsList || [])];
      showNotification(`Berita baharu "${itemToSave.title}" berjaya diterbitkan!`);
    }
    onSaveNews(updatedList);
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    const updatedList = (newsList || []).filter((n) => n.id !== id);
    onSaveNews(updatedList);
    setDeleteConfirmId(null);
    showNotification('Berita telah berjaya dipadam.');
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {statusMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-400/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{statusMsg}</span>
        </div>
      )}

      {/* Main Container Header */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${unitConfig.accentColor} text-white flex items-center justify-center font-black shadow-lg flex-shrink-0`}
            >
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${unitConfig.badgeClass}`}>
                  {unitConfig.badgeText}
                </span>
                <span className="text-[10px] font-bold text-yellow-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                  {unitNews.length} Berita • {homeCount} di Menu Utama
                </span>
                {canEdit && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Akses Sunting Aktif
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">{unitTitle}</h3>
              <p className="text-xs text-slate-300 font-medium">
                {unitSubtitle || 'Hebahan program rasmi, pekeliling semasa, dan makluman penting unit.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto justify-end">
            {canEdit ? (
              <button
                type="button"
                onClick={handleOpenAdd}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-lg ${unitConfig.btnColor}`}
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Berita / Pengumuman</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-slate-300 border border-white/15 transition flex items-center gap-1.5"
                title="Log masuk untuk menambah atau menyunting pengumuman"
              >
                <User className="w-3.5 h-3.5 text-yellow-400" />
                <span>Log Masuk Pengurus</span>
              </button>
            )}
          </div>
        </div>

        {/* Informational Banner about Menu Utama synchronization */}
        <div className="bg-gradient-to-r from-blue-950/60 via-slate-900/60 to-purple-950/60 border border-white/10 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-slate-300">
          <BookmarkCheck className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-white block">
              Penyelarasan Automatik ke Menu Utama Sekolah:
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Tandakan kotak <strong className="text-emerald-300">"Papar di Menu Utama"</strong> pada mana-mana berita di bawah. Apabila ditandakan oleh Admin, Penolong Kanan, atau SU, pengumuman tersebut akan muncul serta-merta di halaman hadapan pada bahagian <strong>Berita & Pengumuman Sekolah</strong> dengan labelan <span className="font-bold text-yellow-300">"{unitConfig.label}"</span>.
            </p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Tapis Paparan:</span>
          <button
            type="button"
            onClick={() => setSelectedFilter('semua')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedFilter === 'semua'
                ? 'bg-yellow-400 text-blue-950 font-black shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            Semua ({unitNews.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('home')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedFilter === 'home'
                ? 'bg-emerald-400 text-slate-950 font-black shadow-md'
                : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-400/30'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Di Menu Utama ({homeCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('pengumuman')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedFilter === 'pengumuman'
                ? 'bg-blue-500 text-white font-black shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            Pengumuman
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('aktiviti')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedFilter === 'aktiviti'
                ? 'bg-purple-500 text-white font-black shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            Aktiviti
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('pekeliling')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedFilter === 'pekeliling'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            Pekeliling
          </button>
        </div>
      </div>

      {/* Announcements Cards Grid */}
      {displayedNews.length === 0 ? (
        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/10 p-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-slate-400">
            <Megaphone className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-white">Tiada Berita / Pengumuman Ditemui</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {selectedFilter !== 'semua'
              ? 'Tiada rekod bagi kategori yang dipilih. Sila pilih kategori "Semua" untuk melihat kesemua hebahan unit ini.'
              : `Belum ada pengumuman diterbitkan untuk Unit ${unitConfig.label}.`}
          </p>
          {canEdit && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenAdd}
                className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-lg transition inline-flex items-center gap-2 cursor-pointer ${unitConfig.btnColor}`}
              >
                <Plus className="w-4 h-4" />
                <span>Terbitkan Pengumuman Pertama</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedNews.map((news) => {
            const isTickedForHome = news.showOnHome !== false;

            return (
              <div
                key={news.id}
                className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-white/15 overflow-hidden shadow-xl hover:border-yellow-400/50 hover:shadow-2xl transition flex flex-col justify-between group"
              >
                <div>
                  {/* Card Banner Image */}
                  <div className="h-44 relative overflow-hidden bg-slate-950">
                    <img
                      src={getSafeNewsImageUrl(news.imageUrl, news.category, news.id)}
                      alt={news.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src =
                          SECONDARY_FALLBACK_PHOTOS[news.category] || SECONDARY_FALLBACK_PHOTOS.default;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />

                    {/* Category & Pin badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-1 bg-slate-950/90 backdrop-blur-md text-yellow-300 font-black rounded-lg text-[10px] uppercase tracking-wider border border-white/20">
                        {news.category}
                      </span>
                      {news.isPinned && (
                        <span className="px-2 py-1 bg-amber-500/90 backdrop-blur-md text-slate-950 font-black rounded-lg text-[10px] uppercase flex items-center gap-1">
                          <Pin className="w-3 h-3" />
                          <span>Pin</span>
                        </span>
                      )}
                    </div>

                    {/* Unit Scope Tag */}
                    <span className="absolute bottom-3 right-3 px-2.5 py-0.5 bg-slate-950/80 backdrop-blur-md text-white font-bold rounded-md text-[10px] border border-white/20">
                      Unit {unitConfig.label}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
                      <Clock className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                      <span>{news.date}</span>
                      <span>•</span>
                      <span className="truncate">{news.author}</span>
                    </div>

                    <h4 className="font-extrabold text-sm sm:text-base text-white group-hover:text-yellow-300 transition line-clamp-2 leading-snug">
                      {news.title}
                    </h4>

                    <p className="text-xs text-slate-300 line-clamp-3 font-normal leading-relaxed">
                      {news.summary || news.content}
                    </p>

                    {/* Interactive Checkbox for Menu Utama Display */}
                    <div
                      className={`mt-2 p-2.5 rounded-2xl border transition ${
                        isTickedForHome
                          ? 'bg-emerald-950/40 border-emerald-500/40'
                          : 'bg-slate-950/60 border-white/10'
                      }`}
                    >
                      <label
                        className={`flex items-center justify-between gap-2 text-xs select-none ${
                          canEdit ? 'cursor-pointer' : 'cursor-default'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isTickedForHome}
                            disabled={!canEdit}
                            onChange={(e) => handleToggleShowOnHome(news.id, e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span
                            className={`font-bold text-[11px] flex items-center gap-1.5 ${
                              isTickedForHome ? 'text-emerald-300' : 'text-slate-400'
                            }`}
                          >
                            {isTickedForHome ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Papar di Menu Utama</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                                <span>Hanya di {unitConfig.label}</span>
                              </>
                            )}
                          </span>
                        </div>

                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            isTickedForHome
                              ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
                              : 'bg-white/5 text-slate-400 border border-white/10'
                          }`}
                        >
                          {isTickedForHome ? `Aktif di Utama` : 'Tidak Dipapar'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setReadingItem(news)}
                    className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition py-1 cursor-pointer"
                  >
                    <span>Baca Penuh</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  {canEdit && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTogglePin(news.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          news.isPinned
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                            : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'
                        }`}
                        title={news.isPinned ? 'Nyahpin daripada teratas' : 'Sematkan ke teratas'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(news)}
                        className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30 transition"
                        title="Sunting Pengumuman"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(news.id)}
                        className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/30 transition"
                        title="Padam Pengumuman"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Tambah / Sunting Pengumuman */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${unitConfig.accentColor} text-white flex items-center justify-center`}
                >
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${unitConfig.badgeClass}`}>
                    Unit {unitConfig.label}
                  </span>
                  <h3 className="font-extrabold text-white text-base sm:text-lg">
                    {isNew ? `Tambah Berita & Pengumuman ${unitConfig.label}` : `Sunting Berita & Pengumuman`}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingItem.title.trim()) return;
                handleSaveItem(editingItem);
              }}
              className="space-y-4 text-xs"
            >
              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Tajuk Berita / Pengumuman *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder={`Contoh: Kejohanan / Taklimat / Pekeliling ${unitConfig.label}`}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Date, Category, Author */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Tarikh Paparan *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.date}
                    onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                    placeholder="Contoh: 10 Ogos 2026"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Kategori</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
                  >
                    <option value="pengumuman">Pengumuman</option>
                    <option value="aktiviti">Aktiviti</option>
                    <option value="pekeliling">Pekeliling</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Penulis / Unit</label>
                  <input
                    type="text"
                    value={editingItem.author}
                    onChange={(e) => setEditingItem({ ...editingItem, author: e.target.value })}
                    placeholder={unitConfig.authorDefault}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Ringkasan / Sedutan (Muncul pada kad) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingItem.summary}
                  onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value })}
                  placeholder="Ringkasan ringkas hebahan untuk paparan pada kad pengumuman..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Full Content */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Kandungan Penuh Berita / Makluman
                </label>
                <textarea
                  rows={4}
                  value={editingItem.content}
                  onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                  placeholder="Kandungan terperinci makluman, arahan, masa, tempat, atau pautan berkaitan..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 leading-relaxed"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Pautan Gambar / Poster (URL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={editingItem.imageUrl}
                    onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-yellow-400"
                  />
                  {editingItem.imageUrl && (
                    <img
                      src={editingItem.imageUrl}
                      alt="Pratonton"
                      className="w-10 h-10 rounded-xl object-cover border border-white/20 flex-shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* CRITICAL CHECKBOX: Siarkan di Menu Utama */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/50 border-2 border-emerald-500/40 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingItem.showOnHome !== false}
                    onChange={(e) => setEditingItem({ ...editingItem, showOnHome: e.target.checked })}
                    className="w-5 h-5 rounded text-emerald-500 accent-emerald-500 focus:ring-emerald-500 mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="font-black text-sm text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Paparkan di Menu Utama (Berita & Pengumuman Sekolah)</span>
                    </span>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      Apabila ditandakan, pengumuman ini akan dipaparkan secara rasmi di halaman hadapan/Menu Utama sekolah di bawah bahagian <strong>"Berita & Pengumuman Sekolah"</strong> lengkap dengan labelan <strong>"{unitConfig.label}"</strong>.
                    </p>
                  </div>
                </label>
              </div>

              {/* Pin Checkbox */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingItem.isPinned}
                    onChange={(e) => setEditingItem({ ...editingItem, isPinned: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-400 accent-amber-400 cursor-pointer"
                  />
                  <span>Sematkan ke Kedudukan Teratas (Pin Announcement)</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl font-black transition shadow-lg ${unitConfig.btnColor}`}
                >
                  {isNew ? 'Terbitkan Pengumuman' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Baca Artikel / Pengumuman Penuh */}
      {readingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${unitConfig.badgeClass}`}>
                  Unit {unitConfig.label}
                </span>
                <span className="text-[10px] font-bold text-yellow-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/10 uppercase">
                  {readingItem.category}
                </span>
                {readingItem.showOnHome !== false && (
                  <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Menu Utama
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setReadingItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {readingItem.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-slate-400 pb-2 border-b border-white/10">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  {readingItem.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-yellow-400" />
                  {readingItem.author}
                </span>
              </div>

              {/* Photo */}
              <div className="rounded-2xl overflow-hidden max-h-72 border border-white/10">
                <img
                  src={getSafeNewsImageUrl(readingItem.imageUrl, readingItem.category, readingItem.id)}
                  alt={readingItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {readingItem.summary && (
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm font-semibold text-yellow-200 leading-relaxed italic">
                  "{readingItem.summary}"
                </div>
              )}

              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line space-y-3">
                {readingItem.content || readingItem.summary}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Status paparan: {readingItem.showOnHome !== false ? 'Aktif di Menu Utama & Bahagian Unit' : 'Hanya dipaparkan dalam unit'}
              </span>
              <button
                type="button"
                onClick={() => setReadingItem(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-white text-base">Padam Pengumuman Ini?</h4>
              <p className="text-xs text-slate-300">
                Tindakan ini akan memadam pengumuman ini secara kekal daripada unit dan Menu Utama.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteItem(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs transition shadow-lg"
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
