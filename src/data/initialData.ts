import {
  SchoolProfile,
  Staff,
  NewsItem,
  CalendarEvent,
  GalleryItem,
  AwardItem,
  DownloadDocument,
  SystemLink,
  FeedbackEntry,
  PibgActivity,
  PibgCommittee,
  CoCurriculumUnit,
  FacebookPost
} from '../types';

export const initialSchoolProfile: SchoolProfile = {
  name: "Sekolah Kebangsaan Merbau Pulas",
  code: "KBA5012",
  address: "Jalan Baling, Kampong Merbau Pulas",
  postcode: "09300",
  city: "Kuala Ketil",
  state: "Kedah Darul Aman",
  phone: "04-403 1200",
  fax: "04-403 1201",
  email: "KBA5012@moe.edu.my",
  principalName: "Puan Norhafiza Binti Dolah",
  principalTitle: "Guru Besar (DG48)",
  principalPhotoUrl: "",
  principalSpeech: "Selamat datang ke laman web rasmi SK Merbau Pulas. Semoga platform ini menjadi jambatan perhubungan yang mantap antara warga sekolah, ibu bapa, dan komuniti dalam mencapai kecemerlangan modal insan.",
  motto: "Berilmu, Beramal, Berbakti",
  vision: "Pendidikan Berkualiti Insan Terdidik Negara Sejahtera.",
  mission: "Melestarikan Sistem Pendidikan Yang Berkualiti Untuk Membangunkan Potensi Individu Bagi Memenuhi Aspirasi Negara.",
  history: "Sekolah Kebangsaan Merbau Pulas telah ditubuhkan pada tahun 1954 untuk menyediakan kemudahan pendidikan asas kepada anak-anak penduduk di sekitar Merbau Pulas, Kuala Ketil, Kedah. Bermula dengan struktur bangunan kayu sederhana, sekolah kini berkembang pesat dengan pelbagai kemudahan moden termasuk makmal komputer, pusat sumber digital, dewan terbuka, dan padang permainan yang selesa.",
  logoUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgYVyl_qKknZ3_eiUbvgojY6Y3OiP28frcG3qy92a9yH5jt776tl5293zJX7Adg6-hvQYW5gLILFL-BXnte2ZkXw3Hdtl3MYQqWTV4_L6UbCsBIVVWieiyipL4Dbp33EIrrcXgxX-qLLFKZ/s1600/logo+skmp+warna+stroke.png",
  logoDescription: [
    "Buku Terbuka: Melambangkan ilmu pengetahuan yang sentiasa dituntut dan dipelajari.",
    "Obor Menyala: Melambangkan semangat kegigihan dan penerang masa depan generasi muda.",
    "Warna Biru Diraja: Melambangkan perpaduan, keharmonian dan kesetiaan kepada sekolah.",
    "Warna Kuning Keemasan: Melambangkan kecemerlangan dan kedaulatan pendidikan.",
    "Bintang & Bulan Sabit: Melambangkan nilai-nilai murni dan pegangan agama Islam."
  ],
  songTitle: "Gagah SK Merbau Pulas",
  songLyrics: [
    "Di sini bermula langkah pertama,",
    "Menuntut ilmu penyeri jiwa,",
    "SK Merbau Pulas sekolah tercinta,",
    "Berilmu, Beramal, Berbakti bersama.",
    "",
    "Guru pembimbing pelita hidupku,",
    "Mendidik kami tanpa jemu,",
    "Kejar cita-cita capai impianku,",
    "Satu tekad julang namamu.",
    "",
    "Chorus:",
    "Gagah berdiri SK Merbau Pulas,",
    "Melahirkan insan berakhlak mulia,",
    "Kejayaan didakap dengan ikhlas,",
    "Harum semerbak di seluruh negara!"
  ],
  songComposer: "Cikgu Rosli bin Hassan (Lirik & Lagu)",
  songAudioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=inspiring-cinematic-113524.mp3",
  locationCoords: {
    lat: 5.5682,
    lng: 100.6432,
    googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15873.743120199587!2d100.6385!3d5.5682!2m3!1f00!f00!f00!m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x304b2e8f81012345%3A0x123456789abcdef!2sMerbau%20Pulas%2C%20Kedah!5e0!3m2!1sms!2smy!4v1680000000000!5m2!1sms!2smy"
  }
};

