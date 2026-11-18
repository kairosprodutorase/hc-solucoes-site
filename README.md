# HC Soluções — Site

Projeto de site da **HC Soluções**, desenvolvido e gerenciado pela **KAIRÓS Produtora**.

## Situação
Estrutura técnica inicial. O conteúdo, o ramo de atuação, as cores, as imagens e os contatos do cliente ainda precisam ser confirmados. Nenhuma identidade visual oficial foi presumida.

## Identidade visual (proposta)
Nova marca proposta para a HC Soluções — ar-condicionado e climatização. Apresentação completa em `marca.html` e em PDF (`docs/hc-solucoes-identidade-visual.pdf`, 8 páginas, 1440×900).

- **Símbolo**: o H tem a barra formada por três **aletas** (as lâminas da saída de ar do split); o C é um **mostrador** de temperatura, com o trecho em lima marcando o **ponto de conforto**.
- **Assinatura**: símbolo + "Soluções" em Instrument Serif Itálico + descritor "Ar-condicionado · Climatização" em JetBrains Mono, tudo em curvas.
- **Cores**: Grafite `#0E0E0C`, Areia `#F2EFE8`, Lima conforto `#D2FF3C`, Cinza quente `#9A958B`, Calor `#FF6A3D` (uso funcional).
- **Arquivos** em `assets/logo/`: horizontal, vertical e símbolo nas versões negativa, positiva, mono branco e mono preto; ícone de app; versão para o corpo do aparelho.
- Gerador em `tools/logo/` para alterar a geometria e reexportar tudo.

## Proposta do site — "Do complexo ao claro"
Direção de arte provisória, aguardando aprovação do cliente. O conceito traduz "soluções" em experiência: o visitante rola a página e transforma ruído em forma.

- **Hero interativo**: ~2.800 partículas em campo de fluxo (caos) se organizam no símbolo HC conforme o scroll — as do mostrador acendem em lima; o cursor dispersa as partículas.
- **Climatização**: um split com a marca HC; ao rolar, o ambiente esfria de 32° para 22°, a aleta abre, o ar sai e a luz passa de laranja (calor) para lima (conforto).
- **Manifesto**: as palavras acendem uma a uma com a rolagem; termos-chave em serifa itálica.
- **Método**: quatro etapas (Escutar, Mapear, Resolver, Acompanhar) com preenchimento em cor-sinal no hover/foco.
- **Bastidores**: painel honesto com o estado do projeto (estrutura, identidade, conteúdo, lançamento).
- **Encerramento**: assinatura tipográfica e relógio na hora local do visitante.

Tipografia: Inter Tight, Instrument Serif e JetBrains Mono (Google Fonts). Cores em variáveis CSS no topo de `css/styles.css` (`--accent` é provisória).
Acessibilidade: link de pular conteúdo, foco visível, navegação por teclado no Método, `prefers-reduced-motion` respeitado (sem animações, hero estático) e conteúdo legível sem JavaScript.

Textos de manifesto e método são genéricos e precisam de validação; nenhum serviço, contato ou dado do cliente foi inventado.

## Arquivos
- `index.html`: página inicial (proposta), acessível e responsiva
- `marca.html` e `css/marca.css`: apresentação da identidade visual (também imprime como PDF em páginas 1440×900)
- `css/styles.css`: tokens e estilos
- `js/main.js`: camadas de interação (partículas, scroll, cartões, relógio). A página funciona sem JavaScript.
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
