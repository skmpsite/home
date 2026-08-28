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
  HelpCircle
} from 'lucide-react';
import {
  getSavedFirebaseConfig,
  saveFirebaseConfig,
  isFirebaseEnabled,
  setFirebaseEnabled,
  getFirebaseDb,
  FirebaseCustomConfig
} from '../../utils/firebaseSync';

interface FirebaseManagerProps {
  showToast: (msg: string) => void;
  onFirebaseStatusChange?: (enabled: boolean) => void;
}

export const FirebaseManager: React.FC<FirebaseManagerProps> = ({
  showToast,
  onFirebaseStatusChange
}) => {
  const [config, setConfig] = useState<FirebaseCustomConfig>({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });

  const [enabled, setEnabled] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedRules, setCopiedRules] = useState(false);

  useEffect(() => {
    const saved = getSavedFirebaseConfig();
    if (saved) {
      setConfig(saved);
    }
    setEnabled(isFirebaseEnabled());
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
    showToast(newVal ? 'Firebase Firestore diaktifkan!' : 'Firebase dinonaktifkan (kembali ke mod tempatan/Google Sheets).');
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
      
      // Try to read Firestore collection list or check connection
      const { collection, getDocs, limit, query } = await import('firebase/firestore');
      const testQuery = query(collection(db, 'school_profile'), limit(1));
      await getDocs(testQuery);

      setConnectionStatus('success');
      showToast('Sambungan ke Google Firebase Firestore BERJAYA & AKTIF!');
    } catch (err: any) {
      console.error('Firebase test error:', err);
      setConnectionStatus('failed');
      setErrorMessage(err?.message || 'Ralat sambungan atau Rules Firestore belum dibuka untuk bacaan.');
      showToast('Gagal menyambung ke Firestore. Semak Rules & tetapan.');
    } finally {
      setTestingConnection(false);
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
                Google Cloud Firestore
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
              Tukar pangkalan data aplikasi ke **Google Firebase Firestore** untuk menyegerakkan sebarang perubahan data (Penolong Kanan, Guru, Berita, Acara, HEM) ke semua peranti & telefon ibu bapa secara automatik dan serta-merta tanpa perlu muat semula.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={testConnection}
              disabled={testingConnection || !config.projectId}
              className="px-4 py-2.5 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${testingConnection ? 'animate-spin' : ''}`} />
              {testingConnection ? 'Menguji Sambungan...' : 'Uji Sambungan'}
            </button>
          </div>
        </div>
      </div>

      {/* Connection Status Box */}
      {connectionStatus === 'success' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-emerald-900">Firestore Berjaya Disambungkan!</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Aplikasi kini disegerakkan secara langsung dengan projek Firebase **{config.projectId}**. Sebarang kemas kini di portal admin akan terus terpapar di telefon atau komputer pengguna lain.
            </p>
          </div>
        </div>
      )}

      {connectionStatus === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-red-900">Gagal Menyambung ke Firestore</h4>
            <p className="text-xs text-red-700">{errorMessage}</p>
            <p className="text-xs text-red-600 font-medium">
              Petua: Pastikan anda telah mencipta pangkalan data Firestore di Konsol Firebase dan menetapkan **Rules** membenarkan bacaan.
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
                Dapatkan maklumat ini daripada Firebase Console &gt; Project Settings &gt; General &gt; Your apps &gt; SDK setup and configuration.
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
                  placeholder="contoh: sk-merbau-pulas-db"
                  value={config.projectId}
                  onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Firebase API Key <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="contoh: AIzaSyDxxxxxxxxx"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Auth Domain (Pilihan)
                </label>
                <input
                  type="text"
                  placeholder="contoh: sk-merbau-pulas-db.firebaseapp.com"
                  value={config.authDomain}
                  onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  App ID (Pilihan)
                </label>
                <input
                  type="text"
                  placeholder="contoh: 1:1234567890:web:abcdef123456"
                  value={config.appId || ''}
                  onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Storage Bucket (Pilihan)
                </label>
                <input
                  type="text"
                  placeholder="contoh: sk-merbau-pulas-db.appspot.com"
                  value={config.storageBucket || ''}
                  onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Messaging Sender ID (Pilihan)
                </label>
                <input
                  type="text"
                  placeholder="contoh: 1234567890"
                  value={config.messagingSenderId || ''}
                  onChange={(e) => setConfig({ ...config, messagingSenderId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition shadow-md flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Simpan & Aktifkan Firebase
              </button>
            </div>
          </form>
        </div>

        {/* Setup Guide (1 Col) */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
          <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-orange-500" />
            Panduan Pantas Firebase (Percuma)
          </h4>

          <ol className="space-y-3 text-xs text-slate-600 list-decimal list-inside leading-relaxed">
            <li>
              Buka <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-orange-600 font-semibold hover:underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3" /></a> menggunakan akaun Google/KPM anda.
            </li>
            <li>
              Klik **Add Project**, namakan projek (cth: <code>sk-merbau-pulas</code>).
            </li>
            <li>
              Di menu tepi, klik **Build &gt; Firestore Database**, kemudian klik **Create Database**.
            </li>
            <li>
              Pilih lokasi (cth: <code>asia-southeast1</code> atau <code>asia-east1</code>) dan pilih mod permulaan.
            </li>
            <li>
              Di bahagian **Rules**, masukkan peraturan akses berikut:
            </li>
          </ol>

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
              Kelebihan Firebase Firestore:
            </p>
            <p>
              Perubahan maklumat Penolong Kanan Pentadbiran atau Staf akan terus keluar di skrin pelawat lain dalam masa kurang daripada 1 saat tanpa perlu reload!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
