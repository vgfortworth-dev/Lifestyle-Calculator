import {
  RiasecAnswerValue,
  RiasecCategory,
  RiasecQuestion,
  RiasecResult,
  RiasecScores,
  RiasecSummary,
} from '../types/riasec';

export type RiasecAnswers = Record<string, RiasecAnswerValue>;

const RIASEC_CATEGORIES: RiasecCategory[] = ['R', 'I', 'A', 'S', 'E', 'C'];

export function calculateRiasecResult(
  answers: RiasecAnswers,
  questions: RiasecQuestion[]
): RiasecResult {
  const scores = RIASEC_CATEGORIES.reduce((acc, category) => {
    acc[category] = 0;
    return acc;
  }, {} as RiasecScores);

  questions.forEach((question) => {
    scores[question.category] += answers[question.id] ?? 0;
  });

  const rankedCategories = [...RIASEC_CATEGORIES].sort((a, b) => {
    const scoreDifference = scores[b] - scores[a];
    return scoreDifference === 0
      ? RIASEC_CATEGORIES.indexOf(a) - RIASEC_CATEGORIES.indexOf(b)
      : scoreDifference;
  });

  const topThreeCategories = rankedCategories.slice(0, 3);

  return {
    scores,
    rankedCategories,
    topCategory: rankedCategories[0],
    topTwo: rankedCategories.slice(0, 2).join(''),
    topThree: topThreeCategories.join(''),
  };
}

export function toRiasecSummary(result: RiasecResult): RiasecSummary {
  return {
    topCategory: result.topCategory,
    topTwo: result.topTwo,
    topThree: result.topThree,
    rankedCategories: result.rankedCategories,
  };
}
