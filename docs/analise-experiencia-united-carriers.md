# Análise de experiência — unitedcarriers.com → HC Soluções

Referência: https://unitedcarriers.com (home, analisada em 20/11/2026 em desktop 1440×900, rolando a página inteira e lendo o código de animação).
Objetivo: trazer a **experiência**, não os objetos. Nada de caminhões, navios ou globo; o que interessa é *como* o site faz o visitante sentir o serviço.

---

## 1. A ideia central (o que realmente faz o site funcionar)

O site não lista os serviços: **ele faz o visitante viajar junto com a carga.**

Um mesmo objeto atravessa a página inteira e muda de meio de transporte conforme a rolagem:

> mapa pontilhado (carregando) → globo (hero) → empilhadeira ergue o contêiner → contêiner vai para a carreta → a câmera sobe para vista aérea, a carreta anda na estrada, a estrada faz curva → a estrada vira mar, aparece o navio (água com rastro em 3D) → a câmera sobe até as nuvens → asa de avião nos depoimentos.

Terra, mar e ar = os três serviços principais, **demonstrados** em vez de descritos. Tudo o que aparece em texto (serviços, diferenciais, "por que nós") é encaixado *ao lado* desse objeto em movimento.

Tradução para a HC: **o visitante acompanha o ar** (ou o atendimento) do calor ao conforto, sem cortes. A página é uma única jornada, não uma pilha de seções.

---

## 2. Linha do tempo da página (o que acontece a cada rolagem)

| # | Momento | O que o visitante vê | Mecanismo |
|---|---|---|---|
| 1 | Carregamento | Tela preta, mapa-múndi em pontos, cidades acendendo em azul, lista de países à esquerda e de serviços à direita (fonte mono, cinza), contador `00 → 100` | Pré-carregador com progresso real dos recursos |
| 2 | Hero | Globo 3D escuro com brilho laranja/azul na borda, rótulos de cidades surgindo com desfoque, título em 3 linhas, 2 botões | WebGL + revelação em linhas (subir + desfoque) |
| 3 | Saída do hero | O globo cresce (escala 1.1) e some enquanto a próxima seção sobe | Scroll vinculado ("scrub") |
| 4 | Intro | Frase grande cujas palavras mudam de cinza → preto → azul conforme a rolagem; números contam (2.500+, 98,2%, 8+) | Varredura de cor por palavra + contador ao entrar na tela |
| 5 | Empilhadeira | Empilhadeira ergue um contêiner de uma pilha | Sequência de quadros AVIF em canvas, presa à rolagem |
| 6 | Carreta | Contêiner desce na carreta, carreta sai; texto gigante vazado "OUR SERVICES" passa no fundo | Seção fixa (pin) + rolagem horizontal |
| 7 | Serviços | Painel escuro com 6 serviços deslizando na horizontal; título com degradê azul que "acende" | Pin + translação horizontal |
| 8 | Vista aérea | Câmera de cima: carreta andando na estrada; a estrada faz curva de 90°; diferenciais ("Rastreio em tempo real", "Rede global", "Suporte 24/7") aparecem ao lado | Pin + máscaras (clip-path) |
| 9 | Mar | A estrada termina no oceano; navio porta-contêineres visto de cima, com espuma e rastro | WebGL (cena de oceano + simulação de rastro) |
| 10 | Por que nós | "Logistics that works as hard as you do" sobre o navio; 5 motivos se espalham em volta | Pin + entradas escalonadas |
| 11 | Nuvens | A câmera sobe, atravessa nuvens; o navio fica pequeno | Escala + opacidade presos à rolagem |
| 12 | Depoimentos | Fundo branco, asa de avião invadindo pela direita, 3 depoimentos longos com foto | Transição de cor do fundo |
| 13 | Parceiros | Grade de logos (companhias aéreas / armadores) com célula que acende no hover | Grade com hover |
| 14 | Insights | Fundo escuro com brilho azul, lista de notícias; imagem segue o cursor ao passar sobre o item | "Imagem que segue o cursor" |
| 15 | FAQ | Perguntas numeradas, abre/fecha | Acordeão |
| 16 | CTA final | "Ready to move smarter?" sobre círculos concêntricos, texto com degradê | Ondas + degradê |
| 17 | Rodapé | Letreiro corrido (indústrias/serviços com abas), mapa pontilhado com escritórios, **logotipo gigante feito de partículas** que reage ao mouse | Canvas de partículas a partir de imagem |

