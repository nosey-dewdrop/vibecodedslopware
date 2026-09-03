#!/usr/bin/env python3
"""vibecodedslopware — siteyi kurar.

Görünüm yazbel'in (python.yazbel.com) Sphinx/pylons "pyramid" temasından
alındı: ortada tek kolon, üstte damga logo + ince navbar, altında ve üstünde
noktalı çizgiyle ayrılmış "gezinti" şeridi, başlıklarda ¶ çıpası, sol tarafı
gümüş çizgili kod blokları, dipte italik gri lisans şeridi.

  yazilar/<dil>/<mufredat>/<slug>.md  ->  [en/]<mufredat>/<slug>/index.html
  mufredat.json                       ->  [en/]index.html, [en/]<mufredat>/index.html
                                          [en/]ara/index.html, arama-<dil>.json
  gövde sözlüğü                       ->  tema/stem.js  (arama JS'i ile ortak veri)

Bağımlılık yok. `python3 kur.py`.
"""
import datetime as dt
import html
import json
import os
import subprocess
import re
import shutil
import unicodedata
from pathlib import Path

KOK = Path(__file__).parent
YAZILAR = KOK / "yazilar"
DILLER = ["en"]
# Alanların yazıldığı dil: bir alanın yalnız bu dilde karşılığı varsa,
# başka bir dilde basılmaz.
VARSAYILAN_DIL = "tr"
# Kilitler bu tarihe göre açılır. Test için: KUR_TARIH=2026-11-09 python3 kur.py
BUGUN = dt.date.fromisoformat(os.environ.get("KUR_TARIH") or dt.date.today().isoformat())
AYLAR = {"tr": ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz",
                "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
         "en": ["January", "February", "March", "April", "May", "June", "July",
                "August", "September", "October", "November", "December"]}


def tarih_yaz(iso, dil):
    d = dt.date.fromisoformat(iso)
    return f"{d.day} {AYLAR[dil][d.month - 1]} {d.year}"


def acik_mi(b):
    return dt.date.fromisoformat(b["tarih"]) <= BUGUN

S = {
    "tr": {
        "bolumler": "bölüm",
        "yayinda": "yayında",
        "yakinda": "yakında",
        "haftada": "üç günde bir bölüm",
        "kilitli": "kilitli",
        "acilir": "{tarih} tarihinde açılır",
        "abone": "yeni bölüm çıkınca mail gelsin",
        "abone_dugme": "yaz",
        "abone_not": "sadece yeni bölüm haberi. başka bir şey yok.",
        "kitap": "kitap",
        "kitap_ozet": "yayındaki bütün bölümler tek sayfada. yazdırmak ya da pdf için.",
        "siradaki": "sıradaki bölüm",
        "paylas": "paylaş",
        "linki_kopyala": "linki kopyala",
        "kopyalandi_link": "kopyalandı",
        "iyilestir": "bu sayfayı iyileştir",
        "iyilestir_not": "kaynağı GitHub'da, yanlış gördüğün yeri düzelt.",
        "kontrol": "kontrol",
        "gectim": "projem bu kontrolü geçiyor",
        "gecti": "geçti",
        "gecilen": "geçtin",
        "henuz": "bu bölüm henüz yazılmadı.",
        "kayip": "böyle bir sayfa yok. adres değişmiş ya da hiç olmamış olabilir.",
        "yazilmadi": "yazılmadı",
        "lisans": "metin cc by-nc, kod mit",
        "kaynak": "kaynağı burada",
        "fork": "ben düşersem sen fork'la",
        "gezinti": "Gezinti",
        "butun_bolumler": "bütün bölümler",
        "ev": "ana sayfa",
        "onceki": "önceki",
        "sonraki": "sonraki",
        "ara": "ara",
        "arama": "Arama",
        "arama_kutusu": "ara…",
        "icindekiler": "İçindekiler",
        "kopyala": "kopyala",
        "kopyalandi": "kopyalandı",
        "js_yok": "Arama için JavaScript gerekiyor.",
        "arama_ipucu": "Birden fazla kelime yazarsan hepsini birden içeren "
                       "bölümler listelenir.",
        "hazirlaniyor": "bu müfredat hazırlanıyor.",
        "olusturuldu": "elde yazılmış bir jeneratörle kuruldu",
        "gorunum": "yazbel okutmayı öğretti",
        "ipucu": "tuşlar: n sonraki, p önceki, / arama, ? liste &#183; geçtiğin bölümler yalnız bu tarayıcıda kalır &#183; <a href=\"{kok}rss.xml\">rss</a>",
    },
    "en": {
        "bolumler": "chapters",
        "yayinda": "published",
        "yakinda": "soon",
        "haftada": "a chapter every three days",
        "kilitli": "locked",
        "acilir": "opens on {tarih}",
        "abone": "email me when a new chapter is out",
        "abone_dugme": "go",
        "abone_not": "only new chapter news. nothing else.",
        "kitap": "book",
        "kitap_ozet": "every published chapter on one page. for printing or the pdf.",
        "siradaki": "next chapter",
        "paylas": "share",
        "linki_kopyala": "copy link",
        "kopyalandi_link": "copied",
        "iyilestir": "improve this page",
        "iyilestir_not": "the source is on GitHub, fix what you see wrong.",
        "kontrol": "check",
        "gectim": "my project passes this check",
        "gecti": "passed",
        "gecilen": "passed",
        "henuz": "this chapter is not written yet.",
        "kayip": "no such page. the address may have changed or never existed.",
        "yazilmadi": "not written",
        "lisans": "text cc by-nc, code mit",
        "kaynak": "source is here",
        "fork": "if I go down, fork it",
        "gezinti": "Navigation",
        "butun_bolumler": "all chapters",
        "ev": "home",
        "onceki": "previous",
        "sonraki": "next",
        "ara": "search",
        "arama": "Search",
        "arama_kutusu": "search…",
        "icindekiler": "Contents",
        "kopyala": "copy",
        "kopyalandi": "copied",
        "js_yok": "Search needs JavaScript.",
        "arama_ipucu": "Searching for multiple words only shows chapters that "
                       "contain all of them.",
        "hazirlaniyor": "this curriculum is in progress.",
        "olusturuldu": "built with a hand-written generator",
        "gorunum": "yazbel taught me what teaching in writing looks like",
        "ipucu": "keys: n next, p previous, / search, ? the list &#183; the chapters you pass live in this browser only &#183; <a href=\"{kok}rss.xml\">rss</a>",
    },
}

FONTLAR = ("https://fonts.googleapis.com/css2?"
           "family=Roboto+Slab:wght@400;700&family=Special+Elite&display=swap")
# LaTeX'in kendi yazı tipi. Paketin kendi css'i "font-style: roman" diyor ve bu
# geçersiz bir değer, tarayıcı yüzü tanımayıp başka aileye düşüyordu. Yüzleri
# doğrudan bağlıyoruz.


def metin(alan, dil):
    """Sözlük ya da düz metin olan alanı diline göre çöz."""
    if isinstance(alan, dict):
        return alan.get(dil) or alan.get("tr") or ""
    return alan or ""


def bolum_alan(b, ad, dil, zorunlu=True):
    """Bölümün bir alanı, istenen dilde.

    `zorunlu` False ise ve o dilde karşılığı yoksa boş döner. Başlık her zaman
    lazım, o yüzden varsayılan hâlâ Türkçeye düşer; ama özet düşmez: İngilizce
    bir sayfada Türkçe bir özet, özetsiz bir satırdan kötüdür."""
    ozel = b.get(f"{ad}_{dil}")
    if ozel:
        return metin(ozel, dil)
    temel = b.get(ad)
    if isinstance(temel, dict):
        return metin(temel, dil)
    if not zorunlu and dil != VARSAYILAN_DIL:
        return ""
    return metin(temel, dil)


def kac(s):
    return html.escape(s, quote=False)


# ---------------------------------------------------------------- slug
TR_HARF = str.maketrans("çğıöşüÇĞİÖŞÜ", "cgiosucgiosu")


def slugla(s):
    s = s.strip().lower().replace("ı", "i").translate(TR_HARF)
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "bolum"


