/* kitap.js — üç küçük şey.
 *
 *   1  başlık kendini yazar
 *   2  imleç dolaştıkça ince bir iz bırakır
 *   3  dar ekranda müfredat listesi bir düğmeyle açılır
 *
 * Üçü de okumanın önüne geçmez: iz kâğıdın üstünde durmaz, yazının altında
 * kalır ve tıklamayı yakalamaz. Hareketi kapalı isteyen okurda hiçbiri koşmaz.
 */
(function () {
  "use strict";

  var azHareket = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1 · başlık kendini yazar ---------- */
  /* Bir kere, sayfa ilk açıldığında. Bölümden bölüme gezerken her seferinde
     yeniden yazılması okuru yorar, o yüzden oturumda bir kez. */
  (function () {
    var a = document.querySelector(".header a");
    if (!a || azHareket) return;
    try {
      if (sessionStorage.getItem("vibecodedslopware.yazildi")) return;
      sessionStorage.setItem("vibecodedslopware.yazildi", "1");
    } catch (e) { /* gizli sekme: yine de yaz */ }

    var ad = a.textContent;
    a.textContent = "";
    a.style.minHeight = "1em";
    var imlec = document.createElement("span");
    imlec.className = "yazim-imlec";
    imlec.textContent = "█";
    a.appendChild(imlec);

    var i = 0;
    (function adim() {
      if (i >= ad.length) {
        setTimeout(function () { imlec.remove(); }, 420);
        return;
      }
      imlec.insertAdjacentText("beforebegin", ad.charAt(i));
      i++;
      setTimeout(adim, 52);
    })();
  })();

  /* ---------- 2 · iz ---------- */
  /* Portfolyodaki serpintinin ince hâli. Orada renkli ve sık, burada bir
     kitabın kenarına düşen toz kadar: tek renk, seyrek, kısa ömürlü. */
  (function () {
    if (azHareket) return;
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;

    var G = ["*", "+", "·"];
    var son = 0;

    function parca(x, y) {
      var s = document.createElement("span");
      s.className = "iz";
      s.textContent = G[(Math.random() * G.length) | 0];
      s.style.left = (x + (Math.random() - 0.5) * 22) + "px";
      s.style.top = y + "px";
      document.body.appendChild(s);
      setTimeout(function () { s.remove(); }, 900);
    }

    addEventListener("mousemove", function (e) {
      var t = Date.now();
      if (t - son < 60) return;
      son = t;
      parca(e.clientX, e.clientY);
    }, { passive: true });
  })();

  /* ---------- 3 · dar ekranda müfredat ---------- */
  (function () {
    var dugme = document.querySelector(".kenar-ac");
    var kenar = document.querySelector(".kenar");
    if (!dugme || !kenar) return;

    dugme.addEventListener("click", function () {
      var acik = kenar.classList.toggle("acik");
      dugme.setAttribute("aria-expanded", acik ? "true" : "false");
    });

    /* Bir bölümdeysen ve liste açılıyorsa, bulunduğun yer görünsün. */
    dugme.addEventListener("click", function () {
      if (!kenar.classList.contains("acik")) return;
      var burada = kenar.querySelector(".kenar-bolum.burada");
      if (burada && burada.scrollIntoView) {
        burada.scrollIntoView({ block: "nearest" });
      }
    });
  })();
})();

/* ---------- 4 · klavye ----------
 * Araştırmada baktığım yedi kitaptan yalnız birinde klavye kısayolu vardı ve
 * o da temanın kendi varsayılanıydı. Bir kitapta sayfa çevirmek kadar sık
 * yapılan bir iş için tuş olmaması tuhaf.
 *
 *   n / →   sonraki bölüm      p / ←   önceki bölüm
 *   /       arama              g       müfredat
 *   ?       bu liste
 */
(function () {
  "use strict";

  /* Yön linkini accesskey ile ara. Şeritte accesskey taşıyan üç bağlantı var
     (I arama, N sonraki, P önceki), o yüzden hangisini istediğimizi harfle
     söylüyoruz: `a[accesskey]` ilk bulduğunu, yani aramayı getiriyordu. */
  function baglanti(yon) {
    var harf = yon === "next" ? "N" : "P";
    var a = document.querySelector('.related a[accesskey="' + harf + '"]');
    if (a) return a;
    var hepsi = document.querySelectorAll(".related a");
    for (var i = 0; i < hepsi.length; i++) {
      var t = (hepsi[i].textContent || "").trim().toLowerCase();
      if (yon === "next" && t === "next") return hepsi[i];
      if (yon === "prev" && t === "previous") return hepsi[i];
    }
    /* Şerit yoksa bölüm sonundaki geçişe düş. */
    return document.querySelector("nav.sonraki ." + (yon === "next" ? "ileri" : "geri"));
  }

  function yardim() {
    var v = document.getElementById("tus-yardim");
    if (v) { v.remove(); return; }
    v = document.createElement("div");
    v.id = "tus-yardim";
    v.innerHTML =
      '<dl>' +
      '<dt>n</dt><dd>next chapter</dd>' +
      '<dt>p</dt><dd>previous chapter</dd>' +
      '<dt>g</dt><dd>the curriculum</dd>' +
      '<dt>/</dt><dd>search</dd>' +
      '<dt>?</dt><dd>this list</dd>' +
      '<dt>esc</dt><dd>close</dd>' +
      '</dl>';
    document.body.appendChild(v);
  }

  addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var h = document.activeElement;
    if (h && (h.tagName === "INPUT" || h.tagName === "TEXTAREA" || h.isContentEditable)) return;

    var t = e.key, a;
    if (t === "n" || t === "ArrowRight") { a = baglanti("next"); }
    else if (t === "p" || t === "ArrowLeft") { a = baglanti("prev"); }
    else if (t === "g") { a = document.querySelector(".kenar-ad"); }
    else if (t === "/") {
      var k = document.querySelector('ul.navbar input[type="text"], input.arama, .arama input');
      if (k) { e.preventDefault(); k.focus(); }
      return;
    } else if (t === "?") { e.preventDefault(); yardim(); return; }
    else if (t === "Escape") {
      var v = document.getElementById("tus-yardim");
      if (v) v.remove();
      return;
    } else { return; }

    if (a && a.href) { e.preventDefault(); location.href = a.href; }
  });
})();


/* ---------- 5 · kodu kopyala ----------
 * Kopyalamanın kendisi site.js'te ve clipboard API'si yoksa yedeği var.
 * Burada yapılan tek şey düğmeyi koymak: site.js onu `parentNode` içinde bir
 * `pre` arayarak buluyor, o yüzden düğme `pre`'nin İÇİNE değil YANINA girer,
 * ortak bir sarmalayıcının içine. */
(function () {
  "use strict";
  var bloklar = document.querySelectorAll(".kitap div.body pre, .kitap-tam pre");
  if (!bloklar.length) return;

  Array.prototype.forEach.call(bloklar, function (pre) {
    if (pre.parentNode.classList.contains("kod")) return;

    var kap = document.createElement("div");
    kap.className = "kod";
    pre.parentNode.insertBefore(kap, pre);
    kap.appendChild(pre);

    var d = document.createElement("button");
    d.type = "button";
    d.className = "kopyala";
    d.textContent = "copy";
    d.setAttribute("data-oldu", "copied");
    d.setAttribute("aria-label", "Copy this code");
    kap.appendChild(d);
  });
})();
