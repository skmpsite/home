import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  Users,
  User,
  Plus,
  Search,
  Brain,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Compass,
  Smile,
  Edit3,
  Trash2,
  X,
  FileLock2
} from 'lucide-react';
import { UbkCounselingSessionItem } from '../../types';

interface UbkCounselingSessionsTabProps {
  sessions: UbkCounselingSessionItem[];
  canEdit: boolean;
  onSaveSessions: (sessions: UbkCounselingSessionItem[]) => void;
}

export const UbkCounselingSessionsTab: React.FC<UbkCounselingSessionsTabProps> = ({
  sessions,
  canEdit,
  onSaveSessions
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'semua' | 'individu' | 'kelompok' | 'konsultasi'>('semua');
  const [issueFilter, setIssueFilter] = useState<string>('semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<UbkCounselingSessionItem | null>(null);

  const filteredSessions = sessions.filter((ses) => {
    const matchType = typeFilter === 'semua' || ses.type === typeFilter;
    const matchIssue = issueFilter === 'semua' || ses.issueCategory === issueFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      ses.caseRef.toLowerCase().includes(q) ||
      ses.clientCode.toLowerCase().includes(q) ||
      ses.goals.toLowerCase().includes(q) ||
      ses.intervention.toLowerCase().includes(q) ||
      (ses.psychometricData &&
        (ses.psychometricData.instrumentName.toLowerCase().includes(q) ||
          ses.psychometricData.scoreResult.toLowerCase().includes(q)));
    return matchType && matchIssue && matchQuery;
  });

  const handleDelete = (id: string) => {
    if (!canEdit) return;
    if (window.confirm('Adakah anda pasti ingin memadam rekod sesi kaunseling ini?')) {
      const updated = sessions.filter((s) => s.id !== id);
      onSaveSessions(updated);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Info Banner */}
      <div className="bg-slate-900/95 rounded-2xl border border-indigo-500/30 p-5 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-2">
              <FileLock2 className="w-3.5 h-3.5 text-yellow-400" />
              Komponen 3: Rekod Kerahsiaan Sesi & Analisis Psikometrik
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>Buku Rekod Sesi Kaunseling & Pentaksiran Psikometrik (Ppsi)</span>
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Dokumen pengurusan kerahsiaan bagi sesi kaunseling individu, kelompok, dan konsultasi
              ibu bapa/guru. Mengandungi borang analisis intervensi serta data inventori psikometrik
              murid (IMK RIASEC, IKeP & Saringan Minda Sihat) mematuhi Akta Kaunselor 1998 (Akta 580).
            </p>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setEditingSession(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-900/40 border border-indigo-300/40 flex items-center gap-2 transition active:scale-95 cursor-pointer shrink-0 self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>+ Rekod Sesi Kaunseling</span>
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="pt-3 border-t border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari rujukan kes, kod klien, instrumen psikometrik, intervensi..."
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-950 border border-white/15 rounded-xl text-white focus:outline-none focus:border-indigo-400 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setTypeFilter('semua')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                typeFilter === 'semua' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Semua ({sessions.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('individu')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                typeFilter === 'individu' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Individu</span>
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('kelompok')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                typeFilter === 'kelompok' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Kelompok</span>
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('konsultasi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                typeFilter === 'konsultasi' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Konsultasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* List of Confidential Sessions */}
      {filteredSessions.length === 0 ? (
        <div className="p-10 text-center bg-slate-900/60 rounded-2xl border border-white/10 text-slate-400 text-xs">
          Tiada rekod sesi kaunseling menepati kriteria tapisan carian.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((ses) => {
            const isIndividu = ses.type === 'individu';
            const isKelompok = ses.type === 'kelompok';

            return (
              <div
                key={ses.id}
                className="bg-slate-900/90 rounded-2xl border border-white/10 hover:border-indigo-500/40 p-5 transition space-y-4 shadow-md"
              >
                {/* Header Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      {ses.caseRef}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-200">
                      {isIndividu ? 'Sesi Individu' : isKelompok ? 'Sesi Kelompok' : 'Konsultasi'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {ses.sessionDate} &bull; {ses.sessionTime} (Sesi ke-{ses.sessionCount})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                      Rujukan: {ses.referralSource.toUpperCase()}
                    </span>
                    <span
                      className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                        ses.status === 'selesai'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                          : ses.status === 'aktif'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                      }`}
                    >
                      {ses.status === 'selesai' ? 'Selesai' : ses.status === 'aktif' ? 'Dalam Pemantauan' : 'Rujuk Pakar'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Left Column: Client & Interventions */}
                  <div className="space-y-2.5">
                    <div>
                      <div className="text-slate-400 font-bold">Kod Klien / Sasaran:</div>
                      <div className="text-white font-black text-sm flex items-center gap-2 mt-0.5">
                        <Lock className="w-3.5 h-3.5 text-yellow-400" />
                        <span>{ses.clientCode}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-1">
                      <div className="font-bold text-slate-300">Matlamat Bimbingan:</div>
                      <p className="text-slate-200 leading-relaxed">{ses.goals}</p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-1">
                      <div className="font-bold text-indigo-300">Intervensi & Teori Kaunseling:</div>
                      <p className="text-slate-200 leading-relaxed">{ses.intervention}</p>
                    </div>
                  </div>

                  {/* Right Column: Psychometric Data & Ethics Notice */}
                  <div className="space-y-2.5">
                    {ses.psychometricData ? (
                      <div className="bg-gradient-to-br from-purple-950/40 to-slate-950 p-3.5 rounded-xl border border-purple-500/30 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-purple-300">
                          <Brain className="w-4 h-4 text-yellow-400" />
                          <span>Analisis Inventori Psikometrik / Saringan:</span>
                        </div>
                        <div className="text-white font-semibold">
                          {ses.psychometricData.instrumentName}
                        </div>
                        <div className="text-slate-300 text-[11px] bg-white/5 p-2 rounded-lg">
                          <strong>Hasil Analisis:</strong> {ses.psychometricData.scoreResult}
                        </div>
                        <div className="text-emerald-300 text-[11px]">
                          <strong>Pelan Tindakan Susulan:</strong>{' '}
                          {ses.psychometricData.actionPlan}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-white/5 text-slate-400 text-xs italic">
                        Tiada data inventori psikometrik direkodkan bagi sesi ini.
                      </div>
                    )}

                    <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-start gap-2">
                      <Lock className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                      <span>{ses.confidentialNotice}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                {canEdit && (
                  <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSession(ses);
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Rekod</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ses.id)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-rose-600 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Padam</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add/Edit Session */}
      {isModalOpen && (
        <CounselingSessionModal
          isOpen={isModalOpen}
          initialData={editingSession}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSession(null);
          }}
          onSave={(item) => {
            if (editingSession) {
              onSaveSessions(sessions.map((s) => (s.id === item.id ? item : s)));
            } else {
              onSaveSessions([item, ...sessions]);
            }
            setIsModalOpen(false);
            setEditingSession(null);
          }}
        />
      )}
    </div>
  );
};

// Modal Component
const CounselingSessionModal: React.FC<{
  isOpen: boolean;
  initialData: UbkCounselingSessionItem | null;
  onClose: () => void;
  onSave: (item: UbkCounselingSessionItem) => void;
}> = ({ isOpen, initialData, onClose, onSave }) => {
  const [formData, setFormData] = useState<UbkCounselingSessionItem>(() => {
    if (initialData) return initialData;
    return {
      id: `ses_${Date.now()}`,
      caseRef: `BRPBK/2026/IND-${String(Math.floor(Math.random() * 900) + 100)}`,
      clientCode: 'Klien (Nama Samaran / Kelas)',
      type: 'individu',
      issueCategory: 'emosi_psikososial',
      referralSource: 'sukarela',
      sessionDate: new Date().toISOString().split('T')[0],
      sessionTime: '09:00 PG - 09:45 PG',
      sessionCount: 1,
      goals: '',
      intervention: '',
      status: 'aktif',
      psychometricData: {
        instrumentName: 'Inventori Minat Kerjaya (IMK) / Saringan Minda Sihat',
        scoreResult: '',
        actionPlan: ''
      },
      confidentialNotice: 'Dokumen ini diklasifikasikan sebagai SULIT di bawah Akta Kaunselor 1998 (Akta 580).'
    };
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientCode.trim() || !formData.goals.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 rounded-3xl max-w-2xl w-full border border-indigo-500/40 shadow-2xl overflow-hidden text-white my-8">
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-black text-white">
              {initialData ? 'Kemas Kini Rekod Sesi Kaunseling' : 'Daftar Rekod Sesi Kaunseling (SULIT)'}
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
              <label className="block font-bold text-slate-300 mb-1">No. Rujukan Kes *</label>
              <input
                type="text"
                required
                value={formData.caseRef}
                onChange={(e) => setFormData({ ...formData, caseRef: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Jenis Sesi *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              >
                <option value="individu">Sesi Individu</option>
                <option value="kelompok">Sesi Kelompok</option>
                <option value="konsultasi">Konsultasi Waris/Guru</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Punca Rujukan *</label>
              <select
                value={formData.referralSource}
                onChange={(e) => setFormData({ ...formData, referralSource: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              >
                <option value="sukarela">Klien Sukarela</option>
                <option value="guru">Rujukan Guru Mata Pelajaran</option>
                <option value="pentadbir">Rujukan Pentadbir / Disiplin</option>
                <option value="waris">Permintaan Ibu Bapa/Waris</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Kod Klien (Kerahsiaan) *</label>
              <input
                type="text"
                required
                value={formData.clientCode}
                onChange={(e) => setFormData({ ...formData, clientCode: e.target.value })}
                placeholder="cth: Klien X (Tahun 5 Inovatif)"
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Kategori Isu *</label>
              <select
                value={formData.issueCategory}
                onChange={(e) => setFormData({ ...formData, issueCategory: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              >
                <option value="emosi_psikososial">Emosi & Psikososial</option>
                <option value="disiplin">Disiplin & Kehadiran</option>
                <option value="akademik">Akademik & Motivasi Belajar</option>
                <option value="kerjaya">Kerjaya & Hala Tuju</option>
                <option value="keluarga">Keluarga & Persekitaran</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Tarikh Sesi *</label>
              <input
                type="date"
                required
                value={formData.sessionDate}
                onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Waktu Sesi *</label>
              <input
                type="text"
                required
                value={formData.sessionTime}
                onChange={(e) => setFormData({ ...formData, sessionTime: e.target.value })}
                placeholder="cth: 09:00 PG - 09:45 PG"
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Sesi Ke- *</label>
              <input
                type="number"
                min={1}
                required
                value={formData.sessionCount}
                onChange={(e) => setFormData({ ...formData, sessionCount: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Matlamat Sesi Kaunseling *</label>
            <textarea
              rows={2}
              required
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              placeholder="Jelaskan sasaran penerokaan dan hasil yang ingin dicapai klien..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Intervensi, Teori & Pendekatan Digunakan *
            </label>
            <textarea
              rows={2}
              required
              value={formData.intervention}
              onChange={(e) => setFormData({ ...formData, intervention: e.target.value })}
              placeholder="cth: Terapi Tingkah Laku, CBT, Peneguhan Positif, Kontrak Murid..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
            />
          </div>

          {/* Psychometric Sub-Section */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-purple-500/30 space-y-2.5">
            <div className="font-bold text-purple-300 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-yellow-400" />
              <span>Pentaksiran Psikometrik / Ujian Personaliti / Saringan Minda Sihat</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={formData.psychometricData?.instrumentName || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    psychometricData: {
                      instrumentName: e.target.value,
                      scoreResult: formData.psychometricData?.scoreResult || '',
                      actionPlan: formData.psychometricData?.actionPlan || ''
                    }
                  })
                }
                placeholder="Nama Instrumen (cth: IMK RIASEC / PHQ-9)"
                className="px-3 py-1.5 bg-slate-900 border border-white/15 rounded-lg text-white"
              />
              <input
                type="text"
                value={formData.psychometricData?.scoreResult || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    psychometricData: {
                      instrumentName: formData.psychometricData?.instrumentName || '',
                      scoreResult: e.target.value,
                      actionPlan: formData.psychometricData?.actionPlan || ''
                    }
                  })
                }
                placeholder="Skor / Keputusan Analisis"
                className="px-3 py-1.5 bg-slate-900 border border-white/15 rounded-lg text-white"
              />
            </div>
            <input
              type="text"
              value={formData.psychometricData?.actionPlan || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  psychometricData: {
                    instrumentName: formData.psychometricData?.instrumentName || '',
                    scoreResult: formData.psychometricData?.scoreResult || '',
                    actionPlan: e.target.value
                  }
                })
              }
              placeholder="Pelan Tindakan Berdasarkan Skor"
              className="w-full px-3 py-1.5 bg-slate-900 border border-white/15 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Status Sesi Semasa *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
            >
              <option value="aktif">Sesi Aktif / Dalam Pemantauan</option>
              <option value="selesai">Sesi Selesai (Objektif Tercapai)</option>
              <option value="rujuk_pakar">Rujuk Pakar (Hospital / PKD / JKM)</option>
            </select>
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
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-lg"
            >
              Simpan Rekod Sesi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
