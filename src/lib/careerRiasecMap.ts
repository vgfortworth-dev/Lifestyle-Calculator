import { CareerSuggestion } from '../services/gemini';
import { RiasecCategory } from '../types/riasec';

type CareerRiasecRule = {
  keywords: string[];
  codes: RiasecCategory[];
};

const CAREER_RIASEC_RULES: CareerRiasecRule[] = [
  { keywords: ['nurse', 'therapist', 'counselor', 'teacher', 'social worker', 'healthcare', 'medical assistant'], codes: ['S'] },
  { keywords: ['engineer', 'developer', 'software', 'data', 'analyst', 'scientist', 'technician', 'cybersecurity'], codes: ['I', 'C'] },
  { keywords: ['designer', 'artist', 'writer', 'marketing', 'media', 'content', 'creative'], codes: ['A', 'E'] },
  { keywords: ['manager', 'sales', 'entrepreneur', 'business', 'real estate', 'executive'], codes: ['E', 'S'] },
  { keywords: ['accountant', 'bookkeeper', 'finance', 'administrative', 'operations', 'paralegal'], codes: ['C', 'E'] },
  { keywords: ['mechanic', 'electrician', 'welder', 'plumber', 'construction', 'driver', 'hvac', 'manufacturing'], codes: ['R', 'C'] },
  { keywords: ['architect', 'veterinarian', 'pharmacist', 'lab', 'research'], codes: ['I', 'R'] },
];

export function getCareerRiasecCodes(career: Pick<CareerSuggestion, 'title' | 'description'>): RiasecCategory[] {
  const text = `${career.title} ${career.description}`.toLowerCase();
  const matchedCodes = new Set<RiasecCategory>();

  CAREER_RIASEC_RULES.forEach((rule) => {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      rule.codes.forEach((code) => matchedCodes.add(code));
    }
  });

  return [...matchedCodes];
}
