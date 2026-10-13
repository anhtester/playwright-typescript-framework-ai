---
name: ban-giao-va-bao-cao
description: Cách kết thúc một tác vụ — báo cáo chat, báo cáo Slack #project-crm, nhắc commit/push, file bàn giao để trong repo
type: feedback
nguon: course-ai-test-automation (feedback-slack-delivery-report, CLAUDE.md repo cha) · claude-ai-testing (deliverables-into-repo)
cap-nhat: 03-10-2026
---

# Bàn giao & báo cáo

## 1. Báo cáo trong chat (luôn có)
Theo Definition of Done của `CLAUDE.md`: số test **PASS / FAIL / SKIP**, TC nào đã làm / bỏ qua (kèm lý do), known issues, việc cần làm tiếp. Lệnh chạy đưa trong khối ```bash riêng, mỗi khối 1 lệnh.

## 2. Báo cáo bàn giao sang Slack `#project-crm`
Sau báo cáo chat, **soạn báo cáo bàn giao gửi Slack** kênh `#project-crm` (channel id `C0BSZTW5NFQ`, workspace `anhtesterautomation`) → đưa bản nháp cho user duyệt → user "ok" mới gửi.

- Nội dung: yêu cầu · kết quả PASS/FAIL/SKIP (bảng) · thay đổi chính · lỗi đã xử lý · việc cần làm tiếp. Ngày `DD-MM-YYYY`.
- 🔒 **Không** đưa email/mật khẩu/token vào tin nhắn.
- Kết nối: plugin `slack-by-salesforce` có thể báo "cần đăng nhập" nhưng **có một connector Slack khác đã đăng nhập sẵn** (01-10-2026 gửi thành công qua connector đó) — thử tìm tool Slack khác trước khi báo user không gửi được.

**Why:** 01-10-2026 agent quên bước này, user phải hỏi lại *"tại sao bạn không báo cáo cho tôi bên Slack"*. Quy tắc nằm trong `CLAUDE.md` của **repo cha** (mục "Báo cáo kết quả bàn giao sang Slack").

**How to apply:** ⚠️ `CLAUDE.md` của **repo này chưa có** mục Slack (đã kiểm 03-10-2026). Vẫn coi là bước cuối của bàn giao: kết thúc mỗi tác vụ automation bằng câu hỏi ngắn kèm bản nháp *"Gửi bản này lên #project-crm nhé?"* — gửi là hành động ra ngoài nên **luôn chờ user đồng ý**.

## 3. Nhắc commit & push
Sau mỗi thay đổi, **nhắc user commit và push** (CLAUDE.md repo cha ghi rõ). Agent **không** tự chạy lệnh git làm đổi trạng thái code (`pull`, `checkout`, `merge`, `rebase`, `reset`) — chỉ được `status` / `diff` / `log`. Nhắc thêm: **không commit `.env`**.

## 4. File bàn giao phải nằm trong repo
Tài liệu, báo cáo, file sinh ra cho user → lưu **trong repo** (thư mục phù hợp: `docs/…`, `reports/…`), không để mỗi ở scratchpad `AppData\Local\Temp\claude\...`.

**Why:** user từng không tìm thấy file docx đã sinh trong scratchpad và phải nhờ chuyển vào repo (repo `claude-ai-testing`, 24-08-2026).

**How to apply:** scratchpad chỉ dùng cho file trung gian (script tạm, log). Sản phẩm cuối luôn chép vào repo rồi mới báo.

## 5. Phạm vi "chỉ cần chạy pass 1 lần"
User đôi khi nói rõ *"chỉ cần chạy pass 1 lần là báo cáo"* (24-09-2026, CRM_LOGIN_TC_001→010) — khi đó làm theo lời user, không ép đủ 2 lần như DoD. Không nói gì thì theo `CLAUDE.md` repo này: **PASS 2 lần liên tiếp headed**.

Liên quan: [[ho-so-va-giao-tiep]] · [[chay-test-da-trinh-duyet]]
