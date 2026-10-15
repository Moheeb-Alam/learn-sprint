"""Generates the portfolio illustrations (SVG), favicon and social-share image.
Run:  python3 scripts/generate-assets.py   (needs Pillow only for og-image.png / favicon.ico)
The generated files are committed, so you only need this if you want to change them."""
import os
OUT = os.path.join(os.path.dirname(__file__), '..', 'public')
IMG = os.path.join(OUT, 'img')
os.makedirs(IMG, exist_ok=True)

def rect(x, y, w, h, fill, r=6, extra=''):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" {extra}/>'

def bars(x, y, widths, color='#D5DBEE', h=8, gap=16):
    return ''.join(rect(x, y + i * gap, w, h, color, 4) for i, w in enumerate(widths))

def frame(title, c1, c2, inner):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500" role="img" aria-label="{title}">
<title>{title}</title>
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient></defs>
<rect width="800" height="500" fill="url(#g)"/>
<rect x="60" y="44" width="680" height="412" rx="14" fill="#fff"/>
<path d="M60 58a14 14 0 0 1 14-14h652a14 14 0 0 1 14 14v26H60z" fill="#EEF1FB"/>
<circle cx="84" cy="64" r="5" fill="#FF7A8A"/><circle cx="102" cy="64" r="5" fill="#FFCB6B"/><circle cx="120" cy="64" r="5" fill="#6BD9A0"/>
{rect(160, 56, 300, 16, '#fff', 8)}
{inner}
</svg>'''

def cafe(a):
    return (rect(80, 100, 640, 150, a, 10) + rect(110, 128, 250, 16, '#fff', 8, 'opacity=".9"') + rect(110, 156, 190, 10, '#fff', 5, 'opacity=".6"')
            + rect(110, 190, 110, 32, '#fff', 16)
            + ''.join(rect(80 + i * 218, 270, 204, 160, '#F3F5FC', 10) + rect(94 + i * 218, 284, 176, 72, a, 8, 'opacity=".35"') + bars(94 + i * 218, 372, [120, 80]) for i in range(3)))

def legal(a):
    return (rect(80, 96, 640, 40, '#0C1433', 8) + rect(98, 111, 90, 10, '#8FB0FF', 4) + ''.join(rect(480 + i * 62, 113, 44, 8, '#4A5578', 4) for i in range(3))
            + rect(80, 152, 380, 20, '#1C2340', 6) + rect(80, 182, 300, 20, '#1C2340', 6) + bars(80, 226, [360, 330, 280], '#D5DBEE', 8, 18) + rect(80, 296, 130, 34, a, 17)
            + rect(500, 152, 220, 180, '#EEF1FB', 12) + rect(520, 172, 180, 90, a, 8, 'opacity=".3"') + bars(520, 282, [140, 100], '#C3CBE4')
            + ''.join(rect(80 + i * 218, 360, 204, 76, '#F3F5FC', 10) + bars(96 + i * 218, 380, [110, 150, 90], '#D5DBEE', 7, 14) for i in range(3)))

def board(a):
    cols = ''
    for i in range(3):
        x = 80 + i * 218
        cols += rect(x, 100, 204, 340, '#F3F5FC', 10) + rect(x + 14, 114, 80, 10, '#8A93B2', 5)
        for j in range([3, 2, 3][i]):
            y = 140 + j * 98
            cols += rect(x + 12, y, 180, 84, '#fff', 8, 'stroke="#E1E5F2"') + rect(x + 24, y + 14, 120, 8, '#1C2340', 4) + rect(x + 24, y + 32, 80, 7, '#D5DBEE', 4) + rect(x + 24, y + 56, 34, 14, a, 7) + f'<circle cx="{x + 170}" cy="{y + 62}" r="9" fill="{a}" opacity=".5"/>'
    return cols

def dashboard(a):
    s = rect(80, 100, 120, 340, '#0C1433', 10) + ''.join(rect(96, 124 + i * 34, 88, 10, '#4A5578' if i else a, 5) for i in range(6))
    s += ''.join(rect(220 + i * 168, 100, 154, 70, '#F3F5FC', 10) + rect(234 + i * 168, 116, 60, 8, '#8A93B2', 4) + rect(234 + i * 168, 136, 90, 16, a, 6, 'opacity=".8"') for i in range(3))
    s += rect(220, 186, 310, 150, '#F3F5FC', 10) + ''.join(rect(240 + i * 38, 316 - h, 24, h, a, 5, f'opacity="{0.35 + i * 0.09:.2f}"') for i, h in enumerate([50, 80, 60, 110, 90, 120, 100]))
    s += rect(546, 186, 174, 150, '#F3F5FC', 10) + f'<circle cx="633" cy="262" r="46" fill="none" stroke="{a}" stroke-width="18" stroke-dasharray="190 100" opacity=".85"/>'
    s += ''.join(rect(220, 352 + i * 28, 500, 20, '#F3F5FC' if i % 2 == 0 else '#fff', 4) + rect(232, 358 + i * 28, 120, 7, '#C3CBE4', 4) + rect(620, 358 + i * 28, 70, 7, a, 4, 'opacity=".5"') for i in range(3))
    return s

def store(a):
    s = rect(80, 96, 640, 32, '#F3F5FC', 8) + rect(94, 106, 70, 12, '#1C2340', 5) + rect(640, 104, 64, 16, a, 8)
    for r in range(2):
        for c in range(4):
            x, y = 80 + c * 164, 144 + r * 148
            s += rect(x, y, 148, 100, a, 10, f'opacity="{0.18 + ((r * 4 + c) % 4) * 0.12:.2f}"') + rect(x, y + 110, 100, 8, '#1C2340', 4) + rect(x, y + 126, 50, 8, a, 4)
    return s

def boutique(a):
    s = rect(80, 96, 640, 30, '#fff', 0, 'stroke="#E1E5F2"') + rect(360, 106, 80, 10, '#1C2340', 5)
    s += rect(80, 140, 300, 300, a, 12, 'opacity=".28"') + f'<circle cx="230" cy="260" r="64" fill="{a}" opacity=".55"/>' + rect(170, 330, 120, 110, a, 20, 'opacity=".55"')
    s += rect(404, 150, 160, 16, '#1C2340', 6) + bars(404, 182, [250, 220, 180]) + rect(404, 250, 130, 34, a, 17)
    s += ''.join(rect(404 + i * 106, 312, 98, 128, a, 10, f'opacity="{0.2 + i * 0.12:.2f}"') for i in range(3))
    return s

def portal(a):
    s = rect(80, 96, 150, 344, '#0C1433', 10) + ''.join(rect(98, 122 + i * 36, 114, 12, a if i == 1 else '#4A5578', 6) for i in range(6))
    s += rect(250, 96, 470, 52, '#EEF1FB', 10) + rect(266, 112, 160, 12, '#1C2340', 5) + rect(266, 130, 100, 8, '#8A93B2', 4)
    for r in range(5):
        for c in range(5):
            on = (r * 3 + c * 2) % 5 in (0, 2)
            s += rect(250 + c * 95, 164 + r * 54, 88, 46, a if on else '#F3F5FC', 8, 'opacity=".55"' if on else '')
    return s

def results(a):
    s = rect(80, 96, 640, 44, '#0C1433', 8) + ''.join(rect(100 + i * 150, 112, 90, 10, '#8FB0FF', 5) for i in range(4))
    grades = [a, '#6BD9A0', a, '#FFCB6B', '#6BD9A0', a, '#6BD9A0']
    for i, g in enumerate(grades):
        y = 150 + i * 42
        s += rect(80, y, 640, 36, '#F3F5FC' if i % 2 == 0 else '#fff', 6) + rect(100, y + 13, 120, 9, '#C3CBE4', 4) + rect(250, y + 13, 70, 9, '#D5DBEE', 4) + rect(400, y + 13, 70, 9, '#D5DBEE', 4) + rect(640, y + 8, 56, 20, g, 10, 'opacity=".85"')
    return s

def chat(a):
    s = rect(80, 96, 640, 344, '#F3F5FC', 12) + rect(80, 96, 640, 48, a, 12) + f'<circle cx="112" cy="120" r="14" fill="#fff" opacity=".9"/>' + rect(138, 112, 120, 10, '#fff', 5)
    s += rect(104, 166, 270, 52, '#fff', 14) + bars(122, 182, [220, 160], '#C3CBE4', 7, 14)
    s += rect(446, 236, 250, 40, a, 14) + rect(466, 252, 170, 8, '#fff', 4, 'opacity=".8"')
    s += rect(104, 296, 310, 66, '#fff', 14) + bars(122, 312, [260, 230, 120], '#C3CBE4', 7, 14)
    s += rect(104, 392, 520, 32, '#fff', 16, 'stroke="#E1E5F2"') + rect(650, 392, 46, 32, a, 16)
    return s

PROJECTS = [
  ('northwind-cafe', 'Café website illustration', '#2F62F0', '#6D4BEA', '#3D7BFF', cafe),
  ('harbor-legal', 'Professional services website illustration', '#0C1433', '#2F62F0', '#2F62F0', legal),
  ('taskbridge', 'Task board web app illustration', '#6D4BEA', '#2F62F0', '#6D4BEA', board),
  ('stockroom', 'Inventory dashboard illustration', '#141D45', '#6D4BEA', '#2F62F0', dashboard),
  ('cedar-store', 'Online store illustration', '#2F62F0', '#141D45', '#3D7BFF', store),
  ('bloom-boutique', 'Boutique store illustration', '#8A5CF0', '#3D7BFF', '#8A5CF0', boutique),
  ('brightfield-portal', 'School portal illustration', '#0C1433', '#6D4BEA', '#3D7BFF', portal),
  ('results-viewer', 'Exam results illustration', '#3D7BFF', '#0C1433', '#6D4BEA', results),
  ('helpdesk-assistant', 'Chatbot illustration', '#6D4BEA', '#141D45', '#6D4BEA', chat),
]
for slug, title, c1, c2, accent, fn in PROJECTS:
    with open(os.path.join(IMG, f'project-{slug}.svg'), 'w', encoding='utf-8') as f:
        f.write(frame(title, c1, c2, fn(accent)))

# Favicon / logo mark
MARK = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3D7BFF"/><stop offset="1" stop-color="#7A5CFF"/></linearGradient></defs>
<rect width="64" height="64" rx="16" fill="url(#a)"/>
<path d="M21 16v28h14" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M33 30l11-11m0 0h-9m9 0v9" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>'''
open(os.path.join(OUT, 'favicon.svg'), 'w').write(MARK)

