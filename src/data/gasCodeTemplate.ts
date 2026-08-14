export const CODE_GS_SCRIPT = `/**
 * ==============================================================================
 * LAMAN SESAWANG RASMI SEKOLAH KEBANGSAAN MERBAU PULAS (KBA5012)
 * Backend Google Apps Script (Code.gs) + Google Sheets Auto-Setup
 * ==============================================================================
 * Username Admin : adminskmp
 * Password Admin : 123456
 * ==============================================================================
 */

// Global Sheet Tab Names Configuration
var SHEETS_CONFIG = {
  PROFIL: {
    name: "Profil_Sekolah",
    headers: ["Key", "Value"]
  },
  WARGA: {
    name: "Warga_Sekolah",
    headers: ["ID", "Nama", "Jawatan", "Kategori", "Gred", "Subjek/Tugas", "E-mel", "Telefon", "Foto_URL", "Susunan"]
  },
  BERITA: {
    name: "Berita_Pengumuman",
    headers: ["ID", "Tarikh", "Tajuk", "Kategori", "Ringkasan", "Kandungan", "Gambar_URL", "Penulis", "Sematkan"]
  },
  TAKWIM: {
    name: "Takwim_Sekolah",
    headers: ["ID", "Tajuk", "Tarikh_Mula", "Tarikh_Tamat", "Kategori", "Penerangan", "Lokasi", "Kumpulan_Sasaran"]
  },
  GALERI: {
    name: "Galeri_Media",
    headers: ["ID", "Tajuk", "Tarikh", "Kategori", "Jenis", "URL_Media", "Keterangan"]
  },
  ANUGERAH: {
    name: "Pencapaian_Anugerah",
    headers: ["ID", "Tajuk", "Penerima", "Peringkat", "Tahun", "Pencapaian", "Penerangan", "Gambar_URL"]
  },
  DOKUMEN: {
    name: "Pusat_Muat_Turun",
    headers: ["ID", "Tajuk", "Kategori", "Jenis_Fail", "Saiz_Fail", "Tarikh", "Bil_Muat_Turun", "URL_Muat_Turun"]
  },
  MAKLUM_BALAS: {
    name: "Maklum_Balas",
    headers: ["ID", "Tarikh_Terima", "Nama", "E-mel", "Telefon", "Kategori", "Subjek", "Mesej", "Status", "Catatan_Balasan"]
  },
  PIBG: {
    name: "Info_PIBG",
    headers: ["ID", "Jenis", "Tajuk", "Tarikh/Nama", "Jawatan/Penerangan", "Nombor_Telefon", "Catatan"]
  }
};

/**
 * Main Web App Entry Point
 * Menjana dan menyemak kesemua Tab & Header Google Sheet secara AUTOMATIK setiap kali dipanggil
 */
function doGet(e) {
  try {
    // AUTOMATIK: Menyemak dan mencipta kesemua tab & header jika belum wujud
    autoSetupDatabaseSheets();

    var template = HtmlService.createTemplateFromFile('Index');
    return template.evaluate()
      .setTitle('SK Merbau Pulas | Laman Sesawang Rasmi')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    return HtmlService.createHtmlOutput("<h3 style='color:red;'>Ralat Sistem Apps Script: " + err.toString() + "</h3>");
  }
}

/**
 * Endpoint POST untuk Menerima Data Automatik dari Portal (Aduan / Maklum Balas / Kemaskini Data)
 */
function doPost(e) {
  try {
    autoSetupDatabaseSheets();
    var contents = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    var action = contents.action || "submitFeedback";
    
    if (action === "submitFeedback") {
      var res = submitFeedback(contents.data || contents);
      return ContentService.createTextOutput(JSON.stringify(res))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Data diterima!" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fungsi Automatik untuk Menyemak dan Mencipta Tab & Header Google Sheet
 */
function autoSetupDatabaseSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;

  for (var key in SHEETS_CONFIG) {
    var config = SHEETS_CONFIG[key];
    var sheet = ss.getSheetByName(config.name);

    if (!sheet) {
      // Cipta tab baru jika belum wujud
      sheet = ss.insertSheet(config.name);
      // Tambah baris header pertama
      sheet.getRange(1, 1, 1, config.headers.length).setValues([config.headers]);
      
      // Kemaskan format header
      var headerRange = sheet.getRange(1, 1, 1, config.headers.length);
      headerRange.setBackground("#1E3A8A")
                 .setFontColor("#FFFFFF")
                 .setFontWeight("bold")
                 .setHorizontalAlignment("center");
      sheet.setFrozenRows(1);

      // Isi Data Asas laluan awal jika tab Profil Baru dicipta
      if (config.name === "Profil_Sekolah") {
        seedInitialProfileData(sheet);
      }
    }
  }
}

/**
 * Menyuntik data awal asas profil sekolah jika Google Sheet baru
 */
function seedInitialProfileData(sheet) {
  var defaultProfile = [
    ["Nama_Sekolah", "Sekolah Kebangsaan Merbau Pulas"],
    ["Kod_Sekolah", "KBA5012"],
    ["Alamat", "Jalan Baling, Kampong Merbau Pulas, 09300 Kuala Ketil, Kedah Darul Aman"],
    ["Telefon", "04-403 1200"],
    ["Email", "KBA5012@moe.edu.my"],
    ["Guru_Besar", "Puan Norhafiza binti Mohamad"],
    ["Motto", "Berilmu, Beramal, Berbakti"],
    ["Visi", "Pendidikan Berkualiti Insan Terdidik Negara Sejahtera."],
    ["Misi", "Melestarikan Sistem Pendidikan Yang Berkualiti Untuk Membangunkan Potensi Individu Bagi Memenuhi Aspirasi Negara."]
  ];
  sheet.getRange(2, 1, defaultProfile.length, 2).setValues(defaultProfile);
}

/**
 * Semakan Pengesahan Log Masuk Admin Sekolah
 */
function verifyAdmin(username, password) {
  if (username === "adminskmp" && password === "123456") {
    return {
      success: true,
      token: "SKMP_ADMIN_TOKEN_" + new Date().getTime(),
      user: "Pentadbir SK Merbau Pulas"
    };
  } else {
    return {
      success: false,
      message: "Nama pengguna atau kata laluan tidak sah!"
    };
  }
}

/**
 * Menyimpan Maklum Balas Daripada Pelawat Website
 */
function submitFeedback(data) {
  autoSetupDatabaseSheets();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS_CONFIG.MAKLUM_BALAS.name);
  
  var id = "FB-" + new Date().getTime();
  var tarikh = Utilities.formatDate(new Date(), "Asia/Kuala_Lumpur", "yyyy-MM-dd HH:mm:ss");
  
  sheet.appendRow([
    id,
    tarikh,
    data.name || "",
    data.email || "",
    data.phone || "",
    data.category || "Pertanyaan",
    data.subject || "",
    data.message || "",
    "baru",
    ""
  ]);

  return { success: true, message: "Maklum balas anda telah berjaya dihantar ke sistem sekolah. Terima kasih!" };
}

/**
 * Membaca Semua Data Dari Google Sheet untuk Frontend
 */
function getSchoolData() {
  autoSetupDatabaseSheets();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var result = {};
  for (var key in SHEETS_CONFIG) {
    var sheetName = SHEETS_CONFIG[key].name;
    var sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      var values = sheet.getDataRange().getValues();
      var headers = values.shift() || [];
      result[sheetName] = values.map(function(row) {
        var obj = {};
        headers.forEach(function(h, idx) {
          obj[h] = row[idx];
        });
        return obj;
      });
    }
  }
  return JSON.stringify(result);
}
`;

