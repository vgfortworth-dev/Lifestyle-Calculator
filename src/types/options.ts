import { FuelPriceEnvironment, Option } from '../types';

export type UsageLabel =
  | 'Light Use'
  | 'Moderate Use'
  | 'Heavy Use'
  | 'Light Driving'
  | 'Moderate Driving'
  | 'Heavy Driving';

export type InternetPlanDetails = {
  usageLabel: Extract<UsageLabel, 'Light Use' | 'Moderate Use' | 'Heavy Use'>;
  bestFor: string[];
};

export type EnhancedInternetOption = Option & Partial<InternetPlanDetails>;

export type FuelPlanType = 'gas' | 'ev' | 'none';

export type FuelPriceEnvironmentOption = {
  id: FuelPriceEnvironment;
  label: string;
  multiplier: number;
  note?: string;
};

export type PhoneDecision = 'none' | 'keep' | 'refurbished' | 'new';

export type PhoneDeviceOption = {
  id: string;
  name: string;
  description: string;
  price: number;
  months: number;
  category: string;
  emoji?: string;
};

export type StreamingPlanGroup = {
  ads?: Option;
  noAds?: Option;
  standard?: Option;
};
