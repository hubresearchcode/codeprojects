import { Flame, Clock, Target, TrendingUp, ArrowRight, BookOpen, Zap } from "lucide-react";

interface DashboardProps {
  onViewChange: (view: string) => void;
}

const upcomingReviews = [
  { topic: "Retrieval Practice — Testing Effect", due: "Today", urgency: "high", type: "Flashcard" },
  { topic: "Spaced Practice vs Cramming", due: "Today", urgency: "high", type: "Quiz" },
  { topic: "Bjork's Desirable Difficulties", due: "Tomorrow", urgency: "medium", type: "Flashcard" },
  { topic: "Cognitive Load Theory", due: "In 3 days", urgency: "low", type: "Elaboration" },
  { topic: "Interleaving vs Blocking", due: "In 5 days", urgency: "low", type: "Quiz" },
];

const techniqueStats = [
  { name: "Retrieval Practice", evidence: "Strong", effectSize: "g = 0.51–0.70", completed: 8, total: 12, color: "#C8873A" },
  { name: "Spaced Practice", evidence: "Strong", effectSize: "High utility", completed: 5, total: 8, color: "#455240" },
  { name: "Elaboration", evidence: "Moderate", effectSize: "g = 0.55", completed: 3, total: 6, color: "#9C8466" },
  { name: "Interleaving", evidence: "Moderate", effectSize: "g = 0.42", completed: 2, total: 5, color: "#7A9A6A" },
];

const weekActivity = [4, 7, 5, 8, 6, 9, 3];
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const card: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: "16px",
  border: "1px solid rgba(156,132,102,0.14)",
  boxShadow: "0 1px 4px rgba(100,80,60,0.06)",
};

const typeTagColors: Record<string, { bg: string; color: string }> = {
  Flashcard: { bg: "rgba(200,135,58,0.12)", color: "#A8692A" },
  Quiz: { bg: "rgba(69,82,64,0.1)", color: "#455240" },
  Elaboration: { bg: "rgba(156,132,102,0.12)", color: "#7A6448" },
};

