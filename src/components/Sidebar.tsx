import React from 'react';
import {
  LayoutDashboard,
  Users,
  FilePlus2,
  FolderArchive,
  Mail,
  Send,
  Settings,
  Landmark,
  UserCheck,
  ShieldCheck,
  LogOut,
  User,
} from 'lucide-react';
import { useDesa } from '../context/DesaContext';
import { MenuPermission } from '../types';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    profile,
    penduduk,
    suratList,
    arsip,
    currentUser,
    logout,
    canAccess,
  } = useDesa();

  const allMenuItems: {
    id: MenuPermission;
    label: string;
    icon: any;
    badge: number | null;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Desa',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'penduduk',
      label: 'Data Penduduk',
      icon: Users,
      badge: penduduk.length,
    },
    {
      id: 'surat',
      label: 'Pelayanan Surat',
      icon: FilePlus2,
      badge: suratList.length,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'arsip',
      label: 'Arsip Perdes & SK',
      icon: FolderArchive,
      badge: arsip.length,
    },
    {
      id: 'surat-mk',
      label: 'Surat Masuk & Keluar',
      icon: Mail,
      badge: null,
    },
    {
      id: 'buat-surat-keluar',
      label: 'Buat Surat Keluar',
      icon: Send,
      badge: null,
    },
    {
      id: 'pengaturan',
      label: 'Profil & Pengaturan',
      icon: Settings,
      badge: null,
    },
    {
      id: 'kelola-admin',
      label: 'Kelola Akun Admin',
      icon: ShieldCheck,
      badge: null,
    },
  ];

  // RBAC Filter: Only show items user has permission to access
  const authorizedMenuItems = allMenuItems.filter((item) => canAccess(item.id));

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white min-h-screen border-r border-slate-800 no-print print:hidden flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <div 
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => setActiveTab('dashboard')}
          id="sidebar-brand-header"
        >
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-xs">
            {profile.logoUrl ? (
              <img src={profile.logoUrl} alt="Logo" className="w-7 h-7 object-contain" />
            ) : (
              <span>D</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-base tracking-tight text-white leading-tight">
              DIGIDESA 2.0
            </h1>
            <p className="text-[10px] text-slate-400 font-medium truncate">
              Desa {profile.namaDesa}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5">
        <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
          Menu Utama & Modul
        </div>
        {authorizedMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-link-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isActive ? 'bg-blue-500/40 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile & Logout Footer */}
      <div className="p-4 border-t border-slate-800 mt-auto bg-slate-950/40">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-900/60 text-blue-400 border border-blue-700/50 flex items-center justify-center text-xs font-bold shrink-0">
              {currentUser?.namaLengkap.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {currentUser?.namaLengkap || 'Petugas Desa'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser?.role === 'SUPER_ADMIN' ? 'Super Administrator' : currentUser?.jabatan || 'Operator'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Keluar dari Sistem (Logout)"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
            id="btn-sidebar-logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
