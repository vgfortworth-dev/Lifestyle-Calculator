export type GroceryBrowseCategory =
  | 'Produce'
  | 'Protein'
  | 'Pantry'
  | 'Snacks'
  | 'Bread & Grains'
  | 'Dairy & Eggs'
  | 'Drinks / Coffee'
  | 'Premium / Specialty';

export type GroceryQuality =
  | 'Cheapest'
  | 'Store Brand'
  | 'Mid-Grade'
  | 'Premium/Organic'
  | 'Allergy-Free Option';

export type GroceryStore = 'Target' | 'Wal-Mart' | 'Kroger';

export type GroceryShopperTag =
  | 'budget'
  | 'essential'
  | 'fresh'
  | 'premium'
  | 'organic'
  | 'snack'
  | 'convenience'
  | 'brand'
  | 'allergy-friendly';

export type RawGroceryItem = {
  id: string;
  productKey: string;
  name: string;
  category: GroceryBrowseCategory;
  productType: string;
  quality: GroceryQuality;
  store: GroceryStore;
  quantity: string;
  itemPrice: number;
  imageUrl?: string;
  description?: string;
  shopperTags?: GroceryShopperTag[];
};

export type GroceryItem = {
  id: string;
  name: string;
  category: GroceryBrowseCategory;
  productType: string;
  quality: GroceryQuality;
  quantity: string;
  itemPrice: number;
  imageUrl?: string;
  description?: string;
  shopperTags?: GroceryShopperTag[];
  isAllergyFriendly?: boolean;
  isPremium?: boolean;
  isBudget?: boolean;
  sortOrder?: number;
  isActive?: boolean;
  sourceCount: number;
  sourceStores: GroceryStore[];
};

const GROCERY_CATEGORY_CONFIG: Record<GroceryBrowseCategory, { order: number }> = {
  'Produce': { order: 100 },
  'Protein': { order: 200 },
  'Pantry': { order: 300 },
  'Snacks': { order: 400 },
  'Bread & Grains': { order: 500 },
  'Dairy & Eggs': { order: 600 },
  'Drinks / Coffee': { order: 700 },
  'Premium / Specialty': { order: 800 },
};

export const GROCERY_BROWSE_CATEGORIES: GroceryBrowseCategory[] = [
  'Produce',
  'Protein',
  'Pantry',
  'Snacks',
  'Bread & Grains',
  'Dairy & Eggs',
  'Drinks / Coffee',
  'Premium / Specialty',
];

const QUALITY_PRIORITY: Record<GroceryQuality, number> = {
  'Cheapest': 1,
  'Store Brand': 2,
  'Mid-Grade': 3,
  'Premium/Organic': 4,
  'Allergy-Free Option': 5,
};

function mergeQuality(items: RawGroceryItem[]): GroceryQuality {
  return items
    .map((item) => item.quality)
    .sort((a, b) => QUALITY_PRIORITY[b] - QUALITY_PRIORITY[a])[0];
}

function mergeDescription(items: RawGroceryItem[]): string {
  const named = items[0];
  const quality = mergeQuality(items);
  const storeCount = new Set(items.map((item) => item.store)).size;
  if (quality === 'Premium/Organic') {
    return `${named.quantity} of ${named.name.toLowerCase()} at a premium or organic quality level.`;
  }
  if (quality === 'Allergy-Free Option') {
    return `${named.quantity} of ${named.name.toLowerCase()} with an allergy-friendly or specialty focus.`;
  }
  if (storeCount > 1) {
    return `${named.quantity} of ${named.name.toLowerCase()} averaged across multiple major grocery stores.`;
  }
  return `${named.quantity} of ${named.name.toLowerCase()} in a realistic weekly-cart portion.`;
}

function averagePrice(items: RawGroceryItem[]) {
  const total = items.reduce((sum, item) => sum + item.itemPrice, 0);
  return Number((total / items.length).toFixed(2));
}

function mergeTags(items: RawGroceryItem[]) {
  return Array.from(new Set(items.flatMap((item) => item.shopperTags || [])));
}

