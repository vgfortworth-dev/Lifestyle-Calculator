import { Option } from '../types';

export type InsurancePriority = 'Saving money' | 'Being protected' | 'Regular care';

export type InsuranceInfoContent = {
  what: string;
  why: string;
};

export const INSURANCE_PLAN_OPTIONS: Option[] = [
  {
    id: 'health-basic',
    name: 'Basic Health Plan',
    description: 'Lower monthly cost with basic doctor visit support.',
    monthlyCost: 300,
    category: 'Health',
    emoji: '🏥',
    items: ['Saving money each month', 'Healthy people with fewer appointments', 'Basic checkups and urgent needs', 'Lower monthly premium'],
  },
  {
    id: 'health-standard',
    name: 'Standard Health Plan',
    description: 'Balanced coverage for regular care.',
    monthlyCost: 460,
    category: 'Health',
    emoji: '🩺',
    items: ['Regular doctor visits', 'Prescriptions or routine care', 'Balanced cost and protection', 'People who want a middle option'],
  },
  {
    id: 'health-premium',
    name: 'Premium Health Plan',
    description: 'Higher monthly cost for stronger protection.',
    monthlyCost: 600,
    category: 'Health',
    emoji: '🛡️',
    items: ['More frequent care', 'Specialists or ongoing health needs', 'More protection from big bills', 'People who want extra peace of mind'],
  },
  {
    id: 'dental-low',
    name: 'Dental Low Plan',
    description: 'Basic cleanings and checkups.',
    monthlyCost: 20,
    category: 'Dental',
    emoji: '🦷',
    items: ['Cleanings and checkups', 'Preventive dental visits', 'Lower monthly dental cost', 'Basic smile care'],
  },
  {
    id: 'dental-high',
    name: 'Dental High Plan',
    description: 'More coverage for procedures and dental care.',
    monthlyCost: 40,
    category: 'Dental',
    emoji: '🦷',
    items: ['Checkups and cleanings', 'More dental treatment support', 'People with more dental needs', 'Stronger dental protection'],
  },
  {
    id: 'vision-low',
    name: 'Vision Low Plan',
    description: 'Basic eye exam support.',
    monthlyCost: 10,
    category: 'Vision',
    emoji: '👓',
    items: ['Routine eye exams', 'Lower monthly vision cost', 'Basic vision support', 'People who mostly need checkups'],
  },
  {
    id: 'vision-high',
    name: 'Vision High Plan',
    description: 'Exams, glasses, and contacts support.',
    monthlyCost: 20,
    category: 'Vision',
    emoji: '👓',
    items: ['Eye exams', 'Glasses or contacts', 'More yearly vision needs', 'Stronger vision support'],
  },
  {
    id: 'life-basic',
    name: 'Basic Life',
    description: 'A small safety net for loved ones.',
    monthlyCost: 20,
    category: 'Life',
    emoji: '🤝',
    items: ['Lower monthly cost', 'Simple protection', 'People starting their first budget', 'Basic support for family'],
  },
  {
    id: 'life-standard',
    name: 'Standard Life',
    description: 'More protection for people who depend on you.',
    monthlyCost: 60,
    category: 'Life',
    emoji: '👨‍👩‍👧‍👦',
    items: ['More family protection', 'People with dependents', 'Larger safety net', 'Long-term peace of mind'],
  },
];

const INSURANCE_PRIORITY_BY_ID: Record<string, InsurancePriority[]> = {
  'health-basic': ['Saving money'],
  'health-standard': ['Regular care', 'Being protected'],
  'health-premium': ['Being protected', 'Regular care'],
  'vision-low': ['Saving money', 'Regular care'],
  'vision-high': ['Regular care', 'Being protected'],
  'dental-low': ['Saving money', 'Regular care'],
  'dental-high': ['Regular care', 'Being protected'],
  'life-basic': ['Saving money'],
  'life-standard': ['Being protected'],
  'auto-geico': ['Saving money'],
  'auto-farmbureau': ['Saving money'],
  'auto-usaa': ['Saving money'],
  'auto-statefarm': ['Being protected'],
  'auto-progressive': ['Being protected'],
  'auto-allstate': ['Being protected'],
  'home-lemonade': ['Saving money'],
  'home-progressive': ['Saving money'],
  'home-usaa': ['Saving money'],
  'home-statefarm': ['Being protected'],
  'home-allstate': ['Being protected'],
  'home-farmbureau': ['Being protected'],
};

