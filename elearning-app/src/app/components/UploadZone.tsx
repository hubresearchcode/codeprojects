import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, Loader2, Sparkles, X, ArrowRight } from "lucide-react";

interface UploadZoneProps {
  onUploadComplete: (weekTitle: string) => void;
}

type UploadStage = "idle" | "uploading" | "extracting" | "generating" | "complete";

const processingSteps = [
  { stage: "uploading" as UploadStage, label: "Uploading content...", sub: "Securely transferring your files" },
  { stage: "extracting" as UploadStage, label: "Extracting key concepts...", sub: "Identifying topics, definitions, and relationships" },
  { stage: "generating" as UploadStage, label: "Building learning pathway...", sub: "Applying retrieval, spacing & elaboration techniques" },
];

const generatedElements = [
  { icon: "🧠", label: "18 Flashcards", desc: "Key terms & relationships for retrieval practice" },
  { icon: "✍️", label: "6 Elaboration prompts", desc: "Why/how questions to deepen understanding" },
  { icon: "🗓️", label: "Spaced review schedule", desc: "8 sessions across 4 weeks, optimally spaced" },
  { icon: "🔀", label: "Interleaving plan", desc: "Mixed practice with Week 2 when uploaded" },
  { icon: "📊", label: "4 Self-test quizzes", desc: "MCQs & short-answer for closed-book testing" },
  { icon: "🗺️", label: "Concept map", desc: "Visual dual-coding of the content structure" },
];

