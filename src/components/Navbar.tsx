import React from 'react';
import { Download, Plus, ShieldCheck, LogOut } from 'lucide-react';
import { useDesa } from '../context/DesaContext';
import { formatHariTanggalIndo } from '../utils/formatters';

export const Navbar: React.FC = () => {
  const { profile, activeTab, exportData, setActiveTab, currentUser, logout } = useDesa();
  const todayFormatted = formatHariTanggalIndo(new Date());

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Layanan';
      case 'penduduk':
        return 'Buku Data Penduduk';
      case 'surat':
        return 'Layanan & Pembuatan Surat';
      case 'arsip':
        return 'Arsip Digital Perdes & SK';
      case 'surat-mk':
        return 'Agenda Surat Masuk & Keluar';
      case 'buat-surat-keluar':
        return 'Menu Buat Surat Keluar';
      case 'pengaturan':
        return 'Profil & Pengaturan Desa';
      case 'kelola-admin':
        return 'Kelola Akun Admin & Hak Akses (RBAC)';
      default:
        return 'Dashboard Layanan';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs no-print print:hidden">
      {/* Left side: Mobile Brand OR Desktop Page Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Brand (Shown on small screens where sidebar is hidden) */}
        <div
          className="flex md:hidden items-center gap-2 cursor-pointer select-none"
          onClick={() => setActiveTab('dashboard')}
          id="mobile-nav-brand"
        >
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-base text-white shadow-xs">
            {profile.logoUrl ? (
              <img src={profile.logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
            ) : (
              'D'
            )}
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-slate-900 block leading-tight">
              DIGIDESA 2.0
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              Desa {profile.namaDesa}
            </span>
          </div>
        </div>

        {/* Desktop Page Title (Hidden on mobile) */}
        <div className="hidden md:block">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* Right side: Info and Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="text-right hidden lg:block">
          <p className="text-xs font-semibold text-slate-700">{todayFormatted}</p>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center justify-end gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistem Aktif &bull; {currentUser?.namaLengkap} ({currentUser?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Operator'})
          </p>
        </div>

        <button
          onClick={() => setActiveTab('surat')}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-1.5 active:scale-95 cursor-pointer"
          id="btn-nav-buat-surat"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden xs:inline">Buat Surat</span>
          <span className="xs:hidden">Surat</span>
        </button>

        <button
          onClick={exportData}
          title="Cadangkan Semua Data (Backup JSON)"
          className="p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          id="btn-nav-backup"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Logout / Switch Account Button */}
        <button
          onClick={logout}
          title="Keluar ke Halaman Login (Logout)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors text-xs font-semibold cursor-pointer"
          id="btn-nav-logout"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-500" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
};

