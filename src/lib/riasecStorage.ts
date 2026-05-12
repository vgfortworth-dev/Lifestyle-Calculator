import { RiasecCategory, RiasecSummary } from '../types/riasec';

const RIASEC_SUMMARY_SESSION_KEY = 'lifestyle_calculator_riasec_summary';
const RIASEC_SUMMARY_PILOT_KEY = 'riasec_summary_pilot';
const RIASEC_CATEGORIES: RiasecCategory[] = ['R', 'I', 'A', 'S', 'E', 'C'];

function getRiasecSummarySessionKey(userId?: string | null) {
  return userId ? `${RIASEC_SUMMARY_SESSION_KEY}::${userId}` : RIASEC_SUMMARY_PILOT_KEY;
}

function isRiasecCategory(value: unknown): value is RiasecCategory {
  return typeof value === 'string' && RIASEC_CATEGORIES.includes(value as RiasecCategory);
}

export function isRiasecSummary(value: unknown): value is RiasecSummary {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<RiasecSummary>;
  return (
    isRiasecCategory(candidate.topCategory) &&
    typeof candidate.topTwo === 'string' &&
    typeof candidate.topThree === 'string' &&
    Array.isArray(candidate.rankedCategories) &&
    candidate.rankedCategories.every(isRiasecCategory)
  );
}

export function loadRiasecSummary(userId?: string | null): RiasecSummary | null {
  try {
    const storageKey = getRiasecSummarySessionKey(userId);
    if (!storageKey) return null;
    const saved = sessionStorage.getItem(storageKey);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return isRiasecSummary(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveRiasecSummary(summary: RiasecSummary, userId?: string | null) {
  try {
    const storageKey = getRiasecSummarySessionKey(userId);
    if (!storageKey) return;
    sessionStorage.setItem(storageKey, JSON.stringify(summary));
  } catch {
    // Same-session fallback is optional; ignore storage failures.
  }
}

export function clearRiasecSummary(userId?: string | null) {
  try {
    const storageKey = getRiasecSummarySessionKey(userId);
    if (storageKey) {
      sessionStorage.removeItem(storageKey);
    }
    sessionStorage.removeItem(RIASEC_SUMMARY_SESSION_KEY);
    sessionStorage.removeItem(RIASEC_SUMMARY_PILOT_KEY);
  } catch {
    // Same-session fallback is optional; ignore storage failures.
  }
}
