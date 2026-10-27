import path from 'node:path';
import dotenv from 'dotenv';

// quiet: dotenv 17 mặc định in 1 dòng log ra stdout — tắt đi để report không dính attachment stdout
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

function required(key: string): string {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${key}. Tạo file .env từ .env.example rồi điền giá trị.`);
  }
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key]?.trim() || fallback;
}

/** Tài khoản chỉ một số test cần — thiếu một trong hai biến thì coi như chưa cấp */
function optionalAccount(emailKey: string, passwordKey: string): { email: string; password: string } | undefined {
  const email = process.env[emailKey]?.trim();
  const password = process.env[passwordKey]?.trim();
  return email && password ? { email, password } : undefined;
}

function positiveInt(key: string, fallback: number): number {
  const raw = optional(key, String(fallback));
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`Biến môi trường ${key} phải là số nguyên dương, đang là "${raw}"`);
  }
  return value;
}

function viewport(key: string, fallback: string): { width: number; height: number } {
  const raw = optional(key, fallback);
  const match = /^(\d+)x(\d+)$/i.exec(raw);
  if (!match) {
    throw new Error(`Biến môi trường ${key} phải có dạng <rộng>x<cao>, ví dụ 1920x1080. Đang là "${raw}"`);
  }
  return { width: Number(match[1]), height: Number(match[2]) };
}

/** Cấu hình tập trung — mọi nơi trong framework đọc từ đây, không đọc process.env trực tiếp */
export const env = {
  baseURL: required('BASE_URL'),
  apiURL: required('API_URL'),
  headless: optional('HEADLESS', 'true').toLowerCase() !== 'false',
  workers: positiveInt('WORKERS', 3),
  timeout: positiveInt('TIMEOUT', 60_000),
  expectTimeout: positiveInt('EXPECT_TIMEOUT', 10_000),
  /** SLA thời gian phản hồi của mỗi API call (ms) */
  apiSlaMs: positiveInt('API_SLA_MS', 4_000),
  viewport: viewport('VIEWPORT', '1920x1080'),
  testEmailDomain: optional('TEST_EMAIL_DOMAIN', 'auto.test'),
  logLevel: optional('LOG_LEVEL', 'info'),
  /** Perfex CRM — hệ thống thứ hai, chạy ở project `crm` của playwright.config.ts */
  crmURL: optional('CRM_URL', 'https://crm.anhtester.com'),
  /** Active eCommerce CMS — hệ thống thứ ba, chạy ở project `cms` của playwright.config.ts */
  cmsURL: optional('CMS_URL', 'https://cms.anhtester.com'),

  /** Tài khoản demo dùng chung — đọc lười: chỉ test nào cần mới báo thiếu biến */
  get demoAccount(): { email: string; password: string } {
    return { email: required('TEST_EMAIL'), password: required('TEST_PASSWORD') };
  },

  /** Tài khoản Admin của Perfex CRM (môi trường dùng chung) */
  get crmAdmin(): { email: string; password: string } {
    return { email: required('CRM_ADMIN_EMAIL'), password: required('CRM_ADMIN_PASSWORD') };
  },

  /** Tài khoản Project Manager của Perfex CRM — bộ menu rút gọn */
  get crmProjectManager(): { email: string; password: string } {
    return { email: required('CRM_PM_EMAIL'), password: required('CRM_PM_PASSWORD') };
  },

  /** Tài khoản khách hàng của cổng /login (CRM_LOGIN_TC_019, 020) — undefined nếu .env chưa khai: test tự SKIP */
  get crmCustomer(): { email: string; password: string } | undefined {
    return optionalAccount('CRM_CUSTOMER_EMAIL', 'CRM_CUSTOMER_PASSWORD');
  },

  /** Tài khoản staff có mật khẩu chứa chữ cái (CRM_LOGIN_TC_014) — undefined nếu .env chưa khai: test tự SKIP */
  get crmLetterPasswordStaff(): { email: string; password: string } | undefined {
    return optionalAccount('CRM_TC014_EMAIL', 'CRM_TC014_PASSWORD');
  },

  /** Tài khoản quản trị (vai trò staff) của Active eCommerce CMS (môi trường dùng chung) */
  get cmsAdmin(): { email: string; password: string } {
    return { email: required('CMS_ADMIN_EMAIL'), password: required('CMS_ADMIN_PASSWORD') };
  },
};
