import { supabase } from './supabase';
import { RIASEC_QUESTIONS } from './riasecQuestions';
import { RiasecCategory, RiasecQuestion } from '../types/riasec';
import { buildCloudinaryImageUrl } from './cloudinary';

const RIASEC_CATEGORIES: RiasecCategory[] = ['R', 'I', 'A', 'S', 'E', 'C'];

type RiasecQuestionRow = {
  id: string | number;
  category: string;
  display_order?: number | null;
  riasec_category?: string | null;
  riasec_code?: string | null;
  prompt?: string | null;
  question_text?: string | null;
  question?: string | null;
  text?: string | null;
  cloudinary_public_id?: string | null;
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

function getQuestionImageIdentifier(row: RiasecQuestionRow) {
  return row.cloudinary_public_id || row.image_path || null;
}

function mapQuestionRow(row: RiasecQuestionRow): RiasecQuestion | null {
  const category = normalizeCategory(row.category || row.riasec_category || row.riasec_code);
  const prompt = row.prompt || row.question_text || row.question || row.text;
  const imageIdentifier = getQuestionImageIdentifier(row);
  const resolvedImageUrl = buildCloudinaryImageUrl(imageIdentifier, {
    width: 1400,
    height: 1200,
    crop: 'fill',
    gravity: 'auto',
  });

  if (!category || !prompt) return null;

  if (import.meta.env.DEV && imageIdentifier) {
    console.info('[RIASEC] Question image resolution', {
      display_order: row.display_order || null,
      prompt,
      image_path: row.image_path || null,
      cloudinary_public_id: row.cloudinary_public_id || null,
      resolvedImageSrc: resolvedImageUrl,
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || null,
    });
  }

  return {
    id: String(row.id),
    category,
    prompt,
    displayOrder: row.display_order || null,
    imagePublicId: imageIdentifier,
    imagePath: imageIdentifier,
    imageUrl: resolvedImageUrl,
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
