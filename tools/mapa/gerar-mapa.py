"""Gera js/intro-map.js: grade de pontos de Aracaju, Barra dos Coqueiros e arredores.

Fonte: malhas municipais do IBGE (API de malhas v3, qualidade máxima), em tools/mapa/ibge/.
Uso: python3 tools/mapa/gerar-mapa.py   (requer Pillow)

Legenda da grade:  .  vazio (mar/fora)   o  municípios vizinhos   a  Aracaju
                   b  Barra dos Coqueiros   r  rio Sergipe   p  ponte   s  sede da HC
"""
import json, math, pathlib
from PIL import Image, ImageDraw

HERE = pathlib.Path(__file__).parent
OUT = HERE.parent.parent / 'js' / 'intro-map.js'
SERVED = {'2800308': 'a', '2800605': 'b'}            # Aracaju, Barra dos Coqueiros
LON0, LON1, LAT0, LAT1 = -37.36, -36.80, -11.20, -10.70
COLS = 112
SEDE = (-37.035, -10.955)                            # Atalaia Nova, Barra dos Coqueiros
PONTE_LAT = -10.905                                  # ponte Construtor João Alves

kx = math.cos(math.radians(11))                      # escala da longitude nessa latitude
ROWS = round(COLS * (LAT1 - LAT0) / ((LON1 - LON0) * kx))
S = 8
img = Image.new('L', (COLS * S, ROWS * S), 0)
d = ImageDraw.Draw(img)
xy = lambda lon, lat: ((lon - LON0) / (LON1 - LON0) * COLS * S, (LAT1 - lat) / (LAT1 - LAT0) * ROWS * S)
files = sorted(HERE.glob('ibge/*.json'), key=lambda f: f.stem in SERVED)
for f in files:
    g = json.loads(f.read_text())['features'][0]['geometry']
    polys = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
    val = {'a': 255, 'b': 200}.get(SERVED.get(f.stem), 100)
    for P in polys:
        d.polygon([xy(*p) for p in P[0]], fill=val)
        for hole in P[1:]:
            d.polygon([xy(*p) for p in hole], fill=0)

grid = [[{100: 'o', 200: 'b', 255: 'a'}.get(img.getpixel((c * S + S // 2, r * S + S // 2)), '.')
         for c in range(COLS)] for r in range(ROWS)]

# o rio Sergipe separa as duas cidades: a última célula de Aracaju antes da Barra vira rio
for row in grid:
    for c in range(1, COLS):
        if row[c] == 'b' and row[c - 1] == 'a':
            row[c - 1] = 'r'
pr = round((LAT1 - PONTE_LAT) / (LAT1 - LAT0) * ROWS)
for c in range(COLS):
    if grid[pr][c] == 'r':
        grid[pr][c] = 'p'
# sede: célula da Barra mais próxima de Atalaia Nova
sx, sy = xy(*SEDE)
best = min(((r, c) for r in range(ROWS) for c in range(COLS) if grid[r][c] == 'b'),
           key=lambda rc: (rc[1] * S + S / 2 - sx) ** 2 + (rc[0] * S + S / 2 - sy) ** 2)
grid[best[0]][best[1]] = 's'

rows = [''.join(r) for r in grid]
OUT.write_text(
    '/* Gerado por tools/mapa/gerar-mapa.py a partir das malhas municipais do IBGE. Não editar à mão. */\n'
    f'window.HC_MAP = {{ cols: {COLS}, rows: {ROWS}, grid: {json.dumps(rows)} }};\n')
print(OUT, ROWS, 'linhas; sede em', best, '; ponte na linha', pr)
