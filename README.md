# Playwright TypeScript Framework — Book Management (Web UI + API)

Framework automation cho hệ thống **Book Management** của Anh Tester:

| Mặt | Địa chỉ |
|---|---|
| Web UI | https://book.anhtester.com |
| API (OpenAPI 3.0) | https://book.anhtester.com/swagger · spec: `/swagger/json` |

**Stack:** Playwright Test · TypeScript · Page Object Model · Allure Report 2 · GitHub Actions — chạy **song song 5 luồng** mặc định.

> ⚠️ **Máy cần Java (JRE/JDK 8+) để MỞ Allure Report 2.** Allure 2 là ứng dụng Java. Allure CLI đã nằm sẵn trong project (`allure-commandline`) — **không cài Allure lên máy**, chỉ cần `java -version` chạy được. Chạy test thì không cần Java.

---

## 1. Yêu cầu

| Công cụ | Phiên bản | Dùng để |
|---|---|---|
| Node.js | 20 trở lên | Chạy test, cài dependencies |
| Java (JRE/JDK) | 8 trở lên | Sinh & mở Allure Report 2 |

## 2. Cài đặt

```bash
npm ci                                  # cài dependencies — gồm luôn Allure CLI 2.43
npx playwright install firefox          # Firefox cho Playwright — Chrome & Edge dùng bản cài sẵn trên máy
cp .env.example .env                    # Windows: copy .env.example .env
```

