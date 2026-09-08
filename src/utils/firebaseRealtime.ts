import {
  getFirebaseDb,
  isFirebaseEnabled,
  doc,
  setDoc,
  getDoc,
  onSnapshot
} from './firebaseSync';
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
  HemData,
  NavigationMenuItem,
  TeacherLinkItem,
  StudentRecord,
  StudentAbsenceRecord,
  IctBookingRecord,
  IctCashFlowRecord
} from '../types';

/**
 * Tolak kemaskini ke Firestore (Real-time Cloud Sync)
 */
export async function pushToFirestore(collectionName: string, docId: string, data: any): Promise<boolean> {
  if (!isFirebaseEnabled()) return false;
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    console.log(`[FIRESTORE] Saved ${collectionName}/${docId}`);
    return true;
  } catch (err) {
    console.warn(`[FIRESTORE ERROR] Gagal menyimpan ke ${collectionName}/${docId}:`, err);
    return false;
  }
}

/**
 * Tolak SEMUA data semasa ke Firestore (Full Seed / Bulk Upload)
 */
export async function syncAllDataToFirestore(data: {
  profile?: SchoolProfile;
  staffList?: Staff[];
  newsList?: NewsItem[];
  events?: CalendarEvent[];
  gallery?: GalleryItem[];
  awards?: AwardItem[];
  documents?: DownloadDocument[];
  hemData?: HemData;
  pibgActivities?: PibgActivity[];
  pibgCommittee?: PibgCommittee[];
  cocurriculum?: CoCurriculumUnit[];
  signageSlides?: SignageSlide[];
  signageConfig?: SignageConfig;
  navigationMenu?: NavigationMenuItem[];
  teacherLinks?: TeacherLinkItem[];
  absenceRecords?: StudentAbsenceRecord[];
  ictCashFlow?: IctCashFlowRecord[];
  students?: StudentRecord[];
}): Promise<boolean> {
  if (!isFirebaseEnabled()) return false;
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const promises: Promise<any>[] = [];
    if (data.profile) {
      promises.push(setDoc(doc(db, 'school_data', 'profile'), { ...data.profile, updatedAt: new Date().toISOString() }, { merge: true }));
    }
    if (data.staffList) {
      promises.push(setDoc(doc(db, 'school_data', 'staff'), { items: data.staffList, updatedAt: new Date().toISOString() }, { merge: true }));
    }
    if (data.newsList) {
      promises.push(setDoc(doc(db, 'school_data', 'news'), { items: data.newsList, updatedAt: new Date().toISOString() }, { merge: true }));
    }
    if (data.events) {
      promises.push(setDoc(doc(db, 'school_data', 'events'), { items: data.events, updatedAt: new Date().toISOString() }, { merge: true }));
    }
    if (data.hemData) {
      promises.push(setDoc(doc(db, 'school_data', 'hem'), { ...data.hemData, updatedAt: new Date().toISOString() }, { merge: true }));
    }
    if (data.cocurriculum) {
      promises.push(setDoc(doc(db, 'school_data', 'cocurriculum'), { items: data.cocurriculum, updatedAt: new Date().toISOString() }, { merge: true }));
    }
    if (data.pibgActivities || data.pibgCommittee) {
      promises.push(setDoc(doc(db, 'school_data', 'pibg'), {
        activities: data.pibgActivities || [],
        committee: data.pibgCommittee || [],
        updatedAt: new Date().toISOString()
      }, { merge: true }));
    }
    if (data.signageSlides || data.signageConfig) {
      promises.push(setDoc(doc(db, 'school_data', 'signage'), {
        slides: data.signageSlides || [],
        config: data.signageConfig || {},
        updatedAt: new Date().toISOString()
      }, { merge: true }));
    }
    if (data.navigationMenu) {
      promises.push(setDoc(doc(db, 'school_data', 'navigation_menu'), {
        items: data.navigationMenu,
        updatedAt: new Date().toISOString()
      }, { merge: true }));
    }
    if (data.teacherLinks) {
      promises.push(setDoc(doc(db, 'school_data', 'teacher_links'), {
        items: data.teacherLinks,
        updatedAt: new Date().toISOString()
      }, { merge: true }));
    }
    if (data.absenceRecords) {
      promises.push(setDoc(doc(db, 'school_data', 'attendance_absence'), {
        items: data.absenceRecords,
        records: data.absenceRecords,
        updatedAt: new Date().toISOString()
      }, { merge: true }));
    }
    if (data.ictCashFlow) {
      promises.push(setDoc(doc(db, 'school_data', 'ict_finance'), {
        items: data.ictCashFlow,
        records: data.ictCashFlow,
        updatedAt: new Date().toISOString()
      }, { merge: true }));
    }
    if (data.students) {
      promises.push(setDoc(doc(db, 'school_data', 'students'), {
        items: data.students,
        updatedAt: new Date().toISOString()
      }, { merge: true }));
    }

    await Promise.all(promises);
    return true;
  } catch (err) {
    console.error('Error syncing all data to Firestore:', err);
    throw err;
  }
}