export const INDEX_HTML_SCRIPT = `<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sekolah Kebangsaan Merbau Pulas (KBA5012)</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- FontAwesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; color: #1e293b; }
    .bg-brand-blue { background-color: #1e3a8a; }
    .text-brand-gold { color: #d97706; }
  </style>
</head>
<body class="min-h-screen flex flex-col antialiased">

  <!-- TOP HEADER -->
  <header class="bg-blue-950 text-white border-b border-blue-800">
    <div class="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center font-bold text-blue-950 text-xl border-2 border-white shadow">
          SKMP
        </div>
        <div>
          <h1 class="font-extrabold text-lg sm:text-xl tracking-tight leading-none text-amber-400">SEKOLAH KEBANGSAAN MERBAU PULAS</h1>
          <p class="text-xs text-blue-200 mt-1">Kod Sekolah: KBA5012 | 09300 Kuala Ketil, Kedah Darul Aman</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="toggleModal('loginModal')" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-blue-950 font-semibold rounded-lg text-xs flex items-center gap-2 transition shadow">
          <i class="fa-solid fa-lock"></i> Log Masuk Admin
        </button>
      </div>
    </div>
  </header>

  <!-- NAVIGATION -->
  <nav class="bg-blue-900 text-white sticky top-0 z-40 shadow-md">
    <div class="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto py-2 gap-2 text-xs font-medium">
      <button onclick="showTab('utama')" class="nav-link px-3 py-2 rounded-md hover:bg-blue-800 flex items-center gap-2 font-bold text-amber-300">
        <i class="fa-solid fa-house"></i> Utama
      </button>
      <button onclick="showTab('profil')" class="nav-link px-3 py-2 rounded-md hover:bg-blue-800 flex items-center gap-2">
        <i class="fa-solid fa-school"></i> Profil Sekolah
      </button>
      <button onclick="showTab('organisasi')" class="nav-link px-3 py-2 rounded-md hover:bg-blue-800 flex items-center gap-2">
        <i class="fa-solid fa-sitemap"></i> Carta Organisasi
      </button>
      <button onclick="showTab('akademik')" class="nav-link px-3 py-2 rounded-md hover:bg-blue-800 flex items-center gap-2">
        <i class="fa-solid fa-graduation-cap"></i> Akademik & Takwim
      </button>
      <button onclick="showTab('berita')" class="nav-link px-3 py-2 rounded-md hover:bg-blue-800 flex items-center gap-2">
        <i class="fa-solid fa-newspaper"></i> Berita & Kenyataan
      </button>
      <button onclick="showTab('pautan')" class="nav-link px-3 py-2 rounded-md hover:bg-blue-800 flex items-center gap-2">
        <i class="fa-solid fa-download"></i> Portal & Muat Turun
      </button>
      <button onclick="showTab('hubungi')" class="nav-link px-3 py-2 rounded-md hover:bg-blue-800 flex items-center gap-2">
        <i class="fa-solid fa-envelope"></i> Hubungi Kami
      </button>
    </div>
  </nav>

  <!-- CONTENT CONTAINER -->
  <main class="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
    
    <!-- SEKSYEN UTAMA -->
    <div id="tab-utama" class="tab-content space-y-8">
      <div class="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div class="relative z-10 max-w-2xl space-y-4">
          <span class="px-3 py-1 bg-amber-500 text-blue-950 font-bold rounded-full text-xs uppercase tracking-wider">Motto: Berilmu, Beramal, Berbakti</span>
          <h2 class="text-3xl font-extrabold text-white leading-tight">Selamat Datang ke Laman Web Rasmi SK Merbau Pulas</h2>
          <p class="text-blue-100 text-sm">Pusat maklumat rasmi aktiviti sekolah, takwim, pautan sistem KPM, dan pengumuman terkini untuk guru, ibu bapa, dan murid.</p>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 class="font-bold text-blue-900 text-base mb-2 flex items-center gap-2">
            <i class="fa-solid fa-eye text-amber-500"></i> Visi Sekolah
          </h3>
          <p class="text-xs text-slate-600 leading-relaxed">Pendidikan Berkualiti Insan Terdidik Negara Sejahtera.</p>
        </div>
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 class="font-bold text-blue-900 text-base mb-2 flex items-center gap-2">
            <i class="fa-solid fa-bullseye text-amber-500"></i> Misi Sekolah
          </h3>
          <p class="text-xs text-slate-600 leading-relaxed">Melestarikan Sistem Pendidikan Yang Berkualiti Untuk Membangunkan Potensi Individu Bagi Memenuhi Aspirasi Negara.</p>
        </div>
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 class="font-bold text-blue-900 text-base mb-2 flex items-center gap-2">
            <i class="fa-solid fa-phone text-amber-500"></i> Hubungi Pejabat
          </h3>
          <p class="text-xs text-slate-600">Tel: 04-403 1200<br>E-mel: KBA5012@moe.edu.my</p>
        </div>
      </div>
    </div>

    <!-- SEKSYEN PROFIL -->
    <div id="tab-profil" class="tab-content hidden space-y-6">
      <div class="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h2 class="text-2xl font-bold text-blue-900 mb-4 pb-2 border-b">Latar Belakang & Sejarah Sekolah</h2>
        <p class="text-slate-600 text-sm leading-relaxed mb-4">Sekolah Kebangsaan Merbau Pulas (KBA5012) terletak di daerah Kuala Ketil, Kedah. Ditubuhkan sejak tahun 1954, sekolah ini komited dalam melahirkan generasi murid yang cemerlang dalam bidang akademik, sahsiah, mahupun kokurikulum.</p>
      </div>
    </div>

  </main>

  <!-- LOGIN MODAL -->
  <div id="loginModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-lg text-blue-950">Log Masuk Admin Sekolah</h3>
        <button onclick="toggleModal('loginModal')" class="text-slate-400 hover:text-slate-600"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <form onsubmit="handleLogin(event)" class="space-y-4">
        <div>
          <label class="text-xs font-semibold text-slate-700 block mb-1">Nama Pengguna (Username)</label>
          <input type="text" id="adminUser" value="adminskmp" required class="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none">
        </div>
        <div>
          <label class="text-xs font-semibold text-slate-700 block mb-1">Kata Laluan (Password)</label>
          <input type="password" id="adminPass" value="123456" required class="w-full text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none">
        </div>
        <button type="submit" class="w-full py-2.5 bg-blue-900 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition">
          Daftar Masuk
        </button>
      </form>
    </div>
  </div>

  <!-- FOOTER -->
  <footer class="bg-blue-950 text-white border-t border-blue-900 mt-12 py-8 text-center text-xs">
    <div class="max-w-7xl mx-auto px-4">
      <p class="font-semibold text-slate-300">Hak Cipta Terpelihara © 2026 - Sekolah Kebangsaan Merbau Pulas (KBA5012)</p>
      <p class="text-slate-400 mt-1">Sistem Laman Web Interaktif Dikuasakan Oleh Google Apps Script & Google Sheets</p>
    </div>
  </footer>

  <script>
    function showTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      var target = document.getElementById('tab-' + tabId);
      if(target) target.classList.remove('hidden');
    }

    function toggleModal(id) {
      var modal = document.getElementById(id);
      if(modal) modal.classList.toggle('hidden');
    }

    function handleLogin(e) {
      e.preventDefault();
      var u = document.getElementById('adminUser').value;
      var p = document.getElementById('adminPass').value;
      if (u === 'adminskmp' && p === '123456') {
        alert('Log masuk berjaya sebagai Admin SK Merbau Pulas!');
        toggleModal('loginModal');
      } else {
        alert('Nama pengguna atau kata laluan tidak sah!');
      }
    }
  </script>
</body>
</html>
`;
