import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  initialAdminUsers,
  initialArsipDokumen,
  initialDesaProfile,
  initialPenduduk,
  initialSuratDibuat,
  initialSuratKeluar,
  initialSuratMasuk,
} from '../data/initialData';
import {
  AdminRole,
  AdminUser,
  ArsipDokumen,
  BatchPendudukResult,
  DesaProfile,
  KkTransferInfo,
  MenuPermission,
  Penduduk,
  SuratDibuat,
  SuratKeluar,
  SuratMasuk,
} from '../types';

export const ROLE_DEFAULT_PERMISSIONS: Record<AdminRole, MenuPermission[]> = {
  SUPER_ADMIN: [
    'dashboard',
    'penduduk',
    'surat',
    'arsip',
    'surat-mk',
    'buat-surat-keluar',
    'pengaturan',
    'kelola-admin',
  ],
  OPERATOR_SURAT: ['dashboard', 'surat', 'buat-surat-keluar'],
  PETUGAS_PENDUDUK: ['dashboard', 'penduduk'],
  PENGELOLA_ARSIP: ['dashboard', 'arsip', 'surat-mk'],
  VIEWER: ['dashboard'],
};

interface DesaContextType {
  // Authentication & RBAC
  currentUser: AdminUser | null;
  adminUsers: AdminUser[];
  login: (username: string, password: string) => { success: boolean; error?: string };
  registerAdmin: (data: Omit<AdminUser, 'id' | 'createdAt' | 'lastLogin'>) => { success: boolean; error?: string };
  logout: () => void;
  addAdminUser: (data: Omit<AdminUser, 'id' | 'createdAt' | 'lastLogin'>) => AdminUser;
  updateAdminUser: (id: string, data: Partial<AdminUser>) => void;
  deleteAdminUser: (id: string) => { success: boolean; message: string };
  canAccess: (permission: MenuPermission) => boolean;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Desa Profile
  profile: DesaProfile;
  updateProfile: (data: Partial<DesaProfile>) => void;

  // Penduduk
  penduduk: Penduduk[];
  addPenduduk: (data: Omit<Penduduk, 'id' | 'createdAt'>) => Penduduk & {
    isUpdated?: boolean;
    isTransferred?: boolean;
    oldNoKk?: string;
  };
  addManyPenduduk: (dataList: Omit<Penduduk, 'id' | 'createdAt'>[]) => BatchPendudukResult;
  updatePenduduk: (id: string, data: Partial<Penduduk>) => void;
  deletePenduduk: (id: string) => void;
  getPendudukById: (id: string) => Penduduk | undefined;
  getFamilyByNoKk: (noKk: string) => Penduduk[];
  getKepalaKeluargaByNoKk: (noKk: string) => Penduduk | undefined;

  // Pelayanan Surat
  suratList: SuratDibuat[];
  createSurat: (suratData: Omit<SuratDibuat, 'id' | 'createdAt'>) => SuratDibuat;
  deleteSurat: (id: string) => void;
  selectedLetterForPrint: SuratDibuat | null;
  setSelectedLetterForPrint: (surat: SuratDibuat | null) => void;

  // Arsip Digital (Perdes, SK, Perkades)
  arsip: ArsipDokumen[];
  addArsip: (data: Omit<ArsipDokumen, 'id'>) => void;
  updateArsip: (id: string, data: Partial<ArsipDokumen>) => void;
  deleteArsip: (id: string) => void;

  // Surat Masuk & Keluar
  suratMasuk: SuratMasuk[];
  addSuratMasuk: (data: Omit<SuratMasuk, 'id'>) => void;
  updateSuratMasuk: (id: string, data: Partial<SuratMasuk>) => void;
  deleteSuratMasuk: (id: string) => void;

  suratKeluar: SuratKeluar[];
  addSuratKeluar: (data: Omit<SuratKeluar, 'id'>) => void;
  updateSuratKeluar: (id: string, data: Partial<SuratKeluar>) => void;
  deleteSuratKeluar: (id: string) => void;

