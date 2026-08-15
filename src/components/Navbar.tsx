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
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  onCloseMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isAdmin,
  unreadFeedbackCount,
  mobileMenuOpen: controlledMenuOpen,
  onToggleMobileMenu,
  onCloseMobileMenu
}) => {
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const isMenuOpen = controlledMenuOpen !== undefined ? controlledMenuOpen : internalMenuOpen;

  const handleToggleMenu = () => {
    if (onToggleMobileMenu) {
      onToggleMobileMenu();
    } else {
      setInternalMenuOpen((prev) => !prev);
    }
  };

  const handleCloseMenu = () => {
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    } else {
      setInternalMenuOpen(false);
    }
  };

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
    ...(isAdmin ? [{ id: 'gas_code' as TabType, label: 'Kod Apps Script', icon: Code2, badge: 'Admin' }] : [])
  ];

  return (
    <nav className="bg-slate-900/60 backdrop-blur-md border-b border-white/10 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-11">
          {/* Desktop & Mobile Scrollable Nav Items */}
          <div className="flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap flex-shrink-0 ${
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
                className={`ml-auto px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition whitespace-nowrap flex-shrink-0 ${
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
        </div>

        {/* Full Navigation Drawer when Top-Right 3-lines button is clicked */}
        {isMenuOpen && (
          <div className="py-3 border-t border-white/10 space-y-1">
            <div className="px-2 pb-1.5 flex items-center justify-between text-[11px] font-extrabold text-yellow-400 uppercase tracking-wider">
              <span>Pilihan Pantas Semua Menu Tab</span>
              <button
                onClick={handleCloseMenu}
                className="text-slate-400 hover:text-white p-1 rounded transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      handleCloseMenu();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                      isActive
                        ? 'bg-yellow-400 text-blue-950 font-black shadow-md'
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
          </div>
        )}
      </div>
    </nav>
  );
};
