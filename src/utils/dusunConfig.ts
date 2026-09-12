export interface DusunItem {
  id: string;
  name: string;
  label: string;
  rws: string[]; // 2-digit formatted string, e.g. "01", "28"
}

export const DUSUN_LIST: DusunItem[] = [
  {
    id: '1',
    name: 'Dusun 1',
    label: 'Dusun 1 (RW 01, 02, 03, 04, 05, 28)',
    rws: ['01', '02', '03', '04', '05', '28'],
  },
  {
    id: '2',
    name: 'Dusun 2',
    label: 'Dusun 2 (RW 06, 07, 08, 09, 14, 29)',
    rws: ['06', '07', '08', '09', '14', '29'],
  },
  {
    id: '3',
    name: 'Dusun 3',
    label: 'Dusun 3 (RW 11, 12, 13, 15, 16, 20)',
    rws: ['11', '12', '13', '15', '16', '20'],
  },
  {
    id: '4',
    name: 'Dusun 4',
    label: 'Dusun 4 (RW 17, 18, 19, 21, 22)',
    rws: ['17', '18', '19', '21', '22'],
  },
  {
    id: '5',
    name: 'Dusun 5',
    label: 'Dusun 5 (RW 10, 23, 24, 25, 26, 27)',
    rws: ['10', '23', '24', '25', '26', '27'],
  },
];

/**
 * Format any RW input to 2-digit string (e.g. "1" -> "01", "28" -> "28")
 */
export const normalizeRw = (rw: string | number | undefined | null): string => {
  if (!rw) return '01';
  const digits = String(rw).replace(/\D/g, '');
  if (!digits) return '01';
  const num = parseInt(digits, 10);
  return num < 10 ? `0${num}` : `${num}`;
};

/**
 * All 29 RWs sorted numerically
 */
export const ALL_RWS: string[] = Array.from({ length: 29 }, (_, i) => {
  const num = i + 1;
  return num < 10 ? `0${num}` : `${num}`;
});

/**
 * Find which Dusun a given RW belongs to
 */
export const findDusunByRw = (rw: string | number | undefined | null): DusunItem | undefined => {
  const norm = normalizeRw(rw);
  return DUSUN_LIST.find((d) => d.rws.includes(norm));
};

/**
 * Normalize Dusun name variations (e.g. "Dusun I" -> "Dusun 1", "Dukuh 2" -> "Dusun 2")
 */
export const normalizeDusunName = (dusun: string | undefined | null): string => {
  if (!dusun) return 'Dusun 1';
  const lower = dusun.toLowerCase().trim();
  if (lower.includes('1') || lower.includes('dusun i') || lower.includes('dukuh 1') || lower.includes('dukuh i')) {
    return 'Dusun 1';
  }
  if (lower.includes('2') || lower.includes('dusun ii') || lower.includes('dukuh 2') || lower.includes('dukuh ii')) {
    return 'Dusun 2';
  }
  if (lower.includes('3') || lower.includes('dusun iii') || lower.includes('dukuh 3') || lower.includes('dukuh iii')) {
    return 'Dusun 3';
  }
  if (lower.includes('4') || lower.includes('dusun iv') || lower.includes('dukuh 4') || lower.includes('dukuh iv')) {
    return 'Dusun 4';
  }
  if (lower.includes('5') || lower.includes('dusun v') || lower.includes('dukuh 5') || lower.includes('dukuh v')) {
    return 'Dusun 5';
  }
  return dusun;
};

/**
 * Get valid RWs for a Dusun
 */
export const getRwsForDusun = (dusunName: string | undefined | null): string[] => {
  const norm = normalizeDusunName(dusunName);
  const found = DUSUN_LIST.find((d) => d.name.toLowerCase() === norm.toLowerCase());
  return found ? found.rws : ALL_RWS;
};
