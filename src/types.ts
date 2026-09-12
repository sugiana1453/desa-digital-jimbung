export type JenisKelamin = 'L' | 'P';

export type Agama = 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu' | 'Lainnya';

export type StatusPerkawinan = 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati';

export type StatusHubunganKeluarga = 'Kepala Keluarga' | 'Istri' | 'Anak' | 'Orang Tua' | 'Famili Lain';

export interface Penduduk {
  id: string;
  nik: string; // 16 digit
  noKk: string; // 16 digit
  nama: string;
  jenisKelamin: JenisKelamin;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  agama: Agama;
  statusPerkawinan: StatusPerkawinan;
  pekerjaan: string;
  pendidikan: string;
  alamat: string;
  rt: string;
  rw: string;
  dusun: string;
  statusKeluarga: StatusHubunganKeluarga;
  kewarganegaraan: string;
  namaAyah?: string; // Nama Ayah Kandung
  namaIbu?: string; // Nama Ibu Kandung
  noHp?: string;
  createdAt: string;
}

export interface KkTransferInfo {
  nama: string;
  nik: string;
  oldNoKk: string;
  newNoKk: string;
  oldKkHeadName?: string;
  newKkHeadName?: string;
  newStatusKeluarga: string;
}

export interface BatchPendudukResult {
  totalProcessed: number;
  addedCount: number;
  updatedCount: number;
  transferredCount: number;
  transfers: KkTransferInfo[];
  joinedCount: number;
  joinedFamily: Array<{
    nama: string;
    nik: string;
    noKk: string;
    headName: string;
  }>;
}

export interface DesaProfile {
  namaDesa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  alamatKantor: string;
  telepon: string;
  email: string;
  website: string;
  namaKades: string;
  nipKades: string;
  namaSekdes: string;
  nipSekdes: string;
  namaOperator?: string;
  nipOperator?: string;
  jabatanOperator?: string;
  logoUrl?: string;
  kodeKlasifikasiSurat?: string;
  kodeWilayah?: string;
  nomorUrutSuratMulai?: number;
  nomorUrutSuratSaatIni?: number;
}

export type AdminRole =
  | 'SUPER_ADMIN'
  | 'OPERATOR_SURAT'
  | 'PETUGAS_PENDUDUK'
  | 'PENGELOLA_ARSIP'
  | 'VIEWER';

