# DEVİR — vibecodedslopware
4 Eylül 2026, gece · sabah koda inen kişi bunu okur, başka hiçbir şey okumadan

Repo: `~/damla_projects_2026/vibecodedslopware` · dal `main` · son commit `f242949`
(push'lu, ağaç temiz). Canlı: https://nosey-dewdrop.github.io/vibecodedslopware/

---

## 0. NASIL ÇALIŞILACAK — önce bunu oku

Bir önceki devirde şu yazıyordu ve hâlâ geçerli:

> Damla'nın en çok yakındığı şey: **aynı hatayı ona iki kere söyletmek.**
> "sana bu aptal şeyleri tek tek ben söylemek istemiyorum"

Bu oturumda o hata bir kere daha yapıldı ve şöyle yakalandı: **Supabase'e
bağladım dedim, tablolar yoktu.** Kod doğruydu, yapılandırma doluydu, kapı
46/46 geçiyordu. Ama bağımsız bir ajan `curl` attı ve iki uç da 404 döndü.

Alınacak ders tek cümle: **yapılandırmada bir adres olması, o adresin
çalıştığı anlamına gelmiyor.** "Bağladım" demek için ucun yazdığını
görmek gerekiyor.

Bu ders artık koda gömülü — §2'de anlatılıyor.

### Üç kapı, her push'tan önce

    ./bak.sh          kur + kapı + masaüstü ölçüm + dar ekran + 6 görüntü
    python3 kontrol.py        Damla'nın 46 cümlesi, kurulmuş siteye uygulanır
    python3 css-harita.py     hangi CSS kuralı nerede eziliyor (bilgi, kapı değil)

**Kapı kırmızıysa push yok.** Görüntülere GÖZLE bak, sonra push et.
`curl` 200 dönüyor diye bir sayfanın iyi göründüğü sonucu çıkmıyor.

### Ajan kuralı

**Ajan kendi yaptığı işi denetlemez.** Bu oturumda iki kere işe yaradı:
bağımsız denetçi dört gerçek hata buldu (aşağıda §6), dördü de bendendi
ve dördünü de ben "tamam" sanmıştım.

### Bilinen tuzaklar

- `python3 kur.py` PDF üretirken Chrome'a gidiyor ve **90–120 sn takılıyor**.
  Kaçınmak için: `PATH=/usr/bin:/bin python3 kur.py`. Eldeki PDF bozulmaz.
- Headless Chrome **localStorage'ı kalıcı yazmıyor**. Gece teması / isim
  testi için sayfa açıkken JS ile uygula, profil dosyasına güvenme.
- Chrome profili kilitli kalabiliyor: `rm -f <profil>/SingletonLock`, ya da
  `pkill -9 -f "Google Chrome"`.
- Ölçüm alırken **sırayı karıştırma.** Bu oturumda bir kere "önce" ölçümünü
  zaten temizlenmiş CSS ile aldım ve 41 sahte regresyon gördüm. Taban
  ölçümü, değişiklikten ÖNCEKİ dosyalarla alınır.

---

## 1. ELİNDE TEK BİR İŞ VAR — 3 dakika

**Supabase'de iki tablo aç.** Kod hazır ve push'lu. Tablolar olmadığı için
site kendini kapatmış durumda: `[join the mail list!]` ve `[send to damla]`
şu an tıklanmıyor, hover'da "coming soon" diyorlar. Bu doğru davranış,
ama düğmeler kapalı.

1. Aç: https://supabase.com/dashboard/project/xjtmqncfhuidctxgthhv/sql/new
2. Yapıştır: `_kurulum/supabase.sql` (61 satır, iki tablo + RLS)
3. Run
4. `./bak.sh` → kurulum ucu ölçer, tabloyu bulunca düğmeleri **kendiliğinden**
   açar. Elle bir şey değiştirmen gerekmiyor.
5. commit + push

Doğrulamak istersen:

    curl -s -o /dev/null -w "%{http_code}\n" -X POST \
      "https://xjtmqncfhuidctxgthhv.supabase.co/rest/v1/slopware_subscribers" \
      -H "apikey: <mufredat.json içindeki anahtar>" \
      -H "Content-Type: application/json" -d '{"email":"a@b.cc","dil":"en"}'

`404` = tablo yok · `201` = açıldı, çalışıyor · `409` = zaten kayıtlı (yani çalışıyor)

### Anahtar neden public, sakıncası yok mu?

`mufredat.json`'daki anon anahtar 45 sayfaya basılıyor ve public olmak
zorunda. Sakıncası yok **çünkü** tablonun RLS kuralı anon'a YALNIZCA
`insert` veriyor, `select` vermiyor. Anahtar sızsa bile kimse mail
listesini indiremez, gelen notları okuyamaz.

**Bu RLS tabloyla BİRLİKTE kurulur, sonradan değil.** SQL'de zaten var.
Tabloyu RLS'siz açıp sonra eklemek, arada bir pencere bırakır.

### Neden ayrı tablo, neden dewsletter'ınkine yazmıyoruz?

`dewsletter` iş ilanı bülteni, bu kitap bülteni. Farklı insanlar, farklı
mail. Karışırsa iş arayan birine kitap bölümü gider. Aynı Supabase
projesi, ayrı iki tablo: `slopware_subscribers` ve `slopware_gorus`.

---

## 2. BU OTURUMUN ASIL İŞİ — yalan söyleyen arayüz

### Sorun neydi?

`[join the mail list!]` bir dialog açıyordu, dialog "coming soon" diyordu.
Bir önceki oturumun ajanı bunu **yalan** saydı ve haklıydı: düğme eylem
vaat ediyor, tıklayınca çalışmadığını söylüyor. `[log in]` ve yakında
olan kitaplar bunu doğru yapıyor — **tıklamadan ÖNCE**, hover'da söylüyorlar.

"send to damla" daha kötüydü: okur not yazıyor, basıyor, düğme 1.6 saniye
"soon" deyip eski haline dönüyor. Not hiçbir yere gitmiyor.

### İlk çözümüm yetersizdi

Damla'nın Supabase'ini buldum (dewsletter'ın kullandığı proje), iki tablo
tasarladım, `mufredat.json`'a yazdım, kodu bağladım. Kapı 46/46 geçti.
"Bağlandı" dedim.

**Tablolar yoktu.** Denetçi `curl` attı, iki uç da 404. Sonuç: eski
1.6 saniyelik sahte "soon" düğmesi, gerçekten hata veren bir düğmeye
dönüşmüştü. Okur mailini yazıyor, gönderiyor, "gitmedi" cevabı alıyor.
Vaat tıklamadan ÖNCE verilmiş, tıklamadan SONRA bozulmuş — kaçındığımız
yalanın tam kendisi, daha kötü hali.

### Kalıcı çözüm: kurulum ucu ölçüyor

`kur.py` içinde `uc_calisiyor_mu(uc)` (yaklaşık satır 1010):

    True  = tablo var, yazılabiliyor      → düğme basılır
    False = adres var ama tablo yok (404) → düğme HİÇ basılmaz
    None  = ölçemedik (ağ yok, zaman aşımı) → yapılandırmaya güvenilir

`401/403` de `True` sayılır: tablo var, okuma kapalı — zaten istediğimiz bu.

`None` davranışı kasıtlı: internetsiz bir kurulum makinesi (CI, uçak modu)
çalışan bir düğmeyi öldürmesin diye. Ölçüm bir kere yapılır, `UC_OLCUMU`
sözlüğünde saklanır, 44 sayfa için 44 istek atılmaz.

Kapalı haldeki çıktı:

    <span class="yakinda" tabindex="0" role="note" aria-disabled="true">
      [join the mail list!]<span class="balon">coming soon</span></span>

Yani `[log in]` ile **birebir aynı desen**. Kutu (`<dialog id="mail-kutu">`)
hiç kurulmuyor: içi "yakında" yazan bir kutu, açılmış ve boş çıkmış bir kapıdır.

---

## 3. DAMLA'NIN BU OTURUMDAKİ KARARLARI — hepsi uygulandı

Sohbet baştan tarandı. Damla'nın söylediği her şey ve karşılığı:

| Damla ne dedi | Ne yapıldı | Ölçüm |
|---|---|---|
| "Koy, ama başlığı bozma" (§2-D beş başlık) | 6 başlık soru formuna geçti | kontrol.py X3 |
| "dewsletter topluyo ya, repodan bak" | GitHub'da `dewsletter` reposu bulundu, Supabase altyapısı çıkarıldı | curl ile doğrulandı |
| "Yeni tablo: slopware_subscribers" | Ayrı tablo, SQL yazıldı | `_kurulum/supabase.sql` |
| "Aynı Supabase, slopware_gorus tablosu" | Not + forum sorusu oraya | aynı dosya |
| "Kalsın, [log in] gibi davransın" (forum) | Forum navbar'da, tıklanmaz | görüntüyle bakıldı |
| "Sil" (4 ölü dosya) | pyramid.css, basic.css, style.css, effects.js | 62 KB |
| "Bölümü bitirince altında çıksın" (kontrol bağı) | `.kontrol-bag`, 6 bölümde | link kontrolü 0 kırık |
| "al görünmüyo hoverlar kötü htmlde spagetti kod var" | CSS spagettisi ölçüldü ve temizlendi | §4 |
| "prev next mesela mavi olabilirdi" | `--yon` mavi eklendi | kontrast 10.29 / 7.44 |
| "sadece pembe değil" | İki renk, iki anlam | §4 |
| "İkisi de mono, aynı boy, hizalı" | prev/next tek tanım | 380px / 380px ölçüldü |
| "Serif kalsın" (font) | Gövde serif, arayüz mono | değişmedi |
| "sayfa kasmaya başladı" | Ölçüldü, Chrome'da kasma YOK | §7-D — açık kaldı |
| "Türkçeleştir" (menü) | `[sistem mühendisliği]` `[ürün mühendisliği]` | TR/EN navbar bakıldı |
| "Hata, Türkçesini ben yazarım" (44) | **DOKUNULMADI**, Damla yazacak | §7-A |
| "dosyaları temiz tut, spagetti kod sınıf vs temizle" | §4 ve §5 | görünüm farkı 0 |

---

## 4. TASARIM — iki renk, iki soru

### Renk sistemi (yeni)

    --vurgu  (pembe/mor)  SEN NE YAPTIN
                          tik, ilerleme çubuğu, kaydolma, bulunduğun kitap
    --yon    (mavi)       NEREYE GİDİYORSUN
                          prev/next, kontrol bağı

Damla "sadece pembe değil, prev next mesela mavi olabilirdi" dedi.
Palette mavi zaten vardı (`--mavi: #8fc7ff`, gece) ve kullanılmıyordu.
Kâğıt için `#15588f` türetildi.

Kontrast ölçüldü (eşik 4.5):

    gece  #8fc7ff üstünde #171221 → 10.29
    kâğıt #15588f üstünde #ffffff →  7.44

Mavi **durağan halde** de basılıyor, hover'a saklanmadı: rengi hover'a
saklamak, rengin anlamını gizlemek olurdu.

### prev/next — dört rakip tanım, bir tanım

Kazananı yükleme sırası seçiyordu. Dördü:

1. `kitap.css:1161` — kart çiziyordu (çerçeve, padding, serif başlık)
2. `kabuk.css:1214` — buton çiziyordu, `a b { display: none }` ile adı
   gizliyordu — **ama HTML `<i>` basıyor, `<b>` değil.** Kural hiçbir şey
   gizlemedi, bölüm adı stilsiz serif olarak kaldı.
3. `kabuk.css:707` — `grid-column` veriyordu, oysa nav `flex`
4. `kabuk.css:2341` — `max-width: 46%` + `text-align: right`, sağ taraf
   sarıyor ve sağa yaslanıyordu

Tek tanım kaldı (`kabuk.css`, "prev / next" başlığı altında). Ölçüldü:

    geri  380px genişlik, 59px yükseklik, sola yaslı, mono
    ileri 380px genişlik, 59px yükseklik, sola yaslı, mono
    dar ekran (390px): iki eşit kolon, 225px / 225px, yatay taşma yok

Serif neden kalktı: serif = Damla'nın anlattığı şey, mono = makinenin
konuştuğu şey. Gideceğin yerin adı okunacak metin değil, arayüz.

Köşeli parantezler (`[< previous]` `[next >]`) korundu — kontrol.py P10
bunu arıyor ve haklı olarak beni bir kere kırmızıya düşürdü.

### Bülten formu gece temasında

`--kagit` yalnızca `.kitap.tek` içinde geceye eşleniyordu, bölüm sayfası
ise `.kitap`. Sonuç: karanlık sayfada beyaz girdi kutusu, soluk mor düğme.
`gece.css`'e form stilleri eklendi.

### Kontrol bağı ve CSS spesifikliği

`.kontrol-bag a { color: var(--yon) }` yazdım, link pembe kaldı. Sebep:
`:root[data-tema="gece"] .kitap div.body a` daha spesifik ve eziyor.
Ölçüldü (`rgb(255,143,179)` = pembe), sonra aynı spesifiklikte yazıldı.

Bu, "spagetti kod" tam olarak nedir sorusunun cevabı: bir kural
eklediğinde beş katman ezip geçiyor.

---

## 5. TEMİZLİK — görünüm farkı ölçüldü: 0 / 1450

Damla "dosyaları temiz tut, gerekmeyenleri sil, spagetti kod sınıf vs
temizle" dedi. Yapılanlar ve **her birinin ölçümü**:

### Silinenler

| Ne | Neden | Doğrulama |
|---|---|---|
| `tema/pyramid.css` 19.8 KB | hiçbir sayfa yüklemiyor | grep, 0 referans |
| `tema/basic.css` 15.0 KB | aynı, içinde 11 `bold` | grep |
| `style.css` 20.3 KB | rabadon'dan kalma, 5 `bold` | grep |
| `effects.js` 7.3 KB | hiçbir sayfa yüklemiyor | grep |
| 9 tema görseli (36 KB) | yazbel temasından kalma | HTML+CSS'te 0 kullanım |
| `eski_en_yonlendir()` | çağrılmıyor, `en/` klasörü yok | canlıda /en/ → 404 |
| `paragrafMetni()` | çağrılmıyor | grep |
| `.related` 34 CSS kuralı | şerit kaldırılmış, kurallar kalmış | HTML'de 0 `class="related"` |
| `.related` 6 seçici listesinden | paylaşılan listelerde yetim | kural yaşıyor, parça silindi |

`tema/kabuk.css`: **2453 → 2190 satır**

### Takipten çıkanlar

`.rabadon/sessions/` ve `__pycache__` — her koşuda değişip diff'i
kirletiyorlardı. `.gitignore`'a eklendi.

### Görünüm bozuldu mu? Ölçüldü.

Temizlikten önce ve sonra, **iki temada**, 32 seçici × 28 CSS özelliği +
kutu geometrisi = **1450 hesaplanmış değer** karşılaştırıldı.

    TÜM TEMİZLİK SONRASI GÖRÜNÜM FARKI: 0 / 1450

### Otomatik CSS birleştirme — DENENDİ, GERİ ALINDI

44 çakışan bildirimi otomatik birleştiren bir araç yazdım. Ölçüm yakaladı:

- `.yakinda .balon` (hover kutusu) **z-index 60 → 40** düştü, yani başka
  şeylerin altında kalabilirdi
- Rengi koyu paletten düz siyaha döndü, boyu küçüldü
- Navbar genişlikleri kaydı (`.selam` font-size 12.5 → 13.5px)
- Araç ayrıca bozuk yorum üretti: `*/* / :root -- ...`

Hepsi geri alındı. **Birleştirme elle, ölçerek yapılmalı.**

Yerine `css-harita.py` yazıldı: hiçbir şey silmiyor, hangi seçici nerede
kaç kez tanımlı ve hangi değer kazanıyor, satır numarasıyla gösteriyor.

---

## 6. BAĞIMSIZ DENETİM — dört gerçek hata buldu

Kendi işimi kendim onaylamayayım diye bağımsız bir ajan çağrıldı. Bulduğu
dört hata, dördü de bendendi, dördünü de "tamam" sanmıştım:

### 1. KRİTİK — "Supabase'e bağlandı" yanlıştı
İki uç da 404. `curl` ile doğrulandı. → §2'de anlatılan ölçüm eklendi.

### 2. YÜKSEK — bölüm altındaki bülten formu taşınmamıştı
`abone_formu()` Supabase sözleşmesine hiç geçirilmemişti. `data-sb` yok,
`kabuk.js` onu bağlamıyor, `action` proje kökü ve `target="_blank"`.
Okur gönderince **yeni bir sekmede ham JSON hatası** görüyordu. 10 sayfa,
iki dil. → İki form tek fonksiyondan (`bultenGonder`) geçiyor artık.

### 3. ORTA — Türkçe sayfada İngilizce menü
`mufredat.json`'da `ad` düz string, kardeşi `baslik` ise `{tr, en}`.
Türkçe navbar `[systems engineering]` diyordu. `product` için Türkçe
karşılık **zaten dosyada duruyordu ve okunmuyordu**. → `ad` iki dilli
oldu, `kur.py` 10 yerde dile göre çözüyor.

### 4. DÜŞÜK — `"use strict"` sessizce devre dışıydı
Yeni yardımcıları direktifin ÜSTÜNE koymuşum. Bir direktif ancak
fonksiyon gövdesinin ilk ifadesiyse geçerli; öncesinde tanım varsa ölü
bir string ifadesi olur. Dosya sloppy mode'a düşmüştü. → Taşındı.

Denetçinin temiz bulduğu maddeler: em dash (45 sayfa, görünür metin +
`title`/`aria-label`/`placeholder`), `?` kanunu, `font-weight` (yalnız
`@font-face` içinde 700), `border-radius` (hepsi 0-3px), kırık link (0),
silinen dosyalara referans (0), prev/next `<i>` stili.

---

## 7. AÇIK İŞLER

### A · Damla'dan bekleyen — 44. bölümün Türkçe başlığı
`mufredat.json` bölüm 44: `"same chips, same texts"` — Türkçe alanda
İngilizce. (45 doğru: `"aynısının yazı hali"`.) Damla "hata, Türkçesini
ben yazarım" dedi. **Başlık onun, dokunulmadı.**

### B · Bülten formu iki yerde
Navbar'da `[join the mail list!]`, ayrıca her bölümün altında bir form.
Aynı iş iki yerde duruyor. Damla'ya sorulmadı, dokunulmadı.

### C · CSS'te 23 çakışan özellik kaldı

    python3 css-harita.py

En kalabalıkları:

    ul.navbar          4 yerde (s11, s820, s1369, s2307) — display flex/grid çakışıyor
    .header            3 yerde, biri !important
    .kitap .kenar-not  3 yerde — top ve padding çakışıyor
    .yakinda .balon    2 yerde — ELLE birleştirilmeli, otomatik BOZUYOR

`.yakinda .balon` ve `.yakinda` otomatik araçta kara listeye alındı,
çünkü birleştirme hover kutusunu bozdu. Elle yapılacak.

### D · Yıldızlar — "kasıyor" ölçülemedi, açık soru

Damla "sayfa kasmaya başladı ekledikçe ağırlaştı" dedi. Chrome'da ölçüldü:

    70 yıldız, 70 animasyonlu element, 598 toplam element
    kare süresi ortalama 16.6 ms · p95 16.7 ms · en yavaş 16.8 ms
    60 fps üstü (yani düşük) kare sayısı: 0

**Chrome'da kasma bulunamadı.** Ama Damla **Safari** kullanıyor ve
Safari'de ölçüm YAPILMADI. Yani "kasma yok" demiyorum, "ben bulamadım"
diyorum. `yildizKur()` çoğaltma yapmıyor (`if (kap.childNodes.length) return`).

Olası açıklama: kasma değil görsel gürültü — metin okurken kenarda
sürekli titreşen 70 nokta. Karar Damla'nın: yıldız sayısı düşürülsün mü,
animasyon kaldırılsın mı?

Yıldız kodu: `tema/kabuk.js` `yildizKur()`, sayı `Math.min(70, innerWidth/22)`.

### E · Küçük
- `arama-tr.json` / `arama-en.json` her kurulumda yeniden yazılıyor,
  diff'te büyük görünüyor. Zararsız ama gürültülü.
- `PLAN-KABUK.md` bitmiş bir planın notu (3 Eylül), kimse okumuyor.
  Silinsin mi, Damla'ya sorulmadı.
- `kur.py` 2340 satır. Tek dosya, bağımlılıksız — bu kasıtlı, ama
  bölünmesi konuşulabilir.

---

## 8. DOKUNULMAYACAKLAR

- **`yazilar/` altındaki metinler Damla'nın.** Hiçbir cümlesine dokunulmadı.
- **`mufredat.json`'daki başlıklar Damla'nın.** Eksik `?` ona SORULUR,
  kendiliğinden değiştirilmez. Bu oturumda soruldu ve onayıyla değişti.
- **`_arsiv/`** — eski müfredat ve araştırma, silinmedi.
- **İçerik uydurulmaz.** SEO sayfaları Damla'nın yazdığı metinden çıkıyor;
  120 kelimeden kısa bir kalem için sayfa basılmıyor. Bu kural
  gevşetilmemeli: **1000 ince sayfa, 50 iyi sayfadan kötüdür.**

---

## 9. DOSYA HARİTASI

    kur.py           2340 satır, bağımlılıksız site jeneratörü
                     · uc_calisiyor_mu()  uç ölçümü (§2)
                     · gorus_ucu() / bulten_ucu()  uç çözümü
                     · ozetle()  FAQ özetini CÜMLE sınırında keser
                     · kontrol_blogu() / kontrol_bagi()  bölüm altı bağ
                     · S[dil]  bütün arayüz dizeleri, TEK KAYNAK
    kontrol.py       Damla'nın 46 cümlesi → kurulmuş siteye uygulanır
    css-harita.py    YENİ. CSS çakışmalarını gösterir, hiçbir şey silmez
    bak.sh           kur + kapı + masaüstü + dar ekran + görüntü
    olcum.js         çalışan sayfayı ölçer (tik, seçim, yerleşim)
    mobil.js         dar ekran ölçümü — artık bak.sh koşuyor
    cdp.js           bağımlılıksız Chrome DevTools Protocol köprüsü
    tema/kabuk.js    okuma araçları, tema, isim, not, bülten, forum
                     · yz()  window.YAZI'dan dil dizesi okur
                     · sbYaz()  Supabase'e satır yazar
                     · bultenGonder()  İKİ formun ortak yolu
    tema/kabuk.css   2190 satır (2453'ten)
    _kurulum/        supabase.sql — sabahki tek iş

---

## 10. DURUM  (4 Eylül 2026 gece, hepsi ölçülmüş)

    kontrol.py              46/46 geçti
    olcum.js masaüstü       TEMIZ
    olcum.js dar ekran      TEMIZ (390px, yatay taşma yok, tek kolon)
    css-harita.py           23 çakışan özellik (bilgi, kapı değil)
    kurulan sayfa           44
    sitemap URL             46
    yazı                    6 EN, 2 TR (55 bölümlük müfredatın)
    soru sayfası            15 EN + 1 TR   FAQ cevapları 16/16 tam cümle
    kontrol sayfası         5 EN + 1 TR    6 bölümden bağ var
    kırık link              0
    tema/kabuk.css          2453 → 2190 satır
    görünüm regresyonu      0 / 1450 hesaplanmış değer
    gece kontrast           gövde 14.2 · navbar 6.3 · kod 15.3 · mavi 10.29
    kâğıt mavi kontrast     7.44
    kare süresi (gece)      16.6 ms ortalama, düşük kare 0
    bülten + görüş ucu      KAPALI — tablo yok, düğmeler DÜRÜSTÇE kapalı

Sayaç doğrulandı: tik atınca `0 / 54 passed 0%` → `1 / 54 passed 2%`.
Payda 54, çünkü önsözün işaretlenecek işi yok (55 bölüm, 1 önsöz).
