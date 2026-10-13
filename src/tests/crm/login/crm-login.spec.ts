import type { Request } from '@playwright/test';
import { test, expect } from '../../../fixtures/crm.fixture';
import type { FailedLoginOutcome } from '../../../pages/crm/crm-login.page';
import { tcMeta, type TestCaseMeta } from '../../../utils/allure-meta';
import {
  CRM_ROLES,
  LOGIN_MESSAGES,
  MALFORMED_EMAILS,
  MASK_CHECK_PASSWORD,
  REMEMBER_COOKIE_SHAPE,
  UNICODE_PASSWORD,
  emailNormalizationVariants,
  passwordAttackVariants,
  requiredFieldVariants,
  hasLetter,
  swapCase,
  wrongLogin,
} from '../../../utils/crm-test-data';
import { env } from '../../../utils/env.config';

function crmMeta(meta: Omit<TestCaseMeta, 'feature' | 'epic'>) {
  return tcMeta({ ...meta, epic: 'Perfex CRM', feature: 'Đăng nhập' });
}

test.describe('Perfex CRM — Giao diện trang đăng nhập', () => {
  test(
    'Mở trang đăng nhập khi chưa có phiên thì thấy biểu mẫu đăng nhập',
    {
      tag: ['@smoke', '@critical-path', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_001',
        severity: 'blocker',
        story: 'Giao diện trang đăng nhập',
        description:
          'Kiểm tra trình duyệt sạch mở /admin/authentication thì trang tải thành công (HTTP 200), dừng đúng URL, '
          + 'tab có tiêu đề "Perfex CRM | Anh Tester Demo - Login" và khối biểu mẫu có tiêu đề "Login".',
      }),
    },
    async ({ page, crmLoginPage }) => {
      await test.step('Arrange: Xác nhận trình duyệt sạch, chưa có cookie nào', async () => {
        expect(await crmLoginPage.cookieNames(), 'Trình duyệt phải sạch, chưa có cookie của CRM').toEqual([]);
      });

      const response = await test.step('Act: Mở trang đăng nhập', async () => {
        return crmLoginPage.open();
      });

      await test.step('Assert: Trang tải thành công, đúng URL, đúng tiêu đề tab và tiêu đề biểu mẫu', async () => {
        expect(response?.status(), 'Request tài liệu trang đăng nhập phải trả HTTP 200').toBe(200);
        await expect(page, 'Không được bị chuyển hướng khỏi trang đăng nhập').toHaveURL(crmLoginPage.url);
        await expect(page, 'Tab trình duyệt phải ghi đúng tiêu đề trang đăng nhập').toHaveTitle('Perfex CRM | Anh Tester Demo - Login');
        await expect(crmLoginPage.heading, 'Khối biểu mẫu phải có tiêu đề "Login"').toBeVisible();
        await expect(crmLoginPage.body, 'Thẻ body phải mang class login_admin').toHaveClass(/\blogin_admin\b/);
      });
    },
  );

  test(
    'Biểu mẫu đăng nhập đủ thành phần và đúng trạng thái mặc định',
    {
      tag: ['@smoke', '@critical-path', '@accessibility', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_002',
        severity: 'blocker',
        story: 'Giao diện trang đăng nhập',
        description:
          'Kiểm tra trang đăng nhập vừa nạp có đủ 5 thành phần, ô Email được focus sẵn, ô Remember me rỗng và bấm được, '
          + 'nút Login bấm được, ô Password che ký tự và bấm vào chữ "Remember me" thì tích ô vuông.',
      }),
    },
    async ({ crmLoginPage }) => {
      await test.step('Arrange: Mở trang đăng nhập, không bấm vào đâu', async () => {
        await crmLoginPage.open();
      });

      await test.step('Assert: Mục 1 — đủ 5 thành phần, "Forgot Password?" nằm dưới nút Login', async () => {
        await expect(crmLoginPage.emailInput, 'Phải có ô nhập nhãn "Email Address"').toBeVisible();
        await expect(crmLoginPage.passwordInput, 'Phải có ô nhập nhãn "Password"').toBeVisible();
        await expect(crmLoginPage.rememberMeCheckbox, 'Phải có ô tích nhãn "Remember me"').toBeVisible();
        await expect(crmLoginPage.loginButton, 'Phải có nút "Login"').toBeVisible();
        await expect(crmLoginPage.forgotPasswordLink, 'Phải có liên kết "Forgot Password?"').toBeVisible();
        const loginBox = await crmLoginPage.loginButton.boundingBox();
        const forgotBox = await crmLoginPage.forgotPasswordLink.boundingBox();
        expect(forgotBox!.y, 'Liên kết "Forgot Password?" phải nằm dưới nút Login').toBeGreaterThan(loginBox!.y);
      });

      await test.step('Assert: Mục 2–4 — Email có sẵn con trỏ, Remember me rỗng và không bị khoá, nút Login bấm được', async () => {
        await expect(crmLoginPage.emailInput, 'Ô Email phải được focus sẵn khi vừa mở trang').toBeFocused();
        await expect(crmLoginPage.rememberMeCheckbox, 'Ô Remember me mặc định phải rỗng').not.toBeChecked();
        await expect(crmLoginPage.rememberMeCheckbox, 'Ô Remember me không được bị khoá').toBeEnabled();
        await expect(crmLoginPage.loginButton, 'Nút Login phải bấm được kể cả khi hai ô còn rỗng').toBeEnabled();
      });

      await test.step('Act: Mục 5 — Gõ mật khẩu thử vào ô Password', async () => {
        await crmLoginPage.typePassword(MASK_CHECK_PASSWORD);
      });

      await test.step('Assert: Ô Password che ký tự đã gõ', async () => {
        await expect(crmLoginPage.passwordInput, 'Ô Password phải là kiểu password để che ký tự').toHaveAttribute('type', 'password');
      });

      await test.step('Act: Mục 6 — Bấm vào chữ "Remember me"', async () => {
        await crmLoginPage.clickRememberMeLabel();
      });

      await test.step('Assert: Ô vuông Remember me chuyển sang tích', async () => {
        await expect(crmLoginPage.rememberMeCheckbox, 'Bấm vào nhãn phải tích ô Remember me').toBeChecked();
      });

      await test.step('Assert: Cấu trúc kỹ thuật của biểu mẫu', async () => {
        await expect(crmLoginPage.form, 'Form phải gửi tới /admin/authentication').toHaveAttribute('action', crmLoginPage.url);
        await expect(crmLoginPage.form, 'Form phải dùng method post').toHaveAttribute('method', 'post');
        await expect(crmLoginPage.emailInput, 'Ô Email phải mang autofocus').toHaveAttribute('autofocus', '1');
      });
    },
  );

  test(
    'Trang đăng nhập không có CAPTCHA, không đăng nhập bên thứ ba, không nạp JavaScript',
    {
      tag: ['@regression', '@security', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_003',
        severity: 'normal',
        story: 'Giao diện trang đăng nhập',
        description:
          'Kiểm tra trang đăng nhập không có khối CAPTCHA, chỉ có đúng một biểu mẫu với một nút gửi "Login", '
          + 'không có nút đăng nhập bên thứ ba và không nạp bất kỳ file JavaScript nào.',
      }),
    },
    async ({ page, crmLoginPage }) => {
      const scriptRequests: string[] = [];
      const collectScript = (request: Request) => {
        if (request.resourceType() === 'script') {
          scriptRequests.push(request.url());
        }
      };

      await test.step('Arrange: Theo dõi request loại script', async () => {
        page.on('request', collectScript);
      });

      await test.step('Act: Mở trang đăng nhập và nạp lại một lần', async () => {
        await crmLoginPage.open();
        await page.reload();
      });

      await test.step('Assert: Không CAPTCHA, không đăng nhập bên thứ ba, chỉ một nút Login', async () => {
        await expect(crmLoginPage.captchaWidgets, 'Không được có khối CAPTCHA nào').toHaveCount(0);
        await expect(crmLoginPage.thirdPartyLoginControls, 'Không được có nút đăng nhập Google/Facebook/Microsoft').toHaveCount(0);
        await expect(crmLoginPage.form, 'Toàn trang chỉ có đúng 1 biểu mẫu').toHaveCount(1);
        await expect(crmLoginPage.submitButtons, 'Chỉ có đúng 1 nút gửi').toHaveCount(1);
        await expect(crmLoginPage.buttons, 'Nút duy nhất trên trang phải là "Login"').toHaveText(['Login']);
      });

      await test.step('Assert: Trang không nạp JavaScript', async () => {
        await expect(crmLoginPage.scripts, 'Trang không được chứa thẻ <script> nào').toHaveCount(0);
        expect(scriptRequests, 'Không được có request tải file JavaScript nào').toEqual([]);
      });
    },
  );

  test(
    'Bấm logo trên trang đăng nhập thì chuyển sang trang đăng nhập khu khách hàng',
    {
      tag: ['@regression', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_004',
        severity: 'minor',
        story: 'Giao diện trang đăng nhập',
        description:
          'Kiểm tra bấm logo trên trang đăng nhập quản trị thì rời khu /admin, dừng ở trang đăng nhập khu khách hàng '
          + '/authentication/login (trang chủ công khai chuyển hướng về đây — đã chốt với user 24-09-2026).',
      }),
    },
    async ({ page, crmLoginPage }) => {
      await test.step('Arrange: Mở trang đăng nhập quản trị', async () => {
        await crmLoginPage.open();
      });

      await test.step('Act: Bấm logo phía trên khối biểu mẫu', async () => {
        await crmLoginPage.clickLogo();
      });

      await test.step('Assert: Dừng ở trang đăng nhập khu khách hàng, không còn ở khu /admin', async () => {
        await expect(page, 'Bấm logo phải dẫn tới /authentication/login').toHaveURL(crmLoginPage.clientLoginUrl);
      });
    },
  );
});

