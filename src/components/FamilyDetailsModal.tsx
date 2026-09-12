import React, { useMemo, useState } from 'react';
import {
  X,
  Users,
  IdCard,
  Home,
  Briefcase,
  GraduationCap,
  Calendar,
  Phone,
  FilePlus2,
  CheckCircle2,
  Heart,
  Baby,
  UserCheck,
  UserPlus,
  GitBranch,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Penduduk } from '../types';
import { formatTanggalIndo, hitungUsia } from '../utils/formatters';
import { useDesa } from '../context/DesaContext';

interface FamilyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: Penduduk | null;
  onSelectResidentForLetter?: (resident: Penduduk) => void;
  onOpenEditResident?: (resident: Penduduk) => void;
  onAddMemberToKk?: (familyBase: Penduduk) => void;
  onPecahKkResident?: (resident: Penduduk) => void;
}

export const FamilyDetailsModal: React.FC<FamilyDetailsModalProps> = ({
  isOpen,
  onClose,
  resident,
  onSelectResidentForLetter,
  onOpenEditResident,
  onAddMemberToKk,
  onPecahKkResident,
}) => {
  const { penduduk, setActiveTab } = useDesa();
  const [activeResidentId, setActiveResidentId] = useState<string | null>(null);

  // Keep track of which resident is currently focused in the modal (default to prop resident)
  const currentResident = useMemo(() => {
    if (activeResidentId) {
      const found = penduduk.find((p) => p.id === activeResidentId);
      if (found) return found;
    }
    return resident;
  }, [activeResidentId, resident, penduduk]);

  // Find all family members sharing the same noKk
  const familyMembers = useMemo(() => {
    if (!currentResident?.noKk) return [];
    return penduduk.filter((p) => p.noKk === currentResident.noKk);
  }, [penduduk, currentResident]);

  // Sort family members logically: Kepala Keluarga first, then Istri, then Anak, then others
  const sortedFamilyMembers = useMemo(() => {
    const order: Record<string, number> = {
      'Kepala Keluarga': 1,
      Istri: 2,
      Anak: 3,
      'Orang Tua': 4,
      'Famili Lain': 5,
    };
    return [...familyMembers].sort((a, b) => {
      const orderA = order[a.statusKeluarga] || 99;
      const orderB = order[b.statusKeluarga] || 99;
      if (orderA !== orderB) return orderA - orderB;
      // then by age descending
      return new Date(a.tanggalLahir).getTime() - new Date(b.tanggalLahir).getTime();
    });
  }, [familyMembers]);

  if (!isOpen || !currentResident) return null;

  const handleBuatSurat = (target: Penduduk) => {
    if (onSelectResidentForLetter) {
      onSelectResidentForLetter(target);
    } else {
      sessionStorage.setItem('desa_target_penduduk_id', target.id);
      setActiveTab('surat');
    }
    onClose();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Kepala Keluarga':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Istri':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Anak':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Orang Tua':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-200 flex-shrink-0 shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {currentResident.nama}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeColor(currentResident.statusKeluarga)}`}>
                  {currentResident.statusKeluarga}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${currentResident.jenisKelamin === 'L' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' : 'bg-pink-500/20 text-pink-300 border border-pink-400/30'}`}>
                  {currentResident.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} &bull; {hitungUsia(currentResident.tanggalLahir)} Thn
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>NIK: <strong className="font-mono text-white">{currentResident.nik}</strong></span>
                <span>&bull;</span>
                <span>No. KK: <strong className="font-mono text-white">{currentResident.noKk}</strong></span>
                <span>&bull;</span>
                <span>{currentResident.dusun}, RT {currentResident.rt} / RW {currentResident.rw}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            id="btn-close-family-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 bg-slate-50/50">
          {/* Section 1: Kartu Keluarga Summary & Family Tree / Members List */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <Users className="w-4 h-4 text-blue-600 mr-1.5" />
                    Anggota Keluarga Terkait (Kartu Keluarga)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {sortedFamilyMembers.length} Terdaftar
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seluruh warga yang memiliki Nomor Kartu Keluarga sama ({currentResident.noKk})
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {onAddMemberToKk && (
                  <button
                    type="button"
                    onClick={() => {
                      onAddMemberToKk(currentResident);
                      onClose();
                    }}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
                    id="btn-tambah-anggota-kk"
                    title="Tambah anak atau anggota baru ke dalam Kartu Keluarga ini"
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    + Tambah Anggota / Anak
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleBuatSurat(currentResident)}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
                  id="btn-modal-buat-surat-current"
                >
                  <FilePlus2 className="w-3.5 h-3.5 mr-1.5" />
                  Buat Surat Warga Ini
                </button>
              </div>
            </div>

            {/* List of Family Members */}
            {sortedFamilyMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sortedFamilyMembers.map((fam) => {
                  const isCurrent = fam.id === currentResident.id;
                  return (
                    <div
                      key={fam.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-400/20 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {fam.nama}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                                Sedang Dilihat
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-slate-500 text-[11px] mt-0.5">
                            NIK: {fam.nik}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex-shrink-0 ${getStatusBadgeColor(fam.statusKeluarga)}`}>
                          {fam.statusKeluarga}
                        </span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100/80 grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Gender / Usia:</span>
                          <span className="font-medium text-slate-800">
                            {fam.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} ({hitungUsia(fam.tanggalLahir)} thn)
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Pekerjaan:</span>
                          <span className="font-medium text-slate-800 truncate block" title={fam.pekerjaan}>
                            {fam.pekerjaan}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Pendidikan:</span>
                          <span className="font-medium text-slate-800 truncate block">
                            {fam.pendidikan}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Agama:</span>
                          <span className="font-medium text-slate-800">
                            {fam.agama}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs gap-1">
                        {!isCurrent ? (
                          <button
                            type="button"
                            onClick={() => setActiveResidentId(fam.id)}
                            className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center text-[11px] cursor-pointer"
                          >
                            Lihat Biodata
                            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Warga Terpilih</span>
                        )}

                        <div className="flex items-center space-x-1.5">
                          {onPecahKkResident && (
                            <button
                              type="button"
                              onClick={() => {
                                onPecahKkResident(fam);
                                onClose();
                              }}
                              className="inline-flex items-center px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-semibold transition-colors cursor-pointer"
                              title={`Pecah KK untuk ${fam.nama} (misal: jika sudah menikah dan membuat KK baru)`}
                            >
                              <GitBranch className="w-3 h-3 mr-1 text-amber-600" />
                              Pecah KK
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleBuatSurat(fam)}
                            className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer"
                            title={`Buatkan surat untuk ${fam.nama}`}
                          >
                            <FilePlus2 className="w-3 h-3 mr-1" />
                            Surat
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>
                  Belum ada anggota keluarga lain yang terdaftar dengan No. KK ini di sistem. Anda dapat memindai KK fisik atau menambah data warga baru.
                </span>
              </div>
            )}
          </div>

          {/* Section 2: Detailed Biodata of Current Resident */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <IdCard className="w-4 h-4 text-blue-600 mr-1.5" />
                Biodata Rinci: {currentResident.nama}
              </h3>
              {onOpenEditResident && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEditResident(currentResident);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Edit Data Warga
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">NIK (KTP)</span>
                <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{currentResident.nik}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Nomor Kartu Keluarga (KK)</span>
                <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{currentResident.noKk}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Hubungan Keluarga</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{currentResident.statusKeluarga}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Tempat, Tanggal Lahir</span>
                <span className="font-medium text-slate-800 mt-0.5 block">
                  {currentResident.tempatLahir}, {formatTanggalIndo(currentResident.tanggalLahir)} ({hitungUsia(currentResident.tanggalLahir)} tahun)
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Jenis Kelamin</span>
                <span className="font-medium text-slate-800 mt-0.5 block">
                  {currentResident.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Agama</span>
                <span className="font-medium text-slate-800 mt-0.5 block">{currentResident.agama}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Status Perkawinan</span>
                <span className="font-medium text-slate-800 mt-0.5 block">{currentResident.statusPerkawinan}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Pekerjaan</span>
                <span className="font-medium text-slate-800 mt-0.5 block">{currentResident.pekerjaan}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Pendidikan Terakhir</span>
                <span className="font-medium text-slate-800 mt-0.5 block">{currentResident.pendidikan}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Alamat Lengkap</span>
                <span className="font-medium text-slate-800 mt-0.5 block">
                  {currentResident.alamat}, RT {currentResident.rt} / RW {currentResident.rw}, {currentResident.dusun}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">No. HP / WhatsApp</span>
                <span className="font-medium text-slate-800 mt-0.5 block">
                  {currentResident.noHp || '- (Belum ada)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Total <strong className="text-slate-800">{sortedFamilyMembers.length}</strong> anggota keluarga pada KK No. <span className="font-mono">{currentResident.noKk}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            id="btn-close-family-modal-footer"
          >
            Tutup Rincian
          </button>
        </div>
      </div>
    </div>
  );
};
