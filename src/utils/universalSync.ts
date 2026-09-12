import { useState, useEffect, useCallback, useRef } from 'react';

export const SYNC_KEYS = {
  UBK_RPH: 'skmp_ubk_rph',
  UBK_RPT: 'skmp_ubk_rpt',
  UBK_SESSIONS: 'skmp_ubk_sessions',
  UBK_PBPPP: 'skmp_ubk_pbppp',
  UBK_ACTIVITIES: 'skmp_ubk_activities',
  PIBG_COMM: 'skmp_pibg_comm_v1',
  PIBG_ACT: 'skmp_pibg_act_v1',
  PIBG_DOCS: 'skmp_pibg_docs_v1',
  PIBG_USUL: 'skmp_pibg_usul_v1',
  PROFILE: 'skmp_profile_v1',
  STAFF: 'skmp_staff_v1',
  NEWS: 'skmp_news_v1',
  CALENDAR: 'skmp_calendar_v1',
  GALLERY: 'skmp_gallery_v1',
  AWARDS: 'skmp_awards_v1',
  DOCUMENTS: 'skmp_documents_v1',
  TEACHER_LINKS: 'skmp_teacher_links_v1',
  FEEDBACK: 'skmp_feedback_v1',
  COCURRICULUM: 'skmp_cocurriculum_v1',
  SIGNAGE_SLIDES: 'skmp_signage_slides_v1',
  SIGNAGE_CONFIG: 'skmp_signage_config_v1',
  HEM: 'skmp_hem_v1',
  NAV_MENU: 'skmp_nav_menu_v1',
  STUDENTS: 'skmp_students_v1',
  ABSENCE: 'skmp_absence_records_v1',
  ICT_BOOKINGS: 'skmp_ict_bookings_v1',
  ICT_CASHFLOW: 'skmp_ict_cashflow_v1',
  ACADEMIC_SUBJECTS: 'skmp_academic_subjects_v1',
  ACADEMIC_PROGRAMS: 'skmp_academic_programs_v1'
} as const;

export type SyncKey = typeof SYNC_KEYS[keyof typeof SYNC_KEYS] | string;

// In-memory registry of listeners and timestamps
const keySubscribers = new Map<string, Set<(data: any) => void>>();
const keyTimestamps = new Map<string, number>();
const statusSubscribers = new Set<(status: { connected: boolean; lastSync: number }) => void>();

let lastPollTimestamp = 0;
let isConnected = false;
let isInitialized = false;
let eventSource: EventSource | null = null;
let pollIntervalId: any = null;
let isSyncInProgress = false;

function notifyStatus() {
  const currentStatus = {
    connected: isConnected,
    lastSync: lastPollTimestamp
  };
  statusSubscribers.forEach((cb) => {
    try {
      cb(currentStatus);
    } catch (e) {
      console.error('Status subscriber error:', e);
    }
  });
}

/**
 * Tangani kemasukan data baru daripada pelayan (SSE atau Polling)
 */
export function handleIncomingUpdate(
  key: string,
  data: any,
  updatedAt: number,
  updatedBy?: string,
  source: 'sse' | 'poll' | 'local' = 'sse'
) {
  const localTs = keyTimestamps.get(key) || 0;
  
  // Hanya kemaskini jika data dari pelayan adalah terkini atau sama
  if (updatedAt >= localTs || source === 'local') {
    keyTimestamps.set(key, updatedAt);
    if (updatedAt > lastPollTimestamp) {
      lastPollTimestamp = updatedAt;
    }

    // Simpan ke storan setempat (localStorage)
    if (source !== 'local') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.warn(`[SYNC] Failed to persist key ${key} to localStorage:`, e);
      }
    }

    // Beritahu semua langganan aktif untuk kunci ini
    const subs = keySubscribers.get(key);
    if (subs && subs.size > 0) {
      subs.forEach((callback) => {
        try {
          callback(data);
        } catch (err) {
          console.error(`[SYNC] Error in subscriber callback for key ${key}:`, err);
        }
      });
    }

    // Lancarkan CustomEvent untuk komponen global
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('skmp_data_sync', {
          detail: { key, data, updatedAt, updatedBy, source }
        })
      );
    }
  }
}

/**
 * Tolak kemaskini ke pelayan pusat Express & sebarkan secara masa nyata
 */
