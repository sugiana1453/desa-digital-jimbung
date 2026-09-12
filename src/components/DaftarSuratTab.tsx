import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Search,
  Plus,
  Trash2,
  Filter,
  CheckCircle2,
  Calendar,
  User,
  ExternalLink,
  Clock,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { SuratDibuat, Penduduk, TipeSurat } from '../types';
import { formatTanggalIndo } from '../utils/formatters';

interface LetterTypeOption {
  id: string;
  label: string;
  shortName: string;
}

const LETTER_TYPE_OPTIONS: LetterTypeOption[] = [
  { id: 'SKU', label: 'SKU - Keterangan Usaha', shortName: 'SKU' },
  { id: 'SKTM', label: 'SKTM - Keterangan Tidak Mampu', shortName: 'SKTM' },
  { id: 'SKD', label: 'SKD - Keterangan Domisili', shortName: 'SKD' },
  { id: 'SKCK', label: 'SKCK - Pengantar Catatan Kepolisian', shortName: 'SKCK' },
  { id: 'BELUM_MENIKAH', label: 'Keterangan Belum Menikah', shortName: 'Belum Menikah' },
  { id: 'PENGANTAR_NIKAH', label: 'Pengantar Nikah (Model N1-N4)', shortName: 'Nikah (N1-N4)' },
  { id: 'PINDAH', label: 'Keterangan Pindah Domisili', shortName: 'Pindah' },
  { id: 'PINDAH_DATANG', label: 'Keterangan Pindah Datang', shortName: 'Pindah Datang' },
  { id: 'PINDAH_KELUAR', label: 'Keterangan Pindah Keluar', shortName: 'Pindah Keluar' },
  { id: 'TINGGAL_SEMENTARA', label: 'Keterangan Tinggal Sementara', shortName: 'Tinggal Smt.' },
  { id: 'KEMATIAN', label: 'Keterangan Kematian', shortName: 'Kematian' },
  { id: 'KELAHIRAN', label: 'Keterangan Kelahiran', shortName: 'Kelahiran' },
  { id: 'PENGANTAR_UMUM', label: 'Surat Pengantar Umum', shortName: 'Pengantar' },
  { id: 'KEHILANGAN', label: 'Keterangan Kehilangan', shortName: 'Kehilangan' },
  { id: 'KUASA', label: 'Surat Kuasa Desa', shortName: 'Kuasa' },
];

interface DaftarSuratTabProps {
  suratList: SuratDibuat[];
  penduduk: Penduduk[];
  recentlyCreatedId: string | null;
  onCetakSurat: (surat: SuratDibuat) => void;
  onDeleteSurat: (id: string) => void;
  onCreateNew: () => void;
}

