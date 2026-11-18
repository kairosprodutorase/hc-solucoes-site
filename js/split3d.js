/* HC Soluções — split em 3D (Three.js).
   Modelado em código: corpo em plástico brilhante, painel frontal, saída de ar com
   palhetas, aleta articulada, visor com a temperatura, logo aplicada, sombra na parede
   e partículas de ar frio. Reage ao scroll da seção de climatização (--cp) e ao cursor.
   Se o WebGL não estiver disponível, a ilustração em SVG continua no lugar. */
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

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(28, 2, 0.1, 100);

  /* ---------- Materiais ---------- */
  const plastic = new THREE.MeshPhysicalMaterial({ color: 0xe8ecf1, roughness: 0.36, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.28, sheen: 0.2 });
  const panelMat = new THREE.MeshPhysicalMaterial({ color: 0xf1f4f8, roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0a0e14, roughness: 0.85 });
  const vaneMat = new THREE.MeshStandardMaterial({ color: 0xd9dee6, roughness: 0.5 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x05080d, roughness: 0.08, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.03 });

  /* ---------- Aparelho ---------- */
  const unit = new THREE.Group();
  scene.add(unit);
  const W = 9, H = 2.9, D = 2.3;

  const body = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 8, 0.34), plastic);
  body.castShadow = true; body.receiveShadow = true;
  unit.add(body);

  // painel frontal ligeiramente saliente (cria a linha de junção do gabinete)
  const panel = new THREE.Mesh(new RoundedBoxGeometry(W - 0.34, 2.02, 0.16, 6, 0.07), panelMat);
  panel.position.set(0, 0.36, D / 2 + 0.01);
  panel.castShadow = true;
  unit.add(panel);

  // friso inferior do painel
  const trim = new THREE.Mesh(new RoundedBoxGeometry(W - 0.5, 0.05, 0.05, 2, 0.02), new THREE.MeshStandardMaterial({ color: 0xc8d0da, roughness: 0.4 }));
  trim.position.set(0, -0.69, D / 2 + 0.05);
  unit.add(trim);

  // saída de ar (recorte escuro na parte de baixo) e palhetas verticais
  const outlet = new THREE.Mesh(new THREE.BoxGeometry(W - 0.9, 0.12, 1.05), darkMat);
  outlet.position.set(0, -H / 2 + 0.05, 0.45);
  unit.add(outlet);
  const vaneCount = 34;
  const vanes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.035, 0.1, 0.9), vaneMat, vaneCount);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), s3 = new THREE.Vector3(1, 1, 1), p3 = new THREE.Vector3();
  for (let i = 0; i < vaneCount; i++) {
    const x = lerp(-(W - 1.3) / 2, (W - 1.3) / 2, i / (vaneCount - 1));
    e3.set(0, 0, (x / W) * 0.5); q.setFromEuler(e3); p3.set(x, -H / 2 + 0.02, 0.45);
    vanes.setMatrixAt(i, m4.compose(p3, q, s3));
  }
  unit.add(vanes);

  // aleta articulada (pivô na borda frontal da saída)
  const flapPivot = new THREE.Group();
  flapPivot.position.set(0, -H / 2 - 0.01, 0.98);
  unit.add(flapPivot);
  const flapGeo = new RoundedBoxGeometry(W - 0.8, 0.07, 1.1, 3, 0.03);
  flapGeo.translate(0, 0, -0.55);           // gira a partir da borda frontal
  const flap = new THREE.Mesh(flapGeo, panelMat);
  flap.castShadow = true;
  flapPivot.add(flap);

  // visor (vidro escuro) com temperatura em textura dinâmica
  const display = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.62, 0.05, 4, 0.08), glassMat);
  display.position.set(3.25, 0.55, D / 2 + 0.11);
  unit.add(display);
  const dispCanvas = document.createElement('canvas'); dispCanvas.width = 512; dispCanvas.height = 256;
  const dctx = dispCanvas.getContext('2d');
  const dispTex = new THREE.CanvasTexture(dispCanvas); dispTex.colorSpace = THREE.SRGBColorSpace; dispTex.anisotropy = 4;
  const digits = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), new THREE.MeshBasicMaterial({ map: dispTex, transparent: true, toneMapped: false }));
  digits.position.set(3.25, 0.55, D / 2 + 0.14);
  unit.add(digits);
  let shownTemp = null;
  const drawDisplay = (t, cool) => {
    dctx.clearRect(0, 0, 512, 256);
    const col = cool > 0.5 ? '#7cc8ff' : '#ffb08f';
    dctx.shadowColor = col; dctx.shadowBlur = 24;
    dctx.fillStyle = col;
    dctx.font = '500 150px "JetBrains Mono", ui-monospace, monospace';
    dctx.textAlign = 'center'; dctx.textBaseline = 'middle';
    dctx.fillText(`${t}°`, 270, 140);
    dctx.shadowBlur = 0; dctx.font = '500 30px "JetBrains Mono", monospace'; dctx.fillStyle = 'rgba(160,175,195,.8)';
    dctx.textAlign = 'left'; dctx.fillText('COOL', 40, 52);
    dctx.beginPath(); dctx.arc(28, 52, 8, 0, Math.PI * 2); dctx.fillStyle = col; dctx.fill();
    dispTex.needsUpdate = true;
  };

  // logo aplicada no painel (a partir do SVG oficial da marca)
  const logoImg = new Image();
  logoImg.onload = () => {
    const c = document.createElement('canvas');
    const ratio = (logoImg.naturalHeight || 120) / (logoImg.naturalWidth || 489);
    c.width = 2048; c.height = Math.round(2048 * ratio);
    c.getContext('2d').drawImage(logoImg, 0, 0, c.width, c.height);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const w = 2.7;
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(w, w * ratio),
      new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.3, polygonOffset: true, polygonOffsetFactor: -2 }));
    logo.position.set(-2.75, 0.5, D / 2 + 0.095);
    unit.add(logo);
  };
  logoImg.src = './assets/logo/hc-logo-horizontal-aparelho.svg';

  /* ---------- Parede (só recebe a sombra) ---------- */
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.ShadowMaterial({ opacity: 0.26 }));
  wall.position.z = -D / 2 - 0.02;
  wall.receiveShadow = true;
  scene.add(wall);

  /* ---------- Luzes ---------- */
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-2.5, 9, 12);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 6, bottom: -8, near: 1, far: 30 });
  key.shadow.radius = 14; key.shadow.blurSamples = 20; key.shadow.bias = -0.0004;
  scene.add(key);
  scene.add(new THREE.HemisphereLight(0xdfe8f5, 0x0b1424, 0.45));
  const rim = new THREE.DirectionalLight(0x9fd4ff, 0.9); rim.position.set(7, -2, -3); scene.add(rim);
  const coolLight = new THREE.PointLight(0x7cc8ff, 0, 14, 1.6);   // brilho frio sob o aparelho
  coolLight.position.set(0, -3.2, 2.2);
  scene.add(coolLight);
  const warmLight = new THREE.PointLight(0xff6a3d, 0, 16, 1.6);   // calor antes de ligar
  warmLight.position.set(0, -2.5, 4);
  scene.add(warmLight);

  /* ---------- Partículas de ar frio ---------- */
  const N = window.innerWidth < 720 ? 380 : 900;
  const pos = new Float32Array(N * 3), vel = new Float32Array(N * 3), life = new Float32Array(N), alpha = new Float32Array(N);
  const spawn = (i, initial) => {
    pos[i * 3] = (Math.random() - 0.5) * (W - 1.2);
    pos[i * 3 + 1] = -H / 2 - 0.15;
    pos[i * 3 + 2] = 0.6 + Math.random() * 0.4;
    vel[i * 3] = (Math.random() - 0.5) * 0.25 + pos[i * 3] * 0.04;
    vel[i * 3 + 1] = -(0.9 + Math.random() * 0.9);
    vel[i * 3 + 2] = 0.9 + Math.random() * 1.1;
    life[i] = initial ? Math.random() * 2.4 : 0;
  };
  for (let i = 0; i < N; i++) spawn(i, true);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1));
  const sprite = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,.35)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const pMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { map: { value: sprite }, color: { value: new THREE.Color(0x7cc8ff) }, strength: { value: 0 }, size: { value: 90 * renderer.getPixelRatio() } },
    vertexShader: `attribute float alpha; varying float vA; uniform float size;
      void main(){ vA = alpha; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = size / -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 color; uniform float strength; varying float vA;
      void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(color, t.a * vA * strength); }`,
  });
  const points = new THREE.Points(pGeo, pMat);
  points.frustumCulled = false;
  unit.add(points);

  /* ---------- Enquadramento ---------- */
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // distância para o aparelho ocupar ~78% da largura
    const fitW = (W / (camera.aspect < 1 ? 0.92 : 0.64)) / 2, fitH = 7.4 / 2;
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const distW = fitW / (Math.tan(vFov / 2) * camera.aspect), distH = fitH / Math.tan(vFov / 2);
    const dist = Math.max(distW, distH);
    camera.position.set(dist * 0.06, -dist * 0.3, dist);
    camera.lookAt(0, -0.7, 0);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  /* ---------- Interação ---------- */
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

  let visible = true, raf = 0, last = performance.now(), cpSmooth = readCp();
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }).observe(figure);

  function frame(now) {
    raf = 0;
    if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const cp = readCp();
    cpSmooth = lerp(cpSmooth, cp, reduceMotion ? 1 : 0.12);

    // atitude do aparelho: gira para encarar a pessoa conforme esfria + paralaxe do cursor
    pointer.x = lerp(pointer.x, pointer.tx, 0.05); pointer.y = lerp(pointer.y, pointer.ty, 0.05);
    unit.rotation.y = lerp(-0.42, -0.16, cpSmooth) + pointer.x * 0.14;
    unit.rotation.x = 0.04 + pointer.y * 0.04;
    unit.position.y = reduceMotion ? 0 : Math.sin(now / 1800) * 0.03;

    // aleta abre de 0 a ~55°
    flapPivot.rotation.x = cpSmooth * 0.95;

    // luzes: calor -> frio
    warmLight.intensity = (1 - cpSmooth) * 9;
    coolLight.intensity = cpSmooth * 14;

    // visor
    const t = Math.round(32 - cp * 10);
    if (t !== shownTemp) { shownTemp = t; drawDisplay(t, cp); }

    // partículas
    pMat.uniforms.strength.value = clamp((cpSmooth - 0.08) * 1.4) * 0.8;
    if (pMat.uniforms.strength.value > 0.001 && !reduceMotion) {
      for (let i = 0; i < N; i++) {
        life[i] += dt;
        if (life[i] > 2.4) spawn(i, false);
        const k = i * 3;
        pos[k] += vel[k] * dt; pos[k + 1] += vel[k + 1] * dt; pos[k + 2] += vel[k + 2] * dt;
        vel[k + 1] *= 0.995; vel[k] += Math.sin(now / 700 + i) * 0.002;
        const l = life[i] / 2.4;
        alpha[i] = Math.sin(Math.PI * l) * (0.6 + 0.4 * Math.sin(i));
      }
      pGeo.attributes.position.needsUpdate = true;
      pGeo.attributes.alpha.needsUpdate = true;
    } else if (reduceMotion) {
      for (let i = 0; i < N; i++) alpha[i] = 0.5; pGeo.attributes.alpha.needsUpdate = true;
    }

    renderer.render(scene, camera);
    if (!reduceMotion) raf = requestAnimationFrame(frame);
  }

  const start = () => { figure.classList.add('is-3d'); raf = requestAnimationFrame(frame); };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(start);
  if (reduceMotion) window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(frame); }, { passive: true });
}
