"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { SafeUser, LoginDto, RegisterDto } from "./types";
import {
  authApi,
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from "./api";

// ─── Context shape ───────────────────────────────────────────────────────────

interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Cek session saat pertama kali mount
  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const me = await authApi.getMe();
      setUser(me);
    } catch {
      // Token invalid → coba refresh
      const rt = getRefreshToken();
      if (rt) {
        try {
          const { access_token } = await authApi.refresh(rt);
          localStorage.setItem("access_token", access_token);
          const me = await authApi.getMe();
          setUser(me);
        } catch {
          clearTokens();
          setUser(null);
        }
      } else {
        clearTokens();
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Login
  const login = useCallback(
    async (dto: LoginDto) => {
      const data = await authApi.login(dto);
      setTokens(data.access_token, data.refresh_token);
      setUser(data.user);

      // Redirect berdasarkan role
      if (data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard");
      }
    },
    [router],
  );

  // Register
  const register = useCallback(
    async (dto: RegisterDto) => {
      const data = await authApi.register(dto);
      setTokens(data.access_token, data.refresh_token);
      setUser(data.user);
      router.push("/dashboard");
    },
    [router],
  );

  // Google OAuth
  const loginWithGoogle = useCallback(() => {
    window.location.href = authApi.getGoogleOAuthUrl();
  }, []);

  // Logout
  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus digunakan di dalam <AuthProvider>");
  }
  return ctx;
}
