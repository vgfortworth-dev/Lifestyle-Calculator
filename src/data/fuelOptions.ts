import { Option } from '../types';

export const GAS_FUEL_OPTIONS: Option[] = [
  {
    id: 'gas-local',
    name: 'Local Driver',
    description: 'Short trips around town.',
    monthlyCost: 80,
    emoji: '⛽',
    category: 'Light Driving',
    items: ['Driving close to home', 'School, work, or errands nearby', 'A few trips each week', 'Lower monthly gas use'],
  },
  {
    id: 'gas-mid',
    name: 'Mid-Range Driver',
    description: 'Regular driving most weeks.',
    monthlyCost: 150,
    emoji: '🚗',
    category: 'Moderate Driving',
    items: ['Daily commuting', 'Weekend trips around the area', 'More errands and activities', 'Moderate monthly gas use'],
  },
  {
    id: 'gas-far',
    name: 'Far-Range Driver',
    description: 'Longer trips and frequent driving.',
    monthlyCost: 250,
    emoji: '🛣️',
    category: 'Heavy Driving',
    items: ['Longer commutes', 'Frequent highway driving', 'Lots of activities or travel', 'Higher monthly gas use'],
  },
];

export const EV_FUEL_OPTIONS: Option[] = [
  {
    id: 'ev-local',
    name: 'Local EV',
    description: 'Light charging for local trips.',
    monthlyCost: 30,
    emoji: '🔌',
    category: 'Light Driving',
    items: ['Driving close to home', 'Charging mostly at home', 'A few trips each week', 'Lower monthly electricity use'],
  },
  {
    id: 'ev-mid',
    name: 'Mid-Range EV',
    description: 'Regular charging for weekly driving.',
    monthlyCost: 60,
    emoji: '⚡',
    category: 'Moderate Driving',
    items: ['Daily commuting', 'Regular errands and activities', 'Some longer trips', 'Moderate monthly charging costs'],
  },
  {
    id: 'ev-far',
    name: 'Far-Range EV',
    description: 'More charging for frequent driving.',
    monthlyCost: 100,
    emoji: '🔋',
    category: 'Heavy Driving',
    items: ['Longer commutes', 'Frequent driving', 'More public charging', 'Higher monthly charging costs'],
  },
];

export const ALL_FUEL_OPTIONS = [...GAS_FUEL_OPTIONS, ...EV_FUEL_OPTIONS];
