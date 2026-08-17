import React, { useState } from 'react';
import { SignageSlide, SignageConfig, SchoolProfile } from '../../types';
import {
  Tv,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  X,
  Upload,
  ArrowUp,
  ArrowDown,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  Save,
  Megaphone,
  Layers,
  Sliders,
  Maximize2
} from 'lucide-react';
import { compressAndResizeImage, formatGoogleDriveUrl } from '../../utils/imageHelpers';

interface AdminSignageManagerProps {
  profile: SchoolProfile;
  slides: SignageSlide[];
  onSaveSlides: (slides: SignageSlide[]) => void;
  config: SignageConfig;
  onSaveConfig: (config: SignageConfig) => void;
  showToast: (msg: string) => void;
}

export const AdminSignageManager: React.FC<AdminSignageManagerProps> = ({
  profile,
  slides,
  onSaveSlides,
  config,
  onSaveConfig,
  showToast
}) => {
  // Form State for Adding New Slide
  const [newSlide, setNewSlide] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    durationSeconds: config.defaultDuration || 8,
    category: 'pengumuman' as 'pengumuman' | 'aktiviti' | 'kejayaan' | 'info' | 'poster',
    isActive: true
  });

  // Editing State
  const [editingSlide, setEditingSlide] = useState<SignageSlide | null>(null);

  // Config Form State
  const [editConfig, setEditConfig] = useState<SignageConfig>({ ...config });

  // Add Slide Handler
  const handleAddSlideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlide.title || !newSlide.imageUrl) {
      showToast('Sila masukkan sekurang-kurangnya tajuk dan URL gambar.');
      return;
    }

    const created: SignageSlide = {
      id: 'signage-slide-' + Date.now(),
      title: newSlide.title,
      subtitle: newSlide.subtitle,
      imageUrl: newSlide.imageUrl,
      durationSeconds: Number(newSlide.durationSeconds) || 8,
      category: newSlide.category,
      isActive: newSlide.isActive,
      order: slides.length + 1,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [...slides, created];
    onSaveSlides(updated);

    setNewSlide({
      title: '',
      subtitle: '',
      imageUrl: '',
      durationSeconds: config.defaultDuration || 8,
      category: 'pengumuman',
      isActive: true
    });

    showToast('✨ Slaid Digital Signage Baharu Berjaya Ditambah!');
  };

  // Update Slide Handler
  const handleUpdateSlideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    const updated = slides.map((s) => (s.id === editingSlide.id ? editingSlide : s));
    onSaveSlides(updated);
    setEditingSlide(null);
    showToast('✅ Maklumat Slaid Berjaya Dikemas Kini!');
  };

  // Delete Slide Handler
  const handleDeleteSlide = (id: string) => {
    if (!window.confirm('Adakah anda pasti mahu memadam slaid ini?')) return;
    const updated = slides.filter((s) => s.id !== id);
    onSaveSlides(updated);
    showToast('🗑️ Slaid Berjaya Dipadam!');
  };

  // Toggle Active/Inactive
  const handleToggleActive = (id: string) => {
    const updated = slides.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s));
    onSaveSlides(updated);
    showToast('Status Slaid Dikemas Kini!');
  };

  // Reorder Up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const list = [...slides];
    const temp = list[index - 1];
    list[index - 1] = list[index];
    list[index] = temp;
    // Re-index order
    const updated = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    onSaveSlides(updated);
    showToast('Susunan Slaid Dikemas Kini!');
  };

  // Reorder Down
  const handleMoveDown = (index: number) => {
    if (index === slides.length - 1) return;
    const list = [...slides];
    const temp = list[index + 1];
    list[index + 1] = list[index];
    list[index] = temp;
    // Re-index order
    const updated = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    onSaveSlides(updated);
    showToast('Susunan Slaid Dikemas Kini!');
  };

  // Save Config Handler
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(editConfig);
    showToast('⚙️ Tetapan Paparan Digital Signage Berjaya Disimpan!');
  };

  const activeCount = slides.filter((s) => s.isActive).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Quick Controls */}
      <div className="bg-gradient-to-r from-blue-900/90 via-slate-900/90 to-amber-950/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-yellow-400 text-blue-950 flex items-center justify-center shadow-lg shadow-yellow-400/20 flex-shrink-0">
            <Tv className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-blue-950">
                Pengurusan Smart TV
              </span>
              <span className="text-xs text-yellow-300 font-bold">
                {activeCount} Slaid Aktif daripada {slides.length}
              </span>
            </div>
            <h3 className="text-2xl font-black text-white mt-1">
              Pengurusan Digital Signage & Smart TV
            </h3>
            <p className="text-xs text-slate-300">
              Urus poster pengumuman, jadual masa pertukaran slaid (saat), teks berita marquee langsung, dan paparan skrin TV.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/tv.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-blue-950 font-black rounded-xl text-xs flex items-center gap-2 transition border border-yellow-300 shadow-xl shadow-yellow-400/20"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Buka 'tv.html' Khas TV</span>
          </a>
        </div>
      </div>

      {/* Global TV Display Settings */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl text-white space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h4 className="font-extrabold text-sm text-yellow-400 flex items-center gap-2">
            <Sliders className="w-4 h-4" /> Tetapan Global Paparan Smart TV
          </h4>
          <span className="text-[11px] text-slate-300">Disegerakkan secara real-time ke skrin TV</span>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Masa Pertukaran Slaid Lalai (Saat)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="3"
                  max="120"
                  required
                  value={editConfig.defaultDuration}
                  onChange={(e) =>
                    setEditConfig({ ...editConfig, defaultDuration: Number(e.target.value) || 8 })
                  }
                  className="w-full text-xs px-3.5 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50 font-mono font-bold"
                />
                <span className="text-xs font-bold text-yellow-400">saat</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editConfig.showClock}
                  onChange={(e) => setEditConfig({ ...editConfig, showClock: e.target.checked })}
                  className="w-4 h-4 rounded text-yellow-400 focus:ring-0 cursor-pointer"
                />
                <span>Papar Jam & Tarikh Live</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editConfig.showMarquee}
                  onChange={(e) => setEditConfig({ ...editConfig, showMarquee: e.target.checked })}
                  className="w-4 h-4 rounded text-yellow-400 focus:ring-0 cursor-pointer"
                />
                <span>Papar Teks Berita Marquee</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Teks Berita Bergerak (Running Marquee Ticker)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={editConfig.marqueeText}
                onChange={(e) => setEditConfig({ ...editConfig, marqueeText: e.target.value })}
                placeholder="Teks pengumuman yang akan bergerak di bahagian bawah skrin..."
                className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition flex-shrink-0 shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Tetapan</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Add New Slide Form */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl text-white space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h4 className="font-extrabold text-sm text-yellow-400 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tambah Slaid / Poster Smart TV Baharu
          </h4>
          <span className="text-[11px] text-slate-300">Format gambar 16:9 disyorkan (1920x1080)</span>
        </div>

        <form onSubmit={handleAddSlideSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Tajuk Slaid *</label>
              <input
                type="text"
                required
                value={newSlide.title}
                onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                placeholder="Contoh: Kejohanan Sukan Tahunan SK Merbau Pulas..."
                className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Kategori Slaid</label>
              <select
                value={newSlide.category}
                onChange={(e) => setNewSlide({ ...newSlide, category: e.target.value as any })}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-900 border border-white/20 text-white rounded-xl font-medium"
              >
                <option value="pengumuman">Pengumuman Rasmi</option>
                <option value="aktiviti">Aktiviti & Program Sekolah</option>
                <option value="kejayaan">Kejayaan & Anugerah Murid</option>
                <option value="info">Info Pentadbiran & Kokurikulum</option>
                <option value="poster">Poster & Hebahan Khas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Keterangan / Sub-tajuk Ringkas (Pilihan)
            </label>
            <input
              type="text"
              value={newSlide.subtitle}
              onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
              placeholder="Contoh: Tarikh: 24 Ogos 2026 | Tempat: Padang Utama SKMP"
              className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                URL Gambar Slaid / Poster *
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={newSlide.imageUrl}
                  onChange={(e) => setNewSlide({ ...newSlide, imageUrl: e.target.value })}
                  placeholder="https://... atau pautan Google Drive"
                  className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl font-mono"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const compressed = await compressAndResizeImage(file, 1920, 1080, 0.85);
                          setNewSlide({ ...newSlide, imageUrl: compressed });
                        } catch {
                          const r = new FileReader();
                          r.onloadend = () =>
                            setNewSlide({ ...newSlide, imageUrl: r.result as string });
                          r.readAsDataURL(file);
                        }
                      }
                    }}
                    className="block w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-yellow-400 file:text-blue-950 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Tempoh Paparan Slaid Ini (Saat) *
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="3"
                    max="120"
                    required
                    value={newSlide.durationSeconds}
                    onChange={(e) =>
                      setNewSlide({ ...newSlide, durationSeconds: Number(e.target.value) || 8 })
                    }
                    className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50 font-mono font-bold"
                  />
                  <span className="text-xs font-bold text-yellow-400">saat</span>
                </div>
                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[5, 8, 10, 15, 20, 30].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setNewSlide({ ...newSlide, durationSeconds: s })}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition ${
                        newSlide.durationSeconds === s
                          ? 'bg-yellow-400 text-blue-950 border-yellow-300 font-black'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {s}s
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={newSlide.isActive}
                onChange={(e) => setNewSlide({ ...newSlide, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-yellow-400 focus:ring-0 cursor-pointer"
              />
              <span>Aktifkan serta-merta pada siaran Smart TV</span>
            </label>

            <button
              type="submit"
              className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs flex items-center gap-2 transition shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Slaid Baharu</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Slide Cards List */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl text-white space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h4 className="font-extrabold text-sm text-yellow-400 flex items-center gap-2">
            <Layers className="w-4 h-4" /> Senarai Slaid Semasa ({slides.length} Slaid)
          </h4>
          <span className="text-[11px] text-slate-300">
            Gunakan butang &uarr; dan &darr; untuk menukar giliran urutan slaid
          </span>
        </div>

        {slides.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Tiada slaid didaftarkan. Sila tambah slaid pertama anda di atas.
          </div>
        ) : (
          <div className="space-y-3">
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  slide.isActive
                    ? 'bg-slate-900/80 border-white/20 shadow-md'
                    : 'bg-slate-950/50 border-white/10 opacity-60'
                }`}
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start sm:items-center gap-4 flex-grow">
                  <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
                    <span className="text-[11px] font-mono font-bold text-yellow-400">
                      #{idx + 1}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="p-1 rounded bg-white/10 hover:bg-yellow-400 hover:text-blue-950 text-slate-300 disabled:opacity-30 transition"
                        title="Naikkan urutan"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === slides.length - 1}
                        className="p-1 rounded bg-white/10 hover:bg-yellow-400 hover:text-blue-950 text-slate-300 disabled:opacity-30 transition"
                        title="Turunkan urutan"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <img
                    src={formatGoogleDriveUrl(slide.imageUrl)}
                    alt={slide.title}
                    className="w-24 h-16 sm:w-28 sm:h-18 object-cover rounded-xl border border-white/15 bg-slate-950 flex-shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=300';
                    }}
                  />

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-yellow-400 text-blue-950">
                        {slide.category || 'Pengumuman'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-yellow-300 border border-white/10 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> {slide.durationSeconds || config.defaultDuration || 8}s
                      </span>
                      {slide.isActive ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-400">
                          Nyahaktif
                        </span>
                      )}
                    </div>

                    <h5 className="font-bold text-white text-sm leading-tight">{slide.title}</h5>
                    {slide.subtitle && (
                      <p className="text-xs text-slate-300 line-clamp-1">{slide.subtitle}</p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0 border-white/10">
                  <button
                    onClick={() => handleToggleActive(slide.id)}
                    className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      slide.isActive
                        ? 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/10 hover:bg-white/20 text-slate-300'
                    }`}
                    title={slide.isActive ? 'Nyahaktifkan Slaid' : 'Aktifkan Slaid'}
                  >
                    {slide.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setEditingSlide({ ...slide })}
                    className="p-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 text-xs font-bold transition"
                    title="Sunting Slaid"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="p-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/30 text-xs font-bold transition"
                    title="Padam Slaid"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Slide Modal */}
      {editingSlide && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-extrabold text-sm text-yellow-400 flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Sunting Slaid Smart TV
              </h4>
              <button
                onClick={() => setEditingSlide(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSlideSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Tajuk Slaid *</label>
                <input
                  type="text"
                  required
                  value={editingSlide.title}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Kategori</label>
                <select
                  value={editingSlide.category || 'pengumuman'}
                  onChange={(e) =>
                    setEditingSlide({ ...editingSlide, category: e.target.value as any })
                  }
                  className="w-full text-xs px-3.5 py-2 bg-slate-950 border border-white/20 text-white rounded-xl font-medium"
                >
                  <option value="pengumuman">Pengumuman Rasmi</option>
                  <option value="aktiviti">Aktiviti & Program Sekolah</option>
                  <option value="kejayaan">Kejayaan & Anugerah Murid</option>
                  <option value="info">Info Pentadbiran & Kokurikulum</option>
                  <option value="poster">Poster & Hebahan Khas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Keterangan Ringkas</label>
                <input
                  type="text"
                  value={editingSlide.subtitle || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">URL Gambar Slaid *</label>
                <input
                  type="text"
                  required
                  value={editingSlide.imageUrl}
                  onChange={(e) => setEditingSlide({ ...editingSlide, imageUrl: e.target.value })}
                  className="w-full text-xs px-3.5 py-2 bg-white/5 border border-white/20 text-white rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Durasi Paparan (Saat) *
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="120"
                    required
                    value={editingSlide.durationSeconds}
                    onChange={(e) =>
                      setEditingSlide({
                        ...editingSlide,
                        durationSeconds: Number(e.target.value) || 8
                      })
                    }
                    className="w-full text-xs px-3.5 py-2 bg-white/5 border border-white/20 text-white rounded-xl font-mono font-bold"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingSlide.isActive}
                      onChange={(e) =>
                        setEditingSlide({ ...editingSlide, isActive: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-yellow-400 focus:ring-0 cursor-pointer"
                    />
                    <span>Slaid Aktif</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-200 font-bold rounded-xl text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs transition shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
