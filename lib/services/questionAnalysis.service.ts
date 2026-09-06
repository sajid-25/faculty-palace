import { callGroq } from "@/lib/ai/aiService";
import type { ParsedQuestion } from "./questionParser.service";

export type AnalysisReference = {
  topics: Array<{ id: string; topic: string; description?: string | null }>;
  outcomes: Array<{ id: string; code: string; description: string }>;
};

export type QuestionClassification = {
  question_number: number;
  topic: string;
  course_outcome: string;
  bloom_level: "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create";
  confidence: number;
  reasoning: string;
};

type ClassificationResponse = { analyses?: QuestionClassification[] };

export async function classifyQuestions(questions: ParsedQuestion[], reference: AnalysisReference) {
  const result = await callGroq<ClassificationResponse>(
    `Classify every exam question using only the supplied topic and course outcome options. Return strict JSON with this shape: {"analyses":[{"question_number":1,"topic":"exact topic name","course_outcome":"CO1","bloom_level":"Apply","confidence":0.92,"reasoning":"short explanation"}]}. Do not omit a question. If a question does not fit perfectly, choose the closest option and explain why.\n\nTOPICS:\n${JSON.stringify(reference.topics)}\n\nCOURSE OUTCOMES:\n${JSON.stringify(reference.outcomes)}\n\nQUESTIONS:\n${JSON.stringify(questions)}`,
    {
      temperature: 0,
      systemPrompt: "You are an academic assessment auditor. Use only the provided reference options and return valid JSON.",
    },
  );

  const byNumber = new Map((result.data.analyses || []).map((analysis) => [Number(analysis.question_number), analysis]));
  const validBlooms = new Set(["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]);
  const validTopics = new Set(reference.topics.map((topic) => topic.topic));
  const validOutcomes = new Set(reference.outcomes.map((outcome) => outcome.code));

  return questions.map((question) => {
    const analysis = byNumber.get(question.question_number);
    if (!analysis) throw new Error(`AI did not classify question ${question.question_number}.`);
    return {
      question_id_number: question.question_number,
      topic: validTopics.has(analysis.topic) ? analysis.topic : reference.topics[0]?.topic || "Uncategorized",
      course_outcome: validOutcomes.has(analysis.course_outcome) ? analysis.course_outcome : reference.outcomes[0]?.code || "CO1",
      bloom_level: validBlooms.has(analysis.bloom_level) ? analysis.bloom_level : "Understand",
      confidence: Math.min(1, Math.max(0, Number(analysis.confidence) || 0)),
      reasoning: analysis.reasoning || "Classification based on the question wording and supplied course references.",
    };
  });
}