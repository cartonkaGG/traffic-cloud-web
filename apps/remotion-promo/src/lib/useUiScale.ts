import { useVideoConfig } from 'remotion';

/** Base composition width all panel mocks were designed for. */
export const BASE_WIDTH = 1280;

export function useUiScale(): number {
  const { width } = useVideoConfig();
  return width / BASE_WIDTH;
}
