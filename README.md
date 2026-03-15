# 🔦 Beacon — Universal Accessibility Companion

> **Kentucky TSA Software Development 2025**  
> Four tools. Two disabilities. Zero API keys.

Beacon is a multi-feature accessibility web app that runs **entirely in your browser** — no accounts, no API keys, no data ever sent to any server. It addresses both vision and hearing disabilities through four genuinely different tools, each using a different browser technology.

---

## ✨ Four Features

### 👁 Text Scanner — *Vision*
Photograph any printed text — signs, menus, medicine bottles, mail, labels — and Beacon reads every word aloud. Powered by **Tesseract.js**, an open-source OCR engine that runs on your device. Includes a Reading Mode for large, clear text display.

**Tech used:** Tesseract.js (open-source OCR via CDN), Web Speech API (text-to-speech)

### 👂 Live Captions — *Hearing*
Words appear on screen **as they are being spoken** in real time. Three font sizes for different vision needs. Full transcript history with export. Perfect for conversations, classrooms, lectures, and meetings.

**Tech used:** Web Speech API (SpeechRecognition — built into Chrome/Edge)

### 🎨 Color Finder — *Vision*
Photograph any object and Beacon identifies its dominant colors by name — not just "blue" but "Navy Blue" or "Royal Blue." Reads the result aloud: *"This appears to be a forest green item with cream and tan details."* Ideal for clothing identification.

**Tech used:** Canvas API (pixel sampling + color quantization), custom nearest-neighbor color naming algorithm

### 🔊 Sound View — *Hearing*
A real-time frequency spectrum visualizer that lets deaf and hard-of-hearing users **see** their audio environment. Automatically classifies sound as Silence, Speech Detected, Sharp Sound, Low Frequency, Background Sound, or Very Loud — with a screen flash alert for sudden loud noise.

**Tech used:** Web Audio API (AudioContext + AnalyserNode), Canvas API (real-time rendering)

---

## 🚀 How to Run

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher (LTS recommended)
- Chrome or Edge browser (required for Live Captions)

### Installation & Start

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/beacon.git
cd beacon

# 2. Install dependencies (React + Vite only — no AI packages needed)
npm install

# 3. Start the app
npm run dev
```

Open **Chrome** or **Edge** and go to `http://localhost:5173`

**No API key. No login. No setup. It just works.**

---

## 📖 How to Use Each Feature

### Text Scanner
1. Go to the **Text Scanner** tab
2. Upload a photo or use your camera
3. Click **Scan Text** — a progress bar shows OCR running
4. The extracted text appears and is read aloud automatically
5. Switch to **Reading Mode** for a large, clean text view
6. Copy or Export the text as needed

> **Note:** The first scan downloads Tesseract's language model (~10MB, cached after that). Subsequent scans are instant.

### Live Captions
1. Go to the **Live Captions** tab (Chrome or Edge required)
2. Click **Start Captions** and allow microphone access
3. Speak — words appear on screen in real time
4. Adjust font size with the A buttons (small/medium/large)
5. Export the full transcript as a text file

### Color Finder
1. Go to the **Color Finder** tab
2. Upload or photograph any item
3. Click **Find Colors** — results appear instantly
4. Hear the spoken summary: *"This appears to be a navy blue item with white and gray details"*

### Sound View
1. Go to the **Sound View** tab
2. Click **Start Visualizer** and allow microphone access
3. Watch the frequency bars — the classification badge updates in real time
4. A red flash alerts when sound is very loud

---

## 🗂️ Project Structure

```
beacon/
├── index.html          # Loads app + Tesseract.js from CDN
├── vite.config.js      # Build configuration
├── package.json        # Dependencies (React + Vite only)
├── README.md           # This file
└── src/
    ├── main.jsx        # React entry point
    └── App.jsx         # Complete application (~550 lines)
```

---

## 🛠️ Tech Stack

| Technology | Feature | Source |
|-----------|---------|--------|
| **Tesseract.js v5** | Text Scanner OCR | Open-source CDN |
| **Web Speech API — SpeechRecognition** | Live Captions | Browser built-in |
| **Web Speech API — SpeechSynthesis** | Read Aloud (all features) | Browser built-in |
| **Canvas API** | Color Finder + Sound Visualizer | Browser built-in |
| **Web Audio API** | Sound Visualizer | Browser built-in |
| **MediaDevices API** | Camera capture | Browser built-in |
| **React 18 + Vite** | UI framework | npm |

**Total external services required: zero.**

---

## ♿ Accessibility

Beacon is built accessibility-first:
- All interactive elements have `aria-label` attributes
- Dynamic content uses `aria-live` regions
- High contrast mode (black/yellow) in the header
- Skip navigation link
- Full keyboard navigation
- Adjustable caption font size (3 levels)
- TTS speed control (0.5× to 2×)

---

## 👥 Team

Built by **[Your Team Name]** for **Kentucky TSA Software Development 2025**.

---

## 📄 License

MIT License
