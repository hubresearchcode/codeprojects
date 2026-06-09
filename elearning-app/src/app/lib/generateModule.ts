import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Flashcard {
  front: string;
  back: string;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface GeneratedSection {
  id: string;
  title: string;
  evidenceBadge?: string;
  content: string;
  keyPoints: string[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export interface GeneratedModule {
  title: string;
  description: string;
  tags: string[];
  sections: GeneratedSection[];
}

const PROMPT = (text: string) => `You are an expert educational content designer for university students.
Transform the following academic text into a structured, interactive learning module.
Return ONLY a valid JSON object — no markdown fences, no preamble, no explanation.

{
  "title": "concise title (≤8 words)",
  "description": "2–3 sentences describing what students will learn",
  "tags": ["tag1", "tag2", "tag3"],
  "sections": [
    {
      "id": "lowercase-hyphenated-slug",
      "title": "Section Title",
      "evidenceBadge": "e.g. Strong Evidence | Core Concept | Key Theory (optional)",
      "content": "3–4 sentence explanatory paragraph in clear academic prose",
      "keyPoints": ["concise point 1", "concise point 2", "concise point 3"],
      "flashcards": [
        { "front": "question or term (≤15 words)", "back": "full answer or definition" }
      ],
      "quiz": [
        {
          "q": "question text",
          "options": ["option A", "option B", "option C", "option D"],
          "correct": 0,
          "explanation": "why the correct answer is right"
        }
      ]
    }
  ]
}

Rules:
- Generate 5–7 sections covering the main topics
- Each section: 2–3 flashcards, 1–2 quiz questions
- "correct" is a 0-based index into "options"
- Extract only real information from the text — do not invent facts
- Write for Masters-level university students

Text:
${text.slice(0, 14000)}`;

export async function generateModuleFromText(
  text: string,
  apiKey: string
): Promise<GeneratedModule> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(PROMPT(text));
  const raw = result.response.text();
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned) as GeneratedModule;
}
