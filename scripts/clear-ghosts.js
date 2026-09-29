import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLZjQLs9r1ljtKCuJi0B2dh_FWJ5XFFI8",
  authDomain: "ghost-cursor.firebaseapp.com",
  projectId: "ghost-cursor",
  storageBucket: "ghost-cursor.firebasestorage.app",
  messagingSenderId: "45569433376",
  appId: "1:45569433376:web:3e5730cfd9a50a883d4145",
  measurementId: "G-VBDZBGCKGL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clear() {
  console.log("Exorcising ghosts from Firestore...");
  const colRef = collection(db, "ghostSessions");
  const snap = await getDocs(colRef);
  let count = 0;
  for (const document of snap.docs) {
    await deleteDoc(doc(db, "ghostSessions", document.id));
    count++;
  }
  console.log(`Cleared ${count} ghosts.`);
  process.exit(0);
}

clear().catch((e) => {
  console.error("Clear notice:", e.message);
  process.exit(1);
});
