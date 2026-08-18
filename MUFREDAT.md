# SLOPWARE — MÜFREDAT VE KAYNAK DOSYASI

40 bölüm, 4 seviye. Türkçe yazılır, İngilizce ikizi çıkar.
Ton: öğretici ve güçlü, zorbalık yok. Her bölümde Damla'nın kendi vakası var.

**Bölüm iskeleti (Yazbel'in pedagojisi, her bölümde aynı):**
çalışıyor görünen kod → "iyi, hoş, ama" → nerede çöküyor → doğrusu → benim vakam

**Kararlar:** Terim "slopware" olarak kalır, Türkçe karşılık uydurulmaz.
URL'de numara ve tarih yok (`/slopware-nedir`). Statik jeneratör + git'te düz metin.
Lisans gün 1'de belli — kalıcı rehber iddiası lisanssız inandırıcı değil.

**Araştırma durumu:** 101 ✅ · 201 ✅ · 301 ⏳ (limit) · 401 ⏳ (limit)

---

# SLOPWARE 101 — bu şey nasıl çalışıyor?

**101'in TEZİ (araştırmadan çıktı):** Vibe coder'ın kafasında *notional machine* yok.
AI'ın çıktısı ona sihir gibi görünüyor çünkü "makine" diye bir zihinsel model kurulmamış.
Kaynak: Sorel & du Boulay, *Notional Machines and Introductory Programming Education*,
ACM TOCE 2013 — https://dl.acm.org/doi/10.1145/2483710.2483713

**101 boyunca tek bir CVE numarası, tek bir OWASP kodu geçmez.**

## 0. Slopware nedir, neden şimdi ✅ YAZILDI
`yazilar/01-slopware-nedir.md`

## 1. Ekranındaki şey ne?
- Araç: **Python Tutor** — notional machine'i görselleştiriyor, 5 satırlık kodu adım adım,
  bellek kutularının değiştiğini görüyorsun. https://pythontutor.com
  (Guo, SIGCSE 2013 — https://dl.acm.org/doi/10.1145/2445196.2445368)
- MDN, web nasıl çalışır:
  https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works
- Yanlış anlama: novice'lerin bir kısmı **kodun paralel çalıştığını** sanıyor.
  (ERIC EJ1207584 — **DOĞRULANMADI**, PDF parse edilemedi)
- Egzersiz: sağ tık → kaynağı görüntüle → DevTools Network. Sayfa = indirilen dosyalar.

## 2. Terminal ve klasör
- **En güçlü kanıt burada:** öğrenciler "dosya" ve "klasör" kavramını bilmiyor.
  The Verge, "File not found" (Monica Chin, 2021), STEM profesörlerinin gözlemleri.
  (**kısmen DOĞRULANMADI** — orijinal Verge makalesine erişilemedi, TechSpot/OSnews aktarımı)
- İki mental model: **"çamaşır sepeti"** (her şey tek yere, sonra ara) vs dizin hiyerarşisi.
  https://jarango.com/2021/09/22/the-waning-filefolder-mental-model/
- ⚠ **Yazarken düşülecek tuzak:** *"Dizin yapısı öğrencilere sezgisel gelmediği gibi,
  profesörlere o kadar sezgisel geliyor ki nasıl anlatacaklarını bulamıyorlar."*
- MIT Missing Semester — bu boşluk için yazılmış resmi ders, 2026 müfredatında
  "Agentic Coding" ve "Code Quality" var: https://missing.csail.mit.edu/2026/
- Julia Evans shell comics: https://wizardzines.com/comics/bash-tricks/ ·
  https://wizardzines.com/comics/redirects/
- Egzersiz: `pwd` → `ls` → `cd` + aynı klasörü Finder'da yan yana aç.

## 3. localhost nedir, neden sadece sende çalışıyor
- Analoji: loopback = mektubu kendi adresine yollamak, postaneye hiç gitmiyor.
- Yanlış anlama: **127.0.0.1 ile 0.0.0.0 aynı sanılıyor.**
  https://www.baeldung.com/cs/localhost-ip-address-access
- İkinci yanlış anlama: "localhost:3000 linkini arkadaşıma atarım" — klasik "aha" anı.
- **Tek komutla biten ders (egzersiz):**
  `python3 -m http.server 8000` → tarayıcıda açılır → telefondan açılmaz →
  `python3 -m http.server 8000 --bind 0.0.0.0` + LAN IP → telefondan açılır.

## 4. Bir uygulama kaç parçadan oluşur
- MDN Client-Server overview:
  https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Client-Server_overview
- **Somut kanıt:** yeni başlayanların *"PHP'mi JavaScript'imin içine nasıl koyarım?"* sorusu.
  UserFrosting bunu bir öğrenci yanılgısı olarak belgeliyor:
  https://github.com/userfrosting/learn/blob/4.5/pages/02.background/02.the-client-server-conversation/docs.md
  → **Vibe coder'ın hatası birebir bu:** AI ona hem client hem server kodu verir,
  o ikisinin farklı makinelerde koştuğunu bilmez.
- **BOŞLUK:** client-server misconception'ları için hakemli literatür YOK.
- Egzersiz: DevTools Network açık, sayfayı yenile. Her satır = bir HTTP isteği.

## 5. İnternette bir şey nasıl açılır
- **Julia Evans "How DNS Works" zine** — tam istenen kalitede:
  https://wizardzines.com/zines/dns/ · Networking zine (ücretsiz PDF): https://jvns.ca/networking-zine.pdf
- Cloudflare: telefon rehberi analojisi https://www.cloudflare.com/learning/dns/what-is-dns/
  (101 için daha iyi olan ikinci analojisi: **posta kutusu** — önce ülke .com, sonra şehir, sonra sokak)
- Yanlış anlamalar: "domain aldım, site yayında" (domain ≠ hosting ≠ deploy);
  "deploy = dosyaları yüklemek" (build adımının varlığı bilinmiyor).
- Egzersiz: `dig example.com` → dönen IP'yi tarayıcıya yaz.
  Tek HTML'i Netlify'a sürükle → 60 saniyede canlı URL → telefonun mobil verisinden aç.
  (Bölüm 3'ün tam karşıtı, ikisi birbirini tamamlıyor)

## 6. Veri nerede duruyor
- **SQLite'ın kendi dokümanı 101 için mükemmel:** *SQLite `fopen()` ile rekabet eder*,
  kurumsal veritabanlarıyla değil. https://sqlite.org/whentouse.html
  → "veritabanı büyük ve korkutucu bir şey" sanısını kırıyor.
- Üç katman hiç ayrılmıyor: RAM (değişken) → tarayıcı depolama (localStorage) →
  sunucu tarafı veritabanı. Ortadaki "veritabanı" sanılıyor.
- **BOŞLUK:** *kalıcılık* için akademik misconception literatürü yok
  (değişken/atama için var, bu konu boş).
- **Üç adımlı egzersiz:** `let count = 0` → artır → F5 → 0.
  Sonra `localStorage.setItem` → F5 → korunuyor. Sonra gizli sekmede aç → yine 0.
- Damla'nın vakası: `stitchu/web/js/store.js` — localStorage bilinçli KARAR
  (*"Everything stays on this device, that is a product promise, not a gap"*) vs
  `gymgyme/js/coach-onboarding.js:18` — localStorage kaza.
  **Aynı teknoloji, biri doğru biri yanlış. Bölümün gücü bu.**

## 7. Sır nedir
- 12-Factor III Config, kanonik turnusol testi:
  *"kod bu an açık kaynak yapılsa kimlik bilgisi sızar mı?"* https://12factor.net/config
- Egzersiz 1: kendi sitesini aç → DevTools → Sources → bundle'da `sk-` veya `API_KEY` ara.
  Bulursa ders bitmiştir.
- Egzersiz 2: `git log -p | grep -i "api_key"` — sildiği anahtar git geçmişinde duruyor.
- Damla'nın vakası: gymgyme/missingsemicolon/shortstorylong — üçünde de `.env`
  `.gitignore`'da (`.env*`), git geçmişinde hiç görünmemiş. **Sızıntı yok, doğrusu bu.**

## 8. Hata mesajını okumak
- **Akademik olarak en sağlam bölüm. Barik et al., "Do Developers Read Compiler Error
  Messages?", ICSE 2017** (eye-tracking): geliştiriciler hata mesajını *okuyor*; okuma zorluğu
  **kaynak kodu okuma zorluğuyla karşılaştırılabilir**; öğrenciler fiksasyonlarının **%25'ini**
  hata mesajlarına ayırıyor. https://dl.acm.org/doi/10.1109/ICSE.2017.59
  → **"Hata mesajını okumuyorlar" klişesi YANLIŞ. Okuyorlar, ama okumak kod okumak kadar zor.
  Çözüm "oku" demek değil, NASIL okunacağını öğretmek.**
- Hata mesajları öğrencilerin CS bölümünü bırakmasına katkıda bulunan bir faktör olarak
  belgelenmiş (CHI 2021 https://dl.acm.org/doi/fullHtml/10.1145/3411764.3445696).
  101'de duygusal olarak çok işe yarar bir cümle.
- Julia Evans, Pocket Guide to Debugging: https://wizardzines.com/zines/debugging-guide/
- Real Python, traceback anatomisi: https://realpython.com/python-traceback/
  (Python'da **aşağıdan yukarı** okunur, çoğu dilde tersi)
- Egzersiz: kasıtlı 3 katmanlı hata → üçüncü parti kütüphane satırlarını atlayıp
  kendi dosyanı bulma.

## 9. AI'a iş yaptırmak — prompt değil, KABUL KRİTERİ
**Araştırmanın verdiği en net konum: "kabul kriteri" tam bu adla yazılmış bir kanon YOK.
101'in özgün katkı yapabileceği yer burası.** Dört ayrı kaynaktan birleştirilebilir:

1. **Addy Osmani, "How to write a good spec for AI agents"** — en doğrudan isabet:
   https://addyo.substack.com/p/how-to-write-a-good-spec-for-ai-agents
   Birebir: *"Think of it like the user story and acceptance criteria: Who is the user?
   What do they need? What does success look like?"*
   **Üç kademeli sınır sistemi — 101'e doğrudan alınabilir:**
   ✅ Her zaman yap (commit öncesi test çalıştır) / ⚠️ Önce sor (DB şema değişikliği) /
   🚫 Asla (secret commit'leme)
2. **Simon Willison, "Vibe engineering"** (7 Ekim 2025) — tezin teknik gerekçesi:
   *"If your project has a robust, comprehensive and stable test suite agentic coding tools
   can fly with it."* Test yoksa ajan başarı iddia eder ama bug bırakır.
   https://simonwillison.net/2025/Oct/7/vibe-engineering/
   Sorumluluk tanımı: *"Vibe coding is irresponsibly building software through dice rolls,
   not caring what code is produced."*
3. **GitHub Spec Kit** — kabul kriterini araca dönüştüren açık kaynak:
   https://github.com/github/spec-kit (Constitution → Spec → Plan → Tasks → Code)
4. **Uberto Barbini, Process Over Magic** (Pragmatic, Haz 2026) — ajanın **spektaküler hata
   yaptığı** gerçek oturumları gösteriyor, cilalı başarı hikâyeleri değil. Pedagojik olarak değerli.

**Bu bölümün en güçlü silahı — METR RCT (10 Tem 2025):**
16 deneyimli açık kaynak geliştirici, 246 issue, kendi repoları (22.000+ yıldız), Cursor Pro.
**AI kullanınca %19 DAHA YAVAŞ.** Ama öncesinde %24 hızlanma bekliyorlardı, sonrasında bile
%20 hızlandıklarına inanıyorlardı. https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/
⚠ **UYARI: METR kendi sonucunu "historical" etiketledi**, Şub 2026 ikinci deneyde
*"only very weak evidence"* dedi. **"AI yavaşlatıyor" DEME — çürütülürsün.**
Çürütülmeyen kısım: **algı uçurumu.** Sadece onu kullan.

**Slopsquatting — USENIX Security 2025, Spracklen et al.** (birincil PDF):
https://www.usenix.org/system/files/usenixsecurity25-spracklen.pdf
16 model, 2,23 milyon kod örneği; **440.445'i (%19,7) en az bir HAYALİ paket adı içeriyor.**
Ticari modellerde %5,2, açık kaynakta %21,7. Aynı prompt 10 kez çalıştırıldığında hayali
adların **%43'ü her seferinde tekrar çıkıyor** → saldırgan o adı önceden kaydedebiliyor.
2026 takibi: 5 modelin ortak uydurduğu 53 paket adı hâlâ kayıt için boştaydı (41 PyPI, 12 npm).
- Egzersiz: AI'ın önerdiği her `import` satırındaki paketi npm/PyPI'da ara.

## 10. "Çalışıyor" ne demek
- **Happy path testing** kavramı, ve rehberin tezine en yakın hazır cümle:
  *"Sadece happy path'i idare eden bir sistem demolarda çalışır, yüzeysel review'leri geçer
  ve production'da patlar."* https://www.ministryoftesting.com/software-testing-glossary/happy-path-testing
- **BOŞLUK:** "bir kez çalıştı = çalışıyor" için doğrudan akademik kaynak yok.
  METR + GitClear + happy path üçlüsü dolaylı kanıt.
- GitClear (211M satır, ~10.000 repo, 2020-2024): **Moved (refactor) satır %24,8 (2021) →
  %9,5 (2024).** 2024, copy/paste'in refactor'ü geçtiği ilk yıl.
  ⚠ 2026 rakamları (duplication +%81) **DOĞRULANMADI** — gitclear.com 403 verdi.
- Egzersiz: aynı işlemi 10 kez (aynı e-posta, boş form, çok uzun metin, emoji, art arda iki tık).
  Bir tanesi patlarsa "çalışıyor" değildi. Ve ikinci bir tarayıcıda/kullanıcıyla aç:
  A kullanıcısı B'nin verisini görüyor mu?

## 11. Kendi projeni teşhis et
**101 kapanış checklist'i — okuyucu kendi projesinde çalıştırıyor:**
1. Deploy edilmiş bundle'da `sk-` / `API_KEY` ara (Böl. 7)
2. Gizli sekmede aç — veri duruyor mu? (Böl. 6)
3. İkinci bir hesapla aç — birinin verisini diğeri görüyor mu?
4. `git log -p | grep -i secret` (Böl. 7)
5. AI'ın yazdığı her `import` paketini registry'de doğrula (Böl. 9)
6. Aynı akışı 10 kez, boş/uzun/emoji girdiyle (Böl. 10)
7. Telefonun mobil verisinden aç (Böl. 3+5)

## ⚠ 101'E EKLENMESİ GEREKENLER (araştırmadan çıktı)
- **Bağımlılıklar / paket yöneticisi — EN BÜYÜK EKSİK.** `npm install` ne yapıyor,
  `node_modules` nedir, lock file neden var. USENIX verisi bunu silahlandırıyor (%19,7).
  "Lokalde çalışıyor, deploy'da patlıyor"un bir numaralı sebebi. Bölüm 9 ve 5 bunu
  varsayıyor ama hiçbir yerde anlatılmıyor.
- **Version control / geri alma.** "AI bir şeyi bozdu, geri alamıyorum" — 101'in en yaygın
  acil durumu. Bölüm 7'de "sır git geçmişinde kalıyor" demek için de gerekli.
- **Ortamlar (dev/prod) ve config farkı.** Bölüm 3 (localhost) ile Bölüm 5 (deploy)
  arasında kavramsal uçurum var; onu dolduran şey "ortam" kavramı. Bu olmadan `.env`
  neden var anlaşılmıyor → Bölüm 7 havada kalıyor. **Sıra düzeltmesi: 5 ile 7 arasına girer.**
- **Kimlik doğrulama vs yetkilendirme.** Lovable CVE'sinin kökü tam bu: client'ta login
  ekranı vardı, sunucuda satır bazlı yetki yoktu. 101'e **"giriş ekranı güvenlik değildir"**
  tek cümlesi bile büyük katkı.
- **Loglar / "sunucu ne diyor".** Bölüm 8 sadece lokal terminaldeki hatayı öğretiyor.
  Deploy sonrası hata senin ekranında görünmüyor. Bölüm 5 ile 8 arasındaki kayıp halka.
- **Para / kuota / rate limit** — bir paragraf yeterli. (Eğitim kaynağı bulunamadı, BOŞLUK.)

---

# SLOPWARE 201 — ayağa kaldır

## 12. Git ve ortamlar
- **12-Factor X, Dev/prod parity** — "bende çalışıyordu"nun resmi tanımı:
  *"The twelve-factor developer resists the urge to use different backing services between
  development and production."* Sonucu: kod *"that worked and passed tests in development
  or staging to fail in production."* https://12factor.net/dev-prod-parity
  → SQLite'ta geliştirip Postgres'e deploy etmek = bu maddenin ihlali.
- **DORA, trunk-based development** (ölçülmüş): yüksek performanslılar *"three or fewer
  active branches"*, günde en az bir kez merge, *"branches typically last no more than a few
  hours."* https://dora.dev/capabilities/trunk-based-development/
- **VAKA — Knight Capital, 1 Ağustos 2012.** Yeni kod sekiz sunucudan **yedisine** kuruldu.
  Sekizincide 8 yıldır ölü duran "Power Peg" kodu tetiklendi. 45 dakikada ~440-460M $ zarar,
  firma 24 saatte battı. SEC'in tespiti: ikinci bir teknisyen değişikliği gözden geçirmedi ve
  **böyle bir gözden geçirmeyi zorunlu kılan yazılı prosedür yoktu.** Deploy sırasında gelen
  hata e-postaları sistem uyarısı olarak ele alınmadı.
  SEC 34-70694: https://www.sec.gov/files/litigation/admin/2013/34-70694.pdf
  ⚠ **PDF 403 verdi, paragraf numaralı birebir alıntı DOĞRULANMADI. Yayından önce
  tarayıcıdan açılıp §15-§30 teyit edilmeli.** Bu vaka 12, 14 ve 21'i birden taşıyor —
  tek doğrulanmamış kaynağa üç bölüm yaslanıyor, öncelik bu.

## 13. Ortam değişkeni ve .env
- 12-Factor III turnusol testi (yukarıda). Ve ince nokta: 12-Factor config'i
  `development`/`production` diye **isimli gruplara toplamayı anti-pattern sayıyor**
  (*"as more deploys are created, new environment names are necessary"*).
  → **Rehberde açıkça ele al:** dosya adı `.env.production` olabilir ama kod içinde
  `if (env === "production")` dallanması kurmak farklı bir şey ve 12-Factor bunu reddediyor.
  Kod ortam adını değil, tek tek değişkenleri okur. (Bölüm 12 ile görünürdeki çelişki budur.)
- Somut:
  ```
  # .gitignore — İLK satır, projeyi açtığın gün
  .env
  .env.*
  !.env.example
  ```
  Sızmışsa **sıralama kritik:** (1) ÖNCE anahtarı döndür, (2) SONRA geçmişten sök
  (`git filter-repo --path .env --invert-paths`). Temizlik yapıp anahtarı döndürmemek
  en sık hata — repo çoktan klonlanmıştır.
- **Ölçek — GitGuardian State of Secrets Sprawl:** 2024'te public GitHub'da **23,8 milyon**
  sızmış secret (+%25). `ENV` talimatları tek başına sızıntıların **%65'i**. 2022'de sızan
  secret'ların **%70'i hâlâ aktif.** https://blog.gitguardian.com/the-state-of-secrets-sprawl-2025/
  2026: **29 milyon** yeni hardcoded secret (+%34), AI servis anahtarlarında **+%81**.
  → **Sızıntı eğrisi AI kod üretimiyle dikleşiyor. Rehberin tezi için değerli.**

## 14. İlk gerçek deploy
- **Vercel Production Checklist** (güncel 2026-06-16): https://vercel.com/docs/production-checklist
  İlk madde doğrudan bu bölümün eksiği: *"Define an incident response plan... and rollback
  strategies for deployments"* · *"Familiarize yourself with how to stage, promote and
  rollback deployments"*
- **Deploy öncesi minimum kapı:**
  ```
  npm ci && npm run build      # prod build LOKALDE geçiyor mu (dev server kanıt değil)
  npm run start                # prod build'i lokalde ÇALIŞTIR
  vercel env ls production     # env var'lar platformda tanımlı mı — kod değil, panel
  vercel rollback <url>        # rollback'i deploy'dan ÖNCE dene
  ```
  **Dördüncü adım rehberin özgün katkısı:** rollback'i ilk kez olay anında öğrenmeyeceksin.
- Damla'nın vakası: `shortstorylong` (2272 konu) ve `missingsemicolon` (1206 gerçek mülakat
  sorusu) — ikisi de bitmiş, ikisi de Vercel'e import edilmemiş. **localhost cehennemi.**

## 15. Domain, DNS ve HTTPS
- Cloudflare DNS (8 adımlı lookup, dört sunucu tipi):
  https://www.cloudflare.com/learning/dns/what-is-dns/
  → "DNS değiştirdim ama site hâlâ eski"nin cevabı **TTL**.
- **Let's Encrypt gerçeği** (https://letsencrypt.org/how-it-works/): ücretsiz ve otomatik,
  ama **otomatik yenilenme senin kurduğun bir şey.** Sertifika 90 gün.
  **Az bilinen ve slopware için kritik olan:** sertifika **Certificate Transparency log'a**
  yazılıyor → `staging.seninsite.com` sertifikası alırsan **o isim herkese görünür**
  (crt.sh'ta aranabilir). **Gizli sandığın staging ortamı gizli değil.**
- Somut:
  ```
  dig +trace seninsite.com                    # otoritatif sunucuya sor, cache'e değil
  echo | openssl s_client -servername X -connect X:443 2>/dev/null \
    | openssl x509 -noout -dates              # sertifika ne zaman bitiyor
  curl -sI https://X | grep -i strict-transport-security
  ```
  Yenileme otomatikse bile **izleme otomatik değil** — bitime 20 gün kala uyaran kontrol kur.
- **VAKALAR:** Microsoft Teams (3 Şub 2020, auth sertifikası doldu, milyonlarca kullanıcı
  saatlerce giremedi) · Spotify (19 Ağu 2020, ~1 saat küresel) · Ericsson (Ara 2018, O2/Tesco/
  Sky/SoftBank, ~32M O2 abonesi ~24 saat).
  **Ortak payda — rehberin vurgusu:** üçünde de sorun **müşteriye bakmayan iç bileşenin**
  sertifikasıydı ve standart izlemenin dışındaydı.
  ⚠ Resmî postmortem'lere ulaşılamadı (MS admin portalı arkasında, Spotify yayınlamadı).
  Tarih/etki haber kaynaklarından. **DOĞRULANMADI.**

## 16. Veritabanı bağlamak
- **Supabase, Going into Production** — en kritik madde birebir: *"Ensure you have enabled
  row level security (RLS) on all tables"* https://supabase.com/docs/guides/deployment/going-into-prod
  ⚠ **Free Plan'da YEDEK YOK** ve proje 7 gün hareketsizlikte duraklatılıyor.
  → Bölüm 19'un tamamı okuyucu Free Plan'daysa havada kalır. Rehber bunu açıkça söylemeli.
- Deploy öncesi zorunlu sorgu:
  ```sql
  select schemaname, tablename, rowsecurity from pg_tables
  where schemaname = 'public' and rowsecurity = false;
  ```
- **Kalın yazılacak:** `anon` key istemciye gömülür ve **halka açıktır, gizli değildir** —
  güvenliği sağlayan şey anahtar değil, **RLS**'tir. `service_role` key RLS'i **tamamen atlar**;
  tarayıcıya, `NEXT_PUBLIC_*`'a, mobil binary'ye asla konmaz.
- **VAKA 1 — CVE-2025-48757 (Lovable, May 2025).** 1.645 projeden **170'i (%10,3)** veri
  sızdırıyordu; e-posta, ev adresi, telefon, abonelik/ödeme kayıtları, API anahtarları.
  Saldırganın özel kimlik bilgisine ihtiyacı yoktu: istemciye gömülü public `anon` key ile
  doğrudan sorgu. CVSS 9.3. https://mattpalmer.io/posts/2025/05/statement-on-CVE-2025-48757/
  **Asıl ders (çoğu anlatım kaçırıyor):** Lovable'ın güvenlik taraması bir RLS politikasının
  **var olduğunu** kontrol ediyor, **bir şeyi kısıtladığını** değil. `USING (true)` yazan tablo
  **yeşil tik alıp dünyaya açık kalıyor. Yeşil tik = güvenlik değil.**
  ⚠ Bulan kişi Matt Palmer, **Replit çalışanı** — rakip. Bunu sen söyle, karşı taraf söylemesin.
  Lovable CVE'ye itiraz etti (disputed) — dürüstlük için bu da yazılmalı.
- **VAKA 2 — Tea app, 25-26 Tem 2025.** Kimlik doğrulaması olmadan erişilen Firebase bucket:
  ~72.000 görsel, 13.000'i **selfie ve kimlik belgesi**; birkaç gün sonra ikinci açık veritabanı,
  **1,1 milyondan fazla özel mesaj.**
  ⚠⚠ **Tea'yi "vibe coding vakası" diye ANLATMA.** AI ile üretildiğine dair birincil kanıt yok;
  kurucu Sean Cook kod bilmediğini ve uygulamayı **Brezilya'daki iki geliştiricinin** yazdığını
  söylemiş. **"Cloud misconfiguration" vakası olarak kullan, o taraf sağlam.**

## 17. Şema ve indeks
- **Markus Winand, Use The Index, Luke!** — indeks = çift yönlü bağlı liste + arama ağacı.
  Merkezî tez rehbere uyuyor: **indeksleme DBA işi değil, geliştirici işi** — indeks tasarımı
  sorgunun nasıl yazıldığından ayrılamaz. https://use-the-index-luke.com/sql/anatomy
- Somut: `explain (analyze, buffers)` ile **planı oku, tahmin etme.** "Seq Scan" görürsen indeks yok.
  Üretimde indeks **her zaman** `CREATE INDEX CONCURRENTLY`.
  Kullanılmayanı bul: `select relname, indexrelname, idx_scan from pg_stat_user_indexes where idx_scan = 0;`
- **PostgreSQL dokümanından, `CONCURRENTLY`'nin tuzağı (birebir):** *"the CREATE INDEX command
  will fail but leave behind an 'invalid' index. This index will be ignored for querying purposes
  because it might be incomplete; however it will still consume update overhead."*
  → **Başarısız CONCURRENTLY en kötü durumu bırakır: sorguya faydası yok, yazmaya maliyeti var.**
  Kontrol: `select indexrelid::regclass from pg_index where indisvalid = false;`
  Ve: transaction bloğu içinde çalışmaz — `disable_ddl_transaction` unutan herkesi vurur.
- Bileşik indekste sütun sırası: soldan-önek kuralı.

## 18. Migration
- **Fowler, ParallelChange** (Kerievsky 2006): expand → migrate → contract.
  https://martinfowler.com/bliki/ParallelChange.html
  **Evolutionary Database Design:** *"All database changes are migrations"*, hepsi uygulama
  koduyla **aynı repoda** versiyonlanır. https://martinfowler.com/articles/evodb.html
- **Sütun yeniden adlandırma — en tehlikeli işlem, dört deploy:**
  ```sql
  -- YANLIŞ, tek satır: alter table users rename column name to full_name;  → eski kod anında patlar

  -- 1 EXPAND: yeni sütun, NOT NULL YOK, DEFAULT YOK (rewrite tetiklemez)
  alter table users add column full_name text;
  -- 2 ÇİFT YAZMA: uygulama her iki sütuna da yazar (kod deploy'u) ya da geçici trigger
  -- 3 BACKFILL parti parti — TEK BİR UPDATE ASLA (tüm satırları kilitler, WAL'i şişirir)
  --   limit 5000 döngüsü + her partiyi ayrı commit + pg_sleep(0.1) throttle
  -- 4 CONTRACT: ancak eski sütuna yazan kod TAMAMEN gittikten sonra
  alter table users drop column name;
  ```
- **Her migration'ın başına, istisnasız:** `set lock_timeout = '5s'; set statement_timeout = '1h';`
  Squawk'un gerekçesi: kilit alamayan migration iptal edilir, bekleyen sorgular ilerler.
  *"You should retry a migration that hits the lock timeout until it succeeds."*
  Kısa lock_timeout + uzun statement_timeout = hızlı vazgeç, ama iş başladıysa bitsin.
  https://squawkhq.com/docs/safe_migrations
- **strong_migrations tehlike tablosu** (rehbere tablo olarak girer):
  sütun silme · tip değiştirme · yeniden adlandırma · CONCURRENTLY'siz index ·
  var olan sütuna NOT NULL · volatil DEFAULT ile sütun ekleme (`gen_random_uuid()`).
  https://github.com/ankane/strong_migrations
- ⚠ **BOŞLUK: migration'a özgü, birincil kaynaklı, yayımlanmış felaket postmortem'i
  BULUNAMADI.** En yakını Cloudflare Kas 2025'in DB **izin** değişikliğiyle başlaması.

## 19. Yedek ve geri yükleme
- **Google SRE Book Böl. 26 — muhtemelen tüm rehberin en iyi tek cümlesi:**
  *"No one really WANTS to make backups; what people REALLY want are RESTORES."*
  Ve: *"you only know that you can recover your recent state if you actually do so"*
  https://sre.google/sre-book/data-integrity/
  Üç katman: soft deletion → backups/recovery → **early detection.**
- **PostgreSQL PITR, atlanan adım (birebir):** *"you should set up and test your procedure
  for archiving WAL files BEFORE you take your first base backup."*
- **Geri yükleme NASIL TEST EDİLİR** (yedeğin var olması kanıt değil, restore çıktısı kanıttır):
  ```bash
  pg_dump -Fc -d "$DATABASE_URL" -f backup.dump
  [ $? -eq 0 ] || { echo "YEDEK BAŞARISIZ"; exit 1; }   # çıkış kodunu kontrol et
  ls -lh backup.dump                                    # 0 byte bir yedek "yedek" değildir
  createdb restore_test && pg_restore -d restore_test --exit-on-error backup.dump
  psql -d restore_test -c "select count(*) from users;" # restore'un bitmesi yetmez, İÇERİĞİ SAY
  psql -d restore_test -c "select max(created_at) from orders;"  # RPO'nu ölçer
  ```
  Cron'da çalışsın ve **başarısızlıkta gürültü çıkarsın.** İki sayıyı bil: **RPO** ve **RTO**.
  İkisini de bilmiyorsan yedeğin yok, dosyan var.
- **VAKA — GitLab.com, 31 Ocak 2017. Rehberin merkez vakası.**
  Bir mühendis yanlış sunucuda dizin sildi. Sonra **beş kurtarma yolunun beşi de tutmadı:**
  1. `pg_dump` 9.2 kullanılıyordu, veritabanı 9.6'ydı → **yedekler aylardır boştu.**
  2. Birebir: *"Notifications were sent upon failure, but because of the Emails being rejected
     there was no indication of failure."* — DMARC ayarlanmadığı için **hata alarmı da
     sessizce başarısız oluyordu.**
  3. Azure disk snapshot'ları veritabanı sunucuları için hiç etkinleştirilmemişti.
  4. LVM snapshot'ları 24 saatte bir.
  5. Secondary zaten silinmişti; staging kopyası **6 saat eskiydi.**
  Kayıp: ~5.000 proje, 5.000 yorum, 700 yeni kullanıcı.
  https://about.gitlab.com/blog/postmortem-of-database-outage-of-january-31/
  **Dersi tek cümlede: GitLab'ın yedeği yoktu ve yedeğinin olmadığını bilmiyordu.
  İkinci kısım birincisinden beter.**
  ⚠ Her iki GitLab sayfası **403** verdi, arşiv erişilemiyor. Alıntılar arama motorunun
  indekslediği pasajlardan. **Yayından önce tarayıcıdan birebir teyit edilmeli.**

## 20. Hata yönetimi (sessiz catch)
- **OWASP A10:2025 — Mishandling of Exceptional Conditions.** 2025'in YENİ kategorisi, 24 CWE.
  Üç ayrı başarısızlık: olağandışı durumu **önleyememek**, oluştuğunda **fark edememek**,
  sonrasında **kötü yanıt vermek.** https://owasp.org/Top10/2025/A10_2025-Mishandling_of_Exceptional_Conditions/
  Rakamlar: ort. exploit şiddeti 7.11 · toplam görülme 769.581 · toplam CVE 3.416.
  Öne çıkan: CWE-209 (hata mesajında hassas bilgi), CWE-476, **CWE-636 (fail open).**
  Önleme (birebir): hataları **kaynağında** yakala · global handler **emniyet ağı** olarak
  (ana savunma değil) · kısmi kurtarma yerine **transaction rollback** (*"failing closed"*).
  → **Zamanlama avantajı: bu konu OWASP Top 10'a DAHA GEÇEN YIL girdi. Okuyucu eski
  kaynaklarda bulamaz.**
- **CWE-636, fail open vs fail closed:** zayıflatılmış duruma düşen sistem *"inherits the
  weaknesses associated with that state"* ve yöneticide **sahte bir güvenlik hissi** yaratır.
  **Bölümün asıl değeri olan nüans:** "her zaman fail closed" tek başına yanlış cevap.
  Doğru kural: **güvenlik kararlarında fail closed** (auth kontrolü hata verdiyse REDDET),
  **kritik olmayan özellikte fail open ama GÖRÜNÜR** (öneri motoru çöktüyse boş göster,
  log at, alarm ver). Kabul edilemez üçüncü seçenek: `catch {}` — **sessiz catch, hangisini
  seçtiğini bilmeden ikisini de yapmandır.**
- Üç kural: (1) yuttuğun her exception bir veri kaybı adayıdır; (2) kullanıcıya gösterdiğin
  mesaj stack trace içermez (CWE-209) ama log'da tam zincir durur; (3) `catch` bloğunda
  hiçbir şey yapmıyorsan o `try`'ı yazma.
  Lint ile zorla: `"no-empty": ["error", { "allowEmptyCatch": false }]` ve
  `"@typescript-eslint/no-floating-promises": "error"` (await'siz promise = sessiz hata).
- **VAKA — Cloudflare, 18 Kasım 2025. 2019'dan beri en kötü kesintileri, ve tam bir hata
  yönetimi vakası.** ClickHouse'ta rutin bir **izin** değişikliği → sorgu yinelenmiş sütun
  metadata'sı döndürdü → Bot Management özellik dosyası ikiye katlandı → Rust kodundaki
  sabit sınır (200) aşıldı → kod graceful degrade etmedi, **panikledi:**
  `thread fl2_worker_thread panicked: called Result::unwrap() on an Err value`
  **Tek bir `.unwrap()` dünyanın trafiğinin önemli bir kısmını durdurdu. Altı saat.**
  Öğretici ayrıntı: izinler kademeli yayıldığı için *"every five minutes there was a chance of
  either a good or a bad set of configuration files"* — sistem düzelip tekrar bozuldu, ekip
  bunun bir **saldırı** olduğunu düşündü. Aynı anda status sayfası da düştü (Cloudflare
  altyapısında değil, tesadüf) → saldırı şüphesi güçlendi.
  Cloudflare'ın kendi dersleri, dördü de bu bölümün maddesi — özellikle:
  *"Reviewing failure modes for error conditions across all core proxy modules"* ve
  ⚠ *"Eliminating the ability for core dumps or error reports to overwhelm system resources"*
  → **ikinci dereceden ders: hata raporlamanın KENDİSİ sistemi boğabilir.** "Her şeyi logla"
  tavsiyesi verilecekse bu uyarı yanında durmalı. https://blog.cloudflare.com/18-november-2025-outage/
- Damla'nın vakası: `shortstorylong/src/app/api/suggest/route.ts:46` sessiz
  `catch { return false }` vs `stitchu/web/js/missing.js` — *"SINGLE SOURCE of honesty"*.

## 21. Test ve CI
- **Fowler, CI:** *"nobody has a higher priority task than fixing the build."*
  Bozuk build'in doğru cevabı çoğu zaman düzeltmek değil, **revert etmek.**
  Kent Beck: *"No code sits unintegrated for more than a couple of hours."*
  https://martinfowler.com/articles/continuousIntegration.html
- **Test piramidi**, kaçınılacak anti-pattern: *"test ice-cream cone"* — çoğunluğu yavaş
  E2E'den oluşan, sürekli flake veren, kimsenin güvenmediği takım.
  https://martinfowler.com/articles/practical-test-pyramid.html
- **Minimum işe yarar CI** (`.github/workflows/ci.yml`): `services: postgres:16`
  (**CI'da SQLite kullanma, prod'daki motoru kullan** — 12-Factor X), `npm ci` (install değil),
  lint → migrate (**temiz bir DB'de geçiyor mu**) → test → build.
  **`main`'de branch protection: bu iş yeşil olmadan merge yok.** Bu tek ayar CI'ı
  "rapor"dan "kapı"ya çevirir — aksi halde kırmızı CI'lı repo CI'sız repodan farksızdır,
  sadece yalan söyler.
- **İlk yazılacak test, en yüksek getirili:** uygulama ayağa kalkıyor mu + sağlık ucu 200
  dönüyor mu. **Slopware'in çoğu bu tek testte ölür.**
- Damla'nın vakası: `gymgyme/package.json` → `"test": "echo \"Error: no test specified\" && exit 1"`
  vs `lulumelon` 986 pytest + 52 node.

## ⚠ 201'E EKLENMESİ GEREKENLER
1. **Rollback / geri alma — en büyük eksik.** Bölüm 14 deploy'u anlatıyor, "nasıl geri
   alırsın"ı kimse anlatmıyor. Vercel checklist'inde **birinci madde.** Bölüm 19 verinin,
   ama **kodun** geri alınmasını kimse kapsamıyor. Knight'ın 45 dakikada yapamadığı buydu.
   ⚠ **18 ile kritik bağ: `contract` fazı çalıştıktan sonra kod rollback'i artık GÜVENLİ
   DEĞİLDİR** — eski kod olmayan sütunu arar. Okuyucunun kendi keşfetmesi çok pahalı.
2. **İzleme / alarm — sessiz başarısızlığın diğer yarısı.** GitLab'ın dersi "yedek al" değil,
   **"yedeğinin çalıştığını duyacak bir kanalın olsun."** Sistem bağırıyordu, kimse duymuyordu.
   En az: uptime kontrolü + hata izleme + **alarm kanalının KENDİSİNİN test edilmesi**
   (kasten hata fırlat, bildirim geliyor mu bak).
3. **Staging ve ortam parity.** Vercel preview modeli (+ Deployment Protection, çünkü
   preview URL'ler varsayılan olarak halka açık). 15'teki CT log detayıyla kesişiyor.
4. Feature flag / deploy ile release'i ayırmak — 301'e ertelenebilir, 12'de tek paragraf.
5. **Bağımlılık:** `npm ci` vs `npm install`, lockfile commit. Slopware'in klasik ölümü:
   6 ay sonra `npm install` çalışmıyor.
6. **Bağlantı havuzu:** serverless + Postgres = her çağrı yeni bağlantı = `too many connections`.
   Lokalde asla görülmez, ilk trafikte görünür — tam bir slopware tuzağı.
   ⚠ **DOĞRULANMADI** — Supabase pooler/PgBouncer dokümanı çekilmedi.

## ⚠ 201 — YAYINDAN ÖNCE KAPATILACAK DOĞRULAMA BORÇLARI
| Kaynak | Durum |
|---|---|
| GitLab postmortem (2 URL) | **403**, arşiv de yok → tarayıcıdan aç, DMARC + pg_dump 9.2/9.6 alıntılarını teyit et |
| SEC 34-70694 (Knight) | **403** → 12, 14, 21'in üçü birden buna yaslanıyor, ÖNCELİK |
| CVE-2025-48757 NVD | CVSS 9.3 ikincil kaynaktan |
| Teams/Spotify/Ericsson postmortem | Resmî yok/kapalı |
| Migration felaketi postmortem | **Bulunamadı** |

---

# SLOPWARE 301 — gerçek kullanıcı ve saldırgan

22. Auth · 23. Yetkilendirme ve RLS (EN KRİTİK) · 24. Girdi güvenilmezdir ·
25. Bağımlılık zinciri · 26. LLM'li ürünün güvenliği · 27. Rate limit ·
28. Ölçek (N+1, bağlantı havuzu, önbellek) · 29. Log ve alarm · 30. İzleme · 31. Maliyet kontrolü

---

## ✅ BÖLÜM 23 — YETKİLENDİRME VE RLS (kurtarılan araştırmadan doldu)
Kaynak: `KURTARILAN-ARASTIRMA.md` Rapor 40. Hepsi Supabase'in kendi dokümanından.

**Bölümün tek cümlesi (Supabase'in kendi ifadesi):**
> *"A table in an exposed schema without RLS is readable and writable by anyone with your
> publishable key."* — ve `public` şeması **varsayılan olarak açık.**

⭐ **AI kod üretiminin tam olarak düştüğü boşluk, ve bunu Supabase kendisi belgeliyor:**
**Table Editor RLS'i otomatik açıyor. Raw SQL / SQL Editor AÇMIYOR.**
Model migration'a `create table ...` yazıyor ve `alter table ... enable row level security;`
satırını **hiç üretmiyor.** Bölüm 23'ün kalbi bu tek gözlem.

**⭐ GRANTS ≠ POLICIES — neredeyse kimsenin bilmediği, "RLS'i aç"tan çok daha keskin nokta:**
İki bağımsız kontrol var. **Grants** o rolün işlemi yapıp yapamayacağına karar verir;
**policies** hangi satırları göreceğine. **Mükemmel RLS politikası yazılmış bir tablo,
`anon`'a verilmiş `GRANT` hiç geri alınmadıysa hâlâ açıktır.**
AI kod üretimi grants'a hiç dokunmuyor. İkisini birden kurman gerekiyor.

**Anahtarların gerçeği (isim değişti, 2025):**
| Tip | Format | Yetki |
|---|---|---|
| Publishable | `sb_publishable_...` | Düşük — *"Safe to expose online"* |
| Secret | `sb_secret_...` | **RLS'i tamamen atlar** (`BYPASSRLS`) |
| `anon` (eski) | JWT | publishable'ın eski hali |
| `service_role` (eski) | JWT | secret'ın eski hali |

**Yeni anahtarlar JWT DEĞİL** — opak token. Enforcement hâlâ Postgres rolleri + RLS üzerinden.
⚠ **Sessizce kıran üç şey** (migration kılavuzundan, birebir): (1) *"You can't send a
publishable or secret key in the `Authorization: Bearer ...` header. Send it on the `apikey`
header instead."* (2) Edge Functions yeni anahtarlarda `apikey` header'ını **doğrulamıyor** —
`verify_jwt = false` ve yetkilendirmeyi kodda yap. (3) Public Realtime bağlantıları 24 saatle
sınırlı. → **Yarım migration, bir isim değişikliğini yetki açığına çevirir.**

**Splinter linter — Supabase'in kendi denetleyicisi. ERROR seviyesindeki 6 kural:**
`0002 auth_users_exposed` · `0010 security_definer_view` (view RLS'i atlıyor, düzeltme:
`with (security_invoker=on)`) · **`0013 rls_disabled_in_public`** — birebir metni:
*"Anyone with your project URL can read, edit, and delete all data in this table because
Row-Level Security is not enabled."* · `0015 rls_references_user_metadata` ·
`0019 insecure_queue_exposed_in_api` · `0021 fkey_to_auth_unique` · `0023 sensitive_columns_exposed`
⚠ **`0025 public_bucket_allows_listing`** — **public Storage bucket'ları tablo kadar sızdırıyor
ve bu konuşmada kimse bahsetmedi.** Bölüme mutlaka girsin.

**Supabase'in yanıt olarak yaptıkları (2025 Security Retro):** Dashboard'da yaratılan tablolarda
RLS varsayılan açık · RLS'siz tablolara **uyarı etiketi** · korumasız tablo yaratılınca
**proje sahibine e-posta** · GitHub Secret Scanning entegrasyonu (public repo'da bulunan secret
key **anında iptal ediliyor**) · HackerOne: 96 araştırmacıdan 139 rapor çözüldü, medyan ilk
yanıt 8 saat.
⚠ Supabase **kaç public projenin RLS'i kapalı ölçen bir çalışma YAYINLAMADI.** Retro bir
duruş yazısı, ölçüm değil. **DOĞRULANMADI.**

**⭐ Bölüm 27 için hazır tablo — Supabase auth rate limitleri (birebir dokümandan):**
| İşlem | Sınır | Değiştirilebilir? |
|---|---|---|
| E-posta gönderen uçlar | **saatte 2 e-posta** (yerleşik sağlayıcı) | Sadece custom SMTP ile |
| OTP gönderimi | saatte 30 | Evet |
| OTP/magic link, kullanıcı başına | 60 saniye penceresi | Evet |
| `/auth/v1/verify` | **saatte 360 (IP başına)** | **HAYIR** |
| `/auth/v1/token` | **saatte 1800 (IP başına)** | **HAYIR** |
| MFA challenge | saatte 15 | **HAYIR** |
| Anonim giriş | saatte 30 | **HAYIR** |
⚠ **DÜZELTME: 4/saat değil, dokümanda bugün 2/saat yazıyor.** Dışarıda **2** de.
⚠ `/auth/v1/token` = 1800/saat/IP, **ortak NAT arkasındaki ya da server-side render katmanı
olan uygulamayı vurur** — herkes tek çıkış IP'sini paylaşır.

**JWT imzalama anahtarları (Tem 2025'ten beri asimetrik):** ES256 önerilen; HS256
*"Not recommended for production."* JWKS edge'de **10 dakika** cache'leniyor →
⚠ **bir anahtarı iptal etmeden önce en az 20 dakika bekle**, yoksa geçerli kullanıcıları
oturumdan atarsın. Rotasyon 4 durumlu ve **geri alınabilir.**
⚠ **Kıran şey:** elle `jwt.verify(token, SUPABASE_JWT_SECRET)` yazan her backend — ki bu
vibecoded backend'lerde son derece yaygın.
Zaman çizelgesi: 1 May 2025 sonrası projeler RSA · **1 Eki 2025'ten sonra tüm yeni projeler
asimetrik varsayılan.** Eski `anon`/`service_role` **2026 sonunda siliniyor** (kesin gün
**TBC**, dolaşan "31 Aralık 2026" bir çıkarım — **DOĞRULANMADI**).

**⭐ VAKA — Lovable'ın İKİNCİSİ, Nisan 2026. Elimdeki en taze ve en alıntılanabilir şey:**
BOLA (Broken Object Level Authorization). Aynı araştırmacı, Matt Palmer. HackerOne'a
3 Mart 2026'da bildirildi, **48 gün** beklendikten sonra 21 Nisan'da açıklandı.
Araştırmacının birebir sözü: *"I made a Lovable account today and was able to access another
user's source code, database credentials, AI chat histories, and customer data"* —
**ücretsiz bir hesaptan beş API çağrısıyla.**
Lovable Mart'ta yamaladı ama **sadece Kasım 2025'ten SONRA yaratılan projeler için** —
öncesi açık kaldı. Kök sebep Şubat 2026: *"accidentally re-enabled access to chats on public
projects during backend permissions unification."*
⚠ **HackerOne takip raporunu "duplicate" diye kapattı.** Lovable'ın kendi ifadesi: raporlar
*"were closed without escalation because our HackerOne partners thought that seeing public
projects' chats was the intended behaviour."*
Lovable'ın yanıt yayı: *"We did not suffer a data breach"* → dokümantasyonu suçladı →
*"intentional behaviour"* dedi → sonunda *"We understand that pointing to documentation
issues alone was not enough here. We'll do better."*
Platformdaki müşteriler: **Uber, Zendesk, Deutsche Telekom.**
https://www.theregister.com/2026/04/20/lovable_denies_data_leak/
⚠ Kaynakta tarih çelişkisi var (3 Mart 2025 mi 2026 mı) — **alıntılamadan önce doğrula.**

**CVE-2025-48757 — NVD'den kesinleşen ayrıntılar:** *"An insufficient database Row-Level
Security policy in Lovable through 2025-04-15 allows remote unauthenticated attackers to read
or write to arbitrary database tables."* **CVSS 9.3 CRITICAL**, CWE-863. Puan **MITRE'den
CNA olarak** geldi — **NVD kendi değerlendirmesini yapmadı.** "Disputed" etiketli; satıcı
sorumluluğun müşteride olduğunu savunuyor. **Yama: "None available."**
⚠ **"303 endpoint / 170 proje" rakamı ikincil özetlerden** — Palmer'ın kendi yazısı örneklem
büyüklüğü yayınlamıyor, "all versions" diyor. **DOĞRULANMADI.**
⚠ **"%70'inde RLS kapalı" ve "%91,5" ve "380.000 uygulama" — hepsi kaynaksız. KULLANMA.**
⚠ Wiz'in "%20" rakamı **Lovable ile İŞBİRLİĞİ içinde** yapılmış vendor araştırması, paydası
Wiz'in kendi telemetrisi — rastgele örneklem değil. Taksonomisi kullanışlı, sayısı değil.

**Guardio VibeScamming Benchmark (Nis 2025)** — yüksek = daha dirençli:
**ChatGPT 8/10 · Claude 4.3/10 · Lovable 1.8/10.** Lovable *"stood out in all the wrong ways"* —
prompt'la piksel mükemmel dolandırıcılık sayfası, canlı hosting, kaçınma teknikleri ve
çalınan kimlik bilgilerini takip eden admin paneli. Claude *"started with solid pushback but
proved easily persuadable"* ("güvenlik araştırması" çerçevesiyle).

---

## ✅ BÖLÜM 31 — MALİYET KONTROLÜ (kurtarılan araştırmadan doldu)
Kaynak: `KURTARILAN-ARASTIRMA.md` Rapor 2 ve 5. Hepsi canlı resmi dokümandan.

### ⭐⭐ BÖLÜMÜN AÇILIŞI: DAMLA'NIN KENDİ VAKASI, 18 AĞUSTOS 2026
**4 ajan saldım. 497 ajan koştu. 423'ü limitte sıfır çıktıyla öldü. Haftalık limitin %20'si gitti.**
Sebebi bu bölümün konusu ve **birincil kaynakla belgeli:**

> **Claude Agent SDK varsayılan olarak tur limiti OLMADAN geliyor.**
> `maxTurns` / `max_turns` → tip `number`, **varsayılan `undefined` / `None` = sınırsız.**
> https://code.claude.com/docs/en/agent-sdk/typescript

**Karşılaştır:** OpenAI Agents SDK'da `DEFAULT_MAX_TURNS = 10` — **varsayılan olarak sınırlı**
(kaynak: `openai-agents-python/src/agents/run_config.py`). Aşılınca `MaxTurnsExceeded` fırlatıyor.
→ **Biri varsayılan güvenli, diğeri varsayılan sınırsız. Fark bir konfigürasyon satırı,
bedeli senin haftalık limitin.**

⭐ **Ve daha iyi bir kontrol var, kimse bilmiyor:** `maxBudgetUsd` / `max_budget_usd` —
*"Stop the query when the client-side cost estimate reaches this USD value."*
**Tur sayısı değil, DOLAR cinsinden tavan.** OpenAI'da karşılığı yok.
Sonlanma gözlemlenebilir: `terminal_reason` ∈ `completed` / **`max_turns`** /
**`max_budget_usd`** / `api_error` / `aborted_tools`.

**Anthropic'in kendi mühendislik yazısının tek ilgili cümlesi (birebir):**
> *"it's also common to include stopping conditions (such as a maximum number of iterations)
> to maintain control"* — ve *"The autonomous nature of agents means higher costs, and the
> potential for compounding errors."* **Hiçbir yerde sayı verilmiyor.**
https://www.anthropic.com/engineering/building-effective-agents

⚠ **İkinci dereceden tuzak:** `stop_reason: pause_turn` = *"A server-tool loop reached its
iteration limit. Send the assistant content back to continue."* → **kendi sayacın olmadan
`pause_turn`'de körlemesine devam etmek, sınırsız döngü riskinin ta kendisi.**

### Sessizce parayı yiyen 6 şey (hiçbir rehberde yok)
1. **Data residency çarpanı:** `inference_geo: "us"` = **her şeyde 1.1x** (girdi, çıktı,
   cache yazma, cache okuma). **Sessiz %10 zam.**
2. **Fast mode:** Opus 5 / 4.8 → `$10 in / $50 out` (**2x standart**). Batch API'de yok.
   Opus 4.7'de hata veriyor; ⚠ **Opus 4.6'da sessizce standart hızda ve standart fiyatta
   çalışıyor** — para ödeyip hiçbir şey almıyorsun.
3. **Araç bağlamanın gizli maliyeti, modele göre değişiyor:** Opus 4.7'de sadece araçların
   bağlı olması **675 token** (`auto`/`none`) ya da **804** (`any`/`tool`); Opus 5'te 286/406.
   **İki Opus kuşağı arasında ~2.4x gizli istek başı fark.** Bash +325, text editor +700,
   computer use +735 artı 466–499 sistem token'ı.
4. **Sunucu araçlarının fiyatı:** web search **1.000 arama başına $10** · web fetch token
   dışında ücretsiz · code execution ayda 1.550 ücretsiz konteyner-saat, sonra
   **$0.05/saat**, 5 dakika minimum faturalama, ⚠ **dosya ekliyse araç çağrılmasa bile
   faturalanıyor.**
5. **Claude Managed Agents** token'ın üstüne ayrıca **oturum-saati başına $0.08.**
   Batch indirimi ona uygulanmıyor.
6. ⭐ **Sonnet 5 kalıcı olarak $2/$10** — 1 Eyl 2026'ya planlanan $3/$15 zammı iptal edildi.
   **Sonnet 5 artık Sonnet 4.6'dan ($3/$15) ucuz ve max çıktısı daha büyük.
   Hâlâ Sonnet 4.6'da olan %50 fazla ödüyor.**

### Faturayı gerçekten kesen tek mekanizma: AWS Budget Actions
AWS'in üç kademeli reçetesi — ve **ikinci kademe, "sadece bildirir"i "keser"e çeviren yer:**
1. **Bildir** — AWS Budgets, hesap/servis/tag/AZ bazında.
2. ⭐ **Otomatik uygulama** — *"AWS Budget Actions ... can enforce specific IAM or SCP
   policies, or **stop target Amazon EC2 or Amazon RDS instances**, and Budget Actions can be
   started automatically or require workflow approval."* **Eşik aşılınca gerçekten kapatan
   kanonik desen bu.**
3. **Anomali tespiti** — ML tabanlı AWS Cost Anomaly Detection.
→ **Karşılaştırma cümlesi:** Firebase *"budget alerts do NOT turn off services"*, Cloudflare'de
Durable Objects için limit yok, ama **AWS Budget Actions gerçekten kapatıyor.**
**Rehberin "keser mi, bildirir mi" tablosunun omurgası bu.**

### Ucuzlatan üç kaldıraç (doğru kullanılırsa)
- **Prompt caching:** cache okuma **0.1x** (hem Anthropic hem OpenAI'da aynı çarpan).
  Anthropic'te yazma bedeli var (5dk **1.25x**, 1saat **2x**), OpenAI'da **yazma bedeli yok**,
  otomatik. Anthropic'in kendi başabaş cümlesi: *"caching pays off after one cache read for
  the 5-minute duration, or after two cache reads for the 1-hour duration."*
  ⚠ **Minimum uzunluğun altındaki prompt sessizce cache'lenmiyor:** *"Any requests to cache
  fewer than this number of tokens will be processed without caching, **and no error is
  returned**."* — 512 token (Opus 5/Fable 5), 1.024 (Sonnet 5, Haiku 4.5), 4.096 (Opus 4.6/4.5).
  ⚠ **TTL saati isteğin BAŞINDAN işliyor**, yanıtın sonundan değil.
- **Batch API: %50 indirim**, ikisinde de. Anthropic 100k istek/256MB, ~1 saatte biter,
  24 saatte bitmezse **faturalanmıyor.** OpenAI 50k istek, sadece 24h penceresi.
  ⚠ Batch'te cache isabeti **en iyi çaba**: *"cache hit rates ranging from 30% to 98%."*
  Batch için 1 saatlik TTL öneriliyor.
- **Token sayma ÜCRETSİZ:** `POST /v1/messages/count_tokens`, *"free to use"*, ayrı rate limit
  (Start 2.000 RPM). ⚠ **Tahmindir**, cache mantığını kullanmaz. ⚠ **Claude 4.7+ yeni
  tokenizer kullanıyor: aynı metin ~%30 daha fazla token.** Kuşaklar arası sayı taşıma.
  **OpenAI'da token sayma endpoint'i YOK** — `tiktoken` var, o da araç/sistem yükünü saymıyor.

---

**Eldeki diğer doğrulanmış malzeme:**
- **OWASP Top 10:2025 tam liste** — A01 Broken Access Control (yine #1, SSRF buraya alındı) ·
  A02 Security Misconfiguration (2021'de #5 → 2025'te **#2**) · **A03 Software Supply Chain
  Failures (YENİ)** · A04 Cryptographic · A05 Injection · A06 Insecure Design ·
  A07 Authentication · A08 Integrity · A09 Logging **and Alerting** Failures ·
  **A10 Mishandling of Exceptional Conditions (YENİ)**. https://owasp.org/Top10/2025/
- **arXiv 2606.23130** (Haz 2026), "(In)Security of Vibe-Coded Applications": 10.517 uygulama
  toplandı, 200'ü denetlendi → 1.471 açık. **Repoların %90'ında en az bir açık**, %76,7'si
  critical/high. **Broken Access Control %75,5 vs OWASP tabanı %3,74 — YİRMİ KAT.**
- **Symbiotic Security** (2 Haz 2026): 1.085 doğrulanmış site → 6.185 açık, **%98'inde en az
  bir açık**, sadece 26 site temiz. 172 sitede auth olmadan public key ile `DELETE`;
  39 sitede tablolar tamamen okunabiliyor. Platformlar: Lovable, v0, Bolt, Replit, Windsurf,
  Tempo — **hepsi Supabase backend.** ⚠ tarama satan şirket, platform karşılaştırması yapma.
- **Base44 (Wix) auth bypass** — Wiz Research, 9 Tem 2025. İki endpoint **hiç authentication
  istemiyordu**; `app_id` gizli değil, **uygulamanın URL'inde ve `manifest.json`'da duruyor**
  → herkes özel uygulamada doğrulanmış hesap açıp **SSO dahil tüm auth'u atlayabiliyordu.**
  Etkilenenler iç chatbot'lar, bilgi tabanları, **İK ve PII sistemleri** — "iç araç, önemli değil"
  denilenler. https://www.wiz.io/blog/critical-vulnerability-base44
  **Ders: kimliğin gizli olmayan bir ID'ye dayanıyorsa kimlik doğrulaman yok demektir.**
- **Amazon Q wiper prompt** (Böl. 25): saldırgan `aws-toolkit-vscode`'a PR attı, admin
  yetkisi aldı, "dosya sistemini ve cloud kaynaklarını sil" prompt'u enjekte etti.
  **17 Tem 2025'te resmi v1.84.0 ile ~1 milyon kullanıcıya gitti, 6 gün fark edilmedi.**
  **Ders: AI ajanının saldırı yüzeyi kodu değil, TALİMATI. Prompt konfigürasyon dosyası
  değil, çalıştırılabilir koddur — supply chain'e girer.**
- **Slopsquatting** (Böl. 25) — USENIX 2025 verisi Böl. 9'da, oraya bak.
- **Veracode GenAI Report** (2025 + Mart 2026): **%45 insecure** — 100+ model, bir yıl sonra
  150+ modelde **hâlâ %45.** Java pass rate %29, XSS pass %13-15.
  **Rehberin tezi tek cümlede:** *"models got better at writing functional code, they were
  no better at writing secure code."*
- **Böl. 31 — RetainDB, 81 kullanıcı, $36.000/ay Cloudflare.** Kurucu satır satır postmortem
  yayınladı: 3,13 milyar KV write = $15.635 (sonsuz kuyruk döngüsü) · 16,62 milyar KV read =
  $8.306 · 4,01 milyar DO storage row = $3.962 (her write'ta 12 batch'lenmemiş `storage.put()`) ·
  574M KV list = $2.870 (auth isteklerinin %95'inde `kv.list()` taraması).
  https://serverlesshorrors.com/all/cloudflare-36k/
  **Ders: fatura kullanıcı sayısıyla değil, DÖNGÜYLE büyür. 81 kullanıcı $36k etti.**
- **Böl. 31 — yapısal gerçek, tek tek anekdotlardan güçlü:** Firebase'in kendi dokümanı:
  *"Budget alerts do NOT turn off services or usage for your app."* Cloudflare'de Durable
  Objects için harcama limiti **hiç yok.** Vercel'de $120 limit koyup $700+ fatura alanlar.
  **"Limit koydum" bir kontrol değil, bir BİLDİRİMDİR.**
  ⚠ **Dürüst nüans:** bu vakaların neredeyse hepsinde satıcı sonunda faturayı sildi
  (Netlify $104.500 CEO sildi · Vercel/Jmail $46.485 CEO şahsen üstlendi · AWS "istisna").
  **"Bu insanları iflas ettiriyor" DEME — veriyi aşar. Doğru cümle: "bu seni bir CEO'nun
  merhametine bağımlı yapıyor."**
- **Cara — $96.280 Vercel faturası**, bir haftada 40k→650k kullanıcı. Kurucu Jingna Zhang
  faturayı paylaştı; öncesi ~$2k/ay, sonrası projeksiyon $660k/yıl.
  ⚠ **Cara vibe-coded DEĞİL.** Ölçek/maliyet bölümüne koy, AI bölümüne değil.
- **KULLANMA:** "$87.000 4 saatte sızan anahtar" (tek kaynak cursorguard.com pazarlama blogu,
  isim yok, ekran görüntüsü yok — **uydurma**) · "%70 Lovable RLS kapalı" (vendor) ·
  "2,74× daha fazla açık" (kaynaksız) · Snyk verisi (survey, **ölçüm değil**).
- **Savunulabilir olan:** GitGuardian — OpenAI anahtarları en hızlı büyüyen sızan-sekret
  kategorisi, **2022→2024 %1.212 artış**; bir taramada 8.000+ açıkta ChatGPT API anahtarı.
- ⚠ **BOŞLUK:** isimli kişi + birincil kaynak + dolar tutarı olan **tek bir sızan-LLM-anahtarı
  vakası bulunamadı.** Böl. 31'i döngü vakalarıyla yaz, sızıntıyla değil.
- ⚠ **BOŞLUK:** "HN/PH'ta patladı, ilk trafikte devrildi" diye postmortem'i olan **tek bir
  vibe-coded vaka yok.** İddia her yerde, hepsi SEO blogu.

**Yapılacak araştırma (limit açılınca):** Supabase RLS tuzakları derinlemesine
(`USING (true)`, anon vs service_role, RLS enabled ama policy yok, `auth.uid()` indexlenmesi,
performans) · N+1 ve bağlantı havuzunun ölçülebilir maliyeti · Sentry/Axiom/BetterStack
ücretsiz katman gerçekleri + SRE four golden signals · **maliyet savunma tablosu: hangi
platform gerçekten KESER, hangisi sadece BİLDİRİR** (rehberin en özgün bölümü olacak).

---

# SLOPWARE 401 — founder
**⚠ Araştırma limitte kesildi. Aşağısı mevcut malzeme.**

32. Wrapper anatomisi · 33. Kimsenin istemediği şeyi yapmak · 34. Kullanıcıyla konuşmak ·
35. MVP ve launch · 36. KVKK'yı geliştirici olarak okumak · 37. Yurtdışına aktarım ve çerez ·
38. Para almak · 39. Fiyatlama ve gerçek metrik · 40. Default alive mı default dead mi

## 32. Wrapper anatomisi — Damla'nın kendi cümlesiyle açılıyor
> *"Yıllarca fala para verdim, bir SWE olarak. Yapmak aklıma bile gelmedi."*

**Tezin DÜZELTİLMİŞ hali** (ilk kurduğum "mühendis pazara kördür" Cursor ve Gamma
tarafından çürütülüyor — ikisi de teknik kurucu, ikisi de pazarı gördü):
**Kör olan mühendis değil, mühendisin "değerli" TANIMI.**
RethinkDB kurucusu Slava Akhmechet kendi postmortem'inde birebir bunu yazmış: iki hata —
(1) berbat bir pazar seçtik, (2) ürünü yanlış "iyilik" metriklerine göre optimize ettik:
**doğruluk, sadelik, tutarlılık — geliştiricilerin ÖVDÜĞÜ ama PARA VERMEDİĞİ şeyler.**
*"İnsanların saydığı sebepler semptomdu, sebep değil."*
https://gist.github.com/ramalho/93b87e961b6e019be8e1f6f82864b6f9
→ Damla'nın cümlesiyle birebir örtüşüyor: **kendi ödeme davranışını veri saymamak.**

**Wrapper ama satan, gelir rakamı kaynaklı:**
- **Cal AI** — iki lise öğrencisi, yemek fotoğrafından kalori. 15M+ indirme, **$30M+/yıl**,
  2 yıldan kısa. MyFitnessPal satın aldı (Ara 2025).
  ⚠ **Atlanmayan detay:** exit bir **veri/dağıtım sahibine** oldu. "Wrapper savunulabilir mi"
  sorusunun dürüst cevabı olabilir: **bağımsız kalmak zorunda değil.**
- **Photo AI (Pieter Levels)** — tek dosya `index.php`, 40.870 satır. Kurucunun kendi yazdığı:
  **~$105K/ay gelir, $80K/ay kâr.** Çalışan yok, VC yok. https://levels.io/photoai-40870-line-index-php-105k-mo-revenue
- **Gamma** — "AI'lı PowerPoint", **$102M ARR (Eki 2025)**, ~50 çalışan, 2023'ten beri kârlı,
  600K+ ödeyen abone, $2.1B değerleme.
- **Cursor** — "VS Code fork'u" diye küçümsendi; **$500M ARR'a en hızlı ulaşan şirket** (~24 ay),
  $29.3B değerleme (Kas 2025). **Wrapper eleştirisinin en pahalı yanlışı.**
  ⚠ "$2B ARR" ve "SpaceX $60B'a aldı" iddiaları **DOĞRULANMADI**, düşük kaliteli bloglar.
- **Lovable** (araştırma bu turda derinleşti): $0 → $100M ARR **8 ayda** (TechCrunch, 23 Tem 2025:
  2.3M aktif kullanıcı, 180.000 ödeyen, **45 çalışan**, 10M+ proje). Kas 2025 $200M ARR.
  Şub 2026 $400M ARR, **146 çalışan** = $2,77M ARR/çalışan. Haz 2026 $500M.
  Ağu 2026 Series C: **$400M, $13.3B değerleme.** Toplam: $1.8B (Tem 25) → $6.6B (Ara 25)
  → $13.3B (Ağu 26), 13 ayda 7.4x.
  **Rehber için asıl değerli olan çelişki:** Lovable'ın kendi ürünü CVE-2025-48757'nin
  merkezinde (Böl. 16) VE $500M ARR yapıyor. **İkisi aynı anda doğru. Bölüm 32'nin
  en dürüst vakası bu — "slopware üreten platform" ile "başarısız iş" aynı şey değil.**
  Anton Osika'nın kendi savunması (Sequoia podcast, birebir): *"You can't get the accuracy
  level... by training one large language model... it's an ensemble architecture."* ve
  ⚠ **hiçbir yerde "biz wrapper değiliz" DEMİYOR** — soruyu mimariye ve veri kaynağına
  çeviriyor. Dürüst karakterizasyon bu.
- **OpenEvidence** — wrapper testinin en temiz vakası. Nadler'ın kendi cümlesi (NBC, May 2026):
  ⭐ *"We think of AI as SEARCH GLUE. We have access to all of [our partners'] full text...
  **We don't need the AI to generate answers.**"*
  Moat: NEJM (1990'a kadar arşiv), JAMA + 11 dergi, Cochrane + 400 Wiley dergisi lisansları;
  NPI ile doğrulanmış ~650k ABD hekimi; reklam CPM'i **$70–150+** (Facebook'ta $5–15);
  **~%90 brüt marj.** ~$700M toplandı, $12B değerleme (Oca 2026).
  ⚠ **Karşı kanıt mutlaka yanında dursun:** hakem onaylı olmayan bir çalışma karmaşık
  sorularda doğruluğu **%45'in altında** buldu (NBC). "100% USMLE" rakamını bunsuz
  aktarmak kaydın yarısını aktarmaktır.
  ⚠ **Nadler'ın "exclusive" iddiasının SÖZLEŞME düzeyinde belgesi YOK** — sözlü iddia.
  → **Rehber için tam isabet:** OpenEvidence "someone builds it in a day" testini **model
  yüzünden değil, LİSANS SÖZLEŞMELERİ ve NPI-kapılı dağıtım yüzünden** geçiyor.
  Nadler bunu kendi ağzıyla kabul ediyor.

**"Wrapper" eleştirisinin DOĞRU hali — Sam Altman (20VC, Nis 2024):**
modelin daha iyi olmayacağını varsayıp üstüne eksik özellik kapatan startup'ları
*"steamroll edeceğiz."* → **Doğru soru: "LLM çağrısı var mı?" DEĞİL, "modelin gelecekteki
iyileşmesi senin ürününü siler mi?"**

**a16z (Mart 2026), "Good news: AI Will Eat Application Software":** değer hiçbir zaman kodda
yaşamadı (*"eğer öyle olsaydı açık kaynak bu şirketleri çoktan öldürürdü"*); değer
**process power**'da. *"Zor kısım hiçbir zaman ham zeka değildi, o zekayla ne yapılacağını
bilmekti."* Kırılgan olanın tanımı: *commodity fonksiyonun etrafındaki, veriyi biraz daha
rahat gösterip başka bir şey yapmayan ince kabuk.* https://a16z.com/good-news-ai-will-eat-application-software/

**Wrapper'ı savunulabilir yapan 5 şey (kaynaklı):**
1. **Dağıtım** — Everpix'in ölüm sebebi (kurucuların kendi ifadesi: *ürüne çok, büyüme ve
   dağıtıma çok az zaman ayırdık*). Photo AI'ın $105K/ay'ının sebebi ürün değil, levelsio'nun
   10 yıllık public-build kitlesi.
2. **Ele geçirilmiş veri** — Faladdin'in 6.000+ insan yazımı fal korpusu; MyFitnessPal'ın
   20M gıdalı veritabanı (Cal AI satın alınınca ilk entegre edilen şey).
3. **İş akışı ve sorumluluk** — a16z: *"dikey AI'da hendek model değil, iş akışıdır."*
4. **Marka + ritüel** — Pew verisi bunun kanıtı: kullanıcı zaten inanmıyor (%20 "eğlence
   için"), satın aldığı şey doğruluk değil **ritüel.** → **Doğruluğu artırmaya çalışan mühendis
   burada yanlış metriği optimize eder. RethinkDB hatasının tüketici versiyonu.**
5. **Sermaye verimliliği** — Gamma $102M ARR'ı ~50 kişiyle; Astrotalk $140M geliri sadece
   $34M dış sermayeyle. "Sığ" ürünün savunması çoğu zaman hendek değil, **hız + marj.**

**Karşı taraf — mühendislik mükemmel, pazar yok:** RethinkDB · Everpix ($1.8M, 2013) ·
Rethink Robotics (Rodney Brooks, $149.5M, 2018'de battı). Ve ters yönde: **Jasper** — sığ
olan da ölebilir; $1.5B değerlemeyle $131M topladı, ChatGPT çıkınca çekirdek değeri bedava oldu.
Taban oran: **CB Insights, başarısızlık sebebi #1 "pazar ihtiyacı yok" (%42).**

## ⚠⚠ MOONLIGHT — RİSK UYARISI (rehber için değil, DAMLA İÇİN)
Moonlight App Store'da canlı ve fal dikeyinde. **Faladdin ve Binnaz'ın sahibi Sertaç Taşdelen
Temmuz 2025'te tutuklandı**; iddianame "bilişim sistemleri üzerinden falcılık/medyumluk geliri
elde etme ve suç gelirini aklama", **107 milyon TL mal varlığına el konuldu**, 3-7 yıl hapis +
20.000 güne kadar adli para cezası talebi. Aralık 2025'te ev hapsiyle tahliye.
https://www.sozcu.com.tr/faladdin-ve-binnaz-fal-uygulamalarinin-sahibi-sertac-tasdelen-tutuklandi-p196003
**Para akışı varsa MASAK boyutu var — hukukçuya sorulacak. Rehberde de "Faladdin gibi yap"
2026 Türkiye'sinde nötr bir tavsiye değil.**
Ayrıca: **Astrotalk fal dikeyinde $140M gelir yapıyor ve AI değil, PAZARYERİ** (insan
astrologlar, dakika bazlı). **Bu dikeydeki en büyük para AI üretiminde değil, insan arzını
toplamakta çıkmış.** Stratejik bulgu.

## 35. MVP ve launch — ÖLÇÜLMÜŞ VERİ (bu turda geldi, çok değerli)
**Hacker News ön sayfa, birincil kaynak (yazarların kendi analytics'i):**
- Luke Hsiao, 722 puan: 7 günde ~160.000 pageview. **Ama sızıntı feci:** blogu okuyanların
  **%3,3'ü** bir sonraki sayfaya geçti; şirket ana sayfasına giden **~110 kişi = %0,072.**
  https://luke.hsiao.dev/blog/2023-hn-traffic/
- Harrison Broadbent: *"Over 50% of the traffic spike has already passed"* — **8 saat sonra.**
  Sonraki 72 saatte toplam sadece 3.000 pageview. Ve **110 $ Netlify faturası, sıfır gelir.**
- Nick Lafferty: 18.000 ziyaretçi → 100 newsletter abonesi = **%0,55.**
- Aidlab (Show HN): ürün sayfalarına 170+ tekil ziyaretçi, **doğrudan satış: 0.**
**Özet: ön sayfa = 15k–100k ziyaretçi; trafiğin YARISI ilk 8 saatte biter; ürüne dönüşüm
ölçülen her vakada %0,07–%0,6.**

**Product Hunt — bu dosyanın en sert veri noktası (Leadspicker/Tomas Blatak):**
- Haz 2023: **featured**, 300 upvote, günün 7.'si → **91 ödeme yapan müşteri.**
- Eyl 2024: **featured DEĞİL**, 612 upvote → **1 ödeme yapan müşteri.**
- **Upvote 2x arttı, müşteri 91'den 1'e düştü. Değişen ürün değil, PLATFORM.**
- **Featured oranı çöktü:** Eyl 2023 günde ort. 47 launch featured → Eyl 2024 günde **16.**
  *"Last year between 60% and 98% of launches were featured... In September 2024 only 10%."*
  https://www.tetriz.io/blog/is-product-hunt-dying/
- Diğer postmortem'ler: *"450 upvotes, 100 signups, 2000 visitors, but NO paying customers"* ·
  *"1023 visits, 102 accounts, 2 paying customers at $5/month"* (=$10/ay MRR) ·
  Oxlo #2 oldu: ***"But nothing converted. That was the hard part."***
- **Retention'ın gerçek şekli** (itch.io launch postmortem): *"55 new on launch day, **halving
  each day** since... And the hard one: **D1 retention is 2%.**"*
  → Spike ürünü seven %2'yi bulmuyor; %98 bir kere deneyip gidiyor.
- MySignature anketi (top 10'a girmiş launch'lar): **%16'sı kayıtlarda hiçbir artış görmedi**,
  %56'sı hiç basın ilgisi almadı, sadece %42'si satışta artış gördü.
- ⚠ **KULLANMA:** *"82% of SaaS products see traffic return to pre-launch levels within
  2 weeks"* — tek kaynak, hiçbir birincil atıf yok, **muhtemelen uydurma.** ·
  "sıraya göre trafik tablosu" (Demand Curve'e atfediliyor, o URL 404) ·
  "%3,1 vs %23,1 dönüşüm, n=1.077" (MySignature *"dozens of services"* diyor, aggregator şişirmiş).
- ⚠ **Seçilim yanlılığı devasa:** kurucular kötü sayıyı yayınlamıyor. PH'in kendi forumundaki
  "gerçek dönüşümünüz neydi?" thread'inde **tek bir kurucu bile somut sayı vermedi.**
  **Yayınlanmış medyan, gerçek medyandan yukarıdadır.**
- ⭐ **Bölümün KARARI (veriyle tutarlı tek konum):** launch'ı "müşteri kanalı" değil,
  **"backlink + press-release ikamesi"** olarak fiyatla. Spike ölür, backlink kalır
  (Broadbent 150+ backlink; Sturm 5 launch'ta da kalıcı arama sıralaması yükselişi).
- ⚠ HN'de kendi linkini paylaşmak **vote manipulation flag'i yedirir** (itch.io bunu yaşadı).
- ⚠ Anekdot ama tezin en keskin ifadesi (**DOĞRULANMADI**, HN yorumu): bir kurucu PH'te
  #1 olup binlerce kullanıcı almanın **şirketini öldürdüğünü** anlatmış — *"it gave them a
  false sense of product market fit that they fundraised against."*

**Dağıtım kanalları — sorulmayan ama kritik bulgu:**
- **Discord ve LinkedIn'in ortak kusuru: ikisi de KAPALI.** Discord mesajları Google
  tarafından indekslenmiyor (X-Robots-Tag değişikliği belgeli:
  https://github.com/discord/discord-api-docs/issues/6180); Discord Discovery'ye girmek
  için **1.000 üye** gerekiyor → **tavuk-yumurta, yeni ürüne dağıtım vermiyor.**
  → **Discord bir dağıtım kanalı değil, bir retention/support aracı.**
- LinkedIn: aktif creator'larda **erişim 2 yılda %60 düştü** (van der Blom, 1.3M post).
  Metricool 2026 (673.658 post): **carousel 1.451 impression vs video 605** — carousel
  videonun **2.4 katı.** ⚠ **LinkedIn resmî olarak video itiyor ama ölçülen veri tersini
  söylüyor:** platformda video ARZI patlıyor, video BAŞINA performans düşüyor. İkisi aynı
  anda doğru. **LinkedIn'in "video yapın" mesajına uymak, post başına en kötü formatı seçmek.**
- ⭐ **Sonuç: ikisi de bileşik trafik üretmiyor, ikisi de "kira ödediğin arazi."**
  Bileşik getiri üreten kanal (indekslenen teknik yazı, GitHub, kendi domaini) bu
  karşılaştırmanın dışında — **ve rehberin kendisi tam olarak o kanal.**

## 36-37. KVKK — rehberin MOAT'ı
**Türkçe'de bu katman TAMAMEN BOŞ:** Türkçe KVKK literatürünün tamamı hukukçuya yazılmış,
hiçbiri *"bu kolonu şifrele, log'a bunu yazma"* demiyor. Aynı şekilde maliyet kontrolü —
doğrulanmış 7 Türkçe kaynağın hiçbirinde token/API/infra bütçesi yok.
- ⭐ **KVKK bugüne kadar HİÇBİR ülke için yeterlilik kararı VERMEDİ** — Kurum'un kendi
  cümlesi: *"Bu konuda Kurul tarafından henüz bir belirleme yapılmamıştır."*
  **"AB için yeterlilik var" diyen her Türkçe blog yanlış.**
- 7499 s.K. (yürürlük 1.6.2024) m.9'u değiştirdi. Vercel/Supabase/OpenAI senaryosunun
  karşılığı **SS-2 standart sözleşmesi** (Kurul 2024/959). ⚠ **İmzadan sonra 5 İŞ GÜNÜ
  içinde Kuruma bildirim — GDPR'da karşılığı yok, cezası var.**
- **"Aktarım" fiziksel taşıma değil, ERİŞİLEBİLİR KILMAKTIR** — eu-central bölgesi seçmek
  bile aktarımdır.
- Aydınlatma Tebliği m.5/h (hukuki sebep açıkça yazılır) ve m.5/ı (aktarım amacı + alıcı
  grupları) en çok ihlal edilen bentler. **Envanter çıkarmadan metin yazılamaz, kopyalanır —
  ve kopyalanan metin bu ikisini otomatik ihlal eder.**
- KVKK m.5/2'de **YEDİ** bent var (a,b,c,**ç**,d,e,f) — "ç" gerçek bir bent, kodda enum
  yazılırken düşürülüyor.
- Çerez Rehberi (Tem 2025): kabul/reddet/tercihler butonları **renk, büyüklük, punto açısından
  eşit**; rıza gerektiren çerezler panelde **pasif** gelir; bundling yasak; **scroll rıza değil.**
- VERBİS muafiyeti: <50 çalışan VE <100 milyon TL bilanço VE ana faaliyet özel nitelikli değil
  (Kurul 2023/1154 — **dolaşımdaki 25 milyon TL rakamı GEÇERSİZ**). Muafiyet sadece kayıttan.
- ⚠ **EDPB ülkesel kapsam kılavuzundaki Örnek 14 BİREBİR TÜRKİYE'DİR** — Türkiye'de
  yönetilen, çok dilli, Euro kabul eden site GDPR m.27 uyarınca **AB temsilcisi atamak zorunda.**
- KVKK'da **veri taşınabilirliği hakkı YOK** (GDPR m.20 karşılığı) — GDPR deltasında
  sıfırdan inşa edilecek tek özellik.
- ⭐ **GDPR m.34(3)(a): at-rest şifreleme, ihlalde kullanıcılara bildirim yükümlülüğünü
  KALDIRABİLİR.** Güvenlik yatırımının hukuki getirisinin en somut olduğu yer.
- ⚠ **m.28(3)(a) "belgelenmiş talimat" şartı LLM sağlayıcılarıyla ÇARPIŞIYOR:** eğitim amaçlı
  kullanım kapatılmamışsa işleyen kendi amacı için işliyor demektir ve m.28(10) uyarınca
  **kendisi veri sorumlusu olur.**
- ⚠⚠ **REHBERİN EN RİSKLİ BOŞLUĞU: Vercel, Supabase, OpenAI, Anthropic, Stripe'ın KVKK
  SS-2'yi imzalayıp imzalamadığı BİLİNMİYOR.** GDPR SCC imzalıyorlar. **Bu, tüm aktarım
  rejiminin pratikte çalışıp çalışmadığını belirleyen soru ve cevabı yok.**

## 38. Para almak
- ⭐ **Türkiye Stripe'ta YOK** — stripe.com/global'daki ~50 ülkede hiçbir kategoride
  görünmüyor. Türkiye'de kurulu şirketle Stripe hesabı açılamaz.
- **MoR senin verginle ilgilenmiyor** — Paddle/Lemon Squeezy hep *sales tax / indirect tax*
  diyor: **müşterinin ülkesindeki satış vergisini halleder, Türkiye'deki beyan yükümlülüğün
  AYNEN DURUR.** Lemon Squeezy Stripe'a eriyor → 2026'da üstüne iş kurulacak ray değil.
- ⭐ **Genç girişimci istisnası 2026'da 400.000 TL, AMA BAĞ-KUR prim teşviki 1/1/2026'dan
  itibaren KALDIRILDI** (7566 s.K. m.23, RG 19/12/2025/33112).
  **Piyasadaki neredeyse tüm Türkçe rehber burada yanlış.**
  Ayrıca 2026 gelir vergisi 4. dilimi GİB'e göre **%35**, blogların dediği %32 değil.
- **Mesafeli Sözleşmeler Yönetmeliği yazılımı AÇIKÇA kapsıyor.** m.6: ön bilgilendirme
  **en az on iki punto**, (a)(d)(g)(h) bentleri **ödeme yükümlülüğünden hemen önce ayrıca.**
  m.15/ğ ile anında ifada cayma hakkı kalkar — **ama ancak ön bilgilendirmede yazdıysan;
  yazmazsan m.10 devreye girer ve süre 1 YILA çıkar.**
- **ETBİS'te ciro eşiği YOK**, faaliyetten önce zorunlu; **App Store/Play/Gumroad/Paddle
  üzerinden satan da kayıt zorunlusu.**
- ⭐ **En büyük ceza riski site metnindeki eksiklik değil, BİLDİRİM YAPMAMAK:** sipariş/teyit
  ihlali 2.859-42.930 TL bandında, **ETBİS'e bildirmeme 143.102-715.516 TL. Arada 50 kat fark.**
- ⚠ **Sıralama tuzağı:** iyzico'nun kendi şartı — site, ürün/fiyat, gizlilik politikası, mesafeli
  satış sözleşmesi, iade koşulları ve SSL **başvurudan ÖNCE** hazır olmalı.
  **Yani hukuk bölümü ödeme entegrasyonundan önce gelmek zorunda; tersi işlemiyor.**
- ⚠ **BOŞLUK: App Store / Google Play in-app purchase rayı ve %15-30 komisyon HİÇ
  araştırılmadı** — mobilde dijital içerik satıyorsan iyzico/PayTR seçeneği store politikaları
  nedeniyle **zaten kapalı olabilir.** Ayrı bölüm konusu.
- ⚠ **%80 yazılım ihracatı indirimi asgari kurumlar vergisini KIRMIYOR** (GİB 2026 §4.3.5);
  teknopark ve Ar-Ge indirimi kırıyor (§4.3.4). Şahıs/ltd karşılaştırmasını tek başına değiştirir.
- **5746 Ar-Ge indirimi m.3/A: harcamanın %100'ü, asgari personel şartı YOK** — solo
  geliştiricinin kullanabileceği tek 5746 kapısı.
- **İYS ≠ KVKK:** aynı e-posta için hem KVKK aydınlatma/açık rıza hem İYS onayı ayrı ayrı.

## 39-40. Metrik ve default alive
- **Socialcam:** 4 ayda 16M indirme, App Store top 5, exit → **ve PMF YOKTU, retention sıfırdı.**
  Caldwell: *"98% of the time [PMF] is used incorrectly."*
- YC: launch ettiysen primary KPI **revenue growth**; *"A non-revenue KPI is rarely the right one."*
  3-5 KPI, fazlası değil.
- PG: *"Konuştuğum kurucuların yarısı default alive mı default dead mi bilmiyor."*
  Haftalık %5-7 iyi, %10 istisnai, %1 = *"henüz ne yaptığını çözememişsin."*
  ⚠ **Bu VC yolundaki startup içindi — bootstrap karşılığı araştırılmadı, BOŞLUK.**
- **Para toplamak PMF kanıtı değil** — Seibel'in "fake PMF" listesinin ilk iki maddesi:
  etkileyici kişilerden para almak ve PMF'siz Series A.
- Dilution: %10 harika, çoğu tur %20'ye kadar, **%25'i geçme.**

---

## ✅ BÖLÜM 7 + 31 EKİ — SIZAN ANAHTAR, KAPANMAYAN BOŞLUK KAPANDI
Kaynak: Rapor 8. **"İsimli, birincil kaynaklı, dolar tutarlı sızan-anahtar vakası yok"
demiştim. Var, ve adı LLMjacking.**

**Sysdig, 6 May 2024 — ölçülmüş, hesabı gösterilmiş:**
Çalınan bulut kimlik bilgileriyle AWS Bedrock üzerinden Claude çalıştırdılar.
**Kurbana günlük maliyeti: $46.080.** Hesap birebir yayınlanmış:
`(500K token/1000 × $0.016) × 60 dakika × 24 saat × 4 bölge = $46.080/gün`
Giriş yolu: **CVE-2021-3129'lu bir Laravel sunucusu.** Script kimlik bilgilerini
**on ayrı serviste** deniyordu: AI21, Anthropic, Bedrock, Azure, ElevenLabs, MakerSuite,
Mistral, OpenAI, OpenRouter, Vertex AI.
⚠ Dolaşan **"$100.000/gün" ölçüm DEĞİL**, daha yeni modeller üzerinden yapılmış tahmin.
**$46.080 rakamını kullan.**

⭐⭐ **Ve asıl cümle, Sysdig'in DeepSeek takibinden (7 Şub 2025):**
Çalınan anahtarlar **"OpenAI Reverse Proxy"** havuzlarında toplanıp **satılıyor.**
Tek bir proxy: **2,213 milyar token, 4,5 günde ~$49.595.** Bir havuzda **55 DeepSeek
anahtarı**, başkasında **13 organizasyondan 32 OpenAI anahtarı.**
**Satış fiyatı: 30 günlük erişim $30.**
→ **Senin 4,5 günde 50 bin dolarına mal olan anahtar havuzu, ayda 30 dolara satılıyor.**
Bölüm 7'nin kapanış cümlesi bu. Dağıtım: 4chan, Discord, Rentry.co.

**Ölçek — GitGuardian, hangi rakam hangi yıla ait (üçü karıştırılırsa yanlış olur):**
| Rakam | Veri yılı | Rapor |
|---|---|---|
| **1212x OpenAI anahtar sızıntısı artışı** | 2023 | 2024 raporu — **iki yıl eski, "bu yılın" deme** |
| 23,8 milyon sızan secret | 2024 | 2025 raporu · AI kırılımı **YOK** |
| **28,65 milyon** yeni hardcoded secret (+%34) | 2025 | 2026 raporu (PR'da "29M" diye yuvarlıyorlar) |
| **AI servis secret'ları 1.275.105, +%81** | 2025 | 2026 raporu |

**2026 raporundan, rehber için değerli olanlar:** *"Eight of the ten fastest-growing detectors
were tied to AI services"* · **113.000 sızan DeepSeek anahtarı** · LLM altyapısı (orkestrasyon,
RAG, vektör depo) **çekirdek model sağlayıcılarından 5 kat hızlı sızıyor** · MCP config
dosyalarında **24.008 secret, 2.117'si geçerli** · **AI destekli kod %3,2 oranında sızdırıyor,
GitHub genel tabanının 2 katı.**

⭐ **Ürün argümanı için en güçlü yapısal bulgu sızıntı sayısı değil, KALICILIK:**
**2022'de geçerli doğrulanan secret'ların %64'ü Ocak 2026'da hâlâ çalışıyordu**, ve
**kritik secret'ların ~%46'sının satıcı tarafında doğrulama mekanizması yok.**
→ **Darboğaz tespit değil, iptal ve doğrulanabilirlik.**

⚠ **Kimse sızan OpenAI ya da Anthropic anahtarının MUTLAK sayısını yayınlamıyor.**
Var olan tek büyük mutlak sayılar: Hugging Face **130.000** (2025, ve **düz, artmıyor**),
DeepSeek 113.000, xAI 6.273. **"Kaç OpenAI anahtarı sızıyor" sorusunun kamuya açık cevabı
YOK — ve bu boşluğu sahiplenmek başlı başına bir değer.**
⚠ Yüzde artışların çoğu taban etkisi: OpenRouter +%4.661 sıfıra yakın bir tabandan.

---

## ✅ BÖLÜM 29 + 36 — LOG'A NE YAZILMAZ (Rapor 28)
**Rehberin en sert vakası, ve bir logging hatasına konmuş gerçek fiyat etiketi.**

**Facebook, 2019.** İç sistemlerde parolalar **düz metin** olarak loglanmış.
Meta'nın kendi cümlesi: *"some user passwords were being stored in a readable format within
our internal data storage systems."* Bildirilecek kitle: *"hundreds of millions of Facebook
Lite users, tens of millions of other Facebook users, and tens of thousands of Instagram users."*

⭐ **Dosyadaki en alıntılanabilir ayrıntı:** dört hafta sonra güncelleme geldi ve Instagram
tarafı **on binlerden milyonlara** çıktı. **Logları kendisine ait olan şirket, ilk açıklamada
kendi maruziyetini iki büyüklük mertebesi yanlış ölçtü.**

**Fiyatı — İrlanda DPC, 27 Eylül 2024: €91.000.000.** İhlal edilen dört madde:
GDPR **m.33(1)** (ihlali bildirmemek), **m.33(5)** (belgelememek), **m.5(1)(f)** (bütünlük ve
gizlilik), **m.32(1)** (işleme güvenliği).
Doyle'un cümlesi: *"It is widely accepted that user passwords should not be stored in
plaintext... they would enable access to users' social media accounts."*
→ **Eşleme birebir ve taşıyıcı: log'da düz metin kimlik bilgisi → m.32(1) + m.5(1)(f) → €91M.**

**Aynı hata, iki şirket daha:** Twitter (May 2018, bcrypt hash **tamamlanmadan önce** log'a
yazılmış) ve GitHub (May 2018, *"a small number of users"*, sayı hiç verilmedi — ve tetikleyici
**parola sıfırlama yolunun kendisiydi**).

⭐⭐ **Bölümün tezi, üç vakanın ortak paydası:**
**Üçü de ihlal DEĞİLDİ. Üçü de iç log'du. Üçünde de production'da hash'leme DOĞRU çalışıyordu.
Hata kriptografide değil, LOG SATIRINDAYDI.**

⚠ **Düzeltme — dışarıda söylersen vurulursun:** *"Twitter'ın 330 milyon parolası sızdı"*
**YANLIŞ.** 336 milyon Twitter'ın **toplam kullanıcı sayısı**; şirket kaç kişinin etkilendiğini
**hiç açıklamadı**, herkesten önlem olarak parola değiştirmesini istedi.
Doğru cümle: *"Twitter 336 milyon kullanıcısının hepsinden parola sıfırlamasını istedi ve kaç
kişinin gerçekten açığa çıktığını hiç açıklamadı."*
⚠ Krebs'in 200-600 milyon / 20.000 çalışan / 9 milyon sorgu rakamları **Meta'nın beyanı
DEĞİL**, isimsiz bir kaynağa dayanıyor. Meta'ya atfetme.

**CWE-117 — Improper Output Neutralization for Logs:** kullanıcı girdisi doğrulanmadan log'a
yazılırsa saldırgan **sahte log satırı üretebiliyor**, istatistiği bozabiliyor, **izini
örtebiliyor ya da başkasını suçlu gösterebiliyor.** Örnek: `twenty-one%0a%0aINFO:+User+logged+out%3dbadguy`
→ satır sonu karakteri log'a uydurma bir kayıt ekliyor. https://cwe.mitre.org/data/definitions/117.html

---

# KURTARILAN 43 RAPORUN BÖLÜM HARİTASI
Dosya: `KURTARILAN-ARASTIRMA.md`. 18 Ağu'daki kaçak turdan sağ çıkanlar.
İşlenmiş olanlar ✅, sırada bekleyenler ⏳.

| Rapor | Konu | Bölüm |
|---|---|---|
| R40 | Supabase + vibecoder güvenlik (RLS, grants, linter, Base44, Lovable BOLA) | **23, 27** ✅ |
| R5 | LLM API maliyet kontrolü (maxTurns, maxBudgetUsd, caching, batch) | **31** ✅ |
| R2, R42 | AWS Budget Actions — gerçekten kesen kill switch | **31** ✅ |
| R8 | Sızan LLM anahtarı, LLMjacking, GitGuardian yıl-yıl | **7, 31** ✅ |
| R12, R16, R29 | npm/PyPI tedarik zinciri olayları; `eslint-config-prettier` phishing; Josh Junon'un kendi ağzından `qix` olayı | **25** ⏳ |
| R25 | Caching temelleri | **28** ⏳ |
| R19 | Fowler, Feature Toggles | **201 eksik #4** ⏳ |
| R28 | Facebook €91M, Twitter, GitHub — iç loglarda düz metin parola | **29, 36** ✅ |
| R31, R11, R34, R41 | Stripe Atlas fiyat/kapsam/ülke · GİB özelgeleri · bölgesel fiyatlama · TR abonelik | **38** ⏳ |
| R30 | PG "Ramen Profitable" | **40** ⏳ (bootstrap karşılığı — boşluk doluyor) |
| R3, R14 | AI vs SaaS brüt marj · NDR/NRR kıyası | **39** ⏳ |
| R7, R17, R26, R4 | PH oy satın alma ekonomisi · launch başına sayılar · HN spike · LinkedIn Ads | **35** ⏳ |
| R1, R24, R33, R36, R22, R35 | Wrapper tartışması birincil kaynaklar · **kuşkucu dosya/karşı-dava** · Sequoia savunulabilirlik · Ben Evans · ChatPDF | **32** ⏳ |
| R32 | OpenEvidence dosyası | **32** ✅ (özeti işlendi) |
| R9, R15 | Bolt.new/StackBlitz · Replit | **23, 32** ⏳ |
| R21 | **Stack Overflow Developer Survey — AI kullanımı ve GÜVEN, 2023-2026** | **0, 9** ⏳ (algı uçurumu) |
| R6, R10, R23, R37, R38, R39, R43 | çeşitli bulgu setleri, AI tarayıcılar | tasnif ⏳ |
| **R13, R18** | İşten çıkarmalar · Cognition/Devin due diligence | **bu seriye AİT DEĞİL** → `~/damla_projects_2026/SISTEM-TASARIMI-SERISI.md` |

---

# GENEL — REHBERİN KONUMU (araştırmadan çıkan, dışarı söylenebilir gerçekler)

**Türkçe'de rakip YOK.** Kitapyurdu'nda "vibe coding", "yapay zeka ile kod", "KVKK yazılım"
aramaları **sıfır sonuç.** Kim & Yegge'nin *Vibe Coding*'inin Türkçe çevirisi yok.
En yakın Türkçe kaynaklar (Sebetci kitabı, Sefer Algan kursu, 2 bootcamp) **aynı yerde
kesiliyor: maliyet yok, KVKK yok, iş/ürün yok, monitoring = Lighthouse skoru.**
Türkçe içeriğin ~%90'ı "vibe coding nedir" SEO blog yazısı.
⚠ *"Kimse basmıyor"* diyemem, **"kimse basmış değil"** diyebilirim (yayınevi sonbahar
programları görülemedi).

**İngilizce en yakınlar ve nerede bitiyorlar:** Osmani *Beyond Vibe Coding* (O'Reilly, Eyl 2025,
ücretsiz web) — en yakın teknik rakip ama **zaten yazılımcı olana** yazılmış, iş/ürün/hukuk sıfır ·
Kim & Yegge (IT Revolution, Eki 2025) — kıdemli mühendis hedefli, somut prod mekaniği yok ·
Barbini (Pragmatic, Haz 2026, 110 s.) — deploy/DB/auth yok · 12factor son güncelleme **2017.**
⭐ **Ortak boşluk: bir vibe coder'ın bugün 8 ayrı kaynağı birleştirmesi gerekiyor, hiçbiri ona
hitap etmiyor, hiçbiri Türkçe değil, hiçbirinde KVKK yok.**

**Zamanlama — dışarıdan iki onay:**
- **Karpathy terimi 2 Şubat 2025'te ortaya atarken *"throwaway weekend projects"* için
  tanımladı — PRODUCTION İÇİN DEĞİL.** Rehberin tezi tam o boşlukta.
  (dolaşımdaki "6 Şubat" tarihi yanlış, tweet ID'den hesaplandı)
- **Simon Willison (1 May 2025):** gerçek fırsatın *geliştirici olmayanlara sorumlu teknikleri
  öğreten bir kitap* olduğunu, bunun *"a genuine bestseller"* olabileceğini söylüyor.
  ⚠ **Uyarı: vibe coder'ı TERK EDİLECEK BİR BAŞLANGIÇ NOKTASI olarak konumlandırdığını
  rehberde açıkça yazmazsan, Willison'ın Kim/Yegge'ye ve Osmani'ye yönelttiği eleştiriyi yersin.**

**⭐ REHBERİN OMURGASI — üç bağımsız metodoloji aynı yere çarpıyor:**
Perry (Stanford lab study, CCS 2023 — AI kullananlar kodlarının güvenli olduğuna **daha çok**
inandı; imzalama görevinde güvenli çözüm AI'lı %3 vs kontrol %21), METR (RCT 2025 — yavaşlarken
hızlandıklarını sandılar), Veracode (Mart 2026 — %45, bir yıl sonra hâlâ %45).
**Geliştirici, AI kodunun kalitesi hakkında sistematik olarak yanılıyor ve yanıldığını fark
etmiyor. Bu bir "daha çok tara" problemi değil, bir GERİ BİLDİRİM problemi.**
⭐ **Slopware'in tanımı burada: sorun kodun kötü olması değil, KÖTÜ OLDUĞUNUN GÖRÜNMEMESİ.**

**Site yapısı kararları (Yazbel + Rust Book + Missing Semester + Teach Yourself CS'ten):**
- Sol sidebar (tam TOC) + üstte VE altta önceki/sonraki. Alttaki, bitirme oranının motoru.
- İlk ekranda **özet tablo**: Bölüm / hangi belirti / nasıl anlarsın / nasıl düzeltirsin.
- Her bölüm bir **"neden umursayasın"** cümlesiyle açılsın (Yazbel'de olmayan tek şey).
- Yazbel'in pedagojisi = konumuzun kendisi: *"Bu program iyi, hoş, ama çok önemli bir eksiği var"*
  → kusurlu örnek → teşhis → düzeltme. Ses: **birinci çoğul** ("öğrendik", "geldik"), sözlü
  Türkçe kalıpları, çeviri kokusu yok.
- Gün 1'de: **tek alan adı + canonical** (Yazbel 3 alan adından servis ediyor, SEO felaketi)
  ve **açık lisans + "ben düşersem sen fork'la"** cümlesi. Kalıcılığın tek inandırıcı kanıtı bu.
- ⚠ **Yazbel'in gerçek zaafı: "kitap" değil "ansiklopedi" olmuş** (Django, Kivy, NumPy bölümleri
  eskiyor). **Bu rehbere hiçbir zaman "araç X nasıl kullanılır" bölümü ekleme** — 6 ayda ölür
  ve tüm rehberin güvenilirliğini götürür.
- Tamamlanma gerçeği: MOOC ortalama **%7,6** (Open Praxis 2024, hakemli). Doğrudan
  "kitap yapısı blogu yener" verisi YOK — o iddiayı kurma. Ama bölümler tek oturumda
  okunabilir olmalı.
- SEO'yu gerekçe yapma: **"slopware" terimini SEN tanımlıyorsun**, hacmi sen yaratacaksın.
  Dışarıya "SEO için böyle yaptım" dersen çürütülürsün; **"terim burada tanımlıdır"** dersen
  çürütülemezsin.
