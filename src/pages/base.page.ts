import { test, type Locator, type Page, type Response } from '@playwright/test';
import { env } from '../utils/env.config';
import { createLogger, type Logger } from '../utils/logger';

/**
 * Base Page: mở trang, thao tác cơ bản và toast dùng chung.
 * - Mỗi thao tác = 1 sub-step trong report + 1 dòng log
 * - Không có hard sleep: fill/click của Playwright tự chờ element sẵn sàng (visible, enabled, stable)
 * - Không chứa assertion — kiểm tra kết quả là việc của test
 */
export abstract class BasePage {
  /** Đường dẫn tương đối với BASE_URL */
  protected abstract readonly path: string;

  /** Toast thông báo (Sonner) — xuất hiện ở mọi trang sau khi submit */
  readonly toast: Locator;

  protected readonly logger: Logger;

  constructor(protected readonly page: Page) {
    this.toast = page.getByRole('region', { name: /Notifications/ }).getByRole('listitem');
    this.logger = createLogger(this.constructor.name);
  }

  /** URL tuyệt đối của trang — dùng cho `expect(page).toHaveURL(xxxPage.url)` */
  get url(): string {
    return new URL(this.path, this.origin).href;
  }

  /** Gốc URL của hệ thống chứa trang — page của hệ thống khác (vd CRM) override */
  protected get origin(): string {
    return env.baseURL;
  }

  /** Mỗi page chờ phần tử "neo" chứng minh trang đã render xong và tương tác được */
  protected abstract waitUntilLoaded(): Promise<void>;

  /** Trả về response của tài liệu HTML — test cần kiểm HTTP status thì đọc từ đây */
  async open(): Promise<Response | null> {
    return this.step(`Mở trang ${this.path}`, async () => {
      const response = await this.page.goto(this.path);
      await this.waitUntilLoaded();
      return response;
    });
  }

  toastWithText(message: string): Locator {
    return this.toast.filter({ hasText: message });
  }

  protected async fillField(locator: Locator, value: string, label: string, options: { secret?: boolean } = {}): Promise<void> {
    const title = options.secret ? `Nhập ${label}` : `Nhập ${label}: ${value}`;
    await this.step(title, async () => {
      await locator.fill(value);
      this.logger.info(title);
    });
  }

  protected async clickOn(locator: Locator, label: string): Promise<void> {
    await this.step(`Bấm ${label}`, async () => {
      await locator.click();
      this.logger.info(`Bấm ${label}`);
    });
  }

  /** box: lỗi trong step trỏ về dòng gọi ở test, không trỏ vào ruột Page Object */
  protected step<T>(title: string, body: () => Promise<T>): Promise<T> {
    return test.step(title, body, { box: true });
  }
}
