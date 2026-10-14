// Links próprios dos afiliados usam a mesma loja, sem alterar preços.
const affiliatePath = location.pathname.replace(/\/index\.html$/, '/').match(/^\/stickers\/([a-z][a-z0-9-]{1,39})\/?$/);
const affiliateQuery=new URLSearchParams(location.search||'').get('ref');
const storeAffiliate = /^[a-z][a-z0-9-]{1,39}$/.test(affiliateQuery||'')?affiliateQuery:affiliatePath?affiliatePath[1]:null;
const DELIVERY_ORIGIN = "https://srv2030058.hstgr.cloud";
const DELIVERY_PRODUCTS = { "combo-completo": "combo", "respostas-impertinentes": "respostas", "proibido": "proibido", "musicas": "musicas", "animezando": "animezando", "politicando": "politicando", "cantadas": "cantadas" };
let onlineProducts = new Map();
let onlineLoaded = false;
let onlineUnavailable = false;
function deliveryReady(pack) { return onlineProducts.get(DELIVERY_PRODUCTS[pack.id])?.available === true; }
function deliveryLink(pack) { return `${DELIVERY_ORIGIN}/?pack=${encodeURIComponent(onlineProducts.get(DELIVERY_PRODUCTS[pack.id])?.id || DELIVERY_PRODUCTS[pack.id])}${storeAffiliate ? '&ref=' + encodeURIComponent(storeAffiliate) : ''}`; }
function purchaseButton(pack, className = 'buy-button', label = 'Comprar') {
  const purchase = deliveryReady(pack)
    ? `<a class="${className}" href="${deliveryLink(pack)}" rel="noopener">Comprar <i class="bi bi-arrow-up-right" aria-hidden="true"></i></a>`
    : `<span class="${className} delivery-unavailable" aria-disabled="true">${!onlineLoaded ? 'Carregando...' : onlineUnavailable ? 'Indisponível agora' : 'Em preparação'}</span>`;
  return `<div class="purchase-options">${purchase}<a class="whatsapp-option" href="${supportLink(pack)}" target="_blank" rel="noopener noreferrer">Atendimento via WhatsApp</a></div>`;
}

