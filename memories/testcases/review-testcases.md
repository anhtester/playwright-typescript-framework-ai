---
name: review-testcases
description: /review-testcases chỉ chấm dòng TC trước thực thi; tên mode AUTOMATION ở repo này đã đổi thành AUTO ở repo cha; quyết định user ở lần chấm AUTOMATION 29-09-2026
type: feedback
nguon: course-ai-test-manual (review-testcases-scope) · phiên 29-09, 01-10-2026 repo cha
cap-nhat: 03-10-2026
---

# /review-testcases

## Phạm vi — chỉ chấm bản thân dòng TC
Mode REVIEW/FIX chỉ chấm các dòng TC trong file nền tảng / parts. **Không** đưa vào báo cáo: dữ liệu execution (`docs/executions/`, run_*), bug report (`docs/bugs/`), nội dung file index `TEST_CASES_<MODULE>_SUMMARY.md` (Assumptions, bảng đối soát, Nhật ký…).

**Why:** user dùng review để chuẩn hoá bộ TC **trước** khi thực thi; họ chủ động xoá bằng chứng thực thi cũ để chạy lại (23-09-2026) — thiếu execution/bug là cố ý.

**How to apply:** bỏ bước "Đối chiếu kết quả chạy"; không báo "evidence đã mất", không đề xuất `@NeedsVerify` vì thiếu run. Đối soát 4 vòng tự lập từ dòng TC + requirements.

## Tên mode chấm automation
- Repo **này**: mode tên **`AUTOMATION`** (trong `CLAUDE.md` và `.claude/`).
- Repo cha: user yêu cầu đổi thành **`AUTO`** ngày 01-10-2026 — repo này **chưa** mang thay đổi đó. User gõ `AUTO` thì hiểu là mode AUTOMATION; hỏi user có muốn đổi tên đồng bộ không nếu đụng tới.

## Quyết định user ở lượt chấm AUTOMATION (29-09-2026, bộ AUTH book)
Chấm 3 file: `auth/web/parts/part_01_web_dang_nhap.md`, `auth/mobile/parts/part_01_mobile_dang_nhap.md`, `auth/api/parts/part_01_api_dang_ky_dang_nhap.md`. User chốt: `TC_136` từ **Partial → Yes**, chấp nhận các đề xuất còn lại, yêu cầu **ghi dòng Nhật ký thay đổi**. Chỗ đặt các case "không nên làm automation": file `review/automation_review_<nền-tảng>_<YYYYMMDD>.md` theo `CLAUDE.md` mục 6b.

Liên quan: [[quy-tac-viet-tc]]
