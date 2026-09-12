import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  Printer,
  Search,
  CheckCircle,
  FilePlus,
  ArrowLeft,
  Calendar,
  Share2,
  Trash2,
  User,
  UserPlus,
  ShieldCheck,
  QrCode,
  FileCheck,
  Building2,
  Edit3,
  X,
  AlertCircle,
  Check,
  Camera,
  Zap,
  ArrowRightLeft,
  Hash,
  RotateCcw,
} from 'lucide-react';
import { useDesa } from '../context/DesaContext';
import {
  Penduduk,
  TipeSurat,
  SuratFieldValues,
  SuratDibuat,
  JenisKelamin,
  Agama,
  StatusPerkawinan,
  StatusHubunganKeluarga,
} from '../types';
import {
  formatTanggalIndo,
  formatNomorSuratOtomatis,
  generateNextNomorSurat,
  getRomawiBulan,
} from '../utils/formatters';
import { ScanKKModal } from './ScanKKModal';
import { RekapMutasiView } from './RekapMutasiView';
import { DaftarSuratTab } from './DaftarSuratTab';
import { SuratKematianF4Sheet } from './SuratKematianF4Sheet';
import { SuratKelahiranF4Sheet } from './SuratKelahiranF4Sheet';
import { SuratKhususF4Forms } from './SuratKhususF4Forms';

interface LetterTypeConfig {
  id: TipeSurat;
  title: string;
  category: string;
  desc: string;
  defaultKeperluan: string;
}

const LETTER_TYPES: LetterTypeConfig[] = [
  {
    id: 'SKU',
    title: 'Surat Keterangan Usaha (SKU)',
    category: 'Perekonomian & Usaha',
    desc: 'Untuk persyaratan pengajuan pinjaman/KUR Bank, izin usaha, atau bantuan UMKM.',
    defaultKeperluan: 'Persyaratan Pengajuan Pinjaman Modal Usaha di Bank',
  },
  {
    id: 'SKTM',
    title: 'Surat Keterangan Tidak Mampu (SKTM)',
    category: 'Sosial & Pendidikan',
    desc: 'Untuk permohonan beasiswa, KIP, keringanan biaya rumah sakit, atau bansos.',
    defaultKeperluan: 'Permohonan Bantuan Keringanan Biaya Pendidikan / Sekolah',
  },
  {
    id: 'SKCK',
    title: 'Surat Pengantar SKCK',
    category: 'Kamtibmas & Hukum',
    desc: 'Pengantar permohonan Catatan Kepolisian ke Polsek / Polres setempat.',
    defaultKeperluan: 'Persyaratan Melamar Pekerjaan / Seleksi Pegawai',
  },
  {
    id: 'DOMISILI',
    title: 'Surat Keterangan Domisili',
    category: 'Kependudukan',
    desc: 'Menerangkan bahwa warga bertempat tinggal di alamat wilayah desa saat ini.',
    defaultKeperluan: 'Persyaratan Administrasi Kependudukan dan Pembukaan Rekening',
  },
  {
    id: 'PINDAH_MASUK',
    title: 'Surat Keterangan Pindah Masuk (Datang)',
    category: 'Mutasi Kependudukan',
    desc: 'Keterangan penerimaan perpindahan warga masuk/datang ke wilayah desa dari daerah asal.',
    defaultKeperluan: 'Pencatatan Pindah Masuk dan Penerbitan KK/KTP Baru di Kantor Desa',
  },
  {
    id: 'PINDAH_KELUAR',
    title: 'Surat Keterangan Pindah Keluar',
    category: 'Mutasi Kependudukan',
    desc: 'Surat pengantar perpindahan penduduk keluar wilayah desa ke alamat tujuan baru.',
    defaultKeperluan: 'Persyaratan Pengurusan Surat Keterangan Pindah WNI (SKPWNI) ke Disdukcapil',
  },
  {
    id: 'DOMISILI_SEMENTARA',
    title: 'Surat Keterangan Domisili Sementara',
    category: 'Mutasi Kependudukan',
    desc: 'Menerangkan izin tinggal sementara bagi pekerja proyek, mahasiswa, atau warga non-permanen.',
    defaultKeperluan: 'Surat Izin Domisili Tinggal Sementara / Penduduk Non-Permanen Desa',
  },
  {
    id: 'KEMATIAN',
    title: 'Surat Keterangan Kematian (F-2.29)',
    category: 'Kependudukan & Pencatatan Sipil',
    desc: 'Format resmi Disdukcapil (Kertas F4 / Folio) untuk pengurusan akta kematian dan waris.',
    defaultKeperluan: 'Pengurusan Akta Kematian Disdukcapil dan Administrasi Waris',
  },
  {
    id: 'KELAHIRAN',
    title: 'Surat Keterangan Kelahiran (F-2.01)',
    category: 'Kependudukan & Pencatatan Sipil',
    desc: 'Format resmi Disdukcapil (Kertas F4 / Folio) untuk Akta Kelahiran dan penambahan anggota KK.',
    defaultKeperluan: 'Persyaratan Pembuatan Akta Kelahiran di Disdukcapil',
  },
  {
    id: 'PENGANTAR_NIKAH',
    title: 'Surat Pengantar Nikah (N1-N4)',
    category: 'Pernikahan / KUA',
    desc: 'Pengantar pendaftaran pernikahan ke KUA atau Pencatatan Sipil.',
    defaultKeperluan: 'Persyaratan Pendaftaran Pernikahan di Kantor Urusan Agama (KUA)',
  },
  {
    id: 'KETERANGAN_UMUM',
    title: 'Surat Keterangan Serbaguna',
    category: 'Umum & Pelayanan',
    desc: 'Surat keterangan desa umum untuk keperluan yang dapat disesuaikan.',
    defaultKeperluan: 'Keperluan Administrasi Resmi',
  },
];

export type FontSizePreset = 'compact' | 'extra-compact' | 'normal' | 'large-12pt';

export interface FontPresetStyle {
  label: string;
  badge: string;
  fontSize: string;
  lineHeight: string;
  kopKab: string;
  kopDesa: string;
  kopSub: string;
  titleSize: string;
  nomorSize: string;
  bodySize: string;
  tableSize: string;
  ttdHeight: string;
  padding: string;
  spacing: string;
  logoClass: string;
  logoImgClass: string;
}

export const FONT_PRESET_CONFIG: Record<FontSizePreset, FontPresetStyle> = {
  'compact': {
    label: 'Ringkas (9.5pt)',
    badge: '9.5pt Pas 1 Lembar',
    fontSize: '9.5pt',
    lineHeight: '1.28',
    kopKab: '10pt',
    kopDesa: '11.5pt',
    kopSub: '7.5pt',
    titleSize: '11pt',
    nomorSize: '9pt',
    bodySize: '9.5pt',
    tableSize: '9pt',
    ttdHeight: '44px',
    padding: '23mm 23mm 20mm 23mm',
    spacing: 'space-y-1.5',
    logoClass: 'w-12 h-12',
    logoImgClass: 'max-h-12 max-w-12',
  },
  'normal': {
    label: 'Standar (10.5pt)',
    badge: '10.5pt Standar',
    fontSize: '10.5pt',
    lineHeight: '1.35',
    kopKab: '11pt',
    kopDesa: '12.5pt',
    kopSub: '8pt',
    titleSize: '12pt',
    nomorSize: '10pt',
    bodySize: '10.5pt',
    tableSize: '10pt',
    ttdHeight: '48px',
    padding: '23mm 23mm 20mm 23mm',
    spacing: 'space-y-2',
    logoClass: 'w-13 h-13',
    logoImgClass: 'max-h-13 max-w-13',
  },
  'large-12pt': {
    label: 'Resmi (12pt)',
    badge: '12pt Standar Resmi',
    fontSize: '12pt',
    lineHeight: '1.42',
    kopKab: '12pt',
    kopDesa: '14pt',
    kopSub: '8.5pt',
    titleSize: '13pt',
    nomorSize: '11pt',
    bodySize: '12pt',
    tableSize: '11pt',
    ttdHeight: '52px',
    padding: '23mm 23mm 20mm 23mm',
    spacing: 'space-y-2.5',
    logoClass: 'w-14 h-14',
    logoImgClass: 'max-h-14 max-w-14',
  },
  'extra-compact': {
    label: 'Ekstra Ringkas (8.5pt)',
    badge: '8.5pt Padat',
    fontSize: '8.5pt',
    lineHeight: '1.2',
    kopKab: '9pt',
    kopDesa: '10.5pt',
    kopSub: '7pt',
    titleSize: '10pt',
    nomorSize: '8.5pt',
    bodySize: '8.5pt',
    tableSize: '8.5pt',
    ttdHeight: '36px',
    padding: '21mm 23mm 18mm 23mm',
    spacing: 'space-y-1',
    logoClass: 'w-10 h-10',
    logoImgClass: 'max-h-10 max-w-10',
  },
};

