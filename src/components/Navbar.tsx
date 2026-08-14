import React, { useState } from 'react';
import {
  Home,
  School,
  Network,
  GraduationCap,
  Trophy,
  Newspaper,
  Image as ImageIcon,
  Download,
  PhoneCall,
  Code2,
  Menu,
  X,
  LayoutDashboard,
  Award,
  BookOpen
} from 'lucide-react';

export type TabType =
  | 'utama'
  | 'profil'
  | 'organisasi'
  | 'akademik'
  | 'kokurikulum'
  | 'berita'
  | 'galeri'
  | 'anugerah'
  | 'portal'
  | 'hubungi'
  | 'gas_code'
  | 'admin_cms';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isAdmin: boolean;
  unreadFeedbackCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isAdmin,
  unreadFeedbackCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'utama' as TabType, label: 'Utama', icon: Home },
    { id: 'profil' as TabType, label: 'Profil Sekolah', icon: School },
    { id: 'organisasi' as TabType, label: 'Carta Organisasi', icon: Network },
    { id: 'akademik' as TabType, label: 'Akademik & Takwim', icon: GraduationCap },
    { id: 'kokurikulum' as TabType, label: 'Kokurikulum', icon: Trophy },
    { id: 'berita' as TabType, label: 'Berita & Pekeliling', icon: Newspaper },
    { id: 'galeri' as TabType, label: 'Galeri Media', icon: ImageIcon },
    { id: 'anugerah' as TabType, label: 'Ruang Anugerah', icon: Award },
    { id: 'portal' as TabType, label: 'Portal & Muat Turun', icon: Download },
    { id: 'hubungi' as TabType, label: 'Hubungi Kami', icon: PhoneCall },
    { id: 'gas_code' as TabType, label: 'Kod Google Apps Script', icon: Code2, badge: 'Code.gs' }
  ];

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/10 text-white shadow-lg sticky top-[82px] z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                    isActive
                      ? 'bg-yellow-400 text-blue-950 font-black shadow-md shadow-yellow-400/20 border border-yellow-300'
                      : 'text-slate-200 hover:bg-white/10 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-slate-900/80 text-yellow-300 font-black px-1.5 py-0.2 rounded border border-white/20">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Admin CMS Panel Trigger */}
            {isAdmin && (
              <button
                onClick={() => onTabChange('admin_cms')}
                className={`ml-auto px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition whitespace-nowrap ${
                  activeTab === 'admin_cms'
                    ? 'bg-emerald-500 text-slate-950 shadow-md border border-emerald-300'
                    : 'bg-emerald-500/80 hover:bg-emerald-500 text-white border border-emerald-400/40'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Panel CMS Admin</span>
                {unreadFeedbackCount > 0 && (
                  <span className="w-4 h-4 bg-rose-500 text-white font-bold rounded-full text-[10px] flex items-center justify-center animate-pulse">
                    {unreadFeedbackCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center justify-between w-full">
            <span className="text-xs font-black text-yellow-400 uppercase tracking-wide flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-yellow-400" />
              SKMP Web Portal
            </span>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => onTabChange('admin_cms')}
                  className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-lg flex items-center gap-1"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  CMS
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-white/10 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                    isActive
                      ? 'bg-yellow-400 text-blue-950 font-black'
                      : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-slate-900 text-yellow-300 font-bold px-2 py-0.5 rounded border border-white/20">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};
