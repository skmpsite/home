import {
  UbkDutyItem,
  UbkActivityItem,
  UbkRphItem,
  UbkRptItem,
  UbkCounselingSessionItem,
  UbkPbpppAssessment
} from '../types';

export const initialUbkDuties: UbkDutyItem[] = [
  {
    id: 'duty-1',
    focusNumber: 1,
    category: 'Fokus 1 KPM',
    title: 'Pembangunan Sahsiah Diri Murid',
    description: 'Membimbing dan memupuk sahsiah terpuji, disiplin kendiri, dan kepimpinan murid secara holistik berlandaskan Falsafah Pendidikan Kebangsaan.',
    highlights: [
      'Pembudayaan Amalan Guru Penyayang (Sambut kehadiran murid, Mentor-Mentee, sambutan hari lahir).',
      'Pengurusan & Latihan Pembimbing Rakan Sebaya (PRS) Tahap 2.',
      'Program Sahsiah Unggul Murid (SUMUR) dan pengiktirafan amalan baik murid melalui SSDM.',
      'Bimbingan adab, nilai murni, kasih sayang, hormat-menghormati dan tanggungjawab sivil.'
    ],
    colorTheme: 'from-amber-500 to-yellow-600'
  },
  {
    id: 'duty-2',
    focusNumber: 2,
    category: 'Fokus 2 KPM',
    title: 'Peningkatan Disiplin Diri Murid',
    description: 'Melaksanakan program intervensi tingkah laku bagi mengurangkan kes salah laku, meningkatkan peratus kehadiran dan membentuk disiplin positif.',
    highlights: [
      'Program Sifar Ponteng Sekolah dan inisiatif Ziarah Cakna Kasih ke rumah murid berisiko cicir.',
      'Kempen Hentikan Buli (Fizikal, Lisan dan Siber) serta kesedaran hak asasi kanak-kanak.',
      'Pendidikan Pencegahan Dadah (PPDa), rokok, vape, inhalan dan bahaya alkohol.',
      'Bimbingan pengurusan kemarahan (Anger Management) dan resolusi konflik antara rakan sebaya.'
    ],
    colorTheme: 'from-rose-500 to-red-600'
  },
  {
    id: 'duty-3',
    focusNumber: 3,
    category: 'Fokus 3 KPM',
    title: 'Pendidikan Kerjaya Murid',
    description: 'Membantu murid meneroka potensi diri, kecenderungan minat, dan hala tuju pendidikan masa hadapan sejak peringkat sekolah rendah.',
    highlights: [
      'Pelaksanaan Pentaksiran Psikometrik (Ppsi) - Inventori Minat Kerjaya (IMK) & Kecerdasan Pelbagai (IKeP) Tahun 6.',
      'Karnival / Hari Eksplorasi Kerjaya Sekolah Rendah dan pameran agensi pekerjaan.',
      'Bimbingan kemahiran belajar berkesan, teknik menghafal, dan pengurusan masa harian.',
      'Motivasi menghadapi UASA dan panduan permohonan ke Sekolah Khusus (SBP, MRSM, SMKA).'
    ],
    colorTheme: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'duty-4',
    focusNumber: 4,
    category: 'Fokus 4 KPM',
    title: 'Psikososial & Kesejahteraan Mental Murid',
    description: 'Menyediakan sokongan psikososial, saringan emosi, dan bantuan kesihatan mental agar murid sentiasa ceria, selamat dan berdaya tahan.',
    highlights: [
      'Pelaksanaan Saringan Minda Sihat Kanak-Kanak bagi mengenal pasti tahap kebimbangan dan kemurungan.',
      'Program Celik Minda, Terapi Seni / Ekspresif dan teknik relaksasi / pernafasan terapeutik.',
      'Intervensi sokongan emosi bagi murid mangsa trauma, kehilangan keluarga, atau kesempitan hidup.',
      'Jalinan kerjasama dengan Pejabat Kesihatan Daerah (PKD), Hospital dan Jabatan Kebajikan Masyarakat (JKM).'
    ],
    colorTheme: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'duty-5',
    focusNumber: 5,
    category: 'Perkhidmatan Terapeutik',
    title: 'Sesi Bimbingan & Kaunseling Berfokus',
    description: 'Menyediakan ruang selamat, empati dan beretika kerahsiaan untuk sesi pertemuan individu mahupun kelompok secara profesional.',
    highlights: [
      'Sesi Kaunseling Individu (Klien sukarela, dirujuk guru/pentadbir, atau permohonan waris).',
      'Sesi Kaunseling Kelompok (Fokus bimbingan akademik, kelompok sahsiah, motivasi dan pengurusan stres).',
      'Konsultasi keibubapaan dan sesi perbincangan meja bulat bersama guru kelas untuk intervensi bersama.',
      'Penyediaan rekod sesi kaunseling rasmi dan borang persetujuan termaklum (Informed Consent).'
    ],
    colorTheme: 'from-purple-500 to-violet-600'
  },
  {
    id: 'duty-6',
    focusNumber: 6,
    category: 'Pentadbiran Unit',
    title: 'Pengurusan & Dokumentasi Bilik UBK',
    description: 'Memastikan bilik bimbingan dan kaunseling beroperasi dalam keadaan kondusif, terapeutik, dan berlandaskan piawaian kementerian.',
    highlights: [
      'Pengurusan Bilik Kaunseling Individu, Bilik Kaunseling Kelompok, dan Ruang Terapi Kanak-Kanak.',
      'Penyelenggaraan Fail Meja, Buku Rekod Perkhidmatan B&K, dan pelaporan berkala kepada Guru Besar.',
      'Penyediaan Rancangan Bimbingan & Kaunseling Harian (RPH Kaunselor) untuk semakan pentadbir mingguan.',
      'Pengemaskinian Sudut B&K, Papan Maklumat Kerjaya, dan Peti Suara / Luahan Hati Murid.'
    ],
    colorTheme: 'from-cyan-500 to-blue-600'
  }
];

