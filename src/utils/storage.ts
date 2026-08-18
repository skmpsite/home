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
  SignageSlide,
  SignageConfig
} from '../types';
import {
  initialSchoolProfile,
  initialStaffList,
  initialNewsList,
  initialCalendarEvents,
  initialGalleryItems,
  initialAwardsList,
  initialDownloadDocs,
  initialSystemLinks,
  initialFeedbackList,
  initialPibgActivities,
  initialPibgCommittee,
  initialCoCurriculumUnits,
  initialSignageSlides,
  initialSignageConfig
} from '../data/initialData';
import { getSafeNewsImageUrl } from './imageHelpers';
import { sortStaffBySeniority } from './staffHelpers';

const KEYS = {
  PROFILE: 'skmp_profile_v1',
  STAFF: 'skmp_staff_v1',
  NEWS: 'skmp_news_v1',
  CALENDAR: 'skmp_calendar_v1',
  GALLERY: 'skmp_gallery_v1',
  AWARDS: 'skmp_awards_v1',
  DOCUMENTS: 'skmp_documents_v1',
  SYSTEM_LINKS: 'skmp_syslinks_v1',
  FEEDBACK: 'skmp_feedback_v1',
  PIBG_ACT: 'skmp_pibg_act_v1',
  PIBG_COMM: 'skmp_pibg_comm_v1',
  COCURRICULUM: 'skmp_cocurriculum_v1',
  SIGNAGE_SLIDES: 'skmp_signage_slides_v1',
  SIGNAGE_CONFIG: 'skmp_signage_config_v1'
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.warn(`Failed to parse localStorage key ${key}`, err);
  }
  return fallback;
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save key ${key} to localStorage`, err);
  }
}

export function loadProfile(): SchoolProfile {
  const profile = getStored<SchoolProfile>(KEYS.PROFILE, initialSchoolProfile);
  if (!profile.logoUrl || profile.logoUrl.includes('unsplash.com')) {
    profile.logoUrl = initialSchoolProfile.logoUrl;
  }
  if (
    profile.principalPhotoUrl &&
    (profile.principalPhotoUrl.includes('unsplash.com') ||
      profile.principalPhotoUrl.includes('1786556385385') ||
      profile.principalPhotoUrl.includes('1786555771027') ||
      profile.principalPhotoUrl.includes('guru_besar_norhafiza') ||
      profile.principalPhotoUrl.includes('1786808669012'))
  ) {
    profile.principalPhotoUrl = "";
  }
  if (!profile.principalName || profile.principalName === 'Puan Norhafiza binti Mohamad') {
    profile.principalName = initialSchoolProfile.principalName;
  }
  return profile;
}

export function saveProfile(profile: SchoolProfile): void {
  setStored(KEYS.PROFILE, profile);
}

export function loadStaff(): Staff[] {
  const staff = getStored<Staff[]>(KEYS.STAFF, initialStaffList);
  if (Array.isArray(staff) && staff.length > 0) {
    const updated = staff.map((s) => {
      if (
        s.id === 'staf-1' ||
        s.position.toLowerCase().includes('guru besar') ||
        s.name.toLowerCase().includes('norhafiza')
      ) {
        const isOldAsset =
          s.photoUrl &&
          (s.photoUrl.includes('unsplash.com') ||
            s.photoUrl.includes('1786556385385') ||
            s.photoUrl.includes('1786555771027') ||
            s.photoUrl.includes('guru_besar_norhafiza') ||
            s.photoUrl.includes('1786808669012'));

        return {
          ...s,
          name: initialSchoolProfile.principalName,
          grade: 'DG48',
          position: 'Guru Besar (DG48)',
          photoUrl: isOldAsset ? "" : (s.photoUrl || "")
        };
      }
      return s;
    });
    return sortStaffBySeniority(updated);
  }
  return sortStaffBySeniority(initialStaffList);
}

export function saveStaff(staffList: Staff[]): void {
  const sorted = sortStaffBySeniority(staffList);
  setStored(KEYS.STAFF, sorted);
}

export function loadNews(): NewsItem[] {
  const news = getStored<NewsItem[]>(KEYS.NEWS, initialNewsList);
  if (Array.isArray(news)) {
    let hasCorrupted = false;
    const sanitized = news.map((item) => {
      const safeUrl = getSafeNewsImageUrl(item.imageUrl, item.category, item.id);
      if (safeUrl !== item.imageUrl) {
        hasCorrupted = true;
      }
      return {
        ...item,
        imageUrl: safeUrl
      };
    });

    if (hasCorrupted) {
      setStored(KEYS.NEWS, sanitized);
    }
    return sanitized;
  }
  return initialNewsList;
}

export function saveNews(newsList: NewsItem[]): void {
  setStored(KEYS.NEWS, newsList);
}

export function loadCalendarEvents(): CalendarEvent[] {
  return getStored<CalendarEvent[]>(KEYS.CALENDAR, initialCalendarEvents);
}

export function saveCalendarEvents(events: CalendarEvent[]): void {
  setStored(KEYS.CALENDAR, events);
}

export function loadGallery(): GalleryItem[] {
  return getStored<GalleryItem[]>(KEYS.GALLERY, initialGalleryItems);
}

export function saveGallery(items: GalleryItem[]): void {
  setStored(KEYS.GALLERY, items);
}

export function loadAwards(): AwardItem[] {
  return getStored<AwardItem[]>(KEYS.AWARDS, initialAwardsList);
}

export function saveAwards(awards: AwardItem[]): void {
  setStored(KEYS.AWARDS, awards);
}

export function loadDocuments(): DownloadDocument[] {
  return getStored<DownloadDocument[]>(KEYS.DOCUMENTS, initialDownloadDocs);
}

export function saveDocuments(docs: DownloadDocument[]): void {
  setStored(KEYS.DOCUMENTS, docs);
}

export function loadSystemLinks(): SystemLink[] {
  const links = getStored<SystemLink[]>(KEYS.SYSTEM_LINKS, initialSystemLinks);
  return links.map((link) => {
    if (link.id === 'sys-1' || link.name.toLowerCase().includes('delima')) {
      return {
        ...link,
        name: 'DELIMa 3.0 KPM',
        url: 'https://d3.delima.edu.my',
        description: 'Portal Pembelajaran Digital DELIMa 3.0 KPM untuk guru dan murid.'
      };
    }
    return link;
  });
}

export function saveSystemLinks(links: SystemLink[]): void {
  setStored(KEYS.SYSTEM_LINKS, links);
}

export function loadFeedback(): FeedbackEntry[] {
  return getStored<FeedbackEntry[]>(KEYS.FEEDBACK, initialFeedbackList);
}

export function saveFeedback(list: FeedbackEntry[]): void {
  setStored(KEYS.FEEDBACK, list);
}

export function loadPibgActivities(): PibgActivity[] {
  return getStored<PibgActivity[]>(KEYS.PIBG_ACT, initialPibgActivities);
}

export function savePibgActivities(list: PibgActivity[]): void {
  setStored(KEYS.PIBG_ACT, list);
}

export function loadPibgCommittee(): PibgCommittee[] {
  const comm = getStored<PibgCommittee[]>(KEYS.PIBG_COMM, initialPibgCommittee);
  if (Array.isArray(comm) && comm.length > 0) {
    const updated = comm.map((c) => {
      if (c.position.toLowerCase().includes('guru besar') || c.name.toLowerCase().includes('norhafiza')) {
        const isOldAsset =
          c.photoUrl &&
          (c.photoUrl.includes('unsplash.com') ||
            c.photoUrl.includes('1786556385385') ||
            c.photoUrl.includes('1786555771027') ||
            c.photoUrl.includes('guru_besar_norhafiza') ||
            c.photoUrl.includes('1786808669012'));

        return {
          ...c,
          name: initialSchoolProfile.principalName,
          photoUrl: isOldAsset ? "" : (c.photoUrl || "")
        };
      }
      return c;
    });
    return updated;
  }
  return initialPibgCommittee;
}

export function savePibgCommittee(list: PibgCommittee[]): void {
  setStored(KEYS.PIBG_COMM, list);
}

export function loadCoCurriculum(): CoCurriculumUnit[] {
  return getStored<CoCurriculumUnit[]>(KEYS.COCURRICULUM, initialCoCurriculumUnits);
}

export function saveCoCurriculum(list: CoCurriculumUnit[]): void {
  setStored(KEYS.COCURRICULUM, list);
}

export function loadSignageSlides(): SignageSlide[] {
  const slides = getStored<SignageSlide[]>(KEYS.SIGNAGE_SLIDES, initialSignageSlides);
  if (Array.isArray(slides) && slides.length > 0) {
    // Check if any old placeholder youtube ID exists and upgrade to official video
    let needsUpdate = false;
    const mapped = slides.map(s => {
      if (s.youtubeId === 'kXYiU_JCYtU' || (s.youtubeUrl && s.youtubeUrl.includes('kXYiU_JCYtU'))) {
        needsUpdate = true;
        return {
          ...s,
          youtubeUrl: 'https://www.youtube.com/watch?v=i8HoTEU3h_I',
          youtubeId: 'i8HoTEU3h_I',
          imageUrl: 'https://img.youtube.com/vi/i8HoTEU3h_I/maxresdefault.jpg'
        };
      }
      return s;
    });

    if (needsUpdate) {
      setStored(KEYS.SIGNAGE_SLIDES, mapped);
    }
    return mapped.sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  return initialSignageSlides;
}

export function saveSignageSlides(slides: SignageSlide[]): void {
  setStored(KEYS.SIGNAGE_SLIDES, slides);
  try {
    window.dispatchEvent(new CustomEvent('skmp_signage_updated', { detail: { slides } }));
  } catch {
    // Ignore in non-browser env
  }
}

export function loadSignageConfig(): SignageConfig {
  return getStored<SignageConfig>(KEYS.SIGNAGE_CONFIG, initialSignageConfig);
}

export function saveSignageConfig(config: SignageConfig): void {
  setStored(KEYS.SIGNAGE_CONFIG, config);
  try {
    window.dispatchEvent(new CustomEvent('skmp_signage_config_updated', { detail: { config } }));
  } catch {
    // Ignore in non-browser env
  }
}

export function resetAllToDefault(): void {
  localStorage.removeItem(KEYS.PROFILE);
  localStorage.removeItem(KEYS.STAFF);
  localStorage.removeItem(KEYS.NEWS);
  localStorage.removeItem(KEYS.CALENDAR);
  localStorage.removeItem(KEYS.GALLERY);
  localStorage.removeItem(KEYS.AWARDS);
  localStorage.removeItem(KEYS.DOCUMENTS);
  localStorage.removeItem(KEYS.SYSTEM_LINKS);
  localStorage.removeItem(KEYS.FEEDBACK);
  localStorage.removeItem(KEYS.PIBG_ACT);
  localStorage.removeItem(KEYS.PIBG_COMM);
  localStorage.removeItem(KEYS.COCURRICULUM);
  localStorage.removeItem(KEYS.SIGNAGE_SLIDES);
  localStorage.removeItem(KEYS.SIGNAGE_CONFIG);
}