export const initialStaffList: Staff[] = [
  {
    id: "staf-1",
    name: "Puan Norhafiza Binti Dolah",
    position: "Guru Besar (DG48)",
    category: "pentadbir",
    grade: "DG48",
    subject: "Pengurusan & Pentadbiran",
    email: "norhafiza.skmp@moe-dl.edu.my",
    phone: "019-456 7890",
    photoUrl: "",
    order: 1
  },
  {
    id: "staf-2",
    name: "Puan Noraini binti Yusof",
    position: "Penolong Kanan Pentadbiran (DG44)",
    category: "pentadbir",
    grade: "DG44",
    subject: "Bahasa Melayu / Pengajian Kurikulum",
    email: "noraini.skmp@moe-dl.edu.my",
    phone: "013-412 3456",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
    order: 2
  },
  {
    id: "staf-3",
    name: "Encik Mohd Ridzuan bin Osman",
    position: "Penolong Kanan Hal Ehwal Murid (DG44)",
    category: "pentadbir",
    grade: "DG44",
    subject: "Pendidikan Islam / HEM",
    email: "ridzuan.skmp@moe-dl.edu.my",
    phone: "012-555 6789",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
    order: 3
  },
  {
    id: "staf-4",
    name: "Puan Siti Hajar binti Abdul Rahman",
    position: "Penolong Kanan Kokurikulum (DG44)",
    category: "pentadbir",
    grade: "DG44",
    subject: "Sains & Matematik",
    email: "sitihajar.skmp@moe-dl.edu.my",
    phone: "017-888 9900",
    photoUrl: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&q=80&w=300",
    order: 4
  },
  {
    id: "staf-5",
    name: "Encik Khairul Anuar bin Sulaiman",
    position: "Ketua Panitia Matematik",
    category: "guru",
    grade: "DG42",
    subject: "Matematik & RBT",
    email: "khairul.skmp@moe-dl.edu.my",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
    order: 5
  },
  {
    id: "staf-6",
    name: "Puan Farah Diba binti Hashim",
    position: "Guru Media & Pusat Sumber",
    category: "guru",
    grade: "DG41",
    subject: "Bahasa Inggeris (DLP)",
    email: "farahdiba.skmp@moe-dl.edu.my",
    photoUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=300",
    order: 6
  },
  {
    id: "staf-7",
    name: "Ustaz Muhammad Amirul bin Che Lah",
    position: "Ketua Panitia Pendidikan Islam",
    category: "guru",
    grade: "DG41",
    subject: "Pendidikan Islam / Bahasa Arab",
    email: "amirul.skmp@moe-dl.edu.my",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
    order: 7
  },
  {
    id: "staf-8",
    name: "Puan Roslina binti Mahmud",
    position: "Ketua Pembantu Tadbir (N22)",
    category: "staf",
    grade: "N22",
    subject: "Pentadbiran & Kewangan",
    email: "roslina.skmp@moe.gov.my",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
    order: 8
  },
  {
    id: "staf-9",
    name: "Encik Azman bin Che Mat",
    position: "Juruteknik Komputer (FT19)",
    category: "staf",
    grade: "FT19",
    subject: "Makmal ICT & Rangkaian",
    email: "azman.skmp@moe.gov.my",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300",
    order: 9
  }
];