function supportLink(pack) { return 'https://wa.me/558892910298?text=' + encodeURIComponent('Olá! Gostaria de saber sobre os packs'); }
async function loadDeliveryCatalog() {
  try {
    const response = await fetch(DELIVERY_ORIGIN + '/api/catalog', { cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Catálogo indisponível');
    const data = await response.json(); if (!Array.isArray(data.products)) throw new Error('Catálogo inválido');
    for (const product of data.products) {
      if (typeof product.id !== 'string' || typeof product.available !== 'boolean' || !Number.isSafeInteger(product.amountCents) || product.amountCents < 1) continue;
      const metadata = { id: product.id, available: product.available, amountCents: product.amountCents };
      onlineProducts.set(product.id, metadata);
      if (typeof product.storeId === 'string') onlineProducts.set(product.storeId, metadata);
    }
    // The amount displayed must match the amount that will be charged on the server.
    for (const pack of packs) { const product = onlineProducts.get(DELIVERY_PRODUCTS[pack.id]); if (product?.available) pack.price = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.amountCents / 100); }
  } catch { onlineUnavailable = true; }
  onlineLoaded = true; renderCatalog(); renderPanel();
  const combo = packs.find(pack => pack.id === 'combo-completo');
  document.querySelector('#online-combo-action').innerHTML = purchaseButton(combo, 'button dark', 'Quero o Combo Completo');
  const price = document.querySelector('#online-combo-price'); if (price) price.textContent = combo.price;
  document.querySelector('#delivery-store-status').textContent = onlineUnavailable ? 'As compras estão temporariamente indisponíveis. Tente novamente em alguns instantes.' : 'Escolha seu pack, confirme seu email e pague com Pix ou cartão. Receba o acesso na conversa e por email após a confirmação.' + (packs.some(pack => !deliveryReady(pack)) ? ' Alguns packs estarão disponíveis em breve.' : '');
}
const packs = [
  {
    id: "combo-completo",
    name: "Combo Completo",
    category: "combos",
    count: "+800",
    price: "R$ 19,99",
    image: "packs/combo.png",
    buy: "https://mpago.la/2SVyKpG",
    description: "Todos os packs da Mr FigPack em um único combo.",
    badge: "Mais vendido",
    details: {
      title: "Todos os packs em uma só coleção.",
      intro: "O pacote mais completo da Mr FigPack, feito para quem quer ter uma resposta pronta para qualquer conversa.",
      highlights: ["Dandadan e animes em geral", "Respostas Impertinentes", "Blue Lock, Gojo e Sukuna", "Humor, memes e reações"],
      note: "Pagamento único. Abra os canais e adicione os packs ao seu WhatsApp."
    }
  },
  {
    id: "respostas-impertinentes",
    name: "Respostas Impertinentes",
    category: "humor",
    count: "+500",
    price: "R$ 14,90",
    image: "packs/respostas.png",
    buy: "https://mpago.la/1gspLAS",
    description: "Respostas atravessadas, ironia e deboche para qualquer conversa.",
    badge: "Favorito",
    details: {
      title: "A resposta certa, no tom errado.",
      intro: "Mais de 500 figurinhas para responder amigos, provocar o grupo e encerrar qualquer assunto com personalidade.",
      highlights: ["Respostas rápidas", "Ironia e deboche", "Memes para grupos", "Reações para o dia a dia"],
      note: "Uma coleção grande para variar as respostas sem repetir sempre as mesmas figurinhas."
    }
  },
  {
    id: "proibido",
    name: "Proibido",
    category: "ousadas",
    count: "+120",
    price: "R$ 14,90",
    image: "packs/proibido.png",
    buy: "https://mpago.la/2uNGY91",
    description: "Figurinhas sem filtro para os grupos mais íntimos.",
    badge: "+18",
    details: {
      title: "Sem filtro e só para os íntimos.",
      intro: "Uma seleção ousada, feita para conversas adultas e grupos em que a zoeira não tem limite.",
      highlights: ["Conteúdo +18", "Humor sem censura", "Reações ousadas", "Mais de 120 figurinhas"],
      note: "Indicado exclusivamente para maiores de 18 anos e para uso responsável."
    }
  },
  {
    id: "musicas",
    name: "Músicas",
    category: "frases",
    count: "+30",
    price: "R$ 14,90",
    image: "packs/musicas.png",
    buy: "https://mpago.la/23YmnGU",
    description: "Trechos e refrões para responder com a música certa.",
    badge: "Musical",
    details: {
      title: "Quando uma letra diz tudo.",
      intro: "Trechos, refrões e frases musicais transformados em figurinhas para combinar com cada momento da conversa.",
      highlights: ["Trechos marcantes", "Frases românticas", "Respostas musicais", "Mais de 30 figurinhas"],
      note: "Uma seleção compacta para quem sempre encontra uma música para responder."
    }
  },
  {
    id: "animezando",
    name: "Animezando",
    category: "cultura pop",
    count: "+100",
    price: "R$ 9,99",
    image: "packs/animezando.png",
    buy: "https://mpago.la/1UUA26J",
    description: "Memes e reações de vários universos de anime.",
    badge: "Otaku",
    details: {
      title: "Memes de anime para qualquer batalha.",
      intro: "Figurinhas aleatórias de vários animes e de cenas que viraram meme, reunidas no estilo otaku zueiro da Mr FigPack.",
      highlights: ["Vários universos de anime", "Cenas que viraram meme", "Reações otaku", "Mais de 100 figurinhas"],
      note: "Pagamento único. Adicione as figurinhas ao seu WhatsApp para guardá-las."
    }
  },
  {
    id: "politicando",
    name: "Politicando",
    category: "humor",
    count: "+25",
    price: "R$ 9,99",
    image: "packs/politicando.png",
    buy: "https://mpago.la/2MhVk6m",
    description: "Memes políticos para notícias, debates e discussões do grupo.",
    badge: "Debate",
    details: {
      title: "A zoeira política atravessa eleições.",
      intro: "Uma coleção de memes políticos para comentar notícias, debates e aquela discussão inevitável do grupo.",
      highlights: ["Memes políticos", "Reações para debates", "Humor para o grupo", "Mais de 25 figurinhas"],
      note: "Canal liberado na página da compra após a confirmação do pagamento."
    }
  },
  {
    id: "cantadas",
    name: "Cantadas",
    category: "frases",
    count: "+40",
    price: "R$ 9,99",
    image: "packs/cantadas.png",
    buy: "https://mpago.la/2hy4ZWz",
    description: "Cantadas engraçadas para flertar, puxar assunto e mandar indireta.",
    badge: "Flerte",
    details: {
      title: "Do flerte fofo à cantada sem vergonha.",
      intro: "Figurinhas com cantadas engraçadas para quebrar o gelo, puxar assunto e mandar aquela indireta.",
      highlights: ["Cantadas engraçadas", "Flerte e indiretas", "Respostas românticas", "Mais de 40 figurinhas"],
      note: "Compre uma vez e mantenha o acesso ao pack para sempre."
    }
  }
];

const state = { filter: "todos", query: "", activePackId: "combo-completo" };
const packPreviews = {
  "respostas-impertinentes": [
    "previews/respostas-01.gif?v=20260719-18",
    "previews/respostas-09.gif?v=20260719-18",
    "previews/respostas-03.gif?v=20260719-18",
    "previews/respostas-04.gif?v=20260719-18",
    "previews/respostas-05.gif?v=20260719-18",
    "previews/respostas-06.gif?v=20260719-18",
    "previews/respostas-07.gif?v=20260719-18",
    "previews/respostas-08.gif?v=20260719-18",
    "previews/respostas-02.gif?v=20260719-18"

  ],
  proibido: [
    "previews/proibido-01.gif?v=20260719-18",
    "previews/proibido-02.gif?v=20260719-18",
    "previews/proibido-03.gif?v=20260719-18",
    "previews/proibido-04.gif?v=20260719-18",
    "previews/proibido-05.gif?v=20260719-18",
    "previews/proibido-06.gif?v=20260719-18",
    "previews/proibido-07.gif?v=20260719-18",
    "previews/proibido-08.gif?v=20260719-18"
  ],
  animezando: [
    "previews/anime-01.gif?v=20260719-19",
    "previews/anime-02.gif?v=20260719-19",
    "previews/anime-03.gif?v=20260719-19",
    "previews/anime-04.gif?v=20260719-19",
    "previews/anime-05.gif?v=20260719-19",
    "previews/anime-06.gif?v=20260719-19"
  ],
  musicas: [
    "previews/musicas-01.gif?v=20260719-20",
    "previews/musicas-02.gif?v=20260719-20",
    "previews/musicas-03.gif?v=20260719-20",
    "previews/musicas-04.gif?v=20260719-20",
    "previews/musicas-05.gif?v=20260719-20"
  ]
};
packPreviews["combo-completo"] = [
  ...packPreviews["respostas-impertinentes"],
  ...packPreviews.proibido,
  ...packPreviews.animezando,
  ...packPreviews.musicas
];
const grid = document.querySelector("#product-grid");
const catalogPreviewTrack = document.querySelector("#catalog-preview-track");
const emptyState = document.querySelector("#empty-state");
const tabs = document.querySelector("#detail-tabs");
const panelHost = document.querySelector("#detail-panel-host");
const search = document.querySelector("#pack-search");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const whatsappFloat = document.querySelector(".whatsapp-float");
const packsSection = document.querySelector("#packs");
let detailPreviewTimer = null;

if (whatsappFloat && packsSection) {
  const updateWhatsappVisibility = () => {
    const packsPosition = packsSection.getBoundingClientRect().top;
    whatsappFloat.classList.toggle("is-visible", packsPosition <= window.innerHeight);
  };

  if ("IntersectionObserver" in window) {
    const packsObserver = new IntersectionObserver(() => updateWhatsappVisibility(), { threshold: 0 });
    packsObserver.observe(packsSection);
  }

  window.addEventListener("scroll", updateWhatsappVisibility, { passive: true });
  window.addEventListener("resize", updateWhatsappVisibility);
  updateWhatsappVisibility();
}

function renderCatalogPreviewCarousel() {
  const carouselEntries = packs.flatMap((pack) => {
    if (["combo-completo", "politicando", "cantadas"].includes(pack.id)) return [];
    const previewImages = pack.id === "combo-completo" ? [] : (packPreviews[pack.id] || []);
    if (!previewImages.length) return [{ pack, previewImage: null, previewIndex: 0 }];
    return previewImages.map((previewImage, previewIndex) => ({ pack, previewImage, previewIndex }));
  });

  const items = carouselEntries.map(({ pack, previewImage, previewIndex }) => {
    const carouselImage = previewImage;
    return `
      <a href="#detalhes" class="catalog-preview-item catalog-preview-${pack.id}" data-carousel-pack="${pack.id}" aria-label="Ver detalhes do pack ${pack.name}">
        ${carouselImage
          ? `<img src="${carouselImage}" alt="Pr&eacute;via ${previewIndex + 1} do pack ${pack.name}" loading="lazy">`
          : `<span aria-hidden="true"><i class="bi bi-image"></i></span>`}
        <div class="catalog-preview-caption">${pack.name}${carouselImage ? ` ${String(previewIndex + 1).padStart(2, "0")}` : ""}</div>
      </a>
    `;
  }).join("");

  catalogPreviewTrack.innerHTML = `
    <div class="catalog-preview-group">${items}</div>
    <div class="catalog-preview-group" aria-hidden="true">${items}</div>
  `;
  catalogPreviewTrack
    .querySelectorAll('.catalog-preview-group[aria-hidden="true"] [data-carousel-pack]')
    .forEach((item) => item.setAttribute("tabindex", "-1"));
}

function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function renderCatalog() {
  const query = normalize(state.query.trim());
  const visible = packs.filter((pack) => {
    const categoryMatch = state.filter === "todos" || pack.category === state.filter;
    const text = normalize(`${pack.name} ${pack.category} ${pack.description}`);
    return categoryMatch && (!query || text.includes(query));
  });

  grid.innerHTML = visible.map((pack, index) => `
    <article class="product-card pack-${pack.id} ${index === 0 && state.filter === "todos" && !query ? "featured" : ""}">
      <div class="product-media">
        <span class="product-badge">${pack.badge}</span>
        <img src="${pack.image}" alt="Capa do pack ${pack.name}" loading="lazy">
      </div>
      <div class="product-content">
        <div class="product-meta"><span>${pack.category}</span><span>${pack.count} figurinhas</span></div>
        <h3>${pack.name}</h3>
        <p>${pack.description}</p>
        <div class="product-bottom">
          <span class="product-price">${pack.price}</span>
          ${purchaseButton(pack)}
        </div>
        <small class="buy-reassurance"><i class="bi bi-shield-check" aria-hidden="true"></i> ${deliveryReady(pack) ? "Pix ou cartão &middot; entrega na página" : "Entrega online em preparação"}</small>

        <button class="details-link" type="button" data-pack-id="${pack.id}">Ver detalhes do pack <span aria-hidden="true"><i class="bi bi-chevron-down"></i></span></button>
      </div>
    </article>
  `).join("");

  emptyState.hidden = visible.length !== 0;
}

function renderTabs() {
  tabs.innerHTML = packs.map((pack) => `
    <button class="detail-tab tab-${pack.id} ${pack.id === state.activePackId ? "active" : ""}" type="button" role="tab"
      id="detail-tab-${pack.id}" aria-controls="detail-panel-${pack.id}"
      aria-selected="${pack.id === state.activePackId}" tabindex="${pack.id === state.activePackId ? "0" : "-1"}"
      data-tab-id="${pack.id}">${pack.name}</button>
  `).join("");
}

function renderPanel() {
  const pack = packs.find((item) => item.id === state.activePackId) || packs[0];
  const previewImages = packPreviews[pack.id] || [];
  const previewCards = Array.from({ length: Math.max(4, previewImages.length) }, (_, index) => {
    const previewImage = previewImages[index];
    return `
      <figure class="preview-card ${previewImage ? "has-image" : ""}" data-preview-index="${index}">
        <span class="preview-placeholder">
          ${previewImage
            ? `<img src="${previewImage}" alt="Exemplo de figurinha do pack ${pack.name}" loading="lazy">`
            : `<i class="bi bi-image" aria-hidden="true"></i>`}
        </span>
        <figcaption>${previewImage ? "Exemplo real" : `Pr&eacute;via ${String(index + 1).padStart(2, "0")}`}</figcaption>
      </figure>
    `;
  }).join("");
  panelHost.innerHTML = `
    <article class="detail-panel detail-${pack.id}" role="tabpanel" id="detail-panel-${pack.id}" aria-labelledby="detail-tab-${pack.id}">
      <div class="detail-cover">
        <span class="product-badge">${pack.badge}</span>
        <img src="${pack.image}" alt="Capa do pack ${pack.name}">
        <span class="cover-count">${pack.count}<small>figurinhas</small></span>
      </div>
      <div class="detail-copy">
        <div class="detail-meta"><span>${pack.category}</span><span>Pagamento &uacute;nico</span></div>
        <h3>${pack.details.title}</h3>
        <p>${pack.details.intro}</p>
        <section class="pack-preview" aria-label="Pr&eacute;vias do pack ${pack.name}">
          <div class="preview-heading">
            <strong>Veja uma pr&eacute;via</strong>
            <small>${previewImages.length ? `${previewImages.length} ${previewImages.length === 1 ? "imagem adicionada" : "imagens adicionadas"}` : "Imagens em breve"}</small>
          </div>
          <div class="detail-preview-carousel">
            <button class="preview-nav preview-prev" type="button" aria-label="Pr&eacute;via anterior"><i class="bi bi-chevron-left" aria-hidden="true"></i></button>
            <div class="preview-track">${previewCards}</div>
            <button class="preview-nav preview-next" type="button" aria-label="Pr&oacute;xima pr&eacute;via"><i class="bi bi-chevron-right" aria-hidden="true"></i></button>
          </div>
        </section>
        <ul>${pack.details.highlights.map((item) => `<li><span aria-hidden="true"><i class="bi bi-check-lg"></i></span>${item}</li>`).join("")}</ul>
        <div class="detail-note"><span aria-hidden="true"><i class="bi bi-info-circle-fill"></i></span><p>${pack.details.note}</p></div>
        <div class="detail-buy-row">
          <div class="price"><small>Pack completo por</small><strong>${pack.price}</strong></div>
          ${purchaseButton(pack, "button primary")}
        </div>
        <small class="delivery-copy">Após a confirmação do pagamento, volte à página da compra para abrir seu canal. Guarde o link ou acesse “Minhas entregas” no mesmo navegador.</small>
      </div>
    </article>
  `;
  setupDetailPreviewCarousel();
}

function setupDetailPreviewCarousel() {
  if (detailPreviewTimer) clearInterval(detailPreviewTimer);

  const carousel = panelHost.querySelector(".detail-preview-carousel");
  const track = carousel?.querySelector(".preview-track");
  const previousButton = carousel?.querySelector(".preview-prev");
  const nextButton = carousel?.querySelector(".preview-next");
  if (!carousel || !track || !previousButton || !nextButton) return;

  const movePreview = (direction) => {
    const card = track.querySelector(".preview-card");
    if (!card) return;
    const step = card.getBoundingClientRect().width + 8;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - step / 2;
    const atStart = track.scrollLeft <= 1;

    if (direction > 0 && atEnd) track.scrollTo({ left: 0, behavior: "smooth" });
    else if (direction < 0 && atStart) track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
    else track.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  const stopAutoPlay = () => {
    if (detailPreviewTimer) clearInterval(detailPreviewTimer);
    detailPreviewTimer = null;
  };
  const startAutoPlay = () => {
    stopAutoPlay();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    detailPreviewTimer = window.setInterval(() => movePreview(1), 2200);
  };

  previousButton.addEventListener("click", () => { movePreview(-1); startAutoPlay(); });
  nextButton.addEventListener("click", () => { movePreview(1); startAutoPlay(); });
  carousel.addEventListener("pointerenter", stopAutoPlay);
  carousel.addEventListener("pointerleave", startAutoPlay);
  carousel.addEventListener("focusin", stopAutoPlay);
  carousel.addEventListener("focusout", startAutoPlay);
  startAutoPlay();
}

function selectPack(id, shouldScroll = false) {
  state.activePackId = id;
  renderTabs();
  renderPanel();
  if (shouldScroll) document.querySelector("#detalhes").scrollIntoView({ behavior: "smooth", block: "start" });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    renderCatalog();
  });
});

