/* gorunum.js — sayfanin GORUNEN halini sayiya cevirir.
 *
 * CSS birlestirirken tek soru var: gorunum degisti mi? Kod okuyarak
 * cevaplanmaz, cunku spesifiklik bes katman eziyor. Bu dosya calisan
 * sayfadan hesaplanmis degeri (getComputedStyle) ve kutu geometrisini
 * okur; birlestirmeden ONCE ve SONRA kosulur, iki cikti karsilastirilir.
 *
 * Cikti tek satirlik JSON — cdp.js onu basiyor, disarida diff alinir.
 */
(() => {
  const SECICI = [
    "body", ".header", "ul.navbar", "ul.navbar li", "ul.navbar a",
    ".selam", ".kitap", ".kitap div.body", ".kitap div.body p",
    ".kitap div.body h1", ".kitap div.body h2", ".kitap div.body a",
    ".kitap div.body blockquote", ".kitap div.body blockquote.alinti",
    ".kitap div.body pre", ".kitap div.body pre code",
    ".kitap .kenar-not", ".kenar-bolum", ".kenar-sayi", ".kenar-yuzde",
    "label.gec", ".yakinda", ".yakinda .balon",
    ".geri", ".ileri", ".geri i", ".ileri i",
    ".kontrol-bag", ".kontrol-bag a", "div.footer",
    "#arac-cubuk", "#arac-cubuk button", "#yildizlar", ".yildiz",
    "form.ara", "form.ara input", ".ayak-ipucu", ".ayak-sevgi",
    "h1", "h2", "p", "a", "li", "pre", "blockquote", "code",
  ];
  const OZELLIK = [
    "display", "position", "color", "background-color", "font-family",
    "font-size", "font-weight", "font-style", "line-height", "letter-spacing",
    "text-align", "text-decoration-line", "text-transform", "margin-top",
    "margin-bottom", "margin-left", "margin-right", "padding-top",
    "padding-bottom", "padding-left", "padding-right", "border-top-width",
    "border-bottom-width", "border-radius", "border-color", "max-width",
    "width", "opacity", "z-index", "flex-direction", "justify-content",
    "align-items", "gap", "grid-template-columns", "overflow-x", "visibility",
  ];

  const olc = () => {
    const cikti = {};
    for (const s of SECICI) {
      let el;
      try { el = document.querySelector(s); } catch (e) { continue; }
      if (!el) { cikti[s] = null; continue; }
      const h = getComputedStyle(el), k = el.getBoundingClientRect();
      const satir = {};
      for (const o of OZELLIK) satir[o] = h.getPropertyValue(o);
      satir["#kutu"] = [Math.round(k.width), Math.round(k.height),
                        Math.round(k.left), Math.round(k.top)].join(",");
      cikti[s] = satir;
    }
    // yatay tasma: sayfa kendi penceresinden genis mi
    cikti["#sayfa"] = {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      eleman: document.querySelectorAll("*").length,
    };
    return cikti;
  };

  const kok = document.documentElement;
  const onceki = kok.getAttribute("data-tema");
  const sonuc = {};
  for (const tema of ["kagit", "gece"]) {
    kok.setAttribute("data-tema", tema);
    // yeniden hesaplamayi zorla
    void document.body.offsetHeight;
    sonuc[tema] = olc();
  }
  if (onceki) kok.setAttribute("data-tema", onceki); else kok.removeAttribute("data-tema");

  let n = 0;
  for (const t of Object.keys(sonuc))
    for (const s of Object.keys(sonuc[t]))
      if (sonuc[t][s]) n += Object.keys(sonuc[t][s]).length;

  return { deger: n, olcum: sonuc };
})()