export const initialNewsList: NewsItem[] = [
  {
    id: "news-1",
    title: "Pendaftaran Tahun 1 Sesi 2027 KPM Melalui Portal idMe",
    date: "10 Ogos 2026",
    category: "pengumuman",
    summary: "Makluman pembukaan pendaftaran murid Tahun 1 bagi sesi persekolahan 2027 secara atas talian di portal rasmi KPM idMe.",
    content: "Ibu bapa dan penjaga yang ingin mendaftarkan anak-anak bagi kemasukan Tahun 1 Sesi 2027 boleh membuat permohonan melalui Portal Modul Pengurusan Murid idMe. Sila pastikan dokumen sokongan seperti Sijil Lahir, Kad Pengenalan Ibu Bapa, dan Bil Utiliti dimuat naik sebelum tarikh tutup 30 September 2026.",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600",
    author: "Unit HEM SKMP",
    isPinned: true,
    views: 342
  },
  {
    id: "news-2",
    title: "Kejohanan Sukan Tahunan SK Merbau Pulas Ke-42 Berlangsung Meriah",
    date: "02 Ogos 2026",
    category: "aktiviti",
    summary: "Rumah Sukan Merah mengungguli Kejohanan Sukan Tahunan dengan kutipan 14 pingat emas.",
    content: "Kejohanan Sukan Tahunan SK Merbau Pulas Ke-42 telah berlangsung dengan amat meriah di Padang Utama Sekolah. Majlis perasmian telah disempurnakan oleh Pegawai Pendidikan Daerah. Semua murid menampakkan semangat kesukanan yang tinggi.",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=600",
    author: "Unit Kokurikulum",
    isPinned: true,
    views: 521
  },
  {
    id: "news-3",
    title: "Pekeliling Cuti Pertengahan Penggal II Sesi 2026/2027",
    date: "25 Julai 2026",
    category: "pekeliling",
    summary: "Makluman tarikh persekolahan dan cuti penggal mengikut Takwim KPM bagi Kumpulan B.",
    content: "Sila ambil maklum bahawa Cuti Pertengahan Penggal II akan bermula dari 12 September 2026 hingga 20 September 2026. Sekolah akan beroperasi semula pada hari Isnin, 21 September 2026.",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600",
    author: "Pentadbiran Sekolah",
    isPinned: false,
    views: 189
  }
];

export const initialCalendarEvents: CalendarEvent[] = [
  {
    id: "evt-1",
    title: "Pentaksiran Bilik Darjah (PBD) Pertengahan Tahun",
    date: "2026-08-18",
    endDate: "2026-08-22",
    category: "peperiksaan",
    description: "Pelaksanaan Pentaksiran Sumatif Bilik Darjah bagi Tahap 2 (Tahun 4, 5, dan 6).",
    location: "Dewan & Bilik Darjah SKMP",
    targetGroup: "Murid Tahap 2"
  },
  {
    id: "evt-2",
    title: "Mesyuarat Agung PIBG SK Merbau Pulas 2026",
    date: "2026-08-29",
    category: "pibg",
    description: "Mesyuarat Agung Kali Ke-38 serta Penyampaian Anugerah Cemerlang PBD.",
    location: "Dewan Terbuka Seri Merbau",
    targetGroup: "Ibu Bapa & Semua Guru"
  },
  {
    id: "evt-3",
    title: "Sambutan Hari Kebangsaan & Bulan Kemerdekaan",
    date: "2026-08-30",
    endDate: "2026-09-16",
    category: "acara",
    description: "Pelancaran Bulan Kemerdekaan, pertandingan nyanyian lagu patriotik, dan basikal berhias.",
    location: "Dataran Perhimpunan SKMP",
    targetGroup: "Seluruh Warga Sekolah"
  },
  {
    id: "evt-4",
    title: "Cuti Pertengahan Penggal II Sesi 2026/2027",
    date: "2026-09-12",
    endDate: "2026-09-20",
    category: "cuti",
    description: "Cuti persekolahan mengikut kalender akademik KPM Kumpulan B.",
    location: "Seluruh Negara",
    targetGroup: "Semua Murid & Guru"
  }
];

