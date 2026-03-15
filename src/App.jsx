import { useState, useRef, useEffect, useCallback } from "react";

// ─── Color name database for the Color Finder feature ────────────────────────
// Maps RGB values to human-readable color names using nearest-neighbor matching
const COLOR_DB = [
  { name: "Black",         r: 15,  g: 15,  b: 15  },
  { name: "Charcoal",      r: 54,  g: 54,  b: 58  },
  { name: "Dark Gray",     r: 85,  g: 85,  b: 85  },
  { name: "Gray",          r: 140, g: 140, b: 140 },
  { name: "Silver",        r: 190, g: 192, b: 198 },
  { name: "Light Gray",    r: 215, g: 215, b: 215 },
  { name: "White",         r: 255, g: 255, b: 255 },
  { name: "Off-White",     r: 245, g: 240, b: 228 },
  { name: "Cream",         r: 255, g: 250, b: 210 },
  { name: "Beige",         r: 240, g: 220, b: 190 },
  { name: "Tan",           r: 200, g: 160, b: 110 },
  { name: "Khaki",         r: 195, g: 185, b: 108 },
  { name: "Dark Brown",    r: 88,  g: 40,  b: 10  },
  { name: "Brown",         r: 140, g: 70,  b: 20  },
  { name: "Maroon",        r: 128, g: 0,   b: 0   },
  { name: "Dark Red",      r: 140, g: 0,   b: 0   },
  { name: "Red",           r: 220, g: 20,  b: 20  },
  { name: "Crimson",       r: 220, g: 20,  b: 60  },
  { name: "Coral",         r: 250, g: 100, b: 80  },
  { name: "Rose",          r: 255, g: 100, b: 130 },
  { name: "Hot Pink",      r: 255, g: 60,  b: 140 },
  { name: "Pink",          r: 255, g: 150, b: 170 },
  { name: "Light Pink",    r: 255, g: 210, b: 220 },
  { name: "Dark Orange",   r: 200, g: 80,  b: 0   },
  { name: "Orange",        r: 255, g: 140, b: 0   },
  { name: "Peach",         r: 255, g: 200, b: 160 },
  { name: "Gold",          r: 220, g: 178, b: 0   },
  { name: "Yellow",        r: 255, g: 235, b: 0   },
  { name: "Light Yellow",  r: 255, g: 250, b: 160 },
  { name: "Olive",         r: 100, g: 110, b: 0   },
  { name: "Yellow-Green",  r: 154, g: 205, b: 50  },
  { name: "Lime Green",    r: 130, g: 210, b: 0   },
  { name: "Dark Green",    r: 0,   g: 100, b: 0   },
  { name: "Forest Green",  r: 30,  g: 120, b: 50  },
  { name: "Green",         r: 0,   g: 180, b: 0   },
  { name: "Mint Green",    r: 160, g: 230, b: 200 },
  { name: "Teal",          r: 0,   g: 160, b: 150 },
  { name: "Dark Teal",     r: 0,   g: 100, b: 100 },
  { name: "Cyan",          r: 0,   g: 200, b: 220 },
  { name: "Sky Blue",      r: 100, g: 180, b: 240 },
  { name: "Light Blue",    r: 170, g: 210, b: 250 },
  { name: "Steel Blue",    r: 70,  g: 130, b: 180 },
  { name: "Blue",          r: 0,   g: 80,  b: 200 },
  { name: "Royal Blue",    r: 40,  g: 80,  b: 220 },
  { name: "Navy Blue",     r: 0,   g: 0,   b: 90  },
  { name: "Dark Blue",     r: 0,   g: 0,   b: 130 },
  { name: "Indigo",        r: 60,  g: 0,   b: 160 },
  { name: "Dark Purple",   r: 80,  g: 0,   b: 120 },
  { name: "Purple",        r: 130, g: 0,   b: 180 },
  { name: "Violet",        r: 150, g: 50,  b: 210 },
  { name: "Lavender",      r: 200, g: 170, b: 240 },
];

// Finds the closest color name using Euclidean distance in RGB space
function findColorName(r, g, b) {
  let closest = COLOR_DB[0];
  let minDist = Infinity;
  for (const c of COLOR_DB) {
    const dist = (r - c.r) ** 2 + (g - c.g) ** 2 + (b - c.b) ** 2;
    if (dist < minDist) { minDist = dist; closest = c; }
  }
  return closest.name;
}

// Extracts the dominant colors from an image element using canvas pixel sampling
function getDominantColors(imgEl, maxColors = 5) {
  const MAX_DIM = 160;
  const canvas  = document.createElement("canvas");
  const scale   = Math.min(1, MAX_DIM / Math.max(imgEl.naturalWidth || 1, imgEl.naturalHeight || 1));
  canvas.width  = Math.max(1, Math.round((imgEl.naturalWidth)  * scale));
  canvas.height = Math.max(1, Math.round((imgEl.naturalHeight) * scale));

  const ctx = canvas.getContext("2d");
  ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Group pixels into color buckets (quantize to reduce noise)
  const buckets = {};
  for (let i = 0; i < data.length; i += 16) {
    if (data[i + 3] < 128) continue; // skip transparent pixels
    const r = Math.floor(data[i]     / 28) * 28;
    const g = Math.floor(data[i + 1] / 28) * 28;
    const b = Math.floor(data[i + 2] / 28) * 28;
    const key = `${r},${g},${b}`;
    buckets[key] = (buckets[key] || 0) + 1;
  }

  // Sort by frequency and remove duplicate color names
  const seen = new Set();
  const results = [];
  for (const [key] of Object.entries(buckets).sort((a, b) => b[1] - a[1])) {
    const [r, g, b] = key.split(",").map(Number);
    const name = findColorName(r, g, b);
    if (!seen.has(name)) {
      seen.add(name);
      const hex = "#" + [r, g, b].map(v => Math.min(255, v).toString(16).padStart(2, "0")).join("");
      results.push({ r, g, b, hex, name });
    }
    if (results.length >= maxColors) break;
  }
  return results;
}