function buildCatalog(rawItems: RawGroceryItem[]): GroceryItem[] {
  const grouped = new Map<string, RawGroceryItem[]>();

  rawItems.forEach((item) => {
    const current = grouped.get(item.productKey) || [];
    current.push(item);
    grouped.set(item.productKey, current);
  });

  return Array.from(grouped.values())
    .map((items, index) => {
      const first = items[0];
      const shopperTags = mergeTags(items);
      const quality = mergeQuality(items);
      return {
        id: first.productKey,
        name: first.name,
        category: first.category,
        productType: first.productType,
        quality,
        quantity: first.quantity,
        itemPrice: averagePrice(items),
        imageUrl: first.imageUrl,
        description: first.description || mergeDescription(items),
        shopperTags,
        isAllergyFriendly: quality === 'Allergy-Free Option' || shopperTags.includes('allergy-friendly'),
        isPremium: quality === 'Premium/Organic' || shopperTags.includes('premium') || shopperTags.includes('organic'),
        isBudget: quality === 'Cheapest' || quality === 'Store Brand' || shopperTags.includes('budget'),
        sortOrder: GROCERY_CATEGORY_CONFIG[first.category].order + index,
        isActive: true,
        sourceCount: items.length,
        sourceStores: Array.from(new Set(items.map((item) => item.store))),
      };
    })
    .sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER));
}

