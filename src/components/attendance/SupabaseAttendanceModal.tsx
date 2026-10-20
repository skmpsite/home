import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  X,
  Server,
  Zap,
  ShieldCheck,
  HelpCircle,
  UploadCloud,
  FileCode2
} from 'lucide-react';
import { StudentAbsenceRecord } from '../../types';
import {
  getSupabaseAttendanceConfig,
  saveSupabaseAttendanceConfig,
  syncSupabaseConfigFromServer,
  testSupabaseAttendanceConnection,
  pushBulkAbsenceToSupabase,
  SUPABASE_ATTENDANCE_SQL_SCHEMA,
  DEFAULT_SUPABASE_TABLE,
  SupabaseAttendanceConfig
} from '../../utils/supabaseAttendance';

interface SupabaseAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  absenceRecords: StudentAbsenceRecord[];
  onSyncComplete?: (count: number) => void;
}

export const SupabaseAttendanceModal: React.FC<SupabaseAttendanceModalProps> = ({
  isOpen,
  onClose,
  absenceRecords,
  onSyncComplete
}) => {
  const [config, setConfig] = useState<SupabaseAttendanceConfig>({
    url: '',
    anonKey: '',
    tableName: DEFAULT_SUPABASE_TABLE,
    enabled: true
  });

  const [activeTab, setActiveTab] = useState<'config' | 'sql' | 'guide'>('config');
  const [testingStatus, setTestingStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [isPushingBulk, setIsPushingBulk] = useState<boolean>(false);
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [saveToast, setSaveToast] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseAttendanceConfig();
      setConfig(cfg);
      setTestingStatus('idle');
      setTestMessage('');
      setBulkStatus('');
      setSaveToast('');

      // Segerakkan dari pelayan jika pelayan menyimpan konfigurasi berpusat
      syncSupabaseConfigFromServer().then((srvCfg) => {
        if (srvCfg && srvCfg.url && srvCfg.anonKey) {
          setConfig(srvCfg);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!config.url || !config.anonKey) {
      setTestingStatus('error');
      setTestMessage('Sila masukkan Supabase Project URL dan Anon Public Key terlebih dahulu.');
      return;
    }

    setTestingStatus('testing');
    setTestMessage('Menghubungi pangkalan data Supabase...');

    const res = await testSupabaseAttendanceConnection(config.url, config.anonKey);
    if (res.success) {
      setTestingStatus('success');
      setTestMessage(res.message);
    } else {
      setTestingStatus('error');
      setTestMessage(res.message);
    }
  };

  const handleSave = () => {
    saveSupabaseAttendanceConfig(config);
    setSaveToast('Tetapan Supabase e-Kehadiran berjaya disimpan!');
    setTimeout(() => {
      setSaveToast('');
    }, 3000);
  };

  const handleCopySql = () => {
    try {
      navigator.clipboard.writeText(SUPABASE_ATTENDANCE_SQL_SCHEMA);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      // fallback
    }
  };

  const handlePushExistingRecords = async () => {
    if (!absenceRecords || absenceRecords.length === 0) {
      setBulkStatus('Tiada rekod ketidakhadiran untuk dimuat naik.');
      return;
    }

    setIsPushingBulk(true);
    setBulkStatus(`Memuat naik ${absenceRecords.length} rekod ke Supabase...`);

    const ok = await pushBulkAbsenceToSupabase(absenceRecords);
    setIsPushingBulk(false);

    if (ok) {
      setBulkStatus(`Berjaya! ${absenceRecords.length} rekod telah disegerakkan ke Supabase.`);
      if (onSyncComplete) onSyncComplete(absenceRecords.length);
    } else {
      setBulkStatus('Gagal memuat naik. Sila semak Project URL, Anon Key dan pastikan jadual telah dicipta via SQL.');
    }
  };

  const isConfigured = Boolean(config.url && config.anonKey && config.enabled);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950/80 border-b border-emerald-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Penyambung Supabase e-Kehadiran
                </h3>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isConfigured
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {isConfigured ? 'Aktif' : 'Belum Dikonfigurasi'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Backend pantas khusus untuk borang & rekod e-Kehadiran tanpa menjejaskan modul lain di laman web
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-slate-950/50 px-5 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 text-xs sm:text-sm font-black rounded-t-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'config'
                ? 'bg-emerald-500/20 text-emerald-300 border-t-2 border-emerald-400 border-x border-white/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Konfigurasi API</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 text-xs sm:text-sm font-black rounded-t-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-emerald-500/20 text-emerald-300 border-t-2 border-emerald-400 border-x border-white/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>Skrip SQL Schema</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 text-xs sm:text-sm font-black rounded-t-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-emerald-500/20 text-emerald-300 border-t-2 border-emerald-400 border-x border-white/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Langkah Demi Langkah</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <p className="font-bold text-white mb-0.5">Hanya Untuk Borang e-Kehadiran!</p>
                  Penyambung ini hanya berhubung terus dengan jadual <code className="text-emerald-300 font-mono">attendance_records</code> di Supabase. Bahagian lain di laman web (Maklumat Guru, Berita, RMT, UBK, Arkib, Profil) kekal 100% menggunakan sistem sedia ada tanpa sebarang perubahan.
                </div>
              </div>

              {/* Toggle Enable */}
              <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">Dayakan Supabase e-Kehadiran</div>
                  <div className="text-[11px] text-slate-400">Aktifkan penghantaran dan penyelarasan rekod ke Supabase</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Supabase URL */}
              <div>
                <label className="block text-xs font-black text-slate-300 mb-1">
                  Supabase Project URL:
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://xyzcompany.supabase.co"
                    value={config.url}
                    onChange={(e) => setConfig({ ...config, url: e.target.value })}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Didapati di Supabase Dashboard &rarr; <strong>Project Settings</strong> &rarr; <strong>API</strong> &rarr; <strong>Project URL</strong>
                </p>
              </div>

              {/* Supabase Anon Key */}
              <div>
                <label className="block text-xs font-black text-slate-300 mb-1">
                  Supabase Anon Public API Key:
                </label>
                <input
                  type="text"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={config.anonKey}
                  onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Kunci awam (anon / public key). Selamat untuk diletakkan di borang depan web.
                </p>
              </div>

              {/* Table Name */}
              <div>
                <label className="block text-xs font-black text-slate-300 mb-1">
                  Nama Jadual (Table Name):
                </label>
                <input
                  type="text"
                  placeholder="attendance_records"
                  value={config.tableName || DEFAULT_SUPABASE_TABLE}
                  onChange={(e) => setConfig({ ...config, tableName: e.target.value })}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* Test Connection Button & Status */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingStatus === 'testing'}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${testingStatus === 'testing' ? 'animate-spin' : ''}`} />
                  <span>{testingStatus === 'testing' ? 'Menguji...' : 'Uji Sambungan Supabase'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer transition active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Simpan Tetapan</span>
                </button>
              </div>

              {testMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 animate-fadeIn ${
                    testingStatus === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {testingStatus === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  )}
                  <span>{testMessage}</span>
                </div>
              )}

              {saveToast && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs font-bold text-emerald-200 flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>{saveToast}</span>
                </div>
              )}

              {/* Bulk sync existing records */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-emerald-400" />
                      <span>Muat Naik Rekod Sedia Ada ({absenceRecords.length})</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Tolak semua rekod ketidakhadiran yang ada di website ke dalam pangkalan data Supabase
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePushExistingRecords}
                    disabled={isPushingBulk || !isConfigured}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer flex-shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPushingBulk ? 'animate-spin' : ''}`} />
                    <span>{isPushingBulk ? 'Memuat Naik...' : 'Segerakkan Sekarang'}</span>
                  </button>
                </div>
                {bulkStatus && (
                  <p className="text-xs text-emerald-300 font-bold mt-2 px-1">
                    {bulkStatus}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white">Skrip SQL Jadual e-Kehadiran</h4>
                  <p className="text-xs text-slate-400">
                    Buka Supabase &rarr; SQL Editor, tampal kod ini dan klik Run.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow"
                >
                  {copiedSql ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Disalin!' : 'Salin Semua SQL'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 p-4 rounded-2xl border border-white/10 text-emerald-300 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-96">
                  {SUPABASE_ATTENDANCE_SQL_SCHEMA}
                </pre>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 space-y-1">
                <p className="font-bold text-white">Perhatian mengenai Keselamatan (RLS):</p>
                <p>
                  Skrip ini telah menyertakan 3 polisi Row Level Security (RLS) supaya Waris dari telefon pintar boleh memasukkan borang kehadiran baru tanpa perlu log masuk kata laluan, dan Guru boleh membaca data terus di sekolah.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                <h4 className="text-sm font-bold text-blue-300 mb-1">
                  Kenapa Pindah Hanya Borang Kehadiran ke Supabase?
                </h4>
                <p className="leading-relaxed">
                  Firebase Spark tier percuma mengehadkan kuota harian (20k writes, 50k reads). Apabila waris beramai-ramai mengisi borang, kuota Firebase cepat habis. Dengan mengasingkan modul Kehadiran ke Supabase:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-200">
                  <li><strong>Tiada kuota harian ketat</strong>: Supabase menyediakan simpanan pangkalan data PostgreSQL percuma 500MB tanpa had sekat bilangan bacaan per hari.</li>
                  <li><strong>Laman web lain tidak terjejas</strong>: Modul berita, guru, galeri, dan kokurikulum kekal selamat di Firebase & pelayan sedia ada.</li>
                  <li><strong>Waris isi, guru nampak serta-merta</strong>: Penyegerakan REST API Supabase sangat pantas dan boleh dibaca serentak di mana-mana peranti.</li>
                </ul>
              </div>

              <h4 className="text-sm font-bold text-white pt-2">Langkah 4 Minit Memulakan Supabase Percuma:</h4>
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-950/70 border border-white/10 rounded-2xl space-y-1">
                  <div className="font-black text-emerald-400 flex items-center justify-between">
                    <span>1. Cipta Projek di Supabase</span>
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] inline-flex items-center gap-1 text-teal-300 hover:underline"
                    >
                      Buka Supabase <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p>
                    Daftar akaun percuma di <span className="text-white font-semibold">supabase.com</span> dan klik <strong>"New Project"</strong>. Berikan nama projek (cth: <em>skmp-kehadiran</em>) dan pilih kawasan rantau Singapore (paling pantas untuk Malaysia).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950/70 border border-white/10 rounded-2xl space-y-1">
                  <div className="font-black text-emerald-400">
                    2. Laksanakan Skrip SQL (Bina Jadual)
                  </div>
                  <p>
                    Pergi ke menu sebelah kiri, klik ikon <strong>SQL Editor</strong> &rarr; <strong>New Query</strong>. Buka tab <strong>"Skrip SQL Schema"</strong> di atas, salin semua kod SQL, tampal ke dalam SQL Editor Supabase dan tekan butang <strong>Run</strong> (hijau).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950/70 border border-white/10 rounded-2xl space-y-1">
                  <div className="font-black text-emerald-400">
                    3. Salin Project URL & Anon Key
                  </div>
                  <p>
                    Di menu Supabase, klik ikon gear <strong>Project Settings</strong> &rarr; <strong>API</strong>. Salin <strong>Project URL</strong> (cth: <code>https://xxxx.supabase.co</code>) dan <strong>anon public API Key</strong>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950/70 border border-white/10 rounded-2xl space-y-1">
                  <div className="font-black text-emerald-400">
                    4. Tampal & Klik Uji Sambungan
                  </div>
                  <p>
                    Kembali ke tab <strong>"Konfigurasi API"</strong> di atas, tampal maklumat tadi, klik <strong>Uji Sambungan</strong>, dan klik <strong>Simpan Tetapan</strong>. Siap! Kini setiap kali waris mengisi borang, data akan terus masuk ke Supabase secara automatik.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Penyambung Modular SKMP e-Kehadiran v2.1
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
