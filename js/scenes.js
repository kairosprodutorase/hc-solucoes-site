/* HC Soluções — cenas do roteiro "Um dia em Aracaju".
   13h: o núcleo do floco abre a cena e a linha do trajeto sai da sede, cruza a
   ponte e chega a Aracaju. 15h: a linha de ar desce pelos serviços. Entre as
   cenas, aletas fecham na cor da cena seguinte. 18h30: o voo de drone sobre a
   ponte, controlado pela rolagem, e no fim as luzes viram os pontos do mapa.
   Rodapé: o mapa do começo. Também o botão "Pausar animações".
   Todo o texto está no HTML; isto é só camada visual. */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => t * t * (3 - 2 * t);
  const MAP = window.HC_MAP;
  const vh = () => window.innerHeight;

  /* ---------- Pausar animações (WCAG 2.2.2) ---------- */
  const pauseBtn = document.querySelector('[data-pause]');
  if (pauseBtn) {
    const label = pauseBtn.querySelector('[data-pause-label]');
    const sync = () => {
      const on = root.classList.contains('motion-paused');
      pauseBtn.setAttribute('aria-pressed', String(on));
      label.textContent = on ? 'Retomar animações' : 'Pausar animações';
    };
    pauseBtn.addEventListener('click', () => {
      root.classList.toggle('motion-paused');
      try { localStorage.setItem('hc-motion', root.classList.contains('motion-paused') ? 'paused' : 'on'); } catch (e) {}
      sync();
    });
    sync();
  }
  const paused = () => root.classList.contains('motion-paused');

  /* ---------- Grade de pontos do mapa (mesma do pré-carregador) ---------- */
  const cells = [];
  let sede = null, ponte = null, aju = null;
  if (MAP) {
    let sr = 0, sc = 0, n = 0;
    MAP.grid.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) {
        const k = row[c];
        if (k === '.' || k === 'r') continue;
        const q = { r, c, k };
        if (k === 's') sede = q;
        if (k === 'p') ponte = q;
        if (k === 'a') { sr += r; sc += c; n++; }
        cells.push(q);
      }
    });
    aju = n ? { r: sr / n, c: sc / n } : null;
  }
  const fitCanvas = (canvas) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.clientWidth, H = canvas.clientHeight;
    canvas.width = Math.max(1, W * dpr); canvas.height = Math.max(1, H * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const step = Math.min(W / MAP.cols, H / MAP.rows);
    return { ctx, W, H, step, ox: (W - step * MAP.cols) / 2, oy: (H - step * MAP.rows) / 2 };
  };
  const drawDots = (g, { context = 0.12, served = 0.45, color = '#eef4fb', ice = '#7cc8ff' } = {}) => {
    const r0 = g.step * 0.2;
    for (const q of cells) {
      const x = g.ox + (q.c + 0.5) * g.step, y = g.oy + (q.r + 0.5) * g.step;
      if (q.k === 'o') { g.ctx.globalAlpha = context; g.ctx.fillStyle = '#8b99ad'; }
      else { g.ctx.globalAlpha = served; g.ctx.fillStyle = q.k === 'p' ? ice : color; }
      const s = q.k === 'p' ? r0 * 1.6 : r0;
      g.ctx.fillRect(x - s, y - s, s * 2, s * 2);
    }
    g.ctx.globalAlpha = 1;
  };
  const at = (g, q) => [g.ox + (q.c + 0.5) * g.step, g.oy + (q.r + 0.5) * g.step];
  const marker = (g, q, t, fill = '#1f5fff') => {
    const [x, y] = at(g, q);
    const pulse = reduceMotion || paused() ? 0.5 : (t * 0.0007) % 1;
    g.ctx.globalAlpha = 1 - pulse; g.ctx.strokeStyle = '#7cc8ff'; g.ctx.lineWidth = 1;
    g.ctx.beginPath(); g.ctx.arc(x, y, g.step * (0.8 + pulse * 3), 0, Math.PI * 2); g.ctx.stroke();
    g.ctx.globalAlpha = 1; g.ctx.fillStyle = fill;
    g.ctx.beginPath(); g.ctx.arc(x, y, g.step * 0.62, 0, Math.PI * 2); g.ctx.fill();
    g.ctx.fillStyle = '#eef4fb';
    g.ctx.beginPath(); g.ctx.arc(x, y, g.step * 0.22, 0, Math.PI * 2); g.ctx.fill();
  };

  /* ---------- 13h · núcleo do floco abre a cena ---------- */
  const iris = document.querySelector('[data-iris]');
  const route = document.querySelector('[data-route]');

  /* ---------- 13h · a linha do trajeto ---------- */
  const routeCanvas = document.querySelector('[data-route-map]');
  let routeG = null, routeP = reduceMotion ? 1 : 0, routeVisible = false;
  const routePath = () => {
    if (!sede || !ponte || !aju) return [];
    // sede → sobe pela Barra até a ponte → atravessa → centro de Aracaju
    return [
      [sede.r, sede.c], [ponte.r + 2, ponte.c + 2], [ponte.r, ponte.c + 1],
      [ponte.r, ponte.c - 2], [aju.r - 2, aju.c + 1], [aju.r, aju.c]
    ];
  };
  const drawRoute = (t) => {
    if (!routeG) return;
    const g = routeG;
    g.ctx.clearRect(0, 0, g.W, g.H);
    drawDots(g, { served: 0.32 });
    const pts = routePath().map(([r, c]) => [g.ox + (c + 0.5) * g.step, g.oy + (r + 0.5) * g.step]);
    if (pts.length) {
      const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
      const total = lens.reduce((a, b) => a + b, 0);
      let left = total * ease(routeP);
      g.ctx.strokeStyle = '#7cc8ff'; g.ctx.lineWidth = Math.max(2, g.step * 0.45); g.ctx.lineCap = 'round'; g.ctx.lineJoin = 'round';
      g.ctx.shadowColor = 'rgba(124, 200, 255, .6)'; g.ctx.shadowBlur = 12;
      g.ctx.beginPath(); g.ctx.moveTo(pts[0][0], pts[0][1]);
      let head = pts[0];
      for (let i = 0; i < lens.length && left > 0; i++) {
        const f = Math.min(1, left / lens[i]);
        head = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
        g.ctx.lineTo(head[0], head[1]);
        left -= lens[i];
      }
      g.ctx.stroke(); g.ctx.shadowBlur = 0;
      if (routeP > 0.02 && routeP < 0.999) { g.ctx.fillStyle = '#eef4fb'; g.ctx.beginPath(); g.ctx.arc(head[0], head[1], g.step * 0.55, 0, Math.PI * 2); g.ctx.fill(); }
      // destino: Aracaju acende quando a linha chega
      if (routeP > 0.98 && aju) marker(g, { r: aju.r, c: aju.c }, t + 500, '#7cc8ff');
    }
    if (sede) marker(g, sede, t);
    // rótulos
    g.ctx.font = `500 ${Math.max(10, g.step * 1.4)}px "JetBrains Mono", ui-monospace, monospace`;
    g.ctx.fillStyle = '#eef4fb'; g.ctx.globalAlpha = 0.85; g.ctx.textBaseline = 'middle';
    if (sede) { const [x, y] = at(g, sede); g.ctx.textAlign = 'left'; g.ctx.fillText('SEDE', x + g.step * 2, y + g.step * 0.6); }
    if (ponte) { const [x, y] = at(g, ponte); g.ctx.textAlign = 'left'; g.ctx.globalAlpha = 0.85 * clamp(routeP * 3 - 0.6); g.ctx.fillText('PONTE', x + g.step * 2.4, y - g.step * 1.4); }
    if (aju) { const [x, y] = at(g, aju); g.ctx.textAlign = 'right'; g.ctx.globalAlpha = 0.85 * clamp(routeP * 2 - 1); g.ctx.fillText('ARACAJU', x - g.step * 3, y + g.step * 3); }
    g.ctx.globalAlpha = 1;
  };
  if (routeCanvas && MAP) {
    const size = () => { routeG = fitCanvas(routeCanvas); drawRoute(performance.now()); };
    size();
    window.addEventListener('resize', size);
    if (document.fonts) document.fonts.ready.then(size);
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { routeVisible = e.isIntersecting; }).observe(routeCanvas);
  }

  /* ---------- 15h · linha de ar ---------- */
  const airWrap = document.querySelector('[data-airline]');
  const airCards = airWrap ? [...airWrap.querySelectorAll('.svc')] : [];

  /* ---------- aletas ---------- */
  const slats = [...document.querySelectorAll('[data-slats]')].map((el) => ({ el, bars: [...el.children] }));

  /* ---------- 18h30 · a ponte ---------- */
  const bridge = document.querySelector('[data-bridge]');
  const B = bridge && {
    canvas: bridge.querySelector('[data-bridge-canvas]'),
    dots: bridge.querySelector('[data-bridge-dots]'),
    play: bridge.querySelector('[data-bridge-play]'),
    blobs: [], bitmaps: new Map(), pending: new Set(), count: 0, dir: '', current: -1, want: 0, started: false, ready: false, dotsG: null
  };
  const startBridge = () => {
    if (!B || B.started || reduceMotion) return;
    B.started = true;
    const small = window.matchMedia('(max-width: 720px)').matches || root.classList.contains('lite');
    B.dir = small ? 'm' : 'd';
    B.count = small ? 60 : 90;
    B.blobs = new Array(B.count);
    // baixa os quadros comprimidos (~1–2,5 MB no total) em ordem; decodifica só perto do quadro atual
    let i = 0;
    const next = () => {
      if (i >= B.count) return;
      const k = i++;
      fetch(`./assets/ponte/${B.dir}/${String(k + 1).padStart(3, '0')}.webp`)
        .then((r) => (r.ok ? r.blob() : null))
        .then((b) => { B.blobs[k] = b; if (k === 0) showFrame(0); next(); })
        .catch(next);
    };
    next(); next(); next();
  };
  const decode = (k) => {
    if (B.bitmaps.has(k) || B.pending.has(k) || !B.blobs[k] || !window.createImageBitmap) return;
    B.pending.add(k);
    createImageBitmap(B.blobs[k]).then((bmp) => {
      B.pending.delete(k);
      if (Math.abs(k - B.want) > 8) { bmp.close && bmp.close(); return; }
      B.bitmaps.set(k, bmp);
      if (k === B.want) paintFrame(k);
    }).catch(() => B.pending.delete(k));
  };
  const paintFrame = (k) => {
    const bmp = B.bitmaps.get(k);
    if (!bmp) return;
    const c = B.canvas, W = c.clientWidth, H = c.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    const ctx = c.getContext('2d');
    // cobre o quadro (como object-fit: cover)
    const s = Math.max(c.width / bmp.width, c.height / bmp.height);
    const w = bmp.width * s, h = bmp.height * s;
    ctx.drawImage(bmp, (c.width - w) / 2, (c.height - h) / 2, w, h);
    B.current = k;
    if (!B.ready) { B.ready = true; bridge.classList.add('is-live'); }
  };
  const showFrame = (k) => {
    if (!B || !B.count) return;
    B.want = k;
    for (let d = -3; d <= 5; d++) { const j = k + d; if (j >= 0 && j < B.count) decode(j); }
    // libera o que ficou longe (cada quadro decodificado ocupa ~2–4 MB)
    for (const [j, bmp] of B.bitmaps) if (Math.abs(j - k) > 8) { bmp.close && bmp.close(); B.bitmaps.delete(j); }
    if (B.bitmaps.has(k)) paintFrame(k);
    else {
      // enquanto o quadro exato decodifica, mostra o mais próximo
      let best = -1, dist = 1e9;
      for (const j of B.bitmaps.keys()) if (Math.abs(j - k) < dist) { dist = Math.abs(j - k); best = j; }
      if (best >= 0 && best !== B.current) paintFrame(best);
    }
  };
  if (B) {
    const saveData = root.classList.contains('save-data');
    if (saveData && !reduceMotion) {
      // economia de dados: um quadro só e o voo sob pedido
      B.play.hidden = false;
      B.play.addEventListener('click', () => { B.play.hidden = true; startBridge(); });
    } else if ('IntersectionObserver' in window) {
      // começa a baixar quando o visitante chega ao PMOC (bem antes da ponte)
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); startBridge(); } }, { rootMargin: '0px 0px 250% 0px' });
      io.observe(document.querySelector('#pmoc') || bridge);
    } else startBridge();
  }

  /* ---------- rodapé: o mapa do começo ---------- */
  const footCanvas = document.querySelector('[data-foot-map]');
  let footG = null;
  const drawFoot = (t) => {
    if (!footG) return;
    footG.ctx.clearRect(0, 0, footG.W, footG.H);
    drawDots(footG, { context: 0.16, served: 0.7 });
    if (sede) marker(footG, sede, t);
  };
  if (footCanvas && MAP) {
    const size = () => { footG = fitCanvas(footCanvas); drawFoot(0); };
    size();
    window.addEventListener('resize', size);
  }

  /* ---------- laço único de rolagem ---------- */
  let last = -1, footVisible = false;
  if (footCanvas && 'IntersectionObserver' in window) new IntersectionObserver(([e]) => { footVisible = e.isIntersecting; }).observe(footCanvas);

  const frame = (t) => {
    const y = window.scrollY, H = vh();
    const moved = y !== last;
    last = y;

    if (moved && iris && route && !reduceMotion) {
      // 0 quando a cena começa a entrar, 1 quando ela ocupa a tela: o hexágono cresce até sumir
      // enquanto a cena entra, o hexágono fica pequeno; quando ela chega ao topo, ele cresce até sumir
      const p = clamp((H * 0.2 - route.getBoundingClientRect().top) / (H * 0.9));
      iris.style.setProperty('--is', (1 + Math.pow(p, 1.8) * 30).toFixed(3));
      iris.classList.toggle('is-done', p >= 0.999);
    }
    if (routeG && (routeVisible || moved)) {
      if (!reduceMotion) {
        const r = routeCanvas.getBoundingClientRect();
        routeP = clamp((H * 0.85 - r.top) / (r.height + H * 0.1));
      }
      if (routeVisible) drawRoute(t);
    }
    if (moved && airWrap) {
      const r = airWrap.getBoundingClientRect();
      const ap = clamp((H * 0.6 - r.top) / r.height);
      airWrap.style.setProperty('--ap', ap.toFixed(4));
      const tip = r.top + r.height * ap;
      airCards.forEach((card) => card.classList.toggle('is-lit', card.getBoundingClientRect().top < tip));
    }
    if (moved) slats.forEach(({ el, bars }) => {
      const r = el.getBoundingClientRect();
      const p = clamp((H - r.top) / (r.height + H * 0.35));
      bars.forEach((b, i) => b.style.setProperty('--s', ease(clamp(p * 1.6 - i * 0.075)).toFixed(4)));
    });
    if (B && moved) {
      const r = bridge.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - H));
      if (B.count) showFrame(Math.min(B.count - 1, Math.round(clamp(p / 0.86) * (B.count - 1))));
      // no fim, as luzes da cidade se apagam e ficam como pontos: viram o mapa
      const dp = clamp((p - 0.86) / 0.12);
      bridge.style.setProperty('--dp', dp.toFixed(3));
      if (dp > 0 && B.dots) {
        if (!B.dotsG) B.dotsG = fitCanvas(B.dots);
        B.dotsG.ctx.clearRect(0, 0, B.dotsG.W, B.dotsG.H);
        drawDots(B.dotsG, { context: 0.1 * dp, served: 0.55 * dp });
        if (sede) marker(B.dotsG, sede, t);
      }
    }
    if (footVisible) drawFoot(t);
    requestAnimationFrame(frame);
  };
  window.addEventListener('resize', () => { if (B) { B.dotsG = null; B.current = -1; showFrame(B.want); } last = -1; });
  requestAnimationFrame(frame);
})();
