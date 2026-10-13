import fs from 'node:fs';
import path from 'node:path';

const REPORTS_DIR = path.resolve(__dirname, '../../reports');

/**
 * Output chỉ thuộc về MỘT lần chạy — dọn trước khi chạy để report không trộn kết quả cũ.
 * reports/allure-report/ được GIỮ LẠI: scripts/allure.mjs lấy history trong đó để vẽ biểu đồ trend.
 * reports/html/ dọn cả thư mục cha — run-browsers.mjs ghi report vào reports/html/<lượt>/, Playwright chỉ dọn thư mục con đó.
 * reports/test-artifacts/ do Playwright tự dọn.
 */
const PER_RUN_DIRS = ['allure-results', 'logs', 'screenshots', 'html'];

/**
 * Xoá NỘI DUNG chứ không xoá chính thư mục: trên Windows, thư mục đang mở trong Explorer/terminal
 * không xoá được (EPERM), còn file bên trong thì vẫn xoá bình thường.
 */
function emptyDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const entry of fs.readdirSync(dir)) {
    fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
  }
}

export default function globalSetup(): void {
  // scripts/run-browsers.mjs gọi Playwright nhiều lượt (API → Chrome → Edge → Firefox) cho CÙNG một lần chạy:
  // chỉ lượt đầu dọn, các lượt sau giữ kết quả để Allure gộp đủ mọi trình duyệt
  if (process.env.KEEP_PREVIOUS_RESULTS === 'true') {
    return;
  }
  for (const dir of PER_RUN_DIRS) {
    emptyDir(path.join(REPORTS_DIR, dir));
  }
}
