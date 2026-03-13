import { useState, useRef, useCallback, useEffect } from "react";

const API_URL = "https://api.anthropic.com/v1/messages";

const LABEL_SECTIONS = [
  { key: "name",          icon: "💊", label: "Medication Name"        },
  { key: "strength",      icon: "📏", label: "Strength & Dosage"      },
  { key: "instructions",  icon: "📋", label: "How to Take It"         },
  { key: "warnings",      icon: "⚠️",  label: "Warnings & Side Effects"},
  { key: "expiration",    icon: "📅", label: "Expiration Date"        },
  { key: "prescriber",    icon: "🏥", label: "Prescriber & Pharmacy"  },
  { key: "extra",         icon: "📝", label: "Additional Information" },
];

const SCAN_PROMPT = `You are a medication label reader helping a visually impaired person safely identify their medication. Analyze this image carefully and extract every piece of visible text from the medication label, bottle, box, or package.

Return ONLY a valid JSON object — no explanation, no markdown, no extra text — with exactly these fields:
{
  "name": "full brand name and generic/chemical name if shown",
  "strength": "dosage strength or concentration such as 500mg, 10mg per 5mL, etc.",
  "instructions": "complete dosing instructions — how many to take, how often, whether to take with food or water, any timing notes",
  "warnings": "all warnings, cautions, side effects, drug interactions, or do-not-use statements visible on the label",
  "expiration": "the expiration or use-by date exactly as written",
  "prescriber": "prescribing doctor name, pharmacy name, phone, address, prescription number, refills remaining — anything visible",
  "extra": "storage instructions, lot number, manufacturer, any other important information not covered above",
  "notMedication": false
}

If a field is not visible on the label, write exactly: "Not visible on label"
If the image does not show a medication at all, set "notMedication" to true and leave all other fields as empty strings.
Be thorough. Accuracy matters — this person's safety depends on it.`;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600&family=Outfit:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:          #0b1120;
    --surface:     #111827;
    --surface2:    #1a2540;
    --surface3:    #1f2d4d;
    --border:      #1e3058;
    --border-h:    #2e4a7a;
    --teal:        #2dd4bf;
    --teal-dim:    #0d9488;
    --teal-glow:   rgba(45, 212, 191, 0.1);
    --teal-glow2:  rgba(45, 212, 191, 0.18);
    --amber:       #fbbf24;
    --amber-glow:  rgba(251, 191, 36, 0.1);
    --red:         #f87171;
    --red-glow:    rgba(248, 113, 113, 0.1);
    --green:       #34d399;
    --green-glow:  rgba(52, 211, 153, 0.1);
    --purple:      #a78bfa;
    --text:        #dce8f8;
    --text-dim:    #a0b4cc;
    --muted:       #5a7298;
    --muted2:      #344d6e;
    --r:           16px;
    --rsm:         10px;
    --t:           0.17s ease;
    --display:     'Fraunces', serif;
    --body:        'Outfit', sans-serif;
  }

  body.hc {
    --bg: #000; --surface: #090909; --surface2: #111; --surface3: #1a1a1a;
    --border: #ffffff; --border-h: #ffffff;
    --teal: #ffff00; --teal-dim: #dddd00; --teal-glow: rgba(255,255,0,0.12); --teal-glow2: rgba(255,255,0,0.2);
    --amber: #ff8800; --text: #ffffff; --text-dim: #dddddd; --muted: #aaaaaa;
  }
  body.hc .bg-glow { display: none; }

  body {
    font-family: var(--body);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    line-height: 1.5;
  }

  .bg-glow {
    position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
  }
  .glow-blob {
    position: absolute; border-radius: 50%;
    filter: blur(110px); opacity: 0.055;
    animation: blob-drift 16s ease-in-out infinite alternate;
  }
  .blob-a { width: 700px; height: 700px; background: var(--teal); top: -250px; left: -200px; animation-delay: 0s; }
  .blob-b { width: 450px; height: 450px; background: var(--purple); bottom: -150px; right: -100px; animation-delay: -7s; }
  @keyframes blob-drift {
    from { transform: scale(1) translate(0, 0); }
    to   { transform: scale(1.08) translate(25px, 18px); }
  }

  .app { min-height: 100vh; display: flex; flex-direction: column; position: relative; z-index: 1; }

  .skip-to-main {
    position: absolute; top: -999px; left: 0;
    padding: 10px 18px; background: var(--teal); color: #041018;
    font-weight: 700; font-family: var(--body); z-index: 9999;
    border-radius: 0 0 8px 0;
  }
  .skip-to-main:focus { top: 0; }

  header {
    padding: 14px 36px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    border-bottom: 1px solid var(--border);
    background: rgba(11, 17, 32, 0.88);
    backdrop-filter: blur(16px);
    position: sticky; top: 0; z-index: 100;
  }

  .logo { display: flex; align-items: center; gap: 12px; }
  .logo-mark {
    width: 40px; height: 40px; border-radius: 11px;
    background: linear-gradient(135deg, var(--teal), var(--teal-dim));
    display: flex; align-items: center; justify-content: center;
    font-size: 19px; flex-shrink: 0;
    box-shadow: 0 0 20px var(--teal-glow2);
  }
  .logo-wordmark {
    font-family: var(--display); font-size: 21px; font-weight: 700; letter-spacing: 0.2px;
  }
  .logo-wordmark em { font-style: normal; color: var(--teal); }

  .header-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .tsa-badge {
    font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    padding: 4px 11px; border-radius: 999px;
    border: 1px solid rgba(45, 212, 191, 0.25);
    color: var(--teal); background: var(--teal-glow);
  }
  .ctrl-btn {
    width: 36px; height: 36px; border-radius: 9px;
    border: 1px solid var(--border); background: var(--surface2);
    color: var(--muted); cursor: pointer; font-size: 16px;
    display: flex; align-items: center; justify-content: center;
    transition: all var(--t); font-family: var(--body);
  }
  .ctrl-btn:hover { border-color: var(--teal); color: var(--teal); background: var(--teal-glow); }
  .ctrl-btn.active { border-color: var(--teal); color: var(--teal); background: var(--teal-glow); }
  .ctrl-btn:focus-visible { outline: 3px solid var(--teal); outline-offset: 2px; }

  nav {
    display: flex; justify-content: center; gap: 4px;
    padding: 16px 36px 0;
    background: rgba(11, 17, 32, 0.55);
    border-bottom: 1px solid var(--border);
  }
  .nav-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 22px; border-radius: 12px 12px 0 0;
    border: 1px solid transparent; border-bottom: none;
    font-family: var(--body); font-size: 14px; font-weight: 600;
    color: var(--muted); background: none; cursor: pointer;
    transition: all var(--t);
    position: relative; bottom: -1px;
  }
  .nav-btn:hover { color: var(--text); background: var(--surface2); }
  .nav-btn.active {
    color: var(--teal); background: var(--surface);
    border-color: var(--border); border-bottom-color: var(--surface);
  }
  .nav-btn:focus-visible { outline: 3px solid var(--teal); outline-offset: 2px; }
  .nav-badge {
    min-width: 20px; height: 20px; padding: 0 5px;
    border-radius: 999px; background: var(--teal);
    color: #041018; font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }

  main { flex: 1; padding: 36px; max-width: 940px; margin: 0 auto; width: 100%; }

  .page-header { margin-bottom: 28px; animation: enter 0.5s ease both; }
  .page-title {
    font-family: var(--display); font-size: 30px; font-weight: 700;
    line-height: 1.15; letter-spacing: -0.3px; margin-bottom: 6px;
  }
  .page-title em { font-style: italic; color: var(--teal); }
  .page-subtitle { color: var(--text-dim); font-size: 15px; line-height: 1.6; max-width: 520px; }

  .warning-bar {
    display: flex; align-items: flex-start; gap: 11px;
    padding: 12px 16px; border-radius: var(--rsm); margin-bottom: 22px;
    background: var(--amber-glow); border: 1px solid rgba(251, 191, 36, 0.3);
    font-size: 13px; color: var(--amber); line-height: 1.55;
    animation: enter 0.5s ease 0.05s both;
  }
  .warning-bar-icon { font-size: 15px; flex-shrink: 0; margin-top: 1px; }

  .input-toggle {
    display: flex; gap: 8px; justify-content: center; margin-bottom: 22px;
    animation: enter 0.5s ease 0.08s both;
  }
  .toggle-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 22px; border-radius: 999px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--muted); font-family: var(--body); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all var(--t);
  }
  .toggle-btn:hover { border-color: var(--border-h); color: var(--text); }
  .toggle-btn.active {
    border-color: transparent;
    background: linear-gradient(135deg, var(--teal), var(--teal-dim));
    color: #041018;
    box-shadow: 0 0 20px var(--teal-glow2);
  }
  .toggle-btn:focus-visible { outline: 3px solid var(--teal); outline-offset: 3px; }

  .drop-zone {
    border: 2px dashed var(--border); border-radius: var(--r);
    background: var(--surface); padding: 60px 36px;
    text-align: center; cursor: pointer;
    transition: all var(--t);
    animation: enter 0.5s ease 0.1s both;
  }
  .drop-zone:hover, .drop-zone.dragging {
    border-color: var(--teal); background: var(--teal-glow);
    box-shadow: inset 0 0 0 1px var(--teal), 0 0 40px var(--teal-glow);
  }
  .drop-zone:focus-visible { outline: 3px solid var(--teal); outline-offset: 3px; }
  .drop-icon { font-size: 54px; display: block; margin-bottom: 16px; }
  .drop-zone h3 { font-family: var(--display); font-size: 22px; font-weight: 700; margin-bottom: 8px; }
  .drop-zone p { color: var(--text-dim); font-size: 14px; }

  .cam-container {
    border-radius: var(--r); overflow: hidden; background: #000;
    position: relative; animation: enter 0.35s ease both;
  }
  .cam-container video { width: 100%; display: block; max-height: 420px; object-fit: cover; }
  .cam-controls {
    position: absolute; bottom: 0; left: 0; right: 0; padding: 24px;
    display: flex; justify-content: center;
    background: linear-gradient(transparent, rgba(0,0,0,0.65));
  }
  .shutter-ring {
    width: 70px; height: 70px; border-radius: 50%;
    border: 4px solid rgba(255,255,255,0.85);
    background: rgba(255,255,255,0.12); backdrop-filter: blur(4px);
    cursor: pointer; transition: all var(--t);
    display: flex; align-items: center; justify-content: center;
  }
  .shutter-ring:hover { background: rgba(255,255,255,0.25); transform: scale(1.04); }
  .shutter-ring:focus-visible { outline: 3px solid var(--teal); }
  .shutter-dot { width: 48px; height: 48px; border-radius: 50%; background: white; }

  .workspace {
    display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
    animation: enter 0.4s ease both;
  }
  @media (max-width: 660px) { .workspace { grid-template-columns: 1fr; } }

  .image-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); overflow: hidden;
  }
  .image-card img {
    width: 100%; max-height: 290px; object-fit: contain;
    background: #070d1a; display: block;
  }
  .image-card-footer {
    padding: 10px 14px; display: flex; gap: 8px;
    border-top: 1px solid var(--border); flex-wrap: wrap;
  }

  .results-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); display: flex; flex-direction: column;
    min-height: 340px;
  }
  .results-card-header {
    padding: 16px 20px 14px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .results-card-title { font-family: var(--display); font-size: 17px; font-weight: 700; }

  .results-body { flex: 1; overflow-y: auto; }

  .info-row {
    display: flex; gap: 13px; align-items: flex-start;
    padding: 13px 20px; border-bottom: 1px solid var(--border);
  }
  .info-row:last-child { border-bottom: none; }
  .info-icon { font-size: 19px; flex-shrink: 0; margin-top: 2px; line-height: 1; }
  .info-content { flex: 1; min-width: 0; }
  .info-label {
    font-size: 10px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase;
    color: var(--muted); margin-bottom: 4px;
  }
  .info-value { font-size: 14px; line-height: 1.7; color: var(--text); }
  .info-value.not-visible { color: var(--muted); font-style: italic; font-size: 13px; }
  .info-value.warning-text { color: var(--amber); }

  .results-footer {
    padding: 14px 20px; border-top: 1px solid var(--border);
    display: flex; flex-direction: column; gap: 12px;
  }
  .tts-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .tts-label { font-size: 12px; color: var(--muted); font-weight: 600; margin-right: auto; }
  .speed-control { display: flex; align-items: center; gap: 9px; }
  .speed-label { font-size: 12px; color: var(--muted); white-space: nowrap; }
  .speed-input { accent-color: var(--teal); cursor: pointer; flex: 1; min-width: 80px; }
  .speed-display { font-size: 12px; color: var(--teal); font-weight: 700; min-width: 30px; }
  .save-controls { display: flex; gap: 8px; flex-wrap: wrap; }

  .loading-box {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 16px; padding: 40px 20px; flex: 1;
  }
  .spinner {
    width: 34px; height: 34px; border-radius: 50%;
    border: 3px solid var(--border); border-top-color: var(--teal);
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-label { color: var(--text-dim); font-size: 14px; text-align: center; }
  .loading-sub { color: var(--muted); font-size: 12px; text-align: center; max-width: 200px; line-height: 1.5; }

  .analyze-bar {
    display: flex; justify-content: center; gap: 10px; margin-top: 20px;
    animation: enter 0.4s ease both;
  }

  .btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 20px; border-radius: var(--rsm); border: none;
    font-family: var(--body); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all var(--t); white-space: nowrap;
  }
  .btn:focus-visible { outline: 3px solid var(--teal); outline-offset: 2px; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

  .btn-primary {
    background: linear-gradient(135deg, var(--teal), var(--teal-dim));
    color: #041018;
    box-shadow: 0 0 24px var(--teal-glow2);
  }
  .btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }

  .btn-ghost {
    background: var(--surface2); color: var(--text);
    border: 1px solid var(--border);
  }
  .btn-ghost:hover:not(:disabled) { border-color: var(--teal); color: var(--teal); }

  .btn-amber {
    background: var(--amber-glow); color: var(--amber);
    border: 1px solid rgba(251,191,36,0.3);
  }
  .btn-amber:hover:not(:disabled) { background: rgba(251,191,36,0.18); }

  .btn-danger {
    background: var(--red-glow); color: var(--red);
    border: 1px solid rgba(248,113,113,0.25);
  }
  .btn-danger:hover:not(:disabled) { background: rgba(248,113,113,0.18); }

  .btn-green {
    background: var(--green-glow); color: var(--green);
    border: 1px solid rgba(52,211,153,0.3);
  }
  .btn-green:hover:not(:disabled) { background: rgba(52,211,153,0.18); }

  .btn-sm { padding: 7px 13px; font-size: 13px; border-radius: 8px; }

  .error-box {
    background: var(--red-glow); border: 1px solid rgba(248,113,113,0.3);
    border-radius: var(--rsm); padding: 14px 18px;
    color: var(--red); font-size: 14px; margin-top: 16px; line-height: 1.6;
  }

  .cabinet-empty {
    text-align: center; padding: 64px 24px; color: var(--muted);
    animation: enter 0.4s ease both;
  }
  .cabinet-empty .empty-icon { font-size: 56px; display: block; margin-bottom: 16px; }
  .cabinet-empty p { font-size: 16px; margin-bottom: 20px; line-height: 1.6; }

  .cabinet-search-row {
    display: flex; gap: 10px; margin-bottom: 20px;
    animation: enter 0.4s ease both;
  }
  .search-input {
    flex: 1; padding: 10px 16px; border-radius: var(--rsm);
    border: 1px solid var(--border); background: var(--surface);
    color: var(--text); font-family: var(--body); font-size: 14px;
    transition: border var(--t);
  }
  .search-input:focus { outline: none; border-color: var(--teal); }
  .search-input::placeholder { color: var(--muted); }

  .cabinet-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 14px;
    animation: enter 0.4s ease both;
  }

  .med-card {
    background: var(--surface); border: 2px solid var(--border);
    border-radius: var(--r); padding: 18px; cursor: pointer;
    transition: all var(--t); position: relative;
  }
  .med-card:hover {
    border-color: var(--teal); transform: translateY(-3px);
    box-shadow: 0 8px 30px var(--teal-glow);
  }
  .med-card:focus-visible { outline: 3px solid var(--teal); outline-offset: 2px; }
  .med-card-icon { font-size: 30px; margin-bottom: 12px; display: block; }
  .med-card-name {
    font-family: var(--display); font-size: 16px; font-weight: 700;
    line-height: 1.3; margin-bottom: 5px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .med-card-strength { font-size: 12px; color: var(--teal); font-weight: 600; margin-bottom: 6px; }
  .med-card-date { font-size: 11px; color: var(--muted); }
  .med-card-delete {
    position: absolute; top: 10px; right: 10px;
    width: 26px; height: 26px; border-radius: 6px;
    border: none; background: rgba(0,0,0,0.6); color: var(--red);
    font-size: 13px; cursor: pointer;
    display: none; align-items: center; justify-content: center;
    transition: background var(--t);
  }
  .med-card:hover .med-card-delete,
  .med-card:focus-within .med-card-delete { display: flex; }
  .med-card-delete:hover { background: rgba(248,113,113,0.25); }
  .med-card-delete:focus-visible { outline: 3px solid var(--red); }

  .modal-backdrop {
    position: fixed; inset: 0; z-index: 200; padding: 20px;
    background: rgba(0,0,0,0.78); backdrop-filter: blur(10px);
    display: flex; align-items: center; justify-content: center;
    animation: fade-in 0.2s ease;
  }
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

  .modal-panel {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; max-width: 560px; width: 100%;
    max-height: 88vh; overflow-y: auto;
    animation: enter 0.28s ease both;
    display: flex; flex-direction: column;
  }
  .modal-top {
    padding: 22px 24px 18px; border-bottom: 1px solid var(--border);
    display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
    position: sticky; top: 0; background: var(--surface); z-index: 1;
    border-radius: 20px 20px 0 0;
  }
  .modal-drug-name { font-family: var(--display); font-size: 24px; font-weight: 700; line-height: 1.2; }
  .modal-drug-strength { font-size: 13px; color: var(--teal); font-weight: 600; margin-top: 4px; }
  .modal-sections { padding: 4px 0; }
  .modal-bottom {
    padding: 16px 24px; border-top: 1px solid var(--border);
    display: flex; flex-direction: column; gap: 12px;
    position: sticky; bottom: 0; background: var(--surface);
    border-radius: 0 0 20px 20px;
  }

  .about-section {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); padding: 26px;
    margin-bottom: 18px; animation: enter 0.4s ease both;
  }
  .about-section h2 {
    font-family: var(--display); font-size: 21px; font-weight: 700;
    margin-bottom: 12px; display: flex; align-items: center; gap: 9px;
  }
  .about-section p { color: var(--text-dim); font-size: 15px; line-height: 1.7; margin-bottom: 10px; }
  .about-section p:last-child { margin-bottom: 0; }

  .stats-row {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 12px;
    margin: 18px 0;
  }
  .stat-tile {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--rsm); padding: 18px; text-align: center;
  }
  .stat-number {
    font-family: var(--display); font-size: 36px; font-weight: 700;
    color: var(--teal); line-height: 1;
  }
  .stat-note { font-size: 12px; color: var(--muted); margin-top: 6px; line-height: 1.45; }

  .feature-list { list-style: none; margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
  .feature-list li {
    display: flex; align-items: flex-start; gap: 10px;
    font-size: 14px; color: var(--text-dim); line-height: 1.5;
  }
  .feature-list li span:first-child { font-size: 16px; flex-shrink: 0; margin-top: 1px; }

  .toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    background: var(--surface2); border: 1px solid var(--teal);
    border-radius: 10px; padding: 12px 20px;
    font-size: 14px; font-weight: 600; color: var(--teal);
    box-shadow: 0 6px 28px rgba(0,0,0,0.5);
    animation: enter 0.25s ease both;
    max-width: 300px;
  }

  @keyframes enter {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: none; }
  }

  canvas { display: none; }
