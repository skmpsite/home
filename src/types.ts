export interface SchoolProfile {
  name: string;
  code: string;
  address: string;
  postcode: string;
  city: string;
  state: string;
  phone: string;
  fax: string;
  email: string;
  // Perutusan & Kata Alu-Aluan
  principalName: string;
  principalTitle: string;
  principalPhotoUrl?: string;
  principalSpeech?: string;
  principalBadge?: string;
  // Tayangan Rasmi Sekolah (Video)
  officialVideoTag?: string;
  officialVideoTitle?: string;
  officialVideoDescription?: string;
  officialVideoUrl?: string;
  officialVideoIsVisible?: boolean;
  // Statistik Ringkas Laman Utama
  statsMurid?: string;
  statsGuru?: string;
  statsAnugerah?: string;
  statsDokumen?: string;
  // Identiti & Lagu
  motto: string;
  vision: string;
  mission: string;
  history: string;
  logoUrl: string;
  logoDescription: string[];
  songTitle: string;
  songLyrics: string[];
  songComposer: string;
  songLyricist?: string;
  songArranger?: string;
  songCreatedDate?: string;
  songAudioUrl: string;
  locationCoords: {
    lat: number;
    lng: number;
    googleMapsEmbedUrl: string;
  };
  hemCoordinator?: string;
  schoolName?: string;
  schoolCode?: string;
}

export interface Staff {
  id: string;
  name: string;
  position: string;
  category: 'pentadbir' | 'guru' | 'staf' | 'akp';
  grade: string;
  subject?: string;
  email: string;
  phone?: string;
  photoUrl: string;
  order: number;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: 'pengumuman' | 'aktiviti' | 'pekeliling';
  summary: string;
  content: string;
  imageUrl: string;
  author: string;
  isPinned: boolean;
  views: number;
  showOnHome?: boolean;
  unitScope?: 'kurikulum' | 'hem' | 'kokurikulum' | 'sekolah';
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  category: 'peperiksaan' | 'cuti' | 'acara' | 'pibg';
  description: string;
  location: string;
  targetGroup: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  date: string;
  category: 'sukan' | 'akademik' | 'kokurikulum' | 'majlis';
  type: 'photo' | 'video';
  url: string;
  caption: string;
  description?: string;
}

export interface AwardItem {
  id: string;
  title: string;
  recipient: string;
  category: 'daerah' | 'negeri' | 'kebangsaan' | 'antarabangsa';
  year: string;
  achievement: string;
  description: string;
  badgeUrl: string;
}

export interface DownloadDocument {
  id: string;
  title: string;
  category: 'borang' | 'kebenaran' | 'takwim' | 'pekeliling' | 'pibg';
  fileType: 'PDF' | 'DOCX' | 'XLSX';
  fileSize: string;
  date: string;
  downloadsCount: number;
  description: string;
  downloadUrl: string;
}

export interface SystemLink {
  id: string;
  name: string;
  category: 'kpm' | 'pembelajaran' | 'pentadbiran';
  url: string;
  description: string;
  badge: string;
  iconName: string;
}

export interface TeacherLinkItem {
  id: string;
  title: string;
  category: 'kurikulum' | 'hem' | 'kokurikulum' | 'umum';
  url: string;
  description: string;
  badge?: string;
  iconName?: string;
  order: number;
}

export interface FeedbackEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: 'pertanyaan' | 'cadangan' | 'aduan' | 'pibg';
  subject: string;
  message: string;
  status: 'baru' | 'dibaca' | 'dibalas';
  createdAt: string;
  replyNote?: string;
}

export interface PibgActivity {
  id: string;
  title: string;
  date: string;
  description: string;
  type: 'aktiviti' | 'sumbangan' | 'mesyuarat';
  organizer: string;
}

export interface PibgCommittee {
  id: string;
  name: string;
  position: string;
  category: 'ibu_bapa' | 'guru';
  phone?: string;
  photoUrl: string;
}

export interface CoCurriculumUnit {
  id: string;
  name: string;
  category: 'beruniform' | 'kelab' | 'sukan';
  advisorTeacher: string;
  meetingTime: string;
  description: string;
  iconName: string;
}

export interface HemOfficer {
  id: string;
  role: string;
  name: string;
  unit: string;
  phone?: string;
}

export interface HemRuleItem {
  id: string;
  title: string;
  desc: string;
  type: 'info' | 'warning' | 'success';
}

export interface HemRmtMenuItem {
  day: string;
  menu: string;
}