/**
 * Setup Realtime Listeners for All Main School Collections
 */
export function setupFirestoreRealtimeSync(callbacks: {
  onProfileChange?: (profile: SchoolProfile) => void;
  onStaffChange?: (staff: Staff[]) => void;
  onNewsChange?: (news: NewsItem[]) => void;
  onEventsChange?: (events: CalendarEvent[]) => void;
  onGalleryChange?: (gallery: GalleryItem[]) => void;
  onAwardsChange?: (awards: AwardItem[]) => void;
  onDocumentsChange?: (docs: DownloadDocument[]) => void;
  onFeedbackChange?: (fb: FeedbackEntry[]) => void;
  onPibgActivitiesChange?: (act: PibgActivity[]) => void;
  onPibgCommitteeChange?: (comm: PibgCommittee[]) => void;
  onCoCurriculumChange?: (units: CoCurriculumUnit[]) => void;
  onSignageSlidesChange?: (slides: SignageSlide[]) => void;
  onSignageConfigChange?: (config: SignageConfig) => void;
  onHemDataChange?: (hem: HemData) => void;
  onNavigationMenuChange?: (menu: NavigationMenuItem[]) => void;
  onTeacherLinksChange?: (links: TeacherLinkItem[]) => void;
  onAbsenceRecordsChange?: (records: StudentAbsenceRecord[]) => void;
  onIctBookingsChange?: (bookings: IctBookingRecord[]) => void;
  onIctFinanceChange?: (records: IctCashFlowRecord[]) => void;
  onStudentsChange?: (students: StudentRecord[]) => void;
  onStudentPhotosChange?: (photos: Record<string, string>) => void;
}): () => void {
  if (!isFirebaseEnabled()) return () => {};
  const db = getFirebaseDb();
  if (!db) return () => {};

  const unsubscribers: (() => void)[] = [];

  try {
    // 1. Profil Sekolah
    if (callbacks.onProfileChange) {
      const unsub = onSnapshot(doc(db, 'school_data', 'profile'), (snap) => {
        if (snap.exists()) {
          const data = snap.data() as any;
          if (data && data.name) {
            callbacks.onProfileChange!(data as SchoolProfile);
          }
        }
      }, (err) => console.warn('[FIRESTORE] Profile sync listener:', err));
      unsubscribers.push(unsub);
    }

    // 2. Warga Sekolah (Staff List)
    if (callbacks.onStaffChange) {
      const unsub = onSnapshot(doc(db, 'school_data', 'staff'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && Array.isArray(data.items)) {
            callbacks.onStaffChange!(data.items as Staff[]);
          }
        }
      }, (err) => console.warn('[FIRESTORE] Staff sync listener:', err));
      unsubscribers.push(unsub);
    }

    // 3. Berita Sekolah
    if (callbacks.onNewsChange) {
      const unsub = onSnapshot(doc(db, 'school_data', 'news'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && Array.isArray(data.items)) {
            callbacks.onNewsChange!(data.items as NewsItem[]);
          }
        }
      }, (err) => console.warn('[FIRESTORE] News sync listener:', err));
      unsubscribers.push(unsub);
    }

    // 4. Takwim & Acara
    if (callbacks.onEventsChange) {
      const unsub = onSnapshot(doc(db, 'school_data', 'events'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && Array.isArray(data.items)) {
            callbacks.onEventsChange!(data.items as CalendarEvent[]);
          }
        }
      }, (err) => console.warn('[FIRESTORE] Events sync listener:', err));
      unsubscribers.push(unsub);
    }

    // 5. Hal Ehwal Murid (HEM)
    if (callbacks.onHemDataChange) {
      const unsub = onSnapshot(doc(db, 'school_data', 'hem'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && (data.gpkName || data.disiplin || data.kebajikan)) {
            callbacks.onHemDataChange!(data as HemData);
          }
        }
      }, (err) => console.warn('[FIRESTORE] HEM sync listener:', err));
      unsubscribers.push(unsub);
    }

    // 6. Kokurikulum
    if (callbacks.onCoCurriculumChange) {
      const unsub = onSnapshot(doc(db, 'school_data', 'cocurriculum'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && Array.isArray(data.items)) {
            callbacks.onCoCurriculumChange!(data.items as CoCurriculumUnit[]);
          }
        }
      }, (err) => console.warn('[FIRESTORE] CoCurriculum sync listener:', err));
      unsubscribers.push(unsub);
    }

    // 7. PIBG
    if (callbacks.onPibgCommitteeChange || callbacks.onPibgActivitiesChange) {
      const unsub = onSnapshot(doc(db, 'school_data', 'pibg'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && Array.isArray(data.committee) && callbacks.onPibgCommitteeChange) {
            callbacks.onPibgCommitteeChange(data.committee as PibgCommittee[]);
          }
          if (data && Array.isArray(data.activities) && callbacks.onPibgActivitiesChange) {
            callbacks.onPibgActivitiesChange(data.activities as PibgActivity[]);
          }
        }
      }, (err) => console.warn('[FIRESTORE] PIBG sync listener:', err));
      unsubscribers.push(unsub);
    }

    // 8. Signage TV
    if (callbacks.onSignageSlidesChange || callbacks.onSignageConfigChange) {
      const unsub = onSnapshot(doc(db, 'school_data', 'signage'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && Array.isArray(data.slides) && callbacks.onSignageSlidesChange) {
            callbacks.onSignageSlidesChange(data.slides as SignageSlide[]);
          }
          if (data && data.config && callbacks.onSignageConfigChange) {
            callbacks.onSignageConfigChange(data.config as SignageConfig);
          }
        }
      }, (err) => console.warn('[FIRESTORE] Signage sync listener:', err));
      unsubscribers.push(unsub);
    }

    // 9. Menu Utama (Navigation Menu)
    if (callbacks.onNavigationMenuChange) {
      const unsub = onSnapshot(doc(db, 'school_data', 'navigation_menu'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && Array.isArray(data.items)) {
            callbacks.onNavigationMenuChange!(data.items as NavigationMenuItem[]);
          }
        }
      }, (err) => console.warn('[FIRESTORE] Navigation Menu sync listener:', err));
      unsubscribers.push(unsub);
    }

    // 10. Portal Pautan Guru (Teacher Links)
    if (callbacks.onTeacherLinksChange) {
      const unsub = onSnapshot(doc(db, 'school_data', 'teacher_links'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && Array.isArray(data.items)) {
            callbacks.onTeacherLinksChange!(data.items as TeacherLinkItem[]);
          }
        }
      }, (err) => console.warn('[FIRESTORE] Teacher Links sync listener:', err));
      unsubscribers.push(unsub);
    }

    // 11. Rekod Ketidakhadiran Murid (Attendance Absence / e-Kehadiran - Live Cloud Sync)
    if (callbacks.onAbsenceRecordsChange) {
      const unsub = onSnapshot(doc(db, 'school_data', 'attendance_absence'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const list = (data.items || data.records) as StudentAbsenceRecord[];
          if (Array.isArray(list)) {
            callbacks.onAbsenceRecordsChange!(list);
          }
        }
      }, (err) => console.warn('[FIRESTORE] Attendance Absence sync listener:', err));
      unsubscribers.push(unsub);
    }

    // 12. Tempahan Makmal ICT (ICT Room Bookings - Live Cloud Sync across all devices)
    if (callbacks.onIctBookingsChange) {
      const unsub = onSnapshot(doc(db, 'school_data', 'ict_bookings'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && Array.isArray(data.items)) {
            console.log('[FIRESTORE] ICT Bookings synced from cloud:', data.items.length);
            callbacks.onIctBookingsChange!(data.items as IctBookingRecord[]);
          }
        }
      }, (err) => console.warn('[FIRESTORE] ICT bookings sync listener:', err));
      unsubscribers.push(unsub);
    }

    // 13. Kewangan & Aliran Tunai ICT (ICT Finance - Live Cloud Sync across all devices)
    if (callbacks.onIctFinanceChange) {
      const unsub = onSnapshot(doc(db, 'school_data', 'ict_finance'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const list = (data.items || data.records) as IctCashFlowRecord[];
          if (Array.isArray(list)) {
            console.log('[FIRESTORE] ICT Finance synced from cloud:', list.length);
            callbacks.onIctFinanceChange!(list);
          }
        }
      }, (err) => console.warn('[FIRESTORE] ICT Finance sync listener:', err));
      unsubscribers.push(unsub);
    }

    // 14. Pangkalan Data Carian Murid (Student Database - Live Cloud Sync)
    if (callbacks.onStudentsChange) {
      const unsub = onSnapshot(doc(db, 'school_data', 'students'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const list = (data.items || data.students) as StudentRecord[];
          if (Array.isArray(list)) {
            console.log('[FIRESTORE] Students database synced from cloud:', list.length);
            callbacks.onStudentsChange!(list);
          }
        }
      }, (err) => console.warn('[FIRESTORE] Students database sync listener:', err));
      unsubscribers.push(unsub);
    }

    // 15. Gambar Murid Carian Murid (Student Photos Map - Live Cloud Sync)
    if (callbacks.onStudentPhotosChange) {
      const unsub = onSnapshot(doc(db, 'school_data', 'student_photos'), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && data.photos && typeof data.photos === 'object') {
            console.log('[FIRESTORE] Student photos map synced from cloud');
            callbacks.onStudentPhotosChange!(data.photos as Record<string, string>);
          }
        }
      }, (err) => console.warn('[FIRESTORE] Student photos sync listener:', err));
      unsubscribers.push(unsub);
    }

  } catch (err) {
    console.error('Error attaching Firestore listeners:', err);
  }

  return () => {
    unsubscribers.forEach((unsub) => {
      try {
        unsub();
      } catch (e) {
        // ignore
      }
    });
  };
}

