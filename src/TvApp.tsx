import React, { useState, useEffect, useRef } from 'react';
import { SchoolProfile, SignageSlide, SignageConfig } from './types';
import {
  loadProfile,
  loadSignageSlides,
  loadSignageConfig,
  saveProfile,
  saveSignageSlides,
  saveSignageConfig
} from './utils/storage';
import { fetchSchoolDataFromGoogleSheets, parseSchoolDataFromSheets, getGasWebAppUrl, saveGasWebAppUrl } from './utils/googleSheetsSync';
import { fetchLiveSignageFromServer } from './utils/liveSignageSync';
import { SignageSection } from './components/sections/SignageSection';
import { RefreshCw, Database, Cloud, X, Check, ExternalLink } from 'lucide-react';

export default function TvApp() {
  const [profile, setProfile] = useState<SchoolProfile>(loadProfile);
  const [slides, setSlides] = useState<SignageSlide[]>(loadSignageSlides);
  const [config, setConfig] = useState<SignageConfig>(loadSignageConfig);
  const isSyncingRef = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [gasInput, setGasInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Fungsi muat turun data Signage terkini secara langsung dari Pelayan Langsung & Google Sheets
  const refreshFromCloud = async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsRefreshing(true);
    try {
      // 1. Dapatkan kemas kini serta-merta dari Pelayan Siaran Langsung (/api/signage)
      const liveData = await fetchLiveSignageFromServer();
      if (liveData && Array.isArray(liveData.slides) && liveData.slides.length > 0) {
        setSlides(liveData.slides);
        saveSignageSlides(liveData.slides);
        if (liveData.config && Object.keys(liveData.config).length > 0) {
          setConfig(prev => {
            const updated = { ...prev, ...liveData.config };
            saveSignageConfig(updated);
            return updated;
          });
        }
      }

      // 2. Dapatkan juga kemas kini dari Google Sheets
      const raw = await fetchSchoolDataFromGoogleSheets();
      if (raw) {
        const parsed = parseSchoolDataFromSheets(raw);
        if (parsed.signageSlides && parsed.signageSlides.length > 0) {
          setSlides(parsed.signageSlides);
          saveSignageSlides(parsed.signageSlides);
        }
        if (parsed.signageConfig && Object.keys(parsed.signageConfig).length > 0) {
          setConfig(prev => {
            const updated = { ...prev, ...parsed.signageConfig };
            saveSignageConfig(updated);
            return updated;
          });
        }
        if (parsed.profileUpdates) {
          setProfile(prev => {
            const updated = { ...prev, ...parsed.profileUpdates };
            saveProfile(updated);
            return updated;
          });
        }
      }
      setLastSyncTime(new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('Gagal memuat turun data Signage dari storan awan:', err);
    } finally {
      isSyncingRef.current = false;
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setGasInput(getGasWebAppUrl());

    // 1. Muat turun data cloud serta merta semasa TV dihidupkan
    refreshFromCloud();

    // 2. Semak kemas kini awan secara automatik setiap 4 saat
    const cloudPoll = window.setInterval(refreshFromCloud, 4000);

    // 3. Penyelarasan setempat (antar tab & broadcast event)
    const onStorageChange = () => {
      setProfile(loadProfile());
      setSlides(loadSignageSlides());
      setConfig(loadSignageConfig());
    };

    const onSignageUpdated = (e: any) => {
      if (e.detail?.slides) setSlides(e.detail.slides);
      else setSlides(loadSignageSlides());
    };

    const onConfigUpdated = (e: any) => {
      if (e.detail?.config) setConfig(e.detail.config);
      else setConfig(loadSignageConfig());
    };

    window.addEventListener('storage', onStorageChange);
    window.addEventListener('skmp_signage_updated', onSignageUpdated);
    window.addEventListener('skmp_signage_config_updated', onConfigUpdated);

    return () => {
      window.removeEventListener('storage', onStorageChange);
      window.removeEventListener('skmp_signage_updated', onSignageUpdated);
      window.removeEventListener('skmp_signage_config_updated', onConfigUpdated);
      window.clearInterval(cloudPoll);
    };
  }, []);

  const handleSaveGasUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (gasInput.trim()) {
      saveGasWebAppUrl(gasInput.trim());
      setSavedSuccess(true);
      refreshFromCloud();
      setTimeout(() => {
        setSavedSuccess(false);
        setShowConfigModal(false);
      }, 1500);
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-slate-950 text-white flex flex-col justify-center items-center overflow-hidden p-0 m-0 select-none">
      {/* Discreet Cloud Status & Settings Button (Bottom-Left) */}
      <div className="fixed bottom-3 left-3 z-[10000] flex items-center gap-2">
        <button
          onClick={() => setShowConfigModal(true)}
          className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-[11px] font-bold border border-white/10 backdrop-blur-md opacity-25 hover:opacity-100 transition-all shadow-lg flex items-center gap-2"
          title="Klik untuk tetapan sambungan Google Sheets"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Awan: {slides.length} Slaid</span>
          {isRefreshing && <RefreshCw className="w-3 h-3 animate-spin text-yellow-400" />}
        </button>

        <button
          onClick={refreshFromCloud}
          disabled={isRefreshing}
          className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-yellow-400 hover:text-blue-950 text-slate-400 text-[11px] border border-white/10 backdrop-blur-md opacity-25 hover:opacity-100 transition-all shadow-lg"
          title="Segerak Awan Sekarang"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-yellow-400' : ''}`} />
        </button>
      </div>

      {/* Back to Portal button (appears on hover) */}
      <a
        href="/"
        className="fixed bottom-3 right-3 z-[10000] px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-yellow-400 hover:text-blue-950 text-slate-400 text-[11px] font-bold border border-white/10 backdrop-blur-md opacity-25 hover:opacity-100 transition-all shadow-lg"
        title="Kembali ke Portal Rasmi Sekolah"
      >
        &larr; Portal Rasmi
      </a>

      {/* Connection Config Modal for TV */}
      {showConfigModal && (
        <div className="fixed inset-0 z-[10001] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-yellow-400 text-blue-950 flex items-center justify-center font-bold">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">Tetapan Sambungan Awan TV</h4>
                  <p className="text-[11px] text-slate-300">Google Sheets Web App URL</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGasUrl} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  URL Google Apps Script Web App:
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={gasInput}
                  onChange={(e) => setGasInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-black/50 border border-white/20 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                />
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 bg-white/5 p-3 rounded-xl border border-white/10">
                <p>📊 Status Semasa: <strong className="text-yellow-300">{slides.length} slaid</strong> dimuat turun.</p>
                {lastSyncTime && <p>⏱️ Segerak Terakhir: <strong className="text-emerald-400">{lastSyncTime}</strong></p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-200 font-bold rounded-xl text-xs transition"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition shadow"
                >
                  {savedSuccess ? <Check className="w-4 h-4 text-emerald-800" /> : null}
                  <span>{savedSuccess ? 'Tersimpan!' : 'Simpan & Segerak'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SignageSection
        profile={profile}
        slides={slides}
        config={config}
        standalone={true}
      />
    </div>
  );
}
