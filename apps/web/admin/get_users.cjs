const { initializeApp } = require("firebase/app");
const { getAuth, signInAnonymously } = require("firebase/auth");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDmi_uljgEwws0ZePxhuW1sENcy8j9yZBE",
  authDomain: "fitasist-428cc.firebaseapp.com",
  projectId: "fitasist-428cc",
  storageBucket: "fitasist-428cc.firebasestorage.app",
  messagingSenderId: "142746402504",
  appId: "1:142746402504:web:c28206871e0f065ee16ffd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  await signInAnonymously(auth);
  console.log("Authenticated anonymously as UID:", auth.currentUser?.uid);

  const querySnapshot = await getDocs(collection(db, "users"));
  const users = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.profile) {
      users.push({
        uid: doc.id,
        fio: data.profile.fio,
        email: data.profile.email || "Google / Telefon orqali",
        gender: data.profile.gender === 'male' ? 'Erkak' : 'Ayol',
        height: data.profile.height ? `${data.profile.height} sm` : '-',
        weight: data.profile.weight ? `${data.profile.weight} kg` : '-',
        bodyType: data.profile.bodyType === 'skinny' ? 'Ozg\'in' : data.profile.bodyType === 'bulk' ? 'Semiz/Vaznli' : 'O\'rtacha',
        activity: data.profile.activity === 'athlete' ? 'Sportchi' : data.profile.activity === 'active' ? 'Aktiv' : 'Kam harakat',
        createdAt: data.profile.createdAt ? new Date(data.profile.createdAt).toLocaleDateString('uz-UZ') : '-',
      });
    }
  });
  console.log("FETCHED_USERS_START");
  console.log(JSON.stringify(users, null, 2));
  console.log("FETCHED_USERS_END");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
