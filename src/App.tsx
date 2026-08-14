import React, { useState, useEffect, useMemo } from 'react';
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
  SearchResultItem
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
  loadPibgCommittee,
  loadCoCurriculum,
  resetAllToDefault
} from './utils/storage';
import { syncFeedbackToGoogleSheets } from './utils/googleSheetsSync';
import { Header } from './components/Header';
import { Navbar, TabType } from './components/Navbar';
import { HeroSection } from './components/sections/HeroSection';
import { ProfileSection } from './components/sections/ProfileSection';
import { OrganizationSection } from './components/sections/OrganizationSection';
import { AcademicSection } from './components/sections/AcademicSection';
import { CokurriculumSection } from './components/sections/CokurriculumSection';
import { NewsSection } from './components/sections/NewsSection';
import { GallerySection } from './components/sections/GallerySection';
import { AwardsSection } from './components/sections/AwardsSection';
import { PortalDownloadSection } from './components/sections/PortalDownloadSection';
import { ContactSection } from './components/sections/ContactSection';
import { GasScriptSection } from './components/sections/GasScriptSection';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Footer } from './components/Footer';

export default function App() {
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

  // UI States
  const [activeTab, setActiveTab] = useState<TabType>('utama');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedNewsReader, setSelectedNewsReader] = useState<NewsItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist Updates Handlers
  const handleUpdateProfile = (p: SchoolProfile) => {
    setProfile(p);
    saveProfile(p);
  };

  const handleUpdateStaff = (s: Staff[]) => {
    setStaffList(s);
    saveStaff(s);
  };

  const handleUpdateNews = (n: NewsItem[]) => {
    setNewsList(n);
    saveNews(n);
  };

  const handleUpdateEvents = (e: CalendarEvent[]) => {
    setEvents(e);
    saveCalendarEvents(e);
  };

  const handleUpdateGallery = (g: GalleryItem[]) => {
    setGallery(g);
    saveGallery(g);
  };

  const handleUpdateAwards = (a: AwardItem[]) => {
    setAwards(a);
    saveAwards(a);
  };

  const handleUpdateDocuments = (d: DownloadDocument[]) => {
    setDocuments(d);
    saveDocuments(d);
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

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col font-sans antialiased selection:bg-yellow-400 selection:text-blue-950"
      style={{
        background: 'radial-gradient(circle at 0% 0%, #1e3a8a 0%, #1e293b 50%, #0f172a 100%)'
      }}
    >
      {/* Top Header */}
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
      />

      {/* Navbar Menu */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isAdmin={isAdmin}
        unreadFeedbackCount={unreadFeedbackCount}
      />

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

        {activeTab === 'organisasi' && <OrganizationSection staffList={staffList} />}

        {activeTab === 'akademik' && <AcademicSection events={events} />}

        {activeTab === 'kokurikulum' && (
          <CokurriculumSection units={coCurriculumUnits} />
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

        {activeTab === 'gas_code' && <GasScriptSection />}

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
            onResetAll={handleResetAllData}
          />
        )}
      </main>

      {/* Footer Component */}
      <Footer
        profile={profile}
        onNavigate={setActiveTab}
        onOpenAdminLogin={() => setLoginModalOpen(true)}
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
    </div>
  );
}
