// MAE101 — Calculus & Linear Algebra — Quiz dataset
// 10 questions, Vietnamese. Each rubric item accepts multiple patterns (any match = full credit for that step).
// Patterns are plain JS strings (using String.raw for clarity). They're compiled to RegExp in the grader.

import { RubricItem, Question } from "./quiz-data-types";

export type { RubricItem, Question };

// We use String.raw`...` so backslashes survive intact.
const R = String.raw;

export const questions: Question[] = [
  {
    id: 1,
    title: "Câu 1 — Tiếp tuyến của đường cong ẩn",
    problem: `Cho đường cong xác định bởi phương trình: <div class="formula">\\[x^2+xy+y^2=7\\]</div> Tìm phương trình tiếp tuyến của đường cong tại điểm <b>\\(P=(1,2)\\)</b>.`,
    hint: "💡 <b>Cấu trúc tư duy:</b> Đạo hàm hai vế theo \\(x\\). Nhớ rằng \\(y\\) là hàm của \\(x\\), nên đạo hàm của \\(y^2\\) là \\(2y \\cdot y'\\) (quy tắc dây chuyền). Sau đó thay \\(x=1, y=2\\) để tìm \\(y'\\).",
    rubric: [
      {
        patterns: [R`2x`, R`2\*x`],
        points: 0.15,
        description: "Lấy đạo hàm đúng \\(2x\\)."
      },
      {
        patterns: [R`x\s*\*?\s*y'\s*\+\s*y`, R`y\s*\+\s*x\s*\*?\s*y'`, R`xy'\s*\+\s*y`, R`y\s*\+\s*xy'`],
        points: 0.20,
        description: "Có đạo hàm của \\(xy\\) (quy tắc tích)."
      },
      {
        patterns: [R`2y\s*\*?\s*y'`, R`2y\s*·\s*y'`, R`y'\s*\*\s*2y`],
        points: 0.20,
        description: "Có đạo hàm của \\(y^2\\) (quy tắc dây chuyền)."
      },
      {
        patterns: [
          R`-\s*4\s*/\s*5`,
          R`-\\frac\{4\}\{5\}`,
          R`-\s*0\.8`,
          R`y'\s*=\s*-\s*4\s*/\s*5`,
          R`-\s*4\s*:\s*5`
        ],
        points: 0.20,
        description: "Tính đúng hệ số góc \\(-4/5\\)."
      },
      {
        patterns: [
          R`y\s*-\s*2\s*=\s*-\s*4\s*/\s*5\s*\*?\s*\(?\s*x\s*-\s*1`,
          R`4x\s*\+\s*5y\s*=\s*14`,
          R`4x\s*\+\s*5y\s*-\s*14\s*=\s*0`,
          R`y\s*=\s*-\s*0\.8\s*\*?\s*x\s*\+\s*2\.8`,
          R`5y\s*-\s*10\s*=\s*-\s*4x\s*\+\s*4`
        ],
        points: 0.25,
        description: "Lập đúng phương trình tiếp tuyến."
      }
    ]
  },
  {
    id: 2,
    title: "Câu 2 — Xấp xỉ tích phân bằng phương pháp hình thang",
    problem: `Cho bảng giá trị: <table class="data"><tr><th>\\(x\\)</th><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td></tr><tr><th>\\(f(x)\\)</th><td>1</td><td>3</td><td>4</td><td>7</td><td>8</td></tr></table> Dùng <b>Composite Trapezoidal Rule</b> để xấp xỉ <div class="formula">\\[\\int_0^4 f(x)\\,dx.\\]</div>`,
    hint: "💡 <b>Công thức nền tảng:</b> \\(\\frac{h}{2} [f(x_0) + 2f(x_1) + 2f(x_2) + 2f(x_3) + f(x_4)]\\). Ở đây \\(h=1\\).",
    rubric: [
      {
        patterns: [R`h\s*=\s*1`, R`bước\s+h\s*=\s*1`, R`step\s*=\s*1`],
        points: 0.20,
        description: "Xác định đúng bước \\(h=1\\)."
      },
      {
        patterns: [R`h\s*/\s*2`, R`\\frac\{h\}\{2\}`, R`1/2`, R`0\.5\s*\*`],
        points: 0.20,
        description: "Dùng đúng hệ số \\(h/2\\)."
      },
      {
        patterns: [
          R`f\s*\(\s*0\s*\)\s*\+\s*2\s*\*?\s*f\s*\(\s*1\s*\)`,
          R`1\s*\+\s*2\s*\*?\s*3\s*\+\s*2\s*\*?\s*4\s*\+\s*2\s*\*?\s*7\s*\+\s*8`,
          R`1\s*\+\s*6\s*\+\s*8\s*\+\s*14\s*\+\s*8`,
          R`f\(x_?0\)\s*\+\s*2\s*f\(x_?1\)`
        ],
        points: 0.25,
        description: "Thay đúng các giá trị vào công thức."
      },
      {
        patterns: [R`\b18\.5\b`, R`\b18,5\b`, R`\b37\s*/\s*2\b`, R`\\frac\{37\}\{2\}`],
        points: 0.35,
        description: "Tính đúng kết quả \\(18.5\\)."
      }
    ]
  },
  {
    id: 3,
    title: "Câu 3 — Đạo hàm của hàm ẩn",
    problem: `Cho: <div class="formula">\\[x^3+y^3=6xy.\\]</div> Tìm <span>\\(\\dfrac{dy}{dx}\\)</span>.`,
    hint: "💡 <b>Mẹo cấu trúc:</b> Sau khi đạo hàm hai vế, hãy nhóm tất cả các số hạng chứa \\(y'\\) về một vế, đặt \\(y'\\) làm nhân tử chung, rồi chia vế còn lại cho nó.",
    rubric: [
      {
        patterns: [R`3x\s*\^?\s*2`, R`3x²`, R`3x\^2`, R`3\s*\*\s*x\s*\*\*\s*2`],
        points: 0.20,
        description: "Lấy đạo hàm đúng của \\(x^3\\)."
      },
      {
        patterns: [R`3y\s*\^?\s*2\s*\*?\s*y'`, R`3y²\s*\*?\s*y'`, R`3y\^2\s*\*?\s*y'`, R`3y\^2\s*·\s*y'`],
        points: 0.20,
        description: "Lấy đạo hàm đúng của \\(y^3\\)."
      },
      {
        patterns: [
          R`6\s*\*?\s*\(?\s*x\s*\*?\s*y'\s*\+\s*y\s*\)?`,
          R`6x\s*\*?\s*y'\s*\+\s*6y`,
          R`6y\s*\+\s*6x\s*\*?\s*y'`,
          R`6\s*·\s*\(x\s*y'\s*\+\s*y\)`
        ],
        points: 0.20,
        description: "Lấy đạo hàm đúng của \\(6xy\\)."
      },
      {
        patterns: [
          R`y'\s*\(\s*3y\s*\^?\s*2\s*-\s*6x\s*\)\s*=\s*6y\s*-\s*3x\s*\^?\s*2`,
          R`y'\s*=\s*\(\s*6y\s*-\s*3x\s*\^?\s*2\s*\)\s*/\s*\(?\s*3y\s*\^?\s*2\s*-\s*6x`,
          R`\\frac\{6y\s*-\s*3x\^?2\}\{3y\^?2\s*-\s*6x\}`
        ],
        points: 0.20,
        description: "Nhóm đúng các số hạng chứa \\(y'\\) và giải ra \\(y'\\)."
      },
      {
        patterns: [
          R`y'\s*=\s*\(\s*2y\s*-\s*x\s*\^?\s*2\s*\)\s*/\s*\(?\s*y\s*\^?\s*2\s*-\s*2x`,
          R`\\frac\{2y\s*-\s*x\^?2\}\{y\^?2\s*-\s*2x\}`,
          R`2y\s*-\s*x²\s*/\s*\(y²\s*-\s*2x\)`
        ],
        points: 0.20,
        description: "Rút gọn đúng kết quả \\(y'=\\frac{2y-x^2}{y^2-2x}\\)."
      }
    ]
  },
  {
    id: 4,
    title: "Câu 4 — Related Rates: tốc độ thay đổi liên quan",
    problem: `Một chiếc thang dài 5 m tựa vào tường. Đầu dưới của thang trượt ra xa tường với tốc độ <span>\\(\\dfrac{dx}{dt}=2\\,m/s\\)</span>. Tại thời điểm đầu dưới cách tường <span>\\(x=3\\,m\\)</span>, tìm tốc độ chuyển động của đầu trên của thang.`,
    hint: "💡 <b>Mô hình hóa:</b> Dùng định lý Pytago \\(x^2 + y^2 = 5^2\\). Đạo hàm hai vế theo thời gian \\(t\\) để liên kết \\(\\frac{dx}{dt}\\) và \\(\\frac{dy}{dt}\\).",
    rubric: [
      {
        patterns: [R`x\s*\^?\s*2\s*\+\s*y\s*\^?\s*2\s*=\s*25`, R`x²\s*\+\s*y²\s*=\s*25`, R`x\^2\s*\+\s*y\^2\s*=\s*25`],
        points: 0.25,
        description: "Lập đúng hệ thức \\(x^2+y^2=25\\)."
      },
      {
        patterns: [
          R`2x\s*\*?\s*dx\s*/\s*dt\s*\+\s*2y\s*\*?\s*dy\s*/\s*dt\s*=\s*0`,
          R`2x\s*·\s*\\?frac\{dx\}\{dt\}\s*\+\s*2y\s*·\s*\\?frac\{dy\}\{dt\}\s*=\s*0`,
          R`x\s*dx/dt\s*\+\s*y\s*dy/dt\s*=\s*0`
        ],
        points: 0.20,
        description: "Lấy đạo hàm theo thời gian."
      },
      {
        patterns: [R`y\s*=\s*4\b`, R`\\sqrt\{16\}`, R`\\sqrt\{25\s*-\s*9\}`],
        points: 0.20,
        description: "Tính đúng \\(y=4\\)."
      },
      {
        patterns: [
          R`2\s*\*?\s*3\s*\*?\s*2\s*\+\s*2\s*\*?\s*4\s*\*?\s*dy/dt\s*=\s*0`,
          R`6\s*\+\s*8\s*\*?\s*dy/dt\s*=\s*0`,
          R`12\s*\+\s*8\s*\*?\s*dy/dt\s*=\s*0`,
          R`3\s*\*?\s*dx/dt\s*\+\s*4\s*\*?\s*dy/dt\s*=\s*0`
        ],
        points: 0.20,
        description: "Thay đúng số liệu vào phương trình tốc độ."
      },
      {
        patterns: [
          R`dy/dt\s*=\s*-\s*3\s*/\s*2`,
          R`-\s*1\.5\b`,
          R`-\s*1,5\b`,
          R`-\\frac\{3\}\{2\}`,
          R`dy\s*/\s*dt\s*=\s*-\s*1\.5`
        ],
        points: 0.15,
        description: "Kết luận đúng \\(dy/dt=-3/2\\,m/s\\)."
      }
    ]
  },
  {
    id: 5,
    title: "Câu 5 — Newton Method",
    problem: `Dùng phương pháp Newton để tìm nghiệm xấp xỉ của: <div class="formula">\\[f(x)=x^3-x-1=0.\\]</div> Biết <span>\\(x_1=1\\)</span>. Tính <span>\\(x_2\\)</span> và <span>\\(x_3\\)</span>.`,
    hint: "💡 <b>Công thức lặp:</b> \\(x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}\\). Hãy tính \\(f(1)\\) và \\(f'(1)\\) trước khi tìm \\(x_2\\).",
    rubric: [
      {
        patterns: [R`f\s*\(\s*x\s*\)\s*=\s*x\s*\^?\s*3\s*-\s*x\s*-\s*1`, R`x³\s*-\s*x\s*-\s*1`, R`x\^3\s*-\s*x\s*-\s*1`],
        points: 0.15,
        description: "Xác định đúng \\(f(x)\\)."
      },
      {
        patterns: [R`f'\s*\(\s*x\s*\)\s*=\s*3x\s*\^?\s*2\s*-\s*1`, R`3x²\s*-\s*1`, R`3x\^2\s*-\s*1`, R`3\s*\*\s*x\s*\*\*\s*2\s*-\s*1`],
        points: 0.20,
        description: "Tính đúng \\(f'(x)=3x^2-1\\)."
      },
      {
        patterns: [
          R`x_?2\s*=\s*1\.5\b`,
          R`x_?2\s*=\s*1,5\b`,
          R`x\s*\{2\}\s*=\s*1\.5`,
          R`=\s*1\.5\s*-\s*\(\s*-?\s*1\s*\)\s*/\s*2`
        ],
        points: 0.25,
        description: "Tính đúng \\(x_2=1.5\\)."
      },
      {
        patterns: [
          R`f\s*\(\s*1\.5\s*\)\s*=\s*-?\s*0\.875\b`,
          R`f\s*\(\s*1\.5\s*\)\s*=\s*-?\s*0,875`,
          R`0\.875`,
          R`0,875`,
          R`f'\s*\(\s*1\.5\s*\)\s*=\s*5\.75`,
          R`5\.75`
        ],
        points: 0.15,
        description: "Tính đúng các giá trị trung gian tại \\(x_2=1.5\\)."
      },
      {
        patterns: [
          R`x_?3\s*=?\s*1\.347`,
          R`1\.3478`,
          R`1,3478`,
          R`1\.34783`,
          R`x\s*\{3\}\s*=?\s*1\.347`
        ],
        points: 0.25,
        description: "Tính đúng \\(x_3\\approx1.34783\\)."
      }
    ]
  },
  {
    id: 6,
    title: "Câu 6 — Tính định thức của ma trận",
    problem: `Cho ma trận: <div class="formula">\\[A=\\begin{pmatrix}2&1&3\\\\0&4&2\\\\1&0&5\\end{pmatrix}.\\]</div> Tính <span>\\(\\det(A)\\)</span>.`,
    hint: "💡 <b>Chiến lược:</b> Khai triển theo hàng 1 (vì có số 0 ở hàng 2 sẽ dễ tính hơn). \\(\\det(A) = 2 \\cdot \\det(M_{11}) - 1 \\cdot \\det(M_{12}) + 3 \\cdot \\det(M_{13})\\).",
    rubric: [
      {
        patterns: [
          R`2\s*\*?\s*\(?\s*4\s*\*?\s*5\s*-\s*2\s*\*?\s*0`,
          R`2\s*\*?\s*\(?\s*20\s*-\s*0`,
          R`2\s*·\s*\(4\s*·\s*5\s*-\s*2\s*·\s*0\)`,
          R`M_?\{?11\}?\s*=\s*20`
        ],
        points: 0.20,
        description: "Khai triển đúng theo hàng đầu."
      },
      {
        patterns: [R`\b20\b`, R`M_?\{?11\}?\s*=\s*20`],
        points: 0.20,
        description: "Tính đúng định thức con thứ nhất \\(=20\\)."
      },
      {
        patterns: [R`-\s*1\s*\*?\s*\(?\s*-?\s*2`, R`M_?\{?12\}?\s*=\s*-?\s*2`, R`-\s*1\s*·\s*\(?\s*-?\s*2`],
        points: 0.15,
        description: "Tính đúng định thức con thứ hai \\(=-2\\)."
      },
      {
        patterns: [R`3\s*\*?\s*\(?\s*-?\s*4`, R`\+\s*3\s*\*?\s*\(?\s*-?\s*4`, R`M_?\{?13\}?\s*=\s*-?\s*4`, R`3\s*·\s*-4`],
        points: 0.15,
        description: "Tính đúng định thức con thứ ba \\(=-4\\)."
      },
      {
        patterns: [R`det\s*\(\s*A\s*\)\s*=\s*30\b`, R`\\det\s*\(\s*A\s*\)\s*=\s*30`, R`=\s*30\b`, R`det\s*A\s*=\s*30`],
        points: 0.30,
        description: "Kết luận đúng \\(\\det(A)=30\\)."
      }
    ]
  },
  {
    id: 7,
    title: "Câu 7 — Tìm một entry của ma trận nghịch đảo",
    problem: `Cho ma trận: <div class="formula">\\[A=\\begin{pmatrix}1&2&0\\\\0&1&3\\\\2&0&1\\end{pmatrix}.\\]</div> Tìm entry <span>\\((2,3)\\)</span> của <span>\\(A^{-1}\\)</span>.`,
    hint: "💡 <b>Công thức cấu trúc:</b> Entry \\((i, j)\\) của \\(A^{-1}\\) là \\(\\frac{C_{ji}}{\\det(A)}\\). Chú ý chỉ số bị đảo ngược: cần tìm phần bù đại số \\(C_{32}\\), không phải \\(C_{23}\\).",
    rubric: [
      {
        patterns: [R`C_?\{?32\}?`, R`cofactor\s*C_?32`, R`phần\s+bù\s+đại\s+số\s+C_?32`, R`C_?32`],
        points: 0.20,
        description: "Nhận ra cần dùng cofactor \\(C_{32}\\)."
      },
      {
        patterns: [R`det\s*\(\s*A\s*\)\s*=\s*13`, R`\\det\s*\(\s*A\s*\)\s*=\s*13`, R`det\s*A\s*=\s*13`, R`=\s*13\b`],
        points: 0.25,
        description: "Tính đúng \\(\\det A=13\\)."
      },
      {
        patterns: [
          R`C_?\{?32\}?\s*=\s*-\s*3\b`,
          R`C_?32\s*=\s*-\s*3\b`,
          R`-\s*\(\s*-?\s*1\s*\*?\s*3\s*\)`,
          R`phần\s+bù\s+đại\s+số\s*=\s*-\s*3`
        ],
        points: 0.20,
        description: "Tính đúng \\(C_{32}=-3\\)."
      },
      {
        patterns: [
          R`C_?\{?32\}?\s*/\s*det`,
          R`C_?32\s*/\s*det`,
          R`\\frac\{C_?32\}\{det`,
          R`C_?32\s*/\s*13`,
          R`\\frac\{C_\{?32\}?\}\{13`
        ],
        points: 0.15,
        description: "Áp dụng đúng công thức entry của ma trận nghịch đảo."
      },
      {
        patterns: [
          R`A\^?\{-?1\}?\s*_?\{?\(?23\)?\}?\s*=\s*-\s*3\s*/\s*13`,
          R`-\\frac\{3\}\{13\}`,
          R`-\s*3\s*/\s*13`,
          R`\\left\(?\s*A\^?-1\s*\\right\)?_?\{?23\}?\s*=\s*-\s*3\s*/\s*13`
        ],
        points: 0.20,
        description: "Kết luận đúng \\((A^{-1})_{23}=-3/13\\)."
      }
    ]
  },
  {
    id: 8,
    title: "Câu 8 — Gaussian Elimination để tìm hạng",
    problem: `Cho ma trận: <div class="formula">\\[A=\\begin{pmatrix}1&2&3\\\\2&4&6\\\\1&1&2\\end{pmatrix}.\\]</div> Dùng <b>Gaussian Elimination</b> để xác định <span>\\(rank(A)\\)</span>.`,
    hint: "💡 <b>Quy tắc biến đổi:</b> \\(R_2 \\to R_2 - 2R_1\\) và \\(R_3 \\to R_3 - R_1\\). Quan sát xem có bao nhiêu hàng khác không sau khi khử.",
    rubric: [
      {
        patterns: [R`R_?2\s*-\s*2\s*\*?\s*R_?1`, R`R_?2\s*\\to\s*R_?2\s*-\s*2R_?1`, R`hàng\s+2\s*-\s*2\s*\*?\s*hàng\s+1`],
        points: 0.25,
        description: "Thực hiện đúng phép biến đổi hàng thứ hai."
      },
      {
        patterns: [R`R_?3\s*-\s*R_?1`, R`R_?3\s*\\to\s*R_?3\s*-\s*R_?1`, R`hàng\s+3\s*-\s*hàng\s+1`],
        points: 0.20,
        description: "Thực hiện đúng phép biến đổi hàng thứ ba."
      },
      {
        patterns: [
          R`0\s+0\s+0`,
          R`\\begin\{.*?\}0\s*&\s*0\s*&\s*0`,
          R`hàng\s+\(?\s*0\s*,\s*0\s*,\s*0`,
          R`0\s*,\s*0\s*,\s*0`
        ],
        points: 0.20,
        description: "Đưa ma trận về dạng có một hàng bằng 0."
      },
      {
        patterns: [
          R`2\s*(?:hàng|hang|pivot|nonzero)`,
          R`2\s*pivot`,
          R`hai\s*hàng\s*khác\s*không`,
          R`2\s*non-zero\s*rows`
        ],
        points: 0.15,
        description: "Đếm đúng số pivot/hàng khác không."
      },
      {
        patterns: [R`rank\s*\(\s*A\s*\)\s*=\s*2`, R`\\rank\s*\(\s*A\s*\)\s*=\s*2`, R`rank\s*A\s*=\s*2`, R`hạng\s*\(\s*A\s*\)\s*=\s*2`],
        points: 0.20,
        description: "Kết luận đúng \\(rank(A)=2\\)."
      }
    ]
  },
  {
    id: 9,
    title: "Câu 9 — Một entry của tích hai ma trận",
    problem: `Cho: <div class="formula">\\[A=\\begin{pmatrix}1&2&0\\\\3&1&2\\\\2&0&1\\end{pmatrix}, \\qquad B=\\begin{pmatrix}1&0&2&1\\\\2&1&0&3\\\\1&2&1&0\\end{pmatrix}.\\]</div> Đặt <span>\\(C=AB\\)</span>. Tính entry <span>\\((3,4)\\)</span> của <span>\\(C\\)</span>.`,
    hint: "💡 <b>Tư duy tích vô hướng:</b> Entry \\(C_{34}\\) là tích vô hướng của <b>Hàng 3</b> của ma trận A và <b>Cột 4</b> của ma trận B.",
    rubric: [
      {
        patterns: [R`C_?\{?34\}?`, R`C_?34`, R`entry\s*\(?\s*3\s*,\s*4\s*\)?`],
        points: 0.20,
        description: "Xác định đúng entry cần tính."
      },
      {
        patterns: [
          R`\(?\s*2\s*,\s*0\s*,\s*1\s*\)?`,
          R`\\row_?3\s*=\s*\(?\s*2\s*,\s*0\s*,\s*1`,
          R`hàng\s+3\s+của\s+A\s*:?\s*\(?\s*2\s*,\s*0\s*,\s*1`
        ],
        points: 0.25,
        description: "Chọn đúng hàng 3 của \\(A\\): \\((2,0,1)\\)."
      },
      {
        patterns: [
          R`\(?\s*1\s*,\s*3\s*,\s*0\s*\)?`,
          R`\\col_?4\s*=\s*\(?\s*1\s*,\s*3\s*,\s*0`,
          R`cột\s+4\s+của\s+B\s*:?\s*\(?\s*1\s*,\s*3\s*,\s*0`
        ],
        points: 0.25,
        description: "Chọn đúng cột 4 của \\(B\\): \\((1,3,0)\\)."
      },
      {
        patterns: [
          R`2\s*\*?\s*1\s*\+\s*0\s*\*?\s*3\s*\+\s*1\s*\*?\s*0`,
          R`2\s*·\s*1\s*\+\s*0\s*·\s*3\s*\+\s*1\s*·\s*0`,
          R`2\s*\+\s*0\s*\+\s*0`
        ],
        points: 0.15,
        description: "Thực hiện đúng tích vô hướng."
      },
      {
        patterns: [R`C_?\{?34\}?\s*=\s*2\b`, R`C_?34\s*=\s*2\b`, R`=\s*2\b`],
        points: 0.15,
        description: "Kết luận đúng \\(C_{34}=2\\)."
      }
    ]
  },
  {
    id: 10,
    title: "Câu 10 — Tính định thức bằng tính chất",
    problem: `Cho ma trận vuông \\(A\\) cấp 4, biết: <div class="formula">\\[\\det(A)=5.\\]</div> Tính <span>\\(\\det(A^{-1})\\)</span>.`,
    hint: "💡 <b>Tính chất cốt lõi:</b> \\(\\det(A^{-1}) = \\frac{1}{\\det(A)}\\). Đây là tính chất bất biến, không phụ thuộc vào cấp của ma trận.",
    rubric: [
      {
        patterns: [R`det\s*\(\s*A\^?\{-?1\}?\s*\)`, R`\\det\s*\(\s*A\^?-1\s*\)`, R`\\det\s*A\^?-1`, R`det\s*A\^?-1`],
        points: 0.25,
        description: "Nhận ra tính chất của định thức ma trận nghịch đảo."
      },
      {
        patterns: [R`1\s*/\s*det`, R`\\frac\{1\}\{\\?det`, R`\\frac\{1\}\{\\det`, R`\\dfrac\{1\}\{\\?det`],
        points: 0.25,
        description: "Dùng đúng công thức \\(\\det(A^{-1})=1/\\det(A)\\)."
      },
      {
        patterns: [R`det\s*\(\s*A\s*\)\s*=\s*5`, R`\\det\s*\(\s*A\s*\)\s*=\s*5`, R`det\s*A\s*=\s*5`, R`\\det\s*A\s*=\s*5`],
        points: 0.15,
        description: "Thay đúng \\(\\det(A)=5\\)."
      },
      {
        patterns: [R`\\frac\{1\}\{5\}`, R`1\s*/\s*5\b`, R`0\.2\b`, R`0,2\b`, R`det\s*\(\s*A\^?-1\s*\)\s*=\s*1\s*/\s*5`],
        points: 0.35,
        description: "Kết luận đúng \\(\\det(A^{-1})=1/5\\)."
      }
    ]
  }
];
