import { CmsBasePage } from './cms-base.page';

/** Trang đăng nhập Active eCommerce CMS — /login. Locator đã verify trên DOM thật */
export class CmsLoginPage extends CmsBasePage {
  protected readonly path = '/login';

  readonly heading = this.page.getByRole('heading', { name: 'Welcome to Active eCommerce CMS', level: 1 });
  readonly emailInput = this.page.getByRole('textbox', { name: 'Email', exact: true });
  readonly passwordInput = this.page.getByRole('textbox', { name: 'Password', exact: true });
  readonly loginButton = this.page.getByRole('button', { name: 'Login' });

  protected async waitUntilLoaded(): Promise<void> {
    await this.loginButton.waitFor();
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillField(this.emailInput, email, 'Email');
    await this.fillField(this.passwordInput, password, 'Password', { secret: true });
    await this.clickOn(this.loginButton, 'nút Login');
  }
}
