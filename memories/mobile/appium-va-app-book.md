---
name: appium-va-app-book
description: App Android book (hybrid) và cấu hình appium-mcp trên máy user — chỉ NATIVE_APP dùng được, framework mobile là appium-java-framework ở repo cha (Java 21)
type: reference
nguon: bộ nhớ project-book-anhtester-env (repo cha) · claude-testing-skills (appium-mcp-desktop-config) · phiên 22-09, 29-09-2026
cap-nhat: 03-10-2026
---

# Appium & app Book

> Repo này **không** chứa code mobile. Framework mobile là `appium-java-framework/` nằm ở **repo cha** (Appium + Java + TestNG). Ghi ở đây vì cùng nghiệp vụ book — TC mobile chung prefix/dải AUTH với web/API.

## App
- Android package **`com.anhtester.book`**, activity `.MainActivity` (`capabilities.json` ở gốc repo cha từng ghi nhầm `book.anhtester.com`). APK: `~/Downloads/anhtester-book-app-release.apk`. Emulator `emulator-5554` (AVD Pixel 9 Pro XL API 35, Android 15).
- **Hybrid** WebView. Build đang cài (22-09-2026) **không** có socket `webview_devtools_remote` → chỉ dùng được context **`NATIVE_APP`**; toast không có trong cây accessibility. User nói 29-09 "dev đã bật WebView debugging" nhưng build cài trên máy vẫn là bản cũ.
- User chọn (29-09-2026): automate bằng `NATIVE_APP`, kiểm toast/màu ghi **"không kiểm chứng được"**. Có APK mới → **kiểm lại contexts** trước.

## Quyết định user
- **Java 21 duy nhất** (*"Chỉ dùng 21 thôi"*, 29-09-2026) — pom/README/CI đã chuyển từ 25.
- Bộ ví dụ tối giản: chỉ 2 TC (đăng nhập thành công + email chưa đăng ký) — giữ suite ví dụ nhỏ.
- Screen class có locator dự phòng cấu trúc cho **iOS** dù chưa chạy iOS.

## appium-mcp trên máy user
- Khai ở config **global** `%APPDATA%\Claude\claude_desktop_config.json`, **không** ở `.mcp.json` project. `env`: `ANDROID_HOME=C:\Users\votha\AppData\Local\Android\Sdk`, `CAPABILITIES_CONFIG` trỏ tới một `capabilities.json` (kiểm giá trị hiện tại — từng trỏ repo `claude-testing-skills`).
- `capabilities.json` đọc lại mỗi lần tạo session — sửa file không cần khởi động lại; đổi `env` thì **thoát hẳn Claude Desktop**.
- `appium_screenshot` (appium-mcp 1.94.0) lỗi `Unrecognized key: "structuredContent"` → chụp bằng `adb -s emulator-5554 exec-out screencap -p > file.png` qua `cmd /c`.

Liên quan: [[book-anhtester]] · [[ho-so-va-giao-tiep]] (gom bước cần mật khẩu thành 1 kịch bản)
