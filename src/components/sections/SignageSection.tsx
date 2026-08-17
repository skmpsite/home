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
  BookOpen,
  Film,
  Image as ImageIcon,
  Youtube
} from 'lucide-react';
import { formatGoogleDriveUrl } from '../../utils/imageHelpers';
import {
  extractYouTubeId,
  isYouTubeUrl,
  isVideoUrl,
  detectMediaType,
  getYouTubeThumbnail,
  buildYouTubeEmbedUrl,
  formatMediaDuration
} from '../../utils/signageMediaHelpers';

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
  const [isVideoInfoVisible, setIsVideoInfoVisible] = useState(true);
  
  // Initialize Audio as Auto ON by default (isMuted = false) unless explicitly disabled
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (initialConfig?.autoEnableAudio === false) return true;
    const firstActive = (initialSlides || loadSignageSlides()).find((s) => s.isActive);
    if (firstActive?.isMuted !== undefined) return firstActive.isMuted;
    return false; // Auto ON by default
  });
  const [videoDuration, setVideoDuration] = useState<number | null>(null);

  // Time States
  const [currentTime, setCurrentTime] = useState(new Date());

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const videoInfoTimeoutRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Active slides only
  const activeSlides = slides.filter((s) => s.isActive);
  const currentSlide = activeSlides[currentIndex] || activeSlides[0] || null;

  // Media Detection for Current Slide
  const currentMediaType = currentSlide
    ? detectMediaType(
        currentSlide.videoUrl || currentSlide.youtubeUrl || currentSlide.imageUrl,
        currentSlide.mediaType
      )
    : 'image';

  const youtubeId = currentSlide
    ? currentSlide.youtubeId || extractYouTubeId(currentSlide.youtubeUrl || currentSlide.imageUrl)
    : null;

  const isVideoMedia = currentMediaType === 'video' || currentMediaType === 'youtube';

  // Calculate slide duration in milliseconds - automatically prioritize actual video length
  const currentDurationSeconds =
    isVideoMedia && currentSlide?.useVideoDuration !== false && videoDuration
      ? videoDuration
      : currentSlide?.durationSeconds || config.defaultDuration || (currentMediaType === 'youtube' ? 30 : 8);

  const slideDurationMs = currentDurationSeconds * 1000;

  // Auto-synchronize slide-level audio state when changing slide
  useEffect(() => {
    if (!currentSlide) return;
    if (currentSlide.isMuted !== undefined) {
      setIsMuted(currentSlide.isMuted);
    } else if (config.autoEnableAudio !== false) {
      setIsMuted(false);
    }
  }, [currentIndex, currentSlide, config.autoEnableAudio]);

  // Auto-hide title & info banner after 5 seconds for video / YouTube slides to focus on video content
  useEffect(() => {
    if (videoInfoTimeoutRef.current) {
      window.clearTimeout(videoInfoTimeoutRef.current);
      videoInfoTimeoutRef.current = null;
    }

    const isVideoMedia = currentMediaType === 'video' || currentMediaType === 'youtube';
    if (isVideoMedia) {
      setIsVideoInfoVisible(true);
      // Appear for 5 seconds then slide down and fade out
      videoInfoTimeoutRef.current = window.setTimeout(() => {
        setIsVideoInfoVisible(false);
      }, 5000);
    } else {
      // Always keep title and info permanently visible for image/poster slides
      setIsVideoInfoVisible(true);
    }

    return () => {
      if (videoInfoTimeoutRef.current) {
        window.clearTimeout(videoInfoTimeoutRef.current);
      }
    };
  }, [currentIndex, currentMediaType, currentSlide?.id]);

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
    setVideoDuration(null);
    startTimeRef.current = Date.now();
  }, [activeSlides.length]);

  const handlePrevSlide = useCallback(() => {
    if (activeSlides.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
    setProgress(0);
    setVideoDuration(null);
    startTimeRef.current = Date.now();
  }, [activeSlides.length]);

  // Video Element Play/Pause Controller with robust Audio Unlocking
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = 1.0;
      if (isPlaying) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Autoplay with audio blocked by browser policy, attempting muted play as temporary fallback:', err);
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play().catch(() => {});
            }
          });
        }
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentIndex, currentMediaType, isMuted]);

  // Audio Context & Gesture Unlocker for Smart TV & Web Browsers
  useEffect(() => {
    const handleGestureAudioUnlock = () => {
      if (videoRef.current && !isMuted) {
        videoRef.current.muted = false;
        videoRef.current.play().catch(() => {});
      }
    };

    window.addEventListener('click', handleGestureAudioUnlock, { passive: true });
    window.addEventListener('keydown', handleGestureAudioUnlock, { passive: true });
    window.addEventListener('touchstart', handleGestureAudioUnlock, { passive: true });

    return () => {
      window.removeEventListener('click', handleGestureAudioUnlock);
      window.removeEventListener('keydown', handleGestureAudioUnlock);
      window.removeEventListener('touchstart', handleGestureAudioUnlock);
    };
  }, [isMuted]);

  // YouTube Iframe PostMessage, Duration Detection & Auto-Advance on Finish
  useEffect(() => {
    if (currentMediaType !== 'youtube' || !youtubeId) return;

    const handleYouTubeMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {
            return;
          }
        }
        if (!data || typeof data !== 'object') return;

        // 1. Handshake response / Delivery Info (duration, currentTime, playerState)
        if (data.event === 'infoDelivery' && data.info) {
          const info = data.info;
          // Capture real duration from YouTube player
          if (typeof info.duration === 'number' && info.duration > 0 && currentSlide?.useVideoDuration !== false) {
            setVideoDuration(Math.round(info.duration));
          }
          // Progress bar sync with real-time video playback
          if (
            typeof info.currentTime === 'number' &&
            typeof info.duration === 'number' &&
            info.duration > 0 &&
            currentSlide?.useVideoDuration !== false
          ) {
            const pct = Math.min((info.currentTime / info.duration) * 100, 100);
            setProgress(pct);
          }
          // Player state 0 = YT.PlayerState.ENDED -> Auto advance slide immediately!
          if (info.playerState === 0 && isPlaying && currentSlide?.useVideoDuration !== false) {
            handleNextSlide();
          }
        }

        // 2. Direct onStateChange event from YouTube
        if (data.event === 'onStateChange' && data.info === 0 && isPlaying && currentSlide?.useVideoDuration !== false) {
          handleNextSlide();
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('message', handleYouTubeMessage);
    return () => window.removeEventListener('message', handleYouTubeMessage);
  }, [currentMediaType, youtubeId, isPlaying, handleNextSlide, currentSlide?.useVideoDuration]);

  // Sync Play / Pause to YouTube IFrame Player
  useEffect(() => {
    if (currentMediaType === 'youtube' && iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: isPlaying ? 'playVideo' : 'pauseVideo',
            args: []
          }),
          '*'
        );
      } catch {
        // ignore
      }
    }
  }, [isPlaying, currentMediaType]);

  // Sync Mute State to YouTube IFrame Player
  useEffect(() => {
    if (currentMediaType === 'youtube' && iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: isMuted ? 'mute' : 'unMute',
            args: []
          }),
          '*'
        );
      } catch {
        // ignore
      }
    }
  }, [isMuted, currentMediaType]);

  // Progress Bar & Auto-Advance Timer (Fail-safe for Images, Video, and YouTube)
  useEffect(() => {
    if (!isPlaying || activeSlides.length <= 1) {
      setProgress(0);
      return;
    }

    startTimeRef.current = Date.now();
    const updateFrequency = 100; // ms

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const targetDurationMs = slideDurationMs > 0 ? slideDurationMs : (config.defaultDuration || 8) * 1000;
      
      // Update timer-driven progress if not actively driven by HTML5 video timeUpdate
      if (currentMediaType !== 'video' || currentSlide?.useVideoDuration === false || !videoDuration) {
        const pct = Math.min((elapsed / targetDurationMs) * 100, 100);
        setProgress(pct);
      }

      // Safety advance when duration elapsed
      if (elapsed >= targetDurationMs) {
        handleNextSlide();
      }
    }, updateFrequency);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [
    isPlaying,
    currentIndex,
    slideDurationMs,
    activeSlides.length,
    handleNextSlide,
    currentMediaType,
    currentSlide?.useVideoDuration,
    videoDuration,
    config.defaultDuration
  ]);

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

  // TV Remote (D-Pad) & Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case 'n':
        case 'N':
          e.preventDefault();
          handleNextSlide();
          break;

        case 'ArrowLeft':
        case 'PageUp':
        case 'p':
        case 'P':
          e.preventDefault();
          handlePrevSlide();
          break;

        case ' ':
        case 'k':
        case 'K':
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;

        case 'f':
        case 'F':
        case 'Enter':
          e.preventDefault();
          toggleFullscreen();
          break;

        case 'm':
        case 'M':
          e.preventDefault();
          setIsMuted((prev) => !prev);
          break;

        case '?':
        case 'h':
        case 'H':
          e.preventDefault();
          setShowShortcutsModal((prev) => !prev);
          break;

        case 'Escape':
          setShowShortcutsModal(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextSlide, handlePrevSlide]);

  // Auto-hide controls and video info after 4s idle in fullscreen/kiosk
  const handleUserActivity = () => {
    setShowControls(true);
    const isVideoMedia = currentMediaType === 'video' || currentMediaType === 'youtube';
    if (isVideoMedia) {
      setIsVideoInfoVisible(true);
      if (videoInfoTimeoutRef.current) {
        window.clearTimeout(videoInfoTimeoutRef.current);
      }
      videoInfoTimeoutRef.current = window.setTimeout(() => {
        setIsVideoInfoVisible(false);
      }, 4000);
    }

    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isFullscreen || standalone) {
        setShowControls(false);
      }
    }, 4000);
  };

  // Date & Time Formatting
  const formattedTime = currentTime.toLocaleTimeString('ms-MY', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedDate = currentTime.toLocaleDateString('ms-MY', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onClick={handleUserActivity}
      className={`relative w-full overflow-hidden bg-slate-950 font-sans select-none flex flex-col justify-between ${
        standalone || isFullscreen
          ? 'fixed inset-0 z-[9999] h-screen w-screen'
          : 'rounded-3xl border border-white/20 shadow-2xl min-h-[640px] md:min-h-[720px] aspect-[16/9]'
      }`}
    >
      {/* TOP HEADER BAR (Logo, School Name, Clock, Weather, Audio Status) - PERMANENTLY DISPLAYED */}
      <div className="relative z-30 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent backdrop-blur-md">
        {/* Left: School Identity & Status */}
        <div className="flex items-center gap-3.5">
          <img
            src={profile.logoUrl}
            alt={profile.schoolName}
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-[0_0_12px_rgba(250,204,21,0.5)] flex-shrink-0"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src =
                'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgYVyl_qKknZ3_eiUbvgojY6Y3OiP28frcG3qy92a9yH5jt776tl5293zJX7Adg6-hvQYW5gLILFL-BXnte2ZkXw3Hdtl3MYQqWTV4_L6UbCsBIVVWieiyipL4Dbp33EIrrcXgxX-qLLFKZ/s1600/logo+skmp+warna+stroke.png';
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-blue-950 shadow-sm flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse text-red-600" />
                <span>SIARAN DIGITAL SMART TV</span>
              </span>
              <span className="text-[11px] font-bold text-yellow-300/90 hidden sm:inline-block">
                {profile.schoolCode}
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-white tracking-tight drop-shadow-md leading-tight mt-0.5">
              {profile.schoolName}
            </h1>
          </div>
        </div>

        {/* Right: Live Digital Clock & Controls */}
        <div className="flex items-center gap-3">
          {/* Audio Indicator / Toggle */}
          <button
            onClick={() => setIsMuted((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition shadow-lg ${
              isMuted
                ? 'bg-slate-900/80 border-white/20 text-slate-300 hover:text-white'
                : 'bg-yellow-400 text-blue-950 border-yellow-300 font-black shadow-yellow-400/20'
            } ${showControls || !isFullscreen ? 'opacity-100' : 'opacity-0 pointer-events-none sm:opacity-100 sm:pointer-events-auto'}`}
            title="Ketik 'M' untuk Audio On/Off"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isMuted ? 'Bisu' : 'Audio On'}</span>
          </button>

          {/* Clock, Day and Date Widget - PERMANENTLY VISIBLE */}
          {config.showClock && (
            <div className="bg-slate-950/85 backdrop-blur-xl border border-white/20 px-3.5 sm:px-4 py-2 rounded-2xl shadow-2xl text-right flex flex-col justify-center">
              <div className="text-sm sm:text-base md:text-lg font-black text-yellow-400 font-mono tracking-wider leading-none">
                {formattedTime}
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-slate-200 uppercase tracking-tight mt-1">
                {formattedDate}
              </div>
            </div>
          )}

          {/* Action Buttons (Remote Guide & Fullscreen) */}
          <div
            className={`flex items-center gap-2 transition-opacity duration-300 ${
              showControls || !isFullscreen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Remote Guide Button */}
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-yellow-400 hover:text-blue-950 text-white font-bold transition focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              title="Panduan Alat Kawalan Jauh TV (D-Pad / Keyboard)"
            >
              <Tv className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black transition shadow-lg shadow-yellow-400/20 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              title={isFullscreen ? 'Keluar Skrin Penuh (F / Enter)' : 'Skrin Penuh (F / Enter)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* CENTER MEDIA DISPLAY ENGINE (IMAGES / VIDEOS / YOUTUBE) */}
      <div className="relative flex-grow flex items-center justify-center overflow-hidden w-full h-full bg-slate-950">
        {/* TOP SLIDE PROGRESS BAR */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-white/10 z-40">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 transition-all duration-75 ease-linear shadow-[0_0_8px_rgba(250,204,21,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          {currentSlide ? (
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full absolute inset-0 flex items-center justify-center overflow-hidden"
            >
              {/* Background Ambient Blur Glow */}
              <div
                className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 scale-110"
                style={{
                  backgroundImage: `url(${
                    youtubeId
                      ? getYouTubeThumbnail(youtubeId)
                      : formatGoogleDriveUrl(currentSlide.imageUrl)
                  })`
                }}
              />

              {/* 1. YOUTUBE VIDEO PLAYER */}
              {currentMediaType === 'youtube' && youtubeId ? (
                <div className="w-full h-full relative flex items-center justify-center z-10">
                  <iframe
                    ref={iframeRef}
                    src={buildYouTubeEmbedUrl(youtubeId, {
                      autoplay: isPlaying,
                      muted: isMuted,
                      controls: false
                    })}
                    title={currentSlide.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full object-cover border-0 pointer-events-auto shadow-2xl"
                    onLoad={() => {
                      try {
                        iframeRef.current?.contentWindow?.postMessage(
                          JSON.stringify({ event: 'listening' }),
                          '*'
                        );
                        iframeRef.current?.contentWindow?.postMessage(
                          JSON.stringify({
                            event: 'command',
                            func: 'addEventListener',
                            args: ['onStateChange']
                          }),
                          '*'
                        );
                      } catch {
                        // ignore
                      }
                    }}
                  />
                </div>
              ) : currentMediaType === 'video' ? (
                /* 2. DIRECT HTML5 VIDEO PLAYER (MP4/WebM) */
                <div className="w-full h-full relative flex items-center justify-center z-10">
                  <video
                    ref={videoRef}
                    key={currentSlide.id + (currentSlide.videoUrl || '')}
                    src={currentSlide.videoUrl || currentSlide.imageUrl}
                    poster={formatGoogleDriveUrl(currentSlide.imageUrl)}
                    autoPlay={isPlaying}
                    playsInline
                    muted={isMuted}
                    className="w-full h-full object-contain object-center drop-shadow-2xl"
                    onLoadedMetadata={(e) => {
                      const dur = Math.round(e.currentTarget.duration);
                      if (dur > 0 && currentSlide.useVideoDuration !== false) {
                        setVideoDuration(dur);
                      }
                    }}
                    onTimeUpdate={(e) => {
                      const el = e.currentTarget;
                      if (el.duration > 0 && currentSlide.useVideoDuration !== false) {
                        setProgress((el.currentTime / el.duration) * 100);
                      }
                    }}
                    onEnded={() => {
                      if (isPlaying) {
                        handleNextSlide();
                      }
                    }}
                    onError={(e) => {
                      console.warn('Video failed to play or load, auto-advancing to next slide:', e);
                      setTimeout(() => {
                        if (isPlaying) handleNextSlide();
                      }, 2000);
                    }}
                  />
                </div>
              ) : (
                /* 3. CRISP IMAGE / POSTER SLIDE */
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
              )}

              {/* Glassmorphic Slide Caption Card (Bottom-Left) */}
              {(currentSlide.title || currentSlide.subtitle) && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{
                    opacity: currentMediaType === 'image' || isVideoInfoVisible ? 1 : 0,
                    y: currentMediaType === 'image' || isVideoInfoVisible ? 0 : 35
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className={`absolute bottom-20 left-6 sm:left-10 max-w-2xl z-20 bg-slate-950/85 backdrop-blur-xl border border-white/20 p-4 sm:p-6 rounded-3xl shadow-2xl text-left ${
                    currentMediaType === 'image' || isVideoInfoVisible
                      ? 'pointer-events-auto'
                      : 'pointer-events-none'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {/* Media Type Tag */}
                    {currentMediaType === 'youtube' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-sm flex items-center gap-1">
                        <Youtube className="w-3 h-3" /> YouTube Video
                      </span>
                    ) : currentMediaType === 'video' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-sm flex items-center gap-1">
                        <Film className="w-3 h-3" /> Video Klip
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-blue-950 shadow-sm flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> {currentSlide.category || 'Pengumuman'}
                      </span>
                    )}

                    <span className="text-[11px] font-bold text-slate-400 font-mono">
                      {currentIndex + 1} / {activeSlides.length}
                    </span>

                    {/* Media Duration Badge */}
                    <span className="text-[10px] font-mono font-bold text-yellow-300 bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
                      <Clock className="w-2.5 h-2.5 inline mr-1" />
                      {formatMediaDuration(currentDurationSeconds)}
                    </span>

                    {/* Audio Status Indicator for Video/YouTube */}
                    {(currentMediaType === 'video' || currentMediaType === 'youtube') && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                          !isMuted
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                            : 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30'
                        }`}
                      >
                        {!isMuted ? (
                          <>
                            <Volume2 className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Audio On (Auto)</span>
                          </>
                        ) : (
                          <>
                            <VolumeX className="w-2.5 h-2.5 text-yellow-400" />
                            <span>Bisu</span>
                          </>
                        )}
                      </span>
                    )}
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
              <h3 className="text-xl font-bold text-white">Tiada Slaid / Video Aktif</h3>
              <p className="text-xs mt-1">Sila tambah slaid atau video di Halaman Admin.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM RUNNING MARQUEE TICKER (INFO SEMASA) */}
      {config.showMarquee && (
        <div className="relative z-30 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border-t border-yellow-400/40 text-yellow-300 font-bold text-xs sm:text-sm py-2.5 px-4 flex items-center gap-4 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400 text-blue-950 font-black rounded-xl text-xs uppercase tracking-wider flex-shrink-0 shadow-md z-10 select-none">
            <Megaphone className="w-4 h-4 text-blue-950" />
            <span>Info Semasa</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap flex-grow relative flex items-center">
            <div className="inline-block animate-marquee font-bold text-white tracking-wide text-xs sm:text-sm">
              {config.marqueeText ||
                'SELAMAT DATANG KE SK MERBAU PULAS • BERILMU, BERAMAL, BERBAKTI • PENDAFTARAN TAHUN 1 SESI 2027 KINI DIBUKA DI PORTAL idMe KPM • PASTIKAN KEHADIRAN MURID MELEBIHI 95% SETIAP BULAN • TINGKATKAN AMALAN KEBERSIHAN DAN SAHSIAH TERPUJI'}
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
        {/* Audio Mute/Unmute */}
        <button
          onClick={() => setIsMuted((prev) => !prev)}
          className={`p-2.5 rounded-xl font-bold transition focus:ring-2 focus:ring-yellow-400 focus:outline-none ${
            isMuted ? 'bg-white/10 text-slate-300 hover:text-white' : 'bg-yellow-400 text-blue-950 font-black'
          }`}
          title={isMuted ? 'Buka Suara (M)' : 'Bisu (M)'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

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

        {/* Slide Indicator Count */}
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
        className={`absolute bottom-12 left-6 z-30 hidden md:flex items-center gap-2 transition-all duration-300 ${
          showControls || !isFullscreen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {activeSlides.map((slide, idx) => {
          const type = detectMediaType(slide.videoUrl || slide.youtubeUrl || slide.imageUrl, slide.mediaType);
          return (
            <button
              key={slide.id}
              onClick={() => {
                setCurrentIndex(idx);
                setProgress(0);
                setVideoDuration(null);
              }}
              className={`group relative h-3 rounded-full transition-all duration-300 focus:outline-none flex items-center justify-center ${
                currentIndex === idx
                  ? type === 'youtube'
                    ? 'w-10 bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]'
                    : type === 'video'
                    ? 'w-10 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]'
                    : 'w-10 bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.8)]'
                  : 'w-3 bg-white/30 hover:bg-white/60'
              }`}
              title={`Pergi ke slaid ${idx + 1}: ${slide.title}`}
            >
              {/* Tooltip on hover */}
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none border border-white/10 shadow-xl flex items-center gap-1">
                {type === 'youtube' ? '▶️' : type === 'video' ? '🎬' : '📷'} {slide.title}
              </span>
            </button>
          );
        })}
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
              Sistem Smart TV ini menyokong pelbagai format video (MP4, YouTube, Poster) dan direka khas untuk kawalan mudah melalui alat kawalan televisyen (TV Remote / D-Pad):
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-300">Skrin Penuh (Fullscreen)</span>
                <kbd className="px-2 py-0.5 bg-yellow-400/20 text-yellow-300 font-mono font-bold rounded border border-yellow-400/30">
                  F / Enter
                </kbd>
              </div>
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-300">Main / Jeda Video</span>
                <kbd className="px-2 py-0.5 bg-yellow-400/20 text-yellow-300 font-mono font-bold rounded border border-yellow-400/30">
                  Space / P / K
                </kbd>
              </div>
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-300">Bisu / Suara Audio</span>
                <kbd className="px-2 py-0.5 bg-yellow-400/20 text-yellow-300 font-mono font-bold rounded border border-yellow-400/30">
                  M
                </kbd>
              </div>
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                <span className="font-bold text-slate-300">Slaid Seterusnya</span>
                <kbd className="px-2 py-0.5 bg-yellow-400/20 text-yellow-300 font-mono font-bold rounded border border-yellow-400/30">
                  &rarr; / D-Pad Kanan
                </kbd>
              </div>
              <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between col-span-2">
                <span className="font-bold text-slate-300">Slaid Sebelumnya</span>
                <kbd className="px-2 py-0.5 bg-yellow-400/20 text-yellow-300 font-mono font-bold rounded border border-yellow-400/30">
                  &larr; / D-Pad Kiri
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
