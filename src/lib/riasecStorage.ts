import { RiasecCategory, RiasecSummary } from '../types/riasec';

const RIASEC_SUMMARY_SESSION_KEY = 'lifestyle_calculator_riasec_summary';
const RIASEC_CATEGORIES: RiasecCategory[] = ['R', 'I', 'A', 'S', 'E', 'C'];

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

export function loadRiasecSummary(): RiasecSummary | null {
  try {
    const saved = sessionStorage.getItem(RIASEC_SUMMARY_SESSION_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return isRiasecSummary(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveRiasecSummary(summary: RiasecSummary) {
  try {
    sessionStorage.setItem(RIASEC_SUMMARY_SESSION_KEY, JSON.stringify(summary));
  } catch {
    // Same-session fallback is optional; ignore storage failures.
  }
}

export function clearRiasecSummary() {
  try {
    sessionStorage.removeItem(RIASEC_SUMMARY_SESSION_KEY);
  } catch {
    // Same-session fallback is optional; ignore storage failures.
  }
}
