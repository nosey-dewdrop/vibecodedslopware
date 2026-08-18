#!/usr/bin/env python3
"""vibecodedslopware — rehberi kurar.

yazilar/<slug>.md  ->  bolum/<slug>/index.html
mufredat.json      ->  index.html (özet tablo + tam içindekiler)

Bağımlılık yok. `python3 kur.py` ile çalışır.
"""
import html
import json
import re
import shutil
from pathlib import Path

KOK = Path(__file__).parent
YAZILAR = KOK / "yazilar"
CIKTI = KOK / "bolum"


# ---------------------------------------------------------------- markdown
def satir_ici(s):
    """Satır içi markdown. Kod önce çıkarılır, sonra geri konur."""
    kutu = []

    def sakla(m):
        kutu.append(m.group(1))
        return f"\x00{len(kutu) - 1}\x00"

    s = re.sub(r"`([^`]+)`", sakla, s)
    s = html.escape(s, quote=False)
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", s)
    s = re.sub(
        r"\x00(\d+)\x00",
        lambda m: "<code>" + html.escape(kutu[int(m.group(1))], quote=False) + "</code>",
        s,
    )
    return s


def markdown(metin):
    cikti, i = [], 0
    satirlar = metin.split("\n")
    while i < len(satirlar):
        satir = satirlar[i]

        if satir.startswith("```"):
            dil = satir[3:].strip()
            i += 1
            blok = []
            while i < len(satirlar) and not satirlar[i].startswith("```"):
                blok.append(satirlar[i])
                i += 1
            i += 1
            sinif = f' class="dil-{dil}"' if dil else ""
            cikti.append(
                f"<pre><code{sinif}>"
                + html.escape("\n".join(blok), quote=False)
                + "</code></pre>"
            )
            continue

        if not satir.strip():
            i += 1
            continue

        if satir.startswith("> "):
            blok = []
            while i < len(satirlar) and satirlar[i].startswith("> "):
                blok.append(satirlar[i][2:])
                i += 1
            cikti.append("<blockquote>" + satir_ici(" ".join(blok)) + "</blockquote>")
            continue

        if re.match(r"^#{1,4} ", satir):
            kademe = len(satir) - len(satir.lstrip("#"))
            baslik = satir[kademe:].strip()
            kimlik = re.sub(r"[^a-z0-9]+", "-", baslik.lower()).strip("-")
            cikti.append(
                f'<h{kademe} id="{kimlik}">{satir_ici(baslik)}</h{kademe}>'
            )
            i += 1
            continue

        if re.match(r"^[-*] ", satir):
            blok = []
            while i < len(satirlar) and re.match(r"^[-*] ", satirlar[i]):
                blok.append("<li>" + satir_ici(satirlar[i][2:]) + "</li>")
                i += 1
            cikti.append("<ul>" + "".join(blok) + "</ul>")
            continue

        if re.match(r"^\d+\. ", satir):
            blok = []
            while i < len(satirlar) and re.match(r"^\d+\. ", satirlar[i]):
                blok.append(
                    "<li>" + satir_ici(re.sub(r"^\d+\. ", "", satirlar[i])) + "</li>"
                )
                i += 1
            cikti.append("<ol>" + "".join(blok) + "</ol>")
            continue

        if satir.startswith("---"):
            cikti.append("<hr>")
            i += 1
            continue

        blok = []
        while i < len(satirlar) and satirlar[i].strip() and not re.match(
            r"^(#{1,4} |[-*] |\d+\. |> |```|---)", satirlar[i]
        ):
            blok.append(satirlar[i])
            i += 1
        cikti.append("<p>" + satir_ici(" ".join(blok)) + "</p>")

    return "\n".join(cikti)


# ---------------------------------------------------------------- iskelet
def kafa(baslik, aciklama, kanonik, derinlik):
    yukari = "../" * derinlik
    return f"""<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html.escape(baslik)}</title>
<meta name="description" content="{html.escape(aciklama)}">
<link rel="canonical" href="{kanonik}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="vibecodedslopware">
<meta property="og:title" content="{html.escape(baslik)}">
<meta property="og:description" content="{html.escape(aciklama)}">
<meta property="og:url" content="{kanonik}">
<meta name="twitter:card" content="summary">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Martian+Mono:wght@500&family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<script>
(function () {{
  var t = localStorage.getItem("theme");
  if (t === "light") t = "white";
  if (t === "dark") t = "black";
  if (["white","black","plum","midnight"].indexOf(t) === -1)
    t = matchMedia("(prefers-color-scheme: dark)").matches ? "black" : "white";
  document.documentElement.dataset.theme = t;
}})();
</script>
<link rel="stylesheet" href="{yukari}style.css?v=7">
<link rel="stylesheet" href="{yukari}rehber.css?v=7">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✱</text></svg>">
</head>
<body class="rehber">
<header class="top">
  <a class="wordmark" href="{yukari}">vibecodedslopware</a>
  <span class="top-right">
    <button class="theme-toggle" id="theme-toggle">[tema]</button>
    <a class="top-link" href="https://github.com/nosey-dewdrop/vibecodedslopware">github ↗</a>
  </span>
</header>
"""


