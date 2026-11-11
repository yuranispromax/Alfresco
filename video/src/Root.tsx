import {Composition} from 'remotion';
import {GranPremio, TOTAL_FRAMES} from './GranPremio';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="GranPremio"
    component={GranPremio}
    durationInFrames={TOTAL_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
);
