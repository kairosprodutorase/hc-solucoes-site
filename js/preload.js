/* HC Soluções — pré-carregador da tela de entrada.
   Mapa pontilhado de Aracaju e Barra dos Coqueiros (malhas do IBGE, ver
   tools/mapa/). Enquanto o site carrega, o atendimento "se espalha" a partir da
   sede, na Barra, atravessa a ponte e chega a Aracaju; a temperatura cai de
   32° para 22°. Ao terminar, a tela sai sozinha e o site aparece (sem botão).
   Um clique, toque, tecla ou rolagem pula a espera.
   Sem JavaScript ou com movimento reduzido a tela nem aparece. */
(() => {
  'use strict';

  const intro = document.querySelector('[data-intro]');
  const pre = intro && intro.querySelector('[data-preload]');
  const MAP = window.HC_MAP;
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!intro || !pre || !MAP || reduceMotion) { if (intro) intro.remove(); return; }
  intro.hidden = false;
  root.classList.add('intro-open');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const css = getComputedStyle(document.documentElement);
  const ICE = css.getPropertyValue('--accent').trim() || '#7cc8ff';
  const BLUE = css.getPropertyValue('--blue').trim() || '#1f5fff';

  const canvas = pre.querySelector('[data-preload-map]');
  const ctx = canvas.getContext('2d');
  const tempEl = pre.querySelector('[data-preload-temp]');
  // cada item das listas acende numa fração do carregamento
  const items = [...pre.querySelectorAll('ul')].flatMap((ul) => {
    const lis = [...ul.children];
    return lis.map((li, i) => ({ li, at: (i + 1) / (lis.length + 1) }));
  });

  intro.classList.add('is-loading');

  /* ---------- Células do mapa ---------- */
  const cells = [];
  let sede = null, ponte = null;
  MAP.grid.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      const k = row[c];
      if (k === '.' || k === 'r') continue;
      const cell = { r, c, k, tw: Math.random() * Math.PI * 2 };
      if (k === 's') sede = cell;
      if (k === 'p') ponte = cell;
      cells.push(cell);
    }
  });
  // distância até a sede define a ordem em que cada ponto acende
  let maxD = 1;
  cells.forEach((q) => {
    q.d = sede ? Math.hypot(q.r - sede.r, q.c - sede.c) : 0;
    if (q.k !== 'o') maxD = Math.max(maxD, q.d);
  });
  const centroid = (k) => {
    const list = cells.filter((q) => q.k === k);
    const n = Math.max(1, list.length);
    return { r: list.reduce((s, q) => s + q.r, 0) / n, c: list.reduce((s, q) => s + q.c, 0) / n };
  };
  const cAju = centroid('a'), cBarra = centroid('b');

  /* ---------- Desenho ---------- */
  let W = 0, H = 0, step = 6, ox = 0, oy = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    step = Math.min(W / MAP.cols, H / MAP.rows);
    ox = (W - step * MAP.cols) / 2; oy = (H - step * MAP.rows) / 2;
  };
  const px = (q) => [ox + (q.c + 0.5) * step, oy + (q.r + 0.5) * step];

  const label = (text, q, dx, dy, align, alpha) => {
    if (alpha <= 0) return;
    const [x, y] = px(q);
    ctx.globalAlpha = alpha;
    ctx.font = `500 ${Math.max(9, step * 1.45)}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textAlign = align; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#eef4fb';
    ctx.fillText(text, x + dx * step, y + dy * step);
  };

  const draw = (p, t) => {
    ctx.clearRect(0, 0, W, H);
    const front = ease(p) * 1.12;                 // frente de "atendimento" que parte da sede
    const r0 = step * 0.2;
    for (const q of cells) {
      const [x, y] = px(q);
      if (q.k === 'o') {
        ctx.globalAlpha = 0.13;
        ctx.fillStyle = '#8b99ad';
        ctx.fillRect(x - r0, y - r0, r0 * 2, r0 * 2);
        continue;
      }
      const lit = clamp((front - q.d / maxD) / 0.12);
      const twinkle = Math.sin(t * 0.002 + q.tw) * 0.12;
      const size = q.k === 'p' ? r0 * 1.6 : r0 * (1 + lit * 0.25);
      ctx.globalAlpha = 0.22 + lit * (0.6 + twinkle);
      ctx.fillStyle = lit > 0.5 ? ICE : '#eef4fb';
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }
    // sede: ponto azul com anel que pulsa
    if (sede) {
      const [x, y] = px(sede);
      const pulse = (t * 0.0007) % 1;
      ctx.globalAlpha = 1 - pulse;
      ctx.strokeStyle = ICE; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, step * (0.8 + pulse * 3.2), 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1; ctx.fillStyle = BLUE;
      ctx.beginPath(); ctx.arc(x, y, step * 0.62, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#eef4fb';
      ctx.beginPath(); ctx.arc(x, y, step * 0.22, 0, Math.PI * 2); ctx.fill();
    }
    const at = (q) => (q ? clamp((front - q.d / maxD) / 0.12) : 0);
    label('SEDE · ATALAIA NOVA', sede, 2.2, 0.6, 'left', clamp(p * 6));
    if (ponte) label('PONTE', ponte, 2.4, -1.4, 'left', at(ponte) * 0.85);
    label('BARRA DOS COQUEIROS', { r: cBarra.r - 9, c: cBarra.c + 2 }, 0, 0, 'left', at({ d: maxD * 0.45 }) * 0.85);
    label('ARACAJU', { r: cAju.r + 4, c: cAju.c - 3 }, 0, 0, 'right', at({ d: maxD * 0.8 }) * 0.85);
    ctx.globalAlpha = 1;
  };

  /* ---------- Progresso real do carregamento ---------- */
  // Fontes e o evento "load" (imagens, Three.js e demais scripts). O número mostrado
  // nunca corre à frente do real, mas leva no mínimo ~1,8 s para o mapa ser visto.
  const MIN = 1800, MAX = 4500;
  const t0 = performance.now();
  let real = 0.1;
  const tasks = [
    document.fonts ? document.fonts.ready : Promise.resolve(),
    document.readyState === 'complete' ? Promise.resolve() : new Promise((res) => window.addEventListener('load', res, { once: true }))
  ];
  tasks.forEach((pr) => pr.then(() => { real += 0.9 / tasks.length; }));

  let shown = 0, done = false, ending = false, lastT = -1;
  // saída: a tela sobe e desfoca, e o site começa
  const finish = () => {
    if (done) return;
    done = true;
    intro.classList.remove('is-loading');
    intro.classList.add('is-leaving');
    root.classList.remove('intro-open');
    window.dispatchEvent(new Event('hc:entered'));
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((ev) => window.removeEventListener(ev, skip));
    setTimeout(() => intro.remove(), 1000);
  };
  // quem não quiser esperar pula com um clique, toque, tecla ou rolagem
  const start = Date.now();
  const skip = () => { if (Date.now() - start > 300) finish(); };
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((ev) => window.addEventListener(ev, skip, { passive: true }));

  const frame = (now) => {
    if (!intro.isConnected) return;                 // o visitante já entrou
    const elapsed = now - t0;
    const goal = elapsed > MAX ? 1 : Math.min(real >= 0.999 ? 1 : real, MIN ? elapsed / MIN : 1);
    shown += (goal - shown) * 0.08;
    if (goal === 1 && shown > 0.995) shown = 1;
    const tmp = Math.round(32 - shown * 10);
    if (tmp !== lastT) {
      lastT = tmp;
      tempEl.textContent = tmp;
      pre.style.setProperty('--hot', clamp((tmp - 22) / 10).toFixed(2));
    }
    items.forEach(({ li, at }) => li.classList.toggle('is-lit', shown >= at));
    draw(shown, now);
    if (shown === 1 && !ending) { ending = true; setTimeout(finish, 650); }   // um instante a 22° antes de sair
    requestAnimationFrame(frame);
  };

  resize();
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  requestAnimationFrame(frame);
})();
