import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Target,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  ChevronRight,
  Edit3,
  Trash2,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { UbkActivityItem } from '../../types';

interface UbkActivitiesTabProps {
  activities: UbkActivityItem[];
  canEdit: boolean;
  onSaveActivities: (activities: UbkActivityItem[]) => void;
}

export const UbkActivitiesTab: React.FC<UbkActivitiesTabProps> = ({
  activities,
  canEdit,
  onSaveActivities
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'telah_laksana' | 'sedang_laksana' | 'akan_laksana'>('semua');
  const [focusFilter, setFocusFilter] = useState<string>('semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UbkActivityItem | null>(null);

  const filteredActivities = activities.filter((act) => {
    const matchStatus = statusFilter === 'semua' || act.status === statusFilter;
    const matchFocus = focusFilter === 'semua' || act.focus === focusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      act.title.toLowerCase().includes(q) ||
      act.objective.toLowerCase().includes(q) ||
      act.targetGroup.toLowerCase().includes(q) ||
      act.venue.toLowerCase().includes(q);
    return matchStatus && matchFocus && matchQuery;
  });

  const handleDelete = (id: string) => {
    if (!canEdit) return;
    if (window.confirm('Adakah anda pasti ingin memadam aktiviti UBK ini?')) {
      const updated = activities.filter((a) => a.id !== id);
      onSaveActivities(updated);
    }
  };

  const handleCycleStatus = (item: UbkActivityItem) => {
    if (!canEdit) return;
    const nextStatus: Record<UbkActivityItem['status'], UbkActivityItem['status']> = {
      akan_laksana: 'sedang_laksana',
      sedang_laksana: 'telah_laksana',
      telah_laksana: 'akan_laksana'
    };
    const updated = activities.map((a) =>
      a.id === item.id ? { ...a, status: nextStatus[a.status], lastUpdated: new Date().toISOString().split('T')[0] } : a
    );
    onSaveActivities(updated);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Info */}
      <div className="bg-slate-900/90 rounded-2xl border border-white/10 p-5 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Evidens & Dokumentasi Program UBK
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Rekod Aktiviti & Program (Telah, Sedang & Akan Dilaksanakan)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Dokumentasi pelaksanaan aktiviti, kursus kepimpinan murid, kempen disiplin, dan program motivasi
              sebagai bahan pembuktian evidens bagi e-BRPBK dan Penilaian PBPPP KPM.
            </p>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 border border-blue-300/40 flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0 self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Aktiviti UBK</span>
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
              placeholder="Cari tajuk aktiviti, sasaran, lokasi atau objektif..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-white/15 rounded-xl text-white focus:outline-none focus:border-blue-400 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setStatusFilter('semua')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  statusFilter === 'semua' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua ({activities.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('telah_laksana')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  statusFilter === 'telah_laksana' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Telah ({activities.filter((a) => a.status === 'telah_laksana').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('sedang_laksana')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  statusFilter === 'sedang_laksana' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sedang ({activities.filter((a) => a.status === 'sedang_laksana').length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('akan_laksana')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  statusFilter === 'akan_laksana' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Akan ({activities.filter((a) => a.status === 'akan_laksana').length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      {filteredActivities.length === 0 ? (
        <div className="p-10 text-center bg-slate-900/60 rounded-2xl border border-white/10 text-slate-400 text-xs">
          Tiada aktiviti menepati kriteria tapisan carian.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActivities.map((act) => {
            const isDone = act.status === 'telah_laksana';
            const isInProgress = act.status === 'sedang_laksana';

            return (
              <div
                key={act.id}
                className={`rounded-2xl p-5 border transition flex flex-col justify-between gap-4 shadow-md bg-slate-900/90 ${
                  isDone
                    ? 'border-emerald-500/30'
                    : isInProgress
                    ? 'border-blue-500/40 ring-1 ring-blue-500/20'
                    : 'border-amber-500/30'
                }`}
              >
                <div className="space-y-3">
                  {/* Status & Focus Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-white/10">
                      {act.focus}
                    </span>

                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => handleCycleStatus(act)}
                      className={`text-xs font-black px-3 py-1 rounded-full border flex items-center gap-1.5 transition ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                          : isInProgress
                          ? 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                      } ${canEdit ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                      title={canEdit ? 'Klik untuk tukar status' : undefined}
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Telah Dilaksanakan</span>
                        </>
                      ) : isInProgress ? (
                        <>
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>Sedang Dilaksanakan</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Akan Dilaksanakan</span>
                        </>
                      )}
                      {canEdit && <ArrowRight className="w-3 h-3 opacity-60" />}
                    </button>
                  </div>

                  <h4 className="text-base font-black text-white leading-snug">{act.title}</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-xl">
                      <Calendar className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span className="truncate">{act.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-xl">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">{act.venue}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1 text-xs">
                    <div className="text-slate-400 font-bold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      Sasaran:
                    </div>
                    <div className="text-slate-200">{act.targetGroup}</div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="text-slate-400 font-bold">Objektif:</div>
                    <p className="text-slate-200 leading-relaxed">{act.objective}</p>
                  </div>

                  {act.outcome && (
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1 text-xs">
                      <div className="text-emerald-300 font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Laporan Impak / Pencapaian:
                      </div>
                      <p className="text-slate-200 leading-relaxed">{act.outcome}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    PIC: <strong className="text-slate-200">{act.counselorName}</strong>
                  </span>

                  {canEdit && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(act);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-blue-600 text-slate-200 hover:text-white transition cursor-pointer"
                        title="Edit Aktiviti"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(act.id)}
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
      )}

      {/* Modal Add/Edit Activity */}
      {isModalOpen && (
        <ActivityModal
          isOpen={isModalOpen}
          initialData={editingItem}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSave={(item) => {
            if (editingItem) {
              onSaveActivities(activities.map((a) => (a.id === item.id ? item : a)));
            } else {
              onSaveActivities([item, ...activities]);
            }
            setIsModalOpen(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

// Modal Component
const ActivityModal: React.FC<{
  isOpen: boolean;
  initialData: UbkActivityItem | null;
  onClose: () => void;
  onSave: (item: UbkActivityItem) => void;
}> = ({ isOpen, initialData, onClose, onSave }) => {
  const [formData, setFormData] = useState<UbkActivityItem>(() => {
    if (initialData) return initialData;
    return {
      id: `act_${Date.now()}`,
      title: '',
      focus: 'Pembangunan Sahsiah',
      status: 'akan_laksana',
      date: new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }),
      targetGroup: 'Semua Murid SK Merbau Pulas',
      venue: 'Dewan Seri Merbau / Bilik UBK',
      objective: '',
      outcome: '',
      counselorName: 'Guru Bimbingan & Kaunseling (UBK)',
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.objective.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 rounded-3xl max-w-xl w-full border border-blue-500/40 shadow-2xl overflow-hidden text-white my-8">
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-black text-white">
              {initialData ? 'Kemas Kini Aktiviti UBK' : 'Tambah Aktiviti UBK Baharu'}
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
            <label className="block font-bold text-slate-300 mb-1">Tajuk Aktiviti / Program *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-white font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Fokus KPM *</label>
              <select
                value={formData.focus}
                onChange={(e) => setFormData({ ...formData, focus: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              >
                <option value="Pembangunan Sahsiah">Pembangunan Sahsiah</option>
                <option value="Peningkatan Disiplin">Peningkatan Disiplin</option>
                <option value="Pendidikan Kerjaya">Pendidikan Kerjaya</option>
                <option value="Psikososial & Kesejahteraan">Psikososial & Kesejahteraan</option>
                <option value="Sesi Bimbingan & Kaunseling">Sesi Bimbingan & Kaunseling</option>
                <option value="Pengurusan & Pentadbiran">Pengurusan & Pentadbiran</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Status Pelaksanaan *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              >
                <option value="akan_laksana">Akan Dilaksanakan</option>
                <option value="sedang_laksana">Sedang Dilaksanakan</option>
                <option value="telah_laksana">Telah Dilaksanakan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Tarikh / Tempoh *</label>
              <input
                type="text"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Lokasi / Tempat *</label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Kumpulan Sasaran *</label>
            <input
              type="text"
              required
              value={formData.targetGroup}
              onChange={(e) => setFormData({ ...formData, targetGroup: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Objektif Program *</label>
            <textarea
              rows={2}
              required
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Laporan Impak / Pencapaian (Jika ada)</label>
            <textarea
              rows={2}
              value={formData.outcome || ''}
              onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
              placeholder="Catatkan impak atau peratus pencapaian..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
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
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg"
            >
              Simpan Aktiviti
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
