import React, { useState, useRef, useMemo } from 'react';
import { SchoolProfile, Staff } from '../../types';
import { initialStaffList } from '../../data/initialData';
import { formatGoogleDriveUrl } from '../../utils/imageHelpers';
import { sortStaffBySeniority, isAdministrator } from '../../utils/staffHelpers';
import { getYouTubeEmbedUrl } from '../../utils/videoHelpers';
import {
  School,
  Music,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Target,
  Eye,
  Bookmark,
  Award,
  Users,
  Mail,
  Phone,
  BookOpen,
  ShieldCheck,
  X,
  Search,
  UserCheck,
  Youtube,
  ExternalLink,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';

interface ProfileSectionProps {
  profile: SchoolProfile;
  staffList?: Staff[];
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ profile, staffList = initialStaffList }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedLyrics, setCopiedLyrics] = useState(false);

  // States for Carta Organisasi
  const [selectedCategory, setSelectedCategory] = useState<'semua' | 'pentadbir' | 'guru' | 'staf'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaffModal, setSelectedStaffModal] = useState<Staff | null>(null);

  // Susun semua staf mengikut hierarki kekananan
  const sortedStaffList = useMemo(() => {
    return sortStaffBySeniority(staffList, profile);
  }, [staffList, profile]);

  const getStaffName = (staff: Staff): string => {
    const isGuruBesar =
      staff.id === 'staf-1' ||
      (staff.position && staff.position.toLowerCase().includes('guru besar')) ||
      (staff.name && staff.name.toLowerCase().includes('norhafiza'));
    if (isGuruBesar) {
      return profile?.principalName || staff.name || 'Puan Norhafiza Binti Dolah';
    }
    return staff.name;
  };

  const getStaffPosition = (staff: Staff): string => {
    const isGuruBesar =
      staff.id === 'staf-1' ||
      (staff.position && staff.position.toLowerCase().includes('guru besar')) ||
      (staff.name && staff.name.toLowerCase().includes('norhafiza'));
    if (isGuruBesar) {
      return profile?.principalTitle || staff.position || 'Guru Besar (DG48)';
    }
    return staff.position;
  };

  const getStaffPhoto = (staff: Staff): string => {
    const isGuruBesar =
      staff.id === 'staf-1' ||
      (staff.position && staff.position.toLowerCase().includes('guru besar')) ||
      (staff.name && staff.name.toLowerCase().includes('norhafiza'));

    if (isGuruBesar) {
      if (profile?.principalPhotoUrl && profile.principalPhotoUrl.trim() !== '') {
        return formatGoogleDriveUrl(profile.principalPhotoUrl);
      }
      if (
        staff.photoUrl &&
        staff.photoUrl.trim() !== '' &&
        !staff.photoUrl.includes('unsplash.com') &&
        !staff.photoUrl.includes('1786556385385') &&
        !staff.photoUrl.includes('1786555771027') &&
        !staff.photoUrl.includes('guru_besar_norhafiza') &&
        !staff.photoUrl.includes('1786808669012')
      ) {
        return formatGoogleDriveUrl(staff.photoUrl);
      }
      return '';
    }

    if (!staff.photoUrl || staff.photoUrl.trim() === '' || staff.photoUrl.includes('unsplash.com')) {
      return '';
    }
    return formatGoogleDriveUrl(staff.photoUrl);
  };

  const administrators = useMemo(() => {
    const admins = sortedStaffList.filter((s) => isAdministrator(s, profile));
    return sortStaffBySeniority(admins, profile);
  }, [sortedStaffList, profile]);
  
  const filteredStaff = useMemo(() => {
    return sortedStaffList.filter((s) => {
      let matchesCategory = true;
      if (selectedCategory === 'pentadbir') {
        matchesCategory = isAdministrator(s, profile);
      } else if (selectedCategory === 'guru') {
        matchesCategory = !isAdministrator(s, profile) && (s.category === 'guru' || (s.grade && s.grade.toUpperCase().includes('DG')));
      } else if (selectedCategory === 'staf') {
        matchesCategory = s.category === 'staf' || s.category === 'akp' || (!isAdministrator(s, profile) && !(s.grade && s.grade.toUpperCase().includes('DG')));
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        s.name.toLowerCase().includes(q) ||
        s.position.toLowerCase().includes(q) ||
        (s.grade && s.grade.toLowerCase().includes(q)) ||
        (s.subject && s.subject.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [sortedStaffList, selectedCategory, searchQuery, profile]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => console.log('Audio playback prevented', err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const restartAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Section Title Banner */}
      <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-xs border border-yellow-400/30 mb-2">
            <School className="w-3.5 h-3.5 text-yellow-400" />
            <span>Kertas Profil Rasmi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Profil & Latar Belakang Sekolah</h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
            Menyelusuri sejarah penubuhan, falsafah pendidikan, entiti kebanggaan, dan lagu rasmi Sekolah Kebangsaan Merbau Pulas.
          </p>
        </div>
        <div className="px-5 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center flex-shrink-0">
          <span className="block text-[10px] uppercase font-black text-yellow-400">Moto Sekolah</span>
          <span className="text-sm font-extrabold text-white font-serif italic">"{profile.motto}"</span>
        </div>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden group hover:border-yellow-400/50 transition">
          <div className="w-12 h-12 bg-blue-500/20 text-blue-300 rounded-2xl flex items-center justify-center font-bold mb-4 border border-blue-400/30">
            <Eye className="w-6 h-6 text-blue-300" />
          </div>
          <h3 className="text-lg font-black text-white mb-2">Visi Sekolah</h3>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            "{profile.vision}"
          </p>
          <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-400">
            Pernyataan visi rasmi berteraskan Aspirasi Kementerian Pendidikan Malaysia.
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-lg relative overflow-hidden group hover:border-yellow-400/50 transition">
          <div className="w-12 h-12 bg-yellow-500/20 text-yellow-300 rounded-2xl flex items-center justify-center font-bold mb-4 border border-yellow-400/30">
            <Target className="w-6 h-6 text-yellow-300" />
          </div>
          <h3 className="text-lg font-black text-white mb-2">Misi Sekolah</h3>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            "{profile.mission}"
          </p>
          <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-400">
            Membentuk modal insan berkualiti melalui pemantapan potensi menyeluruh.
          </div>
        </div>
      </div>

      {/* History & Background Detail Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 shadow-lg space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Bookmark className="w-5 h-5 text-yellow-400" />
          <h3 className="text-xl font-black text-white">Sejarah & Penubuhan SK Merbau Pulas</h3>
        </div>
        <div className="prose max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3 font-normal">
          <p>{profile.history}</p>
          <p>
            Nama sekolah ini diambil sempena kawasan petempatan Merbau Pulas yang kaya dengan sejarah tradisi pertanian dan semangat kemasyarakatan yang kuat. Kini SK Merbau Pulas menempatkan blok akademik yang kondusif, Pusat Sumber Digital Seri Merbau, Makmal Komputer Komprehensif, Dewan Terbuka, serta pelbagai kelengkapan sukan.
          </p>
        </div>
      </div>

      {/* Carta Organisasi Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 shadow-lg space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-xs border border-yellow-400/30 mb-2">
              <Users className="w-3.5 h-3.5 text-yellow-400" />
              <span>Warga Pendidik & Pengurusan</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">Carta Organisasi</h3>
            <p className="text-xs text-slate-200 mt-0.5">
              Struktur kepimpinan pentadbiran tertinggi sekolah, barisan guru pendidik, dan staf sokongan SK Merbau Pulas.
            </p>
          </div>
        </div>

        {/* Barisan Pentadbir Utama Sekolah */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <ShieldCheck className="w-5 h-5 text-yellow-400" />
            <h4 className="text-lg font-black text-white">Barisan Pentadbir Utama Sekolah</h4>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {administrators.map((admin) => {
              const photo = getStaffPhoto(admin);
              return (
                <div
                  key={admin.id}
                  onClick={() => setSelectedStaffModal(admin)}
                  className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-5 shadow-lg hover:shadow-xl transition text-center cursor-pointer group hover:border-yellow-400/50 flex flex-col items-center"
                >
                  <div className="w-24 h-24 rounded-2xl bg-yellow-400 p-0.5 shadow-md overflow-hidden mb-3 border-2 border-yellow-300 group-hover:scale-105 transition flex items-center justify-center">
                    {photo && photo.trim() !== '' ? (
                      <img
                        src={photo}
                        alt={admin.name}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-yellow-300">
                        <UserCheck className="w-10 h-10 opacity-70" />
                      </div>
                    )}
                  </div>
                  <span className="px-2.5 py-0.5 bg-blue-950 text-yellow-300 font-black rounded-md text-[10px] uppercase mb-2 border border-white/20">
                    {admin.position.toLowerCase().includes('guru besar') ? 'DG48' : admin.grade}
                  </span>
                  <h5 className="font-extrabold text-xs sm:text-sm text-white group-hover:text-yellow-300 transition line-clamp-1">
                    {getStaffName(admin)}
                  </h5>
                  <p className="text-xs text-yellow-400 font-bold mt-1 line-clamp-2">
                    {getStaffPosition(admin)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Direktori Guru & Staf Sokongan with Filter & Search */}
        <div className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-yellow-400" />
              <h4 className="text-lg font-black text-white">Direktori Guru & Staf Sokongan</h4>
            </div>

            {/* Search Field */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama atau subjek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-white/5 border border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              />
            </div>
          </div>

          {/* Filter Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'semua', label: 'Semua Warga' },
              { id: 'pentadbir', label: 'Pentadbir' },
              { id: 'guru', label: 'Barisan Guru' },
              { id: 'staf', label: 'Staf Sokongan' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedCategory === tab.id
                    ? 'bg-yellow-400 text-blue-950 font-black shadow-lg shadow-yellow-400/20'
                    : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Staff Cards Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredStaff.map((staff) => {
              const photo = getStaffPhoto(staff);
              return (
                <div
                  key={staff.id}
                  onClick={() => setSelectedStaffModal(staff)}
                  className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 hover:border-yellow-400/50 transition cursor-pointer shadow-md group flex items-center gap-3.5"
                >
                  <div className="w-14 h-14 rounded-xl bg-yellow-400 p-0.5 overflow-hidden flex-shrink-0 shadow-sm flex items-center justify-center">
                    {photo && photo.trim() !== '' ? (
                      <img
                        src={photo}
                        alt={getStaffName(staff)}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-yellow-300">
                        <UserCheck className="w-6 h-6 opacity-70" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <span className="text-[10px] font-bold text-yellow-300 uppercase bg-yellow-500/20 px-1.5 py-0.2 rounded border border-yellow-400/30">
                      {staff.position.toLowerCase().includes('guru besar') ? 'DG48' : staff.grade}
                    </span>
                    <h5 className="font-extrabold text-xs text-white group-hover:text-yellow-300 transition truncate">
                      {getStaffName(staff)}
                    </h5>
                    <p className="text-[11px] text-slate-300 truncate font-medium">
                      {getStaffPosition(staff)}
                    </p>
                    {staff.subject && (
                      <p className="text-[10px] text-yellow-400 font-semibold truncate">
                        📖 {staff.subject}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Logo & Emblem Breakdown */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 shadow-lg space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <Award className="w-5 h-5 text-yellow-400" />
          <h3 className="text-xl font-black text-white">Logo & Lencana Sekolah</h3>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-center">
          {/* Logo Visual Box */}
          <div className="md:col-span-4 flex flex-col items-center justify-center bg-white/5 p-6 rounded-3xl border border-white/10 text-center">
            <div className="w-36 h-36 bg-white/10 backdrop-blur-md rounded-3xl p-2 shadow-2xl overflow-hidden mb-3 border-2 border-yellow-400/50 flex items-center justify-center">
              <img
                src={profile.logoUrl}
                alt="Lencana SK Merbau Pulas"
                className="w-full h-full object-contain"
              />
            </div>
            <h4 className="font-extrabold text-sm text-white uppercase">Lencana Rasmi SKMP</h4>
            <span className="text-xs font-bold text-yellow-400">{profile.code}</span>
          </div>

          {/* Logo Symbolism Descriptions */}
          <div className="md:col-span-8 space-y-3">
            <h4 className="font-extrabold text-sm text-white mb-2">Huraian Simbol & Warna:</h4>
            <div className="space-y-2.5">
              {profile.logoDescription.map((desc, idx) => {
                const parts = desc.split(':');
                return (
                  <div key={idx} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-xs flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-yellow-400 text-blue-950 font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <strong className="font-bold text-white">{parts[0]}:</strong>
                      <span className="text-slate-300 ml-1">{parts[1] || ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* School Anthem Section (Lagu Sekolah) with YouTube Video Player & Official Lyrics */}
      {(() => {
        const isYouTubeSong = profile.songAudioUrl?.includes('youtube.com') || profile.songAudioUrl?.includes('youtu.be');
        const youtubeSongEmbed = getYouTubeEmbedUrl(profile.songAudioUrl || 'https://www.youtube.com/watch?v=dNCLSPCYAtc');
        const youtubeWatchUrl = profile.songAudioUrl?.startsWith('http') ? profile.songAudioUrl : 'https://www.youtube.com/watch?v=dNCLSPCYAtc';

        const handleCopyLink = () => {
          navigator.clipboard.writeText(youtubeWatchUrl);
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2500);
        };

        const handleCopyLyrics = () => {
          const text = `${profile.songTitle}\n\nPencipta Lirik: ${profile.songLyricist || 'Tn Hj Shukeri bin Hj Ibrahim'}\nPencipta Lagu: ${profile.songComposer || 'Tn Hj Shukeri bin Hj Ibrahim'}\nGubahan Muzik: ${profile.songArranger || 'En Anuar bin Mohd Nor'}\nTarikh Ciptaan Lagu: ${profile.songCreatedDate || '18 Mei 2024 (12.30 Malam)'}\n\n${profile.songLyrics.join('\n')}`;
          navigator.clipboard.writeText(text);
          setCopiedLyrics(true);
          setTimeout(() => setCopiedLyrics(false), 2500);
        };

        return (
          <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-blue-950 font-bold shadow-md flex-shrink-0">
                  <Music className="w-6 h-6 text-blue-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase text-yellow-400 tracking-wider">Lagu Rasmi Sekolah</span>
                    <span className="text-[10px] bg-red-600/90 text-white font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Youtube className="w-3 h-3" /> YouTube Rasmi
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">"{profile.songTitle}"</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Pencipta: <strong className="text-white">{profile.songComposer || 'Tn Hj Shukeri bin Hj Ibrahim'}</strong>
                    {profile.songArranger && (
                      <span className="text-slate-400 ml-1.5">• Gubahan Muzik: <strong className="text-slate-200">{profile.songArranger}</strong></span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={youtubeWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-md shadow-red-600/30"
                  title="Tonton di YouTube"
                >
                  <Youtube className="w-4 h-4" />
                  <span>Tonton di YouTube</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition border border-white/15"
                  title="Salin pautan video lagu"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Pautan Disalin!' : 'Salin Pautan'}</span>
                </button>
              </div>
            </div>

            {/* Dual Column: Video Player on Left, Official Lyrics on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Official YouTube Video Player & Penghargaan Credits */}
              <div className="lg:col-span-7 space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl aspect-video bg-slate-950">
                  {isYouTubeSong ? (
                    <iframe
                      src={youtubeSongEmbed}
                      title={`Lagu Rasmi Sekolah - ${profile.songTitle}`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-gradient-to-br from-blue-950 to-slate-950">
                      <Music className="w-12 h-12 text-yellow-400 animate-pulse" />
                      <p className="text-sm font-bold text-white">{profile.songTitle}</p>
                      <div className="flex items-center gap-3 bg-white/10 p-2.5 rounded-2xl border border-white/20">
                        <audio ref={audioRef} src={profile.songAudioUrl} onEnded={() => setIsPlaying(false)} />
                        <button onClick={togglePlay} className="w-10 h-10 bg-yellow-400 text-blue-950 rounded-xl flex items-center justify-center font-bold shadow">
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                        </button>
                        <button onClick={restartAudio} className="p-2 text-slate-300 hover:text-white"><RotateCcw className="w-4 h-4" /></button>
                        <button onClick={toggleMute} className="p-2 text-slate-300 hover:text-white">
                          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Penghargaan Box matching Official Credits Screen */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-slate-300 space-y-3">
                  <div className="flex items-center justify-between text-yellow-300 font-bold border-b border-white/10 pb-2.5">
                    <span className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-yellow-400" /> Penghargaan & Maklumat Lagu
                    </span>
                    <span className="text-[10px] bg-yellow-400/20 text-yellow-300 px-2.5 py-0.5 rounded-full font-mono font-bold">
                      {profile.songCreatedDate || '18 Mei 2024 (12.30 Malam)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-yellow-400/90 block uppercase tracking-wider font-bold">Pencipta Lirik</span>
                      <p className="font-bold text-white text-xs sm:text-sm mt-0.5">{profile.songLyricist || 'Tn Hj Shukeri bin Hj Ibrahim'}</p>
                    </div>

                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-yellow-400/90 block uppercase tracking-wider font-bold">Pencipta Lagu</span>
                      <p className="font-bold text-white text-xs sm:text-sm mt-0.5">{profile.songComposer || 'Tn Hj Shukeri bin Hj Ibrahim'}</p>
                    </div>

                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-yellow-400/90 block uppercase tracking-wider font-bold">Gubahan Muzik</span>
                      <p className="font-bold text-white text-xs sm:text-sm mt-0.5">{profile.songArranger || 'En Anuar bin Mohd Nor'}</p>
                    </div>

                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-yellow-400/90 block uppercase tracking-wider font-bold">Tarikh Ciptaan Lagu</span>
                      <p className="font-bold text-white text-xs sm:text-sm mt-0.5">{profile.songCreatedDate || '18 Mei 2024 (12.30 Malam)'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Lyrics Display */}
              <div className="lg:col-span-5 bg-slate-900/70 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/15 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-yellow-400 tracking-wider">Seni Kata & Lirik</span>
                    <h4 className="text-base font-bold text-white">"{profile.songTitle}"</h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLyrics}
                    className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-lg text-[11px] flex items-center gap-1 border border-white/10 transition"
                    title="Salin teks lirik"
                  >
                    {copiedLyrics ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLyrics ? 'Disalin!' : 'Salin Lirik'}</span>
                  </button>
                </div>

                <div className="space-y-2.5 text-center font-serif py-1 max-h-[380px] overflow-y-auto pr-1">
                  {profile.songLyrics.map((line, idx) => (
                    <p
                      key={idx}
                      className={`text-xs sm:text-sm tracking-wide ${
                        line.startsWith('Chorus')
                          ? 'font-sans font-black uppercase text-yellow-400 pt-2 text-xs tracking-widest'
                          : line === ''
                          ? 'py-1'
                          : 'text-slate-100 font-medium'
                      }`}
                    >
                      {line}
                    </p>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/10 text-center text-[10px] text-slate-400">
                  Sekolah Kebangsaan Merbau Pulas • Berilmu, Beramal, Berbakti
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Staff Detail Modal */}
      {selectedStaffModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900/90 backdrop-blur-2xl text-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/20 relative">
            <button
              onClick={() => setSelectedStaffModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-24 h-24 rounded-2xl bg-yellow-400 p-1 shadow-lg overflow-hidden flex items-center justify-center">
                {getStaffPhoto(selectedStaffModal) && getStaffPhoto(selectedStaffModal).trim() !== '' ? (
                  <img
                    src={getStaffPhoto(selectedStaffModal)}
                    alt={getStaffName(selectedStaffModal)}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-yellow-300">
                    <UserCheck className="w-10 h-10 opacity-70" />
                  </div>
                )}
              </div>

              <div>
                <span className="px-2.5 py-0.5 bg-blue-950 text-yellow-300 font-black rounded-md text-[10px] uppercase border border-white/20">
                  {selectedStaffModal.position.toLowerCase().includes('guru besar') ? 'DG48' : selectedStaffModal.grade}
                </span>
                <h3 className="font-extrabold text-base text-white mt-2">
                  {getStaffName(selectedStaffModal)}
                </h3>
                <p className="text-xs text-yellow-400 font-bold">
                  {getStaffPosition(selectedStaffModal)}
                </p>
              </div>

              <div className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-left space-y-2 text-xs">
                {selectedStaffModal.subject && (
                  <div className="flex items-center gap-2 text-slate-200">
                    <BookOpen className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span><strong>Subjek / Tugas:</strong> {selectedStaffModal.subject}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-200">
                  <Mail className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span><strong>E-mel DELIMa:</strong> {selectedStaffModal.email}</span>
                </div>
                {selectedStaffModal.phone && (
                  <div className="flex items-center gap-2 text-slate-200">
                    <Phone className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span><strong>No. Telefon:</strong> {selectedStaffModal.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
