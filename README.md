# 🔊 EchoSight — AI Visual Accessibility Assistant

> **TSA Software Development 2025** · Removing barriers for people with vision disabilities

EchoSight is an AI-powered web app that helps visually impaired users understand the world around them. Upload a photo or use your camera, and EchoSight will describe scenes, read text, and provide navigation guidance — all spoken aloud.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔍 **Scene Description** | Detailed AI narration of any image |
| 📄 **Text Reader** | Extracts & reads all text from images (signs, menus, labels) |
| 🧭 **Navigation Help** | Identifies obstacles, pathways & hazards |
| 🔊 **Text-to-Speech** | Reads all results aloud with adjustable speed |
| 🌓 **High Contrast Mode** | Full high-contrast theme for low vision users |
| ⌨️ **Keyboard Navigation** | Fully operable without a mouse |
| 📷 **Camera Capture** | Analyze live photos from your device camera |
| 📋 **Copy & Export** | Copy results to clipboard or save as .txt |
| 🕒 **History** | Revisit recent analyses |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `U` | Upload image |
| `A` | Analyze image |
| `R` | Read result aloud |
| `S` | Stop speaking |
| `H` | Toggle high contrast |
| `K` | Toggle shortcuts panel |
| `1` / `2` / `3` | Switch analysis mode |
| `Esc` | Stop / close |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- An Anthropic API key → [Get one here](https://console.anthropic.com/)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/echosight.git
cd echosight

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production
```bash
npm run build
npm run preview
```

---

## 🗂️ Project Structure

```
echosight/
├── index.html          # App entry point
├── vite.config.js      # Vite build config
├── package.json        # Dependencies
├── README.md           # This file
└── src/
    ├── main.jsx        # React root
    └── App.jsx         # Main application
```

---

## 🛠️ Tech Stack

- **React 18** — UI framework
- **Vite** — Build tool & dev server
- **Claude AI (claude-sonnet-4)** — Image analysis (Anthropic API)
- **Web Speech API** — Text-to-speech
- **MediaDevices API** — Camera capture
- **Clipboard API** — Copy to clipboard

---

## ♿ Accessibility

EchoSight is built with accessibility-first principles:
- All interactive elements are keyboard accessible
- ARIA labels and roles throughout
- `aria-live` regions for dynamic content
- High contrast mode
- Skip navigation link
- Screen reader compatible

---

## 👥 Team

Built by **[Your Team Name]** for TSA Software Development 2025.

---

## 📄 License

MIT License — free to use and modify.
