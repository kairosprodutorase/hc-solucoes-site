# Técnicas de transição guiadas por rolagem e scrollytelling (2025–2026)

> Pesquisa feita em 20/11/2026. Fonte principal de verdade: docs oficiais (gsap.com, Lenis no GitHub, web.dev/Chrome Developers, WebKit, Awwwards). Codrops bloqueou fetch direto (HTTP 403), então os dados de Codrops vêm de resultados de busca (título, data, resumo) e devem ser conferidos no artigo.

## 1. Como funcionam e como implementar as técnicas de transição (catálogo)

### Takeaway
Quase todo o "efeito United Carriers" vem de um único padrão: **seção fixada (pin) + timeline GSAP com scrub**, dentro da qual se trocam camadas com máscaras (clip-path/SVG), escala ("zoom-through"), sequências de quadros em canvas e uniforms de shader no WebGL. A continuidade vem de um objeto-fio condutor (o contêiner, no caso deles; para a HC, o ar-condicionado 3D ou o "fluxo de ar") que nunca sai de cena enquanto o fundo muda.

### Cited Findings

**Referência: unitedcarriers.com**
- United Carriers foi Site of the Day no Awwwards em 6/set/2026 (nota SOTD 7,28; Dev Award 7,54, Animations/Transitions 8,00, Accessibility 6,80, WPO 7,60). Créditos: Bearplus e Kenny Ho. Tecnologias listadas: GSAP, Three.js, **Webflow**; tags Transitions, Storytelling, 3D — [Awwwards: United Carriers](https://www.awwwards.com/sites/united-carriers)
- Observação: a busca também retornou um crédito de desenvolvedor "Andrea Biason (Adoratorio)" no snippet da mesma página, o que não bate com o fetch (Bearplus/Kenny Ho). Créditos conflitantes; conferir na página. — [Awwwards](https://www.awwwards.com/sites/united-carriers)

**A. Pin + timeline com scrub (GSAP ScrollTrigger) — a espinha dorsal**
- `pin` fixa um elemento enquanto o trigger está ativo; `pin: true` fixa o próprio trigger. Não anime o elemento fixado diretamente ("will throw off the measurements") — anime os filhos. — [GSAP ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- `pinSpacing` adiciona padding depois do pin para o conteúdo seguinte não ficar coberto; `pinSpacing: false` desliga (útil para sobrepor a próxima cena por cima da atual); `"margin"` usa margem; em containers `display:flex` o padrão é `false`. — [GSAP ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- `scrub: true` amarra o progresso diretamente à rolagem; `scrub: 0.5` (número) = tempo de "alcançar" em segundos, suavizando. — [GSAP ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- `anticipatePin: 1` evita o "flash" de conteúdo não fixado em rolagem rápida (padrão 0). — [GSAP ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- `snap` aceita número, array, função, `"labels"`, `"labelsDirectional"`; direcional por padrão desde 3.8; é cancelado se o usuário interagir. — [GSAP ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- `fastScrollEnd`: se o usuário sai da área mais rápido que 2500 px/s (padrão), a animação vai direto ao fim, evitando sobreposições. — [GSAP ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- `invalidateOnRefresh: true` limpa valores iniciais gravados a cada refresh (resize) — importante para valores calculados por função (ex.: largura da faixa horizontal). — [GSAP ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- `pinReparent` move o elemento para `<body>` durante o pin, resolvendo ancestrais com `transform`/`will-change` que quebram `position: fixed`; é caro e quebra CSS dependente de aninhamento — evitar se possível. — [GSAP ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- `gsap.matchMedia()` é o recomendado para variar a coreografia por tamanho de tela; `ScrollTrigger.matchMedia()` está deprecado. — [GSAP ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)

**B. Rolagem horizontal (estrada que curva, faixa de cenas)**
- Implementação: seção fixada + tween de `x` da faixa interna; para animar coisas *dentro* da faixa use `containerAnimation`. Restrições: a animação do container precisa de `ease: "none"`, e pin/snap não são suportados nesses triggers internos. — [GSAP ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)

**C. Revelações por máscara (clip-path circle/inset/polygon, máscara SVG)**
- Codrops publicou (mar/2026) "SVG Mask Transitions on Scroll with GSAP and ScrollTrigger", com quatro padrões de transição que revelam imagens em tela cheia usando máscaras SVG. — [Codrops (busca)](https://tympanus.net/codrops/?p=111094); resumo também em [Abduzeedo](https://abduzeedo.com/node/89096)
- Case de portfólio (Codrops, mai/2026, Thibault Guignand): GSAP dirige tanto **uniforms de shader** quanto **wipes de clip-path**; um único uniform serve de ponte entre GSAP e WebGL, misturando duas texturas no fragment shader. — [Codrops](https://tympanus.net/codrops/2026/05/06/from-shader-uniforms-to-clip-path-wipes-how-gsap-drives-my-portfolio/)
- Desempenho de clip-path: historicamente não era "fast path" no Chrome (precisa pintar máscara; melhor no Safari) — [Chromium paint-dev](https://groups.google.com/a/chromium.org/g/paint-dev/c/3bXUo0X3C5I). O Chrome anunciou que `background-color` e `clip-path` "will soon join" as propriedades aceleradas por padrão; hoje, por padrão, só `opacity`, `filter` e `transform` são aceleradas (post sem versão definida). — [Chrome Developers: hardware-accelerated animations](https://developer.chrome.com/blog/hardware-accelerated-animations)
- Guia da Motion (2025) lista `transform`, `opacity`, `filter` e `clip-path` como geralmente capazes de animação no compositor, mas alerta que cada navegador tem regras diferentes. — [Motion: performance](https://motion.dev/docs/performance); [tier list](https://motion.dev/magazine/web-animation-performance-tier-list)

**D. "Zoom-through" (entrar no objeto até virar a próxima cena)**
- Codrops (out/2025): "Building a Layered Zoom Scroll Effect with GSAP ScrollSmoother and ScrollTrigger" — combina escala com blur em camadas. — [Codrops (busca)](https://tympanus.net/codrops/2025/10/29/building-a-layered-zoom-scroll-effect-with-gsap-scrollsmoother-and-scrolltrigger/)
- Variante com Flip + Lenis (Codrops 2022, "Large Image to Content Page Transition"): imagem grande se move/escala para o lugar no conteúdo. — [Codrops](https://tympanus.net/codrops/2022/08/03/large-image-to-content-page-transition)
- Thread GSAP resolvida: zoom em texto branco até cobrir a tela e cair na seção seguinte. — [GSAP forum](https://gsap.com/community/forums/topic/40015-help-creating-zoom-in-to-text-transition-in-nextjs/)
- Padrão "Sticky Grid Scroll": "scrolling does not move the scene, it advances time inside it" — a rolagem avança o tempo dentro da cena fixada. — [Codrops (busca)](https://tympanus.net/codrops/?p=106424)

**E. Morph de elemento compartilhado**
- GSAP Flip é a ferramenta usada nos tutoriais Codrops de transição de imagem (2022) e na galeria infinita com Flip (jul/2026). — [Codrops 2022](https://tympanus.net/codrops/2022/08/03/large-image-to-content-page-transition); [Codrops 2026](https://tympanus.net/codrops/2026/07/30/building-an-infinite-gsap-scroll-gallery-with-parallax-and-flip-transitions/)
- MorphSVG (agora gratuito) ganhou opção `smooth` no GSAP 3.14 para adicionar pontos de ancoragem quando o morph padrão fica estranho. — [GSAP blog 3.14](https://gsap.com/blog/3-14/)

**F. Sequência de quadros em canvas vs. vídeo com scrub**
- OPTIKKA (Codrops, 16/out/2025, Zajno): migrou de `<video>` HTML5 para **sequências WebP em canvas** (FFmpeg extrai quadros → WebP qualidade ~80); conjuntos separados por classe de dispositivo (desktop com mais quadros, mobile com menos e outra proporção); pré-carregamento dinâmico de 5 quadros à frente/atrás conforme direção da rolagem; loader concorrente. — [Codrops](https://tympanus.net/codrops/2025/10/16/creating-smooth-scroll-synchronized-animation-for-optikka-from-html5-video-to-frame-sequences/); [Awwwards making-of](https://www.awwwards.com/balancing-scale-and-humanity-behind-the-scenes-of-optikkas-website.html)
- GSAP mantém um helper oficial "Scrub through a `<canvas>` image sequence". — [GSAP helper imageSequenceScrub](https://gsap.com/docs/v3/HelperFunctions/helpers/imageSequenceScrub)
- Vídeo com scrub: o seek precisa decodificar desde o keyframe anterior; keyframes esparsos deixam o scrub "choppy"; no Firefox o MP4 ficou travado mesmo com mais keyframes e foi preciso WebM. — [muffinman.io](https://muffinman.io/blog/scrubbing-videos-using-javascript/); [DEV](https://dev.to/abhishekcghosh/playing-with-video-scrubbing-animations-on-the-web-29k)
- Codificação all-intra (todo quadro é keyframe) elimina custo de seek, mas o arquivo fica ~2× maior que GOP=5; a lib também decodifica MP4 via WebCodecs. — [@mediamonks/fast-image-sequence README](https://cdn.jsdelivr.net/npm/@mediamonks/fast-image-sequence@2.1.0/README.md)
- Não há forma universal de decodificar imagem para `drawImage()` sem bloquear a thread principal em todos os navegadores; muitos requests + repaint gastam GPU/bateria em telas retina. — [Web Performance Calendar](https://calendar.perfplanet.com/?p=3093); [DEV](https://dev.to/pratham7711/how-i-made-a-scroll-scrubbed-video-portfolio-fast-nextjs-15-gsap-canvas-1mj6)

**G. Transições de cena em WebGL (dissolve por shader, wipe com ruído)**
- Three.js tem `RenderTransitionPass` (pass de pós-processamento que recebe duas cenas e duas câmeras para transições). — [three.js docs](https://threejs.org/docs/pages/RenderTransitionPass.html)
- Padrão: renderizar cena A e B em render targets e misturar em um pass full-screen com máscara de ruído (forum three.js: "noisy mask transition"). — [three.js forum](https://discourse.threejs.org/t/post-processing-noisy-mask-transition/90393); [render target transition](https://discourse.threejs.org/t/how-to-create-rendertarget-transition-using-shaders/66324)
- Dissolve por ruído Perlin: pixels com ruído abaixo de um uniform `progress` são descartados, com partículas saindo da borda (Codrops, fev/2025). — [Codrops](https://tympanus.net/codrops/2025/02/17/implementing-a-dissolve-effect-with-shaders-and-particles-in-three-js/)
- Codrops (2025–2026) também tem "How to Animate WebGL Shaders with GSAP: Ripples, Reveals, and Dynamic Blur" (out/2025) e "Cinematic 3D Scroll Experiences with GSAP" (19/nov/2025); e "WebGPU Gommage Effect" (MSDF → poeira/pétalas com TSL). — resultados de busca em [Codrops](https://tympanus.net/codrops/?p=107900); repositório de exemplo [codrops-cinematic-scroll-animations](https://github.com/JosephASG/codrops-cinematic-scroll-animations)

**H. Partículas que se transformam entre formas** — ver Gaps (não encontrei fonte primária 2025–2026 específica além do dissolve com partículas acima).

**I. Cor de fundo / céu interpolados pela rolagem, blend modes** — ver Inferences; nenhuma fonte primária específica coletada.

### Inferences
- **Para a HC**, o fio condutor natural é o ar-condicionado split 3D (já em Three.js) ou um "fluxo de ar"/partícula fria. Uma sequência possível análoga à do contêiner: logo de partículas (hero) → partículas viram fluxo de ar → zoom-through para dentro da evaporadora → câmera recua (dolly-out) revelando a sala → corte por máscara circular para a fachada/condensadora → câmera sobe até o céu de Aracaju (interpolação de céu quente→fresco) → CTA. Cada "→" é uma das técnicas A–G.
- Interpolação de cor de fundo: o mais barato é tweenar uma custom property (`--bg`) no `<body>` dentro da mesma timeline com scrub, ou trocar `background-color` de um único elemento fixo; gradientes de céu: dois/três stops em custom properties registradas com `@property` (para serem interpoláveis) ou um plano no Three.js com shader de gradiente (mesma GPU, sem custo de paint DOM). Animar `background-color` causa paint no main thread até o Chrome concluir a aceleração anunciada.
- Usar um único `<canvas>` WebGL fixo para fundo + objeto 3D e controlar tudo por uniforms (progress, cores, mix) tende a ser mais barato e contínuo que empilhar várias camadas DOM com clip-path/blur.
- `mix-blend-mode: difference` em texto sobre fundo que muda é um truque comum para legibilidade, mas cria camada de composição extra; usar com parcimônia no mobile.
- Para quadros pré-renderizados, AVIF (como a referência) comprime mais que WebP, mas decodificar AVIF custa mais CPU; em Android médio, WebP com menos quadros (OPTIKKA) é a escolha mais segura.

### Gaps
- Não consegui confirmar tecnicamente (código-fonte) como unitedcarriers.com implementa o oceano WebGL e as sequências AVIF; Awwwards lista apenas GSAP/Three.js/Webflow.
- Não encontrei fonte primária 2025–2026 específica para morph de partículas entre formas (técnica comum: amostrar pontos de duas geometrias e interpolar posições em atributo/shader), nem para interpolação de céu/gradiente ou blend modes guiados por rolagem.
- Codrops retornou 403; parâmetros exatos dos artigos (durações, valores de scrub) não verificados.

## 2. Opções nativas: CSS scroll-driven animations e View Transitions (suporte 2025–2026)

### Takeaway
Em nov/2026, **scroll-driven animations** são Baseline "Newly available" (Chrome/Edge 115, Safari 26, Firefox 159 — mudança muito recente) e **View Transitions same-document** são Baseline desde 14/out/2025 (Firefox 144). Servem bem para micro-efeitos e revelações simples que rodam fora da thread principal; a coreografia longa e fixada continua mais prática com GSAP.

### Cited Findings
- `animation-timeline: scroll()` (progresso de rolagem) e `view()` (posição do elemento no viewport) ligam animações CSS/WAAPI à rolagem. Suporte: Chrome 115, Edge 115, **Firefox 159** (habilitado por padrão — out/2026), Safari 26 → Baseline Newly available. — [web.dev: New to the web platform in October (2026)](https://web.dev/blog/web-platform-10-2026)
- Safari 26.0 trouxe as scroll-driven animations; WebKit publicou guia CSS-only. — [WebKit: Safari 26.0](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/); [WebKit guide](https://www.webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/)
- Fontes desatualizadas ainda dizem que Firefox não suporta (snapshot do caniuse, guias do início de 2026) — tratar como obsoletas. — [caniuse](https://caniuse.com/wf-scroll-driven-animations) vs. [web.dev](https://web.dev/blog/web-platform-10-2026)
- Recomendação: detectar com `@supports (animation-timeline: scroll())`; há polyfill para navegadores antigos. — [Chrome: SDA case studies](https://developer.chrome.com/blog/css-ui-ecommerce-sda)
- Benefício de desempenho: handlers JS de scroll são assíncronos e causam jank; Scroll/View Timelines podem rodar fora da thread principal. Tokopedia substituiu JS customizado por SDA. — [Chrome: SDA case studies](https://developer.chrome.com/blog/css-ui-ecommerce-sda); [Chrome: performance case study](https://developer.chrome.com/blog/scroll-animation-performance-case-study)
- View Transitions same-document: Chrome/Edge 111, Safari 18, Firefox 144 (14/out/2025, com `:active-view-transition`, `view-transition-class`, `view-transition-name`) → Baseline Newly available. — [web.dev Baseline](https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available); [web-features explorer](https://web-platform-dx.github.io/web-features-explorer/features/view-transitions)
- Panorama 2025 das View Transitions (Interop 2025 cobre same-document). — [Chrome: View transitions 2025](https://developer.chrome.com/blog/view-transitions-in-2025)

### Inferences
- View Transitions são disparadas por mudança de estado (`document.startViewTransition`), não "scrubadas" pela rolagem; servem para trocas discretas (abrir modal de orçamento, alternar abas de serviços), não para o passeio contínuo.
- Estratégia híbrida para a HC: GSAP para o passeio principal (pins, 3D, sequências); CSS `view()` para fades/reveals de cards e textos fora dos pins (custo quase zero, sem JS), com `@supports` e estado final visível como fallback.
- Atenção: com Lenis, a rolagem continua nativa (posição do documento), então `animation-timeline: scroll()` deve continuar funcionando — mas não verifiquei isso em fonte.

### Gaps
- Não confirmei status de "scroll-triggered animations" (`timeline-trigger`, disparo não-scrub em CSS) em 2026.
- Não verifiquei interação documentada entre Lenis e CSS scroll timelines.

## 3. Licença do GSAP e integração com Lenis

### Takeaway
GSAP é 100% gratuito (inclui SplitText, MorphSVG, ScrollSmoother etc.) desde a versão 3.13 (abr/2025), sob a licença "No Charge" da Webflow; a única restrição relevante é não construir um produto concorrente de animação visual. Lenis integra com ScrollTrigger em 4 linhas via `gsap.ticker`.

### Cited Findings
- Webflow anunciou GSAP "100% free" para todos, incluindo os antigos plugins Club; SplitText e MorphSVG podem ser usados comercialmente sem custo. — [Webflow blog](https://webflow.com/blog/gsap-becomes-free); [GSAP 3.13](https://gsap.com/blog/3-13/)
- Licença padrão "No Charge" vigente desde 30/abr/2025; PI permanece da Webflow; proíbe uso em "Competitive Products" (ferramentas visuais de criação de animação semelhantes ao Webflow). — [GSAP standard license](https://gsap.com/community/standard-license/)
- Plugins vêm no pacote `gsap` normal (`gsap/SplitText`, `gsap/MorphSVGPlugin`); `gsap-trial` foi deprecado. — [npm gsap-trial](https://npmjs.com/package/gsap-trial); [GSAP GitHub](https://github.com/greensock/GSAP)
- 3.14: MorphSVG `smooth` + GSAP Demo Hub; existe também 3.15 (easing direcional adaptativo, `easeReverse`), notas completas não verificadas. — [GSAP blog 3.14](https://gsap.com/blog/3-14/); [GSAP blog](https://gsap.com/blog/)
- Integração Lenis + ScrollTrigger (README oficial):
  ```js
  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  ```
  — [Lenis GitHub](https://github.com/darkroomengineering/lenis)
- Opções Lenis: `lerp` 0.1 (padrão), `duration` 1.2 (ignorado se houver lerp), `autoRaf` false, `syncTouch` false (imita rolagem de toque mantendo sincronia; instável em iOS < 16), `syncTouchLerp` 0.075, `touchInertiaExponent` 1.7, `touchMultiplier` 1, `prevent`, `anchors`. Versão no README: 1.3.x (1.3.27). — [Lenis GitHub](https://github.com/darkroomengineering/lenis)
- Limitações Lenis: sem CSS scroll-snap (usar `lenis/snap`); **limitado a 60 fps no Safari e 30 fps em modo de baixa energia**; não funciona sobre iframes; `position: fixed` pode atrasar no Safari macOS pré-M1. — [Lenis GitHub](https://github.com/darkroomengineering/lenis)

### Inferences
- Para site estático sem build: carregar `gsap.min.js`, `ScrollTrigger.min.js` (e Flip/MorphSVG se usados) e Lenis via CDN como scripts; não usar `autoRaf` quando o loop estiver no `gsap.ticker` (evita dois rAFs).
- Manter `syncTouch: false` (padrão) no celular: rolagem nativa de toque é mais robusta; as cenas scrubadas com `scrub: 0.5–1` já dão suavidade.

### Gaps
- Não li o texto integral da licença; verificar antes de uso comercial (uso em site de cliente é permitido segundo o FAQ).

## 4. Custos em Android intermediário e armadilhas do iOS Safari

### Takeaway
Barato: `transform`/`opacity` (e `filter` no compositor), CSS scroll timelines, um único canvas WebGL com resolução limitada. Caro: blur/backdrop-filter grandes, clip-path complexo animado (paint), muitas camadas grandes, sequências longas de imagens em alta resolução, pós-processamento WebGL em tela cheia. No iOS, o grande problema é a barra de endereço que altera a altura e faz pins "pularem".

### Cited Findings
- Só `opacity`, `filter`, `transform` são aceleradas por padrão no Chrome; `background-color`/`clip-path` anunciadas para "em breve". — [Chrome Developers](https://developer.chrome.com/blog/hardware-accelerated-animations)
- Paint custa mais que composite ("if you paint you also always need to composite"); no mobile é fácil estourar a memória da GPU com camadas grandes e derrubar o site. — [Motion performance tier list](https://motion.dev/magazine/web-animation-performance-tier-list)
- Sequências: desktop com mais quadros, mobile com menos (OPTIKKA); requests pesados + repaint drenam GPU/bateria. — [Codrops OPTIKKA](https://tympanus.net/codrops/2025/10/16/creating-smooth-scroll-synchronized-animation-for-optikka-from-html5-video-to-frame-sequences/); [DEV](https://dev.to/pratham7711/how-i-made-a-scroll-scrubbed-video-portfolio-fast-nextjs-15-gsap-canvas-1mj6)
- `ScrollTrigger.config({ ignoreMobileResize: true })`: em dispositivos só-toque, redimensionamentos verticais (até 25% da altura, i.e. a barra de endereço) não disparam refresh; posições podem ficar levemente imprecisas, mas evita saltos visuais (desde 3.10). — [GSAP config()](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.config()/)
- `autoRefreshEvents` padrão: `"visibilitychange,DOMContentLoaded,load,resize"`. — [GSAP config()](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.config()/)
- `ScrollTrigger.normalizeScroll()` força a rolagem na thread JS e ajuda a impedir que a barra de endereço apareça/suma — [GSAP docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.normalizeScroll()); porém usuários relatam "jumpiness" em iPhones novos e quebra em antigos — [GSAP forum #36502](https://gsap.com/community/forums/topic/36502-scrolltriggernormalizescroll-doesnt-work-on-some-ios-devices/). Não combina com Lenis (ambos assumem controle da rolagem) — ver Inferences.
- Unidades de viewport no iOS: `dvh` só atualiza depois que a rolagem termina e a barra colapsa (jank) — [WebKit bug 266835](https://bugs.webkit.org/show_bug.cgi?id=266835); `svh`/`lvh` incorretos em navegadores de terceiros no iOS — [WebKit bug 279998](https://bugs.webkit.org/show_bug.cgi?id=279998); trocar para `svh` não resolveu pin com `100dvh` para um usuário — [GSAP forum #40372](https://gsap.com/community/forums/topic/40372-scrolltrigger-pin-with-dvh-css-units/)
- Problemas relatados em iPhone em modo economia de bateria — [GSAP forum #39457](https://gsap.com/community/forums/topic/39457-persistent-issue-with-gsap-scroll-trigger-on-iphone-in-battery-save-mode/); Lenis fica limitado a 30 fps em low power — [Lenis](https://github.com/darkroomengineering/lenis)
- Saltos de página ao sair de seções fixadas no mobile são queixa recorrente — [GSAP forum #37244](https://gsap.com/community/forums/topic/37244-page-jump-on-mobile-after-scrolling-past-scrolltrigger-pinned-section/); [#31638](https://greensock.com/forums/topic/31638-long-page-with-scrolltrigger-jumps-on-ios-when-scrolling-ends/)

### Inferences (recomendações práticas)
- Seções fixadas com altura em `svh` (ou altura em px medida uma vez no load) + `ignoreMobileResize: true`; não usar `dvh` em elementos fixados; escolher Lenis **ou** normalizeScroll, nunca os dois.
- WebGL no Android médio: `renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))` (ou 1 no mobile), sem pós-processamento full-screen em cada quadro; fazer dissolves de cena com um shader de mix só durante a transição; pausar render quando o canvas está fora da tela.
- Partículas do hero: reduzir contagem no mobile e, se possível, mover a animação para shader (posições interpoladas na GPU) em vez de atualizar arrays em JS por quadro.
- Sequências de quadros: ≤ ~60–90 quadros no mobile, ~720p, WebP; pré-carregar por janela direcional (estilo OPTIKKA); considerar substituir por cena 3D real quando o objeto já existe em Three.js (custo de download zero).
- Evitar `backdrop-filter`/`filter: blur()` grandes animados sobre a página inteira no mobile; preferir blur pré-renderizado ou no shader.
- Respeitar `prefers-reduced-motion`: desligar scrub/pin pesados e mostrar cenas estáticas (melhora também a nota de acessibilidade — United Carriers tirou 6,80 nela).

### Gaps
- Não encontrei benchmarks medidos (fps, tempo de main thread) para clip-path, blur ou sequências em Androids específicos; recomendações acima são inferências a partir de docs gerais.
- Status atual (nov/2026) da aceleração de `clip-path`/`background-color` no Chrome não confirmado (post sem versão).
