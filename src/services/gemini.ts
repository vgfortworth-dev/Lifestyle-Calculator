import { supabase } from '../lib/supabase';

export interface CareerSuggestion {
  title: string;
  description: string;
  education: string;
  avgSalary: string;
  growth: string;
}

function isCareerSuggestion(value: unknown): value is CareerSuggestion {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<CareerSuggestion>;
  return (
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.education === 'string' &&
    typeof candidate.avgSalary === 'string' &&
    typeof candidate.growth === 'string'
  );
}

export async function getCareerSuggestions(salary: number, region: string): Promise<CareerSuggestion[]> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;
    if (!accessToken) {
      throw new Error('Authentication required for career suggestions.');
    }

    const response = await fetch('/api/gemini-career-match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        salary,
        region,
      }),
    });

    if (!response.ok) {
      throw new Error(`Career match request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const suggestions = Array.isArray(payload?.suggestions) ? payload.suggestions : [];
    return suggestions.filter(isCareerSuggestion);
  } catch (error) {
    console.error('Error fetching career suggestions:', error);
    return [];
  }
}
