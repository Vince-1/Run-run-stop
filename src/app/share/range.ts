export class RangeW {
  readonly start: number = 0;
  readonly end: number = 1;
  constructor(_start: number = 0, _end: number = 1) {
    this.start = _start;
    this.end = _end;
    if (_start > _end) {
      throw Error(`${_start}>${_end}?`);
      // alert(`${_start}>${_end}?`);
      this.start = this.end;
    }
  }
}
