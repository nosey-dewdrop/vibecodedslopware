// Chrome DevTools Protocol ile gercek tarayicida test. Bagimlilik yok:
// ws el ile konusuluyor.
const http = require("http"), net = require("net"), crypto = require("crypto");

function hedefBul(port) {
  return new Promise((c, r) => {
    http.get({host:"127.0.0.1", port, path:"/json/list"}, res => {
      let d=""; res.on("data",x=>d+=x); res.on("end",()=>{ try{c(JSON.parse(d))}catch(e){r(e)} });
    }).on("error", r);
  });
}

function ws(url) {
  const u = new URL(url);
  return new Promise((cozum, red) => {
    const anahtar = crypto.randomBytes(16).toString("base64");
    const s = net.connect(u.port, u.hostname, () => {
      s.write(`GET ${u.pathname} HTTP/1.1\r\nHost:${u.host}\r\nUpgrade:websocket\r\n` +
              `Connection:Upgrade\r\nSec-WebSocket-Key:${anahtar}\r\nSec-WebSocket-Version:13\r\n\r\n`);
    });
    let kur = false, tampon = Buffer.alloc(0);
    const dinleyiciler = [];
    s.on("data", b => {
      tampon = Buffer.concat([tampon, b]);
      if (!kur) {
        const i = tampon.indexOf("\r\n\r\n");
        if (i === -1) return;
        tampon = tampon.slice(i+4); kur = true;
        cozum({ gonder, kapat: () => s.destroy(), dinleyiciler });
      }
      while (tampon.length >= 2) {
        const uz0 = tampon[1] & 127;
        let bas = 2, uz = uz0;
        if (uz0 === 126) { uz = tampon.readUInt16BE(2); bas = 4; }
        else if (uz0 === 127) { uz = Number(tampon.readBigUInt64BE(2)); bas = 10; }
        if (tampon.length < bas + uz) return;
        const yuk = tampon.slice(bas, bas+uz).toString();
        tampon = tampon.slice(bas+uz);
        try { dinleyiciler.forEach(f => f(JSON.parse(yuk))); } catch(e){}
      }
    });
    s.on("error", red);
    function gonder(o) {
      const yuk = Buffer.from(JSON.stringify(o));
      const mask = crypto.randomBytes(4);
      let bas;
      if (yuk.length < 126) { bas = Buffer.from([0x81, 0x80 | yuk.length]); }
      else { bas = Buffer.alloc(4); bas[0]=0x81; bas[1]=0x80|126; bas.writeUInt16BE(yuk.length,2); }
      const m = Buffer.alloc(yuk.length);
      for (let i=0;i<yuk.length;i++) m[i] = yuk[i] ^ mask[i%4];
      s.write(Buffer.concat([bas, mask, m]));
    }
  });
}

(async () => {
  const port = process.argv[2] || 9222;
  const hedefler = await hedefBul(port);
  const sayfa = hedefler.find(h => h.type === "page");
  const c = await ws(sayfa.webSocketDebuggerUrl);
  let no = 0;
  const bekle = (yontem, params) => new Promise(cozum => {
    const kimlik = ++no;
    const f = m => { if (m.id === kimlik) { c.dinleyiciler.splice(c.dinleyiciler.indexOf(f),1); cozum(m.result); } };
    c.dinleyiciler.push(f);
    c.gonder({ id: kimlik, method: yontem, params });
  });

  const kod = require("fs").readFileSync(process.argv[3], "utf8");
  const r = await bekle("Runtime.evaluate", { expression: kod, returnByValue: true, awaitPromise: true });
  console.log(JSON.stringify(r.result && r.result.value, null, 2));
  c.kapat();
  process.exit(0);
})().catch(e => { console.error("HATA", e.message); process.exit(1); });
