import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RefreshCw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ChevronDown,
  Maximize2,
  Minimize2,
  MessageSquare,
  Compass,
  Calendar,
  Users,
  Tv,
  Award,
  BookOpen,
  Mic,
  MicOff,
  HelpCircle,
  School,
  Search,
  Utensils,
  Laptop
} from 'lucide-react';
import {
  SchoolProfile,
  CalendarEvent,
  NewsItem,
  Staff,
  AwardItem,
  PibgCommittee,
  PibgActivity,
  CoCurriculumUnit,
  DownloadDocument,
  SystemLink,
  HemData
} from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  actionTag?: string;
  actionType?: 'carian_murid' | 'kehadiran_rmt' | 'tempahan_ict';
}

interface SweetbotWidgetProps {
  profile?: SchoolProfile;
  events?: CalendarEvent[];
  newsList?: NewsItem[];
  staffList?: Staff[];
  awards?: AwardItem[];
  pibgCommittee?: PibgCommittee[];
  pibgActivities?: PibgActivity[];
  coCurriculumUnits?: CoCurriculumUnit[];
  documents?: DownloadDocument[];
  systemLinks?: SystemLink[];
  hemData?: HemData;
  onNavigateSection?: (sectionId: string) => void;
  isAdmin?: boolean;
  userRole?: 'admin' | 'guru' | null;
  onOpenStudentPortal?: () => void;
  onOpenRmtPortal?: () => void;
  onOpenIctBooking?: () => void;
}

