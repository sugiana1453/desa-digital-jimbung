import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  KeyRound,
  Users,
  ShieldAlert,
  Lock,
  Mail,
  Phone,
  Briefcase,
  User,
  Check,
  AlertTriangle,
  X,
  Sparkles,
} from 'lucide-react';
import { useDesa, ROLE_DEFAULT_PERMISSIONS } from '../context/DesaContext';
import { AdminRole, AdminUser, MenuPermission } from '../types';
import { formatHariTanggalIndo } from '../utils/formatters';

const ALL_PERMISSIONS: { id: MenuPermission; label: string; desc: string }[] = [
  { id: 'dashboard', label: 'Dashboard Desa', desc: 'Melihat ringkasan statistik & aktivitas desa' },
  { id: 'penduduk', label: 'Data Penduduk', desc: 'Kelola buku induk penduduk, mutasi & scan KK' },
  { id: 'surat', label: 'Pelayanan Surat', desc: 'Pembuatan surat warga & rekapitulasi mutasi' },
  { id: 'arsip', label: 'Arsip Perdes & SK', desc: 'Penyimpanan & scan AI berkas hukum desa' },
  { id: 'surat-mk', label: 'Surat Masuk/Keluar', desc: 'Agenda pencatatan surat dinas desa' },
  { id: 'buat-surat-keluar', label: 'Buat Surat Keluar', desc: 'Editor dan pembuatan surat dinas keluar' },
  { id: 'pengaturan', label: 'Profil & Pengaturan', desc: 'Kop desa, logo, tanda tangan & operator' },
  { id: 'kelola-admin', label: 'Kelola Akun Admin', desc: 'Menambah, mengedit & mengatur hak akses staf' },
];

