import type { Cookie, Response } from '@playwright/test';
import { CrmBasePage } from './crm-base.page';

const REMEMBER_COOKIE = 'autologin';

/** Bộ kết quả nhìn thấy được sau một lần đăng nhập thất bại — so sánh giữa các lần để chứng minh không lộ thông tin */
export interface FailedLoginOutcome {
  alerts: string[];
  alertCount: number;
  url: string;
}

/** Trang đăng nhập khu quản trị Perfex CRM — /admin/authentication. Locator đã verify trên DOM thật */
export class CrmLoginPage extends CrmBasePage {
  protected readonly path = '/admin/authentication';

  readonly logoLink = this.page.getByRole('link', { name: 'Perfex CRM | Anh Tester Demo' });
  readonly heading = this.page.getByRole('heading', { name: 'Login', level: 1 });
  readonly form = this.page.locator('form');
  readonly emailInput = this.page.getByLabel('Email Address');
  readonly passwordInput = this.page.getByLabel('Password');
  readonly rememberMeCheckbox = this.page.getByRole('checkbox', { name: 'Remember me' });
  /** Chữ "Remember me" của <label for="remember"> — bấm vào đây phải tích ô vuông */
  readonly rememberMeLabel = this.page.getByText('Remember me', { exact: true });
  readonly loginButton = this.page.getByRole('button', { name: 'Login' });
  readonly forgotPasswordLink = this.page.getByRole('link', { name: 'Forgot Password?' });
  /** Dải báo lỗi đỏ phía trên biểu mẫu — lỗi trường bắt buộc có thể ra nhiều dải cùng lúc */
  readonly errorAlert = this.page.locator('.alert-danger');
  /** Ô Email đang bị trình duyệt đánh dấu sai định dạng (input type=email, pseudo-class :invalid) */
  readonly invalidEmailInput = this.emailInput.and(this.page.locator(':invalid'));
  /** Mọi dấu hiệu khoá / hạn chế đăng nhập (CRM_LOGIN_TC_015) */
  readonly lockoutMessages = this.page.getByText(/locked|blocked|too many|try again in/i);
  /** Dấu vết lỗi cơ sở dữ liệu lộ ra màn hình (CRM_LOGIN_TC_017) */
  readonly databaseErrorMessages = this.page.getByText(/sql|database error|mysql|syntax error/i);
  /** Trang lỗi CSRF của Perfex khi token hết hạn */
  readonly pageExpiredMessage = this.page.getByText('419 Page Expired!');

  readonly buttons = this.page.getByRole('button');
  readonly submitButtons = this.page.locator('button[type="submit"]');
  readonly thirdPartyLoginControls = this.page
    .getByRole('button', { name: /google|facebook|microsoft/i })
    .or(this.page.getByRole('link', { name: /google|facebook|microsoft/i }));
  readonly captchaWidgets = this.page.locator('.g-recaptcha, [class*="captcha"], iframe[src*="recaptcha"]');
  readonly scripts = this.page.locator('script');

  /** Trang đăng nhập khu khách hàng — nơi logo dẫn tới (trang chủ `/` chuyển hướng về đây) */
  get clientLoginUrl(): string {
    return new URL('/authentication/login', this.origin).href;
  }

  get dashboardUrl(): string {
    return new URL('/admin/', this.origin).href;
  }

  protected async waitUntilLoaded(): Promise<void> {
    await this.loginButton.waitFor();
  }

  async enterCredentials(email: string, password: string): Promise<void> {
    await this.fillField(this.emailInput, email, 'Email Address');
    await this.fillField(this.passwordInput, password, 'Password', { secret: true });
  }

  async tickRememberMe(): Promise<void> {
    await this.step('Tích ô Remember me', async () => {
      await this.rememberMeCheckbox.check();
    });
  }

  async clickRememberMeLabel(): Promise<void> {
    await this.clickOn(this.rememberMeLabel, 'chữ Remember me');
  }

  async typePassword(password: string): Promise<void> {
    await this.fillField(this.passwordInput, password, 'Password', { secret: true });
  }

  async submit(): Promise<void> {
    await this.clickOn(this.loginButton, 'nút Login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.enterCredentials(email, password);
    await this.submit();
  }

  /** Bấm Login và bắt response của POST /admin/authentication (trước khi trình duyệt đi theo chuyển hướng) */
  async submitAndCaptureResponse(): Promise<Response> {
    return this.step('Bấm nút Login và ghi nhận phản hồi của máy chủ', async () => {
      const [response] = await Promise.all([
        this.page.waitForResponse(
          (res) => res.request().method() === 'POST' && new URL(res.url()).pathname === '/admin/authentication',
        ),
        this.loginButton.click(),
      ]);
      return response;
    });
  }

  /**
   * Bấm Login và bắt response của tài liệu trang cuối cùng trình duyệt dừng lại.
   * Đăng nhập thất bại: POST trả 303 về chính /admin/authentication, rồi GET trang đó kèm dải báo lỗi
   */
  async submitAndCaptureFinalDocument(): Promise<Response> {
    return this.step('Bấm nút Login và ghi nhận trang máy chủ trả về', async () => {
      const [response] = await Promise.all([
        this.page.waitForResponse(
          (res) => res.request().method() === 'GET' && res.request().resourceType() === 'document',
        ),
        this.loginButton.click(),
      ]);
      return response;
    });
  }

  /** Nội dung từng dải báo lỗi (trên xuống), số dải và URL — bộ kết quả để so sánh giữa các lần đăng nhập sai */
  async failedLoginOutcome(): Promise<FailedLoginOutcome> {
    const alerts = await this.errorAlert.allInnerTexts();
    return { alerts: alerts.map((text) => text.trim()), alertCount: alerts.length, url: this.page.url() };
  }

  async doubleClickLogin(): Promise<void> {
    await this.step('Bấm nút Login hai lần liên tiếp', async () => {
      await this.loginButton.dblclick();
    });
  }

  async clickLogo(): Promise<void> {
    await this.clickOn(this.logoLink, 'logo Perfex CRM');
  }

  /** Kết thúc mọi phiên còn sót bằng URL đăng xuất, rồi quay lại trang đăng nhập */
  async endAnySessionAndOpen(): Promise<void> {
    await this.step('Mở URL đăng xuất để kết thúc phiên còn sót', async () => {
      await this.page.goto('/admin/authentication/logout');
    });
    await this.open();
  }

  /** Cookie ghi nhớ đăng nhập — undefined nếu hệ thống không phát hành */
  async rememberMeCookie(): Promise<Cookie | undefined> {
    const cookies = await this.page.context().cookies();
    return cookies.find((cookie) => cookie.name === REMEMBER_COOKIE);
  }
}
