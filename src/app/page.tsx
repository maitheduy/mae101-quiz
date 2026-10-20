'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { questions } from "@/lib/quiz-data";
import { grade, buildExportHtml, AnswerRecord } from "@/lib/quiz-grader";

const STORAGE_KEY = "mae101_state_v2";

interface SavedAnswer {
  answer: string;
  score: number;
  rawScore: number;
  matchedDescriptions: string[];
  missedDescriptions: string[];
}

interface SavedState {
  answers: (SavedAnswer | null)[];
  total: number;
  current: number;
}

// Inject MathJax once
function useMathJax() {
  useEffect(() => {
    if (!(window as any).MathJax) {
      (window as any).MathJax = {
        tex: { inlineMath: [["\\(", "\\)"]], displayMath: [["\\[", "\\]"], ["$$", "$$"]] },
        svg: { fontCache: "global" },
        startup: {
          typeset: false,
          ready: () => {
            (window as any).MathJax.startup.defaultReady?.();
          },
        },
      };
    }
    if (!document.getElementById("mathjax-script")) {
      const s = document.createElement("script");
      s.id = "mathjax-script";
      s.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
      s.async = true;
      document.head.appendChild(s);
    }
  }, []);
}

// Wait until MathJax is fully loaded, then typeset the given element.
const typeset = async (el: HTMLElement | null) => {
  if (!el) return;
  // Wait for MathJax to be loaded and ready (up to ~10s)
  const w = window as any;
  let tries = 0;
  while ((!w.MathJax || !w.MathJax.typesetPromise) && tries < 100) {
    await new Promise((r) => setTimeout(r, 100));
    tries++;
  }
  if (w.MathJax?.typesetPromise) {
    try {
      await w.MathJax.typesetPromise([el]);
    } catch {}
  }
};