export const RAW_GROCERY_ITEMS: RawGroceryItem[] = [
  { id: 'bananas-walmart', productKey: 'bananas', name: 'Bananas', category: 'Produce', productType: 'Fruit', quality: 'Cheapest', store: 'Wal-Mart', quantity: '2 lb bunch', itemPrice: 1.82, shopperTags: ['budget', 'fresh', 'essential'] },
  { id: 'bananas-kroger', productKey: 'bananas', name: 'Bananas', category: 'Produce', productType: 'Fruit', quality: 'Store Brand', store: 'Kroger', quantity: '2 lb bunch', itemPrice: 1.98, shopperTags: ['budget', 'fresh', 'essential'] },
  { id: 'honeycrisp-apples', productKey: 'honeycrisp-apples', name: 'Honeycrisp Apples', category: 'Produce', productType: 'Fruit', quality: 'Mid-Grade', store: 'Target', quantity: '2 lb bag', itemPrice: 4.99, shopperTags: ['fresh'] },
  { id: 'navel-oranges', productKey: 'navel-oranges', name: 'Navel Oranges', category: 'Produce', productType: 'Fruit', quality: 'Store Brand', store: 'Kroger', quantity: '3 lb bag', itemPrice: 4.49, shopperTags: ['fresh', 'essential'] },
  { id: 'strawberries-walmart', productKey: 'strawberries', name: 'Strawberries', category: 'Produce', productType: 'Fruit', quality: 'Mid-Grade', store: 'Wal-Mart', quantity: '1 lb clamshell', itemPrice: 3.24, shopperTags: ['fresh'] },
  { id: 'red-grapes', productKey: 'red-grapes', name: 'Red Grapes', category: 'Produce', productType: 'Fruit', quality: 'Mid-Grade', store: 'Target', quantity: '2 lb bag', itemPrice: 5.49, shopperTags: ['fresh'] },
  { id: 'baby-spinach', productKey: 'baby-spinach', name: 'Baby Spinach', category: 'Produce', productType: 'Vegetables', quality: 'Store Brand', store: 'Kroger', quantity: '5 oz box', itemPrice: 2.99, shopperTags: ['fresh'] },
  { id: 'iceberg-lettuce', productKey: 'iceberg-lettuce', name: 'Iceberg Lettuce', category: 'Produce', productType: 'Vegetables', quality: 'Cheapest', store: 'Wal-Mart', quantity: '1 head', itemPrice: 1.94, shopperTags: ['budget', 'fresh'] },
  { id: 'romaine-hearts', productKey: 'romaine-hearts', name: 'Romaine Hearts', category: 'Produce', productType: 'Vegetables', quality: 'Mid-Grade', store: 'Target', quantity: '3 count pack', itemPrice: 3.79, shopperTags: ['fresh'] },
  { id: 'roma-tomatoes', productKey: 'roma-tomatoes', name: 'Roma Tomatoes', category: 'Produce', productType: 'Vegetables', quality: 'Cheapest', store: 'Kroger', quantity: '1 lb bag', itemPrice: 2.49, shopperTags: ['budget', 'fresh'] },
  { id: 'avocados', productKey: 'avocados', name: 'Avocados', category: 'Produce', productType: 'Vegetables', quality: 'Mid-Grade', store: 'Target', quantity: '4 count bag', itemPrice: 4.99, shopperTags: ['fresh'] },
  { id: 'organic-strawberries-kroger', productKey: 'organic-strawberries', name: 'Organic Strawberries', category: 'Premium / Specialty', productType: 'Fruit', quality: 'Premium/Organic', store: 'Kroger', quantity: '1 lb clamshell', itemPrice: 5.99, shopperTags: ['premium', 'organic', 'fresh'] },
  { id: 'organic-romaine-target', productKey: 'organic-romaine-hearts', name: 'Organic Romaine Hearts', category: 'Premium / Specialty', productType: 'Vegetables', quality: 'Premium/Organic', store: 'Target', quantity: '3 count pack', itemPrice: 4.89, shopperTags: ['premium', 'organic', 'fresh'] },
  { id: 'organic-grapes-walmart', productKey: 'organic-grapes', name: 'Organic Grapes', category: 'Premium / Specialty', productType: 'Fruit', quality: 'Premium/Organic', store: 'Wal-Mart', quantity: '2 lb bag', itemPrice: 6.99, shopperTags: ['premium', 'organic', 'fresh'] },

  { id: 'ground-beef-walmart', productKey: 'ground-beef-8020', name: 'Ground Beef 80/20', category: 'Protein', productType: 'Meat', quality: 'Cheapest', store: 'Wal-Mart', quantity: '1 lb tray', itemPrice: 6.44, shopperTags: ['budget', 'essential'] },
  { id: 'ground-beef-kroger', productKey: 'ground-beef-8020', name: 'Ground Beef 80/20', category: 'Protein', productType: 'Meat', quality: 'Store Brand', store: 'Kroger', quantity: '1 lb tray', itemPrice: 7.29, shopperTags: ['essential'] },
  { id: 'chicken-breast-target', productKey: 'chicken-breasts', name: 'Chicken Breasts', category: 'Protein', productType: 'Meat', quality: 'Mid-Grade', store: 'Target', quantity: '1.5 lb pack', itemPrice: 9.99, shopperTags: ['fresh', 'essential'] },
  { id: 'chicken-breast-kroger', productKey: 'chicken-breasts', name: 'Chicken Breasts', category: 'Protein', productType: 'Meat', quality: 'Mid-Grade', store: 'Kroger', quantity: '1.5 lb pack', itemPrice: 8.99, shopperTags: ['fresh', 'essential'] },
  { id: 'classic-hot-dogs', productKey: 'classic-hot-dogs', name: 'Classic Hot Dogs', category: 'Protein', productType: 'Meat', quality: 'Cheapest', store: 'Wal-Mart', quantity: '8 count pack', itemPrice: 1.42, shopperTags: ['budget', 'convenience'] },
  { id: 'turkey-deli-kroger', productKey: 'turkey-breast-deli-meat', name: 'Turkey Breast Deli Meat', category: 'Protein', productType: 'Meat', quality: 'Store Brand', store: 'Kroger', quantity: '9 oz pack', itemPrice: 4.49, shopperTags: ['convenience', 'essential'] },
  { id: 'black-forest-ham', productKey: 'black-forest-ham', name: 'Black Forest Ham', category: 'Protein', productType: 'Meat', quality: 'Mid-Grade', store: 'Target', quantity: '8 oz pack', itemPrice: 5.29, shopperTags: ['brand', 'convenience'] },
  { id: 'sliced-lunch-meat', productKey: 'sliced-lunch-meat', name: 'Sliced Lunch Meat', category: 'Protein', productType: 'Meat', quality: 'Store Brand', store: 'Wal-Mart', quantity: '9 oz tub', itemPrice: 4.18, shopperTags: ['convenience'] },
  { id: 'rotisserie-chicken', productKey: 'rotisserie-chicken', name: 'Rotisserie Chicken', category: 'Protein', productType: 'Meat', quality: 'Mid-Grade', store: 'Target', quantity: '1 whole chicken', itemPrice: 7.99, shopperTags: ['convenience', 'fresh'] },
  { id: 'organic-chicken-breasts', productKey: 'organic-chicken-breasts', name: 'Organic Chicken Breasts', category: 'Premium / Specialty', productType: 'Meat', quality: 'Premium/Organic', store: 'Kroger', quantity: '1.5 lb pack', itemPrice: 12.14, shopperTags: ['premium', 'organic', 'fresh'] },
  { id: 'nitrate-free-turkey', productKey: 'nitrate-free-turkey', name: 'Nitrate-Free Turkey', category: 'Premium / Specialty', productType: 'Meat', quality: 'Allergy-Free Option', store: 'Target', quantity: '7 oz pack', itemPrice: 6.99, shopperTags: ['allergy-friendly', 'premium'] },

  { id: 'adobo-seasoning', productKey: 'adobo-seasoning', name: 'Adobo Seasoning', category: 'Pantry', productType: 'Seasonings', quality: 'Cheapest', store: 'Wal-Mart', quantity: '8 oz bottle', itemPrice: 2.18, shopperTags: ['budget'] },
  { id: 'italian-seasoning', productKey: 'italian-seasoning', name: 'Italian Seasoning', category: 'Pantry', productType: 'Seasonings', quality: 'Store Brand', store: 'Kroger', quantity: '0.75 oz bottle', itemPrice: 1.79, shopperTags: ['budget'] },
  { id: 'onion-powder', productKey: 'onion-powder', name: 'Onion Powder', category: 'Pantry', productType: 'Seasonings', quality: 'Mid-Grade', store: 'Target', quantity: '2.4 oz bottle', itemPrice: 2.39, shopperTags: [] },
  { id: 'garlic-herb-seasoning', productKey: 'garlic-herb-seasoning', name: 'Garlic Herb Seasoning', category: 'Pantry', productType: 'Seasonings', quality: 'Mid-Grade', store: 'Kroger', quantity: '3 oz bottle', itemPrice: 3.29, shopperTags: ['brand'] },
  { id: 'lemon-pepper', productKey: 'lemon-pepper', name: 'Lemon Pepper', category: 'Pantry', productType: 'Seasonings', quality: 'Mid-Grade', store: 'Target', quantity: '3.5 oz bottle', itemPrice: 3.49, shopperTags: [] },
  { id: 'seasoning-blend', productKey: 'seasoning-blend', name: 'Seasoning Blend', category: 'Pantry', productType: 'Seasonings', quality: 'Store Brand', store: 'Wal-Mart', quantity: '6 oz bottle', itemPrice: 2.12, shopperTags: ['budget'] },

  { id: 'ketchup-kroger', productKey: 'ketchup', name: 'Ketchup', category: 'Pantry', productType: 'Sauces', quality: 'Store Brand', store: 'Kroger', quantity: '32 oz bottle', itemPrice: 2.29, shopperTags: ['budget', 'essential'] },
  { id: 'yellow-mustard', productKey: 'yellow-mustard', name: 'Yellow Mustard', category: 'Pantry', productType: 'Sauces', quality: 'Cheapest', store: 'Wal-Mart', quantity: '20 oz bottle', itemPrice: 1.44, shopperTags: ['budget'] },
  { id: 'mayonnaise', productKey: 'mayonnaise', name: 'Mayonnaise', category: 'Pantry', productType: 'Sauces', quality: 'Mid-Grade', store: 'Target', quantity: '30 oz jar', itemPrice: 4.19, shopperTags: ['brand'] },
  { id: 'organic-ketchup-target', productKey: 'organic-ketchup', name: 'Organic Ketchup', category: 'Premium / Specialty', productType: 'Sauces', quality: 'Premium/Organic', store: 'Target', quantity: '20 oz bottle', itemPrice: 8.29, shopperTags: ['premium', 'organic'] },
  { id: 'avocado-oil-mayo-kroger', productKey: 'avocado-oil-mayo', name: 'Avocado Oil Mayo', category: 'Premium / Specialty', productType: 'Sauces', quality: 'Premium/Organic', store: 'Kroger', quantity: '12 oz jar', itemPrice: 9.49, shopperTags: ['premium', 'organic'] },

  { id: 'chicken-noodle-soup', productKey: 'chicken-noodle-soup', name: 'Chicken Noodle Soup', category: 'Pantry', productType: 'Soups', quality: 'Cheapest', store: 'Wal-Mart', quantity: '18.6 oz can', itemPrice: 1.48, shopperTags: ['budget', 'convenience'] },
  { id: 'potato-soup', productKey: 'potato-soup', name: 'Potato Soup', category: 'Pantry', productType: 'Soups', quality: 'Mid-Grade', store: 'Target', quantity: '18.8 oz can', itemPrice: 2.49, shopperTags: ['convenience'] },
  { id: 'broccoli-cheddar-soup', productKey: 'broccoli-cheddar-soup', name: 'Broccoli Cheddar Soup', category: 'Pantry', productType: 'Soups', quality: 'Mid-Grade', store: 'Kroger', quantity: '18.8 oz can', itemPrice: 2.69, shopperTags: ['convenience', 'brand'] },

  { id: 'fruit-cereal', productKey: 'fruit-cereal', name: 'Fruit Cereal', category: 'Pantry', productType: 'Cereals', quality: 'Mid-Grade', store: 'Target', quantity: '12 oz box', itemPrice: 4.29, shopperTags: ['brand'] },
  { id: 'cinnamon-cereal', productKey: 'cinnamon-cereal', name: 'Cinnamon Cereal', category: 'Pantry', productType: 'Cereals', quality: 'Mid-Grade', store: 'Kroger', quantity: '12 oz box', itemPrice: 4.49, shopperTags: ['brand'] },
  { id: 'honey-nut-cereal', productKey: 'honey-nut-cereal', name: 'Honey Nut Cereal', category: 'Pantry', productType: 'Cereals', quality: 'Mid-Grade', store: 'Wal-Mart', quantity: '18 oz box', itemPrice: 4.98, shopperTags: ['brand'] },
  { id: 'shredded-wheat', productKey: 'shredded-wheat', name: 'Shredded Wheat', category: 'Pantry', productType: 'Cereals', quality: 'Store Brand', store: 'Kroger', quantity: '16.4 oz box', itemPrice: 3.49, shopperTags: ['budget', 'essential'] },
  { id: 'frosted-flakes', productKey: 'frosted-flakes', name: 'Frosted Flakes', category: 'Pantry', productType: 'Cereals', quality: 'Mid-Grade', store: 'Target', quantity: '13.5 oz box', itemPrice: 5.19, shopperTags: ['brand'] },
  { id: 'honey-granola', productKey: 'honey-granola', name: 'Honey Granola', category: 'Pantry', productType: 'Cereals', quality: 'Mid-Grade', store: 'Kroger', quantity: '11 oz bag', itemPrice: 4.79, shopperTags: ['brand'] },

  { id: 'peanut-butter-walmart', productKey: 'peanut-butter', name: 'Peanut Butter', category: 'Pantry', productType: 'Spreads', quality: 'Store Brand', store: 'Wal-Mart', quantity: '16 oz jar', itemPrice: 2.18, shopperTags: ['budget', 'essential'] },
  { id: 'grape-jelly', productKey: 'grape-jelly', name: 'Grape Jelly', category: 'Pantry', productType: 'Spreads', quality: 'Store Brand', store: 'Kroger', quantity: '30 oz jar', itemPrice: 1.99, shopperTags: ['budget'] },
  { id: 'strawberry-jam', productKey: 'strawberry-jam', name: 'Strawberry Jam', category: 'Pantry', productType: 'Spreads', quality: 'Mid-Grade', store: 'Target', quantity: '18 oz jar', itemPrice: 3.49, shopperTags: ['brand'] },
  { id: 'almond-butter-kroger', productKey: 'almond-butter', name: 'Almond Butter', category: 'Premium / Specialty', productType: 'Spreads', quality: 'Premium/Organic', store: 'Kroger', quantity: '12 oz jar', itemPrice: 7.99, shopperTags: ['premium', 'organic'] },
  { id: 'sunflower-seed-spread', productKey: 'sunflower-seed-spread', name: 'Sunflower Seed Spread', category: 'Premium / Specialty', productType: 'Spreads', quality: 'Allergy-Free Option', store: 'Target', quantity: '16 oz jar', itemPrice: 6.79, shopperTags: ['allergy-friendly', 'premium'] },

  { id: 'round-crackers-walmart', productKey: 'round-crackers', name: 'Round Crackers', category: 'Snacks', productType: 'Crackers', quality: 'Cheapest', store: 'Wal-Mart', quantity: '13.7 oz box', itemPrice: 2.24, shopperTags: ['budget', 'snack'] },
  { id: 'saltine-crackers-kroger', productKey: 'saltine-crackers', name: 'Saltine Crackers', category: 'Snacks', productType: 'Crackers', quality: 'Store Brand', store: 'Kroger', quantity: '16 oz box', itemPrice: 2.39, shopperTags: ['budget', 'snack'] },
  { id: 'tortilla-chips', productKey: 'tortilla-chips', name: 'Tortilla Chips', category: 'Snacks', productType: 'Chips', quality: 'Mid-Grade', store: 'Target', quantity: '13 oz bag', itemPrice: 3.49, shopperTags: ['snack'] },
  { id: 'potato-chips-kroger', productKey: 'potato-chips', name: 'Potato Chips', category: 'Snacks', productType: 'Chips', quality: 'Mid-Grade', store: 'Kroger', quantity: '8 oz bag', itemPrice: 3.99, shopperTags: ['snack', 'brand'] },
  { id: 'granola-bars-walmart', productKey: 'granola-bars', name: 'Granola Bars', category: 'Snacks', productType: 'Snacks', quality: 'Store Brand', store: 'Wal-Mart', quantity: '10 count box', itemPrice: 4.42, shopperTags: ['snack', 'convenience'] },
  { id: 'chocolate-sandwich-cookies', productKey: 'chocolate-sandwich-cookies', name: 'Chocolate Sandwich Cookies', category: 'Snacks', productType: 'Snacks', quality: 'Mid-Grade', store: 'Target', quantity: 'Family size pack', itemPrice: 4.97, shopperTags: ['snack', 'brand'] },
  { id: 'protein-snack-pack', productKey: 'protein-snack-pack', name: 'Protein Snack Pack', category: 'Snacks', productType: 'Snacks', quality: 'Mid-Grade', store: 'Kroger', quantity: '4 count box', itemPrice: 5.79, shopperTags: ['snack', 'convenience'] },
  { id: 'organic-snack-bars', productKey: 'organic-snack-bars', name: 'Organic Snack Bars', category: 'Premium / Specialty', productType: 'Snacks', quality: 'Premium/Organic', store: 'Target', quantity: '6 count box', itemPrice: 8.99, shopperTags: ['premium', 'organic', 'snack'] },
  { id: 'gluten-free-crackers-walmart', productKey: 'gluten-free-crackers', name: 'Gluten-Free Crackers', category: 'Premium / Specialty', productType: 'Crackers', quality: 'Allergy-Free Option', store: 'Wal-Mart', quantity: '4.25 oz box', itemPrice: 5.49, shopperTags: ['allergy-friendly', 'premium', 'snack'] },

  { id: 'white-bread-walmart', productKey: 'white-bread', name: 'White Bread', category: 'Bread & Grains', productType: 'Breads', quality: 'Cheapest', store: 'Wal-Mart', quantity: '20 oz loaf', itemPrice: 1.48, shopperTags: ['budget', 'essential'] },
  { id: 'sandwich-bread-kroger', productKey: 'sandwich-bread', name: 'Sandwich Bread', category: 'Bread & Grains', productType: 'Breads', quality: 'Store Brand', store: 'Kroger', quantity: '24 oz loaf', itemPrice: 1.99, shopperTags: ['budget', 'essential'] },
  { id: 'burger-buns-target', productKey: 'burger-buns', name: 'Burger Buns', category: 'Bread & Grains', productType: 'Breads', quality: 'Mid-Grade', store: 'Target', quantity: '8 count bag', itemPrice: 2.69, shopperTags: ['essential'] },
  { id: 'white-rice-target', productKey: 'white-rice', name: 'White Rice', category: 'Bread & Grains', productType: 'Rice', quality: 'Cheapest', store: 'Target', quantity: '2 lb bag', itemPrice: 1.89, shopperTags: ['budget', 'essential'] },
  { id: 'jasmine-rice-kroger', productKey: 'jasmine-rice', name: 'Jasmine Rice', category: 'Bread & Grains', productType: 'Rice', quality: 'Mid-Grade', store: 'Kroger', quantity: '2 lb bag', itemPrice: 4.29, shopperTags: ['essential'] },
  { id: 'instant-rice-walmart', productKey: 'instant-rice', name: 'Instant Rice', category: 'Bread & Grains', productType: 'Rice', quality: 'Store Brand', store: 'Wal-Mart', quantity: '14 oz box', itemPrice: 1.77, shopperTags: ['budget', 'convenience'] },
  { id: 'whole-grain-bread-kroger', productKey: '21-whole-grains-bread', name: '21 Whole Grains Bread', category: 'Premium / Specialty', productType: 'Breads', quality: 'Premium/Organic', store: 'Kroger', quantity: '27 oz loaf', itemPrice: 6.99, shopperTags: ['premium', 'organic'] },

  { id: 'whole-milk-walmart', productKey: 'whole-milk', name: 'Whole Milk', category: 'Dairy & Eggs', productType: 'Dairy', quality: 'Cheapest', store: 'Wal-Mart', quantity: '1 gallon', itemPrice: 3.64, shopperTags: ['budget', 'essential'] },
  { id: 'whole-milk-kroger', productKey: 'whole-milk', name: 'Whole Milk', category: 'Dairy & Eggs', productType: 'Dairy', quality: 'Store Brand', store: 'Kroger', quantity: '1 gallon', itemPrice: 2.89, shopperTags: ['budget', 'essential'] },
  { id: 'cheese-slices-target', productKey: 'cheese-slices', name: 'Cheese Slices', category: 'Dairy & Eggs', productType: 'Dairy', quality: 'Store Brand', store: 'Target', quantity: '12 count pack', itemPrice: 1.69, shopperTags: ['budget', 'essential'] },
  { id: 'shredded-cheese-kroger', productKey: 'shredded-cheese', name: 'Shredded Cheese', category: 'Dairy & Eggs', productType: 'Dairy', quality: 'Mid-Grade', store: 'Kroger', quantity: '8 oz bag', itemPrice: 3.69, shopperTags: ['essential'] },
  { id: 'eggs-walmart', productKey: 'large-eggs', name: 'Large Eggs', category: 'Dairy & Eggs', productType: 'Eggs', quality: 'Cheapest', store: 'Wal-Mart', quantity: '12 count carton', itemPrice: 1.97, shopperTags: ['budget', 'essential'] },
  { id: 'eggs-kroger', productKey: 'large-eggs', name: 'Large Eggs', category: 'Dairy & Eggs', productType: 'Eggs', quality: 'Store Brand', store: 'Kroger', quantity: '12 count carton', itemPrice: 2.09, shopperTags: ['budget', 'essential'] },
  { id: 'lactose-free-milk-target', productKey: 'lactose-free-milk', name: 'Lactose-Free Milk', category: 'Premium / Specialty', productType: 'Dairy', quality: 'Allergy-Free Option', store: 'Target', quantity: '1 half gallon', itemPrice: 4.99, shopperTags: ['allergy-friendly', 'premium'] },
  { id: 'dairy-free-cheese-kroger', productKey: 'dairy-free-cheese-shreds', name: 'Dairy-Free Cheese Shreds', category: 'Premium / Specialty', productType: 'Dairy', quality: 'Allergy-Free Option', store: 'Kroger', quantity: '7 oz bag', itemPrice: 5.49, shopperTags: ['allergy-friendly', 'premium'] },
  { id: 'organic-milk-target', productKey: 'organic-whole-milk', name: 'Organic Whole Milk', category: 'Premium / Specialty', productType: 'Dairy', quality: 'Premium/Organic', store: 'Target', quantity: '1 gallon', itemPrice: 6.99, shopperTags: ['premium', 'organic'] },
  { id: 'pasture-eggs-target', productKey: 'pasture-raised-eggs', name: 'Pasture-Raised Eggs', category: 'Premium / Specialty', productType: 'Eggs', quality: 'Premium/Organic', store: 'Target', quantity: '12 count carton', itemPrice: 7.69, shopperTags: ['premium', 'organic'] },

  { id: 'ground-coffee-kroger', productKey: 'ground-coffee', name: 'Ground Coffee', category: 'Drinks / Coffee', productType: 'Coffee', quality: 'Mid-Grade', store: 'Kroger', quantity: '12 oz bag', itemPrice: 7.49, shopperTags: ['brand'] },
  { id: 'ground-coffee-walmart', productKey: 'ground-coffee', name: 'Ground Coffee', category: 'Drinks / Coffee', productType: 'Coffee', quality: 'Store Brand', store: 'Wal-Mart', quantity: '12 oz can', itemPrice: 5.94, shopperTags: ['budget'] },
  { id: 'orange-juice-target', productKey: 'orange-juice', name: 'Orange Juice', category: 'Drinks / Coffee', productType: 'Drinks', quality: 'Mid-Grade', store: 'Target', quantity: '52 oz bottle', itemPrice: 4.59, shopperTags: ['brand'] },
  { id: 'sports-drink-walmart', productKey: 'sports-drink-pack', name: 'Sports Drink Pack', category: 'Drinks / Coffee', productType: 'Drinks', quality: 'Mid-Grade', store: 'Wal-Mart', quantity: '8 bottle pack', itemPrice: 6.49, shopperTags: ['convenience', 'brand'] },
  { id: 'sparkling-water-target', productKey: 'sparkling-water', name: 'Sparkling Water', category: 'Drinks / Coffee', productType: 'Drinks', quality: 'Mid-Grade', store: 'Target', quantity: '8 can pack', itemPrice: 5.29, shopperTags: ['brand'] },
  { id: 'coffee-creamer-kroger', productKey: 'coffee-creamer', name: 'Coffee Creamer', category: 'Drinks / Coffee', productType: 'Dairy', quality: 'Mid-Grade', store: 'Kroger', quantity: '32 oz bottle', itemPrice: 4.99, shopperTags: ['brand'] },
  { id: 'organic-coffee-target', productKey: 'organic-ground-coffee', name: 'Organic Ground Coffee', category: 'Premium / Specialty', productType: 'Coffee', quality: 'Premium/Organic', store: 'Target', quantity: '10 oz bag', itemPrice: 10.99, shopperTags: ['premium', 'organic'] },
  { id: 'almond-milk-walmart', productKey: 'almond-milk', name: 'Almond Milk', category: 'Premium / Specialty', productType: 'Drinks', quality: 'Allergy-Free Option', store: 'Wal-Mart', quantity: 'Half gallon carton', itemPrice: 3.99, shopperTags: ['allergy-friendly'] },
];

