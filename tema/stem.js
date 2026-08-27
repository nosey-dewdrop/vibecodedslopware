// ÜRETİLMİŞ DOSYA — kur.py yazıyor, elle düzenleme.
// Aramanın indeksi Python'da, sorgusu burada gövdeleniyor. İkisi ayrı düşmesin
// diye ek sözlüğü ve eşik kur.py'den basılıyor; algoritma da birebir aynı.
window.EKLER = {"tr": ["larımızdan", "larınızdan", "lerimizden", "lerinizden", "larından", "lerinden", "larımız", "larınız", "lerimiz", "leriniz", "miştir", "muştur", "müştür", "mıştır", "ların", "lerin", "yordu", "acak", "ecek", "imiz", "iniz", "ları", "leri", "umuz", "unuz", "ümüz", "ünüz", "ımız", "ınız", "dan", "den", "dir", "dur", "dür", "dır", "lar", "ler", "lik", "luk", "lük", "lık", "mak", "mek", "miş", "muş", "müş", "mış", "nin", "nun", "nün", "nın", "siz", "suz", "süz", "sız", "tan", "ten", "tir", "tur", "tür", "tır", "yor", "ci", "cu", "cü", "cı", "da", "de", "di", "du", "dü", "dı", "im", "in", "li", "lu", "lü", "lı", "ma", "me", "na", "ne", "si", "su", "sü", "sı", "ta", "te", "ti", "tu", "tü", "tı", "um", "un", "ya", "ye", "çi", "çu", "çü", "çı", "üm", "ün", "ım", "ın", "a", "e", "i", "u", "ü", "ı"], "en": ["ational", "fulness", "iveness", "ization", "ousness", "ations", "ically", "ingly", "edly", "ions", "ment", "ness", "ers", "est", "ing", "ed", "es", "ly", "s"]};
window.YUMUSAMA = {"ğ": "k", "b": "p", "c": "ç", "d": "t"};
window.EN_AZ = 3;

window.govde = function (kelime, dil) {
  var k = kelime.replace(/I/g, "ı").replace(/İ/g, "i").toLowerCase();
  k = k.replace(/[^0-9a-zçğıöşü]/g, "");
  var ekler = window.EKLER[dil] || [];
  for (;;) {
    var son = k.charAt(k.length - 1);
    if (dil === "tr" && k && window.YUMUSAMA[son]) {
      k = k.slice(0, -1) + window.YUMUSAMA[son];
      continue;
    }
    if (k.length <= window.EN_AZ) return k;
    var kesildi = false;
    for (var i = 0; i < ekler.length; i++) {
      var ek = ekler[i];
      if (k.length - ek.length >= window.EN_AZ &&
          k.slice(k.length - ek.length) === ek) {
        k = k.slice(0, k.length - ek.length);
        kesildi = true;
        break;
      }
    }
    if (!kesildi) return k;
  }
};

window.belirtecle = function (s, dil) {
  var parcalar = s.match(/[0-9a-zA-ZçğıöşüÇĞİÖŞÜ]+/g) || [], cikti = [];
  for (var i = 0; i < parcalar.length; i++) {
    var g = window.govde(parcalar[i], dil);
    if (g.length >= 2) cikti.push(g);
  }
  return cikti;
};
