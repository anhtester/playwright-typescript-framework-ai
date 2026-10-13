import { test, expect } from '../../../fixtures/ui.fixture';
import type { SignUpForm } from '../../../pages/sign-up.page';
import { tcMeta } from '../../../utils/allure-meta';
import { loadTestData } from '../../../utils/data-loader';
import { TestData } from '../../../utils/test-data';

interface InvalidSignUpCase {
  testId: string;
  title: string;
  description: string;
  field: string;
  /** Chỉ các field bị làm sai — phần còn lại của form lấy từ dữ liệu hợp lệ */
  input: Partial<SignUpForm>;
  expectedError: string;
}

const invalidCases = loadTestData<InvalidSignUpCase[]>('sign-up-invalid.json');

const REQUIRED_FIELD_ERRORS = [
  'Name is required.',
  'Email is required.',
  'Password is required.',
  'Password confirmation is required.',
];

test.describe('Đăng ký tài khoản (UI)', () => {
  test(
    'Đăng ký thành công với thông tin hợp lệ và được chuyển sang trang đăng nhập',
    {
      tag: ['@smoke', '@regression', '@ui', '@auth'],
      annotation: tcMeta({
        testId: 'BOOK_AUTH_TC_001',
        severity: 'critical',
        feature: 'Xác thực',
        story: 'Đăng ký',
        description:
          'Kiểm tra người dùng điền đủ Name, Phone, Email, Password, Password Confirmation hợp lệ rồi bấm Register '
          + 'thì hệ thống báo "Register successfully." và chuyển sang trang Sign in.',
      }),
    },
    async ({ page, signUpPage, signInPage, accountCleanup }) => {
      const user = TestData.newUser('signUp');

      await test.step('Arrange: Chuẩn bị người dùng mới và mở trang Sign up', async () => {
        accountCleanup.track(user);
        await signUpPage.open();
      });

      await test.step('Act: Điền form hợp lệ và bấm Register', async () => {
        await signUpPage.register({ ...user, passwordConfirmation: user.password });
      });

      await test.step('Assert: Hệ thống báo đăng ký thành công và chuyển sang trang Sign in', async () => {
        await expect(signUpPage.toastWithText('Register successfully.'), 'Phải hiện toast "Register successfully."').toBeVisible();
        await expect(page, 'Phải chuyển sang trang Sign in sau khi đăng ký').toHaveURL(signInPage.url);
        await expect(signInPage.heading, 'Trang Sign in phải hiển thị tiêu đề "Sign in"').toBeVisible();
      });
    },
  );

  test(
    'Không cho đăng ký khi bỏ trống các trường bắt buộc',
    {
      tag: ['@regression', '@ui', '@auth'],
      annotation: tcMeta({
        testId: 'BOOK_AUTH_TC_002',
        severity: 'normal',
        feature: 'Xác thực',
        story: 'Đăng ký',
        description:
          'Kiểm tra bấm Register khi form còn trống thì hiện lỗi dưới 4 trường bắt buộc '
          + '(Name, Email, Password, Password Confirmation) và vẫn ở trang Sign up.',
      }),
    },
    async ({ page, signUpPage }) => {
      await test.step('Arrange: Mở trang Sign up', async () => {
        await signUpPage.open();
      });

      await test.step('Act: Bấm Register khi chưa nhập gì', async () => {
        await signUpPage.submit();
      });

      await test.step('Assert: Hiện lỗi bắt buộc dưới cả 4 trường và vẫn ở trang Sign up', async () => {
        for (const message of REQUIRED_FIELD_ERRORS) {
          await expect.soft(signUpPage.fieldError(message), `Phải hiện lỗi "${message}"`).toBeVisible();
        }
        await expect(page, 'Không được rời trang Sign up khi form còn lỗi').toHaveURL(signUpPage.url);
        await expect(signUpPage.heading, 'Tiêu đề "Sign up" phải còn hiển thị').toBeVisible();
      });
    },
  );

  for (const tc of invalidCases) {
    test(
      tc.title,
      {
        tag: ['@regression', '@ui', '@auth', '@data-driven'],
        annotation: tcMeta({
          testId: tc.testId,
          severity: 'normal',
          feature: 'Xác thực',
          story: 'Đăng ký',
          description: tc.description,
        }),
      },
      async ({ page, signUpPage, accountCleanup }) => {
        const user = TestData.newUser('signUpInvalid');
        const form: SignUpForm = { ...user, passwordConfirmation: user.password, ...tc.input };

        await test.step('Arrange: Mở trang Sign up', async () => {
          // Phòng khi form không chặn được mà vẫn tạo tài khoản — teardown sẽ dọn
          accountCleanup.track(form);
          await signUpPage.open();
        });

        await test.step(`Act: Điền form với ${tc.field} không hợp lệ và bấm Register`, async () => {
          await signUpPage.register(form);
        });

        await test.step(`Assert: Form báo lỗi "${tc.expectedError}" và vẫn ở trang Sign up`, async () => {
          await expect(signUpPage.fieldError(tc.expectedError), `Phải hiện lỗi "${tc.expectedError}"`).toBeVisible();
          await expect(page, 'Không được rời trang Sign up khi form còn lỗi').toHaveURL(signUpPage.url);
        });
      },
    );
  }
});
