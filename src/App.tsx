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
  SignageConfig
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
  resetAllToDefault
} from './utils/storage';
import {
  syncFeedbackToGoogleSheets,
  fetchSchoolDataFromGoogleSheets,
  parseSchoolDataFromSheets,
  syncBulkDataToGoogleSheets
} from './utils/googleSheetsSync';
import { broadcastLiveSignage, fetchLiveSignageFromServer } from './utils/liveSignageSync';
import { Header } from './components/Header';
import { Navbar, TabType } from './components/Navbar';
import { HeroSection } from './components/sections/HeroSection';
import { ProfileSection } from './components/sections/ProfileSection';
import { OrganizationSection } from './components/sections/OrganizationSection';
import { AcademicSection } from './components/sections/AcademicSection';
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
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

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

  // UI States
  const [activeTab, setActiveTab] = useState<TabType>('utama');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedNewsReader, setSelectedNewsReader] = useState<NewsItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

    // 3. Semak data serta-merta apabila pengguna membuka tab, fokus pelayar, atau peranti kembali aktif
    const handleImmediateSync = () => {
      refreshFromGoogleSheets();
    };

    // 4. Penyelarasan antara tab/tetingkap secara 0ms (segera)
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'skmp_staff_v1') setStaffList(loadStaff());
      if (e.key === 'skmp_profile_v1') setProfile(loadProfile());
      if (e.key === 'skmp_news_v1') setNewsList(loadNews());
      if (e.key === 'skmp_events_v1') setEvents(loadCalendarEvents());
      if (e.key === 'skmp_gallery_v1') setGallery(loadGallery());
      if (e.key === 'skmp_awards_v1') setAwards(loadAwards());
      if (e.key === 'skmp_signage_slides_v1') setSignageSlides(loadSignageSlides());
      if (e.key === 'skmp_signage_config_v1') setSignageConfig(loadSignageConfig());
    };

    window.addEventListener('visibilitychange', handleImmediateSync);
    window.addEventListener('focus', handleImmediateSync);
    window.addEventListener('online', handleImmediateSync);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleImmediateSync);
      window.removeEventListener('focus', handleImmediateSync);
      window.removeEventListener('online', handleImmediateSync);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  // Helper untuk tolak data ke Google Sheets secara automatik apabila Admin mengemas kini
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
  }) => {
    syncBulkDataToGoogleSheets({
      profile: partialUpdate.profile || profile,
      staffList: partialUpdate.staffList || staffList,
      newsList: partialUpdate.newsList || newsList,
      events: partialUpdate.events || events,
      gallery: partialUpdate.gallery || gallery,
      awards: partialUpdate.awards || awards,
      documents: partialUpdate.documents || documents,
      signageSlides: partialUpdate.signageSlides || signageSlides,
      signageConfig: partialUpdate.signageConfig || signageConfig
    }).catch(err => console.warn('Auto cloud sync failed:', err));
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
  };

  const handleUpdatePibgCommittee = (comm: PibgCommittee[]) => {
    setPibgCommittee(comm);
    savePibgCommittee(comm);
  };

  const handleUpdateCoCurriculum = (units: CoCurriculumUnit[]) => {
    setCoCurriculumUnits(units);
    saveCoCurriculum(units);
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
          linkTab: 'organisasi',
          id: s.id
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

    return results.slice(0, 8);
  }, [searchQuery, newsList, staffList, documents, events]);

  const handleSelectSearchResult = (item: SearchResultItem) => {
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
          onOpenLogin={() => setLoginModalOpen(true)}
          onLogout={() => setIsAdmin(false)}
          searchResults={searchResults}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          onSelectSearchResult={handleSelectSearchResult}
          onOpenAdminDashboard={() => setActiveTab('admin_cms')}
          isMobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        />

        {/* Navbar Menu */}
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isAdmin={isAdmin}
          unreadFeedbackCount={unreadFeedbackCount}
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
            onNavigate={setActiveTab}
            onSelectNews={(news) => {
              setSelectedNewsReader(news);
              setActiveTab('berita');
            }}
          />
        )}

        {activeTab === 'profil' && <ProfileSection profile={profile} />}

        {activeTab === 'organisasi' && (
          <OrganizationSection profile={profile} staffList={staffList} />
        )}

        {activeTab === 'akademik' && <AcademicSection events={events} />}

        {activeTab === 'kokurikulum' && (
          <CokurriculumSection units={coCurriculumUnits} />
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
            selectedNewsItem={selectedNewsReader}
            onSelectNewsItem={setSelectedNewsReader}
          />
        )}

        {activeTab === 'galeri' && <GallerySection galleryItems={gallery} />}

        {activeTab === 'anugerah' && <AwardsSection awards={awards} />}

        {activeTab === 'portal' && (
          <PortalDownloadSection
            documents={documents}
            systemLinks={systemLinks}
            pibgActivities={pibgActivities}
            pibgCommittee={pibgCommittee}
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

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdmin(true);
          setActiveTab('admin_cms');
        }}
      />

      {/* Sweetbot AI Robot Assistant (Peeking on the screen edge) */}
      <SweetbotWidget
        profile={profile}
        events={events}
        newsList={newsList}
        staffList={staffList}
        onNavigateSection={(sectionId) => {
          setActiveTab(sectionId as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
