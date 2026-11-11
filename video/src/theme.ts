import {continueRender, delayRender, staticFile} from 'remotion';

// Montserrat (SIL Open Font License) bundled locally in public/fonts -> renders offline.
const FACES = [
  {weight: '600', style: 'normal'},
  {weight: '800', style: 'normal'},
  {weight: '700', style: 'italic'},
  {weight: '900', style: 'italic'},
];
if (typeof document !== 'undefined') {
  const handle = delayRender('Loading Montserrat');
  Promise.all(
    FACES.map(async ({weight, style}) => {
      const face = new FontFace('Montserrat', `url(${staticFile(`fonts/Montserrat-${weight}-${style}.ttf`)}) format('truetype')`, {weight, style});
      document.fonts.add(await face.load());
    }),
  ).then(() => continueRender(handle)).catch((e) => { console.error(e); continueRender(handle); });
}

export const fontFamily = 'Montserrat, Inter, sans-serif';
export const bodyFont = 'Montserrat, Inter, sans-serif';

export const C = {
  navy: '#0A2E4A',
  blue: '#0B5E86',
  teal: '#12858F',
  green: '#2BB24C',
  red: '#E10600',
  yellow: '#FFC20E',
  white: '#FFFFFF',
};
