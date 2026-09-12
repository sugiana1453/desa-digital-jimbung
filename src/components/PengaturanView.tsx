import React, { useState } from 'react';
import {
  Settings,
  Landmark,
  Save,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Database,
  ShieldAlert,
  Image as ImageIcon,
  Building2,
  Sparkles,
  Trash2,
  UserCheck,
  Briefcase,
  User,
  Check,
  FileSpreadsheet,
  FileCode,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  Users,
  Layers,
  HardDriveDownload,
  Info,
  Hash,
} from 'lucide-react';
import { useDesa } from '../context/DesaContext';
import { DesaProfile } from '../types';
import { LOGO_PRESETS } from '../utils/logoPresets';
import {
  exportToExcelBackup,
  exportToJsonBackup,
  getLastBackupInfo,
  LastBackupInfo,
  BackupScope,
} from '../utils/backupUtils';
import { formatHariTanggalIndo, getRomawiBulan } from '../utils/formatters';

export const PengaturanView: React.FC = () => {
  const {
    profile,
    updateProfile,
    importData,
    resetDefaultData,
    penduduk,
    suratList,
    arsip,
    suratMasuk,
    suratKeluar,
    adminUsers,
  } = useDesa();

  const [formData, setFormData] = useState<DesaProfile>(profile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [lastBackup, setLastBackup] = useState<LastBackupInfo | null>(getLastBackupInfo);
  const [backupSuccessMessage, setBackupSuccessMessage] = useState<string | null>(null);
  const [backupProcessing, setBackupProcessing] = useState(false);
  const [activeBackupTab, setActiveBackupTab] = useState<'excel' | 'json'>('excel');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRunBackup = (format: 'Excel' | 'JSON', scope: BackupScope) => {
    setBackupProcessing(true);
    setTimeout(() => {
      try {
        const payload = {
          profile,
          penduduk,
          suratList,
          suratMasuk,
          suratKeluar,
          arsip,
          adminUsers,
        };

        if (format === 'Excel') {
          const res = exportToExcelBackup(payload, scope);
          setLastBackup(getLastBackupInfo());
          setBackupSuccessMessage(
            `Salinan cadangan Excel (${res.fileName}) berisi ${res.itemCount} data berhasil diunduh ke komputer!`
          );
        } else {
          const res = exportToJsonBackup(payload, scope);
          setLastBackup(getLastBackupInfo());
          setBackupSuccessMessage(
            `Salinan cadangan JSON (${res.fileName}) berisi ${res.itemCount} data berhasil diunduh ke komputer!`
          );
        }
      } catch (err) {
        console.error('Backup error:', err);
        alert('Terjadi kendala saat memproses cadangan data.');
      } finally {
        setBackupProcessing(false);
        setTimeout(() => setBackupSuccessMessage(null), 5000);
      }
    }, 80);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file logo maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormData((prev) => ({ ...prev, logoUrl: result }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelectPreset = (dataUrl: string) => {
    setFormData((prev) => ({ ...prev, logoUrl: dataUrl }));
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importData(content);
        if (success) {
          setImportStatus('Data berhasil dipulihkan dari file backup!');
        } else {
          setImportStatus('Gagal membaca file backup. Pastikan format JSON sesuai.');
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-14 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center">
          <Settings className="w-6 h-6 mr-2 text-blue-600" />
          Profil Desa & Pengaturan Sistem
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Identitas pemerintah desa akan langsung terpasang pada KOP Surat resmi, tanda tangan, dan dokumen cetak.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center shadow-xs">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
          Profil dan identitas Pemerintah Desa berhasil diperbarui!
        </div>
      )}

      {importStatus && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-semibold flex items-center shadow-xs">
          <Database className="w-4 h-4 mr-2 text-blue-600" />
          {importStatus}
        </div>
      )}

      {/* Identitas Desa Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Landmark className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm sm:text-base font-bold">Identitas Resmi Kantor Desa</h2>
          </div>
          <span className="text-xs text-slate-400">Untuk Kop & Stempel Surat</span>
        </div>

        <form onSubmit={handleSaveProfile} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Desa *
              </label>
              <input
                type="text"
                required
                value={formData.namaDesa}
                onChange={(e) => setFormData({ ...formData, namaDesa: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kecamatan *
              </label>
              <input
                type="text"
                required
                value={formData.kecamatan}
                onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kabupaten / Kota *
              </label>
              <input
                type="text"
                required
                value={formData.kabupaten}
                onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Provinsi *
              </label>
              <input
                type="text"
                required
                value={formData.provinsi}
                onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Pos
              </label>
              <input
                type="text"
                value={formData.kodePos}
                onChange={(e) => setFormData({ ...formData, kodePos: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Telepon Kantor Desa
              </label>
              <input
                type="text"
                value={formData.telepon}
                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Lengkap Kantor Desa
            </label>
            <input
              type="text"
              value={formData.alamatKantor}
              onChange={(e) => setFormData({ ...formData, alamatKantor: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Resmi Desa
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Website Resmi Desa
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Bagian Logo KOP Surat Desa */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  Logo Resmi KOP Surat Desa
                </h3>
                <p className="text-[11px] text-slate-500">
                  Logo ini akan dicetak otomatis di bagian kiri atas Kop Surat dinas, surat keterangan warga, dan berkas PDF.
                </p>
              </div>
              {formData.logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded bg-rose-50 border border-rose-200 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Logo</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-4 bg-slate-50 rounded-xl border border-slate-200">
              {/* Logo Preview Box */}
              <div className="md:col-span-3 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                {formData.logoUrl ? (
                  <div className="w-24 h-24 flex items-center justify-center p-1 bg-white rounded-lg border border-slate-100 overflow-hidden">
                    <img
                      src={formData.logoUrl}
                      alt="Logo Desa"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 p-2 text-center bg-slate-50">
                    <Building2 className="w-8 h-8 text-slate-300 mb-1" />
                    <span className="text-[10px] font-semibold leading-tight">Belum Ada Logo</span>
                  </div>
                )}
                <span className="text-[10px] text-slate-500 font-medium mt-2 text-center">
                  {formData.logoUrl ? 'Logo Aktif Terpasang' : 'Standar Lambang Desa'}
                </span>
              </div>

              {/* Upload and Preset Selection */}
              <div className="md:col-span-9 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unggah Logo Kustom (PNG / JPG / SVG)
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-all">
                      <Upload className="w-4 h-4" />
                      <span>Pilih File Gambar Logo</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/svg+xml"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Disarankan file transparan (PNG/SVG), maks 2MB
                    </span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Atau Pilih Cepat Lambang Resmi Pemerintahan:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {LOGO_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset.dataUrl)}
                        className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          formData.logoUrl === preset.dataUrl
                            ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-200'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={preset.dataUrl}
                          alt={preset.name}
                          className="w-7 h-7 object-contain shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{preset.name}</p>
                          <p className="text-[9px] text-slate-500 line-clamp-1">{preset.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Mini Preview of KOP */}
                <div className="mt-2 p-3 bg-white rounded-lg border border-slate-200 text-slate-900">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Pratinjau Tampilan Kop Surat:
                  </span>
                  <div className="flex items-center gap-3 border-b-2 border-double border-slate-900 pb-2">
                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo" className="max-h-12 max-w-12 object-contain" />
                      ) : (
                        <div className="w-11 h-11 rounded-full border border-slate-800 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-slate-700" />
                        </div>
                      )}
                    </div>
                    <div className="text-center flex-1 leading-tight">
                      <p className="text-[9px] font-bold tracking-wider uppercase text-slate-700">
                        PEMERINTAH KABUPATEN {formData.kabupaten.toUpperCase()}
                      </p>
                      <p className="text-[10px] font-bold tracking-wide uppercase text-slate-800">
                        KECAMATAN {formData.kecamatan.toUpperCase()}
                      </p>
                      <p className="text-xs font-black tracking-wider uppercase text-blue-900">
                        DESA {formData.namaDesa.toUpperCase()}
                      </p>
                      <p className="text-[8px] text-slate-500 mt-0.5">
                        {formData.alamatKantor} &bull; Telp: {formData.telepon || '-'} &bull; Pos: {formData.kodePos || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pejabat Penandatangan & Petugas Pelaksana */}
          <div className="pt-3 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Pejabat Penandatangan Surat & Petugas Operator
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Kepala Desa (Kades)</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    required
                    value={formData.namaKades}
                    onChange={(e) => setFormData({ ...formData, namaKades: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">NIP Kades (Bila ada / No. Reg)</label>
                  <input
                    type="text"
                    value={formData.nipKades}
                    onChange={(e) => setFormData({ ...formData, nipKades: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Sekretaris Desa (Sekdes)</span>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    required
                    value={formData.namaSekdes}
                    onChange={(e) => setFormData({ ...formData, namaSekdes: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">NIP Sekdes</label>
                  <input
                    type="text"
                    value={formData.nipSekdes}
                    onChange={(e) => setFormData({ ...formData, nipSekdes: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Petugas Operator Layanan Desa */}
            <div className="mt-4 p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                  <UserCheck className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-xs text-blue-900">
                    Petugas Pelaksana / Operator Meja Pelayanan Desa
                  </h4>
                  <p className="text-[10px] text-blue-700/80">
                    Nama petugas ini akan dicantumkan pada verifikasi berkas permohonan surat, buku register, dan audit cetak
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Nama Petugas / Operator *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Rahmat Hidayat, S.AP."
                    value={formData.namaOperator || ''}
                    onChange={(e) => setFormData({ ...formData, namaOperator: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    NIP / ID Registrasi Petugas
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 19950711 202203 1 005"
                    value={formData.nipOperator || ''}
                    onChange={(e) => setFormData({ ...formData, nipOperator: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Jabatan Operator Pelayanan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Operator Layanan & Staf Pelayanan"
                    value={formData.jabatanOperator || ''}
                    onChange={(e) => setFormData({ ...formData, jabatanOperator: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Pengaturan Penomoran Surat Otomatis Desa */}
            <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-600 text-white rounded-lg">
                    <Hash className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-blue-950">
                      Pengaturan Penomoran Surat Otomatis Desa
                    </h4>
                    <p className="text-[10px] text-blue-700/90">
                      Format seragam: <span className="font-mono font-bold">045 / [Nomor Urut] / [Bulan Romawi] / [Tahun]</span> (berjalan otomatis untuk seluruh operator).
                    </p>
                  </div>
                </div>
                <div className="text-xs font-mono font-bold text-blue-900 bg-white px-2.5 py-1 rounded-lg border border-blue-300">
                  Pratinjau: {formData.kodeKlasifikasiSurat || '045'} / {String(formData.nomorUrutSuratSaatIni || formData.nomorUrutSuratMulai || 1).padStart(3, '0')} / {getRomawiBulan(new Date())} / {new Date().getFullYear()}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Kode Surat Klasifikasi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="045"
                    value={formData.kodeKlasifikasiSurat || '045'}
                    onChange={(e) => setFormData({ ...formData, kodeKlasifikasiSurat: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-500">Standar persuratan desa: 045</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Nomor Urut Dimulai Dari *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.nomorUrutSuratMulai || 1}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                      setFormData({ ...formData, nomorUrutSuratMulai: val });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-500">Angka awal penomoran urut desa</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Nomor Urut Berjalan Saat Ini (Counter)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.nomorUrutSuratSaatIni || formData.nomorUrutSuratMulai || 1}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                      setFormData({ ...formData, nomorUrutSuratSaatIni: val });
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-500">Nomor berikutnya yang akan dipakai operator</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-xs active:scale-95 transition-all cursor-pointer"
              id="btn-simpan-profil-desa"
            >
              <Save className="w-4 h-4 mr-2" />
              Simpan Perubahan Identitas Desa
            </button>
          </div>
        </form>
      </div>

      {/* Database Backup & Restore */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-600" />
              Pencadangan & Pemulihan Data Lokal (Backup & Restore)
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200">
              Penyimpanan Offline Lokal
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Simpan salinan cadangan data penduduk, register surat keterangan, dan buku agenda surat secara periodik
            ke dalam format <strong>Microsoft Excel (.xlsx)</strong> atau <strong>JSON (.json)</strong>.
          </p>
        </div>

        {/* Periodic Backup Status Indicator */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className={`p-2 rounded-lg ${lastBackup ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                  Status Pencadangan Periodik:
                  {lastBackup ? (
                    <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                      Tercadangkan
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <AlertCircle className="w-3 h-3 mr-1 text-amber-600" />
                      Belum Pernah Dicadangkan
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {lastBackup ? (
                    <span>
                      Terakhir: <strong>{new Date(lastBackup.timestamp).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} WIB</strong>
                      {' • '}Format: <span className="font-semibold text-slate-700">{lastBackup.format}</span>
                      {' • '}Cakupan: <span className="font-semibold text-slate-700">{lastBackup.scopeLabel}</span> ({lastBackup.itemCount} data)
                    </span>
                  ) : (
                    <span>Operator disarankan membuat salinan cadangan minimal 1x per minggu atau per bulan secara rutin.</span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              type="button"
              disabled={backupProcessing}
              onClick={() => handleRunBackup('Excel', 'all')}
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {backupProcessing ? 'Memproses...' : 'Cadangkan Sekarang (Excel)'}
            </button>
          </div>

          {backupSuccessMessage && (
            <div className="flex items-center text-xs font-medium text-emerald-800 bg-emerald-100/70 border border-emerald-300 rounded-lg p-2.5 transition-all animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
              <span>{backupSuccessMessage}</span>
            </div>
          )}
        </div>

        {/* Database Statistics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-lg">
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Penduduk Terdata</span>
            <strong className="text-slate-900 text-base">{penduduk.length}</strong>
            <span className="text-slate-400 text-[11px] ml-1">Jiwa</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg">
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Surat Keterangan</span>
            <strong className="text-slate-900 text-base">{suratList.length}</strong>
            <span className="text-slate-400 text-[11px] ml-1">Berkas</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg">
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Buku Agenda M/K</span>
            <strong className="text-slate-900 text-base">{suratMasuk.length + suratKeluar.length}</strong>
            <span className="text-slate-400 text-[11px] ml-1">Surat</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg">
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Arsip Perdes / SK</span>
            <strong className="text-slate-900 text-base">{arsip.length}</strong>
            <span className="text-slate-400 text-[11px] ml-1">Dokumen</span>
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div>
          <div className="flex border-b border-slate-200 mb-4">
            <button
              type="button"
              onClick={() => setActiveBackupTab('excel')}
              className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center cursor-pointer ${
                activeBackupTab === 'excel'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
              Format Microsoft Excel (.xlsx)
              <span className="ml-2 text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                Populer
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveBackupTab('json')}
              className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center cursor-pointer ${
                activeBackupTab === 'json'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <FileCode className="w-4 h-4 mr-2 text-blue-600" />
              Format Database JSON (.json)
              <span className="ml-2 text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded-full font-medium">
                Untuk Restore
              </span>
            </button>
          </div>

          {/* EXCEL BACKUP TAB */}
          {activeBackupTab === 'excel' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                <div className="font-semibold flex items-center text-emerald-800 mb-1">
                  <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Keunggulan Salinan Cadangan Format Excel (.xlsx):
                </div>
                <p className="text-emerald-900/80 leading-relaxed text-[11px]">
                  File workbook multi-sheet terstruktur rapi yang memisahkan <strong>Data Penduduk</strong>, 
                  <strong> Surat Keterangan Dibuat</strong>, <strong>Buku Agenda Surat Masuk</strong>, 
                  <strong> Buku Agenda Surat Keluar</strong>, dan <strong>Arsip Regulasi Desa</strong>. 
                  Dapat langsung dibuka di Microsoft Excel, Google Sheets, atau WPS Office untuk pengarsipan, pencetakan data, atau pelaporan berkala ke Kecamatan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* All Data Excel */}
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-white hover:border-emerald-400 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900 flex items-center">
                        <Layers className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                        Paket Lengkap Semua Data
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        Multi-Sheet
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Mencakup seluruh data penduduk, surat keterangan warga, buku surat masuk, buku surat keluar, arsip, dan profil desa.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={backupProcessing}
                    onClick={() => handleRunBackup('Excel', 'all')}
                    className="w-full inline-flex items-center justify-center px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Unduh Excel Lengkap (.xlsx)
                  </button>
                </div>

                {/* Penduduk Excel */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900 flex items-center">
                        <Users className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                        Cadangan Data Penduduk
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded">
                        {penduduk.length} Jiwa
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Khusus tabel kependudukan lengkap: NIK, No. KK, Nama, TTL, Agama, Pekerjaan, RT/RW, Dusun, dan status keluarga.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={backupProcessing}
                    onClick={() => handleRunBackup('Excel', 'penduduk')}
                    className="w-full inline-flex items-center justify-center px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    Unduh Excel Penduduk (.xlsx)
                  </button>
                </div>

                {/* Surat Excel */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900 flex items-center">
                        <FileText className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                        Cadangan Data Surat
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded">
                        {suratList.length + suratMasuk.length + suratKeluar.length} Surat
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Register surat keterangan pelayanan warga serta buku agenda surat masuk & keluar beserta penandatangan.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={backupProcessing}
                    onClick={() => handleRunBackup('Excel', 'surat')}
                    className="w-full inline-flex items-center justify-center px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    Unduh Excel Surat (.xlsx)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* JSON BACKUP TAB */}
          {activeBackupTab === 'json' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-xl text-xs text-blue-950">
                <div className="font-semibold flex items-center text-blue-800 mb-1">
                  <FileCode className="w-4 h-4 mr-1.5 text-blue-600" />
                  Keunggulan Salinan Cadangan Format JSON (.json):
                </div>
                <p className="text-blue-900/80 leading-relaxed text-[11px]">
                  File snapshot database sistem utuh dengan struktur aslinya. File ini merupakan format resmi yang 
                  dapat langsung dipulihkan (Restore) kembali ke dalam aplikasi ini kapan saja jika Anda berpindah laptop, ganti komputer, atau jika cache peramban terhapus.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* All Data JSON */}
                <div className="p-3.5 rounded-xl border border-blue-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900 flex items-center">
                        <HardDriveDownload className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                        Full Snapshot Database JSON
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                        Restore Ready
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Salinan penuh seluruh data kependudukan, surat, arsip, profil desa, dan akun petugas untuk restore sistem.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={backupProcessing}
                    onClick={() => handleRunBackup('JSON', 'all')}
                    className="w-full inline-flex items-center justify-center px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
                    id="btn-backup-json-all"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                    Unduh JSON Lengkap (.json)
                  </button>
                </div>

                {/* Penduduk JSON */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900 flex items-center">
                        <Users className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                        JSON Khusus Penduduk
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded">
                        {penduduk.length} Jiwa
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Salinan file JSON khusus data kependudukan penduduk desa beserta identitas profil desa.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={backupProcessing}
                    onClick={() => handleRunBackup('JSON', 'penduduk')}
                    className="w-full inline-flex items-center justify-center px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    Unduh JSON Penduduk (.json)
                  </button>
                </div>

                {/* Surat JSON */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900 flex items-center">
                        <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                        JSON Khusus Surat
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded">
                        {suratList.length + suratMasuk.length + suratKeluar.length} Data
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Salinan file JSON berisi register surat keterangan, register surat masuk, dan surat keluar.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={backupProcessing}
                    onClick={() => handleRunBackup('JSON', 'surat')}
                    className="w-full inline-flex items-center justify-center px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    Unduh JSON Surat (.json)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pemulihan Data & Reset */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center px-4 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs shadow-xs cursor-pointer transition-colors">
              <Upload className="w-4 h-4 mr-2 text-blue-600" />
              <span>Pulihkan Data dari File Cadangan (Restore JSON)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {importStatus && (
              <span className={`text-xs font-medium px-3 py-1.5 rounded-lg ${
                importStatus.includes('berhasil') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {importStatus}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin memulihkan database ke data awal contoh? Data perubahan yang belum dicadangkan akan hilang.')) {
                resetDefaultData();
                setFormData(profile);
                alert('Database berhasil direset ke data awal bawaan!');
              }
            }}
            className="inline-flex items-center px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset ke Data Awal
          </button>
        </div>
      </div>
    </div>
  );
};