/**
 * Tolak kemaskini Tempahan Bilik ICT terus ke Firebase Firestore
 */
export async function pushIctBookingsToFirestore(bookings: IctBookingRecord[]): Promise<boolean> {
  if (!isFirebaseEnabled()) return false;
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const docRef = doc(db, 'school_data', 'ict_bookings');
    await setDoc(docRef, {
      items: bookings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`[FIRESTORE] Successfully pushed ${bookings.length} ICT bookings to cloud`);
    return true;
  } catch (err) {
    console.warn('[FIRESTORE ERROR] Gagal menyimpan tempahan ICT ke cloud:', err);
    return false;
  }
}

/**
 * Dapatkan data terkini Tempahan Makmal ICT terus daripada Firestore
 */
export async function fetchIctBookingsFromFirestore(): Promise<IctBookingRecord[] | null> {
  if (!isFirebaseEnabled()) return null;
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const docRef = doc(db, 'school_data', 'ict_bookings');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && Array.isArray(data.items)) {
        return data.items as IctBookingRecord[];
      }
    }
  } catch (err) {
    console.warn('[FIRESTORE] Failed to fetch ICT bookings:', err);
  }
  return null;
}

/**
 * Langganan masa nyata terus untuk Tempahan Makmal ICT
 */
export function subscribeToIctBookings(callback: (bookings: IctBookingRecord[]) => void): () => void {
  if (!isFirebaseEnabled()) return () => {};
  const db = getFirebaseDb();
  if (!db) return () => {};

  try {
    const docRef = doc(db, 'school_data', 'ict_bookings');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.items)) {
          callback(data.items as IctBookingRecord[]);
        }
      }
    }, (err) => {
      console.warn('[FIRESTORE] Direct ICT bookings subscription error:', err);
    });
    return unsub;
  } catch (err) {
    console.warn('[FIRESTORE] Unable to set up ICT bookings listener:', err);
    return () => {};
  }
}