export const SuratGeneratorView: React.FC = () => {
  const {
    penduduk,
    profile,
    addPenduduk,
    createSurat,
    suratList,
    deleteSurat,
    selectedLetterForPrint,
    setSelectedLetterForPrint,
    updateProfile,
  } = useDesa();

  // Mode: 'FORM' or 'PREVIEW'
  const [viewMode, setViewMode] = useState<'FORM' | 'PREVIEW'>('FORM');
  const [selectedTipe, setSelectedTipe] = useState<TipeSurat>('SKU');
  const [subTab, setSubTab] = useState<'PELAYANAN' | 'DAFTAR_SURAT' | 'REKAP_MUTASI'>('PELAYANAN');
  const [successNotification, setSuccessNotification] = useState<string | null>(null);
  const [recentlyCreatedId, setRecentlyCreatedId] = useState<string | null>(null);
  const [fontSizePreset, setFontSizePreset] = useState<FontSizePreset>('compact');

  // Resident selection
  const [selectedPenduduk, setSelectedPenduduk] = useState<Penduduk | null>(null);
  const [residentSearchQuery, setResidentSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isManualResident, setIsManualResident] = useState(false);

  // Manual Resident Form Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isScanKKOpen, setIsScanKKOpen] = useState(false);
  const [saveToMasterData, setSaveToMasterData] = useState(true);
  const [manualFormError, setManualFormError] = useState<string | null>(null);
  const [manualFormData, setManualFormData] = useState<Omit<Penduduk, 'id' | 'createdAt'>>({
    nik: '',
    noKk: '',
    nama: '',
    jenisKelamin: 'L',
    tempatLahir: '',
    tanggalLahir: '1995-01-01',
    agama: 'Islam',
    statusPerkawinan: 'Belum Kawin',
    pekerjaan: 'Wiraswasta',
    pendidikan: 'SMA / Sederajat',
    alamat: 'Jl. Raya Desa',
    rt: '01',
    rw: '01',
    dusun: 'Dusun I',
    statusKeluarga: 'Kepala Keluarga',
    kewarganegaraan: 'WNI',
    noHp: '',
  });

  // Form Fields - Auto Numbering 045 / [Nomor Urut] / [Romawi Bulan] / [Tahun]
  const [nomorUrut, setNomorUrut] = useState<number>(() => {
    return profile.nomorUrutSuratSaatIni || profile.nomorUrutSuratMulai || 1;
  });
  const [kodeKlasifikasi, setKodeKlasifikasi] = useState<string>(() => {
    return profile.kodeKlasifikasiSurat || '045';
  });
  const [tanggalSurat, setTanggalSurat] = useState(new Date().toISOString().slice(0, 10));
  const [nomorSurat, setNomorSurat] = useState<string>(() => {
    const initSeq = profile.nomorUrutSuratSaatIni || profile.nomorUrutSuratMulai || 1;
    const initKode = profile.kodeKlasifikasiSurat || '045';
    return formatNomorSuratOtomatis(initSeq, new Date(), initKode);
  });
  const [penandatangan, setPenandatangan] = useState<'Kepala Desa' | 'An. Kepala Desa' | 'Sekretaris Desa'>('Kepala Desa');

  // Specific dynamic fields
  const [fields, setFields] = useState<SuratFieldValues>({
    keperluan: '',
    namaUsaha: 'Toko Berkah Sejahtera',
    bidangUsaha: 'Perdagangan Sembako & Barang Harian',
    alamatUsaha: '',
    sejakTahun: '2021',
    alasanSKTM: 'Beasiswa Pendidikan Anak',
    penghasilanBulanan: 'Rp 1.500.000',
    tanggunganOrang: 3,
    keperluanSKCK: 'Melamar Pekerjaan di Perusahaan Swasta',
    riwayatKelakuan: 'Berkelakuan baik, tidak sedang menjalani hukuman pidana',
    alamatDomisili: '',
    tinggalSejak: '2020',

    // Pindah Masuk
    desaAsal: '',
    kecamatanAsal: '',
    kabupatenAsal: '',
    provinsiAsal: '',
    alamatAsal: '',
    alasanPindah: 'Pekerjaan / Mutasi Dinas',
    tanggalPindahDatang: new Date().toISOString().slice(0, 10),
    jumlahPengikut: 0,
    daftarPengikut: '',
    klasifikasiPindah: 'Antar Kabupaten/Kota',
    nomorSKPWNI: '',
    alamatTujuanDesa: '',

    // Pindah Keluar
    desaTujuan: '',
    kecamatanTujuan: '',
    kabupatenTujuan: '',
    provinsiTujuan: '',
    alamatTujuan: '',
    tanggalPindahKeluar: new Date().toISOString().slice(0, 10),
    statusKKPindah: 'Membuat KK Baru',

    // Domisili Sementara
    alamatAsalKtp: '',
    alamatTinggalSementara: '',
    tujuanTinggal: 'Bekerja Kontrak / Karyawan',
    namaPenjamin: '',
    pekerjaanSementara: '',

    hariMeninggal: 'Senin',
    tanggalMeninggal: new Date().toISOString().slice(0, 10),
    waktuMeninggal: '08:30 WIB',
    tempatMeninggal: 'RSUD Kabupaten',
    sebabMeninggal: 'Sakit Medis',
    pelaporNama: '',
    pelaporHubungan: 'Keluarga Kandung',
    hariLahir: 'Rabu',
    jamLahir: '06:15 WIB',
    namaBayi: '',
    beratBayiGram: 3200,
    panjangBayiCm: 49,
    namaAyah: '',
    namaIbu: '',
    namaCalon: '',
    statusSebelumNikah: 'Jejaka / Belum Kawin',
  });

  const [activeCreatedLetter, setActiveCreatedLetter] = useState<SuratDibuat | null>(null);

  // Check if directed from Penduduk table
  useEffect(() => {
    const targetId = sessionStorage.getItem('desa_target_penduduk_id');
    if (targetId) {
      const found = penduduk.find((p) => p.id === targetId);
      if (found) {
        setSelectedPenduduk(found);
      }
      sessionStorage.removeItem('desa_target_penduduk_id');
    }
  }, [penduduk]);

  // Check if viewing an existing letter from dashboard/history
  useEffect(() => {
    if (selectedLetterForPrint) {
      setActiveCreatedLetter(selectedLetterForPrint);
      const resident = penduduk.find((p) => p.id === selectedLetterForPrint.pendudukId);
      if (resident) {
        setSelectedPenduduk(resident);
      }
      setSelectedTipe(selectedLetterForPrint.tipeSurat);
      setNomorSurat(selectedLetterForPrint.nomorSurat);
      setTanggalSurat(selectedLetterForPrint.tanggalSurat);
      setPenandatangan(selectedLetterForPrint.penandatangan);
      setFields(selectedLetterForPrint.fields);
      // Parse sequence number if available in nomorSurat
      const match = selectedLetterForPrint.nomorSurat.match(/(?:^|\/)\s*(\d+)\s*\//);
      if (match) {
        setNomorUrut(parseInt(match[1], 10) || 1);
      }
      setViewMode('PREVIEW');
    }
  }, [selectedLetterForPrint, penduduk]);

  // Sync state whenever profile counter or defaults update and no letter is being printed
  useEffect(() => {
    if (!selectedLetterForPrint) {
      const currentSeq = profile.nomorUrutSuratSaatIni || profile.nomorUrutSuratMulai || 1;
      const currentKode = profile.kodeKlasifikasiSurat || '045';
      setNomorUrut(currentSeq);
      setKodeKlasifikasi(currentKode);
      setNomorSurat(formatNomorSuratOtomatis(currentSeq, tanggalSurat, currentKode));
    }
  }, [profile.nomorUrutSuratSaatIni, profile.nomorUrutSuratMulai, profile.kodeKlasifikasiSurat, selectedLetterForPrint]);

  // Set default keperluan if empty when letter type changes
  useEffect(() => {
    if (!selectedLetterForPrint) {
      const cfg = LETTER_TYPES.find((lt) => lt.id === selectedTipe);
      if (cfg && !fields.keperluan) {
        setFields((prev) => ({ ...prev, keperluan: cfg.defaultKeperluan }));
      }
    }
  }, [selectedTipe, selectedLetterForPrint]);

  // Sync address fields with selected resident
  useEffect(() => {
    if (selectedPenduduk) {
      setFields((prev) => ({
        ...prev,
        alamatUsaha: `${selectedPenduduk.alamat}, RT ${selectedPenduduk.rt} / RW ${selectedPenduduk.rw}, Desa ${profile.namaDesa}`,
        alamatDomisili: `${selectedPenduduk.alamat}, RT ${selectedPenduduk.rt} / RW ${selectedPenduduk.rw}, Desa ${profile.namaDesa}`,
      }));
    }
  }, [selectedPenduduk, profile.namaDesa]);

  // Filter residents for search dropdown
  const filteredResidentResults = useMemo(() => {
    if (!residentSearchQuery.trim()) return penduduk.slice(0, 6);
    return penduduk
      .filter(
        (p) =>
          p.nama.toLowerCase().includes(residentSearchQuery.toLowerCase()) ||
          p.nik.includes(residentSearchQuery) ||
          p.alamat.toLowerCase().includes(residentSearchQuery.toLowerCase())
      )
      .slice(0, 8);
  }, [penduduk, residentSearchQuery]);

  const handleSelectResident = (res: Penduduk) => {
    setSelectedPenduduk(res);
    setIsManualResident(false);
    setResidentSearchQuery('');
    setIsDropdownOpen(false);

    // Auto populate KK info and default fields for F4 forms
    setFields((prev) => ({
      ...prev,
      namaKepalaKeluarga: prev.namaKepalaKeluarga || res.nama,
      noKartuKeluarga: prev.noKartuKeluarga || res.noKk || '',
      ...(selectedTipe === 'KEMATIAN' && {
        tanggalMeninggal: prev.tanggalMeninggal || new Date().toISOString().split('T')[0],
      }),
      ...(selectedTipe === 'KELAHIRAN' && {
        tanggalLahirBayi: prev.tanggalLahirBayi || new Date().toISOString().split('T')[0],
        ayahNama: prev.ayahNama || (res.jenisKelamin === 'L' ? res.nama : prev.ayahNama),
        ayahNik: prev.ayahNik || (res.jenisKelamin === 'L' ? res.nik : prev.ayahNik),
        ibuNama: prev.ibuNama || (res.jenisKelamin === 'P' ? res.nama : prev.ibuNama),
        ibuNik: prev.ibuNik || (res.jenisKelamin === 'P' ? res.nik : prev.ibuNik),
      }),
    }));
  };

  const handleOpenManualModal = () => {
    if (isManualResident && selectedPenduduk) {
      // Pre-fill with existing manual data for editing
      setManualFormData({
        nik: selectedPenduduk.nik,
        noKk: selectedPenduduk.noKk || '',
        nama: selectedPenduduk.nama,
        jenisKelamin: selectedPenduduk.jenisKelamin,
        tempatLahir: selectedPenduduk.tempatLahir,
        tanggalLahir: selectedPenduduk.tanggalLahir,
        agama: selectedPenduduk.agama,
        statusPerkawinan: selectedPenduduk.statusPerkawinan,
        pekerjaan: selectedPenduduk.pekerjaan,
        pendidikan: selectedPenduduk.pendidikan,
        alamat: selectedPenduduk.alamat,
        rt: selectedPenduduk.rt,
        rw: selectedPenduduk.rw,
        dusun: selectedPenduduk.dusun,
        statusKeluarga: selectedPenduduk.statusKeluarga,
        kewarganegaraan: selectedPenduduk.kewarganegaraan,
        noHp: selectedPenduduk.noHp || '',
      });
    } else {
      // Initialize with default or query-based values
      const numericQuery = residentSearchQuery.replace(/\D/g, '');
      const isNameQuery = !numericQuery && residentSearchQuery.trim();
      setManualFormData({
        nik: numericQuery.slice(0, 16) || '',
        noKk: '',
        nama: isNameQuery ? residentSearchQuery.trim() : '',
        jenisKelamin: 'L',
        tempatLahir: profile.kabupaten || 'Kabupaten',
        tanggalLahir: '1995-01-01',
        agama: 'Islam',
        statusPerkawinan: 'Kawin',
        pekerjaan: 'Wiraswasta',
        pendidikan: 'SMA / Sederajat',
        alamat: `Jl. Desa RT 01 / RW 01`,
        rt: '01',
        rw: '01',
        dusun: 'Dusun I',
        statusKeluarga: 'Kepala Keluarga',
        kewarganegaraan: 'WNI',
        noHp: '',
      });
    }
    setManualFormError(null);
    setIsManualModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleSaveManualResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualFormData.nama.trim()) {
      setManualFormError('Nama lengkap warga pemohon wajib diisi.');
      return;
    }
    if (!manualFormData.nik.trim()) {
      setManualFormError('NIK warga pemohon wajib diisi.');
      return;
    }
    if (manualFormData.nik.trim().length !== 16) {
      setManualFormError('Nomor NIK harus berjumlah 16 digit angka sesuai KTP.');
      return;
    }

    let citizenObj: Penduduk;
    if (saveToMasterData) {
      // Save permanently to village database
      citizenObj = addPenduduk(manualFormData);
    } else {
      // Temporary manual resident object for this letter
      citizenObj = {
        ...manualFormData,
        id: 'manual_' + Date.now().toString(36),
        createdAt: new Date().toISOString(),
      };
    }

    setSelectedPenduduk(citizenObj);
    setIsManualResident(true);
    setIsManualModalOpen(false);
    setManualFormError(null);
  };

  const handleApplyScannedResidentToSurat = (scanned: Partial<Penduduk>) => {
    if (isManualModalOpen) {
      // If manual modal is currently open, populate its form fields
      setManualFormData((prev) => ({
        ...prev,
        nik: scanned.nik || prev.nik,
        noKk: scanned.noKk || prev.noKk,
        nama: scanned.nama || prev.nama,
        jenisKelamin: scanned.jenisKelamin || prev.jenisKelamin,
        tempatLahir: scanned.tempatLahir || prev.tempatLahir,
        tanggalLahir: scanned.tanggalLahir || prev.tanggalLahir,
        agama: scanned.agama || prev.agama,
        statusPerkawinan: scanned.statusPerkawinan || prev.statusPerkawinan,
        pekerjaan: scanned.pekerjaan || prev.pekerjaan,
        pendidikan: scanned.pendidikan || prev.pendidikan,
        alamat: scanned.alamat || prev.alamat,
        rt: scanned.rt || prev.rt,
        rw: scanned.rw || prev.rw,
        dusun: scanned.dusun || prev.dusun,
        statusKeluarga: scanned.statusKeluarga || prev.statusKeluarga,
        kewarganegaraan: scanned.kewarganegaraan || prev.kewarganegaraan,
      }));
      setManualFormError(null);
    } else {
      // Direct applicant selection from scan
      const existing = penduduk.find((p) => p.nik === scanned.nik);
      if (existing) {
        setSelectedPenduduk(existing);
        setIsManualResident(false);
      } else {
        const newResident: Omit<Penduduk, 'id' | 'createdAt'> = {
          nik: scanned.nik || '3213010000000000',
          noKk: scanned.noKk || '3213010000000000',
          nama: scanned.nama || 'Warga Pemohon',
          jenisKelamin: scanned.jenisKelamin || 'L',
          tempatLahir: scanned.tempatLahir || profile.kabupaten || 'Kabupaten',
          tanggalLahir: scanned.tanggalLahir || '1990-01-01',
          agama: scanned.agama || 'Islam',
          statusPerkawinan: scanned.statusPerkawinan || 'Kawin',
          pekerjaan: scanned.pekerjaan || 'Wiraswasta',
          pendidikan: scanned.pendidikan || 'SMA / Sederajat',
          alamat: scanned.alamat || 'Jl. Raya Desa',
          rt: scanned.rt || '01',
          rw: scanned.rw || '01',
          dusun: scanned.dusun || 'Dusun I',
          statusKeluarga: scanned.statusKeluarga || 'Kepala Keluarga',
          kewarganegaraan: scanned.kewarganegaraan || 'WNI',
          noHp: scanned.noHp || '',
        };
        const saved = addPenduduk(newResident);
        setSelectedPenduduk(saved);
        setIsManualResident(false);
      }
      setIsDropdownOpen(false);
    }
  };

  const handleImportAllFamilyFromSurat = (members: Omit<Penduduk, 'id' | 'createdAt'>[]) => {
    let count = 0;
    members.forEach((m) => {
      const exists = penduduk.some((p) => p.nik === m.nik);
      if (!exists) {
        addPenduduk(m);
        count++;
      }
    });
    alert(`Berhasil mengimpor ${count} data anggota keluarga dari Kartu Keluarga ke database desa.`);
  };

  const handleGenerateAndPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPenduduk) {
      alert('Pilih data penduduk pemohon terlebih dahulu!');
      return;
    }

    const cfg = LETTER_TYPES.find((lt) => lt.id === selectedTipe);
    const finalNomorSurat = (nomorSurat || formatNomorSuratOtomatis(nomorUrut, tanggalSurat, kodeKlasifikasi)).trim();
    const newLetterData = {
      nomorSurat: finalNomorSurat,
      tipeSurat: selectedTipe,
      judulSurat: cfg ? cfg.title : 'Surat Keterangan',
      pendudukId: selectedPenduduk.id,
      nik: selectedPenduduk.nik,
      namaPenduduk: selectedPenduduk.nama,
      tanggalSurat,
      penandatangan,
      fields,
    };

    const saved = createSurat(newLetterData);
    setActiveCreatedLetter(saved);
    setRecentlyCreatedId(saved.id);
    // Advance sequence number for next letter automatically
    const nextSeq = nomorUrut + 1;
    setNomorUrut(nextSeq);
    updateProfile({
      nomorUrutSuratSaatIni: nextSeq,
    });
    setSuccessNotification(
      `Surat ${saved.judulSurat} No. ${saved.nomorSurat} untuk ${saved.namaPenduduk} berhasil diterbitkan dan dicatat dalam register surat desa!`
    );
    setViewMode('PREVIEW');
  };

  const handleSaveAndReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPenduduk) {
      alert('Pilih data penduduk pemohon terlebih dahulu!');
      return;
    }

    const cfg = LETTER_TYPES.find((lt) => lt.id === selectedTipe);
    const finalNomorSurat = (nomorSurat || formatNomorSuratOtomatis(nomorUrut, tanggalSurat, kodeKlasifikasi)).trim();
    const newLetterData = {
      nomorSurat: finalNomorSurat,
      tipeSurat: selectedTipe,
      judulSurat: cfg ? cfg.title : 'Surat Keterangan',
      pendudukId: selectedPenduduk.id,
      nik: selectedPenduduk.nik,
      namaPenduduk: selectedPenduduk.nama,
      tanggalSurat,
      penandatangan,
      fields,
    };

    const saved = createSurat(newLetterData);
    setActiveCreatedLetter(saved);
    setRecentlyCreatedId(saved.id);
    const nextSeq = nomorUrut + 1;
    setNomorUrut(nextSeq);
    updateProfile({
      nomorUrutSuratSaatIni: nextSeq,
    });
    setSuccessNotification(
      `Surat ${saved.judulSurat} No. ${saved.nomorSurat} untuk ${saved.namaPenduduk} berhasil dibuat dan dicatat dalam register surat desa!`
    );
    setViewMode('FORM');
    setSubTab('DAFTAR_SURAT');
    setSelectedLetterForPrint(null);
  };

  const handleReturnToDaftar = () => {
    setViewMode('FORM');
    setSubTab('DAFTAR_SURAT');
    setSelectedLetterForPrint(null);
    if (activeCreatedLetter) {
      setSuccessNotification(
        `Surat ${activeCreatedLetter.judulSurat} No. ${activeCreatedLetter.nomorSurat} untuk ${activeCreatedLetter.namaPenduduk} berhasil dibuat dan dicatat dalam register surat desa!`
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentConfig = LETTER_TYPES.find((lt) => lt.id === selectedTipe) || LETTER_TYPES[0];
  const fontConfig = FONT_PRESET_CONFIG[fontSizePreset];

  return (
    <div className="space-y-6 pb-14 print:space-y-0 print:p-0 print:m-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-blue-600" />
            Pelayanan & Pembuatan Surat Desa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ditarik otomatis dari data penduduk tersimpan dengan format surat dinas resmi standar A4.
          </p>
        </div>

        {viewMode === 'PREVIEW' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleReturnToDaftar}
              className="inline-flex items-center px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              id="btn-preview-selesai-daftar"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Selesai & Ke Daftar Surat
            </button>
            <button
              onClick={() => {
                setViewMode('FORM');
                setSelectedLetterForPrint(null);
              }}
              className="inline-flex items-center px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Kembali ke Form
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
              id="btn-print-letter"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Cetak / Simpan PDF (1 Lembar)
            </button>
          </div>
        )}
      </div>

      {/* Toast Notification Banner */}
      {successNotification && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-xl shadow-md flex items-center justify-between text-xs sm:text-sm font-semibold animate-in slide-in-from-top-2 duration-200 no-print print:hidden">
          <div className="flex items-center space-x-2.5">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successNotification}</span>
          </div>
          <button
            onClick={() => setSuccessNotification(null)}
            className="p-1 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirmation Banner in Preview Mode */}
      {viewMode === 'PREVIEW' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print print:hidden shadow-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-emerald-950">
                Surat Resmi Berhasil Diterbitkan!
              </p>
              <p className="text-[11px] sm:text-xs text-emerald-700">
                {activeCreatedLetter?.judulSurat} No.{' '}
                <span className="font-mono font-bold">{activeCreatedLetter?.nomorSurat}</span> untuk pemohon{' '}
                <span className="font-bold">{activeCreatedLetter?.namaPenduduk}</span> telah tersimpan di Buku Register.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReturnToDaftar}
            className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 self-end sm:self-auto"
          >
            <Check className="w-3.5 h-3.5 mr-1" />
            Selesai & Ke Daftar Surat
          </button>
        </div>
      )}

      {/* Sub Tabs: Layanan Buat Surat vs Daftar Surat vs Rekap Mutasi */}
      {viewMode === 'FORM' && (
        <div className="flex border-b border-slate-200 no-print print:hidden gap-2 sm:gap-3 overflow-x-auto pb-0.5">
          <button
            onClick={() => setSubTab('PELAYANAN')}
            className={`pb-2.5 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              subTab === 'PELAYANAN'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            id="tab-layanan-surat"
          >
            <FilePlus className="w-4 h-4" />
            + Buat Surat Baru
          </button>
          <button
            onClick={() => setSubTab('DAFTAR_SURAT')}
            className={`pb-2.5 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              subTab === 'DAFTAR_SURAT'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            id="tab-daftar-surat"
          >
            <FileCheck className="w-4 h-4 text-emerald-600" />
            Buku Register & Daftar Surat ({suratList.length})
          </button>
          <button
            onClick={() => setSubTab('REKAP_MUTASI')}
            className={`pb-2.5 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              subTab === 'REKAP_MUTASI'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            id="tab-rekap-mutasi"
          >
            <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
            Rekap Mutasi Penduduk
          </button>
        </div>
      )}

      {viewMode === 'FORM' && subTab === 'DAFTAR_SURAT' ? (
        <DaftarSuratTab
          suratList={suratList}
          penduduk={penduduk}
          recentlyCreatedId={recentlyCreatedId}
          onCetakSurat={(item) => {
            setSelectedLetterForPrint(item);
            setActiveCreatedLetter(item);
            setViewMode('PREVIEW');
          }}
          onDeleteSurat={(id) => {
            deleteSurat(id);
          }}
          onCreateNew={() => {
            setSubTab('PELAYANAN');
          }}
        />
      ) : viewMode === 'FORM' && subTab === 'REKAP_MUTASI' ? (
        <RekapMutasiView
          onSelectLetterType={(type) => {
            setSelectedTipe(type);
            setSubTab('PELAYANAN');
            setViewMode('FORM');
          }}
        />
      ) : viewMode === 'FORM' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form Generator */}
          <div className="lg:col-span-2 space-y-5">
            {/* Step 1: Letter Type Selection */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                1. Pilih Jenis Surat Resmi
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {LETTER_TYPES.map((lt) => {
                  const isSelected = selectedTipe === lt.id;
                  return (
                    <div
                      key={lt.id}
                      onClick={() => setSelectedTipe(lt.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                      id={`select-letter-type-${lt.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-slate-900 block">
                          {lt.title}
                        </span>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 ml-1" />
                        )}
                      </div>
                      <span className="text-[10px] text-blue-600 font-medium block mt-0.5">
                        {lt.category}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
                        {lt.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Resident (Ditarik dari Data Penduduk atau Input Manual) */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    2. Data Warga / Pemohon Surat
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Pilih warga dari database desa atau isi data pemohon secara manual.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsScanKKOpen(true)}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-xs active:scale-95 transition-all"
                    id="btn-scan-kk-surat"
                    title="Pindai Kartu Keluarga untuk mengisi pemohon otomatis"
                  >
                    <Camera className="w-3.5 h-3.5 mr-1.5" />
                    Scan KK Pemohon
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenManualModal}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold cursor-pointer shadow-xs active:scale-95 transition-all"
                    id="btn-isi-manual-penduduk"
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                    {selectedPenduduk && isManualResident ? 'Edit Data Manual' : 'Isi Data Penduduk Manual'}
                  </button>
                  {selectedPenduduk && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPenduduk(null);
                        setIsManualResident(false);
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-semibold cursor-pointer px-2 py-1"
                    >
                      Ganti Warga
                    </button>
                  )}
                </div>
              </div>

              {!selectedPenduduk ? (
                <div className="space-y-2.5">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari Nama atau NIK warga dari database..."
                      value={residentSearchQuery}
                      onChange={(e) => {
                        setResidentSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      id="input-search-pemohon"
                    />
                  </div>

                  {/* Dropdown Results */}
                  {isDropdownOpen && (
                    <div className="bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {filteredResidentResults.length === 0 ? (
                        <div className="p-4 text-center">
                          <p className="text-xs text-slate-500 mb-2">
                            {residentSearchQuery ? `Warga "${residentSearchQuery}" tidak ditemukan di database.` : 'Belum ada data warga yang cocok.'}
                          </p>
                          <button
                            type="button"
                            onClick={handleOpenManualModal}
                            className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer shadow-xs active:scale-95 transition-all"
                          >
                            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                            Isi Data Penduduk Manual Sekarang
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="p-2 bg-slate-50 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
                            <span>Hasil Pencarian Database Penduduk:</span>
                            <span className="text-[10px] text-slate-400">Pilih pemohon</span>
                          </div>
                          {filteredResidentResults.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleSelectResident(item)}
                              className="p-3 hover:bg-blue-50/60 cursor-pointer transition-colors flex items-center justify-between"
                            >
                              <div>
                                <div className="font-bold text-xs text-slate-900">{item.nama}</div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  NIK: {item.nik} &bull; {item.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {item.alamat}, RT {item.rt}/RW {item.rw}, {item.dusun}
                                </div>
                              </div>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {item.statusKeluarga}
                              </span>
                            </div>
                          ))}
                          <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-500">Warga belum terdaftar di atas?</span>
                            <button
                              type="button"
                              onClick={handleOpenManualModal}
                              className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5 mr-1" />
                              Isi Data Manual
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Manual entry & Scan KK quick bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 block">Warga belum terdaftar di database desa?</span>
                        <span className="text-slate-500 text-[11px]">Scan Kartu Keluarga untuk isi instan atau masukkan biodata secara manual.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
                      <button
                        type="button"
                        onClick={() => setIsScanKKOpen(true)}
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs whitespace-nowrap cursor-pointer shadow-xs active:scale-95 transition-all"
                        id="btn-scan-kk-quick"
                      >
                        <Camera className="w-3.5 h-3.5 mr-1.5" />
                        Scan KK
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenManualModal}
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs whitespace-nowrap cursor-pointer shadow-xs active:scale-95 transition-all"
                        id="btn-isi-manual-pilihan"
                      >
                        <UserPlus className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                        Isi Manual
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Selected resident display card */
                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        <User className="w-3.5 h-3.5" />
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{selectedPenduduk.nama}</h4>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white text-blue-700 border border-blue-200">
                        NIK: {selectedPenduduk.nik}
                      </span>
                      {isManualResident ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Edit3 className="w-3 h-3 mr-1 text-amber-600" /> Input Manual
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" /> Dari Master Data
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 pl-8">
                      {selectedPenduduk.tempatLahir}, {formatTanggalIndo(selectedPenduduk.tanggalLahir)} &bull; {selectedPenduduk.pekerjaan} &bull; {selectedPenduduk.agama}
                    </p>
                    <p className="text-xs text-slate-600 pl-8">
                      {selectedPenduduk.alamat}, RT {selectedPenduduk.rt} / RW {selectedPenduduk.rw}, {selectedPenduduk.dusun}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {isManualResident && (
                      <button
                        type="button"
                        onClick={handleOpenManualModal}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 cursor-pointer shadow-xs transition-colors"
                        title="Edit Data Pemohon Manual"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1 text-blue-600" />
                        Edit Data
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPenduduk(null);
                        setIsManualResident(false);
                      }}
                      className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 cursor-pointer shadow-xs transition-colors"
                    >
                      Ganti Warga
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Specific Letter Parameters Form */}
            <form onSubmit={handleGenerateAndPreview} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Detail & Keterangan Surat ({currentConfig.title})
              </label>

              {/* Numbering & Date - Sistem Otomatis 045 / No Urut / Romawi Bulan / Tahun */}
              <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-blue-200/60">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-blue-600 text-white rounded-md">
                      <Hash className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-blue-950">
                        Sistem Penomoran Surat Otomatis
                      </h4>
                      <p className="text-[10px] text-blue-700">
                        Format baku: <span className="font-mono font-bold">045 / Nomor Urut / Romawi Bulan / Tahun</span>
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-blue-100/90 text-blue-900 px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                    <span className="text-[10px] text-blue-700 font-sans font-medium">Pratinjau:</span>
                    <span>{formatNomorSuratOtomatis(nomorUrut, tanggalSurat, kodeKlasifikasi)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Kolom Input: Nomor Urut Otomatis Dimulai Dari */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>No. Urut (Mulai Dari) *</span>
                      <span className="text-[9px] font-semibold text-blue-600 bg-blue-100/80 px-1 py-0.2 rounded">
                        Kolom Input
                      </span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={nomorUrut}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        const safeVal = isNaN(val) ? 1 : Math.max(1, val);
                        setNomorUrut(safeVal);
                        setNomorSurat(formatNomorSuratOtomatis(safeVal, tanggalSurat, kodeKlasifikasi));
                      }}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                      title="Nomor urut otomatis dimulai dari angka ini dan akan terus berlanjut untuk setiap surat baru siapapun operatornya"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Otomatis urut per surat</span>
                  </div>

                  {/* Kode Surat Klasifikasi (Default 045) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Kode Surat *
                    </label>
                    <input
                      type="text"
                      required
                      value={kodeKlasifikasi}
                      onChange={(e) => {
                        const val = e.target.value;
                        setKodeKlasifikasi(val);
                        setNomorSurat(formatNomorSuratOtomatis(nomorUrut, tanggalSurat, val));
                      }}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="045"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Standar persuratan: 045</span>
                  </div>

                  {/* Tanggal Terbit Surat */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tanggal Terbit Surat *
                    </label>
                    <input
                      type="date"
                      required
                      value={tanggalSurat}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setTanggalSurat(newDate);
                        setNomorSurat(formatNomorSuratOtomatis(nomorUrut, newDate, kodeKlasifikasi));
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Romawi: {getRomawiBulan(new Date(tanggalSurat))} / {new Date(tanggalSurat).getFullYear()}
                    </span>
                  </div>

                  {/* Pejabat Penandatangan */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Pejabat Penandatangan *
                    </label>
                    <select
                      value={penandatangan}
                      onChange={(e) => setPenandatangan(e.target.value as any)}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                    >
                      <option value="Kepala Desa">Kepala Desa ({profile.namaKades})</option>
                      <option value="An. Kepala Desa">An. Kades / Sekdes ({profile.namaSekdes})</option>
                      <option value="Sekretaris Desa">Sekretaris Desa ({profile.namaSekdes})</option>
                    </select>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Pejabat pengesah</span>
                  </div>
                </div>

                {/* Nomor Surat Resmi Tercetak */}
                <div className="pt-2 border-t border-blue-200/70">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <label className="block text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Nomor Surat Resmi (Tercetak di Lembar Surat) *</span>
                      <span className="text-[10px] font-normal text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Otomatis Berurutan
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setNomorSurat(formatNomorSuratOtomatis(nomorUrut, tanggalSurat, kodeKlasifikasi))}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                      title="Kembalikan ke format otomatis baku"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Setel Ulang ke Format Otomatis
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={nomorSurat}
                    onChange={(e) => setNomorSurat(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border-2 border-blue-400/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                    placeholder="045 / 001 / IX / 2026"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Penomoran ini otomatis berlaku seragam siapapun operator yang mencetak surat.
                  </span>
                </div>
              </div>

              {/* Dynamic inputs based on selected letter type */}
              {selectedTipe === 'SKU' && (
                <div className="p-3 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
                  <div className="font-semibold text-xs text-slate-800">Keterangan Usaha:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Nama Usaha / Toko *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Toko Berkah, Bengkel Maju"
                        value={fields.namaUsaha || ''}
                        onChange={(e) => setFields({ ...fields, namaUsaha: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Bidang / Jenis Usaha *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Perdagangan Sembako, Pertanian"
                        value={fields.bidangUsaha || ''}
                        onChange={(e) => setFields({ ...fields, bidangUsaha: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Berdiri Sejak Tahun</label>
                      <input
                        type="text"
                        placeholder="Contoh: 2020"
                        value={fields.sejakTahun || ''}
                        onChange={(e) => setFields({ ...fields, sejakTahun: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Alamat Tempat Usaha</label>
                      <input
                        type="text"
                        value={fields.alamatUsaha || ''}
                        onChange={(e) => setFields({ ...fields, alamatUsaha: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedTipe === 'SKTM' && (
                <div className="p-3 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
                  <div className="font-semibold text-xs text-slate-800">Data Pendukung SKTM:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-600 mb-1">Alasan Permohonan SKTM *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Beasiswa Pendidikan / Keringanan Rumah Sakit"
                        value={fields.alasanSKTM || ''}
                        onChange={(e) => setFields({ ...fields, alasanSKTM: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Penghasilan Rata-rata / Bulan</label>
                      <input
                        type="text"
                        placeholder="Contoh: Rp 1.200.000"
                        value={fields.penghasilanBulanan || ''}
                        onChange={(e) => setFields({ ...fields, penghasilanBulanan: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedTipe === 'SKCK' && (
                <div className="p-3 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
                  <div className="font-semibold text-xs text-slate-800">Keterangan Pengantar SKCK:</div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Keperluan Pengurusan SKCK *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Melamar Pekerjaan di PT. Adhi Karya"
                        value={fields.keperluanSKCK || ''}
                        onChange={(e) => setFields({ ...fields, keperluanSKCK: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Catatan Kelakuan dari Lingkungan</label>
                      <input
                        type="text"
                        value={fields.riwayatKelakuan || ''}
                        onChange={(e) => setFields({ ...fields, riwayatKelakuan: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedTipe === 'DOMISILI' && (
                <div className="p-3 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
                  <div className="font-semibold text-xs text-slate-800">Detail Keterangan Domisili:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-600 mb-1">Alamat Domisili Tetap *</label>
                      <input
                        type="text"
                        required
                        value={fields.alamatDomisili || ''}
                        onChange={(e) => setFields({ ...fields, alamatDomisili: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Menetap Sejak Tahun</label>
                      <input
                        type="text"
                        placeholder="2018"
                        value={fields.tinggalSejak || ''}
                        onChange={(e) => setFields({ ...fields, tinggalSejak: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* FORM KHUSUS: SURAT PINDAH MASUK (DATANG) */}
              {selectedTipe === 'PINDAH_MASUK' && (
                <div className="p-3 bg-indigo-50/50 rounded-xl space-y-3 border border-indigo-200">
                  <div className="font-semibold text-xs text-indigo-900 flex items-center justify-between">
                    <span>Data Mutasi Pindah Masuk (Kedatangan):</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono">
                      Formulir F-1.08 Desa
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Desa/Kelurahan Asal *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nama Desa asal"
                        value={fields.desaAsal || ''}
                        onChange={(e) => setFields({ ...fields, desaAsal: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Kecamatan Asal *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nama Kecamatan asal"
                        value={fields.kecamatanAsal || ''}
                        onChange={(e) => setFields({ ...fields, kecamatanAsal: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Kabupaten/Kota Asal *</label>
                      <input
                        type="text"
                        required
                        placeholder="Kab/Kota Asal"
                        value={fields.kabupatenAsal || ''}
                        onChange={(e) => setFields({ ...fields, kabupatenAsal: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-700 font-medium mb-1">Alamat Asal Lengkap</label>
                      <input
                        type="text"
                        placeholder="Jalan / Kampung / RT / RW daerah asal"
                        value={fields.alamatAsal || ''}
                        onChange={(e) => setFields({ ...fields, alamatAsal: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Provinsi Asal</label>
                      <input
                        type="text"
                        placeholder="Jawa Barat / DKI"
                        value={fields.provinsiAsal || ''}
                        onChange={(e) => setFields({ ...fields, provinsiAsal: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">No. SKPWNI Asal</label>
                      <input
                        type="text"
                        placeholder="Contoh: 471/08/SKPWNI/2026"
                        value={fields.nomorSKPWNI || ''}
                        onChange={(e) => setFields({ ...fields, nomorSKPWNI: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Tanggal Kedatangan</label>
                      <input
                        type="date"
                        value={fields.tanggalPindahDatang || ''}
                        onChange={(e) => setFields({ ...fields, tanggalPindahDatang: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Klasifikasi Pindah</label>
                      <select
                        value={fields.klasifikasiPindah || 'Antar Kabupaten/Kota'}
                        onChange={(e) => setFields({ ...fields, klasifikasiPindah: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      >
                        <option value="Antar Desa/Kelurahan">Antar Desa/Kelurahan</option>
                        <option value="Antar Kecamatan">Antar Kecamatan</option>
                        <option value="Antar Kabupaten/Kota">Antar Kabupaten/Kota</option>
                        <option value="Antar Provinsi">Antar Provinsi</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-700 font-medium mb-1">Alamat Tujuan Menetap di Desa Ini *</label>
                      <input
                        type="text"
                        required
                        placeholder={`Jl. Melati RT 02/03, Dusun I, Desa ${profile.namaDesa}`}
                        value={fields.alamatTujuanDesa || ''}
                        onChange={(e) => setFields({ ...fields, alamatTujuanDesa: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Alasan Kepindahan</label>
                      <select
                        value={fields.alasanPindah || 'Pekerjaan / Mutasi'}
                        onChange={(e) => setFields({ ...fields, alasanPindah: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      >
                        <option value="Pekerjaan / Mutasi Dinas">Pekerjaan / Mutasi Dinas</option>
                        <option value="Pendidikan / Kuliah">Pendidikan / Sekolah</option>
                        <option value="Perumahan / Beli Rumah">Perumahan / Beli Rumah</option>
                        <option value="Keluarga / Ikut Suami/Istri">Keluarga / Menikah</option>
                        <option value="Kesehatan / Berobat">Kesehatan</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Jumlah Pengikut (Jiwa)</label>
                      <input
                        type="number"
                        min={0}
                        max={15}
                        value={fields.jumlahPengikut ?? 0}
                        onChange={(e) => setFields({ ...fields, jumlahPengikut: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-700 font-medium mb-1">Daftar Nama Pengikut (Bila ada)</label>
                      <input
                        type="text"
                        placeholder="Contoh: 1. Siti (Istri), 2. Dimas (Anak)"
                        value={fields.daftarPengikut || ''}
                        onChange={(e) => setFields({ ...fields, daftarPengikut: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* FORM KHUSUS: SURAT PINDAH KELUAR */}
              {selectedTipe === 'PINDAH_KELUAR' && (
                <div className="p-3 bg-amber-50/50 rounded-xl space-y-3 border border-amber-200">
                  <div className="font-semibold text-xs text-amber-900 flex items-center justify-between">
                    <span>Data Permohonan Pindah Keluar Wilayah:</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono">
                      Pengantar SKPWNI
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Desa/Kelurahan Tujuan *</label>
                      <input
                        type="text"
                        required
                        placeholder="Desa/Kelurahan tujuan"
                        value={fields.desaTujuan || ''}
                        onChange={(e) => setFields({ ...fields, desaTujuan: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Kecamatan Tujuan *</label>
                      <input
                        type="text"
                        required
                        placeholder="Kecamatan tujuan"
                        value={fields.kecamatanTujuan || ''}
                        onChange={(e) => setFields({ ...fields, kecamatanTujuan: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Kabupaten/Kota Tujuan *</label>
                      <input
                        type="text"
                        required
                        placeholder="Kab/Kota Tujuan"
                        value={fields.kabupatenTujuan || ''}
                        onChange={(e) => setFields({ ...fields, kabupatenTujuan: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-700 font-medium mb-1">Alamat Tujuan Lengkap *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nama Jalan / Perumahan / RT / RW"
                        value={fields.alamatTujuan || ''}
                        onChange={(e) => setFields({ ...fields, alamatTujuan: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Provinsi Tujuan</label>
                      <input
                        type="text"
                        placeholder="Provinsi Tujuan"
                        value={fields.provinsiTujuan || ''}
                        onChange={(e) => setFields({ ...fields, provinsiTujuan: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Rencana Tanggal Pindah</label>
                      <input
                        type="date"
                        value={fields.tanggalPindahKeluar || ''}
                        onChange={(e) => setFields({ ...fields, tanggalPindahKeluar: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Klasifikasi Pindah</label>
                      <select
                        value={fields.klasifikasiPindah || 'Antar Kabupaten/Kota'}
                        onChange={(e) => setFields({ ...fields, klasifikasiPindah: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      >
                        <option value="Antar Desa/Kelurahan">Antar Desa/Kelurahan</option>
                        <option value="Antar Kecamatan">Antar Kecamatan</option>
                        <option value="Antar Kabupaten/Kota">Antar Kabupaten/Kota</option>
                        <option value="Antar Provinsi">Antar Provinsi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Status Nomor KK</label>
                      <select
                        value={fields.statusKKPindah || 'Membuat KK Baru'}
                        onChange={(e) => setFields({ ...fields, statusKKPindah: e.target.value as any })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      >
                        <option value="Membuat KK Baru">Membuat KK Baru</option>
                        <option value="Numpang KK">Numpang KK</option>
                        <option value="Nomor KK Tetap">Nomor KK Tetap</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Jumlah Pengikut</label>
                      <input
                        type="number"
                        min={0}
                        max={15}
                        value={fields.jumlahPengikut ?? 0}
                        onChange={(e) => setFields({ ...fields, jumlahPengikut: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-700 font-medium mb-1">Rincian Anggota Keluarga Ikut Pindah</label>
                      <input
                        type="text"
                        placeholder="Contoh: Ratna Dewi (Istri), Rizki (Anak)"
                        value={fields.daftarPengikut || ''}
                        onChange={(e) => setFields({ ...fields, daftarPengikut: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* FORM KHUSUS: SURAT DOMISILI SEMENTARA */}
              {selectedTipe === 'DOMISILI_SEMENTARA' && (
                <div className="p-3 bg-teal-50/50 rounded-xl space-y-3 border border-teal-200">
                  <div className="font-semibold text-xs text-teal-900 flex items-center justify-between">
                    <span>Data Kependudukan Non-Permanen (Tinggal Sementara):</span>
                    <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-mono">
                      Masa Berlaku 6 Bulan
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Alamat Asal Sesuai KTP *</label>
                      <input
                        type="text"
                        required
                        placeholder="Alamat lengkap sesuai identitas KTP-el"
                        value={fields.alamatAsalKtp || ''}
                        onChange={(e) => setFields({ ...fields, alamatAsalKtp: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Alamat Tinggal Sementara di Desa *</label>
                      <input
                        type="text"
                        required
                        placeholder={`Jl. Flamboyan No. 12, RT 01/RW 02, Desa ${profile.namaDesa}`}
                        value={fields.alamatTinggalSementara || ''}
                        onChange={(e) => setFields({ ...fields, alamatTinggalSementara: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Tujuan Tinggal Sementara</label>
                      <select
                        value={fields.tujuanTinggal || 'Bekerja / Karyawan Kontrak'}
                        onChange={(e) => setFields({ ...fields, tujuanTinggal: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      >
                        <option value="Bekerja Proyek / Karyawan Kontrak">Bekerja Proyek / Karyawan Kontrak</option>
                        <option value="Pendidikan / Kuliah / Magang">Pendidikan / Kuliah / Magang</option>
                        <option value="Ikut Keluarga / Kerabat">Ikut Keluarga / Kerabat</option>
                        <option value="Menjalankan Usaha Dagang">Menjalankan Usaha Dagang</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Pekerjaan / Jabatan</label>
                      <input
                        type="text"
                        placeholder="Contoh: Tenaga Ahli IT / Teknisi"
                        value={fields.pekerjaanSementara || ''}
                        onChange={(e) => setFields({ ...fields, pekerjaanSementara: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-700 font-medium mb-1">Nama Tuan Rumah / Penjamin</label>
                      <input
                        type="text"
                        placeholder="Nama pemilik kontrakan / keluarga"
                        value={fields.namaPenjamin || ''}
                        onChange={(e) => setFields({ ...fields, namaPenjamin: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(selectedTipe === 'KEMATIAN' || selectedTipe === 'KELAHIRAN') && (
                <SuratKhususF4Forms
                  selectedTipe={selectedTipe}
                  fields={fields}
                  setFields={setFields}
                  selectedPenduduk={selectedPenduduk}
                  profile={profile}
                  pendudukList={penduduk}
                />
              )}

              {/* General Purpose Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keperluan Pembuatan Surat *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jelaskan maksud dan keperluan surat ini dibuat..."
                  value={fields.keperluan || ''}
                  onChange={(e) => setFields({ ...fields, keperluan: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Submit & Generate button */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={!selectedPenduduk}
                  onClick={handleSaveAndReturn}
                  className={`w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all ${
                    selectedPenduduk
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                  id="btn-simpan-ke-daftar-surat"
                  title="Simpan langsung ke buku register dan kembali ke menu daftar surat"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Simpan & Ke Daftar Surat
                </button>

                <button
                  type="submit"
                  disabled={!selectedPenduduk}
                  className={`w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all ${
                    selectedPenduduk
                      ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                  id="btn-buat-dan-pratinjau"
                >
                  <FilePlus className="w-4 h-4 mr-2" />
                  Buat Surat & Pratinjau Cetak
                </button>
              </div>
            </form>
          </div>

          {/* Right 1 Col: Recent Issued Letters */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center">
                  <FileCheck className="w-4 h-4 mr-1.5 text-blue-600" />
                  Buku Register Surat ({suratList.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setSubTab('DAFTAR_SURAT')}
                  className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  Lihat Semua &rarr;
                </button>
              </div>

              <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
                {suratList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    Belum ada riwayat surat yang dibuat.
                  </p>
                ) : (
                  suratList.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                          {item.tipeSurat}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatTanggalIndo(item.tanggalSurat)}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{item.namaPenduduk}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{item.nomorSurat}</p>

                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setSelectedLetterForPrint(item);
                            setActiveCreatedLetter(item);
                            setViewMode('PREVIEW');
                          }}
                          className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center cursor-pointer"
                        >
                          <Printer className="w-3 h-3 mr-1" /> Pratinjau / Cetak
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus arsip surat ${item.nomorSurat}?`)) {
                              deleteSurat(item.id);
                            }
                          }}
                          className="text-[11px] text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LIVE OFFICIAL LETTER PREVIEW (PRINTABLE A4 SHEET) */
        <div className="space-y-4 print:space-y-0 print:m-0 print:p-0">
          {/* Optimization Controls & Banner */}
          <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-3.5 no-print print:hidden flex flex-col md:flex-row md:items-center justify-between gap-3 text-slate-700 shadow-xs">
            {selectedTipe === 'KEMATIAN' || selectedTipe === 'KELAHIRAN' ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      Standar Resmi Disdukcapil (Formulir {selectedTipe === 'KEMATIAN' ? 'F-2.29' : 'F-2.01'})
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                      Ukuran F4 / Folio (215 x 330 mm)
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    Layout dan kisi kotak kode telah disesuaikan dengan format blangko baku kependudukan ukuran F4 untuk verifikasi Disdukcapil / SIAK.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">Format Pas 1 Lembar A4 (PDF & Cetak)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Margin 2.3 cm &bull; {fontConfig.badge}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    Margin kertas telah diatur &plusmn;2,3 cm (kanan, kiri, atas) sesuai tata naskah dinas resmi dengan ukuran teks proporsional agar rapi dan pas 1 lembar.
                  </p>
                </div>
              </div>
            )}

            {/* Presets Button Group / Paper Badge */}
            {selectedTipe === 'KEMATIAN' || selectedTipe === 'KELAHIRAN' ? (
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs text-xs font-semibold text-slate-700">
                <span>Ukuran Kertas:</span>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-mono font-bold">F4 / Folio (215x330mm)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 self-start md:self-auto shrink-0 bg-white p-1 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 px-1.5">Ukuran Font:</span>
                <button
                  type="button"
                  onClick={() => setFontSizePreset('compact')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    fontSizePreset === 'compact'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Ukuran 9.5pt pas 1 lembar A4 (Rekomendasi Utama)"
                >
                  Ringkas (9.5pt)
                </button>
                <button
                  type="button"
                  onClick={() => setFontSizePreset('normal')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    fontSizePreset === 'normal'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Ukuran 10.5pt standar"
                >
                  Standar (10.5pt)
                </button>
                <button
                  type="button"
                  onClick={() => setFontSizePreset('large-12pt')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    fontSizePreset === 'large-12pt'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Ukuran 12pt Standar Resmi Tata Naskah Dinas"
                >
                  Resmi (12pt)
                </button>
                <button
                  type="button"
                  onClick={() => setFontSizePreset('extra-compact')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    fontSizePreset === 'extra-compact'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Ukuran 8.5pt jika isian surat sangat panjang agar tetap 1 lembar"
                >
                  Ekstra Ringkas (8.5pt)
                </button>
              </div>
            )}
          </div>

          {/* Printable Letter Sheet Container */}
          {selectedTipe === 'KEMATIAN' ? (
            <div className="w-full overflow-x-auto pb-8 flex justify-center print:overflow-visible print:p-0 print:m-0 print:block print:w-full">
              <SuratKematianF4Sheet
                profile={profile}
                selectedPenduduk={selectedPenduduk}
                nomorSurat={nomorSurat || formatNomorSuratOtomatis(nomorUrut, tanggalSurat, kodeKlasifikasi)}
                tanggalSurat={tanggalSurat}
                penandatangan={penandatangan}
                fields={fields}
              />
            </div>
          ) : selectedTipe === 'KELAHIRAN' ? (
            <div className="w-full overflow-x-auto pb-8 flex justify-center print:overflow-visible print:p-0 print:m-0 print:block print:w-full">
              <SuratKelahiranF4Sheet
                profile={profile}
                selectedPenduduk={selectedPenduduk}
                nomorSurat={nomorSurat || formatNomorSuratOtomatis(nomorUrut, tanggalSurat, kodeKlasifikasi)}
                tanggalSurat={tanggalSurat}
                penandatangan={penandatangan}
                fields={fields}
              />
            </div>
          ) : (
            <div className="w-full overflow-x-auto pb-8 flex justify-center print:overflow-visible print:p-0 print:m-0 print:block print:w-full">
              <div
                className="printable-sheet bg-white text-black shadow-xl border border-slate-300 mx-auto box-border"
                style={{
                  width: '210mm',
                  minHeight: '260mm',
                  padding: fontConfig.padding,
                  fontFamily: "'Times New Roman', Times, serif",
                  fontSize: fontConfig.fontSize,
                  lineHeight: fontConfig.lineHeight,
                  ['--letter-font-size' as any]: fontConfig.fontSize,
                  ['--letter-line-height' as any]: fontConfig.lineHeight,
                  ['--letter-padding' as any]: fontConfig.padding,
                }}
              >
              {/* KOP SURAT RESMI PEMERINTAH DESA */}
              <div className="text-center relative pb-1.5 border-b-[3px] border-double border-black" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                <div className="flex items-center justify-center space-x-3 mb-1">
                  {/* Official Logo / Emblem */}
                  <div className={`${fontConfig.logoClass} flex items-center justify-center p-0.5 shrink-0`}>
                    {profile.logoUrl ? (
                      <img
                        src={profile.logoUrl}
                        alt="Logo Resmi Desa"
                        className={`${fontConfig.logoImgClass} object-contain`}
                      />
                    ) : (
                      <div className={`${fontConfig.logoClass} rounded-full border-2 border-black flex items-center justify-center p-1`}>
                        <Building2 className="w-7 h-7 text-black" />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold tracking-wider uppercase leading-snug" style={{ fontSize: fontConfig.kopKab }}>
                      PEMERINTAH KABUPATEN {profile.kabupaten ? profile.kabupaten.toUpperCase() : 'KLATEN'}
                    </h3>
                    <h4 className="font-bold tracking-wider uppercase leading-snug" style={{ fontSize: fontConfig.kopKab }}>
                      KECAMATAN {profile.kecamatan ? profile.kecamatan.toUpperCase() : 'KALIKOTES'}
                    </h4>
                    <h2 className="font-bold tracking-wide uppercase leading-tight" style={{ fontSize: fontConfig.kopDesa }}>
                      DESA {profile.namaDesa ? profile.namaDesa.toUpperCase() : 'JIMBUNG'}
                    </h2>
                  </div>
                </div>
                <p className="text-black leading-tight" style={{ fontSize: fontConfig.kopSub }}>
                  {profile.alamatKantor || 'Jl. Raya Jimbung - Kalikotes No. 01, Kalikotes, Klaten'} &bull; Kode Pos: {profile.kodePos || '57451'}
                </p>
                <p className="text-black leading-tight" style={{ fontSize: fontConfig.kopSub }}>
                  Telepon: {profile.telepon || '(0272) 321890'} &bull; Email: {profile.email || 'pemdes@jimbung.desa.id'} &bull; Website: {profile.website || 'https://jimbung.desa.id'}
                </p>
              </div>

              {/* LETTER TITLE & NUMBER */}
              <div className="text-center my-2" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                <h1 className="font-bold uppercase underline tracking-wider" style={{ fontSize: fontConfig.titleSize }}>
                  {currentConfig.title}
                </h1>
                <p className="mt-0.5" style={{ fontSize: fontConfig.nomorSize }}>
                  Nomor: <span className="font-semibold">{nomorSurat}</span>
                </p>
              </div>

              {/* OPENING PARAGRAPH */}
              <div
                className={`text-justify ${fontConfig.spacing}`}
                style={{
                  fontFamily: "'Times New Roman', Times, serif",
                  fontSize: fontConfig.bodySize,
                  lineHeight: fontConfig.lineHeight,
                }}
              >
                <p>
                  Yang bertanda tangan di bawah ini Kepala Desa {profile.namaDesa || 'Jimbung'}, Kecamatan {profile.kecamatan || 'Kalikotes'}, Kabupaten {profile.kabupaten || 'Klaten'}, Provinsi {profile.provinsi || 'Jawa Tengah'}, dengan ini menerangkan bahwa:
                </p>

                {/* CITIZEN IDENTITY TABLE (AUTO-FILLED) */}
                <div className="my-1.5 pl-3 sm:pl-6">
                  <table
                    className="w-full"
                    style={{
                      fontFamily: "'Times New Roman', Times, serif",
                      fontSize: fontConfig.tableSize,
                      lineHeight: fontConfig.lineHeight,
                    }}
                  >
                    <tbody>
                      <tr>
                        <td className="py-[0.5px] w-40 font-semibold">Nama Lengkap</td>
                        <td className="py-[0.5px] w-4">:</td>
                        <td className="py-[0.5px] font-bold uppercase">{selectedPenduduk?.nama}</td>
                      </tr>
                      <tr>
                        <td className="py-[0.5px] font-semibold">NIK (No. KTP)</td>
                        <td className="py-[0.5px]">:</td>
                        <td className="py-[0.5px]">{selectedPenduduk?.nik}</td>
                      </tr>
                      <tr>
                        <td className="py-[0.5px] font-semibold">Nomor Kartu Keluarga</td>
                        <td className="py-[0.5px]">:</td>
                        <td className="py-[0.5px]">{selectedPenduduk?.noKk}</td>
                      </tr>
                      <tr>
                        <td className="py-[0.5px] font-semibold">Tempat, Tanggal Lahir</td>
                        <td className="py-[0.5px]">:</td>
                        <td className="py-[0.5px]">
                          {selectedPenduduk?.tempatLahir}, {formatTanggalIndo(selectedPenduduk?.tanggalLahir)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-[0.5px] font-semibold">Jenis Kelamin</td>
                        <td className="py-[0.5px]">:</td>
                        <td className="py-[0.5px]">
                          {selectedPenduduk?.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-[0.5px] font-semibold">Agama</td>
                        <td className="py-[0.5px]">:</td>
                        <td className="py-[0.5px]">{selectedPenduduk?.agama}</td>
                      </tr>
                      <tr>
                        <td className="py-[0.5px] font-semibold">Status Perkawinan</td>
                        <td className="py-[0.5px]">:</td>
                        <td className="py-[0.5px]">{selectedPenduduk?.statusPerkawinan}</td>
                      </tr>
                      <tr>
                        <td className="py-[0.5px] font-semibold">Pekerjaan</td>
                        <td className="py-[0.5px]">:</td>
                        <td className="py-[0.5px]">{selectedPenduduk?.pekerjaan}</td>
                      </tr>
                      <tr>
                        <td className="py-[0.5px] font-semibold">Kewarganegaraan</td>
                        <td className="py-[0.5px]">:</td>
                        <td className="py-[0.5px]">{selectedPenduduk?.kewarganegaraan}</td>
                      </tr>
                      <tr className="align-top">
                        <td className="py-[0.5px] font-semibold">Alamat Domisili</td>
                        <td className="py-[0.5px]">:</td>
                        <td className="py-[0.5px]">
                          {selectedPenduduk?.alamat}, RT {selectedPenduduk?.rt} / RW {selectedPenduduk?.rw}, {selectedPenduduk?.dusun}, Desa {profile.namaDesa || 'Jimbung'}, Kec. {profile.kecamatan || 'Kalikotes'}, Kab. {profile.kabupaten || 'Klaten'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* SPECIFIC STATEMENT PARAGRAPHS */}
                <div className="space-y-1.5">
                  {selectedTipe === 'SKU' && (
                    <div className="my-1 space-y-0.5">
                      <p>
                        Bahwa nama tersebut di atas benar-benar memiliki dan menjalankan kegiatan usaha sebagai berikut:
                      </p>
                      <div className="pl-3 sm:pl-6 my-0.5">
                        <table
                          className="w-full"
                          style={{
                            fontFamily: "'Times New Roman', Times, serif",
                            fontSize: fontConfig.tableSize,
                            lineHeight: fontConfig.lineHeight,
                          }}
                        >
                          <tbody>
                            <tr>
                              <td className="py-[0.5px] w-40 font-semibold">Nama Usaha</td>
                              <td className="py-[0.5px] w-4">:</td>
                              <td className="py-[0.5px] font-bold">{fields.namaUsaha}</td>
                            </tr>
                            <tr>
                              <td className="py-[0.5px] font-semibold">Bidang Usaha</td>
                              <td className="py-[0.5px]">:</td>
                              <td className="py-[0.5px]">{fields.bidangUsaha}</td>
                            </tr>
                            <tr>
                              <td className="py-[0.5px] font-semibold">Mulai Berjalan</td>
                              <td className="py-[0.5px]">:</td>
                              <td className="py-[0.5px]">Sejak Tahun {fields.sejakTahun || '2020'}</td>
                            </tr>
                            <tr>
                              <td className="py-[0.5px] font-semibold">Lokasi Tempat Usaha</td>
                              <td className="py-[0.5px]">:</td>
                              <td className="py-[0.5px]">{fields.alamatUsaha}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedTipe === 'SKTM' && (
                    <p>
                      Berdasarkan catatan dan pengamatan yang ada pada kami, nama tersebut di atas tergolong warga berpenghasilan rendah / keluarga kurang mampu (pra-sejahtera) di wilayah Desa {profile.namaDesa || 'Jimbung'}, dengan rata-rata penghasilan {fields.penghasilanBulanan || 'Rp 1.500.000'} per bulan.
                    </p>
                  )}

                  {selectedTipe === 'SKCK' && (
                    <p>
                      Bahwa nama tersebut di atas selama menjadi warga Desa {profile.namaDesa || 'Jimbung'} memiliki kelakuan dan budi pekerti yang baik, tidak pernah tersangkut tindak pidana kepolisian, serta senantiasa mentaati norma hukum dan adat istiadat yang berlaku di masyarakat.
                    </p>
                  )}

                  {selectedTipe === 'DOMISILI' && (
                    <p>
                      Bahwa nama tersebut di atas adalah benar-benar bertempat tinggal dan berdomisili menetap di wilayah Desa {profile.namaDesa || 'Jimbung'}, Kecamatan {profile.kecamatan || 'Kalikotes'}, Kabupaten {profile.kabupaten || 'Klaten'}{fields.tinggalSejak ? `, sejak tahun ${fields.tinggalSejak}` : ''}.
                    </p>
                  )}

                  {selectedTipe === 'PINDAH_MASUK' && (
                    <div className="space-y-0.5">
                      <p>
                        Menerangkan dengan sebenarnya bahwa nama tersebut di atas benar-benar telah datang dan pindah masuk menjadi warga Desa {profile.namaDesa || 'Jimbung'}, dengan rincian data kepindahan sebagai berikut:
                      </p>
                      <div className="pl-3 sm:pl-6 my-0.5">
                        <table
                          className="w-full"
                          style={{
                            fontFamily: "'Times New Roman', Times, serif",
                            fontSize: fontConfig.tableSize,
                            lineHeight: fontConfig.lineHeight,
                          }}
                        >
                          <tbody>
                            <tr>
                              <td className="py-[0.5px] w-40 font-semibold">Daerah Asal</td>
                              <td className="py-[0.5px] w-4">:</td>
                              <td className="py-[0.5px]">{fields.desaAsal ? `Desa ${fields.desaAsal}` : ''}{fields.kecamatanAsal ? `, Kec. ${fields.kecamatanAsal}` : ''}{fields.kabupatenAsal ? `, Kab/Kota ${fields.kabupatenAsal}` : ''}</td>
                            </tr>
                            <tr>
                              <td className="py-[0.5px] font-semibold">Alamat Tujuan di Desa</td>
                              <td className="py-[0.5px]">:</td>
                              <td className="py-[0.5px]">{fields.alamatTujuanDesa || `${selectedPenduduk?.alamat}, RT ${selectedPenduduk?.rt}/RW ${selectedPenduduk?.rw}`}</td>
                            </tr>
                            <tr>
                              <td className="py-[0.5px] font-semibold">Alasan Pindah</td>
                              <td className="py-[0.5px]">:</td>
                              <td className="py-[0.5px]">{fields.alasanPindah || 'Pekerjaan / Mutasi'}</td>
                            </tr>
                            <tr>
                              <td className="py-[0.5px] font-semibold">Klasifikasi Pindah</td>
                              <td className="py-[0.5px]">:</td>
                              <td className="py-[0.5px]">{fields.klasifikasiPindah || 'Antar Kabupaten/Kota'}</td>
                            </tr>
                            <tr>
                              <td className="py-[0.5px] font-semibold">No. SKPWNI Asal</td>
                              <td className="py-[0.5px]">:</td>
                              <td className="py-[0.5px]">{fields.nomorSKPWNI || '-'}</td>
                            </tr>
                            <tr>
                              <td className="py-[0.5px] font-semibold">Jumlah Pengikut</td>
                              <td className="py-[0.5px]">:</td>
                              <td className="py-[0.5px]">{fields.jumlahPengikut || 0} Jiwa</td>
                            </tr>
                            {fields.daftarPengikut && (
                              <tr>
                                <td className="py-[0.5px] font-semibold">Daftar Pengikut</td>
                                <td className="py-[0.5px]">:</td>
                                <td className="py-[0.5px]">{fields.daftarPengikut}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedTipe === 'PINDAH_KELUAR' && (
                    <div className="space-y-0.5">
                      <p>
                        Berdasarkan permohonan yang bersangkutan, Pemerintah Desa {profile.namaDesa || 'Jimbung'} menerangkan bahwa nama tersebut di atas bermaksud pindah keluar dari wilayah Desa {profile.namaDesa || 'Jimbung'} ke alamat tujuan baru:
                      </p>
                      <div className="pl-3 sm:pl-6 my-0.5">
                        <table
                          className="w-full"
                          style={{
                            fontFamily: "'Times New Roman', Times, serif",
                            fontSize: fontConfig.tableSize,
                            lineHeight: fontConfig.lineHeight,
                          }}
                        >
                          <tbody>
                            <tr>
                              <td className="py-[0.5px] w-40 font-semibold">Alamat Tujuan Baru</td>
                              <td className="py-[0.5px] w-4">:</td>
                              <td className="py-[0.5px]">{fields.alamatTujuan || '-'}{fields.desaTujuan ? `, Desa ${fields.desaTujuan}` : ''}{fields.kecamatanTujuan ? `, Kec. ${fields.kecamatanTujuan}` : ''}{fields.kabupatenTujuan ? `, Kab/Kota ${fields.kabupatenTujuan}` : ''}</td>
                            </tr>
                            <tr>
                              <td className="py-[0.5px] font-semibold">Rencana Tanggal Pindah</td>
                              <td className="py-[0.5px]">:</td>
                              <td className="py-[0.5px]">{formatTanggalIndo(fields.tanggalPindahKeluar)}</td>
                            </tr>
                            <tr>
                              <td className="py-[0.5px] font-semibold">Alasan Pindah</td>
                              <td className="py-[0.5px]">:</td>
                              <td className="py-[0.5px]">{fields.alasanPindah || 'Pekerjaan / Keluarga'}</td>
                            </tr>
                            <tr>
                              <td className="py-[0.5px] font-semibold">Status Nomor KK</td>
                              <td className="py-[0.5px]">:</td>
                              <td className="py-[0.5px]">{fields.statusKKPindah || 'Membuat KK Baru'}</td>
                            </tr>
                            <tr>
                              <td className="py-[0.5px] font-semibold">Klasifikasi Pindah</td>
                              <td className="py-[0.5px]">:</td>
                              <td className="py-[0.5px]">{fields.klasifikasiPindah || 'Antar Kabupaten/Kota'}</td>
                            </tr>
                            <tr>
                              <td className="py-[0.5px] font-semibold">Jumlah Pengikut</td>
                              <td className="py-[0.5px]">:</td>
                              <td className="py-[0.5px]">{fields.jumlahPengikut || 0} Jiwa</td>
                            </tr>
                            {fields.daftarPengikut && (
                              <tr>
                                <td className="py-[0.5px] font-semibold">Anggota Keluarga Ikut</td>
                                <td className="py-[0.5px]">:</td>
                                <td className="py-[0.5px]">{fields.daftarPengikut}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedTipe === 'DOMISILI_SEMENTARA' && (
                    <div className="space-y-0.5">
                      <p>
                        Menerangkan dengan sebenarnya bahwa warga yang bersangkutan saat ini tinggal sementara di wilayah Desa {profile.namaDesa || 'Jimbung'}, dengan rincian:
                      </p>
                      <div className="pl-3 sm:pl-6 my-0.5">
                        <table
                          className="w-full"
                          style={{
                            fontFamily: "'Times New Roman', Times, serif",
                            fontSize: fontConfig.tableSize,
                            lineHeight: fontConfig.lineHeight,
                          }}
                        >
                          <tbody>
                            <tr>
                              <td className="py-[0.5px] w-40 font-semibold">Alamat Asal KTP</td>
                              <td className="py-[0.5px] w-4">:</td>
                              <td className="py-[0.5px]">{fields.alamatAsalKtp || selectedPenduduk?.alamat}</td>
                            </tr>
                            <tr>
                              <td className="py-[0.5px] font-semibold">Alamat Domisili di Desa</td>
                              <td className="py-[0.5px]">:</td>
                              <td className="py-[0.5px]">{fields.alamatTinggalSementara || `${selectedPenduduk?.alamat}, RT ${selectedPenduduk?.rt}/RW ${selectedPenduduk?.rw}`}</td>
                            </tr>
                            <tr>
                              <td className="py-[0.5px] font-semibold">Tujuan Tinggal</td>
                              <td className="py-[0.5px]">:</td>
                              <td className="py-[0.5px]">{fields.tujuanTinggal || 'Bekerja / Karyawan'}</td>
                            </tr>
                            <tr>
                              <td className="py-[0.5px] font-semibold">Pekerjaan / Jabatan</td>
                              <td className="py-[0.5px]">:</td>
                              <td className="py-[0.5px]">{fields.pekerjaanSementara || selectedPenduduk?.pekerjaan}</td>
                            </tr>
                            <tr>
                              <td className="py-[0.5px] font-semibold">Nama Penjamin</td>
                              <td className="py-[0.5px]">:</td>
                              <td className="py-[0.5px]">{fields.namaPenjamin || 'Pemilik Rumah'}</td>
                            </tr>
                            <tr>
                              <td className="py-[0.5px] font-semibold">Masa Berlaku Izin</td>
                              <td className="py-[0.5px]">:</td>
                              <td className="py-[0.5px]">6 (Enam) Bulan Sejak Diterbitkan</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedTipe === 'KEMATIAN' && (
                    <p>
                      Telah meninggal dunia pada hari <strong>{fields.hariMeninggal}</strong>, tanggal <strong>{formatTanggalIndo(fields.tanggalMeninggal)}</strong> pukul {fields.waktuMeninggal} di {fields.tempatMeninggal}, dikarenakan {fields.sebabMeninggal}.
                    </p>
                  )}

                  {selectedTipe === 'KELAHIRAN' && (
                    <p>
                      Telah lahir seorang anak bernama <strong>{fields.namaBayi}</strong>, pada {fields.jamLahir}, dari pasangan suami istri {fields.namaAyah || 'Ayah'} dan {fields.namaIbu || 'Ibu'}.
                    </p>
                  )}

                  <p>
                    Surat keterangan ini diterbitkan atas permohonan yang bersangkutan guna keperluan:{' '}
                    <strong>{fields.keperluan || currentConfig.defaultKeperluan}</strong>.
                  </p>

                  <p>
                    Demikian surat keterangan ini kami buat dengan sebenarnya dan tanpa ada paksaan dari pihak manapun untuk dapat dipergunakan sebagaimana mestinya.
                  </p>
                </div>

                {/* OFFICIAL SIGNATURE BLOCK (CLEAN RIGHT-ALIGNED, NO CAP/STAMP, NO BARCODE) */}
                <div className="pt-2.5 flex justify-end" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  <div className="w-64 text-center leading-normal" style={{ fontSize: fontConfig.bodySize }}>
                    <p>
                      {profile.namaDesa || 'Jimbung'}, {formatTanggalIndo(tanggalSurat)}
                    </p>

                    {penandatangan === 'Kepala Desa' && (
                      <p className="font-bold uppercase mt-0.5">
                        KEPALA DESA {(profile.namaDesa || 'Jimbung').toUpperCase()}
                      </p>
                    )}
                    {penandatangan === 'An. Kepala Desa' && (
                      <div className="font-bold uppercase mt-0.5 leading-snug">
                        <p>a.n. KEPALA DESA {(profile.namaDesa || 'Jimbung').toUpperCase()}</p>
                        <p>SEKRETARIS DESA</p>
                      </div>
                    )}
                    {penandatangan === 'Sekretaris Desa' && (
                      <p className="font-bold uppercase mt-0.5">
                        SEKRETARIS DESA {(profile.namaDesa || 'Jimbung').toUpperCase()}
                      </p>
                    )}

                    {/* Ruang Tanda Tangan Pejabat (Bersih, tanpa cap dinas) */}
                    <div style={{ height: fontConfig.ttdHeight }} className="flex items-center justify-center">
                      {/* Bersih untuk tanda tangan basah pejabat */}
                    </div>

                    <p className="font-bold underline uppercase">
                      {penandatangan === 'Kepala Desa' ? profile.namaKades : profile.namaSekdes}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Bottom Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 no-print print:hidden">
            <button
              onClick={() => {
                setViewMode('FORM');
                setSelectedLetterForPrint(null);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Kembali & Buat Surat Lain
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 mr-2" />
              {selectedTipe === 'KEMATIAN' || selectedTipe === 'KELAHIRAN'
                ? 'Cetak Dokumen Sekarang (F4 / Folio)'
                : 'Cetak Dokumen Sekarang (A4 / PDF)'}
            </button>
          </div>
        </div>
      )}

      {/* Modal Input Data Penduduk Manual */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {isManualResident && selectedPenduduk ? 'Edit Data Penduduk Pemohon' : 'Isi Data Penduduk Manual'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Masukkan biodata warga pemohon secara langsung untuk pembuatan surat resmi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveManualResident} className="p-4 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto">
              {/* Scan KK Quick Action Banner inside Manual Modal */}
              <div className="p-3 sm:p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Scan Kartu Keluarga (KK) Pemohon
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Pindai berkas KK untuk mengisi otomatis seluruh kolom formulir manual ini dengan AI.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScanKKOpen(true)}
                  className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap self-start sm:self-center"
                  id="btn-scan-kk-manual-modal"
                >
                  <Camera className="w-3.5 h-3.5 mr-1.5" />
                  Scan Dokumen KK
                </button>
              </div>

              {manualFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{manualFormError}</span>
                </div>
              )}

              {/* NIK & No KK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIK (Nomor Induk Kependudukan) *
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    required
                    placeholder="16 digit angka NIK"
                    value={manualFormData.nik}
                    onChange={(e) => setManualFormData({ ...manualFormData, nik: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                    {manualFormData.nik.length}/16 digit
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Kartu Keluarga (No. KK)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="16 digit nomor KK (opsional)"
                    value={manualFormData.noKk}
                    onChange={(e) => setManualFormData({ ...manualFormData, noKk: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Nama Lengkap & Jenis Kelamin */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap (Sesuai KTP) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={manualFormData.nama}
                    onChange={(e) => setManualFormData({ ...manualFormData, nama: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={manualFormData.jenisKelamin}
                    onChange={(e) => setManualFormData({ ...manualFormData, jenisKelamin: e.target.value as JenisKelamin })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              {/* Tempat & Tgl Lahir */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tempat Lahir *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Kota / Kabupaten tempat lahir"
                    value={manualFormData.tempatLahir}
                    onChange={(e) => setManualFormData({ ...manualFormData, tempatLahir: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Lahir *
                  </label>
                  <input
                    type="date"
                    required
                    value={manualFormData.tanggalLahir}
                    onChange={(e) => setManualFormData({ ...manualFormData, tanggalLahir: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Agama, Status Kawin & Status Keluarga */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Agama
                  </label>
                  <select
                    value={manualFormData.agama}
                    onChange={(e) => setManualFormData({ ...manualFormData, agama: e.target.value as Agama })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Perkawinan
                  </label>
                  <select
                    value={manualFormData.statusPerkawinan}
                    onChange={(e) => setManualFormData({ ...manualFormData, statusPerkawinan: e.target.value as StatusPerkawinan })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Belum Kawin">Belum Kawin</option>
                    <option value="Kawin">Kawin</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status dalam Keluarga
                  </label>
                  <select
                    value={manualFormData.statusKeluarga}
                    onChange={(e) => setManualFormData({ ...manualFormData, statusKeluarga: e.target.value as StatusHubunganKeluarga })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Kepala Keluarga">Kepala Keluarga</option>
                    <option value="Istri">Istri</option>
                    <option value="Anak">Anak</option>
                    <option value="Orang Tua">Orang Tua</option>
                    <option value="Famili Lain">Famili Lain</option>
                  </select>
                </div>
              </div>

              {/* Pekerjaan, Pendidikan & Kewarganegaraan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pekerjaan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Wiraswasta / Petani / dll"
                    value={manualFormData.pekerjaan}
                    onChange={(e) => setManualFormData({ ...manualFormData, pekerjaan: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pendidikan Terakhir
                  </label>
                  <input
                    type="text"
                    placeholder="SMA / S1 / SMP"
                    value={manualFormData.pendidikan}
                    onChange={(e) => setManualFormData({ ...manualFormData, pendidikan: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kewarganegaraan
                  </label>
                  <input
                    type="text"
                    value={manualFormData.kewarganegaraan}
                    onChange={(e) => setManualFormData({ ...manualFormData, kewarganegaraan: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Alamat, RT/RW, Dusun */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat Tempat Tinggal / Jalan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jl. Pahlawan No. 12"
                    value={manualFormData.alamat}
                    onChange={(e) => setManualFormData({ ...manualFormData, alamat: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">RT *</label>
                    <input
                      type="text"
                      maxLength={3}
                      required
                      placeholder="01"
                      value={manualFormData.rt}
                      onChange={(e) => setManualFormData({ ...manualFormData, rt: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">RW *</label>
                    <input
                      type="text"
                      maxLength={3}
                      required
                      placeholder="02"
                      value={manualFormData.rw}
                      onChange={(e) => setManualFormData({ ...manualFormData, rw: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Dusun / Wilayah</label>
                    <input
                      type="text"
                      placeholder="Dusun I / Krajan"
                      value={manualFormData.dusun}
                      onChange={(e) => setManualFormData({ ...manualFormData, dusun: e.target.value })}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Nomor Kontak WhatsApp / HP */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor HP / WhatsApp (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="08xxxxxxxxxx"
                  value={manualFormData.noHp || ''}
                  onChange={(e) => setManualFormData({ ...manualFormData, noHp: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Option to Save to Master Data */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveToMasterData}
                    onChange={(e) => setSaveToMasterData(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Simpan juga ke Master Data Penduduk Desa
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Jika dicentang, data warga ini akan otomatis tercatat permanen di basis data kependudukan desa sehingga tidak perlu diisi ulang untuk pengurusan berikutnya.
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                  id="btn-simpan-manual-pemohon"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  Gunakan Sebagai Pemohon Surat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scan KK Modal for Surat Generator */}
      <ScanKKModal
        isOpen={isScanKKOpen}
        onClose={() => setIsScanKKOpen(false)}
        onApplyResident={handleApplyScannedResidentToSurat}
        onImportAllFamily={handleImportAllFamilyFromSurat}
        title="Scan Kartu Keluarga (Pemohon Surat)"
        subtitle="Pindai KK untuk langsung memilih atau mengisi biodata warga pemohon surat."
      />
    </div>
  );
};
