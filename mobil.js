(()=>{
  const r = {hata:[], en: window.innerWidth};
  const de=(a,k,x)=>{ if(!k) r.hata.push(a+(x?" · "+x:"")); };
  // Yatay tasma
  r.belgeEn = document.documentElement.scrollWidth;
  de("sayfa yana kayıyor", r.belgeEn <= window.innerWidth + 2,
     r.belgeEn + " > " + window.innerWidth);
  // Ekrandan tasan oge
  const tasan = [...document.querySelectorAll("body *")].filter(e=>{
    const k = e.getBoundingClientRect();
    return k.width > 0 && k.right > window.innerWidth + 2;
  }).map(e => e.tagName+"."+(e.className||"").toString().slice(0,26)
              +" ("+Math.round(e.getBoundingClientRect().right)+"px)");
  r.tasanlar = [...new Set(tasan)].slice(0,6);
  de("ekrandan taşan öğe", tasan.length === 0, tasan.length+" adet");
  // Navbar sarmali mi
  const nav = document.querySelector("ul.navbar");
  r.navYuk = Math.round(nav.getBoundingClientRect().height);
  de("navbar ekranın yarısını yiyor", r.navYuk < window.innerHeight*0.35, r.navYuk+"px");
  // Kenar listesi yazinin onunde mi
  const kenar = document.querySelector("nav.kenar");
  const govde = document.querySelector(".kitap .document");
  if (kenar && govde) {
    const k = kenar.getBoundingClientRect(), g = govde.getBoundingClientRect();
    r.kenarYuk = Math.round(k.height);
    r.tekKolon = k.bottom <= g.top + 5;
    de("55 bölüm yazının önüne yığılmış", !r.tekKolon || k.height < 900,
       "liste yüksekliği " + Math.round(k.height) + "px");
  }
  // Arama kutusu
  const ara = document.querySelector("ul.navbar input[type=text]");
  if (ara) {
    const a = ara.getBoundingClientRect();
    r.aramaEn = Math.round(a.width);
    de("arama kutusu ekrandan taşıyor", a.right <= window.innerWidth + 2,
       Math.round(a.right)+"px");
  }
  // Dokunma hedefleri
  const kucuk = [...document.querySelectorAll("a, button")].filter(e=>{
    const k = e.getBoundingClientRect();
    return k.width > 0 && k.height > 0 && k.height < 24;
  }).length;
  r.kucukHedef = kucuk;
  r.sonuc = r.hata.length ? "KALDI" : "TEMIZ";
  return JSON.stringify(r,null,1);
})()
