import { BaseApi, type ApiResult } from './base.api';
import type { MessageResponse } from './models/auth.model';

/**
 * Nhóm User Management.
 * ⚠️ Môi trường dùng chung: CHỈ xoá tài khoản do chính test tạo ra — KHÔNG lấy id từ danh sách
 * rồi xoá (đó là dữ liệu thật của người khác, xem luật BOLA trong CLAUDE.md).
 */
export class UserApi extends BaseApi {
  deleteUser(id: string, token: string): Promise<ApiResult<MessageResponse>> {
    return this.delete<MessageResponse>(`/api/user/${encodeURIComponent(id)}`, { token });
  }
}