export const initialUbkActivities: UbkActivityItem[] = [
  {
    id: 'act-1',
    title: 'Program Transisi & Amalan Guru Penyayang (Pintu Pagar Sekolah)',
    focus: 'Pembangunan Sahsiah',
    status: 'telah_laksana',
    date: '10 Mac 2026 - Sepanjang Sesi Persekolahan',
    targetGroup: 'Semua Murid SK Merbau Pulas (Pra - Tahun 6)',
    venue: 'Pintu Pagar Utama & Foyer Dataran Sekolah',
    objective: 'Menyemai budaya kasih sayang, mengalu-alukan kehadiran murid dengan mesra, dan membina rasa selamat serta dihargai di sekolah.',
    outcome: '100% murid disambut mesra oleh barisan pentadbir dan guru kaunselor setiap pagi; kehadiran hari pertama mencapai 96.8%.',
    counselorName: 'Guru Bimbingan & Kaunseling (UBK)',
    lastUpdated: '2026-03-12'
  },
  {
    id: 'act-2',
    title: 'Kursus Kepimpinan & Pembugaran PRS Bongsu Tahap 2',
    focus: 'Pembangunan Sahsiah',
    status: 'telah_laksana',
    date: '18 Mei 2026',
    targetGroup: '30 Orang Murid Terpilih (Tahun 4, 5 & 6)',
    venue: 'Dewan Seri Merbau & Bilik UBK',
    objective: 'Melatih PRS kemahiran asas mendengar, membina empati, menyokong rakan sebaya dan menjadi mata telinga guru kaunselor.',
    outcome: '30 orang PRS menerima watikah pelantikan rasmi dan telah memulakan tugas bimbingan rakan sebaya di kelas masing-masing.',
    counselorName: 'Guru Bimbingan & Kaunseling (UBK)',
    lastUpdated: '2026-05-20'
  },
  {
    id: 'act-3',
    title: 'Pelaksanaan Pentaksiran Psikometrik (Ppsi) - IMK Tahun 6',
    focus: 'Pendidikan Kerjaya',
    status: 'telah_laksana',
    date: '15 Julai 2026',
    targetGroup: '64 Orang Murid Tahun 6 (Semua Kelas)',
    venue: 'Makmal Komputer 1 & 2',
    objective: 'Mengenal pasti kecenderungan personaliti dan minat kerjaya murid berasaskan Teori Holland (RIASEC).',
    outcome: '100% murid Tahun 6 telah melengkapkan instrumen IMK dan menerima rumusan kod kecenderungan kerjaya untuk rujukan pemilihan sekolah menengah.',
    counselorName: 'Guru Bimbingan & Kaunseling (UBK)',
    lastUpdated: '2026-07-16'
  },
  {
    id: 'act-4',
    title: 'Program Sifar Ponteng & Operasi Ziarah Cakna Kasih',
    focus: 'Peningkatan Disiplin',
    status: 'sedang_laksana',
    date: 'Ogos - September 2026',
    targetGroup: 'Murid Berkehadiran Bawah 80% & Berisiko Cicir',
    venue: 'Kediaman Waris Sekitar Merbau Pulas & Bilik UBK',
    objective: 'Menziarahi murid berisiko keciciran, meneroka kekangan keluarga/pengangkutan, dan menyerahkan bantuan awal agar kembali ke sekolah.',
    outcome: 'Sebanyak 6 buah rumah telah diziarahi bersama PK HEM; 5 murid telah kembali hadir ke sekolah secara konsisten.',
    counselorName: 'Guru Bimbingan & Kaunseling (UBK)',
    lastUpdated: '2026-09-08'
  },
  {
    id: 'act-5',
    title: 'Kempen Kesedaran Kesejahteraan Mental "Minda Sihat Murid Hebat"',
    focus: 'Psikososial & Kesejahteraan',
    status: 'sedang_laksana',
    date: '1 September - 30 September 2026',
    targetGroup: 'Murid Tahap 2 (Tahun 4, 5 & 6)',
    venue: 'Foyer UBK & Waktu Perhimpunan Rasmi',
    objective: 'Memberi pendedahan kepada murid mengenai pengurusan emosi, teknik kawalan stres, dan mengikis stigma meminta bantuan emosi.',
    outcome: 'Aktiviti kotak luahan hati "Sampaikan Pada Kaunselor" menerima maklum balas positif dan beberapa murid telah dirujuk untuk sesi santai.',
    counselorName: 'Guru Bimbingan & Kaunseling (UBK)',
    lastUpdated: '2026-09-09'
  },
  {
    id: 'act-6',
    title: 'Sesi Kaunseling Individu & Kelompok Berfokus (Siri Berkala)',
    focus: 'Sesi Bimbingan & Kaunseling',
    status: 'sedang_laksana',
    date: 'Setiap Hari Selasa, Rabu & Khamis',
    targetGroup: 'Murid Klien Sukarela & Rujukan Guru/Disiplin',
    venue: 'Bilik Kaunseling Terapeutik',
    objective: 'Memberikan intervensi psikososial dan bimbingan sahsiah secara berstruktur bagi menyelesaikan isu emosi, disiplin atau akademik.',
    outcome: 'Sebanyak 18 sesi individu dan 4 sesi kelompok telah selesai dilaksanakan dengan rekod pemantauan perkembangan positif.',
    counselorName: 'Guru Bimbingan & Kaunseling (UBK)',
    lastUpdated: '2026-09-10'
  },
  {
    id: 'act-7',
    title: 'Karnival Eksplorasi Kerjaya & Halatuju Sekolah Menengah',
    focus: 'Pendidikan Kerjaya',
    status: 'akan_laksana',
    date: '14 Oktober 2026',
    targetGroup: 'Murid Tahun 5 dan 6 SK Merbau Pulas',
    venue: 'Dewan Seri Merbau',
    objective: 'Memberi pendedahan tentang laluan pendidikan sekolah menengah, tawaran sekolah khusus (SBP/MRSM) dan pembentukan cita-cita awal.',
    outcome: 'Perancangan kertas kerja telah disiapkan dan sedang menunggu pengesahan jawatankuasa induk HEM.',
    counselorName: 'Guru Bimbingan & Kaunseling (UBK)',
    lastUpdated: '2026-09-05'
  },
  {
    id: 'act-8',
    title: 'Kempen Hentikan Buli Siber & Pengurusan Penggunaan Gajet',
    focus: 'Peningkatan Disiplin',
    status: 'akan_laksana',
    date: '4 November 2026',
    targetGroup: 'Semua Murid Tahap 2 & Persatuan Ibu Bapa dan Guru (PIBG)',
    venue: 'Dataran Perhimpunan & Tayangan Video Interaktif',
    objective: 'Mendidik murid tentang etika digital, bahaya buli siber, ketagihan gajet serta perlindungan keselamatan dalam talian.',
    outcome: 'Jemputan penceramah jemputan Pegawai Perhubungan Sekolah (PDRM) dalam proses penyelarasan surat rasmi.',
    counselorName: 'Guru Bimbingan & Kaunseling (UBK)',
    lastUpdated: '2026-09-02'
  },
  {
    id: 'act-9',
    title: 'Majlis Apresiasi Pemimpin Cilik PRS & Bintang Sahsiah Terpuji',
    focus: 'Pembangunan Sahsiah',
    status: 'akan_laksana',
    date: 'Disember 2026',
    targetGroup: '30 PRS dan Murid Contoh Sahsiah Terpuji Bulanan',
    venue: 'Dewan Seri Merbau',
    objective: 'Memberi penghargaan dan piala iringan kepada pemimpin murid PRS atas sumbangan khidmat bakti sepanjang sesi persekolahan.',
    outcome: 'Senarai penerima anugerah sedang dinilai melalui pangkalan data rekod amalan baik SSDM.',
    counselorName: 'Guru Bimbingan & Kaunseling (UBK)',
    lastUpdated: '2026-09-01'
  }
];

