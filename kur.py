#!/usr/bin/env python3
"""vibecodedslopware — rehberi kurar.

yazilar/<slug>.md  ->  bolum/<slug>/index.html
mufredat.json      ->  index.html

Mevcut kabuğu kullanır: style.css, script.js, konfeti, glyph ayraçlar, .cols ritmi.
Bağımlılık yok. `python3 kur.py`.
"""
import html
import json
import re
import shutil
from pathlib import Path

KOK = Path(__file__).parent
YAZILAR = KOK / "yazilar"
CIKTI = KOK / "bolum"

GLYPH = ["+", "✱", "▪", "+"]
RENK = ["hl-purple", "hl-pink", "hl-yellow", "hl-green"]
AYRAC = [
    "+ · ✱ · + · ▪ · ✱ · + · ✱ · ▪ · + · ✱",
    "▪ · ✱ · + · ✱ · ▪ · ✱ · + · ✱ · ▪ · ✱",
    "✱ · + · ✱ · ▪ · + · ✱ · ▪ · + · ✱ · +",
    "+ · ▪ · ✱ · + · ✱ · ▪ · ✱ · + · ▪ · ✱",
]


# ---------------------------------------------------------------- markdown
def satir_ici(s):
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
            i += 1
            blok = []
            while i < len(satirlar) and not satirlar[i].startswith("```"):
                blok.append(satirlar[i])
                i += 1
            i += 1
            cikti.append(
                "<pre><code>" + html.escape("\n".join(blok), quote=False) + "</code></pre>"
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
            cikti.append('<p class="quote">' + satir_ici(" ".join(blok)) + "</p>")
            continue

        if re.match(r"^#{2,4} ", satir):
            baslik = satir.lstrip("#").strip()
            cikti.append("<h2>" + satir_ici(baslik) + "</h2>")
            i += 1
            continue

        if re.match(r"^[-*] ", satir):
            blok = []
            n = 0
            while i < len(satirlar) and re.match(r"^[-*] ", satirlar[i]):
                g = GLYPH[n % 4]
                r = RENK[n % 4]
                blok.append(
                    f'<li><span class="{r}">{g}</span> '
                    + satir_ici(satirlar[i][2:])
                    + "</li>"
                )
                i += 1
                n += 1
            cikti.append('<ul class="type-list">' + "".join(blok) + "</ul>")
            continue

        if re.match(r"^\d+\. ", satir):
            blok = []
            n = 0
            while i < len(satirlar) and re.match(r"^\d+\. ", satirlar[i]):
                g = GLYPH[n % 4]
                r = RENK[n % 4]
                blok.append(
                    f'<li><span class="step-glyph {r}">{g}</span> '
                    + satir_ici(re.sub(r"^\d+\. ", "", satirlar[i]))
                    + "</li>"
                )
                i += 1
                n += 1
            cikti.append('<ol class="steps">' + "".join(blok) + "</ol>")
            continue

        if satir.startswith("---"):
            cikti.append(f'<div class="divider" aria-hidden="true">{AYRAC[0]}</div>')
            i += 1
            continue

        blok = []
        while (
            i < len(satirlar)
            and satirlar[i].strip()
            and not re.match(r"^(#{2,4} |[-*] |\d+\. |> |```|---)", satirlar[i])
        ):
            blok.append(satirlar[i])
            i += 1
        cikti.append("<p>" + satir_ici(" ".join(blok)) + "</p>")

    return "\n".join(cikti)


# ---------------------------------------------------------------- iskelet
def kafa(baslik, aciklama, kanonik, yukari):
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
  <meta name="twitter:title" content="{html.escape(baslik)}">
  <meta name="twitter:description" content="{html.escape(aciklama)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Martian+Mono:wght@500&family=IBM+Plex+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
  <script>
  (function () {{
    var t = localStorage.getItem("theme");
    if (t === "light") t = "white";
    if (t === "dark") t = "black";
    if (["white", "black", "plum", "midnight"].indexOf(t) === -1)
      t = matchMedia("(prefers-color-scheme: dark)").matches ? "black" : "white";
    document.documentElement.dataset.theme = t;
  }})();
  </script>
  <link rel="stylesheet" href="{yukari}style.css?v=8">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✱</text></svg>">
</head>
<body>

  <div id="confetti-field" aria-hidden="true"></div>
  <div id="confetti-trail" aria-hidden="true"></div>

  <header class="top">
    <a class="wordmark" href="{yukari}" data-confetti>vibecodedslopware</a>
    <span class="top-right">
      <button class="theme-toggle" id="theme-toggle" data-confetti>[tema]</button>
      <a class="top-link" href="https://github.com/nosey-dewdrop/vibecodedslopware" data-confetti>github ↗</a>
    </span>
  </header>
"""


def ayak(yukari):
    return f"""
  <footer>
    <span>bir <a href="https://nosey-dewdrop.github.io" data-confetti>nosey-dewdrop</a> işi ·
    metin cc by-nc, kod mit · <a href="{yukari}">bütün bölümler</a></span>
    <span class="footer-glyphs" aria-hidden="true">+ ✱ ▪</span>
  </footer>

  <script src="{yukari}script.js?v=8"></script>
</body>
</html>
"""


def gezinme(onceki, sonraki, yukari):
    p = ['<nav class="gez">']
    if onceki:
        p.append(
            f'<a href="{yukari}bolum/{onceki["slug"]}/" data-confetti>'
            f'← {html.escape(onceki["baslik"])}</a>'
        )
    else:
        p.append("<span></span>")
    if sonraki:
        p.append(
            f'<a class="gez-sag" href="{yukari}bolum/{sonraki["slug"]}/" data-confetti>'
            f'{html.escape(sonraki["baslik"])} →</a>'
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
    seviye_of = {b["slug"]: sv for sv in veri["seviyeler"] for b in sv["bolumler"]}

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
                '<p class="cta-note">bu bölüm henüz yazılmadı. '
                "seri haftada bir bölüm ilerliyor.</p>"
            )

        onceki = duz[idx - 1] if idx > 0 else None
        sonraki = duz[idx + 1] if idx < len(duz) - 1 else None
        yukari = "../../"
        kanonik = f'{site["url"]}bolum/{b["slug"]}/'

        sayfa = kafa(f'{b["baslik"]} · vibecodedslopware', b["neden"], kanonik, yukari)
        sayfa += f"""
  <main>
    <article class="yazi">
      <p class="section-label">{b["no"]:02d} / {html.escape(sv["kod"])} {html.escape(sv["ad"])}</p>
      <h1 class="yazi-baslik" data-confetti>{html.escape(b["baslik"])}</h1>
      <p class="lede">{html.escape(b["neden"])}</p>

      <div class="divider" aria-hidden="true">{AYRAC[b["no"] % 4]}</div>

      {govde}
    </article>

    <div class="divider" aria-hidden="true">{AYRAC[(b["no"] + 2) % 4]}</div>

    {gezinme(onceki, sonraki, yukari)}
  </main>
"""
        sayfa += ayak(yukari)
        klasor = CIKTI / b["slug"]
        klasor.mkdir(parents=True)
        (klasor / "index.html").write_text(sayfa, encoding="utf-8")

    ana_sayfa(veri, duz, yazilan)
    site_haritasi(veri, duz)
    print(f"{len(duz)} bölüm kuruldu, {yazilan} tanesi dolu.")


def ana_sayfa(veri, duz, yazilan):
    site = veri["site"]
    ilk_bos = next((b for b in duz if b["durum"] != "yazildi"), duz[-1])
    p = [kafa(f'vibecodedslopware · {site["aciklama"]}', site["aciklama"], site["url"], "")]

    p.append(f"""
  <main>

    <section class="hero">
      <div class="hero-grid">
        <div>
          <h1 data-confetti>slopware nedir, nasıl fark edilir, ne yapmalı?</h1>
          <p class="lede">bir şeyi ekrana getirmek hiç bu kadar ucuz olmamıştı. ama
          çalışıyor gibi görünen bir şeyle gerçekten ayakta duran bir şey arasındaki
          mesafeyi artık kimse ölçmüyor. bu seri o mesafeyi ölçmeyi öğretiyor,
          sıfırdan başlayıp kurucu seviyesine kadar.</p>
          <div class="hero-cta">
            <a class="btn" href="bolum/{duz[0]["slug"]}/" data-confetti>baştan başla →</a>
            <span class="cta-note">{len(duz)} bölüm · {yazilan} tanesi yayında · haftada bir bölüm
            · burada kimseyi aşağılamıyoruz</span>
          </div>
        </div>

        <div class="quiz-card">
          <p class="quiz-file">kendi projende dene · 20 saniye</p>
<pre><code>git log -p | grep -i "api_key"</code></pre>
          <p class="quiz-q">sildiğini sandığın anahtar <code>git</code> geçmişinde
          duruyor mu?</p>
          <ul class="type-list">
            <li><span class="hl-purple">+</span> çıktı boşsa, temizsin</li>
            <li><span class="hl-pink">✱</span> bir şey döndüyse, o anahtar hâlâ canlı</li>
          </ul>
          <p class="cta-note">bu, yedinci bölümün ilk testi.</p>
        </div>
      </div>
    </section>
""")

    for si, sv in enumerate(veri["seviyeler"]):
        p.append(f'    <div class="divider" aria-hidden="true">{AYRAC[si % 4]}</div>')
        p.append(f"""
    <section class="seviye">
      <p class="section-label">{sv["kod"]} / {html.escape(sv["ad"])}</p>
      <p class="lede">{html.escape(sv["ozet"])}</p>
      <ol class="bolumler">""")
        for b in sv["bolumler"]:
            g = GLYPH[b["no"] % 4]
            r = RENK[b["no"] % 4]
            bos = "" if b["durum"] == "yazildi" else " bos"
            p.append(
                f'        <li class="bolum{bos}">'
                f'<span class="b-glyph {r}">{g}</span>'
                f'<a class="b-baslik" href="bolum/{b["slug"]}/" data-confetti>'
                f'{html.escape(b["baslik"])}</a>'
                f'<span class="b-neden">{html.escape(b["neden"])}</span></li>'
            )
        p.append("      </ol>\n    </section>")

    p.append(f"""
    <div class="divider" aria-hidden="true">{AYRAC[0]}</div>

    <div class="cols">
      <section>
        <p class="section-label">bu seri neden var?</p>
        <h2 data-confetti>herkes "ai slop" diyor, kimse ne olduğunu söylemiyor</h2>
        <p>ve geçip gitmek yetmiyor, çünkü o sözü söyleyen kişi kendi projesinin de
        aynı çukurda olup olmadığını bilmiyor. slopware yazan insan tembel değil,
        sadece kendisine kimsenin göstermediği bir şeyi bilmiyor.</p>
        <p class="quote">sorun kodun kötü olması değil, kötü olduğunun görünmemesi.<br>
        <span class="quote-by">serinin tek cümlelik özeti</span></p>
      </section>

      <section>
        <p class="section-label">her bölüm nasıl ilerliyor?</p>
        <h2 data-confetti>belirti, sebep, teşhis, düzeltme</h2>
        <ol class="steps">
          <li data-confetti><span class="step-glyph hl-purple">+</span>
            çalışıyor gibi görünen bir şey, ve neden öyle göründüğü</li>
          <li data-confetti><span class="step-glyph hl-pink">✱</span>
            nerede çöktüğü, gerçek bir olayla</li>
          <li data-confetti><span class="step-glyph hl-yellow">▪</span>
            kendi kodunda nasıl bulacağın, çalıştırabileceğin bir kontrolle</li>
          <li data-confetti><span class="step-glyph hl-green">+</span>
            doğrusunun nasıl kurulduğu, ve benim aynı hatayı nerede yaptığım</li>
        </ol>
      </section>
    </div>

    <div class="divider" aria-hidden="true">{AYRAC[2]}</div>

    <section class="outro">
      <h2 data-confetti>çalışıyor gibi görünmekle ayakta durmak aynı şey değil.</h2>
      <p><a class="btn" href="bolum/{duz[0]["slug"]}/" data-confetti>ilk bölümü oku →</a></p>
      <p class="cta-note">metin cc by-nc, kod mit ·
      <a href="https://github.com/nosey-dewdrop/vibecodedslopware" data-confetti>kaynağı burada</a>,
      ben düşersem sen fork'la</p>
    </section>

  </main>
""")
    p.append(ayak(""))
    (KOK / "index.html").write_text("\n".join(p), encoding="utf-8")


def site_haritasi(veri, duz):
    u = veri["site"]["url"]
    p = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        f"<url><loc>{u}</loc><priority>1.0</priority></url>",
    ]
    for b in duz:
        if b["durum"] == "yazildi":
            p.append(f'<url><loc>{u}bolum/{b["slug"]}/</loc></url>')
    p.append("</urlset>")
    (KOK / "sitemap.xml").write_text("\n".join(p), encoding="utf-8")


if __name__ == "__main__":
    kur()
