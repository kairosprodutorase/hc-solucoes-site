# HC Soluções — Site

Projeto de site da **HC Soluções**, desenvolvido e gerenciado pela **KAIRÓS Produtora**.

## Situação
Proposta de site com o conteúdo real da HC Soluções em Climatização (Aracaju e Barra dos Coqueiros/SE), reunido do site atual e do Instagram @hcsolucoes.climatizacao.

## Conteúdo e chamadas para ação
- **Contatos reais**: WhatsApp (79) 99638-8938 (`wa.me/5579996388938`, com mensagem pronta por serviço), telefone (79) 99671-0369, e-mail hcsolucoesemclimatizacao@gmail.com, Instagram, horário (seg–sex 8h–18h, sáb 8h–12h), endereço e CNPJ no rodapé, dados estruturados `HVACBusiness` (JSON-LD).
- **Seções**: Serviços (6 + Plano de Gestão para empresas com diagnóstico inicial grátis) · PMOC (verificador, 5 etapas, responsáveis técnicos com CFT, guia em abas — o que consta, periodicidade, documentos, erros comuns, sem PMOC — e perguntas frequentes) · A HC · Como contratar + Por que a HC · Onde atendemos (com "aberto/fechado agora" no fuso de Sergipe) · Contato (formulário que monta a mensagem e abre o WhatsApp; nada é armazenado).
- Botão flutuante de WhatsApp, que some quando já há outro botão de WhatsApp visível (nunca dois com a mesma função na tela).
- Uma marca por tela: o logo do menu sai de cena enquanto o "HC" de partículas está formado; a logo no aparelho é preto e branco.

## Identidade visual — Proposta 02 · Floco (refinada, atual)
Marca da HC Soluções — ar-condicionado e climatização. Apresentação em `marca.html` e em PDF (`docs/hc-solucoes-identidade-visual-proposta-02.pdf`, 8 páginas, 1440×900).

- **Símbolo**: a barra do H é um **floco de neve** de seis pontas, encaixado nas hastes. O C é o **arco do ar** que circula no ambiente.
- **Refinamento**: ramificações a 60° (ângulo real do cristal) afastadas das hastes, núcleo hexagonal vazado, C com compensação óptica (traço +1 e ultrapassagem de 1) e mais respiro entre H e C.
- **Assinatura**: símbolo + "Soluções" em Instrument Serif Itálico + "Ar-condicionado · Climatização" em JetBrains Mono, tudo em curvas.
- **Cores** (só azul, branco e preto): Noite `#070B12`, Neve `#EEF4FB`, Azul HC `#1F5FFF`, Azul gelo `#7CC8FF`, Azul profundo `#0B1E3A`. Laranja calor `#FF6A3D` apenas como cor funcional para indicar calor — nunca no símbolo.
- **Arquivos** em `assets/logo/`: horizontal, vertical e símbolo nas versões negativa, positiva, azul, mono branco, mono preto e aparelho; ícone de app.
- Gerador em `tools/logo/`.

**Proposta 01 (arquivada)**: H com aletas + C mostrador em lima. Arquivos em `assets/logo/proposta-01/`, PDF em `docs/hc-solucoes-identidade-visual-proposta-01.pdf`, gerador em `tools/logo/proposta-01/`.

## Proposta do site — "Um dia em Aracaju"
Roteiro definido em `reports/Roteiro de rolagem HC Soluções.md` (pesquisa em `research_notes/`). A página é um dia de serviço, do meio-dia (32°) à noite fresca (22°). Hora e temperatura correm juntas no termômetro-relógio do canto, e cada cena tem um tom de fundo da paleta (claro para ler, escuro para o impacto). A ponte Aracaju–Barra dos Coqueiros é o clímax.

