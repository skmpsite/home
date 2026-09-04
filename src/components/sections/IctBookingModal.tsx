import React, { useState, useEffect } from 'react';
import {
  Tv,
  X,
  Laptop,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  Plus
} from 'lucide-react';

interface IctBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingFormUrl?: string;
}

interface LocalBooking {
  id: string;
  teacherName: string;
  facility: string;
  date: string;
  timeSlot: string;
  purpose: string;
  createdAt: string;
  status: 'Disahkan' | 'Dalam Semakan';
}

const STORAGE_KEY = 'skmp_ict_room_bookings';

const FACILITIES = [
  {
    id: 'makmal-ict',
    name: 'Makmal ICT',
    capacity: '30 Murid + Guru',
    equipment: '30 PC Murid, 1 PC Guru, Smart TV 65", Berhawa Dingin',
    tag: 'Popular'
  },
  {
    id: 'bilik-media',
    name: 'Bilik Akses Media & Pusat Digital',
    capacity: '15 Murid',
    equipment: '15 PC Rujukan, Projektor Digital, Meja Kolaborasi',
    tag: 'PdP Interaktif'
  },
  {
    id: 'lcd-portable',
    name: 'Peminjaman Projektor LCD Mudah Alih',
    capacity: 'Mengikut Bilik Darjah',
    equipment: '3 Unit Epson LCD Portable + Kabel HDMI/VGA + Skrin Lipat',
    tag: 'Peminjaman Alatan'
  },
  {
    id: 'dewan-terbuka',
    name: 'Dewan Terbuka (Siaraya & Skrin Besar)',
    capacity: 'Kapasiti Penuh Sekolah',
    equipment: 'PA System Mikrofon, Pengadun Audio & Skrin Tayangan',
    tag: 'Acara Rasmi'
  }
];

export const IctBookingModal: React.FC<IctBookingModalProps> = ({
  isOpen,
  onClose,
  bookingFormUrl = 'https://forms.google.com'
}) => {
  const [bookings, setBookings] = useState<LocalBooking[]>([]);
  const [teacherName, setTeacherName] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(FACILITIES[0].name);
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('Waktu PdP 1 - 2 (07:45 - 08:45)');
  const [purpose, setPurpose] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBookings(JSON.parse(stored));
      } else {
        // Sample default records for demo realism
        const initialSamples: LocalBooking[] = [
          {
            id: 'ict-1',
            teacherName: 'Cikgu Ahmad Zaki (Guru Sains)',
            facility: 'Makmal ICT',
            date: new Date().toISOString().split('T')[0],
            timeSlot: 'Waktu PdP 3 - 4 (08:45 - 09:45)',
            purpose: 'PdP Sains Tahun 5 - Simulasi Ekosistem Digital',
            createdAt: 'Hari ini, 07:30 AM',
            status: 'Disahkan'
          },
          {
            id: 'ict-2',
            teacherName: 'Ustazah Siti Aminah',
            facility: 'Peminjaman Projektor LCD Mudah Alih',
            date: new Date().toISOString().split('T')[0],
            timeSlot: 'Waktu PdP 7 - 8 (11:05 - 12:05)',
            purpose: 'Pendidikan Islam Tahun 4 - Tayangan Video Sirah',
            createdAt: 'Hari ini, 08:15 AM',
            status: 'Disahkan'
          }
        ];
        setBookings(initialSamples);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSamples));
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim() || !purpose.trim()) return;

    const newBooking: LocalBooking = {
      id: 'ict-' + Date.now(),
      teacherName: teacherName.trim(),
      facility: selectedFacility,
      date: bookingDate,
      timeSlot,
      purpose: purpose.trim(),
      createdAt: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
      status: 'Disahkan'
    };

    const updated = [newBooking, ...bookings];
    setBookings(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setTeacherName('');
    setPurpose('');
    setSuccessToast('Tempahan bilik ICT berjaya direkodkan dalam sistem sekolah!');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-white/20 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
              <Tv className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Tempahan Bilik Khas & Alatan ICT
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-black">
                  SK Merbau Pulas
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Makmal Komputer, Bilik Akses Digital, Dewan & Peminjaman Projektor LCD
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={bookingFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Form Rasmi</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition cursor-pointer"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Modal Scroll Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Facility Cards Grid */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Senarai Kemudahan Bilik Khas & Alatan ICT SKMP</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FACILITIES.map((f) => {
                const isSelected = selectedFacility === f.name;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFacility(f.name)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-950/60 border-blue-400 shadow-lg shadow-blue-900/30'
                        : 'bg-slate-950/40 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">{f.name}</p>
                          <p className="text-[10px] text-slate-400">{f.capacity}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-400/20 whitespace-nowrap">
                        {f.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-xl border border-white/5">
                      {f.equipment}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Booking Form */}
          <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Borang Tempahan Pantas Guru</span>
              </h4>
              <span className="text-[11px] text-slate-400">Penyelaras ICT: En. Azlan bin Mat Isa</span>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Teacher Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Nama Guru / Penempah:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder="Cth: Cikgu Norazlina binti Ismail"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* Facility Select */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Pilihan Bilik / Alatan:
                  </label>
                  <select
                    value={selectedFacility}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-blue-400 cursor-pointer"
                  >
                    {FACILITIES.map((f) => (
                      <option key={f.id} value={f.name}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Tarikh Penggunaan:
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* Time Slot */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Sesi / Waktu PdP:
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-blue-400 cursor-pointer"
                    >
                      <option value="Waktu PdP 1 - 2 (07:45 - 08:45)">Waktu PdP 1 - 2 (07:45 - 08:45)</option>
                      <option value="Waktu PdP 3 - 4 (08:45 - 09:45)">Waktu PdP 3 - 4 (08:45 - 09:45)</option>
                      <option value="Waktu PdP 5 - 6 (10:05 - 11:05)">Waktu PdP 5 - 6 (10:05 - 11:05)</option>
                      <option value="Waktu PdP 7 - 8 (11:05 - 12:05)">Waktu PdP 7 - 8 (11:05 - 12:05)</option>
                      <option value="Waktu PdP 9 - 10 (12:05 - 01:05)">Waktu PdP 9 - 10 (12:05 - 01:05)</option>
                      <option value="Sesi Petang / Kokurikulum (02:00 - 04:00)">Sesi Petang / Kokurikulum (02:00 - 04:00)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Tujuan Penggunaan & Kelas Murid:
                </label>
                <input
                  type="text"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Cth: PdP Matematik Tahun 6 - Aplikasi Canva & Google Docs"
                  className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sila pastikan suis elektrik & PC dimatikan selepas sesi.</span>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-blue-900/40 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Hantar Tempahan Pantas</span>
                </button>
              </div>
            </form>
          </div>

          {/* Booking History Table */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Senarai Rekod Tempahan Bilik ICT Terkini ({bookings.length})</span>
            </h4>
            {bookings.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 text-center">Tiada tempahan direkodkan lagi.</p>
            ) : (
              <div className="space-y-2">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 bg-slate-950/50 border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{b.facility}</span>
                        <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                          {b.status}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{b.purpose}</p>
                      <p className="text-[10px] text-slate-500">
                        Oleh: <strong className="text-slate-400">{b.teacherName}</strong> • Rekod: {b.createdAt}
                      </p>
                    </div>
                    <div className="sm:text-right flex-shrink-0 bg-white/5 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                      <p className="text-blue-300 font-bold text-[11px]">{b.date}</p>
                      <p className="text-slate-400 text-[10px]">{b.timeSlot}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
