/** Kiểu dữ liệu nhóm Authentication — theo spec /swagger/json, đã đối chiếu response thật */

export interface MessageResponse {
  msg: string;
}

/** Response lỗi chung: 400 / 404 / 422 kèm lỗi theo từng field */
export interface ErrorResponse extends MessageResponse {
  fields?: Record<string, string[]>;
}

/** Body tuỳ ý — sai kiểu, thừa khoá: dùng cho test validation và mass assignment */
export type RawPayload = Record<string, unknown>;

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends MessageResponse {
  accessToken: string;
  /** Thời hạn token, dạng "6d" */
  exp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  phone: string;
  address: string;
  config?: unknown;
}

/** Đúng 7 khoá GET /api/me được phép trả (REQ-BK-AUTH-35) — không có password, role, isAdmin */
export const USER_PROFILE_KEYS = ['id', 'name', 'email', 'avatarUrl', 'phone', 'address', 'config'] as const;