export const initialUbkRph: UbkRphItem[] = [
  {
    id: 'rph-minggu-25-contoh',
    week: 25,
    date: '2026-09-12',
    time: '08:00 PG - 09:00 PG',
    sessionType: 'Bimbingan Kelas Modular',
    focus: 'Pembangunan Sahsiah Diri Murid',
    title: 'Contoh sahaja',
    target: 'Tahun 5 / 6',
    venue: 'Bilik Bimbingan & Kaunseling',
    objective: 'Conrohnya',
    steps: [
      'Langkah 1: Set Induksi',
      'Langkah 2: Aktiviti Utama',
      'Langkah 3: Penutup & Refleksi'
    ],
    teachingAids: 'Bahan Edaran, Modul B&K, LCD Projektor',
    reflection: 'Tercapai',
    counselorName: 'Guru Bimbingan & Kaunseling (UBK)',
    status: 'menunggu',
    submittedAt: '2026-09-12T08:00:00.000Z'
  },
  {
    id: 'rph-1',
    week: 24,
    date: '2026-09-08',
    time: '08:00 PG - 09:00 PG',
    sessionType: 'Bimbingan Kelas Modular',
    focus: 'Pembangunan Sahsiah Diri Murid',
    title: 'Amalan Komunikasi Berhemah & Menghormati Warga Sekolah',
    target: 'Tahun 5 Inovatif (32 Murid)',
    venue: 'Bilik Bimbingan & Kaunseling',
    objective: 'Pada akhir sesi bimbingan, murid dapat: 1. Menyenaraikan 3 adab bertutur sopan kepada guru dan rakan. 2. Mengaplikasikan teknik mendengar secara empati dalam situasi konflik.',
    steps: [
      'Set Induksi: Tayangan video situasi perbualan sopan dan impak kata-kata kesat (10 minit).',
      'Langkah 1: Perbincangan kumpulan kecil mengenai situasi harian di bilik darjah (15 minit).',
      'Langkah 2: Simulasi main peranan respons berhemah bila diprovokasi atau berselisih faham (20 minit).',
      'Penutup: Rumusan ikrar lisan "Bahasa Indah Sahsiah Mulia" dan lembaran refleksi diri (15 minit).'
    ],
    teachingAids: 'Video pendek, kad senario perbualan, LCD projektor, pelekat bintang refleksi.',
    reflection: '30 daripada 32 murid berjaya menunjukkan respons sopan semasa simulasi. 2 orang murid yang agak pemalu telah digandingkan bersama PRS dan menunjukkan keyakinan bertutur.',
    counselorName: 'Guru Bimbingan & Kaunseling (UBK)',
    status: 'disemak',
    submittedAt: '2026-09-07T14:30:00.000Z',
    reviewedAt: '2026-09-08T11:15:00.000Z',
    reviewerName: 'Guru Besar SK Merbau Pulas',
    reviewerComment: 'Rancangan bimbingan kelas yang tersusun kemas dan menepati piawaian KPM. Pendekatan simulasi sangat praktikal dan memberi impak kepada sahsiah murid. Tahniah.'
  },
  {
    id: 'rph-2',
    week: 24,
    date: '2026-09-09',
    time: '10:30 PG - 11:30 PG',
    sessionType: 'Sesi Kaunseling Individu',
    focus: 'Peningkatan Disiplin Diri Murid (Isu Kehadiran)',
    title: 'Eksplorasi Punca Ketidakhadiran & Kontrak Tingkah Laku Positif',
    target: 'Murid A (Tahun 4 Kreatif - Dirujuk Unit Disiplin)',
    venue: 'Bilik Kaunseling Individu (Terapeutik)',
    objective: 'Membantu klien meneroka halangan kehadiran ke sekolah, menstruktur jadual bangun pagi, dan menandatangani kontrak sasaran hadir 100%.',
    steps: [
      'Membina hubungan terapeutik (Rapport) dan menstrukturkan etika kerahsiaan serta persetujuan termaklum.',
      'Meneroka isu klien mengenai kesukaran tidur malam dan ketiadaan pengangkutan pagi.',
      'Membina pelan tindakan bersama klien: Menetapkan jadual waktu tidur 9:30 malam dan berbasikal bersama rakan sekampung.',
      'Menandatangani kontrak tingkah laku dengan ganjaran peneguhan positif bagi kehadiran penuh minggu ini.'
    ],
    teachingAids: 'Borang Kontrak Tingkah Laku Murid, Jadual Harian Bergambar, Kad Peneguhan Positif.',
    reflection: 'Klien memberi kerjasama yang amat baik dan meluahkan rasa lega kerana didengari. Klien berjanji akan tidur awal dan bersemangat hadir ke sekolah.',
    counselorName: 'Guru Bimbingan & Kaunseling (UBK)',
    status: 'disemak',
    submittedAt: '2026-09-09T12:00:00.000Z',
    reviewedAt: '2026-09-09T16:20:00.000Z',
    reviewerName: 'Penolong Kanan Hal Ehwal Murid (PK HEM)',
    reviewerComment: 'Langkah intervensi yang tepat dan berperingkat. Sila pantau status kehadiran murid ini dalam modul e-Kehadiran harian dan maklumkan kepada guru kelas.'
  },
  {
    id: 'rph-3',
    week: 24,
    date: '2026-09-11',
    time: '09:00 PG - 10:00 PG',
    sessionType: 'Sesi Kaunseling Kelompok',
    focus: 'Pendidikan Kerjaya Murid',
    title: 'Eksplorasi Potensi Diri & Hala Tuju Selepas Sekolah Rendah',
    target: 'Kelompok Murid Tahun 6 Cemerlang (6 Orang)',
    venue: 'Sudut Kerjaya Bilik B&K',
    objective: 'Membantu murid menghubungkan personaliti RIASEC daripada ujian psikometrik dengan pemilihan sekolah menengah bersesuaian (SBP/MRSM).',
    steps: [
      'Penyatuan kelompok dan perkongsian profil kecenderungan kerjaya masing-masing.',
      'Aktiviti "Roadmap Kejayaan": Mengisi peta matlamat peperiksaan akhir tahun dan syarat kelayakan sekolah khusus.',
      'Perbincangan interaktif kelompok mengenai cabaran pembelajaran dan motivasi kendiri.',
      'Rumusan dan komitmen belajar berpasukan.'
    ],
    teachingAids: 'Brosur Maklumat SBP/MRSM, Lembaran Hala Tuju Kerjaya, Kad Skor IMK Holland.',
    reflection: 'Ahli kelompok menunjukkan antusiasme tinggi untuk saling menyokong dalam mengulang kaji pelajaran.',
    counselorName: 'Guru Bimbingan & Kaunseling (UBK)',
    status: 'menunggu',
    submittedAt: '2026-09-10T15:10:00.000Z'
  }
];

