import React, { useState, useMemo, useEffect } from 'react';
import { Staff, SchoolProfile } from '../../types';
import { initialSchoolProfile } from '../../data/initialData';
import { formatGoogleDriveUrl } from '../../utils/imageHelpers';
import { sortStaffBySeniority, isAdministrator, getSeniorityScore } from '../../utils/staffHelpers';
import {
  Users,
  Mail,
  Phone,
  BookOpen,
  ShieldCheck,
  X,
  Search,
  UserCheck,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Copy
} from 'lucide-react';

interface OrganizationSectionProps {
  staffList: Staff[];
  profile?: SchoolProfile;
}

export const OrganizationSection: React.FC<OrganizationSectionProps> = ({ staffList, profile }) => {
  const [selectedCategory, setSelectedCategory] = useState<'semua' | 'pentadbir' | 'guru' | 'staf'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaffModal, setSelectedStaffModal] = useState<Staff | null>(null);
  const [zoomedPhotoStaff, setZoomedPhotoStaff] = useState<Staff | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Susun semua staf mengikut hierarki kekananan
  const sortedStaffList = useMemo(() => {
    return sortStaffBySeniority(staffList, profile);
  }, [staffList, profile]);

  const getStaffName = (staff: Staff): string => {
    const isGuruBesar =
      staff.id === 'staf-1' ||
      (staff.position && staff.position.toLowerCase().includes('guru besar')) ||
      (staff.name && staff.name.toLowerCase().includes('norhafiza'));
    if (isGuruBesar) {
      return profile?.principalName || staff.name || 'Puan Norhafiza Binti Dolah';
    }
    return staff.name;
  };

  const getStaffPosition = (staff: Staff): string => {
    const isGuruBesar =
      staff.id === 'staf-1' ||
      (staff.position && staff.position.toLowerCase().includes('guru besar')) ||
      (staff.name && staff.name.toLowerCase().includes('norhafiza'));
    if (isGuruBesar) {
      return profile?.principalTitle || staff.position || 'Guru Besar (DG48)';
    }
    return staff.position;
  };

  const getStaffPhoto = (staff: Staff): string => {
    const isGuruBesar =
      staff.id === 'staf-1' ||
      (staff.position && staff.position.toLowerCase().includes('guru besar')) ||
      (staff.name && staff.name.toLowerCase().includes('norhafiza'));

    if (isGuruBesar) {
      // Keutamaan 1: Foto terkini yang dimuat naik admin dalam profil
      if (profile?.principalPhotoUrl && profile.principalPhotoUrl.trim() !== '') {
        return formatGoogleDriveUrl(profile.principalPhotoUrl);
      }
      // Keutamaan 2: Foto yang disimpan dalam rekod staf
      if (
        staff.photoUrl &&
        staff.photoUrl.trim() !== '' &&
        !staff.photoUrl.includes('unsplash.com') &&
        !staff.photoUrl.includes('1786556385385') &&
        !staff.photoUrl.includes('1786555771027') &&
        !staff.photoUrl.includes('guru_besar_norhafiza') &&
        !staff.photoUrl.includes('1786808669012')
      ) {
        return formatGoogleDriveUrl(staff.photoUrl);
      }
      return '';
    }

    if (!staff.photoUrl || staff.photoUrl.trim() === '' || staff.photoUrl.includes('unsplash.com')) {
      return '';
    }
    return formatGoogleDriveUrl(staff.photoUrl);
  };

  const administrators = useMemo(() => {
    const admins = sortedStaffList.filter((s) => isAdministrator(s, profile));
    return sortStaffBySeniority(admins, profile);
  }, [sortedStaffList, profile]);
  
  const filteredStaff = useMemo(() => {
    return sortedStaffList.filter((s) => {
      let matchesCategory = true;
      if (selectedCategory === 'pentadbir') {
        matchesCategory = isAdministrator(s, profile);
      } else if (selectedCategory === 'guru') {
        matchesCategory = !isAdministrator(s, profile) && (s.category === 'guru' || (s.grade && s.grade.toUpperCase().includes('DG')));
      } else if (selectedCategory === 'staf') {
        matchesCategory = s.category === 'staf' || s.category === 'akp' || (!isAdministrator(s, profile) && !(s.grade && s.grade.toUpperCase().includes('DG')));
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        s.name.toLowerCase().includes(q) ||
        s.position.toLowerCase().includes(q) ||
        (s.grade && s.grade.toLowerCase().includes(q)) ||
        (s.subject && s.subject.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [sortedStaffList, selectedCategory, searchQuery, profile]);

  const activeStaffList = useMemo(() => {
    if (selectedStaffModal && !filteredStaff.some((s) => s.id === selectedStaffModal.id)) {
      return sortedStaffList;
    }
    if (zoomedPhotoStaff && !filteredStaff.some((s) => s.id === zoomedPhotoStaff.id)) {
      return sortedStaffList;
    }
    return filteredStaff.length > 0 ? filteredStaff : sortedStaffList;
  }, [filteredStaff, sortedStaffList, selectedStaffModal, zoomedPhotoStaff]);

  const handleNextStaff = (currentStaff: Staff, setTarget: (s: Staff) => void) => {
    const list = activeStaffList;
    if (list.length === 0) return;
    const currentIndex = list.findIndex((s) => s.id === currentStaff.id);
    if (currentIndex !== -1 && currentIndex < list.length - 1) {
      setTarget(list[currentIndex + 1]);
    } else {
      setTarget(list[0]);
    }
    setZoomLevel(1);
  };

  const handlePrevStaff = (currentStaff: Staff, setTarget: (s: Staff) => void) => {
    const list = activeStaffList;
    if (list.length === 0) return;
    const currentIndex = list.findIndex((s) => s.id === currentStaff.id);
    if (currentIndex > 0) {
      setTarget(list[currentIndex - 1]);
    } else {
      setTarget(list[list.length - 1]);
    }
    setZoomLevel(1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (zoomedPhotoStaff) {
        if (e.key === 'Escape') {
          setZoomedPhotoStaff(null);
          setZoomLevel(1);
        } else if (e.key === 'ArrowRight') {
          handleNextStaff(zoomedPhotoStaff, setZoomedPhotoStaff);
        } else if (e.key === 'ArrowLeft') {
          handlePrevStaff(zoomedPhotoStaff, setZoomedPhotoStaff);
        } else if (e.key === '+' || e.key === '=') {
          setZoomLevel((z) => Math.min(3, +(z + 0.25).toFixed(2)));
        } else if (e.key === '-' || e.key === '_') {
          setZoomLevel((z) => Math.max(0.75, +(z - 0.25).toFixed(2)));
        } else if (e.key === '0') {
          setZoomLevel(1);
        }
      } else if (selectedStaffModal) {
        if (e.key === 'Escape') {
          setSelectedStaffModal(null);
        } else if (e.key === 'ArrowRight') {
          handleNextStaff(selectedStaffModal, setSelectedStaffModal);
        } else if (e.key === 'ArrowLeft') {
          handlePrevStaff(selectedStaffModal, setSelectedStaffModal);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedPhotoStaff, selectedStaffModal, activeStaffList]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Banner */}
      <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-xs border border-yellow-400/30 mb-2">
          <Users className="w-3.5 h-3.5 text-yellow-400" />
          <span>Warga SKMP</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Carta Organisasi & Barisan Tenaga Pengajar</h2>
        <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
          Pengurusan tertinggi pentadbiran sekolah, barisan guru pendidik, dan staf sokongan Sekolah Kebangsaan Merbau Pulas.
        </p>
      </div>

      {/* Barisan Pentadbir Hierarchy Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-yellow-400" />
            <h3 className="text-xl font-black text-white">Barisan Pentadbir Utama Sekolah</h3>
          </div>
          <span className="text-[11px] text-yellow-300/80 font-medium flex items-center gap-1.5">
            <ZoomIn className="w-3.5 h-3.5 text-yellow-400" />
            <span>Klik gambar untuk zoom in foto atau kad</span>
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {administrators.map((admin) => {
            const photo = getStaffPhoto(admin);
            return (
              <div
                key={admin.id}
                onClick={() => setSelectedStaffModal(admin)}
                className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-5 shadow-lg hover:shadow-2xl transition-all duration-300 text-center cursor-pointer group hover:border-yellow-400/60 hover:scale-[1.02] flex flex-col items-center relative"
              >
                {/* Photo with direct Zoom In click */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomedPhotoStaff(admin);
                    setZoomLevel(1);
                  }}
                  title="Klik untuk besarkan gambar pentadbir (Zoom In)"
                  className="w-24 h-24 rounded-2xl bg-yellow-400 p-0.5 shadow-md overflow-hidden mb-3 border-2 border-yellow-300 group-hover:scale-105 transition flex items-center justify-center relative cursor-zoom-in group/photo"
                >
                  {photo && photo.trim() !== '' ? (
                    <img
                      src={photo}
                      alt={admin.name}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-full h-full object-cover rounded-xl group-hover/photo:scale-110 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-yellow-300">
                      <UserCheck className="w-10 h-10 opacity-70" />
                    </div>
                  )}
                  {/* Hover Zoom Overlay */}
                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover/photo:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-xl backdrop-blur-[1px] gap-1">
                    <span className="p-1.5 bg-yellow-400 text-blue-950 rounded-full shadow-lg">
                      <ZoomIn className="w-4 h-4" />
                    </span>
                    <span className="text-[9px] font-black text-white bg-blue-950/80 px-1.5 py-0.5 rounded">
                      Zoom
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 bg-blue-950 text-yellow-300 font-black rounded-md text-[10px] uppercase mb-2 border border-white/20">
                  {admin.position.toLowerCase().includes('guru besar') ? 'DG48' : admin.grade}
                </span>
                <h4 className="font-extrabold text-xs sm:text-sm text-white group-hover:text-yellow-300 transition line-clamp-1">
                  {getStaffName(admin)}
                </h4>
                <p className="text-xs text-yellow-400 font-bold mt-1 line-clamp-2">
                  {getStaffPosition(admin)}
                </p>
                <div className="mt-3 pt-2 w-full border-t border-white/10 flex items-center justify-center gap-1.5 text-[10px] text-slate-300 group-hover:text-yellow-300 transition">
                  <Maximize2 className="w-3 h-3 text-yellow-400" />
                  <span>Buka Kad Penuh</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Staff Directory with Filter & Search */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-yellow-400" />
              <h3 className="text-xl font-black text-white">Direktori Guru & Staf Sokongan</h3>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1.5">
              <ZoomIn className="w-3 h-3 text-yellow-400" />
              <span>Klik gambar mana-mana guru atau staf untuk <strong>besarkan foto (zoom in)</strong> atau klik kad untuk maklumat penuh.</span>
            </p>
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama atau subjek..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white/5 border border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
            />
          </div>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'semua', label: 'Semua Warga' },
            { id: 'pentadbir', label: 'Pentadbir' },
            { id: 'guru', label: 'Barisan Guru' },
            { id: 'staf', label: 'Staf Sokongan' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                selectedCategory === tab.id
                  ? 'bg-yellow-400 text-blue-950 font-black shadow-lg shadow-yellow-400/20'
                  : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Staff Cards Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredStaff.map((staff) => {
            const photo = getStaffPhoto(staff);
            return (
              <div
                key={staff.id}
                onClick={() => setSelectedStaffModal(staff)}
                className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 hover:border-yellow-400/50 transition-all duration-200 cursor-pointer shadow-md group flex items-center gap-3.5 hover:scale-[1.02] relative"
              >
                {/* Photo with direct Zoom In click */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomedPhotoStaff(staff);
                    setZoomLevel(1);
                  }}
                  title="Klik foto untuk besarkan gambar (Zoom In)"
                  className="w-14 h-14 rounded-xl bg-yellow-400 p-0.5 overflow-hidden flex-shrink-0 shadow-sm flex items-center justify-center relative cursor-zoom-in group/photo"
                >
                  {photo && photo.trim() !== '' ? (
                    <img
                      src={photo}
                      alt={getStaffName(staff)}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-full h-full object-cover rounded-lg group-hover/photo:scale-110 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-yellow-300">
                      <UserCheck className="w-6 h-6 opacity-70" />
                    </div>
                  )}
                  {/* Hover Zoom Overlay */}
                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center rounded-lg backdrop-blur-[1px]">
                    <span className="p-1 bg-yellow-400 text-blue-950 rounded-full shadow-md">
                      <ZoomIn className="w-3 h-3" />
                    </span>
                  </div>
                </div>
                <div className="space-y-0.5 overflow-hidden flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-yellow-300 uppercase bg-yellow-500/20 px-1.5 py-0.2 rounded border border-yellow-400/30">
                      {staff.position.toLowerCase().includes('guru besar') ? 'DG48' : staff.grade}
                    </span>
                    <span className="text-[9px] text-yellow-400/80 group-hover:text-yellow-300 flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition font-medium">
                      <Maximize2 className="w-2.5 h-2.5" />
                      <span>Kad</span>
                    </span>
                  </div>
                  <h5 className="font-extrabold text-xs text-white group-hover:text-yellow-300 transition truncate">
                    {getStaffName(staff)}
                  </h5>
                  <p className="text-[11px] text-slate-300 truncate font-medium">
                    {getStaffPosition(staff)}
                  </p>
                  {staff.subject && (
                    <p className="text-[10px] text-yellow-400 font-semibold truncate">
                      📖 {staff.subject}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Staff Detail Modal (Kad Maklumat Terperinci - Zoom In) */}
      {selectedStaffModal && (
        <div 
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={() => setSelectedStaffModal(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900/95 backdrop-blur-2xl text-slate-100 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-yellow-400/30 relative animate-in zoom-in-95 duration-200 space-y-4"
          >
            {/* Top Navigation & Close */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePrevStaff(selectedStaffModal, setSelectedStaffModal)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition flex items-center gap-1 text-xs"
                  title="Guru/Staf Sebelumnya [←]"
                >
                  <ChevronLeft className="w-4 h-4 text-yellow-400" />
                  <span className="hidden sm:inline">Sebelum</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNextStaff(selectedStaffModal, setSelectedStaffModal)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition flex items-center gap-1 text-xs"
                  title="Guru/Staf Seterusnya [→]"
                >
                  <span className="hidden sm:inline">Seterusnya</span>
                  <ChevronRight className="w-4 h-4 text-yellow-400" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-yellow-300 bg-yellow-500/20 px-2.5 py-1 rounded-full border border-yellow-400/30 uppercase tracking-wide">
                  Kad Terperinci
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedStaffModal(null)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
                  title="Tutup [Esc]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Profile Info Header */}
            <div className="flex flex-col items-center text-center space-y-3 pt-1">
              {/* Photo with direct zoom */}
              <div
                onClick={() => {
                  setZoomedPhotoStaff(selectedStaffModal);
                  setZoomLevel(1);
                }}
                title="Klik untuk besarkan gambar penuh (Zoom In)"
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-yellow-400 p-1 shadow-2xl overflow-hidden flex items-center justify-center relative cursor-zoom-in group/cardphoto border-2 border-yellow-300"
              >
                {getStaffPhoto(selectedStaffModal) && getStaffPhoto(selectedStaffModal).trim() !== '' ? (
                  <img
                    src={getStaffPhoto(selectedStaffModal)}
                    alt={getStaffName(selectedStaffModal)}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="w-full h-full object-cover rounded-xl group-hover/cardphoto:scale-110 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-yellow-300">
                    <UserCheck className="w-12 h-12 opacity-70" />
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/cardphoto:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-xl gap-1 backdrop-blur-[1px]">
                  <ZoomIn className="w-6 h-6 text-yellow-400" />
                  <span className="text-[10px] font-black text-white bg-blue-950/90 px-2 py-0.5 rounded-md shadow">
                    Besarkan Foto
                  </span>
                </div>
              </div>

              {/* Direct Zoom In Button */}
              <button
                type="button"
                onClick={() => {
                  setZoomedPhotoStaff(selectedStaffModal);
                  setZoomLevel(1);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs shadow-md shadow-yellow-400/20 transition transform hover:scale-105"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Besarkan Gambar (Zoom In)</span>
              </button>

              <div>
                <span className="px-2.5 py-0.5 bg-blue-950 text-yellow-300 font-black rounded-md text-[10px] uppercase border border-white/20">
                  {selectedStaffModal.position.toLowerCase().includes('guru besar') ? 'DG48' : selectedStaffModal.grade}
                </span>
                <h3 className="font-extrabold text-base sm:text-lg text-white mt-1.5">
                  {getStaffName(selectedStaffModal)}
                </h3>
                <p className="text-xs text-yellow-400 font-bold mt-0.5">
                  {getStaffPosition(selectedStaffModal)}
                </p>
              </div>

              {/* Detail fields */}
              <div className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-left space-y-2.5 text-xs">
                {selectedStaffModal.subject && (
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <BookOpen className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span><strong>Subjek / Peranan:</strong> {selectedStaffModal.subject}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-2 text-slate-200">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span className="truncate"><strong>E-mel:</strong> {selectedStaffModal.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedStaffModal.email);
                      alert('E-mel DELIMa telah disalin!');
                    }}
                    className="p-1 text-slate-400 hover:text-yellow-400 rounded transition"
                    title="Salin E-mel"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                {selectedStaffModal.phone && (
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <Phone className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span><strong>No. Telefon:</strong> {selectedStaffModal.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Keyboard Guide */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
              <span>Gunakan anak panah [← / →] untuk bertukar staf</span>
              <button
                type="button"
                onClick={() => setSelectedStaffModal(null)}
                className="hover:text-white transition font-medium"
              >
                Tutup [Esc]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Photo Zoom Lightbox (Besarkan Gambar Guru & Staf) */}
      {zoomedPhotoStaff && (
        <div
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[70] flex flex-col items-center justify-between p-3 sm:p-6 animate-fadeIn select-none"
          onClick={() => {
            setZoomedPhotoStaff(null);
            setZoomLevel(1);
          }}
        >
          {/* Top Bar Controls */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl flex items-center justify-between gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 shadow-xl text-white z-10"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold truncate text-white">
                  {getStaffName(zoomedPhotoStaff)}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-yellow-400 font-semibold truncate">
                  {getStaffPosition(zoomedPhotoStaff)} • {zoomedPhotoStaff.position.toLowerCase().includes('guru besar') ? 'DG48' : zoomedPhotoStaff.grade}
                </p>
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))}
                disabled={zoomLevel <= 0.75}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 disabled:opacity-40 disabled:pointer-events-none text-slate-200 transition"
                title="Perkecil Zoom (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono font-bold text-yellow-300 min-w-12 text-center bg-blue-950/60 px-2 py-1 rounded-lg border border-yellow-400/30">
                {Math.round(zoomLevel * 100)}%
              </span>

              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                disabled={zoomLevel >= 3}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 disabled:opacity-40 disabled:pointer-events-none text-slate-200 transition"
                title="Perbesar Zoom (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 text-xs font-semibold transition hidden sm:inline-flex items-center gap-1"
                title="Set Semula (100%)"
              >
                <RotateCcw className="w-3 h-3 text-yellow-400" />
                <span>100%</span>
              </button>

              <div className="w-px h-5 bg-white/20 mx-1" />

              <button
                type="button"
                onClick={() => {
                  setZoomedPhotoStaff(null);
                  setZoomLevel(1);
                }}
                className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white transition"
                title="Tutup Paparan Zoom [Esc]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Photo Display Stage */}
          <div
            className="flex-1 w-full max-w-5xl flex items-center justify-between gap-2 sm:gap-4 my-auto relative overflow-hidden py-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Staff Button */}
            <button
              type="button"
              onClick={() => handlePrevStaff(zoomedPhotoStaff, setZoomedPhotoStaff)}
              className="p-3 sm:p-4 rounded-2xl bg-white/10 hover:bg-yellow-400 hover:text-blue-950 text-white backdrop-blur-md border border-white/20 transition shadow-2xl flex-shrink-0 z-20 group"
              title="Foto Guru/Staf Sebelumnya [←]"
            >
              <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition" />
            </button>

            {/* Central Zoomed Photo Viewport */}
            <div className="flex-1 flex items-center justify-center overflow-auto max-h-[70vh] sm:max-h-[76vh] p-2">
              <div
                onClick={() => setZoomLevel((z) => (z === 1 ? 1.75 : 1))}
                className="relative rounded-3xl bg-yellow-400 p-1.5 shadow-2xl border-4 border-yellow-300 max-w-full overflow-hidden transition-transform duration-200 cursor-zoom-in"
                title="Klik gambar untuk perbesar / perkecil"
              >
                {getStaffPhoto(zoomedPhotoStaff) && getStaffPhoto(zoomedPhotoStaff).trim() !== '' ? (
                  <img
                    src={getStaffPhoto(zoomedPhotoStaff)}
                    alt={getStaffName(zoomedPhotoStaff)}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    style={{ transform: `scale(${zoomLevel})` }}
                    className="max-h-[58vh] sm:max-h-[66vh] w-auto max-w-[85vw] sm:max-w-[70vw] object-contain rounded-2xl transition-transform duration-200 select-none shadow-inner"
                  />
                ) : (
                  <div className="w-72 h-72 sm:w-80 sm:h-80 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-yellow-300 p-6 text-center">
                    <UserCheck className="w-20 h-20 opacity-70 mb-3" />
                    <h5 className="font-bold text-sm text-white">{getStaffName(zoomedPhotoStaff)}</h5>
                    <p className="text-xs text-yellow-400 mt-1">{getStaffPosition(zoomedPhotoStaff)}</p>
                    <span className="text-[10px] text-slate-400 mt-3">Tiada foto berasingan dimuat naik</span>
                  </div>
                )}
              </div>
            </div>

            {/* Next Staff Button */}
            <button
              type="button"
              onClick={() => handleNextStaff(zoomedPhotoStaff, setZoomedPhotoStaff)}
              className="p-3 sm:p-4 rounded-2xl bg-white/10 hover:bg-yellow-400 hover:text-blue-950 text-white backdrop-blur-md border border-white/20 transition shadow-2xl flex-shrink-0 z-20 group"
              title="Foto Guru/Staf Seterusnya [→]"
            >
              <ChevronRight className="w-6 h-6 group-hover:scale-110 transition" />
            </button>
          </div>

          {/* Bottom Toolbar & Shortcuts */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/15 shadow-xl text-xs text-slate-200 z-10"
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const staff = zoomedPhotoStaff;
                  setZoomedPhotoStaff(null);
                  setSelectedStaffModal(staff);
                }}
                className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-md"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Lihat Kad Maklumat Penuh</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-300 flex items-center gap-3">
              <span>💡 Tip: [← / →] Tukar Guru • [+/-] Zoom • [Esc] Tutup</span>
              <button
                type="button"
                onClick={() => {
                  setZoomedPhotoStaff(null);
                  setZoomLevel(1);
                }}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

