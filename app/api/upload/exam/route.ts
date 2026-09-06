import { NextRequest, NextResponse } from "next/server";
import { extractTextFromBuffer, isSupportedFileType } from "@/lib/services/textExtraction.service";
import { persistAssessmentUpload } from "@/lib/services/assessmentPersistence.service";
import { getCurrentUser } from "@/lib/supabase/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Sign in before uploading an exam." }, { status: 401 });
    if (user.role === "reviewer") return NextResponse.json({ success: false, error: "External Examiners have read-only access." }, { status: 403 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const examTitle = (formData.get("examTitle") as string) || undefined;
    const courseCode = (formData.get("courseCode") as string) || undefined;
    const rawTotalMarks = formData.get("totalMarks") as string | null;
    const totalMarks = rawTotalMarks ? parseInt(rawTotalMarks, 10) : undefined;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded. Please provide an exam document under the 'file' field." },
        { status: 400 }
      );
    }

    if (!isSupportedFileType(file.name, file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file format. Uploaded file '${file.name}' must be a PDF or plain text document (.pdf, .txt, .md).`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extracted = await extractTextFromBuffer(buffer, file.name, file.type);

    const record = await persistAssessmentUpload({
      type: "exam",
      userId: user.id,
      userEmail: user.email,
      filename: extracted.filename,
      rawText: extracted.rawText,
      textLength: extracted.characterCount,
      wordCount: extracted.wordCount,
      pageCount: extracted.pageCount,
      courseCode,
      examTitle,
      totalMarks: Number.isNaN(totalMarks) ? undefined : totalMarks,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Exam paper uploaded and parsed successfully",
        data: {
          id: record.id,
          type: record.type,
          filename: record.filename,
          examTitle: record.examTitle,
          courseCode: record.courseCode,
          totalMarks: record.totalMarks,
          textLength: record.textLength,
          wordCount: record.wordCount,
          pageCount: record.pageCount,
          uploadedAt: record.uploadedAt,
          rawTextPreview: record.rawText.slice(0, 500) + (record.rawText.length > 500 ? "..." : ""),
          rawText: record.rawText,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error processing exam upload:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
