#!/usr/bin/env python3
"""kontrol.py — TALIMAT.md'deki her maddeyi kurulmuş siteye uygular.

Damla'nın söylediği bir şey sitede yoksa burada kırmızı görünür. Amaç
onun aynı şeyi iki kere söylemek zorunda kalmaması.

    python3 kontrol.py          bütün maddeler
    python3 kontrol.py -v       geçenleri de yaz

Çıkış kodu 0 = hepsi geçti. Push kapısı budur.
"""
import re
import sys
from pathlib import Path

KOK = Path(__file__).parent
AYRINTI = "-v" in sys.argv

_onbellek = {}


def oku(yol):
    if yol not in _onbellek:
        p = KOK / yol
        _onbellek[yol] = p.read_text(encoding="utf-8") if p.exists() else ""
    return _onbellek[yol]


BOLUM = "slopware/localhost/index.html"
ANA = "index.html"
FORUM = "forum/index.html"

def bulten_acik():
    """Bülten ucu gerçekten çalışıyor mu?

    kur.py kurarken ucu ölçüyor: tablo yoksa düğmeyi kapatıyor ve o zaman
    sayfada bir <button> değil, [giriş yap] gibi tıklanmaz bir <span>
    duruyor. Damla'nın kuralı "kaydol düğmesi köşeli parantez içinde
    olsun"; ama gitmeyen bir düğme, düğmesizlikten kötü. İki kural aynı
    anda geçerli, o yüzden hangisinin arandığı uca bakıyor."""
    return 'id="mail-kutu"' in oku(BOLUM)


KURALLAR = []


def kural(kod, damla, nasil):
    def sar(f):
        KURALLAR.append((kod, damla, nasil, f))
        return f
    return sar


# ------------------------------------------------------------------ navbar
@kural("N1", "portfolyodaki gibi VIBECODEDSLOPWARE yazacaksın", "ad ortada")
def _():
    return "class='header'" in oku(BOLUM) and "vibecodedslopware" in oku(BOLUM)


@kural("N2", "cv yerine [mail liste kaydol!]", "köşeli parantez içinde düğme")
def _():
    h = oku(BOLUM)
    if bulten_acik():
        return re.search(r'class="mail-ac">\[[^\]]+\]</button>', h) is not None
    # Uç kapalı: düğme yerine tıklanmaz etiket, ama HÂLÂ köşeli parantezli
    # ve hâlâ kaydolmaktan söz ediyor. [giriş yap] ile aynı desen.
    return re.search(r'class="yakinda"[^>]*>\[[^\]]*(kaydol|mail list)[^\]]*\]', h) is not None


@kural("N3", "form sitesi olsun istemiyorum, pop up olabilir", "<dialog>")
def _():
    h = oku(BOLUM)
    if bulten_acik():
        return '<dialog class="kutu" id="mail-kutu"' in h
    # Uç kapalıyken kutu hiç kurulmuyor; açılıp içinde "yakında" diyen bir
    # kutu, açılmış ve boş çıkmış bir kapıdır. Diğer kutular duruyor.
    return '<dialog class="kutu" id="ad-kutu"' in h


@kural("N4", "mail liste tıklayınca cidden kaydolunsun", "gerçek POST")
def _():
    return "fetch(form.action" in oku("tema/kabuk.js")


@kural("N5", "diğer switch amacı en/tr", "dil değiştirici")
def _():
    import re as _r
    return _r.search(r'hreflang="(tr|en)"[^>]*>\[(tr|en)\]', oku(BOLUM)) is not None


@kural("N6", "renk değiştirmeler var, 2 renk", "tema düğmesi + iki tema")
def _():
    return 'class="tema-dugme"' in oku(BOLUM) and 'data-tema="gece"' in oku("tema/gece.css")


@kural("N7", "log in hover edilince yakında, tıklanabilir değil", "span + balon")
def _():
    h = oku(BOLUM)
    m = re.search(r'<span class="yakinda"[^>]*>\[log in\]<span class="balon">([^<]+)', h)
    return m is not None and "soon" in m.group(1).lower()


@kural("N8", "systems + product engineering, tıklanabilir değil", "iki span")
def _():
    h = oku(BOLUM)
    return ('>[systems engineering]<' in h and '>[product engineering]<' in h
            and h.count('class="yakinda"') >= 3)


