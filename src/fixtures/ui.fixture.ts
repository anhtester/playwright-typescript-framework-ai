import { test as apiTest } from './api.fixture';
import { DashboardPage } from '../pages/dashboard.page';
import { SignInPage } from '../pages/sign-in.page';
import { SignUpPage } from '../pages/sign-up.page';
import { attachFinalScreenshot } from '../utils/screenshot';

export interface UiFixtures {
  /** Auto: chụp ảnh trạng thái cuối cho MỌI test UI — cả PASS lẫn FAIL */
  finalScreenshot: void;
  signUpPage: SignUpPage;
  signInPage: SignInPage;
  dashboardPage: DashboardPage;
}

/**
 * Test UI kế thừa toàn bộ fixture API → dựng tiền đề nhanh bằng API (registeredUser),
 * kiểm tra hành vi bằng UI. Mỗi test có browser context riêng — chạy song song không chung state.
 */
export const test = apiTest.extend<UiFixtures>({
  finalScreenshot: [
    async ({ page }, use, testInfo) => {
      await use();
      await attachFinalScreenshot(page, testInfo);
    },
    { auto: true },
  ],

  signUpPage: async ({ page }, use) => {
    await use(new SignUpPage(page));
  },

  signInPage: async ({ page }, use) => {
    await use(new SignInPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from './api.fixture';
