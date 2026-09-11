import React, { useState } from 'react';
import {
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  School,
  X
} from 'lucide-react';
import { UbkRptItem } from '../../types';

interface UbkRptTabProps {
  rptList: UbkRptItem[];
  canEdit: boolean;
  onSaveRptList: (items: UbkRptItem[]) => void;
}

export const UbkRptTab: React.FC<UbkRptTabProps> = ({
  rptList,
  canEdit,
  onSaveRptList
}) => {
  const [activeFocusFilter, setActiveFocusFilter] = useState<string>('semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UbkRptItem | null>(null);

  const filteredList = rptList.filter(
    (item) => activeFocusFilter === 'semua' || item.focus === activeFocusFilter
  );

  const handleDelete = (id: string) => {
    if (!canEdit) return;
    if (window.confirm('Adakah anda pasti ingin memadam strategi RPT GBK ini?')) {
      const updated = rptList.filter((item) => item.id !== id);
      onSaveRptList(updated);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Info */}
      <div className="bg-slate-900/90 rounded-2xl border border-purple-500/30 p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-400/30 mb-2">
              <Target className="w-3.5 h-3.5" />
              Komponen 2: Takwim & Perancangan Tahunan GBKSM
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Rancangan Perkhidmatan Tahunan (RPT GBK) Berteraskan 4 Fokus Utama
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Takwim dan perancangan strategi perkhidmatan sepanjang tahun SK Merbau Pulas bagi
              memenuhi standard perkhidmatan bimbingan dan kaunseling KPM (Pembangunan Sahsiah,
              Peningkatan Disiplin, Pendidikan Kerjaya, dan Kesejahteraan Mental).
            </p>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40 border border-purple-300/40 flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0 self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Strategi RPT</span>
            </button>
          )}
        </div>

        {/* 4 Focus Filter Tabs */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/10 overflow-x-auto text-xs pb-1">
          <span className="text-slate-400 font-bold shrink-0">Pilihan Fokus:</span>
          {[
            { id: 'semua', label: 'Semua 4 Fokus' },
            { id: 'Pembangunan Sahsiah', label: '1. Pembangunan Sahsiah' },
            { id: 'Peningkatan Disiplin', label: '2. Peningkatan Disiplin' },
            { id: 'Pendidikan Kerjaya', label: '3. Pendidikan Kerjaya' },
            { id: 'Kesejahteraan Mental', label: '4. Kesejahteraan Mental' }
          ].map((foc) => (
            <button
              key={foc.id}
              type="button"
              onClick={() => setActiveFocusFilter(foc.id)}
              className={`px-3 py-1.5 rounded-xl shrink-0 font-bold transition cursor-pointer ${
                activeFocusFilter === foc.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-950/70 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {foc.label}
            </button>
          ))}
        </div>
      </div>

      {/* RPT Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.map((item) => {
          const isSahsiah = item.focus === 'Pembangunan Sahsiah';
          const isDisiplin = item.focus === 'Peningkatan Disiplin';
          const isKerjaya = item.focus === 'Pendidikan Kerjaya';

          return (
            <div
              key={item.id}
              className={`rounded-2xl p-5 border transition flex flex-col justify-between gap-4 shadow-md ${
                isSahsiah
                  ? 'bg-gradient-to-br from-slate-900 to-amber-950/20 border-amber-500/30'
                  : isDisiplin
                  ? 'bg-gradient-to-br from-slate-900 to-rose-950/20 border-rose-500/30'
                  : isKerjaya
                  ? 'bg-gradient-to-br from-slate-900 to-blue-950/20 border-blue-500/30'
                  : 'bg-gradient-to-br from-slate-900 to-emerald-950/20 border-emerald-500/30'
              }`}
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    {item.focus}
                  </span>
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                    {item.timeline}
                  </span>
                </div>

                <h4 className="text-base font-black text-white leading-snug">
                  {item.strategyTitle}
                </h4>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
                  <div className="text-slate-400 font-bold">Sasaran Murid:</div>
                  <div className="text-white font-semibold">{item.targetGroup}</div>
                  <div className="pt-1 border-t border-white/5">
                    <span className="text-amber-400 font-bold">KPI Sasaran:</span>{' '}
                    <span className="text-slate-200">{item.kpi}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    Program & Modul Strategik:
                  </div>
                  <ul className="space-y-1 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                    {item.programs.map((prog, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span>{prog}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  PIC: <strong className="text-slate-200">{item.pic}</strong>
                </span>

                {canEdit && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem(item);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-purple-600 text-slate-200 hover:text-white transition cursor-pointer"
                      title="Edit Strategi RPT"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-600 text-slate-200 hover:text-white transition cursor-pointer"
                      title="Padam"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add/Edit RPT */}
      {isModalOpen && (
        <RptModal
          isOpen={isModalOpen}
          initialData={editingItem}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSave={(item) => {
            if (editingItem) {
              onSaveRptList(rptList.map((r) => (r.id === item.id ? item : r)));
            } else {
              onSaveRptList([item, ...rptList]);
            }
            setIsModalOpen(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

// Modal for RPT Item
const RptModal: React.FC<{
  isOpen: boolean;
  initialData: UbkRptItem | null;
  onClose: () => void;
  onSave: (item: UbkRptItem) => void;
}> = ({ isOpen, initialData, onClose, onSave }) => {
  const [formData, setFormData] = useState<UbkRptItem>(() => {
    if (initialData) return initialData;
    return {
      id: `rpt_${Date.now()}`,
      focus: 'Pembangunan Sahsiah',
      strategyTitle: '',
      targetGroup: 'Semua Murid SK Merbau Pulas',
      timeline: 'Sepanjang Tahun (Jan - Disember)',
      kpi: '',
      status: 'sedang_laksana',
      programs: ['Program Utama 1', 'Program Utama 2'],
      pic: 'Guru Bimbingan & Kaunseling'
    };
  });

  const [programsText, setProgramsText] = useState(formData.programs.join('\n'));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.strategyTitle.trim()) return;
    const progs = programsText
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);
    onSave({
      ...formData,
      programs: progs.length > 0 ? progs : ['Program Utama']
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 rounded-3xl max-w-xl w-full border border-purple-500/40 shadow-2xl overflow-hidden text-white my-8">
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-black text-white">
              {initialData ? 'Kemas Kini Strategi RPT GBK' : 'Tambah Strategi RPT GBK'}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Fokus Utama KPM *</label>
            <select
              value={formData.focus}
              onChange={(e) => setFormData({ ...formData, focus: e.target.value as any })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-white"
            >
              <option value="Pembangunan Sahsiah">1. Pembangunan Sahsiah Diri Murid</option>
              <option value="Peningkatan Disiplin">2. Peningkatan Disiplin Diri Murid</option>
              <option value="Pendidikan Kerjaya">3. Pendidikan Kerjaya Murid</option>
              <option value="Kesejahteraan Mental">4. Kesejahteraan Mental & Psikososial</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Tajuk Strategi Pelaksanaan *</label>
            <input
              type="text"
              required
              value={formData.strategyTitle}
              onChange={(e) => setFormData({ ...formData, strategyTitle: e.target.value })}
              placeholder="cth: Strategi Pembudayaan Nilai Murni & Guru Penyayang"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-white font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Garis Masa Pelaksanaan *</label>
              <input
                type="text"
                required
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                placeholder="cth: Mac - Oktober atau Sepanjang Tahun"
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Kumpulan Sasaran *</label>
              <input
                type="text"
                required
                value={formData.targetGroup}
                onChange={(e) => setFormData({ ...formData, targetGroup: e.target.value })}
                placeholder="cth: Murid Tahap 2 / Semua Murid"
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">KPI Sasaran Tahunan *</label>
            <input
              type="text"
              required
              value={formData.kpi}
              onChange={(e) => setFormData({ ...formData, kpi: e.target.value })}
              placeholder="cth: Kehadiran ≥95.0% dan 98% Amalan Baik SSDM"
              className="w-full px-3.5 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Senarai Program / Aktiviti (Satu per baris)
            </label>
            <textarea
              rows={4}
              value={programsText}
              onChange={(e) => setProgramsText(e.target.value)}
              placeholder="Program 1&#10;Program 2&#10;Program 3"
              className="w-full px-3.5 py-2 bg-slate-950 border border-white/15 rounded-xl text-white font-mono"
            />
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
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black shadow-lg"
            >
              Simpan Strategi RPT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
