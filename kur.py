#!/usr/bin/env python3
"""vibecodedslopware — siteyi kurar.

  yazilar/<dil>/<mufredat>/<slug>.md  ->  [en/]<mufredat>/<slug>/index.html
  mufredat.json                       ->  [en/]index.html, [en/]<mufredat>/index.html

Bağımlılık yok. `python3 kur.py`.
"""
import html
import json
import re
import shutil
from pathlib import Path

KOK = Path(__file__).parent
YAZILAR = KOK / "yazilar"
DILLER = ["tr", "en"]

AYRAC = [
    "+ · ✱ · + · ▪ · ✱ · + · ✱ · ▪ · + · ✱",
    "▪ · ✱ · + · ✱ · ▪ · ✱ · + · ✱ · ▪ · ✱",
    "✱ · + · ✱ · ▪ · + · ✱ · ▪ · + · ✱ · +",
]

S = {
    "tr": {
        "bolumler": "bölüm",
        "yayinda": "yayında",
        "yakinda": "yakında",
        "haftada": "haftada bir bölüm",
        "kontrol": "kontrol",
        "henuz": "bu bölüm henüz yazılmadı.",
        "lisans": "metin cc by-nc, kod mit",
        "kaynak": "kaynağı burada",
        "fork": "ben düşersem sen fork'la",
        "tum": "bütün müfredatlar",
        "hazirlaniyor": "bu müfredat hazırlanıyor.",
    },
    "en": {
        "bolumler": "chapters",
        "yayinda": "published",
        "yakinda": "soon",
        "haftada": "one chapter a week",
        "kontrol": "check",
        "henuz": "this chapter is not written yet.",
        "lisans": "text cc by-nc, code mit",
        "kaynak": "source is here",
        "fork": "if I go down, fork it",
        "tum": "all curricula",
        "hazirlaniyor": "this curriculum is in progress.",
    },
}


def metin(alan, dil):
    """Sözlük ya da düz metin olan alanı diline göre çöz."""
    if isinstance(alan, dict):
        return alan.get(dil) or alan.get("tr") or ""
    return alan or ""


def bolum_alan(b, ad, dil):
    return metin(b.get(f"{ad}_{dil}") or b.get(ad), dil)


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


def markdown(kaynak, dil):
    """Küçük bir markdown alt kümesi. `::kontrol` bloğu kontrol kutusuna dönüşür."""
    cikti, i = [], 0
    satirlar = kaynak.split("\n")
    while i < len(satirlar):
        satir = satirlar[i]

        if satir.strip() == "::kontrol":
            i += 1
            blok = []
            while i < len(satirlar) and satirlar[i].strip() != "::":
                blok.append(satirlar[i])
                i += 1
            i += 1
            ic = markdown("\n".join(blok), dil)
            cikti.append(
                f'<div class="kontrol"><p class="kontrol-ad">{S[dil]["kontrol"]}</p>{ic}</div>'
            )
            continue

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
            cikti.append('<p class="alinti">' + satir_ici(" ".join(blok)) + "</p>")
            continue

        if re.match(r"^#{1,4} ", satir):
            kademe = len(satir) - len(satir.lstrip("#"))
            baslik = satir.lstrip("#").strip()
            i += 1
            if kademe == 1:
                continue
            cikti.append("<h2>" + satir_ici(baslik) + "</h2>")
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
                blok.append("<li>" + satir_ici(re.sub(r"^\d+\. ", "", satirlar[i])) + "</li>")
                i += 1
            cikti.append("<ol>" + "".join(blok) + "</ol>")
            continue

        if satir.startswith("---"):
            cikti.append(f'<div class="divider" aria-hidden="true">{AYRAC[0]}</div>')
            i += 1
            continue

        blok = []
        while (
            i < len(satirlar)
            and satirlar[i].strip()
            and not re.match(r"^(#{1,4} |[-*] |\d+\. |> |```|---|::)", satirlar[i])
        ):
            blok.append(satirlar[i])
            i += 1
        cikti.append("<p>" + satir_ici(" ".join(blok)) + "</p>")

    return "\n".join(cikti)


