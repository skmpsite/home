import React, { useState } from 'react';
import {
  Globe,
  Maximize2,
  Minimize2,
  RotateCw,
  ExternalLink,
  Search,
  ChevronsDown,
  X,
  Info,
  CheckCircle2
} from 'lucide-react';

const DELIMA_URL = 'https://skmpsite.github.io/DELIMa/';

type HeightMode = 'full' | 'extra' | 'compact';

export const IctDelimaSubSection: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [iframeKey, setIframeKey] = useState<number>(0);
  // Default to 'full' (Lebar & Tinggi ke Bawah 1350px supaya keseluruhan maklumat carian nampak jelas)
  const [heightMode, setHeightMode] = useState<HeightMode>('full');

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenExternal = () => {
    window.open(DELIMA_URL, '_blank', 'noopener,noreferrer');
  };

  // Ketinggian bekas iframe mengikut mod
  const getHeightClass = () => {
    if (isFullscreen) {
      return 'fixed inset-0 z-50 rounded-none border-0 p-2 sm:p-4 bg-slate-950/95 backdrop-blur-md';
    }
    switch (heightMode) {
      case 'extra':
        return 'h-[1400px] sm:h-[1550px] lg:h-[1700px] min-h-[1200px]';
      case 'compact':
        return 'h-[850px] sm:h-[950px] min-h-[750px]';
      case 'full':
      default:
        // Paling optimum untuk paparan penuh tanpa terpotong
        return 'h-[1150px] sm:h-[1280px] lg:h-[1380px] min-h-[1000px]';
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Controls & Info Bar */}
      <div className="bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950/90 p-4 sm:p-5 rounded-3xl border border-indigo-500/30 shadow-xl relative overflow-hidden text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0 border border-indigo-400/40">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Portal Semakan ID DELIMa SK Merbau Pulas
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Google Workspace KPM
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Paparan carian dilebarkan ke bawah secara penuh bagi memudahkan murid & guru melihat maklumat tanpa halangan.
            </p>
          </div>
        </div>

        {/* Action Controls: Pilihan Lebar ke Bawah, Fit Skrin Penuh, Muat Semula */}
        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
          {/* Kawalan Lebar / Ketinggian ke Bawah */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-2xl border border-white/10 shadow-inner">
            <button
              type="button"
              onClick={() => setHeightMode('full')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                heightMode === 'full'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30 border border-indigo-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
              title="Paparan Lebar ke Bawah (Penuh)"
            >
              <ChevronsDown className="w-3.5 h-3.5 text-yellow-300" />
              <span>Lebar Penuh</span>
            </button>

            <button
              type="button"
              onClick={() => setHeightMode('extra')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                heightMode === 'extra'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30 border border-indigo-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
              title="Paparan Ekstra Panjang ke Bawah untuk senarai carian panjang"
            >
              <span>Ekstra +</span>
            </button>

            <button
              type="button"
              onClick={() => setHeightMode('compact')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                heightMode === 'compact'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30 border border-indigo-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Paparan Kompak Ringkas"
            >
              <span>Kompak</span>
            </button>
          </div>

          {/* Fit Skrin Penuh Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-1.5 transition shadow-md shadow-indigo-600/30 cursor-pointer active:scale-95 border border-indigo-400/40"
            title={isFullscreen ? 'Keluar Mod Fit Skrin Penuh' : 'Buka Fit Skrin Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-yellow-300" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Kecilkan' : 'Skrin Penuh'}</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition border border-white/10 cursor-pointer active:scale-95"
            title="Muat semula paparan DELIMa"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-yellow-300' : ''}`} />
            <span className="hidden sm:inline">Muat Semula</span>
          </button>

          {/* External Tab Fallback Button */}
          <button
            type="button"
            onClick={handleOpenExternal}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition border border-white/10 cursor-pointer active:scale-95"
            title="Buka di tab baharu sekiranya perlu"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tab Baru</span>
          </button>
        </div>
      </div>

      {/* Main Fit-Screen Portal View (Dilebarkan ke bawah secara penuh) */}
      <div
        className={`w-full rounded-3xl overflow-hidden border border-indigo-500/30 bg-slate-950 shadow-2xl transition-all duration-300 flex flex-col ${getHeightClass()}`}
      >
        {/* Browser Header Bar */}
        <div className="bg-slate-900/95 px-4 py-2.5 border-b border-white/10 flex items-center justify-between gap-3 text-xs text-slate-300 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 shadow-sm inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-sm inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-sm inline-block" />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/80 rounded-xl border border-white/10 font-mono text-[11px] text-slate-200 truncate max-w-xs sm:max-w-md">
              <Search className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="truncate">https://skmpsite.github.io/DELIMa/</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status Penunjuk Lebar ke Bawah */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 text-[10px] font-bold border border-indigo-400/30">
              <CheckCircle2 className="w-3 h-3 text-indigo-400" />
              {heightMode === 'extra' ? 'Paparan Ekstra Panjang' : heightMode === 'compact' ? 'Paparan Kompak' : 'Paparan Lebar Penuh'}
            </span>

            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Laman Aktif
            </span>

            {/* In fullscreen, prominent exit button */}
            {isFullscreen && (
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 transition shadow-md active:scale-95 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Tutup Skrin Penuh</span>
              </button>
            )}

            {!isFullscreen && (
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="text-yellow-300 hover:text-yellow-200 font-bold flex items-center gap-1 text-[11px] p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
                title="Besarkan paparan ke skrin penuh"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fit Skrin Penuh</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading Spinner Overlay */}
        <div className="relative flex-1 w-full h-full bg-white overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-slate-900/90 flex flex-col items-center justify-center gap-3 text-white">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-300">Memuatkan Portal DELIMa SK Merbau Pulas...</p>
            </div>
          )}

          {/* The Embed Iframe with full visible height */}
          <iframe
            key={iframeKey}
            src={DELIMA_URL}
            title="Portal Semakan ID DELIMa SK Merbau Pulas"
            onLoad={() => setIsLoading(false)}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
            allow="clipboard-write; fullscreen"
          />
        </div>

        {/* Quick Helper Tip Footer */}
        <div className="bg-slate-900/90 px-4 py-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <Info className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span className="truncate">
              Gunakan kotak carian di atas atau skrol ke bawah untuk melihat hasil carian serta maklumat penuh ID DELIMa.
            </span>
          </div>
          <span className="text-[10px] text-slate-300 hidden md:inline shrink-0 pl-2">
            SK Merbau Pulas Digital Hub
          </span>
        </div>
      </div>
    </div>
  );
};
