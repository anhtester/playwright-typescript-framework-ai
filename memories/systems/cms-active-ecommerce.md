---
name: cms-active-ecommerce
description: cms.anhtester.com (Active eCommerce CMS v7.1.0) — mới có CMS_LOGIN_TC_001, tài khoản là staff, 5 câu hỏi khám phá còn chờ user trả lời
type: project
nguon: phiên 01-10-2026 (aea3d997) của repo cha
cap-nhat: 03-10-2026
---

# Active eCommerce CMS — cms.anhtester.com

- **Active eCommerce CMS v7.1.0** — khác hẳn Perfex CRM → tài liệu để riêng namespace `docs/requirements/_cms/` (repo cha; có 1 ảnh `_discovery/evidence/dashboard_overview.png`).
- Project Playwright `cms`: `src/pages/cms/*`, `src/fixtures/cms.fixture.ts`, `src/tests/cms/login/cms-login.spec.ts`. Lệnh `npm run test:cms`.
- `CMS_LOGIN_TC_001` "Đăng nhập thành công bằng tài khoản quản trị hợp lệ" — PASS 2 lần (headed + headless) ngày 01-10-2026. Đăng nhập ở `/login`, vào `/admin`.
- Tài khoản `.env` `CMS_ADMIN_*` thực chất có vai trò **staff**, không phải super admin.

## Đang treo — 5 câu hỏi chờ user (01-10-2026)
Chưa ghi `README.md` / `system_map.md` cho `_cms` vì chờ trả lời:
1. Prefix TC ID `CMS_<MODULE>_TC_<nnn>` — đang dùng **tạm**.
2. Môi trường có dùng chung không? (chưa trả lời → mặc định **coi là dùng chung**: không tạo/sửa/xoá dữ liệu).
3. Năng lực QA: gọi API · truy vấn CSDL · xem nhật ký hoạt động?
4. Có tài khoản role khác (super admin, seller, customer)?
5. Cách gộp/tách 20 module đề xuất (`CATALOG` gộp 4 trang, `NEWS` gộp 2) — khảo sát module nào trước?

**How to apply:** user quay lại việc CMS → nhắc 5 câu này **một lần**, gom chung một tin. Đừng tự ghi tài liệu khám phá trước khi có trả lời.

## 20 module đề xuất (từ menu, chưa mở từng màn)
🔴 `LOGIN` · `POS` · `PROD` · `ORDER` · `SELLER` · `PAYOUT` · `COUPON` · `OFFPAY` — 🟡 `CATALOG` · `PKG` · `CUST` · `FLASH` · `TICK` · `CONV` · `REVIEW` — 🟢 `DASH` · `FILE` · `REP` · `BLOG` · `NEWS`. Website Setup / Setup & Configurations / Staffs-Roles / Addons trả **403** với staff → chưa đặt prefix. Storefront và khu seller/customer chưa trong phạm vi.

## Phát hiện nhạy cảm
Tài khoản staff mở được 2 trang thông tin hệ thống không có trong menu — **có thể là lỗ hổng phân quyền, cần Dev xác minh**. Chỉ ghi ở mức này, không mô tả chi tiết cách truy cập (xem [[evidence-va-khao-sat]] mục phát hiện bảo mật).

Liên quan: [[ban-giao-va-bao-cao]]