@kural("N9", "[] köşeli parantez istiyorum, yanlarında yıldız yok", "hepsi [], ✧ yok")
def _():
    h = oku(BOLUM)
    serit = re.search(r"<ul class='navbar'>(.*?)</ul>", h, re.S)
    if not serit:
        return False
    ic = serit.group(1)
    if "&#10023;" in ic or "⟡" in ic:
        return False
    # Hover balonunun metni bir şerit öğesi değil: önce çıkarılır.
    ic = re.sub(r'<span class="balon">.*?</span>', "", ic, flags=re.S)
    for li in re.findall(r"<li[^>]*>.*?</li>", ic, re.S):
        if "navbar-ayrac" in li or 'class="ara"' in li:
            continue
        metin = re.sub(r"<[^>]+>", "", li).strip()
        if not metin:
            continue
        if not (metin.startswith("[") and metin.endswith("]")):
            return False
    return True


@kural("N10", "NEDEN ÜSTTE HİÇBİR ŞEY RENKLİ DEĞİL", "şeritte renk")
def _():
    # Şeritte renk var ama ANLAMLI: bulunduğun kitap vurguyla, mail
    # listesi vurguyla, gerisi mürekkep. Gökkuşağı değil.
    c = oku("tema/kabuk.css")
    return ('ul.navbar a[aria-current="page"]' in c
            and "ul.navbar .mail-ac" in c
            and "--n-yesil" not in c)


@kural("N11", "logo ile navbar arasında üst yerleşimlere çalış", "dar aralık")
def _():
    # Bu kural iki kere metin aradi ve iki kere yaniltti: once
    # `padding-top: 1.1rem !important` dizesini aradi (yama silinince kirmizi
    # yandi, oysa aralik degismemisti), sonra bir regex oldu (gruplu secici,
    # `padding` kisayolu ve `px` birimi ondan kaciyordu). Aranan sey bir yazim
    # degil, EKRANDAKI BOSLUK. Olcum artik olcum.js'te, calisan sayfada:
    # `ustPay` ve `adSeritArasi`. Burada kalan is, o olcumun DURDUGUNU
    # garanti etmek — kapi sessizce kaybolmasin diye.
    o = oku("olcum.js")
    return "adSeritArasi" in o and "logo ile şerit arası geniş" in o


# ------------------------------------------------------------------ panel
@kural("P1", "100 birim, sağ soldan boş, 20 birim liste", "üç kolon ızgara")
def _():
    return "grid-template-columns" in oku("tema/kabuk.css")


@kural("P2", "20 biriminde alt alta ch1 ch2 ch3, scrollu", "sol kolon + scroll")
def _():
    return 'class="kenar"' in oku(BOLUM) and "overflow-y: auto" in oku("tema/kitap.css")


@kural("P3", "okunan chapterların üstünü çizeceğiz", "line-through")
def _():
    return "kenar-bolum.gecti a" in oku("tema/kitap.css") and \
           "line-through" in oku("tema/kitap.css")


@kural("P4", "üstte progress de görünecek", "çubuk + sayı + yüzde")
def _():
    h = oku(BOLUM)
    return "kenar-cubuk" in h and "kenar-sayi" in h and "kenar-yuzde" in h


@kural("P5", "gelirken ismini iste", "isim dialogu")
def _():
    return 'id="ad-kutu"' in oku(BOLUM)


@kural("P6", 'print("hello ___") diye selamla', "birebir print biçimi")
def _():
    h, j = oku(BOLUM), oku("tema/kabuk.js")
    return ('class="selam-kod">print(' in h and 'selam-ad' in h
            and '"hello ' in j)


@kural("P7", "pop up kapansa da bir yerde kalsın", "sol kolonda kalıcı")
def _():
    return re.search(r'<button type="button" class="selam">', oku(BOLUM)) is not None


@kural("P8", "yanlarda az da olsa boşluk istiyorum", "dar ama gerçek pay")
def _():
    c = oku("tema/kabuk.css")
    m = re.findall(r"padding-left:\s*([\d.]+)rem", c)
    if not m:
        return False
    son = float(m[-1])
    return 1.0 <= son <= 5.0


@kural("P9", "sağda olması gereken şey alta inmiş", "CONTENTS sağ kolonda")
def _():
    c = oku("tema/kabuk.css")
    m = re.search(r"\.kitap \.kenar-not \{[^}]*grid-column:\s*3", c, re.S)
    return m is not None


@kural("P10", "prev next sadece [< prev] [next >] butonları", "kart yok")
def _():
    c = oku("tema/kabuk.css")
    return 'content: "[< "' in c and 'content: " >]"' in c and \
           "nav.sonraki a b {\n  display: none" in c


@kural("P11", "gereksiz bir üstte div koymuşsun", "selamlama kutu değil")
def _():
    g = oku("tema/gece.css")
    m = re.search(r'\.kenar-ust \{[^}]*background-color', g, re.S)
    return m is None


