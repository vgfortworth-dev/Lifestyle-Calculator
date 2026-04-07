export type ElectricityPlanInfo = {
  tag: string;
  what: string;
  why: string;
  different: string[];
  takeaway: string;
};

export const ELECTRICITY_PLAN_INFO: Record<string, ElectricityPlanInfo> = {
  gexa: {
    tag: 'Predictable',
    what: 'This is a fixed-rate electricity plan for 12 months.',
    why: 'A person might choose this plan if they want a simpler monthly rate and do not want their electricity price changing often.',
    different: [
      'Fixed rate means the price per unit of electricity stays steady during the plan term.',
      'It is a straightforward option for students learning how monthly bills work.',
    ],
    takeaway: 'Good for someone who wants a more predictable bill.',
  },
  reliant: {
    tag: 'Balanced',
    what: 'This is a 12-month electricity plan from Reliant that is designed to help households manage regular electricity use.',
    why: 'A person might choose this plan if they want a well-known provider and a plan that feels balanced for everyday home use.',
    different: [
      'It is positioned as a reliable everyday plan.',
      'It may feel like a good middle-ground option for students comparing cost and stability.',
    ],
    takeaway: 'Good for someone who wants a dependable everyday electricity plan.',
  },
  direct: {
    tag: 'Convenient',
    what: 'This is a 12-month electricity plan that includes an auto pay feature.',
    why: 'A person might choose this plan if they like the idea of bills being paid automatically each month and want to stay organized.',
    different: [
      'Auto pay can make paying bills easier.',
      'This can be helpful for people who want convenience and fewer missed payments.',
    ],
    takeaway: 'Good for someone who likes convenience and automatic payments.',
  },
  '4change': {
    tag: 'Savings-Focused',
    what: 'This is a 12-month fixed electricity plan that includes a bill credit feature.',
    why: 'A person might choose this plan if they want a lower estimated monthly cost and like the idea of extra savings built into the plan.',
    different: [
      'Includes a bill credit feature.',
      'Can be a good option for someone focused on monthly savings.',
    ],
    takeaway: 'Good for someone who wants to save money when possible.',
  },
};
