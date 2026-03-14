# 🔦 Beacon — Universal Accessibility Companion

> **Kentucky TSA Software Development 2025**  
> One app. Every barrier broken.

Beacon is a multi-feature accessibility web app addressing both **vision** and **hearing** disabilities. Rather than solving a single problem with a single AI call, Beacon provides four genuinely different tools — each with a different interaction model — that together form a comprehensive daily accessibility companion.

---

## 🎯 Why Beacon?

Existing accessibility apps tend to do one thing (screen readers, captioning apps, image describers). Beacon's insight is that real users don't have just one barrier — they navigate the world across many different contexts throughout a day. Beacon addresses four of the most common ones in a single, unified app.

---

## ✨ Four Core Features

### 👁 Scene Chat — *Vision*
Photograph any scene and receive a detailed spoken description — then **hold a real conversation** about the same image. Ask follow-up questions like "What does the sign say?" or "Is there a step ahead?" The AI retains context across the entire session.

**Why this is different:** Every other image accessibility tool gives you one answer and stops. Scene Chat is interactive — it responds to specific follow-up questions without re-uploading the image.

### 👂 Live Captions — *Hearing*
Real-time speech-to-text using your device microphone. Words appear **as they are being spoken** — not after. Includes adjustable font sizes (small / medium / large), full transcript history, and one-click export to a text file.

**Why this is different:** This is live microphone input, not photo-based. The demo is instant — a judge speaks and words appear on screen immediately.

### 📄 Doc Reader — *Vision*
Photograph any document — bill, letter, prescription, menu, government form — and receive a **structured plain-language summary**: document type, key facts (dates, amounts, names, deadlines), an action item, and a full text transcription. Results are read aloud automatically.

**Why this is different:** It doesn't just describe what it sees. It identifies the *kind* of document and extracts specifically relevant information for that type. A bill gets amounts and due dates. A prescription gets drug name and dosage. A menu gets items and prices.

### ⚡ Quick Scan — *Vision*
One-tap instant identification of any object with specific color description. Optimized for speed — ideal for identifying clothing colors, canned goods, appliance buttons, or any item where you just need a fast answer.

**Why this is different:** The prompt is tuned for brevity and color specificity ("navy blue" not just "blue"). It's designed for routine daily use, not one-off demos.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- An Anthropic API key — [Get one at console.anthropic.com](https://console.anthropic.com/)

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/beacon.git
cd beacon
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 📖 How to Use Each Feature

### Scene Chat
1. Go to the **Scene Chat** tab
2. Upload a photo or use your camera
3. The AI automatically describes the scene and reads it aloud
4. Type any follow-up question in the chat box and press Enter
5. The AI answers specifically about the same image — no re-uploading needed

### Live Captions
1. Go to the **Live Captions** tab
2. Click **Start Captions** and allow microphone access
3. Speak — words appear on screen in real time
4. Adjust font size with the A buttons (Small / Medium / Large)
5. Click **Export** to save the full transcript as a .txt file

### Doc Reader
1. Go to the **Doc Reader** tab
2. Upload or photograph any document
3. Click **Read Document**
4. The AI identifies the document type, summarizes it, extracts key facts, and reads everything aloud
5. Toggle **Show** to see the full transcribed text

### Quick Scan
1. Go to the **Quick Scan** tab
2. Upload or photograph any object
3. Click **Identify**
4. Get a fast 1-2 sentence identification with specific color details, read aloud automatically

---

## 🗂️ Project Structure

```
beacon/
├── index.html          # HTML entry point
├── vite.config.js      # Vite build configuration
├── package.json        # Project dependencies
├── README.md           # This file
└── src/
    ├── main.jsx        # React root
    └── App.jsx         # Complete application
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **Vite** | Development server and build tool |
| **Claude AI (claude-sonnet-4)** | Scene description, document analysis, object identification |
| **Web Speech API — SpeechRecognition** | Live real-time speech-to-text captioning |
| **Web Speech API — SpeechSynthesis** | Text-to-speech for all AI results |
| **MediaDevices API** | Camera capture |
| **Clipboard API** | Copy results |

---

## ♿ Accessibility Design

Beacon is built accessibility-first:

- All interactive elements have `aria-label` attributes
- `aria-live` regions on all dynamic content (chat, captions, results)
- High contrast mode (black/yellow) accessible from the header
- Skip navigation link
- Full keyboard navigation (Tab, Enter, Space, Escape)
- Adjustable caption font size (three levels)
- TTS speed control (0.5× to 2× normal)
- No information conveyed by color alone

---

## 📊 Disabilities Addressed

**Vision Disabilities** — Scene Chat, Doc Reader, Quick Scan  
All three features use Claude AI's vision capabilities to interpret visual information that a blind or visually impaired person cannot access independently.

**Hearing Disabilities** — Live Captions  
Uses the browser's native SpeechRecognition API to convert spoken audio to on-screen text in real time, enabling deaf and hard-of-hearing users to follow spoken conversations.

---

## 👥 Team

Built by **[Your Team Name]** for **Kentucky TSA Software Development 2025**.

---

## 📄 License

MIT License — free to use and modify.
