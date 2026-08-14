import React, { useState } from 'react';
import { AwardItem } from '../../types';
import { Award, Trophy, Medal, Star, Sparkles, ShieldCheck } from 'lucide-react';

interface AwardsSectionProps {
  awards: AwardItem[];
}

export const AwardsSection: React.FC<AwardsSectionProps> = ({ awards }) => {
  const [selectedCategory, setSelectedCategory] = useState<'semua' | 'daerah' | 'negeri' | 'kebangsaan' | 'antarabangsa'>('semua');

  const filteredAwards = awards.filter(
    (a) => selectedCategory === 'semua' || a.category === selectedCategory
  );

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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Banner */}
      <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-xs border border-yellow-400/30 mb-2">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span>Dewan Gemilang SKMP</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Ruang Anugerah & Pencapaian Gemilang</h2>
        <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
          Pengikhtirafan kejayaan murid, guru, dan sekolah di peringkat Daerah Kulim/Bandar Baharu, Negeri Kedah, Kebangsaan, serta Antarabangsa.
        </p>
      </div>

      {/* Category Pills */}
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
            onClick={() => setSelectedCategory(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedCategory === tab.id
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
        {filteredAwards.map((award) => (
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
                <span className="font-mono text-xs font-bold text-yellow-300 bg-yellow-500/20 px-2 py-0.5 rounded border border-yellow-400/30">
                  {award.year}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-yellow-400 p-0.5 shadow flex-shrink-0">
                  <img
                    src={award.badgeUrl}
                    alt={award.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white group-hover:text-yellow-300 transition line-clamp-2">
                    {award.title}
                  </h3>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs text-yellow-300 font-bold flex items-center gap-2">
                <Medal className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span>{award.achievement}</span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                {award.description}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 text-[11px] text-slate-300 font-semibold">
              🏆 Penerima: <span className="text-white font-bold">{award.recipient}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
