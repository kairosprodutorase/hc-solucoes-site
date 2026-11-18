# HC Soluções — Site

Projeto de site da **HC Soluções**, desenvolvido e gerenciado pela **KAIRÓS Produtora**.

## Situação
Proposta de site com o conteúdo real da HC Soluções em Climatização (Aracaju e Barra dos Coqueiros/SE), reunido do site atual e do Instagram @hcsolucoes.climatizacao.

## Conteúdo e chamadas para ação
- **Contatos reais**: WhatsApp (79) 99638-8938 (`wa.me/5579996388938`, com mensagem pronta por serviço), telefone (79) 99671-0369, e-mail hcsolucoesemclimatizacao@gmail.com, Instagram, horário (seg–sex 8h–18h, sáb 8h–12h), endereço e CNPJ no rodapé, dados estruturados `HVACBusiness` (JSON-LD).
- **Seções**: Serviços (6 + Plano de Gestão para empresas com diagnóstico inicial grátis) · PMOC (verificador, 5 etapas, responsáveis técnicos com CFT, guia em abas — o que consta, periodicidade, documentos, erros comuns, sem PMOC — e perguntas frequentes) · A HC · Como contratar + Por que a HC · Onde atendemos (com "aberto/fechado agora" no fuso de Sergipe) · Contato (formulário que monta a mensagem e abre o WhatsApp; nada é armazenado).
- Botão flutuante de WhatsApp em todas as telas.

## Identidade visual — Proposta 02 · Floco (refinada, atual)
Marca da HC Soluções — ar-condicionado e climatização. Apresentação em `marca.html` e em PDF (`docs/hc-solucoes-identidade-visual-proposta-02.pdf`, 8 páginas, 1440×900).

- **Símbolo**: a barra do H é um **floco de neve** de seis pontas, encaixado nas hastes. O C é o **arco do ar** que circula no ambiente.
- **Refinamento**: ramificações a 60° (ângulo real do cristal) afastadas das hastes, núcleo hexagonal vazado, C com compensação óptica (traço +1 e ultrapassagem de 1) e mais respiro entre H e C.
- **Assinatura**: símbolo + "Soluções" em Instrument Serif Itálico + "Ar-condicionado · Climatização" em JetBrains Mono, tudo em curvas.
- **Cores** (só azul, branco e preto): Noite `#070B12`, Neve `#EEF4FB`, Azul HC `#1F5FFF`, Azul gelo `#7CC8FF`, Azul profundo `#0B1E3A`. Laranja calor `#FF6A3D` apenas como cor funcional para indicar calor — nunca no símbolo.
- **Arquivos** em `assets/logo/`: horizontal, vertical e símbolo nas versões negativa, positiva, azul, mono branco, mono preto e aparelho; ícone de app.
- Gerador em `tools/logo/`.

**Proposta 01 (arquivada)**: H com aletas + C mostrador em lima. Arquivos em `assets/logo/proposta-01/`, PDF em `docs/hc-solucoes-identidade-visual-proposta-01.pdf`, gerador em `tools/logo/proposta-01/`.

## Proposta do site — "Do complexo ao claro"
Direção de arte provisória, aguardando aprovação do cliente. O conceito traduz "soluções" em experiência: o visitante rola a página e transforma ruído em forma.

