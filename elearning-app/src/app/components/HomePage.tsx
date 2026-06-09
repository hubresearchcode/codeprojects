import { useState, useRef } from "react";
import { Upload, BookOpen, Lock, ChevronRight, CheckCircle2, Brain, ArrowRight, Plus, FileText, X, Loader2, AlertCircle } from "lucide-react";
import { extractTextFromPdf } from "../lib/extractPdf";
import { generateModuleFromText, type GeneratedModule } from "../lib/generateModule";

export interface Module {
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

interface HomePageProps {
  modules: Module[];
  onOpenModule: (id: number) => void;
  onModuleUploaded: (title: string, content: GeneratedModule) => void;
}

const card: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: "16px",
  border: "1px solid rgba(156,132,102,0.14)",
  boxShadow: "0 1px 6px rgba(100,80,60,0.06)",
};

type UploadStage = "idle" | "extracting" | "generating" | "done" | "error";

const STAGES: Record<string, string> = {
  extracting: "Extracting text from PDF...",
  generating: "Building sections, flashcards & quizzes...",
};

export function HomePage({ modules, onOpenModule, onModuleUploaded }: HomePageProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [weekTitle, setWeekTitle] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [generatedContent, setGeneratedContent] = useState<GeneratedModule | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const nextWeekNum = modules.filter((m) => m.status !== "locked").length + 1;

  function openUpload() {
    setWeekTitle(`Week ${nextWeekNum}: `);
    setFile(null);
    setStage("idle");
    setError("");
    setGeneratedContent(null);
    setUploadOpen(true);
  }

  function handleFile(f: File) {
    setFile(f);
    const stem = f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
    setWeekTitle((prev) =>
      prev === `Week ${nextWeekNum}: ` || prev.trim() === `Week ${nextWeekNum}:`
        ? `Week ${nextWeekNum}: ${stem}`
        : prev
    );
  }

  async function handleProcess() {
    if (!file) return;
    setError("");

    try {
      setStage("extracting");
      const text = await extractTextFromPdf(file);

      setStage("generating");
      const content = await generateModuleFromText(text);
      setGeneratedContent(content);
      setStage("done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Failed to process file: ${msg}`);
      setStage("error");
    }
  }

  function handleDone() {
    if (!generatedContent) return;
    const title = weekTitle.trim() || generatedContent.title || `Week ${nextWeekNum}`;
    onModuleUploaded(title, generatedContent);
    setUploadOpen(false);
    setStage("idle");
    setFile(null);
    setWeekTitle("");
    setGeneratedContent(null);
  }

  const canProcess = !!file && stage === "idle";
  const isProcessing = stage === "extracting" || stage === "generating";

  return (
    <div className="min-h-screen" style={{ background: "#F4EFE6", fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(156,132,102,0.12)", position: "sticky", top: 0, zIndex: 30 }}>
        <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#C8873A" }}>
              <BookOpen size={14} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 700, color: "#2D2820" }}>LearnPath</span>
          </div>
          <button onClick={openUpload} className="flex items-center gap-2 px-4 py-2 rounded-xl hover:opacity-80 transition"
            style={{ fontSize: "13px", fontWeight: 500, background: "#C8873A", color: "#fff" }}>
            <Plus size={15} /> Upload Content
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="mb-10">
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72", letterSpacing: "0.12em" }} className="uppercase mb-3">
            Your Study Library
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: 700, color: "#2D2820" }} className="mb-2">
            Weekly Learning Modules
          </h1>
          <p style={{ fontSize: "14px", color: "#7A7068", maxWidth: "500px", lineHeight: 1.7 }}>
            Upload any PDF -- lecture slides, readings, or notes -- and LearnPath builds an interactive study module with flashcards, quizzes, and a spaced review schedule. All processing happens locally in your browser.
          </p>
        </div>

        {/* Module grid */}
        <div className="grid grid-cols-2 gap-5">
          {modules.map((mod) => (
            <div key={mod.id} style={{ ...card, opacity: mod.status === "locked" ? 0.5 : 1, cursor: mod.status === "locked" ? "not-allowed" : "pointer" }}
              className="p-6 hover:shadow-md transition-shadow group"
              onClick={() => mod.status !== "locked" && onOpenModule(mod.id)}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72", letterSpacing: "0.1em" }} className="uppercase mb-1">
                    Week {mod.week}
                  </div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: "#2D2820", lineHeight: 1.35 }}>
                    {mod.title}
                  </h2>
                </div>
                <div className="flex-shrink-0 ml-4 mt-0.5">
                  {mod.status === "complete" ? <CheckCircle2 size={20} color="#7A9A6A" /> :
                   mod.status === "locked" ? <Lock size={18} color="#C5BDB4" /> :
                   <div className="w-5 h-5 rounded-full border-2" style={{ borderColor: "#C8873A" }} />}
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "#7A7068", lineHeight: 1.65 }} className="mb-4">{mod.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {mod.tags.map((tag) => (
                  <span key={tag} style={{ fontSize: "11px", color: "#7A6448", background: "rgba(200,135,58,0.1)", padding: "2px 8px", borderRadius: "6px" }}>{tag}</span>
                ))}
              </div>
              {mod.status !== "locked" && (
                <div className="mb-4">
                  <div className="flex justify-between mb-1.5">
                    <span style={{ fontSize: "11px", color: "#8A7F72" }}>Progress</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#8A7F72" }}>{mod.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(156,132,102,0.15)" }}>
                    <div className="h-full rounded-full" style={{ width: `${mod.progress}%`, background: "#C8873A" }} />
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5" style={{ fontSize: "12px", color: "#8A7F72" }}>
                    <BookOpen size={12} color="#8A7F72" /> {mod.topics} sections
                  </span>
                  <span className="flex items-center gap-1.5" style={{ fontSize: "12px", color: "#8A7F72" }}>
                    <Brain size={12} color="#8A7F72" /> {mod.flashcards} flashcards
                  </span>
                </div>
                {mod.status !== "locked" && (
                  <span className="flex items-center gap-1" style={{ fontSize: "12px", fontWeight: 500, color: "#C8873A" }}>
                    {mod.status === "complete" ? "Review" : "Open"} <ChevronRight size={14} />
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Upload card */}
          <div onClick={openUpload} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl cursor-pointer transition-all"
            style={{ border: "2px dashed rgba(156,132,102,0.25)", minHeight: "200px" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(200,135,58,0.1)" }}>
              <Plus size={20} color="#C8873A" />
            </div>
            <div className="text-center">
              <div style={{ fontSize: "14px", fontWeight: 500, color: "#2D2820" }}>Upload Week {nextWeekNum}</div>
              <div style={{ fontSize: "12px", color: "#8A7F72", marginTop: "2px" }}>PDF, DOCX, TXT</div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(45,40,32,0.45)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-lg relative" style={{ ...card, borderRadius: "20px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="p-6">
              <button onClick={() => { setUploadOpen(false); setStage("idle"); setFile(null); setError(""); }}
                className="absolute top-4 right-4 hover:opacity-60 transition" style={{ color: "#8A7F72" }}>
                <X size={18} />
              </button>

              {/* ── Idle / Error ── */}
              {(stage === "idle" || stage === "error") && (
                <>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#2D2820" }} className="mb-1">
                    Upload Content
                  </h2>
                  <p style={{ fontSize: "13px", color: "#8A7F72" }} className="mb-5">
                    Your PDF will be processed locally to extract sections, flashcards, and quiz questions. No data leaves your browser.
                  </p>

                  {/* Week title */}
                  <label style={{ fontSize: "12px", fontWeight: 500, color: "#5C5249" }} className="block mb-1">Week / Topic title</label>
                  <input value={weekTitle} onChange={(e) => setWeekTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl outline-none mb-4"
                    style={{ fontSize: "14px", background: "#F8F4EE", border: "1px solid rgba(156,132,102,0.18)", color: "#2D2820" }}
                    placeholder="e.g. Week 2: Memory Consolidation" />

                  {/* Drop zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => fileRef.current?.click()}
                    className="flex flex-col items-center gap-3 py-8 rounded-2xl cursor-pointer mb-4 transition-all"
                    style={{ border: `2px dashed ${dragOver ? "#C8873A" : "rgba(156,132,102,0.25)"}`, background: dragOver ? "rgba(200,135,58,0.04)" : "#F8F4EE" }}>
                    <Upload size={20} color={file ? "#C8873A" : "#9C8466"} />
                    {file ? (
                      <div className="text-center">
                        <div style={{ fontSize: "13px", fontWeight: 500, color: "#2D2820" }}>{file.name}</div>
                        <div style={{ fontSize: "11px", color: "#8A7F72" }}>{(file.size / 1024).toFixed(0)} KB — click to change</div>
                      </div>
                    ) : (
                      <span style={{ fontSize: "13px", color: "#8A7F72" }}>Drop your PDF here, or click to browse</span>
                    )}
                    <input ref={fileRef} type="file" accept=".pdf,.txt,.docx" className="hidden"
                      onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
                  </div>

                  {file && (
                    <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl" style={{ background: "rgba(200,135,58,0.07)", border: "1px solid rgba(200,135,58,0.15)" }}>
                      <FileText size={14} color="#C8873A" />
                      <span style={{ fontSize: "12px", color: "#2D2820" }} className="flex-1 truncate">{file.name}</span>
                      <button onClick={() => setFile(null)} style={{ color: "#8A7F72" }}><X size={12} /></button>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-start gap-2 mb-4 px-3 py-3 rounded-xl" style={{ background: "rgba(181,80,58,0.07)", border: "1px solid rgba(181,80,58,0.2)" }}>
                      <AlertCircle size={14} color="#B5503A" className="flex-shrink-0 mt-0.5" />
                      <span style={{ fontSize: "12px", color: "#B5503A", lineHeight: 1.5 }}>{error}</span>
                    </div>
                  )}

                  <button onClick={handleProcess} disabled={!canProcess}
                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition"
                    style={{ fontSize: "13px", fontWeight: 500, background: canProcess ? "#C8873A" : "rgba(156,132,102,0.15)", color: canProcess ? "#fff" : "#8A7F72", cursor: canProcess ? "pointer" : "not-allowed" }}>
                    Generate Learning Module <ArrowRight size={15} />
                  </button>
                </>
              )}

              {/* ── Processing ── */}
              {isProcessing && (
                <div className="flex flex-col items-center gap-5 py-8">
                  <Loader2 size={32} color="#C8873A" className="animate-spin" />
                  <div className="text-center">
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 600, color: "#2D2820" }}>
                      {STAGES[stage]}
                    </div>
                    <div style={{ fontSize: "12px", color: "#8A7F72", marginTop: "6px" }}>
                      {stage === "extracting" ? `Reading ${file?.name}` : "Processing your content..."}
                    </div>
                  </div>
                  <div className="w-full flex flex-col gap-2 mt-2">
                    {[
                      { key: "extracting", label: "Extract text from PDF" },
                      { key: "generating", label: "Build sections, flashcards & quiz" },
                      { key: "done", label: "Build spaced review schedule" },
                    ].map((s, i) => {
                      const stageOrder = ["extracting", "generating", "done"];
                      const current = stageOrder.indexOf(stage);
                      const stepIdx = stageOrder.indexOf(s.key);
                      const done = stepIdx < current;
                      const active = stepIdx === current;
                      return (
                        <div key={s.key} className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{ background: active ? "rgba(200,135,58,0.07)" : "#F8F4EE", border: `1px solid ${active ? "rgba(200,135,58,0.2)" : "rgba(156,132,102,0.1)"}`, opacity: stepIdx > current ? 0.4 : 1 }}>
                          <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: done ? "#7A9A6A" : active ? "#C8873A" : "#EDE7DC" }}>
                            {done ? <CheckCircle2 size={10} color="#fff" /> : active ? <Loader2 size={9} color="#fff" className="animate-spin" /> : <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#C5BDB4" }} />}
                          </div>
                          <span style={{ fontSize: "12px", color: active ? "#2D2820" : "#8A7F72", fontWeight: active ? 500 : 400 }}>{s.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Done ── */}
              {stage === "done" && generatedContent && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(122,154,106,0.12)" }}>
                      <CheckCircle2 size={24} color="#7A9A6A" />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#2D2820" }}>Module ready</div>
                      <div style={{ fontSize: "13px", color: "#8A7F72", marginTop: "2px" }}>{generatedContent.title}</div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="rounded-xl p-4" style={{ background: "#F8F4EE", border: "1px solid rgba(156,132,102,0.12)" }}>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "#5C5249", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Generated</div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { label: "Sections", value: generatedContent.sections.length },
                        { label: "Flashcards", value: generatedContent.sections.reduce((a, s) => a + s.flashcards.length, 0) },
                        { label: "Quiz Qs", value: generatedContent.sections.reduce((a, s) => a + s.quiz.length, 0) },
                      ].map((s) => (
                        <div key={s.label} className="text-center py-2 rounded-lg" style={{ background: "#FFFFFF" }}>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, color: "#C8873A" }}>{s.value}</div>
                          <div style={{ fontSize: "11px", color: "#8A7F72" }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-1">
                      {generatedContent.sections.map((s) => (
                        <div key={s.id} className="flex items-center gap-2 px-2 py-1">
                          <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: "#C8873A" }} />
                          <span style={{ fontSize: "12px", color: "#5C5249" }}>{s.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={handleDone} className="w-full py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-80 transition"
                    style={{ fontSize: "13px", fontWeight: 500, background: "#C8873A", color: "#fff" }}>
                    Open Module <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
