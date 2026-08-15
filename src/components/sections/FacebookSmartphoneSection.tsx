import React, { useState, useEffect } from 'react';
import { SchoolProfile } from '../../types';
import {
  ExternalLink,
  Globe,
  Wifi,
  Battery,
  Signal,
  Smartphone,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  Share2
} from 'lucide-react';

interface FacebookSmartphoneSectionProps {
  profile: SchoolProfile;
}

export const FacebookSmartphoneSection: React.FC<FacebookSmartphoneSectionProps> = ({ profile }) => {
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [zoomScale, setZoomScale] = useState<number>(0.86);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState<string>('');

  // Update clock every minute for realistic smartphone status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleReloadFeeds = () => {
    setIframeKey((prev) => prev + 1);
    showToast('🔄 Memuat semula Plugin Facebook...');
  };

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(1.1, +(prev + 0.05).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(0.7, +(prev - 0.05).toFixed(2)));
  };

  const handleResetZoom = () => {
    setZoomScale(0.86);
  };

  const handleShare = (url: string) => {
    if (navigator.share) {
      navigator.share({ title: 'Facebook Rasmi', url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast('🔗 Pautan Facebook disalin ke papan keratan!');
    }
  };

  // Render individual Phone mockup component containing the official Facebook Page Plugin (iFrame)
  const renderPhoneMockup = (target: 'skmp' | 'ppdkbb') => {
    const isSkmp = target === 'skmp';
    const pageTitle = isSkmp ? 'SK Merbau Pulas Rasmi' : 'PPD Kulim Bandar Baharu';
    const fbUrl = isSkmp
      ? 'https://www.facebook.com/SKMPKBA5012/'
      : 'https://www.facebook.com/p/PPD-Kulim-Bandar-Baharu-61553992422357/';

    // Official Facebook Page Plugin URL (iFrame)
    const iframeSrc = isSkmp
      ? 'https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FSKMPKBA5012%2F&tabs=timeline&width=450&height=850&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId'
      : 'https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fp%2FPPD-Kulim-Bandar-Baharu-61553992422357%2F&tabs=timeline&width=450&height=850&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId';

    return (
      <div className="relative mx-auto w-full max-w-[420px]">
        {/* Phone Outer Chassis with realistic volume buttons & power button */}
        <div className="relative rounded-[36px] sm:rounded-[48px] p-2 sm:p-2.5 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_30px_rgba(59,130,246,0.25)] border border-slate-600/70 ring-1 ring-white/20">
          
          {/* Side Hardware Buttons Simulation */}
          <div className="hidden sm:block absolute -left-[7px] top-24 w-[4px] h-10 bg-slate-700 rounded-l-md" />
          <div className="hidden sm:block absolute -left-[7px] top-38 w-[4px] h-12 bg-slate-700 rounded-l-md" />
          <div className="hidden sm:block absolute -right-[7px] top-28 w-[4px] h-14 bg-slate-700 rounded-r-md" />

          {/* Inner Phone Screen */}
          <div className="relative rounded-[28px] sm:rounded-[40px] bg-slate-950 overflow-hidden border border-slate-800 flex flex-col h-[650px] sm:h-[720px]">
            
            {/* Top Smartphone Status Bar */}
            <div className="bg-slate-950 text-white px-4 sm:px-5 pt-2.5 sm:pt-3 pb-1.5 flex items-center justify-between text-xs font-semibold select-none flex-shrink-0 z-30">
              {/* Clock */}
              <span className="text-[11px] font-bold tracking-tight text-slate-200">{currentTime}</span>

              {/* Dynamic Island / Notch */}
              <div className="w-20 sm:w-26 h-4 sm:h-5 bg-black rounded-full flex items-center justify-between px-2 shadow-inner border border-white/10">
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-500/80 animate-pulse"></div>
                <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                </div>
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-1.5 text-slate-300 text-[10px]">
                <Signal className="w-3 h-3 text-slate-200" />
                <Wifi className="w-3 h-3 text-slate-200" />
                <div className="flex items-center gap-0.5">
                  <span className="text-[9px] font-bold">98%</span>
                  <Battery className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                </div>
              </div>
            </div>

            {/* Facebook Mobile App Navigation Bar */}
            <div className="bg-[#1877F2] text-white px-3 sm:px-3.5 py-2 flex items-center justify-between shadow-md flex-shrink-0 z-20">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-[#1877F2] font-black text-sm sm:text-lg flex items-center justify-center shadow">
                  f
                </div>
                <span className="font-black text-sm sm:text-base tracking-tighter">facebook</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleShare(fbUrl)}
                  className="w-7 h-7 rounded-full bg-blue-800/80 hover:bg-blue-800 flex items-center justify-center text-white transition"
                  title="Kongsi Pautan"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <a
                  href={fbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-blue-800/90 hover:bg-blue-800 text-white rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition border border-white/20 shadow-sm"
                  title="Buka FB Rasmi"
                >
                  <span>Buka FB</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Scaled Facebook Official Plugin (iFrame) Container */}
            <div className="flex-grow w-full h-full bg-white overflow-y-auto overflow-x-hidden relative scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-100">
              <div
                style={{
                  width: `${100 / zoomScale}%`,
                  minWidth: `${100 / zoomScale}%`,
                  height: `${100 / zoomScale}%`,
                  minHeight: '750px',
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top left',
                  transition: 'transform 0.15s ease-out'
                }}
              >
                <iframe
                  key={`${target}-${iframeKey}`}
                  src={iframeSrc}
                  width="100%"
                  height="100%"
                  style={{
                    border: 'none',
                    overflow: 'hidden',
                    width: '100%',
                    height: '100%',
                    minHeight: '850px'
                  }}
                  scrolling="yes"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  title={`Facebook Plugin Web ${pageTitle}`}
                  className="w-full h-full block"
                />
              </div>
            </div>

            {/* Bottom Smartphone Home Indicator Swipe Bar */}
            <div className="bg-slate-950 py-1.5 sm:py-2 flex items-center justify-center flex-shrink-0 z-30">
              <div className="w-28 sm:w-32 h-1 bg-white/40 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3 sm:p-6 lg:p-8 border border-white/20 shadow-2xl space-y-6">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-blue-300 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-yellow-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Section Header with Zoom and Refresh Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/30 text-blue-300 font-bold rounded-full text-xs border border-blue-400/30">
            <Smartphone className="w-3.5 h-3.5 text-blue-300" />
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            <span>Plugin Web Asal Facebook (iFrame) • Dwi-Telefon Pintar</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1877F2] text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-600/30 flex-shrink-0">
              f
            </div>
            <span className="truncate">Feed Live Facebook SK Merbau Pulas & PPD KBB</span>
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            Paparan siaran langsung rasmi menggunakan <strong>Plugin Web Asal Facebook (iFrame)</strong> di dalam kerangka <strong>Telefon Pintar (Mobile)</strong> dengan paparan kiriman, foto asli, dan video semasa.
          </p>
        </div>

        {/* Zoom & Quick Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom Adjuster Control */}
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl px-2 py-1 flex items-center gap-1.5 shadow-inner">
            <span className="text-[10px] text-slate-300 font-bold pl-1 hidden sm:inline">Skala:</span>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition"
              title="Kecilkan Saiz Paparan"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-black text-yellow-300 w-10 text-center select-none">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition"
              title="Besarkan Saiz Paparan"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs transition ml-0.5"
              title="Tetapkan Semula (86%)"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Refresh Feeds Button */}
          <button
            type="button"
            onClick={handleReloadFeeds}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-xl text-xs flex items-center gap-1.5 border border-white/10 transition shadow"
            title="Muat Semula Plugin Facebook"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Muat Semula</span>
          </button>

          {/* External Links */}
          <a
            href="https://www.facebook.com/SKMPKBA5012/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
          >
            <span>FB SKMP</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://www.facebook.com/p/PPD-Kulim-Bandar-Baharu-61553992422357/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-[#1877F2] hover:bg-blue-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
          >
            <span>FB PPD KBB</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Smartphone Showcase Area: Permanent Dual Smartphone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-center pt-2">
        <div className="space-y-3">
          <div className="text-center font-extrabold text-xs text-yellow-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            <span>Telefon 1: SK Merbau Pulas Rasmi</span>
          </div>
          {renderPhoneMockup('skmp')}
        </div>

        <div className="space-y-3">
          <div className="text-center font-extrabold text-xs text-blue-300 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>Telefon 2: PPD Kulim Bandar Baharu</span>
          </div>
          {renderPhoneMockup('ppdkbb')}
        </div>
      </div>

      {/* Bottom Information Callout */}
      <div className="bg-blue-950/60 border border-blue-400/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-200">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <Globe className="w-4 h-4 text-yellow-400 flex-shrink-0 hidden sm:inline" />
          <span>
            Paparan rasmi menggunakan Plugin Web Asal Facebook (iFrame rasmi Meta) dengan kiriman, video, dan foto sebenar.
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="https://www.facebook.com/SKMPKBA5012/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
          >
            <span>Buka FB SKMP</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://www.facebook.com/p/PPD-Kulim-Bandar-Baharu-61553992422357/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-[#1877F2] hover:bg-blue-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
          >
            <span>Buka FB PPD KBB</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