export const SweetbotWidget: React.FC<SweetbotWidgetProps> = ({
  profile,
  events = [],
  newsList = [],
  staffList = [],
  awards = [],
  pibgCommittee = [],
  pibgActivities = [],
  coCurriculumUnits = [],
  documents = [],
  systemLinks = [],
  hemData,
  onNavigateSection,
  isAdmin = false,
  userRole = null,
  onOpenStudentPortal,
  onOpenRmtPortal,
  onOpenIctBooking
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isPeekingHovered, setIsPeekingHovered] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [, setAvailableMalayVoiceName] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingAudioRef = useRef<boolean>(false);

  // Cari profil suara rasmi Bahasa Melayu Malaysia (ms-MY) dalam pelayar pengguna
  const getBestMalayVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Keutamaan Mutlak: Suara Rasmi Bahasa Melayu Malaysia (ms-MY / ms_MY / Malay Malaysia)
    // DILARANG SAMA SEKALI suara Indonesia (id / id-ID / Indonesia) atau suara luar
    const priorityMalayVoice = voices.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase().replace('_', '-');

      // Sekat suara Indonesia dan dialek luar
      if (
        lang.includes('id') ||
        name.includes('indonesia') ||
        name.includes('gadis') ||
        name.includes('ardi') ||
        name.includes('jawa') ||
        name.includes('sunda')
      ) {
        return false;
      }

      return (
        lang === 'ms-my' ||
        name.includes('yasmin') ||
        name.includes('osman') ||
        name.includes('amira') ||
        name.includes('malay (malaysia)') ||
        name.includes('bahasa melayu (malaysia)') ||
        name.includes('bahasa malaysia') ||
        name.includes('malay')
      );
    });
    if (priorityMalayVoice) return priorityMalayVoice;

    // 2. Keutamaan Kedua: Mana-mana suara bertag 'ms' (Bahasa Melayu) TANPA Indonesia
    const generalMalayVoice = voices.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase().replace('_', '-');

      if (
        lang.includes('id') ||
        name.includes('indonesia') ||
        name.includes('gadis') ||
        name.includes('ardi')
      ) {
        return false;
      }

      return lang.startsWith('ms') || name.includes('melayu');
    });
    if (generalMalayVoice) return generalMalayVoice;

    return null;
  };

  // Muat turun senarai suara sistem
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const v = getBestMalayVoice();
        if (v) {
          setAvailableMalayVoiceName(v.name);
        }
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Hentikan audio apabila widget ditutup
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      setIsPeekingHovered(false);
    }
  }, [isOpen]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `Hai! Saya **Sweetbot** 🤖✨, Pembantu Maya Pintar rasmi **SK Merbau Pulas**!\n\nAda apa-apa yang ingin anda ketahui tentang sekolah, takwim, guru-guru, aktiviti, atau bantuan pelajaran? Tanyalah saya apa sahaja!`,
      timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Auto-scroll bila ada mesej baru
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  // Focus input bila dibuka
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, isMinimized]);

  // Pembersihan teks sebelum dibaca agar berbunyi Bahasa Melayu Malaysia Asli & Baku
  const cleanTextForMalaySpeech = (rawText: string): string => {
    let text = rawText;
    // Buang pautan markdown dan format tanda baca
    text = text.replace(/\[(.*?)\]\(.*?\)/g, '$1');
    text = text.replace(/[*#_`~>•-]/g, ' ');
    // Buang emoji dan simbol khas
    text = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    
    // Gantikan akronim rasmi KPM & sekolah kepada sebutan penuh Bahasa Melayu Malaysia
    const replacements: Record<string, string> = {
      'SKMP': 'Sekolah Kebangsaan Merbau Pulas',
      'SK Merbau Pulas': 'Sekolah Kebangsaan Merbau Pulas',
      'KPM': 'Kementerian Pendidikan Malaysia',
      'HEM': 'Hal Ehwal Murid',
      'PKP': 'Penolong Kanan Pentadbiran',
      'PK 1': 'Penolong Kanan Pentadbiran',
      'PK1': 'Penolong Kanan Pentadbiran',
      'PK HEM': 'Penolong Kanan Hal Ehwal Murid',
      'PKHEM': 'Penolong Kanan Hal Ehwal Murid',
      'PK Kokurikulum': 'Penolong Kanan Kokurikulum',
      'PKKO': 'Penolong Kanan Kokurikulum',
      'PK Koko': 'Penolong Kanan Kokurikulum',
      'PK': 'Penolong Kanan',
      'GB': 'Guru Besar',
      'GBK': 'Guru Bimbingan dan Kaunseling',
      'UBK': 'Unit Bimbingan dan Kaunseling',
      'PPKI': 'Program Pendidikan Khas Integrasi',
      'PIBG': 'Persatuan Ibu Bapa dan Guru',
      'YDP': 'Yang Dipertua',
      'NYDP': 'Naib Yang Dipertua',
      'AKP': 'Anggota Kumpulan Pelaksana',
      'KPT': 'Ketua Pembantu Tadbir',
      'PBS': 'Pentaksiran Berasaskan Sekolah',
      'PBD': 'Pentaksiran Bilik Darjah',
      'UASA': 'Ujian Akhir Sesi Akademik',
      'APDM': 'Aplikasi Pangkalan Data Murid',
      'SSDM': 'Sistem Sahsiah Diri Murid',
      'SPBT': 'Skim Pinjaman Buku Teks',
      'RMT': 'Rancangan Makanan Tambahan',
      'BAP': 'Bantuan Awal Persekolahan',
      'KWAPM': 'Kumpulan Wang Amanah Pelajar Miskin',
      'NILAM': 'Nilam',
      'STEM': 'S T E M',
      'idMe': 'Aydi Me',
      'No.': 'Nombor',
      'No': 'Nombor',
      'Cth:': 'Contohnya,',
      'cth:': 'contohnya,',
      'TV': 'Tee Vee',
      'Signage': 'Papan Digital',
      'AI': 'A I',
      'vs': 'lawan',
      '&': 'dan',
      '%': 'peratus'
    };

    for (const [abbr, expanded] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${abbr}\\b`, 'g');
      text = text.replace(regex, expanded);
    }

    // Bersihkan ruang berganda
    return text.replace(/\s+/g, ' ').trim();
  };

  // Buka kunci AudioContext/HTML5 Audio pada peranti mudah alih (iOS/Android) bila pengguna menekan butang
  const unlockAudioContext = () => {
    try {
      if (typeof window !== 'undefined') {
        const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
        silentAudio.volume = 0.01;
        silentAudio.play().then(() => {
          silentAudio.pause();
        }).catch(() => {});

        if ('speechSynthesis' in window && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    } catch (e) {}
  };

  // Sebutan Suara Asli Bahasa Melayu Malaysia (ms-MY) menggunakan Enjin Web Speech (hanya jika profil ms-MY disahkan wujud)
  const speakWithWebSpeech = (cleanText: string, msgId?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      isPlayingAudioRef.current = false;
      setCurrentlySpeakingId(null);
      return;
    }

    const malayVoice = getBestMalayVoice();
    // JANGAN SESEKALI jalankan jika tiada suara Bahasa Melayu pada peranti (untuk elak suara Inggeris peranti membaca teks Melayu)
    if (!malayVoice) {
      console.warn('Tiada profil suara Bahasa Melayu pada peranti, audio pelayan digunakan.');
      isPlayingAudioRef.current = false;
      setCurrentlySpeakingId(null);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.voice = malayVoice;
      utterance.lang = malayVoice.lang || 'ms-MY';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        isPlayingAudioRef.current = true;
        if (msgId) setCurrentlySpeakingId(msgId);
      };

      utterance.onend = () => {
        isPlayingAudioRef.current = false;
        setCurrentlySpeakingId(null);
      };

      utterance.onerror = (err) => {
        console.warn('Web Speech event notice:', err);
        isPlayingAudioRef.current = false;
        setCurrentlySpeakingId(null);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Web speech execution failed:', err);
      isPlayingAudioRef.current = false;
      setCurrentlySpeakingId(null);
    }
  };

  // Fungsi memainkan barisan audio Bahasa Melayu secara berturutan melalui Google TTS Stream Rasmi (ms-MY)
  const playNextAudioChunk = (msgId?: string) => {
    if (audioQueueRef.current.length === 0) {
      isPlayingAudioRef.current = false;
      setCurrentlySpeakingId(null);
      return;
    }

    const nextChunk = audioQueueRef.current.shift();
    if (!nextChunk || !nextChunk.trim()) {
      playNextAudioChunk(msgId);
      return;
    }

    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(nextChunk.trim())}`;
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;

      audio.onended = () => {
        playNextAudioChunk(msgId);
      };

      audio.onerror = (err) => {
        console.warn('Audio stream error, checking device Malay voice:', err);
        const malayVoice = getBestMalayVoice();
        if (malayVoice) {
          speakWithWebSpeech(nextChunk, msgId);
        } else {
          // Teruskan ke ayat seterusnya
          playNextAudioChunk(msgId);
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((playErr) => {
          console.warn('Autoplay restricted by browser, activating playback fallback:', playErr);
          const malayVoice = getBestMalayVoice();
          if (malayVoice) {
            speakWithWebSpeech(nextChunk, msgId);
          } else {
            isPlayingAudioRef.current = false;
            setCurrentlySpeakingId(null);
          }
        });
      }
    } catch (e) {
      console.warn('TTS playback error:', e);
      playNextAudioChunk(msgId);
    }
  };

  // Text-To-Speech Rasmi Bahasa Melayu Malaysia (100% Sebutan Asli Malaysia, Tiada Slang Inggeris/Indonesia)
  const speakText = (text: string, msgId?: string) => {
    if (!speechEnabled) return;
    
    // Buka kunci audio untuk mobile / Safari
    unlockAudioContext();

    // Hentikan sebarang pertuturan semasa serta-merta
    stopSpeaking();

    if (currentlySpeakingId === msgId && msgId) {
      setCurrentlySpeakingId(null);
      return;
    }

    const cleanText = cleanTextForMalaySpeech(text);
    if (!cleanText) return;

    // Pecahkan teks kepada klausa/ayat yang mesra sebutan audio rasmi Malaysia
    const sentences = cleanText
      .split(/(?<=[.?!;:\n])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const chunks: string[] = [];
    for (const sentence of sentences) {
      if (sentence.length <= 140) {
        chunks.push(sentence);
      } else {
        const subClauses = sentence.split(/,\s+/);
        for (const sub of subClauses) {
          if (sub.trim()) chunks.push(sub.trim());
        }
      }
    }

    if (chunks.length === 0) return;

    audioQueueRef.current = chunks;
    isPlayingAudioRef.current = true;
    if (msgId) setCurrentlySpeakingId(msgId);

    // Mainkan aliran audio rasmi Bahasa Melayu Malaysia (/api/tts)
    playNextAudioChunk(msgId);
  };

  const stopSpeaking = () => {
    audioQueueRef.current = [];
    isPlayingAudioRef.current = false;
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentlySpeakingId(null);
  };

  // Speech Recognition (Mic Input)
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Pelayar anda tidak menyokong fungsi pengecaman suara. Sila gunakan Google Chrome atau taip soalan anda.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ms-MY';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isTyping) return;

    // Buka kunci audio pelayar segera semasa pengguna menekan butang/enter
    unlockAudioContext();

    const userMessage: Message = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Sediakan konteks sekolah lengkap, menyeluruh & masa nyata dari portal
      const gbFromStaff = staffList.find(
        (s) =>
          s.position.toLowerCase().includes('guru besar') ||
          s.position.toLowerCase().includes('pengetua') ||
          s.category === 'pentadbir' && s.position.toLowerCase().includes('besar')
      );
      const gbName = profile?.principalName || gbFromStaff?.name || 'Puan Norhafiza Binti Dolah';
      const gbTitle = profile?.principalTitle || gbFromStaff?.position || 'Guru Besar (DG48)';

      const pentadbirList = staffList
        .filter((s) => s.category === 'pentadbir')
        .map((s) => `${s.position}: ${s.name} (${s.grade || ''})`);

      const teachersList = staffList
        .filter((s) => s.category === 'guru')
        .map((s) => `${s.name} (${s.position}${s.subject ? ' - ' + s.subject : ''}, Gred ${s.grade || '-'})`);

      const akpList = staffList
        .filter((s) => s.category === 'staf')
        .map((s) => `${s.name} (${s.position}, Gred ${s.grade || '-'})`);

      const schoolContext = {
        name: profile?.name || 'Sekolah Kebangsaan Merbau Pulas',
        code: profile?.code || 'KBA5012',
        motto: profile?.motto || 'Berilmu, Beramal, Berbakti',
        vision: profile?.vision || 'Pendidikan Berkualiti Insan Terdidik Negara Sejahtera.',
        mission: profile?.mission || 'Melestarikan Sistem Pendidikan Yang Berkualiti Untuk Membangunkan Potensi Individu Bagi Memenuhi Aspirasi Negara.',
        history: profile?.history || 'Sekolah Kebangsaan Merbau Pulas telah ditubuhkan pada tahun 1954 untuk menyediakan kemudahan pendidikan asas kepada anak-anak penduduk di sekitar Merbau Pulas, Kuala Ketil, Kedah.',
        logoDescription: profile?.logoDescription || [
          'Buku Terbuka: Melambangkan ilmu pengetahuan yang sentiasa dituntut.',
          'Obor Menyala: Melambangkan semangat kegigihan dan penerang masa depan.',
          'Warna Biru Diraja: Melambangkan perpaduan dan keharmonian.',
          'Warna Kuning Keemasan: Melambangkan kecemerlangan pendidikan.',
          'Bintang & Bulan Sabit: Melambangkan nilai murni dan pegangan agama Islam.'
        ],
        songTitle: profile?.songTitle || 'SKMP MAJU',
        songLyrics: profile?.songLyrics || [],
        songComposer: profile?.songComposer || 'Tn Hj Shukeri bin Hj Ibrahim',
        songLyricist: profile?.songLyricist || 'Tn Hj Shukeri bin Hj Ibrahim',
        songArranger: profile?.songArranger || 'En Anuar bin Mohd Nor',
        songCreatedDate: profile?.songCreatedDate || '18 Mei 2024 (12.30 Malam)',
        principalName: gbName,
        principalTitle: gbTitle,
        principalSpeech: profile?.principalSpeech || '',
        address: `${profile?.address || 'Jalan Baling, Kampong Merbau Pulas'}, ${profile?.postcode || '09300'} ${profile?.city || 'Kuala Ketil'}, ${profile?.state || 'Kedah Darul Aman'}`,
        phone: profile?.phone || '04-403 1200',
        fax: profile?.fax || '04-403 1201',
        email: profile?.email || 'KBA5012@moe.edu.my',
        administrators: pentadbirList.length > 0 ? pentadbirList : [
          `Guru Besar: ${gbName} (${gbTitle})`,
          'Penolong Kanan Pentadbiran: Puan Noraini binti Yusof (DG44)',
          'Penolong Kanan Hal Ehwal Murid: Encik Mohd Ridzuan bin Osman (DG44)',
          'Penolong Kanan Kokurikulum: Puan Siti Hajar binti Abdul Rahman (DG44)'
        ],
        teachers: teachersList,
        akp: akpList,
        totalStaff: staffList.length,
        upcomingEvents: events.map((e) => `${e.date}: ${e.title} - ${e.location || 'SKMP'} [${e.category}]`),
        latestNews: newsList.slice(0, 10).map((n) => `${n.date}: ${n.title} - ${n.summary || ''}`),
        recentAwards: awards.slice(0, 10).map((a) => `${a.year} - ${a.achievement} (${a.title}) penerima: ${a.recipient}`),
        pibgCommittee: pibgCommittee.map((p) => `${p.position}: ${p.name}`),
        pibgActivities: pibgActivities.slice(0, 8).map((act) => `${act.date}: ${act.title}`),
        coCurriculumUnits: coCurriculumUnits.map((c) => `${c.name} (${c.category}) - Guru Penasihat: ${c.advisorTeacher || '-'}`),
        downloadDocuments: documents.slice(0, 10).map((d) => `${d.title} (${d.category}, ${d.fileType})`),
        systemLinks: systemLinks.map((s) => `${s.name} (${s.badge}): ${s.description}`),
        hemData: hemData ? {
          gpkName: hemData.gpkName,
          gpkTitle: hemData.gpkTitle,
          gpkSpeech: hemData.gpkSpeech,
          disiplinRules: hemData.disiplin?.rules?.map((r) => `${r.title}: ${r.desc}`),
          ubkServices: hemData.disiplin?.ubkServices?.map((u) => `${u.title}: ${u.desc}`),
          spbtCoordinator: hemData.kebajikan?.spbtCoordinator,
          rmtCoordinator: hemData.kebajikan?.rmtCoordinator,
          rmtMenu: hemData.kebajikan?.rmtMenu?.map((m) => `${m.day}: ${m.menu}`),
          bapDetails: hemData.kebajikan?.bapDetails,
          coordinator3k: hemData.program3k?.coordinator3k,
          safetyPoints: hemData.program3k?.safetyPoints,
          healthPoints: hemData.program3k?.healthPoints,
          cleanlinessPoints: hemData.program3k?.cleanlinessPoints
        } : undefined
      };

      // Bina riwayat mesej untuk API
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          schoolContext,
          language: 'ms-MY'
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const botReply = data.reply || 'Hai! Sweetbot sedia membantu anda. Boleh saya bantu dengan maklumat lain? 🤖';

      let detectedAction: Message['actionType'] = undefined;
      const lowerReq = textToSend.toLowerCase();
      if (lowerReq.includes('carian murid') || lowerReq.includes('cari murid') || lowerReq.includes('pangkalan data murid')) {
        detectedAction = 'carian_murid';
      } else if (lowerReq.includes('kehadiran rmt') || lowerReq.includes('rmt murid') || lowerReq.includes('menu rmt') || lowerReq.includes('makanan tambahan')) {
        detectedAction = 'kehadiran_rmt';
      } else if (lowerReq.includes('tempahan bilik ict') || lowerReq.includes('tempahan ict') || lowerReq.includes('makmal komputer') || lowerReq.includes('tempahan bilik')) {
        detectedAction = 'tempahan_ict';
      }

      const botMessage: Message = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
        actionType: detectedAction
      };

      setMessages((prev) => [...prev, botMessage]);
      speakText(botReply, botMessage.id);
    } catch (err) {
      console.warn('Chat API error, using dynamic live fallback response:', err);
      const lower = textToSend.toLowerCase();

      // Dapatkan data dinamik terkini untuk fallback tempatan
      const currentGb = profile?.principalName || staffList.find((s) => s.category === 'pentadbir' && (s.position.toLowerCase().includes('besar') || s.position.toLowerCase().includes('pengetua')))?.name || 'Puan Norhafiza Binti Dolah';
      const currentGbTitle = profile?.principalTitle || 'Guru Besar (DG48)';
      const currentSchoolName = profile?.name || 'Sekolah Kebangsaan Merbau Pulas';
      const currentMotto = profile?.motto || 'Berilmu, Beramal, Berbakti';
      const currentVision = profile?.vision || 'Pendidikan Berkualiti Insan Terdidik Negara Sejahtera.';
      const currentMission = profile?.mission || 'Melestarikan Sistem Pendidikan Yang Berkualiti Untuk Membangunkan Potensi Individu Bagi Memenuhi Aspirasi Negara.';
      const currentHistory = profile?.history || 'Sekolah Kebangsaan Merbau Pulas telah ditubuhkan pada tahun 1954 untuk menyediakan kemudahan pendidikan asas kepada anak-anak penduduk di sekitar Merbau Pulas, Kuala Ketil, Kedah.';
      const currentAddress = `${profile?.address || 'Jalan Baling, Kampong Merbau Pulas'}, ${profile?.postcode || '09300'} ${profile?.city || 'Kuala Ketil'}, ${profile?.state || 'Kedah'}`;
      const currentPhone = profile?.phone || '04-403 1200';
      const currentEmail = profile?.email || 'KBA5012@moe.edu.my';
      const pentadbir = staffList.filter((s) => s.category === 'pentadbir');

      let fallbackText = `Hai! Saya **Sweetbot** 🤖✨, Pembantu Maya Rasmi ${currentSchoolName}.\n\nSekolah sentiasa mengutamakan kecemerlangan modal insan berteraskan motto *"${currentMotto}"*.\n\n🎯 **Visi:** ${currentVision}\n🚀 **Misi:** ${currentMission}\n\nSila kemukakan sebarang soalan mengenai guru, takwim, dokumen atau pembelajaran! 🌟🎒`;
      let fallbackAction: Message['actionType'] = undefined;

      if (
        lower.includes('pk 1') ||
        lower.includes('pk1') ||
        lower.includes('pk satu') ||
        lower.includes('penolong kanan satu') ||
        lower.includes('penolong kanan 1') ||
        lower.includes('penolong kanan pentadbiran') ||
        lower.includes('pk pentadbiran') ||
        lower.includes('guru penolong kanan 1') ||
        lower.includes('guru penolong kanan satu')
      ) {
        fallbackText = `Guru Penolong Kanan Pentadbiran (PK 1) ${currentSchoolName} ialah **Puan Noraini binti Yusof** (DG44) 👩‍🏫✨.`;
      } else if (
        lower.includes('pk hem') ||
        lower.includes('pkhem') ||
        lower.includes('pk 2') ||
        lower.includes('pk2') ||
        lower.includes('pk dua') ||
        lower.includes('penolong kanan dua') ||
        lower.includes('penolong kanan 2') ||
        lower.includes('hal ehwal murid') ||
        lower.includes('guru penolong kanan hem') ||
        lower.includes('guru penolong kanan 2')
      ) {
        fallbackText = `Guru Penolong Kanan Hal Ehwal Murid (PK HEM) ${currentSchoolName} ialah **Encik Mohd Ridzuan bin Osman** (DG44) 👨‍🏫✨.`;
      } else if (
        lower.includes('pk koko') ||
        lower.includes('pkkoko') ||
        lower.includes('pk kokurikulum') ||
        lower.includes('pk 3') ||
        lower.includes('pk3') ||
        lower.includes('pk tiga') ||
        lower.includes('penolong kanan tiga') ||
        lower.includes('penolong kanan 3') ||
        lower.includes('guru penolong kanan kokurikulum') ||
        lower.includes('guru penolong kanan 3')
      ) {
        fallbackText = `Guru Penolong Kanan Kokurikulum (PK Kokurikulum) ${currentSchoolName} ialah **Puan Siti Hajar binti Abdul Rahman** (DG44) 👩‍🏫✨.`;
      } else if (
        lower.includes('guru besar') ||
        lower.includes('nama guru besar') ||
        lower.includes('siapa guru besar') ||
        lower.includes('siapakah guru besar') ||
        lower.includes('pengetua')
      ) {
        fallbackText = `Guru Besar ${currentSchoolName} ialah **${currentGb}** (${currentGbTitle}) 👩‍🏫✨.`;
      } else if (
        lower.includes('pentadbir') ||
        lower.includes('barisan pentadbir') ||
        lower.includes('carta organisasi') ||
        lower.includes('pengurusan sekolah')
      ) {
        let pListStr = '';
        if (pentadbir.length > 0) {
          pListStr = pentadbir.map((p, i) => `${i + 1}. **${p.name}** - ${p.position} (${p.grade || 'DG44'})`).join('\n');
        } else {
          pListStr = `1. **${currentGb}** - ${currentGbTitle}\n2. **Puan Noraini binti Yusof** - Penolong Kanan Pentadbiran\n3. **Encik Mohd Ridzuan bin Osman** - Penolong Kanan HEM\n4. **Puan Siti Hajar binti Abdul Rahman** - Penolong Kanan Kokurikulum`;
        }
        fallbackText = `Barisan Pentadbir Rasmi ${currentSchoolName}:\n\n${pListStr}\n\nSila layari tab **Warga Sekolah** untuk melihat senarai penuh pentadbir, guru akademik dan staf sokongan!`;
      } else if (lower.includes('visi') && !lower.includes('misi')) {
        fallbackText = `Visi ${currentSchoolName} ialah:\n\n🎯 **"${currentVision}"**`;
      } else if (lower.includes('misi') && !lower.includes('visi')) {
        fallbackText = `Misi ${currentSchoolName} ialah:\n\n🚀 **"${currentMission}"**`;
      } else if (lower.includes('visi') && lower.includes('misi')) {
        fallbackText = `✨ **Visi & Misi ${currentSchoolName}:**\n\n🎯 **Visi:**\n*"${currentVision}"*\n\n🚀 **Misi:**\n*"${currentMission}"*`;
      } else if (lower.includes('sejarah') || lower.includes('latar belakang') || lower.includes('asal usul') || lower.includes('ditubuhkan')) {
        fallbackText = `🏛️ **Latar Belakang & Sejarah ${currentSchoolName}:**\n\n${currentHistory}\n\n📌 **Tahun Ditubuhkan:** 1954\n📍 **Lokasi:** ${currentAddress}`;
      } else if (lower.includes('motto') || lower.includes('cogan kata')) {
        fallbackText = `Motto rasmi ${currentSchoolName} ialah: 🌟 **"${currentMotto}"**`;
      } else if (lower.includes('kod sekolah') || lower.includes('kod skmp')) {
        fallbackText = `Kod rasmi ${currentSchoolName} ialah **${profile?.code || 'KBA5012'}** 📌.`;
      } else if (lower.includes('logo') || lower.includes('lencana')) {
        const logoDesc = profile?.logoDescription?.join('\n• ') || 'Buku Terbuka (Ilmu), Obor Menyala (Semangat), Warna Biru Diraja (Perpaduan), Warna Kuning (Kecemerlangan), Bulan & Bintang (Nilai Islam).';
        fallbackText = `🛡️ **Maksud Logo & Lencana ${currentSchoolName}:**\n\n• ${logoDesc}`;
      } else if (lower.includes('lagu') || lower.includes('lirik') || lower.includes('cipta') || lower.includes('komposer')) {
        const lyrics = profile?.songLyrics?.join('\n') || 'SK Merbau Pulas medan berilmu,\nWarganya berpadu sehati sejiwa...';
        fallbackText = `🎵 **Lagu Rasmi Sekolah: "${profile?.songTitle || 'SKMP MAJU'}"**\n\n**Penghargaan & Maklumat Lagu:**\n• **Pencipta Lirik**: ${profile?.songLyricist || 'Tn Hj Shukeri bin Hj Ibrahim'}\n• **Pencipta Lagu**: ${profile?.songComposer || 'Tn Hj Shukeri bin Hj Ibrahim'}\n• **Gubahan Muzik**: ${profile?.songArranger || 'En Anuar bin Mohd Nor'}\n• **Tarikh Ciptaan**: ${profile?.songCreatedDate || '18 Mei 2024 (12.30 Malam)'}\n• **Pautan Video YouTube**: ${profile?.songAudioUrl || 'https://www.youtube.com/watch?v=dNCLSPCYAtc'}\n\n**Seni Kata / Lirik:**\n${lyrics}`;
      } else if (lower.includes('ydp') || lower.includes('yang dipertua')) {
        const ydp = pibgCommittee.find((p) => p.position.toLowerCase().includes('ydp') || p.position.toLowerCase().includes('yang dipertua'));
        fallbackText = `Yang Dipertua (YDP) PIBG ${currentSchoolName} ialah **${ydp ? ydp.name : 'Tuan Haji Azmi bin Ahmad'}** 🤝✨.`;
      } else if (lower.includes('takwim') || lower.includes('acara') || lower.includes('program') || lower.includes('tarikh') || lower.includes('aktiviti') || lower.includes('cuti')) {
        if (events.length > 0) {
          const evStr = events.slice(0, 6).map((e) => `• **${e.date}**: ${e.title} (${e.location || 'SKMP'})`).join('\n');
          fallbackText = `📅 **Takwim & Acara Terkini SKMP:**\n\n${evStr}\n\nAnda boleh melihat senarai penuh dan menapis mengikut kategori di bahagian **Takwim & Acara**!`;
        }
      } else if (lower.includes('berita') || lower.includes('pengumuman') || lower.includes('hebahan')) {
        if (newsList.length > 0) {
          const newsStr = newsList.slice(0, 3).map((n) => `• **${n.title}** (${n.date})\n  ${n.summary}`).join('\n\n');
          fallbackText = `📰 **Berita & Pengumuman Terkini SKMP:**\n\n${newsStr}`;
        }
      } else if (lower.includes('pibg') || lower.includes('persatuan ibu bapa')) {
        const ydp = pibgCommittee.find((p) => p.position.toLowerCase().includes('ydp') || p.position.toLowerCase().includes('yang dipertua'));
        fallbackText = `🤝 **Persatuan Ibu Bapa & Guru (PIBG) SKMP:**\n\n• **Penasihat:** ${currentGb} (Guru Besar)\n• **Yang Dipertua (YDP) PIBG:** ${ydp ? ydp.name : 'Tuan Haji Azmi bin Ahmad'}\n\nUntuk senarai penuh AJK dan aktiviti PIBG, sila layari tab **Warga Sekolah** bahagian PIBG!`;
      } else if (lower.includes('anugerah') || lower.includes('pencapaian') || lower.includes('kejayaan') || lower.includes('johan')) {
        if (awards.length > 0) {
          const awStr = awards.slice(0, 4).map((a) => `🏆 **${a.achievement}** - ${a.title} (${a.recipient})`).join('\n');
          fallbackText = `🎉 **Pencapaian & Anugerah Terkini SKMP:**\n\n${awStr}`;
        }
      } else if (lower.includes('dokumen') || lower.includes('muat turun') || lower.includes('borang') || lower.includes('pekeliling')) {
        if (documents.length > 0) {
          const docStr = documents.slice(0, 5).map((d) => `📄 **${d.title}** (${d.category.toUpperCase()} - ${d.fileType})`).join('\n');
          fallbackText = `📥 **Dokumen & Borang Rasmi Untuk Dimuat Turun:**\n\n${docStr}\n\nSila layari tab **Muat Turun** untuk memuat turun fail lengkap!`;
        }
      } else if (lower.includes('idme') || lower.includes('apdm') || lower.includes('delima') || lower.includes('splkpm') || lower.includes('sistem')) {
        fallbackText = `🔗 **Pautan Sistem Rasmi KPM & Sekolah:**\n\n• **idMe KPM:** Sistem Pengurusan Identiti Bersepadu KPM\n• **APDM:** Aplikasi Pangkalan Data Murid\n• **DELIMa KPM:** Platform Pembelajaran Digital Google/Apple/Microsoft\n• **SPLKPM:** Sistem Pengurusan Latihan KPM\n• **HRMIS:** Pengurusan Sumber Manusia Sektor Awam\n\nAnda boleh mengakses semua pautan ini di bahagian **Pautan Sistem** portal!`;
      } else if (lower.includes('disiplin') || lower.includes('peraturan sekolah') || lower.includes('rambut') || lower.includes('uniform')) {
        fallbackText = `⚖️ **Disiplin & Peraturan ${currentSchoolName}:**\n\n• **Waktu Hadir:** Sebelum 7.20 pagi di tapak perhimpunan.\n• **Pakaian:** Uniform lengkap, bertanda nama & lencana rasmi.\n• **Rambut:** Pendek dan kemas mengikut standard KPM.\n• **Larangan:** Telefon bimbit & barangan berbahaya tidak dibenarkan sama sekali.\n\nKetua Guru Disiplin: **Cikgu Rosli bin Hassan**. Sila rujuk menu **Hal Ehwal Murid (HEM)** untuk kod disiplin penuh!`;
      } else if (lower.includes('kaunseling') || lower.includes('ubk') || lower.includes('bimbingan') || lower.includes('guru penyayang')) {
        fallbackText = `🤝 **Unit Bimbingan & Kaunseling (UBK) ${currentSchoolName}:**\n\n• **Guru Bimbingan & Kaunseling:** Cikgu Zulkifli bin Ibrahim\n• **Perkhidmatan:** Bimbingan individu/kelompok, Program Guru Penyayang, Ujian Minda Sihat & Kelab Pembimbing Rakan Sebaya (PRS).\n\nSila layari menu **Hal Ehwal Murid (HEM)** untuk maklumat lanjut!`;
      } else if (lower.includes('ssdm')) {
        fallbackText = `🌟 **Sistem Sahsiah Diri Murid (SSDM 2.0):**\n\nSistem rasmi KPM untuk merekodkan amalan baik murid, mata merit, serta pengurusan intervensi sahsiah berhemah secara berpusat. Boleh dilayari melalui menu **Hal Ehwal Murid (HEM)**.`;
      } else if (lower.includes('carian murid') || lower.includes('cari murid') || lower.includes('pangkalan data murid') || lower.includes('data murid')) {
        fallbackText = `Berikut ialah maklumat capaian pantas ke **Pangkalan Data & Carian Murid APDM SK Merbau Pulas**:\n\n👥 **Jumlah Murid:** 375 orang (Tahun 1 hingga Tahun 6)\n🔍 **Fungsi Carian:** Carian segera mengikut Nama Murid, No. Kad Pengenalan / MyKid, Kelas, atau Nama Penjaga & Telefon.\n\nSila klik butang di bawah untuk membuka portal carian murid sekarang.`;
        fallbackAction = 'carian_murid';
      } else if (lower.includes('kehadiran rmt') || lower.includes('rmt') || lower.includes('makanan tambahan') || lower.includes('menu rmt')) {
        fallbackText = `Berikut ialah maklumat capaian pantas ke **Portal Kehadiran & Pengurusan RMT SK Merbau Pulas**:\n\n🍱 **Murid Penerima Layak:** 89 orang murid\n👩‍🏫 **Penyelaras RMT:** Puan Fazilah binti Mat\n📋 **Ciri Sistem:** Semakan senarai murid layak mengikut kelas, paparan jadual menu nutrisi harian, serta perekodan kehadiran/ketidakhadiran murid RMT harian.\n\nSila klik butang di bawah untuk membuka portal kehadiran RMT.`;
        fallbackAction = 'kehadiran_rmt';
      } else if (lower.includes('tempahan') || lower.includes('bilik ict') || lower.includes('makmal komputer') || lower.includes('projektor') || lower.includes('alatan ict')) {
        fallbackText = `Berikut ialah maklumat capaian pantas ke **Sistem Tempahan Bilik Khas & Alatan ICT SK Merbau Pulas**:\n\n💻 **Makmal Komputer (Bilik ICT 1):** 30 unit PC Murid, Smart TV 65", berhawa dingin.\n📺 **Bilik Akses Digital & Media:** 15 PC rujukan & projektor interaktif.\n📽️ **Peminjaman Alatan:** 3 unit projektor LCD mudah alih, kabel HDMI/VGA & wayar penyambung.\n🏛️ **Dewan Terbuka:** Sistem siaraya (PA system) & skrin layar perhimpunan.\n\nSila klik butang di bawah untuk membuat tempahan bilik ICT sekarang.`;
        fallbackAction = 'tempahan_ict';
      } else if (lower.includes('spbt') || lower.includes('buku teks')) {
        fallbackText = `📚 **Skim Pinjaman Buku Teks (SPBT) ${currentSchoolName}:**\n\n• **Kelayakan:** 100% murid warganegara Malaysia (Tahun 1 hingga 6).\n• **Penyelaras:** Cikgu Nurul Ain binti Mahadzir.\n• **Bilik BOSS:** Bilik Operasi SPBT Sekolah.\n• **Syarat:** Buku wajib dibalut plastik jernih dan dijaga dengan cermat!`;
      } else if (lower.includes('bap') || lower.includes('bantuan awal persekolahan') || lower.includes('kwapm') || lower.includes('bantuan')) {
        fallbackText = `💵 **Bantuan Awal Persekolahan (BAP) & Kebajikan:**\n\n• **BAP:** RM150 secara 'one-off' untuk setiap murid warganegara tanpa had pendapatan.\n• **KWAPM & e-Kasih:** Bantuan pakaian dan kelengkapan sekolah untuk murid miskin.\n• Bantuan diagihkan secara telus kepada ibu bapa/penjaga yang sah.`;
      } else if (lower.includes('3k') || lower.includes('keselamatan') || lower.includes('kesihatan') || lower.includes('kebersihan') || lower.includes('fire drill')) {
        fallbackText = `🛡️ **Program 3K (Keselamatan, Kesihatan & Kebersihan) ${currentSchoolName}:**\n\n• **Keselamatan:** Pengawal 24 jam, pas pelawat, zon *drop-off* selamat, CCTV & latihan kebakaran berkala.\n• **Kesihatan:** Pemeriksaan gigi bergerak & imunisasi KKM, bilik rawatan kecemasan & sifar aedes (COMBI).\n• **Kebersihan:** Pertandingan keceriaan kelas mingguan & amalan 3R.\n• **Penyelaras 3K:** Cikgu Mohd Fadzil bin Yaakob.`;
      } else if (lower.includes('hem') || lower.includes('hal ehwal murid')) {
        fallbackText = `❤️ **Pengurusan Hal Ehwal Murid (HEM) ${currentSchoolName}:**\n\n• **PK HEM:** Encik Mohd Ridzuan bin Osman (DG44)\n• **Skop Utama:**\n  1. Disiplin & Kaunseling (SSDM, UBK)\n  2. Kebajikan Murid (SPBT, RMT, BAP)\n  3. Keselamatan & Kesihatan (Program 3K)\n\nSila klik menu **Hal Ehwal Murid (HEM)** di navigasi atas untuk info lengkap!`;
      } else if (lower.includes('alamat') || lower.includes('telefon') || lower.includes('hubungi') || lower.includes('emel') || lower.includes('lokasi')) {
        fallbackText = `📞 **Maklumat Hubungan Rasmi ${currentSchoolName}:**\n\n📍 **Alamat:** ${currentAddress}\n☎️ **No Telefon:** ${currentPhone}\n📠 **No Faks:** ${profile?.fax || '04-403 1201'}\n✉️ **Emel:** ${currentEmail}`;
      }

      const fallbackMsg: Message = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
        actionType: fallbackAction
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakText(fallbackMsg.text, fallbackMsg.id);
    } finally {
      setIsTyping(false);
    }
  };

  const isTeacherOrAdmin = Boolean(isAdmin || userRole === 'guru' || userRole === 'admin');

  const handleQuickPortalAction = (type: 'carian_murid' | 'kehadiran_rmt' | 'tempahan_ict') => {
    unlockAudioContext();
    if (type === 'carian_murid') {
      const userMsg: Message = {
        id: 'user-' + Date.now(),
        sender: 'user',
        text: '🔍 Cari Murid',
        timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
      };
      const botMsg: Message = {
        id: 'bot-' + (Date.now() + 1),
        sender: 'bot',
        text: `Berikut ialah capaian pantas ke **Pangkalan Data & Carian Murid APDM SK Merbau Pulas** (375 murid berdaftar dari Tahun 1 hingga 6).\n\nCikgu boleh membuat semakan maklumat murid mengikut **Nama**, **No. Kad Pengenalan / MyKid**, **Kelas**, atau **Nama Penjaga & Telefon**.\n\nSila klik butang di bawah untuk membuka portal carian murid sekarang:`,
        timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
        actionType: 'carian_murid'
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      speakText('Berikut ialah capaian pantas ke pangkalan data carian murid SK Merbau Pulas.', botMsg.id);
      if (onOpenStudentPortal) {
        onOpenStudentPortal();
      }
    } else if (type === 'kehadiran_rmt') {
      const userMsg: Message = {
        id: 'user-' + Date.now(),
        sender: 'user',
        text: '🍱 RMT',
        timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
      };
      const botMsg: Message = {
        id: 'bot-' + (Date.now() + 1),
        sender: 'bot',
        text: `Berikut ialah capaian pantas ke **Portal Kehadiran & Pengurusan RMT SK Merbau Pulas** (89 orang murid penerima layak).\n\nCikgu boleh menyemak senarai penerima bantuan mengikut kelas, jadual menu nutrisi harian, serta mencatat kehadiran atau ketidakhadiran murid RMT.\n\nSila klik butang di bawah untuk membuka portal kehadiran RMT:`,
        timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
        actionType: 'kehadiran_rmt'
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      speakText('Berikut ialah capaian pantas ke portal kehadiran dan pengurusan RMT murid.', botMsg.id);
      if (onOpenRmtPortal) {
        onOpenRmtPortal();
      }
    } else if (type === 'tempahan_ict') {
      const userMsg: Message = {
        id: 'user-' + Date.now(),
        sender: 'user',
        text: '💻 ICT',
        timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
      };
      const botMsg: Message = {
        id: 'bot-' + (Date.now() + 1),
        sender: 'bot',
        text: `Berikut ialah capaian pantas ke **Sistem Tempahan Bilik Khas & Alatan ICT SK Merbau Pulas**.\n\nKemudahan yang boleh ditempah meliputi:\n• **Makmal Komputer Komprehensif** (30 unit PC & Smart TV)\n• **Bilik Akses Digital & Media**\n• **Peminjaman Projektor LCD Bergerak & Skrin Layar**\n• **Dewan Terbuka (Siaraya & Sistem Audio)**\n\nSila klik butang di bawah untuk membuka borang tempahan bilik ICT:`,
        timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
        actionType: 'tempahan_ict'
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      speakText('Berikut ialah capaian pantas ke sistem tempahan bilik ICT dan peralatan sekolah.', botMsg.id);
      if (onOpenIctBooking) {
        onOpenIctBooking();
      }
    }

    // Auto-tutup chat box untuk memberi laluan kepada paparan yang telah dibuka di latar belakang
    setIsOpen(false);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleResetChat = () => {
    if (window.confirm('Adakah anda ingin mengosongkan perbualan ini?')) {
      setMessages([
        {
          id: 'welcome-reset',
          sender: 'bot',
          text: `Perbualan telah dimulakan semula! Hai, saya **Sweetbot** 🤖. Sila kemukakan sebarang soalan anda.`,
          timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const quickQuestions = [
    { label: '🤖 Tanya Apa Sahaja', query: 'Hai Sweetbot! Apakah yang boleh anda bantu saya pelajari hari ini?' },
    { label: '🔢 Bantu Matematik & Sains', query: 'Boleh bantu saya selesaikan soalan Matematik dan terangkan konsep Sains?' },
    { label: '📚 Bahasa Melayu & Karangan', query: 'Boleh bantu saya bina perenggan karangan dan terangkan maksud peribahasa?' },
    { label: '🏫 Info SK Merbau Pulas', query: 'Ceritakan tentang profil, pentadbir, dan keistimewaan SK Merbau Pulas' },
    { label: '📅 Takwim & Aktiviti', query: 'Apakah aktiviti dan program sekolah yang terdekat dalam takwim?' },
    { label: '🏆 Sukan & Kokurikulum', query: 'Apakah aktiviti sukan, kelab dan unit beruniform di SKMP?' },
    { label: '💡 Motivasi & Tips Belajar', query: 'Berikan kata-kata motivasi dan 3 tips belajar berkesan untuk murid cemerlang' }
  ];

  return (
    <>
      {/* 1. ROBOT BERPAUT MENGINTAI DI TEPI BINGKAI WEB (Bahagian Atas Sebelah Kanan - Padat & Ringkas Pada Telefon) */}
      {!isOpen && (
        <div className="fixed right-0 top-20 sm:top-24 z-40 sm:z-50 flex items-center select-none pointer-events-auto">
          {/* Peeking Speech Bubble (HANYA MUNCUL DI DESKTOP BILA DIHALAKAN TETIKUS - TIADA ISU TERLEKAT DI TELEFON) */}
          <AnimatePresence>
            {isPeekingHovered && !isOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 15, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  setIsPeekingHovered(false);
                  setIsOpen(true);
                }}
                className="hidden md:flex items-center gap-2 mr-2 bg-slate-900/95 text-white px-3.5 py-2 rounded-2xl rounded-tr-none shadow-[0_10px_30px_rgba(0,0,0,0.6)] border border-blue-400/50 text-xs font-bold cursor-pointer hover:scale-105 active:scale-95 transition backdrop-blur-md group"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                <span className="tracking-wide text-blue-100 group-hover:text-white transition">
                  Tanya saya apa sahaja! 🤖✨
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animated Robot Peeking Body (Padat di telefon: hanya muncul sedikit di tepi skrin agar tidak mengganggu) */}
          <motion.div
            id="sweetbot-peek-btn"
            onClick={() => {
              setIsPeekingHovered(false);
              setIsOpen(true);
            }}
            onMouseEnter={() => setIsPeekingHovered(true)}
            onMouseLeave={() => setIsPeekingHovered(false)}
            onTouchStart={() => setIsPeekingHovered(false)}
            initial={{ x: 34 }}
            animate={
              isPeekingHovered
                ? {
                    x: 0,
                    rotate: 0,
                    scale: 1.05
                  }
                : {
                    x: [34, 34, 0, 0, 0, 34, 34],
                    rotate: [0, 0, -3, 2, -2, 0, 0],
                    y: [0, 0, -4, -2, -4, 0, 0]
                  }
            }
            transition={
              isPeekingHovered
                ? { type: 'spring', stiffness: 350, damping: 22 }
                : {
                    x: { repeat: Infinity, duration: 7.5, times: [0, 0.22, 0.36, 0.55, 0.68, 0.8, 1], ease: 'easeInOut' },
                    rotate: { repeat: Infinity, duration: 7.5, times: [0, 0.22, 0.36, 0.55, 0.68, 0.8, 1], ease: 'easeInOut' },
                    y: { repeat: Infinity, duration: 7.5, times: [0, 0.22, 0.36, 0.55, 0.68, 0.8, 1], ease: 'easeInOut' }
                  }
            }
            className="cursor-pointer group relative flex items-center focus:outline-none pr-0 touch-manipulation"
            title="Sweetbot AI • SK Merbau Pulas (Klik untuk buka)"
          >
            {/* Clinging Wall Tabs / Handles for easy clicking even when mostly hidden */}
            <div className="relative bg-gradient-to-l from-blue-800 via-indigo-700 to-amber-500 p-1 sm:p-1.5 rounded-l-2xl sm:rounded-l-3xl shadow-[-6px_0px_20px_rgba(37,99,235,0.4)] sm:shadow-[-10px_0px_30px_rgba(37,99,235,0.45)] border-l-2 border-y-2 border-yellow-300 flex items-center group-hover:shadow-[-12px_0px_35px_rgba(234,179,8,0.5)] transition-all duration-300">
              {/* Vertical Quick Badge on the outermost peeking edge (Desktop only) */}
              <div className="absolute -left-5 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center bg-blue-950/90 border border-yellow-400/40 rounded-l-lg py-1 px-1 shadow-md opacity-75 group-hover:opacity-100 transition">
                <Bot className="w-3 h-3 text-cyan-300" />
                <span className="text-[8px] font-black text-yellow-300 uppercase tracking-tighter [writing-mode:vertical-lr] rotate-180 mt-0.5">
                  AI
                </span>
              </div>

              {/* Cute SVG Robot Peeking Head (Kecil & Kemas pada Smartphone) */}
              <div className="w-11 h-15 sm:w-18 sm:h-22 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 rounded-l-xl sm:rounded-l-2xl flex flex-col items-center justify-center p-1 sm:p-2 relative overflow-hidden border border-blue-400/40">
                {/* Robot Antenna with blinking signal beacon */}
                <div className="absolute top-0.5 sm:top-1 flex flex-col items-center">
                  <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-400 animate-ping shadow-[0_0_8px_#facc15]" />
                  <div className="w-0.5 sm:w-1 h-1 sm:h-2 bg-yellow-300 rounded-full" />
                </div>

                {/* Robot Screen Face */}
                <div className="w-8 h-6 sm:w-14 sm:h-10 bg-slate-950 rounded-md sm:rounded-lg border border-cyan-400/50 flex items-center justify-around px-1 sm:px-1.5 shadow-[inset_0_0_8px_rgba(6,182,212,0.4)] mt-1.5 sm:mt-2">
                  {/* Glowing Animated Robot Left Eye (Natural lifelike blinking & looking) */}
                  <motion.div
                    animate={
                      isPeekingHovered
                        ? {
                            scaleY: [1, 1, 0.08, 1, 1, 0.08, 1],
                            scaleX: 1.15,
                            x: 0
                          }
                        : {
                            scaleY: [1, 1, 1, 0.08, 1, 1, 0.08, 1, 0.75, 0.75, 1, 1],
                            scaleX: [1, 1, 1, 1.1, 1, 1, 1.1, 1, 1.15, 1.15, 1, 1],
                            x: [-2, -2, -2, -2, -2, 0, 0, 0, 0, 0, -2, -2]
                          }
                    }
                    transition={
                      isPeekingHovered
                        ? { repeat: Infinity, duration: 3.2, times: [0, 0.7, 0.74, 0.78, 0.86, 0.9, 1], ease: 'easeInOut' }
                        : { repeat: Infinity, duration: 7.5, times: [0, 0.2, 0.32, 0.35, 0.38, 0.52, 0.55, 0.58, 0.62, 0.75, 0.85, 1], ease: 'easeInOut' }
                    }
                    className="w-2 h-2.5 sm:w-3.5 sm:h-4 bg-cyan-300 rounded-full shadow-[0_0_6px_#22d3ee] flex items-center justify-center relative overflow-hidden"
                  >
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full self-start mr-0.5 mt-0.5 shadow-sm" />
                  </motion.div>

                  {/* Glowing Animated Robot Right Eye (Natural lifelike blinking & looking) */}
                  <motion.div
                    animate={
                      isPeekingHovered
                        ? {
                            scaleY: [1, 1, 0.08, 1, 1, 0.08, 1],
                            scaleX: 1.15,
                            x: 0
                          }
                        : {
                            scaleY: [1, 1, 1, 0.08, 1, 1, 0.08, 1, 0.75, 0.75, 1, 1],
                            scaleX: [1, 1, 1, 1.1, 1, 1, 1.1, 1, 1.15, 1.15, 1, 1],
                            x: [-2, -2, -2, -2, -2, 0, 0, 0, 0, 0, -2, -2]
                          }
                    }
                    transition={
                      isPeekingHovered
                        ? { repeat: Infinity, duration: 3.2, times: [0, 0.7, 0.74, 0.78, 0.86, 0.9, 1], ease: 'easeInOut' }
                        : { repeat: Infinity, duration: 7.5, times: [0, 0.2, 0.32, 0.35, 0.38, 0.52, 0.55, 0.58, 0.62, 0.75, 0.85, 1], ease: 'easeInOut' }
                    }
                    className="w-2 h-2.5 sm:w-3.5 sm:h-4 bg-cyan-300 rounded-full shadow-[0_0_6px_#22d3ee] flex items-center justify-center relative overflow-hidden"
                  >
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full self-start mr-0.5 mt-0.5 shadow-sm" />
                  </motion.div>
                </div>

                {/* Cute Cheeks with Blushing Animation */}
                <motion.div
                  animate={
                    isPeekingHovered
                      ? { opacity: 1, scale: 1.2 }
                      : {
                          opacity: [0.5, 0.5, 1, 1, 1, 0.5, 0.5],
                          scale: [1, 1, 1.25, 1.25, 1.25, 1, 1]
                        }
                  }
                  transition={
                    isPeekingHovered
                      ? { duration: 0.2 }
                      : { repeat: Infinity, duration: 7.5, times: [0, 0.22, 0.36, 0.55, 0.68, 0.8, 1], ease: 'easeInOut' }
                  }
                  className="flex justify-between w-7 sm:w-11 mt-0.5"
                >
                  <div className="w-1 h-0.5 sm:w-2 sm:h-1 bg-pink-400 rounded-full blur-[0.5px] shadow-[0_0_4px_#f472b6]" />
                  <div className="w-1 h-0.5 sm:w-2 sm:h-1 bg-pink-400 rounded-full blur-[0.5px] shadow-[0_0_4px_#f472b6]" />
                </motion.div>

                {/* Robot Mouth (Expands into a joyful, beaming smile to user when emerging) */}
                <motion.div
                  animate={
                    isPeekingHovered
                      ? {
                          scaleX: 1.5,
                          scaleY: 1.4,
                          backgroundColor: '#facc15'
                        }
                      : {
                          scaleX: [1, 1, 1.6, 1.65, 1.6, 1, 1],
                          scaleY: [1, 1, 1.4, 1.5, 1.4, 1, 1],
                          backgroundColor: ['#22d3ee', '#22d3ee', '#facc15', '#facc15', '#facc15', '#22d3ee', '#22d3ee']
                        }
                  }
                  transition={
                    isPeekingHovered
                      ? { duration: 0.25 }
                      : { repeat: Infinity, duration: 7.5, times: [0, 0.22, 0.36, 0.55, 0.68, 0.8, 1], ease: 'easeInOut' }
                  }
                  className="h-1 sm:h-1.5 w-2.5 sm:w-4 rounded-full mt-0.5 shadow-[0_0_6px_rgba(250,204,21,0.7)] flex items-center justify-center"
                />

                {/* Robot Claws / Hands Clutching The Wall Edge */}
                <div className="absolute -left-0.5 sm:-left-1 top-4 sm:top-6 w-1.5 sm:w-2.5 h-3 sm:h-4 bg-yellow-400 rounded-r-md shadow-md border-r border-yellow-200" />
                <div className="absolute -left-0.5 sm:-left-1 bottom-3 sm:bottom-4 w-1.5 sm:w-2.5 h-3 sm:h-4 bg-yellow-400 rounded-r-md shadow-md border-r border-yellow-200" />

                {/* Sweetbot Badge Text */}
                <span className="text-[6px] sm:text-[8px] font-black tracking-tighter text-yellow-300 mt-0.5 sm:mt-1 uppercase">
                  Sweetbot
                </span>
              </div>
            </div>

            {/* Glowing Accent Ring */}
            <div className="absolute -inset-1 bg-blue-500/20 rounded-l-2xl sm:rounded-l-3xl -z-10 animate-pulse" />
          </motion.div>
        </div>
      )}

      {/* 2. CHATBOT EXPANDED DIALOG (Sweetbot Full Interactive Modal/Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 50, x: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              x: 0,
              height: isMinimized ? 'auto' : '600px'
            }}
            exit={{ opacity: 0, scale: 0.85, y: 50, x: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={`fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50 w-[94vw] sm:w-[420px] max-w-[440px] bg-slate-900/95 backdrop-blur-2xl border-2 border-blue-400/50 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden text-slate-100 font-sans transition-all duration-300`}
            style={{ maxHeight: '86vh' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-3 sm:p-4 border-b border-blue-500/30 flex items-center justify-between relative select-none">
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Robot Avatar Mini with Status Ping */}
                <div className="relative">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-yellow-400 p-0.5 shadow-lg flex items-center justify-center">
                    <div className="w-full h-full bg-slate-950 rounded-[10px] sm:rounded-[14px] flex items-center justify-center relative overflow-hidden">
                      <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300 animate-bounce" />
                    </div>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-ping" />
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h4 className="text-sm sm:text-base font-black text-white tracking-wide">
                      Sweetbot AI
                    </h4>
                    <span className="px-1.5 sm:px-2 py-0.5 bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-[9px] sm:text-[10px] font-black rounded-full uppercase tracking-wider">
                      SKMP
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-blue-200 flex items-center gap-1 sm:gap-1.5">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    Pembantu Maya SK Merbau Pulas
                  </p>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1">
                {/* Toggle Voice / TTS */}
                <button
                  type="button"
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition ${
                    speechEnabled
                      ? 'bg-blue-600/60 text-yellow-300 hover:bg-blue-500/80'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                  title={speechEnabled ? 'Suara Aktif (Klik untuk Matikan)' : 'Suara Dimatikan (Klik untuk Aktifkan)'}
                >
                  {speechEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>

                {/* Reset Chat */}
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="p-1.5 sm:p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg sm:rounded-xl transition"
                  title="Kosongkan Perbualan"
                >
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {/* Minimize Toggle */}
                <button
                  type="button"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 sm:p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg sm:rounded-xl transition"
                  title={isMinimized ? 'Besarkan' : 'Kecilkan'}
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 sm:p-2 bg-rose-600/80 hover:bg-rose-500 text-white rounded-lg sm:rounded-xl transition ml-0.5 sm:ml-1"
                  title="Tutup Sweetbot"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Body (Messages & Suggestions) */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-slate-800/50">
                  {/* Carian Pantas (Guru & Admin) Top Banner */}
                  {isTeacherOrAdmin && (
                    <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-blue-950/70 border border-amber-500/40 rounded-2xl p-3 text-xs shadow-md">
                      <div className="flex items-center justify-between gap-1.5 text-amber-300 font-bold mb-2">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                          <span>Carian Pantas (Guru & Pentadbir):</span>
                        </div>
                        <span className="text-[9px] bg-amber-500/20 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full font-black">
                          Akses Guru Aktif
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickPortalAction('carian_murid')}
                          className="p-2 bg-emerald-950/80 hover:bg-emerald-850 active:scale-95 border border-emerald-400/40 rounded-xl text-[11px] font-bold text-emerald-200 hover:text-white transition flex flex-col items-center justify-center gap-1 text-center shadow-sm cursor-pointer"
                        >
                          <Search className="w-4 h-4 text-emerald-300" />
                          <span className="leading-tight">Cari Murid</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickPortalAction('kehadiran_rmt')}
                          className="p-2 bg-amber-950/80 hover:bg-amber-850 active:scale-95 border border-amber-400/40 rounded-xl text-[11px] font-bold text-amber-200 hover:text-white transition flex flex-col items-center justify-center gap-1 text-center shadow-sm cursor-pointer"
                        >
                          <Utensils className="w-4 h-4 text-amber-300" />
                          <span className="leading-tight">RMT</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickPortalAction('tempahan_ict')}
                          className="p-2 bg-blue-950/80 hover:bg-blue-850 active:scale-95 border border-blue-400/40 rounded-xl text-[11px] font-bold text-blue-200 hover:text-white transition flex flex-col items-center justify-center gap-1 text-center shadow-sm cursor-pointer"
                        >
                          <Laptop className="w-4 h-4 text-blue-300" />
                          <span className="leading-tight">ICT</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick Topics Banner */}
                  <div className="bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-500/20 rounded-2xl p-3 text-xs">
                    <div className="flex items-center gap-1.5 text-yellow-300 font-bold mb-2">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Cadangan Soalan Popular:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {quickQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(q.query)}
                          className="px-2.5 py-1 bg-blue-900/60 hover:bg-blue-700/80 active:scale-95 border border-blue-400/30 rounded-xl text-[11px] font-medium text-blue-100 transition flex items-center gap-1"
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Bubbles */}
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-2 max-w-[88%]">
                        {msg.sender === 'bot' && (
                          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-yellow-400 p-0.5 flex-shrink-0 mb-1">
                            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                              <Bot className="w-4 h-4 text-cyan-300" />
                            </div>
                          </div>
                        )}

                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-lg relative group ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-none border border-blue-400/40'
                              : 'bg-slate-800/90 text-slate-100 rounded-bl-none border border-slate-700/80 backdrop-blur-sm'
                          }`}
                        >
                          {/* Message Content formatted */}
                          <div className="whitespace-pre-wrap space-y-1">
                            {msg.text.split('\n').map((line, lIdx) => {
                              // Bold formatting support
                              if (line.startsWith('**') && line.endsWith('**')) {
                                return (
                                  <p key={lIdx} className="font-bold text-yellow-300">
                                    {line.replace(/\*\*/g, '')}
                                  </p>
                                );
                              }
                              return <p key={lIdx}>{line}</p>;
                            })}
                          </div>

                          {/* Quick Navigation buttons inside bot replies */}
                          {msg.sender === 'bot' && onNavigateSection && (
                            <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex flex-wrap gap-1.5">
                              {msg.text.toLowerCase().includes('takwim') && (
                                <button
                                  type="button"
                                  onClick={() => onNavigateSection('takwim')}
                                  className="px-2 py-0.5 bg-blue-600/60 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                                >
                                  <Calendar className="w-3 h-3" /> Buka Takwim
                                </button>
                              )}
                              {(msg.text.toLowerCase().includes('guru') || msg.text.toLowerCase().includes('warga')) && (
                                <button
                                  type="button"
                                  onClick={() => onNavigateSection('guru')}
                                  className="px-2 py-0.5 bg-indigo-600/60 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                                >
                                  <Users className="w-3 h-3" /> Warga Sekolah
                                </button>
                              )}
                              {(msg.text.toLowerCase().includes('tv') || msg.text.toLowerCase().includes('signage')) && (
                                <button
                                  type="button"
                                  onClick={() => onNavigateSection('signage')}
                                  className="px-2 py-0.5 bg-amber-600/60 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                                >
                                  <Tv className="w-3 h-3" /> TV Signage
                                </button>
                              )}
                              {(msg.text.toLowerCase().includes('kokurikulum') || msg.text.toLowerCase().includes('sukan')) && (
                                <button
                                  type="button"
                                  onClick={() => onNavigateSection('kokurikulum')}
                                  className="px-2 py-0.5 bg-emerald-600/60 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                                >
                                  <Award className="w-3 h-3" /> Kokurikulum
                                </button>
                              )}
                            </div>
                          )}

                          {/* Quick Action Portal Buttons for Bot Messages */}
                          {msg.sender === 'bot' && (
                            <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex flex-wrap gap-1.5">
                              {(msg.actionType === 'carian_murid' || msg.text.toLowerCase().includes('carian murid') || msg.text.toLowerCase().includes('pangkalan data murid')) && onOpenStudentPortal && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onOpenStudentPortal();
                                    setIsOpen(false);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer transition"
                                >
                                  <Search className="w-3.5 h-3.5 text-emerald-200" />
                                  <span>Buka Portal Carian Murid</span>
                                </button>
                              )}
                              {(msg.actionType === 'kehadiran_rmt' || msg.text.toLowerCase().includes('kehadiran rmt') || msg.text.toLowerCase().includes('portal rmt')) && onOpenRmtPortal && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onOpenRmtPortal();
                                    setIsOpen(false);
                                  }}
                                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-md shadow-amber-950/40 cursor-pointer transition"
                                >
                                  <Utensils className="w-3.5 h-3.5 text-amber-200" />
                                  <span>Buka Portal Kehadiran RMT</span>
                                </button>
                              )}
                              {(msg.actionType === 'tempahan_ict' || msg.text.toLowerCase().includes('tempahan bilik ict') || msg.text.toLowerCase().includes('tempahan bilik khas') || msg.text.toLowerCase().includes('borang tempahan bilik ict')) && onOpenIctBooking && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onOpenIctBooking();
                                    setIsOpen(false);
                                  }}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-md shadow-blue-950/40 cursor-pointer transition"
                                >
                                  <Laptop className="w-3.5 h-3.5 text-blue-200" />
                                  <span>Buka Borang Tempahan Bilik ICT</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Message Footer: Timestamp & Tools */}
                      <div className="flex items-center gap-2.5 mt-1 px-1 text-[10px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        {msg.sender === 'bot' && (
                          <>
                            {/* Dengar Bacaan Melayu */}
                            <button
                              type="button"
                              onClick={() => speakText(msg.text, msg.id)}
                              className={`transition flex items-center gap-1 font-bold ${
                                currentlySpeakingId === msg.id
                                  ? 'text-yellow-300 animate-pulse'
                                  : 'hover:text-blue-300'
                              }`}
                              title={currentlySpeakingId === msg.id ? 'Hentikan Suara' : 'Dengar Suara Bahasa Melayu'}
                            >
                              {currentlySpeakingId === msg.id ? (
                                <>
                                  <VolumeX className="w-3 h-3 text-rose-400" />
                                  <span className="text-yellow-300">Bercakap...</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3 h-3 text-blue-400" />
                                  <span>Dengar</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyMessage(msg.id, msg.text)}
                              className="hover:text-blue-300 transition flex items-center gap-0.5"
                              title="Salin Mesej"
                            >
                              {copiedMsgId === msg.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-yellow-400 p-0.5 flex-shrink-0">
                        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                          <Bot className="w-4 h-4 text-cyan-300 animate-spin" />
                        </div>
                      </div>
                      <div className="bg-slate-800 border border-blue-500/30 rounded-2xl rounded-bl-none px-4 py-2.5 flex items-center gap-2 text-xs text-blue-200">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        <span>Sweetbot sedang berfikir & mencari maklumat...</span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex flex-col gap-2">
                  {/* Carian Pantas (Guru & Admin) Quick Bar in Chat Box */}
                  {isTeacherOrAdmin && (
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-0.5 px-0.5">
                      <button
                        type="button"
                        onClick={() => handleQuickPortalAction('carian_murid')}
                        className="px-2.5 py-1 bg-emerald-950/90 hover:bg-emerald-850 active:scale-95 border border-emerald-400/40 rounded-lg text-[11px] font-bold text-emerald-200 hover:text-white transition flex items-center gap-1.5 flex-shrink-0 shadow-sm cursor-pointer"
                        title="Pangkalan Data Carian Murid APDM (375 Murid)"
                      >
                        <Search className="w-3 h-3 text-emerald-300" />
                        <span>Cari Murid</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickPortalAction('kehadiran_rmt')}
                        className="px-2.5 py-1 bg-amber-950/90 hover:bg-amber-850 active:scale-95 border border-amber-400/40 rounded-lg text-[11px] font-bold text-amber-200 hover:text-white transition flex items-center gap-1.5 flex-shrink-0 shadow-sm cursor-pointer"
                        title="Portal Kehadiran & Pengurusan RMT (89 Murid)"
                      >
                        <Utensils className="w-3 h-3 text-amber-300" />
                        <span>RMT</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickPortalAction('tempahan_ict')}
                        className="px-2.5 py-1 bg-blue-950/90 hover:bg-blue-850 active:scale-95 border border-blue-400/40 rounded-lg text-[11px] font-bold text-blue-200 hover:text-white transition flex items-center gap-1.5 flex-shrink-0 shadow-sm cursor-pointer"
                        title="Tempahan Bilik Khas & Alatan ICT Sekolah"
                      >
                        <Laptop className="w-3 h-3 text-blue-300" />
                        <span>ICT</span>
                      </button>
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    {/* Voice Mic Button */}
                    <button
                      type="button"
                      onClick={toggleSpeechRecognition}
                      className={`p-2.5 rounded-xl transition ${
                        isListening
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                      title={isListening ? 'Mendengar Suara... (Klik untuk henti)' : 'Cakap dengan Sweetbot'}
                    >
                      {isListening ? <Mic className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                    </button>

                    {/* Text Input */}
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={isListening ? 'Sila bercakap sekarang...' : 'Tanya Sweetbot apa sahaja tentang SKMP...'}
                      className="flex-1 bg-slate-900 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none placeholder:text-slate-500 transition"
                    />

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!inputText.trim() || isTyping}
                      className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-blue-600/30 active:scale-95 transition flex items-center justify-center"
                      title="Hantar Mesej"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Sweetbot Footer Note */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                    <span>Dikuasakan oleh Gemini 3.7 Flash AI • SK Merbau Pulas</span>
                    <span className="text-yellow-400 font-bold">#SweetbotSKMP</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
