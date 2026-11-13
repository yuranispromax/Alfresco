import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile} from 'remotion';
import {TransitionSeries, linearTiming, springTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {STOPS, SceneCierre, SceneEvento, ScenePHVA, SceneFrase, SceneIntro, SceneObjetivo} from './scenes';
import {Captions} from './Captions';
import {TL, scene} from './timeline';
import {C} from './theme';
import {Medal, PilotCar, Track, Trophy} from './art';

export const TOTAL_FRAMES = TL.total;
const T = TL.transition;
const d = (id: string) => scene(id).duration;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const voiceEnd = Math.max(...TL.scenes.flatMap((s) => s.lines.map((l) => s.start + l.from + l.frames)));

export const GranPremio: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.navy}}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={d('intro')}><SceneIntro /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({direction: 'from-left'})} timing={linearTiming({durationInFrames: T})} />
      <TransitionSeries.Sequence durationInFrames={d('objetivo')}><SceneObjetivo /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={springTiming({durationInFrames: T, config: {damping: 200}})} />
      <TransitionSeries.Sequence durationInFrames={d('evento1')}>
        <SceneEvento id="evento1" lap="Vuelta 1 · Recorrido" weekday="LUNES" day="30" month="NOV" title="Recorrido por sedes"
          place={[]} stops={['Paso Palmas', 'Paso Galán', 'Camino Ciudadela']} time="8:30 a. m. – 1:00 p. m." color={C.teal} art={(p) => <Track progress={p} stops={STOPS} color={C.teal} width={1000} labels={['Paso Palmas', 'Paso Galán', 'Camino Ciudadela']} />} wide clip={2} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={springTiming({durationInFrames: T, config: {damping: 200}})} />
      <TransitionSeries.Sequence durationInFrames={d('evento2')}>
        <SceneEvento id="evento2" lap="Vuelta 2 · Pit Lane" weekday="MIÉRCOLES" day="2" month="DIC" title="Pit Lane: experiencias exitosas"
          place={['Auditorio Rómulo Rodado', 'Sede CUD Adelita de Char']} time="8:30 a. m. – 1:00 p. m." color={C.yellow} art={() => <PilotCar width={560} />} clip={3} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={springTiming({durationInFrames: T, config: {damping: 200}})} />
      <TransitionSeries.Sequence durationInFrames={d('evento3')}>
        <SceneEvento id="evento3" lap="Gran final" weekday="JUEVES" day="3" month="DIC" title="La Gran Carrera de la Calidad"
          place={['Auditorio Rómulo Rodado y Lobby', 'CUD Adelita de Char']} time="8:00 a. m. – 4:30 p. m." color={C.red} art={() => <div style={{display: 'flex', alignItems: 'flex-end'}}><Trophy width={330} /><div style={{marginLeft: -40}}><Medal width={210} /></div></div>} clip={4} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({direction: 'from-left'})} timing={linearTiming({durationInFrames: T})} />
      <TransitionSeries.Sequence durationInFrames={d('phva')}><ScenePHVA /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: T})} />
      <TransitionSeries.Sequence durationInFrames={d('frase')}><SceneFrase /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({direction: 'from-top-right'})} timing={linearTiming({durationInFrames: T})} />
      <TransitionSeries.Sequence durationInFrames={d('cierre')}><SceneCierre /></TransitionSeries.Sequence>
    </TransitionSeries>
    <Captions />
    {/* Voice-over (scripts/make-voice.mjs) placed on the absolute timeline. */}
    {TL.scenes.flatMap((s) => s.lines.map((l) => (
      <Sequence key={l.file} from={s.start + l.from} durationInFrames={l.frames + 5} layout="none">
        <Audio src={staticFile(l.file)} volume={1} />
      </Sequence>
    )))}
    {/* Original music (scripts/make-music.py), ducked under the voice. */}
    <Audio
      src={staticFile('audio/musica.wav')}
      volume={(f) => interpolate(f, [0, 6, voiceEnd, voiceEnd + 10, TOTAL_FRAMES - 15, TOTAL_FRAMES], [0, 0.3, 0.3, 0.75, 0.75, 0], clamp)}
    />
  </AbsoluteFill>
);
