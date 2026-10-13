---
name: nguon-tai-lieu-o-repo-cha
description: docs/ của repo này gần như trống — requirements, test cases, review, bug thật nằm ở docs/ của repo cha course-ai-test-automation
type: reference
nguon: kiểm thư mục 03-10-2026 · phiên 24-09, 29-09-2026 repo cha
cap-nhat: 03-10-2026
---

# Tài liệu nguồn nằm ở repo cha

`docs/` của repo này **đã có** `testcases/login/` (index + `web/test_cases_login_web.md` + `impact/`, `review/`) — kiểm lại 03-10-2026; chưa có `requirements/`. Module khác vẫn chỉ có ở repo cha. Tài liệu thật ở **`D:\AI_Testing_Automation_Course\course-ai-test-automation\docs\`**:

| Hệ thống | Tài liệu | File TC đã dùng sinh automation |
|---|---|---|
| Perfex CRM | `requirements/README.md` (danh mục 23 module, prefix `CRM_`) · `requirements/login/`, `customers/`, `projects/` · `testcases/login/`, `customers/`, `projects/` | `testcases/login/web/test_cases_login_web.md` → `CRM_LOGIN_TC_001→010` |
| book.anhtester.com | namespace `_book-api/` — module `auth`, `book`, `user` (requirements + testcases web/mobile/api) | `testcases/_book-api/auth/api/parts/part_01_api_dang_ky_dang_nhap.md` → `register-login.api.spec.ts` (25 TC · 50 test) |
| CMS | `requirements/_cms/_discovery/` (mới 1 ảnh, chưa có danh mục) | — |
| Khác | `_slope/`, `_discovery/` | — |

File TC book còn chưa làm automation (web/API): `auth/web/parts/part_01_web_dang_nhap.md` · `part_02_web_dang_ky.md` · `part_03_web_ho_so.md` · `auth/api/parts/part_02_api_phien_ho_so.md` (cần `user-profile.schema.json`).

**How to apply:**
- User đưa đường dẫn dạng `docs\testcases\...` → hiểu là **của repo cha** nếu không tồn tại ở repo này; xác nhận bằng cách kiểm file, không hỏi user.
- Cùng lúc vẫn theo quy tắc `CLAUDE.md` mục 6b: đọc danh mục `README.md` trước, chỉ mở đúng file module cần.
- Tài liệu mới sinh ra → ghi vào `docs/` **repo này** (user chốt 13-10-2026 khi lập RTM LOGIN: *"lưu vào repo, thư mục docs"*). RTM đặt cạnh bộ TC: `docs/testcases/<module>/traceability_matrix.md` + bản HTML `traceability_matrix.html` để gửi báo cáo. REQ vẫn đọc từ repo cha.
- Trong `docs/` không ghi giá trị bí mật thật.

Liên quan: [[nguon-goc-va-lich-su]] · [[quy-tac-viet-tc]]
