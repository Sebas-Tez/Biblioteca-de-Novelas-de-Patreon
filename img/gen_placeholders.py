import os

novelas = [
    ("universo-estelar", "Viajando en el Universo Estelar", "#D4AF37"),
    ("reino-de-cenizas", "El Reino de Cenizas", "#B5502E"),
    ("ultimo-refugio", "El Ultimo Refugio", "#4A6670"),
    ("ascension-del-cultivador", "Ascension del Cultivador", "#6B4E9C"),
    ("corazon-de-hierro", "Corazon de Hierro", "#8A8A8A"),
    ("reinas-del-abismo", "Reinas del Abismo", "#7A2148"),
    ("cronicas-del-vacio", "Cronicas del Vacio", "#2C3E82"),
    ("sombra-carmesi", "Sombra Carmesi", "#9C1F2E"),
    ("el-ultimo-guardian", "El Ultimo Guardian", "#2E7D5B"),
    ("nexus-fantasma", "Nexus Fantasma", "#5B4636"),
]

cover_tpl = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="{color}" stop-opacity="0.55"/>
<stop offset="1" stop-color="#0b0b0b" stop-opacity="1"/>
</linearGradient>
</defs>
<rect width="400" height="600" fill="#141414"/>
<rect width="400" height="600" fill="url(#g)"/>
<rect x="16" y="16" width="368" height="568" fill="none" stroke="{color}" stroke-opacity="0.5" stroke-width="1.5"/>
<circle cx="200" cy="230" r="70" fill="none" stroke="{color}" stroke-width="2" stroke-opacity="0.8"/>
<circle cx="200" cy="230" r="46" fill="none" stroke="{color}" stroke-width="1" stroke-opacity="0.5"/>
<text x="200" y="238" font-family="Georgia, serif" font-size="15" fill="{color}" text-anchor="middle" opacity="0.9">EL ESPIA</text>
<foreignObject x="30" y="420" width="340" height="150">
<div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color:#f2f2f2; font-size:26px; font-weight:700; text-align:center; line-height:1.25; text-transform:uppercase; letter-spacing:0.5px;">{title}</div>
</foreignObject>
</svg>"""

banner_tpl = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 500" width="1600" height="500">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="{color}" stop-opacity="0.45"/>
<stop offset="1" stop-color="#0b0b0b" stop-opacity="1"/>
</linearGradient>
</defs>
<rect width="1600" height="500" fill="#141414"/>
<rect width="1600" height="500" fill="url(#bg)"/>
<circle cx="1250" cy="250" r="150" fill="none" stroke="{color}" stroke-opacity="0.6" stroke-width="2"/>
<foreignObject x="80" y="200" width="900" height="150">
<div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color:#f2f2f2; font-size:44px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">{title}</div>
</foreignObject>
</svg>"""

os.makedirs("covers", exist_ok=True)
os.makedirs("banners", exist_ok=True)

for slug, title, color in novelas:
    with open(f"covers/{slug}.svg", "w", encoding="utf-8") as f:
        f.write(cover_tpl.format(color=color, title=title))
    with open(f"banners/{slug}.svg", "w", encoding="utf-8") as f:
        f.write(banner_tpl.format(color=color, title=title))

print("done")