export const initialGalleryItems: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Perhimpunan Rasmi & Pelancaran Program NILAM",
    date: "04 Ogos 2026",
    category: "akademik",
    type: "photo",
    url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800",
    caption: "Guru Besar menyerahkan buku NILAM simbolik pelancaran membaca kepada wakil murid."
  },
  {
    id: "gal-2",
    title: "Latihan Kebakaran Bersama Jabatan Bomba Kulim",
    date: "28 Julai 2026",
    category: "majlis",
    type: "photo",
    url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800",
    caption: "Demonstrasi memadam api oleh anggota Bomba dan Penyelamat di padang sekolah."
  },
  {
    id: "gal-3",
    title: "Kejohanan Merentas Desa Peringkat Sekolah",
    date: "15 Jun 2026",
    category: "sukan",
    type: "photo",
    url: "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&q=80&w=800",
    caption: "Peserta acara merentas desa bersedia di garisan permulaan."
  },
  {
    id: "gal-4",
    title: "Perkhemahan Tahunan Badan Beruniform 2026",
    date: "10 Mei 2026",
    category: "kokurikulum",
    type: "photo",
    url: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=800",
    caption: "Aktiviti ikatan dan gajet oleh Pengakap Muda SK Merbau Pulas."
  }
];

export const initialAwardsList: AwardItem[] = [
  {
    id: "awd-1",
    title: "Johan Pertandingan Inovasi STEM Sekolah Rendah",
    recipient: "Pasukan Inovasi SKMP (Tahun 5 & 6)",
    category: "negeri",
    year: "2026",
    achievement: "Pingat Emas & Anugerah Inovasi Hijau",
    description: "Mencipta alat penapis air mesra alam menggunakan bahan kitar semula di Karnival STEM Kedah.",
    badgeUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "awd-2",
    title: "Naib Johan Kejohanan Bola Sepak MSSD Kulim/Bandar Baharu",
    recipient: "Pasukan Bola Sepak SKMP U12",
    category: "daerah",
    year: "2026",
    achievement: "Pingat Perak & Piala Pusingan Daerah",
    description: "Menunjukkan prestasi luar biasa sepanjang kejohanan peringkat daerah.",
    badgeUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "awd-3",
    title: "Anugerah Sekolah Cemerlang Pengurusan NILAM Kebangsaan",
    recipient: "Pusat Sumber Seri Merbau SKMP",
    category: "kebangsaan",
    year: "2025",
    achievement: "Anugerah Khas Kementerian Pendidikan Malaysia",
    description: "Pengikhtirafan ke atas purata bacaan murid tertinggi di peringkat negeri dan kebangsaan.",
    badgeUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=200"
  }
];

export const initialDownloadDocs: DownloadDocument[] = [
  {
    id: "doc-1",
    title: "Borang Permohonan Pendaftaran Murid Tahun 1",
    category: "borang",
    fileType: "PDF",
    fileSize: "1.2 MB",
    date: "10 Jan 2026",
    downloadsCount: 1420,
    description: "Borang fizikal tambahan dan senarai semak dokumen yang diperlukan untuk pengesahan murid Tahun 1.",
    downloadUrl: "#"
  },
  {
    id: "doc-2",
    title: "Borang Kebenaran Ibu Bapa / Penjaga Program Luar Sekolah",
    category: "kebenaran",
    fileType: "PDF",
    fileSize: "450 KB",
    date: "15 Feb 2026",
    downloadsCount: 980,
    description: "Borang rasmi akuan kebenaran untuk aktiviti perkhemahan, rombongan, dan pertandingan.",
    downloadUrl: "#"
  },
  {
    id: "doc-3",
    title: "Takwim Persekolahan & Peperiksaan SKMP Sesi 2026/2027",
    category: "takwim",
    fileType: "PDF",
    fileSize: "2.8 MB",
    date: "02 Jan 2026",
    downloadsCount: 2310,
    description: "Jadual perancangan tahunan merangkumi akademik, HEM, dan aktiviti kokurikulum.",
    downloadUrl: "#"
  },
  {
    id: "doc-4",
    title: "Pekeliling Bayaran Sumbangan PIBG Sesi 2026",
    category: "pibg",
    fileType: "PDF",
    fileSize: "820 KB",
    date: "20 Mac 2026",
    downloadsCount: 650,
    description: "Dokumen ketetapan kadar sumbangan PIBG mengikut keputusan Mesyuarat Agung PIBG.",
    downloadUrl: "#"
  }
];

