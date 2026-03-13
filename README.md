# 💊 MediSight — AI Medication Accessibility Assistant

> **Kentucky TSA Software Development 2025**  
> Removing barriers for people with vision disabilities

MediSight is an AI-powered web app that helps visually impaired individuals safely and independently identify their medications. Point your camera at any pill bottle, package, or blister pack — MediSight reads the entire label aloud: the medication name, dosage, instructions, warnings, and expiration date.

---

## 🎯 The Problem

For the 285 million people worldwide living with vision impairment, taking medication safely and independently is a serious daily challenge. Research consistently shows:

- **89%** of visually impaired people cannot read their own prescription labels
- **58%** don't know the name of the medication they are taking
- **75%** don't know their medication's expiration date
- **82%** have difficulty recognizing the correct dose

Current workarounds — rubber bands around bottles, Braille labels, memorizing by feel, or relying on sighted family members — are impractical, unreliable, and strip away independence. MediSight was built to solve this.

*Sources: Archive of Pharmacy Practice (2017), PMC / Saudi Pharmaceutical Journal (2020), ScienceDirect (2025)*

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📷 **Label Scanner** | Upload a photo or use your camera to capture any medication label |
| 🔍 **AI Extraction** | Claude AI reads all visible text: name, strength, instructions, warnings, expiry, prescriber info |
| 🔊 **Auto Text-to-Speech** | Results are spoken aloud immediately — no reading required |
| 💾 **Medicine Cabinet** | Save medications for fast future access without rescanning |
| 🔎 **Cabinet Search** | Search your saved medications by name |
| 📄 **Export to Text** | Save any result as a .txt file for caregivers or records |
| 📋 **Copy to Clipboard** | Copy the full summary instantly |
| 🌓 **High Contrast Mode** | Full high-contrast theme for low-vision users |
| ⌨️ **Keyboard Accessible** | Fully operable without a mouse — Tab, Enter, Escape |
| ♿ **Screen Reader Ready** | ARIA labels, live regions, and semantic markup throughout |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- An Anthropic API key — [Get one at console.anthropic.com](https://console.anthropic.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/medisight.git
cd medisight

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📖 How to Use

### Scanning a Medication Label

1. Go to the **Scan Label** tab
2. Click the upload zone or drag and drop a photo — or click **Use Camera** to take one live
3. Once your image appears, click **Scan Label**
4. MediSight reads the entire label and speaks the results aloud automatically
5. Click **Save to Cabinet** to store it for future use

### Browsing the Medicine Cabinet

1. Go to the **My Cabinet** tab
2. All your saved medications appear as cards
3. Use the search bar to filter by name
4. Click any card to open the full detail view and hear it read aloud again
5. Export or delete from the detail view

---

## 🗂️ Project Structure

```
medisight/
├── index.html          # HTML entry point
├── vite.config.js      # Vite build configuration
├── package.json        # Project dependencies
├── README.md           # This file
└── src/
    ├── main.jsx        # React root
    └── App.jsx         # Full application — UI, logic, API integration
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **Vite** | Development server and build tool |
| **Claude AI (claude-sonnet-4)** | Medication label analysis via Anthropic API |
| **Web Speech API** | Text-to-speech with adjustable speed |
| **MediaDevices API** | Live camera capture |
| **localStorage** | Persistent medicine cabinet |
| **Clipboard API** | Copy results to clipboard |

---

## ♿ Accessibility Design Principles

MediSight is built accessibility-first — because our users depend on it:

- All interactive elements have descriptive `aria-label` attributes
- Dynamic results use `aria-live` regions for screen reader announcements
- High contrast mode inverts to black/yellow for maximum readability
- Skip navigation link at the top of the page
- Full keyboard navigation (Tab, Enter, Space, Escape)
- No information is conveyed by color alone
- TTS speed is adjustable from 0.5× to 2× normal rate

---

## ⚠️ Disclaimer

MediSight is an **accessibility aid**, not a substitute for professional medical advice. AI label reading can make errors, especially with damaged, blurry, or partially obscured labels. Always confirm medication details with a licensed pharmacist or physician before taking any medication.

---

## 👥 Team

Built by **[Your Team Name]** for Kentucky TSA Software Development 2025.

---

## 📄 License

MIT License — free to use and modify.
