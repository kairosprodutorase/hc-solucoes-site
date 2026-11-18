/* HC Soluções — split moderno em 3D (Three.js) com fluxo de ar luminoso.
   Corpo fino e acetinado, visor "escondido" (os números brilham no próprio painel),
   faixa de LED, saída de ar iluminada e faixas de luz azul em leque que ganham força
   conforme o ambiente esfria (variável --cp da seção de climatização, 0 → 1).
   O brilho é feito com camadas aditivas (shaders próprios), sem pós-processamento,
   para manter o canvas transparente e leve no celular. Sem WebGL, a ilustração SVG fica. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from './vendor/three/addons/RoundedBoxGeometry.js';
import { RoomEnvironment } from './vendor/three/addons/RoomEnvironment.js';

const figure = document.querySelector('[data-split3d]');
const canvas = figure && figure.querySelector('canvas');
const climate = document.querySelector('[data-climate]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const supportsWebGL = (() => {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
  catch { return false; }
})();

if (figure && canvas && supportsWebGL) init();

function init() {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ICE = new THREE.Color(0x7cc8ff);
  const CYAN = new THREE.Color(0xa8e6ff);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(28, 2, 0.1, 100);

  /* ---------- Texturas suaves geradas em canvas ---------- */
  const radial = (inner = 'rgba(255,255,255,1)') => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, inner); r.addColorStop(0.35, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  };
  const glowTex = radial();
  const glowMat = (opacity = 0) => new THREE.MeshBasicMaterial({ map: glowTex, color: ICE, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });

  /* ---------- Materiais ---------- */
  const shell = new THREE.MeshPhysicalMaterial({ color: 0xeef1f5, roughness: 0.3, metalness: 0, clearcoat: 0.85, clearcoatRoughness: 0.18, sheen: 0.35, sheenColor: new THREE.Color(0xdfe8f5) });
  const face = new THREE.MeshPhysicalMaterial({ color: 0xf6f8fb, roughness: 0.14, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05 });
  const inner = new THREE.MeshStandardMaterial({ color: 0x0c121b, roughness: 0.7 });
  const vaneMat = new THREE.MeshStandardMaterial({ color: 0xc9d3df, roughness: 0.45 });

  /* ---------- Aparelho ---------- */
  const unit = new THREE.Group();
  scene.add(unit);
  const W = 9.4, H = 2.5, D = 1.9;

  const body = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 10, 0.5), shell);
  body.castShadow = true; body.receiveShadow = true;
  unit.add(body);

  // painel frontal: uma lâmina contínua, levemente saliente, com linha de junção fina embaixo
  const panel = new THREE.Mesh(new RoundedBoxGeometry(W - 0.5, 1.72, 0.12, 6, 0.06), face);
  panel.position.set(0, 0.3, D / 2 + 0.02);
  panel.castShadow = true;
  unit.add(panel);

  // saída de ar com palhetas e faixa de luz interna
  const outlet = new THREE.Mesh(new THREE.BoxGeometry(W - 1.1, 0.1, 0.95), inner);
  outlet.position.set(0, -H / 2 + 0.04, 0.42);
  unit.add(outlet);
  const vaneCount = 38;
  const vanes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 0.08, 0.82), vaneMat, vaneCount);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), s3 = new THREE.Vector3(1, 1, 1), p3 = new THREE.Vector3();
  for (let i = 0; i < vaneCount; i++) {
    const x = lerp(-(W - 1.5) / 2, (W - 1.5) / 2, i / (vaneCount - 1));
    e3.set(0, 0, (x / W) * 0.55); q.setFromEuler(e3); p3.set(x, -H / 2 + 0.02, 0.42);
    vanes.setMatrixAt(i, m4.compose(p3, q, s3));
  }
  unit.add(vanes);
  const ventLight = new THREE.Mesh(new THREE.BoxGeometry(W - 1.3, 0.02, 0.06),
    new THREE.MeshBasicMaterial({ color: ICE, transparent: true, opacity: 0, toneMapped: false }));
  ventLight.position.set(0, -H / 2 + 0.03, 0.62);
  unit.add(ventLight);

  // aleta articulada
  const flapPivot = new THREE.Group();
  flapPivot.position.set(0, -H / 2 - 0.01, 0.94);
  unit.add(flapPivot);
  const flapGeo = new RoundedBoxGeometry(W - 0.9, 0.06, 1.05, 3, 0.03);
  flapGeo.translate(0, 0, -0.52);
  const flap = new THREE.Mesh(flapGeo, face);
  flap.castShadow = true;
  flapPivot.add(flap);

  // faixa de LED no painel
  const ledZ = D / 2 + 0.09;
  const led = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.045, 0.02, 2, 0.02),
    new THREE.MeshBasicMaterial({ color: ICE, transparent: true, opacity: 0.25, toneMapped: false }));
  led.position.set(0, -0.42, ledZ);
  unit.add(led);
  const ledGlow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.7), glowMat());
  ledGlow.position.set(0, -0.42, ledZ + 0.01);
  unit.add(ledGlow);

  // visor escondido: números e Wi-Fi brilhando no próprio painel
  const dispCanvas = document.createElement('canvas'); dispCanvas.width = 512; dispCanvas.height = 192;
  const dctx = dispCanvas.getContext('2d');
  const dispTex = new THREE.CanvasTexture(dispCanvas); dispTex.colorSpace = THREE.SRGBColorSpace; dispTex.anisotropy = 4;
  const digits = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.6),
    new THREE.MeshBasicMaterial({ map: dispTex, transparent: true, toneMapped: false, depthWrite: false }));
  digits.position.set(3.15, 0.62, ledZ);
  unit.add(digits);
  let shownTemp = null, shownWarm = null;
  const drawDisplay = (t, warm) => {
    const col = warm ? '#ffb08f' : '#8fd3ff';
    dctx.clearRect(0, 0, 512, 192);
    dctx.shadowColor = col; dctx.shadowBlur = 22; dctx.fillStyle = col;
    dctx.font = '300 128px "JetBrains Mono", ui-monospace, monospace';
    dctx.textAlign = 'right'; dctx.textBaseline = 'middle';
    dctx.fillText(String(t), 330, 104);
    dctx.font = '300 54px "JetBrains Mono", monospace'; dctx.textAlign = 'left';
    dctx.fillText('°C', 340, 70);
    // ícone de Wi-Fi
    dctx.lineWidth = 7; dctx.strokeStyle = col; dctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) { dctx.beginPath(); dctx.arc(452, 150, 14 + i * 16, Math.PI * 1.25, Math.PI * 1.75); dctx.stroke(); }
    dctx.beginPath(); dctx.arc(452, 150, 5, 0, Math.PI * 2); dctx.fill();
    dispTex.needsUpdate = true;
  };

  // logo aplicada (versão preto e branco do aparelho)
  const logoImg = new Image();
  logoImg.onload = () => {
    const c = document.createElement('canvas');
    const ratio = (logoImg.naturalHeight || 120) / (logoImg.naturalWidth || 489);
    c.width = 2048; c.height = Math.round(2048 * ratio);
    c.getContext('2d').drawImage(logoImg, 0, 0, c.width, c.height);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const w = 2.5;
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(w, w * ratio),
      new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.3, polygonOffset: true, polygonOffsetFactor: -2 }));
    logo.position.set(-2.9, 0.55, ledZ - 0.005);
    unit.add(logo);
  };
  logoImg.src = './assets/logo/hc-logo-horizontal-aparelho.svg';

  /* ---------- Fluxo de ar luminoso: faixas em leque ---------- */
  const ribbonMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
    uniforms: { uTime: { value: 0 }, uPower: { value: 0 }, uReach: { value: 0 }, uIce: { value: ICE }, uCore: { value: CYAN } },
    vertexShader: `
      attribute float aSeed;
      varying vec2 vUv; varying float vSeed;
      void main() { vUv = uv; vSeed = aSeed; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform float uTime, uPower, uReach; uniform vec3 uIce, uCore;
      varying vec2 vUv; varying float vSeed;
      void main() {
        float across = 1.0 - abs(vUv.x * 2.0 - 1.0);            // 0 nas bordas, 1 no centro da faixa
        float soft = smoothstep(0.0, 0.85, across);
        float along = vUv.y;                                     // 0 na saída de ar, 1 na ponta
        float reach = smoothstep(uReach, uReach - 0.25, along); // a faixa "cresce" conforme esfria
        float fade = pow(1.0 - along, 1.15);
        float streak = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(along * 26.0 - uTime * (2.4 + vSeed) + vSeed * 6.0 + vUv.x * 4.0), 2.0);
        float core = pow(across, 7.0);                            // fio de luz no centro de cada faixa
        float a = (soft * 0.75 + core * 1.6) * fade * reach * streak * uPower;
        vec3 col = mix(uIce, vec3(1.0), core * (1.0 - along) * 0.7);
        gl_FragColor = vec4(col * a, clamp(a, 0.0, 1.0));
      }`,
  });
  const ribbons = new THREE.Group();
  unit.add(ribbons);
  const RIB = 11;
  for (let i = 0; i < RIB; i++) {
    const f = i / (RIB - 1) * 2 - 1;                 // -1 … 1 ao longo da saída
    const x0 = f * (W - 1.8) / 2;
    const p0 = new THREE.Vector3(x0, -H / 2 - 0.05, 0.9);
    const p1 = new THREE.Vector3(x0 * 1.08, -H / 2 - 1.3, 2.3);
    const p2 = new THREE.Vector3(x0 * 1.5 + f * 0.8, -H / 2 - 4.2, 3.4);
    const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
    const SEG = 48, pos = [], uv = [], seed = [], idx = [];
    const s = Math.random();
    for (let k = 0; k <= SEG; k++) {
      const t = k / SEG, p = curve.getPoint(t), w = lerp(1.0, 2.3, t);
      pos.push(p.x - w / 2, p.y, p.z, p.x + w / 2, p.y, p.z);
      uv.push(0, t, 1, t); seed.push(s, s);
      if (k < SEG) { const a = k * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
    g.setIndex(idx);
    const mesh = new THREE.Mesh(g, ribbonMat);
    mesh.frustumCulled = false;
    ribbons.add(mesh);
  }

  // halo frio sob o aparelho e brilho na boca da saída
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(10, 4.6), glowMat());
  halo.position.set(0, -H / 2 - 1.9, 2.2);
  unit.add(halo);
  const mouthGlow = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.95, 1.1), glowMat());
  mouthGlow.position.set(0, -H / 2 - 0.12, 1.0);
  mouthGlow.rotation.x = -0.6;
  unit.add(mouthGlow);

  // partículas finas de ar frio (poucas, só para dar textura)
  const N = window.innerWidth < 720 ? 160 : 340;
  const ppos = new Float32Array(N * 3), vel = new Float32Array(N * 3), life = new Float32Array(N), palpha = new Float32Array(N);
  const spawn = (i, initial) => {
    ppos[i * 3] = (Math.random() - 0.5) * (W - 1.6); ppos[i * 3 + 1] = -H / 2 - 0.15; ppos[i * 3 + 2] = 0.8 + Math.random() * 0.3;
    vel[i * 3] = ppos[i * 3] * 0.06 + (Math.random() - 0.5) * 0.2; vel[i * 3 + 1] = -(1 + Math.random()); vel[i * 3 + 2] = 0.9 + Math.random() * 0.8;
    life[i] = initial ? Math.random() * 2.6 : 0;
  };
  for (let i = 0; i < N; i++) spawn(i, true);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(ppos, 3));
  pGeo.setAttribute('alpha', new THREE.BufferAttribute(palpha, 1));
  const pMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: { map: { value: glowTex }, color: { value: CYAN }, strength: { value: 0 }, size: { value: 70 * renderer.getPixelRatio() } },
    vertexShader: `attribute float alpha; varying float vA; uniform float size;
      void main(){ vA = alpha; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = size / -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 color; uniform float strength; varying float vA;
      void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(color, t.a * vA * strength); }`,
  });
  const points = new THREE.Points(pGeo, pMat);
  points.frustumCulled = false;
  unit.add(points);

  /* ---------- Parede (só a sombra) e luzes ---------- */
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.ShadowMaterial({ opacity: 0.24 }));
  wall.position.z = -D / 2 - 0.02; wall.receiveShadow = true;
  scene.add(wall);
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(-2.5, 9, 12); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 6, bottom: -8, near: 1, far: 30 });
  key.shadow.radius = 14; key.shadow.blurSamples = 20; key.shadow.bias = -0.0004;
  scene.add(key);
  scene.add(new THREE.HemisphereLight(0xe3ecf7, 0x0b1424, 0.45));
  const rim = new THREE.DirectionalLight(0x9fd4ff, 0.8); rim.position.set(7, -2, -3); scene.add(rim);
  const coolLight = new THREE.PointLight(0x7cc8ff, 0, 12, 1.6); coolLight.position.set(0, -2.6, 2.2); scene.add(coolLight);
  const warmLight = new THREE.PointLight(0xff6a3d, 0, 16, 1.6); warmLight.position.set(0, -2.5, 4); scene.add(warmLight);

  /* ---------- Enquadramento ---------- */
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const fitW = (W / (camera.aspect < 1 ? 0.92 : 0.62)) / 2, fitH = 8.4 / 2;
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const dist = Math.max(fitW / (Math.tan(vFov / 2) * camera.aspect), fitH / Math.tan(vFov / 2));
    camera.position.set(dist * 0.05, -dist * 0.24, dist);
    camera.lookAt(0, -1.1, 0);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  /* ---------- Interação e animação ---------- */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (window.matchMedia('(pointer: fine)').matches && !reduceMotion) {
    window.addEventListener('pointermove', (ev) => {
      pointer.tx = (ev.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (ev.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }
  const readCp = () => {
    if (!climate) return 1;
    const v = parseFloat(getComputedStyle(climate).getPropertyValue('--cp'));
    return Number.isFinite(v) ? v : 1;
  };

  let visible = true, raf = 0, last = performance.now(), cpSmooth = readCp(), clock = 0;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }).observe(figure);

  function frame(now) {
    raf = 0;
    if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!reduceMotion) clock += dt;
    const cp = readCp();
    cpSmooth = lerp(cpSmooth, cp, reduceMotion ? 1 : 0.1);
    const cool = clamp((cpSmooth - 0.05) / 0.95);       // 0 com o aparelho desligado, 1 a 22°
    const glow = cool * cool * (3 - 2 * cool);          // curva suave

    pointer.x = lerp(pointer.x, pointer.tx, 0.05); pointer.y = lerp(pointer.y, pointer.ty, 0.05);
    unit.rotation.y = lerp(-0.36, -0.12, cpSmooth) + pointer.x * 0.12;
    unit.rotation.x = 0.04 + pointer.y * 0.035;
    unit.position.y = reduceMotion ? 0 : Math.sin(now / 1900) * 0.025;

    flapPivot.rotation.x = cpSmooth * 0.9;

    // luzes da peça: LED, saída de ar e brilhos crescem com o frio
    led.material.opacity = 0.25 + glow * 0.75;
    ledGlow.material.opacity = glow * 0.9;
    ventLight.material.opacity = glow;
    mouthGlow.material.opacity = glow * 0.85;
    halo.material.opacity = glow * 0.35;
    ribbonMat.uniforms.uPower.value = glow * 1.7;
    ribbonMat.uniforms.uReach.value = 0.25 + cool * 0.95;
    ribbonMat.uniforms.uTime.value = clock;
    warmLight.intensity = (1 - cpSmooth) * 8;
    coolLight.intensity = glow * 16;

    const t = Math.round(32 - cp * 10), warm = cp < 0.35;
    if (t !== shownTemp || warm !== shownWarm) { shownTemp = t; shownWarm = warm; drawDisplay(t, warm); }

    pMat.uniforms.strength.value = glow * 0.55;
    if (glow > 0.01 && !reduceMotion) {
      for (let i = 0; i < N; i++) {
        life[i] += dt;
        if (life[i] > 2.6) spawn(i, false);
        const k = i * 3;
        ppos[k] += vel[k] * dt; ppos[k + 1] += vel[k + 1] * dt; ppos[k + 2] += vel[k + 2] * dt;
        palpha[i] = Math.sin(Math.PI * life[i] / 2.6) * 0.7;
      }
      pGeo.attributes.position.needsUpdate = true;
      pGeo.attributes.alpha.needsUpdate = true;
    }

    renderer.render(scene, camera);
    if (!reduceMotion) raf = requestAnimationFrame(frame);
  }

  const start = () => { figure.classList.add('is-3d'); raf = requestAnimationFrame(frame); };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(start);
  if (reduceMotion) window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(frame); }, { passive: true });
}
