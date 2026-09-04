import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Lock } from 'lucide-react';
import {
  SchoolProfile,
  Staff,
  NewsItem,
  CalendarEvent,
  GalleryItem,
  AwardItem,
  DownloadDocument,
  SystemLink,
  FeedbackEntry,
  PibgActivity,
  PibgCommittee,
  CoCurriculumUnit,
  SearchResultItem,
  SignageSlide,
  SignageConfig,
  HemData,
  NavigationMenuItem,
  TeacherLinkItem,
  StudentRecord,
  StudentAbsenceRecord,
  SchoolHoliday
} from './types';
import {
  loadProfile,
  saveProfile,
  loadStaff,
  saveStaff,
  loadNews,
  saveNews,
  loadCalendarEvents,
  saveCalendarEvents,
  loadGallery,
  saveGallery,
  loadAwards,
  saveAwards,
  loadDocuments,
  saveDocuments,
  loadSystemLinks,
  loadTeacherLinks,
  saveTeacherLinks,
  loadFeedback,
  saveFeedback,
  loadPibgActivities,
  savePibgActivities,
  loadPibgCommittee,
  savePibgCommittee,
  loadCoCurriculum,
  saveCoCurriculum,
  loadSignageSlides,
  saveSignageSlides,
  loadSignageConfig,
  saveSignageConfig,
  loadHemData,
  saveHemData,
  loadNavigationMenu,
  saveNavigationMenu,
  getStudentsList,
  saveStudentsList,
  getAbsenceRecords,
  saveAbsenceRecords,
  loadSchoolHolidays,
  saveSchoolHolidays,
  resetAllToDefault
} from './utils/storage';
import {
  syncFeedbackToGoogleSheets,
  fetchSchoolDataFromGoogleSheets,
  parseSchoolDataFromSheets,
  syncBulkDataToGoogleSheets
} from './utils/googleSheetsSync';
import { isFirebaseEnabled } from './utils/firebaseSync';
import { pushToFirestore, setupFirestoreRealtimeSync } from './utils/firebaseRealtime';
import { broadcastLiveSignage, fetchLiveSignageFromServer } from './utils/liveSignageSync';
import { Header } from './components/Header';
import { Navbar, TabType } from './components/Navbar';
import { HeroSection } from './components/sections/HeroSection';
import { TeacherSection } from './components/sections/TeacherSection';
import { ProfileSection } from './components/sections/ProfileSection';
import { OrganizationSection } from './components/sections/OrganizationSection';
import { AcademicSection } from './components/sections/AcademicSection';
import { HemSection } from './components/sections/HemSection';
import { CokurriculumSection } from './components/sections/CokurriculumSection';
import { SignageSection } from './components/sections/SignageSection';
import { NewsSection } from './components/sections/NewsSection';
import { GallerySection } from './components/sections/GallerySection';
import { AwardsSection } from './components/sections/AwardsSection';
import { PortalDownloadSection } from './components/sections/PortalDownloadSection';
import { ContactSection } from './components/sections/ContactSection';
import { GasScriptSection } from './components/sections/GasScriptSection';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { SweetbotWidget } from './components/chat/SweetbotWidget';
import { StudentSearchPortalModal } from './components/sections/StudentSearchPortalModal';
import { TeacherRmtSubSection } from './components/sections/TeacherRmtSubSection';
import { IctBookingModal } from './components/sections/IctBookingModal';
import { Utensils, X as CloseIcon } from 'lucide-react';
import { Footer } from './components/Footer';
import TvApp from './TvApp';

