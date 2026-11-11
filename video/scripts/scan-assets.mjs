// Detects real clips (public/clips/) and Volkswagen font files (public/fonts/)
// and writes src/clips.json + src/fonts.json for the composition.
import {readdirSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';

const list = (dir, re) => {
  if (!existsSync(dir)) mkdirSync(dir, {recursive: true});
  return readdirSync(dir).filter((f) => re.test(f)).sort();
};

const clips = list('public/clips', /\.(mp4|webm|mov)$/i).map((f) => `clips/${f}`);
writeFileSync('src/clips.json', JSON.stringify(clips, null, 2) + '\n');
console.log(clips.length ? `Clips reales: ${clips.join(', ')}` : 'Sin clips en public/clips/ -> fondo animado de respaldo');

const weightOf = (n) =>
  /thin|hairline/i.test(n) ? '100' : /extralight|ultralight/i.test(n) ? '200' : /light/i.test(n) ? '300'
  : /medium/i.test(n) ? '500' : /semibold|demibold/i.test(n) ? '600' : /xbold|extrabold|ultrabold/i.test(n) ? '800'
  : /heavy|black/i.test(n) ? '900' : /bold/i.test(n) ? '700' : '400';
const fonts = list('public/fonts', /volks.*\.(ttf|otf|woff2?)$/i).map((f) => ({
  file: `fonts/${f}`,
  weight: weightOf(f),
  style: /italic|oblique/i.test(f) ? 'italic' : 'normal',
}));
writeFileSync('src/fonts.json', JSON.stringify(fonts, null, 2) + '\n');
console.log(fonts.length
  ? `Volkswagen Serial: ${fonts.map((f) => `${f.file} (${f.weight} ${f.style})`).join(', ')}`
  : 'Sin archivos Volkswagen en public/fonts/ -> se usa la instalada en el sistema o Montserrat');
