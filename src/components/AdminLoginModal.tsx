import React, { useState } from 'react';
import { Key, User, X, CheckCircle2, AlertCircle, ShieldCheck, Eye, EyeOff, LogIn } from 'lucide-react';
import { UserRole } from '../types';

export type { UserRole };

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole) => void;
  defaultRole?: UserRole;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();
    const cleanPassLower = cleanPass.toLowerCase();

    // 1. Semak PK Pentadbiran / Kurikulum (ID: PK1, Katalaluan: PK15012)
    if (
      (cleanUser === 'pk1' && (cleanPass === 'PK15012' || cleanPassLower === 'pk15012')) ||
      (cleanPass === 'PK15012' || (cleanUser === '' && cleanPassLower === 'pk15012'))
    ) {
      setIsSubmitting(true);
      try {
        localStorage.setItem('skmp_attendance_auth_user', 'pk_kurikulum');
      } catch (e) {
        console.error(e);
      }
      setSuccessMsg('Log masuk PK Pentadbiran/Kurikulum Berjaya! Membuka akses Kurikulum & Portal Guru...');
      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess('pk_kurikulum');
        onClose();
        setSuccessMsg('');
      }, 500);
      return;
    }

    // 2. Semak SU Kurikulum (ID: SUPK1, Katalaluan: SUPK15012)
    if (
      (cleanUser === 'supk1' && (cleanPass === 'SUPK15012' || cleanPassLower === 'supk15012')) ||
      (cleanPass === 'SUPK15012' || (cleanUser === '' && cleanPassLower === 'supk15012'))
    ) {
      setIsSubmitting(true);
      try {
        localStorage.setItem('skmp_attendance_auth_user', 'su_kurikulum');
      } catch (e) {
        console.error(e);
      }
      setSuccessMsg('Log masuk Setiausaha Kurikulum Berjaya! Membuka akses Kurikulum & Portal Guru...');
      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess('su_kurikulum');
        onClose();
        setSuccessMsg('');
      }, 500);
      return;
    }

    // 3. Semak PK Hal Ehwal Murid (ID: PKHEM, Katalaluan: PKHEM5012)
    if (
      (cleanUser === 'pkhem' && (cleanPass === 'PKHEM5012' || cleanPassLower === 'pkhem5012')) ||
      (cleanPass === 'PKHEM5012' || (cleanUser === '' && cleanPassLower === 'pkhem5012'))
    ) {
      setIsSubmitting(true);
      try {
        localStorage.setItem('skmp_attendance_auth_user', 'pk_hem');
      } catch (e) {
        console.error(e);
      }
      setSuccessMsg('Log masuk PK Hal Ehwal Murid Berjaya! Membuka akses HEM & Portal Guru...');
      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess('pk_hem');
        onClose();
        setSuccessMsg('');
      }, 500);
      return;
    }

    // 4. Semak SU Hal Ehwal Murid (ID: SUPKHEM, Katalaluan: SUPKHEM5012)
    if (
      (cleanUser === 'supkhem' && (cleanPass === 'SUPKHEM5012' || cleanPassLower === 'supkhem5012')) ||
      (cleanPass === 'SUPKHEM5012' || (cleanUser === '' && cleanPassLower === 'supkhem5012'))
    ) {
      setIsSubmitting(true);
      try {
        localStorage.setItem('skmp_attendance_auth_user', 'su_hem');
      } catch (e) {
        console.error(e);
      }
      setSuccessMsg('Log masuk Setiausaha HEM Berjaya! Membuka akses HEM & Portal Guru...');
      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess('su_hem');
        onClose();
        setSuccessMsg('');
      }, 500);
      return;
    }

    // 5. Semak PK Kokurikulum (ID: PKKo, Katalaluan: PKKo15012 / PKKo5012)
    if (
      (cleanUser === 'pkko' &&
        (cleanPass === 'PKKo15012' ||
          cleanPassLower === 'pkko15012' ||
          cleanPass === 'PKKo5012' ||
          cleanPassLower === 'pkko5012')) ||
      cleanPass === 'PKKo15012' ||
      cleanPassLower === 'pkko15012' ||
      cleanPass === 'PKKo5012' ||
      cleanPassLower === 'pkko5012'
    ) {
      setIsSubmitting(true);
      try {
        localStorage.setItem('skmp_attendance_auth_user', 'pk_kokurikulum');
      } catch (e) {
        console.error(e);
      }
      setSuccessMsg('Log masuk PK Kokurikulum Berjaya! Membuka akses Kokurikulum & Portal Guru...');
      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess('pk_kokurikulum');
        onClose();
        setSuccessMsg('');
      }, 500);
      return;
    }

    // 6. Semak SU Kokurikulum (ID: SUPKKo, Katalaluan: SUPKKo5012)
    if (
      (cleanUser === 'supkko' &&
        (cleanPass === 'SUPKKo5012' ||
          cleanPassLower === 'supkko5012' ||
          cleanPass === 'SUPKKo15012' ||
          cleanPassLower === 'supkko15012')) ||
      cleanPass === 'SUPKKo5012' ||
      cleanPassLower === 'supkko5012' ||
      cleanPass === 'SUPKKo15012' ||
      cleanPassLower === 'supkko15012'
    ) {
      setIsSubmitting(true);
      try {
        localStorage.setItem('skmp_attendance_auth_user', 'su_kokurikulum');
      } catch (e) {
        console.error(e);
      }
      setSuccessMsg('Log masuk Setiausaha Kokurikulum Berjaya! Membuka akses Kokurikulum & Portal Guru...');
      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess('su_kokurikulum');
        onClose();
        setSuccessMsg('');
      }, 500);
      return;
    }

    // 7. Semak akaun PENGGUNA / WARIS SKMP (skmp / 123456)
    if (cleanUser === 'skmp' && cleanPass === '123456') {
      setIsSubmitting(true);
      try {
        localStorage.setItem('skmp_attendance_auth_user', 'skmp');
      } catch (e) {
        console.error(e);
      }
      setSuccessMsg('Log masuk Pengguna SKMP Berjaya! Membuka akses...');
      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess('user');
        onClose();
        setSuccessMsg('');
      }, 500);
      return;
    }

    // 8. Semak akaun GURU (guru / guru5012 atau kata laluan guru5012)
    if (cleanPass === 'guru5012' || (cleanUser === 'guru' && cleanPass === 'guru5012')) {
      setIsSubmitting(true);
      try {
        localStorage.setItem('skmp_attendance_auth_user', 'guru');
      } catch (e) {
        console.error(e);
      }
      setSuccessMsg('Log masuk Guru Berjaya! Membuka Portal Guru SKMP...');
      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess('guru');
        onClose();
        setSuccessMsg('');
      }, 500);
      return;
    }

    // 9. Semak akaun PENTADBIR UTAMA (adminskmp / admin dan kata laluan 123456)
    if ((cleanUser === 'adminskmp' || cleanUser === 'admin') && cleanPass === '123456') {
      setIsSubmitting(true);
      try {
        localStorage.setItem('skmp_attendance_auth_user', 'admin');
      } catch (e) {
        console.error(e);
      }
      setSuccessMsg('Log masuk Pentadbir Berjaya! Membuka Modul Pentadbir...');
      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess('admin');
        onClose();
        setSuccessMsg('');
      }, 500);
      return;
    }

    setErrorMsg('Nama Pengguna / ID atau Kata Laluan tidak tepat. Sila semak semula.');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-white/20 overflow-hidden transform transition-all text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-blue-950 p-6 relative border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-950/50">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">Log Masuk Rasmi SKMP</h3>
              <p className="text-xs text-slate-300">
                Sila masukkan Nama Pengguna / ID dan Kata Laluan anda
              </p>
            </div>
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
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-white focus:outline-none focus:border-blue-400 font-mono transition"
                placeholder="Masukkan ID atau Nama Pengguna"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-yellow-400" />
                <span>Kata Laluan</span>
                <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-white focus:outline-none focus:border-blue-400 font-mono transition pr-10"
                  placeholder="Masukkan Kata Laluan"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                  title={showPassword ? 'Sembunyikan kata laluan' : 'Papar kata laluan'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs sm:text-sm font-black transition shadow-lg shadow-blue-950/50 border border-blue-400/50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4 text-yellow-300" />
                <span>{isSubmitting ? 'Mengesahkan Log Masuk...' : 'Log Masuk'}</span>
              </button>
              <p className="text-center text-[11px] text-slate-400">
                Sistem menyokong log masuk Pentadbir, Guru, PK & SU (Kurikulum, HEM, Kokurikulum) serta Pengguna SKMP.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

