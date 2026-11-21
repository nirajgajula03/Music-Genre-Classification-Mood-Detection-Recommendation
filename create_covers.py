from pathlib import Path

folder = Path("frontend/public/covers")
folder.mkdir(parents=True, exist_ok=True)

covers = {
    "kesariya": ("KESARIYA", "#ff7e5f", "#feb47b"),
    "tum-hi-ho": ("TUM HI HO", "#283048", "#859398"),
    "raataan-lambiyan": ("RAATAAN LAMBIYAN", "#614385", "#516395"),
    "apna-bana-le": ("APNA BANA LE", "#ee9ca7", "#ffdde1"),
    "ghungroo": ("GHUNGROO", "#f7971e", "#ffd200"),
    "heeriye": ("HEERIYE", "#11998e", "#38ef7d"),
}

for filename, (title, color1, color2) in covers.items():
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg"
    width="600" height="600" viewBox="0 0 600 600">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="{color1}"/>
        <stop offset="100%" stop-color="{color2}"/>
      </linearGradient>
    </defs>
    <rect width="600" height="600" rx="30" fill="url(#bg)"/>
    <circle cx="300" cy="235" r="125" fill="#ffffff" opacity=".13"/>
    <circle cx="300" cy="235" r="90" fill="none"
      stroke="#ffffff" stroke-width="3" opacity=".5"/>
    <text x="300" y="265" text-anchor="middle"
      font-size="100" fill="white">♫</text>
    <text x="300" y="445" text-anchor="middle"
      font-family="Arial" font-size="34" font-weight="bold"
      fill="white">{title}</text>
    <text x="300" y="490" text-anchor="middle"
      font-family="Arial" font-size="20" fill="white"
      opacity=".85">DEEPMUSIC • BOLLYWOOD</text>
    </svg>'''
    (folder / f"{filename}.svg").write_text(svg, encoding="utf-8")

print("Created 6 individual Bollywood covers!")