Duração: ~28.000 px de altura (~31 telas). É longo; funciona porque sempre há algo se movendo.

---

## 3. Camadas que rodam o tempo todo

Esses detalhes são o que dá a sensação de "produto caro":

1. **Rolagem suave (Lenis)** — inércia leve em toda a página; sem ela, as animações presas à rolagem "pulam".
2. **Velocímetro `km/h`** no canto superior esquerdo durante a jornada — **mede a velocidade real da rolagem** do visitante (com leve tremida acima de certa velocidade) e volta a `00` quando para. É o detalhe mais memorável: o visitante *é* o motorista.
3. **Cursor próprio** — círculo com ponto, segue o mouse com atraso suave; muda de estado em links, some sobre controles; pequena "onda" ao clicar. Só no desktop (> 991 px).
4. **Texto embaralhado no hover** — links e botões embaralham as letras e se reorganizam da esquerda para a direita (~30 ms por passo). Só no desktop.
5. **Cabeçalho que muda de modo** — cada seção declara se é clara ou escura e o cabeçalho troca de cor sozinho.
6. **Revelações padronizadas** — todo título entra por linhas (subindo, com desfoque saindo); elementos ficam ocultos até entrar na tela, evitando "piscar" no carregamento.
7. **Coreografia separada para celular** — o site tem uma versão *mobile* própria da jornada (outras proporções, menos efeitos), não apenas a desktop encolhida. Cursor e embaralhamento desligados abaixo de 991 px.
8. **Transições entre páginas (Barba)** — trocas de página sem recarregar, com animação de saída/entrada.

Pilha técnica deles: Webflow + GSAP (ScrollTrigger) + Lenis + Barba + Three.js + Swiper, construído com Vite. Imagens das máquinas são sequências de quadros AVIF desenhadas em canvas.

---

## 4. Como isso vira a experiência da HC

O site da HC já tem a base certa: hero de partículas que formam o "HC", split 3D que esfria de 32° para 22°, vento e som. Falta **costurar tudo numa jornada única**, como eles fazem.

### Fio condutor proposto: "Do chamado ao conforto"

