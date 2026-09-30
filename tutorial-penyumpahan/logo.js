// Render logo header + layar pembuka/penutup (dari stage.html) sebagai PNG untuk ditempel di video. Butuh: python3 -m http.server 8766
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
 await p.goto('http://localhost:8766/stage.html');
 await p.addStyleTag({content:'#cover{transition:none!important}'});
 // logo header: cukup kotak logo di pojok kiri atas
 await p.evaluate(()=>cover(false));await p.waitForTimeout(500);
 const r=await p.locator('#hdr .logo').boundingBox();
 await p.screenshot({path:'logo-header.png',omitBackground:false,clip:{x:r.x-4,y:r.y-4,width:r.width+8,height:r.height+8}});
 console.log('header logo',JSON.stringify(r));
 await p.evaluate(()=>cover(true));await p.waitForTimeout(300);await p.screenshot({path:'cover-buka.png'});
 await p.evaluate(()=>cover(true,'Selamat bekerja! 🎉','Dokumen Penyumpahan · Balai Harta Peninggalan Medan'));await p.waitForTimeout(300);await p.screenshot({path:'cover-tutup.png'});
 await b.close()})();
