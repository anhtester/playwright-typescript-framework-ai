#!/usr/bin/env node
/**
 * Chạy test UI TUẦN TỰ từng trình duyệt theo thứ tự Chrome → Edge → Firefox.
 * Trình duyệt mặc định lấy từ BROWSERS (.env / CI, vd `chrome` hoặc `chrome,edge,firefox`) — để trống = cả 3.
 * Mỗi trình duyệt là 1 lượt Playwright riêng, song song WORKERS luồng (.env, mặc định 5).
 * Lượt trước FAIL vẫn chạy tiếp lượt sau; exit code ≠ 0 nếu có lượt FAIL.
 *
 *   node scripts/run-browsers.mjs                        trình duyệt trong BROWSERS × mọi bộ UI (ui · crm · cms)
 *   node scripts/run-browsers.mjs --with-api             thêm lượt API (chạy 1 lần, trước Chrome)
 *   node scripts/run-browsers.mjs --suites=crm           chỉ bộ crm
 *   node scripts/run-browsers.mjs --browsers=edge,firefox  ghi đè BROWSERS cho lần chạy này
 *   node scripts/run-browsers.mjs --grep @smoke --headed   tham số khác chuyển thẳng cho Playwright
 *
 * Allure gộp kết quả mọi lượt (lượt sau không dọn reports/allure-results). HTML report: reports/html/<lượt>/.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Đọc BROWSERS từ .env — biến đã đặt sẵn (CI, dòng lệnh) không bị .env ghi đè
dotenv.config({ path: path.join(ROOT, '.env'), quiet: true });
const PLAYWRIGHT_CLI = path.join(ROOT, 'node_modules', '@playwright', 'test', 'cli.js');

/** Thứ tự chạy — khớp BROWSERS trong playwright.config.ts */
const ALL_BROWSERS = ['chrome', 'edge', 'firefox'];
/** Khớp UI_SUITES trong playwright.config.ts */
const ALL_SUITES = ['ui', 'crm', 'cms'];

function fail(message) {
  process.stderr.write(`\n[run-browsers] ${message}\n\n`);
  process.exit(1);
}

function parseList(value, allowed, option) {
  const items = value.split(',').map((item) => item.trim()).filter(Boolean);
  const unknown = items.filter((item) => !allowed.includes(item));
  if (unknown.length > 0 || items.length === 0) {
    fail(`${option} không hợp lệ: "${value}". Chọn trong: ${allowed.join(', ')}`);
  }
  // Giữ đúng thứ tự chuẩn dù người gọi gõ lộn xộn
  return allowed.filter((item) => items.includes(item));
}

function parseArgs(argv) {
  const browsersEnv = process.env.BROWSERS?.trim();
  const browsers = browsersEnv ? parseList(browsersEnv, ALL_BROWSERS, 'BROWSERS') : ALL_BROWSERS;
  const options = { withApi: false, browsers, suites: ALL_SUITES, playwrightArgs: [] };
  for (const arg of argv) {
    if (arg === '--with-api') {
      options.withApi = true;
    } else if (arg.startsWith('--browsers=')) {
      options.browsers = parseList(arg.slice('--browsers='.length), ALL_BROWSERS, '--browsers');
    } else if (arg.startsWith('--suites=')) {
      options.suites = parseList(arg.slice('--suites='.length), ALL_SUITES, '--suites');
    } else {
      options.playwrightArgs.push(arg);
    }
  }
  return options;
}

function buildStages({ withApi, browsers, suites }) {
  const stages = withApi ? [{ name: 'api', projects: ['api'] }] : [];
  for (const browser of browsers) {
    stages.push({ name: browser, projects: suites.map((suite) => `${suite}-${browser}`) });
  }
  return stages;
}

function runStage(stage, index, playwrightArgs) {
  const args = [
    PLAYWRIGHT_CLI,
    'test',
    ...stage.projects.map((project) => `--project=${project}`),
    // Bộ nào bị --grep lọc hết test thì lượt đó vẫn tính PASS, không báo "No tests found"
    '--pass-with-no-tests',
    ...playwrightArgs,
  ];
  process.stdout.write(`\n===== [${index + 1}] ${stage.name.toUpperCase()} — ${stage.projects.join(', ')} =====\n`);
  const result = spawnSync(process.execPath, args, {
    cwd: ROOT,
    stdio: 'inherit',
    env: {
      ...process.env,
      RUN_STAGE: stage.name,
      RUN_BROWSERS: options.browsers.join(', '),
      KEEP_PREVIOUS_RESULTS: index === 0 ? 'false' : 'true',
    },
  });
  return result.status ?? 1;
}

const options = parseArgs(process.argv.slice(2));
const stages = buildStages(options);
const results = stages.map((stage, index) => ({ stage: stage.name, code: runStage(stage, index, options.playwrightArgs) }));

process.stdout.write('\n===== TỔNG KẾT THEO LƯỢT =====\n');
for (const { stage, code } of results) {
  process.stdout.write(`  ${stage.padEnd(8)} ${code === 0 ? 'PASS' : `FAIL (exit ${code})`}\n`);
}
process.stdout.write('HTML report từng lượt: reports/html/<lượt>/ · Allure gộp mọi lượt: npm run report\n');

process.exit(results.some(({ code }) => code !== 0) ? 1 : 0);
