import {
  getFirebaseDb,
  isFirebaseEnabled,
  doc,
  setDoc,
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
  HemData
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
