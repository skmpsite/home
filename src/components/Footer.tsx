import React from 'react';
import { SchoolProfile } from '../types';
import { MapPin, Phone, Mail, ArrowUp, Globe, ShieldCheck, Heart } from 'lucide-react';
import { TabType } from './Navbar';

interface FooterProps {
  profile: SchoolProfile;
  onNavigate: (tab: TabType) => void;
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ profile, onNavigate, onOpenAdminLogin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white/10 backdrop-blur-xl text-slate-200 border-t border-white/10 mt-16 shadow-2xl">
      {/* Upper Footer Links Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
        {/* Brand & Address */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl p-1 shadow-lg border border-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src={profile.logoUrl}
                alt="Logo SKMP"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white uppercase leading-tight">
                {profile.name}
              </h3>
              <span className="text-[11px] text-yellow-400 font-bold">Kod Sekolah: {profile.code}</span>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {profile.address}, {profile.postcode} {profile.city}, {profile.state}.
          </p>
          <div className="pt-1 space-y-1 text-slate-200 font-medium">
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-yellow-400" /> {profile.phone}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-yellow-400" /> {profile.email}
            </p>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wide border-b border-white/10 pb-2">
            Pautan Penting
          </h4>
          <ul className="space-y-2 text-slate-300 font-medium">
            <li>
              <button onClick={() => onNavigate('profil')} className="hover:text-yellow-300 transition">
                Profil & Lagu Sekolah
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('organisasi')} className="hover:text-yellow-300 transition">
                Barisan Pentadbir & Guru
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('akademik')} className="hover:text-yellow-300 transition">
                Takwim Akademik & Peperiksaan
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('kokurikulum')} className="hover:text-yellow-300 transition">
                Aktiviti Kokurikulum
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('berita')} className="hover:text-yellow-300 transition">
                Papan Kenyataan Berita
              </button>
            </li>
          </ul>
        </div>

        {/* KPM Official System Portals */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wide border-b border-white/10 pb-2">
            Portal KPM & DELIMa
          </h4>
          <ul className="space-y-2 text-slate-300 font-medium">
            <li>
              <a href="https://d3.delima.edu.my" target="_blank" rel="noreferrer" className="hover:text-yellow-300 transition flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-yellow-400" /> DELIMa 3.0 KPM
              </a>
            </li>
            <li>
              <a href="https://idme.moe.gov.my" target="_blank" rel="noreferrer" className="hover:text-yellow-300 transition flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-yellow-400" /> idMe KPM (Modul Murid)
              </a>
            </li>
            <li>
              <a href="https://apdm.moe.gov.my" target="_blank" rel="noreferrer" className="hover:text-yellow-300 transition flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-yellow-400" /> APDM Kehadiran Murid
              </a>
            </li>
            <li>
              <a href="https://sppb.moe.gov.my" target="_blank" rel="noreferrer" className="hover:text-yellow-300 transition flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-yellow-400" /> SPPB / SAPS KPM
              </a>
            </li>
          </ul>
        </div>

        {/* Integration & Admin */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-white text-sm uppercase tracking-wide border-b border-white/10 pb-2">
            Pembangunan & Pentadbiran
          </h4>
          <p className="text-slate-300 leading-relaxed">
            Dikuasakan oleh Google Apps Script & Google Sheets dengan integrasi pangkalan data automatik.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => onNavigate('gas_code')}
              className="px-3 py-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs text-center transition shadow-md shadow-yellow-400/20"
            >
              Sumber Kod Google Apps Script
            </button>
            <button
              onClick={onOpenAdminLogin}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-xl text-xs text-center transition backdrop-blur-md"
            >
              Log Masuk Admin Sekolah
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="bg-slate-950/80 backdrop-blur-md border-t border-white/10 py-4 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-300 text-center sm:text-left">
            Hak Cipta Terpelihara © 2026 - <strong className="text-white">{profile.name} ({profile.code})</strong>.
          </p>
          <button
            onClick={scrollToTop}
            className="p-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 rounded-xl transition flex items-center gap-1 font-black shadow-lg shadow-yellow-400/20"
            title="Ke Atas"
          >
            <ArrowUp className="w-4 h-4" />
            <span className="hidden sm:inline">Ke Atas</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
