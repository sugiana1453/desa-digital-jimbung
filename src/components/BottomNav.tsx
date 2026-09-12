import React from 'react';
import {
  LayoutDashboard,
  Users,
  FilePlus2,
  FolderArchive,
  Mail,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useDesa } from '../context/DesaContext';
import { MenuPermission } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, canAccess } = useDesa();

  const allNavItems: {
    id: MenuPermission;
    label: string;
    icon: any;
    highlight?: boolean;
  }[] = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'penduduk', label: 'Penduduk', icon: Users },
    {
      id: 'surat',
      label: 'Surat',
      icon: FilePlus2,
      highlight: true,
    },
    { id: 'arsip', label: 'Arsip', icon: FolderArchive },
    { id: 'surat-mk', label: 'Agenda', icon: Mail },
    { id: 'pengaturan', label: 'Profil', icon: Settings },
    { id: 'kelola-admin', label: 'Admin', icon: ShieldCheck },
  ];

  const authorizedItems = allNavItems.filter((item) => canAccess(item.id));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg no-print print:hidden bottom-nav pb-[env(safe-area-inset-bottom,8px)]">
      <div
        className="grid items-center justify-items-center"
        style={{ gridTemplateColumns: `repeat(${authorizedItems.length}, minmax(0, 1fr))` }}
      >
        {authorizedItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.highlight) {
            return (
              <button
                key={item.id}
                id={`btn-bottom-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center -mt-4 group relative"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 ${
                    isActive
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-blue-500/30'
                      : 'bg-slate-900 text-white hover:bg-blue-600'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={`text-[10px] font-semibold mt-1 ${
                    isActive ? 'text-blue-600 font-bold' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              id={`btn-bottom-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 w-full rounded-xl transition-colors active:scale-95 ${
                isActive
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
