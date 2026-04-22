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
  const apiBases = [
    ...(process.env.NEXT_PUBLIC_API_URL ? [process.env.NEXT_PUBLIC_API_URL.trim()] : []),
    "http://localhost:3001/api/v1",
    "http://localhost:3000/api/v1",
  ].filter((value, index, array) => Boolean(value) && array.indexOf(value) === index);
  const isProduction = process.env.NODE_ENV === "production";

  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");

  async function isSessionValid(): Promise<boolean> {
    if (!accessToken) return false;

    for (const apiBase of apiBases) {
      try {
        const res = await fetch(`${apiBase}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.ok) {
          return true;
        }

        if (![404, 502, 503, 504].includes(res.status)) {
          return false;
        }
      } catch {
        // Coba base URL berikutnya.
      }
    }

    return false;
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

    for (const apiBase of apiBases) {
      try {
        const res = await fetch(`${apiBase}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!res.ok) {
          if ([404, 502, 503, 504].includes(res.status)) {
            continue;
          }
          return false;
        }

        const data = (await res.json()) as { access_token?: string };
        if (!data.access_token) return false;

        setAccessCookie(data.access_token);
        return true;
      } catch {
        // Coba base URL berikutnya.
      }
    }

    return false;
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