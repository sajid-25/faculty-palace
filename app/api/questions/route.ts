import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Sign in to view the question bank." }, { status: 401 });

    const supabase = createSupabaseAdminClient();
    const { data: questions, error } = await supabase
      .from("questions")
      .select("id, exam_paper_id, question_number, question_text, marks, source, exam_year, question_analysis(topic_label, course_outcome_label, bloom_level, confidence), exam_papers!left(uploaded_by, title, source_year)")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const accessible = (questions || []).filter((question) => {
      const paper = Array.isArray(question.exam_papers) ? question.exam_papers[0] : question.exam_papers;
      return question.source === "historical" || question.source === "seed" || user.role !== "faculty" || paper?.uploaded_by === user.id;
    });

    return NextResponse.json({
      success: true,
      data: accessible.map((question) => {
        const analysis = Array.isArray(question.question_analysis) ? question.question_analysis[0] : question.question_analysis;
        const paper = Array.isArray(question.exam_papers) ? question.exam_papers[0] : question.exam_papers;
        return {
          id: question.id,
          number: String(question.question_number || "-").padStart(2, "0"),
          prompt: question.question_text,
          topic: analysis?.topic_label || "Unmapped",
          co: analysis?.course_outcome_label || "Unmapped",
          bloom: analysis?.bloom_level || "Unclassified",
          confidence: analysis?.confidence || null,
          marks: String(question.marks || 0).padStart(2, "0"),
          source: question.source,
          examYear: question.exam_year || paper?.source_year || null,
          examTitle: paper?.title || null,
        };
      }),
    });
  } catch (error) {
    console.error("Question bank lookup failed", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to load questions." }, { status: 500 });
  }
}
