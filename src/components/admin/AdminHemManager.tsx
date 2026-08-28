import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Scale,
  Smile,
  Heart,
  Utensils,
  BookMarked,
  Coins,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Sparkles,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  X,
  Users,
  AlertTriangle,
  UserCheck,
  PhoneCall,
  ExternalLink
} from 'lucide-react';
import { HemData, HemOfficer, HemRuleItem, HemRmtMenuItem } from '../../types';
import { initialHemData } from '../../data/initialData';

interface AdminHemManagerProps {
  hemData: HemData;
  onSaveHemData: (data: HemData) => void;
  showToast: (msg: string) => void;
}

export const AdminHemManager: React.FC<AdminHemManagerProps> = ({
  hemData,
  onSaveHemData,
  showToast
}) => {
  const [formData, setFormData] = useState<HemData>(() => JSON.parse(JSON.stringify(hemData || initialHemData)));
  const [activeHemTab, setActiveHemTab] = useState<
    'overview' | 'disiplin' | 'kebajikan' | '3k' | 'committee'
  >('overview');

  // Sync state when hemData changes externally
  useEffect(() => {
    if (hemData) {
      setFormData(JSON.parse(JSON.stringify(hemData)));
    }
  }, [hemData]);

  // Modal / Editing states for sub-items
  const [editingRule, setEditingRule] = useState<HemRuleItem | null>(null);
  const [newRule, setNewRule] = useState<Omit<HemRuleItem, 'id'>>({
    title: '',
    desc: '',
    type: 'info'
  });

  const [editingUbkService, setEditingUbkService] = useState<{ index: number; title: string; desc: string } | null>(null);
  const [newUbkService, setNewUbkService] = useState({ title: '', desc: '' });

  const [editingRmtMenu, setEditingRmtMenu] = useState<{ index: number; day: string; menu: string } | null>(null);
  const [newRmtMenu, setNewRmtMenu] = useState({ day: 'Isnin', menu: '' });

  const [editingOfficer, setEditingOfficer] = useState<HemOfficer | null>(null);
  const [newOfficer, setNewOfficer] = useState<Omit<HemOfficer, 'id'>>({
    role: '',
    name: '',
    unit: '',
    phone: ''
  });

  // String array helpers for guidelines/points
  const [newSpbtGuideline, setNewSpbtGuideline] = useState('');
  const [newBapDetail, setNewBapDetail] = useState('');
  const [newSafetyPoint, setNewSafetyPoint] = useState('');
  const [newHealthPoint, setNewHealthPoint] = useState('');
  const [newCleanlinessPoint, setNewCleanlinessPoint] = useState('');

  const handleSaveAll = (customData?: HemData) => {
    const dataToSave = customData || formData;
    onSaveHemData(dataToSave);
    showToast('✨ Maklumat Hal Ehwal Murid (HEM) Berjaya Dikemas Kini & Disimpan!');
  };

  const handleResetToDefault = () => {
    if (window.confirm('Adakah anda pasti ingin memulihkan semua data HEM kepada tetapan asal sekolah?')) {
      const def = JSON.parse(JSON.stringify(initialHemData));
      setFormData(def);
      onSaveHemData(def);
      showToast('🔄 Maklumat HEM Telah Dipulihkan Kepada Asal!');
    }
  };

  // Rule Handlers
  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.title.trim()) return;
    const rule: HemRuleItem = {
      id: 'rule-' + Date.now(),
      title: newRule.title.trim(),
      desc: newRule.desc.trim(),
      type: newRule.type
    };
    const updated = {
      ...formData,
      disiplin: {
        ...formData.disiplin,
        rules: [...(formData.disiplin?.rules || []), rule]
      }
    };
    setFormData(updated);
    handleSaveAll(updated);
    setNewRule({ title: '', desc: '', type: 'info' });
  };

  const handleUpdateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    const updated = {
      ...formData,
      disiplin: {
        ...formData.disiplin,
        rules: formData.disiplin.rules.map((r) => (r.id === editingRule.id ? editingRule : r))
      }
    };
    setFormData(updated);
    handleSaveAll(updated);
    setEditingRule(null);
  };

  const handleDeleteRule = (id: string) => {
    const updated = {
      ...formData,
      disiplin: {
        ...formData.disiplin,
        rules: formData.disiplin.rules.filter((r) => r.id !== id)
      }
    };
    setFormData(updated);
    handleSaveAll(updated);
  };

  // UBK Handlers
  const handleAddUbkService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUbkService.title.trim()) return;
    const updated = {
      ...formData,
      disiplin: {
        ...formData.disiplin,
        ubkServices: [...(formData.disiplin?.ubkServices || []), { ...newUbkService }]
      }
    };
    setFormData(updated);
    handleSaveAll(updated);
    setNewUbkService({ title: '', desc: '' });
  };

  const handleUpdateUbkService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUbkService) return;
    const services = [...formData.disiplin.ubkServices];
    services[editingUbkService.index] = {
      title: editingUbkService.title,
      desc: editingUbkService.desc
    };
    const updated = {
      ...formData,
      disiplin: {
        ...formData.disiplin,
        ubkServices: services
      }
    };
    setFormData(updated);
    handleSaveAll(updated);
    setEditingUbkService(null);
  };

  const handleDeleteUbkService = (index: number) => {
    const updated = {
      ...formData,
      disiplin: {
        ...formData.disiplin,
        ubkServices: formData.disiplin.ubkServices.filter((_, i) => i !== index)
      }
    };
    setFormData(updated);
    handleSaveAll(updated);
  };

  // RMT Menu Handlers
  const handleAddRmtMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRmtMenu.menu.trim()) return;
    const updated = {
      ...formData,
      kebajikan: {
        ...formData.kebajikan,
        rmtMenu: [...(formData.kebajikan?.rmtMenu || []), { ...newRmtMenu }]
      }
    };
    setFormData(updated);
    handleSaveAll(updated);
    setNewRmtMenu({ day: 'Isnin', menu: '' });
  };

  const handleUpdateRmtMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRmtMenu) return;
    const list = [...formData.kebajikan.rmtMenu];
    list[editingRmtMenu.index] = {
      day: editingRmtMenu.day,
      menu: editingRmtMenu.menu
    };
    const updated = {
      ...formData,
      kebajikan: {
        ...formData.kebajikan,
        rmtMenu: list
      }
    };
    setFormData(updated);
    handleSaveAll(updated);
    setEditingRmtMenu(null);
  };

  const handleDeleteRmtMenu = (index: number) => {
    const updated = {
      ...formData,
      kebajikan: {
        ...formData.kebajikan,
        rmtMenu: formData.kebajikan.rmtMenu.filter((_, i) => i !== index)
      }
    };
    setFormData(updated);
    handleSaveAll(updated);
  };

  // Committee Handlers
  const handleAddOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficer.name.trim() || !newOfficer.role.trim()) return;
    const officer: HemOfficer = {
      id: 'hem-c-' + Date.now(),
      role: newOfficer.role.trim(),
      name: newOfficer.name.trim(),
      unit: newOfficer.unit.trim() || 'Unit HEM',
      phone: newOfficer.phone?.trim()
    };
    const updated = {
      ...formData,
      committee: [...(formData.committee || []), officer]
    };
    setFormData(updated);
    handleSaveAll(updated);
    setNewOfficer({ role: '', name: '', unit: '', phone: '' });
  };

  const handleUpdateOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOfficer) return;
    const updated = {
      ...formData,
      committee: formData.committee.map((c) => (c.id === editingOfficer.id ? editingOfficer : c))
    };
    setFormData(updated);
    handleSaveAll(updated);
    setEditingOfficer(null);
  };

  const handleDeleteOfficer = (id: string) => {
    const updated = {
      ...formData,
      committee: formData.committee.filter((c) => c.id !== id)
    };
    setFormData(updated);
    handleSaveAll(updated);
  };

  return (
    <div className="space-y-6 text-white animate-fadeIn">
      {/* Top Controls Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/15 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded-full text-xs border border-emerald-400/30 mb-2">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pengurusan Penuh Modul Hal Ehwal Murid</span>
          </div>
          <h3 className="text-xl font-black text-white">
            Pengurusan & Suntingan Kandungan HEM
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Kemas kini perutusan GPK HEM, statistik murid, kod disiplin, kaunseling UBK, SPBT, RMT, BAP, SOP 3K & Jawatankuasa Induk.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleResetToDefault}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition border border-white/10 flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Pulih Asal</span>
          </button>
          <button
            onClick={() => handleSaveAll()}
            className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 rounded-xl text-xs font-black transition shadow-lg shadow-yellow-400/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Perubahan</span>
          </button>
        </div>
      </div>

      {/* HEM Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-lg">
        {[
          { id: 'overview', label: '1. Profil GPK HEM & Statistik', icon: UserCheck },
          { id: 'disiplin', label: '2. Disiplin, UBK & SSDM', icon: Scale },
          { id: 'kebajikan', label: '3. SPBT, RMT & BAP', icon: Heart },
          { id: '3k', label: '4. Keselamatan & Kesihatan (3K)', icon: ShieldCheck },
          { id: 'committee', label: '5. Jawatankuasa Induk HEM', icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeHemTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveHemTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition whitespace-nowrap ${
                isActive
                  ? 'bg-yellow-400 text-blue-950 font-black shadow-md shadow-yellow-400/20'
                  : 'bg-white/5 text-slate-200 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & STATISTIK */}
      {activeHemTab === 'overview' && (
        <div className="space-y-6">
          {/* GPK HEM Profile Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h4 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-yellow-400" />
              <span>Profil Guru Penolong Kanan Hal Ehwal Murid (GPK HEM)</span>
            </h4>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Nama Penuh GPK HEM</label>
                <input
                  type="text"
                  value={formData.gpkName || ''}
                  onChange={(e) => setFormData({ ...formData, gpkName: e.target.value })}
                  placeholder="Contoh: Encik Mohd Ridzuan bin Osman"
                  className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Gred Jawatan KPM</label>
                <input
                  type="text"
                  value={formData.gpkGrade || ''}
                  onChange={(e) => setFormData({ ...formData, gpkGrade: e.target.value })}
                  placeholder="Contoh: Pegawai Perkhidmatan Pendidikan (DG44)"
                  className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Gelaran / Jawatan</label>
                <input
                  type="text"
                  value={formData.gpkTitle || ''}
                  onChange={(e) => setFormData({ ...formData, gpkTitle: e.target.value })}
                  placeholder="Contoh: Guru Penolong Kanan Hal Ehwal Murid (PK HEM)"
                  className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Perutusan / Visi Hal Ehwal Murid</label>
              <textarea
                rows={3}
                value={formData.gpkSpeech || ''}
                onChange={(e) => setFormData({ ...formData, gpkSpeech: e.target.value })}
                placeholder="Kata alu-aluan atau moto pengurusan HEM..."
                className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50 leading-relaxed"
              />
            </div>
          </div>

          {/* 4 Quick Stats */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h4 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>4 Statistik Utama Hal Ehwal Murid (Highlight Kad)</span>
            </h4>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-blue-300">
                  <BookMarked className="w-4 h-4" />
                  <label className="text-xs font-bold">Penerima SPBT</label>
                </div>
                <input
                  type="text"
                  value={formData.stats?.spbtPercentage || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stats: { ...formData.stats, spbtPercentage: e.target.value }
                    })
                  }
                  placeholder="Contoh: 100%"
                  className="w-full text-sm font-black px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                />
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-300">
                  <Utensils className="w-4 h-4" />
                  <label className="text-xs font-bold">Penerima RMT</label>
                </div>
                <input
                  type="text"
                  value={formData.stats?.rmtCount || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stats: { ...formData.stats, rmtCount: e.target.value }
                    })
                  }
                  placeholder="Contoh: 78 Murid"
                  className="w-full text-sm font-black px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Coins className="w-4 h-4" />
                  <label className="text-xs font-bold">Amaun BAP / Murid</label>
                </div>
                <input
                  type="text"
                  value={formData.stats?.bapAmount || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stats: { ...formData.stats, bapAmount: e.target.value }
                    })
                  }
                  placeholder="Contoh: RM150"
                  className="w-full text-sm font-black px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-purple-300">
                  <Smile className="w-4 h-4" />
                  <label className="text-xs font-bold">% Sahsiah Baik (SSDM)</label>
                </div>
                <input
                  type="text"
                  value={formData.stats?.sahsiahPercentage || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stats: { ...formData.stats, sahsiahPercentage: e.target.value }
                    })
                  }
                  placeholder="Contoh: 96.8%"
                  className="w-full text-sm font-black px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DISIPLIN, UBK & SSDM */}
      {activeHemTab === 'disiplin' && (
        <div className="space-y-6">
          {/* Section 2.1: Senarai Peraturan Sekolah */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h4 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Senarai Kod & Peraturan Disiplin Murid</span>
              </div>
              <span className="text-xs text-slate-300">
                {formData.disiplin?.rules?.length || 0} Peraturan
              </span>
            </h4>

            {/* Add Rule Form */}
            <form onSubmit={handleAddRule} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-200 mb-1">Kategori / Tajuk</label>
                  <input
                    type="text"
                    required
                    value={newRule.title}
                    onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                    placeholder="Contoh: Kehadiran / Rambut"
                    className="w-full text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-200 mb-1">Penerangan Ringkas</label>
                  <input
                    type="text"
                    required
                    value={newRule.desc}
                    onChange={(e) => setNewRule({ ...newRule, desc: e.target.value })}
                    placeholder="Contoh: Wajib berada di sekolah sebelum jam 7.20 pagi"
                    className="w-full text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-200 mb-1">Jenis Ikon / Nada</label>
                  <select
                    value={newRule.type}
                    onChange={(e) => setNewRule({ ...newRule, type: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 bg-slate-900 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  >
                    <option value="info">Info (Biru)</option>
                    <option value="success">Piawaian (Hijau)</option>
                    <option value="warning">Larangan (Merah)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Peraturan</span>
                </button>
              </div>
            </form>

            {/* List of Rules */}
            <div className="space-y-2">
              {formData.disiplin?.rules?.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    {rule.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                    ) : rule.type === 'info' ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-extrabold text-white">{rule.title}: </span>
                      <span className="text-slate-300">{rule.desc}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setEditingRule(rule)}
                      className="p-1.5 bg-white/10 hover:bg-yellow-400 hover:text-blue-950 rounded-lg text-slate-200 transition"
                      title="Sunting"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 bg-rose-500/20 hover:bg-rose-600 rounded-lg text-rose-300 hover:text-white transition"
                      title="Padam"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Full Guidelines Textarea */}
            <div className="pt-3 border-t border-white/10">
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Garis Panduan Penuh Disiplin (Dipaparkan Dalam Modal Pop-up)
              </label>
              <textarea
                rows={4}
                value={formData.disiplin?.fullGuidelines || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    disiplin: { ...formData.disiplin, fullGuidelines: e.target.value }
                  })
                }
                placeholder="Garis panduan masa persekolahan, tatacara keluar masuk, pakaian dsb..."
                className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50 leading-relaxed font-mono"
              />
            </div>
          </div>

          {/* Section 2.2: Unit Bimbingan & Kaunseling (UBK) */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h4 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-purple-400" />
                <span>Perkhidmatan Unit Bimbingan & Kaunseling (UBK)</span>
              </div>
              <span className="text-xs text-slate-300">
                {formData.disiplin?.ubkServices?.length || 0} Aktiviti / Modul
              </span>
            </h4>

            {/* Add UBK Service Form */}
            <form onSubmit={handleAddUbkService} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-200 mb-1">Nama Program / Modul UBK</label>
                  <input
                    type="text"
                    required
                    value={newUbkService.title}
                    onChange={(e) => setNewUbkService({ ...newUbkService, title: e.target.value })}
                    placeholder="Contoh: Program Guru Penyayang"
                    className="w-full text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-200 mb-1">Penerangan Aktiviti</label>
                  <input
                    type="text"
                    required
                    value={newUbkService.desc}
                    onChange={(e) => setNewUbkService({ ...newUbkService, desc: e.target.value })}
                    placeholder="Contoh: Sambutan murid di pintu pagar seawal 7.00 pagi..."
                    className="w-full text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Program UBK</span>
                </button>
              </div>
            </form>

            {/* List of UBK Services */}
            <div className="space-y-2">
              {formData.disiplin?.ubkServices?.map((srv, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-extrabold text-purple-300">{srv.title}: </span>
                    <span className="text-slate-300">{srv.desc}</span>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setEditingUbkService({ index: idx, title: srv.title, desc: srv.desc })}
                      className="p-1.5 bg-white/10 hover:bg-yellow-400 hover:text-blue-950 rounded-lg text-slate-200 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUbkService(idx)}
                      className="p-1.5 bg-rose-500/20 hover:bg-rose-600 rounded-lg text-rose-300 hover:text-white transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2.3: SSDM Settings */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h4 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span>Sistem Sahsiah Diri Murid (SSDM 2.0)</span>
            </h4>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Pautan URL Portal SSDM KPM</label>
                <input
                  type="url"
                  value={formData.disiplin?.ssdmUrl || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      disiplin: { ...formData.disiplin, ssdmUrl: e.target.value }
                    })
                  }
                  placeholder="https://ssdm.moe.gov.my/"
                  className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Penerangan Ringkas SSDM</label>
                <input
                  type="text"
                  value={formData.disiplin?.ssdmDescription || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      disiplin: { ...formData.disiplin, ssdmDescription: e.target.value }
                    })
                  }
                  placeholder="Sistem rasmi KPM untuk merekodkan amalan baik..."
                  className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KEBAJIKAN MURID (SPBT, RMT, BAP) */}
      {activeHemTab === 'kebajikan' && (
        <div className="space-y-6">
          {/* SPBT */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h4 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-blue-400" />
                <span>Skim Pinjaman Buku Teks (SPBT)</span>
              </div>
            </h4>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Guru Penyelaras SPBT</label>
                <input
                  type="text"
                  value={formData.kebajikan?.spbtCoordinator || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kebajikan: { ...formData.kebajikan, spbtCoordinator: e.target.value }
                    })
                  }
                  placeholder="Contoh: Cikgu Nurul Ain binti Mahadzir"
                  className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Penerangan SPBT</label>
                <input
                  type="text"
                  value={formData.kebajikan?.spbtDescription || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kebajikan: { ...formData.kebajikan, spbtDescription: e.target.value }
                    })
                  }
                  placeholder="Buku teks dibekalkan 100% secara percuma..."
                  className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                />
              </div>
            </div>

            {/* SPBT Guidelines list */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-200">Panduan Penjagaan Buku Teks:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSpbtGuideline}
                  onChange={(e) => setNewSpbtGuideline(e.target.value)}
                  placeholder="Tambah panduan penjagaan (cth: Wajib dibalut plastik jernih)..."
                  className="flex-1 text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newSpbtGuideline.trim()) return;
                    const updated = {
                      ...formData,
                      kebajikan: {
                        ...formData.kebajikan,
                        spbtGuidelines: [...(formData.kebajikan?.spbtGuidelines || []), newSpbtGuideline.trim()]
                      }
                    };
                    setFormData(updated);
                    handleSaveAll(updated);
                    setNewSpbtGuideline('');
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-xs transition"
                >
                  Tambah
                </button>
              </div>

              <div className="space-y-1.5">
                {formData.kebajikan?.spbtGuidelines?.map((g, idx) => (
                  <div key={idx} className="p-2 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs text-slate-300">
                    <span>• {g}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...formData,
                          kebajikan: {
                            ...formData.kebajikan,
                            spbtGuidelines: formData.kebajikan.spbtGuidelines.filter((_, i) => i !== idx)
                          }
                        };
                        setFormData(updated);
                        handleSaveAll(updated);
                      }}
                      className="p-1 text-rose-400 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RMT & Program Susu */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h4 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-400" />
                <span>Rancangan Makanan Tambahan (RMT) & Susu Sekolah</span>
              </div>
            </h4>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Guru Penyelaras RMT</label>
                <input
                  type="text"
                  value={formData.kebajikan?.rmtCoordinator || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kebajikan: { ...formData.kebajikan, rmtCoordinator: e.target.value }
                    })
                  }
                  placeholder="Contoh: Puan Fazilah binti Mat"
                  className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Penerangan RMT</label>
                <input
                  type="text"
                  value={formData.kebajikan?.rmtDescription || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kebajikan: { ...formData.kebajikan, rmtDescription: e.target.value }
                    })
                  }
                  placeholder="Penyediaan sarapan pagi sihat berkhasiat..."
                  className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>
            </div>

            {/* RMT Menu Schedule */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-200">Jadual Menu Sihat RMT:</label>

              {/* Add Menu Form */}
              <form onSubmit={handleAddRmtMenu} className="p-3 bg-white/5 border border-white/10 rounded-2xl flex flex-wrap gap-2 items-center">
                <select
                  value={newRmtMenu.day}
                  onChange={(e) => setNewRmtMenu({ ...newRmtMenu, day: e.target.value })}
                  className="text-xs px-3 py-2 bg-slate-900 border border-white/20 text-white rounded-xl focus:outline-none"
                >
                  <option value="Isnin">Isnin</option>
                  <option value="Selasa">Selasa</option>
                  <option value="Rabu">Rabu</option>
                  <option value="Khamis">Khamis</option>
                  <option value="Jumaat">Jumaat</option>
                </select>

                <input
                  type="text"
                  required
                  value={newRmtMenu.menu}
                  onChange={(e) => setNewRmtMenu({ ...newRmtMenu, menu: e.target.value })}
                  placeholder="Contoh: Nasi Ayam Kukus bersama Sayur Sup & Buah Segar"
                  className="flex-1 min-w-[200px] text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />

                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
                >
                  Tambah Menu
                </button>
              </form>

              {/* Menu List */}
              <div className="space-y-1.5">
                {formData.kebajikan?.rmtMenu?.map((m, idx) => (
                  <div key={idx} className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-amber-300">{m.day}: </span>
                      <span className="text-slate-200">{m.menu}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingRmtMenu({ index: idx, day: m.day, menu: m.menu })}
                        className="p-1.5 bg-white/10 hover:bg-yellow-400 hover:text-blue-950 rounded-lg text-slate-200 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRmtMenu(idx)}
                        className="p-1.5 bg-rose-500/20 hover:bg-rose-600 rounded-lg text-rose-300 hover:text-white transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BAP & Bantuan Kebajikan */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h4 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>Bantuan Awal Persekolahan (BAP) & KWAPM</span>
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Penerangan Ringkas BAP & Bantuan</label>
              <textarea
                rows={2}
                value={formData.kebajikan?.bapDescription || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kebajikan: { ...formData.kebajikan, bapDescription: e.target.value }
                  })
                }
                placeholder="Bantuan tunai kewangan RM150 kepada setiap murid warganegara..."
                className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
            </div>

            {/* BAP details list */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-200">Perincian Bantuan & Skim Agihan:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBapDetail}
                  onChange={(e) => setNewBapDetail(e.target.value)}
                  placeholder="Tambah perincian bantuan (cth: KWAPM & e-Kasih untuk murid miskin)..."
                  className="flex-1 text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newBapDetail.trim()) return;
                    const updated = {
                      ...formData,
                      kebajikan: {
                        ...formData.kebajikan,
                        bapDetails: [...(formData.kebajikan?.bapDetails || []), newBapDetail.trim()]
                      }
                    };
                    setFormData(updated);
                    handleSaveAll(updated);
                    setNewBapDetail('');
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
                >
                  Tambah
                </button>
              </div>

              <div className="space-y-1.5">
                {formData.kebajikan?.bapDetails?.map((det, idx) => (
                  <div key={idx} className="p-2 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs text-slate-300">
                    <span>• {det}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...formData,
                          kebajikan: {
                            ...formData.kebajikan,
                            bapDetails: formData.kebajikan.bapDetails.filter((_, i) => i !== idx)
                          }
                        };
                        setFormData(updated);
                        handleSaveAll(updated);
                      }}
                      className="p-1 text-rose-400 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: KESELAMATAN & KESIHATAN (3K) */}
      {activeHemTab === '3k' && (
        <div className="space-y-6">
          {/* Coordinator 3K */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h4 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Penyelaras Program 3K</span>
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Nama Guru Penyelaras 3K</label>
              <input
                type="text"
                value={formData.program3k?.coordinator3k || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    program3k: { ...formData.program3k, coordinator3k: e.target.value }
                  })
                }
                placeholder="Contoh: Cikgu Mohd Fadzil bin Yaakob"
                className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              />
            </div>
          </div>

          {/* 4.1 Keselamatan */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h4 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              <span>Panduan Keselamatan Murid (SOP Pintu Pagar, CCTV, Latihan Kebakaran)</span>
            </h4>

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSafetyPoint}
                  onChange={(e) => setNewSafetyPoint(e.target.value)}
                  placeholder="Tambah SOP Keselamatan (cth: Zon drop-off sehala di pintu utama)..."
                  className="flex-1 text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newSafetyPoint.trim()) return;
                    const updated = {
                      ...formData,
                      program3k: {
                        ...formData.program3k,
                        safetyPoints: [...(formData.program3k?.safetyPoints || []), newSafetyPoint.trim()]
                      }
                    };
                    setFormData(updated);
                    handleSaveAll(updated);
                    setNewSafetyPoint('');
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-xs transition"
                >
                  Tambah
                </button>
              </div>

              <div className="space-y-1.5">
                {formData.program3k?.safetyPoints?.map((pt, idx) => (
                  <div key={idx} className="p-2 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs text-slate-300">
                    <span>🛡️ {pt}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...formData,
                          program3k: {
                            ...formData.program3k,
                            safetyPoints: formData.program3k.safetyPoints.filter((_, i) => i !== idx)
                          }
                        };
                        setFormData(updated);
                        handleSaveAll(updated);
                      }}
                      className="p-1 text-rose-400 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4.2 Kesihatan */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h4 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              <span>Kesihatan & Rawatan Murid (Klinik Pergigian, Vaksinasi KKM, COMBI Denggi)</span>
            </h4>

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHealthPoint}
                  onChange={(e) => setNewHealthPoint(e.target.value)}
                  placeholder="Tambah program kesihatan (cth: Pemeriksaan pergigian percuma tahunan)..."
                  className="flex-1 text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newHealthPoint.trim()) return;
                    const updated = {
                      ...formData,
                      program3k: {
                        ...formData.program3k,
                        healthPoints: [...(formData.program3k?.healthPoints || []), newHealthPoint.trim()]
                      }
                    };
                    setFormData(updated);
                    handleSaveAll(updated);
                    setNewHealthPoint('');
                  }}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-xs transition"
                >
                  Tambah
                </button>
              </div>

              <div className="space-y-1.5">
                {formData.program3k?.healthPoints?.map((pt, idx) => (
                  <div key={idx} className="p-2 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs text-slate-300">
                    <span>🩺 {pt}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...formData,
                          program3k: {
                            ...formData.program3k,
                            healthPoints: formData.program3k.healthPoints.filter((_, i) => i !== idx)
                          }
                        };
                        setFormData(updated);
                        handleSaveAll(updated);
                      }}
                      className="p-1 text-rose-400 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4.3 Kebersihan */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h4 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Kebersihan & Keceriaan (Kelas Terbersih, Tandas Bersih, Amalan 3R)</span>
            </h4>

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCleanlinessPoint}
                  onChange={(e) => setNewCleanlinessPoint(e.target.value)}
                  placeholder="Tambah inisiatif kebersihan (cth: Pertandingan kelas terbersih mingguan)..."
                  className="flex-1 text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newCleanlinessPoint.trim()) return;
                    const updated = {
                      ...formData,
                      program3k: {
                        ...formData.program3k,
                        cleanlinessPoints: [...(formData.program3k?.cleanlinessPoints || []), newCleanlinessPoint.trim()]
                      }
                    };
                    setFormData(updated);
                    handleSaveAll(updated);
                    setNewCleanlinessPoint('');
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
                >
                  Tambah
                </button>
              </div>

              <div className="space-y-1.5">
                {formData.program3k?.cleanlinessPoints?.map((pt, idx) => (
                  <div key={idx} className="p-2 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between text-xs text-slate-300">
                    <span>✨ {pt}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...formData,
                          program3k: {
                            ...formData.program3k,
                            cleanlinessPoints: formData.program3k.cleanlinessPoints.filter((_, i) => i !== idx)
                          }
                        };
                        setFormData(updated);
                        handleSaveAll(updated);
                      }}
                      className="p-1 text-rose-400 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COMMITTEE / JAWATANKUASA INDUK HEM */}
      {activeHemTab === 'committee' && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h4 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-yellow-400" />
                <span>Senarai Guru & AJK Jawatankuasa Induk HEM</span>
              </div>
              <span className="text-xs text-slate-300">
                {formData.committee?.length || 0} Ahli Jawatankuasa
              </span>
            </h4>

            {/* Add Officer Form */}
            <form onSubmit={handleAddOfficer} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
              <div className="grid sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-200 mb-1">Peranan / Jawatan</label>
                  <input
                    type="text"
                    required
                    value={newOfficer.role}
                    onChange={(e) => setNewOfficer({ ...newOfficer, role: e.target.value })}
                    placeholder="Contoh: Setiausaha HEM / Penyelaras SPBT"
                    className="w-full text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-200 mb-1">Nama Guru Bertugas</label>
                  <input
                    type="text"
                    required
                    value={newOfficer.name}
                    onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })}
                    placeholder="Contoh: Ustazah Salina binti Ismail"
                    className="w-full text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-200 mb-1">Unit / Portfolio</label>
                  <input
                    type="text"
                    value={newOfficer.unit}
                    onChange={(e) => setNewOfficer({ ...newOfficer, unit: e.target.value })}
                    placeholder="Contoh: Pengurusan & Dokumentasi"
                    className="w-full text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-200 mb-1">No Telefon (Pilihan)</label>
                  <input
                    type="text"
                    value={newOfficer.phone}
                    onChange={(e) => setNewOfficer({ ...newOfficer, phone: e.target.value })}
                    placeholder="Contoh: 019-4567891"
                    className="w-full text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Guru / Penyelaras HEM</span>
                </button>
              </div>
            </form>

            {/* List of Committee Members */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {formData.committee?.map((officer) => (
                <div
                  key={officer.id}
                  className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex flex-col justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-yellow-400 uppercase tracking-wider">
                        {officer.role}
                      </span>
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">
                        {officer.unit}
                      </span>
                    </div>
                    <h5 className="font-extrabold text-white text-sm mt-1">{officer.name}</h5>
                    {officer.phone && (
                      <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-1">
                        <PhoneCall className="w-3 h-3 text-emerald-400" />
                        <span>{officer.phone}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-white/10">
                    <button
                      onClick={() => setEditingOfficer(officer)}
                      className="px-2.5 py-1 bg-white/10 hover:bg-yellow-400 hover:text-blue-950 rounded-lg text-slate-200 transition font-bold flex items-center gap-1 text-[11px]"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Sunting</span>
                    </button>
                    <button
                      onClick={() => handleDeleteOfficer(officer.id)}
                      className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-600 rounded-lg text-rose-300 hover:text-white transition font-bold flex items-center gap-1 text-[11px]"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Padam</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL: RULE */}
      {editingRule && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-extrabold text-base text-white">Sunting Peraturan Disiplin</h4>
              <button onClick={() => setEditingRule(null)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRule} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Tajuk / Kategori</label>
                <input
                  type="text"
                  required
                  value={editingRule.title}
                  onChange={(e) => setEditingRule({ ...editingRule, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Penerangan</label>
                <textarea
                  rows={3}
                  required
                  value={editingRule.desc}
                  onChange={(e) => setEditingRule({ ...editingRule, desc: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Jenis</label>
                <select
                  value={editingRule.type}
                  onChange={(e) => setEditingRule({ ...editingRule, type: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-white/20 text-white rounded-xl focus:outline-none"
                >
                  <option value="info">Info (Biru)</option>
                  <option value="success">Piawaian (Hijau)</option>
                  <option value="warning">Larangan (Merah)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 rounded-xl text-xs font-black"
                >
                  Kemas Kini
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL: UBK */}
      {editingUbkService && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-extrabold text-base text-white">Sunting Perkhidmatan UBK</h4>
              <button onClick={() => setEditingUbkService(null)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUbkService} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Nama Program</label>
                <input
                  type="text"
                  required
                  value={editingUbkService.title}
                  onChange={(e) => setEditingUbkService({ ...editingUbkService, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Penerangan</label>
                <textarea
                  rows={3}
                  required
                  value={editingUbkService.desc}
                  onChange={(e) => setEditingUbkService({ ...editingUbkService, desc: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUbkService(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-xl text-xs font-black"
                >
                  Kemas Kini
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL: RMT MENU */}
      {editingRmtMenu && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-extrabold text-base text-white">Sunting Menu RMT</h4>
              <button onClick={() => setEditingRmtMenu(null)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRmtMenu} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Hari</label>
                <select
                  value={editingRmtMenu.day}
                  onChange={(e) => setEditingRmtMenu({ ...editingRmtMenu, day: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-slate-900 border border-white/20 text-white rounded-xl focus:outline-none"
                >
                  <option value="Isnin">Isnin</option>
                  <option value="Selasa">Selasa</option>
                  <option value="Rabu">Rabu</option>
                  <option value="Khamis">Khamis</option>
                  <option value="Jumaat">Jumaat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Menu Hidangan</label>
                <textarea
                  rows={2}
                  required
                  value={editingRmtMenu.menu}
                  onChange={(e) => setEditingRmtMenu({ ...editingRmtMenu, menu: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRmtMenu(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black"
                >
                  Kemas Kini
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL: COMMITTEE OFFICER */}
      {editingOfficer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-extrabold text-base text-white">Sunting Maklumat Jawatankuasa HEM</h4>
              <button onClick={() => setEditingOfficer(null)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateOfficer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Peranan / Jawatan</label>
                <input
                  type="text"
                  required
                  value={editingOfficer.role}
                  onChange={(e) => setEditingOfficer({ ...editingOfficer, role: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Nama Guru</label>
                <input
                  type="text"
                  required
                  value={editingOfficer.name}
                  onChange={(e) => setEditingOfficer({ ...editingOfficer, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Unit / Portfolio</label>
                <input
                  type="text"
                  value={editingOfficer.unit}
                  onChange={(e) => setEditingOfficer({ ...editingOfficer, unit: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">No Telefon</label>
                <input
                  type="text"
                  value={editingOfficer.phone || ''}
                  onChange={(e) => setEditingOfficer({ ...editingOfficer, phone: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOfficer(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 rounded-xl text-xs font-black"
                >
                  Kemas Kini
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
