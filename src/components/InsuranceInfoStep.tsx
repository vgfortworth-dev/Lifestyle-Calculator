import { Info } from 'lucide-react';
import { INSURANCE_COST_EXAMPLES } from '../content/insuranceInfo';

type InsuranceInfoStepProps = {
  onNext: () => void;
};

export function InsuranceInfoStep({ onNext }: InsuranceInfoStepProps) {
  return (
    <div className="space-y-8 rounded-3xl border border-blue-100 bg-blue-50 p-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
          <Info className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-600">Mini Lesson</p>
          <h2 className="text-3xl font-black text-slate-900">All About Insurance</h2>
        </div>
      </div>

      <section className="rounded-3xl border border-white bg-white/80 p-6 shadow-sm">
        <h3 className="font-black text-xl text-blue-900">Risk and protection</h3>
        <p className="mt-2 text-blue-800/80 font-medium leading-relaxed">
          Insurance is a way to protect yourself from big financial losses. You pay a monthly cost, and the insurance company helps pay when something expensive happens.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="rounded-3xl border border-orange-100 bg-orange-50 p-6">
          <h3 className="font-black text-xl text-orange-700">Without insurance</h3>
          <p className="mt-2 text-sm font-medium leading-relaxed text-orange-900/80">
            You may have to pay the full bill yourself. A surprise accident or medical cost can quickly become hard to afford.
          </p>
        </section>
        <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <h3 className="font-black text-xl text-emerald-700">With insurance</h3>
          <p className="mt-2 text-sm font-medium leading-relaxed text-emerald-900/80">
            You still pay monthly, but you are better protected from very large bills when something goes wrong.
          </p>
        </section>
      </div>

      <section className="space-y-4">
        <h3 className="font-black text-xl text-blue-900">Real-world cost examples</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {INSURANCE_COST_EXAMPLES.map((example) => (
            <div key={example.title} className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
              <p className="font-black text-[#3372B2]">{example.title}</p>
              <div className="mt-4 space-y-2 text-sm font-medium">
                <p className="rounded-xl bg-red-50 px-3 py-2 text-red-700">Without: {example.without}</p>
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">With: {example.with}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <h3 className="font-black text-xl text-blue-900">Think about it</h3>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          Insurance is not about hoping something bad happens. It is about being ready if something unexpected happens.
        </p>
        <p className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-black text-[#3372B2]">
          Would you rather pay less each month, or pay more to have stronger protection?
        </p>
      </section>

      <button
        onClick={onNext}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg"
      >
        I Understand, Let's Choose!
      </button>
    </div>
  );
}
