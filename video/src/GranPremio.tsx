import React from 'react';
import {AbsoluteFill} from 'remotion';
import {TransitionSeries, linearTiming, springTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {SceneAward, SceneIntro, ScenePits, SceneOutro, SceneTrack} from './scenes';
import {Captions} from './Captions';

const T = 15; // transition length (frames)
const SCENES = [100, 115, 115, 90, 90];
export const TOTAL_FRAMES = SCENES.reduce((a, b) => a + b, 0) - T * (SCENES.length - 1); // 450 = 15 s @ 30 fps

export const GranPremio: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0A2E4A'}}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={SCENES[0]}><SceneIntro /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({direction: 'from-left'})} timing={linearTiming({durationInFrames: T})} />
      <TransitionSeries.Sequence durationInFrames={SCENES[1]}><ScenePits /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={springTiming({durationInFrames: T, config: {damping: 200}})} />
      <TransitionSeries.Sequence durationInFrames={SCENES[2]}><SceneTrack /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({direction: 'from-top-right'})} timing={linearTiming({durationInFrames: T})} />
      <TransitionSeries.Sequence durationInFrames={SCENES[3]}><SceneAward /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: T})} />
      <TransitionSeries.Sequence durationInFrames={SCENES[4]}><SceneOutro /></TransitionSeries.Sequence>
    </TransitionSeries>
    <Captions />
  </AbsoluteFill>
);
