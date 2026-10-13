---
name: allure-report
description: Allure 2 qua npm allure-commandline (máy cần Java), cách sinh/mở report, che dữ liệu nhạy cảm
type: project
nguon: phiên 08-09, 10-09, 15-09, 24-09, 29-09-2026 của repo cha · bộ nhớ project-book-anhtester-env
cap-nhat: 03-10-2026
---

# Allure report

## Quyết định của user
- **Allure 2** (không phải Allure 3), CLI nằm **trong project** qua devDependency `allure-commandline` → máy **phải có Java (JRE 8+)**. User chọn phương án này thay vì đóng gói JRE hoặc dùng Allure 3 thuần Node (15-09-2026).
- Ghi chú: rule chung `reporting_rules.md` khuyến nghị Allure 3 cho Node — repo này là **ngoại lệ có chủ đích**, đừng tự "sửa" sang Allure 3. README phải ghi rõ yêu cầu Java (đã ghi).
- Máy user có Java (OpenJDK 17 lúc 08-09-2026). Thiếu Java → `npm run report` báo lỗi Tiếng Việt kèm hướng dẫn (`scripts/allure.mjs`).

## Lệnh user hay hỏi
`npm run report` (sinh + mở) · `npm run report:open` (mở lại) · `npm run report:single` (1 file HTML để gửi người không có Java) · kiểm Java: `java -version`. User hỏi lệnh Allure **nhiều lần** (24-09, 29-09) → đưa ngay bảng lệnh README mục 4, không giải thích dài.

## Đọc report
- TC ID nằm ở mục **Parameters** của từng test.
- API: attachment `api_request_response` cuối mỗi test, token/mật khẩu đã che. Response lệch Content-Type spec → parameter **"Cảnh báo Content-Type lệch spec"** (không đánh FAIL).
- UI: ảnh `trang_thai_cuoi_cua_test` / `trang_thai_khi_that_bai`.

## Bảo mật report — bài học 15-09-2026
Ban đầu Allure **in nguyên mật khẩu** ở step `Fill "<giá trị>"` và trong `error-context`/trace khi fail. Đã xử lý: `detail: false` trong `allure-playwright` + `src/utils/allure-sanitizer.ts` gỡ `trace`/`error-context`. Quét lại không còn mật khẩu.
- **Allure** gửi ra ngoài được. **Playwright HTML report, trace, `reports/test-artifacts/`** chỉ dùng **nội bộ** (vẫn chứa giá trị form).
- Thêm loại attachment mới → kiểm lại không lộ secret. Không bật lại `detail: true`.

## Đã xử lý trước đây — đừng tái phạm
- `import { allure } from 'allure-playwright'` đã **deprecated** ở v3 → dùng `import * as allure from 'allure-js-commons'` (khai devDependency tường minh).
- `allure-results` cộng dồn qua các lần chạy → `global-setup.ts` dọn ở lượt đầu (không dọn giữa các lượt trình duyệt, để gộp được 3 trình duyệt).
- Không dùng `console.log` (stdout bị đính thành attachment) — dùng `createLogger()`.

Liên quan: [[chay-test-da-trinh-duyet]] · [[nguon-goc-va-lich-su]]
