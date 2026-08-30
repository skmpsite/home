import React, { useState, useEffect } from 'react';
import {
  Flame,
  CheckCircle2,
  AlertCircle,
  Database,
  Cloud,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Radio,
  ExternalLink,
  Sparkles,
  HelpCircle,
  UploadCloud
} from 'lucide-react';
import {
  getSavedFirebaseConfig,
  saveFirebaseConfig,
  isFirebaseEnabled,
  setFirebaseEnabled,
  getFirebaseDb,
  FirebaseCustomConfig,
  DEFAULT_FIREBASE_CONFIG
} from '../../utils/firebaseSync';
import { syncAllDataToFirestore } from '../../utils/firebaseRealtime';
import {
  SchoolProfile,
  Staff,
  NewsItem,
  CalendarEvent,
  GalleryItem,
  AwardItem,
  DownloadDocument,
  FeedbackEntry,
  PibgActivity,
  PibgCommittee,
  CoCurriculumUnit,
  SignageSlide,
  SignageConfig,
  HemData,
  NavigationMenuItem,
  TeacherLinkItem
} from '../../types';

interface FirebaseManagerProps {
  showToast: (msg: string) => void;
  onFirebaseStatusChange?: (enabled: boolean) => void;
  allData?: {
    profile?: SchoolProfile;
    staffList?: Staff[];
    newsList?: NewsItem[];
    events?: CalendarEvent[];
    gallery?: GalleryItem[];
    awards?: AwardItem[];
    documents?: DownloadDocument[];
    hemData?: HemData;
    pibgActivities?: PibgActivity[];
    pibgCommittee?: PibgCommittee[];
    cocurriculum?: CoCurriculumUnit[];
    signageSlides?: SignageSlide[];
    signageConfig?: SignageConfig;
    navigationMenu?: NavigationMenuItem[];
    teacherLinks?: TeacherLinkItem[];
  };
}

