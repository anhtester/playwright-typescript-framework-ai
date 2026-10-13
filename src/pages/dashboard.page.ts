import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Trang Dashboard — "/" sau khi đăng nhập. Locator đã verify trên DOM thật */
export class DashboardPage extends BasePage {
  protected readonly path = '/';

  readonly welcomeHeading = this.page.getByRole('heading', { name: /^Welcome / });
  readonly navigation = this.page.getByRole('navigation');
  /** Avatar góc phải header — nút duy nhất trong banner, tên là chữ cái đầu của user */
  readonly accountButton = this.page.getByRole('banner').getByRole('button');
  readonly logoutButton = this.page.getByRole('button', { name: 'Logout' });

  protected async waitUntilLoaded(): Promise<void> {
    await this.welcomeHeading.waitFor();
  }

  welcomeHeadingFor(userName: string): Locator {
    return this.page.getByRole('heading', { name: `Welcome ${userName}`, exact: true });
  }

  navLink(name: string): Locator {
    return this.navigation.getByRole('link', { name, exact: true });
  }

  async logout(): Promise<void> {
    await this.clickOn(this.accountButton, 'avatar tài khoản');
    await this.clickOn(this.logoutButton, 'nút Logout');
  }
}
