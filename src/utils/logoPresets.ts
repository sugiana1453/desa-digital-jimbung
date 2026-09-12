// Pre-packaged official Indonesian government SVG emblems encoded as clean data URIs
// This ensures reliable offline rendering without any external asset loading issues

export interface LogoPreset {
  id: string;
  name: string;
  description: string;
  dataUrl: string;
}

// 1. Lambang Garuda Pancasila Kuning Emas
const garudaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="46" fill="#fef08a" stroke="#ca8a04" stroke-width="3"/>
  <path d="M50 16 L53 28 L65 28 L55 35 L59 47 L50 40 L41 47 L45 35 L35 28 L47 28 Z" fill="#eab308" stroke="#a16207" stroke-width="1.5"/>
  <path d="M22 38 C28 48 38 65 50 68 C62 65 72 48 78 38 C75 56 60 76 50 78 C40 76 25 56 22 38 Z" fill="#ca8a04"/>
  <rect x="38" y="44" width="24" height="22" rx="4" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
  <line x1="38" y1="55" x2="62" y2="55" stroke="#ffffff" stroke-width="2"/>
  <line x1="50" y1="44" x2="50" y2="66" stroke="#ffffff" stroke-width="2"/>
  <path d="M50 51 L52 54 L55 54 L53 56 L54 59 L50 57 L46 59 L47 56 L45 54 L48 54 Z" fill="#facc15"/>
  <path d="M30 80 Q50 75 70 80 L68 85 Q50 81 32 85 Z" fill="#ffffff" stroke="#854d0e" stroke-width="1"/>
  <text x="50" y="84" font-size="4" font-weight="bold" text-anchor="middle" fill="#854d0e" font-family="sans-serif">BHINNEKA TUNGGAL IKA</text>
</svg>`;

// 2. Lambang Bhakti Praja Desa (Padi & Kapas Bintang Hijau Kuning)
const prajaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <polygon points="50,10 88,32 88,68 50,90 12,68 12,32" fill="#047857" stroke="#fbbf24" stroke-width="3"/>
  <polygon points="50,15 84,35 84,65 50,85 16,65 16,35" fill="#065f46"/>
  <path d="M50 25 L53 34 L62 34 L55 40 L58 49 L50 43 L42 49 L45 40 L38 34 L47 34 Z" fill="#facc15" stroke="#ca8a04" stroke-width="1"/>
  <!-- Padi & Kapas Wreath -->
  <path d="M28 62 C28 45 40 38 48 36" fill="none" stroke="#fef08a" stroke-width="2.5" stroke-dasharray="2,2"/>
  <path d="M72 62 C72 45 60 38 52 36" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-dasharray="2,2"/>
  <!-- Base Ribbon -->
  <rect x="32" y="66" width="36" height="8" rx="2" fill="#f59e0b" stroke="#ffffff" stroke-width="1"/>
  <text x="50" y="72" font-size="5" font-weight="bold" text-anchor="middle" fill="#ffffff" font-family="sans-serif">DESA PRAJA</text>
</svg>`;

// 3. Lambang Modern Desa Sukamaju Mandiri (Biru Emas)
const modernDesaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="46" fill="#1e3a8a" stroke="#60a5fa" stroke-width="3"/>
  <circle cx="50" cy="50" r="41" fill="#1e40af" stroke="#3b82f6" stroke-width="1"/>
  <!-- Roof / Pendopo -->
  <polygon points="50,22 24,42 76,42" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
  <polygon points="50,27 30,42 70,42" fill="#fef08a"/>
  <!-- Pillars -->
  <rect x="32" y="44" width="6" height="24" rx="1" fill="#ffffff"/>
  <rect x="42" y="44" width="5" height="24" rx="1" fill="#ffffff"/>
  <rect x="53" y="44" width="5" height="24" rx="1" fill="#ffffff"/>
  <rect x="62" y="44" width="6" height="24" rx="1" fill="#ffffff"/>
  <!-- Floor -->
  <rect x="26" y="68" width="48" height="6" rx="2" fill="#fbbf24"/>
  <text x="50" y="83" font-size="5.5" font-weight="bold" text-anchor="middle" fill="#93c5fd" font-family="sans-serif">SUKAMAJU</text>
</svg>`;

export const LOGO_PRESETS: LogoPreset[] = [
  {
    id: 'garuda',
    name: 'Garuda Pancasila',
    description: 'Lambang kenegaraan standar untuk surat pengantar & kedinasan',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(garudaSvg)}`,
  },
  {
    id: 'praja',
    name: 'Bhakti Praja Desa',
    description: 'Lambang perisai hijau padi & kapas otonomi pemerintahan desa',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(prajaSvg)}`,
  },
  {
    id: 'modern',
    name: 'Desa Sukamaju Biru',
    description: 'Lambang pendopo balai desa & kemakmuran warga',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(modernDesaSvg)}`,
  },
];
