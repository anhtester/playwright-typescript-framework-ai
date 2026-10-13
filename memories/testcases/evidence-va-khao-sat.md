---
name: evidence-va-khao-sat
description: Khảo sát hệ thống và evidence — mở hết ảnh trước khi sinh TC, chụp xong phải mở lại, AMB tự chốt bằng giả định, phát hiện bảo mật chỉ ghi "cần Dev xác minh"
type: feedback
nguon: claude-testing-skills (evidence-must-be-read-before-generating-tc, feedback_ambiguity-close-by-assumption-and-sensitive-findings)
cap-nhat: 03-10-2026
---

# Evidence & khảo sát

## 1. Mở hết ảnh evidence trước khi sinh TC
Sinh TC từ requirements → **Read từng ảnh** trong `evidence/` của module trước khi viết dòng TC đầu tiên. Xung đột tài liệu ↔ ảnh → **ảnh thắng**, ghi ASM và báo user. Vùng không có ảnh chống lưng → tag `@NeedsVerify`.

**Why:** 05-08-2026 sinh 152 TC module Projects chỉ từ markdown, không mở 4 ảnh có sẵn → sai tab mặc định, bỏ sót 8 checkbox disabled, sai định dạng tiền tệ, sai thứ tự Tab. User phát hiện, không phải agent.

## 2. Chụp xong phải mở lại ảnh
Thao tác mở dropdown/tab có thể thất bại âm thầm. Đã gặp: ảnh khai "menu đang mở" nhưng chụp lúc menu đóng, tồn tại 4 ngày không ai thấy. Chụp theo **từng trạng thái động** (dropdown mở, sau khi đổi giá trị, form sau submit lỗi). Phạm vi chụp: không cắt cụt đối tượng cần chứng minh, nhưng widget nằm trọn viewport thì chụp viewport (tránh kéo dữ liệu khách hàng vào ảnh bị commit).

## 3. AMB còn treo → tự chốt bằng giả định
Đây là môi trường demo/dạy học, không có PO thật. Sinh REQ xong còn AMB → **tự chốt bằng câu trả lời giả định** (ghi nguồn quyết định dạng `DEMO-AMB-<ddmm><x>`), rồi **chỉnh luôn bộ TC** (neo lại REQ, đổi kỳ vọng, thêm TC `@KnownBug` nếu hành vi hiện tại lệch) — không dừng lại hỏi PO, không hạ assertion. Ghi Nhật ký + danh sách "TC cần xử lý". Lan sang module khác → mở AMB ở module đó.

## 4. Phát hiện bảo mật nghiêm trọng
Chỉ ghi ở mức **"cần Dev xác minh"** — **không** mô tả kỹ thuật khai thác / cách dò trong docs, TC hay câu trả lời (lần đầu viết chi tiết đã bị bộ lọc an toàn chặn phản hồi giữa chừng). TC chỉ kiểm status, không đọc/ghi nội dung nhạy cảm. Áp cho F-19 của book và lỗ phân quyền nghi ngờ của CMS.

Liên quan: [[viewport-va-playwright-mcp]] (chụp mức OS, MCP cwd) · [[quy-tac-viet-tc]] · [[ho-so-va-giao-tiep]] (gom bước tester làm)