# ---------------------------------------------------------------- gövde (stem)
# Arama indeksi burada üretiliyor, sorgu tarayıcıda aynı listeyle işleniyor;
# ekler tek yerde dursun diye tema/stem.js bu sözlükten yazılıyor.
EKLER = {
    "tr": [
        # çokluk + iyelik + hâl birleşimleri
        "larımızdan", "lerimizden", "larınızdan", "lerinizden",
        "larından", "lerinden", "larımız", "lerimiz", "larınız", "leriniz",
        "ların", "lerin", "ları", "leri", "lar", "ler",
        # fiil
        "mıştır", "miştir", "muştur", "müştür", "yordu",
        "acak", "ecek", "mış", "miş", "muş", "müş", "yor", "mak", "mek",
        "dır", "dir", "dur", "dür", "tır", "tir", "tur", "tür",
        # iyelik
        "ımız", "imiz", "umuz", "ümüz", "ınız", "iniz", "unuz", "ünüz",
        "ım", "im", "um", "üm", "sı", "si", "su", "sü",
        # hâl
        "dan", "den", "tan", "ten", "nın", "nin", "nun", "nün",
        "ın", "in", "un", "ün", "na", "ne", "ya", "ye",
        "da", "de", "ta", "te", "ı", "i", "u", "ü", "a", "e",
        # yapım
        "lık", "lik", "luk", "lük", "sız", "siz", "suz", "süz",
        "cı", "ci", "cu", "cü", "çı", "çi", "çu", "çü",
        "lı", "li", "lu", "lü", "dı", "di", "du", "dü",
        "tı", "ti", "tu", "tü", "ma", "me",
    ],
    "en": [
        "ational", "iveness", "fulness", "ousness", "ization",
        "ations", "ically", "ingly", "edly", "ness", "ment", "ions",
        "ing", "ers", "est", "ed", "es", "ly", "s",
    ],
}
for _d in EKLER:
    EKLER[_d] = sorted(set(EKLER[_d]), key=lambda e: (-len(e), e))

# Türkçede ek alınca sertleşen ünsüz geri gelsin: kitabı -> kitab -> kitap,
# güvenliği -> güvenliğ -> güvenlik (ki oradan "lik" de düşsün).
YUMUSAMA = {"ğ": "k", "b": "p", "c": "ç", "d": "t"}

EN_AZ = 3


def govde(kelime, dil):
    """Ek at, sertleşen ünsüzü geri ver, değişen bir şey kalmayana kadar tekrarla.

    Sertleşmeyi döngünün içinde yapmak şart: "kod" hiç ek almadan da "kot"a
    dönmezse, "kodlarda" -> "kod" -> "kot" ile eşleşmiyor ve arama tutmuyor.
    Yumuşama hedefleri (k, p, ç, t) sözlükte olmadığı için döngü kilitlenmez.
    """
    k = kelime.replace("I", "ı").replace("İ", "i").lower()
    k = re.sub(r"[^0-9a-zçğıöşü]", "", k)
    while True:
        if dil == "tr" and k and k[-1] in YUMUSAMA:
            k = k[:-1] + YUMUSAMA[k[-1]]
            continue
        if len(k) <= EN_AZ:
            return k
        for ek in EKLER[dil]:
            if k.endswith(ek) and len(k) - len(ek) >= EN_AZ:
                k = k[: -len(ek)]
                break
        else:
            return k


BOL = re.compile(r"[0-9a-zA-ZçğıöşüÇĞİÖŞÜ]+")


def belirtecle(s, dil):
    return [g for g in (govde(k, dil) for k in BOL.findall(s)) if len(g) >= 2]


# ---------------------------------------------------------------- renklendirme
# pygments.css'in sınıflarını elde üretiyoruz; pygments'ı bağımlılık olarak
# eklemeye değmez, iki dil yetiyor.
PY_ANAHTAR = {"and", "as", "assert", "async", "await", "break", "class",
              "continue", "def", "del", "elif", "else", "except", "finally",
              "for", "from", "global", "if", "import", "in", "is", "lambda",
              "nonlocal", "not", "or", "pass", "raise", "return", "try",
              "while", "with", "yield"}
PY_ALAN = {"import", "from"}
PY_SABIT = {"True", "False", "None"}
PY_MANTIK = {"and", "or", "not", "in", "is"}
PY_GOMULU = {"abs", "all", "any", "bool", "bytes", "dict", "enumerate", "filter",
             "float", "format", "getattr", "input", "int", "isinstance", "len",
             "list", "map", "max", "min", "open", "print", "range", "repr",
             "set", "setattr", "sorted", "str", "sum", "super", "tuple", "type",
             "zip"}

PY_BOL = re.compile(r"""
    (?P<yorum>\#[^\n]*)
  | (?P<uc>'''(?:.|\n)*?'''|\"\"\"(?:.|\n)*?\"\"\")
  | (?P<metin>[rbfuRBFU]{0,2}(?:"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))
  | (?P<sayi>\b\d+\.?\d*\b)
  | (?P<ad>[A-Za-z_][A-Za-z_0-9]*)
  | (?P<satir>\n)
  | (?P<isaret>[()\[\]{},:;.])
  | (?P<islec>[-+*/%=<>!&|^~@]+)
""", re.X)


def _sar(sinif, ham):
    return f'<span class="{sinif}">{kac(ham)}</span>'


def py_renklendir(kod):
    cikti, son, oncek, alan = [], 0, None, False
    for m in PY_BOL.finditer(kod):
        if m.start() > son:
            cikti.append(kac(kod[son:m.start()]))
        son = m.end()
        tur, ham = m.lastgroup, m.group()
        if tur == "yorum":
            cikti.append(_sar("c1", ham))
        elif tur == "uc":
            cikti.append(_sar("sd", ham))
        elif tur == "metin":
            cikti.append(_sar("s1" if ham.rstrip().endswith("'") else "s2", ham))
        elif tur == "sayi":
            cikti.append(_sar("mf" if "." in ham else "mi", ham))
        elif tur == "satir":
            cikti.append("\n")
            alan = False
        elif tur == "isaret":
            # pygments nokta'yı işleç (o) sayıyor, parantez/virgülü noktalama (p);
            # import satırında ise nokta modül adının parçası (nn).
            if ham == ".":
                cikti.append(_sar("nn" if alan else "o", ham))
            else:
                cikti.append(_sar("p", ham))
        elif tur == "islec":
            cikti.append(_sar("o", ham))
        else:
            if ham in PY_SABIT:
                sinif = "kc"
            elif ham in PY_ALAN:
                sinif, alan = "kn", True
            elif ham in PY_MANTIK:
                sinif = "ow"
            elif ham in PY_ANAHTAR:
                sinif = "k"
            elif ham in ("self", "cls"):
                sinif = "bp"
            elif oncek == "class":
                sinif = "nc"
            elif oncek == "def":
                sinif = "nf"
            elif alan:
                sinif = "nn"
            elif ham in PY_GOMULU:
                sinif = "nb"
            else:
                sinif = "n"
            cikti.append(_sar(sinif, ham))
            oncek = ham
    cikti.append(kac(kod[son:]))
    return "".join(cikti)


HTML_BOL = re.compile(r"""
    (?P<yorum><!--(?:.|\n)*?-->)
  | (?P<dtd><![^>]*>)
  | (?P<etiket></?[A-Za-z][\w:.-]*)
  | (?P<kapat>/?>)
  | (?P<deger>=\s*(?:"[^"]*"|'[^']*'))
  | (?P<oz>\b[A-Za-z_:][\w:.-]*(?=\s*=))
""", re.X)


def html_renklendir(kod):
    cikti, son = [], 0
    for m in HTML_BOL.finditer(kod):
        if m.start() > son:
            cikti.append(kac(kod[son:m.start()]))
        son = m.end()
        tur, ham = m.lastgroup, m.group()
        if tur == "yorum":
            cikti.append(_sar("c", ham))
        elif tur == "dtd":
            cikti.append(_sar("cp", ham))
        elif tur in ("etiket", "kapat"):
            cikti.append(_sar("nt", ham))
        elif tur == "oz":
            cikti.append(_sar("na", ham))
        else:
            cikti.append(_sar("o", "=") + _sar("s", ham[1:].lstrip()))
    cikti.append(kac(kod[son:]))
    return "".join(cikti)


KABUK_BOL = re.compile(r"""
    (?P<yorum>\#[^\n]*)
  | (?P<metin>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')
  | (?P<degisken>\$\{?[A-Za-z_][\w]*\}?)
  | (?P<istem>^\s*\$\s)
  | (?P<komut>^\s*[A-Za-z_][\w.-]*)
  | (?P<islec>[|&><]+)
""", re.X | re.M)


def kabuk_renklendir(kod):
    cikti, son = [], 0
    for m in KABUK_BOL.finditer(kod):
        if m.start() > son:
            cikti.append(kac(kod[son:m.start()]))
        son = m.end()
        tur, ham = m.lastgroup, m.group()
        cikti.append({
            "yorum": lambda: _sar("c1", ham),
            "metin": lambda: _sar("s2", ham),
            "degisken": lambda: _sar("nv", ham),
            "istem": lambda: _sar("gp", ham),
            "komut": lambda: _sar("nb", ham),
            "islec": lambda: _sar("o", ham),
        }[tur]())
    cikti.append(kac(kod[son:]))
    return "".join(cikti)


