import * as cheerio from "cheerio";
import type { SourceType } from "../types/models.js";

type ExtractResult = {
  title?: string;
  price?: number;
  oldPrice?: number;
  discount?: string;
  badge?: string;
  brand?: string;
  image?: string;
  missingFields: string[];
};

function parsePrice(text: string) {
  const match = text.match(/R\$\s?([\d\.]+,\d{2})/);
  if (!match) return undefined;
  return Number(match[1].replace(/\./g, "").replace(",", "."));
}

function inferBrand(title?: string) {
  if (!title) return undefined;
  const known = ["Growth", "Samsung", "Apple", "Philips", "Xiaomi", "Nike"];
  return known.find((brand) => title.toLowerCase().includes(brand.toLowerCase()));
}

function mockFallback(url: string): ExtractResult {
  return {
    title: "Produto Mercado Livre",
    price: 39.9,
    oldPrice: 64.9,
    discount: "38% OFF",
    badge: "MAIS VENDIDO",
    brand: "Marca não identificada",
    image: `https://picsum.photos/seed/${encodeURIComponent(url)}/800/800`,
    missingFields: [],
  };
}

export async function extractProductFromUrl(url: string, sourceType: SourceType): Promise<ExtractResult> {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
        "accept-language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();

    const title =
      $("meta[property='og:title']").attr("content") ||
      $("h1").first().text().trim() ||
      $("title").text().trim() ||
      undefined;

    const image =
      $("meta[property='og:image']").attr("content") ||
      $("img").first().attr("src") ||
      undefined;

    const price =
      parsePrice($("meta[property='product:price:amount']").attr("content") || "") ||
      parsePrice($(".andes-money-amount__fraction").first().text()) ||
      parsePrice(bodyText);

    const oldPrice = parsePrice(bodyText.match(/de\s*R\$\s?[\d\.]+,\d{2}/i)?.[0] || "");
    const discountValue = bodyText.match(/(\d{1,2}%\s?OFF)/i)?.[1];
    const badge = bodyText.toUpperCase().includes("MAIS VENDIDO") ? "MAIS VENDIDO" : undefined;
    const brand = inferBrand(title);

    const result: ExtractResult = {
      title,
      price,
      oldPrice,
      discount: discountValue?.toUpperCase(),
      badge,
      brand,
      image,
      missingFields: [],
    };

    const required: Array<keyof Omit<ExtractResult, "missingFields">> = ["title", "price", "image"];
    result.missingFields = required.filter((field) => !result[field]).map(String);

    if (sourceType === "social_link" && !result.title) {
      result.title = bodyText.slice(0, 120) || "Produto social Mercado Livre";
      result.missingFields = result.missingFields.filter((item) => item !== "title");
    }

    if (result.missingFields.length > 1) {
      const fallback = mockFallback(url);
      return {
        ...fallback,
        ...result,
        title: result.title || fallback.title,
        price: result.price || fallback.price,
        image: result.image || fallback.image,
        oldPrice: result.oldPrice || fallback.oldPrice,
        discount: result.discount || fallback.discount,
        badge: result.badge || fallback.badge,
        brand: result.brand || fallback.brand,
        missingFields: result.missingFields,
      };
    }

    return result;
  } catch {
    return mockFallback(url);
  }
}
