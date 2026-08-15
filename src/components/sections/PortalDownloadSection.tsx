import React, { useState } from 'react';
import { DownloadDocument, SystemLink, PibgActivity, PibgCommittee } from '../../types';
import { initialSchoolProfile } from '../../data/initialData';
import {
  Download,
  ExternalLink,
  FileText,
  Search,
  Users,
  CheckCircle2,
  Heart,
  Globe,
  BookOpen,
  UserCheck,
  BarChart3,
  FileSpreadsheet,
  Building2,
  Sparkles,
  DollarSign
} from 'lucide-react';

interface PortalDownloadSectionProps {
  documents: DownloadDocument[];
  systemLinks: SystemLink[];
  pibgActivities: PibgActivity[];
  pibgCommittee: PibgCommittee[];
}

export const PortalDownloadSection: React.FC<PortalDownloadSectionProps> = ({
  documents,
  systemLinks,
  pibgActivities,
  pibgCommittee
}) => {
  const [activeTab, setActiveTab] = useState<'sistem' | 'dokumen' | 'pibg'>('sistem');
  const [docSearch, setDocSearch] = useState('');
  const [docCategory, setDocCategory] = useState<string>('semua');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const filteredDocs = documents.filter((d) => {
    const matchesCat = docCategory === 'semua' || d.category === docCategory;
    const matchesSearch =
      d.title.toLowerCase().includes(docSearch.toLowerCase()) ||
      d.description.toLowerCase().includes(docSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSimulateDownload = (doc: DownloadDocument) => {
    // Generate simulated download file blob
    const content = `SEKOLAH KEBANGSAAN MERBAU PULAS (KBA5012)\n====================================\nDOKUMEN RASMI: ${doc.title}\nKategori: ${doc.category}\nTarikh: ${doc.date}\nPenerangan: ${doc.description}\n\nDokumen ini disahkan oleh Pentadbiran SK Merbau Pulas.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, '_')}.${doc.fileType.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadToast(`Memuat turun: ${doc.title}`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Banner */}
      <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-xs border border-yellow-400/30 mb-2">
          <Download className="w-3.5 h-3.5 text-yellow-400" />
          <span>Integrasi & Dokumen</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Portal Integrasi, Muat Turun, & PIBG</h2>
        <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
          Akses pantas ke portal Kementerian Pendidikan (DELIMa, APDM, idMe), Pusat Muat Turun borang rasmi, dan Sudut Maklumat PIBG SKMP.
        </p>
      </div>

      {/* Section Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('sistem')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'sistem'
              ? 'bg-yellow-400 text-blue-950 font-black shadow-lg shadow-yellow-400/20'
              : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
          }`}
        >
          <Globe className="w-4 h-4 text-yellow-400" />
          <span>Pautan Sistem Rasmi KPM</span>
        </button>

        <button
          onClick={() => setActiveTab('dokumen')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'dokumen'
              ? 'bg-yellow-400 text-blue-950 font-black shadow-lg shadow-yellow-400/20'
              : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
          }`}
        >
          <FileText className="w-4 h-4 text-yellow-400" />
          <span>Pusat Muat Turun Dokumen</span>
        </button>

        <button
          onClick={() => setActiveTab('pibg')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'pibg'
              ? 'bg-yellow-400 text-blue-950 font-black shadow-lg shadow-yellow-400/20'
              : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
          }`}
        >
          <Users className="w-4 h-4 text-yellow-400" />
          <span>Sudut Portal Ibu Bapa / PIBG</span>
        </button>
      </div>

      {/* Toast Download Message */}
      {downloadToast && (
        <div className="p-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-yellow-300" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* TAB 1: PAUTAN SISTEM RASMI KPM */}
      {activeTab === 'sistem' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {systemLinks.map((sys) => (
            <div
              key={sys.id}
              className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg hover:shadow-xl transition flex flex-col justify-between space-y-4 group hover:border-yellow-400/50"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-blue-950 text-yellow-300 border border-white/20">
                    {sys.badge}
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-yellow-400 transition" />
                </div>

                <h3 className="font-extrabold text-base text-white group-hover:text-yellow-300 transition">
                  {sys.name}
                </h3>

                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  {sys.description}
                </p>
              </div>

              <a
                href={sys.url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition shadow"
              >
                <span>Buka Portal Rasmi</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-950" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: PUSAT MUAT TURUN DOKUMEN */}
      {activeTab === 'dokumen' && (
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 shadow-lg space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-white/10">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'semua', label: 'Semua Dokumen' },
                { id: 'borang', label: 'Borang Pendaftaran' },
                { id: 'kebenaran', label: 'Surat Kebenaran' },
                { id: 'takwim', label: 'Takwim' },
                { id: 'pibg', label: 'PIBG' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setDocCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    docCategory === c.id
                      ? 'bg-yellow-400 text-blue-950 font-black'
                      : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Doc Search */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari borang / fail..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-white/5 border border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              />
            </div>
          </div>

          {/* Document Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-white font-bold border-b border-white/10">
                  <th className="p-3.5 rounded-tl-xl">Tajuk Dokumen</th>
                  <th className="p-3.5">Kategori</th>
                  <th className="p-3.5">Jenis / Saiz</th>
                  <th className="p-3.5">Tarikh</th>
                  <th className="p-3.5 rounded-tr-xl text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-200">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/5 transition">
                    <td className="p-3.5 font-bold text-white max-w-xs">
                      <div>{doc.title}</div>
                      <div className="text-[11px] font-normal text-slate-300 line-clamp-1">
                        {doc.description}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 font-bold rounded uppercase text-[10px] border border-yellow-400/30">
                        {doc.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] font-semibold text-slate-300">
                      {doc.fileType} ({doc.fileSize})
                    </td>
                    <td className="p-3.5 text-slate-300">{doc.date}</td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleSimulateDownload(doc)}
                        className="px-3.5 py-2 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs inline-flex items-center gap-1.5 shadow transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Muat Turun</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PORTAL IBU BAPA / PIBG */}
      {activeTab === 'pibg' && (
        <div className="space-y-8">
          {/* PIBG Intro Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 shadow-lg space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-blue-950 font-bold shadow">
                <Users className="w-6 h-6 text-blue-950" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  Persatuan Ibu Bapa dan Guru (PIBG) SK Merbau Pulas
                </h3>
                <p className="text-xs text-slate-200">
                  Wadah perpaduan, kerjasama, dan pemangkin kecemerlangan pendidikan anak-anak SKMP.
                </p>
              </div>
            </div>
          </div>

          {/* Committee Grid */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-lg text-white border-b border-white/10 pb-2">
              Barisan Jawatankuasa PIBG Sesi 2026/2027
            </h4>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {pibgCommittee.map((comm) => (
                <div
                  key={comm.id}
                  className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-lg text-center flex flex-col items-center space-y-2"
                >
                  <div className="w-20 h-20 rounded-2xl bg-yellow-400 p-0.5 shadow overflow-hidden">
                    <img
                      src={
                        comm.position.toLowerCase().includes('penasihat') ||
                        comm.position.toLowerCase().includes('guru besar') ||
                        comm.name.toLowerCase().includes('norhafiza')
                          ? comm.photoUrl || initialSchoolProfile.principalPhotoUrl || ''
                          : comm.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(comm.name)}&background=0284c7&color=fff`
                      }
                      alt={comm.name}
                      onError={(e) => {
                        if (
                          comm.position.toLowerCase().includes('penasihat') ||
                          comm.position.toLowerCase().includes('guru besar') ||
                          comm.name.toLowerCase().includes('norhafiza')
                        ) {
                          e.currentTarget.src = initialSchoolProfile.principalPhotoUrl || '';
                        } else {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comm.name)}&background=0284c7&color=fff`;
                        }
                      }}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-950 text-yellow-300 rounded border border-white/20">
                    {comm.category === 'ibu_bapa' ? 'Wakil Ibu Bapa' : 'Wakil Guru'}
                  </span>
                  <h5 className="font-extrabold text-xs text-white">{comm.name}</h5>
                  <p className="text-xs text-yellow-400 font-bold">{comm.position}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PIBG Activities List */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-lg text-white border-b border-white/10 pb-2">
              Aktiviti & Sumbangan PIBG Terkini
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              {pibgActivities.map((act) => (
                <div
                  key={act.id}
                  className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded border border-yellow-400/30">
                      {act.type}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">{act.date}</span>
                  </div>
                  <h5 className="font-extrabold text-sm text-white">{act.title}</h5>
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">{act.description}</p>
                  <div className="pt-2 text-[11px] font-bold text-yellow-400">
                    Penganjur: {act.organizer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
