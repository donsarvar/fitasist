import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDmi_uljgEwws0ZePxhuW1sENcy8j9yZBE",
  authDomain: "fitasist-428cc.firebaseapp.com",
  projectId: "fitasist-428cc",
  storageBucket: "fitasist-428cc.firebasestorage.app",
  messagingSenderId: "142746402504",
  appId: "1:142746402504:web:c28206871e0f065ee16ffd",
  measurementId: "G-E4GV4M5FTB",
};

// Initialize Firebase safely — prevent double init
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with offline cache — safely wrapped so it never crashes
// If initializeFirestore was already called (e.g. HMR / module re-eval), fall back to getFirestore
function createDb() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    // Already initialized — just return the existing instance
    return getFirestore(app);
  }
}

export const db = createDb();

// Initialize Storage
export const storage = getStorage(app);
