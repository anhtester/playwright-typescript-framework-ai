# Ma Trận Truy Vết (RTM) — Perfex CRM · Module `LOGIN` · Web

| Thông tin | Nội dung |
|---|---|
| **Hệ thống** | Perfex CRM — `crm.anhtester.com` (khu quản trị `/admin`) |
| **Module** | Đăng nhập / Xác thực — prefix `LOGIN` · TC ID `CRM_LOGIN_TC_<3 số>` |
| **Ngày lập** | 13-10-2026 |
| **Nguồn Requirements** | Repo cha `course-ai-test-automation/docs/requirements/login/REQUIREMENTS_LOGIN_SUMMARY.md` → theo `## Bản đồ tài liệu` sang `web/requirements_login_web.md` — **44 REQ** (`REQ-LOGIN-01` → `44`) |
| **Nguồn Test cases** | [TEST_CASES_LOGIN_SUMMARY.md](TEST_CASES_LOGIN_SUMMARY.md) → [web/test_cases_login_web.md](web/test_cases_login_web.md) — **51 TC** (`CRM_LOGIN_TC_001` → `051`). Bản ở repo cha khác bản này **duy nhất** tên biến `.env` của TC_014 (`TC014_*` → `CRM_TC014_*`) — nội dung TC và mapping REQ giống hệt |
| **Nguồn Automation** | Quét code thật: [`src/tests/crm/login/crm-login.spec.ts`](../../../src/tests/crm/login/crm-login.spec.ts) — **20 test**, mỗi test khai `testId` qua `allure.label` |
| **Cách map** | REQ ↔ TC: cột `REQ ID` của file TC · TC ↔ Script: `testId: 'CRM_LOGIN_TC_xxx'` trong annotation. **100% map bằng ID** — không có mapping suy luận nào được tính vào số liệu |
| **Nền tảng** | Web — mọi REQ và mọi TC chỉ áp web |

> Cột `Automation` (Yes/Partial/No) trong file TC là **dự định** lúc viết TC. RTM này đếm theo **script thật đang có trong repo**, không theo cột đó.

---

## ⬛ Module chưa có tài liệu — nằm ngoài phạm vi RTM

> ⚠️ **Đọc mục này trước mọi con số bên dưới.** RTM chỉ tính trên module `LOGIN`. Theo danh mục `docs/requirements/README.md` (repo cha), hệ thống có **23 module** — mới **3** module có tài liệu (`LOGIN`, `CUST`, `PRJ`), **20** module chưa khảo sát nên **không có REQ nào** để "chưa cover". Requirement Coverage 100% bên dưới **chỉ đúng cho module Đăng nhập**, không nói gì về độ phủ của Perfex CRM.

| Module | Prefix | Trạng thái recon |
|---|---|---|
| Liên hệ khách hàng | `CONT` | ⬜ Chưa khảo sát |
| Khách hàng tiềm năng | `LEAD` | ⬜ Chưa khảo sát |
| Công việc | `TASK` | ⬜ Chưa khảo sát — đang giữ phần kiểm chứng đầu-cuối của `REQ-LOGIN-30` (`AMB-LOGIN-14`) |
| Báo giá sơ bộ | `EST` | ⬜ Chưa khảo sát |
| Đề xuất | `PROP` | ⬜ Chưa khảo sát |
| Hoá đơn | `INV` | ⬜ Chưa khảo sát |
| Thanh toán | `PAY` | ⬜ Chưa khảo sát |
| Giấy báo có | `CN` | ⬜ Chưa khảo sát |
| Đăng ký định kỳ | `SUB` | ⬜ Chưa khảo sát |
| Hợp đồng | `CTR` | ⬜ Chưa khảo sát |
| Chi phí | `EXP` | ⬜ Chưa khảo sát |
| Danh mục hàng hoá/dịch vụ | `ITEM` | ⬜ Chưa khảo sát |
| Hỗ trợ (Tickets) | `TICK` | ⬜ Chưa khảo sát |
| Yêu cầu báo giá | `ESTREQ` | ⬜ Chưa khảo sát |
| Cơ sở tri thức | `KB` | ⬜ Chưa khảo sát |
| Báo cáo | `REP` | ⬜ Chưa khảo sát |
| Dashboard | `DASH` | ⬜ Chưa khảo sát |
| Việc cần làm | `TODO` | ⬜ Chưa khảo sát |
| Nhắc nhở | `REM` | ⬜ Chưa khảo sát |
| Hồ sơ cá nhân & Chấm công | `PROF` | ⬜ Chưa khảo sát |

