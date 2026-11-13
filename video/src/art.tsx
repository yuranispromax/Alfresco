// Ilustraciones originales dibujadas en código (SVG): carro F1, pista, trofeo, medalla.
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
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

/** Circuito en vista superior: césped rayado, grava, pianos, asfalto, tribuna, árboles,
 *  línea de meta y el carro MiRed (vista superior) recorriendo la pista. */
const TRACK = 'M200 520 L700 520 C820 520 880 480 880 400 L880 360 C880 300 830 270 780 280 L640 310 C590 320 560 290 570 240 L600 160 C620 100 600 80 540 80 L220 80 C140 80 110 120 110 190 L110 430 C110 490 140 520 200 520 Z';
const TREES = [[40, 60], [70, 300], [40, 560], [960, 80], [930, 200], [700, 180], [760, 140], [960, 560], [400, 200], [450, 400], [300, 420], [650, 40], [380, 40], [960, 420]];
export const Track: React.FC<{progress: number; stops?: number[]; color?: string; width?: number; labels?: string[]}> = ({progress, stops = [], color = C.teal, width = 1000, labels = []}) => {
  const frame = useCurrentFrame();
  const len = getLength(TRACK);
  const p = Math.max(0, Math.min(1, progress));
  const at = (t: number) => getPointAtLength(TRACK, len * t) ?? {x: 0, y: 0};
  const car = at(p);
  const tan = getTangentAtLength(TRACK, len * p) ?? {x: 1, y: 0};
  const ang = (Math.atan2(tan.y, tan.x) * 180) / Math.PI;
  return (
    <svg viewBox="0 0 1000 620" width={width} style={{borderRadius: 36, boxShadow: '0 30px 70px rgba(0,0,0,0.5)'}}>
      <defs>
        <pattern id="grass" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="80" height="80" fill="#3f9b4f" /><rect width="40" height="80" fill="#48a85a" />
        </pattern>
        <pattern id="checker" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="#fff" /><rect width="8" height="8" fill="#111" /><rect x="8" y="8" width="8" height="8" fill="#111" />
        </pattern>
        <linearGradient id="asphalt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a4046" /><stop offset="1" stopColor="#2a2f34" /></linearGradient>
        <filter id="carShadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="5" floodOpacity="0.5" /></filter>
      </defs>
      <rect width="1000" height="620" fill="url(#grass)" />
      {/* tribuna */}
      <rect x="260" y="572" width="400" height="38" rx="6" fill="#d9dee3" />
      {Array.from({length: 20}, (_, i) => <rect key={i} x={266 + i * 19.5} y="578" width="15" height="26" rx="3" fill={[C.blue, C.red, C.yellow, C.teal][i % 4]} />)}
      {/* árboles */}
      {TREES.map(([x, y], i) => (
        <g key={i}><circle cx={x + 4} cy={y + 6} r="26" fill="rgba(0,0,0,0.18)" /><circle cx={x} cy={y} r="26" fill="#2e7d3c" /><circle cx={x - 7} cy={y - 7} r="12" fill="#3f9a4e" /></g>
      ))}
      {/* logo pintado en el césped interior */}
      <image href={staticFile('img/logo-blanco.png')} x="200" y="255" width="270" opacity="0.55" />
      {/* capas del circuito */}
      <path d={TRACK} fill="none" stroke="#d8cfb6" strokeWidth="150" strokeLinejoin="round" />
      <path d={TRACK} fill="none" stroke="#fff" strokeWidth="104" strokeDasharray="24 24" strokeLinejoin="round" />
      <path d={TRACK} fill="none" stroke={C.red} strokeWidth="104" strokeDasharray="24 24" strokeDashoffset="24" strokeLinejoin="round" />
      <path d={TRACK} fill="none" stroke="#f4f4f4" strokeWidth="90" strokeLinejoin="round" />
      <path d={TRACK} fill="none" stroke="url(#asphalt)" strokeWidth="82" strokeLinejoin="round" />
      <path d={TRACK} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="30" strokeLinejoin="round" />
      {/* estela de progreso */}
      <path d={TRACK} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" opacity="0.85" strokeDasharray={`${len * p} ${len}`} />
      {/* meta */}
      <rect x="196" y="479" width="24" height="82" fill="url(#checker)" />
      {[0, 1, 2].map((i) => <rect key={i} x={240 + i * 46} y={i % 2 ? 496 : 532} width="30" height="4" fill="#fff" />)}
      {/* puntos de control (sedes) */}
      {stops.map((st, i) => {
        const pt = at(st);
        const on = p >= st;
        const pulse = on ? 1 + Math.sin((frame - i * 10) / 4) * 0.08 : 1;
        const lx = pt.x > 700 ? -1 : 1;
        return (
          <g key={i} transform={`translate(${pt.x} ${pt.y - 70})`}>
            <path d="M0 52 L-14 26 A28 28 0 1 1 14 26 Z" fill={on ? color : '#fff'} stroke={C.navy} strokeWidth="5" transform={`scale(${pulse})`} />
            <text y="12" textAnchor="middle" fontFamily="'Volkswagen Serial', Montserrat, sans-serif" fontWeight="800" fontSize="30" fill={on ? '#fff' : C.navy}>{i + 1}</text>
            {labels[i] && (
              <g opacity={on ? 1 : 0.0}>
                <rect x={lx > 0 ? 34 : -34 - labels[i].length * 15} y="-20" width={labels[i].length * 15} height="38" rx="19" fill={C.navy} />
                <text x={lx > 0 ? 34 + (labels[i].length * 15) / 2 : -34 - (labels[i].length * 15) / 2} y="8" textAnchor="middle" fontFamily="'Volkswagen Serial', Montserrat, sans-serif" fontWeight="800" fontSize="24" fill="#fff">{labels[i]}</text>
              </g>
            )}
          </g>
        );
      })}
      {/* carro MiRed (vista superior) */}
      <g transform={`translate(${car.x} ${car.y}) rotate(${ang})`} filter="url(#carShadow)">
        <image href={staticFile('img/carro-top.png')} x="-66" y="-29" width="132" height="58" />
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

/** Piloto Calidoso en su carro F1 (personaje institucional), animado por capas:
 *  carro con motor encendido (vibración + rebote), cabeza que se mueve, pulgar que saluda y humo de llantas. */
const W0 = 990, H0 = 622;
export const PilotCar: React.FC<{width?: number; rev?: number; smoke?: boolean; wave?: boolean}> = ({width = 700, rev = 1, smoke = true, wave = true}) => {
  const frame = useCurrentFrame();
  const dx = Math.sin(frame * 2.1) * 1.4 * rev;
  const dy = Math.sin(frame * 3.3) * 1.2 * rev - Math.abs(Math.sin(frame / 6)) * 5 * rev;
  const roll = Math.sin(frame / 11) * 1.2;
  const head = Math.sin(frame / 9) * 5;
  const arm = wave ? Math.sin(frame / 5) * 12 : 0;
  const layer = (src: string, rot = 0, ox = 0, oy = 0): React.ReactNode => (
    <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', transform: `rotate(${rot}deg)`, transformOrigin: `${(ox / W0) * 100}% ${(oy / H0) * 100}%`}} />
  );
  const puffs = smoke ? Array.from({length: 10}, (_, i) => {
    const life = (frame + i * 7) % 70;
    const side = i % 2 ? 1 : -1;
    const x = side > 0 ? 0.93 : 0.07;
    const sz = 40 + life * 4;
    return <div key={i} style={{position: 'absolute', left: `calc(${x * 100}% + ${side * life * 3}px - ${sz / 2}px)`, top: `calc(48% - ${life * 1.6}px - ${sz / 2}px)`, width: sz, height: sz, borderRadius: '50%', background: 'rgba(235,240,245,0.9)', opacity: 0.55 * (1 - life / 70), filter: 'blur(10px)'}} />;
  }) : null;
  return (
    <div style={{position: 'relative', width, height: (width * H0) / W0, transform: `translate(${dx}px, ${dy}px) rotate(${roll}deg)`}}>
      {puffs}
      <div style={{position: 'absolute', left: '6%', right: '6%', bottom: -12, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', filter: 'blur(12px)'}} />
      <div style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 18px 22px rgba(0,0,0,0.35))'}}>
        {layer('img/piloto-base.png')}
        {layer('img/piloto-brazo.png', arm, 395, 235)}
        {layer('img/piloto-cabeza.png', head, 465, 195)}
      </div>
    </div>
  );
};
