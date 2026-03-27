import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export interface CareerSuggestion {
  title: string;
  description: string;
  education: string;
  avgSalary: string;
  growth: string;
}

export async function getCareerSuggestions(salary: number, region: string): Promise<CareerSuggestion[]> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest 5 high-demand careers in the ${region} region of Texas that typically pay an annual salary around $${salary.toLocaleString()}. 
      Focus on careers suitable for someone planning their future lifestyle. 
      Provide the response in a structured JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Job title" },
              description: { type: Type.STRING, description: "Brief description of the role" },
              education: { type: Type.STRING, description: "Typical education required (e.g., Bachelor's, Trade School)" },
              avgSalary: { type: Type.STRING, description: "Typical salary range in Texas" },
              growth: { type: Type.STRING, description: "Job growth outlook (e.g., High, Stable)" }
            },
            required: ["title", "description", "education", "avgSalary", "growth"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching career suggestions:", error);
    return [];
  }
}
