import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Clock, Brain, BookOpen, CheckCircle2 } from "lucide-react";
import { SectionQuiz } from "./SectionQuiz";
import { SectionFlashcards } from "./SectionFlashcards";
import type { GeneratedModule } from "../lib/generateModule";

interface Module {
  id: number;
  week: number;
  title: string;
  description: string;
  status: "active" | "complete" | "locked";
  topics: number;
  flashcards: number;
  progress: number;
  tags: string[];
}

interface ModulePageProps {
  module: Module;
  content?: GeneratedModule;
  onBack: () => void;
}

const sections = [
  { id: "overview", label: "Overview & Key Findings" },
  { id: "retrieval", label: "Retrieval Practice" },
  { id: "spacing", label: "Spaced Practice" },
  { id: "elaboration", label: "Elaboration & Self-Explanation" },
  { id: "interleaving", label: "Interleaving" },
  { id: "dualcoding", label: "Dual Coding & Worked Examples" },
  { id: "lowutility", label: "Low Utility Techniques" },
  { id: "myths", label: "Myths Debunked" },
  { id: "foundations", label: "Cognitive Foundations" },
  { id: "recommendations", label: "Recommendations" },
];

const keyFacts = [
  { technique: "Retrieval Practice", evidence: "Strong", effectSize: "g = 0.50–0.70", utility: "High", bestFor: "All material types" },
  { technique: "Spaced Practice", evidence: "Strong", effectSize: "High utility", utility: "High", bestFor: "Long-term retention" },
  { technique: "Elaboration", evidence: "Moderate", effectSize: "g = 0.55", utility: "Moderate", bestFor: "Conceptual understanding" },
  { technique: "Interleaving", evidence: "Moderate", effectSize: "g = 0.42", utility: "Moderate", bestFor: "Confusable categories" },
  { technique: "Dual Coding", evidence: "Moderate", effectSize: "~0.48 SD", utility: "Moderate", bestFor: "Integrated diagrams" },
  { technique: "Worked Examples", evidence: "Conditional", effectSize: "Varies", utility: "Conditional", bestFor: "Novice learners only" },
  { technique: "Re-reading", evidence: "Weak", effectSize: "Low", utility: "Low", bestFor: "N/A — avoid" },
  { technique: "Highlighting", evidence: "Weak", effectSize: "Low", utility: "Low", bestFor: "N/A — avoid" },
];

export function ModulePage({ module, content, onBack }: ModulePageProps) {
  if (module.week !== 1) {
    return <UploadedModulePage module={module} content={content} onBack={onBack} />;
  }
  return <Week1ModulePage module={module} onBack={onBack} />;
}

