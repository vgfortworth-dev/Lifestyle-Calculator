import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Sparkles,
  Minus,
  Plus,
  ShoppingCart,
  X,
} from 'lucide-react';
import {
  OTHER_SERVICES_CATEGORIES,
  OtherServicesCard,
  OtherServicesCategoryId,
  OtherServicesOffer,
} from '../data/otherServices';
import { StableEmoji } from './StableEmoji';
import { QuizState } from '../types';

type OtherServicesStepProps = {
  state: QuizState;
  onChange: (other: QuizState['selections']['other']) => void;
};

const OTHER_SERVICE_CARD_EMOJIS: Record<string, string> = {
  'college-football': '\u{1F3C8}',
  'college-basketball': '\u{1F3C0}',
  'college-baseball': '\u26BE',
  'concert-niche': '\u{1F3B5}',
  'concert-established': '\u{1F3B6}',
  'concert-superstar': '\u{1F3A4}',
  'mlb-weekday': '\u26BE',
  'mlb-weekend': '\u26BE\u26BE',
  'mlb-rivalry-playoffs': '\u26BE\u26BE\u26BE',
  'nfl-standard': '\u{1F3C8}',
  'nfl-premium': '\u{1F3C8}\u{1F3C8}',
  'nfl-marquee': '\u{1F3C8}\u{1F3C8}\u{1F3C8}',
  'theatre-casa': '\u{1F3AD}',
  'theatre-bass': '\u{1F39F}\uFE0F',
  'theatre-fair-park': '\u2B50',
  'events-zoo': '\u{1F981}',
  'events-sixflags': '\u{1F3A2}',
  'events-statefair': '\u{1F3A1}',
  'events-dickies': '\u{1F39F}\uFE0F',
  'events-cowtown': '\u{1F3C3}',
  'events-botanic': '\u{1F338}',
};

