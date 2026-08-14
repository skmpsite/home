import React, { useState } from 'react';
import { Lock, Key, User, X, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [username, setUsername] = useState('adminskmp');
  const [password, setPassword] = useState('123456');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (username.trim() === 'adminskmp' && password === '123456') {
      setSuccessMsg('Pengesahan Berjaya! Membuka Modul Pentadbir...');
      setTimeout(() => {
        onLoginSuccess();
        onClose();
        setSuccessMsg('');
      }, 700);
    } else {
      setErrorMsg('Nama pengguna atau kata laluan tidak sah. Sila cuba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-blue-950 font-bold mb-3 shadow-lg">
            <ShieldCheck className="w-6 h-6 text-blue-950" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">Log Masuk Pentadbir SKMP</h3>
          <p className="text-xs text-blue-200 mt-1">
            Gunakan akaun rasmi pengurusan sekolah untuk menyunting kandungan portal.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-900" />
                Nama Pengguna (Username)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono transition"
                placeholder="adminskmp"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-blue-900" />
                Kata Laluan (Password)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono transition"
                placeholder="••••••"
              />
            </div>

            {/* Quick credentials hint pill for convenience */}
            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[11px] text-amber-900 flex items-center justify-between">
              <span>
                Pengguna: <strong className="font-mono text-blue-900">adminskmp</strong> | Laluan: <strong className="font-mono text-blue-900">123456</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setUsername('adminskmp');
                  setPassword('123456');
                }}
                className="text-[10px] font-bold text-amber-800 underline hover:text-amber-950 ml-2"
              >
                Isi Automatik
              </button>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-900 to-blue-950 text-white rounded-xl text-xs font-extrabold hover:from-blue-800 hover:to-blue-900 transition shadow-lg flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                Daftar Masuk Pentadbir
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
