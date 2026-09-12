import React, { useState, useRef } from 'react';
import {
  Upload,
  Sparkles,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  FileText,
  Inbox,
  ShieldCheck,
  Zap,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { SuratMasuk, ScannedSuratMasukResult } from '../types';

interface ScanSuratMasukModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToAgenda: (data: Omit<SuratMasuk, 'id'>) => void;
  nextAgendaNumber?: string;
}

// Built-in realistic Indonesian Government incoming letters for instant testing
const SAMPLE_SURAT_LIST: {
  label: string;
  desc: string;
  data: ScannedSuratMasukResult;
}[] = [
  {
    label: 'Undangan Rapat Koordinasi Kecamatan',
    desc: 'Surat dinas dari Camat terkait evaluasi APBDes & stunting',
    data: {
      nomorSurat: '005/214/Kec-CW/IX/2026',
      tanggalSurat: new Date().toISOString().slice(0, 10),
      tanggalDiterima: new Date().toISOString().slice(0, 10),
      pengirim: 'Pemerintah Kecamatan Ciawi - Bagian Pemerintahan',
      perihal: 'Undangan Rapat Koordinasi Evaluasi Penyerapan Dana Desa dan Penanganan Stunting',
      sifatSurat: 'Penting',
      disposisiRekomendasi: 'Kaur Perencanaan & Bidan Desa: Siapkan laporan realisasi semester 1 dan hadir mendampingi Kepala Desa.',
      ringkasan: 'Rapat koordinasi rutin tingkat kecamatan bertempat di Aula Kantor Camat hari Kamis pukul 09.00 WIB.',
      keterangan: 'Membawa dokumen hardcopy realisasi APBDes & data balita posyandu.',
    },
  },
  {
    label: 'Surat Edaran Puskesmas - Pekan Imunisasi Nasional',
    desc: 'Instruksi jadwal imunisasi serentak di posyandu desa',
    data: {
      nomorSurat: '440/512/Pusk-Cwi/2026',
      tanggalSurat: new Date().toISOString().slice(0, 10),
      tanggalDiterima: new Date().toISOString().slice(0, 10),
      pengirim: 'UPTD Puskesmas Ciawi',
      perihal: 'Pemberitahuan Pelaksanaan Pekan Imunisasi Nasional (PIN) Polio & Campak Tambahan',
      sifatSurat: 'Segera',
      disposisiRekomendasi: 'Kasi Kesra & Ketua TP-PKK: Teruskan ke seluruh Ketua RT/RW dan kader posyandu agar mengarahkan seluruh balita hadir.',
      ringkasan: 'Imunisasi polio tetes serentak untuk anak usia 0-7 tahun di seluruh posyandu desa selama 3 hari.',
      keterangan: 'Dukungan fasilitas tempat dan sound system posyandu dimohon disiapkan.',
    },
  },
  {
    label: 'Pemberitahuan Verifikasi Bantuan Sosial Dinsos',
    desc: 'Surat dinas pemutakhiran data penerima bansos PKH/BPNT',
    data: {
      nomorSurat: '460/889/Dinsos-Kab/2026',
      tanggalSurat: new Date().toISOString().slice(0, 10),
      tanggalDiterima: new Date().toISOString().slice(0, 10),
      pengirim: 'Dinas Sosial Kabupaten Bogor',
      perihal: 'Verifikasi dan Validasi Data Terpadu Kesejahteraan Sosial (DTKS) Kuartal III',
      sifatSurat: 'Biasa',
      disposisiRekomendasi: 'Kasi Pelayanan & Operator SIKS-NG: Verifikasi lapangan bersama ketua RW untuk mencoret KPM yang sudah mampu.',
      ringkasan: 'Pemerintah desa diminta menyelenggarakan musyawarah desa khusus (Musdesus) pemutakhiran data warga kurang mampu.',
      keterangan: 'Batas akhir unggah berita acara ke aplikasi SIKS-NG adalah tanggal 25 bulan berjalan.',
    },
  },
];

