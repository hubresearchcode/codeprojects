import { BookOpen, Upload, Map, Brain, ClipboardList, Calendar, BarChart2, ChevronRight } from "lucide-react";

type View = "dashboard" | "upload" | "pathway" | "flashcards" | "quiz" | "schedule";

interface NavItem {
  id: View;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
  selectedWeek: number;
  weeks: { id: number; title: string; status: "complete" | "active" | "locked" }[];
}

export function Navigation({ currentView, onViewChange, selectedWeek, weeks }: NavigationProps) {
  const navItems: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart2 size={16} /> },
    { id: "upload", label: "Upload Content", icon: <Upload size={16} /> },
    { id: "pathway", label: "Learning Pathway", icon: <Map size={16} /> },
    { id: "flashcards", label: "Flashcards", icon: <Brain size={16} />, badge: "12 due" },
    { id: "quiz", label: "Self-Test", icon: <ClipboardList size={16} /> },
    { id: "schedule", label: "Review Schedule", icon: <Calendar size={16} /> },
  ];

  return (
    <nav
      style={{ fontFamily: "'Inter', sans-serif", background: "#FFFFFF", borderRight: "1px solid rgba(156,132,102,0.15)" }}
      className="flex flex-col h-full w-64 shrink-0"
    >
      {/* Logo */}
      <div className="px-6 py-5" style={{ borderBottom: "1px solid rgba(156,132,102,0.12)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#C8873A" }}>
            <BookOpen size={14} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: 700, color: "#2D2820" }}>
              LearnPath
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#8A7F72", letterSpacing: "0.12em" }}>
              AI STUDY SYSTEM
            </div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex flex-col gap-0.5 p-3 flex-1">
        {navItems.map((item) => {
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group"
              style={{
                background: active ? "rgba(200,135,58,0.1)" : "transparent",
                color: active ? "#C8873A" : "#8A7F72",
              }}
            >
              <span style={{ color: active ? "#C8873A" : "#A89880" }}>{item.icon}</span>
              <span style={{ fontSize: "13px", fontWeight: active ? 500 : 400, color: active ? "#C8873A" : "#5C5249" }} className="flex-1">
                {item.label}
              </span>
              {item.badge && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", fontWeight: 600, color: "#455240", background: "rgba(69,82,64,0.1)", padding: "2px 6px", borderRadius: "6px" }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Week selector */}
      <div className="p-3" style={{ borderTop: "1px solid rgba(156,132,102,0.12)" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#8A7F72", letterSpacing: "0.12em" }} className="px-3 mb-2 uppercase">
          Weeks
        </div>
        <div className="flex flex-col gap-0.5">
          {weeks.map((week) => (
            <div
              key={week.id}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
              style={{
                background: week.id === selectedWeek ? "rgba(200,135,58,0.08)" : "transparent",
                opacity: week.status === "locked" ? 0.4 : 1,
                cursor: week.status === "locked" ? "not-allowed" : "pointer",
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background: week.status === "complete" ? "#7A9A6A" : week.status === "active" ? "#C8873A" : "#C5BDB4",
                }}
              />
              <span style={{ fontSize: "12px", color: week.id === selectedWeek ? "#C8873A" : "#7A7068" }} className="flex-1 truncate">
                Wk {week.id}: {week.title}
              </span>
              {week.id === selectedWeek && <ChevronRight size={12} color="#C8873A" />}
            </div>
          ))}
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-4 flex items-center gap-3" style={{ borderTop: "1px solid rgba(156,132,102,0.12)" }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(200,135,58,0.15)", color: "#C8873A", fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: 700 }}>
          A
        </div>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 500, color: "#2D2820" }}>Alex Chen</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "#8A7F72" }}>MSc Psychology</div>
        </div>
      </div>
    </nav>
  );
}