search.addEventListener("input", () => {
  state.query = search.value;
  renderCatalog();
});

grid.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-pack-id]");
  if (trigger) selectPack(trigger.dataset.packId, true);
});

catalogPreviewTrack.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-carousel-pack]");
  if (!trigger) return;
  event.preventDefault();
  selectPack(trigger.dataset.carouselPack, true);
});

tabs.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-tab-id]");
  if (tab) selectPack(tab.dataset.tabId);
});

tabs.addEventListener("keydown", (event) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const currentIndex = packs.findIndex((pack) => pack.id === state.activePackId);
  let nextIndex = currentIndex;
  if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % packs.length;
  if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + packs.length) % packs.length;
  if (event.key === 'Home') nextIndex = 0;
  if (event.key === 'End') nextIndex = packs.length - 1;
  selectPack(packs[nextIndex].id);
  document.querySelector(`[data-tab-id="${packs[nextIndex].id}"]`).focus();
});

renderCatalogPreviewCarousel();
renderCatalog();
renderTabs();
renderPanel();

const purchaseNotices = [
  { pack: "Entrega na página", copy: "Pague e abra o canal liberado na página da sua compra.", accent: "#ff334c" },
  { pack: "Pagamento único", copy: "Sem mensalidade. Adicione os packs ao seu WhatsApp.", accent: "#f7f7f7" },
  { pack: "Compra protegida", copy: "O pagamento é processado com segurança pelo Mercado Pago.", accent: "#ff334c" },
  { pack: "Confira sua caixa de entrada", copy: "Após a compra, verifique também as pastas de spam e promoções.", accent: "#f7f7f7" },
  { pack: "Precisa de ajuda?", copy: "Fale pelo WhatsApp para tirar dúvidas ou pedir suporte.", accent: "#ff334c" }
];