def dil_sez(kod):
    ilk = kod.lstrip()[:400]
    if re.search(r"^\s*<[!/A-Za-z]", kod, re.M):
        return "html"
    if re.search(r"^\s*(def |class |import |from \w+ import|print\()", kod, re.M):
        return "python3"
    if re.search(r"^\s*(\$ |pip |python3? |npm |npx |git |curl |cd |ls |export |"
                 r"docker |psql |ssh )", ilk, re.M):
        return "console"
    return "text"


RENKLENDIRICI = {
    "python": py_renklendir, "python3": py_renklendir, "py": py_renklendir,
    "html": html_renklendir, "xml": html_renklendir,
    "console": kabuk_renklendir, "bash": kabuk_renklendir, "sh": kabuk_renklendir,
    "shell": kabuk_renklendir,
}


def kod_blogu(kod, etiket, dil):
    ad = (etiket or dil_sez(kod)).strip().lower()
    boya = RENKLENDIRICI.get(ad)
    govde_ = boya(kod) if boya else kac(kod)
    return (f'<div class="highlight-{ad} notranslate"><div class="highlight">'
            f'<button class="kopyala" type="button" '
            f'data-oldu="{S[dil]["kopyalandi"]}">{S[dil]["kopyala"]}</button>'
            f'<pre><span></span>{govde_}\n</pre></div></div>')


# ---------------------------------------------------------------- markdown
def satir_ici(s):
    kutu = []

    def sakla(m):
        kutu.append(m.group(1))
        return f"\x00{len(kutu) - 1}\x00"

    s = re.sub(r"`([^`]+)`", sakla, s)
    s = kac(s)
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a class="reference external" href="\2">\1</a>', s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", s)
    s = re.sub(
        r"\x00(\d+)\x00",
        lambda m: ('<code class="docutils literal notranslate"><span class="pre">'
                   + kac(kutu[int(m.group(1))]) + "</span></code>"),
        s,
    )
    s = re.sub(
        r"\[\^([0-9A-Za-z_-]+)\]",
        lambda m: (f'<sup class="dipnot-ref" id="dipnot-ref-{m.group(1)}">'
                   f'<a href="#dipnot-{m.group(1)}">{m.group(1)}</a></sup>'),
        s,
    )
    # Yıldız, sayfanın altındaki eke bağlanır. Ek yoksa yıldız da basılmaz:
    # kırık bir dipnot, dipnotsuz bir cümleden kötüdür.
    s = re.sub(r"(?<=[.!?,;:\w])\*(?![*\w])",
               '<sup class="ek-ref" id="ek-ref-1"><a href="#ek-1">*</a></sup>', s)
    return s


def markdown(kaynak, dil):
    """Küçük bir markdown alt kümesi -> Sphinx'in ürettiğine yakın HTML.

    Dönen: (parçalar, başlıklar). Parçalar ya ("html", metin) ya da
    ("h2"/"h3", {...}); bölümleme ve içindekiler bunun üstüne kuruluyor.
    """
    parca, basliklar, kimlikler = [], [], set()
    satirlar = kaynak.split("\n")
    i = 0
    while i < len(satirlar):
        satir = satirlar[i]

        m_dip = re.match(r"^\[\^([0-9A-Za-z_-]+)\]:\s*(.*)$", satir)
        if m_dip:
            ad = m_dip.group(1)
            blok = [m_dip.group(2)]
            i += 1
            while i < len(satirlar) and satirlar[i].startswith(("    ", "\t")):
                blok.append(satirlar[i].strip())
                i += 1
            parca.append(("html",
                          f'<aside class="dipnot" id="dipnot-{ad}">'
                          f'<a class="dipnot-geri" href="#dipnot-ref-{ad}">{ad}</a>'
                          f"<p>{satir_ici(' '.join(blok).strip())}</p></aside>"))
            continue

        if satir.strip() == "::ek":
            # Bölümün uyandırdığı yan fikir. Kanun: appendix sayfanın altında
            # durur, bölümün içinde değil. Yıldız buraya bağlanır.
            i += 1
            blok = []
            while i < len(satirlar) and satirlar[i].strip() != "::":
                blok.append(satirlar[i])
                i += 1
            i += 1
            ic, _ = markdown("\n".join(blok), dil)
            govde_ = "\n".join(p for _, p in ic if isinstance(p, str))
            parca.append(("html",
                          f'<aside class="ek" id="ek-1">'
                          f'<a class="ek-geri" href="#ek-ref-1">*</a>'
                          f"{govde_}</aside>"))
            continue

        if satir.strip() == "::kontrol":
            i += 1
            blok = []
            while i < len(satirlar) and satirlar[i].strip() != "::":
                blok.append(satirlar[i])
                i += 1
            i += 1
            ic, _ = markdown("\n".join(blok), dil)
            govde_ = "\n".join(p for _, p in ic if isinstance(p, str))
            parca.append(("html",
                          '<div class="admonition note kontrol">'
                          f'<p class="admonition-title">{S[dil]["kontrol"]}</p>'
                          f"{govde_}"
                          '<label class="gec"><input type="checkbox" class="gec-kutu"> '
                          f'{S[dil]["gectim"]}</label></div>'))
            continue

        if satir.startswith("```"):
            etiket = satir[3:].strip()
            i += 1
            blok = []
            while i < len(satirlar) and not satirlar[i].startswith("```"):
                blok.append(satirlar[i])
                i += 1
            i += 1
            parca.append(("html", kod_blogu("\n".join(blok), etiket, dil)))
            continue

        if not satir.strip():
            i += 1
            continue

        if satir.startswith("> "):
            blok = []
            while i < len(satirlar) and satirlar[i].startswith("> "):
                blok.append(satirlar[i][2:])
                i += 1
            parca.append(("html", '<blockquote class="epigraph"><p>'
                          + satir_ici(" ".join(blok)) + "</p></blockquote>"))
            continue

        if re.match(r"^#{1,4} ", satir):
            kademe = len(satir) - len(satir.lstrip("#"))
            baslik = satir.lstrip("#").strip()
            i += 1
            if kademe == 1:
                continue
            kimlik = slugla(baslik)
            n = 2
            while kimlik in kimlikler:
                kimlik, n = f"{slugla(baslik)}-{n}", n + 1
            kimlikler.add(kimlik)
            sev = 2 if kademe == 2 else 3
            kayit = {"id": kimlik, "html": satir_ici(baslik), "duz": baslik,
                     "sev": sev}
            basliklar.append(kayit)
            parca.append((f"h{sev}", kayit))
            continue

        if re.match(r"^[-*] ", satir):
            blok = []
            while i < len(satirlar) and re.match(r"^[-*] ", satirlar[i]):
                blok.append("<li><p>" + satir_ici(satirlar[i][2:]) + "</p></li>")
                i += 1
            parca.append(("html", '<ul class="simple">' + "".join(blok) + "</ul>"))
            continue

        if re.match(r"^\d+\. ", satir):
            blok = []
            while i < len(satirlar) and re.match(r"^\d+\. ", satirlar[i]):
                blok.append("<li><p>"
                            + satir_ici(re.sub(r"^\d+\. ", "", satirlar[i]))
                            + "</p></li>")
                i += 1
            parca.append(("html", '<ol class="arabic simple">' + "".join(blok) + "</ol>"))
            continue

        if satir.startswith("---"):
            parca.append(("html", '<hr class="docutils" />'))
            i += 1
            continue

        blok = []
        while (i < len(satirlar) and satirlar[i].strip()
               and not re.match(r"^(#{1,4} |[-*] |\d+\. |> |```|---|::)", satirlar[i])):
            blok.append(satirlar[i])
            i += 1
        parca.append(("html", "<p>" + satir_ici(" ".join(blok)) + "</p>"))

    return parca, basliklar


def bolumle(parca, dil):
    """Başlıkları Sphinx gibi <section> ağacına sar, ¶ çıpasını ekle."""
    cikti, yigin = [], []
    cpa = "Bu başlığa bağlantı" if dil == "tr" else "Link to this heading"
    for tur, deger in parca:
        if tur in ("h2", "h3"):
            sev = deger["sev"]
            while yigin and yigin[-1] >= sev:
                cikti.append("</section>")
                yigin.pop()
            cikti.append(f'<section id="{deger["id"]}">')
            yigin.append(sev)
            cikti.append(
                f'<h{sev}>{deger["html"]}'
                f'<a class="headerlink" href="#{deger["id"]}" title="{cpa}">¶</a>'
                f"</h{sev}>")
        else:
            cikti.append(deger)
    cikti.extend("</section>" for _ in yigin)
    return "\n".join(cikti)


