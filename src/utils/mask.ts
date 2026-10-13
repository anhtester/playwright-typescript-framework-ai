import { env } from './env.config';

/** Bí mật — luôn che: mật khẩu, token, cookie */
const SECRET_KEYS = new Set([
  'password',
  'password_confirmation',
  'accesstoken',
  'refetchtoken',
  'refreshtoken',
  'token',
  'authorization',
  'cookie',
  'set-cookie',
]);

/** Dữ liệu cá nhân — che khi có giá trị */
const PERSONAL_KEYS = new Set(['phone', 'address', 'avatarurl']);

/** Object chứa thông tin của NGƯỜI KHÁC (vd: người tạo sách) — che toàn bộ giá trị bên trong */
const OTHER_PEOPLE_KEYS = new Set(['auth']);

function hidden(value: unknown): string {
  const length = typeof value === 'string' ? value.length : JSON.stringify(value).length;
  return `<đã che: ${length} ký tự>`;
}

function isTestEmail(value: string): boolean {
  return value.toLowerCase().endsWith(`@${env.testEmailDomain.toLowerCase()}`);
}

function maskValue(value: unknown, key: string, insideOtherPeople: boolean): unknown {
  if (value === null || value === undefined || value === '') {
    return value;
  }
  const lowerKey = key.toLowerCase();
  if (SECRET_KEYS.has(lowerKey) || PERSONAL_KEYS.has(lowerKey)) {
    return hidden(value);
  }
  if (lowerKey === 'email' && typeof value === 'string' && !isTestEmail(value)) {
    return '<đã che: email không thuộc dữ liệu test>';
  }
  if (Array.isArray(value)) {
    return value.map((item) => maskValue(item, '', insideOtherPeople));
  }
  if (typeof value === 'object') {
    const nested = insideOtherPeople || OTHER_PEOPLE_KEYS.has(lowerKey);
    return Object.fromEntries(
      Object.entries(value).map(([childKey, child]) => [childKey, maskValue(child, childKey, nested)]),
    );
  }
  return insideOtherPeople && typeof value === 'string' ? hidden(value) : value;
}

/**
 * Che dữ liệu nhạy cảm trước khi đính vào report. Email thuộc domain test (TEST_EMAIL_DOMAIN)
 * được giữ nguyên để truy vết — đó là dữ liệu do chính automation sinh ra.
 */
export function maskSensitive<T>(value: T): T {
  return maskValue(value, '', false) as T;
}