// ============================================================================
// 2. RANCANGAN PERKHIDMATAN TAHUNAN (RPT GBK) - BERTERASKAN 4 FOKUS KPM
// ============================================================================
export const initialUbkRpt: UbkRptItem[] = [
  {
    id: 'rpt-1',
    focus: 'Pembangunan Sahsiah',
    strategyTitle: 'Strategi Pembudayaan Nilai Murni & Guru Penyayang Holistik',
    targetGroup: 'Semua Murid (Prasekolah - Tahun 6)',
    timeline: 'Sepanjang Tahun (Jan - Disember)',
    kpi: '98% Murid Merekodkan Amalan Baik dalam SSDM; Sifar Kes Sahsiah Kritikal',
    status: 'sedang_laksana',
    programs: [
      'Amalan Sambutan Pintu Pagar "Guru Penyayang"',
      'Watikah Pelantikan & Kursus Kepimpinan PRS Bongsu',
      'Program Penghayatan Nilai Murni & Hari Lahir Murid',
      'Majlis Apresiasi Tokoh Sahsiah Terpuji Bulanan'
    ],
    pic: 'Guru Bimbingan & Kaunseling'
  },
  {
    id: 'rpt-2',
    focus: 'Peningkatan Disiplin',
    strategyTitle: 'Strategi Kehadiran Optimum & Pencegahan Salah Laku Disiplin',
    targetGroup: 'Murid Berkehadiran <80% & Berisiko Tingkah Laku',
    timeline: 'Fasa 1 & Fasa 2 (Mac - Oktober)',
    kpi: 'Peratus Kehadiran Sekolah Mencapai Sasaran KPM (≥95.0%); Penurunan 50% Kes Lewat',
    status: 'sedang_laksana',
    programs: [
      'Program Sifar Ponteng & Operasi Ziarah Cakna Kasih',
      'Kempen "Hentikan Buli: Sekolah Selamat"',
      'Pendidikan Pencegahan Dadah, Vape & Rokok (PPDa)',
      'Kontrak Tingkah Laku & Bimbingan Pengurusan Kemarahan'
    ],
    pic: 'GBK bersama JK Disiplin & Guru Kelas'
  },
  {
    id: 'rpt-3',
    focus: 'Pendidikan Kerjaya',
    strategyTitle: 'Strategi Penerokaan Minat, Potensi & Hala Tuju Murid Awal',
    targetGroup: 'Murid Tahap 2 (Khususnya Tahun 6)',
    timeline: 'Penggal 1 & Penggal 2 (Mei - November)',
    kpi: '100% Murid Tahun 6 Lengkap Inventori IMK RIASEC & Sesi Bimbingan Hala Tuju SBP/MRSM',
    status: 'sedang_laksana',
    programs: [
      'Pelaksanaan Pentaksiran Psikometrik (Ppsi) IMK & IKeP',
      'Karnival Eksplorasi Kerjaya Masa Hadapan & STEM',
      'Program Kemahiran Belajar & Pengurusan Masa UASA',
      'Bimbingan Permohonan Kemasukan ke Sekolah Khusus'
    ],
    pic: 'Guru Bimbingan & Kaunseling'
  },
  {
    id: 'rpt-4',
    focus: 'Kesejahteraan Mental',
    strategyTitle: 'Strategi Intervensi Minda Sihat & Ketahanan Diri Psikososial',
    targetGroup: 'Semua Murid Tahap 2 & Murid Rujukan Khas',
    timeline: 'April - Oktober (Fasa Berkala)',
    kpi: '100% Murid Tahap 2 Menjalani Saringan Minda Sihat; 100% Murid Berisiko Menerima Intervensi',
    status: 'sedang_laksana',
    programs: [
      'Saringan Minda Sihat KPM (Skala Emosi Murid Rendah)',
      'Intervensi Terapi Ekspresif & Celik Minda',
      'Petak Luahan Emosi "Sampaikan Pada Kaunselor"',
      'Jalinan Kolaborasi bersama Pejabat Kesihatan Daerah (PKD)'
    ],
    pic: 'GBK & Penyelaras Kesihatan Sekolah'
  }
];

