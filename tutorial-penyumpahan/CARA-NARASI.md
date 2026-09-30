# Video tutorial + narasi Gemini TTS (penutur native Indonesia)
Syarat: env `GEMINI_API_KEY` di environment sesi.
1. `python3 tts.py`: membuat `vo/01..11.wav` dari `narasi.json` (voice Kore, languageCode id-ID).
2. Siapkan lib: `mkdir lib && cd lib && for p in pdfjs-dist@3.11.174 jszip@3.10.1 html2canvas@1.4.1; do npm pack $p; done && for f in *.tgz; do tar xzf $f && mv package ${f%.tgz}; done`
3. `python3 -m http.server 8766 &` lalu `node record2.js` (tiap langkah menunggu narasinya selesai).
4. Buat `music.wav` (musik latar), lalu `./gabung.sh` menghasilkan `Tutorial-Dokumen-Penyumpahan-Narasi.mp4`.

Versi ringkas (~2 menit, dipakai sekarang) dari video yang sudah ada, tanpa merekam ulang:
`node link.js` dan `node kartu1.js` (kartu teks; kartu1.js butuh `python3 -m http.server 8766`) lalu `python3 potong.py`. Skrip ini mendeteksi awal tiap langkah dari
progress bar, memadatkan layar yang diam, menyelaraskan narasi (tanpa percepatan), dan membuat musik (`musik.py`).
Buat ulang satu narasi saja: `ONLY=1 python3 tts.py`.

Logo Pengayoman: `logo-pengayoman.png` dipakai di stage.html; `node logo.js` membuat logo-header.png, cover-buka.png, cover-tutup.png yang ditempel potong.py.
