import React, { useState, useEffect } from 'react';
import {
  NewsItem,
  GalleryItem,
  AwardItem,
  DownloadDocument,
  SystemLink,
  PibgActivity,
  PibgCommittee
} from '../../types';
import {
  initialGalleryItems,
  initialAwardsList,
  initialDownloadDocs,
  initialSystemLinks,
  initialPibgActivities,
  initialPibgCommittee
} from '../../data/initialData';
import {
  Newspaper,
  Image as ImageIcon,
  Search,
  Clock,
  User,
  Pin,
  ArrowRight,
  X,
  Video,
  Sparkles,
  Layers,
  ChevronRight,
  Award,
  Trophy,
  Medal,
  Download,
  ExternalLink,
  FileText,
  Users,
  CheckCircle2,
  Globe,
  BookOpen,
  UserCheck,
  BarChart3,
  FileSpreadsheet,
  Building2,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  FolderDown,
  Calendar
} from 'lucide-react';
import { getSafeNewsImageUrl, SECONDARY_FALLBACK_PHOTOS } from '../../utils/imageHelpers';

export interface NewsSectionProps {
  newsList: NewsItem[];
  galleryItems?: GalleryItem[];
  awards?: AwardItem[];
  documents?: DownloadDocument[];
  systemLinks?: SystemLink[];
  pibgActivities?: PibgActivity[];
  pibgCommittee?: PibgCommittee[];
  selectedNewsItem: NewsItem | null;
  onSelectNewsItem: (item: NewsItem | null) => void;
  initialSubTab?: 'semua' | 'berita' | 'galeri' | 'anugerah' | 'portal';
}

