// Render kartu teks (PNG transparan) untuk ditempel di video: link aplikasi, catatan input manual, kontak
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const KARTU=[['link.png','LINK APLIKASI','bit.ly/<span>dokumensumpah</span>'],
 ['manual.png','OPSIONAL','Tidak wajib upload · bisa <span>isi manual</span>'],
 ['kontak.png','ADA KENDALA?','Silakan hubungi <span>mantan</span>']];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:150}});
 for(const [file,label,isi] of KARTU){
  await p.setContent(`<body style="margin:0;background:transparent;font-family:Segoe UI,Roboto,Arial,sans-serif">
  <div style="margin:18px;display:flex;align-items:center;gap:22px;padding:22px 34px;border-radius:24px;background:#fff;
   box-shadow:0 14px 34px rgba(20,25,70,.35);border:3px solid #f2c94c;width:fit-content;white-space:nowrap">
   <div style="font-size:15px;font-weight:800;letter-spacing:.12em;color:#1b2550;background:#fdf1c7;padding:8px 14px;border-radius:99px">${label}</div>
   <div style="font-size:44px;font-weight:800;color:#1b2550">${isi.replace('<span>','<span style="color:#b7860b">')}</div></div></body>`);
  const r=await p.locator('div').first().boundingBox();
  await p.screenshot({path:file,omitBackground:true,clip:{x:0,y:0,width:r.width+36,height:r.height+36}})}
 await b.close()})();
