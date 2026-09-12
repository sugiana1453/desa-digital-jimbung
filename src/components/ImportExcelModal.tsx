import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
  Check,
} from 'lucide-react';
import { Penduduk, JenisKelamin, Agama, StatusPerkawinan, StatusHubunganKeluarga } from '../types';
import { findDusunByRw, normalizeDusunName, normalizeRw } from '../utils/dusunConfig';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedResidents: Omit<Penduduk, 'id' | 'createdAt'>[]) => void;
  existingNiks?: Set<string>;
  existingPenduduk?: Penduduk[];
}

interface ParsedResidentRow {
  rowNum: number;
  data: Omit<Penduduk, 'id' | 'createdAt'>;
  isValid: boolean;
  isDuplicate: boolean;
  statusType: 'NEW' | 'TRANSFER' | 'UPDATE' | 'JOIN';
  statusLabel: string;
  errors: string[];
  selected: boolean;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  existingNiks,
  existingPenduduk = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedResidentRow[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Download Excel Template
  const handleDownloadTemplate = () => {
    try {
      const templateData = [
        {
          'NIK (16 Digit)': '3201011508820099',
          'No KK (16 Digit)': '3201011005120088',
          'Nama Lengkap': 'Ahmad Dahlan',
          'Jenis Kelamin (L/P)': 'L',
          'Tempat Lahir': 'Bogor',
          'Tanggal Lahir (YYYY-MM-DD)': '1988-05-20',
          'Agama': 'Islam',
          'Status Perkawinan': 'Kawin',
          'Pekerjaan': 'Wiraswasta',
          'Pendidikan': 'SMA / Sederajat',
          'Alamat': 'Jl. Melati Kp. Babakan No. 10',
          'RT': '01',
          'RW': '01',
          'Dusun / Dukuh': 'Dusun 1',
          'Status Hubungan Keluarga': 'Kepala Keluarga',
          'Kewarganegaraan': 'WNI',
          'No HP': '081234567890',
        },
        {
          'NIK (16 Digit)': '3201015508850098',
          'No KK (16 Digit)': '3201011005120088',
          'Nama Lengkap': 'Fatimah Az-Zahra',
          'Jenis Kelamin (L/P)': 'P',
          'Tempat Lahir': 'Sukabumi',
          'Tanggal Lahir (YYYY-MM-DD)': '1990-08-15',
          'Agama': 'Islam',
          'Status Perkawinan': 'Kawin',
          'Pekerjaan': 'Mengurus Rumah Tangga',
          'Pendidikan': 'Diploma III',
          'Alamat': 'Jl. Melati Kp. Babakan No. 10',
          'RT': '01',
          'RW': '01',
          'Dusun / Dukuh': 'Dusun 1',
          'Status Hubungan Keluarga': 'Istri',
          'Kewarganegaraan': 'WNI',
          'No HP': '081234567891',
        },
        {
          'NIK (16 Digit)': '3201011010150097',
          'No KK (16 Digit)': '3201011005120088',
          'Nama Lengkap': 'Farhan Dahlan',
          'Jenis Kelamin (L/P)': 'L',
          'Tempat Lahir': 'Bogor',
          'Tanggal Lahir (YYYY-MM-DD)': '2015-10-10',
          'Agama': 'Islam',
          'Status Perkawinan': 'Belum Kawin',
          'Pekerjaan': 'Pelajar / Mahasiswa',
          'Pendidikan': 'SD / Sederajat',
          'Alamat': 'Jl. Melati Kp. Babakan No. 10',
          'RT': '01',
          'RW': '01',
          'Dusun / Dukuh': 'Dusun 1',
          'Status Hubungan Keluarga': 'Anak',
          'Kewarganegaraan': 'WNI',
          'No HP': '',
        },
      ];

      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data_Penduduk');
      XLSX.writeFile(workbook, 'Template_Import_Penduduk_Desa.xlsx');
    } catch (e) {
      console.error('Download template error:', e);
      alert('Gagal mendownload template Excel.');
    }
  };

  // Convert Excel date serial or raw date to YYYY-MM-DD
  const parseExcelDate = (val: any): string => {
    if (!val) return '1990-01-01';
    if (typeof val === 'number') {
      // Excel serial date to JS Date
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      return date.toISOString().split('T')[0];
    }
    const str = String(val).trim();
    // Check if format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    // Check if format DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dmyMatch) {
      const day = dmyMatch[1].padStart(2, '0');
      const month = dmyMatch[2].padStart(2, '0');
      const year = dmyMatch[3];
      return `${year}-${month}-${day}`;
    }
    return str || '1990-01-01';
  };

