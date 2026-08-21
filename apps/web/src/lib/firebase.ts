import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  initializeAuth,
  setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with cross-platform persistence
export const auth = (() => {
  const isFirst = getApps().length === 1;
  if (isFirst && Capacitor.isNativePlatform()) {
    try {
      return initializeAuth(app, {
        persistence: indexedDBLocalPersistence,
      });
    } catch {
      return getAuth(app);
    }
  }
  const a = getAuth(app);
  if (!Capacitor.isNativePlatform()) {
    setPersistence(a, browserLocalPersistence).catch(() => {});
  }
  return a;
})();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Firestore singleton instance
export const db = getFirestore(app);
export const storage = getStorage(app);
