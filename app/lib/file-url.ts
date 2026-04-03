export function buildProtectedFileUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
  const normalized = path.replace(/^\//, "");

  if (!normalized.startsWith("uploads/")) {
    return `${apiBase.replace(/\/$/, "")}/${normalized}`;
  }

  const parts = normalized.split("/");
  if (parts.length < 3) {
    return `${apiBase.replace(/\/$/, "")}/${normalized}`;
  }

  const category = encodeURIComponent(parts[1]);
  const filename = encodeURIComponent(parts[parts.length - 1]);
  return `${apiBase.replace(/\/$/, "")}/files/${category}/${filename}`;
}
