import { ReactNode } from 'react';
import { AppColorTokens } from '../types/componentProps';

type QuizWrapperProps = {
  title: string;
  children: ReactNode;
  description?: string;
  colors: Pick<AppColorTokens, 'borderSlate' | 'headerBlue'>;
};

export function QuizWrapper({ title, children, description, colors }: QuizWrapperProps) {
  return (
    <div className="max-w-6xl mx-auto mb-12 px-4 md:px-0">
      {description && (
        <div className="mb-6 text-center">
          <p className="text-slate-500 text-lg font-medium">{description}</p>
        </div>
      )}

      <div className="border-2 rounded-xl bg-white shadow-xl relative" style={{ borderColor: colors.borderSlate }}>
        <div className="text-white py-4 px-6 text-center font-bold text-xl uppercase tracking-tight rounded-t-[10px]" style={{ backgroundColor: colors.headerBlue }}>
          {title}
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
