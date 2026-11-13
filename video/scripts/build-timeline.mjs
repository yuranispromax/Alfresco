// Builds src/timeline.json from src/voz.json: scene lengths follow the voice-over.
import {readFileSync, writeFileSync} from 'node:fs';
const FPS = 30, T = 15, LEAD = 14, GAP = 8, TAIL = 16;
const voz = JSON.parse(readFileSync('src/voz.json', 'utf8'));
let start = 0;
const scenes = voz.map((b, i) => {
  const lead = i === 0 ? 6 : LEAD;
  let off = lead;
  const lines = b.lines.map((l) => {
    const line = {...l, from: off};
    off += l.frames + GAP;
    return line;
  });
  const extra = b.scene === 'cierre' ? 50 : 0;
  const duration = off - GAP + TAIL + extra;
  const s = {scene: b.scene, start, duration, lines};
  start += duration - T;
  return s;
});
const total = start + T;
const intro = scenes[0];
const l1 = intro.lines[0];
const lights = [0, 1, 2, 3, 4].map((k) => Math.round(l1.from + (k * l1.frames) / 6));
const lightsOut = l1.from + l1.frames + 2;
const cuts = scenes.slice(1).map((s) => s.start);
writeFileSync('src/timeline.json', JSON.stringify({fps: FPS, transition: T, total, lights, lightsOut, cuts, scenes}, null, 2) + '\n');
console.log(`Timeline: ${total} frames (${(total / FPS).toFixed(1)} s)`);
