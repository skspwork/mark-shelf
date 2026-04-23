const raw = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
const basePath =
  raw && raw !== "/" && raw !== "" ? raw.replace(/\/$/, "") : "";

export function withBasePath(path: string): string {
  if (!path.startsWith("/")) return path;
  return basePath + path;
}
