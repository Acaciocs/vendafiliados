import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { extractLink, getDashboard, resolveLink, saveCampaign } from './lib/api';
import type { Campaign, Product } from './lib/types';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolved, setResolved] = useState<{ resolvedUrl: string; sourceType: string } | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [channel, setChannel] = useState<Campaign['channel']>('Instagram');
  const [tone, setTone] = useState<Campaign['tone']>('urgente');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [productsCount, setProductsCount] = useState(0);

  const earningPreview = useMemo(() => {
    if (!product?.price || !product?.commissionPercent) return null;
    return (product.price * (product.commissionPercent / 100)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }, [product]);

  async function refreshDashboard() {
    const data = await getDashboard();
    setCampaigns(data.campaigns);
    setProductsCount(data.products.length);
  }

  useEffect(() => {
    refreshDashboard().catch(() => undefined);
  }, []);

  async function handleResolve() {
    try {
      setLoading(true);
      setError(null);
      const resolvedData = await resolveLink(url);
      const extractData = await extractLink(url);
      setResolved({ resolvedUrl: resolvedData.resolvedUrl, sourceType: resolvedData.sourceType });
      setProduct(extractData.product);
      setMissingFields(extractData.missingFields);
    } catch {
      setError('Falha ao processar o link. Verifique URL e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateCampaign() {
    if (!product) return;
    try {
      setLoading(true);
      setError(null);
      await saveCampaign({ product, channel, tone });
      await refreshDashboard();
    } catch {
      setError('Erro ao gerar campanha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8">
        <Topbar />

        <section className="grid md:grid-cols-3 gap-4 mb-6">
          <article className="card"><p className="label">Produtos</p><p className="value">{productsCount}</p></article>
          <article className="card"><p className="label">Campanhas</p><p className="value">{campaigns.length}</p></article>
          <article className="card"><p className="label">Última atualização</p><p className="value text-base">{new Date().toLocaleString('pt-BR')}</p></article>
        </section>

        <section className="card mb-6">
          <h2 className="section-title">Resolver Link Mercado Livre</h2>
          <div className="grid md:grid-cols-[1fr_auto] gap-3">
            <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://meli.la/... ou link social/produto" />
            <button disabled={loading || !url} onClick={handleResolve} className="btn-primary">{loading ? 'Processando...' : 'Resolver'}</button>
          </div>
          {resolved && <p className="text-sm text-slate-600 mt-3">Tipo: <b>{resolved.sourceType}</b> · URL final: {resolved.resolvedUrl}</p>}
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </section>

        {product && (
          <section className="grid lg:grid-cols-2 gap-6 mb-6">
            <article className="card">
              <h3 className="section-title">Produto detectado</h3>
              {product.image && <img src={product.image} alt={product.title} className="h-52 w-full object-cover rounded-xl mb-3" />}
              <div className="space-y-2">
                <input className="input" value={product.title || ''} onChange={(e) => setProduct({ ...product, title: e.target.value })} placeholder="Título" />
                <div className="grid grid-cols-2 gap-2">
                  <input className="input" type="number" value={product.price ?? ''} onChange={(e) => setProduct({ ...product, price: Number(e.target.value) || undefined })} placeholder="Preço" />
                  <input className="input" type="number" value={product.oldPrice ?? ''} onChange={(e) => setProduct({ ...product, oldPrice: Number(e.target.value) || undefined })} placeholder="Preço antigo" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input className="input" value={product.discount || ''} onChange={(e) => setProduct({ ...product, discount: e.target.value })} placeholder="Desconto" />
                  <input className="input" value={product.badge || ''} onChange={(e) => setProduct({ ...product, badge: e.target.value })} placeholder="Badge" />
                </div>
                <input className="input" value={product.brand || ''} onChange={(e) => setProduct({ ...product, brand: e.target.value })} placeholder="Marca" />
                <input className="input" type="number" value={product.commissionPercent ?? ''} onChange={(e) => setProduct({ ...product, commissionPercent: Number(e.target.value) || undefined })} placeholder="Comissão (%) manual" />
                {earningPreview && <p className="text-sm text-emerald-700">💰 Ganho por venda: <b>{earningPreview}</b></p>}
                {missingFields.length > 0 && <p className="text-xs text-amber-600">Campos faltantes detectados: {missingFields.join(', ')}</p>}
              </div>
            </article>

            <article className="card">
              <h3 className="section-title">Gerar campanha</h3>
              <div className="space-y-3">
                <select className="input" value={channel} onChange={(e) => setChannel(e.target.value as Campaign['channel'])}>
                  <option>Instagram</option>
                  <option>WhatsApp</option>
                  <option>Telegram</option>
                  <option>TikTok/Reel</option>
                </select>
                <select className="input" value={tone} onChange={(e) => setTone(e.target.value as Campaign['tone'])}>
                  <option value="urgente">Urgente</option>
                  <option value="neutro">Neutro</option>
                  <option value="premium">Premium</option>
                </select>
                <button className="btn-primary w-full" disabled={loading} onClick={handleGenerateCampaign}>Gerar Campaign</button>
              </div>
            </article>
          </section>
        )}

        <section className="card">
          <h3 className="section-title">Dashboard de Campanhas</h3>
          {campaigns.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhuma campanha ainda.</p>
          ) : (
            <ul className="space-y-3">
              {campaigns.map((item) => (
                <li key={item.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <p className="text-sm text-slate-500">{item.channel} · {item.tone} · {new Date(item.createdAt).toLocaleString('pt-BR')}</p>
                  <p className="text-slate-900 whitespace-pre-wrap">{item.content}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
