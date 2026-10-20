// Improved grader: normalizes user input before matching rubric patterns.
// Normalizations:
//  - lowercase
//  - replace Vietnamese decimal comma "1,5" → "1.5" inside numbers
//  - collapse multiple spaces
//  - replace unicode superscripts ²,³ with ^2, ^3 (and keep originals too)
//  - strip stray backslashes used in LaTeX when they appear in plain text
// Both raw and normalized forms are tested against each pattern.

import { RubricItem, Question } from "./quiz-data-types";

export function normalizeAnswer(raw: string): string {
  let s = raw.toLowerCase();

  // Vietnamese decimal separator: "1,5" → "1.5"  (only when between digits)
  s = s.replace(/(\d),(\d)/g, "$1.$2");

  // Vietnamese thousands:  "1 000" → "1000" (when between digits, single space)
  s = s.replace(/(\d)\s(\d{3})\b/g, "$1$2");

  // Unicode superscripts → caret form
  s = s.replace(/²/g, "^2").replace(/³/g, "^3").replace(/¹/g, "^1");

  // Convert common LaTeX \frac{a}{b} → a/b  (best-effort)
  s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1)/($2)");
  s = s.replace(/\\dfrac\{([^{}]+)\}\{([^{}]+)\}/g, "($1)/($2)");

  // Remove leftover backslashes from commands like \det, \cdot, \sqrt
  s = s.replace(/\\([a-zA-Z]+)/g, "$1");

  // · and × and ⋅ → *  (multiplication)
  s = s.replace(/[·×∙⋅∗]/g, "*");

  // Collapse whitespace
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

export interface RubricResult {
  item: RubricItem;
  matched: boolean;
  matchedPattern?: string;
}

export interface GradeResult {
  score: number;          // 0..1, rounded to 1 decimal
  rawScore: number;       // 0..1, before rounding
  matched: RubricResult[];
  missed: RubricResult[];
}

export function grade(answer: string, question: Question): GradeResult {
  const normalized = normalizeAnswer(answer);
  const matched: RubricResult[] = [];
  const missed: RubricResult[] = [];
  let rawScore = 0;

  for (const item of question.rubric) {
    let isMatched = false;
    let matchedPattern: string | undefined;

    for (const p of item.patterns) {
      try {
        const re = new RegExp(p, "i");
        if (re.test(answer) || re.test(normalized)) {
          isMatched = true;
          matchedPattern = p;
          break;
        }
      } catch {
        // bad regex — ignore
      }
    }

    if (isMatched) {
      matched.push({ item, matched: true, matchedPattern });
      rawScore += item.points;
    } else {
      missed.push({ item, matched: false });
    }
  }

  const score = Math.min(1, Math.round(rawScore * 10) / 10);

  return { score, rawScore, matched, missed };
}

// ---- Export helpers ---------------------------------------------------------

export interface AnswerRecord {
  questionId: number;
  questionTitle: string;
  answer: string;
  score: number;
  rawScore: number;
  matched: RubricResult[];
  missed: RubricResult[];
}

export function buildExportHtml(records: AnswerRecord[], total: number): string {
  const date = new Date().toLocaleString("vi-VN");
  const rows = records.map((r) => {
    const matchedList = r.matched
      .map((m) => `<li style="color:#22c55e">✓ ${m.item.description}</li>`)
      .join("");
    const missedList = r.missed
      .map((m) => `<li style="color:#ef4444">○ ${m.item.description}</li>`)
      .join("");
    return `
      <div class="q">
        <h3>${escapeHtml(r.questionTitle)}</h3>
        <div class="score">Điểm: ${r.score.toFixed(1)} / 1.0</div>
        <div class="ans-label">Lời giải của bạn:</div>
        <pre class="ans">${escapeHtml(r.answer)}</pre>
        <div class="rubric">
          <div><b>Đã đạt:</b><ul>${matchedList || "<li>—</li>"}</ul></div>
          <div><b>Cần cải thiện:</b><ul>${missedList || "<li>—</li>"}</ul></div>
        </div>
      </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>MAE101 — Kết quả bài làm</title>
<script>
window.MathJax = { tex: { inlineMath: [['\\\\(','\\\\)']], displayMath: [['\\\\[','\\\\]'], ['$$','$$']] }, svg: { fontCache: 'global' } };
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
<style>
body { background:#0b0b0b; color:#f2f2f2; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif; margin:0; padding:30px; }
.wrap { max-width:900px; margin:auto; }
h1 { color:#4facfe; }
.summary { background:#111; border:1px solid #333; border-radius:14px; padding:22px; margin:20px 0; text-align:center; }
.summary .big { font-size:42px; font-weight:800; color:#4facfe; }
.q { background:#111; border:1px solid #333; border-radius:14px; padding:22px; margin:18px 0; }
.q h3 { margin-top:0; color:#4facfe; }
.score { font-weight:700; color:#22c55e; margin-bottom:12px; }
.ans-label { color:#aaa; margin-bottom:6px; font-size:14px; }
.ans { background:#080808; border:1px solid #444; padding:14px; border-radius:8px; white-space:pre-wrap; word-wrap:break-word; font-family:Georgia,serif; line-height:1.6; }
.rubric { margin-top:14px; display:flex; gap:30px; flex-wrap:wrap; }
.rubric ul { padding-left:20px; margin:6px 0; }
.rubric li { margin:4px 0; }
meta { color:#888; font-size:13px; }
</style>
</head>
<body>
<div class="wrap">
  <h1>MAE101 — Kết quả bài làm</h1>
  <div class="meta">Xuất lúc: ${date}</div>
  <div class="summary">
    <div class="big">${total.toFixed(1)} / 10</div>
    <div class="meta">Tổng điểm tự chấm sơ bộ</div>
  </div>
  ${rows}
</div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
