import { randomUUID } from "node:crypto";
import { ParsedQuestion } from "./questionParser.service";

export interface AnalysisRecord {
  id: string;
  examPaperId?: string;
  syllabusId?: string;
  courseCode?: string;
  status: "pending" | "processing" | "completed" | "failed";
  currentStep: "parsing" | "mapping" | "classification" | "similarity" | "coverage" | "completed";
  progressPercent: number;
  totalMarks: number;
  questionCount: number;
  questions: Array<ParsedQuestion & { id: string; examPaperId?: string }>;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

const analysisStore = new Map<string, AnalysisRecord>();

export function createAnalysisRecord(params: {
  examPaperId?: string;
  syllabusId?: string;
  courseCode?: string;
}): AnalysisRecord {
  const id = randomUUID();
  const record: AnalysisRecord = {
    id,
    examPaperId: params.examPaperId,
    syllabusId: params.syllabusId,
    courseCode: params.courseCode,
    status: "processing",
    currentStep: "parsing",
    progressPercent: 15,
    totalMarks: 0,
    questionCount: 0,
    questions: [],
    startedAt: new Date().toISOString(),
  };

  analysisStore.set(id, record);
  return record;
}

export function updateAnalysisRecord(
  id: string,
  updates: Partial<AnalysisRecord>
): AnalysisRecord | undefined {
  const record = analysisStore.get(id);
  if (!record) return undefined;

  const updated: AnalysisRecord = {
    ...record,
    ...updates,
    questions: updates.questions || record.questions,
  };

  analysisStore.set(id, updated);
  return updated;
}

export function getAnalysisRecord(id: string): AnalysisRecord | undefined {
  return analysisStore.get(id);
}

export function listAnalysisRecords(): AnalysisRecord[] {
  return Array.from(analysisStore.values());
}
