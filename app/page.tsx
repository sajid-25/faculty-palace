"use client";

import { ChangeEvent, useState } from "react";

const questions = [
  { number: "01", prompt: "Explain the role of normalization in relational databases.", topic: "Database Design", co: "CO2", bloom: "Understand", marks: "05" },
  { number: "02", prompt: "Design an indexing strategy for a high-traffic transaction table.", topic: "Query Optimization", co: "CO3", bloom: "Create", marks: "10" },
  { number: "03", prompt: "Compare two-phase locking with timestamp ordering.", topic: "Concurrency", co: "CO4", bloom: "Analyze", marks: "10" },
  { number: "04", prompt: "Write SQL queries to retrieve students with above-average scores.", topic: "SQL Programming", co: "CO2", bloom: "Apply", marks: "05" },
];

const navItems = ["Overview", "New analysis", "Question bank", "Reports"];

export default function Home() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [syllabus, setSyllabus] = useState<string | null>(null);
  const [exam, setExam] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFile = (event: ChangeEvent<HTMLInputElement>, type: "syllabus" | "exam") => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (type === "syllabus") setSyllabus(file.name);
    else setExam(file.name);
  };

  const runAnalysis = () => {
    if (!syllabus || !exam) return;
    setIsAnalyzing(true);
    window.setTimeout(() => setIsAnalyzing(false), 900);
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">A</span><span>assess<span>iq</span></span></div>
        <div className="workspace-switcher"><span className="workspace-dot">FP</span><span><small>WORKSPACE</small>Faculty Palace</span><b>⌄</b></div>
        <nav className="main-nav" aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          {navItems.map((item, index) => <button className={activeNav === item ? "nav-item active" : "nav-item"} onClick={() => setActiveNav(item)} key={item}><span className="nav-icon">{["◈", "+", "▦", "▤"][index]}</span>{item}{item === "Reports" && <span className="nav-count">3</span>}</button>)}
        </nav>
        <div className="sidebar-bottom"><div className="help-card"><span className="help-icon">?</span><div><strong>Need a hand?</strong><small>Read the quick guide</small></div><span>↗</span></div><button className="profile"><span className="avatar">AM</span><span><strong>Arjun Mehta</strong><small>Faculty admin</small></span><span className="profile-more">•••</span></button></div>
      </aside>

      <section className="content-area">
        <header className="topbar"><div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{activeNav}</strong></div><div className="top-actions"><button className="icon-button" aria-label="Notifications">♧<i /></button><button className="outline-button">View question bank <span>↗</span></button></div></header>
        <div className="content-wrap">
          <section className="intro"><div><p className="eyebrow">MONDAY, SEPTEMBER 07, 2026</p><h1>Good morning, Arjun<span>.</span></h1><p className="intro-copy">Turn your draft assessments into clear, confident decisions.</p></div><div className="intro-status"><span className="status-dot" /> System ready <span className="status-divider" /> Last synced 2 min ago</div></section>

          <section className="upload-section"><div className="section-heading"><div><p className="eyebrow">START HERE</p><h2>Analyze a new assessment</h2></div><span className="step-label"><b>01</b> Upload documents <i /> <span>02</span> Review insights</span></div>
            <div className="upload-grid">
              <label className={syllabus ? "upload-card uploaded" : "upload-card"}><input type="file" accept=".pdf,.doc,.docx" onChange={(event) => handleFile(event, "syllabus")} /><span className="upload-symbol">{syllabus ? "✓" : "↑"}</span><span className="upload-title">{syllabus || "Add your syllabus"}</span><span className="upload-detail">{syllabus ? "Ready to analyze" : "PDF, DOCX up to 10 MB"}</span><span className="upload-action">{syllabus ? "Replace file" : "Browse files"}</span></label>
              <label className={exam ? "upload-card uploaded" : "upload-card"}><input type="file" accept=".pdf,.doc,.docx" onChange={(event) => handleFile(event, "exam")} /><span className="upload-symbol">{exam ? "✓" : "↑"}</span><span className="upload-title">{exam || "Add your draft exam"}</span><span className="upload-detail">{exam ? "Ready to analyze" : "PDF, DOCX up to 10 MB"}</span><span className="upload-action">{exam ? "Replace file" : "Browse files"}</span></label>
              <div className="analysis-launch"><div><span className="launch-number">2</span><p><strong>Documents uploaded</strong><small>We&apos;ll map every question to your course structure.</small></p></div><button className="primary-button" disabled={!syllabus || !exam || isAnalyzing} onClick={runAnalysis}>{isAnalyzing ? "Analyzing..." : "Run analysis"}<span>→</span></button></div>
            </div>
          </section>

          <section className="insights-section"><div className="section-heading report-heading"><div><p className="eyebrow">LATEST REPORT · DBMS FINAL EXAM</p><h2>Assessment snapshot</h2></div><button className="text-button">Open full report <span>→</span></button></div><div className="metric-grid"><div className="metric-card accent"><span className="metric-label">QUALITY SCORE <b>ⓘ</b></span><strong>82<span>/100</span></strong><div className="metric-trend up">↑ 8% <small>vs last assessment</small></div><div className="score-line"><i /></div></div><div className="metric-card"><span className="metric-label">QUESTIONS PARSED</span><strong>24</strong><div className="metric-trend neutral">24 of 24 <small>questions recognized</small></div></div><div className="metric-card"><span className="metric-label">TOPICS COVERED</span><strong>8<span>/10</span></strong><div className="metric-trend warn">2 gaps <small>need attention</small></div></div><div className="metric-card"><span className="metric-label">SIMILARITY FLAGS</span><strong>3</strong><div className="metric-trend down">↓ 2 <small>vs last assessment</small></div></div></div>
            <div className="report-grid"><div className="panel question-panel"><div className="panel-header"><div><h3>Question analysis</h3><p>Topic, outcome, and cognitive level mapping</p></div><button className="more-button" aria-label="More options">•••</button></div><div className="table-wrap"><table><thead><tr><th>QUESTION</th><th>TOPIC</th><th>OUTCOME</th><th>BLOOM&apos;S LEVEL</th><th>MARKS</th></tr></thead><tbody>{questions.map((question) => <tr key={question.number}><td><span className="question-number">{question.number}</span><span className="question-prompt">{question.prompt}</span></td><td>{question.topic}</td><td><span className="co-pill">{question.co}</span></td><td><span className={`bloom-pill ${question.bloom.toLowerCase()}`}>{question.bloom}</span></td><td><strong>{question.marks}</strong></td></tr>)}</tbody></table></div><button className="panel-footer">View all 24 questions <span>→</span></button></div><div className="panel coverage-panel"><div className="panel-header"><div><h3>Coverage balance</h3><p>Marks by Bloom&apos;s taxonomy</p></div><button className="more-button" aria-label="More options">•••</button></div><div className="donut-wrap"><div className="donut"><div><strong>24</strong><span>questions</span></div></div><div className="legend"><span><i className="legend-dot remember" />Remember <b>8%</b></span><span><i className="legend-dot understand" />Understand <b>21%</b></span><span><i className="legend-dot apply" />Apply <b>29%</b></span><span><i className="legend-dot analyze" />Analyze <b>25%</b></span><span><i className="legend-dot create" />Create <b>17%</b></span></div></div><div className="coverage-note"><span>!</span><p><strong>One area to improve</strong><small>Consider adding more evaluation-level questions.</small></p><button aria-label="Open insight">→</button></div></div></div>
          </section>
        </div>
      </section>
    </main>
  );
}
