const storageKey = "promopilot-state-v1";

const initialState = {
  settings: {
    projectName: "PromoPilot Core",
    ctaSignature: "Clique agora e aproveite antes de acabar!",
  },
  products: [
    {
      id: crypto.randomUUID(),
      name: "Curso IA para Afiliados",
      price: 297,
      commission: 55,
      category: "Educação",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=60",
      score: 88,
      clicks: 490,
      conversion: 7.8,
      badge: "MAIS VENDIDO",
    },
    {
      id: crypto.randomUUID(),
      name: "Pack Design Viral",
      price: 89,
      commission: 40,
      category: "Design",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=800&q=60",
      score: 73,
      clicks: 320,
      conversion: 6.1,
      badge: "ALTA CONVERSÃO",
    },
    {
      id: crypto.randomUUID(),
      name: "Mentoria Escala Ads",
      price: 1297,
      commission: 32,
      category: "Marketing",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=60",
      score: 81,
      clicks: 210,
      conversion: 4.3,
      badge: "PREMIUM",
    },
  ],
  campaigns: [
    { id: crypto.randomUUID(), name: "Lançamento IA", channel: "Instagram", status: "Published", clicks: 650, score: 91 },
    { id: crypto.randomUUID(), name: "Oferta Design", channel: "WhatsApp", status: "Ready", clicks: 221, score: 70 },
    { id: crypto.randomUUID(), name: "Sequência Mentoria", channel: "Email", status: "Scheduled", clicks: 180, score: 76 },
  ],
  schedules: [],
};

let state = loadState();

function loadState() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return structuredClone(initialState);
  try {
    return JSON.parse(raw);
  } catch {
    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function currency(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("show"), 2000);
}

function getStatusBadge(status) {
  const mapping = { Draft: "warn", Ready: "info", Scheduled: "warn", Published: "ok" };
  return `<span class="badge ${mapping[status] || "info"}">${status}</span>`;
}

function viewMeta(view) {
  const subtitles = {
    dashboard: "Visão geral do seu desempenho",
    resolver: "Transforme links em oportunidades",
    produtos: "Gerencie e otimize seu portfólio",
    criativos: "Geração inteligente de copy e CTA",
    campanhas: "Orquestre campanhas multi-canal",
    analytics: "Métricas para decisões de escala",
    agenda: "Calendário de publicações",
    configuracoes: "Personalize sua operação",
  };
  return { title: document.querySelector(`[data-view="${view}"]`) ? document.querySelector(`.menu-item[data-view="${view}"]`).textContent : "", subtitle: subtitles[view] };
}

function renderKpis() {
  const avgCommission = state.products.length
    ? state.products.reduce((acc, p) => acc + p.commission, 0) / state.products.length
    : 0;

  const kpis = [
    ["Produtos", state.products.length],
    ["Campanhas", state.campaigns.length],
    ["Cliques", state.campaigns.reduce((acc, c) => acc + c.clicks, 0)],
    ["Comissão média", `${avgCommission.toFixed(1)}%`],
  ];

  document.getElementById("kpiGrid").innerHTML = kpis
    .map(([label, value]) => `<article class="kpi-card"><p>${label}</p><strong>${value}</strong></article>`)
    .join("");
}

function renderDashboardLists() {
  const top = [...state.products].sort((a, b) => b.score - a.score).slice(0, 4);
  document.getElementById("topProductsList").innerHTML = top
    .map((p) => `<li><strong>${p.name}</strong><br><small>${currency(p.price)} · ${p.commission}% comissão · score ${p.score}</small></li>`)
    .join("");

  const latest = [...state.campaigns].slice(-4).reverse();
  document.getElementById("latestCampaignsList").innerHTML = latest
    .map((c) => `<li><strong>${c.name}</strong><br><small>${c.channel} · ${c.clicks} cliques · ${getStatusBadge(c.status)}</small></li>`)
    .join("");
}

