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
  principalName: string;
  principalTitle: string;
  principalPhotoUrl?: string;
  principalSpeech?: string;
  motto: string;
  vision: string;
  mission: string;
  history: string;
  logoUrl: string;
  logoDescription: string[];
  songTitle: string;
  songLyrics: string[];
  songComposer: string;
  songAudioUrl: string;
  locationCoords: {
    lat: number;
    lng: number;
    googleMapsEmbedUrl: string;
  };
}

export interface Staff {
  id: string;
  name: string;
  position: string;
  category: 'pentadbir' | 'guru' | 'staf';
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
  type: 'berita' | 'staf' | 'dokumen' | 'acara' | 'anugerah';
  title: string;
  subtitle: string;
  linkTab: string;
  id: string;
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
  showClock: boolean;
  showMarquee: boolean;
  marqueeText: string;
  showWeatherBadge: boolean;
  theme: 'dark' | 'glass' | 'corporate';
}

