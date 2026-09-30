#!/bin/bash
# Gabungkan rekaman (raw/*.webm, atau VIDEO=file.mp4) + narasi (vo/*.wav sesuai vo/waktu.json) + musik pelan -> MP4
set -e; cd "$(dirname "$0")"; FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
python3 - <<'PY' > /tmp/fc.txt
import json;w=json.load(open('vo/waktu.json'));n=len(w)
f=[f"[{i+2}:a]aresample=44100,adelay={int(t*1000)}|{int(t*1000)},volume=1.0[v{i}]" for i,t in enumerate(w)]
f.append("[1:a]volume=0.12[m]");f.append("".join(f"[v{i}]" for i in range(n))+f"[m]amix=inputs={n+1}:normalize=0,alimiter=limit=0.89[a]")
print(";".join(f))
PY
VID=${VIDEO:-$(ls raw/*.webm | head -1)}
IN=""; for f in vo/[0-9][0-9].wav; do IN="$IN -i $f"; done
$FF -y -loglevel error -i "$VID" -i music.wav $IN -filter_complex "$(cat /tmp/fc.txt)" -map 0:v -map "[a]" -c:v libx264 -crf 20 -pix_fmt yuv420p -r 30 -c:a aac -b:a 192k -shortest -movflags +faststart Tutorial-Dokumen-Penyumpahan-Narasi.mp4