function Week1ModulePage({ module, onBack }: { module: Module; onBack: () => void }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            setCompletedSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const progress = Math.round((completedSections.size / sections.length) * 100);

  return (
    <div style={{ background: "#F4EFE6", fontFamily: "'Inter', sans-serif", minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(156,132,102,0.12)", position: "sticky", top: 0, zIndex: 30 }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 hover:opacity-70 transition" style={{ fontSize: "13px", color: "#8A7F72" }}>
            <ArrowLeft size={15} /> Library
          </button>
          <div style={{ width: "1px", height: "16px", background: "rgba(156,132,102,0.2)" }} />
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72", letterSpacing: "0.1em" }} className="uppercase">Week {module.week}</div>
          <div style={{ width: "1px", height: "16px", background: "rgba(156,132,102,0.2)" }} />
          <span style={{ fontSize: "13px", fontWeight: 500, color: "#2D2820", flex: 1 }} className="truncate">{module.title}</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(156,132,102,0.15)" }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "#C8873A" }} />
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72" }}>{progress}%</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ fontSize: "12px", color: "#8A7F72" }}>
              <Clock size={12} /> ~45 min
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex gap-0">
        {/* Left ToC */}
        <aside className="w-56 shrink-0 py-8 pr-4" style={{ position: "sticky", top: "53px", height: "calc(100vh - 53px)", overflowY: "auto" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#8A7F72", letterSpacing: "0.14em" }} className="uppercase px-3 mb-3">
            Contents
          </div>
          <nav className="flex flex-col">
            {sections.map((sec) => {
              const isActive = activeSection === sec.id;
              const isDone = completedSections.has(sec.id) && !isActive;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollTo(sec.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all"
                  style={{ background: isActive ? "rgba(200,135,58,0.1)" : "transparent" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: isActive ? "#C8873A" : isDone ? "#7A9A6A" : "rgba(156,132,102,0.3)" }} />
                  <span style={{ fontSize: "12px", color: isActive ? "#C8873A" : isDone ? "#5C5249" : "#8A7F72", fontWeight: isActive ? 500 : 400, lineHeight: 1.4 }}>
                    {sec.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main ref={contentRef} className="flex-1 py-8 px-6 max-w-3xl">

          {/* Module hero */}
          <div className="mb-10">
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72", letterSpacing: "0.12em" }} className="uppercase mb-3">
              Evidence-Based Learning Science
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "34px", fontWeight: 700, color: "#2D2820", lineHeight: 1.25 }} className="mb-4">
              How to Learn Effectively:<br />An Evidence-Based Guide
            </h1>
            <p style={{ fontSize: "15px", color: "#7A7068", lineHeight: 1.75, maxWidth: "580px" }} className="mb-5">
              A comprehensive review of the cognitive science behind effective study strategies. Sourced from Dunlosky et al. (2013), Bjork's learning–performance research, and 60+ meta-analyses. Rated by effect size and practical utility for Masters-level study.
            </p>
            <div className="flex items-center gap-5">
              {[
                { icon: <BookOpen size={14} color="#8A7F72" />, label: "9 sections" },
                { icon: <Brain size={14} color="#8A7F72" />, label: "12 flashcards" },
                { icon: <Clock size={14} color="#8A7F72" />, label: "~45 min" },
              ].map((m) => (
                <span key={m.label} className="flex items-center gap-1.5" style={{ fontSize: "13px", color: "#8A7F72" }}>{m.icon} {m.label}</span>
              ))}
            </div>
          </div>

          {/* SECTION: Overview */}
          <section id="overview" className="mb-14 scroll-mt-20">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, color: "#2D2820" }} className="mb-4">
              Overview & Key Findings
            </h2>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-4">
              The most important reframing for a postgraduate learner is Bjork's <strong>learning–performance distinction</strong>: <em>performance</em> is how well you do during study today; <em>learning</em> is the relatively permanent change measured later in a new context. Most popular study habits — re-reading, highlighting, cramming — boost short-term performance and the <em>feeling</em> of fluency while doing little for long-term retention.
            </p>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-6">
              The techniques that work — retrieval practice, spacing, interleaving — feel harder and slower, which is why Bjork calls them <strong>"desirable difficulties."</strong>
            </p>

            {/* Key Facts Table */}
            <div className="rounded-2xl overflow-hidden mb-6" style={{ border: "1px solid rgba(156,132,102,0.15)" }}>
              <div className="px-5 py-3" style={{ background: "#2D2820" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 600, color: "rgba(237,232,220,0.9)", letterSpacing: "0.08em" }}>
                  KEY FACTS — TECHNIQUE SUMMARY
                </span>
              </div>
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "collapse", background: "#FFFFFF", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ background: "#F8F4EE" }}>
                      {["Technique", "Evidence", "Effect Size", "Utility", "Best For"].map((h) => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#5C5249", fontWeight: 600, fontSize: "11px", letterSpacing: "0.04em", borderBottom: "1px solid rgba(156,132,102,0.12)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {keyFacts.map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(156,132,102,0.08)" }}>
                        <td style={{ padding: "10px 16px", color: "#2D2820", fontWeight: 500 }}>{row.technique}</td>
                        <td style={{ padding: "10px 16px" }}>
                          <span style={{
                            fontSize: "11px", fontWeight: 500, padding: "2px 8px", borderRadius: "6px",
                            background: row.evidence === "Strong" ? "rgba(122,154,106,0.12)" : row.evidence === "Moderate" ? "rgba(200,135,58,0.1)" : row.evidence === "Conditional" ? "rgba(139,115,85,0.1)" : "rgba(181,80,58,0.08)",
                            color: row.evidence === "Strong" ? "#4A7040" : row.evidence === "Moderate" ? "#A8692A" : row.evidence === "Conditional" ? "#6B5532" : "#B5503A",
                          }}>
                            {row.evidence}
                          </span>
                        </td>
                        <td style={{ padding: "10px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#7A7068" }}>{row.effectSize}</td>
                        <td style={{ padding: "10px 16px" }}>
                          <span style={{ fontSize: "11px", color: row.utility === "High" ? "#4A7040" : row.utility === "Moderate" ? "#A8692A" : row.utility === "Conditional" ? "#6B5532" : "#B5503A", fontWeight: 500 }}>{row.utility}</span>
                        </td>
                        <td style={{ padding: "10px 16px", color: "#7A7068", fontSize: "12px" }}>{row.bestFor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* SECTION: Retrieval */}
          <section id="retrieval" className="mb-14 scroll-mt-20">
            <div className="flex items-center gap-3 mb-4">
              <span style={{ fontSize: "11px", fontWeight: 600, background: "rgba(122,154,106,0.12)", color: "#4A7040", padding: "3px 10px", borderRadius: "8px" }}>Strong Evidence</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72" }}>g = 0.50–0.70</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, color: "#2D2820" }} className="mb-4">
              Retrieval Practice
            </h2>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-4">
              Actively recalling information from memory — self-quizzing, flashcards, closed-book brain-dumps — produces more durable learning than restudying. This is the best-supported technique in the field.
            </p>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-4">
              In Roediger & Karpicke's landmark 2006 study, students who studied a passage once then took a test recalled <strong>56% after a one-week delay</strong>, versus 42% for students who studied twice (d = 0.83). Tellingly, on an immediate test the ordering reversed — the restudying group scored higher — a vivid demonstration of the performance/learning gap.
            </p>
            <div className="rounded-2xl p-4 mb-5" style={{ background: "rgba(200,135,58,0.07)", border: "1px solid rgba(200,135,58,0.15)" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#2D2820", marginBottom: "6px" }}>How to apply</div>
              <ul className="flex flex-col gap-1.5" style={{ fontSize: "13px", color: "#5C5249", lineHeight: 1.6, paddingLeft: "16px", listStyleType: "disc" }}>
                <li>After each lecture, close materials and write down everything you can recall ("brain dump")</li>
                <li>Use flashcards (e.g. Anki) for terminology, frameworks and relationships</li>
                <li>Convert lecture notes into questions and answer from memory</li>
                <li>Do past exam questions without notes — the effortful struggle to retrieve is the mechanism</li>
              </ul>
            </div>
            <SectionFlashcards label="Flashcards — Retrieval Practice" cards={[
              { front: "What is the 'testing effect' and what effect size does it produce?", back: "Actively recalling from memory produces more durable learning than restudying. Hedges' g ≈ 0.50–0.70. Single practice tests (g = 0.70) outperform multiple tests (g = 0.51). Adesope et al. (2017)." },
              { front: "In Roediger & Karpicke (2006), testing vs restudying at 1-week delay?", back: "Testing group recalled 56% vs 42% for the restudy group (d = 0.83). On immediate test (5 min), restudying was better — this IS the learning/performance gap." },
              { front: "Why shouldn't you peek too early when trying to recall something?", back: "The effortful struggle to retrieve is the mechanism. Successful easy retrieval produces little benefit. Failed attempts followed by feedback produce the largest retention gains." },
            ]} />
            <SectionQuiz label="Quick check — Retrieval Practice" questions={[
              {
                q: "In Roediger & Karpicke (2006), which group performed better at a 1-week delayed test?",
                options: ["The restudying group (read passage multiple times)", "The testing group (read once, then took a test)", "Both groups performed equally at 1 week", "The testing group only on recognition, not recall"],
                correct: 1,
                explanation: "The testing group recalled 56% vs 42% for the restudying group at 1 week. On an immediate 5-minute test the result reversed — restudying scored higher — demonstrating that what improves short-term performance can undermine long-term learning.",
              },
              {
                q: "What does Dunlosky et al. (2013) rate retrieval practice as?",
                options: ["Low utility — unreliable across subjects", "Moderate utility — good for some domains", "High utility — the strongest supported technique", "Conditional — only works for factual content"],
                correct: 2,
                explanation: "Dunlosky et al. (2013) rate retrieval practice 'high utility' — the strongest utility rating in their review. It is the best-supported technique in the field across subject areas and age groups.",
              },
            ]} />
          </section>

          {/* SECTION: Spacing */}
          <section id="spacing" className="mb-14 scroll-mt-20">
            <div className="flex items-center gap-3 mb-4">
              <span style={{ fontSize: "11px", fontWeight: 600, background: "rgba(122,154,106,0.12)", color: "#4A7040", padding: "3px 10px", borderRadius: "8px" }}>Strong Evidence</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72" }}>High utility · Cepeda et al. 2006</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, color: "#2D2820" }} className="mb-4">
              Spaced Practice
            </h2>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-4">
              Spreading study over time produces far better long-term retention than the same total time crammed into one session. Cepeda et al. (2006) meta-analysed 839 assessments across 317 experiments and found a reliable spacing benefit throughout.
            </p>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-4">
              The optimal gap between sessions scales with how long you need to retain the material — roughly <strong>10–20% of the retention interval</strong>. To remember something for a year, review roughly every 1–2 months. Spacing is most powerful when combined with retrieval — "spaced retrieval practice."
            </p>
            <div className="rounded-2xl p-4 mb-5" style={{ background: "rgba(200,135,58,0.07)", border: "1px solid rgba(200,135,58,0.15)" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#2D2820", marginBottom: "6px" }}>How to apply</div>
              <ul className="flex flex-col gap-1.5" style={{ fontSize: "13px", color: "#5C5249", lineHeight: 1.6, paddingLeft: "16px", listStyleType: "disc" }}>
                <li>Plan study across the whole term from week one — not the week before exams</li>
                <li>Schedule short repeated review sessions of the same material days or weeks apart</li>
                <li>Use a spaced-repetition app so scheduling is automatic</li>
                <li>Deliberately revisit "old" topics while studying new ones</li>
              </ul>
            </div>
            <SectionFlashcards label="Flashcards — Spaced Practice" cards={[
              { front: "What is the optimal review interval to retain material for one year?", back: "Roughly every 1–2 months (10–20% of the retention interval). Cepeda et al. (2006) found this scaling relationship across 317 experiments. Spaced-repetition apps automate this scheduling." },
              { front: "What does Dunlosky et al. (2013) say about spaced practice?", back: "'High utility' — same rating as retrieval practice. Spacing is most powerful when combined with retrieval: 'spaced retrieval practice' or successive relearning." },
            ]} />
            <SectionQuiz label="Quick check — Spaced Practice" questions={[
              {
                q: "According to Cepeda et al. (2006), what is the optimal gap between study sessions to retain material for one year?",
                options: ["One day", "One week", "Roughly every 1–2 months (10–20% of retention interval)", "Every 2 weeks regardless of goal"],
                correct: 2,
                explanation: "The optimal gap scales with the retention interval at roughly 10–20%. For a 1-year retention goal, review roughly every 1–2 months. This is why adaptive spaced-repetition apps vary intervals based on card difficulty.",
              },
            ]} />
          </section>

          {/* SECTION: Elaboration */}
          <section id="elaboration" className="mb-14 scroll-mt-20">
            <div className="flex items-center gap-3 mb-4">
              <span style={{ fontSize: "11px", fontWeight: 600, background: "rgba(200,135,58,0.1)", color: "#A8692A", padding: "3px 10px", borderRadius: "8px" }}>Moderate Evidence</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72" }}>g = 0.55 · Bisra et al. 2018</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, color: "#2D2820" }} className="mb-4">
              Elaboration & Self-Explanation
            </h2>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-4">
              Elaboration means asking <em>"why"</em> and <em>"how"</em> and connecting new material to what you already know. Self-explanation means explaining to yourself how a problem is solved or why a fact is true. Bisra et al. (2018) meta-analysed 64 studies (~5,917 participants) and found a mean effect of g = 0.55.
            </p>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-4">
              These techniques are particularly suited to postgraduate work because they build the <strong>integrated, transferable understanding</strong> that Masters assessment demands. One caveat: self-explanation aimed purely at one's own mental state ("how do I feel about this?") is less effective than explaining the material itself.
            </p>
            <SectionQuiz label="Quick check — Elaboration" questions={[
              {
                q: "What is the mean effect size found by Bisra et al. (2018) for self-explanation?",
                options: ["g = 0.23 (small)", "g = 0.55 (moderate)", "g = 0.82 (large)", "g = 0.10 (negligible)"],
                correct: 1,
                explanation: "Bisra et al. (2018) meta-analysed 69 effect sizes from 64 studies (~5,917 participants) and found g = 0.55 across subject areas and education levels. Dunlosky et al. rate both elaborative interrogation and self-explanation 'moderate utility.'",
              },
            ]} />
          </section>

          {/* SECTION: Interleaving */}
          <section id="interleaving" className="mb-14 scroll-mt-20">
            <div className="flex items-center gap-3 mb-4">
              <span style={{ fontSize: "11px", fontWeight: 600, background: "rgba(200,135,58,0.1)", color: "#A8692A", padding: "3px 10px", borderRadius: "8px" }}>Moderate Evidence</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72" }}>g = 0.42 · Brunmair & Richter 2019</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, color: "#2D2820" }} className="mb-4">
              Interleaving
            </h2>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-4">
              Mixing different problem types or topics within a session (ABCABC) rather than practising one to mastery before moving on (AAABBBCCC) improves the ability to discriminate between problem types and choose the right approach.
            </p>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-4">
              Brunmair & Richter (2019) found g = 0.42 overall, with the largest benefits for <strong>visually similar, confusable categories</strong> (g ≈ 0.67 for paintings). Benefits were much smaller for mathematics (g ≈ 0.34). Importantly: interleaving totally unrelated material shows little or no benefit — the mechanism is <em>discriminating</em> between things you might otherwise confuse.
            </p>
            <SectionQuiz label="Quick check — Interleaving" questions={[
              {
                q: "Brunmair & Richter (2019) found the LARGEST interleaving benefit for which material type?",
                options: ["Mathematics word problems (g ≈ 0.34)", "Visually similar, confusable categories like paintings (g ≈ 0.67)", "Language vocabulary (g ≈ 0.55)", "Historical dates (g ≈ 0.45)"],
                correct: 1,
                explanation: "The largest benefits (g ≈ 0.67) were for visually similar, confusable categories. The mechanism is learning to discriminate. Mathematics showed smaller effects (g ≈ 0.34). Interleaving totally unrelated material does NOT help.",
              },
            ]} />
          </section>

          {/* SECTION: Dual coding / worked examples */}
          <section id="dualcoding" className="mb-14 scroll-mt-20">
            <div className="flex items-center gap-3 mb-4">
              <span style={{ fontSize: "11px", fontWeight: 600, background: "rgba(200,135,58,0.1)", color: "#A8692A", padding: "3px 10px", borderRadius: "8px" }}>Moderate / Conditional</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, color: "#2D2820" }} className="mb-4">
              Dual Coding & Worked Examples
            </h2>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-4">
              <strong>Dual coding</strong> combines words with relevant visuals (diagrams, graphs, timelines, process maps). The benefit is real but conditional: words and images must be conceptually integrated, temporally aligned, and not redundant. Butcher (2006) found diagrams added to text improved understanding by ~0.48 SD. Adding decorative or redundant images does not help and can hurt.
            </p>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-4">
              <strong>Worked examples</strong> are highly effective for novices because they reduce the cognitive load of means-ends search. But this advantage reverses as expertise grows — the <em>expertise reversal effect</em> (Kalyuga et al. 2003). For Masters students, who are expert in some sub-areas and novice in others, the key is matching support to your current expertise in each specific topic.
            </p>
            <SectionFlashcards label="Flashcards — Dual Coding & Worked Examples" cards={[
              { front: "What is the 'expertise reversal effect'?", back: "Techniques that help novices (worked examples, extra explanations) become redundant or detrimental for more knowledgeable learners. Kalyuga et al. (2003). Experts learn more from independent problem-solving." },
              { front: "What makes dual coding work — and what makes it backfire?", back: "Work: words + visuals that are conceptually integrated, temporally aligned, non-redundant. Backfire: decorative images, text + identical narration simultaneously (redundancy effect), cluttered diagrams. Butcher (2006): +0.48 SD for integrated diagrams." },
            ]} />
          </section>

          {/* SECTION: Low utility */}
          <section id="lowutility" className="mb-14 scroll-mt-20">
            <div className="flex items-center gap-3 mb-4">
              <span style={{ fontSize: "11px", fontWeight: 600, background: "rgba(181,80,58,0.08)", color: "#B5503A", padding: "3px 10px", borderRadius: "8px" }}>Low Utility</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72" }}>Avoid these as primary strategies</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, color: "#2D2820" }} className="mb-4">
              Low Utility Techniques
            </h2>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-4">
              <strong>Re-reading</strong> is the most commonly reported strategy and one of the least efficient. It mainly increases familiarity, which fuels the illusion of fluency: you mistake "this looks familiar" for "I know this." Dunlosky et al. (2013) rate it "low utility."
            </p>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-4">
              <strong>Highlighting / underlining</strong> offers little benefit beyond plain reading and can actually harm performance on higher-level inference tasks by drawing attention to isolated facts. Most students over-highlight.
            </p>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-4">
              <strong>Massed practice (cramming)</strong> produces decent short-term performance — hence its popularity before exams — but poor long-term retention. Survey evidence shows students intend to space but default to cramming under deadline pressure.
            </p>
          </section>

          {/* SECTION: Myths */}
          <section id="myths" className="mb-14 scroll-mt-20">
            <div className="flex items-center gap-3 mb-4">
              <span style={{ fontSize: "11px", fontWeight: 600, background: "rgba(181,80,58,0.08)", color: "#B5503A", padding: "3px 10px", borderRadius: "8px" }}>Actively Debunked</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, color: "#2D2820" }} className="mb-4">
              Myths Debunked
            </h2>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-4">
              <strong>Learning styles</strong> (matching visual/auditory/kinaesthetic instruction to a learner's "style") have no credible evidence. Pashler et al. (2008) reviewed the literature and found almost no studies used the required crossover design — and those that did generally failed to find the predicted effect. This is a genuine "neuromyth."
            </p>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-4">
              <strong>The "learning pyramid"</strong> — that we retain "10% of what we read, 90% of what we teach others" — is fabricated. The specific percentages trace to no verifiable study and were misattributed to Edgar Dale's Cone of Experience (which contained no numbers). Masters (2013, 2020) documents this myth's spread.
            </p>
            <SectionQuiz label="Quick check — Myths" questions={[
              {
                q: "The learning pyramid claims '90% retention from teaching others, 10% from reading.' What does the evidence say?",
                options: ["Confirmed by multiple replication studies", "Directionally correct but numbers are imprecise", "These specific percentages are fabricated and trace to no verifiable study", "Valid only for procedural, not declarative knowledge"],
                correct: 2,
                explanation: "The percentages are fabricated. They were misattributed to Edgar Dale's 'Cone of Experience,' which contained no numbers and made no retention claims. Masters (2013, 2020) and Letrud (2012) document the myth. Any source citing these percentages should be treated as unreliable.",
              },
            ]} />
          </section>

          {/* SECTION: Cognitive foundations */}
          <section id="foundations" className="mb-14 scroll-mt-20">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, color: "#2D2820" }} className="mb-4">
              Cognitive Foundations
            </h2>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-4">
              <strong>Cognitive Load Theory (Sweller)</strong> identifies working memory as the bottleneck of learning. Intrinsic load (inherent complexity), extraneous load (poor presentation — clutter, split attention), and germane load (schema-building effort). Practical upshot: reduce extraneous load so capacity is free for genuine thinking.
            </p>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-4">
              <strong>Working memory capacity</strong> is roughly 4 chunks (Cowan 2001, revising Miller's "7 ± 2"). Experts hold far more "in mind" because they chunk — grouping items into meaningful units backed by long-term memory schemas. This is why prior knowledge is one of the strongest determinants of new learning.
            </p>
            <p style={{ fontSize: "15px", color: "#5C5249", lineHeight: 1.8 }} className="mb-4">
              <strong>Sleep and memory consolidation</strong>: sleep actively consolidates newly learned material. Cousins et al. (2021, SLEEP): "sleep significantly enhanced consolidation of factual knowledge (p = 0.01, d = 0.72)." Protect sleep, especially after heavy study. Avoid all-nighters that sacrifice consolidation.
            </p>
          </section>

          {/* SECTION: Recommendations */}
          <section id="recommendations" className="mb-14 scroll-mt-20">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, color: "#2D2820" }} className="mb-4">
              Recommendations
            </h2>
            <div className="flex flex-col gap-3 mb-6">
              {[
                { n: "1", title: "Replace re-reading with retrieval practice", body: "After each lecture/reading, do a closed-book brain-dump, then check and correct. Build a flashcard deck for key terms, frameworks, and relationships." },
                { n: "2", title: "Space it out", body: "Plan term-long review from week one. Schedule short, repeated review sessions days or weeks apart. Use a spaced-repetition app so scheduling is automatic. Treat cramming as a last resort, not a plan." },
                { n: "3", title: "Test under realistic conditions", body: "Do past papers and practice problems without notes and to time. Use the results — especially your failures — as an honest map of what you don't yet know." },
                { n: "4", title: "Self-explain and elaborate as you read", body: "Ask why/how, connect to prior knowledge, explain steps aloud. Especially valuable for the conceptual, integrative demands of Masters work." },
                { n: "5", title: "Calibrate your metacognition", body: "If a strategy feels easy and pleasant, be suspicious. If it feels effortful but productive, you're probably learning. Your judgment of learning is biased by fluency." },
              ].map((rec) => (
                <div key={rec.n} className="flex gap-4 p-4 rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid rgba(156,132,102,0.12)" }}>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "#C8873A" }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "13px", fontWeight: 700, color: "#fff" }}>{rec.n}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#2D2820", marginBottom: "4px" }}>{rec.title}</div>
                    <p style={{ fontSize: "13px", color: "#7A7068", lineHeight: 1.65 }}>{rec.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Module complete CTA */}
            <div className="rounded-2xl p-6 flex items-center justify-between" style={{ background: "linear-gradient(135deg, rgba(200,135,58,0.12) 0%, rgba(69,82,64,0.08) 100%)", border: "1px solid rgba(200,135,58,0.18)" }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, color: "#2D2820" }} className="mb-1">
                  Module complete
                </div>
                <p style={{ fontSize: "13px", color: "#7A7068" }}>Your spaced review schedule has been set. Return in 2 days for your first retrieval session.</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <CheckCircle2 size={20} color="#7A9A6A" />
                <span style={{ fontSize: "13px", fontWeight: 500, color: "#4A7040" }}>Scheduled</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// ─── Uploaded module page (weeks 2+) ────────────────────────────────────────

const placeholderSections = [
  "Overview & Key Concepts",
  "Core Theory",
  "Evidence & Research",
  "Practical Application",
  "Self-Assessment",
];

function UploadedModulePage({ module, content, onBack }: { module: Module; content?: GeneratedModule; onBack: () => void }) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const tocSections = content
    ? content.sections.map(s => ({ id: s.id, label: s.title }))
    : [];

  useEffect(() => {
    if (tocSections.length > 0) setActiveSection(tocSections[0].id);
  }, [content]);

  useEffect(() => {
    if (!content) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            setCompletedSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    content.sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [content]);

  const totalFlashcards = content ? content.sections.reduce((sum, s) => sum + s.flashcards.length, 0) : module.flashcards;
  const progress = content ? Math.round((completedSections.size / content.sections.length) * 100) : 0;

  return (
    <div style={{ background: "#F4EFE6", fontFamily: "'Inter', sans-serif", minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(156,132,102,0.12)", position: "sticky", top: 0, zIndex: 30 }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 hover:opacity-70 transition" style={{ fontSize: "13px", color: "#8A7F72" }}>
            <ArrowLeft size={15} /> Library
          </button>
          <div style={{ width: "1px", height: "16px", background: "rgba(156,132,102,0.2)" }} />
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72", letterSpacing: "0.1em" }} className="uppercase">Week {module.week}</div>
          <div style={{ width: "1px", height: "16px", background: "rgba(156,132,102,0.2)" }} />
          <span style={{ fontSize: "13px", fontWeight: 500, color: "#2D2820", flex: 1 }} className="truncate">{module.title}</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(156,132,102,0.15)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "#C8873A" }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72" }}>{progress}%</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex gap-0">
        {/* ToC */}
        <aside className="w-56 shrink-0 py-8 pr-4" style={{ position: "sticky", top: "53px", height: "calc(100vh - 53px)", overflowY: "auto" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#8A7F72", letterSpacing: "0.14em" }} className="uppercase px-3 mb-3">Contents</div>
          <nav className="flex flex-col">
            {tocSections.map((sec) => (
              <button key={sec.id} onClick={() => document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all"
                style={{ background: activeSection === sec.id ? "rgba(200,135,58,0.1)" : "transparent" }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: activeSection === sec.id ? "#C8873A" : completedSections.has(sec.id) ? "rgba(122,154,106,0.5)" : "rgba(156,132,102,0.3)" }} />
                <span style={{ fontSize: "12px", color: activeSection === sec.id ? "#C8873A" : "#8A7F72", fontWeight: activeSection === sec.id ? 500 : 400, lineHeight: 1.4 }}>{sec.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 py-8 px-6 max-w-3xl">
          {/* Hero */}
          <div className="mb-10">
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72", letterSpacing: "0.12em" }} className="uppercase mb-3">
              Week {module.week} · Study Module
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: 700, color: "#2D2820", lineHeight: 1.25 }} className="mb-4">
              {module.title}
            </h1>
            <p style={{ fontSize: "15px", color: "#7A7068", lineHeight: 1.75, maxWidth: "560px" }} className="mb-5">
              {module.description}
            </p>
            <div className="flex items-center gap-5">
              {[
                { icon: <BookOpen size={14} color="#8A7F72" />, label: `${module.topics} sections` },
                { icon: <Brain size={14} color="#8A7F72" />, label: `${totalFlashcards} flashcards` },
                { icon: <Clock size={14} color="#8A7F72" />, label: "~40 min" },
              ].map((m) => (
                <span key={m.label} className="flex items-center gap-1.5" style={{ fontSize: "13px", color: "#8A7F72" }}>{m.icon} {m.label}</span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-10">
            {module.tags.map((tag) => (
              <span key={tag} style={{ fontSize: "12px", color: "#7A6448", background: "rgba(200,135,58,0.1)", padding: "4px 10px", borderRadius: "8px" }}>{tag}</span>
            ))}
          </div>

          {/* Generated sections */}
          {content ? (
            <div className="flex flex-col gap-10 mb-16">
              {content.sections.map((sec, i) => (
                <section key={sec.id} id={sec.id} style={{ scrollMarginTop: "80px" }}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(200,135,58,0.1)" }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "13px", fontWeight: 700, color: "#C8873A" }}>{i + 1}</span>
                    </div>
                    <div>
                      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: "#2D2820", lineHeight: 1.3 }}>{sec.title}</h2>
                      {sec.evidenceBadge && (
                        <span style={{ display: "inline-block", marginTop: "6px", fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#7A6448", background: "rgba(200,135,58,0.12)", padding: "2px 8px", borderRadius: "6px", letterSpacing: "0.05em" }}>
                          {sec.evidenceBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: "15px", color: "#3D3428", lineHeight: 1.8, marginBottom: "20px" }}>{sec.content}</p>

                  {sec.keyPoints.length > 0 && (
                    <div className="rounded-2xl p-5 mb-5" style={{ background: "rgba(69,82,64,0.05)", border: "1px solid rgba(69,82,64,0.1)" }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#455240", letterSpacing: "0.14em" }} className="uppercase mb-3">Key Points</div>
                      <ul className="flex flex-col gap-2">
                        {sec.keyPoints.map((pt, j) => (
                          <li key={j} className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#455240", marginTop: "8px" }} />
                            <span style={{ fontSize: "14px", color: "#3D3428", lineHeight: 1.65 }}>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {sec.flashcards.length > 0 && (
                    <SectionFlashcards
                      cards={sec.flashcards.map(f => ({ front: f.front, back: f.back }))}
                      label={`Flashcards · ${sec.flashcards.length} card${sec.flashcards.length !== 1 ? "s" : ""}`}
                    />
                  )}

                  {sec.quiz.length > 0 && (
                    <SectionQuiz questions={sec.quiz} label="Quick check" />
                  )}
                </section>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl p-8 text-center" style={{ background: "#FFFFFF", border: "1px solid rgba(156,132,102,0.12)" }}>
              <p style={{ fontSize: "14px", color: "#8A7F72" }}>No content available for this module.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
