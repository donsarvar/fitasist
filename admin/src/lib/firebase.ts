import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDmi_uljgEwws0ZePxhuW1sENcy8j9yZBE',
  authDomain: 'fitasist-428cc.firebaseapp.com',
  projectId: 'fitasist-428cc',
  storageBucket: 'fitasist-428cc.firebasestorage.app',
  messagingSenderId: '142746402504',
  appId: '1:142746402504:web:c28206871e0f065ee16ffd',
  measurementId: 'G-E4GV4M5FTB',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