export default function Home() {
  useMathJax();
  const [answers, setAnswers] = useState<(SavedAnswer | null)[]>(() =>
    questions.map(() => null)
  );
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [editorText, setEditorText] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [view, setView] = useState<"quiz" | "final">("quiz");
  const [savedLoaded, setSavedLoaded] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const renderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const s: SavedState = JSON.parse(saved);
        if (Array.isArray(s.answers) && s.answers.length === questions.length) {
          setAnswers(s.answers);
          setTotal(s.total);
          setCurrent(s.current);
        }
      }
    } catch {}
    setSavedLoaded(true);
  }, []);

  // Auto-save
  useEffect(() => {
    if (!savedLoaded) return;
    const s: SavedState = { answers, total, current };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {}
  }, [answers, total, current, savedLoaded]);

  const currentQ = questions[current];
  const currentAnswer = answers[current];
  const isAnswered = !!currentAnswer;

  // Load editor text when question changes
  useEffect(() => {
    setEditorText(currentAnswer?.answer ?? "");
    setShowHint(false);
  }, [current, currentAnswer?.answer]);

  // Render preview with MathJax
  useEffect(() => {
    if (renderTimer.current) clearTimeout(renderTimer.current);
    renderTimer.current = setTimeout(() => {
      if (previewRef.current) {
        if (!editorText.trim()) {
          previewRef.current.innerHTML = "";
        } else {
          previewRef.current.textContent = editorText;
        }
        typeset(previewRef.current);
      }
    }, 200);
  }, [editorText]);

  // Re-typeset question card on question change
  useEffect(() => {
    typeset(cardRef.current);
  }, [current, showHint]);

  // Re-typeset preview after submit (feedback has math)
  useEffect(() => {
    if (isAnswered) typeset(cardRef.current);
  }, [isAnswered, total]);

  const goNext = useCallback(() => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setView("final");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [current]);

  const goPrev = useCallback(() => {
    if (current > 0) {
      setCurrent(current - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [current]);

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAnswers(questions.map(() => null));
    setTotal(0);
    setCurrent(0);
    setEditorText("");
    setView("quiz");
    setShowResetDialog(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = useCallback(() => {
    if (!editorText.trim() || isAnswered) return;
    const result = grade(editorText, currentQ);
    const newAnswer: SavedAnswer = {
      answer: editorText,
      score: result.score,
      rawScore: result.rawScore,
      matchedDescriptions: result.matched.map((m) => m.item.description),
      missedDescriptions: result.missed.map((m) => m.item.description),
    };
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = newAnswer;
      return next;
    });
    const newTotal = total - (currentAnswer?.score ?? 0) + result.score;
    setTotal(Math.round(newTotal * 10) / 10);
  }, [editorText, isAnswered, currentQ, current, total, currentAnswer]);

  // Keyboard shortcuts: Ctrl/Cmd+Enter = submit, Alt+N = next, Alt+P = prev
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.altKey && e.key.toLowerCase() === "n" && isAnswered) {
        e.preventDefault();
        goNext();
      } else if (e.altKey && e.key.toLowerCase() === "p" && current > 0) {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSubmit, goNext, goPrev, isAnswered, current]);

  const handleExport = () => {
    const records: AnswerRecord[] = questions.map((q, i) => {
      const a = answers[i];
      if (!a) {
        return {
          questionId: q.id,
          questionTitle: q.title,
          answer: "(Không có lời giải)",
          score: 0,
          rawScore: 0,
          matched: [],
          missed: q.rubric.map((item) => ({ item, matched: false })),
        };
      }
      const result = grade(a.answer, q);
      return {
        questionId: q.id,
        questionTitle: q.title,
        answer: a.answer,
        score: a.score,
        rawScore: a.rawScore,
        matched: result.matched,
        missed: result.missed,
      };
    });
    const html = buildExportHtml(records, total);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MAE101_KetQua_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const progressPct = ((current + 1) / questions.length) * 100;
  const answeredCount = answers.filter(Boolean).length;

  // --- Final view ---
  if (view === "final") {
    return <FinalView total={total} answers={answers} onRestart={handleReset} onExport={handleExport} onReview={(i) => { setCurrent(i); setView("quiz"); window.scrollTo({top:0}); }} />;
  }

  // --- Quiz view ---
  return (
    <div style={S.page}>
      <div style={S.topbar}>
        <div style={S.topline}>
          <div>
            <div style={S.small}>MAE101 — Calculus &amp; Linear Algebra</div>
            <strong style={S.counter}>Câu {current + 1} / {questions.length}</strong>
            <span style={{...S.small, marginLeft:12, opacity:.7}}>· Đã trả lời {answeredCount}/{questions.length}</span>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:14}}>
            <div style={S.score}>Điểm: <span style={{color:"#22d3ee"}}>{total.toFixed(1)}</span> / {questions.length}</div>
            <button style={S.resetBtn} onClick={() => setShowResetDialog(true)}>↺ Làm lại</button>
          </div>
        </div>
        <div style={S.progressWrap}>
          <div style={{...S.progress, width: `${progressPct}%`}} />
        </div>
      </div>

      <div ref={cardRef} style={S.questionCard}>
        <h2 style={S.h2}>{currentQ.title}</h2>
        <div style={S.problem} dangerouslySetInnerHTML={{ __html: currentQ.problem }} />
      </div>

      <div style={S.editorCard}>
        <div style={S.label}>
          <b>Lời giải Câu {current + 1} của bạn</b>
          <button style={S.hintBtn} onClick={() => setShowHint((s) => !s)}>
            {showHint ? "Ẩn gợi ý" : "💡 Gợi ý tư duy"}
          </button>
        </div>

        {showHint && (
          <div style={S.hintBox} dangerouslySetInnerHTML={{ __html: currentQ.hint }} />
        )}

        <textarea
          ref={editorRef}
          style={S.textarea}
          value={editorText}
          onChange={(e) => setEditorText(e.target.value)}
          disabled={isAnswered}
          placeholder={`Viết lời giải của bạn ở đây...\n\nBạn có thể viết văn bản bình thường và chèn LaTeX trực tiếp.\n\nVí dụ:\nTa có đạo hàm 2x + (y + xy') + 2y·y' = 0\n\n\\[ y' = \\frac{-4}{5} \\]\n\nSau đó suy ra tiếp tuyến...`}
        />

        <div style={S.help}>
          💡 Viết chữ bình thường. Khi cần công thức, dùng <code style={S.codeInline}>\[ ... \]</code> cho công thức riêng dòng hoặc <code style={S.codeInline}>\(...\)</code> cho công thức trong dòng.
          <br />
          ⌨️ Phím tắt: <code style={S.codeInline}>Ctrl/Cmd + Enter</code> = Nộp · <code style={S.codeInline}>Alt + →</code> Câu sau · <code style={S.codeInline}>Alt + ←</code> Câu trước
        </div>

        <div style={S.label}><b>Xem trước lời giải</b></div>
        <div ref={previewRef} style={editorText.trim() ? S.preview : S.previewEmpty}>
          {!editorText.trim() && "Bài giải đẹp sẽ xuất hiện ở đây..."}
        </div>

        <div style={S.actions}>
          <span style={S.small}>Mỗi câu tối đa 1 điểm · Tổng {questions.length} điểm</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{...S.btnGhost, opacity: current === 0 ? 0.4 : 1}} disabled={current === 0} onClick={goPrev}>← Câu trước</button>
            <button
              style={isAnswered ? S.btnDisabled : S.btnPrimary}
              disabled={isAnswered || !editorText.trim()}
              onClick={handleSubmit}
            >
              {isAnswered ? "✓ Đã nộp bài" : `Nộp Câu ${current + 1}`}
            </button>
          </div>
        </div>

        {isAnswered && currentAnswer && (
          <FeedbackBlock saved={currentAnswer} />
        )}

        {isAnswered && (
          <div style={{...S.actions, marginTop: 18, justifyContent: "flex-end"}}>
            <button style={S.btnNext} onClick={goNext}>
              {current === questions.length - 1 ? "🎉 Xem kết quả cuối cùng" : `Sang Câu ${current + 2} →`}
            </button>
          </div>
        )}
      </div>

      {showResetDialog && (
        <div style={S.dialogOverlay} onClick={() => setShowResetDialog(false)}>
          <div style={S.dialog} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Xóa toàn bộ tiến trình?</h3>
            <p style={{ lineHeight: 1.6, color: "#ccc" }}>
              Toàn bộ lời giải và điểm số của 10 câu sẽ bị xoá khỏi trình duyệt. Hành động này không thể hoàn tác.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <button style={S.btnGhost} onClick={() => setShowResetDialog(false)}>Huỷ</button>
              <button style={S.btnDanger} onClick={handleReset}>Có, xoá hết</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------- Feedback Block --------------------
function FeedbackBlock({ saved }: { saved: SavedAnswer }) {
  return (
    <div style={S.feedback}>
      <div style={S.points}>
        {saved.score.toFixed(1)} / 1.0 điểm
      </div>
      <p style={{ marginTop: 12, marginBottom: 6 }}><b>✅ Những điểm đã nhận diện:</b></p>
      <ul style={{ marginTop: 0, paddingLeft: 22 }}>
        {saved.matchedDescriptions.length === 0 ? (
          <li style={{ color: "#888" }}>Chưa nhận diện được bước chính.</li>
        ) : (
          saved.matchedDescriptions.map((d, i) => (
            <li key={i} style={{ color: "#22c55e" }} dangerouslySetInnerHTML={{ __html: "✓ " + d }} />
          ))
        )}
      </ul>
      <p style={{ marginTop: 10, marginBottom: 6 }}><b>⭕ Những điểm cần cải thiện:</b></p>
      <ul style={{ marginTop: 0, paddingLeft: 22 }}>
        {saved.missedDescriptions.length === 0 ? (
          <li style={{ color: "#888" }}>Đã đủ các tiêu chí sơ bộ 🎉</li>
        ) : (
          saved.missedDescriptions.map((d, i) => (
            <li key={i} style={{ color: "#ef4444" }} dangerouslySetInnerHTML={{ __html: "○ " + d }} />
          ))
        )}
      </ul>
      <p style={{ ...S.small, marginTop: 14, paddingTop: 10, borderTop: "1px solid #333" }}>
        Lưu ý: Đây là chấm tự động sơ bộ theo các bước/biểu thức trọng tâm. Khi cần đánh giá lập luận toán học tinh tế, hãy gửi bài làm cho giảng viên để chấm chi tiết.
      </p>
    </div>
  );
}

// -------------------- Final View --------------------
function FinalView({
  total,
  answers,
  onRestart,
  onExport,
  onReview,
}: {
  total: number;
  answers: (SavedAnswer | null)[];
  onRestart: () => void;
  onExport: () => void;
  onReview: (i: number) => void;
}) {
  const max = questions.length;
  const pct = (total / max) * 100;
  const comment =
    total >= 9 ? "🌟 Rất tốt — nắm chắc các dạng xương sống."
    : total >= 7 ? "👍 Khá tốt — nên xem lại các bước còn thiếu."
    : total >= 5 ? "📚 Đạt mức cơ bản — cần luyện thêm lời giải từng bước."
    : "🔁 Nên làm lại bộ 10 câu và tập trung vào phương pháp.";

  // SVG ring
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const dash = (pct / 100) * circ;

  return (
    <div style={S.page}>
      <div style={{...S.final, textAlign: "center"}}>
        <div style={{...S.small, marginBottom: 8}}>Hoàn thành {max} câu</div>
        <h2 style={{...S.h2, marginBottom: 18}}>Kết quả bài làm 🎉</h2>

        <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r={radius} fill="none" stroke="#252525" strokeWidth="12" />
            <circle
              cx="90" cy="90" r={radius} fill="none" stroke="url(#g)" strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              transform="rotate(-90 90 90)"
              style={{ transition: "stroke-dasharray 1.2s ease" }}
            />
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4facfe" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <text x="90" y="95" textAnchor="middle" fontSize="32" fontWeight="800" fill="#4facfe">
              {total.toFixed(1)}
            </text>
            <text x="90" y="118" textAnchor="middle" fontSize="14" fill="#888">
              / {max}
            </text>
          </svg>
        </div>

        <div style={{ color: "#ccc", fontSize: 16, margin: "8px 0 20px" }}>{comment}</div>

        {/* Per-question bars */}
        <div style={{ textAlign: "left", marginTop: 24, padding: "0 8px" }}>
          <div style={{ ...S.small, marginBottom: 10, textAlign: "center" }}>Điểm từng câu</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 520, margin: "0 auto" }}>
            {answers.map((a, i) => (
              <button key={i} style={S.barRow} onClick={() => onReview(i)}>
                <span style={{ ...S.barLabel }}>C{i + 1}</span>
                <div style={S.barTrack}>
                  <div style={{ ...S.barFill, width: `${((a?.score ?? 0) * 100).toFixed(0)}%` }} />
                </div>
                <span style={{ ...S.barScore, color: a ? "#4facfe" : "#666" }}>
                  {(a?.score ?? 0).toFixed(1)}
                </span>
              </button>
            ))}
          </div>
          <div style={{ ...S.small, textAlign: "center", marginTop: 12 }}>
            Nhấp vào câu để xem lại lời giải và feedback
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
          <button style={S.btnPrimary} onClick={onRestart}>Làm lại từ đầu</button>
          <button style={S.btnExport} onClick={onExport}>📥 Tải kết quả chi tiết (.html)</button>
        </div>
      </div>
    </div>
  );
}