// ==========================================
// 1. KEWANGAN ICT (ICT Finance & Cash Flow Cloud Sync)
// ==========================================

/**
 * Tolak kemaskini Penyata & Aliran Tunai ICT terus ke Firebase Firestore
 */
export async function pushIctFinanceToFirestore(records: IctCashFlowRecord[]): Promise<boolean> {
  if (!isFirebaseEnabled()) return false;
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const docRef = doc(db, 'school_data', 'ict_finance');
    await setDoc(docRef, {
      items: records,
      records: records,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`[FIRESTORE] Successfully pushed ${records.length} ICT finance records to cloud`);
    return true;
  } catch (err) {
    console.warn('[FIRESTORE ERROR] Gagal menyimpan kewangan ICT ke cloud:', err);
    return false;
  }
}

/**
 * Dapatkan rekod kewangan ICT terkini terus daripada Firebase Firestore
 */
export async function fetchIctFinanceFromFirestore(): Promise<IctCashFlowRecord[] | null> {
  if (!isFirebaseEnabled()) return null;
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const docRef = doc(db, 'school_data', 'ict_finance');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const list = (data.items || data.records) as IctCashFlowRecord[];
      if (Array.isArray(list)) {
        return list;
      }
    }
  } catch (err) {
    console.warn('[FIRESTORE] Failed to fetch ICT finance:', err);
  }
  return null;
}

