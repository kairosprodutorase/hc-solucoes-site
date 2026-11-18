# Gerador da marca HC

Gera todos os SVGs de `assets/logo/` e o `assets/favicon.svg` a partir da geometria do símbolo (`symbol.py`). Os textos da assinatura são convertidos em curvas, então os arquivos não dependem de fontes instaladas.

```bash
pip install fonttools
mkdir -p tools/logo/fonts   # baixe os .ttf: Instrument Serif Italic, Inter Tight Bold e JetBrains Mono Medium (Google Fonts)
#   serif-i.ttf, inter700.ttf, mono500.ttf
python3 tools/logo/build.py assets/logo
```