const INSURANCE_WHY_BY_ID: Record<string, string> = {
  'health-basic': 'Good for saving money because the monthly cost is lower.',
  'health-standard': 'Good for regular care because it balances checkups, prescriptions, and protection.',
  'health-premium': 'Good for being protected because it covers more care.',
  'vision-low': 'Good for saving money and regular care because it helps with routine eye checkups at a low monthly cost.',
  'vision-high': 'Good for regular care and being protected because it helps with more vision needs during the year.',
  'dental-low': 'Good for saving money and regular care because it helps cover preventive dental visits.',
  'dental-high': 'Good for being protected and regular care because it helps with checkups and more dental treatment.',
  'life-basic': 'Good for saving money because it gives a simple safety net at a lower monthly cost.',
  'life-standard': 'Good for being protected because it gives a larger safety net for people who depend on you.',
  'auto-geico': 'Good for saving money because it is one of the lower-cost auto options.',
  'auto-farmbureau': 'Good for saving money because it keeps the monthly auto cost lower.',
  'auto-usaa': 'Good for saving money because it offers a lower monthly auto estimate.',
  'auto-statefarm': 'Good for being protected because it focuses on local agent support.',
  'auto-progressive': 'Good for being protected because it includes stronger auto coverage tools.',
  'auto-allstate': 'Good for being protected because it focuses on accident support.',
  'home-lemonade': 'Good for saving money because it is a lower-cost renters option.',
  'home-progressive': 'Good for saving money because it keeps the renters cost lower.',
  'home-usaa': 'Good for saving money because it is one of the lowest renters estimates.',
  'home-statefarm': 'Good for being protected because it can support bundled renters coverage.',
  'home-allstate': 'Good for being protected because it focuses on renters security support.',
  'home-farmbureau': 'Good for being protected because it offers local Texas renters support.',
};

export const INSURANCE_PRIORITY_BADGES: Record<InsurancePriority, string> = {
  'Saving money': 'Best for Saving Money',
  'Being protected': 'Best for Protection',
  'Regular care': 'Best for Regular Care',
};

export const INSURANCE_PROMPT_OPTIONS: InsurancePriority[] = ['Saving money', 'Being protected', 'Regular care'];

export const INSURANCE_CATEGORY_ORDER = ['Auto', 'Home', 'Health', 'Dental', 'Vision', 'Life', 'General'] as const;

export type InsuranceCategory = (typeof INSURANCE_CATEGORY_ORDER)[number];

export const INSURANCE_COST_EXAMPLES = [
  { title: 'Doctor Visit', without: '$150+', with: '$20-40 copay' },
  { title: 'Broken Phone or Laptop in a Fire', without: 'Replace it yourself', with: 'Renters policy may help' },
  { title: 'Car Accident', without: 'Thousands of dollars', with: 'Auto policy helps cover costs' },
];

export function getEnhancedInsuranceOptions(options: Option[]): Option[] {
  const supplementalCategories = ['Health', 'Dental', 'Vision', 'Life'];
  const baseOptions = options.filter((option) => !supplementalCategories.includes(option.category));
  return [...baseOptions, ...INSURANCE_PLAN_OPTIONS];
}

function addRegularCarePriority(priorities: InsurancePriority[], category?: string) {
  if (category === 'Auto' || category === 'Home') {
    return Array.from(new Set([...priorities, 'Regular care' as InsurancePriority]));
  }
  return priorities;
}

