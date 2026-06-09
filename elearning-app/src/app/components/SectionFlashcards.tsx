import { useState } from "react";
import { ChevronDown, RotateCcw, ThumbsUp, ThumbsDown, Minus } from "lucide-react";

interface Flashcard {
  front: string;
  back: string;
}

interface SectionFlashcardsProps {
  cards: Flashcard[];
  label?: string;
}

export function SectionFlashcards({ cards, label = "Flashcards" }: SectionFlashcardsProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<(string | null)[]>(new Array(cards.length).fill(null));

  const card = cards[index];

  function rate(r: string) {
    const next = [...ratings];
    next[index] = r;
    setRatings(next);
    if (index < cards.length - 1) {
      setTimeout(() => { setFlipped(false); setTimeout(() => setIndex(index + 1), 120); }, 150);
    }
  }

  function reset() {
    setIndex(0); setFlipped(false); setRatings(new Array(cards.length).fill(null));
  }

  const done = ratings.every((r) => r !== null);

  return (
    <div className="my-6 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(69,82,64,0.18)", background: "#FAFAF8" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:opacity-80 transition"
        style={{ background: "rgba(69,82,64,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#455240" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff" }}>★</span>
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#2D2820" }}>{label}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72" }}>
            {cards.length} card{cards.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5">
            {cards.map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full" style={{ background: ratings[i] === "easy" ? "#7A9A6A" : ratings[i] === "hard" ? "#C8873A" : ratings[i] === "again" ? "#B5503A" : "rgba(156,132,102,0.3)" }} />
            ))}
          </div>
          <ChevronDown size={16} color="#8A7F72" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-3">
          {!done ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72" }}>{index + 1} / {cards.length}</span>
              </div>

              {/* Card flip */}
              <div className="mb-4 cursor-pointer" style={{ perspective: "1000px" }} onClick={() => setFlipped(!flipped)}>
                <div style={{ position: "relative", transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", transition: "transform 0.4s", minHeight: "140px" }}>
                  <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", background: "#FFFFFF", borderRadius: "12px", border: "1px solid rgba(156,132,102,0.15)", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <p style={{ fontSize: "14px", fontWeight: 500, color: "#2D2820", lineHeight: 1.6 }}>{card.front}</p>
                    <span style={{ fontSize: "10px", color: "#8A7F72", display: "flex", alignItems: "center", gap: "4px" }}><RotateCcw size={10} /> tap to flip</span>
                  </div>
                  <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", background: "rgba(69,82,64,0.04)", borderRadius: "12px", border: "1px solid rgba(69,82,64,0.15)", padding: "20px", transform: "rotateY(180deg)" }}>
                    <p style={{ fontSize: "13px", color: "#2D2820", lineHeight: 1.7 }}>{card.back}</p>
                  </div>
                </div>
              </div>

              {flipped ? (
                <div className="flex gap-2">
                  {[
                    { r: "again", label: "Again", color: "#B5503A", bg: "rgba(181,80,58,0.07)", border: "rgba(181,80,58,0.18)", icon: <ThumbsDown size={13} color="#B5503A" /> },
                    { r: "hard", label: "Hard", color: "#C8873A", bg: "rgba(200,135,58,0.07)", border: "rgba(200,135,58,0.2)", icon: <Minus size={13} color="#C8873A" /> },
                    { r: "easy", label: "Easy", color: "#7A9A6A", bg: "rgba(122,154,106,0.07)", border: "rgba(122,154,106,0.2)", icon: <ThumbsUp size={13} color="#7A9A6A" /> },
                  ].map((btn) => (
                    <button key={btn.r} onClick={() => rate(btn.r)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl hover:opacity-80 transition"
                      style={{ fontSize: "12px", fontWeight: 500, color: btn.color, background: btn.bg, border: `1px solid ${btn.border}` }}>
                      {btn.icon} {btn.label}
                    </button>
                  ))}
                </div>
              ) : (
                <button onClick={() => setFlipped(true)} className="px-4 py-2 rounded-xl hover:opacity-80 transition" style={{ fontSize: "12px", fontWeight: 500, background: "#455240", color: "#fff" }}>
                  Show answer
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center justify-between py-2">
              <div>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "#2D2820" }}>Set complete</div>
                <div style={{ fontSize: "11px", color: "#8A7F72" }}>
                  {ratings.filter(r => r === "easy").length} easy · {ratings.filter(r => r === "hard").length} hard · {ratings.filter(r => r === "again").length} again
                </div>
              </div>
              <button onClick={reset} className="px-3 py-1.5 rounded-xl hover:opacity-70 transition" style={{ fontSize: "12px", color: "#8A7F72", border: "1px solid rgba(156,132,102,0.2)" }}>
                Reset
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
