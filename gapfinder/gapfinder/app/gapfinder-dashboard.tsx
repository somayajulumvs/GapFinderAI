"use client";

import { useState } from "react";
import type { ChangeEvent, ReactNode } from "react";

type TopicLevel = "Needs work" | "Building" | "Strong";
type Topic = { name: string; unit: string; score: number; level: TopicLevel; note: string };
type Task = { title: string; detail: string; topic: string; done: boolean };

const initialTopics: Topic[] = [
  { name: "Cellular respiration", unit: "Unit 4 · Energy in cells", score: 38, level: "Needs work", note: "Confuses the stages where ATP is produced." },
  { name: "Mitosis & meiosis", unit: "Unit 3 · Cell division", score: 54, level: "Building", note: "Understands the sequence; needs practice comparing outcomes." },
  { name: "DNA replication", unit: "Unit 5 · Molecular genetics", score: 62, level: "Building", note: "Mostly accurate, but enzyme roles are not yet consistent." },
  { name: "Cell structure", unit: "Unit 1 · Foundations", score: 84, level: "Strong", note: "Accurately identifies organelles and their functions." },
];

const initialPlan: Task[] = [
  { title: "Trace the stages of cellular respiration", detail: "Review notes · 12 min", topic: "Cellular respiration", done: false },
  { title: "Compare mitosis and meiosis", detail: "Practice set · 10 min", topic: "Mitosis & meiosis", done: false },
  { title: "Recall the enzymes in DNA replication", detail: "Flash review · 8 min", topic: "DNA replication", done: true },
];

const questions = [
  { topic: "Cellular respiration", prompt: "Where does the Krebs cycle take place in a eukaryotic cell?", options: ["Cytoplasm", "Mitochondrial matrix", "Inner mitochondrial membrane", "Nucleus"], answer: 1, explanation: "The Krebs cycle takes place in the mitochondrial matrix. The electron transport chain, by contrast, is located on the inner mitochondrial membrane.", source: "Cell biology notes · Unit 4, section 2" },
  { topic: "Mitosis & meiosis", prompt: "How many daughter cells are produced by one round of mitosis?", options: ["One", "Two", "Four", "Eight"], answer: 1, explanation: "Mitosis produces two genetically identical daughter cells. Meiosis involves two divisions and produces four haploid cells.", source: "Cell biology notes · Unit 3, section 1" },
  { topic: "DNA replication", prompt: "Which enzyme joins Okazaki fragments on the lagging strand?", options: ["Helicase", "DNA polymerase", "DNA ligase", "RNA primase"], answer: 2, explanation: "DNA ligase seals the gaps between Okazaki fragments, joining them into a continuous strand.", source: "Cell biology notes · Unit 5, section 3" },
  { topic: "Cell structure", prompt: "Which organelle is the site of aerobic respiration?", options: ["Nucleus", "Mitochondrion", "Ribosome", "Cell membrane"], answer: 1, explanation: "Mitochondria are the site of aerobic respiration in eukaryotic cells.", source: "Cell biology notes · Unit 1, section 1" },
];

const navItems = ["Overview", "My materials", "Topic map", "Revision plan", "Progress"] as const;
type View = (typeof navItems)[number];

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true">g<span>.</span></span>;
}

function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{action}</div>;
}