export const DaftarSuratTab: React.FC<DaftarSuratTabProps> = ({
  suratList,
  penduduk,
  recentlyCreatedId,
  onCetakSurat,
  onDeleteSurat,
  onCreateNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipe, setFilterTipe] = useState<string>('ALL');
  const [filterBulan, setFilterBulan] = useState<string>('ALL');

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = suratList.length;
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const bulanIni = suratList.filter((s) => {
      const tgl = s.tanggalSurat || s.createdAt;
      return tgl.startsWith(currentMonthPrefix);
    }).length;

    // Unique residents served
    const uniqueResidents = new Set(suratList.map((s) => s.nik || s.pendudukId)).size;

    // Most common letter type
    const typeCounts: Record<string, number> = {};
    suratList.forEach((s) => {
      typeCounts[s.tipeSurat] = (typeCounts[s.tipeSurat] || 0) + 1;
    });
    let topType = '-';
    let maxCount = 0;
    Object.entries(typeCounts).forEach(([t, cnt]) => {
      if (cnt > maxCount) {
        maxCount = cnt;
        const cfg = LETTER_TYPE_OPTIONS.find((lt) => lt.id === t);
        topType = cfg ? cfg.shortName : t;
      }
    });

    return { total, bulanIni, uniqueResidents, topType, topCount: maxCount };
  }, [suratList]);

  // Filtered Letters
  const filteredSurat = useMemo(() => {
    return suratList.filter((s) => {
      // 1. Search Query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchNomor = s.nomorSurat?.toLowerCase().includes(q);
        const matchNama = s.namaPenduduk?.toLowerCase().includes(q);
        const matchNik = s.nik?.includes(q);
        const matchJudul = s.judulSurat?.toLowerCase().includes(q);
        const matchKeperluan = (s.fields?.keperluan || s.fields?.namaUsaha || '')
          .toLowerCase()
          .includes(q);

        if (!matchNomor && !matchNama && !matchNik && !matchJudul && !matchKeperluan) {
          return false;
        }
      }

      // 2. Filter Tipe Surat
      if (filterTipe !== 'ALL' && s.tipeSurat !== filterTipe) {
        return false;
      }

      // 3. Filter Bulan
      if (filterBulan !== 'ALL') {
        const tgl = s.tanggalSurat || s.createdAt;
        if (!tgl.startsWith(filterBulan)) {
          return false;
        }
      }

      return true;
    });
  }, [suratList, searchTerm, filterTipe, filterBulan]);

  const getTipeBadge = (tipe: TipeSurat) => {
    switch (tipe) {
      case 'SKU':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SKTM':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SKCK':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DOMISILI':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'KEMATIAN':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'KELAHIRAN':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div className="space-y-4" id="view-daftar-surat-desa">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Surat Terbit</span>
            <FileCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800 font-mono">
            {metrics.total} <span className="text-xs font-normal text-slate-500 font-sans">Berkas</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Buku register resmi desa</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Terbit Bulan Ini</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono">
            {metrics.bulanIni} <span className="text-xs font-normal text-slate-500 font-sans">Surat</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Periode {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Warga Terlayani</span>
            <User className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700 font-mono">
            {metrics.uniqueResidents} <span className="text-xs font-normal text-slate-500 font-sans">Pemohon</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">NIK terdaftar di buku register</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Jenis Terbanyak</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-slate-800 truncate">
            {metrics.topType}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {metrics.topCount > 0 ? `${metrics.topCount} surat diterbitkan` : 'Belum ada data'}
          </p>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari No Surat, Nama Warga, NIK..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            id="input-cari-daftar-surat"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Tipe Surat Filter */}
          <select
            value={filterTipe}
            onChange={(e) => setFilterTipe(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="filter-tipe-daftar-surat"
          >
            <option value="ALL">Semua Jenis Surat</option>
            {LETTER_TYPE_OPTIONS.map((lt) => (
              <option key={lt.id} value={lt.id}>
                {lt.label}
              </option>
            ))}
          </select>

          {/* New Letter Button */}
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all cursor-pointer ml-auto md:ml-0"
            id="btn-tambah-surat-baru"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            + Buat Surat Baru
          </button>
        </div>
      </div>

      {/* Main Table of Registered Letters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Buku Register Resmi Pelayanan Surat ({filteredSurat.length})
            </h3>
          </div>
          {searchTerm && (
            <span className="text-xs text-slate-500">
              Hasil pencarian: <span className="font-semibold text-slate-800">"{searchTerm}"</span>
            </span>
          )}
        </div>

        {filteredSurat.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700 mb-1">
              {searchTerm ? 'Tidak ada surat yang cocok' : 'Belum Ada Surat yang Diterbitkan'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              {searchTerm
                ? 'Coba gunakan kata kunci pencarian lain atau setel ulang filter.'
                : 'Mulai buat surat keterangan usaha, domisili, atau SKTM baru untuk warga desa.'}
            </p>
            <button
              onClick={onCreateNew}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Buat Surat Sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nomor Surat Resmi</th>
                  <th className="py-3 px-4">Pemohon (Warga)</th>
                  <th className="py-3 px-4">Jenis Surat</th>
                  <th className="py-3 px-4">Keperluan / Keterangan</th>
                  <th className="py-3 px-4">Tanggal Terbit</th>
                  <th className="py-3 px-4">Penandatangan</th>
                  <th className="py-3 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSurat.map((surat, index) => {
                  const isRecentlyCreated = surat.id === recentlyCreatedId;
                  const cfg = LETTER_TYPE_OPTIONS.find((lt) => lt.id === surat.tipeSurat);
                  const keperluanText =
                    surat.fields?.keperluan ||
                    surat.fields?.namaUsaha ||
                    surat.fields?.tujuanPindah ||
                    surat.fields?.keterangan ||
                    '-';

                  return (
                    <tr
                      key={surat.id}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        isRecentlyCreated
                          ? 'bg-emerald-50/80 border-l-4 border-emerald-500 animate-pulse'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-mono text-slate-500 font-semibold">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                            {surat.nomorSurat}
                          </span>
                          {isRecentlyCreated && (
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-emerald-600 text-white rounded shadow-2xs">
                              Baru
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold text-slate-900">{surat.namaPenduduk}</p>
                          <p className="font-mono text-[10px] text-slate-400">NIK: {surat.nik || '-'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getTipeBadge(
                            surat.tipeSurat
                          )}`}
                        >
                          {cfg ? cfg.shortName : surat.tipeSurat}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600" title={keperluanText}>
                        {keperluanText}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatTanggalIndo(surat.tanggalSurat || surat.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {surat.penandatangan === 'KADES' ? 'Kepala Desa' : 'Sekretaris Desa'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => onCetakSurat(surat)}
                            className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition-colors cursor-pointer"
                            title="Cetak Ulang / Pratinjau Surat"
                          >
                            <Printer className="w-3.5 h-3.5 mr-1" />
                            Cetak
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus surat no. ${surat.nomorSurat} dari register?`)) {
                                onDeleteSurat(surat.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus dari Register"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
