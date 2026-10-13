#!/usr/bin/env node
/**
 * Chạy Allure 2 CLI cài TRONG project (devDependency allure-commandline) — máy không cần cài Allure.
 * Allure 2 là app Java → máy cần JRE 8+ (java trên PATH hoặc JAVA_HOME).
 *
 *   node scripts/allure.mjs generate   sinh reports/allure-report (giữ history để có biểu đồ trend)
 *   node scripts/allure.mjs open       mở report đã sinh
 *   node scripts/allure.mjs report     generate + open
 *   node scripts/allure.mjs single     sinh 1 file HTML duy nhất → reports/allure-report-single/index.html
 *   node scripts/allure.mjs <args>     chuyển thẳng tham số cho allure, vd: --version
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const allure = require('allure-commandline');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RESULTS = path.join(ROOT, 'reports', 'allure-results');
const REPORT = path.join(ROOT, 'reports', 'allure-report');
const REPORT_SINGLE = path.join(ROOT, 'reports', 'allure-report-single');

function fail(message) {
  process.stderr.write(`\n[allure] ${message}\n\n`);
  process.exit(1);
}

function javaCommand() {
  const javaHome = process.env.JAVA_HOME;
  if (javaHome) {
    return path.join(javaHome, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
  }
  return 'java';
}

/** Allure 2 cần Java 8+ — kiểm trước để báo lỗi dễ hiểu thay vì lỗi khó đọc của allure.bat */
function assertJava() {
  const probe = spawnSync(javaCommand(), ['-version'], { encoding: 'utf8' });
  if (probe.error || probe.status !== 0) {
    fail(
      'Không tìm thấy Java. Allure 2 cần JRE/JDK 8 trở lên.\n'
        + '  - Kiểm tra: java -version\n'
        + '  - Hoặc đặt biến JAVA_HOME trỏ tới thư mục JDK/JRE\n'
        + '  Máy không có Java vẫn XEM được report: nhờ người có Java chạy "npm run report:single" rồi gửi file HTML.',
    );
  }
  const versionLine = `${probe.stderr}${probe.stdout}`.match(/version "([^"]+)"/)?.[1] ?? '';
  const [first, second] = versionLine.split('.').map(Number);
  const major = first === 1 ? second : first;
  if (Number.isFinite(major) && major < 8) {
    fail(`Java ${versionLine} quá cũ — Allure 2 cần Java 8 trở lên.`);
  }
}

function assertResults() {
  const hasResults = fs.existsSync(RESULTS) && fs.readdirSync(RESULTS).some((file) => file.endsWith('-result.json'));
  if (!hasResults) {
    fail('Chưa có kết quả trong reports/allure-results — chạy "npm test" trước.');
  }
}

/** Chép history của report lần trước vào results → Allure vẽ được biểu đồ trend qua các lần chạy */
function carryHistory() {
  const previous = path.join(REPORT, 'history');
  if (fs.existsSync(previous)) {
    fs.cpSync(previous, path.join(RESULTS, 'history'), { recursive: true });
  }
}

function runAllure(args) {
  return new Promise((resolve) => {
    allure(args).on('close', (code) => resolve(code ?? 1));
  });
}

async function main() {
  const [command = 'report', ...rest] = process.argv.slice(2);
  assertJava();

  const generate = async () => {
    assertResults();
    carryHistory();
    return runAllure(['generate', RESULTS, '-o', REPORT, '--clean']);
  };

  let code;
  switch (command) {
    case 'generate':
      code = await generate();
      break;
    case 'open':
      code = await runAllure(['open', REPORT]);
      break;
    case 'report':
      code = await generate();
      if (code === 0) {
        code = await runAllure(['open', REPORT]);
      }
      break;
    case 'single':
      assertResults();
      code = await runAllure(['generate', RESULTS, '-o', REPORT_SINGLE, '--clean', '--single-file']);
      break;
    default:
      code = await runAllure([command, ...rest]);
  }
  process.exit(code);
}

main();
