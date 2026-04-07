import { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { RIASEC_CATEGORY_LABELS } from '../../lib/riasecQuestions';
import {
  RIASEC_CATEGORIES,
  buildRiasecSummaryFromCode,
  normalizeRiasecCode,
} from '../../lib/riasecValidation';
import { RiasecCategory, RiasecSummary } from '../../types/riasec';

type RiasecCodeEntryProps = {
  onSubmit: (summary: RiasecSummary) => void;
  onBack: () => void;
};

export function RiasecCodeEntry({ onSubmit, onBack }: RiasecCodeEntryProps) {
  const [code, setCode] = useState('');
  const [primary, setPrimary] = useState('');
  const [secondary, setSecondary] = useState('');
  const [third, setThird] = useState('');
  const [error, setError] = useState('');

  const selectedPickerCode = useMemo(() => [primary, secondary, third].filter(Boolean).join(''), [primary, secondary, third]);

  const submitCode = (nextCode: string) => {
    const result = buildRiasecSummaryFromCode(nextCode);
    if (result.ok === false) {
      setError(result.error);
      return;
    }

    setError('');
    onSubmit(result.summary);
  };

  const handleManualSubmit = () => {
    submitCode(code);
  };

  const handlePickerSubmit = () => {
    submitCode(selectedPickerCode);
  };

  const renderSelect = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    required = false
  ) => (
    <label className="space-y-2">
      <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(event) => {
          setError('');
          onChange(event.target.value);
        }}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-[#3372B2] focus:ring-4 focus:ring-blue-100"
        required={required}
      >
        <option value="">Choose one</option>
        {RIASEC_CATEGORIES.map((category: RiasecCategory) => (
          <option key={category} value={category}>
            {category} - {RIASEC_CATEGORY_LABELS[category]}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl sm:p-8">
      <div className="space-y-2">
        <p className="text-xs font-black uppercase tracking-widest text-[#3372B2]">I Already Know My Code</p>
        <h1 className="text-3xl font-black text-slate-900">Enter Your RIASEC Code</h1>
        <p className="text-sm font-medium leading-relaxed text-slate-500">
          If you have taken a RIASEC quiz before, you can enter your 2- or 3-letter code instead of taking the quiz again.
        </p>
      </div>

      <section className="space-y-4 rounded-3xl border border-blue-100 bg-blue-50/60 p-5">
        <h2 className="text-lg font-black text-slate-900">Type your code</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={code}
            onChange={(event) => {
              setError('');
              setCode(normalizeRiasecCode(event.target.value));
            }}
            placeholder="Example: SEA"
            maxLength={3}
            className="min-h-12 flex-1 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-center text-xl font-black uppercase tracking-[0.4em] text-slate-900 outline-none transition-all focus:border-[#3372B2] focus:ring-4 focus:ring-blue-100"
          />
          <button
            onClick={handleManualSubmit}
            className="rounded-2xl bg-slate-900 px-6 py-3 font-black text-white shadow-lg transition-all hover:bg-slate-800 active:scale-[0.99]"
          >
            Use Code
          </button>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-100 bg-slate-50 p-5">
        <h2 className="text-lg font-black text-slate-900">Or choose the letters</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {renderSelect('Primary', primary, setPrimary, true)}
          {renderSelect('Secondary', secondary, setSecondary, true)}
          {renderSelect('Third (optional)', third, setThird)}
        </div>
        <button
          onClick={handlePickerSubmit}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 font-black text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-600 active:scale-[0.99] sm:w-auto"
        >
          <CheckCircle2 className="h-5 w-5" />
          Use Selected Letters
        </button>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={onBack}
        className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-600 transition-all hover:bg-slate-200"
      >
        Back to Setup
      </button>
    </div>
  );
}
