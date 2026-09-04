/* olcum.js — calisan sayfada ne oluyor. Tahmin degil, olcum.
 *
 * kontrol.py dosyalara bakiyor: "bu kural yazilmis mi". Burada ise sayfa
 * gercekten calisiyor: tik atiliyor, metin seciliyor, sayac okunuyor.
 * Ikisi ayri is; biri digerini yakalamaz.
 */
(() => {
  const r = { hata: [] };
  const de = (ad, kosul, ayrinti) => { if (!kosul) r.hata.push(ad + (ayrinti ? " · " + ayrinti : "")); };

  // --- iskelet ---
  const govde = document.querySelector(".kitap div.body, .kitap-tam");
  de("gövde yok", !!govde);
  de("araç çubuğu yok", !!document.getElementById("arac-cubuk"));
  de("isim dialogu yok", !!document.getElementById("ad-kutu"));
  // Bülten ucu kapalıyken (tablo yok) kutu kurulmuyor ve düğme [log in]
  // gibi tıklanmaz duruyor. O hâlde aranan şey kutu değil, dürüst kapalılık:
  // köşeli parantezli ama tıklanmaz bir etiket.
  const mailKutu = document.getElementById("mail-kutu");
  const mailKapali = document.querySelector('.yakinda[aria-disabled="true"]');
  de("mail ne kutu ne kapalı etiket", !!mailKutu || !!mailKapali);
  if (!mailKutu && mailKapali) {
    de("kapalı mail düğmesi tıklanabilir görünüyor",
       mailKapali.tagName !== "BUTTON" && !mailKapali.querySelector("button"));
  }
  de("selamlama yok", !!document.querySelector(".selam"));

  // --- kontrol tiki gercekten calisiyor mu ---
  const kutu = document.querySelector("label.gec input.gec-kutu");
  if (kutu) {
    // Depoyu silmek yetmiyor: site.js açık/kapalı durumu sayfa yüklenirken
    // okuduğu bir değişkende tutuyor ve silme onu bayatlatıyor. Kutuyu
    // gerçekten işaretli olmayan bir hâle getirip öyle tıklıyoruz.
    if (kutu.checked) kutu.click();
    kutu.click();
    const depo = localStorage.getItem("vibecodedslopware.gecilen") || "";
    de("tik localStorage'a düşmedi", depo.indexOf(window.BOLUM) !== -1, depo);
    de("kenarda üstü çizilmedi", document.querySelectorAll("li.kenar-bolum.gecti").length > 0);
    const sayac = (document.querySelector(".kenar-sayi") || {}).textContent || "";
    const yuz = (document.querySelector(".kenar-yuzde") || {}).textContent || "";
    r.sayac = sayac.trim();
    de("bir bölüm geçildi ama yüzde %0", yuz.trim() !== "0%", yuz.trim());
  }

  // --- secim araclari gercekten calisiyor mu ---
  const p = govde && govde.querySelector("p");
  if (p && p.firstChild) {
    localStorage.removeItem("vibecodedslopware.isaret." + window.BOLUM);
    const a = document.createRange();
    a.setStart(p.firstChild, 3);
    a.setEnd(p.firstChild, 30);
    const s = window.getSelection();
    s.removeAllRanges(); s.addRange(a);
    document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    return new Promise(c => setTimeout(() => {
      const hl = document.querySelector('#arac-cubuk [data-arac="hl"]');
      de("araç çubuğu seçimde açılmadı",
         document.getElementById("arac-cubuk").classList.contains("acik"));
      if (hl) hl.click();
      de("highlight yazıya işlenmedi", govde.querySelectorAll("mark.im-hl").length > 0);
      const im = localStorage.getItem("vibecodedslopware.isaret." + window.BOLUM) || "";
      de("işaret saklanmadı", im.indexOf('"hl"') !== -1);
      c(bitir());
    }, 120));
  }

  return bitir();

  function bitir() {
  // --- gorunur duzen ---
  const kenar = document.querySelector("nav.kenar");
  const kagit = document.querySelector(".kitap .document");
  const not = document.querySelector(".kitap .kenar-not");
  if (kenar && kagit) {
    const k = kenar.getBoundingClientRect(), g = kagit.getBoundingClientRect();
    de("sol kolon yazının solunda değil", k.left < g.left);
    r.kolonlar = [Math.round(k.width), Math.round(g.width), not ? Math.round(not.getBoundingClientRect().width) : 0];
  }
  if (not && kagit) {
    const n = not.getBoundingClientRect(), g = kagit.getBoundingClientRect();
    de("kenar notu yazının altına düşmüş", n.top < g.bottom - 40, "top=" + Math.round(n.top));
  }
  // Kenar payi: icerik ekranin kenarina yapismasin, ama yarim ekran da olmasin
  const ust = document.querySelector("ul.navbar");
  if (ust) {
    const pay = parseFloat(getComputedStyle(ust).paddingLeft);
    r.kenarPayi = pay;
    de("kenar payı yok", pay >= 12, pay + "px");
    de("kenar payı fazla", pay <= 90, pay + "px");
  }
  // Yatay tasma
  de("sayfa yana kayıyor", document.documentElement.scrollWidth <= window.innerWidth + 2,
     document.documentElement.scrollWidth + " > " + window.innerWidth);

  // --- tekrar eden baglanti ---
  const ustBaglar = [...document.querySelectorAll("ul.navbar a")].map(a => a.getAttribute("href"));
  const seritBaglar = [...document.querySelectorAll(".related a:not(.gizli-yon a)")]
        .map(a => a.getAttribute("href"));
  const tekrar = seritBaglar.filter(h => h && ustBaglar.indexOf(h) !== -1);
  de("gezinti şeridi navbarı tekrar ediyor", tekrar.length === 0, tekrar.join(","));

  // --- prev/next bir kere ---
  r.yon = document.querySelectorAll("nav.sonraki a").length;
  de("prev/next çift basılmış", r.yon <= 2, "adet=" + r.yon);

  r.sonuc = r.hata.length ? "KALDI" : "TEMIZ";
  return JSON.stringify(r, null, 1);
  }
})()
