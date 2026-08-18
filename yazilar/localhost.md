Bir şey yaptın, çalışıyor. Tarayıcında duruyor, tıklıyorsun tepki veriyor, rengi de
güzel. Heyecanlanıp linki arkadaşına atıyorsun, ve o "açılmıyor" diyor. Sen tekrar
deniyorsun, sende gayet açılıyor. Bir tuhaflık var ama ne olduğunu bilmiyorsun.

Olan şu: o link senin bilgisayarının kendi kendine verdiği bir adres. Dışarıdan
kimse oraya ulaşamaz, çünkü o adres dışarıda diye bir yer bilmiyor.

## localhost tam olarak ne?

Bilgisayarında iki tür adres var. Biri dünyaya açılan kapı, diğeri **kendine yazdığın
mektup**. `localhost`, yani `127.0.0.1`, ikincisi. Oraya gönderdiğin her istek
bilgisayarından hiç çıkmıyor, ağ kartına bile uğramıyor, aynı makinenin içinde dönüp
sana geri geliyor. Buna loopback deniyor, ve adı tam olarak yaptığı şey: geri döngü.

Yani `localhost:3000` yazdığında olan şey şu , "bu makinede, 3000 numaralı kapıda
dinleyen program varsa onunla konuş". Arkadaşın aynı adresi yazdığında **kendi**
makinesinde 3000 numaralı kapıya bakıyor, orada da hiçbir şey olmadığı için hata
alıyor. Sana kızmıyor, sadece senin makineni göremiyor.

Peki `3000` ne? O bir port, yani kapı numarası. Bir bilgisayarda aynı anda onlarca
program çalışabilir ve hepsi ağdan konuşmak isteyebilir, o yüzden her biri kendine
bir kapı seçiyor. Web sunucusu 3000'de, veritabanın 5432'de, başka bir şey 8080'de.
Adresin sonundaki iki nokta ve rakam, "hangi kapı" demek.

## Bunu gözünle gör

Anlatmakla olmuyor, çalıştırınca oluyor. Terminali aç, herhangi bir klasöre gir ve
şunu yaz:

```
python3 -m http.server 8000
```

Şimdi tarayıcında `localhost:8000` adresini aç. O klasördeki dosyaları göreceksin.
Sunucun ayakta, çalışıyor, her şey yolunda görünüyor.

Şimdi telefonunu al ve aynı adresi telefonun tarayıcısına yaz. Açılmayacak. Wi-Fi'ın
aynı bile olsa açılmayacak, çünkü telefonun `localhost` dediğinde **telefonun kendi
kendisini** kastediyor.

Sunucuyu kapat ve bu sefer şöyle başlat:

```
python3 -m http.server 8000 --bind 0.0.0.0
```

`0.0.0.0`, "sadece kendi içimden değil, bütün ağ arayüzlerinden dinle" demek.
Şimdi bilgisayarının yerel ağdaki adresini bul , Mac'te `ipconfig getifaddr en0`,
Linux'ta `hostname -I` , ve telefonundan `http://192.168.1.x:8000` gibi bir şey yaz.
Bu sefer açılacak.

Tek fark iki komut arasındaki o küçük ek. Ve az önce demo ile ürün arasındaki ilk
çizgiyi kendi elinle çizdin.

## Ama "telefonumdan açıldı" da ürün demek değil

Şimdi tehlikeli kısım geliyor, çünkü insanların çoğu burada duruyor ve "tamam işte,
oldu" diyor. Olmadı. `0.0.0.0` ile açtığın şey sadece **aynı Wi-Fi ağındaki**
cihazlara görünüyor. Kafedeki arkadaşın göremiyor, müşterin göremiyor, yatırımcın
göremiyor.

Ve daha önemlisi: sen bilgisayarını kapattığın anda o şey ölüyor.

Gerçek bir ürünün senden bağımsız yaşaması gerekiyor. Sen uyurken, laptopun kapalıyken,
sen tatildeyken de birinin girip kullanabilmesi gerekiyor. Bunun için o kodun senin
makinende değil, **hep açık duran başka bir makinede** koşması lazım. Buna deploy
diyoruz ve beşinci bölümün konusu bu.

Aradaki fark şuna benziyor: evinde pasta yapabiliyorsan bu güzel bir şey, ama
pastane açmakla aynı şey değil. Pastanenin bir adresi var, sen orada olmasan da açık,
ve sabah gelen müşteri kapıyı çalınca içeride birileri var.

## Slopware'in en yaygın hali

Bu bölümün konusu teknik değil aslında, algı. İnsanlar localhost'ta çalışan bir şeyi
görüp "ürünüm var" diyorlar, ve o cümleyi kurduktan sonra ilerlemeyi bırakıyorlar.
Ekran görüntüsü alıyorlar, demo videosu çekiyorlar, hatta landing sayfası yapıyorlar ,
ama arkasında yayında hiçbir şey yok.

Ben bunu kendi projelerimde yaşadım, hem de bir kere değil. Şu anda makinemde iki
tane bitmiş proje duruyor. Biri `shortstorylong`, içinde 2272 tane konu var. Diğeri
`missingsemicolon`, içinde 1206 tane gerçek mülakat sorusu var. İkisi de çalışıyor,
ikisi de aylardır bitmiş durumda, ve **ikisi de canlıda değil.** Çünkü her seferinde
"deploy sonra, önce şunu ekleyeyim" dedim.

O iki proje bitmiş ürün değil, benim makinemde duran iki klasör. Kimse kullanamıyor.
Bitmiş olmalarının hiçbir anlamı yok, çünkü kimse göremiyor.

## Kendi projende nasıl kontrol edersin?

Üç soru, üçü de yirmi saniye sürüyor.

**Bir:** Adres çubuğundaki şey `localhost` ya da `127.0.0.1` ile mi başlıyor? Öyleyse
o şey henüz yayında değil, ne kadar iyi görünürse görünsün.

**İki:** Laptopunu kapatınca ölüyor mu? Kapat ve telefonundan **mobil veriyle**,
Wi-Fi kapalıyken aç. Açılmıyorsa yayında değil.

**Üç:** Bugüne kadar senden başka biri o adresi açtı mı? Bir kişi bile? Hayırsa,
elindeki şey bir ürün değil, bir prototip. Prototip olması kötü bir şey değil , ama
adını doğru koymak lazım, çünkü yanlış koyduğunda kendini yanlış yerde sanıyorsun.

Sonraki bölümde bir uygulamanın kaç parçadan oluştuğuna bakacağız, çünkü deploy'u
anlamak için önce **neyi** deploy ettiğini bilmek gerekiyor.
