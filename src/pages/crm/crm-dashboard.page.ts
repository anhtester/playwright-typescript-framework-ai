import type { Locator, Page, Response } from '@playwright/test';
import { CrmBasePage } from './crm-base.page';

const TASKS_TABLE_PATH = '/admin/tasks/table';
const TASKS_TABLE_TIMEOUT_MS = 15_000;

/** Dashboard khu quản trị Perfex CRM — /admin/. Locator đã verify trên DOM thật */
export class CrmDashboardPage extends CrmBasePage {
  protected readonly path = '/admin/';

  /**
   * Kết quả chờ AJAX `POST /admin/tasks/table` của lần mở Dashboard gần nhất — đăng ký ngay lúc trang chuyển hướng tới /admin/
   * để không bỏ lỡ response dù test gọi `waitUntilDataLoaded()` muộn. Trang khác Dashboard thì không có gì để chờ.
   */
  private tasksTableLoaded: Promise<boolean> = Promise.resolve(true);

  constructor(page: Page) {
    super(page);
    page.on('framenavigated', (frame) => {
      if (frame !== page.mainFrame()) {
        return;
      }
      const isDashboard = new URL(frame.url()).pathname === new URL(this.url).pathname;
      this.tasksTableLoaded = isDashboard
        ? page.waitForResponse(
            (res: Response) => res.request().method() === 'POST' && new URL(res.url()).pathname === TASKS_TABLE_PATH,
            { timeout: TASKS_TABLE_TIMEOUT_MS },
          ).then(() => true, () => false)
        : Promise.resolve(true);
    });
  }

  /** Mục cấp 1 của menu trái — `li` mang class `menu-item-<slug>` (bỏ qua ô logo đầu menu) */
  readonly sideMenuItems = this.page.locator('#side-menu > li[class*="menu-item-"]');
  /** Ảnh đại diện góc trên bên phải header */
  readonly profileAvatar = this.page.locator('#header img.staff-profile-image-small');

  protected async waitUntilLoaded(): Promise<void> {
    await this.profileAvatar.waitFor();
  }

  /**
   * Chờ AJAX `POST /admin/tasks/table` của Dashboard tải xong.
   * Đăng xuất khi AJAX còn dở thì request đó bị từ chối, Perfex ghi nó làm "trang quay lại sau đăng nhập"
   * → lần đăng nhập kế tiếp rơi vào `/admin/tasks/table` (JSON) thay vì Dashboard. Đo lại: 2/4 lần lệch nếu không chờ.
   *
   * Không dùng `waitForLoadState('networkidle')`: nó cần sự kiện `load`, mà Firefox (headed) đôi khi không bắn dù mọi
   * request của CRM đã xong và trang đã vẽ đủ — đo 08-10-2026: 4/15 lần treo 30s ở bước này. Giả định: tài khoản có widget
   * "My Tasks" trên Dashboard (Admin, Project Manager đã có); staff không có widget này sẽ báo timeout ở đây.
   */
  async waitUntilDataLoaded(): Promise<void> {
    await this.step('Đợi Dashboard tải xong dữ liệu', async () => {
      const loaded = await this.tasksTableLoaded;
      if (!loaded) {
        throw new Error(`Dashboard không phát sinh response ${TASKS_TABLE_PATH} trong ${TASKS_TABLE_TIMEOUT_MS / 1000}s sau khi mở`);
      }
    });
  }

  /** Mục menu trái theo tên hiển thị — tên link có ký tự icon đứng trước nên so khớp theo từ */
  sideMenuItem(name: string): Locator {
    return this.sideMenuItems.filter({
      has: this.page.getByRole('link', { name: new RegExp(`(^|\\s)${name}\\s*$`) }),
    });
  }
}
