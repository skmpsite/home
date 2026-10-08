import { StudentAbsenceRecord } from '../types';
import {
  fetchAbsenceRecordsFromFirestore,
  pushAbsenceRecordsToFirestore,
  pushSingleAbsenceRecordToFirestore,
  deleteAbsenceRecordFromFirestore
} from './firebaseRealtime';
import {
  getAbsenceRecords,
  saveAbsenceRecords,
  getDeletedAbsenceIds,
  recordDeletedAbsenceId
} from './storage';
import { getBackendApiUrl } from './apiConfig';
import {
  syncAttendanceToGoogleSheets,
  syncBulkAttendanceToGoogleSheets,
  fetchAttendanceRecordsFromGoogleSheets
} from './googleSheetsSync';

let lastKnownServerTimestamp = 0;
let isSyncInProgress = false;

/**
 * Dapatkan rekod ketidakhadiran dari Server API
 */
export async function fetchAttendanceFromServer(): Promise<{ records: StudentAbsenceRecord[]; lastUpdated: number } | null> {
  try {
    const url = getBackendApiUrl('/api/attendance');
    const res = await fetch(url, {
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
    const url = getBackendApiUrl('/api/attendance');
    const res = await fetch(url, {
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
    const url = getBackendApiUrl(`/api/attendance/${encodeURIComponent(id)}`);
    const res = await fetch(url, {
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
  firestoreList: StudentAbsenceRecord[],
  sheetsList: StudentAbsenceRecord[] = []
): { merged: StudentAbsenceRecord[]; hasNewFromServerOrCloud: boolean; hasLocalOnly: boolean } {
  const map = new Map<string, StudentAbsenceRecord>();
  const deletedIds = getDeletedAbsenceIds();

  // 1. Masukkan rekod tempatan (abaikan rekod yang telah dipadam)
  localList.forEach((r) => {
    if (r && r.id && !deletedIds.has(r.id)) map.set(r.id, r);
  });

  let hasNewFromServerOrCloud = false;

  const mergeItem = (r: StudentAbsenceRecord) => {
    if (!r || !r.id || deletedIds.has(r.id)) return;
    if (!map.has(r.id)) {
      map.set(r.id, r);
      hasNewFromServerOrCloud = true;
    } else {
      const existing = map.get(r.id)!;
      if (
        (r.verifiedAt && !existing.verifiedAt) ||
        (r.status !== existing.status) ||
        (r.createdAt > existing.createdAt) ||
        (r.attachmentUrl && !existing.attachmentUrl) ||
        (r.reasonDetails && !existing.reasonDetails)
      ) {
        map.set(r.id, { ...existing, ...r });
        hasNewFromServerOrCloud = true;
      }
    }
  };

  // 2. Gabungkan rekod pelayan (Server API)
  serverList.forEach(mergeItem);

  // 3. Gabungkan rekod Google Sheets (Sandaran rasmi spreadsheet sekolah)
  sheetsList.forEach(mergeItem);

  // 4. Gabungkan rekod Firestore
  firestoreList.forEach(mergeItem);

  const merged = Array.from(map.values()).sort((a, b) => {
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  const serverIds = new Set(serverList.map((r) => r.id));
  const hasLocalOnly = localList.some((r) => !serverIds.has(r.id));

  return { merged, hasNewFromServerOrCloud, hasLocalOnly };
}

/**
 * Cantumkan dua tatasusunan rekod ketidakhadiran dengan selamat (elak rekod baru tempatan terpadam)
 */
export function mergeAbsenceRecordArrays(
  existing: StudentAbsenceRecord[],
  incoming: StudentAbsenceRecord[]
): StudentAbsenceRecord[] {
  return mergeAbsenceRecords(existing || [], incoming || [], [], []).merged;
}

/**
 * Lakukan penyegerakan lengkap dari semua punca data (Server + Google Sheets + Firestore + Local)
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

    // Fetch serentak daripada Server API, Google Sheets dan Firestore
    const [serverRes, sheetsList, firestoreList] = await Promise.all([
      fetchAttendanceFromServer(),
      fetchAttendanceRecordsFromGoogleSheets().catch(() => []),
      fetchAbsenceRecordsFromFirestore().catch(() => null)
    ]);

    const serverList = serverRes?.records || [];
    if (serverRes?.lastUpdated) {
      lastKnownServerTimestamp = serverRes.lastUpdated;
    }

    const { merged, hasNewFromServerOrCloud, hasLocalOnly } = mergeAbsenceRecords(
      local,
      serverList,
      firestoreList || [],
      sheetsList || []
    );

    // Jika ada rekod tempatan yang belum disegerakkan ke pelayan/Google Sheets/cloud
    if (hasLocalOnly && merged.length > 0) {
      saveAttendanceToServer(merged).catch(() => {});
      pushAbsenceRecordsToFirestore(merged).catch(() => {});
      syncBulkAttendanceToGoogleSheets(merged).catch(() => {});
    }

    // Jika data pelayan/cloud/Google Sheets membawa rekod baru ke peranti ini
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

  // 3. Tolak ke Server API Express dan Firebase Firestore
  const serverPromise = saveAttendanceToServer(updatedList, record).catch((err) => {
    console.warn('[ATTENDANCE SYNC] Error pushing to server API:', err);
    return false;
  });

  // 4. Tolak ke Firebase Firestore (hanya rekod individu ini, elak tolak pukal 70+ dokumen yang menghabiskan kuota harian)
  const firestorePromise = pushSingleAbsenceRecordToFirestore(record).catch((err) => {
    console.warn('[ATTENDANCE SYNC] Error pushing single to Firestore:', err);
    return false;
  });

  // 5. Tolak ke Google Sheets (Sandaran awan Google Apps Script tanpa had kuota)
  const sheetsPromise = syncAttendanceToGoogleSheets(record).catch(() => false);

  // Tunggu penghantaran disahkan (dengan had masa 3.5 saat agar tidak menyekat peranti luar talian)
  try {
    await Promise.race([
      Promise.allSettled([serverPromise, firestorePromise, sheetsPromise]),
      new Promise((resolve) => setTimeout(resolve, 3500))
    ]);
  } catch {}

  return updatedList;
}

/**
 * Tolak padam rekod ke semua pangkalan data secara serentak & kekal
 */
export async function deleteAbsenceRecordFully(
  id: string,
  currentList: StudentAbsenceRecord[]
): Promise<StudentAbsenceRecord[]> {
  // 1. Rekodkan ID yang dipadam ke dalam ingatan tombstone tempatan
  recordDeletedAbsenceId(id);

  // 2. Kemaskini senarai tempatan dan simpan serta-merta
  const updatedList = (currentList || []).filter((r) => r && r.id !== id);
  saveAbsenceRecords(updatedList, true, true);

  // 3. Padam daripada Server API dan Firebase Firestore serentak
  try {
    await Promise.all([
      deleteAttendanceFromServer(id).catch((e) => console.warn('[DELETE SYNC] Server delete error:', e)),
      deleteAbsenceRecordFromFirestore(id).catch((e) => console.warn('[DELETE SYNC] Firestore delete error:', e))
    ]);
  } catch {
    // Abaikan ralat rangkaian kecil
  }

  // 4. Pastikan senarai terkini disegerakkan ke Server API
  saveAttendanceToServer(updatedList).catch(() => {});

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
