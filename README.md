# CrazyApps GDG — Dual Perspective Experiment 👻 ✦

> *"One might actually help someone. The other is completely useless."*

A single cohesive web application offering two deliberately contrasting experiences accessible from a unified landing portal.

---

## 🌟 Experiences

### 1. ✦ USEFUL: ABSENT (AI Visual Gap Auditor)
An AI-powered physical infrastructure auditor that looks for what appears to be **missing, inaccessible, obstructed, or inadequate**.
- **♿ Accessibility**: Ramps, step-free access, tactile ground indicators, handrails, accessible signage, and lift access.
- **⚠ Safety**: Emergency exit signage, fire extinguishers, obstructed egress routes, hazard warnings.
- **♻ Sustainability**: Waste sorting/recycling bins, water refill stations, pedestrian pathways, bike racks.
- **Powered by**: Groq Vision 27B (`qwen/qwen3.8-27b`) via secure server-side endpoint.
- **Privacy First**: Zero permanent image storage; live viewfinder runs 100% locally.

### 2. 👻 NOT USEFUL: Ghost Cursors (Digital Séance)
An artistic interactive digital séance where every visitor leaves behind a wandering ghost cursor that replays their journey for future visitors.
- **60 FPS Canvas Engine**: Catmull-Rom spline interpolation, smooth luminous trails, organic opacity variations.
- **Interactive Proximity**: Ghosts hesitate and drift away when approached (*"The ghost noticed me"*).
- **Click Replays & Soundscape**: Recorded clicks emit expanding ripples accompanied by Web Audio harmonic chimes.
- **Persistence**: Real-time Firebase Firestore synchronization (`ghostSessions`).
- **Cursor Skin Switcher**: Seamlessly switch your pointer between `👻 Ghost` and `↖ Normal`.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Vanilla CSS Design System
- **AI Backend**: Groq Vision (`qwen/qwen3.8-27b`) via server-side `/api/analyze`
- **Database**: Firebase Firestore (anonymous session recording & realtime subscriptions)
- **Audio**: Web Audio API ambient drone and resonance chime

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/yashsai786/CrazyApps-GDG.git
cd CrazyApps-GDG
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Run Locally
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Seed Ghost Data (Optional)
```bash
npm run seed:ghosts
```

---

## 🌐 Deployment Notes (Hosting)

- **Vercel / Netlify / Cloudflare Pages**:
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Environment Variable: Set `GROQ_API_KEY` in your hosting dashboard.
  - If deploying as a full-stack serverless app, the `/api/analyze` endpoint can be hosted as a serverless function (e.g. Next.js, Vercel Serverless Function, or Express server).

---

## 👨‍💻 Author

Made with ♥ by **Yash Gangwani** for **GDG**.
