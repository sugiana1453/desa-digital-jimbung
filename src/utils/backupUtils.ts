import * as XLSX from 'xlsx';
import { Penduduk, SuratDibuat, SuratMasuk, SuratKeluar, ArsipDokumen, DesaProfile, AdminUser } from '../types';
import { formatTanggalIndo } from './formatters';

export interface BackupDataPayload {
  profile: DesaProfile;
  penduduk: Penduduk[];
  suratList: SuratDibuat[];
  suratMasuk: SuratMasuk[];
  suratKeluar: SuratKeluar[];
  arsip: ArsipDokumen[];
  adminUsers?: AdminUser[];
}

export type BackupScope = 'all' | 'penduduk' | 'surat';

export interface LastBackupInfo {
  timestamp: string;
  format: 'JSON' | 'Excel';
  scopeLabel: string;
  itemCount: number;
}

const LAST_BACKUP_KEY = 'desa_last_backup_info';

export function getLastBackupInfo(): LastBackupInfo | null {
  try {
    const raw = localStorage.getItem(LAST_BACKUP_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLastBackupInfo(info: LastBackupInfo): void {
  try {
    localStorage.setItem(LAST_BACKUP_KEY, JSON.stringify(info));
  } catch (e) {
    console.error('Failed to save last backup info', e);
  }
}

/**
 * Format Penduduk records into friendly tabular rows for Excel
 */
function formatPendudukRows(penduduk: Penduduk[]) {
  return penduduk.map((p, idx) => ({
    'No': idx + 1,
    'NIK (16 Digit)': p.nik,
    'Nomor KK (16 Digit)': p.noKk,
    'Nama Lengkap': p.nama,
    'Jenis Kelamin': p.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)',
    'Tempat Lahir': p.tempatLahir,
    'Tanggal Lahir': p.tanggalLahir,
    'Agama': p.agama,
    'Status Perkawinan': p.statusPerkawinan,
    'Status Hubungan Keluarga': p.statusKeluarga,
    'Pekerjaan': p.pekerjaan,
    'Pendidikan': p.pendidikan,
    'RT': p.rt,
    'RW': p.rw,
    'Dusun / Dukuh': p.dusun,
    'Alamat Lengkap': p.alamat,
    'Kewarganegaraan': p.kewarganegaraan,
    'Nama Ayah': p.namaAyah || '-',
    'Nama Ibu': p.namaIbu || '-',
    'Nomor HP': p.noHp || '-',
    'Tanggal Terdaftar': p.createdAt ? formatTanggalIndo(p.createdAt) : '-',
  }));
}

/**
 * Format Surat Dibuat (Surat Keterangan Warga) into tabular rows
 */
function formatSuratDibuatRows(suratList: SuratDibuat[]) {
  return suratList.map((s, idx) => ({
    'No': idx + 1,
    'Nomor Surat': s.nomorSurat,
    'Tanggal Surat': s.tanggalSurat,
    'Jenis Layanan': s.tipeSurat,
    'Judul Surat': s.judulSurat,
    'NIK Pemohon': s.nik,
    'Nama Pemohon': s.namaPenduduk,
    'Keperluan': s.fields?.keperluan || s.fields?.namaUsaha || s.fields?.alasanSKTM || '-',
    'Pejabat Penandatangan': s.penandatangan,
    'Dibuat Pada': s.createdAt ? formatTanggalIndo(s.createdAt) : '-',
  }));
}

/**
 * Format Surat Masuk into tabular rows
 */
function formatSuratMasukRows(suratMasuk: SuratMasuk[]) {
  return suratMasuk.map((sm, idx) => ({
    'No': idx + 1,
    'No. Agenda': sm.nomorAgenda || '-',
    'Nomor Surat': sm.nomorSurat,
    'Tanggal Surat': sm.tanggalSurat,
    'Tanggal Diterima': sm.tanggalDiterima,
    'Asal Pengirim': sm.pengirim,
    'Perihal': sm.perihal,
    'Sifat Surat': sm.sifatSurat || 'Biasa',
    'Disposisi / Arahan': sm.disposisi,
    'Status': sm.status,
    'Keterangan': sm.keterangan || '-',
  }));
}

/**
 * Format Surat Keluar into tabular rows
 */
function formatSuratKeluarRows(suratKeluar: SuratKeluar[]) {
  return suratKeluar.map((sk, idx) => ({
    'No': idx + 1,
    'No. Agenda': sk.nomorAgenda || '-',
    'Nomor Surat': sk.nomorSurat,
    'Tanggal Surat': sk.tanggalSurat,
    'Tujuan / Penerima': sk.penerima,
    'Perihal': sk.perihal,
    'Sifat Surat': sk.sifatSurat || 'Biasa',
    'Penandatangan': sk.penandatangan,
    'Lampiran': sk.lampiran || '-',
    'Keterangan': sk.keterangan || '-',
  }));
}

/**
 * Format Arsip Dokumen into tabular rows
 */
function formatArsipRows(arsip: ArsipDokumen[]) {
  return arsip.map((a, idx) => ({
    'No': idx + 1,
    'Nomor Dokumen': a.nomor,
    'Judul Regulasi': a.judul,
    'Jenis Arsip': a.jenis,
    'Tahun': a.tahun,
    'Tanggal Penetapan': a.tanggalPenetapan,
    'Tentang': a.tentang,
    'Status Hukum': a.status,
    'Penandatangan': a.penandatangan || '-',
    'Nama Berkas Digital': a.namaBerkas || '-',
  }));
}

/**
 * Helper to auto-calculate column widths
 */
function calculateColWidths(data: any[]): { wch: number }[] {
  if (data.length === 0) return [];
  const keys = Object.keys(data[0]);
  return keys.map((key) => {
    let maxLen = key.length;
    for (let i = 0; i < Math.min(data.length, 100); i++) {
      const val = data[i][key];
      const strVal = val !== undefined && val !== null ? String(val) : '';
      if (strVal.length > maxLen) {
        maxLen = strVal.length;
      }
    }
    return { wch: Math.min(Math.max(maxLen + 3, 10), 45) };
  });
}

/**
 * Export backup directly to Excel (.xlsx) with multi-sheet support
 */
export function exportToExcelBackup(
  payload: BackupDataPayload,
  scope: BackupScope = 'all'
): { success: boolean; fileName: string; itemCount: number } {
  const { profile, penduduk, suratList, suratMasuk, suratKeluar, arsip } = payload;
  const workbook = XLSX.utils.book_new();
  const dateStr = new Date().toISOString().slice(0, 10);
  const safeDesaName = (profile.namaDesa || 'Jimbung').toLowerCase().replace(/\s+/g, '_');

  let fileName = '';
  let totalCount = 0;

  if (scope === 'all' || scope === 'penduduk') {
    const pendudukRows = formatPendudukRows(penduduk);
    const wsPenduduk = XLSX.utils.json_to_sheet(pendudukRows);
    wsPenduduk['!cols'] = calculateColWidths(pendudukRows);
    XLSX.utils.book_append_sheet(workbook, wsPenduduk, 'Data_Penduduk');
    totalCount += penduduk.length;
  }

  if (scope === 'all' || scope === 'surat') {
    // Sheet 2: Surat Dibuat
    const suratRows = formatSuratDibuatRows(suratList);
    const wsSurat = XLSX.utils.json_to_sheet(suratRows);
    wsSurat['!cols'] = calculateColWidths(suratRows);
    XLSX.utils.book_append_sheet(workbook, wsSurat, 'Surat_Keterangan_Dibuat');
    totalCount += suratList.length;

    // Sheet 3: Surat Masuk
    const suratMasukRows = formatSuratMasukRows(suratMasuk);
    const wsSuratMasuk = XLSX.utils.json_to_sheet(suratMasukRows);
    wsSuratMasuk['!cols'] = calculateColWidths(suratMasukRows);
    XLSX.utils.book_append_sheet(workbook, wsSuratMasuk, 'Buku_Surat_Masuk');
    totalCount += suratMasuk.length;

    // Sheet 4: Surat Keluar
    const suratKeluarRows = formatSuratKeluarRows(suratKeluar);
    const wsSuratKeluar = XLSX.utils.json_to_sheet(suratKeluarRows);
    wsSuratKeluar['!cols'] = calculateColWidths(suratKeluarRows);
    XLSX.utils.book_append_sheet(workbook, wsSuratKeluar, 'Buku_Surat_Keluar');
    totalCount += suratKeluar.length;
  }

  if (scope === 'all') {
    // Sheet 5: Arsip
    const arsipRows = formatArsipRows(arsip);
    const wsArsip = XLSX.utils.json_to_sheet(arsipRows);
    wsArsip['!cols'] = calculateColWidths(arsipRows);
    XLSX.utils.book_append_sheet(workbook, wsArsip, 'Arsip_Perdes_SK');
    totalCount += arsip.length;

    // Sheet 6: Ringkasan Desa & Metadata Backup
    const infoRows = [
      { 'Parameter Informasi': 'Nama Desa', 'Nilai': profile.namaDesa || 'Jimbung' },
      { 'Parameter Informasi': 'Kecamatan', 'Nilai': profile.kecamatan || 'Kalikotes' },
      { 'Parameter Informasi': 'Kabupaten', 'Nilai': profile.kabupaten || 'Klaten' },
      { 'Parameter Informasi': 'Provinsi', 'Nilai': profile.provinsi || 'Jawa Tengah' },
      { 'Parameter Informasi': 'Kode Pos', 'Nilai': profile.kodePos || '57451' },
      { 'Parameter Informasi': 'Alamat Kantor', 'Nilai': profile.alamatKantor },
      { 'Parameter Informasi': 'Telepon', 'Nilai': profile.telepon },
      { 'Parameter Informasi': 'Email Resmi', 'Nilai': profile.email },
      { 'Parameter Informasi': 'Website Resmi', 'Nilai': profile.website },
      { 'Parameter Informasi': 'Kepala Desa', 'Nilai': profile.namaKades },
      { 'Parameter Informasi': 'Sekretaris Desa', 'Nilai': profile.namaSekdes },
      { 'Parameter Informasi': 'Operator / Petugas', 'Nilai': profile.namaOperator || '-' },
      { 'Parameter Informasi': 'Tanggal Backup', 'Nilai': new Date().toLocaleString('id-ID') },
      { 'Parameter Informasi': 'Total Jiwa Penduduk', 'Nilai': `${penduduk.length} Orang` },
      { 'Parameter Informasi': 'Total Surat Keterangan Diterbitkan', 'Nilai': `${suratList.length} Berkas` },
      { 'Parameter Informasi': 'Total Catatan Surat Masuk & Keluar', 'Nilai': `${suratMasuk.length + suratKeluar.length} Catatan` },
      { 'Parameter Informasi': 'Total Arsip Regulasi Desa', 'Nilai': `${arsip.length} Berkas` },
    ];
    const wsInfo = XLSX.utils.json_to_sheet(infoRows);
    wsInfo['!cols'] = [{ wch: 35 }, { wch: 45 }];
    XLSX.utils.book_append_sheet(workbook, wsInfo, 'Informasi_Pemerintah_Desa');
  }

  // Determine file name
  if (scope === 'all') {
    fileName = `backup_desa_${safeDesaName}_lengkap_${dateStr}.xlsx`;
  } else if (scope === 'penduduk') {
    fileName = `backup_penduduk_desa_${safeDesaName}_${dateStr}.xlsx`;
  } else {
    fileName = `backup_surat_desa_${safeDesaName}_${dateStr}.xlsx`;
  }

  XLSX.writeFile(workbook, fileName);

  const scopeLabel =
    scope === 'all'
      ? 'Semua Data (Lengkap)'
      : scope === 'penduduk'
      ? 'Data Penduduk'
      : 'Data Surat (Keterangan, M/K)';

  saveLastBackupInfo({
    timestamp: new Date().toISOString(),
    format: 'Excel',
    scopeLabel,
    itemCount: totalCount,
  });

  return { success: true, fileName, itemCount: totalCount };
}

/**
 * Export backup to standard JSON format
 */
export function exportToJsonBackup(
  payload: BackupDataPayload,
  scope: BackupScope = 'all'
): { success: boolean; fileName: string; itemCount: number } {
  const { profile, penduduk, suratList, suratMasuk, suratKeluar, arsip, adminUsers } = payload;
  const dateStr = new Date().toISOString().slice(0, 10);
  const safeDesaName = (profile.namaDesa || 'Jimbung').toLowerCase().replace(/\s+/g, '_');

  let dataContent: any = {};
  let fileName = '';
  let totalCount = 0;

  if (scope === 'all') {
    dataContent = {
      profile,
      penduduk,
      suratList,
      arsip,
      suratMasuk,
      suratKeluar,
      adminUsers,
    };
    fileName = `backup_desa_${safeDesaName}_lengkap_${dateStr}.json`;
    totalCount = penduduk.length + suratList.length + suratMasuk.length + suratKeluar.length + arsip.length;
  } else if (scope === 'penduduk') {
    dataContent = {
      profile,
      penduduk,
    };
    fileName = `backup_penduduk_desa_${safeDesaName}_${dateStr}.json`;
    totalCount = penduduk.length;
  } else {
    dataContent = {
      profile,
      suratList,
      suratMasuk,
      suratKeluar,
    };
    fileName = `backup_surat_desa_${safeDesaName}_${dateStr}.json`;
    totalCount = suratList.length + suratMasuk.length + suratKeluar.length;
  }

  const exportPayload = {
    appName: 'Sistem Administrasi Desa Digital',
    desa: profile.namaDesa || 'Jimbung',
    kecamatan: profile.kecamatan || 'Kalikotes',
    kabupaten: profile.kabupaten || 'Klaten',
    backupScope: scope,
    exportDate: new Date().toISOString(),
    itemCount: totalCount,
    version: '1.2.0',
    data: dataContent,
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);

  const scopeLabel =
    scope === 'all'
      ? 'Semua Data (Lengkap)'
      : scope === 'penduduk'
      ? 'Data Penduduk'
      : 'Data Surat (Keterangan, M/K)';

  saveLastBackupInfo({
    timestamp: new Date().toISOString(),
    format: 'JSON',
    scopeLabel,
    itemCount: totalCount,
  });

  return { success: true, fileName, itemCount: totalCount };
}
