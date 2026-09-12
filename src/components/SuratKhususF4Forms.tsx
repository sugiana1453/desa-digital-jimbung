import React, { useState } from 'react';
import { Penduduk, SuratFieldValues, DesaProfile } from '../types';
import { UserCheck, Users, Baby, Skull, Sparkles } from 'lucide-react';

interface SuratKhususF4FormsProps {
  selectedTipe: 'KEMATIAN' | 'KELAHIRAN';
  fields: SuratFieldValues;
  setFields: React.Dispatch<React.SetStateAction<SuratFieldValues>>;
  selectedPenduduk: Penduduk | null;
  profile: DesaProfile;
  pendudukList: Penduduk[];
}

export const SuratKhususF4Forms: React.FC<SuratKhususF4FormsProps> = ({
  selectedTipe,
  fields,
  setFields,
  selectedPenduduk,
  profile,
  pendudukList,
}) => {
  const [activeTab, setActiveTab] = useState<'UTAMA' | 'ORANGTUA' | 'PELAPOR_SAKSI'>('UTAMA');

  const defaultDesa = profile.namaDesa || 'Jimbung';
  const defaultKec = profile.kecamatan || 'Kalikotes';
  const defaultKab = profile.kabupaten || 'Klaten';
  const defaultProv = profile.provinsi || 'Jawa Tengah';

  // Quick auto-populate defaults for demo/quick issuance
  const handleAutoFillDefaults = () => {
    if (selectedTipe === 'KEMATIAN') {
      setFields((prev) => ({
        ...prev,
        namaKepalaKeluarga: prev.namaKepalaKeluarga || selectedPenduduk?.nama || 'SURIPTO',
        noKartuKeluarga: prev.noKartuKeluarga || selectedPenduduk?.noKk || '3310231508820001',
        hariMeninggal: prev.hariMeninggal || 'Senin',
        tanggalMeninggal: prev.tanggalMeninggal || new Date().toISOString().split('T')[0],
        waktuMeninggal: prev.waktuMeninggal || '08:30 WIB',
        tempatMeninggal: prev.tempatMeninggal || 'Kediaman / Rumah Duka',
        sebabMeninggalKode: prev.sebabMeninggalKode || 1,
        yangMenerangkanKode: prev.yangMenerangkanKode || 2,
        anakKe: prev.anakKe || 1,
        ayahNama: prev.ayahNama || 'KASAN REJO',
        ayahNik: prev.ayahNik || '3310230101500001',
        ayahPekerjaan: prev.ayahPekerjaan || 'Petani / Pekebun',
        ibuNama: prev.ibuNama || 'SRI WAHYUNI',
        ibuNik: prev.ibuNik || '3310230202550001',
        ibuPekerjaan: prev.ibuPekerjaan || 'Mengurus Rumah Tangga',
        pelaporNama: prev.pelaporNama || 'AGUS SUPRIYANTO',
        pelaporNik: prev.pelaporNik || '3310231102850002',
        pelaporUmur: prev.pelaporUmur || 41,
        pelaporPekerjaan: prev.pelaporPekerjaan || 'Wiraswasta',
        pelaporHubungan: prev.pelaporHubungan || 'Anak Kandung',
        saksi1Nama: prev.saksi1Nama || 'BAMBANG SUTRISNO',
        saksi1Nik: prev.saksi1Nik || '3310231505780003',
        saksi1Umur: prev.saksi1Umur || 48,
        saksi1Pekerjaan: prev.saksi1Pekerjaan || 'Ketua RT / Wiraswasta',
        saksi2Nama: prev.saksi2Nama || 'JOKO PRASETYO',
        saksi2Nik: prev.saksi2Nik || '3310232008800004',
        saksi2Umur: prev.saksi2Umur || 46,
        saksi2Pekerjaan: prev.saksi2Pekerjaan || 'Perangkat Desa',
      }));
    } else {
      setFields((prev) => ({
        ...prev,
        namaKepalaKeluarga: prev.namaKepalaKeluarga || selectedPenduduk?.nama || 'ANDI WIJAYA',
        noKartuKeluarga: prev.noKartuKeluarga || selectedPenduduk?.noKk || '3310231508900002',
        namaBayi: prev.namaBayi || 'MUHAMMAD ARKAN AL-FATIH',
        jenisKelaminBayi: prev.jenisKelaminBayi || 'L',
        tempatDilahirkanKode: prev.tempatDilahirkanKode || 1,
        tempatKelahiranKota: prev.tempatKelahiranKota || defaultKab,
        hariLahir: prev.hariLahir || 'Rabu',
        tanggalLahirBayi: prev.tanggalLahirBayi || new Date().toISOString().split('T')[0],
        jamLahir: prev.jamLahir || '06:15 WIB',
        jenisKelahiranKode: prev.jenisKelahiranKode || 1,
        kelahiranKe: prev.kelahiranKe || 1,
        penolongKelahiranKode: prev.penolongKelahiranKode || 2,
        beratBayiKg: prev.beratBayiKg || '3.2',
        panjangBayiCm: prev.panjangBayiCm || 49,
        ibuNama: prev.ibuNama || 'SITI AMINAH',
        ibuNik: prev.ibuNik || '3310235003920001',
        ibuUmur: prev.ibuUmur || 34,
        ibuPekerjaan: prev.ibuPekerjaan || 'Mengurus Rumah Tangga',
        ibuKewarganegaraan: prev.ibuKewarganegaraan || 'WNI',
        ibuKebangsaan: prev.ibuKebangsaan || 'Indonesia',
        tglPencatatanPerkawinan: prev.tglPencatatanPerkawinan || '2020-04-12',
        ayahNama: prev.ayahNama || selectedPenduduk?.nama || 'ANDI WIJAYA',
        ayahNik: prev.ayahNik || selectedPenduduk?.nik || '3310231508900002',
        ayahUmur: prev.ayahUmur || 36,
        ayahPekerjaan: prev.ayahPekerjaan || 'Karyawan Swasta',
        ayahKewarganegaraan: prev.ayahKewarganegaraan || 'WNI',
        ayahKebangsaan: prev.ayahKebangsaan || 'Indonesia',
        pelaporNama: prev.pelaporNama || selectedPenduduk?.nama || 'ANDI WIJAYA',
        pelaporNik: prev.pelaporNik || selectedPenduduk?.nik || '3310231508900002',
        pelaporUmur: prev.pelaporUmur || 36,
        pelaporJenisKelamin: prev.pelaporJenisKelamin || 'L',
        pelaporPekerjaan: prev.pelaporPekerjaan || 'Karyawan Swasta',
        saksi1Nama: prev.saksi1Nama || 'BAMBANG SUTRISNO',
        saksi1Nik: prev.saksi1Nik || '3310231505780003',
        saksi1Umur: prev.saksi1Umur || 48,
        saksi1Pekerjaan: prev.saksi1Pekerjaan || 'Ketua RT',
        saksi2Nama: prev.saksi2Nama || 'JOKO PRASETYO',
        saksi2Nik: prev.saksi2Nik || '3310232008800004',
        saksi2Umur: prev.saksi2Umur || 46,
        saksi2Pekerjaan: prev.saksi2Pekerjaan || 'Perangkat Desa',
      }));
    }
  };

  return (
    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
      {/* Header Form Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          {selectedTipe === 'KEMATIAN' ? (
            <Skull className="w-5 h-5 text-rose-600" />
          ) : (
            <Baby className="w-5 h-5 text-emerald-600" />
          )}
          <div>
            <h4 className="text-xs font-bold text-slate-800">
              {selectedTipe === 'KEMATIAN'
                ? 'Kelengkapan Formulir Kematian (F-2.29 Ukuran F4)'
                : 'Kelengkapan Formulir Kelahiran (F-2.01 Ukuran F4)'}
            </h4>
            <p className="text-[11px] text-slate-500">
              Format standar resmi Disdukcapil/SIAK menggunakan kertas ukuran F4 (Folio).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAutoFillDefaults}
          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
          title="Isi cepat contoh data saksi & orang tua"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-600" />
          Isi Cepat Data Saksi & Default
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('UTAMA')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'UTAMA'
              ? 'bg-white text-blue-600 border-t border-x border-slate-200 -mb-px'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {selectedTipe === 'KEMATIAN' ? '1. Jenazah & Peristiwa' : '1. Data Bayi / Anak'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ORANGTUA')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'ORANGTUA'
              ? 'bg-white text-blue-600 border-t border-x border-slate-200 -mb-px'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          2. Data Ayah & Ibu
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('PELAPOR_SAKSI')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'PELAPOR_SAKSI'
              ? 'bg-white text-blue-600 border-t border-x border-slate-200 -mb-px'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          3. Pelapor & Saksi (1 & 2)
        </button>
      </div>

      {/* TAB CONTENT: UTAMA */}
      {activeTab === 'UTAMA' && (
        <div className="space-y-3 pt-1">
          {/* KK Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2.5 bg-white rounded-lg border border-slate-200">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Nama Kepala Keluarga
              </label>
              <input
                type="text"
                value={fields.namaKepalaKeluarga || selectedPenduduk?.nama || ''}
                onChange={(e) => setFields({ ...fields, namaKepalaKeluarga: e.target.value })}
                placeholder="Nama Kepala Keluarga"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg uppercase"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                No. Kartu Keluarga (KK)
              </label>
              <input
                type="text"
                value={fields.noKartuKeluarga || selectedPenduduk?.noKk || ''}
                onChange={(e) => setFields({ ...fields, noKartuKeluarga: e.target.value })}
                placeholder="16 Digit No. KK"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>
          </div>

          {selectedTipe === 'KEMATIAN' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Hari Meninggal</label>
                <input
                  type="text"
                  placeholder="Senin"
                  value={fields.hariMeninggal || ''}
                  onChange={(e) => setFields({ ...fields, hariMeninggal: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Tanggal Meninggal *</label>
                <input
                  type="date"
                  value={fields.tanggalMeninggal || ''}
                  onChange={(e) => setFields({ ...fields, tanggalMeninggal: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Pukul / Waktu</label>
                <input
                  type="text"
                  placeholder="08:30 WIB"
                  value={fields.waktuMeninggal || ''}
                  onChange={(e) => setFields({ ...fields, waktuMeninggal: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Tempat Meninggal</label>
                <input
                  type="text"
                  placeholder="Kediaman / RS Dr. Soeradji Klaten"
                  value={fields.tempatMeninggal || ''}
                  onChange={(e) => setFields({ ...fields, tempatMeninggal: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Sebab Kematian (Kode)</label>
                <select
                  value={fields.sebabMeninggalKode || 1}
                  onChange={(e) => setFields({ ...fields, sebabMeninggalKode: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                >
                  <option value={1}>1. Sakit biasa / tua</option>
                  <option value={2}>2. Wabah Penyakit</option>
                  <option value={3}>3. Kecelakaan</option>
                  <option value={4}>4. Kriminalitas</option>
                  <option value={5}>5. Bunuh Diri</option>
                  <option value={6}>6. Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Yang Menerangkan (Kode)</label>
                <select
                  value={fields.yangMenerangkanKode || 1}
                  onChange={(e) => setFields({ ...fields, yangMenerangkanKode: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                >
                  <option value={1}>1. Dokter</option>
                  <option value={2}>2. Bidan / Perawat</option>
                  <option value={3}>3. Tenaga Kesehatan</option>
                  <option value={4}>4. Kepolisian</option>
                  <option value={5}>5. Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Anak Ke-</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={fields.anakKe || 1}
                  onChange={(e) => setFields({ ...fields, anakKe: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          ) : (
            /* KELAHIRAN: DETAIL BAYI */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-600 mb-1">Nama Lengkap Bayi *</label>
                <input
                  type="text"
                  placeholder="Nama lengkap bayi baru lahir..."
                  value={fields.namaBayi || ''}
                  onChange={(e) => setFields({ ...fields, namaBayi: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg uppercase font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Jenis Kelamin Bayi</label>
                <select
                  value={fields.jenisKelaminBayi || 'L'}
                  onChange={(e) => setFields({ ...fields, jenisKelaminBayi: e.target.value as 'L' | 'P' })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                >
                  <option value="L">1. Laki-Laki</option>
                  <option value="P">2. Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Tempat Dilahirkan (Kode)</label>
                <select
                  value={fields.tempatDilahirkanKode || 1}
                  onChange={(e) => setFields({ ...fields, tempatDilahirkanKode: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                >
                  <option value={1}>1. RS / RB</option>
                  <option value={2}>2. Puskesmas</option>
                  <option value={3}>3. Polindes</option>
                  <option value={4}>4. Rumah</option>
                  <option value={5}>5. Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Kota / Tempat Kelahiran</label>
                <input
                  type="text"
                  placeholder={defaultKab}
                  value={fields.tempatKelahiranKota || ''}
                  onChange={(e) => setFields({ ...fields, tempatKelahiranKota: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Hari Lahir</label>
                <input
                  type="text"
                  placeholder="Senin"
                  value={fields.hariLahir || ''}
                  onChange={(e) => setFields({ ...fields, hariLahir: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Tanggal Lahir Bayi *</label>
                <input
                  type="date"
                  value={fields.tanggalLahirBayi || ''}
                  onChange={(e) => setFields({ ...fields, tanggalLahirBayi: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Jam / Pukul Lahir</label>
                <input
                  type="text"
                  placeholder="06:15 WIB"
                  value={fields.jamLahir || ''}
                  onChange={(e) => setFields({ ...fields, jamLahir: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Jenis Kelahiran (Kode)</label>
                <select
                  value={fields.jenisKelahiranKode || 1}
                  onChange={(e) => setFields({ ...fields, jenisKelahiranKode: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                >
                  <option value={1}>1. Tunggal</option>
                  <option value={2}>2. Kembar 2</option>
                  <option value={3}>3. Kembar 3</option>
                  <option value={4}>4. Kembar 4</option>
                  <option value={5}>5. Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Kelahiran Ke-</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={fields.kelahiranKe || 1}
                  onChange={(e) => setFields({ ...fields, kelahiranKe: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Penolong Kelahiran</label>
                <select
                  value={fields.penolongKelahiranKode || 1}
                  onChange={(e) => setFields({ ...fields, penolongKelahiranKode: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                >
                  <option value={1}>1. Dokter</option>
                  <option value={2}>2. Bidan / Perawat</option>
                  <option value={3}>3. Dukun</option>
                  <option value={4}>4. Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Berat Bayi (Kg)</label>
                <input
                  type="text"
                  placeholder="3.2"
                  value={fields.beratBayiKg || ''}
                  onChange={(e) => setFields({ ...fields, beratBayiKg: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Panjang Bayi (Cm)</label>
                <input
                  type="number"
                  placeholder="49"
                  value={fields.panjangBayiCm || ''}
                  onChange={(e) => setFields({ ...fields, panjangBayiCm: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: DATA AYAH & IBU */}
      {activeTab === 'ORANGTUA' && (
        <div className="space-y-4 pt-1">
          {/* AYAH */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Data Ayah Kandung</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">NIK Ayah</label>
                <input
                  type="text"
                  value={fields.ayahNik || ''}
                  onChange={(e) => setFields({ ...fields, ayahNik: e.target.value })}
                  placeholder="16 Digit NIK Ayah"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-600 mb-1">Nama Lengkap Ayah</label>
                <input
                  type="text"
                  value={fields.ayahNama || ''}
                  onChange={(e) => setFields({ ...fields, ayahNama: e.target.value })}
                  placeholder="Nama Lengkap Ayah"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg uppercase"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Tanggal Lahir Ayah</label>
                <input
                  type="date"
                  value={fields.ayahTanggalLahir || ''}
                  onChange={(e) => setFields({ ...fields, ayahTanggalLahir: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Pekerjaan Ayah</label>
                <input
                  type="text"
                  value={fields.ayahPekerjaan || ''}
                  onChange={(e) => setFields({ ...fields, ayahPekerjaan: e.target.value })}
                  placeholder="Pekerjaan Ayah"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Kewarganegaraan</label>
                <select
                  value={fields.ayahKewarganegaraan || 'WNI'}
                  onChange={(e) => setFields({ ...fields, ayahKewarganegaraan: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="WNI">1. WNI</option>
                  <option value="WNA">2. WNA</option>
                </select>
              </div>
            </div>
          </div>

          {/* IBU */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">
              <UserCheck className="w-4 h-4 text-pink-600" />
              <span>Data Ibu Kandung</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">NIK Ibu</label>
                <input
                  type="text"
                  value={fields.ibuNik || ''}
                  onChange={(e) => setFields({ ...fields, ibuNik: e.target.value })}
                  placeholder="16 Digit NIK Ibu"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-slate-600 mb-1">Nama Lengkap Ibu</label>
                <input
                  type="text"
                  value={fields.ibuNama || ''}
                  onChange={(e) => setFields({ ...fields, ibuNama: e.target.value })}
                  placeholder="Nama Lengkap Ibu"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg uppercase"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Tanggal Lahir Ibu</label>
                <input
                  type="date"
                  value={fields.ibuTanggalLahir || ''}
                  onChange={(e) => setFields({ ...fields, ibuTanggalLahir: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Pekerjaan Ibu</label>
                <input
                  type="text"
                  value={fields.ibuPekerjaan || ''}
                  onChange={(e) => setFields({ ...fields, ibuPekerjaan: e.target.value })}
                  placeholder="Mengurus Rumah Tangga"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              {selectedTipe === 'KELAHIRAN' && (
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Tgl Pencatatan Perkawinan</label>
                  <input
                    type="date"
                    value={fields.tglPencatatanPerkawinan || ''}
                    onChange={(e) => setFields({ ...fields, tglPencatatanPerkawinan: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PELAPOR & SAKSI */}
      {activeTab === 'PELAPOR_SAKSI' && (
        <div className="space-y-4 pt-1">
          {/* PELAPOR */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Data Pelapor</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">NIK Pelapor</label>
                <input
                  type="text"
                  value={fields.pelaporNik || ''}
                  onChange={(e) => setFields({ ...fields, pelaporNik: e.target.value })}
                  placeholder="16 Digit NIK Pelapor"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Nama Lengkap Pelapor</label>
                <input
                  type="text"
                  value={fields.pelaporNama || ''}
                  onChange={(e) => setFields({ ...fields, pelaporNama: e.target.value })}
                  placeholder="Nama Lengkap Pelapor"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg uppercase"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Umur Pelapor (Tahun)</label>
                <input
                  type="number"
                  value={fields.pelaporUmur || 35}
                  onChange={(e) => setFields({ ...fields, pelaporUmur: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Pekerjaan Pelapor</label>
                <input
                  type="text"
                  value={fields.pelaporPekerjaan || ''}
                  onChange={(e) => setFields({ ...fields, pelaporPekerjaan: e.target.value })}
                  placeholder="Wiraswasta / Karyawan"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* SAKSI 1 */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Data Saksi 1</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">NIK Saksi 1</label>
                <input
                  type="text"
                  value={fields.saksi1Nik || ''}
                  onChange={(e) => setFields({ ...fields, saksi1Nik: e.target.value })}
                  placeholder="16 Digit NIK Saksi 1"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Nama Saksi 1</label>
                <input
                  type="text"
                  value={fields.saksi1Nama || ''}
                  onChange={(e) => setFields({ ...fields, saksi1Nama: e.target.value })}
                  placeholder="Nama Lengkap Saksi 1"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg uppercase"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Umur (Tahun)</label>
                <input
                  type="number"
                  value={fields.saksi1Umur || 45}
                  onChange={(e) => setFields({ ...fields, saksi1Umur: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Pekerjaan</label>
                <input
                  type="text"
                  value={fields.saksi1Pekerjaan || ''}
                  onChange={(e) => setFields({ ...fields, saksi1Pekerjaan: e.target.value })}
                  placeholder="Ketua RT / Wiraswasta"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* SAKSI 2 */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Data Saksi 2</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">NIK Saksi 2</label>
                <input
                  type="text"
                  value={fields.saksi2Nik || ''}
                  onChange={(e) => setFields({ ...fields, saksi2Nik: e.target.value })}
                  placeholder="16 Digit NIK Saksi 2"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Nama Saksi 2</label>
                <input
                  type="text"
                  value={fields.saksi2Nama || ''}
                  onChange={(e) => setFields({ ...fields, saksi2Nama: e.target.value })}
                  placeholder="Nama Lengkap Saksi 2"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg uppercase"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Umur (Tahun)</label>
                <input
                  type="number"
                  value={fields.saksi2Umur || 40}
                  onChange={(e) => setFields({ ...fields, saksi2Umur: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Pekerjaan</label>
                <input
                  type="text"
                  value={fields.saksi2Pekerjaan || ''}
                  onChange={(e) => setFields({ ...fields, saksi2Pekerjaan: e.target.value })}
                  placeholder="Perangkat Desa"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
