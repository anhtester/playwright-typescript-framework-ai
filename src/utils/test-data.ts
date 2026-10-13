import { randomBytes, randomInt } from 'node:crypto';
import path from 'node:path';
import { env } from './env.config';

export interface NewUser {
  name: string;
  email: string;
  password: string;
  phone: string;
}

/**
 * Dữ liệu unique + truy vết được: auto_<nguồn>_w<worker>_<timestamp>_<random>
 * - worker + random → 5 luồng song song không bao giờ trùng email
 * - <nguồn> = tên spec → nhìn bản ghi trong DB biết ngay spec nào tạo ra
 * - email luôn viết thường: hệ thống so email không phân biệt hoa thường, test biến thể hoa/thường
 *   cần bản gốc chữ thường để đối chiếu
 */
export class TestData {
  private static suffix(): string {
    const worker = process.env.TEST_WORKER_INDEX ?? '0';
    return `w${worker}_${Date.now()}_${randomBytes(2).toString('hex')}`;
  }

  static email(source: string): string {
    return `auto_${source}_${this.suffix()}@${env.testEmailDomain}`.toLowerCase();
  }

  /** Mã/định danh unique — vd id chắc chắn không tồn tại để test 404 */
  static code(source: string): string {
    return `auto_${source}_${this.suffix()}`;
  }

  static password(): string {
    return `Auto@${randomBytes(4).toString('hex')}9`;
  }

  /** Chuỗi dài đúng `length` ký tự — dữ liệu biên / độ bền */
  static longText(length: number, char = 'A'): string {
    return char.repeat(length);
  }

  static phone(): string {
    return `09${String(randomInt(0, 100_000_000)).padStart(8, '0')}`;
  }

  /** `label` phân biệt nhiều tài khoản trong cùng 1 test — vd `a` / `b` → email `…_a@auto.test` */
  static newUser(source: string, label?: string): NewUser {
    const suffix = label ? `${this.suffix()}_${label}` : this.suffix();
    return {
      name: `Auto ${source} ${suffix}`,
      email: `auto_${source}_${suffix}@${env.testEmailDomain}`.toLowerCase(),
      password: this.password(),
      phone: this.phone(),
    };
  }

  /** 'sign-in.spec.ts' → 'signIn' · 'register-login.api.spec.ts' → 'registerLoginApi' */
  static sourceOf(specFile: string): string {
    return path
      .basename(specFile)
      .replace(/\.spec\.ts$/, '')
      .split(/[-.]/)
      .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
      .join('');
  }
}