function ViewHeader({ label, title, description, action }: { label: string; title: string; description: string; action?: ReactNode }) {
  return <div className="view-header"><div><p className="eyebrow">{label}</p><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

export default function GapFinderDashboard() {
  const [view, setView] = useState<View>("Overview");
  const [topics, setTopics] = useState(initialTopics);
  const [selectedTopicName, setSelectedTopicName] = useState("Cellular respiration");
  const [plan, setPlan] = useState(initialPlan);
  const [files, setFiles] = useState(["Biology syllabus.txt", "Cell biology notes.txt", "2025 practice paper.txt"]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState(questions);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});
  const [attempts, setAttempts] = useState(2);
  const [toast, setToast] = useState("");

  const completedTasks = plan.filter((task) => task.done).length;
  const currentQuestion = quizQuestions[quizIndex];
  const readiness = Math.round(topics.reduce((total, topic) => total + topic.score, 0) / topics.length);
  const focusTopic = topics.find((topic) => topic.name === "Cellular respiration")!;
  const selectedTopic = topics.find((topic) => topic.name === selectedTopicName) ?? topics[0];
  const topicGroups = [
    { level: "Needs work" as const, title: "Revisit", marker: "01" },
    { level: "Building" as const, title: "In motion", marker: "02" },
    { level: "Strong" as const, title: "In reach", marker: "03" },
  ];

  function startQuiz(topicName?: string) {
    setQuizQuestions(topicName ? questions.filter((question) => question.topic === topicName) : questions);
    setQuizIndex(0);
    setSelectedOption(null);
    setRevealed(false);
    setQuizFinished(false);
    setQuizCorrect(0);
    setQuizResults({});
    setShowQuiz(true);
  }

  function submitAnswer() {
    if (selectedOption === null || !currentQuestion) return;
    setRevealed(true);
    const isCorrect = selectedOption === currentQuestion.answer;
    setQuizResults((results) => ({ ...results, [currentQuestion.topic]: isCorrect }));
    if (isCorrect) setQuizCorrect((value) => value + 1);
  }

  function nextQuestion() {
    if (quizIndex === quizQuestions.length - 1) {
      setAttempts((value) => value + 1);
      setQuizFinished(true);
      return;
    }
    setQuizIndex((value) => value + 1);
    setSelectedOption(null);
    setRevealed(false);
  }

  function finishQuiz() {
    setTopics((items) => items.map((topic) => {
      const result = quizResults[topic.name];
      if (result === undefined) return topic;
      const nextScore = Math.min(100, Math.max(0, topic.score + (result ? 8 : -10)));
      return { ...topic, score: nextScore, level: nextScore >= 70 ? "Strong" : nextScore >= 50 ? "Building" : "Needs work" };
    }));
    setShowQuiz(false);
    setView("Overview");
    showToast("Diagnosis updated from your latest practice.");
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  }

  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (!selectedFiles.length) return;
    setFiles((existing) => [...existing, ...selectedFiles.map((file) => file.name)]);
    showToast(`${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} added to this demo workspace.`);
    event.target.value = "";
  }

  function toggleTask(index: number) {
    setPlan((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, done: !item.done } : item));
  }

  return (
    <div className="app-frame">
      <header className="masthead">
        <a className="brand" href="#overview" onClick={() => setView("Overview")} aria-label="GapFinder home"><BrandMark /><span>gapfinder</span><small>STUDY ATLAS / 01</small></a>
        <nav className="primary-nav" aria-label="Main navigation">
          {navItems.map((item, index) => <button className={`nav-item ${view === item ? "active" : ""}`} key={item} onClick={() => setView(item)}><span className="nav-index">0{index + 1}</span>{item}{item === "My materials" && <span className="nav-count">{files.length}</span>}</button>)}
        </nav>
        <div className="masthead-student"><span className="top-avatar">MS</span><span>Maya S.<small>GRADE 12</small></span></div>
      </header>

      <main className="main-area">
        <div className="routebar"><span>FIELD LOG</span><span className="route-dash">—</span><strong>{view}</strong><span className="route-spacer" /><span><i /> BIOLOGY · SPRING EXAM</span></div>
        <div className="page-content">
          {view === "Overview" && <>
            <section className="atlas-banner">
                <div className="atlas-banner-copy">
                  <p className="eyebrow">MONDAY, 26 OCTOBER 2026 <span>·</span> WEEK 04</p>
                  <p className="atlas-edition">BIOLOGY / LEARNING ATLAS</p>
                  <h1>Know where<br />to look next.</h1>
                  <p className="atlas-subtitle">Your syllabus, seen through the things you know and the things still taking shape.</p>
                  <button className="button-primary" onClick={() => startQuiz()}>Run a fresh diagnostic <span>↗</span></button>
                </div>
                <div className="exam-ticket"><span className="ticket-kicker">EXAM COUNTDOWN</span><strong>18</strong><span className="ticket-days">DAYS</span><div className="ticket-rule" /><span className="ticket-paper">BIOLOGY PAPER 1<br />SPRING EXAM</span><span className="ticket-stamp">GF—01</span></div>
              </section>

            <section className="atlas-index" aria-label="Readiness summary">
                <div className="index-cell"><span>READINESS INDEX</span><strong>{readiness}<small>%</small></strong><button onClick={() => setView("Progress")}>Read the trend ↗</button></div>
                <div className="index-cell"><span>TOPICS IN VIEW</span><strong>{topics.length.toString().padStart(2, "0")}</strong><small>{attempts} diagnostics completed</small></div>
                <div className="index-cell"><span>NEEDS A SECOND LOOK</span><strong>{topics.filter((topic) => topic.level === "Needs work").length.toString().padStart(2, "0")}</strong><small>Start with {focusTopic.name.toLowerCase()}</small></div>
              </section>

            <section className="atlas-field">
                <div className="field-heading"><div><p className="eyebrow">01 / THE KNOWLEDGE TERRAIN</p><h2>Your topic field</h2></div><button className="text-button" onClick={() => setView("Topic map")}>Open full map <span>↗</span></button></div>
                <div className="field-groups">
                  {topicGroups.map((group) => {
                    const groupTopics = topics.filter((topic) => topic.level === group.level);
                    return <section className={`field-group ${topicStatusClass(group.level)}`} key={group.level}>
                      <div className="group-heading"><span className="group-marker">{group.marker}</span><div><h3>{group.title}</h3><small>{group.level}</small></div><b>{groupTopics.length.toString().padStart(2, "0")}</b></div>
                      <div className="group-topics">{groupTopics.length ? groupTopics.map((topic) => <button className={`atlas-topic ${selectedTopicName === topic.name ? "selected" : ""}`} key={topic.name} aria-pressed={selectedTopicName === topic.name} onClick={() => setSelectedTopicName(topic.name)}><span className="topic-orbit"><i style={{ height: `${topic.score}%` }} /></span><span className="atlas-topic-copy"><strong>{topic.name}</strong><small>{topic.unit}</small></span><span className="atlas-topic-score">{topic.score}<small>%</small></span><span className="topic-arrow">↗</span></button>) : <p className="empty-group">No topics in this region. A good sign.</p>}</div>
                    </section>;
                  })}
                </div>
                <section className="topic-dossier" aria-live="polite">
                  <div className="dossier-topline"><span>SELECTED FIELD NOTE</span><span>{selectedTopic.unit}</span></div>
                  <div className="dossier-main"><div className="dossier-reading"><p className="eyebrow">DIAGNOSTIC READ</p><h3>{selectedTopic.name}</h3><p>{selectedTopic.note}</p></div><div className="dossier-score"><span>CONFIDENCE</span><strong>{selectedTopic.score}<small>%</small></strong><span className={`status-tag ${topicStatusClass(selectedTopic.level)}`}>{selectedTopic.level}</span></div></div>
                  <div className="dossier-footer"><span>↳ {questions.find((question) => question.topic === selectedTopic.name)?.source}</span><div><button className="text-button" onClick={() => setView("My materials")}>Open source list ↗</button><button className="button-primary" onClick={() => startQuiz(selectedTopic.name)}>Practice this topic <span>→</span></button></div></div>
                </section>
                <p className="atlas-caption">Confidence is estimated from sample diagnostic answers. Topic regions change as you practice.</p>
              </section>

            <section className="next-move">
                <div className="next-move-label"><p className="eyebrow">02 / THE NEXT MOVE</p><h2>Today’s revision</h2><p>30 minutes · one focused step at a time</p></div>
                <div className="next-move-task"><span className="move-number">A</span><div><strong>{plan[0].title}</strong><small>{plan[0].detail} · Highest-priority gap</small></div><button className="task-check" aria-label={plan[0].done ? "Mark first revision task incomplete" : "Complete first revision task"} onClick={() => toggleTask(0)}>{plan[0].done ? "✓" : ""}</button></div>
                <button className="button-secondary" onClick={() => setView("Revision plan")}>See the whole plan <span>→</span></button>
              </section>

            <section className="atlas-footnote"><span>FIELD NOTE</span><p>This is sample student data, not a personal diagnosis. The included syllabus and notes are in your Materials library.</p><button onClick={() => setView("My materials")}>View sources ↗</button></section>
          </>}

          {view === "My materials" && <MaterialsView files={files} onFiles={addFiles} />}
          {view === "Topic map" && <TopicMap topics={topics} onStart={startQuiz} />}
          {view === "Revision plan" && <RevisionView plan={plan} toggleTask={toggleTask} completed={completedTasks} onStart={startQuiz} />}
          {view === "Progress" && <ProgressView topics={topics} attempts={attempts} onStart={startQuiz} />}
          <footer className="app-footer"><span>GapFinder <b>·</b> Find the gaps. Focus your effort.</span><span>Sample workspace <b>·</b> Your files stay on this device in this demo</span></footer>
        </div>
      </main>

      {showQuiz && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowQuiz(false); }}><section className="quiz-modal" role="dialog" aria-modal="true" aria-labelledby="quiz-title">
        <header className="quiz-header"><div className="quiz-brand"><BrandMark /><span>Quick diagnostic</span></div><button className="modal-close" aria-label="Close diagnostic" onClick={() => setShowQuiz(false)}>×</button></header>
        {!quizFinished && currentQuestion ? <div className="quiz-body"><div className="quiz-progress-copy"><span>QUESTION {quizIndex + 1} OF {quizQuestions.length}</span><span>{currentQuestion.topic}</span></div><div className="quiz-progress"><i style={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }} /></div><h2 id="quiz-title">{currentQuestion.prompt}</h2>
          <div className="answer-list">{currentQuestion.options.map((option, index) => { let stateClass = selectedOption === index ? " selected" : ""; if (revealed && index === currentQuestion.answer) stateClass = " correct"; else if (revealed && selectedOption === index) stateClass = " incorrect"; return <button key={option} className={`answer-option${stateClass}`} disabled={revealed} onClick={() => setSelectedOption(index)}><span className="answer-letter">{String.fromCharCode(65 + index)}</span>{option}<span className="answer-check">{revealed && index === currentQuestion.answer ? "✓" : ""}</span></button>; })}</div>
          {revealed ? <div className={`answer-feedback ${selectedOption === currentQuestion.answer ? "feedback-correct" : "feedback-incorrect"}`}><strong>{selectedOption === currentQuestion.answer ? "That’s right." : "Not quite yet."}</strong><p>{currentQuestion.explanation}</p></div> : <p className="citation"><span>↳</span> From your material: {currentQuestion.source}</p>}
          <div className="quiz-actions">{revealed ? <button className="button-primary" onClick={nextQuestion}>{quizIndex === quizQuestions.length - 1 ? "See my results" : "Next question"} <span>→</span></button> : <button className="button-primary" disabled={selectedOption === null} onClick={submitAnswer}>Check answer <span>→</span></button>}</div>
        </div> : <div className="quiz-results"><span className="result-spark">✳</span><p className="eyebrow">DIAGNOSTIC COMPLETE</p><h2 id="quiz-title">A clearer picture<br />starts here.</h2><p>You got <strong>{quizCorrect} of {quizQuestions.length}</strong> questions right. We’ll use this practice to update your topic map and revision focus.</p><div className="result-source">Questions drawn from <strong>Cell biology notes.txt</strong><br />with a source section for every answer.</div><button className="button-primary" onClick={finishQuiz}>Update my diagnosis <span>→</span></button></div>}
      </section></div>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function TopicRow({ topic }: { topic: Topic }) {
  const statusClass = topicStatusClass(topic.level);
  return <div className="topic-row"><div className="topic-name"><strong>{topic.name}</strong><small>{topic.unit}</small></div><div className="topic-score"><div className="score-track"><span className={statusClass} style={{ width: `${topic.score}%` }} /></div><b>{topic.score}%</b></div><span className={`status-tag ${statusClass}`}>{topic.level}</span></div>;
}

