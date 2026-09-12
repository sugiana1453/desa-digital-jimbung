import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Heart,
  GraduationCap,
  Briefcase,
  MapPin,
  Baby,
  Activity,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { Penduduk } from '../types';
import { hitungUsia } from '../utils/formatters';

interface StatistikPendudukProps {
  penduduk: Penduduk[];
  onApplyFilter?: (type: 'gender' | 'dusun' | 'umur' | 'pekerjaan' | 'lulusan', value: string) => void;
}

export const StatistikPenduduk: React.FC<StatistikPendudukProps> = ({
  penduduk,
  onApplyFilter,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Core Aggregations
  const stats = useMemo(() => {
    const total = penduduk.length;
    if (total === 0) {
      return {
        total: 0,
        laki: 0,
        perempuan: 0,
        persenLaki: 0,
        persenPerempuan: 0,
        totalKk: 0,
        rataKk: '0',
        balita: 0,
        anak: 0,
        produktif: 0,
        lansia: 0,
        wajibKtp: 0,
        kawin: 0,
        belumKawin: 0,
        cerai: 0,
        dusunStats: [] as { name: string; count: number; pct: number }[],
        pendidikanStats: [] as { name: string; count: number; pct: number }[],
        pekerjaanStats: [] as { name: string; count: number; pct: number }[],
        agamaStats: [] as { name: string; count: number; pct: number }[],
      };
    }

    let laki = 0;
    let perempuan = 0;
    let balita = 0;
    let anak = 0;
    let produktif = 0;
    let lansia = 0;
    let wajibKtp = 0;
    let kawin = 0;
    let belumKawin = 0;
    let cerai = 0;

    const noKkSet = new Set<string>();
    const dusunMap: Record<string, number> = {};
    const pendidikanMap: Record<string, number> = {};
    const pekerjaanMap: Record<string, number> = {};
    const agamaMap: Record<string, number> = {};

    penduduk.forEach((p) => {
      // Gender
      if (p.jenisKelamin === 'L') laki++;
      else if (p.jenisKelamin === 'P') perempuan++;

      // KK
      if (p.noKk && p.noKk.trim()) noKkSet.add(p.noKk.trim());

      // Age Group
      const age = hitungUsia(p.tanggalLahir);
      if (age <= 5) balita++;
      if (age >= 6 && age <= 17) anak++;
      if (age >= 18 && age <= 59) produktif++;
      if (age >= 60) lansia++;
      if (age >= 17) wajibKtp++;

      // Marital
      if (p.statusPerkawinan === 'Kawin') kawin++;
      else if (p.statusPerkawinan === 'Belum Kawin') belumKawin++;
      else cerai++;

      // Dusun
      const d = p.dusun?.trim() || 'Dusun Belum Terdata';
      dusunMap[d] = (dusunMap[d] || 0) + 1;

      // Pendidikan
      const pend = p.pendidikan?.trim() || 'Tidak / Belum Sekolah';
      pendidikanMap[pend] = (pendidikanMap[pend] || 0) + 1;

      // Pekerjaan
      const pekr = p.pekerjaan?.trim() || 'Lainnya';
      pekerjaanMap[pekr] = (pekerjaanMap[pekr] || 0) + 1;

      // Agama
      const agm = p.agama?.trim() || 'Islam';
      agamaMap[agm] = (agamaMap[agm] || 0) + 1;
    });

    const dusunStats = Object.entries(dusunMap)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);

    const pendidikanStats = Object.entries(pendidikanMap)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);

    const pekerjaanStats = Object.entries(pekerjaanMap)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const agamaStats = Object.entries(agamaMap)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count);

    return {
      total,
      laki,
      perempuan,
      persenLaki: Math.round((laki / total) * 100),
      persenPerempuan: Math.round((perempuan / total) * 100),
      totalKk: noKkSet.size,
      rataKk: noKkSet.size > 0 ? (total / noKkSet.size).toFixed(1) : '0',
      balita,
      anak,
      produktif,
      lansia,
      wajibKtp,
      kawin,
      belumKawin,
      cerai,
      dusunStats,
      pendidikanStats,
      pekerjaanStats,
      agamaStats,
    };
  }, [penduduk]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" id="section-statistik-warga">
      {/* Header Bar */}
      <div className="p-4 sm:px-5 sm:py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>Statistik Demografi Kependudukan Warga Desa</span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Live Data ({stats.total} Jiwa)
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Analisis struktur penduduk, kelompok usia, kepala keluarga, dan sebaran wilayah dusun.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
          id="btn-toggle-statistik-detail"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Tutup Rincian
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Lihat Analisis Lengkap
            </>
          )}
        </button>
      </div>

      {/* Primary KPI Grid (Always Visible) */}
      <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Penduduk & Rasio Gender */}
        <div
          onClick={() => onApplyFilter?.('gender', 'ALL')}
          className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 hover:border-blue-300 transition-all cursor-pointer group"
          title="Klik untuk melihat semua warga"
        >
          <div className="flex items-center justify-between text-blue-900 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Penduduk</span>
            <Users className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-blue-950 font-mono">
            {stats.total} <span className="text-xs font-semibold text-blue-700 font-sans">Jiwa</span>
          </div>
          <div className="mt-2 pt-2 border-t border-blue-200/80 flex items-center justify-between text-[11px] text-blue-800">
            <span
              onClick={(e) => {
                e.stopPropagation();
                onApplyFilter?.('gender', 'L');
              }}
              className="hover:underline font-medium hover:text-blue-950"
              title="Filter Laki-laki"
            >
              👦 {stats.laki} L ({stats.persenLaki}%)
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                onApplyFilter?.('gender', 'P');
              }}
              className="hover:underline font-medium hover:text-blue-950"
              title="Filter Perempuan"
            >
              👧 {stats.perempuan} P ({stats.persenPerempuan}%)
            </span>
          </div>
        </div>

        {/* Kepala Keluarga (KK) */}
        <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 hover:border-purple-300 transition-all cursor-pointer group">
          <div className="flex items-center justify-between text-purple-900 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kepala Keluarga</span>
            <UserCheck className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-purple-950 font-mono">
            {stats.totalKk} <span className="text-xs font-semibold text-purple-700 font-sans">KK</span>
          </div>
          <div className="mt-2 pt-2 border-t border-purple-200/80 text-[11px] text-purple-800 flex items-center justify-between">
            <span>Rata-rata Jiwa / KK</span>
            <span className="font-bold">{stats.rataKk} orang</span>
          </div>
        </div>

        {/* Usia Produktif */}
        <div
          onClick={() => onApplyFilter?.('umur', 'PRODUKTIF')}
          className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 hover:border-emerald-300 transition-all cursor-pointer group"
          title="Klik untuk filter usia produktif (18-59 tahun)"
        >
          <div className="flex items-center justify-between text-emerald-900 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Usia Produktif</span>
            <Activity className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-950 font-mono">
            {stats.produktif} <span className="text-xs font-semibold text-emerald-700 font-sans">Jiwa</span>
          </div>
          <div className="mt-2 pt-2 border-t border-emerald-200/80 text-[11px] text-emerald-800 flex items-center justify-between">
            <span>18 - 59 Tahun</span>
            <span className="font-bold">
              {stats.total > 0 ? Math.round((stats.produktif / stats.total) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Anak & Balita */}
        <div
          onClick={() => onApplyFilter?.('umur', 'ANAK')}
          className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 hover:border-amber-300 transition-all cursor-pointer group"
          title="Klik untuk filter anak (< 18 tahun)"
        >
          <div className="flex items-center justify-between text-amber-900 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Anak & Balita</span>
            <Baby className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-950 font-mono">
            {stats.anak + stats.balita}{' '}
            <span className="text-xs font-semibold text-amber-700 font-sans">Jiwa</span>
          </div>
          <div className="mt-2 pt-2 border-t border-amber-200/80 text-[11px] text-amber-800 flex items-center justify-between">
            <span>Balita: {stats.balita}</span>
            <span>Remaja: {stats.anak}</span>
          </div>
        </div>

        {/* Wajib KTP / Pemilih */}
        <div
          onClick={() => onApplyFilter?.('umur', 'DEWASA')}
          className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 hover:border-rose-300 transition-all cursor-pointer group col-span-2 sm:col-span-1"
          title="Klik untuk filter warga dewasa (≥ 17 tahun)"
        >
          <div className="flex items-center justify-between text-rose-900 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Wajib KTP (≥17)</span>
            <Heart className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-rose-950 font-mono">
            {stats.wajibKtp} <span className="text-xs font-semibold text-rose-700 font-sans">Jiwa</span>
          </div>
          <div className="mt-2 pt-2 border-t border-rose-200/80 text-[11px] text-rose-800 flex items-center justify-between">
            <span>Lansia (60+): {stats.lansia}</span>
            <span className="font-bold">
              {stats.total > 0 ? Math.round((stats.wajibKtp / stats.total) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Detailed Analytics Dashboard */}
      {isExpanded && (
        <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 bg-slate-50/40 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sebaran Dusun / Wilayah */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                  Sebaran Wilayah Dusun
                </span>
                <span className="text-[10px] text-slate-400">Klik untuk filter</span>
              </div>
              <div className="space-y-2.5">
                {stats.dusunStats.length === 0 ? (
                  <p className="text-xs text-slate-400">Belum ada data dusun</p>
                ) : (
                  stats.dusunStats.map((d) => (
                    <div
                      key={d.name}
                      onClick={() => onApplyFilter?.('dusun', d.name)}
                      className="group cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                      title={`Filter warga di ${d.name}`}
                    >
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span className="group-hover:text-blue-600 transition-colors font-semibold">
                          {d.name}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          {d.count} Jiwa ({d.pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${d.pct}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pendidikan Terakhir */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 flex items-center">
                  <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
                  Tingkat Pendidikan
                </span>
                <span className="text-[10px] text-slate-400">Pendidikan warga</span>
              </div>
              <div className="space-y-2.5">
                {stats.pendidikanStats.length === 0 ? (
                  <p className="text-xs text-slate-400">Belum ada data pendidikan</p>
                ) : (
                  stats.pendidikanStats.map((p) => (
                    <div
                      key={p.name}
                      onClick={() => onApplyFilter?.('lulusan', p.name)}
                      className="group cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                      title={`Filter warga lulusan ${p.name}`}
                    >
                      <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                        <span className="group-hover:text-purple-600 transition-colors font-semibold truncate max-w-[160px]">
                          {p.name}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          {p.count} Jiwa ({p.pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${p.pct}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pekerjaan Utama & Status Kawin */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 flex items-center">
                  <Briefcase className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  Mata Pencaharian & Status
                </span>
                <span className="text-[10px] text-slate-400">Profesi terbanyak</span>
              </div>

              {/* Marital Snapshot */}
              <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-50 rounded-lg text-center text-[11px]">
                <div className="p-1">
                  <span className="block font-bold text-slate-800">{stats.kawin}</span>
                  <span className="text-slate-500 text-[10px]">Kawin</span>
                </div>
                <div className="p-1 border-x border-slate-200">
                  <span className="block font-bold text-slate-800">{stats.belumKawin}</span>
                  <span className="text-slate-500 text-[10px]">Belum Kawin</span>
                </div>
                <div className="p-1">
                  <span className="block font-bold text-slate-800">{stats.cerai}</span>
                  <span className="text-slate-500 text-[10px]">Cerai</span>
                </div>
              </div>

              {/* Top Jobs */}
              <div className="space-y-2 pt-1">
                {stats.pekerjaanStats.map((j) => (
                  <div
                    key={j.name}
                    onClick={() => onApplyFilter?.('pekerjaan', j.name)}
                    className="group cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors flex items-center justify-between text-xs"
                    title={`Filter pekerjaan: ${j.name}`}
                  >
                    <span className="text-slate-700 group-hover:text-emerald-700 font-medium truncate max-w-[170px]">
                      {j.name}
                    </span>
                    <span className="font-mono font-bold text-emerald-800 text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {j.count} orang
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
