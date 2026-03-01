import { useState, useRef, useCallback, useEffect } from "react";

// ─── Anthropic API ────────────────────────────────────────────────────────────
const API_URL = "https://api.anthropic.com/v1/messages";

// ─── Analysis Modes ───────────────────────────────────────────────────────────
const MODES = [
  {
    id: "describe",
    label: "🔍 Describe Scene",
    short: "Scene",
    prompt:
      "You are an AI assistant helping visually impaired users understand images. Provide a detailed, clear, conversational description of this image — the scene, objects, people, colors, spatial layout, and any important context. Write as if narrating for someone who cannot see. Start directly with the description, no preamble.",
  },
  {
    id: "text",
    label: "📄 Read Text",
    short: "Text",
    prompt:
      "You are an AI assistant helping visually impaired users read text in images. Extract and transcribe ALL visible text exactly as it appears, preserving logical reading order. If there is no text, say so clearly. Cover signs, menus, documents, labels — everything.",
  },
  {
    id: "navigate",
    label: "🧭 Navigation Help",
    short: "Navigate",
    prompt:
      "You are an AI assistant helping a visually impaired person navigate safely. Analyze this image and describe: 1) Any obstacles or hazards present, 2) Available paths or routes, 3) Important signs, crossings, or landmarks, 4) An overall safety assessment. Be specific, practical, and prioritize safety.",
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&family=Instrument+Serif:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Theme Variables ── */
  :root {
    --bg: #06090f;
    --surface: #0e1420;
    --surface2: #151d2e;
    --border: #1c2a40;
    --border-hover: #2e4460;
    --accent: #3ecfff;
    --accent2: #a78bfa;
    --accent-glow: rgba(62,207,255,0.15);
    --text: #e2ebf8;
    --muted: #6b83a3;
    --success: #34d399;
    --danger: #f87171;
    --radius: 18px;
    --radius-sm: 10px;
    --transition: 0.18s ease;
    --font-display: 'Cabinet Grotesk', sans-serif;
    --font-body: 'Cabinet Grotesk', sans-serif;
  }

  /* ── High Contrast Theme ── */
  body.high-contrast {
    --bg: #000000;
    --surface: #0a0a0a;
    --surface2: #111111;
    --border: #ffffff;
    --border-hover: #ffffff;
    --accent: #ffff00;
    --accent2: #00ffff;
    --accent-glow: rgba(255,255,0,0.2);
    --text: #ffffff;
    --muted: #cccccc;
    --success: #00ff88;
    --danger: #ff4444;
  }

  body {
    font-family: var(--font-body);
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    font-size: 16px;
    line-height: 1.5;
    transition: background var(--transition), color var(--transition);
  }

  /* ── Background ── */
  .bg-canvas {
    position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
  }
  .bg-orb {
    position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.07;
    animation: pulse 12s ease-in-out infinite alternate;
  }
  .orb-a { width: 700px; height: 700px; background: var(--accent); top: -250px; left: -200px; animation-delay: 0s; }
  .orb-b { width: 500px; height: 500px; background: var(--accent2); bottom: -150px; right: -100px; animation-delay: -5s; }
  .orb-c { width: 350px; height: 350px; background: #06b6d4; top: 45%; left: 55%; animation-delay: -9s; }
  @keyframes pulse { from { transform: scale(1) translate(0,0); } to { transform: scale(1.12) translate(30px, 20px); } }
  body.high-contrast .bg-canvas { display: none; }

  /* ── Layout ── */
  .app { min-height: 100vh; display: flex; flex-direction: column; position: relative; z-index: 1; }

  /* ── Header ── */
  .header {
    padding: 18px 36px;
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
    border-bottom: 1px solid var(--border);
    background: rgba(6,9,15,0.7);
    backdrop-filter: blur(16px);
    position: sticky; top: 0; z-index: 100;
  }
  .logo { display: flex; align-items: center; gap: 11px; text-decoration: none; }
  .logo-mark {
    width: 40px; height: 40px; border-radius: 11px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: flex; align-items: center; justify-content: center; font-size: 19px;
    box-shadow: 0 0 20px var(--accent-glow);
  }
  .logo-name {
    font-family: var(--font-display); font-size: 20px; font-weight: 800;
    letter-spacing: -0.5px; color: var(--text);
  }
  .logo-name span { color: var(--accent); }

  .header-right { display: flex; align-items: center; gap: 10px; }
  .tsa-badge {
    font-size: 11px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase;
    padding: 4px 12px; border-radius: 999px;
    background: rgba(62,207,255,0.08); color: var(--accent); border: 1px solid rgba(62,207,255,0.25);
  }

  /* ── Icon Buttons ── */
  .icon-btn {
    width: 38px; height: 38px; border-radius: 10px;
    border: 1px solid var(--border); background: var(--surface2);
    color: var(--muted); cursor: pointer; font-size: 17px;
    display: flex; align-items: center; justify-content: center;
    transition: all var(--transition); font-family: inherit;
  }
  .icon-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-glow); }
  .icon-btn.active { border-color: var(--accent); color: var(--accent); background: var(--accent-glow); }
  .icon-btn:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }

  /* ── Main Content ── */
  .main {
    flex: 1; padding: 40px 36px;
    max-width: 1000px; margin: 0 auto; width: 100%;
  }

  /* ── Hero ── */
  .hero {
    text-align: center; margin-bottom: 40px;
    animation: slideUp 0.5s ease both;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    color: var(--accent); margin-bottom: 16px;
  }
  .hero-eyebrow::before, .hero-eyebrow::after {
    content: ''; display: block; width: 28px; height: 1px; background: var(--accent); opacity: 0.5;
  }
  .hero h1 {
    font-family: var(--font-display); font-size: clamp(30px, 5vw, 50px); font-weight: 800;
    line-height: 1.1; letter-spacing: -1px;
    background: linear-gradient(135deg, var(--text) 50%, var(--accent));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    margin-bottom: 14px;
  }
  body.high-contrast .hero h1 { -webkit-text-fill-color: var(--text); background: none; }
  .hero p { color: var(--muted); font-size: 16px; max-width: 440px; margin: 0 auto; line-height: 1.65; }

  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }

  /* ── Keyboard Shortcut Panel ── */
  .shortcuts-panel {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 24px;
    margin-bottom: 28px; animation: slideUp 0.3s ease both;
  }
  .shortcuts-title { font-weight: 700; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; }
  .shortcuts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
  .shortcut-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--muted); }
  .kbd {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 28px; height: 24px; padding: 0 6px;
    background: var(--surface2); border: 1px solid var(--border);
    border-bottom: 2px solid var(--border-hover);
    border-radius: 6px; font-size: 11px; font-weight: 700; font-family: monospace;
    color: var(--text); white-space: nowrap;
  }

  /* ── Input Tabs ── */
  .input-tabs {
    display: flex; gap: 8px; margin-bottom: 24px; justify-content: center;
    animation: slideUp 0.5s ease 0.05s both;
  }
  .tab-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 24px; border-radius: 999px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--muted); font-family: var(--font-body); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all var(--transition);
  }
  .tab-btn:hover { border-color: var(--border-hover); color: var(--text); }
  .tab-btn.active {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: #000; border-color: transparent; box-shadow: 0 0 20px var(--accent-glow);
  }
  .tab-btn:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }

  /* ── Upload Zone ── */
  .upload-zone {
    border: 2px dashed var(--border); border-radius: var(--radius);
    background: var(--surface); padding: 64px 40px;
    text-align: center; cursor: pointer;
    transition: all var(--transition);
    animation: slideUp 0.5s ease 0.1s both;
  }
  .upload-zone:hover, .upload-zone.dragging {
    border-color: var(--accent); background: var(--accent-glow);
    box-shadow: 0 0 40px var(--accent-glow);
  }
  .upload-zone:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
  .upload-icon { font-size: 56px; margin-bottom: 18px; display: block; }
  .upload-zone h3 { font-size: 19px; font-weight: 700; margin-bottom: 8px; }
  .upload-zone p { color: var(--muted); font-size: 14px; }

  /* ── Camera ── */
  .camera-wrap { border-radius: var(--radius); overflow: hidden; background: #000; position: relative; animation: slideUp 0.3s ease both; }
  .camera-wrap video { width: 100%; display: block; max-height: 400px; object-fit: cover; }
  .camera-overlay { position: absolute; inset: 0; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 28px; background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.5)); }
  .capture-ring {
    width: 70px; height: 70px; border-radius: 50%;
    border: 4px solid rgba(255,255,255,0.8);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all var(--transition);
    background: rgba(255,255,255,0.1); backdrop-filter: blur(4px);
  }
  .capture-ring:hover { background: rgba(255,255,255,0.25); transform: scale(1.05); }
  .capture-ring:focus-visible { outline: 3px solid var(--accent); }
  .capture-dot { width: 46px; height: 46px; border-radius: 50%; background: white; }

  /* ── Preview + Result Grid ── */
  .workspace { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; animation: slideUp 0.4s ease both; }
  @media (max-width: 680px) { .workspace { grid-template-columns: 1fr; } }

  /* ── Image Card ── */
  .img-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .img-card img { width: 100%; max-height: 280px; object-fit: contain; background: #000; display: block; }
  .img-actions { padding: 12px 14px; display: flex; gap: 8px; border-top: 1px solid var(--border); }

  /* ── Result Card ── */
  .result-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); display: flex; flex-direction: column; min-height: 320px; }
  .result-tabs-row { display: flex; border-bottom: 1px solid var(--border); }
  .rtab {
    flex: 1; padding: 13px 8px; text-align: center;
    font-family: var(--font-body); font-size: 12px; font-weight: 700;
    letter-spacing: 0.8px; text-transform: uppercase; color: var(--muted);
    border: none; background: none; cursor: pointer; transition: all var(--transition);
    border-bottom: 2px solid transparent; margin-bottom: -1px;
  }
  .rtab:hover { color: var(--text); }
  .rtab.active { color: var(--accent); border-bottom-color: var(--accent); }
  .rtab:focus-visible { outline: 3px solid var(--accent); }

  .result-body { flex: 1; padding: 20px; display: flex; flex-direction: column; }
  .result-text { font-size: 14px; line-height: 1.75; color: var(--text); flex: 1; }
  .result-empty { color: var(--muted); font-size: 13px; text-align: center; margin: auto; line-height: 1.6; }
  .loading-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px; color: var(--muted); margin: auto; }
  .spinner { width: 30px; height: 30px; border-radius: 50%; border: 3px solid var(--border); border-top-color: var(--accent); animation: spin 0.75s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Result Footer (TTS + Export) ── */
  .result-footer { border-top: 1px solid var(--border); padding: 12px 16px; }
  .tts-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
  .tts-label { font-size: 12px; color: var(--muted); font-weight: 600; letter-spacing: 0.5px; margin-right: auto; }
  .speed-row { display: flex; align-items: center; gap: 8px; }
  .speed-label { font-size: 12px; color: var(--muted); white-space: nowrap; }
  .speed-slider { flex: 1; accent-color: var(--accent); cursor: pointer; min-width: 80px; }
  .speed-value { font-size: 12px; color: var(--accent); font-weight: 700; min-width: 30px; }
  .export-row { display: flex; gap: 8px; margin-top: 10px; }

  /* ── Analyze Bar ── */
  .analyze-bar { margin-top: 22px; animation: slideUp 0.4s ease 0.05s both; }
  .mode-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; justify-content: center; }
  .mode-chip {
    padding: 7px 16px; border-radius: 999px;
    border: 1px solid var(--border); background: none;
    font-family: var(--font-body); font-size: 13px; font-weight: 600;
    color: var(--muted); cursor: pointer; transition: all var(--transition);
  }
  .mode-chip:hover { border-color: var(--border-hover); color: var(--text); }
  .mode-chip.active { border-color: var(--accent); color: var(--accent); background: var(--accent-glow); }
  .mode-chip:focus-visible { outline: 3px solid var(--accent); }
  .analyze-btn-row { display: flex; justify-content: center; gap: 10px; }

  /* ── Buttons ── */
  .btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 11px 22px; border-radius: var(--radius-sm); border: none;
    font-family: var(--font-body); font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all var(--transition); white-space: nowrap;
  }
  .btn:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
  .btn-primary { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #000; box-shadow: 0 0 24px var(--accent-glow); }
  .btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; transform: none; }
  .btn-ghost { background: var(--surface2); color: var(--text); border: 1px solid var(--border); }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
  .btn-sm { padding: 7px 14px; font-size: 13px; border-radius: 8px; }
  .btn-danger-soft { background: rgba(248,113,113,0.08); color: var(--danger); border: 1px solid rgba(248,113,113,0.25); }
  .btn-danger-soft:hover { background: rgba(248,113,113,0.15); }

  /* ── Toast ── */
  .toast {
    position: fixed; bottom: 28px; right: 28px; z-index: 999;
    background: var(--surface2); border: 1px solid var(--accent);
    border-radius: var(--radius-sm); padding: 12px 18px;
    font-size: 14px; font-weight: 600; color: var(--accent);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    animation: toastIn 0.3s ease both;
  }
  @keyframes toastIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }

  /* ── History ── */
  .history-section { margin-top: 52px; animation: slideUp 0.5s ease both; }
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .section-title { font-family: var(--font-display); font-size: 18px; font-weight: 800; letter-spacing: -0.3px; display: flex; align-items: center; gap: 9px; }
  .history-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); gap: 12px; }
  .history-item {
    background: var(--surface); border: 2px solid var(--border);
    border-radius: 13px; overflow: hidden; cursor: pointer;
    transition: all var(--transition);
  }
  .history-item:hover { border-color: var(--accent); transform: translateY(-3px); box-shadow: 0 8px 24px var(--accent-glow); }
  .history-item:focus-visible { outline: 3px solid var(--accent); }
  .history-item img { width: 100%; height: 100px; object-fit: cover; display: block; }
  .history-meta { padding: 8px 10px; }
  .history-mode { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--accent); margin-bottom: 3px; }
  .history-snippet { font-size: 11px; color: var(--muted); line-height: 1.4; }

  /* ── Error ── */
  .error-msg { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.3); border-radius: var(--radius-sm); padding: 14px 18px; color: var(--danger); font-size: 14px; margin-top: 16px; }

  /* ── Footer ── */
  footer { text-align: center; padding: 24px; color: var(--muted); font-size: 13px; border-top: 1px solid var(--border); margin-top: 40px; }
  footer span { color: var(--accent); font-weight: 700; }

  /* ── Skip Nav ── */
  .skip-nav { position: absolute; top: -999px; left: 0; padding: 10px 18px; background: var(--accent); color: #000; font-weight: 700; z-index: 9999; border-radius: 0 0 8px 0; }
  .skip-nav:focus { top: 0; }

  canvas { display: none; }
`;

// ─── Component ─────────────────────────────────────────────────────────────────
export default function EchoSight() {
  const [inputMode, setInputMode] = useState("upload");
  const [image, setImage] = useState(null);
  const [analyzeMode, setAnalyzeMode] = useState("describe");
  const [results, setResults] = useState({});
  const [activeTab, setActiveTab] = useState("describe");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [history, setHistory] = useState([]);
  const [cameraOn, setCameraOn] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef();
  const mainRef = useRef();

  // ── High contrast ──
  useEffect(() => {
    document.body.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e) => {
      // Don't fire if user is typing in an input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      switch (e.key) {
        case "u": case "U": if (!e.metaKey && !e.ctrlKey) fileInputRef.current?.click(); break;
        case "a": case "A": if (!e.metaKey && !e.ctrlKey && image && !loading) analyze(); break;
        case "r": case "R": if (!e.metaKey && !e.ctrlKey && results[activeTab]) speak(results[activeTab]); break;
        case "s": case "S": if (!e.metaKey && !e.ctrlKey) stopSpeak(); break;
        case "h": case "H": if (!e.metaKey && !e.ctrlKey) setHighContrast(p => !p); break;
        case "k": case "K": if (!e.metaKey && !e.ctrlKey) setShowShortcuts(p => !p); break;
        case "1": setAnalyzeMode("describe"); setActiveTab("describe"); break;
        case "2": setAnalyzeMode("text"); setActiveTab("text"); break;
        case "3": setAnalyzeMode("navigate"); setActiveTab("navigate"); break;
        case "Escape": stopSpeak(); setShowShortcuts(false); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [image, loading, results, activeTab]);

  // ── Camera ──
  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setInputMode("camera");
      setCameraOn(true);
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); } }, 100);
    } catch {
      setError("Camera access denied. Please allow camera permissions or use file upload instead.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  const capturePhoto = useCallback(() => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    const src = c.toDataURL("image/jpeg", 0.9);
    setImage({ src, base64: src.split(",")[1], type: "image/jpeg" });
    stopCamera();
    setInputMode("upload");
    setResults({});
    setError(null);
  }, [stopCamera]);

  // ── File upload ──
  const handleFile = useCallback((file) => {
    if (!file?.type.startsWith("image/")) { setError("Please upload an image file (JPG, PNG, WEBP, etc.)"); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      setImage({ src, base64: src.split(",")[1], type: file.type });
      setResults({});
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  // ── Analyze ──
  const analyze = useCallback(async () => {
    if (!image) return;
    const mode = MODES.find(m => m.id === analyzeMode);
    setLoading(true); setError(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: image.type, data: image.base64 } },
              { type: "text", text: mode.prompt },
            ],
          }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content.filter(c => c.type === "text").map(c => c.text).join("");
      setResults(prev => ({ ...prev, [analyzeMode]: text }));
      setActiveTab(analyzeMode);
      setHistory(prev => [{ src: image.src, result: text, mode: analyzeMode, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 7)]);
    } catch (err) {
      setError("Analysis failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [image, analyzeMode]);

  // ── TTS ──
  const speak = useCallback((text) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = speechRate; u.pitch = 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, [speechRate]);

  const stopSpeak = () => { window.speechSynthesis.cancel(); setSpeaking(false); };

  // ── Copy ──
  const copyResult = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("✅ Copied to clipboard!");
    } catch { showToast("❌ Copy failed — try selecting and copying manually."); }
  };

  // ── Export ──
  const exportTxt = (text, modeName) => {
    const blob = new Blob([`EchoSight Analysis\nMode: ${modeName}\nDate: ${new Date().toLocaleString()}\n\n${text}`], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `echosight-${modeName}-${Date.now()}.txt`;
    a.click();
    showToast("📄 Exported as .txt!");
  };

  // ── Toast ──
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  // ── Cleanup ──
  useEffect(() => () => { stopCamera(); window.speechSynthesis.cancel(); }, [stopCamera]);

  const currentResult = results[activeTab];
  const currentModeName = MODES.find(m => m.id === activeTab)?.label || activeTab;

  return (
    <>
      <style>{styles}</style>
      <a className="skip-nav" href="#main-content">Skip to main content</a>

      <div className="app">
        {/* Background */}
        <div className="bg-canvas" aria-hidden="true">
          <div className="bg-orb orb-a" /><div className="bg-orb orb-b" /><div className="bg-orb orb-c" />
        </div>

        {/* Header */}
        <header className="header">
          <a className="logo" href="#" aria-label="EchoSight home">
            <div className="logo-mark" aria-hidden="true">🔊</div>
            <span className="logo-name">Echo<span>Sight</span></span>
          </a>
          <div className="header-right">
            <span className="tsa-badge">TSA 2025</span>
            <button
              className={`icon-btn${showShortcuts ? " active" : ""}`}
              onClick={() => setShowShortcuts(p => !p)}
              aria-label="Toggle keyboard shortcuts panel"
              aria-expanded={showShortcuts}
              title="Keyboard shortcuts (K)"
            >⌨️</button>
            <button
              className={`icon-btn${highContrast ? " active" : ""}`}
              onClick={() => setHighContrast(p => !p)}
              aria-label={highContrast ? "Disable high contrast mode" : "Enable high contrast mode"}
              aria-pressed={highContrast}
              title="Toggle high contrast (H)"
            >{highContrast ? "☀️" : "🌓"}</button>
          </div>
        </header>

        {/* Main */}
        <main className="main" id="main-content" ref={mainRef}>
          {/* Hero */}
          <div className="hero">
            <div className="hero-eyebrow" aria-hidden="true">AI Visual Accessibility</div>
            <h1>Hear What<br />You Can't See</h1>
            <p>Upload an image or use your camera — EchoSight describes scenes, reads text, and guides navigation using AI.</p>
          </div>

          {/* Keyboard Shortcuts Panel */}
          {showShortcuts && (
            <div className="shortcuts-panel" role="region" aria-label="Keyboard shortcuts">
              <div className="shortcuts-title">⌨ Keyboard Shortcuts</div>
              <div className="shortcuts-grid">
                {[
                  ["U", "Upload image"], ["A", "Analyze image"], ["R", "Read result aloud"],
                  ["S", "Stop speaking"], ["H", "Toggle high contrast"], ["K", "Toggle this panel"],
                  ["1", "Scene description"], ["2", "Read text"], ["3", "Navigation help"],
                  ["Esc", "Stop / close"],
                ].map(([key, desc]) => (
                  <div className="shortcut-item" key={key}>
                    <span className="kbd">{key}</span>
                    <span>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Mode Tabs */}
          <div className="input-tabs" role="tablist" aria-label="Choose input method">
            <button
              className={`tab-btn${inputMode === "upload" && !cameraOn ? " active" : ""}`}
              role="tab" aria-selected={inputMode === "upload" && !cameraOn}
              onClick={() => { stopCamera(); setInputMode("upload"); }}
            >📁 Upload Image</button>
            <button
              className={`tab-btn${cameraOn ? " active" : ""}`}
              role="tab" aria-selected={cameraOn}
              onClick={cameraOn ? () => { stopCamera(); setInputMode("upload"); } : startCamera}
            >{cameraOn ? "⏹ Stop Camera" : "📷 Use Camera"}</button>
          </div>

          {/* Camera View */}
          {cameraOn && (
            <div className="camera-wrap">
              <video ref={videoRef} aria-label="Live camera preview" autoPlay playsInline muted />
              <canvas ref={canvasRef} aria-hidden="true" />
              <div className="camera-overlay">
                <button className="capture-ring" onClick={capturePhoto} aria-label="Capture photo">
                  <div className="capture-dot" />
                </button>
              </div>
            </div>
          )}

          {/* Upload Drop Zone */}
          {!cameraOn && !image && (
            <div
              className={`upload-zone${dragging ? " dragging" : ""}`}
              tabIndex={0} role="button"
              aria-label="Upload an image. Click or drag and drop a file here."
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={e => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            >
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => handleFile(e.target.files[0])} aria-label="Select an image file" />
              <span className="upload-icon" aria-hidden="true">🖼️</span>
              <h3>Drop an image here</h3>
              <p>or click to browse · Supports JPG, PNG, WEBP, and more</p>
            </div>
          )}

          {/* Workspace: Image + Results */}
          {image && !cameraOn && (
            <>
              <div className="workspace">
                {/* Image Preview */}
                <div className="img-card" aria-label="Uploaded image preview">
                  <img src={image.src} alt="The image selected for analysis" />
                  <div className="img-actions">
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => handleFile(e.target.files[0])} aria-label="Replace image" />
                    <button className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()} aria-label="Replace with a new image">🔄 Replace</button>
                    <button className="btn btn-danger-soft btn-sm"
                      onClick={() => { setImage(null); setResults({}); stopSpeak(); setError(null); }}
                      aria-label="Remove image">🗑 Remove</button>
                  </div>
                </div>

                {/* Result Panel */}
                <div className="result-card" aria-live="polite" aria-atomic="true">
                  {/* Tabs */}
                  <div className="result-tabs-row" role="tablist" aria-label="Analysis type results">
                    {MODES.map(m => (
                      <button key={m.id} className={`rtab${activeTab === m.id ? " active" : ""}`}
                        role="tab" aria-selected={activeTab === m.id}
                        aria-label={m.label + (results[m.id] ? " (has result)" : "")}
                        onClick={() => setActiveTab(m.id)}>
                        {m.short}
                        {results[m.id] && <span aria-hidden="true" style={{ marginLeft: 4, color: "var(--success)", fontSize: 10 }}>●</span>}
                      </button>
                    ))}
                  </div>

                  {/* Body */}
                  <div className="result-body" role="tabpanel" aria-label={`Result for ${currentModeName}`}>
                    {loading && analyzeMode === activeTab ? (
                      <div className="loading-state" aria-label="Analyzing, please wait">
                        <div className="spinner" role="status" aria-label="Loading" />
                        <span>Analyzing image…</span>
                      </div>
                    ) : currentResult ? (
                      <p className="result-text">{currentResult}</p>
                    ) : (
                      <p className="result-empty">
                        Select a mode below and click<br /><strong>Analyze Image</strong> to get started.
                      </p>
                    )}
                  </div>

                  {/* Footer: TTS + Speed + Export */}
                  {currentResult && (
                    <div className="result-footer">
                      <div className="tts-row">
                        <span className="tts-label">🔊 Read Aloud</span>
                        {speaking ? (
                          <button className="btn btn-ghost btn-sm" onClick={stopSpeak} aria-label="Stop reading aloud">⏹ Stop</button>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => speak(currentResult)} aria-label="Read result aloud">▶ Play</button>
                        )}
                      </div>
                      <div className="speed-row" role="group" aria-label="Speech speed control">
                        <span className="speed-label" id="speed-label">Speed:</span>
                        <input type="range" className="speed-slider" min="0.5" max="2" step="0.1"
                          value={speechRate} onChange={e => setSpeechRate(parseFloat(e.target.value))}
                          aria-labelledby="speed-label" aria-valuetext={`${speechRate.toFixed(1)}x`} />
                        <span className="speed-value" aria-live="polite">{speechRate.toFixed(1)}×</span>
                      </div>
                      <div className="export-row">
                        <button className="btn btn-ghost btn-sm" onClick={() => copyResult(currentResult)} aria-label="Copy result to clipboard">📋 Copy</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => exportTxt(currentResult, activeTab)} aria-label="Export result as text file">💾 Export .txt</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Analyze Mode Selector + Button */}
              <div className="analyze-bar">
                <div className="mode-chips" role="group" aria-label="Select analysis type">
                  {MODES.map(m => (
                    <button key={m.id}
                      className={`mode-chip${analyzeMode === m.id ? " active" : ""}`}
                      aria-pressed={analyzeMode === m.id}
                      onClick={() => setAnalyzeMode(m.id)}>
                      {m.label}
                    </button>
                  ))}
                </div>
                <div className="analyze-btn-row">
                  <button className="btn btn-primary" onClick={analyze} disabled={loading}
                    aria-label={loading ? "Analyzing image, please wait" : `Analyze image: ${MODES.find(m => m.id === analyzeMode)?.label}`}>
                    {loading ? "⏳ Analyzing…" : "✨ Analyze Image"}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="error-msg" role="alert" aria-live="assertive">
              ⚠️ {error}
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <section className="history-section" aria-label="Recent analyses">
              <div className="section-header">
                <h2 className="section-title">🕒 Recent Analyses</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => setHistory([])} aria-label="Clear history">Clear</button>
              </div>
              <div className="history-grid">
                {history.map((item, i) => (
                  <div key={i} className="history-item" tabIndex={0} role="button"
                    aria-label={`Analysis from ${item.time}: ${item.result.slice(0, 60)}…`}
                    onClick={() => {
                      setImage({ src: item.src, base64: item.src.split(",")[1], type: "image/jpeg" });
                      setResults(prev => ({ ...prev, [item.mode]: item.result }));
                      setActiveTab(item.mode);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    onKeyDown={e => e.key === "Enter" && e.currentTarget.click()}>
                    <img src={item.src} alt={`History from ${item.time}`} />
                    <div className="history-meta">
                      <div className="history-mode">{item.mode}</div>
                      <div className="history-snippet">{item.result.slice(0, 55)}…</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer>
          Built with ❤️ for <span>TSA Software Development 2025</span> · EchoSight — AI Visual Accessibility
        </footer>
      </div>

      {/* Toast */}
      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
    </>
  );
}

