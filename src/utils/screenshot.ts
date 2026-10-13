import path from 'node:path';
import type { Page, TestInfo } from '@playwright/test';
import { tcIdOf } from './allure-meta';
import { createLogger } from './logger';

const SCREENSHOT_DIR = path.resolve(__dirname, '../../reports/screenshots');
const logger = createLogger('screenshot');

/**
 * Tên file theo TC ID (label testId khai ở tcMeta) — unique kể cả với test data-driven chung 1 dòng code.
 * Test chưa khai TC ID thì dùng testId nội bộ của Playwright.
 */
function fileNameOf(testInfo: TestInfo, attachmentName: string): string {
  const repeat = testInfo.repeatEachIndex > 0 ? `_rep${testInfo.repeatEachIndex}` : '';
  return `${tcIdOf(testInfo) ?? testInfo.testId}_${testInfo.project.name}_retry${testInfo.retry}${repeat}__${attachmentName}.png`;
}

/**
 * Chụp trạng thái cuối cho MỌI test — cả PASS lẫn FAIL (reporting_rules.md mục 3).
 * Tên attachment cố định để so sánh giữa các lần chạy. Ảnh lưu thêm ra reports/screenshots/.
 */
export async function attachFinalScreenshot(page: Page, testInfo: TestInfo): Promise<void> {
  if (testInfo.status === 'skipped') {
    return;
  }
  const name = testInfo.status === 'passed' ? 'trang_thai_cuoi_cua_test' : 'trang_thai_khi_that_bai';
  const file = path.join(SCREENSHOT_DIR, fileNameOf(testInfo, name));
  try {
    await page.screenshot({ path: file });
    await testInfo.attach(name, { path: file, contentType: 'image/png' });
  } catch (error) {
    // Page đã crash / đóng — không để lỗi chụp ảnh che mất lỗi thật của test
    logger.warn('Không chụp được ảnh cuối test', { test: testInfo.title, error: String(error) });
  }
}
