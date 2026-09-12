import React, { useState } from 'react';
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
  School,
  Eye,
  RefreshCw,
  Wifi
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
import { useSyncedData, useSyncStatus, SYNC_KEYS } from '../../utils/universalSync';

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

  const { connected, forceSync } = useSyncStatus();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tabs:
  // 1. rph = Rancangan Perkhidmatan Harian (RPH GBK) / e-BRPBK
  // 2. rpt = Rancangan Perkhidmatan Tahunan (RPT GBK) 4 Fokus
  // 3. sesi = Rekod & Laporan Sesi Kaunseling & Psikometrik
  // 4. pbppp = Instrumen Penilaian PBPPP Khas GBK
  // 5. aktiviti = Aktiviti & Evidens Program
  // 6. tugas = Senarai Tugas GBKSM & 4 Fokus KPM
  const [activeTab, setActiveTab] = useState<'rph' | 'rpt' | 'sesi' | 'pbppp' | 'aktiviti' | 'tugas'>('rph');

  // 1. RPH GBK State (Segerak Automatik Silang Semua Peranti)
  const [rphList, setRphList] = useSyncedData<UbkRphItem[]>(SYNC_KEYS.UBK_RPH, initialUbkRph);

  // 2. RPT GBK State
  const [rptList, setRptList] = useSyncedData<UbkRptItem[]>(SYNC_KEYS.UBK_RPT, initialUbkRpt);

  // 3. Counseling Sessions & Psychometrics State
  const [counselingSessions, setCounselingSessions] = useSyncedData<UbkCounselingSessionItem[]>(
    SYNC_KEYS.UBK_SESSIONS,
    initialUbkCounselingSessions
  );

  // 4. PBPPP Assessment State
  const [pbpppAssessment, setPbpppAssessment] = useSyncedData<UbkPbpppAssessment>(
    SYNC_KEYS.UBK_PBPPP,
    initialUbkPbppp
  );

  // 5. Activities State
  const [activities, setActivities] = useSyncedData<UbkActivityItem[]>(
    SYNC_KEYS.UBK_ACTIVITIES,
    initialUbkActivities
  );

  // 6. Duties List
  const [duties] = useState<UbkDutyItem[]>(initialUbkDuties);

  // Printing State
  const [printItem, setPrintItem] = useState<UbkRphItem | null>(null);

  // Persistence Handlers (Automatik tolak ke pelayan & semua peranti lain)
  const handleSaveRphList = (updated: UbkRphItem[]) => {
    setRphList(updated);
  };

  const handleSaveRptList = (updated: UbkRptItem[]) => {
    setRptList(updated);
  };

  const handleSaveSessions = (updated: UbkCounselingSessionItem[]) => {
    setCounselingSessions(updated);
  };

  const handleSavePbppp = (updated: UbkPbpppAssessment) => {
    setPbpppAssessment(updated);
  };

  const handleSaveActivities = (updated: UbkActivityItem[]) => {
    setActivities(updated);
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await forceSync();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
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

              {/* Status Segerak Masa Nyata (Live Cross-Device Indicator) */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px]">Segerak Masa Nyata Semua Peranti (Aktif)</span>
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  title="Segerakkan data terkini dari pelayan sekarang"
                  className="ml-1 p-0.5 hover:text-white transition active:scale-90 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {canEdit ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Akses Edit Aktif: {userRole === 'kaunselor' ? 'Guru Kaunselor (UBK)' : userRole === 'guru_besar' ? 'Guru Besar' : 'Pentadbir Sekolah'}
                </span>
              ) : userRole === 'guru' ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-sky-500/15 text-sky-300 border border-sky-400/30">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  Mod Rujukan Guru (Paparan Sahaja — Hak Edit Khas Kaunselor UBK)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-300 border border-white/15">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Mod Rujukan (Log Masuk Kaunselor UBK untuk Edit)
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
              serta Instrumen Penilaian PBPPP Khas GBK. Disegerakkan secara automatik merentasi semua peranti
              (Guru Besar, PK HEM & Kaunselor).
            </p>
          </div>

          {!canEdit && onOpenLogin && (
            <div className="shrink-0">
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-teal-950/60 border border-teal-300/40 flex items-center gap-2 transition active:scale-95 cursor-pointer"
                title="Log masuk untuk Guru Kaunselor (UBK) atau Pentadbir"
              >
                <Lock className="w-4 h-4 text-yellow-300" />
                <span>Log Masuk Kaunselor / Pentadbir</span>
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
