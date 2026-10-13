import { BaseApi, type ApiResult } from './base.api';
import type { BookDetail, BookListQuery, BookListResponse } from './models/book.model';

/** Nhóm Book Management — endpoint đọc công khai, không cần token */
export class BookApi extends BaseApi {
  list<T = BookListResponse>(query: BookListQuery = {}): Promise<ApiResult<T>> {
    const params = Object.fromEntries(
      Object.entries(query).filter((entry): entry is [string, string | number] => entry[1] !== undefined),
    );
    return this.get<T>('/api/book', { params });
  }

  getById<T = BookDetail>(id: string): Promise<ApiResult<T>> {
    return this.get<T>(`/api/book/${encodeURIComponent(id)}`);
  }
}
