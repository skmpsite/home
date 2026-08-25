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
  School
} from 'lucide-react';
import { SchoolProfile, CalendarEvent, NewsItem, Staff } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  actionTag?: string;
}

interface SweetbotWidgetProps {
  profile?: SchoolProfile;
  events?: CalendarEvent[];
  newsList?: NewsItem[];
  staffList?: Staff[];
  onNavigateSection?: (sectionId: string) => void;
}

export const SweetbotWidget: React.FC<SweetbotWidgetProps> = ({
  profile,
  events = [],
  newsList = [],
  staffList = [],
  onNavigateSection
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

    // 1. Cari suara khusus Bahasa Melayu Malaysia (ms-MY / Malaysia)
    const msVoice = voices.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      // Jangan benarkan Bahasa Indonesia
      if (lang.includes('id') || name.includes('indonesia')) return false;

      return (
        lang === 'ms-my' ||
        lang === 'ms_my' ||
        lang.startsWith('ms') ||
        name.includes('malay (malaysia)') ||
        name.includes('bahasa melayu') ||
        name.includes('bahasa malaysia') ||
        name.includes('melayu') ||
        name.includes('yasmin') ||
        name.includes('osman')
      );
    });
    if (msVoice) return msVoice;

    // 2. Cari suara dengan kod bahasa 'ms'
    const anyMs = voices.find((v) => {
      const lang = v.lang.toLowerCase();
      const name = v.name.toLowerCase();
      if (lang.includes('id') || name.includes('indonesia')) return false;
      return lang.startsWith('ms') || name.includes('malay');
    });
    if (anyMs) return anyMs;

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

  // Pembersihan teks sebelum dibaca agar berbunyi Bahasa Melayu Asli & Baku
  const cleanTextForMalaySpeech = (rawText: string): string => {
    let text = rawText;
    // Buang pautan markdown dan format tanda baca
    text = text.replace(/\[(.*?)\]\(.*?\)/g, '$1');
    text = text.replace(/[*#_`~>•-]/g, ' ');
    // Buang emoji dan simbol khas
    text = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    
    // Gantikan akronim kepada sebutan Bahasa Melayu yang jelas
    const replacements: Record<string, string> = {
      'SKMP': 'Sekolah Kebangsaan Merbau Pulas',
      'SK Merbau Pulas': 'Sekolah Kebangsaan Merbau Pulas',
      'KPM': 'Kementerian Pendidikan Malaysia',
      'HEM': 'Hal Ehwal Murid',
      'PK': 'Penolong Kanan',
      'GB': 'Guru Besar',
      'PBS': 'Pentaksiran Berasaskan Sekolah',
      'PBD': 'Pentaksiran Bilik Darjah',
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

  // Fungsi memainkan barisan audio Bahasa Melayu secara berturutan
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

      audio.onerror = () => {
        console.warn('Audio stream error for chunk:', nextChunk);
        // Teruskan ke chunk seterusnya tanpa menduplikasi panggilan web speech
        playNextAudioChunk(msgId);
      };

      audio.play().catch((playErr) => {
        console.warn('Audio play failed (maybe autoplay restriction):', playErr);
        // Jika autoplay disekat pelayar, hentikan barisan dan elakkan percakapan berganda
        isPlayingAudioRef.current = false;
        setCurrentlySpeakingId(null);
      });
    } catch (e) {
      playNextAudioChunk(msgId);
    }
  };

  // Text-To-Speech Bahasa Melayu / Bahasa Malaysia Tulen
  const speakText = (text: string, msgId?: string) => {
    if (!speechEnabled) return;
    
    // Hentikan sebarang pertuturan semasa serta-merta
    stopSpeaking();

    if (currentlySpeakingId === msgId && msgId) {
      setCurrentlySpeakingId(null);
      return;
    }

    const cleanText = cleanTextForMalaySpeech(text);
    if (!cleanText) return;

    // Pecahkan teks mengikut ayat Bahasa Melayu (tanda noktah, koma, tanda soal, seru atau baris baru)
    // Hadkan setiap ketulan kepada maksimum ~150 aksara untuk sebutan audio yang lancar dan pantas
    const sentences = cleanText
      .split(/(?<=[.?!;:\n])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const chunks: string[] = [];
    for (const sentence of sentences) {
      if (sentence.length <= 150) {
        chunks.push(sentence);
      } else {
        // Pecahkan ayat panjang kepada klausa
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
      // Sediakan konteks sekolah
      const schoolContext = {
        name: profile?.name || 'Sekolah Kebangsaan Merbau Pulas',
        code: profile?.code || 'KBA5012',
        motto: profile?.motto || 'Berilmu, Beramal, Berbakti',
        principalName: profile?.principalName,
        totalEvents: events.length,
        totalNews: newsList.length,
        totalStaff: staffList.length
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
          schoolContext
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const botReply = data.reply || 'Hai! Sweetbot sedia membantu anda. Boleh saya bantu dengan maklumat lain? 🤖';

      const botMessage: Message = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMessage]);
      speakText(botReply, botMessage.id);
    } catch (err) {
      console.warn('Chat API error, fallback response:', err);
      // Fallback mesra
      const fallbackMsg: Message = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: `Terima kasih atas soalan anda! SK Merbau Pulas sentiasa komited memberikan pendidikan berkualiti berteraskan motto *"Berilmu, Beramal, Berbakti"*. Anda juga boleh merujuk menu utama portal untuk maklumat lanjut! 🌟🎒`,
        timestamp: new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakText(fallbackMsg.text, fallbackMsg.id);
    } finally {
      setIsTyping(false);
    }
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
    { label: '👨‍🏫 Guru Besar & Pentadbir', query: 'Siapakah barisan pentadbir dan Guru Besar SK Merbau Pulas?' },
    { label: '🌟 Visi & Motto Sekolah', query: 'Apakah visi, misi dan motto SK Merbau Pulas?' },
    { label: '📅 Takwim & Cuti', query: 'Apakah program atau takwim persekolahan yang terdekat?' },
    { label: '🏆 Aktiviti Kokurikulum', query: 'Apakah kelab, persatuan dan sukan yang ada di SK Merbau Pulas?' },
    { label: '📺 Digital Signage Smart TV', query: 'Ceritakan tentang sistem Digital Signage TV sekolah' },
    { label: '💡 Tips Belajar Cemerlang', query: 'Berikan saya 3 tips belajar yang cemerlang untuk murid sekolah rendah' }
  ];

  return (
    <>
      {/* 1. ROBOT BERPAUT MENGINTAI DI TEPI BINGKAI WEB (Peeking Behind The Wall on Right Edge) */}
      {!isOpen && (
        <div className="fixed right-0 top-[55%] -translate-y-1/2 z-50 flex items-center select-none pointer-events-auto">
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

          {/* Animated Robot Peeking Body (Hides behind wall, slides out full head with a cheerful smile, then hides back) */}
          <motion.div
            id="sweetbot-peek-btn"
            onClick={() => {
              setIsPeekingHovered(false);
              setIsOpen(true);
            }}
            onMouseEnter={() => setIsPeekingHovered(true)}
            onMouseLeave={() => setIsPeekingHovered(false)}
            onTouchStart={() => setIsPeekingHovered(false)}
            initial={{ x: 52 }}
            animate={
              isPeekingHovered
                ? {
                    x: 0,
                    rotate: 0,
                    scale: 1.08
                  }
                : {
                    x: [52, 52, 0, 0, 0, 52, 52],
                    rotate: [0, 0, -4, 2, -2, 0, 0],
                    y: [0, 0, -6, -3, -6, 0, 0]
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
            className="cursor-pointer group relative flex items-center focus:outline-none pr-0"
            title="Sweetbot sedang mengintai & tersenyum! Klik untuk buka perbualan AI."
          >
            {/* Clinging Wall Tabs / Handles for easy clicking even when mostly hidden */}
            <div className="relative bg-gradient-to-l from-blue-800 via-indigo-700 to-amber-500 p-1.5 rounded-l-3xl shadow-[-10px_0px_30px_rgba(37,99,235,0.45)] border-l-2 border-y-2 border-yellow-300 flex items-center group-hover:shadow-[-12px_0px_35px_rgba(234,179,8,0.5)] transition-all duration-300">
              {/* Vertical Quick Badge on the outermost peeking edge */}
              <div className="absolute -left-5 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center bg-blue-950/90 border border-yellow-400/40 rounded-l-lg py-1 px-1 shadow-md opacity-75 group-hover:opacity-100 transition">
                <Bot className="w-3 h-3 text-cyan-300" />
                <span className="text-[8px] font-black text-yellow-300 uppercase tracking-tighter [writing-mode:vertical-lr] rotate-180 mt-0.5">
                  AI
                </span>
              </div>

              {/* Cute SVG Robot Peeking Head */}
              <div className="w-16 h-20 sm:w-18 sm:h-22 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 rounded-l-2xl flex flex-col items-center justify-center p-2 relative overflow-hidden border border-blue-400/40">
                {/* Robot Antenna with blinking signal beacon */}
                <div className="absolute top-1 flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping shadow-[0_0_10px_#facc15]" />
                  <div className="w-1 h-2 bg-yellow-300 rounded-full" />
                </div>

                {/* Robot Screen Face */}
                <div className="w-12 h-9 sm:w-14 sm:h-10 bg-slate-950 rounded-lg border border-cyan-400/50 flex items-center justify-around px-1.5 shadow-[inset_0_0_10px_rgba(6,182,212,0.4)] mt-2">
                  {/* Glowing Animated Robot Eyes (Beams happily when peeking out & smiling) */}
                  <motion.div
                    animate={
                      isPeekingHovered
                        ? {
                            scaleY: [1, 0.2, 1],
                            scaleX: 1.15,
                            x: 0
                          }
                        : {
                            scaleY: [1, 1, 0.75, 0.75, 0.75, 1, 1],
                            scaleX: [1, 1, 1.15, 1.15, 1.15, 1, 1],
                            x: [-2, -2, 0, 0, 0, -2, -2]
                          }
                    }
                    transition={
                      isPeekingHovered
                        ? { repeat: Infinity, duration: 2.5, repeatDelay: 1.5 }
                        : { repeat: Infinity, duration: 7.5, times: [0, 0.22, 0.36, 0.55, 0.68, 0.8, 1], ease: 'easeInOut' }
                    }
                    className="w-3.5 h-4 bg-cyan-300 rounded-full shadow-[0_0_8px_#22d3ee] flex items-center justify-center relative overflow-hidden"
                  >
                    <span className="w-1.5 h-1.5 bg-white rounded-full self-start mr-0.5 mt-0.5 shadow-sm" />
                  </motion.div>
                  <motion.div
                    animate={
                      isPeekingHovered
                        ? {
                            scaleY: [1, 0.2, 1],
                            scaleX: 1.15,
                            x: 0
                          }
                        : {
                            scaleY: [1, 1, 0.75, 0.75, 0.75, 1, 1],
                            scaleX: [1, 1, 1.15, 1.15, 1.15, 1, 1],
                            x: [-2, -2, 0, 0, 0, -2, -2]
                          }
                    }
                    transition={
                      isPeekingHovered
                        ? { repeat: Infinity, duration: 2.5, repeatDelay: 1.5 }
                        : { repeat: Infinity, duration: 7.5, times: [0, 0.22, 0.36, 0.55, 0.68, 0.8, 1], ease: 'easeInOut' }
                    }
                    className="w-3.5 h-4 bg-cyan-300 rounded-full shadow-[0_0_8px_#22d3ee] flex items-center justify-center relative overflow-hidden"
                  >
                    <span className="w-1.5 h-1.5 bg-white rounded-full self-start mr-0.5 mt-0.5 shadow-sm" />
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
                  className="flex justify-between w-11 mt-0.5"
                >
                  <div className="w-2 h-1 bg-pink-400 rounded-full blur-[0.5px] shadow-[0_0_5px_#f472b6]" />
                  <div className="w-2 h-1 bg-pink-400 rounded-full blur-[0.5px] shadow-[0_0_5px_#f472b6]" />
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
                  className="h-1.5 w-4 rounded-full mt-0.5 shadow-[0_0_8px_rgba(250,204,21,0.7)] flex items-center justify-center"
                />

                {/* Robot Claws / Hands Clutching The Wall Edge */}
                <div className="absolute -left-1 top-6 w-2.5 h-4 bg-yellow-400 rounded-r-md shadow-md border-r border-yellow-200" />
                <div className="absolute -left-1 bottom-4 w-2.5 h-4 bg-yellow-400 rounded-r-md shadow-md border-r border-yellow-200" />

                {/* Sweetbot Badge Text */}
                <span className="text-[8px] font-black tracking-tighter text-yellow-300 mt-1 uppercase">
                  Sweetbot
                </span>
              </div>
            </div>

            {/* Glowing Accent Ring */}
            <div className="absolute -inset-1 bg-blue-500/20 rounded-l-3xl -z-10 animate-pulse" />
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
              height: isMinimized ? 'auto' : '620px'
            }}
            exit={{ opacity: 0, scale: 0.85, y: 50, x: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={`fixed bottom-4 right-4 z-50 w-[95vw] sm:w-[420px] max-w-[440px] bg-slate-900/95 backdrop-blur-2xl border-2 border-blue-400/50 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden text-slate-100 font-sans transition-all duration-300`}
            style={{ maxHeight: '90vh' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-4 border-b border-blue-500/30 flex items-center justify-between relative select-none">
              <div className="flex items-center gap-3">
                {/* Robot Avatar Mini with Status Ping */}
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-yellow-400 p-0.5 shadow-lg flex items-center justify-center">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                      <Bot className="w-6 h-6 text-cyan-300 animate-bounce" />
                    </div>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-white tracking-wide">
                      Sweetbot AI
                    </h4>
                    <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-[10px] font-black rounded-full uppercase tracking-wider">
                      SKMP
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    Pembantu Maya Rasmi SK Merbau Pulas
                  </p>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1">
                {/* Toggle Voice / TTS */}
                <button
                  type="button"
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  className={`p-2 rounded-xl transition ${
                    speechEnabled
                      ? 'bg-blue-600/60 text-yellow-300 hover:bg-blue-500/80'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                  title={speechEnabled ? 'Suara Aktif (Klik untuk Matikan)' : 'Suara Dimatikan (Klik untuk Aktifkan)'}
                >
                  {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Reset Chat */}
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition"
                  title="Kosongkan Perbualan"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                {/* Minimize Toggle */}
                <button
                  type="button"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition"
                  title={isMinimized ? 'Besarkan' : 'Kecilkan'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-rose-600/80 hover:bg-rose-500 text-white rounded-xl transition ml-1"
                  title="Tutup Sweetbot"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body (Messages & Suggestions) */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-slate-800/50">
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
