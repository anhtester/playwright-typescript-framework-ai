import os from 'node:os';
import { defineConfig, devices } from '@playwright/test';
import { stripInternalAttachments } from './src/utils/allure-sanitizer';
import { env } from './src/utils/env.config';

/**
 * 3 trình duyệt test UI. channel: dùng Chrome / Edge CÀI TRÊN MÁY, không phải Chromium đi kèm Playwright.
 * Firefox không có channel — dùng bản Firefox của Playwright (npx playwright install firefox).
 */
const BROWSERS = {
  chrome: { ...devices['Desktop Chrome'], channel: 'chrome' },
  edge: { ...devices['Desktop Edge'], channel: 'msedge' },
  firefox: {
    ...devices['Desktop Firefox'],
    // Headed trên Windows: nhiều cửa sổ chồng nhau thì cửa sổ bị che bị coi là ẩn, ngừng vẽ → click treo đến timeout.
    // Chromium đã được Playwright tắt sẵn cơ chế này (--disable-backgrounding-occluded-windows), Firefox phải tắt tay
    launchOptions: { firefoxUserPrefs: { 'widget.windows.window_occlusion_tracking.enabled': false } },
  },
};
const BROWSER_NAMES = Object.keys(BROWSERS) as (keyof typeof BROWSERS)[];

/** Bộ test UI — mỗi bộ một hệ thống, chạy trên cả 3 trình duyệt */
const UI_SUITES = [
  { name: 'ui', testDir: './src/tests/ui', baseURL: env.baseURL },
  { name: 'crm', testDir: './src/tests/crm', baseURL: env.crmURL },
  { name: 'cms', testDir: './src/tests/cms', baseURL: env.cmsURL },
];

// scripts/run-browsers.mjs gọi Playwright riêng cho từng trình duyệt và đặt RUN_STAGE —
// mỗi lượt một HTML report / thư mục artifact riêng, lượt sau không đè lượt trước
const stage = process.env.RUN_STAGE;
const stageDir = (dir: string) => (stage ? `${dir}/${stage}` : dir);

export default defineConfig({
  testDir: './src/tests',
  globalSetup: './src/setup/global-setup.ts',
  timeout: env.timeout,
  expect: { timeout: env.expectTimeout },

  // Parallel LUÔN bật, song song cả trong 1 file. Đổi số luồng ở WORKERS (.env / CI) — không sửa file này
  fullyParallel: true,
  workers: env.workers,

  forbidOnly: !!process.env.CI,
  // CI: retry 1 lần cho lỗi mạng chập chờn của môi trường dùng chung — Allure vẫn hiện test bị retry
  retries: process.env.CI ? 1 : 0,

  // Mọi output gom vào reports/ — reporting_rules.md mục 6
  outputDir: stageDir('reports/test-artifacts'),
  reporter: [
    ['list'],
    ['html', { outputFolder: stageDir('reports/html'), open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: 'reports/allure-results',
        // false: chỉ giữ test.step + attachment. Step nội bộ của Playwright (vd `Fill "<mật khẩu>"`) in nguyên
        // giá trị điền vào form → bật lên là lộ mật khẩu trong report. Test Body chỉ còn step nghiệp vụ, dễ đọc hơn
        detail: false,
        // Gỡ trace + error-context khỏi Allure (chứa giá trị form) — vẫn còn trong reports/html để debug
        listeners: [stripInternalAttachments],
        environmentInfo: {
          'Web URL': env.baseURL,
          'API URL': env.apiURL,
          'CRM URL': env.crmURL,
          'CMS URL': env.cmsURL,
          // run-browsers.mjs truyền đúng danh sách trình duyệt của lần chạy (--browsers=...)
          Browsers: process.env.RUN_BROWSERS || BROWSER_NAMES.join(', '),
          'Workers mỗi trình duyệt': String(env.workers),
          Headless: String(env.headless),
          Viewport: `${env.viewport.width}x${env.viewport.height}`,
          'Node.js': process.version,
          OS: `${os.type()} ${os.release()}`,
        },
      },
    ],
  ],

  use: {
    headless: env.headless,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    // 'off': fixture finalScreenshot tự đính ảnh cuối cho CẢ pass lẫn fail — bật ở đây là ảnh bị đính 2 lần
    screenshot: 'off',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'api',
      testDir: './src/tests/api',
      use: { baseURL: env.apiURL },
    },
    // Mỗi bộ UI × mỗi trình duyệt = 1 project, tên `<bộ>-<trình duyệt>` (vd crm-firefox).
    // Chạy tuần tự từng trình duyệt: scripts/run-browsers.mjs (npm run test:ui)
    ...UI_SUITES.flatMap((suite) =>
      BROWSER_NAMES.map((browser) => ({
        name: `${suite.name}-${browser}`,
        testDir: suite.testDir,
        // viewport đặt SAU spread: devices['Desktop *'] mặc định 1280x720
        use: { ...BROWSERS[browser], baseURL: suite.baseURL, viewport: env.viewport },
      })),
    ),
  ],
});
