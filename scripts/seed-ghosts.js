import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";

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

const SEED_GHOSTS = [
  {
    visitorId: "visitor_42",
    visitorNumber: 42,
    createdAt: Date.now() - 1000 * 60 * 18,
    duration: 16000,
    viewport: { width: 1440, height: 900 },
    personality: 'curious',
    color: '#a5b4fc',
    path: [
      { x: 0.15, y: 0.20, t: 0 },
      { x: 0.22, y: 0.28, t: 600 },
      { x: 0.35, y: 0.33, t: 1400 },
      { x: 0.48, y: 0.35, t: 2200 },
      { x: 0.50, y: 0.36, t: 3200 },
      { x: 0.52, y: 0.35, t: 4500 },
      { x: 0.62, y: 0.32, t: 5600 },
      { x: 0.78, y: 0.25, t: 7000 },
      { x: 0.88, y: 0.22, t: 8400 },
      { x: 0.82, y: 0.45, t: 9800 },
      { x: 0.65, y: 0.68, t: 11400 },
      { x: 0.42, y: 0.74, t: 13000 },
      { x: 0.25, y: 0.52, t: 14600 },
      { x: 0.15, y: 0.20, t: 16000 }
    ],
    clicks: [
      { x: 0.50, y: 0.36, t: 3400 },
      { x: 0.88, y: 0.22, t: 8600 }
    ]
  },
  {
    visitorId: "visitor_17",
    visitorNumber: 17,
    createdAt: Date.now() - 1000 * 60 * 45,
    duration: 12000,
    viewport: { width: 1920, height: 1080 },
    personality: 'fast',
    color: '#67e8f9',
    path: [
      { x: 0.85, y: 0.85, t: 0 },
      { x: 0.70, y: 0.60, t: 500 },
      { x: 0.45, y: 0.40, t: 1200 },
      { x: 0.20, y: 0.25, t: 2100 },
      { x: 0.12, y: 0.48, t: 3000 },
      { x: 0.35, y: 0.75, t: 4200 },
      { x: 0.60, y: 0.80, t: 5500 },
      { x: 0.75, y: 0.35, t: 6800 },
      { x: 0.82, y: 0.18, t: 8000 },
      { x: 0.50, y: 0.22, t: 9200 },
      { x: 0.30, y: 0.60, t: 10500 },
      { x: 0.85, y: 0.85, t: 12000 }
    ],
    clicks: [
      { x: 0.20, y: 0.25, t: 2200 },
      { x: 0.75, y: 0.35, t: 6900 }
    ]
  },
  {
    visitorId: "visitor_09",
    visitorNumber: 9,
    createdAt: Date.now() - 1000 * 60 * 120,
    duration: 20000,
    viewport: { width: 1366, height: 768 },
    personality: 'hesitant',
    color: '#cbd5e1',
    path: [
      { x: 0.30, y: 0.70, t: 0 },
      { x: 0.32, y: 0.68, t: 1000 },
      { x: 0.33, y: 0.65, t: 3500 },
      { x: 0.36, y: 0.58, t: 5500 },
      { x: 0.40, y: 0.52, t: 7000 },
      { x: 0.40, y: 0.52, t: 11000 },
      { x: 0.44, y: 0.48, t: 13000 },
      { x: 0.47, y: 0.45, t: 14500 },
      { x: 0.42, y: 0.60, t: 17000 },
      { x: 0.30, y: 0.70, t: 20000 }
    ],
    clicks: [
      { x: 0.40, y: 0.52, t: 7200 }
    ]
  },
  {
    visitorId: "visitor_53",
    visitorNumber: 53,
    createdAt: Date.now() - 1000 * 60 * 8,
    duration: 15000,
    viewport: { width: 1536, height: 864 },
    personality: 'clicker',
    color: '#fbcfe8',
    path: [
      { x: 0.55, y: 0.20, t: 0 },
      { x: 0.50, y: 0.32, t: 1200 },
      { x: 0.51, y: 0.33, t: 2200 },
      { x: 0.68, y: 0.45, t: 4000 },
      { x: 0.72, y: 0.55, t: 5800 },
      { x: 0.40, y: 0.62, t: 7800 },
      { x: 0.28, y: 0.40, t: 9800 },
      { x: 0.35, y: 0.25, t: 11800 },
      { x: 0.55, y: 0.20, t: 15000 }
    ],
    clicks: [
      { x: 0.51, y: 0.33, t: 2300 },
      { x: 0.72, y: 0.55, t: 6000 },
      { x: 0.40, y: 0.62, t: 8000 },
      { x: 0.28, y: 0.40, t: 10000 }
    ]
  },
  {
    visitorId: "visitor_31",
    visitorNumber: 31,
    createdAt: Date.now() - 1000 * 60 * 240,
    duration: 22000,
    viewport: { width: 1440, height: 900 },
    personality: 'wanderer',
    color: '#99f6e4',
    path: [
      { x: 0.10, y: 0.85, t: 0 },
      { x: 0.18, y: 0.70, t: 2000 },
      { x: 0.25, y: 0.55, t: 4200 },
      { x: 0.38, y: 0.45, t: 6800 },
      { x: 0.58, y: 0.48, t: 9500 },
      { x: 0.75, y: 0.60, t: 12500 },
      { x: 0.88, y: 0.78, t: 15500 },
      { x: 0.70, y: 0.88, t: 18500 },
      { x: 0.35, y: 0.90, t: 20500 },
      { x: 0.10, y: 0.85, t: 22000 }
    ],
    clicks: [
      { x: 0.38, y: 0.45, t: 7000 }
    ]
  },
  {
    visitorId: "visitor_64",
    visitorNumber: 64,
    createdAt: Date.now() - 1000 * 60 * 3,
    duration: 10000,
    viewport: { width: 1280, height: 800 },
    personality: 'mysterious',
    color: '#fed7aa',
    path: [
      { x: 0.48, y: 0.15, t: 0 },
      { x: 0.52, y: 0.22, t: 1200 },
      { x: 0.49, y: 0.30, t: 2600 },
      { x: 0.53, y: 0.38, t: 4200 },
      { x: 0.50, y: 0.45, t: 5800 },
      { x: 0.46, y: 0.32, t: 7400 },
      { x: 0.48, y: 0.15, t: 10000 }
    ],
    clicks: [
      { x: 0.50, y: 0.45, t: 6000 }
    ]
  },
  {
    visitorId: "visitor_78",
    visitorNumber: 78,
    createdAt: Date.now() - 1000 * 60 * 35,
    duration: 18000,
    viewport: { width: 1600, height: 900 },
    personality: 'playful',
    color: '#e9d5ff',
    path: [
      { x: 0.20, y: 0.30, t: 0 },
      { x: 0.24, y: 0.26, t: 800 },
      { x: 0.28, y: 0.32, t: 1600 },
      { x: 0.22, y: 0.36, t: 2400 },
      { x: 0.20, y: 0.30, t: 3200 },
      { x: 0.45, y: 0.65, t: 6500 },
      { x: 0.50, y: 0.60, t: 7500 },
      { x: 0.55, y: 0.66, t: 8500 },
      { x: 0.48, y: 0.70, t: 9500 },
      { x: 0.45, y: 0.65, t: 10500 },
      { x: 0.80, y: 0.35, t: 14000 },
      { x: 0.20, y: 0.30, t: 18000 }
    ],
    clicks: [
      { x: 0.20, y: 0.30, t: 3300 },
      { x: 0.45, y: 0.65, t: 10600 }
    ]
  },
  {
    visitorId: "visitor_88",
    visitorNumber: 88,
    createdAt: Date.now() - 1000 * 45,
    duration: 14000,
    viewport: { width: 1920, height: 1080 },
    personality: 'curious',
    color: '#fef08a',
    path: [
      { x: 0.60, y: 0.75, t: 0 },
      { x: 0.55, y: 0.62, t: 1200 },
      { x: 0.52, y: 0.48, t: 2500 },
      { x: 0.50, y: 0.38, t: 4000 },
      { x: 0.51, y: 0.37, t: 6000 },
      { x: 0.42, y: 0.30, t: 8000 },
      { x: 0.32, y: 0.25, t: 10000 },
      { x: 0.45, y: 0.50, t: 12000 },
      { x: 0.60, y: 0.75, t: 14000 }
    ],
    clicks: [
      { x: 0.51, y: 0.37, t: 6200 }
    ]
  }
];

async function seed() {
  console.log("👻 Summoning spirits into Firestore ghostSessions...");
  const colRef = collection(db, "ghostSessions");

  for (const ghost of SEED_GHOSTS) {
    try {
      const docRef = await addDoc(colRef, ghost);
      console.log(`✓ Seeded ${ghost.visitorId} (#${ghost.visitorNumber}) -> Doc ID: ${docRef.id}`);
    } catch (err) {
      console.error(`✗ Error seeding ${ghost.visitorId}:`, err.message);
    }
  }

  console.log("\n✨ Seeding complete. All 8 spirits now haunt the database.");
  process.exit(0);
}

seed();
