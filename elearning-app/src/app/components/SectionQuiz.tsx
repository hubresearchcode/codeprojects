import { useState } from "react";
import { CheckCircle2, XCircle, ChevronDown } from "lucide-react";

interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface SectionQuizProps {
  questions: QuizQuestion[];
  label?: string;
}

export function SectionQuiz({ questions, label = "Quick check" }: SectionQuizProps) {
  const [open, setOpen] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  const q = questions[currentQ];

  function handleSelect(i: number) {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === q.correct) setScore((s) => s + 1);
  }

  function handleNext() {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setDone(true);
    }
  }

  function handleRetry() {
    setCurrentQ(0); setSelected(null); setAnswered(false); setDone(false); setScore(0);
  }

  return (
    <div className="my-6 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(200,135,58,0.2)", background: "#FFFCF8" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:opacity-80 transition"
        style={{ background: "rgba(200,135,58,0.07)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#C8873A" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff" }}>?</span>
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#2D2820" }}>{label}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72" }}>
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </span>
        </div>
        <ChevronDown size={16} color="#8A7F72" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {open && (
        <div className="px-5 pb-5 pt-4">
          {!done ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72" }}>
                  Q{currentQ + 1} of {questions.length}
                </span>
                <div className="flex gap-1">
                  {questions.map((_, i) => (
                    <div key={i} className="w-5 h-1 rounded-full" style={{ background: i < currentQ ? "#C8873A" : i === currentQ ? "#C8873A" : "rgba(156,132,102,0.2)", opacity: i === currentQ ? 1 : i < currentQ ? 0.6 : 1 }} />
                  ))}
                </div>
              </div>

              <p style={{ fontSize: "14px", fontWeight: 500, color: "#2D2820", lineHeight: 1.6, marginBottom: "14px" }}>{q.q}</p>

              <div className="flex flex-col gap-2 mb-4">
                {q.options.map((opt, i) => {
                  let bg = "#F8F4EE";
                  let border = "rgba(156,132,102,0.15)";
                  let color = "#2D2820";
                  if (answered) {
                    if (i === q.correct) { bg = "rgba(122,154,106,0.1)"; border = "rgba(122,154,106,0.3)"; color = "#4A7040"; }
                    else if (i === selected) { bg = "rgba(181,80,58,0.08)"; border = "rgba(181,80,58,0.2)"; color = "#B5503A"; }
                    else { color = "#A89880"; }
                  }
                  return (
                    <button key={i} onClick={() => handleSelect(i)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all hover:opacity-80"
                      style={{ fontSize: "13px", background: bg, border: `1px solid ${border}`, color, cursor: answered ? "default" : "pointer" }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72", width: "16px", flexShrink: 0 }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {answered && i === q.correct && <CheckCircle2 size={14} color="#7A9A6A" />}
                      {answered && i === selected && i !== q.correct && <XCircle size={14} color="#B5503A" />}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div className="rounded-xl px-4 py-3 mb-4" style={{ background: selected === q.correct ? "rgba(122,154,106,0.08)" : "rgba(181,80,58,0.06)", border: `1px solid ${selected === q.correct ? "rgba(122,154,106,0.2)" : "rgba(181,80,58,0.15)"}` }}>
                  <p style={{ fontSize: "12px", color: "#7A7068", lineHeight: 1.65 }}>{q.explanation}</p>
                </div>
              )}

              {answered && (
                <button onClick={handleNext} className="px-4 py-2 rounded-xl hover:opacity-80 transition"
                  style={{ fontSize: "12px", fontWeight: 500, background: "#C8873A", color: "#fff" }}>
                  {currentQ < questions.length - 1 ? "Next →" : "Finish"}
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: score === questions.length ? "rgba(122,154,106,0.12)" : "rgba(200,135,58,0.1)" }}>
                  {score === questions.length ? <CheckCircle2 size={18} color="#7A9A6A" /> : <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 700, color: "#C8873A" }}>{score}/{questions.length}</span>}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "#2D2820" }}>{score === questions.length ? "Perfect!" : `${score} of ${questions.length} correct`}</div>
                  <div style={{ fontSize: "11px", color: "#8A7F72" }}>{score < questions.length ? "Review the explanation above and try again." : "Keep going to the next section."}</div>
                </div>
              </div>
              <button onClick={handleRetry} className="px-3 py-1.5 rounded-xl hover:opacity-70 transition" style={{ fontSize: "12px", color: "#8A7F72", border: "1px solid rgba(156,132,102,0.2)" }}>
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
