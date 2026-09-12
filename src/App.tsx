/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DesaProvider, useDesa } from './context/DesaContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { PendudukView } from './components/PendudukView';
import { SuratGeneratorView } from './components/SuratGeneratorView';
import { ArsipDokumenView } from './components/ArsipDokumenView';
import { SuratMasukKeluarView } from './components/SuratMasukKeluarView';
import { BuatSuratKeluarView } from './components/BuatSuratKeluarView';
import { PengaturanView } from './components/PengaturanView';
import { KelolaAdminView } from './components/KelolaAdminView';
import { AuthScreen } from './components/AuthScreen';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, currentUser } = useDesa();

  if (!currentUser) {
    return <AuthScreen />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'penduduk':
        return <PendudukView />;
      case 'surat':
        return <SuratGeneratorView />;
      case 'arsip':
        return <ArsipDokumenView />;
      case 'surat-mk':
        return <SuratMasukKeluarView />;
      case 'buat-surat-keluar':
        return <BuatSuratKeluarView onSuccessNavigateToAgenda={() => setActiveTab('surat-mk')} />;
      case 'pengaturan':
        return <PengaturanView />;
      case 'kelola-admin':
        return <KelolaAdminView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans print:bg-white print:p-0 print:m-0">
      {/* Desktop Sidebar (Left Full Height - Hidden in Print) */}
      <div className="no-print print:hidden">
        <Sidebar />
      </div>

      {/* Main Workspace (Right) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen print:min-h-0 print:p-0 print:m-0">
        {/* Top Header - Hidden in Print */}
        <div className="no-print print:hidden">
          <Navbar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-12 print:p-0 print:m-0 print:max-w-none print:w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="print:p-0 print:m-0 print:overflow-visible print:transform-none"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Android Mobile Friendly Bottom Bar - Hidden in Print */}
      <div className="no-print print:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <DesaProvider>
      <MainContent />
    </DesaProvider>
  );
}