- **Hero interativo**: ~2.800 partículas em campo de fluxo (caos) se organizam no símbolo HC conforme o scroll — as do floco acendem em azul-gelo; o cursor dispersa as partículas.
- **Split em 3D** (`js/split3d.js`, Three.js local em `js/vendor/three/`, licença MIT): aparelho modelado em código — plástico brilhante com reflexos, painel frontal, saída com palhetas, aleta articulada que abre conforme esfria, visor com a temperatura, logo aplicada, sombra na parede e partículas de ar frio. Gira levemente com o cursor. Sem WebGL, a ilustração em SVG continua no lugar.
- **Climatização**: um split com a marca HC; ao rolar, o ambiente esfria de 32° para 22°, a aleta abre, o ar sai e a luz passa de laranja (calor) para azul (conforto) e flocos de neve começam a cair.
- **Entrada com som**: tela de entrada com o símbolo e o botão "Entrar com som" — o clique libera o áudio (navegadores bloqueiam som antes de uma interação) e o site já abre com o som ligado. Há a opção "Entrar sem som" e o botão no topo para desligar a qualquer momento.
- **PMOC em destaque**: selo no hero, item no menu e seção em três passos — (1) verificador interativo "Seu ambiente precisa de PMOC?" com resposta imediata, (2) o que o PMOC garante, (3) "Como funciona" em 4 etapas navegáveis (abas acessíveis por teclado) que marcam os itens do documento PMOC até o carimbo "Em dia". Base legal: Lei nº 13.589/2018. O contato aguarda os canais de atendimento.
- **Sensação de ar**: correntes de vento quase transparentes atravessam a página e aceleram um pouco ao rolar (desativadas com movimento reduzido).
- **Som ambiente**: liga na entrada; botão no topo para desligar/ligar. Vento com rajadas naturais, fluxo do split que cresce conforme o aparelho liga na rolagem, zumbido grave do compressor e bipes ao ligar e ao chegar a 22°. Tudo sintetizado com Web Audio API — sem arquivos de áudio, sem direitos autorais, nada toca sem clique; pausa quando a aba fica oculta.
- **Manifesto**: as palavras acendem uma a uma com a rolagem; termos-chave em serifa itálica.
- **Método**: quatro etapas (Escutar, Mapear, Resolver, Acompanhar) com preenchimento em cor-sinal no hover/foco.
- **Bastidores**: painel honesto com o estado do projeto (estrutura, identidade, conteúdo, lançamento).
- **Encerramento**: assinatura tipográfica e relógio na hora local do visitante.

Tipografia: Inter Tight, Instrument Serif e JetBrains Mono (Google Fonts). Cores em variáveis CSS no topo de `css/styles.css`.
Acessibilidade: link de pular conteúdo, foco visível, navegação por teclado no Método, `prefers-reduced-motion` respeitado (sem animações, hero estático) e conteúdo legível sem JavaScript.

Textos de manifesto e método são genéricos e precisam de validação; nenhum serviço, contato ou dado do cliente foi inventado.

## Arquivos
- `index.html`: página inicial (proposta), acessível e responsiva
- `marca.html` e `css/marca.css`: apresentação da identidade visual (também imprime como PDF em páginas 1440×900)
- `css/styles.css`: tokens e estilos
- `js/main.js`: camadas de interação (partículas, scroll, cartões, relógio). A página funciona sem JavaScript.
- `js/air.js`: correntes de vento (canvas) e som ambiente (Web Audio)
- `assets/logo/`: arquivos da marca proposta; `assets/favicon.svg` usa o símbolo
- `docs/`: PDF de apresentação da marca
- `tools/logo/`: gerador dos SVGs da marca
- `.gitignore`: arquivos locais a não versionar

## Execução local
Abra `index.html` no navegador. O projeto não exige instalação de dependências.

## GitHub
Repositório planejado: `kairosprodutorase/hc-solucoes-site` (público).
Branch padrão: `main`.

## Publicação
Compatível com hospedagem estática no Cloudflare Pages:
- Build command: nenhum
- Build output directory: `/` (raiz)
- Branch de produção: `main`

**Atenção:** o conteúdo desta versão é um placeholder. Antes de publicar para clientes, substituir textos, favicon e links pelos ativos aprovados e configurar o domínio.

Para a integração Git do Cloudflare Pages, selecionar o framework None, deixar o comando de build vazio e usar a raiz como saída. Usar branches de desenvolvimento para prévias. Manter o noindex enquanto o conteúdo for provisório.
