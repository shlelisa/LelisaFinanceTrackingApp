import type { AIInsightItem } from "./aiEngine";

const AI_DERIVED_CACHE_KEY = "pft_ai_derived_cache";

export interface AIDerivedCache {
  lastUpdated: string;
  insights: AIInsightItem[];
}

export function getDerivedAICache(): AIDerivedCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AI_DERIVED_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Error reading AI derived cache", e);
    return null;
  }
}

export function saveDerivedAICache(insights: AIInsightItem[]): AIDerivedCache {
  const cache: AIDerivedCache = {
    lastUpdated: new Date().toISOString(),
    insights,
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(AI_DERIVED_CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.error("Error saving AI derived cache", e);
    }
  }
  return cache;
}

export function clearDerivedAICache(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AI_DERIVED_CACHE_KEY);
}
