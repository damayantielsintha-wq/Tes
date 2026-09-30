"""Musik latar ceria menenangkan (C-G-Am-F, pad + arpeggio bell, 88 bpm). Pakai: python3 musik.py DETIK"""
import sys,wave,numpy as np
SR=44100;DUR=float(sys.argv[1]) if len(sys.argv)>1 else 205;beat=60/88;bar=4*beat
n=int(SR*DUR);t=np.arange(n)/SR;L=np.zeros(n);R=np.zeros(n)
f=lambda m:440*2**((m-69)/12)
chords=[[48,52,55,60,64],[43,50,55,59,62],[45,52,57,60,64],[41,48,53,57,60]]
for b in range(int(DUR/bar)+1):
  c=chords[b%4];s0=int(b*bar*SR);s1=min(n,int((b+1)*bar*SR)+int(0.6*SR))
  if s0>=n:break
  tt=np.arange(s1-s0)/SR;env=np.minimum(1,tt/0.8)*np.minimum(1,np.maximum(0,(bar+0.6-tt)/0.6))
  for k,m in enumerate(c):
    pad=(np.sin(2*np.pi*f(m)*tt)+0.3*np.sin(2*np.pi*f(m)*1.003*tt+1)+0.15*np.sin(2*np.pi*2*f(m)*tt))*env*0.05
    L[s0:s1]+=pad*(0.6+0.1*k/5);R[s0:s1]+=pad*(0.7-0.1*k/5)
  for j,m in enumerate([c[2]+12,c[3]+12,c[4]+12,c[3]+12]*2):
    a0=int((b*bar+j*beat/2)*SR)
    if a0>=n:break
    ln=min(n-a0,int(1.6*SR));ta=np.arange(ln)/SR
    bell=(np.sin(2*np.pi*f(m)*ta)+0.4*np.sin(2*np.pi*f(m)*2.76*ta)*np.exp(-ta*6))*np.exp(-ta*3.2)*np.minimum(1,ta/0.005)*0.07
    pan=0.35+0.3*(j%2);L[a0:a0+ln]+=bell*(1-pan);R[a0:a0+ln]+=bell*pan
for dl,g in[(0.23,0.25),(0.41,0.15)]:
  k=int(dl*SR);L[k:]+=g*R[:-k];R[k:]+=g*L[:-k]
x=np.stack([L,R],1)*np.minimum(1,np.minimum(t/3,(DUR-t)/4))[:,None];x=x/np.abs(x).max()*0.8
w=wave.open('music.wav','wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((x*32767).astype(np.int16).tobytes());w.close()
