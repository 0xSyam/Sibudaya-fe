import type {
  AuthTokens,
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SafeUser,
} from "./types";

// ─── Base URL ────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

// ─── Token helpers (localStorage) ────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// ─── Fetch wrapper ───────────────────────────────────────────────────────────

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // Jika 401 & ada refresh token → coba refresh sekali
  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getAccessToken()}`;
      const retryRes = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({
          statusCode: retryRes.status,
          message: retryRes.statusText,
        }));
        throw err;
      }
      return retryRes.json() as Promise<T>;
    } else {
      // Refresh gagal → clear tokens
      clearTokens();
      throw { statusCode: 401, message: "Sesi telah berakhir. Silakan login kembali." };
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({
      statusCode: res.status,
      message: res.statusText,
    }));
    throw err;
  }

  return res.json() as Promise<T>;
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return false;

    const data = (await res.json()) as { access_token: string };
    localStorage.setItem("access_token", data.access_token);
    return true;
  } catch {
    return false;
  }
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export const authApi = {
  /** Login dengan email & password */
  login(dto: LoginDto): Promise<AuthTokens> {
    return apiFetch<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  /** Register user baru */
  register(dto: RegisterDto): Promise<AuthTokens> {
    return apiFetch<AuthTokens>("/auth/register", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  /** Ambil URL redirect Google OAuth */
  getGoogleOAuthUrl(): string {
    return `${API_BASE}/auth/google`;
  },

  /** Ambil data user yang sedang login */
  getMe(): Promise<SafeUser> {
    return apiFetch<SafeUser>("/auth/me");
  },

  /** Refresh access token */
  refresh(refreshToken: string): Promise<{ access_token: string }> {
    return apiFetch<{ access_token: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  /** Request reset password token */
  forgotPassword(dto: ForgotPasswordDto): Promise<{ reset_token: string }> {
    return apiFetch<{ reset_token: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  /** Reset password dengan token */
  resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    return apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },
};