// -------------------- Styles --------------------
const S: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1050,
    margin: "0 auto",
    padding: "30px 28px 80px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    color: "#f2f2f2",
  },
  topbar: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "rgba(11,11,11,.96)",
    borderBottom: "1px solid #292929",
    padding: "15px 0",
    marginBottom: 28,
    backdropFilter: "blur(8px)",
  },
  topline: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap",
  },
  small: { color: "#999", fontSize: 13 },
  counter: { fontSize: 16, color: "#f2f2f2" },
  score: { fontSize: 18, fontWeight: 700, color: "#4facfe" },
  resetBtn: {
    border: "1px solid #444",
    borderRadius: 8,
    padding: "8px 14px",
    background: "#1a1a1a",
    color: "#ddd",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  progressWrap: {
    marginTop: 12,
    height: 8,
    background: "#252525",
    borderRadius: 20,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    background: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
    transition: "width .4s ease",
  },
  questionCard: {
    border: "1px solid #333",
    borderRadius: 16,
    background: "#111",
    padding: 24,
    marginBottom: 20,
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
  },
  h2: { margin: "0 0 18px", fontSize: 24, color: "#fff" },
  problem: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: 18,
    lineHeight: 1.75,
  },
  editorCard: {
    border: "1px solid #333",
    borderRadius: 16,
    background: "#111",
    padding: 24,
    marginBottom: 20,
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
  },
  label: {
    color: "#aaa",
    fontSize: 14,
    margin: "18px 0 9px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hintBtn: {
    border: "1px solid rgba(255,215,0,.27)",
    borderRadius: 10,
    padding: "8px 14px",
    background: "#2a2a1a",
    color: "#ffd700",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  hintBox: {
    marginTop: 12,
    padding: "15px 20px",
    borderRadius: 11,
    background: "#1a1a00",
    border: "1px solid rgba(255,215,0,.27)",
    color: "#ffe566",
    fontSize: 15,
    lineHeight: 1.6,
    animation: "fadeIn .3s ease",
  },
  textarea: {
    width: "100%",
    minHeight: 280,
    resize: "vertical" as const,
    borderRadius: 11,
    border: "1px solid #555",
    background: "#080808",
    color: "#f5f5f5",
    padding: 17,
    fontSize: 16,
    lineHeight: 1.65,
    fontFamily: 'Georgia, "Times New Roman", serif',
    outline: "none",
    transition: "border-color 0.3s",
  },
  help: {
    marginTop: 10,
    color: "#888",
    fontSize: 13,
    lineHeight: 1.7,
  },
  codeInline: {
    background: "#202020",
    borderRadius: 4,
    padding: "2px 6px",
    color: "#4facfe",
    fontSize: 12,
  },
  previewEmpty: {
    minHeight: 180,
    marginTop: 10,
    padding: 25,
    borderRadius: 11,
    background: "#080808",
    color: "#888",
    border: "1px solid #555",
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 1.8,
    overflowX: "auto",
  },
  preview: {
    minHeight: 180,
    marginTop: 10,
    padding: 25,
    borderRadius: 11,
    background: "#080808",
    color: "#f5f5f5",
    border: "1px solid #555",
    fontSize: 17,
    lineHeight: 1.8,
    overflowX: "auto",
    whiteSpace: "pre-wrap" as const,
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    gap: 12,
    flexWrap: "wrap",
  },
  btnPrimary: {
    border: "none",
    borderRadius: 10,
    padding: "12px 24px",
    background: "#4facfe",
    color: "#000",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    transition: "all .2s",
  },
  btnDisabled: {
    border: "1px solid #333",
    borderRadius: 10,
    padding: "12px 24px",
    background: "#1a1a1a",
    color: "#666",
    fontWeight: 700,
    fontSize: 15,
    cursor: "not-allowed",
  },
  btnGhost: {
    border: "1px solid #444",
    borderRadius: 10,
    padding: "12px 18px",
    background: "#1a1a1a",
    color: "#ddd",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  btnDanger: {
    border: "none",
    borderRadius: 10,
    padding: "12px 18px",
    background: "#dc2626",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  btnNext: {
    border: "none",
    borderRadius: 10,
    padding: "12px 26px",
    background: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
    color: "#000",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },
  btnExport: {
    border: "none",
    borderRadius: 10,
    padding: "12px 22px",
    background: "#22c55e",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  feedback: {
    marginTop: 18,
    padding: 18,
    borderRadius: 11,
    border: "1px solid #444",
    background: "#181818",
    lineHeight: 1.65,
  },
  points: {
    fontSize: 22,
    fontWeight: 800,
    color: "#4facfe",
  },
  final: {
    border: "1px solid #444",
    borderRadius: 16,
    background: "#111",
    padding: "35px 25px",
  },
  barRow: {
    display: "grid",
    gridTemplateColumns: "44px 1fr 48px",
    alignItems: "center",
    gap: 10,
    background: "transparent",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    padding: "6px 10px",
    cursor: "pointer",
    color: "#eee",
    fontSize: 13,
  },
  barLabel: { fontWeight: 600, color: "#888", textAlign: "left" },
  barTrack: { height: 8, background: "#252525", borderRadius: 4, overflow: "hidden" },
  barFill: {
    height: "100%",
    background: "linear-gradient(90deg, #4facfe 0%, #22d3ee 100%)",
    transition: "width .8s ease",
  },
  barScore: { fontWeight: 700, textAlign: "right" },
  dialogOverlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,.7)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  dialog: {
    background: "#181818",
    border: "1px solid #444",
    borderRadius: 14,
    padding: 24,
    maxWidth: 440,
    width: "100%",
  },
};
