import { NextRequest, NextResponse } from "next/server";
import { getAnalysisRecord } from "@/lib/services/analysisStorage.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const analysis = getAnalysisRecord(id);
    if (!analysis) {
      return NextResponse.json(
        { success: false, error: `Analysis with ID '${id}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: analysis,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
