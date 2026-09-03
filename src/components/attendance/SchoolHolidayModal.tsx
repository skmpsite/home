import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CalendarCheck2,
  Tag,
  Clock,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SchoolHoliday } from '../../types';
import { isKedahWeekend } from '../../utils/studentHelpers';

interface SchoolHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  holidays: SchoolHoliday[];
  onSaveHolidays: (holidays: SchoolHoliday[]) => void;
  selectedDate?: string;
  onSelectDate?: (dateStr: string) => void;
}

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  peristiwa: { label: 'Cuti Peristiwa', color: 'bg-amber-500/20 text-amber-300 border-amber-400/30' },
  perayaan: { label: 'Cuti Perayaan', color: 'bg-purple-500/20 text-purple-300 border-purple-400/30' },
  penggal: { label: 'Cuti Penggal', color: 'bg-blue-500/20 text-blue-300 border-blue-400/30' },
  umum: { label: 'Cuti Umum', color: 'bg-rose-500/20 text-rose-300 border-rose-400/30' },
  khas: { label: 'Cuti Khas', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' }
};

const POPULAR_SUGGESTIONS = [
  'Cuti Peristiwa Sukan',
  'Cuti Peristiwa Hari Guru',
  'Cuti Hari Kebangsaan',
  'Cuti Hari Malaysia',
  'Cuti Hari Keputeraan Sultan',
  'Cuti Pertengahan Penggal 1',
  'Cuti Pertengahan Penggal 2',
  'Cuti Akhir Persekolahan',
  'Cuti Hari Raya Aidilfitri',
  'Cuti Deepavali',
  'Cuti Tahun Baharu Cina',
  'Cuti Khas Bencana Alam'
];