export function Dashboard({ onViewChange }: DashboardProps) {
  const maxActivity = Math.max(...weekActivity);

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ fontFamily: "'Inter', sans-serif", background: "#F4EFE6" }}>
      {/* Header */}
      <div className="mb-8">
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72", letterSpacing: "0.12em" }} className="uppercase mb-2">
          Monday, 8 June 2026
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 700, color: "#2D2820" }} className="mb-1">
          Good morning, Alex.
        </h1>
        <p style={{ fontSize: "14px", color: "#7A7068" }}>
          You have <span style={{ color: "#C8873A", fontWeight: 500 }}>2 items due today</span> and a 7-day streak. Keep the momentum.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Day Streak", value: "7", icon: <Flame size={16} color="#E0703A" />, valueColor: "#E0703A", sub: "Personal best: 14" },
          { label: "Cards Due Today", value: "12", icon: <Zap size={16} color="#C8873A" />, valueColor: "#C8873A", sub: "2 overdue" },
          { label: "Study Time (week)", value: "4.2h", icon: <Clock size={16} color="#455240" />, valueColor: "#455240", sub: "↑ 18% vs last week" },
          { label: "Retention Score", value: "74%", icon: <Target size={16} color="#7A9A6A" />, valueColor: "#7A9A6A", sub: "Based on quiz results" },
        ].map((stat) => (
          <div key={stat.label} style={card} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: "12px", color: "#8A7F72" }}>{stat.label}</span>
              {stat.icon}
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 700, color: stat.valueColor }} className="mb-1">
              {stat.value}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72" }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        {/* Upcoming reviews */}
        <div className="col-span-2 p-5" style={card}>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 600, color: "#2D2820" }}>
              Spaced Review Queue
            </h2>
            <button
              onClick={() => onViewChange("schedule")}
              className="flex items-center gap-1 transition-colors hover:opacity-70"
              style={{ fontSize: "12px", color: "#8A7F72" }}
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {upcomingReviews.map((review, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors cursor-pointer group" style={{ background: "#F8F4EE" }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{
                  background: review.urgency === "high" ? "#E0703A" : review.urgency === "medium" ? "#C8873A" : "#C5BDB4"
                }} />
                <span style={{ fontSize: "13px", color: "#2D2820" }} className="flex-1">{review.topic}</span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
                  ...( typeTagColors[review.type] || { bg: "#EDE7DC", color: "#7A7068" }),
                  background: (typeTagColors[review.type] || { bg: "#EDE7DC" }).bg,
                  color: (typeTagColors[review.type] || { color: "#7A7068" }).color,
                  padding: "2px 8px", borderRadius: "6px"
                }}>
                  {review.type}
                </span>
                <span style={{ fontSize: "11px", fontWeight: review.urgency === "high" ? 500 : 400, color: review.urgency === "high" ? "#E0703A" : review.urgency === "medium" ? "#C8873A" : "#8A7F72" }}>
                  {review.due}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly activity */}
        <div style={card} className="p-5">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 600, color: "#2D2820" }} className="mb-4">
            This Week
          </h2>
          <div className="flex items-end gap-2 h-24 mb-3">
            {weekActivity.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-md"
                  style={{
                    height: `${(val / maxActivity) * 88}px`,
                    background: i === 5 || i === 6 ? "rgba(200,135,58,0.2)" : "rgba(200,135,58,0.55)",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            {dayLabels.map((d, i) => (
              <div key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#8A7F72" }} className="flex-1 text-center">
                {d}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(156,132,102,0.12)" }}>
            <div style={{ fontSize: "12px", color: "#8A7F72" }} className="mb-1">Sessions completed</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: "#2D2820" }}>
              42 <span style={{ fontSize: "13px", fontWeight: 400, color: "#8A7F72" }}>items reviewed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technique mastery */}
      <div style={card} className="p-5 mb-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 600, color: "#2D2820" }} className="mb-0.5">
              Technique Mastery
            </h2>
            <p style={{ fontSize: "12px", color: "#8A7F72" }}>Evidence-based techniques from your Week 1 research</p>
          </div>
          <button
            onClick={() => onViewChange("pathway")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors hover:opacity-80"
            style={{ fontSize: "12px", fontWeight: 500, background: "rgba(200,135,58,0.1)", color: "#C8873A" }}
          >
            Open Pathway <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {techniqueStats.map((tech) => (
            <div key={tech.name} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span style={{ fontSize: "13px", fontWeight: 500, color: "#2D2820" }}>{tech.name}</span>
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72" }}>
                    {tech.effectSize}
                  </span>
                  <span style={{
                    fontSize: "10px", fontWeight: 500, padding: "2px 6px", borderRadius: "6px",
                    background: tech.evidence === "Strong" ? "rgba(122,154,106,0.15)" : "rgba(200,135,58,0.12)",
                    color: tech.evidence === "Strong" ? "#4A7040" : "#A8692A",
                  }}>
                    {tech.evidence}
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(156,132,102,0.12)" }}>
                <div className="h-full rounded-full" style={{ width: `${(tech.completed / tech.total) * 100}%`, background: tech.color, transition: "width 0.7s ease" }} />
              </div>
              <div style={{ fontSize: "11px", color: "#8A7F72" }}>
                {tech.completed}/{tech.total} practice sessions complete
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Research insight banner */}
      <div className="rounded-2xl p-4 flex gap-4" style={{ background: "rgba(200,135,58,0.08)", border: "1px solid rgba(200,135,58,0.18)" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(200,135,58,0.15)" }}>
          <TrendingUp size={16} color="#C8873A" />
        </div>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "#2D2820" }} className="mb-1">
            Research Insight: You may be in the fluency trap
          </div>
          <p style={{ fontSize: "12px", color: "#7A7068", lineHeight: 1.65 }}>
            Your self-assessment scores are 18% higher than your closed-book quiz results. Bjork (2011): "what feels effective is a poor guide to durable learning."
            Shift from re-reading toward more <span style={{ color: "#C8873A", fontWeight: 500 }}>retrieval practice</span> — your weakest area.
          </p>
        </div>
        <button
          onClick={() => onViewChange("flashcards")}
          className="flex-shrink-0 self-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors hover:opacity-80"
          style={{ fontSize: "12px", fontWeight: 500, background: "#C8873A", color: "#fff" }}
        >
          Practice now <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
