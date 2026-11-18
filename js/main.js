/* HC Soluções — interações da proposta "Do complexo ao claro".
   O conteúdo funciona sem JavaScript; aqui só há camadas de experiência. */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (t) => t * t * (3 - 2 * t);

  /* ---------- Hero: partículas do caos à ordem ---------- */
  const hero = document.querySelector('[data-hero]');
  const canvas = hero && hero.querySelector('.hero__canvas');
  const stateLabel = hero && hero.querySelector('[data-hero-state]');
  let heroProgress = reduceMotion ? 1 : 0;

  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    const css = getComputedStyle(document.documentElement);
    const INK = css.getPropertyValue('--ink').trim() || '#f2efe8';
    const ACCENT = css.getPropertyValue('--accent').trim() || '#d2ff3c';
    let W = 0, H = 0, dpr = 1, particles = [], visible = true, raf = 0;
    const pointer = { x: -9999, y: -9999, active: false };

    // O símbolo HC é desenhado fora da tela e amostrado: cada pixel vira um alvo.
    // Pixels do mostrador (lima) viram partículas na cor-sinal.
    const symbolImg = new Image();
    const symbolReady = new Promise((res) => {
      symbolImg.onload = res; symbolImg.onerror = res;
      symbolImg.src = './assets/logo/hc-simbolo-negativo.svg';
    });

    const buildTargets = () => {
      const off = document.createElement('canvas');
      off.width = W; off.height = H;
      const o = off.getContext('2d', { willReadFrequently: true });
      const mobile = W < 720;
      const h = Math.min(H * (mobile ? 0.34 : 0.56), (W * (mobile ? 0.7 : 0.52)) * 120 / 152);
      const w = h * 152 / 120;
      const cx = W / 2, cy = H * 0.53;
      if (symbolImg.naturalWidth || symbolImg.width) {
        o.drawImage(symbolImg, cx - w / 2, cy - h / 2, w, h);
      } else {
        o.font = `800 ${h}px "Inter Tight", system-ui, sans-serif`;
        o.textAlign = 'center'; o.textBaseline = 'middle'; o.fillStyle = '#fff';
        o.fillText('HC', cx, cy);
      }
      const data = o.getImageData(0, 0, W, H).data;
      const max = mobile ? 1200 : 2800;
      let area = 0;
      for (let i = 3; i < data.length; i += 16) if (data[i] > 128) area += 4;
      const step = Math.max(3, Math.round(Math.sqrt(area / max)));
      const pts = [];
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          const k = (y * W + x) * 4;
          if (data[k + 3] > 128) pts.push([x, y, data[k + 2] < 150]);
        }
      }
      return pts;
    };

    const init = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth;
      H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const targets = buildTargets();
      particles = targets.map(([tx, ty, gauge]) => ({
        tx, ty,
        x: Math.random() * W, y: Math.random() * H,
        ox: 0, oy: 0, vx: 0, vy: 0,
        delay: Math.random() * 0.35,
        speed: 0.4 + Math.random() * 1.1,
        size: Math.random() < 0.12 ? 2.2 : 1.4,
        gauge,
        accent: gauge || Math.random() < 0.05
      }));
      if (reduceMotion) draw(0);
    };

    const flow = (x, y, t) =>
      (Math.sin(x * 0.0031 + t * 0.00021) + Math.cos(y * 0.0043 - t * 0.00017) + Math.sin((x + y) * 0.0012)) * Math.PI;

    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      const p = heroProgress;
      for (const q of particles) {
        if (!reduceMotion) {
          const a = flow(q.x, q.y, t);
          q.x += Math.cos(a) * q.speed;
          q.y += Math.sin(a) * q.speed;
          if (q.x < -10) q.x = W + 10; else if (q.x > W + 10) q.x = -10;
          if (q.y < -10) q.y = H + 10; else if (q.y > H + 10) q.y = -10;

          if (pointer.active) {
            const dx = (q.px ?? q.x) - pointer.x, dy = (q.py ?? q.y) - pointer.y;
            const d2 = dx * dx + dy * dy, R = 120;
            if (d2 < R * R && d2 > 0.01) {
              const d = Math.sqrt(d2), f = (1 - d / R) * 2.4;
              q.vx += (dx / d) * f; q.vy += (dy / d) * f;
            }
          }
          q.vx += -q.ox * 0.06; q.vy += -q.oy * 0.06;
          q.vx *= 0.82; q.vy *= 0.82;
          q.ox += q.vx; q.oy += q.vy;
        }
        const e = reduceMotion ? 1 : smooth(clamp((p * 1.35 - q.delay) / 0.8));
        const px = q.x + (q.tx - q.x) * e + q.ox;
        const py = q.y + (q.ty - q.y) * e + q.oy;
        q.px = px; q.py = py;
        ctx.globalAlpha = reduceMotion ? 0.3 : 0.35 + e * 0.6;
        ctx.fillStyle = (q.gauge ? e > 0.5 : q.accent) ? ACCENT : INK;
        ctx.fillRect(px, py, q.size, q.size);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t) => {
      raf = 0;
      if (!visible) return;
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    const start = () => { if (!raf && !reduceMotion) raf = requestAnimationFrame(loop); };

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    }).observe(hero);

    if (finePointer && !reduceMotion) {
      hero.addEventListener('pointermove', (ev) => {
        const r = canvas.getBoundingClientRect();
        pointer.x = ev.clientX - r.left; pointer.y = ev.clientY - r.top; pointer.active = true;
      });
      hero.addEventListener('pointerleave', () => { pointer.active = false; });
    }

    let resizeTimer;
    let lastW = window.innerWidth;
    window.addEventListener('resize', () => {
      // Ignora oscilações de altura da barra do navegador em celulares
      if (window.innerWidth === lastW && Math.abs(window.innerHeight - H) < 120) return;
      lastW = window.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(init, 180);
    });

    Promise.all([document.fonts ? document.fonts.ready : null, symbolReady]).then(() => { init(); start(); });
  }

  /* ---------- Manifesto: palavras acendem com o scroll ---------- */
  const words = [];
  const manifesto = document.querySelector('[data-words]');
  const KEYS = /^(clareza|ouvir|simplificar|funcione)$/i;
  if (manifesto && !reduceMotion) {
    const text = manifesto.textContent.trim().replace(/\s+/g, ' ');
    manifesto.setAttribute('aria-label', text);
    manifesto.textContent = '';
    text.split(' ').forEach((w, i, all) => {
      const span = document.createElement('span');
      span.className = 'w' + (KEYS.test(w.replace(/[.,:;]/g, '')) ? ' is-key' : '');
      span.setAttribute('aria-hidden', 'true');
      span.textContent = w;
      manifesto.appendChild(span);
      if (i < all.length - 1) manifesto.appendChild(document.createTextNode(' '));
      words.push(span);
    });
  }

  /* ---------- Revelação ao entrar na tela ---------- */
  const revealables = document.querySelectorAll('.section__head, .step, .card, .outro > *, .climate__head');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    revealables.forEach((el, i) => {
      el.setAttribute('data-reveal', '');
      if (el.matches('.step, .card')) el.style.transitionDelay = `${(i % 4) * 90}ms`;
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    revealables.forEach((el) => io.observe(el));
  } else {
    revealables.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Climatização ---------- */
  const climate = document.querySelector('[data-climate]');
  const tempEls = climate ? climate.querySelectorAll('[data-temp], [data-temp-display]') : [];
  const climateState = climate && climate.querySelector('[data-climate-state]');
  let lastTemp = null;

  /* ---------- Scroll: progresso global, hero, clima e manifesto ---------- */
  const bar = document.querySelector('.progress');
  const root = document.documentElement;
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const max = root.scrollHeight - window.innerHeight;
    if (bar) bar.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : 0);

    if (hero && !reduceMotion) {
      const r = hero.getBoundingClientRect();
      heroProgress = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
      hero.style.setProperty('--hp', heroProgress.toFixed(4));
      if (stateLabel) {
        stateLabel.textContent = heroProgress < 0.3 ? 'complexo' : heroProgress < 0.85 ? 'em organização' : 'claro';
      }
    }

    if (climate && !reduceMotion) {
      const r = climate.getBoundingClientRect();
      const cp = clamp((-r.top / Math.max(1, r.height - window.innerHeight)) * 1.15);
      climate.style.setProperty('--cp', cp.toFixed(4));
      const t = Math.round(32 - cp * 10);
      if (t !== lastTemp) {
        lastTemp = t;
        tempEls.forEach((el) => { el.textContent = el.hasAttribute('data-temp-display') ? `${t}°` : t; });
        if (climateState) climateState.textContent = t >= 29 ? 'Calor' : t >= 25 ? 'Resfriando' : 'Conforto';
      }
    }

    if (words.length) {
      const r = manifesto.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35));
      const lit = prog * words.length;
      words.forEach((w, i) => w.style.setProperty('--o', (0.14 + clamp(lit - i) * 0.86).toFixed(3)));
    }
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Cartões: inclinação e luz seguindo o cursor ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (ev) => {
        const r = card.getBoundingClientRect();
        const x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
        card.style.setProperty('--ry', `${(x - 0.5) * 8}deg`);
        card.style.setProperty('--rx', `${(0.5 - y) * 8}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- Relógio local e ano ---------- */
  const clock = document.querySelector('[data-clock]');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const tick = () => {
      const now = new Date();
      clock.textContent = fmt.format(now);
      clock.dateTime = now.toISOString();
    };
    tick();
    setInterval(tick, 1000);
  }
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