// Classifies audio based on frequency distribution
function classifyAudio(dataArray) {
  const avg     = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
  const lowAvg  = dataArray.slice(0, 6).reduce((a, b) => a + b, 0) / 6;
  const midAvg  = dataArray.slice(6, 22).reduce((a, b) => a + b, 0) / 16;
  const highAvg = dataArray.slice(22, 42).reduce((a, b) => a + b, 0) / 20;
  const level   = Math.round((avg / 255) * 100);

  if (avg < 7)                                           return { label: "Silence",          icon: "🔇", color: "#3a5878", level };
  if (avg > 140)                                         return { label: "Very Loud",         icon: "🔴", color: "#ef4444", level };
  if (midAvg > lowAvg * 1.25 && midAvg > highAvg * 0.8) return { label: "Speech Detected",   icon: "🗣️",  color: "#10b981", level };
  if (lowAvg > midAvg * 1.5)                             return { label: "Low Frequency",     icon: "🔉", color: "#8b5cf6", level };
  if (highAvg > midAvg * 1.35)                           return { label: "Sharp Sound",       icon: "🔔", color: "#f59e0b", level };
  return                                                  { label: "Background Sound",        icon: "🎵", color: "#06b6d4", level };
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #050e1f;
    --surf:      #091628;
    --surf2:     #0e1f38;
    --surf3:     #132844;
    --border:    #162f50;
    --bh:        #224872;
    --vis:       #f59e0b;
    --vis-s:     rgba(245, 158, 11, 0.1);
    --vis-s2:    rgba(245, 158, 11, 0.18);
    --hear:      #06b6d4;
    --hear-s:    rgba(6, 182, 212, 0.1);
    --hear-s2:   rgba(6, 182, 212, 0.18);
    --green:     #10b981;
    --red:       #ef4444;
    --text:      #e2eeff;
    --dim:       #7a9cc0;
    --mute:      #3a5878;
    --r:         16px;
    --rsm:       10px;
    --tr:        0.17s ease;
    --display:   'Syne', sans-serif;
    --body:      'Outfit', sans-serif;
  }

  body.hc {
    --bg: #000; --surf: #0a0a0a; --surf2: #111; --surf3: #191919;
    --border: #fff; --bh: #fff;
    --vis: #ffff00; --vis-s: rgba(255,255,0,0.12); --vis-s2: rgba(255,255,0,0.2);
    --hear: #00ffff; --hear-s: rgba(0,255,255,0.1); --hear-s2: rgba(0,255,255,0.2);
    --text: #fff; --dim: #ccc; --mute: #999;
  }
  body.hc .bg-wrap { display: none; }

  body {
    font-family: var(--body); background: var(--bg); color: var(--text);
    min-height: 100vh; line-height: 1.5; overflow-x: hidden;
  }

  .bg-wrap {
    position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
  }
  .bg-blob {
    position: absolute; border-radius: 50%;
    filter: blur(130px); opacity: 0.055;
    animation: breathe 20s ease-in-out infinite alternate;
  }
  .bb-a { width: 900px; height: 900px; background: var(--vis);  top: -350px; left: -280px; animation-delay: 0s; }
  .bb-b { width: 700px; height: 700px; background: var(--hear); bottom: -250px; right: -180px; animation-delay: -9s; }
  @keyframes breathe {
    from { transform: scale(1) translate(0, 0); }
    to   { transform: scale(1.08) translate(22px, 16px); }
  }

  .skip-nav {
    position: absolute; top: -999px; left: 0; z-index: 9999;
    padding: 10px 20px; background: var(--vis); color: #1a0e00;
    font-weight: 700; font-family: var(--body); border-radius: 0 0 8px 0;
  }
  .skip-nav:focus { top: 0; }

  .app { min-height: 100vh; display: flex; flex-direction: column; position: relative; z-index: 1; }

  /* ── Header ── */
  header {
    padding: 13px 28px;
    display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
    border-bottom: 1px solid var(--border);
    background: rgba(5,14,31,0.88); backdrop-filter: blur(18px);
    position: sticky; top: 0; z-index: 100;
  }
  .logo { display: flex; align-items: center; gap: 10px; }
  .logo-mark {
    width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
    background: linear-gradient(135deg, var(--vis), var(--hear));
    display: flex; align-items: center; justify-content: center; font-size: 18px;
  }
  .logo-text {
    font-family: var(--display); font-size: 20px; font-weight: 800;
    letter-spacing: -0.3px;
  }
  .logo-text em { font-style: normal; color: var(--vis); }
  .header-right { display: flex; align-items: center; gap: 7px; }
  .ky-badge {
    font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    padding: 3px 10px; border-radius: 999px;
    border: 1px solid rgba(245,158,11,0.3); color: var(--vis); background: var(--vis-s);
  }
  .hbtn {
    width: 35px; height: 35px; border-radius: 9px;
    border: 1px solid var(--border); background: var(--surf2);
    color: var(--mute); cursor: pointer; font-size: 15px;
    display: flex; align-items: center; justify-content: center;
    transition: all var(--tr); font-family: var(--body);
  }
  .hbtn:hover, .hbtn.on { border-color: var(--vis); color: var(--vis); background: var(--vis-s); }
  .hbtn:focus-visible { outline: 3px solid var(--vis); outline-offset: 2px; }

  /* ── Nav ── */
  nav {
    display: flex; justify-content: center; gap: 4px; flex-wrap: wrap;
    padding: 14px 28px 0;
    border-bottom: 1px solid var(--border);
    background: rgba(5,14,31,0.55);
  }
  .ntab {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 11px 11px 0 0;
    border: 1px solid transparent; border-bottom: none;
    font-family: var(--body); font-size: 13px; font-weight: 600;
    color: var(--mute); background: none; cursor: pointer;
    transition: all var(--tr); position: relative; bottom: -1px; white-space: nowrap;
  }
  .ntab:hover { color: var(--text); background: var(--surf2); }
  .ntab.vis-active  { color: var(--vis);  background: var(--surf); border-color: var(--border); border-bottom-color: var(--surf); }
  .ntab.hear-active { color: var(--hear); background: var(--surf); border-color: var(--border); border-bottom-color: var(--surf); }
  .ntab:focus-visible { outline: 3px solid var(--vis); outline-offset: 2px; }
  .ntab-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  /* ── Main ── */
  main { flex: 1; padding: 30px 28px; max-width: 940px; margin: 0 auto; width: 100%; }

  /* ── Page Header ── */
  .pg-head { margin-bottom: 22px; animation: rise 0.45s ease both; }
  .pg-title {
    font-family: var(--display); font-size: 26px; font-weight: 800;
    line-height: 1.2; margin-bottom: 6px; letter-spacing: -0.3px;
  }
  .pg-title .vc { color: var(--vis);  font-style: italic; }
  .pg-title .hc { color: var(--hear); font-style: italic; }
  .pg-sub { color: var(--dim); font-size: 14px; line-height: 1.65; max-width: 520px; }

  /* ── Drop Zone ── */
  .dz {
    border: 2px dashed var(--border); border-radius: var(--r);
    background: var(--surf); padding: 52px 28px;
    text-align: center; cursor: pointer; transition: all var(--tr);
    animation: rise 0.45s ease 0.07s both;
  }
  .dz:hover, .dz.over {
    border-color: var(--vis); background: var(--vis-s);
    box-shadow: inset 0 0 0 1px var(--vis), 0 0 36px var(--vis-s);
  }
  .dz:focus-visible { outline: 3px solid var(--vis); outline-offset: 3px; }
  .dz-icon { font-size: 46px; display: block; margin-bottom: 12px; }
  .dz h3 { font-family: var(--display); font-size: 19px; font-weight: 700; margin-bottom: 6px; }
  .dz p { color: var(--dim); font-size: 13px; }

  /* ── Camera ── */
  .cam-wrap { border-radius: var(--r); overflow: hidden; background: #000; position: relative; animation: rise 0.3s ease both; }
  .cam-wrap video { width: 100%; display: block; max-height: 390px; object-fit: cover; }
  .cam-bar { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; display: flex; justify-content: center; background: linear-gradient(transparent, rgba(0,0,0,0.65)); }
  .shutter {
    width: 66px; height: 66px; border-radius: 50%;
    border: 4px solid rgba(255,255,255,0.85); background: rgba(255,255,255,0.14);
    backdrop-filter: blur(4px); cursor: pointer; transition: all var(--tr);
    display: flex; align-items: center; justify-content: center;
  }
  .shutter:hover { background: rgba(255,255,255,0.3); transform: scale(1.04); }
  .shutter:focus-visible { outline: 3px solid var(--vis); }
  .shutter-dot { width: 44px; height: 44px; border-radius: 50%; background: white; }

  /* ── Workspace (2-col) ── */
  .workspace { display: grid; grid-template-columns: 1fr 1.15fr; gap: 18px; animation: rise 0.4s ease both; }
  @media (max-width: 680px) { .workspace { grid-template-columns: 1fr; } }

  /* ── Image Panel ── */
  .img-panel { background: var(--surf); border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; }
  .img-panel img { width: 100%; max-height: 280px; object-fit: contain; background: #030810; display: block; }
  .img-footer { padding: 10px 13px; display: flex; gap: 7px; border-top: 1px solid var(--border); flex-wrap: wrap; }

  /* ── Result Panel ── */
  .result-panel { background: var(--surf); border: 1px solid var(--border); border-radius: var(--r); display: flex; flex-direction: column; }
  .rp-head { padding: 13px 18px 11px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .rp-label { font-size: 11px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; }
  .vis-label  { color: var(--vis); }
  .hear-label { color: var(--hear); }
  .rp-body { flex: 1; padding: 18px; }

  /* ── OCR Result ── */
  .ocr-status { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 32px; color: var(--dim); }
  .ocr-status-text { font-size: 14px; text-align: center; }
  .progress-track { width: 100%; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, var(--vis), var(--hear)); transition: width 0.35s ease; }
  .ocr-text-area {
    font-size: 15px; line-height: 1.8; color: var(--text);
    white-space: pre-wrap; max-height: 260px; overflow-y: auto;
    padding: 4px 0;
  }
  .ocr-text-area:empty::before { content: "No text found in this image."; color: var(--mute); font-style: italic; }
  .confidence-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 11px; border-radius: 999px; font-size: 12px; font-weight: 600;
    margin-top: 12px;
  }
  .conf-high { background: rgba(16,185,129,0.1); color: var(--green); border: 1px solid rgba(16,185,129,0.25); }
  .conf-mid  { background: var(--vis-s); color: var(--vis); border: 1px solid rgba(245,158,11,0.25); }
  .conf-low  { background: rgba(239,68,68,0.1); color: var(--red); border: 1px solid rgba(239,68,68,0.25); }

  .ocr-reading-mode {
    background: var(--surf2); border: 1px solid var(--border);
    border-radius: var(--rsm); padding: 18px 20px; margin-top: 14px;
    font-size: 17px; line-height: 1.9; letter-spacing: 0.2px;
    white-space: pre-wrap; max-height: 300px; overflow-y: auto;
  }

  /* ── Color Result ── */
  .color-list { display: flex; flex-direction: column; gap: 0; }
  .color-item { display: flex; align-items: center; gap: 13px; padding: 11px 0; border-bottom: 1px solid var(--border); }
  .color-item:last-child { border-bottom: none; }
  .color-swatch { width: 44px; height: 44px; border-radius: 10px; border: 2px solid rgba(255,255,255,0.08); flex-shrink: 0; }
  .color-rank { font-size: 12px; color: var(--mute); width: 18px; text-align: center; flex-shrink: 0; }
  .color-info { flex: 1; min-width: 0; }
  .color-name { font-size: 16px; font-weight: 600; }
  .color-hex { font-size: 11px; color: var(--mute); font-family: monospace; margin-top: 2px; }
  .color-bar-track { flex: 1; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden; margin: 0 8px; }

  .color-summary {
    background: var(--surf2); border: 1px solid var(--border); border-radius: var(--rsm);
    padding: 13px 16px; margin-top: 14px; font-size: 14px; line-height: 1.65; color: var(--dim);
  }
  .color-summary strong { color: var(--text); }

  /* ── Sound Visualizer ── */
  .sound-wrap { position: relative; border-radius: var(--r); overflow: hidden; background: var(--surf); border: 1px solid var(--border); }
  .sound-canvas { display: block; width: 100%; height: 200px; }
  .sound-class-badge {
    position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
    padding: 6px 18px; border-radius: 999px;
    font-size: 13px; font-weight: 700; letter-spacing: 0.5px;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(5,14,31,0.7);
    display: flex; align-items: center; gap: 7px;
    white-space: nowrap; transition: color 0.3s ease;
  }
  .sound-level-bar {
    position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
    background: var(--border);
  }
  .sound-level-fill { height: 100%; transition: width 0.08s linear; }
  .flash-overlay {
    position: absolute; inset: 0; border-radius: var(--r);
    pointer-events: none; opacity: 0;
    background: rgba(239,68,68,0.15);
    transition: opacity 0.1s ease;
  }
  .flash-overlay.on { opacity: 1; }

  .sound-controls { display: flex; align-items: center; gap: 10px; margin-top: 14px; flex-wrap: wrap; animation: rise 0.4s ease both; }
  .sound-note { font-size: 13px; color: var(--dim); }

  /* ── Captions ── */
  .caption-display {
    background: var(--surf); border: 1px solid var(--border);
    border-radius: var(--r); padding: 26px; min-height: 220px;
    display: flex; flex-direction: column; justify-content: flex-end;
    transition: border-color var(--tr); position: relative; overflow: hidden;
  }
  .caption-display.active { border-color: var(--hear); box-shadow: 0 0 0 1px var(--hear), 0 0 28px var(--hear-s); }
  .live-pill {
    position: absolute; top: 14px; right: 14px;
    display: flex; align-items: center; gap: 6px;
    padding: 4px 12px; border-radius: 999px;
    font-size: 10px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase;
    color: var(--hear); background: var(--hear-s); border: 1px solid rgba(6,182,212,0.3);
  }
  .live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--hear); animation: pulse-dot 1.1s ease-in-out infinite; }
  @keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }

  .caption-scroll { overflow-y: auto; max-height: 360px; display: flex; flex-direction: column; gap: 8px; }
  .caption-final   { color: var(--text); font-weight: 400; line-height: 1.55; }
  .caption-interim { color: var(--mute); font-style: italic; line-height: 1.55; }
  .caption-placeholder { color: var(--mute); font-size: 16px; font-style: italic; text-align: center; line-height: 1.7; margin: auto; }

  .caption-controls { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; margin-top: 16px; animation: rise 0.4s ease both; }
  .font-btns { display: flex; gap: 5px; margin-left: auto; }
  .fbt {
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid var(--border); background: var(--surf2);
    color: var(--dim); font-family: var(--body); cursor: pointer;
    font-weight: 700; transition: all var(--tr);
    display: flex; align-items: center; justify-content: center;
  }
  .fbt:hover, .fbt.on { border-color: var(--hear); color: var(--hear); background: var(--hear-s); }
  .fbt:focus-visible { outline: 3px solid var(--hear); }

  .transcript-box {
    margin-top: 18px; background: var(--surf); border: 1px solid var(--border);
    border-radius: var(--r); overflow: hidden; animation: rise 0.4s ease both;
  }
  .tb-head { padding: 11px 17px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .tb-title { font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--hear); }
  .tb-body { padding: 14px 17px; font-size: 14px; line-height: 1.75; color: var(--dim); max-height: 200px; overflow-y: auto; }

  /* ── TTS Controls ── */
  .tts-block { display: flex; flex-direction: column; gap: 10px; padding: 13px 18px; border-top: 1px solid var(--border); }
  .tts-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .tts-lbl { font-size: 12px; color: var(--mute); font-weight: 600; margin-right: auto; }
  .speed-row { display: flex; align-items: center; gap: 9px; }
  .speed-lbl { font-size: 12px; color: var(--mute); white-space: nowrap; }
  .speed-sl { accent-color: var(--vis); cursor: pointer; flex: 1; min-width: 80px; }
  .speed-val { font-size: 12px; color: var(--vis); font-weight: 700; min-width: 28px; }

  /* ── Analyze strip ── */
  .analyze-strip { display: flex; justify-content: center; gap: 10px; margin-top: 18px; animation: rise 0.4s ease 0.05s both; }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 20px; border-radius: var(--rsm); border: none;
    font-family: var(--body); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all var(--tr); white-space: nowrap;
  }
  .btn:focus-visible { outline: 3px solid var(--vis); outline-offset: 2px; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
  .btn-vis  { background: linear-gradient(135deg, var(--vis),  #d97706); color: #1a0e00; box-shadow: 0 0 20px var(--vis-s2); }
  .btn-hear { background: linear-gradient(135deg, var(--hear), #0891b2); color: #021218; box-shadow: 0 0 20px var(--hear-s2); }
  .btn-vis:hover:not(:disabled)  { opacity: 0.87; transform: translateY(-1px); }
  .btn-hear:hover:not(:disabled) { opacity: 0.87; transform: translateY(-1px); }
  .btn-ghost { background: var(--surf2); color: var(--text); border: 1px solid var(--border); }
  .btn-ghost:hover:not(:disabled) { border-color: var(--bh); }
  .btn-red { background: rgba(239,68,68,0.1); color: var(--red); border: 1px solid rgba(239,68,68,0.25); }
  .btn-red:hover:not(:disabled) { background: rgba(239,68,68,0.18); }
  .btn-sm { padding: 7px 13px; font-size: 13px; border-radius: 8px; }
  .btn-lg { padding: 13px 30px; font-size: 16px; border-radius: 12px; }

  /* ── Spinner ── */
  .spin { width: 26px; height: 26px; border-radius: 50%; border: 3px solid var(--border); border-top-color: var(--vis); animation: spinning 0.7s linear infinite; }
  .spin.lg { width: 34px; height: 34px; }
  @keyframes spinning { to { transform: rotate(360deg); } }

  /* ── Error ── */
  .err { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.28); border-radius: var(--rsm); padding: 13px 17px; color: var(--red); font-size: 14px; margin-top: 16px; line-height: 1.6; }

  /* ── Toast ── */
  .toast { position: fixed; bottom: 22px; right: 22px; z-index: 9999; background: var(--surf2); border: 1px solid var(--vis); border-radius: 10px; padding: 12px 18px; font-size: 14px; font-weight: 600; color: var(--vis); box-shadow: 0 6px 28px rgba(0,0,0,0.5); animation: rise 0.25s ease both; max-width: 280px; }

  /* ── Footer ── */
  footer { text-align: center; padding: 20px 28px; color: var(--mute); font-size: 12px; border-top: 1px solid var(--border); }
  footer strong { color: var(--vis); }

  /* ── Animations ── */
  @keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

  canvas { display: block; }
`;

// ─── TTS Hook ─────────────────────────────────────────────────────────────────
function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [rate,     setRateState] = useState(1.0);
  const rateRef = useRef(1.0);

  const setRate = (r) => { rateRef.current = r; setRateState(r); };

  const speak = useCallback((text) => {
    window.speechSynthesis.cancel();
    const u   = new SpeechSynthesisUtterance(text);
    u.rate    = rateRef.current;
    u.pitch   = 1;
    u.onstart = () => setSpeaking(true);
    u.onend   = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speaking, speak, stop, rate, setRate };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function CameraView({ videoRef, canvasRef, onCapture, onCancel }) {
  return (
    <div>
      <div className="cam-wrap">
        <video ref={videoRef} autoPlay playsInline muted aria-label="Live camera" />
        <canvas ref={canvasRef} style={{ display: "none" }} aria-hidden="true" />
        <div className="cam-bar">
          <button className="shutter" onClick={onCapture} aria-label="Take photo">
            <div className="shutter-dot" />
          </button>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>✕ Cancel Camera</button>
      </div>
    </div>
  );
}

function TTSBlock({ text, tts }) {
  return (
    <div className="tts-block">
      <div className="tts-row">
        <span className="tts-lbl">🔊 Read Aloud</span>
        {tts.speaking
          ? <button className="btn btn-ghost btn-sm" onClick={tts.stop}>⏹ Stop</button>
          : <button className="btn btn-vis  btn-sm" onClick={() => tts.speak(text)}>▶ Play</button>}
      </div>
      <div className="speed-row" role="group" aria-label="Speech speed">
        <span className="speed-lbl" id="spd">Speed:</span>
        <input type="range" className="speed-sl" min="0.5" max="2" step="0.1"
          value={tts.rate} onChange={e => tts.setRate(parseFloat(e.target.value))}
          aria-labelledby="spd" aria-valuetext={`${tts.rate.toFixed(1)} times`} />
        <span className="speed-val" aria-live="polite">{tts.rate.toFixed(1)}×</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Beacon() {
  const [tab, setTab]               = useState("text");
  const [hc,  setHc]                = useState(false);
  const [toast, setToast]           = useState(null);
  const tts = useTTS();

  // Text Scanner state
  const [textImg,    setTextImg]    = useState(null);
  const [ocrResult,  setOcrResult]  = useState(null);
  const [ocrStatus,  setOcrStatus]  = useState("");
  const [ocrPct,     setOcrPct]     = useState(0);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError,   setOcrError]   = useState(null);
  const [textCamOn,  setTextCamOn]  = useState(false);
  const [readMode,   setReadMode]   = useState(false);

  // Color Finder state
  const [colorImg,     setColorImg]     = useState(null);
  const [colorResult,  setColorResult]  = useState(null);
  const [colorLoading, setColorLoading] = useState(false);
  const [colorError,   setColorError]   = useState(null);
  const [colorCamOn,   setColorCamOn]   = useState(false);

  // Live Captions state
  const [captionOn,      setCaptionOn]      = useState(false);
  const [captionInterim, setCaptionInterim] = useState("");
  const [captionLog,     setCaptionLog]     = useState([]);
  const [fontSize,       setFontSize]       = useState("md");
  const [captionStatus,  setCaptionStatus]  = useState("");

  // Sound Visualizer state
  const [soundOn,    setSoundOn]    = useState(false);
  const [soundClass, setSoundClass] = useState(null);
  const [soundLevel, setSoundLevel] = useState(0);
  const [flash,      setFlash]      = useState(false);

  // Refs
  const textFileRef  = useRef();
  const colorFileRef = useRef();
  const videoRef     = useRef();
  const canvasRef    = useRef();
  const streamRef    = useRef();

  const captionRecRef    = useRef(null);
  const captionOnRef     = useRef(false);
  const mediaRecRef      = useRef(null);
  const audioChunksRef   = useRef([]);
  const captionMicRef    = useRef(null);

  const soundCanvasRef = useRef();
  const animFrameRef   = useRef();
  const audioCtxRef    = useRef();
  const analyserRef    = useRef();
  const soundStreamRef = useRef();

  const FONT_SIZES = { sm: "16px", md: "22px", lg: "30px" };

  // ── Effects ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.classList.toggle("hc", hc);
  }, [hc]);

  useEffect(() => {
    return () => {
      stopCamera();
      stopCaptions();
      stopSound();
      window.speechSynthesis.cancel();
    };
  }, []);

  // ── Toast helper ─────────────────────────────────────────────────────────────
  function toast_(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function copyText(text) {
    navigator.clipboard.writeText(text)
      .then(() => toast_("📋 Copied!"))
      .catch(() => toast_("Copy failed — try selecting manually."));
  }

  function exportTxt(text, prefix) {
    const blob = new Blob([`Beacon — ${prefix}\nExported: ${new Date().toLocaleString()}\n${"─".repeat(40)}\n\n${text}`], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `beacon-${prefix.toLowerCase().replace(/\s/g, "-")}-${Date.now()}.txt`;
    a.click();
    toast_("📄 Exported!");
  }

  // ── Tab switching ─────────────────────────────────────────────────────────────
  function switchTab(t) {
    stopCamera();
    stopCaptions();
    stopSound();
    tts.stop();
    setTab(t);
  }

  // ── Camera helpers ─────────────────────────────────────────────────────────────
  async function startCamera(setActive, setError) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setActive(true);
      setTimeout(() => {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      }, 80);
    } catch {
      setError("Camera access was denied. Please use the file upload option instead.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setTextCamOn(false);
    setColorCamOn(false);
  }

  function capturePhoto(setImage, setActive) {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    const src = c.toDataURL("image/jpeg", 0.92);
    setImage({ src, base64: src.split(",")[1] });
    stopCamera();
    setActive(false);
  }

  function loadFile(file, setImage, setError) {
    if (!file?.type.startsWith("image/")) { setError("Please select an image file (JPG, PNG, WEBP)."); return; }
    const reader = new FileReader();
    reader.onload = e => { setImage({ src: e.target.result }); setError(null); };
    reader.readAsDataURL(file);
  }

  // ── Text Scanner (OCR via Tesseract.js CDN) ────────────────────────────────
  async function runOCR() {
    if (!textImg) return;
    if (!window.Tesseract) {
      setOcrError("The OCR library is still loading. Please wait a few seconds and try again.");
      return;
    }

    setOcrLoading(true);
    setOcrResult(null);
    setOcrError(null);
    setOcrPct(0);
    setReadMode(false);
    tts.stop();

    try {
      // Create an image element so Tesseract can read it reliably
      const imgEl = new Image();
      imgEl.src = textImg.src;
      await new Promise(res => { imgEl.onload = res; });

      const { data: { text, confidence } } = await window.Tesseract.recognize(
        imgEl,
        "eng",
        {
          logger: m => {
            if (m.status === "loading tesseract core")         setOcrStatus("Loading OCR engine…");
            else if (m.status === "initializing api")          setOcrStatus("Initializing…");
            else if (m.status === "loading language traineddata") setOcrStatus("Downloading language model (first time only)…");
            else if (m.status === "recognizing text") {
              setOcrStatus("Reading text…");
              setOcrPct(Math.round(m.progress * 100));
            }
          },
        }
      );

      const cleaned = text.trim();
      setOcrResult({ text: cleaned, confidence: Math.round(confidence) });

      if (cleaned) {
        tts.speak(cleaned);
      } else {
        tts.speak("No text was found in this image. Try a clearer or closer photo.");
      }
    } catch (e) {
      setOcrError("OCR failed: " + e.message + ". Try a clearer photo.");
    } finally {
      setOcrLoading(false);
    }
  }

  // ── Color Finder (Canvas pixel analysis) ──────────────────────────────────
  function runColorAnalysis() {
    if (!colorImg) return;
    setColorLoading(true);
    setColorResult(null);
    setColorError(null);
    tts.stop();

    const imgEl = new Image();
    imgEl.src = colorImg.src;
    imgEl.onload = () => {
      try {
        const colors = getDominantColors(imgEl, 5);
        setColorResult(colors);
        setColorLoading(false);

        if (colors.length === 0) {
          tts.speak("Could not identify colors in this image.");
          return;
        }
        const main    = colors[0].name;
        const accents = colors.slice(1, 3).map(c => c.name);
        const speech  = accents.length > 0
          ? `This item appears to be ${main}, with ${accents.join(" and ")} details.`
          : `This item is ${main}.`;
        tts.speak(speech);
      } catch (e) {
        setColorError("Color analysis failed: " + e.message);
        setColorLoading(false);
      }
    };
    imgEl.onerror = () => {
      setColorError("Could not load the image for analysis.");
      setColorLoading(false);
    };
  }

  // ── Live Captions (Web Speech API SpeechRecognition) ───────────────────────
  //
  // Edge-specific fixes applied here:
  //
  // Fix 1: Edge's SpeechRecognition silently fails if microphone permission
  // has not been explicitly confirmed beforehand. We request mic access via
  // getUserMedia first, then immediately release it. This forces the browser
  // to grant and record the permission before SpeechRecognition takes over.
  //
  // Fix 2: After recognition ends (even briefly between sentences), reusing
  // the same SpeechRecognition object to call .start() again causes Edge to
  // throw internally and stop silently. We create a brand-new instance every
  // time recognition restarts instead.
  //
  // Fix 3: Renamed the loop variable from `final` (reserved word in some
  // strict-mode Edge builds) to `finalText`.
  //
  // Fix 4: Errors like "not-allowed" and "service-not-allowed" previously
  // ── Live Captions ─────────────────────────────────────────────────────────
  //
  // Uses a two-tier approach to work on restricted networks (hotspots,
  // school WiFi) that block the cloud speech-recognition servers:
  //
  //   Tier 1: SpeechRecognition streaming — real-time, lowest latency.
  //           If a "network" error occurs (cloud blocked), auto-switches
  //           to Tier 2 without any user action needed.
  //
  //   Tier 2: Chunked MediaRecorder fallback — records 4-second audio
  //           chunks and transcribes each one individually, bypassing
  //           the persistent cloud connection.

  async function startCaptions() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast_("⚠️ Live Captions require Chrome or Edge.");
      return;
    }

    // Acquire microphone once up-front and hold the stream.
    // Keeping the stream open prevents Edge from revoking permission
    // mid-session and gives MediaRecorder something to record from.
    let micStream;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch {
      toast_("⚠️ Microphone access was denied. Allow it in browser settings and try again.");
      return;
    }
    captionMicRef.current = micStream;

    captionOnRef.current = true;
    setCaptionOn(true);
    setCaptionInterim("");
    setCaptionStatus("Listening…");

    startStreamingRecognition(SR);
  }

  // Tier 1 — continuous streaming recognition.
  // On network error automatically drops to Tier 2.
  function startStreamingRecognition(SR) {
    if (!captionOnRef.current) return;

    const rec          = new SR();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = "en-US";

    rec.onresult = e => {
      let interim = "", finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t + " ";
        else interim += t;
      }
      if (finalText) {
        setCaptionLog(prev => [...prev, finalText.trim()]);
        setCaptionInterim("");
      } else {
        setCaptionInterim(interim);
      }
    };

    rec.onerror = e => {
      if (e.error === "network") {
        // Cloud servers blocked — silently switch to chunked offline mode.
        captionRecRef.current = null;
        setCaptionStatus("Network blocked — switched to offline mode");
        setCaptionInterim("(Speak in short phrases — processing every 4 seconds)");
        startChunkedRecognition(SR);
      } else if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        toast_("⚠️ Microphone permission denied.");
        captionOnRef.current = false;
        setCaptionOn(false);
        setCaptionStatus("");
      } else if (e.error !== "no-speech" && e.error !== "aborted") {
        setTimeout(() => { if (captionOnRef.current) startStreamingRecognition(SR); }, 400);
      }
    };

    rec.onend = () => {
      if (captionOnRef.current) setTimeout(() => startStreamingRecognition(SR), 100);
    };

    captionRecRef.current = rec;
    try { rec.start(); } catch { /* already running */ }
  }

  // Tier 2 — chunked MediaRecorder fallback for restricted networks.
  // Records 4-second audio clips from the persistent mic stream and
  // submits each as a standalone recognition request.
  function startChunkedRecognition(SR) {
    if (!captionOnRef.current || !captionMicRef.current) return;

    function recordOneChunk() {
      if (!captionOnRef.current) return;

      const chunks = [];
      let recorder;

      try {
        recorder = new MediaRecorder(captionMicRef.current, { mimeType: "audio/webm;codecs=opus" });
      } catch {
        try { recorder = new MediaRecorder(captionMicRef.current); }
        catch { setCaptionStatus("Recorder unavailable on this device."); return; }
      }

      mediaRecRef.current = recorder;

      recorder.ondataavailable = e => { if (e.data?.size > 0) chunks.push(e.data); };

      recorder.onstop = () => {
        if (!captionOnRef.current) return;

        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });

        // Use a fresh SpeechRecognition instance for each chunk.
        // Supplying the audio URL works in some browsers; in others the
        // instance just listens via mic for a brief window — either way
        // we get a transcription and chain to the next chunk.
        const r = new SR();
        r.continuous     = false;
        r.interimResults = false;
        r.lang           = "en-US";

        const url = URL.createObjectURL(blob);
        try { r.audioSrc = url; } catch { /* not supported, mic will be used */ }

        r.onresult = ev => {
          let text = "";
          for (let i = 0; i < ev.results.length; i++) {
            if (ev.results[i].isFinal) text += ev.results[i][0].transcript + " ";
          }
          const trimmed = text.trim();
          if (trimmed) {
            setCaptionLog(prev => [...prev, trimmed]);
            setCaptionInterim("");
          }
        };

        r.onerror = () => { /* absorb errors in fallback — just move to next chunk */ };
        r.onend   = () => { URL.revokeObjectURL(url); recordOneChunk(); };

        try { r.start(); } catch { recordOneChunk(); }
        // Safety timeout so a hung instance doesn't stall the chain
        setTimeout(() => { try { r.stop(); } catch { } }, 5500);
      };

      recorder.start();
      setTimeout(() => { if (recorder.state === "recording") recorder.stop(); }, 4000);
    }

    recordOneChunk();
  }

  function stopCaptions() {
    captionOnRef.current = false;

    try { captionRecRef.current?.stop(); } catch { }
    captionRecRef.current = null;

    try { if (mediaRecRef.current?.state === "recording") mediaRecRef.current.stop(); } catch { }
    mediaRecRef.current = null;

    captionMicRef.current?.getTracks().forEach(t => t.stop());
    captionMicRef.current = null;

    setCaptionOn(false);
    setCaptionInterim("");
    setCaptionStatus("");
  }

  function clearCaptions() {
    stopCaptions();
    setCaptionLog([]);
    setCaptionInterim("");
    setCaptionStatus("");
  }

  // ── Sound Visualizer (Web Audio API) ──────────────────────────────────────
  async function startSound() {
    try {
      const stream  = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const ctx     = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      soundStreamRef.current = stream;
      audioCtxRef.current    = ctx;
      analyserRef.current    = analyser;

      setSoundOn(true);
      drawSound(analyser);
    } catch {
      toast_("⚠️ Microphone access was denied. Please allow it in your browser.");
    }
  }

  function drawSound(analyser) {
    const canvas = soundCanvasRef.current;
    if (!canvas) return;

    // Set internal canvas pixel size to match display size
    canvas.width  = canvas.clientWidth  || 600;
    canvas.height = canvas.clientHeight || 200;

    const ctx       = canvas.getContext("2d");
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const W = canvas.width;
    const H = canvas.height;

    function frame() {
      animFrameRef.current = requestAnimationFrame(frame);
      analyser.getByteFrequencyData(dataArray);

      // Fade background for trail effect
      ctx.fillStyle = "rgba(5, 14, 31, 0.45)";
      ctx.fillRect(0, 0, W, H);

      const barCount = dataArray.length;
      const barW     = W / barCount;

      for (let i = 0; i < barCount; i++) {
        const v    = dataArray[i] / 255;
        if (v < 0.01) continue;
        const barH = v * H * 0.9;
        const x    = i * barW;

        // Gradient: cyan (low freq) → amber (high freq)
        const t = i / barCount;
        const r = Math.round(6   * (1 - t) + 245 * t);
        const g = Math.round(182 * (1 - t) + 158 * t);
        const b = Math.round(212 * (1 - t) + 11  * t);

        ctx.shadowBlur  = v > 0.45 ? 12 : 0;
        ctx.shadowColor = `rgb(${r},${g},${b})`;
        ctx.fillStyle   = `rgba(${r},${g},${b},${0.55 + v * 0.45})`;
        ctx.fillRect(x + 0.5, H - barH, barW - 1.5, barH);
      }
      ctx.shadowBlur = 0;

      const classification = classifyAudio(dataArray);
      setSoundClass(classification);
      setSoundLevel(classification.level);

      // Flash alert for very loud sounds
      if (classification.level > 75) {
        setFlash(true);
        setTimeout(() => setFlash(false), 120);
      }
    }

    frame();
  }

  function stopSound() {
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = null;

    analyserRef.current?.disconnect();
    audioCtxRef.current?.close();
    soundStreamRef.current?.getTracks().forEach(t => t.stop());

    analyserRef.current    = null;
    audioCtxRef.current    = null;
    soundStreamRef.current = null;

    setSoundOn(false);
    setSoundClass(null);
    setSoundLevel(0);

    // Clear canvas
    const canvas = soundCanvasRef.current;
    if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  }

  // ─── Confidence badge helper ───────────────────────────────────────────────
  function confidenceBadge(pct) {
    if (pct > 75) return <span className="confidence-badge conf-high">✓ High confidence ({pct}%)</span>;
    if (pct > 45) return <span className="confidence-badge conf-mid">~ Medium confidence ({pct}%)</span>;
    return               <span className="confidence-badge conf-low">⚠ Low confidence ({pct}%) — try a clearer photo</span>;
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <a className="skip-nav" href="#main">Skip to main content</a>

      <div className="app">
        <div className="bg-wrap" aria-hidden="true">
          <div className="bg-blob bb-a" /><div className="bg-blob bb-b" />
        </div>

        {/* Header */}
        <header>
          <div className="logo">
            <div className="logo-mark" aria-hidden="true">🔦</div>
            <span className="logo-text">Bea<em>con</em></span>
          </div>
          <div className="header-right">
            <span className="ky-badge">KY TSA 2025</span>
            <button className={`hbtn${hc ? " on" : ""}`}
              onClick={() => setHc(p => !p)}
              aria-pressed={hc}
              aria-label={hc ? "Disable high contrast" : "Enable high contrast"}
              title="Toggle high contrast">
              {hc ? "☀️" : "🌓"}
            </button>
          </div>
        </header>

        {/* Navigation */}
        <nav role="tablist" aria-label="Features">
          {[
            { id: "text",    icon: "👁",  label: "Text Scanner",   type: "vis",  dot: "var(--vis)"  },
            { id: "captions",icon: "👂",  label: "Live Captions",  type: "hear", dot: "var(--hear)" },
            { id: "color",   icon: "🎨",  label: "Color Finder",   type: "vis",  dot: "var(--vis)"  },
            { id: "sound",   icon: "🔊",  label: "Sound View",     type: "hear", dot: "var(--hear)" },
          ].map(({ id, icon, label, type, dot }) => (
            <button key={id}
              className={`ntab${tab === id ? ` ${type}-active` : ""}`}
              role="tab" aria-selected={tab === id}
              onClick={() => switchTab(id)}>
              <span className="ntab-dot" style={{ background: dot }} aria-hidden="true" />
              <span aria-hidden="true">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Main content */}
        <main id="main" aria-live="polite" aria-atomic="false">

          {/* ══ TEXT SCANNER ══════════════════════════════════════════════════ */}
          {tab === "text" && (
            <div>
              <div className="pg-head">
                <h1 className="pg-title">Text <span className="vc">Scanner</span></h1>
                <p className="pg-sub">
                  Photograph any printed text — signs, menus, mail, medicine bottles, labels — and Beacon reads it aloud. Powered by on-device OCR. No internet required.
                </p>
              </div>

              {!textCamOn && !textImg && (
                <>
                  <div className="dz" tabIndex={0} role="button"
                    aria-label="Upload an image with text. Click or drag and drop."
                    onClick={() => textFileRef.current?.click()}
                    onKeyDown={e => (e.key === "Enter" || e.key === " ") && textFileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("over"); }}
                    onDragLeave={e => e.currentTarget.classList.remove("over")}
                    onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("over"); loadFile(e.dataTransfer.files[0], setTextImg, setOcrError); }}>
                    <input ref={textFileRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => loadFile(e.target.files[0], setTextImg, setOcrError)} />
                    <span className="dz-icon" aria-hidden="true">👁</span>
                    <h3>Drop a photo here to read its text</h3>
                    <p>Signs, menus, labels, documents, medicine bottles — anything printed</p>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => startCamera(setTextCamOn, setOcrError)}>📷 Use Camera</button>
                  </div>
                </>
              )}

              {textCamOn && (
                <CameraView videoRef={videoRef} canvasRef={canvasRef}
                  onCapture={() => capturePhoto(setTextImg, setTextCamOn)}
                  onCancel={() => { stopCamera(); }} />
              )}

              {textImg && !textCamOn && (
                <>
                  <div className="workspace">
                    <div className="img-panel">
                      <img src={textImg.src} alt="Image containing text to be read" />
                      <div className="img-footer">
                        <input ref={textFileRef} type="file" accept="image/*" style={{ display: "none" }}
                          onChange={e => { loadFile(e.target.files[0], setTextImg, setOcrError); setOcrResult(null); }} />
                        <button className="btn btn-ghost btn-sm" onClick={() => textFileRef.current?.click()}>🔄 Replace</button>
                        <button className="btn btn-red btn-sm" onClick={() => { setTextImg(null); setOcrResult(null); setReadMode(false); tts.stop(); }}>🗑 Remove</button>
                      </div>
                    </div>

                    <div className="result-panel">
                      <div className="rp-head">
                        <span className="rp-label vis-label">Extracted Text</span>
                        {ocrResult && (
                          <button className={`btn btn-ghost btn-sm`}
                            onClick={() => setReadMode(p => !p)}
                            aria-pressed={readMode}>
                            {readMode ? "📄 Normal" : "📖 Reading Mode"}
                          </button>
                        )}
                      </div>

                      <div className="rp-body">
                        {ocrLoading && (
                          <div className="ocr-status" aria-live="polite" aria-label={ocrStatus}>
                            <div className="spin lg" role="status" />
                            <p className="ocr-status-text">{ocrStatus || "Starting…"}</p>
                            {ocrPct > 0 && (
                              <div style={{ width: "100%" }}>
                                <div className="progress-track">
                                  <div className="progress-fill" style={{ width: `${ocrPct}%` }} aria-valuenow={ocrPct} role="progressbar" />
                                </div>
                                <p style={{ fontSize: 12, color: "var(--mute)", marginTop: 6, textAlign: "center" }}>{ocrPct}%</p>
                              </div>
                            )}
                          </div>
                        )}

                        {!ocrLoading && !ocrResult && (
                          <p style={{ color: "var(--mute)", fontSize: 14 }}>Click Scan Text to read this image.</p>
                        )}

                        {ocrResult && !ocrLoading && (
                          <>
                            {readMode ? (
                              <div className="ocr-reading-mode" aria-label="Reading mode text">{ocrResult.text || "No text found."}</div>
                            ) : (
                              <div className="ocr-text-area" aria-label="Extracted text">{ocrResult.text}</div>
                            )}
                            {confidenceBadge(ocrResult.confidence)}
                          </>
                        )}
                      </div>

                      {ocrResult && !ocrLoading && (
                        <>
                          <TTSBlock text={ocrResult.text || "No text found in this image."} tts={tts} />
                          <div style={{ padding: "0 18px 14px", display: "flex", gap: 8 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => copyText(ocrResult.text)}>📋 Copy</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => exportTxt(ocrResult.text, "Text Scan")}>💾 Export</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {!ocrResult && !ocrLoading && (
                    <div className="analyze-strip">
                      <button className="btn btn-vis" onClick={runOCR} aria-label="Scan image for text">👁 Scan Text</button>
                    </div>
                  )}
                  {ocrResult && (
                    <div className="analyze-strip">
                      <button className="btn btn-ghost" onClick={() => { setOcrResult(null); setTextImg(null); setReadMode(false); tts.stop(); }}>🔄 Scan Another</button>
                    </div>
                  )}
                </>
              )}
              {ocrError && <div className="err" role="alert">⚠️ {ocrError}</div>}
            </div>
          )}

          {/* ══ LIVE CAPTIONS ═════════════════════════════════════════════════ */}
          {tab === "captions" && (
            <div>
              <div className="pg-head">
                <h1 className="pg-title">Live <span className="hc">Captions</span></h1>
                <p className="pg-sub">
                  Real-time speech-to-text. Works on most networks — automatically switches to offline mode if your network blocks speech servers. Use Chrome or Edge.
                </p>
              </div>

              <div className={`caption-display${captionOn ? " active" : ""}`}
                aria-live="polite" aria-label="Live captions display"
                style={{ "--cap-fs": FONT_SIZES[fontSize] }}>
                {captionOn && (
                  <div className="live-pill" aria-label="Microphone active">
                    <div className="live-dot" aria-hidden="true" />LIVE
                  </div>
                )}
                {captionStatus && (
                  <div style={{ position: "absolute", top: 14, left: 14, fontSize: 11, color: "var(--hear)", fontWeight: 600, letterSpacing: "0.5px" }}
                    aria-live="polite">{captionStatus}</div>
                )}
                {captionLog.length === 0 && !captionInterim ? (
                  <p className="caption-placeholder">
                    {captionOn ? "Listening… start speaking." : "Press Start Captions to begin."}
                  </p>
                ) : (
                  <div className="caption-scroll">
                    {captionLog.map((line, i) => (
                      <p key={i} className="caption-final" style={{ fontSize: FONT_SIZES[fontSize] }}>{line}</p>
                    ))}
                    {captionInterim && (
                      <p className="caption-interim" style={{ fontSize: FONT_SIZES[fontSize] }}>{captionInterim}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="caption-controls">
                {captionOn
                  ? <button className="btn btn-red btn-lg" onClick={stopCaptions}>⏹ Stop</button>
                  : <button className="btn btn-hear btn-lg" onClick={startCaptions}>🎙 Start Captions</button>}
                {captionLog.length > 0 && (
                  <>
                    <button className="btn btn-ghost" onClick={() => exportTxt(captionLog.join("\n"), "Captions")}>📄 Export</button>
                    <button className="btn btn-red"   onClick={clearCaptions}>🗑 Clear</button>
                  </>
                )}
                <div className="font-btns" role="group" aria-label="Caption text size">
                  {[["sm","A","Small","13px"],["md","A","Medium","16px"],["lg","A","Large","20px"]].map(([key,label,name,size]) => (
                    <button key={key} className={`fbt${fontSize === key ? " on" : ""}`}
                      style={{ fontSize: size }}
                      aria-pressed={fontSize === key} aria-label={name + " text"}
                      onClick={() => setFontSize(key)}>{label}</button>
                  ))}
                </div>
              </div>

              {captionLog.length > 0 && (
                <div className="transcript-box">
                  <div className="tb-head">
                    <span className="tb-title">Full Transcript</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => copyText(captionLog.join("\n"))}>📋 Copy All</button>
                  </div>
                  <div className="tb-body">{captionLog.join(" ")}</div>
                </div>
              )}
            </div>
          )}

          {/* ══ COLOR FINDER ══════════════════════════════════════════════════ */}
          {tab === "color" && (
            <div>
              <div className="pg-head">
                <h1 className="pg-title">Color <span className="vc">Finder</span></h1>
                <p className="pg-sub">
                  Photograph any item — clothing, produce, packaging — and Beacon identifies its dominant colors by name and reads them aloud. Fully offline, instant results.
                </p>
              </div>

              {!colorCamOn && !colorImg && (
                <>
                  <div className="dz" tabIndex={0} role="button"
                    aria-label="Upload an image to identify its colors."
                    onClick={() => colorFileRef.current?.click()}
                    onKeyDown={e => (e.key === "Enter" || e.key === " ") && colorFileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("over"); }}
                    onDragLeave={e => e.currentTarget.classList.remove("over")}
                    onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("over"); loadFile(e.dataTransfer.files[0], setColorImg, setColorError); }}>
                    <input ref={colorFileRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => loadFile(e.target.files[0], setColorImg, setColorError)} />
                    <span className="dz-icon" aria-hidden="true">🎨</span>
                    <h3>Drop a photo to identify its colors</h3>
                    <p>Clothing, fruit, objects, paint swatches — any item with color</p>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => startCamera(setColorCamOn, setColorError)}>📷 Use Camera</button>
                  </div>
                </>
              )}

              {colorCamOn && (
                <CameraView videoRef={videoRef} canvasRef={canvasRef}
                  onCapture={() => capturePhoto(setColorImg, setColorCamOn)}
                  onCancel={() => { stopCamera(); }} />
              )}

              {colorImg && !colorCamOn && (
                <>
                  <div className="workspace">
                    <div className="img-panel">
                      <img src={colorImg.src} alt="Item to analyze for colors" />
                      <div className="img-footer">
                        <input ref={colorFileRef} type="file" accept="image/*" style={{ display: "none" }}
                          onChange={e => { loadFile(e.target.files[0], setColorImg, setColorError); setColorResult(null); }} />
                        <button className="btn btn-ghost btn-sm" onClick={() => colorFileRef.current?.click()}>🔄 Replace</button>
                        <button className="btn btn-red btn-sm" onClick={() => { setColorImg(null); setColorResult(null); tts.stop(); }}>🗑 Remove</button>
                      </div>
                    </div>

                    <div className="result-panel">
                      <div className="rp-head">
                        <span className="rp-label vis-label">Dominant Colors</span>
                      </div>
                      <div className="rp-body">
                        {colorLoading && (
                          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 0", color: "var(--dim)" }}>
                            <div className="spin" role="status" /><span>Analyzing colors…</span>
                          </div>
                        )}
                        {!colorLoading && !colorResult && (
                          <p style={{ color: "var(--mute)", fontSize: 14 }}>Click Find Colors to analyze this image.</p>
                        )}
                        {colorResult && !colorLoading && (
                          <>
                            <div className="color-list" role="list" aria-label="Colors found in image">
                              {colorResult.map((c, i) => (
                                <div key={i} className="color-item" role="listitem"
                                  aria-label={`Color ${i + 1}: ${c.name}`}>
                                  <span className="color-rank" aria-hidden="true">{i + 1}</span>
                                  <div className="color-swatch" style={{ background: c.hex }} aria-hidden="true" />
                                  <div className="color-info">
                                    <div className="color-name">{c.name}</div>
                                    <div className="color-hex">{c.hex}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="color-summary">
                              <strong>Spoken summary: </strong>
                              {colorResult.length === 1
                                ? `This item is ${colorResult[0].name}.`
                                : `This appears to be a ${colorResult[0].name} item with ${colorResult.slice(1, 3).map(c => c.name).join(" and ")} details.`}
                            </div>
                          </>
                        )}
                      </div>
                      {colorResult && !colorLoading && (
                        <TTSBlock
                          text={colorResult.length === 1
                            ? `This item is ${colorResult[0].name}.`
                            : `This appears to be a ${colorResult[0].name} item with ${colorResult.slice(1, 3).map(c => c.name).join(" and ")} details. The five dominant colors are: ${colorResult.map(c => c.name).join(", ")}.`}
                          tts={tts} />
                      )}
                    </div>
                  </div>

                  {!colorResult && !colorLoading && (
                    <div className="analyze-strip">
                      <button className="btn btn-vis" onClick={runColorAnalysis} aria-label="Identify colors in this image">🎨 Find Colors</button>
                    </div>
                  )}
                  {colorResult && (
                    <div className="analyze-strip">
                      <button className="btn btn-ghost" onClick={() => { setColorResult(null); setColorImg(null); tts.stop(); }}>🔄 Analyze Another</button>
                    </div>
                  )}
                </>
              )}
              {colorError && <div className="err" role="alert">⚠️ {colorError}</div>}
            </div>
          )}

          {/* ══ SOUND VIEW ════════════════════════════════════════════════════ */}
          {tab === "sound" && (
            <div>
              <div className="pg-head">
                <h1 className="pg-title">Sound <span className="hc">View</span></h1>
                <p className="pg-sub">
                  Visualizes your audio environment in real time. Deaf and hard-of-hearing users can see whether there is silence, speech, or a sudden loud sound — without hearing it.
                </p>
              </div>

              <div className="sound-wrap">
                <canvas ref={soundCanvasRef} className="sound-canvas"
                  width={600} height={200}
                  aria-label="Real-time sound frequency visualizer" />
                {soundClass && (
                  <div className="sound-class-badge" style={{ color: soundClass.color }}
                    aria-live="polite" aria-label={`Sound classification: ${soundClass.label}`}>
                    <span aria-hidden="true">{soundClass.icon}</span>
                    {soundClass.label}
                  </div>
                )}
                {!soundOn && !soundClass && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mute)", fontSize: 15, fontStyle: "italic" }}>
                    Press Start to visualize sound
                  </div>
                )}
                <div className="flash-overlay" style={{ opacity: flash ? 1 : 0 }} aria-hidden="true" />
                <div className="sound-level-bar">
                  <div className="sound-level-fill"
                    style={{ width: `${soundLevel}%`, background: soundClass ? soundClass.color : "var(--hear)" }}
                    role="progressbar" aria-valuenow={soundLevel} aria-valuemin={0} aria-valuemax={100}
                    aria-label={`Sound level: ${soundLevel}%`} />
                </div>
              </div>

              <div className="sound-controls">
                {soundOn
                  ? <button className="btn btn-red btn-lg" onClick={stopSound} aria-label="Stop sound visualizer">⏹ Stop</button>
                  : <button className="btn btn-hear btn-lg" onClick={startSound} aria-label="Start sound visualizer">🎙 Start Visualizer</button>}
                {soundClass && (
                  <span className="sound-note" aria-live="polite">
                    Level: <strong style={{ color: "var(--hear)" }}>{soundLevel}%</strong>
                    {soundClass.level > 75 && " — ⚠️ Very loud!"}
                  </span>
                )}
              </div>

              {/* Legend */}
              <div style={{ marginTop: 22, background: "var(--surf)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "18px 20px", animation: "rise 0.4s ease both" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "var(--mute)", marginBottom: 14 }}>What each classification means</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                  {[
                    { icon: "🔇", label: "Silence",          desc: "No significant audio detected",            color: "#3a5878" },
                    { icon: "🗣️",  label: "Speech Detected",  desc: "Mid-range frequencies indicate a voice",   color: "#10b981" },
                    { icon: "🔔", label: "Sharp Sound",       desc: "High-frequency spike — possible alarm",    color: "#f59e0b" },
                    { icon: "🔉", label: "Low Frequency",     desc: "Bass-heavy sound like a vehicle or machine",color: "#8b5cf6" },
                    { icon: "🎵", label: "Background Sound",  desc: "General ambient noise",                    color: "#06b6d4" },
                    { icon: "🔴", label: "Very Loud",         desc: "Dangerously loud — screen flashes red",    color: "#ef4444" },
                  ].map(({ icon, label, desc, color }) => (
                    <div key={label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }} aria-hidden="true">{icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color }}>{label}</div>
                        <div style={{ fontSize: 12, color: "var(--dim)", lineHeight: 1.4, marginTop: 2 }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        <footer>
          Built for <strong>Kentucky TSA Software Development 2025</strong> · Beacon — Universal Accessibility Companion · Runs entirely in your browser
        </footer>
      </div>

      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
    </>
  );
}
