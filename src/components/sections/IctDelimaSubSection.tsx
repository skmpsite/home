import React from 'react';
import { ExternalLink, Globe, Sparkles, BookOpen, UserCheck, ShieldCheck, Laptop, HelpCircle } from 'lucide-react';

const DELIMA_URL = 'https://skmpsite.github.io/DELIMa/';

export const IctDelimaSubSection: React.FC = () => {
  const handleOpenExternal = () => {
    window.open(DELIMA_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Portal Rasmi Pembelajaran Digital KPM</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Portal Semakan ID DELIMa SK Merbau Pulas
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pautan terus ke gerbang semakan ID DELIMa (Digital Educational Learning Initiative Malaysia) untuk murid dan guru SK Merbau Pulas bagi mengakses akaun Google Workspace KPM (moe-dl.edu.my).
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenExternal}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm flex items-center gap-2.5 shadow-xl shadow-indigo-500/30 transition cursor-pointer hover:scale-[1.03] active:scale-[0.98] border border-indigo-400/40 shrink-0"
          >
            <ExternalLink className="w-4 h-4 text-yellow-300" />
            <span>Buka Laman ID DELIMa</span>
          </button>
        </div>

        {/* Feature quick links / cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-yellow-300 font-bold text-xs">
              <UserCheck className="w-4 h-4 text-yellow-400" />
              <span>Semakan ID Murid</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Carian akaun emel moe-dl bagi setiap murid mengikut nama dan kelas.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Katalaluan Asas</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Panduan penetapan semula (reset password) bersama Guru Penyelaras ICT.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
              <Laptop className="w-4 h-4 text-blue-400" />
              <span>Google Classroom & Buku Teks</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Akses aplikasi pembelajaran interaktif, Canva for Education & KPM Textbooks.
            </p>
          </div>
        </div>
      </div>

      {/* Embedded Portal / Interactive Card */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl text-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-400/30">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white">Laman Sesawang Semakan Rasmi</h4>
              <p className="text-xs text-indigo-300 font-mono select-all">
                {DELIMA_URL}
              </p>
            </div>
          </div>

          <a
            href={DELIMA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs transition shadow-md shadow-yellow-400/20"
          >
            <span>Layari https://skmpsite.github.io/DELIMa/</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Embedded Iframe Preview with Fallback */}
        <div className="w-full rounded-2xl overflow-hidden border border-white/15 bg-slate-950 shadow-inner relative min-h-[500px] flex flex-col">
          <div className="bg-slate-900 px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="font-mono text-[11px] text-slate-300 ml-2">skmpsite.github.io/DELIMa/</span>
            </div>
            <a
              href={DELIMA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-300 hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>Buka Skrin Penuh</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <iframe
            src={DELIMA_URL}
            title="ID DELIMa SK Merbau Pulas"
            className="w-full flex-1 min-h-[480px] border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  );
};
