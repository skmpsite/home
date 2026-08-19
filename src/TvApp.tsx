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
import { fetchSchoolDataFromGoogleSheets, parseSchoolDataFromSheets } from './utils/googleSheetsSync';
import { SignageSection } from './components/sections/SignageSection';

export default function TvApp() {
  const [profile, setProfile] = useState<SchoolProfile>(loadProfile);
  const [slides, setSlides] = useState<SignageSlide[]>(loadSignageSlides);
  const [config, setConfig] = useState<SignageConfig>(loadSignageConfig);
  const isSyncingRef = useRef(false);

  // Fungsi muat turun data Signage terkini secara langsung dari Google Sheets (Cloud Backend)
  const refreshFromCloud = async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    try {
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
    } catch (err) {
      console.warn('Gagal memuat turun data Signage dari storan awan Google Sheets:', err);
    } finally {
      isSyncingRef.current = false;
    }
  };

  useEffect(() => {
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

  return (
    <div className="relative min-h-screen w-screen bg-slate-950 text-white flex flex-col justify-center items-center overflow-hidden p-0 m-0 select-none">
      {/* Back to Portal button (appears on hover) */}
      <a
        href="/"
        className="fixed bottom-3 right-3 z-[10000] px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-yellow-400 hover:text-blue-950 text-slate-400 text-[11px] font-bold border border-white/10 backdrop-blur-md opacity-30 hover:opacity-100 transition-all shadow-lg"
        title="Kembali ke Portal Rasmi Sekolah"
      >
        &larr; Portal Rasmi
      </a>

      <SignageSection
        profile={profile}
        slides={slides}
        config={config}
        standalone={true}
      />
    </div>
  );
}