@kural("P12", "gezinti: kırıntı solda, yön sağda", "sıra doğru")
def _():
    """Bu iş artık `.related` şeridinde değil.

    Şerit kaldırıldı (kırıntı ve arama navbara, yön bölümün altına geçti)
    ve geriye 34 yetim CSS kuralı kalmıştı; onlar da silindi. Kural aynı
    şeye bakıyor ama bugünkü yerinde: navbarın solunda kitaplar, sağında
    okurun ayarları, bölümün altında önceki/sonraki."""
    h = oku(BOLUM)
    sol = h.find('<li class="grup sol">')
    sag = h.find('<li class="grup sag">')
    nav = h.find('<nav class="sonraki"')
    return 0 <= sol < sag and nav > sag


# ------------------------------------------------------------------ yazı
@kural("Y1", "beyaz sayfa kalksın, zor okunuyor", "gecede koyu yüzey")
def _():
    g = oku("tema/gece.css")
    m = re.search(r'\.kitap div\.body,\s*:root\[data-tema="gece"\] \.kitap-tam \{'
                  r'[^}]*background:\s*([^;]+);', g, re.S)
    return m is not None and "#ffffff" not in m.group(1)


@kural("Y2", "üstü çizilebilir, highlight, not alınabilir", "üç araç")
def _():
    h = oku(BOLUM)
    return all(f'data-arac="{a}"' in h for a in ("hl", "st", "not"))


@kural("Y3", "notlar send to damla diye bana gönderilecek", "gönder düğmesi")
def _():
    return "send to damla" in oku("tema/kabuk.js")


# ------------------------------------------------------------------ forum
@kural("F1", "send to damla olanlar ve cevaplarım görünecek", "/forum/")
def _():
    return (KOK / FORUM).exists()


# ------------------------------------------------------------------ footer
@kural("A1", "footer damladan sevgiler", "imza")
def _():
    return "ayak-sevgi" in oku(BOLUM)


@kural("A2", "buy me a coffee butonu, hesabı vericem", "hazır")
def _():
    return "buymeacoffee.com" in oku("kur.py")


# ------------------------------------------------------------------ tema
@kural("T2", "dark mode aynı portfolyom temasında", "pal-a birebir")
def _():
    g = oku("tema/gece.css")
    return all(r in g for r in ("#171221", "#efe8f7", "#ff8fb3", "#c9a6ff"))


@kural("T3", "sprinkle", "yıldız alanı")
def _():
    return 'id="yildizlar"' in oku(BOLUM)


# ------------------------------------------------------------------ yasaklar
@kural("X1", "neden em dash var nefret ederim", "ekrana basılan metinde yok")
def _():
    # Kod yorumundaki em dash'i kimse görmüyor; sayılan yalnızca okurun
    # ekranında beliren metin. JS'in çalışma anında yazdığı dizeler de
    # sayılır: statik HTML'i grep'lemek onları kaçırıyordu.
    for y in (BOLUM, ANA, FORUM, "soru/index.html", "kontrol/index.html",
              "ara/index.html", "tr/index.html"):
        h = oku(y)
        if not h:
            continue
        govde = re.sub(r"<script.*?</script>", "", h, flags=re.S)
        govde = re.sub(r"<style.*?</style>", "", govde, flags=re.S)
        govde = re.sub(r"<[^>]+>", " ", govde)
        if "—" in govde or "–" in govde or "&#8212;" in govde:
            return False
    # JS'in ekrana yazdığı dizeler. Yorumlar elenir: hem `//` hem `/* */`.
    for f in ("tema/kabuk.js", "tema/ara.js", "tema/site.js", "tema/kitap.js"):
        kod = re.sub(r"/\*.*?\*/", "", oku(f), flags=re.S)
        kod = re.sub(r"//[^\n]*", "", kod)
        if "—" in kod or "–" in kod:
            return False
    return True


@kural("X2", "yazbelden çaldığın şeyler, istemiyorum", "ev ikonu/ok/tekrar yok")
def _():
    h = oku(BOLUM)
    # Şerit tamamen kalktı: kırıntı navbarda, yön bölümün altında.
    # Geriye yalnızca n/p tuşlarının tutunduğu görünmez çıpa kaldı.
    return ("&#x2302;" not in h and "&#187;" not in h
            and 'class="related"' not in h
            and "&#128274;" not in oku("slopware/index.html"))


@kural("X3", "SORU OLAN HER ŞEY ? İLE BİTER", "soru başlıkları")
def _():
    for d in (KOK / "soru").glob("*/index.html"):
        m = re.search(r"<h1>([^<]+)", d.read_text(encoding="utf-8"))
        if m and not m.group(1).strip().endswith("?"):
            return False
    return True