---

## Tổng quan Coverage

| Metric | Giá trị | Ghi chú |
|---|---|---|
| **Requirement Coverage** | **40/40 (100%)** REQ trong phạm vi | 4 REQ `27`, `34`, `35`, `40` ra ngoài phạm vi theo quyết định PO 18-08-2026 — tính trên cả 44 REQ là 40/44 (90,9%) |
| **Platform Coverage** | **40/40 (100%)** cặp REQ × Web | Module chỉ có nền tảng web |
| **Automation Coverage** | **20/51 TC (39,2%)** | Trên 48 TC file TC đánh giá automate được (`Yes`/`Partial`): **20/48 (41,7%)**. 3 TC `No`: `026`, `051`, `044` |
| **REQ đã automate** | ✅ 16 · 🟣 5 một phần · 🟡 19 chỉ chạy tay | Tính trên 40 REQ trong phạm vi |
| **Orphan Tests** | **0** | 20/20 test đều mang `testId` khớp một TC trong file TC |
| **TC `@Deprecated`** | **0** | Không có TC nào bị gỡ |

**Automation theo Priority của TC:**

| Priority | Đã có script | Tổng TC | Tỷ lệ |
|---|---|---|---|
| Critical | 6 | 10 | 60% |
| High | 9 | 18 | 50% |
| Medium | 4 | 19 | 21% |
| Low | 1 | 4 | 25% |
| **Tổng** | **20** | **51** | **39,2%** |

> Nhận xét: phần đã automate là **trọn Nhóm A–C** của file TC (`001`→`020` — giao diện, đăng nhập thành công, validation & thất bại). Toàn bộ **Nhóm D trở đi** (`021`→`051` — bảo vệ phiên, CSRF, Quên mật khẩu, Đăng xuất, phi chức năng) **chưa có script nào**, trong đó còn **4 TC Critical**.

---

## Ma trận chi tiết