# ---------------------------------------------------------------- iskelet
def kafa(veri, baslik, aciklama, kanonik, yukari, dil, aktif_kod, karsi_url):
    nav = []
    for m in veri["mufredatlar"]:
        sinif = ' class="here"' if m["kod"] == aktif_kod else ""
        nav.append(f'<a{sinif} href="{yukari}{m["kod"]}/">{m["ad"]}</a>')
    obur = "en" if dil == "tr" else "tr"
    nav.append(f'<a href="{karsi_url}">{obur}</a>')
    nav.append('<a href="https://github.com/nosey-dewdrop/vibecodedslopware">github</a>')
    return f"""<!DOCTYPE html>
<html lang="{dil}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(baslik)}</title>
<meta name="description" content="{html.escape(aciklama)}">
<meta name="author" content="Damla Su Bilge">
<link rel="canonical" href="{kanonik}">
<link rel="alternate" hreflang="{dil}" href="{kanonik}">
<link rel="alternate" hreflang="{obur}" href="{karsi_url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="vibecodedslopware">
<meta property="og:title" content="{html.escape(baslik)}">
<meta property="og:description" content="{html.escape(aciklama)}">
<meta property="og:url" content="{kanonik}">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#171221">
<meta name="robots" content="index,follow">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23171221'/%3E%3Crect x='6' y='6' width='6' height='20' fill='%23ff8fb3'/%3E%3Crect x='20' y='6' width='6' height='20' fill='%23ff8fb3'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{yukari}style.css?v=11">
</head>
<body>

<div id="stars" aria-hidden="true"></div>

<div class="wrap">

<header class="site">
  <span class="mark"><i>[</i>&#124;<i>]</i> vibecodedslopware</span>
  <nav>{"".join(nav)}</nav>
</header>
"""


def ayak(yukari, dil):
    t = S[dil]
    return f"""
<footer>
  <span>{t["lisans"]} · <a href="https://github.com/nosey-dewdrop/vibecodedslopware">{t["kaynak"]}</a>, {t["fork"]}</span>
  <span class="sp"><a href="{yukari}">{t["tum"]}</a></span>
</footer>

</div>
<script src="{yukari}effects.js"></script>
</body>
</html>
"""


def kenar_cubugu(m, aktif_slug, yukari, dil):
    p = ['<nav class="kenar" aria-label="icindekiler">']
    for sv in m["seviyeler"]:
        p.append(f'<p class="kenar-seviye">{sv["kod"]} / {html.escape(metin(sv["ad"], dil))}</p>')
        p.append('<ol class="kenar-liste">')
        for b in sv["bolumler"]:
            aktif = ' class="aktif"' if b["slug"] == aktif_slug else ""
            p.append(
                f'<li{aktif}><span class="k-no">{b["no"]:02d}</span>'
                f'<a href="{yukari}{m["kod"]}/{b["slug"]}/">'
                f'{html.escape(bolum_alan(b, "baslik", dil))}</a></li>'
            )
        p.append("</ol>")
    p.append("</nav>")
    return "\n".join(p)


# ---------------------------------------------------------------- kurulum
def kur():
    veri = json.loads((KOK / "mufredat.json").read_text(encoding="utf-8"))

    for m in veri["mufredatlar"]:
        if (KOK / m["kod"]).exists():
            shutil.rmtree(KOK / m["kod"])
    if (KOK / "en").exists():
        shutil.rmtree(KOK / "en")
    if (KOK / "bolum").exists():
        shutil.rmtree(KOK / "bolum")

    toplam = 0
    for dil in DILLER:
        onek = "" if dil == "tr" else "en/"
        for m in veri["mufredatlar"]:
            toplam += mufredat_kur(veri, m, dil, onek)
        okul_sayfasi(veri, dil, onek)
        toplam += 1

    site_haritasi(veri)
    print(f"{toplam} sayfa kuruldu ({len(veri['mufredatlar'])} müfredat × {len(DILLER)} dil).")


