export interface Game {
  state: 'ready' | 'running' | 'pausing' | 'over';
  chapter: [number, number];
  chapterMap: {
    width: number;
    height: number;
    array: Array<number>;
  };
  mario: Mario;
  time: number;
}

export interface Mario {
  velocityX: number;
  velocityY: number;
  accelerationX: number;
  accelerationY: number;
  x: number;
  y: number;
  moveState: 'rushing' | 'still' | 'attacking' | 'squatting' | 'jumping';
  orientation: 'forward' | 'backward';
  getVelocity: (
    acceleration: number,
    period: number,
    originVelocity: number
  ) => number;
  getMotion: (velocity: number, period: number, origin: number) => number;
}

export function initMap(width: number, height: number): ChapterMap {
  let array = new Array(width * height);
  array.fill(0);
  array.splice(height * width * 0.1 + height * 0.8, 1, 1);
  return {
    width,
    height,
    array,
  };
}
export interface ChapterMap {
  width: number;
  height: number;
  array: Array<number>;
}
export function getVelocity(
  acceleration: number,
  period: number,
  originVelocity: number
) {
  return originVelocity + acceleration * period;
}
export function getMotion(velocity: number, period: number, origin: number) {
  return origin + velocity * period;
}

export function initGame(): Game {
  return {
    state: 'ready',
    chapter: [1, 1],
    chapterMap: initMap(100, 1000),
    mario: initMario(),
    time: 0,
  };
}
export function initMario(): Mario {
  return {
    velocityX: 0,
    velocityY: 0,
    accelerationX: 0,
    accelerationY: 0,
    x: 0,
    y: 0,
    moveState: 'still',
    orientation: 'forward',
    getVelocity: (
      acceleration: number,
      period: number,
      originVelocity: number
    ) => getVelocity(acceleration, period, originVelocity),
    getMotion: (velocity: number, period: number, origin: number) =>
      getMotion(velocity, period, origin),
  };
}