def icindekiler(basliklar, dil):
    ust = [b for b in basliklar if b["sev"] == 2]
    if len(ust) < 2:
        return ""
    p = [f'<div class="contents local topic" id="contents">',
         f'<p class="topic-title">{S[dil]["icindekiler"]}</p>',
         '<ul class="simple">']
    for b in ust:
        p.append(f'<li><a class="reference internal" href="#{b["id"]}">'
                 f'{b["html"]}</a></li>')
    p.append("</ul></div>")
    return "\n".join(p)


ETIKETSIZ = re.compile(r"<[^>]+>")


def duz(h):
    return html.unescape(ETIKETSIZ.sub(" ", h))


# ---------------------------------------------------------------- iskelet
def kafa(veri, baslik, aciklama, kanonik, yukari, dil, karsi_url, indeksle=True, bolum="", og=None):
    og = og or f'{veri["site"]["url"]}tema/og-{dil}.png'
    obur = "en" if dil == "tr" else "tr"
    t = S[dil]
    robot = "index,follow" if indeksle else "noindex"
    return f"""<!DOCTYPE html>
<html lang="{dil}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="{html.escape(aciklama)}" />
    <meta name="author" content="Damla Su Bilge" />
    <meta name="robots" content="{robot}" />

    <title>{html.escape(baslik)} &#8212; vibecodedslopware</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="{FONTLAR}" />
    <link rel="stylesheet" type="text/css" href="{yukari}tema/pygments.css" />
    <link rel="stylesheet" type="text/css" href="{yukari}tema/pyramid.css" />
    <link rel="stylesheet" type="text/css" href="{yukari}tema/cmu.css" />
    <link rel="stylesheet" type="text/css" href="{yukari}tema/kitap.css" />
    <link rel="canonical" href="{kanonik}" />
    <link rel="alternate" hreflang="{dil}" href="{kanonik}" />
    <link rel="alternate" hreflang="{obur}" href="{karsi_url}" />
    <link rel="search" title="{t["ara"]}" href="{yukari}ara/" />
    <link rel="alternate" type="application/rss+xml" title="vibecodedslopware" href="{yukari}rss.xml" />
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='white'/%3E%3Crect x='6' y='6' width='6' height='20' fill='%23808080'/%3E%3Crect x='20' y='6' width='6' height='20' fill='%23808080'/%3E%3C/svg%3E" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="vibecodedslopware" />
    <meta property="og:title" content="{html.escape(baslik)}" />
    <meta property="og:description" content="{html.escape(aciklama)}" />
    <meta property="og:url" content="{kanonik}" />
    <meta property="og:image" content="{og}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#ffffff" />
    <script>window.KOK = "{yukari}"; window.DIL = "{dil}"; window.BOLUM = "{bolum}";</script>
  </head><body>
<div class='header'><a href='{yukari}'>vibecodedslopware</a></div>
"""


def navbar(veri, yukari, dil, karsi_url):
    t = S[dil]
    p = ["<ul class='navbar'>"]
    for m in veri["mufredatlar"]:
        p.append(f'    <li><a href="{yukari}{m["kod"]}/">{m["ad"]}</a></li>')
    p.append(f'    <li><a href="{yukari}kitap/">html</a></li>')
    p.append(f'    <li><a href="{yukari}kitap/slopware-{dil}.pdf">pdf</a></li>')
    p.append('    <li><a href="https://github.com/nosey-dewdrop/vibecodedslopware">github</a></li>')
    if len(DILLER) > 1:
        p.append(f'    <li><a href="{karsi_url}">{"en" if dil == "tr" else "tr"}</a></li>')
    p.append(f"""    <li class="ara"><form action="{yukari}ara/" method="get" role="search">
      <input type="text" name="q" placeholder="{t["arama_kutusu"]}" aria-label="{t["ara"]}"
             autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
    </form></li>""")
    p.append("</ul>\n")
    return "\n".join(p)


def abone_formu(veri, dil):
    """Bülten formu. Servisi mufredat.json söyler:

        "bulten": {"servis": "buttondown", "kod": "kullanici-adi"}
        "bulten": {"servis": "sender",     "kod": "https://.../form-eylemi"}
        "bulten": {"servis": "ozel",       "kod": "https://tam/adres", "alan": "email"}

    Kod boşsa form basılmaz: yarım bir form, formsuz bir sayfadan kötüdür.
    Eski "buttondown" alanı hâlâ okunur, çünkü site onunla kuruldu."""
    b = veri["site"].get("bulten") or {}
    servis = b.get("servis") or ("buttondown" if veri["site"].get("buttondown") else "")
    kod = b.get("kod") or veri["site"].get("buttondown", "")
    if not kod:
        return ""

    if servis == "buttondown":
        eylem = f"https://buttondown.com/api/emails/embed-subscribe/{kod}"
    else:
        eylem = kod
    alan = b.get("alan", "email")

    t = S[dil]
    return f"""<form class="abone" action="{eylem}" method="post" target="_blank">
  <label for="abone-mail">{t["abone"]}</label>
  <span class="abone-satir"><input type="email" id="abone-mail" name="{alan}" required
         placeholder="mail" autocomplete="email" />
  <input type="submit" value="{t["abone_dugme"]}" /></span>
  <input type="hidden" name="tag" value="{dil}" />
  <small>{t["abone_not"]}</small>
</form>"""


def gezinti(yukari, dil, kirinti, onceki=None, sonraki=None, kisayol=False, karsi_url=None):
    """yazbel'in üstte ve altta tekrarlayan noktalı 'related' şeridi."""
    t = S[dil]
    ks = ' accesskey="I"' if kisayol else ""
    p = [f'    <div class="related" role="navigation" aria-label="{t["gezinti"]}">',
         f"      <h3>{t['gezinti']}</h3>", "      <ul>"]
    if karsi_url and len(DILLER) > 1:
        # navbar 500px altında gizli; dil değiştirmenin tek yolu bu şerit.
        obur = "en" if dil == "tr" else "tr"
        p.append(f'        <li class="right dil" style="margin-right: 10px">'
                 f'<a href="{karsi_url}" hreflang="{obur}">{obur}</a></li>')
    p.append(f'        <li class="right" style="margin-right: 10px">')
    p.append(f'          <a href="{yukari}ara/" title="{t["arama"]}"{ks}>{t["ara"]}</a></li>')
    if sonraki:
        ks = ' accesskey="N"' if kisayol else ""
        p.append(f'        <li class="right" >\n          <a href="{sonraki[0]}" '
                 f'title="{html.escape(sonraki[1])}"{ks}>{t["sonraki"]}</a> |</li>')
    if onceki:
        ks = ' accesskey="P"' if kisayol else ""
        p.append(f'        <li class="right" >\n          <a href="{onceki[0]}" '
                 f'title="{html.escape(onceki[1])}"{ks}>{t["onceki"]}</a> |</li>')
    p.append(f'<li class="nav-item nav-item-0"><a href="{yukari}" '
             f'title="{t["ev"]}">&#x2302;</a></li>')
    for n, (url, ad) in enumerate(kirinti[:-1], start=1):
        p.append(f'          <li class="nav-item nav-item-{n}">'
                 f'<a href="{url}" >{html.escape(ad)}</a> &#187;</li>')
    p.append(f'        <li class="nav-item nav-item-this"><a href="">'
             f'{html.escape(kirinti[-1][1])}</a></li>')
    p.append("      </ul>\n    </div>")
    return "\n".join(p)



def bolum_sonu(yukari, dil, onceki, sonraki):
    """Bölümün altında, adıyla birlikte sıradaki bölüm.

    Üstteki şerit dar ve orada yalnızca "next" yazıyor; bir kitapta okurun
    bilmek istediği şey yönü değil, nereye gittiğidir."""
    if not onceki and not sonraki:
        return ""
    t = S[dil]
    p = ['<nav class="sonraki" aria-label="' + kac(t["gezinti"]) + '">']
    if onceki:
        p.append(f'  <a class="geri" href="{onceki[0]}">'
                 f'<span>{kac(t["onceki"])}</span><b>{kac(onceki[1])}</b></a>')
    if sonraki:
        p.append(f'  <a class="ileri" href="{sonraki[0]}">'
                 f'<span>{kac(t["sonraki"])}</span><b>{kac(sonraki[1])}</b></a>')
    p.append("</nav>")
    return "\n".join(p)


