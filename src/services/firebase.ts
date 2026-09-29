import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, signInAnonymously, Auth } from "firebase/auth";

// Web app's Firebase configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyDLZjQLs9r1ljtKCuJi0B2dh_FWJ5XFFI8",
  authDomain: "ghost-cursor.firebaseapp.com",
  projectId: "ghost-cursor",
  storageBucket: "ghost-cursor.firebasestorage.app",
  messagingSenderId: "45569433376",
  appId: "1:45569433376:web:3e5730cfd9a50a883d4145",
  measurementId: "G-VBDZBGCKGL"
};

let app: FirebaseApp;
let db: Firestore | null = null;
let auth: Auth | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
  
  // Try anonymous sign in silently if available
  signInAnonymously(auth).catch((err) => {
    console.warn("[GhostFirebase] Anonymous auth notice:", err.message);
  });
} catch (e) {
  console.warn("[GhostFirebase] Init notice:", e);
}

export { app, db, auth };