export interface HemData {
  gpkName: string;
  gpkGrade: string;
  gpkTitle: string;
  gpkSpeech?: string;
  stats: {
    spbtPercentage: string;
    rmtCount: string;
    bapAmount: string;
    sahsiahPercentage: string;
  };
  disiplin: {
    title: string;
    description: string;
    rules: HemRuleItem[];
    fullGuidelines: string;
    ubkTitle: string;
    ubkDescription: string;
    ubkServices: Array<{ title: string; desc: string }>;
    ssdmUrl: string;
    ssdmDescription: string;
  };
  kebajikan: {
    spbtTitle: string;
    spbtDescription: string;
    spbtGuidelines: string[];
    spbtCoordinator: string;
    rmtTitle: string;
    rmtDescription: string;
    rmtCoordinator: string;
    rmtMenu: HemRmtMenuItem[];
    bapTitle: string;
    bapDescription: string;
    bapDetails: string[];
  };
  program3k: {
    safetyTitle: string;
    safetyDescription: string;
    safetyPoints: string[];
    healthTitle: string;
    healthDescription: string;
    healthPoints: string[];
    cleanlinessTitle: string;
    cleanlinessDescription: string;
    cleanlinessPoints: string[];
    coordinator3k: string;
  };
  committee: HemOfficer[];
}

export interface FacebookPost {
  id: string;
  author: string;
  authorAvatar: string;
  date: string;
  timeAgo: string;
  content: string;
  imageUrl?: string;
  postUrl: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  tags?: string[];
  source?: 'skmp' | 'ppdkbb';
}

export interface SearchResultItem {
  type: 'berita' | 'staf' | 'dokumen' | 'acara' | 'anugerah' | 'hem' | 'pengumuman' | 'galeri';
  title: string;
  subtitle: string;
  linkTab: string;
  id: string;
}

export interface NavigationMenuItem {
  id: string;
  targetTab: string;
  label: string;
  iconName: string;
  badge?: string;
  isVisible: boolean;
  order: number;
  isExternal?: boolean;
  externalUrl?: string;
  requiresAdmin?: boolean;
}

export interface SignageSlide {
  id: string;
  title: string;
  subtitle?: string;
  mediaType?: 'image' | 'video' | 'youtube';
  imageUrl: string;
  videoUrl?: string;
  youtubeUrl?: string;
  youtubeId?: string;
  durationSeconds: number;
  useVideoDuration?: boolean;
  isMuted?: boolean;
  isActive: boolean;
  order: number;
  category?: 'pengumuman' | 'aktiviti' | 'kejayaan' | 'info' | 'poster' | 'video' | 'khas';
  createdAt?: string;
}

export interface SignageConfig {
  defaultDuration: number;
  autoPlay: boolean;
  autoEnableAudio?: boolean;
  showClock: boolean;
  showMarquee: boolean;
  marqueeText: string;
  showWeatherBadge: boolean;
  theme: 'dark' | 'glass' | 'corporate';
}

export interface StudentRecord {
  id: string;
  bil: number;
  name: string;
  ic: string;
  icNumber?: string;
  gender: 'LELAKI' | 'PEREMPUAN';
  photoUrl?: string;
  year: string;
  className: string;
  classTeacher: string;
  parent1Name?: string;
  parent1Rel?: string;
  parent1Phone?: string;
  parent2Name?: string;
  parent2Phone?: string;
}

export interface FullStudentRecord extends StudentRecord {
  studentId?: string; // ID Murid APDM
  idType?: string; // Jenis Pengenalan
  dob?: string; // Tarikh Lahir
  studyStatus?: string; // Status Pengajian
  dateEnrolledSchool?: string; // Tarikh Masuk Sekolah
  dateEnrolledClass?: string; // Tarikh Masuk Kelas
  dlpStatus?: string; // Status DLP
  classType?: string; // Jenis Kelas
  streamDesc?: string; // Keterangan Aliran
  fieldDesc?: string; // Keterangan Bidang
  race?: string; // Kaum
  religion?: string; // Agama
  citizenship?: string; // Warganegara
  countryOfOrigin?: string; // Negara Asal
  hostelStatus?: string; // Status Asrama
  hostelName?: string; // Nama Asrama
  isOku?: string; // Status OKU
  okuVerifiedDate?: string; // Tarikh Sah OKU
  okuRegNo?: string; // No Pendaftaran OKU
  okuRegDate?: string; // Tarikh Daftar OKU
  okuCardDate?: string; // Tarikh Kad OKU
  okuCategory?: string; // Kategori Ketidakupayaan
  okuSubCategory?: string; // Subkategori Ketidakupayaan
  orphanStatus?: string; // Status Yatim
  bankAccountNo?: string; // No Akaun Bank
  bankName?: string; // Nama Bank
  // Penjaga 1
  parent1Ic?: string;
  parent1IdType?: string;
  parent1Job?: string;
  parent1JobStatus?: string;
  parent1Employer?: string;
  parent1Income?: string;
  parent1OfficePhone?: string;
  dependentsCount?: string;
  // Penjaga 2
  parent2Rel?: string;
  parent2Ic?: string;
  parent2IdType?: string;
  parent2Job?: string;
  parent2JobStatus?: string;
  parent2Employer?: string;
  parent2Income?: string;
  parent2OfficePhone?: string;
  // Alamat
  address1?: string;
  address2?: string;
  address3?: string;
  postcode?: string;
  city?: string;
  district?: string;
  state?: string;
  fullAddress?: string;
}

