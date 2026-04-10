import type { SourceType } from "../types/models.js";

export function classifyUrl(url: string): SourceType {
  if (url.includes("meli.la")) return "short_link";
  if (url.includes("/social/")) return "social_link";
  if (url.includes("mercadolivre.") || url.includes("produto") || url.includes("MLB-")) return "product_link";
  return "unknown";
}

export async function resolveUrl(inputUrl: string): Promise<{ resolvedUrl: string; sourceType: SourceType }> {
  try {
    const response = await fetch(inputUrl, { method: "GET", redirect: "follow" });
    const resolvedUrl = response.url || inputUrl;
    return { resolvedUrl, sourceType: classifyUrl(resolvedUrl) };
  } catch {
    return { resolvedUrl: inputUrl, sourceType: classifyUrl(inputUrl) };
  }
}
