export const JENJANG_OPTIONS = [
  { value: 'sd', label: 'SD / MI' },
  { value: 'smp', label: 'SMP / MTS' },
  { value: 'sma', label: 'SMA' },
  { value: 'smk', label: 'SMK' },
  { value: 'kuliah', label: 'Kuliah' },
  { value: 'utbk', label: 'UTBK / TKA' },
] as const;

export type JenjangValue = typeof JENJANG_OPTIONS[number]['value'];

// Map detailed jenjang -> base education_level enum (sd|smp|sma)
export const jenjangToBaseLevel = (j: string): 'sd' | 'smp' | 'sma' | undefined => {
  if (j === 'sd') return 'sd';
  if (j === 'smp') return 'smp';
  if (j === 'sma' || j === 'smk' || j === 'kuliah' || j === 'utbk') return 'sma';
  return undefined;
};

export const KELAS_BY_JENJANG: Record<string, string[]> = {
  sd: ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'],
  smp: ['Kelas 7', 'Kelas 8', 'Kelas 9'],
  sma: ['Kelas 10', 'Kelas 11', 'Kelas 12'],
  smk: ['Kelas 10', 'Kelas 11', 'Kelas 12', 'Kelas 13'],
};

export const JURUSAN_SMA = ['IPA', 'IPS', 'Bahasa', 'Kurikulum Merdeka'];

export const JURUSAN_SMK = [
  'SIJA', 'TKJ', 'RPL', 'DKV', 'Multimedia', 'Animasi', 'Broadcasting',
  'Akuntansi', 'Perhotelan', 'Tata Boga', 'Tata Busana', 'Farmasi',
  'Keperawatan', 'Teknik Mesin', 'Teknik Elektro', 'Teknik Kendaraan Ringan',
  'Teknik Sepeda Motor', 'Teknik Audio Video', 'Teknik Pendingin', 'Teknik Las',
  'Bisnis Digital', 'Pemasaran', 'Manajemen Perkantoran', 'Agribisnis',
  'Perikanan', 'Tata Kecantikan', 'Usaha Layanan Wisata', 'Geomatika',
  'Energi Terbarukan', 'Teknik Otomasi Industri', 'Kimia Industri',
  'Teknik Geologi Pertambangan', 'Nautika Kapal Niaga', 'Desain Grafis',
];

export const FAKULTAS_PRODI: Record<string, string[]> = {
  'Teknik': ['Teknik Informatika', 'Sistem Informasi', 'Teknik Elektro', 'Teknik Sipil', 'Teknik Mesin', 'Teknik Industri', 'Teknik Lingkungan', 'Teknik Kimia', 'Arsitektur'],
  'Kedokteran': ['Pendidikan Dokter', 'Kedokteran Gigi', 'Farmasi', 'Kebidanan', 'Keperawatan', 'Gizi'],
  'Ekonomi & Bisnis': ['Manajemen', 'Akuntansi', 'Ekonomi Pembangunan', 'Bisnis Digital', 'Perbankan Syariah'],
  'Hukum': ['Ilmu Hukum', 'Hukum Bisnis', 'Hukum Internasional'],
  'Psikologi': ['Psikologi', 'Psikologi Industri'],
  'Ilmu Komunikasi': ['Ilmu Komunikasi', 'Jurnalistik', 'Public Relations', 'Periklanan', 'Broadcasting'],
  'Pendidikan (FKIP)': ['Pendidikan Matematika', 'Pendidikan Bahasa Inggris', 'PGSD', 'PGPAUD', 'Pendidikan Biologi'],
  'Seni & Desain': ['DKV', 'Desain Produk', 'Desain Interior', 'Seni Rupa Murni', 'Film & Televisi'],
  'Pertanian': ['Agribisnis', 'Agroteknologi', 'Ilmu Tanah', 'Teknologi Pangan'],
  'Kelautan & Perikanan': ['Ilmu Kelautan', 'Budidaya Perairan', 'Manajemen Sumber Daya Perairan'],
  'MIPA': ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Statistika', 'Ilmu Komputer'],
  'Ilmu Sosial & Politik': ['Hubungan Internasional', 'Ilmu Politik', 'Sosiologi', 'Administrasi Publik'],
};

export const UTBK_TARGETS = ['Saintek', 'Soshum', 'Campuran'];
export const UTBK_JURUSAN = [
  'Kedokteran', 'Teknik Informatika', 'Hukum', 'Akuntansi', 'Psikologi',
  'Manajemen', 'Teknik Sipil', 'Teknik Elektro', 'Farmasi', 'Arsitektur',
  'Ilmu Komunikasi', 'Hubungan Internasional', 'Desain Komunikasi Visual',
  'Sistem Informasi', 'Statistika', 'Ilmu Gizi',
];

export const AGAMA_OPTIONS = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];

export const BIDANG_GURU = [
  'Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'Fisika', 'Kimia', 'Biologi',
  'Sejarah', 'Geografi', 'Ekonomi', 'Sosiologi', 'PPKn', 'Agama',
  'Informatika', 'DevOps', 'Cyber Security', 'Cloud Computing', 'Data Science',
  'Akuntansi', 'Desain Grafis', 'Multimedia', 'Robotika',
];
