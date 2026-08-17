import React, { useState, useEffect } from 'react';
import { SchoolProfile, SignageSlide, SignageConfig } from './types';
import { loadProfile, loadSignageSlides, loadSignageConfig } from './utils/storage';
import { SignageSection } from './components/sections/SignageSection';

export default function TvApp() {
  const [profile, setProfile] = useState<SchoolProfile>(loadProfile);
  const [slides, setSlides] = useState<SignageSlide[]>(loadSignageSlides);
  const [config, setConfig] = useState<SignageConfig>(loadSignageConfig);

  useEffect(() => {
    // Real-time synchronization
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

    const poll = window.setInterval(() => {
      setProfile(loadProfile());
      setSlides(loadSignageSlides());
      setConfig(loadSignageConfig());
    }, 3000);

    return () => {
      window.removeEventListener('storage', onStorageChange);
      window.removeEventListener('skmp_signage_updated', onSignageUpdated);
      window.removeEventListener('skmp_signage_config_updated', onConfigUpdated);
      window.clearInterval(poll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center overflow-hidden p-0 m-0 select-none">
      <SignageSection
        profile={profile}
        slides={slides}
        config={config}
        standalone={true}
      />
    </div>
  );
}
