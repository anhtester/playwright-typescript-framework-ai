---
name: book-anhtester
description: book.anhtester.com (Book Management — web + API + app) — câu trả lời "hỏi một lần" của user, prefix TC ID, quy tắc dữ liệu, bug đã biết
type: project
nguon: bộ nhớ project-book-anhtester-env (repo cha) · phiên 15-09, 29-09-2026
cap-nhat: 03-10-2026
---

# book.anhtester.com — hệ thống chính của framework

- **Web:** `https://book.anhtester.com` (`/sign-up`, `/sign-in`, `/book-management`). **API:** spec `https://book.anhtester.com/swagger/json` (Scalar UI ở `/swagger`), backend ElysiaJS, Bearer JWT + cookie `accessToken` / `refetchToken`.
- **App Android** cùng nghiệp vụ — xem [[appium-va-app-book]].
- Project Playwright: `ui` (UI) và `api` (API). Tài liệu ở repo cha namespace `docs/*/_book-api/` (module `auth`, `book`, `user`).

## Câu trả lời của user — KHÔNG hỏi lại (chốt 15-09-2026)
- **Môi trường dùng chung** (nhiều học viên) nhưng user **cho phép mọi thao tác, kể cả phá huỷ**. Vẫn **cấm** PATCH/DELETE bản ghi của người khác (luật BOLA trong `CLAUDE.md`) — chỉ đụng dữ liệu do chính test tạo.
- **Prefix TC ID:** tài liệu hiện tại dùng **`BK_`** → `BK_<MODULE>_TC_<nnn>` (vd `BK_AUTH_TC_059`). Bộ test mẫu ngày 15-09 dùng `BOOK_` (`BOOK_AUTH_*`, `BOOK_BOOK_*`) — mã cũ, cập nhật khi có TC chính thức. Web + API + mobile cùng nghiệp vụ **chung** module prefix (vd `AUTH`); TC mobile nối tiếp dải AUTH.
- Tài khoản demo đọc-only trong `.env` (`TEST_EMAIL` / `TEST_PASSWORD`). Test làm thay đổi tài khoản → **tự tạo tài khoản riêng**.

## Quy tắc dữ liệu trong code
- Email test: `auto_<spec>_w<worker>_<timestamp>_<random>@auto.test` qua `TestData`.
- Tài khoản tạo ra phải `accountCleanup.track()` (fixture `registeredUser` tự làm) → **tự xoá** sau test. Lần chạy 15-09: tạo 6 xoá đủ 6.
- BOLA/IDOR: dùng 2 tài khoản tự tạo `userA` / `userB`; **cấm** lấy id từ API danh sách rồi sửa/xoá.
- Mọi response API qua `expect(result).toMeetApiBaseline()`: SLA < `API_SLA_MS` · body JSON · không lộ `password` · không stack trace.

## Bug / hành vi lạ đã biết
Danh sách đầy đủ ở `README.md` mục 9 (9 điểm) — đọc ở đó. Tóm tắt nặng nhất:
- ⚠️ `POST /api/login` thiếu `email` → `400 "Invalid password."`; `POST /api/register` thiếu `email` → `422 "Email already exists."` — server lấy giá trị default `user@example.com` (F-19). **Chỉ ghi "cần Dev xác minh"**, không thử khai thác thêm.
- Token cũ vẫn dùng được sau logout · cookie `accessToken` thiếu `HttpOnly/Secure/SameSite` · `currentPrice` âm ở 228/753 sách · logout UI race (TC_019 `fixme`) · đã logout vẫn vào được `/book-management` · `/api/login` trả `Content-Type: text/plain`.

Liên quan: [[loi-da-gap-va-cach-sua]] · [[nguon-tai-lieu-o-repo-cha]] · [[evidence-va-khao-sat]]
