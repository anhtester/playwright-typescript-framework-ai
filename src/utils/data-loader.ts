import fs from 'node:fs';
import path from 'node:path';

const TEST_DATA_DIR = path.resolve(__dirname, '../../test-data');

/** Đọc file JSON trong test-data/ — nguồn dữ liệu cho data-driven test */
export function loadTestData<T>(relativePath: string): T {
  const file = path.join(TEST_DATA_DIR, relativePath);
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

/**
 * Thay placeholder `{{TÊN}}` trong dữ liệu JSON bằng giá trị sinh lúc chạy.
 * Giá trị unique (email, mật khẩu) KHÔNG được ghi cứng trong file JSON — chạy song song sẽ trùng nhau.
 */
export function fillPlaceholders<T>(data: T, values: Record<string, string>): T {
  const replaced = JSON.stringify(data).replace(/\{\{(\w+)\}\}/g, (match: string, name: string) => {
    const value = values[name];
    if (value === undefined) {
      throw new Error(`Placeholder ${match} chưa được cung cấp giá trị`);
    }
    // Escape theo chuẩn JSON — giá trị có dấu " hoặc \ không làm vỡ chuỗi
    return JSON.stringify(value).slice(1, -1);
  });
  return JSON.parse(replaced) as T;
}
