# HC Soluções — Site

Projeto de site da **HC Soluções**, desenvolvido e gerenciado pela **KAIRÓS Produtora**.

## Situação
Estrutura técnica inicial. O conteúdo, o ramo de atuação, as cores, as imagens e os contatos do cliente ainda precisam ser confirmados. Nenhuma identidade visual oficial foi presumida.

## Proposta visual — "Do complexo ao claro"
Direção de arte provisória, aguardando aprovação do cliente. O conceito traduz "soluções" em experiência: o visitante rola a página e transforma ruído em forma.

- **Hero interativo**: ~2.600 partículas em campo de fluxo (caos) se organizam no monograma "HC" conforme o scroll; o cursor dispersa as partículas.
- **Manifesto**: as palavras acendem uma a uma com a rolagem; termos-chave em serifa itálica.
- **Método**: quatro etapas (Escutar, Mapear, Resolver, Acompanhar) com preenchimento em cor-sinal no hover/foco.
- **Bastidores**: painel honesto com o estado do projeto (estrutura, identidade, conteúdo, lançamento).
- **Encerramento**: assinatura tipográfica e relógio na hora local do visitante.

Tipografia: Inter Tight, Instrument Serif e JetBrains Mono (Google Fonts). Cores em variáveis CSS no topo de `css/styles.css` (`--accent` é provisória).
Acessibilidade: link de pular conteúdo, foco visível, navegação por teclado no Método, `prefers-reduced-motion` respeitado (sem animações, hero estático) e conteúdo legível sem JavaScript.

Textos de manifesto e método são genéricos e precisam de validação; nenhum serviço, contato ou dado do cliente foi inventado.

## Arquivos
- `index.html`: página inicial (proposta), acessível e responsiva
- `css/styles.css`: tokens e estilos
- `js/main.js`: camadas de interação (partículas, scroll, cartões, relógio). A página funciona sem JavaScript.
- `assets/favicon.svg`: ícone temporário tipográfico, não é a logomarca oficial
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
