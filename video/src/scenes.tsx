import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {C, bodyFont, fontFamily} from './theme';
import {Checker, ClipBg, KineticTitle, Logo, Tag} from './components';
import {TL, scene} from './timeline';
import {PilotCar} from './art';
import {Img, staticFile} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useSpring = (delay: number, damping = 13) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, stiffness: 150}});
};

/** 1 · F1 start lights synced to the voice, then title. */
export const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const out = frame >= TL.lightsOut;
  return (
    <AbsoluteFill>
      <ClipBg index={0} zoom={[1.25, 1.05]} pan={[20, -20]} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 200, gap: 60}}>
        <div style={{display: 'flex', gap: 26, background: '#111', padding: '24px 34px', borderRadius: 30, boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}}>
          {TL.lights.map((at, i) => {
            const on = !out && frame >= at;
            return <div key={i} style={{width: 92, height: 92, borderRadius: '50%', background: out ? C.green : on ? C.red : '#333', boxShadow: on ? `0 0 40px ${C.red}` : out ? `0 0 40px ${C.green}` : 'none'}} />;
          })}
        </div>
        {!out && <KineticTitle text="¡Enciendan motores!" size={110} highlight={['motores!']} delay={8} />}
        {!out && <div style={{marginTop: 120, transform: `translateY(${interpolate(frame, [0, 18], [600, 0], clamp)}px)`}}><PilotCar width={860} rev={2.2} /></div>}
        {out && (
          <>
            <Tag bg={C.teal}>Día Mundial de la Calidad</Tag>
            <KineticTitle text="Gran Premio de la Calidad" size={150} highlight={['Calidad']} delay={TL.lightsOut + 2} />
            <Tag bg={C.red} delay={TL.lightsOut + 22}>Semana de la Calidad 2026</Tag>
          </>
        )}
      </AbsoluteFill>
      {out && (() => {
        const k = interpolate(frame, [TL.lightsOut, TL.lightsOut + 40], [0.35, 1], {...clamp, easing: Easing.out(Easing.cubic)});
        return (
          <div style={{position: 'absolute', bottom: 250, left: '50%', transform: `translateX(-50%) scale(${k})`, transformOrigin: '50% 100%', opacity: Math.min(1, k * 3)}}>
            <PilotCar width={760} rev={1.4} />
          </div>
        );
      })()}
      <AbsoluteFill style={{justifyContent: 'flex-end'}}><Checker size={36} speed={-8} /></AbsoluteFill>
    </AbsoluteFill>
  );
};

const PILLARS = [
  ['Seguridad del paciente', C.red], ['Gestión de riesgos', C.yellow], ['Medición', C.teal], ['Análisis de problemas', C.blue],
  ['Mejora continua', C.green], ['Experiencia del usuario', C.red], ['Trabajo colaborativo', C.yellow],
] as const;

