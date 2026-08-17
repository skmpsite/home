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
  Maximize2,
  Video,
  Image as ImageIcon,
  Youtube,
  Play,
  Volume2,
  VolumeX,
  Film,
  Info
} from 'lucide-react';
import { compressAndResizeImage, formatGoogleDriveUrl } from '../../utils/imageHelpers';
import {
  extractYouTubeId,
  isYouTubeUrl,
  isVideoUrl,
  detectMediaType,
  getYouTubeThumbnail,
  getYouTubeHqThumbnail,
  getVideoDurationFromFile,
  getVideoDurationFromUrl,
  formatMediaDuration
} from '../../utils/signageMediaHelpers';

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
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'youtube'>('image');
  const [newSlide, setNewSlide] = useState<{
    title: string;
    subtitle: string;
    mediaType: 'image' | 'video' | 'youtube';
    imageUrl: string;
    videoUrl: string;
    youtubeUrl: string;
    durationSeconds: number;
    useVideoDuration: boolean;
    isMuted: boolean;
    category: 'pengumuman' | 'aktiviti' | 'kejayaan' | 'info' | 'poster' | 'video' | 'khas';
    isActive: boolean;
  }>({
    title: '',
    subtitle: '',
    mediaType: 'image',
    imageUrl: '',
    videoUrl: '',
    youtubeUrl: '',
    durationSeconds: config.defaultDuration || 8,
    useVideoDuration: true,
    isMuted: false,
    category: 'pengumuman',
    isActive: true
  });

  // Editing State
  const [editingSlide, setEditingSlide] = useState<SignageSlide | null>(null);

  // Config Form State
  const [editConfig, setEditConfig] = useState<SignageConfig>({ ...config });

  // Handle YouTube URL change and auto-extract info
  const handleNewYouTubeChange = (val: string) => {
    const yid = extractYouTubeId(val);
    const thumb = yid ? getYouTubeThumbnail(yid) : newSlide.imageUrl;
    setNewSlide((prev) => ({
      ...prev,
      youtubeUrl: val,
      imageUrl: thumb || prev.imageUrl
    }));
  };

  const handleEditYouTubeChange = (val: string) => {
    if (!editingSlide) return;
    const yid = extractYouTubeId(val);
    const thumb = yid ? getYouTubeThumbnail(yid) : editingSlide.imageUrl;
    setEditingSlide({
      ...editingSlide,
      youtubeUrl: val,
      youtubeId: yid || undefined,
      imageUrl: thumb || editingSlide.imageUrl
    });
  };

  // Add Slide Handler
  const handleAddSlideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlide.title) {
      showToast('Sila masukkan sekurang-kurangnya tajuk slaid.');
      return;
    }

    let finalImageUrl = newSlide.imageUrl;
    let finalVideoUrl = newSlide.videoUrl;
    let finalYoutubeUrl = newSlide.youtubeUrl;
    let finalYoutubeId: string | undefined;

    if (mediaType === 'youtube') {
      const yid = extractYouTubeId(newSlide.youtubeUrl);
      if (!yid) {
        showToast('Pautan video YouTube tidak sah. Sila masukkan pautan YouTube yang lengkap.');
        return;
      }
      finalYoutubeId = yid;
      finalYoutubeUrl = newSlide.youtubeUrl;
      if (!finalImageUrl) {
        finalImageUrl = getYouTubeThumbnail(yid);
      }
    } else if (mediaType === 'video') {
      if (!finalVideoUrl) {
        showToast('Sila masukkan URL video atau muat naik fail video.');
        return;
      }
      if (!finalImageUrl) {
        finalImageUrl = 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80&w=1920';
      }
    } else {
      // Image
      if (!finalImageUrl) {
        showToast('Sila masukkan URL gambar atau muat naik fail poster.');
        return;
      }
    }

    const created: SignageSlide = {
      id: 'signage-slide-' + Date.now(),
      title: newSlide.title,
      subtitle: newSlide.subtitle,
      mediaType: mediaType,
      imageUrl: finalImageUrl,
      videoUrl: finalVideoUrl,
      youtubeUrl: finalYoutubeUrl,
      youtubeId: finalYoutubeId,
      durationSeconds: Number(newSlide.durationSeconds) || config.defaultDuration || 8,
      useVideoDuration: mediaType !== 'image' ? newSlide.useVideoDuration : false,
      isMuted: newSlide.isMuted,
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
      mediaType: 'image',
      imageUrl: '',
      videoUrl: '',
      youtubeUrl: '',
      durationSeconds: config.defaultDuration || 8,
      useVideoDuration: true,
      isMuted: false,
      category: 'pengumuman',
      isActive: true
    });
    setMediaType('image');

    showToast('✨ Slaid Signage Baharu Berjaya Ditambah!');
  };

  // Update Slide Handler
  const handleUpdateSlideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    let finalSlide = { ...editingSlide };
    if (finalSlide.mediaType === 'youtube' && finalSlide.youtubeUrl) {
      const yid = extractYouTubeId(finalSlide.youtubeUrl);
      if (yid) {
        finalSlide.youtubeId = yid;
        if (!finalSlide.imageUrl || finalSlide.imageUrl.includes('unsplash.com')) {
          finalSlide.imageUrl = getYouTubeThumbnail(yid);
        }
      }
    }

    const updated = slides.map((s) => (s.id === finalSlide.id ? finalSlide : s));
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
              Sokongan penuh untuk <strong>Poster Gambar</strong>, <strong>Fail Video (MP4/WebM)</strong>, dan <strong>Video YouTube</strong> dengan durasi video automatik.
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Masa Pertukaran Slaid Lalai (Saat)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="3"
                  max="300"
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

            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editConfig.autoEnableAudio !== false}
                  onChange={(e) => setEditConfig({ ...editConfig, autoEnableAudio: e.target.checked })}
                  className="w-4 h-4 rounded text-yellow-400 focus:ring-0 cursor-pointer"
                />
                <span className="text-yellow-300 font-bold flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5" /> Audio Video Auto-On
                </span>
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
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl text-white space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h4 className="font-extrabold text-sm text-yellow-400 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tambah Slaid / Video Smart TV Baharu
          </h4>
          <span className="text-[11px] text-slate-300">Pilih jenis media di bawah</span>
        </div>

        {/* Media Type Selector Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-950/60 border border-white/15 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setMediaType('image');
              setNewSlide((p) => ({ ...p, mediaType: 'image', category: p.category === 'video' ? 'pengumuman' : p.category }));
            }}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              mediaType === 'image'
                ? 'bg-yellow-400 text-blue-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Gambar / Poster</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMediaType('video');
              setNewSlide((p) => ({ ...p, mediaType: 'video', category: 'video', useVideoDuration: true }));
            }}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              mediaType === 'video'
                ? 'bg-yellow-400 text-blue-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Fail Video (MP4/WebM)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMediaType('youtube');
              setNewSlide((p) => ({ ...p, mediaType: 'youtube', category: 'video', durationSeconds: 30 }));
            }}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              mediaType === 'youtube'
                ? 'bg-yellow-400 text-blue-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Youtube className="w-4 h-4 text-rose-500" />
            <span>Video YouTube</span>
          </button>
        </div>

        <form onSubmit={handleAddSlideSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Tajuk Slaid / Video *</label>
              <input
                type="text"
                required
                value={newSlide.title}
                onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                placeholder={
                  mediaType === 'youtube'
                    ? 'Contoh: Montaj Pelancaran Bulan Kemerdekaan...'
                    : mediaType === 'video'
                    ? 'Contoh: Klip Video Aktiviti Hari Sukan SKMP...'
                    : 'Contoh: Hebahan Kejohanan Sukan Tahunan SKMP...'
                }
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
                <option value="video">Video & Montaj Khas</option>
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
              placeholder="Contoh: Saksikan montaj penuh aktiviti kokurikulum dan akademik..."
              className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
            />
          </div>

          {/* MEDIA TYPE: IMAGE */}
          {mediaType === 'image' && (
            <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
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
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-white/20 text-white rounded-xl font-mono"
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
                  Tempoh Paparan Gambar (Saat) *
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="3"
                      max="300"
                      required
                      value={newSlide.durationSeconds}
                      onChange={(e) =>
                        setNewSlide({ ...newSlide, durationSeconds: Number(e.target.value) || 8 })
                      }
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50 font-mono font-bold"
                    />
                    <span className="text-xs font-bold text-yellow-400">saat</span>
                  </div>
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
          )}

          {/* MEDIA TYPE: VIDEO FILE */}
          {mediaType === 'video' && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3.5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    URL Fail Video (MP4 / WebM / Google Drive) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSlide.videoUrl}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setNewSlide({ ...newSlide, videoUrl: val });
                      if (val.startsWith('http')) {
                        const dur = await getVideoDurationFromUrl(val);
                        if (dur > 0) {
                          setNewSlide((prev) => ({ ...prev, videoUrl: val, durationSeconds: dur }));
                        }
                      }
                    }}
                    placeholder="https://.../video.mp4 atau pautan video"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-white/20 text-white rounded-xl font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Sokong URL pautan video MP4/WebM atau fail storan awan.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Atau Muat Naik Fail Video (MP4 / WebM)
                  </label>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const dur = await getVideoDurationFromFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewSlide({
                              ...newSlide,
                              videoUrl: reader.result as string,
                              durationSeconds: dur > 0 ? dur : 15,
                              useVideoDuration: true
                            });
                            showToast(`🎥 Fail video dimuatkan (Durasi: ${dur}s)`);
                          };
                          reader.readAsDataURL(file);
                        } catch {
                          showToast('Gagal memproses fail video.');
                        }
                      }
                    }}
                    className="block w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-yellow-400 file:text-blue-950 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSlide.useVideoDuration}
                      onChange={(e) =>
                        setNewSlide({ ...newSlide, useVideoDuration: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-yellow-400 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-yellow-300 font-bold">
                      Main mengikut durasi sebenar video (Auto-advance bila tamat)
                    </span>
                  </label>
                  <p className="text-[10px] text-slate-400">
                    Slaid akan bertukar automatik ke slaid seterusnya sebaik sahaja video selesai dimainkan.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Durasi Khusus / Had Maksimum (Saat)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="3"
                      max="600"
                      value={newSlide.durationSeconds}
                      onChange={(e) =>
                        setNewSlide({
                          ...newSlide,
                          durationSeconds: Number(e.target.value) || 15
                        })
                      }
                      className="w-full text-xs px-3.5 py-2 bg-slate-950 border border-white/20 text-white rounded-xl font-mono font-bold"
                    />
                    <span className="text-xs font-bold text-yellow-400">
                      {formatMediaDuration(newSlide.durationSeconds)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Audio Auto-On Option for Video */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-bold text-yellow-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!newSlide.isMuted}
                    onChange={(e) => setNewSlide({ ...newSlide, isMuted: !e.target.checked })}
                    className="w-4 h-4 rounded text-yellow-400 focus:ring-0 cursor-pointer"
                  />
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    Pasang Audio Video Secara Automatik (Audio Auto-On)
                  </span>
                </label>
                <span className="text-[10px] text-slate-400">
                  {!newSlide.isMuted ? '🔊 Suara Aktif' : '🔇 Bisu'}
                </span>
              </div>
            </div>
          )}

          {/* MEDIA TYPE: YOUTUBE */}
          {mediaType === 'youtube' && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Pautan / URL Video YouTube *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newSlide.youtubeUrl}
                    onChange={(e) => handleNewYouTubeChange(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-white/20 text-white rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Menyokong pautan standard YouTube, perkongsian youtu.be, Shorts, dan ID video.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Tempoh Paparan / Had Siling (Saat) *
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="600"
                        required
                        value={newSlide.durationSeconds}
                        onChange={(e) =>
                          setNewSlide({
                            ...newSlide,
                            durationSeconds: Number(e.target.value) || 30
                          })
                        }
                        className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-white/20 text-white rounded-xl font-mono font-bold"
                      />
                      <span className="text-xs font-bold text-yellow-400">
                        {formatMediaDuration(newSlide.durationSeconds)}
                      </span>
                    </div>
                    {/* Presets */}
                    <div className="flex flex-wrap gap-1.5">
                      {[15, 30, 45, 60, 90, 120, 180].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setNewSlide({ ...newSlide, durationSeconds: s })}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition ${
                            newSlide.durationSeconds === s
                              ? 'bg-rose-500 text-white border-rose-400 font-black'
                              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {formatMediaDuration(s)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mini YouTube Preview */}
                <div className="flex items-center justify-center bg-slate-950/80 border border-white/10 rounded-xl p-2 min-h-[90px]">
                  {extractYouTubeId(newSlide.youtubeUrl) ? (
                    <div className="flex items-center gap-3 w-full">
                      <img
                        src={getYouTubeThumbnail(extractYouTubeId(newSlide.youtubeUrl)!)}
                        alt="YouTube Preview"
                        className="w-24 h-14 object-cover rounded-lg border border-white/20 flex-shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-black text-rose-400 flex items-center gap-1">
                          <Youtube className="w-3.5 h-3.5" /> ID: {extractYouTubeId(newSlide.youtubeUrl)}
                        </span>
                        <p className="text-[11px] text-slate-300 font-bold truncate">
                          Video YouTube Siap Disiarkan
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      Pratonton YouTube akan dipaparkan di sini
                    </span>
                  )}
                </div>
              </div>

              {/* Auto Duration and Audio Options for YouTube */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-yellow-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSlide.useVideoDuration !== false}
                    onChange={(e) =>
                      setNewSlide({ ...newSlide, useVideoDuration: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-yellow-400 focus:ring-0 cursor-pointer"
                  />
                  <span>Autokan pertukaran slaid mengikut durasi sebenar video YouTube</span>
                </label>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-yellow-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!newSlide.isMuted}
                      onChange={(e) => setNewSlide({ ...newSlide, isMuted: !e.target.checked })}
                      className="w-4 h-4 rounded text-yellow-400 focus:ring-0 cursor-pointer"
                    />
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-rose-400" />
                      Pasang Audio YouTube Secara Automatik (Audio Auto-On)
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {!newSlide.isMuted ? '🔊 Suara Aktif' : '🔇 Bisu'}
                  </span>
                </div>
              </div>
            </div>
          )}

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
              <span>Tambah Slaid / Video Baharu</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Slide Cards List */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl text-white space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h4 className="font-extrabold text-sm text-yellow-400 flex items-center gap-2">
            <Layers className="w-4 h-4" /> Senarai Slaid & Video Semasa ({slides.length} Item)
          </h4>
          <span className="text-[11px] text-slate-300">
            Gunakan butang &uarr; dan &darr; untuk menukar giliran urutan tayangan
          </span>
        </div>

        {slides.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Tiada slaid didaftarkan. Sila tambah poster atau video pertama anda di atas.
          </div>
        ) : (
          <div className="space-y-3">
            {slides.map((slide, idx) => {
              const detectedType = detectMediaType(slide.videoUrl || slide.youtubeUrl || slide.imageUrl, slide.mediaType);
              const isYt = detectedType === 'youtube' || !!slide.youtubeId || !!slide.youtubeUrl;
              const isVid = detectedType === 'video' || !!slide.videoUrl;

              return (
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

                    <div className="relative w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden border border-white/15 bg-slate-950 flex-shrink-0 group">
                      <img
                        src={
                          isYt && slide.youtubeId
                            ? getYouTubeThumbnail(slide.youtubeId)
                            : formatGoogleDriveUrl(slide.imageUrl)
                        }
                        alt={slide.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=300';
                        }}
                      />
                      {(isVid || isYt) && (
                        <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg ${isYt ? 'bg-rose-600 text-white' : 'bg-yellow-400 text-blue-950'}`}>
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Media Type Badge */}
                        {isYt ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-600 text-white flex items-center gap-1">
                            <Youtube className="w-3 h-3" /> YouTube
                          </span>
                        ) : isVid ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-600 text-white flex items-center gap-1">
                            <Film className="w-3 h-3" /> Video
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-yellow-400 text-blue-950 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" /> Poster
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300 border border-white/10">
                          {slide.category || 'Pengumuman'}
                        </span>

                        {/* Duration Badge */}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-yellow-300 border border-white/10 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {isVid && slide.useVideoDuration
                            ? `Durasi Video (${slide.durationSeconds || 15}s)`
                            : `${slide.durationSeconds || config.defaultDuration || 8}s`}
                        </span>

                        {/* Audio Status Badge for Video/YouTube */}
                        {(isVid || isYt) && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${
                              !slide.isMuted
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-white/10 text-slate-400 border-white/10'
                            }`}
                          >
                            {!slide.isMuted ? (
                              <>
                                <Volume2 className="w-3 h-3 text-emerald-400" />
                                <span>Audio On</span>
                              </>
                            ) : (
                              <>
                                <VolumeX className="w-3 h-3" />
                                <span>Bisu</span>
                              </>
                            )}
                          </span>
                        )}

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
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Slide Modal */}
      {editingSlide && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full text-white space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-extrabold text-sm text-yellow-400 flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Sunting Slaid / Video Smart TV
              </h4>
              <button
                onClick={() => setEditingSlide(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Media Type Switcher */}
            <div className="flex gap-2 p-1 bg-slate-950 border border-white/10 rounded-xl">
              <button
                type="button"
                onClick={() => setEditingSlide({ ...editingSlide, mediaType: 'image' })}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                  (editingSlide.mediaType || 'image') === 'image'
                    ? 'bg-yellow-400 text-blue-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Gambar
              </button>
              <button
                type="button"
                onClick={() => setEditingSlide({ ...editingSlide, mediaType: 'video', category: 'video' })}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                  editingSlide.mediaType === 'video'
                    ? 'bg-yellow-400 text-blue-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Video MP4
              </button>
              <button
                type="button"
                onClick={() => setEditingSlide({ ...editingSlide, mediaType: 'youtube', category: 'video' })}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition ${
                  editingSlide.mediaType === 'youtube'
                    ? 'bg-rose-600 text-white font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                YouTube
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
                  <option value="video">Video & Montaj Khas</option>
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

              {/* YouTube Link Field if YouTube */}
              {editingSlide.mediaType === 'youtube' && (
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Pautan Video YouTube *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSlide.youtubeUrl || ''}
                    onChange={(e) => handleEditYouTubeChange(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full text-xs px-3.5 py-2 bg-white/5 border border-white/20 text-white rounded-xl font-mono"
                  />
                </div>
              )}

              {/* Video URL Field if Video */}
              {editingSlide.mediaType === 'video' && (
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    URL Fail Video (MP4 / WebM) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSlide.videoUrl || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, videoUrl: e.target.value })}
                    placeholder="https://.../video.mp4"
                    className="w-full text-xs px-3.5 py-2 bg-white/5 border border-white/20 text-white rounded-xl font-mono"
                  />
                </div>
              )}

              {/* Image / Thumbnail URL */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  {editingSlide.mediaType === 'image' ? 'URL Gambar Slaid *' : 'URL Thumbnail / Poster (Pilihan)'}
                </label>
                <input
                  type="text"
                  required={editingSlide.mediaType === 'image'}
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
                    max="600"
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

              {(editingSlide.mediaType === 'video' || editingSlide.mediaType === 'youtube') && (
                <label className="flex items-center gap-2 text-xs font-bold text-yellow-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={editingSlide.useVideoDuration !== false}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, useVideoDuration: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-yellow-400 focus:ring-0 cursor-pointer"
                  />
                  <span>Tukar automatik mengikut durasi sebenar video (Auto-Advance)</span>
                </label>
              )}

              {(editingSlide.mediaType === 'video' || editingSlide.mediaType === 'youtube') && (
                <label className="flex items-center gap-2 text-xs font-bold text-yellow-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={!editingSlide.isMuted}
                    onChange={(e) =>
                      setEditingSlide({ ...editingSlide, isMuted: !e.target.checked })
                    }
                    className="w-4 h-4 rounded text-yellow-400 focus:ring-0 cursor-pointer"
                  />
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    Pasang Audio Secara Automatik (Audio Auto-On)
                  </span>
                </label>
              )}

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
