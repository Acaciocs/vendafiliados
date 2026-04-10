import type { Campaign, Product, SourceType } from './types';

const API_URL = 'http://localhost:4000/api';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  if (!response.ok) throw new Error(`Erro ${response.status}`);
  return response.json();
}

export function resolveLink(url: string): Promise<{ ok: boolean; originalUrl: string; resolvedUrl: string; sourceType: SourceType }> {
  return api('/resolve', { method: 'POST', body: JSON.stringify({ url }) });
}

export function extractLink(url: string): Promise<{ ok: boolean; product: Product; missingFields: string[]; resolvedUrl: string; sourceType: SourceType }> {
  return api('/extract', { method: 'POST', body: JSON.stringify({ url }) });
}

export function saveCampaign(payload: { product: Product; channel: Campaign['channel']; tone: Campaign['tone'] }): Promise<{ ok: boolean; campaign: Campaign; variants: Record<string, string> }> {
  return api('/campaigns', { method: 'POST', body: JSON.stringify(payload) });
}

export function getDashboard(): Promise<{ ok: boolean; products: Product[]; campaigns: Campaign[] }> {
  return api('/dashboard');
}
