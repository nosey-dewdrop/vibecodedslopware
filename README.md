# vibecodedflopware

*leetcode ama her soru senin kendi kodundan çıkıyor.*

canlı: https://nosey-dewdrop.github.io/vibecodedflopware/

## neden yaptım

çoğumuz artık elle düzeltemediğimiz bir uygulama yayınladık. vibe'la kodladık, çalıştı, ama içinde ne döndüğünü tam bilmiyoruz. vibecodedflopware kendi repo'nu bir alıştırma sahasına çeviriyor: kod tabanını haritalıyor ve seni kendi kodun üstünden sınava sokuyor — okuma, boşluk doldurma, bug enjeksiyonu, mimari — ta ki yayınladığın şeye gerçekten sahip olana kadar.

kimlik ve pazarlama kancası tek bir söz: **"tech için snapchat"** — kodun asla saklanmıyor. sunucuda değil, logda değil, yedekte değil. "iletim halinde" var, "duran halde" hiç yok.

## henüz olmadı ama olacak

dürüst olmak gerekirse ürün daha bitmedi. şu an gerçekten çalışan kısım: bir public repo url'i yapıştırıyorsun, tarayıcı onu doğrudan github'dan çekiyor (bizim sunucuya hiç uğramadan), tree-sitter kodu bir worker içinde ayrıştırıyor ve karşına modüller, sembol detayları ve mini bir komşuluk grafiğiyle bir kod haritası çıkıyor. yani "kendi kodunu harita olarak gör" kısmı ayakta.

eksik olan asıl olay: haritanın soru bankasına dönüşmesi, sınav deneyimi, ustalık takibi ve hesaplar. vizyon şu — haritayı çıkarmakla kalmayıp "bu metodu değiştirirsem ne olur"u tarayıcı içi bir sandbox'ta gerçekten mutasyona uğratıp çalıştırarak cevaplayan bir "anlama motoru", sonra o motorun doğruladığı cevaplarla üretilen sorular.

## soru tipleri (v1 planı)

1. **kod okuma** — gerçek bir fonksiyon göster, somut bir girdi için çıktıyı sor. çeldiriciler gerçek kod yollarından üretiliyor.
2. **boşluk doldurma** — gerçek bir satırdan bir token/ifade çıkarılıyor.
3. **bug enjeksiyonu** — bir satır mutasyona uğratılıyor (operatör ters çevirme, yanlış değişken, argüman değişimi, off-by-one). "hangi satır bozuk?" sonra "ne olmalıydı?"
4. **mimari** — "x'i eklemen lazım, önce hangi dosyaya dokunursun?" — seçenekler llm'in hayalinden değil, gerçek modül grafiğinden.

## sabit kurallar (kararlar, tekrar açılmıyor)

1. kullanıcı kodu sunucuda **asla** saklanmıyor — db, log, yedek, hiçbir yerde.
2. şimdilik para modeli yok. bilerek ertelendi.
3. isim `vibecodedflopware` (slopware değil).

## mimari (mahremiyet-önce)

her şey istemci tarafında çalışıyor; sunucu aptal ve kör.

```
[kullanıcının tarayıcısı]
  ├─ github oauth (pkce) — token sadece tarayıcı depolamasında
  ├─ repo çekme — tarball doğrudan github api'den
  ├─ tree-sitter wasm — kodu ayrıştırıp yapı haritasını cihazda kuruyor
  ├─ indexeddb — üretilen soru bankası + repo haritası cihazda
  └─ sınav arayüzü + ustalık motoru

[edge fonksiyonu]  (kodu gören TEK sunucu parçası)
  └─ durumsuz llm proxy: seçili snippet'leri alıp anthropic api'ye iletiyor,
     üretilen soruları döndürüyor. kayıt yok, gövde loglaması yok.

[ortak damlahelloworld supabase]  (kodu hiç görmüyor)
  └─ sadece auth + sayısal ilerleme: ustalık %, seri, sayaçlar, hash'lenmiş repo id
```

kabul edilen ödünleşim: soru bankası cihaz-başına. yeni cihaz → sorular yeniden üretiliyor; ilerleme sayıları (supabase'de yaşadığı için) hayatta kalıyor.

## stack

- **landing (mevcut)**: statik html/css/js, github pages, build adımı yok.
- **app**: vite + typescript + preact (küçük bundle), statik spa.
- **ayrıştırma**: web-tree-sitter (wasm), gramerler dile göre lazy yükleniyor. başlangıç dilleri: javascript/typescript, python, swift (damla'nın kendi repolarında test için).
- **repo çekme**: github rest api tarball'ı tarayıcıda; fflate (gunzip) + minimal tar reader ile açılıyor.
- **github auth**: pkce'li oauth (frontend'de client secret yok), token `sessionStorage`'da (sekme kapanınca ölüyor — snapchat sözüne en uygun seçim).
- **lokal depolama**: indexeddb üstünde dexie.js.
- **llm proxy**: ortak supabase üstünde edge fonksiyonu (deno), anthropic messages api'ye iletiyor; gövde loglamıyor, kullanıcı başına rate limit.
- tailwind yok, state kütüphanesi yok — el yazımı css ev stili.

## nereye gidiyor

landing canlı, faz 1 analizör (repo haritası) çalışıyor. sırada: kalıcılık (dexie) → anlama motoru (sandbox + mutasyon) → soru motoru → sınav + ustalık → hesaplar. aşama aşama plan ve kabul kriterleri `PROJECT.md` içinde.
