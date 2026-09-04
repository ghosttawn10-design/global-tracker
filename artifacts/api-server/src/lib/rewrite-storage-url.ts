import type { Request } from "express";

const STORAGE_OBJECT_PATH = /\/api\/storage\/public-objects\/([a-f0-9-]+)/i;

export function getApiBase(req: Request): string {
  const forwardedProto = String(req.headers["x-forwarded-proto"] ?? "")
    .split(",")[0]
    ?.trim()
    .toLowerCase();
  const protocol =
    forwardedProto === "https" || forwardedProto === "http"
      ? forwardedProto
      : req.protocol;

  return `${protocol}://${req.get("host")}/api`;
}

export function rewriteStorageUrl(
  url: string | null | undefined,
  req: Request,
): string | null | undefined {
  if (!url) return url;

  const match = url.match(STORAGE_OBJECT_PATH);
  if (!match) return url;

  return `${getApiBase(req)}/storage/public-objects/${match[1]}`;
}

function rewriteHeroImages(
  heroImages: string | null | undefined,
  req: Request,
): string | null | undefined {
  if (!heroImages) return heroImages;

  try {
    const parsed = JSON.parse(heroImages);
    if (!Array.isArray(parsed)) return heroImages;

    const rewritten = parsed.map((url) =>
      typeof url === "string" ? (rewriteStorageUrl(url, req) ?? url) : url,
    );

    return JSON.stringify(rewritten);
  } catch {
    return heroImages;
  }
}

export function rewriteSettingsStorageUrls<
  T extends { logoUrl?: string | null; heroImages?: string | null },
>(settings: T, req: Request): T {
  return {
    ...settings,
    logoUrl: rewriteStorageUrl(settings.logoUrl, req) ?? settings.logoUrl,
    heroImages: rewriteHeroImages(settings.heroImages, req) ?? settings.heroImages,
  };
}
