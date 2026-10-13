---
name: bo-skills-claude
description: Bộ .claude/ (skills, commands, rules) lấy từ repo claude-testing-skills — quy ước đặt tên, sửa lỗi thì đưa luật tổng quát vào skill, không gợi ý skill backlog
type: feedback
nguon: claude-testing-skills (naming-convention-skills-vs-commands, fix-skill-generally-after-finding-bug, skills-backlog-not-needed-yet)
cap-nhat: 03-10-2026
---

# Bộ `.claude/` (skills · commands · rules)

Bộ `.claude/` của repo này bắt nguồn từ repo bộ khung `D:\ANHTESTER\ClaudeCode\claude-testing-skills` (qua repo cha). Danh sách skill/command xem `CLAUDE.md` mục 5 và 10 — không chép lại.

## Quy ước đặt tên
- Skills: tiền tố `skills-` + kebab-case (`skills-qa-automation-engineer`). Commands: kebab-case (`/generate-automation-web`) — đổi từ snake_case ngày 04-09-2026.
- Phân biệt skill/command bằng **tiền tố `skills-`**, không phải kiểu gạch.
- Grep/replace tên lệnh phải neo ranh giới `(?<![A-Za-z0-9_])…(?![A-Za-z0-9_])`.

## Phát hiện lỗi → sửa 2 nơi
Rà soát ra lỗi trong tài liệu/TC/script do skill dạy sai → **(1)** sửa sản phẩm hiện tại **và (2)** bổ sung luật vào `.claude/skills/` hoặc `.claude/commands/` để không tái diễn.

**Why:** bộ `.claude/` đi theo mọi dự án; vá riêng dự án là mất bài học khi sang dự án sau.

**How to apply:** luật viết **tổng quát** — không nhắc tên hệ thống, module, giá trị cụ thể (✅ "tồn tại trong DOM ≠ người dùng dùng được" · ❌ "kiểm `li.header-logout` của Perfex"). Hỏi user trước nếu sửa skill nằm ngoài phạm vi yêu cầu; ghi 1 dòng Nhật ký nói luật đã đưa vào skill nào.

## Không gợi ý nhóm skill mở rộng
User đã xem và quyết định **chưa cần** (02-08-2026): visual-regression, accessibility-tester, db-validator, performance-tester, security-input-tester, i18n-tester, ci-pipeline-builder, env-healthcheck, test-impact-analyzer, exploratory-testing. **Không chủ động gợi ý lại** — chỉ làm khi user tự hỏi.

## Sửa `.claude/` ở repo này
Repo này và repo cha có bản `.claude/`/`CLAUDE.md` **đã lệch nhau** (xem [[nguon-goc-va-lich-su]]). Sửa ở đây không tự lan sang repo cha và ngược lại — nếu user muốn đồng bộ thì hỏi chiều nào.

Liên quan: [[review-testcases]] · [[viewport-va-playwright-mcp]]
