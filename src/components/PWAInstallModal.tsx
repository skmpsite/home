import React from 'react';
import { Smartphone, Download, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { canInstall, isIOS, isInstalled, installPWA } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await installPWA();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & App Preview */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-20 h-20 rounded-2xl bg-slate-800 p-2 shadow-xl border-2 border-yellow-400/60 mb-3 flex items-center justify-center overflow-hidden">
            <img
              src="/icon-192.png"
              alt="Logo SK Merbau Pulas"
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="text-lg font-black text-white">Pasang Pintasan Portal SKMP</h3>
          <p className="text-xs text-slate-300 mt-1">
            Gunakan portal seperti aplikasi telefon dengan ikon logo rasmi di skrin utama anda.
          </p>
        </div>

        {isInstalled ? (
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 text-center text-emerald-200 mb-4">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
            <p className="text-sm font-bold">Aplikasi Telah Dipasang!</p>
            <p className="text-xs text-emerald-300/80 mt-1">
              Portal SK Merbau Pulas sudah ada pada skrin telefon anda.
            </p>
          </div>
        ) : canInstall ? (
          <div className="space-y-4">
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-xs text-slate-300">
              <p className="font-semibold text-yellow-300 mb-1">Pemasangan Pintas Android / Chrome:</p>
              Tekan butang di bawah untuk memasang aplikasi dengan logo rasmi secara terus ke skrin telefon anda.
            </div>
            <button
              onClick={handleInstallClick}
              className="w-full py-3.5 px-4 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black rounded-2xl shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2 text-sm transition active:scale-98 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Pasang Aplikasi Sekarang</span>
            </button>
          </div>
        ) : isIOS ? (
          <div className="space-y-3 bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 text-xs">
            <p className="font-bold text-yellow-400 flex items-center gap-1.5 text-sm">
              <Smartphone className="w-4 h-4" />
              Panduan iPhone (Safari):
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-200 leading-relaxed">
              <li>
                Pastikan anda membuka laman ini di pelayar <strong>Safari</strong> (bukan di dalam browser aplikasi lain).
              </li>
              <li className="flex items-start gap-2">
                <span>1.</span>
                <span>
                  Tekan butang <strong>Kongsi (Share)</strong>{' '}
                  <Share className="w-4 h-4 inline text-blue-400 mx-1 align-sub" /> di bahagian bawah skrin Safari.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>2.</span>
                <span>
                  Tatal ke bawah dan pilih <strong>"Tambah ke Skrin Utama" (Add to Home Screen)</strong>{' '}
                  <PlusSquare className="w-4 h-4 inline text-slate-300 mx-1 align-sub" />.
                </span>
              </li>
              <li>
                <span>3. Tekan <strong>"Tambah" (Add)</strong> di bucu atas kanan.</span>
              </li>
            </ol>
          </div>
        ) : (
          <div className="space-y-3 bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 text-xs">
            <p className="font-bold text-yellow-400 flex items-center gap-1.5 text-sm">
              <Smartphone className="w-4 h-4" />
              Panduan Telefon Pintar:
            </p>
            <div className="space-y-2 text-slate-300">
              <p>
                <strong>Langkah 1:</strong> Padamkan shortcut lama (jika ada) di skrin utama telefon anda.
              </p>
              <p>
                <strong>Langkah 2:</strong> Tekan menu <strong>3 titik bertindih (⋮)</strong> di sudut atas kanan pelayar Chrome.
              </p>
              <p>
                <strong>Langkah 3:</strong> Pilih <strong>"Pasang Aplikasi"</strong> atau <strong>"Tambah ke Skrin Utama" (Add to Home screen)</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Note on Cache */}
        <p className="text-[11px] text-slate-400 text-center mt-4">
          Tip: Jika shortcut lama masih tiada logo, sila padamkan shortcut lama terlebih dahulu, kemudian muat semula (refresh) pelayar sebelum menambah shortcut baru.
        </p>
      </div>
    </div>
  );
};
