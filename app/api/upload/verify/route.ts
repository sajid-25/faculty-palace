import { NextRequest, NextResponse } from "next/server";
import { getUploadRecord, listUploadRecords } from "@/lib/services/uploadStorage.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") as "syllabus" | "exam" | null;

    if (id) {
      const record = getUploadRecord(id);
      if (!record) {
        return NextResponse.json(
          { success: false, error: `No upload record found with ID '${id}'` },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record }, { status: 200 });
    }

    const records = listUploadRecords(type || undefined);
    return NextResponse.json(
      {
        success: true,
        count: records.length,
        data: records.map((r) => ({
          id: r.id,
          type: r.type,
          filename: r.filename,
          courseCode: r.courseCode,
          courseName: r.courseName,
          examTitle: r.examTitle,
          textLength: r.textLength,
          wordCount: r.wordCount,
          uploadedAt: r.uploadedAt,
        })),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
