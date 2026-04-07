import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

type BeforeYouChooseCalloutProps = {
  body: string;
  icon: React.ReactNode;
  actionIcon: React.ReactNode;
  onLessonClick: () => void;
};

export function BeforeYouChooseCallout({
  body,
  icon,
  actionIcon,
  onLessonClick,
}: BeforeYouChooseCalloutProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="my-2 flex flex-col gap-5 rounded-3xl border border-blue-100 bg-blue-50/80 p-6 shadow-lg shadow-blue-100/50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#3372B2] shadow-sm" aria-hidden="true">
            {icon}
          </span>
          <p className="text-base font-black text-[#3372B2]">Before You Choose</p>
        </div>
        <p className="text-sm font-medium leading-relaxed text-slate-600">{body}</p>
      </div>
      <button
        onClick={onLessonClick}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3372B2] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-[#2B5FA3] active:scale-95 sm:shrink-0"
      >
        {actionIcon}
        Quick Lesson
      </button>
    </motion.div>
  );
}
