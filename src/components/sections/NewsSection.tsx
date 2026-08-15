import React, { useState } from 'react';
import { NewsItem } from '../../types';
import { Newspaper, Search, Clock, User, Eye, Tag, Pin, ArrowRight, X, Share2 } from 'lucide-react';
import { getSafeNewsImageUrl, SECONDARY_FALLBACK_PHOTOS } from '../../utils/imageHelpers';

interface NewsSectionProps {
  newsList: NewsItem[];
  selectedNewsItem: NewsItem | null;
  onSelectNewsItem: (item: NewsItem | null) => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({
  newsList,
  selectedNewsItem,
  onSelectNewsItem
}) => {
  const [activeCategory, setActiveCategory] = useState<'semua' | 'pengumuman' | 'aktiviti' | 'pekeliling'>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNews = newsList.filter((n) => {
    const matchesCategory = activeCategory === 'semua' || n.category === activeCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Banner */}
      <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-xs border border-yellow-400/30 mb-2">
          <Newspaper className="w-3.5 h-3.5 text-yellow-400" />
          <span>Papan Kenyataan Digital</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Berita & Pekeliling Terkini</h2>
        <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
          Aktiviti sekolah, pekeliling rasmi Kementerian Pendidikan Malaysia, dan pengumuman am untuk guru, ibu bapa, dan murid SKMP.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {[
            { id: 'semua', label: 'Semua Berita' },
            { id: 'pengumuman', label: 'Pengumuman Rasmi' },
            { id: 'aktiviti', label: 'Aktiviti Sekolah' },
            { id: 'pekeliling', label: 'Pekeliling KPM' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeCategory === tab.id
                  ? 'bg-yellow-400 text-blue-950 font-black shadow-lg shadow-yellow-400/20'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
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
        {filteredNews.map((news) => (
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

      {/* Detailed News Reader Modal */}
      {selectedNewsItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
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
              <p>{selectedNewsItem.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
