---
name: chay-test-da-trinh-duyet
description: Cách chạy test, đa trình duyệt tuần tự, số luồng, headed — và các bẫy lệnh user đã gặp
type: project
nguon: phiên 24-09-2026 (460bd492), 29-09-2026 (1e7f37aa), 01-10-2026 (6a1ee6ad) của repo cha
cap-nhat: 03-10-2026
---

# Chạy test & đa trình duyệt

Bảng lệnh đầy đủ ở `README.md` mục 3 — đọc ở đó. File này ghi **yêu cầu của user và bẫy**.

## Yêu cầu user đã chốt (01-10-2026)
*"Chạy test UI với 3 trình duyệt Chrome, Edge, Firefox · chạy tuần tự từng trình duyệt · mỗi trình duyệt song song 5 luồng."*
- Mỗi bộ UI × trình duyệt = 1 project tên `<bộ>-<trình duyệt>` (`ui-chrome`, `crm-firefox`…). Bộ: `ui` (book) · `crm` · `cms`.
- `scripts/run-browsers.mjs` gọi Playwright **từng trình duyệt một**; lượt trước FAIL vẫn chạy lượt sau, exit code ≠ 0 nếu có lượt FAIL. Tham số: `--browsers=` · `--suites=` · `--with-api`; tham số khác (`--grep`, `--headed`…) chuyển thẳng cho Playwright.
- Chrome / Edge = bản **cài trên máy** (`channel: 'chrome' | 'msedge'`), Firefox = bản của Playwright.
- `global-setup.ts`: chỉ lượt đầu dọn `allure-results` → Allure gộp cả 3 trình duyệt; HTML report tách `reports/html/<trình duyệt>/`.
- Lịch sử: 24-09 user từng chỉnh 4 luồng + thêm Edge (project `crm-chromium`/`crm-edge`) — **đã thay thế** bởi cấu trúc 01-10 ở trên.

## Tạm chỉ chạy Chrome (13-10-2026)
User chốt: local và CI đều chạy UI trên **Chrome** trước, tắt Edge/Firefox. Cấu trúc 3 trình duyệt ở trên **giữ nguyên**, chỉ đổi lựa chọn mặc định.
- Chọn trình duyệt đúng 1 chỗ: `BROWSERS` trong `.env` (local) · `env.BROWSERS` đầu workflow (CI). Để trống = cả 3. `run-browsers.mjs` tự nạp `.env` bằng dotenv (không ghi đè biến đã đặt sẵn).
- `--browsers=` ghi đè cho 1 lần chạy → `test:ui:edge` / `test:ui:firefox` vẫn dùng được.
- Bật lại đủ 3: sửa 3 chỗ `.env` · `.env.example` · workflow thành `chrome,edge,firefox`.

## Số luồng — đúng 1 chỗ
`WORKERS` trong `.env` (số luồng **mỗi trình duyệt**), CI ở `env.WORKERS` đầu workflow. Parallel luôn bật — test đỏ khi chạy song song là test sai, **không** hạ `WORKERS=1` để giấu. Khi user đổi số luồng, nhắc luôn 2 chỗ còn lại: `.env.example` và `.github/workflows/playwright.yml`.

## Bẫy đã gặp — nhắc user khi đưa lệnh
| Bẫy | Hệ quả | Làm đúng |
|---|---|---|
| Gọi thẳng `npx playwright test` | Mọi project 3 trình duyệt **trộn cùng lúc** | Dùng `npm run test:*` |
| Gõ trần `playwright test ...` (không `npx`) trên máy user | `error: unknown command 'test'` — PATH trỏ trước tiên vào `playwright.exe` của **Python** (`Python311\Scripts`), sau đó mới tới bản npm global 1.54 (gói `playwright`, không có lệnh `test`) — 13-10-2026 | Luôn `npx playwright ...` hoặc `npm run test:list` — dùng bản `@playwright/test` trong `node_modules` |
| Thêm `--reporter=...` | Thay hẳn reporter trong config → **Allure không có kết quả** | Đừng thêm `--reporter` |
| `--grep CRM_LOGIN_TC_005` | Không tìm thấy test — TC ID nằm ở annotation/Parameters, **không** nằm trong tên test | Grep theo đoạn tên Tiếng Việt, theo tag (`@smoke`, `@known-bug`) hoặc `--ui` |
| Headed với `VIEWPORT=1920x1080` trên màn 1920×1080 | Cửa sổ tràn, cắt mép phải | Hạ `VIEWPORT` (vd `1600x750`) hoặc theo [[viewport-va-playwright-mcp]] |
| Thêm `--headed` vào `npm run` | Phải có `--` | `npm run test:crm -- --headed` |

Cú pháp biến môi trường khác nhau: PowerShell `$env:WORKERS=2; npm run test:ui` · Git Bash `WORKERS=2 npm run test:ui`. Máy user chạy Windows — đưa **cả hai** khi hướng dẫn.

## Tác dụng phụ cần biết
- `BK_AUTH_TC_075` gửi 1 request đăng nhập sai vào tài khoản `user@example.com` (không phải của QA, lỗi F-19 của app) → test khai `retries: 0`, mỗi lượt chỉ 1 lần. **Không** bật retry cho test này.
- `.env` trên máy user (01-10-2026) đặt `HEADLESS=false` → chạy local mặc định mở trình duyệt; CI vẫn headless. Kiểm lại `.env` trước khi giả định.

Liên quan: [[allure-report]] · [[loi-da-gap-va-cach-sua]] · [[ci-github-actions]]
