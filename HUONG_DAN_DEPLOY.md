# HƯỚNG DẪN DEPLOY MAE101 QUIZ LÊN VERCEL

## Yêu cầu trước
- Đã cài Node.js (có npm) — bạn đã có
- Tài khoản GitHub: https://github.com (đăng ký miễn phí nếu chưa có)
- Tài khoản Vercel: https://vercel.com (đăng nhập bằng tài khoản GitHub luôn)

---

## BƯỚC 1: Khởi tạo git repo locally

Mở terminal trong VSCode (Ctrl+` hoặc Cmd+`), chạy lệnh sau tại thư mục dự án `MAE101_TEST1`:

```bash
# Khởi tạo git
git init

# Thêm tất cả file (ngoại trừ node_modules, .next, db, etc. đã có trong .gitignore)
git add .

# Commit lần đầu
git commit -m "MAE101 quiz app — initial commit"
```

---

## BƯỚC 2: Tạo repo trên GitHub

1. Mở trình duyệt: https://github.com/new
2. Điền:
   - **Repository name**: `mae101-quiz`
   - **Description** (tuỳ chọn): `Trắc nghiệm tương tác MAE101 — Calculus & Linear Algebra`
   - **Public** (chọn Public để Vercel dễ deploy, hoặc Private cũng được)
   - **KHÔNG tick** "Add a README file", "Add .gitignore", "Choose a license" (vì đã có sẵn trong project)
3. Bấm **Create repository**

Sau khi tạo xong, GitHub sẽ hiển thị URL dạng:
```
https://github.com/<TEN_GITHUB_CUA_BAN>/mae101-quiz.git
```

Copy URL này — sẽ dùng ở Bước 3.

---

## BƯỚC 3: Push code lên GitHub

Trong terminal VSCode, chạy (thay `<TEN_GITHUB>` bằng username GitHub của bạn):

```bash
# Đổi tên branch chính thành 'main'
git branch -M main

# Liên kết với GitHub repo (thay URL bằng URL bạn copy ở Bước 2)
git remote add origin https://github.com/<TEN_GITHUB>/mae101-quiz.git

# Push code lên
git push -u origin main
```

Nếu terminal hỏi Username/Password:
- **Username**: nhập username GitHub
- **Password**: KHÔNG dùng password thường — dùng **Personal Access Token** (tạo tại https://github.com/settings/tokens → "Generate new token (classic)" → tick `repo` → Generate → copy token)

> **Mẹo dễ hơn**: nếu đã cài GitHub CLI, dùng `gh auth login` để login 1 lần rồi không cần nhập nữa.

---

## BƯỚC 4: Deploy lên Vercel (KHÔNG cần cài gì thêm)

1. Mở trình duyệt: https://vercel.com/new
2. Đăng nhập bằng GitHub (nếu chưa)
3. Bấm **Import Git Repository** → chọn repo `mae101-quiz` (nếu không thấy, bấm "Adjust GitHub App Permissions" để cấp quyền)
4. Trang cấu hình:
   - **Framework Preset**: Vercel tự nhận **Next.js** (KHÔNG đổi)
   - **Root Directory**: để trống (mặc định)
   - **Build Command**: `next build` (mặc định, không đổi)
   - **Output Directory**: để trống
   - **Install Command**: Vercel tự nhận `bun install` hoặc `npm install`
   - **Environment Variables**: KHÔNG cần thêm gì (app không cần biến môi trường)
5. Bấm **Deploy**

Vercel sẽ build mất khoảng 1-3 phút. Khi xong, bạn sẽ thấy thông báo "Congratulations!" kèm URL dạng:
```
https://mae101-quiz.vercel.app
```
(hoặc tên tương tự nếu đã có ai đặt trước)

Đó chính là link gửi cho sinh viên! 🎉

---

## BƯỚC 5: Cập nhật code sau này

Mỗi lần bạn sửa code trong VSCode, chỉ cần:

```bash
git add .
git commit -m "Mô tả thay đổi (ví dụ: sửa câu 3 rubric)"
git push
```

Vercel sẽ **tự động build và deploy lại** trong ~1 phút. Sinh viên refresh trang là thấy bản mới.

---

## LỖI THƯỜNG GẶP & CÁCH XỬ LÝ

### Lỗi 1: `git push` báo "Authentication failed"
→ Dùng Personal Access Token (hướng dẫn ở Bước 3) hoặc `gh auth login`.

### Lỗi 2: Build fail trên Vercel với lỗi "Cannot find module X"
→ Có thể do Vercel dùng `npm install` thay vì `bun install`. Vào Vercel project → Settings → General → "Install Command" → đổi thành `bun install` → Redeploy.

### Lỗi 3: Trang trắng sau deploy
→ Vào Vercel project tab "Logs" xem chi tiết lỗi runtime.

### Lỗi 4: MathJax không render ở production
→ App load MathJax từ CDN `cdn.jsdelivr.net`. Nếu mạng sinh viên chặn CDN, có thể tự host MathJax (hỏi mình nếu cần).

---

## KIỂM TRA TRƯỚC KHI DEPLOY

Chạy lệnh sau trong terminal VSCode để chắc build không lỗi:

```bash
bun run build
```

Nếu chạy xong không có lỗi → app sẵn sàng deploy.