export const NewsSection: React.FC<NewsSectionProps> = ({
  newsList,
  galleryItems = initialGalleryItems,
  awards = initialAwardsList,
  documents = initialDownloadDocs,
  systemLinks = initialSystemLinks,
  pibgActivities = initialPibgActivities,
  pibgCommittee = initialPibgCommittee,
  selectedNewsItem,
  onSelectNewsItem,
  initialSubTab = 'semua'
}) => {
  // Main view switcher: semua | berita | galeri | anugerah | portal
  const [mainView, setMainView] = useState<'semua' | 'berita' | 'galeri' | 'anugerah' | 'portal'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setMainView(initialSubTab);
    }
  }, [initialSubTab]);

  // News category filter & search
  const [newsCategory, setNewsCategory] = useState<'semua' | 'pengumuman' | 'aktiviti' | 'pekeliling'>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Gallery category filter & lightbox
  const [galleryCategory, setGalleryCategory] = useState<'semua' | 'sukan' | 'akademik' | 'kokurikulum' | 'majlis'>('semua');
  const [selectedLightboxItem, setSelectedLightboxItem] = useState<GalleryItem | null>(null);

  // Awards category filter
  const [awardCategory, setAwardCategory] = useState<'semua' | 'daerah' | 'negeri' | 'kebangsaan' | 'antarabangsa'>('semua');

  // Portal & Muat Turun sub-tabs
  const [portalSubTab, setPortalSubTab] = useState<'sistem' | 'dokumen' | 'pibg'>('sistem');
  const [docSearch, setDocSearch] = useState('');
  const [docCategory, setDocCategory] = useState<string>('semua');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Filtered News
  const filteredNews = newsList.filter((n) => {
    const matchesCategory = newsCategory === 'semua' || n.category === newsCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filtered Gallery
  const filteredGallery = galleryItems.filter(
    (item) => galleryCategory === 'semua' || item.category === galleryCategory
  );

  // Filtered Awards
  const filteredAwards = awards.filter(
    (a) => awardCategory === 'semua' || a.category === awardCategory
  );

  // Filtered Documents
  const filteredDocs = documents.filter((d) => {
    const matchesCat = docCategory === 'semua' || d.category === docCategory;
    const matchesSearch =
      d.title.toLowerCase().includes(docSearch.toLowerCase()) ||
      d.description.toLowerCase().includes(docSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSimulateDownload = (doc: DownloadDocument) => {
    const content = `SEKOLAH KEBANGSAAN MERBAU PULAS (KBA5012)\n====================================\nDOKUMEN RASMI: ${doc.title}\nKategori: ${doc.category}\nTarikh: ${doc.date}\nPenerangan: ${doc.description}\n\nDokumen ini disahkan oleh Pentadbiran SK Merbau Pulas.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, '_')}.${doc.fileType.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadToast(`Dokumen "${doc.title}" berjaya dimuat turun!`);
    setTimeout(() => {
      setDownloadToast(null);
    }, 4000);
  };

  const getPeringkatBadge = (cat: string) => {
    switch (cat) {
      case 'antarabangsa':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'kebangsaan':
        return 'bg-yellow-400 text-blue-950 font-black border-yellow-300';
      case 'negeri':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
    }
  };

  const getSystemIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return BookOpen;
      case 'UserCheck':
        return UserCheck;
      case 'Users':
        return Users;
      case 'BarChart3':
        return BarChart3;
      case 'FileSpreadsheet':
        return FileSpreadsheet;
      case 'Globe':
        return Globe;
      default:
        return ExternalLink;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-xs font-bold">{downloadToast}</span>
        </div>
      )}

      {/* Main Banner Header */}
      <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-xs border border-yellow-400/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Pusat Maklumat, Media & Capaian Rasmi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Umum</h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-3xl leading-relaxed">
            Saluran bersepadu warga SK Merbau Pulas bagi hebahan berita terkini, pekeliling KPM, arkib lensa galeri foto & video, dewan anugerah & kejayaan gemilang, serta portal sistem dan pusat muat turun dokumen rasmi.
          </p>

          {/* Primary View Switcher Pills */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => setMainView('semua')}
              className={`px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
                mainView === 'semua'
                  ? 'bg-yellow-400 text-blue-950 shadow-lg shadow-yellow-400/20 scale-105'
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Semua Paparan</span>
            </button>

            <button
              onClick={() => setMainView('berita')}
              className={`px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
                mainView === 'berita'
                  ? 'bg-yellow-400 text-blue-950 shadow-lg shadow-yellow-400/20 scale-105'
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>Berita & Pekeliling ({newsList.length})</span>
            </button>

            <button
              onClick={() => setMainView('galeri')}
              className={`px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
                mainView === 'galeri'
                  ? 'bg-yellow-400 text-blue-950 shadow-lg shadow-yellow-400/20 scale-105'
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Galeri Media ({galleryItems.length})</span>
            </button>

            <button
              onClick={() => setMainView('anugerah')}
              className={`px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
                mainView === 'anugerah'
                  ? 'bg-yellow-400 text-blue-950 shadow-lg shadow-yellow-400/20 scale-105'
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Ruang Anugerah ({awards.length})</span>
            </button>

            <button
              onClick={() => setMainView('portal')}
              className={`px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
                mainView === 'portal'
                  ? 'bg-yellow-400 text-blue-950 shadow-lg shadow-yellow-400/20 scale-105'
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Portal & Muat Turun ({documents.length + systemLinks.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: BERITA & PEKELILING */}
      {(mainView === 'berita' || mainView === 'semua') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg sm:text-xl font-black text-white">Berita, Hebahan & Pekeliling Rasmi</h3>
            </div>
            {mainView === 'semua' && (
              <button
                onClick={() => setMainView('berita')}
                className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition"
              >
                <span>Lihat Semua Berita ({newsList.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter & Search for News */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {[
                { id: 'semua', label: 'Semua Berita' },
                { id: 'pengumuman', label: 'Pengumuman Rasmi' },
                { id: 'aktiviti', label: 'Aktiviti Sekolah' },
                { id: 'pekeliling', label: 'Pekeliling KPM' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setNewsCategory(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    newsCategory === tab.id
                      ? 'bg-yellow-400 text-blue-950 font-black shadow-lg shadow-yellow-400/20'
                      : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari kata kunci berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-white/5 border border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              />
            </div>
          </div>

          {/* News Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(mainView === 'semua' ? filteredNews.slice(0, 3) : filteredNews).map((news) => (
              <div
                key={news.id}
                onClick={() => onSelectNewsItem(news)}
                className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-lg hover:shadow-xl transition cursor-pointer group flex flex-col justify-between hover:border-yellow-400/50"
              >
                <div>
                  <div className="h-48 overflow-hidden relative bg-slate-900/50">
                    <img
                      src={getSafeNewsImageUrl(news.imageUrl, news.category, news.id)}
                      alt={news.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = SECONDARY_FALLBACK_PHOTOS[news.category] || SECONDARY_FALLBACK_PHOTOS.default;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-blue-950/90 text-yellow-300 font-bold rounded-lg text-[10px] uppercase border border-white/20">
                      {news.category}
                    </span>
                    {news.isPinned && (
                      <span className="absolute top-3 right-3 px-2 py-1 bg-yellow-400 text-blue-950 font-black rounded-lg text-[10px] flex items-center gap-1 shadow">
                        <Pin className="w-3 h-3 fill-current" /> Pinned
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
                      <Clock className="w-3 h-3 text-yellow-400" />
                      <span>{news.date}</span>
                      <span>•</span>
                      <User className="w-3 h-3 text-yellow-400" />
                      <span>{news.author}</span>
                    </div>

                    <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-yellow-300 transition leading-snug line-clamp-2">
                      {news.title}
                    </h3>

                    <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed font-normal">
                      {news.summary}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between text-xs font-bold text-yellow-400 group-hover:text-yellow-300">
                  <span>Baca Artikel Lengkap</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

          {filteredNews.length === 0 && (
            <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10 text-slate-300">
              <Newspaper className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-50" />
              <p className="text-sm font-semibold">Tiada berita ditemui bagi carian atau kategori ini.</p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: GALERI MEDIA (FOTO & VIDEO) */}
      {(mainView === 'galeri' || mainView === 'semua') && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg sm:text-xl font-black text-white">Galeri Media Foto & Video Aktiviti</h3>
            </div>
            {mainView === 'semua' && (
              <button
                onClick={() => setMainView('galeri')}
                className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition"
              >
                <span>Lihat Semua Galeri ({galleryItems.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Pills for Gallery */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'semua', label: 'Semua Media' },
              { id: 'sukan', label: 'Kejohanan Sukan' },
              { id: 'akademik', label: 'Program Akademik' },
              { id: 'kokurikulum', label: 'Aktiviti Kokurikulum' },
              { id: 'majlis', label: 'Majlis & Perhimpunan' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setGalleryCategory(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  galleryCategory === tab.id
                    ? 'bg-yellow-400 text-blue-950 font-black shadow-lg shadow-yellow-400/20'
                    : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(mainView === 'semua' ? filteredGallery.slice(0, 4) : filteredGallery).map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedLightboxItem(item)}
                className="group relative bg-slate-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer aspect-video border border-white/10 hover:border-yellow-400/50"
              >
                <img
                  src={item.url}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=600';
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition p-4 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-bold text-yellow-300 uppercase">
                    {item.category}
                  </span>
                  <h4 className="font-extrabold text-xs line-clamp-1">{item.title}</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">{item.date}</p>
                </div>
                <div className="absolute top-2 right-2 p-1.5 bg-slate-950/80 text-white rounded-lg backdrop-blur-md">
                  {item.type === 'video' ? <Video className="w-3.5 h-3.5 text-yellow-400" /> : <ImageIcon className="w-3.5 h-3.5" />}
                </div>
              </div>
            ))}
          </div>

          {filteredGallery.length === 0 && (
            <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10 text-slate-300">
              <ImageIcon className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-50" />
              <p className="text-sm font-semibold">Tiada gambar atau video ditemui bagi kategori ini.</p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: RUANG ANUGERAH & PENCAPAIAN */}
      {(mainView === 'anugerah' || mainView === 'semua') && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg sm:text-xl font-black text-white">Ruang Anugerah & Pencapaian Gemilang</h3>
            </div>
            {mainView === 'semua' && (
              <button
                onClick={() => setMainView('anugerah')}
                className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition"
              >
                <span>Lihat Semua Anugerah ({awards.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Pills for Awards */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'semua', label: 'Semua Anugerah' },
              { id: 'daerah', label: 'Peringkat Daerah' },
              { id: 'negeri', label: 'Peringkat Negeri' },
              { id: 'kebangsaan', label: 'Peringkat Kebangsaan' },
              { id: 'antarabangsa', label: 'Antarabangsa' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAwardCategory(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  awardCategory === tab.id
                    ? 'bg-yellow-400 text-blue-950 font-black shadow-lg shadow-yellow-400/20'
                    : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Awards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(mainView === 'semua' ? filteredAwards.slice(0, 3) : filteredAwards).map((award) => (
              <div
                key={award.id}
                className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg hover:shadow-xl transition flex flex-col justify-between space-y-4 group hover:border-yellow-400/50"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-lg border ${getPeringkatBadge(
                        award.category
                      )}`}
                    >
                      Peringkat {award.category}
                    </span>
                    <span className="text-xs font-bold text-yellow-300 bg-yellow-400/10 px-2 py-0.5 rounded-md border border-yellow-400/20">
                      Tahun {award.year}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-white group-hover:text-yellow-300 transition leading-snug">
                    {award.title}
                  </h3>

                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1 text-xs">
                    <p className="text-yellow-300 font-bold flex items-center gap-1.5">
                      <Medal className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span>{award.achievement}</span>
                    </p>
                    <p className="text-slate-300 font-medium">Penerima: {award.recipient}</p>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-light">
                    {award.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                  <span>Rekod Rasmi Pencapaian Sekolah</span>
                </div>
              </div>
            ))}
          </div>

          {filteredAwards.length === 0 && (
            <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10 text-slate-300">
              <Trophy className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-50" />
              <p className="text-sm font-semibold">Tiada rekod anugerah bagi kategori ini.</p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: PORTAL & MUAT TURUN */}
      {(mainView === 'portal' || mainView === 'semua') && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg sm:text-xl font-black text-white">Portal KPM, Muat Turun & Maklumat PIBG</h3>
            </div>
            {mainView === 'semua' && (
              <button
                onClick={() => setMainView('portal')}
                className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition"
              >
                <span>Lihat Semua Portal & Dokumen</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sub Switcher for Portal Section */}
          <div className="flex flex-wrap items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 w-fit">
            <button
              onClick={() => setPortalSubTab('sistem')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                portalSubTab === 'sistem'
                  ? 'bg-yellow-400 text-blue-950 font-black shadow-md shadow-yellow-400/20'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Portal & Sistem KPM ({systemLinks.length})</span>
            </button>

            <button
              onClick={() => setPortalSubTab('dokumen')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                portalSubTab === 'dokumen'
                  ? 'bg-yellow-400 text-blue-950 font-black shadow-md shadow-yellow-400/20'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Borang & Dokumen Rasmi ({documents.length})</span>
            </button>

            <button
              onClick={() => setPortalSubTab('pibg')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                portalSubTab === 'pibg'
                  ? 'bg-yellow-400 text-blue-950 font-black shadow-md shadow-yellow-400/20'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Persatuan Ibu Bapa & Guru (PIBG)</span>
            </button>
          </div>

          {/* PORTAL SUB-TAB 1: SISTEM & PORTAL KPM */}
          {portalSubTab === 'sistem' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {systemLinks.map((link) => {
                const IconComp = getSystemIcon(link.iconName);
                return (
                  <div
                    key={link.id}
                    className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg hover:shadow-xl transition flex flex-col justify-between space-y-4 group hover:border-yellow-400/50"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-yellow-400/20 border border-yellow-300/30 flex items-center justify-center text-yellow-300">
                          <IconComp className="w-6 h-6" />
                        </div>
                        {link.badge && (
                          <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-lg bg-yellow-400 text-blue-950 shadow">
                            {link.badge}
                          </span>
                        )}
                      </div>

                      <h4 className="font-black text-base text-white group-hover:text-yellow-300 transition">
                        {link.name}
                      </h4>

                      <p className="text-xs text-slate-200 leading-relaxed font-light">
                        {link.description}
                      </p>
                    </div>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-white/10 hover:bg-yellow-400 hover:text-blue-950 text-yellow-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 border border-white/15 group-hover:shadow-md"
                    >
                      <span>Akses Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          {/* PORTAL SUB-TAB 2: DOKUMEN & BORANG RASMI */}
          {portalSubTab === 'dokumen' && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {[
                    { id: 'semua', label: 'Semua Dokumen' },
                    { id: 'borang', label: 'Borang Murid' },
                    { id: 'kebenaran', label: 'Surat Kebenaran' },
                    { id: 'takwim', label: 'Takwim & Jadual' },
                    { id: 'pibg', label: 'Dokumen PIBG' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setDocCategory(cat.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                        docCategory === cat.id
                          ? 'bg-yellow-400 text-blue-950 font-black shadow-lg shadow-yellow-400/20'
                          : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cari borang / dokumen..."
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-white/5 border border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-5 shadow-lg hover:border-yellow-400/50 transition flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-yellow-400/20 border border-yellow-300/30 flex items-center justify-center text-yellow-300 flex-shrink-0">
                        <FolderDown className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 flex-grow">
                        <div className="flex items-center gap-2 text-[10px] text-slate-300">
                          <span className="uppercase font-bold text-yellow-300 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                            {doc.fileType} • {doc.fileSize}
                          </span>
                          <span>{doc.date}</span>
                        </div>
                        <h4 className="font-extrabold text-sm text-white leading-snug">
                          {doc.title}
                        </h4>
                        <p className="text-xs text-slate-300 font-light leading-relaxed">
                          {doc.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {doc.downloadsCount} kali dimuat turun
                      </span>
                      <button
                        onClick={() => handleSimulateDownload(doc)}
                        className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Muat Turun</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredDocs.length === 0 && (
                <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10 text-slate-300">
                  <FileText className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-50" />
                  <p className="text-sm font-semibold">Tiada dokumen ditemui bagi carian ini.</p>
                </div>
              )}
            </div>
          )}

          {/* PORTAL SUB-TAB 3: PIBG */}
          {portalSubTab === 'pibg' && (
            <div className="space-y-6">
              {/* PIBG Intro Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-xs border border-yellow-400/30">
                  <Users className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Sinergi Ibu Bapa, Guru & Komuniti</span>
                </div>
                <h3 className="text-xl font-black text-white">Persatuan Ibu Bapa & Guru (PIBG) SK Merbau Pulas</h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                  PIBG SKMP komited menjadi rakan strategik pihak pentadbiran sekolah dalam memacu kejayaan akademik, sahsiah, dan kebajikan murid demi melahirkan generasi cemerlang berakhlak mulia.
                </p>
              </div>

              {/* PIBG Committee & Activities Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Committee */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 space-y-4 shadow-lg">
                  <h4 className="font-extrabold text-base text-yellow-300 flex items-center gap-2 border-b border-white/10 pb-3">
                    <UserCheck className="w-4 h-4 text-yellow-400" />
                    <span>Barisan Jawatankuasa Utama PIBG</span>
                  </h4>
                  <div className="space-y-3">
                    {pibgCommittee.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5"
                      >
                        <div>
                          <h5 className="font-bold text-xs sm:text-sm text-white">{c.name}</h5>
                          <p className="text-[11px] text-yellow-400 font-medium">{c.position}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-slate-300 border border-white/10">
                          {c.category === 'ibu_bapa' ? 'Ibu Bapa' : 'Guru'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activities / Contributions */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 space-y-4 shadow-lg">
                  <h4 className="font-extrabold text-base text-yellow-300 flex items-center gap-2 border-b border-white/10 pb-3">
                    <Building2 className="w-4 h-4 text-yellow-400" />
                    <span>Aktiviti & Sumbangan PIBG</span>
                  </h4>
                  <div className="space-y-3">
                    {pibgActivities.map((act) => (
                      <div
                        key={act.id}
                        className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-yellow-300 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                            {act.type === 'sumbangan' ? 'Dana / Sumbangan' : 'Program / Aktiviti'}
                          </span>
                          <span className="text-slate-300 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-yellow-400" /> {act.date}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs sm:text-sm text-white leading-snug">
                          {act.title}
                        </h5>
                        <p className="text-xs text-slate-300 font-light leading-relaxed">
                          {act.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detailed News Reader Modal */}
      {selectedNewsItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900/90 backdrop-blur-2xl text-slate-100 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-white/20 relative space-y-6">
            <button
              onClick={() => onSelectNewsItem(null)}
              className="absolute top-4 right-4 text-slate-300 hover:text-white bg-white/10 p-2 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3">
              <span className="px-3 py-1 bg-yellow-400 text-blue-950 font-black rounded-full text-xs uppercase">
                {selectedNewsItem.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {selectedNewsItem.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-300 pb-3 border-b border-white/10">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-yellow-400" /> {selectedNewsItem.date}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-yellow-400" /> {selectedNewsItem.author}
                </span>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden max-h-72 bg-slate-900">
              <img
                src={getSafeNewsImageUrl(selectedNewsItem.imageUrl, selectedNewsItem.category, selectedNewsItem.id)}
                alt={selectedNewsItem.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = SECONDARY_FALLBACK_PHOTOS[selectedNewsItem.category] || SECONDARY_FALLBACK_PHOTOS.default;
                }}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="prose max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed space-y-4">
              <p className="font-semibold text-white text-sm bg-white/5 p-4 rounded-2xl border border-white/10">
                {selectedNewsItem.summary}
              </p>
              <p className="whitespace-pre-line">{selectedNewsItem.content}</p>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Lightbox Modal */}
      {selectedLightboxItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl max-w-3xl w-full p-6 text-white border border-white/20 relative space-y-4 shadow-2xl">
            <button
              onClick={() => setSelectedLightboxItem(null)}
              className="absolute top-4 right-4 text-slate-300 hover:text-white bg-white/10 p-2 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="rounded-2xl overflow-hidden bg-black max-h-[60vh] flex items-center justify-center border border-white/10">
              {selectedLightboxItem.type === 'video' ? (
                <div className="w-full aspect-video">
                  <iframe
                    src={selectedLightboxItem.url}
                    title={selectedLightboxItem.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  src={selectedLightboxItem.url}
                  alt={selectedLightboxItem.title}
                  className="max-h-[60vh] w-auto object-contain"
                />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-yellow-300 uppercase px-2 py-0.5 bg-yellow-500/20 rounded border border-yellow-400/30">
                  {selectedLightboxItem.category}
                </span>
                <span className="text-xs text-slate-400">{selectedLightboxItem.date}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">{selectedLightboxItem.title}</h3>
              {selectedLightboxItem.description && (
                <p className="text-xs text-slate-300 leading-relaxed">{selectedLightboxItem.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
