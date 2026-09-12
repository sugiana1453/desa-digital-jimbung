import React from 'react';
import { DesaProfile, Penduduk, SuratFieldValues } from '../types';
import { formatTanggalIndo, NAMA_HARI } from '../utils/formatters';

interface SuratKematianF4SheetProps {
  profile: DesaProfile;
  selectedPenduduk: Penduduk | null;
  nomorSurat: string;
  tanggalSurat: string;
  penandatangan: string;
  fields: SuratFieldValues;
}

function parseDateSegments(dateStr?: string) {
  if (!dateStr) return { day: '-', date: '  ', month: '  ', year: '    ', age: '-' };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { day: '-', date: '  ', month: '  ', year: '    ', age: '-' };
  
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) {
    age--;
  }

  return {
    day: NAMA_HARI[d.getDay()] || '-',
    date: String(d.getDate()).padStart(2, '0'),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    year: String(d.getFullYear()),
    age: String(Math.max(0, age)),
  };
}

export const SuratKematianF4Sheet: React.FC<SuratKematianF4SheetProps> = ({
  profile,
  selectedPenduduk,
  nomorSurat,
  tanggalSurat,
  penandatangan,
  fields,
}) => {
  // Jenazah parsing
  const jenazahBirth = parseDateSegments(selectedPenduduk?.tanggalLahir);
  const jenazahDeath = parseDateSegments(fields.tanggalMeninggal);

  // Orang tua & Saksi parsing
  const ayahBirth = parseDateSegments(fields.ayahTanggalLahir);
  const ibuBirth = parseDateSegments(fields.ibuTanggalLahir);
  const pelaporBirth = parseDateSegments(fields.pelaporTanggalLahir);
  const saksi1Birth = parseDateSegments(fields.saksi1TanggalLahir);
  const saksi2Birth = parseDateSegments(fields.saksi2TanggalLahir);

  // Numeric option codes based on Disdukcapil standard
  const jenazahGenderCode = selectedPenduduk?.jenisKelamin === 'L' ? '1' : selectedPenduduk?.jenisKelamin === 'P' ? '2' : '1';
  
  const agamaMap: Record<string, string> = {
    Islam: '1',
    Kristen: '2',
    Katolik: '3',
    Hindu: '4',
    Budha: '5',
    Konghucu: '6',
  };
  const jenazahAgamaCode = agamaMap[selectedPenduduk?.agama || ''] || '1';

  const sebabCode = fields.sebabMeninggalKode ? String(fields.sebabMeninggalKode) : '1';
  const yangMenerangkanCode = fields.yangMenerangkanKode ? String(fields.yangMenerangkanKode) : '1';
  const anakKeCode = fields.anakKe ? String(fields.anakKe) : '1';

  // Addresses fallback to current village
  const defaultDesa = profile.namaDesa || 'Jimbung';
  const defaultKec = profile.kecamatan || 'Kalikotes';
  const defaultKab = profile.kabupaten || 'Klaten';
  const defaultProv = profile.provinsi || 'Jawa Tengah';

  return (
    <div
      className="printable-sheet sheet-f4 bg-white text-black mx-auto shadow-xl print:shadow-none print:m-0 print:border-none select-text"
      style={{
        width: '215mm',
        maxWidth: '215mm',
        minHeight: '315mm',
        padding: '5mm 8mm 4mm 8mm',
        boxSizing: 'border-box',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '7pt',
        lineHeight: 1.15,
        color: '#000000',
        ['--letter-font-size' as any]: '7pt',
        ['--letter-line-height' as any]: '1.15',
        ['--letter-padding' as any]: '5mm 8mm 4mm 8mm',
      }}
      id="surat-kematian-f4-sheet"
    >
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 0mm !important;
          }
        }
      `}</style>

      {/* 1. TOP HEADER (PEMERINTAH DESA & KODE WILAYAH + KODE F-2.29) */}
      <div className="flex justify-between items-start pb-1 mb-1 border-b border-black">
        <div className="space-y-0.5 text-[7.2pt] leading-tight">
          <div className="grid grid-cols-[130px_8px_1fr] items-center">
            <span>Pemerintah Desa/Kelurahan</span>
            <span>:</span>
            <span className="font-bold uppercase tracking-wide">{profile.namaDesa || 'JIMBUNG'}</span>
          </div>
          <div className="grid grid-cols-[130px_8px_1fr] items-center">
            <span>Kecamatan</span>
            <span>:</span>
            <span className="font-bold uppercase tracking-wide">{profile.kecamatan || 'KALIKOTES'}</span>
          </div>
          <div className="grid grid-cols-[130px_8px_1fr] items-center">
            <span>Kabupaten/Kota</span>
            <span>:</span>
            <span className="font-bold uppercase tracking-wide">{profile.kabupaten || 'KLATEN'}</span>
          </div>
          <div className="grid grid-cols-[130px_8px_1fr] items-center pt-0.5">
            <span>Kode Wilayah</span>
            <span>:</span>
            <span className="border border-black px-1.5 py-0 font-mono font-bold tracking-widest inline-block text-[7.2pt] leading-tight">
              {profile.kodeWilayah || fields.kodeWilayah || '33.10.23.2001'}
            </span>
          </div>
        </div>

        <div className="text-right text-[7pt]">
          <div className="inline-block border border-black px-2 py-0 font-bold tracking-wider text-[8pt] mb-0.5">
            KODE. F-2.29
          </div>
          <div className="grid grid-cols-[auto_auto_auto] gap-x-1 text-left text-[7.5pt] leading-none">
            <span>Ket :</span>
            <span>Lembar 1</span>
            <span>: UPTD/Instansi Pelaksana</span>
            <span></span>
            <span>Lembar 2</span>
            <span>: Untuk Yang Bersangkutan</span>
            <span></span>
            <span>Lembar 3</span>
            <span>: Desa/Kelurahan</span>
            <span></span>
            <span>Lembar 4</span>
            <span>: Kecamatan</span>
          </div>
        </div>
      </div>

      {/* 2. TITLE & NOMOR SURAT RESMI */}
      <div className="text-center my-0.5">
        <h2 className="font-bold text-[10pt] tracking-wider uppercase leading-none">
          SURAT KETERANGAN KEMATIAN
        </h2>
        <p className="text-[7.5pt] font-semibold mt-0.5 font-mono leading-none">
          No. : {nomorSurat}
        </p>
      </div>

      {/* 3. SUB HEADER: NAMA KEPALA KELUARGA & NO. KARTU KELUARGA */}
      <div className="grid grid-cols-2 gap-2 mb-[1px] text-[7.2pt] leading-tight">
        <div className="grid grid-cols-[115px_8px_1fr] items-center">
          <span>Nama Kepala Keluarga</span>
          <span>:</span>
          <div className="border border-black px-1 py-0 font-medium truncate uppercase min-h-[15px] leading-tight bg-white">
            {fields.namaKepalaKeluarga || selectedPenduduk?.nama || '-'}
          </div>
        </div>
        <div className="grid grid-cols-[100px_8px_1fr] items-center">
          <span>No. Kartu Keluarga</span>
          <span>:</span>
          <div className="border border-black px-1 py-0 font-mono font-bold tracking-wider truncate min-h-[15px] leading-tight bg-white">
            {fields.noKartuKeluarga || selectedPenduduk?.noKk || '-'}
          </div>
        </div>
      </div>

      {/* 4. SECTION: JENAZAH */}
      <div className="border border-black mb-1">
        <div className="font-bold bg-slate-100 px-1.5 py-0.5 border-b border-black text-[7.2pt] leading-tight">
          JENAZAH
        </div>
        <div className="p-1 px-1.5 space-y-[2px] text-[6.9pt] leading-tight">
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>1. &nbsp; NIK</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 font-mono font-bold tracking-wider max-w-xs min-h-[15px] leading-tight">
              {selectedPenduduk?.nik || '-'}
            </div>
          </div>

          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>2. &nbsp; Nama</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 font-bold uppercase truncate min-h-[15px] leading-tight">
              {selectedPenduduk?.nama || '-'}
            </div>
          </div>

          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>3. &nbsp; Jenis Kelamin</span>
            <span>:</span>
            <div className="flex items-center space-x-1.5">
              <span className="border border-black px-1 py-0 font-bold min-w-[13px] text-center leading-tight">
                {jenazahGenderCode}
              </span>
              <span>1. Laki-Laki &nbsp;&nbsp; 2. Perempuan</span>
            </div>
          </div>

          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>4. &nbsp; Tanggal Lahir / Umur</span>
            <span>:</span>
            <div className="flex items-center space-x-1">
              <span>Tgl</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[18px] text-center font-bold leading-tight">{jenazahBirth.date}</span>
              <span>Bln</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[18px] text-center font-bold leading-tight">{jenazahBirth.month}</span>
              <span>Thn</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[28px] text-center font-bold leading-tight">{jenazahBirth.year}</span>
              <span className="ml-1">Umur</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[20px] text-center font-bold leading-tight">{jenazahBirth.age}</span>
            </div>
          </div>

          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>5. &nbsp; Tempat Lahir</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 max-w-sm truncate min-h-[15px] leading-tight">
              {selectedPenduduk?.tempatLahir || '-'}
            </div>
          </div>

          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>6. &nbsp; Agama</span>
            <span>:</span>
            <div className="flex items-center space-x-1 flex-wrap">
              <span className="border border-black px-1 py-0 font-bold min-w-[13px] text-center leading-tight mr-1">
                {jenazahAgamaCode}
              </span>
              <span>1. Islam &nbsp; 2. Kristen &nbsp; 3. Katolik &nbsp; 4. Hindu &nbsp; 5. Budha &nbsp; 6. Konghucu</span>
            </div>
          </div>

          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>7. &nbsp; Pekerjaan</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 max-w-md truncate min-h-[15px] leading-tight">
              {selectedPenduduk?.pekerjaan || '-'}
            </div>
          </div>

          <div className="grid grid-cols-[125px_8px_1fr] items-start">
            <span>8. &nbsp; Alamat</span>
            <span>:</span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0 w-full">
              <div className="grid grid-cols-[85px_5px_1fr] items-center">
                <span>a. Desa/Kelurahan</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{selectedPenduduk?.alamat || defaultDesa}</div>
              </div>
              <div className="grid grid-cols-[75px_5px_1fr] items-center">
                <span>c. Kab/Kota</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{defaultKab}</div>
              </div>
              <div className="grid grid-cols-[85px_5px_1fr] items-center">
                <span>b. Kecamatan</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{defaultKec}</div>
              </div>
              <div className="grid grid-cols-[75px_5px_1fr] items-center">
                <span>d. Provinsi</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{defaultProv}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>9. &nbsp; Anak Ke</span>
            <span>:</span>
            <div className="flex items-center space-x-1">
              <span className="border border-black px-1 py-0 font-bold min-w-[13px] text-center leading-tight">
                {anakKeCode}
              </span>
              <span>1. 2. 3. 4. {fields.anakKe ? `(Ke-${fields.anakKe})` : '...............'}</span>
            </div>
          </div>

          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>10. Tanggal Kematian</span>
            <span>:</span>
            <div className="flex items-center space-x-1">
              <span>Tgl</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[18px] text-center font-bold leading-tight">{jenazahDeath.date}</span>
              <span>Bln</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[18px] text-center font-bold leading-tight">{jenazahDeath.month}</span>
              <span>Thn</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[28px] text-center font-bold leading-tight">{jenazahDeath.year}</span>
            </div>
          </div>

          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>11. Pukul</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 font-mono max-w-[70px] text-center font-bold min-h-[15px] leading-tight">
              {fields.waktuMeninggal || '00:00'}
            </div>
          </div>

          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>12. Sebab Kematian</span>
            <span>:</span>
            <div className="flex items-center space-x-1 flex-wrap">
              <span className="border border-black px-1 py-0 font-bold min-w-[13px] text-center leading-tight mr-1">
                {sebabCode}
              </span>
              <span>1. Sakit biasa/tua &nbsp; 2. Wabah &nbsp; 3. Kecelakaan &nbsp; 4. Kriminal &nbsp; 5. Bunuh Diri &nbsp; 6. Lainnya</span>
            </div>
          </div>

          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>13. Tempat Kematian</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 max-w-md truncate min-h-[15px] leading-tight">
              {fields.tempatMeninggal || 'Kediaman / Rumah Duka'}
            </div>
          </div>

          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>14. Yang Menerangkan</span>
            <span>:</span>
            <div className="flex items-center space-x-1 flex-wrap">
              <span className="border border-black px-1 py-0 font-bold min-w-[13px] text-center leading-tight mr-1">
                {yangMenerangkanCode}
              </span>
              <span>1. Dokter &nbsp; 2. Bidan/Perawat &nbsp; 3. Tenaga Kes. &nbsp; 4. Kepolisian &nbsp; 5. Lainnya</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. SECTION: AYAH */}
      <div className="border border-black mb-1">
        <div className="font-bold bg-slate-100 px-1.5 py-0.5 border-b border-black text-[7.2pt] leading-tight">
          AYAH
        </div>
        <div className="p-1 px-1.5 space-y-[2px] text-[6.9pt] leading-tight">
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>1. &nbsp; NIK</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 font-mono font-bold tracking-wider max-w-xs truncate min-h-[15px] leading-tight">
              {fields.ayahNik || '-'}
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>2. &nbsp; Nama Lengkap</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 font-bold uppercase truncate min-h-[15px] leading-tight">
              {fields.ayahNama || '-'}
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>3. &nbsp; Tanggal Lahir / Umur</span>
            <span>:</span>
            <div className="flex items-center space-x-1">
              <span>Tgl</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[18px] text-center font-bold leading-tight">{ayahBirth.date}</span>
              <span>Bln</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[18px] text-center font-bold leading-tight">{ayahBirth.month}</span>
              <span>Thn</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[28px] text-center font-bold leading-tight">{ayahBirth.year}</span>
              <span className="ml-1">Umur</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[20px] text-center font-bold leading-tight">{ayahBirth.age}</span>
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>4. &nbsp; Pekerjaan</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 max-w-md truncate min-h-[15px] leading-tight">
              {fields.ayahPekerjaan || '-'}
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-start">
            <span>5. &nbsp; Alamat</span>
            <span>:</span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0 w-full">
              <div className="grid grid-cols-[85px_5px_1fr] items-center">
                <span>a. Desa/Kelurahan</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.ayahAlamatDesa || defaultDesa}</div>
              </div>
              <div className="grid grid-cols-[75px_5px_1fr] items-center">
                <span>c. Kab/Kota</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.ayahAlamatKabupaten || defaultKab}</div>
              </div>
              <div className="grid grid-cols-[85px_5px_1fr] items-center">
                <span>b. Kecamatan</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.ayahAlamatKecamatan || defaultKec}</div>
              </div>
              <div className="grid grid-cols-[75px_5px_1fr] items-center">
                <span>d. Provinsi</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.ayahAlamatProvinsi || defaultProv}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. SECTION: IBU */}
      <div className="border border-black mb-1">
        <div className="font-bold bg-slate-100 px-1.5 py-0.5 border-b border-black text-[7.2pt] leading-tight">
          IBU
        </div>
        <div className="p-1 px-1.5 space-y-[2px] text-[6.9pt] leading-tight">
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>1. &nbsp; NIK</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 font-mono font-bold tracking-wider max-w-xs truncate min-h-[15px] leading-tight">
              {fields.ibuNik || '-'}
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>2. &nbsp; Nama Lengkap</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 font-bold uppercase truncate min-h-[15px] leading-tight">
              {fields.ibuNama || '-'}
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>3. &nbsp; Tanggal Lahir / Umur</span>
            <span>:</span>
            <div className="flex items-center space-x-1">
              <span>Tgl</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[18px] text-center font-bold leading-tight">{ibuBirth.date}</span>
              <span>Bln</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[18px] text-center font-bold leading-tight">{ibuBirth.month}</span>
              <span>Thn</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[28px] text-center font-bold leading-tight">{ibuBirth.year}</span>
              <span className="ml-1">Umur</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[20px] text-center font-bold leading-tight">{ibuBirth.age}</span>
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>4. &nbsp; Pekerjaan</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 max-w-md truncate min-h-[15px] leading-tight">
              {fields.ibuPekerjaan || '-'}
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-start">
            <span>5. &nbsp; Alamat</span>
            <span>:</span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0 w-full">
              <div className="grid grid-cols-[85px_5px_1fr] items-center">
                <span>a. Desa/Kelurahan</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.ibuAlamatDesa || defaultDesa}</div>
              </div>
              <div className="grid grid-cols-[75px_5px_1fr] items-center">
                <span>c. Kab/Kota</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.ibuAlamatKabupaten || defaultKab}</div>
              </div>
              <div className="grid grid-cols-[85px_5px_1fr] items-center">
                <span>b. Kecamatan</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.ibuAlamatKecamatan || defaultKec}</div>
              </div>
              <div className="grid grid-cols-[75px_5px_1fr] items-center">
                <span>d. Provinsi</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.ibuAlamatProvinsi || defaultProv}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7. SECTION: PELAPOR */}
      <div className="border border-black mb-1">
        <div className="font-bold bg-slate-100 px-1.5 py-0.5 border-b border-black text-[7.2pt] leading-tight">
          PELAPOR
        </div>
        <div className="p-1 px-1.5 space-y-[2px] text-[6.9pt] leading-tight">
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>1. &nbsp; NIK</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 font-mono font-bold tracking-wider max-w-xs truncate min-h-[15px] leading-tight">
              {fields.pelaporNik || '-'}
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>2. &nbsp; Nama Lengkap</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 font-bold uppercase truncate min-h-[15px] leading-tight">
              {fields.pelaporNama || '-'}
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>3. &nbsp; Tanggal Lahir / Umur</span>
            <span>:</span>
            <div className="flex items-center space-x-1">
              <span>Tgl</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[18px] text-center font-bold leading-tight">{pelaporBirth.date}</span>
              <span>Bln</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[18px] text-center font-bold leading-tight">{pelaporBirth.month}</span>
              <span>Thn</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[28px] text-center font-bold leading-tight">{pelaporBirth.year}</span>
              <span className="ml-1">Umur</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[20px] text-center font-bold leading-tight">{fields.pelaporUmur || pelaporBirth.age}</span>
              <span>Thn</span>
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>4. &nbsp; Pekerjaan</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 max-w-md truncate min-h-[15px] leading-tight">
              {fields.pelaporPekerjaan || '-'}
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-start">
            <span>5. &nbsp; Alamat</span>
            <span>:</span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0 w-full">
              <div className="grid grid-cols-[85px_5px_1fr] items-center">
                <span>a. Desa/Kelurahan</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.pelaporAlamatDesa || defaultDesa}</div>
              </div>
              <div className="grid grid-cols-[75px_5px_1fr] items-center">
                <span>c. Kab/Kota</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.pelaporAlamatKabupaten || defaultKab}</div>
              </div>
              <div className="grid grid-cols-[85px_5px_1fr] items-center">
                <span>b. Kecamatan</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.pelaporAlamatKecamatan || defaultKec}</div>
              </div>
              <div className="grid grid-cols-[75px_5px_1fr] items-center">
                <span>d. Provinsi</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.pelaporAlamatProvinsi || defaultProv}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8. SECTION: SAKSI 1 */}
      <div className="border border-black mb-1">
        <div className="font-bold bg-slate-100 px-1.5 py-0.5 border-b border-black text-[7.2pt] leading-tight">
          SAKSI 1
        </div>
        <div className="p-1 px-1.5 space-y-[2px] text-[6.9pt] leading-tight">
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>1. &nbsp; NIK</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 font-mono font-bold tracking-wider max-w-xs truncate min-h-[15px] leading-tight">
              {fields.saksi1Nik || '-'}
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>2. &nbsp; Nama Lengkap</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 font-bold uppercase truncate min-h-[15px] leading-tight">
              {fields.saksi1Nama || '-'}
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>3. &nbsp; Tanggal Lahir / Umur</span>
            <span>:</span>
            <div className="flex items-center space-x-1">
              <span>Tgl</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[18px] text-center font-bold leading-tight">{saksi1Birth.date}</span>
              <span>Bln</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[18px] text-center font-bold leading-tight">{saksi1Birth.month}</span>
              <span>Thn</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[28px] text-center font-bold leading-tight">{saksi1Birth.year}</span>
              <span className="ml-1">Umur</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[20px] text-center font-bold leading-tight">{fields.saksi1Umur || saksi1Birth.age}</span>
              <span>Thn</span>
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>4. &nbsp; Pekerjaan</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 max-w-md truncate min-h-[15px] leading-tight">
              {fields.saksi1Pekerjaan || '-'}
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-start">
            <span>5. &nbsp; Alamat</span>
            <span>:</span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0 w-full">
              <div className="grid grid-cols-[85px_5px_1fr] items-center">
                <span>a. Desa/Kelurahan</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.saksi1AlamatDesa || defaultDesa}</div>
              </div>
              <div className="grid grid-cols-[75px_5px_1fr] items-center">
                <span>c. Kab/Kota</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.saksi1AlamatKabupaten || defaultKab}</div>
              </div>
              <div className="grid grid-cols-[85px_5px_1fr] items-center">
                <span>b. Kecamatan</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.saksi1AlamatKecamatan || defaultKec}</div>
              </div>
              <div className="grid grid-cols-[75px_5px_1fr] items-center">
                <span>d. Provinsi</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.saksi1AlamatProvinsi || defaultProv}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 9. SECTION: SAKSI 2 */}
      <div className="border border-black mb-1">
        <div className="font-bold bg-slate-100 px-1.5 py-0.5 border-b border-black text-[7.2pt] leading-tight">
          SAKSI 2
        </div>
        <div className="p-1 px-1.5 space-y-[2px] text-[6.9pt] leading-tight">
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>1. &nbsp; NIK</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 font-mono font-bold tracking-wider max-w-xs truncate min-h-[15px] leading-tight">
              {fields.saksi2Nik || '-'}
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>2. &nbsp; Nama Lengkap</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 font-bold uppercase truncate min-h-[15px] leading-tight">
              {fields.saksi2Nama || '-'}
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>3. &nbsp; Tanggal Lahir / Umur</span>
            <span>:</span>
            <div className="flex items-center space-x-1">
              <span>Tgl</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[18px] text-center font-bold leading-tight">{saksi2Birth.date}</span>
              <span>Bln</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[18px] text-center font-bold leading-tight">{saksi2Birth.month}</span>
              <span>Thn</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[28px] text-center font-bold leading-tight">{saksi2Birth.year}</span>
              <span className="ml-1">Umur</span>
              <span className="border border-black px-1 py-0 font-mono min-w-[20px] text-center font-bold leading-tight">{fields.saksi2Umur || saksi2Birth.age}</span>
              <span>Thn</span>
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-center">
            <span>4. &nbsp; Pekerjaan</span>
            <span>:</span>
            <div className="border border-black px-1 py-0 max-w-md truncate min-h-[15px] leading-tight">
              {fields.saksi2Pekerjaan || '-'}
            </div>
          </div>
          <div className="grid grid-cols-[125px_8px_1fr] items-start">
            <span>5. &nbsp; Alamat</span>
            <span>:</span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0 w-full">
              <div className="grid grid-cols-[85px_5px_1fr] items-center">
                <span>a. Desa/Kelurahan</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.saksi2AlamatDesa || defaultDesa}</div>
              </div>
              <div className="grid grid-cols-[75px_5px_1fr] items-center">
                <span>c. Kab/Kota</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.saksi2AlamatKabupaten || defaultKab}</div>
              </div>
              <div className="grid grid-cols-[85px_5px_1fr] items-center">
                <span>b. Kecamatan</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.saksi2AlamatKecamatan || defaultKec}</div>
              </div>
              <div className="grid grid-cols-[75px_5px_1fr] items-center">
                <span>d. Provinsi</span>
                <span>:</span>
                <div className="border border-black px-1 py-0 truncate min-h-[15px] leading-tight">{fields.saksi2AlamatProvinsi || defaultProv}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 10. SIGNATURE SECTION (TWO COLUMNS: MENGETAHUI & PELAPOR) */}
      <div className="grid grid-cols-2 gap-6 pt-2 text-[7.2pt] leading-tight">
        {/* Left: Mengetahui Pejabat Desa */}
        <div className="text-center space-y-0">
          <p className="font-semibold">Mengetahui :</p>
          <p className="font-semibold">
            {penandatangan === 'Kepala Desa'
              ? `Kepala Desa ${profile.namaDesa || 'Jimbung'}`
              : penandatangan === 'An. Kepala Desa'
              ? `a.n. Kepala Desa ${profile.namaDesa || 'Jimbung'}, Sekdes`
              : `Sekretaris Desa ${profile.namaDesa || 'Jimbung'}`}
          </p>
          <div className="h-11 flex items-center justify-center">
            {/* Bersih untuk tanda tangan basah */}
          </div>
          <p className="font-bold underline uppercase">
            {penandatangan === 'Kepala Desa' ? profile.namaKades : profile.namaSekdes}
          </p>
          <p className="text-[6.8pt] font-mono leading-none">
            NIP. {penandatangan === 'Kepala Desa' ? (profile.nipKades || '-') : (profile.nipSekdes || '-')}
          </p>
        </div>

        {/* Right: Pelapor */}
        <div className="text-center space-y-0">
          <p>
            {profile.namaDesa || 'Jimbung'}, {formatTanggalIndo(tanggalSurat)}
          </p>
          <p className="font-semibold">Pelapor :</p>
          <div className="h-11 flex items-center justify-center">
            {/* Bersih untuk tanda tangan basah */}
          </div>
          <p className="font-bold underline uppercase">
            {fields.pelaporNama || '(                                       )'}
          </p>
        </div>
      </div>
    </div>
  );
};
