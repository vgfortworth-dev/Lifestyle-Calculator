import { supabase } from './supabase';
import { RIASEC_QUESTIONS } from './riasecQuestions';
import { RiasecCategory, RiasecQuestion } from '../types/riasec';

const RIASEC_CATEGORIES: RiasecCategory[] = ['R', 'I', 'A', 'S', 'E', 'C'];
const RIASEC_STORAGE_BUCKET = 'riasec-question-images';
const RIASEC_IMAGE_WIDTH = 1200;
const RIASEC_IMAGE_QUALITY = 70;

type RiasecQuestionRow = {
  id: string | number;
  category: string;
  riasec_category?: string | null;
  riasec_code?: string | null;
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

function normalizeCategory(value: string | null | undefined): RiasecCategory | null {
  const normalized = String(value || '').trim().toUpperCase();

  if (isRiasecCategory(normalized)) return normalized;

  const categoryMap: Record<string, RiasecCategory> = {
    REALISTIC: 'R',
    INVESTIGATIVE: 'I',
    ARTISTIC: 'A',
    SOCIAL: 'S',
    ENTERPRISING: 'E',
    CONVENTIONAL: 'C',
  };

  return categoryMap[normalized] || null;
}

function buildQuestionImageUrl(imagePath: string | null | undefined) {
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) return null;

  const normalizedPath = imagePath.replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/');
  return `${supabaseUrl}/storage/v1/render/image/public/${RIASEC_STORAGE_BUCKET}/${normalizedPath}?width=${RIASEC_IMAGE_WIDTH}&quality=${RIASEC_IMAGE_QUALITY}&resize=cover`;
}

function mapQuestionRow(row: RiasecQuestionRow): RiasecQuestion | null {
  const category = normalizeCategory(row.category || row.riasec_category || row.riasec_code);
  const prompt = row.prompt || row.question_text || row.question || row.text;

  if (!category || !prompt) return null;

  return {
    id: String(row.id),
    category,
    prompt,
    imagePath: row.image_path || null,
    imageUrl: buildQuestionImageUrl(row.image_path),
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
      if (import.meta.env.DEV) {
        console.info(`[RIASEC] Loaded ${questions.length} questions from Supabase.`);
      }
      return { questions, source: 'supabase' };
    }
  } catch {
    // The local list is intentionally secondary and only used when Supabase fails or has no active rows.
  }

  if (import.meta.env.DEV) {
    console.info(`[RIASEC] Loaded ${RIASEC_QUESTIONS.length} questions from fallback.`);
  }
  return { questions: RIASEC_QUESTIONS, source: 'fallback' };
}
