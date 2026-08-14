import React, { useState, useEffect } from 'react';
import { CODE_GS_SCRIPT, INDEX_HTML_SCRIPT } from '../../data/gasCodeTemplate';
import { getGasWebAppUrl, saveGasWebAppUrl, syncBulkDataToGoogleSheets } from '../../utils/googleSheetsSync';
import { Code2, Copy, Download, Check, FileCode, Database, Sparkles, Terminal, Link, CheckCircle2, RefreshCw, Send, AlertCircle } from 'lucide-react';

export const GasScriptSection: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'gs' | 'html'>('gs');
  const [copiedGs, setCopiedGs] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const [webAppUrl, setWebAppUrl] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    setWebAppUrl(getGasWebAppUrl());
  }, []);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    saveGasWebAppUrl(webAppUrl);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 3000);
  };

  const handleTestSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    const res = await syncBulkDataToGoogleSheets({});
    setSyncResult(res);
    setSyncing(false);
  };

  const copyToClipboard = (text: string, isGs: boolean) => {
    navigator.clipboard.writeText(text);
    if (isGs) {
      setCopiedGs(true);
      setTimeout(() => setCopiedGs(false), 2500);
    } else {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
    }
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Banner */}
      <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-xs border border-yellow-400/30 mb-2">
          <Code2 className="w-3.5 h-3.5 text-yellow-400" />
          <span>Pengaturcaraan & Backend Google Sheets</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Sambungan Automatik Google Sheets</h2>
        <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
          Sambungkan portal sekolah terus ke <strong className="text-yellow-300">Google Sheet pangkalan data anda</strong> melalui Google Apps Script Web App.
        </p>
      </div>

      {/* URL Configuration Card */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-yellow-400/30 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 text-blue-950 font-black rounded-2xl flex items-center justify-center flex-shrink-0 shadow">
              <Link className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Konfigurasi URL Google Apps Script Web App</h3>
              <p className="text-xs text-slate-300">
                Data borang aduan/maklum balas dan kemaskini portal akan dihantar secara automatik ke Google Sheet ini.
              </p>
            </div>
          </div>
          {webAppUrl ? (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sambungan Dihubungkan
            </span>
          ) : (
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold rounded-full flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Belum Dihubungkan
            </span>
          )}
        </div>

        <form onSubmit={handleSaveUrl} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={webAppUrl}
              onChange={(e) => setWebAppUrl(e.target.value)}
              className="flex-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400 font-mono"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-5 py-3 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black text-xs rounded-2xl transition shadow-lg flex items-center justify-center gap-2"
              >
                {savedStatus ? <Check className="w-4 h-4 text-emerald-950" /> : <Send className="w-4 h-4" />}
                <span>{savedStatus ? 'Disimpan!' : 'Simpan URL'}</span>
              </button>

              <button
                type="button"
                onClick={handleTestSync}
                disabled={syncing || !webAppUrl}
                className="flex-1 sm:flex-initial px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl transition border border-white/10 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                <span>Uji Sambungan</span>
              </button>
            </div>
          </div>

          {syncResult && (
            <div className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
              syncResult.success
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                : 'bg-rose-500/20 border-rose-400/40 text-rose-200'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{syncResult.message}</span>
            </div>
          )}
        </form>
      </div>

      {/* Auto Tab Setup Callout Box */}
      <div className="bg-yellow-500/10 backdrop-blur-md border border-yellow-400/30 rounded-3xl p-6 shadow-lg flex items-start gap-4">
        <div className="w-10 h-10 bg-yellow-400 text-blue-950 font-black rounded-2xl flex items-center justify-center flex-shrink-0 shadow">
          <Database className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs text-slate-200">
          <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
            <span>Automasi Pangkalan Data Google Sheet (`doGet` & `doPost`)</span>
            <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-black rounded-full text-[10px]">
              Sedia Guna
            </span>
          </h4>
          <p className="leading-relaxed">
            Fungsi <code className="font-mono bg-white/10 px-1 py-0.5 rounded font-bold text-yellow-300">autoSetupDatabaseSheets()</code> dipanggil secara automatik setiap kali laman web dibuka melalui <code className="font-mono bg-white/10 px-1 py-0.5 rounded font-bold text-yellow-300">doGet()</code> atau <code className="font-mono bg-white/10 px-1 py-0.5 rounded font-bold text-yellow-300">doPost()</code>. Jika tab pangkalan data belum wujud (seperti <em>Profil_Sekolah, Warga_Sekolah, Berita, Takwim, Galeri, Anugerah, Muat_Turun, Maklum_Balas, PIBG</em>), sistem akan mencipta tab dan menyuntik tajuk kolum (headers) secara automatik!
          </p>
        </div>
      </div>

      {/* Code Viewer Box */}
      <div className="bg-slate-950/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Code Header Bar */}
        <div className="bg-slate-900/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCodeTab('gs')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition ${
                activeCodeTab === 'gs'
                  ? 'bg-yellow-400 text-blue-950 shadow-lg shadow-yellow-400/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Code.gs (Backend Script)</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('html')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition ${
                activeCodeTab === 'html'
                  ? 'bg-yellow-400 text-blue-950 shadow-lg shadow-yellow-400/20 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Index.html (Frontend Interface)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeCodeTab === 'gs' ? (
              <>
                <button
                  onClick={() => copyToClipboard(CODE_GS_SCRIPT, true)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-yellow-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-white/10"
                >
                  {copiedGs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedGs ? 'Disalin!' : 'Salin Code.gs'}</span>
                </button>
                <button
                  onClick={() => downloadFile('Code.gs', CODE_GS_SCRIPT)}
                  className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Muat Turun .gs</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => copyToClipboard(INDEX_HTML_SCRIPT, false)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-yellow-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-white/10"
                >
                  {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHtml ? 'Disalin!' : 'Salin Index.html'}</span>
                </button>
                <button
                  onClick={() => downloadFile('Index.html', INDEX_HTML_SCRIPT)}
                  className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Muat Turun .html</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Code Content Area */}
        <div className="p-4 overflow-x-auto max-h-[500px]">
          <pre className="font-mono text-xs text-slate-200 leading-relaxed">
            <code>{activeCodeTab === 'gs' ? CODE_GS_SCRIPT : INDEX_HTML_SCRIPT}</code>
          </pre>
        </div>
      </div>

      {/* Deployment Step-by-Step Instructions */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 shadow-lg space-y-4">
        <h3 className="font-extrabold text-lg text-white border-b border-white/10 pb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" /> Panduan Pelaksanaan Di Google Apps Script
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
            <span className="w-6 h-6 rounded-full bg-yellow-400 text-blue-950 font-black flex items-center justify-center text-xs">
              1
            </span>
            <h5 className="font-extrabold text-white">Buka Google Sheets</h5>
            <p className="text-slate-300 leading-relaxed">
              Cipta Google Sheet baharu di Google Drive anda. Buka menu <strong>Extensions &gt; Apps Script</strong>.
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
            <span className="w-6 h-6 rounded-full bg-yellow-400 text-blue-950 font-black flex items-center justify-center text-xs">
              2
            </span>
            <h5 className="font-extrabold text-white">Tampal Code.gs</h5>
            <p className="text-slate-300 leading-relaxed">
              Padam isi fail asal <code className="font-mono bg-white/10 px-1 rounded text-yellow-300">Code.gs</code> dan salin kod <strong className="text-yellow-300">Code.gs</strong> di atas.
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
            <span className="w-6 h-6 rounded-full bg-yellow-400 text-blue-950 font-black flex items-center justify-center text-xs">
              3
            </span>
            <h5 className="font-extrabold text-white">Tambah Index.html</h5>
            <p className="text-slate-300 leading-relaxed">
              Klik butang <strong>+ (Add a file) &gt; HTML</strong>. Namakan sebagai <strong className="text-yellow-300">Index</strong> dan tampal kod HTML di atas.
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
            <span className="w-6 h-6 rounded-full bg-yellow-400 text-blue-950 font-black flex items-center justify-center text-xs">
              4
            </span>
            <h5 className="font-extrabold text-white">Deploy Web App</h5>
            <p className="text-slate-300 leading-relaxed">
              Klik <strong>Deploy &gt; New deployment</strong>. Pilih type <em>Web app</em>, tetapkan Access to <em>Anyone</em>, dan simpan URL Web App ke dalam borang di atas!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