| United Carriers | HC Soluções (proposta) |
|---|---|
| Pré-carregador: mapa-múndi pontilhado, países e serviços listados, contador 00→100 | **Mapa pontilhado de Aracaju e Barra dos Coqueiros**; bairros atendidos acendem em azul-gelo; bairros à esquerda e serviços à direita em JetBrains Mono; o contador é uma **temperatura caindo de 32° para 22°** em vez de 00→100 |
| Globo 3D no hero | **Partículas formando o HC** (já existe — é o nosso "globo") |
| Frase com varredura de cor + números contando | Manifesto com varredura (já existe parcialmente) + números da HC contando — **apenas com dados reais confirmados pelo cliente** (anos de atuação, atendimentos, empresas com PMOC) |
| Contêiner que troca de transporte | **O ar que troca de ambiente**: o floco/corrente de ar sai do split, atravessa os serviços, chega na fachada de uma empresa (PMOC) e termina no contato |
| Vista aérea da carreta na estrada que faz curva | Vista aérea de **um técnico (van HC) indo até o cliente** pelas ruas de Aracaju; a rua faz curva e os diferenciais aparecem ao lado ("Atendimento em Aracaju e Barra", "Técnicos com CFT", "Mensagem pronta no WhatsApp") |
| Empilhadeira → carreta → navio → nuvens (serviços demonstrados) | Instalação → limpeza/higienização → manutenção → PMOC, **demonstrados no split 3D**: aparelho chega, é fixado, a tampa abre para limpeza, a aleta volta a abrir, o visor marca 22° |
| Texto gigante vazado passando ao fundo ("OUR SERVICES") | "SERVIÇOS" / "PMOC" gigante vazado, em Inter Tight, passando atrás do painel |
| Painel escuro com serviços deslizando na horizontal | Os 6 serviços + Plano de Gestão em painel horizontal fixo (no celular, vira lista vertical) |
| Câmera sobe para as nuvens | Câmera se afasta do apartamento e mostra o **prédio comercial com vários splits** — gancho natural para PMOC e empresas |
| Velocímetro `km/h` que lê a rolagem | **Termômetro + ventilação** fixos no canto: a temperatura cai com o progresso da página (32° → 22°) e a **velocidade do ventilador (baixa / média / alta / turbo) reage à velocidade da rolagem** — liga com o som de vento que já existe |
| Cursor círculo + ponto | Cursor círculo com o **floco de seis pontas** no centro; o floco gira ao passar sobre links |
| Texto embaralhado no hover | Mesmo efeito no menu e nos botões ("Chamar no WhatsApp") |
| Cabeçalho muda de modo por seção | Mesmo (seções claras: Neve `#EEF4FB`; escuras: Noite `#070B12`) |
| Depoimentos longos com foto | **Avaliações reais do Google** da HC (pendente: pedir ao cliente) |
| Grade de parceiros com hover | **Marcas com que a HC trabalha** (LG, Samsung, Daikin etc. — só se o cliente confirmar) |
| Lista de notícias com imagem seguindo o cursor | Lista do **Instagram @hcsolucoes.climatizacao** (antes/depois de limpezas) com a foto seguindo o cursor |
| FAQ numerado | Já temos FAQ do PMOC — aplicar o visual numerado |
| CTA com círculos concêntricos | Círculos concêntricos = **ondas de ar frio** saindo do botão do WhatsApp |
| Rodapé com logotipo gigante de partículas | **"HC Soluções" gigante em partículas** reaproveitando o motor do hero (o visitante "dispersa" a marca com o mouse) + letreiro corrido de bairros/serviços com abas + mini mapa com Aracaju e Barra acesos |

---

## 5. O encerramento

### Como eles fecham

A jornada não termina de repente. Depois do ponto mais alto (a câmera nas nuvens e a asa de avião nos depoimentos), o site **desacelera** em quatro passos:

1. **Prova**: depoimentos, grade de parceiros e notícias. O ritmo cai, o fundo volta a ser branco e as animações ficam pequenas (hover, imagem seguindo o cursor).
2. **Última dúvida**: FAQ numerado, com "Ainda tem dúvidas? Fale com a gente" ao lado. Tira as objeções antes do pedido.
3. **Chamada final**: tela escura, círculos concêntricos ao fundo, "Ready to move smarter?" com degradê azul e **um único botão**. É o último momento "de impacto" da página.
4. **Assinatura**: o rodapé repete o slogan do hero ("One operator. Every leg of the journey."), mostra o letreiro corrido de serviços e setores, o mapa com os escritórios acesos e termina com o **logotipo gigante em partículas**, que o visitante dispersa com o mouse. A última coisa que se vê é a marca.

O que faz funcionar: **o fim conversa com o começo**. O mapa pontilhado do carregamento volta no rodapé, o slogan do hero volta como assinatura, e o velocímetro já zerou: a viagem chegou.

### Como a HC fecha: "chegou a 22°"

O fim da jornada da HC é o **ambiente confortável**. A ideia é que o visitante sinta que chegou, e só então receba o pedido.

