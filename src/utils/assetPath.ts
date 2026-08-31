export function resolvePublicAssetPath(path?: string) {
  if (!path) {
    return undefined;
  }

  if (/^(?:https?:|data:|blob:)/.test(path)) {
    return path;
  }

  const base = import.meta.env.BASE_URL || "/";

  if (path.startsWith("/")) {
    return `${base.replace(/\/$/, "")}${path}`;
  }

  return `${base.endsWith("/") ? base : `${base}/`}${path}`;
}
