import { supabase } from './supabase';
import { RiasecCategory, RiasecQuestion } from '../types/riasec';
import { buildCloudinaryImageUrl } from './cloudinary';

const RIASEC_CATEGORIES: RiasecCategory[] = ['R', 'I', 'A', 'S', 'E', 'C'];
const RIASEC_TABLE = 'riasec_questions';
const RIASEC_SELECT_COLUMNS = 'id,prompt,category,display_order,image_path,alt_text,is_active,cloudinary_public_id';
const REQUIRED_RIASEC_QUESTION_COUNT = 30;

type RiasecQuestionRow = {
  id: string | number;
  category?: string | null;
  display_order?: number | null;
  prompt?: string | null;
  cloudinary_public_id?: string | null;
  image_path?: string | null;
  image_url?: string | null;
  alt_text?: string | null;
  is_active?: boolean | null;
};

type RiasecQueryError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
} | null;

function logRiasecQueryDiagnostic({
  table,
  error,
  questionCount,
}: {
  table: string;
  error?: RiasecQueryError;
  questionCount?: number | null;
}) {
  const payload = {
    table,
    errorCode: error?.code || null,
    errorMessage: error?.message || null,
    errorDetails: error?.details || null,
    errorHint: error?.hint || null,
    questionCount: questionCount ?? null,
  };

  if (!import.meta.env.DEV) {
    return;
  }

  if (error) {
    console.error('[RIASEC] Supabase diagnostic', payload);
    return;
  }

  console.info('[RIASEC] Supabase diagnostic', payload);
}

function isRiasecCategory(value: string): value is RiasecCategory {
  return RIASEC_CATEGORIES.includes(value as RiasecCategory);
}

function normalizeCategory(value: string | null | undefined): RiasecCategory | null {
  const normalized = String(value || '').trim().toUpperCase();
  return isRiasecCategory(normalized) ? normalized : null;
}

function getQuestionImageIdentifier(row: RiasecQuestionRow) {
  return row.cloudinary_public_id || row.image_url || row.image_path || null;
}

function resolveQuestionImageUrl(row: RiasecQuestionRow) {
  if (row.cloudinary_public_id) {
    return buildCloudinaryImageUrl(row.cloudinary_public_id, {
      width: 1400,
      height: 1200,
      crop: 'fill',
      gravity: 'auto',
    });
  }

  const imageUrl = row.image_url?.trim();
  if (imageUrl) {
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    if (imageUrl.startsWith('/')) return imageUrl;
    return buildCloudinaryImageUrl(imageUrl, {
      width: 1400,
      height: 1200,
      crop: 'fill',
      gravity: 'auto',
    });
  }

  const imagePath = row.image_path?.trim();
  if (!imagePath) return null;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  if (imagePath.startsWith('/')) return imagePath;

  return buildCloudinaryImageUrl(imagePath, {
    width: 1400,
    height: 1200,
    crop: 'fill',
    gravity: 'auto',
  });
}

function mapQuestionRow(row: RiasecQuestionRow): RiasecQuestion | null {
  const category = normalizeCategory(row.category);
  const prompt = row.prompt?.trim();
  const imageIdentifier = getQuestionImageIdentifier(row);
  const resolvedImageUrl = resolveQuestionImageUrl(row);
  const displayOrder = row.display_order ?? null;

  if (!category || !prompt) return null;

  if (import.meta.env.DEV && imageIdentifier) {
    console.info('[RIASEC] Question image resolution', {
      display_order: displayOrder,
      prompt,
      image_url: row.image_url || null,
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
    displayOrder,
    imagePublicId: row.cloudinary_public_id || null,
    imagePath: row.image_path || row.image_url || null,
    imageUrl: resolvedImageUrl,
    altText: row.alt_text || null,
  };
}

async function queryRiasecQuestions() {
  return supabase
    .from(RIASEC_TABLE)
    .select(RIASEC_SELECT_COLUMNS)
    .eq('is_active', true)
    .order('display_order', { ascending: true });
}

export async function loadRiasecQuestions(): Promise<{ questions: RiasecQuestion[]; source: 'supabase' | 'unavailable' }> {
  try {
    const { data, error } = await queryRiasecQuestions();

    if (error) {
      logRiasecQueryDiagnostic({
        table: RIASEC_TABLE,
        error,
      });
      return { questions: [], source: 'unavailable' };
    }

    const questions = (data || [])
      .map((row) => mapQuestionRow(row as RiasecQuestionRow))
      .filter((question): question is RiasecQuestion => question !== null)
      .sort((a, b) => (a.displayOrder ?? Number.MAX_SAFE_INTEGER) - (b.displayOrder ?? Number.MAX_SAFE_INTEGER));

    if (import.meta.env.DEV) {
      console.info(`[RIASEC] Loaded ${questions.length} active question(s) from Supabase.`);
    }
    logRiasecQueryDiagnostic({
      table: RIASEC_TABLE,
      questionCount: questions.length,
    });

    if (questions.length !== REQUIRED_RIASEC_QUESTION_COUNT) {
      return { questions: [], source: 'unavailable' };
    }

    return { questions, source: 'supabase' };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[RIASEC] Unexpected question loading failure.', error);
    }
    return { questions: [], source: 'unavailable' };
  }
}
