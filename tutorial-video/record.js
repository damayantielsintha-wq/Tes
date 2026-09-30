const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const W=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:1920,height:1080},recordVideo:{dir:'raw',size:{width:1920,height:1080}}});
 const p=await ctx.newPage();
 await p.goto('http://localhost:8765/stage.html');await W(2500);
 const f=p.frames().find(x=>x.url().includes('app.html'));
 const T=12;
 const say=async(i,t,x)=>{await p.evaluate(([i,t,x,T])=>say(i,t,x,T),[i,t,x,T]);await W(1200+x.split(' ').length*110);await p.screenshot({path:'shot'+i+'.png'});};
 const move=async(sel,nth=0)=>{const bb=await f.locator(sel).nth(nth).boundingBox();const x=bb.x+bb.width/2,y=bb.y+bb.height/2;
   await p.evaluate(([x,y])=>cur(x,y),[x,y]);await W(1000);return [x,y];};
 const click=async(sel,nth=0,after=1400)=>{const [x,y]=await move(sel,nth);await p.evaluate(([x,y])=>rip(x,y),[x,y]);await f.locator(sel).nth(nth).click();await W(after);};
 const type=async(sel,txt)=>{await click(sel,0,300);await f.locator(sel).pressSequentially(txt,{delay:55});await W(700);};
 await f.evaluate(()=>{localStorage.clear();});await f.evaluate(()=>location.reload());await W(3000);
 await f.evaluate(()=>setView('month'));await W(3500);
 await p.evaluate(()=>cover(false));await W(1200);

 await say(1,'Halaman Utama','Setelah masuk dengan akun <b>shela</b>, Anda langsung melihat kalender bulan ini. Setiap warna menandai <b>kategori</b> kegiatan yang berbeda.');
 await move('#cats');await W(1500);await move('#upcoming');await W(2500);

 await say(2,'Ganti Tampilan','Gunakan tombol di bagian atas untuk berpindah antara tampilan <b>Bulan</b>, <b>Minggu</b>, dan <b>Agenda</b> sesuai kebutuhan Anda.');
 await click('#seg button[data-v=week]',0,2500);await click('#seg button[data-v=agenda]',0,2500);await click('#seg button[data-v=month]',0,1500);

 await say(3,'Tambah Cepat','Ketik kegiatan dengan bahasa sehari-hari, lalu tekan <b>Enter</b>. Tanggal, jam, lokasi <b>@</b> dan kategori <b>#</b> dikenali otomatis.');
 await type('#quick','Rapat evaluasi besok 09:00-11:00 @Aula #Rapat !tinggi');await f.locator('#quick').press('Enter');await W(3500);

 await say(4,'Buat Kegiatan Lengkap','Klik <b>Kegiatan Baru</b> untuk mengisi detail: judul, tanggal, jam, lokasi, kategori, prioritas, dan catatan. Lalu tekan <b>Simpan</b>.');
 await click('#side .btn-primary',0,1500);
 await type('input[name=judul]','Pengambilan Sumpah Wali — Kel. Hasibuan');
 await type('input[name=lokasi]','Ruang Rapat BHP Medan');
 await click('.pills[data-name=kategori] button[data-val=Penyumpahan]',0,800);
 await click('.pills[data-name=prioritas] button[data-val=Tinggi]',0,800);
 await type('textarea[name=deskripsi]','Penyumpahan wali sesuai penetapan pengadilan.');
 await click('#saveBtn',0,3000);
 if(await f.locator('#ov.show').count()) await click('.mh .icon-btn:last-child',0,1200);

 await say(5,'Lihat Detail Kegiatan','Klik salah satu kegiatan di kalender untuk melihat detailnya, mencentang checklist, dan mengubah status dengan sekali klik.');
 await click('#view >> text=Penyumpahan Wali',0,2500);
 await click('#dbody .chk',1,1500);await click('#dbody .panel .btn',1,2500);

 await say(6,'Lampiran ke Google Drive','Pada tab <b>Lampiran</b>, seret foto atau dokumen ke kotak unggah. File tersimpan rapi di folder <b>Google Drive</b> kegiatan.');
 await click('.tabs button',1,3500);

 await say(7,'✨ AI Asisten Dokumen','Tab <b>AI Dokumen</b> menyarankan surat yang dibutuhkan, misalnya undangan sumpah dan berita acara, lengkap dengan draf isinya.');
 await click('.tabs button',2,1200);await click('#aiBtn',0,4000);
 await f.locator('#dbody').evaluate(e=>e.scrollBy({top:500,behavior:'smooth'}));await W(3500);

 await say(8,'Diskusi Tim','Tab <b>Diskusi</b> dipakai untuk menulis komentar atau update progres, sehingga seluruh tim tetap sejalan.');
 await click('.tabs button',3,1000);await type('#cmt','Dokumen penetapan sudah diterima, siap dijadwalkan 👍');
 await click('#dbody .btn-primary',0,2500);await click('.mh .icon-btn:last-child',0,1500);

 await say(9,'Daftar To Do','Menu <b>To Do</b> mengumpulkan semua tugas: <b>Terlambat</b>, <b>Hari ini</b>, dan <b>7 hari ke depan</b>. Centang langsung bila selesai.');
 await click('#seg button[data-v=todo]',0,4500);

 await say(10,'Papan Kanban','Tampilan <b>Papan</b> menunjukkan status tiap kegiatan. Seret kartu untuk memindahkan status dari Direncanakan ke Selesai.');
 await click('#seg button[data-v=board]',0,4500);

 await say(11,'Statistik & Log','Pantau ringkasan kerja di <b>Statistik</b>, dan lihat siapa mengubah apa di <b>Log</b>. Semua perubahan tercatat otomatis.');
 await click('#seg button[data-v=stats]',0,3500);await click('#seg button[data-v=log]',0,3500);

 await say(12,'Cari & Mode Gelap','Gunakan kolom <b>Cari</b> untuk menemukan kegiatan, dan ikon bulan untuk <b>mode gelap</b> yang nyaman di mata. Selesai!');
 await click('#seg button[data-v=agenda]',0,800);await type('#q','sumpah');await W(1500);
 await click('.top .icon-btn[title=Tema]',0,3000);

 await p.evaluate(()=>cover(true,'Selamat bekerja! 🎉','Kalender Kerja Wilayah II · Balai Harta Peninggalan Medan'));await W(5000);
 await ctx.close();await b.close();
})();
