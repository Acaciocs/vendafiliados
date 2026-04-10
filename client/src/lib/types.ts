export type SourceType = 'short_link' | 'social_link' | 'product_link' | 'unknown';

export type Product = {
  id: string;
  title?: string;
  price?: number;
  oldPrice?: number;
  discount?: string;
  badge?: string;
  brand?: string;
  image?: string;
  affiliateLink: string;
  resolvedUrl?: string;
  commissionPercent?: number;
  sourceType: SourceType;
  createdAt: string;
};

export type Campaign = {
  id: string;
  productId: string;
  channel: 'Instagram' | 'WhatsApp' | 'Telegram' | 'TikTok/Reel';
  tone: 'urgente' | 'neutro' | 'premium';
  content: string;
  createdAt: string;
};
