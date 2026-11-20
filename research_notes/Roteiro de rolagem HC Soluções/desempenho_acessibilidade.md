# Desempenho, acessibilidade e restrições mobile para sites de storytelling por rolagem (2025–2026)

Escopo: limites concretos e práticas para manter rápido, acessível e usável no celular um site de página única com rolagem fixada ("pinned journey"), Lenis, Three.js, canvas e Web Audio. O público é sobretudo Android intermediário em 4G (Aracaju/SE). Pesquisa feita em novembro de 2026.

## 1. Core Web Vitals: limites e como animação de rolagem, smooth scroll, WebGL e canvas os afetam

### Takeaway
As metas "boas" continuam LCP ≤ 2,5 s, INP ≤ 200 ms e CLS ≤ 0,1, medidas no percentil 75 e separadas entre mobile e desktop. Canvas e WebGL não entram no cálculo do LCP, então o LCP precisa vir de um texto ou imagem real. Animações feitas só com `transform` não geram CLS. Já o INP sofre com qualquer tarefa longa (> 50 ms) no main thread, como inicializar cenas, decodificar quadros ou rodar loops de partículas pesados.

### Cited Findings
- Metas "boas": LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1. A página passa quando atinge as três no percentil 75 dos carregamentos, com mobile e desktop separados — [web.dev: Web Vitals](https://web.dev/articles/vitals)
- O LCP é "ruim" acima de 4,0 s. Os elementos considerados são `<img>`, `<image>` dentro de SVG, `<video>` (poster), elementos com `background-image: url()` e blocos com texto. Canvas e WebGL não estão na lista — [web.dev: LCP](https://web.dev/articles/lcp)
- O Chromium exclui do LCP elementos com `opacity: 0` e imagens de "baixa entropia" (placeholders) — [web.dev: LCP](https://web.dev/articles/lcp)
- O INP é "ruim" acima de 500 ms. Tem três fases: atraso de entrada (o main thread ocupado com parse/compile/execução de scripts), processamento dos callbacks e atraso de apresentação, que cresce com o tamanho do DOM e com HTML renderizado via JS. O artigo recomenda `content-visibility` para pular a renderização do que está fora da tela e manter os callbacks mínimos, adiando o trabalho não crítico com `requestAnimationFrame` + `setTimeout` — [web.dev: Optimize INP](https://web.dev/articles/optimize-inp)
- "Any task that takes longer than 50 milliseconds is a long task." Para tarefas visíveis ao usuário, a recomendação é ceder o main thread com `scheduler.yield()`, suportado no Chrome/Edge 129+ e no Firefox 142+ mas não no Safari (precisa de fallback). `isInputPending()` não é mais recomendado — [web.dev: Optimize long tasks](https://web.dev/articles/optimize-long-tasks)
- CLS é "bom" até 0,1 e "ruim" acima de 0,25. `transform` (translate/scale) anima sem causar layout shift. Rolagem, arraste e pinça **não** contam como "recent input", então um deslocamento de layout causado durante a rolagem conta para o CLS. O CLS é a maior janela de sessão (shifts com intervalo < 1 s, janela de no máximo 5 s) — [web.dev: CLS](https://web.dev/articles/cls)
- Em 2025, 48% das origens mobile passavam nas três CWV, contra 44% em 2024 e 36% em 2023 (Web Almanac 2025) — [HTTP Archive Web Almanac 2025: Performance](https://almanac.httparchive.org/en/2025/performance)
- Para inicializar cenas perto do viewport, o Google recomenda IntersectionObserver ou lazy-loading nativo para imagens e iframes, e desaconselha lazy-load do que está visível na abertura — [Google Search Central: lazy-loading](https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading)

### Inferences
- Como canvas e WebGL não contam para o LCP, o hero de partículas não "segura" o LCP. O LCP será o maior texto (H1) ou imagem visível. Por isso o H1 e o CTA devem estar no HTML estático, visíveis desde o primeiro paint e sem `opacity:0` aguardando animação de entrada (elementos com opacidade 0 são ignorados, o que adia o LCP para quando aparecerem).
- Mudar `height`, `top` ou `margin` no pin, ou o spacer do ScrollTrigger recalculando durante a rolagem, entra no CLS porque rolagem não é "input". Reserve as alturas dos pin-spacers no CSS e anime só `transform`/`opacity`.
- Para o INP, os riscos são: (a) inicialização do Three.js, das partículas e do decoder de quadros durante o carregamento, que aumenta o atraso de entrada no primeiro toque (ex.: botão do WhatsApp); (b) loops rAF de 2.800 partículas + vento + 3D rodando ao mesmo tempo. Na prática: iniciar cada cena só quando estiver a cerca de 1 viewport de distância (IntersectionObserver com `rootMargin`), pausar loops fora da tela e dividir a inicialização em pedaços com `scheduler.yield()` (fallback `setTimeout`).
- Lenis não piora o LCP diretamente, mas roda um rAF permanente. No mobile, o padrão do Lenis já é usar a rolagem nativa no toque (ver seção 3).

### Gaps
- Não encontrei dados públicos de aprovação em CWV específicos do Brasil ou de Sergipe. O CrUX por país exige BigQuery ou a CrUX API, e o dashboard CrUX foi anunciado como descontinuado.
- Não achei estudo quantitativo sobre o impacto de Lenis ou GSAP ScrollTrigger no INP de campo.

## 2. Custo comparado das técnicas e limites de GPU, memória e bateria

### Takeaway
Do mais barato ao mais caro: `transform`/`opacity` (compositor) → `clip-path`/`filter` (geralmente repaint; `blur` é especialmente caro) → canvas 2D → WebGL. Sequências de quadros consomem memória, porque cada quadro é decodificado como bitmap completo, e vídeo scrubbed exige reencodar com keyframes densos, o que aumenta muito o arquivo. Não existe limite oficial de memória de GPU no iOS Safari. Relatos indicam cerca de 256 MB de memória total de canvas e crashes por textura grande.

### Cited Findings
- "Where possible, restrict animations to `opacity` and `transform`." Evite propriedades que disparam layout ou paint. Use `will-change` com moderação (cria camadas, o que traz outros custos), de preferência adicionado por JS logo antes da mudança e removido depois — [web.dev: animations guide](https://web.dev/articles/animations-guide)
- A orientação de performance do GSAP também prioriza transform/opacity e fixar ("pin") só o necessário, porque pin promove o elemento a camada — resumo de [GSAP ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger) e de discussões no fórum ([ex.](https://gsap.com/community/forums/topic/38741-scrolltrigger-on-mobile-is-jerky)). As dicas de fórum são anedóticas.
- Sequência de quadros: um desenvolvedor esgotou a memória no 73º de ~200 PNGs decodificados. Uma biblioteca de scroll-frames afirma que mais de 200 quadros degradam a performance, sobretudo em aparelhos fracos, e sugere manter cada sequência abaixo de ~2 MB. O case Codrops/OPTIKKA (out/2025) trocou vídeo por quadros e pré-carrega uma janela de ~5 quadros na direção da rolagem — síntese de busca: [Codrops OPTIKKA](https://tympanus.net/codrops/2025/10/16/creating-smooth-scroll-synchronized-animation-for-optikka-from-html5-video-to-frame-sequences/) (403 ao buscar o texto completo), [Scroll-Frames: image format support](https://olivier3lanc.github.io/Scroll-Frames/image-format-support.html). Fontes de blog: tratar os números como ordem de grandeza.
- AVIF animado tem decodificação muito lenta no Safari (relato no fórum da Apple, mesmo num Mac M4) — [Apple Developer Forums](https://developer.apple.com/forums/thread/772356). A WebCodecs não decodifica sequências de imagem por partes, então é preciso guardar todos os quadros decodificados — [WICG discourse](https://discourse.wicg.io/t/proposal-imagedecoder-api-extension-for-webcodecs/4418)
- Vídeo scrubbed: com keyframes a cada poucos segundos, `currentTime` só "pousa" em poucos quadros. `-g 1` (todo quadro I-frame) dá precisão, mas o arquivo vai de ~1–2 MB para ~8 MB em 1280 px — [hontran.dev](https://www.hontran.dev/blog/scroll-scrubbed-video-stutters-fix). Há relato de arquivo all-intra que não tocava num Galaxy Note 3 enquanto `-g 2` funcionava ([Qualcomm forum](https://developer.qualcomm.com/forum/qdn-forums/mobile-technologies/multimedia-optimization-hexagon-sdk/video/27161)). Outra referência sugere `-g 10` como ponto de partida ([muffinman.io](https://muffinman.io/blog/scrubbing-videos-using-javascript/)). Bug do WebKit: seek reverso em arquivos com poucos keyframes volta a 0 ([WebKit 285761](https://bugs.webkit.org/show_bug.cgi?id=285761))
- WebGL no iOS: relato do erro "Total canvas memory use exceeds the maximum limit (256mb)" ([Babylon.js forum](https://forum.babylonjs.com/t/ios-cannot-open-an-app-on-ios-browsers-memory-limit/40698)). O limite de memória do Safari iOS é um orçamento do navegador, não a RAM física, e Androids semelhantes aguentam várias vezes mais ([WebKit bug 228208](https://bugs.webkit.org/show_bug.cgi?id=228208)). Texturas grandes causam texturas pretas ou crash e reload em loop ([WebKit 232357](https://bugs.webkit.org/show_bug.cgi?id=232357)). Mitigações relatadas: texturas de no máximo 1k–2k, atlas único, `antialias:false`, `powerPreference:'default'` ([three.js discourse](https://discourse.threejs.org/t/issues-with-complex-scene-on-ios/46356))
- O Safari limita o rAF a 60 fps e cai para 30 fps no modo de pouca energia — [Lenis README](https://github.com/darkroomengineering/lenis)

### Inferences
- **Memória de quadros (cálculo próprio):** um quadro decodificado ocupa largura × altura × 4 bytes, seja AVIF, WebP ou JPG. Em 1080×1920 são ~8,3 MB por quadro, e 120 quadros dão ~1 GB. Em 720×1280, ~3,7 MB por quadro (~440 MB para 120). O peso em rede (AVIF ~20–60 KB/quadro) engana: o gargalo é a RAM decodificada. Recomendação: até 60–90 quadros por cena no mobile, resolução ≤ 720 px de largura, cache em janela deslizante (só ±N quadros decodificados via `createImageBitmap` e `.close()`), ou vídeo curto com `-g` baixo como alternativa.
- **Ordem prática para a HC:** transições de tela com `transform`/`opacity`/cor de fundo (custo mínimo) > `clip-path` simples (inset/circle) para revelações > canvas 2D já existente > uma única instância WebGL compartilhada. Evitar `filter: blur()` animado em telas cheias e mais de um contexto WebGL. Reaproveitar o renderer Three.js existente para as cenas 3D da jornada, em vez de criar outro.
- **Limitar o DPR** do canvas e do WebGL a 1,5–2 no mobile, porque o custo de pixels cresce com o quadrado do DPR. Pausar o loop quando `document.hidden` ou quando a cena sai do viewport, para reduzir aquecimento e consumo de bateria.

### Gaps
- Não encontrei estudo confiável e recente medindo bateria ou aquecimento de WebGL contra canvas 2D em Androids intermediários.
- Não há especificação pública do limite de memória de GPU para Chrome Android. Também não encontrei benchmark oficial de `clip-path`/`filter` em mobile, e o artigo da web.dev não cobre essas duas propriedades.

## 3. Especificidades mobile: barra de endereço, svh/dvh, pinning, Lenis no toque, perfil de aparelhos no Brasil

### Takeaway
Use `svh` (ou `lvh`) para seções fixadas e evite `100vh` e `dvh` animado. Trate o redimensionamento causado pela barra de endereço (ScrollTrigger `ignoreMobileResize`). No toque, mantenha a rolagem nativa do Lenis (`syncTouch:false`, o padrão). No Brasil, ~74% do tráfego mobile é Android, com Samsung, Motorola e Xiaomi somando ~64% dos acessos: o orçamento deve ser pensado para Android intermediário.

### Cited Findings
- `100vh` ignora as barras do navegador: no carregamento fica alto demais e o conteúdo vaza para baixo. `svh` = viewport com as barras expandidas (sempre cabe), `lvh` = viewport com as barras recolhidas, `dvh` = varia junto com elas. Os valores dinâmicos **não** são atualizados a 60 fps (o navegador faz throttle ou debounce). Suporte: Chrome/Edge 108, Firefox 101, Safari 15.4 — [web.dev: viewport units](https://web.dev/blog/viewport-units)
- Lenis: `syncTouch` vem `false` por padrão. Ativá-lo imita a inércia do toque via JS e "can be unstable on iOS<16". `smoothWheel:true` é o padrão. `respectReducedMotion` vem `true` (força `lerp=1`). Não suporta CSS scroll-snap (usar `lenis/snap`) nem rolagem sobre iframes. Elementos com rolagem própria precisam de `data-lenis-prevent` ou `allowNestedScroll`. Integração com GSAP: `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t=>lenis.raf(t*1000))`, `gsap.ticker.lagSmoothing(0)` — [Lenis README](https://github.com/darkroomengineering/lenis)
- ScrollTrigger no mobile (fóruns GSAP, anedótico): `ScrollTrigger.config({ ignoreMobileResize: true })` evita o refresh quando a barra de endereço muda e reduz "saltos" em pins. `anticipatePin: 1` costuma bastar. `normalizeScroll` corrige jank mas pode quebrar elementos fixos e anular o smooth. A equipe GSAP costuma recomendar evitar smooth scroll no mobile. Os relatos de jank vêm sobretudo do iOS Safari, inclusive no modo bateria — [GSAP forum: normalizeScroll/ignoreMobileResize](https://greensock.com/forums/topic/35475-scrolltriggerscrollsmoother-normalizescroll-ignoremobileresize/), [GSAP forum: iPhone battery save](https://gsap.com/community/forums/topic/39457-persistent-issue-with-gsap-scroll-trigger-on-iphone-in-battery-save-mode/), [GSAP forum: iPhone pinned + heavy images](https://gsap.com/community/forums/topic/45355-iphone-scroll-performance-issues-%E2%80%93-pinned-scrolltrigger-motionpath-heavy-images/)
- Discussão no repositório do Lenis sobre problemas de performance com Lenis + GSAP + R3F no mobile — [Lenis discussion #431](https://github.com/darkroomengineering/lenis/discussions/431)
- Brasil, outubro de 2026 (StatCounter, mobile): Android 73,76%, iOS 26,23% — [StatCounter OS Brasil](https://gs.statcounter.com/os-market-share/mobile/brazil). Fabricantes: Samsung 31,68%, Apple 26,23%, Motorola 16,18%, Xiaomi 15,88%, desconhecido 6,24%, Oppo 1,33% — [StatCounter vendor Brasil](https://gs.statcounter.com/vendor-market-share/mobile/brazil)

### Inferences
- A participação do iOS (~26%) parece alta para a base instalada brasileira. O StatCounter mede pageviews, e usuários de iPhone navegam mais, então para um público de bairro em Aracaju a fatia Android tende a ser maior. Fica a confirmar com o analytics do próprio site.
- Os modelos típicos (Galaxy A, Moto G, Redmi) têm GPUs intermediárias e 4–8 GB de RAM. Convém definir um "modo leve" por heurística (`navigator.deviceMemory <= 4`, `hardwareConcurrency <= 4`, `navigator.connection.saveData`, ou fps medido nos primeiros segundos) que reduza partículas (ex.: 2.800 → ~800), desligue a camada de vento ou troque a sequência de quadros por imagens estáticas com crossfade. `deviceMemory` não existe no Safari, onde se cai no padrão.
- Seções de rolagem horizontal fixadas no celular confundem (gesto vertical move conteúdo lateral) e somam altura de pin-spacer. É preferível empilhar verticalmente no mobile (`gsap.matchMedia()` por breakpoint) e restringir o horizontal ao desktop.
- Pins altos aumentam o tempo até o CTA. Mantenha cada cena fixada curta no mobile (ex.: ≤ 1,5–2 alturas de tela) e o botão do WhatsApp fixo e sempre acessível fora do fluxo do pin.

### Gaps
- Não encontrei dado público de modelos específicos mais usados no Nordeste ou em Sergipe, nem a parcela de 4G contra 5G em Aracaju.
- Os números de ScrollTrigger mobile vêm de fóruns, não de documentação oficial de "melhores práticas".

## 4. Acessibilidade: critérios WCAG 2.2 de movimento, reduced-motion, scrolljacking, teclado e leitor de tela

### Takeaway
Três critérios pesam aqui. O 2.2.2 (nível A) exige pausar, parar ou ocultar animações automáticas com mais de 5 s em paralelo ao conteúdo, o que inclui partículas e vento de fundo. O 2.3.1 (nível A) proíbe mais de 3 flashes por segundo, e trocas de cor em tela cheia entram nele. O 2.3.3 (AAA) pede que animações disparadas pela rolagem possam ser desligadas. `prefers-reduced-motion` é a técnica oficial (C39/SCR40). Scrolljacking costuma quebrar o uso com teclado e leitor de tela.

### Cited Findings
- 2.3.3 Animation from Interactions (AAA): o movimento disparado por interação deve poder ser desativado, salvo se essencial. Cobre explicitamente parallax e movimento disparado por rolagem além do simples deslocamento do conteúdo. Técnicas: C39 (CSS `prefers-reduced-motion`), SCR40 (o mesmo em JS) e controle próprio do site. Movimento não essencial pode causar tontura, náusea e dor de cabeça em pessoas com distúrbios vestibulares, às vezes exigindo repouso — [W3C Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- 2.2.2 Pause, Stop, Hide (A): conteúdo que se move, pisca ou rola, inicia automaticamente, dura mais de 5 s e aparece junto de outro conteúdo precisa de mecanismo de pausar, parar ou ocultar, salvo se essencial. O mecanismo não pode depender de foco ou hover. Vale para todo conteúdo da página (requisito de não interferência) — [W3C Understanding 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
- 2.3.1 Three Flashes (A): nada pode piscar mais de 3 vezes por segundo acima dos limiares geral (variação de luminância relativa ≥ 10% com o estado escuro < 0,80) ou de vermelho saturado. Há isenção para área pequena (~341×256 px em 1024×768, ou 87.296 px CSS), mas uma mudança em tela cheia excede a área e precisa ficar em ≤ 3 por segundo ou abaixo dos limiares — [W3C Understanding 2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html)
- Lenis respeita `prefers-reduced-motion` por padrão (lerp 1, rolagem programática instantânea) e não recomenda desativar esse comportamento — [Lenis README](https://github.com/darkroomengineering/lenis)
- Scrolljacking (sobrescrever a rolagem vertical normal) dificulta a navegação para quem usa tecnologia assistiva — [Webflow accessibility checklist](https://webflow.com/accessibility/checklist/task/avoid-scrolljacking). Teste com NVDA em site com scrolljacking encontrou falhas de teclado e leitor de tela — [SitePoint](https://www.sitepoint.com/scrolljacking-accessibility/)
- A newsletter da Smashing (jun/2025) reforça que ferramentas automáticas não pegam esses problemas e que é preciso testar manualmente com leitor de tela — [Smashing Newsletter #513](https://www.smashingmagazine.com/the-smashing-newsletter/smashing-newsletter-issue-513/)

### Inferences
- **Padrão recomendado:** com `@media (prefers-reduced-motion: reduce)` e `matchMedia` no JS, (1) não fixar cenas e mostrar cada cena como seção estática empilhada; (2) partículas e vento num quadro estático; (3) trocas de cor sem animação ou com crossfade curto; (4) sem parallax. Além disso, um botão visível "Pausar animações" para atender ao 2.2.2 em quem não ativou a preferência no sistema (o hero de partículas e o vento são automáticos e duram mais de 5 s). O Web Audio nunca deve tocar automaticamente.
- **Teclado e leitor de tela:** o texto de cada cena deve estar no DOM em ordem lógica, com headings reais (h2/h3), e não só desenhado em canvas. O texto não deve ficar `visibility:hidden`/`display:none` até a animação, e sim com opacidade/transform, garantindo que o foco ou a navegação por leitor faça o conteúdo aparecer (por exemplo, `focusin` que rola até a cena e revela o texto). Canvas decorativos com `aria-hidden="true"`. Links de "pular animação" e de âncora para "Serviços" e "Contato".
- **Flashes:** transições de cor de fundo em tela cheia (ex.: branco → azul-escuro) devem ser lentas, sem alternâncias repetidas rápidas e sem efeitos estroboscópicos, mesmo quando o usuário rola rápido. Vale verificar com a ferramenta PEAT ou equivalente se houver sequência de quadros ou vídeo.

### Gaps
- Não encontrei artigo da Smashing Magazine ou da A11y Project de 2025–2026 dedicado especificamente a pinned scrollytelling. A orientação acima combina os documentos da W3C com fontes secundárias.

## 5. SEO em sites one-page de scrollytelling com conteúdo revelado por animação

### Takeaway
O Googlebot não rola nem clica, então todo conteúdo importante (serviços, bairros, telefone, endereço) precisa estar no HTML inicial e não pode depender de evento de rolagem para ser inserido. Texto oculto só por opacidade ou transform para animar continua no DOM. Conteúdo injetado via JS pode ser indexado mais tarde.

### Cited Findings
- "Google Search does not interact with your page". O lazy-load deve carregar o conteúdo quando ele estiver visível no viewport, sem depender de rolagem ou clique, usando IntersectionObserver ou lazy-load nativo. Infinite scroll precisa de URLs paginadas. A verificação recomendada é a URL Inspection Tool do Search Console — [Google Search Central: lazy-loading](https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading)
- Googlebot não rola (Gary Illyes, PubCon 2018; Martin Splitt). `<noscript>` não é confiável para conteúdo de texto. Conteúdo adicionado por JS pode demorar mais a ser indexado — [Oncrawl](https://www.oncrawl.com/technical-seo/lazy-loading-crawlability-indexing/), [Search Engine Roundtable](https://www.seroundtable.com/google-scroll-events-or-click-to-load-more-buttons-31387.html). São fontes de 2018–2021, mas coerentes com a documentação atual do Google.

### Inferences
- Para a HC Soluções: todo o texto da jornada (H1 com "ar-condicionado em Aracaju", serviços, áreas atendidas, perguntas frequentes) escrito no `index.html` estático, e a animação apenas "coreografa" elementos que já existem. Nada deve ser montado por JS a partir de JSON.
- Sequências de quadros e cenas WebGL não carregam significado para o Google. Use `alt` descritivo na imagem estática de fallback e texto adjacente.
- Uma página única concentra todas as palavras-chave numa URL. Para busca local, pesam mais o Perfil da Empresa no Google, os dados estruturados `LocalBusiness`/`HVACBusiness` (NAP: nome, endereço e telefone) e a velocidade no mobile do que os efeitos. Talvez valha criar páginas separadas por serviço ou bairro no futuro (fora do escopo desta pesquisa).
- Um bom LCP e INP no mobile ajudam a experiência na página, e animações pesadas que atrasam o CTA do WhatsApp prejudicam diretamente a meta de conversão.

### Gaps
- Não encontrei declaração recente (2025–2026) do Google especificamente sobre sites de scrollytelling ou conteúdo com `opacity:0` aguardando animação. A conclusão de que "conteúdo no DOM com opacidade 0 é indexado" é inferência, baseada no fato de o Google renderizar o DOM, e não foi confirmada por fonte oficial.
- Não pesquisei a fundo a relação entre CWV e ranqueamento local (fora do escopo principal).
