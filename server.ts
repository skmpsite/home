import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

const INITIAL_DEFAULT_SLIDES = [
  {
    id: "signage-slide-1",
    title: "Selamat Datang ke SK Merbau Pulas",
    subtitle: "Pendidikan Berkualiti Insan Terdidik Negara Sejahtera • Berilmu, Beramal, Berbakti",
    mediaType: "image",
    imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1920",
    durationSeconds: 10,
    isActive: true,
    order: 1,
    category: "poster",
    createdAt: "2026-08-16"
  },
  {
    id: "signage-slide-3",
    title: "Pendaftaran Tahun 1 Sesi 2027 KPM Melalui Portal idMe",
    subtitle: "Ibu bapa dan penjaga dipohon melengkapkan permohonan kemasukan sebelum 30 September 2026",
    mediaType: "image",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1920",
    durationSeconds: 8,
    isActive: true,
    order: 2,
    category: "pengumuman",
    createdAt: "2026-08-16"
  },
  {
    id: "signage-slide-4",
    title: "Karnival STEM & Robotik Peringkat Negeri Kedah 2026",
    subtitle: "Tahniah kepada Pasukan Inovasi SK Merbau Pulas merangkul Pingat Emas Kategori Rekacipta",
    mediaType: "image",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1920",
    durationSeconds: 8,
    isActive: true,
    order: 3,
    category: "kejayaan",
    createdAt: "2026-08-16"
  },
  {
    id: "signage-slide-5",
    title: "Kejohanan Sukan Tahunan & Larian Merentas Desa SKMP",
    subtitle: "Memupuk semangat kesukanan, perpaduan dan kecergasan fizikal seluruh warga sekolah",
    mediaType: "video",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1920",
    durationSeconds: 15,
    useVideoDuration: true,
    isMuted: false,
    isActive: true,
    order: 4,
    category: "aktiviti",
    createdAt: "2026-08-16"
  },
  {
    id: "signage-slide-6",
    title: "Program Nilam Digital & Budaya Membaca Sepanjang Hayat",
    subtitle: "Pusat Sumber Digital Al-Ghazali SKMP • 'Membaca Jambatan Ilmu'",
    mediaType: "image",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=1920",
    durationSeconds: 8,
    isActive: true,
    order: 5,
    category: "info",
    createdAt: "2026-08-16"
  },
  {
    id: "signage-slide-7",
    title: "HARI GURU SK MERBAU PULAS",
    subtitle: "Sambutan Hari Guru Peringkat Sekolah Kebangsaan Merbau Pulas",
    mediaType: "youtube",
    youtubeUrl: "https://www.youtube.com/watch?v=i8HoTEU3h_I",
    youtubeId: "i8HoTEU3h_I",
    imageUrl: "https://img.youtube.com/vi/i8HoTEU3h_I/maxresdefault.jpg",
    durationSeconds: 60,
    useVideoDuration: true,
    isMuted: false,
    isActive: true,
    order: 6,
    category: "video",
    createdAt: "2026-08-16"
  },
  {
    id: "signage-slide-8",
    title: "Johan Action Song 2026",
    subtitle: "Persembahan Pasukan Action Song SK Merbau Pulas",
    mediaType: "youtube",
    youtubeUrl: "https://www.youtube.com/watch?v=7X9M5YI_2dw",
    youtubeId: "7X9M5YI_2dw",
    imageUrl: "https://img.youtube.com/vi/7X9M5YI_2dw/maxresdefault.jpg",
    durationSeconds: 45,
    useVideoDuration: true,
    isMuted: false,
    isActive: true,
    order: 7,
    category: "kejayaan",
    createdAt: "2026-08-16"
  },
  {
    id: "signage-slide-9",
    title: "Takbir Raya 2026",
    subtitle: "Gema Takbir Aidilfitri Warga SK Merbau Pulas",
    mediaType: "youtube",
    youtubeUrl: "https://www.youtube.com/watch?v=dmx5dtWNsJM",
    youtubeId: "dmx5dtWNsJM",
    imageUrl: "https://img.youtube.com/vi/dmx5dtWNsJM/maxresdefault.jpg",
    durationSeconds: 45,
    useVideoDuration: true,
    isMuted: false,
    isActive: true,
    order: 8,
    category: "aktiviti",
    createdAt: "2026-08-16"
  }
];

