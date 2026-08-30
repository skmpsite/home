import React, { useState } from 'react';
import { Lock, Key, User, X, CheckCircle2, AlertCircle, ShieldCheck, GraduationCap, Sparkles } from 'lucide-react';

export type UserRole = 'admin' | 'guru';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole) => void;
  defaultRole?: UserRole;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultRole = 'admin'
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'guru'>(defaultRole);
  const [username, setUsername] = useState('adminskmp');
  const [password, setPassword] = useState('123456');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectRoleTab = (role: 'admin' | 'guru') => {
    setActiveTab(role);
    setErrorMsg('');
    setSuccessMsg('');
    if (role === 'admin') {
      setUsername('adminskmp');
      setPassword('123456');
    } else {
      setUsername('guru');
      setPassword('guru5012');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Semak kata laluan GURU (guru5012)
    if (cleanPass === 'guru5012') {
      setSuccessMsg('Pengesahan Guru Berjaya! Membuka Portal Guru SKMP...');
      setTimeout(() => {
        onLoginSuccess('guru');
        onClose();
        setSuccessMsg('');
      }, 600);
      return;
    }

    // 2. Semak akaun PENTADBIR (adminskmp / 123456)
    if ((cleanUser === 'adminskmp' || cleanUser === 'admin') && cleanPass === '123456') {
      setSuccessMsg('Pengesahan Pentadbir Berjaya! Membuka Modul Pentadbir...');
      setTimeout(() => {
        onLoginSuccess('admin');
        onClose();
        setSuccessMsg('');
      }, 600);
      return;
    }

    setErrorMsg('Kata laluan tidak sah. Untuk guru, gunakan kata laluan "guru5012". Untuk admin, gunakan "adminskmp" / "123456".');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-white/20 overflow-hidden transform transition-all text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-blue-950 p-6 relative border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 bg-gradient-to-br from-red-600 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-950/50">
              {activeTab === 'guru' ? <GraduationCap className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">Log Masuk Rasmi SKMP</h3>
              <p className="text-xs text-slate-300">
                Pilih mod log masuk Guru atau Pentadbir Sekolah
              </p>
            </div>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-slate-950/60 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => handleSelectRoleTab('guru')}
              className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
                activeTab === 'guru'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40 border border-rose-400'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Portal Guru</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectRoleTab('admin')}
              className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40 border border-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Pentadbir (CMS)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs rounded-2xl flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs rounded-2xl flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-yellow-400" />
                <span>Nama Pengguna / ID</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-white focus:outline-none focus:border-red-400 font-mono transition"
                placeholder={activeTab === 'guru' ? 'guru' : 'adminskmp'}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-yellow-400" />
                <span>Kata Laluan</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-xs px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-white focus:outline-none focus:border-red-400 font-mono transition"
                placeholder={activeTab === 'guru' ? 'guru5012' : '••••••'}
              />
            </div>

            {/* Quick credentials hint box */}
            <div className="bg-slate-950/80 border border-white/10 p-3 rounded-2xl text-[11px] text-slate-300 flex items-center justify-between">
              <div>
                {activeTab === 'guru' ? (
                  <span>
                    Kata Laluan Guru: <strong className="font-mono text-yellow-300 font-black">guru5012</strong>
                  </span>
                ) : (
                  <span>
                    Admin: <strong className="font-mono text-yellow-300">adminskmp</strong> | Kata laluan: <strong className="font-mono text-yellow-300">123456</strong>
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'guru') {
                    setUsername('guru');
                    setPassword('guru5012');
                  } else {
                    setUsername('adminskmp');
                    setPassword('123456');
                  }
                }}
                className="text-[10px] font-bold text-yellow-400 hover:text-yellow-300 underline ml-2 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Isi Automatik</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className={`w-full py-3 text-white rounded-2xl text-xs font-black transition shadow-lg flex items-center justify-center gap-2 ${
                  activeTab === 'guru'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50 border border-rose-400'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-950/50 border border-blue-400'
                }`}
              >
                <Lock className="w-4 h-4 text-yellow-300" />
                <span>{activeTab === 'guru' ? 'Masuk ke Portal Guru' : 'Daftar Masuk Pentadbir'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
