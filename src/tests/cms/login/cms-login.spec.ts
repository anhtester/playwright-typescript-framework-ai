import { test, expect } from '../../../fixtures/cms.fixture';
import { tcMeta } from '../../../utils/allure-meta';
import { env } from '../../../utils/env.config';

test.describe('Đăng nhập khu quản trị (Active eCommerce CMS)', () => {
  test(
    'Đăng nhập thành công bằng tài khoản quản trị hợp lệ',
    {
      tag: ['@smoke', '@regression', '@cms', '@login'],
      annotation: tcMeta({
        testId: 'CMS_LOGIN_TC_001',
        severity: 'blocker',
        epic: 'Active eCommerce CMS',
        feature: 'Xác thực',
        story: 'Đăng nhập',
        description:
          'Kiểm tra người dùng quản trị đăng nhập bằng email và mật khẩu hợp lệ tại /login thì được chuyển vào '
          + 'Dashboard khu quản trị /admin và thấy menu điều hướng bên trái.',
      }),
    },
    async ({ page, cmsLoginPage, cmsDashboardPage }) => {
      const account = env.cmsAdmin;

      await test.step('Arrange: Mở trang đăng nhập CMS', async () => {
        await cmsLoginPage.open();
        await expect(cmsLoginPage.heading, 'Trang đăng nhập phải hiện tiêu đề chào mừng').toBeVisible();
      });

      await test.step('Act: Đăng nhập bằng tài khoản quản trị', async () => {
        await cmsLoginPage.login(account.email, account.password);
      });

      await test.step('Assert: Vào Dashboard khu quản trị và thấy menu điều hướng', async () => {
        await expect(page, 'Phải chuyển vào Dashboard /admin sau khi đăng nhập').toHaveURL(cmsDashboardPage.url);
        await expect(cmsDashboardPage.sideMenu, 'Menu điều hướng bên trái phải hiển thị').toBeVisible();
        await expect(cmsDashboardPage.dashboardMenuLink, 'Menu phải có mục Dashboard').toBeVisible();
        await expect(cmsDashboardPage.menuSearchInput, 'Ô "Search in menu" phải hiển thị').toBeVisible();
      });
    },
  );
});
