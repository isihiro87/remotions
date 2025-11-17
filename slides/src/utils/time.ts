export const toFrames = (seconds: number, fps: number) =>
  Math.round(seconds * fps);

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

