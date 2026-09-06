import { callGroq } from "@/lib/ai/aiService";
import {
  buildQuestionParserSystemPrompt,
  buildQuestionParserUserPrompt,
} from "@/lib/ai/promptTemplates/questionParser.prompt";

export interface ParsedQuestion {
  id?: string;
  question_number: number | string;
  question_text: string;
  marks: number;
}

export interface ParseExamResult {
  totalExamMarks: number;
  questionCount: number;
  questions: ParsedQuestion[];
  telemetry: {
    model: string;
    latencyMs: number;
    totalTokens: number;
  };
}

interface RawParserResponse {
  totalExamMarks?: number;
  questionCount?: number;
  questions?: Array<{
    question_number?: number | string;
    question?: string;
    question_text?: string;
    marks?: number | string;
  }>;
}

/**
 * Parses raw exam text into a structured list of questions with marks.
 */
export async function parseExamQuestions(rawExamText: string): Promise<ParseExamResult> {
  const trimmed = (rawExamText || "").trim();

  if (!trimmed || trimmed.length < 15) {
    throw new Error(
      "Exam document is empty or contains insufficient text to parse questions. Please ensure the document contains readable examination content."
    );
  }

  const systemPrompt = buildQuestionParserSystemPrompt();
  const userPrompt = buildQuestionParserUserPrompt({ rawExamText: trimmed });

  const aiResult = await callGroq<RawParserResponse>(userPrompt, {
    systemPrompt,
    temperature: 0.1,
  });

  const parsedData = aiResult.data;
  const rawQuestions = parsedData?.questions || [];

  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    throw new Error(
      "The AI model could not identify any examination questions in the provided text. The document may be garbled, unformatted, or missing actual questions."
    );
  }

  const cleanedQuestions: ParsedQuestion[] = rawQuestions.map((q, idx) => {
    const text = (q.question_text || q.question || "").trim();
    const rawMarks = q.marks !== undefined ? Number(q.marks) : 0;
    const marks = Number.isFinite(rawMarks) && rawMarks >= 0 ? rawMarks : 0;
    const qNum = q.question_number !== undefined ? q.question_number : idx + 1;

    return {
      question_number: qNum,
      question_text: text || `Question ${qNum}`,
      marks,
    };
  });

  const calculatedTotalMarks = cleanedQuestions.reduce((sum, q) => sum + q.marks, 0);
  const totalExamMarks =
    typeof parsedData.totalExamMarks === "number" && parsedData.totalExamMarks > 0
      ? parsedData.totalExamMarks
      : calculatedTotalMarks;

  return {
    totalExamMarks,
    questionCount: cleanedQuestions.length,
    questions: cleanedQuestions,
    telemetry: {
      model: aiResult.telemetry.model,
      latencyMs: aiResult.telemetry.latencyMs,
      totalTokens: aiResult.telemetry.totalTokens,
    },
  };
}
