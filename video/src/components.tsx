import React from 'react';
import {
  AbsoluteFill, Img, OffthreadVideo, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';
import clips from './clips.json';
import {C, fontFamily, bodyFont} from './theme';

/** Real clip background with slow camera move (zoom + pan). Falls back to animated track bg. */
export const ClipBg: React.FC<{index: number; zoom?: [number, number]; pan?: [number, number]}> = ({
  index, zoom = [1.08, 1.22], pan = [-30, 30],
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
  const scale = zoom[0] + (zoom[1] - zoom[0]) * t;
  const x = pan[0] + (pan[1] - pan[0]) * t;
  const list = clips as string[];
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: C.navy}}>
      <AbsoluteFill style={{transform: `scale(${scale}) translateX(${x}px)`}}>
        {list.length > 0 ? (
          <OffthreadVideo src={staticFile(list[index % list.length])} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : (
          <SpeedBg seed={index} />
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,46,74,0.55) 0%, rgba(10,46,74,0.05) 35%, rgba(10,46,74,0.15) 60%, rgba(10,46,74,0.9) 100%)'}} />
    </AbsoluteFill>
  );
};

/** Fallback: animated race-track background (speed streaks + kerb). */
export const SpeedBg: React.FC<{seed: number}> = ({seed}) => {
  const frame = useCurrentFrame();
  const streaks = Array.from({length: 26}, (_, i) => {
    const r = Math.sin((i + 1) * 999 + seed * 77) * 10000;
    const rnd = r - Math.floor(r);
    const speed = 30 + rnd * 50;
    const y = ((rnd * 3000 + frame * speed) % 2600) - 400;
    const x = (i / 26) * 1300 - 100;
    const color = [C.white, C.yellow, C.green, C.teal][i % 4];
    return <div key={i} style={{position: 'absolute', left: x, top: y, width: 6 + rnd * 10, height: 200 + rnd * 400, borderRadius: 20, background: color, opacity: 0.12 + rnd * 0.25}} />;
  });
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% ${40 + seed * 10}%, ${C.teal} 0%, ${C.blue} 40%, ${C.navy} 100%)`}}>
      <AbsoluteFill style={{transform: 'rotate(-18deg) scale(1.4)'}}>{streaks}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Checkered strip, scrolling. */
export const Checker: React.FC<{size?: number; rows?: number; speed?: number; style?: React.CSSProperties}> = ({size = 40, rows = 2, speed = 4, style}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{
      height: size * rows, width: '100%',
      backgroundImage: `conic-gradient(#111 25%, #fff 0 50%, #111 0 75%, #fff 0)`,
      backgroundSize: `${size * 2}px ${size * 2}px`,
      backgroundPositionX: frame * speed,
      ...style,
    }} />
  );
};

/** Kinetic title: each word springs in. */
export const KineticTitle: React.FC<{text: string; delay?: number; size?: number; color?: string; highlight?: string[]; stagger?: number}> = ({
  text, delay = 0, size = 120, color = C.white, highlight = [], stagger = 4,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${size * 0.25}px`, padding: '0 60px'}}>
      {text.split(' ').map((w, i) => {
        const s = spring({frame: frame - delay - i * stagger, fps, config: {damping: 13, stiffness: 160}});
        return (
          <span key={i} style={{
            fontFamily, fontWeight: 900, fontStyle: 'italic', fontSize: size, lineHeight: 1.02,
            color: highlight.includes(w) ? C.yellow : color, textTransform: 'uppercase',
            transform: `translateY(${(1 - s) * 80}px) skewX(-6deg) scale(${0.6 + 0.4 * s})`,
            opacity: s, textShadow: '0 8px 30px rgba(0,0,0,0.55)', display: 'inline-block',
          }}>{w}</span>
        );
      })}
    </div>
  );
};

/** Pill label. */
export const Tag: React.FC<{children: React.ReactNode; bg?: string; delay?: number}> = ({children, bg = C.red, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 14}});
  return (
    <div style={{
      fontFamily: bodyFont, fontWeight: 800, fontSize: 40, letterSpacing: 4, color: C.white,
      background: bg, padding: '14px 34px', borderRadius: 999, textTransform: 'uppercase',
      transform: `scale(${s})`, boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
    }}>{children}</div>
  );
};

export const Logo: React.FC<{width?: number}> = ({width = 420}) => (
  <div style={{background: C.white, borderRadius: 28, padding: '22px 36px', boxShadow: '0 12px 40px rgba(0,0,0,0.35)'}}>
    <Img src={staticFile('img/logo.png')} style={{width, display: 'block'}} />
  </div>
);
