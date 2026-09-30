"""Buat narasi native Indonesia dengan Gemini TTS. Butuh env GEMINI_API_KEY.
Hasil: vo/NN.wav + vo/durasi.json"""
import os, json, base64, wave, urllib.request, time, pathlib
KEY=os.environ['GEMINI_API_KEY']; MODEL=os.environ.get('GEMINI_TTS_MODEL','gemini-2.5-pro-preview-tts'); VOICE=os.environ.get('VOICE','Kore')
STYLE=("Bacakan dengan suara perempuan penutur asli bahasa Indonesia (Jakarta), logat Indonesia yang natural dan jelas, "
       "bukan aksen asing. Nada ramah, hangat, tenang, tempo sedang seperti pemandu tutorial. Teks: ")
out=pathlib.Path(__file__).with_name('vo'); out.mkdir(exist_ok=True); dur=[]
for i,t in enumerate(json.load(open(pathlib.Path(__file__).with_name('narasi.json')))):
  body={"contents":[{"parts":[{"text":STYLE+t}]}],"generationConfig":{"responseModalities":["AUDIO"],
        "speechConfig":{"languageCode":"id-ID","voiceConfig":{"prebuiltVoiceConfig":{"voiceName":VOICE}}}}}
  for a in range(5):
    try:
      r=urllib.request.urlopen(urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
        json.dumps(body).encode(),{"Content-Type":"application/json","x-goog-api-key":KEY}),timeout=180); break
    except Exception as e: print('ulang',i,e); time.sleep(8*(a+1))
  pcm=base64.b64decode(json.load(r)['candidates'][0]['content']['parts'][0]['inlineData']['data'])
  with wave.open(str(out/f'{i+1:02d}.wav'),'wb') as w: w.setnchannels(1);w.setsampwidth(2);w.setframerate(24000);w.writeframes(pcm)
  dur.append(len(pcm)/48000); print(i+1,round(dur[-1],1),'detik')
json.dump(dur,open(out/'durasi.json','w'))
