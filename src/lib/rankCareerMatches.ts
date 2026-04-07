import { getCareerRiasecCodes } from './careerRiasecMap';
import { CareerSuggestion } from '../services/gemini';
import { RiasecCategory, RiasecSummary } from '../types/riasec';

export type CareerMatchLabel = 'Strong match' | 'Good-fit stretch option' | 'Explore similar careers';

export type RankedCareerMatch = CareerSuggestion & {
  matchScore: number;
  canAffordLifestyle: boolean;
  matchLabel: CareerMatchLabel;
  reasons: string[];
  riasecCodes: RiasecCategory[];
  estimatedAnnualSalary: number | null;
};

function parseAnnualSalary(value: string): number | null {
  const matches = [...value.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*(k)?/gi)]
    .map((match) => {
      const numeric = Number(match[1].replace(/,/g, ''));
      if (!Number.isFinite(numeric)) return null;
      return match[2]?.toLowerCase() === 'k' ? numeric * 1000 : numeric;
    })
    .filter((amount): amount is number => amount !== null && amount > 0);

  if (!matches.length) return null;
  return matches.reduce((sum, amount) => sum + amount, 0) / matches.length;
}

function getRiasecFitScore(careerCodes: RiasecCategory[], summary: RiasecSummary | null): number {
  if (!summary || careerCodes.length === 0) return 0;

  const weights = [45, 30, 20];
  return summary.rankedCategories.slice(0, 3).reduce((score, category, index) => {
    return careerCodes.includes(category) ? score + (weights[index] || 0) : score;
  }, 0);
}

function getAffordabilityScore(annualSalary: number | null, monthlyLifestyleTotal: number): number {
  if (!annualSalary || monthlyLifestyleTotal <= 0) return 10;

  const monthlySalary = annualSalary / 12;
  const ratio = monthlySalary / monthlyLifestyleTotal;

  if (ratio >= 1.25) return 35;
  if (ratio >= 1) return 28;
  if (ratio >= 0.85) return 18;
  return 6;
}

function getMatchLabel(matchScore: number, canAffordLifestyle: boolean, riasecFitScore: number): CareerMatchLabel {
  if (canAffordLifestyle && (matchScore >= 65 || riasecFitScore >= 45)) return 'Strong match';
  if (matchScore >= 45 || riasecFitScore >= 30) return 'Good-fit stretch option';
  return 'Explore similar careers';
}

function getMatchReasons(
  careerCodes: RiasecCategory[],
  summary: RiasecSummary | null,
  canAffordLifestyle: boolean,
  annualSalary: number | null
) {
  const reasons: string[] = [];

  if (summary && careerCodes.length > 0) {
    const matchingCodes = summary.rankedCategories.slice(0, 3).filter((category) => careerCodes.includes(category));
    if (matchingCodes.length) {
      reasons.push(`Connects with your ${matchingCodes.join('/')} interest pattern.`);
    } else {
      reasons.push('Worth exploring even though it is outside your top RIASEC areas.');
    }
  } else if (summary) {
    reasons.push('RIASEC details are limited for this career, so it is ranked mostly by lifestyle fit.');
  } else {
    reasons.push('Ranked by how well the salary fits your lifestyle budget.');
  }

  if (!annualSalary) {
    reasons.push('Salary details are broad, so compare local job listings before deciding.');
  } else if (canAffordLifestyle) {
    reasons.push('Typical pay appears to cover your selected monthly lifestyle cost.');
  } else {
    reasons.push('This may be a stretch option unless pay grows with experience or training.');
  }

  return reasons;
}

export function rankCareerMatches(
  careers: CareerSuggestion[],
  riasecSummary: RiasecSummary | null,
  monthlyLifestyleTotal: number
): RankedCareerMatch[] {
  return careers
    .map((career, index) => {
      const riasecCodes = getCareerRiasecCodes(career);
      const estimatedAnnualSalary = parseAnnualSalary(career.avgSalary);
      const canAffordLifestyle = estimatedAnnualSalary
        ? estimatedAnnualSalary / 12 >= monthlyLifestyleTotal
        : false;
      const riasecFitScore = getRiasecFitScore(riasecCodes, riasecSummary);
      const affordabilityScore = getAffordabilityScore(estimatedAnnualSalary, monthlyLifestyleTotal);
      const matchScore = Math.round(riasecFitScore + affordabilityScore);

      return {
        ...career,
        matchScore,
        canAffordLifestyle,
        matchLabel: getMatchLabel(matchScore, canAffordLifestyle, riasecFitScore),
        reasons: getMatchReasons(riasecCodes, riasecSummary, canAffordLifestyle, estimatedAnnualSalary),
        riasecCodes,
        estimatedAnnualSalary,
        originalIndex: index,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore || a.originalIndex - b.originalIndex)
    .map(({ originalIndex, ...career }) => career);
}
