"""Gera os SVGs da marca HC (proposta 02 — floco de neve).

Uso: HC_FONTS=caminho/das/fontes python3 tools/logo/build.py assets/logo
"""
import sys, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
sys.path.insert(0, os.path.dirname(__file__))
from symbol import symbol, W as SW, H as SH

F = os.environ.get("HC_FONTS", os.path.join(os.path.dirname(__file__), "fonts"))
fonts = {k: TTFont(os.path.join(F, v)) for k, v in
         {"serif": "serif-i.ttf", "mono": "mono500.ttf"}.items()}

def text_path(txt, font, size, x, y, track=0.0):
    f = fonts[font]; gs = f.getGlyphSet(); cmap = f.getBestCmap()
    sc = size / f["head"].unitsPerEm
    pen = SVGPathPen(gs); cx = x
    for ch in txt:
        g = cmap.get(ord(ch))
        if g is None: cx += size * 0.3; continue
        gs[g].draw(TransformPen(pen, (sc, 0, 0, -sc, cx, y)))
        cx += f["hmtx"][g][0] * sc + track * size
    return pen.getCommands(), cx - track * size

def svg(vb, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">{body}</svg>\n'

DESC = "AR-CONDICIONADO · CLIMATIZAÇÃO"
def lockup_h(ink, ice, sub):
    d1, e1 = text_path("Soluções", "serif", 86, SW + 26, 72)
    d2, e2 = text_path(DESC, "mono", 12.5, SW + 30, 106, track=0.16)
    return max(e1, e2) + 4, symbol(ink, ice) + f'<path d="{d1}" fill="{ink}"/><path d="{d2}" fill="{sub}"/>'

def lockup_v(ink, ice, sub):
    d1, e1 = text_path("Soluções", "serif", 76, 0, 0)
    d2, e2 = text_path(DESC, "mono", 10.5, 0, 0, track=0.16)
    w = max(SW, e1, e2)
    return w, (f'<g transform="translate({(w-SW)/2:.2f} 0)">{symbol(ink, ice)}</g>'
               f'<g transform="translate({(w-e1)/2:.2f} 196)"><path d="{d1}" fill="{ink}"/></g>'
               f'<g transform="translate({(w-e2)/2:.2f} 226)"><path d="{d2}" fill="{sub}"/></g>')

NOITE, NEVE, GELO, AZUL, PROFUNDO = "#070b12", "#eef4fb", "#7cc8ff", "#1f5fff", "#0b1e3a"
CINZA_D, CINZA_L, TINTA = "#8b99ad", "#4a5a70", "#0a1424"
schemes = {
    "negativo":    (NEVE, GELO, CINZA_D),
    "positivo":    (TINTA, AZUL, CINZA_L),
    "azul":        ("#ffffff", "#ffffff", "#cfe0ff"),
    "mono-branco": (NEVE, NEVE, NEVE),
    "mono-preto":  (TINTA, TINTA, TINTA),
    "aparelho":    (TINTA, AZUL, CINZA_L),
}
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
for name, (ink, ice, sub) in schemes.items():
    open(f"{out}/hc-simbolo-{name}.svg", "w").write(svg(f"0 0 {SW} {SH}", symbol(ink, ice)))
    w, b = lockup_h(ink, ice, sub)
    open(f"{out}/hc-logo-horizontal-{name}.svg", "w").write(svg(f"0 0 {w:.1f} {SH}", b))
    w, b = lockup_v(ink, ice, sub)
    open(f"{out}/hc-logo-vertical-{name}.svg", "w").write(svg(f"0 0 {w:.1f} 232", b))
grad = (f'<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{PROFUNDO}"/>'
        f'<stop offset="1" stop-color="{NOITE}"/></linearGradient></defs><rect width="256" height="256" rx="56" fill="url(#bg)"/>')
s = 1.08
open(f"{out}/hc-icone-app.svg", "w").write(svg("0 0 256 256", grad + f'<g transform="translate({(256-SW*s)/2:.1f} {(256-SH*s)/2:.1f}) scale({s})">{symbol(NEVE, GELO)}</g>'))
s = 1.24
open(f"{out}/../favicon.svg", "w").write(svg("0 0 256 256", grad + f'<g transform="translate({(256-SW*s)/2:.1f} {(256-SH*s)/2:.1f}) scale({s})">{symbol(NEVE, GELO)}</g>'))
print("ok")
