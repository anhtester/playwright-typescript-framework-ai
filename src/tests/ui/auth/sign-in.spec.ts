import { test, expect } from '../../../fixtures/ui.fixture';
import { tcMeta } from '../../../utils/allure-meta';
import { env } from '../../../utils/env.config';
import { TestData } from '../../../utils/test-data';

test.describe('Đăng nhập (UI)', () => {
  test(
    'Đăng nhập thành công bằng tài khoản demo hợp lệ',
    {
      tag: ['@smoke', '@regression', '@ui', '@auth'],
      annotation: tcMeta({
        testId: 'BOOK_AUTH_TC_005',
        severity: 'blocker',
        feature: 'Xác thực',
        story: 'Đăng nhập',
        description:
          'Kiểm tra người dùng đăng nhập bằng email và mật khẩu hợp lệ của tài khoản demo thì hệ thống báo '
          + '"Login successfully.", chuyển vào Dashboard, hiện lời chào và menu điều hướng.',
      }),
    },
    async ({ page, signInPage, dashboardPage }) => {
      const account = env.demoAccount;

      await test.step('Arrange: Mở trang Sign in', async () => {
        await signInPage.open();
      });

      await test.step('Act: Đăng nhập bằng tài khoản demo', async () => {
        await signInPage.login(account.email, account.password);
      });

      await test.step('Assert: Vào Dashboard, thấy lời chào và menu điều hướng', async () => {
        await expect(signInPage.toastWithText('Login successfully.'), 'Phải hiện toast "Login successfully."').toBeVisible();
        await expect(page, 'Phải chuyển vào Dashboard sau khi đăng nhập').toHaveURL(dashboardPage.url);
        await expect(dashboardPage.welcomeHeading, 'Dashboard phải hiện lời chào "Welcome ..."').toBeVisible();
        await expect(dashboardPage.navLink('Dashboard'), 'Menu điều hướng phải có mục Dashboard').toBeVisible();
      });
    },
  );

  test(
    'Không cho đăng nhập bằng email chưa đăng ký',
    {
      tag: ['@regression', '@ui', '@auth'],
      annotation: tcMeta({
        testId: 'BOOK_AUTH_TC_006',
        severity: 'normal',
        feature: 'Xác thực',
        story: 'Đăng nhập',
        description:
          'Kiểm tra đăng nhập bằng email chưa từng đăng ký thì hệ thống báo "User not found." và vẫn ở trang Sign in.',
      }),
    },
    async ({ page, signInPage }) => {
      const unknownEmail = TestData.email('signInUnknown');

      await test.step('Arrange: Mở trang Sign in', async () => {
        await signInPage.open();
      });

      await test.step('Act: Đăng nhập bằng email chưa đăng ký', async () => {
        await signInPage.login(unknownEmail, TestData.password());
      });

      await test.step('Assert: Hệ thống báo "User not found." và vẫn ở trang Sign in', async () => {
        await expect(signInPage.toastWithText('User not found.'), 'Phải hiện toast "User not found."').toBeVisible();
        await expect(page, 'Không được rời trang Sign in khi đăng nhập thất bại').toHaveURL(signInPage.url);
      });
    },
  );

  test(
    'Không cho đăng nhập khi sai mật khẩu',
    {
      tag: ['@regression', '@ui', '@auth'],
      annotation: tcMeta({
        testId: 'BOOK_AUTH_TC_007',
        severity: 'critical',
        feature: 'Xác thực',
        story: 'Đăng nhập',
        description:
          'Kiểm tra đăng nhập bằng email đã đăng ký nhưng sai mật khẩu thì hệ thống báo "Invalid password." '
          + 'và vẫn ở trang Sign in. Dùng tài khoản riêng của test để không làm ảnh hưởng tài khoản demo dùng chung.',
      }),
    },
    async ({ page, signInPage, registeredUser }) => {
      await test.step('Arrange: Có tài khoản mới (tạo qua API) và mở trang Sign in', async () => {
        await signInPage.open();
      });

      await test.step('Act: Đăng nhập bằng đúng email nhưng sai mật khẩu', async () => {
        await signInPage.login(registeredUser.email, `${registeredUser.password}_sai`);
      });

      await test.step('Assert: Hệ thống báo "Invalid password." và vẫn ở trang Sign in', async () => {
        await expect(signInPage.toastWithText('Invalid password.'), 'Phải hiện toast "Invalid password."').toBeVisible();
        await expect(page, 'Không được rời trang Sign in khi sai mật khẩu').toHaveURL(signInPage.url);
      });
    },
  );

  test(
    'Đăng nhập bằng tài khoản vừa tạo qua API thì Dashboard chào đúng tên người dùng',
    {
      tag: ['@regression', '@ui', '@auth', '@e2e'],
      annotation: tcMeta({
        testId: 'BOOK_AUTH_TC_008',
        severity: 'critical',
        feature: 'Xác thực',
        story: 'Đăng nhập',
        description:
          'Kiểm tra tài khoản vừa tạo qua API đăng nhập được ngay trên UI và Dashboard chào đúng tên người dùng '
          + '— mẫu kết hợp API (dựng tiền đề) + UI (kiểm hành vi).',
      }),
    },
    async ({ page, signInPage, dashboardPage, registeredUser }) => {
      await test.step('Arrange: Có tài khoản mới (tạo qua API) và mở trang Sign in', async () => {
        await signInPage.open();
      });

      await test.step('Act: Đăng nhập bằng tài khoản mới', async () => {
        await signInPage.login(registeredUser.email, registeredUser.password);
      });

      await test.step('Assert: Vào Dashboard và được chào đúng tên người dùng', async () => {
        await expect(page, 'Phải chuyển vào Dashboard sau khi đăng nhập').toHaveURL(dashboardPage.url);
        await expect(
          dashboardPage.welcomeHeadingFor(registeredUser.name),
          `Dashboard phải chào "Welcome ${registeredUser.name}"`,
        ).toBeVisible();
      });
    },
  );

  // Cách ly vì BUG CỦA APP, không phải lỗi test — assertion giữ nguyên, bỏ test.fixme khi dev sửa xong.
  // Bằng chứng (2026-09-15): chạy 5 luồng thì 3–4/10 lần sau DELETE /api/logout (200) app gọi lại /api/me (401)
  // + /api/refetch-token (422) và KHÔNG điều hướng về /sign-in; chạy 1 luồng 10/10 lần điều hướng đúng.
  test.fixme(
    'Đăng xuất từ menu tài khoản thì quay về trang Sign in',
    {
      tag: ['@regression', '@ui', '@auth', '@known-issue'],
      annotation: [
        ...tcMeta({
          testId: 'BOOK_AUTH_TC_019',
          severity: 'critical',
          feature: 'Xác thực',
          story: 'Đăng xuất',
          description:
            'Kiểm tra người dùng đang đăng nhập bấm Logout trong menu tài khoản thì hệ thống báo "Logout successfully." '
            + 'và đưa về trang Sign in.',
        }),
        {
          type: 'fixme',
          description:
            'Known issue: sau logout app thỉnh thoảng không chuyển về /sign-in khi tải cao (race condition phía app)',
        },
      ],
    },
    async ({ page, signInPage, dashboardPage, registeredUser }) => {
      await test.step('Arrange: Đăng nhập bằng tài khoản mới (tạo qua API) và vào Dashboard', async () => {
        await signInPage.open();
        await signInPage.login(registeredUser.email, registeredUser.password);
        await expect(dashboardPage.welcomeHeadingFor(registeredUser.name), 'Tiền đề: phải vào được Dashboard').toBeVisible();
      });

      await test.step('Act: Đăng xuất từ menu tài khoản', async () => {
        await dashboardPage.logout();
      });

      await test.step('Assert: Hệ thống báo đăng xuất thành công và quay về trang Sign in', async () => {
        await expect(dashboardPage.toastWithText('Logout successfully.'), 'Phải hiện toast "Logout successfully."').toBeVisible();
        await expect(page, 'Phải quay về trang Sign in sau khi đăng xuất').toHaveURL(signInPage.url);
      });
    },
  );
});
