import { PibgActivity, PibgUsul } from '../types';

export interface PibgOfficialDocument {
  id: string;
  title: string;
  category: 'notis' | 'minit' | 'penyata' | 'borang' | 'pekeliling';
  fileType: 'PDF' | 'DOCX';
  fileSize: string;
  updatedDate: string;
  description: string;
  downloadUrl: string;
}

export interface PibgDonationCategory {
  id: string;
  title: string;
  targetAmount: number;
  collectedAmount: number;
  description: string;
  iconName: string;
  badge: string;
}

export const pibgBankingDetails = {
  bankName: "Bank Islam Malaysia Berhad (BIMB)",
  accountName: "PERSATUAN IBU BAPA DAN GURU SK MERBAU PULAS",
  accountNumber: "02048010034512",
  branch: "Cawangan Baling / Kuala Ketil, Kedah",
  duitNowQrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PIBG-SK-MERBAU-PULAS-BIMB-02048010034512",
  treasurerName: "Pn. Nor Zamizi bt Sulong",
  contactPhone: "04-490 1234 / 019-456 7890",
  email: "pibg.skmerbaupulas@gmail.com"
};

export const pibgVisionMission = {
  visi: "Menjadi rakan strategik utama pihak pengurusan SK Merbau Pulas dalam melahirkan modal insan berilmu, bersahsiah terpuji, dan berdaya saing menerusi muafakat jitu warga sekolah dan komuniti waris.",
  misi: [
    "Memperkukuh jalinan kolaboratif antara ibu bapa, komuniti, dan guru selaras dengan aspirasi Sarana Ibu Bapa KPM.",
    "Menggembleng sumber tenaga, kepakaran, dan kewangan bagi menaik taraf infrastruktur, keselamatan, dan persekitaran pembelajaran kondusif.",
    "Menyokong pelbagai inisiatif akademik, kokurikulum, kebajikan, dan sahsiah murid ke arah pencapaian potensi maksimum setiap murid."
  ],
  fokusUtama: [
    {
      title: "Kebajikan & Keselamatan Murid",
      desc: "Menjamin kebajikan murid asnaf, bantuan kecemasan, dan kawalan keselamatan pintu pagar sewaktu kehadiran dan kepulangan."
    },
    {
      title: "Transformasi Digital & Makmal ICT",
      desc: "Sokongan peruntukan kelengkapan pendingin hawa, rangkaian internet gentian kaca, dan peranti digital murid."
    },
    {
      title: "Peningkatan Akademik & PBD",
      desc: "Dana motivasi, kelas bimbingan tambahan Tahun 6, dan Program Bacaan Pagi serta pemerkasaan celik 3M."
    },
    {
      title: "Pembangunan Sukan & Kokurikulum",
      desc: "Tajaan jersi, peralatan sukan ragbi/hoki/memanah/olahraga, dan insentif kecemerlangan wakil sekolah peringkat daerah & negeri."
    }
  ]
};

