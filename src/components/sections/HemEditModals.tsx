import React, { useState } from 'react';
import {
  X,
  Scale,
  Smile,
  Utensils,
  BookMarked,
  Coins,
  ShieldCheck,
  Users,
  Sparkles,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Percent,
  Activity,
  HeartHandshake
} from 'lucide-react';
import { HemRuleItem, HemOfficer, HemRmtMenuItem } from '../../types';

// 1. Modal: Sunting Statistik Pantas HEM
interface EditStatsModalProps {
  stats: {
    spbtPercentage: string;
    rmtCount: string;
    bapAmount: string;
    sahsiahPercentage: string;
  };
  onClose: () => void;
  onSave: (stats: {
    spbtPercentage: string;
    rmtCount: string;
    bapAmount: string;
    sahsiahPercentage: string;
  }) => void;
}

export const EditStatsModal: React.FC<EditStatsModalProps> = ({ stats, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...stats });

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 border border-white/20 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-yellow-400" />
            <h3 className="font-black text-white text-base">Kemas Kini Statistik Utama HEM</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(formData);
          }}
          className="space-y-3.5 text-xs"
        >
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Peratus Penerima SPBT (Buku Teks)
            </label>
            <input
              type="text"
              required
              value={formData.spbtPercentage}
              onChange={(e) => setFormData({ ...formData, spbtPercentage: e.target.value })}
              placeholder="Contoh: 100%"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Bilangan Murid Penerima RMT
            </label>
            <input
              type="text"
              required
              value={formData.rmtCount}
              onChange={(e) => setFormData({ ...formData, rmtCount: e.target.value })}
              placeholder="Contoh: 78 Murid"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Kadar Bantuan Awal Persekolahan (BAP)
            </label>
            <input
              type="text"
              required
              value={formData.bapAmount}
              onChange={(e) => setFormData({ ...formData, bapAmount: e.target.value })}
              placeholder="Contoh: RM150"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Peratusan Amalan Sahsiah Baik (SSDM)
            </label>
            <input
              type="text"
              required
              value={formData.sahsiahPercentage}
              onChange={(e) => setFormData({ ...formData, sahsiahPercentage: e.target.value })}
              placeholder="Contoh: 96.8%"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black transition shadow-md"
            >
              Simpan Statistik
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Modal: Sunting Info & Ucapan Penerangan HEM
interface EditSpeechModalProps {
  speech: string;
  onClose: () => void;
  onSave: (speech: string) => void;
}

export const EditSpeechModal: React.FC<EditSpeechModalProps> = ({ speech, onClose, onSave }) => {
  const [text, setText] = useState(speech);

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 border border-white/20 text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-400" />
            <h3 className="font-black text-white text-base">Kemas Kini Penerangan & Misi HEM</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(text);
          }}
          className="space-y-3.5 text-xs"
        >
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Teks Penerangan / Ucapan Pengurusan HEM *
            </label>
            <textarea
              rows={5}
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Masukkan penerangan visi & misi Hal Ehwal Murid..."
              className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 leading-relaxed font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black transition shadow-md"
            >
              Simpan Penerangan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. Modal: Tambah / Sunting Peraturan Disiplin
interface EditRuleModalProps {
  rule: HemRuleItem;
  isNew: boolean;
  onClose: () => void;
  onSave: (rule: HemRuleItem) => void;
}