export const KelolaAdminView: React.FC = () => {
  const { currentUser, adminUsers, addAdminUser, updateAdminUser, deleteAdminUser, canAccess } =
    useDesa();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form states
  const [formNama, setFormNama] = useState('');
  const [formJabatan, setFormJabatan] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formNoHp, setFormNoHp] = useState('');
  const [formRole, setFormRole] = useState<AdminRole>('OPERATOR_SURAT');
  const [formPermissions, setFormPermissions] = useState<MenuPermission[]>(
    ROLE_DEFAULT_PERMISSIONS['OPERATOR_SURAT']
  );
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Delete modal state
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  // Check access permission
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const hasAccess = canAccess('kelola-admin') || isSuperAdmin;

  const filteredUsers = useMemo(() => {
    return adminUsers.filter((u) => {
      const matchSearch =
        u.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && u.isActive) ||
        (statusFilter === 'INACTIVE' && !u.isActive);

      return matchSearch && matchRole && matchStatus;
    });
  }, [adminUsers, searchQuery, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = adminUsers.length;
    const superAdmin = adminUsers.filter((u) => u.role === 'SUPER_ADMIN').length;
    const active = adminUsers.filter((u) => u.isActive).length;
    const inactive = adminUsers.filter((u) => !u.isActive).length;
    return { total, superAdmin, active, inactive };
  }, [adminUsers]);

  const handleOpenAddModal = () => {
    setModalMode('ADD');
    setEditingUserId(null);
    setFormNama('');
    setFormJabatan('Operator Pelayanan Desa');
    setFormUsername('');
    setFormPassword('');
    setFormEmail('');
    setFormNoHp('');
    setFormRole('OPERATOR_SURAT');
    setFormPermissions(ROLE_DEFAULT_PERMISSIONS['OPERATOR_SURAT']);
    setFormIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: AdminUser) => {
    setModalMode('EDIT');
    setEditingUserId(user.id);
    setFormNama(user.namaLengkap);
    setFormJabatan(user.jabatan);
    setFormUsername(user.username);
    setFormPassword(''); // leave blank if unchanged
    setFormEmail(user.email || '');
    setFormNoHp(user.noHp || '');
    setFormRole(user.role);
    setFormPermissions(user.permissions);
    setFormIsActive(user.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleRoleChange = (newRole: AdminRole) => {
    setFormRole(newRole);
    // Apply recommended preset permissions for this role
    setFormPermissions(ROLE_DEFAULT_PERMISSIONS[newRole] || ['dashboard']);
  };

  const handleTogglePermission = (permId: MenuPermission) => {
    if (formPermissions.includes(permId)) {
      setFormPermissions(formPermissions.filter((p) => p !== permId));
    } else {
      setFormPermissions([...formPermissions, permId]);
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanUsername = formUsername.trim().toLowerCase();
    if (!cleanUsername) {
      setFormError('Username wajib diisi.');
      return;
    }

    if (modalMode === 'ADD') {
      if (adminUsers.some((u) => u.username.toLowerCase() === cleanUsername)) {
        setFormError(`Username "${cleanUsername}" sudah digunakan.`);
        return;
      }
      if (!formPassword || formPassword.length < 5) {
        setFormError('Password minimal 5 karakter untuk akun baru.');
        return;
      }

      addAdminUser({
        username: cleanUsername,
        password: formPassword,
        namaLengkap: formNama.trim(),
        jabatan: formJabatan.trim(),
        email: formEmail.trim() || undefined,
        noHp: formNoHp.trim() || undefined,
        role: formRole,
        permissions: formPermissions,
        isActive: formIsActive,
      });

      setNotification({
        type: 'success',
        message: `Akun admin baru "${cleanUsername}" berhasil ditambahkan.`,
      });
    } else if (modalMode === 'EDIT' && editingUserId) {
      const existingWithSameName = adminUsers.find(
        (u) => u.username.toLowerCase() === cleanUsername && u.id !== editingUserId
      );
      if (existingWithSameName) {
        setFormError(`Username "${cleanUsername}" sudah dipakai akun lain.`);
        return;
      }

      const updatePayload: Partial<AdminUser> = {
        username: cleanUsername,
        namaLengkap: formNama.trim(),
        jabatan: formJabatan.trim(),
        email: formEmail.trim() || undefined,
        noHp: formNoHp.trim() || undefined,
        role: formRole,
        permissions: formPermissions,
        isActive: formIsActive,
      };

      if (formPassword && formPassword.trim().length > 0) {
        if (formPassword.length < 5) {
          setFormError('Password baru minimal harus 5 karakter.');
          return;
        }
        updatePayload.password = formPassword;
      }

      updateAdminUser(editingUserId, updatePayload);
      setNotification({
        type: 'success',
        message: `Perubahan akun "${cleanUsername}" berhasil disimpan.`,
      });
    }

    setIsModalOpen(false);
  };

  const handleToggleActive = (user: AdminUser) => {
    if (user.id === currentUser?.id) {
      alert('Anda tidak dapat menonaktifkan akun yang sedang Anda gunakan.');
      return;
    }
    updateAdminUser(user.id, { isActive: !user.isActive });
    setNotification({
      type: 'success',
      message: `Status akun ${user.namaLengkap} diubah menjadi ${
        !user.isActive ? 'Aktif' : 'Nonaktif'
      }.`,
    });
  };

  const confirmDelete = () => {
    if (!deletingUser) return;
    const res = deleteAdminUser(deletingUser.id);
    if (res.success) {
      setNotification({ type: 'success', message: res.message });
    } else {
      setNotification({ type: 'error', message: res.message });
    }
    setDeletingUser(null);
  };

  if (!hasAccess) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center py-16">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Akses Terbatas: Menu Kelola Admin</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          Hanya pengguna dengan wewenang Super Administrator atau hak akses 'Kelola Akun Admin' yang diizinkan mengatur pengguna sistem.
        </p>
        <p className="text-xs text-slate-400 mt-4">
          Silakan hubungi Sekretaris Desa / Administrator Utama untuk meminta penyesuaian hak akses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between shadow-xs transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5 text-sm font-medium">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Kelola Akun Admin & Hak Akses (RBAC)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Atur wewenang pengguna desa, batasan modul kerja staf, dan keamanan akun petugas.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          id="btn-tambah-admin"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Admin</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total Akun Terdaftar</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
          <p className="text-[11px] text-slate-400 mt-1">Pegawai & Operator SID</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-purple-600">Super Administrator</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{stats.superAdmin}</p>
          <p className="text-[11px] text-purple-600/80 mt-1">Hak akses penuh sistem</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600">Akun Aktif</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.active}</p>
          <p className="text-[11px] text-emerald-600/80 mt-1">Siap melayani warga</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-rose-600">Akun Ditangguhkan</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">{stats.inactive}</p>
          <p className="text-[11px] text-rose-600/80 mt-1">Akses login dimatikan</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, username, jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Peran (Role)</option>
            <option value="SUPER_ADMIN">Super Administrator</option>
            <option value="OPERATOR_SURAT">Operator Surat</option>
            <option value="PETUGAS_PENDUDUK">Petugas Kependudukan</option>
            <option value="PENGELOLA_ARSIP">Pengelola Arsip</option>
            <option value="VIEWER">Peninjau (Viewer)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif Saja</option>
            <option value="INACTIVE">Nonaktif Saja</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Nama & Username</th>
                <th className="py-3 px-4">Jabatan & Kontak</th>
                <th className="py-3 px-4">Peran (Role)</th>
                <th className="py-3 px-4">Batasan Hak Akses</th>
                <th className="py-3 px-4">Status Akun</th>
                <th className="py-3 px-4">Terakhir Masuk</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data akun admin yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrent = user.id === currentUser?.id;
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !user.isActive ? 'bg-slate-50/50 opacity-75' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shadow-xs ${
                              user.role === 'SUPER_ADMIN'
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : user.role === 'OPERATOR_SURAT'
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : user.role === 'PETUGAS_PENDUDUK'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {user.namaLengkap.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800 text-xs sm:text-sm">
                                {user.namaLengkap}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded text-[9px] font-bold">
                                  Anda
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono">
                              @{user.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Jabatan & Kontak */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-700">{user.jabatan}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          {user.email && <span>{user.email}</span>}
                          {user.noHp && <span>&bull; {user.noHp}</span>}
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            user.role === 'SUPER_ADMIN'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : user.role === 'OPERATOR_SURAT'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : user.role === 'PETUGAS_PENDUDUK'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : user.role === 'PENGELOLA_ARSIP'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Permissions badges */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {user.role === 'SUPER_ADMIN' ? (
                            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold text-[10px] border border-purple-200">
                              Semua Hak Akses (Penuh)
                            </span>
                          ) : (
                            user.permissions.map((p) => {
                              const found = ALL_PERMISSIONS.find((ap) => ap.id === p);
                              return (
                                <span
                                  key={p}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium"
                                >
                                  {found ? found.label : p}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(user)}
                          title="Klik untuk mengubah status aktif/nonaktif"
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            user.isActive
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{user.isActive ? 'Aktif' : 'Nonaktif'}</span>
                        </button>
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {user.lastLogin
                          ? formatHariTanggalIndo(new Date(user.lastLogin))
                          : 'Belum pernah'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit akun admin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={isCurrent}
                            onClick={() => setDeletingUser(user)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCurrent
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                            }`}
                            title={
                              isCurrent ? 'Tidak dapat menghapus akun sendiri' : 'Hapus akun admin'
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah / Edit Admin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {modalMode === 'ADD' ? 'Tambah Akun Admin Baru' : 'Edit Pengaturan Akun Admin'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Konfigurasikan profil pegawai desa dan hak akses modul
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveUser} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap Petugas *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Siti Rahmawati, S.Tr.Keb."
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jabatan / Penugasan di Desa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Operator Layanan / Kasi Pelayanan"
                    value={formJabatan}
                    onChange={(e) => setFormJabatan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Username untuk Login *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: siti.pelayanan"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {modalMode === 'ADD' ? 'Kata Sandi (Password) *' : 'Ganti Password (Kosongkan jika tidak diubah)'}
                  </label>
                  <input
                    type="password"
                    placeholder={modalMode === 'ADD' ? 'Minimal 5 karakter' : 'Isi password baru jika ingin diubah'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Dinas / Pegawai (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="pegawai@sukamaju.desa.id"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. Handphone / WhatsApp (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="081289123456"
                    value={formNoHp}
                    onChange={(e) => setFormNoHp(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Peran Utama (Role Profile) *
                </label>
                <select
                  value={formRole}
                  onChange={(e) => handleRoleChange(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                >
                  <option value="OPERATOR_SURAT">Operator Pelayanan Surat (Buat & Rekap)</option>
                  <option value="PETUGAS_PENDUDUK">Petugas Kependudukan (Data Penduduk & KK)</option>
                  <option value="PENGELOLA_ARSIP">Pengelola Arsip & Agenda (Perdes/SK & Surat M/K)</option>
                  <option value="SUPER_ADMIN">Super Administrator (Akses Penuh Seluruh Modul)</option>
                  <option value="VIEWER">Peninjau / Tamu (Hanya Melihat)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Memilih peran akan mencentang daftar hak akses yang disarankan secara otomatis. Anda tetap dapat menyesuaikan izin secara spesifik di bawah.
                </p>
              </div>

              {/* Granular Permission Checkboxes */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block font-semibold text-slate-800 mb-2">
                  Daftar Batasan Akses Modul:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_PERMISSIONS.map((perm) => {
                    const isChecked = formPermissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-blue-50/60 border-blue-200 text-slate-800'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermission(perm.id)}
                          className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-semibold text-xs leading-none">{perm.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                            {perm.desc}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Status Aktif */}
              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-slate-700">
                    Akun Aktif (Dapat digunakan untuk masuk ke dalam sistem desa)
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-simpan-admin"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  {modalMode === 'ADD' ? 'Simpan Akun Baru' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus Admin */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Hapus Akun Admin?</h3>
            <p className="text-xs text-slate-600 mt-2">
              Apakah Anda yakin ingin menghapus akun milik{' '}
              <span className="font-bold text-slate-900">{deletingUser.namaLengkap}</span> (
              <span className="font-mono text-slate-700">@{deletingUser.username}</span>)? Tindakan
              ini tidak dapat dibatalkan.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
