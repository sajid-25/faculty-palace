import { NextRequest, NextResponse } from "next/server";
import { parseExamQuestions } from "@/lib/services/questionParser.service";
import { getUploadRecord } from "@/lib/services/uploadStorage.service";
import {
  createAnalysisRecord,
  updateAnalysisRecord,
} from "@/lib/services/analysisStorage.service";
import { randomUUID } from "node:crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      examPaperId,
      syllabusId,
      courseCode,
      rawExamText: customExamText,
    } = body;

    let examText = customExamText;

    if (!examText && examPaperId) {
      const examRecord = getUploadRecord(examPaperId);
      if (examRecord) {
        examText = examRecord.rawText;
      }
    }

    if (!examText || typeof examText !== "string") {
      return NextResponse.json(
        {
          success: false,
          error:
            "No exam content provided. Please provide either an 'examPaperId' from an uploaded exam or 'rawExamText'.",
        },
        { status: 400 }
      );
    }

    // Initialize analysis record
    const analysis = createAnalysisRecord({
      examPaperId,
      syllabusId,
      courseCode,
    });

    // Run Step 1: Question Parsing
    try {
      const parsedResult = await parseExamQuestions(examText);

      const storedQuestions = parsedResult.questions.map((q) => ({
        ...q,
        id: randomUUID(),
        examPaperId: examPaperId || undefined,
      }));

      const updated = updateAnalysisRecord(analysis.id, {
        status: "processing",
        currentStep: "parsing",
        progressPercent: 25,
        totalMarks: parsedResult.totalExamMarks,
        questionCount: parsedResult.questionCount,
        questions: storedQuestions,
      });

      return NextResponse.json(
        {
          success: true,
          message: `Successfully segmented ${parsedResult.questionCount} questions from the exam paper.`,
          analysisId: analysis.id,
          step: "parsing",
          data: {
            totalExamMarks: parsedResult.totalExamMarks,
            questionCount: parsedResult.questionCount,
            questions: storedQuestions,
            telemetry: parsedResult.telemetry,
          },
        },
        { status: 200 }
      );
    } catch (parseError: unknown) {
      const message =
        parseError instanceof Error
          ? parseError.message
          : "Failed to parse questions from exam";

      updateAnalysisRecord(analysis.id, {
        status: "failed",
        error: message,
      });

      return NextResponse.json(
        {
          success: false,
          analysisId: analysis.id,
          error: message,
        },
        { status: 422 }
      );
    }
  } catch (error: unknown) {
    console.error("Error in POST /api/analysis/start:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
