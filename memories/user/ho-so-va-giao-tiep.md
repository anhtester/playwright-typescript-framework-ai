---
name: ho-so-va-giao-tiep
description: Người dùng là ai và muốn được giao tiếp thế nào — Tiếng Việt, ngắn gọn, không bắt ngồi canh từng bước
type: user
nguon: course-ai-test-automation (feedback-language) · claude-testing-skills (batch-tester-steps)
cap-nhat: 03-10-2026
---

# Hồ sơ người dùng & cách giao tiếp

## Người dùng
- **Anh Tester** — giảng viên / người xây khoá học *AI Testing Automation* (repo cha `D:\AI_Testing_Automation_Course\course-ai-test-automation`) và bộ skills `.claude/` dùng lại cho nhiều dự án.
- Thành thạo QA automation (Playwright TS, Selenium Java, Appium, API). Hệ thống test là các site demo của Anh Tester: `book.anhtester.com`, `crm.anhtester.com`, `cms.anhtester.com`.
- Repo này là **framework mẫu cho khoá học** — giữ code sạch, đúng chuẩn, dễ cho học viên đọc.

## Ngôn ngữ báo cáo — Tiếng Việt
Mọi tin nhắn báo tiến độ, tóm tắt, kết quả viết **Tiếng Việt**, ngắn gọn, rõ ràng. Code, đường dẫn, commit message, định danh kỹ thuật giữ nguyên tiếng Anh.

**Why:** user yêu cầu trực tiếp ngày 03-09-2026 ("trả lời bằng tiếng Việt trong quá trình báo cáo task sau này"); `CLAUDE.md` mục 1 cũng ghi.

## Không bắt user ngồi canh từng bước
Bước agent không được tự làm (gõ mật khẩu trên hệ thống thật, tạo tài khoản ngoài localhost…) → **gom thành 1 kịch bản** làm một lèo, không hỏi kiểu "làm 1a rồi nhắn", "làm 1b rồi nhắn".

**Why:** 26-09-2026 khi khảo sát app Android, agent hỏi từng bước → user bực: *"tôi mắc ngồi canh bạn làm hả"*.

**How to apply:**
1. Tự làm hết phần không cần tới bước đó trước.
2. Phần còn lại ghi trạng thái ❔ kèm lý do.
3. Cuối đợt đưa **một** kịch bản ~5 phút (giá trị cụ thể, thứ tự thao tác), bật quay màn hình chạy nền (`adb screenrecord` / quay màn hình), user làm xong báo "xong" → agent tự đọc kết quả.
4. Nói giới hạn an toàn **một lần**, ngắn gọn, không tranh luận lại.

> Lưu ý: `CLAUDE.md` cho phép đọc `.env` để lấy tài khoản test khi chạy automation — dùng cách đó trước khi nghĩ tới việc nhờ user.

## Hỏi ít, tự quyết nhiều
- Câu hỏi "một lần" (môi trường dùng chung, prefix TC ID, năng lực QA) đã có câu trả lời trong `systems/*.md` → **không hỏi lại**.
- Chỉ hỏi khi gặp business rule mâu thuẫn hoặc quyết định thật sự thuộc về user.

## Giá trị trong `.env` chỉ là mặc định — agent tự chỉnh cho khớp test case
User (03-10-2026): *"Từ đây về sau bạn hãy tự chỉnh CRM_TC014_PASSWORD cho phù hợp test cases, tôi chỉ đưa ra giá trị mặc định thôi. Những trường hợp khác tương tự."*

**Why:** user không muốn bị hỏi lại từng biến; dữ liệu user điền vào `.env` có thể là placeholder, không phải giá trị đã kiểm.

**How to apply:**
1. Trước khi chạy TC cần tài khoản/biến đặc thù → **tự kiểm** giá trị `.env` có đạt tiền đề của TC không (vd mật khẩu có chữ cái, tài khoản đăng nhập được), chỉ in hình thái, không in giá trị.
2. Phần chỉnh được trong code/`.env` mà **không** đổi gì trên hệ thống thật (dữ liệu sinh động, chọn tài khoản khác đã có, tên biến, guard tiền đề) → tự làm, không hỏi.
3. Trong test, thêm bước Arrange **chứng minh tiền đề** (vd đăng nhập thử bằng đúng mật khẩu) để dữ liệu sai không sinh PASS giả. Tiền đề không đạt thì test đỏ với message `Tiền đề: …`, không SKIP che đi.
4. Giá trị phải khớp với tài khoản **thật** trên hệ thống (mật khẩu, tạo/sửa tài khoản) → agent không được nhập mật khẩu hay đổi tài khoản trên host không phải localhost. Gom thành **1 kịch bản ngắn** cho user làm một lèo; giới hạn này chỉ nói 1 lần.

Liên quan: [[ban-giao-va-bao-cao]]
