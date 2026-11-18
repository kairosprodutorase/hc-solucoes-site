# Gerador da marca HC

Proposta 02 (floco de neve). A proposta 01 está em `proposta-01/`.

Gera todos os SVGs de `assets/logo/` e o `assets/favicon.svg` a partir da geometria do símbolo (`symbol.py`). Os textos da assinatura são convertidos em curvas, então os arquivos não dependem de fontes instaladas.

```bash
pip install fonttools
mkdir -p tools/logo/fonts   # baixe os .ttf: Instrument Serif Italic, JetBrains Mono Medium (Google Fonts)
#   serif-i.ttf, mono500.ttf
python3 tools/logo/build.py assets/logo
```