export interface StudentAbsenceRecord {
  id: string;
  refNo: string;
  studentId: string;
  studentName: string;
  studentIc?: string;
  year: string;
  className: string;
  dateFrom: string; // YYYY-MM-DD
  dateTo: string;   // YYYY-MM-DD
  daysCount: number;
  reasonCategory: 'sakit' | 'hospital' | 'kecemasan' | 'keluarga' | 'bencana' | 'lain';
  reasonDetails: string;
  parentName: string;
  parentPhone: string;
  parentRelationship?: string;
  attachmentUrl?: string; // image base64 or URL
  attachmentName?: string;
  status: 'disahkan' | 'dalam_semakan' | 'ditolak';
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface SchoolHoliday {
  id: string;
  title: string;
  dateFrom: string; // YYYY-MM-DD
  dateTo: string;   // YYYY-MM-DD
  category?: 'peristiwa' | 'perayaan' | 'penggal' | 'umum' | 'khas';
  description?: string;
  createdBy?: string;
  createdAt: string;
}

export interface IctBookingRecord {
  id: string;
  date: string; // YYYY-MM-DD
  dayName: 'Ahad' | 'Isnin' | 'Selasa' | 'Rabu' | 'Khamis' | string;
  slotIndex: number; // 0 to 10
  startTime: string; // e.g. "07:45"
  endTime: string;   // e.g. "08:15"
  timeSlotLabel: string; // e.g. "07:45 AM - 08:15 AM"
  roomName: string; // e.g. "Makmal Komputer (Bilik ICT 1)"
  teacherName: string;
  teacherEmail?: string;
  className: string; // e.g. "6 Inovatif"
  subject: string;   // e.g. "Reka Bentuk & Teknologi"
  purpose: string;   // e.g. "Amali Pengaturcaraan Digital"
  numberOfStudents?: number;
  equipmentNeeded?: string[];
  status: 'disahkan' | 'penyelenggaraan' | 'dibatalkan';
  maintenanceReason?: string;
  notes?: string;
  monthKey: string; // "YYYY-MM", e.g. "2026-09"
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface IctCashFlowRecord {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'masuk' | 'keluar'; // Duit Masuk vs Duit Keluar
  category: string; // e.g. "Peruntukan LPBT", "Sumbangan PIBG", "Penyelenggaraan ICT", etc.
  description: string; // Butiran / Keterangan Transaksi
  refNo: string; // No. Baucar / Resit / Rujukan
  amount: number; // Nilai RM (positif)
  payerOrPayee?: string; // Diterima daripada / Dibayar kepada
  receiptUrl?: string; // Gambar atau dokumen resit / bukti pembelian (Base64 atau URL)
  receiptFileName?: string; // Nama fail resit contohnya 'Resit_Toner_HP.jpg'
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface AcademicSubject {
  id: string;
  name: string;
  type: string;
  icon: string;
  order?: number;
}

export interface AcademicProgram {
  id: string;
  title: string;
  description: string;
  iconName?: string;
  badge?: string;
  order?: number;
}

export type UserRole =
  | 'admin'
  | 'guru_besar'
  | 'guru'
  | 'user'
  | 'pk_kurikulum'
  | 'su_kurikulum'
  | 'pk_hem'
  | 'su_hem'
  | 'pk_kokurikulum'
  | 'su_kokurikulum'
  | 'kaunselor';

export const isTeacherRole = (role: UserRole | null | undefined): boolean => {
  return (
    role === 'guru_besar' ||
    role === 'guru' ||
    role === 'admin' ||
    role === 'pk_kurikulum' ||
    role === 'su_kurikulum' ||
    role === 'pk_hem' ||
    role === 'su_hem' ||
    role === 'pk_kokurikulum' ||
    role === 'su_kokurikulum' ||
    role === 'kaunselor'
  );
};

export const canEditPengumumanRasmi = (role: UserRole | null | undefined, isAdmin?: boolean): boolean => {
  return Boolean(isAdmin || role === 'admin' || role === 'guru_besar');
};

export const canEditKurikulum = (role: UserRole | null | undefined, isAdmin?: boolean): boolean => {
  return Boolean(isAdmin || role === 'admin' || role === 'guru_besar' || role === 'pk_kurikulum' || role === 'su_kurikulum');
};

export const canEditHem = (role: UserRole | null | undefined, isAdmin?: boolean): boolean => {
  return Boolean(isAdmin || role === 'admin' || role === 'guru_besar' || role === 'pk_hem' || role === 'su_hem' || role === 'kaunselor');
};

export const canEditKokurikulum = (role: UserRole | null | undefined, isAdmin?: boolean): boolean => {
  return Boolean(isAdmin || role === 'admin' || role === 'guru_besar' || role === 'pk_kokurikulum' || role === 'su_kokurikulum');
};

export const canEditUbk = (role: UserRole | null | undefined, isAdmin?: boolean): boolean => {
  // Hanya Guru Kaunselor (UBK), Guru Besar, dan Admin mempunyai hak mengedit modul UBK
  // Guru biasa hanya mempunyai mod rujukan/paparan dan tidak boleh mengedit
  return Boolean(
    isAdmin ||
    role === 'admin' ||
    role === 'guru_besar' ||
    role === 'kaunselor'
  );
};

export interface UbkDutyItem {
  id: string;
  focusNumber: number;
  category: string;
  title: string;
  description: string;
  highlights: string[];
  colorTheme: string;
}

export interface UbkActivityItem {
  id: string;
  title: string;
  focus: 'Pembangunan Sahsiah' | 'Peningkatan Disiplin' | 'Pendidikan Kerjaya' | 'Psikososial & Kesejahteraan' | 'Sesi Bimbingan & Kaunseling' | 'Pengurusan & Pentadbiran';
  status: 'telah_laksana' | 'sedang_laksana' | 'akan_laksana';
  date: string;
  targetGroup: string;
  venue: string;
  objective: string;
  outcome?: string;
  counselorName: string;
  lastUpdated?: string;
}

export interface UbkRphItem {
  id: string;
  week: number;
  date: string;
  time: string;
  sessionType: 'Bimbingan Kelas Modular' | 'Sesi Kaunseling Individu' | 'Sesi Kaunseling Kelompok' | 'Konsultasi Ibu Bapa / Guru' | 'Pengurusan Program & e-BRPBK' | 'Bimbingan Berfokus';
  focus: string;
  title: string;
  target: string;
  venue: string;
  objective: string;
  steps: string[];
  teachingAids: string;
  reflection: string;
  counselorName: string;
  status: 'menunggu' | 'disemak' | 'pembetulan';
  submittedAt: string;
  reviewedAt?: string;
  reviewerName?: string;
  reviewerComment?: string;
  caseRef?: string;
  isConfidential?: boolean;
}

export interface UbkRptItem {
  id: string;
  focus: 'Pembangunan Sahsiah' | 'Peningkatan Disiplin' | 'Pendidikan Kerjaya' | 'Kesejahteraan Mental';
  strategyTitle: string;
  targetGroup: string;
  timeline: string;
  kpi: string;
  status: 'perancangan' | 'sedang_laksana' | 'selesai';
  programs: string[];
  pic: string;
}

export interface UbkCounselingSessionItem {
  id: string;
  caseRef: string;
  clientCode: string;
  type: 'individu' | 'kelompok' | 'konsultasi';
  issueCategory: 'disiplin' | 'akademik' | 'emosi_psikososial' | 'keluarga' | 'kerjaya';
  referralSource: 'sukarela' | 'guru' | 'pentadbir' | 'waris';
  sessionDate: string;
  sessionTime: string;
  sessionCount: number;
  goals: string;
  intervention: string;
  status: 'aktif' | 'selesai' | 'rujuk_pakar';
  psychometricData?: {
    instrumentName: string;
    scoreResult: string;
    actionPlan: string;
  };
  confidentialNotice: string;
}

export interface UbkPbpppDimension {
  id: string;
  name: string;
  description: string;
  weightage: number;
  indicators: string[];
  score: number;
  maxScore: number;
}

export interface UbkPbpppAssessment {
  id: string;
  evaluatedYear: number;
  counselorName: string;
  evaluator1Name: string;
  evaluator2Name: string;
  dimensions: UbkPbpppDimension[];
  overallPercentage: number;
  gradeLevel: 'Cemerlang' | 'Baik' | 'Sederhana' | 'Perlu Bimbingan';
  evaluatorFeedback: string;
  lastUpdated: string;
  status: 'draf' | 'selesai_dinilai';
}