export const initialPibgExtendedActivities: PibgActivity[] = [
  {
    id: "pibg-act-1",
    title: "Mesyuarat Agung Tahunan PIBG Sesi 2026/2027 Kali Ke-45",
    date: "28 Mac 2026",
    description: "Pembentangan laporan tahunan, pengesahan penyata kewangan beraudit, pembubaran dan perlantikan saf kepimpinan baharu PIBG serta sesi dialog usul waris bersama Pentadbir.",
    type: "mesyuarat",
    organizer: "Jawatankuasa Kerja PIBG & Pentadbiran SKMP"
  },
  {
    id: "pibg-act-2",
    title: "Gotong-Royong MADANI & Keceriaan Lanskap Sekolah",
    date: "18 April 2026",
    description: "Aktiviti membersihkan kawasan persekitaran sekolah, mengecat garisan parkir, membaiki wakaf bacaan, dan menceriakan taman herba sains bersama ibu bapa.",
    type: "aktiviti",
    organizer: "Biro Pembangunan & KSIB PIBG"
  },
  {
    id: "pibg-act-3",
    title: "Sumbangan & Pemasangan Pendingin Hawa Makmal ICT",
    date: "12 Mei 2026",
    description: "Sumbangan dana berjumlah RM 4,500 bagi memasang 2 unit penyaman udara berkapasiti tinggi untuk keselesaan murid semasa sesi kelas amali sains komputer.",
    type: "sumbangan",
    organizer: "Biro Kewangan PIBG & Penaja Korporat"
  },
  {
    id: "pibg-act-4",
    title: "Hari Penetapan Target & Dialog Prestasi Waris Tahun 6",
    date: "20 Jun 2026",
    description: "Sesi ramah mesra waris bersama Guru Besar dan guru mata pelajaran teras bagi membincangkan sasaran pencapaian PBD dan persediaan murid ke sekolah menengah.",
    type: "aktiviti",
    organizer: "Unit Kurikulum & Biro Akademik PIBG"
  },
  {
    id: "pibg-act-5",
    title: "Program Sumbangsih Kasih & Agihan Bantuan Awal Persekolahan",
    date: "08 Ogos 2026",
    description: "Agihan pakaian seragam sekolah, beg, dan baucar alat tulis kepada 45 orang murid kurang berkemampuan dan yatim sempena sambutan kemerdekaan.",
    type: "sumbangan",
    organizer: "Biro Kebajikan PIBG & Unit HEM"
  },
  {
    id: "pibg-act-6",
    title: "Karnival Keusahawanan Murid & Hari Keluarga PIBG SKMP",
    date: "26 September 2026",
    description: "Gerai jualan makanan, pameran STEM, sukaneka keluarga, dan cabutan bertuah bagi mengumpul dana tabung kebajikan murid.",
    type: "aktiviti",
    organizer: "Jawatankuasa PIBG, Kelab Guru & KSIB"
  }
];

export const initialPibgDocuments: PibgOfficialDocument[] = [
  {
    id: "doc-pibg-1",
    title: "Notis Panggilan Mesyuarat Agung PIBG Sesi 2026/2027",
    category: "notis",
    fileType: "PDF",
    fileSize: "420 KB",
    updatedDate: "10 Mac 2026",
    description: "Surat jemputan rasmi kepada semua ibu bapa, penjaga, dan guru SK Merbau Pulas untuk menghadiri Mesyuarat Agung Tahunan.",
    downloadUrl: "#"
  },
  {
    id: "doc-pibg-2",
    title: "Buku Laporan Tahunan & Penyata Kewangan PIBG Beraudit 2025/2026",
    category: "penyata",
    fileType: "PDF",
    fileSize: "1.8 MB",
    updatedDate: "20 Mac 2026",
    description: "Laporan penuh aktiviti biro, perincian penerimaan sumbangan dan perbelanjaan dana yang telah disahkan oleh Juruaudit Guru dan Juruaudit Waris.",
    downloadUrl: "#"
  },
  {
    id: "doc-pibg-3",
    title: "Minit Mesyuarat Agung PIBG Kali Ke-44",
    category: "minit",
    fileType: "PDF",
    fileSize: "890 KB",
    updatedDate: "15 Jan 2026",
    description: "Rekod rasmi perjalanan mesyuarat agung, perbahasan usul dan ketetapan dasar yang diluluskan sebulat suara.",
    downloadUrl: "#"
  },
  {
    id: "doc-pibg-4",
    title: "Borang Pendaftaran Kumpulan Sokongan Ibu Bapa (KSIB)",
    category: "borang",
    fileType: "PDF",
    fileSize: "310 KB",
    updatedDate: "05 Feb 2026",
    description: "Borang pendaftaran sukarelawan waris bagi menyumbang masa, idea, dan kepakaran dalam pelbagai bidang keperluan sekolah.",
    downloadUrl: "#"
  },
  {
    id: "doc-pibg-5",
    title: "Pekeliling Ikhtisas KPM: Pengurusan Kewangan & Sumbangan PIBG",
    category: "pekeliling",
    fileType: "PDF",
    fileSize: "650 KB",
    updatedDate: "02 Jan 2026",
    description: "Garis panduan rasmi Kementerian Pendidikan Malaysia berkaitan tatacara kutipan sumbangan, tadbir urus dan audit akaun PIBG.",
    downloadUrl: "#"
  }
];

