export type RiasecCategory = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export type RiasecScores = Record<RiasecCategory, number>;

export type RiasecSummary = {
  topCategory: RiasecCategory;
  topTwo: string;
  topThree: string;
  rankedCategories: RiasecCategory[];
};

export type RiasecResult = RiasecSummary & {
  scores: RiasecScores;
};

export type RiasecAnswerValue = 0 | 1 | 2 | 3;

export type RiasecQuestion = {
  id: string;
  category: RiasecCategory;
  prompt: string;
  imagePath?: string | null;
  altText?: string | null;
};