Mở `.env`, điền **tài khoản demo** (đăng ký tại https://book.anhtester.com/sign-up):

```dotenv
TEST_EMAIL=<email tài khoản demo>
TEST_PASSWORD=<mật khẩu>
```

`.env` đã bị `.gitignore` chặn — **không commit**. Tài khoản demo chỉ dùng cho test **đọc** (đăng nhập, xem hồ sơ); test làm thay đổi tài khoản tự tạo tài khoản riêng và tự xoá sau khi chạy.

## 3. Chạy test

| Lệnh | Việc |
|---|---|
| `npm test` | Chạy toàn bộ: API → UI trên các trình duyệt trong `BROWSERS` (mặc định `.env.example`: chỉ Chrome) |
| `npm run test:ui` | Chỉ test UI, các trình duyệt trong `BROWSERS` chạy **tuần tự**, mỗi trình duyệt song song `WORKERS` luồng |
| `npm run test:ui:chrome` · `test:ui:edge` · `test:ui:firefox` | Test UI trên 1 trình duyệt — chạy được kể cả khi `BROWSERS` không có trình duyệt đó |
| `npm run test:book` · `test:crm` · `test:cms` | 1 bộ UI (book · Perfex CRM · Active eCommerce CMS), trên các trình duyệt trong `BROWSERS` |
| `npm run test:api` | Chỉ test API |
| `npm run test:smoke` | Chỉ test gắn tag `@smoke` (API + các trình duyệt trong `BROWSERS`) |
| `npm run test:headed` | Test UI trên Chrome, mở trình duyệt thật để debug |
| `npm run test:list` | Liệt kê test, không chạy |
| `npm run typecheck` | Kiểm tra kiểu TypeScript |
| `npm run check:env` | Kiểm tra đủ biến môi trường bắt buộc — chỉ in tên biến thiếu, không in giá trị (CI chạy bước này đầu tiên) |

Lọc theo tag bất kỳ: `npm run test:ui -- --grep @data-driven` · bỏ bớt: `--grep-invert @e2e`.

### Chạy đa trình duyệt — Chrome → Edge → Firefox

**Chọn trình duyệt — đúng 1 chỗ:** biến `BROWSERS` trong `.env` (local) hoặc `env.BROWSERS` đầu workflow (CI). Hiện cả hai đặt `chrome`; bật đủ 3 bằng `BROWSERS=chrome,edge,firefox`, để trống cũng là cả 3.

Mỗi bộ UI × mỗi trình duyệt là 1 project, tên `<bộ>-<trình duyệt>` (vd `crm-firefox`). `scripts/run-browsers.mjs` gọi Playwright **từng trình duyệt một**, mỗi lượt song song `WORKERS` luồng; lượt trước FAIL vẫn chạy tiếp lượt sau, exit code ≠ 0 nếu có lượt FAIL.

```bash
node scripts/run-browsers.mjs --browsers=edge,firefox --suites=crm --grep @smoke
```

| Tham số | Việc |
|---|---|
| `--browsers=chrome,edge,firefox` | Chọn trình duyệt cho lần chạy này, ghi đè `BROWSERS` (luôn chạy theo thứ tự Chrome → Edge → Firefox) |
| `--suites=ui,crm,cms` | Chọn bộ UI (mặc định cả 3) |
| `--with-api` | Thêm lượt API, chạy 1 lần trước Chrome |
| tham số khác | Chuyển thẳng cho Playwright (`--grep`, `--headed`, `--retries`…) |

Chrome / Edge dùng bản **cài trên máy** (`channel: 'chrome'` · `'msedge'`); Firefox dùng bản của Playwright. Allure gộp kết quả cả 3 lượt (mỗi test hiện theo project `…-chrome` / `…-edge` / `…-firefox`); HTML report của Playwright tách theo lượt: `npx playwright show-report reports/html/edge`.

> ⚠️ Gọi thẳng `npx playwright test` sẽ chạy **mọi** project cùng lúc (3 trình duyệt trộn chung `WORKERS` luồng) — muốn tuần tự thì dùng lệnh `npm` ở trên.

### Đổi số luồng song song — đúng 1 chỗ

Sửa `WORKERS` trong `.env` (số luồng **mỗi trình duyệt**), hoặc truyền lúc chạy:

```bash
WORKERS=2 npm run test:ui               # PowerShell: $env:WORKERS=2; npm run test:ui
```

Parallel **luôn bật** (`fullyParallel: true`). Test đỏ khi chạy song song là test đang phụ thuộc nhau — sửa test data / state, **không** hạ `WORKERS=1` để giấu.

### Debug headed

`npm run test:headed` hoặc đặt `HEADLESS=false` trong `.env`. Màn hình 1920×1080 thì đổi thêm `VIEWPORT=1600x750` — viewport mặc định 1920×1080 cộng khung trình duyệt sẽ tràn màn hình và bị cắt mép phải.

## 4. Mở report

Toàn bộ output nằm trong `reports/` (đã `.gitignore`):

```text
reports/
├── allure-results/         # raw results (JSON) — dọn tự động đầu mỗi lần chạy
├── allure-report/          # Allure 2 HTML — giữ history để vẽ trend
├── allure-report-single/   # Allure 2 gộp 1 file — gửi qua chat/email
├── html/                   # Playwright HTML report
├── logs/execution.log      # log JSON Lines, có cột worker
├── screenshots/            # ảnh cuối mỗi test UI, đặt tên theo TC ID
└── test-artifacts/         # trace + video khi test fail
```

| Lệnh | Việc |
|---|---|
| `npm run report` | Sinh Allure 2 + mở trên trình duyệt |
| `npm run report:generate` | Chỉ sinh `reports/allure-report` |
| `npm run report:open` | Mở report đã sinh |
| `npm run report:single` | Sinh 1 file HTML → `reports/allure-report-single/index.html` |
| `npm run report:html` | Mở Playwright HTML report |
| `npm run allure -- --version` | Gọi thẳng Allure CLI trong project |

**Người xem không có Java:** nhờ người có Java chạy `npm run report:single` rồi gửi file `index.html` — mở bằng trình duyệt, không cần cài gì. ⚠️ File chứa ảnh chụp hệ thống thật, kiểm tra trước khi gửi ra ngoài team.

**Mỗi test trong Allure có:** tên Tiếng Việt · Description · Severity · Tags · Epic/Feature/Story · **TC ID** (mục *Parameters*) · Test body `Arrange` / `Act` / `Assert` · ảnh `trang_thai_cuoi_cua_test` / `trang_thai_khi_that_bai` (UI) hoặc `api_request_response` đã che dữ liệu (API) ở cuối **mọi** test.

> 🔒 **Report nào gửi ra ngoài được?**
> - **Allure** — được. Đã bật `detail: false` (ẩn step nội bộ kiểu `Fill "<giá trị>"`) và gỡ `trace` + `error-context` khỏi report (`src/utils/allure-sanitizer.ts`); request/response API đã che token, mật khẩu, dữ liệu cá nhân.
> - **Playwright HTML report, trace, `reports/test-artifacts/`** — **chỉ dùng nội bộ**: chúng ghi nguyên giá trị điền vào form, **kể cả mật khẩu**.

## 5. Cấu trúc thư mục

```text
playwright-typescript-framework-ai/
├── .github/workflows/playwright.yml   # CI: headless, parallel, upload reports/
├── .gitlab-ci.yml                     # CI GitLab — cùng hành vi với workflow GitHub
├── playwright.config.ts               # projects api + (ui · crm · cms) × (chrome · edge · firefox), reporter, parallel
├── scripts/run-browsers.mjs           # chạy UI tuần tự Chrome → Edge → Firefox
├── scripts/allure.mjs                 # chạy Allure 2 CLI trong project (kiểm Java, giữ history)
├── src/
│   ├── api/                           # API client — mỗi nhóm endpoint 1 class
│   │   ├── base.api.ts                #   gửi request (json · form · multipart) + step + ghi request/response + Set-Cookie + thời gian
│   │   ├── api-recorder.ts            #   gom request/response (đã che) → attachment cuối test
│   │   ├── account-cleanup.ts         #   xoá tài khoản do test tạo ra + xác minh đăng nhập lại ra 404
│   │   ├── auth.api.ts · user.api.ts · book.api.ts
│   │   └── models/                    #   kiểu request/response theo spec
│   ├── pages/                         # Page Object — locator + thao tác, KHÔNG assertion
│   │   ├── base.page.ts
│   │   └── sign-up.page.ts · sign-in.page.ts · dashboard.page.ts
│   ├── fixtures/
│   │   ├── api.fixture.ts             # API client, registeredUser · userA · userB, accountCleanup, expect.toMatchSchema · toMeetApiBaseline
│   │   └── ui.fixture.ts              # kế thừa API fixture + page objects + ảnh cuối test
│   ├── setup/global-setup.ts          # dọn output lần chạy trước
│   ├── utils/                         # env.config · logger · test-data · mask · schema-validator · api-matchers · cookie · allure-meta · allure-sanitizer · screenshot · data-loader
│   └── tests/
│       ├── ui/auth/                   # sign-up.spec.ts · sign-in.spec.ts
│       └── api/                       # auth/register-login.api.spec.ts · book/book.api.spec.ts
└── test-data/
    ├── *.json                         # dữ liệu data-driven
    └── schemas/*.schema.json          # JSON Schema cho response API
```

## 6. Quy ước viết test

- **Import đúng fixture:** test UI dùng `src/fixtures/ui.fixture.ts`, test API dùng `src/fixtures/api.fixture.ts`
- **Metadata khai tĩnh** qua `tcMeta()` — TC ID là khoá nối sang manual TC và RTM, **không đổi** khi sửa test
- **Test body** chia step `Arrange:` / `Act:` / `Assert:` bằng `test.step`; assertion có message Tiếng Việt
- **Locator** chỉ nằm trong Page Object, ưu tiên `getByRole` / `getByLabel` / `getByText` — đã verify trên DOM thật
- **Không** `waitForTimeout`, **không** `console.log` (stdout bị Allure đính thành attachment) — dùng `createLogger()`
- **Dữ liệu unique** sinh bằng `TestData` (`auto_<spec>_w<worker>_<timestamp>_<random>@auto.test`), **không** ghi cứng
- **Môi trường dùng chung:** tài khoản tạo ra phải `accountCleanup.track()` (fixture `registeredUser` tự làm); **cấm** lấy id từ API danh sách rồi sửa/xoá — đó là dữ liệu của người khác

```typescript
import { test, expect } from '../../../fixtures/ui.fixture';
import { tcMeta } from '../../../utils/allure-meta';

test(
  'Mô tả hành vi bằng Tiếng Việt',
  {
    tag: ['@regression', '@ui', '@auth'],
    annotation: tcMeta({
      testId: 'BOOK_AUTH_TC_0xx',
      severity: 'normal',
      feature: 'Xác thực',
      story: 'Đăng nhập',
      description: 'Kiểm tra … thì …',
    }),
  },
  async ({ signInPage }) => {
    await test.step('Arrange: …', async () => { await signInPage.open(); });
    await test.step('Act: …', async () => { /* thao tác */ });
    await test.step('Assert: …', async () => {
      await expect(signInPage.heading, 'Message khi fail').toBeVisible();
    });
  },
);
```

## 7. CI/CD — GitHub Actions

Workflow `.github/workflows/playwright.yml` chạy khi `push` lên `main`, mở `pull_request`, hoặc bấm tay (`workflow_dispatch`, có ô lọc tag). Kết quả — kể cả khi fail — nằm trong artifact **`test-reports`** (toàn bộ `reports/`).

**Allure report public:** https://anhtester.github.io/playwright-typescript-framework-ai/ — job `deploy-report` đưa `reports/allure-report` lên GitHub Pages sau mỗi lượt chạy trên `main` (push · lịch · bấm tay; PR không public), kể cả khi test FAIL. Biểu đồ trend nối tiếp nhờ lấy `history/` từ bản đang public. **Chỉ** Allure được public vì đã che mật khẩu (mục 4) — `reports/html` + trace vẫn chỉ nằm trong artifact. Email đăng nhập vẫn hiện trong tên step.

Cấu hình một lần trong **Settings → Secrets and variables → Actions**:

| Loại | Tên | Giá trị |
|---|---|---|
| Secret | `TEST_EMAIL` | Email tài khoản demo |
| Secret | `TEST_PASSWORD` | Mật khẩu tài khoản demo |
| Secret | `CRM_ADMIN_EMAIL` · `CRM_ADMIN_PASSWORD` · `CRM_PM_EMAIL` · `CRM_PM_PASSWORD` | Tài khoản Perfex CRM |
| Secret (tuỳ chọn) | `CRM_CUSTOMER_EMAIL` · `CRM_CUSTOMER_PASSWORD` | Tài khoản khách hàng cổng `/login` — thiếu thì `CRM_LOGIN_TC_019`, `020` SKIP |
| Secret (tuỳ chọn) | `CRM_TC014_EMAIL` · `CRM_TC014_PASSWORD` | Staff có mật khẩu **chứa chữ cái** — thiếu thì `CRM_LOGIN_TC_014` SKIP |
| Secret | `CMS_ADMIN_EMAIL` · `CMS_ADMIN_PASSWORD` | Tài khoản quản trị Active eCommerce CMS |
| Variable (tuỳ chọn) | `BASE_URL` · `API_URL` | Mặc định `https://book.anhtester.com` |
| Variable (tuỳ chọn) | `CRM_URL` · `CMS_URL` | Mặc định `https://crm.anhtester.com` · `https://cms.anhtester.com` |
| Secret (tuỳ chọn) | `SLACK_WEBHOOK_URL` | Incoming Webhook của kênh Slack nhận kết quả — thiếu thì không gửi |

**Thông báo Slack:** bước cuối của job chạy `scripts/slack-notify.mjs` (cả khi FAIL) — gửi số passed/failed/broken/skipped, số test flaky, tối đa 10 test FAIL kèm TC ID, nút mở Allure report và log lượt chạy. Tin nhắn **không** chứa email, mật khẩu hay nội dung lỗi. Tạo webhook: Slack → *Apps* → *Incoming Webhooks* (hoặc api.slack.com/apps → *Create New App* → bật *Incoming Webhooks* → *Add New Webhook to Workspace* → chọn kênh) → copy URL vào secret. Thử từ máy: điền `SLACK_WEBHOOK_URL` trong `.env` rồi `npm run notify:slack` (đọc `reports/allure-report` đang có).

CI chạy `run-browsers.mjs --with-api` (API → các trình duyệt trong `env.BROWSERS` ở đầu workflow — **hiện chỉ `chrome`**; bật lại đủ 3 bằng `BROWSERS: chrome,edge,firefox`, bước cài trình duyệt tự theo) và **bỏ qua nhóm `@known-bug`** (`--grep-invert @known-bug`) — các test phơi bug của app ở mục 9 dự kiến FAIL, để chung thì CI đỏ mọi lần push và không nhận ra lỗi mới. Retest bug đã sửa: bấm tay workflow, tick **include_known_bugs** (có thể ghép ô lọc `@known-bug` để chỉ chạy nhóm đó). Số luồng mỗi trình duyệt: sửa `env.WORKERS` ở đầu workflow. Workflow còn **tự chạy hằng ngày lúc 21:37 giờ Việt Nam** (`schedule` cron `37 14 * * *` — GitHub tính theo UTC); đổi giờ thì sửa dòng `cron` trong khối `on:` (giờ VN trừ 7).

> Workflow chỉ chạy khi thư mục này là **gốc repo**. Nếu giữ nó làm thư mục con của repo khác, chuyển file sang `.github/workflows/` của repo cha và thêm `defaults.run.working-directory: playwright-typescript-framework-ai`.

### GitLab CI

File `.gitlab-ci.yml` ở gốc repo — **cùng hành vi** với workflow GitHub: chạy khi push lên nhánh mặc định, mở merge request, hoặc bấm tay; `BROWSERS: chrome`; bỏ qua `@known-bug`; Allure sinh cả khi FAIL; artifact `test-reports` (toàn bộ `reports/`) giữ 14 ngày, có link ngay trong merge request. Job `pages` public Allure report lên GitLab Pages (nhánh mặc định).

| Việc | Ở đâu |
|---|---|
| Tài khoản test (cùng **12 tên** bảng trên) | **Settings → CI/CD → Variables** — tick **Masked** nếu được. Không cần khai lại trong `.gitlab-ci.yml`, runner tự đưa vào biến môi trường |
| URL · `WORKERS` · `BROWSERS` · timeout · viewport… | Khối `variables:` đầu `.gitlab-ci.yml` — đủ bộ như `.env.example` (Variable cùng tên ở Settings sẽ đè lên) |
| Thiếu biến | Bước `npm run check:env` đầu job **dừng ngay**, liệt kê tên biến thiếu — không để hàng chục test đỏ cùng một lỗi |
| Lọc tag · retest bug | **Build → Pipelines → Run pipeline** → ô `GREP` (vd `@smoke`) · `INCLUDE_KNOWN_BUGS` = `true` |

> ⚠️ **Masked** đòi giá trị ≥ 8 ký tự — mật khẩu demo 6 số **không** mask được. Framework không in mật khẩu ra log job, nhưng đừng thêm lệnh `echo` biến trong CI.
>
> ⚠️ Artifact chứa `reports/html` + trace — **ghi nguyên mật khẩu** (mục 4). `.gitlab-ci.yml` đã đặt `artifacts:access: developer` (cần GitLab 16.11+) để người ngoài project public không tải được. Bên GitHub không có tuỳ chọn tương đương: repo public thì ai có tài khoản GitHub cũng tải được artifact → để repo **private**.
>
> ⚠️ Đừng tick **Protected** cho các biến tài khoản nếu muốn chạy test ở merge request từ nhánh thường — biến Protected chỉ có trên nhánh/tag được bảo vệ, thiếu là bộ test báo `Thiếu biến môi trường bắt buộc`.
>
> Image `mcr.microsoft.com/playwright:v1.63.0-noble` phải **cùng phiên bản** với `@playwright/test` — nâng gói thì sửa tag image theo.

## 8. Test mẫu có sẵn — 15 test (14 chạy · 1 cách ly)

| TC ID | Tầng | Test |
|---|---|---|
| BOOK_AUTH_TC_001 | UI | Đăng ký thành công, chuyển sang Sign in |
| BOOK_AUTH_TC_002 | UI | Bỏ trống 4 trường bắt buộc |
| BOOK_AUTH_TC_003–004 | UI · data-driven | Email sai định dạng · mật khẩu xác nhận không khớp |
| BOOK_AUTH_TC_005 | UI | Đăng nhập thành công bằng tài khoản demo |
| BOOK_AUTH_TC_006–007 | UI | Email chưa đăng ký · sai mật khẩu |
| BOOK_AUTH_TC_008 | UI + API | Tài khoản tạo qua API → đăng nhập UI → Dashboard chào đúng tên |
| BOOK_AUTH_TC_019 | UI + API | ⏸️ `test.fixme` — Đăng xuất thì quay về Sign in (bug app, xem mục 9 #5) |
| BOOK_BOOK_TC_001–003 | API | Danh sách phân trang + schema · chi tiết + schema · id không tồn tại 404 |
| BOOK_BOOK_TC_004–006 | API · data-driven | `limit=0` · `limit=10001` · `page=0` → 422 |

TC ID là mã đặt cho bộ test mẫu — khi có bộ manual TC chính thức trong `docs/testcases/`, cập nhật `testId` cho khớp.

### Bộ API chính thức — AUTH Part 01 (Đăng ký · Đăng nhập)

`src/tests/api/auth/register-login.api.spec.ts` — sinh từ `docs/testcases/_book-api/auth/api/parts/part_01_api_dang_ky_dang_nhap.md` (thư mục cha của framework). **25 TC · 50 test** (TC có Bảng biến thể → mỗi biến thể 1 test, cùng TC ID). Biến thể nằm ở `test-data/auth-register-login.json`. Chạy riêng: `npx playwright test src/tests/api/auth/register-login.api.spec.ts`.

| TC ID | Endpoint | Test |
|---|---|---|
| BK_AUTH_TC_059 · 060 · 106 | `POST /api/register` | Đăng ký 201 (JSON · form · multipart) · đăng nhập được ngay |
| BK_AUTH_TC_061 · 063 · 064 | `POST /api/register` | Thiếu / sai kiểu `name` · thiếu `password` · 6 dạng email sai → 422 |
| BK_AUTH_TC_065 · 066 | `POST /api/register` | Email trùng (kể cả khác hoa thường) → 422 nguyên văn |
| BK_AUTH_TC_067 · 068 | `POST /api/register` | Mass assignment · chuỗi tấn công / 10.000 ký tự ở `name` |
| BK_AUTH_TC_069 → 072 · 107 | `POST /api/login` | Đăng nhập 200 + JWT · 3 content-type · token đúng chủ (`userA` / `userB`) · email khác hoa thường · không phụ thuộc `Authorization` |
| BK_AUTH_TC_073 · 074 · 076 · 077 · 081 | `POST /api/login` | Sai mật khẩu 400 · email chưa có / đã xoá 404 · thiếu password · email sai định dạng 422 · chuỗi tấn công ở `password` |
| BK_AUTH_TC_078 · 079 | `POST /api/login` | Cookie `refetchToken` đủ cờ bảo mật · cookie `accessToken` = body |
| 🐞 BK_AUTH_TC_062 · 068-d · 075 · 080 | | **Dự kiến FAIL — phơi bug**, tag `@known-bug` / `@needs-verify` (mục 9 #1 · #6 → #8). Không hạ assertion |

Mọi response còn qua `expect(result).toMeetApiBaseline()`: SLA < `API_SLA_MS` (mặc định 2000 ms) · body JSON · không lộ khoá `password` · không stack trace. Content-Type lệch spec được ghi thành parameter **Cảnh báo Content-Type lệch spec** trên Allure, không đánh FAIL.

`BK_AUTH_TC_075` gửi request rơi vào tài khoản `user@example.com` không do QA sở hữu (lỗi F-19) → khai `retries: 0`, chạy đúng 1 lần mỗi lượt.

## 9. Ghi chú về hệ thống (phát hiện khi khảo sát)

Các điểm dưới đây **chưa** đưa vào test mẫu (hoặc đang cách ly bằng `test.fixme`) vì test sẽ đỏ do hành vi của hệ thống — cần xác nhận với dev / tạo bug (`/create-bug-report`) trước:

| # | Quan sát | Spec / kỳ vọng |
|---|---|---|
| 1 | `POST /api/login` **thiếu trường `email`** trả `400 "Invalid password."` — nghi server tra user với email rỗng rồi so mật khẩu | Spec: `email` bắt buộc → `422` |
| 2 | Sau `DELETE /api/logout`, access token cũ vẫn gọi `GET /api/me` được `200` | Token nên bị thu hồi |
| 3 | 228/753 sách có `currentPrice` **âm** (vd `price` 99 000 → `currentPrice` −8 301 565, không có khuyến mãi) | Spec chỉ khai `number` — cần làm rõ luật nghiệp vụ |
| 4 | Sau khi đăng xuất trên UI, vào thẳng `/book-management` không bị chuyển về Sign in | Cần xác nhận trang có yêu cầu đăng nhập không |
| 5 | Bấm Logout: toast "Logout successfully." hiện nhưng **3–4/10 lần** (chạy 5 luồng) trang **không** chuyển về `/sign-in` — app gọi lại `/api/me` (401) + `/api/refetch-token` (422) rồi ở lại Dashboard. Chạy 1 luồng: 10/10 lần đúng → race condition phía app | Luôn chuyển về `/sign-in`. Test `BOOK_AUTH_TC_019` giữ nguyên assertion, đang `test.fixme` — **bỏ `.fixme` khi dev sửa xong** |
| 6 | `POST /api/register` **thiếu `email`** → `422 "Email already exists."` — server lấy `default` `user@example.com` thay cho field bắt buộc (F-19). Cùng gốc với #1 | `422` báo thiếu field `email`. Đã có test phơi bug: `BK_AUTH_TC_062` · `075` (#1) |
| 7 | Cookie `accessToken` do login set chỉ có `Path=/` — thiếu `HttpOnly` · `Secure` · `SameSite` (F-03) | Đủ 3 cờ. Test phơi bug: `BK_AUTH_TC_080` |
| 8 | `POST /api/register` với `name` 10.000 ký tự → `422` nhưng body lỗi là `fields.fields: ["Property 'fields' is missing","Expected object"]` — không chỉ ra field `name` | `422` có `fields.name`. Test phơi bug: `BK_AUTH_TC_068` biến thể d |
| 9 | `POST /api/login` → `200` trả `Content-Type: text/plain;charset=utf-8` dù body là JSON (mọi content-type request). Các status khác và `/api/register` đều `application/json` | Spec khai `application/json`. Ghi cảnh báo trên Allure, chưa có TC |
| 10 | **Perfex CRM** — đăng nhập `/admin/authentication` sai mật khẩu thì trang nạp lại với ô Email **rỗng** (HTML máy chủ trả về không có `value`). PO xác nhận là lỗi (`AMB-LOGIN-10`) | Ô Email giữ email vừa nhập. Test phơi bug: `CRM_LOGIN_TC_016`, tag `@known-bug` — **dự kiến FAIL** |
