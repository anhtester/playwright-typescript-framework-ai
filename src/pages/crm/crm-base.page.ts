import { env } from '../../utils/env.config';
import { BasePage } from '../base.page';

/** Gốc cho mọi trang của Perfex CRM — URL tuyệt đối tính theo CRM_URL thay vì BASE_URL */
export abstract class CrmBasePage extends BasePage {
  /** Thẻ body — Perfex gắn class nhận diện trang và người dùng (vd `login_admin`, `user-id-2`) */
  readonly body = this.page.locator('body');

  /** Tên các cookie trình duyệt đang giữ — dùng để xác nhận trạng thái sạch trước test */
  async cookieNames(): Promise<string[]> {
    return (await this.page.context().cookies()).map((cookie) => cookie.name);
  }

  /** Gõ thẳng một đường dẫn của CRM vào thanh địa chỉ — dùng khi test cố mở URL nội bộ */
  async navigateTo(path: string): Promise<void> {
    await this.step(`Mở thẳng URL ${path}`, async () => {
      await this.page.goto(path);
    });
  }

  protected override get origin(): string {
    return env.crmURL;
  }
}
