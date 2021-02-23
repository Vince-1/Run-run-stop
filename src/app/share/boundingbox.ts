import { Vector2 } from 'three';

export interface Rectangle {
  left: number;
  right: number;
  top: number;
  bottom: number;
}
export interface BoundingBox2 extends Rectangle {
  center: Vector2;
  size: Vector2;
  rotation: number; // in radians
}

export interface LineW {
  start: number;
  end: number;
}

export function intersect1D(a: LineW, b: LineW) {
  const one = a.end < a.start ? { start: a.end, end: a.start } : a;
  const two = b.end < b.start ? { start: b.end, end: b.start } : b;
  return !(one.start > two.end || one.end < two.start);
}

export function intersect2D(a: Rectangle, b: Rectangle) {
  const verticalA = { start: a.left, end: a.right };
  const verticalB = { start: b.left, end: b.right };
  const horizontalA = { start: a.top, end: a.bottom };
  const horizontalB = { start: b.top, end: b.bottom };
  return (
    intersect1D(verticalA, verticalB) && intersect1D(horizontalA, horizontalB)
  );
}
