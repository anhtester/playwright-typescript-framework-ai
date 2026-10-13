import { BaseApi, type ApiResult, type BodyEncoding } from './base.api';
import type {
  LoginRequest,
  LoginResponse,
  MessageResponse,
  RawPayload,
  RegisterRequest,
  UserProfile,
} from './models/auth.model';

export interface AuthRequestOptions {
  /** Mặc định `json` — register/login nhận cả form-urlencoded và multipart */
  encoding?: BodyEncoding;
  /** Header thêm, vd `Authorization` để kiểm endpoint công khai không phụ thuộc token */
  headers?: Record<string, string>;
}

/**
 * Nhóm Authentication Management.
 * Generic `T` mặc định là body thành công; test negative truyền `ErrorResponse`.
 * Payload nhận cả `RawPayload` để gửi được body sai kiểu / thừa khoá (validation, mass assignment).
 */
export class AuthApi extends BaseApi {
  register<T = MessageResponse>(
    payload: Partial<RegisterRequest> | RawPayload,
    options: AuthRequestOptions = {},
  ): Promise<ApiResult<T>> {
    return this.post<T>('/api/register', { data: payload, ...options });
  }

  login<T = LoginResponse>(
    credentials: Partial<LoginRequest> | RawPayload,
    options: AuthRequestOptions = {},
  ): Promise<ApiResult<T>> {
    return this.post<T>('/api/login', { data: credentials, ...options });
  }

  me<T = UserProfile>(token?: string): Promise<ApiResult<T>> {
    return this.get<T>('/api/me', { token });
  }
}