  // Normalize Gender
  const parseGender = (val: any): JenisKelamin => {
    if (!val) return 'L';
    const s = String(val).trim().toUpperCase();
    if (s.startsWith('P') || s.includes('PEREMPUAN') || s.includes('WANITA')) return 'P';
    return 'L';
  };

  // Normalize Religion
  const parseAgama = (val: any): Agama => {
    if (!val) return 'Islam';
    const s = String(val).trim().toLowerCase();
    if (s.includes('kristen') || s.includes('protestan')) return 'Kristen';
    if (s.includes('katolik')) return 'Katolik';
    if (s.includes('hindu')) return 'Hindu';
    if (s.includes('buddha') || s.includes('budha')) return 'Buddha';
    if (s.includes('konghucu')) return 'Konghucu';
    if (s.includes('islam')) return 'Islam';
    return 'Lainnya';
  };

  // Normalize Marital Status
  const parseStatusPerkawinan = (val: any): StatusPerkawinan => {
    if (!val) return 'Kawin';
    const s = String(val).trim().toLowerCase();
    if (s.includes('belum') || s.includes('lajang') || s.includes('single')) return 'Belum Kawin';
    if (s.includes('cerai mati') || s.includes('janda') || s.includes('duda')) return 'Cerai Mati';
    if (s.includes('cerai')) return 'Cerai Hidup';
    return 'Kawin';
  };

  // Normalize Family Status
  const parseStatusKeluarga = (val: any): StatusHubunganKeluarga => {
    if (!val) return 'Kepala Keluarga';
    const s = String(val).trim().toLowerCase();
    if (s.includes('istri')) return 'Istri';
    if (s.includes('anak')) return 'Anak';
    if (s.includes('orang tua') || s.includes('ayah') || s.includes('ibu')) return 'Orang Tua';
    if (s.includes('famili') || s.includes('mertua') || s.includes('cucu') || s.includes('lain')) return 'Famili Lain';
    return 'Kepala Keluarga';
  };

  // File Upload Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setGeneralError(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

      if (rawRows.length === 0) {
        setGeneralError('File Excel tidak memiliki data (kosong).');
        setIsProcessing(false);
        return;
      }

      const rowsProcessed: ParsedResidentRow[] = [];
      const seenNiksInFile = new Set<string>();

