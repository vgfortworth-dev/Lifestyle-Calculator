import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Smartphone } from 'lucide-react';
import { QuizState } from '../types';
import { AppColorTokens, SelectionChangeHandler } from '../types/componentProps';
import { PhoneDecision, PhoneDeviceOption } from '../types/options';

type PhoneSelectionStepProps = {
  state: QuizState;
  onSelect: SelectionChangeHandler;
  deviceOptions: PhoneDeviceOption[];
  colors: Pick<AppColorTokens, 'selectedGreen'>;
};

export function PhoneSelectionStep({
  state,
  onSelect,
  deviceOptions,
  colors,
}: PhoneSelectionStepProps) {
  const [decision, setDecision] = useState<PhoneDecision>(() => {
    const currentId = state.selections.phone;
    if (currentId === 'keep-phone') return 'keep';
    if (currentId?.startsWith('refurb-')) return 'refurbished';
    if (currentId?.startsWith('new-')) return 'new';
    return 'none';
  });
  const refurbishedOptions = deviceOptions.filter((p) => p.category === 'refurbished');
  const newOptions = deviceOptions.filter((p) => p.category === 'new');

  useEffect(() => {
    const currentId = state.selections.phone;
    if (currentId === 'keep-phone') {
      setDecision('keep');
    } else if (currentId?.startsWith('refurb-')) {
      setDecision('refurbished');
    } else if (currentId?.startsWith('new-')) {
      setDecision('new');
    } else {
      setDecision('none');
    }
  }, [state.selections.phone]);

  const handleDecision = (type: Exclude<PhoneDecision, 'none'>) => {
    setDecision(type);
    if (type === 'keep') {
      onSelect('phone', 'keep-phone');
      return;
    }

    const selectedId = state.selections.phone;
    const isSameCategorySelected =
      (type === 'refurbished' && selectedId?.startsWith('refurb-')) ||
      (type === 'new' && selectedId?.startsWith('new-'));

    if (!isSameCategorySelected) {
      onSelect('phone', '');
    }
  };

  const renderPhoneCard = (phone: PhoneDeviceOption) => {
    const monthlyCost = phone.price / phone.months;
    const isSelected = state.selections.phone === phone.id;

    return (
      <button
        key={phone.id}
        onClick={() => onSelect('phone', phone.id)}
        className={`p-6 rounded-2xl text-left transition-all border-2 flex flex-col justify-between h-full ${
          isSelected
            ? 'bg-emerald-50/40'
            : 'border-slate-100 bg-white hover:border-slate-300'
        }`}
        style={isSelected ? { borderColor: colors.selectedGreen, boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.08)' } : undefined}
      >
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-3xl">{phone.emoji}</span>
            {isSelected && <CheckCircle2 className="w-6 h-6" style={{ color: colors.selectedGreen }} />}
          </div>
          <h3 className="font-bold text-lg text-slate-900">{phone.name}</h3>
          <p className="text-sm text-slate-500">{phone.description}</p>
          <p className="text-xs font-bold text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">
            {phone.months}-Month Plan
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-2xl font-black text-slate-900">
            ${monthlyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-bold text-slate-400 uppercase ml-1">/mo</span>
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-4 shadow-xl">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Smartphone className="text-orange-500" /> The Year is 2030...
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed">
          Imagine that your current phone is an <strong>iPhone 17 Pro</strong>. It's already paid off (you owe $0),
          but there are some newer phones on the market that you've been looking at. What do you do?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleDecision('keep')}
          className={`p-6 rounded-2xl border-2 transition-all text-left ${
            decision === 'keep' ? 'bg-emerald-50/40' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
          style={decision === 'keep' ? { borderColor: colors.selectedGreen } : undefined}
        >
          <h3 className="font-bold text-lg mb-1">Keep current phone</h3>
          <p className="text-sm text-slate-500">My iPhone 17 Pro works fine. I'll save my money.</p>
          <p className="mt-4 font-black text-xl">$0/mo</p>
        </button>

        <button
          onClick={() => handleDecision('refurbished')}
          className={`p-6 rounded-2xl border-2 transition-all text-left ${
            decision === 'refurbished' ? 'bg-emerald-50/40' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
          style={decision === 'refurbished' ? { borderColor: colors.selectedGreen } : undefined}
        >
          <h3 className="font-bold text-lg mb-1">Buy refurbished</h3>
          <p className="text-sm text-slate-500">I want a newer model, but I want to save some money.</p>
        </button>

        <button
          onClick={() => handleDecision('new')}
          className={`p-6 rounded-2xl border-2 transition-all text-left ${
            decision === 'new' ? 'bg-emerald-50/40' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
          style={decision === 'new' ? { borderColor: colors.selectedGreen } : undefined}
        >
          <h3 className="font-bold text-lg mb-1">Buy a new phone</h3>
          <p className="text-sm text-slate-500">I want the latest tech (iPhone 21) right now!</p>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {decision === 'refurbished' && (
          <motion.div
            key="refurbished"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4"
          >
            {refurbishedOptions.map(renderPhoneCard)}
          </motion.div>
        )}

        {decision === 'new' && (
          <motion.div
            key="new"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4"
          >
            {newOptions.map(renderPhoneCard)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
