import { GhostSession } from '../types/ghost';

export const INITIAL_SEEDED_GHOSTS: GhostSession[] = [
  {
    id: "seed_ghost_01",
    visitorId: "visitor_42",
    visitorNumber: 42,
    createdAt: Date.now() - 1000 * 60 * 18, // 18 mins ago
    duration: 16000,
    viewport: { width: 1440, height: 900 },
    personality: 'curious',
    color: '#a5b4fc', // ethereal lavender-indigo
    path: [
      { x: 0.15, y: 0.20, t: 0 },
      { x: 0.22, y: 0.28, t: 600 },
      { x: 0.35, y: 0.33, t: 1400 },
      { x: 0.48, y: 0.35, t: 2200 },
      { x: 0.50, y: 0.36, t: 3200 }, // lingering on header
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
    id: "seed_ghost_02",
    visitorId: "visitor_17",
    visitorNumber: 17,
    createdAt: Date.now() - 1000 * 60 * 45, // 45 mins ago
    duration: 12000,
    viewport: { width: 1920, height: 1080 },
    personality: 'fast',
    color: '#67e8f9', // cyan wisp
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
    id: "seed_ghost_03",
    visitorId: "visitor_09",
    visitorNumber: 9,
    createdAt: Date.now() - 1000 * 60 * 120, // 2 hours ago
    duration: 20000,
    viewport: { width: 1366, height: 768 },
    personality: 'hesitant',
    color: '#cbd5e1', // phantom silver
    path: [
      { x: 0.30, y: 0.70, t: 0 },
      { x: 0.32, y: 0.68, t: 1000 },
      { x: 0.33, y: 0.65, t: 3500 }, // long hesitation pause
      { x: 0.36, y: 0.58, t: 5500 },
      { x: 0.40, y: 0.52, t: 7000 },
      { x: 0.40, y: 0.52, t: 11000 }, // another long thoughtful pause
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
    id: "seed_ghost_04",
    visitorId: "visitor_53",
    visitorNumber: 53,
    createdAt: Date.now() - 1000 * 60 * 8, // 8 mins ago
    duration: 15000,
    viewport: { width: 1536, height: 864 },
    personality: 'clicker',
    color: '#fbcfe8', // spectral rose
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
    id: "seed_ghost_05",
    visitorId: "visitor_31",
    visitorNumber: 31,
    createdAt: Date.now() - 1000 * 60 * 240, // 4 hours ago
    duration: 22000,
    viewport: { width: 1440, height: 900 },
    personality: 'wanderer',
    color: '#99f6e4', // ethereal teal
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
    id: "seed_ghost_06",
    visitorId: "visitor_64",
    visitorNumber: 64,
    createdAt: Date.now() - 1000 * 60 * 3, // 3 mins ago
    duration: 10000,
    viewport: { width: 1280, height: 800 },
    personality: 'mysterious',
    color: '#fed7aa', // amber soul ember
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
    id: "seed_ghost_07",
    visitorId: "visitor_78",
    visitorNumber: 78,
    createdAt: Date.now() - 1000 * 60 * 35, // 35 mins ago
    duration: 18000,
    viewport: { width: 1600, height: 900 },
    personality: 'playful',
    color: '#e9d5ff', // spectral violet
    path: [
      { x: 0.20, y: 0.30, t: 0 },
      { x: 0.24, y: 0.26, t: 800 },
      { x: 0.28, y: 0.32, t: 1600 },
      { x: 0.22, y: 0.36, t: 2400 },
      { x: 0.20, y: 0.30, t: 3200 }, // drew a circle
      { x: 0.45, y: 0.65, t: 6500 },
      { x: 0.50, y: 0.60, t: 7500 },
      { x: 0.55, y: 0.66, t: 8500 },
      { x: 0.48, y: 0.70, t: 9500 },
      { x: 0.45, y: 0.65, t: 10500 }, // second circle
      { x: 0.80, y: 0.35, t: 14000 },
      { x: 0.20, y: 0.30, t: 18000 }
    ],
    clicks: [
      { x: 0.20, y: 0.30, t: 3300 },
      { x: 0.45, y: 0.65, t: 10600 }
    ]
  },
  {
    id: "seed_ghost_08",
    visitorId: "visitor_88",
    visitorNumber: 88,
    createdAt: Date.now() - 1000 * 45, // 45 seconds ago (very recent!)
    duration: 14000,
    viewport: { width: 1920, height: 1080 },
    personality: 'curious',
    color: '#fef08a', // pale starlight
    path: [
      { x: 0.60, y: 0.75, t: 0 },
      { x: 0.55, y: 0.62, t: 1200 },
      { x: 0.52, y: 0.48, t: 2500 },
      { x: 0.50, y: 0.38, t: 4000 }, // right towards the title
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
