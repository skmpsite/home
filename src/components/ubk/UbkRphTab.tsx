import React, { useState } from 'react';
import {
  FileText,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  School,
  Printer,
  Edit3,
  Trash2,
  ShieldCheck,
  Check,
  UserCheck,
  X,
  Lock,
  Layers
} from 'lucide-react';
import { UbkRphItem } from '../../types';

interface UbkRphTabProps {
  rphList: UbkRphItem[];
  canEdit: boolean;
  isPentadbir: boolean;
  onSaveRphList: (items: UbkRphItem[]) => void;
  onPrintItem: (item: UbkRphItem) => void;
}

export const UbkRphTab: React.FC<UbkRphTabProps> = ({
  rphList,
  canEdit,
  isPentadbir,
  onSaveRphList,
  onPrintItem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('semua');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'menunggu' | 'disemak' | 'pembetulan'>('semua');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UbkRphItem | null>(null);
  const [reviewingItem, setReviewingItem] = useState<UbkRphItem | null>(null);

  const filteredRph = rphList.filter((item) => {
    const matchType = typeFilter === 'semua' || item.sessionType === typeFilter;
    const matchStatus = statusFilter === 'semua' || item.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.focus.toLowerCase().includes(q) ||
      item.target.toLowerCase().includes(q) ||
      item.objective.toLowerCase().includes(q);
    return matchType && matchStatus && matchQuery;
  });

  const handleDelete = (id: string) => {
    if (!canEdit) return;
    if (window.confirm('Adakah anda pasti ingin memadam e-RPH GBK ini?')) {
      const updated = rphList.filter((item) => item.id !== id);
      onSaveRphList(updated);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Informative Header Banner */}
      <div className="bg-slate-900/95 rounded-2xl border border-teal-500/30 p-5 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-teal-500/20 text-teal-300 border border-teal-400/30 mb-2">
              <FileText className="w-3.5 h-3.5" />
              Komponen 1: Buku Rekod Perkhidmatan Bimbingan & Kaunseling (BRPBK) Harian
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>Rancangan Perkhidmatan Harian (RPH GBK / e-BRPBK)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Dokumen utama penilaian harian bagi Guru Bimbingan dan Kaunseling yang{' '}
              <strong className="text-teal-300">menggantikan RPH biasa</strong> guru akademik.
              Merekodkan sesi kaunseling individu/kelompok, kelas bimbingan modular, konsultasi waris/guru,
              dan pengurusan program untuk semakan pentadbir (Guru Besar / PK HEM).
            </p>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/40 border border-teal-300/40 flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0 self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>+ Cipta e-RPH GBK Baharu</span>
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="pt-3 border-t border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tajuk RPH GBK, fokus KPM, kelas atau sasaran..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-white/15 rounded-xl text-white focus:outline-none focus:border-teal-400 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-slate-200 font-medium"
            >
              <option value="semua">Semua Jenis Perkhidmatan</option>
              <option value="Bimbingan Kelas Modular">Kelas Bimbingan Modular</option>
              <option value="Sesi Kaunseling Individu">Sesi Kaunseling Individu</option>
              <option value="Sesi Kaunseling Kelompok">Sesi Kaunseling Kelompok</option>
              <option value="Konsultasi Ibu Bapa / Guru">Konsultasi Ibu Bapa / Guru</option>
              <option value="Pengurusan Program & e-BRPBK">Pengurusan Program & e-BRPBK</option>
            </select>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
              {(['semua', 'menunggu', 'disemak', 'pembetulan'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition cursor-pointer ${
                    statusFilter === st ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'semua' ? 'Semua' : st === 'disemak' ? 'Disahkan' : st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RPH Cards */}
      {filteredRph.length === 0 ? (
        <div className="p-10 text-center bg-slate-900/60 rounded-2xl border border-white/10 text-slate-400 text-xs">
          Tiada rekod e-RPH GBK yang sepadan dengan carian ini.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRph.map((rph) => {
            const isDisemak = rph.status === 'disemak';
            const isMenunggu = rph.status === 'menunggu';

            return (
              <div
                key={rph.id}
                className="bg-slate-900/90 rounded-2xl border border-white/10 hover:border-teal-500/40 p-5 transition space-y-4 shadow-md"
              >
                {/* Header Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-black px-2.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-400/30">
                      Minggu {rph.week}
                    </span>
                    <span className="font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-200">
                      {rph.sessionType}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                      {rph.date} &bull; {rph.time}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                        isDisemak
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                          : isMenunggu
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                      }`}
                    >
                      {isDisemak ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Telah Disahkan Pentadbir</span>
                        </>
                      ) : isMenunggu ? (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Menunggu Semakan</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Perlu Pembetulan</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-teal-400 block mb-0.5">
                      Fokus Utama: {rph.focus}
                    </span>
                    <h4 className="text-base font-black text-white leading-snug">{rph.title}</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-xl border border-white/5">
                    <div>
                      <span className="text-slate-400 font-bold">Sasaran / Kumpulan:</span>
                      <div className="text-slate-200 font-semibold">{rph.target}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold">Lokasi / Ruang:</span>
                      <div className="text-slate-200 font-semibold">{rph.venue}</div>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                    <span className="font-bold text-slate-300">Objektif Perkhidmatan:</span>
                    <p className="text-slate-200 leading-relaxed">{rph.objective}</p>
                  </div>

                  <div className="space-y-1 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                    <span className="font-bold text-slate-300">Langkah Pelaksanaan Sesi:</span>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300">
                      {rph.steps.map((st, i) => (
                        <li key={i} className="leading-relaxed">
                          {st}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5 space-y-1">
                      <span className="font-bold text-slate-400">BBM / Instrumen / Modul:</span>
                      <p className="text-slate-200">{rph.teachingAids}</p>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5 space-y-1">
                      <span className="font-bold text-teal-400">Refleksi / Impak Sesi:</span>
                      <p className="text-slate-200 italic">{rph.reflection}</p>
                    </div>
                  </div>

                  {/* Reviewer Note */}
                  {rph.reviewedAt && (
                    <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-emerald-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <School className="w-3.5 h-3.5" />
                          Ulasan Semakan Pentadbir ({rph.reviewerName})
                        </span>
                        <span className="text-[11px] text-slate-400">{rph.reviewedAt}</span>
                      </div>
                      <p className="text-slate-200 italic text-[11px]">"{rph.reviewerComment}"</p>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Disediakan oleh: <strong className="text-slate-200">{rph.counselorName}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onPrintItem(rph)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Cetak Format e-BRPBK</span>
                    </button>

                    {isPentadbir && (
                      <button
                        type="button"
                        onClick={() => setReviewingItem(rph)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Semak & Sahkan</span>
                      </button>
                    )}

                    {canEdit && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(rph);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-teal-600 text-slate-200 hover:text-white transition cursor-pointer"
                          title="Edit e-RPH"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(rph.id)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-600 text-slate-200 hover:text-white transition cursor-pointer"
                          title="Padam"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit RPH */}
      {isAddModalOpen && (
        <RphModal
          isOpen={isAddModalOpen}
          initialData={editingItem}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingItem(null);
          }}
          onSave={(item) => {
            if (editingItem) {
              onSaveRphList(rphList.map((r) => (r.id === item.id ? item : r)));
            } else {
              onSaveRphList([item, ...rphList]);
            }
            setIsAddModalOpen(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Modal Review Pentadbir */}
      {reviewingItem && (
        <ReviewModal
          isOpen={Boolean(reviewingItem)}
          item={reviewingItem}
          onClose={() => setReviewingItem(null)}
          onSaveReview={(status, comment) => {
            const updated = rphList.map((r) =>
              r.id === reviewingItem.id
                ? {
                    ...r,
                    status,
                    reviewerComment: comment,
                    reviewerName: 'Guru Besar / Pentadbir HEM',
                    reviewedAt: new Date().toLocaleDateString('ms-MY')
                  }
                : r
            );
            onSaveRphList(updated);
            setReviewingItem(null);
          }}
        />
      )}
    </div>
  );
};

// Modal Add/Edit RPH
const RphModal: React.FC<{
  isOpen: boolean;
  initialData: UbkRphItem | null;
  onClose: () => void;
  onSave: (item: UbkRphItem) => void;
}> = ({ isOpen, initialData, onClose, onSave }) => {
  const [formData, setFormData] = useState<UbkRphItem>(() => {
    if (initialData) return initialData;
    return {
      id: `rph_${Date.now()}`,
      week: 25,
      date: new Date().toISOString().split('T')[0],
      time: '08:00 PG - 09:00 PG',
      sessionType: 'Bimbingan Kelas Modular',
      focus: 'Pembangunan Sahsiah Diri Murid',
      title: '',
      target: 'Tahun 5 / 6',
      venue: 'Bilik Bimbingan & Kaunseling',
      objective: '',
      steps: ['Langkah 1: Set Induksi', 'Langkah 2: Aktiviti Utama', 'Langkah 3: Penutup & Refleksi'],
      teachingAids: 'Bahan Edaran, Modul B&K, LCD Projektor',
      reflection: '',
      counselorName: 'Guru Bimbingan & Kaunseling (UBK)',
      status: 'menunggu',
      submittedAt: new Date().toISOString()
    };
  });

  const [stepsText, setStepsText] = useState(formData.steps.join('\n'));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.objective.trim()) return;
    const stepsArray = stepsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    onSave({
      ...formData,
      steps: stepsArray.length > 0 ? stepsArray : ['Sesi bimbingan berstruktur dilaksanakan.']
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 rounded-3xl max-w-2xl w-full border border-teal-500/40 shadow-2xl overflow-hidden text-white my-8">
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-black text-white">
              {initialData ? 'Kemas Kini e-RPH GBK' : 'Bina Rekod e-RPH GBK (e-BRPBK) Baharu'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Minggu Persekolahan *</label>
              <input
                type="number"
                min={1}
                max={45}
                required
                value={formData.week}
                onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Tarikh *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Waktu Sesi *</label>
              <input
                type="text"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="cth: 08:00 PG - 09:00 PG"
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Jenis Perkhidmatan GBK *</label>
              <select
                value={formData.sessionType}
                onChange={(e) => setFormData({ ...formData, sessionType: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              >
                <option value="Bimbingan Kelas Modular">Kelas Bimbingan Modular</option>
                <option value="Sesi Kaunseling Individu">Sesi Kaunseling Individu</option>
                <option value="Sesi Kaunseling Kelompok">Sesi Kaunseling Kelompok</option>
                <option value="Konsultasi Ibu Bapa / Guru">Konsultasi Ibu Bapa / Guru</option>
                <option value="Pengurusan Program & e-BRPBK">Pengurusan Program & e-BRPBK</option>
                <option value="Bimbingan Berfokus">Bimbingan Berfokus</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Fokus Utama KPM *</label>
              <select
                value={formData.focus}
                onChange={(e) => setFormData({ ...formData, focus: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              >
                <option value="Pembangunan Sahsiah Diri Murid">Pembangunan Sahsiah Diri Murid</option>
                <option value="Peningkatan Disiplin Diri Murid">Peningkatan Disiplin Diri Murid</option>
                <option value="Pendidikan Kerjaya Murid">Pendidikan Kerjaya Murid</option>
                <option value="Psikososial & Kesejahteraan Mental">Psikososial & Kesejahteraan Mental</option>
                <option value="Pengurusan Perkhidmatan B&K">Pengurusan Perkhidmatan B&K</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Tajuk Rancangan Harian *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="cth: Bimbingan Adab dan Komunikasi Berhemah"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-white font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Sasaran Murid / Kumpulan *</label>
              <input
                type="text"
                required
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                placeholder="cth: Murid Tahun 5 Inovatif (32 Orang)"
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Ruang / Tempat *</label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="cth: Bilik Kaunseling / Dewan"
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Objektif Sesi *</label>
            <textarea
              rows={2}
              required
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              placeholder="Nyatakan hasil pembelajaran atau matlamat sesi..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Langkah Pelaksanaan Sesi (Satu per baris)
            </label>
            <textarea
              rows={3}
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-white/15 rounded-xl text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">BBM / Instrumen / Modul</label>
              <input
                type="text"
                value={formData.teachingAids}
                onChange={(e) => setFormData({ ...formData, teachingAids: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Refleksi / Impak Sesi</label>
              <input
                type="text"
                value={formData.reflection}
                onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
                placeholder="Catatan keberkesanan sesi..."
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black shadow-lg"
            >
              Hantar e-RPH GBK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Review Pentadbir
const ReviewModal: React.FC<{
  isOpen: boolean;
  item: UbkRphItem;
  onClose: () => void;
  onSaveReview: (status: 'disemak' | 'pembetulan', comment: string) => void;
}> = ({ isOpen, item, onClose, onSaveReview }) => {
  const [status, setStatus] = useState<'disemak' | 'pembetulan'>('disemak');
  const [comment, setComment] = useState(
    item.reviewerComment ||
      'Rancangan perkhidmatan harian BRPBK disemak dan menepati piawaian bimbingan dan kaunseling KPM.'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 rounded-3xl max-w-lg w-full border border-emerald-500/40 shadow-2xl overflow-hidden text-white my-8">
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-black text-white">Pengesahan Pentadbir (Guru Besar / PK HEM)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-1">
            <div className="text-slate-400">Minggu {item.week} &bull; {item.sessionType}</div>
            <div className="text-white font-black text-sm">{item.title}</div>
            <div className="text-slate-300">GBKSM: {item.counselorName}</div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Keputusan Semakan *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('disemak')}
                className={`p-3 rounded-xl border text-center font-black transition ${
                  status === 'disemak'
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950 border-white/10 text-slate-400'
                }`}
              >
                Disahkan (Cemerlang)
              </button>
              <button
                type="button"
                onClick={() => setStatus('pembetulan')}
                className={`p-3 rounded-xl border text-center font-black transition ${
                  status === 'pembetulan'
                    ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                    : 'bg-slate-950 border-white/10 text-slate-400'
                }`}
              >
                Perlu Pembetulan
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Ulasan & Perakuan Pentadbir *</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-white"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => onSaveReview(status, comment)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg"
            >
              Sahkan Semakan Pentadbir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
