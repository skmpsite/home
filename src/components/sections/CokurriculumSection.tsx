import React, { useState } from 'react';
import { CoCurriculumUnit } from '../../types';
import { Trophy, Shield, Heart, Award, Cpu, BookOpen, Target, Clock, User, Sparkles } from 'lucide-react';

interface CokurriculumSectionProps {
  units: CoCurriculumUnit[];
}

export const CokurriculumSection: React.FC<CokurriculumSectionProps> = ({ units }) => {
  const [activeCategory, setActiveCategory] = useState<'semua' | 'beruniform' | 'kelab' | 'sukan'>('semua');

  const filteredUnits = units.filter(
    (u) => activeCategory === 'semua' || u.category === activeCategory
  );

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'beruniform':
        return 'bg-blue-500/20 text-blue-300 border border-blue-400/30';
      case 'kelab':
        return 'bg-purple-500/20 text-purple-300 border border-purple-400/30';
      case 'sukan':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30';
      default:
        return 'bg-white/10 text-slate-200 border border-white/20';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Banner */}
      <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-xs border border-yellow-400/30 mb-2">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span>Aktiviti Luar Bilik Darjah</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Aktiviti Kokurikulum & Pembangunan Bakat</h2>
        <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
          Penglibatan murid dalam Badan Beruniform, Kelab & Persatuan, serta Sukan & Permainan bagi memupuk jati diri, kepimpinan, dan daya saing.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'semua', label: 'Semua Unit Kokurikulum' },
          { id: 'beruniform', label: 'Badan Beruniform' },
          { id: 'kelab', label: 'Kelab & Persatuan' },
          { id: 'sukan', label: 'Sukan & Permainan' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeCategory === tab.id
                ? 'bg-yellow-400 text-blue-950 font-black shadow-lg shadow-yellow-400/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Units Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUnits.map((unit) => (
          <div
            key={unit.id}
            className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg hover:shadow-xl transition flex flex-col justify-between space-y-4 group hover:border-yellow-400/50"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg ${getCategoryBadge(
                    unit.category
                  )}`}
                >
                  {unit.category === 'beruniform'
                    ? 'Badan Beruniform'
                    : unit.category === 'kelab'
                    ? 'Kelab & Persatuan'
                    : 'Sukan & Permainan'}
                </span>
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>

              <h3 className="font-extrabold text-base text-white group-hover:text-yellow-300 transition">
                {unit.name}
              </h3>

              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                {unit.description}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <User className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span>
                  <strong>Guru Penasihat:</strong> {unit.advisorTeacher}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span>
                  <strong>Masa Perjumpaan:</strong> {unit.meetingTime}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
