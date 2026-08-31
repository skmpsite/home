import React, { useState, useMemo, useEffect } from 'react';
import { CalendarEvent, SchoolProfile, Staff } from '../../types';
import { GraduationCap, Calendar as CalendarIcon, BookOpen, Layers, CheckCircle, Clock, MapPin, Users, Award, FileText, UserCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { formatGoogleDriveUrl } from '../../utils/imageHelpers';
import { findPkPentadbiranStaff } from '../../utils/staffHelpers';

interface AcademicSectionProps {
  events: CalendarEvent[];
  profile?: SchoolProfile;
  staffList?: Staff[];
}

export const AcademicSection: React.FC<AcademicSectionProps> = ({ events, profile, staffList }) => {
  const [selectedCategory, setSelectedCategory] = useState<'semua' | 'peperiksaan' | 'cuti' | 'acara' | 'pibg'>('semua');
  const [selectedEventModal, setSelectedEventModal] = useState<CalendarEvent | null>(null);
  const [showDesc, setShowDesc] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDesc(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Ambil maklumat Penolong Kanan Pentadbiran / Kurikulum mengikut Barisan Pentadbir Utama
  const pkPentadbiranStaff = useMemo(() => {
    if (staffList && staffList.length > 0) {
      return findPkPentadbiranStaff(staffList, profile);
    }
    return undefined;
  }, [staffList, profile]);

  const pkKurikulumName = pkPentadbiranStaff?.name || "Puan Noraini binti Yusof";
  const pkKurikulumTitle = pkPentadbiranStaff?.position || "Guru Penolong Kanan Pentadbiran (PK 1)";
  const pkKurikulumGrade = pkPentadbiranStaff?.grade || "DG44";
  const pkKurikulumInfo = pkPentadbiranStaff?.grade
    ? (pkPentadbiranStaff.grade.startsWith('DG') ? `Pegawai Perkhidmatan Pendidikan (${pkPentadbiranStaff.grade})` : `Gred ${pkPentadbiranStaff.grade}`)
    : "Pegawai Perkhidmatan Pendidikan (DG44)";

  const pkKurikulumPhoto = useMemo(() => {
    if (pkPentadbiranStaff?.photoUrl && pkPentadbiranStaff.photoUrl.trim() !== '') {
      return formatGoogleDriveUrl(pkPentadbiranStaff.photoUrl);
    }
    return '';
  }, [pkPentadbiranStaff]);

  const filteredEvents = events.filter(
    (e) => selectedCategory === 'semua' || e.category === selectedCategory
  );

  const subjectsList = [
    { name: 'Bahasa Melayu', type: 'Teras', icon: '📖' },
    { name: 'Bahasa Inggeris (DLP)', type: 'Teras Dual-Language', icon: '🇬🇧' },
    { name: 'Matematik', type: 'STEM / Teras', icon: '📐' },
    { name: 'Sains', type: 'STEM / Teras', icon: '🔬' },
    { name: 'Pendidikan Islam / Moral', type: 'Teras', icon: '🌙' },
    { name: 'Bahasa Arab', type: 'Tambahan', icon: '🕌' },
    { name: 'Sejarah', type: 'Teras Tahap 2', icon: '🏛️' },
    { name: 'Reka Bentuk & Teknologi (RBT)', type: 'Kemahiran', icon: '⚙️' },
    { name: 'Pendidikan Seni Visual (PSV)', type: 'Kesenian', icon: '🎨' },
    { name: 'Pendidikan Jasmani & Kesihatan (PJK)', type: 'Aktiviti', icon: '⚽' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Banner */}
      <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-xs border border-yellow-400/30 mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Pengajian & Kurikulum</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Akademik & Takwim Persekolahan</h2>
            
            {/* Collapsible Info with 5-second auto-hide & simple arrow toggle */}
            <div className="mt-1 max-w-2xl">
              <div
                className={`transition-all duration-500 overflow-hidden ${
                  showDesc ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed pb-1">
                  Maklumat kurikulum KSSR Semakan, program Dual Language Programme (DLP), Pentaksiran Bilik Darjah (PBD), dan Takwim Peperiksaan & Cuti Sekolah.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDesc(!showDesc)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-yellow-300 hover:text-yellow-200 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition mt-1 border border-white/10"
                title={showDesc ? "Sembunyikan penerangan" : "Baca penerangan penuh"}
              >
                <span>{showDesc ? "Sembunyikan Info" : "Info Kurikulum"}</span>
                {showDesc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* PK Pentadbiran Profile Mini-Card with Picture, Position, Name & Info */}
          <div className="bg-slate-900/85 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/20 flex items-center gap-4 flex-shrink-0 shadow-xl hover:border-yellow-400/50 transition">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-yellow-400 p-0.5 shadow-md overflow-hidden border-2 border-yellow-300 flex items-center justify-center flex-shrink-0">
              {pkKurikulumPhoto && pkKurikulumPhoto.trim() !== '' ? (
                <img
                  src={pkKurikulumPhoto}
                  alt={pkKurikulumName}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    const fallback = parent?.querySelector('.fallback-pkkurikulum-icon');
                    if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                  }}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : null}
              <div
                className={`fallback-pkkurikulum-icon w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-yellow-300 ${
                  pkKurikulumPhoto && pkKurikulumPhoto.trim() !== '' ? 'hidden' : 'flex'
                }`}
              >
                <UserCheck className="w-8 h-8 opacity-80" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {pkKurikulumTitle}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-950 text-yellow-300 border border-white/20">
                  {pkKurikulumGrade}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                {pkKurikulumName}
              </h4>
              <p className="text-xs text-slate-300 font-medium">
                {pkKurikulumInfo}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum & Key Programs Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg space-y-3">
          <div className="w-10 h-10 bg-blue-500/20 text-blue-300 rounded-2xl flex items-center justify-center font-bold border border-blue-400/30">
            <BookOpen className="w-5 h-5 text-blue-300" />
          </div>
          <h3 className="font-extrabold text-white text-base">KSSR Semakan & DLP</h3>
          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            SK Merbau Pulas melaksanakan Kurikulum Standard Sekolah Rendah (KSSR Semakan) merangkumi Program DLP bagi mata pelajaran Sains dan Matematik dalam Bahasa Inggeris.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg space-y-3">
          <div className="w-10 h-10 bg-yellow-500/20 text-yellow-300 rounded-2xl flex items-center justify-center font-bold border border-yellow-400/30">
            <Award className="w-5 h-5 text-yellow-300" />
          </div>
          <h3 className="font-extrabold text-white text-base">Pentaksiran Bilik Darjah (PBD)</h3>
          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            Pentaksiran berterusan holistik menilai perkembangan pembelajaran murid dari Tahap 1 (Tahun 1–3) hingga Tahap 2 (Tahun 4–6) mengikut Tahap Penguasaan (TP1–TP6).
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg space-y-3">
          <div className="w-10 h-10 bg-emerald-500/20 text-emerald-300 rounded-2xl flex items-center justify-center font-bold border border-emerald-400/30">
            <FileText className="w-5 h-5 text-emerald-300" />
          </div>
          <h3 className="font-extrabold text-white text-base">Program NILAM & PSS</h3>
          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            Pusat Sumber Seri Merbau memperkasakan budaya membaca melalui rekod NILAM digital dan Kem Galakan Membaca sepanjang tahun.
          </p>
        </div>
      </div>

      {/* Subjects Directory Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Layers className="w-5 h-5 text-yellow-400" />
          <h3 className="text-xl font-black text-white">Senarai Mata Pelajaran Teras & Elektif</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {subjectsList.map((sub, idx) => (
            <div
              key={idx}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition flex flex-col justify-between"
            >
              <div className="text-2xl mb-1">{sub.icon}</div>
              <div>
                <h5 className="font-extrabold text-xs text-white line-clamp-1">{sub.name}</h5>
                <span className="text-[10px] text-yellow-400 font-bold">{sub.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar / Takwim Sekolah Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-yellow-400" />
            <h3 className="text-xl font-black text-white">Takwim & Acara Persekolahan Sesi 2026/2027</h3>
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'semua', label: 'Semua Takwim' },
              { id: 'peperiksaan', label: 'Peperiksaan / PBD' },
              { id: 'cuti', label: 'Cuti Sekolah' },
              { id: 'acara', label: 'Acara & Program' },
              { id: 'pibg', label: 'PIBG' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCategory === tab.id
                    ? 'bg-yellow-400 text-blue-950 font-black shadow-lg shadow-yellow-400/20'
                    : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Events List */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => setSelectedEventModal(evt)}
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-400/50 transition cursor-pointer shadow-md flex items-start gap-4"
            >
              <div className="bg-yellow-400 text-blue-950 rounded-2xl p-3 text-center min-w-[60px] shadow-md flex-shrink-0">
                <span className="block text-[10px] font-black uppercase text-blue-950">
                  {new Date(evt.date).toLocaleString('ms-MY', { month: 'short' })}
                </span>
                <span className="block text-xl font-black text-blue-950 mt-0.5">
                  {new Date(evt.date).getDate()}
                </span>
              </div>

              <div className="space-y-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
                    {evt.category}
                  </span>
                  {evt.endDate && (
                    <span className="text-[10px] text-slate-300 font-medium">
                      Hingga {evt.endDate}
                    </span>
                  )}
                </div>
                <h4 className="font-extrabold text-xs sm:text-sm text-white line-clamp-1">
                  {evt.title}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {evt.description}
                </p>
                <div className="pt-1 flex items-center gap-3 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-yellow-400" />
                    {evt.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-yellow-400" />
                    {evt.targetGroup}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/90 backdrop-blur-2xl text-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-white/20 relative space-y-4">
            <button
              onClick={() => setSelectedEventModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-400 text-blue-950 rounded-2xl flex items-center justify-center font-black text-lg shadow-md">
                {new Date(selectedEventModal.date).getDate()}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
                  {selectedEventModal.category}
                </span>
                <h3 className="font-extrabold text-base text-white mt-1">
                  {selectedEventModal.title}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/10">
              {selectedEventModal.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Tarikh Mula</span>
                <span className="font-bold text-white">{selectedEventModal.date}</span>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Lokasi</span>
                <span className="font-bold text-white">{selectedEventModal.location}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