export function getInsurancePriorities(option: Option): InsurancePriority[] {
  const id = option.id.toLowerCase();
  const category = option.category || '';

  if (INSURANCE_PRIORITY_BY_ID[id]) return addRegularCarePriority(INSURANCE_PRIORITY_BY_ID[id], category);
  if (category === 'Auto') return addRegularCarePriority(option.monthlyCost <= 160 ? ['Saving money'] : ['Being protected'], category);
  if (category === 'Home') return addRegularCarePriority(option.monthlyCost <= 16 ? ['Saving money'] : ['Being protected'], category);
  if (category === 'Health' && id.includes('basic')) return ['Saving money'];
  if (category === 'Health' && (id.includes('standard') || id.includes('premium'))) return ['Regular care', 'Being protected'];
  if (category === 'Dental' || category === 'Vision') return ['Regular care'];
  if (category === 'Life' && id.includes('basic')) return ['Saving money'];
  if (category === 'Life') return ['Being protected'];
  return [];
}

export function getInsuranceWhy(option: Option): string {
  const id = option.id.toLowerCase();
  const category = option.category || '';

  if (INSURANCE_WHY_BY_ID[id]) return INSURANCE_WHY_BY_ID[id];
  if (category === 'Auto') {
    return option.monthlyCost <= 160
      ? 'Good for saving money because the monthly auto cost is lower.'
      : 'Good for being protected because it offers stronger auto coverage support.';
  }
  if (category === 'Home') {
    return option.monthlyCost <= 16
      ? 'Good for saving money because the monthly renters cost is lower.'
      : 'Good for being protected because it offers stronger renters coverage support.';
  }
  if (category === 'Health' || category === 'Dental' || category === 'Vision') {
    return 'Good for regular care because it helps with routine checkups.';
  }
  if (category === 'Life') {
    return 'Good for being protected because it creates a safety net for loved ones.';
  }
  return 'Good to compare because it changes your monthly protection and cost.';
}

export function getInsuranceInfo(option: Option): InsuranceInfoContent {
  const id = option.id.toLowerCase();
  const category = option.category || '';

  if (category === 'Auto') {
    return {
      what: 'Auto insurance helps cover damage, accidents, and other car-related costs.',
      why: 'If you drive, auto insurance is usually required by law. It can help protect you from paying a lot of money after an accident.',
    };
  }
  if (category === 'Home') {
    return {
      what: 'Home or renters insurance helps protect your things, like clothes, furniture, or electronics, if they are stolen or damaged.',
      why: 'If you rent or own a place, this insurance can help replace your belongings after problems like fire, storms, or theft.',
    };
  }
  if (category === 'Health') {
    return {
      what: 'Health insurance helps pay for doctor visits, medicine, and hospital care.',
      why: 'It can help make medical care more affordable and protect you from very large health bills.',
    };
  }
  if (id === 'dental-low') {
    return {
      what: 'This plan helps pay for basic dental care like cleanings and checkups.',
      why: 'It is helpful if you want lower-cost support for routine dentist visits.',
    };
  }
  if (id === 'dental-high') {
    return {
      what: 'This plan helps pay for basic dental care and more dental treatment.',
      why: 'It can help if you want more protection in case you need fillings, procedures, or more dental work.',
    };
  }
  if (id === 'vision-low') {
    return {
      what: 'This plan helps pay for basic eye exams.',
      why: 'It is helpful if you want support for regular eye checkups at a lower monthly cost.',
    };
  }
  if (id === 'vision-high') {
    return {
      what: 'This plan helps pay for eye exams and may help with glasses or contacts.',
      why: 'It can be useful if you need vision care more often or wear glasses or contacts.',
    };
  }
  if (id === 'life-basic') {
    return {
      what: 'Life insurance gives money to your family or chosen person if you die.',
      why: 'Some people get life insurance to help protect loved ones from financial stress.',
    };
  }
  if (id === 'life-standard') {
    return {
      what: 'This is a larger life insurance plan with more financial protection.',
      why: 'People may choose it if others depend on them financially and they want stronger protection.',
    };
  }

  return {
    what: 'This insurance option helps protect you from certain expensive problems.',
    why: 'Someone might choose it to lower financial risk and feel more prepared.',
  };
}
