import { useEffect, useMemo, useState } from 'react';
import { Check, Minus, Plus, ShoppingCart, Sparkles, X } from 'lucide-react';
import { GROCERY_BROWSE_CATEGORIES, GroceryItem } from '../data/groceryItems';
import {
  getGroceryShopperBadge,
  getSelectedGroceryItems,
  getTotalGroceryItemCount,
  getTotalMonthlyGroceryCost,
  getTotalWeeklyGroceryCost,
} from '../lib/groceryBudget';
import { GroceryCartState } from '../types';

type GrocerySelectionStepProps = {
  groceryItems: GroceryItem[];
  groceryCart: GroceryCartState;
  onCartChange: (cart: GroceryCartState) => void;
  multiplier?: number;
};

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function QuantityControls({
  quantity,
  onDecrement,
  onIncrement,
  tone = 'default',
  label = 'Quantity',
}: {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  tone?: 'default' | 'selected';
  label?: string;
}) {
  const isSelected = tone === 'selected';

  return (
    <div
      className={`flex items-center justify-between rounded-2xl border px-3 py-3 ${
        isSelected ? 'border-emerald-100 bg-emerald-50' : 'border-slate-100 bg-slate-50'
      }`}
    >
      <p className={`text-xs font-black uppercase tracking-widest ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>
        {label}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDecrement}
          className={`flex h-10 w-10 items-center justify-center rounded-full border bg-white transition-all ${
            isSelected
              ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              : 'border-slate-200 text-slate-600 hover:border-[#10B981] hover:bg-emerald-50 hover:text-emerald-700'
          }`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className={`min-w-[44px] text-center text-lg font-black ${isSelected ? 'text-[#10B981]' : 'text-slate-900'}`}>
          {quantity}
        </div>
        <button
          type="button"
          onClick={onIncrement}
          className={`flex h-10 w-10 items-center justify-center rounded-full border bg-white transition-all ${
            isSelected
              ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              : 'border-slate-200 text-slate-600 hover:border-[#10B981] hover:bg-emerald-50 hover:text-emerald-700'
          }`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function GrocerySelectionStep({
  groceryItems,
  groceryCart,
  onCartChange,
  multiplier = 1,
}: GrocerySelectionStepProps) {
  const [activeCategory, setActiveCategory] = useState<(typeof GROCERY_BROWSE_CATEGORIES)[number]>('Produce');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastChangedItemId, setLastChangedItemId] = useState<string | null>(null);

  const activeItems = useMemo(
    () =>
      groceryItems
        .filter((item) => item.category === activeCategory && item.isActive !== false)
        .sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER)),
    [activeCategory, groceryItems]
  );

  const selectedItems = useMemo(() => getSelectedGroceryItems(groceryCart), [groceryCart]);
  const totalItemCount = useMemo(() => getTotalGroceryItemCount(groceryCart), [groceryCart]);
  const totalWeeklyCost = useMemo(() => getTotalWeeklyGroceryCost(groceryCart) * multiplier, [groceryCart, multiplier]);
  const totalMonthlyCost = useMemo(() => getTotalMonthlyGroceryCost(groceryCart) * multiplier, [groceryCart, multiplier]);
  const shopperBadge = useMemo(() => getGroceryShopperBadge(groceryCart), [groceryCart]);

  useEffect(() => {
    if (!lastChangedItemId) return;

    const timeoutId = window.setTimeout(() => {
      setLastChangedItemId(null);
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [lastChangedItemId]);

  const updateItemQuantity = (item: GroceryItem, delta: number) => {
    const existing = groceryCart[item.id];
    const nextQuantity = Math.max(0, (existing?.quantity || 0) + delta);
    setLastChangedItemId(item.id);

    if (nextQuantity === 0) {
      if (!existing) return;
      const { [item.id]: _removed, ...rest } = groceryCart;
      onCartChange(rest);
      return;
    }

    onCartChange({
      ...groceryCart,
      [item.id]: {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.itemPrice,
        quantity: nextQuantity,
        description: item.description,
        image: item.imageUrl,
        productType: item.productType,
        quality: item.quality,
        quantityLabel: item.quantity,
        shopperTags: item.shopperTags,
        isBudget: item.isBudget,
        isPremium: item.isPremium,
        isAllergyFriendly: item.isAllergyFriendly,
      },
    });
  };

  const updateCartItemQuantity = (itemId: string, delta: number) => {
    const sourceItem = groceryItems.find((candidate) => candidate.id === itemId);
    if (!sourceItem) return;
    updateItemQuantity(sourceItem, delta);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#3372B2] shadow-sm">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div className="space-y-3">
            <div>
              <h3 className="text-2xl font-black text-slate-900">Food & Groceries</h3>
              <p className="mt-1 text-sm font-bold text-[#3372B2]">
                Add grocery items you would actually buy, then review your cart to see what your food budget looks like.
              </p>
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-600">
              Browse like a grocery run. Add items, tweak quantities, open your cart, and learn what kind of shopper your choices make you.
            </p>
            {totalItemCount > 0 && (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                <Sparkles className="h-4 w-4" />
                {shopperBadge.label}
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Browse Groceries</p>
              <h4 className="text-xl font-black text-slate-900">Build a realistic weekly cart</h4>
            </div>
            <div className="-mx-1 overflow-x-auto pb-1 lg:overflow-visible">
              <div className="flex min-w-max gap-3 px-1 lg:min-w-0 lg:flex-wrap">
                {GROCERY_BROWSE_CATEGORIES.map((tab) => {
                  const isActive = tab === activeCategory;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveCategory(tab)}
                      className={`rounded-full border px-4 py-2 text-sm font-black transition-all ${
                        isActive
                          ? 'border-[#10B981] bg-emerald-50 text-emerald-700 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-[#D6E4F0] hover:bg-[#F3F7FB]'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition-all hover:border-[#D6E4F0] hover:bg-[#F3F7FB] sm:w-auto"
            aria-label="Open grocery cart"
          >
            <ShoppingCart className="h-5 w-5" />
            Cart
            {totalItemCount > 0 && (
              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs font-black text-white">
                {totalItemCount}
              </span>
            )}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {activeItems.map((item) => {
            const quantity = groceryCart[item.id]?.quantity || 0;
            const isInCart = quantity > 0;
            const displayPrice = item.itemPrice * multiplier;

            return (
              <div
                key={item.id}
                className={`relative flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border-2 bg-white p-4 text-left transition-all ${
                  isInCart
                    ? 'border-[#10B981] bg-emerald-50/20 ring-2 ring-emerald-50 shadow-[0_4px_16px_rgba(16,185,129,0.12)]'
                    : 'border-slate-100 hover:border-[#D6E4F0] hover:bg-[#F3F7FB] hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]'
                } ${lastChangedItemId === item.id ? 'scale-[1.01]' : ''}`}
              >
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wide text-slate-500 shadow-sm">
                      {item.category}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${
                      item.isPremium
                        ? 'bg-orange-100 text-orange-700'
                        : item.isBudget
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-[#3372B2]'
                    }`}>
                      {item.quality}
                    </span>
                  </div>
                  <div className="mt-4 space-y-1">
                    <h5 className="text-lg font-black text-slate-900">{item.name}</h5>
                    <p className="text-sm font-medium leading-relaxed text-slate-500">{item.description}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      {[item.productType, item.quantity].filter(Boolean).join(' - ')}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-1 flex-col justify-between gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Average price</p>
                      <p className="mt-1 text-3xl font-black text-[#3372B2]">${formatCurrency(displayPrice)}</p>
                    </div>
                    {isInCart && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white shadow-md">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>

                  <div className="mt-auto min-w-0">
                    {quantity === 0 ? (
                      <button
                        type="button"
                        onClick={() => updateItemQuantity(item, 1)}
                        className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black uppercase tracking-widest text-slate-600 transition-all hover:border-[#10B981] hover:bg-emerald-50 hover:text-emerald-700"
                        aria-label={`Add ${item.name} to cart`}
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <QuantityControls
                        quantity={quantity}
                        onDecrement={() => updateItemQuantity(item, -1)}
                        onIncrement={() => updateItemQuantity(item, 1)}
                        tone="selected"
                        label="In Cart"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activeItems.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm font-medium text-slate-400">
            No grocery items are available in this category yet.
          </div>
        )}
      </section>

      {isCartOpen && (
        <div className="fixed inset-0 z-[260] bg-slate-900/55 backdrop-blur-sm">
          <div className="absolute inset-0 overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto max-w-5xl">
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Cart Review</p>
                    <h4 className="mt-1 text-2xl font-black text-slate-900">Checkout Your Groceries</h4>
                    <p className="mt-2 text-sm font-medium text-slate-500">
                      Review your cart, adjust quantities, and see how your weekly grocery run turns into a monthly budget.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="rounded-full border border-slate-200 p-2 text-slate-500 transition-all hover:bg-slate-100"
                    aria-label="Close grocery cart"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <section className="space-y-4">
                    {selectedItems.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-slate-200 px-6 py-12 text-center">
                        <ShoppingCart className="mx-auto h-10 w-10 text-slate-300" />
                        <p className="mt-4 text-lg font-black text-slate-700">Your cart is empty</p>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                          Add a few groceries, then come back here to review your food budget.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsCartOpen(false)}
                          className="mt-5 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white transition-all hover:bg-orange-600"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    ) : (
                      selectedItems.map((item) => (
                        <div key={item.id} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-lg font-black text-slate-900">{item.name}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600">
                                    {item.category}
                                  </span>
                                  {item.quality && (
                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#3372B2]">
                                      {item.quality}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="shrink-0 text-lg font-black text-[#3372B2]">${formatCurrency(item.price * multiplier)}</p>
                            </div>
                            {item.description && (
                              <p className="text-sm font-medium leading-relaxed text-slate-500">{item.description}</p>
                            )}
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                              {[item.productType, item.quantityLabel].filter(Boolean).join(' - ')}
                            </p>
                            <QuantityControls
                              quantity={item.quantity}
                              onDecrement={() => updateCartItemQuantity(item.id, -1)}
                              onIncrement={() => updateCartItemQuantity(item.id, 1)}
                              label="In Cart"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </section>

                  <aside className="space-y-4">
                    <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-widest text-blue-600">Budget Snapshot</p>
                      <h5 className="mt-2 text-xl font-black text-slate-900">Grocery Totals</h5>

                      <div className="mt-4 space-y-3">
                        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                          <p className="text-sm font-medium text-slate-500">Total items selected</p>
                          <p className="mt-1 text-3xl font-black text-slate-900">{totalItemCount}</p>
                        </div>

                        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                          <p className="text-sm font-medium text-slate-500">Estimated weekly grocery cost</p>
                          <p className="mt-1 text-3xl font-black text-[#3372B2]">${formatCurrency(totalWeeklyCost)}</p>
                        </div>

                        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                          <p className="text-sm font-medium text-slate-500">Estimated monthly grocery cost</p>
                          <p className="mt-1 text-3xl font-black text-slate-900">
                            ${formatCurrency(totalMonthlyCost)}
                            <span className="ml-1 text-sm font-bold uppercase tracking-widest text-slate-400">/mo</span>
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-medium leading-relaxed text-slate-600 shadow-sm">
                        Your monthly grocery budget is based on your full weekly cart, so small add-ons can change the total faster than you expect.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-orange-100 bg-orange-50 p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-widest text-orange-600">Shopper Badge</p>
                      <p className="mt-2 text-2xl font-black text-slate-900">{shopperBadge.label}</p>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{shopperBadge.description}</p>
                    </div>

                    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Next Move</p>
                      <div className="mt-3 flex flex-col gap-3">
                        <button
                          type="button"
                          onClick={() => setIsCartOpen(false)}
                          className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white transition-all hover:bg-orange-600"
                        >
                          Continue Shopping
                        </button>
                        <p className="text-sm font-medium text-slate-500">
                          Your grocery budget is already feeding the calculator total while you shop.
                        </p>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