AYAK = """<script src="%sthemes.js"></script>
</body>
</html>
"""


def kenar(veri, aktif_slug, yukari):
    p = ['<nav class="kenar" aria-label="içindekiler"><ol class="kenar-liste">']
    for sv in veri["seviyeler"]:
        p.append(
            f'<li class="kenar-seviye"><span class="kenar-kod">{sv["kod"]}</span>'
            f'<span class="kenar-ad">{html.escape(sv["ad"])}</span></li>'
        )
        for b in sv["bolumler"]:
            aktif = " aktif" if b["slug"] == aktif_slug else ""
            bos = "" if b["durum"] == "yazildi" else " bos"
            p.append(
                f'<li class="kenar-bolum{aktif}{bos}">'
                f'<a href="{yukari}bolum/{b["slug"]}/">'
                f'<span class="kenar-no">{b["no"]}</span>'
                f'{html.escape(b["baslik"])}</a></li>'
            )
    p.append("</ol></nav>")
    return "\n".join(p)


def gezinme(onceki, sonraki, yukari, konum):
    p = [f'<nav class="gezinme {konum}">']
    if onceki:
        p.append(
            f'<a class="gez-onceki" href="{yukari}bolum/{onceki["slug"]}/">'
            f'<span class="gez-etiket">← önceki</span>'
            f'<span class="gez-baslik">{html.escape(onceki["baslik"])}</span></a>'
        )
    else:
        p.append("<span></span>")
    if sonraki:
        p.append(
            f'<a class="gez-sonraki" href="{yukari}bolum/{sonraki["slug"]}/">'
            f'<span class="gez-etiket">sonraki →</span>'
            f'<span class="gez-baslik">{html.escape(sonraki["baslik"])}</span></a>'
        )
    else:
        p.append("<span></span>")
    p.append("</nav>")
    return "\n".join(p)


# ---------------------------------------------------------------- kurulum
def kur():
    veri = json.loads((KOK / "mufredat.json").read_text(encoding="utf-8"))
    site = veri["site"]
    duz = [b for sv in veri["seviyeler"] for b in sv["bolumler"]]
    seviye_of = {
        b["slug"]: sv for sv in veri["seviyeler"] for b in sv["bolumler"]
    }

    if CIKTI.exists():
        shutil.rmtree(CIKTI)
    CIKTI.mkdir()

    yazilan = 0
    for idx, b in enumerate(duz):
        sv = seviye_of[b["slug"]]
        kaynak = YAZILAR / f"{b['slug']}.md"
        if kaynak.exists():
            govde = markdown(kaynak.read_text(encoding="utf-8"))
            b["durum"] = "yazildi"
            yazilan += 1
        else:
            govde = (
                '<p class="henuz">Bu bölüm henüz yazılmadı. '
                "Seri haftada bir bölüm ilerliyor.</p>"
            )

        onceki = duz[idx - 1] if idx > 0 else None
        sonraki = duz[idx + 1] if idx < len(duz) - 1 else None
        yukari = "../../"
        kanonik = f'{site["url"]}bolum/{b["slug"]}/'

        sayfa = kafa(
            f'{b["baslik"]} — vibecodedslopware',
            b["neden"],
            kanonik,
            2,
        )
        sayfa += f"""
<div class="duzen">
{kenar(veri, b["slug"], yukari)}
<main class="govde">
  <div class="ust-cizgi">
    <span class="rozet">{sv["kod"]}</span>
    <span class="ust-ad">{html.escape(sv["ad"])}</span>
  </div>
  {gezinme(onceki, sonraki, yukari, "ust")}
  <article>
    <p class="bolum-no">bölüm {b["no"]}</p>
    <h1>{html.escape(b["baslik"])}</h1>
    <p class="neden">{html.escape(b["neden"])}</p>
    {govde}
  </article>
  {gezinme(onceki, sonraki, yukari, "alt")}
</main>
</div>
"""
        sayfa += AYAK % yukari
        klasor = CIKTI / b["slug"]
        klasor.mkdir(parents=True)
        (klasor / "index.html").write_text(sayfa, encoding="utf-8")

    ana_sayfa(veri, duz, yazilan)
    site_haritasi(veri, duz)
    print(f"{len(duz)} bölüm kuruldu, {yazilan} tanesi dolu.")


