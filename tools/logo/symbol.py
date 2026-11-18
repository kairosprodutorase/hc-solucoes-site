"""Símbolo HC — Proposta 02 · Floco (refinada).

O floco de seis pontas forma a barra do H e se encaixa nas hastes; o C é o arco do ar.
Refinamentos sobre a primeira versão:
  - ramificações a 60° (ângulo real do cristal de gelo) e afastadas das hastes;
  - núcleo hexagonal vazado no centro do floco;
  - compensação óptica do C (traço +1 e ultrapassagem de 1 unidade acima e abaixo);
  - respiro maior entre H e C e terminais do C a 48°.
Grade: 172 x 120. Módulo x = 18 (espessura da haste).
"""
import math

W, H = 172, 120
X = 18                       # módulo: espessura da haste
FLAKE = dict(cx=42, cy=60, arm=31, w=6, barb_at=0.5, barb_len=9, barb_w=4.5, hub=6.5, hole=2.7)
C = dict(cx=140.5, cy=60, r=37.5, w=19, open=48)


def _line(x1, y1, x2, y2, w, paint):
    return f'<path d="M{x1:.2f} {y1:.2f}L{x2:.2f} {y2:.2f}" {paint} stroke-width="{w}" fill="none"/>'


def _hex(cx, cy, r, paint, rot=30):
    pts = " ".join(f"{cx + r*math.cos(math.radians(rot + 60*i)):.2f},{cy + r*math.sin(math.radians(rot + 60*i)):.2f}" for i in range(6))
    return f'<polygon points="{pts}" {paint}/>'


def _paint(c, kind):
    """Aceita uma cor ('#fff') ou um atributo pronto ('style="..."')."""
    return c if "=" in c else f'{kind}="{c}"'


def flake(ice):
    f = FLAKE; cx, cy = f["cx"], f["cy"]
    S, F = _paint(ice, "stroke"), _paint(ice.replace("stroke", "fill"), "fill")
    out = []
    for k in range(6):
        a = math.radians(60 * k)
        dx, dy = math.cos(a), math.sin(a)
        out.append(_line(cx, cy, cx + dx * f["arm"], cy + dy * f["arm"], f["w"], S))
        px, py = cx + dx * f["arm"] * f["barb_at"], cy + dy * f["arm"] * f["barb_at"]
        for s in (-1, 1):
            b = a + s * math.radians(60)
            out.append(_line(px, py, px + math.cos(b) * f["barb_len"], py + math.sin(b) * f["barb_len"], f["barb_w"], S))
    out.append(_hex(cx, cy, f["hub"], F))
    return "".join(out)


def stems(ink):
    F = _paint(ink, "fill")
    return f'<rect x="0" y="14" width="{X}" height="92" {F}/><rect x="66" y="14" width="{X}" height="92" {F}/>'


def arc(ink):
    c = C; a = math.radians(c["open"])
    sx, sy = c["cx"] + c["r"] * math.cos(a), c["cy"] - c["r"] * math.sin(a)
    ey = c["cy"] + c["r"] * math.sin(a)
    return f'<path d="M{sx:.2f} {sy:.2f}A{c["r"]} {c["r"]} 0 1 0 {sx:.2f} {ey:.2f}" fill="none" {_paint(ink, "stroke")} stroke-width="{c["w"]}"/>'


def hole_mask(mid):
    f = FLAKE
    return (f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="{W}" height="{H}">'
            f'<rect width="{W}" height="{H}" fill="#fff"/>{_hex(f["cx"], f["cy"], f["hole"], "fill=\"#000\"")}</mask>')


def symbol(ink="#eef4fb", ice="#7cc8ff", mid=None):
    """Símbolo completo (núcleo do floco realmente vazado, via máscara)."""
    mid = mid or f"hc{abs(hash((ink, ice))) % 10**6}"
    return hole_mask(mid) + f'<g mask="url(#{mid})">{flake(ice)}</g>' + stems(ink) + arc(ink)


if __name__ == "__main__" and len(__import__("sys").argv) > 2:  # prévia: original x refinada
    import sys, importlib.util
    out = sys.argv[1]
    spec = importlib.util.spec_from_file_location("orig", sys.argv[2]); orig = importlib.util.module_from_spec(spec); spec.loader.exec_module(orig)
    rows = []
    for label, fn in (("Antes", orig.symbol), ("Refinada", symbol)):
        cells = [f'<b style="color:#fff;font:16px sans-serif;width:90px">{label}</b>']
        for bg, ink, ice in [("#070b12", "#eef4fb", "#7cc8ff"), ("#eef4fb", "#0a1424", "#1f5fff"), ("#1f5fff", "#ffffff", "#7cc8ff")]:
            cells.append(f'<svg viewBox="-24 -14 {W+48} 148" width="{(W+48)*1.45:.0f}" height="215"><rect x="-24" y="-14" width="{W+48}" height="148" fill="{bg}"/>{fn(ink, ice)}</svg>')
        cells.append("".join(f'<svg viewBox="-10 {60-(W+20)/2} {W+20} {W+20}" width="{s}" height="{s}" style="background:#070b12;margin:4px">{fn()}</svg>' for s in (16, 32, 64)))
        rows.append('<div style="display:flex;align-items:center;gap:6px;margin:6px">' + "".join(cells) + "</div>")
    open(f"{out}/refine.html", "w").write('<body style="margin:0;background:#333">' + "".join(rows))
