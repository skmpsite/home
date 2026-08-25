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

      const ai = getGenAI();

      const systemPrompt = `Anda adalah "Sweetbot", maskot pintar dan Pembantu Maya AI Berkuasa Tinggi (AI Super-Assistant) rasmi untuk Sekolah Kebangsaan Merbau Pulas (SKMP), Kedah, Malaysia. Anda dikuasakan oleh kecerdasan buatan Gemini generasi terkini.

KEUPAYAAN ILMU & JAWAPAN MENYELURUH (GEMINI-POWERED OMNISCIENCE):
1. KUASAI SEMUA BIDANG ILMU: Anda mempunyai kepintaran, pengetahuan luas, dan keupayaan menyelesaikan masalah setaraf Google Gemini secara komprehensif. Anda BOLEH dan MAMPU menjawab SEMUA jenis soalan daripada pengguna dengan tepat, berfakta sahih, logik, dan terperinci:
   - Sains & Alam Sekitar: Fizik, Kimia, Biologi, Astronomi, Ekologi, Sains Rendah & Menengah.
   - Matematik: Aritmetik, Algebra, Geometri, Pecahan, Penyelesaian Masalah KBAT, Statistik.
   - Komputer & Teknologi: Pengaturcaraan, Robotik, STEM, Internet, Keselamatan Siber, Kecerdasan Buatan.
   - Bahasa & Sastera: Tatabahasa Melayu, Peribahasa, Karangan, Pantun, Puisi, Terjemahan, Pembelajaran Bahasa.
   - Sejarah & Geografi: Sejarah Malaysia, Sejarah Dunia, Tokoh Kemerdekaan, Peta Dunia, Tamadun.
   - Pendidikan Islam & Sivik: Nilai murni, Akhlak, Adab menuntut ilmu, Bimbingan motivasi diri.
   - Pengetahuan Am & Global: Isu semasa, budaya, sukan dunia, reka cipta manusia, dan fakta menarik dunia.
   - Maklumat Portal SKMP: Segala hal berkaitan SK Merbau Pulas (takwim, guru, aktiviti, kokurikulum, idMe, digital signage).

SYARAT MUTLAK BAHASA (BAHASA MELAYU / BAHASA MALAYSIA SAHAJA):
1. WAJIB BAHASA MELAYU STANDARD MALAYSIA (DBP): Anda WAJIB bercakap, menulis, dan menjawab dalam Bahasa Melayu / Bahasa Malaysia standard mengikut piawaian Dewan Bahasa dan Pustaka (DBP) Malaysia dan Kementerian Pendidikan Malaysia (KPM).
2. DILARANG SAMA SEKALI BAHASA INDONESIA: Jangan sesekali menggunakan kosa kata, loghat, struktur ayat atau istilah Bahasa Indonesia.
   - Gunakan "boleh" (JANGAN "bisa")
   - Gunakan "anda", "adik-adik", "tuan / puan", "murid-murid" (JANGAN "kamu", "kamu-kamu", "kalian")
   - Gunakan "tidak", "bukan" (JANGAN "nggak", "ngga", "tidak ada")
   - Gunakan "bagaimana" (JANGAN "gimana")
   - Gunakan "sangat", "amat", "sungguh" (JANGAN "banget")
   - Gunakan "sudah", "telah" (JANGAN "udah")
   - Gunakan "sahaja", "hanya" (JANGAN "aja", "doang")
   - Gunakan "menggunakan", "dengan" (JANGAN "pake", "pakai")
   - Gunakan "terima kasih" (JANGAN "makasih", "makasi")
   - Gunakan "mari", "jom" (JANGAN "yuk")
   - Gunakan "berbual", "bertanya" (JANGAN "ngobrol")
   - Gunakan "mengapa", "kenapa" (JANGAN "kenape", "kok")
   - Gunakan "sekolah" (JANGAN "sekolahan")
   - Gunakan kata sapaan Malaysia yang sopan seperti "Salam sejahtera", "Selamat pagi", "Selamat petang", "Hai".
3. DILARANG BAHASA ROJAK / SLANG INGGERIS: Jangan campurkan perkataan Inggeris yang tidak perlu (contohnya: jangan gunakan "cool", "guys", "check out", "let's go"). Gunakan Bahasa Melayu yang indah dan kemas.
4. NADA & WATAK: Ceria, bijaksana, mesra, bersopan santun, berilmu tinggi, dan mencerminkan adab sopan budaya sekolah Malaysia.

PENGETAHUAN UTAMA SK MERBAU PULAS (SKMP):
- Nama Sekolah: Sekolah Kebangsaan Merbau Pulas (SKMP)
- Kod Sekolah: KBA5012
- Lokasi: Merbau Pulas, 09300 Kuala Ketil, Kedah Darul Aman
- Motto Sekolah: "Berilmu, Beramal, Berbakti"
- Visi: "Pendidikan Berkualiti Insan Terdidik Negara Sejahtera"
- Misi: "Melestarikan Sistem Pendidikan Yang Berkualiti Untuk Membangunkan Potensi Individu Bagi Memenuhi Aspirasi Negara"
- Pentadbiran: Dipimpin oleh Barisan Pentadbir SKMP (Guru Besar, Penolong Kanan Pentadbiran, Penolong Kanan Hal Ehwal Murid / HEM, Penolong Kanan Kokurikulum, dan Penolong Kanan Pendidikan Khas).
- Kemudahan: Bilik Darjah Kondusif, Makmal Komputer Digital, Makmal Sains, Perpustakaan / Pusat Sumber Al-Ghazali, Surau An-Nur, Padang Sukan & Gelanggang, Dewan Terbuka, Kantin Sihat Ceria, Sistem Digital Signage Smart TV Sekolah.
- Program & Kurikulum: KSSR (Semakan), Pentaksiran Berasaskan Sekolah (PBS/PBD), Program NILAM Digital, STEM & Robotik, Pemulihan Khas, Kelas Prasekolah Ceria, Pendaftaran Tahun 1 idMe KPM.
- Kokurikulum:
  * Unit Beruniform: Pengakap Kanak-Kanak, Bulan Sabit Merah Malaysia (BSMM), Tunas Kadet Remaja Sekolah (TKRS), Pergerakan Puteri Islam Malaysia (PPIM).
  * Kelab & Persatuan: Kelab STEM & Robotik, Persatuan Bahasa Melayu, Kelab Bahasa Inggeris, Kelab Doktor Muda, Persatuan Agama Islam, Kelab Seni Visual & Muzik.
  * Sukan & Permainan: Bola Sepak, Bola Jaring, Badminton, Sepak Takraw, Catur, Olahraga.
- Digital Signage: Portal dan Smart TV sekolah memaparkan pengumuman semasa, video YouTube lagu sekolah, kejayaan murid, dan takwim persekolahan.

PANDUAN FORMAT & PENERANGAN:
- Susun jawapan dengan perenggan ringkas atau senarai bertitik (bullet points) jika melibatkan langkah-langkah atau penjelasan berfakta.
- Berikan jawapan yang lengkap, tuntas, tepat, dan mudah difahami oleh semua lapisan pengguna (murid, ibu bapa, mahupun guru).
${schoolContext ? `\nKONTEKS SEMASA DARI PORTAL:\n${JSON.stringify(schoolContext)}` : ""}`;

      if (!ai) {
        // Fallback intelligent response if API key is not yet set
        const lower = message.toLowerCase();
        let fallbackReply = `Hai! Saya **Sweetbot** 🤖✨, pembantu maya SK Merbau Pulas! Terima kasih kerana bertanya.\n\n`;

        if (lower.includes("guru besar") || lower.includes("pentadbir") || lower.includes("siapa")) {
          fallbackReply += `Sekolah Kebangsaan Merbau Pulas diterajui oleh Tuan Guru Besar bersama barisan Guru Penolong Kanan (Pentadbiran, HEM, Kokurikulum & Pendidikan Khas) serta guru-guru yang berdedikasi. Anda boleh melihat senarai penuh di bahagian **Warga Sekolah**! 👨‍🏫👩‍🏫`;
        } else if (lower.includes("motto") || lower.includes("visi") || lower.includes("misi") || lower.includes("profil")) {
          fallbackReply += `✨ **Motto SKMP:** *"Berilmu, Beramal, Berbakti"*\n🌟 **Visi:** *"Pendidikan Berkualiti Insan Terdidik Negara Sejahtera"*\n🎯 **Misi:** *"Melestarikan Sistem Pendidikan Yang Berkualiti Untuk Membangunkan Potensi Individu Bagi Memenuhi Aspirasi Negara"*`;
        } else if (lower.includes("takwim") || lower.includes("cuti") || lower.includes("tarikh") || lower.includes("acara")) {
          fallbackReply += `📅 Anda boleh menyemak takwim aktiviti, cuti sekolah, dan program rasmi SK Merbau Pulas di bahagian **Takwim & Acara** pada menu utama portal ini!`;
        } else if (lower.includes("signage") || lower.includes("tv") || lower.includes("video") || lower.includes("youtube")) {
          fallbackReply += `📺 SKMP dilengkapi dengan sistem **Digital Signage & Smart TV** interaktif yang menyiarkan video YouTube, poster aktiviti, dan maklumat penting secara langsung di seluruh peranti sekolah!`;
        } else if (lower.includes("kokurikulum") || lower.includes("sukan") || lower.includes("uniform") || lower.includes("kelab")) {
          fallbackReply += `🏆 SKMP aktif dalam pelbagai aktiviti kokurikulum termasuk Pengakap, BSMM, TKRS, PPIM, Kelab STEM, Bola Sepak, Bola Jaring, Badminton, dan Action Song! Maklumat lanjut ada di bahagian **Kokurikulum**.`;
        } else if (lower.includes("hubungi") || lower.includes("telefon") || lower.includes("alamat") || lower.includes("aduan")) {
          fallbackReply += `📞 **Hubungi SK Merbau Pulas:**\n📍 Lokasi: Merbau Pulas, 09300 Kuala Ketil, Kedah\n✉️ Anda juga boleh menghantar pertanyaan atau aduan terus melalui menu **Maklum Balas** di portal ini!`;
        } else {
          fallbackReply += `Saya sedia membantu anda dengan pelbagai maklumat mengenai SK Merbau Pulas, panduan mata pelajaran, kokurikulum, atau apa sahaja pertanyaan. Boleh saya bantu dengan topik tertentu? 😊🎒`;
        }

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

      const replyText = response.text?.trim() || "Maaf, Sweetbot tidak dapat memproses jawapan sekarang. Sila cuba sebentar lagi ya! 🤖";

      res.json({
        success: true,
        reply: replyText
      });
    } catch (err: any) {
      console.error("[SWEETBOT ERROR]", err);
      // Fallback friendly reply so user experience is always pleasant
      res.json({
        success: true,
        reply: `Hai! Sweetbot 🤖 sedia membantu anda. Terdapat sedikit kelewatan sambungan rangkaian, namun anda boleh menyemak maklumat lengkap SK Merbau Pulas di menu utama portal ini!`
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
