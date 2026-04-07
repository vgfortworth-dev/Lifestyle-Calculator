import { Option, QuizState } from '../types';

export type SelectionChangeHandler = (
  category: keyof QuizState['selections'],
  value: string
) => void;

export type AppColorTokens = {
  headerBlue: string;
  valueTeal: string;
  selectedGreen: string;
  borderSlate: string;
};

export type SingleSelectStepProps<
  Category extends keyof QuizState['selections'],
  OptionType = Option
> = {
  options: OptionType[];
  category: Category;
  state: QuizState;
  onSelect: SelectionChangeHandler;
  multiplier?: number;
};

export type MultiSelectStepProps<
  Category extends keyof QuizState['selections'],
  OptionType = Option
> = {
  options: OptionType[];
  category: Category;
  state: QuizState;
  onToggle: SelectionChangeHandler;
  multiplier?: number;
};
