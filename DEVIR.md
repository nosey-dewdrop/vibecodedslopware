# DEVİR — vibecodedslopware
4 Eylül 2026, gece · sabah koda inen kişi bunu okur

Repo: `~/damla_projects_2026/vibecodedslopware` · dal `main` · son commit `276c267`
(push'lu, ağaç temiz). Canlı: https://nosey-dewdrop.github.io/vibecodedslopware/

---

## 0. ELİNDE TEK BİR İŞ VAR — 3 dakika

**Supabase'de iki tablo aç.** Kod hazır ve push'lu; tablolar olmadığı için
site kendini kapatmış durumda: `[join the mail list!]` ve `[send to damla]`
şu an tıklanmıyor, hover'da "coming soon" diyorlar.

1. Aç: https://supabase.com/dashboard/project/xjtmqncfhuidctxgthhv/sql/new
2. Yapıştır: `_kurulum/supabase.sql` (61 satır, iki tablo + RLS)
3. Run
4. `./bak.sh` → kurulum ucu ölçer, tablo bulunca düğmeleri kendiliğinden açar
5. commit + push

Ölçmek istersen tek satır:

    curl -s -o /dev/null -w "%{http_code}\n" -X POST \
      "https://xjtmqncfhuidctxgthhv.supabase.co/rest/v1/slopware_subscribers" \
      -H "apikey: <mufredat.json içindeki anahtar>" \
      -H "Content-Type: application/json" -d '{"email":"a@b.cc","dil":"en"}'

`404` = tablo yok · `201` = açıldı · `409` = zaten kayıtlı (yani çalışıyor)

Anahtar `mufredat.json`'da ve public; sakıncası yok çünkü RLS anon'a
YALNIZCA insert veriyor, select vermiyor. Anahtar sızsa da kimse listeyi
indiremez. **Bu RLS tabloyla birlikte kurulur, sonradan değil** — SQL'de var.

---

## 1. ÇALIŞTIRMA

    ./bak.sh          kur + kapı + masaüstü ölçüm + dar ekran + 6 görüntü
    python3 kontrol.py        Damla'nın 46 cümlesi
    python3 css-harita.py     hangi CSS kuralı nerede eziliyor

**Kapı kırmızıysa push yok.** Görüntülere gözle bak, sonra push et.

Tuzak: `python3 kur.py` PDF üretirken 90 sn takılabilir. Kaçınmak için
`PATH=/usr/bin:/bin python3 kur.py`. Eldeki PDF bozulmaz.

---

## 2. BU OTURUMDA NE OLDU

### Damla'nın kararları uygulandı
- Altı başlık soru formuna geçti (07, 08, 14, 15, 36 + 03'ün Türkçesi).
- prev/next: dört rakip CSS tanımı → bir tanım. İki kutu 380/380 px, hizalı,
  ikisi de mono. Ölçüldü.
- İkinci renk geldi: **mavi = nereye gidiyorsun** (prev/next, kontrol bağı),
  **pembe = sen ne yaptın** (tik, ilerleme, kaydolma, aktif kitap).
  Kontrast ölçüldü: gece 10.29, kâğıt 7.44 (eşik 4.5).
- Gövde fontu serif kaldı. Serif = Damla'nın anlattığı, mono = makinenin
  konuştuğu. Bu ayrım kitabın kendi fikri.
- Forum navbar'da kalıyor, `[log in]` gibi davranıyor.
- Dört ölü dosya silindi.

### Yalan söyleyen arayüz kapatıldı
`kur.py` artık kurarken ucu **ölçüyor**: tablo yoksa düğmeyi hiç basmıyor,
yerine tıklanmaz `[...]` etiketi koyuyor. Yapılandırmada bir adres olması,
o adresin çalıştığı anlamına gelmiyordu; eskiden okur mailini yazıp
gönderiyor ve "gitmedi" cevabı alıyordu.

Ulaşılamayan ağ `None` döner ve yapılandırmaya güvenilir — internetsiz bir
kurulum makinesi çalışan bir düğmeyi öldüremesin diye.

### Temizlik (görünüm farkı ölçüldü: 0 / 1450 özellik)
- `.related` şeridi kaldırılmıştı, 34 yetim CSS kuralı + 6 seçici listesi
  kalmıştı. Silindi. `tema/kabuk.css` 2453 → 2190 satır.
- 9 kullanılmayan tema görseli, `eski_en_yonlendir()`, `paragrafMetni()`.
- `.rabadon/sessions/` ve `__pycache__` takipten çıktı (her koşuda değişip
  diff'i kirletiyorlardı).
- 14 İngilizce sabit `window.YAZI`'ya taşındı.
- `"use strict"` yardımcıların altında kalmıştı, dosya sloppy mode'daydı.

### Kapılar bugüne uyarlandı
kontrol.py N2/N3 (uç kapalıyken dürüst hali kabul eder), P12 (`.related`
yerine navbar + bölüm altı), X1 (silinen pyramid.css). olcum.js aynı şekilde.
`bak.sh` artık `mobil.js`'i de koşuyor — repoda duruyordu, hiç koşulmuyordu.

---

## 3. AÇIK İŞLER

### A · Damla'dan bekleyen — 44. bölümün Türkçe başlığı
`mufredat.json` bölüm 44: `"same chips, same texts"` — Türkçe alanda
İngilizce. (45 doğru: `"aynısının yazı hali"`.) Damla "hata, Türkçesini ben
yazarım" dedi. **Başlık onun, dokunulmadı.**

### B · Bülten formu iki yerde
Navbar'da `[join the mail list!]`, ayrıca her bölümün altında bir form.
Aynı iş iki yerde. Damla'ya sorulmadı, dokunulmadı.

### C · CSS'te 23 çakışan özellik kaldı
`python3 css-harita.py` hepsini satır numarasıyla listeler. Otomatik
birleştirme **denendi ve geri alındı**: hover balonunu bozdu (z-index 60→40,
rengi düz siyaha döndü) ve navbar genişlikleri kaydı. Ölçümle yakalandı.
Birleştirme elle yapılmalı; harita hangi değerin kazandığını gösteriyor.

En kalabalıkları: `ul.navbar` (4 yer), `.header` (3), `.kitap .kenar-not` (3),
`.yakinda .balon` (2 — bu ikisi ELLE birleştirilmeli, otomatik bozuyor).

### D · Yıldızlar — "kasıyor" ölçülemedi
Damla "sayfa kasmaya başladı" dedi. Chrome'da ölçüldü: 70 yıldız, 70
animasyon, kare süresi **16.6 ms yani tam 60 fps, tek düşük kare yok**.
Yani Chrome'da kasma bulunamadı. Damla Safari kullanıyor — Safari'de
ölçüm YAPILMADI. Kasma hissi görsel gürültü de olabilir (metin okurken
kenarda titreşen 70 nokta). Karar Damla'nın: yıldız sayısı düşürülsün mü?

### E · Küçük
- `arama-tr.json` / `arama-en.json` her kurulumda yeniden yazılıyor, diff'te
  büyük görünüyor. Zararsız ama gürültülü.
- `PLAN-KABUK.md` bitmiş bir planın notu, kimse okumuyor. Silinsin mi,
  Damla'ya sorulmadı.

---

## 4. DOKUNULMAYACAKLAR

- **`yazilar/` altındaki metinler Damla'nın.**
- **`mufredat.json`'daki başlıklar Damla'nın.** Eksik `?` ona sorulur.
- **`_arsiv/`** — eski müfredat ve araştırma.
- **İçerik uydurulmaz.** SEO sayfaları Damla'nın metninden çıkıyor, 120
  kelimeden kısa kalem için sayfa basılmaz. 1000 ince sayfa, 50 iyi
  sayfadan kötüdür.

---

## 5. DURUM  (4 Eylül 2026 gece, ölçülmüş)

    kontrol.py              46/46
    olcum.js masaüstü       TEMIZ
    olcum.js dar ekran      TEMIZ  (390px, yatay taşma yok)
    css-harita.py           23 çakışan özellik (bilgi, kapı değil)
    kurulan sayfa           44
    soru sayfası            15 EN + 1 TR   (FAQ cevapları 16/16 tam cümle)
    kontrol sayfası         5 EN + 1 TR    (6 bölümden bağ var)
    kırık link              0
    tema/kabuk.css          2453 → 2190 satır
    gece kontrast           gövde 14.2 · navbar 6.3 · kod 15.3 · mavi 10.29
    bülten + görüş ucu      KAPALI — tablo yok, düğmeler dürüstçe kapalı

Bir bağımsız ajan bu oturumu denetledi ve dört gerçek hata buldu:
Supabase tablolarının olmaması, alttaki bülten formunun taşınmamış olması,
Türkçe menüdeki İngilizce sızıntı, ve `"use strict"`'in devre dışı kalması.
Dördü de düzeltildi. **Ajan kendi yaptığı işi denetlemez** — bu kural
bu oturumda iki kere işe yaradı.
