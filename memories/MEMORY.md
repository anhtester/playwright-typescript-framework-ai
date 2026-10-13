# MEMORY — Bản đồ bộ nhớ của repo `playwright-typescript-framework-ai`

> **Thứ tự đọc khi nhận MỌI yêu cầu:** `CLAUDE.md` → **file này** → mở đúng 1–3 file bộ nhớ theo bảng "Đang làm gì → đọc file nào" bên dưới. **Không** đọc hết thư mục cho chắc.
>
> Bộ nhớ là **ngữ cảnh nền, ghi tại thời điểm viết** — file, flag, giá trị config nhắc trong bộ nhớ phải **kiểm lại trên code hiện tại** trước khi dựa vào. Bộ nhớ lệch với code → code thắng, sửa lại bộ nhớ.

---

## 1. Đang làm gì → đọc file nào

| Yêu cầu của user | Đọc |
|---|---|
| Bất kỳ việc gì (luôn đọc) | [user/ho-so-va-giao-tiep.md](user/ho-so-va-giao-tiep.md) · [workflow/ban-giao-va-bao-cao.md](workflow/ban-giao-va-bao-cao.md) |
| Chạy test · đổi số luồng · đa trình duyệt · headed | [framework/chay-test-da-trinh-duyet.md](framework/chay-test-da-trinh-duyet.md) |
| Allure report · lộ mật khẩu trong report · Java | [framework/allure-report.md](framework/allure-report.md) |
| Debug UI bằng Playwright MCP · viewport · chụp evidence | [framework/viewport-va-playwright-mcp.md](framework/viewport-va-playwright-mcp.md) |
| Test fail / flaky / lỗi trình duyệt lạ | [framework/loi-da-gap-va-cach-sua.md](framework/loi-da-gap-va-cach-sua.md) |
| CI GitHub Actions · GitLab CI · secrets | [framework/ci-github-actions.md](framework/ci-github-actions.md) |
| Hỏi framework này từ đâu ra, cấu trúc, lịch sử | [framework/nguon-goc-va-lich-su.md](framework/nguon-goc-va-lich-su.md) |
| Viết test cho **book.anhtester.com** (UI · API) | [systems/book-anhtester.md](systems/book-anhtester.md) |
| Viết test cho **crm.anhtester.com** (Perfex CRM) | [systems/crm-perfex.md](systems/crm-perfex.md) |
| Viết test cho **cms.anhtester.com** (Active eCommerce) | [systems/cms-active-ecommerce.md](systems/cms-active-ecommerce.md) |
| Sinh automation từ file TC · tìm file TC | [testcases/nguon-tai-lieu-o-repo-cha.md](testcases/nguon-tai-lieu-o-repo-cha.md) |
| Sinh / sửa / review manual TC | [testcases/quy-tac-viet-tc.md](testcases/quy-tac-viet-tc.md) · [testcases/review-testcases.md](testcases/review-testcases.md) |
| Khảo sát hệ thống · chụp evidence · AMB | [testcases/evidence-va-khao-sat.md](testcases/evidence-va-khao-sat.md) |
| App mobile · Appium MCP | [mobile/appium-va-app-book.md](mobile/appium-va-app-book.md) |
| Sửa `.claude/` (skills · commands · rules) | [toolkit/bo-skills-claude.md](toolkit/bo-skills-claude.md) |

---

## 2. Danh mục toàn bộ bộ nhớ

### 👤 `user/` — người dùng & cách giao tiếp
- [Hồ sơ & giao tiếp](user/ho-so-va-giao-tiep.md) — Anh Tester, giảng viên khoá AI Testing; báo cáo Tiếng Việt, ngắn gọn; ghét bị bắt ngồi canh từng bước; giá trị `.env` chỉ là mặc định — agent tự kiểm & chỉnh cho khớp TC

### 🔁 `workflow/` — quy trình làm việc chung
- [Bàn giao & báo cáo](workflow/ban-giao-va-bao-cao.md) — báo cáo PASS/FAIL/SKIP, gợi ý Slack `#project-crm` (soạn nháp → user duyệt → gửi), nhắc commit/push, file bàn giao để trong repo

### 🧩 `framework/` — chính framework này
- [Nguồn gốc & lịch sử](framework/nguon-goc-va-lich-su.md) — tách từ repo cha `course-ai-test-automation`; dòng thời gian 08-09 → 01-10-2026
- [Chạy test & đa trình duyệt](framework/chay-test-da-trinh-duyet.md) — `run-browsers.mjs` Chrome → Edge → Firefox tuần tự, `WORKERS` 1 chỗ, bẫy `npx playwright test` / `--reporter` / `--grep` TC ID
- [Allure report](framework/allure-report.md) — Allure 2 qua npm `allure-commandline`, máy cần Java; sanitizer che mật khẩu
- [Viewport & Playwright MCP](framework/viewport-va-playwright-mcp.md) — `.mcp.json` vs `CLAUDE.md` đang lệch, đo trước khi tin; MCP cwd có thể rơi sang project khác
- [Lỗi đã gặp & cách sửa](framework/loi-da-gap-va-cach-sua.md) — Firefox headed treo khi cửa sổ bị che, race đăng xuất CRM, TC_019 `fixme`, **Firefox không bắn `load` → cấm `networkidle`** (TC_007, 08-10-2026) + luật verify `--repeat-each=20`
- [CI GitHub Actions & GitLab CI](framework/ci-github-actions.md) — 8 secret bắt buộc + 4 tuỳ chọn, CI chỉ Chrome, bỏ `@known-bug`, sửa CI thì sửa cả 2 file

