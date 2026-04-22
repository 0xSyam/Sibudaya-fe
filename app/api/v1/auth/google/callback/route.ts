import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEFAULT_BACKEND_API_BASE = "http://localhost:3001/api/v1";
const SECONDARY_BACKEND_API_BASE = "http://localhost:3000/api/v1";

function getBackendCallbackUrl(request: NextRequest): URL {
  const configuredApiBase =
    process.env.INTERNAL_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_BACKEND_API_BASE;

  const apiBaseCandidates = [
    configuredApiBase,
    DEFAULT_BACKEND_API_BASE,
    SECONDARY_BACKEND_API_BASE,
  ].filter((value, index, array) => Boolean(value) && array.indexOf(value) === index);

  const firstNonLoopBase =
    apiBaseCandidates.find((base) => {
      const target = new URL("/auth/google/callback", base);
      return !(target.origin === request.nextUrl.origin && target.pathname === request.nextUrl.pathname);
    }) ?? DEFAULT_BACKEND_API_BASE;

  const target = new URL("/auth/google/callback", firstNonLoopBase);

  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  return target;
}

export function GET(request: NextRequest) {
  const target = getBackendCallbackUrl(request);
  return NextResponse.redirect(target, 302);
}
