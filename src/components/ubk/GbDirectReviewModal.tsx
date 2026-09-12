import React, { useState } from 'react';
import {
  CheckCircle2,
  X,
  AlertCircle,
  Clock,
  UserCheck,
  Calendar,
  Layers,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  Check,
  Building2
} from 'lucide-react';
import { UbkRphItem, UserRole } from '../../types';

interface GbDirectReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingItems: UbkRphItem[];
  userRole: UserRole | null;
  isAdmin: boolean;
  onApproveItem: (
    id: string,
    status: 'disemak' | 'pembetulan',
    comment: string,
    reviewerName: string
  ) => void;
  onOpenLogin: () => void;
  onElevateToGuruBesar?: () => void;
  onNavigateToUbk?: () => void;
}

const QUICK_COMMENTS = [
  'Rancangan perkhidmatan harian BRPBK disemak dan menepati piawaian bimbingan dan kaunseling KPM. Tahniah.',
  'Aktiviti bimbingan modular tersusun kemas dan memberi impak tinggi kepada sahsiah murid. Disahkan cemerlang.',
  'Langkah intervensi dan bimbingan kaunseling yang sangat baik. Teruskan usaha membina sahsiah murid SKMP.',
  'Disemak dan disahkan. Sila teruskan pemantauan berfokus bersama guru kelas dan pentadbir HEM.'
];

