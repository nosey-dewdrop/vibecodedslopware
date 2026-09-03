# vibecodedslopware — kabuk planı
3 Eylül 2026 · lulumelon'un sadeliği + yazbel'in okutma biçimi + portfolyonun gecesi

Yeni site kurulmuyor. Kurulu olan `kur.py` (1484 satır, bağımlılıksız) ve `tema/`
üstüne yeni bir kabuk geçiyor. Yazılar Damla'nın, jeneratör aynı jeneratör.

---

## 0. ÖNCE: CSS NEDEN YÜKLENMİYOR — bulundu, kanıtlı

Canlı ana sayfa CSS'i şu adreste arıyor:

    https://nosey-dewdrop.github.io/tema/kitap.css   ->  404

Olması gereken:

    https://nosey-dewdrop.github.io/vibecodedslopware/tema/kitap.css  ->  200

Sebep: canlıdaki `index.html` `href="../tema/kitap.css"` diyor. Ana sayfa
`/vibecodedslopware/` içinde, `../` bir üst dizine çıkıyor, yani kullanıcı
kökü. Orada `tema/` yok.

`kur.py:1274` bunu zaten `yukari = ""` diye düzeltmiş ve **yereldeki**
`index.html` doğru (`href="tema/kitap.css"`). Yani düzeltme yapılmış ama
**commit/push edilmemiş.** Canlıda bayat dosya duruyor.

Bölüm sayfaları (`/slopware/localhost/`) `../../tema/` diyor ve o doğru
çözülüyor — 200. Yani hata YALNIZ ana sayfada ve 404'te.

**Yapılacak:** `python3 kur.py` + commit + push. Bu tek başına ana sayfayı
düzeltir. Kabuğun geri kalanı bunun üstüne gelir.

---

## 1. YAZI TEMİZLİĞİ — Damla'nın istediği

**Ölçüm (bugün):** slopware = 6 yazılı, 0 boş placeholder sayfa, 49 kilitli.
Yani "yazı sanılan" boş SAYFA zaten basılmıyor — `kur.py` tarihi gelmemiş
bölümün sayfasını hiç kurmuyor.

Ama şunlar duruyordu ve kaldırıldı (silinmedi, `_arsiv/` altına alındı):

    MUFREDAT.md               82 KB   41'lik eski müfredat, bayat
    KURTARILAN-ARASTIRMA.md  791 KB   eski araştırma dökümü
    DEVIR.txt                 19 KB   eski oturum notu
    ESKI-KOSUDAN-TASINACAK.txt 46 KB  eski koşu notu

`_arsiv/` `.gitignore`'a girmez — arşiv, silme değil. Ama sitede görünmez,
`kur.py` oraya bakmaz.

**Takvim:** Damla henüz oturtmadı. Mekanik **3 günde bir** ve o kalıyor
(`mufredat.json → site.takvim.aralik_gun = 3`). Tarihler Damla takvimi
verince tek seferde güncellenir; `kur.py` zaten tarihten okuyor, kod
değişmeyecek.

---

## 2. RENK VE TİPOGRAFİ SÖZLEŞMESİ — uydurma yok, kopya

**Açık tema (varsayılan) — lulumelon'un kâğıdı.** Zaten `tema/kitap.css`'te:

    --kagit #ffffff   --murekkep #111111   --murekkep-soluk #6b6b6b
    --cizgi #e4e4e4   --cizgi-koyu #cfcfcf --vurgu #7b3fa8

**Gece teması — portfolyonun `body.pal-a`'sı, birebir:**

    --bg #171221   --bg-soft #1f1930   --ink #efe8f7   --ink-dim #9d92b5
    --pink #ff8fb3 --purple #c9a6ff    --green #b8e39a --yellow #ffd479
    --blue #8fc7ff

