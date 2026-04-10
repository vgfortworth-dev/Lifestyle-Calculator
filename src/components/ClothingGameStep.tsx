import { useEffect, useMemo, useState } from 'react';
import { Check, Minus, Plus, Shirt, ShoppingCart, Sparkles, X } from 'lucide-react';
import { ClothingClosetState } from '../types';
import { ClothingGameItem } from '../data/clothingItems';
import {
  getSelectedClosetItems,
  getTotalClosetValue,
  getTotalMonthlyClothingCost,
  getTotalSelectedItemCount,
} from '../lib/clothingBudget';

type ClothingGameCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'professional'
  | 'shoes'
  | 'accessories';

type ClothingGameStepProps = {
  clothingItems: ClothingGameItem[];
  clothingCloset: ClothingClosetState;
  onClosetChange: (closet: ClothingClosetState) => void;
};

type SummaryItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  lifespanMonths: number;
  quantity: number;
  image: string;
};

const CLOSET_CATEGORIES: { id: ClothingGameCategory; label: string }[] = [
  { id: 'tops', label: 'Tops' },
  { id: 'bottoms', label: 'Bottoms' },
  { id: 'dresses', label: 'Dresses / One-Piece' },
  { id: 'professional', label: 'Professional Clothing' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'accessories', label: 'Accessories' },
];

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

