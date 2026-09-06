# AssessIQ — Implementation Plan

## 1. Project Goal

Build **AssessIQ**, an AI-powered academic assessment auditing tool.

### Core Journey

**Faculty uploads syllabus + draft exam → system analyzes it → faculty receives an actionable exam quality report.**

The MVP focuses on:

- Parsing exam questions
- Mapping questions to syllabus topics and Course Outcomes (COs)
- Classifying Bloom's Taxonomy levels
- Detecting coverage gaps and imbalance
- Detecting repeated or semantically similar questions
- Providing explanations and actionable improvement suggestions

---

# 2. Final Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS
- shadcn/ui or another UI component library
- Recharts for reports and visualizations

## Main Backend

- Node.js
- Express.js

Responsibilities:

- REST API
- Authentication
- File uploads
- Business logic
- Database operations
- AI orchestration
- Analysis history

## Database

- PostgreSQL
- pgvector extension

PostgreSQL stores structured application data.

pgvector stores and searches question embeddings for semantic similarity.

## AI / LLM

- Groq API
- Configurable Groq model

Used for:

- Question segmentation
- Topic classification
- Course Outcome mapping
- Bloom's Taxonomy classification
- Exam analysis
- Coverage gap explanations
- Actionable suggestions
- Replacement question generation

## Embeddings

- Sentence Transformers
- Recommended starting model: `all-MiniLM-L6-v2`

Used for:

- Semantic question similarity
- Paraphrased duplicate detection
- Future curriculum/course similarity

## Deployment

- Docker
- Docker Compose

---

# 3. Final Architecture

```text
                        ┌──────────────────────┐
                        │   React + Vite       │
                        │                      │
                        │ Faculty Dashboard    │
                        └──────────┬───────────┘
                                   │
                                   │ REST API
                                   ▼
                        ┌──────────────────────┐
                        │ Node.js + Express   │
                        │                      │
                        │ • Authentication    │
                        │ • File Upload       │
                        │ • Business Logic    │
                        │ • AI Orchestration  │
                        └──────────┬───────────┘
                                   │
                     ┌─────────────┼──────────────┐
                     ▼             ▼              ▼
            ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
            │ PostgreSQL   │ │ Groq API    │ │ Embeddings   │
            │ + pgvector   │ │             │ │ Service      │
            │              │ │ LLM Tasks   │ │              │
            └──────────────┘ └─────────────┘ └──────┬───────┘
                                                    │
                                                    ▼
                                              Similarity
                                               Vectors
```

---

# 4. Project Structure

```text
assessiq/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── Dockerfile
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── ai/
│   │   └── db/
│   │
│   ├── uploads/
│   └── Dockerfile
│
├── embedding-service/
│   ├── app/
│   ├── requirements.txt
│   └── Dockerfile
│
├── database/
│   └── init.sql
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# 5. AI Architecture

## 5.1 Groq LLM

Create a reusable AI service instead of placing Groq calls directly inside controllers.

```text
AI Request
    ↓
AI Service
    ↓
Selected Groq Model
    ↓
Structured JSON Result
```

### Suggested environment configuration

```env
GROQ_API_KEY=your_api_key
GROQ_MODEL=selected_model
```

Keep the model configurable so it can be changed without modifying application code.

### Groq tasks

#### Question Parser

Input:

- Exam text or extracted PDF text

Output:

```json
[
  {
    "question_number": 1,
    "question": "...",
    "marks": 5
  }
]
```

#### Topic and CO Mapper

Input:

- Question
- Syllabus
- Course Outcomes

Output:

```json
{
  "topic": "...",
  "course_outcome": "CO2",
  "confidence": 0.92
}
```

#### Bloom's Classifier

Output:

```json
{
  "bloom_level": "Analyze",
  "reason": "..."
}
```

#### Actionable Suggestions

Input:

- Missing topic
- Required Bloom level
- Marks

Output:

- Explanation of the problem
- Suggested improvement
- Optional replacement question

---

# 6. Embedding and Similarity Architecture

## Workflow

```text
Question
   ↓
Embedding Service
   ↓
Vector
   ↓
PostgreSQL + pgvector
   ↓
Cosine Similarity Search
   ↓
