import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  FileSpreadsheet,
  FilePlus2,
  Edit2,
  Trash2,
  Eye,
  X,
  Check,
  UserCheck,
  Calendar,
  Home,
  Briefcase,
  IdCard,
  Camera,
  Zap,
  GraduationCap,
  LayoutGrid,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  MapPin,
  Heart,
  Baby,
} from 'lucide-react';
import { useDesa } from '../context/DesaContext';
import { Penduduk, JenisKelamin, Agama, StatusPerkawinan, StatusHubunganKeluarga } from '../types';
import { formatTanggalIndo, hitungUsia } from '../utils/formatters';
import { ScanKKModal } from './ScanKKModal';
import { FamilyDetailsModal } from './FamilyDetailsModal';
import { ImportExcelModal } from './ImportExcelModal';
import { StatistikPenduduk } from './StatistikPenduduk';
import {
  DUSUN_LIST,
  ALL_RWS,
  findDusunByRw,
  normalizeDusunName,
  normalizeRw,
  getRwsForDusun,
} from '../utils/dusunConfig';

export const PendudukView: React.FC = () => {
  const { penduduk, desaInfo, addPenduduk, addManyPenduduk, updatePenduduk, deletePenduduk, setActiveTab } = useDesa();

  // Layout View Mode: Column (Cards Grid) by default as requested: "buatkan seperti tampilan kolom kolom saja"
  const [viewMode, setViewMode] = useState<'kolom' | 'tabel'>('kolom');

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDukuh, setFilterDukuh] = useState('ALL');
  const [filterRw, setFilterRw] = useState('ALL');
  const [filterRt, setFilterRt] = useState('ALL');
  const [filterUmur, setFilterUmur] = useState('ALL');
  const [filterPekerjaan, setFilterPekerjaan] = useState('ALL');
  const [filterLulusan, setFilterLulusan] = useState('ALL');
  const [filterAgama, setFilterAgama] = useState('ALL');
  const [filterGender, setFilterGender] = useState('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Success Notification
  const [notification, setNotification] = useState<string | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScanKKOpen, setIsScanKKOpen] = useState(false);
  const [isImportExcelOpen, setIsImportExcelOpen] = useState(false);
  const [editingPenduduk, setEditingPenduduk] = useState<Penduduk | null>(null);
  const [familyModalResident, setFamilyModalResident] = useState<Penduduk | null>(null);

  // Form State for Add / Edit
  const initialFormData = {
    nik: '',
    noKk: '',
    nama: '',
    jenisKelamin: 'L' as JenisKelamin,
    tempatLahir: '',
    tanggalLahir: '1990-01-01',
    agama: 'Islam' as Agama,
    statusPerkawinan: 'Kawin' as StatusPerkawinan,
    pekerjaan: 'Wiraswasta',
    pendidikan: 'SMA / Sederajat',
    alamat: '',
    rt: '01',
    rw: '01',
    dusun: 'Dusun 1',
    statusKeluarga: 'Kepala Keluarga' as StatusHubunganKeluarga,
    kewarganegaraan: 'WNI',
    noHp: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formError, setFormError] = useState('');

  // Extract unique RTs from existing residents
  const availableRts = useMemo(() => {
    const set = new Set<string>();
    penduduk.forEach((p) => {
      if (p.rt) set.add(normalizeRw(p.rt));
    });
    // Add default RT 01 - 05 if empty
    ['01', '02', '03', '04', '05'].forEach((r) => set.add(r));
    return Array.from(set).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }, [penduduk]);

  // Extract unique jobs from existing residents
  const availableJobs = useMemo(() => {
    const set = new Set<string>();
    penduduk.forEach((p) => {
      if (p.pekerjaan && p.pekerjaan.trim()) {
        set.add(p.pekerjaan.trim());
      }
    });
    return Array.from(set).sort();
  }, [penduduk]);

  // Available RWs depending on chosen Dukuh / Dusun filter
  const availableFilterRws = useMemo(() => {
    if (filterDukuh === 'ALL') {
      return ALL_RWS;
    }
    return getRwsForDusun(filterDukuh);
  }, [filterDukuh]);

  // Handlers for Dukuh / RW filter changes
  const handleDukuhFilterChange = (newDukuh: string) => {
    setFilterDukuh(newDukuh);
    if (newDukuh !== 'ALL' && filterRw !== 'ALL') {
      const validRws = getRwsForDusun(newDukuh);
      if (!validRws.includes(filterRw)) {
        setFilterRw('ALL');
      }
    }
  };

  const handleRwFilterChange = (newRw: string) => {
    setFilterRw(newRw);
    if (newRw !== 'ALL' && filterDukuh === 'ALL') {
      const matched = findDusunByRw(newRw);
      if (matched) {
        setFilterDukuh(matched.name);
      }
    }
  };

  // Check if any filter is actively applied
  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm !== '' ||
      filterDukuh !== 'ALL' ||
      filterRw !== 'ALL' ||
      filterRt !== 'ALL' ||
      filterUmur !== 'ALL' ||
      filterPekerjaan !== 'ALL' ||
      filterLulusan !== 'ALL' ||
      filterAgama !== 'ALL' ||
      filterGender !== 'ALL'
    );
  }, [
    searchTerm,
    filterDukuh,
    filterRw,
    filterRt,
    filterUmur,
    filterPekerjaan,
    filterLulusan,
    filterAgama,
    filterGender,
  ]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterDukuh('ALL');
    setFilterRw('ALL');
    setFilterRt('ALL');
    setFilterUmur('ALL');
    setFilterPekerjaan('ALL');
    setFilterLulusan('ALL');
    setFilterAgama('ALL');
    setFilterGender('ALL');
  };

  // Map of all No KK to count of registered family members
  const familyCountMap = useMemo(() => {
    const map = new Map<string, number>();
    penduduk.forEach((p) => {
      if (p.noKk) {
        map.set(p.noKk, (map.get(p.noKk) || 0) + 1);
      }
    });
    return map;
  }, [penduduk]);

  // Filtered residents list
  const filteredPenduduk = useMemo(() => {
    return penduduk.filter((p) => {
      // 1. Text Search
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const matchText =
          p.nama.toLowerCase().includes(s) ||
          p.nik.includes(s) ||
          p.noKk.includes(s) ||
          p.alamat.toLowerCase().includes(s) ||
          p.pekerjaan.toLowerCase().includes(s) ||
          p.pendidikan.toLowerCase().includes(s);
        if (!matchText) return false;
      }

      // 2. Dukuh / Dusun Filter
      if (filterDukuh !== 'ALL') {
        const normItemDusun = normalizeDusunName(p.dusun);
        const normFilterDusun = normalizeDusunName(filterDukuh);
        if (normItemDusun !== normFilterDusun) {
          // Also check if p.rw belongs to this dusun
          const dusunObj = findDusunByRw(p.rw);
          if (!dusunObj || dusunObj.name !== normFilterDusun) {
            return false;
          }
        }
      }

      // 3. RW Filter
      if (filterRw !== 'ALL') {
        if (normalizeRw(p.rw) !== normalizeRw(filterRw)) {
          return false;
        }
      }

      // 4. RT Filter
      if (filterRt !== 'ALL') {
        if (normalizeRw(p.rt) !== normalizeRw(filterRt)) {
          return false;
        }
      }

      // 5. Umur Filter
      if (filterUmur !== 'ALL') {
        const usia = hitungUsia(p.tanggalLahir);
        if (filterUmur === 'balita' && !(usia >= 0 && usia <= 5)) return false;
        if (filterUmur === 'anak' && !(usia >= 6 && usia <= 12)) return false;
        if (filterUmur === 'remaja' && !(usia >= 13 && usia <= 17)) return false;
        if (filterUmur === 'produktif' && !(usia >= 18 && usia <= 59)) return false;
        if (filterUmur === 'lansia' && !(usia >= 60)) return false;
      }

      // 6. Pekerjaan Filter
      if (filterPekerjaan !== 'ALL') {
        if (!p.pekerjaan.toLowerCase().includes(filterPekerjaan.toLowerCase())) {
          return false;
        }
      }

      // 7. Lulusan / Pendidikan Filter
      if (filterLulusan !== 'ALL') {
        if (!p.pendidikan.toLowerCase().includes(filterLulusan.toLowerCase())) {
          return false;
        }
      }

      // 8. Agama Filter
      if (filterAgama !== 'ALL') {
        if (p.agama !== filterAgama) {
          return false;
        }
      }

      // 9. Gender Filter
      if (filterGender !== 'ALL') {
        if (p.jenisKelamin !== filterGender) {
          return false;
        }
      }

      return true;
    });
  }, [
    penduduk,
    searchTerm,
    filterDukuh,
    filterRw,
    filterRt,
    filterUmur,
    filterPekerjaan,
    filterLulusan,
    filterAgama,
    filterGender,
  ]);

  // Open Add Resident Modal
  const handleOpenAdd = () => {
    setFormData(initialFormData);
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Scan KK handler
  const handleApplyScannedResident = (scanned: Partial<Penduduk>) => {
    setFormData((prev) => ({
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
      dusun: scanned.dusun ? normalizeDusunName(scanned.dusun) : prev.dusun,
      statusKeluarga: scanned.statusKeluarga || prev.statusKeluarga,
      kewarganegaraan: scanned.kewarganegaraan || prev.kewarganegaraan,
    }));
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleImportAllFamily = (members: Omit<Penduduk, 'id' | 'createdAt'>[]) => {
    const result = addManyPenduduk(members);
    if (result.transferredCount > 0) {
      const transferDetails = result.transfers
        .map((t) => `${t.nama} (Pecah KK dari KK Bpk. ${t.oldKkHeadName})`)
        .join(', ');
      setNotification(
        `Otomatisasi KK Berhasil: ${result.addedCount} warga baru ditambahkan, ${result.transferredCount} warga Pecah KK [${transferDetails}]. Jumlah anggota di KK keluarga sebelumnya otomatis disesuaikan.`
      );
    } else if (result.joinedCount > 0) {
      const joinDetails = result.joinedFamily
        .map((j) => `${j.nama} (Masuk ke KK Bpk. ${j.kkHeadName})`)
        .join(', ');
      setNotification(
        `Otomatisasi KK Berhasil: ${result.joinedCount} anggota keluarga baru bergabung ke KK terdaftar [${joinDetails}].`
      );
    } else {
      setNotification(`Berhasil mengimpor ${result.totalProcessed} data keluarga dari Kartu Keluarga ke Master Data Penduduk.`);
    }
    setTimeout(() => setNotification(null), 8000);
  };

  // Open Edit Resident Modal
  const handleOpenEdit = (item: Penduduk) => {
    setEditingPenduduk(item);
    setFormData({
      nik: item.nik,
      noKk: item.noKk,
      nama: item.nama,
      jenisKelamin: item.jenisKelamin,
      tempatLahir: item.tempatLahir,
      tanggalLahir: item.tanggalLahir,
      agama: item.agama,
      statusPerkawinan: item.statusPerkawinan,
      pekerjaan: item.pekerjaan,
      pendidikan: item.pendidikan,
      alamat: item.alamat,
      rt: normalizeRw(item.rt),
      rw: normalizeRw(item.rw),
      dusun: normalizeDusunName(item.dusun),
      statusKeluarga: item.statusKeluarga,
      kewarganegaraan: item.kewarganegaraan,
      noHp: item.noHp || '',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Action: Add new member / child to existing KK
  const handleOpenAddMemberToKk = (familyBase: Penduduk) => {
    setEditingPenduduk(null);
    setFormData({
      nik: '',
      noKk: familyBase.noKk,
      nama: '',
      jenisKelamin: 'L',
      tempatLahir: desaInfo.namaDesa || 'Kabupaten',
      tanggalLahir: new Date().toISOString().split('T')[0],
      agama: familyBase.agama || 'Islam',
      statusPerkawinan: 'Belum Kawin',
      pekerjaan: 'Pelajar / Mahasiswa',
      pendidikan: 'Belum / Tidak Bekerja',
      alamat: familyBase.alamat,
      rt: normalizeRw(familyBase.rt),
      rw: normalizeRw(familyBase.rw),
      dusun: normalizeDusunName(familyBase.dusun),
      statusKeluarga: 'Anak',
      kewarganegaraan: 'WNI',
      noHp: '',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Action: Pecah KK (make new KK for a resident who got married)
  const handleOpenPecahKk = (resident: Penduduk) => {
    setEditingPenduduk(null);
    setFormData({
      nik: resident.nik,
      noKk: '', // Prompts operator to enter the new KK number
      nama: resident.nama,
      jenisKelamin: resident.jenisKelamin,
      tempatLahir: resident.tempatLahir,
      tanggalLahir: resident.tanggalLahir,
      agama: resident.agama,
      statusPerkawinan: 'Kawin',
      pekerjaan: resident.pekerjaan,
      pendidikan: resident.pendidikan,
      alamat: resident.alamat,
      rt: normalizeRw(resident.rt),
      rw: normalizeRw(resident.rw),
      dusun: normalizeDusunName(resident.dusun),
      statusKeluarga: 'Kepala Keluarga',
      kewarganegaraan: resident.kewarganegaraan,
      noHp: resident.noHp || '',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Form Dusun change -> update RW accordingly
  const handleFormDusunChange = (dusunName: string) => {
    const rws = getRwsForDusun(dusunName);
    const newRw = rws.includes(formData.rw) ? formData.rw : rws[0] || '01';
    setFormData((prev) => ({
      ...prev,
      dusun: dusunName,
      rw: newRw,
    }));
  };

  // Form RW change -> auto select Dusun if mapped
  const handleFormRwChange = (rwValue: string) => {
    const matched = findDusunByRw(rwValue);
    setFormData((prev) => ({
      ...prev,
      rw: normalizeRw(rwValue),
      dusun: matched ? matched.name : prev.dusun,
    }));
  };

  // Save Add / Edit
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nik || formData.nik.trim().length !== 16) {
      setFormError('Nomor Induk Kependudukan (NIK) harus terdiri dari 16 digit angka.');
      return;
    }
    if (!formData.noKk || formData.noKk.trim().length !== 16) {
      setFormError('Nomor Kartu Keluarga (KK) harus terdiri dari 16 digit angka.');
      return;
    }
    if (!formData.nama.trim()) {
      setFormError('Nama lengkap warga wajib diisi.');
      return;
    }

    if (editingPenduduk) {
      const oldKk = editingPenduduk.noKk;
      const isKkChanged = oldKk.trim() !== formData.noKk.trim();

      updatePenduduk(editingPenduduk.id, formData);
      setEditingPenduduk(null);
      setIsAddModalOpen(false);

      if (isKkChanged) {
        const oldHead =
          penduduk.find(
            (p) => p.noKk === oldKk && p.id !== editingPenduduk.id && p.statusKeluarga === 'Kepala Keluarga'
          )?.nama || 'Keluarga Sebelumnya';
        setNotification(
          `Data warga "${formData.nama}" diperbarui & dipindahkan ke KK ${formData.noKk}. Anggota di KK Bpk. ${oldHead} otomatis disesuaikan.`
        );
      } else {
        setNotification(`Data warga "${formData.nama}" berhasil diperbarui.`);
      }
      setTimeout(() => setNotification(null), 5000);
    } else {
      const existing = penduduk.find((p) => p.nik === formData.nik.trim());
      if (existing) {
        // NIK exists! If No KK changed -> Pecah KK!
        if (existing.noKk.trim() !== formData.noKk.trim()) {
          const oldHead =
            penduduk.find(
              (p) => p.noKk === existing.noKk && p.id !== existing.id && p.statusKeluarga === 'Kepala Keluarga'
            )?.nama || 'Keluarga Sebelumnya';
          addPenduduk(formData);
          setIsAddModalOpen(false);
          setNotification(
            `Pecah KK Berhasil! "${formData.nama}" otomatis dipindahkan ke KK baru (${formData.noKk}). Jumlah anggota di KK Bpk. ${oldHead} otomatis berkurang.`
          );
          setTimeout(() => setNotification(null), 6000);
          return;
        } else {
          // Same NIK and same KK -> update
          updatePenduduk(existing.id, formData);
          setIsAddModalOpen(false);
          setNotification(`Data warga "${formData.nama}" berhasil diperbarui.`);
          setTimeout(() => setNotification(null), 4000);
          return;
        }
      }

      // Brand new resident! Check if No KK belongs to an existing family
      const targetFamilyHead = penduduk.find(
        (p) => p.noKk === formData.noKk.trim() && p.statusKeluarga === 'Kepala Keluarga'
      );
      addPenduduk(formData);
      setIsAddModalOpen(false);
      if (targetFamilyHead) {
        setNotification(
          `Warga baru "${formData.nama}" berhasil ditambahkan dan otomatis masuk ke KK Bpk. ${targetFamilyHead.nama}.`
        );
      } else {
        setNotification(`Warga baru "${formData.nama}" berhasil ditambahkan ke database.`);
      }
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleDelete = (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data warga "${nama}"?`)) {
      deletePenduduk(id);
      if (familyModalResident?.id === id) {
        setFamilyModalResident(null);
      }
      setNotification(`Data warga "${nama}" telah dihapus.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Direct Navigate to Surat with resident pre-selected
  const handleSelectResidentForLetter = (res: Penduduk) => {
    sessionStorage.setItem('desa_target_penduduk_id', res.id);
    setActiveTab('surat');
  };

  // Excel Import Success Handler
  const handleExcelImportSuccess = (importedResidents: Omit<Penduduk, 'id' | 'createdAt'>[]) => {
    const result = addManyPenduduk(importedResidents);
    let msg = `Berhasil memproses ${result.totalProcessed} data dari Excel: ${result.addedCount} baru, ${result.updatedCount} diperbarui.`;
    if (result.transferredCount > 0) {
      const transferNames = result.transfers.map((t) => `${t.nama} (Pecah KK dari KK Bpk. ${t.oldKkHeadName})`).join(', ');
      msg += ` Terdeteksi ${result.transferredCount} warga Pecah KK [${transferNames}] dan anggota keluarga asal otomatis disesuaikan.`;
    }
    if (result.joinedCount > 0) {
      msg += ` ${result.joinedCount} warga/anak otomatis bergabung ke KK keluarganya.`;
    }
    setNotification(msg);
    setTimeout(() => setNotification(null), 8000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'NIK',
      'No KK',
      'Nama',
      'Jenis Kelamin',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Agama',
      'Status Kawin',
      'Pekerjaan',
      'Pendidikan',
      'Alamat',
      'RT',
      'RW',
      'Dusun',
      'Status Hubungan Keluarga',
      'Kewarganegaraan',
      'No HP',
    ];
    const rows = filteredPenduduk.map((p) => [
      `'${p.nik}`,
      `'${p.noKk}`,
      `"${p.nama.replace(/"/g, '""')}"`,
      p.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      `"${p.tempatLahir}"`,
      p.tanggalLahir,
      p.agama,
      p.statusPerkawinan,
      `"${p.pekerjaan}"`,
      `"${p.pendidikan}"`,
      `"${p.alamat.replace(/"/g, '""')}"`,
      p.rt,
      p.rw,
      p.dusun,
      p.statusKeluarga,
      p.kewarganegaraan,
      p.noHp || '-',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_penduduk_desa_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Kepala Keluarga':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Istri':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Anak':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Orang Tua':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Toast / Notification Banner */}
      {notification && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-xl shadow-md flex items-center justify-between text-xs sm:text-sm font-semibold animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                Data Kependudukan Desa
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Master data penduduk desa, kartu keluarga, dan integrasi surat pelayanan warga.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Import Excel, Scan KK, Ekspor, Tambah */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Toggle: Kolom vs Tabel */}
          <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('kolom')}
              className={`inline-flex items-center px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'kolom'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Kolom (Grid Cards)"
              id="btn-view-kolom"
            >
              <LayoutGrid className="w-3.5 h-3.5 mr-1.5" />
              Tampilan Kolom
            </button>
            <button
              type="button"
              onClick={() => setViewMode('tabel')}
              className={`inline-flex items-center px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'tabel'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Tabel"
              id="btn-view-tabel"
            >
              <TableIcon className="w-3.5 h-3.5 mr-1.5" />
              Tabel
            </button>
          </div>

          {/* Import dari Excel Button */}
          <button
            type="button"
            onClick={() => setIsImportExcelOpen(true)}
            className="inline-flex items-center px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            id="btn-import-excel-header"
            title="Import Data Penduduk dari file Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            Import Excel
          </button>

          {/* Scan KK Button */}
          <button
            type="button"
            onClick={() => setIsScanKKOpen(true)}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold border border-blue-200 shadow-xs active:scale-95 transition-all cursor-pointer"
            id="btn-scan-kk-header"
            title="Scan Kartu Keluarga Otomatis"
          >
            <Camera className="w-4 h-4 mr-1.5 text-blue-600" />
            Scan KK
          </button>

          {/* Ekspor CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-colors cursor-pointer"
            id="btn-export-penduduk-csv"
            title="Download CSV"
          >
            Ekspor CSV
          </button>

          {/* Tambah Penduduk */}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
            id="btn-tambah-penduduk"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Penduduk
          </button>
        </div>
      </div>

      {/* Statistik Demografi Kependudukan Warga */}
      <StatistikPenduduk
        penduduk={penduduk}
        onApplyFilter={(type, value) => {
          if (type === 'gender') {
            setFilterGender(value);
          } else if (type === 'dusun') {
            setFilterDukuh(value);
          } else if (type === 'umur') {
            if (value === 'ANAK') setFilterUmur('anak');
            else if (value === 'PRODUKTIF') setFilterUmur('produktif');
            else if (value === 'DEWASA' || value === 'LANSIA') setFilterUmur('lansia');
            else setFilterUmur('ALL');
          } else if (type === 'pekerjaan') {
            setFilterPekerjaan(value);
          } else if (type === 'lulusan') {
            setFilterLulusan(value);
          }
        }}
      />

      {/* Filter Section: Umur, Pekerjaan, Lulusan, Agama, RT, RW, Dukuh */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari NIK, Nama, No KK, Alamat, Pekerjaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              id="input-cari-penduduk"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Primary Filters: Dukuh, RW, Umur, Pekerjaan */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 flex-wrap">
            {/* Dukuh / Dusun Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Dukuh:</span>
              <select
                value={filterDukuh}
                onChange={(e) => handleDukuhFilterChange(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="filter-dukuh"
              >
                <option value="ALL">Semua Dukuh (Dusun)</option>
                {DUSUN_LIST.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* RW Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">RW:</span>
              <select
                value={filterRw}
                onChange={(e) => handleRwFilterChange(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="filter-rw"
              >
                <option value="ALL">Semua RW</option>
                {availableFilterRws.map((rw) => (
                  <option key={rw} value={rw}>
                    RW {rw}
                  </option>
                ))}
              </select>
            </div>

            {/* Umur Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Umur:</span>
              <select
                value={filterUmur}
                onChange={(e) => setFilterUmur(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="filter-umur"
              >
                <option value="ALL">Semua Umur</option>
                <option value="balita">Balita (0 - 5 thn)</option>
                <option value="anak">Anak-anak (6 - 12 thn)</option>
                <option value="remaja">Remaja (13 - 17 thn)</option>
                <option value="produktif">Usia Produktif (18 - 59 thn)</option>
                <option value="lansia">Lansia (≥ 60 thn)</option>
              </select>
            </div>

            {/* Pekerjaan Filter */}
            <div className="flex items-center space-x-1">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Pekerjaan:</span>
              <select
                value={filterPekerjaan}
                onChange={(e) => setFilterPekerjaan(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[150px] truncate"
                id="filter-pekerjaan"
              >
                <option value="ALL">Semua Pekerjaan</option>
                {availableJobs.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle Advanced Filters (Lulusan, Agama, RT, Gender) */}
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`inline-flex items-center px-2.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                showAdvancedFilters || filterLulusan !== 'ALL' || filterAgama !== 'ALL' || filterRt !== 'ALL' || filterGender !== 'ALL'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5 mr-1" />
              Filter Lanjutan
              {showAdvancedFilters ? (
                <ChevronUp className="w-3.5 h-3.5 ml-1" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              )}
            </button>
          </div>
        </div>

        {/* Secondary / Advanced Filters: Lulusan, Agama, RT, Gender */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs animate-in slide-in-from-top-1 duration-150">
            {/* Lulusan / Pendidikan */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Lulusan / Pendidikan:
              </label>
              <select
                value={filterLulusan}
                onChange={(e) => setFilterLulusan(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="filter-lulusan"
              >
                <option value="ALL">Semua Lulusan</option>
                <option value="Tidak / Belum Sekolah">Tidak / Belum Sekolah</option>
                <option value="SD">SD / Sederajat</option>
                <option value="SMP">SMP / Sederajat</option>
                <option value="SMA">SMA / Sederajat</option>
                <option value="Diploma">Diploma (D1 - D4)</option>
                <option value="S1">S1 / Sarjana</option>
                <option value="S2">S2 / Magister</option>
                <option value="S3">S3 / Doktor</option>
              </select>
            </div>

            {/* Agama */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Agama:
              </label>
              <select
                value={filterAgama}
                onChange={(e) => setFilterAgama(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="filter-agama"
              >
                <option value="ALL">Semua Agama</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* RT Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                RT:
              </label>
              <select
                value={filterRt}
                onChange={(e) => setFilterRt(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="filter-rt"
              >
                <option value="ALL">Semua RT</option>
                {availableRts.map((rt) => (
                  <option key={rt} value={rt}>
                    RT {rt}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Jenis Kelamin:
              </label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="filter-gender"
              >
                <option value="ALL">Semua Gender</option>
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>
          </div>
        )}

        {/* Active Filter Badges & Reset Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span>
              Menampilkan <strong className="text-slate-900">{filteredPenduduk.length}</strong> dari {penduduk.length} warga
            </span>

            {/* Filter tags */}
            {filterDukuh !== 'ALL' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
                Dukuh: {filterDukuh}
                <button onClick={() => setFilterDukuh('ALL')} className="ml-1 hover:text-blue-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterRw !== 'ALL' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
                RW {filterRw}
                <button onClick={() => setFilterRw('ALL')} className="ml-1 hover:text-blue-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterRt !== 'ALL' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
                RT {filterRt}
                <button onClick={() => setFilterRt('ALL')} className="ml-1 hover:text-blue-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterUmur !== 'ALL' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                Umur: {filterUmur}
                <button onClick={() => setFilterUmur('ALL')} className="ml-1 hover:text-emerald-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterPekerjaan !== 'ALL' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-semibold border border-purple-200">
                {filterPekerjaan}
                <button onClick={() => setFilterPekerjaan('ALL')} className="ml-1 hover:text-purple-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterLulusan !== 'ALL' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200">
                Lulusan: {filterLulusan}
                <button onClick={() => setFilterLulusan('ALL')} className="ml-1 hover:text-amber-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterAgama !== 'ALL' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                Agama: {filterAgama}
                <button onClick={() => setFilterAgama('ALL')} className="ml-1 hover:text-slate-900"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterGender !== 'ALL' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 text-[11px] font-semibold border border-pink-200">
                {filterGender === 'L' ? 'Laki-laki' : 'Perempuan'}
                <button onClick={() => setFilterGender('ALL')} className="ml-1 hover:text-pink-900"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Resident Content */}
      {filteredPenduduk.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-700 text-base">Tidak Ada Data Penduduk</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Tidak ditemukan warga dengan kriteria filter yang Anda tentukan. Silakan reset filter atau tambahkan data penduduk baru.
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset Filter
              </button>
            )}
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Tambah Warga
            </button>
          </div>
        </div>
      ) : viewMode === 'kolom' ? (
        /* ============================================================== */
        /* TAMPILAN KOLOM-KOLOM (Cards Grid with Columnar Structure)      */
        /* ============================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPenduduk.map((item) => {
            const familyCount = familyCountMap.get(item.noKk) || 1;
            const usia = hitungUsia(item.tanggalLahir);

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top: Avatar, Name, NIK, Status badge */}
                <div className="p-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start space-x-3 min-w-0">
                      {/* Avatar initial */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-xs ${
                          item.jenisKelamin === 'L'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-pink-100 text-pink-700'
                        }`}
                      >
                        {item.nama.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate group-hover:text-blue-600 transition-colors">
                          {item.nama}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                            NIK: {item.nik}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Family Badge */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex-shrink-0 ${getStatusBadgeColor(item.statusKeluarga)}`}>
                      {item.statusKeluarga}
                    </span>
                  </div>
                </div>

                {/* Card Middle: Structured Data Columns (Wilayah, Identitas, Sosial) */}
                <div className="p-4 space-y-3 flex-1 text-xs">
                  {/* Three-Column Data Grid */}
                  <div className="grid grid-cols-2 gap-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    {/* Kolom 1: Wilayah / Dukuh & RT/RW */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                        Wilayah / Dukuh
                      </span>
                      <div className="font-bold text-slate-800 text-xs">
                        {item.dusun}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        RT {item.rt} / RW {item.rw}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate" title={item.alamat}>
                        {item.alamat}
                      </div>
                    </div>

                    {/* Kolom 2: Pekerjaan & Pendidikan */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider flex items-center">
                        <Briefcase className="w-3 h-3 mr-1 text-slate-400" />
                        Pekerjaan & Lulusan
                      </span>
                      <div className="font-bold text-slate-800 text-xs truncate" title={item.pekerjaan}>
                        {item.pekerjaan}
                      </div>
                      <div className="text-[11px] text-slate-600 truncate" title={item.pendidikan}>
                        {item.pendidikan}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.agama} &bull; {item.statusPerkawinan}
                      </div>
                    </div>
                  </div>

                  {/* Summary Bar: JK, Usia & KK Info */}
                  <div className="flex items-center justify-between text-[11px] px-1 text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <span className={`w-2 h-2 rounded-full ${item.jenisKelamin === 'L' ? 'bg-blue-500' : 'bg-pink-500'}`} />
                      <span>{item.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                      <span>&bull;</span>
                      <span className="font-medium text-slate-800">{usia} tahun</span>
                    </div>

                    {/* Family Indicator */}
                    <div className="flex items-center space-x-1 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        KK: <strong className="text-slate-800">{familyCount}</strong> warga
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom / Actions Bar */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* TOMBOL RINCIAN (Memuat Anggota Keluarga Terkait) */}
                  <button
                    type="button"
                    onClick={() => setFamilyModalResident(item)}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
                    id={`btn-rincian-${item.id}`}
                    title="Buka Rincian Biodata dan Anggota Keluarga Terkait"
                  >
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    Rincian Keluarga
                  </button>

                  {/* Action Icons: Surat, Edit, Delete */}
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleSelectResidentForLetter(item)}
                      className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                      title="Buatkan Surat Resmi"
                    >
                      <FilePlus2 className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      Surat
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                      title="Edit Data"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.nama)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ============================================================== */
        /* TAMPILAN TABEL (Structured Columns Table)                      */
        /* ============================================================== */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Warga / NIK</th>
                  <th className="px-4 py-3.5">No. KK</th>
                  <th className="px-4 py-3.5">JK / Usia</th>
                  <th className="px-4 py-3.5">Pekerjaan & Lulusan</th>
                  <th className="px-4 py-3.5">Wilayah (Dukuh / RW / RT)</th>
                  <th className="px-4 py-3.5">Status KK</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPenduduk.map((item) => {
                  const familyCount = familyCountMap.get(item.noKk) || 1;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 text-sm">{item.nama}</div>
                        <div className="font-mono text-slate-500 text-[11px]">NIK: {item.nik}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-mono text-slate-700 font-medium">{item.noKk}</div>
                        <span className="text-[10px] text-slate-400">
                          {familyCount} anggota terdaftar
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">
                          {item.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {hitungUsia(item.tanggalLahir)} tahun
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800 truncate max-w-[150px]">{item.pekerjaan}</div>
                        <div className="text-slate-400 text-[11px] truncate max-w-[150px]">{item.pendidikan}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">{item.dusun}</div>
                        <div className="text-slate-500 text-[11px]">
                          RT {item.rt} / RW {item.rw}
                        </div>
                        <div className="text-slate-400 text-[10px] truncate max-w-[160px]">{item.alamat}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadgeColor(item.statusKeluarga)}`}>
                          {item.statusKeluarga}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* TOMBOL RINCIAN */}
                          <button
                            type="button"
                            onClick={() => setFamilyModalResident(item)}
                            className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs cursor-pointer"
                            title="Rincian Warga & Keluarga Terkait"
                            id={`btn-tabel-rincian-${item.id}`}
                          >
                            <Users className="w-3.5 h-3.5 mr-1" />
                            Rincian
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectResidentForLetter(item)}
                            className="inline-flex items-center px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                            title="Buatkan Surat"
                          >
                            <FilePlus2 className="w-3.5 h-3.5 mr-1 text-blue-600" />
                            Surat
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.nama)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Penduduk */}
      {(isAddModalOpen || editingPenduduk) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {editingPenduduk ? 'Edit Data Penduduk' : 'Tambah Data Penduduk Baru'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pastikan data kependudukan sesuai dengan Kartu Tanda Penduduk / Kartu Keluarga
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingPenduduk(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveForm} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Scan KK Quick Action Banner */}
              <div className="p-3 sm:p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Scan Kartu Keluarga (KK) Otomatis
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Pindai foto / berkas KK untuk mengisi formulir ini secara instan dengan AI.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScanKKOpen(true)}
                  className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap self-start sm:self-center"
                  id="btn-scan-kk-form"
                >
                  <Camera className="w-3.5 h-3.5 mr-1.5" />
                  Scan Dokumen KK
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {formError}
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
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {(() => {
                    if (!formData.nik || formData.nik.length < 16) return null;
                    const existing = penduduk.find((p) => p.nik === formData.nik);
                    if (!existing) return null;
                    if (editingPenduduk && editingPenduduk.id === existing.id) return null;
                    if (existing.noKk !== formData.noKk) {
                      const oldHead =
                        penduduk.find(
                          (p) => p.noKk === existing.noKk && p.statusKeluarga === 'Kepala Keluarga'
                        )?.nama || 'Keluarga Asal';
                      return (
                        <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
                          🔄 <strong>Deteksi Pecah KK:</strong> Warga <strong>{existing.nama}</strong> saat ini terdaftar di KK Bpk. {oldHead} ({existing.noKk}). Jika disimpan, warga akan dipindahkan ke KK ini dan jumlah anggota di KK Bpk. {oldHead} otomatis berkurang.
                        </div>
                      );
                    }
                    return (
                      <div className="mt-1.5 p-2 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-800">
                        ℹ️ NIK ini sudah terdaftar atas nama <strong>{existing.nama}</strong> di KK ini. Menyimpan akan memperbarui data yang ada.
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Kartu Keluarga (No. KK) *
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    required
                    placeholder="16 digit nomor KK"
                    value={formData.noKk}
                    onChange={(e) => setFormData({ ...formData, noKk: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  {(() => {
                    if (!formData.noKk || formData.noKk.length < 16) return null;
                    const familyMembers = penduduk.filter((p) => p.noKk === formData.noKk);
                    if (familyMembers.length === 0) {
                      return (
                        <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                          🆕 Nomor KK baru (belum ada warga lain terdaftar dengan nomor KK ini).
                        </div>
                      );
                    }
                    const kkHead = familyMembers.find((p) => p.statusKeluarga === 'Kepala Keluarga') || familyMembers[0];
                    return (
                      <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 flex items-center justify-between gap-2">
                        <div>
                          ✓ <strong>Terhubung ke KK Bpk. {kkHead.nama}</strong> ({familyMembers.length} anggota). Warga ini otomatis masuk ke KK ini.
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              alamat: kkHead.alamat,
                              rt: normalizeRw(kkHead.rt),
                              rw: normalizeRw(kkHead.rw),
                              dusun: normalizeDusunName(kkHead.dusun),
                            }));
                          }}
                          className="text-emerald-900 font-bold underline text-[10px] whitespace-nowrap cursor-pointer hover:text-emerald-700"
                        >
                          Samakan Alamat
                        </button>
                      </div>
                    );
                  })()}
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
                    placeholder="Nama lengkap warga..."
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={formData.jenisKelamin}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as JenisKelamin })}
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
                    placeholder="Kota / Kabupaten lahir"
                    value={formData.tempatLahir}
                    onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
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
                    value={formData.tanggalLahir}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Agama, Status Kawin, Status Keluarga */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Agama
                  </label>
                  <select
                    value={formData.agama}
                    onChange={(e) => setFormData({ ...formData, agama: e.target.value as Agama })}
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
                    value={formData.statusPerkawinan}
                    onChange={(e) => setFormData({ ...formData, statusPerkawinan: e.target.value as StatusPerkawinan })}
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
                    value={formData.statusKeluarga}
                    onChange={(e) => setFormData({ ...formData, statusKeluarga: e.target.value as StatusHubunganKeluarga })}
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

              {/* Pekerjaan & Pendidikan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pekerjaan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Wiraswasta, Petani, Guru"
                    value={formData.pekerjaan}
                    onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pendidikan Terakhir (Lulusan)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: SMA/Sederajat, S1, SMP"
                    value={formData.pendidikan}
                    onChange={(e) => setFormData({ ...formData, pendidikan: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Wilayah: Dusun 1-5, RW 1-29, RT, Alamat */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Dusun Dropdown with specified RW mapping */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dusun / Dukuh *
                  </label>
                  <select
                    value={formData.dusun}
                    onChange={(e) => handleFormDusunChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {DUSUN_LIST.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* RW Dropdown filtered to chosen Dusun */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    RW *
                  </label>
                  <select
                    value={normalizeRw(formData.rw)}
                    onChange={(e) => handleFormRwChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {getRwsForDusun(formData.dusun).map((rw) => (
                      <option key={rw} value={rw}>
                        RW {rw}
                      </option>
                    ))}
                  </select>
                </div>

                {/* RT Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    RT *
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="01"
                    value={formData.rt}
                    onChange={(e) => setFormData({ ...formData, rt: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Alamat Jalan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Jalan / Kampung
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kp. Babakan No. 12"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* No HP & Kewarganegaraan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. HP / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={formData.noHp}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kewarganegaraan
                  </label>
                  <input
                    type="text"
                    value={formData.kewarganegaraan}
                    onChange={(e) => setFormData({ ...formData, kewarganegaraan: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingPenduduk(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  {editingPenduduk ? 'Simpan Perubahan' : 'Tambahkan Penduduk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rincian Warga & Anggota Keluarga Terkait Modal */}
      <FamilyDetailsModal
        isOpen={Boolean(familyModalResident)}
        onClose={() => setFamilyModalResident(null)}
        resident={familyModalResident}
        onSelectResidentForLetter={handleSelectResidentForLetter}
        onOpenEditResident={handleOpenEdit}
        onAddMemberToKk={handleOpenAddMemberToKk}
        onPecahKkResident={handleOpenPecahKk}
      />

      {/* Import dari Excel Modal */}
      <ImportExcelModal
        isOpen={isImportExcelOpen}
        onClose={() => setIsImportExcelOpen(false)}
        onImportSuccess={handleExcelImportSuccess}
        existingNiks={new Set(penduduk.map((p) => p.nik))}
        existingPenduduk={penduduk}
      />

      {/* Scan KK Modal */}
      <ScanKKModal
        isOpen={isScanKKOpen}
        onClose={() => setIsScanKKOpen(false)}
        onApplyResident={handleApplyScannedResident}
        onImportAllFamily={handleImportAllFamily}
        existingPenduduk={penduduk}
        title="Scan Kartu Keluarga (Data Penduduk)"
        subtitle="Pindai KK untuk mengisi otomatis formulir warga atau langsung impor seluruh anggota keluarga ke Master Data."
      />
    </div>
  );
};