export function ClothingGameStep({
  clothingItems,
  clothingCloset,
  onClosetChange,
}: ClothingGameStepProps) {
  const [activeCategory, setActiveCategory] = useState<ClothingGameCategory>('tops');
  const [lastChangedItemId, setLastChangedItemId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const activeItems = useMemo(
    () =>
      clothingItems
        .filter((item) => item.category === activeCategory && item.is_active !== false)
        .sort((a, b) => (a.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.sort_order ?? Number.MAX_SAFE_INTEGER)),
    [activeCategory, clothingItems]
  );

  const selectedClosetItems = useMemo(
    () => getSelectedClosetItems(clothingCloset),
    [clothingCloset]
  );
  const totalSelectedItemCount = useMemo(
    () => getTotalSelectedItemCount(clothingCloset),
    [clothingCloset]
  );
  const totalClosetValue = useMemo(
    () => getTotalClosetValue(clothingCloset),
    [clothingCloset]
  );
  const totalMonthlyClothingCost = useMemo(
    () => getTotalMonthlyClothingCost(clothingCloset),
    [clothingCloset]
  );
  const wardrobeBadge = useMemo(() => {
    const professionalCount = selectedClosetItems
      .filter((item) => item.category === 'professional')
      .reduce((sum, item) => sum + item.quantity, 0);
    const accessoriesCount = selectedClosetItems
      .filter((item) => item.category === 'accessories')
      .reduce((sum, item) => sum + item.quantity, 0);

    if (professionalCount >= 3) return 'Professional Ready';
    if (accessoriesCount >= 3 || totalSelectedItemCount >= 10) return 'Trendsetter';
    return 'Minimalist';
  }, [selectedClosetItems, totalSelectedItemCount]);

  useEffect(() => {
    if (!lastChangedItemId) return;

    const timeoutId = window.setTimeout(() => {
      setLastChangedItemId(null);
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [lastChangedItemId]);

  const updateItemQuantity = (item: ClothingGameItem, delta: number) => {
    const existing = clothingCloset[item.id];
    const nextQuantity = Math.max(0, (existing?.quantity || 0) + delta);
    setLastChangedItemId(item.id);

    if (nextQuantity === 0) {
      if (!existing) return;
      const { [item.id]: _removed, ...rest } = clothingCloset;
      onClosetChange(rest);
      return;
    }

    onClosetChange({
      ...clothingCloset,
      [item.id]: {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        lifespanMonths: item.lifespan_months,
        quantity: nextQuantity,
        image: item.image_url,
      },
    });
  };

  const updateSummaryItemQuantity = (item: SummaryItem, delta: number) => {
    const matchingItem = clothingItems.find((candidate) => candidate.id === item.id);
    if (matchingItem) {
      updateItemQuantity(matchingItem, delta);
      return;
    }

    const nextQuantity = Math.max(0, item.quantity + delta);
    setLastChangedItemId(item.id);

    if (nextQuantity === 0) {
      const { [item.id]: _removed, ...rest } = clothingCloset;
      onClosetChange(rest);
      return;
    }

    onClosetChange({
      ...clothingCloset,
      [item.id]: {
        ...item,
        quantity: nextQuantity,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#3372B2] shadow-sm">
            <Shirt className="h-6 w-6" />
          </div>
          <div className="space-y-3">
            <div>
              <h3 className="text-2xl font-black text-slate-900">Build Your Closet</h3>
              <p className="mt-1 text-sm font-bold text-[#3372B2]">
                Choose the clothes and accessories you actually use, then see what your wardrobe might cost over time.
              </p>
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-600">
              Shop this step like a store. Add pieces to your cart, then open checkout to review what your closet would cost each month.
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Browse Clothing</p>
              <h4 className="text-xl font-black text-slate-900">Pick items you would actually buy</h4>
            </div>
            <div className="-mx-1 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-3 px-1">
                {CLOSET_CATEGORIES.map((tab) => {
                  const isActive = tab.id === activeCategory;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveCategory(tab.id)}
                      className={`rounded-full border px-4 py-2 text-sm font-black transition-all ${
                        isActive
                          ? 'border-[#10B981] bg-emerald-50 text-emerald-700 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-[#D6E4F0] hover:bg-[#F3F7FB]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition-all hover:border-[#D6E4F0] hover:bg-[#F3F7FB]"
            aria-label="Open shopping cart"
          >
            <ShoppingCart className="h-5 w-5" />
            Cart
            {totalSelectedItemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs font-black text-white">
                {totalSelectedItemCount}
              </span>
            )}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {activeItems.map((item) => {
            const quantity = clothingCloset[item.id]?.quantity || 0;
            const isInCloset = quantity > 0;

            return (
              <div
                key={item.id}
                className={`relative flex h-full flex-col overflow-hidden rounded-3xl border-2 bg-white p-4 text-left transition-all ${
                  isInCloset
                    ? 'border-[#10B981] bg-emerald-50/20 ring-2 ring-emerald-50 shadow-[0_4px_16px_rgba(16,185,129,0.12)]'
                    : 'border-slate-100 hover:border-[#D6E4F0] hover:bg-[#F3F7FB] hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]'
                } ${lastChangedItemId === item.id ? 'scale-[1.01]' : ''}`}
              >
                <div className="mb-4 h-48 overflow-hidden rounded-2xl bg-slate-100">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex flex-1 flex-col space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h5 className="text-base font-black text-slate-900">{item.name}</h5>
                    {isInCloset && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white shadow-md">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <p className="min-h-[40px] text-sm font-medium leading-relaxed text-slate-500">{item.description}</p>
                  <div className="flex items-end justify-between gap-3 pt-2">
                    <div>
                      <p className="text-xl font-black text-[#3372B2]">${formatCurrency(item.price)}</p>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        lasts about {item.lifespan_months} months
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-2">
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
            No items are available in this category yet.
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
                    <h4 className="mt-1 text-2xl font-black text-slate-900">Checkout Your Closet</h4>
                    <p className="mt-2 text-sm font-medium text-slate-500">
                      Review what you picked, update quantities, and see how your shopping choices turn into a monthly clothing budget.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="rounded-full border border-slate-200 p-2 text-slate-500 transition-all hover:bg-slate-100"
                    aria-label="Close cart"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <section className="space-y-4">
                    {selectedClosetItems.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-slate-200 px-6 py-12 text-center">
                        <ShoppingCart className="mx-auto h-10 w-10 text-slate-300" />
                        <p className="mt-4 text-lg font-black text-slate-700">Your cart is empty</p>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                          Add a few items to your cart, then come back here to review your clothing budget.
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
                      selectedClosetItems.map((item) => (
                        <div key={item.id} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                          <div className="flex items-start gap-4">
                            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-lg font-black text-slate-900">{item.name}</p>
                                  <p className="text-sm font-medium text-slate-500">{item.category}</p>
                                </div>
                                <p className="shrink-0 text-lg font-black text-[#3372B2]">${formatCurrency(item.price)}</p>
                              </div>
                              <p className="text-sm font-medium text-slate-500">
                                Lasts about {item.lifespanMonths} months
                              </p>
                              <QuantityControls
                                quantity={item.quantity}
                                onDecrement={() => updateSummaryItemQuantity(item, -1)}
                                onIncrement={() => updateSummaryItemQuantity(item, 1)}
                                label="In Cart"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </section>

                  <aside className="space-y-4">
                    <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-widest text-blue-600">Budget Snapshot</p>
                      <h5 className="mt-2 text-xl font-black text-slate-900">Clothing Totals</h5>

                      <div className="mt-4 space-y-3">
                        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                          <p className="text-sm font-medium text-slate-500">Total items selected</p>
                          <p className="mt-1 text-3xl font-black text-slate-900">{totalSelectedItemCount}</p>
                        </div>

                        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                          <p className="text-sm font-medium text-slate-500">Total closet value</p>
                          <p className="mt-1 text-3xl font-black text-[#3372B2]">${formatCurrency(totalClosetValue)}</p>
                        </div>

                        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                          <p className="text-sm font-medium text-slate-500">Estimated monthly clothing cost</p>
                          <p className="mt-1 text-3xl font-black text-slate-900">
                            ${formatCurrency(totalMonthlyClothingCost)}
                            <span className="ml-1 text-sm font-bold uppercase tracking-widest text-slate-400">/mo</span>
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-medium leading-relaxed text-slate-600 shadow-sm">
                        Some items last longer than others, so your monthly clothing budget may be lower than your full closet value.
                      </p>
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
                          Your clothing budget is already feeding the calculator total while you shop.
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