export async function syncSave<T>(
  key: string,
  data: T,
  options?: { updatedBy?: string; silent?: boolean }
): Promise<boolean> {
  const now = Date.now();

  // 1. Optimistic update secara setempat serta-merta (0ms latency untuk pengguna semasa)
  handleIncomingUpdate(key, data, now, options?.updatedBy || 'user', 'local');
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`[SYNC] Failed to write ${key} to localStorage:`, e);
  }

  // 2. Hantar ke pelayan pusat (/api/sync/save) untuk disegerakkan ke semua peranti lain
  try {
    const res = await fetch('/api/sync/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key,
        data,
        updatedBy: options?.updatedBy || 'portal_user',
        clientTimestamp: now
      })
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.updatedAt) {
        keyTimestamps.set(key, json.updatedAt);
        lastPollTimestamp = Math.max(lastPollTimestamp, json.updatedAt);
        isConnected = true;
        notifyStatus();
      }
      return true;
    }
  } catch (err) {
    console.warn(`[SYNC] Failed to push key '${key}' to backend server:`, err);
  }

  return false;
}

/**
 * Langgan kemaskini untuk kunci tertentu
 */
export function subscribeToSyncKey<T>(
  key: string,
  callback: (data: T) => void
): () => void {
  if (!keySubscribers.has(key)) {
    keySubscribers.set(key, new Set());
  }
  const subs = keySubscribers.get(key)!;
  subs.add(callback);

  return () => {
    subs.delete(callback);
    if (subs.size === 0) {
      keySubscribers.delete(key);
    }
  };
}

/**
 * Langgan status ketersambungan penyegerakan (Connected / Disconnected)
 */
export function subscribeToSyncStatus(
  callback: (status: { connected: boolean; lastSync: number }) => void
): () => void {
  statusSubscribers.add(callback);
  callback({ connected: isConnected, lastSync: lastPollTimestamp });
  return () => {
    statusSubscribers.delete(callback);
  };
}

/**
 * Ambil semua data terkini dari pelayan sekali gus (Full Hydration)
 */
export async function fetchAllServerData(): Promise<boolean> {
  if (isSyncInProgress) return false;
  isSyncInProgress = true;

  try {
    const res = await fetch('/api/sync/all');
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        const { data, timestamps } = json;
        isConnected = true;

        for (const [key, val] of Object.entries(data)) {
          const ts = timestamps?.[key] || Date.now();
          handleIncomingUpdate(key, val, ts, 'server_init', 'poll');
        }

        if (json.serverTime) {
          lastPollTimestamp = Math.max(lastPollTimestamp, json.serverTime);
        }

        notifyStatus();
        return true;
      }
    }
  } catch (err) {
    console.warn('[SYNC] Full hydration from server failed:', err);
  } finally {
    isSyncInProgress = false;
  }
  return false;
}

/**
 * Poll sebarang perubahan terkini secara berkala (Fallback jika SSE terputus)
 */
async function pollServerUpdates(): Promise<void> {
  if (isSyncInProgress) return;
  try {
    const res = await fetch(`/api/sync/poll?since=${lastPollTimestamp}`);
    if (res.ok) {
      const json = await res.json();
      if (json && json.hasUpdates && json.updates) {
        isConnected = true;
        for (const [key, item] of Object.entries(json.updates as Record<string, any>)) {
          if (item && item.data !== undefined) {
            handleIncomingUpdate(key, item.data, item.updatedAt || Date.now(), item.updatedBy, 'poll');
          }
        }
      }
      if (json.serverTime) {
        lastPollTimestamp = Math.max(lastPollTimestamp, json.serverTime);
      }
      if (!isConnected) {
        isConnected = true;
        notifyStatus();
      }
    }
  } catch (err) {
    // Network hiccup or server reloading
    isConnected = false;
    notifyStatus();
  }
}

/**
 * Sambung ke aliran Server-Sent Events (SSE) untuk siaran langsung pantas
 */
