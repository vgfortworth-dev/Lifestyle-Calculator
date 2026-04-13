
export type Region = {
  id: string;
  name: string;
  majorCity: string;
  costMultiplier: number; // Relative to a baseline
  emoji?: string;
  image?: string;
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

export type ClothingClosetEntry = {
  id: string;
  name: string;
  category: string;
  price: number;
  lifespanMonths: number;
  quantity: number;
  image: string;
};

export type ClothingClosetState = Record<string, ClothingClosetEntry>;

export type GroceryCartEntry = {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  image?: string;
  storeTier?: string;
  productType?: string;
  quality?: string;
  store?: string;
  quantityLabel?: string;
  shopperTags?: string[];
  isAllergyFriendly?: boolean;
  isBudget?: boolean;
  isPremium?: boolean;
};

export type GroceryCartState = Record<string, GroceryCartEntry>;

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
    foodCart: GroceryCartState;
    transportation: string[];
    fuel: string;
    fuelPriceEnvironment: FuelPriceEnvironment;
    clothingCloset: ClothingClosetState;
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
