import React, { useState } from 'react';
import { NavigationMenuItem } from '../../types';
import { initialNavigationMenu } from '../../data/initialData';
import { AVAILABLE_NAV_ICONS, getNavIcon } from '../../utils/iconMap';
import {
  Menu,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  CheckCircle2,
  Globe,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  HelpCircle,
  Search,
  X,
  Compass,
  Laptop
} from 'lucide-react';

interface AdminMenuManagerProps {
  menuItems: NavigationMenuItem[];
  onSaveMenu: (items: NavigationMenuItem[]) => void;
  showToast: (msg: string) => void;
}

const AVAILABLE_TABS = [
  { id: 'utama', label: 'Laman Utama (Ikon Home Sahaja)' },
  { id: 'guru', label: 'Guru (Portal & Pautan Rasmi Portfolio Guru - Khas Admin)' },
  { id: 'profil', label: 'Profil (Visi, Misi & Carta Organisasi)' },
  { id: 'akademik', label: 'Kurikulum (Akademik & Takwim Persekolahan)' },
  { id: 'hem', label: 'HEM (Hal Ehwal Murid, Disiplin & SPBT)' },
  { id: 'kokurikulum', label: 'Kokurikulum, Sukan & Aktiviti' },
  { id: 'berita', label: 'Umum (Berita, Galeri, Ruang Anugerah & Portal Muat Turun)' },
  { id: 'signage', label: 'Paparan TV Signage Pintar' },
  { id: 'hubungi', label: 'Hubungi Kami & Maklum Balas' },
  { id: 'gas_code', label: 'Kod Google Apps Script (Admin)' },
  { id: 'admin_cms', label: 'Panel CMS Pentadbir' },
  { id: 'custom_url', label: '🔗 Pautan Luar Tersuai (URL Web Luar)' }
];