function renderProducts() {
  const search = document.getElementById("productSearch").value.trim().toLowerCase();
  const commissionFilter = document.getElementById("commissionFilter").value;
  const sortBy = document.getElementById("productSort").value;

  let products = state.products.filter((p) => p.name.toLowerCase().includes(search));
  if (commissionFilter === "high") products = products.filter((p) => p.commission > 40);
  if (commissionFilter === "mid") products = products.filter((p) => p.commission >= 20 && p.commission <= 40);
  if (commissionFilter === "low") products = products.filter((p) => p.commission < 20);

  products.sort((a, b) => b[sortBy] - a[sortBy]);

  document.getElementById("productGrid").innerHTML = products
    .map(
      (p) => `
      <article class="card product-card">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
        <h4>${p.name}</h4>
        <p class="muted">${p.category}</p>
        <div class="meta"><strong>${currency(p.price)}</strong><span>${p.commission}% comissão</span></div>
        <div class="meta"><span class="badge info">score ${p.score}</span><span class="badge ok">${p.badge}</span></div>
        <div class="actions">
          <button class="btn btn-ghost" onclick="generateCopyForProduct('${p.id}')">Gerar copy</button>
          <button class="btn btn-primary" onclick="createCampaignFromProduct('${p.id}')">Criar campanha</button>
          <button class="btn btn-ghost" onclick="removeProduct('${p.id}')">Remover</button>
        </div>
      </article>`
    )
    .join("");

  const options = state.products
    .map((p) => `<option value="${p.id}">${p.name}</option>`)
    .join("");
  document.getElementById("creativeProductSelect").innerHTML = options;
  document.getElementById("scheduleCampaignSelect").innerHTML = state.campaigns
    .map((c) => `<option value="${c.id}">${c.name}</option>`)
    .join("");
}

function renderCampaigns() {
  document.getElementById("campaignList").innerHTML = state.campaigns
    .map(
      (c) => `
      <article class="list" style="margin-bottom:10px;">
        <li>
          <div class="row-between">
            <div>
              <strong>${c.name}</strong>
              <p class="muted">${c.channel} · ${c.clicks} cliques · score ${c.score}</p>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              ${getStatusBadge(c.status)}
              <select onchange="updateCampaignStatus('${c.id}', this.value)">
                <option ${c.status === "Draft" ? "selected" : ""}>Draft</option>
                <option ${c.status === "Ready" ? "selected" : ""}>Ready</option>
                <option ${c.status === "Scheduled" ? "selected" : ""}>Scheduled</option>
                <option ${c.status === "Published" ? "selected" : ""}>Published</option>
              </select>
            </div>
          </div>
        </li>
      </article>`
    )
    .join("");
}

function renderAnalytics() {
  const revenue = state.products.reduce((acc, p) => acc + p.price * (p.conversion / 100) * p.clicks, 0);
  const best = [...state.products].sort((a, b) => b.score - a.score)[0];
  const ctr = state.campaigns.length
    ? state.campaigns.reduce((acc, c) => acc + c.score, 0) / state.campaigns.length
    : 0;

  document.getElementById("analyticsKpis").innerHTML = `
    <article class="kpi-card"><p>Receita potencial</p><strong>${currency(revenue)}</strong></article>
    <article class="kpi-card"><p>Melhor produto</p><strong>${best ? best.name : "-"}</strong></article>
    <article class="kpi-card"><p>CTR simulado</p><strong>${ctr.toFixed(1)}%</strong></article>
  `;

  document.getElementById("analyticsTable").innerHTML = state.products
    .map(
      (p) => `
      <tr>
        <td>${p.name}</td>
        <td>${p.clicks}</td>
        <td>${p.conversion.toFixed(1)}%</td>
        <td>${currency(p.price * (p.conversion / 100) * p.clicks)}</td>
        <td>${p.score}</td>
      </tr>
    `
    )
    .join("");
}

