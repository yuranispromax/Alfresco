import {continueRender, delayRender, staticFile} from 'remotion';
import vwFonts from './fonts.json';

// Brand font: Volkswagen Serial (same as the presentation). It is commercial, so it is not
// bundled: drop its .ttf/.otf files in public/fonts/ (name must contain "volks") or have it
// installed on the system. Montserrat (SIL OFL, bundled) is the fallback.
const FACES = [
  {weight: '600', style: 'normal'},
  {weight: '800', style: 'normal'},
  {weight: '700', style: 'italic'},
  {weight: '900', style: 'italic'},
];
if (typeof document !== 'undefined') {
  const handle = delayRender('Loading Montserrat');
  const load = async (family: string, file: string, weight: string, style: string) => {
    const face = new FontFace(family, `url(${staticFile(file)})`, {weight, style});
    document.fonts.add(await face.load());
  };
  Promise.all([
    ...FACES.map(({weight, style}) => load('Montserrat', `fonts/Montserrat-${weight}-${style}.ttf`, weight, style)),
    ...(vwFonts as {file: string; weight: string; style: string}[]).map((f) => load('Volkswagen Serial', f.file, f.weight, f.style)),
  ]).then(() => continueRender(handle)).catch((e) => { console.error(e); continueRender(handle); });
}

export const fontFamily = "'Volkswagen Serial', Montserrat, Inter, sans-serif";
export const bodyFont = "'Volkswagen Serial', Montserrat, Inter, sans-serif";

export const C = {
  navy: '#0A2E4A',
  blue: '#0B5E86',
  teal: '#12858F',
  green: '#2BB24C',
  red: '#E10600',
  yellow: '#FFC20E',
  white: '#FFFFFF',
};
