import {
  Home,
  School,
  Network,
  GraduationCap,
  HeartHandshake,
  Trophy,
  Newspaper,
  Image as ImageIcon,
  Award,
  Download,
  Tv,
  PhoneCall,
  Code2,
  BookOpen,
  Calendar,
  Star,
  Users,
  FileText,
  MessageSquare,
  Sparkles,
  Globe,
  ExternalLink,
  Shield,
  Layers,
  Compass,
  Bell,
  Activity,
  Bookmark,
  MapPin,
  Flame,
  CheckCircle2,
  Info,
  Link,
  Laptop,
  HelpCircle,
  LucideIcon
} from 'lucide-react';

export interface IconOption {
  name: string;
  label: string;
  icon: LucideIcon;
  category: 'utama' | 'akademik' | 'media' | 'komunikasi' | 'sistem' | 'khas';
}

export const AVAILABLE_NAV_ICONS: IconOption[] = [
  { name: 'Home', label: 'Utama / Laman Utama', icon: Home, category: 'utama' },
  { name: 'School', label: 'Profil / Bangunan', icon: School, category: 'utama' },
  { name: 'Network', label: 'Organisasi / Carta', icon: Network, category: 'utama' },
  { name: 'GraduationCap', label: 'Akademik / Kurikulum', icon: GraduationCap, category: 'akademik' },
  { name: 'HeartHandshake', label: 'HEM / Kebajikan', icon: HeartHandshake, category: 'akademik' },
  { name: 'Trophy', label: 'Kokurikulum / Sukan', icon: Trophy, category: 'akademik' },
  { name: 'BookOpen', label: 'Pembelajaran / Buku', icon: BookOpen, category: 'akademik' },
  { name: 'Calendar', label: 'Takwim / Tarikh Acara', icon: Calendar, category: 'akademik' },
  { name: 'Newspaper', label: 'Berita / Hebahan', icon: Newspaper, category: 'media' },
  { name: 'ImageIcon', label: 'Galeri / Foto', icon: ImageIcon, category: 'media' },
  { name: 'Award', label: 'Ruang Anugerah', icon: Award, category: 'media' },
  { name: 'Download', label: 'Muat Turun Dokumen', icon: Download, category: 'sistem' },
  { name: 'Tv', label: 'Signage / TV Skrin', icon: Tv, category: 'media' },
  { name: 'PhoneCall', label: 'Hubungi Kami', icon: PhoneCall, category: 'komunikasi' },
  { name: 'MessageSquare', label: 'Maklum Balas / Mesej', icon: MessageSquare, category: 'komunikasi' },
  { name: 'Code2', label: 'Kod Apps Script', icon: Code2, category: 'sistem' },
  { name: 'FileText', label: 'Fail / Surat Pekeliling', icon: FileText, category: 'sistem' },
  { name: 'Users', label: 'Warga / Murid / Staf', icon: Users, category: 'utama' },
  { name: 'Globe', label: 'Laman Web Luar', icon: Globe, category: 'sistem' },
  { name: 'ExternalLink', label: 'Pautan Luar', icon: ExternalLink, category: 'sistem' },
  { name: 'Shield', label: 'Disiplin / Keselamatan', icon: Shield, category: 'akademik' },
  { name: 'Layers', label: 'Struktur / Modul', icon: Layers, category: 'sistem' },
  { name: 'Compass', label: 'Panduan / Arah', icon: Compass, category: 'khas' },
  { name: 'Star', label: 'Istimewa / Bintang', icon: Star, category: 'khas' },
  { name: 'Sparkles', label: 'Terkini / Kilauan', icon: Sparkles, category: 'khas' },
  { name: 'Bell', label: 'Notifikasi / Penting', icon: Bell, category: 'komunikasi' },
  { name: 'Activity', label: 'Aktiviti / Kesihatan', icon: Activity, category: 'akademik' },
  { name: 'Bookmark', label: 'Penanda / Bahan', icon: Bookmark, category: 'akademik' },
  { name: 'MapPin', label: 'Lokasi / Peta', icon: MapPin, category: 'utama' },
  { name: 'Flame', label: 'Hangat / Penting', icon: Flame, category: 'khas' },
  { name: 'Laptop', label: 'ICT / DELIMa', icon: Laptop, category: 'sistem' },
  { name: 'HelpCircle', label: 'Bantuan / FAQ', icon: HelpCircle, category: 'komunikasi' }
];

export function getNavIcon(iconName?: string): LucideIcon {
  if (!iconName) return Home;
  const match = AVAILABLE_NAV_ICONS.find(
    (i) => i.name.toLowerCase() === iconName.trim().toLowerCase()
  );
  if (match) return match.icon;

  // Fallback direct name match
  const lower = iconName.toLowerCase();
  if (lower.includes('home') || lower.includes('utama')) return Home;
  if (lower.includes('school') || lower.includes('profil')) return School;
  if (lower.includes('network') || lower.includes('organisasi')) return Network;
  if (lower.includes('grad') || lower.includes('akademik')) return GraduationCap;
  if (lower.includes('heart') || lower.includes('hem')) return HeartHandshake;
  if (lower.includes('trophy') || lower.includes('koko')) return Trophy;
  if (lower.includes('news') || lower.includes('berita')) return Newspaper;
  if (lower.includes('image') || lower.includes('galeri')) return ImageIcon;
  if (lower.includes('award') || lower.includes('anugerah')) return Award;
  if (lower.includes('download') || lower.includes('portal') || lower.includes('dokumen')) return Download;
  if (lower.includes('tv') || lower.includes('signage')) return Tv;
  if (lower.includes('phone') || lower.includes('hubungi')) return PhoneCall;
  if (lower.includes('code')) return Code2;
  if (lower.includes('user') || lower.includes('staf')) return Users;
  if (lower.includes('book')) return BookOpen;
  if (lower.includes('cal')) return Calendar;

  return Home;
}
