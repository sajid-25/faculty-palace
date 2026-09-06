"use client";

import { ChangeEvent, useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";

type Question = {
  number: string;
  prompt: string;
  topic: string;
  co: string;
  bloom: "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create";
  marks: string;
  similarity?: {
    score: number;
    matchExam: string;
    matchQuestion: string;
  };
};

const initialQuestions: Question[] = [
  {
    number: "01",
    prompt: "Explain the role of normalization in relational databases and describe 1NF, 2NF, and 3NF with examples.",
    topic: "Database Design",
    co: "CO2",
    bloom: "Understand",
    marks: "05",
    similarity: { score: 94, matchExam: "2024 Midterm", matchQuestion: "What is database normalization? Explain 1NF and 2NF." },
  },
  {
    number: "02",
    prompt: "Design an indexing strategy for a high-traffic transaction table with 10M rows experiencing slow JOIN queries.",
    topic: "Query Optimization",
    co: "CO3",
    bloom: "Create",
    marks: "10",
  },
  {
    number: "03",
    prompt: "Compare two-phase locking (2PL) with timestamp ordering protocols in distributed concurrency control.",
    topic: "Concurrency Control",
    co: "CO4",
    bloom: "Analyze",
    marks: "10",
    similarity: { score: 78, matchExam: "2023 Final Exam", matchQuestion: "Differentiate between 2PL and timestamp-based concurrency." },
  },
  {
    number: "04",
    prompt: "Write SQL queries using subqueries and window functions to retrieve students with above-average department scores.",
    topic: "SQL Programming",
    co: "CO2",
    bloom: "Apply",
    marks: "05",
  },
  {
    number: "05",
    prompt: "Define primary key, foreign key, and candidate key. Give a practical schema showing their usage.",
    topic: "Relational Concepts",
    co: "CO1",
    bloom: "Remember",
    marks: "05",
    similarity: { score: 96, matchExam: "2025 Midterm", matchQuestion: "Explain primary keys and foreign keys with examples." },
  },
  {
    number: "06",
    prompt: "Evaluate ACID properties under network partition failure scenarios in distributed database clusters.",
    topic: "Distributed Transactions",
    co: "CO4",
    bloom: "Evaluate",
    marks: "10",
  },
];

const reportsList = [
  {
    id: "rep-1",
    title: "DBMS Final Exam Draft 2026",
    course: "CSE 3105 · Database Systems",
    date: "Sep 07, 2026",
    qualityScore: 82,
    questionsCount: 24,
    coverageGaps: 2,
    similarities: 3,
    status: "Action Needed",
    recommendation: "Increase Evaluation/Create questions to 30% and cover the missing topic: Hashing & Index Buffers.",
  },
  {
    id: "rep-2",
    title: "Data Structures Midterm 2026",
    course: "CSE 2101 · Data Structures",
    date: "Aug 22, 2026",
    qualityScore: 88,
    questionsCount: 18,
    coverageGaps: 1,
    similarities: 1,
    status: "Approved",
    recommendation: "Balanced Bloom distribution achieved. Replaced 1 duplicate stack question.",
  },
  {
    id: "rep-3",
    title: "Algorithm Design Quiz 2",
    course: "CSE 3201 · Algorithms",
    date: "Aug 10, 2026",
    qualityScore: 94,
    questionsCount: 10,
    coverageGaps: 0,
    similarities: 0,
    status: "Approved",
    recommendation: "Perfect syllabus alignment and zero historical question overlap.",
  },
];

const navItems = ["Overview", "New analysis", "Question bank", "Reports"];

export default function Home() {
  const { user, isLoggedIn, logout, login } = useAuth();
  const [activeNav, setActiveNav] = useState("Overview");

  // Overview states
  const [syllabus, setSyllabus] = useState<string | null>(null);
  const [exam, setExam] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // New Analysis Wizard state
  const [wizardCourse, setWizardCourse] = useState("CSE 3105 - Database Management Systems");
  const [wizardExamType, setWizardExamType] = useState("Final Exam Draft");
  const [wizardSyllabus, setWizardSyllabus] = useState<string | null>(null);
  const [wizardExam, setWizardExam] = useState<string | null>(null);
  const [wizardProgress, setWizardProgress] = useState(0);
  const [wizardStepText, setWizardStepText] = useState("");
  const [wizardFinished, setWizardFinished] = useState(false);

  // Question Bank states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBloom, setSelectedBloom] = useState("ALL");
  const [selectedCO, setSelectedCO] = useState("ALL");
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestionPrompt, setNewQuestionPrompt] = useState("");
  const [newQuestionTopic, setNewQuestionTopic] = useState("Database Design");
  const [newQuestionCO, setNewQuestionCO] = useState("CO2");
  const [newQuestionBloom, setNewQuestionBloom] = useState<Question["bloom"]>("Apply");
  const [newQuestionMarks, setNewQuestionMarks] = useState("05");

  // Reports state
  const [selectedReportId, setSelectedReportId] = useState("rep-1");

  const handleFile = (event: ChangeEvent<HTMLInputElement>, type: "syllabus" | "exam") => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (type === "syllabus") setSyllabus(file.name);
    else setExam(file.name);
  };

  const runAnalysis = () => {
    if (!syllabus || !exam) return;
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    window.setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 1200);
  };

  const runWizardAnalysis = () => {
    if (!wizardSyllabus || !wizardExam) return;
    setWizardProgress(15);
    setWizardStepText("1/5: Extracting text from syllabus and draft exam...");
    setWizardFinished(false);

    setTimeout(() => {
      setWizardProgress(40);
      setWizardStepText("2/5: Groq LLM segmenting questions and extracting marks...");
    }, 800);

    setTimeout(() => {
      setWizardProgress(65);
      setWizardStepText("3/5: Computing Sentence Transformers embeddings & pgvector matching...");
    }, 1600);

    setTimeout(() => {
      setWizardProgress(85);
      setWizardStepText("4/5: Mapping Course Outcomes (COs) and Bloom's Taxonomy levels...");
    }, 2400);

    setTimeout(() => {
      setWizardProgress(100);
      setWizardStepText("5/5: Analysis complete! Generated quality report & suggestions.");
      setWizardFinished(true);
    }, 3200);
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionPrompt.trim()) return;
    const newQ: Question = {
      number: String(questions.length + 1).padStart(2, "0"),
      prompt: newQuestionPrompt.trim(),
      topic: newQuestionTopic,
      co: newQuestionCO,
      bloom: newQuestionBloom,
      marks: newQuestionMarks.padStart(2, "0"),
    };
    setQuestions([newQ, ...questions]);
    setNewQuestionPrompt("");
    setShowAddModal(false);
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        q.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.co.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBloom = selectedBloom === "ALL" || q.bloom.toUpperCase() === selectedBloom;
      const matchesCO = selectedCO === "ALL" || q.co === selectedCO;
      const matchesFlag = !onlyFlagged || Boolean(q.similarity);
      return matchesSearch && matchesBloom && matchesCO && matchesFlag;
    });
  }, [questions, searchQuery, selectedBloom, selectedCO, onlyFlagged]);

  const activeReport = useMemo(() => {
    return reportsList.find((r) => r.id === selectedReportId) || reportsList[0];
  }, [selectedReportId]);

  return (
    <main className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">A</span>
          <span>assess<span>iq</span></span>
        </div>
        
        <div className="workspace-switcher">
          <span className="workspace-dot">{isLoggedIn ? (user?.initials || "FP") : "🔒"}</span>
          <span>
            <small>WORKSPACE</small>
            {isLoggedIn ? "Faculty Palace" : "Guest Mode"}
          </span>
          <b>⌄</b>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          {navItems.map((item, index) => {
            const icons = ["◈", "+", "▦", "▤"];
            return (
              <button
                key={item}
                className={activeNav === item ? "nav-item active" : "nav-item"}
                onClick={() => {
                  setActiveNav(item);
                }}
              >
                <span className="nav-icon">{icons[index]}</span>
                {item}
                {item === "Reports" && <span className="nav-count">3</span>}
                {!isLoggedIn && index > 0 && <span className="lock-tag">Lock</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">?</span>
            <div>
              <strong>AssessIQ Guide</strong>
              <small>AI Assessment Auditing</small>
            </div>
            <span>↗</span>
          </div>

          {isLoggedIn ? (
            <div className="profile-wrapper">
              <button className="profile" title="Logged in faculty profile">
                <span className="avatar">{user?.initials || "FA"}</span>
                <span>
                  <strong>{user?.name}</strong>
                  <small>{user?.role}</small>
                </span>
              </button>
              <button className="sidebar-signout-btn" onClick={logout} title="Sign out">
                Sign out
              </button>
            </div>
          ) : (
            <div className="guest-sidebar-card">
              <span className="guest-avatar">🔒</span>
              <div>
                <strong>Guest Visitor</strong>
                <small>Sign in to unlock all tools</small>
              </div>
              <Link href="/login" className="guest-login-link">Sign in</Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="content-area">
        {/* Topbar */}
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <b>/</b>
            <strong>{activeNav}</strong>
            {!isLoggedIn && <span className="guest-badge">Guest Preview</span>}
          </div>

          <div className="top-actions">
            {isLoggedIn ? (
              <>
                <div className="user-top-pill">
                  <span className="user-dot-online" />
                  <span>{user?.name}</span>
                </div>
                <button
                  className="outline-button"
                  onClick={() => setActiveNav("Question bank")}
                >
                  Question bank <span>↗</span>
                </button>
                <button className="signout-link-btn" onClick={logout}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  className="demo-pill-btn"
                  onClick={() => login("arjun.mehta@institution.edu", "Arjun Mehta", "Faculty Admin")}
                  title="Instant 1-click Demo Login"
                >
                  ⚡ Instant Demo Login
                </button>
                <Link className="auth-link auth-link-muted" href="/login">
                  Sign in
                </Link>
                <Link className="auth-link auth-link-primary" href="/register">
                  Create account <span>→</span>
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="content-wrap">
          {/* Guest Auth Barrier if NOT logged in */}
          {!isLoggedIn ? (
            <section className="auth-gate-banner">
              <div className="gate-card">
                <div className="gate-tag">ACCESS RESTRICTED</div>
                <h2>Sign in to access your assessment workspace</h2>
                <p className="gate-description">
                  AssessIQ empowers faculty to analyze draft exams, verify Bloom&apos;s Taxonomy alignment,
                  detect historical repetitions via vector embeddings, and guarantee Course Outcome coverage.
                </p>

                <div className="gate-features-grid">
                  <div className="gate-feature-item">
                    <span className="feat-icon">🎯</span>
                    <div>
                      <strong>Bloom&apos;s Taxonomy Classification</strong>
                      <small>Automatic cognitive balance mapping from Remember to Create.</small>
                    </div>
                  </div>
                  <div className="gate-feature-item">
                    <span className="feat-icon">📑</span>
                    <div>
                      <strong>Syllabus & CO Coverage</strong>
                      <small>Identify uncovered modules and mark distribution imbalances.</small>
                    </div>
                  </div>
                  <div className="gate-feature-item">
                    <span className="feat-icon">⚡</span>
                    <div>
                      <strong>Historical Repetition Detection</strong>
                      <small>pgvector similarity matching against past question banks.</small>
                    </div>
                  </div>
                  <div className="gate-feature-item">
                    <span className="feat-icon">💡</span>
                    <div>
                      <strong>AI Suggestions & Replacements</strong>
                      <small>Generative suggestions to balance skewed exams in 1-click.</small>
                    </div>
                  </div>
                </div>

                <div className="gate-cta-row">
                  <button
                    className="primary-button gate-primary"
                    onClick={() => login("arjun.mehta@institution.edu", "Arjun Mehta", "Faculty Admin")}
                  >
                    <span>⚡ Quick Sign In as Demo Faculty</span>
                    <span>→</span>
                  </button>
                  <Link href="/login" className="outline-button gate-outline">
                    Sign in with credentials
                  </Link>
                  <Link href="/register" className="text-button gate-text">
                    Create new account <span>↗</span>
                  </Link>
                </div>
              </div>

              {/* Blurred Read-only Preview */}
              <div className="gate-preview-teaser">
                <div className="teaser-overlay">
                  <span className="lock-icon">🔒</span>
                  <p>Sign in above to interact with live assessments and reports</p>
                </div>
                <div className="metric-grid teaser-metrics">
                  <div className="metric-card accent">
                    <span className="metric-label">QUALITY SCORE</span>
                    <strong>82<span>/100</span></strong>
                    <div className="metric-trend up">↑ 8% vs last year</div>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">QUESTIONS PARSED</span>
                    <strong>24</strong>
                    <div className="metric-trend neutral">24 of 24 recognized</div>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">TOPICS COVERED</span>
                    <strong>8<span>/10</span></strong>
                    <div className="metric-trend warn">2 gaps need attention</div>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">SIMILARITY FLAGS</span>
                    <strong>3</strong>
                    <div className="metric-trend down">↓ 2 vs previous exam</div>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            /* Logged in: User can access all things! */
            <>
              {/* TAB 1: OVERVIEW */}
              {activeNav === "Overview" && (
                <>
                  <section className="intro">
                    <div>
                      <p className="eyebrow">FACULTY ASSESSMENT PORTAL · 2026</p>
                      <h1>
                        Good morning, {user?.name?.split(" ")[0] || "Professor"}
                        <span>.</span>
                      </h1>
                      <p className="intro-copy">
                        You have full access to your workspace. Turn your draft assessments into clear, confident decisions.
                      </p>
                    </div>
                    <div className="intro-status">
                      <span className="status-dot" /> System ready{" "}
                      <span className="status-divider" /> pgvector + Groq active
                    </div>
                  </section>

                  {/* Upload Section */}
                  <section className="upload-section">
                    <div className="section-heading">
                      <div>
                        <p className="eyebrow">QUICK AUDIT</p>
                        <h2>Analyze a new assessment</h2>
                      </div>
                      <span className="step-label">
                        <b>01</b> Upload documents <i /> <span>02</span> Review insights
                      </span>
                    </div>

                    <div className="upload-grid">
                      <label className={syllabus ? "upload-card uploaded" : "upload-card"}>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(event) => handleFile(event, "syllabus")}
                        />
                        <span className="upload-symbol">{syllabus ? "✓" : "↑"}</span>
                        <span className="upload-title">{syllabus || "Add your syllabus"}</span>
                        <span className="upload-detail">
                          {syllabus ? "Ready to analyze" : "PDF, DOCX up to 10 MB"}
                        </span>
                        <span className="upload-action">
                          {syllabus ? "Replace file" : "Browse files"}
                        </span>
                      </label>

                      <label className={exam ? "upload-card uploaded" : "upload-card"}>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(event) => handleFile(event, "exam")}
                        />
                        <span className="upload-symbol">{exam ? "✓" : "↑"}</span>
                        <span className="upload-title">{exam || "Add your draft exam"}</span>
                        <span className="upload-detail">
                          {exam ? "Ready to analyze" : "PDF, DOCX up to 10 MB"}
                        </span>
                        <span className="upload-action">
                          {exam ? "Replace file" : "Browse files"}
                        </span>
                      </label>

                      <div className="analysis-launch">
                        <div>
                          <span className="launch-number">{syllabus && exam ? "✓" : "2"}</span>
                          <p>
                            <strong>Documents required</strong>
                            <small>
                              {syllabus && exam
                                ? "Both documents loaded. Ready for Groq + pgvector analysis."
                                : "Upload both syllabus and draft exam to launch analysis."}
                            </small>
                          </p>
                        </div>
                        <button
                          className="primary-button"
                          disabled={!syllabus || !exam || isAnalyzing}
                          onClick={runAnalysis}
                        >
                          {isAnalyzing ? "Analyzing assessment..." : "Run analysis"}
                          <span>→</span>
                        </button>
                      </div>
                    </div>

                    {analysisComplete && (
                      <div className="analysis-success-toast">
                        <span>✓</span>
                        <div>
                          <strong>Audit completed successfully!</strong>
                          <small>24 questions segmented, Bloom levels classified, and 3 similarity alerts generated below.</small>
                        </div>
                        <button onClick={() => setActiveNav("Reports")}>View full report →</button>
                      </div>
                    )}
                  </section>

                  {/* Insights / Snapshot */}
                  <section className="insights-section">
                    <div className="section-heading report-heading">
                      <div>
                        <p className="eyebrow">LATEST AUDIT · DBMS FINAL EXAM</p>
                        <h2>Assessment quality snapshot</h2>
                      </div>
                      <button className="text-button" onClick={() => setActiveNav("Reports")}>
                        Open full report <span>→</span>
                      </button>
                    </div>

                    <div className="metric-grid">
                      <div className="metric-card accent">
                        <span className="metric-label">QUALITY SCORE <b>ⓘ</b></span>
                        <strong>82<span>/100</span></strong>
                        <div className="metric-trend up">↑ 8% <small>vs last assessment</small></div>
                        <div className="score-line"><i /></div>
                      </div>
                      <div className="metric-card">
                        <span className="metric-label">QUESTIONS PARSED</span>
                        <strong>24</strong>
                        <div className="metric-trend neutral">24 of 24 <small>questions recognized</small></div>
                      </div>
                      <div className="metric-card">
                        <span className="metric-label">TOPICS COVERED</span>
                        <strong>8<span>/10</span></strong>
                        <div className="metric-trend warn">2 gaps <small>need attention</small></div>
                      </div>
                      <div className="metric-card">
                        <span className="metric-label">SIMILARITY FLAGS</span>
                        <strong>3</strong>
                        <div className="metric-trend down">↓ 2 <small>vs last assessment</small></div>
                      </div>
                    </div>

                    <div className="report-grid">
                      <div className="panel question-panel">
                        <div className="panel-header">
                          <div>
                            <h3>Question analysis</h3>
                            <p>Topic, outcome, cognitive level & historical similarity</p>
                          </div>
                          <button
                            className="text-button"
                            onClick={() => setActiveNav("Question bank")}
                          >
                            Explore bank ↗
                          </button>
                        </div>
                        <div className="table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>QUESTION</th>
                                <th>TOPIC</th>
                                <th>CO</th>
                                <th>BLOOM&apos;S</th>
                                <th>MARKS</th>
                                <th>SIMILARITY</th>
                              </tr>
                            </thead>
                            <tbody>
                              {questions.slice(0, 4).map((question) => (
                                <tr key={question.number}>
                                  <td>
                                    <span className="question-number">{question.number}</span>
                                    <span className="question-prompt">{question.prompt}</span>
                                  </td>
                                  <td>{question.topic}</td>
                                  <td><span className="co-pill">{question.co}</span></td>
                                  <td>
                                    <span className={`bloom-pill ${question.bloom.toLowerCase()}`}>
                                      {question.bloom}
                                    </span>
                                  </td>
                                  <td><strong>{question.marks}</strong></td>
                                  <td>
                                    {question.similarity ? (
                                      <span className="sim-pill high">
                                        ⚠ {question.similarity.score}% match
                                      </span>
                                    ) : (
                                      <span className="sim-pill ok">✓ Unique</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <button
                          className="panel-footer"
                          onClick={() => setActiveNav("Question bank")}
                        >
                          View all questions in question bank <span>→</span>
                        </button>
                      </div>

                      <div className="panel coverage-panel">
                        <div className="panel-header">
                          <div>
                            <h3>Coverage balance</h3>
                            <p>Marks by Bloom&apos;s taxonomy</p>
                          </div>
                          <button className="more-button" aria-label="More options">•••</button>
                        </div>
                        <div className="donut-wrap">
                          <div className="donut">
                            <div>
                              <strong>24</strong>
                              <span>questions</span>
                            </div>
                          </div>
                          <div className="legend">
                            <span><i className="legend-dot remember" />Remember <b>8%</b></span>
                            <span><i className="legend-dot understand" />Understand <b>21%</b></span>
                            <span><i className="legend-dot apply" />Apply <b>29%</b></span>
                            <span><i className="legend-dot analyze" />Analyze <b>25%</b></span>
                            <span><i className="legend-dot create" />Create <b>17%</b></span>
                          </div>
                        </div>
                        <div className="coverage-note">
                          <span>!</span>
                          <div>
                            <strong>Actionable recommendation</strong>
                            <small>Consider replacing 1 duplicate understand question with an evaluation question.</small>
                          </div>
                          <button
                            onClick={() => setActiveNav("Reports")}
                            title="Open recommendations"
                          >
                            →
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}

              {/* TAB 2: NEW ANALYSIS WIZARD */}
              {activeNav === "New analysis" && (
                <section className="wizard-section">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">STEP-BY-STEP AUDIT WIZARD</p>
                      <h2>Configure & Launch AI Assessment Audit</h2>
                    </div>
                    <button className="outline-button" onClick={() => setActiveNav("Overview")}>
                      Back to overview
                    </button>
                  </div>

                  <div className="wizard-container">
                    <div className="wizard-card">
                      <div className="wizard-step-header">
                        <span className="step-badge">Step 1</span>
                        <h3>Course & Assessment Metadata</h3>
                      </div>
                      <div className="form-grid-2">
                        <label>
                          Target Course
                          <select
                            value={wizardCourse}
                            onChange={(e) => setWizardCourse(e.target.value)}
                            className="input-control"
                          >
                            <option>CSE 3105 - Database Management Systems</option>
                            <option>CSE 2101 - Data Structures & Algorithms</option>
                            <option>CSE 3201 - Algorithm Design</option>
                            <option>CSE 4107 - Artificial Intelligence</option>
                          </select>
                        </label>
                        <label>
                          Assessment Type
                          <select
                            value={wizardExamType}
                            onChange={(e) => setWizardExamType(e.target.value)}
                            className="input-control"
                          >
                            <option>Final Exam Draft</option>
                            <option>Midterm Exam Draft</option>
                            <option>Class Test / Quiz</option>
                            <option>Supplementary Exam</option>
                          </select>
                        </label>
                      </div>

                      <div className="wizard-step-header mt-6">
                        <span className="step-badge">Step 2</span>
                        <h3>Upload Documents</h3>
                      </div>
                      <div className="upload-grid">
                        <label className={wizardSyllabus ? "upload-card uploaded" : "upload-card"}>
                          <input
                            type="file"
                            accept=".pdf,.docx,.txt"
                            onChange={(e) => setWizardSyllabus(e.target.files?.[0]?.name || null)}
                          />
                          <span className="upload-symbol">{wizardSyllabus ? "✓" : "↑"}</span>
                          <span className="upload-title">{wizardSyllabus || "Upload Syllabus & COs"}</span>
                          <span className="upload-detail">PDF or DOCX containing topics & COs</span>
                          <span className="upload-action">{wizardSyllabus ? "Replace file" : "Select file"}</span>
                        </label>

                        <label className={wizardExam ? "upload-card uploaded" : "upload-card"}>
                          <input
                            type="file"
                            accept=".pdf,.docx,.txt"
                            onChange={(e) => setWizardExam(e.target.files?.[0]?.name || null)}
                          />
                          <span className="upload-symbol">{wizardExam ? "✓" : "↑"}</span>
                          <span className="upload-title">{wizardExam || "Upload Draft Exam Paper"}</span>
                          <span className="upload-detail">Exam questions with marks breakdown</span>
                          <span className="upload-action">{wizardExam ? "Replace file" : "Select file"}</span>
                        </label>

                        <div className="wizard-quick-fill">
                          <strong>Demo Quick Fill</strong>
                          <p>Load sample Data Structures syllabus and draft exam in one click:</p>
                          <button
                            type="button"
                            className="outline-button"
                            onClick={() => {
                              setWizardSyllabus("CSE_3105_DBMS_Syllabus.pdf");
                              setWizardExam("DBMS_Final_Exam_Draft_2026.pdf");
                            }}
                          >
                            ⚡ Load Sample Files
                          </button>
                        </div>
                      </div>

                      <div className="wizard-step-header mt-6">
                        <span className="step-badge">Step 3</span>
                        <h3>Audit Parameters</h3>
                      </div>
                      <div className="form-grid-3">
                        <div className="param-card">
                          <small>SIMILARITY THRESHOLD</small>
                          <strong>0.80 (pgvector cosine)</strong>
                          <span>Flag repetitions above 80% similarity</span>
                        </div>
                        <div className="param-card">
                          <small>LLM ENGINE</small>
                          <strong>Groq (Llama-3.3-70B)</strong>
                          <span>High-fidelity Bloom & CO classification</span>
                        </div>
                        <div className="param-card">
                          <small>TARGET HIGHER-ORDER BLOOM</small>
                          <strong>&gt;= 35%</strong>
                          <span>Apply, Analyze, Evaluate, Create</span>
                        </div>
                      </div>

                      {wizardProgress > 0 && (
                        <div className="wizard-progress-bar-wrap">
                          <div className="progress-labels">
                            <span>{wizardStepText}</span>
                            <strong>{wizardProgress}%</strong>
                          </div>
                          <div className="progress-track">
                            <div
                              className="progress-fill"
                              style={{ width: `${wizardProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {wizardFinished && (
                        <div className="wizard-finished-card">
                          <span className="check-large">✓</span>
                          <div>
                            <h4>Audit Pipeline Completed!</h4>
                            <p>
                              Mapped {wizardCourse} across 8 topics and 4 COs. Overall Assessment Quality Score: <strong>86/100</strong>.
                            </p>
                          </div>
                          <button
                            className="primary-button"
                            onClick={() => setActiveNav("Reports")}
                          >
                            <span>Open Detailed Audit Report</span>
                            <span>→</span>
                          </button>
                        </div>
                      )}

                      {!wizardFinished && (
                        <div className="wizard-submit-row">
                          <button
                            className="primary-button launch-big-btn"
                            disabled={!wizardSyllabus || !wizardExam || wizardProgress > 0}
                            onClick={runWizardAnalysis}
                          >
                            <span>{wizardProgress > 0 ? "Analyzing..." : "Launch AI Assessment Audit"}</span>
                            <span>→</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* TAB 3: QUESTION BANK */}
              {activeNav === "Question bank" && (
                <section className="bank-section">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">INSTITUTIONAL REPOSITORY</p>
                      <h2>Question Bank & Similarity Archive</h2>
                    </div>
                    <div className="bank-top-actions">
                      <button
                        className="primary-button"
                        onClick={() => setShowAddModal(true)}
                      >
                        + Add Question to Bank
                      </button>
                    </div>
                  </div>

                  {/* Filters Bar */}
                  <div className="bank-filter-bar">
                    <div className="search-field">
                      <span>🔍</span>
                      <input
                        type="text"
                        placeholder="Search questions by keyword, topic, or CO..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery("")}>✕</button>
                      )}
                    </div>

                    <div className="filter-group">
                      <label>Bloom&apos;s:</label>
                      <select
                        value={selectedBloom}
                        onChange={(e) => setSelectedBloom(e.target.value)}
                        className="filter-select"
                      >
                        <option value="ALL">All Levels</option>
                        <option value="REMEMBER">Remember</option>
                        <option value="UNDERSTAND">Understand</option>
                        <option value="APPLY">Apply</option>
                        <option value="ANALYZE">Analyze</option>
                        <option value="EVALUATE">Evaluate</option>
                        <option value="CREATE">Create</option>
                      </select>
                    </div>

                    <div className="filter-group">
                      <label>Outcome:</label>
                      <select
                        value={selectedCO}
                        onChange={(e) => setSelectedCO(e.target.value)}
                        className="filter-select"
                      >
                        <option value="ALL">All COs</option>
                        <option value="CO1">CO1</option>
                        <option value="CO2">CO2</option>
                        <option value="CO3">CO3</option>
                        <option value="CO4">CO4</option>
                      </select>
                    </div>

                    <label className="flag-toggle">
                      <input
                        type="checkbox"
                        checked={onlyFlagged}
                        onChange={(e) => setOnlyFlagged(e.target.checked)}
                      />
                      <span>Flagged repetitions only</span>
                    </label>
                  </div>

                  {/* Add Question Modal */}
                  {showAddModal && (
                    <div className="modal-backdrop">
                      <div className="modal-card">
                        <div className="modal-header">
                          <h3>Add Question to Question Bank</h3>
                          <button onClick={() => setShowAddModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleAddQuestion} className="modal-form">
                          <label>
                            Question Text
                            <textarea
                              required
                              rows={3}
                              placeholder="Enter the full exam question prompt..."
                              value={newQuestionPrompt}
                              onChange={(e) => setNewQuestionPrompt(e.target.value)}
                              className="input-control"
                            />
                          </label>

                          <div className="form-grid-2">
                            <label>
                              Topic
                              <input
                                type="text"
                                value={newQuestionTopic}
                                onChange={(e) => setNewQuestionTopic(e.target.value)}
                                className="input-control"
                              />
                            </label>
                            <label>
                              Course Outcome
                              <select
                                value={newQuestionCO}
                                onChange={(e) => setNewQuestionCO(e.target.value)}
                                className="input-control"
                              >
                                <option value="CO1">CO1 - Concepts</option>
                                <option value="CO2">CO2 - Design</option>
                                <option value="CO3">CO3 - Optimization</option>
                                <option value="CO4">CO4 - Analysis</option>
                              </select>
                            </label>
                          </div>

                          <div className="form-grid-2">
                            <label>
                              Bloom&apos;s Level
                              <select
                                value={newQuestionBloom}
                                onChange={(e) => setNewQuestionBloom(e.target.value as Question["bloom"])}
                                className="input-control"
                              >
                                <option value="Remember">Remember</option>
                                <option value="Understand">Understand</option>
                                <option value="Apply">Apply</option>
                                <option value="Analyze">Analyze</option>
                                <option value="Evaluate">Evaluate</option>
                                <option value="Create">Create</option>
                              </select>
                            </label>
                            <label>
                              Marks
                              <input
                                type="text"
                                value={newQuestionMarks}
                                onChange={(e) => setNewQuestionMarks(e.target.value)}
                                className="input-control"
                              />
                            </label>
                          </div>

                          <div className="modal-actions">
                            <button
                              type="button"
                              className="outline-button"
                              onClick={() => setShowAddModal(false)}
                            >
                              Cancel
                            </button>
                            <button type="submit" className="primary-button">
                              Save & Embed Question
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Questions Grid */}
                  <div className="bank-grid">
                    {filteredQuestions.map((q) => (
                      <div key={q.number} className="bank-item-card">
                        <div className="bank-item-top">
                          <span className="item-number">#{q.number}</span>
                          <span className="co-pill">{q.co}</span>
                          <span className={`bloom-pill ${q.bloom.toLowerCase()}`}>
                            {q.bloom}
                          </span>
                          <span className="marks-badge">{q.marks} Marks</span>
                        </div>

                        <p className="bank-item-prompt">{q.prompt}</p>

                        <div className="bank-item-topic">
                          <small>TOPIC</small>
                          <span>{q.topic}</span>
                        </div>

                        {q.similarity && (
                          <div className="bank-item-sim-alert">
                            <span className="alert-badge">⚠ REPETITION DETECTED ({q.similarity.score}%)</span>
                            <p>
                              Similar to <strong>{q.similarity.matchExam}</strong>:
                              <br />
                              <em>&ldquo;{q.similarity.matchQuestion}&rdquo;</em>
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                    {filteredQuestions.length === 0 && (
                      <div className="bank-empty">
                        <p>No questions found matching your filter criteria.</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* TAB 4: REPORTS */}
              {activeNav === "Reports" && (
                <section className="reports-section">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">ASSESSMENT AUDIT HISTORY</p>
                      <h2>Auditing Reports & Recommendations</h2>
                    </div>
                    <div className="report-action-buttons">
                      <button
                        className="outline-button"
                        onClick={() => window.print()}
                      >
                        Print / Export PDF <span>↗</span>
                      </button>
                      <button
                        className="outline-button"
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(activeReport, null, 2)], {
                            type: "application/json",
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${activeReport.title.replace(/\s+/g, "_")}.json`;
                          a.click();
                        }}
                      >
                        Export JSON <span>↓</span>
                      </button>
                    </div>
                  </div>

                  <div className="reports-layout">
                    {/* Left: Report selector */}
                    <div className="reports-sidebar-list">
                      <h3>Generated Reports</h3>
                      {reportsList.map((r) => (
                        <div
                          key={r.id}
                          className={r.id === selectedReportId ? "report-item active" : "report-item"}
                          onClick={() => setSelectedReportId(r.id)}
                        >
                          <div className="report-item-header">
                            <strong>{r.title}</strong>
                            <span className={`status-tag ${r.status === "Approved" ? "approved" : "warn"}`}>
                              {r.status}
                            </span>
                          </div>
                          <small>{r.course}</small>
                          <div className="report-item-footer">
                            <span>Score: {r.qualityScore}/100</span>
                            <span>{r.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right: Active report details */}
                    <div className="report-detail-view">
                      <div className="detail-header">
                        <div>
                          <span className="eyebrow">{activeReport.course}</span>
                          <h2>{activeReport.title}</h2>
                          <p className="detail-date">Audited on {activeReport.date} · Evaluator: {user?.name}</p>
                        </div>
                        <div className="score-badge-large">
                          <strong>{activeReport.qualityScore}</strong>
                          <span>/ 100 Quality</span>
                        </div>
                      </div>

                      <div className="metric-grid">
                        <div className="metric-card">
                          <span className="metric-label">QUESTIONS ANALYZED</span>
                          <strong>{activeReport.questionsCount}</strong>
                          <div className="metric-trend neutral">All parsed cleanly</div>
                        </div>
                        <div className="metric-card">
                          <span className="metric-label">COVERAGE GAPS</span>
                          <strong>{activeReport.coverageGaps}</strong>
                          <div className="metric-trend warn">Requires attention</div>
                        </div>
                        <div className="metric-card">
                          <span className="metric-label">SIMILARITY ALERTS</span>
                          <strong>{activeReport.similarities}</strong>
                          <div className="metric-trend down">Historical overlap</div>
                        </div>
                        <div className="metric-card">
                          <span className="metric-label">ALIGNMENT STATUS</span>
                          <strong>{activeReport.status}</strong>
                          <div className="metric-trend up">Accreditation Ready</div>
                        </div>
                      </div>

                      <div className="report-actionable-card">
                        <div className="actionable-header">
                          <span className="bulb-icon">💡</span>
                          <h3>AI Actionable Improvements & Suggestions</h3>
                        </div>
                        <p className="actionable-text">{activeReport.recommendation}</p>

                        <div className="suggestions-list">
                          <div className="suggestion-box">
                            <strong>1. Replace Question 01 (Repetition Flag)</strong>
                            <p>Question 01 has a 94% similarity score with the 2024 Midterm. Suggested replacement:</p>
                            <div className="suggested-q">
                              <em>&ldquo;Explain B-Tree indexing vs LSM Trees in write-intensive database architectures.&rdquo;</em>
                              <span className="q-tags">Topic: Indexing · Bloom: Analyze · 05 Marks</span>
                            </div>
                          </div>

                          <div className="suggestion-box">
                            <strong>2. Fill Syllabus Coverage Gap</strong>
                            <p>Syllabus Module 4 (Query Optimization & Cost Estimation) currently has 0 marks assigned. Recommended addition:</p>
                            <div className="suggested-q">
                              <em>&ldquo;Given an execution plan with sequential scans on a 2M-row table, propose a revised query plan with estimated cost reduction.&rdquo;</em>
                              <span className="q-tags">Topic: Query Optimization · Bloom: Create · 10 Marks</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
