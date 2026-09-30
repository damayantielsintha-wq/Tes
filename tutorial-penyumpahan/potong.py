"""Versi ringkas (~2 menit) dari Tutorial-Dokumen-Penyumpahan.mp4 + narasi vo/*.wav + kartu teks + musik.
Bagian layar diam dipadatkan, tiap langkah dipercepat seperlunya agar pas dengan narasinya.
Pakai: python3 potong.py  ->  Tutorial-Dokumen-Penyumpahan-Narasi.mp4"""
import json,subprocess,wave,numpy as np,imageio_ffmpeg
FF=imageio_ffmpeg.get_ffmpeg_exe();SRC='Tutorial-Dokumen-Penyumpahan.mp4';OUT='Tutorial-Dokumen-Penyumpahan-Narasi.mp4'
TEMPO=1.0;FPS=10;DIAM=1.0;SISA=0.5;AWAL=0.6  # AWAL: sisa jeda antara munculnya langkah dan aksi pertama
# tahan layar: langkah -> (detik sumber yang ditahan, detik narasi mulai & selesai membahasnya)
# langkah 8: kartu surat dengan tombol 'Ambil nomor SPS' ditahan selama penjelasan nomor SPS
TAHAN={8:(119.5,4.8,25.0)}  # tanpa percepatan: narasi & video diputar kecepatan asli
def raw(vf,h,w,c=1):
  b=subprocess.run([FF,'-loglevel','error','-i',SRC,'-vf',f'fps={FPS},'+vf,'-f','rawvideo','-pix_fmt','gray' if c==1 else 'rgb24','-'],capture_output=True).stdout
  return np.frombuffer(b,np.uint8).reshape(-1,h,w,c).astype(int)
# 1) awal tiap langkah = saat progress bar kuning di header melebar
bar=raw('crop=400:2:1500:47',2,400,3)[:,1];kn=((bar[...,0]>200)&(bar[...,1]>140)&(bar[...,2]<140)).sum(1)
mulai=[];
for i in range(1,len(kn)):
  if kn[i]>kn[i-1]+4 and (not mulai or i/FPS-mulai[-1]>2): mulai.append(i/FPS-0.1)
akhir_cover=(np.nonzero(kn>=kn.max()*0.9)[0][-1]+1)/FPS  # layar penutup mulai menutupi header
DUR=len(kn)/FPS;assert len(mulai)==11,mulai
# 2) frame aktif (ada gerakan)
# hanya jendela aplikasi (kolom keterangan di kanan & header diabaikan, supaya jeda 'membaca' sebelum aksi ikut terpotong)
g=raw('crop=1480:1000:0:80,scale=240:162,format=gray',162,240)[...,0];akt=np.r_[True,(np.abs(np.diff(g,axis=0))>10).sum((1,2))>3]
def padat(a,b,SISA=SISA,DIAM=DIAM):
  """interval [a,b) dengan jeda diam >DIAM detik dipangkas jadi SISA detik"""
  out=[];i=int(a*FPS);e=int(b*FPS);s=i
  while i<e:
    if not akt[i]:
      j=i
      while j<e and not akt[j]: j+=1
      sisa=AWAL if i-int(a*FPS)<5 else SISA  # jeda di awal langkah selalu dipangkas ketat
      if (j-i)/FPS>min(DIAM,sisa): out.append((s/FPS,min(j,i+int(sisa*FPS))/FPS));s=j
      i=j
    else:i+=1
  if e>s: out.append((s/FPS,e/FPS))
  return [(x,y) for x,y in out if y-x>0.05]
# 3) narasi: potong hening awal/akhir
vo=[]
for k in range(11):
  w=wave.open(f'vo/{k+1:02d}.wav');a=np.abs(np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(float))
  e=np.convolve(a,np.ones(480)/480,'same');ix=np.nonzero(e>300)[0];s,t=max(0,ix[0]/24000-0.05),ix[-1]/24000+0.1
  vo.append((s,t,(t-s)/TEMPO))
# 4) susun segmen: pembuka, langkah 1..11, penutup
seg=[[(mulai[0]-4.6,mulai[0]-2.6)]]  # 2 detik judul pembuka
batas=[mulai[0]-2.6]+mulai[1:]+[akhir_cover]
rencana=[];t=2.0;vf=[];waktu=[]
for k in range(11):
  T=0.3+vo[k][2]+(0.5 if k<10 else 1.0)
  for sisa in [SISA]+[round(SISA+0.1*j,1) for j in range(1,60)]+[99]:  # kalau video lebih pendek dari narasi, kurangi pemadatan jeda
    iv=padat(batas[k],batas[k+1],sisa);K=sum(y-x for x,y in iv)
    if K>=T: break
  if sisa==SISA:  # video lebih panjang dari narasi: padatkan jeda diam lebih ketat (tanpa mempercepat)
    for d,ss in ((0.7,0.35),(0.5,0.25),(0.4,0.2)):
      iv2=padat(batas[k],batas[k+1],ss,d);K2=sum(y-x for x,y in iv2)
      if K2<T: break
      iv,K=iv2,K2
  def tahan_di(iv,src,h):
    sb=[(x,min(y,src)) for x,y,*_ in iv if x<src];ss_=[(max(x,src),y) for x,y,*_ in iv if y>src]
    return sb[:-1]+[(sb[-1][0],sb[-1][1],h)]+ss_
  if k+1 in TAHAN:
    src,c0,c1=TAHAN[k+1];iv=padat(batas[k],batas[k+1])
    Kb=sum(y-x for x,y in iv if x<src)-sum(max(0,y-src) for x,y in iv if x<src<y)
    h=max(0,(0.3+c1-vo[k][0])-Kb)
    print(f'langkah {k+1}: layar SPS tampil {Kb:.1f}s setelah awal langkah (narasi SPS mulai {0.3+c0-vo[k][0]:.1f}s), ditahan {h:.1f}s')
    iv=tahan_di(iv,src,h);K+=0;K=sum(y-x for x,y,*_ in iv)+h
  elif K<T:
    # narasi lebih panjang dari rekaman: tahan layar di jeda diam terpanjang (bukan di awal langkah)
    a0,b0=int(batas[k]*FPS),int(batas[k+1]*FPS);best=(0,None);i=a0
    while i<b0 and not akt[i]: i+=1  # lewati jeda awal langkah
    while i<b0:
      if not akt[i]:
        j=i
        while j<b0 and not akt[j]: j+=1
        if j-i>best[0]: best=(j-i,i/FPS+min(0.2,(j-i)/FPS/2))
        i=j
      else: i+=1
    if best[1] and any(x<best[1]<y for x,y,*_ in iv):
      h=T-K;iv=tahan_di(iv,best[1],h);K+=h;print(f'langkah {k+1}: layar ditahan {h:.1f}s di detik sumber {best[1]:.1f}')
  f=1.0;O=K;pad=max(0,T-O);waktu.append(t+0.3);rencana.append((iv,f,pad));t+=O+pad
