---
name: crm-perfex
description: crm.anhtester.com (Perfex CRM) — môi trường demo dùng chung, cấm phá huỷ, prefix CRM_, các hành vi bất ngờ đã phát hiện
type: project
nguon: claude-testing-skills (crm-demo-shared-environment, crm-demo-no-public-homepage) · docs/requirements/README.md repo cha · phiên 10-09, 24-09-2026
cap-nhat: 03-10-2026 (bổ sung sau phiên TC_011→020)
---

# Perfex CRM — crm.anhtester.com

- Project Playwright `crm` (`src/tests/crm/`, `src/pages/crm/`, `src/fixtures/crm.fixture.ts`). Hiện có `CRM_LOGIN_TC_001→020` (011→020 sinh 03-10-2026 từ `docs/testcases/login/web/test_cases_login_web.md` — file này **đã có trong repo này**).
- **Prefix TC ID:** `CRM_<MODULE>_TC_<3 số>` (ghi trong `docs/requirements/README.md` repo cha).
- Tài khoản trong `.env`: Admin (`CRM_ADMIN_*`) và Project Manager (`CRM_PM_*` — bộ menu rút gọn, dùng cho TC_006). Tuỳ chọn: `CRM_CUSTOMER_*` (TC_019, 020 — đã cấp 03-10-2026) · `CRM_TC014_*` staff cho TC_014 — giá trị hiện tại (03-10-2026) **không đăng nhập được** và mật khẩu toàn số → TC_014 đỏ ở bước tiền đề cho tới khi user tạo staff test có mật khẩu chứa chữ cái. Thiếu biến thì test cũng tự skip. Hệ thống có 3 vai trò: Admin + PM đăng nhập `/admin/authentication`; Customer đăng nhập `/login` (cổng tách biệt).

## Môi trường demo công khai, NHIỀU người dùng chung
**Why:** dữ liệu người khác nằm lẫn (bản ghi rác `Project_Auto_Company_*`); thao tác phá huỷ ảnh hưởng người khác hoặc khoá tài khoản demo chung.

**How to apply:**
- Dữ liệu tạo ra phải traceable (`Auto_<entity>_<timestamp>`) và **xoá sạch sau khi xong**; đối chiếu số liệu tổng trước/sau.
- **Không** Mass Delete, không xoá bản ghi không do mình tạo.
- Test brute-force / lockout: ưu tiên **email không tồn tại**. Ngoại lệ: `CRM_LOGIN_TC_015` biến thể `a` gửi sai 6 lần với admin demo — được phép vì `REQ-LOGIN-41` / `AMB-LOGIN-02` ✅ đã chốt hệ thống **không có** khoá tài khoản (ghi chú đầu Nhóm C của file TC).
- Cần kiểm nhánh phá huỷ → đề xuất user cấp môi trường riêng.

## Năng lực QA (chốt 11-09-2026)
Gọi API ❌ · truy vấn CSDL ❌ · kiểm tích hợp ❌ · Activity Log ❌ (Admin demo bị từ chối) · DevTools ✅ (cho TC `@TechCheck`).

## Hành vi bất ngờ đã thấy
- Root `https://crm.anhtester.com/` **không** có trang chủ công khai — redirect sang `/authentication/login` (cổng khách hàng). Logo trang admin login dẫn về đó.
- Form quên mật khẩu `/admin/authentication/forgot_password` submit **AJAX** → ô Email **không** tự reset sau lỗi (khác trang login).
- Ô Email login là `type=email` (không `required`) → email sai định dạng bị trình duyệt chặn, không gửi POST; toàn khoảng trắng: Chrome cắt thành rỗng nên vẫn gửi, **Firefox chặn không gửi** (typeMismatch — đo 08-10-2026, xem [[loi-da-gap-va-cach-sua]] #9). Đăng nhập sai: POST `303` → GET `200` kèm `.alert-danger`, ô Email **rỗng** (bug `AMB-LOGIN-10`, TC_016 `@known-bug` dự kiến FAIL).
- Cổng khách hàng `/login`: sau đăng nhập dừng ở `/`, **tiêu đề tab = tên công ty của khách hàng đang đăng nhập** (tài khoản `.env` hiện tại ra `Customer Example`, tài liệu REQ ghi `HKD Anh Tester` của tài khoản lúc khảo sát) → không assert tiêu đề, chấm theo heading `Good Morning/Afternoon/Evening …`. Trang đăng nhập: tab `Please login`, nhãn `Email Address`/`Password`, nút `Login` (đã verify 03-10-2026).
- Bỏ trống form login → **không** có HTML5 `required`; server trả 2 alert *"The Email Address field is required."* + *"The Password field is required."*.
- Đăng xuất khi Dashboard còn tải AJAX → lần đăng nhập sau rơi vào `/admin/tasks/table` (JSON thô, có thể crash) — test phải `waitUntilDataLoaded()` trước khi đăng xuất (chờ response `POST /admin/tasks/table`; **KHÔNG** dùng `networkidle` — Firefox không bắn `load` trên Dashboard, fail 27%, xem [[loi-da-gap-va-cach-sua]] #8). Nghi bug app, chưa lập bug.
- Locator đã verify (10-09-2026): Email `getByLabel('Email Address')` · nút `getByRole('button', { name: 'Login' })` · lỗi `.alert-danger` · menu `#side-menu` · sau login URL `/admin/`, title `Dashboard`. **Verify lại trên DOM trước khi dùng.**

Liên quan: [[loi-da-gap-va-cach-sua]] · [[nguon-tai-lieu-o-repo-cha]]