/**
 * Langganan masa nyata (Real-time listener) terus untuk Kewangan ICT
 */
export function subscribeToIctFinance(callback: (records: IctCashFlowRecord[]) => void): () => void {
  if (!isFirebaseEnabled()) return () => {};
  const db = getFirebaseDb();
  if (!db) return () => {};

  try {
    const docRef = doc(db, 'school_data', 'ict_finance');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const list = (data.items || data.records) as IctCashFlowRecord[];
        if (Array.isArray(list)) {
          callback(list);
        }
      }
    }, (err) => {
      console.warn('[FIRESTORE] Direct ICT finance subscription error:', err);
    });
    return unsub;
  } catch (err) {
    console.warn('[FIRESTORE] Unable to set up ICT finance listener:', err);
    return () => {};
  }
}

// ==========================================
// 2. e-KEHADIRAN (Attendance & Absence Records Cloud Sync)
// ==========================================

/**
 * Tolak kemaskini rekod e-Kehadiran / Ketidakhadiran Murid terus ke Firebase Firestore
 */
export async function pushAbsenceRecordsToFirestore(records: StudentAbsenceRecord[]): Promise<boolean> {
  if (!isFirebaseEnabled()) return false;
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const docRef = doc(db, 'school_data', 'attendance_absence');
    await setDoc(docRef, {
      items: records,
      records: records,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`[FIRESTORE] Successfully pushed ${records.length} e-kehadiran absence records to cloud`);
    return true;
  } catch (err) {
    console.warn('[FIRESTORE ERROR] Gagal menyimpan e-kehadiran ke cloud:', err);
    return false;
  }
}

/**
 * Dapatkan rekod e-kehadiran terkini terus daripada Firebase Firestore
 */
export async function fetchAbsenceRecordsFromFirestore(): Promise<StudentAbsenceRecord[] | null> {
  if (!isFirebaseEnabled()) return null;
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const docRef = doc(db, 'school_data', 'attendance_absence');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const list = (data.items || data.records) as StudentAbsenceRecord[];
      if (Array.isArray(list)) {
        return list;
      }
    }
  } catch (err) {
    console.warn('[FIRESTORE] Failed to fetch absence records:', err);
  }
  return null;
}

/**
 * Langganan masa nyata (Real-time listener) terus untuk e-Kehadiran
 */
export function subscribeToAbsenceRecords(callback: (records: StudentAbsenceRecord[]) => void): () => void {
  if (!isFirebaseEnabled()) return () => {};
  const db = getFirebaseDb();
  if (!db) return () => {};

  try {
    const docRef = doc(db, 'school_data', 'attendance_absence');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const list = (data.items || data.records) as StudentAbsenceRecord[];
        if (Array.isArray(list)) {
          callback(list);
        }
      }
    }, (err) => {
      console.warn('[FIRESTORE] Direct absence records subscription error:', err);
    });
    return unsub;
  } catch (err) {
    console.warn('[FIRESTORE] Unable to set up absence records listener:', err);
    return () => {};
  }
}

