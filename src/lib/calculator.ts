import { FuelPriceEnvironment, Option } from '../types';
import { TransportMonthlyCostOption, TransportRateKey } from '../types/calculator';
import { FuelPlanType, FuelPriceEnvironmentOption } from '../types/options';

export const INTEREST_RATES: Record<TransportRateKey, number> = {
  new: 6.5,
  used: 11.5,
  'new-ev': 6.5,
  'used-ev': 11.5
};

export const FUEL_PRICE_ENVIRONMENTS: FuelPriceEnvironmentOption[] = [
  { id: 'lower', label: 'Lower Prices', multiplier: 0.85, note: 'Fuel prices are lower right now, so driving costs less.' },
  { id: 'average', label: 'Average Prices', multiplier: 1 },
  { id: 'higher', label: 'Higher Prices', multiplier: 1.45, note: 'Fuel prices are higher right now, so driving costs more.' },
];

export function calculateTransportMonthly(price: number, annualRate: number): number {
  if (price === 0) return 0;
  const r = annualRate / 100 / 12;
  const n = 60;
  return (price * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function getTransportRateKey(category?: string): TransportRateKey | null {
  if (category === 'new' || category === 'used') return category;
  if (category === 'new_ev') return 'new-ev';
  if (category === 'used_ev') return 'used-ev';
  return null;
}

export function getTransportMonthlyCost(opt: TransportMonthlyCostOption | undefined): number {
  if (!opt) return 0;
  if (typeof opt.monthlyCost === 'number') return opt.monthlyCost;

  const rateKey = getTransportRateKey(opt.category);
  if (!rateKey || typeof opt.price !== 'number') return 0;

  return calculateTransportMonthly(opt.price, INTEREST_RATES[rateKey]);
}

export function getFuelPlanType(transportationIds: string[]): FuelPlanType {
  const selectedId = transportationIds[0];
  if (!selectedId || selectedId.startsWith('bike')) return 'none';
  if (selectedId.includes('-ev') || selectedId.includes('_ev') || selectedId.includes('ev-')) return 'ev';
  return 'gas';
}

export function getFuelPriceEnvironment(environment: unknown): FuelPriceEnvironment {
  return FUEL_PRICE_ENVIRONMENTS.some(option => option.id === environment)
    ? environment as FuelPriceEnvironment
    : 'average';
}

export function getFuelPriceMultiplier(environment: FuelPriceEnvironment): number {
  return FUEL_PRICE_ENVIRONMENTS.find(option => option.id === environment)?.multiplier || 1;
}

export function getFuelMonthlyCost(opt: Option | undefined, environment: FuelPriceEnvironment): number {
  if (!opt) return 0;
  if (opt.id.startsWith('gas-')) {
    return Math.round(opt.monthlyCost * getFuelPriceMultiplier(environment));
  }
  return opt.monthlyCost;
}
