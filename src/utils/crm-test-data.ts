import { TestData } from './test-data';

/** Dữ liệu module LOGIN — Perfex CRM. Nguồn: docs/testcases/login/web/test_cases_login_web.md */

/** Nguồn ghi vào dữ liệu sinh động — nhìn email/mật khẩu sai là biết spec nào gửi */
const SOURCE = 'crmLogin';

/** Đặc điểm từng vai trò sau khi đăng nhập — `userId` là class `user-id-<n>` trên thẻ body */
export const CRM_ROLES = {
  admin: { userId: 2, sideMenuCount: 14 },
  projectManager: {
    userId: 3,
    sideMenuCount: 9,
    hiddenMenus: ['Subscriptions', 'Expenses', 'Estimate Request', 'Knowledge Base', 'Reports'],
  },
} as const;

/** Mật khẩu gõ thử để kiểm ô Password che ký tự (CRM_LOGIN_TC_002 mục 5) — không dùng để đăng nhập */
export const MASK_CHECK_PASSWORD = 'Abc12345';

/** Hình thái cookie `autologin` (PHP serialize) — `key` đúng 16 ký tự hex */
export const REMEMBER_COOKIE_SHAPE = /^a:2:\{s:7:"user_id";s:\d+:"\d+";s:3:"key";s:16:"[0-9a-f]{16}";\}$/;

export interface EmailVariant {
  code: string;
  label: string;
  email: string;
}

/** `ADMIN@Example.COM` từ `admin@example.com`: local-part HOA, nhãn tên miền viết hoa chữ đầu, đuôi miền HOA */
function mixedCase(email: string): string {
  const [local, domain] = email.split('@');
  const labels = domain.split('.');
  const mixedDomain = labels
    .map((label, index) => (index === labels.length - 1 ? label.toUpperCase() : label.charAt(0).toUpperCase() + label.slice(1)))
    .join('.');
  return `${local.toUpperCase()}@${mixedDomain}`;
}

/** 4 biến thể chuẩn hoá email của CRM_LOGIN_TC_007 — sinh từ email thật để không hardcode tài khoản */
export function emailNormalizationVariants(email: string): EmailVariant[] {
  return [
    { code: 'a', label: 'lẫn hoa thường', email: mixedCase(email) },
    { code: 'b', label: 'toàn chữ HOA', email: email.toUpperCase() },
    { code: 'c', label: '2 dấu cách mỗi đầu', email: `  ${email}  ` },
    { code: 'd', label: '1 dấu cách cuối', email: `${email} ` },
  ];
}

/** Nội dung nguyên văn các dải báo lỗi của trang đăng nhập */
export const LOGIN_MESSAGES = {
  invalidCredentials: 'Invalid email or password',
  emailRequired: 'The Email Address field is required.',
  passwordRequired: 'The Password field is required.',
} as const;

/** Ký tự đa ngôn ngữ + emoji (CRM_LOGIN_TC_018) */
export const UNICODE_PASSWORD = 'MậtKhẩuTiếngViệt😀🎉';

/** Dữ liệu sai sinh động, truy vết được: mỗi lần chạy một giá trị, nhìn log biết spec nào gửi */
export const wrongLogin = {
  password: (): string => `SaiMatKhau_${TestData.code(SOURCE)}`,
  /** Email chắc chắn không tồn tại — `label` phân biệt nhiều email trong cùng 1 test */
  email: (label?: string): string => TestData.email(label ? `notexist_${SOURCE}_${label}` : `notexist_${SOURCE}`),
};

export interface CredentialVariant {
  code: string;
  label: string;
  email: string;
  password: string;
}

/** 4 biến thể trường bắt buộc của CRM_LOGIN_TC_011, kèm các dải lỗi kỳ vọng theo thứ tự trên xuống */
export function requiredFieldVariants(adminEmail: string): (CredentialVariant & { expectedAlerts: string[] })[] {
  const bothRequired = [LOGIN_MESSAGES.passwordRequired, LOGIN_MESSAGES.emailRequired];
  return [
    { code: 'a', label: 'rỗng cả hai', email: '', password: '', expectedAlerts: bothRequired },
    { code: 'b', label: 'rỗng riêng Email', email: '', password: MASK_CHECK_PASSWORD, expectedAlerts: [LOGIN_MESSAGES.emailRequired] },
    { code: 'c', label: 'rỗng riêng Password', email: adminEmail, password: '', expectedAlerts: [LOGIN_MESSAGES.passwordRequired] },
    { code: 'd', label: 'toàn khoảng trắng', email: '   ', password: '   ', expectedAlerts: bothRequired },
  ];
}

/** 5 email sai định dạng của CRM_LOGIN_TC_012 — trình duyệt phải chặn trước khi gửi */
export const MALFORMED_EMAILS = [
  { code: 'a', label: 'thiếu @', email: 'abc' },
  { code: 'b', label: 'thiếu tên miền', email: 'abc@' },
  { code: 'c', label: 'thiếu phần trước @', email: '@example.com' },
  { code: 'd', label: 'nhiều @', email: 'a@b@example.com' },
  { code: 'e', label: 'chuỗi tiêm SQL', email: "admin@example.com' OR '1'='1" },
] as const;

/** Chuỗi tấn công nhập vào ô Password (CRM_LOGIN_TC_017) */
export function passwordAttackVariants(adminEmail: string): CredentialVariant[] {
  return [
    { code: 'a', label: 'XSS', email: wrongLogin.email('xss'), password: '<script>alert(1)</script>' },
    { code: 'b', label: 'tiêm SQL', email: adminEmail, password: "' OR 1=1--" },
  ];
}

/** Đảo kiểu chữ mọi ký tự chữ cái: hoa → thường, thường → hoa (CRM_LOGIN_TC_014) */
export function swapCase(text: string): string {
  return [...text].map((char) => (char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase())).join('');
}

/** Chuỗi có ít nhất một chữ cái phân biệt hoa/thường — tiền đề của CRM_LOGIN_TC_014 */
export function hasLetter(text: string): boolean {
  return text !== swapCase(text);
}
