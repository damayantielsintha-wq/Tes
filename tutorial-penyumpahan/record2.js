const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const W=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:1920,height:1080},recordVideo:{dir:'raw',size:{width:1920,height:1080}}});
 await require('./routes')(ctx);
 const p=await ctx.newPage();const T0=Date.now();const fs=require('fs');const DUR=fs.existsSync('vo/durasi.json')?JSON.parse(fs.readFileSync('vo/durasi.json')):[];const TS=[];let last=null;
 const tunggu=async()=>{if(last){const sisa=last.t+(DUR[last.i-1]||0)*1000+800-Date.now();if(sisa>0)await W(sisa)}};p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('http://localhost:8766/stage.html');await W(2500);
 const f=p.frames().find(x=>x.url().includes('app.html'));
 await f.evaluate(()=>{localStorage.clear();sessionStorage.clear()});await f.evaluate(()=>location.reload());await W(3500);
 const T=11;
 const say=async(i,t,x)=>{await tunggu();last={i,t:Date.now()};TS.push((Date.now()-T0)/1000);await p.evaluate(([i,t,x,T])=>say(i,t,x,T),[i,t,x,T]);await W(1300+x.split(' ').length*120);await p.screenshot({path:'s'+i+'.png'});};
 const pos=async(sel,nth=0)=>{const l=f.locator(sel).nth(nth);await l.scrollIntoViewIfNeeded();const bb=await l.boundingBox();return [bb.x+bb.width/2,bb.y+bb.height/2]};
 const move=async(sel,nth=0)=>{const [x,y]=await pos(sel,nth);await p.evaluate(([x,y])=>cur(x,y),[x,y]);await W(1000);return [x,y]};
 const click=async(sel,nth=0,after=1400)=>{const [x,y]=await move(sel,nth);await p.evaluate(([x,y])=>rip(x,y),[x,y]);await f.locator(sel).nth(nth).click();await W(after)};
 const type=async(sel,txt,d=70)=>{await click(sel,0,300);await f.locator(sel).pressSequentially(txt,{delay:d});await W(600)};
 const scroll=async(sel,y)=>{await f.locator(sel).first().evaluate((e,y)=>{(document.scrollingElement).scrollBy({top:y,behavior:'smooth'})},y);await W(1800)};
 await p.evaluate(()=>cover(false));await W(1200);

 await say(1,'Masuk ke Aplikasi','Buka link aplikasi, lalu isi <b>username</b> dan <b>password</b> Anda. Centang <b>Tetap masuk</b> agar tidak perlu login ulang selama 30 hari.');
 await type('#login input[name=u]','shela',120);await type('#login input[name=p]','demo',160);await click('#login button',0,3000);

 await say(2,'Halaman Utama','Setelah masuk, Anda melihat <b>ringkasan berkas</b>. Menu di sebelah kiri berisi Daftar Berkas, Berkas Baru, <b>Jadwal Sumpah</b>, dan menu Admin Utama.');
 await move('.side .nav',1);await W(700);await move('.side .nav',2);await W(700);await move('.side .nav',5);await W(1500);

 await say(3,'Buat Berkas Baru','Klik <b>Berkas Baru</b>, lalu pilih jenis penyumpahan: <b>Pengampuan</b> untuk orang dewasa, atau <b>Perwalian</b> untuk anak di bawah umur.');
 await click('.side .nav[data-v=baru]',0,1500);await click('.opt',1,1000);await click('.opt',0,1500);

 await say(4,'Upload Penetapan','Seret atau klik kotak upload untuk memilih <b>PDF penetapan pengadilan</b>. Aplikasi membaca isinya dan <b>mengisi data otomatis</b>.');
 const [dx,dy]=await move('#wzDrop');await p.evaluate(([x,y])=>rip(x,y),[dx,dy]);
 await f.setInputFiles('#wzDrop input','Penetapan_412_Pdt.P_2026_PN_Mdn.pdf');await W(5000);

 await say(5,'Periksa Data','Cek hasil bacaan: nomor penetapan, data <b>pemohon</b>, dan <b>terampu</b>. Kolom <b>kuning</b> berarti belum ditemukan, jadi lengkapi secara manual.');
 await move('#wzBody input',2);await W(1200);await move('#wzBody input',4);await W(1200);
 await scroll('#wzBody',450);await move('#wzBody input',12);await W(1500);
 await click('.wz-f button.pri',0,2500);

 await say(6,'Jadwal & Pejabat','Isi <b>tanggal sumpah</b>, waktu, tempat, dan nomor HP pemohon. Pilih pejabat penyumpah, lalu klik <b>Simpan & Lihat Dokumen</b>.');
 await move('input[type=date]');await f.locator('input[type=date]').first().fill('2026-10-08');await f.locator('input[type=date]').first().dispatchEvent('change');await W(900);
 await type('.wz input >> nth=2','Kantor BHP Medan');await f.locator('.wz input >> nth=2').press('Tab');await type('.wz input >> nth=3','0812-6543-2109');await f.locator('.wz input >> nth=3').press('Tab');
 await click('.wz-f button:has-text("Simpan & Lihat Dokumen")',0,3000);

 await say(7,'Lengkapi Detail Berkas','Data tersusun per tab: <b>Perkara</b>, <b>Pengampu</b>, <b>Terampu</b>, Jadwal, serta <b>BAP & Harta</b>. Tanda merah menunjukkan kolom yang masih perlu dicek.');
 for(const t of ['1. Perkara','2. Pengampu','3. Terampu','5. BAP & Harta']){await click(`#main button:has-text("${t}")`,0,1800)}

 await say(8,'Buat Dokumen','Di tab <b>Dokumen</b>, lihat paket surat yang diperlukan. Klik <b>Pratinjau</b> untuk melihat isi, lalu <b>Buat Google Doc</b> untuk menyimpannya ke Drive.');
 await click('#main button:has-text("📄 Dokumen")',0,2000);
 await scroll('#main',500);
 await click('#main button:has-text("👁 BA Sumpah")',0,800);await f.locator('#prev').evaluate(e=>e.scrollIntoView({behavior:'smooth',block:'start'}));await W(2500);await f.evaluate(()=>document.scrollingElement.scrollBy({top:500,behavior:'smooth'}));await W(3000);
 await p.screenshot({path:'s8b.png'});
 await f.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());try{dlgClose()}catch(e){}});await W(1200);

 await say(9,'Jadwal Sumpah','Menu <b>Jadwal Sumpah</b> menampilkan kalender. Angka kuning menunjukkan <b>jumlah penyumpahan</b> yang sudah terjadwal pada hari tersebut.');
 await click('.side .nav[data-v=kalender]',0,2500);await f.evaluate(()=>{const b=[...document.querySelectorAll('#main button')].find(x=>x.textContent.trim()==='›');b&&b.click()});await W(1500);
 await move('#main .card',0).catch(()=>{});await W(2000);

 await say(10,'Riwayat Perubahan','Admin Utama dapat membuka <b>Riwayat</b> untuk melihat siapa mengubah apa dan kapan. Semua aktivitas <b>tercatat permanen</b>.');
 await click('.side .nav:has-text("Riwayat")',0,5000);await click('dialog[open] button:has-text("Tutup")',0,1200);

 await say(11,'Kelola Pengguna','Menu <b>Pengguna</b> dipakai untuk menambah admin, menonaktifkan akun, atau <b>reset password</b>. Selesai, selamat bekerja!');
 await click('.side .nav:has-text("Pengguna")',0,5000);await click('dialog[open] button:has-text("Tutup")',0,1200);await click('.side .nav[data-v=berkas]',0,2500);

 await tunggu();fs.writeFileSync('vo/waktu.json',JSON.stringify(TS));await p.evaluate(()=>cover(true,'Selamat bekerja! 🎉','Dokumen Penyumpahan · Balai Harta Peninggalan Medan'));await W(5000);
 await ctx.close();await b.close();
})();
