import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  ShieldCheck,
  Users,
  Award,
  Sparkles,
  Lock,
  Target,
  FileLock2,
  Layers,
  ChevronRight,
  School
} from 'lucide-react';
import {
  UbkDutyItem,
  UbkActivityItem,
  UbkRphItem,
  UbkRptItem,
  UbkCounselingSessionItem,
  UbkPbpppAssessment,
  UserRole,
  canEditUbk
} from '../../types';
import {
  initialUbkDuties,
  initialUbkActivities,
  initialUbkRph,
  initialUbkRpt,
  initialUbkCounselingSessions,
  initialUbkPbppp
} from '../../data/initialUbkData';
import { UbkRphTab } from '../ubk/UbkRphTab';
import { UbkRptTab } from '../ubk/UbkRptTab';
import { UbkCounselingSessionsTab } from '../ubk/UbkCounselingSessionsTab';
import { UbkPbpppTab } from '../ubk/UbkPbpppTab';
import { UbkActivitiesTab } from '../ubk/UbkActivitiesTab';
import { UbkDutiesTab } from '../ubk/UbkDutiesTab';
import { UbkPrintModal } from '../ubk/UbkPrintModal';

interface HemUbkSubSectionProps {
  isAdmin?: boolean;
  userRole?: UserRole | null;
  onOpenLogin?: () => void;
}

