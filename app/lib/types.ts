// ─── Auth Types (sesuai dengan backend response) ────────────────────────────

export interface SafeUser {
  user_id: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  provider: "LOCAL" | "GOOGLE";
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: SafeUser;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