      rawRows.forEach((row, index) => {
        const errors: string[] = [];

        // Flexible column lookup (case-insensitive & whitespace trimmed)
        const getVal = (keys: string[]): any => {
          for (const key of keys) {
            const matchedKey = Object.keys(row).find(
              (k) => k.trim().toLowerCase() === key.toLowerCase()
            );
            if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== '') {
              return row[matchedKey];
            }
          }
          return '';
        };

        const nikRaw = String(getVal(['nik', 'nik (16 digit)', 'no nik', 'nomor induk kependudukan'])).replace(/\D/g, '');
        const noKkRaw = String(getVal(['nokk', 'no kk', 'no kk (16 digit)', 'nomor kk', 'nomor kartu keluarga', 'no. kk'])).replace(/\D/g, '');
        const nama = String(getVal(['nama', 'nama lengkap', 'nama warga'])).trim();
        const jenisKelamin = parseGender(getVal(['jenis kelamin', 'jenis kelamin (l/p)', 'jk', 'l/p', 'gender']));
        const tempatLahir = String(getVal(['tempat lahir', 'tempat_lahir', 'kota lahir'])).trim() || 'Bogor';
        const tanggalLahir = parseExcelDate(getVal(['tanggal lahir', 'tanggal lahir (yyyy-mm-dd)', 'tgl lahir', 'tanggal_lahir']));
        const agama = parseAgama(getVal(['agama']));
        const statusPerkawinan = parseStatusPerkawinan(getVal(['status perkawinan', 'status nikah']));
        const pekerjaan = String(getVal(['pekerjaan', 'profesi'])).trim() || 'Wiraswasta';
        const pendidikan = String(getVal(['pendidikan', 'pendidikan terakhir', 'lulusan'])).trim() || 'SMA / Sederajat';
        const alamat = String(getVal(['alamat', 'alamat domisili', 'jalan'])).trim() || 'Jl. Desa';
        const rtRaw = normalizeRw(getVal(['rt', 'r.t.']));
        const rwRaw = normalizeRw(getVal(['rw', 'r.w.']));
        
        // Dusun lookup with fallback to RW mapping
        let dusun = String(getVal(['dusun', 'dusun / dukuh', 'dukuh', 'wilayah'])).trim();
        if (!dusun) {
          const matchedDusun = findDusunByRw(rwRaw);
          dusun = matchedDusun ? matchedDusun.name : 'Dusun 1';
        } else {
          dusun = normalizeDusunName(dusun);
        }

        const statusKeluarga = parseStatusKeluarga(getVal(['status hubungan keluarga', 'status keluarga', 'shdk', 'hubungan']));
        const kewarganegaraan = String(getVal(['kewarganegaraan'])).trim() || 'WNI';
        const noHp = String(getVal(['no hp', 'nomor hp', 'telepon', 'whatsapp'])).trim();

        // Validation
        if (!nikRaw) {
          errors.push('NIK tidak boleh kosong');
        } else if (nikRaw.length !== 16) {
          errors.push(`NIK harus 16 digit (terdeteksi: ${nikRaw.length} digit)`);
        }

        if (!noKkRaw) {
          errors.push('No KK tidak boleh kosong');
        } else if (noKkRaw.length !== 16) {
          errors.push(`No KK harus 16 digit (terdeteksi: ${noKkRaw.length} digit)`);
        }

        if (!nama) {
          errors.push('Nama warga tidak boleh kosong');
        }

        // Smart Family & KK Relationship Evaluation
        const existingResident = existingPenduduk?.find((p) => p.nik.trim() === nikRaw);
        let statusType: 'NEW' | 'TRANSFER' | 'UPDATE' | 'JOIN' = 'NEW';
        let statusLabel = 'Warga Baru';

        if (existingResident) {
          if (existingResident.noKk.trim() !== noKkRaw) {
            const oldKkHead =
              existingPenduduk?.find(
                (p) => p.noKk.trim() === existingResident.noKk.trim() && p.statusKeluarga === 'Kepala Keluarga'
              )?.nama || 'Keluarga Asal';
            statusType = 'TRANSFER';
            statusLabel = `Pecah KK (Semula di KK Bpk. ${oldKkHead})`;
          } else {
            statusType = 'UPDATE';
            statusLabel = 'Pembaruan Biodata';
          }
        } else {
          const kkHead = existingPenduduk?.find(
            (p) => p.noKk.trim() === noKkRaw && p.statusKeluarga === 'Kepala Keluarga'
          )?.nama;
          if (kkHead) {
            statusType = 'JOIN';
            statusLabel = `Masuk ke KK Bpk. ${kkHead}`;
          }
        }

        const isDuplicateFile = seenNiksInFile.has(nikRaw);
        if (isDuplicateFile) {
          errors.push('Duplikat NIK di dalam file Excel ini');
        }

        if (nikRaw) seenNiksInFile.add(nikRaw);

        const isValid = errors.length === 0;

        rowsProcessed.push({
          rowNum: index + 2, // Header is row 1
          data: {
            nik: nikRaw || '3200000000000000',
            noKk: noKkRaw || '3200000000000000',
            nama: nama || 'Warga Tanpa Nama',
            jenisKelamin,
            tempatLahir,
            tanggalLahir,
            agama,
            statusPerkawinan,
            pekerjaan,
            pendidikan,
            alamat,
            rt: rtRaw,
            rw: rwRaw,
            dusun,
            statusKeluarga,
            kewarganegaraan,
            noHp,
          },
          isValid,
          isDuplicate: isDuplicateFile,
          statusType,
          statusLabel,
          errors,
          selected: isValid,
        });
      });

      setParsedRows(rowsProcessed);
    } catch (err: any) {
      console.error('Error parsing file:', err);
      setGeneralError('Gagal membaca berkas Excel. Pastikan format berkas valid (.xlsx, .xls, .csv).');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleSelectRow = (index: number) => {
    setParsedRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleSelectAllValid = (selected: boolean) => {
    setParsedRows((prev) =>
      prev.map((r) => (r.isValid ? { ...r, selected } : r))
    );
  };

  const selectedValidRows = parsedRows.filter((r) => r.selected && r.isValid);

  const handleSaveImport = () => {
    if (selectedValidRows.length === 0) return;
    const residentsToImport = selectedValidRows.map((r) => r.data);
    onImportSuccess(residentsToImport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Import Data Penduduk dari Excel
              </h2>
              <p className="text-xs text-slate-500">
                Unggah berkas Excel (.xlsx, .xls) atau CSV untuk memasukkan data warga secara massal.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Top Instruction & Template Download Banner */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900">
                <span className="font-bold block">Gunakan Format Template Resmi</span>
                <span>
                  Pastikan kolom NIK & No KK berisi 16 digit. Kolom Dusun 1 - 5 dan RW 01 - 29 otomatis disesuaikan dengan wilayah desa.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center justify-center px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap self-start sm:self-center"
              id="btn-download-template-excel"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Download Template Excel
            </button>
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-xl p-6 text-center cursor-pointer transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
              id="input-file-excel"
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              {fileName ? fileName : 'Pilih atau Tarik Berkas Excel ke Sini'}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Mendukung format <strong>.xlsx</strong>, <strong>.xls</strong>, dan <strong>.csv</strong>
            </p>
            {isProcessing && (
              <div className="mt-3 flex items-center justify-center text-xs text-emerald-700 font-semibold space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sedang membaca dan memvalidasi baris data...</span>
              </div>
            )}
          </div>

          {generalError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Preview Table if rows parsed */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <span>Pratinjau Data ({parsedRows.length} baris)</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      {selectedValidRows.length} Siap Diimpor
                    </span>
                    {parsedRows.some((r) => !r.isValid) && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
                        {parsedRows.filter((r) => !r.isValid).length} Bermasalah
                      </span>
                    )}
                  </h4>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSelectAllValid(true)}
                    className="text-emerald-700 hover:underline font-semibold cursor-pointer"
                  >
                    Pilih Semua Valid
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => handleSelectAllValid(false)}
                    className="text-slate-500 hover:underline cursor-pointer"
                  >
                    Batal Pilih
                  </button>
                </div>
              </div>

              {/* Family Transfer / Join detection notice */}
              {parsedRows.some((r) => r.statusType === 'TRANSFER' || r.statusType === 'JOIN') && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                  <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold block">Sistem Otomatisasi Pecah KK & Penyesuaian Anggota Aktif</span>
                    <span>
                      Sistem mendeteksi warga yang berpindah KK (pecah KK) atau anggota baru yang bergabung ke KK terdaftar. Saat diimpor, database akan otomatis memindahkan warga ke KK barunya dan memperbarui jumlah anggota di KK lamanya.
                    </span>
                  </div>
                </div>
              )}

              {/* Table Container */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-[360px] overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2.5 text-center w-10">Pilih</th>
                      <th className="px-3 py-2.5">Baris</th>
                      <th className="px-3 py-2.5">NIK / No KK</th>
                      <th className="px-3 py-2.5">Nama</th>
                      <th className="px-3 py-2.5">JK / Usia</th>
                      <th className="px-3 py-2.5">Wilayah</th>
                      <th className="px-3 py-2.5">Status Database</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          !row.isValid ? 'bg-rose-50/40' : row.selected ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            disabled={!row.isValid}
                            onChange={() => handleToggleSelectRow(idx)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:opacity-40"
                          />
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-slate-400">
                          #{row.rowNum}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-mono font-semibold text-slate-800 text-[11px]">
                            {row.data.nik}
                          </div>
                          <div className="font-mono text-slate-400 text-[10px]">
                            KK: {row.data.noKk}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-bold text-slate-900">{row.data.nama}</div>
                          <div className="text-[10px] text-slate-500">
                            {row.data.pekerjaan} &bull; {row.data.statusKeluarga}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-medium text-slate-800">
                            {row.data.jenisKelamin === 'L' ? 'L' : 'P'} &bull; {row.data.tanggalLahir}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {row.data.agama}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-medium text-slate-800">{row.data.dusun}</div>
                          <div className="text-[10px] text-slate-400">
                            RT {row.data.rt} / RW {row.data.rw}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          {row.isValid ? (
                            <div className="space-y-1">
                              {row.statusType === 'TRANSFER' && (
                                <span className="inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                                  🔄 {row.statusLabel}
                                </span>
                              )}
                              {row.statusType === 'JOIN' && (
                                <span className="inline-flex items-center text-[10px] font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                                  ➕ {row.statusLabel}
                                </span>
                              )}
                              {row.statusType === 'UPDATE' && (
                                <span className="inline-flex items-center text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                                  ✏️ {row.statusLabel}
                                </span>
                              )}
                              {row.statusType === 'NEW' && (
                                <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                                  <Check className="w-3 h-3 mr-1" /> Warga Baru
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              {row.errors.map((err, errIdx) => (
                                <span
                                  key={errIdx}
                                  className="inline-flex items-center text-[10px] font-semibold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded block"
                                >
                                  <AlertCircle className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                                  {err}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {parsedRows.length > 0 ? (
              <span>
                Dipilih: <strong className="text-emerald-700">{selectedValidRows.length}</strong> dari {parsedRows.length} baris
              </span>
            ) : (
              <span>Unggah berkas untuk memvalidasi data sebelum disimpan.</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={selectedValidRows.length === 0}
              onClick={handleSaveImport}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center"
              id="btn-confirm-import-excel"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Impor {selectedValidRows.length} Data Penduduk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
