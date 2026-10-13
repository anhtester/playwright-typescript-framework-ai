import { test, expect } from '../../../fixtures/api.fixture';
import type { ApiResult } from '../../../api/base.api';
import type { ErrorResponse } from '../../../api/models/auth.model';
import type { BookDetail, BookListItem, BookListQuery, BookListResponse } from '../../../api/models/book.model';
import { tcMeta } from '../../../utils/allure-meta';
import { loadTestData } from '../../../utils/data-loader';
import { TestData } from '../../../utils/test-data';

interface InvalidQueryCase {
  testId: string;
  title: string;
  description: string;
  query: BookListQuery;
  expected: { status: number; msg: string };
}

const invalidQueryCases = loadTestData<InvalidQueryCase[]>('book-list-invalid-query.json');

test.describe('Danh mục sách (API)', () => {
  test(
    'API danh sách sách trả đúng số bản ghi theo limit, đúng trang và đúng schema',
    {
      tag: ['@smoke', '@regression', '@api', '@book'],
      annotation: tcMeta({
        testId: 'BOOK_BOOK_TC_001',
        severity: 'critical',
        feature: 'Sách',
        story: 'Danh sách sách',
        description:
          'Kiểm tra GET /api/book?limit=5&page=1 (không cần đăng nhập) thì API trả 200, body khớp schema, '
          + 'số sách không vượt limit và khớp pagination.lengthData, currentPage = 1.',
      }),
    },
    async ({ bookApi }) => {
      let query!: Required<Pick<BookListQuery, 'limit' | 'page'>>;
      let books!: ApiResult<BookListResponse>;

      await test.step('Arrange: Chuẩn bị tham số phân trang limit=5, page=1', async () => {
        query = { limit: 5, page: 1 };
      });

      await test.step('Act: Gọi API lấy danh sách sách', async () => {
        books = await bookApi.list(query);
      });

      await test.step('Assert: API trả 200, đúng schema và phân trang khớp tham số', async () => {
        expect(books.status, 'Danh sách sách phải trả HTTP 200').toBe(200);
        expect(books.body).toMatchSchema('book-list');
        const { list, pagination } = books.body;
        expect(list.length, 'Số sách trả về không được vượt limit').toBeLessThanOrEqual(query.limit);
        expect(list.length, 'pagination.lengthData phải bằng số sách thực trả về').toBe(pagination.lengthData);
        expect(pagination.currentPage, 'currentPage phải đúng trang đã yêu cầu').toBe(query.page);
        expect(list.length, 'Kho còn đủ sách thì phải trả đủ limit bản ghi').toBe(Math.min(query.limit, pagination.total));
      });
    },
  );

  test(
    'API chi tiết sách trả đúng cuốn sách được chọn từ danh sách',
    {
      tag: ['@regression', '@api', '@book'],
      annotation: tcMeta({
        testId: 'BOOK_BOOK_TC_002',
        severity: 'normal',
        feature: 'Sách',
        story: 'Chi tiết sách',
        description:
          'Kiểm tra lấy 1 sách bất kỳ từ GET /api/book rồi gọi GET /api/book/{id} thì API trả 200, body khớp schema '
          + 'và đúng id, tên, giá của cuốn sách đó. Chỉ ĐỌC dữ liệu, không sửa sách của người khác.',
      }),
    },
    async ({ bookApi }) => {
      let target!: BookListItem;
      let detail!: ApiResult<BookDetail>;

      await test.step('Arrange: Lấy cuốn sách mới cập nhật nhất từ danh sách', async () => {
        const books = await bookApi.list({ limit: 1, page: 1 });
        expect(books.status, 'Tiền đề: lấy danh sách sách phải thành công').toBe(200);
        expect(books.body.list, 'Tiền đề: hệ thống phải có ít nhất 1 cuốn sách').not.toHaveLength(0);
        target = books.body.list[0];
      });

      await test.step('Act: Gọi API xem chi tiết theo id', async () => {
        detail = await bookApi.getById(target.id);
      });

      await test.step('Assert: API trả 200, đúng schema và đúng cuốn sách đã chọn', async () => {
        expect(detail.status, 'Chi tiết sách phải trả HTTP 200').toBe(200);
        expect(detail.body).toMatchSchema('book-detail');
        expect(detail.body, 'Chi tiết phải khớp id / tên / giá với bản ghi trong danh sách').toMatchObject({
          id: target.id,
          name: target.name,
          price: target.price,
        });
      });
    },
  );

  test(
    'API chi tiết sách không tồn tại trả 404',
    {
      tag: ['@regression', '@api', '@book'],
      annotation: tcMeta({
        testId: 'BOOK_BOOK_TC_003',
        severity: 'normal',
        feature: 'Sách',
        story: 'Chi tiết sách',
        description: 'Kiểm tra GET /api/book/{id} với id không tồn tại thì API trả 404 "Book not found.".',
      }),
    },
    async ({ bookApi }) => {
      let missingId!: string;
      let detail!: ApiResult<ErrorResponse>;

      await test.step('Arrange: Sinh id chắc chắn không tồn tại', async () => {
        missingId = TestData.code('bookMissing');
      });

      await test.step('Act: Gọi API xem chi tiết với id không tồn tại', async () => {
        detail = await bookApi.getById<ErrorResponse>(missingId);
      });

      await test.step('Assert: API trả 404 "Book not found."', async () => {
        expect(detail.status, 'Id không tồn tại phải trả HTTP 404').toBe(404);
        expect(detail.body).toMatchSchema('error-response');
        expect(detail.body.msg, 'Thông báo lỗi').toBe('Book not found.');
      });
    },
  );

  for (const tc of invalidQueryCases) {
    test(
      tc.title,
      {
        tag: ['@regression', '@api', '@book', '@data-driven'],
        annotation: tcMeta({
          testId: tc.testId,
          severity: 'minor',
          feature: 'Sách',
          story: 'Danh sách sách',
          description: tc.description,
        }),
      },
      async ({ bookApi }) => {
        let query!: BookListQuery;
        let books!: ApiResult<ErrorResponse>;

        await test.step(`Arrange: Chuẩn bị tham số không hợp lệ ${JSON.stringify(tc.query)}`, async () => {
          query = tc.query;
        });

        await test.step('Act: Gọi API lấy danh sách sách', async () => {
          books = await bookApi.list<ErrorResponse>(query);
        });

        await test.step(`Assert: API trả ${tc.expected.status} "${tc.expected.msg}"`, async () => {
          expect(books.status, `Tham số ngoài biên phải trả HTTP ${tc.expected.status}`).toBe(tc.expected.status);
          expect(books.body).toMatchSchema('error-response');
          expect(books.body.msg, 'Thông báo lỗi').toBe(tc.expected.msg);
        });
      },
    );
  }
});
