import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, indexedDBLocalPersistence, initializeAuth } from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Capacitor } from "@capacitor/core";

const firebaseConfig = {
  apiKey: "AIzaSyDmi_uljgEwws0ZePxhuW1sENcy8j9yZBE",
  authDomain: "fitasist-428cc.firebaseapp.com",
  projectId: "fitasist-428cc",
  storageBucket: "fitasist-428cc.firebasestorage.app",
  messagingSenderId: "142746402504",
  appId: "1:142746402504:web:c28206871e0f065ee16ffd",
  measurementId: "G-E4GV4M5FTB",
};

// Initialize Firebase safely — one instance for the entire page lifetime
const isFirstInit = getApps().length === 0;
const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth:
// - First time + native platform: use indexedDBLocalPersistence (session saqlanadi)
// - Otherwise: getAuth() returns already-initialized instance
export const auth = (() => {
  if (isFirstInit && Capacitor.isNativePlatform()) {
    return initializeAuth(app, {
      persistence: indexedDBLocalPersistence,
    });
  }
  return getAuth(app);
})();

export const googleProvider = new GoogleAuthProvider();

// Module-level singleton guard — prevents "Database is closing/hidden" error
let _db: ReturnType<typeof getFirestore> | null = null;

function getDb() {
  if (_db) return _db;
  try {
    _db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentSingleTabManager({ forceOwnership: true }),
      }),
    });
  } catch {
    _db = getFirestore(app);
  }
  return _db;
}

export const db = getDb();
export const storage = getStorage(app);
