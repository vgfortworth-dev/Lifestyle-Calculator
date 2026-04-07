import { supabase } from './supabase';
import { RIASEC_QUESTIONS } from './riasecQuestions';
import { RiasecCategory, RiasecQuestion } from '../types/riasec';

const RIASEC_CATEGORIES: RiasecCategory[] = ['R', 'I', 'A', 'S', 'E', 'C'];

type RiasecQuestionRow = {
  id: string | number;
  category: string;
  prompt?: string | null;
  question_text?: string | null;
  question?: string | null;
  text?: string | null;
  image_path?: string | null;
  alt_text?: string | null;
};

function isRiasecCategory(value: string): value is RiasecCategory {
  return RIASEC_CATEGORIES.includes(value as RiasecCategory);
}

function mapQuestionRow(row: RiasecQuestionRow): RiasecQuestion | null {
  const category = String(row.category || '').toUpperCase();
  const prompt = row.prompt || row.question_text || row.question || row.text;

  if (!isRiasecCategory(category) || !prompt) return null;

  return {
    id: String(row.id),
    category,
    prompt,
    imagePath: row.image_path || null,
    altText: row.alt_text || null,
  };
}

export async function loadRiasecQuestions(): Promise<{ questions: RiasecQuestion[]; source: 'supabase' | 'fallback' }> {
  try {
    const { data, error } = await supabase
      .from('riasec_questions')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    const questions = (data || [])
      .map((row) => mapQuestionRow(row as RiasecQuestionRow))
      .filter((question): question is RiasecQuestion => question !== null);

    if (questions.length > 0) {
      return { questions, source: 'supabase' };
    }
  } catch {
    // The local list is intentionally secondary and only used when Supabase fails or has no active rows.
  }

  return { questions: RIASEC_QUESTIONS, source: 'fallback' };
}
