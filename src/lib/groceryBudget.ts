import { GroceryCartState } from '../types';

const WEEKS_PER_MONTH = 52 / 12;

export type GroceryShopperBadge = {
  label: string;
  description: string;
};

export function getSelectedGroceryItems(cart: GroceryCartState) {
  return Object.values(cart)
    .filter((item) => item.quantity > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getTotalGroceryItemCount(cart: GroceryCartState) {
  return getSelectedGroceryItems(cart).reduce((sum, item) => sum + item.quantity, 0);
}

export function getTotalWeeklyGroceryCost(cart: GroceryCartState) {
  return getSelectedGroceryItems(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getTotalMonthlyGroceryCost(cart: GroceryCartState) {
  return getTotalWeeklyGroceryCost(cart) * WEEKS_PER_MONTH;
}

export function getGroceryCategoryCount(cart: GroceryCartState) {
  return new Set(getSelectedGroceryItems(cart).map((item) => item.category)).size;
}

export function getGroceryShopperBadge(cart: GroceryCartState): GroceryShopperBadge {
  const items = getSelectedGroceryItems(cart);
  const weeklyTotal = getTotalWeeklyGroceryCost(cart);
  const totalCount = getTotalGroceryItemCount(cart);
  const categoryCount = getGroceryCategoryCount(cart);

  if (items.length === 0 || totalCount === 0) {
    return {
      label: 'Future Shopper',
      description: 'Start adding groceries to see what kind of food shopper you are.',
    };
  }

  const scores = {
    budget: 0,
    smart: 0,
    balanced: 0,
    snack: 0,
    fresh: 0,
    convenience: 0,
    premium: 0,
    brand: 0,
  };

  items.forEach((item) => {
    const quantity = item.quantity;
    const tags = item.shopperTags || [];

    if (item.isBudget) scores.budget += quantity * 2;
    if (item.isPremium) scores.premium += quantity * 2;

    tags.forEach((tag) => {
      if (tag in scores) {
        scores[tag as keyof typeof scores] += quantity * 2;
      }

      if (tag === 'essential') {
        scores.smart += quantity;
        scores.balanced += quantity;
      }
      if (tag === 'fresh') {
        scores.smart += quantity;
      }
      if (tag === 'snack' || tag === 'brand') {
        scores.balanced += quantity;
      }
    });
  });

  const snackShare = totalCount > 0 ? scores.snack / totalCount : 0;

  if (scores.premium >= 6 && scores.premium >= scores.budget && scores.premium >= scores.snack) {
    return {
      label: 'Premium / Organic Shopper',
      description: 'You are leaning into upgraded, organic, and premium cart choices.',
    };
  }

  if (snackShare >= 1.2 || scores.snack >= 8) {
    return {
      label: 'Snack Lover',
      description: 'Your cart has plenty of grab-and-go fun, which can add up faster than expected.',
    };
  }

  if (scores.convenience >= 6) {
    return {
      label: 'Convenience Shopper',
      description: 'You value fast, easy options that save time even when they cost a little more.',
    };
  }

  if (scores.budget >= 6 && weeklyTotal <= 45) {
    return {
      label: 'Budget Saver',
      description: 'You are keeping your grocery cart focused on low-cost staples and strong value picks.',
    };
  }

  if (scores.fresh >= 6 && scores.snack <= 4) {
    return {
      label: 'Fresh & Simple',
      description: 'You are building around produce and practical fresh picks without much extra clutter.',
    };
  }

  if (scores.smart >= 8 && categoryCount >= 4 && weeklyTotal <= 90) {
    return {
      label: 'Smart Shopper',
      description: 'You are covering your essentials with a balanced cart and controlled spending.',
    };
  }

  if (scores.brand >= 6) {
    return {
      label: 'Brand Loyalist',
      description: 'Your cart shows a strong preference for familiar favorites over store-brand swaps.',
    };
  }

  return {
    label: 'Balanced Buyer',
    description: 'You are mixing basics, comfort items, and a little variety in a realistic weekly cart.',
  };
}
