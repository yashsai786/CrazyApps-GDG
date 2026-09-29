import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, query, orderBy, limit } from "firebase/firestore";

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

async function verify() {
  console.log("Verifying Firestore ghostSessions...");
  const q = query(collection(db, "ghostSessions"), orderBy("createdAt", "desc"), limit(20));
  const snap = await getDocs(q);

  console.log(`Found ${snap.size} ghosts in Firestore:`);
  snap.docs.forEach((doc, idx) => {
    const data = doc.data();
    console.log(
      `[#${idx + 1}] ID: ${doc.id} | Visitor: ${data.visitorId} (#${data.visitorNumber}) | Path points: ${data.path?.length} | Clicks: ${data.clicks?.length} | Personality: ${data.personality}`
    );
  });

  if (snap.size >= 8) {
    console.log("SUCCESS: Initial seed ghosts are active in production Firestore database!");
  } else {
    console.warn("WARNING: Fewer than 8 ghosts detected.");
  }

  process.exit(0);
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
