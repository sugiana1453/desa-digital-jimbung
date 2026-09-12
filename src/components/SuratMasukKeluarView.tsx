import React, { useState, useMemo } from 'react';
import {
  Mail,
  Send,
  Inbox,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Trash2,
  Edit2,
  FileSpreadsheet,
  X,
  FileText,
  Sparkles,
  Upload,
  Hash,
  PenTool,
  Check,
} from 'lucide-react';
import { useDesa } from '../context/DesaContext';
import { SuratKeluar, SuratMasuk } from '../types';
import { formatTanggalIndo } from '../utils/formatters';
import { ScanSuratMasukModal } from './ScanSuratMasukModal';
import { BuatSuratKeluarView } from './BuatSuratKeluarView';

interface SuratMasukKeluarViewProps {
  initialSubTab?: 'MASUK' | 'KELUAR' | 'BUAT_KELUAR';
}

export const SuratMasukKeluarView: React.FC<SuratMasukKeluarViewProps> = ({
  initialSubTab = 'MASUK',
}) => {
  const {
    suratMasuk,
    addSuratMasuk,
    updateSuratMasuk,
    deleteSuratMasuk,
    suratKeluar,
    addSuratKeluar,
    updateSuratKeluar,
    deleteSuratKeluar,
    setSelectedLetterForPrint,
    suratList,
    setActiveTab,
  } = useDesa();

  const [activeSubTab, setActiveSubTab] = useState<'MASUK' | 'KELUAR' | 'BUAT_KELUAR'>(initialSubTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modals
  const [isScanMasukModalOpen, setIsScanMasukModalOpen] = useState(false);
  const [isAddMasukModalOpen, setIsAddMasukModalOpen] = useState(false);
  const [isAddKeluarModalOpen, setIsAddKeluarModalOpen] = useState(false);
  const [editingSuratMasuk, setEditingSuratMasuk] = useState<SuratMasuk | null>(null);
  const [editingSuratKeluar, setEditingSuratKeluar] = useState<SuratKeluar | null>(null);

  // Next agenda numbers recommendation
  const currentYear = new Date().getFullYear();
  const nextMasukAgenda = `${String(suratMasuk.length + 1).padStart(3, '0')}/AG-IN/${currentYear}`;
  const nextKeluarAgenda = `${String(suratKeluar.length + 1).padStart(3, '0')}/AG-OUT/${currentYear}`;

  // Form State: Surat Masuk
  const [formMasuk, setFormMasuk] = useState({
    nomorAgenda: nextMasukAgenda,
    nomorSurat: '',
    tanggalSurat: new Date().toISOString().slice(0, 10),
    tanggalDiterima: new Date().toISOString().slice(0, 10),
    pengirim: '',
    perihal: '',
    sifatSurat: 'Biasa' as 'Biasa' | 'Penting' | 'Segera' | 'Rahasia',
    disposisi: '',
    status: 'Belum Ditindaklanjuti' as 'Belum Ditindaklanjuti' | 'Diproses' | 'Selesai',
    keterangan: '',
  });

  // Form State: Surat Keluar
  const [formKeluar, setFormKeluar] = useState({
    nomorAgenda: nextKeluarAgenda,
    nomorSurat: '',
    tanggalSurat: new Date().toISOString().slice(0, 10),
    penerima: '',
    perihal: '',
    penandatangan: 'Kepala Desa',
    sifatSurat: 'Biasa' as 'Biasa' | 'Penting' | 'Segera' | 'Rahasia',
    lampiran: '-',
    keterangan: '',
  });

  // Filtered Surat Masuk
  const filteredSuratMasuk = useMemo(() => {
    return suratMasuk.filter(
      (sm) =>
        (sm.nomorAgenda && sm.nomorAgenda.toLowerCase().includes(searchTerm.toLowerCase())) ||
        sm.nomorSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sm.pengirim.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sm.perihal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sm.disposisi.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [suratMasuk, searchTerm]);

  // Filtered Surat Keluar
  const filteredSuratKeluar = useMemo(() => {
    return suratKeluar.filter(
      (sk) =>
        (sk.nomorAgenda && sk.nomorAgenda.toLowerCase().includes(searchTerm.toLowerCase())) ||
        sk.nomorSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sk.penerima.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sk.perihal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sk.penandatangan.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [suratKeluar, searchTerm]);

  const handleSubmitMasuk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMasuk.nomorSurat || !formMasuk.pengirim || !formMasuk.perihal) {
      alert('Mohon lengkapi nomor surat, pengirim, dan perihal.');
      return;
    }

    if (editingSuratMasuk) {
      updateSuratMasuk(editingSuratMasuk.id, formMasuk);
      setEditingSuratMasuk(null);
      setSuccessToast('Perubahan surat masuk berhasil disimpan.');
    } else {
      addSuratMasuk(formMasuk);
      setIsAddMasukModalOpen(false);
      setSuccessToast(`Surat masuk dengan No. Agenda ${formMasuk.nomorAgenda} berhasil dicatat.`);
    }

    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleSubmitKeluar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKeluar.nomorSurat || !formKeluar.penerima || !formKeluar.perihal) {
      alert('Mohon lengkapi nomor surat, penerima, dan perihal.');
      return;
    }

    if (editingSuratKeluar) {
      updateSuratKeluar(editingSuratKeluar.id, formKeluar);
      setEditingSuratKeluar(null);
      setSuccessToast('Perubahan surat keluar berhasil disimpan.');
    } else {
      addSuratKeluar(formKeluar);
      setIsAddKeluarModalOpen(false);
      setSuccessToast(`Surat keluar dengan No. Agenda ${formKeluar.nomorAgenda} berhasil dicatat.`);
    }

    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Handler when AI scan finishes and saves to agenda
  const handleSaveScannedSuratMasuk = (scannedData: Omit<SuratMasuk, 'id'>) => {
    addSuratMasuk(scannedData);
    setSuccessToast(`Surat masuk dari ${scannedData.pengirim} berhasil dipindai AI & masuk No. Agenda ${scannedData.nomorAgenda || 'otomatis'}!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (activeSubTab === 'MASUK') {
      const headers = ['No', 'No. Agenda', 'Nomor Surat', 'Tgl Surat', 'Tgl Diterima', 'Pengirim', 'Perihal', 'Sifat', 'Disposisi', 'Status'];
      const rows = filteredSuratMasuk.map((s, i) => [
        i + 1,
        `"${s.nomorAgenda || '-'}"`,
        `"${s.nomorSurat}"`,
        s.tanggalSurat,
        s.tanggalDiterima,
        `"${s.pengirim}"`,
        `"${s.perihal}"`,
        s.sifatSurat || 'Biasa',
        `"${s.disposisi}"`,
        s.status,
      ]);
      downloadCSV(headers, rows, 'register_buku_agenda_surat_masuk');
    } else {
      const headers = ['No', 'No. Agenda', 'Nomor Surat', 'Tgl Surat', 'Penerima / Tujuan', 'Perihal', 'Sifat', 'Penandatangan', 'Keterangan'];
      const rows = filteredSuratKeluar.map((s, i) => [
        i + 1,
        `"${s.nomorAgenda || '-'}"`,
        `"${s.nomorSurat}"`,
        s.tanggalSurat,
        `"${s.penerima}"`,
        `"${s.perihal}"`,
        s.sifatSurat || 'Biasa',
        `"${s.penandatangan}"`,
        `"${s.keterangan || '-'}"`,
      ]);
      downloadCSV(headers, rows, 'register_buku_agenda_surat_keluar');
    }
  };

  const downloadCSV = (headers: string[], rows: any[][], fileName: string) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center">
            <Mail className="w-6 h-6 mr-2 text-blue-600" />
            Buku Agenda Surat Masuk & Surat Keluar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pencatatan surat dinas desa, nomor agenda customisasi, pembacaan AI otomatis untuk surat masuk, dan pembuatan surat keluar resmi.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {activeSubTab !== 'BUAT_KELUAR' && (
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-blue-600" />
              Ekspor CSV
            </button>
          )}

          {activeSubTab === 'MASUK' && (
            <>
              <button
                type="button"
                onClick={() => setIsScanMasukModalOpen(true)}
                className="inline-flex items-center px-3.5 py-2 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 mr-1.5 text-amber-300 animate-pulse" />
                Upload Surat Masuk (Scan AI)
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormMasuk({
                    nomorAgenda: `${String(suratMasuk.length + 1).padStart(3, '0')}/AG-IN/${currentYear}`,
                    nomorSurat: '',
                    tanggalSurat: new Date().toISOString().slice(0, 10),
                    tanggalDiterima: new Date().toISOString().slice(0, 10),
                    pengirim: '',
                    perihal: '',
                    sifatSurat: 'Biasa',
                    disposisi: '',
                    status: 'Belum Ditindaklanjuti',
                    keterangan: '',
                  });
                  setIsAddMasukModalOpen(true);
                }}
                className="inline-flex items-center px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1" />
                Catat Manual
              </button>
            </>
          )}

          {activeSubTab === 'KELUAR' && (
            <>
              <button
                type="button"
                onClick={() => setActiveSubTab('BUAT_KELUAR')}
                className="inline-flex items-center px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <PenTool className="w-4 h-4 mr-1.5" />
                Buat Surat Keluar Baru
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormKeluar({
                    nomorAgenda: `${String(suratKeluar.length + 1).padStart(3, '0')}/AG-OUT/${currentYear}`,
                    nomorSurat: '',
                    tanggalSurat: new Date().toISOString().slice(0, 10),
                    penerima: '',
                    perihal: '',
                    penandatangan: 'Kepala Desa',
                    sifatSurat: 'Biasa',
                    lampiran: '-',
                    keterangan: '',
                  });
                  setIsAddKeluarModalOpen(true);
                }}
                className="inline-flex items-center px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1" />
                Catat Agenda Keluar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-slate-400 hover:text-slate-600 text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SubTab Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Tab 1: Surat Masuk */}
        <button
          type="button"
          onClick={() => setActiveSubTab('MASUK')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeSubTab === 'MASUK'
              ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 flex items-center">
              <Inbox className="w-4 h-4 mr-1.5 text-blue-600" />
              Buku Agenda Surat Masuk
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {suratMasuk.length} Surat
            </span>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">
            {suratMasuk.filter((s) => s.status !== 'Selesai').length}
            <span className="text-xs font-normal text-slate-500 ml-1.5">Perlu Tindak Lanjut</span>
          </p>
          <p className="text-[11px] text-blue-700 mt-1 font-medium flex items-center">
            <Sparkles className="w-3 h-3 mr-1" /> Mendukung Scan AI Otomatis
          </p>
        </button>

        {/* Tab 2: Surat Keluar */}
        <button
          type="button"
          onClick={() => setActiveSubTab('KELUAR')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeSubTab === 'KELUAR'
              ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 flex items-center">
              <Send className="w-4 h-4 mr-1.5 text-blue-600" />
              Buku Agenda Surat Keluar
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {suratKeluar.length} Surat
            </span>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">
            {suratKeluar.length}
            <span className="text-xs font-normal text-slate-500 ml-1.5">Tercatat di Register</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            No. Agenda Custom & Arsip Penomoran
          </p>
        </button>

        {/* Tab 3: Menu Buat Surat Keluar */}
        <button
          type="button"
          onClick={() => setActiveSubTab('BUAT_KELUAR')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeSubTab === 'BUAT_KELUAR'
              ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 flex items-center">
              <PenTool className="w-4 h-4 mr-1.5 text-indigo-600" />
              Menu Buat Surat Keluar
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              Generator
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-2">
            Buat Surat Resmi Desa
          </p>
          <p className="text-[11px] text-indigo-700 mt-1 font-medium">
            Custom No. Agenda, Kop Desa & Cetak
          </p>
        </button>
      </div>

      {/* Subtab View: BUAT SURAT KELUAR */}
      {activeSubTab === 'BUAT_KELUAR' ? (
        <BuatSuratKeluarView onSuccessNavigateToAgenda={() => setActiveSubTab('KELUAR')} />
      ) : (
        <>
          {/* Search Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeSubTab === 'MASUK'
                    ? 'Cari No. Agenda (contoh: 001/AG-IN), nomor surat, pengirim, perihal, disposisi...'
                    : 'Cari No. Agenda (contoh: 001/AG-OUT), nomor surat, penerima, perihal...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List Content: Surat Masuk */}
          {activeSubTab === 'MASUK' && (
            <div className="space-y-3">
              {filteredSuratMasuk.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500 space-y-2">
                  <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>Belum ada data surat masuk yang sesuai dengan pencarian.</p>
                  <button
                    type="button"
                    onClick={() => setIsScanMasukModalOpen(true)}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Upload & Pindai dengan AI
                  </button>
                </div>
              ) : (
                filteredSuratMasuk.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-blue-300 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Customizable Nomor Agenda Badge */}
                          <span className="font-mono text-xs font-bold text-blue-900 bg-blue-100/80 px-2.5 py-0.5 rounded-md border border-blue-200 flex items-center">
                            <Hash className="w-3 h-3 mr-0.5 text-blue-600" />
                            Agenda: {item.nomorAgenda || 'Belum diatur'}
                          </span>

                          <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            No. Surat: {item.nomorSurat}
                          </span>

                          {item.sifatSurat && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                item.sifatSurat === 'Penting' || item.sifatSurat === 'Segera'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : item.sifatSurat === 'Rahasia'
                                  ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {item.sifatSurat}
                            </span>
                          )}

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              item.status === 'Selesai'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'Diproses'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-1">{item.perihal}</h3>
                      </div>

                      <div className="text-left sm:text-right text-xs text-slate-500 flex-shrink-0">
                        <p>Pengirim: <strong className="text-slate-800">{item.pengirim}</strong></p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Diterima: {formatTanggalIndo(item.tanggalDiterima)} (Tgl Surat: {formatTanggalIndo(item.tanggalSurat)})
                        </p>
                      </div>
                    </div>

                    {/* Disposisi Kades Box */}
                    {item.disposisi && (
                      <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 text-xs">
                        <span className="font-semibold text-blue-900 block mb-0.5">
                          Instruksi Disposisi Kepala Desa:
                        </span>
                        <p className="text-blue-950 leading-relaxed">{item.disposisi}</p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 truncate max-w-md">
                        {item.keterangan || item.ringkasan || 'Tidak ada catatan tambahan'}
                      </span>
                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditingSuratMasuk(item);
                            setFormMasuk({
                              nomorAgenda: item.nomorAgenda || '',
                              nomorSurat: item.nomorSurat,
                              tanggalSurat: item.tanggalSurat,
                              tanggalDiterima: item.tanggalDiterima,
                              pengirim: item.pengirim,
                              perihal: item.perihal,
                              sifatSurat: item.sifatSurat || 'Biasa',
                              disposisi: item.disposisi || '',
                              status: item.status,
                              keterangan: item.keterangan || '',
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg text-blue-600 hover:bg-blue-50 text-xs font-semibold flex items-center cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit / No. Agenda
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus catatan surat masuk ${item.nomorSurat}?`)) {
                              deleteSuratMasuk(item.id);
                            }
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Hapus surat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* List Content: Surat Keluar */}
          {activeSubTab === 'KELUAR' && (
            <div className="space-y-3">
              {filteredSuratKeluar.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500 space-y-2">
                  <Send className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>Belum ada data surat keluar yang tercatat.</p>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('BUAT_KELUAR')}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    <PenTool className="w-3.5 h-3.5 mr-1" />
                    Buat Surat Keluar Baru
                  </button>
                </div>
              ) : (
                filteredSuratKeluar.map((item) => {
                  const hasGeneratedRef = item.idSuratDibuatRef;
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-emerald-300 transition-all space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Customizable Nomor Agenda Badge */}
                            <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center">
                              <Hash className="w-3 h-3 mr-0.5 text-emerald-600" />
                              Agenda: {item.nomorAgenda || 'Belum diatur'}
                            </span>

                            <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              No. Surat: {item.nomorSurat}
                            </span>

                            {item.sifatSurat && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {item.sifatSurat}
                              </span>
                            )}

                            {hasGeneratedRef && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                Generator Pelayanan Warga
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 mt-1">{item.perihal}</h3>
                        </div>

                        <div className="text-left sm:text-right text-xs text-slate-500 flex-shrink-0">
                          <p>Tujuan / Penerima: <strong className="text-slate-800">{item.penerima}</strong></p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Tanggal: {formatTanggalIndo(item.tanggalSurat)}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Ditandatangani: <strong>{item.penandatangan}</strong></span>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSuratKeluar(item);
                              setFormKeluar({
                                nomorAgenda: item.nomorAgenda || '',
                                nomorSurat: item.nomorSurat,
                                tanggalSurat: item.tanggalSurat,
                                penerima: item.penerima,
                                perihal: item.perihal,
                                penandatangan: item.penandatangan,
                                sifatSurat: item.sifatSurat || 'Biasa',
                                lampiran: item.lampiran || '-',
                                keterangan: item.keterangan || '',
                              });
                            }}
                            className="text-blue-600 hover:underline font-semibold flex items-center text-xs cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit / No. Agenda
                          </button>

                          {hasGeneratedRef && (
                            <button
                              onClick={() => {
                                const refLetter = suratList.find((s) => s.id === item.idSuratDibuatRef);
                                if (refLetter) {
                                  setSelectedLetterForPrint(refLetter);
                                  setActiveTab('surat');
                                }
                              }}
                              className="text-emerald-700 hover:underline font-semibold flex items-center text-xs cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 mr-1" /> Lihat Dokumen
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm(`Hapus catatan surat keluar ${item.nomorSurat}?`)) {
                                deleteSuratKeluar(item.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Hapus surat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      {/* AI Scanner Modal for Surat Masuk */}
      <ScanSuratMasukModal
        isOpen={isScanMasukModalOpen}
        onClose={() => setIsScanMasukModalOpen(false)}
        onSaveToAgenda={handleSaveScannedSuratMasuk}
        nextAgendaNumber={nextMasukAgenda}
      />

      {/* Modal Tambah / Edit Surat Masuk */}
      {(isAddMasukModalOpen || editingSuratMasuk) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {editingSuratMasuk ? 'Edit Data Surat Masuk' : 'Catat Surat Masuk Baru'}
                </h3>
                <p className="text-xs text-slate-400">Registrasi berkas masuk ke buku agenda desa</p>
              </div>
              <button
                onClick={() => {
                  setIsAddMasukModalOpen(false);
                  setEditingSuratMasuk(null);
                }}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMasuk} className="p-4 sm:p-6 space-y-3.5 max-h-[80vh] overflow-y-auto">
              {/* Customizable Nomor Agenda Field */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                <label className="block text-xs font-bold text-blue-900 mb-1 flex items-center justify-between">
                  <span className="flex items-center">
                    <Hash className="w-3.5 h-3.5 mr-1 text-blue-700" />
                    Nomor Agenda (Dapat Di-customisasi) *
                  </span>
                  <span className="text-[10px] text-blue-600 font-normal">Sesuai penomoran desa</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 005/AG-IN/2026"
                  value={formMasuk.nomorAgenda}
                  onChange={(e) => setFormMasuk({ ...formMasuk, nomorAgenda: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-blue-300 rounded-lg font-mono font-bold text-blue-950 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Surat Masuk *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 005/182/Kec-CW/2026"
                    value={formMasuk.nomorSurat}
                    onChange={(e) => setFormMasuk({ ...formMasuk, nomorSurat: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pengirim / Asal Surat *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kantor Camat, Puskesmas"
                    value={formMasuk.pengirim}
                    onChange={(e) => setFormMasuk({ ...formMasuk, pengirim: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Surat
                  </label>
                  <input
                    type="date"
                    required
                    value={formMasuk.tanggalSurat}
                    onChange={(e) => setFormMasuk({ ...formMasuk, tanggalSurat: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Diterima
                  </label>
                  <input
                    type="date"
                    required
                    value={formMasuk.tanggalDiterima}
                    onChange={(e) => setFormMasuk({ ...formMasuk, tanggalDiterima: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sifat Surat
                </label>
                <select
                  value={formMasuk.sifatSurat}
                  onChange={(e) => setFormMasuk({ ...formMasuk, sifatSurat: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="Biasa">Biasa</option>
                  <option value="Penting">Penting</option>
                  <option value="Segera">Segera</option>
                  <option value="Rahasia">Rahasia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Perihal / Pokok Surat *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Hal atau perihal surat..."
                  value={formMasuk.perihal}
                  onChange={(e) => setFormMasuk({ ...formMasuk, perihal: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instruksi Disposisi Kepala Desa / Sekdes
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Teruskan ke Kasi Pelayanan untuk dipelajari dan ditindaklanjuti..."
                  value={formMasuk.disposisi}
                  onChange={(e) => setFormMasuk({ ...formMasuk, disposisi: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Tindak Lanjut
                  </label>
                  <select
                    value={formMasuk.status}
                    onChange={(e) => setFormMasuk({ ...formMasuk, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Belum Ditindaklanjuti">Belum Ditindaklanjuti</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan Tambahan
                  </label>
                  <input
                    type="text"
                    placeholder="Lokasi berkas fisik, dll."
                    value={formMasuk.keterangan || ''}
                    onChange={(e) => setFormMasuk({ ...formMasuk, keterangan: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddMasukModalOpen(false);
                    setEditingSuratMasuk(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs cursor-pointer"
                >
                  {editingSuratMasuk ? 'Simpan Perubahan' : 'Catat Surat Masuk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Surat Keluar */}
      {(isAddKeluarModalOpen || editingSuratKeluar) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingSuratKeluar ? 'Edit Surat Keluar & Agenda' : 'Catat Surat Keluar Desa'}
                </h3>
                <p className="text-xs text-slate-400">
                  Registrasi buku agenda nomor surat keluar desa
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddKeluarModalOpen(false);
                  setEditingSuratKeluar(null);
                }}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitKeluar} className="p-4 sm:p-6 space-y-3.5">
              {/* Customizable Nomor Agenda Box */}
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                <label className="block text-xs font-bold text-emerald-900 mb-1 flex items-center justify-between">
                  <span className="flex items-center">
                    <Hash className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                    Nomor Agenda Keluar (Dapat Di-customisasi) *
                  </span>
                  <span className="text-[10px] text-emerald-600 font-normal">Customizable</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 005/AG-OUT/2026"
                  value={formKeluar.nomorAgenda}
                  onChange={(e) => setFormKeluar({ ...formKeluar, nomorAgenda: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg font-mono font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Surat Keluar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 005/090/Pemdes/IX/2026"
                  value={formKeluar.nomorSurat}
                  onChange={(e) => setFormKeluar({ ...formKeluar, nomorSurat: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Surat
                  </label>
                  <input
                    type="date"
                    required
                    value={formKeluar.tanggalSurat}
                    onChange={(e) => setFormKeluar({ ...formKeluar, tanggalSurat: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Penandatangan
                  </label>
                  <input
                    type="text"
                    required
                    value={formKeluar.penandatangan}
                    onChange={(e) => setFormKeluar({ ...formKeluar, penandatangan: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sifat Surat
                  </label>
                  <select
                    value={formKeluar.sifatSurat}
                    onChange={(e) => setFormKeluar({ ...formKeluar, sifatSurat: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Biasa">Biasa</option>
                    <option value="Penting">Penting</option>
                    <option value="Segera">Segera</option>
                    <option value="Rahasia">Rahasia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lampiran
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: - atau 1 Berkas"
                    value={formKeluar.lampiran}
                    onChange={(e) => setFormKeluar({ ...formKeluar, lampiran: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Penerima / Tujuan Surat *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Camat Ciawi, Seluruh Ketua RT/RW"
                  value={formKeluar.penerima}
                  onChange={(e) => setFormKeluar({ ...formKeluar, penerima: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Perihal Surat *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Perihal surat keluar..."
                  value={formKeluar.perihal}
                  onChange={(e) => setFormKeluar({ ...formKeluar, perihal: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Distribusi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dikirim via kurir pos / diserahkan langsung"
                  value={formKeluar.keterangan}
                  onChange={(e) => setFormKeluar({ ...formKeluar, keterangan: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddKeluarModalOpen(false);
                    setEditingSuratKeluar(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs cursor-pointer"
                >
                  {editingSuratKeluar ? 'Simpan Perubahan' : 'Simpan Surat Keluar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