test.describe('Perfex CRM — Đăng nhập thành công & Ghi nhớ đăng nhập', () => {
  test(
    'Đăng nhập bằng tài khoản Admin hợp lệ thì vào được Dashboard',
    {
      tag: ['@smoke', '@critical-path', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_005',
        severity: 'blocker',
        story: 'Đăng nhập thành công',
        description:
          'Kiểm tra đăng nhập bằng tài khoản Admin hợp lệ, không tích Remember me, thì máy chủ trả 303 về /admin/, '
          + 'trang dừng ở Dashboard, có menu trái và ảnh đại diện, không có dải báo lỗi.',
      }),
    },
    async ({ page, crmLoginPage, crmDashboardPage }) => {
      const admin = env.crmAdmin;

      await test.step('Arrange: Mở trang đăng nhập, nhập tài khoản Admin, để trống Remember me', async () => {
        await crmLoginPage.open();
        await crmLoginPage.enterCredentials(admin.email, admin.password);
      });

      const response = await test.step('Act: Bấm nút Login', async () => {
        return crmLoginPage.submitAndCaptureResponse();
      });

      await test.step('Assert: Máy chủ chuyển hướng về /admin/', async () => {
        expect(response.status(), 'POST /admin/authentication phải trả 303').toBe(303);
        expect(response.headers().location, 'Header location phải trỏ về /admin/').toBe(crmLoginPage.dashboardUrl);
      });

      await test.step('Assert: Vào Dashboard, có menu trái và ảnh đại diện, không dải báo lỗi', async () => {
        await expect(page, 'Phải dừng ở Dashboard /admin/').toHaveURL(crmDashboardPage.url);
        await expect(page, 'Tab trình duyệt phải có chữ Dashboard').toHaveTitle(/Dashboard/);
        await expect(crmLoginPage.errorAlert, 'Không được hiện dải báo lỗi đỏ').toHaveCount(0);
        await expect(crmDashboardPage.sideMenuItems.first(), 'Phải hiện menu điều hướng bên trái').toBeVisible();
        await expect(crmDashboardPage.profileAvatar, 'Phải hiện ảnh đại diện góc trên bên phải').toBeVisible();
        for (const bodyClass of ['app', 'admin', 'dashboard', `user-id-${CRM_ROLES.admin.userId}`]) {
          await expect(crmDashboardPage.body, `Thẻ body phải mang class ${bodyClass}`).toHaveClass(new RegExp(`\\b${bodyClass}\\b`));
        }
      });
    },
  );

  test(
    'Đăng nhập bằng tài khoản Project Manager thì vào Dashboard với bộ menu rút gọn',
    {
      tag: ['@regression', '@permission', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_006',
        severity: 'critical',
        story: 'Đăng nhập thành công',
        description:
          'Kiểm tra đăng nhập bằng tài khoản Project Manager thì vào Dashboard, menu trái có đúng 9 mục và '
          + 'không có Subscriptions, Expenses, Estimate Request, Knowledge Base, Reports.',
      }),
    },
    async ({ page, crmLoginPage, crmDashboardPage }) => {
      const pm = env.crmProjectManager;
      const role = CRM_ROLES.projectManager;

      await test.step('Arrange: Mở trang đăng nhập', async () => {
        await crmLoginPage.open();
      });

      await test.step('Act: Đăng nhập bằng tài khoản Project Manager', async () => {
        await crmLoginPage.login(pm.email, pm.password);
      });

      await test.step('Assert: Đăng nhập thành công, dừng ở Dashboard', async () => {
        await expect(page, 'Phải dừng ở Dashboard /admin/').toHaveURL(crmDashboardPage.url);
        await expect(crmLoginPage.errorAlert, 'Không được hiện dải báo lỗi đỏ').toHaveCount(0);
        await expect(crmDashboardPage.body, `Thẻ body phải mang class user-id-${role.userId}`).toHaveClass(new RegExp(`\\buser-id-${role.userId}\\b`));
      });

      await test.step(`Assert: Menu trái đúng ${role.sideMenuCount} mục, không có 5 mục dành cho Admin`, async () => {
        await expect(crmDashboardPage.sideMenuItems, `Menu trái của Project Manager phải có đúng ${role.sideMenuCount} mục`).toHaveCount(role.sideMenuCount);
        for (const menu of role.hiddenMenus) {
          await expect(crmDashboardPage.sideMenuItem(menu), `Menu trái không được có mục "${menu}"`).toHaveCount(0);
        }
      });
    },
  );

  test(
    'Email được chuẩn hoá — khác kiểu chữ và thừa khoảng trắng vẫn đăng nhập được',
    {
      tag: ['@regression', '@boundary', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_007',
        severity: 'normal',
        story: 'Đăng nhập thành công',
        description:
          'Kiểm tra 4 biến thể email của tài khoản Admin (lẫn hoa thường, toàn chữ HOA, thừa dấu cách hai đầu, '
          + 'thừa dấu cách cuối) đều đăng nhập được vào Dashboard, không hiện "Invalid email or password".',
      }),
    },
    async ({ page, crmLoginPage, crmDashboardPage }) => {
      const admin = env.crmAdmin;

      for (const variant of emailNormalizationVariants(admin.email)) {
        await test.step(`Arrange: Biến thể ${variant.code} (${variant.label}) — đăng xuất phiên cũ, mở trang đăng nhập`, async () => {
          await crmDashboardPage.waitUntilDataLoaded();
          await crmLoginPage.endAnySessionAndOpen();
        });

        await test.step(`Act: Đăng nhập bằng email biến thể ${variant.code}`, async () => {
          await crmLoginPage.login(variant.email, admin.password);
        });

        await test.step(`Assert: Biến thể ${variant.code} vào được Dashboard, không báo lỗi`, async () => {
          await expect(page, `Biến thể ${variant.code} (${variant.label}) phải vào Dashboard /admin/`).toHaveURL(crmDashboardPage.url);
          await expect(page, `Biến thể ${variant.code}: tab trình duyệt phải có chữ Dashboard`).toHaveTitle(/Dashboard/);
          await expect(crmLoginPage.errorAlert, `Biến thể ${variant.code}: không được hiện "Invalid email or password"`).toHaveCount(0);
        });
      }
    },
  );

  test(
    'Tích Ghi nhớ đăng nhập thì hệ thống phát hành cookie ghi nhớ',
    {
      tag: ['@regression', '@security', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_008',
        severity: 'critical',
        story: 'Ghi nhớ đăng nhập',
        description:
          'Kiểm tra trình duyệt sạch cookie, tích Remember me rồi đăng nhập Admin thì vào Dashboard và hệ thống '
          + 'phát hành cookie autologin đúng hình thái, phần key dài 16 ký tự hex. Chỉ kiểm hình thái, không ghi giá trị.',
      }),
    },
    async ({ page, crmLoginPage, crmDashboardPage }) => {
      const admin = env.crmAdmin;

      await test.step('Arrange: Mở trang đăng nhập bằng trình duyệt sạch, chưa có cookie ghi nhớ', async () => {
        expect(await crmLoginPage.rememberMeCookie(), 'Trước khi đăng nhập không được có cookie autologin').toBeUndefined();
        await crmLoginPage.open();
        await crmLoginPage.enterCredentials(admin.email, admin.password);
      });

      await test.step('Act: Tích ô Remember me', async () => {
        await crmLoginPage.tickRememberMe();
      });

      await test.step('Assert: Ô Remember me đã tích', async () => {
        await expect(crmLoginPage.rememberMeCheckbox, 'Ô Remember me phải chuyển sang tích').toBeChecked();
      });

      await test.step('Act: Bấm nút Login', async () => {
        await crmLoginPage.submit();
      });

      await test.step('Assert: Đăng nhập thành công và có cookie autologin đúng hình thái', async () => {
        await expect(page, 'Phải dừng ở Dashboard /admin/').toHaveURL(crmDashboardPage.url);
        await expect(crmLoginPage.errorAlert, 'Không được hiện dải báo lỗi đỏ').toHaveCount(0);
        const cookie = await crmLoginPage.rememberMeCookie();
        expect(cookie, 'Tích Remember me thì phải có cookie autologin').toBeDefined();
        // So khớp bằng boolean để message lỗi không in giá trị cookie ra report
        expect(REMEMBER_COOKIE_SHAPE.test(decodeURIComponent(cookie!.value)), 'Cookie autologin phải đúng hình thái, key dài 16 ký tự hex').toBe(true);
      });
    },
  );

  test(
    'Không tích Ghi nhớ đăng nhập thì hoàn toàn không phát hành cookie ghi nhớ',
    {
      tag: ['@regression', '@security', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_009',
        severity: 'critical',
        story: 'Ghi nhớ đăng nhập',
        description:
          'Kiểm tra trình duyệt sạch cookie, kết thúc mọi phiên cũ, để trống Remember me rồi đăng nhập Admin thì '
          + 'vào Dashboard và KHÔNG có cookie autologin.',
      }),
    },
    async ({ page, crmLoginPage, crmDashboardPage }) => {
      const admin = env.crmAdmin;

      await test.step('Arrange: Trình duyệt sạch cookie, kết thúc phiên còn sót, mở trang đăng nhập', async () => {
        expect(await crmLoginPage.rememberMeCookie(), 'Trước khi đăng nhập không được có cookie autologin').toBeUndefined();
        await crmLoginPage.endAnySessionAndOpen();
        await expect(crmLoginPage.rememberMeCheckbox, 'Ô Remember me phải đang rỗng').not.toBeChecked();
      });

      await test.step('Act: Đăng nhập Admin, không động vào ô Remember me', async () => {
        await crmLoginPage.login(admin.email, admin.password);
      });

      await test.step('Assert: Đăng nhập thành công và không có cookie autologin', async () => {
        await expect(page, 'Phải dừng ở Dashboard /admin/').toHaveURL(crmDashboardPage.url);
        expect(await crmLoginPage.rememberMeCookie(), 'Không tích Remember me thì không được phát hành cookie autologin').toBeUndefined();
      });
    },
  );

  test(
    'Bấm nút Login hai lần liên tiếp vẫn vào đúng Dashboard, không sinh trang lỗi',
    {
      tag: ['@regression', '@race-condition', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_010',
        severity: 'normal',
        story: 'Đăng nhập thành công',
        description:
          'Kiểm tra nhập tài khoản Admin hợp lệ rồi bấm Login hai lần liên tiếp thì trang dừng ở Dashboard, '
          + 'không dải báo lỗi và không xuất hiện "419 Page Expired!".',
      }),
    },
    async ({ page, crmLoginPage, crmDashboardPage }) => {
      const admin = env.crmAdmin;

      await test.step('Arrange: Mở trang đăng nhập, nhập tài khoản Admin', async () => {
        await crmLoginPage.open();
        await crmLoginPage.enterCredentials(admin.email, admin.password);
      });

      await test.step('Act: Bấm nút Login hai lần liên tiếp', async () => {
        await crmLoginPage.doubleClickLogin();
      });

      await test.step('Assert: Dừng ở Dashboard, không dải báo lỗi, không có "419 Page Expired!"', async () => {
        await expect(page, 'Phải dừng ở Dashboard /admin/').toHaveURL(crmDashboardPage.url);
        await expect(page, 'Tab trình duyệt phải có chữ Dashboard').toHaveTitle(/Dashboard/);
        await expect(crmLoginPage.errorAlert, 'Không được hiện dải báo lỗi đỏ').toHaveCount(0);
        await expect(crmLoginPage.pageExpiredMessage, 'Không được xuất hiện "419 Page Expired!"').toHaveCount(0);
      });
    },
  );
});

