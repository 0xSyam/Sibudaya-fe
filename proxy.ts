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

  // Halaman auth — jika sudah punya session valid, redirect ke dashboard
  const authPages = ["/login", "/register", "/reset-password"];
  const isAuthPage = authPages.some((p) => pathname === p);

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const accessToken = request.cookies.get("access_token")?.value;
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

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

  const validSession = await isSessionValid();

  if (isAuthPage && validSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isDashboardRoute && !validSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/reset-password"],
};