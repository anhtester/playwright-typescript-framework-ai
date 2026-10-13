#!/usr/bin/env node
/**
 * Gửi tóm tắt kết quả chạy test lên Slack qua Incoming Webhook — đọc từ Allure report đã sinh.
 *
 *   node scripts/slack-notify.mjs        (npm run notify:slack) — cần SLACK_WEBHOOK_URL, chưa khai thì bỏ qua
 *
 * Biến môi trường:
 *   SLACK_WEBHOOK_URL   webhook của kênh nhận tin (GitHub/GitLab: secret · local: .env)
 *   REPORT_URL          link Allure report public (GitHub Pages / GitLab Pages) — trống thì không có nút report
 *   Thông tin lượt chạy tự lấy từ biến của GitHub Actions (GITHUB_*) hoặc GitLab CI (CI_*)
 *
 * Tin nhắn CHỈ có số liệu + tên test FAIL + TC ID — không có email, mật khẩu, nội dung lỗi.
 * Gửi thất bại chỉ cảnh báo, không làm đỏ job.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(ROOT, '.env'), quiet: true });

const REPORT = path.join(ROOT, 'reports', 'allure-report');
const MAX_FAILED_LISTED = 10;

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

/** Thông tin lượt chạy — GitHub Actions hoặc GitLab CI, chạy local thì để trống */
function runInfo() {
  const env = process.env;
  if (env.GITHUB_ACTIONS) {
    return {
      ci: 'GitHub Actions',
      runUrl: `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`,
      trigger: env.GITHUB_EVENT_NAME,
      branch: env.GITHUB_REF_NAME,
      commit: env.GITHUB_SHA?.slice(0, 7),
      actor: env.GITHUB_ACTOR,
    };
  }
  if (env.GITLAB_CI) {
    return {
      ci: 'GitLab CI',
      runUrl: env.CI_PIPELINE_URL,
      trigger: env.CI_PIPELINE_SOURCE,
      branch: env.CI_COMMIT_REF_NAME,
      commit: env.CI_COMMIT_SHORT_SHA,
      actor: env.GITLAB_USER_LOGIN,
    };
  }
  return { ci: 'Local' };
}

const TRIGGER_LABELS = {
  push: 'push',
  schedule: 'lịch hằng ngày',
  workflow_dispatch: 'bấm tay',
  web: 'bấm tay',
  pull_request: 'pull request',
  merge_request_event: 'merge request',
};

function formatDuration(ms) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  return minutes > 0 ? `${minutes}m ${totalSeconds % 60}s` : `${totalSeconds}s`;
}

/** DD-MM-YYYY HH:mm giờ Việt Nam */
function formatVnTime(timestamp) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(new Date(timestamp)).map((part) => [part.type, part.value]),
  );
  return `${parts.day}-${parts.month}-${parts.year} ${parts.hour}:${parts.minute}`;
}

/**
 * Kết quả CUỐI của từng test — lá của cây data/suites.json. Không quét thẳng data/test-cases/:
 * thư mục đó chứa cả các lần retry, đếm ra nhiều hơn summary.
 */
function finalResults() {
  const leaves = [];
  const walk = (node) => node.children?.forEach((child) => (child.children ? walk(child) : leaves.push(child)));
  walk(readJson(path.join(REPORT, 'data', 'suites.json')) ?? {});
  return leaves;
}

/** Test FAILED / BROKEN kèm TC ID và project (trình duyệt / api) */
function failedTests(results) {
  return results
    .filter((result) => ['failed', 'broken'].includes(result.status))
    .map((result) => {
      const testCase = readJson(path.join(REPORT, 'data', 'test-cases', `${result.uid}.json`));
      const label = (name) => testCase?.labels?.find((item) => item.name === name)?.value;
      return { name: result.name, testId: label('testId'), project: label('parentSuite') };
    })
    .sort((a, b) => `${a.project}${a.testId}`.localeCompare(`${b.project}${b.testId}`));
}