try:
    from PIL import Image, ImageDraw, ImageFont
    def gradient(w, h, c1, c2):
        im = Image.new('RGB', (w, h)); px = im.load()
        for y in range(h):
            for x in range(w):
                t = (x / w + y / h) / 2
                px[x, y] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
        return im
    # favicon.ico
    ico = gradient(64, 64, (61, 123, 255), (122, 92, 255)); d = ImageDraw.Draw(ico)
    d.line([(21, 16), (21, 44), (35, 44)], fill='white', width=7)
    d.line([(33, 30), (44, 19)], fill='white', width=5); d.line([(35, 19), (44, 19), (44, 28)], fill='white', width=5)
    ico.save(os.path.join(OUT, 'favicon.ico'), sizes=[(16, 16), (32, 32), (64, 64)])
    # social share image
    og = gradient(1200, 630, (7, 11, 31), (47, 38, 140)); d = ImageDraw.Draw(og)
    def font(size, bold=True):
        for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
            if os.path.exists(p): return ImageFont.truetype(p, size)
        return ImageFont.load_default()
    d.rounded_rectangle([80, 80, 160, 160], radius=20, fill=(80, 110, 250))
    d.line([(105, 100), (105, 140), (125, 140)], fill='white', width=9)
    d.text((184, 98), 'LearnSprint.ink', font=font(44), fill='white')
    d.text((80, 270), 'We Build Digital Solutions', font=font(70), fill='white')
    d.text((80, 360), 'That Grow Your Business', font=font(70), fill='white')
    d.text((80, 500), 'Websites  •  Web apps  •  School systems  •  AI chatbots', font=font(30, False), fill=(183, 200, 255))
    og.save(os.path.join(IMG, 'og-image.png'), optimize=True)
except ImportError:
    print('Pillow not installed: skipped favicon.ico and og-image.png')
print('assets generated')