const card: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: "16px",
  border: "1px solid rgba(156,132,102,0.14)",
  boxShadow: "0 1px 4px rgba(100,80,60,0.06)",
};

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [stage, setStage] = useState<UploadStage>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);
  const [weekTitle, setWeekTitle] = useState("Week 2: Cognitive Load & Memory Consolidation");
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  function handleFiles(fileList: FileList) {
    setFiles(Array.from(fileList).map((f) => ({ name: f.name, size: formatSize(f.size) })));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function startProcessing() {
    if (!weekTitle.trim()) return;
    setStage("uploading");
    setCurrentStep(0);
    setTimeout(() => { setStage("extracting"); setCurrentStep(1); }, 1400);
    setTimeout(() => { setStage("generating"); setCurrentStep(2); }, 3000);
    setTimeout(() => setStage("complete"), 5000);
  }

  const progressPercent = stage === "uploading" ? 30 : stage === "extracting" ? 60 : stage === "generating" ? 85 : stage === "complete" ? 100 : 0;

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ fontFamily: "'Inter', sans-serif", background: "#F4EFE6" }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "#8A7F72", letterSpacing: "0.12em" }} className="uppercase mb-2">
            Content Upload
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 700, color: "#2D2820" }} className="mb-2">
            Upload Weekly Content
          </h1>
          <p style={{ fontSize: "14px", color: "#7A7068" }}>
            Upload your lecture slides, readings, or notes. LearnPath will generate an evidence-based interactive pathway in seconds.
          </p>
        </div>

        {stage === "idle" && (
          <div className="flex flex-col gap-5">
            <div>
              <label style={{ fontSize: "13px", fontWeight: 500, color: "#2D2820" }} className="block mb-2">
                Week / Topic Title
              </label>
              <input
                type="text"
                value={weekTitle}
                onChange={(e) => setWeekTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                style={{ fontSize: "14px", background: "#FFFFFF", border: "1px solid rgba(156,132,102,0.2)", color: "#2D2820" }}
                placeholder="e.g. Week 2: Memory Consolidation"
              />
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all"
              style={{
                border: dragOver ? "2px dashed #C8873A" : "2px dashed rgba(156,132,102,0.3)",
                background: dragOver ? "rgba(200,135,58,0.05)" : "#FFFFFF",
              }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: dragOver ? "rgba(200,135,58,0.12)" : "#F4EFE6" }}>
                <Upload size={22} color={dragOver ? "#C8873A" : "#9C8466"} />
              </div>
              <div className="text-center">
                <div style={{ fontSize: "15px", fontWeight: 500, color: "#2D2820" }} className="mb-1">
                  Drop files here or click to browse
                </div>
                <div style={{ fontSize: "13px", color: "#8A7F72" }}>
                  PDF, DOCX, PPTX, TXT · Up to 50MB per file
                </div>
              </div>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.pptx,.txt" className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)} />
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="flex flex-col gap-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "#FFFFFF", border: "1px solid rgba(156,132,102,0.14)" }}>
                    <FileText size={16} color="#C8873A" className="flex-shrink-0" />
                    <span style={{ fontSize: "13px", color: "#2D2820" }} className="flex-1 truncate">{file.name}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#8A7F72" }}>{file.size}</span>
                    <button onClick={() => setFiles(files.filter((_, j) => j !== i))} style={{ color: "#8A7F72" }} className="hover:opacity-60">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* What gets generated */}
            <div style={card} className="p-5">
              <div style={{ fontSize: "13px", fontWeight: 500, color: "#2D2820" }} className="mb-3 flex items-center gap-2">
                <Sparkles size={14} color="#C8873A" /> What LearnPath generates from your content
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {generatedElements.map((el, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl" style={{ background: "#F8F4EE" }}>
                    <span className="text-base leading-none mt-0.5">{el.icon}</span>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 500, color: "#2D2820" }}>{el.label}</div>
                      <div style={{ fontSize: "11px", color: "#8A7F72" }}>{el.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={startProcessing}
              disabled={files.length === 0 || !weekTitle.trim()}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all"
              style={{
                fontSize: "14px", fontWeight: 500,
                background: files.length > 0 && weekTitle.trim() ? "#C8873A" : "rgba(156,132,102,0.15)",
                color: files.length > 0 && weekTitle.trim() ? "#fff" : "#8A7F72",
                cursor: files.length > 0 && weekTitle.trim() ? "pointer" : "not-allowed",
              }}
            >
              Generate Learning Pathway <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Processing */}
        {(stage === "uploading" || stage === "extracting" || stage === "generating") && (
          <div className="flex flex-col items-center gap-8 py-12">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(200,135,58,0.1)" strokeWidth="6" />
                <circle cx="50" cy="50" r="44" fill="none" stroke="#C8873A" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - progressPercent / 100)}`}
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={24} color="#C8873A" className="animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 600, color: "#2D2820" }} className="mb-2">
                {processingSteps[currentStep]?.label}
              </div>
              <div style={{ fontSize: "13px", color: "#8A7F72" }}>{processingSteps[currentStep]?.sub}</div>
            </div>
            <div className="w-full flex flex-col gap-2">
              {processingSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all" style={{
                  background: i <= currentStep ? "rgba(200,135,58,0.06)" : "#FFFFFF",
                  border: `1px solid ${i === currentStep ? "rgba(200,135,58,0.35)" : "rgba(156,132,102,0.14)"}`,
                  opacity: i > currentStep ? 0.5 : 1,
                }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{
                    background: i < currentStep ? "#7A9A6A" : i === currentStep ? "#C8873A" : "#EDE7DC",
                  }}>
                    {i < currentStep ? <CheckCircle2 size={12} color="#fff" /> : i === currentStep ? <Loader2 size={10} color="#fff" className="animate-spin" /> : <div className="w-2 h-2 rounded-full" style={{ background: "#C5BDB4" }} />}
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: i <= currentStep ? 500 : 400, color: i <= currentStep ? "#2D2820" : "#8A7F72" }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete */}
        {stage === "complete" && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(122,154,106,0.15)" }}>
                <CheckCircle2 size={28} color="#7A9A6A" />
              </div>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: "#2D2820" }} className="mb-1">
                  Pathway Generated
                </div>
                <div style={{ fontSize: "13px", color: "#8A7F72" }}>"{weekTitle}" is ready to study</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {generatedElements.map((el, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: "#FFFFFF", border: "1px solid rgba(156,132,102,0.14)" }}>
                  <span className="text-lg leading-none mt-0.5">{el.icon}</span>
                  <div className="flex-1">
                    <div style={{ fontSize: "12px", fontWeight: 500, color: "#2D2820" }}>{el.label}</div>
                    <div style={{ fontSize: "11px", color: "#8A7F72" }} className="mt-0.5">{el.desc}</div>
                  </div>
                  <CheckCircle2 size={14} color="#7A9A6A" className="flex-shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
            <button
              onClick={() => onUploadComplete(weekTitle)}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl hover:opacity-90 transition-all"
              style={{ fontSize: "14px", fontWeight: 500, background: "#C8873A", color: "#fff" }}
            >
              Open Learning Pathway <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
