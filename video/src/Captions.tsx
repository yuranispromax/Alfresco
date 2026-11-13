import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, bodyFont} from './theme';
import {TL} from './timeline';

// Subtitles generated from the voice-over timeline: each line is split into short chunks
// whose timing is proportional to their length; words light up karaoke-style.
type Cap = {from: number; to: number; text: string};
const CAPS: Cap[] = TL.scenes.flatMap((s) =>
  s.lines.flatMap((l) => {
    const words = l.text.split(' ');
    const groups: string[] = [];
    for (let i = 0; i < words.length; i += 6) groups.push(words.slice(i, i + 6).join(' '));
    const total = groups.reduce((a, g) => a + g.length, 0);
    let at = s.start + l.from;
    return groups.map((g) => {
      const len = (g.length / total) * l.frames;
      const cap = {from: Math.round(at), to: Math.round(at + len), text: g};
      at += len;
      return cap;
    });
  }),
);

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const cap = CAPS.find((c) => frame >= c.from && frame < c.to);
  if (!cap) return null;
  const words = cap.text.split(' ');
  const local = frame - cap.from;
  const dur = cap.to - cap.from;
  const y = interpolate(local, [0, 5], [20, 0], {extrapolateRight: 'clamp'});
  const perWord = dur / words.length;
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 150}}>
      <div style={{
        transform: `translateY(${y}px)`, maxWidth: 960, textAlign: 'center',
        background: 'rgba(0,0,0,0.68)', borderRadius: 24, padding: '18px 32px',
        fontFamily: bodyFont, fontWeight: 800, fontSize: 48, lineHeight: 1.25, borderLeft: `10px solid ${C.red}`,
      }}>
        {words.map((w, i) => (
          <span key={i} style={{color: local >= i * perWord ? C.white : 'rgba(255,255,255,0.45)'}}>{w}{i < words.length - 1 ? ' ' : ''}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