export const initialSystemLinks: SystemLink[] = [
  {
    id: "sys-1",
    name: "DELIMa 3.0 KPM",
    category: "pembelajaran",
    url: "https://d3.delima.edu.my",
    description: "Portal Pembelajaran Digital DELIMa 3.0 KPM untuk guru dan murid.",
    badge: "Utama",
    iconName: "BookOpen"
  },
  {
    id: "sys-2",
    name: "idMe KPM",
    category: "pentadbiran",
    url: "https://idme.moe.gov.my",
    description: "Sistem Pengurusan Identiti & Kemasukan Murid KPM.",
    badge: "Rasmi",
    iconName: "UserCheck"
  },
  {
    id: "sys-3",
    name: "APDM KPM",
    category: "pentadbiran",
    url: "https://apdm.moe.gov.my",
    description: "Aplikasi Pangkalan Data Murid bagi kehadiran dan maklumat peribadi.",
    badge: "Sistem Murid",
    iconName: "Users"
  },
  {
    id: "sys-4",
    name: "SAPS / SPPB",
    category: "pentadbiran",
    url: "https://sppb.moe.gov.my",
    description: "Sistem Pengurusan Pentaksiran Bersepadu & Pelaporan PBD.",
    badge: "Pentaksiran",
    iconName: "BarChart3"
  },
  {
    id: "sys-5",
    name: "e-Operasi KPM",
    category: "kpm",
    url: "https://eoperasi.moe.gov.my",
    description: "Sistem pengurusan guru dan perjawatan sekolah.",
    badge: "Warga Guru",
    iconName: "FileSpreadsheet"
  },
  {
    id: "sys-6",
    name: "Portal Rasmi KPM",
    category: "kpm",
    url: "https://www.moe.gov.my",
    description: "Laman web rasmi Kementerian Pendidikan Malaysia.",
    badge: "KPM",
    iconName: "Globe"
  }
];

export const initialFeedbackList: FeedbackEntry[] = [
  {
    id: "fb-1",
    name: "Encik Razak bin Ahmad",
    email: "razak.ahmad@gmail.com",
    phone: "019-123 4567",
    category: "cadangan",
    subject: "Cadangan Penambahbaikan Laluan Susur Gajah Waktu Pulang",
    message: "Saya memohon pihak sekolah dapat mempertimbangkan laluan berbumbung tambahan di pintu pagar B untuk keselesaan murid sewaktu hujan.",
    status: "dibaca",
    createdAt: "2026-08-01 10:15",
    replyNote: "Cadangan telah dibawa ke dalam Mesyuarat Jawatankuasa PIBG."
  },
  {
    id: "fb-2",
    name: "Puan Zaiton binti Sulaiman",
    email: "zaiton.s@yahoo.com",
    phone: "017-987 6543",
    category: "pertanyaan",
    subject: "Pertanyaan Baju Sukan Rumah Merah Saiz S",
    message: "Adakah stok baju sukan rumah merah saiz S masih tersedia di Kedai Buku Sekolah?",
    status: "baru",
    createdAt: "2026-08-11 14:20"
  }
];

export const initialPibgActivities: PibgActivity[] = [
  {
    id: "pibg-act-1",
    title: "Program Gotong-Royong Perdana Ceria Sekolah",
    date: "14 Julai 2026",
    description: "Pembersihan kawasan sekolah, pengecatan semula mural laluan ilmu, dan pembaikan taman sains.",
    type: "aktiviti",
    organizer: "AJK PIBG & Unit HEM"
  },
  {
    id: "pibg-act-2",
    title: "Sumbangan Penghawa Dingin Makmal ICT SKMP",
    date: "02 Jun 2026",
    description: "Sumbangan sebanyak RM 4,500 daripada dana PIBG bagi keselesaan murid sewaktu kelas komputer.",
    type: "sumbangan",
    organizer: "BiromKewangan PIBG"
  }
];

