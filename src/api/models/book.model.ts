/** Kiểu dữ liệu nhóm Book Management — theo spec /swagger/json, đã đối chiếu response thật */

export type BookStatus = 'AVAILABLE' | 'UNAVAILABLE';

interface BookBase {
  id: string;
  name: string;
  description: string;
  categories: string[];
  /** Người tạo sách — dữ liệu của người khác, bị che khi đính vào report */
  auth: { name: string; email: string; avatarUrl: string } | null;
  status: BookStatus;
  createdAt: string;
  updatedAt: string;
  price: number;
  currentPrice: number;
  viewCount: number;
  promotions: unknown[];
}

/** Item trong GET /api/book — picture là mảng đường dẫn */
export interface BookListItem extends BookBase {
  slug: string;
  picture: string[];
}

export interface BookPictureFile {
  name: string;
  path: string;
  isFile: boolean;
  size: number;
  type: string;
  modified: string;
  created: string;
}

/** GET /api/book/{id} — picture là mảng thông tin file (khác danh sách) */
export interface BookDetail extends BookBase {
  picture: BookPictureFile[];
}

export interface Pagination {
  total: number;
  totalPage: number;
  currentPage: number;
  lengthData: number;
}

export interface BookListResponse {
  list: BookListItem[];
  pagination: Pagination;
}

export interface BookListQuery {
  limit?: number;
  page?: number;
  search?: string;
  sort?: 'name' | 'description' | 'status' | 'createdAt' | 'updatedAt' | 'slug' | 'price' | 'currentPrice' | 'viewCount';
  sortBy?: 'asc' | 'desc';
}
