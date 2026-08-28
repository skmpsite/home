import React, { useState, useEffect } from 'react';
import {
  SchoolProfile,
  Staff,
  NewsItem,
  CalendarEvent,
  GalleryItem,
  AwardItem,
  DownloadDocument,
  FeedbackEntry,
  PibgActivity,
  PibgCommittee,
  CoCurriculumUnit,
  SignageSlide,
  SignageConfig,
  HemData
} from '../types';
import {
  LayoutDashboard,
  School,
  Newspaper,
  Users,
  Calendar,
  FileText,
  Award,
  Image as ImageIcon,
  MessageSquare,
  Code2,
  Tv,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  X,
  RotateCcw,
  Save,
  Pin,
  Trophy,
  Upload,
  BookOpen,
  UploadCloud,
  RefreshCw,
  UserCheck,
  HeartHandshake,
  Flame
} from 'lucide-react';
import { initialSchoolProfile, initialHemData } from '../data/initialData';
import { GasScriptSection } from './sections/GasScriptSection';
import { AdminSignageManager } from './admin/AdminSignageManager';
import { AdminHemManager } from './admin/AdminHemManager';
import { FirebaseManager } from './admin/FirebaseManager';
import { syncBulkDataToGoogleSheets } from '../utils/googleSheetsSync';
import { syncAllDataToFirestore } from '../utils/firebaseRealtime';
import { getSafeNewsImageUrl, compressAndResizeImage, compressStaffPhoto, OFFICIAL_NEWS_PHOTOS, SECONDARY_FALLBACK_PHOTOS } from '../utils/imageHelpers';
import { sortStaffBySeniority } from '../utils/staffHelpers';