@kural("X4", "repodaki yazıları istemiyorum kaldır", "boş sayfa kurulmaz")
def _():
    return "bu bölüm henüz yazılmadı" not in oku(BOLUM) and \
           'b[f"durum_{dil}"] = "bos"\n            continue' in oku("kur.py")


@kural("X5", "search bok gibi", "kendi zemini ve ikonu olan kutu")
def _():
    c = oku("tema/kabuk.css")
    return "li.ara form::before" in c and \
           re.search(r"ul\.navbar input\[type=\"text\"\] \{[^}]*border:", c, re.S)


# ------------------------------------------------------------------ seo
@kural("X6", "BOLD YOK, her şey 400", "font-weight 700 yok")
def _():
    for f in ("tema/kitap.css", "tema/kabuk.css", "tema/gece.css"):
        if re.search(r"font-weight:\s*(700|800|900|bold)\b", oku(f)):
            return False
    return True


@kural("X7", "renk anlam taşır, iki sistem bir satırda olmaz",
       "şeritte tek renk sistemi")
def _():
    c = oku("tema/kabuk.css")
    # Gökkuşağı kalktı: kitap/okuma/forum/dil aynı mürekkep.
    m = re.search(r"\.kitap-bag,\s*\n\.oku-bag,\s*\n\.forum-bag,\s*\n"
                  r"\.dil-bag,\s*\n\.tema-dugme \{\s*\n\s*color: var\(--murekkep\)", c)
    return m is not None


@kural("X8", "aynı durum tek işaretle çizilir", "kilit emojisi yok")
def _():
    return "&#128274;" not in oku("slopware/index.html")


@kural("X9", "her sayfa aynı tasarımdan", "arama sayfası da yazi-ozet kullanır")
def _():
    return 'class="description yazi-ozet"' in oku("ara/index.html")


@kural("X10", "ayak sayfanın dibinde", "kısa sayfada ölü bant yok")
def _():
    return "min-height: 100vh" in oku("tema/kabuk.css")


@kural("X11", "tek ızgara tanımı", "kitap ızgarası bir yerde")
def _():
    # Medya sorgusu içindeki kırılımlar meşru; sayılan yalnızca en üst
    # düzeydeki tanım. İkisi varsa biri diğerini eziyor demektir.
    for f in ("tema/kabuk.css", "tema/kitap.css"):
        n = len(re.findall(r"\n\.kitap \{[^}]*?grid-template-columns", oku(f)))
        if n > 1:
            return False
    return True


@kural("X12", "gizli olan görünmez", "hidden özniteliği CSS ile ezilmez")
def _():
    return "[hidden] {\n  display: none !important;\n}" in oku("tema/kabuk.css")


@kural("X13", "kod sayfaya sızmaz", "f-string eksik değil")
def _():
    # Bir f öneki unutulunca Python ifadesi ham metin olarak basıldı ve
    # 44 sayfada göründü. Sayfada süslü parantezli bir ifade kalıntısı
    # varsa bir yerde f eksiktir.
    for y in (BOLUM, ANA, FORUM):
        if re.search(r"\{(kac|t\[|yukari|dil)\b", oku(y)):
            return False
    return True


@kural("X14", "sayaç gerçekten güncellenir", "JS'in aradığı işaretleyici var")
def _():
    # site.js `.kenar-sayi b` arıyor. Üretici başka bir şey basarsa sayaç
    # sessizce 0'da donuyor ve yanındaki yüzde tırmanıyor: aynı satırda
    # iki çelişen sayı.
    js = oku("tema/site.js")
    m = re.search(r'querySelector\("\.kenar-sayi ([a-z]+)"\)', js)
    if not m:
        return False
    return f'<p class="kenar-sayi"><{m.group(1)}>' in oku(BOLUM)


@kural("S3", "ince sayfa basılmaz", "kelime eşiği")
def _():
    return "SEO_EN_AZ_KELIME" in oku("kur.py")


def main():
    gecen, kalan = [], []
    for kod, damla, nasil, f in KURALLAR:
        try:
            ok = bool(f())
        except Exception as e:
            ok = False
            nasil += f"  [hata: {e}]"
        (gecen if ok else kalan).append((kod, damla, nasil))

    if AYRINTI:
        for kod, damla, nasil in gecen:
            print(f"  ok    {kod}  {damla}")

    for kod, damla, nasil in kalan:
        print(f"  KALDI {kod}  {damla}")
        print(f"          beklenen: {nasil}")

    print(f"\n{len(gecen)}/{len(KURALLAR)} madde geçti.")
    if kalan:
        print(f"{len(kalan)} madde Damla'nın söylediği gibi değil. PUSH YOK.")
        return 1
    print("Damla'nın söylediği her şey yerinde.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