function connectSse() {
  if (typeof window === 'undefined') return;
  if (eventSource) {
    try {
      eventSource.close();
    } catch {}
    eventSource = null;
  }

  try {
    eventSource = new EventSource('/api/sync/stream');

    eventSource.onopen = () => {
      isConnected = true;
      notifyStatus();
      console.log('[SYNC] Live SSE Stream connected to central server');
    };

    eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'connected') {
          isConnected = true;
          notifyStatus();
        } else if (payload.type === 'update' && payload.key) {
          handleIncomingUpdate(
            payload.key,
            payload.data,
            payload.updatedAt || Date.now(),
            payload.updatedBy,
            'sse'
          );
        }
      } catch (parseErr) {
        console.warn('[SYNC] Failed to parse SSE message:', parseErr);
      }
    };

    eventSource.onerror = () => {
      isConnected = false;
      notifyStatus();
      // Browser EventSource automatically reconnects
    };
  } catch (err) {
    console.warn('[SYNC] Unable to initialize SSE:', err);
    isConnected = false;
    notifyStatus();
  }
}

/**
 * Inisialisasi Universal Sync Engine sekali semasa aplikasi dimulakan
 */
export function initUniversalSync(): () => void {
  if (isInitialized) return () => {};
  isInitialized = true;

  // 1. Dapatkan data penuh awal dari pelayan
  fetchAllServerData();

  // 2. Sambungkan SSE untuk kemaskini langsung segera
  connectSse();

  // 3. Pasang polling berkala (setiap 3.5 saat) sebagai jaminan dwi-lapisan
  pollIntervalId = setInterval(pollServerUpdates, 3500);

  // 4. Semak segera apabila tetingkap aktif semula atau pengguna kembali ke tab
  const onFocus = () => {
    pollServerUpdates();
  };
  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      pollServerUpdates();
    }
  };

  window.addEventListener('focus', onFocus);
  document.addEventListener('visibilitychange', onVisibilityChange);

  // Bersihkan semasa unmount jika perlu
  return () => {
    if (eventSource) {
      try {
        eventSource.close();
      } catch {}
      eventSource = null;
    }
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      pollIntervalId = null;
    }
    window.removeEventListener('focus', onFocus);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    isInitialized = false;
  };
}

/**
 * Hook React Berkuasa: useSyncedData
 * Menggantikan useState & localStorage setempat dengan penyegerakan automatik silang peranti!
 * 
 * Contoh penggunaan:
 * const [rphList, setRphList] = useSyncedData<UbkRphItem[]>('skmp_ubk_rph', initialUbkRph);
 */
export function useSyncedData<T>(
  key: string,
  initialFallback: T
): [T, (valueOrUpdater: T | ((prev: T) => T)) => void, boolean] {
  // 1. Muatkan nilai awal dari storan setempat jika ada
  const [data, setData] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn(`[useSyncedData] Error reading initial value for ${key}:`, e);
    }
    return initialFallback;
  });

  const [isSynced, setIsSynced] = useState(true);
  const dataRef = useRef(data);
  dataRef.current = data;

  // 2. Langgan kemaskini masa nyata untuk kunci ini dari mana-mana peranti
  useEffect(() => {
    const unsubscribe = subscribeToSyncKey<T>(key, (incomingData) => {
      setData(incomingData);
      setIsSynced(true);
    });

    return () => {
      unsubscribe();
    };
  }, [key]);

  // 3. Fungsi kemaskini: simpan secara setempat dan tolak ke pelayan
  const updateData = useCallback(
    (valueOrUpdater: T | ((prev: T) => T)) => {
      const nextValue =
        typeof valueOrUpdater === 'function'
          ? (valueOrUpdater as (prev: T) => T)(dataRef.current)
          : valueOrUpdater;

      setData(nextValue);
      setIsSynced(false);

      // Simpan dan tolak ke pelayan serta-merta
      syncSave(key, nextValue).then((ok) => {
        setIsSynced(ok);
      });
    },
    [key]
  );

  return [data, updateData, isSynced];
}

/**
 * Hook untuk memantau status penyegerakan silang peranti secara langsung
 */
export function useSyncStatus() {
  const [status, setStatus] = useState<{ connected: boolean; lastSync: number }>({
    connected: isConnected,
    lastSync: lastPollTimestamp
  });

  useEffect(() => {
    return subscribeToSyncStatus(setStatus);
  }, []);

  const forceSync = useCallback(async () => {
    await fetchAllServerData();
  }, []);

  return {
    ...status,
    forceSync
  };
}