export const initialPibgCommittee: PibgCommittee[] = [
  {
    id: "pibg-c-1",
    name: "Dato' Hj. Ismail bin Abdullah",
    position: "Yang Dipertua (YDP) PIBG",
    category: "ibu_bapa",
    phone: "012-400 1122",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: "pibg-c-2",
    name: "Puan Norhafiza Binti Dolah",
    position: "Penasihat (Guru Besar)",
    category: "guru",
    photoUrl: ""
  },
  {
    id: "pibg-c-3",
    name: "Puan Zubaidah binti Hassan",
    position: "Naib Yang Dipertua (NYDP) PIBG",
    category: "ibu_bapa",
    photoUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: "pibg-c-4",
    name: "Cikgu Khairul Anuar bin Sulaiman",
    position: "Setiausaha PIBG",
    category: "guru",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300"
  }
];

export const initialCoCurriculumUnits: CoCurriculumUnit[] = [
  {
    id: "cocurr-1",
    name: "Pengakap Kanak-Kanak (PKK)",
    category: "beruniform",
    advisorTeacher: "Encik Khairul Anuar bin Sulaiman",
    meetingTime: "Rabu (2.30 Petang - 4.30 Petang)",
    description: "Melatih ikatan, pertolongan cemas, kawad kaki, serta ikhtiar hidup.",
    iconName: "Shield"
  },
  {
    id: "cocurr-2",
    name: "Tunas Kadet Remaja Sekolah (TKRS)",
    category: "beruniform",
    advisorTeacher: "Ustaz Muhammad Amirul bin Che Lah",
    meetingTime: "Rabu (2.30 Petang - 4.30 Petang)",
    description: "Membentuk ketahanan disiplin, ketatanegaraan, dan jati diri patriotik.",
    iconName: "Award"
  },
  {
    id: "cocurr-3",
    name: "Pergerakan Pandu Puteri Tunas (PPT)",
    category: "beruniform",
    advisorTeacher: "Puan Farah Diba binti Hashim",
    meetingTime: "Rabu (2.30 Petang - 4.30 Petang)",
    description: "Memupuk nilai kepimpinan dan khidmat masyarakat bagi murid perempuan.",
    iconName: "Heart"
  },
  {
    id: "cocurr-4",
    name: "Kelab Bahasa & Kebudayaan",
    category: "kelab",
    advisorTeacher: "Puan Noraini binti Yusof",
    meetingTime: "Rabu (3.30 Petang - 5.00 Petang)",
    description: "Aktiviti pidato, pantun, sajak, drama, dan apresiasi seni warisan Melayu.",
    iconName: "BookOpen"
  },
  {
    id: "cocurr-5",
    name: "Kelab Sains, Teknologi & Inovasi (STEM)",
    category: "kelab",
    advisorTeacher: "Puan Siti Hajar binti Abdul Rahman",
    meetingTime: "Rabu (3.30 Petang - 5.00 Petang)",
    description: "Eksperimen sains kreatif, peraturian robotik asas, dan projek inovasi kitar semula.",
    iconName: "Cpu"
  },
  {
    id: "cocurr-6",
    name: "Kelab Bola Sepak & Futsal",
    category: "sukan",
    advisorTeacher: "Encik Mohd Ridzuan bin Osman",
    meetingTime: "Selasa (5.00 Petang - 6.30 Petang)",
    description: "Latihan kemahiran asas taktik padang, kawalan bola, dan stamina sukan.",
    iconName: "Trophy"
  },
  {
    id: "cocurr-7",
    name: "Kelab Bola Jaring",
    category: "sukan",
    advisorTeacher: "Puan Farah Diba binti Hashim",
    meetingTime: "Selasa (5.00 Petang - 6.30 Petang)",
    description: "Meningkatkan kelincahan, hantaran bola, dan kerjasama pasukan di gelanggang.",
    iconName: "Target"
  }
];

