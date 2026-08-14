import React, { useState } from 'react';
import { SchoolProfile, SearchResultItem } from '../types';
import { Search, Lock, UserCheck, MapPin, Phone, Mail, LogOut, ChevronRight, X, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  profile: SchoolProfile;
  isAdmin: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  searchResults: SearchResultItem[];
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onSelectSearchResult: (item: SearchResultItem) => void;
  onOpenAdminDashboard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  isAdmin,
  onOpenLogin,
  onLogout,
  searchResults,
  onSearchChange,
  searchQuery,
  onSelectSearchResult,
  onOpenAdminDashboard
}) => {
  const [showSearchResults, setShowSearchResults] = useState(false);

  return (
    <header className="bg-white/10 backdrop-blur-lg border-b border-white/10 text-white shadow-2xl sticky top-0 z-50">
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
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/10 text-yellow-300 px-2.5 py-0.5 rounded-full border border-white/15">
              Kod Sekolah: {profile.code}
            </span>
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAdminDashboard}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-950 hover:bg-yellow-400 bg-yellow-400/90 px-3 py-0.5 rounded-full border border-yellow-300 shadow-md transition"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Admin SKMP Active
                </button>
                <button
                  onClick={onLogout}
                  className="text-xs text-rose-300 hover:text-rose-100 flex items-center gap-1 ml-1"
                  title="Log Keluar"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-400 hover:text-yellow-300 transition"
              >
                <Lock className="w-3.5 h-3.5 text-yellow-400" />
                <span>Log Masuk Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Brand Area */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* School Crest & Name */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="relative group flex-shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-md rounded-2xl p-1 shadow-lg shadow-yellow-400/20 border-2 border-yellow-300/60 flex items-center justify-center overflow-hidden flex-shrink-0">
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
              <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white uppercase leading-snug">
                {profile.name}
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-medium text-yellow-400 mt-0.5 flex items-center gap-2">
              <span>{profile.postcode} {profile.city}, {profile.state}</span>
              <span className="hidden sm:inline text-slate-400">•</span>
              <span className="hidden sm:inline text-slate-300 italic">"{profile.motto}"</span>
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-80">
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

          {/* Autocomplete Dropdown Results */}
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
