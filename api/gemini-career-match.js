import { GoogleGenAI, Type } from '@google/genai';

const MAX_BODY_SIZE = 4096;
const MAX_REGION_LENGTH = 120;

function sendJson(res, statusCode, body) {
  res.status(statusCode).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function validatePayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Invalid request body.';
  }

  const allowedKeys = ['salary', 'region'];
  const bodyKeys = Object.keys(body);
  const hasUnexpectedKeys = bodyKeys.some((key) => !allowedKeys.includes(key));
  if (hasUnexpectedKeys) {
    return 'Unexpected request fields.';
  }

  const salary = body.salary;
  const region = body.region;

  if (!Number.isFinite(salary) || salary <= 0 || salary > 1000000) {
    return 'Invalid salary.';
  }

  if (typeof region !== 'string') {
    return 'Invalid region.';
  }

  const trimmedRegion = region.trim();
  if (!trimmedRegion || trimmedRegion.length > MAX_REGION_LENGTH) {
    return 'Invalid region.';
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  const rawBodySize = Buffer.byteLength(JSON.stringify(req.body || {}), 'utf8');
  if (rawBodySize > MAX_BODY_SIZE) {
    return sendJson(res, 413, { error: 'Request too large.' });
  }

  const validationError = validatePayload(req.body);
  if (validationError) {
    return sendJson(res, 400, { error: 'Invalid request.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[GeminiCareerMatch] Missing GEMINI_API_KEY.');
    return sendJson(res, 500, { error: 'Career suggestions are temporarily unavailable.' });
  }

  const salary = Math.round(req.body.salary);
  const region = req.body.region.trim();

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest 5 high-demand careers in the ${region} region of Texas that typically pay an annual salary around $${salary.toLocaleString()}. Focus on careers suitable for someone planning their future lifestyle. Provide the response in a structured JSON format.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Job title' },
              description: { type: Type.STRING, description: 'Brief description of the role' },
              education: { type: Type.STRING, description: 'Typical education required (e.g., Bachelor\'s, Trade School)' },
              avgSalary: { type: Type.STRING, description: 'Typical salary range in Texas' },
              growth: { type: Type.STRING, description: 'Job growth outlook (e.g., High, Stable)' },
            },
            required: ['title', 'description', 'education', 'avgSalary', 'growth'],
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      console.error('[GeminiCareerMatch] Empty response from Gemini.');
      return sendJson(res, 502, { error: 'Career suggestions are temporarily unavailable.' });
    }

    const suggestions = JSON.parse(text);
    return sendJson(res, 200, { suggestions });
  } catch (error) {
    console.error('[GeminiCareerMatch] Request failed.', error instanceof Error ? error.message : error);
    return sendJson(res, 500, { error: 'Career suggestions are temporarily unavailable.' });
  }
}
