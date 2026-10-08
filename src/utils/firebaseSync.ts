import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDocs as firestoreGetDocs,
  getDoc as firestoreGetDoc,
  setDoc as firestoreSetDoc,
  updateDoc as firestoreUpdateDoc,
  deleteDoc as firestoreDeleteDoc,
  onSnapshot as firestoreOnSnapshot,
  query,
  orderBy,
  limit,
  setLogLevel
} from 'firebase/firestore';

// Matikan log dalaman Firestore serta-merta untuk mengelakkan ralat spam di konsol apabila kuota dicapai
try {
  setLogLevel('silent');
} catch {}

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export const DEFAULT_FIREBASE_CONFIG: FirebaseCustomConfig = {
  apiKey: "AIzaSyCSiNMVretZhkqS3_oZzA1Lf1kDsAHUavQ",
  authDomain: "sk-merbau-pulas-db.firebaseapp.com",
  projectId: "sk-merbau-pulas-db",
  storageBucket: "sk-merbau-pulas-db.firebasestorage.app",
  messagingSenderId: "683640600208",
  appId: "1:683640600208:web:6b2a4776319c1e4dab8a15"
};

const FIREBASE_CONFIG_KEY = 'skmp_firebase_config_v1';
const FIREBASE_STATUS_KEY = 'skmp_firebase_enabled_v1';

let firebaseAppInstance: FirebaseApp | null = null;
let firestoreDbInstance: Firestore | null = null;

// ==========================================
// FIRESTORE QUOTA CIRCUIT BREAKER
// Mencegah ralat [resource-exhausted]: Quota exceeded
// daripada menghentikan aplikasi atau spamming loop backoff
// ==========================================
let quotaExhausted = false;
let quotaExhaustedUntil = 0;
const activeFirestoreListeners = new Set<() => void>();

export function isQuotaError(err: any): boolean {
  if (!err) return false;
  const code = String(err.code || '');
  const msg = String(err.message || '');
  return (
    code.includes('resource-exhausted') ||
    code.includes('quota-exceeded') ||
    msg.toLowerCase().includes('quota exceeded') ||
    msg.toLowerCase().includes('resource-exhausted') ||
    msg.toLowerCase().includes('resource_exhausted')
  );
}

export function isFirestoreQuotaExhausted(): boolean {
  if (!quotaExhausted) {
    try {
      let stored: string | null = null;
      if (typeof localStorage !== 'undefined') {
        stored = localStorage.getItem('skmp_firestore_quota_until');
      }
      if (!stored && typeof sessionStorage !== 'undefined') {
        stored = sessionStorage.getItem('skmp_firestore_quota_until');
      }
      if (stored) {
        const until = parseInt(stored, 10);
        if (Date.now() < until) {
          quotaExhausted = true;
          quotaExhaustedUntil = until;
          return true;
        } else {
          if (typeof localStorage !== 'undefined') localStorage.removeItem('skmp_firestore_quota_until');
          if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('skmp_firestore_quota_until');
        }
      }
    } catch {}
    return false;
  }
  if (Date.now() > quotaExhaustedUntil) {
    quotaExhausted = false;
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem('skmp_firestore_quota_until');
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('skmp_firestore_quota_until');
    } catch {}
    return false;
  }
  return true;
}

export function markFirestoreQuotaExhausted(durationMs = 2 * 60 * 60 * 1000): void {
  quotaExhausted = true;
  quotaExhaustedUntil = Date.now() + durationMs;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('skmp_firestore_quota_until', quotaExhaustedUntil.toString());
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('skmp_firestore_quota_until', quotaExhaustedUntil.toString());
    }
  } catch {}

  // Nyahlanggan (unsubscribe) serta-merta kesemua pendengar aktif untuk henti gelung backoff SDK
  activeFirestoreListeners.forEach((unsub) => {
    try {
      unsub();
    } catch {}
  });
  activeFirestoreListeners.clear();

  console.info(
    '[FIRESTORE QUOTA GUARD] Kuota Firestore Spark dicapai. Beralih ke Storan Pelayan Tempatan & Google Sheets secara lancar tanpa ralat.'
  );
}

export function getSavedFirebaseConfig(): FirebaseCustomConfig {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.projectId && parsed.apiKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read Firebase config from storage:', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config: FirebaseCustomConfig): void {
  try {
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
    // Reset cached instance to re-init
    firebaseAppInstance = null;
    firestoreDbInstance = null;
    quotaExhausted = false;
  } catch (e) {
    console.error('Failed to save Firebase config:', e);
  }
}

