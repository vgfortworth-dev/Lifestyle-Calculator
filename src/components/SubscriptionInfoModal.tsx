import { Option } from '../types';
import { SUBSCRIPTION_OPTION_INFO } from '../content/subscriptionInfo';
import { ModalShell } from './ModalShell';

type SubscriptionInfoModalProps = {
  option: Option | null;
  onClose: () => void;
};

export function SubscriptionInfoModal({ option, onClose }: SubscriptionInfoModalProps) {
  const info = option ? SUBSCRIPTION_OPTION_INFO[option.id] : null;

  return (
    <ModalShell
      isOpen={!!option && !!info}
      onClose={onClose}
      title={option?.name || ''}
      subtitle="What is this and what do you get?"
      labelledBy="subscription-info-title"
      footerLabel="Back to Options"
      maxWidthClassName="max-w-xl"
      bodyClassName="max-h-[65vh] overflow-y-auto px-6 py-6"
    >
      {info && (
        <div className="space-y-5">
          <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
            <h3 className="text-lg font-black text-[#3372B2]">What it is</h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">{info.what}</p>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-black text-[#3372B2]">What's included</h3>
            <ul className="mt-3 space-y-2">
              {info.included.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm font-medium leading-relaxed text-slate-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2D9B8E]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {info.bestFor && (
            <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium leading-relaxed text-emerald-900/80">
              <span className="font-black">Best for:</span> {info.bestFor}
            </p>
          )}
        </div>
      )}
    </ModalShell>
  );
}
