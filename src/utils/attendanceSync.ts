import { StudentAbsenceRecord } from '../types';
import {
  fetchAbsenceRecordsFromFirestore,
  pushAbsenceRecordsToFirestore,
  pushSingleAbsenceRecordToFirestore
} from './firebaseRealtime';
import {
  getAbsenceRecords,
  saveAbsenceRecords
} from './storage';

let lastKnownServerTimestamp = 0;
let isSyncInProgress = false;

/**
 * Dapatkan rekod ketidakhadiran dari Server API
 */
export async function fetchAttendanceFromServer(): Promise<{ records: StudentAbsenceRecord[]; lastUpdated: number } | null> {
  try {
    const res = await fetch('/api/attendance', {
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;

    const data = await res.json();
    if (data && data.success && Array.isArray(data.records)) {
      return {
        records: data.records as StudentAbsenceRecord[],
        lastUpdated: data.lastUpdated || 0
      };
    }
  } catch {
    // Network or server unreachable, ignore silently
  }
  return null;
}

/**
 * Simpan atau kemaskini rekod ke Server API
 */
export async function saveAttendanceToServer(
  records: StudentAbsenceRecord[],
  singleRecord?: StudentAbsenceRecord
): Promise<boolean> {
  try {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        records,
        record: singleRecord
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        if (data.lastUpdated) lastKnownServerTimestamp = data.lastUpdated;
        return true;
      }
    }
  } catch (err) {
    console.warn('[ATTENDANCE SYNC] Server push error:', err);
  }
  return false;
}

/**
 * Padam rekod ketidakhadiran daripada Server API
 */
export async function deleteAttendanceFromServer(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/attendance/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        if (data.lastUpdated) lastKnownServerTimestamp = data.lastUpdated;
        return true;
      }
    }
  } catch (err) {
    console.warn('[ATTENDANCE SYNC] Server delete error:', err);
  }
  return false;
}

/**
 * Gabungkan rekod daripada pelbagai sumber tanpa kehilangan data
 */
