import React, { useState } from 'react';
import {
  Send,
  Printer,
  Check,
  RotateCcw,
  Sparkles,
  FileText,
  Building2,
  Calendar,
  Hash,
  UserCheck,
  ChevronDown,
  ArrowRight,
  Eye,
  Info,
} from 'lucide-react';
import { useDesa } from '../context/DesaContext';
import { SuratKeluar } from '../types';

interface BuatSuratKeluarViewProps {
  onSuccessNavigateToAgenda?: () => void;
}

const TEMPLATES = [
  {
    id: 'undangan',
    nama: 'Undangan Rapat / Musyawarah Desa',
    klasifikasi: '005',
    sifat: 'Penting' as const,
    lampiran: '-',
    perihal: 'Undangan Musyawarah Perencanaan Pembangunan Desa (Musrenbangdes)',
    isi: `Dengan hormat,

Sehubungan dengan penyusunan Rencana Kerja Pemerintah Desa (RKPDes) Tahun Anggaran mendatang, bersama ini kami mengundang Bapak/Ibu untuk hadir pada:

Hari / Tanggal : Kamis, 18 September 2026
Waktu          : 09.00 WIB s/d Selesai
Tempat         : Aula Kantor Desa Sukamaju
Agenda         : Musyawarah Desa Penyusunan RKPDes dan Prioritas Usulan Dusun

Mengingat pentingnya agenda tersebut, kami mohon kehadiran Bapak/Ibu tepat pada waktunya. Demikian undangan ini kami sampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih.`,
  },
  {
    id: 'pemberitahuan',
    nama: 'Pemberitahuan Kerja Bakti Bersama',
    klasifikasi: '140',
    sifat: 'Biasa' as const,
    lampiran: '-',
    perihal: 'Pemberitahuan Kegiatan Gotong Royong & Kerja Bakti Lingkungan',
    isi: `Dengan hormat,

Dalam rangka menciptakan lingkungan desa yang bersih, sehat, dan mengantisipasi musim penghujan, Pemerintah Desa menghimbau seluruh warga untuk melaksanakan kerja bakti serentak pada:

Hari / Tanggal : Minggu, 14 September 2026
Waktu          : 07.30 WIB s/d Selesai
Titik Kumpul   : Lingkungan RT/RW masing-masing
Sasaran        : Pembersihan saluran air (drainase), pemangkasan dahan pohon, dan fasilitas umum

Dimohon kepada seluruh Ketua RW dan Ketua RT untuk mengkoordinasikan warga di lingkungannya masing-masing. Atas partisipasi aktif warga, kami ucapkan terima kasih.`,
  },
  {
    id: 'pengantar_dinas',
    nama: 'Surat Pengantar Berkas ke Kecamatan / Dinas',
    klasifikasi: '140',
    sifat: 'Penting' as const,
    lampiran: '1 (Satu) Berkas',
    perihal: 'Penyampaian Laporan Realisasi Penyerapan Dana Desa Triwulan II',
    isi: `Dengan hormat,

Bersama surat ini, kami Pemerintah Desa Sukamaju menyampaikan berkas Laporan Realisasi Penyerapan dan Pertanggungjawaban Dana Desa Triwulan II Tahun Anggaran 2026 untuk diperiksa dan diverifikasi lebih lanjut.

Adapun rincian laporan sebagaimana terlampir dalam satu berkas terpadu.

Demikian pengantar ini kami sampaikan, atas perhatian dan perkenan Bapak Camat, kami ucapkan terima kasih.`,
  },
];

