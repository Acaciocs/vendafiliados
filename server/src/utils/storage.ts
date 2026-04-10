import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Campaign, DbShape, Product } from "../types/models.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = path.resolve(__dirname, "../data/db.json");

const initialData: DbShape = { products: [], campaigns: [] };

async function ensureFile() {
  try {
    await fs.access(dataFile);
  } catch {
    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    await fs.writeFile(dataFile, JSON.stringify(initialData, null, 2), "utf-8");
  }
}

export async function readDb(): Promise<DbShape> {
  await ensureFile();
  const raw = await fs.readFile(dataFile, "utf-8");
  return JSON.parse(raw) as DbShape;
}

export async function writeDb(data: DbShape) {
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), "utf-8");
}

export async function saveProduct(product: Product) {
  const db = await readDb();
  const existingIndex = db.products.findIndex((item) => item.id === product.id);
  if (existingIndex >= 0) db.products[existingIndex] = product;
  else db.products.unshift(product);
  await writeDb(db);
}

export async function saveCampaign(campaign: Campaign) {
  const db = await readDb();
  db.campaigns.unshift(campaign);
  await writeDb(db);
}
