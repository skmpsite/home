import React, { useState } from 'react';
import { Staff } from '../../types';
import { Users, Mail, Phone, BookOpen, ShieldCheck, X, Search, UserCheck } from 'lucide-react';

interface OrganizationSectionProps {
  staffList: Staff[];
}

export const OrganizationSection: React.FC<OrganizationSectionProps> = ({ staffList }) => {
  const [selectedCategory, setSelectedCategory] = useState<'semua' | 'pentadbir' | 'guru' | 'staf'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaffModal, setSelectedStaffModal] = useState<Staff | null>(null);

  const administrators = staffList.filter((s) => s.category === 'pentadbir');
  
  const filteredStaff = staffList.filter((s) => {
    const matchesCategory = selectedCategory === 'semua' || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.subject && s.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <ShieldCheck className="w-5 h-5 text-yellow-400" />
          <h3 className="text-xl font-black text-white">Barisan Pentadbir Utama Sekolah</h3>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {administrators.map((admin) => (
            <div
              key={admin.id}
              onClick={() => setSelectedStaffModal(admin)}
              className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-5 shadow-lg hover:shadow-xl transition text-center cursor-pointer group hover:border-yellow-400/50 flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-2xl bg-yellow-400 p-0.5 shadow-md overflow-hidden mb-3 border-2 border-yellow-300 group-hover:scale-105 transition">
                <img
                  src={admin.photoUrl}
                  alt={admin.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <span className="px-2.5 py-0.5 bg-blue-950 text-yellow-300 font-black rounded-md text-[10px] uppercase mb-2 border border-white/20">
                {admin.grade}
              </span>
              <h4 className="font-extrabold text-xs sm:text-sm text-white group-hover:text-yellow-300 transition line-clamp-1">
                {admin.name}
              </h4>
              <p className="text-xs text-yellow-400 font-bold mt-1 line-clamp-2">
                {admin.position}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* All Staff Directory with Filter & Search */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-yellow-400" />
            <h3 className="text-xl font-black text-white">Direktori Guru & Staf Sokongan</h3>
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
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              onClick={() => setSelectedStaffModal(staff)}
              className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 hover:border-yellow-400/50 transition cursor-pointer shadow-md group flex items-center gap-3.5"
            >
              <div className="w-14 h-14 rounded-xl bg-yellow-400 p-0.5 overflow-hidden flex-shrink-0 shadow-sm">
                <img
                  src={staff.photoUrl}
                  alt={staff.name}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition"
                />
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <span className="text-[10px] font-bold text-yellow-300 uppercase bg-yellow-500/20 px-1.5 py-0.2 rounded border border-yellow-400/30">
                  {staff.grade}
                </span>
                <h5 className="font-extrabold text-xs text-white group-hover:text-yellow-300 transition truncate">
                  {staff.name}
                </h5>
                <p className="text-[11px] text-slate-300 truncate font-medium">
                  {staff.position}
                </p>
                {staff.subject && (
                  <p className="text-[10px] text-yellow-400 font-semibold truncate">
                    📖 {staff.subject}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Detail Modal */}
      {selectedStaffModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/90 backdrop-blur-2xl text-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/20 relative">
            <button
              onClick={() => setSelectedStaffModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-24 h-24 rounded-2xl bg-yellow-400 p-1 shadow-lg overflow-hidden">
                <img
                  src={selectedStaffModal.photoUrl}
                  alt={selectedStaffModal.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <div>
                <span className="px-2.5 py-0.5 bg-blue-950 text-yellow-300 font-black rounded-md text-[10px] uppercase border border-white/20">
                  {selectedStaffModal.grade}
                </span>
                <h3 className="font-extrabold text-base text-white mt-2">
                  {selectedStaffModal.name}
                </h3>
                <p className="text-xs text-yellow-400 font-bold">
                  {selectedStaffModal.position}
                </p>
              </div>

              <div className="w-full bg-white/5 p-4 rounded-2xl border border-white/10 text-left space-y-2 text-xs">
                {selectedStaffModal.subject && (
                  <div className="flex items-center gap-2 text-slate-200">
                    <BookOpen className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span><strong>Subjek / Tugas:</strong> {selectedStaffModal.subject}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-200">
                  <Mail className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span><strong>E-mel DELIMa:</strong> {selectedStaffModal.email}</span>
                </div>
                {selectedStaffModal.phone && (
                  <div className="flex items-center gap-2 text-slate-200">
                    <Phone className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span><strong>No. Telefon:</strong> {selectedStaffModal.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