### 🌐 `systems/` — hệ thống đang test
- [book.anhtester.com](systems/book-anhtester.md) — môi trường dùng chung (cho phép phá huỷ nhưng chỉ dữ liệu tự tạo), prefix `BK_` (mẫu cũ `BOOK_`), bug đã biết
- [Perfex CRM](systems/crm-perfex.md) — dùng chung, CẤM phá huỷ, prefix `CRM_`, root URL redirect, quên mật khẩu AJAX
- [Active eCommerce CMS](systems/cms-active-ecommerce.md) — tài khoản là staff, prefix `CMS_` **tạm**, 5 câu hỏi còn treo

### 📋 `testcases/` — manual TC, evidence, tài liệu
- [Nguồn tài liệu ở repo cha](testcases/nguon-tai-lieu-o-repo-cha.md) — repo này mới có `docs/testcases/login/`; REQ và module khác nằm ở `course-ai-test-automation/docs/`
- [Quy tắc viết TC](testcases/quy-tac-viet-tc.md) — gộp biến thể, ngôn ngữ nhìn thấy được, `@TechCheck`
- [Review test cases](testcases/review-testcases.md) — chỉ chấm dòng TC; tên mode ở repo này là `AUTOMATION` (repo cha đã đổi `AUTO`)
- [Evidence & khảo sát](testcases/evidence-va-khao-sat.md) — mở hết ảnh trước khi sinh TC, chụp xong phải mở lại; AMB tự chốt bằng giả định

### 📱 `mobile/`
- [Appium & app Book](mobile/appium-va-app-book.md) — appium-mcp khai ở config global; app hybrid chỉ có `NATIVE_APP`; Java 21

### 🛠️ `toolkit/` — bộ `.claude/`
- [Bộ skills Claude](toolkit/bo-skills-claude.md) — kebab-case, tiền tố `skills-`; sửa lỗi thì đưa luật tổng quát vào skill; không gợi ý nhóm skill backlog

---

## 3. Nguồn gốc bộ nhớ (gom ngày 03-10-2026)

Gom từ bộ nhớ Claude Code trên máy (`C:\Users\votha\.claude\projects\<project>\memory\`) và lịch sử phiên làm việc:

| Nguồn | Lấy gì |
|---|---|
| `D--AI-Testing-Automation-Course-course-ai-test-automation` (**repo cha**) | Toàn bộ 3 bộ nhớ + báo cáo cuối của 27 phiên (dựng framework, CRM, CMS, API, đa trình duyệt, viewport) |
| `D--ANHTESTER-ClaudeCode-claude-testing-skills` (repo gốc bộ `.claude/`) | Bộ nhớ về quy tắc TC, evidence, MCP, CRM, quy ước toolkit |
| `D--AI-Testing-Manual-Course-course-ai-test-manual` · `...-claude-ai-testing` · `D--ClaudeBuildMemoryProject` | Phạm vi review TC · lưu file bàn giao vào repo · MCP cwd |

**Cố ý KHÔNG mang sang** (thuộc repo khác, không áp cho repo này): đồng bộ sang bản Codex (`codex-testing-skills`), đồng bộ repo public `claude-testing-kit`, quy ước phiếu YAML `plans/` và prompt `prompts/` (repo này không có 2 thư mục đó), bộ nhớ của `ClaudeCode_Playwright_Demo` (project khác, cấu trúc cũ). Quy tắc ngày `DD-MM-YYYY` đã có sẵn trong `CLAUDE.md` mục 6b nên không chép lại.

🔒 **Không** ghi mật khẩu / token / tài khoản thật vào thư mục này — thư mục được commit. Credentials chỉ sống trong `.env`.

## 4. Cách ghi thêm bộ nhớ

- Mỗi file = một chủ đề; ghi thêm vào file cùng chủ đề thay vì tạo file trùng. File vượt ~150 dòng thì tách.
- Mỗi điều nên có **Why** (vì sao) và **How to apply** (áp dụng thế nào); ngày viết `DD-MM-YYYY`.
- Thêm file mới → thêm 1 dòng vào mục 2 và (nếu cần) mục 1 của file này.
- Phát hiện bộ nhớ sai → sửa hoặc xoá ngay, ghi ngày sửa.
