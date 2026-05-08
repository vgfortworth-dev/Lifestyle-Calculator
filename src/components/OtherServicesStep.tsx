import { useMemo, useState } from 'react';
import {
  FerrisWheel,
  Music4,
  Ticket,
  Check,
  Sparkles,
  Trophy,
  Minus,
  Plus,
} from 'lucide-react';
import { OTHER_SERVICES_CATEGORIES, OtherServicesCategoryId } from '../data/otherServices';
import { QuizState } from '../types';

type OtherServicesStepProps = {
  state: QuizState;
  onChange: (other: QuizState['selections']['other']) => void;
};

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function QuantityControls({
  quantity,
  onDecrement,
  onIncrement,
}: {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-full border border-emerald-200 bg-white px-3 py-2">
      <button
        type="button"
        onClick={onDecrement}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-[#10B981] hover:bg-emerald-50 hover:text-emerald-700"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="min-w-[36px] text-center text-lg font-black text-[#10B981]">{quantity}</div>
      <button
        type="button"
        onClick={onIncrement}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-[#10B981] hover:bg-emerald-50 hover:text-emerald-700"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function OtherServicesStep({ state, onChange }: OtherServicesStepProps) {
  const [activeCategory, setActiveCategory] = useState<OtherServicesCategoryId>('college-athletics');
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

  const updateOptionQuantity = (option: { id: string; name: string; description: string; price: number; emoji?: string }, cardTitle: string, categoryLabel: string, delta: number) => {
    const existing = otherSelections[option.id];
    const nextQuantity = Math.max(0, (existing?.quantity || 0) + delta);

    if (nextQuantity === 0) {
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
        emoji: option.emoji ?? cardTitle,
        category: categoryLabel,
        type: cardTitle,
      },
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-blue-100 bg-[linear-gradient(135deg,rgba(243,247,251,0.98),rgba(232,240,250,0.96))] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.24em] text-[#3372B2] shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Fun & Events
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 sm:text-2xl">FUN & EVENTS</h3>
              <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
                The little things that add up. Choose how often you go out, have fun, and experience life each year.
              </p>
              <p className="mt-2 text-sm font-bold text-[#3372B2]">
                Tip: Think about how many events you realistically attend in a year.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Ticket, label: 'Tickets' },
              { icon: Music4, label: 'Concerts' },
              { icon: FerrisWheel, label: 'Amusement' },
              { icon: Trophy, label: 'Sports' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex min-h-[88px] min-w-[88px] flex-col items-center justify-center rounded-3xl border border-white/80 bg-white/85 px-4 py-4 text-center shadow-sm"
              >
                <Icon className="h-6 w-6 text-[#3372B2]" />
                <span className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 sm:text-[11px]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">BROWSE CATEGORIES</p>
            <h4 className="mt-1 text-lg font-extrabold text-slate-900 sm:text-xl">Which events will you go to each year?</h4>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Add one for each person, membership, or package you want to include.
            </p>
          </div>

          <div className="-mx-1 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-3 px-1">
              {OTHER_SERVICES_CATEGORIES.map((category) => {
                const isActive = category.id === activeCategory;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategory(category.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-black transition-all ${
                      isActive
                        ? 'border-[#4FD1C5] bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-[#D6E4F0] hover:bg-[#F3F7FB]'
                    }`}
                    aria-pressed={isActive}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
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

        <div className={`mt-6 grid grid-cols-1 gap-5 ${activeCategory === 'other-events' ? 'xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2' : 'xl:grid-cols-3 md:grid-cols-2'}`}>
          {activeCategoryData.cards.map((card) => (
            <article
              key={card.id}
              className="rounded-[28px] border border-[#89E0D4] bg-[linear-gradient(180deg,#ffffff_0%,#f8fffe_100%)] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
            >
              <div className="flex min-h-[72px] flex-col items-center justify-center text-center">
                <div className="text-4xl leading-none">{card.icon}</div>
                <h5 className="mt-3 text-base font-black uppercase leading-tight tracking-tight text-[#129886] sm:text-lg">
                  {card.title}
                </h5>
                {card.priceHint && (
                  <p className="mt-1 text-sm font-black uppercase tracking-[0.3em] text-emerald-500">{card.priceHint}</p>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {card.options.map((option) => {
                  const quantity = otherSelections[option.id]?.quantity || 0;
                  const isSelected = quantity > 0;

                  return (
                    <div
                      key={option.id}
                      className={`rounded-3xl border bg-slate-50/90 p-4 transition-all ${
                        isSelected ? 'border-[#10B981] bg-emerald-50/70 shadow-sm' : 'border-[#D6E4F0]'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900 sm:text-base">{option.name}</p>
                        <p className="text-xs font-medium leading-relaxed text-slate-500">{option.description}</p>
                        <p className="pt-1 text-4xl font-black text-[#3372B2]">${formatCurrency(option.price)}</p>
                      </div>

                      <div className="mt-4">
                        {quantity === 0 ? (
                          <button
                            type="button"
                            onClick={() => updateOptionQuantity(option, card.title, activeCategoryData.label, 1)}
                            className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-800 transition-all hover:border-[#10B981] hover:bg-emerald-50 hover:text-emerald-700"
                            aria-label={`Add ${card.title} ${option.name}`}
                          >
                            Add to cart
                          </button>
                        ) : (
                          <QuantityControls
                            quantity={quantity}
                            onDecrement={() => updateOptionQuantity(option, card.title, activeCategoryData.label, -1)}
                            onIncrement={() => updateOptionQuantity(option, card.title, activeCategoryData.label, 1)}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-[28px] border border-slate-100 bg-slate-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Selected Items</p>
              <h5 className="mt-1 text-lg font-black text-slate-900">Your Fun & Events Picks</h5>
              <p className="mt-2 text-sm font-medium text-slate-500">
                This updates live so students can see what they have added on this step.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:w-auto">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Items Added</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{totalSelectedCount}</p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Monthly Total</p>
                <p className="mt-1 text-2xl font-black text-[#3372B2]">${formatCurrency(totalSelectedMonthlyCost)}</p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            {selectedItems.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm font-medium text-slate-400">
                No events added yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                {selectedItems.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900 sm:text-base">
                        {entry.type ? `${entry.type}: ${entry.name}` : entry.name}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        {entry.quantity} selected in {entry.category}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">
                        x{entry.quantity}
                      </span>
                      <p className="text-base font-black text-[#3372B2]">
                        ${formatCurrency(entry.price * entry.quantity)}
                        <span className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">/mo</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50 px-5 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-600">
              Selections here still flow into the calculator total as monthly amounts based on the displayed annual or event price.
            </p>
            <p className="text-sm font-black text-[#3372B2]">
              {totalSelectedCount} selected
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
