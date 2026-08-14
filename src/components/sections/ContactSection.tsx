import React, { useState } from 'react';
import { SchoolProfile, FeedbackEntry } from '../../types';
import { PhoneCall, MapPin, Mail, Phone, Printer, Send, CheckCircle2, MessageSquare } from 'lucide-react';

interface ContactSectionProps {
  profile: SchoolProfile;
  onSubmitFeedback: (data: Omit<FeedbackEntry, 'id' | 'createdAt' | 'status'>) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ profile, onSubmitFeedback }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'pertanyaan' as 'pertanyaan' | 'cadangan' | 'aduan' | 'pibg',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;

    onSubmitFeedback(formData);
    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      category: 'pertanyaan',
      subject: '',
      message: ''
    });

    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Banner */}
      <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-xs border border-yellow-400/30 mb-2">
          <PhoneCall className="w-3.5 h-3.5 text-yellow-400" />
          <span>Hubungi Sekolah</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Lokasi, Pejabat & Borang Maklum Balas</h2>
        <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
          Maklumat lokasi Sekolah Kebangsaan Merbau Pulas, nombor telefon rasmi, serta borang maklum balas terus ke pentadbiran sekolah.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Address Details & Google Maps Embed */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h3 className="font-extrabold text-lg text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-yellow-400" /> Alamat & Talian Rasmi
            </h3>

            <div className="space-y-3 text-xs text-slate-200">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <span className="font-black text-yellow-300 text-sm block">{profile.name} ({profile.code})</span>
                <p>{profile.address}</p>
                <p>{profile.postcode} {profile.city}, {profile.state}</p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                <Phone className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <div>
                  <span className="block font-bold text-white">Telefon Pejabat:</span>
                  <span className="text-slate-300 font-mono">{profile.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                <Printer className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <div>
                  <span className="block font-bold text-white">Faks Pejabat:</span>
                  <span className="text-slate-300 font-mono">{profile.fax}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                <Mail className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <div>
                  <span className="block font-bold text-white">E-mel Rasmi Sekolah:</span>
                  <span className="text-slate-300 font-mono">{profile.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Google Maps Frame */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-4 shadow-lg space-y-2">
            <span className="text-xs font-bold text-white block">Peta Lokasi Google Maps</span>
            <div className="rounded-2xl overflow-hidden h-64 border border-white/10 shadow-inner">
              <iframe
                title="Peta Lokasi SK Merbau Pulas"
                src={profile.locationCoords.googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Feedback Form */}
        <div className="lg:col-span-7">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center text-blue-950 font-bold shadow">
                <MessageSquare className="w-5 h-5 text-blue-950" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Borang Maklum Balas & Pertanyaan</h3>
                <p className="text-xs text-slate-200">
                  Hantarkan soalan, cadangan, atau aduan anda terus kepada pihak sekolah.
                </p>
              </div>
            </div>

            {submitted && (
              <div className="p-4 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs rounded-2xl flex items-center gap-3 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <strong className="block font-bold">Maklum Balas Berjaya Dihantar!</strong>
                  <span>Terima kasih. Pihak pentadbiran sekolah akan meneliti mesej anda.</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Nama Penuh <span className="text-yellow-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: En. Ahmad Razak"
                    className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Alamat E-mel
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@email.com"
                    className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Nombor Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="012-345 6789"
                    className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Kategori Maklum Balas
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as any })
                    }
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50 font-medium"
                  >
                    <option value="pertanyaan">Pertanyaan Umum</option>
                    <option value="cadangan">Cadangan Penambahbaikan</option>
                    <option value="aduan">Aduan / Aduan Kerosakan</option>
                    <option value="pibg">Hal Ehwal PIBG</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Subjek / Tajuk Mesej
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ringkasan perkara..."
                  className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Kandungan Mesej <span className="text-yellow-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tuliskan soalan atau pandangan anda di sini..."
                  className="w-full text-xs p-3.5 bg-white/5 border border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-yellow-400/20"
              >
                <Send className="w-4 h-4 text-blue-950" />
                <span>Hantar Maklum Balas Ke Pentadbiran</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
