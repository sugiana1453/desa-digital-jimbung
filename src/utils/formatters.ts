export const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const NAMA_HARI = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const BULAN_ROMAWI = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
];

export function formatTanggalIndo(dateStr?: string | Date): string {
  if (!dateStr) return '-';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return String(dateStr);
  const tgl = d.getDate();
  const bln = NAMA_BULAN[d.getMonth()];
  const thn = d.getFullYear();
  return `${tgl} ${bln} ${thn}`;
}

export function formatHariTanggalIndo(dateStr?: string | Date): string {
  if (!dateStr) return '-';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return String(dateStr);
  const hari = NAMA_HARI[d.getDay()];
  return `${hari}, ${formatTanggalIndo(d)}`;
}

export function hitungUsia(tanggalLahir: string): number {
  if (!tanggalLahir) return 0;
  const birth = new Date(tanggalLahir);
  if (isNaN(birth.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age > 0 ? age : 0;
}

export function getRomawiBulan(date: Date = new Date()): string {
  const m = date instanceof Date && !isNaN(date.getTime()) ? date.getMonth() : new Date().getMonth();
  return BULAN_ROMAWI[m] || 'I';
}

/**
 * Format nomor surat resmi: 045 / [Nomor Urut Otomatis] / [Romawi Bulan dibuat] / [Tahun dibuat]
 * Sesuai ketentuan persuratan: contoh "045 / 001 / IX / 2026"
 */
export function formatNomorSuratOtomatis(
  nomorUrut: number | string = 1,
  tanggal: string | Date = new Date(),
  kodeKlasifikasi: string = '045'
): string {
  const dateObj = typeof tanggal === 'string' ? new Date(tanggal) : tanggal;
  const validDate = dateObj instanceof Date && !isNaN(dateObj.getTime()) ? dateObj : new Date();
  const bulanRomawi = getRomawiBulan(validDate);
  const tahun = validDate.getFullYear();
  const num = typeof nomorUrut === 'string' ? parseInt(nomorUrut, 10) || 1 : nomorUrut;
  const safeNum = Math.max(1, isNaN(num) ? 1 : num);
  const paddedNo = String(safeNum).padStart(3, '0');
  const kode = (kodeKlasifikasi || '045').trim();

  return `${kode} / ${paddedNo} / ${bulanRomawi} / ${tahun}`;
}

export function generateNextNomorSurat(
  _tipeSurat?: string,
  totalSuratCount: number = 0,
  _kodeDesa: string = 'DS',
  nomorUrutMulai?: number,
  tanggalSurat: string | Date = new Date(),
  kodeKlasifikasi: string = '045'
): string {
  const seq = typeof nomorUrutMulai === 'number' && nomorUrutMulai > 0
    ? nomorUrutMulai
    : Math.max(1, totalSuratCount + 1);
  return formatNomorSuratOtomatis(seq, tanggalSurat, kodeKlasifikasi);
}