export const HemUbkSubSection: React.FC<HemUbkSubSectionProps> = ({
  isAdmin = false,
  userRole = null,
  onOpenLogin
}) => {
  const canEdit = canEditUbk(userRole, isAdmin);
  const isPentadbir = Boolean(
    isAdmin || userRole === 'admin' || userRole === 'guru_besar' || userRole === 'pk_hem'
  );

  // Tabs:
  // 1. rph = Rancangan Perkhidmatan Harian (RPH GBK) / e-BRPBK
  // 2. rpt = Rancangan Perkhidmatan Tahunan (RPT GBK) 4 Fokus
  // 3. sesi = Rekod & Laporan Sesi Kaunseling & Psikometrik
  // 4. pbppp = Instrumen Penilaian PBPPP Khas GBK
  // 5. aktiviti = Aktiviti & Evidens Program
  // 6. tugas = Senarai Tugas GBKSM & 4 Fokus KPM
  const [activeTab, setActiveTab] = useState<'rph' | 'rpt' | 'sesi' | 'pbppp' | 'aktiviti' | 'tugas'>('rph');

  // 1. RPH GBK State
  const [rphList, setRphList] = useState<UbkRphItem[]>(() => {
    try {
      const saved = localStorage.getItem('skmp_ubk_rph');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialUbkRph;
  });

  // 2. RPT GBK State
  const [rptList, setRptList] = useState<UbkRptItem[]>(() => {
    try {
      const saved = localStorage.getItem('skmp_ubk_rpt');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialUbkRpt;
  });

  // 3. Counseling Sessions & Psychometrics State
  const [counselingSessions, setCounselingSessions] = useState<UbkCounselingSessionItem[]>(() => {
    try {
      const saved = localStorage.getItem('skmp_ubk_sessions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialUbkCounselingSessions;
  });

  // 4. PBPPP Assessment State
  const [pbpppAssessment, setPbpppAssessment] = useState<UbkPbpppAssessment>(() => {
    try {
      const saved = localStorage.getItem('skmp_ubk_pbppp');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialUbkPbppp;
  });

  // 5. Activities State
  const [activities, setActivities] = useState<UbkActivityItem[]>(() => {
    try {
      const saved = localStorage.getItem('skmp_ubk_activities');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialUbkActivities;
  });

  // 6. Duties List
  const [duties] = useState<UbkDutyItem[]>(initialUbkDuties);

  // Printing State
  const [printItem, setPrintItem] = useState<UbkRphItem | null>(null);

  // Persistence Handlers
  const handleSaveRphList = (updated: UbkRphItem[]) => {
    setRphList(updated);
    try {
      localStorage.setItem('skmp_ubk_rph', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveRptList = (updated: UbkRptItem[]) => {
    setRptList(updated);
    try {
      localStorage.setItem('skmp_ubk_rpt', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSessions = (updated: UbkCounselingSessionItem[]) => {
    setCounselingSessions(updated);
    try {
      localStorage.setItem('skmp_ubk_sessions', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePbppp = (updated: UbkPbpppAssessment) => {
    setPbpppAssessment(updated);
    try {
      localStorage.setItem('skmp_ubk_pbppp', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveActivities = (updated: UbkActivityItem[]) => {
    setActivities(updated);
    try {
      localStorage.setItem('skmp_ubk_activities', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Hero Header Harmonized with e-BRPBK Standards */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-teal-950 to-indigo-950 border border-teal-500/40 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-teal-500/20 text-teal-300 border border-teal-400/40">
                <HeartHandshake className="w-3.5 h-3.5 text-yellow-300" />
                Unit Bimbingan & Kaunseling (UBK) SK Merbau Pulas
              </span>

              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <BookOpen className="w-3.5 h-3.5" />
                e-BRPBK KPM (Pengganti RPH PdPC)
              </span>

              {canEdit ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Akses Edit Aktif: {userRole === 'kaunselor' ? 'Guru Kaunselor (UBK)' : 'Pentadbir Sekolah'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-300 border border-white/15">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Mod Rujukan Pentadbir & Guru (Paparan Sahaja)
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Buku Rekod Perkhidmatan Bimbingan & Kaunseling (e-BRPBK)
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Sistem pengurusan dokumentasi dan penilaian rasmi Guru Bimbingan dan Kaunseling (GBK)
              yang menggantikan RPH akademik biasa. Merangkumi 4 komponen utama KPM: Rancangan Perkhidmatan Harian
              (RPH GBK), Rancangan Perkhidmatan Tahunan (RPT GBK), Rekod Sesi Kaunseling & Pentaksiran Psikometrik,
              serta Instrumen Penilaian PBPPP Khas GBK.
            </p>
          </div>

          {!canEdit && onOpenLogin && (
            <div className="shrink-0">
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-teal-950/60 border border-teal-300/40 flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-yellow-300" />
                <span>Log Masuk Kaunselor / Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4 Pillars Stat Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-teal-500/20 text-xs space-y-1">
          <div className="text-teal-400 font-bold flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            1. RPH GBK (e-BRPBK)
          </div>
          <div className="text-xl font-black text-white">{rphList.length} Rekod</div>
          <div className="text-[11px] text-slate-400">
            {rphList.filter((r) => r.status === 'disemak').length} Disahkan Pentadbir
          </div>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-purple-500/20 text-xs space-y-1">
          <div className="text-purple-400 font-bold flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            2. RPT GBK (4 Fokus)
          </div>
          <div className="text-xl font-black text-white">{rptList.length} Strategi</div>
          <div className="text-[11px] text-slate-400">4 Teras Perkhidmatan KPM</div>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-indigo-500/20 text-xs space-y-1">
          <div className="text-indigo-400 font-bold flex items-center gap-1">
            <FileLock2 className="w-3.5 h-3.5" />
            3. Sesi & Psikometrik
          </div>
          <div className="text-xl font-black text-white">{counselingSessions.length} Sesi</div>
          <div className="text-[11px] text-slate-400">Akta 580 (SULIT)</div>
        </div>

        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-500/20 text-xs space-y-1">
          <div className="text-amber-400 font-bold flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            4. Skor PBPPP Khas GBK
          </div>
          <div className="text-xl font-black text-yellow-300">
            {pbpppAssessment.overallPercentage.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400">{pbpppAssessment.gradeLevel}</div>
        </div>
      </div>

      {/* Main Harmonized Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('rph')}
          className={`px-4 py-2.5 rounded-xl font-black transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'rph'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4 text-teal-300" />
          <span>1. RPH GBK (e-BRPBK)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/60 text-slate-200">
            {rphList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rpt')}
          className={`px-4 py-2.5 rounded-xl font-black transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'rpt'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Target className="w-4 h-4 text-purple-300" />
          <span>2. RPT GBK (Takwim 4 Fokus)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sesi')}
          className={`px-4 py-2.5 rounded-xl font-black transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'sesi'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileLock2 className="w-4 h-4 text-indigo-300" />
          <span>3. Sesi Kaunseling & Psikometrik</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/60 text-slate-200">
            {counselingSessions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pbppp')}
          className={`px-4 py-2.5 rounded-xl font-black transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'pbppp'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Award className="w-4 h-4 text-yellow-300" />
          <span>4. Instrumen PBPPP Khas GBK</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('aktiviti')}
          className={`px-4 py-2.5 rounded-xl font-black transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'aktiviti'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4 text-blue-300" />
          <span>Evidens Aktiviti</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/60 text-slate-200">
            {activities.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tugas')}
          className={`px-4 py-2.5 rounded-xl font-black transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'tugas'
              ? 'bg-slate-800 text-white shadow-md border border-white/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4 text-slate-300" />
          <span>Panduan Tugas</span>
        </button>
      </div>

      {/* Sub-Tab Contents */}
      {activeTab === 'rph' && (
        <UbkRphTab
          rphList={rphList}
          canEdit={canEdit}
          isPentadbir={isPentadbir}
          onSaveRphList={handleSaveRphList}
          onPrintItem={(item) => setPrintItem(item)}
        />
      )}

      {activeTab === 'rpt' && (
        <UbkRptTab
          rptList={rptList}
          canEdit={canEdit}
          onSaveRptList={handleSaveRptList}
        />
      )}

      {activeTab === 'sesi' && (
        <UbkCounselingSessionsTab
          sessions={counselingSessions}
          canEdit={canEdit}
          onSaveSessions={handleSaveSessions}
        />
      )}

      {activeTab === 'pbppp' && (
        <UbkPbpppTab
          assessment={pbpppAssessment}
          isPentadbir={isPentadbir}
          canEdit={canEdit}
          onSaveAssessment={handleSavePbppp}
        />
      )}

      {activeTab === 'aktiviti' && (
        <UbkActivitiesTab
          activities={activities}
          canEdit={canEdit}
          onSaveActivities={handleSaveActivities}
        />
      )}

      {activeTab === 'tugas' && <UbkDutiesTab duties={duties} />}

      {/* Printable Modal for e-BRPBK */}
      {printItem && (
        <UbkPrintModal item={printItem} onClose={() => setPrintItem(null)} />
      )}
    </div>
  );
};