const feedbackToast = document.querySelector("#feedback-toast");
const feedbackClose = document.querySelector("#feedback-close");
const feedbackPack = document.querySelector("#feedback-pack");
const feedbackCopy = document.querySelector("#feedback-copy");

if (feedbackToast) {
  let lastFeedbackIndex = -1;
  let hideFeedbackTimer;
  let nextFeedbackTimer;

  const hideFeedback = () => {
    feedbackToast.classList.remove("visible");
    hideFeedbackTimer = window.setTimeout(() => {
      feedbackToast.hidden = true;
    }, 350);
  };

  const scheduleNextFeedback = () => {
    const delay = 9000 + Math.floor(Math.random() * 6001);
    nextFeedbackTimer = window.setTimeout(showFeedback, delay);
  };

  function showFeedback() {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * purchaseNotices.length);
    } while (nextIndex === lastFeedbackIndex && purchaseNotices.length > 1);

    lastFeedbackIndex = nextIndex;
    const notice = purchaseNotices[nextIndex];
    feedbackToast.style.setProperty("--toast-accent", notice.accent);
    feedbackPack.textContent = notice.pack;
    feedbackCopy.textContent = notice.copy;
    feedbackToast.hidden = false;
    window.requestAnimationFrame(() => feedbackToast.classList.add("visible"));

    window.clearTimeout(hideFeedbackTimer);
    hideFeedbackTimer = window.setTimeout(() => {
      hideFeedback();
      scheduleNextFeedback();
    }, 6000);
  }

  feedbackClose.addEventListener("click", () => {
    window.clearTimeout(hideFeedbackTimer);
    window.clearTimeout(nextFeedbackTimer);
    hideFeedback();
  });

  nextFeedbackTimer = window.setTimeout(showFeedback, 1200);
}

loadDeliveryCatalog();

// Contagem de visitas: identificadores aleatórios, sem email, nome ou IP.
(async()=>{
  if(navigator.globalPrivacyControl===true||navigator.doNotTrack==='1')return;
  try{
    const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    let visitorId=localStorage.getItem('figpack-visitor');if(!uuid.test(visitorId||'')){visitorId=crypto.randomUUID();localStorage.setItem('figpack-visitor',visitorId);}
    let session;try{session=JSON.parse(localStorage.getItem('figpack-visit')||'null');}catch{}
    const now=Date.now();if(!session||!uuid.test(session.id||'')||!Number.isFinite(session.at)||now-session.at>=1800000||session.at>now){session={id:crypto.randomUUID(),at:now};localStorage.setItem('figpack-visit',JSON.stringify(session));}
    await fetch(DELIVERY_ORIGIN+'/api/visit',{method:'POST',headers:{'Content-Type':'text/plain'},credentials:'omit',keepalive:true,body:JSON.stringify({visitorId,visitId:session.id}),signal:AbortSignal.timeout(5000)});
  }catch{ /* A contagem nunca impede a compra. */ }
})();