export const initialPibgUsulList: PibgUsul[] = [
  {
    id: "usul-1",
    parentName: "En. Ahmad Fauzi bin Yusoff",
    phone: "013-488 9912",
    studentName: "Muhammad Danish Irfan",
    studentClass: "Tahun 5 Al-Biruni",
    category: "prasarana",
    title: "Pemasangan Laluan Berbumbung Tambahan dari Pintu Pagar B ke Blok C",
    description: "Mencadangkan pembinaan susur gajah berbumbung tambahan bagi memudahkan murid bergerak sewaktu hujan lebat tanpa basah kuyup.",
    submittedAt: "2026-08-25 10:15",
    status: "diluluskan",
    adminFeedback: "Usul telah dibincangkan dalam mesyuarat jawatankuasa dan kerja pembinaan dijadualkan bermula pada cuti pertengahan penggal."
  },
  {
    id: "usul-2",
    parentName: "Pn. Siti Rokiah binti Mansor",
    phone: "019-541 2234",
    studentName: "Nur Auni Syahirah",
    studentClass: "Tahun 3 Ibnu Sina",
    category: "keselamatan",
    title: "Pemasangan Cermin Cembung & Garisan Kuning Hadapan Simpang Sekolah",
    description: "Mencadangkan kerjasama dengan JKR dan Majlis Daerah bagi meletakkan cermin cembung di selekoh berhampiran pintu masuk utama bagi mengurangkan risiko kemalangan jalan raya.",
    submittedAt: "2026-08-28 14:30",
    status: "pertimbangan",
    adminFeedback: "Surat permohonan sokongan telah dihantar kepada pihak berkuasa tempatan (JKR Sik/Baling) dan menanti tinjauan tapak."
  },
  {
    id: "usul-3",
    parentName: "En. Zainal Abidin bin Hashim",
    phone: "017-432 1098",
    studentName: "Amirul Haziq",
    studentClass: "Tahun 6 Al-Farabi",
    category: "akademik",
    title: "Program Kelas Tambahan Bimbingan Fajar Hari Sabtu",
    description: "Cadangan mengadakan bengkel teknik menjawab soalan PBD/UASA secara intensif dengan bayaran saguhati berpatutan kepada guru pembimbing.",
    submittedAt: "2026-09-02 09:00",
    status: "diterima",
    adminFeedback: "Kertas kerja telah diserahkan kepada Guru Penolong Kanan Pentadbiran untuk diselaraskan bersama panitia mata pelajaran."
  }
];

export const ksibSkillAreas = [
  {
    id: "ksib-1",
    title: "Keselamatan & Kawalan Lalu Lintas",
    desc: "Membantu mengawal kenderaan dan memastikan anak-anak melintas jalan dengan selamat pada waktu puncak pagi dan petang."
  },
  {
    id: "ksib-2",
    title: "Pertukangan, Elektrik & Kemahiran Teknikal",
    desc: "Menyumbang kemahiran membaiki perabot, sistem paip, pencahayaan kelas, atau projek keceriaan lanskap."
  },
  {
    id: "ksib-3",
    title: "Kejurulatihan Sukan & Seni Budaya",
    desc: "Melatih pasukan sekolah dalam sukan sepak takraw, badminton, bola jaring, pidato, choral speaking atau nasyid."
  },
  {
    id: "ksib-4",
    title: "Bimbingan Kerjaya & Motivasi Murid",
    desc: "Berkongsi pengalaman profesional (doktor, anggota beruniform, jurutera, usahawan) sebagai pendorong cita-cita murid."
  },
  {
    id: "ksib-5",
    title: "Teknologi Maklumat (ICT) & Multimedia",
    desc: "Membantu penyelenggaraan komputer sekolah, reka bentuk grafik hebahan, dan latihan aplikasi digital."
  }
];
