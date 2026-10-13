---
name: ci-github-actions
description: CI GitHub Actions — secrets bắt buộc, lỗi từng bỏ sót biến môi trường khi thêm bộ test mới
type: project
nguon: phiên 15-09, 24-09, 01-10-2026 của repo cha
cap-nhat: 03-10-2026
---

# CI GitHub Actions

Chi tiết ở `README.md` mục 7 và `.github/workflows/playwright.yml`.

- Chạy `run-browsers.mjs --with-api`: API → Chrome → Edge → Firefox, `timeout-minutes: 60`, `WORKERS: 3` (hạ từ 5 ngày 13-10-2026 theo yêu cầu user — local `.env` vẫn 5), artifact duy nhất `test-reports` (toàn bộ `reports/`). CI retry 1 lần, headless.
- **8 Repository secrets user phải tự thêm**: `TEST_EMAIL` · `TEST_PASSWORD` · `CRM_ADMIN_EMAIL` · `CRM_ADMIN_PASSWORD` · `CRM_PM_EMAIL` · `CRM_PM_PASSWORD` · `CMS_ADMIN_EMAIL` · `CMS_ADMIN_PASSWORD`. URL là Repository variables (có mặc định).
- Workflow chỉ chạy khi thư mục framework là **gốc repo** — giờ đã đúng (repo này đã tách riêng).
- **Repo GitHub (13-10-2026):** `anhtester/playwright-typescript-framework-ai`, **public** (user chọn). Đã khai 12 secret tài khoản + 4 Repository variables `BASE_URL` · `API_URL` · `CRM_URL` · `CMS_URL` (lấy từ `.env`).
- **Bẫy:** `gh secret set -f .env` đẩy cả biến không bí mật (`HEADLESS=true`, `LOG_LEVEL=info`…) thành secret → GitHub che mọi chuỗi `true`/`info` trong log. Chỉ đưa biến tài khoản vào secret; URL vào variables; còn lại workflow tự khai ở `env:`.

## CI tạm chỉ chạy Chrome (13-10-2026)
User chốt: CI chạy trước trên Chrome, tắt Edge/Firefox. Điều khiển bằng `env.BROWSERS` đầu workflow (`chrome` → `chrome,edge,firefox` để bật lại); bước cài trình duyệt và Allure "Browsers" (qua `RUN_BROWSERS` của `run-browsers.mjs`) tự theo. Local cũng chỉ Chrome: `BROWSERS=chrome` trong `.env` — `run-browsers.mjs` tự nạp `.env` (không ghi đè biến CI đã đặt), `--browsers=` ghi đè cho 1 lần chạy. Chi tiết [[chay-test-da-trinh-duyet]].
Workflow đã khai thêm 4 secret tuỳ chọn `CRM_CUSTOMER_*` · `CRM_TC014_*` (thiếu thì TC_019/020/014 SKIP) — tổng 12 secret.

## CI bỏ qua `@known-bug` (13-10-2026)
User chốt: CI chạy `--grep-invert @known-bug`; bấm tay workflow + tick `include_known_bugs` để chạy lại nhóm đó.

**Why:** 7 lượt phơi bug (BK_AUTH_TC_062 · 068-d · 075 · 080 + CRM_LOGIN_TC_016 × 3 trình duyệt) làm CI đỏ mọi lần push.

**How to apply:** test mới viết để phơi bug của app **phải** mang tag `@known-bug` — tag `@needs-verify` không đủ, CI vẫn chạy và đỏ. Biến thể data-driven thì gắn qua cờ `knownBug: true` trong JSON (mẫu: `attackNames` biến thể d).

## Bài học: thêm bộ test mới phải sửa luôn CI
Đã **2 lần** thêm bộ test (CRM 24-09, CMS 01-10) mà quên khai biến môi trường trong workflow → bộ đó đỏ trên CI, phát hiện muộn ở phiên sau.

**How to apply:** thêm hệ thống / project / biến `.env` mới → cùng lượt sửa: `.env.example` (để trống giá trị) · `env:` của workflow · bảng secrets README mục 7 · cài thêm trình duyệt nếu cần. Báo user danh sách secret cần thêm trên GitHub.

Liên quan: [[chay-test-da-trinh-duyet]]

## GitLab CI (13-10-2026)
`.gitlab-ci.yml` ở gốc — **cùng hành vi** với workflow GitHub (Chrome · bỏ `@known-bug` · Allure trong `after_script` · artifact `reports/` 14 ngày). Image `mcr.microsoft.com/playwright:v<phiên bản>-noble` + cài `openjdk-17-jre-headless` cho Allure. Form Run pipeline: `GREP` · `INCLUDE_KNOWN_BUGS`.

**How to apply:** sửa hành vi CI (trình duyệt, biến, lọc tag) → sửa **cả 2 file** `.github/workflows/playwright.yml` và `.gitlab-ci.yml`, cộng README mục 7. Nâng `@playwright/test` → nâng tag image GitLab.
- Mật khẩu demo 6 số **không** Masked được (GitLab đòi ≥ 8 ký tự); biến **Protected** không có ở MR từ nhánh thường.
- Artifact chứa `reports/html` + trace có nguyên mật khẩu → GitLab đặt `artifacts:access: developer`; GitHub không có tương đương → repo phải private.
- **Đủ biến (13-10-2026):** user phản ánh GitLab CI "không đủ biến env" → cả 2 file CI giờ khai đủ 25 biến của `.env.example` (tài khoản GitLab ghi trong comment đầu file vì runner tự đưa vào từ Settings → CI/CD → Variables — KHÔNG viết `X: $X`, biến chưa khai có thể thành chữ `$X`). Bước `npm run check:env` (`scripts/check-env.mjs`) chạy đầu job, thiếu biến bắt buộc thì dừng. Thêm biến tài khoản mới → sửa cả `scripts/check-env.mjs`.
