// TruthGuard API service layer
// Configure API_BASE to point to your Flask backend

const API_BASE = localStorage.getItem("truthguard_api_base") || "http://localhost:5000";

export function getApiBase(): string {
  return localStorage.getItem("truthguard_api_base") || "http://localhost:5000";
}

export function setApiBase(url: string) {
  localStorage.setItem("truthguard_api_base", url);
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

export async function detectText(text: string): Promise<DetectionResult> {
  const res = await fetch(`${getApiBase()}/text_detect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Text detection failed");
  return res.json();
}

export async function humanizeText(text: string): Promise<HumanizeResult> {
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
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${getApiBase()}/detect`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Media detection failed");
  return res.json();
}
