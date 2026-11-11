import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, bodyFont} from './theme';

// Subtitles synced to absolute frames (30 fps). Words highlight karaoke-style.
export const CAPTIONS = [
  {from: 50, to: 92, text: 'Arranca la Semana de la Calidad'},
  {from: 100, to: 200, text: 'Cuatro paradas: un aprendizaje en cada box'},
  {from: 300, to: 380, text: 'Cada piloto gana su Licencia Calidosa'},
];

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const cap = CAPTIONS.find((c) => frame >= c.from && frame < c.to);
  if (!cap) return null;
  const words = cap.text.split(' ');
  const local = frame - cap.from;
  const dur = cap.to - cap.from;
  const opacity = interpolate(local, [0, 6, dur - 6, dur], [0, 1, 1, 0]);
  const y = interpolate(local, [0, 8], [30, 0], {extrapolateRight: 'clamp'});
  const perWord = (dur * 0.7) / words.length;
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 170}}>
      <div style={{
        opacity, transform: `translateY(${y}px)`, maxWidth: 920, textAlign: 'center',
        background: 'rgba(0,0,0,0.6)', borderRadius: 24, padding: '20px 34px',
        fontFamily: bodyFont, fontWeight: 800, fontSize: 52, lineHeight: 1.25,
        borderLeft: `10px solid ${C.red}`,
      }}>
        {words.map((w, i) => (
          <span key={i} style={{color: local >= i * perWord ? C.white : 'rgba(255,255,255,0.4)'}}>{w}{i < words.length - 1 ? ' ' : ''}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
