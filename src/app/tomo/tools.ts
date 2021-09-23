import {
  CircleBufferGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from 'three';

export enum OperationMode {
  select = 'select',
  draw = 'draw',
}

export enum ZoneLine {
  start = 'start',
  end = 'end',
  body = 'body',
}
export enum ZoneBox {
  left = 'left',
  right = 'right',
  top = 'top',
  bottom = 'bottom',
  body = 'body',
}
export type Zone = ZoneLine | ZoneBox;
export enum ToolType {
  line = 'line',
  box = 'box',
}
// export class ToolEntity {
//   type: ToolType;
//   isSelected: boolean;
//   hotZone: (p: Vector3) => Zone;
// }

export class MeasureLine {
  constructor(private start: Vector3, private end: Vector3) {}
  startPoint = new Mesh(
    new CircleBufferGeometry(10),
    new MeshBasicMaterial({ side: DoubleSide, color: new Color('red') })
  ).position.set(this.start.x, this.start.y, this.start.z);
  endPoint = new Mesh(
    new CircleBufferGeometry(10),
    new MeshBasicMaterial({ side: DoubleSide, color: new Color('red') })
  );
  linePoint = new Mesh(
    new CircleBufferGeometry(10),
    new MeshBasicMaterial({ side: DoubleSide, color: new Color('red') })
  );
}

export function inCircle(point: Vector3, position: Vector3, radius: number) {
  return point.distanceTo(position) < radius;
}
