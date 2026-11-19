/* HC Soluções — "sensação de ar": correntes de vento visuais e som ambiente.
   O som é sintetizado no navegador (Web Audio API): nenhum arquivo de áudio,
   nada toca sem o visitante pedir. */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const climate = document.querySelector('[data-climate]');
  const climateLevel = () => {
    if (!climate) return 0;
    const v = parseFloat(climate.style.getPropertyValue('--cp'));
    return Number.isFinite(v) ? v : 0;
  };
  const climateInView = () => {
    if (!climate) return false;
    const r = climate.getBoundingClientRect();
    return r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.4;
  };

  /* Energia de rolagem: rajada que sobe quando a pessoa rola e assenta depois */
  let gust = 0, lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const dy = Math.abs(window.scrollY - lastY);
    lastY = window.scrollY;
    gust = clamp(gust + dy / 900);
  }, { passive: true });

  /* ---------------- Correntes de ar (visual) ---------------- */
  const canvas = document.querySelector('[data-wind]');
  if (canvas && canvas.getContext && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = 1, streams = [];

    const spawn = (s, initial) => {
      s.len = 260 + Math.random() * 520;
      s.y = Math.random() * H;
      s.x = initial ? Math.random() * (W + s.len) - s.len : -s.len - Math.random() * W * 0.6;
      s.amp = 4 + Math.random() * 18;
      s.wave = 220 + Math.random() * 520;
      s.speed = 18 + Math.random() * 38;
      s.phase = Math.random() * Math.PI * 2;
      s.alpha = 0.05 + Math.random() * 0.09;
      s.width = Math.random() < 0.25 ? 1.4 : 0.8;
      s.ice = Math.random() < 0.7;
      s.drift = (Math.random() - 0.5) * 6;
      return s;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = W < 720 ? 9 : 16;
      streams = Array.from({ length: n }, () => spawn({}, true));
    };

    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      gust *= 0.96;
      const cool = climateInView() ? climateLevel() : 0;
      const boost = 1 + gust * 3.2 + cool * 0.8;
      ctx.clearRect(0, 0, W, H);
      for (const s of streams) {
        s.x += s.speed * boost * dt;
        s.y += s.drift * dt;
        s.phase += dt * (0.6 + gust);
        if (s.x - s.len > W) spawn(s, false);
        const g = ctx.createLinearGradient(s.x - s.len, 0, s.x, 0);
        const col = s.ice ? '124, 200, 255' : '238, 244, 251';
        const a = s.alpha * (1 + gust * 1.5 + cool * 0.6);
        g.addColorStop(0, `rgba(${col}, 0)`);
        g.addColorStop(0.55, `rgba(${col}, ${a.toFixed(3)})`);
        g.addColorStop(1, `rgba(${col}, 0)`);
        ctx.strokeStyle = g;
        ctx.lineWidth = s.width;
        ctx.beginPath();
        for (let x = s.x - s.len; x <= s.x; x += 8) {
          const t = (x - (s.x - s.len)) / s.len;              // 0..1 ao longo do fio
          const env = Math.sin(t * Math.PI);                    // afina nas pontas
          const y = s.y + Math.sin(x / s.wave * Math.PI * 2 + s.phase) * s.amp * env;
          if (x === s.x - s.len) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      requestAnimationFrame(frame);
    };

    resize();
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(resize, 200); });
    requestAnimationFrame(frame);
  }

  /* ---------------- Som ---------------- */
  const btn = document.querySelector('[data-sound]');
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!btn || !AC) {
    if (btn) btn.hidden = true;
    return;
  }

  let audio = null, on = false, raf = 0, wasOn = false, reached = false, gustTimer = 0;

  const pinkNoise = (ctx, seconds) => {
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {           // ruído rosa (Paul Kellet)
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    }
    return buf;
  };

  const build = () => {
    const ctx = new AC();
    const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const noise = ctx.createBufferSource(); noise.buffer = pinkNoise(ctx, 6); noise.loop = true;

    // Vento ambiente: faixa média que "respira" em rajadas
    const windBand = ctx.createBiquadFilter(); windBand.type = 'bandpass'; windBand.frequency.value = 480; windBand.Q.value = 0.8;
    const windGain = ctx.createGain(); windGain.gain.value = 0.18;
    noise.connect(windBand).connect(windGain).connect(master);

    // Fluxo do split: ar mais cheio e grave, cresce quando o aparelho liga
    const acLow = ctx.createBiquadFilter(); acLow.type = 'lowpass'; acLow.frequency.value = 900;
    const acHigh = ctx.createBiquadFilter(); acHigh.type = 'highpass'; acHigh.frequency.value = 110;
    const acGain = ctx.createGain(); acGain.gain.value = 0;
    noise.connect(acHigh).connect(acLow).connect(acGain).connect(master);

    // Zumbido do compressor, bem ao fundo
    const humGain = ctx.createGain(); humGain.gain.value = 0;
    const humLp = ctx.createBiquadFilter(); humLp.type = 'lowpass'; humLp.frequency.value = 260;
    [60, 120, 180].forEach((f, i) => {
      const o = ctx.createOscillator(); o.frequency.value = f;
      const g = ctx.createGain(); g.gain.value = [1, 0.45, 0.15][i];
      o.connect(g).connect(humLp); o.start();
    });
    humLp.connect(humGain).connect(master);

    noise.start();
    return { ctx, master, windBand, windGain, acLow, acGain, humGain };
  };

  const beep = (freqs) => {
    if (!audio || !on) return;
    const { ctx, master } = audio;
    let t = ctx.currentTime + 0.02;
    freqs.forEach((f) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.05, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.connect(g).connect(master); o.start(t); o.stop(t + 0.14);
      t += 0.13;
    });
  };

  const scheduleGust = () => {        // rajadas naturais, sem padrão perceptível
    if (!audio || !on) return;
    const { ctx, windBand, windGain } = audio;
    const now = ctx.currentTime, dur = 1.2 + Math.random() * 2.6;
    windBand.frequency.setTargetAtTime(320 + Math.random() * 620, now, dur / 2);
    windBand.Q.setTargetAtTime(0.5 + Math.random() * 0.9, now, dur / 2);
    windGain.gain.setTargetAtTime(0.13 + Math.random() * 0.16 + gust * 0.2, now, dur / 2);
    gustTimer = setTimeout(scheduleGust, dur * 1000);
  };

  const tick = () => {
    if (!audio || !on) return;
    const { ctx, acGain, humGain, acLow } = audio;
    const now = ctx.currentTime;
    const cp = climateLevel();
    const inView = climateInView();
    const level = inView ? cp : cp * 0.35;            // fora da seção, um ar-condicionado "ao fundo"
    acGain.gain.setTargetAtTime(level * 0.32, now, 0.25);
    humGain.gain.setTargetAtTime(level * 0.018, now, 0.4);
    acLow.frequency.setTargetAtTime(600 + level * 700 + gust * 400, now, 0.3);

    if (inView) {                                      // bip ao ligar e ao chegar a 22°
      if (cp > 0.05 && !wasOn) { wasOn = true; beep([1760, 2350]); }
      if (cp < 0.02 && wasOn) { wasOn = false; reached = false; }
      if (cp > 0.97 && !reached) { reached = true; beep([2350]); }
      if (cp < 0.85 && reached) reached = false;
    }
    raf = requestAnimationFrame(tick);
  };

  const setOn = async (value) => {
    on = value;
    btn.setAttribute('aria-pressed', String(on));
    btn.querySelector('[data-sound-label]').textContent = on ? 'Som ligado' : 'Ativar som';
    document.documentElement.classList.toggle('sound-on', on);
    if (on) {
      if (!audio) audio = build();
      await audio.ctx.resume();
      const now = audio.ctx.currentTime;
      audio.master.gain.cancelScheduledValues(now);
      audio.master.gain.setTargetAtTime(0.9, now, 0.6);
      wasOn = climateLevel() > 0.05; reached = climateLevel() > 0.97;
      scheduleGust();
      cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    } else if (audio) {
      clearTimeout(gustTimer); cancelAnimationFrame(raf);
      const now = audio.ctx.currentTime;
      audio.master.gain.setTargetAtTime(0, now, 0.25);
      setTimeout(() => { if (!on) audio.ctx.suspend(); }, 1200);
    }
  };

  // Sons curtos para o checklist do PMOC
  const click = (freq = 1320, vol = 0.035, len = 0.06) => {
    if (!audio || !on) return;
    const { ctx, master } = audio;
    const t = ctx.currentTime + 0.01;
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.6, t + len);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g).connect(master); o.start(t); o.stop(t + len + 0.02);
  };
  window.addEventListener('hc:check', () => click());
  window.addEventListener('hc:complete', () => { click(880, 0.05, 0.18); setTimeout(() => click(1760, 0.04, 0.22), 120); });

  btn.hidden = false;
  btn.addEventListener('click', () => setOn(!on));
  document.addEventListener('visibilitychange', () => {
    if (!audio || !on) return;
    if (document.hidden) audio.ctx.suspend(); else audio.ctx.resume();
  });

  /* ---------- Sem tela de entrada: o som liga no primeiro toque, clique ou tecla ----------
     (navegadores só liberam áudio depois de uma interação; quem desligar no botão não é religado) */
  let touched = false;
  const firstGesture = (e) => {
    if (touched) return;
    touched = true;
    ['pointerdown', 'keydown'].forEach((t) => window.removeEventListener(t, firstGesture, true));
    if (e.target.closest && e.target.closest('[data-sound]')) return; // o próprio botão já decide
    if (!on) setOn(true);
  };
  ['pointerdown', 'keydown'].forEach((t) => window.addEventListener(t, firstGesture, true));
})();
