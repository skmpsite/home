import React, { useState, useMemo, useEffect } from 'react';
import { CoCurriculumUnit, SchoolProfile, Staff } from '../../types';
import { Trophy, Shield, Heart, Award, Cpu, BookOpen, Target, Clock, User, Sparkles, UserCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { formatGoogleDriveUrl } from '../../utils/imageHelpers';
import { findPkKokurikulumStaff } from '../../utils/staffHelpers';

interface CokurriculumSectionProps {
  units: CoCurriculumUnit[];
  profile?: SchoolProfile;
  staffList?: Staff[];
}

export const CokurriculumSection: React.FC<CokurriculumSectionProps> = ({ units, profile, staffList }) => {
  const [activeCategory, setActiveCategory] = useState<'semua' | 'beruniform' | 'kelab' | 'sukan'>('semua');
  const [showDesc, setShowDesc] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDesc(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Ambil maklumat Penolong Kanan Kokurikulum mengikut Barisan Pentadbir Utama
  const pkKokurikulumStaff = useMemo(() => {
    if (staffList && staffList.length > 0) {
      return findPkKokurikulumStaff(staffList, profile);
    }
    return undefined;
  }, [staffList, profile]);

  const pkKokoName = pkKokurikulumStaff?.name || "Puan Siti Hajar binti Abdul Rahman";
  const pkKokoTitle = pkKokurikulumStaff?.position || "Guru Penolong Kanan Kokurikulum (PK Koko)";
  const pkKokoGrade = pkKokurikulumStaff?.grade || "DG44";
  const pkKokoInfo = pkKokurikulumStaff?.grade
    ? (pkKokurikulumStaff.grade.startsWith('DG') ? `Pegawai Perkhidmatan Pendidikan (${pkKokurikulumStaff.grade})` : `Gred ${pkKokurikulumStaff.grade}`)
    : "Pegawai Perkhidmatan Pendidikan (DG44)";

  const pkKokoPhoto = useMemo(() => {
    if (pkKokurikulumStaff?.photoUrl && pkKokurikulumStaff.photoUrl.trim() !== '') {
      return formatGoogleDriveUrl(pkKokurikulumStaff.photoUrl);
    }
    return '';
  }, [pkKokurikulumStaff]);

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
      <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-xs border border-yellow-400/30 mb-2">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>Aktiviti Luar Bilik Darjah</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Aktiviti Kokurikulum & Pembangunan Bakat</h2>

            {/* Collapsible Info with 5-second auto-hide & simple arrow toggle */}
            <div className="mt-1 max-w-2xl">
              <div
                className={`transition-all duration-500 overflow-hidden ${
                  showDesc ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pb-1">
                  Penglibatan murid dalam Badan Beruniform, Kelab & Persatuan, serta Sukan & Permainan bagi memupuk jati diri, kepimpinan, dan daya saing.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDesc(!showDesc)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-yellow-300 hover:text-yellow-200 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition mt-1 border border-white/10"
                title={showDesc ? "Sembunyikan penerangan" : "Baca penerangan penuh"}
              >
                <span>{showDesc ? "Sembunyikan Info" : "Info Kokurikulum"}</span>
                {showDesc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* PK Kokurikulum Profile Mini-Card with Picture, Position, Name & Info */}
          <div className="bg-slate-900/85 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/20 flex items-center gap-4 flex-shrink-0 shadow-xl hover:border-yellow-400/50 transition">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-yellow-400 p-0.5 shadow-md overflow-hidden border-2 border-yellow-300 flex items-center justify-center flex-shrink-0">
              {pkKokoPhoto && pkKokoPhoto.trim() !== '' ? (
                <img
                  src={pkKokoPhoto}
                  alt={pkKokoName}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    const fallback = parent?.querySelector('.fallback-pkkoko-icon');
                    if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                  }}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : null}
              <div
                className={`fallback-pkkoko-icon w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-yellow-300 ${
                  pkKokoPhoto && pkKokoPhoto.trim() !== '' ? 'hidden' : 'flex'
                }`}
              >
                <UserCheck className="w-8 h-8 opacity-80" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
                  {pkKokoTitle}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-950 text-yellow-300 border border-white/20">
                  {pkKokoGrade}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                {pkKokoName}
              </h4>
              <p className="text-xs text-slate-300 font-medium">
                {pkKokoInfo}
              </p>
            </div>
          </div>
        </div>
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