def mufredat_kur(veri, m, dil, onek):
    site, t = veri["site"], S[dil]
    duz = [b for sv in m["seviyeler"] for b in sv["bolumler"]]
    seviye_of = {b["slug"]: sv for sv in m["seviyeler"] for b in sv["bolumler"]}
    yukari = "../../" if dil == "tr" else "../../../"
    sayac = 0

    for idx, b in enumerate(duz):
        sv = seviye_of[b["slug"]]
        kaynak = YAZILAR / dil / m["kod"] / f"{b['slug']}.md"
        if kaynak.exists():
            govde = markdown(kaynak.read_text(encoding="utf-8"), dil)
            b["durum"] = "yazildi"
        else:
            govde = f'<p class="henuz">{t["henuz"]} {t["haftada"]}.</p>'

        baslik = bolum_alan(b, "baslik", dil)
        neden = bolum_alan(b, "neden", dil)
        kanonik = f'{site["url"]}{onek}{m["kod"]}/{b["slug"]}/'
        karsi = f'{site["url"]}{"en/" if dil == "tr" else ""}{m["kod"]}/{b["slug"]}/'

        onceki = duz[idx - 1] if idx > 0 else None
        sonraki = duz[idx + 1] if idx < len(duz) - 1 else None
        gez = ['<nav class="gez">']
        if onceki:
            ob = html.escape(bolum_alan(onceki, "baslik", dil))
            gez.append(f'<a href="{yukari}{m["kod"]}/{onceki["slug"]}/">← {ob}</a>')
        else:
            gez.append("<span></span>")
        if sonraki:
            sb = html.escape(bolum_alan(sonraki, "baslik", dil))
            gez.append(f'<a class="gez-sag" href="{yukari}{m["kod"]}/{sonraki["slug"]}/">{sb} →</a>')
        else:
            gez.append("<span></span>")
        gez.append("</nav>")

        sayfa = kafa(veri, f"{baslik} · vibecodedslopware", neden, kanonik,
                     yukari, dil, m["kod"], karsi)
        sayfa += f"""
<section>
  <div class="duzen">
      {kenar_cubugu(m, b["slug"], yukari, dil)}
      <article class="yazi">
        <p class="etiket">{b["no"]:02d} / {sv["kod"]} {html.escape(metin(sv["ad"], dil))}</p>
        <h1>{html.escape(baslik)}</h1>
        <p class="lede">{html.escape(neden)}</p>

        <div class="divider" aria-hidden="true">{AYRAC[b["no"] % 3]}</div>

        {govde}

        {"".join(gez)}
      </article>
  </div>
</section>
"""
        sayfa += ayak(yukari, dil)
        klasor = KOK / onek.rstrip("/") / m["kod"] / b["slug"] if onek else KOK / m["kod"] / b["slug"]
        klasor.mkdir(parents=True, exist_ok=True)
        (klasor / "index.html").write_text(sayfa, encoding="utf-8")
        sayac += 1

    return sayac + mufredat_ana(veri, m, dil, onek)


