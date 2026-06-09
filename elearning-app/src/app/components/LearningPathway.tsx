import { useState } from "react";
import { CheckCircle2, Lock, Play, Clock, ChevronRight, ArrowRight, BookOpen, Brain, Shuffle, MessageSquare, FlaskConical, Map } from "lucide-react";

interface LearningPathwayProps {
  onViewChange: (view: string) => void;
}

type StageStatus = "complete" | "active" | "available" | "locked";

interface PathwayStage {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  duration: string;
  status: StageStatus;
  evidence: string;
  description: string;
  tasks: string[];
  color: string;
}

const stages: PathwayStage[] = [
  {
    id: "read", title: "Initial Read", subtitle: "Prime your prior knowledge",
    icon: <BookOpen size={17} />, duration: "25 min", status: "complete",
    evidence: "Activate prior knowledge",
    description: "Read through the material once without stopping to highlight. Focus on understanding the overall structure and how concepts connect.",
    tasks: ["Read Roediger & Karpicke (2006) summary", "Read Dunlosky et al. (2013) overview", "Note 3 things that surprise you"],
    color: "#7A9A6A",
  },
  {
    id: "braindump", title: "Brain Dump", subtitle: "Retrieval practice — closed book",
    icon: <Brain size={17} />, duration: "15 min", status: "complete",
    evidence: "Retrieval practice · g = 0.50–0.70",
    description: "Close all materials. Write down everything you can remember. Don't peek — the struggle to recall IS the learning mechanism.",
    tasks: ["Set a 15-minute timer", "Write down all key concepts from memory", "Check against source and note gaps"],
    color: "#C8873A",
  },
  {
    id: "flashcards", title: "Flashcard Drill", subtitle: "Spaced retrieval on key terms",
    icon: <Brain size={17} />, duration: "20 min", status: "active",
    evidence: "Retrieval + Spacing · g = 0.67 classroom",
    description: "Work through the generated flashcard deck. Rate each card — this fuels the spaced repetition algorithm that schedules your next review.",
    tasks: ["Complete 18 flashcards", "Rate confidence: Easy / Hard / Again", "Flag cards you got wrong for re-review"],
    color: "#C8873A",
  },
  {
    id: "elaboration", title: "Elaboration", subtitle: "Ask why. Connect to prior knowledge.",
    icon: <MessageSquare size={17} />, duration: "20 min", status: "available",
    evidence: "Self-explanation · g = 0.55",
    description: "Work through 6 elaboration prompts. For each concept, explain WHY it is true and HOW it connects to something you already know.",
    tasks: ["Answer all 6 elaboration prompts in writing", "Explain the testing effect as if to a friend", "Compare retrieval vs spacing: when would you use each?"],
    color: "#9C8466",
  },
  {
    id: "dualcoding", title: "Dual Coding", subtitle: "Build an integrated concept map",
    icon: <Map size={17} />, duration: "15 min", status: "available",
    evidence: "Dual coding · ~0.48 SD",
    description: "Create a visual representation of the technique hierarchy from the research. Words + visuals processed through separate channels.",
    tasks: ["Sketch the technique evidence hierarchy", "Map relationships: retrieval → spacing → interleaving", "Annotate with one key finding per technique"],
    color: "#9C8466",
  },
  {
    id: "interleave", title: "Interleaved Practice", subtitle: "Mix confusable concepts",
    icon: <Shuffle size={17} />, duration: "25 min", status: "locked",
    evidence: "Interleaving · g = 0.42",
    description: "Practice discriminating between related techniques. Interleaving works best for confusable categories.",
    tasks: ["Complete 12 interleaved practice questions", "Identify which technique applies to each scenario", "Explain WHY they differ"],
    color: "#8B7355",
  },
  {
    id: "quiz", title: "Closed-Book Quiz", subtitle: "Realistic test conditions",
    icon: <FlaskConical size={17} />, duration: "20 min", status: "locked",
    evidence: "Testing under realistic conditions",
    description: "The final gate. No notes, no hints. Timed MCQ + short-answer. Your score here is your true learning signal.",
    tasks: ["Complete 12 mixed-format questions", "No notes, no previewing", "Review incorrect answers with elaboration"],
    color: "#455240",
  },
];

const statusConfig = {
  complete: { cardBg: "#FFFFFF", border: "rgba(122,154,106,0.25)", badgeBg: "rgba(122,154,106,0.12)", badgeColor: "#4A7040", label: "Complete" },
  active: { cardBg: "#FFFFFF", border: "rgba(200,135,58,0.35)", badgeBg: "rgba(200,135,58,0.12)", badgeColor: "#A8692A", label: "In Progress" },
  available: { cardBg: "#FFFFFF", border: "rgba(156,132,102,0.22)", badgeBg: "rgba(156,132,102,0.1)", badgeColor: "#7A6448", label: "Ready" },
  locked: { cardBg: "#F8F4EE", border: "rgba(156,132,102,0.1)", badgeBg: "rgba(156,132,102,0.08)", badgeColor: "#9C8A7A", label: "Locked" },
};