  // Backup / Restore
  exportData: () => void;
  importData: (jsonData: string) => boolean;
  resetDefaultData: () => void;
}

const STORAGE_KEY = 'desa_digital_storage_v1';
const AUTH_KEY = 'desa_digital_auth_v1';

const DesaContext = createContext<DesaContextType | undefined>(undefined);

export const DesaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [profile, setProfile] = useState<DesaProfile>(initialDesaProfile);
  const [penduduk, setPenduduk] = useState<Penduduk[]>(initialPenduduk);
  const [suratList, setSuratList] = useState<SuratDibuat[]>(initialSuratDibuat);
  const [arsip, setArsip] = useState<ArsipDokumen[]>(initialArsipDokumen);
  const [suratMasuk, setSuratMasuk] = useState<SuratMasuk[]>(initialSuratMasuk);
  const [suratKeluar, setSuratKeluar] = useState<SuratKeluar[]>(initialSuratKeluar);
  const [selectedLetterForPrint, setSelectedLetterForPrint] = useState<SuratDibuat | null>(null);

  // Admin and Auth state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(initialAdminUsers);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) {
          const baseProfile = {
            ...initialDesaProfile,
            ...parsed.profile,
            kodeKlasifikasiSurat: parsed.profile.kodeKlasifikasiSurat || '045',
            kodeWilayah: parsed.profile.kodeWilayah || '33.10.23.2001',
            nomorUrutSuratMulai: parsed.profile.nomorUrutSuratMulai || 1,
            nomorUrutSuratSaatIni: parsed.profile.nomorUrutSuratSaatIni || parsed.profile.nomorUrutSuratMulai || 1,
          };
          if (parsed.profile.namaDesa === 'Sukamaju' || !parsed.profile.kabupaten || parsed.profile.kabupaten === 'Bogor') {
            setProfile({
              ...baseProfile,
              namaDesa: 'Jimbung',
              kecamatan: 'Kalikotes',
              kabupaten: 'Klaten',
              provinsi: 'Jawa Tengah',
              kodePos: '57451',
              alamatKantor: 'Jl. Raya Jimbung - Kalikotes No. 01, Kalikotes, Klaten',
              email: 'pemdes@jimbung.desa.id',
              website: 'https://jimbung.desa.id',
            });
          } else {
            setProfile(baseProfile);
          }
        }
        if (parsed.penduduk) setPenduduk(parsed.penduduk);
        if (parsed.suratList) setSuratList(parsed.suratList);
        if (parsed.arsip) setArsip(parsed.arsip);
        if (parsed.suratMasuk) setSuratMasuk(parsed.suratMasuk);
        if (parsed.suratKeluar) setSuratKeluar(parsed.suratKeluar);
        if (parsed.adminUsers && Array.isArray(parsed.adminUsers) && parsed.adminUsers.length > 0) {
          setAdminUsers(parsed.adminUsers);
        }
      }

      const sessionActive = sessionStorage.getItem('desa_session_active');
      const savedAuth = localStorage.getItem(AUTH_KEY);
      if (sessionActive === 'true' && savedAuth) {
        const userObj = JSON.parse(savedAuth);
        if (userObj && userObj.id) {
          setCurrentUser(userObj);
        }
      }
    } catch (e) {
      console.error('Failed to parse saved state from local storage', e);
    }
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    try {
      const dataToSave = {
        profile,
        penduduk,
        suratList,
        arsip,
        suratMasuk,
        suratKeluar,
        adminUsers,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to persist state in local storage', e);
    }
  }, [profile, penduduk, suratList, arsip, suratMasuk, suratKeluar, adminUsers]);

  // Sync auth state to local storage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    } catch (e) {
      console.error('Failed to sync auth state', e);
    }
  }, [currentUser]);

  // Authentication methods
  const login = (username: string, password: string): { success: boolean; error?: string } => {
    const cleanUsername = username.trim().toLowerCase();
    const user = adminUsers.find(
      (u) => u.username.toLowerCase() === cleanUsername && u.password === password
    );

    if (!user) {
      return { success: false, error: 'Username atau password yang dimasukkan salah.' };
    }

    if (!user.isActive) {
      return {
        success: false,
        error: 'Akun admin ini dinonaktifkan oleh Super Admin. Silakan hubungi Sekretaris Desa.',
      };
    }

    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem('desa_session_active', 'true');
    } catch (e) {
      // ignore
    }
    setCurrentUser(updatedUser);
    setAdminUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
    return { success: true };
  };

  const registerAdmin = (
    data: Omit<AdminUser, 'id' | 'createdAt' | 'lastLogin'>
  ): { success: boolean; error?: string } => {
    const cleanUsername = data.username.trim().toLowerCase();
    if (!cleanUsername) {
      return { success: false, error: 'Username wajib diisi.' };
    }
    if (adminUsers.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: `Username "${cleanUsername}" sudah digunakan oleh petugas lain.` };
    }

    const newUser: AdminUser = {
      ...data,
      username: cleanUsername,
      id: 'adm-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem('desa_session_active', 'true');
    } catch (e) {
      // ignore
    }
    setAdminUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    try {
      sessionStorage.removeItem('desa_session_active');
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
    localStorage.removeItem(AUTH_KEY);
    setActiveTab('dashboard');
  };

  const addAdminUser = (data: Omit<AdminUser, 'id' | 'createdAt' | 'lastLogin'>): AdminUser => {
    const cleanUsername = data.username.trim().toLowerCase();
    const newUser: AdminUser = {
      ...data,
      username: cleanUsername,
      id: 'adm-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      createdAt: new Date().toISOString(),
    };
    setAdminUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const updateAdminUser = (id: string, data: Partial<AdminUser>) => {
    setAdminUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...data };
          if (currentUser?.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  const deleteAdminUser = (id: string): { success: boolean; message: string } => {
    if (currentUser?.id === id) {
      return { success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.' };
    }
    const target = adminUsers.find((u) => u.id === id);
    if (!target) {
      return { success: false, message: 'Akun tidak ditemukan.' };
    }
    setAdminUsers((prev) => prev.filter((u) => u.id !== id));
    return { success: true, message: `Akun admin ${target.namaLengkap} berhasil dihapus.` };
  };

  const canAccess = (permission: MenuPermission): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN') return true;
    return currentUser.permissions.includes(permission);
  };

  const updateProfile = (data: Partial<DesaProfile>) => {
    setProfile((prev) => ({ ...prev, ...data }));
  };

  const getFamilyByNoKk = (noKk: string): Penduduk[] => {
    if (!noKk) return [];
    const cleanKk = noKk.trim();
    return penduduk.filter((p) => p.noKk.trim() === cleanKk);
  };

  const getKepalaKeluargaByNoKk = (noKk: string): Penduduk | undefined => {
    if (!noKk) return undefined;
    const cleanKk = noKk.trim();
    return (
      penduduk.find((p) => p.noKk.trim() === cleanKk && p.statusKeluarga === 'Kepala Keluarga') ||
      penduduk.find((p) => p.noKk.trim() === cleanKk)
    );
  };

  const addPenduduk = (
    data: Omit<Penduduk, 'id' | 'createdAt'>
  ): Penduduk & { isUpdated?: boolean; isTransferred?: boolean; oldNoKk?: string } => {
    const cleanNik = data.nik.trim();
    const cleanNoKk = data.noKk.trim();
    let resultCitizen: Penduduk & { isUpdated?: boolean; isTransferred?: boolean; oldNoKk?: string };

    setPenduduk((prev) => {
      const existingIndex = prev.findIndex((p) => p.nik.trim() === cleanNik);
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const isTransferred = existing.noKk.trim() !== cleanNoKk;
        const updated: Penduduk = {
          ...existing,
          ...data,
          nik: cleanNik,
          noKk: cleanNoKk,
          id: existing.id,
          createdAt: existing.createdAt,
        };
        resultCitizen = {
          ...updated,
          isUpdated: true,
          isTransferred,
          oldNoKk: isTransferred ? existing.noKk : undefined,
        };
        const next = [...prev];
        next[existingIndex] = updated;
        return next;
      }

      const newCitizen: Penduduk = {
        ...data,
        nik: cleanNik,
        noKk: cleanNoKk,
        id: 'pdd-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        createdAt: new Date().toISOString(),
      };
      resultCitizen = {
        ...newCitizen,
        isUpdated: false,
        isTransferred: false,
      };
      return [newCitizen, ...prev];
    });

    return resultCitizen!;
  };

  const addManyPenduduk = (
    dataList: Omit<Penduduk, 'id' | 'createdAt'>[]
  ): BatchPendudukResult => {
    let result: BatchPendudukResult = {
      totalProcessed: dataList.length,
      addedCount: 0,
      updatedCount: 0,
      transferredCount: 0,
      transfers: [],
      joinedCount: 0,
      joinedFamily: [],
    };

    setPenduduk((prev) => {
      const updatedMap = new Map<string, Penduduk>(prev.map((p) => [p.nik.trim(), p]));
      const existingKkHeads = new Map<string, string>(); // noKk -> head name
      prev.forEach((p) => {
        const k = p.noKk.trim();
        if (p.statusKeluarga === 'Kepala Keluarga' || !existingKkHeads.has(k)) {
          existingKkHeads.set(k, p.nama);
        }
      });

      const newCitizens: Penduduk[] = [];
      const transfers: KkTransferInfo[] = [];
      const joinedFamily: Array<{ nama: string; nik: string; noKk: string; headName: string }> = [];
      let added = 0;
      let updated = 0;
      let transferred = 0;
      let joined = 0;

      dataList.forEach((data, index) => {
        const cleanNik = data.nik.trim();
        const cleanNoKk = data.noKk.trim();

        if (updatedMap.has(cleanNik)) {
          // Resident already exists in database
          const existing = updatedMap.get(cleanNik)!;
          const isKkTransfer = existing.noKk.trim() !== cleanNoKk;

          if (isKkTransfer) {
            transferred++;
            const oldKkHead = existingKkHeads.get(existing.noKk.trim()) || 'Keluarga Sebelumnya';
            transfers.push({
              nama: data.nama,
              nik: cleanNik,
              oldNoKk: existing.noKk,
              newNoKk: cleanNoKk,
              oldKkHeadName: oldKkHead,
              newStatusKeluarga: data.statusKeluarga,
            });
          }

          const updatedResident: Penduduk = {
            ...existing,
            ...data,
            nik: cleanNik,
            noKk: cleanNoKk,
            id: existing.id,
            createdAt: existing.createdAt,
          };
          updatedMap.set(cleanNik, updatedResident);
          updated++;
        } else {
          // Resident is brand new to the database
          // Check if noKk belongs to an existing family
          const existingHead = existingKkHeads.get(cleanNoKk);
          if (existingHead) {
            joined++;
            joinedFamily.push({
              nama: data.nama,
              nik: cleanNik,
              noKk: cleanNoKk,
              headName: existingHead,
            });
          }

          const newCitizen: Penduduk = {
            ...data,
            nik: cleanNik,
            noKk: cleanNoKk,
            id: 'pdd-' + (Date.now() + index).toString(36) + Math.random().toString(36).substring(2, 6),
            createdAt: new Date().toISOString(),
          };
          updatedMap.set(cleanNik, newCitizen);
          newCitizens.push(newCitizen);
          added++;
        }
      });

      result = {
        totalProcessed: dataList.length,
        addedCount: added,
        updatedCount: updated,
        transferredCount: transferred,
        transfers,
        joinedCount: joined,
        joinedFamily,
      };

      // Reassemble array: preserve order of existing, prepend brand new
      const nextList: Penduduk[] = [];
      newCitizens.forEach((c) => nextList.push(c));
      prev.forEach((oldP) => {
        const current = updatedMap.get(oldP.nik.trim());
        if (current) {
          nextList.push(current);
          updatedMap.delete(oldP.nik.trim());
        }
      });
      return nextList;
    });

    return result;
  };

  const updatePenduduk = (id: string, data: Partial<Penduduk>) => {
    setPenduduk((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
  };

  const deletePenduduk = (id: string) => {
    setPenduduk((prev) => prev.filter((item) => item.id !== id));
  };

  const getPendudukById = (id: string) => {
    return penduduk.find((p) => p.id === id);
  };

  const createSurat = (
    suratData: Omit<SuratDibuat, 'id' | 'createdAt'>
  ): SuratDibuat => {
    const newLetter: SuratDibuat = {
      ...suratData,
      id: 'srt-' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
    };

    setSuratList((prev) => [newLetter, ...prev]);

    // Automatically advance sequence counter for next letter so any operator gets the next number!
    const numMatch = newLetter.nomorSurat.match(/(?:^|\/)\s*(\d+)\s*\//);
    const parsedNum = numMatch ? parseInt(numMatch[1], 10) : null;
    setProfile((prev) => {
      const cur = prev.nomorUrutSuratSaatIni || prev.nomorUrutSuratMulai || 1;
      const nextVal = (parsedNum && !isNaN(parsedNum)) ? Math.max(parsedNum + 1, cur + 1) : cur + 1;
      return {
        ...prev,
        nomorUrutSuratSaatIni: nextVal,
      };
    });

    // Automatically record in Surat Keluar registry!
    const nextOutSeq = suratKeluar.length + 1;
    const defaultAgendaOut = `${String(nextOutSeq).padStart(3, '0')}/AG-OUT/${new Date().getFullYear()}`;
    const newSuratKeluar: SuratKeluar = {
      id: 'sk-' + Date.now().toString(36),
      nomorAgenda: defaultAgendaOut,
      nomorSurat: newLetter.nomorSurat,
      tanggalSurat: newLetter.tanggalSurat,
      penerima: newLetter.namaPenduduk,
      perihal: `${newLetter.judulSurat} an. ${newLetter.namaPenduduk}`,
      penandatangan: `${newLetter.penandatangan === 'Kepala Desa' ? profile.namaKades : profile.namaSekdes} (${newLetter.penandatangan})`,
      sifatSurat: 'Biasa',
      keterangan: `Diterbitkan via Generator Surat Online (${newLetter.tipeSurat})`,
      idSuratDibuatRef: newLetter.id,
    };
    setSuratKeluar((prev) => [newSuratKeluar, ...prev]);

    return newLetter;
  };

  const deleteSurat = (id: string) => {
    setSuratList((prev) => prev.filter((s) => s.id !== id));
    setSuratKeluar((prev) => prev.filter((sk) => sk.idSuratDibuatRef !== id));
    if (selectedLetterForPrint?.id === id) {
      setSelectedLetterForPrint(null);
    }
  };

  const addArsip = (data: Omit<ArsipDokumen, 'id'>) => {
    const newDoc: ArsipDokumen = {
      ...data,
      id: 'ars-' + Date.now().toString(36),
    };
    setArsip((prev) => [newDoc, ...prev]);
  };

  const updateArsip = (id: string, data: Partial<ArsipDokumen>) => {
    setArsip((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
  };

  const deleteArsip = (id: string) => {
    setArsip((prev) => prev.filter((item) => item.id !== id));
  };

  const addSuratMasuk = (data: Omit<SuratMasuk, 'id'>) => {
    const nextSeq = suratMasuk.length + 1;
    const defaultAgenda = `${String(nextSeq).padStart(3, '0')}/AG-IN/${new Date().getFullYear()}`;
    const newDoc: SuratMasuk = {
      ...data,
      nomorAgenda: data.nomorAgenda?.trim() || defaultAgenda,
      id: 'sm-' + Date.now().toString(36),
    };
    setSuratMasuk((prev) => [newDoc, ...prev]);
  };

  const updateSuratMasuk = (id: string, data: Partial<SuratMasuk>) => {
    setSuratMasuk((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
  };

  const deleteSuratMasuk = (id: string) => {
    setSuratMasuk((prev) => prev.filter((item) => item.id !== id));
  };

  const addSuratKeluar = (data: Omit<SuratKeluar, 'id'>) => {
    const nextSeq = suratKeluar.length + 1;
    const defaultAgenda = `${String(nextSeq).padStart(3, '0')}/AG-OUT/${new Date().getFullYear()}`;
    const newDoc: SuratKeluar = {
      ...data,
      nomorAgenda: data.nomorAgenda?.trim() || defaultAgenda,
      id: 'sk-' + Date.now().toString(36),
    };
    setSuratKeluar((prev) => [newDoc, ...prev]);
  };

  const updateSuratKeluar = (id: string, data: Partial<SuratKeluar>) => {
    setSuratKeluar((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data } : item))
    );
  };

  const deleteSuratKeluar = (id: string) => {
    setSuratKeluar((prev) => prev.filter((item) => item.id !== id));
  };

  const exportData = () => {
    const exportPayload = {
      exportDate: new Date().toISOString(),
      appName: 'Desa Digital',
      version: '1.0.0',
      data: {
        profile,
        penduduk,
        suratList,
        arsip,
        suratMasuk,
        suratKeluar,
        adminUsers,
      },
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_desa_digital_${profile.namaDesa.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      const data = parsed.data || parsed;
      if (data.profile) setProfile(data.profile);
      if (data.penduduk && Array.isArray(data.penduduk)) setPenduduk(data.penduduk);
      if (data.suratList && Array.isArray(data.suratList)) setSuratList(data.suratList);
      if (data.arsip && Array.isArray(data.arsip)) setArsip(data.arsip);
      if (data.suratMasuk && Array.isArray(data.suratMasuk)) setSuratMasuk(data.suratMasuk);
      if (data.suratKeluar && Array.isArray(data.suratKeluar)) setSuratKeluar(data.suratKeluar);
      if (data.adminUsers && Array.isArray(data.adminUsers)) setAdminUsers(data.adminUsers);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const resetDefaultData = () => {
    setProfile(initialDesaProfile);
    setPenduduk(initialPenduduk);
    setSuratList(initialSuratDibuat);
    setArsip(initialArsipDokumen);
    setSuratMasuk(initialSuratMasuk);
    setSuratKeluar(initialSuratKeluar);
    setAdminUsers(initialAdminUsers);
    setSelectedLetterForPrint(null);
  };

  return (
    <DesaContext.Provider
      value={{
        currentUser,
        adminUsers,
        login,
        registerAdmin,
        logout,
        addAdminUser,
        updateAdminUser,
        deleteAdminUser,
        canAccess,
        activeTab,
        setActiveTab,
        profile,
        updateProfile,
        penduduk,
        addPenduduk,
        addManyPenduduk,
        updatePenduduk,
        deletePenduduk,
        getPendudukById,
        getFamilyByNoKk,
        getKepalaKeluargaByNoKk,
        suratList,
        createSurat,
        deleteSurat,
        selectedLetterForPrint,
        setSelectedLetterForPrint,
        arsip,
        addArsip,
        updateArsip,
        deleteArsip,
        suratMasuk,
        addSuratMasuk,
        updateSuratMasuk,
        deleteSuratMasuk,
        suratKeluar,
        addSuratKeluar,
        updateSuratKeluar,
        deleteSuratKeluar,
        exportData,
        importData,
        resetDefaultData,
      }}
    >
      {children}
    </DesaContext.Provider>
  );
};

export const useDesa = () => {
  const context = useContext(DesaContext);
  if (!context) {
    throw new Error('useDesa must be used within a DesaProvider');
  }
  return context;
};
