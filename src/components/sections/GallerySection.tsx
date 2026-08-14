import React, { useState } from 'react';
import { GalleryItem } from '../../types';
import { Image as ImageIcon, Video, Eye, Filter, X, Calendar } from 'lucide-react';

interface GallerySectionProps {
  galleryItems: GalleryItem[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ galleryItems }) => {
  const [activeCategory, setActiveCategory] = useState<'semua' | 'sukan' | 'akademik' | 'kokurikulum' | 'majlis'>('semua');
  const [selectedLightboxItem, setSelectedLightboxItem] = useState<GalleryItem | null>(null);

  const filteredItems = galleryItems.filter(
    (item) => activeCategory === 'semua' || item.category === activeCategory
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Banner */}
      <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-xs border border-yellow-400/30 mb-2">
          <ImageIcon className="w-3.5 h-3.5 text-yellow-400" />
          <span>Lensa Kenangan SKMP</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Galeri Media Foto & Video</h2>
        <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
          Koleksi foto dan paparan video kejohanan sukan, majlis sambutan rasmi, perkhemahan, dan program komuniti SK Merbau Pulas.
        </p>
      </div>

      {/* Category Pills */}
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
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeCategory === tab.id
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
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedLightboxItem(item)}
            className="group relative bg-slate-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer aspect-video border border-white/10 hover:border-yellow-400/50"
          >
            <img
              src={item.url}
              alt={item.title}
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

      {/* Lightbox Modal */}
      {selectedLightboxItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl max-w-3xl w-full p-6 text-white border border-white/20 relative space-y-4 shadow-2xl">
            <button
              onClick={() => setSelectedLightboxItem(null)}
              className="absolute top-4 right-4 text-slate-300 hover:text-white bg-white/10 p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="rounded-2xl overflow-hidden bg-black max-h-[60vh] flex items-center justify-center border border-white/10">
              <img
                src={selectedLightboxItem.url}
                alt={selectedLightboxItem.title}
                className="max-h-[60vh] w-auto object-contain"
              />
            </div>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 bg-yellow-400 text-blue-950 font-black rounded text-[10px] uppercase">
                {selectedLightboxItem.category}
              </span>
              <h3 className="font-extrabold text-lg text-white mt-1">
                {selectedLightboxItem.title}
              </h3>
              <p className="text-xs text-slate-300">{selectedLightboxItem.caption}</p>
              <p className="text-[11px] text-slate-400 pt-2 border-t border-white/10 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-yellow-400" /> {selectedLightboxItem.date}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