export function LearningPathway({ onViewChange }: LearningPathwayProps) {
  const [expanded, setExpanded] = useState<string | null>("flashcards");
  const completedCount = stages.filter((s) => s.status === "complete").length;
  const totalMinutes = stages.reduce((acc, s) => acc + parseInt(s.duration), 0);

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ fontFamily: "'Inter', sans-serif", background: "#F4EFE6" }}>
      {/* Header */}
      <div className="mb-6">
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72", letterSpacing: "0.12em" }} className="uppercase mb-2">
          Week 1 · Learning Pathway
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 700, color: "#2D2820" }} className="mb-1">
          How to Learn Effectively
        </h1>
        <p style={{ fontSize: "13px", color: "#8A7F72" }} className="mb-4">Evidence-Based Guide for Masters Students · Dunlosky, Bjork et al.</p>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(156,132,102,0.15)" }}>
            <div className="h-full rounded-full" style={{ width: `${(completedCount / stages.length) * 100}%`, background: "#C8873A", transition: "width 0.7s ease" }} />
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#8A7F72", whiteSpace: "nowrap" }}>
            {completedCount}/{stages.length} stages · {totalMinutes} min total
          </span>
        </div>
      </div>

      {/* Stage list */}
      <div className="flex flex-col gap-3">
        {stages.map((stage, index) => {
          const config = statusConfig[stage.status];
          const isExpanded = expanded === stage.id;
          const isLocked = stage.status === "locked";

          return (
            <div key={stage.id} className="flex gap-4">
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors"
                  style={{
                    borderColor: isLocked ? "rgba(156,132,102,0.15)" : stage.color,
                    background: isLocked ? "#F8F4EE" : `${stage.color}14`,
                    color: isLocked ? "#C5BDB4" : stage.color,
                  }}>
                  {stage.status === "complete" ? <CheckCircle2 size={16} color={stage.color} /> : isLocked ? <Lock size={13} color="#C5BDB4" /> : <span style={{ color: stage.color }}>{stage.icon}</span>}
                </div>
                {index < stages.length - 1 && (
                  <div className="w-px flex-1 mt-1 min-h-4" style={{ background: isLocked ? "rgba(156,132,102,0.1)" : `${stage.color}20` }} />
                )}
              </div>

              {/* Card */}
              <div
                className="flex-1 rounded-2xl overflow-hidden mb-3 transition-all"
                style={{
                  background: config.cardBg,
                  border: `1px solid ${config.border}`,
                  boxShadow: "0 1px 3px rgba(100,80,60,0.05)",
                  opacity: isLocked ? 0.6 : 1,
                  cursor: isLocked ? "not-allowed" : "pointer",
                }}
                onClick={() => !isLocked && setExpanded(isExpanded ? null : stage.id)}
              >
                <div className="p-4 flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span style={{ fontSize: "15px", fontWeight: 600, color: "#2D2820" }}>{stage.title}</span>
                      <span style={{ fontSize: "10px", fontWeight: 500, background: config.badgeBg, color: config.badgeColor, padding: "2px 7px", borderRadius: "6px" }}>
                        {config.label}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#8A7F72" }} className="mb-2">{stage.subtitle}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#A89880" }}>{stage.evidence}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#8A7F72" }} className="flex items-center gap-1">
                      <Clock size={11} /> {stage.duration}
                    </span>
                    {!isLocked && <ChevronRight size={16} color="#8A7F72" style={{ transform: isExpanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-3" style={{ borderTop: "1px solid rgba(156,132,102,0.1)" }}>
                    <p style={{ fontSize: "13px", color: "#7A7068", lineHeight: 1.7 }} className="mb-4">{stage.description}</p>
                    <div className="mb-4">
                      <div style={{ fontSize: "11px", fontWeight: 600, color: "#2D2820", textTransform: "uppercase", letterSpacing: "0.08em" }} className="mb-2">Tasks</div>
                      <div className="flex flex-col gap-1.5">
                        {stage.tasks.map((task, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <div className="w-4 h-4 rounded-md flex-shrink-0 mt-0.5" style={{ border: "1.5px solid rgba(156,132,102,0.3)" }} />
                            <span style={{ fontSize: "12px", color: "#2D2820" }}>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {(stage.id === "flashcards" || stage.id === "quiz") && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onViewChange(stage.id === "flashcards" ? "flashcards" : "quiz"); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl hover:opacity-80 transition-all"
                        style={{ fontSize: "13px", fontWeight: 500, background: stage.color, color: "#fff" }}
                      >
                        <Play size={13} />
                        {stage.id === "flashcards" ? "Start Flashcard Drill" : "Begin Self-Test"}
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