`;

function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(1.0);

  const speak = useCallback((text, onDone) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend   = () => { setSpeaking(false); onDone?.(); };
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [rate]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speaking, speak, stop, rate, setRate };
}

function buildSpokenSummary(info) {
  const parts = [];
  const notVisible = "Not visible on label";

  if (info.name         && info.name         !== notVisible) parts.push(`Medication: ${info.name}.`);
  if (info.strength     && info.strength     !== notVisible) parts.push(`Strength: ${info.strength}.`);
  if (info.instructions && info.instructions !== notVisible) parts.push(`Instructions: ${info.instructions}.`);
  if (info.warnings     && info.warnings     !== notVisible) parts.push(`Warnings: ${info.warnings}.`);
  if (info.expiration   && info.expiration   !== notVisible) parts.push(`Expiration date: ${info.expiration}.`);
  if (info.prescriber   && info.prescriber   !== notVisible) parts.push(`${info.prescriber}.`);
  if (info.extra        && info.extra        !== notVisible) parts.push(`${info.extra}.`);

  parts.push("Always confirm your medication details with your pharmacist or doctor.");
  return parts.join(" ");
}

async function callClaudeVision(base64, mimeType, prompt) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mimeType, data: base64 } },
          { type: "text",  text: prompt },
        ],
      }],
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.content.filter(b => b.type === "text").map(b => b.text).join("");
}

function parseMedInfo(rawText) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  }
  return JSON.parse(cleaned);
}

export default function MediSight() {
  const [tab,        setTab]        = useState("scan");
  const [cabinet,    setCabinet]    = useState(() => {
    try { return JSON.parse(localStorage.getItem("medisight_cabinet") || "[]"); } catch { return []; }
  });
  const [highContrast, setHighContrast] = useState(false);
  const [toast,        setToast]        = useState(null);

  const [image,     setImage]     = useState(null);
  const [medInfo,   setMedInfo]   = useState(null);
  const [scanning,  setScanning]  = useState(false);
  const [scanError, setScanError] = useState(null);
  const [dragging,  setDragging]  = useState(false);
  const [cameraOn,  setCameraOn]  = useState(false);

  const [cabinetSearch, setCabinetSearch] = useState("");
  const [detailItem,    setDetailItem]    = useState(null);

  const speech    = useSpeech();
  const fileInput = useRef();
  const videoEl   = useRef();
  const canvasEl  = useRef();
  const streamRef = useRef();

  useEffect(() => {
    try { localStorage.setItem("medisight_cabinet", JSON.stringify(cabinet)); } catch {}
  }, [cabinet]);

  useEffect(() => {
    document.body.classList.toggle("hc", highContrast);
  }, [highContrast]);

  useEffect(() => {
    return () => {
      stopCamera();
      window.speechSynthesis.cancel();
    };
  }, []);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  async function startCamera() {
    setScanError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setCameraOn(true);
      setTimeout(() => {
        if (videoEl.current) {
          videoEl.current.srcObject = stream;
          videoEl.current.play();
        }
      }, 80);
    } catch {
      setScanError("Camera access was denied. Please allow camera permissions in your browser, or use the file upload option instead.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  }

  function captureFromCamera() {
    const video  = videoEl.current;
    const canvas = canvasEl.current;
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setImage({ src: dataUrl, base64: dataUrl.split(",")[1], type: "image/jpeg" });
    setMedInfo(null);
    setScanError(null);
    stopCamera();
  }

  function loadImageFile(file) {
    if (!file?.type.startsWith("image/")) {
      setScanError("Please select an image file (JPG, PNG, WEBP, etc.)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      setImage({ src, base64: src.split(",")[1], type: file.type });
      setMedInfo(null);
      setScanError(null);
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImage(null);
    setMedInfo(null);
    setScanError(null);
    speech.stop();
    if (fileInput.current) fileInput.current.value = "";
  }

  async function runScan() {
    if (!image) return;
    setScanning(true);
    setMedInfo(null);
    setScanError(null);
    speech.stop();

    try {
      const raw  = await callClaudeVision(image.base64, image.type, SCAN_PROMPT);
      const info = parseMedInfo(raw);

      if (info.notMedication) {
        setScanError("This image doesn't appear to show a medication label. Please take a photo directly of the medication bottle, box, or packaging.");
        setScanning(false);
        return;
      }

      setMedInfo(info);
      speech.speak(buildSpokenSummary(info));
    } catch (err) {
      setScanError("Scan failed: " + err.message + ". Please check your connection and try again.");
    } finally {
      setScanning(false);
    }
  }

  function saveToCABINET() {
    if (!medInfo) return;
    const entry = {
      id:       Date.now().toString(),
      savedAt:  new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      info:     medInfo,
    };
    setCabinet(prev => [entry, ...prev]);
    showToast(`💊 Saved: ${medInfo.name}`);
  }

  function deleteMed(id) {
    setCabinet(prev => prev.filter(m => m.id !== id));
    if (detailItem?.id === id) setDetailItem(null);
    showToast("🗑 Removed from cabinet.");
  }

  function exportAsText(info, filename) {
    const lines = [
      "MediSight — Medication Report",
      `Generated: ${new Date().toLocaleString()}`,
      "─".repeat(40),
      `MEDICATION NAME: ${info.name}`,
      `STRENGTH: ${info.strength}`,
      `HOW TO TAKE IT: ${info.instructions}`,
      `WARNINGS: ${info.warnings}`,
      `EXPIRATION DATE: ${info.expiration}`,
      `PRESCRIBER & PHARMACY: ${info.prescriber}`,
      `ADDITIONAL INFO: ${info.extra}`,
      "─".repeat(40),
      "IMPORTANT: Always confirm medication details with your pharmacist or doctor.",
      "MediSight is an accessibility aid, not a substitute for professional medical advice.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const link = document.createElement("a");
    link.href     = URL.createObjectURL(blob);
    link.download = filename || `medisight-${Date.now()}.txt`;
    link.click();
    showToast("📄 Exported as text file!");
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("📋 Copied to clipboard!");
    } catch {
      showToast("Copy failed — try selecting and copying manually.");
    }
  }

  const filteredCabinet = cabinet.filter(item =>
    item.info.name.toLowerCase().includes(cabinetSearch.toLowerCase())
  );

  const NOT_VISIBLE = "Not visible on label";

  function MedInfoSections({ info }) {
    return (
      <div className="results-body" role="region" aria-label="Medication details">
        {LABEL_SECTIONS.map(({ key, icon, label }) => {
          const value   = info[key] || NOT_VISIBLE;
          const isEmpty = value === NOT_VISIBLE;
          return (
            <div key={key} className="info-row">
              <span className="info-icon" aria-hidden="true">{icon}</span>
              <div className="info-content">
                <div className="info-label">{label}</div>
                <div className={`info-value${isEmpty ? " not-visible" : key === "warnings" ? " warning-text" : ""}`}>
                  {value}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function TTSFooter({ info, compact }) {
    const summary = buildSpokenSummary(info);
    return (
      <>
        <div className="tts-controls">
          <span className="tts-label">🔊 Read Aloud</span>
          {speech.speaking ? (
            <button className="btn btn-ghost btn-sm" onClick={speech.stop} aria-label="Stop reading aloud">
              ⏹ Stop
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => speech.speak(summary)} aria-label="Read full medication details aloud">
              ▶ Play
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(summary)} aria-label="Copy full summary to clipboard">
            📋 Copy
          </button>
        </div>
        <div className="speed-control" role="group" aria-label="Adjust speech speed">
          <span className="speed-label" id="speed-label-main">Speed:</span>
          <input
            type="range" className="speed-input"
            min="0.5" max="2" step="0.1"
            value={speech.rate}
            onChange={e => speech.setRate(parseFloat(e.target.value))}
            aria-labelledby="speed-label-main"
            aria-valuetext={`${speech.rate.toFixed(1)} times normal speed`}
          />
          <span className="speed-display" aria-live="polite">{speech.rate.toFixed(1)}×</span>
        </div>
        {!compact && (
          <div className="save-controls">
            <button className="btn btn-green btn-sm" onClick={saveToCABINET} aria-label="Save this medication to your cabinet">
              💾 Save to Cabinet
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => exportAsText(info)} aria-label="Export medication details as a text file">
              📄 Export .txt
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <a className="skip-to-main" href="#main-content">Skip to main content</a>

      <div className="app">
        <div className="bg-glow" aria-hidden="true">
          <div className="glow-blob blob-a" />
          <div className="glow-blob blob-b" />
        </div>

        <header>
          <div className="logo">
            <div className="logo-mark" aria-hidden="true">💊</div>
            <span className="logo-wordmark">Medi<em>Sight</em></span>
          </div>
          <div className="header-controls">
            <span className="tsa-badge">TSA 2025</span>
            <button
              className={`ctrl-btn${highContrast ? " active" : ""}`}
              onClick={() => setHighContrast(p => !p)}
              aria-pressed={highContrast}
              aria-label={highContrast ? "Disable high contrast mode" : "Enable high contrast mode"}
              title="Toggle high contrast"
            >
              {highContrast ? "☀️" : "🌓"}
            </button>
          </div>
        </header>

        <nav role="tablist" aria-label="App navigation">
          {[
            { id: "scan",    icon: "📷", label: "Scan Label"  },
            { id: "cabinet", icon: "🗄",  label: "My Cabinet", count: cabinet.length },
            { id: "about",   icon: "ℹ️",  label: "About"      },
          ].map(({ id, icon, label, count }) => (
            <button
              key={id}
              className={`nav-btn${tab === id ? " active" : ""}`}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
              {count > 0 && <span className="nav-badge" aria-label={`${count} saved`}>{count}</span>}
            </button>
          ))}
        </nav>

        <main id="main-content" aria-live="polite" aria-atomic="false">

          {tab === "scan" && (
            <div>
              <div className="page-header">
                <h1 className="page-title">Scan a <em>Medication</em></h1>
                <p className="page-subtitle">
                  Photograph any pill bottle, package, or box. MediSight will read the entire label aloud — name, dose, instructions, warnings, and more.
                </p>
              </div>

              <div className="warning-bar" role="note" aria-label="Safety disclaimer">
                <span className="warning-bar-icon" aria-hidden="true">⚠️</span>
                <span>
                  <strong>Safety reminder:</strong> MediSight is an accessibility aid. Always confirm medication details with your pharmacist or doctor before taking any medication.
                </span>
              </div>

              {!cameraOn && !image && (
                <>
                  <div
                    className={`drop-zone${dragging ? " dragging" : ""}`}
                    tabIndex={0} role="button"
                    aria-label="Upload a medication photo. Click or drag and drop an image here."
                    onClick={() => fileInput.current?.click()}
                    onKeyDown={e => (e.key === "Enter" || e.key === " ") && fileInput.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => { e.preventDefault(); setDragging(false); loadImageFile(e.dataTransfer.files[0]); }}
                  >
                    <input
                      ref={fileInput} type="file" accept="image/*"
                      style={{ display: "none" }}
                      onChange={e => loadImageFile(e.target.files[0])}
                      aria-label="Select a medication photo"
                    />
                    <span className="drop-icon" aria-hidden="true">💊</span>
                    <h3>Drop your medication photo here</h3>
                    <p>or click to browse your files · JPG, PNG, WEBP supported</p>
                  </div>

                  <div className="input-toggle" style={{ marginTop: 14, justifyContent: "flex-start" }}>
                    <button className="btn btn-ghost" onClick={startCamera} aria-label="Open camera to photograph a medication label">
                      📷 Use Camera Instead
                    </button>
                  </div>
                </>
              )}

              {cameraOn && (
                <div className="cam-container" aria-label="Camera preview">
                  <video ref={videoEl} autoPlay playsInline muted aria-label="Live camera feed" />
                  <canvas ref={canvasEl} aria-hidden="true" />
                  <div className="cam-controls">
                    <button className="shutter-ring" onClick={captureFromCamera} aria-label="Capture photo">
                      <div className="shutter-dot" />
                    </button>
                  </div>
                </div>
              )}

              {cameraOn && (
                <div style={{ marginTop: 14 }}>
                  <button className="btn btn-ghost" onClick={stopCamera} aria-label="Cancel camera and use file upload">
                    ✕ Cancel Camera
                  </button>
                </div>
              )}

              {image && !cameraOn && (
                <>
                  <div className="workspace">
                    <div className="image-card" aria-label="Uploaded medication photo">
                      <img src={image.src} alt="Medication label ready to be analyzed" />
                      <div className="image-card-footer">
                        <input
                          ref={fileInput} type="file" accept="image/*"
                          style={{ display: "none" }}
                          onChange={e => loadImageFile(e.target.files[0])}
                          aria-label="Replace image"
                        />
                        <button className="btn btn-ghost btn-sm" onClick={() => fileInput.current?.click()} aria-label="Replace with a different photo">
                          🔄 Replace
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={clearImage} aria-label="Remove image and start over">
                          🗑 Remove
                        </button>
                      </div>
                    </div>

                    <div className="results-card">
                      {scanning ? (
                        <div className="loading-box" aria-live="polite" aria-label="Scanning medication label, please wait">
                          <div className="spinner" role="status" aria-label="Loading" />
                          <p className="loading-label">Reading your medication label…</p>
                          <p className="loading-sub">Extracting name, dosage, instructions, and warnings.</p>
                        </div>
                      ) : medInfo ? (
                        <>
                          <div className="results-card-header">
                            <span className="results-card-title">Label Results</span>
                          </div>
                          <MedInfoSections info={medInfo} />
                          <div className="results-footer">
                            <TTSFooter info={medInfo} compact={false} />
                          </div>
                        </>
                      ) : (
                        <div className="loading-box">
                          <span style={{ fontSize: 42 }} aria-hidden="true">🔍</span>
                          <p className="loading-label">Ready to scan</p>
                          <p className="loading-sub">Click "Scan Label" below to identify your medication.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {!scanning && !medInfo && (
                    <div className="analyze-bar">
                      <button className="btn btn-primary" onClick={runScan} aria-label="Scan the medication label and read it aloud">
                        💊 Scan Label
                      </button>
                    </div>
                  )}

                  {!scanning && medInfo && (
                    <div className="analyze-bar">
                      <button className="btn btn-ghost" onClick={() => { setMedInfo(null); speech.stop(); }} aria-label="Scan a different medication">
                        🔄 Scan Another
                      </button>
                    </div>
                  )}
                </>
              )}

              {scanError && (
                <div className="error-box" role="alert" aria-live="assertive">
                  ⚠️ {scanError}
                </div>
              )}
            </div>
          )}

          {tab === "cabinet" && (
            <div>
              <div className="page-header">
                <h1 className="page-title">My <em>Cabinet</em></h1>
                <p className="page-subtitle">Your saved medications. Tap any entry to hear its full details read aloud.</p>
              </div>

              {cabinet.length === 0 ? (
                <div className="cabinet-empty">
                  <span className="empty-icon" aria-hidden="true">🗄</span>
                  <p>Your medicine cabinet is empty.<br />Scan a medication label to save it here.</p>
                  <button className="btn btn-primary" onClick={() => setTab("scan")} aria-label="Go to the scan tab to add a medication">
                    💊 Scan Your First Medication
                  </button>
                </div>
              ) : (
                <>
                  <div className="cabinet-search-row">
                    <input
                      type="search" className="search-input"
                      placeholder="Search by medication name…"
                      value={cabinetSearch}
                      onChange={e => setCabinetSearch(e.target.value)}
                      aria-label="Search your saved medications"
                    />
                    <button className="btn btn-ghost" onClick={() => setTab("scan")} aria-label="Scan a new medication to add to cabinet">
                      ➕ Add New
                    </button>
                  </div>

                  {filteredCabinet.length === 0 ? (
                    <p style={{ color: "var(--muted)", textAlign: "center", padding: "32px" }}>
                      No medications match "{cabinetSearch}".
                    </p>
                  ) : (
                    <div className="cabinet-grid" aria-label={`${filteredCabinet.length} saved medications`}>
                      {filteredCabinet.map(item => (
                        <div
                          key={item.id}
                          className="med-card"
                          tabIndex={0} role="button"
                          aria-label={`${item.info.name}, ${item.info.strength}. Saved ${item.savedAt}. Press Enter for full details.`}
                          onClick={() => setDetailItem(item)}
                          onKeyDown={e => e.key === "Enter" && setDetailItem(item)}
                        >
                          <span className="med-card-icon" aria-hidden="true">💊</span>
                          <div className="med-card-name">{item.info.name}</div>
                          <div className="med-card-strength">{item.info.strength}</div>
                          <div className="med-card-date">Saved {item.savedAt}</div>
                          <button
                            className="med-card-delete"
                            onClick={e => { e.stopPropagation(); deleteMed(item.id); }}
                            aria-label={`Delete ${item.info.name} from cabinet`}
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {tab === "about" && (
            <div>
              <div className="page-header">
                <h1 className="page-title">About <em>MediSight</em></h1>
                <p className="page-subtitle">Built for TSA Software Development 2025 — removing barriers for people with vision disabilities.</p>
              </div>

              <div className="about-section" aria-labelledby="problem-heading">
                <h2 id="problem-heading">💊 The Problem We're Solving</h2>
                <p>
                  For the 285 million people worldwide with vision impairment, something as fundamental as taking the right medication safely is a daily challenge. Unable to read prescription labels, millions rely on sighted family members, risky memorization, or rubber-band labeling systems.
                </p>
                <div className="stats-row" role="list" aria-label="Statistics">
                  {[
                    { num: "89%", note: "of visually impaired people cannot read their own prescription labels" },
                    { num: "58%", note: "don't know the name of the medication they're taking" },
                    { num: "75%", note: "don't know their medication's expiration date" },
                    { num: "82%", note: "have difficulty recognizing the correct dose" },
                  ].map(({ num, note }) => (
                    <div key={num} className="stat-tile" role="listitem">
                      <div className="stat-number">{num}</div>
                      <div className="stat-note">{note}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
                  Sources: Archive of Pharmacy Practice (2017), PMC / Saudi Pharmaceutical Journal (2020), ScienceDirect (2025)
                </p>
              </div>

              <div className="about-section" aria-labelledby="features-heading">
                <h2 id="features-heading">✨ What MediSight Does</h2>
                <ul className="feature-list" role="list">
                  {[
                    ["📷", "Photograph any medication bottle, box, or blister pack"],
                    ["🔍", "AI reads every piece of text on the label — name, dose, instructions, warnings, expiry"],
                    ["🔊", "Speaks the full results aloud automatically — no reading required"],
                    ["💾", "Saves medications to a personal cabinet for instant future access"],
                    ["📄", "Exports results as a plain text file for caregivers or doctors"],
                    ["🌓", "High contrast mode for low-vision users"],
                    ["⌨️", "Fully keyboard navigable — works without a mouse"],
                  ].map(([icon, text]) => (
                    <li key={text} role="listitem">
                      <span aria-hidden="true">{icon}</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="about-section" aria-labelledby="disclaimer-heading">
                <h2 id="disclaimer-heading">⚠️ Important Disclaimer</h2>
                <p>
                  MediSight is an <strong>accessibility tool</strong>, not a substitute for professional medical advice. AI label reading can make errors, especially on damaged, blurry, or partially visible labels.
                </p>
                <p>
                  Always confirm medication name, dosage, and instructions with a licensed pharmacist or physician before taking any medication. If you are unsure about a medication, contact a healthcare professional.
                </p>
              </div>
            </div>
          )}
        </main>

        <footer style={{ textAlign: "center", padding: "22px 36px", color: "var(--muted)", fontSize: 13, borderTop: "1px solid var(--border)" }}>
          Built for <strong style={{ color: "var(--teal)" }}>TSA Software Development 2025</strong> · MediSight — AI Medication Accessibility Assistant
        </footer>
      </div>

      {detailItem && (
        <div
          className="modal-backdrop"
          role="dialog" aria-modal="true"
          aria-label={`Medication details: ${detailItem.info.name}`}
          onClick={e => e.target === e.currentTarget && setDetailItem(null)}
          onKeyDown={e => e.key === "Escape" && setDetailItem(null)}
        >
          <div className="modal-panel">
            <div className="modal-top">
              <div>
                <div className="modal-drug-name">{detailItem.info.name}</div>
                <div className="modal-drug-strength">{detailItem.info.strength}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setDetailItem(null)} aria-label="Close medication details">
                ✕
              </button>
            </div>

            <div className="modal-sections">
              <MedInfoSections info={detailItem.info} />
            </div>

            <div className="modal-bottom">
              <TTSFooter info={detailItem.info} compact={true} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => exportAsText(detailItem.info, `medisight-${detailItem.info.name.replace(/\s+/g, "-").toLowerCase()}.txt`)}
                  aria-label="Export medication details as a text file"
                >📄 Export .txt</button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteMed(detailItem.id)}
                  aria-label={`Delete ${detailItem.info.name} from cabinet`}
                >🗑 Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast" role="status" aria-live="polite">{toast}</div>
      )}
    </>
  );
}
