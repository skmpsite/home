import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, User, Award, Phone, Calendar, Clock, MapPin, Tag, FileText, CreditCard, QrCode, AlertCircle, Sparkles } from 'lucide-react';
import { PibgCommittee, PibgActivity, PibgUsul } from '../../../types';
import { PibgOfficialDocument } from '../../../data/pibgData';

/* =========================================================================
   1. MODAL: EDIT / TAMBAH AHLI JAWATANKUASA PIBG
   ========================================================================= */
interface EditCommitteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: PibgCommittee | null;
  isNew?: boolean;
  onSave: (member: PibgCommittee) => void;
  onDelete?: (id: string) => void;
}

export const EditCommitteeModal: React.FC<EditCommitteeModalProps> = ({
  isOpen,
  onClose,
  member,
  isNew = false,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<PibgCommittee>({
    id: `pibg-c-${Date.now()}`,
    name: '',
    position: '',
    category: 'ibu_bapa',
    phone: '',
    photoUrl: ''
  });

  useEffect(() => {
    if (member) {
      setFormData(member);
    } else {
      setFormData({
        id: `pibg-c-${Date.now()}`,
        name: '',
        position: 'Ahli Jawatankuasa (Waris)',
        category: 'ibu_bapa',
        phone: '',
        photoUrl: ''
      });
    }
  }, [member, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.position.trim()) {
      alert('Sila lengkapkan Nama dan Jawatan.');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/40 text-white rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-black text-white">
              {isNew ? 'Tambah Ahli Jawatankuasa PIBG' : 'Kemas Kini Ahli Jawatankuasa'}
            </h4>
            <p className="text-xs text-amber-300/80">
              Pengurusan Carta Organisasi PIBG Sesi 2026/2027 (Khas S/U PIBG & Admin)
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Nama Penuh & Gelaran *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Contoh: En. Asmadi bin Musa"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Jawatan Rasmi *</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
                placeholder="Contoh: Yang Dipertua (YDP) / Setiausaha"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Kategori Keahlian</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as 'guru' | 'ibu_bapa' })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="guru">Guru (Kakitangan Sekolah)</option>
                <option value="ibu_bapa">Waris (Ibu Bapa / Komuniti)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">No. Telefon (Pilihan)</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Contoh: 019-XXXXXXX"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Pautan URL Gambar (Pilihan)</label>
              <input
                type="text"
                value={formData.photoUrl || ''}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            {!isNew && onDelete && member && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Adakah anda pasti mahu memadam ahli "${member.name}" daripada jawatankuasa PIBG?`)) {
                    onDelete(member.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Padam</span>
              </button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================================
   2. MODAL: EDIT / TAMBAH PROGRAM TAKWIM PIBG
   ========================================================================= */
interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: PibgActivity | null;
  isNew?: boolean;
  onSave: (activity: PibgActivity) => void;
  onDelete?: (id: string) => void;
}

export const EditActivityModal: React.FC<EditActivityModalProps> = ({
  isOpen,
  onClose,
  activity,
  isNew = false,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<PibgActivity>({
    id: `act-${Date.now()}`,
    title: '',
    date: '28 Mac 2026',
    description: '',
    type: 'mesyuarat',
    organizer: 'PIBG SKMP'
  });

  useEffect(() => {
    if (activity) {
      setFormData(activity);
    } else {
      setFormData({
        id: `act-${Date.now()}`,
        title: '',
        date: '28 Mac 2026',
        description: '',
        type: 'mesyuarat',
        organizer: 'PIBG SKMP'
      });
    }
  }, [activity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date.trim()) {
      alert('Sila isi Tajuk dan Tarikh aktiviti.');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-blue-500/40 text-white rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-black text-white">
              {isNew ? 'Tambah Aktiviti / Takwim PIBG' : 'Kemas Kini Aktiviti Takwim'}
            </h4>
            <p className="text-xs text-blue-300/80">
              Pengurusan Program & Jadual PIBG SKMP (Khas S/U PIBG & Admin)
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tajuk Program / Aktiviti *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Contoh: Mesyuarat Agung Tahunan PIBG Kali Ke-36"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Tarikh Program *</label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                placeholder="Contoh: 28 Mac 2026"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Penganjur / Jawatankuasa</label>
              <input
                type="text"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                placeholder="Contoh: Jawatankuasa PIBG SKMP"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Kategori / Jenis</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as PibgActivity['type'] })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400"
            >
              <option value="mesyuarat">Mesyuarat (Agung / Khas / AJK)</option>
              <option value="aktiviti">Aktiviti / Program Sekolah & Komuniti</option>
              <option value="sumbangan">Sumbangan / Tajaan Pembangunan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Penerangan / Objektif</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Huraian ringkas program, penglibatan ibu bapa, sasaran, dll..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            {!isNew && onDelete && activity && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Adakah anda pasti mahu memadam aktiviti "${activity.title}"?`)) {
                    onDelete(activity.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Padam</span>
              </button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Aktiviti</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================================
   3. MODAL: PENGURUSAN STATUS & MAKLUM BALAS USUL WARIS
   ========================================================================= */
interface EditUsulFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  usul: PibgUsul | null;
  onSave: (usulId: string, status: PibgUsul['status'], feedback: string) => void;
  onDelete?: (usulId: string) => void;
}

export const EditUsulFeedbackModal: React.FC<EditUsulFeedbackModalProps> = ({
  isOpen,
  onClose,
  usul,
  onSave,
  onDelete
}) => {
  const [status, setStatus] = useState<PibgUsul['status']>('diterima');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (usul) {
      setStatus(usul.status);
      setFeedback(usul.adminFeedback || '');
    }
  }, [usul, isOpen]);

  if (!isOpen || !usul) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(usul.id, status, feedback);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-emerald-500/40 text-white rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-black text-white">Tindakan & Maklum Balas Usul</h4>
            <p className="text-xs text-emerald-300/80">
              Pengurusan Status Rasmi Jawatankuasa PIBG (Khas S/U PIBG & Admin)
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-white/10 space-y-1.5 text-xs">
          <p className="font-bold text-amber-300">{usul.title}</p>
          <p className="text-slate-300 leading-relaxed italic">"{usul.description}"</p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 border-t border-white/5">
            <span>Daripada: <strong>{usul.parentName}</strong></span>
            <span>Tel: <strong>{usul.phone}</strong></span>
            <span>Murid: <strong>{usul.studentName} ({usul.studentClass})</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Status Usul *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PibgUsul['status'])}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400 font-bold"
            >
              <option value="diterima">📥 Diterima (Dalam Rekod Pangkalan Data)</option>
              <option value="pertimbangan">⏳ Dalam Pertimbangan Jawatankuasa</option>
              <option value="diluluskan">✅ Diluluskan untuk Pelaksanaan</option>
              <option value="selesai">🎯 Selesai Dilaksanakan</option>
              <option value="ditolak">❌ Tidak Dapat Dilaksanakan / Ditolak</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Maklum Balas Rasmi S/U PIBG & Pentadbiran Sekolah
            </label>
            <textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tulis maklum balas jawatankuasa, tindakan sekolah, atau keputusan mesyuarat untuk rujukan waris..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Adakah anda pasti mahu memadam usul daripada "${usul.parentName}"?`)) {
                    onDelete(usul.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Padam Usul</span>
              </button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Kemas Kini Maklum Balas</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================================
   4. MODAL: TAMBAH DOKUMEN MUAT TURUN PIBG
   ========================================================================= */
interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (doc: PibgOfficialDocument) => void;
}

export const EditDocumentModal: React.FC<EditDocumentModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<PibgOfficialDocument>({
    id: `doc-${Date.now()}`,
    title: '',
    category: 'minit',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    updatedDate: '11 Sept 2026',
    description: '',
    downloadUrl: '#'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Sila masukkan tajuk dokumen.');
      return;
    }
    onSave({ ...formData, id: `doc-${Date.now()}` });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-blue-500/40 text-white rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-black text-white">Tambah Dokumen Rasmi PIBG</h4>
            <p className="text-xs text-blue-300/80">Pusat Muat Turun Dokumen (Khas S/U PIBG & Admin)</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Tajuk Dokumen *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Contoh: Notis Panggilan Mesyuarat Agung PIBG Kali Ke-36"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Kategori Dokumen</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as PibgOfficialDocument['category'] })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400"
              >
                <option value="minit">Minit Mesyuarat Agung / AJK</option>
                <option value="notis">Notis / Surat Siaran PIBG</option>
                <option value="penyata">Penyata Kewangan Beraudit</option>
                <option value="borang">Borang & Lampiran Rasmi</option>
                <option value="pekeliling">Pekeliling Ikhtisas KPM PIBG</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Format Fail</label>
              <select
                value={formData.fileType}
                onChange={(e) => setFormData({ ...formData, fileType: e.target.value as 'PDF' | 'DOCX' })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400"
              >
                <option value="PDF">Dokumen PDF (.pdf)</option>
                <option value="DOCX">Dokumen Word (.docx)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Anggaran Saiz</label>
              <input
                type="text"
                value={formData.fileSize}
                onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                placeholder="1.5 MB"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Tarikh Kemaskini</label>
              <input
                type="text"
                value={formData.updatedDate}
                onChange={(e) => setFormData({ ...formData, updatedDate: e.target.value })}
                placeholder="11 Sept 2026"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Penerangan Ringkas</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Penerangan ringkas mengenai kandungan dokumen..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Pautan Dokumen / Google Drive</label>
            <input
              type="text"
              value={formData.downloadUrl}
              onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
              placeholder="https://drive.google.com/..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Dokumen</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