export const SchoolHolidayModal: React.FC<SchoolHolidayModalProps> = ({
  isOpen,
  onClose,
  holidays,
  onSaveHolidays,
  selectedDate,
  onSelectDate
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    if (selectedDate) {
      const d = new Date(selectedDate);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDateFrom, setFormDateFrom] = useState<string>(() => selectedDate || new Date().toISOString().split('T')[0]);
  const [formDateTo, setFormDateTo] = useState<string>(() => selectedDate || new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState<'peristiwa' | 'perayaan' | 'penggal' | 'umum' | 'khas'>('peristiwa');
  const [formDescription, setFormDescription] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const goToToday = () => {
    const now = new Date();
    setCurrentMonthDate(now);
    const todayStr = now.toISOString().split('T')[0];
    setFormDateFrom(todayStr);
    setFormDateTo(todayStr);
  };

  // Days in calendar month
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();

    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isWeekend: boolean;
      weekendDayName: string;
      holiday?: SchoolHoliday;
    }> = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const holiday = holidays.find((h) => dateStr >= h.dateFrom && dateStr <= h.dateTo);
      const wk = isKedahWeekend(dateStr);
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend: wk.isWeekend,
        weekendDayName: wk.dayName,
        holiday
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const holiday = holidays.find((h) => dateStr >= h.dateFrom && dateStr <= h.dateTo);
      const wk = isKedahWeekend(dateStr);
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isWeekend: wk.isWeekend,
        weekendDayName: wk.dayName,
        holiday
      });
    }

    // Next month padding to fill rows (multiple of 7)
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      for (let d = 1; d <= remaining; d++) {
        const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const holiday = holidays.find((h) => dateStr >= h.dateFrom && dateStr <= h.dateTo);
        const wk = isKedahWeekend(dateStr);
        days.push({
          dateStr,
          dayNum: d,
          isCurrentMonth: false,
          isToday: dateStr === todayStr,
          isWeekend: wk.isWeekend,
          weekendDayName: wk.dayName,
          holiday
        });
      }
    }

    return days;
  }, [currentMonthDate, holidays]);

  const handleSelectDay = (dateStr: string, existingHoliday?: SchoolHoliday) => {
    if (existingHoliday) {
      setEditingId(existingHoliday.id);
      setFormTitle(existingHoliday.title);
      setFormDateFrom(existingHoliday.dateFrom);
      setFormDateTo(existingHoliday.dateTo);
      setFormCategory(existingHoliday.category || 'peristiwa');
      setFormDescription(existingHoliday.description || '');
    } else {
      setFormDateFrom(dateStr);
      setFormDateTo(dateStr);
      if (!editingId) {
        if (!formTitle) setFormTitle('Cuti Peristiwa');
      }
    }
    if (onSelectDate) onSelectDate(dateStr);
  };

  const handleEdit = (h: SchoolHoliday) => {
    setEditingId(h.id);
    setFormTitle(h.title);
    setFormDateFrom(h.dateFrom);
    setFormDateTo(h.dateTo);
    setFormCategory(h.category || 'peristiwa');
    setFormDescription(h.description || '');
    setErrorMsg('');
    // Scroll to form on small screens
    const formEl = document.getElementById('holiday-edit-form');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormTitle('');
    setFormDescription('');
    setErrorMsg('');
  };

  const handleDelete = (id: string, title: string) => {
    if (!window.confirm(`Adakah anda pasti ingin memadamkan cuti "${title}"?`)) return;
    const updated = holidays.filter((h) => h.id !== id);
    onSaveHolidays(updated);
    if (editingId === id) handleCancelEdit();
    showToast(`Cuti "${title}" telah dipadamkan.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formTitle.trim()) {
      setErrorMsg('Sila masukkan Tajuk Cuti Sekolah.');
      return;
    }
    if (!formDateFrom || !formDateTo) {
      setErrorMsg('Sila pilih tarikh mula dan tarikh tamat cuti.');
      return;
    }
    if (formDateTo < formDateFrom) {
      setErrorMsg('Tarikh tamat tidak boleh lebih awal daripada tarikh mula.');
      return;
    }

    if (editingId) {
      const updated = holidays.map((h) => {
        if (h.id === editingId) {
          return {
            ...h,
            title: formTitle.trim(),
            dateFrom: formDateFrom,
            dateTo: formDateTo,
            category: formCategory,
            description: formDescription.trim()
          };
        }
        return h;
      });
      onSaveHolidays(updated);
      showToast(`Cuti "${formTitle}" berjaya dikemaskini.`);
      handleCancelEdit();
    } else {
      const newHol: SchoolHoliday = {
        id: `hol-${Date.now()}`,
        title: formTitle.trim(),
        dateFrom: formDateFrom,
        dateTo: formDateTo,
        category: formCategory,
        description: formDescription.trim(),
        createdAt: new Date().toISOString()
      };
      const updated = [newHol, ...holidays].sort((a, b) => b.dateFrom.localeCompare(a.dateFrom));
      onSaveHolidays(updated);
      showToast(`Cuti "${newHol.title}" berjaya ditandakan.`);
      setFormTitle('');
      setFormDescription('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shadow-md">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Kalendar Cuti Sekolah
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-400 text-blue-950 uppercase shadow-sm">
                  Admin e-Kehadiran
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Tandakan hari cuti persekolahan rasmi atau cuti peristiwa dengan tajuk cuti.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-500/10 border-b border-amber-400/20 px-4 py-2.5 flex items-start gap-2.5 text-xs text-amber-200">
          <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Kesan Penandaan Cuti:</strong> Pada tarikh yang ditandakan cuti, sistem akan secara automatik menggantikan tulisan <strong>"Peratus Kehadiran Semasa %"</strong> di Menu Utama HEM dengan <strong>Tajuk Cuti</strong> tersebut, dan paparan e-kehadiran akan diselaraskan kepada <strong>Hadir 0%</strong> dan <strong>Tidak Hadir 100%</strong>.
          </p>
        </div>

        {/* Toast Alert */}
        {successToast && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-4 py-2 flex items-center gap-2 text-xs font-bold text-emerald-300 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Calendar View (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/10 shadow-lg">
                {/* Month Navigator Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-extrabold text-sm sm:text-base text-white">
                      {currentMonthDate.toLocaleDateString('ms-MY', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={goToToday}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition"
                    >
                      Hari Ini
                    </button>
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-lg transition"
                      title="Bulan Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-1.5 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-lg transition"
                      title="Bulan Seterusnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day Names Grid (Ahad - Sabtu) */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 uppercase mb-1">
                  <div>Ahd</div>
                  <div>Isn</div>
                  <div>Sel</div>
                  <div>Rab</div>
                  <div>Kha</div>
                  <div className="text-amber-400 font-extrabold">Jum (Cuti)</div>
                  <div className="text-amber-400 font-extrabold">Sab (Cuti)</div>
                </div>

                {/* Calendar Days Matrix */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day) => {
                    const isSelected = formDateFrom <= day.dateStr && formDateTo >= day.dateStr;
                    const hasCustomHoliday = !!day.holiday;
                    const isWeekendHoliday = day.isWeekend && !hasCustomHoliday;
                    return (
                      <button
                        key={day.dateStr}
                        type="button"
                        onClick={() => handleSelectDay(day.dateStr, day.holiday)}
                        className={`min-h-[58px] sm:min-h-[64px] p-1 rounded-xl text-left transition flex flex-col justify-between relative group ${
                          day.isCurrentMonth ? 'bg-white/5 hover:bg-white/10' : 'bg-white/[0.02] text-slate-500'
                        } ${
                          hasCustomHoliday
                            ? 'border-2 border-amber-400/80 bg-amber-500/15 shadow-sm'
                            : isWeekendHoliday
                            ? 'border border-amber-400/30 bg-amber-500/5 hover:bg-amber-500/10'
                            : 'border border-white/5'
                        } ${isSelected ? 'ring-2 ring-emerald-400' : ''}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={`text-xs font-black rounded-md px-1.5 py-0.5 ${
                              day.isToday
                                ? 'bg-emerald-500 text-slate-950'
                                : hasCustomHoliday
                                ? 'text-yellow-300 font-extrabold'
                                : isWeekendHoliday
                                ? 'text-amber-300/90 font-bold'
                                : day.isCurrentMonth
                                ? 'text-slate-200'
                                : 'text-slate-500'
                            }`}
                          >
                            {day.dayNum}
                          </span>
                          {hasCustomHoliday && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          )}
                          {isWeekendHoliday && (
                            <span className="text-[9px] text-amber-300/80 font-bold">🏖️</span>
                          )}
                        </div>

                        {hasCustomHoliday ? (
                          <div
                            className="text-[9px] font-bold text-amber-200 truncate bg-amber-500/30 px-1 py-0.5 rounded mt-1 w-full text-center border border-amber-400/30"
                            title={`${day.holiday!.title} (${day.holiday!.dateFrom} - ${day.holiday!.dateTo})`}
                          >
                            🏖️ {day.holiday!.title}
                          </div>
                        ) : isWeekendHoliday ? (
                          <div
                            className="text-[8.5px] font-semibold text-amber-300/80 truncate bg-amber-500/10 px-1 py-0.5 rounded mt-1 w-full text-center border border-amber-400/20"
                            title={`Cuti Hujung Minggu (${day.weekendDayName})`}
                          >
                            Hujung Minggu
                          </div>
                        ) : (
                          <span className="text-[8px] text-slate-500 opacity-0 group-hover:opacity-100 transition self-center">
                            Pilih
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-500 text-slate-950 font-bold text-[8px] flex items-center justify-center">
                    ✓
                  </span>
                  <span>Hari Ini</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-amber-500/40 border border-amber-400/80" />
                  <span>Cuti Takwim/Peristiwa Ditandakan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-amber-500/10 border border-amber-400/30 text-[8px] text-center flex items-center justify-center">
                    🏖️
                  </span>
                  <span>Cuti Hujung Minggu (Jumaat & Sabtu - Default Kedah)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md ring-2 ring-emerald-400" />
                  <span>Tarikh Dipilih</span>
                </div>
              </div>
            </div>

            {/* Right Column: Add / Edit Form (5 cols) */}
            <div className="lg:col-span-5 space-y-4" id="holiday-edit-form">
              <form
                onSubmit={handleSubmit}
                className="bg-slate-950/80 p-5 rounded-2xl border border-emerald-500/30 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h4 className="font-black text-white text-sm flex items-center gap-2">
                    {editingId ? (
                      <>
                        <Edit2 className="w-4 h-4 text-yellow-400" />
                        <span>Kemaskini Cuti Sekolah</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-emerald-400" />
                        <span>Tandakan Cuti Sekolah Baru</span>
                      </>
                    )}
                  </h4>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-[11px] text-slate-400 hover:text-white underline"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>

                {errorMsg && (
                  <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Tajuk Cuti */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                    <span>Tajuk Cuti (Akan Terpapar di HEM & e-Kehadiran) *</span>
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Cth: Cuti Peristiwa Sukan / Cuti Hari Kebangsaan"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  {/* Cadangan Cepat */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {POPULAR_SUGGESTIONS.slice(0, 6).map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setFormTitle(sug)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tarikh Mula & Tarikh Tamat */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">Tarikh Mula *</label>
                    <input
                      type="date"
                      value={formDateFrom}
                      onChange={(e) => {
                        setFormDateFrom(e.target.value);
                        if (formDateTo < e.target.value) setFormDateTo(e.target.value);
                      }}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300">Tarikh Tamat *</label>
                    <input
                      type="date"
                      value={formDateTo}
                      onChange={(e) => setFormDateTo(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                {/* Kategori Cuti */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">Kategori Cuti</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="peristiwa">Cuti Peristiwa (Aktiviti / Kejohanan)</option>
                    <option value="perayaan">Cuti Perayaan (Hari Raya, Deepavali, dsb)</option>
                    <option value="penggal">Cuti Penggal Persekolahan</option>
                    <option value="umum">Cuti Umum / Hari Kebangsaan</option>
                    <option value="khas">Cuti Khas / Bencana</option>
                  </select>
                </div>

                {/* Catatan / Keterangan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">Catatan Tambahan (Pilihan)</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Cth: Diluluskan oleh JPN / Surat Pekeliling Ikhtisas..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl p-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                {/* Butang Simpan */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingId ? 'Simpan Kemaskini' : 'Tandakan Cuti Sekolah'}</span>
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-slate-300 font-bold rounded-xl text-xs transition"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Senarai Cuti Sekolah Yang Telah Ditandakan */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-yellow-400" />
                <h4 className="font-extrabold text-sm text-white">
                  Senarai Cuti Sekolah Ditandakan ({holidays.length})
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                Susunan mengikut tarikh terkini
              </span>
            </div>

            {holidays.length === 0 ? (
              <div className="p-6 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center text-xs text-slate-400">
                Tiada hari cuti ditandakan lagi. Gunakan borang di atas untuk menambah hari cuti sekolah.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {holidays.map((h) => {
                  const cat = CATEGORY_MAP[h.category || 'peristiwa'] || CATEGORY_MAP.peristiwa;
                  const isSingleDay = h.dateFrom === h.dateTo;
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isTodayHoliday = todayStr >= h.dateFrom && todayStr <= h.dateTo;

                  return (
                    <div
                      key={h.id}
                      className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                        isTodayHoliday
                          ? 'bg-amber-500/15 border-amber-400/60 shadow-lg'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${cat.color}`}
                          >
                            {cat.label}
                          </span>
                          {isTodayHoliday && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 animate-pulse">
                              ★ HARI INI
                            </span>
                          )}
                        </div>

                        <h5 className="font-extrabold text-sm text-white truncate">
                          {h.title}
                        </h5>

                        <div className="flex items-center gap-2 text-[11px] text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                          <span>
                            {isSingleDay
                              ? h.dateFrom
                              : `${h.dateFrom} hingga ${h.dateTo}`}
                          </span>
                        </div>

                        {h.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2">
                            {h.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEdit(h)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                          title="Kemaskini Cuti"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(h.id, h.title)}
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition"
                          title="Padam Cuti"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 text-[11px]">
            Perubahan cuti disimpan dan diselaraskan secara automatik ke seluruh sistem sekolah.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
