import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware untuk proteksi route.
 *
 * Karena JWT disimpan di localStorage (tidak tersedia di middleware/server),
 * kita gunakan cookie sederhana "auth_session" sebagai flag.
 * Alternatifnya, kita lakukan client-side redirect di dashboard layout.
 *
 * Untuk saat ini: redirect auth pages jika sudah ada flag,
 * dan biarkan dashboard melakukan client-side auth check.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Halaman auth — jika sudah punya auth flag, redirect ke dashboard
  const authPages = ["/login", "/register", "/reset-password"];
  const isAuthPage = authPages.some((p) => pathname === p);

  // Untuk saat ini, middleware hanya mengatur header
  // Proteksi utama dilakukan di client-side (AuthGuard component)
  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/reset-password"],
};
