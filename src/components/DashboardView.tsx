import React, { useState } from 'react';
import {
  Users,
  FileText,
  FolderArchive,
  Mail,
  PlusCircle,
  FilePlus,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Calendar,
  CheckCircle2,
  Search,
  Check,
  AlertCircle,
  Printer,
  Send,
} from 'lucide-react';
import { useDesa } from '../context/DesaContext';
import { formatTanggalIndo } from '../utils/formatters';

export const DashboardView: React.FC = () => {
  const {
    penduduk,
    suratList,
    arsip,
    suratMasuk,
    profile,
    setActiveTab,
    setSelectedLetterForPrint,
  } = useDesa();

  // Quick NIK Search state
  const [quickNik, setQuickNik] = useState('');
  const [nikSearchResult, setNikSearchResult] = useState<{
    found: boolean;
    name?: string;
    id?: string;
  } | null>(null);

  const handleQuickNikSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNik.trim()) return;
    const foundResident = penduduk.find(
      (p) => p.nik.includes(quickNik.trim()) || p.nama.toLowerCase().includes(quickNik.toLowerCase())
    );
    if (foundResident) {
      setNikSearchResult({ found: true, name: foundResident.nama, id: foundResident.id });
    } else {
      setNikSearchResult({ found: false });
    }
  };

  // Calculations
  const totalPenduduk = penduduk.length;
  const totalLaki = penduduk.filter((p) => p.jenisKelamin === 'L').length;
  const totalPerempuan = penduduk.filter((p) => p.jenisKelamin === 'P').length;
  const kepalaKeluargaCount = penduduk.filter(
    (p) => p.statusKeluarga === 'Kepala Keluarga'
  ).length;

  // Group by Dusun
  const dusunMap: Record<string, number> = {};
  penduduk.forEach((p) => {
    const d = p.dusun || 'Dusun Lain';
    dusunMap[d] = (dusunMap[d] || 0) + 1;
  });

  const pendingSuratMasuk = suratMasuk.filter(
    (sm) => sm.status === 'Belum Ditindaklanjuti' || sm.status === 'Diproses'
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-xl p-6 text-white border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Sistem Informasi Desa Terpadu</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
            Selamat Datang di Desa Digital {profile.namaDesa}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Pusat kendali administrasi desa: integrasi data penduduk, pembuatan surat resmi instan, pengarsipan Perdes & SK, serta buku register surat masuk/keluar.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveTab('surat')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              id="dash-btn-buat-surat"
            >
              <FilePlus className="w-4 h-4" />
              Buat Surat Warga
            </button>
            <button
              onClick={() => setActiveTab('penduduk')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-md text-xs sm:text-sm font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              id="dash-btn-data-penduduk"
            >
              <Users className="w-4 h-4 text-blue-400" />
              Kelola Data Penduduk
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid (4 columns in Professional Polish theme) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Penduduk */}
        <div
          onClick={() => setActiveTab('penduduk')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer"
          id="kpi-card-penduduk"
        >
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Total Penduduk
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{totalPenduduk}</h3>
          <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1">
            <span>+{totalPenduduk} Jiwa Terdaftar</span>
          </p>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>{totalLaki} L / {totalPerempuan} P</span>
            <span className="text-blue-600 font-semibold flex items-center">
              Lihat <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Surat Terbit */}
        <div
          onClick={() => setActiveTab('surat')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer"
          id="kpi-card-surat"
        >
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Surat Terbit
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{suratList.length}</h3>
          <p className="text-xs text-slate-400 mt-2 font-medium">Buku Register Terbit</p>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Arsip Otomatis</span>
            <span className="text-blue-600 font-semibold flex items-center">
              Buat <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Arsip Desa */}
        <div
          onClick={() => setActiveTab('arsip')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer"
          id="kpi-card-arsip"
        >
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Arsip Desa
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{arsip.length}</h3>
          <p className="text-xs text-slate-400 mt-2 font-medium">Perdes, SK & Dokumen</p>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Peraturan & SK</span>
            <span className="text-blue-600 font-semibold flex items-center">
              Buka <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Surat Masuk */}
        <div
          onClick={() => setActiveTab('surat-mk')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer"
          id="kpi-card-surat-masuk"
        >
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            Surat Masuk
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-blue-600">
            {pendingSuratMasuk}
          </h3>
          <p className="text-xs text-blue-500 mt-2 font-semibold">Perlu Respon / Disposisi</p>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Total: {suratMasuk.length} surat</span>
            <span className="text-blue-600 font-semibold flex items-center">
              Disposisi <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Col-Span 2 (Antrean Surat Terbaru) + Col-Span 1 (Akses Cepat Arsip & Quick NIK) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Antrean Surat Terbaru (Table) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-slate-800 text-base">Antrean Surat Terbaru</h4>
              <p className="text-xs text-slate-400 mt-0.5">Surat pelayanan masyarakat yang telah diterbitkan</p>
            </div>
            <span
              onClick={() => setActiveTab('surat')}
              className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer font-semibold"
            >
              Lihat Semua ({suratList.length})
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase text-slate-400 font-bold border-b border-slate-100">
                  <th className="px-5 py-3">Nama Pemohon</th>
                  <th className="px-5 py-3">Jenis Surat</th>
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {suratList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                      Belum ada surat yang diterbitkan. Klik tombol "+ Buat Surat Baru" di atas.
                    </td>
                  </tr>
                ) : (
                  suratList.slice(0, 5).map((surat) => (
                    <tr key={surat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 text-sm">
                          {surat.namaPenduduk}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          NIK: {surat.nik}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold text-slate-700 block">
                          {surat.tipeSurat}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[160px] block">
                          {surat.nomorSurat}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                        {formatTanggalIndo(surat.tanggalSurat)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">
                          SELESAI
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedLetterForPrint(surat);
                            setActiveTab('surat');
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                          title="Cetak Surat Resmi"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Cetak</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Akses Cepat Arsip & Pencarian Cepat NIK Widget */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-base">Akses Cepat Arsip</h4>
              <p className="text-xs text-slate-400 mt-0.5">Dokumen penting hukum dan tata praja desa</p>
            </div>

            <div className="p-5 space-y-3">
              {/* SK Kepala Desa */}
              <div
                onClick={() => setActiveTab('arsip')}
                className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                id="quick-arsip-sk"
              >
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 font-bold text-xs shadow-xs">
                  SK
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">SK Kepala Desa</p>
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Folder Digital &bull; {arsip.filter(a => a.jenis === 'SK_KADES').length} Berkas</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Peraturan Desa */}
              <div
                onClick={() => setActiveTab('arsip')}
                className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                id="quick-arsip-perdes"
              >
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-xs shadow-xs">
                  RP
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">Peraturan Desa (Perdes)</p>
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Arsip Hukum &bull; {arsip.filter(a => a.jenis === 'PERDES').length} Berkas</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </div>

              {/* Surat Masuk Umum */}
              <div
                onClick={() => setActiveTab('surat-mk')}
                className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                id="quick-arsip-surat-masuk"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs shadow-xs">
                  IN
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">Surat Masuk Umum</p>
                  <p className="text-[10px] text-slate-400 uppercase font-medium">Administrasi &bull; {pendingSuratMasuk} Perlu Respon</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Pencarian Cepat NIK Widget */}
          <div className="p-5 pt-0">
            <div className="border-t border-slate-100 pt-4">
              <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-blue-600" />
                  Pencarian Cepat NIK
                </p>
                <p className="text-[11px] text-blue-700/80 mb-2.5">
                  Cari warga untuk langsung buat surat atau cek profil.
                </p>
                <form onSubmit={handleQuickNikSearch} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Masukkan NIK atau Nama..."
                    value={quickNik}
                    onChange={(e) => setQuickNik(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white border border-blue-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="input-quick-nik"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-md text-xs font-bold shadow-xs transition-colors cursor-pointer active:scale-95"
                    id="btn-quick-nik-cari"
                  >
                    CARI
                  </button>
                </form>

                {nikSearchResult && (
                  <div className="mt-3 p-2.5 bg-white rounded-lg border border-blue-200 text-xs">
                    {nikSearchResult.found ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800">{nikSearchResult.name}</p>
                          <p className="text-[10px] text-emerald-600 font-semibold flex items-center">
                            <Check className="w-3 h-3 mr-1" /> Warga Terdaftar
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            if (nikSearchResult.id) {
                              sessionStorage.setItem('desa_target_penduduk_id', nikSearchResult.id);
                            }
                            setActiveTab('surat');
                          }}
                          className="bg-blue-600 text-white px-2.5 py-1 rounded text-[11px] font-bold hover:bg-blue-500 cursor-pointer"
                        >
                          Buat Surat
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center text-[11px] text-amber-700">
                          <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                          Tidak ditemukan
                        </span>
                        <button
                          onClick={() => setActiveTab('penduduk')}
                          className="text-blue-600 font-semibold hover:underline text-[11px]"
                        >
                          Tambah Warga
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
          <span className="w-2 h-2 rounded-full bg-blue-600 mr-2" />
          Aksi Cepat Pelayanan Desa
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => setActiveTab('surat')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 transition-all text-center group cursor-pointer"
            id="quick-action-sku"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FilePlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Cetak Surat SKU</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Keterangan Usaha</span>
          </button>

          <button
            onClick={() => setActiveTab('surat')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 transition-all text-center group cursor-pointer"
            id="quick-action-sktm"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Cetak SKTM</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Bantuan & Sekolah</span>
          </button>

          <button
            onClick={() => setActiveTab('penduduk')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 transition-all text-center group cursor-pointer"
            id="quick-action-tambah-warga"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Tambah Penduduk</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Input NIK & KK Baru</span>
          </button>

          <button
            onClick={() => setActiveTab('surat-mk')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 transition-all text-center group cursor-pointer"
            id="quick-action-surat-masuk"
          >
            <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Surat Masuk ({pendingSuratMasuk})</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Scan AI & Disposisi</span>
          </button>

          <button
            onClick={() => setActiveTab('buat-surat-keluar')}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition-all text-center group cursor-pointer"
            id="quick-action-surat-keluar"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800">Buat Surat Keluar</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Custom Agenda & Kop</span>
          </button>
        </div>
      </div>

      {/* Sebaran Wilayah Dusun */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center">
          <MapPin className="w-4 h-4 mr-1.5 text-blue-600" />
          Sebaran Warga per Wilayah Dusun
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(dusunMap).map(([dusun, count]) => {
            const pct = totalPenduduk > 0 ? Math.round((count / totalPenduduk) * 100) : 0;
            return (
              <div key={dusun} className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{dusun}</span>
                  <span className="text-blue-600">{count} Jiwa ({pct}%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

