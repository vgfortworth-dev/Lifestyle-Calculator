
export type Region = {
  id: string;
  name: string;
  majorCity: string;
  costMultiplier: number; // Relative to a baseline
  emoji?: string;
};

export type Option = {
  id: string;
  name: string;
  description: string;
  monthlyCost: number;
  weeklyPrice?: number;
  recommended?: boolean;
  emoji?: string;
  image?: string;
  category?: string;
  type?: string;
  isPlus?: boolean;
  items?: string[];
  service?: string;
  planType?: 'ads' | 'no-ads' | 'standard';
  planName?: string;
  data?: string;
  hotspot?: string;
  access?: string;
  notes?: string;
};

export type FuelPriceEnvironment = 'lower' | 'average' | 'higher';

export type QuizState = {
  currentStep: number;
  regionId: string;
  selections: {
    housing: string;
    phone: string;
    phonePlan: string;
    internet: string;
    utilities: string[];
    streaming: string[];
    subscriptions: string[];
    food: string;
    transportation: string[];
    fuel: string;
    fuelPriceEnvironment: FuelPriceEnvironment;
    clothing: string;
    insurance: string[];
    other: string[];
  };
};

export const STEPS = [
  'Welcome',
  'Location',
  'Housing',
  'Phone',
  'Phone Plan',
  'Internet',
  'Utilities',
  'Streaming',
  'Subscriptions',
  'Food',
  'Transportation',
  'Fuel',
  'Clothing',
  'Insurance Info',
  'Insurance Selection',
  'Other Services',
  'Results'
];
