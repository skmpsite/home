import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SignageSlide,
  SignageConfig,
  SchoolProfile
} from '../../types';
import {
  loadSignageSlides,
  loadSignageConfig,
  saveSignageSlides,
  saveSignageConfig
} from '../../utils/storage';
import {
  Maximize2,
  Minimize2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Tv,
  Clock,
  Calendar,
  Sparkles,
  Volume2,
  VolumeX,
  Radio,
  ExternalLink,
  Settings,
  Info,
  ShieldCheck,
  Megaphone,
  Layers,
  Flame,
  Award,
  BookOpen
} from 'lucide-react';
import { formatGoogleDriveUrl } from '../../utils/imageHelpers';

interface SignageSectionProps {
  profile: SchoolProfile;
  slides?: SignageSlide[];
  config?: SignageConfig;
  standalone?: boolean;
}

export const SignageSection: React.FC<SignageSectionProps> = ({
  profile,
  slides: initialSlides,
  config: initialConfig,
  standalone = false
}) => {
  // Data States
  const [slides, setSlides] = useState<SignageSlide[]>(() => initialSlides || loadSignageSlides());
  const [config, setConfig] = useState<SignageConfig>(() => initialConfig || loadSignageConfig());

  // Player States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Time States
  const [currentTime, setCurrentTime] = useState(new Date());

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Active slides only
  const activeSlides = slides.filter((s) => s.isActive);
  const currentSlide = activeSlides[currentIndex] || activeSlides[0] || null;
  const slideDuration = (currentSlide?.durationSeconds || config.defaultDuration || 8) * 1000;

  // Real-time Sync from localStorage and custom events
  useEffect(() => {
    const handleStorageUpdate = () => {
      const freshSlides = loadSignageSlides();
      const freshConfig = loadSignageConfig();
      setSlides(freshSlides);
      setConfig(freshConfig);
    };

    const handleCustomSlideUpdate = (e: any) => {
      if (e.detail?.slides) {
        setSlides(e.detail.slides);
      } else {
        setSlides(loadSignageSlides());
      }
    };

    const handleCustomConfigUpdate = (e: any) => {
      if (e.detail?.config) {
        setConfig(e.detail.config);
      } else {
        setConfig(loadSignageConfig());
      }
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('skmp_signage_updated', handleCustomSlideUpdate);
    window.addEventListener('skmp_signage_config_updated', handleCustomConfigUpdate);

    // Periodic check every 3s to guarantee real-time reflection across tabs
    const pollInterval = window.setInterval(() => {
      const freshSlides = loadSignageSlides();
      if (JSON.stringify(freshSlides) !== JSON.stringify(slides)) {
        setSlides(freshSlides);
      }
      const freshConfig = loadSignageConfig();
      if (JSON.stringify(freshConfig) !== JSON.stringify(config)) {
        setConfig(freshConfig);
      }
    }, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('skmp_signage_updated', handleCustomSlideUpdate);
      window.removeEventListener('skmp_signage_config_updated', handleCustomConfigUpdate);
      window.clearInterval(pollInterval);
    };
  }, [slides, config]);

  // Live Clock Tick (Every 1s)
  useEffect(() => {
    const clockInterval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => window.clearInterval(clockInterval);
  }, []);

  // Slide Index Safety Guard
  useEffect(() => {
    if (activeSlides.length > 0 && currentIndex >= activeSlides.length) {
      setCurrentIndex(0);
    }
  }, [activeSlides.length, currentIndex]);

  // Next / Prev Navigation
  const handleNextSlide = useCallback(() => {
    if (activeSlides.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, [activeSlides.length]);

  const handlePrevSlide = useCallback(() => {
    if (activeSlides.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, [activeSlides.length]);

  // Slide Animation Loop & Progress Bar
  useEffect(() => {
    if (!isPlaying || activeSlides.length <= 1) {
      setProgress(0);
      return;
    }

    startTimeRef.current = Date.now();
    const updateFrequency = 50; // ms

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / slideDuration) * 100, 100);
      setProgress(pct);

      if (elapsed >= slideDuration) {
        handleNextSlide();
      }
    }, updateFrequency);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isPlaying, currentIndex, slideDuration, activeSlides.length, handleNextSlide]);

  // Fullscreen Management
  const toggleFullscreen = () => {
    const elem = containerRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request denied or not supported:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen error:', err);
      });
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // D-Pad / Remote Control & Keyboard Shortcut Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing in inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          handleNextSlide();
          resetControlsTimeout();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          handlePrevSlide();
          resetControlsTimeout();
          break;
        case ' ':
        case 'k':
        case 'p':
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          resetControlsTimeout();
          break;
        case 'f':
        case 'F':
        case 'Enter':
          e.preventDefault();
          toggleFullscreen();
          break;
        case '?':
        case 'h':
          e.preventDefault();
          setShowShortcutsModal((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextSlide, handlePrevSlide]);

  // Mouse move control bar auto-hide (for Clean Kiosk display)
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isFullscreen) {
        setShowControls(false);
      }
    }, 4000);
  };

  const handleMouseMove = () => {
    resetControlsTimeout();
  };

  // Date Formatting for Malaysia TV
  const formattedDay = new Intl.DateTimeFormat('ms-MY', { weekday: 'long' }).format(currentTime);
  const formattedDate = new Intl.DateTimeFormat('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }).format(currentTime);
  const formattedTime = currentTime.toLocaleTimeString('ms-MY', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Section Info & Action Header (when not standalone) */}
      {!standalone && (
        <div className="bg-gradient-to-r from-blue-900/90 via-slate-900/90 to-amber-950/80 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-yellow-400 text-blue-950 flex items-center justify-center shadow-lg shadow-yellow-400/20 flex-shrink-0">
              <Tv className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  Smart TV Digital Signage
                </span>
                <span className="text-xs text-yellow-300 font-bold">1080p / 4K UHD</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">
                Paparan Siaran Digital Smart TV SKMP
              </h2>
              <p className="text-xs text-slate-300">
                Sistem paparan slaid digital automatik untuk televisyen pintar lobi, dewan, dan ruang legar sekolah.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Go Fullscreen TV Button */}
            <button
              onClick={toggleFullscreen}
              className="px-5 py-3 rounded-2xl bg-yellow-400 text-blue-950 font-black text-xs flex items-center gap-2 hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20 hover:scale-105 active:scale-95 flex-1 md:flex-initial justify-center focus:ring-4 focus:ring-yellow-300 focus:outline-none"
              title="Masuk Mod Skrin Penuh (Tekan 'F' atau Enter pada Remote TV)"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Buka Skrin Penuh (Go Fullscreen)</span>
            </button>

            {/* Standalone tv.html direct open link */}
            <a
              href="/tv.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition hover:scale-105 active:scale-95 flex-1 md:flex-initial justify-center"
              title="Buka fail tv.html dalam tetingkap baharu khas untuk pelayar Smart TV"
            >
              <ExternalLink className="w-4 h-4 text-yellow-400" />
              <span>Buka 'tv.html' Khas TV</span>
            </a>

            {/* Keyboard / Remote Guide button */}
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-300 hover:text-white transition"
              title="Panduan Alat Kawalan Jauh (Remote TV / D-Pad)"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Smart TV Kiosk Stage Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className={`relative overflow-hidden bg-slate-950 text-white transition-all select-none ${
          isFullscreen
            ? 'w-screen h-screen fixed inset-0 z-[9999] rounded-0'
            : 'w-full aspect-[16/9] min-h-[460px] md:min-h-[620px] rounded-3xl border border-white/20 shadow-2xl'
        }`}
      >
        {/* TOP STATUS BAR (School Branding + Live Clock) */}
        <div
          className={`absolute top-0 inset-x-0 z-30 transition-opacity duration-300 bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-transparent p-4 sm:p-6 flex items-center justify-between pointer-events-none ${
            showControls || !isFullscreen ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* School Brand */}
          <div className="flex items-center gap-3.5 pointer-events-auto">
            {profile.logoUrl && (
              <img
                src={formatGoogleDriveUrl(profile.logoUrl)}
                alt="Logo SK Merbau Pulas"
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-md"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  {profile.code || 'KBA5012'} • SIARAN DIGITAL
                </span>
              </div>
              <h1 className="text-base sm:text-xl font-black text-white drop-shadow tracking-tight">
                {profile.name || 'Sekolah Kebangsaan Merbau Pulas'}
              </h1>
              <p className="text-[11px] font-medium text-slate-300 hidden sm:block">
                {profile.motto || 'Berilmu, Beramal, Berbakti'}
              </p>
            </div>
          </div>

          {/* Real-time Clock & Date Widget */}
          {config.showClock && (
            <div className="pointer-events-auto flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 shadow-xl">
              <Clock className="w-5 h-5 text-yellow-400 animate-pulse hidden sm:block" />
              <div className="text-right">
                <div className="text-lg sm:text-2xl font-black tracking-widest text-yellow-400 font-mono leading-none">
                  {formattedTime}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-slate-300 mt-0.5">
                  {formattedDay}, {formattedDate}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PROGRESS BAR AT TOP */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-white/10 z-40">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 transition-all duration-75 ease-linear shadow-[0_0_8px_rgba(250,204,21,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* SLIDE IMAGE & DISPLAY ENGINE */}
        <div className="w-full h-full relative flex items-center justify-center bg-slate-950 overflow-hidden">
          <AnimatePresence mode="wait">
            {currentSlide ? (
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full absolute inset-0 flex items-center justify-center"
              >
                {/* Background Ambient Blur Glow */}
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 scale-110"
                  style={{
                    backgroundImage: `url(${formatGoogleDriveUrl(currentSlide.imageUrl)})`
                  }}
                />

                {/* Primary Crisp 1080p/4K Slide */}
                <img
                  src={formatGoogleDriveUrl(currentSlide.imageUrl)}
                  alt={currentSlide.title}
                  className="w-full h-full object-contain object-center z-10 drop-shadow-2xl"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1920';
                  }}
                />

                {/* Glassmorphic Slide Caption Card (Bottom-Left) */}
                {(currentSlide.title || currentSlide.subtitle) && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="absolute bottom-20 left-6 sm:left-10 max-w-2xl z-20 bg-slate-950/85 backdrop-blur-xl border border-white/20 p-4 sm:p-6 rounded-3xl shadow-2xl text-left pointer-events-none"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-blue-950 shadow-sm">
                        {currentSlide.category || 'Pengumuman'}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {currentIndex + 1} / {activeSlides.length}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black text-white drop-shadow-md leading-tight">
                      {currentSlide.title}
                    </h2>
                    {currentSlide.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {currentSlide.subtitle}
                      </p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <div className="text-center p-8 text-slate-400 z-10">
                <Tv className="w-16 h-16 mx-auto mb-4 text-yellow-400 opacity-60" />
                <h3 className="text-xl font-bold text-white">Tiada Slaid Aktif</h3>
                <p className="text-xs mt-1">Sila tambah slaid atau aktifkan slaid di Halaman Admin.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM RUNNING MARQUEE TICKER */}
        {config.showMarquee && (
          <div className="absolute bottom-0 inset-x-0 z-30 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border-t border-yellow-400/40 text-yellow-300 font-bold text-xs sm:text-sm py-2.5 px-4 flex items-center gap-4 shadow-2xl">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-400 text-blue-950 font-black rounded-xl text-xs uppercase tracking-wider flex-shrink-0 shadow-md">
              <Megaphone className="w-4 h-4" />
              <span>Info Semasa</span>
            </div>
            <div className="overflow-hidden whitespace-nowrap flex-grow">
              <div className="inline-block animate-marquee font-bold text-white tracking-wide">
                {config.marqueeText ||
                  'SELAMAT DATANG KE SK MERBAU PULAS • BERILMU, BERAMAL, BERBAKTI • PENDAFTARAN TAHUN 1 SESI 2027 KINI DIBUKA • PASTIKAN KEHADIRAN MURID MELEBIHI 95%'}
              </div>
            </div>
          </div>
        )}

        {/* REMOTE & INTERACTIVE CONTROL OVERLAY (Hover / Focus) */}
        <div
          className={`absolute bottom-12 right-6 z-40 transition-all duration-300 flex items-center gap-2 bg-slate-950/85 backdrop-blur-xl border border-white/20 p-2 rounded-2xl shadow-2xl ${
            showControls || !isFullscreen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {/* Prev Slide */}
          <button
            onClick={handlePrevSlide}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-yellow-400 hover:text-blue-950 text-white font-bold transition focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            title="Slaid Sebelumnya (D-Pad Kiri)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => setIsPlaying((prev) => !prev)}
            className="p-2.5 rounded-xl bg-yellow-400 text-blue-950 font-black transition hover:bg-yellow-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none shadow-md shadow-yellow-400/20"
            title={isPlaying ? 'Jeda Siaran (Space/P)' : 'Mainkan Siaran (Space/P)'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Next Slide */}
          <button
            onClick={handleNextSlide}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-yellow-400 hover:text-blue-950 text-white font-bold transition focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            title="Slaid Seterusnya (D-Pad Kanan)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Slide Indicator Dropdown / Count */}
          <div className="px-2.5 text-xs font-mono font-bold text-yellow-300">
            {currentIndex + 1} / {activeSlides.length}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-yellow-400 hover:text-blue-950 text-white font-bold transition focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            title="Mod Skrin Penuh (F / Enter)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* THUMBNAIL QUICK NAVIGATOR BAR */}
        <div
          className={`absolute bottom-12 left-6 z-30 hidden md:flex items-center gap-1.5 transition-all duration-300 ${
            showControls || !isFullscreen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {activeSlides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => {
                setCurrentIndex(idx);
                setProgress(0);
              }}
              className={`group relative h-2.5 rounded-full transition-all duration-300 focus:outline-none ${
                currentIndex === idx
                  ? 'w-8 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]'
                  : 'w-2.5 bg-white/30 hover:bg-white/60'
              }`}
              title={`Pergi ke slaid ${idx + 1}: ${slide.title}`}
            >
              {/* Tooltip on hover */}
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none border border-white/10 shadow-lg">
                {slide.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* REMOTE SHORTCUTS MODAL */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full text-white space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-base text-yellow-400 flex items-center gap-2">
                <Tv className="w-5 h-5" /> Panduan Alat Kawalan Jauh (Remote TV / D-Pad)
              </h3>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Sistem Smart TV ini direka khas untuk memudahkan navigasi menggunakan alat kawalan jauh televisyen (TV Remote / D-Pad), papan kekunci wayarles, atau tetikus:
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-300">Skrin Penuh (Fullscreen)</span>
                <kbd className="px-2 py-0.5 bg-yellow-400/20 text-yellow-300 font-mono font-bold rounded border border-yellow-400/30">
                  F / Enter
                </kbd>
              </div>
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-300">Main / Jeda (Play/Pause)</span>
                <kbd className="px-2 py-0.5 bg-yellow-400/20 text-yellow-300 font-mono font-bold rounded border border-yellow-400/30">
                  Space / P
                </kbd>
              </div>
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-300">Slaid Seterusnya</span>
                <kbd className="px-2 py-0.5 bg-yellow-400/20 text-yellow-300 font-mono font-bold rounded border border-yellow-400/30">
                  &rarr; / D-Pad Right
                </kbd>
              </div>
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-300">Slaid Sebelumnya</span>
                <kbd className="px-2 py-0.5 bg-yellow-400/20 text-yellow-300 font-mono font-bold rounded border border-yellow-400/30">
                  &larr; / D-Pad Left
                </kbd>
              </div>
            </div>

            <div className="p-3 bg-blue-950/60 border border-blue-400/30 rounded-2xl flex items-start gap-2.5 text-[11px] text-blue-200">
              <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Tip Kiosk TV:</strong> Buka pautan <code className="text-yellow-300 font-mono">/tv.html</code> pada pelayar web Android TV, Google TV, atau Tizen OS untuk pengalaman televisyen sepenuhnya tanpa bar navigasi.
              </span>
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-2 bg-yellow-400 text-blue-950 font-black rounded-xl hover:bg-yellow-300 transition"
              >
                Faham & Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