export default function App() {
  // Check URL if TV Signage full screen mode is requested
  const [isTvMode, setIsTvMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const search = (window.location.search || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();
    const pathname = (window.location.pathname || '').toLowerCase();
    return (
      search.includes('view=tv') ||
      search.includes('tv=1') ||
      search.includes('tv=true') ||
      search.includes('signage=1') ||
      hash === '#tv' ||
      hash === '#/tv' ||
      hash.includes('view=tv') ||
      pathname.endsWith('/tv') ||
      pathname.endsWith('/tv.html')
    );
  });

  // Main Data States
  const [profile, setProfile] = useState<SchoolProfile>(loadProfile);
  const [staffList, setStaffList] = useState<Staff[]>(loadStaff);
  const [newsList, setNewsList] = useState<NewsItem[]>(loadNews);
  const [events, setEvents] = useState<CalendarEvent[]>(loadCalendarEvents);
  const [gallery, setGallery] = useState<GalleryItem[]>(loadGallery);
  const [awards, setAwards] = useState<AwardItem[]>(loadAwards);
  const [documents, setDocuments] = useState<DownloadDocument[]>(loadDocuments);
  const [systemLinks, setSystemLinks] = useState<SystemLink[]>(loadSystemLinks);
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>(loadFeedback);
  const [pibgActivities, setPibgActivities] = useState<PibgActivity[]>(loadPibgActivities);
  const [pibgCommittee, setPibgCommittee] = useState<PibgCommittee[]>(loadPibgCommittee);
  const [coCurriculumUnits, setCoCurriculumUnits] = useState<CoCurriculumUnit[]>(loadCoCurriculum);
  const [signageSlides, setSignageSlides] = useState<SignageSlide[]>(loadSignageSlides);
  const [signageConfig, setSignageConfig] = useState<SignageConfig>(loadSignageConfig);
  const [hemData, setHemData] = useState<HemData>(loadHemData);
  const [navigationMenu, setNavigationMenu] = useState<NavigationMenuItem[]>(loadNavigationMenu);
  const [teacherLinks, setTeacherLinks] = useState<TeacherLinkItem[]>(loadTeacherLinks);
  const [studentsList, setStudentsList] = useState<StudentRecord[]>(getStudentsList);
  const [absenceRecords, setAbsenceRecords] = useState<StudentAbsenceRecord[]>(getAbsenceRecords);
  const [schoolHolidays, setSchoolHolidays] = useState<SchoolHoliday[]>(loadSchoolHolidays);

  // UI States (with automatic deep link parsing for shared WhatsApp forms and tabs)
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window === 'undefined') return 'utama';
    const search = (window.location.search || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();
    if (
      search.includes('tab=hem') ||
      search.includes('subtab=kehadiran') ||
      search.includes('view=borang') ||
      search.includes('form=kehadiran') ||
      search.includes('borang=kehadiran') ||
      hash.includes('borang') ||
      hash.includes('kehadiran') ||
      hash === '#hem'
    ) {
      return 'hem';
    }
    if (search.includes('tab=profil') || hash === '#profil') return 'profil';
    if (search.includes('tab=akademik') || hash === '#akademik') return 'akademik';
    if (search.includes('tab=kokurikulum') || hash === '#kokurikulum') return 'kokurikulum';
    if (search.includes('tab=berita') || hash === '#berita') return 'berita';
    if (search.includes('tab=hubungi') || hash === '#hubungi') return 'hubungi';
    return 'utama';
  });

  const [hemSubTab, setHemSubTab] = useState<'semua' | 'kehadiran' | 'disiplin' | 'kebajikan' | '3k'>(() => {
    if (typeof window === 'undefined') return 'semua';
    const search = (window.location.search || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();
    if (
      search.includes('subtab=kehadiran') ||
      search.includes('view=borang') ||
      search.includes('form=kehadiran') ||
      search.includes('borang=kehadiran') ||
      hash.includes('borang') ||
      hash.includes('kehadiran')
    ) {
      return 'kehadiran';
    }
    return 'semua';
  });

  const [kurikulumSubTab, setKurikulumSubTab] = useState<'utama' | 'ict'>(() => {
    if (typeof window === 'undefined') return 'utama';
    const search = (window.location.search || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();
    if (
      search.includes('subtab=ict') ||
      search.includes('tab=ict') ||
      search.includes('view=ict') ||
      search.includes('tempahan=ict') ||
      search.includes('kewangan') ||
      search.includes('delima') ||
      hash === '#ict' ||
      hash.includes('ict') ||
      hash.includes('kewangan') ||
      hash.includes('delima')
    ) {
      return 'ict';
    }
    return 'utama';
  });

  const [ictSubTab, setIctSubTab] = useState<'jadual' | 'delima' | 'kewangan'>(() => {
    if (typeof window === 'undefined') return 'jadual';
    const search = (window.location.search || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();
    if (search.includes('kewangan') || hash.includes('kewangan') || search.includes('cashflow')) {
      return 'kewangan';
    }
    if (search.includes('delima') || hash.includes('delima')) {
      return 'delima';
    }
    return 'jadual';
  });

  // Listen to popstate and hashchange to allow seamless switching
  useEffect(() => {
    const handleUrlChange = () => {
      const search = (window.location.search || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      const pathname = (window.location.pathname || '').toLowerCase();
      const tvActive = (
        search.includes('view=tv') ||
        search.includes('tv=1') ||
        search.includes('tv=true') ||
        search.includes('signage=1') ||
        hash === '#tv' ||
        hash === '#/tv' ||
        hash.includes('view=tv') ||
        pathname.endsWith('/tv') ||
        pathname.endsWith('/tv.html')
      );
      setIsTvMode(tvActive);

      // Deep link tab change
      if (
        search.includes('subtab=kehadiran') ||
        search.includes('view=borang') ||
        search.includes('form=kehadiran') ||
        search.includes('borang=kehadiran') ||
        hash.includes('borang') ||
        hash.includes('kehadiran')
      ) {
        setActiveTab('hem');
        setHemSubTab('kehadiran');
      } else if (search.includes('tab=hem') || hash === '#hem') {
        setActiveTab('hem');
      } else if (
        search.includes('subtab=ict') ||
        search.includes('tab=ict') ||
        search.includes('view=ict') ||
        search.includes('tempahan=ict') ||
        search.includes('kewangan') ||
        search.includes('delima') ||
        hash === '#ict' ||
        hash.includes('ict') ||
        hash.includes('kewangan') ||
        hash.includes('delima')
      ) {
        setActiveTab('akademik');
        setKurikulumSubTab('ict');
        if (search.includes('kewangan') || hash.includes('kewangan') || search.includes('cashflow')) {
          setIctSubTab('kewangan');
        } else if (search.includes('delima') || hash.includes('delima')) {
          setIctSubTab('delima');
        } else {
          setIctSubTab('jadual');
        }
      } else if (search.includes('tab=akademik') || search.includes('tab=kurikulum') || hash === '#kurikulum') {
        setActiveTab('akademik');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'guru' | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedNewsReader, setSelectedNewsReader] = useState<NewsItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGlobalStudentPortalOpen, setIsGlobalStudentPortalOpen] = useState(false);
  const [isGlobalRmtPortalOpen, setIsGlobalRmtPortalOpen] = useState(false);
  const [isGlobalIctModalOpen, setIsGlobalIctModalOpen] = useState(false);

  // Ref to prevent overlapping in-flight fetch requests
  const isSyncingRef = useRef(false);

  // Auto-sync data dari Google Sheets Web App secara pantas & responsif
  const refreshFromGoogleSheets = async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    try {
      const raw = await fetchSchoolDataFromGoogleSheets();
      if (raw) {
        const parsed = parseSchoolDataFromSheets(raw);
        if (parsed.events && parsed.events.length > 0) {
          setEvents(parsed.events);
          saveCalendarEvents(parsed.events);
        }
        if (parsed.staffList && parsed.staffList.length > 0) {
          setStaffList(parsed.staffList);
          saveStaff(parsed.staffList);
        }
        if (parsed.newsList && parsed.newsList.length > 0) {
          setNewsList(parsed.newsList);
          saveNews(parsed.newsList);
        }
        if (parsed.signageSlides && parsed.signageSlides.length > 0) {
          setSignageSlides(parsed.signageSlides);
          saveSignageSlides(parsed.signageSlides);
        }
        if (parsed.signageConfig && Object.keys(parsed.signageConfig).length > 0) {
          setSignageConfig(prev => {
            const updated = { ...prev, ...parsed.signageConfig };
            saveSignageConfig(updated);
            return updated;
          });
        }
        if (parsed.teacherLinks && parsed.teacherLinks.length > 0) {
          setTeacherLinks(parsed.teacherLinks);
          saveTeacherLinks(parsed.teacherLinks);
        }
        if (parsed.profileUpdates) {
          setProfile(prev => {
            const updated = { ...prev, ...parsed.profileUpdates };
            if (!parsed.profileUpdates?.principalPhotoUrl && prev.principalPhotoUrl) {
              updated.principalPhotoUrl = prev.principalPhotoUrl;
            }
            saveProfile(updated);
            return updated;
          });
        }
      }
    } catch (err) {
      console.warn('Gagal memuat turun data langsung Google Sheets:', err);
    } finally {
      isSyncingRef.current = false;
    }
  };

  useEffect(() => {
    // 1. Muat turun serta-merta semasa aplikasi mula dibuka
    refreshFromGoogleSheets();

    // 2. Semak data baru secara pantas (setiap 4 saat)
    const interval = setInterval(refreshFromGoogleSheets, 4000);

    // 3. Langganan Firestore Masa Nyata (Real-time Live Sync across devices)
    const unsubFirestore = setupFirestoreRealtimeSync({
      onProfileChange: (p) => {
        setProfile(p);
        saveProfile(p);
      },
      onStaffChange: (s) => {
        setStaffList(s);
        saveStaff(s);
      },
      onNewsChange: (n) => {
        setNewsList(n);
        saveNews(n);
      },
      onEventsChange: (e) => {
        setEvents(e);
        saveCalendarEvents(e);
      },
      onHemDataChange: (h) => {
        setHemData(h);
        saveHemData(h);
      },
      onCoCurriculumChange: (c) => {
        setCoCurriculumUnits(c);
        saveCoCurriculum(c);
      },
      onPibgCommitteeChange: (comm) => {
        setPibgCommittee(comm);
        savePibgCommittee(comm);
      },
      onPibgActivitiesChange: (act) => {
        setPibgActivities(act);
        savePibgActivities(act);
      },
      onSignageSlidesChange: (slides) => {
        setSignageSlides(slides);
        saveSignageSlides(slides);
      },
      onSignageConfigChange: (cfg) => {
        setSignageConfig(cfg);
        saveSignageConfig(cfg);
      },
      onNavigationMenuChange: (menu) => {
        setNavigationMenu(menu);
        saveNavigationMenu(menu);
      },
      onTeacherLinksChange: (links) => {
        if (Array.isArray(links) && links.length > 0) {
          setTeacherLinks(links);
          saveTeacherLinks(links);
        }
      },
      onAbsenceRecordsChange: (records) => {
        if (Array.isArray(records)) {
          setAbsenceRecords(records);
          saveAbsenceRecords(records);
        }
      }
    });

    // 4. Semak data serta-merta apabila pengguna membuka tab, fokus pelayar, atau peranti kembali aktif
    const handleImmediateSync = () => {
      refreshFromGoogleSheets();
    };

    // 5. Penyelarasan antara tab/tetingkap secara 0ms (segera)
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'skmp_staff_v1') setStaffList(loadStaff());
      if (e.key === 'skmp_profile_v1') setProfile(loadProfile());
      if (e.key === 'skmp_news_v1') setNewsList(loadNews());
      if (e.key === 'skmp_events_v1') setEvents(loadCalendarEvents());
      if (e.key === 'skmp_gallery_v1') setGallery(loadGallery());
      if (e.key === 'skmp_awards_v1') setAwards(loadAwards());
      if (e.key === 'skmp_signage_slides_v1') setSignageSlides(loadSignageSlides());
      if (e.key === 'skmp_signage_config_v1') setSignageConfig(loadSignageConfig());
      if (e.key === 'skmp_hem_v1') setHemData(loadHemData());
      if (e.key === 'skmp_nav_menu_v1') setNavigationMenu(loadNavigationMenu());
      if (e.key === 'skmp_teacher_links_v1') setTeacherLinks(loadTeacherLinks());
      if (e.key === 'skmp_absence_records_v1') setAbsenceRecords(getAbsenceRecords());
      if (e.key === 'skmp_students_list_v1') setStudentsList(getStudentsList());
    };

    const handleTeacherLinksUpdated = (e: Event) => {
      const customEvt = e as CustomEvent<{ links: TeacherLinkItem[] }>;
      if (customEvt.detail?.links) {
        setTeacherLinks(customEvt.detail.links);
      } else {
        setTeacherLinks(loadTeacherLinks());
      }
    };

    const handleCustomTabSwitch = (e: Event) => {
      const customEvt = e as CustomEvent<{ tab: TabType; subTab?: any }>;
      if (customEvt.detail?.tab) {
        setActiveTab(customEvt.detail.tab);
        if (customEvt.detail.tab === 'hem' && customEvt.detail.subTab) {
          setHemSubTab(customEvt.detail.subTab);
        }
      }
    };

    window.addEventListener('visibilitychange', handleImmediateSync);
    window.addEventListener('focus', handleImmediateSync);
    window.addEventListener('online', handleImmediateSync);
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('skmp_teacher_links_updated', handleTeacherLinksUpdated);
    window.addEventListener('skmp_switch_tab', handleCustomTabSwitch);

    return () => {
      clearInterval(interval);
      unsubFirestore();
      window.removeEventListener('visibilitychange', handleImmediateSync);
      window.removeEventListener('focus', handleImmediateSync);
      window.removeEventListener('online', handleImmediateSync);
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('skmp_teacher_links_updated', handleTeacherLinksUpdated);
      window.removeEventListener('skmp_switch_tab', handleCustomTabSwitch);
    };
  }, []);

  // Helper untuk tolak data ke Google Sheets & Google Firebase secara automatik apabila Admin mengemas kini
  const autoPushToCloud = (partialUpdate: {
    profile?: SchoolProfile;
    staffList?: Staff[];
    newsList?: NewsItem[];
    events?: CalendarEvent[];
    gallery?: GalleryItem[];
    awards?: AwardItem[];
    documents?: DownloadDocument[];
    signageSlides?: SignageSlide[];
    signageConfig?: SignageConfig;
    hemData?: HemData;
    teacherLinks?: TeacherLinkItem[];
    absenceRecords?: StudentAbsenceRecord[];
    schoolHolidays?: SchoolHoliday[];
  }) => {
    // 1. Push to Google Sheets
    syncBulkDataToGoogleSheets({
      profile: partialUpdate.profile || profile,
      staffList: partialUpdate.staffList || staffList,
      newsList: partialUpdate.newsList || newsList,
      events: partialUpdate.events || events,
      gallery: partialUpdate.gallery || gallery,
      awards: partialUpdate.awards || awards,
      documents: partialUpdate.documents || documents,
      signageSlides: partialUpdate.signageSlides || signageSlides,
      signageConfig: partialUpdate.signageConfig || signageConfig,
      teacherLinks: partialUpdate.teacherLinks || teacherLinks
    }).catch(err => console.warn('Auto cloud sync sheets failed:', err));

    // 2. Push to Google Firebase Firestore
    if (partialUpdate.profile) pushToFirestore('school_data', 'profile', partialUpdate.profile);
    if (partialUpdate.staffList) pushToFirestore('school_data', 'staff', { items: partialUpdate.staffList });
    if (partialUpdate.newsList) pushToFirestore('school_data', 'news', { items: partialUpdate.newsList });
    if (partialUpdate.events) pushToFirestore('school_data', 'events', { items: partialUpdate.events });
    if (partialUpdate.hemData) pushToFirestore('school_data', 'hem', partialUpdate.hemData);
    if (partialUpdate.teacherLinks) pushToFirestore('school_data', 'teacher_links', { items: partialUpdate.teacherLinks });
    if (partialUpdate.absenceRecords) pushToFirestore('school_data', 'attendance_absence', { records: partialUpdate.absenceRecords });
    if (partialUpdate.schoolHolidays) pushToFirestore('school_data', 'school_holidays', { items: partialUpdate.schoolHolidays });
    if (partialUpdate.signageSlides || partialUpdate.signageConfig) {
      pushToFirestore('school_data', 'signage', {
        slides: partialUpdate.signageSlides || signageSlides,
        config: partialUpdate.signageConfig || signageConfig
      });
    }
  };

  // Persist Updates Handlers - Disegerakkan terus ke Google Sheets secara real-time
  const handleUpdateProfile = (p: SchoolProfile) => {
    setProfile(p);
    saveProfile(p);
    autoPushToCloud({ profile: p });
  };

  const handleUpdateStaff = (s: Staff[]) => {
    setStaffList(s);
    saveStaff(s);
    autoPushToCloud({ staffList: s });
  };

  const handleUpdateNews = (n: NewsItem[]) => {
    setNewsList(n);
    saveNews(n);
    autoPushToCloud({ newsList: n });
  };

  const handleUpdateEvents = (e: CalendarEvent[]) => {
    setEvents(e);
    saveCalendarEvents(e);
    autoPushToCloud({ events: e });
  };

  const handleUpdateGallery = (g: GalleryItem[]) => {
    setGallery(g);
    saveGallery(g);
    autoPushToCloud({ gallery: g });
  };

  const handleUpdateAwards = (a: AwardItem[]) => {
    setAwards(a);
    saveAwards(a);
    autoPushToCloud({ awards: a });
  };

  const handleUpdateDocuments = (d: DownloadDocument[]) => {
    setDocuments(d);
    saveDocuments(d);
    autoPushToCloud({ documents: d });
  };

  const handleUpdateFeedback = (f: FeedbackEntry[]) => {
    setFeedbackList(f);
    saveFeedback(f);
  };

  const handleUpdatePibgActivities = (act: PibgActivity[]) => {
    setPibgActivities(act);
    savePibgActivities(act);
    if (isFirebaseEnabled()) {
      pushToFirestore('school_data', 'pibg', { activities: act, committee: pibgCommittee });
    }
  };

  const handleUpdatePibgCommittee = (comm: PibgCommittee[]) => {
    setPibgCommittee(comm);
    savePibgCommittee(comm);
    if (isFirebaseEnabled()) {
      pushToFirestore('school_data', 'pibg', { activities: pibgActivities, committee: comm });
    }
  };

  const handleUpdateCoCurriculum = (units: CoCurriculumUnit[]) => {
    setCoCurriculumUnits(units);
    saveCoCurriculum(units);
    if (isFirebaseEnabled()) {
      pushToFirestore('school_data', 'cocurriculum', { items: units });
    }
  };

  const handleUpdateSignageSlides = (slides: SignageSlide[]) => {
    setSignageSlides(slides);
    saveSignageSlides(slides);
    autoPushToCloud({ signageSlides: slides });
    broadcastLiveSignage(slides, signageConfig);
  };

  const handleUpdateSignageConfig = (cfg: SignageConfig) => {
    setSignageConfig(cfg);
    saveSignageConfig(cfg);
    autoPushToCloud({ signageConfig: cfg });
    broadcastLiveSignage(signageSlides, cfg);
  };

  const handleUpdateHemData = (data: HemData) => {
    setHemData(data);
    saveHemData(data);
    autoPushToCloud({ hemData: data });
  };

  const handleUpdateNavigationMenu = (menu: NavigationMenuItem[]) => {
    setNavigationMenu(menu);
    saveNavigationMenu(menu);
    if (isFirebaseEnabled()) {
      pushToFirestore('school_data', 'navigation_menu', { items: menu });
    }
  };

  const handleUpdateTeacherLinks = (links: TeacherLinkItem[]) => {
    setTeacherLinks(links);
    saveTeacherLinks(links);
    autoPushToCloud({ teacherLinks: links });
  };

  const handleAddFeedback = (data: Omit<FeedbackEntry, 'id' | 'createdAt' | 'status'>) => {
    const entry: FeedbackEntry = {
      ...data,
      id: 'fb-' + Date.now(),
      createdAt: new Date().toLocaleString('ms-MY', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'baru'
    };
    handleUpdateFeedback([entry, ...feedbackList]);
    syncFeedbackToGoogleSheets(entry);
  };

  const handleAddAbsenceRecord = (
    newRecord: Omit<StudentAbsenceRecord, 'id' | 'refNo' | 'createdAt'>
  ): StudentAbsenceRecord => {
    const id = `abs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const refNo = `KHD-${yyyymmdd}-${randNum}`;

    const completeRecord: StudentAbsenceRecord = {
      ...newRecord,
      id,
      refNo,
      createdAt: new Date().toISOString()
    };

    const updated = [completeRecord, ...absenceRecords];
    setAbsenceRecords(updated);
    saveAbsenceRecords(updated);
    autoPushToCloud({ absenceRecords: updated });
    return completeRecord;
  };

  const handleUpdateAbsenceRecord = (updatedRecord: StudentAbsenceRecord) => {
    const updated = absenceRecords.map((r) => (r.id === updatedRecord.id ? updatedRecord : r));
    setAbsenceRecords(updated);
    saveAbsenceRecords(updated);
    autoPushToCloud({ absenceRecords: updated });
  };

  const handleDeleteAbsenceRecord = (id: string) => {
    const updated = absenceRecords.filter((r) => r.id !== id);
    setAbsenceRecords(updated);
    saveAbsenceRecords(updated);
    autoPushToCloud({ absenceRecords: updated });
  };

  const handleSaveSchoolHolidays = (holidays: SchoolHoliday[]) => {
    setSchoolHolidays(holidays);
    saveSchoolHolidays(holidays);
    autoPushToCloud({ schoolHolidays: holidays });
  };

  const handleResetAllData = () => {
    resetAllToDefault();
    setProfile(loadProfile());
    setStaffList(loadStaff());
    setNewsList(loadNews());
    setEvents(loadCalendarEvents());
    setGallery(loadGallery());
    setAwards(loadAwards());
    setDocuments(loadDocuments());
    setFeedbackList(loadFeedback());
    setPibgActivities(loadPibgActivities());
    setPibgCommittee(loadPibgCommittee());
    setCoCurriculumUnits(loadCoCurriculum());
    setSignageSlides(loadSignageSlides());
    setSignageConfig(loadSignageConfig());
    setHemData(loadHemData());
    setNavigationMenu(loadNavigationMenu());
    setTeacherLinks(loadTeacherLinks());
    setSchoolHolidays(loadSchoolHolidays());
  };

  // Global Search Autocomplete Builder
  const searchResults = useMemo<SearchResultItem[]>(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: SearchResultItem[] = [];

    // Search News
    newsList.forEach((n) => {
      if (n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q)) {
        results.push({
          type: 'berita',
          title: n.title,
          subtitle: `Berita (${n.date})`,
          linkTab: 'berita',
          id: n.id
        });
      }
    });

    // Search Staff
    staffList.forEach((s) => {
      if (s.name.toLowerCase().includes(q) || s.position.toLowerCase().includes(q)) {
        results.push({
          type: 'staf',
          title: s.name,
          subtitle: `${s.position} (${s.grade})`,
          linkTab: 'profil',
          id: s.id
        });
      }
    });

    // Search Gallery Media
    gallery.forEach((g) => {
      if (g.title.toLowerCase().includes(q) || (g.description && g.description.toLowerCase().includes(q))) {
        results.push({
          type: 'galeri',
          title: g.title,
          subtitle: `Galeri (${g.category})`,
          linkTab: 'berita',
          id: g.id
        });
      }
    });

    // Search Documents
    documents.forEach((d) => {
      if (d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)) {
        results.push({
          type: 'dokumen',
          title: d.title,
          subtitle: `Dokumen (${d.fileType})`,
          linkTab: 'portal',
          id: d.id
        });
      }
    });

    // Search Calendar
    events.forEach((e) => {
      if (e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)) {
        results.push({
          type: 'acara',
          title: e.title,
          subtitle: `Takwim (${e.date})`,
          linkTab: 'akademik',
          id: e.id
        });
      }
    });

    // Search HEM
    const hemKeywords = [
      { key: 'murid', title: 'Portal Pangkalan Data Murid APDM', sub: 'Carian 375 orang murid SKMP & Maklumat Lengkap' },
      { key: 'carian', title: 'Portal Senarai & Carian Murid', sub: 'Carian mengikut nama, kelas, no. KP & penjaga' },
      { key: 'hem', title: 'Hal Ehwal Murid (HEM)', sub: 'Pengurusan Disiplin, Kebajikan & 3K' },
      { key: 'disiplin', title: 'Disiplin & Peraturan Sekolah', sub: 'Kod Tatatertib & Etika Murid' },
      { key: 'kaunseling', title: 'Unit Bimbingan & Kaunseling (UBK)', sub: 'Program Guru Penyayang & Minda Sihat' },
      { key: 'ssdm', title: 'Sistem Sahsiah Diri Murid (SSDM)', sub: 'Rekod Amalan Baik & Intervensi' },
      { key: 'spbt', title: 'Skim Pinjaman Buku Teks (SPBT)', sub: 'Pengagihan & Bilik BOSS' },
      { key: 'rmt', title: 'Portal RMT & Program Susu Sekolah (89 Murid)', sub: 'Penerima RMT, Buku Rekod Makan & Jadual Menu Nutrisi' },
      { key: 'susu', title: 'Program Susu Sekolah (PSS) & RMT', sub: 'Jadual Agihan Susu UHT & Kelayakan 89 Murid' },
      { key: 'bap', title: 'Bantuan Awal Persekolahan (BAP)', sub: 'Bantuan Tunai RM150 & KWAPM' },
      { key: 'keselamatan', title: 'Keselamatan Murid & 3K', sub: 'Kawalan Pagar, Pelawat & Latihan Kebakaran' },
      { key: 'kesihatan', title: 'Kesihatan Murid & Rawatan Gigi', sub: 'Klinik Bergerak KKM & Imunisasi' },
      { key: 'kebersihan', title: 'Kebersihan Kelas & 3K', sub: 'Pertandingan Kelas Terbersih & 3R' }
    ];
    hemKeywords.forEach((h, idx) => {
      if (h.key.includes(q) || h.title.toLowerCase().includes(q) || h.sub.toLowerCase().includes(q)) {
        let destinationTab: any = 'hem';
        if (h.key === 'murid' || h.key === 'carian') destinationTab = 'carian_murid';
        if (h.key === 'rmt' || h.key === 'susu') destinationTab = 'portal_rmt';
        results.push({
          type: 'pengumuman',
          title: h.title,
          subtitle: h.sub,
          linkTab: destinationTab,
          id: `hem-${idx}`
        });
      }
    });

    // Search Students Database directly
    studentsList.forEach((st) => {
      if (st.name.toLowerCase().includes(q) || st.icNumber.includes(q) || st.className.toLowerCase().includes(q)) {
        results.push({
          type: 'pengumuman',
          title: st.name,
          subtitle: `Murid ${st.className} • No. KP: ${st.icNumber}`,
          linkTab: 'carian_murid' as any,
          id: st.id
        });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, newsList, staffList, documents, events, studentsList]);

  const handleSelectSearchResult = (item: SearchResultItem) => {
    if (item.linkTab === ('carian_murid' as any)) {
      setIsGlobalStudentPortalOpen(true);
      return;
    }
    if (item.linkTab === ('portal_rmt' as any)) {
      setActiveTab('guru');
      return;
    }
    setActiveTab(item.linkTab as TabType);
    if (item.type === 'berita') {
      const newsItem = newsList.find((n) => n.id === item.id);
      if (newsItem) setSelectedNewsReader(newsItem);
    }
  };

  const unreadFeedbackCount = useMemo(() => {
    return feedbackList.filter((f) => f.status === 'baru').length;
  }, [feedbackList]);

  // Jika mod TV Signage diaktifkan melalui URL (?view=tv atau #tv), paparkan terus aplikasi khas Smart TV
  if (isTvMode) {
    return <TvApp />;
  }

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col font-sans antialiased selection:bg-yellow-400 selection:text-blue-950"
      style={{
        background: 'radial-gradient(circle at 0% 0%, #1e3a8a 0%, #1e293b 50%, #0f172a 100%)'
      }}
    >
      {/* Top Header & Tab Navigation Bar (Natural Scroll Flow) */}
      <div className="w-full relative shadow-2xl backdrop-blur-xl bg-slate-950/90 border-b border-white/10">
        <Header
          profile={profile}
          isAdmin={isAdmin}
          userRole={userRole}
          onOpenLogin={() => setLoginModalOpen(true)}
          onLogout={() => {
            setIsAdmin(false);
            setUserRole(null);
            if (activeTab === 'admin_cms' || activeTab === 'guru') {
              setActiveTab('utama');
            }
          }}
          searchResults={searchResults}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          onSelectSearchResult={handleSelectSearchResult}
          onOpenAdminDashboard={() => setActiveTab('admin_cms')}
          onOpenTeacherPortal={() => setActiveTab('guru')}
          onOpenStudentPortal={() => setIsGlobalStudentPortalOpen(true)}
          isMobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        />

        {/* Navbar Menu */}
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isAdmin={isAdmin}
          isTeacher={userRole === 'guru'}
          userRole={userRole}
          unreadFeedbackCount={unreadFeedbackCount}
          navigationMenu={navigationMenu}
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Container View Switcher */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
        {activeTab === 'utama' && (
          <HeroSection
            profile={profile}
            latestNews={newsList}
            upcomingEvents={events}
            staffList={staffList}
            studentsList={studentsList}
            onNavigate={setActiveTab}
            onSelectNews={(news) => {
              setSelectedNewsReader(news);
              setActiveTab('berita');
            }}
          />
        )}

        {activeTab === 'guru' && (
          <TeacherSection
            profile={profile}
            staffList={staffList}
            teacherLinks={teacherLinks}
            onSaveTeacherLinks={handleUpdateTeacherLinks}
            isAdmin={isAdmin}
            isTeacher={userRole === 'guru'}
            userRole={userRole}
            onOpenLogin={() => setLoginModalOpen(true)}
            onNavigate={setActiveTab}
            onOpenStudentPortal={() => setIsGlobalStudentPortalOpen(true)}
            students={studentsList}
            absenceRecords={absenceRecords}
            onAddAbsenceRecord={handleAddAbsenceRecord}
            onUpdateAbsenceRecord={handleUpdateAbsenceRecord}
            onDeleteAbsenceRecord={handleDeleteAbsenceRecord}
          />
        )}

        {activeTab === 'profil' && <ProfileSection profile={profile} staffList={staffList} />}

        {activeTab === 'organisasi' && (
          <ProfileSection profile={profile} staffList={staffList} />
        )}

        {activeTab === 'akademik' && (
          <AcademicSection
            events={events}
            profile={profile}
            staffList={staffList}
            initialSubTab={kurikulumSubTab}
            initialIctSubTab={ictSubTab}
            isAdmin={isAdmin}
            isTeacher={userRole === 'guru'}
            userRole={userRole}
            onOpenLogin={() => setLoginModalOpen(true)}
          />
        )}

        {activeTab === 'hem' && (
          <HemSection
            hemData={hemData}
            profile={profile}
            staffList={staffList}
            students={studentsList}
            absenceRecords={absenceRecords}
            onAddAbsenceRecord={handleAddAbsenceRecord}
            onUpdateAbsenceRecord={handleUpdateAbsenceRecord}
            onDeleteAbsenceRecord={handleDeleteAbsenceRecord}
            initialSubTab={hemSubTab}
            isAdmin={isAdmin}
            isTeacher={userRole === 'guru'}
            userRole={userRole}
            onOpenStudentPortal={() => setIsGlobalStudentPortalOpen(true)}
            onOpenLogin={() => setLoginModalOpen(true)}
            schoolHolidays={schoolHolidays}
            onSaveSchoolHolidays={handleSaveSchoolHolidays}
          />
        )}

        {activeTab === 'kokurikulum' && (
          <CokurriculumSection
            units={coCurriculumUnits}
            profile={profile}
            staffList={staffList}
          />
        )}

        {activeTab === 'signage' && (
          <SignageSection
            profile={profile}
            slides={signageSlides}
            config={signageConfig}
          />
        )}

        {activeTab === 'berita' && (
          <NewsSection
            newsList={newsList}
            galleryItems={gallery}
            awards={awards}
            documents={documents}
            systemLinks={systemLinks}
            pibgActivities={pibgActivities}
            pibgCommittee={pibgCommittee}
            selectedNewsItem={selectedNewsReader}
            onSelectNewsItem={setSelectedNewsReader}
            initialSubTab="semua"
          />
        )}

        {activeTab === 'galeri' && (
          <NewsSection
            newsList={newsList}
            galleryItems={gallery}
            awards={awards}
            documents={documents}
            systemLinks={systemLinks}
            pibgActivities={pibgActivities}
            pibgCommittee={pibgCommittee}
            selectedNewsItem={selectedNewsReader}
            onSelectNewsItem={setSelectedNewsReader}
            initialSubTab="galeri"
          />
        )}

        {activeTab === 'anugerah' && (
          <NewsSection
            newsList={newsList}
            galleryItems={gallery}
            awards={awards}
            documents={documents}
            systemLinks={systemLinks}
            pibgActivities={pibgActivities}
            pibgCommittee={pibgCommittee}
            selectedNewsItem={selectedNewsReader}
            onSelectNewsItem={setSelectedNewsReader}
            initialSubTab="anugerah"
          />
        )}

        {activeTab === 'portal' && (
          <NewsSection
            newsList={newsList}
            galleryItems={gallery}
            awards={awards}
            documents={documents}
            systemLinks={systemLinks}
            pibgActivities={pibgActivities}
            pibgCommittee={pibgCommittee}
            selectedNewsItem={selectedNewsReader}
            onSelectNewsItem={setSelectedNewsReader}
            initialSubTab="portal"
          />
        )}

        {activeTab === 'hubungi' && (
          <ContactSection profile={profile} onSubmitFeedback={handleAddFeedback} />
        )}

        {activeTab === 'gas_code' && (
          isAdmin ? (
            <GasScriptSection />
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl text-center text-white shadow-2xl">
              <div className="w-16 h-16 bg-yellow-400/20 border border-yellow-300/40 rounded-2xl flex items-center justify-center mx-auto mb-4 text-yellow-300">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black mb-2">Akses Terhad Pentadbir</h3>
              <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                Sumber kod Google Apps Script dan konfigurasi teknikal pangkalan data hanya boleh diakses oleh Pentadbir Sistem SKMP yang sah.
              </p>
              <button
                onClick={() => setLoginModalOpen(true)}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-black rounded-xl text-xs transition shadow-lg shadow-yellow-400/20"
              >
                Log Masuk Admin Sekolah
              </button>
            </div>
          )
        )}

        {activeTab === 'admin_cms' && isAdmin && (
          <AdminDashboard
            profile={profile}
            onSaveProfile={handleUpdateProfile}
            staffList={staffList}
            onSaveStaff={handleUpdateStaff}
            newsList={newsList}
            onSaveNews={handleUpdateNews}
            events={events}
            onSaveEvents={handleUpdateEvents}
            documents={documents}
            onSaveDocuments={handleUpdateDocuments}
            awards={awards}
            onSaveAwards={handleUpdateAwards}
            gallery={gallery}
            onSaveGallery={handleUpdateGallery}
            feedbackList={feedbackList}
            onSaveFeedback={handleUpdateFeedback}
            pibgActivities={pibgActivities}
            onSavePibgActivities={handleUpdatePibgActivities}
            pibgCommittee={pibgCommittee}
            onSavePibgCommittee={handleUpdatePibgCommittee}
            coCurriculumUnits={coCurriculumUnits}
            onSaveCoCurriculum={handleUpdateCoCurriculum}
            signageSlides={signageSlides}
            onSaveSignageSlides={handleUpdateSignageSlides}
            signageConfig={signageConfig}
            onSaveSignageConfig={handleUpdateSignageConfig}
            hemData={hemData}
            onSaveHemData={handleUpdateHemData}
            navigationMenu={navigationMenu}
            onSaveNavigationMenu={handleUpdateNavigationMenu}
            teacherLinks={teacherLinks}
            onSaveTeacherLinks={handleUpdateTeacherLinks}
            onResetAll={handleResetAllData}
          />
        )}
      </main>

      {/* Footer Component */}
      <Footer
        profile={profile}
        onNavigate={setActiveTab}
        onOpenAdminLogin={() => setLoginModalOpen(true)}
        isAdmin={isAdmin}
      />

      {/* Admin / Guru Login Modal */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={(role) => {
          setUserRole(role);
          if (role === 'admin') {
            setIsAdmin(true);
            setActiveTab('admin_cms');
          } else {
            setIsAdmin(false);
            setActiveTab('guru');
          }
        }}
      />

      {/* Student Database & Search Portal Modal (Carian Murid) */}
      <StudentSearchPortalModal
        isOpen={isGlobalStudentPortalOpen}
        onClose={() => setIsGlobalStudentPortalOpen(false)}
      />

      {/* Global RMT Management Modal Popup (Kehadiran RMT Murid) */}
      {isGlobalRmtPortalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-white/20 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-900/40">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    Portal Rancangan Makanan Tambahan (RMT)
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-black">
                      89 Murid Layak
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pangkalan data murid, semakan kelayakan, menu & perekodan ketidakhadiran RMT
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGlobalRmtPortalOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition cursor-pointer"
                title="Tutup Modal"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              <TeacherRmtSubSection
                coordinatorName={profile?.hemCoordinator || 'Puan Fazilah binti Mat'}
                students={studentsList}
                absenceRecords={absenceRecords}
                onAddAbsenceRecord={handleAddAbsenceRecord}
              />
            </div>
          </div>
        </div>
      )}

      {/* Global ICT Booking Modal (Tempahan Bilik ICT) */}
      <IctBookingModal
        isOpen={isGlobalIctModalOpen}
        onClose={() => setIsGlobalIctModalOpen(false)}
      />

      {/* Sweetbot AI Robot Assistant (Peeking on the screen edge) */}
      <SweetbotWidget
        profile={profile}
        events={events}
        newsList={newsList}
        staffList={staffList}
        awards={awards}
        pibgCommittee={pibgCommittee}
        pibgActivities={pibgActivities}
        coCurriculumUnits={coCurriculumUnits}
        documents={documents}
        systemLinks={systemLinks}
        hemData={hemData}
        isAdmin={isAdmin}
        userRole={userRole}
        onOpenStudentPortal={() => setIsGlobalStudentPortalOpen(true)}
        onOpenRmtPortal={() => setIsGlobalRmtPortalOpen(true)}
        onOpenIctBooking={() => setIsGlobalIctModalOpen(true)}
        onNavigateSection={(sectionId) => {
          setActiveTab(sectionId as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
