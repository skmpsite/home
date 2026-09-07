import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Search,
  Users,
  Flame,
  Star,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Flag,
  Filter
} from 'lucide-react';
import {
  KOT_RUMAH_SUKAN,
  KOT_TOKOH,
  KOT_CALON_TOKOH,
  KOT_EVENTS,
  KotEvent
} from '../../data/kotData';

export const KotSubSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('semua');

  // Filter events based on search and category
  const filteredEvents = useMemo(() => {
    return KOT_EVENTS.filter((evt) => {
      const matchSearch =
        evt.acara.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.bil.toString().includes(searchQuery);

      if (!matchSearch) return false;
      if (filterCategory === 'semua') return true;
      if (filterCategory === 'balapan') {
        return evt.acara.includes('METER') && !evt.acara.includes('4 X');
      }
      if (filterCategory === 'padang') {
        return (
          evt.acara.includes('LOMPAT') ||
          evt.acara.includes('PELURU')
        );
      }
      if (filterCategory === 'berganti') {
        return evt.acara.includes('4 X');
      }
      if (filterCategory === 'khas') {
        return (
          evt.acara.includes('PERBARISAN') ||
          evt.acara.includes('TARIK TALI')
        );
      }
      return true;
    });
  }, [searchQuery, filterCategory]);

  return (
    <div className="space-y-8">
      {/* 1. HEADER BANNER KOT */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900/90 via-slate-900/95 to-amber-950/70 border border-yellow-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400 text-blue-950 text-xs font-black uppercase tracking-wider shadow">
                <Trophy className="w-3.5 h-3.5" />
                Sub Menu KOT
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-yellow-300 border border-yellow-400/30">
                Edisi 2026
              </span>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                SK Merbau Pulas
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Kejohanan Olahraga Tahunan
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Statistik rasmi keputusan acara padang, balapan, sukantara, serta penentuan Juara Keseluruhan dan Tokoh Olahragawan / Olahragawati Kejohanan Olahraga Tahunan 2026.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-950/60 border border-white/10">
            <div className="text-center px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <span className="block text-lg font-black text-blue-400">695</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Juara (Biru)</span>
            </div>
            <div className="text-center px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="block text-lg font-black text-amber-400">688</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Naib (Kuning)</span>
            </div>
            <div className="text-center px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="block text-lg font-black text-emerald-400">620</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Ketiga (Hijau)</span>
            </div>
            <div className="text-center px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="block text-lg font-black text-rose-400">589</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Keempat (Merah)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KEPUTUSAN KESELURUHAN RUMAH SUKAN (PODIUM / KAD UTAMA) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              Keputusan Akhir & Kedudukan Rumah Sukan
            </h3>
            <p className="text-xs text-slate-400">
              Jumlah mata keseluruhan digabungkan daripada pungutan mata pingat acara dan mata sukantara.
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
            Sistem Mata: Emas (7) • Perak (5) • Gangsa (3) • Keempat (1)
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {KOT_RUMAH_SUKAN.map((rk) => {
            const isJuara = rk.kedudukan === 1;
            const isNaib = rk.kedudukan === 2;
            const isKetiga = rk.kedudukan === 3;

            return (
              <div
                key={rk.id}
                className={`relative rounded-3xl p-5 border transition duration-200 backdrop-blur-md flex flex-col justify-between ${
                  isJuara
                    ? 'bg-gradient-to-b from-blue-900/60 via-slate-900/80 to-blue-950/90 border-blue-400/60 shadow-xl shadow-blue-500/10 ring-2 ring-yellow-400/40'
                    : isNaib
                    ? 'bg-gradient-to-b from-amber-900/40 via-slate-900/80 to-slate-950/90 border-amber-400/50 shadow-lg'
                    : isKetiga
                    ? 'bg-gradient-to-b from-emerald-900/40 via-slate-900/80 to-slate-950/90 border-emerald-400/40 shadow-md'
                    : 'bg-gradient-to-b from-rose-900/30 via-slate-900/80 to-slate-950/90 border-rose-400/30'
                }`}
              >
                {/* Header Kad */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${rk.badgeClass}`}>
                      {rk.name}
                    </span>
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1 ${
                        isJuara
                          ? 'bg-yellow-400 text-blue-950 shadow'
                          : isNaib
                          ? 'bg-slate-300 text-slate-900'
                          : isKetiga
                          ? 'bg-amber-600 text-white'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {isJuara && <Trophy className="w-3.5 h-3.5" />}
                      {isNaib && <Medal className="w-3.5 h-3.5" />}
                      {isKetiga && <Medal className="w-3.5 h-3.5" />}
                      #{rk.kedudukan}
                    </span>
                  </div>

                  <div className="text-center py-2">
                    <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {rk.mataKeseluruhan}
                    </div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wide text-yellow-300">
                      {rk.gelaran}
                    </span>
                  </div>

                  {/* Pungutan Pingat */}
                  <div className="mt-3 grid grid-cols-4 gap-1 text-center py-2 px-1 bg-white/5 rounded-2xl border border-white/5">
                    <div>
                      <span className="block text-xs font-black text-yellow-400">{rk.emas}</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Emas</span>
                    </div>
                    <div>
                      <span className="block text-xs font-black text-slate-300">{rk.perak}</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Perak</span>
                    </div>
                    <div>
                      <span className="block text-xs font-black text-amber-500">{rk.gangsa}</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Gangsa</span>
                    </div>
                    <div>
                      <span className="block text-xs font-black text-slate-400">{rk.keempat}</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Ke-4</span>
                    </div>
                  </div>
                </div>

                {/* Perincian Mata Sukantara vs Acara */}
                <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-[11px] text-slate-400">Mata Sukantara:</span>
                    <span className="font-bold text-white">{rk.mataSukantara}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-[11px] text-slate-400">Mata Pingat:</span>
                    <span className="font-bold text-yellow-300">{rk.mataPingat}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-white/5 font-extrabold">
                    <span className="text-white text-[11px]">Jumlah Keseluruhan:</span>
                    <span className={`text-sm ${rk.colorClass}`}>{rk.mataKeseluruhan} mata</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. TOKOH OLAHRAGAWAN & OLAHRAGAWATI 2026 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pemenang Anugerah Tokoh */}
        <div className="lg:col-span-2 bg-slate-900/60 rounded-3xl border border-white/10 p-6 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center border border-yellow-400/30">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Anugerah Khas Olahragawan & Olahragawati 2026
                </h3>
                <p className="text-xs text-slate-400">
                  Pengiktirafan kecemerlangan individu murid paling cemerlang dalam kejohanan
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {KOT_TOKOH.map((tokoh, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-yellow-400/40 transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                    {tokoh.kategori}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    <Medal className="w-3.5 h-3.5" />
                    {tokoh.pencapaian}
                  </span>
                </div>
                <h4 className="font-extrabold text-white text-sm leading-snug group-hover:text-yellow-300 transition">
                  {tokoh.nama}
                </h4>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Koleksi: <strong>{tokoh.emas} Emas</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Senarai Calon Olahragawan/Wati */}
        <div className="bg-slate-900/60 rounded-3xl border border-white/10 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-white/10">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Calon Olahragawan / Wati
                </h3>
                <p className="text-xs text-slate-400">
                  Senarai pendek pencalonan rasmi
                </p>
              </div>
            </div>

            <ul className="space-y-2.5">
              {KOT_CALON_TOKOH.map((calon, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition text-xs"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 font-black text-[10px] flex items-center justify-center border border-blue-400/30 shrink-0">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-slate-200 truncate">{calon}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Jumlah Calon: 5 Orang</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Disahkan Jawatankuasa
            </span>
          </div>
        </div>
      </div>

      {/* 4. JADUAL STATISTIK PENUH ACARA (SEMUA 42 ACARA) */}
      <div className="bg-slate-900/70 rounded-3xl border border-white/10 p-5 sm:p-6 backdrop-blur-md shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-yellow-400" />
              Jadual Statistik Terperinci Acara Kejohanan
            </h3>
            <p className="text-xs text-slate-400">
              Statistik agihan pingat mengikut setiap acara yang dipertandingkan bagi 4 Rumah Sukan.
            </p>
          </div>

          {/* Carian dan Penapis Acara */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari acara / nombor..."
                className="pl-9 pr-3 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 transition w-44 sm:w-56"
              />
            </div>

            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              {[
                { id: 'semua', label: 'Semua' },
                { id: 'balapan', label: 'Balapan' },
                { id: 'padang', label: 'Padang' },
                { id: 'berganti', label: 'Berganti' },
                { id: 'khas', label: 'Khas' }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterCategory(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filterCategory === f.id
                      ? 'bg-yellow-400 text-blue-950 font-black shadow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Petunjuk Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/50 p-3 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 text-slate-300">
            <span className="font-bold text-white">Petunjuk Pingat:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" /> Emas (7 mata)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" /> Perak (5 mata)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" /> Gangsa (3 mata)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" /> Keempat (1 mata)</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Menunjukkan {filteredEvents.length} daripada {KOT_EVENTS.length} acara
          </span>
        </div>

        {/* Table Container dengan Scrollbar */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-inner">
          <table className="w-full text-xs text-left text-slate-200 border-collapse">
            {/* Table Header 1 */}
            <thead>
              <tr className="bg-slate-950/90 text-slate-300 border-b border-white/10 font-black">
                <th rowSpan={2} className="py-3 px-3 text-center w-12 border-r border-white/10">BIL.</th>
                <th rowSpan={2} className="py-3 px-4 min-w-[220px] border-r border-white/10">ACARA</th>
                <th colSpan={4} className="py-2 px-2 text-center bg-rose-950/40 text-rose-300 border-r border-white/10">
                  RUMAH MERAH
                </th>
                <th colSpan={4} className="py-2 px-2 text-center bg-blue-950/40 text-blue-300 border-r border-white/10">
                  RUMAH BIRU (JUARA)
                </th>
                <th colSpan={4} className="py-2 px-2 text-center bg-amber-950/40 text-amber-300 border-r border-white/10">
                  RUMAH KUNING
                </th>
                <th colSpan={4} className="py-2 px-2 text-center bg-emerald-950/40 text-emerald-300">
                  RUMAH HIJAU
                </th>
              </tr>
              {/* Table Subheader (Emas, Perak, Gangsa, Ke-4) */}
              <tr className="bg-slate-900 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-white/10 text-center">
                {/* Merah */}
                <th className="py-1.5 px-1.5 text-yellow-400 bg-rose-950/20">E</th>
                <th className="py-1.5 px-1.5 text-slate-300 bg-rose-950/20">P</th>
                <th className="py-1.5 px-1.5 text-amber-500 bg-rose-950/20">G</th>
                <th className="py-1.5 px-1.5 text-slate-400 bg-rose-950/20 border-r border-white/10">K4</th>
                {/* Biru */}
                <th className="py-1.5 px-1.5 text-yellow-400 bg-blue-950/20">E</th>
                <th className="py-1.5 px-1.5 text-slate-300 bg-blue-950/20">P</th>
                <th className="py-1.5 px-1.5 text-amber-500 bg-blue-950/20">G</th>
                <th className="py-1.5 px-1.5 text-slate-400 bg-blue-950/20 border-r border-white/10">K4</th>
                {/* Kuning */}
                <th className="py-1.5 px-1.5 text-yellow-400 bg-amber-950/20">E</th>
                <th className="py-1.5 px-1.5 text-slate-300 bg-amber-950/20">P</th>
                <th className="py-1.5 px-1.5 text-amber-500 bg-amber-950/20">G</th>
                <th className="py-1.5 px-1.5 text-slate-400 bg-amber-950/20 border-r border-white/10">K4</th>
                {/* Hijau */}
                <th className="py-1.5 px-1.5 text-yellow-400 bg-emerald-950/20">E</th>
                <th className="py-1.5 px-1.5 text-slate-300 bg-emerald-950/20">P</th>
                <th className="py-1.5 px-1.5 text-amber-500 bg-emerald-950/20">G</th>
                <th className="py-1.5 px-1.5 text-slate-400 bg-emerald-950/20">K4</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-white/5">
              {filteredEvents.map((evt) => (
                <tr
                  key={evt.bil}
                  className="hover:bg-white/[0.04] transition group font-medium text-center"
                >
                  <td className="py-2 px-3 font-bold text-slate-400 border-r border-white/5">
                    {evt.bil}
                  </td>
                  <td className="py-2 px-4 text-left font-bold text-white border-r border-white/5 group-hover:text-yellow-300 transition">
                    {evt.acara}
                  </td>

                  {/* Merah */}
                  <td className={`py-2 px-1 ${evt.merah.emas ? 'font-black text-yellow-400 bg-yellow-400/10' : 'text-slate-600'}`}>
                    {evt.merah.emas || '-'}
                  </td>
                  <td className={`py-2 px-1 ${evt.merah.perak ? 'font-black text-slate-200 bg-white/10' : 'text-slate-600'}`}>
                    {evt.merah.perak || '-'}
                  </td>
                  <td className={`py-2 px-1 ${evt.merah.gangsa ? 'font-black text-amber-400 bg-amber-500/10' : 'text-slate-600'}`}>
                    {evt.merah.gangsa || '-'}
                  </td>
                  <td className={`py-2 px-1 border-r border-white/5 ${evt.merah.keempat ? 'font-bold text-slate-400 bg-white/5' : 'text-slate-600'}`}>
                    {evt.merah.keempat || '-'}
                  </td>

                  {/* Biru */}
                  <td className={`py-2 px-1 ${evt.biru.emas ? 'font-black text-yellow-400 bg-yellow-400/15' : 'text-slate-600'}`}>
                    {evt.biru.emas || '-'}
                  </td>
                  <td className={`py-2 px-1 ${evt.biru.perak ? 'font-black text-slate-200 bg-white/10' : 'text-slate-600'}`}>
                    {evt.biru.perak || '-'}
                  </td>
                  <td className={`py-2 px-1 ${evt.biru.gangsa ? 'font-black text-amber-400 bg-amber-500/10' : 'text-slate-600'}`}>
                    {evt.biru.gangsa || '-'}
                  </td>
                  <td className={`py-2 px-1 border-r border-white/5 ${evt.biru.keempat ? 'font-bold text-slate-400 bg-white/5' : 'text-slate-600'}`}>
                    {evt.biru.keempat || '-'}
                  </td>

                  {/* Kuning */}
                  <td className={`py-2 px-1 ${evt.kuning.emas ? 'font-black text-yellow-400 bg-yellow-400/15' : 'text-slate-600'}`}>
                    {evt.kuning.emas || '-'}
                  </td>
                  <td className={`py-2 px-1 ${evt.kuning.perak ? 'font-black text-slate-200 bg-white/10' : 'text-slate-600'}`}>
                    {evt.kuning.perak || '-'}
                  </td>
                  <td className={`py-2 px-1 ${evt.kuning.gangsa ? 'font-black text-amber-400 bg-amber-500/10' : 'text-slate-600'}`}>
                    {evt.kuning.gangsa || '-'}
                  </td>
                  <td className={`py-2 px-1 border-r border-white/5 ${evt.kuning.keempat ? 'font-bold text-slate-400 bg-white/5' : 'text-slate-600'}`}>
                    {evt.kuning.keempat || '-'}
                  </td>

                  {/* Hijau */}
                  <td className={`py-2 px-1 ${evt.hijau.emas ? 'font-black text-yellow-400 bg-yellow-400/15' : 'text-slate-600'}`}>
                    {evt.hijau.emas || '-'}
                  </td>
                  <td className={`py-2 px-1 ${evt.hijau.perak ? 'font-black text-slate-200 bg-white/10' : 'text-slate-600'}`}>
                    {evt.hijau.perak || '-'}
                  </td>
                  <td className={`py-2 px-1 ${evt.hijau.gangsa ? 'font-black text-amber-400 bg-amber-500/10' : 'text-slate-600'}`}>
                    {evt.hijau.gangsa || '-'}
                  </td>
                  <td className={`py-2 px-1 ${evt.hijau.keempat ? 'font-bold text-slate-400 bg-white/5' : 'text-slate-600'}`}>
                    {evt.hijau.keempat || '-'}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Table Summary Footer */}
            <tfoot className="bg-slate-950 font-black divide-y divide-white/10 border-t-2 border-white/20 text-center">
              {/* Row 1: Jumlah Pingat */}
              <tr className="bg-slate-900/90 text-slate-200">
                <td colSpan={2} className="py-2.5 px-4 text-left font-black text-yellow-400 uppercase tracking-wider border-r border-white/10">
                  JUMLAH PINGAT
                </td>
                {/* Merah: 4, 9, 10, 12 */}
                <td className="py-2 px-1 text-yellow-400">4</td>
                <td className="py-2 px-1 text-slate-300">9</td>
                <td className="py-2 px-1 text-amber-400">10</td>
                <td className="py-2 px-1 text-slate-400 border-r border-white/10">12</td>
                {/* Biru: 17, 12, 8, 7 */}
                <td className="py-2 px-1 text-yellow-400">17</td>
                <td className="py-2 px-1 text-slate-300">12</td>
                <td className="py-2 px-1 text-amber-400">8</td>
                <td className="py-2 px-1 text-slate-400 border-r border-white/10">7</td>
                {/* Kuning: 10, 14, 11, 11 */}
                <td className="py-2 px-1 text-yellow-400">10</td>
                <td className="py-2 px-1 text-slate-300">14</td>
                <td className="py-2 px-1 text-amber-400">11</td>
                <td className="py-2 px-1 text-slate-400 border-r border-white/10">11</td>
                {/* Hijau: 11, 7, 13, 12 */}
                <td className="py-2 px-1 text-yellow-400">11</td>
                <td className="py-2 px-1 text-slate-300">7</td>
                <td className="py-2 px-1 text-amber-400">13</td>
                <td className="py-2 px-1 text-slate-400">12</td>
              </tr>

              {/* Row 2: Jumlah Mata Mengikut Pingat */}
              <tr className="bg-slate-950/90 text-slate-300 text-[11px]">
                <td colSpan={2} className="py-2.5 px-4 text-left font-black text-slate-300 uppercase tracking-wider border-r border-white/10">
                  JUMLAH MATA PINGAT (E:7, P:5, G:3, K:1)
                </td>
                {/* Merah: 28, 45, 30, 12 */}
                <td className="py-2 px-1">28</td>
                <td className="py-2 px-1">45</td>
                <td className="py-2 px-1">30</td>
                <td className="py-2 px-1 border-r border-white/10">12</td>
                {/* Biru: 119, 60, 24, 7 */}
                <td className="py-2 px-1">119</td>
                <td className="py-2 px-1">60</td>
                <td className="py-2 px-1">24</td>
                <td className="py-2 px-1 border-r border-white/10">7</td>
                {/* Kuning: 70, 70, 33, 11 */}
                <td className="py-2 px-1">70</td>
                <td className="py-2 px-1">70</td>
                <td className="py-2 px-1">33</td>
                <td className="py-2 px-1 border-r border-white/10">11</td>
                {/* Hijau: 77, 35, 39, 12 */}
                <td className="py-2 px-1">77</td>
                <td className="py-2 px-1">35</td>
                <td className="py-2 px-1">39</td>
                <td className="py-2 px-1">12</td>
              </tr>

              {/* Row 3: Jumlah Mata Keseluruhan Pingat */}
              <tr className="bg-blue-950/30 text-slate-200">
                <td colSpan={2} className="py-2.5 px-4 text-left font-black text-white uppercase tracking-wider border-r border-white/10">
                  JUMLAH BESAR MATA PINGAT
                </td>
                <td colSpan={4} className="py-2 px-2 font-black text-rose-400 border-r border-white/10 text-sm">
                  115
                </td>
                <td colSpan={4} className="py-2 px-2 font-black text-blue-400 border-r border-white/10 text-sm bg-blue-500/10">
                  210
                </td>
                <td colSpan={4} className="py-2 px-2 font-black text-amber-400 border-r border-white/10 text-sm">
                  184
                </td>
                <td colSpan={4} className="py-2 px-2 font-black text-emerald-400 text-sm">
                  163
                </td>
              </tr>

              {/* Row 4: Mata Sukantara */}
              <tr className="bg-slate-900/80 text-slate-200">
                <td colSpan={2} className="py-2.5 px-4 text-left font-black text-white uppercase tracking-wider border-r border-white/10">
                  MATA SUKANTARA
                </td>
                <td colSpan={4} className="py-2 px-2 font-black text-white border-r border-white/10 text-sm">
                  474
                </td>
                <td colSpan={4} className="py-2 px-2 font-black text-white border-r border-white/10 text-sm bg-blue-500/10">
                  485
                </td>
                <td colSpan={4} className="py-2 px-2 font-black text-white border-r border-white/10 text-sm">
                  504
                </td>
                <td colSpan={4} className="py-2 px-2 font-black text-white text-sm">
                  457
                </td>
              </tr>

              {/* Row 5: KEPUTUSAN AKHIR / JUARA KESELURUHAN */}
              <tr className="bg-gradient-to-r from-yellow-400/20 via-amber-400/20 to-yellow-400/20 text-white">
                <td colSpan={2} className="py-3 px-4 text-left font-black text-yellow-300 text-sm uppercase tracking-wider border-r border-white/10 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  JUARA KESELURUHAN (AKHIR)
                </td>
                <td colSpan={4} className="py-3 px-2 font-black text-rose-300 border-r border-white/10 text-base">
                  589 <span className="text-[10px] block text-slate-400 font-semibold">(Ke-4)</span>
                </td>
                <td colSpan={4} className="py-3 px-2 font-black text-yellow-300 border-r border-white/10 text-lg bg-yellow-400/20 ring-2 ring-yellow-400/40">
                  695 <span className="text-[10px] block text-yellow-300 font-black">🏆 JUARA</span>
                </td>
                <td colSpan={4} className="py-3 px-2 font-black text-amber-300 border-r border-white/10 text-base">
                  688 <span className="text-[10px] block text-slate-400 font-semibold">(Naib Juara)</span>
                </td>
                <td colSpan={4} className="py-3 px-2 font-black text-emerald-300 text-base">
                  620 <span className="text-[10px] block text-slate-400 font-semibold">(Ke-3)</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Nota Kaki & Maklumat Tambahan */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>Rekod rasmi Kejohanan Olahraga Tahunan SK Merbau Pulas (KBA5012) 2026.</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span>Formula: <strong>Mata Keseluruhan = Mata Sukantara + Mata Pungutan Pingat</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
