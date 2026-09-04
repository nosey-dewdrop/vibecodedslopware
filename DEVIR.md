# DEVİR — vibecodedslopware
4 Eylül 2026 · bir sonraki oturum bunu okuyup kaldığı yerden devam eder

Repo: `~/damla_projects_2026/vibecodedslopware` · dal `main` · son commit `17e5368`
(push'lu, ağaç temiz). Canlı: https://nosey-dewdrop.github.io/vibecodedslopware/

---

## 0. ÖNCE BUNU OKU — nasıl çalışılacak

Bu oturumda Damla'nın en çok yakındığı şey şuydu: **aynı hatayı ona iki kere
söyletmek.** Onun cümlesi:

> "sana bu aptal şeyleri tek tek ben söylemek istemiyorum ... bu saçmalıkların
> her birini ben mi uyarıcam seni"

Sebep tespit edildi: yazdığım şeye bakmıyordum. `curl` 200 dönüyor diye "oldu"
diyordum. Bunun için üç kapı kuruldu. **Her push'tan önce üçü de koşar.**

    python3 kontrol.py      Damla'nın 46 cümlesi, kurulmuş siteye uygulanır
    olcum.js                sayfa gerçek Chrome'da koşar: tik, seçim, yerleşim
    ekran görüntüsü         kendi gözünle bak, sonra push et

Bir madde kırmızıysa **push yok**. Bu bir öneri değil, bu oturumun kuralı.

### Ölçüm nasıl koşturulur

    # sunucu
    python3 -m http.server 8901 --directory ~/damla_projects_2026/vibecodedslopware &

    # kapı
    python3 kontrol.py

    # çalışan sayfa (cdp.js scratchpad'de, aşağıda anlatıldı)
    CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    "$CH" --headless=new --disable-gpu --remote-debugging-port=9222 \
      --user-data-dir=/tmp/prof --window-size=1680,1050 \
      "http://localhost:8901/slopware/localhost/" &
    node cdp.js 9222 olcum.js

    # görüntü
    "$CH" --headless=new --disable-gpu --hide-scrollbars --window-size=1680,1050 \
      --screenshot=/tmp/bak.png --virtual-time-budget=4000 \
      "http://localhost:8901/slopware/localhost/"

`cdp.js` Chrome DevTools Protocol'e bağımlılıksız bağlanan küçük bir köprü.
Bu oturumun scratchpad'inde kaldı; yeni oturum yeniden yazmalı ya da
`~/damla_projects_2026/vibecodedslopware/` altına taşınmalı. **Taşınması
önerilir** — ölçüm aracı repoda dursun.

### Bilinen tuzaklar

- `python3 kur.py` Chrome ile PDF üretmeye çalışıyor ve **90 saniye takılıyor**.
  Kaçınmak için: `PATH=/usr/bin:/bin python3 kur.py`. Eldeki PDF bozulmaz.
- Headless Chrome **localStorage'ı kalıcı yazmıyor**. Tema/isim testi için
  sayfa açıkken JS ile uygula, profil dosyasına güvenme.
- Chrome profili kilitli kalabiliyor: `rm -f <profil>/SingletonLock`.

---

## 1. NE YAPILDI

### Kabuk
- Gece teması portfolyonun `pal-a` paletiyle (`#171221 #efe8f7 #ff8fb3 #c9a6ff`),
  yıldız alanı, tema düğmesi, FOUC'suz ilk boyama.
- Navbar üç grup: sol kitaplar, **orta** `[book] [pdf] [forum]`, sağ mail/dil/
  tema/giriş/arama. Orta grup ölçüldü: ekran merkezi 840px, grup merkezi 840px.
- Her öğe köşeli parantez içinde. Yıldız yok. Yakında olanlar tıklanmaz,
  hover'da söyler.
- Izgara: liste 20 / yazı 50 / kenar notu 17, kenar payı 3rem. **Tek tanım**
  (bir zamanlar dokuz rakip tanım vardı).
- prev/next köşeli parantezli iki buton, bölüm adı etiketin altında.

### Okuma
- Sol kolonda 55 bölüm, kendi scroll'u, okunmuşun üstü çizili, ilerleme çubuğu.
- `print("hello ___")` selamlaması sol kolonun tepesinde kalıcı.
- Metin seçince highlight / strike / note. Kayıt paragraf indeksi + karakter
  aralığı (ofset değil: yazı yeniden kurulunca kaymasın).
- İsim sorusu artık **okumaya başladıktan sonra**: sadece bölüm sayfasında,
  400px kaydırınca, bir kez.

### İki dil
- EN kökte, TR `tr/` altında. TR ağacındaki 103 bağlantının hepsi TR'de kalıyor
  (bu oturumdan önce **hiçbiri** kalmıyordu; Türkçe site tek yönlü çıkmazdı).
- hreflang yalnızca karşı dilde gerçekten var olan sayfaya basılır.

### SEO
- `/soru/<slug>/` — yazıların `## ` alt başlıklarından, 120 kelime eşiğiyle.
  Şu an 15 EN + 1 TR. 55 yazı bitince ~240 olur, kod değişmez.
- `/kontrol/<slug>/` — bölümlerin `::kontrol` bloklarından. Şu an 5 EN + 1 TR.
- FAQPage JSON-LD, iki dilli sitemap, hreflang çiftleri.

### Temizlik
- `pyramid.css` (yazbel teması) hiçbir sayfa tarafından yüklenmiyor.
- `pygments.css` yeniden yazıldı: 24 renk + 18 bold → 5 renk, sıfır bold.
- Boş bölüm sayfası, bölümsüz müfredat sayfası kurulmuyor.
- Kullanıcının gördüğü hiçbir metinde em dash yok.

---

## 2. AÇIK İŞLER — sıralı

### A · Damla'dan bekleyen iki hesap  (kod hazır, tek satır json)

`mufredat.json` içinde:

    site.bulten.kod     BOŞ   mail listesi (buttondown kullanıcı adı ya da
                              formun tam POST adresi)
    site.gorus.adres    BOŞ   "send to damla" + forum soru kutusu
                              (Formspree gibi tek uçlu bir adres)

`site.kahve` dolu: `damlahelloworld` — buy me a coffee butonu canlı.

**Bunlar boşken:**
- `[join the mail list!]` düğmesi bir dialog açıyor, dialog "coming soon" diyor.
  Ajan bunu **yalan** saydı: düğme eylem vaat ediyor, tıklayınca çalışmadığını
  söylüyor. `[log in]` ve yakında olan kitaplar bunu doğru yapıyor — **tıklamadan
  önce**, hover'da söylüyorlar.
- "send to damla" daha kötü: okur not yazıyor, basıyor, düğme 1.6 saniye "soon"
  deyip eski haline dönüyor. Not hiçbir yere gitmiyor, kalıcı bir iz de yok.
  `kur.py`'nin kendi yorumu doğru ilkeyi yazıyor ("gitmeyen bir gönder düğmesi,
  düğmesizlikten kötüdür") ve forum formu buna uyuyor; not düğmesi uymuyor.

**Yapılacak:** Damla adresleri verene kadar bu iki düğme de `[log in]` gibi
davranmalı: tıklanmaz, hover'da söyler. Verince tek satır json ile açılır.

### B · `soru/` ve `kontrol/` okura görünmüyor  (23 sayfa)

Hiçbir okur sayfası bunlara link vermiyor. Sadece `sitemap.xml`'de varlar.
`kontrol/index.html` kitabın ana vaadini taşıyor:

> "the work at the end of every chapter. this is not learned by reading,
> it is learned by running."

ve bunu kimse göremiyor. **Yapılacak:** navbar'a ya da bölüm sayfasının altına
bir giriş. Damla'ya nereye koyacağı sorulmalı — navbar zaten 11 öğe taşıyor.

### C · `kabuk.js` içinde 9 İngilizce sabit

Türkçe sayfada araç çubuğu Türkçe (`işaretle` / `üstünü çiz` / `not`) ama
eylemler İngilizce. `window.DIL` var, kullanılmıyor.

    tema/kabuk.js:434  "sent to damla" / "send to damla"
    tema/kabuk.js:439  "delete"
    tema/kabuk.js:466  "soon"
    tema/kabuk.js:471  "sending…"
    tema/kabuk.js:473  "did not go, try again"
    tema/kabuk.js:401  "highlight a sentence and pick note to write one."
    tema/kabuk.js:518  "done"

**Yapılacak:** `kur.py` bu dizeleri `S[dil]`'den `window` üstüne bassın,
`kabuk.js` oradan okusun. `stem.js`'te aynı desen zaten var (`window.EKLER`).

### D · Beş başlık soru formunda ama `?` yok  (Damla'nın kanunu)

`mufredat.json` içinde:

    07  baslik_en: where your data actually lives
    08  baslik_en: what a secret is
    14  baslik_en: what npm install actually downloads
    15  baslik_en: what the build step does
    36  baslik_en: when someone else calls you: webhooks

Ayrıca `03`'ün Türkçe başlığı hâlâ İngilizce: `guys, I am on localhost`.

**Yapılacak:** başlıklar Damla'nın. Ona sorulmadan değiştirilmez. Ona
sorulacak liste bu. Bir sonraki oturum bunu bir kere sorsun ve düzeltsin.

### E · "coming soon" üç ayrı kelimeyle

    navbar hover        "coming soon"
    forum boş hali      "the question box is coming soon."
    send to damla       "soon"

Tek bir durum, üç ayrı ifade. **Yapılacak:** `S[dil]` içinde tek anahtar.

### F · Ölü dosyalar  (~62 KB)

    tema/pyramid.css   19.8 KB   hiçbir sayfa yüklemiyor
    tema/basic.css     15.0 KB   hiçbir sayfa yüklemiyor
    style.css          20.3 KB   hiçbir sayfa yüklemiyor (rabadon'dan kalma)
    effects.js          7.3 KB   hiçbir sayfa yüklemiyor

`basic.css` içinde 11, `style.css` içinde 5 `font-weight: bold` var. Kimse
yüklemiyor ama biri yanlışlıkla linklerse kanun tek hamlede çiğnenir.

**Yapılacak:** Damla'ya sorulup silinmeli. Bu oturumda dokunulmadı.

### G · Boş forum okurun karşısına çıkan bir duvar

Ajanın sözü: *"Bitmemiş yazılım hakkındaki bir sitenin navbar'ında 'yakında'
yazması kendi kendine açılmış bir yara."* Forum navbar'da `[book]` ile aynı
ağırlıkta ve içi boş.

**Yapılacak (Damla'nın kararı):** ya forumu 5 gerçek soru-cevapla doldur, ya
da açılana kadar navbar'dan çıkar.

### H · Küçük ve ölçülmüş

- `soru/` sayfalarının FAQPage JSON-LD'sinde `acceptedAnswer` cümle ortasında
  kesiliyor (virgülle bitiyor). Google bunu snippet olarak gösterir.
- `og:type` ana sayfada `article`, oysa orası bir dizin.
- Favicon `fill='white'` sabit, gece temasında uyum sağlamıyor.
- `.rabadon/`, `__pycache__/` git'te izleniyor ve her koşuda gürültü üretiyor.
- Ayak satırındaki `? the list` — `?` burada tuş adı ama Damla'nın kanununda
  `?` cümle sonuna gelir. İki `·` arasında noktalama gibi okunuyor.

---

## 3. DOKUNULMAYACAKLAR

- **`yazilar/` altındaki metinler Damla'nın.** Sadece onun açıkça istediği
  bir paragraf silindi ("I have models write code for me..."). Başka hiçbir
  cümleye dokunulmadı ve dokunulmamalı.
- **`mufredat.json`'daki başlıklar Damla'nın.** `?` eksikleri ona sorulur.
- **`_arsiv/`** — silinmedi, taşındı. İçinde eski müfredat ve araştırma var.
- **İçerik uydurulmaz.** SEO sayfaları Damla'nın yazdığı metinden çıkıyor;
  120 kelimeden kısa bir kalem için sayfa basılmıyor. Bu kural gevşetilmemeli:
  1000 ince sayfa, 50 iyi sayfadan kötüdür.

---

## 4. ORKESTRASYON — bir sonraki oturum nasıl kursun

Bu oturumda **tek ajanla çalışmak hata üretti**: bağlam şişti, iki kere
"düzelttim" dediğim şey düzelmemişti (navbar gökkuşağı ve ızgara çokluğu).
Tarafsız ajanlar bunu yakaladı. Önerilen bölüşüm:

| ajan | işi | girdi |
|---|---|---|
| **kapıcı** | `kontrol.py` + `olcum.js` koşar, kırmızıysa push'u durdurur | repo |
| **tasarımcı** | ekran görüntülerine bakar, Damla'nın kanunuyla karşılaştırır | görüntü + `TALIMAT.md` + portfolyo hafızası |
| **okur** | siteyi ilk kez gören insan gibi okur, akışa bakar | sadece görüntü |
| **editör** | arayüz metinleri, boş haller, dil sızıntısı | kurulmuş HTML |

**Kural:** ajan kendi yaptığı işi denetlemez. Tasarımı yazan, tasarımı
denetleyemez — bu oturumda ikisini de ben yaptım ve iki kez yanıldım.

Ajanlara verilecek değişmez bağlam:
- `TALIMAT.md` — Damla'nın 46 cümlesi, birebir
- `~/.claude/CLAUDE.md` — kök kurallar (`?` kanunu, wrapper testi, oyalama yasağı)
- `~/.claude/projects/-Users-damummyphus/memory/project_damla_portfolio.md`
  — tasarım kırmızı çizgileri (bold yok, köşe 0-3px, renk anlam taşır)

---

## 5. DURUM ÖLÇÜMÜ  (4 Eylül 2026, ölçülmüş)

    kontrol.py            46/46 geçti
    olcum.js masaüstü     TEMIZ
    olcum.js telefon      TEMIZ (390px, yatay taşma yok)
    kırık link            0  (43 sayfa, 56 benzersiz bağlantı tarandı)
    kurulan sayfa         44
    sitemap URL           46
    yazı                  6 EN, 2 TR   (55 bölümlük müfredatın)
    soru sayfası          15 EN, 1 TR
    kontrol sayfası       5 EN, 1 TR
    gece teması kontrast  gövde 14.2 · navbar 6.3 · kod 15.3  (eşik 4.5)

Sayaç doğrulandı: tik atınca `0 / 54 passed 0%` → `1 / 54 passed 2%`.
Payda 54, çünkü önsözün işaretlenecek bir işi yok (55 bölüm, 1 önsöz).
