import { RiasecCategory, RiasecSummary } from '../types/riasec';

export const RIASEC_CATEGORIES: RiasecCategory[] = ['R', 'I', 'A', 'S', 'E', 'C'];

export type RiasecValidationResult =
  | { ok: true; summary: RiasecSummary }
  | { ok: false; error: string };

function isRiasecCategory(value: string): value is RiasecCategory {
  return RIASEC_CATEGORIES.includes(value as RiasecCategory);
}

export function normalizeRiasecCode(value: string) {
  return value.toUpperCase().replace(/[^RIASEC]/g, '').slice(0, 3);
}

export function buildRiasecSummaryFromCode(code: string): RiasecValidationResult {
  const normalized = normalizeRiasecCode(code);
  const letters = normalized.split('');

  if (letters.length < 2 || letters.length > 3) {
    return { ok: false, error: 'Enter a 2- or 3-letter RIASEC code.' };
  }

  if (!letters.every(isRiasecCategory)) {
    return { ok: false, error: 'Use only R, I, A, S, E, or C.' };
  }

  if (new Set(letters).size !== letters.length) {
    return { ok: false, error: 'Use each RIASEC letter only once.' };
  }

  const rankedCategories = letters as RiasecCategory[];
  const topTwo = rankedCategories.slice(0, 2).join('');
  const topThree = rankedCategories.slice(0, 3).join('');

  return {
    ok: true,
    summary: {
      topCategory: rankedCategories[0],
      topTwo,
      topThree,
      rankedCategories,
    },
  };
}
