import { ClothingClosetState } from '../types';

export function getSelectedClosetItems(closet: ClothingClosetState) {
  return Object.values(closet)
    .filter((item) => item.quantity > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getTotalSelectedItemCount(closet: ClothingClosetState) {
  return getSelectedClosetItems(closet).reduce((sum, item) => sum + item.quantity, 0);
}

export function getTotalClosetValue(closet: ClothingClosetState) {
  return getSelectedClosetItems(closet).reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getItemMonthlyClothingCost(price: number, quantity: number, lifespanMonths: number) {
  if (!lifespanMonths || quantity <= 0) return 0;
  return (price * quantity) / lifespanMonths;
}

export function getTotalMonthlyClothingCost(closet: ClothingClosetState) {
  return getSelectedClosetItems(closet).reduce(
    (sum, item) => sum + getItemMonthlyClothingCost(item.price, item.quantity, item.lifespanMonths),
    0
  );
}