| Passo | O que acontece | O que já existe |
|---|---|---|
| Chegada | O termômetro do canto chega a **22°**, toca o bipe de "temperatura atingida", os flocos param de cair e o vento diminui até ficar quase em silêncio. O ventilador volta para "baixa". | Bipe de 22° e vento em `js/air.js` |
| Prova | Avaliações do Google e marcas atendidas, em ritmo calmo (fundo Neve, poucas animações). | Pendente: conteúdo do cliente |
| Última dúvida | FAQ numerado com "Ainda tem dúvida? Chame no WhatsApp" ao lado. | FAQ do PMOC |
| Chamada final | Tela Noite, **ondas de ar frio** (círculos concêntricos) saindo do botão do WhatsApp; título "Vamos cuidar *do seu ar?*" com o "do seu ar" acendendo em azul-gelo. Ao lado, o formulário de 4 perguntas que abre o WhatsApp. **Um botão principal só.** | Seção Contato e formulário |
| Assinatura | Rodapé repete a frase do hero; letreiro corrido de bairros e serviços (abas "Bairros" / "Serviços"); mini mapa pontilhado de Aracaju e Barra com a sede acesa (o mesmo do carregamento); relógio local com "aberto agora / fechado agora". | "Aberto/fechado agora" e relógio já existem |
| Última imagem | **As partículas voltam a formar "HC"** no fim da página, como no hero: a página começa no caos e termina na forma. O visitante pode dispersar com o mouse e elas se reorganizam. | Motor de partículas do hero |

Cuidados:
- O encerramento tem de ser **curto**: de "chegou a 22°" até o fim do rodapé, no máximo 3 telas.
- O botão flutuante do WhatsApp continua sumindo quando o botão da chamada final está visível (regra atual: nunca dois com a mesma função na tela).
- Com movimento reduzido: sem partículas animadas no fim; a marca aparece estática e o termômetro mostra 22° direto.
- No celular, as partículas do rodapé ficam com menos pontos (ou viram a logo em SVG) para não pesar no fim da página.

---

## 6. O que **não** trazer

- Selo "Site of the Day", carrinho/Stripe, banner de cookies (não rastreamos nada).
- O comprimento: 31 telas é demais para um serviço local. Meta: **12–15 telas** no desktop.
- Sequências de quadros em imagem (pesadas, centenas de AVIF). Temos Three.js e o split já modelado em código — usar 3D/SVG, bem mais leve.
- Bloquear conteúdo atrás de animação: todo texto tem de existir no HTML e ser legível sem JavaScript (como hoje).
- Transições entre páginas (Barba): a HC é uma página só; deixar para quando houver páginas internas.

---

## 7. Tecnologia recomendada

- **GSAP + ScrollTrigger + SplitText** (gratuitos desde 2025) e **Lenis**, copiados para `js/vendor/` como o Three.js — o site continua sem etapa de build e publicável no Cloudflare Pages.
- Reaproveitar: motor de partículas (`js/main.js`), split 3D (`js/split3d.js`), vento e som (`js/air.js`).
- `prefers-reduced-motion`: sem rolagem suave, sem pin, jornada vira seções estáticas (já respeitamos isso hoje).
- Celular: coreografia própria e mais curta, sem cursor/embaralhamento, sem WebGL pesado abaixo de 768 px.
- Orçamento: hero interativo em < 2,5 s em 4G; nada de pin com mais de ~3 telas seguidas.

---

## 8. Ordem de implementação sugerida

1. **Base de movimento** — Lenis + GSAP/ScrollTrigger, revelações padronizadas, cabeçalho que muda de modo, cursor e texto embaralhado. *(baixo risco, ganho imediato de "acabamento")*
2. **HUD termômetro/ventilação** lendo a rolagem, ligado ao som de vento. *(o detalhe mais memorável, custo baixo)*
3. **Pré-carregador** com mapa pontilhado de Aracaju/Barra e temperatura caindo.
4. **Jornada fixa** "do chamado ao conforto": van na rua → split sendo instalado/limpo → prédio comercial → PMOC, com serviços em painel horizontal e texto gigante ao fundo.
5. **Encerramento** "chegou a 22°": chegada com bipe e silêncio, chamada final com ondas de ar, rodapé com letreiro, mini mapa e partículas formando o HC de novo.
6. **Conteúdo do cliente**: números reais, avaliações do Google, marcas atendidas, fotos do Instagram.

Pendências com o cliente (não inventar): números da empresa, depoimentos, lista de bairros atendidos, marcas, autorização para usar fotos do Instagram.