export const FirebaseManager: React.FC<FirebaseManagerProps> = ({
  showToast,
  onFirebaseStatusChange,
  allData
}) => {
  const [config, setConfig] = useState<FirebaseCustomConfig>(getSavedFirebaseConfig());
  const [enabled, setEnabled] = useState(isFirebaseEnabled());
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedRules, setCopiedRules] = useState(false);

  useEffect(() => {
    const saved = getSavedFirebaseConfig();
    if (saved) {
      setConfig(saved);
    }
    setEnabled(isFirebaseEnabled());
    // Auto-test on load
    testConnection();
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.projectId.trim() || !config.apiKey.trim()) {
      showToast('Sila masukkan sekurang-kurangnya Project ID dan API Key Firebase!');
      return;
    }

    saveFirebaseConfig(config);
    setFirebaseEnabled(true);
    setEnabled(true);
    if (onFirebaseStatusChange) {
      onFirebaseStatusChange(true);
    }
    showToast('Konfigurasi Firebase Firestore berjaya disimpan & diaktifkan!');
    testConnection();
  };

  const handleToggleEnabled = (newVal: boolean) => {
    setFirebaseEnabled(newVal);
    setEnabled(newVal);
    if (onFirebaseStatusChange) {
      onFirebaseStatusChange(newVal);
    }
    showToast(newVal ? 'Firebase Firestore diaktifkan!' : 'Firebase dinonaktifkan.');
  };

  const testConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus('idle');
    setErrorMessage('');

    try {
      const db = getFirebaseDb();
      if (!db) {
        throw new Error('Gagal memulakan Firebase App. Semak Project ID & API Key.');
      }
      
      const { collection, getDocs, limit, query } = await import('firebase/firestore');
      const testQuery = query(collection(db, 'school_data'), limit(1));
      await getDocs(testQuery);

      setConnectionStatus('success');
      showToast('Sambungan ke Google Firebase Firestore BERJAYA & AKTIF!');
    } catch (err: any) {
      console.error('Firebase test error:', err);
      setConnectionStatus('failed');
      setErrorMessage(err?.message || 'Ralat sambungan atau Rules Firestore belum dibuka untuk bacaan.');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSyncAllData = async () => {
    if (!allData) {
      showToast('Data sekolah sedang disediakan...');
      return;
    }
    setSyncingAll(true);
    try {
      await syncAllDataToFirestore(allData);
      showToast('Semua data sekolah (Profil, Warga Sekolah, HEM, Berita, Takwim dsb.) berjaya dihantar ke Firebase Firestore!');
      setConnectionStatus('success');
    } catch (err: any) {
      console.error('Error in bulk sync:', err);
      showToast('Gagal memuat naik semua data ke Firebase. Semak Rules di Firebase Console.');
    } finally {
      setSyncingAll(false);
    }
  };

  const firestoreRulesSample = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Membenarkan semua pelawat membaca maklumat sekolah (Read public)
    // Membenarkan kemas kini daripada portal pentadbir
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  const copyRules = () => {
    navigator.clipboard.writeText(firestoreRulesSample);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 3000);
    showToast('Firestore Rules disalin ke papan keratan!');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-200" />
                Google Cloud Firestore (sk-merbau-pulas-db)
              </span>
              {enabled && connectionStatus === 'success' && (
                <span className="bg-emerald-400 text-emerald-950 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  Langsung (Live)
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Penyegerakan Google Firebase (Masa Nyata)
            </h2>
            <p className="text-white/90 text-sm md:text-base max-w-2xl">
              Pangkalan data aplikasi kini disambungkan ke projek Firebase **{config.projectId}**. Sebarang pengemaskinian di peranti anda akan terus terpapar di telefon atau komputer guru lain dalam masa nyata.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleSyncAllData}
              disabled={syncingAll || !config.projectId}
              className="px-4 py-2.5 bg-yellow-400 text-slate-900 font-bold rounded-xl hover:bg-yellow-300 transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
              title="Hantar semua data semasa ke pangkalan data Firestore"
            >
              <UploadCloud className={`w-4 h-4 ${syncingAll ? 'animate-bounce' : ''}`} />
              {syncingAll ? 'Memuat Naik...' : 'Segerak Semua ke Firebase'}
            </button>

            <button
              type="button"
              onClick={testConnection}
              disabled={testingConnection || !config.projectId}
              className="px-4 py-2.5 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${testingConnection ? 'animate-spin' : ''}`} />
              {testingConnection ? 'Menguji...' : 'Uji Sambungan'}
            </button>
          </div>
        </div>
      </div>

      {/* Connection Status Box */}
      {connectionStatus === 'success' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-emerald-900">Firestore Berjaya Disambungkan & Aktif!</h4>
            <p className="text-xs text-emerald-700">
              Projek <strong>{config.projectId}</strong> bersambung dengan lancar. Anda boleh menekan butang <strong>"Segerak Semua ke Firebase"</strong> di atas untuk memuat naik semua data sedia ada (termasuk Penolong Kanan Pentadbiran, Guru, Berita, Acara, HEM) ke Firestore sekarang.
            </p>
          </div>
        </div>
      )}

      {connectionStatus === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-red-900">Status Sambungan Firestore</h4>
            <p className="text-xs text-red-700">{errorMessage}</p>
            <p className="text-xs text-red-600 font-medium">
              Sila pastikan tab <strong>Rules</strong> di Firebase Console mengandungi <code>allow read, write: if true;</code> dan butang <strong>Publish</strong> telah ditekan.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Configuration (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Database className="w-5 h-5 text-orange-500" />
                Tetapan Konfigurasi Firebase
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Konfigurasi rasmi projek Firebase SK Merbau Pulas.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => handleToggleEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              <span className="ml-2 text-xs font-semibold text-slate-700">
                {enabled ? 'Aktif' : 'Nyahaktif'}
              </span>
            </label>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Firebase Project ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="sk-merbau-pulas-db"
                  value={config.projectId}
                  onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Firebase API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="AIzaSy..."
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Auth Domain
                </label>
                <input
                  type="text"
                  placeholder="sk-merbau-pulas-db.firebaseapp.com"
                  value={config.authDomain}
                  onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  App ID
                </label>
                <input
                  type="text"
                  placeholder="1:683640600208:web:..."
                  value={config.appId || ''}
                  onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Storage Bucket
                </label>
                <input
                  type="text"
                  placeholder="sk-merbau-pulas-db.firebasestorage.app"
                  value={config.storageBucket || ''}
                  onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Messaging Sender ID
                </label>
                <input
                  type="text"
                  placeholder="683640600208"
                  value={config.messagingSenderId || ''}
                  onChange={(e) => setConfig({ ...config, messagingSenderId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition shadow-md flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Simpan & Kemas Kini Firebase
              </button>
            </div>
          </form>
        </div>

        {/* Setup Guide (1 Col) */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
          <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-orange-500" />
            Panduan Firestore Rules
          </h4>

          <p className="text-xs text-slate-600 leading-relaxed">
            Pastikan anda telah menetapkan <strong>Security Rules</strong> berikut di Firebase Console (tab Rules) supaya semua peranti boleh membaca data sekolah:
          </p>

          <div className="bg-slate-900 rounded-xl p-3 relative text-slate-200 text-[11px] font-mono leading-tight overflow-x-auto">
            <pre>{firestoreRulesSample}</pre>
            <button
              type="button"
              onClick={copyRules}
              className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition border border-slate-700"
              title="Salin Kod Rules"
            >
              {copiedRules ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
            <p className="font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Penyegerakan Segera:
            </p>
            <p>
              Selepas menekan butang <strong>"Segerak Semua ke Firebase"</strong>, data akan tersedia di awan dan boleh dilihat oleh semua guru dan ibu bapa serta-merta!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

