import { useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, AlertCircle } from "lucide-react";

const questions = [
  {
    q: "Which two techniques does Dunlosky et al. (2013) rate as 'high utility'?",
    options: ["Highlighting and summarising", "Retrieval practice and spaced practice", "Elaboration and dual coding", "Interleaving and worked examples"],
    correct: 1,
    explanation: "Dunlosky et al. (2013) rate retrieval practice (self-testing) and spaced/distributed practice as 'high utility' — the backbone of an effective study routine. Re-reading, highlighting, and cramming are rated 'low utility.'",
  },
  {
    q: "In Roediger & Karpicke (2006), which group performed BETTER on the immediate 5-minute test?",
    options: ["The testing group (read once, then tested)", "The restudying group (read repeatedly)", "Both groups performed equally", "The testing group on recall but not recognition"],
    correct: 1,
    explanation: "The restudying group scored 83% vs 71% for the testing group on the immediate test. But on the 1-week delayed test, the result reversed (56% vs 42%). This is the learning/performance gap: easy, massed practice inflates short-term performance without building durable learning.",
  },
  {
    q: "According to Cepeda et al. (2006), what is the optimal gap between study sessions to retain material for one year?",
    options: ["One day between sessions", "One week between sessions", "Roughly every 1–2 months (10–20% of retention interval)", "Every 2 weeks regardless of retention goal"],
    correct: 2,
    explanation: "The optimal gap scales with how long you need to retain the material — roughly 10–20% of the retention interval. To retain something for a year, review roughly every 1–2 months.",
  },
  {
    q: "What does the 'expertise reversal effect' (Kalyuga et al. 2003) predict?",
    options: ["Experts learn more from worked examples than novices do", "Novice-focused support becomes redundant or harmful for experts", "Interleaving works better for novices than for experts", "Expert learners benefit more from massed practice"],
    correct: 1,
    explanation: "Techniques that help novices (detailed worked steps, extensive explanations) become redundant or even detrimental for more knowledgeable learners. Experts learn more by solving problems independently.",
  },
  {
    q: "Brunmair & Richter's (2019) meta-analysis on interleaving found the LARGEST benefit for which type of material?",
    options: ["Mathematics word problems (g ≈ 0.67)", "Language learning (g ≈ 0.65)", "Visually similar, confusable categories like paintings (g ≈ 0.67)", "Historical timeline memorisation (g ≈ 0.58)"],
    correct: 2,
    explanation: "Interleaving was most beneficial for visually similar, confusable categories — painting identification showed g ≈ 0.67. Benefits were smaller for mathematics (g ≈ 0.34).",
  },
  {
    q: "The 'learning pyramid' claims we retain '90% of what we teach others, 10% of what we read.' What does the evidence say?",
    options: ["Confirmed by Dale's Cone of Experience", "The numbers are slightly off but directionally correct", "These specific percentages trace to no verifiable study and are fabricated", "Valid for school-age learners but not adults"],
    correct: 2,
    explanation: "The specific retention percentages are fabricated. They were misattributed to Edgar Dale's 'Cone of Experience,' which contained no numbers and made no retention claims. Masters (2013, 2020) and Letrud (2012) document this myth's spread.",
  },
  {
    q: "What does Bisra et al. (2018) find as the effect size for self-explanation across 64 studies?",
    options: ["g = 0.23 (small, inconsistent)", "g = 0.55 (moderate, significant)", "g = 0.82 (large, robust)", "g = 0.10 (negligible)"],
    correct: 1,
    explanation: "Bisra et al. (2018) meta-analysed 69 effect sizes from 64 studies (~5,917 participants) and found a random-effects mean of g = 0.55, with benefits across subject areas, conceptual and procedural knowledge, and education levels.",
  },
  {
    q: "Why is the feeling of fluency an UNRELIABLE guide to learning?",
    options: ["Fluency only measures reading speed, not comprehension", "JOLs are driven by ease of processing (fluency), but fluency does not predict actual recall", "Fluency improves retention for simple facts but not complex concepts", "Fluent material is harder to retrieve because it lacks distinctiveness"],
    correct: 1,
    explanation: "Judgments of Learning (JOLs) are strongly driven by processing fluency — how easily material comes to mind — even when fluency does NOT predict actual recall. Carpenter et al. (2013): a fluent, polished lecturer raised students' confidence without improving their actual learning.",
  },
];