interface AdminDashboardProps {
  profile: SchoolProfile;
  onSaveProfile: (p: SchoolProfile) => void;
  staffList: Staff[];
  onSaveStaff: (s: Staff[]) => void;
  newsList: NewsItem[];
  onSaveNews: (n: NewsItem[]) => void;
  events: CalendarEvent[];
  onSaveEvents: (e: CalendarEvent[]) => void;
  documents: DownloadDocument[];
  onSaveDocuments: (d: DownloadDocument[]) => void;
  awards: AwardItem[];
  onSaveAwards: (a: AwardItem[]) => void;
  gallery: GalleryItem[];
  onSaveGallery: (g: GalleryItem[]) => void;
  feedbackList: FeedbackEntry[];
  onSaveFeedback: (f: FeedbackEntry[]) => void;
  pibgActivities: PibgActivity[];
  onSavePibgActivities: (act: PibgActivity[]) => void;
  pibgCommittee: PibgCommittee[];
  onSavePibgCommittee: (comm: PibgCommittee[]) => void;
  coCurriculumUnits: CoCurriculumUnit[];
  onSaveCoCurriculum: (units: CoCurriculumUnit[]) => void;
  signageSlides: SignageSlide[];
  onSaveSignageSlides: (slides: SignageSlide[]) => void;
  signageConfig: SignageConfig;
  onSaveSignageConfig: (config: SignageConfig) => void;
  hemData?: HemData;
  onSaveHemData?: (data: HemData) => void;
  onResetAll: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  profile,
  onSaveProfile,
  staffList,
  onSaveStaff,
  newsList,
  onSaveNews,
  events,
  onSaveEvents,
  documents,
  onSaveDocuments,
  awards,
  onSaveAwards,
  gallery,
  onSaveGallery,
  feedbackList,
  onSaveFeedback,
  pibgActivities,
  onSavePibgActivities,
  pibgCommittee,
  onSavePibgCommittee,
  coCurriculumUnits,
  onSaveCoCurriculum,
  signageSlides,
  onSaveSignageSlides,
  signageConfig,
  onSaveSignageConfig,
  hemData,
  onSaveHemData,
  onResetAll
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'news'
    | 'staff'
    | 'events'
    | 'documents'
    | 'gallery'
    | 'awards'
    | 'cocurriculum'
    | 'hem'
    | 'signage'
    | 'profile'
    | 'feedback'
    | 'gas_code'
    | 'firebase'
  >('news');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isQuickSyncing, setIsQuickSyncing] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState(false);

  const handleQuickSyncToSheets = async () => {
    setIsQuickSyncing(true);
    const res = await syncBulkDataToGoogleSheets({
      profile,
      staffList,
      newsList,
      events,
      awards,
      documents,
      gallery
    });
    setIsQuickSyncing(false);
    if (res.success) {
      showToast('🚀 Semua Data Portal Berjaya Ditolak Masuk Ke Google Sheets!');
    } else {
      showToast(res.message || 'Gagal menyegerak ke Google Sheets. Sila semak URL Web App.');
    }
  };

  const handleQuickSyncToFirebase = async () => {
    setIsFirebaseSyncing(true);
    try {
      await syncAllDataToFirestore({
        profile,
        staffList,
        newsList,
        events,
        awards,
        documents,
        gallery,
        hemData,
        pibgActivities,
        pibgCommittee,
        cocurriculum: coCurriculumUnits,
        signageSlides,
        signageConfig
      });
      showToast('🔥 Semua Data (Termasuk PKP & Warga Staf) Berjaya Disegerak Ke Firebase Firestore!');
    } catch (err) {
      console.error('Firebase quick sync error:', err);
      showToast('Gagal menyegerak ke Firebase. Semak Rules di Firebase Console.');
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  // Profile Edit State
  const [editProfileData, setEditProfileData] = useState<SchoolProfile>({ ...profile });

  useEffect(() => {
    setEditProfileData({ ...profile });
  }, [profile]);

  const getStaffPhoto = (s: Staff | null | undefined): string => {
    if (!s) return '';
    const isGuruBesar =
      s.id === 'staf-1' ||
      (s.position && s.position.toLowerCase().includes('guru besar')) ||
      (s.name && s.name.toLowerCase().includes('norhafiza'));

    if (isGuruBesar) {
      if (editProfileData.principalPhotoUrl && editProfileData.principalPhotoUrl.trim() !== '') {
        return editProfileData.principalPhotoUrl;
      }
      if (profile.principalPhotoUrl && profile.principalPhotoUrl.trim() !== '') {
        return profile.principalPhotoUrl;
      }
      if (
        s.photoUrl &&
        s.photoUrl.trim() !== '' &&
        !s.photoUrl.includes('unsplash.com') &&
        !s.photoUrl.includes('1786556385385') &&
        !s.photoUrl.includes('1786555771027') &&
        !s.photoUrl.includes('guru_besar_norhafiza') &&
        !s.photoUrl.includes('1786808669012')
      ) {
        return s.photoUrl;
      }
      return '';
    }

    if (!s.photoUrl || s.photoUrl.trim() === '' || s.photoUrl.includes('unsplash.com')) {
      return '';
    }
    return s.photoUrl;
  };

  // News State & Modal
  const [newNews, setNewNews] = useState({
    title: '',
    category: 'pengumuman' as 'pengumuman' | 'aktiviti' | 'pekeliling',
    summary: '',
    content: '',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600',
    author: 'Pentadbiran SKMP',
    isPinned: false
  });
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);

  // Staff State & Modal
  const [newStaff, setNewStaff] = useState({
    name: '',
    position: '',
    category: 'guru' as 'pentadbir' | 'guru' | 'staf',
    grade: 'DG41',
    subject: '',
    email: '',
    photoUrl: ''
  });
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Event State & Modal
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: 'acara' as 'peperiksaan' | 'cuti' | 'acara' | 'pibg',
    description: '',
    location: 'SK Merbau Pulas',
    targetGroup: 'Warga Sekolah'
  });
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Document State & Modal
  const [newDoc, setNewDoc] = useState({
    title: '',
    category: 'borang' as 'borang' | 'kebenaran' | 'takwim' | 'pekeliling' | 'pibg',
    fileType: 'PDF' as 'PDF' | 'DOCX' | 'XLSX',
    fileSize: '1.5 MB',
    description: ''
  });
  const [editingDoc, setEditingDoc] = useState<DownloadDocument | null>(null);

  // Gallery State & Modal
  const [newGallery, setNewGallery] = useState({
    title: '',
    category: 'akademik' as 'sukan' | 'akademik' | 'kokurikulum' | 'majlis',
    type: 'photo' as 'photo' | 'video',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
    caption: ''
  });
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);

  // Award State & Modal
  const [newAward, setNewAward] = useState({
    title: '',
    recipient: '',
    category: 'kebangsaan' as 'daerah' | 'negeri' | 'kebangsaan' | 'antarabangsa',
    year: '2026',
    achievement: 'Johan / Anugerah Emas',
    description: '',
    badgeUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&q=80&w=300'
  });
  const [editingAward, setEditingAward] = useState<AwardItem | null>(null);

  // CoCurriculum & PIBG States
  const [newCoUnit, setNewCoUnit] = useState({
    name: '',
    category: 'beruniform' as 'beruniform' | 'kelab' | 'sukan',
    advisorTeacher: '',
    meetingTime: 'Rabu (2.00 petang - 4.00 petang)',
    description: '',
    iconName: 'Shield'
  });
  const [editingCoUnit, setEditingCoUnit] = useState<CoCurriculumUnit | null>(null);

  const [newPibgComm, setNewPibgComm] = useState({
    name: '',
    position: 'AJK Ibu Bapa',
    category: 'ibu_bapa' as 'ibu_bapa' | 'guru',
    phone: '',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
  });
  const [editingPibgComm, setEditingPibgComm] = useState<PibgCommittee | null>(null);

  // Handlers for Profile
  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(editProfileData);

    // Sync principal name & photo with staffList and pibgCommittee
    const hasGbInStaff = staffList.some(
      (s) => s.id === 'staf-1' || s.position.toLowerCase().includes('guru besar') || s.name.toLowerCase().includes('norhafiza')
    );

    let updatedStaff: Staff[] = [];
    if (hasGbInStaff) {
      updatedStaff = staffList.map((s) => {
        if (
          s.id === 'staf-1' ||
          s.position.toLowerCase().includes('guru besar') ||
          s.name.toLowerCase().includes('norhafiza')
        ) {
          return {
            ...s,
            name: editProfileData.principalName || s.name,
            position: editProfileData.principalTitle || s.position || 'Guru Besar (DG48)',
            grade: 'DG48',
            category: 'pentadbir' as const,
            photoUrl: editProfileData.principalPhotoUrl !== undefined ? editProfileData.principalPhotoUrl : s.photoUrl
          };
        }
        return s;
      });
    } else {
      const gbStaff: Staff = {
        id: 'staf-1',
        name: editProfileData.principalName || 'Puan Norhafiza Binti Dolah',
        position: editProfileData.principalTitle || 'Guru Besar (DG48)',
        category: 'pentadbir',
        grade: 'DG48',
        subject: 'Pengurusan & Pentadbiran',
        email: 'norhafiza.skmp@moe-dl.edu.my',
        phone: '019-456 7890',
        photoUrl: editProfileData.principalPhotoUrl || '',
        order: 1
      };
      updatedStaff = [gbStaff, ...staffList];
    }
    onSaveStaff(sortStaffBySeniority(updatedStaff, editProfileData));

    if (pibgCommittee.length > 0) {
      const updatedPibg = pibgCommittee.map((c) => {
        if (
          c.id === 'pibg-c-2' ||
          c.position.toLowerCase().includes('penasihat') ||
          c.position.toLowerCase().includes('guru besar') ||
          c.name.toLowerCase().includes('norhafiza')
        ) {
          return {
            ...c,
            name: editProfileData.principalName || c.name,
            photoUrl: editProfileData.principalPhotoUrl !== undefined ? editProfileData.principalPhotoUrl : c.photoUrl
          };
        }
        return c;
      });
      onSavePibgCommittee(updatedPibg);
    }

    showToast('Profil Sekolah & Maklumat Guru Besar Berjaya Dikemas Kini!');
  };

  // Handlers for News
  const handleAddNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNews.title || !newNews.summary) return;
    const item: NewsItem = {
      id: 'news-' + Date.now(),
      title: newNews.title,
      date: new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: 'long', year: 'numeric' }),
      category: newNews.category,
      summary: newNews.summary,
      content: newNews.content || newNews.summary,
      imageUrl: newNews.imageUrl,
      author: newNews.author,
      isPinned: newNews.isPinned,
      views: 0
    };
    onSaveNews([item, ...newsList]);
    setNewNews({
      title: '',
      category: 'pengumuman',
      summary: '',
      content: '',
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600',
      author: 'Pentadbiran SKMP',
      isPinned: false
    });
    showToast('Berita Baharu Diterbitkan!');
  };

  const handleUpdateNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;
    onSaveNews(newsList.map((n) => (n.id === editingNews.id ? editingNews : n)));
    setEditingNews(null);
    showToast('Berita Berjaya Dikemas Kini!');
  };

  const handleDeleteNews = (id: string) => {
    onSaveNews(newsList.filter((n) => n.id !== id));
    showToast('Berita Berjaya Dipadam!');
  };

  const handleTogglePinNews = (id: string) => {
    onSaveNews(
      newsList.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
    showToast('Status Pinned Dikemas Kini!');
  };

  // Handlers for Staff
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.position) return;
    const isGb =
      newStaff.position.toLowerCase().includes('guru besar') ||
      (newStaff.category === 'pentadbir' && newStaff.position.toLowerCase().includes('besar'));

    const staff: Staff = {
      id: isGb ? 'staf-1' : 'staf-' + Date.now(),
      name: newStaff.name.trim(),
      position: newStaff.position.trim(),
      category: isGb ? 'pentadbir' : newStaff.category,
      grade: isGb ? 'DG48' : (newStaff.grade || 'DG41'),
      subject: newStaff.subject || (isGb ? 'Pengurusan & Pentadbiran' : ''),
      email: newStaff.email || `${newStaff.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@moe-dl.edu.my`,
      photoUrl: newStaff.photoUrl || '',
      order: isGb ? 1 : staffList.length + 1
    };

    // If adding Guru Besar, ensure they are placed at index 0 and update profile
    let updatedStaff: Staff[] = [];
    if (isGb) {
      const filtered = staffList.filter(
        (s) => s.id !== 'staf-1' && !s.position.toLowerCase().includes('guru besar') && !s.name.toLowerCase().includes('norhafiza')
      );
      updatedStaff = [staff, ...filtered];

      if (typeof onSaveProfile === 'function') {
        onSaveProfile({
          ...profile,
          principalName: staff.name,
          principalPhotoUrl: staff.photoUrl,
          principalTitle: staff.position
        });
      }

      if (pibgCommittee && pibgCommittee.length > 0 && typeof onSavePibgCommittee === 'function') {
        const updatedPibg = pibgCommittee.map((c) => {
          const cPos = (c.position || '').toLowerCase();
          if (c.id === 'pibg-c-2' || cPos.includes('penasihat') || cPos.includes('guru besar')) {
            return {
              ...c,
              name: staff.name,
              photoUrl: staff.photoUrl
            };
          }
          return c;
        });
        onSavePibgCommittee(updatedPibg);
      }
    } else {
      updatedStaff = [...staffList, staff];
    }

    onSaveStaff(sortStaffBySeniority(updatedStaff, profile));
    setNewStaff({
      name: '',
      position: '',
      category: 'guru',
      grade: 'DG41',
      subject: '',
      email: '',
      photoUrl: ''
    });
    showToast('Warga Sekolah Berjaya Ditambah!');
  };

  const handleUpdateStaffSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingStaff) return;

    try {
      const updatedStaff = staffList.map((s) => (s.id === editingStaff.id ? editingStaff : s));
      onSaveStaff(sortStaffBySeniority(updatedStaff, profile));

      // If updating Guru Besar staff, sync profile and PIBG committee
      const pos = (editingStaff.position || '').toLowerCase();
      if (pos.includes('guru besar') || editingStaff.id === 'staf-1') {
        if (typeof onSaveProfile === 'function') {
          onSaveProfile({
            ...profile,
            principalName: editingStaff.name,
            principalPhotoUrl: editingStaff.photoUrl,
            principalTitle: editingStaff.position
          });
        }

        if (pibgCommittee && pibgCommittee.length > 0 && typeof onSavePibgCommittee === 'function') {
          const updatedPibg = pibgCommittee.map((c) => {
            const cPos = (c.position || '').toLowerCase();
            if (c.id === 'pibg-c-2' || cPos.includes('penasihat') || cPos.includes('guru besar')) {
              return {
                ...c,
                name: editingStaff.name,
                photoUrl: editingStaff.photoUrl
              };
            }
            return c;
          });
          onSavePibgCommittee(updatedPibg);
        }
      }
    } catch (err) {
      console.error('Error in handleUpdateStaffSubmit:', err);
    } finally {
      setEditingStaff(null);
      showToast('Rekod Warga Sekolah Berjaya Dikemas Kini!');
    }
  };

  const handleDeleteStaff = (id: string) => {
    onSaveStaff(sortStaffBySeniority(staffList.filter((s) => s.id !== id), profile));
    showToast('Rekod Warga Berjaya Dipadam!');
  };

  // Handlers for Events
  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) return;
    const evt: CalendarEvent = {
      id: 'evt-' + Date.now(),
      title: newEvent.title,
      date: newEvent.date,
      category: newEvent.category,
      description: newEvent.description,
      location: newEvent.location,
      targetGroup: newEvent.targetGroup
    };
    onSaveEvents([evt, ...events]);
    setNewEvent({
      title: '',
      date: new Date().toISOString().split('T')[0],
      category: 'acara',
      description: '',
      location: 'SK Merbau Pulas',
      targetGroup: 'Warga Sekolah'
    });
    showToast('Acara Takwim Ditambah!');
  };

  const handleUpdateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    onSaveEvents(events.map((ev) => (ev.id === editingEvent.id ? editingEvent : ev)));
    setEditingEvent(null);
    showToast('Acara Takwim Dikemas Kini!');
  };

  const handleDeleteEvent = (id: string) => {
    onSaveEvents(events.filter((e) => e.id !== id));
    showToast('Acara Takwim Dipadam!');
  };

  // Handlers for Documents
  const handleAddDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title) return;
    const doc: DownloadDocument = {
      id: 'doc-' + Date.now(),
      title: newDoc.title,
      category: newDoc.category,
      fileType: newDoc.fileType,
      fileSize: newDoc.fileSize,
      date: new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' }),
      downloadsCount: 0,
      description: newDoc.description || newDoc.title,
      downloadUrl: '#'
    };
    onSaveDocuments([doc, ...documents]);
    setNewDoc({
      title: '',
      category: 'borang',
      fileType: 'PDF',
      fileSize: '1.5 MB',
      description: ''
    });
    showToast('Dokumen Muat Turun Ditambah!');
  };

  const handleUpdateDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    onSaveDocuments(documents.map((d) => (d.id === editingDoc.id ? editingDoc : d)));
    setEditingDoc(null);
    showToast('Dokumen Dikemas Kini!');
  };

  const handleDeleteDoc = (id: string) => {
    onSaveDocuments(documents.filter((d) => d.id !== id));
    showToast('Dokumen Dipadam!');
  };

  // Handlers for Gallery
  const handleAddGallerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGallery.title) return;
    const item: GalleryItem = {
      id: 'gal-' + Date.now(),
      title: newGallery.title,
      date: new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' }),
      category: newGallery.category,
      type: newGallery.type,
      url: newGallery.url,
      caption: newGallery.caption || newGallery.title
    };
    onSaveGallery([item, ...gallery]);
    setNewGallery({
      title: '',
      category: 'akademik',
      type: 'photo',
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
      caption: ''
    });
    showToast('Item Galeri Ditambah!');
  };

  const handleUpdateGallerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGallery) return;
    onSaveGallery(gallery.map((g) => (g.id === editingGallery.id ? editingGallery : g)));
    setEditingGallery(null);
    showToast('Galeri Dikemas Kini!');
  };

  const handleDeleteGallery = (id: string) => {
    onSaveGallery(gallery.filter((g) => g.id !== id));
    showToast('Item Galeri Dipadam!');
  };

  // Handlers for Awards
  const handleAddAwardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAward.title) return;
    const award: AwardItem = {
      id: 'awd-' + Date.now(),
      title: newAward.title,
      recipient: newAward.recipient,
      category: newAward.category,
      year: newAward.year,
      achievement: newAward.achievement,
      description: newAward.description || newAward.title,
      badgeUrl: newAward.badgeUrl
    };
    onSaveAwards([award, ...awards]);
    setNewAward({
      title: '',
      recipient: '',
      category: 'kebangsaan',
      year: '2026',
      achievement: 'Johan / Anugerah Emas',
      description: '',
      badgeUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&q=80&w=300'
    });
    showToast('Anugerah Ditambah!');
  };

  const handleUpdateAwardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAward) return;
    onSaveAwards(awards.map((a) => (a.id === editingAward.id ? editingAward : a)));
    setEditingAward(null);
    showToast('Rekod Anugerah Dikemas Kini!');
  };

  const handleDeleteAward = (id: string) => {
    onSaveAwards(awards.filter((a) => a.id !== id));
    showToast('Anugerah Dipadam!');
  };

  // Handlers for CoCurriculum Units
  const handleAddCoUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoUnit.name) return;
    const unit: CoCurriculumUnit = {
      id: 'cocu-' + Date.now(),
      name: newCoUnit.name,
      category: newCoUnit.category,
      advisorTeacher: newCoUnit.advisorTeacher,
      meetingTime: newCoUnit.meetingTime,
      description: newCoUnit.description || newCoUnit.name,
      iconName: newCoUnit.iconName
    };
    onSaveCoCurriculum([...coCurriculumUnits, unit]);
    setNewCoUnit({
      name: '',
      category: 'beruniform',
      advisorTeacher: '',
      meetingTime: 'Rabu (2.00 petang - 4.00 petang)',
      description: '',
      iconName: 'Shield'
    });
    showToast('Unit Kokurikulum Ditambah!');
  };

  const handleUpdateCoUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoUnit) return;
    onSaveCoCurriculum(coCurriculumUnits.map((u) => (u.id === editingCoUnit.id ? editingCoUnit : u)));
    setEditingCoUnit(null);
    showToast('Unit Kokurikulum Dikemas Kini!');
  };

  const handleDeleteCoUnit = (id: string) => {
    onSaveCoCurriculum(coCurriculumUnits.filter((u) => u.id !== id));
    showToast('Unit Kokurikulum Dipadam!');
  };

  // Handlers for PIBG Committee
  const handleAddPibgCommSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPibgComm.name) return;
    const comm: PibgCommittee = {
      id: 'pibg-c-' + Date.now(),
      name: newPibgComm.name,
      position: newPibgComm.position,
      category: newPibgComm.category,
      phone: newPibgComm.phone,
      photoUrl: newPibgComm.photoUrl
    };
    onSavePibgCommittee([...pibgCommittee, comm]);
    setNewPibgComm({
      name: '',
      position: 'AJK Ibu Bapa',
      category: 'ibu_bapa',
      phone: '',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
    });
    showToast('Ahli PIBG Ditambah!');
  };

  const handleUpdatePibgCommSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPibgComm) return;
    onSavePibgCommittee(pibgCommittee.map((c) => (c.id === editingPibgComm.id ? editingPibgComm : c)));
    setEditingPibgComm(null);
    showToast('Ahli PIBG Dikemas Kini!');
  };

  const handleDeletePibgComm = (id: string) => {
    onSavePibgCommittee(pibgCommittee.filter((c) => c.id !== id));
    showToast('Ahli PIBG Dipadam!');
  };

  // Handlers for Feedback
  const handleMarkFeedbackRead = (id: string) => {
    onSaveFeedback(
      feedbackList.map((f) => (f.id === id ? { ...f, status: 'dibaca' as const } : f))
    );
    showToast('Status Maklum Balas Dikemas Kini!');
  };

  const handleDeleteFeedback = (id: string) => {
    onSaveFeedback(feedbackList.filter((f) => f.id !== id));
    showToast('Maklum Balas Dipadam!');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* CMS Top Banner */}
      <div className="bg-white/10 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-500/20 text-yellow-300 font-bold rounded-full text-xs border border-yellow-400/30 mb-2">
            <LayoutDashboard className="w-3.5 h-3.5 text-yellow-400" />
            <span>Sistem Pengurusan Kandungan CMS Utama</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Panel Pentadbir SK Merbau Pulas</h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
            Sunting & kawal setiap bahagian laman web: profil sekolah, berita, warga sekolah, takwim, dokumen, galeri, anugerah, kokurikulum, PIBG dan peti maklum balas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleQuickSyncToFirebase}
            disabled={isFirebaseSyncing}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-black rounded-xl text-xs flex items-center gap-2 transition border border-orange-400 shadow-xl shadow-orange-500/20 disabled:opacity-50"
            title="Segerak semua data ke Google Firebase (Cloud Firestore)"
          >
            <Flame className={`w-4 h-4 ${isFirebaseSyncing ? 'animate-bounce text-yellow-200' : 'text-yellow-300'}`} />
            <span>{isFirebaseSyncing ? 'Menyegerak Firebase...' : '🔥 Segerak Ke Firebase'}</span>
          </button>

          <button
            type="button"
            onClick={handleQuickSyncToSheets}
            disabled={isQuickSyncing}
            className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-blue-950 font-black rounded-xl text-xs flex items-center gap-2 transition border border-yellow-300 shadow-xl shadow-yellow-400/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isQuickSyncing ? 'animate-spin' : ''}`} />
            <span>{isQuickSyncing ? 'Sedang Menyegerak...' : '🚀 Tolak Ke Google Sheets'}</span>
          </button>

          <button
            onClick={() => {
              onResetAll();
              showToast('Semua data diset semula ke tetapan asal!');
            }}
            className="px-4 py-2.5 bg-rose-600/80 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition border border-rose-500 shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Ke Tetapan Asal</span>
          </button>
        </div>
      </div>

      {/* Toast Notification - Floating Fixed Bottom Right */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[100] bg-emerald-600 text-white font-extrabold text-xs sm:text-sm px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-yellow-300 flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Admin CMS Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white/10 backdrop-blur-md p-2.5 rounded-3xl border border-white/10 shadow-lg overflow-x-auto">
        {[
          { id: 'news', label: 'Urus Berita', icon: Newspaper },
          { id: 'staff', label: 'Warga Sekolah', icon: Users },
          { id: 'events', label: 'Takwim & Acara', icon: Calendar },
          { id: 'documents', label: 'Muat Turun', icon: FileText },
          { id: 'gallery', label: 'Galeri Media', icon: ImageIcon },
          { id: 'awards', label: 'Ruang Anugerah', icon: Award },
          { id: 'cocurriculum', label: 'Kokurikulum & PIBG', icon: Trophy },
          { id: 'hem', label: 'Hal Ehwal Murid (HEM)', icon: HeartHandshake },
          { id: 'signage', label: 'Urus Signage TV', icon: Tv },
          { id: 'profile', label: 'Profil Sekolah', icon: School },
          { id: 'feedback', label: 'Peti Maklum Balas', icon: MessageSquare, badge: feedbackList.filter((f) => f.status === 'baru').length },
          { id: 'firebase', label: 'Google Firebase (Masa Nyata)', icon: Flame },
          { id: 'gas_code', label: 'Kod Google Apps Script', icon: Code2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
                isActive
                  ? 'bg-yellow-400 text-blue-950 font-black shadow-lg shadow-yellow-400/20'
                  : 'bg-white/5 text-slate-200 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className="w-4 h-4 bg-rose-500 text-white font-bold rounded-full text-[10px] flex items-center justify-center">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* ==================== MODULE 1: BERITA & PEKELILING ==================== */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-yellow-400" /> Terbit Berita / Pengumuman Baharu
            </h3>

            <form onSubmit={handleAddNewsSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Tajuk Berita</label>
                  <input
                    type="text"
                    required
                    value={newNews.title}
                    onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                    placeholder="Tajuk pengumuman rasmi..."
                    className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Kategori</label>
                  <select
                    value={newNews.category}
                    onChange={(e) => setNewNews({ ...newNews, category: e.target.value as any })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900 border border-white/20 text-white rounded-xl font-medium"
                  >
                    <option value="pengumuman">Pengumuman Rasmi</option>
                    <option value="aktiviti">Aktiviti Sekolah</option>
                    <option value="pekeliling">Pekeliling KPM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Ringkasan Berita</label>
                <input
                  type="text"
                  required
                  value={newNews.summary}
                  onChange={(e) => setNewNews({ ...newNews, summary: e.target.value })}
                  placeholder="Ringkasan pendek 1-2 ayat..."
                  className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Kandungan Penuh</label>
                <textarea
                  rows={3}
                  value={newNews.content}
                  onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                  placeholder="Perenggan kandungan berita..."
                  className="w-full text-xs p-3.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">URL Gambar atau Muat Naik</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newNews.imageUrl}
                      onChange={(e) => setNewNews({ ...newNews, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl font-mono"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressAndResizeImage(file, 640, 480, 0.75);
                            setNewNews({ ...newNews, imageUrl: compressed });
                          } catch {
                            const r = new FileReader();
                            r.onloadend = () => setNewNews({ ...newNews, imageUrl: r.result as string });
                            r.readAsDataURL(file);
                          }
                        }
                      }}
                      className="block w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-yellow-400 file:text-blue-950 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newNews.isPinned}
                      onChange={(e) => setNewNews({ ...newNews, isPinned: e.target.checked })}
                      className="rounded text-yellow-400 focus:ring-yellow-400 w-4 h-4"
                    />
                    <span>Sematkan ke Papan Utama (Pinned)</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-yellow-400 text-blue-950 font-black rounded-xl text-xs flex items-center gap-2 hover:bg-yellow-300 transition shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Terbit Berita</span>
              </button>
            </form>
          </div>

          {/* Current News Table */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-2">
              <h3 className="font-extrabold text-base text-white">Senarai Berita Terbit ({newsList.length})</h3>
              <button
                type="button"
                onClick={() => {
                  const restored = newsList.map((n) => ({
                    ...n,
                    imageUrl: OFFICIAL_NEWS_PHOTOS[n.id] || OFFICIAL_NEWS_PHOTOS[n.category] || OFFICIAL_NEWS_PHOTOS.default
                  }));
                  onSaveNews(restored);
                  showToast('Semua gambar berita berjaya dipulihkan kepada foto fotografi rasmi berkualiti tinggi!');
                }}
                className="px-3 py-1.5 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 border border-yellow-400/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Pulihkan Semua Foto Rasmi Berita</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/80 text-white font-bold border-b border-white/10">
                    <th className="p-3">Gambar</th>
                    <th className="p-3">Tajuk</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Tarikh</th>
                    <th className="p-3 text-center">Pinned</th>
                    <th className="p-3 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-200">
                  {newsList.map((n) => (
                    <tr key={n.id} className="hover:bg-white/5">
                      <td className="p-3">
                        <img
                          src={getSafeNewsImageUrl(n.imageUrl, n.category, n.id)}
                          alt=""
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = SECONDARY_FALLBACK_PHOTOS[n.category] || SECONDARY_FALLBACK_PHOTOS.default;
                          }}
                          className="w-10 h-10 object-cover rounded-lg border border-white/20"
                        />
                      </td>
                      <td className="p-3 font-bold text-white max-w-xs truncate">{n.title}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 font-bold rounded text-[10px] uppercase border border-yellow-400/30">
                          {n.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{n.date}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleTogglePinNews(n.id)}
                          className={`p-1.5 rounded-lg transition ${n.isPinned ? 'text-yellow-400 bg-yellow-400/20' : 'text-slate-400 hover:bg-white/10'}`}
                          title="Pin/Unpin Berita"
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="p-3 text-center flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingNews({ ...n })}
                          className="p-1.5 text-yellow-400 hover:bg-white/10 rounded-lg transition"
                          title="Sunting"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNews(n.id)}
                          className="p-1.5 text-rose-400 hover:bg-white/10 rounded-lg transition"
                          title="Padam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL: NEWS */}
      {editingNews && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-extrabold text-base text-yellow-400 flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Sunting Berita / Pengumuman
              </h4>
              <button onClick={() => setEditingNews(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateNewsSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-200 mb-1">Tajuk</label>
                <input
                  type="text"
                  required
                  value={editingNews.title}
                  onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">Kategori</label>
                  <select
                    value={editingNews.category}
                    onChange={(e) => setEditingNews({ ...editingNews, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-white/20 text-white rounded-xl"
                  >
                    <option value="pengumuman">Pengumuman Rasmi</option>
                    <option value="aktiviti">Aktiviti Sekolah</option>
                    <option value="pekeliling">Pekeliling KPM</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-200 mb-1">Penulis / Unit</label>
                  <input
                    type="text"
                    value={editingNews.author}
                    onChange={(e) => setEditingNews({ ...editingNews, author: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">Ringkasan Short Summary</label>
                <input
                  type="text"
                  required
                  value={editingNews.summary}
                  onChange={(e) => setEditingNews({ ...editingNews, summary: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">Kandungan Penuh</label>
                <textarea
                  rows={4}
                  value={editingNews.content}
                  onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">Tukar Gambar (Gambar / Foto Upload)</label>
                <div className="flex items-center gap-3">
                  <img
                    src={getSafeNewsImageUrl(editingNews.imageUrl, editingNews.category, editingNews.id)}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = SECONDARY_FALLBACK_PHOTOS[editingNews.category] || SECONDARY_FALLBACK_PHOTOS.default;
                    }}
                    className="w-12 h-12 rounded-xl object-cover border"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const compressed = await compressAndResizeImage(file, 640, 480, 0.75);
                          setEditingNews({ ...editingNews, imageUrl: compressed });
                        } catch {
                          const r = new FileReader();
                          r.onloadend = () => setEditingNews({ ...editingNews, imageUrl: r.result as string });
                          r.readAsDataURL(file);
                        }
                      }
                    }}
                    className="block w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-yellow-400 file:text-blue-950 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingNews(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-yellow-400 text-blue-950 font-black rounded-xl">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODULE 2: WARGA SEKOLAH ==================== */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-yellow-400" /> Tambah Rekod Guru / Staf Sokongan
            </h3>

            <form onSubmit={handleAddStaffSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Nama Penuh & Gelaran</label>
                  <input
                    type="text"
                    required
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    placeholder="Contoh: Cikgu Rosli bin Hassan"
                    className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Jawatan / Tugas</label>
                  <input
                    type="text"
                    required
                    value={newStaff.position}
                    onChange={(e) => setNewStaff({ ...newStaff, position: e.target.value })}
                    placeholder="Contoh: Guru Penolong Kanan HEM"
                    className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Kategori</label>
                  <select
                    value={newStaff.category}
                    onChange={(e) => setNewStaff((prev) => ({ ...prev, category: e.target.value as any }))}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900 border border-white/20 text-white rounded-xl font-medium"
                  >
                    <option value="pentadbir">Pentadbir Utama</option>
                    <option value="guru">Guru Pendidik</option>
                    <option value="staf">Staf Sokongan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Gred Jawatan</label>
                  <input
                    type="text"
                    value={newStaff.grade}
                    onChange={(e) => setNewStaff((prev) => ({ ...prev, grade: e.target.value }))}
                    placeholder="DG44 / N22"
                    className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">E-mel MOE DL (Pilihan)</label>
                  <input
                    type="text"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="nama@moe-dl.edu.my"
                    className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                  />
                </div>
              </div>

              {/* Photo Upload & Preview for New Staff */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/10 space-y-2">
                <label className="block text-xs font-bold text-yellow-300">
                  Foto Staf / Tenaga Pengajar
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-16 h-20 rounded-xl overflow-hidden border-2 border-yellow-400/60 flex-shrink-0 bg-slate-950 flex items-center justify-center shadow-md">
                    {newStaff.photoUrl ? (
                      <img
                        src={newStaff.photoUrl}
                        alt="Pratonton"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-1 text-[10px] text-slate-400 font-bold">
                        {newStaff.name ? (
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(newStaff.name)}&background=0284c7&color=fff`}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          'Tiada Foto'
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressStaffPhoto(file);
                              setNewStaff((prev) => ({ ...prev, photoUrl: compressed }));
                            } catch (err) {
                              console.warn('Ralat muat naik foto staf:', err);
                            }
                          }
                        }}
                        className="block w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-yellow-400 file:text-blue-950 cursor-pointer"
                      />
                      {newStaff.photoUrl && (
                        <button
                          type="button"
                          onClick={() => setNewStaff((prev) => ({ ...prev, photoUrl: '' }))}
                          className="px-2.5 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-lg text-xs font-bold whitespace-nowrap"
                        >
                          Padam Foto
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={newStaff.photoUrl && newStaff.photoUrl.startsWith('data:') ? '' : newStaff.photoUrl}
                      onChange={(e) => setNewStaff((prev) => ({ ...prev, photoUrl: e.target.value }))}
                      placeholder="Atau tampal URL Gambar (Contoh: https://...)"
                      className="w-full text-xs px-3 py-1.5 bg-white/5 border border-white/10 text-white rounded-lg placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-yellow-400 text-blue-950 font-black rounded-xl text-xs flex items-center gap-2 transition shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Rekod Warga</span>
              </button>
            </form>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-white/10 pb-2">Senarai Warga SKMP ({staffList.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/80 text-white font-bold border-b border-white/10">
                    <th className="p-3">Foto</th>
                    <th className="p-3">Nama</th>
                    <th className="p-3">Jawatan</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-200">
                  {sortStaffBySeniority(staffList, profile).map((s) => {
                    const photo = getStaffPhoto(s);
                    return (
                      <tr key={s.id} className="hover:bg-white/5">
                        <td className="p-3">
                          <div className="w-9 h-11 rounded-lg border border-white/20 overflow-hidden bg-slate-800 flex items-center justify-center">
                            {photo && photo.trim() !== '' ? (
                              <img
                                src={photo}
                                alt={s.name}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserCheck className="w-4 h-4 text-yellow-400 opacity-70" />
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-bold text-white">{s.name}</td>
                        <td className="p-3 text-slate-300">{s.position}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 font-bold rounded text-[10px] uppercase border border-yellow-400/30">
                            {s.category}
                          </span>
                        </td>
                        <td className="p-3 text-center flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingStaff({ ...s })}
                            className="p-1.5 text-yellow-400 hover:bg-white/10 rounded-lg transition"
                            title="Sunting"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(s.id)}
                            className="p-1.5 text-rose-400 hover:bg-white/10 rounded-lg transition"
                            title="Padam"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL: STAFF */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-xl w-full space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-extrabold text-base text-yellow-400 flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Sunting Maklumat Guru / Staf
              </h4>
              <button onClick={() => setEditingStaff(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStaffSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-200 mb-1">Nama Penuh</label>
                <input
                  type="text"
                  required
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">Jawatan</label>
                  <input
                    type="text"
                    required
                    value={editingStaff.position}
                    onChange={(e) => setEditingStaff({ ...editingStaff, position: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-200 mb-1">Kategori</label>
                  <select
                    value={editingStaff.category}
                    onChange={(e) => setEditingStaff({ ...editingStaff, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-white/20 text-white rounded-xl"
                  >
                    <option value="pentadbir">Pentadbir Utama</option>
                    <option value="guru">Guru Pendidik</option>
                    <option value="staf">Staf Sokongan</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">Gred</label>
                  <input
                    type="text"
                    value={editingStaff.grade}
                    onChange={(e) => setEditingStaff({ ...editingStaff, grade: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-200 mb-1">E-mel MOE DL</label>
                  <input
                    type="text"
                    value={editingStaff.email}
                    onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                  />
                </div>
              </div>

              {/* Photo Upload & Preview for Editing Staff */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-white/10 space-y-2">
                <label className="block font-bold text-yellow-300">
                  Kemaskini Foto Staf
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-16 h-20 rounded-xl overflow-hidden border-2 border-yellow-400/60 flex-shrink-0 bg-slate-900 flex items-center justify-center shadow-md">
                    {getStaffPhoto(editingStaff) && getStaffPhoto(editingStaff).trim() !== '' ? (
                      <img
                        src={getStaffPhoto(editingStaff)}
                        alt={editingStaff.name}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCheck className="w-7 h-7 text-yellow-400 opacity-70" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressStaffPhoto(file);
                              setEditingStaff((prev) => prev ? { ...prev, photoUrl: compressed } : null);
                            } catch (err) {
                              console.warn('Ralat muat naik foto staf:', err);
                            }
                          }
                        }}
                        className="block w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-yellow-400 file:text-blue-950 cursor-pointer"
                      />
                      {editingStaff.photoUrl && (
                        <button
                          type="button"
                          onClick={() => setEditingStaff((prev) => prev ? { ...prev, photoUrl: '' } : null)}
                          className="px-2.5 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-lg text-xs font-bold whitespace-nowrap"
                        >
                          Padam
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={editingStaff.photoUrl && editingStaff.photoUrl.startsWith('data:') ? '' : editingStaff.photoUrl}
                      onChange={(e) => setEditingStaff((prev) => prev ? { ...prev, photoUrl: e.target.value } : null)}
                      placeholder="Atau masukkan pautan URL Gambar (https://...)"
                      className="w-full text-xs px-3 py-1.5 bg-white/5 border border-white/10 text-white rounded-lg placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-yellow-400 text-blue-950 font-black rounded-xl">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODULE 3: TAKWIM & ACARA ==================== */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-yellow-400" /> Tambah Acara Takwim
            </h3>

            <form onSubmit={handleAddEventSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Tajuk Acara</label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Nama program..."
                    className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Tarikh Mula</label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900 border border-white/20 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Kategori</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as any })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900 border border-white/20 text-white rounded-xl"
                  >
                    <option value="peperiksaan">Peperiksaan / PBD</option>
                    <option value="cuti">Cuti Sekolah</option>
                    <option value="acara">Acara & Program</option>
                    <option value="pibg">Aktiviti PIBG</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-yellow-400 text-blue-950 font-black rounded-xl text-xs flex items-center gap-2 transition shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Takwim</span>
              </button>
            </form>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-white/10 pb-2">Takwim Terkini ({events.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/80 text-white font-bold border-b border-white/10">
                    <th className="p-3">Acara</th>
                    <th className="p-3">Tarikh</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-200">
                  {events.map((e) => (
                    <tr key={e.id} className="hover:bg-white/5">
                      <td className="p-3 font-bold text-white">{e.title}</td>
                      <td className="p-3 text-slate-300">{e.date}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 font-bold rounded text-[10px] uppercase border border-yellow-400/30">
                          {e.category}
                        </span>
                      </td>
                      <td className="p-3 text-center flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingEvent({ ...e })}
                          className="p-1.5 text-yellow-400 hover:bg-white/10 rounded-lg transition"
                          title="Sunting"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(e.id)}
                          className="p-1.5 text-rose-400 hover:bg-white/10 rounded-lg transition"
                          title="Padam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL: EVENT */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-extrabold text-base text-yellow-400 flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Sunting Acara Takwim
              </h4>
              <button onClick={() => setEditingEvent(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEventSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-200 mb-1">Tajuk Program / Acara</label>
                <input
                  type="text"
                  required
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">Tarikh</label>
                  <input
                    type="text"
                    required
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-200 mb-1">Kategori</label>
                  <select
                    value={editingEvent.category}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-white/20 text-white rounded-xl"
                  >
                    <option value="peperiksaan">Peperiksaan / PBD</option>
                    <option value="cuti">Cuti Sekolah</option>
                    <option value="acara">Acara & Program</option>
                    <option value="pibg">Aktiviti PIBG</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">Lokasi</label>
                <input
                  type="text"
                  value={editingEvent.location}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-yellow-400 text-blue-950 font-black rounded-xl">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODULE 4: PUSAT MUAT TURUN ==================== */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-yellow-400" /> Tambah Dokumen Muat Turun
            </h3>

            <form onSubmit={handleAddDocSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Tajuk Dokumen / Borang</label>
                  <input
                    type="text"
                    required
                    value={newDoc.title}
                    onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                    placeholder="Nama dokumen..."
                    className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Kategori</label>
                  <select
                    value={newDoc.category}
                    onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value as any })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900 border border-white/20 text-white rounded-xl"
                  >
                    <option value="borang">Borang Rasmi</option>
                    <option value="kebenaran">Surat Kebenaran</option>
                    <option value="takwim">Takwim & Jadual</option>
                    <option value="pekeliling">Pekeliling</option>
                    <option value="pibg">Dokumen PIBG</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Jenis Fail</label>
                  <select
                    value={newDoc.fileType}
                    onChange={(e) => setNewDoc({ ...newDoc, fileType: e.target.value as any })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900 border border-white/20 text-white rounded-xl"
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                    <option value="XLSX">XLSX</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Saiz Fail (contoh: 1.2 MB)</label>
                  <input
                    type="text"
                    value={newDoc.fileSize}
                    onChange={(e) => setNewDoc({ ...newDoc, fileSize: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-yellow-400 text-blue-950 font-black rounded-xl text-xs flex items-center gap-2 transition shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Dokumen</span>
              </button>
            </form>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-white/10 pb-2">Senarai Dokumen ({documents.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/80 text-white font-bold border-b border-white/10">
                    <th className="p-3">Tajuk Dokumen</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Format</th>
                    <th className="p-3 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-200">
                  {documents.map((d) => (
                    <tr key={d.id} className="hover:bg-white/5">
                      <td className="p-3 font-bold text-white">{d.title}</td>
                      <td className="p-3 text-slate-300">{d.category}</td>
                      <td className="p-3 font-mono text-yellow-300">{d.fileType} ({d.fileSize})</td>
                      <td className="p-3 text-center flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingDoc({ ...d })}
                          className="p-1.5 text-yellow-400 hover:bg-white/10 rounded-lg transition"
                          title="Sunting"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(d.id)}
                          className="p-1.5 text-rose-400 hover:bg-white/10 rounded-lg transition"
                          title="Padam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL: DOCUMENT */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-extrabold text-base text-yellow-400 flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Sunting Dokumen Muat Turun
              </h4>
              <button onClick={() => setEditingDoc(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDocSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-200 mb-1">Tajuk Dokumen</label>
                <input
                  type="text"
                  required
                  value={editingDoc.title}
                  onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">Kategori</label>
                  <select
                    value={editingDoc.category}
                    onChange={(e) => setEditingDoc({ ...editingDoc, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-white/20 text-white rounded-xl"
                  >
                    <option value="borang">Borang Rasmi</option>
                    <option value="kebenaran">Surat Kebenaran</option>
                    <option value="takwim">Takwim & Jadual</option>
                    <option value="pekeliling">Pekeliling</option>
                    <option value="pibg">Dokumen PIBG</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-200 mb-1">Format Fail</label>
                  <select
                    value={editingDoc.fileType}
                    onChange={(e) => setEditingDoc({ ...editingDoc, fileType: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-white/20 text-white rounded-xl"
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                    <option value="XLSX">XLSX</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-yellow-400 text-blue-950 font-black rounded-xl">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODULE 5: GALERI MEDIA ==================== */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-yellow-400" /> Tambah Foto / Video Galeri
            </h3>

            <form onSubmit={handleAddGallerySubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Tajuk Aktiviti Galeri</label>
                  <input
                    type="text"
                    required
                    value={newGallery.title}
                    onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                    placeholder="Kecemerlangan Sukan / Hari Kanak-kanak..."
                    className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Kategori</label>
                  <select
                    value={newGallery.category}
                    onChange={(e) => setNewGallery({ ...newGallery, category: e.target.value as any })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900 border border-white/20 text-white rounded-xl"
                  >
                    <option value="sukan">Sukan & Permainan</option>
                    <option value="akademik">Akademik</option>
                    <option value="kokurikulum">Kokurikulum</option>
                    <option value="majlis">Majlis Rasmi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Muat Naik Gambar / Foto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const compressed = await compressAndResizeImage(file, 800, 600, 0.75);
                        setNewGallery({ ...newGallery, url: compressed });
                      } catch {
                        const r = new FileReader();
                        r.onloadend = () => setNewGallery({ ...newGallery, url: r.result as string });
                        r.readAsDataURL(file);
                      }
                    }
                  }}
                  className="block w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-yellow-400 file:text-blue-950 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-yellow-400 text-blue-950 font-black rounded-xl text-xs flex items-center gap-2 transition shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Ke Galeri</span>
              </button>
            </form>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-white/10 pb-2">Senarai Foto Galeri ({gallery.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {gallery.map((g) => (
                <div key={g.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-2 space-y-2 relative group">
                  <img src={g.url} alt="" className="w-full h-28 object-cover rounded-xl" />
                  <p className="font-bold text-xs text-white truncate">{g.title}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-300">
                    <span className="uppercase font-bold text-yellow-300">{g.category}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingGallery({ ...g })}
                        className="p-1 bg-yellow-400 text-blue-950 rounded"
                        title="Edit"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteGallery(g.id)}
                        className="p-1 bg-rose-500 text-white rounded"
                        title="Padam"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL: GALLERY */}
      {editingGallery && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-md w-full space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-extrabold text-base text-yellow-400 flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Sunting Item Galeri
              </h4>
              <button onClick={() => setEditingGallery(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateGallerySubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-200 mb-1">Tajuk</label>
                <input
                  type="text"
                  required
                  value={editingGallery.title}
                  onChange={(e) => setEditingGallery({ ...editingGallery, title: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">Kategori</label>
                <select
                  value={editingGallery.category}
                  onChange={(e) => setEditingGallery({ ...editingGallery, category: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-950 border border-white/20 text-white rounded-xl"
                >
                  <option value="sukan">Sukan & Permainan</option>
                  <option value="akademik">Akademik</option>
                  <option value="kokurikulum">Kokurikulum</option>
                  <option value="majlis">Majlis Rasmi</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">Tukar Gambar (Foto Upload)</label>
                <div className="flex items-center gap-3">
                  <img src={editingGallery.url} alt="" className="w-12 h-12 rounded-xl object-cover border" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const r = new FileReader();
                        r.onloadend = () => setEditingGallery({ ...editingGallery, url: r.result as string });
                        r.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-xs text-slate-300 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-yellow-400 file:text-blue-950 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGallery(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-yellow-400 text-blue-950 font-black rounded-xl">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODULE 6: RUANG ANUGERAH ==================== */}
      {activeTab === 'awards' && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-yellow-400" /> Tambah Anugerah / Pencapaian
            </h3>

            <form onSubmit={handleAddAwardSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Nama Anugerah / Pertandingan</label>
                  <input
                    type="text"
                    required
                    value={newAward.title}
                    onChange={(e) => setNewAward({ ...newAward, title: e.target.value })}
                    placeholder="Pertandingan Inovasi / Sukan..."
                    className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Penerima / Murid / Guru</label>
                  <input
                    type="text"
                    required
                    value={newAward.recipient}
                    onChange={(e) => setNewAward({ ...newAward, recipient: e.target.value })}
                    placeholder="Nama penerima..."
                    className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Peringkat</label>
                  <select
                    value={newAward.category}
                    onChange={(e) => setNewAward({ ...newAward, category: e.target.value as any })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-900 border border-white/20 text-white rounded-xl"
                  >
                    <option value="daerah">Peringkat Daerah</option>
                    <option value="negeri">Peringkat Negeri</option>
                    <option value="kebangsaan">Peringkat Kebangsaan</option>
                    <option value="antarabangsa">Peringkat Antarabangsa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Pencapaian (Johan / Emas)</label>
                  <input
                    type="text"
                    value={newAward.achievement}
                    onChange={(e) => setNewAward({ ...newAward, achievement: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Tahun</label>
                  <input
                    type="text"
                    value={newAward.year}
                    onChange={(e) => setNewAward({ ...newAward, year: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-yellow-400 text-blue-950 font-black rounded-xl text-xs flex items-center gap-2 transition shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Anugerah</span>
              </button>
            </form>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-white/10 pb-2">Rekod Anugerah ({awards.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/80 text-white font-bold border-b border-white/10">
                    <th className="p-3">Anugerah</th>
                    <th className="p-3">Penerima</th>
                    <th className="p-3">Peringkat</th>
                    <th className="p-3">Pencapaian</th>
                    <th className="p-3 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-200">
                  {awards.map((a) => (
                    <tr key={a.id} className="hover:bg-white/5">
                      <td className="p-3 font-bold text-white">{a.title}</td>
                      <td className="p-3 text-slate-300">{a.recipient}</td>
                      <td className="p-3 font-semibold text-yellow-300 uppercase">{a.category}</td>
                      <td className="p-3 text-emerald-300 font-bold">{a.achievement}</td>
                      <td className="p-3 text-center flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingAward({ ...a })}
                          className="p-1.5 text-yellow-400 hover:bg-white/10 rounded-lg transition"
                          title="Sunting"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAward(a.id)}
                          className="p-1.5 text-rose-400 hover:bg-white/10 rounded-lg transition"
                          title="Padam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL: AWARD */}
      {editingAward && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-extrabold text-base text-yellow-400 flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Sunting Rekod Anugerah
              </h4>
              <button onClick={() => setEditingAward(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAwardSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-200 mb-1">Tajuk Anugerah</label>
                <input
                  type="text"
                  required
                  value={editingAward.title}
                  onChange={(e) => setEditingAward({ ...editingAward, title: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">Penerima</label>
                <input
                  type="text"
                  required
                  value={editingAward.recipient}
                  onChange={(e) => setEditingAward({ ...editingAward, recipient: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">Pencapaian</label>
                  <input
                    type="text"
                    value={editingAward.achievement}
                    onChange={(e) => setEditingAward({ ...editingAward, achievement: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-200 mb-1">Tahun</label>
                  <input
                    type="text"
                    value={editingAward.year}
                    onChange={(e) => setEditingAward({ ...editingAward, year: e.target.value })}
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAward(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-yellow-400 text-blue-950 font-black rounded-xl">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODULE 7: KOKURIKULUM & PIBG ==================== */}
      {activeTab === 'cocurriculum' && (
        <div className="space-y-6">
          {/* Section: CoCurriculum Units */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" /> Urus Unit Kokurikulum ({coCurriculumUnits.length})
            </h3>

            <form onSubmit={handleAddCoUnitSubmit} className="grid sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Nama Unit (Pengakap / Kelab Sains)..."
                value={newCoUnit.name}
                onChange={(e) => setNewCoUnit({ ...newCoUnit, name: e.target.value })}
                className="p-2.5 bg-white/5 border border-white/20 text-white rounded-xl text-xs"
              />
              <select
                value={newCoUnit.category}
                onChange={(e) => setNewCoUnit({ ...newCoUnit, category: e.target.value as any })}
                className="p-2.5 bg-slate-900 border border-white/20 text-white rounded-xl text-xs"
              >
                <option value="beruniform">Badan Beruniform</option>
                <option value="kelab">Kelab & Persatuan</option>
                <option value="sukan">Sukan & Permainan</option>
              </select>
              <button type="submit" className="px-4 py-2.5 bg-yellow-400 text-blue-950 font-black rounded-xl text-xs flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Tambah Unit
              </button>
            </form>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {coCurriculumUnits.map((unit) => (
                <div key={unit.id} className="p-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between text-xs hover:border-white/30 transition">
                  <div className="space-y-0.5 max-w-[70%]">
                    <h5 className="font-bold text-white truncate">{unit.name}</h5>
                    <p className="text-[10px] text-yellow-300 uppercase font-semibold">{unit.category}</p>
                    {unit.advisorTeacher && (
                      <p className="text-[10px] text-slate-300 truncate">Guru: {unit.advisorTeacher}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingCoUnit({ ...unit })}
                      className="p-1.5 text-yellow-400 hover:bg-white/10 rounded-lg transition"
                      title="Sunting Unit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCoUnit(unit.id)}
                      className="p-1.5 text-rose-400 hover:bg-white/10 rounded-lg transition"
                      title="Padam Unit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: PIBG Committee */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-yellow-400" /> Jawatankuasa PIBG SKMP ({pibgCommittee.length})
            </h3>

            <form onSubmit={handleAddPibgCommSubmit} className="grid sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Nama Penuh AJK..."
                value={newPibgComm.name}
                onChange={(e) => setNewPibgComm({ ...newPibgComm, name: e.target.value })}
                className="p-2.5 bg-white/5 border border-white/20 text-white rounded-xl text-xs"
              />
              <input
                type="text"
                required
                placeholder="Jawatan (NYP PIBG / AJK Ibu Bapa)..."
                value={newPibgComm.position}
                onChange={(e) => setNewPibgComm({ ...newPibgComm, position: e.target.value })}
                className="p-2.5 bg-white/5 border border-white/20 text-white rounded-xl text-xs"
              />
              <button type="submit" className="px-4 py-2.5 bg-yellow-400 text-blue-950 font-black rounded-xl text-xs flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Tambah AJK PIBG
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/80 text-white font-bold border-b border-white/10">
                    <th className="p-3">Nama</th>
                    <th className="p-3">Jawatan</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-slate-200">
                  {pibgCommittee.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5">
                      <td className="p-3 font-bold text-white">{c.name}</td>
                      <td className="p-3 text-slate-300">{c.position}</td>
                      <td className="p-3 font-semibold text-yellow-300 uppercase">{c.category}</td>
                      <td className="p-3 text-center flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingPibgComm({ ...c })}
                          className="p-1.5 text-yellow-400 hover:bg-white/10 rounded-lg transition"
                          title="Sunting AJK"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePibgComm(c.id)}
                          className="p-1.5 text-rose-400 hover:bg-white/10 rounded-lg transition"
                          title="Padam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL: CO-CURRICULUM UNIT */}
      {editingCoUnit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-extrabold text-base text-yellow-400 flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Sunting Unit Kokurikulum
              </h4>
              <button onClick={() => setEditingCoUnit(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCoUnitSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-200 mb-1">Nama Unit Kokurikulum</label>
                <input
                  type="text"
                  required
                  value={editingCoUnit.name}
                  onChange={(e) => setEditingCoUnit({ ...editingCoUnit, name: e.target.value })}
                  placeholder="Contoh: Pengakap Kanak-Kanak / Kelab Robotik..."
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">Kategori</label>
                  <select
                    value={editingCoUnit.category}
                    onChange={(e) => setEditingCoUnit({ ...editingCoUnit, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-white/20 text-white rounded-xl"
                  >
                    <option value="beruniform">Badan Beruniform</option>
                    <option value="kelab">Kelab & Persatuan</option>
                    <option value="sukan">Sukan & Permainan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-200 mb-1">Guru Penasihat</label>
                  <input
                    type="text"
                    value={editingCoUnit.advisorTeacher || ''}
                    onChange={(e) => setEditingCoUnit({ ...editingCoUnit, advisorTeacher: e.target.value })}
                    placeholder="Contoh: Cikgu Ahmad / Ustazah..."
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">Masa Perjumpaan / Latihan</label>
                <input
                  type="text"
                  value={editingCoUnit.meetingTime || ''}
                  onChange={(e) => setEditingCoUnit({ ...editingCoUnit, meetingTime: e.target.value })}
                  placeholder="Contoh: Rabu (2.00 petang - 4.00 petang)"
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">Penerangan / Matlamat Unit</label>
                <textarea
                  rows={2}
                  value={editingCoUnit.description || ''}
                  onChange={(e) => setEditingCoUnit({ ...editingCoUnit, description: e.target.value })}
                  placeholder="Aktiviti dan kemahiran yang dipelajari..."
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCoUnit(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-yellow-400 text-blue-950 font-black rounded-xl hover:bg-yellow-300 shadow">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL: PIBG COMMITTEE */}
      {editingPibgComm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-extrabold text-base text-yellow-400 flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Sunting Ahli Jawatankuasa PIBG
              </h4>
              <button onClick={() => setEditingPibgComm(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePibgCommSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-200 mb-1">Nama Penuh AJK</label>
                <input
                  type="text"
                  required
                  value={editingPibgComm.name}
                  onChange={(e) => setEditingPibgComm({ ...editingPibgComm, name: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">Jawatan</label>
                  <input
                    type="text"
                    required
                    value={editingPibgComm.position}
                    onChange={(e) => setEditingPibgComm({ ...editingPibgComm, position: e.target.value })}
                    placeholder="Contoh: Yang Dipertua (YDP) PIBG..."
                    className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-200 mb-1">Kategori</label>
                  <select
                    value={editingPibgComm.category}
                    onChange={(e) => setEditingPibgComm({ ...editingPibgComm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-950 border border-white/20 text-white rounded-xl"
                  >
                    <option value="ibu_bapa">Ibu Bapa / Komuniti</option>
                    <option value="guru">Guru / Staf Sekolah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">No. Telefon (Pilihan)</label>
                <input
                  type="text"
                  value={editingPibgComm.phone || ''}
                  onChange={(e) => setEditingPibgComm({ ...editingPibgComm, phone: e.target.value })}
                  placeholder="Contoh: 012-3456789"
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPibgComm(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-yellow-400 text-blue-950 font-black rounded-xl hover:bg-yellow-300 shadow">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODULE 8: PROFIL SEKOLAH ==================== */}
      {activeTab === 'profile' && (
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 shadow-lg space-y-6">
          <h3 className="font-extrabold text-lg text-white border-b border-white/10 pb-2 flex items-center gap-2">
            <Save className="w-5 h-5 text-yellow-400" /> Sunting Maklumat Rasmi & Profil Sekolah
          </h3>

          <form onSubmit={handleSaveProfileSubmit} className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-200 mb-1">Nama Sekolah</label>
                <input
                  type="text"
                  value={editProfileData.name}
                  onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">Kod Sekolah</label>
                <input
                  type="text"
                  value={editProfileData.code}
                  onChange={(e) => setEditProfileData({ ...editProfileData, code: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-200 mb-1">Nama Guru Besar</label>
                <input
                  type="text"
                  value={editProfileData.principalName}
                  onChange={(e) => setEditProfileData({ ...editProfileData, principalName: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">Jawatan / Gelaran Guru Besar</label>
                <input
                  type="text"
                  value={editProfileData.principalTitle}
                  onChange={(e) => setEditProfileData({ ...editProfileData, principalTitle: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">Perutusan / Kata-kata Alu-aluan Guru Besar (Laman Utama)</label>
              <textarea
                rows={3}
                value={editProfileData.principalSpeech || ''}
                onChange={(e) => setEditProfileData({ ...editProfileData, principalSpeech: e.target.value })}
                placeholder="Selamat datang ke laman web rasmi SK Merbau Pulas..."
                className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              />
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
              <label className="block font-bold text-yellow-300">Muat Naik / Kemaskini Gambar Rasmi Guru Besar</label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-20 rounded-xl overflow-hidden border border-yellow-400/50 flex-shrink-0 bg-slate-900 flex items-center justify-center">
                  {(editProfileData.principalPhotoUrl || profile.principalPhotoUrl) ? (
                    <img
                      src={editProfileData.principalPhotoUrl || profile.principalPhotoUrl}
                      alt="Guru Besar"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-slate-400 text-center p-1">
                      <UserCheck className="w-6 h-6 mb-1 text-yellow-400 opacity-70" />
                      <span className="text-[9px] leading-tight text-slate-400">Kosong</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressAndResizeImage(file, 360, 480, 0.72);
                            setEditProfileData((prev) => ({ ...prev, principalPhotoUrl: compressed }));
                          } catch (err) {
                            console.warn('Ralat muat naik foto Guru Besar:', err);
                          }
                        }
                      }}
                      className="block w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-yellow-400 file:text-blue-950 hover:file:bg-yellow-300 cursor-pointer"
                    />
                    {(editProfileData.principalPhotoUrl || profile.principalPhotoUrl) && (
                      <button
                        type="button"
                        onClick={() => setEditProfileData((prev) => ({ ...prev, principalPhotoUrl: '' }))}
                        className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold rounded-xl text-xs whitespace-nowrap transition border border-rose-500/30"
                      >
                        Padam Foto
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">Muat naik fail foto Guru Besar baharu atau biarkan kosong jika belum ada gambar.</p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-200 mb-1">No. Telefon</label>
                <input
                  type="text"
                  value={editProfileData.phone}
                  onChange={(e) => setEditProfileData({ ...editProfileData, phone: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">E-mel Rasmi</label>
                <input
                  type="email"
                  value={editProfileData.email}
                  onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })}
                  className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">Visi Sekolah</label>
              <textarea
                rows={2}
                value={editProfileData.vision}
                onChange={(e) => setEditProfileData({ ...editProfileData, vision: e.target.value })}
                className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">Misi Sekolah</label>
              <textarea
                rows={2}
                value={editProfileData.mission}
                onChange={(e) => setEditProfileData({ ...editProfileData, mission: e.target.value })}
                className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">Sejarah & Latar Belakang Sekolah</label>
              <textarea
                rows={4}
                value={editProfileData.history}
                onChange={(e) => setEditProfileData({ ...editProfileData, history: e.target.value })}
                className="w-full p-2.5 bg-white/5 border border-white/20 text-white rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-yellow-400 text-blue-950 font-black rounded-xl text-xs flex items-center gap-2 hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Profil</span>
            </button>
          </form>
        </div>
      )}

      {/* ==================== MODULE 9: PETI MASUK MAKLUM BALAS ==================== */}
      {activeTab === 'feedback' && (
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-lg space-y-4">
          <h3 className="font-extrabold text-base text-white border-b border-white/10 pb-2 flex items-center justify-between">
            <span>Peti Masuk Maklum Balas Pelawat ({feedbackList.length})</span>
          </h3>

          <div className="space-y-3">
            {feedbackList.map((fb) => (
              <div
                key={fb.id}
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  fb.status === 'baru' ? 'bg-yellow-500/10 border-yellow-400/50 text-white' : 'bg-white/5 border-white/10 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-sm">{fb.name} ({fb.email})</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-950 text-yellow-300 border border-white/20">
                    {fb.category}
                  </span>
                </div>
                <h5 className="font-bold text-yellow-300">{fb.subject}</h5>
                <p className="text-slate-200 bg-white/5 p-3 rounded-xl border border-white/10">{fb.message}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                  <span>Diterima: {fb.createdAt}</span>
                  <div className="flex items-center gap-2">
                    {fb.status === 'baru' && (
                      <button
                        onClick={() => handleMarkFeedbackRead(fb.id)}
                        className="px-3 py-1 bg-emerald-500 text-slate-950 font-black rounded-lg hover:bg-emerald-400 transition"
                      >
                        Tanda Dibaca
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteFeedback(fb.id)}
                      className="p-1.5 text-rose-400 hover:bg-white/10 rounded-lg"
                      title="Padam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== MODULE: HAL EHWAL MURID (HEM) ==================== */}
      {activeTab === 'hem' && (
        <AdminHemManager
          hemData={hemData || initialHemData}
          onSaveHemData={onSaveHemData || (() => {})}
          showToast={showToast}
        />
      )}

      {/* ==================== MODULE: DIGITAL SIGNAGE SMART TV ==================== */}
      {activeTab === 'signage' && (
        <AdminSignageManager
          profile={profile}
          slides={signageSlides}
          onSaveSlides={onSaveSignageSlides}
          config={signageConfig}
          onSaveConfig={onSaveSignageConfig}
          showToast={showToast}
        />
      )}

      {/* ==================== MODULE 10: GOOGLE APPS SCRIPT CODE ==================== */}
      {activeTab === 'gas_code' && (
        <GasScriptSection
          profile={profile}
          staffList={staffList}
          newsList={newsList}
          events={events}
          awards={awards}
          documents={documents}
          gallery={gallery}
        />
      )}

      {/* ==================== MODULE 11: GOOGLE FIREBASE CLOUD FIRESTORE ==================== */}
      {activeTab === 'firebase' && (
        <FirebaseManager
          showToast={showToast}
          allData={{
            profile,
            staffList,
            newsList,
            events,
            gallery,
            awards,
            documents,
            hemData,
            pibgActivities,
            pibgCommittee,
            cocurriculum: coCurriculumUnits,
            signageSlides,
            signageConfig
          }}
        />
      )}
    </div>
  );
};
