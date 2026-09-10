import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Smartphone, Download, Share, PlusSquare, X, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { canInstall, isIOS, isInstalled, installPWA } = usePWAInstall();
  const [showManualNotice, setShowManualNotice] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowManualNotice(false);
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleInstallClick = async () => {
    if (canInstall) {
      const success = await installPWA();
      if (success) {
        onClose();
        return;
      }
    }
    // If browser didn't provide direct prompt or dismissed, show guide
    setShowManualNotice(true);
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md sm:max-w-lg bg-slate-900 border border-slate-700/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] text-white my-auto max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                Pasang Pintasan Portal SKMP
              </h3>
              <p className="text-[10px] sm:text-[11px] text-emerald-400 font-semibold">Pintasan Skrin Telefon Pintar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Tutup Paparan"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto pr-1 py-3 sm:py-4 space-y-3 sm:space-y-4 flex-1 overscroll-contain">
          {/* App Preview Card */}
          <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 rounded-xl sm:rounded-2xl p-3 shadow-inner">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-950 p-1 shadow-md border-2 border-yellow-400/80 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src="./icon-192.png"
                alt="Logo SK Merbau Pulas"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm sm:text-base font-black text-white truncate">SK Merbau Pulas</h4>
              <p className="text-[11px] text-slate-300 leading-snug">
                Portal rasmi dengan ikon lencana sekolah di skrin utama telefon anda.
              </p>
            </div>
          </div>

          {/* MAIN ACTION: Prominent Install Button (ALWAYS VISIBLE) */}
          {!isInstalled && (
            <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-300 text-xs font-extrabold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Pemasangan Terus ke Telefon
                </span>
                {canInstall && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                    Sedia Dipasang
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                Tekan butang di bawah untuk membuka pop-up pengesahan pemasangan rasmi ke skrin telefon anda:
              </p>
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3 sm:py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 text-xs sm:text-sm transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Pasang Aplikasi Sekarang</span>
              </button>
            </div>
          )}

          {/* If already installed notice */}
          {isInstalled && (
            <div className="bg-emerald-950/70 border border-emerald-500/50 rounded-xl sm:rounded-2xl p-3.5 text-center text-emerald-200 shadow-sm">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-400" />
              <p className="text-xs sm:text-sm font-bold">Aplikasi Telah Dipasang!</p>
              <p className="text-[11px] text-emerald-300/90 mt-0.5">
                Portal SK Merbau Pulas sudah sedia ada pada skrin utama telefon anda.
              </p>
            </div>
          )}

          {/* Notice if Chrome hasn't triggered prompt yet */}
          {showManualNotice && !canInstall && !isIOS && (
            <div className="bg-amber-950/70 border border-amber-500/50 rounded-xl p-3 text-amber-200 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">Panduan Pelayar Chrome:</p>
                <p className="text-[11px] text-amber-200/90 mt-0.5 leading-relaxed">
                  Pelayar belum membuka pop-up automatik. Sila tekan <strong>menu 3 titik bertindih (⋮)</strong> di bucu atas pelayar Chrome dan pilih <strong>"Install app"</strong> atau <strong>"Add to Home screen"</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Step-by-step instructions for devices */}
          {isIOS ? (
            <div className="space-y-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs">
              <p className="font-bold text-yellow-400 flex items-center gap-1.5 text-xs sm:text-sm">
                <Smartphone className="w-3.5 h-3.5 text-yellow-400" />
                Panduan iPhone / iPad (Safari):
              </p>
              <div className="space-y-2 text-slate-200 leading-relaxed pt-0.5">
                <div className="flex items-start gap-2 bg-slate-900/70 p-2 sm:p-2.5 rounded-lg border border-white/5 text-[11px] sm:text-xs">
                  <span className="w-4 h-4 rounded-full bg-yellow-400 text-slate-950 font-black flex items-center justify-center text-[10px] flex-shrink-0">1</span>
                  <span>Buka laman ini di pelayar <strong>Safari</strong> pada peranti Apple anda.</span>
                </div>
                <div className="flex items-start gap-2 bg-slate-900/70 p-2 sm:p-2.5 rounded-lg border border-white/5 text-[11px] sm:text-xs">
                  <span className="w-4 h-4 rounded-full bg-yellow-400 text-slate-950 font-black flex items-center justify-center text-[10px] flex-shrink-0">2</span>
                  <span>
                    Tekan butang <strong>Kongsi (Share)</strong> <Share className="w-3 h-3 inline text-blue-400 mx-0.5 align-sub" /> di bar navigasi Safari.
                  </span>
                </div>
                <div className="flex items-start gap-2 bg-slate-900/70 p-2 sm:p-2.5 rounded-lg border border-white/5 text-[11px] sm:text-xs">
                  <span className="w-4 h-4 rounded-full bg-yellow-400 text-slate-950 font-black flex items-center justify-center text-[10px] flex-shrink-0">3</span>
                  <span>
                    Tatal ke bawah dan tekan <strong>"Tambah ke Skrin Utama" (Add to Home Screen)</strong> <PlusSquare className="w-3 h-3 inline text-slate-300 mx-0.5 align-sub" />, kemudian tekan <strong>"Tambah"</strong>.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs">
              <p className="font-bold text-yellow-400 flex items-center gap-1.5 text-xs sm:text-sm">
                <Smartphone className="w-3.5 h-3.5 text-yellow-400" />
                Panduan Telefon Pintar Android (Chrome):
              </p>
              <div className="space-y-2 text-slate-200 leading-relaxed pt-0.5">
                <div className="flex items-start gap-2 bg-slate-900/70 p-2 sm:p-2.5 rounded-lg border border-white/5 text-[11px] sm:text-xs">
                  <span className="w-4 h-4 rounded-full bg-yellow-400 text-slate-950 font-black flex items-center justify-center text-[10px] flex-shrink-0">1</span>
                  <div>
                    <strong className="text-white">Padamkan shortcut lama:</strong> Jika sebelum ini ada shortcut berikon kelabu tanpa logo, buangkannya dari skrin telefon dahulu.
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-slate-900/70 p-2 sm:p-2.5 rounded-lg border border-white/5 text-[11px] sm:text-xs">
                  <span className="w-4 h-4 rounded-full bg-yellow-400 text-slate-950 font-black flex items-center justify-center text-[10px] flex-shrink-0">2</span>
                  <div>
                    <strong className="text-white">Tekan menu 3 titik bertindih (⋮):</strong> Di bucu atas kanan pelayar Chrome telefon anda.
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-slate-900/70 p-2 sm:p-2.5 rounded-lg border border-white/5 text-[11px] sm:text-xs">
                  <span className="w-4 h-4 rounded-full bg-yellow-400 text-slate-950 font-black flex items-center justify-center text-[10px] flex-shrink-0">3</span>
                  <div>
                    <strong className="text-white">Pilih "Install app"</strong> atau <strong className="text-white">"Add to Home screen"</strong>. Logo rasmi SKMP akan terpapar di skrin telefon anda!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-2.5 text-[10px] sm:text-[11px] text-slate-300 leading-relaxed">
            <span className="font-bold text-yellow-300">💡 Tip: </span>
            Sekiranya ikon logo belum dikemas kini, muat semula (refresh) halaman sekali sebelum memasang semula pintasan.
          </div>
        </div>

        {/* Modal Footer / Close Button */}
        <div className="pt-2.5 sm:pt-3 border-t border-white/10 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 sm:py-3 px-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 hover:text-white font-bold rounded-xl border border-slate-600/60 transition text-xs sm:text-sm cursor-pointer shadow-sm text-center"
          >
            Tutup Paparan
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