export type MenuPermission =
  | 'dashboard'
  | 'penduduk'
  | 'surat'
  | 'arsip'
  | 'surat-mk'
  | 'buat-surat-keluar'
  | 'pengaturan'
  | 'kelola-admin';

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  namaLengkap: string;
  jabatan: string;
  email?: string;
  noHp?: string;
  role: AdminRole;
  permissions: MenuPermission[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export type TipeSurat =
  | 'SKU' // Surat Keterangan Usaha
  | 'SKTM' // Surat Keterangan Tidak Mampu
  | 'SKCK' // Surat Pengantar SKCK
  | 'DOMISILI' // Surat Keterangan Domisili
  | 'PINDAH_MASUK' // Surat Keterangan Pindah Masuk / Pindah Datang
  | 'PINDAH_KELUAR' // Surat Keterangan Pindah Keluar
  | 'DOMISILI_SEMENTARA' // Surat Keterangan Domisili Sementara
  | 'KEMATIAN' // Surat Keterangan Kematian
  | 'KELAHIRAN' // Surat Keterangan Kelahiran
  | 'PENGANTAR_NIKAH' // Surat Pengantar Nikah (N1-N4)
  | 'KETERANGAN_UMUM'; // Surat Keterangan Umum

export interface SuratFieldValues {
  // Common
  keperluan?: string;
  keteranganTambahan?: string;
  berlakuHingga?: string;

  // SKU
  namaUsaha?: string;
  bidangUsaha?: string;
  alamatUsaha?: string;
  sejakTahun?: string;

  // SKTM
  alasanSKTM?: string; // Beasiswa, Keringanan Biaya RS, dll.
  penghasilanBulanan?: string;
  tanggunganOrang?: number;

  // SKCK
  keperluanSKCK?: string;
  riwayatKelakuan?: string;

  // Domisili
  alamatDomisili?: string;
  tinggalSejak?: string;

  // Pindah Masuk (Pindah Datang)
  alamatAsal?: string;
  desaAsal?: string;
  kecamatanAsal?: string;
  kabupatenAsal?: string;
  provinsiAsal?: string;
  alasanPindah?: string;
  tanggalPindahDatang?: string;
  jumlahPengikut?: number;
  daftarPengikut?: string;
  klasifikasiPindah?: string;
  nomorSKPWNI?: string;
  alamatTujuanDesa?: string;

  // Pindah Keluar
  alamatTujuan?: string;
  desaTujuan?: string;
  kecamatanTujuan?: string;
  kabupatenTujuan?: string;
  provinsiTujuan?: string;
  tanggalPindahKeluar?: string;
  statusKKPindah?: string;

  // Domisili Sementara (Non-Permanen)
  alamatAsalKtp?: string;
  alamatTinggalSementara?: string;
  tujuanTinggal?: string;
  namaPenjamin?: string;
  pekerjaanSementara?: string;

  // Header & KK info for F-2.01 (Kelahiran) & F-2.29 (Kematian)
  namaKepalaKeluarga?: string;
  noKartuKeluarga?: string;
  kodeWilayah?: string;

  // Kematian (Formulir F-2.29)
  hariMeninggal?: string;
  tanggalMeninggal?: string;
  waktuMeninggal?: string; // e.g. "00:00"
  tempatMeninggal?: string;
  sebabMeninggal?: string; // 1. Sakit biasa/tua, 2. Wabah Penyakit, 3. Kecelakaan, 4. Kriminalitas, 5. Bunuh Diri, 6. Lainnya
  sebabMeninggalKode?: number; // 1-6
  yangMenerangkan?: string; // 1. Dokter, 2. Bidan/Perawat, 3. Tenaga Kes., 4. Kepolisian, 5. Lainnya
  yangMenerangkanKode?: number; // 1-5
  anakKe?: number;

  // Orang Tua (Ayah & Ibu)
  ayahNik?: string;
  ayahNama?: string;
  ayahTanggalLahir?: string;
  ayahUmur?: number;
  ayahPekerjaan?: string;
  ayahAlamatDesa?: string;
  ayahAlamatKecamatan?: string;
  ayahAlamatKabupaten?: string;
  ayahAlamatProvinsi?: string;
  ayahKewarganegaraan?: string; // 1. WNI, 2. WNA
  ayahKebangsaan?: string;

  ibuNik?: string;
  ibuNama?: string;
  ibuTanggalLahir?: string;
  ibuUmur?: number;
  ibuPekerjaan?: string;
  ibuAlamatDesa?: string;
  ibuAlamatKecamatan?: string;
  ibuAlamatKabupaten?: string;
  ibuAlamatProvinsi?: string;
  ibuKewarganegaraan?: string; // 1. WNI, 2. WNA
  ibuKebangsaan?: string;
  tglPencatatanPerkawinan?: string;

  // Pelapor
  pelaporNik?: string;
  pelaporNama?: string;
  pelaporTanggalLahir?: string;
  pelaporUmur?: number;
  pelaporJenisKelamin?: string; // 1. Laki-Laki, 2. Perempuan
  pelaporPekerjaan?: string;
  pelaporAlamatDesa?: string;
  pelaporAlamatKecamatan?: string;
  pelaporAlamatKabupaten?: string;
  pelaporAlamatProvinsi?: string;
  pelaporHubungan?: string;

  // Saksi 1
  saksi1Nik?: string;
  saksi1Nama?: string;
  saksi1TanggalLahir?: string;
  saksi1Umur?: number;
  saksi1Pekerjaan?: string;
  saksi1AlamatDesa?: string;
  saksi1AlamatKecamatan?: string;
  saksi1AlamatKabupaten?: string;
  saksi1AlamatProvinsi?: string;

  // Saksi 2
  saksi2Nik?: string;
  saksi2Nama?: string;
  saksi2TanggalLahir?: string;
  saksi2Umur?: number;
  saksi2Pekerjaan?: string;
  saksi2AlamatDesa?: string;
  saksi2AlamatKecamatan?: string;
  saksi2AlamatKabupaten?: string;
  saksi2AlamatProvinsi?: string;

  // Kelahiran (Formulir F-2.01)
  hariLahir?: string;
  tanggalLahirBayi?: string;
  jamLahir?: string;
  namaBayi?: string;
  jenisKelaminBayi?: string; // 1. Laki-Laki, 2. Perempuan
  tempatDilahirkan?: string; // 1. RS/RB, 2. Puskesmas, 3. Polindes, 4. Rumah, 5. Lainnya
  tempatDilahirkanKode?: number; // 1-5
  tempatKelahiranKota?: string;
  jenisKelahiran?: string; // 1. Tunggal, 2. Kembar 2, 3. Kembar 3, 4. Kembar 4, 5. Lainnya
  jenisKelahiranKode?: number; // 1-5
  kelahiranKe?: number;
  penolongKelahiran?: string; // 1. Dokter, 2. Bidan/Perawat, 3. Dukun, 4. Lainnya
  penolongKelahiranKode?: number; // 1-4
  beratBayiGram?: number;
  beratBayiKg?: string;
  panjangBayiCm?: number;
  namaAyah?: string;
  namaIbu?: string;

  // Pengantar Nikah
  namaCalon?: string;
  statusSebelumNikah?: string;
}

export interface SuratDibuat {
  id: string;
  nomorSurat: string;
  tipeSurat: TipeSurat;
  judulSurat: string;
  pendudukId: string;
  nik: string;
  namaPenduduk: string;
  tanggalSurat: string; // YYYY-MM-DD
  penandatangan: 'Kepala Desa' | 'An. Kepala Desa, Sekretaris Desa' | 'Sekretaris Desa' | string;
  fields: SuratFieldValues;
  createdAt: string;
}

export type JenisArsip = 'PERDES' | 'SK_KADES' | 'PERKADES' | 'LAINNYA';

export interface ArsipDokumen {
  id: string;
  nomor: string;
  judul: string;
  jenis: JenisArsip;
  tanggalPenetapan: string;
  tahun: number;
  tentang: string;
  status: 'Berlaku' | 'Diubah' | 'Dicabut';
  ringkasan: string;
  namaBerkas?: string;
  ukuranBerkas?: string;
  fileData?: string; // Base64 or Data URL for previewing & downloading real PDF
  penandatangan?: string;
  keterangan?: string;
}

export interface SuratMasuk {
  id: string;
  nomorAgenda?: string; // Nomor urut agenda (dapat di-customisasi)
  nomorSurat: string;
  tanggalSurat: string;
  tanggalDiterima: string;
  pengirim: string;
  perihal: string;
  disposisi: string;
  status: 'Belum Ditindaklanjuti' | 'Diproses' | 'Selesai';
  sifatSurat?: 'Biasa' | 'Penting' | 'Segera' | 'Rahasia';
  keterangan?: string;
  ringkasan?: string;
  berkasUrl?: string;
  namaBerkas?: string;
}

export interface SuratKeluar {
  id: string;
  nomorAgenda?: string; // Nomor urut agenda surat keluar (dapat di-customisasi)
  nomorSurat: string;
  tanggalSurat: string;
  penerima: string;
  perihal: string;
  penandatangan: string;
  sifatSurat?: 'Biasa' | 'Penting' | 'Segera' | 'Rahasia';
  lampiran?: string;
  isiRingkas?: string;
  keterangan?: string;
  idSuratDibuatRef?: string;
}

export interface ScannedFamilyMember {
  nama: string;
  nik: string;
  jenisKelamin: JenisKelamin;
  tempatLahir: string;
  tanggalLahir: string;
  agama: Agama;
  pendidikan: string;
  pekerjaan: string;
  statusPerkawinan: StatusPerkawinan;
  statusKeluarga: StatusHubunganKeluarga;
  kewarganegaraan: string;
  namaAyah?: string;
  namaIbu?: string;
}

export interface ScannedKKResult {
  noKk: string;
  alamat: string;
  rt: string;
  rw: string;
  dusun?: string;
  desa?: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  anggotaKeluarga: ScannedFamilyMember[];
}

export interface ScannedSuratMasukResult {
  nomorAgenda?: string;
  nomorSurat: string;
  tanggalSurat: string;
  tanggalDiterima: string;
  pengirim: string;
  perihal: string;
  sifatSurat?: 'Biasa' | 'Penting' | 'Segera' | 'Rahasia';
  disposisiRekomendasi?: string;
  ringkasan?: string;
  keterangan?: string;
}