export const ScanSuratMasukModal: React.FC<ScanSuratMasukModalProps> = ({
  isOpen,
  onClose,
  onSaveToAgenda,
  nextAgendaNumber = '005/AG-IN/2026',
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileMimeType, setFileMimeType] = useState<string>('image/jpeg');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [isAiSuccess, setIsAiSuccess] = useState(false);

  // Form review state
  const [formData, setFormData] = useState({
    nomorAgenda: nextAgendaNumber,
    nomorSurat: '',
    tanggalSurat: new Date().toISOString().slice(0, 10),
    tanggalDiterima: new Date().toISOString().slice(0, 10),
    pengirim: '',
    perihal: '',
    sifatSurat: 'Biasa' as 'Biasa' | 'Penting' | 'Segera' | 'Rahasia',
    disposisi: '',
    status: 'Belum Ditindaklanjuti' as 'Belum Ditindaklanjuti' | 'Diproses' | 'Selesai',
    keterangan: '',
    ringkasan: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileMimeType(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      triggerAiScan(base64, file.type || 'image/jpeg', file.name);
    };
    reader.readAsDataURL(file);
  };

  // Perform AI scan using Gemini endpoint
  const triggerAiScan = async (base64Data: string, mime: string, name: string) => {
    setIsScanning(true);
    setScanError(null);
    setIsAiSuccess(false);
    setScanStep('Mengirim berkas fisik ke Gemini AI Engine...');

    try {
      setScanStep('Gemini 3.8 Flash sedang membaca kop surat, nomor, perihal, dan disposisi...');

      const response = await fetch('/api/scan-surat-masuk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mime,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const d: ScannedSuratMasukResult = result.data;
        setFormData((prev) => ({
          ...prev,
          nomorSurat: d.nomorSurat || prev.nomorSurat,
          tanggalSurat: d.tanggalSurat || prev.tanggalSurat,
          tanggalDiterima: d.tanggalDiterima || prev.tanggalDiterima,
          pengirim: d.pengirim || prev.pengirim,
          perihal: d.perihal || prev.perihal,
          sifatSurat: d.sifatSurat || prev.sifatSurat,
          disposisi: d.disposisiRekomendasi || prev.disposisi,
          ringkasan: d.ringkasan || '',
          keterangan: d.keterangan || (d.ringkasan ? `Inti: ${d.ringkasan}` : ''),
        }));
        setIsAiSuccess(true);
      } else {
        // Fallback gracefully
        const fallbackSample = SAMPLE_SURAT_LIST[0];
        setFormData((prev) => ({
          ...prev,
          nomorSurat: fallbackSample.data.nomorSurat,
          tanggalSurat: fallbackSample.data.tanggalSurat,
          tanggalDiterima: fallbackSample.data.tanggalDiterima,
          pengirim: fallbackSample.data.pengirim,
          perihal: fallbackSample.data.perihal,
          sifatSurat: fallbackSample.data.sifatSurat || 'Penting',
          disposisi: fallbackSample.data.disposisiRekomendasi || '',
          ringkasan: fallbackSample.data.ringkasan || '',
          keterangan: fallbackSample.data.keterangan || '',
        }));
        setScanError(
          result.error ||
            'Gemini API key belum dikonfigurasi. Sistem memuat format draf surat masuk resmi yang dapat Anda sesuaikan langsung.'
        );
      }
    } catch (err: any) {
      console.warn('Scan API network error:', err);
      const fallbackSample = SAMPLE_SURAT_LIST[0];
      setFormData((prev) => ({
        ...prev,
        nomorSurat: fallbackSample.data.nomorSurat,
        tanggalSurat: fallbackSample.data.tanggalSurat,
        tanggalDiterima: fallbackSample.data.tanggalDiterima,
        pengirim: fallbackSample.data.pengirim,
        perihal: fallbackSample.data.perihal,
        sifatSurat: fallbackSample.data.sifatSurat || 'Penting',
        disposisi: fallbackSample.data.disposisiRekomendasi || '',
        ringkasan: fallbackSample.data.ringkasan || '',
        keterangan: fallbackSample.data.keterangan || '',
      }));
      setScanError(
        'Server offline atau koneksi terputus. Format surat masuk resmi telah dimuat dan dapat diedit.'
      );
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  // 1-Click test with sample letter
  const handleUseSample = (sample: (typeof SAMPLE_SURAT_LIST)[0]) => {
    setSelectedImage(null);
    setFileName(`[Sampel Dokumen] ${sample.label}`);
    setIsAiSuccess(true);
    setScanError(null);

    setFormData((prev) => ({
      ...prev,
      nomorSurat: sample.data.nomorSurat,
      tanggalSurat: sample.data.tanggalSurat,
      tanggalDiterima: sample.data.tanggalDiterima,
      pengirim: sample.data.pengirim,
      perihal: sample.data.perihal,
      sifatSurat: sample.data.sifatSurat || 'Biasa',
      disposisi: sample.data.disposisiRekomendasi || '',
      ringkasan: sample.data.ringkasan || '',
      keterangan: sample.data.keterangan || '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nomorSurat.trim() || !formData.pengirim.trim() || !formData.perihal.trim()) {
      alert('Mohon lengkapi Nomor Surat, Pengirim, dan Perihal.');
      return;
    }

    onSaveToAgenda({
      nomorAgenda: formData.nomorAgenda.trim() || nextAgendaNumber,
      nomorSurat: formData.nomorSurat.trim(),
      tanggalSurat: formData.tanggalSurat,
      tanggalDiterima: formData.tanggalDiterima,
      pengirim: formData.pengirim.trim(),
      perihal: formData.perihal.trim(),
      sifatSurat: formData.sifatSurat,
      disposisi: formData.disposisi.trim(),
      status: formData.status,
      keterangan: formData.keterangan.trim() || (formData.ringkasan ? `Inti: ${formData.ringkasan}` : undefined),
      ringkasan: formData.ringkasan.trim() || undefined,
      namaBerkas: fileName || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold">Upload Surat Masuk (Scan AI)</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-900">
                  Gemini AI OCR
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Upload berkas fisik/foto surat dinas. AI mengekstrak data dan otomatis memasukkan ke buku agenda surat masuk.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          {/* Top Section: Upload Box & Samples */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Upload Area */}
            <div className="lg:col-span-7">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => !isScanning && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[160px] ${
                  selectedImage
                    ? 'border-blue-400 bg-blue-50/40'
                    : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 bg-white'
                }`}
              >
                {isScanning ? (
                  <div className="py-4 flex flex-col items-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-800">Sedang Menganalisis Dokumen...</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs">{scanStep}</p>
                    </div>
                  </div>
                ) : selectedImage ? (
                  <div className="flex items-center space-x-4 w-full">
                    {fileMimeType.startsWith('image/') ? (
                      <img
                        src={selectedImage}
                        alt="Preview Surat"
                        className="w-20 h-24 object-cover rounded-lg border border-slate-200 shadow-xs flex-shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-24 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-8 h-8 text-blue-600" />
                      </div>
                    )}
                    <div className="text-left flex-1 min-w-0">
                      <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md mb-1">
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Dokumen Terunggah
                      </span>
                      <p className="text-xs font-semibold text-slate-800 truncate" title={fileName}>
                        {fileName}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Klik area ini untuk mengganti berkas surat
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Klik untuk Memilih File atau Seret ke Sini
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Mendukung foto berkas JPG, PNG, WEBP, atau PDF surat masuk
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Test Samples */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-700 flex items-center">
                    <Zap className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    Coba Langsung (Sampel Cepat):
                  </span>
                  <span className="text-[10px] text-slate-400">1-Klik Ekstrak</span>
                </div>
                <div className="space-y-1.5">
                  {SAMPLE_SURAT_LIST.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleUseSample(sample)}
                      className="w-full text-left p-2 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50/60 transition-all text-xs group cursor-pointer"
                    >
                      <div className="font-semibold text-slate-800 group-hover:text-blue-700 flex items-center justify-between">
                        <span className="truncate">{sample.label}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 flex-shrink-0 ml-1" />
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{sample.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {scanError && (
                <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>{scanError}</span>
                </div>
              )}

              {isAiSuccess && !scanError && (
                <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Data surat berhasil dibaca oleh AI! Silakan periksa di bawah.</span>
                </div>
              )}
            </div>
          </div>

          {/* Review & Customization Form */}
          <form id="form-scan-surat" onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center">
                <Inbox className="w-4 h-4 text-blue-600 mr-2" />
                Konfirmasi & Kustomisasi Data Surat Masuk
              </h3>
              <span className="text-xs font-medium text-slate-500">
                Semua data dapat disunting manual
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              {/* Customizable Nomor Agenda */}
              <div className="md:col-span-1 p-2.5 bg-blue-50/50 rounded-lg border border-blue-200">
                <label className="block text-[11px] font-bold text-blue-900 mb-1 flex items-center justify-between">
                  <span>Nomor Agenda *</span>
                  <span className="text-[10px] text-blue-600 font-normal">Dapat di-custom</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nomorAgenda}
                  onChange={(e) => setFormData({ ...formData, nomorAgenda: e.target.value })}
                  placeholder="Contoh: 005/AG-IN/2026"
                  className="w-full px-2.5 py-1.5 bg-white border border-blue-300 rounded-md font-mono font-bold text-blue-950 focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-blue-700 mt-1">
                  Nomor register buku agenda masuk desa.
                </p>
              </div>

              {/* Nomor Surat Pengirim */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nomor Surat Resmi Pengirim *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nomorSurat}
                  onChange={(e) => setFormData({ ...formData, nomorSurat: e.target.value })}
                  placeholder="Contoh: 005/214/Kec-CW/2026"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Sifat Surat */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Sifat Surat
                </label>
                <select
                  value={formData.sifatSurat}
                  onChange={(e) => setFormData({ ...formData, sifatSurat: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Biasa">Biasa</option>
                  <option value="Penting">Penting</option>
                  <option value="Segera">Segera</option>
                  <option value="Rahasia">Rahasia</option>
                </select>
              </div>

              {/* Tanggal Surat */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tanggal Pembuatan Surat *
                </label>
                <input
                  type="date"
                  required
                  value={formData.tanggalSurat}
                  onChange={(e) => setFormData({ ...formData, tanggalSurat: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tanggal Diterima */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tanggal Diterima di Desa *
                </label>
                <input
                  type="date"
                  required
                  value={formData.tanggalDiterima}
                  onChange={(e) => setFormData({ ...formData, tanggalDiterima: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Agenda Awal */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Status Agenda Awal
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Belum Ditindaklanjuti">Belum Ditindaklanjuti</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              {/* Pengirim */}
              <div className="sm:col-span-2 md:col-span-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Instansi / Pihak Pengirim *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pengirim}
                  onChange={(e) => setFormData({ ...formData, pengirim: e.target.value })}
                  placeholder="Contoh: Kantor Camat Ciawi / Puskesmas / Dinas Sosial"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Perihal */}
              <div className="sm:col-span-2 md:col-span-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Perihal / Pokok Surat *
                </label>
                <input
                  type="text"
                  required
                  value={formData.perihal}
                  onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
                  placeholder="Contoh: Undangan Rapat Koordinasi Penyaluran BLT Dana Desa"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Disposisi Rekomendasi (Instruksi Kepala Desa / Sekdes) */}
              <div className="sm:col-span-2 md:col-span-3 p-2.5 bg-indigo-50/50 rounded-lg border border-indigo-200">
                <label className="block text-[11px] font-bold text-indigo-900 mb-1 flex items-center justify-between">
                  <span className="flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                    Instruksi Disposisi Kepala Desa / Sekdes
                  </span>
                  <span className="text-[10px] text-indigo-600 font-normal">
                    AI menyusun rekomendasi instruksi perangkat desa
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={formData.disposisi}
                  onChange={(e) => setFormData({ ...formData, disposisi: e.target.value })}
                  placeholder="Contoh: Kasi Kesra: Pelajari berkas dan hadiri rapat koordinasi mewakili Kades."
                  className="w-full px-2.5 py-1.5 bg-white border border-indigo-300 rounded-md text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Ringkasan & Keterangan Tambahan */}
              <div className="sm:col-span-2 md:col-span-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Keterangan / Catatan Tambahan
                </label>
                <input
                  type="text"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Contoh: Waktu rapat tgl 12 Sept pukul 09.00 WIB di Aula Kecamatan"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="submit"
              form="form-scan-surat"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Simpan & Masukkan ke Agenda Surat Masuk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
