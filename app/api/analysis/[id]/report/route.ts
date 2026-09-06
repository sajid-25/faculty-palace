import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Sign in to view this report." }, { status: 401 });
    const { id } = await params;
    const supabase = createSupabaseAdminClient();
    const { data: paper, error: paperError } = await supabase
      .from("exam_papers")
      .select("id, uploaded_by")
      .eq("id", id)
      .single();
    if (paperError || !paper) return NextResponse.json({ success: false, error: "Exam paper not found." }, { status: 404 });
    if (paper.uploaded_by !== user.id && user.role !== "admin" && user.role !== "reviewer") {
      return NextResponse.json({ success: false, error: "You cannot view this report." }, { status: 403 });
    }

    const { data: report, error } = await supabase
      .from("analysis_reports")
      .select("*")
      .eq("exam_paper_id", id)
      .single();
    if (error || !report) return NextResponse.json({ success: false, error: "Report is not ready." }, { status: 404 });
    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to load report." }, { status: 500 });
  }
}