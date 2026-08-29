# tema/ — nereden geldi, ne değişti

Bu klasördeki görünüm **yazbel'in Python belgelerinden** (python.yazbel.com)
alındı. Yazbel Sphinx ile kuruluyor ve **pylons/pyramid** temasını kullanıyor;
o temanın stil dosyaları BSD lisanslı (Sphinx ekibi, 2007-2014), yazbel de
üstüne kendi düzenlemelerini yapmış. Kaynak:
<https://github.com/yazbel/python-istihza>.

## Olduğu gibi alınanlar

| dosya | nereden |
|---|---|
| `basic.css` | Sphinx'in temel stil dosyası (BSD) |
| `pygments.css` | Pygments'ın varsayılan renk şeması (BSD) |
| `pyramid.css` | pylons teması + yazbel'in düzenlemeleri (BSD) |
| `dialog-*.png`, `file.png`, `plus.png`, `minus.png`, `transparent.gif` | pylons/Sphinx ikonları |

## `pyramid.css`'te değişen tek yapısal şey

Yazbel üç yazı tipini kendi sunucusundan `@font-face` ile veriyor. Onların
ikisi Google Fonts'ta zaten var, üçüncüsünün (Old Stamper) lisansı belirsiz.
Bu yüzden `@font-face` blokları söküldü, yerine Google Fonts'tan beslenen
karşılıkları kondu:

- `old_stamperregular` → **Special Elite** (logo)
- `droid_sansregular` → **Noto Sans** (gövde; Droid Sans'ın devamı)
- `roboto` → **Roboto Slab** (başlıklar; birebir aynı yüz)

Bunun dışında kurallar olduğu gibi duruyor. Bize ait eklentiler dosyanın en
altında, ayrı bir bölüm olarak işaretli.

## Bize ait olanlar

| dosya | ne yapıyor |
|---|---|
| `site.js` | kod bloğu kopyalama, okurken aktif başlığı işaretleme, aramadan gelen terimi vurgulama |
| `ara.js` | arama sayfasının kendisi: indeksi çekiyor, gövdeliyor, sıralıyor |
| `stem.js` | **üretilmiş dosya** — `kur.py` yazıyor; Türkçe/İngilizce ek sözlüğü ve gövdeleme algoritması |

Yazbel'in JS'i (Sphinx'in `searchtools.js` + Snowball'dan üretilmiş 77 KB'lık
`turkish-stemmer.js` ikilisi) alınmadı. Aynı işi yapan kısa bir gövdeleyici
elde yazıldı; indeks `kur.py`'de üretiliyor, sorgu tarayıcıda aynı sözlükle
gövdeleniyor. İki taraf ayrı düşmesin diye sözlük tek yerde duruyor ve
`stem.js`'e oradan basılıyor.

## Metin lisansı

Yazbel'in **metinleri** CC BY-NC-SA. Buradan hiç metin alınmadı, sadece
sunum katmanı (CSS/ikon) alındı. Bu sitedeki yazılar Damla Su Bilge'ye ait.
