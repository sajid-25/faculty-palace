import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { callGroq } from "@/lib/ai/aiService";

export type HistoricalQuestion = {
  id: string;
  question_text: string;
  exam_year: number | null;
};

export type SimilarityResult = {
  questionId: string;
  previousCount: number;
  matches: Array<{
    matchedQuestionId: string;
    score: number;
    examYear: number | null;
    questionText: string;
  }>;
};

type ResolvedMatch = {
  matchedQuestionId: string;
  score: number;
  examYear: number | null;
  questionText: string;
};

type ModelComparison = {
  question_number: number;
  matches?: Array<{ historical_id: string; score: number; reason?: string }>;
};

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function tokens(text: string) {
  return new Set(normalize(text).split(" ").filter((token) => token.length > 2));
}

function similarity(left: string, right: string) {
  const normalizedLeft = normalize(left);
  const normalizedRight = normalize(right);
  if (normalizedLeft === normalizedRight) return 1;

  const leftTokens = tokens(left);
  const rightTokens = tokens(right);
  if (!leftTokens.size || !rightTokens.size) return 0;
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return intersection / union;
}

export async function findHistoricalSimilarities(
  questions: Array<{ id: string; question_text: string }>,
): Promise<SimilarityResult[]> {
  const supabase = createSupabaseAdminClient();
  const { data: historical, error } = await supabase
    .from("questions")
    .select("id, question_text, exam_year")
    .eq("source", "historical");
  if (error) throw error;

  const previousQuestions = (historical || []) as HistoricalQuestion[];
  const modelResult = await callGroq<{ comparisons?: ModelComparison[] }>(
    `Compare every new question against the complete historical question bank. Identify exact duplicates, paraphrases, or semantically similar questions. Return strict JSON: {"comparisons":[{"question_number":1,"matches":[{"historical_id":"id","score":0.91,"reason":"short explanation"}]}]}. Include only meaningful matches with score >= 0.35. Scores must be between 0 and 1. Do not compare a question with itself because the new questions are not in the historical bank.\n\nNEW QUESTIONS:\n${JSON.stringify(questions.map((question, index) => ({ question_number: index + 1, ...question })))}\n\nHISTORICAL QUESTION BANK:\n${JSON.stringify(previousQuestions)}`,
    {
      temperature: 0,
      systemPrompt: "You are a semantic question-similarity auditor. Compare wording, concepts, task requirements, and expected answer. Return valid JSON only.",
    },
  );
  const modelByNumber = new Map((modelResult.data.comparisons || []).map((comparison) => [comparison.question_number, comparison.matches || []]));
  const results: SimilarityResult[] = [];
  const matchesToInsert: Array<Record<string, unknown>> = [];

  for (const [questionIndex, question] of questions.entries()) {
    const matches = (modelByNumber.get(questionIndex + 1) || [])
      .map((modelMatch) => {
        const previous = previousQuestions.find((candidate) => candidate.id === modelMatch.historical_id);
        if (!previous) return null;
        const exactScore = similarity(question.question_text, previous.question_text);
        return {
          matchedQuestionId: previous.id,
          score: Number(Math.max(exactScore, Number(modelMatch.score) || 0).toFixed(5)),
          examYear: previous.exam_year,
          questionText: previous.question_text,
        };
      })
      .filter((match): match is ResolvedMatch => match !== null && match.score >= 0.35)
      .sort((left, right) => right.score - left.score);

    for (const match of matches) {
      matchesToInsert.push({
        question_id: question.id,
        matched_question_id: match.matchedQuestionId,
        similarity_score: match.score,
        is_flagged: match.score >= 0.75,
      });
    }

    results.push({ questionId: question.id, previousCount: matches.filter((match) => match.score >= 0.75).length, matches });
  }

  if (matchesToInsert.length) {
    const { error: insertError } = await supabase
      .from("similarity_matches")
      .upsert(matchesToInsert, { onConflict: "question_id,matched_question_id" });
    if (insertError) throw insertError;
  }

  return results;
}
