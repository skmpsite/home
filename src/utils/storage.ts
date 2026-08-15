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
  CoCurriculumUnit
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
  initialCoCurriculumUnits
} from '../data/initialData';

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
  COCURRICULUM: 'skmp_cocurriculum_v1'
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
  if (!profile.principalPhotoUrl || profile.principalPhotoUrl.includes('unsplash.com')) {
    profile.principalPhotoUrl = initialSchoolProfile.principalPhotoUrl;
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
  if (staff && staff.length > 0) {
    if (staff[0].position.toLowerCase().includes('guru besar')) {
      if (!staff[0].photoUrl || staff[0].photoUrl.includes('unsplash.com')) {
        staff[0].photoUrl = initialSchoolProfile.principalPhotoUrl;
      }
      if (staff[0].name === 'Puan Norhafiza binti Mohamad') {
        staff[0].name = initialSchoolProfile.principalName;
      }
    }
  }
  return staff;
}

export function saveStaff(staffList: Staff[]): void {
  setStored(KEYS.STAFF, staffList);
}

export function loadNews(): NewsItem[] {
  return getStored<NewsItem[]>(KEYS.NEWS, initialNewsList);
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
  return getStored<PibgCommittee[]>(KEYS.PIBG_COMM, initialPibgCommittee);
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
}