// ============================================================================
// 3. REKOD & LAPORAN SESI KAUNSELING (DOKUMEN KERAHSIAAN & PSIKOMETRIK)
// ============================================================================
export const initialUbkCounselingSessions: UbkCounselingSessionItem[] = [
  {
    id: 'ses-1',
    caseRef: 'BRPBK/2026/IND-001',
    clientCode: 'Klien A (Tahun 5 Inovatif)',
    type: 'individu',
    issueCategory: 'disiplin',
    referralSource: 'guru',
    sessionDate: '2026-09-02',
    sessionTime: '09:00 PG - 09:45 PG',
    sessionCount: 2,
    goals: 'Meneroka punca kelewatan hadir ke sekolah dan menstruktur rutin pagi kendiri murid.',
    intervention: 'Teori Tingkah Laku (Behavioral Therapy) - Menggunakan teknik peneguhan positif dan borang kontrak kehadiran harian.',
    status: 'aktif',
    psychometricData: {
      instrumentName: 'Saringan Minda Sihat (Skala Penyesuaian Diri)',
      scoreResult: 'Skor Normal (Tiada tanda kemurungan klinikal, isu tertumpu kepada pengurusan masa & pengangkutan)',
      actionPlan: 'Penetapan jadual tidur 9:30 malam & berbasikal bersama rakan setempat.'
    },
    confidentialNotice: 'Dokumen ini diklasifikasikan sebagai SULIT di bawah Akta Kaunselor 1998 (Akta 580). Butiran peribadi dirahsiakan.'
  },
  {
    id: 'ses-2',
    caseRef: 'BRPBK/2026/IND-002',
    clientCode: 'Klien B (Tahun 6 Cemerlang)',
    type: 'individu',
    issueCategory: 'emosi_psikososial',
    referralSource: 'sukarela',
    sessionDate: '2026-09-04',
    sessionTime: '11:00 PG - 11:50 PG',
    sessionCount: 1,
    goals: 'Mengurangkan kebimbangan (anxiety) dan tekanan harapan tinggi menghadapi peperiksaan UASA.',
    intervention: 'Terapi Kognitif Tingkah Laku (CBT) ringkas - Mengenal pasti pemikiran distorsi dan latihan pernafasan diafragma 4-7-8.',
    status: 'selesai',
    psychometricData: {
      instrumentName: 'Inventori Kecerdasan Pelbagai (IKeP) & Saringan Emosi',
      scoreResult: 'Kecerdasan Logik-Matematik & Intrapersonal Tinggi. Tahap kebimbangan sederhana (Mild Stress).',
      actionPlan: 'Murid mempraktikkan teknik relaksasi sebelum tidur dan membahagikan waktu rehat seimbang.'
    },
    confidentialNotice: 'Dokumen ini diklasifikasikan sebagai SULIT di bawah Akta Kaunselor 1998 (Akta 580).'
  },
  {
    id: 'ses-3',
    caseRef: 'BRPBK/2026/KLP-001',
    clientCode: 'Kelompok Aspirasi Kerjaya (6 Orang Tahun 6)',
    type: 'kelompok',
    issueCategory: 'kerjaya',
    referralSource: 'sukarela',
    sessionDate: '2026-09-08',
    sessionTime: '08:30 PG - 09:30 PG',
    sessionCount: 1,
    goals: 'Membimbing murid menganalisis profil kerjaya RIASEC Holland dan memadankan dengan sekolah khusus.',
    intervention: 'Kaunseling Kelompok Berstruktur - Aktiviti "Eksplorasi Dunia Pekerjaan Masa Depan".',
    status: 'aktif',
    psychometricData: {
      instrumentName: 'Inventori Minat Kerjaya (IMK Holland RIASEC)',
      scoreResult: 'Dominan Kod: Investigatif (I), Realistik (R), dan Sosial (S).',
      actionPlan: 'Menyediakan panduan syarat kemasukan SBP/MRSM dan persediaan Pentaksiran Kemasukan Sekolah Khusus (PKSK).'
    },
    confidentialNotice: 'Dokumen ini diklasifikasikan sebagai SULIT di bawah Akta Kaunselor 1998 (Akta 580).'
  },
  {
    id: 'ses-4',
    caseRef: 'BRPBK/2026/KON-001',
    clientCode: 'Ibu Bapa Murid C (Tahun 3 Kreatif)',
    type: 'konsultasi',
    issueCategory: 'keluarga',
    referralSource: 'waris',
    sessionDate: '2026-09-09',
    sessionTime: '10:30 PG - 11:30 PG',
    sessionCount: 1,
    goals: 'Konsultasi bersama waris mengenai perkembangan emosi murid di rumah dan keselarasan bimbingan di sekolah.',
    intervention: 'Teknik Konsultasi Keibubapaan Positif - Memberi panduan komunikasi empati dan penyusunan masa skrin gajet.',
    status: 'selesai',
    confidentialNotice: 'Dokumen ini diklasifikasikan sebagai SULIT di bawah Akta Kaunselor 1998 (Akta 580).'
  }
];

