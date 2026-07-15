# devlog — build in public (instagram)

vibecodedflopware'in inşa surecini reels/post/carousel olarak anlatir. Turkce, build-in-public.

## Format (reel)
- 30 to 60 saniye. Her reel'in ilk 2 saniyesinde HOOK var, yoksa kaydirilir.
- Hook = ekranda beliren ilk yazi + soylenen ilk cumle. Merak, celiski ya da itiraf. Asla "merhaba bugun size" degil.
- Sonra 3-5 hizli beat: ne yaptim, altinda hangi karar var. LinkedIn'deki 1-2-3-4 yolculuguyla ayni ruh ama sozlu, hizli, gorsel.
- Uydurma yok. Hepsi gercekten bugun/bu hafta olan sey.
- Ton: durust, biraz ham, "flop'umu duzeltiyorum" enerjisi. Satis yok, surec var.
- Bittiginde tek cumlelik gercek dusunce ya da cliffhanger, CTA degil.

Her reel: **hook / akis / gorsel / caption** olarak yazilir.

---

## reel 1 — flop'un ta kendisi
**hook:** "adi flopware olan uygulamam flop oldu."
**akis:** slop yakalasin diye yaptigim arac / donup baktim, kendisi slop cikti / bir repo goruntuleyici, seni test eden hicbir sey yok / kendi testinden gecemedi. iste bu yuzden bastan yapiyorum.
**gorsel:** ekranda app'in bos analiz ekrani, uzerine kirmizi "SLOP?" damgasi, sonra silinip "v2" yaziyor.
**caption:** kendi standardini karsilamayan urunu duzeltmek. build in public, gun 1. #buildinpublic #vibecoding #indiehacker

## reel 2 — 30 app, 30 ayri veritabani
**hook:** "her projeme ayri bir veritabani acmisim. 30 tane."
**akis:** bugun githubima baktim / her app'in kendi Supabase'i, kendi auth'u, her seferinde sifirdan / bu kaos / bugun hepsini tek omurgaya bagladim, ayri ayri kilitli odalar halinde.
**gorsel:** 30 ayri db ikonu ekrana yayiliyor, sonra hepsi tek bir kutuya akiyor, icinde ayri cekmeceler.
**caption:** dagilmayi birakip sistem kurmak. #buildinpublic #supabase #softwareengineering

## reel 3 — kendi kodunu tanimiyorsun
**hook:** "shipledigin app'i sen yazmadin. AI yazdi. sen onayladın."
**akis:** vibecoding'in kimsenin soylemedigi yani / uygulamayi shiplersin ama bir bug cikinca kendi koduna yabanci gibi bakarsin / haritasi kafanda yok / demo'da gorunmez, gercek kullanicida her sey.
**gorsel:** tanidik gibi ama yabanci bir kod ekrani, imlec kayboluyor, "?" beliriyor.
**caption:** shiplemek artik kolay. sahiplenmek degil. #vibecoding #buildinpublic

## reel 4 — bir saatte olduruttugum fikir
**hook:** "en seksi fikrimi bir saatte olduttum."
**akis:** motoru API olarak satmak, koca muhendislerin kullanacagi / kulaga gercek sirket gibi geliyor / ama tree-sitter sana sozdizimi verir, anlami degil / blast-radius'ta bir kere yanlis dersen prod patlar, o muhendis bir daha donmez / ustelik bedava rakip her IDE'de var.
**gorsel:** parlak "$ API" tabelasi, uzerine "%80 dogruluk = urun degil" yazip sondurulen isik.
**caption:** buyuk versiyondan baslamak, kimsenin guvenmedigi etkileyici sey yapmaktir. #startup #softwareengineering

## reel 5 — kod tarayicidan cikmiyor
**hook:** "kodunu bize gondermiyorsun. hic."
**akis:** repo'yu tarayici cekiyor, benim sunucum gormuyor / tree-sitter bir worker'da parse ediyor / cikan sey gercek cagri grafigi, emin olmadigi kenarlarda guven etiketi / cunku LLM'in tahminine test kurulmaz.
**gorsel:** kod -> tarayici -> grafik animasyonu, sunucu ikonu ustunde kirmizi X.
**caption:** snapchat, ama tech icin. kod kalmaz. #privacy #buildinpublic #vibecoding

