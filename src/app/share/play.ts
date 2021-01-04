export enum PlaySampleTime {
  fast = 20,
  normal = 42,
  slow = 80,
}
export enum PlayMode {
  fromCurrentForward = 'from current forward',
  fromCurrentBackward = 'from current backward',
  fromBeginning = 'from beginning',
  fromEnd = 'from end',
  stop = 'stop',
}

export class PlayOptions {
  sample_time: number = 42;
  play_mode: PlayMode = PlayMode.fromBeginning;
  constructor({ mode = PlayMode.fromBeginning, sampleTime = 42 }) {
    this.sample_time = sampleTime;
    this.play_mode = mode;
  }
  setSampleTime(t: number) {
    this.sample_time = t;
    return new PlayOptions({ mode: this.play_mode, sampleTime: t });
  }
  fast() {
    return this.setSampleTime(PlaySampleTime.fast);
  }
  slow() {
    return this.setSampleTime(PlaySampleTime.slow);
  }
  normal() {
    return this.setSampleTime(PlaySampleTime.normal);
  }
}
