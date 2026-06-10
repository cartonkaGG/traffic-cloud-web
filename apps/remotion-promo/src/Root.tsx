import { Composition } from 'remotion';
import { TrafficCloudPromo } from './TrafficCloudPromo';

export const RemotionRoot = () => {
  return (
    <Composition
      id="TrafficCloudPromo"
      component={TrafficCloudPromo}
      durationInFrames={720}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