function topicStatusClass(level: TopicLevel) {
  return level === "Needs work" ? "status-weak" : level === "Building" ? "status-medium" : "status-strong";
}

function PlanRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return <div className={`plan-row ${task.done ? "is-done" : ""}`}><button className="task-check" aria-label={task.done ? `Mark ${task.title} incomplete` : `Complete ${task.title}`} onClick={onToggle}>{task.done ? "✓" : ""}</button><div className="task-copy"><strong>{task.title}</strong><small>{task.detail}</small></div><span className="task-topic">{task.topic}</span></div>;
}

function MaterialsView({ files, onFiles }: { files: string[]; onFiles: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return <><ViewHeader label="YOUR STUDY LIBRARY" title="My materials" description="A home for the sources behind your topic map and practice questions." /><section className="upload-zone"><span className="upload-symbol">↑</span><h2>Bring your study materials together</h2><p>Choose a syllabus, notes, or a past paper to add to this demo workspace.</p><label className="button-secondary">Choose files<input type="file" accept=".pdf,.txt,.md,application/pdf,text/plain" multiple onChange={onFiles} /></label><small>PDF or text · Files are not uploaded to a server in this demo</small></section><section className="materials-list-section"><SectionHeading eyebrow={`${files.length} SOURCES`} title="Your library" /><div className="materials-list">{files.map((file, index) => <div className="material-row" key={`${file}-${index}`}><span className="file-icon">{file.toLowerCase().endsWith(".pdf") ? "PDF" : "TXT"}</span><span className="material-copy"><strong>{file}</strong><small>{index < 3 ? "Included in sample workspace" : "Selected in this session"}</small></span><span className="material-state"><i />{index < 3 ? "Sample source" : "Added locally"}</span><button className="material-menu" aria-label={`Options for ${file}`}>···</button></div>)}</div></section><div className="notice-banner"><span>i</span><p><strong>Demo mode:</strong> file names are shown locally, but document text is not extracted or indexed. In a connected version, citations and diagnoses should be based on retrieved passages from these sources.</p></div></>;
}

function TopicMap({ topics, onStart }: { topics: Topic[]; onStart: () => void }) {
  return <><ViewHeader label="SYLLABUS BREAKDOWN" title="Your topic map" description="A topic-by-topic view of what’s clicking and where a little more practice could help." action={<button className="button-primary" onClick={onStart}>Take a diagnostic <span>→</span></button>} /><div className="map-summary"><div><strong>{topics.length}</strong><span>topics mapped</span></div><div><strong>{topics.filter((topic) => topic.level === "Strong").length}</strong><span>feeling solid</span></div><div><strong>{topics.filter((topic) => topic.level !== "Strong").length}</strong><span>to keep practicing</span></div><p>Ratings reflect sample answers<br />from this demo workspace.</p></div><section className="full-topic-list"><SectionHeading eyebrow="BIOLOGY · GRADE 12" title="Topic confidence" />{topics.map((topic) => <div className="expanded-topic" key={topic.name}><TopicRow topic={topic} /><p>{topic.note}</p></div>)}</section><div className="notice-banner"><span>↳</span><p>Each question in a connected diagnostic should cite the exact passage it was generated from. The sample questions here cite the included Biology notes sections.</p></div></>;
}

function RevisionView({ plan, toggleTask, completed, onStart }: { plan: Task[]; toggleTask: (index: number) => void; completed: number; onStart: () => void }) {
  return <><ViewHeader label="BUILT AROUND YOUR GAPS" title="Your revision plan" description="Short, focused sessions for the topics most likely to move your readiness." action={<button className="button-secondary" onClick={onStart}>Refresh diagnosis <span>↻</span></button>} /><div className="plan-summary"><div><p className="eyebrow">TODAY’S FOCUS</p><h2>Small steps, steady progress.</h2><p>30 minutes · 3 sessions</p></div><div className="plan-progress-ring"><strong>{completed}<small>/3</small></strong><span>done</span></div></div><section className="revision-day"><div className="day-heading"><span className="day-number">01</span><div><p className="eyebrow">MONDAY · 26 OCT</p><h2>Today</h2></div><span className="day-duration">30 MIN TOTAL</span></div>{plan.map((task, index) => <div className="revision-task" key={task.title}><PlanRow task={task} onToggle={() => toggleTask(index)} /><span className="revision-reason">{task.topic === "Cellular respiration" ? "Highest-priority gap" : task.topic === "Mitosis & meiosis" ? "Building confidence" : "Keep knowledge fresh"}</span></div>)}</section><p className="plan-disclaimer">Your plan is a sample schedule. A connected version can recalculate priority when new diagnostic answers change topic confidence.</p></>;
}

function ProgressView({ topics, attempts, onStart }: { topics: Topic[]; attempts: number; onStart: () => void }) {
  const readiness = Math.round(topics.reduce((total, topic) => total + topic.score, 0) / topics.length);

  return <>
    <ViewHeader label="THE WORK IS ADDING UP" title="Your progress" description="See how practice is changing your understanding over time." action={<button className="button-primary" onClick={onStart}>New diagnostic <span>→</span></button>} />
    <section className="progress-overview">
      <div className="progress-metric"><span className="eyebrow">OVERALL READINESS</span><strong>{readiness}<span>%</span></strong><small>Based on current topic confidence</small></div>
      <div className="progress-metric"><span className="eyebrow">DIAGNOSTIC SESSIONS</span><strong>{attempts}</strong><small>Across {topics.length} syllabus topics</small></div>
      <div className="progress-metric"><span className="eyebrow">STUDY STREAK</span><strong>4<span> days</span></strong><small>Your best this month is 6 days</small></div>
    </section>
    <section className="progress-chart">
      <SectionHeading eyebrow="READINESS OVER TIME" title="A week at a glance" />
      <div className="chart-area">
        <div className="chart-y-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span></div>
        <div className="chart-plot">
          <div className="chart-grid"><i /><i /><i /><i /></div>
          <svg viewBox="0 0 660 190" preserveAspectRatio="none" role="img" aria-label="Illustrative readiness trend across the week">
            <path className="chart-fill" d="M0 135 C45 131 55 116 105 120 S155 110 212 106 S260 114 318 92 S370 85 423 89 S470 71 529 75 S602 52 660 47 L660 190 L0 190 Z" />
            <path className="chart-line" d="M0 135 C45 131 55 116 105 120 S155 110 212 106 S260 114 318 92 S370 85 423 89 S470 71 529 75 S602 52 660 47" />
            <circle cx="660" cy="47" r="5" />
          </svg>
          <div className="chart-x-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
        </div>
      </div>
    </section>
    <section className="progress-topics"><SectionHeading eyebrow="WHAT’S CHANGING" title="Confidence by topic" />{topics.map((topic) => <TopicRow key={topic.name} topic={topic} />)}</section>
    <div className="notice-banner"><span>i</span><p>Progress history in this demo is illustrative. New diagnostic answers update the topic map for this session; changes aren’t saved after you leave.</p></div>
  </>;
}