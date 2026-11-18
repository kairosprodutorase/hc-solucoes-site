import sys, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from symbol import symbol, W as SW, H as SH

F = os.environ.get("HC_FONTS", os.path.join(os.path.dirname(__file__), "fonts"))
fonts = {k: TTFont(os.path.join(F, v)) for k, v in
         {"serif": "serif-i.ttf", "sans": "inter700.ttf", "mono": "mono500.ttf"}.items()}

def text_path(txt, font, size, x, y, track=0.0):
    f = fonts[font]; gs = f.getGlyphSet(); cmap = f.getBestCmap()
    upm = f["head"].unitsPerEm; sc = size / upm
    kern = {}
    pen = SVGPathPen(gs); cx = x
    for ch in txt:
        g = cmap.get(ord(ch))
        if g is None: cx += size * 0.3; continue
        tp = TransformPen(pen, (sc, 0, 0, -sc, cx, y))
        gs[g].draw(tp)
        cx += f["hmtx"][g][0] * sc + track * size
    return pen.getCommands(), cx - track * size

def svg(vb, body, w=None):
    a = f' width="{w}"' if w else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"{a}>{body}</svg>\n'

def lockup_h(ink, air, sub):
    d1, end1 = text_path("Soluções", "serif", 86, SW + 26, 72)
    d2, end2 = text_path("AR-CONDICIONADO · CLIMATIZAÇÃO", "mono", 12.5, SW + 30, 106, track=0.16)
    width = max(end1, end2) + 4
    body = symbol(ink, air) + f'<path d="{d1}" fill="{ink}"/><path d="{d2}" fill="{sub}"/>'
    return width, body

def lockup_v(ink, air, sub):
    d1, e1 = text_path("Soluções", "serif", 76, 0, 0)
    d2, e2 = text_path("AR-CONDICIONADO · CLIMATIZAÇÃO", "mono", 10.5, 0, 0, track=0.16)
    width = max(SW, e1, e2)
    t1x, t2x, symx = (width - e1) / 2, (width - e2) / 2, (width - SW) / 2
    body = (f'<g transform="translate({symx:.2f} 0)">{symbol(ink, air)}</g>'
            f'<g transform="translate({t1x:.2f} 196)"><path d="{d1}" fill="{ink}"/></g>'
            f'<g transform="translate({t2x:.2f} 226)"><path d="{d2}" fill="{sub}"/></g>')
    return width, body

out = sys.argv[1]; os.makedirs(out, exist_ok=True)
DARK, LIGHT, LIME, MUTED_D, MUTED_L = "#0e0e0c", "#f2efe8", "#d2ff3c", "#9a958b", "#5b5850"
schemes = {"negativo": (LIGHT, LIME, MUTED_D), "positivo": (DARK, DARK, MUTED_L), "mono-branco": (LIGHT, LIGHT, LIGHT), "mono-preto": (DARK, DARK, DARK)}
for name, (ink, air, sub) in schemes.items():
    open(f"{out}/hc-simbolo-{name}.svg", "w").write(svg(f"0 0 {SW} {SH}", symbol(ink, air)))
    w, b = lockup_h(ink, air, sub)
    open(f"{out}/hc-logo-horizontal-{name}.svg", "w").write(svg(f"0 0 {w:.1f} {SH}", b))
    w, b = lockup_v(ink, air, sub)
    open(f"{out}/hc-logo-vertical-{name}.svg", "w").write(svg(f"0 0 {w:.1f} 232", b))
# ícone de aplicativo / avatar
icon = f'<rect width="256" height="256" rx="56" fill="{DARK}"/><g transform="translate(37.6 71.5) scale(1.19)">{symbol(LIGHT, LIME)}</g>'
open(f"{out}/hc-icone-app.svg", "w").write(svg("0 0 256 256", icon))
fav = f'<rect width="256" height="256" rx="56" fill="{DARK}"/><g transform="translate(28 64) scale(1.31)">{symbol(LIGHT, LIME)}</g>'
open(f"{out}/../favicon.svg", "w").write(svg("0 0 256 256", fav))
print("ok")
# versão para o corpo claro do aparelho: grafite + mostrador lima com contorno sutil
w, b = lockup_h(DARK, "#b6e61e", MUTED_L)
open(f"{out}/hc-logo-horizontal-aparelho.svg", "w").write(svg(f"0 0 {w:.1f} {SH}", b))
print("aparelho", round(w,1))