Similar Questions
```

## Purpose

Detect:

- Exact repeated questions
- Slightly modified questions
- Paraphrased questions
- Semantically similar questions

## Recommended Flow

When a question is uploaded:

1. Generate its embedding.
2. Search the question bank.
3. Calculate similarity.
4. Return the most similar previous questions.
5. Flag results above a chosen similarity threshold.

Example:

```text
New Question
       ↓
Similarity: 0.91
       ↓
⚠ Highly Similar Question Found
       ↓
Show previous question side-by-side
```

---

# 7. Main User Journey

```text
Faculty
   ↓
Upload Syllabus
   +
Upload Draft Exam
   ↓
Text Extraction
   ↓
Question Segmentation
   ↓
Topic + CO Mapping
   ↓
Bloom's Classification
   ↓
Embedding Generation
   ↓
Similarity Search
   ↓
Coverage Analysis
   ↓
Exam Quality Report
   ↓
Suggestions / Replacement Questions
```

---

# 8. MVP Features — MUST HAVE

## 8.1 Upload

Faculty can upload:

- Syllabus
- Course Outcomes
- Draft exam paper

## 8.2 Text Extraction

Extract usable text from uploaded documents.

Start with text-based PDFs.

Do not prioritize OCR unless scanned documents are required.

## 8.3 Question Parser

Split the exam into individual questions.

Extract:

- Question number
- Question text
- Marks

## 8.4 Topic and CO Mapping

Map every question to:

- Syllabus topic
- Course Outcome

## 8.5 Bloom's Taxonomy Classification

Classify each question into:

- Remember
- Understand
- Apply
- Analyze
- Evaluate
- Create

## 8.6 Coverage Report

Show:

- Topics covered
- Topics missing
- Marks distribution
- CO distribution
- Bloom's distribution

## 8.7 Similarity Detector

Compare uploaded questions against a seeded historical question bank.

Show:

- Similarity score
- Matching previous question
- Previous exam/year

## 8.8 Actionable Suggestions

For every important issue:

```text
Problem
   ↓
Why it matters
   ↓
Recommended improvement
```

---

# 9. SHOULD HAVE Features

- Auto-generated replacement questions
- Marks weightage vs syllabus weightage comparison
- Exportable report
- Analysis history
- Explanation/"Why?" panel

---

# 10. WOW Features

## Grading Consistency Module

Input:

- Rubric
- Sample answers
- Grades from multiple evaluators

Output:

- Divergent grades
- Possible inconsistent rubric interpretation
- Specific criterion causing disagreement

## Curriculum-Fit Checker

Input:

- New course description

Process:

- Generate embeddings
- Compare against existing courses

Output:

- Course overlap percentage
- Similar topics
- Differentiation suggestions

## Self-Growing Question Bank

Every analyzed exam can be added to the institutional question bank.

Over time:

```text
More Exams
    ↓
More Questions
    ↓
Larger Similarity Database
    ↓
Better Repetition Detection
```

---

# 11. Database Design

Suggested core entities:

```text
Users
Courses
Syllabi
CourseOutcomes
ExamPapers
Questions
QuestionAnalysis
QuestionEmbeddings
AnalysisReports
```

## Example relationships

```text
Course
 ├── Syllabus
 ├── Course Outcomes
 └── Exam Papers

Exam Paper
 └── Questions

Question
 ├── Topic Classification
 ├── CO Mapping
 ├── Bloom Classification
 └── Embedding
```

---

# 12. API Modules

## Authentication

```text
POST /auth/register
POST /auth/login
```

## Courses

```text
GET    /courses
POST   /courses
GET    /courses/:id
```

## Upload

```text
POST /upload/syllabus
POST /upload/exam
```

## Analysis

```text
POST /analysis/start
GET  /analysis/:id
GET  /analysis/:id/report
```

## Question Bank

```text
GET /questions
POST /questions
GET /questions/similar
```

---

# 13. Docker Services

```text
docker-compose.yml
│
├── frontend
│   └── React + Vite
│
├── backend
│   └── Node.js + Express
│
├── embedding-service
│   └── Sentence Transformers
│
└── database
    └── PostgreSQL + pgvector
```

## Service Communication

```text
Frontend
   ↓
Backend API
   ├── Groq API (external)
   ├── Embedding Service
   └── PostgreSQL
