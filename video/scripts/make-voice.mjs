// Voice-over from src/guion.json using Google Translate's public TTS (free, no API key).
// Each line -> public/audio/voz/lN.mp3 (sped up + EQ/compression); durations -> src/voz.json.
// Usage: node scripts/make-voice.mjs   (needs curl + network)
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync, rmSync} from 'node:fs';

const FPS = 30;
const LANG = 'es-419';
const TEMPO = 1.2;
// Pronunciation fixes (only affect the audio, not the subtitles).
const SAY = [
  [/MiRed IPS/g, 'Mi Red, i pe ese'],
  [/CUD/g, 'ce u de'],
  [/Pit Lane/g, 'Pit Léin'],
];
const guion = JSON.parse(readFileSync('src/guion.json', 'utf8'));
const out = 'public/audio/voz';
const tmp = `${out}/_tmp`;
mkdirSync(tmp, {recursive: true});

// Split text into <=180-char chunks at punctuation.
const chunks = (text) => {
  const parts = text.match(/[^,.:;!?¡¿]+[,.:;!?]*/g) ?? [text];
  const res = [];
  for (const p of parts.map((s) => s.trim()).filter(Boolean)) {
    if (res.length && (res.at(-1) + ' ' + p).length <= 180) res[res.length - 1] += ' ' + p;
    else res.push(p);
  }
  return res;
};
// Prefer a full system ffmpeg (better voice processing); fall back to the one bundled with Remotion.
let SYS = true;
try { execFileSync('ffmpeg', ['-version'], {stdio: 'ignore'}); } catch { SYS = false; }
const ff = (bin, args) => SYS ? execFileSync(bin, args) : execFileSync('npx', ['remotion', bin, ...args]);
const ffmpeg = (args) => ff('ffmpeg', ['-v', 'error', '-y', ...args]);
const duration = (f) => parseFloat(ff('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());
const FILTER = SYS
  ? `atempo=${TEMPO},silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=stop_periods=-1:stop_duration=0.22:stop_threshold=-42dB:stop_silence=0.12,` +
    'highpass=f=90,equalizer=f=3000:t=q:w=1:g=3,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,loudnorm=I=-15:TP=-1.5'
  : `atempo=${TEMPO},loudnorm=I=-15:TP=-1.5`;

const result = [];
let n = 0;
for (const block of guion) {
  const lines = [];
  for (const text of block.lines) {
    n++;
    // Voz propia: si existe public/audio/voz-propia/lN.(mp3|wav|m4a|ogg) se usa en lugar de la voz automática.
    const own = ['mp3', 'wav', 'm4a', 'ogg'].map((e) => `public/audio/voz-propia/l${n}.${e}`).find((f) => existsSync(f));
    if (own) {
      const file = `audio/voz/l${n}.mp3`;
      ffmpeg(['-i', own, '-af', FILTER.replace(`atempo=${TEMPO},`, ''), '-ar', '48000', '-ac', '2', '-b:a', '192k', `public/${file}`]);
      const sec = duration(`public/${file}`);
      lines.push({text, file, frames: Math.ceil(sec * FPS)});
      console.log(`${file}  ${sec.toFixed(2)} s  [voz propia] ${text}`);
      continue;
    }
    let say = text;
    for (const [re, rep] of SAY) say = say.replace(re, rep);
    const parts = chunks(say).map((c, i) => {
      const f = `${tmp}/l${n}_${i}.mp3`;
      const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${LANG}&q=${encodeURIComponent(c)}`;
      execFileSync('curl', ['-sSf', '-A', 'Mozilla/5.0', '-o', f, url]);
      return f;
    });
    writeFileSync(`${tmp}/list${n}.txt`, parts.map((p) => `file '${p.split('/').pop()}'`).join('\n'));
    const file = `audio/voz/l${n}.mp3`;
    ffmpeg(['-f', 'concat', '-safe', '0', '-i', `${tmp}/list${n}.txt`,
      '-af', FILTER,
      '-ar', '48000', '-ac', '2', '-b:a', '192k', `public/${file}`]);
    const sec = duration(`public/${file}`);
    lines.push({text, file, frames: Math.ceil(sec * FPS)});
    console.log(`${file}  ${sec.toFixed(2)} s  ${text}`);
  }
  result.push({scene: block.scene, lines});
}
rmSync(tmp, {recursive: true, force: true});
writeFileSync('src/voz.json', JSON.stringify(result, null, 2) + '\n');
console.log('src/voz.json listo');