def kenar(veri, m, dil, yukari, simdiki_slug):
    """Her bölüm sayfasının solunda duran müfredat: hangi bölümdesin, kaçını
    geçtin, sırada ne var. Tikler bölüm sonundaki kontrolle aynı yerden okunur."""
    t = S[dil]
    # Önsöz bir bölüm değil: okurun yapacağı bir işi yok, o yüzden paydada da yok.
    toplam = sum(1 for sv in m["seviyeler"] for b in sv["bolumler"] if not b.get("onsoz"))
    p = [f'<nav class="kenar" aria-label="{kac(m["ad"])}">',
         '  <div class="kenar-ust">',
         f'    <a class="kenar-ad" href="{yukari}{m["kod"]}/">{kac(m["ad"])}</a>',
         '    <div class="kenar-cubuk"><span class="kenar-dolu"></span></div>',
         f'    <p class="kenar-sayi"><b>0</b> / {toplam} {kac(t["gecilen"])}</p>',
         f'    <button type="button" class="kenar-ac" aria-expanded="false">'
         f'{kac(t["butun_bolumler"])}</button>',
         '  </div>',
         '  <ol class="kenar-liste">']
    for sv in m["seviyeler"]:
        p.append(f'    <li class="kenar-seviye">{kac(sv["kod"])} &#183; '
                     f'{kac(sv.get(f"ad_{dil}") or sv["ad"])}</li>')
        for b in sv["bolumler"]:
            slug, no = b["slug"], b["no"]
            baslik = kac(bolum_alan(b, "baslik", dil))
            kimlik = f'{m["kod"]}/{slug}'
            if not acik_mi(b):
                acilir = t["acilir"].format(tarih=tarih_yaz(b["tarih"], dil))
                p.append(f'    <li class="kenar-bolum kapali"><i>{no:02d}</i>'
                         f'<span>{baslik}</span>'
                         f'<em class="kilit" tabindex="0">'
                         f'<span aria-hidden="true">&#9679;</span>'
                         f'<span class="gizli">{kac(acilir)}</span></em></li>')
            else:
                simdi = " burada" if slug == simdiki_slug else ""
                if b.get("onsoz"):
                    p.append(f'    <li class="kenar-bolum onsoz{simdi}">'
                             f'<i>&#183;</i>'
                             f'<a href="{yukari}{m["kod"]}/{slug}/">{baslik}</a></li>')
                else:
                    p.append(f'    <li class="kenar-bolum{simdi}" data-bolum="{kimlik}">'
                             f'<i>{no:02d}</i>'
                             f'<a href="{yukari}{m["kod"]}/{slug}/">{baslik}</a></li>')
    p += ["  </ol>", "</nav>"]
    return "\n".join(p)


GOVDE_AC = """
    <div class="document">
      <div class="documentwrapper">
          <div class="body" role="main">
"""

GOVDE_KAPA = """
            <div class="clearer"></div>
          </div>
      </div>
      <div class="clearer"></div>
    </div>
"""


def ayak(yukari, dil, ekstra=""):
    t = S[dil]
    return f"""
<div class="footer">
	&copy; 2026, Damla Su Bilge | <a href="https://github.com/nosey-dewdrop/vibecodedslopware">{t["kaynak"]}</a>, {t["fork"]}.
	{t["lisans"]}.
<br>
{t["olusturuldu"]} &#183; {t["gorunum"]}
<br>
<span class="ayak-ipucu">{t["ipucu"].format(kok=yukari)}</span>
<br>
<br>
</div>
<script src="{yukari}tema/stem.js"></script>
<script src="{yukari}tema/site.js"></script>
<script src="{yukari}tema/kitap.js"></script>{ekstra}
  </body>
</html>
"""


