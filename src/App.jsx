import { useState, useRef, useEffect, useCallback } from "react";
import About from "./About.jsx";
import References from "./References.jsx";

const COLOR_DB = [
  { name: "Black",        r: 15,  g: 15,  b: 15  },
  { name: "Charcoal",     r: 54,  g: 54,  b: 58  },
  { name: "Dark Gray",    r: 85,  g: 85,  b: 85  },
  { name: "Gray",         r: 140, g: 140, b: 140 },
  { name: "Silver",       r: 190, g: 192, b: 198 },
  { name: "Light Gray",   r: 215, g: 215, b: 215 },
  { name: "White",        r: 255, g: 255, b: 255 },
  { name: "Off-White",    r: 245, g: 240, b: 228 },
  { name: "Cream",        r: 255, g: 250, b: 210 },
  { name: "Beige",        r: 240, g: 220, b: 190 },
  { name: "Tan",          r: 200, g: 160, b: 110 },
  { name: "Khaki",        r: 195, g: 185, b: 108 },
  { name: "Dark Brown",   r: 88,  g: 40,  b: 10  },
  { name: "Brown",        r: 140, g: 70,  b: 20  },
  { name: "Maroon",       r: 128, g: 0,   b: 0   },
  { name: "Dark Red",     r: 140, g: 0,   b: 0   },
  { name: "Red",          r: 220, g: 20,  b: 20  },
  { name: "Crimson",      r: 220, g: 20,  b: 60  },
  { name: "Coral",        r: 250, g: 100, b: 80  },
  { name: "Rose",         r: 255, g: 100, b: 130 },
  { name: "Hot Pink",     r: 255, g: 60,  b: 140 },
  { name: "Pink",         r: 255, g: 150, b: 170 },
  { name: "Light Pink",   r: 255, g: 210, b: 220 },
  { name: "Dark Orange",  r: 200, g: 80,  b: 0   },
  { name: "Orange",       r: 255, g: 140, b: 0   },
  { name: "Peach",        r: 255, g: 200, b: 160 },
  { name: "Gold",         r: 220, g: 178, b: 0   },
  { name: "Yellow",       r: 255, g: 235, b: 0   },
  { name: "Light Yellow", r: 255, g: 250, b: 160 },
  { name: "Olive",        r: 100, g: 110, b: 0   },
  { name: "Yellow-Green", r: 154, g: 205, b: 50  },
  { name: "Lime Green",   r: 130, g: 210, b: 0   },
  { name: "Dark Green",   r: 0,   g: 100, b: 0   },
  { name: "Forest Green", r: 30,  g: 120, b: 50  },
  { name: "Green",        r: 0,   g: 180, b: 0   },
  { name: "Mint Green",   r: 160, g: 230, b: 200 },
  { name: "Teal",         r: 0,   g: 160, b: 150 },
  { name: "Dark Teal",    r: 0,   g: 100, b: 100 },
  { name: "Cyan",         r: 0,   g: 200, b: 220 },
  { name: "Sky Blue",     r: 100, g: 180, b: 240 },
  { name: "Light Blue",   r: 170, g: 210, b: 250 },
  { name: "Steel Blue",   r: 70,  g: 130, b: 180 },
  { name: "Blue",         r: 0,   g: 80,  b: 200 },
  { name: "Royal Blue",   r: 40,  g: 80,  b: 220 },
  { name: "Navy Blue",    r: 0,   g: 0,   b: 90  },
  { name: "Dark Blue",    r: 0,   g: 0,   b: 130 },
  { name: "Indigo",       r: 60,  g: 0,   b: 160 },
  { name: "Dark Purple",  r: 80,  g: 0,   b: 120 },
  { name: "Purple",       r: 130, g: 0,   b: 180 },
  { name: "Violet",       r: 150, g: 50,  b: 210 },
  { name: "Lavender",     r: 200, g: 170, b: 240 },
];

function findColorName(r, g, b) {
  let closest = COLOR_DB[0];
  let minDist = Infinity;
  for (const c of COLOR_DB) {
    const dist = (r - c.r) ** 2 + (g - c.g) ** 2 + (b - c.b) ** 2;
    if (dist < minDist) { minDist = dist; closest = c; }
  }
  return closest.name;
}

