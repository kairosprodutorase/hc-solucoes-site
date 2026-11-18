"""Símbolo HC — Proposta 03 · Cristal.

H (estrutura) segura um floco desenhado sob medida: três vigas a 0°, 60° e 120°,
barras nas pontas (a mesma linguagem das hastes do H) e núcleo hexagonal vazado.
O C (fluxo de ar) termina com a ponta superior "gelada".
Grade: 178 x 120. Módulo x = 18 (espessura da haste).
"""
import math

W, H = 178, 120
X = 18                      # módulo
FLAKE_C = (46, 60)          # centro do floco
BEAM = 7                    # espessura das vigas
ARM = 33                    # raio até a barra da ponta
TIP = 17                    # comprimento da barra da ponta
HUB = 8.5                   # núcleo hexagonal (raio)
C_CX, C_R = 148, 37         # centro e raio do C (traço = X)
C_OPEN = 52                 # abertura dos terminais (graus)
FROST = 60                  # trecho gelado do C (graus)
CUT = 2.2                   # corte entre o trecho gelado e o C


def _rot_rect(cx, cy, w, h, ang):
    a = math.radians(ang)
    ca, sa = math.cos(a), math.sin(a)
    pts = []
    for dx, dy in ((-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)):
        pts.append((cx + dx * ca - dy * sa, cy + dx * sa + dy * ca))
    return pts


def _poly(pts, attr):
    return '<polygon points="' + " ".join(f"{x:.2f},{y:.2f}" for x, y in pts) + f'" {attr}/>'


def _hex(cx, cy, r, attr):
    return _poly([(cx + r * math.cos(math.radians(60 * i)), cy + r * math.sin(math.radians(60 * i))) for i in range(6)], attr)


def _pt(deg, R=C_R):
    r = math.radians(deg)
    return C_CX + R * math.cos(r), 60 + R * math.sin(r)


def parts(ink, ice, frost=None, hole="none"):
    """Retorna (floco, hastes, arco, ponta) como strings SVG.
    `ink`, `ice`, `frost` são atributos completos (ex.: 'fill="#fff"') ou cores."""
    def F(c): return c if "=" in c else f'fill="{c}"'
    def S(c): return c if "=" in c else f'stroke="{c}"'
    frost = frost or ice
    cx, cy = FLAKE_C
    fl = [_poly(_rot_rect(cx, cy, 56, BEAM, 0), F(ice))]
    for ang in (60, 120):
        fl.append(_poly(_rot_rect(cx, cy, 2 * ARM, BEAM, ang), F(ice)))
        for s in (-1, 1):
            tx = cx + s * ARM * math.cos(math.radians(ang))
            ty = cy + s * ARM * math.sin(math.radians(ang))
            fl.append(_poly(_rot_rect(tx, ty, BEAM, TIP, ang), F(ice)))
    fl.append(_hex(cx, cy, HUB, F(ice)))
    if hole != "none":
        fl.append(_hex(cx, cy, HUB * 0.42, F(hole)))
    stems = (f'<rect x="0" y="14" width="{X}" height="92" {F(ink)}/>'
             f'<rect x="74" y="14" width="{X}" height="92" {F(ink)}/>')
    top, bot = -C_OPEN, C_OPEN
    s = top - FROST
    c0, c1 = _pt(s), _pt(bot)
    f0, f1 = _pt(top), _pt(s - CUT)
    arc = f'<path d="M{c0[0]:.2f} {c0[1]:.2f}A{C_R} {C_R} 0 1 0 {c1[0]:.2f} {c1[1]:.2f}" fill="none" {S(ink)} stroke-width="{X}"/>'
    tip = f'<path d="M{f0[0]:.2f} {f0[1]:.2f}A{C_R} {C_R} 0 0 0 {f1[0]:.2f} {f1[1]:.2f}" fill="none" {S(frost)} stroke-width="{X}"/>'
    return "".join(fl), stems, arc, tip


def symbol(ink="#eef4fb", ice="#7cc8ff", frost=None, hole=None):
    """Símbolo completo. `hole` = cor do furo do núcleo (padrão: transparente via máscara)."""
    fl, stems, arc, tip = parts(ink, ice, frost, hole or "none")
    if hole is None:   # furo real (transparente), via máscara
        cx, cy = FLAKE_C
        mid = f"hcm{abs(hash((ink, ice, frost))) % 10**6}"
        hole_hex = _hex(cx, cy, HUB * 0.42, 'fill="#000"')
        fl = (f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="{W}" height="{H}">'
              f'<rect width="{W}" height="{H}" fill="#fff"/>{hole_hex}</mask><g mask="url(#{mid})">{fl}</g>')
    return fl + stems + arc + tip