test.describe('Perfex CRM — Kiểm tra dữ liệu đầu vào & Đăng nhập thất bại', () => {
  test(
    'Kiểm tra trường bắt buộc trên biểu mẫu đăng nhập',
    {
      tag: ['@smoke', '@regression', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_011',
        severity: 'blocker',
        story: 'Kiểm tra dữ liệu đầu vào',
        description:
          'Kiểm tra 4 biến thể bỏ trống (cả hai, riêng Email, riêng Password, toàn khoảng trắng) thì không vào được Dashboard, '
          + 'vẫn ở trang đăng nhập và hiện đúng các dải lỗi trường bắt buộc theo thứ tự, không kèm "Invalid email or password".',
      }),
    },
    async ({ page, crmLoginPage }) => {
      for (const variant of requiredFieldVariants(env.crmAdmin.email)) {
        await test.step(`Arrange: Biến thể ${variant.code} (${variant.label}) — nạp lại trang đăng nhập, nhập dữ liệu`, async () => {
          await crmLoginPage.open();
          await crmLoginPage.enterCredentials(variant.email, variant.password);
        });

        await test.step(`Act: Biến thể ${variant.code} — bấm nút Login`, async () => {
          await crmLoginPage.submit();
        });

        await test.step(`Assert: Biến thể ${variant.code} — đúng ${variant.expectedAlerts.length} dải lỗi trường bắt buộc, vẫn ở trang đăng nhập`, async () => {
          await expect(crmLoginPage.errorAlert, `Biến thể ${variant.code} (${variant.label}): sai số lượng hoặc nội dung dải báo lỗi`).toHaveText(variant.expectedAlerts);
          await expect(page, `Biến thể ${variant.code}: không được rời trang đăng nhập`).toHaveURL(crmLoginPage.url);
        });
      }
    },
  );

  test(
    'Email sai định dạng bị trình duyệt chặn ngay, biểu mẫu không gửi đi',
    {
      tag: ['@regression', '@boundary', '@security', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_012',
        severity: 'critical',
        story: 'Kiểm tra dữ liệu đầu vào',
        description:
          'Kiểm tra 5 email sai định dạng (thiếu @, thiếu tên miền, thiếu phần trước @, nhiều @, chuỗi tiêm SQL) thì trình duyệt '
          + 'đánh dấu ô Email không hợp lệ, không gửi POST /admin/authentication, dữ liệu hai ô còn nguyên và không có dải lỗi hệ thống.',
      }),
    },
    async ({ page, crmLoginPage }) => {
      const loginPosts: string[] = [];
      const collectLoginPost = (request: Request) => {
        if (request.method() === 'POST' && new URL(request.url()).pathname === '/admin/authentication') {
          loginPosts.push(request.url());
        }
      };

      await test.step('Arrange: Theo dõi request gửi biểu mẫu đăng nhập', async () => {
        page.on('request', collectLoginPost);
      });

      for (const variant of MALFORMED_EMAILS) {
        await test.step(`Arrange: Biến thể ${variant.code} (${variant.label}) — nạp lại trang, nhập email sai định dạng`, async () => {
          await crmLoginPage.open();
          await crmLoginPage.enterCredentials(variant.email, MASK_CHECK_PASSWORD);
        });

        await test.step(`Act: Biến thể ${variant.code} — bấm nút Login`, async () => {
          await crmLoginPage.submit();
        });

        await test.step(`Assert: Biến thể ${variant.code} — trình duyệt chặn, biểu mẫu không gửi, dữ liệu còn nguyên`, async () => {
          await expect(crmLoginPage.invalidEmailInput, `Biến thể ${variant.code}: trình duyệt phải đánh dấu ô Email không hợp lệ`).toBeVisible();
          await expect(crmLoginPage.emailInput, `Biến thể ${variant.code}: ô Email phải giữ nguyên chữ đã nhập`).toHaveValue(variant.email);
          await expect(crmLoginPage.passwordInput, `Biến thể ${variant.code}: ô Password phải giữ nguyên chữ đã nhập`).toHaveValue(MASK_CHECK_PASSWORD);
          await expect(crmLoginPage.errorAlert, `Biến thể ${variant.code}: không được hiện dải báo lỗi của hệ thống`).toHaveCount(0);
          expect(loginPosts, `Biến thể ${variant.code}: biểu mẫu không được gửi POST /admin/authentication`).toEqual([]);
        });
      }
    },
  );

  test(
    'Sai thông tin đăng nhập trả về một thông báo chung, không tiết lộ email nào có thật',
    {
      tag: ['@smoke', '@regression', '@security', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_013',
        severity: 'blocker',
        story: 'Đăng nhập thất bại',
        description:
          'Kiểm tra email có thật + mật khẩu sai và email không tồn tại đều cho đúng 1 dải "Invalid email or password", '
          + 'vẫn ở trang đăng nhập, và hai bộ kết quả giống hệt nhau — không phân biệt được email nào có tài khoản.',
      }),
    },
    async ({ crmLoginPage }) => {
      const variants = [
        { code: 'a', label: 'email có thật, mật khẩu sai', email: env.crmAdmin.email, password: wrongLogin.password() },
        { code: 'b', label: 'email không tồn tại', email: wrongLogin.email(), password: wrongLogin.password() },
      ];
      const outcomes: FailedLoginOutcome[] = [];

      for (const variant of variants) {
        await test.step(`Arrange: Biến thể ${variant.code} (${variant.label}) — nạp lại trang, nhập thông tin`, async () => {
          await crmLoginPage.open();
          await crmLoginPage.enterCredentials(variant.email, variant.password);
        });

        await test.step(`Act: Biến thể ${variant.code} — bấm nút Login`, async () => {
          await crmLoginPage.submit();
        });

        await test.step(`Assert: Biến thể ${variant.code} — đúng 1 dải "${LOGIN_MESSAGES.invalidCredentials}", vẫn ở trang đăng nhập`, async () => {
          await expect(crmLoginPage.errorAlert, `Biến thể ${variant.code}: phải có đúng 1 dải báo lỗi chung`).toHaveText([LOGIN_MESSAGES.invalidCredentials]);
          const outcome = await crmLoginPage.failedLoginOutcome();
          expect(outcome.url, `Biến thể ${variant.code}: không được rời trang đăng nhập`).toBe(crmLoginPage.url);
          outcomes.push(outcome);
        });
      }

      await test.step('Assert: Hai bộ kết quả giống hệt nhau (nội dung dải · số dải · URL)', async () => {
        expect(outcomes[0], 'Email có thật và email không tồn tại phải cho kết quả giống hệt nhau').toEqual(outcomes[1]);
      });
    },
  );

  test(
    'Mật khẩu đúng nhưng sai kiểu chữ hoa/thường thì bị từ chối',
    {
      tag: ['@regression', '@security', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_014',
        severity: 'normal',
        story: 'Đăng nhập thất bại',
        description:
          'Kiểm tra tài khoản staff có mật khẩu chứa chữ cái, nhập mật khẩu đúng nhưng đảo kiểu chữ hoa/thường thì bị từ chối '
          + 'với đúng 1 dải "Invalid email or password". Cần CRM_TC014_EMAIL / CRM_TC014_PASSWORD trong .env.',
      }),
    },
    async ({ page, crmLoginPage, crmDashboardPage }) => {
      const staff = env.crmLetterPasswordStaff;
      test.skip(!staff, 'Thiếu CRM_TC014_EMAIL / CRM_TC014_PASSWORD trong .env — admin demo có mật khẩu toàn số nên không đảo kiểu chữ được (RISK-LOGIN-07)');

      // .env sai mật khẩu thì bản đảo kiểu chữ cũng bị từ chối → PASS giả. Chứng minh mật khẩu gốc đúng trước
      await test.step('Arrange: Xác nhận tài khoản staff test đăng nhập được bằng đúng mật khẩu gốc', async () => {
        await crmLoginPage.open();
        await crmLoginPage.login(staff!.email, staff!.password);
        await expect(page, 'Tiền đề: CRM_TC014_EMAIL / CRM_TC014_PASSWORD trong .env phải đăng nhập được').toHaveURL(crmDashboardPage.url);
        await crmDashboardPage.waitUntilDataLoaded();
        await crmLoginPage.endAnySessionAndOpen();
      });

      // Mật khẩu toàn số thì đảo kiểu chữ ra đúng mật khẩu cũ → test sẽ đăng nhập thành công và FAIL giả
      test.skip(!hasLetter(staff!.password), 'CRM_TC014_PASSWORD không chứa chữ cái — đảo kiểu chữ không đổi gì, chưa đạt tiền đề của TC (RISK-LOGIN-07)');

      await test.step('Arrange: Mở trang đăng nhập, nhập mật khẩu đúng nhưng đảo kiểu chữ', async () => {
        await crmLoginPage.open();
        await crmLoginPage.enterCredentials(staff!.email, swapCase(staff!.password));
      });

      await test.step('Act: Bấm nút Login', async () => {
        await crmLoginPage.submit();
      });

      await test.step('Assert: Bị từ chối với thông báo chung, vẫn ở trang đăng nhập', async () => {
        await expect(crmLoginPage.errorAlert, 'Phải có đúng 1 dải báo lỗi chung').toHaveText([LOGIN_MESSAGES.invalidCredentials]);
        await expect(page, 'Không được vào Dashboard').toHaveURL(crmLoginPage.url);
      });
    },
  );

  test(
    'Đăng nhập sai nhiều lần liên tiếp không làm khoá tài khoản và không chặn theo IP',
    {
      tag: ['@regression', '@security', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_015',
        severity: 'critical',
        story: 'Đăng nhập thất bại',
        description:
          'Kiểm tra gửi sai 6 lần cùng email Admin và 5 lần với 5 email không tồn tại thì mọi lần đều trả cùng một dải '
          + '"Invalid email or password", không có thông báo khoá/hạn chế, không phản hồi 429, và ngay sau đó Admin vẫn đăng nhập được.',
      }),
    },
    async ({ page, crmLoginPage, crmDashboardPage }) => {
      const admin = env.crmAdmin;
      const variants = [
        {
          code: 'a',
          label: 'khoá theo email — 6 lần cùng email Admin',
          attempts: Array.from({ length: 6 }, () => ({ email: admin.email, password: wrongLogin.password() })),
        },
        {
          code: 'b',
          label: 'khoá theo IP — 5 email không tồn tại khác nhau',
          attempts: ['a', 'b', 'c', 'd', 'e'].map((label) => ({ email: wrongLogin.email(`ip_${label}`), password: wrongLogin.password() })),
        },
      ];
      const tooManyRequests: string[] = [];

      await test.step('Arrange: Theo dõi phản hồi HTTP 429', async () => {
        page.on('response', (response) => {
          if (response.status() === 429) {
            tooManyRequests.push(response.url());
          }
        });
      });

      for (const variant of variants) {
        await test.step(`Arrange: Biến thể ${variant.code} (${variant.label}) — kết thúc phiên cũ, mở trang đăng nhập`, async () => {
          await crmLoginPage.endAnySessionAndOpen();
        });

        for (const [index, attempt] of variant.attempts.entries()) {
          await test.step(`Act: Biến thể ${variant.code} — gửi sai lần ${index + 1}/${variant.attempts.length}`, async () => {
            await crmLoginPage.login(attempt.email, attempt.password);
          });

          await test.step(`Assert: Biến thể ${variant.code} — lần ${index + 1} vẫn trả đúng 1 dải "${LOGIN_MESSAGES.invalidCredentials}"`, async () => {
            await expect(crmLoginPage.errorAlert, `Biến thể ${variant.code}, lần ${index + 1}: nội dung báo lỗi không được đổi qua các lần`).toHaveText([LOGIN_MESSAGES.invalidCredentials]);
          });
        }

        await test.step(`Assert: Biến thể ${variant.code} — không có thông báo khoá / hạn chế nào`, async () => {
          await expect(crmLoginPage.lockoutMessages, `Biến thể ${variant.code}: không được có chữ locked / blocked / too many / try again in`).toHaveCount(0);
        });

        await test.step(`Act: Biến thể ${variant.code} — đăng nhập bằng cặp Admin đúng`, async () => {
          await crmLoginPage.login(admin.email, admin.password);
        });

        await test.step(`Assert: Biến thể ${variant.code} — Admin vẫn đăng nhập thành công`, async () => {
          await expect(page, `Biến thể ${variant.code}: sau nhiều lần sai, Admin vẫn phải vào được Dashboard`).toHaveURL(crmDashboardPage.url);
          await crmDashboardPage.waitUntilDataLoaded();
        });
      }

      await test.step('Assert: Không phản hồi nào trả HTTP 429', async () => {
        expect(tooManyRequests, 'Không được có phản hồi 429 Too Many Requests').toEqual([]);
      });
    },
  );

  // Dự kiến FAIL do BUG CỦA APP (AMB-LOGIN-10, PO xác nhận) — assertion giữ đúng kỳ vọng, KHÔNG sửa theo hiện trạng.
  // Context Playwright không có tự điền của trình duyệt nên kết quả là hành vi thật của máy chủ (ô Email trả về rỗng).
  test(
    'Sau khi đăng nhập thất bại, ô Email phải còn giữ email vừa nhập',
    {
      tag: ['@regression', '@known-bug', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_016',
        severity: 'critical',
        story: 'Đăng nhập thất bại',
        description:
          'Kiểm tra đăng nhập sai mật khẩu thì sau khi trang nạp lại với dải "Invalid email or password", ô Email vẫn hiển thị '
          + 'email vừa nhập. Hiện trạng: ô Email trở về rỗng — lỗi hệ thống đã được PO xác nhận (AMB-LOGIN-10).',
      }),
    },
    async ({ crmLoginPage }) => {
      const email = env.crmAdmin.email;

      await test.step('Arrange: Mở trang đăng nhập, nhập email có thật và mật khẩu sai', async () => {
        await crmLoginPage.open();
        await crmLoginPage.enterCredentials(email, wrongLogin.password());
      });

      await test.step('Act: Bấm nút Login', async () => {
        await crmLoginPage.submit();
      });

      await test.step('Assert: Hiện dải báo lỗi và ô Email còn giữ email vừa nhập', async () => {
        await expect(crmLoginPage.errorAlert, 'Phải hiện dải báo lỗi chung').toHaveText([LOGIN_MESSAGES.invalidCredentials]);
        await expect(crmLoginPage.emailInput, 'Ô Email phải còn giữ email vừa nhập — người dùng không phải gõ lại').toHaveValue(email);
      });
    },
  );

  test(
    'Chuỗi tấn công nhập vào ô Password không vượt qua được xác thực và không được thực thi',
    {
      tag: ['@regression', '@security', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_017',
        severity: 'blocker',
        story: 'Đăng nhập thất bại',
        description:
          'Kiểm tra nhập chuỗi XSS và chuỗi tiêm SQL vào ô Password thì không vào được Dashboard, không bật hộp thoại, '
          + 'máy chủ trả trang 200 với dải "Invalid email or password", không lộ lỗi cơ sở dữ liệu và không có thẻ <script> sống.',
      }),
    },
    async ({ page, crmLoginPage }) => {
      const dialogs: string[] = [];

      await test.step('Arrange: Theo dõi hộp thoại bật lên', async () => {
        page.on('dialog', async (dialog) => {
          dialogs.push(dialog.message());
          await dialog.dismiss();
        });
      });

      for (const variant of passwordAttackVariants(env.crmAdmin.email)) {
        await test.step(`Arrange: Biến thể ${variant.code} (${variant.label}) — nạp lại trang, nhập chuỗi tấn công vào Password`, async () => {
          await crmLoginPage.open();
          await crmLoginPage.enterCredentials(variant.email, variant.password);
        });

        const response = await test.step(`Act: Biến thể ${variant.code} — bấm nút Login`, async () => {
          return crmLoginPage.submitAndCaptureFinalDocument();
        });

        await test.step(`Assert: Biến thể ${variant.code} — bị từ chối, không thực thi, không lộ lỗi cơ sở dữ liệu`, async () => {
          expect(response.status(), `Biến thể ${variant.code}: trang trả về phải là HTTP 200, không phải 500`).toBe(200);
          await expect(crmLoginPage.errorAlert, `Biến thể ${variant.code}: phải có đúng 1 dải báo lỗi chung`).toHaveText([LOGIN_MESSAGES.invalidCredentials]);
          await expect(page, `Biến thể ${variant.code}: không được vào Dashboard`).toHaveURL(crmLoginPage.url);
          await expect(crmLoginPage.databaseErrorMessages, `Biến thể ${variant.code}: không được lộ thông báo lỗi cơ sở dữ liệu`).toHaveCount(0);
          await expect(crmLoginPage.scripts, `Biến thể ${variant.code}: không được có thẻ <script> sống trong trang`).toHaveCount(0);
          expect(dialogs, `Biến thể ${variant.code}: không được bật hộp thoại nào`).toEqual([]);
        });
      }
    },
  );

  test(
    'Mật khẩu chứa ký tự đa ngôn ngữ và emoji không làm hệ thống lỗi máy chủ',
    {
      tag: ['@regression', '@boundary', '@localization', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_018',
        severity: 'normal',
        story: 'Đăng nhập thất bại',
        description:
          'Kiểm tra nhập mật khẩu tiếng Việt có dấu kèm emoji với email không tồn tại thì máy chủ trả trang đăng nhập HTTP 200 '
          + 'với đúng 1 dải "Invalid email or password" hiển thị nguyên vẹn, không trang lỗi.',
      }),
    },
    async ({ page, crmLoginPage }) => {
      await test.step('Arrange: Mở trang đăng nhập, nhập email không tồn tại và mật khẩu đa ngôn ngữ + emoji', async () => {
        await crmLoginPage.open();
        await crmLoginPage.enterCredentials(wrongLogin.email(), UNICODE_PASSWORD);
      });

      const response = await test.step('Act: Bấm nút Login', async () => {
        return crmLoginPage.submitAndCaptureFinalDocument();
      });

      await test.step('Assert: Trang đăng nhập nạp lại bình thường với đúng 1 dải báo lỗi không vỡ ký tự', async () => {
        expect(response.status(), 'Trang trả về phải là HTTP 200, không phải lỗi máy chủ').toBe(200);
        await expect(page, 'Phải quay về đúng trang đăng nhập').toHaveURL(crmLoginPage.url);
        await expect(crmLoginPage.loginButton, 'Biểu mẫu đăng nhập phải hiển thị — không trang trắng').toBeVisible();
        await expect(crmLoginPage.errorAlert, 'Phải có đúng 1 dải báo lỗi, chữ hiển thị nguyên vẹn').toHaveText([LOGIN_MESSAGES.invalidCredentials]);
      });
    },
  );

  test(
    'Tài khoản khách hàng hợp lệ bị từ chối ở khu quản trị mà không lộ ra rằng email đó có tài khoản',
    {
      tag: ['@regression', '@security', '@permission', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_019',
        severity: 'critical',
        story: 'Ranh giới khu quản trị và cổng khách hàng',
        description:
          'Kiểm tra cặp tài khoản khách hàng bị từ chối ở /admin/authentication với dải "Invalid email or password", nhưng đăng nhập '
          + 'được ở cổng /login, và kết quả bị từ chối giống hệt email không tồn tại. Cần CRM_CUSTOMER_EMAIL / CRM_CUSTOMER_PASSWORD trong .env.',
      }),
    },
    async ({ page, crmLoginPage, crmClientLoginPage }) => {
      const customer = env.crmCustomer;
      test.skip(!customer, 'Thiếu CRM_CUSTOMER_EMAIL / CRM_CUSTOMER_PASSWORD trong .env — chưa có tài khoản cổng khách hàng');

      await test.step('Arrange: Mở trang đăng nhập khu quản trị', async () => {
        await crmLoginPage.open();
      });

      await test.step('Act: Đăng nhập khu quản trị bằng tài khoản khách hàng', async () => {
        await crmLoginPage.login(customer!.email, customer!.password);
      });

      const customerOutcome = await test.step('Assert: Bị từ chối với thông báo chung, không có cookie ghi nhớ', async () => {
        await expect(crmLoginPage.errorAlert, 'Tài khoản khách hàng phải bị từ chối với dải báo lỗi chung').toHaveText([LOGIN_MESSAGES.invalidCredentials]);
        const outcome = await crmLoginPage.failedLoginOutcome();
        expect(outcome.url, 'Phải ở lại trang đăng nhập khu quản trị').toBe(crmLoginPage.url);
        expect(await crmLoginPage.rememberMeCookie(), 'Không được phát hành cookie ghi nhớ khu quản trị').toBeUndefined();
        return outcome;
      });

      await test.step('Act: Đăng nhập cổng khách hàng bằng đúng cặp đó', async () => {
        await crmClientLoginPage.open();
        await crmClientLoginPage.login(customer!.email, customer!.password);
      });

      await test.step('Assert: Cổng khách hàng đăng nhập thành công — cặp thông tin là đúng', async () => {
        // Tiêu đề tab = tên công ty của khách hàng đang đăng nhập (phụ thuộc dữ liệu) — chấm theo dấu hiệu đã vào trang chủ
        await expect(page, 'Phải dừng ở trang chủ cổng khách hàng').toHaveURL(crmClientLoginPage.clientHomeUrl);
        await expect(crmClientLoginPage.clientHomeGreeting, 'Phải thấy lời chào đầu trang chủ cổng khách hàng').toBeVisible();
        await expect(page, 'Không được còn ở trang đăng nhập cổng khách hàng').not.toHaveTitle(crmClientLoginPage.loginPageTitle);
      });

      await test.step('Act: Quay lại khu quản trị, gửi email không tồn tại làm đối chứng', async () => {
        await crmLoginPage.open();
        await crmLoginPage.login(wrongLogin.email(), wrongLogin.password());
      });

      await test.step('Assert: Kết quả của tài khoản khách hàng giống hệt email không tồn tại', async () => {
        await expect(crmLoginPage.errorAlert, 'Email đối chứng phải bị từ chối với dải báo lỗi chung').toHaveText([LOGIN_MESSAGES.invalidCredentials]);
        expect(customerOutcome, 'Không được lộ ra rằng email khách hàng có tài khoản').toEqual(await crmLoginPage.failedLoginOutcome());
      });
    },
  );

  test(
    'Đang có phiên cổng khách hàng hợp lệ vẫn không mở được URL nội bộ khu quản trị',
    {
      tag: ['@regression', '@security', '@permission', '@crm', '@login'],
      annotation: crmMeta({
        testId: 'CRM_LOGIN_TC_020',
        severity: 'critical',
        story: 'Ranh giới khu quản trị và cổng khách hàng',
        description:
          'Kiểm tra đang đăng nhập cổng khách hàng mà gõ thẳng /admin/clients thì bị đưa về /admin/authentication và thấy biểu mẫu '
          + 'đăng nhập khu quản trị, không thấy dữ liệu khách hàng. Cần CRM_CUSTOMER_EMAIL / CRM_CUSTOMER_PASSWORD trong .env.',
      }),
    },
    async ({ page, crmLoginPage, crmClientLoginPage }) => {
      const customer = env.crmCustomer;
      test.skip(!customer, 'Thiếu CRM_CUSTOMER_EMAIL / CRM_CUSTOMER_PASSWORD trong .env — chưa có tài khoản cổng khách hàng');

      await test.step('Arrange: Đăng nhập cổng khách hàng, xác nhận phiên đang hoạt động', async () => {
        await crmClientLoginPage.open();
        await crmClientLoginPage.login(customer!.email, customer!.password);
        await expect(page, 'Phiên cổng khách hàng phải đang hoạt động').toHaveURL(crmClientLoginPage.clientHomeUrl);
      });

      await test.step('Act: Gõ thẳng URL danh sách khách hàng của khu quản trị', async () => {
        await crmLoginPage.navigateTo('/admin/clients');
      });

      await test.step('Assert: Bị đưa về biểu mẫu đăng nhập khu quản trị', async () => {
        await expect(page, 'Phải dừng ở /admin/authentication').toHaveURL(crmLoginPage.url);
        await expect(crmLoginPage.heading, 'Phải hiển thị biểu mẫu đăng nhập khu quản trị').toBeVisible();
        await expect(crmLoginPage.loginButton, 'Phải có nút Login của khu quản trị').toBeVisible();
      });
    },
  );
});