# ---------------------------------------------------------------- kurulum
def kur():
    veri = json.loads((KOK / "mufredat.json").read_text(encoding="utf-8"))

    for m in veri["mufredatlar"]:
        if (KOK / m["kod"]).exists():
            shutil.rmtree(KOK / m["kod"])
    en_pdf = KOK / "kitap" / "slopware-en.pdf"
    en_pdf_yedek = en_pdf.read_bytes() if en_pdf.exists() else None
    for eski in ("en", "ara", "bolum"):
        if (KOK / eski).exists():
            shutil.rmtree(KOK / eski)
    if en_pdf_yedek:
        en_pdf.parent.mkdir(parents=True, exist_ok=True)
        en_pdf.write_bytes(en_pdf_yedek)

    stem_js_yaz()

    toplam = 0
    for dil in DILLER:
        onek = ""
        indeks = []
        for m in veri["mufredatlar"]:
            toplam += mufredat_kur(veri, m, dil, onek, indeks)
        okul_sayfasi(veri, dil, onek)
        arama_sayfasi(veri, dil, onek)
        arama_indeksi(indeks, dil)
        rss_yaz(veri, dil, onek)
        toplam += 2

    site_haritasi(veri)
    dort_yuz_dort(veri)
    eski_en_yonlendir(veri)
    (KOK / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\nSitemap: {veri['site']['url']}sitemap.xml\n", encoding="utf-8")
    print(f"{toplam} sayfa kuruldu ({len(veri['mufredatlar'])} müfredat × {len(DILLER)} dil).")


def mufredat_kur(veri, m, dil, onek, indeks):
    site, t = veri["site"], S[dil]
    duzlem = [b for sv in m["seviyeler"] for b in sv["bolumler"]]
    seviye_of = {b["slug"]: sv for sv in m["seviyeler"] for b in sv["bolumler"]}
    yukari = "../../"
    sayac = 0

    # Tarihi gelmemiş bölüm kilitli: sayfası kurulmaz, listede tıklanmaz.
    # Tarihi gelmiş ama md'si olmayan bölüm (ör. EN ikizi henüz yok) "yazılmadı"
    # sayfasıyla kurulur. Sayfalar arası önceki/sonraki yalnızca açıklar arasında.
    acik = [b for b in duzlem if acik_mi(b)]
    for idx, b in enumerate(acik):
        sv = seviye_of[b["slug"]]
        baslik = bolum_alan(b, "baslik", dil)
        neden = bolum_alan(b, "neden", dil, zorunlu=False)
        kaynak = YAZILAR / dil / m["kod"] / f"{b['slug']}.md"

        if kaynak.exists():
            parca, basliklar = markdown(kaynak.read_text(encoding="utf-8"), dil)
            govde_ = bolumle(parca, dil)
            ic_tablo = icindekiler(basliklar, dil)
            icerik = govde_
            aranan = duz(govde_)
            b[f"govde_{dil}"] = govde_
        else:
            icerik = f'<p class="henuz">{t["henuz"]} {t["haftada"]}.</p>'
            ic_tablo, basliklar, aranan = "", [], ""
        # Durum dile göre: mufredat.json'daki sözlük iki dilde de aynı nesne,
        # tek bir "durum" alanı yazarsak tr taraması en tarafını da yayında
        # sanıyor ve boş sayfalar aramaya giriyor.
        b[f"durum_{dil}"] = "yazildi" if kaynak.exists() else "bos"
        b[f"ozet_{dil}"] = neden or " ".join(aranan.split()[:60])

        kanonik = f'{site["url"]}{onek}{m["kod"]}/{b["slug"]}/'
        karsi = kanonik
        onceki = acik[idx - 1] if idx > 0 else None
        sonraki = acik[idx + 1] if idx < len(acik) - 1 else None
        onc = ((f'{yukari}{m["kod"]}/{onceki["slug"]}/',
                bolum_alan(onceki, "baslik", dil)) if onceki else None)
        son = ((f'{yukari}{m["kod"]}/{sonraki["slug"]}/',
                bolum_alan(sonraki, "baslik", dil)) if sonraki else None)
        kirinti = [(f'{yukari}{m["kod"]}/', m["ad"]), ("", baslik)]

        og = og_uret(veri, b, dil) if kaynak.exists() else None
        kuyruk = ""
        if kaynak.exists():
            kaynak_url = (f'https://github.com/nosey-dewdrop/vibecodedslopware/edit/main/'
                          f'yazilar/{dil}/{m["kod"]}/{b["slug"]}.md')
            li = "https://www.linkedin.com/sharing/share-offsite/?url=" + html.escape(kanonik)
            kuyruk = (f'<p class="paylas"><span>{t["paylas"]}:</span> '
                      f'<a href="{li}" target="_blank" rel="noopener">linkedin</a> &#183; '
                      f'<a href="https://x.com/intent/post?url={html.escape(kanonik)}" '
                      f'target="_blank" rel="noopener">x</a> &#183; '
                      f'<button type="button" class="link-kopyala" data-link="{kanonik}" '
                      f'data-oldu="{t["kopyalandi_link"]}">{t["linki_kopyala"]}</button></p>'
                      f'<p class="iyilestir"><a href="{kaynak_url}">{t["iyilestir"]}</a> '
                      f'&#183; {t["iyilestir_not"]}</p>')
        sayfa = [kafa(veri, baslik, neden, kanonik, yukari, dil, karsi,
                      bolum=f'{m["kod"]}/{b["slug"]}', og=og),
                 navbar(veri, yukari, dil, karsi),
                 gezinti(yukari, dil, kirinti, onc, son, kisayol=True, karsi_url=karsi),
                 '<div class="kitap">',
                 kenar(veri, m, dil, yukari, b["slug"]),
                 GOVDE_AC,
                 f'  <section id="{b["slug"]}">',
                 f'<h1>{kac(baslik)}<a class="headerlink" href="#{b["slug"]}" '
                 f'title="{"Bu başlığa bağlantı" if dil == "tr" else "Link to this heading"}">'
                 f"¶</a></h1>",
                 f'<div class="description yazi-ozet">{kac(neden)}</div>',
                 icerik,
                 bolum_sonu(yukari, dil, onc, son),
                 abone_formu(veri, dil),
                 "</section>",
                 GOVDE_KAPA,
                 (f'<div class="kenar-not">{ic_tablo}{kuyruk}</div>'
                  if (ic_tablo or kuyruk) else ""),
                 '</div>',
                 gezinti(yukari, dil, kirinti, onc, son),
                 ayak(yukari, dil)]
        sayfa = "\n".join(sayfa)

        klasor = (KOK / onek.rstrip("/") / m["kod"] / b["slug"] if onek
                  else KOK / m["kod"] / b["slug"])
        klasor.mkdir(parents=True, exist_ok=True)
        (klasor / "index.html").write_text(sayfa, encoding="utf-8")
        sayac += 1

        if b[f"durum_{dil}"] == "yazildi":
            indeks.append({
                "u": f'{onek}{m["kod"]}/{b["slug"]}/',
                "b": baslik,
                "o": neden,
                "n": f'{m["ad"]} · {b["no"]:02d}',
                "g": aranan,
                "h": [{"i": x["id"], "b": x["duz"]} for x in basliklar],
            })

    for b in duzlem:
        if not acik_mi(b):
            b[f"durum_{dil}"] = "kilitli"

    return sayac + mufredat_ana(veri, m, dil, onek) + kitap_kur(veri, m, dil, onek)


def mufredat_ana(veri, m, dil, onek):
    site, t = veri["site"], S[dil]
    duzlem = [b for sv in m["seviyeler"] for b in sv["bolumler"]]
    yazilan = sum(1 for b in duzlem if b.get(f"durum_{dil}") == "yazildi")
    yukari = "../"
    kanonik = f'{site["url"]}{onek}{m["kod"]}/'
    karsi = kanonik
    baslik = metin(m["baslik"], dil)
    ozet = metin(m["ozet"], dil)
    kimlik = slugla(m["kod"])

    ilk = duzlem[0] if duzlem else None
    son = ((f'{yukari}{m["kod"]}/{ilk["slug"]}/', bolum_alan(ilk, "baslik", dil))
           if ilk else None)
    kirinti = [("", m["ad"])]

    p = [kafa(veri, baslik, ozet, kanonik, yukari, dil, karsi),
         navbar(veri, yukari, dil, karsi),
         gezinti(yukari, dil, kirinti, None, son, kisayol=True, karsi_url=karsi),
         '<div class="kitap">',
         kenar(veri, m, dil, yukari, None),
         GOVDE_AC,
         f'  <section id="{kimlik}">',
         f'<h1>{kac(baslik)}<a class="headerlink" href="#{kimlik}" title="'
         f'{"Bu başlığa bağlantı" if dil == "tr" else "Link to this heading"}">¶</a></h1>',
         f'<div class="description yazi-ozet">{kac(ozet)}</div>']

    if not duzlem:
        p.append(f'<p class="henuz">{t["hazirlaniyor"]}</p>')
    else:
        p.append(f'<p class="henuz">{len(duzlem)} {t["bolumler"]} &#183; '
                 f'{yazilan} {t["yayinda"]} &#183; {t["haftada"]}'
                 f'<span class="gecilen" hidden> &#183; <b>0</b> {t["gecilen"]}</span>.'
                 f'{siradaki_satir(m, dil)}</p>')
        tek = len(m["seviyeler"]) == 1
        for sv in m["seviyeler"]:
            sv_ad = f'{sv["kod"]} {sv.get(f"ad_{dil}") or metin(sv["ad"], dil)}'
            sv_id = slugla(sv_ad)
            p.append(f'<section id="{sv_id}">')
            if not tek:
                p.append(f'<h2>{sv["kod"]} / {kac(sv.get(f"ad_{dil}") or metin(sv["ad"], dil))}'
                         f'<a class="headerlink" href="#{sv_id}" title="'
                         f'{"Bu başlığa bağlantı" if dil == "tr" else "Link to this heading"}">'
                         f'¶</a></h2>')
                p.append(f'<p>{kac(metin(sv["ozet"], dil))}</p>')
            basla = sv["bolumler"][0]["no"] if sv["bolumler"] else 0
            p.append(f'<div class="toctree-wrapper compound">\n<ol start="{basla}">')
            for b in sv["bolumler"]:
                durum = b[f"durum_{dil}"]
                baslik_b = kac(bolum_alan(b, "baslik", dil))
                neden_b = bolum_alan(b, "neden", dil, zorunlu=False)
                neden_html = f'<p class="neden">{kac(neden_b)}</p>' if neden_b else ""
                if durum == "kilitli":
                    # Link yok: tıklanmaz. Tarih hover'da (title) ve ekran okuyucuda.
                    ne_zaman = t["acilir"].format(tarih=tarih_yaz(b["tarih"], dil))
                    p.append(
                        f'<li class="toctree-l1 kilitli" data-bolum="{m["kod"]}/{b["slug"]}">'
                        f'<span class="baslik">{baslik_b}</span>'
                        f'<span class="kilit" title="{kac(ne_zaman)}" tabindex="0">'
                        f'<span aria-hidden="true">&#128274;</span>'
                        f'<span class="gizli">{kac(ne_zaman)}</span></span>'
                        f'{neden_html}</li>')
                    continue
                yazildi = durum == "yazildi"
                sinif = "toctree-l1" if yazildi else "toctree-l1 yazilmadi"
                damga = ("" if yazildi
                         else f'<span class="durum">{t["yazilmadi"]}</span>')
                p.append(
                    f'<li class="{sinif}" data-bolum="{m["kod"]}/{b["slug"]}">'
                    f'<a class="reference internal" href="{yukari}{m["kod"]}/{b["slug"]}/">'
                    f'{baslik_b}</a>{damga}'
                    f'<span class="durum gecti" hidden>{t["gecti"]}</span>'
                    f'{neden_html}</li>')
            p.append("</ol>\n</div>")
            p.append("</section>")
        p.append(abone_formu(veri, dil))

    p.append("</section>")
    p.append(GOVDE_KAPA)
    p.append("</div>")
    p.append(gezinti(yukari, dil, kirinti, None, son))
    p.append(ayak(yukari, dil))

    klasor = KOK / onek.rstrip("/") / m["kod"] if onek else KOK / m["kod"]
    klasor.mkdir(parents=True, exist_ok=True)
    (klasor / "index.html").write_text("\n".join(p), encoding="utf-8")
    return 1


def kitap_kur(veri, m, dil, onek):
    """Yayındaki bölümler tek sayfada: yazdırılır, pdf'i buradan çıkar."""
    site, t = veri["site"], S[dil]
    if m["durum"] != "yayinda":
        return 0
    duzlem = [b for sv in m["seviyeler"] for b in sv["bolumler"]]
    yayinda = [b for b in duzlem if b.get(f"durum_{dil}") == "yazildi"]
    yukari = "../"
    kanonik = f'{site["url"]}{onek}kitap/'
    karsi = kanonik
    baslik = metin(m["baslik"], dil)
    kirinti = [("", t["kitap"])]

    p = [kafa(veri, f'{t["kitap"]} · {baslik}', t["kitap_ozet"], kanonik, yukari, dil, karsi),
         navbar(veri, yukari, dil, karsi),
         gezinti(yukari, dil, kirinti, kisayol=True, karsi_url=karsi),
         '<div class="kitap">',
         kenar(veri, m, dil, yukari, None),
         GOVDE_AC,
         '  <section id="kitap" class="kitap-tam">',
         f'<h1>{kac(baslik)}<a class="headerlink" href="#kitap">¶</a></h1>',
         f'<div class="description yazi-ozet">{kac(metin(m["ozet"], dil))}</div>',
         f'<p class="henuz">{len(yayinda)} / {len(duzlem)} {t["bolumler"]} &#183; '
         f'<a href="{yukari}kitap/slopware-{dil}.pdf">pdf</a> &#183; {kac(t["kitap_ozet"])}</p>',
         '<div class="contents local topic" id="contents"><ul class="simple">']
    for b in yayinda:
        p.append(f'<li><a class="reference internal" href="#{b["slug"]}">'
                 f'{b["no"]:02d} {kac(bolum_alan(b, "baslik", dil))}</a></li>')
    p.append("</ul></div>")
    for b in yayinda:
        p.append(f'<section id="{b["slug"]}" class="kitap-bolum">')
        p.append(f'<h1><span class="no">{b["no"]:02d}</span> {kac(bolum_alan(b, "baslik", dil))}'
                 f'<a class="headerlink" href="#{b["slug"]}">¶</a></h1>')
        neden = bolum_alan(b, "neden", dil)
        if neden:
            p.append(f'<div class="description yazi-ozet">{kac(neden)}</div>')
        p.append(b[f"govde_{dil}"])
        p.append("</section>")
    p.append("</section>")
    p.append(GOVDE_KAPA)
    p.append("</div>")
    p.append(gezinti(yukari, dil, kirinti))
    p.append(ayak(yukari, dil))

    klasor = KOK / onek.rstrip("/") / "kitap" if onek else KOK / "kitap"
    klasor.mkdir(parents=True, exist_ok=True)
    (klasor / "index.html").write_text("\n".join(p), encoding="utf-8")
    pdf_yaz(klasor / "index.html", klasor / f"slopware-{dil}.pdf")
    return 1


def siradaki_satir(m, dil, kisa=False):
    """Kilitli ilk bölüm ve tarihi. Hepsi açıksa boş."""
    t = S[dil]
    for sv in m["seviyeler"]:
        for b in sv["bolumler"]:
            if not acik_mi(b):
                tarih = tarih_yaz(b["tarih"], dil)
                if kisa:
                    return f' &#183; {t["siradaki"]}: {tarih}'
                return (f'<br /><span class="siradaki">{t["siradaki"]}: '
                        f'<b>{kac(bolum_alan(b, "baslik", dil))}</b>, {tarih}.</span>')
    return ""


OG_SABLON = """<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="{fontlar}">
<style>
body{{margin:0;width:1200px;height:630px;background:#fff;font-family:"Noto Sans",sans-serif;color:#333;overflow:hidden}}
.k{{position:absolute;left:80px;top:120px;right:80px}}
.logo{{font-family:"Special Elite",monospace;font-size:56px;color:gray;text-shadow:silver 0 0 6px;margin:0}}
.no{{font-family:"Roboto Slab",serif;font-size:28px;color:gray;margin:40px 0 0}}
h1{{font-family:"Roboto Slab",serif;font-weight:400;font-size:54px;line-height:1.25;margin:8px 0 0;color:#333}}
p.alt{{font-style:italic;color:gray;font-size:26px;margin:24px 0 0}}
</style>
<body><div class="k"><p class="logo">vibecodedslopware</p>
<p class="no">{no}</p><h1>{baslik}</h1><p class="alt">{alt}</p></div>"""


def og_uret(veri, b, dil):
    """Her yayındaki bölüme kendi paylaşım görseli: LinkedIn'de başlık görünsün.
    Chrome yoksa eldeki görsel durur, o da yoksa sitenin genel görseli."""
    hedef = KOK / "tema" / "og" / f'{b["slug"]}-{dil}.png'
    url = f'{veri["site"]["url"]}tema/og/{b["slug"]}-{dil}.png'
    chrome = chrome_bul()
    if not chrome:
        return url if hedef.exists() else None
    hedef.parent.mkdir(parents=True, exist_ok=True)
    kaynak = hedef.with_suffix(".html")
    kaynak.write_text(OG_SABLON.format(
        fontlar=FONTLAR, no=f'{b["no"]:02d} / {S[dil]["bolumler"]}',
        baslik=kac(bolum_alan(b, "baslik", dil)),
        alt=kac(bolum_alan(b, "neden", dil) or metin(veri["site"]["aciklama"], dil))),
        encoding="utf-8")
    komut = [chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars",
             "--window-size=1200,630", f"--screenshot={hedef}",
             "--virtual-time-budget=6000", kaynak.resolve().as_uri()]
    try:
        subprocess.run(komut, check=True, capture_output=True, timeout=90)
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as e:
        print(f"  og basılamadı ({b['slug']}, {dil}): {e}")
    finally:
        kaynak.unlink(missing_ok=True)
    return url if hedef.exists() else None


def chrome_bul():
    for aday in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser",
                 "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"):
        if shutil.which(aday) or Path(aday).exists():
            return aday
    return None


