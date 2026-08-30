import React, { useState } from 'react';
import { LayoutDashboard, X, ExternalLink } from 'lucide-react';
import { NavigationMenuItem } from '../types';
import { initialNavigationMenu } from '../data/initialData';
import { getNavIcon } from '../utils/iconMap';

export type TabType =
  | 'utama'
  | 'guru'
  | 'profil'
  | 'organisasi'
  | 'akademik'
  | 'hem'
  | 'kokurikulum'
  | 'signage'
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
  navigationMenu?: NavigationMenuItem[];
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  onCloseMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isAdmin,
  unreadFeedbackCount,
  navigationMenu,
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

  // Gunakan data menu tersuai admin atau lalai sistem
  const menuList: NavigationMenuItem[] =
    navigationMenu && navigationMenu.length > 0
      ? [...navigationMenu].sort((a, b) => (a.order || 0) - (b.order || 0))
      : [...initialNavigationMenu];

  // Tapis hanya item yang kelihatan dan padan dengan kebenaran admin
  const visibleNavItems = menuList.filter((item) => {
    if (!item.isVisible) return false;
    if ((item.requiresAdmin || item.targetTab === 'guru' || item.id === 'guru') && !isAdmin) return false;
    return true;
  });

  const handleItemClick = (item: NavigationMenuItem) => {
    if (item.isExternal || item.targetTab === 'custom_url') {
      if (item.externalUrl) {
        window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    onTabChange(item.targetTab as TabType);
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
        {/* Full Visible Nav Items with flex-wrap for multiline downwards layout */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
          {visibleNavItems.map((item) => {
            const Icon = getNavIcon(item.iconName);
            const isActive = activeTab === item.targetTab && !item.isExternal;
            const isHome = item.targetTab === 'utama' || item.id === 'utama';
            const isGuru = item.targetTab === 'guru' || item.id === 'guru';
            const isIconOnlyOnMobile =
              item.targetTab === 'signage' ||
              item.id === 'signage' ||
              item.targetTab === 'hubungi' ||
              item.id === 'hubungi';

            const displayLabel = isHome ? '' : item.label;
            const tooltipTitle = item.isExternal
              ? `Buka pautan: ${item.externalUrl}`
              : (item.label || (isHome ? 'Laman Utama' : ''));

            let buttonClass = 'bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white border border-white/10';
            if (isGuru) {
              buttonClass = isActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white font-black shadow-md shadow-rose-600/40 border border-rose-400 ring-2 ring-rose-400/30'
                : 'bg-red-600/90 hover:bg-red-600 text-white font-bold border border-red-500 shadow-sm shadow-red-950/40';
            } else if (isActive) {
              buttonClass = 'bg-yellow-400 text-blue-950 font-black shadow-md shadow-yellow-400/20 border border-yellow-300';
            }

            let iconClass = isActive ? 'text-blue-950' : 'text-yellow-400';
            if (isGuru) {
              iconClass = 'text-yellow-300';
            }

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`rounded-xl text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                  isHome
                    ? 'p-2 sm:px-2.5 sm:py-1.5'
                    : isIconOnlyOnMobile
                    ? 'p-2 sm:px-3 sm:py-1.5'
                    : 'px-2.5 sm:px-3 py-1.5'
                } ${buttonClass}`}
                title={tooltipTitle}
                aria-label={tooltipTitle}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${iconClass}`} />
                {displayLabel && (
                  <span className={isIconOnlyOnMobile ? 'hidden sm:inline' : ''}>
                    {displayLabel}
                  </span>
                )}
                {item.isExternal && <ExternalLink className="w-2.5 h-2.5 opacity-70" />}
                {item.badge && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded border ${
                      isGuru
                        ? 'bg-red-950 text-yellow-300 border-red-400/50'
                        : 'bg-slate-900/80 text-yellow-300 border-white/20'
                    } ${isIconOnlyOnMobile ? 'hidden sm:inline-block' : ''}`}
                  >
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
              {visibleNavItems.map((item) => {
                const Icon = getNavIcon(item.iconName);
                const isActive = activeTab === item.targetTab && !item.isExternal;
                const isGuru = item.targetTab === 'guru' || item.id === 'guru';

                let drawerItemClass = 'text-slate-200 hover:bg-white/10';
                if (isGuru) {
                  drawerItemClass = isActive
                    ? 'bg-rose-600 text-white font-black shadow-md border border-rose-400'
                    : 'bg-red-600/85 hover:bg-red-600 text-white font-bold border border-red-500/50 shadow-sm';
                } else if (isActive) {
                  drawerItemClass = 'bg-yellow-400 text-blue-950 font-black shadow-md';
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleItemClick(item);
                      handleCloseMenu();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition ${drawerItemClass}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isGuru ? 'text-yellow-300' : isActive ? 'text-blue-950' : 'text-yellow-400'}`} />
                      <span>{item.label || (item.targetTab === 'utama' ? 'Laman Utama' : 'Utama')}</span>
                      {item.isExternal && <ExternalLink className="w-3 h-3 opacity-60 ml-1" />}
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isGuru
                            ? 'bg-red-950 text-yellow-300 border-red-400/40'
                            : 'bg-slate-900 text-yellow-300 border-white/20'
                        }`}
                      >
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
