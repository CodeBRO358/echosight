import { useState, useRef, useCallback, useEffect } from "react";

const API_URL = "https://api.anthropic.com/v1/messages";

const PROMPTS = {
  sceneInitial:
    "You are a trusted AI guide helping a visually impaired person understand their surroundings. " +
    "Analyze this image and provide a rich, natural description. Cover: what kind of scene this is, every significant object and where it sits, " +
    "any people and what they are doing, all visible text, colors, lighting, and anything relevant to navigation or safety. " +
    "Write conversationally as if you are a trusted friend — no bullet points, no lists, just clear natural language. Be thorough.",

  docRead:
    "You are a document assistant helping a visually impaired person understand a document they photographed. " +
    "Respond with ONLY a valid JSON object — no markdown, no preamble, no explanation outside the JSON:\n" +
    '{\n' +
    '  "documentType": "what kind of document this is (bill, letter, prescription, menu, receipt, form, flyer, etc.)",\n' +
    '  "summary": "2-3 sentence plain-language summary of what this document says or asks",\n' +
    '  "keyInfo": ["short string of each critical fact: amounts, dates, names, deadlines, phone numbers"],\n' +
    '  "action": "one sentence on what the person should do or know based on this document",\n' +
    '  "fullText": "complete transcription of all visible text in natural reading order"\n' +
    '}\n' +
    'If the image is not a document, set documentType to "Not a document" and explain briefly in summary.',

  quickScan:
    "You are a fast identification assistant for a visually impaired person. Look at this image and respond in exactly 1-2 sentences: " +
    "identify the main object, its specific color (not just 'blue' but 'navy blue' or 'sky blue'), and any text visible on it. " +
    'Example: "A dark navy blue ceramic coffee mug with the white text \'Good Morning\' printed on the front." No preamble, no extra sentences.',
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,500&family=Outfit:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:          #07101f;
    --surface:     #0f1c33;
    --surface2:    #162540;
    --surface3:    #1c2f4d;
    --border:      #1e3554;
    --border-h:    #2d4f7a;
    --vision:      #f59e0b;
    --vision-dim:  #d97706;
    --vision-glow: rgba(245, 158, 11, 0.12);
    --hearing:     #818cf8;
    --hearing-dim: #6366f1;
    --hearing-glow:rgba(129, 140, 248, 0.12);
    --green:       #34d399;
    --green-glow:  rgba(52, 211, 153, 0.1);
    --red:         #f87171;
    --red-glow:    rgba(248, 113, 113, 0.1);
    --text:        #dce8fa;
    --text-dim:    #94afc8;
    --muted:       #4d6a88;
    --muted2:      #2d4560;
    --r:           16px;
    --rsm:         10px;
    --t:           0.17s ease;
    --display:     'Fraunces', serif;
    --body:        'Outfit', sans-serif;
  }

  body.hc {
    --bg: #000; --surface: #0a0a0a; --surface2: #111; --surface3: #191919;
    --border: #fff; --border-h: #fff;
    --vision: #ffff00; --vision-dim: #cccc00; --vision-glow: rgba(255,255,0,0.15);
    --hearing: #00ffff; --hearing-dim: #00cccc; --hearing-glow: rgba(0,255,255,0.12);
    --text: #fff; --text-dim: #ddd; --muted: #aaa;
  }
  body.hc .bg-atmosphere { display: none; }

  body {
    font-family: var(--body); background: var(--bg); color: var(--text);
    min-height: 100vh; line-height: 1.5;
  }

  .bg-atmosphere {
    position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
  }
  .atm-blob {
    position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.06;
    animation: atm-pulse 18s ease-in-out infinite alternate;
  }
  .atm-a { width: 800px; height: 800px; background: var(--vision); top: -300px; left: -250px; animation-delay: 0s; }
  .atm-b { width: 600px; height: 600px; background: var(--hearing); bottom: -200px; right: -150px; animation-delay: -8s; }
  @keyframes atm-pulse {
    from { transform: scale(1); }
    to   { transform: scale(1.1) translate(20px, 15px); }
  }

  .app { min-height: 100vh; display: flex; flex-direction: column; position: relative; z-index: 1; }

  .skip-link {
    position: absolute; top: -999px; left: 0;
    padding: 10px 20px; background: var(--vision); color: #1a0f00;
    font-weight: 700; z-index: 9999; border-radius: 0 0 8px 0;
    font-family: var(--body);
  }
  .skip-link:focus { top: 0; }

  header {
    padding: 14px 32px;
    display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;
    border-bottom: 1px solid var(--border);
    background: rgba(7, 16, 31, 0.9); backdrop-filter: blur(18px);
    position: sticky; top: 0; z-index: 100;
  }
  .logo { display: flex; align-items: center; gap: 11px; }
  .logo-mark {
    width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
    background: linear-gradient(135deg, var(--vision), var(--hearing));
    display: flex; align-items: center; justify-content: center; font-size: 19px;
    box-shadow: 0 0 24px rgba(245,158,11,0.2);
  }
  .logo-name { font-family: var(--display); font-size: 22px; font-weight: 700; }
  .logo-name em { font-style: normal; color: var(--vision); }

  .header-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .tsa-pill {
    font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    padding: 4px 11px; border-radius: 999px;
    border: 1px solid rgba(245,158,11,0.3); color: var(--vision); background: var(--vision-glow);
  }
  .hdr-icon {
    width: 36px; height: 36px; border-radius: 9px;
    border: 1px solid var(--border); background: var(--surface2);
    color: var(--muted); cursor: pointer; font-size: 16px;
    display: flex; align-items: center; justify-content: center;
    transition: all var(--t); font-family: var(--body);
  }
  .hdr-icon:hover, .hdr-icon.on { border-color: var(--vision); color: var(--vision); background: var(--vision-glow); }
  .hdr-icon:focus-visible { outline: 3px solid var(--vision); outline-offset: 2px; }

  nav {
    display: flex; justify-content: center; gap: 4px; flex-wrap: wrap;
    padding: 16px 32px 0;
    border-bottom: 1px solid var(--border);
    background: rgba(7,16,31,0.6);
  }
  .nav-tab {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 12px 12px 0 0;
    border: 1px solid transparent; border-bottom: none;
    font-family: var(--body); font-size: 13px; font-weight: 600;
    color: var(--muted); background: none; cursor: pointer;
    transition: all var(--t); position: relative; bottom: -1px;
    white-space: nowrap;
  }
  .nav-tab:hover { color: var(--text); background: var(--surface2); }
  .nav-tab.vision-tab.active { color: var(--vision); background: var(--surface); border-color: var(--border); border-bottom-color: var(--surface); }
  .nav-tab.hearing-tab.active { color: var(--hearing); background: var(--surface); border-color: var(--border); border-bottom-color: var(--surface); }
  .nav-tab:focus-visible { outline: 3px solid var(--vision); outline-offset: 2px; }

  main { flex: 1; padding: 32px; max-width: 960px; margin: 0 auto; width: 100%; }

  .section-header { margin-bottom: 24px; animation: rise 0.45s ease both; }
  .section-title { font-family: var(--display); font-size: 28px; font-weight: 700; line-height: 1.2; margin-bottom: 6px; }
  .section-title .vision-color { color: var(--vision); font-style: italic; }
  .section-title .hearing-color { color: var(--hearing); font-style: italic; }
  .section-sub { color: var(--text-dim); font-size: 15px; line-height: 1.6; max-width: 540px; }

  .method-row {
    display: flex; gap: 8px; justify-content: center; margin-bottom: 22px;
    animation: rise 0.45s ease 0.05s both;
  }
  .method-btn {
    display: flex; align-items: center; gap: 8px; padding: 9px 22px;
    border-radius: 999px; border: 1px solid var(--border); background: var(--surface);
    color: var(--muted); font-family: var(--body); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all var(--t);
  }
  .method-btn:hover { border-color: var(--border-h); color: var(--text); }
  .method-btn.active-vision  { background: linear-gradient(135deg, var(--vision), var(--vision-dim)); color: #1a0e00; border-color: transparent; box-shadow: 0 0 20px var(--vision-glow); }
  .method-btn.active-hearing { background: linear-gradient(135deg, var(--hearing), var(--hearing-dim)); color: #0f0f2a; border-color: transparent; box-shadow: 0 0 20px var(--hearing-glow); }
  .method-btn:focus-visible { outline: 3px solid var(--vision); outline-offset: 3px; }

  .drop-zone {
    border: 2px dashed var(--border); border-radius: var(--r);
    background: var(--surface); padding: 56px 32px;
    text-align: center; cursor: pointer; transition: all var(--t);
    animation: rise 0.45s ease 0.08s both;
  }
  .drop-zone:hover, .drop-zone.over {
    border-color: var(--vision); background: var(--vision-glow);
    box-shadow: inset 0 0 0 1px var(--vision), 0 0 40px var(--vision-glow);
  }
  .drop-zone:focus-visible { outline: 3px solid var(--vision); outline-offset: 3px; }
  .drop-icon { font-size: 52px; display: block; margin-bottom: 14px; }
  .drop-zone h3 { font-family: var(--display); font-size: 21px; font-weight: 700; margin-bottom: 7px; }
  .drop-zone p { color: var(--text-dim); font-size: 14px; }

  .cam-box { border-radius: var(--r); overflow: hidden; background: #000; position: relative; animation: rise 0.3s ease both; }
  .cam-box video { width: 100%; display: block; max-height: 400px; object-fit: cover; }
  .cam-footer { position: absolute; bottom: 0; left: 0; right: 0; padding: 22px; display: flex; justify-content: center; background: linear-gradient(transparent, rgba(0,0,0,0.6)); }
  .shutter {
    width: 68px; height: 68px; border-radius: 50%;
    border: 4px solid rgba(255,255,255,0.85); background: rgba(255,255,255,0.12);
    backdrop-filter: blur(4px); cursor: pointer; transition: all var(--t);
    display: flex; align-items: center; justify-content: center;
  }
  .shutter:hover { background: rgba(255,255,255,0.28); transform: scale(1.04); }
  .shutter:focus-visible { outline: 3px solid var(--vision); }
  .shutter-inner { width: 46px; height: 46px; border-radius: 50%; background: white; }

  .workspace { display: grid; grid-template-columns: 1fr 1.2fr; gap: 18px; animation: rise 0.4s ease both; }
  @media (max-width: 680px) { .workspace { grid-template-columns: 1fr; } }

  .img-panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; }
  .img-panel img { width: 100%; max-height: 300px; object-fit: contain; background: #030810; display: block; }
  .img-actions { padding: 10px 14px; display: flex; gap: 8px; border-top: 1px solid var(--border); flex-wrap: wrap; }

  .chat-panel {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); display: flex; flex-direction: column; min-height: 380px;
  }
  .chat-top {
    padding: 14px 18px 12px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
  }
  .chat-label { font-size: 12px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--vision); }
  .chat-messages { flex: 1; overflow-y: auto; padding: 16px 18px; display: flex; flex-direction: column; gap: 14px; }
  .chat-bubble {
    padding: 12px 15px; border-radius: 13px; font-size: 14px; line-height: 1.7; max-width: 95%;
  }
  .bubble-ai {
    background: var(--surface2); border: 1px solid var(--border); color: var(--text);
    border-radius: 4px 13px 13px 13px;
  }
  .bubble-user {
    background: var(--vision-glow); border: 1px solid rgba(245,158,11,0.2);
    color: var(--text); align-self: flex-end;
    border-radius: 13px 13px 4px 13px;
  }
  .chat-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 32px; color: var(--muted); text-align: center; flex: 1; }
  .chat-empty-icon { font-size: 38px; }
  .chat-empty p { font-size: 14px; line-height: 1.6; }

  .chat-input-row {
    padding: 12px 14px; border-top: 1px solid var(--border);
    display: flex; gap: 8px; align-items: center;
  }
  .chat-input {
    flex: 1; padding: 10px 14px; border-radius: var(--rsm);
    border: 1px solid var(--border); background: var(--surface2);
    color: var(--text); font-family: var(--body); font-size: 14px;
    transition: border var(--t);
  }
  .chat-input:focus { outline: none; border-color: var(--vision); }
  .chat-input::placeholder { color: var(--muted); }

  .loading-orb { display: flex; align-items: center; gap: 10px; color: var(--muted); font-size: 13px; padding: 4px 0; }
  .spinner { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--border); border-top-color: var(--vision); animation: spin 0.7s linear infinite; flex-shrink: 0; }
  .spinner.lg { width: 30px; height: 30px; border-width: 3px; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .tts-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .tts-label { font-size: 12px; color: var(--muted); font-weight: 600; margin-right: auto; }
  .speed-row { display: flex; align-items: center; gap: 9px; }
  .speed-lbl { font-size: 12px; color: var(--muted); white-space: nowrap; }
  .speed-slider { accent-color: var(--vision); cursor: pointer; flex: 1; min-width: 80px; }
  .speed-val { font-size: 12px; color: var(--vision); font-weight: 700; min-width: 30px; }

  .doc-result {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); overflow: hidden; animation: rise 0.4s ease both;
  }
  .doc-top { padding: 18px 22px 14px; border-bottom: 1px solid var(--border); }
  .doc-type { font-size: 11px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: var(--vision); margin-bottom: 5px; }
  .doc-summary { font-family: var(--display); font-size: 18px; font-weight: 500; line-height: 1.4; }
  .doc-action { margin-top: 8px; font-size: 14px; color: var(--text-dim); }
  .key-facts { padding: 16px 22px; border-bottom: 1px solid var(--border); }
  .key-facts-label { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 11px; }
  .fact-list { display: flex; flex-direction: column; gap: 7px; }
  .fact-item { display: flex; align-items: baseline; gap: 9px; font-size: 14px; }
  .fact-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--vision); flex-shrink: 0; margin-top: 5px; }
  .full-text-section { padding: 16px 22px; }
  .full-text-label { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 11px; display: flex; align-items: center; justify-content: space-between; }
  .full-text-body { font-size: 13px; line-height: 1.75; color: var(--text-dim); white-space: pre-wrap; max-height: 200px; overflow-y: auto; }
  .doc-footer { padding: 14px 22px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 11px; }

  .quick-result {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); overflow: hidden; animation: rise 0.35s ease both;
  }
  .quick-answer {
    padding: 24px 22px; font-family: var(--display); font-size: 22px; font-weight: 500;
    line-height: 1.45; color: var(--text); border-bottom: 1px solid var(--border);
  }
  .quick-footer { padding: 13px 22px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

  .captions-area {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); padding: 28px; min-height: 240px;
    display: flex; flex-direction: column; justify-content: flex-end;
    transition: border-color var(--t); position: relative; overflow: hidden;
  }
  .captions-area.listening { border-color: var(--hearing); box-shadow: 0 0 0 1px var(--hearing), 0 0 30px var(--hearing-glow); }
  .live-badge {
    position: absolute; top: 14px; right: 14px;
    display: flex; align-items: center; gap: 7px;
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--hearing);
    padding: 5px 12px; border-radius: 999px; background: var(--hearing-glow); border: 1px solid rgba(129,140,248,0.3);
  }
  .live-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--hearing); animation: blink 1.2s ease-in-out infinite; }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
  .caption-scroll { overflow-y: auto; max-height: 400px; display: flex; flex-direction: column; gap: 10px; }
  .caption-final { font-size: var(--cap-size, 22px); line-height: 1.55; color: var(--text); font-weight: 400; }
  .caption-interim { font-size: var(--cap-size, 22px); line-height: 1.55; color: var(--muted); font-weight: 300; font-style: italic; }
  .captions-placeholder { color: var(--muted); font-size: 16px; font-style: italic; margin: auto; text-align: center; line-height: 1.6; }

  .caption-controls {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    margin-top: 18px; animation: rise 0.4s ease both;
  }
  .font-size-row { display: flex; gap: 6px; align-items: center; margin-left: auto; }
  .font-size-label { font-size: 12px; color: var(--muted); }
  .font-sz-btn {
    width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border);
    background: var(--surface2); color: var(--text-dim); font-family: var(--body);
    cursor: pointer; font-weight: 700; transition: all var(--t);
    display: flex; align-items: center; justify-content: center;
  }
  .font-sz-btn:hover, .font-sz-btn.active { border-color: var(--hearing); color: var(--hearing); background: var(--hearing-glow); }
  .font-sz-btn:focus-visible { outline: 3px solid var(--hearing); }

  .transcript-log {
    margin-top: 20px; background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); overflow: hidden; animation: rise 0.4s ease both;
  }
  .log-header {
    padding: 12px 18px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .log-title { font-size: 12px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--hearing); }
  .log-body { padding: 14px 18px; font-size: 14px; line-height: 1.75; color: var(--text-dim); max-height: 220px; overflow-y: auto; }

  .analyze-strip { display: flex; justify-content: center; gap: 10px; margin-top: 18px; animation: rise 0.4s ease both; }

  .btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 20px; border-radius: var(--rsm); border: none;
    font-family: var(--body); font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all var(--t); white-space: nowrap;
  }
  .btn:focus-visible { outline: 3px solid var(--vision); outline-offset: 2px; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
  .btn-vision { background: linear-gradient(135deg, var(--vision), var(--vision-dim)); color: #1a0e00; box-shadow: 0 0 22px var(--vision-glow); }
  .btn-vision:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .btn-hearing { background: linear-gradient(135deg, var(--hearing), var(--hearing-dim)); color: #0c0c2e; box-shadow: 0 0 22px var(--hearing-glow); }
  .btn-hearing:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .btn-ghost { background: var(--surface2); color: var(--text); border: 1px solid var(--border); }
  .btn-ghost:hover:not(:disabled) { border-color: var(--border-h); color: var(--text); }
  .btn-red { background: var(--red-glow); color: var(--red); border: 1px solid rgba(248,113,113,0.25); }
  .btn-red:hover:not(:disabled) { background: rgba(248,113,113,0.18); }
  .btn-green { background: var(--green-glow); color: var(--green); border: 1px solid rgba(52,211,153,0.25); }
  .btn-green:hover:not(:disabled) { background: rgba(52,211,153,0.18); }
  .btn-sm { padding: 7px 13px; font-size: 13px; border-radius: 8px; }
  .btn-lg { padding: 14px 32px; font-size: 16px; border-radius: 12px; }

  .err-box { background: var(--red-glow); border: 1px solid rgba(248,113,113,0.3); border-radius: var(--rsm); padding: 14px 18px; color: var(--red); font-size: 14px; margin-top: 16px; line-height: 1.6; }

  .toast { position: fixed; bottom: 22px; right: 22px; z-index: 9999; background: var(--surface2); border: 1px solid var(--vision); border-radius: 10px; padding: 12px 20px; font-size: 14px; font-weight: 600; color: var(--vision); box-shadow: 0 6px 28px rgba(0,0,0,0.5); animation: rise 0.25s ease both; max-width: 300px; }

  @keyframes rise {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: none; }
  }
  canvas { display: none; }
`;

function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(1.0);

  const speak = useCallback((text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [rate]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speaking, speak, stop, rate, setRate };
}

async function callClaude(messages) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content.filter((b) => b.type === "text").map((b) => b.text).join("");
}

function buildImageMessage(base64, mimeType, text) {
  return {
    role: "user",
    content: [
      { type: "image", source: { type: "base64", media_type: mimeType, data: base64 } },
      { type: "text", text },
    ],
  };
}

function parseDocResult(raw) {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  }
  return JSON.parse(text);
}

export default function Beacon() {
  const [tab, setTab] = useState("scene");
  const [highContrast, setHighContrast] = useState(false);
  const [toast, setToast] = useState(null);
  const tts = useTTS();

  const [sceneImage, setSceneImage]     = useState(null);
  const [sceneChat,  setSceneChat]      = useState([]);
  const [sceneInput, setSceneInput]     = useState("");
  const [sceneLoading, setSceneLoading] = useState(false);
  const [sceneError,   setSceneError]   = useState(null);
  const [sceneCamOn,   setSceneCamOn]   = useState(false);

  const [docImage,    setDocImage]    = useState(null);
  const [docResult,   setDocResult]   = useState(null);
  const [docLoading,  setDocLoading]  = useState(false);
  const [docError,    setDocError]    = useState(null);
  const [docCamOn,    setDocCamOn]    = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  const [quickImage,   setQuickImage]   = useState(null);
  const [quickAnswer,  setQuickAnswer]  = useState("");
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickError,   setQuickError]   = useState(null);
  const [quickCamOn,   setQuickCamOn]   = useState(false);

  const [captionListening, setCaptionListening] = useState(false);
  const [captionInterim,   setCaptionInterim]   = useState("");
  const [captionLog,       setCaptionLog]       = useState([]);
  const [captionFontSize,  setCaptionFontSize]  = useState("md");
  const recognitionRef = useRef(null);

  const sceneFileRef = useRef();
  const docFileRef   = useRef();
  const quickFileRef = useRef();
  const videoRef     = useRef();
  const canvasRef    = useRef();
  const streamRef    = useRef();
  const chatEndRef   = useRef();

  const FONT_SIZES = { sm: "16px", md: "22px", lg: "30px" };

  useEffect(() => {
    document.body.classList.toggle("hc", highContrast);
  }, [highContrast]);

  useEffect(() => {
    return () => {
      stopCamera();
      window.speechSynthesis.cancel();
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sceneChat]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function startCamera(setActive) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 80);
    } catch {
      setSceneError("Camera access was denied. Please use file upload instead.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setSceneCamOn(false);
    setDocCamOn(false);
    setQuickCamOn(false);
  }

  function captureFrame(setImage, setActive) {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const src = canvas.toDataURL("image/jpeg", 0.9);
    setImage({ src, base64: src.split(",")[1], type: "image/jpeg" });
    stopCamera();
    setActive(false);
  }

  function loadFile(file, setImage, setError) {
    if (!file?.type.startsWith("image/")) { setError("Please select an image file."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      setImage({ src, base64: src.split(",")[1], type: file.type });
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  async function handleSceneImage(image) {
    setSceneImage(image);
    setSceneChat([]);
    setSceneError(null);
    setSceneLoading(true);
    tts.stop();

    try {
      const msg = buildImageMessage(image.base64, image.type, PROMPTS.sceneInitial);
      const reply = await callClaude([msg]);
      setSceneChat([{ role: "ai", text: reply, isInitial: true }]);
      tts.speak(reply);
    } catch (e) {
      setSceneError("Could not analyze the scene: " + e.message);
    } finally {
      setSceneLoading(false);
    }
  }

  async function sendSceneQuestion() {
    const question = sceneInput.trim();
    if (!question || !sceneImage || sceneLoading) return;
    setSceneInput("");
    setSceneLoading(true);
    tts.stop();

    const userMsg = { role: "user", text: question };
    setSceneChat((prev) => [...prev, userMsg]);

    try {
      const history = [
        buildImageMessage(sceneImage.base64, sceneImage.type, PROMPTS.sceneInitial),
        ...sceneChat.filter((m) => m.role === "ai").slice(0, 1).map((m) => ({ role: "assistant", content: m.text })),
        { role: "user", content: question },
      ];
      const reply = await callClaude(history);
      setSceneChat((prev) => [...prev, { role: "ai", text: reply }]);
      tts.speak(reply);
    } catch (e) {
      setSceneChat((prev) => [...prev, { role: "ai", text: "Sorry, I could not answer that. Please try again." }]);
    } finally {
      setSceneLoading(false);
    }
  }

  async function runDocScan() {
    if (!docImage) return;
    setDocLoading(true);
    setDocResult(null);
    setDocError(null);
    tts.stop();

    try {
      const msg = buildImageMessage(docImage.base64, docImage.type, PROMPTS.docRead);
      const raw  = await callClaude([msg]);
      const parsed = parseDocResult(raw);
      setDocResult(parsed);

      const spoken = `${parsed.documentType}. ${parsed.summary} ${parsed.action}`;
      tts.speak(spoken);
    } catch (e) {
      setDocError("Could not read this document: " + e.message);
    } finally {
      setDocLoading(false);
    }
  }

  async function runQuickScan() {
    if (!quickImage) return;
    setQuickLoading(true);
    setQuickAnswer("");
    setQuickError(null);
    tts.stop();

    try {
      const msg   = buildImageMessage(quickImage.base64, quickImage.type, PROMPTS.quickScan);
      const reply = await callClaude([msg]);
      setQuickAnswer(reply);
      tts.speak(reply);
    } catch (e) {
      setQuickError("Quick scan failed: " + e.message);
    } finally {
      setQuickLoading(false);
    }
  }

  function startCaptions() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      showToast("⚠️ Live captions are not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    const rec = new SR();
    rec.continuous      = true;
    rec.interimResults  = true;
    rec.lang            = "en-US";

    rec.onresult = (e) => {
      let interim = "";
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalText += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      if (finalText) {
        setCaptionLog((prev) => [...prev, finalText.trim()]);
        setCaptionInterim("");
      } else {
        setCaptionInterim(interim);
      }
    };

    rec.onerror = (e) => {
      if (e.error !== "no-speech") showToast("⚠️ Microphone error: " + e.error);
    };

    rec.onend = () => {
      if (captionListening) rec.start();
    };

    recognitionRef.current = rec;
    rec.start();
    setCaptionListening(true);
    setCaptionInterim("");
  }

  function stopCaptions() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setCaptionListening(false);
    setCaptionInterim("");
  }

  function clearCaptions() {
    stopCaptions();
    setCaptionLog([]);
    setCaptionInterim("");
  }

  async function exportTranscript() {
    const full = captionLog.join("\n");
    const content = `Beacon — Live Caption Transcript\nExported: ${new Date().toLocaleString()}\n${"─".repeat(40)}\n\n${full}`;
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `beacon-transcript-${Date.now()}.txt`;
    a.click();
    showToast("📄 Transcript exported!");
  }

  function CameraSection({ setActive, setImage, setError }) {
    return (
      <div className="cam-box" aria-label="Camera preview">
        <video ref={videoRef} autoPlay playsInline muted aria-label="Live camera feed" />
        <canvas ref={canvasRef} aria-hidden="true" />
        <div className="cam-footer">
          <button className="shutter" onClick={() => captureFrame(setImage, setActive)} aria-label="Capture photo">
            <div className="shutter-inner" />
          </button>
        </div>
      </div>
    );
  }

  function TTSControls({ text, color }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="tts-row">
          <span className="tts-label">🔊 Read Aloud</span>
          {tts.speaking ? (
            <button className="btn btn-ghost btn-sm" onClick={tts.stop} aria-label="Stop reading aloud">⏹ Stop</button>
          ) : (
            <button className={`btn btn-sm btn-${color}`} onClick={() => tts.speak(text)} aria-label="Read result aloud">▶ Play</button>
          )}
          <button
            className="btn btn-ghost btn-sm"
            onClick={async () => { await navigator.clipboard.writeText(text); showToast("📋 Copied!"); }}
            aria-label="Copy to clipboard"
          >📋 Copy</button>
        </div>
        <div className="speed-row" role="group" aria-label="Speech speed">
          <span className="speed-lbl" id="spd-lbl">Speed:</span>
          <input type="range" className="speed-slider" min="0.5" max="2" step="0.1"
            value={tts.rate} onChange={(e) => tts.setRate(parseFloat(e.target.value))}
            aria-labelledby="spd-lbl" aria-valuetext={`${tts.rate.toFixed(1)} times normal`} />
          <span className="speed-val" aria-live="polite">{tts.rate.toFixed(1)}×</span>
        </div>
      </div>
    );
  }

  const activeCam = sceneCamOn ? "scene" : docCamOn ? "doc" : quickCamOn ? "quick" : null;

  return (
    <>
      <style>{CSS}</style>
      <a className="skip-link" href="#main">Skip to main content</a>

      <div className="app">
        <div className="bg-atmosphere" aria-hidden="true">
          <div className="atm-blob atm-a" /><div className="atm-blob atm-b" />
        </div>

        <header>
          <div className="logo">
            <div className="logo-mark" aria-hidden="true">🔦</div>
            <span className="logo-name">Bea<em>con</em></span>
          </div>
          <div className="header-right">
            <span className="tsa-pill">TSA 2025</span>
            <button
              className={`hdr-icon${highContrast ? " on" : ""}`}
              onClick={() => setHighContrast((p) => !p)}
              aria-pressed={highContrast}
              aria-label={highContrast ? "Disable high contrast" : "Enable high contrast"}
              title="Toggle high contrast"
            >{highContrast ? "☀️" : "🌓"}</button>
          </div>
        </header>

        <nav role="tablist" aria-label="App sections">
          {[
            { id: "scene",    icon: "👁",  label: "Scene Chat",  type: "vision"  },
            { id: "captions", icon: "👂", label: "Live Captions", type: "hearing" },
            { id: "doc",      icon: "📄", label: "Doc Reader",   type: "vision"  },
            { id: "quick",    icon: "⚡", label: "Quick Scan",   type: "vision"  },
          ].map(({ id, icon, label, type }) => (
            <button
              key={id}
              className={`nav-tab ${type}-tab${tab === id ? " active" : ""}`}
              role="tab" aria-selected={tab === id}
              onClick={() => { setTab(id); tts.stop(); stopCamera(); }}
            >
              <span aria-hidden="true">{icon}</span>{label}
            </button>
          ))}
        </nav>

        <main id="main" aria-live="polite" aria-atomic="false">

          {tab === "scene" && (
            <div>
              <div className="section-header">
                <h1 className="section-title">Scene <span className="vision-color">Chat</span></h1>
                <p className="section-sub">
                  Photograph anything and get a detailed spoken description — then ask follow-up questions about the same image in a real conversation.
                </p>
              </div>

              {!sceneCamOn && !sceneImage && (
                <>
                  <div
                    className="drop-zone"
                    tabIndex={0} role="button"
                    aria-label="Upload a photo to describe. Click or drag and drop."
                    onClick={() => sceneFileRef.current?.click()}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && sceneFileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("over"); }}
                    onDragLeave={(e) => e.currentTarget.classList.remove("over")}
                    onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("over"); const f = e.dataTransfer.files[0]; loadFile(f, (img) => handleSceneImage(img), setSceneError); }}
                  >
                    <input ref={sceneFileRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={(e) => { const f = e.target.files[0]; loadFile(f, handleSceneImage, setSceneError); }}
                      aria-label="Select image file" />
                    <span className="drop-icon" aria-hidden="true">👁</span>
                    <h3>Drop a photo here to start a conversation</h3>
                    <p>or click to browse · any scene, room, street, or object</p>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => startCamera(setSceneCamOn)} aria-label="Use camera">📷 Use Camera</button>
                  </div>
                </>
              )}

              {sceneCamOn && <CameraSection setActive={setSceneCamOn} setImage={handleSceneImage} setError={setSceneError} />}
              {sceneCamOn && <div style={{ marginTop: 12 }}><button className="btn btn-ghost btn-sm" onClick={() => { stopCamera(); }}>✕ Cancel</button></div>}

              {sceneImage && !sceneCamOn && (
                <div className="workspace">
                  <div className="img-panel" aria-label="Uploaded scene photo">
                    <img src={sceneImage.src} alt="Scene being analyzed" />
                    <div className="img-actions">
                      <input ref={sceneFileRef} type="file" accept="image/*" style={{ display: "none" }}
                        onChange={(e) => { const f = e.target.files[0]; loadFile(f, handleSceneImage, setSceneError); }} aria-label="Replace image" />
                      <button className="btn btn-ghost btn-sm" onClick={() => sceneFileRef.current?.click()} aria-label="Replace image">🔄 Replace</button>
                      <button className="btn btn-red btn-sm" onClick={() => { setSceneImage(null); setSceneChat([]); tts.stop(); }} aria-label="Remove image">🗑 Remove</button>
                    </div>
                  </div>

                  <div className="chat-panel">
                    <div className="chat-top">
                      <span className="chat-label">Scene Conversation</span>
                      {sceneChat.length > 0 && (
                        <TTSControls text={sceneChat.filter(m => m.role === "ai").map(m => m.text).join(" ")} color="vision" />
                      )}
                    </div>

                    <div className="chat-messages" aria-live="polite" aria-label="Conversation">
                      {sceneLoading && sceneChat.length === 0 && (
                        <div className="loading-orb" aria-label="Analyzing scene">
                          <div className="spinner" role="status" /><span>Analyzing scene…</span>
                        </div>
                      )}
                      {sceneChat.length === 0 && !sceneLoading && (
                        <div className="chat-empty">
                          <span className="chat-empty-icon" aria-hidden="true">💬</span>
                          <p>Your scene description will appear here.<br />Then ask any follow-up question.</p>
                        </div>
                      )}
                      {sceneChat.map((msg, i) => (
                        <div key={i} className={`chat-bubble ${msg.role === "ai" ? "bubble-ai" : "bubble-user"}`}
                          role={msg.role === "ai" ? "article" : undefined}
                          aria-label={msg.role === "ai" ? "AI response" : "Your question"}>
                          {msg.text}
                        </div>
                      ))}
                      {sceneLoading && sceneChat.length > 0 && (
                        <div className="loading-orb"><div className="spinner" role="status" /><span>Thinking…</span></div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {sceneChat.length > 0 && (
                      <div className="chat-input-row">
                        <input
                          className="chat-input"
                          type="text"
                          placeholder="Ask a follow-up question about this scene…"
                          value={sceneInput}
                          onChange={(e) => setSceneInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && sendSceneQuestion()}
                          disabled={sceneLoading}
                          aria-label="Ask a follow-up question"
                        />
                        <button className="btn btn-vision btn-sm" onClick={sendSceneQuestion} disabled={sceneLoading || !sceneInput.trim()}
                          aria-label="Send question">➤</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {sceneError && <div className="err-box" role="alert">{sceneError}</div>}
            </div>
          )}

          {tab === "captions" && (
            <div>
              <div className="section-header">
                <h1 className="section-title">Live <span className="hearing-color">Captions</span></h1>
                <p className="section-sub">
                  Real-time speech-to-text — words appear on screen as they are spoken. Perfect for conversations, meetings, and public spaces.
                </p>
              </div>

              <div
                className={`captions-area${captionListening ? " listening" : ""}`}
                aria-live="polite"
                aria-label="Live caption display"
                style={{ "--cap-size": FONT_SIZES[captionFontSize] }}
              >
                {captionListening && (
                  <div className="live-badge" aria-label="Microphone active">
                    <div className="live-dot" aria-hidden="true" />LIVE
                  </div>
                )}
                {captionLog.length === 0 && !captionInterim ? (
                  <p className="captions-placeholder">
                    {captionListening ? "Listening… start speaking." : "Press Start to begin live captions."}
                  </p>
                ) : (
                  <div className="caption-scroll">
                    {captionLog.map((line, i) => (
                      <p key={i} className="caption-final">{line}</p>
                    ))}
                    {captionInterim && <p className="caption-interim">{captionInterim}</p>}
                  </div>
                )}
              </div>

              <div className="caption-controls">
                {captionListening ? (
                  <button className="btn btn-red btn-lg" onClick={stopCaptions} aria-label="Stop live captions">⏹ Stop</button>
                ) : (
                  <button className="btn btn-hearing btn-lg" onClick={startCaptions} aria-label="Start live captions">🎙 Start Captions</button>
                )}
                {captionLog.length > 0 && (
                  <>
                    <button className="btn btn-ghost" onClick={exportTranscript} aria-label="Export transcript as text file">📄 Export</button>
                    <button className="btn btn-red" onClick={clearCaptions} aria-label="Clear all captions">🗑 Clear</button>
                  </>
                )}
                <div className="font-size-row" role="group" aria-label="Caption font size">
                  <span className="font-size-label">Size:</span>
                  {[["sm", "A"], ["md", "A"], ["lg", "A"]].map(([key, label], idx) => (
                    <button key={key} className={`font-sz-btn${captionFontSize === key ? " active" : ""}`}
                      style={{ fontSize: ["13px","16px","20px"][idx] }}
                      aria-pressed={captionFontSize === key} aria-label={`${["Small","Medium","Large"][idx]} text`}
                      onClick={() => setCaptionFontSize(key)}>{label}</button>
                  ))}
                </div>
              </div>

              {captionLog.length > 0 && (
                <div className="transcript-log" aria-label="Full transcript">
                  <div className="log-header">
                    <span className="log-title">Full Transcript</span>
                    <button className="btn btn-ghost btn-sm"
                      onClick={async () => { await navigator.clipboard.writeText(captionLog.join("\n")); showToast("📋 Copied!"); }}
                      aria-label="Copy full transcript">📋 Copy All</button>
                  </div>
                  <div className="log-body">{captionLog.join(" ")}</div>
                </div>
              )}
            </div>
          )}

          {tab === "doc" && (
            <div>
              <div className="section-header">
                <h1 className="section-title">Doc <span className="vision-color">Reader</span></h1>
                <p className="section-sub">
                  Photograph any document — bill, letter, prescription, menu, form — and get a plain-language summary with the key facts and any action you need to take.
                </p>
              </div>

              {!docCamOn && !docImage && (
                <>
                  <div
                    className="drop-zone"
                    tabIndex={0} role="button"
                    aria-label="Upload a document photo."
                    onClick={() => docFileRef.current?.click()}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && docFileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("over"); }}
                    onDragLeave={(e) => e.currentTarget.classList.remove("over")}
                    onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("over"); loadFile(e.dataTransfer.files[0], setDocImage, setDocError); }}
                  >
                    <input ref={docFileRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={(e) => loadFile(e.target.files[0], setDocImage, setDocError)} aria-label="Select document photo" />
                    <span className="drop-icon" aria-hidden="true">📄</span>
                    <h3>Drop a document photo here</h3>
                    <p>Bills, letters, prescriptions, menus, forms — anything with text</p>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => startCamera(setDocCamOn)} aria-label="Use camera">📷 Use Camera</button>
                  </div>
                </>
              )}

              {docCamOn && <CameraSection setActive={setDocCamOn} setImage={setDocImage} setError={setDocError} />}
              {docCamOn && <div style={{ marginTop: 12 }}><button className="btn btn-ghost btn-sm" onClick={stopCamera}>✕ Cancel</button></div>}

              {docImage && !docCamOn && (
                <>
                  <div className="workspace">
                    <div className="img-panel">
                      <img src={docImage.src} alt="Document to be analyzed" />
                      <div className="img-actions">
                        <input ref={docFileRef} type="file" accept="image/*" style={{ display: "none" }}
                          onChange={(e) => { loadFile(e.target.files[0], setDocImage, setDocError); setDocResult(null); }} aria-label="Replace document" />
                        <button className="btn btn-ghost btn-sm" onClick={() => docFileRef.current?.click()}>🔄 Replace</button>
                        <button className="btn btn-red btn-sm" onClick={() => { setDocImage(null); setDocResult(null); tts.stop(); }}>🗑 Remove</button>
                      </div>
                    </div>

                    {docResult ? (
                      <div className="doc-result">
                        <div className="doc-top">
                          <div className="doc-type">{docResult.documentType}</div>
                          <div className="doc-summary">{docResult.summary}</div>
                          {docResult.action && <div className="doc-action">👉 {docResult.action}</div>}
                        </div>
                        <div className="key-facts">
                          <div className="key-facts-label">Key Information</div>
                          <div className="fact-list" role="list">
                            {(docResult.keyInfo || []).map((fact, i) => (
                              <div key={i} className="fact-item" role="listitem">
                                <div className="fact-dot" aria-hidden="true" />
                                <span>{fact}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="full-text-section">
                          <div className="full-text-label">
                            Full Text
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowFullText((p) => !p)} aria-expanded={showFullText}>
                              {showFullText ? "Hide" : "Show"}
                            </button>
                          </div>
                          {showFullText && <div className="full-text-body">{docResult.fullText}</div>}
                        </div>
                        <div className="doc-footer">
                          <TTSControls text={`${docResult.documentType}. ${docResult.summary} ${docResult.action} Key facts: ${(docResult.keyInfo || []).join(". ")}`} color="vision" />
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280 }}>
                        {docLoading ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, color: "var(--muted)" }}>
                            <div className="spinner lg" role="status" aria-label="Reading document" />
                            <p>Reading document…</p>
                          </div>
                        ) : (
                          <p style={{ color: "var(--muted)", fontSize: 14 }}>Click Read Document to analyze.</p>
                        )}
                      </div>
                    )}
                  </div>
                  {!docResult && !docLoading && (
                    <div className="analyze-strip">
                      <button className="btn btn-vision" onClick={runDocScan} aria-label="Read and analyze this document">📄 Read Document</button>
                    </div>
                  )}
                  {docResult && (
                    <div className="analyze-strip">
                      <button className="btn btn-ghost" onClick={() => { setDocResult(null); setDocImage(null); tts.stop(); }} aria-label="Scan a different document">🔄 Scan Another</button>
                    </div>
                  )}
                </>
              )}
              {docError && <div className="err-box" role="alert">{docError}</div>}
            </div>
          )}

          {tab === "quick" && (
            <div>
              <div className="section-header">
                <h1 className="section-title">Quick <span className="vision-color">Scan</span></h1>
                <p className="section-sub">
                  Instant object and color identification. Take a photo of any item — clothing, can, package, appliance button — and get a fast spoken answer.
                </p>
              </div>

              {!quickCamOn && !quickImage && (
                <>
                  <div
                    className="drop-zone"
                    tabIndex={0} role="button"
                    aria-label="Upload a photo to identify quickly."
                    onClick={() => quickFileRef.current?.click()}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && quickFileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("over"); }}
                    onDragLeave={(e) => e.currentTarget.classList.remove("over")}
                    onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("over"); loadFile(e.dataTransfer.files[0], setQuickImage, setQuickError); }}
                  >
                    <input ref={quickFileRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={(e) => loadFile(e.target.files[0], setQuickImage, setQuickError)} aria-label="Select photo to identify" />
                    <span className="drop-icon" aria-hidden="true">⚡</span>
                    <h3>Drop any item here for instant ID</h3>
                    <p>Get the object name, exact color, and any visible text in seconds</p>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => startCamera(setQuickCamOn)} aria-label="Use camera">📷 Use Camera</button>
                  </div>
                </>
              )}

              {quickCamOn && <CameraSection setActive={setQuickCamOn} setImage={setQuickImage} setError={setQuickError} />}
              {quickCamOn && <div style={{ marginTop: 12 }}><button className="btn btn-ghost btn-sm" onClick={stopCamera}>✕ Cancel</button></div>}

              {quickImage && !quickCamOn && (
                <>
                  <div className="workspace">
                    <div className="img-panel">
                      <img src={quickImage.src} alt="Item to identify" />
                      <div className="img-actions">
                        <input ref={quickFileRef} type="file" accept="image/*" style={{ display: "none" }}
                          onChange={(e) => { loadFile(e.target.files[0], setQuickImage, setQuickError); setQuickAnswer(""); }} aria-label="Replace image" />
                        <button className="btn btn-ghost btn-sm" onClick={() => quickFileRef.current?.click()}>🔄 Replace</button>
                        <button className="btn btn-red btn-sm" onClick={() => { setQuickImage(null); setQuickAnswer(""); tts.stop(); }}>🗑 Remove</button>
                      </div>
                    </div>

                    {quickAnswer ? (
                      <div className="quick-result">
                        <div className="quick-answer" aria-live="polite">{quickAnswer}</div>
                        <div className="quick-footer">
                          <TTSControls text={quickAnswer} color="vision" />
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
                        {quickLoading ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, color: "var(--muted)" }}>
                            <div className="spinner lg" role="status" aria-label="Identifying item" />
                            <p>Identifying…</p>
                          </div>
                        ) : (
                          <p style={{ color: "var(--muted)", fontSize: 14 }}>Click Identify to scan.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {!quickAnswer && !quickLoading && (
                    <div className="analyze-strip">
                      <button className="btn btn-vision" onClick={runQuickScan} aria-label="Identify this item instantly">⚡ Identify</button>
                    </div>
                  )}
                  {quickAnswer && (
                    <div className="analyze-strip">
                      <button className="btn btn-ghost" onClick={() => { setQuickAnswer(""); setQuickImage(null); tts.stop(); }} aria-label="Scan another item">🔄 Scan Another</button>
                    </div>
                  )}
                </>
              )}
              {quickError && <div className="err-box" role="alert">{quickError}</div>}
            </div>
          )}
        </main>

        <footer style={{ textAlign: "center", padding: "22px 32px", color: "var(--muted)", fontSize: 13, borderTop: "1px solid var(--border)" }}>
          Built for <strong style={{ color: "var(--vision)" }}>Kentucky TSA Software Development 2025</strong> · Beacon — Universal Accessibility Companion
        </footer>
      </div>

      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
    </>
  );
}
