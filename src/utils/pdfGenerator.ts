import { jsPDF } from 'jspdf';
import { ArsipDokumen, DesaProfile } from '../types';
import { formatTanggalIndo } from './formatters';

export function generateArsipPDF(
  doc: Partial<ArsipDokumen>,
  profil: DesaProfile
): { dataUrl: string; blob: Blob; download: (filename?: string) => void } {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 14;

  // Header / Kop Dokumen
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(30, 41, 59);
  pdf.text(`PEMERINTAH KABUPATEN ${(profil.kabupaten || 'BOGOR').toUpperCase()}`, pageWidth / 2, currentY, {
    align: 'center',
  });
  currentY += 4.2;

  pdf.text(`KECAMATAN ${(profil.kecamatan || 'CIAWI').toUpperCase()}`, pageWidth / 2, currentY, {
    align: 'center',
  });
  currentY += 4.2;

  pdf.setFontSize(12);
  pdf.text(`KANTOR KEPALA DESA ${(profil.namaDesa || 'SUKAMAJU').toUpperCase()}`, pageWidth / 2, currentY, {
    align: 'center',
  });
  currentY += 4.2;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(71, 85, 105);
  pdf.text(
    `${profil.alamatKantor || 'Jl. Raya Desa No. 12'} | Telp: ${profil.telepon || '-'} | Kode Pos: ${profil.kodePos || '16720'}`,
    pageWidth / 2,
    currentY,
    { align: 'center' }
  );
  currentY += 2.5;

  // Double Divider Line
  pdf.setDrawColor(15, 23, 42);
  pdf.setLineWidth(0.8);
  pdf.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 1.0;
  pdf.setLineWidth(0.3);
  pdf.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5.5;

  // Judul Dokumen
  let jenisNama = 'PERATURAN DESA';
  if (doc.jenis === 'SK_KADES') jenisNama = 'KEPUTUSAN KEPALA DESA';
  else if (doc.jenis === 'PERKADES') jenisNama = 'PERATURAN KEPALA DESA';
  else if (doc.jenis === 'LAINNYA') jenisNama = 'DOKUMEN RESMI DESA';

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`${jenisNama} ${(profil.namaDesa || 'SUKAMAJU').toUpperCase()}`, pageWidth / 2, currentY, {
    align: 'center',
  });
  currentY += 4.2;

  pdf.setFontSize(9);
  pdf.text(`NOMOR: ${doc.nomor || `Nomor 01 Tahun ${new Date().getFullYear()}`}`, pageWidth / 2, currentY, {
    align: 'center',
  });
  currentY += 4.5;

  pdf.setFontSize(9.5);
  pdf.text('TENTANG', pageWidth / 2, currentY, { align: 'center' });
  currentY += 4;

  const tentangLines = pdf.splitTextToSize((doc.tentang || doc.judul || 'PENETAPAN DOKUMEN ARSIP').toUpperCase(), contentWidth - 10);
  pdf.text(tentangLines, pageWidth / 2, currentY, { align: 'center' });
  currentY += tentangLines.length * 4.2 + 3;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text('DENGAN RAHMAT TUHAN YANG MAHA ESA', pageWidth / 2, currentY, { align: 'center' });
  currentY += 4;
  pdf.text(`KEPALA DESA ${(profil.namaDesa || 'SUKAMAJU').toUpperCase()},`, pageWidth / 2, currentY, {
    align: 'center',
  });
  currentY += 5;

  // Isi Substansi
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(30, 41, 59);

  // Menimbang
  pdf.setFont('helvetica', 'bold');
  pdf.text('Menimbang :', margin, currentY);
  pdf.setFont('helvetica', 'normal');
  const menimbangText = `Bahwa dalam rangka tertib administrasi, kepastian hukum serta penyelenggaraan pemerintahan Desa ${profil.namaDesa} yang akuntabel dan transparan, perlu menetapkan ${doc.judul || doc.tentang || 'dokumen penetapan resmi'}.`;
  const menimbangLines = pdf.splitTextToSize(menimbangText, contentWidth - 28);
  pdf.text(menimbangLines, margin + 28, currentY);
  currentY += menimbangLines.length * 3.8 + 3;

  // Mengingat
  pdf.setFont('helvetica', 'bold');
  pdf.text('Mengingat   :', margin, currentY);
  pdf.setFont('helvetica', 'normal');
  const mengingatText = `1. Undang-Undang Nomor 6 Tahun 2014 tentang Desa;\n2. Peraturan Pemerintah Republik Indonesia tentang Penyelenggaraan Pemerintahan Desa;\n3. Peraturan Daerah Kabupaten ${profil.kabupaten} terkait Pedoman Organisasi dan Tata Kerja Pemerintah Desa.`;
  const mengingatLines = pdf.splitTextToSize(mengingatText, contentWidth - 28);
  pdf.text(mengingatLines, margin + 28, currentY);
  currentY += mengingatLines.length * 3.8 + 4;

  // Memutuskan
  pdf.setFont('helvetica', 'bold');
  pdf.text('MEMUTUSKAN:', pageWidth / 2, currentY, { align: 'center' });
  currentY += 4;

  pdf.text('Menetapkan :', margin, currentY);
  pdf.setFont('helvetica', 'normal');
  const putusanLines = pdf.splitTextToSize((doc.judul || doc.tentang || '').toUpperCase(), contentWidth - 28);
  pdf.text(putusanLines, margin + 28, currentY);
  currentY += putusanLines.length * 3.8 + 3;

  // Ringkasan Ketentuan
  pdf.setFont('helvetica', 'bold');
  pdf.text('Pasal / Diktum Ketentuan Utama:', margin, currentY);
  currentY += 3.8;
  pdf.setFont('helvetica', 'normal');

  const ringkasanBody = doc.ringkasan || doc.tentang || 'Ketentuan berlaku sebagaimana tercatat dalam lembaran berita desa.';
  const ringkasanLines = pdf.splitTextToSize(ringkasanBody, contentWidth);
  pdf.text(ringkasanLines, margin, currentY);
  currentY += ringkasanLines.length * 3.8 + 5;

  // Status & Catatan
  if (doc.keterangan) {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    const ketLines = pdf.splitTextToSize(`Catatan Lembaran Desa: ${doc.keterangan}`, contentWidth);
    pdf.text(ketLines, margin, currentY);
    currentY += ketLines.length * 3.5 + 4;
  }

  // Tanggal dan Pengesahan
  currentY = Math.min(Math.max(currentY + 2, 205), 220);

  const ttdX = pageWidth - margin - 65;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(15, 23, 42);

  pdf.text(`Ditetapkan di: ${profil.namaDesa}`, ttdX, currentY);
  currentY += 4;
  pdf.text(`Pada tanggal  : ${formatTanggalIndo(doc.tanggalPenetapan || new Date().toISOString().slice(0, 10))}`, ttdX, currentY);
  currentY += 4.5;

  pdf.setFont('helvetica', 'bold');
  pdf.text(`KEPALA DESA ${(profil.namaDesa || 'SUKAMAJU').toUpperCase()}`, ttdX, currentY);
  currentY += 15;

  // Cap Stempel Bulat
  pdf.setDrawColor(37, 99, 235);
  pdf.setLineWidth(0.4);
  pdf.circle(ttdX - 5, currentY - 6, 9.5);
  pdf.setFontSize(6);
  pdf.setTextColor(37, 99, 235);
  pdf.text('PEMERINTAH DESA', ttdX - 5, currentY - 8, { align: 'center' });
  pdf.text((profil.namaDesa || 'SUKAMAJU').toUpperCase(), ttdX - 5, currentY - 4.5, { align: 'center' });

  // TTD Nama
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(15, 23, 42);
  const kadesName = doc.penandatangan || profil.namaKades || 'H. Budi Santoso';
  pdf.text(kadesName, ttdX, currentY);
  currentY += 3.5;

  // Lembaran Footer
  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(0.3);
  pdf.line(margin, 280, pageWidth - margin, 280);
  pdf.setFontSize(7.5);
  pdf.setTextColor(148, 163, 184);
  pdf.text(
    `Dokumen Arsip Hukum Resmi Desa ${profil.namaDesa} &bull; Dicatat dalam Berita Desa Tahun ${doc.tahun || new Date().getFullYear()} &bull; Status: ${doc.status || 'Berlaku'}`,
    pageWidth / 2,
    284,
    { align: 'center' }
  );

  const dataUrl = pdf.output('dataurlstring');
  const blob = pdf.output('blob');

  return {
    dataUrl,
    blob,
    download: (customFilename?: string) => {
      const fileName =
        customFilename ||
        doc.namaBerkas ||
        `${(doc.jenis || 'ARSIP')}_${(doc.nomor || 'DOK').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(fileName);
    },
  };
}