export const GbDirectReviewModal: React.FC<GbDirectReviewModalProps> = ({
  isOpen,
  onClose,
  pendingItems,
  userRole,
  isAdmin,
  onApproveItem,
  onOpenLogin,
  onElevateToGuruBesar,
  onNavigateToUbk
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    pendingItems[0]?.id || ''
  );
  const [status, setStatus] = useState<'disemak' | 'pembetulan'>('disemak');
  const [comment, setComment] = useState(QUICK_COMMENTS[0]);
  const [gbPassword, setGbPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLocallyAuthenticated, setIsLocallyAuthenticated] = useState(false);

  if (!isOpen) return null;

  const isPentadbir = Boolean(
    isAdmin ||
      userRole === 'admin' ||
      userRole === 'guru_besar' ||
      userRole === 'pk_hem' ||
      isLocallyAuthenticated
  );

  const activeItem =
    pendingItems.find((p) => p.id === selectedId) || pendingItems[0];

  const handleInlineAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = gbPassword.trim().toUpperCase();
    if (clean === 'GB5012' || clean === 'ADMIN123' || clean === 'SKMP5012') {
      setIsLocallyAuthenticated(true);
      setAuthError('');
      if (onElevateToGuruBesar) {
        onElevateToGuruBesar();
      }
    } else {
      setAuthError('Katalaluan Guru Besar tidak tepat. Sila cuba lagi.');
    }
  };

  const handleApprove = () => {
    if (!activeItem) return;
    const reviewerTitle =
      userRole === 'guru_besar' || isLocallyAuthenticated
        ? 'Guru Besar SK Merbau Pulas'
        : userRole === 'pk_hem'
        ? 'Penolong Kanan HEM'
        : 'Pentadbir Sekolah';

    onApproveItem(activeItem.id, status, comment, reviewerTitle);

    // If there are other pending items, switch to the next one, else close
    const remaining = pendingItems.filter((p) => p.id !== activeItem.id);
    if (remaining.length > 0) {
      setSelectedId(remaining[0].id);
      setComment(QUICK_COMMENTS[0]);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 rounded-3xl max-w-4xl w-full border border-amber-500/40 shadow-2xl overflow-hidden text-white my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950/80 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Peti Pengesahan Terus Guru Besar (e-RPH UBK)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {pendingItems.length} Rekod Menunggu
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Semakan langsung Rancangan Perkhidmatan Harian (e-BRPBK) yang dihantar oleh Unit Bimbingan & Kaunseling.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {pendingItems.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">
                Semua e-RPH Telah Disemak & Disahkan
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Tiada e-RPH baharu daripada Unit Bimbingan & Kaunseling yang sedang menunggu semakan Guru Besar pada masa ini.
              </p>
            </div>
          ) : (
            <>
              {/* Tab Selector if multiple pending */}
              {pendingItems.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-slate-400 shrink-0">
                    Pilih Rekod:
                  </span>
                  {pendingItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedId(item.id);
                        setComment(item.reviewerComment || QUICK_COMMENTS[0]);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        item.id === activeItem?.id
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10'
                      }`}
                    >
                      Minggu {item.week}: {item.title || 'e-RPH'}
                    </button>
                  ))}
                </div>
              )}

              {/* Active e-RPH Details Card */}
              {activeItem && (
                <div className="space-y-4">
                  {/* Banner Info */}
                  <div className="bg-slate-950/80 rounded-2xl p-4 border border-teal-500/30 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl text-xs font-black bg-teal-500/20 text-teal-300 border border-teal-400/30">
                          Minggu {activeItem.week}
                        </span>
                        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                          {activeItem.sessionType}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-teal-400" />
                        <span>{activeItem.date}</span>
                        <span className="text-slate-600">•</span>
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        <span>{activeItem.time}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-white">
                        {activeItem.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-1">
                        <div>
                          <span className="text-slate-500">Fokus KPM:</span>{' '}
                          <strong className="text-amber-300">
                            {activeItem.focus}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Sasaran:</span>{' '}
                          <strong className="text-white">
                            {activeItem.target}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Tempat:</span>{' '}
                          <strong className="text-white">
                            {activeItem.venue}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2-Column Content: Objektif & Langkah-Langkah */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Objektif & BBM */}
                    <div className="bg-slate-950/50 rounded-2xl p-4 border border-white/10 space-y-3">
                      <div>
                        <h5 className="font-bold text-teal-300 flex items-center gap-1.5 mb-1">
                          <Layers className="w-4 h-4" />
                          <span>Objektif Sesi Bimbingan</span>
                        </h5>
                        <p className="text-slate-200 leading-relaxed bg-slate-900/90 p-3 rounded-xl border border-white/5 whitespace-pre-wrap">
                          {activeItem.objective}
                        </p>
                      </div>

                      <div>
                        <h5 className="font-bold text-slate-400 mb-1">
                          Bahan Bantu Mengajar / Instrumen:
                        </h5>
                        <p className="text-slate-300 bg-slate-900/50 p-2.5 rounded-xl border border-white/5">
                          {activeItem.teachingAids || 'Tiada instrumen khas dinyatakan.'}
                        </p>
                      </div>

                      {activeItem.reflection && (
                        <div>
                          <h5 className="font-bold text-amber-300 mb-1">
                            Refleksi Kaunselor:
                          </h5>
                          <p className="text-slate-200 bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/20 italic">
                            "{activeItem.reflection}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Langkah Pelaksanaan */}
                    <div className="bg-slate-950/50 rounded-2xl p-4 border border-white/10 space-y-2">
                      <h5 className="font-bold text-blue-300 flex items-center gap-1.5 mb-1">
                        <Check className="w-4 h-4" />
                        <span>Langkah-Langkah Pelaksanaan Sesi</span>
                      </h5>
                      <div className="space-y-2">
                        {activeItem.steps && activeItem.steps.length > 0 ? (
                          activeItem.steps.map((st, i) => (
                            <div
                              key={i}
                              className="p-2.5 rounded-xl bg-slate-900/90 border border-white/5 text-slate-200 flex items-start gap-2"
                            >
                              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span className="leading-relaxed">{st}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 italic p-3">
                            Tiada langkah berperingkat dinyatakan.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Authentication Guard for Action */}
                  {!isPentadbir ? (
                    <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm">
                        <Lock className="w-4 h-4 shrink-0" />
                        <span>Pengesahan Guru Besar Diperlukan</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Untuk mengesahkan e-RPH ini secara rasmi, sila masukkan katalaluan Guru Besar di bawah atau log masuk melalui modul pentadbir.
                      </p>

                      <form
                        onSubmit={handleInlineAuth}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                      >
                        <input
                          type="password"
                          value={gbPassword}
                          onChange={(e) => setGbPassword(e.target.value)}
                          placeholder="Masukkan Katalaluan Guru Besar (GB5012)"
                          className="flex-1 px-4 py-2 bg-slate-950 border border-amber-400/50 rounded-xl text-white text-xs focus:outline-none focus:border-amber-300"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Sahkan Akses Guru Besar</span>
                        </button>
                      </form>

                      {authError && (
                        <p className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{authError}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    /* Review Form Section */
                    <div className="bg-slate-950 rounded-2xl p-4 sm:p-5 border border-emerald-500/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4" />
                          <span>Bahagian Ulasan & Pengesahan Pentadbir</span>
                        </h5>
                        <span className="text-[11px] text-slate-400">
                          Penyemak: <strong className="text-white">{userRole === 'guru_besar' || isLocallyAuthenticated ? 'Guru Besar SK Merbau Pulas' : 'Pentadbir Sekolah'}</strong>
                        </span>
                      </div>

                      {/* Status Selector */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => setStatus('disemak')}
                          className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-black transition cursor-pointer ${
                            status === 'disemak'
                              ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-950/50'
                              : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Sahkan Semakan Pentadbir</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStatus('pembetulan')}
                          className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-black transition cursor-pointer ${
                            status === 'pembetulan'
                              ? 'bg-rose-600/30 border-rose-400 text-rose-200 shadow-md shadow-rose-950/50'
                              : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                          <span>Perlu Penambahbaikan</span>
                        </button>
                      </div>

                      {/* Quick Comment Templates */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Templat Ulasan Pantas Guru Besar:</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {QUICK_COMMENTS.map((qc, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setComment(qc)}
                              className="text-left text-[11px] text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 p-2 rounded-xl border border-white/5 transition line-clamp-2 cursor-pointer"
                            >
                              "{qc}"
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment Input */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-300">
                          Catatan / Ulasan Rasmi Guru Besar:
                        </label>
                        <textarea
                          rows={3}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full p-3 bg-slate-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-400 transition"
                          placeholder="Tulis ulasan pengesahan e-RPH di sini..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-slate-950 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div>
            {onNavigateToUbk && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToUbk();
                }}
                className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <span>Buka Modul UBK Penuh</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Tutup
            </button>

            {isPentadbir && activeItem && (
              <button
                type="button"
                onClick={handleApprove}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-950/60 flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Sahkan & Simpan Terus</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
