import { test, expect } from '../../../fixtures/api.fixture';
import type { ApiResult, BodyEncoding } from '../../../api/base.api';
import {
  USER_PROFILE_KEYS,
  type ErrorResponse,
  type LoginResponse,
  type MessageResponse,
  type RawPayload,
  type UserProfile,
} from '../../../api/models/auth.model';
import { tcMeta, type Severity } from '../../../utils/allure-meta';
import { cookiesNamed } from '../../../utils/cookie';
import { fillPlaceholders, loadTestData } from '../../../utils/data-loader';
import { TestData, type NewUser } from '../../../utils/test-data';

/**
 * TC nguồn: docs/testcases/_book-api/auth/api/parts/part_01_api_dang_ky_dang_nhap.md
 * (BK_AUTH_TC_059 → 081 · 106 · 107). Mỗi TC một test; TC có Bảng biến thể → mỗi biến thể một test cùng TC ID.
 * Mọi tài khoản do chính test tạo và tự xoá ở teardown — không đụng tài khoản có sẵn nào.
 */

interface Variant {
  variant: string;
  label: string;
}

interface EncodingVariant extends Variant {
  encoding: BodyEncoding;
}

interface AuthVariants {
  contentTypes: EncodingVariant[];
  loginContentTypes: EncodingVariant[];
  registerInvalidName: (Variant & { payload: RawPayload })[];
  invalidEmails: { variant: string; email: string }[];
  loginInvalidEmailVariants: string[];
  emailCaseVariants: (Variant & { email: string })[];
  massAssignmentExtras: RawPayload;
  /** knownBug: biến thể dự kiến FAIL do bug của app (README mục 9 #8) — gắn tag @known-bug để CI bỏ qua */
  attackNames: (Variant & { emailLabel: string; name: string; knownBug?: boolean })[];
  wrongPasswords: (Variant & { password: string })[];
  attackPasswords: (Variant & { password: unknown })[];
  authorizationHeaders: (Variant & { headers: Record<string, string> })[];
}

type LoginFailure = ErrorResponse & Partial<LoginResponse>;

const data = loadTestData<AuthVariants>('auth-register-login.json');

const SOURCE = 'registerLoginApi';
const LONG_TEXT = TestData.longText(10_000);
const BASE_TAGS = ['@api', '@auth'];
const DUPLICATE_EMAIL_BODY = { msg: 'Email already exists.', fields: { email: ['Email already exists.'] } };
const INVALID_PASSWORD_BODY = { msg: 'Invalid password.', fields: { password: ['Invalid password, please try again.'] } };
const USER_NOT_FOUND_BODY = { msg: 'User not found.', fields: { email: ['Email not found, please register.'] } };
const MISSING_PASSWORD_MESSAGE = "Expected property 'password' to be string but found: undefined";
const INVALID_EMAIL_MESSAGE = "Property 'email' should be email";
const MISSING_EMAIL_PATTERN = /Expected property 'email'/;
const BASE64URL_SEGMENT = /^[A-Za-z0-9_-]+$/;

function meta(testId: string, severity: Severity, story: 'Đăng ký' | 'Đăng nhập', description: string) {
  return tcMeta({ testId, severity, feature: 'Xác thực (API)', story, description });
}

/** Body đăng ký tối thiểu — 3 trường bắt buộc */
function registerBody(user: NewUser): RawPayload {
  return { name: user.name, email: user.email, password: user.password };
}

/** `auto_x_1@auto.test` → `Auto_X_1@Auto.Test` — hoa đầu mỗi đoạn */
function mixedCase(email: string): string {
  return email.replace(/(^|[_@.])([a-z])/g, (_match, separator: string, letter: string) => separator + letter.toUpperCase());
}

function emailCaseValues(email: string): Record<string, string> {
  return { EMAIL_UPPER: email.toUpperCase(), EMAIL_MIXED: mixedCase(email) };
}