// ==========================================
// 3. CARIAN MURID & GAMBAR MURID (Student Database & Photos Cloud Sync)
// ==========================================

/**
 * Tolak kemaskini senarai murid terus ke Firebase Firestore
 */
export async function pushStudentsToFirestore(students: StudentRecord[]): Promise<boolean> {
  if (!isFirebaseEnabled()) return false;
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const docRef = doc(db, 'school_data', 'students');
    await setDoc(docRef, {
      items: students,
      students: students,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`[FIRESTORE] Successfully pushed ${students.length} students to cloud`);
    return true;
  } catch (err) {
    console.warn('[FIRESTORE ERROR] Gagal menyimpan senarai murid ke cloud:', err);
    return false;
  }
}

/**
 * Dapatkan data carian murid terkini terus daripada Firestore
 */
export async function fetchStudentsFromFirestore(): Promise<StudentRecord[] | null> {
  if (!isFirebaseEnabled()) return null;
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const docRef = doc(db, 'school_data', 'students');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const list = (data.items || data.students) as StudentRecord[];
      if (Array.isArray(list)) {
        return list;
      }
    }
  } catch (err) {
    console.warn('[FIRESTORE] Failed to fetch students:', err);
  }
  return null;
}

/**
 * Langganan masa nyata terus untuk Carian Murid
 */
export function subscribeToStudents(callback: (students: StudentRecord[]) => void): () => void {
  if (!isFirebaseEnabled()) return () => {};
  const db = getFirebaseDb();
  if (!db) return () => {};

  try {
    const docRef = doc(db, 'school_data', 'students');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const list = (data.items || data.students) as StudentRecord[];
        if (Array.isArray(list)) {
          callback(list);
        }
      }
    }, (err) => {
      console.warn('[FIRESTORE] Direct students subscription error:', err);
    });
    return unsub;
  } catch (err) {
    console.warn('[FIRESTORE] Unable to set up students listener:', err);
    return () => {};
  }
}

/**
 * Simpan satu gambar murid terus ke Awan Firestore (Kamus Gambar Murid Silang-Peranti)
 */
export async function saveSingleStudentPhotoToFirestore(studentKey: string, photoUrl: string): Promise<boolean> {
  if (!isFirebaseEnabled()) return false;
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const docRef = doc(db, 'school_data', 'student_photos');
    const snap = await getDoc(docRef);
    const existingPhotos: Record<string, string> = snap.exists() && snap.data().photos ? { ...snap.data().photos } : {};
    existingPhotos[studentKey] = photoUrl;

    await setDoc(docRef, {
      photos: existingPhotos,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`[FIRESTORE] Saved photo for student key ${studentKey} to cloud`);
    return true;
  } catch (err) {
    console.warn('[FIRESTORE ERROR] Gagal menyimpan gambar murid ke cloud:', err);
    return false;
  }
}

/**
 * Dapatkan kamus gambar murid daripada Firestore
 */
export async function fetchStudentPhotosFromFirestore(): Promise<Record<string, string> | null> {
  if (!isFirebaseEnabled()) return null;
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const docRef = doc(db, 'school_data', 'student_photos');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.photos && typeof data.photos === 'object') {
        return data.photos as Record<string, string>;
      }
    }
  } catch (err) {
    console.warn('[FIRESTORE] Failed to fetch student photos map:', err);
  }
  return null;
}

/**
 * Langganan masa nyata untuk kemaskini gambar murid (Auto-sync silang peranti)
 */
export function subscribeToStudentPhotos(callback: (photos: Record<string, string>) => void): () => void {
  if (!isFirebaseEnabled()) return () => {};
  const db = getFirebaseDb();
  if (!db) return () => {};

  try {
    const docRef = doc(db, 'school_data', 'student_photos');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && data.photos && typeof data.photos === 'object') {
          callback(data.photos as Record<string, string>);
        }
      }
    }, (err) => {
      console.warn('[FIRESTORE] Direct student photos subscription error:', err);
    });
    return unsub;
  } catch (err) {
    console.warn('[FIRESTORE] Unable to set up student photos listener:', err);
    return () => {};
  }
}