export const EditRuleModal: React.FC<EditRuleModalProps> = ({ rule, isNew, onClose, onSave }) => {
  const [formData, setFormData] = useState<HemRuleItem>({ ...rule });

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/30 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h3 className="font-black text-white text-base">
              {isNew ? 'Tambah Peraturan Disiplin Baharu' : 'Sunting Peraturan Disiplin'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!formData.title.trim() || !formData.desc.trim()) return;
            onSave(formData);
          }}
          className="space-y-3.5 text-xs"
        >
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Tajuk / Topik Peraturan *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Kehadiran Pagi / Etika Pakaian"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Penerangan Ringkas Peraturan *
            </label>
            <textarea
              rows={3}
              required
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              placeholder="Contoh: Wajib berada di tapak perhimpunan sebelum 7.20 pagi."
              className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Jenis Notis / Ikon
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full bg-slate-800 border border-white/20 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
            >
              <option value="info">Biru (Maklumat / Standard)</option>
              <option value="warning">Merah (Peringatan Penting / Larangan)</option>
              <option value="success">Hijau (Amalan Positif / Galakan)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black transition shadow-md"
            >
              {isNew ? 'Tambah Peraturan' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 4. Modal: Tambah / Sunting Perkhidmatan UBK
interface EditUbkModalProps {
  service: { title: string; desc: string };
  isNew: boolean;
  onClose: () => void;
  onSave: (service: { title: string; desc: string }) => void;
}

export const EditUbkModal: React.FC<EditUbkModalProps> = ({ service, isNew, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...service });

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 border border-purple-500/30 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-purple-400" />
            <h3 className="font-black text-white text-base">
              {isNew ? 'Tambah Perkhidmatan UBK' : 'Sunting Perkhidmatan UBK'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!formData.title.trim() || !formData.desc.trim()) return;
            onSave(formData);
          }}
          className="space-y-3.5 text-xs"
        >
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Nama Perkhidmatan / Aktiviti UBK *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Kaunseling Individu / Guru Penyayang"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Penerangan Perkhidmatan *
            </label>
            <textarea
              rows={3}
              required
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              placeholder="Contoh: Sesi bimbingan peribadi bersama Guru Kaunseling bertauliah."
              className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-400 hover:bg-purple-300 text-slate-950 font-black transition shadow-md"
            >
              {isNew ? 'Tambah Perkhidmatan' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 5. Modal: Tambah / Sunting Menu RMT
interface EditRmtModalProps {
  item: HemRmtMenuItem;
  isNew: boolean;
  onClose: () => void;
  onSave: (item: HemRmtMenuItem) => void;
}

export const EditRmtModal: React.FC<EditRmtModalProps> = ({ item, isNew, onClose, onSave }) => {
  const [formData, setFormData] = useState<HemRmtMenuItem>({ ...item });

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/30 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-400" />
            <h3 className="font-black text-white text-base">
              {isNew ? 'Tambah Jadual Menu RMT' : 'Sunting Menu RMT'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!formData.day.trim() || !formData.menu.trim()) return;
            onSave(formData);
          }}
          className="space-y-3.5 text-xs"
        >
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Hari Persekolahan *
            </label>
            <input
              type="text"
              required
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              placeholder="Contoh: Ahad / Isnin / Selasa"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Menu Sajian Makanan Berkhasiat *
            </label>
            <textarea
              rows={3}
              required
              value={formData.menu}
              onChange={(e) => setFormData({ ...formData, menu: e.target.value })}
              placeholder="Contoh: Nasi Ayam Kukus + Sayur Sawi + Buah Epal + Air Masak"
              className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black transition shadow-md"
            >
              {isNew ? 'Tambah Menu' : 'Simpan Menu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 6. Modal: Tambah / Sunting Pegawai Jawatankuasa Induk HEM
interface EditOfficerModalProps {
  officer: HemOfficer;
  isNew: boolean;
  onClose: () => void;
  onSave: (officer: HemOfficer) => void;
}

export const EditOfficerModal: React.FC<EditOfficerModalProps> = ({ officer, isNew, onClose, onSave }) => {
  const [formData, setFormData] = useState<HemOfficer>({ ...officer });

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 border border-white/20 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-400" />
            <h3 className="font-black text-white text-base">
              {isNew ? 'Tambah Pegawai Jawatankuasa HEM' : 'Sunting Maklumat Pegawai HEM'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!formData.name.trim() || !formData.role.trim()) return;
            onSave(formData);
          }}
          className="space-y-3.5 text-xs"
        >
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Jawatan / Peranan *
            </label>
            <input
              type="text"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Contoh: Setiausaha HEM / Penyelaras SPBT / Guru Disiplin"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Nama Guru / Pegawai *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Cikgu Norhafiza binti Dolah"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Unit / Bahagian
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="Contoh: Disiplin / SPBT / 3K"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                No. Telefon (Pilihan)
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Contoh: 012-3456789"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black transition shadow-md"
            >
              {isNew ? 'Tambah Pegawai' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 7. Modal: Tambah / Sunting Teks Item (SPBT Guidelines, BAP Details, 3K Points)
interface EditPointModalProps {
  title: string;
  categoryLabel: string;
  value: string;
  isNew: boolean;
  onClose: () => void;
  onSave: (val: string) => void;
}

export const EditPointModal: React.FC<EditPointModalProps> = ({
  title,
  categoryLabel,
  value,
  isNew,
  onClose,
  onSave
}) => {
  const [text, setText] = useState(value);

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 border border-white/20 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <span className="text-[10px] font-black uppercase text-yellow-400">{categoryLabel}</span>
            <h3 className="font-black text-white text-base">
              {isNew ? `Tambah ${title}` : `Sunting ${title}`}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            onSave(text);
          }}
          className="space-y-3.5 text-xs"
        >
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Kandungan Maklumat *
            </label>
            <textarea
              rows={4}
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Masukkan maklumat atau panduan..."
              className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 font-medium leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black transition shadow-md"
            >
              {isNew ? 'Tambah' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