/** 2 · Objective: the 7 pillars appear in sync with the narration. */
export const SceneObjetivo: React.FC = () => {
  const line = scene('objetivo').lines[0];
  const step = (line.frames * 0.82) / PILLARS.length;
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <ClipBg index={1} zoom={[1.05, 1.2]} pan={[-25, 25]} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 150}}>
        <Tag bg={C.teal}>Objetivo</Tag>
        <div style={{marginTop: 30}}><KineticTitle text="Cultura de calidad" size={120} highlight={['calidad']} delay={4} /></div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 22, marginTop: 60, width: 860}}>
          {PILLARS.map(([label, color], i) => {
            const at = line.from + 10 + i * step;
            const s = spring({frame: frame - at, fps: 30, config: {damping: 14}});
            return (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 26, background: 'rgba(255,255,255,0.95)', borderRadius: 22,
                padding: '18px 30px', transform: `translateX(${(1 - s) * (i % 2 ? 900 : -900)}px)`, opacity: s,
                boxShadow: '0 14px 30px rgba(0,0,0,0.3)', borderLeft: `16px solid ${color}`,
              }}>
                <div style={{fontFamily, fontWeight: 800, fontStyle: 'italic', fontSize: 46, color}}>{String(i + 1).padStart(2, '0')}</div>
                <div style={{fontFamily: bodyFont, fontWeight: 800, fontSize: 48, color: C.navy}}>{label}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const STOPS = [0.2, 0.55, 0.85];

type EventProps = {
  id: string; lap: string; weekday: string; day: string; month: string; title: string;
  place: string[]; time: string; color: string; art: (progress: number) => React.ReactNode; stops?: string[]; clip: number;
};

/** 3-5 · One event of the week ("vuelta"). */
export const SceneEvento: React.FC<EventProps> = ({id, lap, weekday, day, month, title, place, time, color, art, stops, clip}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const line = scene(id).lines[0];
  const date = useSpring(6, 11);
  const card = useSpring(16);
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const progress = interpolate(frame, [line.from + 10, line.from + line.frames * 0.8], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <ClipBg index={clip} zoom={[1.08, 1.25]} pan={[-20, 20]} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 130}}>
        <Tag bg={color}><span style={{color: color === C.yellow ? C.navy : C.white}}>{lap}</span></Tag>
        <div style={{display: 'flex', alignItems: 'center', gap: 36, marginTop: 40, transform: `scale(${date})`}}>
          <div style={{background: C.white, borderRadius: 34, width: 300, overflow: 'hidden', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.45)'}}>
            <div style={{background: color, color: color === C.yellow ? C.navy : C.white, fontFamily: bodyFont, fontWeight: 800, fontSize: 40, padding: '12px 0', letterSpacing: 4}}>{month}</div>
            <div style={{fontFamily, fontWeight: 800, fontStyle: 'italic', fontSize: 190, lineHeight: 1.05, color: C.navy}}>{day}</div>
            <div style={{fontFamily: bodyFont, fontWeight: 800, fontSize: 34, color: C.navy, paddingBottom: 16, letterSpacing: 3}}>{weekday}</div>
          </div>
          <div style={{width: 560, height: 440, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1.05 - 0.05 * t})`}}>
            {art(progress)}
          </div>
        </div>
        <div style={{marginTop: 50}}><KineticTitle text={title} size={96} delay={12} stagger={3} highlight={['Calidad', 'Pit', 'Lane', 'sedes']} /></div>
        <div style={{
          marginTop: 40, width: 900, background: 'rgba(255,255,255,0.96)', borderRadius: 30, padding: '30px 40px',
          transform: `translateY(${(1 - card) * 200}px)`, opacity: card, boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          fontFamily: bodyFont, color: C.navy,
        }}>
          {stops ? (
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative'}}>
              <div style={{position: 'absolute', top: 30, left: 60, right: 60, height: 8, borderRadius: 4, background: '#d6dde3'}}>
                <div style={{height: '100%', borderRadius: 4, background: color, width: `${Math.min(100, Math.max(0, (progress - STOPS[0]) / (STOPS[STOPS.length - 1] - STOPS[0])) * 100)}%`}} />
              </div>
              {stops.map((s, i) => {
                const on = progress >= STOPS[i];
                return (
                  <div key={s} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 260, zIndex: 1}}>
                    <div style={{width: 68, height: 68, borderRadius: '50%', background: on ? color : '#d6dde3', color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily, fontWeight: 800, fontSize: 36, transform: `scale(${on ? 1.1 : 0.9})`}}>{i + 1}</div>
                    <div style={{fontWeight: 800, fontSize: 38, textAlign: 'center', marginTop: 12, lineHeight: 1.1}}>{s}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            place.map((p, i) => <div key={p} style={{fontWeight: i ? 600 : 800, fontSize: i ? 38 : 46, lineHeight: 1.25}}>{p}</div>)
          )}
          <div style={{marginTop: 22, display: 'inline-block', background: C.navy, color: C.white, borderRadius: 999, padding: '10px 28px', fontWeight: 800, fontSize: 42}}>{time}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 6 · Quote, each sentence synced to its voice line. */
export const SceneFrase: React.FC = () => {
  const [a, b] = scene('frase').lines;
  return (
    <AbsoluteFill>
      <ClipBg index={2} zoom={[1.1, 1.0]} pan={[0, 0]} />
      <AbsoluteFill style={{backgroundColor: 'rgba(10,46,74,0.45)'}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 70}}>
        <div style={{fontFamily, fontWeight: 800, fontSize: 260, color: C.yellow, lineHeight: 0.5, height: 110}}>“</div>
        <KineticTitle text="La meta no es llegar primero." size={104} delay={a.from} stagger={3} highlight={['primero.']} />
        <KineticTitle text="Es avanzar juntos, de forma segura y haciendo las cosas bien." size={84} delay={b.from} stagger={3} highlight={['juntos,', 'segura', 'bien.']} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const DATES = [['30', 'NOV', 'Recorrido por sedes'], ['2', 'DIC', 'Pit Lane'], ['3', 'DIC', 'Gran Carrera']];

/** 7 · Close: checkered flag, invitation, dates, logo. */
export const SceneCierre: React.FC = () => {
  const frame = useCurrentFrame();
  const wave = (i: number) => Math.sin(frame / 5 + i / 2) * 14;
  const logo = useSpring(30, 14);
  return (
    <AbsoluteFill style={{background: `linear-gradient(160deg, ${C.blue} 0%, ${C.navy} 70%)`}}>
      <ClipBg index={0} zoom={[1.0, 1.1]} pan={[0, 0]} />
      <AbsoluteFill style={{backgroundColor: 'rgba(10,46,74,0.55)'}} />
      <AbsoluteFill style={{top: 90, height: 260}}>
        {Array.from({length: 4}, (_, r) => (
          <div key={r} style={{transform: `translateY(${wave(r)}px)`}}><Checker size={30} rows={2} speed={r % 2 ? 6 : -6} /></div>
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 46, paddingTop: 260}}>
        <KineticTitle text="¡Te esperamos en la pista!" size={120} highlight={['pista!']} stagger={3} />
        <div style={{display: 'flex', gap: 24}}>
          {DATES.map(([d, m, l], i) => {
            const s = spring({frame: frame - 14 - i * 6, fps: 30, config: {damping: 12}});
            return (
              <div key={d + m} style={{width: 290, background: C.white, borderRadius: 26, textAlign: 'center', padding: '16px 10px', transform: `scale(${s})`, boxShadow: '0 16px 40px rgba(0,0,0,0.4)'}}>
                <div style={{fontFamily, fontWeight: 800, fontStyle: 'italic', fontSize: 96, color: C.navy, lineHeight: 1}}>{d}</div>
                <div style={{fontFamily: bodyFont, fontWeight: 800, fontSize: 34, color: C.red, letterSpacing: 3}}>{m}</div>
                <div style={{fontFamily: bodyFont, fontWeight: 500, fontSize: 28, color: C.navy, marginTop: 6}}>{l}</div>
              </div>
            );
          })}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 30, transform: `scale(${logo})`, marginTop: 10}}>
          <PilotCar width={480} smoke={false} />
          <div style={{display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center'}}>
            <Logo width={400} />
            <div style={{background: '#fff', borderRadius: 20, padding: '12px 22px'}}><Img src={staticFile('img/supersalud.png')} style={{width: 300, display: 'block'}} /></div>
          </div>
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', bottom: 70, width: '100%', textAlign: 'center', fontFamily, fontWeight: 800, fontStyle: 'italic', fontSize: 34, letterSpacing: 6, color: C.yellow, opacity: logo}}>
        GESTIÓN DE LA CALIDAD
      </div>
    </AbsoluteFill>
  );
};

const CICLO = [['P', 'Planear', C.blue], ['H', 'Hacer', C.green], ['V', 'Verificar · Estudiar', C.yellow], ['A', 'Actuar', C.red]] as const;

/** 6 · Los errores son parte del proceso: ciclo PHVA con el piloto. */
export const ScenePHVA: React.FC = () => {
  const frame = useCurrentFrame();
  const [a, b] = scene('phva').lines;
  const step = (b.frames * 0.85) / CICLO.length;
  const car = useSpring(4, 14);
  return (
    <AbsoluteFill>
      <ClipBg index={5} zoom={[1.1, 1.25]} pan={[10, -10]} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 140}}>
        <Tag bg={C.green}>Ciclo PHVA</Tag>
        <div style={{marginTop: 30}}><KineticTitle text="Las oportunidades de mejora son parte del proceso" size={84} delay={a.from} stagger={3} highlight={['mejora', 'proceso']} /></div>
        <div style={{position: 'relative', width: 960, height: 960, marginTop: 10}}>
          <svg viewBox="0 0 960 960" width={960} height={960} style={{position: 'absolute', inset: 0, transform: `rotate(${frame * 0.6}deg)`}}>
            <circle cx="480" cy="480" r="400" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="10" strokeDasharray="40 26" />
          </svg>
          {CICLO.map(([letter, label, color], i) => {
            const on = spring({frame: frame - (b.from + i * step), fps: 30, config: {damping: 12}});
            const ang = (-90 + i * 90) * (Math.PI / 180);
            const x = 480 + Math.cos(ang) * 400, y = 480 + Math.sin(ang) * 400;
            return (
              <div key={letter} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${on})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div style={{width: 150, height: 150, borderRadius: '50%', background: color, border: '8px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily, fontWeight: 800, fontStyle: 'italic', fontSize: 92, color: color === C.yellow ? C.navy : '#fff', boxShadow: '0 14px 30px rgba(0,0,0,0.4)'}}>{letter}</div>
                <div style={{marginTop: 8, background: '#fff', color: C.navy, borderRadius: 999, padding: '6px 20px', fontFamily: bodyFont, fontWeight: 800, fontSize: 34, whiteSpace: 'nowrap'}}>{label}</div>
              </div>
            );
          })}
          <div style={{position: 'absolute', left: '50%', top: '52%', transform: `translate(-50%, -50%) scale(${0.4 + 0.6 * car})`}}>
            <PilotCar width={560} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
