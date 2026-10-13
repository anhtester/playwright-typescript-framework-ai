---
name: nguon-goc-va-lich-su
description: Framework này tách từ repo cha course-ai-test-automation — dòng thời gian xây dựng và các quyết định gốc của user
type: project
nguon: lịch sử phiên của project course-ai-test-automation (08-09 → 01-10-2026)
cap-nhat: 03-10-2026
---

# Nguồn gốc & lịch sử framework

## Nguồn gốc
- Repo này được user **lấy ra từ repo cha** `D:\AI_Testing_Automation_Course\course-ai-test-automation\playwright-typescript-framework\` (xác nhận 03-10-2026). Ở repo cha thư mục này dự định "thành repo riêng" — nên `.github/workflows/` nằm ngay trong thư mục framework.
- **Tên repo: `playwright-typescript-framework-ai`** (user đổi 13-10-2026 để push lên GitHub) — `package.json`, lock, README đã đổi theo. Thư mục local có thể vẫn tên cũ `playwright-typescript-framework` nếu user chưa đổi; không ảnh hưởng gì vì code không dùng đường dẫn tuyệt đối.
- Repo cha vẫn còn: `docs/` (requirements, testcases, bug…), `appium-java-framework/` (mobile), `AI_FULL_FLOW_*.md`, `capabilities.json`. Xem [[nguon-tai-lieu-o-repo-cha]].
- `CLAUDE.md` của repo này **khác** repo cha (đã so 03-10-2026): repo này có *Git Pull Restriction Rule*, DoD đòi PASS **2** lần, viewport headed ghi `1600×770`, mode review tên `AUTOMATION`; repo cha có mục Slack, nhắc commit/push, viewport `1800×900`, mode `AUTO`.

## Quyết định gốc của user (15-09-2026, `/generate-automation-framework`)
- **Web UI + API trong cùng 1 project**, Playwright TypeScript.
- **Allure report version 2**, *"tích hợp chạy ngay Allure command trong repo, không cần cài môi trường vào máy"* → chọn npm `allure-commandline` (máy phải có Java) thay vì đóng gói JRE hay Allure 3. Xem [[allure-report]].
- Web: tự đăng ký tài khoản demo qua `/sign-up` rồi đăng nhập `/sign-in` (tài khoản lưu `.env`, tạo ngày 15-09-2026).
- API: spec Scalar tại `https://book.anhtester.com/swagger`.

## Dòng thời gian
| Ngày | Việc |
|---|---|
| 08-09-2026 | Bản scaffold đầu cho CRM login (cấu trúc cũ `tests/`, `src/config`) + thêm Allure |
| 10-09-2026 | Dựng lại theo cấu trúc `src/pages · fixtures · utils · tests`, gom output vào `reports/` |
| 15-09-2026 | **Dựng lại cho book.anhtester.com** (UI + API), 25 test mẫu, Allure 2, tự dọn tài khoản test |
| 24-09-2026 | Thêm bộ **CRM** `CRM_LOGIN_TC_001→010` (từ `docs/testcases/login/web/` repo cha), thêm Edge |
| 29-09-2026 | Thêm bộ API chính thức `register-login.api.spec.ts` (25 TC · 50 test, `BK_AUTH_*`); **xoá** `auth.api.spec.ts` cũ (`BOOK_AUTH_TC_009→018`) theo yêu cầu user |
| 01-10-2026 | Thêm bộ **CMS** `CMS_LOGIN_TC_001`; chuyển sang chạy **Chrome → Edge → Firefox tuần tự, mỗi trình duyệt 5 luồng** (`scripts/run-browsers.mjs`) |

## Việc còn treo từ các phiên trước
- 2 file không còn test nào dùng — **chưa xoá, đang chờ user quyết**: `test-data/login-negative.json` (dữ liệu của file cũ, mã `BOOK_AUTH_TC_013–015`) và `test-data/schemas/user-profile.schema.json` (schema `/me`, giữ lại nếu sinh automation cho part 02). Kiểm lại còn tồn tại không trước khi nhắc.
- TC ID mẫu `BOOK_AUTH_TC_001→008, 019` và `BOOK_BOOK_TC_001→006` là mã đặt cho bộ mẫu — khi có manual TC chính thức thì cập nhật `testId` cho khớp.
- Đề xuất chạy `/create-bug-report` cho các bug app đã thấy (xem [[book-anhtester]], [[crm-perfex]]) — user chưa yêu cầu.

## Bản đồ code nhanh
`README.md` mục 5 có cây thư mục đầy đủ — đọc ở đó, không chép lại. Điểm chính: fixture UI `src/fixtures/ui.fixture.ts` · API `api.fixture.ts` · CRM `crm.fixture.ts` · CMS `cms.fixture.ts`; metadata qua `tcMeta()` (`src/utils/allure-meta.ts`); dữ liệu unique qua `TestData`; dọn tài khoản qua `accountCleanup.track()`.

Liên quan: [[chay-test-da-trinh-duyet]] · [[book-anhtester]]