export const BuatSuratKeluarView: React.FC<BuatSuratKeluarViewProps> = ({
  onSuccessNavigateToAgenda,
}) => {
  const { profile, suratKeluar, addSuratKeluar } = useDesa();

  // Next agenda number recommendation
  const nextSeq = suratKeluar.length + 1;
  const currentYear = new Date().getFullYear();
  const defaultAgendaNo = `${String(nextSeq).padStart(3, '0')}/AG-OUT/${currentYear}`;

  // Form states
  const [nomorAgenda, setNomorAgenda] = useState(defaultAgendaNo);
  const [klasifikasiKode, setKlasifikasiKode] = useState('005');
  const [nomorSurat, setNomorSurat] = useState(`005/${String(nextSeq).padStart(3, '0')}/Pemdes-SKM/IX/${currentYear}`);
  const [tanggalSurat, setTanggalSurat] = useState(new Date().toISOString().slice(0, 10));
  const [sifatSurat, setSifatSurat] = useState<'Biasa' | 'Penting' | 'Segera' | 'Rahasia'>('Penting');
  const [lampiran, setLampiran] = useState('-');
  const [penerima, setPenerima] = useState('Yth. Para Ketua RW dan RT se-Desa Sukamaju');
  const [perihal, setPerihal] = useState('Undangan Musyawarah Perencanaan Pembangunan Desa (Musrenbangdes)');
  const [isiSurat, setIsiSurat] = useState(TEMPLATES[0].isi);
  const [penandatanganRole, setPenandatanganRole] = useState<'kades' | 'sekdes'>('kades');
  const [tembusan, setTembusan] = useState('1. Camat Ciawi (sebagai laporan)\n2. Ketua BPD Sukamaju\n3. Arsip');

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Apply template helper
  const handleApplyTemplate = (tmpl: (typeof TEMPLATES)[0]) => {
    setKlasifikasiKode(tmpl.klasifikasi);
    setSifatSurat(tmpl.sifat);
    setLampiran(tmpl.lampiran);
    setPerihal(tmpl.perihal);
    setIsiSurat(tmpl.isi);
    setNomorSurat(`${tmpl.klasifikasi}/${String(nextSeq).padStart(3, '0')}/Pemdes-SKM/IX/${currentYear}`);
  };

  // Auto regenerate nomor surat based on kode
  const handleRegenerateNomorSurat = (kode: string) => {
    setKlasifikasiKode(kode);
    setNomorSurat(`${kode}/${String(nextSeq).padStart(3, '0')}/Pemdes-SKM/IX/${currentYear}`);
  };

  // Reset nomor agenda to auto recommendation
  const handleResetAgendaNo = () => {
    setNomorAgenda(`${String(nextSeq).padStart(3, '0')}/AG-OUT/${currentYear}`);
  };

  const penandatanganNama =
    penandatanganRole === 'kades'
      ? `${profile.namaKades} (Kepala Desa)`
      : `${profile.namaSekdes} (Sekretaris Desa a.n. Kepala Desa)`;

  const handleSubmit = (shouldPrint: boolean = false) => {
    if (!nomorAgenda.trim() || !nomorSurat.trim() || !penerima.trim() || !perihal.trim()) {
      alert('Mohon lengkapi Nomor Agenda, Nomor Surat, Penerima, dan Perihal Surat.');
      return;
    }

    const payload: Omit<SuratKeluar, 'id'> = {
      nomorAgenda: nomorAgenda.trim(),
      nomorSurat: nomorSurat.trim(),
      tanggalSurat,
      penerima: penerima.trim(),
      perihal: perihal.trim(),
      penandatangan: penandatanganNama,
      sifatSurat,
      lampiran: lampiran.trim() || '-',
      isiRingkas: perihal.trim(),
      keterangan: `Dibuat via Menu Buat Surat Keluar (${sifatSurat})`,
    };

    addSuratKeluar(payload);

    if (shouldPrint) {
      setPreviewModalOpen(true);
      setTimeout(() => {
        window.print();
      }, 500);
    } else {
      setSuccessMessage(`Surat keluar no. ${nomorSurat} dengan No. Agenda ${nomorAgenda} berhasil dicatat di buku agenda!`);
      setTimeout(() => {
        if (onSuccessNavigateToAgenda) {
          onSuccessNavigateToAgenda();
        }
      }, 1500);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center">
            <Send className="w-6 h-6 mr-2 text-blue-600" />
            Menu Buat Surat Keluar Resmi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Buat dan terbitkan surat dinas keluar desa, customisasi nomor agenda register, cetak dengan kop surat resmi.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 mr-1.5 text-blue-600" />
            Pratinjau Surat
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="inline-flex items-center px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Simpan & Cetak
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 mr-1.5" />
            Simpan ke Agenda
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          {onSuccessNavigateToAgenda && (
            <button
              onClick={onSuccessNavigateToAgenda}
              className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
            >
              Buka Buku Agenda Surat Keluar &rarr;
            </button>
          )}
        </div>
      )}

      {/* Quick Template Picker */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-700 flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Pilih Template Cepat Surat Dinas Desa:
          </span>
          <span className="text-[10px] text-slate-400">Klik untuk memuat format resmi</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => handleApplyTemplate(tmpl)}
              className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-xs group cursor-pointer"
            >
              <p className="font-semibold text-slate-800 group-hover:text-blue-700">{tmpl.nama}</p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{tmpl.perihal}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          {/* Custom Nomor Agenda Box */}
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-blue-900 flex items-center">
                <Hash className="w-3.5 h-3.5 mr-1 text-blue-700" />
                Nomor Agenda (Bisa Di-custom) *
              </label>
              <button
                type="button"
                onClick={handleResetAgendaNo}
                className="text-[10px] text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
                title="Kembalikan ke format auto"
              >
                Auto Format
              </button>
            </div>
            <input
              type="text"
              required
              value={nomorAgenda}
              onChange={(e) => setNomorAgenda(e.target.value)}
              placeholder="Contoh: 005/AG-OUT/2026"
              className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-md font-mono font-bold text-blue-950 focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[10px] text-blue-700 mt-1 flex items-center">
              <Info className="w-3 h-3 mr-1 flex-shrink-0" />
              Nomor urut buku agenda keluar desa (dapat disesuaikan bebas).
            </p>
          </div>

          {/* Klasifikasi Surat */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Klasifikasi Tata Naskah Dinas
            </label>
            <select
              value={klasifikasiKode}
              onChange={(e) => handleRegenerateNomorSurat(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="005">005 - Undangan Resmi</option>
              <option value="140">140 - Pemerintahan Desa</option>
              <option value="470">470 - Kependudukan & Pencatatan Sipil</option>
              <option value="510">510 - Perekonomian & Usaha Desa</option>
              <option value="600">600 - Pekerjaan Umum & Sarana</option>
              <option value="800">800 - Kepegawaian & Perangkat Desa</option>
              <option value="900">900 - Keuangan & Pendapatan Desa</option>
            </select>
          </div>

          {/* Nomor Surat Resmi */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Nomor Surat Resmi Keluar *
            </label>
            <input
              type="text"
              required
              value={nomorSurat}
              onChange={(e) => setNomorSurat(e.target.value)}
              placeholder="Contoh: 005/014/Pemdes-SKM/IX/2026"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tanggal Surat */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Tanggal Surat *
            </label>
            <input
              type="date"
              required
              value={tanggalSurat}
              onChange={(e) => setTanggalSurat(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sifat Surat */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Sifat Surat
            </label>
            <select
              value={sifatSurat}
              onChange={(e) => setSifatSurat(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Biasa">Biasa</option>
              <option value="Penting">Penting</option>
              <option value="Segera">Segera</option>
              <option value="Rahasia">Rahasia</option>
            </select>
          </div>

          {/* Lampiran */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Lampiran
            </label>
            <input
              type="text"
              value={lampiran}
              onChange={(e) => setLampiran(e.target.value)}
              placeholder="Contoh: - atau 1 (Satu) Berkas"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Penerima / Tujuan */}
          <div className="sm:col-span-2 md:col-span-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Tujuan / Penerima Surat (Yth.) *
            </label>
            <input
              type="text"
              required
              value={penerima}
              onChange={(e) => setPenerima(e.target.value)}
              placeholder="Contoh: Yth. Camat Ciawi / Yth. Para Ketua RW dan RT se-Desa Sukamaju"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Perihal */}
          <div className="sm:col-span-2 md:col-span-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Perihal Surat *
            </label>
            <input
              type="text"
              required
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
              placeholder="Contoh: Undangan Musyawarah Perencanaan Pembangunan Desa (Musrenbangdes)"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Isi Surat */}
          <div className="sm:col-span-2 md:col-span-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Isi & Redaksi Surat Keluar *
            </label>
            <textarea
              rows={9}
              required
              value={isiSurat}
              onChange={(e) => setIsiSurat(e.target.value)}
              placeholder="Tuliskan isi surat lengkap di sini..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md font-sans text-xs text-slate-800 leading-relaxed focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Penandatangan */}
          <div className="sm:col-span-1 md:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Pejabat Penandatangan Surat
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="roleTtd"
                  checked={penandatanganRole === 'kades'}
                  onChange={() => setPenandatanganRole('kades')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Kepala Desa: <strong>{profile.namaKades}</strong></span>
              </label>

              <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="roleTtd"
                  checked={penandatanganRole === 'sekdes'}
                  onChange={() => setPenandatanganRole('sekdes')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Sekretaris Desa (a.n. Kades): <strong>{profile.namaSekdes}</strong></span>
              </label>
            </div>
          </div>

          {/* Tembusan */}
          <div className="sm:col-span-1 md:col-span-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Tembusan (Opsional)
            </label>
            <textarea
              rows={2}
              value={tembusan}
              onChange={(e) => setTembusan(e.target.value)}
              placeholder="1. Camat Ciawi&#10;2. Arsip"
              className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-md text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Format surat otomatis terdaftar pada Buku Agenda Surat Keluar Desa.</span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setPreviewModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Pratinjau Resmi
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Simpan & Cetak
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors active:scale-95 cursor-pointer"
            >
              Simpan ke Agenda
            </button>
          </div>
        </div>
      </div>

      {/* Official Letter Preview Modal (Print Ready) */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none">
            {/* Modal Top Bar (Hidden in Print) */}
            <div className="p-4 bg-slate-800 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-sm">Pratinjau Surat Keluar Resmi & Kop Desa</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" />
                  Cetak Sekarang
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Letter Sheet Body (Standard A4: 210mm x 297mm - 1 Halaman Pas) */}
            <div className="overflow-y-auto bg-slate-100 p-4 flex justify-center print:p-0 print:bg-white">
              <div
                className="printable-sheet bg-white text-black shadow-lg border border-slate-300 box-border"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  padding: '23mm 23mm 20mm 23mm',
                  fontFamily: "'Times New Roman', Times, serif",
                  fontSize: '10pt',
                  lineHeight: '1.34',
                  ['--letter-font-size' as any]: '10pt',
                  ['--letter-line-height' as any]: '1.34',
                  ['--letter-padding' as any]: '23mm 23mm 20mm 23mm',
                }}
              >
                {/* Kop Surat Resmi */}
                <div className="text-center pb-2 border-b-4 border-double border-black" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  <h3 className="text-[11pt] font-bold uppercase tracking-wider leading-snug">
                    PEMERINTAH KABUPATEN {profile.kabupaten ? profile.kabupaten.toUpperCase() : 'KLATEN'}
                  </h3>
                  <h4 className="text-[11pt] font-bold uppercase tracking-wider leading-snug">
                    KECAMATAN {profile.kecamatan ? profile.kecamatan.toUpperCase() : 'KALIKOTES'}
                  </h4>
                  <h2 className="text-[13pt] font-bold uppercase tracking-wide leading-tight">
                    DESA {profile.namaDesa ? profile.namaDesa.toUpperCase() : 'JIMBUNG'}
                  </h2>
                  <p className="text-[8.5pt] text-black mt-0.5">
                    {profile.alamatKantor || 'Jl. Raya Jimbung - Kalikotes No. 01, Kalikotes, Klaten'} • Telp: {profile.telepon || '(0272) 321890'} • Email: {profile.email || 'pemdes@jimbung.desa.id'} • Kode Pos: {profile.kodePos || '57451'}
                  </p>
                </div>

                {/* Letter Metadata */}
                <div className="mt-3.5 flex justify-between items-start text-[10pt]" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  <div className="space-y-0.5">
                    <div className="flex">
                      <span className="w-20 font-semibold">Nomor</span>
                      <span>: {nomorSurat}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 font-semibold">No. Agenda</span>
                      <span>: {nomorAgenda}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 font-semibold">Sifat</span>
                      <span>: {sifatSurat}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 font-semibold">Lampiran</span>
                      <span>: {lampiran}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 font-semibold">Perihal</span>
                      <span className="font-bold">: {perihal}</span>
                    </div>
                  </div>

                  <div className="text-right text-[10pt]">
                    <p>
                      {profile.namaDesa || 'Jimbung'},{' '}
                      {new Date(tanggalSurat).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <div className="mt-2 text-left">
                      <p>Kepada Yth.</p>
                      <p className="font-bold">{penerima}</p>
                      <p>di Tempat</p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="mt-4 space-y-2 whitespace-pre-line text-justify text-[10pt] leading-relaxed" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  {isiSurat}
                </div>

                {/* Signature Section (Clean, No Stamp) */}
                <div className="mt-6 flex justify-end" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  <div className="text-center w-64 text-[10pt]">
                    <p>
                      {profile.namaDesa || 'Jimbung'},{' '}
                      {new Date(tanggalSurat).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="font-bold mt-1 uppercase text-[10pt]">
                      {penandatanganRole === 'kades'
                        ? `KEPALA DESA ${(profile.namaDesa || 'JIMBUNG').toUpperCase()}`
                        : `a.n. KEPALA DESA ${(profile.namaDesa || 'JIMBUNG').toUpperCase()}\nSEKRETARIS DESA`}
                    </p>

                    {/* Ruang Tanda Tangan Bersih Tanpa Cap */}
                    <div className="h-16 flex items-center justify-center">
                    </div>

                    <p className="font-bold underline uppercase text-black text-[10pt]">
                      {penandatanganRole === 'kades' ? profile.namaKades : profile.namaSekdes}
                    </p>
                  </div>
                </div>

                {/* Tembusan */}
                {tembusan.trim() && (
                  <div className="mt-4 pt-2 border-t border-black text-[9pt]" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                    <p className="font-bold">Tembusan disampaikan kepada Yth:</p>
                    <p className="whitespace-pre-line mt-0.5">{tembusan}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
