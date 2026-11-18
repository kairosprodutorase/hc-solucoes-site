import math
W, H = 172, 120
def _line(x1, y1, x2, y2, w, color, cap="butt"):
    return f'<path d="M{x1:.2f} {y1:.2f}L{x2:.2f} {y2:.2f}" stroke="{color}" stroke-width="{w}" stroke-linecap="{cap}" fill="none"/>'
def flake(cx, cy, L, w, color, barb=0.58, blen=9, bw=None, cap="butt", hub=0):
    bw = bw or w
    out = []
    for k in range(6):
        a = math.radians(k * 60)
        dx, dy = math.cos(a), math.sin(a)
        out.append(_line(cx, cy, cx + dx*L, cy + dy*L, w, color, cap))
        if k % 3 != 0 or True:
            px, py = cx + dx*L*barb, cy + dy*L*barb
            for s in (-1, 1):
                b = a + s*math.radians(52)
                out.append(_line(px, py, px + math.cos(b)*blen, py + math.sin(b)*blen, bw, color, cap))
    if hub:
        pts = " ".join(f"{cx+hub*math.cos(math.radians(30+60*i)):.2f},{cy+hub*math.sin(math.radians(30+60*i)):.2f}" for i in range(6))
        out.append(f'<polygon points="{pts}" fill="{color}"/>')
    return "".join(out)
def symbol(ink="#eef4fb", ice="#7cc8ff", barbs_on_h=False):
    """HC com floco de neve como barra do H. Grid 172x120."""
    s = 18
    p = [flake(42, 60, 31, 6, ice, barb=0.56, blen=10, bw=4.5),
         f'<rect x="0" y="14" width="{s}" height="92" fill="{ink}"/>',
         f'<rect x="66" y="14" width="{s}" height="92" fill="{ink}"/>']
    cx, cy, R = 84 + 8 + 46, 60, 37
    a = math.radians(44)
    sx, sy = cx + R*math.cos(a), cy - R*math.sin(a)
    ex, ey = sx, cy + R*math.sin(a)
    p.append(f'<path d="M{sx:.2f} {sy:.2f}A{R} {R} 0 1 0 {ex:.2f} {ey:.2f}" fill="none" stroke="{ink}" stroke-width="{s}"/>')
    return "".join(p)
if __name__ == "__main__":  # prévia rápida
    import sys
    out = sys.argv[1]; svgs = []
    for bg, ink, ice in [("#070b12", "#eef4fb", "#7cc8ff"), ("#f4f8fc", "#0a1424", "#1f5fff"), ("#1f5fff", "#ffffff", "#ffffff"), ("#0b1e3a","#eef4fb","#7cc8ff")]:
        svgs.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -30 232 180" width="290" height="225"><rect x="-30" y="-30" width="232" height="180" fill="{bg}"/>{symbol(ink, ice)}</svg>')
    for s_ in [20, 32, 64]:
        svgs.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-12 -38 196 196" width="{s_}" height="{s_}" style="background:#070b12;margin:6px">{symbol()}</svg>')
    open(f"{out}/sym2.html","w").write('<body style="margin:0;display:flex;flex-wrap:wrap;align-items:center;background:#333">'+"".join(svgs))
