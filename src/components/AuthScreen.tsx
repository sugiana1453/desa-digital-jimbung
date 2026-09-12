import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Mail,
  Phone,
  Building2,
  Sparkles,
  Clock,
  MapPin,
  HelpCircle,
  ArrowRight,
  FileText,
  Users,
  FolderArchive,
  KeyRound,
  Shield,
  Info,
} from 'lucide-react';
import { useDesa, ROLE_DEFAULT_PERMISSIONS } from '../context/DesaContext';
import { AdminRole } from '../types';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const { profile, login, registerAdmin, adminUsers } = useDesa();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'HELP'>('LOGIN');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Register form state
  const [regNama, setRegNama] = useState('');
  const [regJabatan, setRegJabatan] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNoHp, setRegNoHp] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<AdminRole>('OPERATOR_SURAT');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(loginUsername, loginPassword);
      setIsLoading(false);
      if (!res.success) {
        setLoginError(res.error || 'Gagal masuk. Silakan periksa kembali akun Anda.');
      } else {
        if (onSuccess) onSuccess();
      }
    }, 250);
  };

  const handleQuickLogin = (username: string, pass: string) => {
    setLoginUsername(username);
    setLoginPassword(pass);
    setLoginError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, pass);
      setIsLoading(false);
      if (!res.success) {
        setLoginError(res.error || 'Gagal masuk.');
      } else {
        if (onSuccess) onSuccess();
      }
    }, 200);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (regPassword.length < 5) {
      setRegError('Password minimal harus terdiri dari 5 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      return;
    }

    const res = registerAdmin({
      username: regUsername.trim(),
      password: regPassword,
      namaLengkap: regNama.trim(),
      jabatan: regJabatan.trim() || 'Operator Layanan Desa',
      email: regEmail.trim() || undefined,
      noHp: regNoHp.trim() || undefined,
      role: regRole,
      permissions: ROLE_DEFAULT_PERMISSIONS[regRole] || ['dashboard'],
      isActive: true,
    });

    if (!res.success) {
      setRegError(res.error || 'Gagal mendaftarkan akun.');
    } else {
      setRegSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-slate-100 flex flex-col justify-between relative selection:bg-blue-600 selection:text-white font-sans">
      {/* Official Top National Color Bar (Merah Putih) */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-red-500 to-white flex-shrink-0" />

      {/* Top Government Jurisdiction Bar */}
      <header className="px-4 sm:px-8 py-3 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-300">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wider uppercase text-[11px] text-slate-400">
            Republik Indonesia
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-300 font-medium">
            Pemerintah Kab. {profile.kabupaten}, Kec. {profile.kecamatan}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="hidden sm:inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Jam Layanan: Senin - Jumat (08.00 - 15.30 WIB)
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-800/50 text-blue-300 font-mono text-[10px]">
            <ShieldCheck className="w-3 h-3 text-blue-400" />
            PORTAL RESMI DESA
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Official Village Branding & Portal Information */}
          <section className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-2 shadow-xl shadow-blue-500/20 flex items-center justify-center border border-blue-400/30 shrink-0">
                {profile.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt="Logo Desa"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-white" />
                )}
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">
                  Sistem Informasi & Administrasi Desa (SID)
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  DIGIDESA 2.0
                </h1>
                <p className="text-sm sm:text-base text-slate-300 font-medium">
                  Kantor Kepala Desa {profile.namaDesa}
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Portal terpadu satu pintu untuk staf, perangkat desa, dan operator pelayanan dalam mengelola data kependudukan, tata naskah persuratan warga, agenda dinas, dan arsip hukum desa secara digital, cepat, dan akuntabel.
            </p>

            {/* 4 Core Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white mb-0.5">Surat Warga & QR Digital</h3>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Cetak 14+ jenis surat keterangan dinas otomatis lengkap dengan QR Code keabsahan berkas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white mb-0.5">Buku Induk Kependudukan</h3>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Pencatatan NIK, Kartu Keluarga, klasifikasi dusun, dan pemindai data KK instan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                    <FolderArchive className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white mb-0.5">Tata Naskah & Agenda M/K</h3>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Pencatatan buku agenda surat masuk, penomoran surat keluar, SK Kades, dan Perdes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white mb-0.5">Otoritas Akses (RBAC)</h3>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Pemisahan wewenang petugas per modul kerja demi menjamin keamanan dan privasi data warga.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Contact & Address Footer Pill */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {profile.alamatKantor}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                {profile.telepon}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {profile.email}
              </span>
            </div>
          </section>

          {/* Right Column: Authentication Card (Login / Register / Help) */}
          <section className="lg:col-span-5">
            <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden relative">
              
              {/* Header Tab Switcher */}
              <div className="grid grid-cols-3 p-1.5 bg-slate-950/80 border-b border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  id="tab-login-btn"
                  onClick={() => {
                    setMode('LOGIN');
                    setLoginError(null);
                  }}
                  className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    mode === 'LOGIN'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </button>

                <button
                  type="button"
                  id="tab-register-btn"
                  onClick={() => {
                    setMode('REGISTER');
                    setRegError(null);
                  }}
                  className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    mode === 'REGISTER'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Daftar Akun</span>
                </button>

                <button
                  type="button"
                  id="tab-help-btn"
                  onClick={() => {
                    setMode('HELP');
                  }}
                  className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    mode === 'HELP'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Bantuan</span>
                </button>
              </div>

              {/* TAB 1: FORM LOGIN */}
              {mode === 'LOGIN' && (
                <div className="p-6 sm:p-7 space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-blue-400" />
                      Masuk ke Sistem Desa
                    </h2>
                    <p className="text-xs text-slate-400">
                      Masukkan username dan kata sandi yang telah terdaftar oleh administrator.
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block mb-0.5">Gagal Masuk</span>
                        {loginError}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Username / Akun Petugas *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required
                          id="input-login-username"
                          placeholder="Contoh: admin atau operator.surat"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-950 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-300">
                          Kata Sandi (Password) *
                        </label>
                        <button
                          type="button"
                          onClick={() => setMode('HELP')}
                          className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer"
                        >
                          Lupa sandi?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          id="input-login-password"
                          placeholder="Masukkan kata sandi akun"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-950 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>Ingat sesi di perangkat ini</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      id="btn-submit-login"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-70"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{isLoading ? 'Memverifikasi Kredensial...' : 'Masuk ke Sistem Administrasi'}</span>
                    </button>
                  </form>

                  {/* Quick One-Click Login for Testers / Reviewers */}
                  <div className="pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Pilihan Cepat Masuk (1-Klik):
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {adminUsers.slice(0, 4).map((adm) => (
                        <button
                          key={adm.id}
                          type="button"
                          onClick={() => handleQuickLogin(adm.username, adm.password)}
                          className="w-full p-2.5 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all group flex items-center justify-between cursor-pointer"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white group-hover:text-blue-400 truncate">
                                {adm.username}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                (pass: {adm.password})
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {adm.namaLengkap} &bull; {adm.jabatan}
                            </p>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                adm.role === 'SUPER_ADMIN'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : adm.role === 'OPERATOR_SURAT'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : adm.role === 'PETUGAS_PENDUDUK'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {adm.role === 'SUPER_ADMIN' ? 'Super Admin' : adm.role.replace('_', ' ')}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FORM REGISTRASI PETUGAS BARU */}
              {mode === 'REGISTER' && (
                <div className="p-6 sm:p-7 space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-emerald-400" />
                      Pendaftaran Petugas Baru
                    </h2>
                    <p className="text-xs text-slate-400">
                      Daftarkan staf atau aparat desa baru ke dalam sistem administrasi digital.
                    </p>
                  </div>

                  {regError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block mb-0.5">Pendaftaran Gagal</span>
                        {regError}
                      </div>
                    </div>
                  )}

                  {regSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block mb-0.5">Pendaftaran Berhasil!</span>
                        Akun telah terdaftar dan Anda sedang dialihkan ke sistem...
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Nama Lengkap Petugas *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="text"
                            required
                            placeholder="Misal: Siti Rahayu, S.Kom"
                            value={regNama}
                            onChange={(e) => setRegNama(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Jabatan di Desa *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Briefcase className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="text"
                            required
                            placeholder="Staf Kasi Pelayanan"
                            value={regJabatan}
                            onChange={(e) => setRegJabatan(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Username Login *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="siti.pelayanan"
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Peran / Hak Akses *
                        </label>
                        <select
                          value={regRole}
                          onChange={(e) => setRegRole(e.target.value as AdminRole)}
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-200"
                        >
                          <option value="OPERATOR_SURAT">Operator Pelayanan Surat</option>
                          <option value="PETUGAS_PENDUDUK">Petugas Kependudukan (KK & NIK)</option>
                          <option value="PENGELOLA_ARSIP">Pengelola Arsip & Agenda M/K</option>
                          <option value="SUPER_ADMIN">Super Administrator (Akses Penuh)</option>
                          <option value="VIEWER">Peninjau / Viewer</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Email Dinas / Petugas
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="email"
                            placeholder="petugas@desa.id"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Nomor WhatsApp / HP
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="text"
                            placeholder="08123456789"
                            value={regNoHp}
                            onChange={(e) => setRegNoHp(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Kata Sandi *
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Min. 5 karakter"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Ulangi Kata Sandi *
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Ketik ulang sandi"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Akun baru akan langsung aktif dan terhubung ke modul peran yang Anda pilih.
                      </span>
                    </div>

                    <button
                      type="submit"
                      id="btn-submit-register"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Daftarkan Akun Petugas & Masuk</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: BANTUAN & INFORMASI PEMULIHAN SANDI */}
              {mode === 'HELP' && (
                <div className="p-6 sm:p-7 space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-amber-400" />
                      Bantuan & Pemulihan Akun
                    </h2>
                    <p className="text-xs text-slate-400">
                      SOP tata kelola akun dan pemulihan kata sandi pegawai kantor desa.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs text-slate-300">
                    <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-400" />
                        Lupa Kata Sandi (Password)?
                      </h3>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        Sesuai standar operasional keamanan sistem pemerintahan desa, reset kata sandi dilakukan secara terverifikasi melalui <strong>Sekretaris Desa</strong> atau <strong>Administrator IT Desa</strong> pada menu <em>Kelola Admin</em>.
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                      <h4 className="font-bold text-white text-[11px] uppercase tracking-wider text-slate-400">
                        Kontak Pejabat Berwenang:
                      </h4>
                      <ul className="space-y-1.5 text-[11px]">
                        <li className="flex items-center justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-400">Sekretaris Desa:</span>
                          <span className="font-semibold text-white">{profile.namaSekdes}</span>
                        </li>
                        <li className="flex items-center justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-400">Operator SID:</span>
                          <span className="font-semibold text-white">{profile.namaOperator}</span>
                        </li>
                        <li className="flex items-center justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-400">Telepon Kantor:</span>
                          <span className="font-semibold text-white">{profile.telepon}</span>
                        </li>
                        <li className="flex items-center justify-between py-1">
                          <span className="text-slate-400">Email Resmi:</span>
                          <span className="font-semibold text-blue-400">{profile.email}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px]">
                      💡 <strong>Petunjuk Cepat Pengujian:</strong> Anda dapat menggunakan akun bawaan <code>admin</code> (kata sandi: <code>admin123</code>) untuk masuk sebagai Super Administrator.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMode('LOGIN')}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    <span>Kembali ke Halaman Masuk</span>
                  </button>
                </div>
              )}

              {/* Bottom Security Assurance Tag */}
              <div className="p-3 bg-slate-950 border-t border-slate-800/80 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Enkripsi Kredensial & Log Audit Aktivitas Petugas Desa</span>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Official Government Footer */}
      <footer className="px-4 sm:px-8 py-3 bg-slate-950/90 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px]">
          &copy; {new Date().getFullYear()} Pemerintah Desa {profile.namaDesa}. Sesuai Permendagri No. 47 Tahun 2016 tentang Administrasi Pemerintahan Desa.
        </p>
        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
          <span>Versi Sistem: DIGIDESA 2.0.4</span>
          <span>&bull;</span>
          <span>Build: Stable Release</span>
        </div>
      </footer>
    </div>
  );
};