export function isFirebaseEnabled(): boolean {
  if (isFirestoreQuotaExhausted()) {
    return false;
  }
  try {
    const status = localStorage.getItem(FIREBASE_STATUS_KEY);
    if (status === 'false') return false;
    return true;
  } catch {
    return true;
  }
}

export function setFirebaseEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(FIREBASE_STATUS_KEY, enabled ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to set firebase status:', e);
  }
}

export function getFirebaseDb(): Firestore | null {
  if (isFirestoreQuotaExhausted()) {
    return null;
  }
  if (firestoreDbInstance) return firestoreDbInstance;
  const config = getSavedFirebaseConfig();
  if (!config || !config.projectId || !config.apiKey) return null;

  try {
    // Silence internal Firestore SDK retry and backoff logs
    try {
      setLogLevel('silent');
    } catch {}

    const apps = getApps();
    if (apps.length > 0) {
      firebaseAppInstance = apps[0];
    } else {
      firebaseAppInstance = initializeApp(config);
    }
    firestoreDbInstance = getFirestore(firebaseAppInstance);
    return firestoreDbInstance;
  } catch (err) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExhausted();
    }
    console.error('Error initializing Firebase / Firestore:', err);
    return null;
  }
}

// ==========================================
// SAFE OPERATION WRAPPERS WITH CIRCUIT BREAKER
// ==========================================

export function onSnapshot(...args: any[]): () => void {
  if (isFirestoreQuotaExhausted()) {
    return () => {};
  }

  let unsub: (() => void) | null = null;
  let isUnsubscribed = false;

  const callArgs = [...args];
  const lastIdx = callArgs.length - 1;
  const hasErrorHandler = typeof callArgs[lastIdx] === 'function' && lastIdx >= 2;
  const originalOnError = hasErrorHandler ? callArgs[lastIdx] : null;

  const removeSelf = () => {
    if (!isUnsubscribed) {
      isUnsubscribed = true;
      if (unsub) {
        activeFirestoreListeners.delete(unsub);
        try {
          unsub();
        } catch {}
      }
    }
  };

  const wrappedOnError = (err: any) => {
    if (isQuotaError(err)) {
      markFirestoreQuotaExhausted();
      removeSelf();
      return;
    }
    if (originalOnError) {
      try {
        originalOnError(err);
      } catch {}
    }
  };

  if (hasErrorHandler) {
    callArgs[lastIdx] = wrappedOnError;
  } else if (callArgs.length >= 2 && typeof callArgs[callArgs.length - 1] === 'function') {
    callArgs.push(wrappedOnError);
  }

  try {
    unsub = (firestoreOnSnapshot as any)(...callArgs);
    if (unsub && typeof unsub === 'function') {
      activeFirestoreListeners.add(unsub);
    }
    return removeSelf;
  } catch (err) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExhausted();
    }
    return () => {};
  }
}

export async function getDocs(...args: any[]): Promise<any> {
  if (isFirestoreQuotaExhausted()) {
    return { empty: true, docs: [], forEach: () => {} };
  }
  try {
    return await (firestoreGetDocs as any)(...args);
  } catch (err) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExhausted();
      return { empty: true, docs: [], forEach: () => {} };
    }
    throw err;
  }
}

export async function getDoc(...args: any[]): Promise<any> {
  if (isFirestoreQuotaExhausted()) {
    return { exists: () => false, data: () => null };
  }
  try {
    return await (firestoreGetDoc as any)(...args);
  } catch (err) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExhausted();
      return { exists: () => false, data: () => null };
    }
    throw err;
  }
}

export async function setDoc(...args: any[]): Promise<any> {
  if (isFirestoreQuotaExhausted()) {
    return;
  }
  try {
    return await (firestoreSetDoc as any)(...args);
  } catch (err) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExhausted();
      return;
    }
    throw err;
  }
}

export async function updateDoc(...args: any[]): Promise<any> {
  if (isFirestoreQuotaExhausted()) {
    return;
  }
  try {
    return await (firestoreUpdateDoc as any)(...args);
  } catch (err) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExhausted();
      return;
    }
    throw err;
  }
}

export async function deleteDoc(...args: any[]): Promise<any> {
  if (isFirestoreQuotaExhausted()) {
    return;
  }
  try {
    return await (firestoreDeleteDoc as any)(...args);
  } catch (err) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExhausted();
      return;
    }
    throw err;
  }
}

export {
  collection,
  doc,
  query,
  orderBy,
  limit
};
