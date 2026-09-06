import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ExtractedDocument } from "./textExtraction.service";

export interface StoredUploadRecord {
  id: string;
  type: "syllabus" | "exam";
  filename: string;
  savedPath: string;
  courseCode?: string;
  courseName?: string;
  examTitle?: string;
  totalMarks?: number;
  userId?: string;
  userEmail?: string;
  uploadedAt: string;
  rawText: string;
  textLength: number;
  wordCount: number;
  pageCount?: number;
}

// In-memory registry for quick access across API calls
const uploadStore = new Map<string, StoredUploadRecord>();

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

async function ensureUploadDirs() {
  await fs.mkdir(path.join(UPLOAD_ROOT, "syllabi"), { recursive: true });
  await fs.mkdir(path.join(UPLOAD_ROOT, "exams"), { recursive: true });
}

export async function saveUploadedDocument(params: {
  type: "syllabus" | "exam";
  extracted: ExtractedDocument;
  buffer: Buffer;
  userId?: string;
  userEmail?: string;
  courseCode?: string;
  courseName?: string;
  examTitle?: string;
  totalMarks?: number;
}): Promise<StoredUploadRecord> {
  await ensureUploadDirs();

  const id = randomUUID();
  const subDir = params.type === "syllabus" ? "syllabi" : "exams";
  const safeFilename = `${id}-${path.basename(params.extracted.filename)}`;
  const diskPath = path.join(UPLOAD_ROOT, subDir, safeFilename);

  // Write file buffer to disk
  await fs.writeFile(diskPath, params.buffer);

  const record: StoredUploadRecord = {
    id,
    type: params.type,
    filename: params.extracted.filename,
    savedPath: diskPath,
    courseCode: params.courseCode,
    courseName: params.courseName,
    examTitle: params.examTitle,
    totalMarks: params.totalMarks,
    userId: params.userId,
    userEmail: params.userEmail,
    uploadedAt: new Date().toISOString(),
    rawText: params.extracted.rawText,
    textLength: params.extracted.characterCount,
    wordCount: params.extracted.wordCount,
    pageCount: params.extracted.pageCount,
  };

  uploadStore.set(id, record);
  return record;
}

export function getUploadRecord(id: string): StoredUploadRecord | undefined {
  return uploadStore.get(id);
}

export function listUploadRecords(type?: "syllabus" | "exam"): StoredUploadRecord[] {
  const records = Array.from(uploadStore.values());
  if (type) {
    return records.filter((r) => r.type === type);
  }
  return records;
}