export function mergeAbsenceRecords(
  localList: StudentAbsenceRecord[],
  serverList: StudentAbsenceRecord[],
  firestoreList: StudentAbsenceRecord[]
): { merged: StudentAbsenceRecord[]; hasNewFromServerOrCloud: boolean; hasLocalOnly: boolean } {
  const map = new Map<string, StudentAbsenceRecord>();

  // 1. Masukkan rekod tempatan
  localList.forEach((r) => {
    if (r && r.id) map.set(r.id, r);
  });

  let hasNewFromServerOrCloud = false;

  // 2. Gabungkan rekod pelayan (Server API)
  serverList.forEach((r) => {
    if (!r || !r.id) return;
    if (!map.has(r.id)) {
      map.set(r.id, r);
      hasNewFromServerOrCloud = true;
    } else {
      const existing = map.get(r.id)!;
      if (
        (r.verifiedAt && !existing.verifiedAt) ||
        (r.status !== existing.status) ||
        (r.createdAt > existing.createdAt)
      ) {
        map.set(r.id, { ...existing, ...r });
        hasNewFromServerOrCloud = true;
      }
    }
  });

  // 3. Gabungkan rekod Firestore
  firestoreList.forEach((r) => {
    if (!r || !r.id) return;
    if (!map.has(r.id)) {
      map.set(r.id, r);
      hasNewFromServerOrCloud = true;
    } else {
      const existing = map.get(r.id)!;
      if (
        (r.verifiedAt && !existing.verifiedAt) ||
        (r.status !== existing.status) ||
        (r.createdAt > existing.createdAt)
      ) {
        map.set(r.id, { ...existing, ...r });
        hasNewFromServerOrCloud = true;
      }
    }
  });

  const merged = Array.from(map.values()).sort((a, b) => {
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  const serverIds = new Set(serverList.map((r) => r.id));
  const hasLocalOnly = localList.some((r) => !serverIds.has(r.id));

  return { merged, hasNewFromServerOrCloud, hasLocalOnly };
}

/**
 * Lakukan penyegerakan lengkap dari semua punca data (Server + Firestore + Local)
 */
export async function syncAttendanceWithAllSources(
  onUpdateCallback?: (records: StudentAbsenceRecord[]) => void
): Promise<StudentAbsenceRecord[]> {
  if (isSyncInProgress) {
    return getAbsenceRecords();
  }
  isSyncInProgress = true;

  try {
    const local = getAbsenceRecords();

    // Fetch serentak daripada Server API dan Firestore
    const [serverRes, firestoreList] = await Promise.all([
      fetchAttendanceFromServer(),
      fetchAbsenceRecordsFromFirestore().catch(() => null)
    ]);

    const serverList = serverRes?.records || [];
    if (serverRes?.lastUpdated) {
      lastKnownServerTimestamp = serverRes.lastUpdated;
    }

    const { merged, hasNewFromServerOrCloud, hasLocalOnly } = mergeAbsenceRecords(
      local,
      serverList,
      firestoreList || []
    );

    // Jika ada rekod tempatan yang belum disegerakkan ke pelayan/cloud
    if (hasLocalOnly && merged.length > 0) {
      saveAttendanceToServer(merged).catch(() => {});
      pushAbsenceRecordsToFirestore(merged).catch(() => {});
    }

    // Jika data pelayan/cloud membawa rekod baru ke peranti ini
    if (hasNewFromServerOrCloud || merged.length !== local.length) {
      saveAbsenceRecords(merged, true, false); // simpan tanpa duplicate event
      if (onUpdateCallback) onUpdateCallback(merged);
    }

    return merged;
  } catch (err) {
    console.warn('[ATTENDANCE SYNC] Ralat penyelarasan:', err);
    return getAbsenceRecords();
  } finally {
    isSyncInProgress = false;
  }
}

/**
 * Tolak satu rekod ketidakhadiran baharu atau dikemaskini ke semua pangkalan data
 */
export async function pushAbsenceRecordFully(
  record: StudentAbsenceRecord,
  currentList: StudentAbsenceRecord[]
): Promise<StudentAbsenceRecord[]> {
  // 1. Gabungkan rekod baharu ke dalam senarai
  const updatedList = [record, ...currentList.filter((r) => r.id !== record.id)];

  // 2. Simpan setempat dan siarkan satu kali secara bersih
  saveAbsenceRecords(updatedList, true, true);

  // 3. Tolak ke Server API Express di latar belakang
  saveAttendanceToServer(updatedList, record).catch((err) => {
    console.warn('[ATTENDANCE SYNC] Error pushing to server API:', err);
  });

  // 4. Tolak ke Firebase Firestore di latar belakang
  pushSingleAbsenceRecordToFirestore(record).catch((err) => {
    console.warn('[ATTENDANCE SYNC] Error pushing single to Firestore:', err);
  });
  pushAbsenceRecordsToFirestore(updatedList).catch((err) => {
    console.warn('[ATTENDANCE SYNC] Error pushing bulk to Firestore:', err);
  });

  return updatedList;
}

/**
 * Tolak padam rekod ke semua pangkalan data
 */
export async function deleteAbsenceRecordFully(
  id: string,
  currentList: StudentAbsenceRecord[]
): Promise<StudentAbsenceRecord[]> {
  const updatedList = currentList.filter((r) => r.id !== id);
  saveAbsenceRecords(updatedList, true, true);

  deleteAttendanceFromServer(id).catch(() => {});
  saveAttendanceToServer(updatedList).catch(() => {});
  pushAbsenceRecordsToFirestore(updatedList).catch(() => {});

  return updatedList;
}

/**
 * Pemantau penyegerakan latar belakang yang ringan & pantas (tanpa membebankan CPU/memori)
 */
export function startLiveAttendanceSync(
  onUpdate: (records: StudentAbsenceRecord[]) => void
): () => void {
  // 1. Lakukan penyegerakan awal segera sekali sahaja
  syncAttendanceWithAllSources(onUpdate);

  // 2. Polling Server API yang sangat ringan (setiap 10 saat, hanya jika tab aktif)
  const interval = setInterval(async () => {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      return; // Jimat bateri & memori bila tab tidak aktif
    }

    try {
      const serverRes = await fetchAttendanceFromServer();
      if (serverRes && serverRes.lastUpdated > lastKnownServerTimestamp) {
        lastKnownServerTimestamp = serverRes.lastUpdated;
        const local = getAbsenceRecords();
        const { merged, hasNewFromServerOrCloud } = mergeAbsenceRecords(local, serverRes.records, []);
        if (hasNewFromServerOrCloud || merged.length !== local.length) {
          saveAbsenceRecords(merged, true, false);
          onUpdate(merged);
        }
      }
    } catch {
      // Abaikan ralat sementara
    }
  }, 10000);

  // 3. Semak pantas apabila tetingkap difokuskan semula atau peranti kembali online
  let lastFocusSync = 0;
  const handleFocus = () => {
    const now = Date.now();
    if (now - lastFocusSync < 5000) return; // Debounce 5s
    lastFocusSync = now;
    syncAttendanceWithAllSources(onUpdate);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);
  }

  return () => {
    clearInterval(interval);
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    }
  };
}
