---
name: quy-tac-viet-tc
description: Phản hồi của user về cách viết manual test case — mặc định GỘP biến thể, viết bằng thứ người dùng nhìn thấy, phần kỹ thuật tách @TechCheck
type: feedback
nguon: claude-testing-skills (prefer-consolidated-testcases, manual-tc-user-visible-language)
cap-nhat: 03-10-2026
---

# Quy tắc viết manual test case

## 1. Mặc định GỘP biến thể
Biến thể của cùng một trường, cùng loại phản hồi → **1 TC có Bảng biến thể** (mã `a`, `b`, `c`…). Chỉ TÁCH khi user yêu cầu rõ hoặc cần pass-rate từng biến thể.

**Why:** user phản hồi *"Login thôi mà 82 TCs kinh thật"* — gộp lại còn 41 TC, cùng độ phủ REQ, cùng số case.

**How to apply:** luật chi tiết ở `.claude/skills/skills-rbt-manual-testing/SKILL.md` mục "Độ Hạt Test Case — GỘP / TÁCH" (trần 6 biến thể/TC). Nêu độ hạt ở dòng kế hoạch đầu tiên để user chặn sớm. Khi sinh automation: mỗi biến thể = 1 test, **cùng TC ID** (đang làm vậy ở `register-login.api.spec.ts`, dữ liệu ở `test-data/*.json`).

## 2. Viết bằng thứ người dùng nhìn thấy
Phần chính của TC **không** assert bằng ngôn ngữ DOM/DevTools (`document.title`, `checkValidity()`, selector, mã HTTP, tab Network). Viết: "vào được Dashboard", "tab trình duyệt ghi X", "trình duyệt bật bong bóng cảnh báo cạnh ô Email".

Yêu cầu không có biểu hiện nhìn thấy được (cookie, CSRF, header, mã 500) → dòng riêng `🔧 Ghi chú kỹ thuật (cần DevTools):` + tag `@TechCheck`. Phép thử: che dòng 🔧 vẫn chấm được PASS/FAIL.

**Why:** user (20-08-2026): bộ TC *"chứa các phần validate thuộc tính HTML nhiều quá, trong khi User và thậm chí Tester đâu cần kiểm thử như vậy"*.

**How to apply:** ngoại lệ — TC `Auto Type = API`, mục checklist cho DevOps/security, nhãn nguyên văn trên màn hình, URL đầy đủ. Luật nằm ở skill rbt mục "Quy Tắc Ngôn Ngữ Kiểm Chứng".

## 3. Tôn trọng chủ ý gộp của user
TC user cố ý gộp (vd 1 TC kiểm 2 màn hình / 2 cơ chế trong bộ LOGIN) → không ép tách. Tiền đề không thoả = BLOCKED là quy ước chung, không đề xuất ghi thêm vào từng TC.

Liên quan: [[review-testcases]] · [[evidence-va-khao-sat]]
