// Ilustraciones originales dibujadas en código (SVG): carro F1, pista, trofeo, medalla.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {getLength, getPointAtLength, getTangentAtLength} from '@remotion/paths';
import {C} from './theme';

/** Rueda con rin y radios que giran. */
const Wheel: React.FC<{cx: number; cy: number; r: number; spin: number}> = ({cx, cy, r, spin}) => (
  <g transform={`translate(${cx} ${cy})`}>
    <circle r={r} fill="#151515" />
    <circle r={r * 0.92} fill="none" stroke={C.yellow} strokeWidth={r * 0.07} />
    <circle r={r * 0.55} fill="#5d6770" />
    <g transform={`rotate(${spin})`}>
      {Array.from({length: 6}, (_, i) => (
        <rect key={i} x={-r * 0.05} y={-r * 0.52} width={r * 0.1} height={r * 0.52} fill="#c9d2da" transform={`rotate(${i * 60})`} />
      ))}
    </g>
    <circle r={r * 0.14} fill={C.red} />
  </g>
);

/** Carro de Fórmula 1 (vista lateral) con colores institucionales. */
export const F1Car: React.FC<{width?: number; number?: string; speed?: number; color?: string}> = ({width = 600, number = '1', speed = 22, color = C.teal}) => {
  const frame = useCurrentFrame();
  const spin = frame * speed;
  const bob = Math.sin(frame / 2.2) * 1.2;
  return (
    <svg viewBox="0 0 620 200" width={width} style={{overflow: 'visible', filter: 'drop-shadow(0 18px 18px rgba(0,0,0,0.45))'}}>
      <defs>
        <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9e2e8" />
        </linearGradient>
        <linearGradient id="livery" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.navy} />
          <stop offset="1" stopColor={color} />
        </linearGradient>
      </defs>
      <ellipse cx="310" cy="178" rx="290" ry="12" fill="rgba(0,0,0,0.35)" />
      <g transform={`translate(0 ${bob})`}>
        {/* alerón trasero */}
        <rect x="18" y="26" width="16" height="92" rx="4" fill="#1d2329" />
        <rect x="14" y="22" width="78" height="22" rx="6" fill="url(#livery)" />
        <rect x="14" y="48" width="70" height="10" rx="4" fill={C.red} />
        {/* cuerpo */}
        <path d="M40 132 L60 96 Q90 70 140 66 L210 60 Q240 40 270 44 L300 62 L420 84 Q500 100 585 128 L590 142 L40 146 Z" fill="url(#body)" />
        {/* franja de color */}
        <path d="M60 110 L150 88 L300 84 L430 102 Q510 116 586 132 L586 140 L60 140 Z" fill="url(#livery)" />
        <path d="M150 120 L430 112 Q500 120 560 134 L300 134 Z" fill={C.red} opacity="0.95" />
        {/* toma de aire y cockpit */}
        <path d="M205 62 Q232 26 268 34 L276 60 Z" fill="#1d2329" />
        <circle cx="262" cy="56" r="20" fill={C.yellow} />
        <path d="M250 50 h26 v10 h-26 z" fill="#1d2329" />
        {/* halo */}
        <path d="M232 60 Q258 30 312 46 L320 70" fill="none" stroke="#1d2329" strokeWidth="7" strokeLinecap="round" />
        {/* número */}
        <circle cx="360" cy="100" r="22" fill="#fff" stroke={C.navy} strokeWidth="4" />
        <text x="360" y="110" textAnchor="middle" fontFamily="'Volkswagen Serial', Montserrat, sans-serif" fontWeight="800" fontSize="28" fill={C.navy}>{number}</text>
        {/* alerón delantero */}
        <path d="M520 146 L612 140 L612 154 L520 156 Z" fill="url(#livery)" />
        <rect x="596" y="126" width="10" height="30" rx="3" fill="#1d2329" />
        {/* suspensión */}
        <path d="M150 128 L210 110 M470 132 L420 108" stroke="#1d2329" strokeWidth="5" />
        <Wheel cx={140} cy={140} r={44} spin={spin} />
        <Wheel cx={478} cy={144} r={38} spin={spin * 1.15} />
      </g>
    </svg>
  );
};

