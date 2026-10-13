---
name: loi-da-gap-va-cach-sua
description: Các lỗi test/flaky đã gặp khi xây framework, root cause đã chứng minh và cách sửa — tra trước khi debug lại từ đầu
type: project
nguon: phiên 10-09, 15-09, 24-09, 01-10-2026 của repo cha
cap-nhat: 08-10-2026 (thêm #8 — networkidle treo Firefox)
---

# Lỗi đã gặp & cách sửa

| # | Triệu chứng | Root cause (đã chứng minh) | Cách sửa đang có trong code |
|---|---|---|---|
| 1 | **Firefox headed** treo khi click, 7 test timeout (01-10-2026) | Windows: cửa sổ Firefox bị cửa sổ khác che → bị coi là ẩn, ngừng vẽ. 5 cửa sổ song song luôn chồng nhau. Chromium đã được Playwright tắt sẵn cơ chế này | `firefoxUserPrefs: { 'widget.windows.window_occlusion_tracking.enabled': false }` trong `playwright.config.ts`. Sau sửa: 19/19 PASS |
| 2 | Lần chạy Firefox **đầu tiên sau khi cài**: 5 test CRM fail lúc đóng trình duyệt | Lỗi nội bộ một lần của Firefox — nội dung test vẫn PASS, chạy lại 4 lần không tái hiện | Không sửa code. Gặp lại → chạy lại trước khi kết luận |
| 3 | `CRM_LOGIN_TC_007` biến thể `b` fail (lần đầu chạy Edge, 24-09-2026), trình duyệt crash | Test đăng xuất khi Dashboard còn gọi AJAX → lần đăng nhập sau rơi vào `/admin/tasks/table` (JSON thô). Đo: đăng xuất ngay lệch 2/4, đợi tải xong 0/4. Chromium cũng dính | `CrmDashboardPage.waitUntilDataLoaded()` gọi trước khi đăng xuất (từ 08-10-2026 chờ response `tasks/table` thay cho `networkidle` — xem #8). **Có thể là bug app** (người dùng thật cũng gặp) — chưa lập bug report |
| 4 | `BOOK_AUTH_TC_019` đăng xuất không về `/sign-in` 3–4/10 lần khi chạy 5 luồng (15-09-2026) | **Race condition phía app** — gọi lại `/api/me` (401) + `/api/refetch-token` (422) rồi ở lại Dashboard. 1 luồng: 10/10 đúng | `test.fixme` + tag `@known-issue` ở `src/tests/ui/auth/sign-in.spec.ts`, **giữ nguyên assertion**. Đây là test SKIP duy nhất trong mỗi lượt UI. Bỏ `.fixme` khi dev sửa |
| 5 | CRM login TC_005 fail lần đầu (10-09-2026) | Agent **đoán** ô Email có HTML5 `required` — DOM thật không có; server trả 2 alert *"The Email Address field is required."* + *"The Password field is required."* | Assertion viết theo hành vi thật. **Bài học: không đoán thuộc tính DOM** |
| 6 | Playwright báo `"deviceScaleFactor" option is not supported with null "viewport"` (27-08-2026, bản rất cũ) | Đặt `viewport: null` (full màn hình) mà vẫn spread `devices[...]` có `deviceScaleFactor` | Đặt viewport tường minh **sau** spread `devices[...]` (đang làm vậy trong config) |
| 7 | `--workers=6` headed bị "đứng đơ một trình duyệt" (27-08-2026, bản cũ) | Nhiều cửa sổ headed chồng nhau (cùng gốc với #1) | Xem #1; mặc định 5 luồng |
| 8 | **`CRM_LOGIN_TC_007` fail trên Firefox headed** — `page.waitForLoadState: Timeout 30000ms` ở step "Đợi Dashboard tải xong dữ liệu" (08-10-2026). Đo: **4/15 lần fail (27%)**, luôn đúng bước đó, rải ngẫu nhiên các biến thể | `waitForLoadState('networkidle')` **cần sự kiện `load`**, mà Firefox đôi khi **không bắn `load`** trên Dashboard CRM (trang nạp thêm script Google bên thứ ba) dù mọi request của CRM đã xong và ảnh chụp cho thấy trang vẽ đủ. Chứng minh qua trace: lần fail **không có** dòng `"load" event fired`. Không tái hiện được ngoài test (headless 68 lần + headed 50 lần đều sạch) → phụ thuộc điều kiện Firefox headed trong luồng test | `CrmDashboardPage.waitUntilDataLoaded()` **không dùng `networkidle`** nữa: đăng ký `page.waitForResponse` cho `POST /admin/tasks/table` ngay khi trang điều hướng tới `/admin/` (`framenavigated`) rồi chờ kết quả — không bỏ lỡ response dù gọi muộn. Sau sửa: **20/20 PASS** Firefox. Giả định: tài khoản có widget "My Tasks" (Admin, PM có) |
| 9 | `CRM_LOGIN_TC_011` biến thể `d` (toàn khoảng trắng) **fail ổn định trên Firefox**, Chrome PASS (08-10-2026). Firefox: 0 dải lỗi, ở nguyên trang | **KHÔNG phải flaky** — khác biệt hành vi trình duyệt, đo 3/3 mỗi bên. Ô Email `type=email`: Chrome làm sạch `"   "` thành rỗng → hợp lệ → gửi POST → server trả 2 dải *required*. Firefox cũng làm sạch thành rỗng nhưng vẫn báo `typeMismatch` ("Please enter an email address.") → chặn biểu mẫu tại trình duyệt, không gửi POST | **Chưa sửa, chờ user chọn**: (a) biến thể `d` kỳ vọng theo trình duyệt (Firefox: ô Email `:invalid` + không POST), (b) chỉ chạy `d` trên Chromium kèm ghi chú. Không hạ assertion Chrome. Chưa từng chạy Firefox trước 08-10 vì TC_011 sinh 03-10 |

## Luật rút ra — áp cho MỌI test mới (đặc biệt Firefox)
- 🚫 **Không dùng `waitForLoadState('networkidle')` / `'load'`** làm điều kiện "đã sẵn sàng" trên trang CRM (và mọi trang có script/font bên thứ ba). Chờ **tín hiệu của chính việc cần**: `waitForResponse` của đúng endpoint, hoặc `expect(locator)` trên phần tử cuối cùng xuất hiện.
- `waitForResponse` phải **đăng ký trước khi request phát sinh** (ở `framenavigated` hoặc trước hành động bấm) — đăng ký sau là race, chính là loại lỗi cần tránh.
- Test fail trên **một trình duyệt, tỉ lệ ~25%, cùng một bước** → nghi sự kiện trình duyệt (`load`/`networkidle`) trước khi nghi locator hay app. Cách chẩn đoán nhanh: `--repeat-each=15 --retries=0`, mở `trace.zip` → đọc log của bước fail xem có dòng `"load" event fired` không.
- Verify flaky = **`--repeat-each=20 --retries=0`**, không dùng 3 lần liên tiếp (lỗi 27% mà chạy 3 lần thì xác suất cả 3 đều xanh còn ~39% → dễ báo xanh giả; lần chạy đầu ngày 08-10 chỉ may mắn bắt được 1/3).
- Đo baseline **trước** khi sửa để có con số so sánh (11/15 → 20/20).

## Nguyên tắc khi gặp test đỏ do app
- **Không hạ assertion** để né bug. Cách ly bằng `test.fixme` / tag `@known-bug` · `@known-issue` · `@needs-verify`, ghi lý do ở comment + README mục 9.
- Test API phơi bug hiện có: `BK_AUTH_TC_062 · 068-d · 075 · 080` — **dự kiến FAIL**. Chạy riêng: `--grep "@known-bug|10.000 ký tự không gây"`.
- Đề xuất `/create-bug-report` thay vì tự lập bug khi user chưa yêu cầu.

Liên quan: [[chay-test-da-trinh-duyet]] · [[book-anhtester]] · [[crm-perfex]]
