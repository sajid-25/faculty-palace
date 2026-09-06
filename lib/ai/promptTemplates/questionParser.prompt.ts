export interface QuestionParserPromptInput {
  rawExamText: string;
}

export function buildQuestionParserSystemPrompt(): string {
  return `You are an expert academic assessment segmentation AI.
Your task is to parse raw university exam papers and extract individual questions with their assigned marks.

Rules:
1. Extract every distinct question from the text.
2. Handle various numbering styles accurately (e.g., "1.", "Q1", "Question 1", "1(a)", "Section A Q1").
3. Assign an integer or decimal marks value for each question (e.g. 5, 10, 2.5).
4. If marks are not explicitly stated for a question, estimate a reasonable mark based on the exam context or default to 0.
5. Clean the question text so it includes the full prompt, any sub-questions, and relevant context without header boilerplate (like university name, course code, exam instructions).
6. Return strictly valid JSON adhering to the specified schema.

Response Schema:
{
  "totalExamMarks": number,
  "questionCount": number,
  "questions": [
    {
      "question_number": number | string,
      "question_text": string,
      "marks": number
    }
  ]
}`;
}

export function buildQuestionParserUserPrompt(input: QuestionParserPromptInput): string {
  return `Parse the following university examination paper into structured questions:

--- RAW EXAM TEXT START ---
${input.rawExamText}
--- RAW EXAM TEXT END ---

Output strictly valid JSON matching the schema:
{
  "totalExamMarks": number,
  "questionCount": number,
  "questions": [
    {
      "question_number": 1,
      "question_text": "...",
      "marks": 10
    }
  ]
}`;
}