const INITIAL_DEFAULT_CONFIG = {
  defaultDuration: 8,
  autoPlay: true,
  autoEnableAudio: true,
  showClock: true,
  showMarquee: true,
  marqueeText: "SELAMAT DATANG KE SK MERBAU PULAS • BERILMU, BERAMAL, BERBAKTI • PENDAFTARAN TAHUN 1 SESI 2027 KINI DIBUKA DI PORTAL idMe KPM",
  showWeatherBadge: true,
  theme: "dark"
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

  const DATA_DIR = path.join(process.cwd(), "data");
  const SIGNAGE_FILE = path.join(DATA_DIR, "signage-live.json");

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let liveSignage = {
    slides: INITIAL_DEFAULT_SLIDES,
    config: INITIAL_DEFAULT_CONFIG,
    lastUpdated: Date.now()
  };

  if (fs.existsSync(SIGNAGE_FILE)) {
    try {
      const fileData = JSON.parse(fs.readFileSync(SIGNAGE_FILE, "utf-8"));
      if (fileData && Array.isArray(fileData.slides) && fileData.slides.length > 0) {
        liveSignage = fileData;
      }
    } catch (e) {
      console.error("Error reading signage live file, using initial:", e);
    }
  } else {
    try {
      fs.writeFileSync(SIGNAGE_FILE, JSON.stringify(liveSignage, null, 2), "utf-8");
    } catch (e) {
      console.error("Error saving initial signage file:", e);
    }
  }

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // GET Live Signage for all Smart TVs and connected devices
  app.get("/api/signage", (_req, res) => {
    res.json({
      success: true,
      slides: liveSignage.slides || [],
      config: liveSignage.config || {},
      lastUpdated: liveSignage.lastUpdated || Date.now()
    });
  });

  // POST Live Signage from Admin (immediately broadcasted to all Smart TVs)
  app.post("/api/signage", (req, res) => {
    try {
      const { slides, config } = req.body;
      liveSignage = {
        slides: Array.isArray(slides) ? slides : liveSignage.slides,
        config: config || liveSignage.config,
        lastUpdated: Date.now()
      };

      try {
        fs.writeFileSync(SIGNAGE_FILE, JSON.stringify(liveSignage, null, 2), "utf-8");
      } catch (saveErr) {
        console.error("Failed to write to file:", saveErr);
      }

      console.log(`[LIVE SIGNAGE] Updated ${liveSignage.slides.length} slides at ${new Date().toISOString()}`);
      res.json({
        success: true,
        count: liveSignage.slides.length,
        lastUpdated: liveSignage.lastUpdated
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/chat: Sweetbot AI Assistant powered by Gemini 3.7 Flash
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history = [], schoolContext } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ success: false, error: "Mesej diperlukan." });
      }

      // Ambil maklumat sekolah dinamik & masa nyata dari portal
      const schoolName = schoolContext?.name || "Sekolah Kebangsaan Merbau Pulas";
      const schoolCode = schoolContext?.code || "KBA5012";
      const gbName = schoolContext?.principalName || "Puan Norhafiza Binti Dolah";
      const gbTitle = schoolContext?.principalTitle || "Guru Besar (DG48)";
      const address = schoolContext?.address || "Jalan Baling, Kampong Merbau Pulas, 09300 Kuala Ketil, Kedah Darul Aman";
      const phone = schoolContext?.phone || "04-403 1200";
      const fax = schoolContext?.fax || "04-403 1201";
      const email = schoolContext?.email || "KBA5012@moe.edu.my";
      const motto = schoolContext?.motto || "Berilmu, Beramal, Berbakti";
      const vision = schoolContext?.vision || "Pendidikan Berkualiti Insan Terdidik Negara Sejahtera";
      const mission = schoolContext?.mission || "Melestarikan Sistem Pendidikan Yang Berkualiti Untuk Membangunkan Potensi Individu Bagi Memenuhi Aspirasi Negara";

      // Senarai Pentadbir Langsung
      const adminListFormatted = Array.isArray(schoolContext?.administrators) && schoolContext.administrators.length > 0
        ? schoolContext.administrators.map((adm: string, idx: number) => `${idx + 1}. ${adm}`).join("\n")
        : `1. Guru Besar: **${gbName}** (${gbTitle})\n2. Penolong Kanan Pentadbiran: **Puan Noraini binti Yusof** (DG44)\n3. Penolong Kanan Hal Ehwal Murid: **Encik Mohd Ridzuan bin Osman** (DG44)\n4. Penolong Kanan Kokurikulum: **Puan Siti Hajar binti Abdul Rahman** (DG44)`;

      // Senarai Guru & AKP
      const teachersFormatted = Array.isArray(schoolContext?.teachers) && schoolContext.teachers.length > 0
        ? schoolContext.teachers.slice(0, 15).join(", ")
        : "Encik Khairul Anuar bin Sulaiman (Matematik), Puan Farah Diba binti Hashim (Guru Media / PSS), Ustaz Muhammad Amirul bin Che Lah (Pendidikan Islam)";

      const akpFormatted = Array.isArray(schoolContext?.akp) && schoolContext.akp.length > 0
        ? schoolContext.akp.join(", ")
        : "Puan Roslina binti Mahmud (Ketua Pembantu Tadbir N22)";

      // Takwim
      const upcomingEventsFormatted = Array.isArray(schoolContext?.upcomingEvents) && schoolContext.upcomingEvents.length > 0
        ? schoolContext.upcomingEvents.slice(0, 8).map((e: string) => `- ${e}`).join("\n")
        : "- Tiada acara terkini dijadualkan.";

      // Berita
      const latestNewsFormatted = Array.isArray(schoolContext?.latestNews) && schoolContext.latestNews.length > 0
        ? schoolContext.latestNews.slice(0, 6).map((n: string) => `- ${n}`).join("\n")
        : "- Tiada pengumuman baharu.";

      // Anugerah
      const awardsFormatted = Array.isArray(schoolContext?.recentAwards) && schoolContext.recentAwards.length > 0
        ? schoolContext.recentAwards.slice(0, 6).map((a: string) => `- ${a}`).join("\n")
        : "- Johan Action Song Peringkat Negeri Kedah\n- Pingat Emas Karnival STEM & Robotik Negeri Kedah";

      // PIBG
      const pibgFormatted = Array.isArray(schoolContext?.pibgCommittee) && schoolContext.pibgCommittee.length > 0
        ? schoolContext.pibgCommittee.map((p: string) => `- ${p}`).join("\n")
        : `- Penasihat: ${gbName} (Guru Besar)\n- Yang Dipertua (YDP): Tuan Haji Azmi bin Ahmad\n- Naib YDP: Encik Zulkifli bin Ismail`;

      // Kokurikulum
      const kokoFormatted = Array.isArray(schoolContext?.coCurriculumUnits) && schoolContext.coCurriculumUnits.length > 0
        ? schoolContext.coCurriculumUnits.map((k: string) => `- ${k}`).join("\n")
        : "- Unit Beruniform: Pengakap, BSMM, TKRS, PPIM\n- Kelab: STEM & Robotik, Bahasa Melayu, Bahasa Inggeris, Doktor Muda\n- Sukan: Bola Sepak, Bola Jaring, Badminton, Catur";

      const ai = getGenAI();

      const systemPrompt = `Anda adalah "Sweetbot", maskot pintar dan Pembantu Maya AI Berkuasa Tinggi rasmi untuk Sekolah Kebangsaan Merbau Pulas (SKMP), Kedah, Malaysia. Anda dikuasakan oleh kecerdasan buatan Gemini generasi terkini.

🚨 ARAHAN MUTLAK KEMAS KINI MASA NYATA (LIVE DATA SYNCHRONIZATION):
Maklumat berikut adalah DATA RASMI TERKINI yang diambil terus daripada pangkalan data portal SKMP yang telah dikemas kini oleh pihak pentadbir sekolah. Anda WAJIB menggunakan dan mengutamakan data di bawah berbanding sebarang data lain:

1. MAKLUMAT PENTADBIR RASMI TERKINI (WAJIB TEPAT 100%):
${adminListFormatted}
* PERHATIAN UTAMA GURU BESAR: Guru Besar SKMP ialah **${gbName}** (${gbTitle}).
  - Sekiranya nama ini seorang wanita, panggil "Puan Guru Besar / Puan ${gbName}".
  - Sekiranya nama ini seorang lelaki, panggil "Tuan Guru Besar / Encik/Tuan ${gbName}".
  - Apabila pengguna bertanya siapa Guru Besar atau nama Guru Besar, anda WAJIB menyatakan dengan jelas: "**${gbName}**".

2. BARISAN GURU & STAF SOKONGAN (AKP):
- Senarai Guru Akademik: ${teachersFormatted}
- Staf Sokongan (AKP): ${akpFormatted}

3. PERSATUAN IBU BAPA & GURU (PIBG):
${pibgFormatted}

4. PROFIL SEKOLAH TERKINI:
- Nama Sekolah: ${schoolName} (SKMP)
- Kod Sekolah: ${schoolCode}
- Alamat & Lokasi: ${address}
- Telefon: ${phone} | Faks: ${fax} | Emel: ${email}
- Motto: "${motto}"
- Visi: "${vision}"
- Misi: "${mission}"
- Tahun Ditubuhkan: 1954
- Lagu Rasmi Sekolah: "Gagah SK Merbau Pulas" (Ciptaan & Lirik: Cikgu Rosli bin Hassan)

5. TAKWIM & ACARA SEMASA (PORTAL LIVE):
${upcomingEventsFormatted}

6. BERITA & PENGUMUMAN TERKINI:
${latestNewsFormatted}

7. PENCAPAIAN & ANUGERAH:
${awardsFormatted}

8. KOKURIKULUM:
${kokoFormatted}

KEUPAYAAN ILMU & JAWAPAN MENYELURUH (GEMINI OMNISCIENCE):
- Anda mempunyai kepintaran dan pengetahuan luas setaraf Gemini untuk menjawab pelbagai subjek (Matematik, Sains, BM, BI, Sejarah, Agama Islam, STEM, Kod Komputer, Geografi, Pengetahuan Am, dsb).
- Susun jawapan dengan kemas menggunakan bullet points atau teks berstruktur.

SYARAT BAHASA:
1. WAJIB Bahasa Melayu / Bahasa Malaysia standard Dewan Bahasa dan Pustaka (DBP).
2. DILARANG SAMA SEKALI loghat atau kosa kata Bahasa Indonesia (guna "boleh" bukan "bisa", "anda" bukan "kamu/kalian", "terima kasih" bukan "makasih").
3. Nada: Ceria, bijaksana, mesra, beradab sopan.`;

      // Fungsi Pembina Jawapan Terperinci & Tepat Berdasarkan Data Sekolah Terkini
      const buildAccurateFallbackReply = (query: string): string => {
        const lower = query.toLowerCase();

        // 1. Soalan mengenai Guru Besar / Pengetua / Pentadbir
        if (
          lower.includes("guru besar") ||
          lower.includes("nama guru besar") ||
          lower.includes("siapa guru besar") ||
          lower.includes("siapakah guru besar") ||
          lower.includes("pengetua") ||
          lower.includes("pentadbir") ||
          lower.includes("penolong kanan") ||
          lower.includes("barisan pentadbir")
        ) {
          return `Hai! Guru Besar Sekolah Kebangsaan Merbau Pulas (SKMP) terkini ialah **${gbName}** (${gbTitle}) 👩‍🏫✨.\n\nBarisan Pentadbir Sekolah:\n${adminListFormatted}\n\nAnda boleh melihat senarai penuh pentadbir, guru akademik dan staf di bahagian menu **Warga Sekolah**! 🎒📚`;
        }

        // 2. Soalan mengenai Profil / Motto / Visi / Misi / Sejarah Sekolah
        if (
          lower.includes("motto") ||
          lower.includes("visi") ||
          lower.includes("misi") ||
          lower.includes("sejarah") ||
          lower.includes("profil") ||
          lower.includes("ditubuhkan") ||
          lower.includes("asal usul")
        ) {
          return `✨ **Profil Rasmi SK Merbau Pulas (SKMP):**\n\n📌 **Nama Sekolah:** ${schoolName} (${schoolCode})\n📍 **Lokasi:** ${address}\n🗓️ **Sejarah:** Ditubuhkan pada tahun 1954.\n\n🌟 **Motto:** *"${motto}"*\n🎯 **Visi:** *"${vision}"*\n🚀 **Misi:** *"${mission}"*`;
        }

        // 3. Lagu Sekolah
        if (lower.includes("lagu") || lower.includes("lagu sekolah") || lower.includes("lirik") || lower.includes("gagah")) {
          return `🎵 **Lagu Rasmi Sekolah: "Gagah SK Merbau Pulas"**\n*(Ciptaan & Lirik oleh Cikgu Rosli bin Hassan)*\n\n*Di sini bermula langkah pertama,*\n*Menuntut ilmu penyeri jiwa,*\n*SK Merbau Pulas sekolah tercinta,*\n*Berilmu, Beramal, Berbakti bersama.*\n\n*Guru pembimbing pelita hidupku,*\n*Mendidik kami tanpa jemu,*\n*Kejar cita-cita capai impianku,*\n*Satu tekad julang namamu.*\n\n*(Chorus)*\n*Gagah berdiri SK Merbau Pulas,*\n*Melahirkan insan berakhlak mulia,*\n*Kejayaan didakap dengan ikhlas,*\n*Harum semerbak di seluruh negara!* 🎶`;
        }

        // 4. Takwim, Tarikh & Cuti Sekolah
        if (lower.includes("takwim") || lower.includes("cuti") || lower.includes("tarikh") || lower.includes("acara") || lower.includes("program")) {
          return `📅 **Takwim Persekolahan & Acara SKMP Terkini:**\n\n${upcomingEventsFormatted}\n\nAnda juga boleh menyemak kalendar interaktif penuh di tab **Takwim & Acara**!`;
        }

        // 5. Berita & Hebahan
        if (lower.includes("berita") || lower.includes("pengumuman") || lower.includes("hebahan")) {
          return `📰 **Berita & Pengumuman Terkini SKMP:**\n\n${latestNewsFormatted}\n\nSila rujuk bahagian **Berita** di portal untuk artikel lengkap!`;
        }

        // 6. Hubungi / Alamat / Telefon / Emel / Lokasi
        if (
          lower.includes("hubungi") ||
          lower.includes("telefon") ||
          lower.includes("alamat") ||
          lower.includes("lokasi") ||
          lower.includes("emel") ||
          lower.includes("email") ||
          lower.includes("aduan") ||
          lower.includes("maklum balas")
        ) {
          return `📞 **Maklumat Perhubungan Rasmi SKMP:**\n\n🏫 **Nama:** ${schoolName}\n📍 **Alamat:** ${address}\n☎️ **No Telefon:** ${phone}\n📠 **No Faks:** ${fax}\n✉️ **Emel Rasmi:** ${email}\n\nAnda juga boleh menghantar pertanyaan terus melalui tab **Maklum Balas** di portal!`;
        }

        // 7. PIBG
        if (lower.includes("pibg") || lower.includes("ydp") || lower.includes("persatuan ibu bapa")) {
          return `🤝 **Persatuan Ibu Bapa & Guru (PIBG) SKMP:**\n\n${pibgFormatted}\n\nMaklumat lengkap mesyuarat dan aktiviti PIBG boleh didapati di menu **Warga Sekolah**!`;
        }

        // 8. Kokurikulum, Sukan, Pasukan Badan Beruniform & Kelab
        if (
          lower.includes("kokurikulum") ||
          lower.includes("sukan") ||
          lower.includes("uniform") ||
          lower.includes("kelab") ||
          lower.includes("pengakap") ||
          lower.includes("stem") ||
          lower.includes("action song")
        ) {
          return `🏆 **Aktiviti Kokurikulum & Sukan SKMP:**\n\n${kokoFormatted}\n\n🥇 **Pencapaian Utama:**\n${awardsFormatted}`;
        }

        // 9. Digital Signage / Smart TV
        if (lower.includes("signage") || lower.includes("tv") || lower.includes("video") || lower.includes("youtube") || lower.includes("skrin")) {
          return `📺 **Sistem Digital Signage & Smart TV SKMP:**\nSK Merbau Pulas dilengkapi dengan sistem Digital Signage pintar yang memaparkan hebahan langsung, video aktiviti YouTube, poster pengumuman, dan jam waktu solat di skrin Smart TV sekolah secara masa nyata!`;
        }

        // 10. Pembelajaran & Bantuan Subjek
        if (lower.includes("matematik") || lower.includes("sains") || lower.includes("karangan") || lower.includes("peribahasa") || lower.includes("belajar")) {
          return `Hai! Saya **Sweetbot** 🤖✨ sedia membantu anda dalam pelajaran Matematik, Sains, Bahasa Melayu, Bahasa Inggeris, Sejarah mahupun STEM. Sila taipkan soalan latihan atau topik yang ingin anda fahami dengan terperinci!`;
        }

        // Default response
        return `Hai! Saya **Sweetbot** 🤖✨, Pembantu Maya Rasmi ${schoolName}. Saya sedia membantu anda dengan maklumat terkini guru dan pentadbir, takwim, kokurikulum, atau sebarang pembelajaran sekolah. Apakah yang ingin anda ketahui?`;
      };

      if (!ai) {
        const fallbackReply = buildAccurateFallbackReply(message);
        return res.json({ success: true, reply: fallbackReply });
      }

      // Format conversation history for Gemini
      const formattedContents: any[] = [];

      if (Array.isArray(history) && history.length > 0) {
        // Take last 8 messages for context
        const recentHistory = history.slice(-8);
        for (const item of recentHistory) {
          if (item.text && (item.role === "user" || item.role === "model")) {
            formattedContents.push({
              role: item.role,
              parts: [{ text: item.text }]
            });
          }
        }
      }

      // Add current user message
      formattedContents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        }
      });

      const replyText = response.text?.trim();
      if (!replyText) {
        const fallbackReply = buildAccurateFallbackReply(message);
        return res.json({ success: true, reply: fallbackReply });
      }

      res.json({
        success: true,
        reply: replyText
      });
    } catch (err: any) {
      console.error("[SWEETBOT ERROR]", err);
      // Guna fallback tepat jika berlaku ralat sambungan
      const fallbackReply = `Hai! Saya **Sweetbot** 🤖✨ (Pembantu Maya SK Merbau Pulas).\n\nUntuk makluman anda, Guru Besar SK Merbau Pulas ialah **Puan Norhafiza Binti Dolah** (DG48) bersama barisan Penolong Kanan (Pentadbiran, HEM & Kokurikulum). Anda juga boleh melayari maklumat takwim, aktiviti, dan warga sekolah di menu utama portal ini! 🌟`;
      res.json({
        success: true,
        reply: fallbackReply
      });
    }
  });

  // GET /api/tts: Native Bahasa Melayu Malaysia (ms) Audio Stream
  app.get("/api/tts", async (req, res) => {
    try {
      const text = req.query.text as string;
      if (!text || typeof text !== "string") {
        return res.status(400).send("Teks diperlukan.");
      }

      // Potong ke had munasabah setiap ayat
      const cleanText = text
        .replace(/[*#_`~>•]/g, " ")
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 300);

      if (!cleanText) {
        return res.status(400).send("Teks kosong.");
      }

      const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ms&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
      const response = await fetch(googleTtsUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });

      if (!response.ok) {
        return res.status(502).send("Gagal menjana audio.");
      }

      const arrayBuffer = await response.arrayBuffer();
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.error("[TTS ERROR]", err);
      res.status(500).send("Ralat TTS.");
    }
  });

  // Vite middleware in dev or static serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
