import { CrmBasePage } from './crm-base.page';

/** Trang đăng nhập cổng khách hàng Perfex CRM — /login, tách biệt khu quản trị. Locator đã verify trên DOM thật */
export class CrmClientLoginPage extends CrmBasePage {
  protected readonly path = '/login';

  readonly emailInput = this.page.getByLabel('Email Address');
  readonly passwordInput = this.page.getByLabel('Password');
  readonly loginButton = this.page.getByRole('button', { name: 'Login' });
  /** Lời chào đầu trang chủ cổng khách hàng ("Good Evening Customer!") — chỉ có sau khi đăng nhập thành công */
  readonly clientHomeGreeting = this.page.getByRole('heading', { level: 3, name: /^Good (Morning|Afternoon|Evening)\b/ });
  /** Tiêu đề tab của trang đăng nhập cổng khách hàng */
  readonly loginPageTitle = 'Please login';

  /** Trang chủ cổng khách hàng — nơi dừng sau khi khách hàng đăng nhập thành công */
  get clientHomeUrl(): string {
    return new URL('/', this.origin).href;
  }

  protected async waitUntilLoaded(): Promise<void> {
    await this.loginButton.waitFor();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillField(this.emailInput, email, 'Email Address');
    await this.fillField(this.passwordInput, password, 'Password', { secret: true });
    await this.clickOn(this.loginButton, 'nút Login của cổng khách hàng');
  }
}
