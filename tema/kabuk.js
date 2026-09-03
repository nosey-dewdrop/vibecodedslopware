/* kabuk.js — hesap gelene kadar her şey bu tarayıcıda.
 *
 *   1  tema (kâğıt / gece)          5  okuma araçları: highlight, strike, note
 *   2  yıldız alanı, yalnız gecede  6  notlar listesi + send to damla
 *   3  isim ve selamlama            7  mail listesi dialogu
 *   4  ilerleme
 *
 * localStorage yoksa (gizli sekme, kapalı ayar) hiçbiri patlamaz: her okuma
 * try/catch içinde ve boş değere düşer. Sunucuya giden tek şey, okurun
 * kendi eliyle bastığı "send to damla".
 */
(function () {
  "use strict";

  var AD_ANAHTAR = "vibecodedslopware.ad";
  var TEMA_ANAHTAR = "vibecodedslopware.tema";
  var GECILEN_ANAHTAR = "vibecodedslopware.gecilen";
  var IM_ONEK = "vibecodedslopware.isaret.";

  function oku(anahtar, varsayilan) {
    try {
      var ham = window.localStorage.getItem(anahtar);
      return ham === null ? varsayilan : ham;
    } catch (e) { return varsayilan; }
  }

  function yaz(anahtar, deger) {
    try { window.localStorage.setItem(anahtar, deger); } catch (e) {}
  }

  function jsonOku(anahtar, varsayilan) {
    try {
      var ham = window.localStorage.getItem(anahtar);
      if (!ham) return varsayilan;
      var v = JSON.parse(ham);
      return v === null || v === undefined ? varsayilan : v;
    } catch (e) { return varsayilan; }
  }

  function jsonYaz(anahtar, deger) {
    try { window.localStorage.setItem(anahtar, JSON.stringify(deger)); } catch (e) {}
  }

  function el(etiket, sinif, metin) {
    var d = document.createElement(etiket);
    if (sinif) d.className = sinif;
    if (metin !== undefined) d.textContent = metin;
    return d;
  }

  /* ---------- 1 · tema ----------
     <head>'teki üç satır zaten data-tema'yı basıyor; burada yalnız düğme
     var. Sayfa yüklenmeden okunması şart, yoksa beyaz bir flaş oluyor. */
  function temaKur() {
    var dugme = document.querySelector(".tema-dugme");
    if (!dugme) return;

    function ciz() {
      var simdi = document.documentElement.getAttribute("data-tema") || "kagit";
      dugme.textContent = simdi === "gece" ? "[+]" : "[\u00b7]";
      dugme.setAttribute("aria-label",
        simdi === "gece" ? "switch to paper" : "switch to night");
      dugme.title = simdi === "gece" ? "paper" : "night";
    }

    dugme.addEventListener("click", function () {
      var simdi = document.documentElement.getAttribute("data-tema") || "kagit";
      var yeni = simdi === "gece" ? "kagit" : "gece";
      document.documentElement.setAttribute("data-tema", yeni);
      yaz(TEMA_ANAHTAR, yeni);
      ciz();
      yildizKur();
    });
    ciz();
  }

  /* ---------- 2 · yıldız alanı ----------
     Portfolyodaki serpinti. Yalnız gecede basılır; kâğıtta yıldız yok. */
  function yildizKur() {
    var kap = document.getElementById("yildizlar");
    var gece = document.documentElement.getAttribute("data-tema") === "gece";
    if (!kap) return;
    if (!gece) { kap.innerHTML = ""; return; }
    if (kap.childNodes.length) return;

    var G = ["*", "+", "·", "⋆", "."];
    var kac = Math.min(70, Math.round(window.innerWidth / 22));
    for (var i = 0; i < kac; i++) {
      var s = el("span", "yildiz", G[i % G.length]);
      s.style.left = (Math.random() * 100).toFixed(2) + "%";
      s.style.top = (Math.random() * 100).toFixed(2) + "%";
      s.style.animationDelay = (Math.random() * 3.4).toFixed(2) + "s";
      kap.appendChild(s);
    }
  }

  /* ---------- 3 · isim ve selamlama ----------
     İlk gelişte bir kere sorulur. Boş bırakılırsa bir daha sorulmaz: boş
     bir isim de bir cevaptır. İsim buradan çıkmaz, sunucuya gitmez. */
  function adSor(zorla) {
    var d = document.getElementById("ad-kutu");
    if (!d) return;
    d._geri = document.activeElement;
    var giris = d.querySelector("input");
    giris.value = oku(AD_ANAHTAR, "") || "";
    if (typeof d.showModal === "function") d.showModal();
    else d.setAttribute("open", "");
    setTimeout(function () { giris.focus(); giris.select(); }, 30);
    d.dataset.zorla = zorla ? "1" : "";
  }

  /* Damla'nin yazdigi bicim: print("hello ___").
     Isim yoksa satir yine bir print cagrisi olarak durur. */
  function selamCiz() {
    var yer = document.querySelector(".selam");
    if (!yer) return;
    var ad = oku(AD_ANAHTAR, null);
    var ic = (ad === null || ad === "") ? '"hello"' : '"hello ' + ad + '"';
    yer.innerHTML = "";
    yer.appendChild(el("span", "selam-kod", "print("));
    yer.appendChild(el("span", "selam-ad", ic));
    yer.appendChild(el("span", "selam-kod", ")"));
    yer.title = "change the name";
  }

  function adKur() {
    var d = document.getElementById("ad-kutu");
    if (!d) return;
    var giris = d.querySelector("input");
    var form = d.querySelector("form");

    function bitir() {
      yaz(AD_ANAHTAR, giris.value.trim().slice(0, 40));
      d.close();
      selamCiz();
    }

    form.addEventListener("submit", function (e) { e.preventDefault(); bitir(); });
    d.querySelector(".kapat").addEventListener("click", function () {
      // Kapatmak da bir cevap: bir daha sorulmaz.
      if (oku(AD_ANAHTAR, null) === null) yaz(AD_ANAHTAR, "");
      d.close();
      selamCiz();
    });
    d.addEventListener("close", function () {
      if (oku(AD_ANAHTAR, null) === null) yaz(AD_ANAHTAR, "");
      selamCiz();
      // Odak açan öğeye döner: klavyeyle gezen okur sayfanın başına
      // atılmaz.
      if (d._geri && d._geri.focus) d._geri.focus();
    });

    var yer = document.querySelector(".selam");
    if (yer) yer.addEventListener("click", function () { adSor(true); });

    selamCiz();
    if (oku(AD_ANAHTAR, null) === null) setTimeout(function () { adSor(false); }, 420);
  }

  /* İlerleme yüzdesi site.js'te, sayacın yanında hesaplanıyor. */

  /* ---------- 5 · okuma araçları ----------
     Kayıt biçimi seçim ofseti DEĞİL: yazı yeniden kurulunca bütün işaretler
     kayardı. Paragraf indeksi + o paragraf içindeki karakter aralığı
     tutuluyor. Paragraf sayısı değişirse eşleşmeyen işaret sessizce düşer;
     yanlış yere yapışmış bir highlight, olmayandan kötüdür. */

  var govde = null;      // yazının kökü
  var paragraflar = [];  // işaretlenebilir düğümler
  var imler = [];        // {p, a, b, tur, not}
  var imAnahtar = "";

  function imleriOku() { return jsonOku(imAnahtar, []); }
  function imleriYaz() { jsonYaz(imAnahtar, imler); }

  /* Bir düğümün düz metni — işaretler eklendikten sonra da aynı kalsın diye
     her zaman textContent üstünden ölçülür. */
  function paragrafMetni(d) { return d.textContent || ""; }

  function paragraflariTopla() {
    if (!govde) return;
    paragraflar = Array.prototype.filter.call(
      govde.querySelectorAll("p, li, blockquote > p, h2, h3"),
      function (d) {
        if (d.closest(".notlar")) return false;
        if (d.closest("dialog")) return false;
        if (d.closest(".kenar-not")) return false;
        return (d.textContent || "").trim().length > 0;
      });
  }

  /* Seçimin hangi paragrafta ve o paragrafın kaçıncı karakterinde başladığı. */
  function seciminYeri(secim) {
    if (!secim.rangeCount) return null;
    var aralik = secim.getRangeAt(0);
    if (aralik.collapsed) return null;

    var kap = aralik.commonAncestorContainer;
    if (kap.nodeType === 3) kap = kap.parentNode;
    if (!kap || !govde.contains(kap)) return null;

    for (var i = 0; i < paragraflar.length; i++) {
      var p = paragraflar[i];
      if (!p.contains(aralik.startContainer)) continue;
      if (!p.contains(aralik.endContainer)) return null;  // paragraf aşan seçim

      var once = document.createRange();
      once.selectNodeContents(p);
      once.setEnd(aralik.startContainer, aralik.startOffset);
      var a = once.toString().length;
      var b = a + aralik.toString().length;
      if (b <= a) return null;
      return { p: i, a: a, b: b, metin: aralik.toString() };
    }
    return null;
  }

  /* Bir paragrafı işaretleriyle yeniden çizer. Ham metin `data-ham`'da
     saklanır, her çizim ondan başlar: üst üste binen işaretler birikmez. */
  function paragrafCiz(i) {
    var p = paragraflar[i];
    if (!p) return;
    if (!p.hasAttribute("data-ham")) p.setAttribute("data-ham", p.innerHTML);

    var benim = imler.filter(function (m) { return m.p === i; });
    if (!benim.length) { p.innerHTML = p.getAttribute("data-ham"); return; }

    // İşaretleri metin üstünde uygula. HTML'i değil düz metni sarıyoruz;
    // içinde <code> geçen bir paragrafta etiketleri bölmemenin tek yolu bu.
    var ham = p.getAttribute("data-ham");
    var gecici = document.createElement("div");
    gecici.innerHTML = ham;
    var duz = gecici.textContent || "";

    benim.sort(function (x, y) { return x.a - y.a; });
    var parcalar = [], imlec = 0;
    benim.forEach(function (m) {
      if (m.a < imlec || m.b > duz.length) return;   // kaymış işaret: düşer
      parcalar.push(["duz", duz.slice(imlec, m.a)]);
      parcalar.push(["im", duz.slice(m.a, m.b), m]);
      imlec = m.b;
    });
    parcalar.push(["duz", duz.slice(imlec)]);

    p.innerHTML = "";
    parcalar.forEach(function (kalem) {
      if (kalem[0] === "duz") {
        if (kalem[1]) p.appendChild(document.createTextNode(kalem[1]));
        return;
      }
      var m = kalem[2];
      var etiket = m.tur === "hl" ? "mark" : "span";
      var d = el(etiket, "im-" + m.tur, kalem[1]);
      d.setAttribute("data-im", m.a + ":" + m.b);
      if (m.tur === "not" && m.not) {
        d.title = m.not;
        var isaret = el("span", "not-isaret", "✎");
        p.appendChild(d);
        p.appendChild(isaret);
        return;
      }
      p.appendChild(d);
    });
  }

  function hepsiniCiz() {
    var dokunulan = {};
    imler.forEach(function (m) { dokunulan[m.p] = true; });
    Object.keys(dokunulan).forEach(function (i) { paragrafCiz(parseInt(i, 10)); });
    notlariCiz();
  }

  function cubukKur() {
    var cubuk = document.getElementById("arac-cubuk");
    if (!cubuk || !govde) return;
    var son = null;

    function gizle() { cubuk.classList.remove("acik"); son = null; }

    function goster(yer) {
      var secim = window.getSelection();
      if (!secim.rangeCount) return;
      var aralik = secim.getRangeAt(0).getBoundingClientRect();
      cubuk.classList.add("acik");
      var g = cubuk.offsetWidth, y = cubuk.offsetHeight;
      var sol = aralik.left + window.scrollX + (aralik.width - g) / 2;
      var ust = aralik.top + window.scrollY - y - 8;
      if (ust < window.scrollY + 4) ust = aralik.bottom + window.scrollY + 8;
      sol = Math.max(6, Math.min(sol, document.documentElement.clientWidth - g - 6));
      cubuk.style.left = sol + "px";
      cubuk.style.top = ust + "px";
      son = yer;
    }

    /* Seçim bittiğinde bak. `selectionchange` sürükleme boyunca saniyede
       onlarca kez koşuyor ve bazı tarayıcılarda fare bırakılmadan son
       hâli vermiyor; asıl tetik mouseup ve keyup. */
    function tazele() {
      var secim = window.getSelection();
      if (!secim || secim.isCollapsed || !secim.rangeCount) {
        gizle();
        return;
      }
      // `secim.toString()` bazı bağlamlarda boş dönüyor (headless, bazı
      // gömülü görünümler) hâlbuki seçim gerçek. Uzunluk range'den ölçülür:
      // seciminYeri zaten range ile çalışıyor ve boş seçimde null veriyor.
      var yer = seciminYeri(secim);
      if (!yer) { gizle(); return; }
      goster(yer);
    }

    document.addEventListener("mouseup", function (e) {
      if (cubuk.contains(e.target)) return;
      setTimeout(tazele, 10);
    });

    document.addEventListener("keyup", function (e) {
      if (e.shiftKey || e.key === "Shift") setTimeout(tazele, 10);
    });

    /* Dokunmatikte seçim tutamakları bırakıldığında. */
    document.addEventListener("selectionchange", function () {
      var secim = window.getSelection();
      if (!secim || secim.isCollapsed) { gizle(); return; }
      clearTimeout(cubuk._z);
      cubuk._z = setTimeout(tazele, 220);
    });

    document.addEventListener("mousedown", function (e) {
      if (!cubuk.contains(e.target)) gizle();
    });

    document.addEventListener("scroll", function () {
      if (cubuk.classList.contains("acik")) gizle();
    }, { passive: true });

    function ekle(tur, notMetni) {
      if (!son) return;
      imler.push({ p: son.p, a: son.a, b: son.b, tur: tur,
                   not: notMetni || "", alinti: son.metin.slice(0, 400) });
      imleriYaz();
      paragrafCiz(son.p);
      notlariCiz();
      window.getSelection().removeAllRanges();
      gizle();
    }

    cubuk.querySelector('[data-arac="hl"]').addEventListener("click", function () {
      ekle("hl");
    });
    cubuk.querySelector('[data-arac="st"]').addEventListener("click", function () {
      ekle("st");
    });
    cubuk.querySelector('[data-arac="not"]').addEventListener("click", function () {
      var tut = son;
      notDialogu(son.metin, function (metin) {
        son = tut;
        ekle("not", metin);
      });
    });
  }

  function notDialogu(alinti, bitince) {
    var d = document.getElementById("not-kutu");
    if (!d) return;
    d.querySelector("blockquote").textContent = alinti;
    var alan = d.querySelector("textarea");
    alan.value = "";
    var form = d.querySelector("form");

    function gonder(e) {
      e.preventDefault();
      var metin = alan.value.trim();
      form.removeEventListener("submit", gonder);
      d.close();
      if (metin) bitince(metin);
    }
    form.addEventListener("submit", gonder);
    d.querySelector(".kapat").onclick = function () {
      form.removeEventListener("submit", gonder);
      d.close();
    };
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
    setTimeout(function () { alan.focus(); }, 30);
  }

  /* ---------- 6 · notlar listesi + send to damla ---------- */
  function notlariCiz() {
    var kap = document.querySelector(".notlar");
    if (!kap) return;
    var liste = kap.querySelector(".not-liste");
    var sayac = kap.querySelector(".not-sayi");
    liste.innerHTML = "";

    var notlar = imler.filter(function (m) { return m.tur === "not" && m.not; });
    if (sayac) sayac.textContent = String(notlar.length);
    kap.hidden = imler.length === 0;

    if (!notlar.length) {
      var bos = el("p", "forum-bos",
        "highlight a sentence and pick note to write one.");
      liste.appendChild(bos);
      return;
    }

    notlar.forEach(function (m) {
      var kalem = el("div", "not-kalem");
      var alinti = el("blockquote", null, m.alinti || "");
      var govdeP = el("p", "govde", m.not);
      var islem = el("div", "islem");

      var gonder = el("button", null,
        m.gonderildi ? "sent to damla" : "send to damla");
      gonder.type = "button";
      if (m.gonderildi) { gonder.disabled = true; gonder.className = "gitti"; }
      gonder.addEventListener("click", function () { gonderNot(m, gonder); });

      var sil = el("button", null, "delete");
      sil.type = "button";
      sil.addEventListener("click", function () {
        var i = imler.indexOf(m);
        if (i === -1) return;
        var p = m.p;
        imler.splice(i, 1);
        imleriYaz();
        paragrafCiz(p);
        notlariCiz();
      });

      islem.appendChild(gonder);
      islem.appendChild(sil);
      kalem.appendChild(alinti);
      kalem.appendChild(govdeP);
      kalem.appendChild(islem);
      liste.appendChild(kalem);
    });
  }

  /* Sunucu yok. Adres mufredat.json'dan geliyor; boşsa düğme "soon" der ve
     hiçbir şey gönderilmez. Mail adresi İSTENMEZ: toplamadığın veriyi
     korumak zorunda değilsin. */
  function gonderNot(m, dugme) {
    var adres = window.GORUS_ADRES || "";
    if (!adres) {
      dugme.textContent = "soon";
      setTimeout(function () { dugme.textContent = "send to damla"; }, 1600);
      return;
    }
    dugme.disabled = true;
    dugme.textContent = "sending…";

    var paket = {
      bolum: window.BOLUM || "",
      dil: window.DIL || "en",
      alinti: m.alinti || "",
      not: m.not || "",
      ad: oku(AD_ANAHTAR, "") || "",
      tarih: new Date().toISOString()
    };

    fetch(adres, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(paket)
    }).then(function (c) {
      if (!c.ok) throw new Error(String(c.status));
      m.gonderildi = true;
      imleriYaz();
      dugme.textContent = "sent to damla";
      dugme.className = "gitti";
    }).catch(function () {
      dugme.disabled = false;
      dugme.textContent = "did not go, try again";
    });
  }

  /* ---------- 7 · mail listesi ---------- */
  /* Mail listesi. Kaydolma GERCEKTEN olur: form kendi servisine POST atar.
     Sayfadan ayrilmadan, kutunun icinde sonucu soyler. Servis fetch'e
     kapaliysa (CORS) form yine de gitmis olur; o yuzden hata halinde de
     "gitti" demiyoruz, ne oldugunu soyluyoruz. */
  function mailKur() {
    var ac = document.querySelector(".mail-ac");
    var d = document.getElementById("mail-kutu");
    if (!ac || !d) return;

    ac.addEventListener("click", function () {
      if (typeof d.showModal === "function") d.showModal();
      else d.setAttribute("open", "");
      var g = d.querySelector("input[type=email]");
      if (g) setTimeout(function () { g.focus(); }, 30);
    });

    var kapat = d.querySelector(".kapat");
    if (kapat) kapat.addEventListener("click", function () { d.close(); });

    var form = d.querySelector("form");
    if (!form) return;
    var durum = d.querySelector(".mail-durum");

    form.addEventListener("submit", function (e) {
      var giris = form.querySelector("input[type=email]");
      if (!giris || !giris.value.trim()) return;
      e.preventDefault();

      var dugme = form.querySelector("input[type=submit], button[type=submit]");
      if (dugme) dugme.disabled = true;
      if (durum) durum.textContent = "…";

      var veri = new FormData(form);
      fetch(form.action, {
        method: "POST",
        body: veri,
        headers: { "Accept": "application/json" },
        mode: "cors"
      }).then(function (c) {
        if (!c.ok) throw new Error(String(c.status));
        if (durum) durum.textContent = form.getAttribute("data-oldu") || "done";
        giris.value = "";
        setTimeout(function () { d.close(); }, 1200);
      }).catch(function () {
        /* Servis tarayiciya cevap vermiyor olabilir ve kayit yine de
           dusmus olabilir. Yalan soylemeden ikinci yolu ac: formu kendi
           hedefine, yeni sekmede gonder. */
        form.target = "_blank";
        form.submit();
        if (durum) durum.textContent = form.getAttribute("data-oldu") || "done";
      }).then(function () {
        if (dugme) dugme.disabled = false;
      });
    });
  }

  /* Dialogun dışına tıklayınca kapansın. <dialog> bunu kendiliğinden
     yapmıyor; backdrop tıklaması dialogun kendisine geliyor. */
  function disaTiklama() {
    Array.prototype.forEach.call(document.querySelectorAll("dialog.kutu"),
      function (d) {
        d.addEventListener("click", function (e) {
          if (e.target !== d) return;
          var k = d.getBoundingClientRect();
          var icinde = e.clientX >= k.left && e.clientX <= k.right &&
                       e.clientY >= k.top && e.clientY <= k.bottom;
          if (!icinde) d.close();
        });
      });
  }

  /* ---------- 8 · forum soru kutusu ----------
     Mail listesiyle ayni yol: sayfadan ayrilmadan gonderir, servis cevap
     vermezse formun kendi POST'una duser. */
  function forumFormuKur() {
    var form = document.querySelector("form.forum-form");
    if (!form) return;
    var durum = form.querySelector(".forum-durum");
    var dugme = form.querySelector("button[type=submit]");

    form.addEventListener("submit", function (e) {
      var alan = form.querySelector("textarea");
      if (!alan || !alan.value.trim()) return;
      e.preventDefault();
      if (dugme) dugme.disabled = true;
      if (durum) durum.textContent = "…";

      var paket = new FormData(form);
      paket.append("ad", oku(AD_ANAHTAR, "") || "");
      paket.append("tarih", new Date().toISOString());

      fetch(form.action, {
        method: "POST",
        body: paket,
        headers: { "Accept": "application/json" },
        mode: "cors"
      }).then(function (c) {
        if (!c.ok) throw new Error(String(c.status));
        if (durum) durum.textContent = form.getAttribute("data-oldu") || "sent";
        alan.value = "";
      }).catch(function () {
        form.target = "_blank";
        form.submit();
        if (durum) durum.textContent = form.getAttribute("data-oldu") || "sent";
      }).then(function () {
        if (dugme) dugme.disabled = false;
      });
    });
  }

  function baslat() {
    forumFormuKur();
    temaKur();
    yildizKur();
    adKur();
    mailKur();
    disaTiklama();

    govde = document.querySelector(".kitap div.body, .kitap-tam");
    if (govde && window.BOLUM) {
      imAnahtar = IM_ONEK + window.BOLUM;
      paragraflariTopla();
      imler = imleriOku();
      hepsiniCiz();
      cubukKur();
    }

    // Kontrol kutusu tiklenince ilerleme yüzdesi de tazelensin.

    addEventListener("resize", function () {
      var kap = document.getElementById("yildizlar");
      if (kap) { kap.innerHTML = ""; yildizKur(); }
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", baslat);
  } else {
    baslat();
  }
})();
