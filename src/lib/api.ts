// TruthGuard API service layer

const API_BASE = localStorage.getItem("truthguard_api_base") || "http://localhost:5000";

export function getApiBase(): string {
  return localStorage.getItem("truthguard_api_base") || "http://localhost:5000";
}

export function setApiBase(url: string) {
  localStorage.setItem("truthguard_api_base", url);
}

export function isDemoMode(): boolean {
  return localStorage.getItem("truthguard_demo_mode") !== "false";
}

export function setDemoMode(enabled: boolean) {
  localStorage.setItem("truthguard_demo_mode", enabled ? "true" : "false");
}

export interface DetectionResult {
  result: string;
  confidence: string;
}

export interface HumanizeResult {
  humanized: string;
  words_used: number;
  words_remaining: number | string;
  error?: string;
}

// Mock responses for demo mode
function mockDetectText(text: string): DetectionResult {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const hasAIPatterns = /furthermore|moreover|in conclusion|it is important to note|delve/i.test(text);
  const isLikelyAI = hasAIPatterns || wordCount > 50;
  return {
    result: isLikelyAI ? "AI-Generated" : "Likely Human-Written",
    confidence: isLikelyAI ? `${(75 + Math.random() * 20).toFixed(1)}%` : `${(60 + Math.random() * 30).toFixed(1)}%`,
  };
}

function mockHumanize(text: string): HumanizeResult {
  const words = text.split(/\s+/).filter(Boolean);
  // Simple mock: shuffle some words and add filler
  const humanized = text
    .replace(/Furthermore,?\s*/gi, "Also, ")
    .replace(/Moreover,?\s*/gi, "Plus, ")
    .replace(/In conclusion,?\s*/gi, "So basically, ")
    .replace(/It is important to note that\s*/gi, "Worth mentioning, ")
    .replace(/utilize/gi, "use")
    .replace(/facilitate/gi, "help with")
    .replace(/Subsequently/gi, "Then");
  return {
    humanized,
    words_used: words.length,
    words_remaining: "unlimited (demo)",
  };
}

function mockDetectMedia(): DetectionResult {
  const isDeepfake = Math.random() > 0.5;
  return {
    result: isDeepfake ? "Potential Deepfake Detected" : "Appears Authentic",
    confidence: `${(65 + Math.random() * 30).toFixed(1)}%`,
  };
}

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function detectText(text: string): Promise<DetectionResult> {
  if (isDemoMode()) {
    await delay(800 + Math.random() * 700);
    return mockDetectText(text);
  }
  const res = await fetch(`${getApiBase()}/text_detect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Text detection failed");
  return res.json();
}

export async function humanizeText(text: string): Promise<HumanizeResult> {
  if (isDemoMode()) {
    await delay(1000 + Math.random() * 1000);
    return mockHumanize(text);
  }
  const res = await fetch(`${getApiBase()}/humanize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(data.error || "Humanize failed");
  }
  return res.json();
}

export async function detectMedia(file: File): Promise<DetectionResult> {
  if (isDemoMode()) {
    await delay(1200 + Math.random() * 800);
    return mockDetectMedia();
  }
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${getApiBase()}/detect`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Media detection failed");
  return res.json();
}
