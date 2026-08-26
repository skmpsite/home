import React from 'react';
import { SchoolProfile, NewsItem, CalendarEvent, Staff } from '../../types';
import { initialSchoolProfile } from '../../data/initialData';
import {
  Bell,
  Megaphone,
  UserCheck,
  Calendar,
  BookOpen,
  Download,
  Users,
  Award,
  ChevronRight,
  Sparkles,
  Quote,
  Clock,
  ArrowUpRight,
  Video,
  Play,
  ExternalLink,
  Globe,
  CheckCircle2,
  MessageSquare,
  Share2,
  ShieldCheck
} from 'lucide-react';
import { TabType } from '../Navbar';
import { getSafeNewsImageUrl, SECONDARY_FALLBACK_PHOTOS } from '../../utils/imageHelpers';
import { FacebookSmartphoneSection } from './FacebookSmartphoneSection';

interface HeroSectionProps {
  profile: SchoolProfile;
  latestNews: NewsItem[];
  upcomingEvents: CalendarEvent[];
  staffList?: Staff[];
  onNavigate: (tab: TabType) => void;
  onSelectNews: (news: NewsItem) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  latestNews,
  upcomingEvents,
  staffList,
  onNavigate,
  onSelectNews
}) => {
  const guruBesarFromStaff = staffList?.find(
    (s) => s.position.toLowerCase().includes('guru besar') || (s.category === 'pentadbir' && s.order === 1)
  );

  const displayName = profile.principalName || (guruBesarFromStaff ? guruBesarFromStaff.name : 'Puan Norhafiza Binti Dolah');
  const displayPhoto = profile.principalPhotoUrl || guruBesarFromStaff?.photoUrl || '';
  const displayTitle = profile.principalTitle || (guruBesarFromStaff ? guruBesarFromStaff.position : 'Guru Besar (DG48)');
  const pinnedNews = latestNews.filter((n) => n.isPinned)[0] || latestNews[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Announcement Ticker Bar */}
      <div className="bg-yellow-400 text-blue-950 font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-yellow-400/10 flex items-center gap-3 border border-yellow-300">
        <div className="flex items-center gap-1.5 font-black uppercase tracking-wide bg-blue-950 text-yellow-300 px-2.5 py-1 rounded-lg text-[11px] flex-shrink-0">
          <Megaphone className="w-3.5 h-3.5" />
          <span>Pengumuman</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-grow text-xs font-bold text-blue-950">
          <span className="inline-block animate-marquee font-bold">
            📢 {pinnedNews ? pinnedNews.title : 'Selamat datang ke Portal Rasmi SK Merbau Pulas! Pendaftaran Tahun 1 Sesi 2027 kini dibuka di idMe KPM.'}
          </span>
        </div>
      </div>

      {/* Main Principal Welcome Banner */}
      <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-white/20">
        {/* Subtle Background Graphic Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
          <Quote className="w-8 h-8 text-yellow-400/30 absolute top-4 right-4" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-yellow-400 p-1 shadow-lg overflow-hidden flex-shrink-0 border-2 border-yellow-300/60 flex items-center justify-center">
              {displayPhoto && displayPhoto.trim() !== '' ? (
                <img
                  src={displayPhoto}
                  alt={displayName}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 rounded-xl flex flex-col items-center justify-center text-yellow-400">
                  <UserCheck className="w-9 h-9 opacity-80" />
                </div>
              )}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-[11px] border border-yellow-400/30 mb-1.5">
                <span>Perutusan & Kata Alu-Aluan</span>
              </div>
              <h4 className="font-black text-base sm:text-lg text-yellow-300">{displayName}</h4>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">{displayTitle}</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed font-light border-t border-white/10 pt-3">
            "{profile.principalSpeech || "Selamat datang ke laman web rasmi SK Merbau Pulas. Semoga platform ini menjadi jembatan perhubungan yang mantap antara warga sekolah, ibu bapa, dan komuniti dalam mencapai kecemerlangan modal insan."}"
          </p>
        </div>
      </div>

      {/* Quick Statistics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg hover:bg-white/15 transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center font-bold">
            <Users className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <span className="text-2xl font-black text-white leading-none">485</span>
            <p className="text-xs font-semibold text-slate-300 mt-0.5">Murid Terdaftar</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg hover:bg-white/15 transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <span className="text-2xl font-black text-white leading-none">32</span>
            <p className="text-xs font-semibold text-slate-300 mt-0.5">Guru Pendidik</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg hover:bg-white/15 transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center font-bold">
            <Award className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <span className="text-2xl font-black text-white leading-none">18</span>
            <p className="text-xs font-semibold text-slate-300 mt-0.5">Anugerah Tertiari</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-lg hover:bg-white/15 transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center font-bold">
            <Download className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <span className="text-2xl font-black text-white leading-none">24+</span>
            <p className="text-xs font-semibold text-slate-300 mt-0.5">Dokumen & Borang</p>
          </div>
        </div>
      </div>

      {/* Welcome Video Section */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-xs border border-yellow-400/30">
              <Play className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span>Tayangan Rasmi Sekolah</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Video className="w-6 h-6 text-yellow-400" />
              <span>Video Alu-Aluan & Profil SK Merbau Pulas</span>
            </h3>
          </div>
          <p className="text-xs text-slate-200 max-w-md leading-relaxed font-normal">
            Saksikan paparan montaj multimedia rasmi sekolah yang memaparkan keindahan persekitaran, keharmonian warga murid, serta aktiviti pembelajaran di SKMP.
          </p>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl aspect-video bg-slate-950 group">
          <iframe
            src="https://www.youtube.com/embed/i8HoTEU3h_I?autoplay=0&rel=0"
            title="Video Alu-aluan SK Merbau Pulas"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>

      {/* Facebook Live Feed Section - Smartphone Mockup & Full News Feed View */}
      <FacebookSmartphoneSection profile={profile} />

      {/* News & Events Dual Column */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left: Latest News Section */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-black text-white">Berita & Pengumuman Sekolah</h3>
            </div>
            <button
              onClick={() => onNavigate('berita')}
              className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {latestNews.slice(0, 4).map((news) => (
              <div
                key={news.id}
                onClick={() => onSelectNews(news)}
                className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-lg hover:border-yellow-400/50 hover:bg-white/15 transition cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 overflow-hidden relative bg-slate-900/40">
                    <img
                      src={getSafeNewsImageUrl(news.imageUrl, news.category, news.id)}
                      alt={news.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = SECONDARY_FALLBACK_PHOTOS[news.category] || SECONDARY_FALLBACK_PHOTOS.default;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-blue-950/90 backdrop-blur-sm text-yellow-300 font-extrabold rounded-lg text-[10px] uppercase tracking-wider border border-white/20">
                      {news.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
                      <Clock className="w-3 h-3 text-yellow-400" />
                      <span>{news.date}</span>
                      <span>•</span>
                      <span>{news.author}</span>
                    </div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-white group-hover:text-yellow-300 transition line-clamp-2 leading-snug">
                      {news.title}
                    </h4>
                    <p className="text-xs text-slate-300 line-clamp-2 font-normal leading-relaxed">
                      {news.summary}
                    </p>
                  </div>
                </div>
                <div className="px-4 pb-4 pt-1 flex items-center justify-between text-xs font-bold text-yellow-400 group-hover:text-yellow-300">
                  <span>Baca Lanjut</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Upcoming Events Calendar Widget */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-black text-white">Acara & Takwim</h3>
            </div>
            <button
              onClick={() => onNavigate('akademik')}
              className="text-xs font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 transition"
            >
              <span>Jadual</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-lg space-y-3">
            {upcomingEvents.slice(0, 4).map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition flex items-start gap-3.5"
              >
                <div className="bg-yellow-400 text-blue-950 rounded-xl p-2.5 text-center min-w-[50px] shadow-md flex-shrink-0 font-black">
                  <span className="block text-[10px] font-black uppercase leading-none">
                    {new Date(evt.date).toLocaleString('ms-MY', { month: 'short' })}
                  </span>
                  <span className="block text-lg font-black mt-1 leading-none">
                    {new Date(evt.date).getDate()}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                    {evt.category}
                  </span>
                  <h5 className="font-extrabold text-xs text-white line-clamp-1">
                    {evt.title}
                  </h5>
                  <p className="text-[11px] text-slate-300 line-clamp-1">
                    📍 {evt.location} ({evt.targetGroup})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
