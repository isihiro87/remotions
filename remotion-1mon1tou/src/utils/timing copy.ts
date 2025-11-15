export const secondsToFrames = (seconds: number, fps: number): number =>
  Math.max(1, Math.round(seconds * fps));

export const framesToSeconds = (frames: number, fps: number): number =>
  Number((frames / fps).toFixed(2));


