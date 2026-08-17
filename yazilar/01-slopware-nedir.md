# slopware nedir, ve neden tam da şimdi konuşuyoruz?

Bir şeyi ekrana getirmek hiç bu kadar ucuz olmamıştı. Bir cümle yazıyorsun,
karşına çalışan bir arayüz çıkıyor, tıklıyorsun tepki veriyor, rengi de güzel.
On dakika önce ortada hiçbir şey yokken şimdi elinde bir "ürün" var, ve o ürün
sana kendini gerçek gibi hissettiriyor. İşte bu his yüzünden bu seriyi yazıyorum,
çünkü çalışıyor gibi görünen bir şeyle gerçekten ayakta duran bir şey arasındaki
mesafeyi artık kimse ölçmüyor.

Slopware, o mesafenin içine düşen yazılıma verdiğim ad. Demosu var, ekranı var,
belki bir de landing sayfası var. Ama açıp kapattığında hafızası siliniyor, ya da
sırlarını herkesin görebileceği bir yere koymuş, ya da testleri hiç koşmadan
kendini yeşil sanıyor. Kötü niyetli bir şey değil bu, çoğu zaman heyecanlı bir
insanın hızla yaptığı bir şey, ve o insanın kimse ona doğrusunu göstermemiş olması
tek suçu.

Hemen bir yanlış anlaşılmayı kapatayım. Slopware demek "yapay zeka yazdı demek"
değil. Ben de modele kod yazdırıyorum, bu seriyi okurken de yazdıracağım, ve
projelerimin içinde açıkça wrapper olan şeyler var, onları saklamıyorum. Mesele
kodu kimin yazdığı değil, o kodun arkasında bir sistem olup olmadığı. Bir şeyin
tekrar tekrar, sen bakmıyorken, senin bilmediğin girdilerle doğru çalışacağına dair
bir sebebin var mı, işte bütün soru bu.

Neden şimdi diye soruyorsan, cevap üretimin fiyatında. Token ucuzladı, üretim
hızlandı, ve bir fikirle çalışan bir demo arasındaki mesafe neredeyse sıfıra indi.
Bu harika bir şey, benim gibi on bir yaşından beri kod yazan biri için bile
harika. Ama aynı ucuzluk şunu da yaptı, artık piyasada birbirine benzeyen,
hepsi ilk beş saniyede etkileyici duran, altıncı saniyede dağılan çok fazla şey
var. İnsanlar bunu görüyor ve "ai slop" deyip geçiyor, ama geçmek yetmiyor,
çünkü o sözü söyleyen kişi kendi projesinin de aynı çukurda olup olmadığını
bilmiyor.

Bu seri tam olarak onu öğretecek. Her bölümde bir işaret alacağız, o işaretin
neden ortaya çıktığını anlatacağım, kendi kodunda nasıl fark edeceğini
göstereceğim, ve sonra doğrusunun nasıl kurulduğunu kendi projelerimden
göstereceğim. Çünkü ben bu hataların hepsini yaptım, ve bazılarını düzeltirken
kurduğum şeyler şu anda çalışıyor. stitchu'da bir kalıbın dikilebilir olup
olmadığını kontrol eden bir denetim var, lulumelon'un mühürlü bir kaydı var,
rabadon bir komutun gerçekten başarılı bitip bitmediğine karar veriyor. Bunların
hepsi bir bölümde "işte doğrusu böyle görünüyor" diye önüne gelecek.

Şimdilik altı bölüm var:

**localhost:3000 cesareti.** Deploy edilmemiş bir şeyin ürün sanılması. Kendi
makinende çalışan bir demoyla, senin uyurken başkasının kullandığı bir sistem
arasındaki fark.

**Hafızasız sistemler.** Her yenilemede seni unutan uygulama. Veri nerede durur,
state ne demektir, ve neden bir şeyin gerçekten var olması için bir yere yazılması
gerekir.

**Sır tutamayanlar.** env dosyası nedir, API anahtarını tarayıcıya gömünce ne olur,
ve bir sabah uyandığında faturayı neden senin ödediğini.

**Test etmeden yeşil sanmak.** Suite'i olmayan yazılım, ve exit 0'ı başarı sanmak.
Bilgisayarın sana "tamam" demesiyle işin doğru olması aynı şey değil, bunu
tüketici diliyle anlatacağım.

**Wrapper anatomisi.** Bir wrapper ne zaman öğrenme aracıdır, ne zaman ürün
taklidi olur. Bu bölümde kendi wrapper'larımı açacağım.

Havuzda bekleyen başlıklar da var, her şeyi koda gömmek, hata mesajını try/catch
içinde sessizce yutmak, ve "yapay zeka yazdı ben okumadım" kodu. Seri tutarsa
onlarla dokuza çıkarız.

Son bir şey. Burada kimseyi aşağılamıyoruz. Slopware yazan insan tembel değil,
sadece kendisine kimsenin göstermediği bir şeyi bilmiyor, ve bu serinin varlık
sebebi de o. Ben sana göstereceğim, sen de bir daha aynı çukura düşmeyeceksin,
anlaşma bu kadar basit.

Haftaya localhost:3000 ile başlıyoruz.
