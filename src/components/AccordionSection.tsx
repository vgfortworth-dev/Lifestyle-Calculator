import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

type AccordionSectionProps = {
  title: string;
  icon: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  titleColor: string;
};

export function AccordionSection({
  title,
  icon,
  count,
  isExpanded,
  onToggle,
  children,
  titleColor,
}: AccordionSectionProps) {
  return (
    <div className="space-y-3">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full text-left group"
      >
        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
          <ChevronDown className="w-5 h-5 group-hover:text-slate-700" style={{ color: titleColor }} />
        </div>
        <h3 className="text-xl font-black uppercase tracking-wider flex items-center gap-3" style={{ color: titleColor }}>
          <span className="text-2xl">{icon}</span>
          {title}
          <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
        </h3>
        <div className="flex-1 h-px bg-slate-100" />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