export const GROCERY_GAME_ITEMS: GroceryItem[] = buildCatalog(RAW_GROCERY_ITEMS);

export const LEGACY_FOOD_PACKAGE_STARTERS: Record<string, Array<{ id: string; quantity: number }>> = {
  'food-bare-minimum': [
    { id: 'white-bread', quantity: 1 },
    { id: 'large-eggs', quantity: 1 },
    { id: 'white-rice', quantity: 1 },
    { id: 'peanut-butter', quantity: 1 },
    { id: 'whole-milk', quantity: 1 },
    { id: 'ketchup', quantity: 1 },
    { id: 'classic-hot-dogs', quantity: 1 },
  ],
  'food-smart-shopper': [
    { id: 'whole-milk', quantity: 1 },
    { id: 'large-eggs', quantity: 1 },
    { id: 'sandwich-bread', quantity: 1 },
    { id: 'peanut-butter', quantity: 1 },
    { id: 'ground-beef-8020', quantity: 1 },
    { id: 'turkey-breast-deli-meat', quantity: 1 },
    { id: 'honeycrisp-apples', quantity: 1 },
    { id: 'granola-bars', quantity: 1 },
  ],
  'food-everyday-comfortable': [
    { id: 'chicken-breasts', quantity: 1 },
    { id: 'ground-beef-8020', quantity: 1 },
    { id: 'navel-oranges', quantity: 1 },
    { id: 'potato-chips', quantity: 1 },
    { id: 'orange-juice', quantity: 1 },
    { id: 'honey-nut-cereal', quantity: 1 },
    { id: 'shredded-cheese', quantity: 1 },
    { id: 'mayonnaise', quantity: 1 },
  ],
  'food-premium-organic': [
    { id: 'organic-whole-milk', quantity: 1 },
    { id: 'pasture-raised-eggs', quantity: 1 },
    { id: 'organic-romaine-hearts', quantity: 1 },
    { id: 'organic-strawberries', quantity: 1 },
    { id: 'organic-chicken-breasts', quantity: 1 },
    { id: 'organic-snack-bars', quantity: 1 },
    { id: 'organic-ketchup', quantity: 1 },
    { id: 'organic-ground-coffee', quantity: 1 },
  ],
};
