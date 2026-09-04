import React, { useState } from 'react';
import { SchoolProfile, SearchResultItem } from '../types';
import { Search, Lock, UserCheck, MapPin, Phone, Mail, LogOut, ChevronRight, X, ShieldAlert, Menu, Users, Utensils } from 'lucide-react';

interface HeaderProps {
  profile: SchoolProfile;
  isAdmin: boolean;
  userRole?: 'admin' | 'guru' | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  searchResults: SearchResultItem[];
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onSelectSearchResult: (item: SearchResultItem) => void;
  onOpenAdminDashboard: () => void;
  onOpenTeacherPortal?: () => void;
  onOpenStudentPortal?: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  isAdmin,
  userRole,
  onOpenLogin,
  onLogout,
  searchResults,
  onSearchChange,
  searchQuery,
  onSelectSearchResult,
  onOpenAdminDashboard,
  onOpenTeacherPortal,
  onOpenStudentPortal,
  isMobileMenuOpen,
  onToggleMobileMenu
}) => {
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <header className="bg-white/10 backdrop-blur-lg border-b border-white/10 text-white shadow-md">
      {/* Top Banner Info Line */}
      <div className="bg-white/5 backdrop-blur-md text-slate-200 text-xs py-1.5 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-yellow-400" />
              {profile.city}, {profile.state}
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-yellow-400" />
              {profile.phone}
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-yellow-400" />
              {profile.email}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-white/10 text-yellow-300 px-2.5 py-0.5 rounded-full border border-white/15">
              Kod Sekolah: {profile.code}
            </span>

            {isAdmin ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAdminDashboard}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-950 hover:bg-yellow-400 bg-yellow-400 px-3 py-0.5 rounded-full border border-yellow-300 shadow-md transition"
                  title="Buka Papan Pemuka Pentadbir (CMS)"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Admin Active</span>
                </button>
                <button
                  onClick={onLogout}
                  className="text-xs text-rose-300 hover:text-rose-100 flex items-center gap-1 ml-1 font-semibold"
                  title="Log Keluar"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : userRole === 'guru' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenTeacherPortal}
                  className="inline-flex items-center gap-1 text-xs font-bold text-white hover:bg-rose-500 bg-rose-600 px-3 py-0.5 rounded-full border border-rose-400 shadow-md transition"
                  title="Buka Portal Guru SKMP"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Guru Active</span>
                </button>
                <button
                  onClick={onLogout}
                  className="text-xs text-rose-300 hover:text-rose-100 flex items-center gap-1 ml-1 font-semibold"
                  title="Log Keluar"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-yellow-400 hover:text-yellow-300 hover:bg-white/10 border border-yellow-400/30 transition inline-flex items-center justify-center gap-1.5 shadow-sm cursor-pointer text-xs font-bold"
                title="Log Masuk Guru & Pentadbir"
                aria-label="Log Masuk"
              >
                <Lock className="w-3.5 h-3.5 text-yellow-400" />
                <span className="hidden sm:inline">Log Masuk</span>
              </button>
            )}

            {/* Garisan Pemisah & Jarak Jelas Agar Tidak Rapat */}
            <div className="h-4 w-px bg-white/25 mx-1 sm:mx-2" />

            {/* Butang Tab Tiga Garisan di Hujung Kanan Sekali */}
            {onToggleMobileMenu && (
              <button
                onClick={onToggleMobileMenu}
                className="p-1.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 rounded-lg border border-yellow-300 transition flex items-center justify-center shadow-md shadow-yellow-400/20"
                aria-label="Menu Tab Navigasi"
                title="Buka / Tutup Pilihan Menu Tab"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Brand Area */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* School Crest & Name + Mobile Search Toggle Button */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="relative group flex-shrink-0">
              <div className="w-13 h-13 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-md rounded-2xl p-1 shadow-lg shadow-yellow-400/20 border-2 border-yellow-300/60 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={profile.logoUrl}
                  alt="Logo SK Merbau Pulas"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl md:text-2xl font-black tracking-tight text-white uppercase leading-snug">
                  {profile.name}
                </h1>
              </div>
              <p className="text-[11px] sm:text-sm font-medium text-yellow-400 mt-0.5 flex items-center gap-2">
                <span>{profile.postcode} {profile.city}, {profile.state}</span>
                <span className="hidden sm:inline text-slate-400">•</span>
                <span className="hidden sm:inline text-slate-300 italic">"{profile.motto}"</span>
              </p>
            </div>
          </div>

          {/* Mobile Search Button Icon (Kanta Carian Sahaja untuk Mod Telefon) */}
          <div className="md:hidden flex items-center flex-shrink-0 ml-2">
            <button
              onClick={() => {
                setIsMobileSearchOpen((prev) => !prev);
                setShowSearchResults(true);
              }}
              className={`p-2 rounded-xl border transition flex items-center justify-center shadow-md ${
                isMobileSearchOpen
                  ? 'bg-yellow-400 text-blue-950 border-yellow-300 ring-2 ring-yellow-400/40'
                  : 'bg-white/10 hover:bg-white/20 text-yellow-300 border-white/20'
              }`}
              aria-label="Carian Portal"
              title={isMobileSearchOpen ? 'Tutup Carian' : 'Buka Ruangan Carian'}
            >
              {isMobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Expandable Search Bar Drawer */}
        {isMobileSearchOpen && (
          <div className="w-full md:hidden pt-1 pb-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <Search className="w-4 h-4 text-yellow-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Cari berita, guru, takwim, murid..."
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="w-full bg-slate-900/90 backdrop-blur-xl text-white text-xs pl-9 pr-8 py-2.5 rounded-xl border-2 border-yellow-400/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition shadow-lg placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    onSearchChange('');
                    setShowSearchResults(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Dropdown Search Results */}
            {showSearchResults && searchQuery.trim().length > 0 && (
              <div className="mt-2 bg-slate-900/98 backdrop-blur-2xl border border-yellow-400/40 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-3.5 text-center text-xs text-slate-400">
                    Tiada rekod dijumpai untuk "{searchQuery}".
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    <div className="px-3 py-1.5 bg-yellow-400/10 text-[10px] font-extrabold text-yellow-300 uppercase tracking-wider">
                      Hasil Carian ({searchResults.length})
                    </div>
                    {searchResults.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onSelectSearchResult(item);
                          setShowSearchResults(false);
                          setIsMobileSearchOpen(false);
                        }}
                        className="w-full text-left p-3 hover:bg-white/10 transition flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
                              {item.type}
                            </span>
                            <span className="text-xs font-bold text-slate-100 group-hover:text-yellow-300 transition line-clamp-1">
                              {item.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {item.subtitle}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-yellow-400 transition ml-2 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Desktop Permanent Search Bar (Hanya muncul di skrin sederhana & besar) */}
        <div className="hidden md:block relative w-80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari berita, guru, borang, takwim..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full bg-white/5 backdrop-blur-md text-white text-xs pl-9 pr-8 py-2.5 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition shadow-inner placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  onSearchChange('');
                  setShowSearchResults(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown Results Desktop */}
          {showSearchResults && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Tiada rekod dijumpai untuk "{searchQuery}".
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  <div className="px-3 py-1.5 bg-white/10 text-[10px] font-extrabold text-yellow-400 uppercase tracking-wider">
                    Hasil Carian ({searchResults.length})
                  </div>
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectSearchResult(item);
                        setShowSearchResults(false);
                      }}
                      className="w-full text-left p-3 hover:bg-white/10 transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-extrabold uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
                            {item.type}
                          </span>
                          <span className="text-xs font-bold text-slate-100 group-hover:text-yellow-300 transition line-clamp-1">
                            {item.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {item.subtitle}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-yellow-400 transition ml-2 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