function buildPayload() {
  const info = runInfo();
  const summary = readJson(path.join(REPORT, 'widgets', 'summary.json'));
  const reportUrl = process.env.REPORT_URL?.trim();

  const context = [
    info.trigger && `Kích hoạt: *${TRIGGER_LABELS[info.trigger] ?? info.trigger}*`,
    info.branch && `Nhánh: \`${info.branch}\``,
    info.commit && `Commit: \`${info.commit}\``,
    info.actor && `Bởi: ${info.actor}`,
  ].filter(Boolean).join('  ·  ');

  const buttons = [
    reportUrl && { type: 'button', text: { type: 'plain_text', text: '📊 Allure report' }, url: reportUrl, style: 'primary' },
    info.runUrl && { type: 'button', text: { type: 'plain_text', text: '🔎 Log lượt chạy' }, url: info.runUrl },
  ].filter(Boolean);

  if (!summary) {
    const title = `⚠️ Playwright — ${info.ci}: không sinh được Allure report`;
    return {
      text: title,
      blocks: [
        { type: 'header', text: { type: 'plain_text', text: title } },
        { type: 'section', text: { type: 'mrkdwn', text: 'Job dừng trước khi có kết quả test (thiếu biến môi trường, lỗi cài đặt, lỗi TypeScript…). Xem log lượt chạy.' } },
        ...(context ? [{ type: 'context', elements: [{ type: 'mrkdwn', text: context }] }] : []),
        ...(buttons.length ? [{ type: 'actions', elements: buttons }] : []),
      ],
    };
  }

  const { passed = 0, failed = 0, broken = 0, skipped = 0, unknown = 0, total = 0 } = summary.statistic;
  const failing = failed + broken;
  const results = finalResults();
  const flaky = results.filter((result) => result.status === 'passed' && result.retriesCount > 0).length;
  const title = failing > 0
    ? `🔴 Playwright — ${info.ci}: ${failing} FAIL / ${total} test`
    : `🟢 Playwright — ${info.ci}: PASS ${passed}/${total} test`;

  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: title } },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Kết quả*\n✅ ${passed} passed · ❌ ${failed} failed · 💥 ${broken} broken · ⏭️ ${skipped + unknown} skipped`
            + (flaky > 0 ? `\n🔁 ${flaky} test PASS sau khi retry (flaky)` : ''),
        },
        { type: 'mrkdwn', text: `*Thời gian*\n${formatVnTime(summary.time.start)} · chạy ${formatDuration(summary.time.duration)}` },
      ],
    },
  ];

  if (failing > 0) {
    const tests = failedTests(results);
    const lines = tests.slice(0, MAX_FAILED_LISTED)
      .map((test) => `• ${test.testId ? `\`${test.testId}\` ` : ''}[${test.project ?? '?'}] ${test.name}`);
    if (tests.length > MAX_FAILED_LISTED) {
      lines.push(`… và ${tests.length - MAX_FAILED_LISTED} test khác — xem Allure report`);
    }
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*Test FAIL*\n${lines.join('\n')}` } });
  }
  if (context) {
    blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: context }] });
  }
  if (buttons.length) {
    blocks.push({ type: 'actions', elements: buttons });
  }
  return { text: title, blocks };
}

async function main() {
  const webhook = process.env.SLACK_WEBHOOK_URL?.trim();
  if (!webhook || webhook === '$SLACK_WEBHOOK_URL') {
    process.stdout.write('[slack] Chưa khai SLACK_WEBHOOK_URL — bỏ qua gửi Slack.\n');
    return;
  }
  const payload = buildPayload();
  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await response.text();
    if (!response.ok) {
      process.stderr.write(`[slack] Gửi thất bại — HTTP ${response.status}: ${body}\n`);
      return;
    }
    process.stdout.write(`[slack] Đã gửi: ${payload.text}\n`);
  } catch (error) {
    process.stderr.write(`[slack] Gửi thất bại — ${error.message}\n`);
  }
}

main();
