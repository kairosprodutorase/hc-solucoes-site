import math
W, H = 152, 120
def pt(cx, cy, R, deg):
    r = math.radians(deg); return cx + R*math.cos(r), cy + R*math.sin(r)
def symbol(ink="#f2efe8", air="#d2ff3c", cap="butt", gauge=62, open_=44):
    """Símbolo HC: H com três aletas + C-mostrador. Grid 152x120."""
    s = 18
    parts = [f'<rect x="0" y="14" width="{s}" height="92" fill="{ink}"/>',
             f'<rect x="46" y="14" width="{s}" height="92" fill="{ink}"/>']
    for yy in (45, 57, 69):
        parts.append(f'<rect x="{s}" y="{yy}" width="28" height="6" fill="{ink}"/>')
    cx, cy, R = 64 + 8 + 46, 60, 37
    a0, a_end = -open_, open_            # terminais
    split = a_end + gauge                 # início do trecho verde
    p0 = pt(cx, cy, R, a0); p1 = pt(cx, cy, R, split + 3)
    q0 = pt(cx, cy, R, split - 1); q1 = pt(cx, cy, R, a_end)
    parts.append(f'<path d="M{p0[0]:.2f} {p0[1]:.2f}A{R} {R} 0 1 0 {p1[0]:.2f} {p1[1]:.2f}" fill="none" stroke="{ink}" stroke-width="{s}" stroke-linecap="{cap}"/>')
    parts.append(f'<path d="M{q0[0]:.2f} {q0[1]:.2f}A{R} {R} 0 0 0 {q1[0]:.2f} {q1[1]:.2f}" fill="none" stroke="{air}" stroke-width="{s}" stroke-linecap="{cap}"/>')
    return "".join(parts)
if __name__ == "__main__":
    import sys
    out = sys.argv[1]; svgs = []
    for bg, ink, air in [("#0e0e0c", "#f2efe8", "#d2ff3c"), ("#f2efe8", "#0e0e0c", "#0e0e0c"), ("#d2ff3c", "#0e0e0c", "#f2efe8")]:
        svgs.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -40 232 200" width="348" height="300"><rect x="-40" y="-40" width="232" height="200" fill="{bg}"/>{symbol(ink, air)}</svg>')
    for s_ in [24, 48]:
        svgs.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -26 172 172" width="{s_}" height="{s_}" style="background:#0e0e0c;margin:8px">{symbol()}</svg>')
    open(f"{out}/sym.html","w").write('<body style="margin:0;display:flex;align-items:center;background:#222">'+"".join(svgs))
