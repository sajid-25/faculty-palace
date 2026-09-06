import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ReportQuestion = {
  id: string;
  marks: number;
  analysis?: {
    topic_label: string | null;
    course_outcome_label: string | null;
    bloom_level: string | null;
  };
};

export type SimilaritySummary = {
  questionId: string;
  previousCount: number;
  matches: Array<{ matchedQuestionId: string; score: number; examYear: number | null; questionText: string }>;
};

export async function buildAndPersistReport(params: {
  examPaperId: string;
  questions: ReportQuestion[];
  topics: Array<{ topic: string }>;
  similarities: SimilaritySummary[];
}) {
  const topicSet = new Set(params.topics.map((topic) => topic.topic));
  const topicsCovered = [...new Set(params.questions.map((question) => question.analysis?.topic_label).filter(Boolean))] as string[];
  const missingTopics = [...topicSet].filter((topic) => !topicsCovered.includes(topic));
  const totalMarks = params.questions.reduce((sum, question) => sum + Number(question.marks || 0), 0) || 1;
  const coDistribution: Record<string, number> = {};
  const bloomDistribution: Record<string, number> = {};
  for (const question of params.questions) {
    const marks = Number(question.marks || 0);
    const co = question.analysis?.course_outcome_label || "Unmapped";
    const bloom = question.analysis?.bloom_level || "Unclassified";
    coDistribution[co] = Number(((coDistribution[co] || 0) + marks).toFixed(2));
    bloomDistribution[bloom] = Number(((bloomDistribution[bloom] || 0) + marks).toFixed(2));
  }

  const flaggedMatches = params.similarities.flatMap((summary) => summary.matches.filter((match) => match.score >= 0.75).map((match) => ({
    questionId: summary.questionId,
    previousCount: summary.previousCount,
    ...match,
  })));
  const higherOrderMarks = ["Apply", "Analyze", "Evaluate", "Create"].reduce((sum, level) => sum + (bloomDistribution[level] || 0), 0);
  const coverageScore = topicsCovered.length / Math.max(topicSet.size, 1);
  const higherOrderScore = higherOrderMarks / totalMarks;
  const repetitionPenalty = Math.min(flaggedMatches.length * 4, 20);
  const qualityScore = Math.max(0, Math.min(100, Math.round((coverageScore * 55 + higherOrderScore * 45) - repetitionPenalty)));
  const recommendations: string[] = [];
  if (missingTopics.length) recommendations.push(`Add questions covering ${missingTopics.slice(0, 3).join(", ")}${missingTopics.length > 3 ? " and other missing topics" : ""}.`);
  if (higherOrderScore < 0.35) recommendations.push("Increase Apply, Analyze, Evaluate, or Create questions to improve cognitive depth.");
  if (flaggedMatches.length) recommendations.push(`Review ${flaggedMatches.length} question(s) with strong historical similarity before approval.`);
  if (!recommendations.length) recommendations.push("Coverage and cognitive distribution are balanced. Review the detailed mappings before approval.");

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("analysis_reports")
    .upsert({
      exam_paper_id: params.examPaperId,
      quality_score: qualityScore,
      topics_covered: topicsCovered,
      missing_topics: missingTopics,
      co_distribution: coDistribution,
      bloom_distribution: bloomDistribution,
      similarity_flags: flaggedMatches,
      recommendations,
    }, { onConflict: "exam_paper_id" })
    .select("id, exam_paper_id, quality_score, topics_covered, missing_topics, co_distribution, bloom_distribution, similarity_flags, recommendations, created_at")
    .single();
  if (error) throw error;

  const { error: statusError } = await supabase
    .from("exam_papers")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("id", params.examPaperId);
  if (statusError) throw statusError;
  return data;
}