# HC Soluções — Site

Projeto de site da **HC Soluções**, desenvolvido e gerenciado pela **KAIRÓS Produtora**.

## Situação
Estrutura técnica inicial. O conteúdo, o ramo de atuação, as cores, as imagens e os contatos do cliente ainda precisam ser confirmados. Nenhuma identidade visual oficial foi presumida.

## Arquivos
- `index.html`: página inicial provisória, acessível e responsiva
- `css/styles.css`: estilos de base
- `js/` reserva espaço para scripts futuros. A página inicial funciona sem JavaScript.
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
