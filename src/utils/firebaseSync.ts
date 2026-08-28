import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const FIREBASE_CONFIG_KEY = 'skmp_firebase_config_v1';
const FIREBASE_STATUS_KEY = 'skmp_firebase_enabled_v1';

let firebaseAppInstance: FirebaseApp | null = null;
let firestoreDbInstance: Firestore | null = null;

export function getSavedFirebaseConfig(): FirebaseCustomConfig | null {
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
  return null;
}

export function saveFirebaseConfig(config: FirebaseCustomConfig): void {
  try {
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
    // Reset cached instance to re-init
    firebaseAppInstance = null;
    firestoreDbInstance = null;
  } catch (e) {
    console.error('Failed to save Firebase config:', e);
  }
}

export function isFirebaseEnabled(): boolean {
  try {
    const status = localStorage.getItem(FIREBASE_STATUS_KEY);
    if (status === 'false') return false;
    const config = getSavedFirebaseConfig();
    return !!(config && config.projectId && config.apiKey);
  } catch {
    return false;
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
  if (firestoreDbInstance) return firestoreDbInstance;
  const config = getSavedFirebaseConfig();
  if (!config || !config.projectId || !config.apiKey) return null;

  try {
    const apps = getApps();
    if (apps.length > 0) {
      firebaseAppInstance = apps[0];
    } else {
      firebaseAppInstance = initializeApp(config);
    }
    firestoreDbInstance = getFirestore(firebaseAppInstance);
    return firestoreDbInstance;
  } catch (err) {
    console.error('Error initializing Firebase / Firestore:', err);
    return null;
  }
}

export {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
};
