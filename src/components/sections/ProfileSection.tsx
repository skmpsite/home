import React, { useState, useRef } from 'react';
import { SchoolProfile } from '../../types';
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
  Sparkles,
  Info
} from 'lucide-react';

interface ProfileSectionProps {
  profile: SchoolProfile;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ profile }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

      {/* School Anthem Section (Lagu Sekolah) with Audio Synthesizer Player */}
      <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-blue-950 font-bold shadow-md">
              <Music className="w-6 h-6 text-blue-950" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-yellow-400 tracking-wider">Lagu Rasmi Sekolah</span>
              <h3 className="text-xl font-black text-white">"{profile.songTitle}"</h3>
              <p className="text-xs text-slate-300 mt-0.5">{profile.songComposer}</p>
            </div>
          </div>

          {/* Audio Synthesizer Controls */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 shadow-inner">
            <audio
              ref={audioRef}
              src={profile.songAudioUrl}
              onEnded={() => setIsPlaying(false)}
            />
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-yellow-400 hover:bg-yellow-300 text-blue-950 rounded-xl flex items-center justify-center font-bold shadow transition"
              title={isPlaying ? 'Jeda Lagu' : 'Mainkan Lagu'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={restartAudio}
              className="p-2 text-slate-300 hover:text-white transition"
              title="Mula Semula"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleMute}
              className="p-2 text-slate-300 hover:text-white transition"
              title={isMuted ? 'Buka Suara' : 'Senyap'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Lyrics Display */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center max-w-xl mx-auto space-y-3 font-serif">
          {profile.songLyrics.map((line, idx) => (
            <p
              key={idx}
              className={`text-xs sm:text-sm tracking-wide ${
                line === 'Chorus:'
                  ? 'font-bold uppercase text-yellow-400 pt-2 font-sans text-xs'
                  : line === ''
                  ? 'py-1'
                  : 'text-slate-200'
              }`}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