export const initialFacebookPosts: FacebookPost[] = [
  {
    id: "fb-0",
    author: "SK Merbau Pulas Rasmi",
    authorAvatar: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgYVyl_qKknZ3_eiUbvgojY6Y3OiP28frcG3qy92a9yH5jt776tl5293zJX7Adg6-hvQYW5gLILFL-BXnte2ZkXw3Hdtl3MYQqWTV4_L6UbCsBIVVWieiyipL4Dbp33EIrrcXgxX-qLLFKZ/s1600/logo+skmp+warna+stroke.png",
    date: "14 Ogos 2026",
    timeAgo: "2 jam yang lalu",
    content: "Terima kasih kepada waris yang memberikan maklum balas menerusi GF (Google Form) yang diberikan. Insya-Allah pihak sekolah akan membuat nilai tambah untuk penambahbaikan program seterusnya.\n\nTahniah dan terima kasih atas komitmen dan kerjasama padu seluruh waris dan komuniti yang hadir. 👍👍🌹\n\n#warisgurumurid #berpisahtiada #skmpunggul #SKMPKBA5012 #PendidikanKedah",
    imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800",
    postUrl: "https://www.facebook.com/SKMPKBA5012/",
    likesCount: 168,
    commentsCount: 32,
    sharesCount: 24,
    tags: ["#warisgurumurid", "#berpisahtiada", "#skmpunggul"],
    source: "skmp"
  },
  {
    id: "fb-1",
    author: "SK Merbau Pulas Rasmi",
    authorAvatar: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgYVyl_qKknZ3_eiUbvgojY6Y3OiP28frcG3qy92a9yH5jt776tl5293zJX7Adg6-hvQYW5gLILFL-BXnte2ZkXw3Hdtl3MYQqWTV4_L6UbCsBIVVWieiyipL4Dbp33EIrrcXgxX-qLLFKZ/s1600/logo+skmp+warna+stroke.png",
    date: "12 Ogos 2026",
    timeAgo: "3 jam yang lalu",
    content: "🇲🇾 MAJLIS PELANCARAN BULAN KEBANGSAAN & KIBAR JALUR GEMILANG SK MERBAU PULAS SESI 2026/2027!\n\nAlhamdulillah, telah berlangsung dengan penuh gilang-gemilang Majlis Pelancaran Sambutan Bulan Kebangsaan peringkat sekolah. Tahniah kepada seluruh warga SKMP, barisan guru, dan anak-anak murid yang segak berpakaian kebangsaan serta bersemangat patriotik semasa perarakan kibaran Jalur Gemilang pagi tadi.\n\n#SKMerbauPulas #SKMPKBA5012 #BulanKebangsaan2026 #MalaysiaMadani #MerbauPulas",
    imageUrl: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&q=80&w=800",
    postUrl: "https://www.facebook.com/SKMPKBA5012/",
    likesCount: 142,
    commentsCount: 28,
    sharesCount: 19,
    tags: ["#BulanKebangsaan", "#SKMPKBA5012", "#MalaysiaMadani"],
    source: "skmp"
  },
  {
    id: "fb-2",
    author: "SK Merbau Pulas Rasmi",
    authorAvatar: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgYVyl_qKknZ3_eiUbvgojY6Y3OiP28frcG3qy92a9yH5jt776tl5293zJX7Adg6-hvQYW5gLILFL-BXnte2ZkXw3Hdtl3MYQqWTV4_L6UbCsBIVVWieiyipL4Dbp33EIrrcXgxX-qLLFKZ/s1600/logo+skmp+warna+stroke.png",
    date: "10 Ogos 2026",
    timeAgo: "2 hari yang lalu",
    content: "🏆 KEJOHANAN OLAHRAGA & SUKAN TAHUNAN SK MERBAU PULAS KALI KE-42\n\nSyabas dan tahniah diucapkan kepada Rumah Sukan Merah yang bergelar JOHAN KESELURUHAN Kejohanan Olahraga Tahun 2026! Setinggi-tinggi penghargaan juga buat Yang Dipertua PIBG dan seluruh jawatankuasa waris yang hadir memeriahkan sorakan sokongan. Semangat sukan dan silaturahim SKMP kekal padu!\n\n#SKMPKBA5012 #SukanTahunanSKMP #MajulahSukanSKMP #KualaKetil",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800",
    postUrl: "https://www.facebook.com/SKMPKBA5012/",
    likesCount: 198,
    commentsCount: 45,
    sharesCount: 34,
    tags: ["#SukanTahunan", "#RumahSukan", "#PIBGSKMP"],
    source: "skmp"
  },
  {
    id: "fb-3",
    author: "SK Merbau Pulas Rasmi",
    authorAvatar: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgYVyl_qKknZ3_eiUbvgojY6Y3OiP28frcG3qy92a9yH5jt776tl5293zJX7Adg6-hvQYW5gLILFL-BXnte2ZkXw3Hdtl3MYQqWTV4_L6UbCsBIVVWieiyipL4Dbp33EIrrcXgxX-qLLFKZ/s1600/logo+skmp+warna+stroke.png",
    date: "07 Ogos 2026",
    timeAgo: "5 hari yang lalu",
    content: "📖 PROGRAM DIALOG PRESTASI & PENTAKSIRAN BILIK DARJAH (PBD) SK MERBAU PULAS\n\nTerima kasih diucapkan kepada para ibu bapa dan penjaga murid Tahun 1 hingga 6 atas kehadiran yang amat menggalakkan dalam sesi pertemuan dan laporan PBD pertengahan tahun. Hubungan erat sekolah dan ibu bapa adalah kunci kejayaan dan kecemerlangan sahsiah anak-anak SKMP.\n\n#SKMerbauPulas #PBD2026 #KemenjadianMurid #PendidikanKedah",
    imageUrl: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800",
    postUrl: "https://www.facebook.com/SKMPKBA5012/",
    likesCount: 116,
    commentsCount: 18,
    sharesCount: 12,
    tags: ["#DialogPrestasi", "#PBD2026", "#IbuBapaSKMP"],
    source: "skmp"
  },
  {
    id: "fb-4",
    author: "PPD Kulim Bandar Baharu",
    authorAvatar: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=120",
    date: "11 Ogos 2026",
    timeAgo: "1 hari yang lalu",
    content: "🌟 LAWATAN BIMBINGAN DAN PENANDAARASAN PENGURUSAN PENDIDIKAN DIGITAL DAERAH KULIM BANDAR BAHARU\n\nPejabat Pendidikan Daerah Kulim Bandar Baharu komited menyokong inisiatif transformasi digital di semua sekolah zon Merbau Pulas dan sekitarnya. Syabas kepada kepimpinan sekolah dan warga pendidik atas usaha berterusan memacu kecemerlangan murid berasaskan Dasar Pendidikan Digital (DPD) KPM.\n\n#PPDKulimBandarBaharu #PendidikanKedah #PenerajuKecemerlangan #KPM",
    imageUrl: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800",
    postUrl: "https://www.facebook.com/p/PPD-Kulim-Bandar-Baharu-61553992422357/",
    likesCount: 235,
    commentsCount: 31,
    sharesCount: 27,
    tags: ["#PPDKulimBandarBaharu", "#TransformasiDigital", "#PendidikanKedah"],
    source: "ppdkbb"
  },
  {
    id: "fb-5",
    author: "PPD Kulim Bandar Baharu",
    authorAvatar: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=120",
    date: "09 Ogos 2026",
    timeAgo: "3 hari yang lalu",
    content: "📢 MAKLUMAN PENGAMBILAN & PENDAFTARAN MURID TAHUN 1 SESI 2027/2028 DAERAH KULIM BANDAR BAHARU\n\nIbu bapa/penjaga dipohon melengkapkan permohonan kemasukan Tahun 1 melalui Sistem Pengurusan Murid (idMe KPM) sebelum tarikh tutup. Pastikan dokumen sokongan disahkan oleh pihak sekolah berhampiran.\n\n#PPDKBB #Tahun1 #idMeKPM #PendidikanHolistik",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800",
    postUrl: "https://www.facebook.com/p/PPD-Kulim-Bandar-Baharu-61553992422357/",
    likesCount: 312,
    commentsCount: 54,
    sharesCount: 68,
    tags: ["#PengurusanMurid", "#PendaftaranTahun1", "#KPM"],
    source: "ppdkbb"
  }
];
