import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  FileCheck2,
  ShieldAlert,
  School,
  Sparkles,
  PenTool,
  Printer,
  ChevronRight,
  TrendingUp,
  X,
  FileText
} from 'lucide-react';
import { UbkPbpppAssessment } from '../../types';

interface UbkPbpppTabProps {
  assessment: UbkPbpppAssessment;
  isPentadbir: boolean;
  canEdit: boolean;
  onSaveAssessment: (updated: UbkPbpppAssessment) => void;
}

export const UbkPbpppTab: React.FC<UbkPbpppTabProps> = ({
  assessment,
  isPentadbir,
  canEdit,
  onSaveAssessment
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Clarification Banner: Dedicated GBK PBPPP Instrument vs PdPC */}
      <div className="bg-gradient-to-br from-amber-950/70 via-slate-900 to-indigo-950 rounded-2xl border-2 border-amber-500/40 p-5 sm:p-6 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-400/40">
              <Award className="w-3.5 h-3.5" />
              Komponen 4: Penilaian Bersepadu Pegawai Perkhidmatan Pendidikan (PBPPP)
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-white">
              Instrumen Penilaian PBPPP Khas Guru Bimbingan & Kaunseling (GBK)
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
              <strong>Ketetapan Rasmi KPM:</strong> Guru Bimbingan dan Kaunseling (GBK) dinilai
              menggunakan <em>Instrumen Khas Perkhidmatan Bimbingan dan Kaunseling</em>, dan{' '}
              <span className="text-amber-300 font-bold underline">
                BUKAN menggunakan borang penilaian Pengajaran dan Pemudahcaraan (PdPC)
              </span>{' '}
              guru akademik bilik darjah.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isPentadbir && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg font-bold flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <PenTool className="w-4 h-4" />
                <span>Nilaikan / Kemas Kini Skor PBPPP</span>
              </button>
            )}
          </div>
        </div>

        {/* Comparison Pills */}
        <div className="pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-rose-950/40 p-3 rounded-xl border border-rose-500/30 text-rose-200">
            <span className="font-black text-rose-300 flex items-center gap-1 mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Borang PdPC Guru Akademik (Tidak Terpakai untuk GBK):
            </span>
            <p className="text-[11px] text-slate-300">
              Menilai pengajaran subjek, Standard Kandungan DSKP, pedagogi bilik darjah, dan Pentaksiran Bilik Darjah (PBD) mata pelajaran.
            </p>
          </div>

          <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30 text-emerald-200">
            <span className="font-black text-emerald-300 flex items-center gap-1 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Instrumen Khas B&K GBKSM (Terpakai & Berkuat Kuasa):
            </span>
            <p className="text-[11px] text-slate-300">
              Menilai 4 dimensi perkhidmatan: e-BRPBK, sesi kaunseling terapeutik, bimbingan modular 4 fokus, dan pengurusan bilik UBK serta kolaborasi komuniti.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Overall PBPPP Score Overview */}
      <div className="bg-slate-900/90 rounded-2xl border border-white/10 p-5 sm:p-6 shadow-md grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="md:col-span-1 text-center border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-4">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Markah Keseluruhan PBPPP
          </div>
          <div className="text-3xl sm:text-4xl font-black text-yellow-400 mt-1">
            {assessment.overallPercentage.toFixed(1)}%
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 mt-2">
            <Sparkles className="w-3 h-3 text-yellow-300" />
            Taraf: {assessment.gradeLevel}
          </div>
        </div>

        <div className="md:col-span-3 space-y-2 text-xs text-slate-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5">
              <span className="text-slate-400">Pegawai Yang Dinilai:</span>
              <div className="text-white font-bold">{assessment.counselorName}</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5">
              <span className="text-slate-400">Tahun Penilaian:</span>
              <div className="text-white font-bold">{assessment.evaluatedYear}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5">
              <span className="text-slate-400">Pegawai Penilai 1 (PP1):</span>
              <div className="text-emerald-300 font-semibold">{assessment.evaluator1Name}</div>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-white/5">
              <span className="text-slate-400">Pegawai Penilai 2 (PP2):</span>
              <div className="text-emerald-300 font-semibold">{assessment.evaluator2Name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The 4 Dimensions Breakdown */}
      <div className="space-y-4">
        <h4 className="text-base font-black text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Perincian 4 Dimensi Instrumen Penilaian GBK</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessment.dimensions.map((dim, idx) => (
            <div
              key={dim.id}
              className="bg-slate-900/90 rounded-2xl border border-white/10 p-5 flex flex-col justify-between gap-4 shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    Wajaran: {dim.weightage}%
                  </span>
                  <span className="text-sm font-black text-emerald-400">
                    {dim.score} / {dim.maxScore} Mata
                  </span>
                </div>

                <h5 className="text-base font-black text-white">{dim.name}</h5>
                <p className="text-xs text-slate-300 leading-relaxed">{dim.description}</p>

                {/* Indicators */}
                <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs">
                  <div className="font-bold text-slate-400 text-[11px] uppercase">
                    Deskriptor / Evidens Penilaian:
                  </div>
                  <ul className="space-y-1 text-slate-300">
                    {dim.indicators.map((ind, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Progress bar */}
              <div className="pt-2 border-t border-white/5 space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Pencapaian Dimensi</span>
                  <span className="font-bold text-white">
                    {((dim.score / dim.maxScore) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/10">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                    style={{ width: `${(dim.score / dim.maxScore) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Evaluator Feedback Box */}
      <div className="bg-slate-900/90 rounded-2xl border border-emerald-500/30 p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-black text-white">
          <School className="w-4 h-4 text-emerald-400" />
          <span>Ulasan & Perakuan Panel Penilai Pentadbir</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 italic bg-slate-950 p-4 rounded-xl border border-white/5 leading-relaxed">
          "{assessment.evaluatorFeedback}"
        </p>
        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
          <span>Tarikh Penilaian Terakhir: {assessment.lastUpdated}</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Disahkan untuk Penarafan PBPPP KPM
          </span>
        </div>
      </div>

      {/* Modal Edit Assessment */}
      {isEditModalOpen && (
        <PbpppModal
          isOpen={isEditModalOpen}
          assessment={assessment}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updated) => {
            onSaveAssessment(updated);
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Modal for PBPPP Scoring
const PbpppModal: React.FC<{
  isOpen: boolean;
  assessment: UbkPbpppAssessment;
  onClose: () => void;
  onSave: (updated: UbkPbpppAssessment) => void;
}> = ({ isOpen, assessment, onClose, onSave }) => {
  const [formData, setFormData] = useState<UbkPbpppAssessment>({ ...assessment });

  if (!isOpen) return null;

  const handleScoreChange = (dimId: string, val: number) => {
    const updatedDimensions = formData.dimensions.map((dim) =>
      dim.id === dimId ? { ...dim, score: Math.min(dim.maxScore, Math.max(0, val)) } : dim
    );
    const totalScore = updatedDimensions.reduce((acc, curr) => acc + curr.score, 0);
    const maxTotal = updatedDimensions.reduce((acc, curr) => acc + curr.maxScore, 0);
    const pct = (totalScore / maxTotal) * 100;
    const grade: UbkPbpppAssessment['gradeLevel'] =
      pct >= 90 ? 'Cemerlang' : pct >= 80 ? 'Baik' : pct >= 60 ? 'Sederhana' : 'Perlu Bimbingan';

    setFormData({
      ...formData,
      dimensions: updatedDimensions,
      overallPercentage: pct,
      gradeLevel: grade
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: 'selesai_dinilai'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 rounded-3xl max-w-2xl w-full border border-amber-500/40 shadow-2xl overflow-hidden text-white my-8">
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <h3 className="text-base font-black text-white">Penilaian Skor PBPPP Khas GBK</h3>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Pegawai Penilai 1 (Guru Besar)</label>
              <input
                type="text"
                value={formData.evaluator1Name}
                onChange={(e) => setFormData({ ...formData, evaluator1Name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Pegawai Penilai 2 (PK HEM)</label>
              <input
                type="text"
                value={formData.evaluator2Name}
                onChange={(e) => setFormData({ ...formData, evaluator2Name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-white/15 rounded-xl text-white"
              />
            </div>
          </div>

          {/* Scores for the 4 Dimensions */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="font-bold text-slate-200">
              Pemarkahan Mengikut 4 Dimensi Instrumen Khas GBK:
            </div>
            {formData.dimensions.map((dim) => (
              <div
                key={dim.id}
                className="bg-slate-950 p-3 rounded-xl border border-white/10 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-white text-xs">{dim.name}</div>
                  <div className="text-[10px] text-slate-400">
                    Wajaran Maksimum: {dim.maxScore} mata
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max={dim.maxScore}
                    value={dim.score}
                    onChange={(e) => handleScoreChange(dim.id, parseFloat(e.target.value) || 0)}
                    className="w-20 px-2.5 py-1.5 bg-slate-900 border border-white/20 rounded-lg text-white text-right font-black text-sm"
                  />
                  <span className="text-slate-400 font-bold">/ {dim.maxScore}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/30 flex items-center justify-between">
            <span className="font-bold text-amber-200">Jumlah Peratus Skor:</span>
            <span className="font-black text-lg text-yellow-300">
              {formData.overallPercentage.toFixed(1)}% ({formData.gradeLevel})
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Ulasan & Rumusan Penilaian Pentadbir *
            </label>
            <textarea
              rows={4}
              required
              value={formData.evaluatorFeedback}
              onChange={(e) => setFormData({ ...formData, evaluatorFeedback: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-white"
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
              className="px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black shadow-lg"
            >
              Simpan & Sahkan PBPPP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
