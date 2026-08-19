import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

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
