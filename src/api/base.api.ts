import { test, type APIRequestContext, type APIResponse } from '@playwright/test';
import type { ApiRecorder } from './api-recorder';
import { createLogger } from '../utils/logger';

type HttpMethod = 'GET' | 'POST' | 'DELETE';

/** Cách mã hoá body — spec khai 3 content-type cho hầu hết POST/PATCH */
export type BodyEncoding = 'json' | 'form' | 'multipart';

type FormBody = Record<string, string | number | boolean>;

export interface RequestOptions {
  /** Access token — gửi dạng `Authorization: Bearer <token>` */
  token?: string;
  /** Header thêm / ghi đè — vd `Authorization` rác để kiểm endpoint công khai */
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  /** Mặc định `json` */
  encoding?: BodyEncoding;
}

export interface ApiResult<T> {
  status: number;
  body: T;
  headers: Record<string, string>;
  /** Từng header `Set-Cookie` riêng lẻ — `headers['set-cookie']` gộp nhiều cookie thành 1 chuỗi */
  setCookies: string[];
  /** Thời gian từ lúc gửi tới lúc nhận đủ body — dùng cho assertion SLA */
  durationMs: number;
}

const logger = createLogger('api');

async function parseBody(response: APIResponse): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** json → `data` · form → `form` · multipart → `multipart`: Playwright tự đặt Content-Type tương ứng */
function bodyOption(data: unknown, encoding: BodyEncoding): { data?: unknown; form?: FormBody; multipart?: FormBody } {
  if (data === undefined) {
    return {};
  }
  if (encoding === 'form') {
    return { form: data as FormBody };
  }
  if (encoding === 'multipart') {
    return { multipart: data as FormBody };
  }
  return { data };
}

/**
 * Base API client: mọi call đi qua `send()` → 1 step trong report + ghi request/response (đã che)
 * + 1 dòng log. Client con chỉ khai endpoint, không lặp lại logic gửi/ghi nhận.
 */
export abstract class BaseApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly recorder: ApiRecorder,
  ) {}

  protected get<T>(url: string, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.send<T>('GET', url, options);
  }

  protected post<T>(url: string, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.send<T>('POST', url, options);
  }

  protected delete<T>(url: string, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.send<T>('DELETE', url, options);
  }

  private send<T>(method: HttpMethod, url: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
    const encoding = options.encoding ?? 'json';
    const stepName = encoding === 'json' ? `Gọi API ${method} ${url}` : `Gọi API ${method} ${url} (${encoding})`;
    return test.step(
      stepName,
      async () => {
        const headers: Record<string, string> = { accept: 'application/json' };
        if (options.token) {
          headers.authorization = `Bearer ${options.token}`;
        }
        Object.assign(headers, options.headers);

        const startedAt = Date.now();
        const response = await this.request.fetch(url, {
          method,
          headers,
          params: options.params,
          ...bodyOption(options.data, encoding),
        });
        const body = await parseBody(response);
        const durationMs = Date.now() - startedAt;
        const setCookies = response
          .headersArray()
          .filter((header) => header.name.toLowerCase() === 'set-cookie')
          .map((header) => header.value);

        this.recorder.record({
          request: { method, url: response.url(), encoding, headers, body: options.data },
          response: {
            status: response.status(),
            statusText: response.statusText(),
            durationMs,
            headers: response.headers(),
            body,
          },
        });
        logger.info(`${method} ${url} → ${response.status()}`, { durationMs, encoding });

        return { status: response.status(), body: body as T, headers: response.headers(), setCookies, durationMs };
      },
      { box: true },
    );
  }
}