| REQ ID | Mô tả ngắn | TC IDs | Automation | Trạng thái |
|---|---|---|---|---|
| REQ-LOGIN-01 | Truy cập trang đăng nhập | CRM_LOGIN_TC_001 | crm-login.spec.ts (1/1) | ✅ Full |
| REQ-LOGIN-02 | Thành phần biểu mẫu đăng nhập | CRM_LOGIN_TC_002, CRM_LOGIN_TC_038, CRM_LOGIN_TC_042, CRM_LOGIN_TC_043, CRM_LOGIN_TC_044, CRM_LOGIN_TC_048, CRM_LOGIN_TC_049, CRM_LOGIN_TC_050 | crm-login.spec.ts (1/8) | 🟣 Automate một phần |
| REQ-LOGIN-03 | Tự động đặt con trỏ vào ô Email | CRM_LOGIN_TC_002 | crm-login.spec.ts (1/1) | ✅ Full |
| REQ-LOGIN-04 | Logo dẫn về trang chủ | CRM_LOGIN_TC_004 | crm-login.spec.ts (1/1) | ✅ Full |
| REQ-LOGIN-05 | Không có CAPTCHA | CRM_LOGIN_TC_003 | crm-login.spec.ts (1/1) | ✅ Full |
| REQ-LOGIN-06 | Đăng nhập bằng thông tin hợp lệ | CRM_LOGIN_TC_005, CRM_LOGIN_TC_006, CRM_LOGIN_TC_010, CRM_LOGIN_TC_041, CRM_LOGIN_TC_050 | crm-login.spec.ts (3/5) | 🟣 Automate một phần |
| REQ-LOGIN-07 | Email không phân biệt hoa thường | CRM_LOGIN_TC_007 | crm-login.spec.ts (1/1) | ✅ Full |
| REQ-LOGIN-08 | Ghi nhớ đăng nhập sinh cookie `autologin` | CRM_LOGIN_TC_008 | crm-login.spec.ts (1/1) | ✅ Full |
| REQ-LOGIN-09 | Không tích Ghi nhớ thì không phát hành cookie `autologin` | CRM_LOGIN_TC_009 | crm-login.spec.ts (1/1) | ✅ Full |
| REQ-LOGIN-10 | Bỏ trống cả hai trường | CRM_LOGIN_TC_011, CRM_LOGIN_TC_043 | crm-login.spec.ts (1/2) | 🟣 Automate một phần |
| REQ-LOGIN-11 | Bỏ trống riêng Email | CRM_LOGIN_TC_011 | crm-login.spec.ts (1/1) | ✅ Full |
| REQ-LOGIN-12 | Bỏ trống riêng Mật khẩu | CRM_LOGIN_TC_011 | crm-login.spec.ts (1/1) | ✅ Full |
| REQ-LOGIN-13 | Chặn email sai định dạng ngay tại trình duyệt | CRM_LOGIN_TC_012, CRM_LOGIN_TC_045, CRM_LOGIN_TC_046 | crm-login.spec.ts (1/3) | 🟣 Automate một phần |
| REQ-LOGIN-14 | Thông báo khi sai thông tin đăng nhập | CRM_LOGIN_TC_013, CRM_LOGIN_TC_014, CRM_LOGIN_TC_017, CRM_LOGIN_TC_018, CRM_LOGIN_TC_040, CRM_LOGIN_TC_045, CRM_LOGIN_TC_047, CRM_LOGIN_TC_050 | crm-login.spec.ts (4/8) | 🟣 Automate một phần |
| REQ-LOGIN-15 | Thông báo lỗi không tiết lộ email nào có thật | CRM_LOGIN_TC_013, CRM_LOGIN_TC_019 | crm-login.spec.ts (2/2) | ✅ Full |
| REQ-LOGIN-16 | 🐞 Máy chủ phải giữ lại email đã nhập sau khi đăng nhập thất bại | CRM_LOGIN_TC_016 | crm-login.spec.ts (1/1) | ✅ Full |
| REQ-LOGIN-17 | Chặn URL nội bộ khi chưa đăng nhập | CRM_LOGIN_TC_021 | — | 🟡 Manual only |
| REQ-LOGIN-18 | Không ghi nhớ URL đích sau khi chuyển hướng | CRM_LOGIN_TC_022 | — | 🟡 Manual only |
| REQ-LOGIN-19 | Đã đăng nhập thì không vào lại trang đăng nhập | CRM_LOGIN_TC_023 | — | 🟡 Manual only |
| REQ-LOGIN-20 | Đã đăng nhập thì không vào trang Quên mật khẩu | CRM_LOGIN_TC_023 | — | 🟡 Manual only |
| REQ-LOGIN-21 | Biểu mẫu đăng nhập mang mã chống CSRF | CRM_LOGIN_TC_024 | — | 🟡 Manual only |
| REQ-LOGIN-22 | Từ chối yêu cầu có mã CSRF sai | CRM_LOGIN_TC_025 | — | 🟡 Manual only |
| REQ-LOGIN-23 | Truy cập trang Quên mật khẩu | CRM_LOGIN_TC_027 | — | 🟡 Manual only |
| REQ-LOGIN-24 | Trang Quên mật khẩu không có lối quay lại đăng nhập | CRM_LOGIN_TC_027 | — | 🟡 Manual only |
| REQ-LOGIN-25 | 🐞 Gửi biểu mẫu Quên mật khẩu khi bỏ trống email | CRM_LOGIN_TC_028 | — | 🟡 Manual only |
| REQ-LOGIN-26 | Email không tồn tại trong hệ thống | CRM_LOGIN_TC_029, CRM_LOGIN_TC_030 | — | 🟡 Manual only |
| REQ-LOGIN-27 | Email tồn tại thì gửi liên kết đặt lại mật khẩu | — | — | ⚪ Ngoài phạm vi (PO 18-08-2026, `AMB-LOGIN-04`) |
| REQ-LOGIN-28 | Liên kết đặt lại mật khẩu sai/hết hạn | CRM_LOGIN_TC_031 | — | 🟡 Manual only |
| REQ-LOGIN-29 | Mỗi viewport có một lối đăng xuất dùng được | CRM_LOGIN_TC_032, CRM_LOGIN_TC_033 | — | 🟡 Manual only |
| REQ-LOGIN-30 | Cảnh báo khi còn bộ đếm giờ đang chạy | CRM_LOGIN_TC_034 | — | 🟡 Manual only |
| REQ-LOGIN-31 | Đăng xuất ngay khi không có bộ đếm giờ | CRM_LOGIN_TC_035 | — | 🟡 Manual only |
| REQ-LOGIN-32 | Kết thúc phiên và về trang đăng nhập | CRM_LOGIN_TC_036 | — | 🟡 Manual only |
| REQ-LOGIN-33 | URL nội bộ bị chặn lại sau khi đăng xuất | CRM_LOGIN_TC_036 | — | 🟡 Manual only |
| REQ-LOGIN-34 | Cookie `autologin` không bị xoá khi đăng xuất | — | — | ⚪ Ngoài phạm vi (PO 18-08-2026, `AMB-LOGIN-06`) |
| REQ-LOGIN-35 | Cookie `autologin` đọc được bằng JavaScript | — | — | ⚪ Ngoài phạm vi (PO 18-08-2026, `AMB-LOGIN-07`) |
| REQ-LOGIN-36 | Không có đăng nhập mạng xã hội | CRM_LOGIN_TC_003 | crm-login.spec.ts (1/1) | ✅ Full |
| REQ-LOGIN-37 | Trang đăng nhập không nạp tệp JavaScript nào | CRM_LOGIN_TC_003 | crm-login.spec.ts (1/1) | ✅ Full |
| REQ-LOGIN-38 | Email bỏ qua khoảng trắng thừa đầu/cuối | CRM_LOGIN_TC_007 | crm-login.spec.ts (1/1) | ✅ Full |
| REQ-LOGIN-39 | Cookie `autologin` không tự đăng nhập lại sau khi đăng xuất chủ động | CRM_LOGIN_TC_037 | — | 🟡 Manual only |
| REQ-LOGIN-40 | Cookie `autologin` khi phiên hết hạn tự nhiên | — | — | ⚪ Ngoài phạm vi (PO 18-08-2026, `AMB-LOGIN-15`) |
| REQ-LOGIN-41 | Không khoá tài khoản sau nhiều lần đăng nhập sai | CRM_LOGIN_TC_015 | crm-login.spec.ts (1/1) | ✅ Full |
| REQ-LOGIN-42 | Phiên đăng nhập hết hạn sau 1 giờ | CRM_LOGIN_TC_026, CRM_LOGIN_TC_051 | — | 🟡 Manual only |
| REQ-LOGIN-43 | Tài khoản khách hàng không đăng nhập được vào khu quản trị | CRM_LOGIN_TC_019, CRM_LOGIN_TC_020 | crm-login.spec.ts (2/2) | ✅ Full |
| REQ-LOGIN-44 | 🐞 Ép truy cập qua HTTPS | CRM_LOGIN_TC_039 | — | 🟡 Manual only |

