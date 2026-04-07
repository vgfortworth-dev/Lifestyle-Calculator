import { CareerSuggestion, getCareerSuggestions } from '../services/gemini';

const CAREER_SUGGESTIONS_SESSION_PREFIX = 'career_suggestions::';
const careerSuggestionCache = new Map<string, CareerSuggestion[]>();
const careerSuggestionRequests = new Map<string, Promise<CareerSuggestion[]>>();

function isCareerSuggestion(value: unknown): value is CareerSuggestion {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CareerSuggestion>;
  return (
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.education === 'string' &&
    typeof candidate.avgSalary === 'string' &&
    typeof candidate.growth === 'string'
  );
}

function readSessionCareerSuggestions(key: string) {
  try {
    const saved = sessionStorage.getItem(`${CAREER_SUGGESTIONS_SESSION_PREFIX}${key}`);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.every(isCareerSuggestion) ? parsed : null;
  } catch {
    return null;
  }
}

function writeSessionCareerSuggestions(key: string, suggestions: CareerSuggestion[]) {
  try {
    sessionStorage.setItem(`${CAREER_SUGGESTIONS_SESSION_PREFIX}${key}`, JSON.stringify(suggestions));
  } catch {
    // Same-session stabilization is optional; ignore storage failures.
  }
}

export function getCareerSuggestionKey(salary: number, region: string, riasecCode?: string | null) {
  return `${Math.round(salary)}::${region}::${riasecCode || 'no-riasec'}`;
}

export async function getStableCareerSuggestions(
  key: string,
  salary: number,
  region: string
): Promise<CareerSuggestion[]> {
  const cached = careerSuggestionCache.get(key);
  if (cached) return cached;

  const stored = readSessionCareerSuggestions(key);
  if (stored) {
    careerSuggestionCache.set(key, stored);
    return stored;
  }

  const existingRequest = careerSuggestionRequests.get(key);
  if (existingRequest) return existingRequest;

  const request = getCareerSuggestions(salary, region)
    .then((suggestions) => {
      careerSuggestionCache.set(key, suggestions);
      writeSessionCareerSuggestions(key, suggestions);
      careerSuggestionRequests.delete(key);
      return suggestions;
    })
    .catch((error) => {
      careerSuggestionRequests.delete(key);
      throw error;
    });

  careerSuggestionRequests.set(key, request);
  return request;
}