test.describe('Xác thực (API) — Đăng ký · Đăng nhập', () => {
  test.describe('POST /api/register', () => {
    test(
      'Đăng ký thành công với body JSON đủ trường, không cần token',
      {
        tag: [...BASE_TAGS, '@smoke', '@critical-path'],
        annotation: meta(
          'BK_AUTH_TC_059',
          'blocker',
          'Đăng ký',
          'Kiểm tra POST /api/register với body JSON đủ name · email · password · phone · address, không gửi Authorization, '
            + 'thì trả 201 "Register successfully" và không mở phiên (không có Set-Cookie).',
        ),
      },
      async ({ authApi, accountCleanup }) => {
        let user!: NewUser;
        let registered!: ApiResult<MessageResponse>;

        await test.step('Arrange: Sinh tài khoản mới đủ trường (unique, truy vết được)', async () => {
          user = TestData.newUser(SOURCE, 'reg');
          accountCleanup.track(user);
        });

        await test.step('Act: Gọi API đăng ký không kèm header Authorization', async () => {
          registered = await authApi.register({ ...registerBody(user), phone: user.phone, address: '12 Tràng Tiền' });
        });

        await test.step('Assert: Trả 201 "Register successfully", đúng schema, không Set-Cookie', async () => {
          expect(registered.status, 'Endpoint công khai — đăng ký hợp lệ không token phải trả 201, không 401').toBe(201);
          expect(registered.body).toMatchSchema('register-response');
          expect(registered.body.msg, 'Thông báo đăng ký').toContain('Register successfully');
          expect(registered.setCookies, 'Đăng ký không được mở phiên — không có Set-Cookie').toEqual([]);
          expect(registered).toMeetApiBaseline();
        });
      },
    );

    for (const variant of data.contentTypes) {
      test(
        `Đăng ký thành công với content-type ${variant.label} (biến thể ${variant.variant})`,
        {
          tag: [...BASE_TAGS, '@regression', '@needs-verify'],
          annotation: meta(
            'BK_AUTH_TC_060',
            'normal',
            'Đăng ký',
            `Kiểm tra POST /api/register với body hợp lệ mã hoá ${variant.label} (1 trong 3 content-type spec khai) `
              + 'thì trả 201 "Register successfully" như với JSON.',
          ),
        },
        async ({ authApi, accountCleanup }) => {
          let user!: NewUser;
          let registered!: ApiResult<MessageResponse>;

          await test.step(`Arrange: Sinh tài khoản mới cho biến thể ${variant.label}`, async () => {
            user = TestData.newUser(SOURCE, variant.encoding);
            accountCleanup.track(user);
          });

          await test.step(`Act: Gọi API đăng ký, body mã hoá ${variant.label}`, async () => {
            registered = await authApi.register(registerBody(user), { encoding: variant.encoding });
          });

          await test.step('Assert: Trả 201 "Register successfully"', async () => {
            expect(registered.status, `Content-type ${variant.label} phải được nhận — HTTP 201`).toBe(201);
            expect(registered.body.msg, 'Thông báo đăng ký').toContain('Register successfully');
            expect(registered).toMeetApiBaseline();
          });
        },
      );
    }

    for (const variant of data.registerInvalidName) {
      test(
        `Đăng ký bị từ chối khi ${variant.label} (biến thể ${variant.variant})`,
        {
          tag: [...BASE_TAGS, '@regression', '@needs-verify'],
          annotation: meta(
            'BK_AUTH_TC_061',
            'critical',
            'Đăng ký',
            `Kiểm tra POST /api/register khi ${variant.label} thì trả 422 "Invalid data." kèm lỗi ở fields.name `
              + 'và không tạo tài khoản — gửi lại cùng email với name hợp lệ vẫn đăng ký được (201).',
          ),
        },
        async ({ authApi, accountCleanup }) => {
          let user!: NewUser;
          let payload!: RawPayload;
          let rejected!: ApiResult<ErrorResponse>;
          let retried!: ApiResult<MessageResponse>;

          await test.step(`Arrange: Dựng body đăng ký ${variant.label}`, async () => {
            user = TestData.newUser(SOURCE, `name${variant.variant}`);
            accountCleanup.track(user);
            payload = fillPlaceholders(variant.payload, { EMAIL: user.email, PASSWORD: user.password });
          });

          await test.step('Act: Gọi API đăng ký với name không hợp lệ, rồi gửi lại cùng email với name hợp lệ', async () => {
            rejected = await authApi.register<ErrorResponse>(payload);
            retried = await authApi.register(registerBody(user));
          });

          await test.step('Assert: Trả 422 lỗi ở fields.name và lần gửi lại hợp lệ vẫn tạo được tài khoản', async () => {
            expect(rejected.status, 'name không hợp lệ phải trả HTTP 422').toBe(422);
            expect(rejected.body).toMatchSchema('field-error-response');
            expect(rejected.body.msg, 'Thông báo lỗi').toBe('Invalid data.');
            expect(rejected.body.fields?.name?.length ?? 0, 'fields.name phải có ít nhất 1 thông báo lỗi').toBeGreaterThanOrEqual(1);
            expect(rejected).toMeetApiBaseline();
            expect(retried.status, 'Lần đầu không được tạo tài khoản — gửi lại với name hợp lệ phải trả 201').toBe(201);
          });
        },
      );
    }

    test(
      'Đăng ký thiếu email bị từ chối với lỗi thiếu field',
      {
        tag: [...BASE_TAGS, '@regression', '@known-bug'],
        annotation: [
          ...meta(
            'BK_AUTH_TC_062',
            'critical',
            'Đăng ký',
            'Kiểm tra POST /api/register không có khoá email thì trả 422 với fields.email báo thiếu field và không tạo tài khoản. '
              + 'Đang phơi lỗi F-19: server dùng default "user@example.com" thay cho field bắt buộc (AMB-BK-AUTH-03 chốt 25-09-2026 là lỗi).',
          ),
          { type: 'Lỗi đã biết', description: 'F-19 · AMB-BK-AUTH-03 — dự kiến FAIL đến khi dev sửa' },
        ],
      },
      async ({ authApi, accountCleanup }) => {
        let user!: NewUser;
        let rejected!: ApiResult<ErrorResponse>;

        await test.step('Arrange: Dựng body đăng ký chỉ có name và password', async () => {
          user = TestData.newUser(SOURCE, 'noemail');
        });

        await test.step('Act: Gọi API đăng ký không có khoá email', async () => {
          rejected = await authApi.register<ErrorResponse>({ name: user.name, password: user.password });
          if (rejected.status === 201) {
            // Server lấy email default — tài khoản vừa tạo mang mật khẩu của test này nên là dữ liệu của test, phải dọn
            accountCleanup.track({ email: 'user@example.com', password: user.password });
          }
        });

        await test.step('Assert: Trả 422, fields.email báo thiếu field', async () => {
          expect(rejected.status, 'Thiếu email phải trả HTTP 422, không tạo tài khoản').toBe(422);
          expect(rejected.body).toMatchSchema('field-error-response');
          expect(
            (rejected.body.fields?.email ?? []).join(' | '),
            'fields.email phải báo THIẾU field email (Expected property \'email\' …), không phải lỗi của email default',
          ).toMatch(MISSING_EMAIL_PATTERN);
          expect(rejected).toMeetApiBaseline();
        });
      },
    );

    test(
      'Đăng ký thiếu password bị từ chối',
      {
        tag: [...BASE_TAGS, '@regression'],
        annotation: meta(
          'BK_AUTH_TC_063',
          'critical',
          'Đăng ký',
          'Kiểm tra POST /api/register không có khoá password thì trả 422 "Invalid data." với fields.password báo thiếu field '
            + 'và không tạo tài khoản (đăng nhập bằng email đó ra 404).',
        ),
      },
      async ({ authApi, accountCleanup }) => {
        let user!: NewUser;
        let rejected!: ApiResult<ErrorResponse>;
        let loginCheck!: ApiResult<LoginFailure>;

        await test.step('Arrange: Dựng body đăng ký chỉ có name và email', async () => {
          user = TestData.newUser(SOURCE, 'nopass');
          accountCleanup.track(user);
        });

        await test.step('Act: Gọi API đăng ký không có password, rồi thử đăng nhập bằng email đó', async () => {
          rejected = await authApi.register<ErrorResponse>({ name: user.name, email: user.email });
          loginCheck = await authApi.login<LoginFailure>({ email: user.email, password: user.password });
        });

        await test.step('Assert: Trả 422 lỗi ở fields.password và email chưa có tài khoản', async () => {
          expect(rejected.status, 'Thiếu password phải trả HTTP 422').toBe(422);
          expect(rejected.body).toMatchSchema('field-error-response');
          expect(rejected.body.msg, 'Thông báo lỗi').toBe('Invalid data.');
          expect(rejected.body.fields?.password, 'fields.password phải báo thiếu field').toContain(MISSING_PASSWORD_MESSAGE);
          expect(rejected).toMeetApiBaseline();
          expect(loginCheck.status, 'Không được tạo tài khoản — đăng nhập bằng email đó phải trả 404').toBe(404);
        });
      },
    );

    for (const invalid of data.invalidEmails) {
      test(
        `Đăng ký với email sai định dạng "${invalid.email}" bị từ chối (biến thể ${invalid.variant})`,
        {
          tag: [...BASE_TAGS, '@regression', '@security', '@needs-verify'],
          annotation: meta(
            'BK_AUTH_TC_064',
            'critical',
            'Đăng ký',
            `Kiểm tra POST /api/register với email "${invalid.email}" thì trả 422 kèm fields.email "${INVALID_EMAIL_MESSAGE}", không tạo tài khoản.`,
          ),
        },
        async ({ authApi, accountCleanup }) => {
          let payload!: RawPayload;
          let rejected!: ApiResult<ErrorResponse>;

          await test.step(`Arrange: Dựng body đăng ký với email "${invalid.email}"`, async () => {
            const user = TestData.newUser(SOURCE, 'bademail');
            payload = { ...registerBody(user), email: invalid.email };
            accountCleanup.track({ email: invalid.email, password: user.password });
          });

          await test.step('Act: Gọi API đăng ký', async () => {
            rejected = await authApi.register<ErrorResponse>(payload);
          });

          await test.step('Assert: Trả 422 lỗi định dạng ở fields.email', async () => {
            expect(rejected.status, 'Email sai định dạng phải trả HTTP 422').toBe(422);
            expect(rejected.body).toMatchSchema('field-error-response');
            expect(rejected.body.fields?.email, 'fields.email phải báo sai định dạng').toContain(INVALID_EMAIL_MESSAGE);
            expect(rejected).toMeetApiBaseline();
          });
        },
      );
    }

    test(
      'Đăng ký trùng email bị từ chối, không đổi mật khẩu tài khoản cũ',
      {
        tag: [...BASE_TAGS, '@regression'],
        annotation: meta(
          'BK_AUTH_TC_065',
          'critical',
          'Đăng ký',
          'Kiểm tra POST /api/register với đúng email của userA đã đăng ký thì trả 422 đúng nguyên văn "Email already exists." '
            + 'và mật khẩu của userA không bị đổi (đăng nhập bằng mật khẩu cũ vẫn 200).',
        ),
      },
      async ({ authApi, userA }) => {
        let duplicated!: ApiResult<ErrorResponse>;
        let originalLogin!: ApiResult<LoginResponse>;

        await test.step('Arrange: userA đã đăng ký (fixture) — chuẩn bị name và mật khẩu khác', async () => {
          expect(userA.email, 'Tiền đề: userA phải có email').toBeTruthy();
        });

        await test.step('Act: Đăng ký lại bằng email của userA, rồi đăng nhập userA bằng mật khẩu gốc', async () => {
          duplicated = await authApi.register<ErrorResponse>({
            name: `${userA.name} Dup`,
            email: userA.email,
            password: TestData.password(),
          });
          originalLogin = await authApi.login({ email: userA.email, password: userA.password });
        });

        await test.step('Assert: Trả 422 "Email already exists." và userA vẫn đăng nhập bằng mật khẩu cũ', async () => {
          expect(duplicated.status, 'Email trùng phải trả HTTP 422 (hệ thống dùng 422, không 409)').toBe(422);
          expect(duplicated.body, 'Body lỗi trùng email phải đúng nguyên văn').toEqual(DUPLICATE_EMAIL_BODY);
          expect(duplicated).toMeetApiBaseline();
          expect(originalLogin.status, 'Mật khẩu userA không được đổi — đăng nhập bằng mật khẩu gốc phải 200').toBe(200);
        });
      },
    );

    for (const variant of data.emailCaseVariants) {
      test(
        `Đăng ký trùng email ${variant.label} vẫn bị từ chối (biến thể ${variant.variant})`,
        {
          tag: [...BASE_TAGS, '@regression', '@needs-verify'],
          annotation: meta(
            'BK_AUTH_TC_066',
            'critical',
            'Đăng ký',
            `Kiểm tra POST /api/register với email của userA ${variant.label} thì bị coi là trùng: 422 "Email already exists." `
              + 'và không sinh tài khoản thứ hai.',
          ),
        },
        async ({ authApi, accountCleanup, userA }) => {
          let email!: string;
          let duplicatePassword!: string;
          let duplicated!: ApiResult<ErrorResponse>;
          let secondAccountLogin!: ApiResult<LoginFailure>;

          await test.step(`Arrange: Đổi email của userA thành dạng ${variant.label}`, async () => {
            email = fillPlaceholders(variant.email, emailCaseValues(userA.email));
            duplicatePassword = TestData.password();
            accountCleanup.track({ email, password: duplicatePassword });
          });

          await test.step('Act: Đăng ký bằng email đổi hoa thường, rồi thử đăng nhập bằng mật khẩu của lần đăng ký đó', async () => {
            duplicated = await authApi.register<ErrorResponse>({ name: `${userA.name} Case`, email, password: duplicatePassword });
            secondAccountLogin = await authApi.login<LoginFailure>({ email, password: duplicatePassword });
          });

          await test.step('Assert: Trả 422 "Email already exists." và không có tài khoản thứ hai', async () => {
            expect(duplicated.status, 'Email chỉ khác hoa thường phải bị coi là trùng — HTTP 422').toBe(422);
            expect(duplicated.body.msg, 'Thông báo lỗi').toBe('Email already exists.');
            expect(duplicated).toMeetApiBaseline();
            expect(
              secondAccountLogin.status,
              'Không được có tài khoản thứ hai — mật khẩu của lần đăng ký trùng phải bị từ chối (400)',
            ).toBe(400);
          });
        },
      );
    }

    test(
      'Mass Assignment — trường đặc quyền gửi kèm khi đăng ký không có tác dụng',
      {
        tag: [...BASE_TAGS, '@security', '@needs-verify'],
        annotation: meta(
          'BK_AUTH_TC_067',
          'critical',
          'Đăng ký',
          'Kiểm tra POST /api/register gửi kèm role · isAdmin · isActive:false · id · config thì các trường này không có tác dụng: '
            + 'tài khoản vẫn đăng nhập được, GET /api/me chỉ trả 7 khoá chuẩn, id do server sinh.',
        ),
      },
      async ({ authApi, accountCleanup }) => {
        let user!: NewUser;
        let customId!: string;
        let registered!: ApiResult<ErrorResponse>;
        let login: ApiResult<LoginResponse> | undefined;
        let profile: ApiResult<UserProfile> | undefined;

        await test.step('Arrange: Dựng body đăng ký kèm trường đặc quyền ngoài spec', async () => {
          user = TestData.newUser(SOURCE, 'mass');
          customId = `custom-id-${Date.now()}`;
          accountCleanup.track(user);
        });

        await test.step('Act: Đăng ký kèm trường đặc quyền, nếu tạo được thì đăng nhập và đọc /me', async () => {
          const extras = fillPlaceholders(data.massAssignmentExtras, { CUSTOM_ID: customId });
          registered = await authApi.register<ErrorResponse>({ ...registerBody(user), ...extras });
          test.info().annotations.push({ type: 'Status đăng ký thực tế', description: String(registered.status) });
          if (registered.status === 201) {
            login = await authApi.login({ email: user.email, password: user.password });
            if (login.status === 200) {
              profile = await authApi.me(login.body.accessToken);
            }
          }
        });

        await test.step('Assert: Trường đặc quyền bị bỏ qua — đăng nhập được, /me chỉ 7 khoá, id không bị ghi đè', async () => {
          expect([201, 422], 'Đăng ký kèm trường lạ phải 201 (bỏ qua) hoặc 422 (từ chối)').toContain(registered.status);
          expect(registered).toMeetApiBaseline();
          if (registered.status !== 201) {
            return;
          }
          expect(login?.status, 'isActive:false không được khoá tài khoản — đăng nhập phải 200').toBe(200);
          expect(profile?.status, 'GET /api/me phải 200').toBe(200);
          expect(Object.keys(profile?.body ?? {}).sort(), '/me chỉ được trả đúng 7 khoá chuẩn').toEqual([...USER_PROFILE_KEYS].sort());
          expect(profile?.body.id, 'id phải do server sinh, không nhận id gửi lên').not.toBe(customId);
        });
      },
    );

    for (const variant of data.attackNames) {
      test(
        `Tên chứa ${variant.label} không gây lỗi máy chủ và được lưu nguyên văn (biến thể ${variant.variant})`,
        {
          tag: [...BASE_TAGS, '@security', '@boundary', '@needs-verify', ...(variant.knownBug ? ['@known-bug'] : [])],
          annotation: meta(
            'BK_AUTH_TC_068',
            'critical',
            'Đăng ký',
            `Kiểm tra POST /api/register với name là ${variant.label} thì trả 201 hoặc 422 có fields.name, không 500, không lộ stack trace; `
              + 'nếu tạo được thì GET /api/me trả lại name đúng nguyên văn.',
          ),
        },
        async ({ authApi, accountCleanup }) => {
          let user!: NewUser;
          let attackName!: string;
          let registered!: ApiResult<ErrorResponse>;
          let profile: ApiResult<UserProfile> | undefined;

          await test.step(`Arrange: Dựng body đăng ký với name ${variant.label}`, async () => {
            user = TestData.newUser(SOURCE, variant.emailLabel);
            attackName = fillPlaceholders(variant.name, { LONG_10000: LONG_TEXT });
            accountCleanup.track(user);
          });

          await test.step('Act: Đăng ký, nếu tạo được thì đăng nhập và đọc /me', async () => {
            registered = await authApi.register<ErrorResponse>({ ...registerBody(user), name: attackName });
            if (registered.status === 201) {
              const login = await authApi.login({ email: user.email, password: user.password });
              profile = await authApi.me(login.body.accessToken);
            }
          });

          await test.step('Assert: Không lỗi máy chủ; tạo được thì name trả về bằng đúng chuỗi đã gửi', async () => {
            expect(registered.status, 'Chuỗi tấn công / chuỗi dài tuyệt đối không được gây 500').not.toBe(500);
            expect([201, 422], 'Chỉ chấp nhận 201 hoặc 422').toContain(registered.status);
            expect(registered).toMeetApiBaseline();
            if (registered.status === 422) {
              expect(registered.body.fields?.name, '422 phải báo lỗi ở fields.name').toBeDefined();
              return;
            }
            expect(profile?.status, 'GET /api/me của tài khoản vừa tạo phải 200').toBe(200);
            expect(profile?.body.name, 'name phải được lưu và trả lại nguyên văn — không cắt, không mã hoá HTML').toBe(attackName);
          });
        },
      );
    }
  });

  test.describe('POST /api/login', () => {
    test(
      'Đăng nhập thành công trả đủ msg, accessToken dạng JWT và exp',
      {
        tag: [...BASE_TAGS, '@smoke', '@critical-path'],
        annotation: meta(
          'BK_AUTH_TC_069',
          'blocker',
          'Đăng nhập',
          'Kiểm tra POST /api/login bằng email + mật khẩu của userA thì trả 200 với msg "Login successfully", '
            + 'accessToken gồm đúng 3 đoạn base64url và exp không rỗng.',
        ),
      },
      async ({ authApi, userA }) => {
        let login!: ApiResult<LoginResponse>;

        await test.step('Arrange: userA đã đăng ký (fixture)', async () => {
          expect(userA.email, 'Tiền đề: userA phải có email').toBeTruthy();
        });

        await test.step('Act: Gọi API đăng nhập bằng tài khoản userA', async () => {
          login = await authApi.login({ email: userA.email, password: userA.password });
        });

        await test.step('Assert: Trả 200, đủ msg · accessToken · exp, token đúng 3 đoạn base64url', async () => {
          expect(login.status, 'Đăng nhập đúng phải trả HTTP 200').toBe(200);
          expect(login.body).toMatchSchema('login-response');
          expect(login.body.msg, 'Thông báo đăng nhập').toContain('Login successfully');
          expect(login.body.exp, 'exp phải là chuỗi không rỗng').toEqual(expect.stringMatching(/\S/));
          const segments = login.body.accessToken.split('.');
          expect(segments, 'accessToken phải gồm đúng 3 đoạn').toHaveLength(3);
          for (const segment of segments) {
            expect(segment, 'Mỗi đoạn của accessToken chỉ gồm ký tự base64url').toMatch(BASE64URL_SEGMENT);
          }
          expect(login).toMeetApiBaseline();
        });
      },
    );

    for (const variant of data.loginContentTypes) {
      test(
        `Đăng nhập thành công với content-type ${variant.label} (biến thể ${variant.variant})`,
        {
          tag: [...BASE_TAGS, '@regression', '@needs-verify'],
          annotation: meta(
            'BK_AUTH_TC_070',
            'normal',
            'Đăng nhập',
            `Kiểm tra POST /api/login với email + mật khẩu của userA mã hoá ${variant.label} thì trả 200 "Login successfully" kèm accessToken.`,
          ),
        },
        async ({ authApi, userA }) => {
          let login!: ApiResult<LoginResponse>;

          await test.step('Arrange: userA đã đăng ký (fixture)', async () => {
            expect(userA.email, 'Tiền đề: userA phải có email').toBeTruthy();
          });

          await test.step(`Act: Gọi API đăng nhập, body mã hoá ${variant.label}`, async () => {
            login = await authApi.login({ email: userA.email, password: userA.password }, { encoding: variant.encoding });
          });

          await test.step('Assert: Trả 200 "Login successfully" và có accessToken', async () => {
            expect(login.status, `Content-type ${variant.label} phải được nhận — HTTP 200`).toBe(200);
            expect(login.body.msg, 'Thông báo đăng nhập').toContain('Login successfully');
            expect(login.body.accessToken, 'Phải có accessToken').toEqual(expect.stringMatching(/\S/));
            expect(login).toMeetApiBaseline();
          });
        },
      );
    }

    test(
      'Access token từ đăng nhập dùng được và trỏ đúng tài khoản',
      {
        tag: [...BASE_TAGS, '@smoke', '@security'],
        annotation: meta(
          'BK_AUTH_TC_071',
          'critical',
          'Đăng nhập',
          'Kiểm tra token đăng nhập của userA và userB (2 tài khoản do test tự tạo) gọi GET /api/me thì mỗi token trả đúng email của chủ token, không lẫn.',
        ),
      },
      async ({ authApi, userA, userB }) => {
        let profileA!: ApiResult<UserProfile>;
        let profileB!: ApiResult<UserProfile>;

        await test.step('Arrange: userA và userB đã đăng ký (fixture)', async () => {
          expect(userA.email, 'Tiền đề: userA và userB phải khác nhau').not.toBe(userB.email);
        });

        await test.step('Act: Đăng nhập từng tài khoản rồi gọi /me bằng token của chính nó', async () => {
          const loginA = await authApi.login({ email: userA.email, password: userA.password });
          profileA = await authApi.me(loginA.body.accessToken);
          const loginB = await authApi.login({ email: userB.email, password: userB.password });
          profileB = await authApi.me(loginB.body.accessToken);
        });

        await test.step('Assert: Token của ai trả đúng hồ sơ người đó', async () => {
          expect(profileA.status, '/me với tokenA phải 200').toBe(200);
          expect(profileA.body.email, 'tokenA phải trả email của userA').toBe(userA.email);
          expect(profileB.status, '/me với tokenB phải 200').toBe(200);
          expect(profileB.body.email, 'tokenB phải trả email của userB').toBe(userB.email);
          expect(profileA).toMeetApiBaseline();
          expect(profileB).toMeetApiBaseline();
        });
      },
    );

    for (const variant of data.emailCaseVariants) {
      test(
        `Đăng nhập bằng email ${variant.label} vẫn thành công (biến thể ${variant.variant})`,
        {
          tag: [...BASE_TAGS, '@regression', '@needs-verify'],
          annotation: meta(
            'BK_AUTH_TC_072',
            'normal',
            'Đăng nhập',
            `Kiểm tra POST /api/login với email của userA ${variant.label} thì trả 200 kèm accessToken, `
              + 'và GET /api/me bằng token đó trả email chữ thường như lúc đăng ký.',
          ),
        },
        async ({ authApi, userA }) => {
          let email!: string;
          let login!: ApiResult<LoginResponse>;
          let profile!: ApiResult<UserProfile>;

          await test.step(`Arrange: Đổi email của userA thành dạng ${variant.label}`, async () => {
            email = fillPlaceholders(variant.email, emailCaseValues(userA.email));
          });

          await test.step('Act: Đăng nhập bằng email đổi hoa thường, rồi gọi /me', async () => {
            login = await authApi.login({ email, password: userA.password });
            profile = await authApi.me(login.body.accessToken);
          });

          await test.step('Assert: Đăng nhập 200 và /me trả email chữ thường của userA', async () => {
            expect(login.status, 'Email không phân biệt hoa thường — đăng nhập phải 200').toBe(200);
            expect(login.body.accessToken, 'Phải có accessToken').toEqual(expect.stringMatching(/\S/));
            expect(login).toMeetApiBaseline();
            expect(profile.status, '/me với token vừa nhận phải 200').toBe(200);
            expect(profile.body.email, '/me phải trả email chữ thường như lúc đăng ký').toBe(userA.email);
          });
        },
      );
    }

    for (const variant of data.wrongPasswords) {
      test(
        `Đăng nhập sai mật khẩu (${variant.label}) bị từ chối, không mở phiên (biến thể ${variant.variant})`,
        {
          tag: [...BASE_TAGS, '@regression', '@needs-verify'],
          annotation: meta(
            'BK_AUTH_TC_073',
            'critical',
            'Đăng nhập',
            `Kiểm tra POST /api/login bằng email của userA với mật khẩu ${variant.label} thì trả 400 đúng nguyên văn "Invalid password." `
              + 'và không có Set-Cookie.',
          ),
        },
        async ({ authApi, userA }) => {
          let password!: string;
          let login!: ApiResult<LoginFailure>;

          await test.step(`Arrange: Dựng mật khẩu ${variant.label} so với mật khẩu của userA`, async () => {
            password = fillPlaceholders(variant.password, {
              WRONG_PASSWORD: TestData.password(),
              PASSWORD_CASE_SWAPPED: userA.password.toLowerCase(),
              PASSWORD: userA.password,
            });
            expect(password, 'Tiền đề: mật khẩu thử phải khác mật khẩu thật').not.toBe(userA.password);
          });

          await test.step('Act: Gọi API đăng nhập bằng mật khẩu sai', async () => {
            login = await authApi.login<LoginFailure>({ email: userA.email, password });
          });

          await test.step('Assert: Trả 400 "Invalid password." nguyên văn và không Set-Cookie', async () => {
            expect(login.status, 'Sai mật khẩu phải trả HTTP 400').toBe(400);
            expect(login.body, 'Body lỗi sai mật khẩu phải đúng nguyên văn').toEqual(INVALID_PASSWORD_BODY);
            expect(login.setCookies, 'Sai mật khẩu không được mở phiên — không Set-Cookie').toEqual([]);
            expect(login).toMeetApiBaseline();
          });
        },
      );
    }

    test(
      'Đăng nhập bằng email chưa từng đăng ký bị từ chối (biến thể a)',
      {
        tag: [...BASE_TAGS, '@regression'],
        annotation: meta(
          'BK_AUTH_TC_074',
          'critical',
          'Đăng nhập',
          'Kiểm tra POST /api/login bằng email chưa từng đăng ký thì trả 404 đúng nguyên văn "User not found." và không Set-Cookie.',
        ),
      },
      async ({ authApi }) => {
        let user!: NewUser;
        let login!: ApiResult<LoginFailure>;

        await test.step('Arrange: Sinh email chưa từng đăng ký', async () => {
          user = TestData.newUser(SOURCE, 'none');
        });

        await test.step('Act: Gọi API đăng nhập bằng email chưa đăng ký', async () => {
          login = await authApi.login<LoginFailure>({ email: user.email, password: user.password });
        });

        await test.step('Assert: Trả 404 "User not found." nguyên văn và không Set-Cookie', async () => {
          expect(login.status, 'Email chưa đăng ký phải trả HTTP 404').toBe(404);
          expect(login.body, 'Body lỗi phải đúng nguyên văn').toEqual(USER_NOT_FOUND_BODY);
          expect(login.setCookies, 'Không được mở phiên — không Set-Cookie').toEqual([]);
          expect(login).toMeetApiBaseline();
        });
      },
    );

    test(
      'Đăng nhập bằng tài khoản vừa bị xoá bị từ chối (biến thể b)',
      {
        tag: [...BASE_TAGS, '@regression'],
        annotation: meta(
          'BK_AUTH_TC_074',
          'critical',
          'Đăng nhập',
          'Kiểm tra POST /api/login bằng tài khoản userC do test tạo rồi tự xoá bằng token của chính nó thì trả 404 "User not found." và không Set-Cookie.',
        ),
      },
      async ({ authApi, userApi, accountCleanup }) => {
        let userC!: NewUser;
        let login!: ApiResult<LoginFailure>;

        await test.step('Arrange: Tạo userC rồi xoá bằng token của chính userC', async () => {
          userC = TestData.newUser(SOURCE, 'c');
          accountCleanup.track(userC);
          const created = await authApi.register(registerBody(userC));
          expect(created.status, 'Tiền đề: tạo userC phải 201').toBe(201);
          const session = await authApi.login({ email: userC.email, password: userC.password });
          const profile = await authApi.me(session.body.accessToken);
          const deleted = await userApi.deleteUser(profile.body.id, session.body.accessToken);
          expect(deleted.status, 'Tiền đề: xoá userC bằng token của chính nó phải 200').toBe(200);
        });

        await test.step('Act: Gọi API đăng nhập bằng tài khoản vừa xoá', async () => {
          login = await authApi.login<LoginFailure>({ email: userC.email, password: userC.password });
        });

        await test.step('Assert: Trả 404 "User not found." nguyên văn và không Set-Cookie', async () => {
          expect(login.status, 'Tài khoản đã xoá phải trả HTTP 404').toBe(404);
          expect(login.body, 'Body lỗi phải đúng nguyên văn').toEqual(USER_NOT_FOUND_BODY);
          expect(login.setCookies, 'Không được mở phiên — không Set-Cookie').toEqual([]);
          expect(login).toMeetApiBaseline();
        });
      },
    );

    test.describe('Chạy đúng 1 lần mỗi lượt', () => {
      // Request đi vào tài khoản user@example.com không do QA sở hữu (F-19) — không retry để không nhân số lần đăng nhập sai
      test.describe.configure({ retries: 0 });

      test(
        'Đăng nhập thiếu email bị từ chối với lỗi thiếu field',
        {
          tag: [...BASE_TAGS, '@regression', '@known-bug'],
          annotation: [
            ...meta(
              'BK_AUTH_TC_075',
              'critical',
              'Đăng nhập',
              'Kiểm tra POST /api/login chỉ có password thì trả 422 với fields.email báo thiếu field. '
                + 'Đang phơi lỗi F-19: server dùng default "user@example.com" → 400 "Invalid password." (AMB-BK-AUTH-03 chốt 25-09-2026 là lỗi).',
            ),
            { type: 'Lỗi đã biết', description: 'F-19 · AMB-BK-AUTH-03 — dự kiến FAIL đến khi dev sửa' },
          ],
        },
        async ({ authApi }) => {
          let password!: string;
          let login!: ApiResult<LoginFailure>;

          await test.step('Arrange: Dựng body đăng nhập chỉ có password', async () => {
            password = TestData.password();
          });

          await test.step('Act: Gọi API đăng nhập không có khoá email', async () => {
            login = await authApi.login<LoginFailure>({ password });
          });

          await test.step('Assert: Trả 422, fields.email báo thiếu field, không cấp token', async () => {
            expect(login.status, 'Thiếu email phải trả HTTP 422').toBe(422);
            expect(login.body.accessToken, 'Không được cấp token').toBeUndefined();
            expect(
              (login.body.fields?.email ?? []).join(' | '),
              'fields.email phải báo THIẾU field email (Expected property \'email\' …)',
            ).toMatch(MISSING_EMAIL_PATTERN);
            expect(login).toMeetApiBaseline();
          });
        },
      );
    });

    test(
      'Đăng nhập thiếu password bị từ chối',
      {
        tag: [...BASE_TAGS, '@regression'],
        annotation: meta(
          'BK_AUTH_TC_076',
          'critical',
          'Đăng nhập',
          'Kiểm tra POST /api/login chỉ có email của userA thì trả 422 "Invalid data." với fields.password báo thiếu field và không Set-Cookie.',
        ),
      },
      async ({ authApi, userA }) => {
        let login!: ApiResult<LoginFailure>;

        await test.step('Arrange: userA đã đăng ký (fixture)', async () => {
          expect(userA.email, 'Tiền đề: userA phải có email').toBeTruthy();
        });

        await test.step('Act: Gọi API đăng nhập chỉ có email', async () => {
          login = await authApi.login<LoginFailure>({ email: userA.email });
        });

        await test.step('Assert: Trả 422 lỗi ở fields.password, không Set-Cookie', async () => {
          expect(login.status, 'Thiếu password phải trả HTTP 422').toBe(422);
          expect(login.body).toMatchSchema('field-error-response');
          expect(login.body.msg, 'Thông báo lỗi').toBe('Invalid data.');
          expect(login.body.fields?.password, 'fields.password phải báo thiếu field').toContain(MISSING_PASSWORD_MESSAGE);
          expect(login.setCookies, 'Không được mở phiên — không Set-Cookie').toEqual([]);
          expect(login).toMeetApiBaseline();
        });
      },
    );

    for (const invalid of data.invalidEmails.filter((item) => data.loginInvalidEmailVariants.includes(item.variant))) {
      test(
        `Đăng nhập với email sai định dạng "${invalid.email}" bị từ chối (biến thể ${invalid.variant})`,
        {
          tag: [...BASE_TAGS, '@regression', '@needs-verify'],
          annotation: meta(
            'BK_AUTH_TC_077',
            'critical',
            'Đăng nhập',
            `Kiểm tra POST /api/login với email "${invalid.email}" thì trả 422 kèm fields.email "${INVALID_EMAIL_MESSAGE}".`,
          ),
        },
        async ({ authApi }) => {
          let password!: string;
          let login!: ApiResult<LoginFailure>;

          await test.step('Arrange: Sinh mật khẩu ngẫu nhiên cho request', async () => {
            password = TestData.password();
          });

          await test.step(`Act: Gọi API đăng nhập với email "${invalid.email}"`, async () => {
            login = await authApi.login<LoginFailure>({ email: invalid.email, password });
          });

          await test.step('Assert: Trả 422 lỗi định dạng ở fields.email', async () => {
            expect(login.status, 'Email sai định dạng phải trả HTTP 422').toBe(422);
            expect(login.body.fields?.email, 'fields.email phải báo sai định dạng').toContain(INVALID_EMAIL_MESSAGE);
            expect(login).toMeetApiBaseline();
          });
        },
      );
    }

    test(
      'Cookie refetchToken được set với đủ cờ bảo mật',
      {
        tag: [...BASE_TAGS, '@security', '@regression'],
        annotation: meta(
          'BK_AUTH_TC_078',
          'critical',
          'Đăng nhập',
          'Kiểm tra POST /api/login hợp lệ của userA set đúng một cookie refetchToken không rỗng, có đủ HttpOnly · Secure · SameSite=Strict · Path=/ · Max-Age.',
        ),
      },
      async ({ authApi, userA }) => {
        let login!: ApiResult<LoginResponse>;

        await test.step('Arrange: userA đã đăng ký (fixture)', async () => {
          expect(userA.email, 'Tiền đề: userA phải có email').toBeTruthy();
        });

        await test.step('Act: Gọi API đăng nhập bằng tài khoản userA', async () => {
          login = await authApi.login({ email: userA.email, password: userA.password });
        });

        await test.step('Assert: Đúng một cookie refetchToken, đủ HttpOnly · Secure · SameSite=Strict · Path=/ · Max-Age', async () => {
          expect(login.status, 'Đăng nhập phải 200').toBe(200);
          const cookies = cookiesNamed(login.setCookies, 'refetchToken');
          expect(cookies, 'Phải có đúng một Set-Cookie refetchToken').toHaveLength(1);
          const [cookie] = cookies;
          expect(cookie.value, 'Giá trị refetchToken không được rỗng').not.toBe('');
          expect.soft(cookie.attributes.httponly, 'refetchToken phải có HttpOnly').toBe(true);
          expect.soft(cookie.attributes.secure, 'refetchToken phải có Secure').toBe(true);
          expect.soft(cookie.attributes.samesite, 'refetchToken phải có SameSite=Strict').toBe('Strict');
          expect.soft(cookie.attributes.path, 'refetchToken phải có Path=/').toBe('/');
          expect.soft(cookie.attributes['max-age'], 'refetchToken phải có thuộc tính Max-Age').toBeDefined();
          expect(login).toMeetApiBaseline();
        });
      },
    );

    test(
      'Cookie accessToken mang cùng giá trị với accessToken trong body',
      {
        tag: [...BASE_TAGS, '@regression'],
        annotation: meta(
          'BK_AUTH_TC_079',
          'normal',
          'Đăng nhập',
          'Kiểm tra POST /api/login hợp lệ của userA set cookie accessToken có giá trị bằng đúng từng ký tự với body.accessToken của cùng response.',
        ),
      },
      async ({ authApi, userA }) => {
        let login!: ApiResult<LoginResponse>;

        await test.step('Arrange: userA đã đăng ký (fixture)', async () => {
          expect(userA.email, 'Tiền đề: userA phải có email').toBeTruthy();
        });

        await test.step('Act: Gọi API đăng nhập bằng tài khoản userA', async () => {
          login = await authApi.login({ email: userA.email, password: userA.password });
        });

        await test.step('Assert: Cookie accessToken bằng body.accessToken', async () => {
          expect(login.status, 'Đăng nhập phải 200').toBe(200);
          const cookies = cookiesNamed(login.setCookies, 'accessToken');
          expect(cookies, 'Phải có Set-Cookie accessToken').toHaveLength(1);
          expect(cookies[0].value, 'Cookie accessToken phải bằng body.accessToken').toBe(login.body.accessToken);
          expect(login).toMeetApiBaseline();
        });
      },
    );

    test(
      'Cookie accessToken có cờ HttpOnly, Secure, SameSite',
      {
        tag: [...BASE_TAGS, '@security', '@known-bug'],
        annotation: [
          ...meta(
            'BK_AUTH_TC_080',
            'critical',
            'Đăng nhập',
            'Kiểm tra cookie accessToken do POST /api/login set có đủ HttpOnly · Secure · SameSite (Strict hoặc Lax). '
              + 'Đang phơi lỗi F-03: cookie chỉ có Path=/ (AMB-BK-AUTH-04 chốt 20-09-2026: yêu cầu áp dụng).',
          ),
          { type: 'Lỗi đã biết', description: 'F-03 · AMB-BK-AUTH-04 — dự kiến FAIL đến khi dev sửa' },
        ],
      },
      async ({ authApi, userA }) => {
        let login!: ApiResult<LoginResponse>;

        await test.step('Arrange: userA đã đăng ký (fixture)', async () => {
          expect(userA.email, 'Tiền đề: userA phải có email').toBeTruthy();
        });

        await test.step('Act: Gọi API đăng nhập bằng tài khoản userA', async () => {
          login = await authApi.login({ email: userA.email, password: userA.password });
        });

        await test.step('Assert: Cookie accessToken có đủ HttpOnly · Secure · SameSite', async () => {
          expect(login.status, 'Đăng nhập phải 200').toBe(200);
          const cookies = cookiesNamed(login.setCookies, 'accessToken');
          expect(cookies, 'Phải có Set-Cookie accessToken').toHaveLength(1);
          const [cookie] = cookies;
          expect.soft(cookie.attributes.httponly, 'accessToken phải có HttpOnly').toBe(true);
          expect.soft(cookie.attributes.secure, 'accessToken phải có Secure').toBe(true);
          expect.soft(String(cookie.attributes.samesite ?? '(không có)'), 'accessToken phải có SameSite=Strict hoặc Lax').toMatch(/^(Strict|Lax)$/);
          expect(login).toMeetApiBaseline();
        });
      },
    );

    for (const variant of data.attackPasswords) {
      test(
        `Mật khẩu là ${variant.label} không vượt được đăng nhập (biến thể ${variant.variant})`,
        {
          tag: [...BASE_TAGS, '@security', '@needs-verify'],
          annotation: meta(
            'BK_AUTH_TC_081',
            'critical',
            'Đăng nhập',
            `Kiểm tra POST /api/login bằng email của userA với password là ${variant.label} thì không được 200 / không có accessToken, `
              + 'chỉ trả 400 "Invalid password." hoặc 422 "Invalid data.", tuyệt đối không 500.',
          ),
        },
        async ({ authApi, userA }) => {
          let password!: unknown;
          let login!: ApiResult<LoginFailure>;

          await test.step(`Arrange: Dựng password là ${variant.label}`, async () => {
            password = fillPlaceholders(variant.password, { LONG_10000: LONG_TEXT });
          });

          await test.step('Act: Gọi API đăng nhập với password tấn công', async () => {
            login = await authApi.login<LoginFailure>({ email: userA.email, password });
          });

          await test.step('Assert: Bị từ chối bằng 400 hoặc 422, không cấp token, không lỗi máy chủ', async () => {
            expect(login.status, 'Chuỗi tấn công không được đăng nhập thành công').not.toBe(200);
            expect(login.body.accessToken, 'Không được cấp accessToken').toBeUndefined();
            expect([400, 422], 'Chỉ chấp nhận 400 hoặc 422 — tuyệt đối không 500').toContain(login.status);
            const expectedMessage = login.status === 400 ? 'Invalid password.' : 'Invalid data.';
            expect(login.body.msg, `HTTP ${login.status} phải kèm thông báo "${expectedMessage}"`).toBe(expectedMessage);
            expect(login).toMeetApiBaseline();
          });
        },
      );
    }

    test(
      'Tài khoản vừa đăng ký đăng nhập được ngay',
      {
        tag: [...BASE_TAGS, '@smoke', '@critical-path'],
        annotation: meta(
          'BK_AUTH_TC_106',
          'blocker',
          'Đăng nhập',
          'Kiểm tra POST /api/register thành công rồi ngay sau đó POST /api/login bằng đúng email + mật khẩu vừa đăng ký thì trả 200 kèm accessToken — '
            + 'không cần kích hoạt hay chờ.',
        ),
      },
      async ({ authApi, accountCleanup }) => {
        let user!: NewUser;
        let registered!: ApiResult<MessageResponse>;
        let login!: ApiResult<LoginResponse>;

        await test.step('Arrange: Sinh tài khoản mới (unique, truy vết được)', async () => {
          user = TestData.newUser(SOURCE, 'new');
          accountCleanup.track(user);
        });

        await test.step('Act: Đăng ký rồi đăng nhập ngay bằng tài khoản vừa tạo', async () => {
          registered = await authApi.register(registerBody(user));
          login = await authApi.login({ email: user.email, password: user.password });
        });

        await test.step('Assert: Đăng ký 201 và đăng nhập ngay được 200 kèm accessToken', async () => {
          expect(registered.status, 'Đăng ký phải trả HTTP 201').toBe(201);
          expect(registered.body.msg, 'Thông báo đăng ký').toContain('Register successfully');
          expect(login.status, 'Tài khoản vừa tạo phải đăng nhập được ngay — HTTP 200').toBe(200);
          expect(login.body.accessToken, 'Phải có accessToken không rỗng').toEqual(expect.stringMatching(/\S/));
          expect(registered).toMeetApiBaseline();
          expect(login).toMeetApiBaseline();
        });
      },
    );

    for (const variant of data.authorizationHeaders) {
      test(
        `Đăng nhập là endpoint công khai — ${variant.label} vẫn thành công (biến thể ${variant.variant})`,
        {
          tag: [...BASE_TAGS, '@regression', '@needs-verify'],
          annotation: meta(
            'BK_AUTH_TC_107',
            'critical',
            'Đăng nhập',
            `Kiểm tra POST /api/login của userA khi ${variant.label} thì vẫn trả 200 kèm accessToken — không bị 401 (spec khai security: []).`,
          ),
        },
        async ({ authApi, userA }) => {
          let login!: ApiResult<LoginResponse>;

          await test.step('Arrange: userA đã đăng ký (fixture)', async () => {
            expect(userA.email, 'Tiền đề: userA phải có email').toBeTruthy();
          });

          await test.step(`Act: Gọi API đăng nhập — ${variant.label}`, async () => {
            login = await authApi.login({ email: userA.email, password: userA.password }, { headers: variant.headers });
          });

          await test.step('Assert: Trả 200 kèm accessToken, không bị 401', async () => {
            expect(login.status, 'Endpoint công khai không được phụ thuộc Authorization — HTTP 200').toBe(200);
            expect(login.body.accessToken, 'Phải có accessToken').toEqual(expect.stringMatching(/\S/));
            expect(login).toMeetApiBaseline();
          });
        },
      );
    }
  });
});
