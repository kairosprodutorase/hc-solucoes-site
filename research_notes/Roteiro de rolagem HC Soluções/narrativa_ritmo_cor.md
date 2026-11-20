# Narrativa, ritmo e roteiro de cor para storytelling por rolagem (scrollytelling)

> Notas de pesquisa para replanejar o storyboard de rolagem do site one-page da HC Soluções ("do calor ao conforto"). Os itens marcados com fonte vêm de fontes verificadas. Tudo o que é dedução minha está em "Inferências". O que não encontrei com evidência confiável está em "Lacunas".

## 1. Estruturas narrativas para scrollytelling e como adaptá-las a uma landing page de serviço com objetivo de conversão

### Takeaway
A estrutura mais citada na literatura de visualização narrativa é a "taça de Martini" (Segel & Heer, 2010). Primeiro vem uma haste estreita e linear conduzida pelo autor; depois, uma boca larga que o leitor explora sozinho. Isso se encaixa bem numa landing page: um trecho narrativo curto e guiado (calor → resfriamento → conforto), seguido de uma área aberta e escaneável (serviços, provas, contato). Na prática editorial (Pudding, NYT, ProPublica), o recado é usar a rolagem narrativa só onde a transição tem significado, e mantê-la curta.

### Cited Findings
- Segel e Heer (2010, "Narrative Visualization: Telling Stories with Data") analisaram 58 exemplos, identificaram 7 gêneros de visualização narrativa e 3 padrões de interação: a taça de Martini, o slideshow interativo e a história com drill-down — [Segel & Heer, PDF](https://homes.cs.washington.edu/~jheer/files/narrative.pdf); resumo em [Microsoft Research TR 2016-14](https://microsoft.com/en-us/research/wp-content/uploads/2016/04/MSR-TR-2016-14-Storytelling-Techniques.pdf)
- A taça de Martini começa com uma "haste" estreita, guiada pelo autor, e se abre numa parte larga em que o leitor explora livremente. Existe também uma variante "invertida", que começa pela exploração e depois apresenta as conclusões do autor — [EU Data Visualisation Guide](https://data.europa.eu/apps/data-visualisation-guide/martini-glass-story-structure); [Quanthub](https://quanthub.com/martini-glass-visual-narrative-structures)
- McKenna, Henry Riche, Lee, Boy e Meyer (EuroVis 2017) analisaram 80 histórias publicadas e identificaram 7 "fatores de fluxo": tipo de navegação, nível de controle, progresso da navegação, layout, papel da visualização, progressão da história e feedback da navegação — [Utah VDL](https://vdl.sci.utah.edu/publications/2017_eurovis_narrative-flow/)
- No estudo crowdsourced do mesmo trabalho (240 participantes), os visuais e o feedback de navegação (transições animadas vs. estáticas) afetaram o engajamento. O nível de controle (navegação discreta vs. contínua) talvez não tenha afetado — [Microsoft Research](https://www.microsoft.com/en-us/research/publication/visual-narrative-flow-exploring-factors-shaping-data-visualization-story-reading-experiences/)
- David Sleight (ProPublica): o scrollytelling funciona melhor "quando precisamos criar um momento de pausa" ou mostrar mudança ao longo do tempo e comparações — [Nightingale, Bill Shander, 2020/2021](https://nightingaledvs.com/the-past-present-and-future-of-scrollytelling/)
- Segundo relatos secundários da palestra "Why We Are Doing Fewer Interactives" (Malofiej 2016), Archie Tse (NYT) disse que fazer interativos funcionarem em todas as plataformas é caro, que o jornal ainda os faz e que "a barra agora é MUITO alta". O NYT migrou de muitos gráficos pequenos para menos histórias visuais independentes. Atenção: são fontes secundárias e informais — [The Mario Blog](https://garciamedia.com/?p=2509); [Storybench](https://www.storybench.org/?p=4271)
- Russell Goldenberg (The Pudding) recomenda manter a rolagem com transições "se as transições forem realmente significativas, e não só algo para chamar atenção", e diz preferir "curto e direto": "alguns passos para prender o usuário, passar a mensagem e sair" — [The Pudding, Responsive scrollytelling best practices](https://pudding.cool/process/responsive-scrollytelling/)
- Críticas ao formato: Robert Kosara ("The Scrollytelling Scourge", 2016) aponta scrolljacking, interações estranhas, forma que não serve à história, bugs e distração. Jared Spool chama o formato de "gambiarra" que transfere esforço para o usuário — [Nightingale](https://nightingaledvs.com/the-past-present-and-future-of-scrollytelling/)
- Regra do pico-fim (Kahneman, Fredrickson; estudo de 1993): as pessoas julgam uma experiência principalmente pelo momento mais intenso e pelo final, e não pela média, com "negligência da duração". Momentos de frustração também contam como picos negativos. A regra vale para experiências com começo e fim definidos — [NN/g, Peak-End Rule](https://www.nngroup.com/articles/peak-end-rule/); [Laws of UX](https://lawsofux.com/peak-end-rule/); [Wikipedia](https://wikipedia.com/wiki/Peak_end_rule)

### Inferências
- **Mapeamento sugerido (Martini + três atos + problema→solução→prova→ação):**
  - *Haste guiada (atos 1–2, autor no controle):* 1) Hero com promessa e CTA visível (calor de Aracaju, problema); 2) Tensão/problema (calor, conta alta, equipamento falhando); 3) Virada/solução (o resfriamento entra em cena; é o set piece principal e o "pico" da regra pico-fim).
  - *Boca aberta (ato 3, leitor no controle):* 4) Conforto a 22 °C (resolução emocional); 5) Serviços/como funciona (escaneável, sem animação presa); 6) Prova (clientes, marcas, números, área atendida); 7) CTA final forte (WhatsApp/orçamento), que é o "fim" da regra pico-fim.
- O fio "terra → mar → céu" da United Carriers equivale aqui a "calor → ar em movimento → conforto". Cada ato precisa de um cenário visual próprio e reconhecível.
- Pela evidência do Pudding/NYT, só a virada calor→frio justifica uma transição presa à rolagem. O resto deve rolar normalmente.
- Como o estudo de 2017 mostrou que feedback e transições afetam o engajamento, vale investir na qualidade da transição principal, e não na quantidade de efeitos.

### Lacunas
- Não encontrei estudo empírico que compare a conversão de landing pages comerciais com e sem estrutura narrativa de scrollytelling. A evidência vem do jornalismo de dados e da UX geral.
- Não consegui ler o texto original dos slides de Archie Tse.
- Não pesquisei a jornada do herói / StoryBrand com fontes primárias. Fica como enquadramento opinativo, sem evidência citada.

## 2. Ritmo: alternância entre "set pieces" e momentos calmos, duração das seções presas, fadiga, dados de rolagem e atenção

### Takeaway
A atenção cai rápido ao longo da página. Segundo a NN/g (2018), 57% do tempo de visualização fica na primeira tela e 74% nas duas primeiras. Por isso, a proposta de valor e o CTA precisam estar no topo. O scrolljacking desorienta a maioria dos usuários em teste. A NN/g recomenda usá-lo pouco, de forma curta, intercalado com rolagem normal, sem texto importante dentro, abaixo da dobra e, de preferência, sem ele no mobile.

### Cited Findings
- Estudo de eye tracking da NN/g (abril de 2018; 120 participantes; mais de 130.000 fixações; tela 1920×1080): 57% do tempo de visualização acima da dobra (contra 80% em 2010), 74% nas duas primeiras telas, cerca de 17% na segunda tela e 81% nas três primeiras. Em sites em geral, mais de 42% do tempo fica nos 20% superiores da página e mais de 65% nos 40% superiores — [NN/g, Scrolling and Attention](https://www.nngroup.com/articles/scrolling-and-attention/)
- Recomendações da mesma pesquisa: reservar o topo para o conteúdo prioritário e manter os CTAs principais acima da dobra, usar cabeçalhos consistentes, evitar "falsos fundos" com sinais como texto cortado na borda, e testar o comprimento ideal da página com usuários — [NN/g](https://www.nngroup.com/articles/scrolling-and-attention/)
- Scrolljacking (NN/g, Sara Paul, agosto de 2023): em testes, a maioria dos participantes ficou ao menos levemente desorientada. Todos se desorientaram num scrolljack longo (Crypto.com). Um usuário disse que um gesto inteiro "não moveu nada" e que sairia (Reachdesk). A rolagem horizontal fez usuários se perderem (Therabody). Um scrolljack curto e funcional foi bem recebido (BBC News), mas alguns acharam que a página tinha acabado. Usuários focados em tarefa são os menos pacientes — [NN/g, Scrolljacking 101](https://www.nngroup.com/articles/scrolljacking-101/)
- Recomendações da NN/g para scrolljacking: justificar o uso (divulgação progressiva de algo valioso ou storytelling), testar a velocidade, intercalar com seções de rolagem normal, manter a direção vertical, minimizar o texto dentro, evitar no mobile e colocar abaixo da dobra, deixando o conteúdo-chave e o CTA visíveis acima — [NN/g](https://www.nngroup.com/articles/scrolljacking-101/)
- The Pudding: um ritmo que funciona no desktop pode ser "cansativo" no mobile; planejar o mobile desde o início "força a reduzir a experiência ao essencial"; muitas animações prejudicam o desempenho; empilhar imagens estáticas pode ser melhor; usar alturas em px a partir de `window.innerHeight` em vez de `vh`, porque a barra do navegador mobile muda a altura do viewport — [The Pudding](https://pudding.cool/process/responsive-scrollytelling/)
- Smashing Magazine (2017): dividir conteúdo longo em blocos claramente distintos, usar navegação fixa (sticky) e uma barra de progresso de rolagem que sirva também de navegação, evitar scroll hijacking, pausar animações e vídeos fora da tela e oferecer uma opção para desligar o movimento — [Smashing Magazine, Just Keep Scrolling](https://www.smashingmagazine.com/2017/05/long-scrolling/)
- Stephanie Evergreen argumenta que o scrollytelling controla a carga cognitiva ao dosar o conteúdo. A pesquisa informal de Shander (71 membros da DVS, sem rigor científico) teve cerca de 80% de reações positivas ao formato — [Nightingale](https://nightingaledvs.com/the-past-present-and-future-of-scrollytelling/)

### Inferências
- **Proposta de ritmo:** no máximo 1 a 2 set pieces de tela cheia ou presos à rolagem (a virada calor→frio e, talvez, o momento "22 °C"), separados por seções calmas de rolagem livre. Padrão: impacto → leitura → impacto → leitura → CTA.
- **Duração da seção presa:** não há número validado. Como regra de partida, eu manteria a virada principal em cerca de 1,5 a 2,5 alturas de viewport no desktop, menos no mobile (ou sem prender), e validaria com teste. É uma heurística minha, não um dado.
- Como 74% da atenção fica nas duas primeiras telas, o hero precisa conter promessa, prova rápida (por exemplo, "atendemos Aracaju e região") e CTA (WhatsApp), em vez de ser só um momento cinematográfico.
- Um CTA fixo (botão de WhatsApp flutuante ou cabeçalho fixo) resolve o problema de "CTA enterrado" e serve de saída para quem se perder num trecho preso. A NN/g observou que usuários fogem de scrolljacks pela navegação fixa.

### Lacunas
- Não encontrei dados confiáveis sobre o "número máximo de momentos de tela cheia antes da fadiga" nem sobre a duração ideal de seções presas em pixels ou viewports. Não há estudo publicado com esse número.
- Os dados da NN/g foram coletados em desktop. Não encontrei a distribuição equivalente para mobile em fonte primária (o número de 74% citado para mobile aparece só em fonte secundária, [wyliecomm](https://www.wyliecomm.com/2019/04/webpage-length/), e não confere com o estudo original, que era de desktop).

## 3. Roteiros de cor (color scripts) aplicados à web: paletas que evoluem, quente→frio, noite→dia, contraste de valor como marcador de ato; psicologia de cor; ritmo claro/escuro e legibilidade (WCAG)

### Takeaway
Um color script é uma sequência de miniaturas que define a paleta e a luz de cada cena para acompanhar o arco emocional. A Pixar faz um para cada longa desde Toy Story. Para a web, isso vira uma tira de cores por seção, desenhada antes do layout, em que cada mudança de tom ou valor marca uma virada de ato. A evidência de que azul "esfria" e laranja "esquenta" de verdade é mista. Já a associação de azul com competência e confiança tem apoio em pesquisa de marketing. Texto claro sobre fundo escuro tem desempenho de leitura um pouco pior que o contrário, então as seções de leitura longa devem ser claras e as escuras reservadas a momentos de impacto, sempre dentro dos contrastes da WCAG.

### Cited Findings
- Ralph Eggleston criou um color script por iniciativa própria em Toy Story. John Lasseter nunca tinha visto um, e a partir dali a Pixar passou a fazer um para cada filme. Há divergência: algumas fontes dizem que o color script não foi inventado por Eggleston nem pela Pixar, mas que a Pixar foi o primeiro estúdio a fazê-lo sistematicamente — [MoMA, Pixar: 20 Years of Animation](https://www.moma.org/audio/playlist/192/2581); [AWN, Eggleston sobre Inside Out](https://www.awn.com/animationworld/ralph-eggleston-talks-inside-out)
- Em Inside Out, Eggleston fez cerca de 500 a 600 pinturas e reduziu para cerca de 200 no color script, descrevendo a jornada de Riley como "um arco emocional simples" cujos detalhes mudavam o tempo todo — [AWN](https://www.awn.com/animationworld/ralph-eggleston-talks-inside-out)
- Em Finding Nemo, as cores ficam mais apagadas nos momentos emocionalmente sombrios e mais vivas nos felizes. Em Up, os balões coloridos reintroduzem cor no mundo de Carl. Esses exemplos aparecem em compilações sobre a arte da Pixar — [Ceros, Lessons in story design from Pixar](https://www.ceros.com/inspire/originals/lessons-story-design-pixars-creative-team); [The Art of Pixar: 25th Anniversary (Chronicle Books)](https://hyperallergic.com/the-art-of-pixar-chronicle-books.md)
- Definição operacional: o color script é uma sequência planejada de paletas e mudanças tonais que acompanha clima emocional, hora do dia e progressão, e que a iluminação, os cenários e os personagens seguem depois — [Blender Studio, Color scripting](https://studio.blender.org/blog/color-scripting/); [Tuts+, How to colourscripts](https://photography.tutsplus.com/tutorials/how-to-colourscripts-animation--cms-38391)
- Efeito cor-temperatura ("hue-heat"): a EPFL (Chinazzo et al.) relatou que o azul leva a uma sensação "mais fresca" e o laranja a uma "mais quente" em avaliações de ambientes, inclusive em RV. Mas o efeito do laranja apareceu a 24 °C e não a 29 °C — [EPFL Infoscience](https://infoscience.epfl.ch/record/233785?ln=en)
- Contraponto: Battistel et al. (Scientific Reports, 2024; 26 participantes em câmara climática com luz vermelha ou azul) não encontraram melhora na percepção térmica pela congruência cor-temperatura, com participantes reagindo em direções opostas. Outro estudo de 2024 viu que todas as cores pareciam "mais quentes" com o aumento da luminância — [Scientific Reports via DOAJ](https://doaj.org/article/959abf17de2743198df7115c38e7e6a5); [PDF](https://iris.unitn.it/retrieve/8a3ac249-c8a7-4665-acaf-e81e8a05e8de/s41598-024-71784-7.pdf); [Scientific Reports, nov. 2024](https://doaj.org/article/819b4c0b33ea49109dfb78f23d3a17cd)
- Labrecque & Milne ("Exciting red and competent blue", Journal of the Academy of Marketing Science, v. 40, 2012; online em 2011) mostram, em quatro estudos, que a cor altera a personalidade de marca e a intenção de compra. A associação popular "azul = competência, vermelho = excitação" é confirmada por estudos derivados (tese CBS). Não li o texto completo — [Springer DOI 10.1007/s11747-010-0245-y](https://link.springer.com/doi/10.1007/s11747-010-0245-y); [tese CBS](https://research.cbs.dk/en/studentProjects/competent-blue-and-exciting-red-examining-the-effect-of-logo-colo/)
- Claro vs. escuro (NN/g, Raluca Budiu, 2020): em leitores com visão normal, a polaridade positiva (texto escuro em fundo claro) teve melhor desempenho em acuidade e revisão de texto (Piepenbrock et al., 2013), e a vantagem cresce quanto menor a fonte. À noite, o modo claro foi mais rápido e o texto pequeno ficou bem mais difícil no modo escuro (Dobres et al., 2017). Recomendação: não usar escuro como padrão para leitura — [NN/g, Dark Mode vs. Light Mode](https://www.nngroup.com/articles/dark-mode/)
- WCAG 2.x (SC 1.4.3, nível AA): contraste mínimo de 4,5:1 para texto normal e 3:1 para texto grande (cerca de 18 pt, ou 14 pt em negrito). SC 1.4.11 exige 3:1 para componentes de interface e gráficos — [W3C, Understanding 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html); [W3C, Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- Falso fundo (NN/g, 2016): heróis de tela cheia, linhas horizontais de largura total e grandes blocos vazios fazem a página parecer terminada. Num teste, 6 de 8 usuários não perceberam que podiam rolar. Correção: deixar o conteúdo seguinte "espiar" acima da dobra — [NN/g, Illusion of Completeness](https://www.nngroup.com/articles/illusion-of-completeness/)

### Inferências
- **Roteiro de cor proposto (tira de cores por ato):**
  1. *Hero / calor (ato 1):* fundo night #070B12 com acentos laranja #FF6A3D (sol, ar quente, termômetro), escuro e abafado. O laranja aparece só aqui e onde houver "calor".
  2. *Tensão:* o laranja se espalha ou pulsa, com contraste de valor alto (o "pico negativo").
  3. *Virada / resfriamento (set piece):* gradiente animado de laranja → HC blue #1F5FFF → ice blue #7CC8FF sobre deep blue #0B1E3A. A queda de temperatura da cor é a metáfora central (a "noite que vira madrugada fria").
  4. *Conforto 22 °C (resolução):* passagem para snow #EEF4FB, claro e arejado ("amanhecer/dia"). A mudança de valor escuro→claro marca a entrada no ato 3.
  5. *Serviços, prova e FAQ:* seções claras (snow) para leitura longa, com acentos em azul. Pode haver uma faixa intermediária deep blue para variar o ritmo.
  6. *CTA final:* um retorno curto ao escuro (deep blue/night) com HC blue vibrante, um "fechamento" com contraste forte. O pico-fim recomenda caprichar aqui. Laranja ausente = calor resolvido.
- Isso reproduz a lógica da United Carriers (alternância escuro/claro + progressão de cenário), mas dá significado à alternância: escuro = desconforto ou impacto, claro = alívio ou leitura.
- O efeito real de "sentir frio" pela cor é incerto. O argumento de design deve se apoiar na convenção semântica (laranja = quente, azul = frio é uma codificação cultural amplamente entendida) e não numa promessa fisiológica.
- A luminância aquece a percepção (estudo de 2024). Na fase "conforto", use azuis claros e dessaturados com cuidado para não parecerem "quentes". O snow #EEF4FB, levemente azulado, ajuda.
- **Contraste a verificar** (não calculei): laranja #FF6A3D sobre night provavelmente passa para texto grande, mas texto branco sobre laranja tende a falhar em 4,5:1. HC blue #1F5FFF sobre night pode não passar 4,5:1 para texto pequeno. Ice blue sobre snow certamente falha para texto. Use os azuis vivos como cor de destaque e de texto grande, não para corpo de texto.

### Lacunas
- Não consegui acessar o texto da exposição "Pixar: The Design of Story" (Cooper Hewitt; erro 503) para obter uma definição oficial de color script.
- Não encontrei estudos sobre o efeito do ritmo de alternância claro/escuro entre seções sobre a compreensão ou a conversão. A recomendação vem da pesquisa de polaridade e de heurísticas.
- Não calculei as razões de contraste reais da paleta. É preciso verificar com uma ferramenta (WebAIM Contrast Checker).
- A pesquisa de cor-temperatura usa amostras pequenas e luz ambiente, não telas. Não há estudo sobre cores de site e percepção térmica.

## 4. Som e movimento como pistas narrativas (breve)

### Takeaway
O movimento deve marcar transições de ato (a virada do frio), e não decorar toda a página. A WCAG pede respeito a `prefers-reduced-motion` para movimento disparado pela rolagem, como parallax. Som em site de serviço deve ser opcional, desligado por padrão e com controle visível.

### Cited Findings
- WCAG 2.2 SC 2.3.3 Animation from Interactions (nível AAA): permitir desativar movimento não essencial disparado por interação, citando explicitamente elementos decorativos que se movem na rolagem e parallax. Isso protege pessoas com distúrbios vestibulares (tontura, náusea, dor de cabeça). Técnicas: C39 (CSS `prefers-reduced-motion`) e SCR40 (o mesmo em JS) — [W3C, Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- Transições animadas vs. estáticas afetaram o engajamento em histórias visuais (240 participantes) — [McKenna et al., 2017](https://www.microsoft.com/en-us/research/publication/visual-narrative-flow-exploring-factors-shaping-data-visualization-story-reading-experiences/)
- WCAG SC 1.4.2 Audio Control (nível A): áudio que toca automaticamente por mais de 3 segundos precisa de mecanismo para pausar, parar ou controlar o volume — [W3C, Understanding 1.4.2](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html)
- Smashing Magazine recomenda pausar vídeos e animações fora da tela e oferecer um botão para desligar o movimento — [Smashing](https://www.smashingmagazine.com/2017/05/long-scrolling/)

### Inferências
- Use o movimento como "pontuação": partículas de calor ondulando no ato 1, uma lufada de ar frio na virada e quietude (pouco movimento) no conforto. A ausência de movimento também comunica conforto.
- Com `prefers-reduced-motion`, troque a transição presa por um corte simples entre estados de cor. A narrativa de cor continua funcionando sem animação.
- Se houver som (sopro do ar-condicionado), ele deve ser opt-in. Os navegadores bloqueiam autoplay com som e o público mobile costuma navegar sem áudio.

### Lacunas
- Não pesquisei evidência empírica sobre som em sites comerciais. As recomendações de som se baseiam na WCAG e não em estudos de conversão.

## 5. Erros comuns: página longa demais, progresso pouco claro, conteúdo escondido, CTA enterrado

### Takeaway
Os erros documentados são previsíveis. Heróis de tela cheia sem pista de rolagem criam falso fundo. Scrolljacks longos desorientam e escondem texto. A atenção despenca depois da segunda tela, então um CTA só no fim é visto por poucos. A falta de navegação fixa ou de indicador de progresso tira do usuário a sensação de controle.

### Cited Findings
- Falso fundo: em um teste, 6 de 8 usuários não perceberam que podiam rolar uma página com hero de tela cheia. Linhas de largura total, grandes espaços vazios e carrosséis horizontais também escondem conteúdo — [NN/g, Illusion of Completeness](https://www.nngroup.com/articles/illusion-of-completeness/)
- Scrolljacks longos, com texto, mudança de direção para horizontal ou sem navegação fixa agravam a desorientação, e a situação é pior no mobile. A navegação fixa foi a "saída de emergência" dos usuários — [NN/g, Scrolljacking 101](https://www.nngroup.com/articles/scrolljacking-101/)
- Os CTAs principais devem ficar acima da dobra, porque a atenção se concentra nas primeiras telas (57% na primeira, 74% nas duas primeiras) — [NN/g, Scrolling and Attention](https://www.nngroup.com/articles/scrolling-and-attention/)
- Barra de progresso de rolagem e navegação fixa como orientação; preservar a posição de rolagem ao usar "voltar"; atualizar a URL por seção — [Smashing Magazine](https://www.smashingmagazine.com/2017/05/long-scrolling/)
- Pudding: evitar hover e interações que disparam sem querer durante a rolagem, e preferir texto fixo e anotações — [The Pudding](https://pudding.cool/process/responsive-scrollytelling/)
- Momentos de frustração viram "picos negativos" que dominam a lembrança da experiência — [NN/g, Peak-End Rule](https://www.nngroup.com/articles/peak-end-rule/)

### Inferências
- **Lista de verificação para o storyboard da HC:**
  - O hero mostra promessa, CTA de WhatsApp e uma pista de rolagem (o próximo bloco "espiando" ou um indicador animado discreto).
  - Botão de WhatsApp fixo em todas as seções.
  - No máximo 1 trecho preso à rolagem (a virada calor→frio), curto, vertical e sem texto essencial dentro. Todo texto essencial também aparece fora da animação.
  - No mobile, versão sem prender (estados de cor empilhados).
  - Um indicador de progresso que acompanhe a narrativa, por exemplo um termômetro lateral que desce de cerca de 35 °C até 22 °C conforme a rolagem. Ele resolve o problema do progresso pouco claro e reforça o color script. Isso é ideia minha, não testada.
  - Prova social antes do CTA final, e o CTA final como o momento visual mais forte depois da virada (pico-fim).
  - Evitar divisórias de largura total e grandes vazios entre atos que pareçam fim de página. Use gradientes de transição entre seções escuras e claras.

### Lacunas
- Não encontrei dados quantitativos sobre o comprimento ideal (em telas) de uma landing page de serviço local. A NN/g recomenda testar com usuários representativos em vez de fixar um número.