function renderAgenda() {
  const schedule = state.schedules
    .map((s) => {
      const campaign = state.campaigns.find((c) => c.id === s.campaignId);
      return `<li><strong>${campaign?.name || "Campanha"}</strong><br><small>${campaign?.channel || ""} · ${new Date(s.date).toLocaleDateString("pt-BR")}</small></li>`;
    })
    .join("");
  document.getElementById("scheduledList").innerHTML = schedule || "<li>Nenhuma campanha agendada.</li>";
}

function renderSettings() {
  document.getElementById("projectNameInput").value = state.settings.projectName;
  document.getElementById("ctaSignatureInput").value = state.settings.ctaSignature;
}

function renderAll() {
  renderKpis();
  renderDashboardLists();
  renderProducts();
  renderCampaigns();
  renderAnalytics();
  renderAgenda();
  renderSettings();
  saveState();
}

function switchView(view) {
  document.querySelectorAll(".view").forEach((el) => el.classList.toggle("active", el.dataset.view === view));
  document.querySelectorAll(".menu-item").forEach((el) => el.classList.toggle("active", el.dataset.view === view));
  const meta = viewMeta(view);
  document.getElementById("currentViewTitle").textContent = meta.title;
  document.getElementById("currentViewSubtitle").textContent = meta.subtitle;
}