def pdf_yaz(html_yolu, pdf_yolu):
    """Kitap sayfasını Chrome ile pdf'e basar. Chrome yoksa eldeki pdf durur."""
    chrome = chrome_bul()
    if not chrome:
        print(f"  chrome yok, {pdf_yolu.name} güncellenmedi")
        return
    komut = [chrome, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
             f"--print-to-pdf={pdf_yolu}", "--virtual-time-budget=8000",
             "--run-all-compositor-stages-before-draw", html_yolu.resolve().as_uri()]
    try:
        subprocess.run(komut, check=True, capture_output=True, timeout=120)
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as e:
        print(f"  pdf basılamadı: {e}")


def rss_yaz(veri, dil, onek):
    """Buttondown'ın 'RSS'ten mail' otomasyonu buradan okur."""
    site = veri["site"]
    u = f'{site["url"]}{onek}'
    p = ['<?xml version="1.0" encoding="UTF-8"?>',
         '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>',
         '<title>vibecodedslopware</title>',
         f'<link>{u}</link>',
         f'<description>{html.escape(metin(site["aciklama"], dil))}</description>',
         f'<language>{dil}</language>',
         f'<atom:link href="{u}rss.xml" rel="self" type="application/rss+xml" />']
    kalemler = []
    for m in veri["mufredatlar"]:
        for sv in m["seviyeler"]:
            for b in sv["bolumler"]:
                if b.get(f"durum_{dil}") == "yazildi":
                    kalemler.append((b["tarih"], m, b))
    kalemler.sort(key=lambda k: (k[0], k[2]["no"]), reverse=True)
    for tarih, m, b in kalemler:
        link = f'{u}{m["kod"]}/{b["slug"]}/'
        d = dt.datetime.combine(dt.date.fromisoformat(tarih), dt.time(9, 0),
                                tzinfo=dt.timezone(dt.timedelta(hours=3)))
        p.append("<item>")
        p.append(f'<title>{html.escape(bolum_alan(b, "baslik", dil))}</title>')
        p.append(f"<link>{link}</link><guid isPermaLink=\"true\">{link}</guid>")
        p.append(f'<pubDate>{d.strftime("%a, %d %b %Y %H:%M:%S %z")}</pubDate>')
        p.append(f'<description>{html.escape(b.get(f"ozet_{dil}", ""))}</description>')
        p.append("</item>")
    p.append("</channel></rss>")
    hedef = KOK / onek.rstrip("/") if onek else KOK
    (hedef / "rss.xml").write_text("\n".join(p), encoding="utf-8")


def okul_sayfasi(veri, dil, onek):
    site, t = veri["site"], S[dil]
    # Ana sayfa kökte duruyor, o yüzden tema yanı başında. Bu satır EN'in
    # `en/` altında olduğu zamandan kalmıştı ve site kökte yayına geçince
    # bütün stil dosyalarını bir üst dizinde aramaya başladı.
    yukari = ""
    kanonik = f'{site["url"]}{onek}'
    karsi = kanonik
    aciklama = metin(site["aciklama"], dil)

    ilk = veri["mufredatlar"][0]
    kirinti = [("", "vibecodedslopware")]

    p = [kafa(veri, "vibecodedslopware", aciklama, kanonik, yukari, dil, karsi),
         navbar(veri, yukari, dil, karsi),
         gezinti(yukari, dil, kirinti,
                 None, (f'{yukari}{ilk["kod"]}/', ilk["ad"]), kisayol=True, karsi_url=karsi),
         '<div class="kitap tek">',
         GOVDE_AC,
         '  <section id="okul">',
         "<h1>vibecodedslopware</h1>",
         f'<div class="description yazi-ozet">{kac(aciklama)}</div>',
         '<div class="dersler">']

    for m in veri["mufredatlar"]:
        duzlem = [b for sv in m["seviyeler"] for b in sv["bolumler"]]
        yazilan = sum(1 for b in duzlem if b.get(f"durum_{dil}") == "yazildi")
        if m["durum"] == "yakinda":
            sag = f'<span class="ders-sayi">{t["yakinda"]}</span>'
        else:
            sag = (f'<span class="ders-sayi">{len(duzlem)} {t["bolumler"]} &#183; '
                   f'{yazilan} {t["yayinda"]}{siradaki_satir(m, dil, kisa=True)}</span>')
        p.append(f"""  <div class="ders">
    <a class="ders-ad" href="{yukari}{m["kod"]}/">{kac(m["ad"])}</a>{sag}
    <p class="ders-ozet">{kac(metin(m["ozet"], dil))}</p>
  </div>""")

    p.append("</div>\n</section>")
    p.append(GOVDE_KAPA)
    p.append("</div>")
    p.append(gezinti(yukari, dil, kirinti, None, (f'{yukari}{ilk["kod"]}/', ilk["ad"])))
    p.append(ayak(yukari, dil))

    hedef = KOK / onek.rstrip("/") if onek else KOK
    hedef.mkdir(parents=True, exist_ok=True)
    (hedef / "index.html").write_text("\n".join(p), encoding="utf-8")