def ana_sayfa(veri, duz, yazilan):
    site = veri["site"]
    p = [kafa(f'{site["ad"]} — {site["aciklama"]}', site["aciklama"], site["url"], 0)]
    p.append(f"""
<main class="ana">
  <section class="giris">
    <h1>slopware nedir, nasıl fark edilir, ne yapmalı?</h1>
    <p class="alt-baslik">
      Bir şeyi ekrana getirmek hiç bu kadar ucuz olmamıştı. Ama çalışıyor gibi
      görünen bir şeyle gerçekten ayakta duran bir şey arasındaki mesafeyi artık
      kimse ölçmüyor. Bu rehber o mesafeyi ölçmeyi öğretiyor.
    </p>
    <p class="ilerleme">{len(duz)} bölüm · {yazilan} tanesi yayında · haftada bir bölüm</p>
    <a class="basla" href="bolum/{duz[0]["slug"]}/">baştan başla →</a>
  </section>

  <section class="harita">
    <h2>haritanın tamamı</h2>
    <p class="harita-not">
      Her satır bir belirti, bir sebep ve bir düzeltme. Kendi projende hangisini
      görüyorsan oradan da başlayabilirsin.
    </p>
    <table class="ozet">
      <thead><tr><th>#</th><th>bölüm</th><th>belirti</th><th>neden umursayasın?</th></tr></thead>
      <tbody>""")
    for sv in veri["seviyeler"]:
        p.append(
            f'<tr class="seviye-satir"><td colspan="4">'
            f'<span class="rozet">{sv["kod"]}</span> {html.escape(sv["ad"])} '
            f'<span class="seviye-ozet">{html.escape(sv["ozet"])}</span></td></tr>'
        )
        for b in sv["bolumler"]:
            durum = "" if b["durum"] == "yazildi" else " bos"
            p.append(
                f'<tr class="bolum-satir{durum}">'
                f'<td class="s-no">{b["no"]}</td>'
                f'<td class="s-baslik"><a href="bolum/{b["slug"]}/">{html.escape(b["baslik"])}</a></td>'
                f'<td class="s-belirti">{html.escape(b["belirti"])}</td>'
                f'<td class="s-neden">{html.escape(b["neden"])}</td></tr>'
            )
    p.append("""</tbody>
    </table>
  </section>

  <section class="kaide">
    <h2>bu rehber neden var?</h2>
    <p>
      Herkes "ai slop" deyip geçiyor, ama geçmek yetmiyor, çünkü o sözü söyleyen
      kişi kendi projesinin de aynı çukurda olup olmadığını bilmiyor. Burada
      kimseyi aşağılamıyoruz. Slopware yazan insan tembel değil, sadece kendisine
      kimsenin göstermediği bir şeyi bilmiyor.
    </p>
    <p>
      Her bölüm aynı şekilde ilerliyor: çalışıyor gibi görünen bir şey, sonra
      nerede çöktüğü, sonra kendi kodunda nasıl bulacağın, sonra doğrusunun nasıl
      kurulduğu. Ve her bölümde kendi projelerimden gerçek bir vaka var, çünkü bu
      hataların hepsini ben de yaptım.
    </p>
    <p class="kaynak-not">
      Metin CC BY-NC, kod MIT. Kaynağı
      <a href="https://github.com/nosey-dewdrop/vibecodedslopware">GitHub'da</a>
      duruyor, ben düşersem sen fork'la.
    </p>
  </section>
</main>
""")
    p.append(AYAK % "")
    (KOK / "index.html").write_text("\n".join(p), encoding="utf-8")


def site_haritasi(veri, duz):
    u = veri["site"]["url"]
    p = ['<?xml version="1.0" encoding="UTF-8"?>',
         '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
         f"<url><loc>{u}</loc><priority>1.0</priority></url>"]
    for b in duz:
        p.append(f'<url><loc>{u}bolum/{b["slug"]}/</loc></url>')
    p.append("</urlset>")
    (KOK / "sitemap.xml").write_text("\n".join(p), encoding="utf-8")


if __name__ == "__main__":
    kur()
