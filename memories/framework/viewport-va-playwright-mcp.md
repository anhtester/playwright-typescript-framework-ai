---
name: viewport-va-playwright-mcp
description: Viewport khi AI debug bằng Playwright MCP vs viewport bộ test — hai chỗ khác nhau, đang lệch giữa .mcp.json và CLAUDE.md; MCP cwd có thể rơi sang project khác
type: project
nguon: phiên 01-10-2026 (ef48ce1d, aea3d997) repo cha · claude-testing-skills (playwright-mcp-cwd-wrong-project, evidence-urlbar) · ClaudeBuildMemoryProject
cap-nhat: 03-10-2026
---

# Viewport & Playwright MCP

## Hai chỗ đổi kích thước — đừng nhầm
| Mục đích | File | Ghi chú |
|---|---|---|
| **AI debug** bằng Playwright MCP | `.mcp.json` → `--viewport-size=<rộng>,<cao>` | **Phải khởi động lại Claude Code**. `.claude/playwright-mcp-config.json` chỉ đặt vị trí cửa sổ (`--window-position=-3,0`), không quyết định kích thước |
| **Bộ test** chạy headed/headless | `.env` → `VIEWPORT=<rộng>x<cao>` | Đọc ở `src/utils/env.config.ts` → `playwright.config.ts`. Headless/CI giữ `1920x1080` |

## ⚠️ Đang lệch (kiểm 03-10-2026)
- `.mcp.json` repo này: `--viewport-size=1600,780` · `CLAUDE.md` + `playwright_rules.md`: `1600×770` · README framework: `1600x750`.
- Repo cha đã đổi sang `1800×900` ngày 01-10-2026 (máy user màn hình **2048×1152**, vùng làm việc 2048×1104) — repo này **không** mang thay đổi đó.
- 01-10-2026 cửa sổ MCP thực tế chỉ rộng ~1615px dù viewport khai 1800 → trang bị cắt, agent phải tạm hạ.

- **08-10-2026 — user yêu cầu hạ chiều cao headed vì cửa sổ che thanh taskbar.** `.env` (máy user, không commit) đổi `VIEWPORT=1800x900` → `1800x750` → chốt cuối `1600x750`. Đo Firefox headed: viewport 1800×900 → cửa sổ ngoài **1812×989** (khung +89 dọc, +12 ngang), dù `WorkingArea` đo được 2048×1104 — số đo hệ điều hành không khớp thực tế che taskbar, nên **tin phản hồi của user hơn công thức**. Nếu user vẫn thấy che/hoặc muốn cao hơn → chỉnh số cao trong `.env`, không đụng `playwright.config.ts`.

**How to apply:** trước khi debug, **đo** bằng `browser_evaluate: () => ({inner:[innerWidth,innerHeight], outer:[outerWidth,outerHeight]})`; `inner` > `outer` → bị cắt. Không dùng `browser_resize` phóng to vượt cửa sổ. Khi user muốn đổi viewport AI debug: sửa **đồng bộ** `.mcp.json` + `CLAUDE.md` (bảng viewport) + `.claude/rules/playwright_rules.md` + dòng "Trình duyệt khảo sát" trong `.claude/skills/skills-requirements-analyzer/SKILL.md` + `skills-framework-architect/SKILL.md`; giữ nguyên số đo gốc "1600×770 → cửa sổ 1614×905" (là số đo thật, công thức suy từ đó). Công thức: viewport ≈ `(W−17) × (H−135)`.

## MCP có thể ghi file sang project khác
Server `playwright` global khởi động trước từ project khác → cwd sai: ảnh tên trần rơi vào thư mục project kia, đường dẫn tuyệt đối bị chặn *"outside allowed roots"*. Đã gặp 14-08 và 06-09-2026 (ở repo khác). `.mcp.json` của project chỉ có hiệu lực **sau khi khởi động lại** Claude Code.

**How to apply:** trước khi chụp hàng loạt, chụp thử 1 ảnh đường dẫn tương đối rồi `ls` để biết ảnh rơi đâu. Rơi sai chỗ → copy về đúng thư mục **và xoá bản bên kia**, khuyên user khởi động lại Claude Code. Thư mục `.playwright-mcp/` đã `.gitignore`.

## Evidence cần thanh URL / ổ khoá / tooltip native
Screenshot Playwright **không có** browser chrome. TC kiểm HTTPS/ổ khoá/"Not secure"/bong bóng validation native → chụp mức cửa sổ OS bằng PowerShell + `user32.dll`: tìm cửa sổ theo `MainWindowTitle` → `ShowWindow($h,3)` → `GetWindowRect` → **`PrintWindow($h,$hdc,2)`**. **Không** dùng `SetForegroundWindow` + `CopyFromScreen` (đã hỏng 2 lần: chụp nhầm cửa sổ, bị cắt biên). Chụp xong luôn mở lại ảnh xác nhận.

Liên quan: [[evidence-va-khao-sat]] · [[chay-test-da-trinh-duyet]]