**Font:** gövde CMU Serif (LaTeX kitabı — yazbel'in okutma hissi),
kabuk IBM Plex Mono (portfolyo). İkisi de zaten bağlı.

**Portfolyodan taşınan desenler:**
- `#stars` yıldız alanı + `.star` + `@keyframes tw` — sadece gecede
- `.cf` konfeti (tıklama patlaması + imleç izi) — `tema/kitap.js`'te zaten
  ince hâli var (`.iz`), gecede portfolyonun renkli hâline çıkar
- `::selection { background: var(--pink) }`

**Kırmızı çizgiler (portfolyodan):** bold yok, border yok, köşe 0-3px,
sadece terminal karakterleri (* + · . -), renk anlam taşır — rastgele renk
kızdırır.

---

## 3. NAVBAR — her sayfada, `kur.py: navbar()` yeniden yazılır

**Satır 1** — ortada, serif, abartısız (portfolyodaki gibi):

    VIBECODEDSLOPWARE

**Satır 2** — mono 13.5px, tek satır, ortalı:

    slopware   systems engineering ⟡   product engineering ⟡
       ·  ara  ·  [mail liste kaydol!]  ·  en|tr  ·  ◐  ·  log in ⟡

### 3a. slopware
Canlı, tıklanır. Aktif sayfada `--vurgu`.

### 3b. systems engineering ⟡ · product engineering ⟡
**Tıklanmaz.** `<span class="yakinda" tabindex="0">`.
Hover ve focus'ta üstünde küçük tooltip: `soon`.
`cursor: default`, `aria-disabled="true"`, link yok.
Mekanizma `tema/kitap.css`'teki `em.kilit .gizli` tooltip'i ile aynı —
yeni bir şey icat edilmiyor, çalışan şey kullanılıyor.

`product engineering` üçüncü kitap olarak `mufredat.json`'a
`{"kod":"product","durum":"yakinda"}` diye girer. `systems` zaten orada.

### 3c. [mail liste kaydol!]
**Form sayfası YOK.** Tıklanınca sayfanın ortasında `<dialog>` açılır:

    ┌─────────────────────────────────┐
    │  yeni bölüm çıkınca haber ver   │
    │  [ mail                    ]  → │
    │  sadece yeni bölüm haberi.      │
    │  başka bir şey yok.        [×]  │
    └─────────────────────────────────┘

- `<dialog>` native — Esc kapatır, arka planı karartır, focus'u tutar.
- Dışına tıklayınca kapanır.
- Formun `action`'ı `mufredat.json → site.bulten.kod`'dan gelir.
  **Kod boşsa** dialog "soon" der ve form basılmaz. `abone_formu()` bu
  mantığı zaten taşıyor (kur.py:713) — dialog'a taşınır.
- Damla hesabı açınca **tek satır json**, kod değişmez.

### 3d. en|tr
Dil switch. Şu an `DILLER = ["en"]` — tek dil, switch **basılmaz**.
`kur.py` bunu zaten kontrol ediyor (`if len(DILLER) > 1`).
TR'ye geçilince (`DILLER = ["tr","en"]`) switch kendiliğinden görünür ve
aynı bölümün karşı diline gider. TR yazıları gelene kadar kod hazır bekler.

**Mevcut durum:** `yazilar/tr/` altında 2 md var ama `DILLER` sadece "en",
yani TR hiç kurulmuyor. Damla "tr hiç yok" dedi — doğru, dokunulmuyor.

### 3e. ◐ — tema switch
İKİ tema: `kagit` (varsayılan) / `gece`.
`localStorage: vibecodedslopware.tema`.
FOUC olmasın diye `<head>`'e 3 satırlık inline script — CSS'ten önce
`<html data-tema="gece">` yazar.

### 3f. log in ⟡
**Tıklanmaz.** Hover: `soon — right now it is the mail list`.
3b ile aynı mekanizma.

**Mobil:** satır 2 yatay kayar (`overflow-x: auto`), sarmalamaz.

---

## 4. ANA PANEL — 100 birim

    ┌────────┬──────────────┬────────────────────────────┬────────┐
    │   15   │      20      │             50             │   15   │
    │  boş   │ bölüm listesi│        yazı kâğıdı         │  boş   │
    └────────┴──────────────┴────────────────────────────┴────────┘

`grid-template-columns: 15fr 20fr 50fr 15fr`, `max-width: 1400px`, ortalı.

Şu anki grid `var(--kenar-en) minmax(0,var(--olcu)) var(--not-en)` — yani
15rem / 36rem / 13rem. Bu birime çevrilir; boş kolonlar gerçek boşluk olur,
kenar notu 50 birimin içinde kalır.

**< 1100px:** liste üstte `<details>` olur, kâğıt tam genişlik.
`tema/kitap.css`'te 900px kırılımı zaten bunu yapıyor (`.kenar.acik`),
kırılım noktası 1100'e çekilir.

### 4a. SOL KOLON — 20 birim, bölüm listesi

`position: sticky; top: 0; height: 100dvh; overflow-y: auto` — kendi scroll'u.
55 bölüm alt alta, mono 12.5px. Seviye başlıkları (101 / 201 / 301 / 401 / 501)
arada dim satır olarak durur.

Satır biçimleri:

    ▸ 01  what is the thing on your screen?      ← burada, --vurgu
      02  why can your deploy not find files?    ← okunmuş: ÜSTÜ ÇİZİLİ + dim
      03  guys, I am on localhost
      07  ...                          ● sep 12  ← kilitli, tıklanmaz, hover'da tarih

**Okundu = üstü çizili.** `text-decoration: line-through`, renk `--gecti`.
Bu **zaten çalışıyor** — `tema/kitap.css` `.kenar-bolum.gecti a`.
Kaynak `localStorage: vibecodedslopware.gecilen` (site.js:127).
Yeniden icat yok, bağlanacak.

**Listenin üstünde, sticky, iki satır:**

    hello damla ⋆˙⟡
    3 / 55   ▓▓░░░░░░░░░░░░░░░░   5%

- Progress barı `.kenar-cubuk` + `.kenar-dolu` — 2px `--vurgu` dolgusu.
  **Zaten var** (site.js `kenarKur()` yüzdeyi hesaplıyor).
- Sayı canlı: kutu tiklenince anında güncellenir.
- Önsöz paydada yok (site.js bunu zaten doğru yapıyor).

### 4b. İSİM SORMA + KALICI SELAMLAMA

İlk girişte (`localStorage: vibecodedslopware.ad` yoksa) `<dialog>`:

    what should I call you?
    [ ________ ]  [ok]
    this stays in your browser. it is not sent anywhere.

- `[ok]` veya Enter → `vibecodedslopware.ad` yazılır, kapanır.
- Boş bırakıp kapatabilir → `ad = ""` yazılır, **bir daha sorulmaz**,
  selamlama `hello ⋆˙⟡` olur.
- **Pop-up kapandıktan sonra kalıcı yer:** sol kolonun tepesindeki
  `hello <ad> ⋆˙⟡` satırı. Her sayfada, her girişte orada.
- O satıra tıklanınca isim değiştirme dialogu tekrar açılır.
- KVKK: isim sunucuya gitmez, dialog bunu tek cümleyle yazar.

### 4c. SAĞ — YAZI KÂĞIDI, 50 birim

Gece temasında bile **beyaz kâğıt**: `background: #fff; color: #111`.
CMU Serif, 1.24rem, `--olcu` ölçüsü.
Etrafı `--bg` (#171221) kalır → karanlıkta açık duran bir kitap sayfası.

Gölge yok, köşe 3px, çerçeve yok. Kâğıdın içindeki her şey (kod blokları,
kontrol kutusu, dipnot) açık temanın renkleriyle kalır — kâğıt kâğıttır.

---

## 5. OKUMA ARAÇLARI — kâğıdın içinde

Metin seçilince imlecin altında ince bir çubuk:

    [ highlight ]  [ strike ]  [ note ]

- **highlight** — `<mark>`, `--yellow` %35 alfa
- **strike** — `line-through`, `--murekkep-soluk`
- **note** — küçük textarea açar; kaydedilince paragrafın sağına
  kenar notu düşer (`--not-en` = 13rem alan zaten var), metinde `✎` kalır

**Saklama:** `localStorage: vibecodedslopware.isaret.<mufredat>/<slug>`

Kayıt biçimi seçim ofseti DEĞİL — o kırılgan. Yazı yeniden kurulunca
bütün işaretler kayar. Bunun yerine:

    { p: 12, a: 40, b: 88, tur: "hl", not: "..." }
      ^paragraf  ^karakter aralığı

Paragraf sayısı değişirse eşleşmeyen işaret **sessizce düşer** —
yanlış yere yapışmış bir highlight, olmayan bir highlight'tan kötüdür.

Kâğıdın altında: `notes (3)` — açılınca o bölümdeki notlar liste.

---

## 6. SEND TO DAMLA

Her notun yanında `[send to damla]`.

Sunucu yok (GitHub Pages). Üç yol vardı:

| yol | karar |
|---|---|
| GitHub Issues API | **ELENDİ** — token Pages'te herkese açık, sızar |
| `mailto:` | çalışır ama forumu beslemez, mail kutusu dolar |
| **tek uçlu POST** | **SEÇİLDİ** |

Adres `mufredat.json → site.gorus.adres`. Boşken buton `soon` der, basılmaz —
`abone_formu()` ile aynı kural.

Giden paket:

    { bolum, dil, alinti, not, ad, tarih }

**Mail adresi İSTENMEZ.** KVKK: toplamadığın veriyi korumak zorunda değilsin.
Damla cevabı foruma yazar, kişiye değil.

---

## 7. FORUM — `/forum/`, şimdilik tek yönlü

Stack Overflow (oy, kullanıcı, cevap zinciri) **bu turda yok** — hesap
gelince açılır. Şimdi kurulan şey onun **veri şekli**:

    { id, bolum, alinti, soru, cevap, tarih }

- Gelen notlar `forum.json`'a girer (Damla ekler ya da script çeker)
- `kur.py` bunu statik sayfaya basar
- Sayfa: soru → alıntı (hangi bölüm, hangi cümle) → Damla'nın cevabı
- Bölüm sayfasının altında: `3 questions about this chapter →` satırı,
  forumun o çapasına gider

Hesap geldiğinde bu json bir tabloya döner, sayfa aynı kalır.

---

## 8. FOOTER

    damla'dan sevgiler ⋆˙⟡

    [ buy me a coffee ]  ·  rss  ·  pdf  ·  html  ·  source

    text cc by-nc, code mit.
    built with a hand-written generator · yazbel taught me what teaching
    in writing looks like

- **buy me a coffee:** `mufredat.json → site.kahve` (kullanıcı adı).
  Boşsa buton basılmaz. Damla adı verince `buymeacoffee.com/<ad>`.
- Mevcut yazbel satırı korunur — o borç ödenmiş bir borç.

---

## 9. PROGRAMATİK SEO — agresif

**Şu an:** 6 bölüm + 2 kök + arama = **9 URL**. `sitemap.xml` 1188 byte.
Bununla "slopware book" araması bulunmaz. Hedef **birkaç bin URL**,
hepsi gerçek içerik.

### Üretilecek sayfa aileleri

**1 · `/sozluk/<terim>/` — 200-400 sayfa**
Kitapta geçen her teknik terim bir sayfa: tanım (kitaptan alıntı),
geçtiği bölümler, ilgili terimler.
Kaynak: yazılardaki `` `kod` `` ve **kalın** terimler + elle `sozluk.json`.
Sorgu: "what is localhost", "what is a build step", "what is slopware".

**2 · `/kontrol/<slug>/` — 55 sayfa**
`mufredat.json`'da her bölümün `kontrol` alanı **zaten var**:
> "DevTools Network. Kaç dosya indi, kaç kilobayt, hangisini tanımıyorsun?"

Her biri "run this on your own project" sayfası olur.
En yüksek niyetli trafik — arayan kişi yapacak bir işi var.

**3 · `/belirti/<slug>/` — 100-200 sayfa**
Slopware belirtileri. "my deploy works locally but not live",
"why is my api key visible in the browser", "my site is blank on mobile".
Her biri: belirti → neden → hangi bölüm.
**Uzun kuyruk trafiğinin çoğu buradan gelir.** Elle `belirti.json`.

**4 · `/arac/<ad>/` — 50-100 sayfa**
Kitapta adı geçen her araç: DevTools, curl, git, vercel, npm, ssh...
"how to use X to check your app".

**5 · `/seviye/101/` … `/seviye/501/` — 5 sayfa**
Zaten var, zenginleşir.

### Her sayfada
- `<title>` **soru formunda ve ? ile biter**
- meta description, canonical
- `hreflang` en/tr çifti (tr gelince)
- JSON-LD: `Article` ya da `FAQPage`
- og görseli (mevcut `og_uret()` üretici kullanılır)
- `sitemap.xml`'e girer

### Tek sert kural
**İnce sayfa basılmaz.** Bir kalem için gerçek 150+ kelime yoksa o sayfa
kurulmaz. Google'ın thin-content cezası sitenin **tamamını** gömer —
1000 ince sayfa, 50 iyi sayfadan kötüdür.

---

## 10. NE YAPILMAZ

- Sunucu, hesap, veritabanı yok — GitHub Pages'te kalınıyor
- Yeni framework yok — `kur.py` bağımlılıksız kalır
- İçerik uydurulmaz — sözlük ve belirti kalemleri Damla'nın yazdığı
  metinden çıkar, model üretmez

---

## 11. DAMLA'DAN GEREKEN İKİ ŞEY

1. **buy me a coffee** kullanıcı adı
2. **mail listesi** (buttondown vb.) + **send to damla** POST adresi

İkisi de boşken site tam çalışır, o iki buton `soon` der.
Damla verince: `mufredat.json`'da iki satır. Kod değişmez.

---

## 12. SIRA

    1  kur.py çalıştır + commit + push        -> ana sayfa CSS'i düzelir
    2  gece teması + tema switch              -> iki renk dünyası
    3  navbar yeniden                         -> mail dialog, yakında'lar
    4  100 birimlik grid                      -> 15/20/50/15
    5  isim + selamlama + progress            -> localStorage
    6  yazı kâğıdı beyaz kalır                -> gecede bile
    7  highlight / strike / note              -> okuma araçları
    8  send to damla + /forum/                -> tek yönlü
    9  footer + buy me a coffee               -> kabuk biter
    10 programatik SEO                        -> asıl iş