function getOtherServicesCardEmoji(card: OtherServicesCard) {
  return OTHER_SERVICE_CARD_EMOJIS[card.id] ?? '\u2728';
}

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDisplayPrice(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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

export function OtherServicesStep({ state, onChange }: OtherServicesStepProps) {
  const [activeCategory, setActiveCategory] = useState<OtherServicesCategoryId>('college-athletics');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastChangedItemId, setLastChangedItemId] = useState<string | null>(null);
  const otherSelections = state.selections.other;

  const activeCategoryData = useMemo(
    () => OTHER_SERVICES_CATEGORIES.find((category) => category.id === activeCategory) ?? OTHER_SERVICES_CATEGORIES[0],
    [activeCategory]
  );

  const selectedItems = useMemo(
    () => Object.values(otherSelections).filter((entry) => entry.quantity > 0),
    [otherSelections]
  );

  const totalSelectedCount = useMemo(
    () => selectedItems.reduce((sum, entry) => sum + entry.quantity, 0),
    [selectedItems]
  );

  const totalSelectedMonthlyCost = useMemo(
    () => selectedItems.reduce((sum, entry) => sum + entry.price * entry.quantity, 0),
    [selectedItems]
  );

  useEffect(() => {
    if (!lastChangedItemId) return;

    const timeoutId = window.setTimeout(() => {
      setLastChangedItemId(null);
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [lastChangedItemId]);

  const updateOptionQuantity = (
    option: OtherServicesOffer,
    cardTitle: string,
    categoryLabel: string,
    cardIcon: string | undefined,
    delta: number
  ) => {
    const existing = otherSelections[option.id];
    const nextQuantity = Math.max(0, (existing?.quantity || 0) + delta);
    setLastChangedItemId(option.id);

    if (nextQuantity === 0) {
      if (!existing) return;
      const { [option.id]: _removed, ...rest } = otherSelections;
      onChange(rest);
      return;
    }

    onChange({
      ...otherSelections,
      [option.id]: {
        id: option.id,
        name: option.name,
        price: Number((option.price / 12).toFixed(2)),
        quantity: nextQuantity,
        description: option.description,
        emoji: option.emoji ?? cardIcon ?? cardTitle,
        category: categoryLabel,
        type: cardTitle,
      },
    });
  };

  const updateSummaryItemQuantity = (itemId: string, delta: number) => {
    const source = OTHER_SERVICES_CATEGORIES.flatMap((category) =>
      category.cards.flatMap((card) =>
        card.options.map((option) => ({
          option,
          cardTitle: card.title,
          cardIcon: card.icon,
          categoryLabel: category.label,
        }))
      )
    ).find((entry) => entry.option.id === itemId);

    if (!source) return;

    updateOptionQuantity(source.option, source.cardTitle, source.categoryLabel, source.cardIcon, delta);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#3372B2] shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-3">
            <div>
              <h3 className="text-2xl font-black text-slate-900">Other Services</h3>
              <p className="mt-1 text-sm font-bold text-[#3372B2]">
                Shop for fun, events, and memberships the same way you built your grocery cart and closet.
              </p>
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-600">
              Browse events, add them to your cart, adjust quantities, and review how annual or one-time picks turn into a monthly budget.
            </p>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Browse Other Services</p>
              <h4 className="text-xl font-black text-slate-900">Build a realistic fun and events cart</h4>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Add one for each person, ticket, pass, or membership you want in your lifestyle budget.
              </p>
            </div>
            <div className="-mx-1 overflow-x-auto pb-1 lg:overflow-visible">
              <div className="flex min-w-max gap-3 px-1 lg:min-w-0 lg:flex-wrap">
                {OTHER_SERVICES_CATEGORIES.map((category) => {
                  const isActive = category.id === activeCategory;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setActiveCategory(category.id)}
                      className={`rounded-full border px-4 py-2 text-sm font-black transition-all ${
                        isActive
                          ? 'border-[#10B981] bg-emerald-50 text-emerald-700 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-[#D6E4F0] hover:bg-[#F3F7FB]'
                      }`}
                    >
                      {category.label}
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
            aria-label="Open other services cart"
          >
            <ShoppingCart className="h-5 w-5" />
            Cart
            {totalSelectedCount > 0 && (
              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs font-black text-white">
                {totalSelectedCount}
              </span>
            )}
          </button>
        </div>

        {activeCategoryData.heroImage && (
          <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
            <img
              src={activeCategoryData.heroImage}
              alt={activeCategoryData.heroImageAlt ?? activeCategoryData.label}
              className="h-auto w-full object-cover"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activeCategoryData.cards.map((card) => {
            const groupHasSelection = card.options.some((option) => (otherSelections[option.id]?.quantity || 0) > 0);
            const groupEmoji = getOtherServicesCardEmoji(card);

            return (
              <div
                key={card.id}
                className={`rounded-[30px] border bg-gradient-to-b from-[#F8FEFD] via-white to-white p-4 shadow-sm transition-all sm:p-5 ${
                  groupHasSelection
                    ? 'border-[#6CE6D1] shadow-[0_10px_30px_rgba(16,185,129,0.12)]'
                    : 'border-[#8AEBDD] hover:border-[#56D8C0] hover:shadow-[0_8px_24px_rgba(51,114,178,0.08)]'
                }`}
              >
                <div className="px-2 pb-3 pt-1 text-center">
                  <StableEmoji symbol={groupEmoji} className="text-4xl leading-none sm:text-5xl" />
                  <h5 className="mt-3 break-words text-center text-3xl font-black uppercase leading-tight text-[#159A8C] sm:text-[2.1rem]">
                    {card.title}
                  </h5>
                  {card.priceHint && (
                    <p className="mt-2 text-base font-black uppercase tracking-[0.3em] text-[#10B981]">{card.priceHint}</p>
                  )}
                </div>

                <div className="space-y-4">
                  {card.options.map((offer) => {
                    const quantity = otherSelections[offer.id]?.quantity || 0;
                    const isInCart = quantity > 0;
                    const monthlyCost = Number((offer.price / 12).toFixed(2));

                    return (
                      <div
                        key={offer.id}
                        className={`relative rounded-[24px] border bg-[#EEF4FB] p-4 transition-all ${
                          isInCart
                            ? 'border-[#9FE7D8] ring-2 ring-emerald-100'
                            : 'border-[#D7E3F1]'
                        } ${lastChangedItemId === offer.id ? 'scale-[1.01]' : ''}`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h6 className="text-base font-black leading-tight text-slate-900">{offer.name}</h6>
                              <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">{offer.description}</p>
                            </div>
                            {isInCart && (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white shadow-md">
                                <Check className="h-4 w-4" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-4xl font-black leading-none text-[#3372B2]">
                              ${formatDisplayPrice(offer.price)}
                            </p>
                            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                              about ${formatCurrency(monthlyCost)}/mo
                            </p>
                          </div>

                          <div className="min-w-0">
                            {quantity === 0 ? (
                              <button
                                type="button"
                                onClick={() => updateOptionQuantity(offer, card.title, activeCategoryData.label, card.icon, 1)}
                                className="flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition-all hover:border-[#10B981] hover:bg-emerald-50 hover:text-emerald-700"
                                aria-label={`Add ${offer.name} to cart`}
                              >
                                Add to cart
                              </button>
                            ) : (
                              <QuantityControls
                                quantity={quantity}
                                onDecrement={() => updateOptionQuantity(offer, card.title, activeCategoryData.label, card.icon, -1)}
                                onIncrement={() => updateOptionQuantity(offer, card.title, activeCategoryData.label, card.icon, 1)}
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
              </div>
            );
          })}
        </div>

        {activeCategoryData.cards.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm font-medium text-slate-400">
            No other services are available in this category yet.
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
                    <h4 className="mt-1 text-2xl font-black text-slate-900">Checkout Other Services</h4>
                    <p className="mt-2 text-sm font-medium text-slate-500">
                      Review what you added, update quantities, and see how your fun and event choices contribute to your monthly budget.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="rounded-full border border-slate-200 p-2 text-slate-500 transition-all hover:bg-slate-100"
                    aria-label="Close other services cart"
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
                          Add a few events or services, then come back here to review this part of your lifestyle budget.
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
                                  {item.type && (
                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#3372B2]">
                                      {item.type}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="text-lg font-black text-[#3372B2]">${formatCurrency(item.price * item.quantity)}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">monthly total</p>
                              </div>
                            </div>
                            {item.description && (
                              <p className="text-sm font-medium leading-relaxed text-slate-500">{item.description}</p>
                            )}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                ${formatCurrency(item.price)} per month each
                              </p>
                              <div className="sm:min-w-[220px]">
                                <QuantityControls
                                  quantity={item.quantity}
                                  onDecrement={() => updateSummaryItemQuantity(item.id, -1)}
                                  onIncrement={() => updateSummaryItemQuantity(item.id, 1)}
                                  label="In Cart"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </section>

                  <aside className="space-y-4">
                    <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-widest text-blue-600">Budget Snapshot</p>
                      <h5 className="mt-2 text-xl font-black text-slate-900">Other Services Totals</h5>

                      <div className="mt-4 space-y-3">
                        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                          <p className="text-sm font-medium text-slate-500">Items Added</p>
                          <p className="mt-1 text-3xl font-black text-slate-900">{totalSelectedCount}</p>
                        </div>

                        <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                          <p className="text-sm font-medium text-slate-500">Estimated monthly total</p>
                          <p className="mt-1 text-3xl font-black text-slate-900">
                            ${formatCurrency(totalSelectedMonthlyCost)}
                            <span className="ml-1 text-sm font-bold uppercase tracking-widest text-slate-400">/mo</span>
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-medium leading-relaxed text-slate-600 shadow-sm">
                        These picks already flow into the calculator total as monthly amounts based on the displayed event or annual price.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-orange-100 bg-orange-50 p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-widest text-orange-600">What To Notice</p>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                        Small entertainment choices can stack up fast when you add multiple memberships, tickets, or yearly events.
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
                          Your other services budget is already updating live while you shop.
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

      <section className="rounded-3xl border border-slate-100 bg-slate-50 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-600">
            Selections here still flow into the calculator total as monthly amounts based on the displayed annual or event price.
          </p>
          <p className="text-sm font-black text-[#3372B2]">{totalSelectedCount} selected</p>
        </div>
      </section>
    </div>
  );
}