```

---

# 14. Implementation Order

## Phase 1 — Project Setup

1. Create GitHub repository.
2. Create React frontend.
3. Create Express backend.
4. Create PostgreSQL + pgvector container.
5. Configure Docker Compose.
6. Add environment variables.

## Phase 2 — Core Backend

1. Connect Express to PostgreSQL.
2. Create database schema.
3. Implement upload endpoint.
4. Store uploaded document metadata.
5. Implement basic analysis workflow.

## Phase 3 — Groq Integration

1. Create Groq API key.
2. Install Groq SDK.
3. Create reusable AI service.
4. Make model configurable.
5. Test currently available models.
6. Choose the best model using real AssessIQ tasks.

Test:

- JSON reliability
- Classification quality
- Speed
- Rate limits

## Phase 4 — Question Analysis

1. Extract exam text.
2. Parse questions.
3. Map questions to topics.
4. Map questions to COs.
5. Classify Bloom's levels.
6. Save results.

## Phase 5 — Embeddings

1. Create embedding service.
2. Generate question embeddings.
3. Store vectors using pgvector.
4. Implement similarity search.
5. Add similarity threshold.
6. Display similar questions.

## Phase 6 — Dashboard

Build:

- Upload page
- Processing screen
- Analysis dashboard
- Coverage chart
- Bloom's chart
- Similarity results
- Suggestions panel

## Phase 7 — Actionable AI

For every detected issue:

```text
Issue
   ↓
Explanation
   ↓
Suggested Fix
```

Then optionally add:

- Replacement question generation

## Phase 8 — WOW Features

Only start after the MVP works.

Priority:

1. Explanation panel
2. Self-growing question bank
3. Curriculum-fit checker
4. Grading consistency module

---

# 15. Groq Model Strategy

Do not hardcode your entire application around one model.

Use:

```env
GROQ_MODEL=selected_model
```

During development:

1. List/check currently available Groq models.
2. Test multiple models using the same AssessIQ prompts.
3. Compare:
   - Accuracy
   - JSON consistency
   - Response speed
   - Rate limits
4. Select one primary model.
5. Keep the configuration easy to change.

## Important

Do not call multiple models for every user request.

Use one selected model for production/demo requests.

---

# 16. Reliability Strategy

## LLM

Primary:

- Selected Groq model

Fallback:

- Keep the model configurable.
- Prepare another working Groq model if available.

## Embeddings

Use local Sentence Transformers so similarity detection does not depend on an external embedding API.

## Demo Data

Prepare before the event:

- 1–2 syllabus documents
- Course Outcomes
- Draft exam papers
- Historical question papers

Seed enough historical questions to demonstrate:

- Exact repetition
- Paraphrased repetition
- Non-repeated questions

---

# 17. ML Decision

Traditional ML is **not required for the MVP**.

The project already uses meaningful AI through:

- LLM-based reasoning and classification
- NLP
- Embeddings
- Semantic similarity

## Optional Future ML

If meaningful historical data exists:

```text
Question Features
      +
Historical Student Performance
      ↓
ML Model
      ↓
Difficulty Prediction
```

Potential outputs:

- Predicted difficulty
- Expected student performance
- Difficulty distribution

Do not add a traditional ML model without meaningful data.

---

# 18. Team Work Division

## Member 1 — Frontend

- React UI
- Upload flow
- Dashboard
- Charts
- Report visualization

## Member 2 — Backend + Database

- Express APIs
- PostgreSQL
- Authentication
- File uploads
- Analysis orchestration

## Member 3 — AI + Embeddings

- Groq integration
- Prompt engineering
- Structured outputs
- Embedding service
- Similarity detection

All members should integrate together early.

---

# 19. MVP Success Criteria

Before adding any extra feature, this workflow must work:

```text
Faculty uploads syllabus + exam
          ↓
System extracts questions
          ↓
Groq analyzes questions
          ↓
Topics + COs + Bloom levels are assigned
          ↓
Embeddings check historical similarity
          ↓
Dashboard shows findings
          ↓
Faculty receives useful recommendations
```

If this works smoothly, AssessIQ is already a complete, convincing MVP.

---

# 20. Final Priority

## Build First

> Upload → Parse → Analyze → Similarity → Visual Report

## Build Second

> Explanations → Actionable Suggestions → Replacement Questions

## Build Last

> Curriculum Fit → Grading Consistency → Advanced ML

The goal is not to build every possible feature.

The goal is to make one complete AI-powered academic workflow work reliably and demonstrably.