function simulateResolvedProduct(url) {
  const tokens = url.replace(/https?:\/\//, "").split(/[\/-]/).filter(Boolean);
  const baseName = tokens.slice(-2).join(" ") || "Produto Inteligente";
  const price = Math.floor(Math.random() * 900) + 59;
  const commission = Math.floor(Math.random() * 45) + 15;
  const score = Math.min(98, Math.floor(commission + Math.random() * 40));
  const category = ["Marketing", "Educação", "Produtividade", "Design"][Math.floor(Math.random() * 4)];

  return {
    id: crypto.randomUUID(),
    name: baseName
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    price,
    commission,
    category,
    image: `https://picsum.photos/seed/${encodeURIComponent(baseName)}/800/500`,
    score,
    clicks: Math.floor(Math.random() * 250) + 40,
    conversion: Number((Math.random() * 8 + 1).toFixed(1)),
    badge: score > 85 ? "MAIS VENDIDO" : "NOVA OFERTA",
  };
}

function detectPageType(url) {
  let type = "product_page";
  if (url.includes("/social/")) {
    type = "social_page";
  }
  if (url.includes("mercadolivre") || url.includes("ml")) {
    type = "marketplace_page";
  }
  return type;
}

function extractFromText(text) {
  const cleanText = text || "";
  const priceMatch = cleanText.match(/R\$\s?\d+[\.,]\d+/);
  const oldPriceMatch = cleanText.match(/(?:de|por)\s*(R\$\s?\d+[\.,]\d+)/i);
  const discountMatch = cleanText.match(/(\d{1,2})\s?%\s?(?:OFF|off|desconto)/);
  const titleMatch = cleanText.match(/(?:^|\n)([A-ZÀ-Úa-zà-ú0-9\-\s]{8,80})(?:\n|$)/);
  const badge = cleanText.toUpperCase().includes("MAIS VENDIDO") ? "MAIS VENDIDO" : null;

  return {
    name: titleMatch?.[1]?.trim() || null,
    priceText: priceMatch?.[0] || null,
    oldPriceText: oldPriceMatch?.[1] || null,
    discount: discountMatch ? Number(discountMatch[1]) : null,
    badge,
  };
}

window.generateCopyForProduct = function generateCopyForProduct(productId) {
  switchView("criativos");
  document.querySelector('.menu-item[data-view="criativos"]').classList.add("active");
  document.getElementById("creativeProductSelect").value = productId;
  document.getElementById("generateCreativeBtn").click();
};

window.createCampaignFromProduct = function createCampaignFromProduct(productId) {
  const product = state.products.find((p) => p.id === productId);
  if (!product) return;
  state.campaigns.push({
    id: crypto.randomUUID(),
    name: `Campanha ${product.name.split(" ")[0]}`,
    channel: ["Instagram", "WhatsApp", "Email"][Math.floor(Math.random() * 3)],
    status: "Draft",
    clicks: 0,
    score: Math.max(50, product.score - 10),
  });
  renderAll();
  switchView("campanhas");
  showToast("Campanha criada com sucesso.");
};

window.removeProduct = function removeProduct(productId) {
  state.products = state.products.filter((p) => p.id !== productId);
  renderAll();
  showToast("Produto removido.");
};

window.updateCampaignStatus = function updateCampaignStatus(campaignId, status) {
  const campaign = state.campaigns.find((c) => c.id === campaignId);
  if (!campaign) return;
  campaign.status = status;
  campaign.score = Math.min(99, campaign.score + 2);
  renderAll();
  showToast("Status atualizado.");
};

document.getElementById("mainMenu").addEventListener("click", (event) => {
  const button = event.target.closest(".menu-item");
  if (!button) return;
  switchView(button.dataset.view);
});

document.getElementById("resolveUrlBtn").addEventListener("click", () => {
  const url = document.getElementById("affiliateUrlInput").value.trim();
  if (!url) return showToast("Cole um link válido para continuar.");
  const pageText = document.getElementById("pageTextInput").value.trim();
  const pageType = detectPageType(url);
  const extracted = extractFromText(pageText);
  const product = simulateResolvedProduct(url);

  if (extracted.name) product.name = extracted.name;
  if (extracted.priceText) {
    const normalized = extracted.priceText.replace(/[R$\s]/g, "").replace(".", "").replace(",", ".");
    const parsed = Number(normalized);
    if (!Number.isNaN(parsed)) product.price = parsed;
  }
  if (extracted.badge) product.badge = extracted.badge;

  const oldPrice = extracted.oldPriceText
    ? Number(extracted.oldPriceText.replace(/[R$\s]/g, "").replace(".", "").replace(",", "."))
    : null;
  const discountAuto = extracted.discount || (oldPrice && product.price ? Math.round((1 - product.price / oldPrice) * 100) : null);

  document.getElementById("resolvedProductContainer").innerHTML = `
    <article class="card product-card">
      <img src="${product.image}" alt="${product.name}" />
      <h4>${product.name}</h4>
      <p class="muted">${product.category} · tipo: ${pageType}</p>
      <div class="meta"><strong>${currency(product.price)}</strong><span>${product.commission}% comissão</span></div>
      <div class="meta">
        <span class="badge ok">${product.badge}</span>
        <span class="badge info">${discountAuto ? `${discountAuto}% OFF` : "Desconto não detectado"}</span>
      </div>
      <label style="margin-top:10px;">
        Comissão não encontrada automaticamente? Digite a comissão (%)
        <input type="number" min="1" max="100" id="resolvedCommissionInput" placeholder="Ex: 20" />
      </label>
      <p id="gainPreview" class="muted">💰 Ganho por venda: ${currency(product.price * (product.commission / 100))}</p>
      <div class="actions">
        <button class="btn btn-primary" id="addResolvedProductBtn">Adicionar Produto</button>
      </div>
    </article>
  `;

  document.getElementById("resolvedCommissionInput").addEventListener("input", (event) => {
    const customCommission = Number(event.target.value);
    if (customCommission > 0 && customCommission <= 100) {
      product.commission = customCommission;
      document.getElementById("gainPreview").textContent = `💰 Ganho por venda: ${currency(product.price * (customCommission / 100))}`;
    }
  });

  document.getElementById("addResolvedProductBtn").addEventListener("click", () => {
    state.products.unshift(product);
    renderAll();
    showToast("Produto adicionado ao catálogo.");
  });
});

["productSearch", "commissionFilter", "productSort"].forEach((id) => {
  document.getElementById(id).addEventListener("input", renderProducts);
  document.getElementById(id).addEventListener("change", renderProducts);
});

document.getElementById("generateCreativeBtn").addEventListener("click", () => {
  const product = state.products.find((p) => p.id === document.getElementById("creativeProductSelect").value);
  if (!product) return;
  const channel = document.getElementById("creativeChannel").value;
  const tone = document.getElementById("creativeTone").value;
  const urgency = tone === "Urgente" ? "Últimas unidades" : tone === "Premium" ? "Oferta exclusiva" : "Aproveite com calma";
  const cta = `${state.settings.ctaSignature} (${channel})`;

  const channelTemplates = {
    Instagram: `🔥 ${product.badge} NO MERCADO!\n\n${product.name}\n\n💰 Por ${currency(product.price)}\n✔️ Excelente custo-benefício\n✔️ Produto em alta\n\n👉 ${cta}`,
    WhatsApp: `🔥 Oferta top!\n\n${product.name}\n\nPor ${currency(product.price)}\n👉 Link: [seu link afiliado]\n${cta}`,
    TikTok: `"Se você treina, olha isso..."\n"${product.name} por ${currency(product.price)}"\n"Tá muito barato agora"\n"Link na descrição"`,
    Email: `Assunto: Oferta especial de ${product.name}\n\n${urgency}: ${product.name} com oportunidade de escala.\nPreço atual: ${currency(product.price)}.\n${cta}`,
  };

  document.getElementById("creativeOutput").innerHTML = `
    <h3>Resultado</h3>
    <p><strong>Texto:</strong> ${urgency}: ${product.name} por ${currency(product.price)} com ${product.commission}% de comissão para afiliados.</p>
    <p><strong>CTA:</strong> ${cta}</p>
    <p><strong>Hashtags:</strong> #afiliados #marketingdigital #${channel.toLowerCase()} #promopilot</p>
    <pre style="white-space:pre-wrap; background:#f8fafc; border:1px solid #e2e8f0; padding:12px; border-radius:12px;"><strong>Modelo ${channel}:</strong>\n${channelTemplates[channel]}</pre>
  `;
  showToast("Criativo gerado.");
});

document.getElementById("createCampaignBtn").addEventListener("click", () => {
  const randomProduct = state.products[Math.floor(Math.random() * state.products.length)];
  if (!randomProduct) return;
  window.createCampaignFromProduct(randomProduct.id);
});

document.getElementById("quickCampaignBtn").addEventListener("click", () => {
  switchView("campanhas");
  document.getElementById("createCampaignBtn").click();
});

document.getElementById("simulateClicksBtn").addEventListener("click", () => {
  state.products = state.products.map((p) => {
    const extraClicks = Math.floor(Math.random() * 80);
    const newClicks = p.clicks + extraClicks;
    const newConversion = Math.min(12, Math.max(1, p.conversion + (Math.random() * 1.2 - 0.4)));
    return {
      ...p,
      clicks: newClicks,
      conversion: Number(newConversion.toFixed(1)),
      score: Math.min(99, Math.floor((p.commission * 0.6 + newConversion * 3 + Math.log(newClicks) * 8))),
    };
  });

  state.campaigns = state.campaigns.map((c) => ({
    ...c,
    clicks: c.clicks + Math.floor(Math.random() * 120),
    score: Math.min(99, c.score + Math.floor(Math.random() * 3)),
  }));

  renderAll();
  showToast("Novos cliques simulados com sucesso.");
});

document.getElementById("scheduleBtn").addEventListener("click", () => {
  const campaignId = document.getElementById("scheduleCampaignSelect").value;
  const date = document.getElementById("scheduleDate").value;
  if (!campaignId || !date) return showToast("Selecione campanha e data.");
  state.schedules.push({ id: crypto.randomUUID(), campaignId, date });
  const target = state.campaigns.find((c) => c.id === campaignId);
  if (target) target.status = "Scheduled";
  renderAll();
  showToast("Campanha agendada.");
});

document.getElementById("saveSettingsBtn").addEventListener("click", () => {
  state.settings.projectName = document.getElementById("projectNameInput").value.trim() || "PromoPilot Core";
  state.settings.ctaSignature = document.getElementById("ctaSignatureInput").value.trim() || initialState.settings.ctaSignature;
  renderAll();
  showToast("Configurações salvas.");
});

renderAll();
switchView("dashboard");
