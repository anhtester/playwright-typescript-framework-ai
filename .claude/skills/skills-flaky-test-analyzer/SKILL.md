---
name: skills-flaky-test-analyzer
description: Skill phân tích và khắc phục các automation test không ổn định (flaky tests), xác định root cause và đề xuất fix.
---

# Flaky Test Analyzer

Purpose: Identify and resolve unstable automation tests.

---

## When to Use

Use this skill when:

- A test passes and fails intermittently
- Test results are inconsistent across runs
- CI/CD pipeline has unreliable test results

---

## Responsibilities

Detect flaky tests caused by:

- Unstable locators (dynamic classes, positional xpath)
- Timing issues (race conditions, slow page loads)
- Incorrect waits (hard sleep instead of smart waits)
- Environment dependency (data not cleaned up, external service down)
- Test data conflicts (shared data between parallel tests)

---

## Analysis Workflow

1. **Detect** — Identify the failing test and reproduce the failure
2. **Inspect** — Read error logs, stack traces, and screenshots
3. **Classify** — Categorize the root cause (locator / timing / data / environment)
4. **Fix** — Apply the appropriate fix strategy
5. **Verify** — Re-run test multiple times to confirm stability

---

## Common Flaky Causes & Fixes

### Unstable Locator

**Problem:**
```
//div[3]/button
.css-1n2xyz-btn
```

**Fix:** Replace with stable locator following priority in `.claude/rules/locator_strategy.md`:
- `id`, `data-testid`, `name`, `css selector` (stable), `xpath` (relative)

---

### Timing Issues

**Problem:**
```java
Thread.sleep(3000);       // Hard sleep — BAD
page.waitForTimeout(2000); // Fixed delay — BAD
```

**Fix:** Use smart waits as defined in `.claude/rules/selenium_rules.md` and `.claude/rules/playwright_rules.md`:
```java
// Selenium
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("result")));

// Playwright
await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
```

**Cấm dùng `waitForLoadState('networkidle')` / `'load'` làm điều kiện "sẵn sàng":** chúng phụ thuộc sự kiện `load` của trình duyệt — Firefox đôi khi không bắn (trang có script bên thứ ba) dù trang đã vẽ xong → treo đến timeout, chỉ lỗi trên Firefox, ~25%, cùng một bước. Thay bằng tín hiệu của chính việc cần chờ:
```typescript
// Đăng ký TRƯỚC khi request phát sinh (vd ở framenavigated / trước khi click) — đăng ký sau là race
const loaded = page.waitForResponse((res) => new URL(res.url()).pathname === '/admin/tasks/table');
await loaded;                                  // hoặc expect(locator).toBeVisible() trên phần tử cuối cùng xuất hiện (locator phải verify trên DOM thật)
```
Chẩn đoán: mở `trace.zip`, đọc log bước fail — thiếu dòng `"load" event fired` là dấu hiệu chắc chắn. Ca thực tế: `memories/framework/loi-da-gap-va-cach-sua.md` #8.

---

### Test Data Conflicts

**Problem:** Tests share mutable data → parallel runs conflict.

**Fix:** Use unique, traceable random data:
```
<testName>_<timestamp>@test.com
```

---

## Stability Checklist

After fixing a flaky test, verify:

- [ ] Locator is unique and stable across reloads
- [ ] No hard sleep or fixed delays
- [ ] Test data is unique and deterministic
- [ ] Test is independent (no dependency on other tests)
- [ ] Test passes 5+ consecutive runs — với lỗi theo trình duyệt hoặc tỉ lệ thấp: `--repeat-each=20 --retries=0` (3 lần liên tiếp không đủ bắt lỗi ~27%)
- [ ] Không dùng `networkidle` / `load` làm điều kiện sẵn sàng (đặc biệt khi chạy Firefox)

---

## Rules References

The agent MUST follow these rules when analyzing flaky tests:

- `.claude/rules/locator_strategy.md` — Locator stability rules
- `.claude/rules/automation_rules.md` — General automation best practices
- `.claude/rules/selenium_rules.md` — Selenium wait strategy
- `.claude/rules/playwright_rules.md` — Playwright auto-waiting