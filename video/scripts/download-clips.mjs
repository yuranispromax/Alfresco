// Downloads free videos of real people from Wikimedia Commons (no API key, free licenses)
// and converts them to vertical 1080x1920 MP4 in public/clips/.
// Usage: node scripts/download-clips.mjs
import {execFileSync} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';

const QUERIES = [
  'nurse hospital patient',
  'doctor patient consultation',
  'medical team hospital',
  'pit stop formula',
];
const MAX = 4;
const UA = 'remotion-clip-downloader/1.0';
mkdirSync('public/clips', {recursive: true});

const api = async (params) => {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({format: 'json', origin: '*', ...params});
  const r = await fetch(url, {headers: {'User-Agent': UA}});
  return r.json();
};

let n = 0;
for (const q of QUERIES) {
  if (n >= MAX) break;
  const res = await api({
    action: 'query', generator: 'search', gsrnamespace: '6', gsrlimit: '10',
    gsrsearch: `${q} filetype:video`, prop: 'videoinfo', viprop: 'url|size|mediatype',
  });
  const pages = Object.values(res.query?.pages ?? {}).filter((p) => p.videoinfo?.[0]?.size < 80e6);
  const page = pages[0];
  if (!page) { console.log(`Sin resultados: ${q}`); continue; }
  const src = page.videoinfo[0].url;
  n++;
  const raw = `public/clips/_raw${n}`;
  console.log(`[${n}] ${page.title}\n    ${src}`);
  const buf = Buffer.from(await (await fetch(src, {headers: {'User-Agent': UA}})).arrayBuffer());
  writeFileSync(raw, buf);
  execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-ss', '1', '-t', '6', '-i', raw,
    '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30',
    '-an', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', `public/clips/clip${n}.mp4`], {stdio: 'inherit'});
  execFileSync('rm', ['-f', raw]);
}
console.log(`Listo: ${n} clips en public/clips/. Ejecuta: npm run render`);
