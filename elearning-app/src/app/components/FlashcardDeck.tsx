import { useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, ThumbsUp, ThumbsDown, Minus, CheckCircle2 } from "lucide-react";

const flashcards = [
  {
    front: "What is the 'testing effect' and what effect size does it produce?",
    back: "Actively recalling information from memory (self-quizzing, flashcards, brain-dumps) produces more durable learning than restudying. Effect size: Hedges' g ≈ 0.50–0.70 (Rowland 2014; Adesope et al. 2017). Single practice tests (g = 0.70) outperform multiple tests (g = 0.51).",
    tag: "Retrieval Practice", tagColor: "#C8873A",
  },
  {
    front: "In Roediger & Karpicke (2006), how much did testing vs re-studying groups differ at one-week delay?",
    back: "Testing group recalled 56% vs 42% for the restudy group (d = 0.83) on a 1-week delay. In Experiment 2: 61% vs 40%. On immediate test (5 min), restudying was better (83% vs 71%) — demonstrating the learning/performance gap.",
    tag: "Retrieval Practice", tagColor: "#C8873A",
  },
  {
    front: "What is Bjork's 'learning–performance distinction'?",
    back: "Performance = how well you do during study today. Learning = the relatively permanent change measured later in a new context. Techniques that feel easy (re-reading, highlighting) boost performance but not learning. 'Desirable difficulties' (retrieval, spacing, interleaving) feel harder but produce durable learning.",
    tag: "Core Theory", tagColor: "#455240",
  },
  {
    front: "What is 'spaced practice' and what does the optimal spacing interval look like?",
    back: "Spreading study over time produces far better long-term retention than cramming. Cepeda et al. (2006): optimal gap ≈ 10–20% of the retention interval (e.g., to retain for 1 year, review every 1–2 months). Dunlosky et al. (2013): 'high utility.'",
    tag: "Spaced Practice", tagColor: "#7A9A6A",
  },
  {
    front: "What is 'interleaving' and when does it work best?",
    back: "Mixing different problem types (ABCABC) rather than practising one fully (AAABBB). Brunmair & Richter (2019): g = 0.42 overall. Works best for visually similar, confusable categories (paintings: g ≈ 0.67). Smaller for mathematics (g ≈ 0.34). Does NOT help for totally unrelated material.",
    tag: "Interleaving", tagColor: "#9C8466",
  },
  {
    front: "What is elaboration / self-explanation and what is its effect size?",
    back: "Elaboration = asking 'why' and 'how', connecting new material to existing knowledge. Bisra et al. (2018) meta-analysis: g = 0.55 across 64 studies (~5,917 participants). Dunlosky et al.: 'moderate utility.' Particularly valuable for Masters-level integrative work.",
    tag: "Elaboration", tagColor: "#9C8466",
  },
  {
    front: "What is the 'expertise reversal effect' and why does it matter for Masters students?",
    back: "Techniques that help novices (worked examples, detailed explanations) become redundant or detrimental for more knowledgeable learners. Kalyuga et al. (2003). Masters students are expert in some sub-areas and novice in others — match support level to your expertise in each specific topic.",
    tag: "Worked Examples", tagColor: "#8B7355",
  },
  {
    front: "What is 'dual coding' and when does it work?",
    back: "Combining words with relevant visuals (diagrams, concept maps, timelines). Butcher (2006): diagrams added to text improved understanding by ~0.48 SD. Critical caveat: words and images must be conceptually integrated, not decorative. Decorative images can HURT learning.",
    tag: "Dual Coding", tagColor: "#9C8466",
  },
  {
    front: "Why is re-reading rated 'low utility' despite being the most common study strategy?",
    back: "Re-reading mainly increases familiarity, fuelling the 'illusion of fluency' — you mistake 'this looks familiar' for 'I know this.' Dunlosky et al. (2013): 'low utility.' Far weaker than spending the same time on retrieval practice.",
    tag: "Low Utility", tagColor: "#8A7F72",
  },
  {
    front: "What does Cognitive Load Theory (CLT) say about learning?",
    back: "Working memory is the bottleneck of learning. Three types: (1) Intrinsic load — inherent complexity; (2) Extraneous load — from poor presentation (clutter, split attention) — minimise this; (3) Germane load — effort building schemas. Reduce extraneous load so capacity is free for hard thinking.",
    tag: "Cognitive Science", tagColor: "#455240",
  },
  {
    front: "What is the 'fluency trap' and what is the antidote?",
    back: "Judgments of learning are driven by processing fluency — ease of recall — even when fluency does NOT predict actual recall. Carpenter et al. (2013): a fluent, polished lecturer raised students' confidence without improving their learning. Antidote: test yourself. Failed retrieval gives an accurate read on what you haven't learned.",
    tag: "Core Theory", tagColor: "#455240",
  },
  {
    front: "What does evidence say about 'learning styles' (visual/auditory/kinaesthetic)?",
    back: "NOT supported by evidence. The 'meshing hypothesis' fails every properly designed test. Pashler et al. (2008): almost no studies used the required crossover design, and those that did generally failed. Material has a 'best modality' regardless of learner preference. Categorised as a 'neuromyth.'",
    tag: "Debunked", tagColor: "#B5503A",
  },
];

