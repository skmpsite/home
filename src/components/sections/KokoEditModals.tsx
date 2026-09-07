import React, { useState, useEffect } from 'react';
import { X, Trophy, Shield, Heart, Award, Cpu, BookOpen, Target, Check, AlertTriangle } from 'lucide-react';
import { CoCurriculumUnit } from '../../types';

// Modal to Edit or Add a CoCurriculum Unit
interface EditUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUnit?: CoCurriculumUnit | null;
  defaultCategory?: 'beruniform' | 'kelab' | 'sukan';
  isNew?: boolean;
  onSave: (unit: CoCurriculumUnit) => void;
}

export const EditUnitModal: React.FC<EditUnitModalProps> = ({
  isOpen,
  onClose,
  initialUnit,
  defaultCategory = 'beruniform',
  isNew = false,
  onSave
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'beruniform' | 'kelab' | 'sukan'>('beruniform');
  const [description, setDescription] = useState('');
  const [advisorTeacher, setAdvisorTeacher] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [iconName, setIconName] = useState<string>('Trophy');

  useEffect(() => {
    if (initialUnit) {
      setName(initialUnit.name || '');
      setCategory(initialUnit.category || defaultCategory);
      setDescription(initialUnit.description || '');
      setAdvisorTeacher(initialUnit.advisorTeacher || '');
      setMeetingTime(initialUnit.meetingTime || '');
      setIconName(initialUnit.iconName || 'Trophy');
    } else {
      setName('');
      setCategory(defaultCategory);
      setDescription('');
      setAdvisorTeacher('');
      setMeetingTime('Setiap Rabu (2.00 petang - 4.00 petang)');
      setIconName(defaultCategory === 'beruniform' ? 'Shield' : defaultCategory === 'kelab' ? 'BookOpen' : 'Trophy');
    }
  }, [initialUnit, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const unit: CoCurriculumUnit = {
      id: initialUnit?.id || `koko-${Date.now()}`,
      name: name.trim(),
      category,
      description: description.trim(),
      advisorTeacher: advisorTeacher.trim() || 'Akan Dimaklumkan',
      meetingTime: meetingTime.trim() || 'Setiap Rabu (2.00 ptg - 4.00 ptg)',
      iconName
    };

    onSave(unit);
    onClose();
  };

  const availableIcons = [
    { name: 'Shield', icon: Shield, label: 'Perisai' },
    { name: 'Award', icon: Award, label: 'Lencana' },
    { name: 'Trophy', icon: Trophy, label: 'Piala' },
    { name: 'Target', icon: Target, label: 'Sasaran' },
    { name: 'BookOpen', icon: BookOpen, label: 'Buku' },
    { name: 'Cpu', icon: Cpu, label: 'Teknologi' },
    { name: 'Heart', icon: Heart, label: 'Bulan Sabit' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-white">
                {isNew ? 'Tambah Unit Kokurikulum Baharu' : 'Sunting Unit Kokurikulum'}
              </h4>
              <p className="text-xs text-slate-400">
                Lengkapkan maklumat unit, guru penasihat dan masa perjumpaan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Nama Unit Kokurikulum *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Pengakap Kanak-Kanak / Kelab Robotik / Bola Sepak"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Kategori Unit *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-yellow-400 transition"
              >
                <option value="beruniform">Badan Beruniform</option>
                <option value="kelab">Kelab & Persatuan</option>
                <option value="sukan">Sukan & Permainan</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Pilihan Ikon Unit</label>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {availableIcons.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = iconName === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setIconName(item.name)}
                      className={`p-2 rounded-xl border transition cursor-pointer flex-shrink-0 ${
                        isSelected
                          ? 'bg-yellow-400 text-blue-950 border-yellow-400 font-black shadow-md'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                      title={item.label}
                    >
                      <IconComp className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Guru Penasihat *</label>
            <input
              type="text"
              required
              value={advisorTeacher}
              onChange={(e) => setAdvisorTeacher(e.target.value)}
              placeholder="Contoh: En. Ahmad Razak bin Ismail & Pn. Noraini"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Masa Perjumpaan</label>
            <input
              type="text"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              placeholder="Contoh: Setiap Rabu (2.00 ptg - 4.00 ptg)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Penerangan / Objektif Unit</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ringkasan aktiviti, pencapaian dan matlamat unit ini..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isNew ? 'Tambah Unit' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal to Edit Kokurikulum Title & Motto Info
interface EditKokoBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: string;
  title: string;
  description: string;
  onSave: (info: { badge: string; title: string; description: string }) => void;
}

export const EditKokoBannerModal: React.FC<EditKokoBannerModalProps> = ({
  isOpen,
  onClose,
  badge: initialBadge,
  title: initialTitle,
  description: initialDescription,
  onSave
}) => {
  const [badge, setBadge] = useState(initialBadge);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    setBadge(initialBadge);
    setTitle(initialTitle);
    setDescription(initialDescription);
  }, [initialBadge, initialTitle, initialDescription, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      badge: badge.trim() || 'Aktiviti Luar Bilik Darjah',
      title: title.trim() || 'Aktiviti Kokurikulum & Pembangunan Bakat',
      description: description.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/20 text-yellow-300 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-white">Sunting Maklumat Utama Kokurikulum</h4>
              <p className="text-xs text-slate-400">Kemaskini tajuk utama, slogan dan penerangan aktiviti</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Slogan / Tagline Badge *</label>
            <input
              type="text"
              required
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="Contoh: Aktiviti Luar Bilik Darjah"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Tajuk Utama Kokurikulum *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Aktiviti Kokurikulum & Pembangunan Bakat"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Penerangan Ringkas</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Penerangan mengenai penyertaan murid dalam kokurikulum..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Maklumat</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