## reel 6 — quiz sahte, hands-on gercek
**hook:** "coktan secmeli soru hicbir sey kanitlamaz."
**akis:** kodu anlamis gibi gorunmek kolay, tahmin edersin / sahiplenmek hafiza degil, motor becerisi / o yuzden quiz'i sildim / arac kendi kodundan bir parca oyuyor, tarayicida gercekten cozuyorsun.
**gorsel:** soluk multiple-choice ekrani cop kutusuna, yerine acilan kod editoru.
**caption:** bildigini sanmak vs yapabilmek. #buildinpublic #learntocode

## reel 7 — durust sinir
**hook:** "hayir, senin koca app'ini tarayicida calistiramam."
**akis:** 40 npm bagimliligi, build adimi, env / hepsi bir taraba sekmesine sigmaz / o yuzden butun app degil, oyulmus tek parca calisir / bunu gizlemiyorum, gercek bir kisit.
**gorsel:** dev app blogu tarayiciya sigmiyor, sonra tek kucuk fonksiyon oyulup sandbox'a dusuyor.
**caption:** sunshine and rainbows degil. sinirlari soylemek de muhendislik. #buildinpublic

## reel 8 — her sey tek seye bagli
**hook:** "bu urun tek bir seyde yasar ya da olur."
**akis:** ozellik degil / uretilen gorev gercekten iyi mi ve gercekten SENIN kodun hakkinda mi / gorevler aptalsa yine slop / o yuzden tum is orada, tek bir egzersizin kalitesinde.
**gorsel:** onlarca ozellik ikonu soluyor, ortada tek parlak "gorev kalitesi" kaliyor.
**caption:** dogru seyi mukemmel yapmak. #buildinpublic #softwareengineering

## reel 9 — ayni bina, ayri daireler
**hook:** "30 app'i tek veritabanina koydum. karismadi."
**akis:** korktum once, hepsi karisir diye / ama her app kendi onekli tablosunda: irglobe_, mib_ / RLS = veritabani duvari, kimse baskasinin verisine giremez / tek bina, ayri kilitli daireler.
**gorsel:** table editor listesi, tablolar onlerine renkli kilit ikonlariyla gruplaniyor.
**caption:** tek omurga, tam izolasyon. #supabase #buildinpublic #multitenant

## reel 10 — blast radius
**hook:** "bu satiri silsem ne kirilir?"
**akis:** vibecoder'in en cok korktugu soru / cunku haritayi bilmiyor / arac cagri grafiginden gosteriyor: bu fonksiyona kim bagli, silinirse ne coker / korkmadan dokunabilmek icin.
**gorsel:** bir dugume tiklaninca ona bagli tum kod satirlari kirmiziya donuyor.
**caption:** korkuyu haritayla degistirmek. #buildinpublic #vibecoding

## reel 11 — utanc bir yol haritasindan iyidir
**hook:** "beni bu urunu duzeltmeye iten sey bir roadmap degildi. utancti."
**akis:** kendi yaptigim seyin slop oldugunu gormek / o an planlamadan cok daha guclu / en iyi ozellikler o utanctan cikti.
**gorsel:** eski ekran + "SLOP" damgasi, sonra ayni ekranin diriltilmis hali.
**caption:** en iyi motivasyon bazen gurur degil, mahcubiyet. #buildinpublic #founder

## reel 12 — neden hala kod ogreniyorum
**hook:** "AI yaziyorsa neden hala kodu anlamam gereksin?"
**akis:** cunku shiplemek bitti, ayakta kalmak baslıyor / ilk edge-case, ilk yeni ozellik, AI'in kurmadigi sey / iste orada koduna hakim olan kalir, sadece bakan gider / bu ucurumu kapatmak bu dalganin kimin isi olacagini belirleyecek.
**gorsel:** iki yol: biri "sadece bakan" solup gidiyor, digeri "hakim olan" devam ediyor.
**caption:** shiplemek ile sahiplenmek arasindaki ucurum. #vibecoding #buildinpublic #softwareengineering

## reel 13 — README'yi de AI yazmis
**hook:** "slop yakalayan uygulamamin README'sini AI yazmis."
**akis:** aylar sonra repoyu birine gonderecektim / actim, README dogru ama sesim yok, tipik makine metni / komik olan: benim urunum tam da bunu yakaliyor, "sen mi yazdin yoksa onayladin mi" / kendi kapim testten kaliyordu / bu yuzden bastan, kendi sesimle yazdim.
**gorsel:** duz, soguk README metni ekranda, uzerine "generated?" damgasi, sonra silinip elle, birinci tekil sahisla yeniden yaziliyor.
**caption:** kendi urununun testinden gecmek, ilk kapidan basliyor. #buildinpublic #vibecoding #readme

