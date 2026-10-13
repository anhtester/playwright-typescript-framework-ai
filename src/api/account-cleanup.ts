import { test, type TestInfo } from '@playwright/test';
import type { AuthApi } from './auth.api';
import type { UserApi } from './user.api';
import type { LoginRequest } from './models/auth.model';
import { createLogger } from '../utils/logger';

const logger = createLogger('cleanup');

/**
 * Đăng nhập bằng bộ track trả các mã này → không có tài khoản nào mang đúng email + mật khẩu đó:
 * 404 chưa từng tạo / đã tự xoá · 400 email thuộc tài khoản khác mật khẩu · 422 email sai định dạng (không thể tồn tại)
 */
const NOT_OWNED_STATUSES = new Set([400, 404, 422]);

/**
 * Theo dõi tài khoản do test tạo ra (qua API hoặc qua form UI) và xoá ở teardown.
 * Môi trường dùng chung → mỗi test tự dọn đúng dữ liệu CỦA MÌNH, không đụng dữ liệu người khác.
 */
export class AccountCleanup {
  private readonly accounts: LoginRequest[] = [];

  constructor(
    private readonly authApi: AuthApi,
    private readonly userApi: UserApi,
  ) {}

  /** Gọi TRƯỚC thao tác tạo tài khoản — test fail giữa chừng thì tài khoản vẫn được dọn */
  track(account: LoginRequest): void {
    this.accounts.push({ email: account.email, password: account.password });
  }

  async run(testInfo: TestInfo): Promise<void> {
    for (const account of this.accounts) {
      try {
        await test.step(`Dọn dữ liệu: xoá tài khoản ${account.email}`, () => this.deleteAccount(account));
      } catch (error) {
        // Dọn dẹp lỗi không được che kết quả nghiệp vụ của test — ghi log + annotation để còn truy lại
        logger.warn('Không xoá được tài khoản test', { email: account.email, error: String(error) });
        testInfo.annotations.push({ type: 'cleanup-warning', description: `Chưa xoá được ${account.email}` });
      }
    }
  }

  private async deleteAccount(account: LoginRequest): Promise<void> {
    const login = await this.authApi.login(account);
    if (NOT_OWNED_STATUSES.has(login.status)) {
      logger.info('Bỏ qua dọn dẹp — không có tài khoản nào do lần track này tạo', { email: account.email, status: login.status });
      return;
    }
    if (login.status !== 200) {
      // Tài khoản CÓ THỂ còn đó (vd bị khoá → 403) mà không lấy được token để xoá — phải báo sót, không im lặng bỏ qua
      throw new Error(`Không đăng nhập được để xoá: HTTP ${login.status}`);
    }
    const token = login.body.accessToken;
    const profile = await this.authApi.me(token);
    const deleted = await this.userApi.deleteUser(profile.body.id, token);
    if (deleted.status !== 200) {
      throw new Error(`DELETE /api/user/${profile.body.id} trả HTTP ${deleted.status}`);
    }
    // Xác nhận đã xoá thật: đăng nhập lại phải ra 404 — xoá không có hiệu lực thì báo ngay, không để sót
    const relogin = await this.authApi.login(account);
    if (relogin.status !== 404) {
      throw new Error(`Đã gọi xoá nhưng đăng nhập lại vẫn trả HTTP ${relogin.status}`);
    }
    logger.info('Đã xoá tài khoản test', { email: account.email });
  }
}