> 🐞 = REQ ghi kỳ vọng đúng mà hệ thống **hiện chưa đạt** (PO đã xác nhận là lỗi). TC tương ứng FAIL là kết quả **đúng** — `TC_016` đã automate và gắn `@known-bug`; `TC_028`, `TC_039` chưa có script.

---

## 🔴 Requirements chưa được cover

**Không có.** Cả 40 REQ trong phạm vi đều có ≥ 1 TC.

4 REQ ngoài phạm vi (`27`, `34`, `35`, `40`) **cố ý** không có TC theo quyết định PO 18-08-2026 — không phải gap. Dòng REQ được giữ lại để không mất dấu vết.

---

## 🟡 TC chưa automate — đề xuất thứ tự

31 TC chưa có script. Xếp theo Priority, trong cùng mức ưu tiên TC mở khoá nhiều REQ đang 🟡 lên trước.

| # | TC ID | REQ | Priority | Automation (file TC) | Ghi chú |
|---|---|---|---|---|---|
| 1 | CRM_LOGIN_TC_021 | REQ-LOGIN-17 | Critical | Yes | Chặn URL nội bộ khi chưa đăng nhập — dễ làm, đưa REQ-17 sang ✅ |
| 2 | CRM_LOGIN_TC_036 | REQ-LOGIN-32, 33 | Critical | Yes | Đăng xuất kết thúc phiên — 1 TC mở 2 REQ |
| 3 | CRM_LOGIN_TC_032 | REQ-LOGIN-29 | Critical | Yes | Lối đăng xuất desktop |
| 4 | CRM_LOGIN_TC_025 | REQ-LOGIN-22 | Critical | Yes | CSRF sai → `419 Page Expired!` — cần sửa trường ẩn trước khi submit |
| 5 | CRM_LOGIN_TC_027 | REQ-LOGIN-23, 24 | High | Yes | Trang Quên mật khẩu — 1 TC mở 2 REQ |
| 6 | CRM_LOGIN_TC_029 | REQ-LOGIN-26 | High | Yes | Quên mật khẩu, email không tồn tại |
| 7 | CRM_LOGIN_TC_028 | REQ-LOGIN-25 | High | Yes | 🐞 Dự kiến FAIL — gắn `@known-bug` như TC_016 |
| 8 | CRM_LOGIN_TC_035 | REQ-LOGIN-31 | High | Yes | Logout không hỏi lại khi không có timer |
| 9 | CRM_LOGIN_TC_039 | REQ-LOGIN-44 | High | Yes | 🐞 Dự kiến FAIL — HTTP không bị ép sang HTTPS |
| 10 | CRM_LOGIN_TC_024 | REQ-LOGIN-21 | High | Partial | Hình thái mã CSRF + có trong body POST |
| 11 | CRM_LOGIN_TC_037 | REQ-LOGIN-39 | High | Partial | Cookie ghi nhớ sau đăng xuất |
| 12 | CRM_LOGIN_TC_026 | REQ-LOGIN-42 | High | No | Chờ 1 giờ — giữ chạy tay |
| 13 | CRM_LOGIN_TC_051 | REQ-LOGIN-42 | High | No | Gia hạn phiên quá 1 giờ — giữ chạy tay |
| 14 | CRM_LOGIN_TC_023 | REQ-LOGIN-19, 20 | Medium | Yes | 1 TC mở 2 REQ |
| 15 | CRM_LOGIN_TC_022 | REQ-LOGIN-18 | Medium | Yes | |
| 16 | CRM_LOGIN_TC_031 | REQ-LOGIN-28 | Medium | Yes | Auto Type **API** — dùng `request` của Playwright |
| 17 | CRM_LOGIN_TC_030 | REQ-LOGIN-26 | Medium | Yes | Xem mục ⚠️ — REQ ID có thể lệch |
| 18 | CRM_LOGIN_TC_033 | REQ-LOGIN-29 | Medium | Yes | Viewport mobile |
| 19 | CRM_LOGIN_TC_034 | REQ-LOGIN-30 | Medium | Yes | Cần tạo timer công việc → **tạo dữ liệu trên môi trường dùng chung**, phải dọn sau khi chạy |
| 20 | CRM_LOGIN_TC_045 | REQ-LOGIN-13, 14 | Medium | Yes | Biên 64 ký tự |
| 21 | CRM_LOGIN_TC_046 | REQ-LOGIN-13 | Medium | Yes | Vượt biên 64 ký tự |
| 22 | CRM_LOGIN_TC_047 | REQ-LOGIN-14 | Medium | Yes | |
| 23 | CRM_LOGIN_TC_043 | REQ-LOGIN-02, 10 | Medium | Yes | |
| 24 | CRM_LOGIN_TC_042 | REQ-LOGIN-02 | Medium | Yes | |
| 25 | CRM_LOGIN_TC_038 | REQ-LOGIN-02 | Medium | Yes | Bàn phím + focus |
| 26 | CRM_LOGIN_TC_049 | REQ-LOGIN-02 | Medium | Yes | Bố cục nhiều kích thước màn hình |
| 27 | CRM_LOGIN_TC_050 | REQ-LOGIN-02, 06, 14 | Medium | Yes | Xem mục ⚠️ — có thể đã phủ một phần nhờ chạy đa trình duyệt |
| 28 | CRM_LOGIN_TC_040 | REQ-LOGIN-14 | Medium | Partial | Mất mạng giữa lúc submit — `context.setOffline()` |
| 29 | CRM_LOGIN_TC_048 | REQ-LOGIN-02 | Low | Yes | |
| 30 | CRM_LOGIN_TC_041 | REQ-LOGIN-06 | Low | Partial | Đường truyền chậm — giả lập qua `route` |
| 31 | CRM_LOGIN_TC_044 | REQ-LOGIN-02 | Low | No | Tự điền/lưu mật khẩu của trình duyệt — giữ chạy tay |

