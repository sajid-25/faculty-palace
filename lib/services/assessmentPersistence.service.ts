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

export async function persistParsedQuestions(examPaperId: string, questions: Array<{
  question_number: number | string;
  question_text: string;
  marks: number;
}>) {
  const supabase = createSupabaseAdminClient();
  const { error: deleteError } = await supabase
    .from("questions")
    .delete()
    .eq("exam_paper_id", examPaperId);
  if (deleteError) throw deleteError;

  const rows = questions.map((question) => ({
    exam_paper_id: examPaperId,
    question_number: Number(question.question_number) || 0,
    question_text: question.question_text,
    marks: question.marks,
    source: "uploaded",
  }));

  const { data, error } = await supabase
    .from("questions")
    .insert(rows)
    .select("id, exam_paper_id, question_number, question_text, marks");
  if (error) throw error;

  const { error: statusError } = await supabase
    .from("exam_papers")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", examPaperId);
  if (statusError) throw statusError;

  return data;
}

export async function persistQuestionAnalysis(
  questions: Array<{ id: string; question_number: number; question_text: string }>,
  classifications: Array<{
    question_id_number: number;
    topic: string;
    course_outcome: string;
    bloom_level: string;
    confidence: number;
    reasoning: string;
  }>,
  topics: Array<{ id: string; topic: string }>,
  outcomes: Array<{ id: string; code: string }>,
) {
  const supabase = createSupabaseAdminClient();
  const topicIds = new Map(topics.map((topic) => [topic.topic, topic.id]));
  const outcomeIds = new Map(outcomes.map((outcome) => [outcome.code, outcome.id]));
  const questionIds = new Map(questions.map((question) => [question.question_number, question.id]));

  const rows = classifications.map((classification) => ({
    question_id: questionIds.get(classification.question_id_number),
    topic_id: topicIds.get(classification.topic) || null,
    course_outcome_id: outcomeIds.get(classification.course_outcome) || null,
    topic_label: classification.topic,
    course_outcome_label: classification.course_outcome,
    bloom_level: classification.bloom_level,
    confidence: classification.confidence,
    reasoning: classification.reasoning,
  }));

  const { data, error } = await supabase
    .from("question_analysis")
    .upsert(rows, { onConflict: "question_id" })
    .select("id, question_id, topic_label, course_outcome_label, bloom_level, confidence, reasoning");
  if (error) throw error;
  return data;
}