def arama_sayfasi(veri, dil, onek):
    site, t = veri["site"], S[dil]
    yukari = "../"
    kanonik = f'{site["url"]}{onek}ara/'
    karsi = kanonik
    kirinti = [("", t["arama"])]

    p = [kafa(veri, t["arama"], t["arama_ipucu"], kanonik, yukari, dil, karsi,
              indeksle=False),
         navbar(veri, yukari, dil, karsi),
         gezinti(yukari, dil, kirinti, kisayol=True, karsi_url=karsi),
         '<div class="kitap tek">',
         GOVDE_AC,
         f'  <h1 id="arama-basligi">{t["arama"]}</h1>',
         "  <noscript>\n  <div class=\"admonition warning\">"
         f"<p>{t['js_yok']}</p></div>\n  </noscript>",
         f'  <p>{t["arama_ipucu"]}</p>',
         f"""  <form class="arama" action="" method="get" role="search">
    <input type="text" name="q" aria-labelledby="arama-basligi" value=""
           autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
    <input type="submit" value="{t["ara"]}" />
  </form>
  <p class="arama-durum" id="arama-durum"></p>
  <div id="arama-sonuc"></div>""",
         GOVDE_KAPA,
         '</div>',
         gezinti(yukari, dil, kirinti),
         ayak(yukari, dil,
              ekstra=f'\n<script src="{yukari}tema/ara.js"></script>')]

    hedef = (KOK / onek.rstrip("/") / "ara") if onek else (KOK / "ara")
    hedef.mkdir(parents=True, exist_ok=True)
    (hedef / "index.html").write_text("\n".join(p), encoding="utf-8")


def arama_indeksi(indeks, dil):
    """Sphinx'in searchindex.js'i gibi: gövdesi alınmış kelime -> sayfa listesi."""
    sayfalar, kelimeler = [], {}
    for n, s in enumerate(indeks):
        sayfalar.append({"u": s["u"], "b": s["b"], "o": s["o"], "n": s["n"],
                         "p": " ".join(s["g"].split()),
                         "h": s["h"]})
        agirlik = {}
        for alan, kat in ((s["b"], 8), (s["o"], 4),
                          (" ".join(h["b"] for h in s["h"]), 3), (s["g"], 1)):
            for g in belirtecle(alan, dil):
                agirlik[g] = agirlik.get(g, 0) + kat
        for g, a in agirlik.items():
            kelimeler.setdefault(g, []).append([n, a])
    (KOK / f"arama-{dil}.json").write_text(
        json.dumps({"dil": dil, "sayfalar": sayfalar, "kelimeler": kelimeler},
                   ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8")


def stem_js_yaz():
    """Gövde sözlüğü tek yerde dursun: Python'daki ekler JS'e buradan geçiyor."""
    js = f"""// ÜRETİLMİŞ DOSYA — kur.py yazıyor, elle düzenleme.
// Aramanın indeksi Python'da, sorgusu burada gövdeleniyor. İkisi ayrı düşmesin
// diye ek sözlüğü ve eşik kur.py'den basılıyor; algoritma da birebir aynı.
window.EKLER = {json.dumps(EKLER, ensure_ascii=False)};
window.YUMUSAMA = {json.dumps(YUMUSAMA, ensure_ascii=False)};
window.EN_AZ = {EN_AZ};

window.govde = function (kelime, dil) {{
  var k = kelime.replace(/I/g, "ı").replace(/İ/g, "i").toLowerCase();
  k = k.replace(/[^0-9a-zçğıöşü]/g, "");
  var ekler = window.EKLER[dil] || [];
  for (;;) {{
    var son = k.charAt(k.length - 1);
    if (dil === "tr" && k && window.YUMUSAMA[son]) {{
      k = k.slice(0, -1) + window.YUMUSAMA[son];
      continue;
    }}
    if (k.length <= window.EN_AZ) return k;
    var kesildi = false;
    for (var i = 0; i < ekler.length; i++) {{
      var ek = ekler[i];
      if (k.length - ek.length >= window.EN_AZ &&
          k.slice(k.length - ek.length) === ek) {{
        k = k.slice(0, k.length - ek.length);
        kesildi = true;
        break;
      }}
    }}
    if (!kesildi) return k;
  }}
}};

window.belirtecle = function (s, dil) {{
  var parcalar = s.match(/[0-9a-zA-ZçğıöşüÇĞİÖŞÜ]+/g) || [], cikti = [];
  for (var i = 0; i < parcalar.length; i++) {{
    var g = window.govde(parcalar[i], dil);
    if (g.length >= 2) cikti.push(g);
  }}
  return cikti;
}};
"""
    (KOK / "tema" / "stem.js").write_text(js, encoding="utf-8")


def dort_yuz_dort(veri):
    """GitHub Pages kökteki 404.html'i her kayıp yol için verir. Yollar köke
    göre mutlak, çünkü sayfa hangi derinlikte istendiği bilinmiyor."""
    site = veri["site"]
    kok = "/" + site["url"].split("/", 3)[3]  # https://host/repo/ -> /repo/
    dil = DILLER[0]
    t = S[dil]
    p = [kafa(veri, "404", t["kayip"], f'{site["url"]}404', kok, dil,
              site["url"], indeksle=False),
         navbar(veri, kok, dil, site["url"]),
         gezinti(kok, dil, [("", "404")]),
         '<div class="kitap tek">',
         GOVDE_AC,
         '  <section id="kayip">',
         '<h1>404<a class="headerlink" href="#kayip">¶</a></h1>',
         f'<p>{t["kayip"]}</p>',
         f'<p><a href="{kok}">{t["ev"]}</a> &#183; <a href="{kok}slopware/">slopware</a>'
         f' &#183; <a href="{kok}kitap/">{t["kitap"]}</a>'
         f' &#183; <a href="{kok}ara/">{t["ara"]}</a></p>',
         "</section>", GOVDE_KAPA, "</div>",
         gezinti(kok, dil, [("", "404")]), ayak(kok, dil)]
    (KOK / "404.html").write_text("\n".join(p), encoding="utf-8")


def eski_en_yonlendir(veri):
    """EN köke taşındı. Eski /en/... adresleri hâlâ paylaşılmış linklerde
    duruyor, o yüzden her biri için köke atan bir sayfa bırakılır."""
    site = veri["site"]
    kok = "/" + site["url"].split("/", 3)[3]
    yollar = ["", "ara/", "kitap/"]
    for m in veri["mufredatlar"]:
        yollar.append(f'{m["kod"]}/')
        for sv in m["seviyeler"]:
            for b in sv["bolumler"]:
                yollar.append(f'{m["kod"]}/{b["slug"]}/')
    for yol in yollar:
        hedef = f"{kok}{yol}"
        klasor = KOK / "en" / yol if yol else KOK / "en"
        klasor.mkdir(parents=True, exist_ok=True)
        (klasor / "index.html").write_text(
            f'<!DOCTYPE html>\n<html lang="{DILLER[0]}"><head><meta charset="utf-8">'
            f'<meta http-equiv="refresh" content="0; url={hedef}">'
            f'<link rel="canonical" href="{site["url"]}{yol}">'
            f'<meta name="robots" content="noindex"><title>moved</title></head>'
            f'<body><p>This page moved to <a href="{hedef}">{site["url"]}{yol}</a>.</p>'
            f'<script>location.replace("{hedef}");</script></body></html>\n',
            encoding="utf-8")


def site_haritasi(veri):
    u = veri["site"]["url"]
    p = ['<?xml version="1.0" encoding="UTF-8"?>',
         '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for dil, onek in (("tr", ""), ("en", "en/")):
        p.append(f"<url><loc>{u}{onek}</loc></url>")
        for m in veri["mufredatlar"]:
            p.append(f'<url><loc>{u}{onek}{m["kod"]}/</loc></url>')
            for sv in m["seviyeler"]:
                for b in sv["bolumler"]:
                    if b.get(f"durum_{dil}") == "yazildi":
                        p.append(f'<url><loc>{u}{onek}{m["kod"]}/{b["slug"]}/</loc></url>')
    p.append("</urlset>")
    (KOK / "sitemap.xml").write_text("\n".join(p), encoding="utf-8")


if __name__ == "__main__":
    kur()
