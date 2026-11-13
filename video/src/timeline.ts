import tl from './timeline.json';

export type Line = {text: string; file: string; frames: number; from: number};
export type SceneT = {scene: string; start: number; duration: number; lines: Line[]};
export const TL = tl as {fps: number; transition: number; total: number; lights: number[]; lightsOut: number; cuts: number[]; scenes: SceneT[]};
export const scene = (id: string) => TL.scenes.find((s) => s.scene === id)!;