function getDominantColors(imgEl, maxColors = 5) {
  const MAX_DIM = 160;
  const canvas  = document.createElement("canvas");
  const scale   = Math.min(1, MAX_DIM / Math.max(imgEl.naturalWidth || 1, imgEl.naturalHeight || 1));
  canvas.width  = Math.max(1, Math.round(imgEl.naturalWidth  * scale));
  canvas.height = Math.max(1, Math.round(imgEl.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const buckets = {};
  for (let i = 0; i < data.length; i += 16) {
    if (data[i + 3] < 128) continue;
    const r = Math.floor(data[i]     / 28) * 28;
    const g = Math.floor(data[i + 1] / 28) * 28;
    const b = Math.floor(data[i + 2] / 28) * 28;
    const key = `${r},${g},${b}`;
    buckets[key] = (buckets[key] || 0) + 1;
  }
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

function classifyAudio(dataArray) {
  const avg     = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
  const lowAvg  = dataArray.slice(0, 6).reduce((a, b) => a + b, 0) / 6;
  const midAvg  = dataArray.slice(6, 22).reduce((a, b) => a + b, 0) / 16;
  const highAvg = dataArray.slice(22, 42).reduce((a, b) => a + b, 0) / 20;
  const level   = Math.round((avg / 255) * 100);
  if (avg < 7)                                           return { label: "Silence",          icon: "🔇", color: "#3a5878", level };
  if (avg > 140)                                         return { label: "Very Loud",         icon: "🔴", color: "#ef4444", level };
  if (midAvg > lowAvg * 1.25 && midAvg > highAvg * 0.8) return { label: "Speech Detected",   icon: "🗣",  color: "#10b981", level };
  if (lowAvg > midAvg * 1.5)                             return { label: "Low Frequency",     icon: "🔉", color: "#8b5cf6", level };
  if (highAvg > midAvg * 1.35)                           return { label: "Sharp Sound",       icon: "🔔", color: "#f59e0b", level };
  return                                                  { label: "Background Sound",        icon: "🎵", color: "#06b6d4", level };
}

function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRateState]    = useState(1.0);
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
  const stop = useCallback(() => { window.speechSynthesis.cancel(); setSpeaking(false); }, []);
  return { speaking, speak, stop, rate, setRate };
}

function CameraView({ videoRef, canvasRef, onCapture, onCancel }) {
  return (
    <div>
      <div className="cam-wrap rounded-main overflow-hidden bg-black relative">
        <video ref={videoRef} autoPlay playsInline muted aria-label="Live camera" />
        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-center bg-gradient-to-t from-black/60 to-transparent">
          <button
            className="shutter w-[66px] h-[66px] rounded-full border-4 border-white/85 bg-white/15 backdrop-blur-sm flex items-center justify-center transition"
            onClick={onCapture}
            aria-label="Take photo"
          >
            <div className="w-[44px] h-[44px] rounded-full bg-white" />
          </button>
        </div>
      </div>
      <div className="mt-3">
        <button className="btn btn-ghost text-sm px-[13px] py-[7px] rounded-[8px] border border-line bg-card2 text-tx transition" onClick={onCancel}>
          Cancel Camera
        </button>
      </div>
    </div>
  );
}

function TTSBlock({ text, tts }) {
  return (
    <div className="flex flex-col gap-2 px-[18px] py-[13px] border-t border-line">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-mute mr-auto">Read Aloud</span>
        {tts.speaking
          ? <button className="btn btn-ghost text-[13px] px-[13px] py-[7px] rounded-[8px] border border-line bg-card2 text-tx" onClick={tts.stop}>Stop</button>
          : <button className="btn btn-vis  text-[13px] px-[13px] py-[7px] rounded-[8px]" onClick={() => tts.speak(text)}>Play</button>}
      </div>
      <div className="flex items-center gap-2" role="group" aria-label="Speech speed">
        <span className="text-xs text-mute whitespace-nowrap" id="spd-lbl">Speed:</span>
        <input
          type="range" className="speed-slider flex-1 min-w-[80px]"
          min="0.5" max="2" step="0.1"
          value={tts.rate} onChange={e => tts.setRate(parseFloat(e.target.value))}
          aria-labelledby="spd-lbl"
        />
        <span className="text-xs text-vis font-bold min-w-[28px]" aria-live="polite">{tts.rate.toFixed(1)}x</span>
      </div>
    </div>
  );
}

export default function Beacon() {
  const [tab, setTab]               = useState("text");
  const [hc,  setHc]                = useState(false);
  const [toast, setToast]           = useState(null);
  const tts = useTTS();

  const [textImg,    setTextImg]    = useState(null);
  const [ocrResult,  setOcrResult]  = useState(null);
  const [ocrStatus,  setOcrStatus]  = useState("");
  const [ocrPct,     setOcrPct]     = useState(0);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError,   setOcrError]   = useState(null);
  const [textCamOn,  setTextCamOn]  = useState(false);
  const [readMode,   setReadMode]   = useState(false);

  const [colorImg,     setColorImg]     = useState(null);
  const [colorResult,  setColorResult]  = useState(null);
  const [colorLoading, setColorLoading] = useState(false);
  const [colorError,   setColorError]   = useState(null);
  const [colorCamOn,   setColorCamOn]   = useState(false);

  const [captionOn,      setCaptionOn]      = useState(false);
  const [captionInterim, setCaptionInterim] = useState("");
  const [captionLog,     setCaptionLog]     = useState([]);
  const [fontSize,       setFontSize]       = useState("md");
  const [captionStatus,  setCaptionStatus]  = useState("");

  const [soundOn,    setSoundOn]    = useState(false);
  const [soundClass, setSoundClass] = useState(null);
  const [soundLevel, setSoundLevel] = useState(0);
  const [flash,      setFlash]      = useState(false);

  const textFileRef  = useRef();
  const colorFileRef = useRef();
  const videoRef     = useRef();
  const canvasRef    = useRef();
  const streamRef    = useRef();

  const captionRecRef  = useRef(null);
  const captionOnRef   = useRef(false);
  const mediaRecRef    = useRef(null);
  const audioChunksRef = useRef([]);
  const captionMicRef  = useRef(null);

  const soundCanvasRef = useRef();
  const animFrameRef   = useRef();
  const audioCtxRef    = useRef();
  const analyserRef    = useRef();
  const soundStreamRef = useRef();

  const FONT_SIZES = { sm: "16px", md: "22px", lg: "30px" };

  useEffect(() => { document.body.classList.toggle("hc", hc); }, [hc]);

  useEffect(() => {
    return () => {
      stopCamera();
      stopCaptions();
      stopSound();
      window.speechSynthesis.cancel();
    };
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function copyText(text) {
    navigator.clipboard.writeText(text)
      .then(() => showToast("Copied!"))
      .catch(() => showToast("Copy failed."));
  }

  function exportTxt(text, prefix) {
    const blob = new Blob([`Beacon — ${prefix}\nExported: ${new Date().toLocaleString()}\n${"─".repeat(40)}\n\n${text}`], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `beacon-${prefix.toLowerCase().replace(/\s/g, "-")}-${Date.now()}.txt`;
    a.click();
    showToast("Exported!");
  }

  function switchTab(t) {
    stopCamera();
    stopCaptions();
    stopSound();
    tts.stop();
    setTab(t);
  }

  async function startCamera(setActive, setError) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setActive(true);
      setTimeout(() => {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      }, 80);
    } catch {
      setError("Camera access was denied. Please use file upload instead.");
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

  async function runOCR() {
    if (!textImg) return;
    if (!window.Tesseract) {
      setOcrError("The OCR library is still loading. Please wait a moment and try again.");
      return;
    }
    setOcrLoading(true); setOcrResult(null); setOcrError(null); setOcrPct(0); setReadMode(false); tts.stop();
    try {
      const imgEl = new Image();
      imgEl.src = textImg.src;
      await new Promise(res => { imgEl.onload = res; });
      const { data: { text, confidence } } = await window.Tesseract.recognize(imgEl, "eng", {
        logger: m => {
          if (m.status === "loading tesseract core")            setOcrStatus("Loading OCR engine…");
          else if (m.status === "initializing api")             setOcrStatus("Initializing…");
          else if (m.status === "loading language traineddata") setOcrStatus("Downloading language model (first time only)…");
          else if (m.status === "recognizing text") {
            setOcrStatus("Reading text…");
            setOcrPct(Math.round(m.progress * 100));
          }
        },
      });
      const cleaned = text.trim();
      setOcrResult({ text: cleaned, confidence: Math.round(confidence) });
      tts.speak(cleaned || "No text was found in this image. Try a clearer photo.");
    } catch (e) {
      setOcrError("OCR failed: " + e.message + ". Try a clearer photo.");
    } finally {
      setOcrLoading(false);
    }
  }

  function runColorAnalysis() {
    if (!colorImg) return;
    setColorLoading(true); setColorResult(null); setColorError(null); tts.stop();
    const imgEl = new Image();
    imgEl.src = colorImg.src;
    imgEl.onload = () => {
      try {
        const colors = getDominantColors(imgEl, 5);
        setColorResult(colors);
        setColorLoading(false);
        if (colors.length === 0) { tts.speak("Could not identify colors in this image."); return; }
        const speech = colors.length > 1
          ? `This item appears to be ${colors[0].name}, with ${colors.slice(1, 3).map(c => c.name).join(" and ")} details.`
          : `This item is ${colors[0].name}.`;
        tts.speak(speech);
      } catch (e) {
        setColorError("Color analysis failed: " + e.message);
        setColorLoading(false);
      }
    };
    imgEl.onerror = () => { setColorError("Could not load the image."); setColorLoading(false); };
  }

  async function startCaptions() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast("Live Captions require Chrome or Edge."); return; }
    let micStream;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch {
      showToast("Microphone access was denied. Allow it and try again.");
      return;
    }
    captionMicRef.current = micStream;
    captionOnRef.current = true;
    setCaptionOn(true);
    setCaptionInterim("");
    setCaptionStatus("Listening…");
    startStreamingRecognition(SR);
  }

  function startStreamingRecognition(SR) {
    if (!captionOnRef.current) return;
    const rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = "en-US";
    rec.onresult = e => {
      let interim = "", finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t + " ";
        else interim += t;
      }
      if (finalText) { setCaptionLog(prev => [...prev, finalText.trim()]); setCaptionInterim(""); }
      else setCaptionInterim(interim);
    };
    rec.onerror = e => {
      if (e.error === "network") {
        captionRecRef.current = null;
        setCaptionStatus("Network blocked — using offline mode");
        setCaptionInterim("(Speak in short phrases — processing every 4 seconds)");
        startChunkedRecognition(SR);
      } else if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        showToast("Microphone permission denied.");
        captionOnRef.current = false; setCaptionOn(false); setCaptionStatus("");
      } else if (e.error !== "no-speech" && e.error !== "aborted") {
        setTimeout(() => { if (captionOnRef.current) startStreamingRecognition(SR); }, 400);
      }
    };
    rec.onend = () => { if (captionOnRef.current) setTimeout(() => startStreamingRecognition(SR), 100); };
    captionRecRef.current = rec;
    try { rec.start(); } catch { }
  }

  function startChunkedRecognition(SR) {
    if (!captionOnRef.current || !captionMicRef.current) return;
    function recordOneChunk() {
      if (!captionOnRef.current) return;
      const chunks = [];
      let recorder;
      try { recorder = new MediaRecorder(captionMicRef.current, { mimeType: "audio/webm;codecs=opus" }); }
      catch { try { recorder = new MediaRecorder(captionMicRef.current); } catch { setCaptionStatus("Recorder unavailable."); return; } }
      mediaRecRef.current = recorder;
      recorder.ondataavailable = e => { if (e.data?.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        if (!captionOnRef.current) return;
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        const r = new SR();
        r.continuous = false; r.interimResults = false; r.lang = "en-US";
        const url = URL.createObjectURL(blob);
        try { r.audioSrc = url; } catch { }
        r.onresult = ev => {
          let text = "";
          for (let i = 0; i < ev.results.length; i++) {
            if (ev.results[i].isFinal) text += ev.results[i][0].transcript + " ";
          }
          const trimmed = text.trim();
          if (trimmed) { setCaptionLog(prev => [...prev, trimmed]); setCaptionInterim(""); }
        };
        r.onerror = () => { };
        r.onend   = () => { URL.revokeObjectURL(url); recordOneChunk(); };
        try { r.start(); } catch { recordOneChunk(); }
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
    setCaptionOn(false); setCaptionInterim(""); setCaptionStatus("");
  }

  function clearCaptions() {
    stopCaptions(); setCaptionLog([]); setCaptionInterim(""); setCaptionStatus("");
  }

  async function startSound() {
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const ctx      = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      ctx.createMediaStreamSource(stream).connect(analyser);
      soundStreamRef.current = stream;
      audioCtxRef.current    = ctx;
      analyserRef.current    = analyser;
      setSoundOn(true);
      drawSound(analyser);
    } catch {
      showToast("Microphone access was denied.");
    }
  }

  function drawSound(analyser) {
    const canvas = soundCanvasRef.current;
    if (!canvas) return;
    canvas.width  = canvas.clientWidth  || 600;
    canvas.height = canvas.clientHeight || 200;
    const ctx       = canvas.getContext("2d");
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const W = canvas.width, H = canvas.height;
    function frame() {
      animFrameRef.current = requestAnimationFrame(frame);
      analyser.getByteFrequencyData(dataArray);
      ctx.fillStyle = "rgba(5, 14, 31, 0.45)";
      ctx.fillRect(0, 0, W, H);
      const barCount = dataArray.length;
      const barW     = W / barCount;
      for (let i = 0; i < barCount; i++) {
        const v = dataArray[i] / 255;
        if (v < 0.01) continue;
        const barH = v * H * 0.9;
        const x    = i * barW;
        const t    = i / barCount;
        const r    = Math.round(6   * (1 - t) + 245 * t);
        const g    = Math.round(182 * (1 - t) + 158 * t);
        const b    = Math.round(212 * (1 - t) + 11  * t);
        ctx.shadowBlur  = v > 0.45 ? 12 : 0;
        ctx.shadowColor = `rgb(${r},${g},${b})`;
        ctx.fillStyle   = `rgba(${r},${g},${b},${0.55 + v * 0.45})`;
        ctx.fillRect(x + 0.5, H - barH, barW - 1.5, barH);
      }
      ctx.shadowBlur = 0;
      const classification = classifyAudio(dataArray);
      setSoundClass(classification);
      setSoundLevel(classification.level);
      if (classification.level > 75) { setFlash(true); setTimeout(() => setFlash(false), 120); }
    }
    frame();
  }

  function stopSound() {
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = null;
    analyserRef.current?.disconnect();
    audioCtxRef.current?.close();
    soundStreamRef.current?.getTracks().forEach(t => t.stop());
    analyserRef.current = null; audioCtxRef.current = null; soundStreamRef.current = null;
    setSoundOn(false); setSoundClass(null); setSoundLevel(0);
    const canvas = soundCanvasRef.current;
    if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  }

  function confidenceBadge(pct) {
    if (pct > 75) return <span className="confidence-badge conf-high inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-3">High confidence ({pct}%)</span>;
    if (pct > 45) return <span className="confidence-badge conf-mid  inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-3">Medium confidence ({pct}%)</span>;
    return               <span className="confidence-badge conf-low  inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-3">Low confidence ({pct}%) — try a clearer photo</span>;
  }

  const tabs = [
    { id: "text",       label: "Text Scanner",   type: "vis",  dot: "var(--vis)"  },
    { id: "captions",   label: "Live Captions",  type: "hear", dot: "var(--hear)" },
    { id: "color",      label: "Color Finder",   type: "vis",  dot: "var(--vis)"  },
    { id: "sound",      label: "Sound View",     type: "hear", dot: "var(--hear)" },
    { id: "about",      label: "About",          type: "vis",  dot: "var(--vis)"  },
    { id: "references", label: "References",     type: "vis",  dot: "var(--vis)"  },
  ];

  return (
    <>
      <a className="skip-nav" href="#main">Skip to main content</a>

      <div className="app min-h-screen flex flex-col relative z-10">
        <div className="bg-atmosphere" aria-hidden="true">
          <div className="bg-blob bb-a" /><div className="bg-blob bb-b" />
        </div>

        <header className="px-7 py-3.5 flex items-center justify-between gap-3 flex-wrap border-b border-line bg-[rgba(5,14,31,0.9)] backdrop-blur-lg sticky top-0 z-[100]">
          <div className="flex items-center gap-2.5">
            <div className="w-[38px] h-[38px] rounded-[10px] flex-shrink-0 bg-gradient-to-br from-vis to-hear flex items-center justify-center text-[18px]">
              <span role="img" aria-label="Beacon">&#128294;</span>
            </div>
            <span className="font-display text-[20px] font-extrabold tracking-[-0.3px] text-tx">
              Bea<span className="text-vis">con</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold tracking-[2px] uppercase px-2.5 py-1 rounded-full border border-vis/30 text-vis bg-vis-s">
              KY TSA 2025
            </span>
            <button
              className="w-[35px] h-[35px] rounded-[9px] border border-line bg-card2 text-mute flex items-center justify-center text-[15px] transition hover:border-vis hover:text-vis hover:bg-vis-s"
              onClick={() => setHc(p => !p)}
              aria-pressed={hc}
              aria-label={hc ? "Disable high contrast" : "Enable high contrast"}
            >
              {hc ? "☀" : "◐"}
            </button>
          </div>
        </header>

        <nav className="flex justify-center gap-1 flex-wrap pt-3.5 pb-0 px-7 border-b border-line bg-[rgba(5,14,31,0.55)]" role="tablist" aria-label="Features">
          {tabs.map(({ id, label, type, dot }) => (
            <button
              key={id}
              className={`ntab flex items-center gap-1.5 px-[18px] py-[9px] rounded-t-[11px] border border-transparent border-b-0 text-[13px] font-semibold text-mute bg-transparent cursor-pointer transition relative bottom-[-1px] whitespace-nowrap hover:text-tx hover:bg-card2 ${tab === id ? `${type}-active` : ""}`}
              role="tab"
              aria-selected={tab === id}
              onClick={() => switchTab(id)}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>

        <main id="main" className="flex-1 px-7 py-8 max-w-[940px] mx-auto w-full" aria-live="polite" aria-atomic="false">

          {tab === "text" && (
            <div>
              <div className="mb-6 animate-rise">
                <h1 className="font-display text-[26px] font-extrabold leading-[1.2] mb-1.5 tracking-[-0.3px]">
                  Text <span className="text-vis italic">Scanner</span>
                </h1>
                <p className="text-dim text-sm leading-[1.65] max-w-[520px]">
                  Photograph any printed text — signs, menus, mail, medicine bottles — and Beacon reads it aloud. Powered by on-device OCR.
                </p>
              </div>

              {!textCamOn && !textImg && (
                <>
                  <div
                    className="dz border-2 border-dashed border-line rounded-main bg-card p-14 text-center cursor-pointer transition animate-rise"
                    tabIndex={0} role="button"
                    aria-label="Upload an image with text."
                    onClick={() => textFileRef.current?.click()}
                    onKeyDown={e => (e.key === "Enter" || e.key === " ") && textFileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("over"); }}
                    onDragLeave={e => e.currentTarget.classList.remove("over")}
                    onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("over"); loadFile(e.dataTransfer.files[0], setTextImg, setOcrError); }}
                  >
                    <input ref={textFileRef} type="file" accept="image/*" className="hidden"
                      onChange={e => loadFile(e.target.files[0], setTextImg, setOcrError)} />
                    <span className="text-[46px] block mb-3" aria-hidden="true">&#128065;</span>
                    <h3 className="font-display text-[19px] font-bold mb-1.5">Drop a photo here to read its text</h3>
                    <p className="text-dim text-sm">Signs, menus, labels, documents, medicine bottles</p>
                  </div>
                  <div className="mt-3">
                    <button className="btn btn-ghost text-sm px-[13px] py-[7px] rounded-[8px] border border-line bg-card2 text-tx" onClick={() => startCamera(setTextCamOn, setOcrError)}>
                      Use Camera
                    </button>
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
                  <div className="grid grid-cols-2 gap-[18px] animate-rise max-[680px]:grid-cols-1">
                    <div className="bg-card border border-line rounded-main overflow-hidden">
                      <img src={textImg.src} alt="Image containing text to be read" className="w-full max-h-[280px] object-contain bg-[#030810] block" />
                      <div className="p-[10px_13px] flex gap-1.5 border-t border-line flex-wrap">
                        <input ref={textFileRef} type="file" accept="image/*" className="hidden"
                          onChange={e => { loadFile(e.target.files[0], setTextImg, setOcrError); setOcrResult(null); }} />
                        <button className="btn btn-ghost text-[13px] px-[13px] py-[7px] rounded-[8px] border border-line bg-card2 text-tx" onClick={() => textFileRef.current?.click()}>Replace</button>
                        <button className="btn btn-red text-[13px] px-[13px] py-[7px] rounded-[8px] bg-err/10 text-err border border-err/25" onClick={() => { setTextImg(null); setOcrResult(null); setReadMode(false); tts.stop(); }}>Remove</button>
                      </div>
                    </div>

                    <div className="bg-card border border-line rounded-main flex flex-col">
                      <div className="px-[18px] py-[13px] border-b border-line flex items-center justify-between gap-2.5 flex-wrap">
                        <span className="text-[11px] font-bold tracking-[1.4px] uppercase text-vis">Extracted Text</span>
                        {ocrResult && (
                          <button className="btn btn-ghost text-[13px] px-[13px] py-[7px] rounded-[8px] border border-line bg-card2 text-tx"
                            onClick={() => setReadMode(p => !p)} aria-pressed={readMode}>
                            {readMode ? "Normal" : "Reading Mode"}
                          </button>
                        )}
                      </div>
                      <div className="flex-1 p-[18px]">
                        {ocrLoading && (
                          <div className="flex flex-col items-center gap-3.5 p-8 text-dim" aria-live="polite">
                            <div className="spin lg" role="status" />
                            <p className="text-sm text-center">{ocrStatus || "Starting…"}</p>
                            {ocrPct > 0 && (
                              <div className="w-full">
                                <div className="w-full h-1 bg-line rounded-sm overflow-hidden">
                                  <div className="progress-fill h-full" style={{ width: `${ocrPct}%` }} role="progressbar" aria-valuenow={ocrPct} />
                                </div>
                                <p className="text-xs text-mute mt-1.5 text-center">{ocrPct}%</p>
                              </div>
                            )}
                          </div>
                        )}
                        {!ocrLoading && !ocrResult && (
                          <p className="text-mute text-sm">Click Scan Text to read this image.</p>
                        )}
                        {ocrResult && !ocrLoading && (
                          <>
                            {readMode
                              ? <div className="bg-card2 border border-line rounded-[10px] p-[18px_20px] mt-3.5 text-[17px] leading-[1.9] tracking-[0.2px] whitespace-pre-wrap max-h-[300px] overflow-y-auto text-tx" aria-label="Reading mode text">{ocrResult.text || "No text found."}</div>
                              : <div className="ocr-text-area text-[15px] leading-[1.8] text-tx whitespace-pre-wrap max-h-[260px] overflow-y-auto py-1" aria-label="Extracted text">{ocrResult.text}</div>
                            }
                            {confidenceBadge(ocrResult.confidence)}
                          </>
                        )}
                      </div>
                      {ocrResult && !ocrLoading && (
                        <>
                          <TTSBlock text={ocrResult.text || "No text found."} tts={tts} />
                          <div className="px-[18px] pb-3.5 flex gap-2">
                            <button className="btn btn-ghost text-[13px] px-[13px] py-[7px] rounded-[8px] border border-line bg-card2 text-tx" onClick={() => copyText(ocrResult.text)}>Copy</button>
                            <button className="btn btn-ghost text-[13px] px-[13px] py-[7px] rounded-[8px] border border-line bg-card2 text-tx" onClick={() => exportTxt(ocrResult.text, "Text Scan")}>Export</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {!ocrResult && !ocrLoading && (
                    <div className="flex justify-center gap-2.5 mt-[18px] animate-rise">
                      <button className="btn btn-vis px-5 py-2.5 rounded-[10px] text-sm font-semibold" onClick={runOCR}>Scan Text</button>
                    </div>
                  )}
                  {ocrResult && (
                    <div className="flex justify-center gap-2.5 mt-[18px]">
                      <button className="btn btn-ghost px-5 py-2.5 rounded-[10px] text-sm font-semibold border border-line bg-card2 text-tx" onClick={() => { setOcrResult(null); setTextImg(null); setReadMode(false); tts.stop(); }}>Scan Another</button>
                    </div>
                  )}
                </>
              )}
              {ocrError && <div className="bg-err/10 border border-err/30 rounded-[10px] px-[18px] py-[14px] text-err text-sm mt-4 leading-[1.6]" role="alert">{ocrError}</div>}
            </div>
          )}

          {tab === "captions" && (
            <div>
              <div className="mb-6 animate-rise">
                <h1 className="font-display text-[26px] font-extrabold leading-[1.2] mb-1.5 tracking-[-0.3px]">
                  Live <span className="text-hear italic">Captions</span>
                </h1>
                <p className="text-dim text-sm leading-[1.65] max-w-[520px]">
                  Real-time speech-to-text. Works on most networks — automatically switches to offline mode if your network blocks speech servers. Use Chrome or Edge.
                </p>
              </div>

              <div
                className={`caption-display bg-card border border-line rounded-main p-7 min-h-[220px] flex flex-col justify-end relative overflow-hidden transition ${captionOn ? "listening" : ""}`}
                aria-live="polite" aria-label="Live captions display"
              >
                {captionOn && (
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 text-[10px] font-bold tracking-[1.8px] uppercase text-hear px-3 py-1 rounded-full bg-hear-s border border-hear/30">
                    <div className="live-dot w-[7px] h-[7px] rounded-full bg-hear" aria-hidden="true" />
                    LIVE
                  </div>
                )}
                {captionStatus && (
                  <div className="absolute top-3.5 left-3.5 text-[11px] text-hear font-semibold tracking-[0.5px]" aria-live="polite">{captionStatus}</div>
                )}
                {captionLog.length === 0 && !captionInterim ? (
                  <p className="text-mute text-base italic text-center m-auto leading-[1.7]">
                    {captionOn ? "Listening… start speaking." : "Press Start Captions to begin."}
                  </p>
                ) : (
                  <div className="overflow-y-auto max-h-[360px] flex flex-col gap-2">
                    {captionLog.map((line, i) => (
                      <p key={i} className="text-tx leading-[1.55]" style={{ fontSize: FONT_SIZES[fontSize] }}>{line}</p>
                    ))}
                    {captionInterim && (
                      <p className="text-mute italic leading-[1.55]" style={{ fontSize: FONT_SIZES[fontSize] }}>{captionInterim}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2.5 flex-wrap mt-4 animate-rise">
                {captionOn
                  ? <button className="btn btn-red px-[30px] py-[13px] rounded-[12px] text-base font-semibold bg-err/10 text-err border border-err/25" onClick={stopCaptions}>Stop</button>
                  : <button className="btn btn-hear px-[30px] py-[13px] rounded-[12px] text-base font-semibold" onClick={startCaptions}>Start Captions</button>}
                {captionLog.length > 0 && (
                  <>
                    <button className="btn btn-ghost px-5 py-2.5 rounded-[10px] text-sm border border-line bg-card2 text-tx" onClick={() => exportTxt(captionLog.join("\n"), "Captions")}>Export</button>
                    <button className="btn btn-red px-5 py-2.5 rounded-[10px] text-sm bg-err/10 text-err border border-err/25" onClick={clearCaptions}>Clear</button>
                  </>
                )}
                <div className="flex gap-1.5 ml-auto" role="group" aria-label="Caption text size">
                  {[["sm","A","Small","13px"],["md","A","Medium","16px"],["lg","A","Large","20px"]].map(([key, label, name, sz]) => (
                    <button key={key}
                      className={`w-[30px] h-[30px] rounded-[7px] border border-line bg-card2 text-dim font-bold flex items-center justify-center transition ${fontSize === key ? "border-hear text-hear bg-hear-s" : ""}`}
                      style={{ fontSize: sz }}
                      aria-pressed={fontSize === key} aria-label={name + " text"}
                      onClick={() => setFontSize(key)}>{label}</button>
                  ))}
                </div>
              </div>

              {captionLog.length > 0 && (
                <div className="mt-5 bg-card border border-line rounded-main overflow-hidden animate-rise">
                  <div className="px-[17px] py-3 border-b border-line flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-[1.2px] uppercase text-hear">Full Transcript</span>
                    <button className="btn btn-ghost text-[13px] px-[13px] py-[7px] rounded-[8px] border border-line bg-card2 text-tx" onClick={() => copyText(captionLog.join("\n"))}>Copy All</button>
                  </div>
                  <div className="px-[17px] py-3.5 text-sm leading-[1.75] text-dim max-h-[200px] overflow-y-auto">{captionLog.join(" ")}</div>
                </div>
              )}
            </div>
          )}

          {tab === "color" && (
            <div>
              <div className="mb-6 animate-rise">
                <h1 className="font-display text-[26px] font-extrabold leading-[1.2] mb-1.5 tracking-[-0.3px]">
                  Color <span className="text-vis italic">Finder</span>
                </h1>
                <p className="text-dim text-sm leading-[1.65] max-w-[520px]">
                  Photograph any item and Beacon identifies its dominant colors by name and reads them aloud. Fully offline, instant results.
                </p>
              </div>

              {!colorCamOn && !colorImg && (
                <>
                  <div
                    className="dz border-2 border-dashed border-line rounded-main bg-card p-14 text-center cursor-pointer transition animate-rise"
                    tabIndex={0} role="button"
                    aria-label="Upload an image to identify its colors."
                    onClick={() => colorFileRef.current?.click()}
                    onKeyDown={e => (e.key === "Enter" || e.key === " ") && colorFileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("over"); }}
                    onDragLeave={e => e.currentTarget.classList.remove("over")}
                    onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("over"); loadFile(e.dataTransfer.files[0], setColorImg, setColorError); }}
                  >
                    <input ref={colorFileRef} type="file" accept="image/*" className="hidden"
                      onChange={e => loadFile(e.target.files[0], setColorImg, setColorError)} />
                    <span className="text-[46px] block mb-3" aria-hidden="true">&#127912;</span>
                    <h3 className="font-display text-[19px] font-bold mb-1.5">Drop a photo to identify its colors</h3>
                    <p className="text-dim text-sm">Clothing, fruit, objects — any item with color</p>
                  </div>
                  <div className="mt-3">
                    <button className="btn btn-ghost text-sm px-[13px] py-[7px] rounded-[8px] border border-line bg-card2 text-tx" onClick={() => startCamera(setColorCamOn, setColorError)}>Use Camera</button>
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
                  <div className="grid grid-cols-2 gap-[18px] animate-rise max-[680px]:grid-cols-1">
                    <div className="bg-card border border-line rounded-main overflow-hidden">
                      <img src={colorImg.src} alt="Item to analyze for colors" className="w-full max-h-[280px] object-contain bg-[#030810] block" />
                      <div className="p-[10px_13px] flex gap-1.5 border-t border-line flex-wrap">
                        <input ref={colorFileRef} type="file" accept="image/*" className="hidden"
                          onChange={e => { loadFile(e.target.files[0], setColorImg, setColorError); setColorResult(null); }} />
                        <button className="btn btn-ghost text-[13px] px-[13px] py-[7px] rounded-[8px] border border-line bg-card2 text-tx" onClick={() => colorFileRef.current?.click()}>Replace</button>
                        <button className="btn btn-red text-[13px] px-[13px] py-[7px] rounded-[8px] bg-err/10 text-err border border-err/25" onClick={() => { setColorImg(null); setColorResult(null); tts.stop(); }}>Remove</button>
                      </div>
                    </div>

                    <div className="bg-card border border-line rounded-main flex flex-col">
                      <div className="px-[18px] py-[13px] border-b border-line">
                        <span className="text-[11px] font-bold tracking-[1.4px] uppercase text-vis">Dominant Colors</span>
                      </div>
                      <div className="flex-1 p-[18px]">
                        {colorLoading && (
                          <div className="flex items-center gap-3 py-5 text-dim">
                            <div className="spin" role="status" /><span>Analyzing colors…</span>
                          </div>
                        )}
                        {!colorLoading && !colorResult && (
                          <p className="text-mute text-sm">Click Find Colors to analyze this image.</p>
                        )}
                        {colorResult && !colorLoading && (
                          <>
                            <div role="list" aria-label="Colors found in image" className="flex flex-col gap-0">
                              {colorResult.map((c, i) => (
                                <div key={i} className="flex items-center gap-3 py-[11px] border-b border-line last:border-b-0" role="listitem" aria-label={`Color ${i + 1}: ${c.name}`}>
                                  <span className="text-xs text-mute w-[18px] text-center flex-shrink-0" aria-hidden="true">{i + 1}</span>
                                  <div className="w-[44px] h-[44px] rounded-[10px] border-2 border-white/10 flex-shrink-0" style={{ background: c.hex }} aria-hidden="true" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[16px] font-semibold text-tx">{c.name}</div>
                                    <div className="text-[11px] text-mute font-mono mt-0.5">{c.hex}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="bg-card2 border border-line rounded-[10px] p-[13px_16px] mt-3.5 text-sm leading-[1.65] text-dim">
                              <strong className="text-tx">Spoken summary: </strong>
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
                          tts={tts}
                        />
                      )}
                    </div>
                  </div>

                  {!colorResult && !colorLoading && (
                    <div className="flex justify-center gap-2.5 mt-[18px] animate-rise">
                      <button className="btn btn-vis px-5 py-2.5 rounded-[10px] text-sm font-semibold" onClick={runColorAnalysis}>Find Colors</button>
                    </div>
                  )}
                  {colorResult && (
                    <div className="flex justify-center gap-2.5 mt-[18px]">
                      <button className="btn btn-ghost px-5 py-2.5 rounded-[10px] text-sm font-semibold border border-line bg-card2 text-tx" onClick={() => { setColorResult(null); setColorImg(null); tts.stop(); }}>Analyze Another</button>
                    </div>
                  )}
                </>
              )}
              {colorError && <div className="bg-err/10 border border-err/30 rounded-[10px] px-[18px] py-[14px] text-err text-sm mt-4 leading-[1.6]" role="alert">{colorError}</div>}
            </div>
          )}

          {tab === "sound" && (
            <div>
              <div className="mb-6 animate-rise">
                <h1 className="font-display text-[26px] font-extrabold leading-[1.2] mb-1.5 tracking-[-0.3px]">
                  Sound <span className="text-hear italic">View</span>
                </h1>
                <p className="text-dim text-sm leading-[1.65] max-w-[520px]">
                  Visualizes your audio environment in real time. Deaf and hard-of-hearing users can see whether there is silence, speech, or a sudden loud sound.
                </p>
              </div>

              <div className="relative rounded-main overflow-hidden bg-card border border-line">
                <canvas ref={soundCanvasRef} className="sound-canvas" width={600} height={200} aria-label="Real-time sound frequency visualizer" />
                {soundClass && (
                  <div
                    className="absolute top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-[18px] py-1.5 rounded-full text-[13px] font-bold tracking-[0.5px] backdrop-blur-sm border border-white/10 bg-[rgba(5,14,31,0.7)] whitespace-nowrap transition-colors"
                    style={{ color: soundClass.color }}
                    aria-live="polite" aria-label={`Sound: ${soundClass.label}`}
                  >
                    <span aria-hidden="true">{soundClass.icon}</span>
                    {soundClass.label}
                  </div>
                )}
                {!soundOn && !soundClass && (
                  <div className="absolute inset-0 flex items-center justify-center text-mute text-[15px] italic">
                    Press Start to visualize sound
                  </div>
                )}
                <div className="flash-overlay" style={{ opacity: flash ? 1 : 0 }} aria-hidden="true" />
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-line">
                  <div
                    className="h-full transition-[width] duration-75"
                    style={{ width: `${soundLevel}%`, background: soundClass ? soundClass.color : "var(--hear)" }}
                    role="progressbar" aria-valuenow={soundLevel} aria-valuemin={0} aria-valuemax={100}
                    aria-label={`Sound level: ${soundLevel}%`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap mt-3.5 animate-rise">
                {soundOn
                  ? <button className="btn btn-red px-[30px] py-[13px] rounded-[12px] text-base font-semibold bg-err/10 text-err border border-err/25" onClick={stopSound}>Stop</button>
                  : <button className="btn btn-hear px-[30px] py-[13px] rounded-[12px] text-base font-semibold" onClick={startSound}>Start Visualizer</button>}
                {soundClass && (
                  <span className="text-[13px] text-dim" aria-live="polite">
                    Level: <strong style={{ color: "var(--hear)" }}>{soundLevel}%</strong>
                    {soundClass.level > 75 && " — Very loud!"}
                  </span>
                )}
              </div>

              <div className="mt-5 bg-card border border-line rounded-main p-[18px_20px] animate-rise">
                <p className="text-[11px] font-bold tracking-[1.2px] uppercase text-mute mb-3.5">What each classification means</p>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
                  {[
                    { icon: "🔇", label: "Silence",         desc: "No significant audio detected",             color: "#3a5878" },
                    { icon: "🗣",  label: "Speech Detected", desc: "Mid-range frequencies indicate a voice",    color: "#10b981" },
                    { icon: "🔔", label: "Sharp Sound",      desc: "High-frequency spike — possible alarm",     color: "#f59e0b" },
                    { icon: "🔉", label: "Low Frequency",    desc: "Bass-heavy sound like a vehicle or machine", color: "#8b5cf6" },
                    { icon: "🎵", label: "Background Sound", desc: "General ambient noise",                     color: "#06b6d4" },
                    { icon: "🔴", label: "Very Loud",        desc: "Dangerously loud — screen flashes red",     color: "#ef4444" },
                  ].map(({ icon, label, desc, color }) => (
                    <div key={label} className="flex gap-2.5 items-start">
                      <span className="text-[18px] flex-shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
                      <div>
                        <div className="text-[13px] font-bold" style={{ color }}>{label}</div>
                        <div className="text-xs text-dim leading-[1.4] mt-0.5">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "about"      && <About />}
          {tab === "references" && <References />}

        </main>

        <footer className="text-center px-7 py-5 text-mute text-xs border-t border-line">
          Built for <strong className="text-vis">Kentucky TSA Software Development 2025</strong> · Beacon — Universal Accessibility Companion
        </footer>
      </div>

      {toast && (
        <div className="fixed bottom-5 right-5 z-[9999] bg-card2 border border-vis rounded-[10px] px-[18px] py-3 text-sm font-semibold text-vis shadow-[0_6px_28px_rgba(0,0,0,0.5)] animate-rise max-w-[280px]" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </>
  );
}
