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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
}

function extractKeyTerms(text: string): { term: string; context: string }[] {
  const terms: { term: string; context: string }[] = [];
  const seen = new Set<string>();

  const definitionPatterns = [
    /(?:^|\.\s+)([A-Z][a-zA-Z\s]{2,40}?)(?:\s+is\s+|\s+are\s+|\s+refers?\s+to\s+|\s+means?\s+|\s+can\s+be\s+defined\s+as\s+)([^.]+\.)/g,
    /(?:^|\.\s+)([A-Z][a-zA-Z\s]{2,40}?)(?:\s*[-:]\s*)([^.]{20,}\.)/g,
    /(?:^|\.\s+)([A-Z][a-zA-Z\s]{2,40}?)\s*\(([^)]{15,})\)/g,
  ];

  for (const pattern of definitionPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const term = match[1].trim();
      const context = match[2].trim();
      const key = term.toLowerCase();
      if (!seen.has(key) && term.length > 3 && term.length < 50 && context.length > 15) {
        seen.add(key);
        terms.push({ term, context });
      }
    }
  }

  return terms;
}

function detectSectionBreaks(text: string): { title: string; body: string }[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const sections: { title: string; body: string }[] = [];
  let currentTitle = "";
  let currentBody: string[] = [];

  const isHeading = (line: string): boolean => {
    if (line.length > 100 || line.length < 3) return false;
    if (/^\d+[\.\)]\s+[A-Z]/.test(line) && line.length < 80) return true;
    if (/^[A-Z][A-Z\s:&,-]{4,}$/.test(line)) return true;
    if (/^(?:Chapter|Section|Part|Module|Unit|Topic|Lesson)\s+\d/i.test(line)) return true;
    if (/^#{1,4}\s+/.test(line)) return true;
    if (line.endsWith(":") && line.length < 60 && !line.includes(".")) return true;
    return false;
  };

  for (const line of lines) {
    if (isHeading(line)) {
      if (currentBody.length > 0) {
        sections.push({
          title: currentTitle || `Section ${sections.length + 1}`,
          body: currentBody.join(" "),
        });
      }
      currentTitle = line.replace(/^#+\s+/, "").replace(/^[\d.]+\s+/, "").replace(/:$/, "").trim();
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }

  if (currentBody.length > 0) {
    sections.push({
      title: currentTitle || `Section ${sections.length + 1}`,
      body: currentBody.join(" "),
    });
  }

  return sections;
}

function splitByParagraphs(text: string, targetCount: number): { title: string; body: string }[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 40);

  if (paragraphs.length <= 1) {
    const sentences = splitIntoSentences(text);
    const chunkSize = Math.max(3, Math.ceil(sentences.length / targetCount));
    const sections: { title: string; body: string }[] = [];
    for (let i = 0; i < sentences.length; i += chunkSize) {
      const chunk = sentences.slice(i, i + chunkSize);
      const body = chunk.join(" ");
      const firstWords = chunk[0].split(/\s+/).slice(0, 5).join(" ");
      sections.push({ title: firstWords, body });
    }
    return sections;
  }

  const chunkSize = Math.max(1, Math.ceil(paragraphs.length / targetCount));
  const sections: { title: string; body: string }[] = [];
  for (let i = 0; i < paragraphs.length; i += chunkSize) {
    const chunk = paragraphs.slice(i, i + chunkSize);
    const body = chunk.join(" ");
    const firstSentence = splitIntoSentences(chunk[0])[0] || chunk[0];
    const titleWords = firstSentence.split(/\s+/).slice(0, 6).join(" ");
    sections.push({ title: titleWords, body });
  }
  return sections;
}

function generateFlashcardsForSection(body: string): Flashcard[] {
  const cards: Flashcard[] = [];
  const sentences = splitIntoSentences(body);

  const terms = extractKeyTerms(body);
  for (const { term, context } of terms.slice(0, 2)) {
    cards.push({
      front: `What is ${term}?`,
      back: context,
    });
  }

  if (cards.length < 2 && sentences.length >= 2) {
    for (const sentence of sentences.slice(0, 3 - cards.length)) {
      if (sentence.length > 30 && sentence.length < 300) {
        const words = sentence.split(/\s+/);
        if (words.length >= 6) {
          const keyPhrase = words.slice(0, Math.min(8, Math.ceil(words.length / 2))).join(" ");
          cards.push({
            front: `What is significant about: ${keyPhrase}...?`,
            back: sentence,
          });
        }
      }
    }
  }

  return cards.slice(0, 3);
}

function generateQuizForSection(body: string, sectionTitle: string): QuizQuestion[] {
  const sentences = splitIntoSentences(body);
  if (sentences.length < 2) return [];

  const questions: QuizQuestion[] = [];

  const keySentence = sentences.find((s) => s.length > 40 && s.length < 250) || sentences[0];
  const words = keySentence.split(/\s+/);

  if (words.length >= 8) {
    const correctAnswer = keySentence;
    const distractors = generateDistractors(keySentence, sentences);

    if (distractors.length >= 2) {
      const options = [correctAnswer, ...distractors.slice(0, 3)];
      const shuffled = shuffleWithCorrectTracking(options);

      questions.push({
        q: `Which of the following best describes a key point from "${sectionTitle}"?`,
        options: shuffled.options,
        correct: shuffled.correctIndex,
        explanation: `The correct answer captures the key idea: ${correctAnswer.slice(0, 120)}...`,
      });
    }
  }

  if (sentences.length >= 3 && questions.length === 0) {
    const factSentence = sentences[Math.min(1, sentences.length - 1)];
    questions.push({
      q: `True or false: ${factSentence}`,
      options: ["True", "False", "Partially true, but missing key context", "Not addressed in the content"],
      correct: 0,
      explanation: `This statement comes directly from the source material in the section on ${sectionTitle}.`,
    });
  }

  return questions.slice(0, 2);
}

function generateDistractors(correct: string, allSentences: string[]): string[] {
  const distractors: string[] = [];
  const correctLower = correct.toLowerCase();

  for (const s of allSentences) {
    if (s.toLowerCase() !== correctLower && s.length > 30 && s.length < 250) {
      distractors.push(s);
      if (distractors.length >= 3) break;
    }
  }

  while (distractors.length < 3) {
    distractors.push(`This point is not supported by the content in this section.`);
  }

  return distractors.slice(0, 3);
}

function shuffleWithCorrectTracking(options: string[]): { options: string[]; correctIndex: number } {
  const indexed = options.map((opt, i) => ({ opt, isCorrect: i === 0 }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  return {
    options: indexed.map((x) => x.opt),
    correctIndex: indexed.findIndex((x) => x.isCorrect),
  };
}

function extractTags(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const freq = new Map<string, number>();
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "and", "but", "or", "nor",
    "not", "no", "so", "if", "then", "than", "that", "this", "these",
    "those", "it", "its", "of", "in", "to", "for", "with", "on", "at",
    "by", "from", "as", "into", "through", "during", "before", "after",
    "above", "below", "between", "out", "off", "over", "under", "again",
    "further", "once", "here", "there", "when", "where", "why", "how",
    "all", "each", "every", "both", "few", "more", "most", "other",
    "some", "such", "only", "own", "same", "also", "very", "just",
    "about", "up", "they", "them", "their", "we", "our", "you", "your",
    "he", "she", "his", "her", "which", "who", "whom", "what",
  ]);

  for (const word of words) {
    const clean = word.replace(/[^a-z]/g, "");
    if (clean.length > 3 && !stopWords.has(clean)) {
      freq.set(clean, (freq.get(clean) || 0) + 1);
    }
  }

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
}

export async function generateModuleFromText(text: string): Promise<GeneratedModule> {
  const targetSections = 5;

  let rawSections = detectSectionBreaks(text);

  if (rawSections.length < 2 || (rawSections.length === 1 && rawSections[0].body.length > 200)) {
    rawSections = splitByParagraphs(text, targetSections);
  }

  if (rawSections.length > 8) {
    rawSections = rawSections.slice(0, 8);
  }

  const tags = extractTags(text);

  const firstSentences = splitIntoSentences(text).slice(0, 3);
  const description = firstSentences.length > 0
    ? firstSentences.slice(0, 2).join(" ")
    : "A study module generated from uploaded content.";

  const titleSource = rawSections[0]?.title || "Uploaded Content";
  const title = titleSource.length > 50 ? titleSource.slice(0, 47) + "..." : titleSource;

  const sections: GeneratedSection[] = rawSections.map((raw, i) => {
    const flashcards = generateFlashcardsForSection(raw.body);
    const quiz = generateQuizForSection(raw.body, raw.title);

    return {
      id: slugify(raw.title) || `section-${i + 1}`,
      title: raw.title,
      content: raw.body.length > 600 ? raw.body.slice(0, 597) + "..." : raw.body,
      keyPoints: splitIntoSentences(raw.body)
        .filter((s) => s.length > 20 && s.length < 200)
        .slice(0, 4),
      flashcards,
      quiz,
    };
  });

  return { title, description, tags, sections };
}
