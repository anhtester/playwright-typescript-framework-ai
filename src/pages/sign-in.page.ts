import { BasePage } from './base.page';

/** Trang Đăng nhập — /sign-in. Locator đã verify trên DOM thật */
export class SignInPage extends BasePage {
  protected readonly path = '/sign-in';

  readonly heading = this.page.getByRole('heading', { name: 'Sign in' });
  readonly emailInput = this.page.getByRole('textbox', { name: 'Email address', exact: true });
  readonly passwordInput = this.page.getByRole('textbox', { name: 'Password', exact: true });
  readonly loginButton = this.page.getByRole('button', { name: 'Login account' });

  protected async waitUntilLoaded(): Promise<void> {
    await this.loginButton.waitFor();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillField(this.emailInput, email, 'Email address');
    await this.fillField(this.passwordInput, password, 'Password', { secret: true });
    await this.clickOn(this.loginButton, 'nút Login account');
  }
}
