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
    const INK = css.getPropertyValue('--ink').trim() || '#eef4fb';
    const ACCENT = css.getPropertyValue('--accent').trim() || '#7cc8ff';
    let W = 0, H = 0, dpr = 1, particles = [], visible = true, raf = 0;
    const pointer = { x: -9999, y: -9999, active: false };

    // O símbolo HC é desenhado fora da tela e amostrado: cada pixel vira um alvo.
    // Pixels do floco (azul-gelo) viram partículas na cor de destaque.
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
      const h = Math.min(H * (mobile ? 0.26 : 0.46), (W * (mobile ? 0.66 : 0.48)) * 120 / 172);
      const w = h * 172 / 120;
      const cx = W / 2, cy = H * (mobile ? 0.29 : 0.4); // acima do texto, com respiro
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
      const isFlake = (k) => data[k + 3] > 128 && data[k] < 190; // azul-gelo
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          const k = (y * W + x) * 4;
          if (data[k + 3] > 128 && !isFlake(k)) pts.push([x, y, false]);
        }
      }
      // o floco tem traços finos: amostragem mais densa para ele brilhar
      const fine = Math.max(2, Math.round(step * 0.55));
      for (let y = 0; y < H; y += fine) {
        for (let x = 0; x < W; x += fine) {
          if (isFlake((y * W + x) * 4)) pts.push([x, y, true]);
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
        size: gauge ? 2.2 : (Math.random() < 0.12 ? 2.2 : 1.4),
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
        ctx.globalAlpha = reduceMotion ? 0.3 : (q.gauge ? 0.35 + e * 0.65 : 0.3 + e * 0.55);
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
  const KEYS = /^(ponte|fabricante|explicado|registrada)$/i;
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
  const revealables = document.querySelectorAll('.section__head, .step, .card, .outro > *, .climate__head, .svc, .biz, .proof__list li, .rt, .types li, .guide, .faq');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    revealables.forEach((el, i) => {
      el.setAttribute('data-reveal', '');
      if (el.matches('.step, .card, .svc, .proof__list li, .types li')) el.style.transitionDelay = `${(i % 4) * 90}ms`;
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

  // Flocos de neve que caem quando o ambiente chega ao conforto
  const snow = document.querySelector('[data-snow]');
  if (snow && !reduceMotion) {
    const n = window.innerWidth < 720 ? 14 : 26;
    for (let i = 0; i < n; i++) {
      const el = document.createElement('span');
      const r = Math.random();
      el.style.cssText = `--x:${(Math.random() * 100).toFixed(1)}%;--s:${(8 + r * 16).toFixed(0)}px;` +
        `--d:${(7 + (1 - r) * 9).toFixed(1)}s;--delay:${(-Math.random() * 14).toFixed(1)}s;--drift:${(Math.random() * 120 - 60).toFixed(0)}px;` +
        `opacity:${(0.3 + r * 0.6).toFixed(2)}`;
      el.innerHTML = '<svg><use href="#snowflake"/></svg>';
      snow.appendChild(el);
    }
  }

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
      // o "HC" de partículas já é a marca: o logo do menu sai de cena enquanto ele aparece
      document.body.classList.toggle('brand-hidden', heroProgress > 0.3 && r.bottom > window.innerHeight * 0.55);
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

  /* ---------- PMOC: floco do "O" parado com movimento reduzido ---------- */
  if (reduceMotion) document.querySelectorAll('.pmoc__o svg').forEach((svg) => svg.pauseAnimations && svg.pauseAnimations());

  /* ---------- PMOC · passo 1: verificador "precisa de PMOC?" ---------- */
  const check = document.querySelector('[data-check]');
  if (check) {
    const box = check.querySelector('[data-check-result]');
    const verdict = check.querySelector('[data-check-verdict]');
    const detail = check.querySelector('[data-check-detail]');
    check.addEventListener('change', () => {
      const uso = check.querySelector('input[name="uso"]:checked');
      const clima = check.querySelector('input[name="clima"]:checked');
      if (!uso || !clima) { verdict.textContent = 'Falta uma resposta.'; detail.textContent = 'Responda as duas perguntas para ver o resultado.'; return; }
      const yes = uso.value === 'sim' && clima.value === 'sim';
      box.dataset.state = yes ? 'yes' : 'no';
      if (yes) {
        verdict.textContent = 'Sim, seu ambiente precisa de PMOC.';
        detail.textContent = 'A Lei nº 13.589/2018 exige o plano em edifícios de uso público e coletivo com ar climatizado.';
      } else if (clima.value === 'nao') {
        verdict.textContent = 'Sem climatização, o PMOC não se aplica.';
        detail.textContent = 'Se instalar ar-condicionado em um espaço de uso coletivo, o plano passa a ser obrigatório.';
      } else {
        verdict.textContent = 'Pela lei, o PMOC não é obrigatório aqui.';
        detail.textContent = 'Mesmo assim, manutenção preventiva mantém o ar limpo e a conta de energia menor.';
      }
      box.classList.remove('is-pop'); void box.offsetWidth; box.classList.add('is-pop');
      window.dispatchEvent(new Event(yes ? 'hc:complete' : 'hc:check'));
    });
  }

  /* ---------- PMOC · passo 3: etapas ligadas ao documento ---------- */
  const flow = document.querySelector('[data-flow]');
  if (flow) {
    const tabs = [...flow.querySelectorAll('[role="tab"]')];
    const doc = flow.querySelector('[data-pmoc-doc]');
    const items = [...doc.querySelectorAll('.doc__list li')];
    const bar = doc.querySelector('[data-doc-bar]');
    const status = doc.querySelector('[data-doc-status]');
    let current = 0, autoplay = null, touched = false;

    const select = (step, { focus = false, sound = true } = {}) => {
      if (step === current) return;
      const before = items.filter((li) => li.classList.contains('is-done')).length;
      current = step;
      tabs.forEach((t, i) => {
        const on = i + 1 === step;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        t.classList.toggle('is-past', i + 1 < step);
        if (on) { doc.setAttribute('aria-labelledby', t.id); if (focus) t.focus(); }
      });
      items.forEach((li) => {
        const at = Number(li.dataset.at);
        li.classList.toggle('is-done', at <= step);
        li.classList.toggle('is-now', at === step);
      });
      bar.parentElement.style.setProperty('--p', String(step / tabs.length));
      status.textContent = `Etapa ${step} de ${tabs.length} · ${tabs[step - 1].querySelector('b').textContent}`;
      const complete = step === tabs.length;
      doc.classList.toggle('is-complete', complete);
      const after = items.filter((li) => li.classList.contains('is-done')).length;
      if (sound && after > before) window.dispatchEvent(new Event(complete ? 'hc:complete' : 'hc:check'));
    };

    const stopAuto = () => { touched = true; clearInterval(autoplay); };
    tabs.forEach((t, i) => t.addEventListener('click', () => { stopAuto(); select(i + 1); }));
    flow.querySelector('[role="tablist"]').addEventListener('keydown', (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in keys) { e.preventDefault(); stopAuto(); select(((current - 1 + keys[e.key] + tabs.length) % tabs.length) + 1, { focus: true }); }
      if (e.key === 'Home') { e.preventDefault(); stopAuto(); select(1, { focus: true }); }
      if (e.key === 'End') { e.preventDefault(); stopAuto(); select(tabs.length, { focus: true }); }
    });

    select(1, { sound: false });
    // Ao aparecer na tela, as etapas avançam sozinhas uma vez (até a pessoa interagir)
    if (!reduceMotion && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([en]) => {
        if (!en.isIntersecting || touched) return;
        io.disconnect();
        autoplay = setInterval(() => {
          if (touched || current >= tabs.length) return clearInterval(autoplay);
          select(current + 1);
        }, 1800);
      }, { threshold: 0.5 });
      io.observe(flow);
    }
  }

  /* ---------- Abas genéricas (guia do PMOC) ---------- */
  document.querySelectorAll('[data-tabs]').forEach((box) => {
    const tabs = [...box.querySelectorAll('[role="tab"]')];
    const show = (i, focus) => {
      tabs.forEach((t, k) => {
        const on = k === i;
        t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => t.addEventListener('click', () => show(i)));
    box.querySelector('[role="tablist"]').addEventListener('keydown', (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); show((i + 1) % tabs.length, true); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); show((i - 1 + tabs.length) % tabs.length, true); }
      if (e.key === 'Home') { e.preventDefault(); show(0, true); }
      if (e.key === 'End') { e.preventDefault(); show(tabs.length - 1, true); }
    });
  });

  /* ---------- Pedido de orçamento: monta a mensagem e abre o WhatsApp ---------- */
  const WA = '5579996388938';
  const quote = document.querySelector('[data-quote]');
  if (quote) {
    const err = quote.querySelector('[data-quote-error]');
    const sel = quote.elements.servico;
    document.querySelectorAll('[data-service]').forEach((a) => a.addEventListener('click', () => {
      sel.value = a.dataset.service;
      setTimeout(() => quote.elements.nome.focus({ preventScroll: true }), 700);
    }));
    quote.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = quote.elements;
      const nome = f.nome.value.trim(), servico = f.servico.value;
      f.nome.setAttribute('aria-invalid', String(!nome));
      f.servico.setAttribute('aria-invalid', String(!servico));
      if (!nome || !servico) { err.hidden = false; (nome ? f.servico : f.nome).focus(); return; }
      err.hidden = true;
      const linhas = [
        `Olá, HC! Meu nome é ${nome}.`,
        `Serviço: ${servico}`,
        f.local.value.trim() && `Local: ${f.local.value.trim()}`,
        f.fone.value.trim() && `Meu WhatsApp: ${f.fone.value.trim()}`,
        'Pode me passar um orçamento?'
      ].filter(Boolean);
      const url = `https://wa.me/${WA}?text=${encodeURIComponent(linhas.join('\n'))}`;
      const w = window.open(url, '_blank', 'noopener');
      if (!w) window.location.href = url;
    });
  }

  /* ---------- Horário de atendimento (Sergipe): aberto agora? ---------- */
  const openLabels = document.querySelectorAll('[data-open-label]');
  if (openLabels.length) {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Maceio', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    const h = Number(get('hour')) + Number(get('minute')) / 60;
    const close = day >= 1 && day <= 5 ? 18 : day === 6 ? 12 : 0;
    const isOpen = close > 0 && h >= 8 && h < close;
    let next = '';
    if (!isOpen) {
      if (close > 0 && h < 8) next = 'Abre hoje às 8h.';
      else if (day >= 1 && day <= 5) next = 'Abre amanhã às 8h.';
      else next = 'Abre segunda às 8h.';
    }
    openLabels.forEach((el) => { el.textContent = isOpen ? 'Aberto agora' : 'Fechado agora'; });
    const detail = document.querySelector('[data-open-detail]');
    if (detail) detail.textContent = isOpen ? `Atendendo até as ${close}h. ` : `${next} Deixe sua mensagem no WhatsApp.`;
    const card = document.querySelector('[data-open-card]');
    if (card && isOpen) card.classList.add('is-open');
  }

  /* ---------- Botão flutuante: some quando já há um WhatsApp na tela ---------- */
  const fab = document.querySelector('.fab');
  if (fab && 'IntersectionObserver' in window) {
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? seen.add(en.target) : seen.delete(en.target)));
      fab.classList.toggle('is-hidden', seen.size > 0);
    });
    document.querySelectorAll('a[href*="wa.me"]:not(.fab), [data-quote]').forEach((el) => io.observe(el));
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
