import { NextRequest, NextResponse } from "next/server";
import { parseExamQuestions } from "@/lib/services/questionParser.service";
import { classifyQuestions } from "@/lib/services/questionAnalysis.service";
import { persistParsedQuestions, persistQuestionAnalysis } from "@/lib/services/assessmentPersistence.service";
import { findHistoricalSimilarities } from "@/lib/services/similarity.service";
import { buildAndPersistReport } from "@/lib/services/report.service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Sign in before starting an analysis." }, { status: 401 });
    if (user.role === "reviewer") return NextResponse.json({ success: false, error: "External Examiners have read-only access." }, { status: 403 });

    const body = await request.json();
    const examPaperId = String(body.examPaperId || "");
    if (!examPaperId) return NextResponse.json({ success: false, error: "examPaperId is required." }, { status: 400 });

    const admin = createSupabaseAdminClient();
    const { data: paper, error: paperError } = await admin
      .from("exam_papers")
      .select("id, uploaded_by, course_id, raw_text, status")
      .eq("id", examPaperId)
      .single();
    if (paperError || !paper) return NextResponse.json({ success: false, error: "Exam paper not found." }, { status: 404 });
    if (paper.uploaded_by !== user.id && user.role !== "admin") return NextResponse.json({ success: false, error: "You cannot analyze this exam paper." }, { status: 403 });

    const parsed = await parseExamQuestions(paper.raw_text || "");
    const questions = await persistParsedQuestions(examPaperId, parsed.questions);
    const [{ data: topics, error: topicsError }, { data: outcomes, error: outcomesError }] = await Promise.all([
      admin.from("syllabus_topics").select("id, topic, description").eq("course_id", paper.course_id).eq("is_active", true),
      admin.from("course_outcomes").select("id, code, description").eq("course_id", paper.course_id).eq("is_active", true),
    ]);
    if (topicsError) throw topicsError;
    if (outcomesError) throw outcomesError;
    if (!topics?.length || !outcomes?.length) throw new Error("No active syllabus topics or course outcomes are configured for this course.");

    const classifications = await classifyQuestions(parsed.questions, { topics, outcomes });
    const analyses = await persistQuestionAnalysis(questions, classifications, topics, outcomes);
    const similarities = await findHistoricalSimilarities(questions);
    const { data: persistedAnalyses, error: persistedAnalysisError } = await admin
      .from("question_analysis")
      .select("question_id, topic_label, course_outcome_label, bloom_level")
      .in("question_id", questions.map((question) => question.id));
    if (persistedAnalysisError) throw persistedAnalysisError;

    const analysisByQuestion = new Map((persistedAnalyses || []).map((analysis) => [analysis.question_id, analysis]));
    const report = await buildAndPersistReport({
      examPaperId,
      questions: questions.map((question) => ({ ...question, marks: Number(question.marks), analysis: analysisByQuestion.get(question.id) })),
      topics,
      similarities,
    });

    return NextResponse.json({
      success: true,
      analysisId: examPaperId,
      step: "classified",
      data: { questionCount: parsed.questionCount, totalMarks: parsed.totalMarks, questions, analyses, similarities, report, telemetry: parsed.telemetry },
    });
  } catch (error) {
    console.error("Analysis start failed", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to start analysis." }, { status: 500 });
  }
}
