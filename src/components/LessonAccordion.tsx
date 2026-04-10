import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export type LessonAccordionItem = {
  id: string;
  title: string;
  summary?: string;
  content: React.ReactNode;
};

type LessonAccordionProps = {
  items: LessonAccordionItem[];
  defaultOpenId?: string;
};

export function LessonAccordion({ items, defaultOpenId }: LessonAccordionProps) {
  const firstId = items[0]?.id;
  const initialId = defaultOpenId ?? firstId ?? '';
  const [openId, setOpenId] = useState(initialId);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const normalizedDefaultId = useMemo(() => defaultOpenId ?? firstId ?? '', [defaultOpenId, firstId]);

  useEffect(() => {
    if (!items.some((item) => item.id === openId)) {
      setOpenId(normalizedDefaultId);
    }
  }, [items, openId, normalizedDefaultId]);

  useEffect(() => {
    if (!openId) return;

    const node = itemRefs.current[openId];
    if (!node) return;

    const frame = window.requestAnimationFrame(() => {
      node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [openId]);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = item.id === openId;

        return (
          <div
            key={item.id}
            ref={(node) => {
              itemRefs.current[item.id] = node;
            }}
            className={`overflow-hidden rounded-2xl border transition-colors ${
              isOpen ? 'border-blue-100 bg-blue-50/50' : 'border-slate-100 bg-white'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                if (!isOpen) setOpenId(item.id);
              }}
              className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50/70"
              aria-expanded={isOpen}
            >
              <div className="min-w-0 flex-1">
                <p className="text-base font-black text-[#3372B2]">{item.title}</p>
                {item.summary && (
                  <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">
                    {item.summary}
                  </p>
                )}
              </div>
              <div
                className={`mt-1 rounded-full border border-slate-200 bg-white p-1.5 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : 'rotate-0'
                }`}
              >
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-blue-100 px-5 pb-5 pt-1">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