/** Pista de carreras que se dibuja; el carro recorre y enciende los puntos de control. */
const TRACK = 'M160 560 L160 300 Q160 170 290 170 L420 170 Q520 170 540 260 Q560 340 650 330 L760 320 Q880 310 880 430 L880 560 Q880 680 760 680 L300 680 Q160 680 160 560 Z';
export const Track: React.FC<{progress: number; stops?: number[]; color?: string; width?: number}> = ({progress, stops = [], color = C.teal, width = 900}) => {
  const len = getLength(TRACK);
  const p = Math.max(0, Math.min(1, progress));
  const at = (t: number) => getPointAtLength(TRACK, len * t) ?? {x: 0, y: 0};
  const car = at(p);
  const tan = getTangentAtLength(TRACK, len * p) ?? {x: 1, y: 0};
  const ang = (Math.atan2(tan.y, tan.x) * 180) / Math.PI;
  return (
    <svg viewBox="100 110 840 640" width={width}>
      <rect x="100" y="110" width="840" height="640" rx="40" fill="#2d8a4e" />
      <path d={TRACK} fill="none" stroke="#fff" strokeWidth="78" strokeDasharray="22 22" />
      <path d={TRACK} fill="none" stroke={C.red} strokeWidth="78" strokeDasharray="22 22" strokeDashoffset="22" opacity="0.9" />
      <path d={TRACK} fill="none" stroke="#3b4248" strokeWidth="64" />
      <path d={TRACK} fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="26 26" opacity="0.6" />
      <path d={TRACK} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${len * p} ${len}`} />
      {/* línea de salida */}
      <g transform="translate(128 430)">
        {Array.from({length: 16}, (_, i) => <rect key={i} x={(i % 8) * 8} y={Math.floor(i / 8) * 8} width="8" height="8" fill={(i + Math.floor(i / 8)) % 2 ? '#111' : '#fff'} />)}
      </g>
      {stops.map((s, i) => {
        const pt = at(s);
        const on = p >= s;
        return (
          <g key={i} transform={`translate(${pt.x} ${pt.y})`}>
            <circle r={on ? 34 : 28} fill={on ? color : '#fff'} stroke={C.navy} strokeWidth="6" />
            <text y="12" textAnchor="middle" fontFamily="'Volkswagen Serial', Montserrat, sans-serif" fontWeight="800" fontSize="34" fill={on ? '#fff' : C.navy}>{i + 1}</text>
          </g>
        );
      })}
      <g transform={`translate(${car.x} ${car.y}) rotate(${ang})`}>
        <rect x="-30" y="-14" width="60" height="28" rx="12" fill={C.white} stroke={C.navy} strokeWidth="4" />
        <rect x="-6" y="-9" width="22" height="18" rx="6" fill={C.yellow} />
        <rect x="24" y="-18" width="10" height="36" rx="3" fill={C.red} />
        <rect x="-36" y="-18" width="8" height="36" rx="3" fill={C.red} />
      </g>
    </svg>
  );
};

/** Trofeo dorado con brillo animado. */
export const Trophy: React.FC<{width?: number}> = ({width = 420}) => {
  const frame = useCurrentFrame();
  const shine = ((frame * 6) % 700) - 200;
  return (
    <svg viewBox="0 0 400 480" width={width} style={{filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))'}}>
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset="0.45" stopColor="#ffc20e" />
          <stop offset="1" stopColor="#b8860b" />
        </linearGradient>
        <clipPath id="cup"><path d="M90 40 H310 V150 Q310 290 200 300 Q90 290 90 150 Z" /></clipPath>
      </defs>
      <path d="M95 70 Q20 70 30 140 Q40 200 110 215" fill="none" stroke="url(#gold)" strokeWidth="22" strokeLinecap="round" />
      <path d="M305 70 Q380 70 370 140 Q360 200 290 215" fill="none" stroke="url(#gold)" strokeWidth="22" strokeLinecap="round" />
      <path d="M90 40 H310 V150 Q310 290 200 300 Q90 290 90 150 Z" fill="url(#gold)" />
      <rect x={shine} y="0" width="60" height="320" fill="rgba(255,255,255,0.45)" transform="skewX(-20)" clipPath="url(#cup)" />
      <path d="M200 95 l18 38 42 5 -31 29 8 42 -37 -21 -37 21 8 -42 -31 -29 42 -5 z" fill="#fff8d6" stroke="#b8860b" strokeWidth="4" />
      <rect x="180" y="298" width="40" height="70" fill="url(#gold)" />
      <path d="M130 368 H270 L290 410 H110 Z" fill="url(#gold)" />
      <rect x="90" y="410" width="220" height="56" rx="10" fill={C.navy} />
      <text x="200" y="448" textAnchor="middle" fontFamily="'Volkswagen Serial', Montserrat, sans-serif" fontWeight="800" fontStyle="italic" fontSize="30" fill={C.yellow}>CALIDAD 2026</text>
    </svg>
  );
};

/** Medalla con cinta. */
export const Medal: React.FC<{width?: number}> = ({width = 260}) => {
  const frame = useCurrentFrame();
  return (
    <svg viewBox="0 0 240 360" width={width} style={{filter: 'drop-shadow(0 16px 24px rgba(0,0,0,0.5))', transform: `rotate(${Math.sin(frame / 10) * 6}deg)`, transformOrigin: '50% 0%'}}>
      <defs>
        <linearGradient id="gold-medal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset="0.45" stopColor="#ffc20e" />
          <stop offset="1" stopColor="#b8860b" />
        </linearGradient>
      </defs>
      <path d="M60 0 L110 150 L80 160 L20 0 Z" fill={C.red} />
      <path d="M180 0 L130 150 L160 160 L220 0 Z" fill={C.blue} />
      <path d="M100 0 L120 120 L140 0 Z" fill="#fff" />
      <circle cx="120" cy="245" r="100" fill="url(#gold-medal)" stroke="#b8860b" strokeWidth="8" />
      <circle cx="120" cy="245" r="74" fill="none" stroke="#fff3b0" strokeWidth="4" />
      <g transform="translate(78 205)">
        {Array.from({length: 16}, (_, i) => <rect key={i} x={(i % 4) * 21} y={Math.floor(i / 4) * 21} width="21" height="21" fill={(i + Math.floor(i / 4)) % 2 ? C.navy : '#fff8d6'} />)}
      </g>
    </svg>
  );
};

/** Mascota "Calidoso" de MiRed IPS dibujada en código (pulgar arriba, camiseta institucional). */
export const Mascot: React.FC<{height?: number; shirt?: string; text?: string}> = ({height = 700, shirt = '#0B6690', text = 'MiRed'}) => {
  const frame = useCurrentFrame();
  const bounce = Math.abs(Math.sin(frame / 7)) * -8;
  const thumb = Math.sin(frame / 5) * 6;
  const blink = frame % 90 < 4 ? 0.15 : 1;
  const K = '#1a1a1a';
  return (
    <svg viewBox="0 0 400 820" height={height} style={{overflow: 'visible', filter: 'drop-shadow(0 16px 20px rgba(0,0,0,0.4))'}}>
      <ellipse cx="200" cy="800" rx="150" ry="14" fill="rgba(0,0,0,0.3)" />
      <g transform={`translate(0 ${bounce})`}>
        {/* piernas y tenis */}
        <path d="M128 520 L118 740 L178 740 L196 560 L208 560 L222 740 L282 740 L272 520 Z" fill="#202020" stroke={K} strokeWidth="6" strokeLinejoin="round" />
        <path d="M100 742 Q100 712 146 712 L180 716 L182 770 L106 770 Q96 770 100 742 Z" fill="#E33B35" stroke={K} strokeWidth="6" />
        <path d="M218 716 L254 712 Q300 712 300 742 Q304 770 294 770 L218 770 Z" fill="#E33B35" stroke={K} strokeWidth="6" />
        <path d="M104 764 L182 764 M218 764 L296 764" stroke="#fff" strokeWidth="6" />
        {/* brazo derecho (mano en la cintura) */}
        <path d="M300 340 Q352 420 316 480 Q300 500 280 492" fill="none" stroke={K} strokeWidth="44" strokeLinecap="round" />
        <path d="M300 340 Q352 420 316 480 Q300 500 280 492" fill="none" stroke="#F9C98F" strokeWidth="32" strokeLinecap="round" />
        {/* camiseta */}
        <path d="M118 300 Q200 268 282 300 L340 380 L300 410 L284 380 L280 532 Q200 548 120 532 L116 380 L100 410 L60 380 Z" fill={shirt} stroke={K} strokeWidth="6" strokeLinejoin="round" />
        <path d="M120 462 L280 462 L280 532 Q200 548 120 532 Z" fill="#fff" opacity="0.95" />
        <circle cx="214" cy="482" r="18" fill="#E30613" /><circle cx="186" cy="500" r="10" fill="#009A44" /><circle cx="232" cy="512" r="8" fill="#FFD500" />
        <text x="200" y="388" textAnchor="middle" fontFamily="'Volkswagen Serial', Montserrat, sans-serif" fontWeight="800" fontStyle="italic" fontSize="44" fill="#fff">{text}</text>
        <text x="262" y="388" fontFamily="'Volkswagen Serial', Montserrat, sans-serif" fontWeight="800" fontStyle="italic" fontSize="18" fill="#fff">IPS</text>
        {/* cuello y cabeza */}
        <rect x="176" y="250" width="48" height="50" fill="#F9C98F" stroke={K} strokeWidth="6" />
        <ellipse cx="106" cy="180" rx="22" ry="30" fill="#F9C98F" stroke={K} strokeWidth="6" />
        <ellipse cx="294" cy="180" rx="22" ry="30" fill="#F9C98F" stroke={K} strokeWidth="6" />
        <path d="M110 120 Q110 40 200 36 Q290 40 290 120 L290 200 Q284 284 200 286 Q116 284 110 200 Z" fill="#F9C98F" stroke={K} strokeWidth="6" />
        <path d="M108 140 Q96 40 190 22 Q300 10 300 110 L290 130 Q270 70 200 72 Q140 74 120 150 Z" fill="#6b4f3a" />
        <path d="M86 70 Q96 96 120 86 Q150 20 230 18 Q300 18 304 80 Q300 120 286 110 Q270 60 200 66 Q140 70 120 120 Q90 110 86 70 Z" fill={K} />
        <ellipse cx="160" cy="168" rx="9" ry={14 * blink} fill={K} />
        <ellipse cx="240" cy="168" rx="9" ry={14 * blink} fill={K} />
        <path d="M144 136 Q160 124 176 136 M224 136 Q240 124 256 136" fill="none" stroke={K} strokeWidth="5" strokeLinecap="round" />
        <path d="M206 186 Q186 196 196 212 Q204 218 212 212" fill="none" stroke={K} strokeWidth="5" strokeLinecap="round" />
        <path d="M150 226 Q200 268 252 222" fill="none" stroke={K} strokeWidth="6" strokeLinecap="round" />
        {/* brazo izquierdo con pulgar arriba */}
        <g transform={`rotate(${thumb} 104 360)`}>
          <path d="M104 360 Q60 420 70 300" fill="none" stroke={K} strokeWidth="44" strokeLinecap="round" />
          <path d="M104 360 Q60 420 70 300" fill="none" stroke="#F9C98F" strokeWidth="32" strokeLinecap="round" />
          <rect x="40" y="252" width="64" height="66" rx="22" fill="#F9C98F" stroke={K} strokeWidth="6" />
          <rect x="54" y="190" width="28" height="78" rx="14" fill="#F9C98F" stroke={K} strokeWidth="6" />
          <path d="M48 276 L80 276 M48 296 L80 296" stroke={K} strokeWidth="4" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
};
