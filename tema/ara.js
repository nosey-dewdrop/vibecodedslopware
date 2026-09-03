// vibecodedslopware — arama.
// Sphinx'in searchtools.js + turkish-stemmer.js ikilisinin yaptığı işi, aynı
// mantıkla ama elde yapıyor: indeks kur.py'de gövdelenerek üretiliyor
// (arama-<dil>.json), sorgu burada aynı sözlükle gövdeleniyor (stem.js), ve
// bütün kelimeleri birden içeren bölümler puanına göre sıralanıyor.

(function () {
  "use strict";

  var YAZI = {
    tr: {
      araniyor: "aranıyor…",
      yok: "eşleşen bölüm yok.",
      bir: "1 bölüm bulundu.",
      cok: "{n} bölüm bulundu.",
      kisa: "en az iki harf yaz.",
      hata: "arama indeksi yüklenemedi."
    },
    en: {
      araniyor: "searching…",
      yok: "no matching chapter.",
      bir: "1 chapter found.",
      cok: "{n} chapters found.",
      kisa: "type at least two letters.",
      hata: "could not load the search index."
    }
  };

  var dil = window.DIL === "en" ? "en" : "tr";
  var t = YAZI[dil];
  var kok = window.KOK || "";

  var durum = document.getElementById("arama-durum");
  var kutu = document.getElementById("arama-sonuc");
  var form = document.querySelector("form.arama");
  var alan = form ? form.querySelector('input[type="text"]') : null;
  if (!durum || !kutu || !alan) return;

  var sorgu = (/[?&]q=([^&]*)/.exec(window.location.search) || [])[1];
  sorgu = sorgu ? decodeURIComponent(sorgu.replace(/\+/g, " ")) : "";
  alan.value = sorgu;
  alan.focus();

  if (!sorgu.trim()) return;
  if (sorgu.trim().length < 2) {
    durum.textContent = t.kisa;
    return;
  }

  durum.textContent = t.araniyor;

  fetch(kok + "arama-" + dil + ".json")
    .then(function (y) {
      if (!y.ok) throw new Error(y.status);
      return y.json();
    })
    .then(function (indeks) { ara(indeks, sorgu); })
    .catch(function () { durum.textContent = t.hata; });

  function ara(indeks, sorgu) {
    var govdeler = window.belirtecle(sorgu, dil);
    if (!govdeler.length) {
      durum.textContent = t.yok;
      return;
    }

    // Her gövde için sayfa->puan. Bir gövde indekste yoksa önek olarak dene:
    // "veritab" yazan kişi "veritabani"yı bulsun.
    var anahtarlar = Object.keys(indeks.kelimeler);
    var puanlar = null;

    for (var i = 0; i < govdeler.length; i++) {
      var g = govdeler[i];
      var girdiler = indeks.kelimeler[g] ? indeks.kelimeler[g].slice() : [];
      if (!girdiler.length) {
        for (var j = 0; j < anahtarlar.length; j++) {
          if (anahtarlar[j].indexOf(g) === 0) {
            girdiler = girdiler.concat(indeks.kelimeler[anahtarlar[j]]);
          }
        }
      }
      var tur = {};
      girdiler.forEach(function (p) {
        tur[p[0]] = Math.max(tur[p[0]] || 0, p[1]);
      });
      if (puanlar === null) {
        puanlar = tur;
      } else {
        // AND: yalnızca bütün kelimeleri içerenler kalsın.
        var kesisim = {};
        Object.keys(puanlar).forEach(function (k) {
          if (tur[k]) kesisim[k] = puanlar[k] + tur[k];
        });
        puanlar = kesisim;
      }
      if (!Object.keys(puanlar).length) break;
    }

    var sonuc = Object.keys(puanlar).map(function (k) {
      return { s: indeks.sayfalar[k], p: puanlar[k] };
    }).sort(function (a, b) {
      return b.p - a.p || a.s.b.localeCompare(b.s.b, dil);
    });

    yaz(sonuc, sorgu);
  }

  function yaz(sonuc, sorgu) {
    if (!sonuc.length) {
      durum.textContent = t.yok;
      kutu.innerHTML = "";
      return;
    }
    durum.textContent = sonuc.length === 1
      ? t.bir
      : t.cok.replace("{n}", sonuc.length);

    var kelimeler = sorgu.split(/\s+/).filter(function (k) { return k.length > 1; });
    var liste = document.createElement("ul");
    liste.className = "search";

    sonuc.forEach(function (r) {
      var li = document.createElement("li");

      var a = document.createElement("a");
      a.href = kok + r.s.u + "?vurgu=" + encodeURIComponent(sorgu);
      a.textContent = r.s.b;
      li.appendChild(a);

      var nerede = document.createElement("span");
      nerede.className = "nerede";
      nerede.textContent = " \u00b7 " + r.s.n;
      li.appendChild(nerede);

      var p = document.createElement("p");
      p.className = "context";
      p.innerHTML = parca(r.s, kelimeler);
      li.appendChild(p);

      liste.appendChild(li);
    });

    kutu.innerHTML = "";
    kutu.appendChild(liste);
  }

  // Eşleşen kelimenin çevresinden bir kesit çıkar, kelimeyi <em> ile işaretle.
  function parca(sayfa, kelimeler) {
    var metin = sayfa.p || sayfa.o || "";
    var kucuk = metin.toLowerCase();
    var yer = -1;
    for (var i = 0; i < kelimeler.length && yer === -1; i++) {
      yer = kucuk.indexOf(kelimeler[i].toLowerCase());
    }
    var bas = yer === -1 ? 0 : Math.max(0, yer - 90);
    var kesit = metin.slice(bas, bas + 260);
    if (bas > 0) kesit = "…" + kesit;
    if (bas + 260 < metin.length) kesit += "…";

    kesit = kesit.replace(/[&<>]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
    });
    if (kelimeler.length) {
      var kalip = new RegExp("(" + kelimeler.map(kacir).join("|") + ")", "gi");
      kesit = kesit.replace(kalip, "<em>$1</em>");
    }
    return kesit;
  }

  function kacir(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
})();
