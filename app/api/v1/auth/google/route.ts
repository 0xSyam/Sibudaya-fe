import { NextResponse } from "next/server";

const DEFAULT_API_BASES = [
  "http://localhost:3001/api/v1",
  "http://localhost:3000/api/v1",
] as const;

function getApiBaseCandidates(): string[] {
  const configured = [
    process.env.INTERNAL_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set([...configured, ...DEFAULT_API_BASES])];
}

export async function GET() {
  const apiBases = getApiBaseCandidates();

  for (const base of apiBases) {
    const authUrl = `${base}/auth/google`;

    try {
      const probe = await fetch(authUrl, {
        method: "GET",
        redirect: "manual",
      });

      const isRedirect = probe.status >= 300 && probe.status < 400;
      const locationHeader = probe.headers.get("location");

      if (isRedirect && locationHeader) {
        return NextResponse.redirect(locationHeader, 302);
      }

      if (probe.ok) {
        return NextResponse.redirect(authUrl, 302);
      }
    } catch {
      // Try next backend candidate.
    }
  }

  return NextResponse.json(
    {
      statusCode: 503,
      message: "Backend auth service tidak tersedia di seluruh fallback port.",
    },
    { status: 503 },
  );
}
