const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({
  projectId: 'fitasist-428cc'
});

const auth = getAuth();
const db = getFirestore();

const targetUIDs = [
  "39jBkbqEdTZquAZx1cYV08wVrnm2", // salimovsarvar15@gmail.com
  "UkaYu0SPtFb3v7rCLDYHwfU6vvF2", // salimovsarvar65@gmail.com
  "MteqsHJtf7TtemWSeQuZNfEjl9J2", // forworkuz573@gmail.com
  "KAhrMbq4dTeF5AOdzAowQVR2xYi2", // arzigultrader@gmail.com
];

const subcollections = ["hydration", "measurements", "foodLogs", "chatSessions", "challenges"];

async function deleteUserData(uid) {
  console.log(`\nDeleting data for UID: ${uid}...`);

  // 1. Delete Firestore subcollections
  for (const sub of subcollections) {
    try {
      const snap = await db.collection("users").doc(uid).collection(sub).get();
      for (const doc of snap.docs) {
        await doc.ref.delete();
        console.log(`  - Deleted subcollection document ${sub}/${doc.id}`);
      }
    } catch (e) {
      console.log(`  - Subcollection ${sub} error: ${e.message}`);
    }
  }

  // 2. Delete Firestore main user document
  try {
    await db.collection("users").doc(uid).delete();
    console.log(`  - Deleted Firestore user document: users/${uid}`);
  } catch (e) {
    console.log(`  - Firestore user document error: ${e.message}`);
  }

  // 3. Delete Firebase Auth user
  try {
    await auth.deleteUser(uid);
    console.log(`  - Successfully deleted Auth user: ${uid}`);
  } catch (e) {
    console.log(`  - Auth user delete error: ${e.message}`);
  }
}

async function main() {
  for (const uid of targetUIDs) {
    await deleteUserData(uid);
  }
  console.log("\n✅ All target test accounts fully wiped from Auth and Firestore!");
  process.exit(0);
}

main().catch(err => {
  console.error("Main error:", err);
  process.exit(1);
});
