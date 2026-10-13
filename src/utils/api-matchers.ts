import type { ApiResult } from '../api/base.api';
import { env } from './env.config';

/** Khoá không bao giờ được xuất hiện trong response — dù ở cấp nào của body */
const SECRET_KEYS = new Set(['password', 'password_old', 'passwordhash', 'hash', 'salt']);

/** Map lỗi validation `{ fields: { password: [...] } }` — khoá bên trong là TÊN field, không phải giá trị bí mật */
const FIELD_ERROR_MAP = 'fields';

/** Dấu vết lỗi nội bộ: dòng stack trace, đường dẫn mã nguồn phía server */
const INTERNAL_TRACE = /\n\s+at\s|node_modules|\/(src|app|dist)\/\S+\.(ts|js)\b/;

function secretKeysIn(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => secretKeysIn(item, `${path}[${index}]`));
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => {
      if (path === '' && key === FIELD_ERROR_MAP) {
        return [];
      }
      const childPath = path ? `${path}.${key}` : key;
      return SECRET_KEYS.has(key.toLowerCase()) ? [childPath] : secretKeysIn(child, childPath);
    });
  }
  return [];
}

/** Các kiểm tra chung cho MỌI response — trả danh sách vi phạm, rỗng nghĩa là đạt */
export function baselineProblems(result: ApiResult<unknown>): string[] {
  const problems: string[] = [];
  if (result.durationMs >= env.apiSlaMs) {
    problems.push(`Thời gian phản hồi ${result.durationMs} ms — vượt SLA ${env.apiSlaMs} ms`);
  }
  if (typeof result.body === 'string') {
    problems.push('Body không phải JSON hợp lệ');
  }
  const leaked = secretKeysIn(result.body);
  if (leaked.length > 0) {
    problems.push(`Body lộ khoá bí mật: ${leaked.join(', ')}`);
  }
  const text = typeof result.body === 'string' ? result.body : JSON.stringify(result.body ?? '');
  if (INTERNAL_TRACE.test(text)) {
    problems.push('Body chứa stack trace / đường dẫn mã nguồn phía server');
  }
  return problems;
}

/** Custom matcher: `expect(result).toMeetApiBaseline()` — SLA · body JSON · không lộ bí mật · không stack trace */
export const apiMatchers = {
  toMeetApiBaseline(received: ApiResult<unknown>) {
    const problems = baselineProblems(received);
    const pass = problems.length === 0;
    return {
      pass,
      name: 'toMeetApiBaseline',
      message: () =>
        pass
          ? 'Response đạt baseline (không mong đợi đạt)'
          : `Response HTTP ${received.status} KHÔNG đạt baseline:\n- ${problems.join('\n- ')}`,
    };
  },
};
