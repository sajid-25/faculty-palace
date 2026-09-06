import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedDir = path.join(root, "database", "seed");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running the seed script.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function readJson(fileName) {
  return JSON.parse(await fs.readFile(path.join(seedDir, fileName), "utf8"));
}

async function getOrCreateCourse() {
  const { data: existing, error: lookupError } = await supabase
    .from("courses")
    .select("id")
    .eq("code", "CSE-NETWORKS")
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("courses")
    .insert({ code: "CSE-NETWORKS", name: "Computer Networks", department: "Computer Science and Engineering" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function ensureOutcomes(courseId, outcomes, questions) {
  const outcomeDescriptions = new Map(outcomes.map((outcome) => [outcome.code, outcome.description]));
  for (const code of new Set(questions.map((question) => question.course_outcome))) {
    if (!outcomeDescriptions.has(code)) {
      outcomeDescriptions.set(code, `Legacy course outcome ${code} from a previous syllabus`);
    }
  }

  const rows = [...outcomeDescriptions].map(([code, description]) => ({
    course_id: courseId,
    code,
    description,
    syllabus_year: code === "CO4" || code === "CO5" ? 2024 : 2026,
    is_active: code === "CO1" || code === "CO2" || code === "CO3",
  }));
  const { data, error } = await supabase
    .from("course_outcomes")
    .upsert(rows, { onConflict: "course_id,code,syllabus_year" })
    .select("id, code, syllabus_year");
  if (error) throw error;
  return new Map(data.map((outcome) => [`${outcome.code}:${outcome.syllabus_year}`, outcome.id]));
}

async function ensureTopics(courseId, questions) {
  const topicNames = [...new Set(questions.map((question) => question.topic))];
  const { data: existing, error: existingError } = await supabase
    .from("syllabus_topics")
    .select("id, topic")
    .eq("course_id", courseId)
    .in("topic", topicNames);
  if (existingError) throw existingError;

  const topicMap = new Map(existing.map((topic) => [topic.topic, topic.id]));
  const missing = topicNames.filter((topic) => !topicMap.has(topic));
  if (missing.length) {
    const { data, error } = await supabase
      .from("syllabus_topics")
      .insert(missing.map((topic) => ({ course_id: courseId, topic, syllabus_year: 2026, is_active: true })))
      .select("id, topic");
    if (error) throw error;
    data.forEach((topic) => topicMap.set(topic.topic, topic.id));
  }
  return topicMap;
}

async function seed() {
  const [outcomes, firstYearQuestions, additionalQuestions] = await Promise.all([
    readJson("course_outcomes.json"),
    readJson("historical_questions.json"),
    readJson("historical_questions_additional.json"),
  ]);
  const questions = [...firstYearQuestions, ...additionalQuestions];
  const courseId = await getOrCreateCourse();
  const outcomeMap = await ensureOutcomes(courseId, outcomes, questions);
  const topicMap = await ensureTopics(courseId, questions);

  const { error: deleteError } = await supabase.from("questions").delete().in("source", ["historical", "seed"]);
  if (deleteError) throw deleteError;

  const { data: inserted, error: questionError } = await supabase
    .from("questions")
    .insert(questions.map((question, index) => ({
      question_number: index + 1,
      question_text: question.question,
      marks: question.marks,
      source: "historical",
      exam_year: question.exam_year || null,
    })))
    .select("id, question_text, exam_year");
  if (questionError) throw questionError;

  const analysisRows = inserted.map((question, index) => {
    const source = questions[index];
    const syllabusYear = source.course_outcome === "CO4" || source.course_outcome === "CO5" ? 2024 : 2026;
    return {
      question_id: question.id,
      topic_id: topicMap.get(source.topic),
      course_outcome_id: outcomeMap.get(`${source.course_outcome}:${syllabusYear}`),
      topic_label: source.topic,
      course_outcome_label: source.course_outcome,
      bloom_level: source.bloom_level,
      confidence: 1,
      reasoning: "Ground-truth label imported from historical seed data.",
    };
  });
  const { error: analysisError } = await supabase.from("question_analysis").insert(analysisRows);
  if (analysisError) throw analysisError;

  console.log(`Seeded ${inserted.length} historical questions for ${courseId}.`);
  console.log(`Imported ${outcomeMap.size} course outcomes and ${topicMap.size} topics.`);
}

seed().catch((error) => {
  console.error("Seed import failed:", error.message || error);
  process.exitCode = 1;
});
