/* HC Soluções — base de movimento e termômetro.
   Rolagem suave, títulos que entram palavra por palavra, cabeçalho que sai do
   caminho ao descer, cursor com o floco, letras que se embaralham no hover e o
   termômetro com ventilação que reage à velocidade da rolagem.
   Tudo é camada extra: sem JavaScript ou com movimento reduzido, a página
   continua completa e legível. */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktopPointer = window.matchMedia('(pointer: fine) and (hover: hover) and (min-width: 992px)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- Rolagem suave (Lenis) ---------- */
  let lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: true,            // links internos (#servicos, #contato…) também deslizam
      stopInertiaOnNavigate: true
    });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    // Enquanto a tela de entrada está aberta, a página não rola
    if (root.classList.contains('intro-open')) lenis.stop();
    window.addEventListener('hc:entered', () => lenis.start());
    window.hcLenis = lenis;
  }
  const scrollY = () => (lenis ? lenis.scroll : window.scrollY);

  /* ---------- Títulos: palavras sobem e saem do desfoque ---------- */
  const splitWords = (el) => {
    let n = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            const w = document.createElement('span');
            w.className = 'sw';
            const inner = document.createElement('span');
            inner.textContent = p;
            inner.style.setProperty('--i', n++);
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && !child.matches('svg, [aria-hidden="true"]')) {
          walk(child);
        }
      });
    };
    walk(el);
    return n;
  };

  const splitTargets = document.querySelectorAll('.climate__title, .pmoc__claim, .contact__title, .section__lede, .biz h3, .pmoc__lede');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-split-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    splitTargets.forEach((el) => {
      const words = splitWords(el);
      el.classList.add('wsplit');
      el.style.setProperty('--n', words);
      io.observe(el);
    });
  }

  /* ---------- Cabeçalho: sai ao descer, volta ao subir, marca a seção ---------- */
  const nav = document.querySelector('.nav');
  const links = [...document.querySelectorAll('.nav ul a[href^="#"]')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  let lastY = scrollY(), navHidden = false;

  const updateNav = () => {
    const y = scrollY();
    const dy = y - lastY;
    lastY = y;
    if (nav && !reduceMotion) {
      const past = y > window.innerHeight * 0.9;
      const focusInside = nav.contains(document.activeElement);
      if (dy > 6 && past && !focusInside && !navHidden) { navHidden = true; nav.classList.add('is-away'); }
      else if ((dy < -6 || !past) && navHidden) { navHidden = false; nav.classList.remove('is-away'); }
    }
    // seção atual: a última cujo topo já passou do meio da tela
    const mid = window.innerHeight * 0.45;
    let current = null;
    sections.forEach((s) => { if (s.getBoundingClientRect().top <= mid) current = s; });
    if (current && current.getBoundingClientRect().bottom < mid * 0.3) current = null;
    links.forEach((a) => {
      const on = current && a.getAttribute('href') === `#${current.id}`;
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  };
  if (nav) nav.addEventListener('focusin', () => { navHidden = false; nav.classList.remove('is-away'); });

  /* ---------- Letras embaralhadas no hover (só desktop) ---------- */
  const scrambleTargets = '.nav ul a, .btn, .pmoc-badge span, .site-footer a';
  const textHost = (el) => {
    // botões com ícone: embaralha só o texto, nunca o SVG
    const nodes = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
    if (!nodes.length) return el.children.length ? null : el;
    const last = nodes[nodes.length - 1];
    const span = document.createElement('span');
    span.className = 'scramble';
    last.replaceWith(span);
    span.textContent = last.textContent;
    return span;
  };
  const scramble = (el) => {
    if (el.dataset.scrambling) return;
    const host = el._scrambleHost || (el._scrambleHost = textHost(el));
    if (!host) return;
    const original = host.dataset.text || (host.dataset.text = host.textContent);
    const chars = original.split('');
    const letters = chars.filter((c) => c.trim());
    el.dataset.scrambling = '1';
    host.style.display = 'inline-block';
    host.style.width = `${host.getBoundingClientRect().width}px`;   // sem a largura "pular"
    host.style.whiteSpace = 'nowrap';
    let fixed = -2;
    const step = () => {
      if (fixed >= chars.length) {
        host.textContent = original;
        host.style.width = ''; host.style.whiteSpace = ''; host.style.display = '';
        delete el.dataset.scrambling;
        return;
      }
      host.textContent = chars.map((c, i) => (i < fixed || !c.trim() ? c : letters[(Math.random() * letters.length) | 0])).join('');
      fixed++;
      setTimeout(step, 28);
    };
    step();
  };

  /* ---------- Cursor com o floco (só desktop) ---------- */
  let cursor = null;
  const setupDesktop = () => {
    if (reduceMotion || !desktopPointer.matches || cursor) return;

    document.querySelectorAll(scrambleTargets).forEach((el) => {
      el.addEventListener('mouseenter', () => scramble(el));
    });

    cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = '<span class="cursor__ring"></span><svg class="cursor__flake"><use href="#snowflake"/></svg>';
    document.body.appendChild(cursor);
    root.classList.add('has-cursor');

    const pos = { x: -100, y: -100 }, ring = { x: -100, y: -100 };
    let shown = false, spin = 0;
    const LINK = 'a, button, label, select, summary, [role="tab"], [data-tilt]';
    const TEXT = 'input:not([type="radio"]):not([type="checkbox"]), textarea, [contenteditable]';

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      pos.x = e.clientX; pos.y = e.clientY;
      if (!shown) { shown = true; ring.x = pos.x; ring.y = pos.y; cursor.classList.add('is-on'); }
      const t = e.target instanceof Element ? e.target : null;
      cursor.classList.toggle('is-link', !!(t && t.closest(LINK)));
      cursor.classList.toggle('is-text', !!(t && t.closest(TEXT)));
    }, { passive: true });
    document.addEventListener('mouseleave', () => { shown = false; cursor.classList.remove('is-on'); });
    window.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      cursor.classList.add('is-down');
      const ripple = document.createElement('span');
      ripple.className = 'cursor-ripple';
      ripple.style.left = `${e.clientX}px`; ripple.style.top = `${e.clientY}px`;
      ripple.setAttribute('aria-hidden', 'true');
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
    window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));

    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      ring.x += (pos.x - ring.x) * 0.18;
      ring.y += (pos.y - ring.y) * 0.18;
      spin += dt * (cursor.classList.contains('is-link') ? 140 : 18) * (1 + fan.speed * 4);
      cursor.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      cursor.style.setProperty('--spin', `${spin % 360}deg`);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  };

  /* ---------- Termômetro + ventilação ---------- */
  // A seção do split mostra o ambiente indo de 32° a 22°; enquanto ela está na
  // tela o termômetro sai de cena (nunca dois com a mesma função na tela).
  // Depois dela ele fica em 22° e a ventilação acompanha a velocidade da
  // rolagem. Quem pula direto por um link vê a temperatura descer até 22°.
  const fan = { speed: 0, level: 0 };
  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.setAttribute('aria-hidden', 'true');
  hud.innerHTML =
    '<svg class="hud__fan" viewBox="-12 -12 24 24"><use href="#snowflake"/></svg>' +
    '<span class="hud__temp"><b data-hud-temp>32</b><i>°</i></span>' +
    '<span class="hud__info"><small class="hud__state" data-hud-state>Calor</small>' +
    '<span class="hud__fanrow"><span class="hud__bars"><i></i><i></i><i></i><i></i></span><small data-hud-fan>Baixa</small></span></span>';
  const climate = document.querySelector('[data-climate]');
  const hero = document.querySelector('[data-hero]');
  const tempEl = hud.querySelector('[data-hud-temp]');
  const stateEl = hud.querySelector('[data-hud-state]');
  const fanEl = hud.querySelector('[data-hud-fan]');
  const fanIcon = hud.querySelector('.hud__fan');
  const LEVELS = ['Baixa', 'Média', 'Alta', 'Turbo'];

  if (!reduceMotion) {
    document.body.appendChild(hud);
    let shownTemp = 32, prevY = scrollY(), prevT = performance.now(), angle = 0, lastLevel = -1, lastEmit = -1;

    const frame = (now) => {
      const dt = Math.max(0.001, (now - prevT) / 1000);
      prevT = now;
      const y = scrollY();
      // velocidade da rolagem em px/s, suavizada (sobe rápido, desce devagar)
      const v = Math.abs(y - prevY) / dt;
      prevY = y;
      const target = clamp(v / 2600);
      fan.speed += (target - fan.speed) * (target > fan.speed ? 0.12 : 0.05);
      if (fan.speed < 0.003 && target === 0) fan.speed = 0;
      const level = fan.speed > 0.62 ? 3 : fan.speed > 0.3 ? 2 : fan.speed > 0.05 ? 1 : 0;

      // temperatura conforme a posição em relação à seção do split
      let goal = 32, inClimate = false;
      if (climate) {
        const r = climate.getBoundingClientRect();
        inClimate = r.top < window.innerHeight * 0.85 && r.bottom > window.innerHeight * 0.15;
        if (r.top < 0) goal = r.bottom <= window.innerHeight ? 22 : 32 - 10 * clamp(parseFloat(climate.style.getPropertyValue('--cp')) || 0);
      }
      shownTemp += (goal - shownTemp) * 0.08;
      const t = Math.round(shownTemp);
      if (tempEl.textContent !== String(t)) {
        tempEl.textContent = t;
        stateEl.textContent = t >= 29 ? 'Calor' : t >= 25 ? 'Resfriando' : 'Conforto';
        hud.style.setProperty('--hot', clamp((t - 22) / 10).toFixed(2));
      }
      if (level !== lastLevel) {
        lastLevel = level;
        fanEl.textContent = LEVELS[level];
        hud.dataset.level = level;
      }
      // na abertura os botões ficam no canto do termômetro: ele só entra depois
      const inHero = hero && hero.getBoundingClientRect().bottom > window.innerHeight * 0.25;
      hud.classList.toggle('is-hidden', inHero || inClimate || root.classList.contains('intro-open'));

      // o floco gira como a hélice: devagar parado, rápido no turbo
      angle = (angle + dt * (40 + fan.speed * 900)) % 360;
      fanIcon.style.transform = `rotate(${angle}deg)`;

      // avisa o som (air.js) quando a ventilação muda de verdade
      const q = Math.round(fan.speed * 50) / 50;
      if (q !== lastEmit) { lastEmit = q; window.dispatchEvent(new CustomEvent('hc:fan', { detail: { speed: fan.speed, level } })); }

      updateNav();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  } else {
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  setupDesktop();
  desktopPointer.addEventListener && desktopPointer.addEventListener('change', setupDesktop);
})();
