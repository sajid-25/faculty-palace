import { NextRequest, NextResponse } from "next/server";
import { extractTextFromBuffer, isSupportedFileType } from "@/lib/services/textExtraction.service";
import { saveUploadedDocument } from "@/lib/services/uploadStorage.service";
import { getCurrentUser } from "@/lib/supabase/auth";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const courseCode = (formData.get("courseCode") as string) || undefined;
    const courseName = (formData.get("courseName") as string) || undefined;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded. Please provide a syllabus document under the 'file' field." },
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
    const user = await getCurrentUser().catch(() => null);

    const record = await saveUploadedDocument({
      type: "syllabus",
      extracted,
      buffer,
      userId: user?.id,
      userEmail: user?.email,
      courseCode,
      courseName,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Syllabus uploaded and parsed successfully",
        data: {
          id: record.id,
          type: record.type,
          filename: record.filename,
          courseCode: record.courseCode,
          courseName: record.courseName,
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
    console.error("Error processing syllabus upload:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