def mufredat_ana(veri, m, dil, onek):
    site, t = veri["site"], S[dil]
    duz = [b for sv in m["seviyeler"] for b in sv["bolumler"]]
    yazilan = sum(1 for b in duz if b["durum"] == "yazildi")
    yukari = "../" if dil == "tr" else "../../"
    kanonik = f'{site["url"]}{onek}{m["kod"]}/'
    karsi = f'{site["url"]}{"en/" if dil == "tr" else ""}{m["kod"]}/'

    p = [kafa(veri, f'{metin(m["baslik"], dil)} · vibecodedslopware',
              metin(m["ozet"], dil), kanonik, yukari, dil, m["kod"], karsi)]
    p.append(f"""
<section class="mufredat">
      <p class="etiket">{m["ad"]}</p>
      <h1>{html.escape(metin(m["baslik"], dil))}</h1>
      <p class="lede">{html.escape(metin(m["ozet"], dil))}</p>""")

    if not duz:
        p.append(f'      <p class="lede">{t["hazirlaniyor"]}</p>')
    else:
        p.append(f'      <p class="lede">{len(duz)} {t["bolumler"]} · '
                 f'{yazilan} {t["yayinda"]} · {t["haftada"]}</p>')
        p.append('      <div class="seviyeler">')
        for sv in m["seviyeler"]:
            p.append(f"""        <section>
          <p class="seviye-ad">{sv["kod"]} / {html.escape(metin(sv["ad"], dil))}</p>
          <p class="seviye-ozet">{html.escape(metin(sv["ozet"], dil))}</p>
          <ol class="bolumler">""")
            for b in sv["bolumler"]:
                bos = "" if b["durum"] == "yazildi" else " bos"
                p.append(
                    f'            <li class="bolum{bos}">'
                    f'<span class="b-no">{b["no"]:02d}</span>'
                    f'<a class="b-baslik" href="{yukari}{m["kod"]}/{b["slug"]}/">'
                    f'{html.escape(bolum_alan(b, "baslik", dil))}</a>'
                    f'<span class="b-neden">{html.escape(bolum_alan(b, "neden", dil))}</span></li>'
                )
            p.append("          </ol>\n        </section>")
        p.append("      </div>")

    p.append("</section>")
    p.append(ayak(yukari, dil))
    klasor = KOK / onek.rstrip("/") / m["kod"] if onek else KOK / m["kod"]
    klasor.mkdir(parents=True, exist_ok=True)
    (klasor / "index.html").write_text("\n".join(p), encoding="utf-8")
    return 1


def okul_sayfasi(veri, dil, onek):
    site, t = veri["site"], S[dil]
    yukari = "" if dil == "tr" else "../"
    kanonik = f'{site["url"]}{onek}'
    karsi = f'{site["url"]}{"en/" if dil == "tr" else ""}'

    p = [kafa(veri, f'vibecodedslopware · {metin(site["aciklama"], dil)}',
              metin(site["aciklama"], dil), kanonik, yukari, dil, None, karsi)]
    p.append(f"""
<section class="okul">
      <h1 class="blink">{html.escape(metin(site["aciklama"], dil))}</h1>""")

    for m in veri["mufredatlar"]:
        duz = [b for sv in m["seviyeler"] for b in sv["bolumler"]]
        yazilan = sum(1 for b in duz if b["durum"] == "yazildi")
        if m["durum"] == "yakinda":
            sag = f'<span class="ders-yakinda">{t["yakinda"]}</span>'
        else:
            sag = (f'<span class="ders-sayi">{len(duz)} {t["bolumler"]} · '
                   f'{yazilan} {t["yayinda"]}</span>')
        p.append(f"""      <a class="ders" href="{yukari}{m["kod"]}/">
        <span class="ders-ust"><span class="ders-ad">{m["ad"]}</span>{sag}</span>
        <span class="ders-ozet">{html.escape(metin(m["ozet"], dil))}</span>
      </a>""")

    p.append("</section>")
    p.append(ayak(yukari, dil))
    hedef = KOK / onek.rstrip("/") if onek else KOK
    hedef.mkdir(parents=True, exist_ok=True)
    (hedef / "index.html").write_text("\n".join(p), encoding="utf-8")


def site_haritasi(veri):
    u = veri["site"]["url"]
    p = ['<?xml version="1.0" encoding="UTF-8"?>',
         '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for onek in ["", "en/"]:
        p.append(f"<url><loc>{u}{onek}</loc></url>")
        for m in veri["mufredatlar"]:
            p.append(f'<url><loc>{u}{onek}{m["kod"]}/</loc></url>')
            for sv in m["seviyeler"]:
                for b in sv["bolumler"]:
                    if b["durum"] == "yazildi":
                        p.append(f'<url><loc>{u}{onek}{m["kod"]}/{b["slug"]}/</loc></url>')
    p.append("</urlset>")
    (KOK / "sitemap.xml").write_text("\n".join(p), encoding="utf-8")


if __name__ == "__main__":
    kur()
