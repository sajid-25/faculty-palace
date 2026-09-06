import { callGroq } from "@/lib/ai/aiService";

export type ParsedQuestion = {
  question_number: number;
  question_text: string;
  marks: number;
};

type ParserResponse = {
  questions?: Array<{
    question_number?: number | string;
    question?: string;
    question_text?: string;
    marks?: number | string;
  }>;
};

export async function parseExamQuestions(rawExamText: string) {
  if (!rawExamText.trim()) throw new Error("The uploaded exam contains no readable text.");

  const result = await callGroq<ParserResponse>(
    `Extract every numbered question from this exam text. Return only JSON with this shape: {"questions":[{"question_number":1,"question_text":"...","marks":5}]}. Preserve subparts inside the parent question. If marks are not shown, use 0.\n\nEXAM TEXT:\n${rawExamText}`,
    {
      temperature: 0,
      systemPrompt: "You are an exam question parser. Return strict JSON only. Do not invent questions or marks.",
    },
  );

  const questions = (result.data.questions || []).map((question, index) => ({
    question_number: Number(question.question_number) || index + 1,
    question_text: String(question.question_text || question.question || "").trim(),
    marks: Math.max(0, Number(question.marks) || 0),
  })).filter((question) => question.question_text.length > 0);

  if (!questions.length) throw new Error("No questions could be identified in the uploaded exam.");

  return {
    questions,
    questionCount: questions.length,
    totalMarks: questions.reduce((total, question) => total + question.marks, 0),
    telemetry: result.telemetry,
  };
}
