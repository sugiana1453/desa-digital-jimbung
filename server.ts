import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parsing with large payload limit for base64 scanned documents
app.use(express.json({ limit: '25mb' }));

// Lazy initialize Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// API endpoint to Scan & OCR Kartu Keluarga (KK) using Gemini Vision
app.post('/api/scan-kk', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Data gambar Kartu Keluarga (imageBase64) wajib disertakan.' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi pada environment server.',
        needsFallback: true,
      });
    }

    // Clean base64 string if it contains data URL prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');

    const prompt = `Anda adalah sistem OCR cerdas kependudukan resmi Republik Indonesia.
Tugas Anda adalah membaca dan mengekstrak data dari dokumen Kartu Keluarga (KK) Indonesia berikut ini dengan sangat akurat.

Harap ekstrak:
1. Nomor KK (16 digit angka).
2. Data Alamat: Nama Jalan / Alamat, RT, RW, Dusun / Kelurahan, Kecamatan, Kabupaten / Kota, Provinsi.
3. Daftar seluruh anggota keluarga yang tercantum di tabel Kartu Keluarga (Kepala Keluarga, Istri, Anak, dll).
Untuk setiap anggota keluarga:
- nama: Nama lengkap sesuai KK (huruf kapital atau sesuai dokumen).
- nik: 16 digit angka NIK.
- jenisKelamin: 'L' jika Laki-laki, 'P' jika Perempuan.
- tempatLahir: Kota atau Kabupaten tempat lahir.
- tanggalLahir: Format YYYY-MM-DD (contoh: 1985-08-17). Jika hanya tanggal Indonesia (misal 17-08-1985), ubah ke format YYYY-MM-DD.
- agama: 'Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', atau 'Lainnya'.
- pendidikan: Pendidikan terakhir (contoh: 'SMA / Sederajat', 'S1', 'SMP', 'SD', 'Tidak / Belum Sekolah').
- pekerjaan: Jenis pekerjaan (contoh: 'Wiraswasta', 'Petani / Pekebun', 'Karyawan Swasta', 'PNS', 'Pelajar / Mahasiswa', 'Mengurus Rumah Tangga').
- statusPerkawinan: 'Belum Kawin', 'Kawin', 'Cerai Hidup', atau 'Cerai Mati'.
- statusKeluarga: 'Kepala Keluarga', 'Istri', 'Anak', 'Orang Tua', atau 'Famili Lain'.
- kewarganegaraan: 'WNI' atau 'WNA'.
- namaAyah: Nama ayah kandung sesuai kolom KK.
- namaIbu: Nama ibu kandung sesuai kolom KK.

Jika ada teks atau angka yang sedikit buram, gunakan konteks semantik kependudukan Indonesia untuk mengoreksinya. Kembalikan data dalam format JSON sesuai schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            noKk: { type: Type.STRING, description: 'Nomor Kartu Keluarga 16 digit' },
            alamat: { type: Type.STRING, description: 'Alamat lengkap atau nama jalan' },
            rt: { type: Type.STRING, description: 'Nomor RT 2-3 digit' },
            rw: { type: Type.STRING, description: 'Nomor RW 2-3 digit' },
            dusun: { type: Type.STRING, description: 'Nama Dusun atau Lingkungan' },
            desa: { type: Type.STRING, description: 'Nama Desa atau Kelurahan' },
            kecamatan: { type: Type.STRING, description: 'Nama Kecamatan' },
            kabupaten: { type: Type.STRING, description: 'Nama Kabupaten atau Kota' },
            provinsi: { type: Type.STRING, description: 'Nama Provinsi' },
            anggotaKeluarga: {
              type: Type.ARRAY,
              description: 'Daftar semua anggota keluarga pada KK',
              items: {
                type: Type.OBJECT,
                properties: {
                  nama: { type: Type.STRING },
                  nik: { type: Type.STRING, description: '16 digit NIK' },
                  jenisKelamin: { type: Type.STRING, enum: ['L', 'P'] },
                  tempatLahir: { type: Type.STRING },
                  tanggalLahir: { type: Type.STRING, description: 'Format YYYY-MM-DD' },
                  agama: { type: Type.STRING, enum: ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'] },
                  pendidikan: { type: Type.STRING },
                  pekerjaan: { type: Type.STRING },
                  statusPerkawinan: { type: Type.STRING, enum: ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'] },
                  statusKeluarga: { type: Type.STRING, enum: ['Kepala Keluarga', 'Istri', 'Anak', 'Orang Tua', 'Famili Lain'] },
                  kewarganegaraan: { type: Type.STRING, enum: ['WNI', 'WNA'] },
                  namaAyah: { type: Type.STRING, description: 'Nama Ayah Kandung' },
                  namaIbu: { type: Type.STRING, description: 'Nama Ibu Kandung' },
                },
                required: ['nama', 'nik', 'jenisKelamin', 'tempatLahir', 'tanggalLahir'],
              },
            },
          },
          required: ['noKk', 'alamat', 'anggotaKeluarga'],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error('Tidak menerima respon teks dari model AI.');
    }

    const parsedData = JSON.parse(textOutput);
    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error scanning KK via Gemini:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Gagal menganalisis dokumen Kartu Keluarga.',
      needsFallback: true,
    });
  }
});

// API endpoint to Scan & Read Surat Masuk using Gemini AI
app.post('/api/scan-surat-masuk', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Data gambar atau dokumen Surat Masuk (imageBase64) wajib disertakan.' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi pada environment server.',
        needsFallback: true,
      });
    }

    // Clean base64 string if it contains data URL prefix
    const cleanBase64 = imageBase64.replace(/^data:(image\/[a-zA-Z0-9+]+|application\/pdf);base64,/, '');

    const prompt = `Anda adalah sistem AI arsiparis dan sekretariat kantor desa profesional Republik Indonesia.
