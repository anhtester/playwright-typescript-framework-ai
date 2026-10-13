import type { TestInfo } from '@playwright/test';
import { maskSensitive } from '../utils/mask';

export interface ApiExchange {
  request: {
    method: string;
    url: string;
    /** Content-type của body gửi đi: json · form · multipart */
    encoding?: string;
    headers: Record<string, string>;
    body?: unknown;
  };
  response: {
    status: number;
    statusText: string;
    durationMs: number;
    headers: Record<string, string>;
    body?: unknown;
  };
}

/**
 * Gom mọi request/response của 1 test (kể cả call trong fixture setup/teardown) rồi đính
 * thành 1 attachment ở cuối test — với API test, đây là phần thay cho screenshot.
 * Dữ liệu được che (mask.ts) ngay khi ghi, không bao giờ giữ bản gốc.
 */
export class ApiRecorder {
  private readonly exchanges: ApiExchange[] = [];

  record(exchange: ApiExchange): void {
    this.exchanges.push(maskSensitive(exchange));
  }

  /**
   * Response có body mà Content-Type không phải application/json (spec khai JSON cho mọi response).
   * Chỉ là cảnh báo lệch spec — không TC nào kỳ vọng header này nên KHÔNG đánh FAIL test.
   */
  contentTypeWarnings(): string[] {
    const warnings = this.exchanges
      .filter(({ response }) => response.body !== undefined)
      .filter(({ response }) => !(response.headers['content-type'] ?? '').includes('application/json'))
      .map(({ request, response }) => `${request.method} ${new URL(request.url).pathname} → ${response.status}: ${response.headers['content-type'] ?? '(không có)'}`);
    return [...new Set(warnings)];
  }

  async attachTo(testInfo: TestInfo): Promise<void> {
    if (this.exchanges.length === 0) {
      return;
    }
    await testInfo.attach('api_request_response', {
      body: JSON.stringify(this.exchanges, null, 2),
      contentType: 'application/json',
    });
  }
}
