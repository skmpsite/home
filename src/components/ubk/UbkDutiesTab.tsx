import React from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  GraduationCap,
  Smile,
  Compass,
  Building,
  CheckCircle2,
  Lock,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { UbkDutyItem } from '../../types';

interface UbkDutiesTabProps {
  duties: UbkDutyItem[];
}

export const UbkDutiesTab: React.FC<UbkDutiesTabProps> = ({ duties }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Banner */}
      <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 p-6 rounded-3xl border border-indigo-500/30 space-y-3 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Panduan Pengurusan GBKSM KPM</span>
        </div>
        <h3 className="text-lg sm:text-2xl font-black text-white">
          Senarai Tugas Hakiki & 4 Fokus Utama Perkhidmatan Bimbingan dan Kaunseling
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Berdasarkan Surat Pekeliling Ikhtisas Kementerian Pendidikan Malaysia berkaitan Pengurusan Guru Bimbingan dan Kaunseling Sepenuh Masa (GBKSM) di sekolah rendah. GBKSM menumpukan 100% perkhidmatan kepada 4 fokus utama perkhidmatan murid.
        </p>
      </div>

      {/* Grid of 6 Main Duties */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {duties.map((duty) => (
          <div
            key={duty.id}
            className="bg-slate-900/90 rounded-2xl border border-white/10 hover:border-indigo-500/40 p-5 flex flex-col justify-between gap-4 transition shadow-md group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-purple-400/20">
                  {duty.category}
                </span>
                <span className="text-xs font-mono font-black text-slate-400">
                  #{duty.focusNumber}
                </span>
              </div>

              <h4 className="text-base font-black text-white group-hover:text-purple-300 transition">
                {duty.title}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">
                {duty.description}
              </p>

              <div className="pt-2 border-t border-white/5 space-y-1.5 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Skop & Program Utama:
                </div>
                <ul className="space-y-1 text-slate-300">
                  {duty.highlights.map((hl, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confidentiality & Ethics Box */}
      <div className="bg-slate-900/80 rounded-2xl border border-amber-500/30 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs">
        <div className="p-3 rounded-2xl bg-amber-500/20 text-yellow-300 shrink-0 border border-amber-400/30">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="text-sm font-black text-white flex items-center gap-2">
            <span>Pematuhan Akta Kaunselor 1998 (Akta 580) & Kod Etika Kerahsiaan</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Semua maklumat, rekod penerokaan, dan catatan sesi kaunseling individu mahupun kelompok
            adalah tertakluk di bawah prinsip kerahsiaan profesional kaunseling, kecuali dalam kes-kes yang
            melibatkan kemudaratan nyawa klien, orang lain, atau perintah undang-undang yang sah.
          </p>
        </div>
      </div>
    </div>
  );
};