type ConfidenceRating = "easy" | "hard" | "again" | null;

const card: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: "20px",
  boxShadow: "0 2px 12px rgba(100,80,60,0.08)",
};

export function FlashcardDeck() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<ConfidenceRating[]>(new Array(flashcards.length).fill(null));
  const [isFinished, setIsFinished] = useState(false);

  const cardData = flashcards[currentIndex];
  const ratedCount = ratings.filter((r) => r !== null).length;

  function rate(rating: ConfidenceRating) {
    const newRatings = [...ratings];
    newRatings[currentIndex] = rating;
    setRatings(newRatings);
    if (currentIndex < flashcards.length - 1) {
      setTimeout(() => { setFlipped(false); setTimeout(() => setCurrentIndex(currentIndex + 1), 150); }, 200);
    } else {
      setTimeout(() => setIsFinished(true), 300);
    }
  }

  function restart() {
    setCurrentIndex(0); setFlipped(false);
    setRatings(new Array(flashcards.length).fill(null)); setIsFinished(false);
  }

  const easyCount = ratings.filter((r) => r === "easy").length;
  const hardCount = ratings.filter((r) => r === "hard").length;
  const againCount = ratings.filter((r) => r === "again").length;

  if (isFinished) {
    return (
      <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center" style={{ fontFamily: "'Inter', sans-serif", background: "#F4EFE6" }}>
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(200,135,58,0.12)" }}>
            <CheckCircle2 size={28} color="#C8873A" />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, color: "#2D2820" }} className="mb-2">Session Complete</h2>
          <p style={{ fontSize: "13px", color: "#8A7F72" }} className="mb-8">
            The algorithm has updated your review schedule based on your confidence ratings.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Easy", value: easyCount, color: "#7A9A6A", bg: "rgba(122,154,106,0.1)", sub: "Review in 4 days" },
              { label: "Hard", value: hardCount, color: "#C8873A", bg: "rgba(200,135,58,0.1)", sub: "Review tomorrow" },
              { label: "Again", value: againCount, color: "#B5503A", bg: "rgba(181,80,58,0.08)", sub: "Review in 1 hour" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-4" style={{ background: s.bg, border: `1px solid ${s.color}25` }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 700, color: s.color }} className="mb-1">{s.value}</div>
                <div style={{ fontSize: "12px", color: "#2D2820" }}>{s.label}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#8A7F72" }} className="mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
          <button onClick={restart} className="flex items-center gap-2 px-6 py-3 rounded-xl hover:opacity-80 transition mx-auto" style={{ fontSize: "14px", fontWeight: 500, background: "#C8873A", color: "#fff" }}>
            <RotateCcw size={15} /> Review Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 flex flex-col" style={{ fontFamily: "'Inter', sans-serif", background: "#F4EFE6" }}>
      <div className="mb-6">
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72", letterSpacing: "0.12em" }} className="uppercase mb-2">
          Flashcard Drill · Retrieval Practice
        </div>
        <div className="flex items-center justify-between">
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: "#2D2820" }}>Week 1 Flashcards</h1>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", color: "#8A7F72" }}>{currentIndex + 1} / {flashcards.length}</span>
        </div>
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(156,132,102,0.15)" }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(currentIndex / flashcards.length) * 100}%`, background: "#C8873A" }} />
        </div>
        <div className="flex gap-1 mt-2">
          {ratings.map((r, i) => (
            <div key={i} className="flex-1 h-1 rounded-full" style={{
              background: r === "easy" ? "#7A9A6A" : r === "hard" ? "#C8873A" : r === "again" ? "#B5503A" : "rgba(156,132,102,0.15)"
            }} />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full gap-6">
        <div className="w-full cursor-pointer" onClick={() => setFlipped(!flipped)} style={{ perspective: "1200px" }}>
          <div className="relative w-full transition-transform duration-500" style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", minHeight: "260px" }}>
            {/* Front */}
            <div className="absolute inset-0 p-8 flex flex-col justify-between" style={{ ...card, backfaceVisibility: "hidden" }}>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 500, color: cardData.tagColor, background: `${cardData.tagColor}14`, padding: "2px 8px", borderRadius: "6px" }}>
                    {cardData.tag}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72" }} className="ml-auto">Front · tap to reveal</span>
                </div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 500, lineHeight: 1.6, color: "#2D2820" }}>
                  {cardData.front}
                </p>
              </div>
              <div style={{ fontSize: "11px", color: "#8A7F72" }} className="flex items-center gap-1 mt-4">
                <RotateCcw size={11} /> Tap to flip
              </div>
            </div>
            {/* Back */}
            <div className="absolute inset-0 p-8 flex flex-col" style={{ ...card, border: `1px solid ${cardData.tagColor}30`, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <div className="flex items-center gap-2 mb-4">
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", fontWeight: 500, color: cardData.tagColor, background: `${cardData.tagColor}14`, padding: "2px 8px", borderRadius: "6px" }}>
                  {cardData.tag}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72" }} className="ml-auto">Answer</span>
              </div>
              <p style={{ fontSize: "14px", lineHeight: 1.75, color: "#2D2820" }} className="flex-1">{cardData.back}</p>
            </div>
          </div>
        </div>

        {flipped && (
          <div className="flex gap-3 w-full">
            {[
              { rating: "again" as ConfidenceRating, label: "Again", sub: "1 hour", color: "#B5503A", bg: "rgba(181,80,58,0.06)", border: "rgba(181,80,58,0.18)", icon: <ThumbsDown size={16} color="#B5503A" /> },
              { rating: "hard" as ConfidenceRating, label: "Hard", sub: "Tomorrow", color: "#C8873A", bg: "rgba(200,135,58,0.06)", border: "rgba(200,135,58,0.2)", icon: <Minus size={16} color="#C8873A" /> },
              { rating: "easy" as ConfidenceRating, label: "Easy", sub: "4 days", color: "#7A9A6A", bg: "rgba(122,154,106,0.06)", border: "rgba(122,154,106,0.2)", icon: <ThumbsUp size={16} color="#7A9A6A" /> },
            ].map((btn) => (
              <button key={btn.label} onClick={() => rate(btn.rating)} className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all hover:opacity-80"
                style={{ background: btn.bg, border: `1px solid ${btn.border}` }}>
                {btn.icon}
                <span style={{ fontSize: "12px", fontWeight: 500, color: btn.color }}>{btn.label}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#8A7F72" }}>{btn.sub}</span>
              </button>
            ))}
          </div>
        )}

        {!flipped && (
          <div className="flex gap-4">
            <button
              onClick={() => { if (currentIndex > 0) { setFlipped(false); setTimeout(() => setCurrentIndex(currentIndex - 1), 150); } }}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-30"
              style={{ fontSize: "13px", color: "#7A7068", background: "#FFFFFF", border: "1px solid rgba(156,132,102,0.2)" }}
            >
              <ArrowLeft size={14} /> Previous
            </button>
            <button onClick={() => setFlipped(true)} className="px-6 py-2 rounded-xl flex items-center gap-2 hover:opacity-80 transition" style={{ fontSize: "13px", fontWeight: 500, background: "#C8873A", color: "#fff" }}>
              Reveal Answer <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