// ============================================================================
// 4. INSTRUMEN PENILAIAN PBPPP KHAS GBK (BUKAN PdPC GURU AKADEMIK)
// ============================================================================
export const initialUbkPbppp: UbkPbpppAssessment = {
  id: 'pbppp-2026',
  evaluatedYear: 2026,
  counselorName: 'Guru Bimbingan dan Kaunseling Sepenuh Masa (GBKSM)',
  evaluator1Name: 'Guru Besar SK Merbau Pulas (Pegawai Penilai 1)',
  evaluator2Name: 'Penolong Kanan Hal Ehwal Murid (Pegawai Penilai 2)',
  dimensions: [
    {
      id: 'dim-1',
      name: 'Dimensi 1: Profesionalisme & Pengurusan Perkhidmatan B&K',
      description: 'Pengurusan fail meja, buku rekod perkhidmatan BRPBK, etika Akta 580, perancangan RPT dan akauntabiliti perkhidmatan bimbingan.',
      weightage: 25,
      indicators: [
        'Buku Rekod Perkhidmatan Bimbingan & Kaunseling (BRPBK) diselenggara kemas dan dikemaskini setiap minggu.',
        'Rancangan Perkhidmatan Tahunan (RPT) selaras dengan 4 fokus utama KPM dan analisis keperluan sekolah.',
        'Pematuhan ketat kepada Kod Etika Lembaga Kaunselor Malaysia dan Akta Kaunselor 1998 (Akta 580).',
        'Pelaporan berkala dan dokumentasi impak perkhidmatan diserahkan kepada pentadbir sekolah.'
      ],
      score: 24,
      maxScore: 25
    },
    {
      id: 'dim-2',
      name: 'Dimensi 2: Pengendalian Sesi Kaunseling Individu & Kelompok',
      description: 'Kemahiran kaunseling terapeutik, penerokaan isu berstruktur, pemilihan intervensi bersesuaian, dan penjagaan kerahsiaan klien.',
      weightage: 30,
      indicators: [
        'Mencapai sasaran waktu perkhidmatan kaunseling individu dan kelompok murid (berjadual dan ad-hoc).',
        'Mengaplikasikan teori dan teknik kaunseling yang relevan dengan tahap perkembangan kanak-kanak.',
        'Menyediakan kontrak tingkah laku, borang persetujuan termaklum, dan rekod pemantauan klien.',
        'Mengendalikan rujukan kes krisis dan intervensi sokongan emosi secara pantas dan beretika.'
      ],
      score: 28.5,
      maxScore: 30
    },
    {
      id: 'dim-3',
      name: 'Dimensi 3: Pelaksanaan Kelas Bimbingan Modular & Program 4 Fokus',
      description: 'Pelaksanaan bimbingan modular di bilik darjah, pengurusan program sahsiah, disiplin, kerjaya, dan kesejahteraan minda sihat.',
      weightage: 25,
      indicators: [
        'Melaksanakan modul bimbingan kelompok mengikut jadual yang ditetapkan pihak pentadbiran.',
        'Menggerakkan Program Sahsiah Unggul Murid (SUMUR) dan Pembimbing Rakan Sebaya (PRS).',
        'Melaksanakan Pentaksiran Psikometrik (IMK & IKeP) serta saringan Minda Sihat secara menyeluruh.',
        'Keberkesanan program terbukti melalui penurunan salah laku dan peningkatan amalan baik SSDM.'
      ],
      score: 24,
      maxScore: 25
    },
    {
      id: 'dim-4',
      name: 'Dimensi 4: Pengurusan Bilik B&K, Kolaborasi Waris & Khidmat Komuniti',
      description: 'Persekitaran bilik kaunseling kondusif, program Ziarah Cakna Kasih, konsultasi ibu bapa, dan jalinan agensi luar.',
      weightage: 20,
      indicators: [
        'Bilik Kaunseling Individu, Kelompok, dan Sudut Terapi berada dalam keadaan kondusif, ceria dan selamat.',
        'Melaksanakan Ziarah Cakna Kasih bagi membantu murid berisiko cicir dan miskin tegar.',
        'Konsultasi berkesan bersama ibu bapa/penjaga dan guru kelas bagi menjayakan intervensi murid.',
        'Kerjasama erat bersama agensi sokongan luar (PDRM, JKM, Hospital, Pejabat Kesihatan).'
      ],
      score: 19,
      maxScore: 20
    }
  ],
  overallPercentage: 95.5,
  gradeLevel: 'Cemerlang',
  evaluatorFeedback: 'Prestasi perkhidmatan Guru Bimbingan dan Kaunseling amat cemerlang. Pengurusan e-BRPBK sangat tersusun, pematuhan etika kerahsiaan dipelihara tinggi, dan impak terhadap peningkatan disiplin serta amalan baik murid sangat ketara. Disahkan untuk penarafan PBPPP 2026.',
  lastUpdated: '2026-09-10',
  status: 'selesai_dinilai'
};

