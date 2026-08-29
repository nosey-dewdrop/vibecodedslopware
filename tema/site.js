// vibecodedslopware — sayfa içi ufak tefek işler.
// Yazbel'in Sphinx JS'i (doctools + sphinx_highlight) burada yok; onun yerine
// ihtiyacımız olan üç şey elle yazıldı: kod bloğu kopyalama, okurken aktif
// başlığı işaretleme, ve arama sonucundan gelen terimi vurgulama.

(function () {
  "use strict";

  // --- kod bloğu: kopyala -------------------------------------------------
  function kopyalamayiKur() {
    var dugmeler = document.querySelectorAll("button.kopyala");
    Array.prototype.forEach.call(dugmeler, function (d) {
      d.addEventListener("click", function () {
        var pre = d.parentNode.querySelector("pre");
        if (!pre) return;
        var kod = pre.innerText.replace(/\n+$/, "");
        var bitir = function () {
          var eski = d.textContent;
          d.textContent = d.getAttribute("data-oldu") || "ok";
          d.classList.add("oldu");
          setTimeout(function () {
            d.textContent = eski;
            d.classList.remove("oldu");
          }, 1400);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(kod).then(bitir, function () {});
          return;
        }
        // clipboard API yoksa (http, eski tarayıcı) eski yöntem.
        var alan = document.createElement("textarea");
        alan.value = kod;
        alan.setAttribute("readonly", "");
        alan.style.position = "absolute";
        alan.style.left = "-9999px";
        document.body.appendChild(alan);
        alan.select();
        try { document.execCommand("copy"); bitir(); } catch (e) {}
        document.body.removeChild(alan);
      });
    });
  }

  // --- içindekiler: okurken aktif başlık ----------------------------------
  function icindekileriKur() {
    var kutu = document.getElementById("contents");
    if (!kutu) return;
    var linkler = kutu.querySelectorAll("a.reference.internal");
    if (!linkler.length) return;

    var hedefler = [];
    Array.prototype.forEach.call(linkler, function (a) {
      var kimlik = a.getAttribute("href").slice(1);
      var bolum = document.getElementById(kimlik);
      if (bolum) hedefler.push({ a: a, bolum: bolum });
    });
    if (!hedefler.length) return;

    var bekliyor = false;
    function tazele() {
      bekliyor = false;
      var esik = window.pageYOffset + 120;
      var aktif = null;
      hedefler.forEach(function (h) {
        if (h.bolum.offsetTop <= esik) aktif = h;
      });
      hedefler.forEach(function (h) {
        h.a.classList.toggle("aktif", h === aktif);
      });
    }
    window.addEventListener("scroll", function () {
      if (bekliyor) return;
      bekliyor = true;
      window.requestAnimationFrame(tazele);
    }, { passive: true });
    tazele();
  }

  // --- aramadan gelindiyse terimi vurgula ---------------------------------
  function vurgula() {
    var eslesme = /[?&]vurgu=([^&]+)/.exec(window.location.search);
    if (!eslesme) return;
    var terimler = decodeURIComponent(eslesme[1].replace(/\+/g, " "))
      .split(/\s+/).filter(Boolean).map(function (t) { return t.toLowerCase(); });
    if (!terimler.length) return;

    var govde = document.querySelector("div.body");
    if (!govde) return;
    var yurutec = document.createTreeWalker(govde, NodeFilter.SHOW_TEXT, {
      acceptNode: function (d) {
        var ebeveyn = d.parentNode.nodeName;
        if (ebeveyn === "SCRIPT" || ebeveyn === "STYLE" || ebeveyn === "PRE") {
          return NodeFilter.FILTER_REJECT;
        }
        return d.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var dugumler = [], d;
    while ((d = yurutec.nextNode())) dugumler.push(d);

    dugumler.forEach(function (dugum) {
      var metin = dugum.nodeValue, kucuk = metin.toLowerCase(), bulundu = false;
      terimler.forEach(function (t) { if (kucuk.indexOf(t) !== -1) bulundu = true; });
      if (!bulundu) return;
      var kalip = new RegExp("(" + terimler.map(kacir).join("|") + ")", "gi");
      var kap = document.createElement("span");
      kap.innerHTML = metin.replace(/[&<>]/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
      }).replace(kalip, '<span class="highlighted">$1</span>');
      dugum.parentNode.replaceChild(kap, dugum);
    });
  }

  function kacir(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function baslat() {
    kopyalamayiKur();
    icindekileriKur();
    vurgula();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", baslat);
  } else {
    baslat();
  }
})();