Tugas Anda adalah membaca dan menganalisis berkas dokumen fisik/digital Surat Masuk resmi (Surat Dinas / Undangan / Edaran / Pemberitahuan / Permohonan).

Harap ekstrak data berikut secara teliti:
1. nomorSurat: Nomor surat resmi dari instansi/pihak pengirim (contoh: '005/182/Kec-CW/2026').
2. tanggalSurat: Tanggal surat dibuat dalam format YYYY-MM-DD.
3. tanggalDiterima: Tanggal surat diterima di desa (format YYYY-MM-DD, jika ada stempel terima atau gunakan tanggal hari ini).
4. pengirim: Nama instansi, dinas, organisasi, atau pejabat pengirim (contoh: 'Kecamatan Ciawi', 'Puskesmas Ciawi', 'Dinas Sosial Kab. Bogor').
5. perihal: Pokok perihal atau mengenai surat secara lengkap dan jelas.
6. sifatSurat: Tentukan sifat surat ('Biasa' | 'Penting' | 'Segera' | 'Rahasia') berdasarkan kop, stempel, atau urgensi perihal.
7. disposisiRekomendasi: Rumuskan saran instruksi disposisi resmi yang jelas untuk Kepala Desa / Sekretaris Desa kepada perangkat desa terkait (contoh: 'Kasi Kesra: Pelajari dan siapkan berkas KPM untuk hadir mewakili Kades').
8. ringkasan: Ringkasan singkat 1-2 kalimat mengenai inti atau agenda pelaksanaan yang disebutkan di surat.
9. keterangan: Catatan tambahan seperti waktu, tempat acara, berkas lampiran, atau batas waktu tindak lanjut.

Kembalikan data dalam format JSON sesuai schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType === 'application/pdf' ? 'application/pdf' : 'image/jpeg',
            data: cleanBase64,
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nomorSurat: { type: Type.STRING, description: 'Nomor surat resmi pengirim' },
            tanggalSurat: { type: Type.STRING, description: 'Format YYYY-MM-DD' },
            tanggalDiterima: { type: Type.STRING, description: 'Format YYYY-MM-DD' },
            pengirim: { type: Type.STRING, description: 'Nama instansi atau pihak pengirim' },
            perihal: { type: Type.STRING, description: 'Perihal surat resmi' },
            sifatSurat: { type: Type.STRING, enum: ['Biasa', 'Penting', 'Segera', 'Rahasia'] },
            disposisiRekomendasi: { type: Type.STRING, description: 'Saran instruksi disposisi Kades' },
            ringkasan: { type: Type.STRING, description: 'Ringkasan isi surat' },
            keterangan: { type: Type.STRING, description: 'Catatan tambahan seperti tanggal acara/tempat/lampiran' },
          },
          required: ['nomorSurat', 'tanggalSurat', 'pengirim', 'perihal'],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error('Tidak menerima respon teks dari model AI.');
    }

    const parsedData = JSON.parse(textOutput);
    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error scanning Surat Masuk via Gemini:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Gagal menganalisis dokumen Surat Masuk.',
      needsFallback: true,
    });
  }
});

