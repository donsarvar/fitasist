const { initializeApp } = require("firebase/app");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, doc, deleteDoc, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDmi_uljgEwws0ZePxhuW1sENcy8j9yZBE",
  authDomain: "fitasist-428cc.firebaseapp.com",
  projectId: "fitasist-428cc",
  storageBucket: "fitasist-428cc.firebasestorage.app",
  messagingSenderId: "142746402504",
  appId: "1:142746402504:web:c28206871e0f065ee16ffd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const targetUIDs = [
  "39jBkbqEdTZquAZx1cYV08wVrnm2", // salimovsarvar15@gmail.com
  "UkaYu0SPtFb3v7rCLDYHwfU6vvF2", // salimovsarvar65@gmail.com
  "MteqsHJtf7TtemWSeQuZNfEjl9J2", // forworkuz573@gmail.com
  "KAhrMbq4dTeF5AOdzAowQVR2xYi2", // arzigultrader@gmail.com
];

const subcollections = ["hydration", "measurements", "foodLogs", "chatSessions", "challenges"];

async function deleteUserSubcollections(uid) {
  console.log(`Cleaning data for UID: ${uid}...`);
  for (const sub of subcollections) {
    try {
      const snap = await getDocs(collection(db, "users", uid, sub));
      for (const d of snap.docs) {
        await deleteDoc(doc(db, "users", uid, sub, d.id));
        console.log(`  Deleted ${sub}/${d.id}`);
      }
    } catch (e) {
      console.log(`  No ${sub} or error:`, e.message);
    }
  }
  try {
    await deleteDoc(doc(db, "users", uid));
    console.log(`  Deleted document users/${uid}`);
  } catch (e) {
    console.log(`  Error deleting user doc:`, e.message);
  }
}

async function main() {
  for (const uid of targetUIDs) {
    await deleteUserSubcollections(uid);
  }
  console.log("All target test user Firestore data successfully wiped!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
