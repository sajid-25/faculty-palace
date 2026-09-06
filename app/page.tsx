"use client";

import { ChangeEvent, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, DEMO_USERS } from "./context/AuthContext";

type Question = {
  id?: string;
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

type ReportItem = {
  id: string;
  title: string;
  course: string;
  date: string;
  qualityScore: number;
  questionsCount: number;
  coverageGaps: number;
  similarities: number;
  status: "Approved" | "Action Needed" | "Under Review";
  recommendation: string;
};

const initialReports: ReportItem[] = [
  {
    id: "rep-1",
    title: "Computer Networks Final Exam Draft 2026",
    course: "CSE-NETWORKS · Computer Networks",
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

function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link className="brand landing-brand" href="/">
          <span className="brand-mark">FP</span>
          <span>faculty<span>palace</span></span>
        </Link>
        <nav className="landing-nav" aria-label="Landing page navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#roles">For faculty</a>
          <Link href="/login">Sign in</Link>
          <Link className="landing-cta" href="/register">Get started <span>→</span></Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="eyebrow">ACADEMIC ASSESSMENT INTELLIGENCE</p>
          <h1>Better exams begin<br />with <em>better questions.</em></h1>
          <p className="landing-description">Faculty Palace helps academic teams audit draft assessments, align questions to course outcomes, and build exams students can learn from.</p>
          <div className="landing-actions"><Link className="landing-primary" href="/register">Create your workspace <span>→</span></Link><Link className="landing-secondary" href="/login">Already have an account? Sign in</Link></div>
          <div className="landing-trust"><span className="trust-line" /><span>Built for thoughtful assessment teams</span></div>
        </div>
        <div className="landing-hero-visual" aria-label="Assessment quality overview preview">
          <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
          <div className="visual-report-card"><div className="visual-card-top"><span className="visual-card-kicker">LATEST AUDIT</span><span className="visual-status">● READY</span></div><h2>Computer Networks Exam</h2><p>Assessment quality report</p><div className="visual-score-row"><div className="visual-score"><strong>82</strong><span>/100</span></div><div className="visual-score-copy"><b>Strong foundation</b><small>↑ 8% from last assessment</small></div></div><div className="visual-bars"><i /><i /><i /><i /><i /></div><div className="visual-tags"><span>Topics covered</span><span>Questions analyzed</span></div></div>
          <div className="visual-float visual-float-top"><span>✓</span><div><b>CO alignment</b><small>92% confidence</small></div></div><div className="visual-float visual-float-bottom"><span>!</span><div><b>2 coverage gaps</b><small>Worth a closer look</small></div></div>
        </div>
      </section>

      <section className="landing-features" id="how-it-works"><div className="landing-section-heading"><p className="eyebrow">ONE CLEAR WORKFLOW</p><h2>From draft paper to confident decision.</h2></div><div className="feature-grid"><article><span className="feature-number">01</span><h3>Upload your materials</h3><p>Bring together your syllabus, course outcomes, and draft exam in one focused workspace.</p></article><article><span className="feature-number">02</span><h3>See what the questions reveal</h3><p>Map topics, outcomes, Bloom&apos;s levels, coverage gaps, and repeated questions at a glance.</p></article><article><span className="feature-number">03</span><h3>Improve with purpose</h3><p>Give every finding a reason and an actionable next step before the paper reaches students.</p></article></div></section>

      <section className="landing-roles" id="roles"><div><p className="eyebrow">DESIGNED FOR THE WHOLE TEAM</p><h2>One standard.<br /><em>Three perspectives.</em></h2></div><p>Role-based workspaces give instructors, department heads, and external examiners the right level of visibility and control.</p><Link className="landing-secondary" href="/register">Choose your role <span>→</span></Link></section>
      <footer className="landing-footer"><span>© 2026 Faculty Palace</span><span>Assessment quality assurance, made clearer.</span><Link href="/login">Sign in to workspace ↗</Link></footer>
    </main>
  );
}

export default function Home() {
  const { user, roleConfig, isLoggedIn, isLoading, logout, login, can } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("Overview");

  // Reports state
  const [reports, setReports] = useState<ReportItem[]>(initialReports);
  const [selectedReportId, setSelectedReportId] = useState("rep-1");
  const [approvalToast, setApprovalToast] = useState<string | null>(null);

  // Overview states
  const [syllabus, setSyllabus] = useState<string | null>(null);
  const [exam, setExam] = useState<string | null>(null);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [examFile, setExamFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // New Analysis Wizard state
  const [wizardCourse, setWizardCourse] = useState("CSE-NETWORKS - Computer Networks");
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
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestionPrompt, setNewQuestionPrompt] = useState("");
  const [newQuestionTopic, setNewQuestionTopic] = useState("Database Design");
  const [newQuestionCO, setNewQuestionCO] = useState("CO2");
  const [newQuestionBloom, setNewQuestionBloom] = useState<Question["bloom"]>("Apply");
  const [newQuestionMarks, setNewQuestionMarks] = useState("05");

  useEffect(() => {
    if (!isLoggedIn) return;
    const loadQuestions = window.setTimeout(() => {
      setIsLoadingQuestions(true);
      fetch("/api/questions")
        .then(async (response) => {
          const payload = await response.json();
          if (!response.ok) throw new Error(payload.error || "Unable to load question bank.");
          setQuestions(payload.data as Question[]);
        })
        .catch((error) => setAnalysisError(error instanceof Error ? error.message : "Unable to load question bank."))
        .finally(() => setIsLoadingQuestions(false));
    }, 0);
    return () => window.clearTimeout(loadQuestions);
  }, [isLoggedIn]);

  const handleFile = (event: ChangeEvent<HTMLInputElement>, type: "syllabus" | "exam") => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (type === "syllabus") {
      setSyllabus(file.name);
      setSyllabusFile(file);
    } else {
      setExam(file.name);
      setExamFile(file);
    }
  };

  const runAnalysis = async () => {
    if (!syllabusFile || !examFile) return;
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setAnalysisError(null);

    try {
      const syllabusForm = new FormData();
      syllabusForm.append("file", syllabusFile);
      syllabusForm.append("courseCode", "CSE-NETWORKS");
      syllabusForm.append("courseName", "Computer Networks");
      const syllabusResponse = await fetch("/api/upload/syllabus", { method: "POST", body: syllabusForm });
      if (!syllabusResponse.ok) throw new Error((await syllabusResponse.json()).error || "Syllabus upload failed.");

      const examForm = new FormData();
      examForm.append("file", examFile);
      examForm.append("courseCode", "CSE-NETWORKS");
      examForm.append("examTitle", examFile.name);
      const examResponse = await fetch("/api/upload/exam", { method: "POST", body: examForm });
      const examData = await examResponse.json();
      if (!examResponse.ok) throw new Error(examData.error || "Exam upload failed.");

      const analysisResponse = await fetch("/api/analysis/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examPaperId: examData.data.id }),
      });
      const analysisData = await analysisResponse.json();
      if (!analysisResponse.ok) throw new Error(analysisData.error || "Analysis failed.");
      const report = analysisData.data.report;
      const analysisByNumber = new Map<number, { topic: string; course_outcome: string; bloom_level: Question["bloom"] }>((analysisData.data.analyses || []).map((item: { question_id_number: number; topic: string; course_outcome: string; bloom_level: Question["bloom"] }) => [item.question_id_number, item]));
      const similarityByQuestion = new Map<string, { previousCount: number }>((analysisData.data.similarities || []).map((item: { questionId: string; previousCount: number }) => [item.questionId, item]));
      setQuestions(analysisData.data.questions.map((question: { id: string; question_number: number; question_text: string; marks: number }, index: number) => {
        const analysis = analysisByNumber.get(question.question_number);
        const similarity = similarityByQuestion.get(question.id);
        return {
          number: String(question.question_number || index + 1).padStart(2, "0"),
          prompt: question.question_text,
          topic: analysis?.topic || "Unmapped",
          co: analysis?.course_outcome || "Unmapped",
          bloom: analysis?.bloom_level || "Understand",
          marks: String(question.marks).padStart(2, "0"),
          similarity: similarity?.previousCount ? { score: 75, matchExam: `${similarity.previousCount} prior match(es)`, matchQuestion: "Historical question similarity detected" } : undefined,
        };
      }));
      setReports((previous) => previous.map((item) => item.id === "rep-1" ? {
        ...item,
        qualityScore: report.quality_score,
        questionsCount: analysisData.data.questionCount,
        coverageGaps: report.missing_topics.length,
        similarities: report.similarity_flags.length,
        status: "Action Needed",
        recommendation: report.recommendations.join(" "),
      } : item));
      setAnalysisComplete(true);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : "Unable to analyze this assessment.");
    } finally {
      setIsAnalyzing(false);
    }
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

  const handleUpdateReportStatus = (id: string, newStatus: ReportItem["status"]) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    setApprovalToast(
      newStatus === "Approved"
        ? "✓ Exam Draft Approved! Official printable version generated."
        : "↺ Revision requested. Feedback sent to Course Instructor."
    );
    setTimeout(() => setApprovalToast(null), 3500);
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
    const availableReports = user?.role === "admin"
      ? reports
      : user?.role === "reviewer"
      ? reports.filter((report) => report.status === "Approved")
      : reports.filter((report) => report.id === "rep-1");
    return availableReports.find((r) => r.id === selectedReportId) || availableReports[0];
  }, [reports, selectedReportId, user?.role]);

  const accessibleReports = user?.role === "admin"
    ? reports
    : user?.role === "reviewer"
    ? reports.filter((report) => report.status === "Approved")
    : reports.filter((report) => report.id === "rep-1");

  const visibleNavItems = user?.role === "reviewer"
    ? ["Overview", "Question bank", "Reports"]
    : navItems;

  if (isLoading) {
    return <div className="route-loading">Loading your Faculty Palace workspace...</div>;
  }

  if (pathname === "/" && !isLoggedIn) {
    return <LandingPage />;
  }

  if (pathname === "/dashboard" && !isLoggedIn) {
    router.replace("/login");
    return <div className="route-loading">Checking your workspace access...</div>;
  }

  return (
    <main className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">FP</span>
          <span>faculty<span>palace</span></span>
        </div>

        <div className="workspace-switcher">
          <span className="workspace-dot">{isLoggedIn ? (user?.initials || "FP") : "🔒"}</span>
          <div>
            <small>ROLE-BASED WORKSPACE</small>
            <strong>{isLoggedIn ? (roleConfig?.label || "Faculty") : "Guest Mode"}</strong>
          </div>
          <b>⌄</b>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <p className="nav-label">Navigation</p>
          {visibleNavItems.map((item) => {
            const icons = ["◈", "+", "▦", "▤"];
            const iconIndex = navItems.indexOf(item);
            return (
              <button
                key={item}
                className={activeNav === item ? "nav-item active" : "nav-item"}
                onClick={() => setActiveNav(item)}
              >
                <span className="nav-icon">{icons[iconIndex]}</span>
                {item}
                {item === "Reports" && <span className="nav-count">{accessibleReports.length}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-icon">?</span>
            <div>
              <strong>Faculty Palace Guide</strong>
              <small>Role-based Permissions</small>
            </div>
            <span>↗</span>
          </div>

          {isLoggedIn ? (
            <div className="profile-wrapper">
              <button className="profile" title="Logged in user profile">
                <span className="avatar">{user?.initials || "FA"}</span>
                <div>
                  <strong>{user?.name}</strong>
                  <small>{roleConfig?.label}</small>
                </div>
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
                <small>Sign in to unlock roles</small>
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
            {isLoggedIn ? (
              <span className={`role-pill topbar-role ${roleConfig?.badgeClass}`}>
                {roleConfig?.label}
              </span>
            ) : (
              <span className="guest-badge">Guest Preview</span>
            )}
          </div>

          <div className="top-actions">
            {isLoggedIn ? (
              <>
                <div className="user-top-pill">
                  <span className="user-dot-online" />
                  <span>{user?.name}</span>
                </div>
                <button className="signout-link-btn" onClick={logout}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <div className="guest-demo-pills">
                  <button
                    className="demo-pill-btn admin"
                    onClick={() => void login(DEMO_USERS.admin.email, "AssessIQDemo123!")}
                  >
                    🏛 Dept Head
                  </button>
                  <button
                    className="demo-pill-btn faculty"
                    onClick={() => void login(DEMO_USERS.faculty.email, "AssessIQDemo123!")}
                  >
                    👨‍🏫 Instructor
                  </button>
                  <button
                    className="demo-pill-btn reviewer"
                    onClick={() => void login(DEMO_USERS.reviewer.email, "AssessIQDemo123!")}
                  >
                    🔍 Reviewer
                  </button>
                </div>
                <Link className="auth-link auth-link-muted" href="/login">
                  Sign in
                </Link>
                <Link className="auth-link auth-link-primary" href="/register">
                  Register <span>→</span>
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
                <div className="gate-tag">ROLE-BASED ACADEMIC AUDITING</div>
                <h2>Sign in to access your assessment workspace</h2>
                <p className="gate-description">
                  Faculty Palace enforces role-based access control (RBAC). Course Instructors upload draft exams and run AI audits,
                  Department Heads approve papers for printing, and External Examiners conduct independent moderation.
                </p>

                <div className="gate-roles-overview">
                  <div className="role-showcase-card">
                    <span className="role-icon">🏛</span>
                    <strong>Department Head / Admin</strong>
                    <p>Approve or request revisions on exam papers, audit cross-course outcomes, and manage question archives.</p>
                    <button
                      className="role-launch-btn"
                      onClick={() => void login(DEMO_USERS.admin.email, "AssessIQDemo123!")}
                    >
                      Enter as Dept Head →
                    </button>
                  </div>

                  <div className="role-showcase-card">
                    <span className="role-icon">👨‍🏫</span>
                    <strong>Course Instructor</strong>
                    <p>Upload syllabus & draft exams, launch AI audits for Bloom & CO coverage, and generate question suggestions.</p>
                    <button
                      className="role-launch-btn"
                      onClick={() => void login(DEMO_USERS.faculty.email, "AssessIQDemo123!")}
                    >
                      Enter as Instructor →
                    </button>
                  </div>

                  <div className="role-showcase-card">
                    <span className="role-icon">🔍</span>
                    <strong>External Examiner</strong>
                    <p>Moderation review of draft assessments, verification of cognitive balance, and compliance checks.</p>
                    <button
                      className="role-launch-btn"
                      onClick={() => void login(DEMO_USERS.reviewer.email, "AssessIQDemo123!")}
                    >
                      Enter as Examiner →
                    </button>
                  </div>
                </div>

                <div className="gate-cta-row mt-6">
                  <Link href="/login" className="outline-button gate-outline">
                    Sign in with credentials
                  </Link>
                  <Link href="/register" className="text-button gate-text">
                    Create new account with custom role <span>↗</span>
                  </Link>
                </div>
              </div>
            </section>
          ) : (
            /* Logged in: Role-Tailored Workspace */
            <>
              {/* Role Scope Banner */}
              <div className="role-scope-banner">
                <div className="scope-info">
                  <span className={`role-pill ${roleConfig?.badgeClass}`}>
                    {roleConfig?.label} Access
                  </span>
                  <p>{roleConfig?.description}</p>
                </div>
                {user?.role === "admin" && (
                  <span className="scope-privilege-tag">✓ Exam Paper Approval Authority</span>
                )}
                {user?.role === "reviewer" && (
                  <span className="scope-privilege-tag reviewer">👁 Moderation Inspection Mode</span>
                )}
              </div>

              {/* Toast message if admin approved report */}
              {approvalToast && (
                <div className="approval-floating-toast" role="status">
                  <span>{approvalToast.startsWith("✓") ? "✓" : "↺"}</span>
                  <p>{approvalToast}</p>
                </div>
              )}

              {/* TAB 1: OVERVIEW */}
              {activeNav === "Overview" && (
                <>
                  <section className="intro">
                    <div>
                      <p className="eyebrow">{roleConfig?.title.toUpperCase()} · 2026</p>
                      <h1>
                        Good morning, {user?.name?.split(" ")[0]}
                        <span>.</span>
                      </h1>
                      <p className="intro-copy">
                        {user?.role === "admin"
                          ? "You have department-wide auditing authority. Review draft assessments and authorize final exams."
                          : user?.role === "reviewer"
                          ? "You are moderating department assessments. Inspect Bloom balances and syllabus coverage."
                          : "Upload and audit your course draft assessments to align outcomes and cognitive depth."}
                      </p>
                    </div>
                    <div className="intro-status">
                      <span className="status-dot" /> System ready{" "}
                      <span className="status-divider" /> {roleConfig?.label} Mode
                    </div>
                  </section>

                  {/* Upload Section - Role Controlled */}
                  <section className="upload-section">
                    <div className="section-heading">
                      <div>
                        <p className="eyebrow">QUICK ASSESSMENT AUDIT</p>
                        <h2>Analyze an assessment paper</h2>
                      </div>
                      <span className="step-label">
                        <b>01</b> Upload documents <i /> <span>02</span> Review insights
                      </span>
                    </div>

                    {!can("upload") ? (
                      <div className="reviewer-readonly-box">
                        <span className="box-icon">👁</span>
                        <div>
                          <strong>External Examiner Read-Only Mode</strong>
                          <p>
                            Exam paper uploads are restricted to Course Instructors and Department Admins.
                            You can inspect existing evaluated papers and historical similarity reports below.
                          </p>
                        </div>
                        <button
                          className="outline-button"
                          onClick={() => setActiveNav("Reports")}
                        >
                          View Reports Archive ↗
                        </button>
                      </div>
                    ) : (
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
                                  : "Upload syllabus and draft exam to launch analysis."}
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
                    )}

                    {analysisComplete && (
                      <div className="analysis-success-toast">
                        <span>✓</span>
                        <div>
                          <strong>Audit completed successfully!</strong>
                          <small>24 questions parsed, Bloom levels classified, and 3 similarity alerts generated below.</small>
                        </div>
                        <button onClick={() => setActiveNav("Reports")}>View full report →</button>
                      </div>
                    )}
                    {analysisError && <div className="analysis-error-toast" role="alert">⚠ {analysisError}</div>}
                  </section>

                  {/* Insights / Snapshot */}
                  <section className="insights-section">
                    <div className="section-heading report-heading">
                      <div>
                        <p className="eyebrow">LATEST AUDIT · COMPUTER NETWORKS FINAL EXAM</p>
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
                        <div className="metric-trend neutral">24 of 24 <small>recognized</small></div>
                      </div>
                      <div className="metric-card">
                        <span className="metric-label">TOPICS COVERED</span>
                        <strong>8<span>/10</span></strong>
                        <div className="metric-trend warn">2 gaps <small>need attention</small></div>
                      </div>
                      <div className="metric-card">
                        <span className="metric-label">SIMILARITY FLAGS</span>
                        <strong>3</strong>
                        <div className="metric-trend down">↓ 2 <small>vs last exam</small></div>
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
                            <small>Replace 1 duplicate understand question with an evaluation question.</small>
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

                  {!can("configureAudit") ? (
                    <div className="reviewer-readonly-box">
                      <span className="box-icon">🔍</span>
                      <div>
                        <strong>External Examiner View</strong>
                        <p>
                          Configuration of new audits is reserved for Course Instructors and Department Administrators.
                          You can review finalized results in the Reports tab.
                        </p>
                      </div>
                      <button className="primary-button" onClick={() => setActiveNav("Reports")}>
                        Go to Reports Archive →
                      </button>
                    </div>
                  ) : (
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
                              <option>CSE-NETWORKS - Computer Networks</option>
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
                            <p>Load sample Computer Networks syllabus and draft exam in one click:</p>
                            <button
                              type="button"
                              className="outline-button"
                              onClick={() => {
                                setWizardSyllabus("CSE_NETWORKS_Syllabus.pdf");
                                setWizardExam("Computer_Networks_Final_Exam_Draft_2026.pdf");
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
                  )}
                </section>
              )}

              {/* TAB 3: QUESTION BANK */}
              {activeNav === "Question bank" && (
                <section className="bank-section">
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">INSTITUTIONAL REPOSITORY</p>
                      <h2>Question Bank & Similarity Archive</h2>
                      {isLoadingQuestions && <small className="data-loading-label">Loading questions from Supabase...</small>}
                    </div>
                    <div className="bank-top-actions">
                      {can("editBank") ? (
                        <button
                          className="primary-button"
                          onClick={() => setShowAddModal(true)}
                        >
                          + Add Question to Bank
                        </button>
                      ) : (
                        <span className="badge-readonly">Read-Only Moderation Mode</span>
                      )}
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
                  {showAddModal && can("editBank") && (
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
                      <div key={q.id || q.number} className="bank-item-card">
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
                      <h2>Auditing Reports & Governance</h2>
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
                      <h3>Department Audit Reports</h3>
                      {accessibleReports.map((r) => (
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
                          <p className="detail-date">Audited on {activeReport.date} · Evaluator: {user?.name} ({roleConfig?.label})</p>
                        </div>
                        <div className="score-badge-large">
                          <strong>{activeReport.qualityScore}</strong>
                          <span>/ 100 Quality</span>
                        </div>
                      </div>

                      {/* Role-Specific Action Bar: Admin Approval Authority */}
                      <div className="admin-governance-bar">
                        <div className="gov-info">
                          <span className="gov-tag">EXAM COMMITTEE GOVERNANCE</span>
                          <p>
                            Current Status: <strong className={`status-text ${activeReport.status.toLowerCase().replace(/\s+/g, "-")}`}>{activeReport.status}</strong>
                          </p>
                        </div>

                        {can("approve") ? (
                          <div className="gov-actions">
                            <button
                              className="btn-approve"
                              onClick={() => handleUpdateReportStatus(activeReport.id, "Approved")}
                              disabled={activeReport.status === "Approved"}
                            >
                              ✓ {activeReport.status === "Approved" ? "Paper Approved" : "Approve Exam Paper"}
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => handleUpdateReportStatus(activeReport.id, "Action Needed")}
                              disabled={activeReport.status === "Action Needed"}
                            >
                              ↺ Request Revision
                            </button>
                          </div>
                        ) : (
                          <div className="gov-note">
                            <small>
                              {user?.role === "reviewer"
                                ? "👁 External moderation complete. Approval delegated to Department Head."
                                : "ℹ Approval authority reserved for Exam Committee Chair / Dept Head."}
                            </small>
                          </div>
                        )}
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
                          <span className="metric-label">STATUS</span>
                          <strong style={{ fontSize: "20px" }}>{activeReport.status}</strong>
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
