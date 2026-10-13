import { CmsBasePage } from './cms-base.page';

/** Dashboard khu quản trị Active eCommerce CMS — /admin. Locator đã verify trên DOM thật */
export class CmsDashboardPage extends CmsBasePage {
  protected readonly path = '/admin';

  /** Menu trái của khu quản trị — chỉ render khi đã đăng nhập */
  readonly sideMenu = this.page.locator('#main-menu');
  /** Tên link có ký tự icon đứng trước nên so khớp phần đuôi */
  readonly dashboardMenuLink = this.sideMenu.getByRole('link', { name: /Dashboard$/ });
  readonly menuSearchInput = this.page.getByPlaceholder('Search in menu');

  protected async waitUntilLoaded(): Promise<void> {
    await this.sideMenu.waitFor();
  }
}
