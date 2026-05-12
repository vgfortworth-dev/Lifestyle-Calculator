import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const MAX_BODY_SIZE = 4096;
const MAX_REGION_LENGTH = 120;
const MAX_SALARY = 1_000_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const GEMINI_TIMEOUT_MS = 12_000;
const isProduction = process.env.NODE_ENV === 'production';

type CareerMatchRequest = {
  salary: number;
  region: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type VercelRequest = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  setHeader: (name: string, value: string) => void;
  end: (body?: string) => void;
};

const rateLimitStore = new Map<string, RateLimitEntry>();
let supabaseServerClient: ReturnType<typeof createClient> | null = null;

function sendJson(res: VercelResponse, statusCode: number, body: Record<string, unknown>) {
  res.status(statusCode).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function logDiagnostic(message: string, metadata?: Record<string, unknown>) {
  if (isProduction) {
    console.warn(`[CareerMatch] ${message}`);
    return;
  }

  if (metadata) {
    console.warn(`[CareerMatch] ${message}`, metadata);
    return;
  }

  console.warn(`[CareerMatch] ${message}`);
}

function isCareerMatchRequest(body: unknown): body is CareerMatchRequest {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;

  const bodyKeys = Object.keys(body);
  if (bodyKeys.some((key) => !['salary', 'region'].includes(key))) return false;

  const candidate = body as Partial<CareerMatchRequest>;
  if (!Number.isFinite(candidate.salary) || (candidate.salary ?? 0) <= 0 || (candidate.salary ?? 0) > MAX_SALARY) {
    return false;
  }

  if (typeof candidate.region !== 'string') return false;

  const trimmedRegion = candidate.region.trim();
  return Boolean(trimmedRegion && trimmedRegion.length <= MAX_REGION_LENGTH);
}

function getSupabaseServerClient() {
  if (supabaseServerClient) return supabaseServerClient;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  supabaseServerClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseServerClient;
}

function getBearerToken(req: VercelRequest) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (typeof authHeader !== 'string') return null;

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;

  return token.trim();
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return true;
}

async function generateCareerSuggestions(payload: CareerMatchRequest, apiKey: string) {
  const ai = new GoogleGenAI({ apiKey });

  const responsePromise = ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest 5 high-demand careers in the ${payload.region} region of Texas that typically pay an annual salary around $${Math.round(payload.salary).toLocaleString()}. Focus on careers suitable for someone planning their future lifestyle. Provide the response in a structured JSON format.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Job title' },
            description: { type: Type.STRING, description: 'Brief description of the role' },
            education: { type: Type.STRING, description: "Typical education required (e.g., Bachelor's, Trade School)" },
            avgSalary: { type: Type.STRING, description: 'Typical salary range in Texas' },
            growth: { type: Type.STRING, description: 'Job growth outlook (e.g., High, Stable)' },
          },
          required: ['title', 'description', 'education', 'avgSalary', 'growth'],
        },
      },
    },
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Career match request timed out.')), GEMINI_TIMEOUT_MS);
  });

  const response = await Promise.race([responsePromise, timeoutPromise]);
  const text = response.text;
  if (!text) {
    throw new Error('Empty response from Gemini.');
  }

  return JSON.parse(text);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  const rawBodySize = Buffer.byteLength(JSON.stringify(req.body || {}), 'utf8');
  if (rawBodySize > MAX_BODY_SIZE) {
    return sendJson(res, 413, { error: 'Request too large.' });
  }

  if (!isCareerMatchRequest(req.body)) {
    return sendJson(res, 400, { error: 'Invalid request.' });
  }

  const accessToken = getBearerToken(req);
  if (!accessToken) {
    return sendJson(res, 401, { error: 'Authentication required.' });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    logDiagnostic('Supabase auth configuration is missing.');
    return sendJson(res, 500, { error: 'Career suggestions are temporarily unavailable.' });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(accessToken);

  if (authError || !user?.id) {
    return sendJson(res, 401, { error: 'Authentication required.' });
  }

  const forwardedFor = typeof req.headers?.['x-forwarded-for'] === 'string' ? req.headers['x-forwarded-for'] : '';
  const clientIp = forwardedFor.split(',')[0]?.trim() || 'unknown';
  const rateLimitKey = `${user.id}:${clientIp}`;
  if (!checkRateLimit(rateLimitKey)) {
    return sendJson(res, 429, { error: 'Too many requests. Please try again later.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logDiagnostic('Missing GEMINI_API_KEY.');
    return sendJson(res, 500, { error: 'Career suggestions are temporarily unavailable.' });
  }

  try {
    const payload: CareerMatchRequest = {
      salary: Math.round(req.body.salary),
      region: req.body.region.trim(),
    };

    const suggestions = await generateCareerSuggestions(payload, apiKey);
    return sendJson(res, 200, { suggestions });
  } catch (error) {
    logDiagnostic(
      'Request failed.',
      error instanceof Error ? { message: error.message } : undefined
    );
    return sendJson(res, 500, { error: 'Career suggestions are temporarily unavailable.' });
  }
}
