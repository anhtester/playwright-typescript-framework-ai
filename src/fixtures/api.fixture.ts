import { test as base, expect as baseExpect, type APIRequestContext } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { AccountCleanup } from '../api/account-cleanup';
import { ApiRecorder } from '../api/api-recorder';
import { AuthApi } from '../api/auth.api';
import { BookApi } from '../api/book.api';
import { UserApi } from '../api/user.api';
import { tcIdOf } from '../utils/allure-meta';
import { env } from '../utils/env.config';
import { apiMatchers } from '../utils/api-matchers';
import { schemaMatchers } from '../utils/schema-validator';
import { TestData, type NewUser } from '../utils/test-data';

export interface ApiFixtures {
  /** Auto: hiện TC ID ở mục Parameters — giao diện Allure 2 không hiển thị custom label testId */
  tcIdParameter: void;
  /** Auto: gom request/response của test → đính `api_request_response` ở cuối test */
  apiRecorder: ApiRecorder;
  /** Context HTTP riêng mỗi test, trỏ API_URL — độc lập với baseURL của project UI */
  apiContext: APIRequestContext;
  authApi: AuthApi;
  userApi: UserApi;
  bookApi: BookApi;
  /** Xoá ở teardown mọi tài khoản đã `track()` */
  accountCleanup: AccountCleanup;
  /** Tài khoản MỚI, riêng cho test này — tạo qua API, tự xoá sau test. Dùng khi test làm đổi trạng thái tài khoản */
  registeredUser: NewUser;
  /** Tài khoản A do chính test tạo (email `…_a`) — tài khoản chính của TC API */
  userA: NewUser;
  /** Tài khoản B do chính test tạo (email `…_b`) — cặp với userA cho TC token / BOLA */
  userB: NewUser;
}

/** Đăng ký tài khoản tiền đề qua API — track TRƯỚC khi tạo để test chết giữa chừng vẫn được dọn */
async function registerAccount(authApi: AuthApi, cleanup: AccountCleanup, user: NewUser): Promise<NewUser> {
  cleanup.track(user);
  const created = await authApi.register({
    name: user.name,
    email: user.email,
    password: user.password,
    phone: user.phone,
  });
  if (created.status !== 201) {
    throw new Error(`Không tạo được tài khoản tiền đề ${user.email}: HTTP ${created.status}`);
  }
  return user;
}

export const test = base.extend<ApiFixtures>({
  tcIdParameter: [
    async ({}, use, testInfo) => {
      const tcId = tcIdOf(testInfo);
      if (tcId) {
        // excluded: không tính vào historyId → đổi TC ID không làm mất lịch sử trend của test
        await allure.parameter('TC ID', tcId, { excluded: true });
      }
      await use();
    },
    { auto: true },
  ],

  apiRecorder: [
    async ({}, use, testInfo) => {
      const recorder = new ApiRecorder();
      await use(recorder);
      const warnings = recorder.contentTypeWarnings();
      if (warnings.length > 0) {
        await allure.parameter('Cảnh báo Content-Type lệch spec', warnings.join(' · '), { excluded: true });
      }
      await recorder.attachTo(testInfo);
    },
    { auto: true },
  ],

  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({ baseURL: env.apiURL });
    await use(context);
    await context.dispose();
  },

  authApi: async ({ apiContext, apiRecorder }, use) => {
    await use(new AuthApi(apiContext, apiRecorder));
  },

  userApi: async ({ apiContext, apiRecorder }, use) => {
    await use(new UserApi(apiContext, apiRecorder));
  },

  bookApi: async ({ apiContext, apiRecorder }, use) => {
    await use(new BookApi(apiContext, apiRecorder));
  },

  accountCleanup: async ({ authApi, userApi }, use, testInfo) => {
    const cleanup = new AccountCleanup(authApi, userApi);
    await use(cleanup);
    await cleanup.run(testInfo);
  },

  registeredUser: async ({ authApi, accountCleanup }, use, testInfo) => {
    await use(await registerAccount(authApi, accountCleanup, TestData.newUser(TestData.sourceOf(testInfo.file))));
  },

  userA: async ({ authApi, accountCleanup }, use, testInfo) => {
    await use(await registerAccount(authApi, accountCleanup, TestData.newUser(TestData.sourceOf(testInfo.file), 'a')));
  },

  userB: async ({ authApi, accountCleanup }, use, testInfo) => {
    await use(await registerAccount(authApi, accountCleanup, TestData.newUser(TestData.sourceOf(testInfo.file), 'b')));
  },
});

export const expect = baseExpect.extend({ ...schemaMatchers, ...apiMatchers });