| Hora | Cena | Tom | Transição |
|---|---|---|---|
| 05h40 | Pré-carregador: mapa pontilhado (IBGE) acende da sede, cruza a ponte; relógio 05h40→12h e temperatura **subindo** 26°→32° | Noite | amanhece até o Neve e entra sozinho |
| 12h | Hero: "Ar-condicionado em Aracaju", sol no canto, o mormaço sobe e as partículas formam o HC (floco em Azul HC) | Neve + laranja | o núcleo hexagonal do floco cresce e abre a cena seguinte |
| 13h | O chamado (`#atendimento`): a linha sai da sede, atravessa a ponte e chega a Aracaju; cartões de atendimento e horário | Azul profundo | rolagem normal |
| 14h | Do calor ao conforto: split 3D, fundo de Mormaço `#251617` para Azul profundo | escuro esfriando | a condensação embaça a tela até virar Neve |
| 15h | Serviços: a linha de ar desce e acende cada cartão; Plano de Gestão em cartão escuro | Neve | aletas fecham em Azul profundo |
| 16h | PMOC: guia e perguntas em painéis claros | Azul profundo | aletas fecham em Gelo claro |
| 17h | A HC + Como contratar | Gelo claro `#C6E5FC` | o céu |
| 18h | O céu esfria | Gelo claro → Azul HC → Noite | contínuo |
| 18h30 | A volta pela ponte: voo de drone controlado pela rolagem (90 quadros WebP no desktop, 60 no celular; só os quadros perto do atual ficam decodificados); no fim a cidade vira os pontos do mapa | Noite | rolagem normal |
| 19h | Contato com ondas de ar frio | Noite | — |
| agora | Rodapé: o mapa do começo e a hora real de Aracaju com "aberto/fechado agora" | `#05080E` | — |

- **Tons por cena**: classes `tom-claro`, `tom-gelo` e `tom-escuro` trocam texto, linhas e destaque juntos. No claro, o cinza secundário é `#4A5A70` (6,35:1 sobre Neve) e o destaque é Azul HC; Azul gelo e laranja nunca viram texto sobre claro.
- **Termômetro-relógio** (`js/motion.js`): hora da história pelas marcas `data-hora` de cada cena; no rodapé, hora real de Aracaju. Ventilação segue a velocidade da rolagem.
- **Pausar animações**: botão no topo (WCAG 2.2.2); a escolha fica guardada no navegador.
- **Modo leve**: aparelho com até 4 GB/4 núcleos ou economia de dados → menos partículas e o voo com os quadros menores; com economia de dados, a ponte mostra um quadro e o botão "Ver o voo".
- **Movimento reduzido**: sem pré-carregador, rolagem suave, cursor, termômetro, aletas, condensação ou voo (a ponte aparece em imagem fixa); todo o texto continua no HTML.
- **Mantido do conceito anterior**: partículas, split 3D, PMOC, formulário que abre o WhatsApp, som sintetizado (começa desligado), cursor, letras embaralhadas, um botão de WhatsApp por tela.
- **Vídeo da ponte**: voo FPV autorizado pelo autor, sem marca d'água; trecho de 16 a 45 s com tratamento de cor (pretos na Noite, estais no azul, sódio no laranja), em `assets/ponte/`.
- **Ainda não feito do roteiro**: a migração dos pontos do mapa para as partículas (hoje é um amanhecer em fade), a trilha sonora por horário e as partículas formando o HC de novo no rodapé. A página tem ~21 telas no desktop (meta 14), por causa do conteúdo longo do PMOC.

## Arquivos
- `index.html`: página inicial (proposta), acessível e responsiva
- `marca.html` e `css/marca.css`: apresentação da identidade visual (também imprime como PDF em páginas 1440×900)
- `css/styles.css`: tokens e estilos
- `js/main.js`: camadas de interação (partículas, scroll, cartões, relógio). A página funciona sem JavaScript.
- `js/air.js`: correntes de vento (canvas) e som ambiente (Web Audio)
- `js/preload.js` e `js/intro-map.js`: pré-carregador e grade de pontos do mapa (gerada, não editar)
- `js/scenes.js`: cenas do roteiro (floco que abre a cena, rota no mapa, linha de ar, aletas, voo da ponte, mapa do rodapé, pausar animações)
- `assets/ponte/`: quadros do voo sobre a ponte (`d/` desktop, `m/` celular) e quadro único
- `js/motion.js`: rolagem suave, revelação de títulos, cabeçalho, cursor, letras embaralhadas e termômetro
- `assets/logo/`: arquivos da marca proposta; `assets/favicon.svg` usa o símbolo
- `docs/`: PDF de apresentação da marca
- `tools/logo/`: gerador dos SVGs da marca
- `tools/mapa/`: malhas do IBGE e gerador do mapa do pré-carregador
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