> Làm xong 9 TC đầu (Critical + High `Yes`) thì **9 REQ** chuyển 🟡 → ✅ (`17`, `22`, `23`, `24`, `25`, `31`, `32`, `33`, `44`) và **2 REQ** sang 🟣 (`26`, `29` — mỗi REQ còn 1 TC Medium). Khi đó REQ đã automate trọn lên **25/40**.

---

## ⚪ Orphan tests (không map về REQ nào)

**Không có.** Cả 20 test trong `crm-login.spec.ts` mang `testId` trùng TC trong file TC, và mọi TC đó đều có cột `REQ ID`.

Ngoài phạm vi RTM này (không thuộc module CRM Login, **không** tính là orphan): `src/tests/cms/login/cms-login.spec.ts` (CMS) · `src/tests/api/auth/register-login.api.spec.ts` (book.anhtester.com).

---

## ⚠️ Cần người xác nhận

Các điểm dưới đây **không** được tính vào số liệu ở trên — chỉ ghi nhận để user quyết.

| # | REQ | TC / Test | Vấn đề | Đề xuất |
|---|---|---|---|---|
| 1 | REQ-LOGIN-02, 06, 14 | CRM_LOGIN_TC_050 ↔ `crm-login.spec.ts` chạy qua `scripts/run-browsers.mjs` | TC_050 kiểm "luồng đăng nhập chạy được trên các trình duyệt cam kết hỗ trợ". Framework đã chạy `TC_002`, `TC_005`, `TC_013` trên **Chrome → Edge → Firefox** — về nội dung có thể coi TC_050 đã phủ một phần. Nhưng **không** script nào mang `testId` `CRM_LOGIN_TC_050` nên RTM chưa tính | Xác nhận dùng kết quả đa trình duyệt làm bằng chứng cho TC_050, hoặc thêm `testId` riêng cho TC_050 |
| 2 | REQ-LOGIN-26 | CRM_LOGIN_TC_030 | TC kiểm **email sai định dạng bị trình duyệt chặn** ở trang Quên mật khẩu, nhưng truy vết về `REQ-LOGIN-26` (*email không tồn tại → `Email not found`*). Nội dung gần với `REQ-LOGIN-23` (`input#email[type=email]`) hơn | Xem lại cột `REQ ID` của TC_030 bằng `/review-testcases` — RTM **không** tự sửa file TC |
| 3 | REQ-LOGIN-14 | CRM_LOGIN_TC_014 | Có script nhưng phụ thuộc tài khoản staff `CRM_TC014_*` trong `.env`. Giá trị hiện tại (bộ nhớ dự án 03-10-2026) **không đăng nhập được** và mật khẩu toàn số → test đỏ ở bước tiền đề / skip. Trên giấy là "đã automate", thực tế **chưa xanh lần nào** | Tạo staff test có mật khẩu chứa chữ cái rồi cập nhật `.env` |
| 4 | REQ-LOGIN-43 | CRM_LOGIN_TC_019 | Expected bước 2 của TC ghi tab trình duyệt `HKD Anh Tester` — đó là tên công ty của tài khoản lúc khảo sát. Script đã chấm theo lời chào trang chủ (đúng), nhưng **file TC còn kỳ vọng cũ** → người chạy tay sẽ chấm FAIL nhầm | Sửa Expected bước 2 của TC_019 sang "dừng ở `/`, thấy lời chào đầu trang chủ" |
| 5 | REQ-LOGIN-06, 08, 09 | CRM_LOGIN_TC_008, 009, 010 | File TC ghi `Automation = Partial`, nhưng script đã kiểm cả phần 🔧 (cookie `autologin`, bấm Login 2 lần). RTM tính là **đã automate trọn** | Cân nhắc đổi cột `Automation` của 3 TC sang `Yes` cho khớp thực tế |

---

## Đề xuất bước tiếp theo

| Ưu tiên | Việc | Command |
|---|---|---|
| 1 | Automate 4 TC Critical còn lại (`021`, `025`, `032`, `036`) rồi tới 5 TC High `Yes` | `/generate-automation-web` (mode TC, chỉ định dải TC) |
| 2 | Xử lý 5 điểm ⚠️ — đặc biệt #2 và #4 sửa trong file TC | `/review-testcases` mode FIX |
| 3 | Mở bug cho 3 REQ 🐞 (`16`, `25`, `44`) nếu chưa có | `/create-bug-report` |
| 4 | Khảo sát module kế tiếp — gợi ý `TASK` (đang giữ phần kiểm chứng của `REQ-LOGIN-30`) hoặc `DASH` | `/generate-requirements-from-website` |