seg_out=[(seg[0],1.0,0)]+rencana+[([(akhir_cover,min(DUR,akhir_cover+3.0))],1.0,0)]
TOTAL=t+3.0
def keluaran(src):
  """waktu di video hasil untuk detik `src` di video sumber"""
  o=0.0
  for iv,f,pad in seg_out:
    for x,y,*hh in iv:
      if src<x: return o
      if src<y: return o+(src-x)/f
      o+=(y-x)/f+sum(hh)
    o+=pad
  return o
lebar=lambda p:int.from_bytes(open(p,'rb').read()[16:20],'big')
# (gambar, mulai, selesai, x-tengah, y): link di langkah 1, catatan manual di langkah 4, kontak di akhir
KARTU=[('kartu1.png',keluaran(mulai[0])+1.0,keluaran(mulai[1])+0.9,1700,350,0.3),  # keterangan langkah 1 versi baru (kartu1.js)
       ('link.png',waktu[0]+3.0,waktu[1]-0.4,770,850),('manual.png',waktu[3]+0.5,waktu[4]-0.4,770,895),
       ('sps.png',waktu[7]+TAHAN[8][1]-vo[7][0],waktu[7]+TAHAN[8][2]-vo[7][0],890,140),
       ('kontak.png',waktu[10]+vo[10][2]-5.0,TOTAL,960,820)]
# 5) filter ffmpeg
chains=[];lab=[]
n=sum(len(s[0]) for s in seg_out);chains.append(f"[0:v]split={n}"+''.join(f'[s{i}]' for i in range(n)))
i=0
for iv,f,pad in seg_out:
  for j,(x,y,*hh) in enumerate(iv):
    tahan=sum(hh)+(pad if j==len(iv)-1 else 0)
    tp=f",fps=30,tpad=stop_mode=clone:stop_duration={tahan:.2f}" if tahan>0 else ''
    chains.append(f"[s{i}]trim={x:.2f}:{y:.2f},setpts=(PTS-STARTPTS)/{f:.3f}{tp}[c{i}]");lab.append(f'[c{i}]');i+=1
chains.append(''.join(lab)+f"concat=n={n}:v=1:a=0,fps=30[vc]")
vin='[vc]'
for j,(png,a,b,xc,y,*fd) in enumerate(KARTU):
  fd=fd[0] if fd else 0.5
  chains.append(f"[{j+1}:v]format=rgba,fade=t=in:st={a:.2f}:d={fd}:alpha=1,fade=t=out:st={b-fd:.2f}:d={fd}:alpha=1[k{j}]")
  vout='[v]' if j==len(KARTU)-1 else f'[o{j}]'
  chains.append(f"{vin}[k{j}]overlay=x={xc-lebar(png)//2}:y={y}:enable='between(t,{a:.2f},{b:.2f})'{vout}");vin=vout
NK=len(KARTU)
for k,(s,e,_) in enumerate(vo):
  ms=int(waktu[k]*1000);chains.append(f"[{k+NK+2}:a]atrim={s:.2f}:{e:.2f},asetpts=PTS-STARTPTS,aresample=44100,adelay={ms}|{ms}[a{k}]")
chains.append(f"[{NK+1}:a]volume=0.12[m]");chains.append(''.join(f'[a{k}]' for k in range(11))+"[m]amix=inputs=12:normalize=0,alimiter=limit=0.89[a]")
subprocess.run(['python3','musik.py',str(TOTAL)],check=True)
cmd=[FF,'-y','-loglevel','error','-i',SRC]
for png,*_ in KARTU: cmd+=['-loop','1','-framerate','30','-t',f'{TOTAL:.2f}','-i',png]
cmd+=['-i','music.wav']
for k in range(11): cmd+=['-i',f'vo/{k+1:02d}.wav']
cmd+=['-filter_complex',';'.join(chains),'-map','[v]','-map','[a]','-t',f'{TOTAL:.2f}','-c:v','libx264','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',OUT]
subprocess.run(cmd,check=True)
json.dump({'mulai_narasi':[round(x,2) for x in waktu],'durasi':round(TOTAL,2)},open('vo/waktu-ringkas.json','w'))
for k,(iv,f,pad) in enumerate(rencana): print(f'langkah {k+1}: narasi {waktu[k]:.1f}s  cepat {f:.2f}x  jeda {pad:.1f}s')
print('durasi total',round(TOTAL,1),'detik')
