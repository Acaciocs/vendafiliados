import { Router } from "express";
import { z } from "zod";
import { generateCampaignVariants } from "../services/campaignGenerator.js";
import { extractProductFromUrl } from "../services/extractor.js";
import type { Campaign, Product } from "../types/models.js";
import { classifyUrl, resolveUrl } from "../utils/linkUtils.js";
import { readDb, saveCampaign, saveProduct } from "../utils/storage.js";

const router = Router();

const resolveSchema = z.object({ url: z.string().url() });

router.post("/resolve", async (req, res) => {
  const parsed = resolveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: "URL inválida" });

  const { url } = parsed.data;
  const { resolvedUrl, sourceType } = await resolveUrl(url);

  return res.json({ ok: true, originalUrl: url, resolvedUrl, sourceType });
});

router.post("/extract", async (req, res) => {
  const parsed = resolveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: "URL inválida" });

  const { url } = parsed.data;
  const { resolvedUrl, sourceType } = await resolveUrl(url);
  const extracted = await extractProductFromUrl(resolvedUrl, sourceType);

  const product: Product = {
    id: crypto.randomUUID(),
    title: extracted.title,
    price: extracted.price,
    oldPrice: extracted.oldPrice,
    discount: extracted.discount,
    badge: extracted.badge,
    brand: extracted.brand,
    image: extracted.image,
    affiliateLink: url,
    resolvedUrl,
    sourceType,
    createdAt: new Date().toISOString(),
  };

  await saveProduct(product);

  return res.json({
    ok: true,
    originalUrl: url,
    resolvedUrl,
    sourceType,
    product,
    missingFields: extracted.missingFields,
  });
});

const campaignSchema = z.object({
  product: z.object({
    id: z.string(),
    title: z.string().optional(),
    price: z.number().optional(),
    oldPrice: z.number().optional(),
    discount: z.string().optional(),
    badge: z.string().optional(),
    brand: z.string().optional(),
    image: z.string().optional(),
    affiliateLink: z.string(),
    resolvedUrl: z.string().optional(),
    sourceType: z.enum(["short_link", "social_link", "product_link", "unknown"]),
    commissionPercent: z.number().optional(),
    createdAt: z.string().optional(),
  }),
  channel: z.enum(["Instagram", "WhatsApp", "Telegram", "TikTok/Reel"]),
  tone: z.enum(["urgente", "neutro", "premium"]),
});

router.post("/campaigns", async (req, res) => {
  const parsed = campaignSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: "Dados inválidos", details: parsed.error.flatten() });

  const { product, channel, tone } = parsed.data;
  const variants = generateCampaignVariants(product as Product, tone);

  const campaign: Campaign = {
    id: crypto.randomUUID(),
    productId: product.id,
    channel,
    tone,
    content: variants[channel],
    createdAt: new Date().toISOString(),
  };

  await saveCampaign(campaign);
  await saveProduct({ ...product, createdAt: product.createdAt || new Date().toISOString() } as Product);

  return res.json({ ok: true, campaign, variants });
});

router.get("/dashboard", async (_req, res) => {
  const db = await readDb();
  return res.json({ ok: true, products: db.products, campaigns: db.campaigns });
});

router.get("/health", (_req, res) => res.json({ ok: true }));

router.post("/classify", (req, res) => {
  const parsed = resolveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: "URL inválida" });
  return res.json({ ok: true, sourceType: classifyUrl(parsed.data.url) });
});

export default router;
