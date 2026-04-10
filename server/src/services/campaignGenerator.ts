import type { Campaign, Product } from "../types/models.js";

function currency(value?: number) {
  if (!value) return "preço sob consulta";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function generateCampaignVariants(product: Product, tone: Campaign["tone"]) {
  const tonePrefix = tone === "urgente" ? "🔥 Últimas unidades" : tone === "premium" ? "✨ Oferta premium" : "✅ Oferta recomendada";
  const title = product.title || "Produto sem título";
  const price = currency(product.price);
  const discount = product.discount ? ` (${product.discount})` : "";

  return {
    Instagram: `${tonePrefix}\n\n${title}\n💰 ${price}${discount}\n👉 Confira pelo meu link: ${product.affiliateLink}`,
    WhatsApp: `${tonePrefix}\n${title}\nDe forma prática: ${price}${discount}\nLink: ${product.affiliateLink}`,
    Telegram: `${tonePrefix}\n${title}\nPreço: ${price}${discount}\n🔗 ${product.affiliateLink}`,
    "TikTok/Reel": `"Olha isso aqui..."\n"${title}"\n"${price}${discount}"\n"Link no perfil"`,
  };
}
