import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy untuk proteksi route.
 *
 * Validasi dilakukan server-side dengan memanggil endpoint /auth/me
 * menggunakan access_token dari HttpOnly cookie.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
  const isProduction = process.env.NODE_ENV === "production";

  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");

  async function isSessionValid(): Promise<boolean> {
    if (!accessToken) return false;

    try {
      const res = await fetch(`${apiBase}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  function setAccessCookie(token: string): void {
    response.cookies.set({
      name: "access_token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
      maxAge: 15 * 60,
    });
  }

  async function tryRefreshSession(): Promise<boolean> {
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${apiBase}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) return false;

      const data = (await res.json()) as { access_token?: string };
      if (!data.access_token) return false;

      setAccessCookie(data.access_token);
      return true;
    } catch {
      return false;
    }
  }

  const validSession = await isSessionValid();

  if (isDashboardRoute && !validSession) {
    const refreshed = await tryRefreshSession();

    if (!refreshed) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};