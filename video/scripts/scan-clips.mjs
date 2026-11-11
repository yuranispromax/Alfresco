// Detects real clips in public/clips/ and writes src/clips.json for the composition.
import {readdirSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
const dir = 'public/clips';
if (!existsSync(dir)) mkdirSync(dir, {recursive: true});
const clips = readdirSync(dir).filter((f) => /\.(mp4|webm|mov)$/i.test(f)).sort().map((f) => `clips/${f}`);
writeFileSync('src/clips.json', JSON.stringify(clips, null, 2) + '\n');
console.log(clips.length ? `Clips reales detectados: ${clips.join(', ')}` : 'Sin clips en public/clips/ -> se usa fondo animado de respaldo');
