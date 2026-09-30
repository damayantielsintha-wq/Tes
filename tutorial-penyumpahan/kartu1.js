// Render ulang kartu keterangan langkah 1 (tanpa kalimat 'Centang Tetap masuk...') untuk menimpa kartu lama di video
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
 await p.goto('http://localhost:8766/stage.html');
 await p.addStyleTag({content:`html,body{background:transparent!important}#hdr,#win,#cur,#cover{display:none!important}
  .card{min-height:350px;box-sizing:border-box;background:#f7fbff!important;box-shadow:none!important;backdrop-filter:none!important}`});
 await p.evaluate(()=>say(1,'Masuk ke Aplikasi','Buka link aplikasi di <b>bit.ly/dokumensumpah</b>, lalu isi <b>username</b> dan <b>password</b> Anda.',11));
 await p.waitForTimeout(4000);await p.screenshot({path:'kartu1.png',omitBackground:true,clip:{x:1500,y:350,width:400,height:430}});await b.close()})();