## reel 14 — sikici is: 30 repoyu tasimak
**hook:** "kimse bunun reel'ini cekmiyor: tum markayi tasimak."
**akis:** sesli README yazmadan once cozmem gereken sikici sey / tum ekosistem tek GitHub kimligindeydi, hepsini noseydewdrop'a tasiyordum / her repo, her link, her deploy kirilmadan / sira onemliydi: once tasi, sonra yaz / olu URL'e isaret eden guzel bir README'nin anlami yok.
**gorsel:** onlarca repo ikonu eski isimden yeni isme akiyor, linkler tek tek yesile donuyor, sonra README yazilmaya basliyor.
**caption:** parlak isten once sikici altyapi. sira onemli. #buildinpublic #softwareengineering #rebrand

## reel 15 — sahiplenmek bir faz degil, standart
**hook:** "kendi kodunu sahiplenmek bitmez. her dosyada yeniden karar verirsin."
**akis:** uretilen README ile elle yazilan README arasindaki mesafe / bu urunun olctugu mesafenin ta kendisi / eger kendi on sayfamda o acigi kapatamazsam, baskasinin kodunda olcmeye hakkim yok / o yuzden en kucuk dosyada bile sesim benim.
**gorsel:** iki README yan yana: biri makine grisi, biri elle renkli; kamera "en kucuk dosya" olan README'ye zoom yapiyor.
**caption:** shiplemek bir an, sahiplenmek bir alışkanlık. #buildinpublic #founder #vibecoding

## reel 16 — kimse paylasmadigi araci kullanmiyor
**hook:** "aracim harikaydi. kimse acmadi. cunku paylasilacak hicbir sey yoktu."
**akis:** analiz bitiyordu, ekranda guzel bir harita kaliyordu / ama ozel bir ekranda / ne bir sayi ne bir ekran goruntusu / kimse ozel bir seyi post etmez / o yuzden tek durust sayi cikardim: kodunun yuzde kacini gercekten aciklayabilirsin / ve onu paylasilabilir bir karta koydum. koddan tek satir sizmadan, sadece sayi.
**gorsel (EN text-on-video):** private map screen -> a card slides out: "you can explain 61% of your own repo — certified vibecoder", altinda download / copy.
**caption:** a tool nobody shares looks dead, even when it works. so i built the share card. #buildinpublic #vibecoding #indiehacker

## reel 17 — ilk 15 saniyede sihir, guven sonra
**hook:** "insanlardan once repo'sunu istiyordum. yanlisti."
**akis:** yabanci geliyor, elinde repo yok ya da yapistirmaya cekiniyor / ilk sihir icin once guven istiyordum, tersi olmali / o yuzden tek tikla ornek bir repo'yu, kendiminkini, aninda analiz eden bir buton koydum / sihir 15 saniyede oynuyor, hicbir sey sormadan / hem de tam da kendi flopware'imi roast ederek.
**gorsel (EN text-on-video):** empty paste box -> "roast a sample repo" tiklaniyor -> log lines akiyor -> map + score 15 saniyede beliriyor.
**caption:** the wow has to land before the ask. #buildinpublic #onboarding #vibecoding

## reel 18 — bu satiri silsem ne kirilir, artik paylasilabilir
**hook:** "bahse girerim tahmin edemezsin: bu satiri degistirsem ne kirilir?"
**akis:** motor bunu zaten tarayicida gercekten calistirip buluyordu / ama sonuc ozel ekranda kaliyordu / simdi tek cumlelik gercegi bir karta koyuyorum: '>=' yi '>' yaparsan isAdult(18) kiriliyor, ustelik testlerin bunu yakalamiyor / vibecoder'in en cok korktugu soru, artik bir meydan okuma / isim sizmasin istersen isimleri bulaniklastir.
**gorsel (EN text-on-video):** what-if paneli, bir dugum kirmiziya donuyor -> card: "changing >= to > breaks isAdult(18). your tests wouldn't catch it." blur-names toggle gorunur.
**caption:** the scariest question in your repo, turned into a dare. numbers only, code stays. #buildinpublic #vibecoding #privacy