export const AdminMenuManager: React.FC<AdminMenuManagerProps> = ({
  menuItems,
  onSaveMenu,
  showToast
}) => {
  const [items, setItems] = useState<NavigationMenuItem[]>(() => {
    if (menuItems && menuItems.length > 0) {
      return [...menuItems].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return [...initialNavigationMenu];
  });

  const [previewAsAdmin, setPreviewAsAdmin] = useState(true);
  const [iconPickerItemIndex, setIconPickerItemIndex] = useState<number | null>(null);
  const [iconSearch, setIconSearch] = useState('');
  const [selectedIconCategory, setSelectedIconCategory] = useState<string>('semua');

  // Form Tambah Menu Baharu
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<{
    label: string;
    targetTab: string;
    iconName: string;
    badge: string;
    isExternal: boolean;
    externalUrl: string;
    requiresAdmin: boolean;
  }>({
    label: '',
    targetTab: 'utama',
    iconName: 'Globe',
    badge: '',
    isExternal: false,
    externalUrl: '',
    requiresAdmin: false
  });

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newArr = [...items];
    const temp = newArr[index - 1];
    newArr[index - 1] = newArr[index];
    newArr[index] = temp;

    // Recalculate orders
    const reordered = newArr.map((item, idx) => ({ ...item, order: idx + 1 }));
    setItems(reordered);
    onSaveMenu(reordered);
    showToast('Susunan menu dikemas kini!');
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newArr = [...items];
    const temp = newArr[index + 1];
    newArr[index + 1] = newArr[index];
    newArr[index] = temp;

    // Recalculate orders
    const reordered = newArr.map((item, idx) => ({ ...item, order: idx + 1 }));
    setItems(reordered);
    onSaveMenu(reordered);
    showToast('Susunan menu dikemas kini!');
  };

  const handleToggleVisibility = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, isVisible: !item.isVisible } : item
    );
    setItems(updated);
    onSaveMenu(updated);
    showToast('Status paparan menu dikemas kini!');
  };

  const handleUpdateField = (id: string, field: keyof NavigationMenuItem, value: any) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setItems(updated);
    onSaveMenu(updated);
  };

  const handleDeleteItem = (id: string) => {
    if (items.length <= 1) {
      alert('Menu tidak boleh dibiarkan kosong.');
      return;
    }
    const updated = items
      .filter((item) => item.id !== id)
      .map((item, idx) => ({ ...item, order: idx + 1 }));
    setItems(updated);
    onSaveMenu(updated);
    showToast('Item menu berjaya dipadam.');
  };

  const handleResetToDefault = () => {
    if (window.confirm('Adakah anda pasti untuk menetapkan semula menu utama kepada susunan dan nama lalai sistem?')) {
      const defaults = [...initialNavigationMenu];
      setItems(defaults);
      onSaveMenu(defaults);
      showToast('Menu utama dikembalikan kepada tetapan asal!');
    }
  };

  const handleSelectIcon = (iconName: string) => {
    if (iconPickerItemIndex !== null) {
      const updated = [...items];
      updated[iconPickerItemIndex] = {
        ...updated[iconPickerItemIndex],
        iconName
      };
      setItems(updated);
      onSaveMenu(updated);
      setIconPickerItemIndex(null);
      showToast(`Ikon ditukar kepada ${iconName}`);
    }
  };

  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.label.trim()) return;

    const isExt = newItem.targetTab === 'custom_url' || newItem.isExternal;
    const finalItem: NavigationMenuItem = {
      id: 'menu-' + Date.now(),
      label: newItem.label.trim(),
      targetTab: isExt ? 'custom_url' : newItem.targetTab,
      iconName: newItem.iconName || 'Globe',
      badge: newItem.badge.trim() || undefined,
      isVisible: true,
      order: items.length + 1,
      isExternal: isExt,
      externalUrl: isExt ? (newItem.externalUrl.trim() || 'https://') : undefined,
      requiresAdmin: newItem.requiresAdmin
    };

    const updated = [...items, finalItem];
    setItems(updated);
    onSaveMenu(updated);
    setShowAddModal(false);
    setNewItem({
      label: '',
      targetTab: 'utama',
      iconName: 'Globe',
      badge: '',
      isExternal: false,
      externalUrl: '',
      requiresAdmin: false
    });
    showToast('Item menu baharu berjaya ditambah!');
  };

  // Filtered icons for picker
  const filteredIcons = AVAILABLE_NAV_ICONS.filter((opt) => {
    const matchSearch =
      opt.name.toLowerCase().includes(iconSearch.toLowerCase()) ||
      opt.label.toLowerCase().includes(iconSearch.toLowerCase());
    const matchCat =
      selectedIconCategory === 'semua' || opt.category === selectedIconCategory;
    return matchSearch && matchCat;
  });

  const visibleCount = items.filter((i) => i.isVisible).length;
  const hiddenCount = items.filter((i) => !i.isVisible).length;

  return (
    <div className="space-y-6">
      {/* Header Pengurusan Menu */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 font-extrabold text-xs mb-2 border border-yellow-400/30">
              <Compass className="w-3.5 h-3.5" />
              <span>Pengurusan Menu Utama Portal</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Sunting & Kawal Menu Utama (Navigation Bar)
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
              Ubah label nama, ikon, susunan (#1, #2..), lencana maklumat (Badge), status papar/sembunyi, atau tambah pautan pautan khas untuk pelawat & warga sekolah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-blue-950 font-black rounded-xl text-xs flex items-center gap-2 transition border border-yellow-300 shadow-lg shadow-yellow-400/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Menu / Pautan</span>
            </button>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3.5 py-2.5 bg-rose-500/80 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-rose-400 shadow-md"
              title="Kembalikan semua menu kepada tetapan asal sekolah"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Susunan Asal</span>
            </button>
          </div>
        </div>

        {/* Statistik Ringkas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-slate-300 block">Jumlah Menu</span>
            <span className="text-xl font-black text-white">{items.length}</span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-emerald-300 block">Sedang Dipaparkan</span>
            <span className="text-xl font-black text-emerald-400">{visibleCount}</span>
          </div>
          <div className="bg-rose-500/10 border border-rose-400/30 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-rose-300 block">Disembunyikan</span>
            <span className="text-xl font-black text-rose-400">{hiddenCount}</span>
          </div>
          <div className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-3 text-center">
            <span className="text-[11px] font-bold text-blue-300 block">Pautan Luar</span>
            <span className="text-xl font-black text-yellow-300">
              {items.filter((i) => i.isExternal).length}
            </span>
          </div>
        </div>
      </div>

      {/* Pratonton Langsung Bar Menu (Live Simulation Preview) */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border-2 border-yellow-400/40 p-5 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-yellow-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>Pratonton Langsung Bar Navigasi Laman Web</span>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded-xl border border-white/10 text-[11px] font-bold">
            <span className="text-slate-300">Simulasi:</span>
            <button
              type="button"
              onClick={() => setPreviewAsAdmin(true)}
              className={`px-2 py-0.5 rounded-lg transition ${
                previewAsAdmin ? 'bg-yellow-400 text-blue-950 font-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setPreviewAsAdmin(false)}
              className={`px-2 py-0.5 rounded-lg transition ${
                !previewAsAdmin ? 'bg-yellow-400 text-blue-950 font-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              Pelawat
            </button>
          </div>
        </div>

        {/* Visual Simulated Navbar */}
        <div className="bg-slate-950/80 rounded-2xl border border-white/20 p-2.5 overflow-x-auto scrollbar-none shadow-inner">
          <div className="flex items-center space-x-1 min-w-max">
            {items
              .filter((item) => item.isVisible && (!item.requiresAdmin || previewAsAdmin))
              .map((item, idx) => {
                const Icon = getNavIcon(item.iconName);
                const isFirst = idx === 0;
                return (
                  <div
                    key={item.id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition border ${
                      isFirst
                        ? 'bg-yellow-400 text-blue-950 font-black shadow-md border-yellow-300'
                        : 'bg-white/5 text-slate-200 border-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{item.label}</span>
                    {item.isExternal && <ExternalLink className="w-2.5 h-2.5 opacity-70" />}
                    {item.badge && (
                      <span className="text-[10px] bg-slate-900/90 text-yellow-300 font-black px-1.5 py-0.2 rounded border border-white/20">
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Senarai Pengurusan Item Menu */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h4 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-yellow-400" />
            <span>Senarai Susunan Menu Utama ({items.length} Item)</span>
          </h4>
          <span className="text-xs text-slate-300 italic hidden sm:inline">
            * Gunakan butang ⬆️ / ⬇️ untuk mengubah urutan keutamaan menu
          </span>
        </div>

        <div className="space-y-2.5">
          {items.map((item, index) => {
            const Icon = getNavIcon(item.iconName);
            const isFirst = index === 0;
            const isLast = index === items.length - 1;

            return (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 ${
                  item.isVisible
                    ? 'bg-white/5 hover:bg-white/10 border-white/15'
                    : 'bg-slate-900/40 border-dashed border-white/10 opacity-60'
                }`}
              >
                {/* Bahagian Kiri: Nombor Susunan, Butang Naik/Turun, Ikon & Nama */}
                <div className="flex items-center gap-3 flex-1">
                  {/* Order Tag & Reorder Buttons */}
                  <div className="flex items-center gap-1">
                    <span className="w-6 h-6 rounded-lg bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 flex items-center justify-center text-xs font-black">
                      #{index + 1}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => handleMoveUp(index)}
                        className="p-1 rounded bg-white/10 hover:bg-yellow-400 hover:text-blue-950 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition"
                        title="Alih ke atas"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => handleMoveDown(index)}
                        className="p-1 rounded bg-white/10 hover:bg-yellow-400 hover:text-blue-950 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition"
                        title="Alih ke bawah"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Butang Ikon Semasa & Tukar Ikon */}
                  <button
                    type="button"
                    onClick={() => setIconPickerItemIndex(index)}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-yellow-400 hover:text-blue-950 text-yellow-300 border border-white/20 transition flex items-center gap-1.5 group relative"
                    title="Klik untuk memilih ikon berbeza"
                  >
                    <Icon className="w-4 h-4" />
                    <Edit3 className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                  </button>

                  {/* Nama Label Menu & Target */}
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => handleUpdateField(item.id, 'label', e.target.value)}
                        placeholder="Nama Label Menu..."
                        className="font-extrabold text-xs sm:text-sm text-white bg-black/30 px-3 py-1.5 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 w-full sm:w-64"
                      />

                      {item.requiresAdmin && (
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 font-black px-2 py-0.5 rounded-full border border-purple-400/30 flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5" />
                          Hanya Admin
                        </span>
                      )}

                      {item.isExternal && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded-full border border-blue-400/30 flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5" />
                          Pautan Luar
                        </span>
                      )}
                    </div>

                    {/* Seksyen Target / URL */}
                    <div className="text-[11px] text-slate-300 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-yellow-400/90">Sasaran:</span>
                      {item.isExternal ? (
                        <input
                          type="url"
                          value={item.externalUrl || ''}
                          onChange={(e) => handleUpdateField(item.id, 'externalUrl', e.target.value)}
                          placeholder="https://..."
                          className="bg-black/40 text-xs text-blue-200 px-2 py-0.5 rounded border border-white/20 focus:outline-none w-64"
                        />
                      ) : (
                        <span className="bg-white/10 px-2 py-0.5 rounded font-mono text-[10px] text-slate-200">
                          {AVAILABLE_TABS.find((t) => t.id === item.targetTab)?.label || item.targetTab}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bahagian Kanan: Sunting Badge, Togol Papar & Padam */}
                <div className="flex flex-wrap items-center gap-2.5 justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
                  {/* Badge Text Input */}
                  <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-xl border border-white/10">
                    <span className="text-[11px] font-bold text-slate-400">Badge:</span>
                    <input
                      type="text"
                      value={item.badge || ''}
                      onChange={(e) => handleUpdateField(item.id, 'badge', e.target.value || undefined)}
                      placeholder="cth: Baru"
                      className="bg-transparent text-xs text-yellow-300 font-bold w-16 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>

                  {/* Toggle Visibility */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                      item.isVisible
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 hover:bg-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-400/30 hover:bg-rose-500/30'
                    }`}
                  >
                    {item.isVisible ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Papar</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Sembunyi</span>
                      </>
                    )}
                  </button>

                  {/* Delete Button (Optional for custom or all items) */}
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-400/20 transition"
                    title="Padam menu ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Pemilihan Ikon (Icon Picker Modal) */}
      {iconPickerItemIndex !== null && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="text-lg font-black text-white">Pilih Ikon Navigasi</h4>
                <p className="text-xs text-slate-300">
                  Pilih ikon yang paling sesuai untuk menu "
                  <span className="text-yellow-300 font-bold">
                    {items[iconPickerItemIndex]?.label}
                  </span>
                  "
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIconPickerItemIndex(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Search & Category */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  placeholder="Cari nama ikon (cth: Home, School, Trophy, Book, Tv...)"
                  className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'semua', label: 'Semua' },
                  { id: 'utama', label: 'Utama' },
                  { id: 'akademik', label: 'Akademik' },
                  { id: 'media', label: 'Media' },
                  { id: 'sistem', label: 'Sistem' },
                  { id: 'komunikasi', label: 'Komunikasi' },
                  { id: 'khas', label: 'Khas' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedIconCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      selectedIconCategory === cat.id
                        ? 'bg-yellow-400 text-blue-950'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Icons */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 overflow-y-auto pr-1 flex-1 max-h-72">
              {filteredIcons.map((opt) => {
                const IconComponent = opt.icon;
                const isCurrent =
                  items[iconPickerItemIndex]?.iconName.toLowerCase() ===
                  opt.name.toLowerCase();

                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => handleSelectIcon(opt.name)}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-yellow-400 text-blue-950 border-yellow-300 font-black shadow-lg'
                        : 'bg-white/5 text-slate-200 hover:bg-white/15 border-white/10'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="text-[10px] font-semibold truncate w-full">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIconPickerItemIndex(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Menu Baharu */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-yellow-400" />
                <h4 className="text-lg font-black text-white">Tambah Menu / Pautan Baharu</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Nama Label Menu *
                </label>
                <input
                  type="text"
                  required
                  value={newItem.label}
                  onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                  placeholder="cth: Portal DELIMa / Buku Program / Kelab STEM"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Jenis Sasaran / Pautan *
                </label>
                <select
                  value={newItem.targetTab}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewItem({
                      ...newItem,
                      targetTab: val,
                      isExternal: val === 'custom_url'
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  {AVAILABLE_TABS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {newItem.targetTab === 'custom_url' && (
                <div>
                  <label className="block text-xs font-bold text-yellow-300 mb-1">
                    URL Pautan Luar (External Web Link) *
                  </label>
                  <input
                    type="url"
                    required
                    value={newItem.externalUrl}
                    onChange={(e) => setNewItem({ ...newItem, externalUrl: e.target.value })}
                    placeholder="https://delima.moe.gov.my atau https://..."
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-yellow-400/40 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Ikon Menu
                  </label>
                  <select
                    value={newItem.iconName}
                    onChange={(e) => setNewItem({ ...newItem, iconName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/20 rounded-xl text-xs text-white focus:outline-none"
                  >
                    {AVAILABLE_NAV_ICONS.map((i) => (
                      <option key={i.name} value={i.name}>
                        {i.name} ({i.label})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Lencana (Badge)
                  </label>
                  <input
                    type="text"
                    value={newItem.badge}
                    onChange={(e) => setNewItem({ ...newItem, badge: e.target.value })}
                    placeholder="cth: Baru / Hot / 2026"
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-xs text-yellow-300 font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItem.requiresAdmin}
                    onChange={(e) => setNewItem({ ...newItem, requiresAdmin: e.target.checked })}
                    className="rounded border-white/30 text-yellow-400 focus:ring-yellow-400 w-4 h-4 bg-slate-950"
                  />
                  <span className="text-xs text-slate-200 font-semibold">
                    Hanya Paparkan Kepada Pentadbir (Admin Only)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-blue-950 font-black rounded-xl text-xs transition border border-yellow-300 shadow-md"
                >
                  Tambah Ke Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
