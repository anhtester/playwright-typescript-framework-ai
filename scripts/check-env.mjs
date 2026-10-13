#!/usr/bin/env node
/**
 * Kiểm tra biến môi trường TRƯỚC khi chạy test — thiếu biến bắt buộc thì dừng ngay với danh sách tên biến,
 * thay vì hàng chục test cùng đỏ một lỗi. Chỉ in TÊN biến, KHÔNG in giá trị.
 *
 *   node scripts/check-env.mjs        (npm run check:env) — local đọc .env, CI đọc biến của runner
 *
 * Danh sách khớp src/utils/env.config.ts — thêm biến tài khoản mới thì thêm vào đây.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(ROOT, '.env'), quiet: true });

/** Thiếu là bộ test tương ứng đỏ */
const REQUIRED = {
  'Book (UI + API)': ['BASE_URL', 'API_URL', 'TEST_EMAIL', 'TEST_PASSWORD'],
  'Perfex CRM': ['CRM_ADMIN_EMAIL', 'CRM_ADMIN_PASSWORD', 'CRM_PM_EMAIL', 'CRM_PM_PASSWORD'],
  'Active eCommerce CMS': ['CMS_ADMIN_EMAIL', 'CMS_ADMIN_PASSWORD'],
};

/** Thiếu thì test tương ứng tự SKIP */
const OPTIONAL = {
  'CRM_LOGIN_TC_019, 020': ['CRM_CUSTOMER_EMAIL', 'CRM_CUSTOMER_PASSWORD'],
  'CRM_LOGIN_TC_014': ['CRM_TC014_EMAIL', 'CRM_TC014_PASSWORD'],
};

/** GitLab giữ nguyên chữ `$TEN_BIEN` khi biến được tham chiếu chưa khai — coi như thiếu */
function isSet(name) {
  const value = process.env[name]?.trim();
  return Boolean(value) && value !== `$${name}` && value !== `\${${name}}`;
}

const missing = [];
for (const [group, names] of Object.entries(REQUIRED)) {
  const absent = names.filter((name) => !isSet(name));
  process.stdout.write(`  ${absent.length === 0 ? 'OK  ' : 'THIẾU'} ${group}${absent.length ? `: ${absent.join(', ')}` : ''}\n`);
  missing.push(...absent);
}
for (const [tests, names] of Object.entries(OPTIONAL)) {
  const absent = names.filter((name) => !isSet(name));
  if (absent.length > 0) {
    process.stdout.write(`  SKIP  ${tests} — chưa khai ${absent.join(', ')}\n`);
  }
}

if (missing.length > 0) {
  process.stderr.write(
    `\n[check-env] Thiếu ${missing.length} biến bắt buộc: ${missing.join(', ')}\n`
      + '  - Local: điền vào .env (mẫu .env.example)\n'
      + '  - GitHub: Settings → Secrets and variables → Actions → Repository secrets\n'
      + '  - GitLab: Settings → CI/CD → Variables (KHÔNG tick Protected nếu chạy ở merge request)\n\n',
  );
  process.exit(1);
}
process.stdout.write('[check-env] Đủ biến bắt buộc\n');
