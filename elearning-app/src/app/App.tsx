import { useState } from "react";
import { HomePage } from "./components/HomePage";
import { ModulePage } from "./components/ModulePage";
import { GeneratedModule } from "./lib/generateModule";
import "../styles/fonts.css";

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

const initialModules: Module[] = [
  {
    id: 1,
    week: 1,
    title: "How to Learn Effectively",
    description: "Evidence-based study techniques from cognitive science: retrieval practice, spaced repetition, interleaving, elaboration, and dual coding.",
    status: "active",
    topics: 9,
    flashcards: 12,
    progress: 35,
    tags: ["Retrieval Practice", "Spaced Repetition", "Cognitive Load"],
  },
  {
    id: 2,
    week: 2,
    title: "Memory & Consolidation",
    description: "How memories are formed, stored, and retrieved. Sleep consolidation, schema formation, and the role of prior knowledge.",
    status: "locked",
    topics: 0,
    flashcards: 0,
    progress: 0,
    tags: ["Memory", "Sleep", "Schemas"],
  },
  {
    id: 3,
    week: 3,
    title: "Metacognition & Self-Regulation",
    description: "How to accurately monitor your own learning, calibrate judgments of learning, and regulate study strategies.",
    status: "locked",
    topics: 0,
    flashcards: 0,
    progress: 0,
    tags: ["Metacognition", "Self-regulation"],
  },
];

export default function App() {
  const [view, setView] = useState<"home" | "module">("home");
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [activeModuleId, setActiveModuleId] = useState<number>(1);
  const [moduleContents, setModuleContents] = useState<Record<number, GeneratedModule>>({});

  function handleOpenModule(id: number) {
    setActiveModuleId(id);
    setView("module");
  }

  function handleModuleUploaded(title: string, content: GeneratedModule) {
    const clean = title.replace(/^Week \d+:\s*/i, "").trim();
    const nextWeek = modules.filter(m => m.status !== "locked").length + 1;
    const totalFlashcards = content.sections.reduce((sum, s) => sum + s.flashcards.length, 0);
    const newId = modules.length + 1;
    const newModule: Module = {
      id: newId,
      week: nextWeek,
      title: content.title || clean || title,
      description: content.description,
      status: "active",
      topics: content.sections.length,
      flashcards: totalFlashcards,
      progress: 0,
      tags: content.tags,
    };
    setModules((prev) => {
      const existing = prev.find(m => m.week === nextWeek);
      if (existing) {
        return prev.map(m => m.week === nextWeek ? { ...m, ...newModule, id: m.id } : m);
      }
      return [...prev, newModule];
    });
    setModuleContents((prev) => ({ ...prev, [newId]: content }));
    setActiveModuleId(newId);
    setView("module");
  }

  if (view === "module") {
    const activeModule = modules.find((m) => m.id === activeModuleId) ?? modules[0];
    return (
      <ModulePage
        module={activeModule}
        content={moduleContents[activeModule.id]}
        onBack={() => setView("home")}
      />
    );
  }

  return (
    <HomePage
      modules={modules}
      onOpenModule={handleOpenModule}
      onModuleUploaded={handleModuleUploaded}
    />
  );
}
