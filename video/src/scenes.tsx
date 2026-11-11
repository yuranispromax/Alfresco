import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {C, bodyFont, fontFamily} from './theme';
import {Checker, ClipBg, KineticTitle, Logo, Tag} from './components';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 1 · F1 start lights + title. */
export const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const lightsOut = frame >= 38;
  return (
    <AbsoluteFill>
      <ClipBg index={0} zoom={[1.25, 1.05]} pan={[20, -20]} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 230, gap: 70}}>
        <div style={{display: 'flex', gap: 26, background: '#111', padding: '24px 34px', borderRadius: 30, boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}}>
          {Array.from({length: 5}, (_, i) => {
            const on = !lightsOut && frame >= 4 + i * 6;
            return <div key={i} style={{width: 92, height: 92, borderRadius: '50%', background: lightsOut ? C.green : on ? C.red : '#333', boxShadow: on ? `0 0 40px ${C.red}` : lightsOut ? `0 0 40px ${C.green}` : 'none'}} />;
          })}
        </div>
        {lightsOut && (
          <>
            <Tag bg={C.teal}>Semana de la Calidad 2026</Tag>
            <KineticTitle text="Gran Premio de la Calidad" size={150} highlight={['Calidad']} delay={40} />
          </>
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'flex-end'}}><Checker size={36} speed={-8} /></AbsoluteFill>
    </AbsoluteFill>
  );
};

const PITS = [
  {img: 'img/pit1.png', title: 'Seguridad del Paciente', color: C.yellow},
  {img: 'img/pit2.png', title: 'Auditoría Médica', color: C.teal},
  {img: 'img/pit3.png', title: 'SIAU · Team Radio', color: C.red},
  {img: 'img/pit4.png', title: 'Gestión de Calidad', color: C.green},
];

/** 2 · Four pit stops pop in. */
export const ScenePits: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill>
      <ClipBg index={1} zoom={[1.05, 1.2]} pan={[-25, 25]} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 170}}>
        <KineticTitle text="4 Pit Stops" size={140} highlight={['4']} />
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 70}}>
          {PITS.map((p, i) => {
            const s = spring({frame: frame - 12 - i * 9, fps, config: {damping: 11, stiffness: 140}});
            return (
              <div key={p.img} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, transform: `scale(${s}) rotate(${(1 - s) * (i % 2 ? 25 : -25)}deg)`, opacity: s}}>
                <Img src={staticFile(p.img)} style={{width: 380, height: 380, borderRadius: '50%', border: `10px solid ${p.color}`, boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 3 · Track map with camera move + central quote. */
export const SceneTrack: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const carX = interpolate(frame, [0, durationInFrames], [-700, 1300], clamp);
  return (
    <AbsoluteFill style={{backgroundColor: C.navy}}>
      <ClipBg index={2} zoom={[1.1, 1.0]} pan={[0, 0]} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 200}}>
        <div style={{width: 940, height: 640, borderRadius: 36, overflow: 'hidden', border: `8px solid ${C.white}`, boxShadow: '0 30px 70px rgba(0,0,0,0.55)'}}>
          <Img src={staticFile('img/pista.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.6 - 0.45 * t}) translate(${80 - 160 * t}px, ${40 - 60 * t}px)`}} />
        </div>
        <div style={{marginTop: 80}}>
          <KineticTitle text="La calidad no se corre:" size={88} stagger={3} delay={6} />
          <KineticTitle text="se construye vuelta a vuelta" size={88} stagger={3} delay={24} highlight={['vuelta']} />
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', bottom: 330, left: carX, width: 380, height: 260, borderRadius: 30, overflow: 'hidden', transform: 'rotate(-6deg)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'}}>
        <Img src={staticFile('img/carro.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
    </AbsoluteFill>
  );
};

/** 4 · Trophy + medal + Licencia Calidosa. */
export const SceneAward: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s1 = spring({frame: frame - 4, fps, config: {damping: 12}});
  const s2 = spring({frame: frame - 14, fps, config: {damping: 12}});
  const float = Math.sin(frame / 8) * 10;
  return (
    <AbsoluteFill>
      <ClipBg index={3} zoom={[1.15, 1.3]} pan={[30, -10]} />
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, rgba(255,194,14,${0.35 * s1}) 0%, transparent 55%)`}} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 180}}>
        <Tag bg={C.yellow} delay={2}><span style={{color: C.navy}}>Reconocimiento final</span></Tag>
        <div style={{position: 'relative', width: 1080, height: 980, marginTop: 30}}>
          <Img src={staticFile('img/trofeo.png')} style={{position: 'absolute', left: 120, top: 20 + float, width: 560, borderRadius: 30, transform: `scale(${s1}) rotate(${-4 * s1}deg)`, boxShadow: '0 30px 70px rgba(0,0,0,0.5)'}} />
          <Img src={staticFile('img/medalla.jpg')} style={{position: 'absolute', right: 90, top: 330 - float, width: 400, borderRadius: 30, transform: `scale(${s2}) rotate(${6 * s2}deg)`, boxShadow: '0 30px 70px rgba(0,0,0,0.5)'}} />
        </div>
        <KineticTitle text="Licencia Calidosa 2026" size={104} highlight={['Calidosa']} delay={18} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 5 · Checkered-flag close with logo. */
export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const wave = (i: number) => Math.sin(frame / 5 + i / 2) * 14;
  const logo = spring({frame: frame - 26, fps, config: {damping: 14}});
  return (
    <AbsoluteFill style={{background: `linear-gradient(160deg, ${C.blue} 0%, ${C.navy} 70%)`}}>
      <ClipBg index={0} zoom={[1.0, 1.1]} pan={[0, 0]} />
      <AbsoluteFill style={{backgroundColor: 'rgba(10,46,74,0.55)'}} />
      <AbsoluteFill style={{top: 120, height: 260}}>
        {Array.from({length: 4}, (_, r) => (
          <div key={r} style={{transform: `translateY(${wave(r)}px)`}}><Checker size={30} rows={2} speed={r % 2 ? 6 : -6} /></div>
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 50, paddingTop: 220}}>
        <KineticTitle text="La meta se alcanza en equipo" size={116} highlight={['equipo']} stagger={3} />
        <div style={{fontFamily: bodyFont, fontWeight: 600, fontSize: 44, color: C.white, opacity: interpolate(frame, [14, 26], [0, 1], clamp), textAlign: 'center', padding: '0 90px', lineHeight: 1.3}}>
          Avanzar juntos, de forma segura y haciendo las cosas bien.
        </div>
        <div style={{transform: `scale(${logo})`, marginTop: 40}}><Logo width={460} /></div>
      </AbsoluteFill>
      <div style={{position: 'absolute', bottom: 90, width: '100%', textAlign: 'center', fontFamily, fontWeight: 700, fontStyle: 'italic', fontSize: 34, letterSpacing: 6, color: C.yellow, opacity: logo}}>
        GESTIÓN DE LA CALIDAD
      </div>
    </AbsoluteFill>
  );
};