type Phase = "quiz" | "review";

const card: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: "16px",
  border: "1px solid rgba(156,132,102,0.14)",
  boxShadow: "0 1px 4px rgba(100,80,60,0.06)",
};

export function QuizMode() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean[]>(new Array(questions.length).fill(false));
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [phase, setPhase] = useState<Phase>("quiz");
  const [reviewIndex, setReviewIndex] = useState(0);

  const q = questions[currentQ];
  const isAnswered = answered[currentQ];
  const isCorrect = selected === q.correct;

  function handleSelect(optionIdx: number) {
    if (isAnswered) return;
    setSelected(optionIdx);
    const newAnswered = [...answered]; newAnswered[currentQ] = true; setAnswered(newAnswered);
    const newUserAnswers = [...userAnswers]; newUserAnswers[currentQ] = optionIdx; setUserAnswers(newUserAnswers);
  }

  function next() {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(userAnswers[currentQ + 1]);
    } else {
      setPhase("review"); setReviewIndex(0);
    }
  }

  function restart() {
    setCurrentQ(0); setSelected(null);
    setAnswered(new Array(questions.length).fill(false));
    setUserAnswers(new Array(questions.length).fill(null));
    setPhase("quiz");
  }

  const score = userAnswers.filter((a, i) => a === questions[i].correct).length;
  const pct = Math.round((score / questions.length) * 100);

  if (phase === "review") {
    const rq = questions[reviewIndex];
    const ua = userAnswers[reviewIndex];
    const correct = ua === rq.correct;
    return (
      <div className="flex-1 overflow-y-auto p-8" style={{ fontFamily: "'Inter', sans-serif", background: "#F4EFE6" }}>
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72", letterSpacing: "0.12em" }} className="uppercase mb-2">Results Review</div>
            <div className="flex items-center justify-between mb-3">
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, color: "#2D2820" }}>Quiz Complete — {pct}%</h1>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#8A7F72" }}>{score}/{questions.length} correct</span>
            </div>
            {pct < 70 && (
              <div className="p-3 rounded-xl flex items-start gap-2.5" style={{ background: "rgba(200,135,58,0.08)", border: "1px solid rgba(200,135,58,0.2)" }}>
                <AlertCircle size={14} color="#C8873A" className="mt-0.5 flex-shrink-0" />
                <p style={{ fontSize: "12px", color: "#7A7068" }}>Score below 70% suggests you may be in the fluency trap. Revisit the flashcard deck before reattempting.</p>
              </div>
            )}
          </div>

          <div className="flex gap-1.5 mb-6 flex-wrap">
            {questions.map((_, i) => (
              <button key={i} onClick={() => setReviewIndex(i)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: userAnswers[i] === questions[i].correct ? "rgba(122,154,106,0.15)" : "rgba(181,80,58,0.1)",
                  color: userAnswers[i] === questions[i].correct ? "#4A7040" : "#B5503A",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 500,
                  outline: i === reviewIndex ? "2px solid #C8873A" : "none", outlineOffset: "2px",
                }}>
                {i + 1}
              </button>
            ))}
          </div>

          <div style={card} className="p-6 mb-4">
            <div className="flex items-start gap-2 mb-4">
              {correct ? <CheckCircle2 size={18} color="#7A9A6A" className="flex-shrink-0 mt-0.5" /> : <XCircle size={18} color="#B5503A" className="flex-shrink-0 mt-0.5" />}
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 500, lineHeight: 1.5, color: "#2D2820" }}>{rq.q}</p>
            </div>
            <div className="flex flex-col gap-2 mb-5">
              {rq.options.map((opt, i) => (
                <div key={i} className="px-4 py-2.5 rounded-xl" style={{
                  fontSize: "13px",
                  background: i === rq.correct ? "rgba(122,154,106,0.1)" : i === ua && ua !== rq.correct ? "rgba(181,80,58,0.08)" : "#F8F4EE",
                  border: `1px solid ${i === rq.correct ? "rgba(122,154,106,0.3)" : i === ua && ua !== rq.correct ? "rgba(181,80,58,0.2)" : "rgba(156,132,102,0.12)"}`,
                  color: i === rq.correct ? "#4A7040" : i === ua && ua !== rq.correct ? "#B5503A" : "#7A7068",
                }}>
                  {opt}
                </div>
              ))}
            </div>
            <div className="pt-4" style={{ borderTop: "1px solid rgba(156,132,102,0.1)" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#2D2820", textTransform: "uppercase", letterSpacing: "0.08em" }} className="mb-2">Explanation</div>
              <p style={{ fontSize: "13px", lineHeight: 1.7, color: "#7A7068" }}>{rq.explanation}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))} disabled={reviewIndex === 0}
              className="px-4 py-2.5 rounded-xl disabled:opacity-30 transition"
              style={{ fontSize: "13px", color: "#7A7068", background: "#FFFFFF", border: "1px solid rgba(156,132,102,0.2)" }}>
              Previous
            </button>
            {reviewIndex < questions.length - 1 ? (
              <button onClick={() => setReviewIndex(reviewIndex + 1)} className="px-4 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-80 transition"
                style={{ fontSize: "13px", fontWeight: 500, background: "#C8873A", color: "#fff" }}>
                Next question <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={restart} className="px-4 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-80 transition"
                style={{ fontSize: "13px", fontWeight: 500, background: "#EDE7DC", color: "#2D2820" }}>
                <RotateCcw size={14} /> Retry Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 flex flex-col" style={{ fontFamily: "'Inter', sans-serif", background: "#F4EFE6" }}>
      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
        <div className="mb-6">
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72", letterSpacing: "0.12em" }} className="uppercase mb-2">
            Closed-Book Self-Test · No notes
          </div>
          <div className="flex items-center justify-between mb-3">
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: "#2D2820" }}>Week 1 Quiz</h1>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#8A7F72" }}>Q{currentQ + 1} of {questions.length}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(156,132,102,0.15)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(answered.filter(Boolean).length / questions.length) * 100}%`, background: "#C8873A" }} />
          </div>
        </div>

        <div style={card} className="p-6 mb-5">
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 500, lineHeight: 1.6, color: "#2D2820" }} className="mb-5">{q.q}</p>
          <div className="flex flex-col gap-2.5">
            {q.options.map((opt, i) => {
              let bg = "#F8F4EE";
              let border = "rgba(156,132,102,0.15)";
              let color = "#2D2820";
              let cursor = "pointer";
              if (isAnswered) {
                if (i === q.correct) { bg = "rgba(122,154,106,0.1)"; border = "rgba(122,154,106,0.3)"; color = "#4A7040"; cursor = "default"; }
                else if (i === selected && selected !== q.correct) { bg = "rgba(181,80,58,0.08)"; border = "rgba(181,80,58,0.2)"; color = "#B5503A"; cursor = "default"; }
                else { color = "#9C8A7A"; cursor = "default"; }
              }
              return (
                <button key={i} onClick={() => handleSelect(i)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                  style={{ fontSize: "14px", background: bg, border: `1px solid ${border}`, color, cursor }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 500, color: "#8A7F72", width: "20px", flexShrink: 0 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {isAnswered && i === q.correct && <CheckCircle2 size={15} color="#7A9A6A" className="flex-shrink-0" />}
                  {isAnswered && i === selected && selected !== q.correct && <XCircle size={15} color="#B5503A" className="flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {isAnswered && (
          <div className="rounded-xl p-4 mb-5" style={{
            background: isCorrect ? "rgba(122,154,106,0.08)" : "rgba(181,80,58,0.06)",
            border: `1px solid ${isCorrect ? "rgba(122,154,106,0.2)" : "rgba(181,80,58,0.15)"}`,
          }}>
            <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: isCorrect ? "#4A7040" : "#B5503A" }} className="mb-1.5">
              {isCorrect ? "Correct" : "Incorrect"} — Explanation
            </div>
            <p style={{ fontSize: "13px", lineHeight: 1.7, color: "#7A7068" }}>{q.explanation}</p>
          </div>
        )}

        <div className="flex justify-between items-center mt-auto">
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full" style={{
                background: i === currentQ ? "#C8873A" : answered[i] ? (userAnswers[i] === questions[i].correct ? "#7A9A6A" : "#B5503A") : "rgba(156,132,102,0.2)"
              }} />
            ))}
          </div>
          {isAnswered && (
            <button onClick={next} className="flex items-center gap-2 px-5 py-2.5 rounded-xl hover:opacity-80 transition"
              style={{ fontSize: "13px", fontWeight: 500, background: "#C8873A", color: "#fff" }}>
              {currentQ < questions.length - 1 ? "Next Question" : "See Results"} <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
