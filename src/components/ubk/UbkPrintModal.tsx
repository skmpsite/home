import React from 'react';
import { X, Printer, School, ShieldCheck } from 'lucide-react';
import { UbkRphItem } from '../../types';

interface UbkPrintModalProps {
  item: UbkRphItem | null;
  onClose: () => void;
}

export const UbkPrintModal: React.FC<UbkPrintModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn print:p-0 print:bg-white">
      <div className="bg-slate-900 rounded-3xl max-w-3xl w-full border border-teal-500/30 shadow-2xl overflow-hidden text-slate-100 my-8 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Action Bar (Hidden on print) */}
        <div className="bg-slate-950 p-4 border-b border-white/10 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-teal-400" />
            <span className="text-sm font-black text-white">
              Pratonton Cetakan Buku Rekod Perkhidmatan B&K (e-BRPBK)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Page */}
        <div className="p-8 sm:p-10 space-y-6 bg-white text-slate-900 print:p-6 print:m-0 font-sans">
          {/* Letterhead */}
          <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <div className="text-xs font-extrabold tracking-widest text-slate-600 uppercase">
              KEMENTERIAN PENDIDIKAN MALAYSIA
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              SEKOLAH KEBANGSAAN MERBAU PULAS
            </h2>
            <div className="text-xs font-semibold text-slate-700">
              09300 KUALA KETIL, KEDAH DARUL AMAN &bull; KOD SEKOLAH: KBA0020
            </div>
            <div className="inline-block mt-2 px-4 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs font-black tracking-wider uppercase">
              BUKU REKOD PERKHIDMATAN BIMBINGAN DAN KAUNSELING (e-BRPBK)
            </div>
          </div>

          {/* Meta Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs border border-slate-300 p-4 rounded-xl bg-slate-50">
            <div>
              <span className="font-bold text-slate-500 block">Minggu Persekolahan:</span>
              <span className="font-black text-slate-900 text-sm">Minggu {item.week}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Tarikh & Waktu:</span>
              <span className="font-bold text-slate-900">{item.date} ({item.time})</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Jenis Perkhidmatan:</span>
              <span className="font-black text-teal-800">{item.sessionType}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Fokus Utama KPM:</span>
              <span className="font-bold text-slate-900">{item.focus}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Sasaran / Klien:</span>
              <span className="font-semibold text-slate-900">{item.target}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 block">Tempat / Ruang:</span>
              <span className="font-semibold text-slate-900">{item.venue}</span>
            </div>
          </div>

          {/* Content Details */}
          <div className="space-y-4 text-xs">
            <div>
              <span className="font-bold text-slate-600 block mb-0.5">Tajuk Rancangan Harian:</span>
              <div className="text-base font-black text-slate-900 bg-slate-100 p-3 rounded-lg border border-slate-200">
                {item.title}
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-600 block mb-0.5">Objektif Perkhidmatan:</span>
              <div className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                {item.objective}
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-600 block mb-0.5">Langkah Pelaksanaan Sesi:</span>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <ol className="list-decimal list-inside space-y-1 text-slate-800">
                  {item.steps.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-bold text-slate-600 block mb-0.5">BBM / Instrumen Digunakan:</span>
                <div className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {item.teachingAids || '-'}
                </div>
              </div>
              <div>
                <span className="font-bold text-slate-600 block mb-0.5">Refleksi / Impak Sesi:</span>
                <div className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 italic">
                  {item.reflection || '-'}
                </div>
              </div>
            </div>

            {/* Verification Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300">
              <div className="text-center space-y-12">
                <span className="text-xs font-bold text-slate-600 block">Disediakan Oleh (GBKSM):</span>
                <div className="border-t border-slate-400 pt-2 text-xs">
                  <div className="font-black text-slate-900">{item.counselorName}</div>
                  <div className="text-slate-600">Guru Bimbingan & Kaunseling Sepenuh Masa</div>
                </div>
              </div>

              <div className="text-center space-y-12">
                <span className="text-xs font-bold text-slate-600 block">Disemak & Disahkan Oleh:</span>
                <div className="border-t border-slate-400 pt-2 text-xs">
                  <div className="font-black text-slate-900">
                    {item.reviewerName || 'Guru Besar / PK HEM'}
                  </div>
                  <div className="text-slate-600">
                    {item.reviewedAt ? `Tarikh Semakan: ${item.reviewedAt}` : 'Sekolah Kebangsaan Merbau Pulas'}
                  </div>
                </div>
              </div>
            </div>

            {item.reviewerComment && (
              <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs">
                <strong>Catatan Pentadbir:</strong> "{item.reviewerComment}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
