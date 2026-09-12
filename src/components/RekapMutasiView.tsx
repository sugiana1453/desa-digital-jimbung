import React, { useState, useMemo } from 'react';
import {
  Users,
  ArrowRightLeft,
  UserCheck,
  UserMinus,
  Clock,
  Baby,
  HeartCrack,
  Search,
  Filter,
  Download,
  Printer,
  FileSpreadsheet,
  Building2,
  Calendar,
  X,
  FileText,
  PlusCircle,
  Eye,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useDesa } from '../context/DesaContext';
import { SuratDibuat, TipeSurat } from '../types';
import { formatTanggalIndo } from '../utils/formatters';

interface RekapMutasiViewProps {
  onNavigateToCreateLetter?: (tipe: TipeSurat) => void;
  onPreviewLetter?: (letter: SuratDibuat) => void;
}

export const RekapMutasiView: React.FC<RekapMutasiViewProps> = ({
  onNavigateToCreateLetter,
  onPreviewLetter,
}) => {
  const { suratList, profile } = useDesa();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterBulan, setFilterBulan] = useState<string>('ALL');
  const [filterTahun, setFilterTahun] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  // Filter mutation-related letters
  const MUTATION_TYPES: TipeSurat[] = [
    'PINDAH_MASUK',
    'PINDAH_KELUAR',
    'DOMISILI_SEMENTARA',
    'KELAHIRAN',
    'KEMATIAN',
  ];

  const mutationLetters = useMemo(() => {
    return suratList.filter((s) => MUTATION_TYPES.includes(s.tipeSurat));
  }, [suratList]);

  // Extract years
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    mutationLetters.forEach((s) => {
      const year = s.tanggalSurat.slice(0, 4);
      if (year) set.add(year);
    });
    return Array.from(set).sort().reverse();
  }, [mutationLetters]);

  // Filtered letters
  const filteredLetters = useMemo(() => {
    return mutationLetters.filter((item) => {
      const matchType = filterType === 'ALL' || item.tipeSurat === filterType;
      const itemMonth = item.tanggalSurat.slice(5, 7);
      const itemYear = item.tanggalSurat.slice(0, 4);

      const matchBulan = filterBulan === 'ALL' || itemMonth === filterBulan;
      const matchTahun = filterTahun === 'ALL' || itemYear === filterTahun;

      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        item.namaPenduduk.toLowerCase().includes(q) ||
        item.nik.includes(q) ||
        item.nomorSurat.toLowerCase().includes(q) ||
        (item.fields.alasanPindah && item.fields.alasanPindah.toLowerCase().includes(q)) ||
        (item.fields.kabupatenAsal && item.fields.kabupatenAsal.toLowerCase().includes(q)) ||
        (item.fields.kabupatenTujuan && item.fields.kabupatenTujuan.toLowerCase().includes(q));

      return matchType && matchBulan && matchTahun && matchSearch;
    });
  }, [mutationLetters, filterType, filterBulan, filterTahun, searchQuery]);

  // Calculations for stats
  const stats = useMemo(() => {
    let pindahMasukCount = 0;
    let pindahMasukJiwa = 0;
    let pindahKeluarCount = 0;
    let pindahKeluarJiwa = 0;
    let domisiliSementaraCount = 0;
    let kelahiranCount = 0;
    let kematianCount = 0;

    mutationLetters.forEach((s) => {
      const pengikut = Number(s.fields.jumlahPengikut) || 0;
      const totalJiwa = 1 + pengikut; // Pemohon + Pengikut

      if (s.tipeSurat === 'PINDAH_MASUK') {
        pindahMasukCount += 1;
        pindahMasukJiwa += totalJiwa;
      } else if (s.tipeSurat === 'PINDAH_KELUAR') {
        pindahKeluarCount += 1;
        pindahKeluarJiwa += totalJiwa;
      } else if (s.tipeSurat === 'DOMISILI_SEMENTARA') {
        domisiliSementaraCount += 1;
      } else if (s.tipeSurat === 'KELAHIRAN') {
        kelahiranCount += 1;
      } else if (s.tipeSurat === 'KEMATIAN') {
        kematianCount += 1;
      }
    });

    const netJiwa = pindahMasukJiwa + kelahiranCount - (pindahKeluarJiwa + kematianCount);

    return {
      pindahMasukCount,
      pindahMasukJiwa,
      pindahKeluarCount,
      pindahKeluarJiwa,
      domisiliSementaraCount,
      kelahiranCount,
      kematianCount,
      netJiwa,
    };
  }, [mutationLetters]);

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    const rows = filteredLetters.map((item, index) => {
      let jenisText = '';
      let rincianAsalTujuan = '-';
      const pengikut = Number(item.fields.jumlahPengikut) || 0;
      const totalJiwa = 1 + pengikut;

      switch (item.tipeSurat) {
        case 'PINDAH_MASUK':
          jenisText = 'Pindah Masuk (Datang)';
          rincianAsalTujuan = `Asal: ${item.fields.desaAsal || '-'}, Kec. ${item.fields.kecamatanAsal || '-'}, Kab. ${item.fields.kabupatenAsal || '-'} | Alasan: ${item.fields.alasanPindah || '-'}`;
          break;
        case 'PINDAH_KELUAR':
          jenisText = 'Pindah Keluar';
          rincianAsalTujuan = `Tujuan: ${item.fields.desaTujuan || '-'}, Kec. ${item.fields.kecamatanTujuan || '-'}, Kab. ${item.fields.kabupatenTujuan || '-'} | Alasan: ${item.fields.alasanPindah || '-'}`;
          break;
        case 'DOMISILI_SEMENTARA':
          jenisText = 'Domisili Sementara (Non-Permanen)';
          rincianAsalTujuan = `Asal KTP: ${item.fields.alamatAsalKtp || '-'} | Tinggal di: ${item.fields.alamatTinggalSementara || '-'} | Berlaku s.d: ${item.fields.berlakuHingga || '-'}`;
          break;
        case 'KELAHIRAN':
          jenisText = 'Kelahiran';
          rincianAsalTujuan = `Bayi: ${item.fields.namaBayi || '-'} | Ayah: ${item.fields.namaAyah || '-'} | Ibu: ${item.fields.namaIbu || '-'}`;
          break;
        case 'KEMATIAN':
          jenisText = 'Kematian';
          rincianAsalTujuan = `Meninggal: ${item.fields.hariMeninggal || '-'}, ${item.fields.tanggalMeninggal || '-'} | Sebab: ${item.fields.sebabMeninggal || '-'}`;
          break;
        default:
          jenisText = item.tipeSurat;
      }

      return {
        'No.': index + 1,
        'Nomor Surat': item.nomorSurat,
        'Tanggal Surat': item.tanggalSurat,
        'Nama Penduduk / Pemohon': item.namaPenduduk,
        'NIK': item.nik,
        'Jenis Mutasi': jenisText,
        'Rincian Asal / Tujuan / Keterangan': rincianAsalTujuan,
        'Jumlah Pengikut': pengikut,
        'Total Jiwa': totalJiwa,
        'Penandatangan': item.penandatangan,
        'Keperluan': item.fields.keperluan || '-',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 5 },  // No
      { wch: 26 }, // Nomor Surat
      { wch: 14 }, // Tanggal Surat
      { wch: 25 }, // Nama Penduduk
      { wch: 18 }, // NIK
      { wch: 25 }, // Jenis Mutasi
      { wch: 50 }, // Rincian
      { wch: 16 }, // Jumlah Pengikut
      { wch: 12 }, // Total Jiwa
      { wch: 18 }, // Penandatangan
      { wch: 35 }, // Keperluan
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Mutasi Penduduk');

    const todayStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Rekap_Mutasi_Penduduk_Desa_${profile.namaDesa}_${todayStr}.xlsx`);
  };

  const getBadgeForType = (tipe: TipeSurat) => {
    switch (tipe) {
      case 'PINDAH_MASUK':
        return {
          label: 'Pindah Masuk',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: UserCheck,
        };
      case 'PINDAH_KELUAR':
        return {
          label: 'Pindah Keluar',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: UserMinus,
        };
      case 'DOMISILI_SEMENTARA':
        return {
          label: 'Domisili Sementara',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: Clock,
        };
      case 'KELAHIRAN':
        return {
          label: 'Kelahiran',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: Baby,
        };
      case 'KEMATIAN':
        return {
          label: 'Kematian',
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: HeartCrack,
        };
      default:
        return {
          label: tipe,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: FileText,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <ArrowRightLeft className="w-5 h-5 mr-2 text-blue-600" />
            Rekapitulasi Mutasi & Mobilitas Penduduk
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Dihimpun otomatis secara real-time berdasarkan surat pindah masuk, pindah keluar, domisili sementara, dan peristiwa kependudukan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            id="btn-export-excel-mutasi"
            title="Ekspor seluruh rekap mutasi ke format Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            Export Excel
          </button>

          <button
            onClick={() => setIsPrintPreviewOpen(true)}
            className="inline-flex items-center px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            id="btn-cetak-rekap-mutasi"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Cetak Laporan Resmi
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Pindah Masuk */}
        <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase">Pindah Masuk</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-900">+{stats.pindahMasukJiwa}</span>
            <span className="text-[10px] text-slate-500 ml-1">Jiwa</span>
          </div>
          <p className="text-[10px] text-emerald-600 mt-0.5">
            {stats.pindahMasukCount} Surat Diterbitkan
          </p>
        </div>

        {/* Pindah Keluar */}
        <div className="bg-white p-3.5 rounded-xl border border-rose-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-800 uppercase">Pindah Keluar</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserMinus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-900">-{stats.pindahKeluarJiwa}</span>
            <span className="text-[10px] text-slate-500 ml-1">Jiwa</span>
          </div>
          <p className="text-[10px] text-rose-600 mt-0.5">
            {stats.pindahKeluarCount} Surat Diterbitkan
          </p>
        </div>

        {/* Domisili Sementara */}
        <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-800 uppercase">Dom. Sementara</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-900">{stats.domisiliSementaraCount}</span>
            <span className="text-[10px] text-slate-500 ml-1">Orang</span>
          </div>
          <p className="text-[10px] text-amber-700 mt-0.5">Warga Non-Permanen</p>
        </div>

        {/* Kelahiran */}
        <div className="bg-white p-3.5 rounded-xl border border-purple-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-purple-800 uppercase">Kelahiran</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Baby className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-900">+{stats.kelahiranCount}</span>
            <span className="text-[10px] text-slate-500 ml-1">Bayi</span>
          </div>
          <p className="text-[10px] text-purple-600 mt-0.5">Penambahan Alami</p>
        </div>

        {/* Kematian */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600 uppercase">Kematian</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <HeartCrack className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-900">-{stats.kematianCount}</span>
            <span className="text-[10px] text-slate-500 ml-1">Jiwa</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Pengurangan Alami</p>
        </div>

        {/* Dinamika Bersih */}
        <div className="bg-blue-600 text-white p-3.5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-blue-100">Dinamika Netto</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold">
              {stats.netJiwa >= 0 ? `+${stats.netJiwa}` : stats.netJiwa}
            </span>
            <span className="text-[10px] text-blue-100 ml-1">Jiwa Bersih</span>
          </div>
          <p className="text-[10px] text-blue-200 mt-0.5">Pertumbuhan Desa</p>
        </div>
      </div>

      {/* Quick Action to Create Mutation Letters */}
      {onNavigateToCreateLetter && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-slate-50 p-4 rounded-xl border border-blue-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center">
              <PlusCircle className="w-4 h-4 mr-1.5 text-blue-600" />
              Buat Surat Mutasi & Mobilitas Kependudukan Baru
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Klik salah satu jenis surat mutasi untuk langsung mengisi formulir resmi desa:
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateToCreateLetter('PINDAH_MASUK')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              + Pindah Masuk
            </button>
            <button
              onClick={() => onNavigateToCreateLetter('PINDAH_KELUAR')}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              + Pindah Keluar
            </button>
            <button
              onClick={() => onNavigateToCreateLetter('DOMISILI_SEMENTARA')}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              + Domisili Sementara
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama warga, NIK, no surat, asal/tujuan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filter Jenis Mutasi */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="select-filter-mutasi-type"
          >
            <option value="ALL">Semua Jenis Mutasi</option>
            <option value="PINDAH_MASUK">Pindah Masuk (Datang)</option>
            <option value="PINDAH_KELUAR">Pindah Keluar</option>
            <option value="DOMISILI_SEMENTARA">Domisili Sementara</option>
            <option value="KELAHIRAN">Kelahiran</option>
            <option value="KEMATIAN">Kematian</option>
          </select>

          {/* Filter Bulan */}
          <select
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="select-filter-mutasi-bulan"
          >
            <option value="ALL">Semua Bulan</option>
            <option value="01">Januari</option>
            <option value="02">Februari</option>
            <option value="03">Maret</option>
            <option value="04">April</option>
            <option value="05">Mei</option>
            <option value="06">Juni</option>
            <option value="07">Juli</option>
            <option value="08">Agustus</option>
            <option value="09">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>

          {/* Filter Tahun */}
          <select
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="select-filter-mutasi-tahun"
          >
            <option value="ALL">Semua Tahun</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                Tahun {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Mutation Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center">
            <Users className="w-4 h-4 mr-2 text-blue-600" />
            Daftar Registrasi Mutasi ({filteredLetters.length} Data)
          </h3>
          <span className="text-[11px] text-slate-400">
            Terhubung langsung dengan buku register surat desa
          </span>
        </div>

        {filteredLetters.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <ArrowRightLeft className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">
              Belum ada data mutasi yang sesuai dengan filter pencarian.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Surat pindah masuk, pindah keluar, dan domisili sementara yang diterbitkan akan otomatis tertera di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">No</th>
                  <th className="py-3 px-3">Tanggal & No. Surat</th>
                  <th className="py-3 px-3">Nama Pemohon & NIK</th>
                  <th className="py-3 px-3">Jenis Mutasi</th>
                  <th className="py-3 px-3">Rincian Wilayah Asal / Tujuan</th>
                  <th className="py-3 px-3 text-center">Pengikut / Jiwa</th>
                  <th className="py-3 px-3">Penandatangan</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLetters.map((item, index) => {
                  const badge = getBadgeForType(item.tipeSurat);
                  const Icon = badge.icon;
                  const pengikut = Number(item.fields.jumlahPengikut) || 0;
                  const totalJiwa = 1 + pengikut;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900 block font-mono text-[11px]">
                          {item.nomorSurat}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center mt-0.5">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatTanggalIndo(item.tanggalSurat)}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900 block">{item.namaPenduduk}</span>
                        <span className="text-[11px] text-slate-500 font-mono">NIK: {item.nik}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded border ${badge.bg}`}
                        >
                          <Icon className="w-3 h-3 mr-1" />
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        {item.tipeSurat === 'PINDAH_MASUK' && (
                          <div className="text-[11px]">
                            <span className="text-slate-500">Asal: </span>
                            <span className="font-medium text-slate-800">
                              {item.fields.desaAsal || item.fields.alamatAsal}, Kec. {item.fields.kecamatanAsal || '-'}, Kab. {item.fields.kabupatenAsal || '-'}
                            </span>
                            {item.fields.alasanPindah && (
                              <span className="block text-[10px] text-emerald-700 mt-0.5">
                                Alasan: {item.fields.alasanPindah}
                              </span>
                            )}
                          </div>
                        )}

                        {item.tipeSurat === 'PINDAH_KELUAR' && (
                          <div className="text-[11px]">
                            <span className="text-slate-500">Tujuan: </span>
                            <span className="font-medium text-slate-800">
                              {item.fields.desaTujuan || item.fields.alamatTujuan}, Kec. {item.fields.kecamatanTujuan || '-'}, Kab. {item.fields.kabupatenTujuan || '-'}
                            </span>
                            {item.fields.alasanPindah && (
                              <span className="block text-[10px] text-rose-700 mt-0.5">
                                Alasan: {item.fields.alasanPindah}
                              </span>
                            )}
                          </div>
                        )}

                        {item.tipeSurat === 'DOMISILI_SEMENTARA' && (
                          <div className="text-[11px]">
                            <span className="text-slate-500">KTP Asal: </span>
                            <span className="font-medium text-slate-800 truncate block">
                              {item.fields.alamatAsalKtp || '-'}
                            </span>
                            <span className="text-[10px] text-amber-800 block mt-0.5">
                              Tujuan: {item.fields.tujuanTinggal || 'Bekerja'} (s.d. {item.fields.berlakuHingga ? formatTanggalIndo(item.fields.berlakuHingga) : '-'})
                            </span>
                          </div>
                        )}

                        {item.tipeSurat === 'KELAHIRAN' && (
                          <div className="text-[11px]">
                            <span className="font-semibold text-purple-800">
                              Bayi: {item.fields.namaBayi}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              Ortu: {item.fields.namaAyah} & {item.fields.namaIbu}
                            </span>
                          </div>
                        )}

                        {item.tipeSurat === 'KEMATIAN' && (
                          <div className="text-[11px]">
                            <span className="text-slate-600">
                              Meninggal di {item.fields.tempatMeninggal || 'Kediaman'}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              Sebab: {item.fields.sebabMeninggal || 'Sakit Medis'}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-slate-800 text-xs">{totalJiwa} Jiwa</span>
                        {pengikut > 0 && (
                          <span className="block text-[10px] text-slate-400">
                            (+{pengikut} pengikut)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-[11px] text-slate-600">
                        {item.penandatangan}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {onPreviewLetter && (
                          <button
                            onClick={() => onPreviewLetter(item)}
                            className="inline-flex items-center px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition-colors cursor-pointer"
                            title="Pratinjau Surat Resmi"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Lihat
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Cetak Laporan Resmi Rekap Mutasi (A4 Sheet Ready) */}
      {isPrintPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between no-print">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-sm">Pratinjau Cetak Laporan Rekapitulasi Mutasi Penduduk</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs flex items-center cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" /> Cetak Sekarang (A4)
                </button>
                <button
                  onClick={() => setIsPrintPreviewOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content Sheet */}
            <div className="p-8 sm:p-12 overflow-y-auto flex-1 font-serif text-slate-900 printable-sheet">
              {/* KOP SURAT DESA */}
              <div className="text-center relative pb-3 border-b-4 border-double border-slate-900 mb-6">
                <div className="flex items-center justify-center space-x-4 mb-1">
                  <div className="w-14 h-14 rounded-full border-2 border-slate-900 flex items-center justify-center p-1">
                    <Building2 className="w-8 h-8 text-slate-800" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold tracking-wider uppercase font-sans">
                      PEMERINTAH KABUPATEN {profile.kabupaten.toUpperCase()}
                    </h3>
                    <h4 className="text-xs sm:text-sm font-bold tracking-wider uppercase font-sans">
                      KECAMATAN {profile.kecamatan.toUpperCase()}
                    </h4>
                    <h2 className="text-base sm:text-lg font-extrabold tracking-wide uppercase font-sans">
                      KANTOR KEPALA DESA {profile.namaDesa.toUpperCase()}
                    </h2>
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-700 italic font-sans">
                  {profile.alamatKantor} &bull; Telp: {profile.telepon} &bull; Kode Pos: {profile.kodePos}
                </p>
              </div>

              {/* JUDUL LAPORAN */}
              <div className="text-center mb-6 font-sans">
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide underline">
                  LAPORAN REKAPITULASI MUTASI PENDUDUK
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Desa {profile.namaDesa}, Kecamatan {profile.kecamatan}, Kabupaten {profile.kabupaten}
                </p>
                <p className="text-[11px] text-slate-500">
                  Periode Laporan: {filterBulan === 'ALL' ? 'Semua Bulan' : `Bulan ${filterBulan}`} {filterTahun === 'ALL' ? '' : `Tahun ${filterTahun}`}
                </p>
              </div>

              {/* STATISTIK RINGKASAN */}
              <div className="mb-6 grid grid-cols-5 gap-2 text-center font-sans text-xs">
                <div className="p-2 border border-slate-300 rounded">
                  <span className="text-[10px] text-slate-500 block uppercase">Pindah Masuk</span>
                  <span className="font-bold text-sm text-slate-900">+{stats.pindahMasukJiwa} Jiwa</span>
                </div>
                <div className="p-2 border border-slate-300 rounded">
                  <span className="text-[10px] text-slate-500 block uppercase">Pindah Keluar</span>
                  <span className="font-bold text-sm text-slate-900">-{stats.pindahKeluarJiwa} Jiwa</span>
                </div>
                <div className="p-2 border border-slate-300 rounded">
                  <span className="text-[10px] text-slate-500 block uppercase">Dom. Sementara</span>
                  <span className="font-bold text-sm text-slate-900">{stats.domisiliSementaraCount} Orang</span>
                </div>
                <div className="p-2 border border-slate-300 rounded">
                  <span className="text-[10px] text-slate-500 block uppercase">Lahir / Mati</span>
                  <span className="font-bold text-sm text-slate-900">+{stats.kelahiranCount} / -{stats.kematianCount}</span>
                </div>
                <div className="p-2 border border-slate-900 bg-slate-50 rounded">
                  <span className="text-[10px] text-slate-600 block uppercase font-bold">Netto Pertumbuhan</span>
                  <span className="font-bold text-sm text-blue-900">
                    {stats.netJiwa >= 0 ? `+${stats.netJiwa}` : stats.netJiwa} Jiwa
                  </span>
                </div>
              </div>

              {/* TABEL MUTASI A4 */}
              <table className="w-full border-collapse border border-slate-400 text-[10px] font-sans mb-8">
                <thead className="bg-slate-100 text-slate-900">
                  <tr>
                    <th className="border border-slate-300 p-1.5 text-center w-8">No</th>
                    <th className="border border-slate-300 p-1.5">No. Surat & Tgl</th>
                    <th className="border border-slate-300 p-1.5">Nama & NIK</th>
                    <th className="border border-slate-300 p-1.5">Jenis Mutasi</th>
                    <th className="border border-slate-300 p-1.5">Asal / Tujuan</th>
                    <th className="border border-slate-300 p-1.5 text-center">Pengikut</th>
                    <th className="border border-slate-300 p-1.5 text-center">Total Jiwa</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLetters.map((item, idx) => {
                    const pengikut = Number(item.fields.jumlahPengikut) || 0;
                    return (
                      <tr key={item.id}>
                        <td className="border border-slate-300 p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-slate-300 p-1.5 font-mono">
                          {item.nomorSurat}
                          <br />
                          <span className="text-slate-500">{formatTanggalIndo(item.tanggalSurat)}</span>
                        </td>
                        <td className="border border-slate-300 p-1.5">
                          <strong>{item.namaPenduduk}</strong>
                          <br />
                          <span className="font-mono text-[9px] text-slate-500">{item.nik}</span>
                        </td>
                        <td className="border border-slate-300 p-1.5 font-semibold">
                          {item.tipeSurat.replace('_', ' ')}
                        </td>
                        <td className="border border-slate-300 p-1.5">
                          {item.tipeSurat === 'PINDAH_MASUK' && `Dari: ${item.fields.kabupatenAsal || item.fields.alamatAsal || '-'}`}
                          {item.tipeSurat === 'PINDAH_KELUAR' && `Ke: ${item.fields.kabupatenTujuan || item.fields.alamatTujuan || '-'}`}
                          {item.tipeSurat === 'DOMISILI_SEMENTARA' && `KTP: ${item.fields.alamatAsalKtp || '-'}`}
                          {item.tipeSurat === 'KELAHIRAN' && `Bayi: ${item.fields.namaBayi || '-'}`}
                          {item.tipeSurat === 'KEMATIAN' && `Di: ${item.fields.tempatMeninggal || '-'}`}
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center">{pengikut}</td>
                        <td className="border border-slate-300 p-1.5 text-center font-bold">{1 + pengikut}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* TANDA TANGAN */}
              <div className="grid grid-cols-2 gap-8 text-center font-sans text-xs">
                <div></div>
                <div>
                  <p>{profile.namaDesa}, {formatTanggalIndo(new Date())}</p>
                  <p className="font-bold mt-1 uppercase">KEPALA DESA {profile.namaDesa.toUpperCase()}</p>
                  <div className="h-20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border border-blue-600/30 text-blue-800/40 flex items-center justify-center rotate-[-10deg] text-[8px] font-bold uppercase text-center pointer-events-none">
                      PEMERINTAH DESA<br />{profile.namaDesa}
                    </div>
                  </div>
                  <p className="font-bold underline uppercase">{profile.namaKades}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
