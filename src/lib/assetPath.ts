/** Путь к статическому файлу с учётом GitHub Pages (/bibliya) и локального index.html */
export function assetPath(path: string): string {
  if (!path.startsWith("/")) return path;

  if (typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/bibliya")) {
      return `/bibliya${path}`;
    }
    return `.${path}`;
  }

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}${path}`;
}