// API endpoint to Scan & Read Arsip Dokumen (Perdes, SK Kades, Perkades) using Gemini AI
app.post('/api/scan-arsip-dokumen', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Data dokumen arsip (imageBase64) wajib disertakan.' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi pada environment server.',
        needsFallback: true,
      });
    }

    // Clean base64 string if it contains data URL prefix
    const cleanBase64 = imageBase64.replace(/^data:(image\/[a-zA-Z0-9+]+|application\/pdf);base64,/, '');

    const prompt = `Anda adalah arsiparis hukum desa (Legal Archiving Specialist) profesional di Indonesia.
Tugas Anda adalah membaca berkas dokumen produk hukum desa (Peraturan Desa / Perdes, Keputusan Kepala Desa / SK Kades, Peraturan Kepala Desa / Perkades, atau Berita Acara / Dokumen Arsip Resmi Desa).

Ekstrak komponen dokumen secara akurat dan lengkap:
1. nomor: Nomor dokumen resmi (contoh: 'Nomor 04 Tahun 2026' atau '141/08/SK/Kpts-DS/2026').
2. judul: Judul naskah resmi lengkap (contoh: 'Keputusan Kepala Desa Sukamaju tentang Pembentukan Pos Pelayanan Terpadu (Posyandu)').
3. jenis: Klasifikasikan ke salah satu dari: 'PERDES' (Peraturan Desa), 'SK_KADES' (Surat Keputusan Kades), 'PERKADES' (Peraturan Kepala Desa), atau 'LAINNYA'.
4. tanggalPenetapan: Tanggal dokumen ditetapkan / disahkan (format YYYY-MM-DD).
5. tahun: Tahun penetapan angka 4 digit (contoh: 2026).
6. tentang: Mengenai / perihal / tentang penetapan dokumen.
7. status: Keberlakuan dokumen ('Berlaku' | 'Diubah' | 'Dicabut').
8. ringkasan: Ringkasan padat 2-4 kalimat mengenai substansi, ketentuan, atau penugasan yang diatur dalam dokumen.
9. penandatangan: Nama dan/atau jabatan pejabat penandatangan (contoh: 'Budi Santoso (Kepala Desa)').
10. keterangan: Catatan tambahan seperti nomor lembaran desa, pejabat penerima tembusan, atau instansi pengesahan.

Kembalikan respon dalam format JSON sesuai schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType === 'application/pdf' ? 'application/pdf' : 'image/jpeg',
            data: cleanBase64,
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nomor: { type: Type.STRING, description: 'Nomor resmi dokumen arsip' },
            judul: { type: Type.STRING, description: 'Judul lengkap peraturan / SK' },
            jenis: { type: Type.STRING, enum: ['PERDES', 'SK_KADES', 'PERKADES', 'LAINNYA'] },
            tanggalPenetapan: { type: Type.STRING, description: 'Format YYYY-MM-DD' },
            tahun: { type: Type.INTEGER, description: 'Tahun 4 digit' },
            tentang: { type: Type.STRING, description: 'Perihal / tentang penetapan' },
            status: { type: Type.STRING, enum: ['Berlaku', 'Diubah', 'Dicabut'] },
            ringkasan: { type: Type.STRING, description: 'Ringkasan isi penting dokumen' },
            penandatangan: { type: Type.STRING, description: 'Nama pejabat penandatangan' },
            keterangan: { type: Type.STRING, description: 'Catatan tambahan atau lembaran desa' },
          },
          required: ['nomor', 'judul', 'jenis', 'tanggalPenetapan', 'tahun', 'tentang'],
        },
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error('Tidak menerima respon teks dari model AI.');
    }

    const parsedData = JSON.parse(textOutput);
    res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error scanning Arsip Dokumen via Gemini:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Gagal menganalisis berkas dokumen arsip.',
      needsFallback: true,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Desa Digital berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer();
