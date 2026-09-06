import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type PersistedUpload = {
  id?: string;
  type: "syllabus" | "exam";
  filename: string;
  rawText: string;
  userId: string;
  userEmail: string;
  courseCode?: string;
  courseName?: string;
  examTitle?: string;
  totalMarks?: number;
  textLength: number;
  wordCount: number;
  pageCount?: number;
};

export async function persistAssessmentUpload(upload: PersistedUpload) {
  const supabase = createSupabaseAdminClient();
  const courseCode = upload.courseCode || "CSE-NETWORKS";
  const courseName = upload.courseName || "Computer Networks";

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .upsert({ code: courseCode, name: courseName, department: "Computer Science and Engineering" }, { onConflict: "code" })
    .select("id")
    .single();
  if (courseError) throw courseError;

  if (upload.type === "exam") {
    const { data: paper, error } = await supabase
      .from("exam_papers")
      .insert({
        course_id: course.id,
        uploaded_by: upload.userId,
        title: upload.examTitle || upload.filename,
        source: "uploaded",
        status: "draft",
        raw_text: upload.rawText,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { ...upload, id: paper.id, uploadedAt: new Date().toISOString() };
  }

  const { data: document, error } = await supabase
    .from("uploaded_documents")
    .insert({
      uploaded_by: upload.userId,
      course_id: course.id,
      document_type: "syllabus",
      filename: upload.filename,
      raw_text: upload.rawText,
      text_length: upload.textLength,
      word_count: upload.wordCount,
      page_count: upload.pageCount,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { ...upload, id: document.id, uploadedAt: new Date().toISOString() };
}