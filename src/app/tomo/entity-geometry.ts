import { Iso } from 'monocle-ts';
import { v4 as uuid } from 'uuid';
import {
  BoxGeometry,
  BufferGeometry,
  CircleBufferGeometry,
  Color,
  DoubleSide,
  Matrix3,
  Mesh,
  MeshBasicMaterial,
  Vector2,
  Vector3,
} from 'three';

import * as Three from 'three';
import * as Rx from 'rxjs';
import * as Ro from 'rxjs/operators';
import * as L from 'lodash';

enum BaseModelName {
  box = 'box',
  circle = 'circle',
  line = 'line',
}

enum BoxType {
  centerSize = 'center-size',
  lrtb = 'left-right-top-bottom',
  diagonal = 'diagonal',
}
interface BoxName {
  name: BaseModelName.box;
}
interface BoxCenterSize extends BoxName {
  boxType: BoxType.centerSize;
  center: Vector2;
  size: Vector2;
}
interface BoxLRTB extends BoxName {
  boxType: BoxType.lrtb;
  left: number;
  right: number;
  top: number;
  bottom: number;
}
interface BoxDiagonal extends BoxName {
  boxType: BoxType.diagonal;
  leftTop: Vector2;
  rightBottom: Vector2;
}
// interface BoxPattern<T> {
//   visitBoxCenterSize(b: BoxCenterSize): T;
//   visitBoxLRTB(b: BoxLRTB): T;
//   visitBoxDiagonal(b: BoxDiagonal): T;
// }

// interface Box {
//   name: BaseModelName.box;
//   accept<R>(pattern: BoxPattern<R>): R;
// }

type Box = BoxCenterSize | BoxDiagonal | BoxLRTB;

export function updateClassMaker<T extends { constructor: Function }>(
  cons: (x: T) => T,
  source: T,
  update: Partial<T>
) {
  return cons({ ...source, ...update });
}

export function updateClass<T extends { constructor: Function }>(
  cons: (x: T) => T
) {
  return (source: T, update: Partial<T>) =>
    updateClassMaker(cons, source, update);
}

// export function setOption<T extends Entity2d>(c: { new (...args: any[]): T }) {
//   const update = updateClass<T>(
//     (x) =>
//       new c(
//         x.base,
//         x.id,
//         x.index,
//         x.modelMatrix,
//         x.hovering,
//         x.editing,
//         x.drawing
//       )
//   );
//   return update;
// }
// type Box = (BoxCenterSize | BoxLRTB) & { name: BaseModelName.box };

const cs2lrtb = (centerSize: BoxCenterSize): BoxLRTB => ({
  name: BaseModelName.box,
  boxType: BoxType.lrtb,
  left: centerSize.center.x - centerSize.size.x * 0.5,
  right: centerSize.center.x + centerSize.size.x * 0.5,
  top: centerSize.center.y - centerSize.size.y * 0.5,
  bottom: centerSize.center.y + centerSize.size.y * 0.5,
});

const lrtb2cs = (lrtb: BoxLRTB): BoxCenterSize => ({
  name: BaseModelName.box,
  boxType: BoxType.centerSize,
  center: new Vector2(
    lrtb.left * 0.5 + lrtb.right * 0.5,
    lrtb.top * 0.5 + lrtb.bottom * 0.5
  ),
  size: new Vector2(lrtb.right - lrtb.left, lrtb.bottom - lrtb.top),
});

const lrtb2diagonal = (lrtb: BoxLRTB): BoxDiagonal => ({
  name: BaseModelName.box,
  boxType: BoxType.diagonal,
  leftTop: new Vector2(lrtb.left, lrtb.top),
  rightBottom: new Vector2(lrtb.right, lrtb.bottom),
});

const diagonal2lrtb = (diagonal: BoxDiagonal): BoxLRTB => ({
  name: BaseModelName.box,
  boxType: BoxType.lrtb,
  left: diagonal.leftTop.x,
  right: diagonal.rightBottom.x,
  top: diagonal.leftTop.y,
  bottom: diagonal.rightBottom.y,
});

const cs2lrtbIso = new Iso(cs2lrtb, lrtb2cs);
const lrtb2diagonalIso = new Iso(lrtb2diagonal, diagonal2lrtb);
const cs2diagnonalIso = cs2lrtbIso.compose(lrtb2diagonalIso);

const boxOptics = {
  cs2lrtbIso,
  lrtb2diagonalIso,
  cs2diagnonalIso,
};

interface Circle {
  name: BaseModelName.circle;
  center: Vector2;
  radiusRange: { start: number; end: number };
  radiansRange: { start: number; end: number };
}

interface Line {
  name: BaseModelName.line;
  start: Vector2;
  end: Vector2;
  width: number;
}

// type BaseModel = (Box | Circle | Line) & { modelMatrix: Matrix3 };
type BaseModel = Box | Circle | Line;

function toLRTB(b: Box): BoxLRTB {
  switch (b.boxType) {
    case BoxType.centerSize:
      return boxOptics.cs2lrtbIso.get(b);
    case BoxType.lrtb:
      return b;
    case BoxType.diagonal:
      return boxOptics.lrtb2diagonalIso.reverseGet(b);
  }
}

function toCenterSize(b: Box): BoxCenterSize {
  switch (b.boxType) {
    case BoxType.centerSize:
      return b;
    case BoxType.lrtb:
      return boxOptics.cs2lrtbIso.from(b);
    case BoxType.diagonal:
      return boxOptics.cs2diagnonalIso.from(b);
  }
}

// function BoxPatternLRTB() {
//           const visitiBoxCenterSize = (b: BoxCenterSize) =>{
//             return b;
//           }
//           const visitiBoxLRTB = (b: BoxLRTB) => {
//             return b;
//           }
//           const visitiBoxDiagonal = (b: BoxDiagonal) => {
//             return b;
//           }
//           const pattern:BoxPattern<BoxCenterSize> = {visitiBoxCenterSize,visitiBoxLRTB,visitiBoxDiagonal};
//           return {name:BaseModelName.box,accept:() };
//         }

export function in2PI(radians: number) {
  const m = -Math.floor(radians / (Math.PI * 2));
  return radians + m * Math.PI * 2;
}

function isOn(m: BaseModel) {
  switch (m.name) {
    case 'circle':
      return (p: Vector2) => {
        //         const radians = p.angle();

        const radians = m.center.clone().multiplyScalar(-1).add(p).angle();

        const radiansRangeStart = in2PI(m.radiansRange.start);
        const radiansRangeEnd = in2PI(m.radiansRange.end);

        const inRadianRange =
          radiansRangeStart < radiansRangeEnd
            ? radians >= radiansRangeStart && radians < radiansRangeEnd
            : (radians <= radiansRangeEnd && radians >= 0) ||
              (radians >= radiansRangeStart && radians < Math.PI * 2);

        const inRadius =
          p.distanceTo(m.center) < m.radiusRange.end &&
          p.distanceTo(m.center) >= m.radiusRange.start;

        //         console.log(p.distanceTo(m.center) >= m.radiusRange.start);
        //         console.log(p.distanceTo(m.center) < m.radiusRange.end);

        //         console.log(
        //           'in radians: ',
        //           radians > m.radiansRange.start && radians <= m.radiansRange.end
        //         );
        //         console.log(radians > m.radiansRange.start);
        //         console.log(radians <= m.radiansRange.end);

        //         console.log((radians / Math.PI) * 180);
        //         console.log((m.radiansRange.start / Math.PI) * 180);
        //         console.log((m.radiansRange.end / Math.PI) * 180);

        return inRadianRange && inRadius;
      };
    case 'line':
      return (p: Vector2) => {
        const normal = m.end.clone().add(m.start.clone().multiplyScalar(-1));
        // const xAxis = new Vector2(1,0);

        const angle = normal.angle();
        const centre = m.start.clone().add(m.end.clone()).multiplyScalar(0.5);

        const trans = new Matrix3().translate(-centre.x, -centre.y);
        const transInverse = trans.clone().invert();
        const rotation = new Matrix3().rotate(angle);

        const affine = transInverse.clone().multiply(rotation).multiply(trans);

        const start_r = m.start.clone().applyMatrix3(affine);
        const end_r = m.end.clone().applyMatrix3(affine);

        const p_r = p.clone().applyMatrix3(affine);

        const left = Math.min(start_r.x, end_r.x) - m.width;
        const right = Math.max(start_r.x, end_r.x) + m.width;
        const top = Math.min(start_r.y, end_r.y) - m.width;
        const bottom = Math.max(start_r.y, end_r.y) + m.width;

        return (
          p_r.x >= left && p_r.x <= right && p_r.y >= top && p_r.y <= bottom
        );
      };
    case 'box':
      return (p: Vector2) => {
        //         const keys = Object.keys(m);
        const box = toLRTB(m);

        //         const box: BoxLRTB =
        //           m['center'] === undefined || m['size'] === undefined
        //             ? (m as BoxLRTB)
        //             : cs2lrtbIso.get(m as BoxCenterSize);

        return (
          p.x >= box.left &&
          p.x <= box.right &&
          p.y >= box.top &&
          p.y <= box.bottom
        );
      };
    default:
      return () => false;
  }
}

export function hasNaNOrInfinity(...numbers: number[]) {
  return numbers.reduce(
    (acc: boolean, cur: number) => acc || !isFinite(cur),
    false
  );
}

export function hasNaNOrInfinityWithVector2s(...vs: Vector2[]): boolean {
  const numbers = L.flatten(vs.map((v) => [v.x, v.y]));
  return hasNaNOrInfinity(...numbers);
}
export function hasNaNOrInfinityWithRanges<
  T extends { start: number; end: number }
>(...vs: T[]): boolean {
  const numbers = L.flatten(vs.map((v) => [v.start, v.end]));
  return hasNaNOrInfinity(...numbers);
}

export function hasNaNOrInfinityWithBox(b: Box) {
  switch (b.boxType) {
    case BoxType.centerSize:
      return hasNaNOrInfinityWithVector2s(...[b.center, b.size]);
    case BoxType.diagonal:
      return hasNaNOrInfinityWithVector2s(...[b.leftTop, b.rightBottom]);
    case BoxType.lrtb:
      return hasNaNOrInfinity(...[b.left, b.right, b.top, b.bottom]);
    default:
      return false;
  }
}

export function hasNaNOrInfinityWithBaseModel(m: BaseModel) {
  switch (m.name) {
    case BaseModelName.line:
      return hasNaNOrInfinityWithVector2s(...[m.start, m.end]);
    case BaseModelName.circle:
      return (
        hasNaNOrInfinityWithVector2s(m.center) ||
        hasNaNOrInfinityWithRanges(...[m.radiansRange, m.radiusRange])
      );
    case BaseModelName.box:
      return hasNaNOrInfinityWithBox(m);
    default:
      return false;
  }
}

export function toGeometry(m: BaseModel) {
  if (hasNaNOrInfinityWithBaseModel(m)) {
    return new BufferGeometry();
  }
  switch (m.name) {
    case BaseModelName.line:
      return new BufferGeometry().setFromPoints([
        new Vector3(m.start.x, m.start.y),
        new Vector3(m.end.x, m.end.y),
      ]);
    case BaseModelName.circle: {
      const g = new CircleBufferGeometry(
        m.radiusRange.end,
        10,
        m.radiansRange.start,
        m.radiansRange.end - m.radiansRange.start
      );
      g.translate(m.center.x, m.center.y, 0);
      return g;
    }
    case BaseModelName.box: {
      const box = toCenterSize(m);
      const g = new BoxGeometry(box.size.x, box.size.y);
      g.translate(box.center.x, box.center.y, 0);
      return g;
    }
    default:
      return new BufferGeometry();
  }
}

export function toMesh(m: BaseModel) {
  const geometry = toGeometry(m);
  const material = new MeshBasicMaterial({
    color: new Color('red'),
    side: DoubleSide,
  });
  switch (m.name) {
    case 'line':
      return new Three.Line(geometry, material);
    case 'circle':
    case 'box':
      return new Mesh(geometry, material);
  }
}

function outerHalfRoundRadiansRange(p1: Vector2, p2: Vector2) {
  const vector = p1.clone().multiplyScalar(-1).add(p2);
  const angle = vector.angle();
  return { start: angle + Math.PI * 0.5, end: angle + Math.PI * 1.5 };
}

enum Zones {
  move = 'move',
  scale = 'scale',
  rotate = 'rotate',
  none = 'none',
}
export enum EntityModelName {
  measureline = 'measureline',
  angle = 'angle',
  cobeAngle = 'cobe-angle',
  roi = 'roi',
}
export enum RoiType {
  rectangle = 'rectangle',
  elipse = 'elipse',
}

interface MeasurelineBase {
  name: EntityModelName.measureline;
  point1: Vector2;
  point2: Vector2;
}
interface AngleBase {
  name: EntityModelName.angle;
  point1: Vector2;
  point2: Vector2;
  point3: Vector2;
}
interface CobeAngleBase {
  name: EntityModelName.cobeAngle;
  point1: Vector2;
  point2: Vector2;
  point3: Vector2;
  point4: Vector2;
}
interface RoiBase {
  name: EntityModelName.roi;
  roiType: RoiType;
  point1: Vector2; // box diagonal model
  point2: Vector2;
  radiansRange: { start: number; end: number };
}

type EntityModelBase = MeasurelineBase | AngleBase | CobeAngleBase | RoiBase;
type DrawingState = 'complete' | number;

type OptionsFlags<T> = {
  [key: string]: T;
};
export abstract class Entity2d {
  circleRadius = 10;
  lineWidth = 5;
  readonly name: EntityModelName;
  constructor(
    public readonly base: EntityModelBase,
    public readonly id: string,
    public readonly index = 0,
    public readonly modelMatrix = new Matrix3(),
    public readonly hovering = false,
    public readonly editing = false,
    public readonly drawing: DrawingState = 0
  ) {}
  abstract gravityPoint(): Vector2;
  abstract hotZone(p: Vector2): Zones | string;
  abstract clone(): Entity2d;
  abstract setOptions(u: Partial<Entity2d>): Entity2d;

  abstract baseModel(): OptionsFlags<BaseModel>;
  abstract otherZones(): string[];
  abstract editOnOtherZoneOnMove(hotZone: string, drag: Drag): Entity2d;

  abstract drawingStates(): DrawingState[]; // ['complete', ...number[]];
  abstract drawOnDown(drag: Drag): Entity2d;
  abstract drawOnMove(drag: Drag): Entity2d;
  abstract drawOnUp(drag: Drag): {
    entity: Entity2d;
    hitCancel?: boolean;
  };

  moveOnMove(drag: Drag): Entity2d {
    const delta = drag.last.clone().multiplyScalar(-1).add(drag.current);
    const trans = new Matrix3().translate(delta.x, delta.y);
    return this.setOptions({
      modelMatrix: trans.clone().multiply(this.modelMatrix.clone()),
    });
  }
  rotateOnMove(drag: Drag): Entity2d {
    const rotationPoint = this.gravityPoint()
      .clone()
      .applyMatrix3(this.modelMatrix.clone());
    const current_beam = drag.current
      .clone()
      .add(rotationPoint.clone().multiplyScalar(-1));
    const last_beam = drag.last
      .clone()
      .add(rotationPoint.clone().multiplyScalar(-1));
    const delta_angle = last_beam.angle() - current_beam.angle(); // clockwise

    const rotation = new Matrix3().rotate(delta_angle);
    const translation = new Matrix3().translate(
      -rotationPoint.x,
      -rotationPoint.y
    );
    const transInverse = translation.clone().invert();
    const affine = transInverse
      .clone()
      .multiply(rotation)
      .multiply(translation);
    const modelMatrix = affine.clone().multiply(this.modelMatrix.clone());

    //     console.log((delta_angle / Math.PI) * 180);
    //     console.log((last_beam.angle() / Math.PI) * 180);
    //     console.log((current_beam.angle() / Math.PI) * 180);

    //     console.log(rotationPoint);
    //     printMatrix3(rotation);
    //     printMatrix3(affine);
    //     printMatrix3(modelMatrix);

    return this.setOptions({
      modelMatrix,
    });
  }
  isOn(p: Vector2) {
    return !(this.hotZone(p) === Zones.none);
  }
  getP(p: Vector2): Circle {
    return {
      name: BaseModelName.circle,
      center: p,
      radiusRange: { start: 0, end: this.circleRadius },
      radiansRange: {
        start: 0,
        end: 2 * Math.PI,
      },
    };
  }
  getP_r(p1: Vector2, p2: Vector2): Circle {
    return {
      name: BaseModelName.circle,
      center: p1,
      radiusRange: { start: this.circleRadius, end: this.circleRadius * 2 },
      radiansRange: outerHalfRoundRadiansRange(p1, p2),
    };
  }
  getLine(p1: Vector2, p2: Vector2): Line {
    return {
      name: BaseModelName.line,
      start: p1,
      end: p2,
      width: this.lineWidth,
    };
  }
}

class Measureline extends Entity2d {
  readonly name = EntityModelName.measureline;
  constructor(
    public base: MeasurelineBase,
    id: string,
    index = 0,
    modelMatrix = new Matrix3(),
    hovering = false,
    editing = false,
    drawing: DrawingState = 0 // 0,complete
  ) {
    super(base, id, index, modelMatrix, hovering, editing, drawing);
  }
  gravityPoint(): Vector2 {
    return this.base.point1.clone().add(this.base.point2).multiplyScalar(0.5);
  }
  clone(): Measureline {
    return new Measureline(
      this.base,
      this.id,
      this.index,
      this.modelMatrix,
      this.hovering,
      this.editing,
      this.drawing
    );
  }
  setOptions(u: Partial<Measureline>) {
    const update = updateClass<Measureline>(
      (x) =>
        new Measureline(
          x.base,
          x.id,
          x.index,
          x.modelMatrix,
          x.hovering,
          x.editing,
          x.drawing
        )
    );
    return update(this, u);
  }
  baseModel() {
    const p1: Circle = this.getP(this.base.point1);
    const p1_r: Circle = this.getP_r(this.base.point1, this.base.point2);
    const p2: Circle = this.getP(this.base.point2);
    const p2_r: Circle = this.getP_r(this.base.point2, this.base.point1);
    const l12: Line = this.getLine(this.base.point1, this.base.point2);
    return { p1, p2, p1_r, p2_r, l12 };
  }

  hotZone(p: Vector2) {
    const baseModels = this.baseModel();

    const position = p.clone().applyMatrix3(this.modelMatrix.clone().invert());

    switch (true) {
      case isOn(baseModels.p1)(position):
        return 'point1';
      case isOn(baseModels.p2)(position):
        return 'point2';
      case isOn(baseModels.p1_r)(position):
      case isOn(baseModels.p2_r)(position):
        return Zones.rotate;
      case isOn(baseModels.l12)(position):
        return Zones.move;
      default:
        return Zones.none;
    }
  }
  otherZones() {
    return ['point1', 'point2'];
  }
  editOnOtherZoneOnMove(hotZone: string, drag: Drag) {
    const current = drag.current
      .clone()
      .applyMatrix3(this.modelMatrix.clone().invert());
    switch (hotZone) {
      case 'point1': {
        const base = {
          ...this.base,
          point1: current,
        };
        return this.setOptions({ base });
      }
      case 'point2': {
        const base = {
          ...this.base,
          point2: current,
        };
        return this.setOptions({ base });
      }
      default:
        return this.clone();
    }
  }
  drawingStates(): DrawingState[] {
    return ['complete', 0];
  }
  drawOnDown(drag: Drag) {
    switch (this.drawing) {
      case 0:
      case 'complete':
      default:
        return this.clone();
    }
  }
  drawOnMove(drag: Drag) {
    switch (this.drawing) {
      case 0: {
        const current = drag.current
          .clone()
          .applyMatrix3(this.modelMatrix.clone().invert());
        const base = { ...this.base, point2: current };
        return this.setOptions({ base });
      }
      case 'complete':
      default:
        return this.clone();
    }
  }
  drawOnUp(drag: Drag) {
    switch (this.drawing) {
      case 0:
        const hotZone = this.hotZone(drag.current);
        return {
          entity: this.setOptions({ drawing: 'complete' }),
          hitCancel: hotZone === 'point1',
        };
      case 'complete':
      default:
        return { entity: this.clone() };
    }
  }
}

class Angle extends Entity2d {
  readonly name = EntityModelName.angle;
  readonly sectorRadius = 50;
  constructor(
    public base: AngleBase,
    id: string,
    index = 0,
    modelMatrix = new Matrix3(),
    hovering = false,
    editing = false,
    drawing: DrawingState = 0
  ) {
    super(base, id, index, modelMatrix, hovering, editing, drawing);
  }
  gravityPoint() {
    return this.base.point2.clone();
  }

  clone() {
    return new Angle(
      this.base,
      this.id,
      this.index,
      this.modelMatrix,
      this.hovering,
      this.editing,
      this.drawing
    );
  }
  setOptions(u: Partial<Angle>) {
    //     const update1 = setOption(Angle);
    const update = updateClass<Angle>(
      (x) =>
        new Angle(
          x.base,
          x.id,
          x.index,
          x.modelMatrix,
          x.hovering,
          x.editing,
          x.drawing
        )
    );
    return update(this, u);
  }
  getRadiansRange() {
    const l21 = this.base.point2
      .clone()
      .multiplyScalar(-1)
      .add(this.base.point1)
      .angle();
    const l23 = this.base.point2
      .clone()
      .multiplyScalar(-1)
      .add(this.base.point3)
      .angle();
    return l21 > l23 ? { start: l23, end: l21 } : { start: l21, end: l23 };
  }

  baseModel() {
    const p1: Circle = this.getP(this.base.point1);
    const p2: Circle = this.getP(this.base.point2);
    const p3: Circle = this.getP(this.base.point3);
    const p1_r: Circle = this.getP_r(this.base.point1, this.base.point2);
    const p2_r: Circle = {
      name: BaseModelName.circle,
      center: this.base.point2,
      radiusRange: { start: this.circleRadius, end: this.circleRadius * 2 },
      radiansRange: {
        start: outerHalfRoundRadiansRange(this.base.point2, this.base.point1)
          .start,
        end: outerHalfRoundRadiansRange(this.base.point2, this.base.point3).end,
      },
    };
    const p3_r: Circle = this.getP_r(this.base.point3, this.base.point2);
    const l12: Line = this.getLine(this.base.point2, this.base.point1);
    const l23: Line = this.getLine(this.base.point2, this.base.point3);

    const sector: Circle = {
      name: BaseModelName.circle,
      center: this.base.point2,
      radiusRange: { start: 0, end: this.sectorRadius },
      radiansRange: this.getRadiansRange(),
    };
    return { p1, p2, p3, p1_r, p2_r, p3_r, l12, l23, sector };
  }

  hotZone(p: Vector2) {
    const baseModels = this.baseModel();
    const position = p.clone().applyMatrix3(this.modelMatrix.clone().invert());
    switch (true) {
      case isOn(baseModels.p1)(position):
        return 'point1';
      case isOn(baseModels.p2)(position):
        return 'point2';
      case isOn(baseModels.p3)(position):
        return 'point3';
      case isOn(baseModels.p1_r)(position):
      case isOn(baseModels.p2_r)(position):
      case isOn(baseModels.p3_r)(position):
        return Zones.rotate;
      case isOn(baseModels.l12)(position):
      case isOn(baseModels.l23)(position):
      case isOn(baseModels.sector)(position):
        return Zones.move;
      default:
        return Zones.none;
    }
  }
  otherZones() {
    return ['point1', 'point2', 'point3'];
  }
  editOnOtherZoneOnMove(hotZone: string, drag: Drag) {
    const current = drag.current
      .clone()
      .applyMatrix3(this.modelMatrix.clone().invert());
    switch (hotZone) {
      case 'point1': {
        const base = {
          ...this.base,
          point1: current,
        };
        return this.setOptions({ base });
      }
      case 'point2': {
        const base = {
          ...this.base,
          point2: current,
        };
        return this.setOptions({ base });
      }
      case 'point3': {
        const base = {
          ...this.base,
          point3: current,
        };
        return this.setOptions({ base });
      }
      default:
        return this.clone();
    }
  }
  drawingStates(): DrawingState[] {
    return ['complete', 0, 1];
  }
  drawOnDown(drag: Drag) {
    switch (this.drawing) {
      case 0:
      case 1:
      case 'complete':
      default:
        return this.clone();
    }
  }
  drawOnMove(drag: Drag) {
    const current = drag.current.clone().applyMatrix3(this.modelMatrix.clone());
    switch (this.drawing) {
      case 0: {
        const base = { ...this.base, point2: current };
        return this.setOptions({ base });
      }
      case 1: {
        const base = { ...this.base, point3: current };
        return this.setOptions({ base });
      }
      case 'complete':
      default:
        return this.clone();
    }
  }
  drawOnUp(drag: Drag) {
    const hotZone = this.hotZone(drag.current);
    switch (this.drawing) {
      case 0:
        return {
          entity: this.setOptions({ drawing: 1 }),
          hitCancel: hotZone === 'point1',
        };
      case 1:
        return {
          entity: this.setOptions({ drawing: 'complete' }),
          hitCancel: hotZone === 'point2',
        };
      case 'complete':
      default:
        return { entity: this.clone() };
    }
  }
}

class CobeAngle extends Entity2d {
  readonly name = EntityModelName.cobeAngle;
  constructor(
    public base: CobeAngleBase,
    id: string,
    index = 0,
    modelMatrix = new Matrix3(),
    hovering = false,
    editing = false,
    drawing: DrawingState = 0
  ) {
    super(base, id, index, modelMatrix, hovering, editing, drawing);
  }
  gravityPoint() {
    return this.base.point1
      .clone()
      .add(this.base.point2)
      .add(this.base.point3)
      .add(this.base.point4)
      .multiplyScalar(0.25);
  }
  clone() {
    return new CobeAngle(
      this.base,
      this.id,
      this.index,
      this.modelMatrix,
      this.hovering,
      this.editing,
      this.drawing
    );
  }
  setOptions(u: Partial<CobeAngle>) {
    const update = updateClass<CobeAngle>(
      (x) =>
        new CobeAngle(
          x.base,
          x.id,
          x.index,
          x.modelMatrix,
          x.hovering,
          x.editing,
          x.drawing
        )
    );
    return update(this, u);
  }
  baseModel() {
    const p1: Circle = this.getP(this.base.point1);
    const p2: Circle = this.getP(this.base.point2);
    const p3: Circle = this.getP(this.base.point3);
    const p4: Circle = this.getP(this.base.point4);

    const p1_r: Circle = this.getP_r(this.base.point1, this.base.point2);
    const p2_r: Circle = this.getP_r(this.base.point2, this.base.point1);
    const p3_r: Circle = this.getP_r(this.base.point3, this.base.point4);
    const p4_r: Circle = this.getP_r(this.base.point4, this.base.point3);

    const l12: Line = this.getLine(this.base.point1, this.base.point2);
    const l34: Line = this.getLine(this.base.point3, this.base.point4);
    const lineMid: Line = this.getLine(
      this.base.point1.clone().add(this.base.point2).multiplyScalar(0.5),
      this.base.point3.clone().add(this.base.point4).multiplyScalar(0.5)
    );

    return {
      p1,
      p2,
      p3,
      p4,
      p1_r,
      p2_r,
      p3_r,
      p4_r,
      l12,
      l34,
      lineMid,
    };
  }
  hotZone(p: Vector2) {
    const baseModels = this.baseModel();
    const position = p.clone().applyMatrix3(this.modelMatrix.clone().invert());
    switch (true) {
      case isOn(baseModels.p1)(position):
        return 'point1';
      case isOn(baseModels.p2)(position):
        return 'point2';
      case isOn(baseModels.p3)(position):
        return 'point3';
      case isOn(baseModels.p4)(position):
        return 'point4';
      case isOn(baseModels.l12)(position):
        return 'line12';
      case isOn(baseModels.l34)(position):
        return 'line34';
      case isOn(baseModels.p1_r)(position):
      case isOn(baseModels.p2_r)(position):
      case isOn(baseModels.p3_r)(position):
      case isOn(baseModels.p4_r)(position):
        return Zones.rotate;
      case isOn(baseModels.lineMid)(position):
        return Zones.move;
      default:
        return Zones.none;
    }
  }

  otherZones() {
    return ['point1', 'point2', 'point3', 'point4', 'line12', 'line34'];
  }
  editOnOtherZoneOnMove(hotZone: string, drag: Drag) {
    const current = drag.current
      .clone()
      .applyMatrix3(this.modelMatrix.clone().invert());
    const last = drag.last
      .clone()
      .applyMatrix3(this.modelMatrix.clone().invert());
    const delta = last.clone().multiplyScalar(-1).add(current.clone());

    switch (hotZone) {
      case 'point1': {
        const base = { ...this.base, point1: current };
        return this.setOptions({ base });
      }
      case 'point2': {
        const base = { ...this.base, point2: current };
        return this.setOptions({ base });
      }
      case 'point3': {
        const base = { ...this.base, point3: current };
        return this.setOptions({ base });
      }
      case 'point4': {
        const base = { ...this.base, point4: current };
        return this.setOptions({ base });
      }
      case 'line12': {
        const base = {
          ...this.base,
          point1: this.base.point1.clone().add(delta),
          point2: this.base.point2.clone().add(delta),
        };
        return this.setOptions({ base });
      }
      case 'line34': {
        const base = {
          ...this.base,
          point3: this.base.point3.clone().add(delta),
          point4: this.base.point4.clone().add(delta),
        };
        return this.setOptions({ base });
      }
      default:
        return this.clone();
    }
  }
  drawingStates(): DrawingState[] {
    return ['complete', 0, 1, 2];
  }
  drawOnDown(drag: Drag) {
    const current = drag.current
      .clone()
      .applyMatrix3(this.modelMatrix.clone().invert());
    switch (this.drawing) {
      case 0:
      case 1: {
        const base = { ...this.base, point3: current, point4: current };
        return this.setOptions({ base, drawing: 2 });
      }
      case 2:
      case 'complete':
      default:
        return this.clone();
    }
  }
  drawOnMove(drag: Drag) {
    const current = drag.current
      .clone()
      .applyMatrix3(this.modelMatrix.clone().invert());
    switch (this.drawing) {
      case 0: {
        const base = { ...this.base, point2: current };
        return this.setOptions({ base });
      }
      case 1:
        return this.clone();
      case 2:
        const base = { ...this.base, point4: current };
        return this.setOptions({ base });
      case 'complete':
      default:
        return this.clone();
    }
  }
  drawOnUp(drag: Drag) {
    const hotZone = this.hotZone(drag.current);
    switch (this.drawing) {
      case 0:
        return {
          entity: this.setOptions({ drawing: 1 }),
          hitCancel: hotZone === 'point1',
        };
      case 1:
        return { entity: this.clone() };
      case 2:
        return {
          entity: this.setOptions({ drawing: 'complete' }),
          hitCancel: hotZone === 'point3',
        };
      case 'complete':
      default:
        return { entity: this.clone() };
    }
  }
}

class Roi extends Entity2d {
  readonly name = EntityModelName.roi;
  constructor(
    public base: RoiBase,
    id: string,
    index = 0,
    modelMatrix = new Matrix3(),
    hovering = false,
    editing = false,
    drawing: DrawingState = 0
  ) {
    super(base, id, index, modelMatrix, hovering, editing, drawing);
  }
  getBox() {
    const [left, right] =
      this.base.point1.x > this.base.point2.x
        ? [this.base.point2.x, this.base.point1.x]
        : [this.base.point1.x, this.base.point2.x];
    const [top, bottom] =
      this.base.point1.y > this.base.point2.y
        ? [this.base.point2.y, this.base.point1.y]
        : [this.base.point1.y, this.base.point2.y];
    const box: BoxLRTB = {
      name: BaseModelName.box,
      boxType: BoxType.lrtb,
      left,
      right,
      top,
      bottom,
    };
    return box;
  }

  gravityPoint() {
    const box = this.getBox();
    return cs2lrtbIso.reverseGet(box).center;
  }
  clone() {
    return new Roi(
      this.base,
      this.id,
      this.index,
      this.modelMatrix,
      this.hovering,
      this.editing,
      this.drawing
    );
  }

  setOptions(u: Partial<Roi>) {
    const update = updateClass<Roi>(
      (x) =>
        new Roi(
          x.base,
          x.id,
          x.index,
          x.modelMatrix,
          x.hovering,
          x.editing,
          x.drawing
        )
    );
    return update(this, u);
  }
  baseModel() {
    const box = this.getBox();

    const lt = new Vector2(box.left, box.top);
    const rb = new Vector2(box.right, box.bottom);
    const lb = new Vector2(box.left, box.bottom);
    const rt = new Vector2(box.right, box.top);

    const p1 = this.getP(lt);
    const p2 = this.getP(rb);
    const p3 = this.getP(lb);
    const p4 = this.getP(rt);

    const p1_r = this.getP_r(lt, rb);
    const p2_r = this.getP_r(rb, lt);
    const p3_r = this.getP_r(lb, rt);
    const p4_r = this.getP_r(rt, lb);

    const l13 = this.getLine(lt, lb);
    const l24 = this.getLine(rb, rt);
    const l14 = this.getLine(lt, rt);
    const l23 = this.getLine(rb, lb);

    return { box, p1, p2, p3, p4, p1_r, p2_r, p3_r, p4_r, l13, l24, l14, l23 };
  }

  hotZone(p: Vector2) {
    const baseModels = this.baseModel();
    const position = p.clone().applyMatrix3(this.modelMatrix.clone().invert());
    switch (true) {
      case isOn(baseModels.p1)(position):
        return 'point1';
      case isOn(baseModels.p2)(position):
        return 'point2';
      case isOn(baseModels.p3)(position):
        return 'point3';
      case isOn(baseModels.p4)(position):
        return 'point4';
      case isOn(baseModels.p1_r)(position):
      case isOn(baseModels.p2_r)(position):
      case isOn(baseModels.p3_r)(position):
      case isOn(baseModels.p4_r)(position):
        return Zones.rotate;
      case isOn(baseModels.l13)(position):
        return 'line13';
      case isOn(baseModels.l24)(position):
        return 'line24';
      case isOn(baseModels.l14)(position):
        return 'line14';
      case isOn(baseModels.l23)(position):
        return 'line23';
      case isOn(baseModels.box)(position):
        return Zones.move;
      default:
        return Zones.none;
    }
  }
  otherZones() {
    return [
      'point1',
      'point2',
      'point3',
      'point4',
      'line13',
      'line24',
      'line14',
      'line23',
    ];
  }

  editOnOtherZoneOnMove(hotZone: string, drag: Drag) {
    const box = this.getBox();
    //     boxOptics.lrtb2diagonalIso.get(box);
    const current = drag.current
      .clone()
      .applyMatrix3(this.modelMatrix.clone().invert());
    switch (hotZone) {
      case 'point1': {
        const point1 = current;
        const point2 = new Vector2(box.right, box.bottom);
        const base = { ...this.base, point1, point2 };
        return this.setOptions({ base });
      }
      case 'point2': {
        const point1 = new Vector2(box.left, box.top);
        const point2 = current;
        const base = { ...this.base, point1, point2 };
        return this.setOptions({ base });
      }
      case 'point3': {
        const point1 = new Vector2(current.x, box.top);
        const point2 = new Vector2(box.right, current.y);

        const base = { ...this.base, point1, point2 };
        return this.setOptions({ base });
      }
      case 'point4': {
        const point1 = new Vector2(box.left, current.y);
        const point2 = new Vector2(current.x, box.bottom);
        const base = { ...this.base, point1, point2 };
        return this.setOptions({ base });
      }
      case 'line13': {
        const point1 = new Vector2(current.x, box.top);
        const base = { ...this.base, point1 };

        return this.setOptions({ base });
      }
      case 'line24': {
        const point2 = new Vector2(current.x, box.bottom);
        const base = { ...this.base, point2 };
        return this.setOptions({ base });
      }
      case 'line14': {
        const point1 = new Vector2(box.left, current.y);
        const base = { ...this.base, point1 };
        return this.setOptions({ base });
      }
      case 'line23': {
        const point2 = new Vector2(box.right, current.y);
        const base = { ...this.base, point2 };

        return this.setOptions({ base });
      }
      default:
        return this.clone();
    }
  }

  drawingStates(): DrawingState[] {
    return ['complete', 0];
  }
  drawOnDown(drag: Drag) {
    switch (this.drawing) {
      case 0:
      case 'complete':
      default:
        return this.clone();
    }
  }
  drawOnMove(drag: Drag) {
    switch (this.drawing) {
      case 0: {
        const current = drag.current
          .clone()
          .applyMatrix3(this.modelMatrix.clone().invert());
        const base = { ...this.base, point2: current };
        return this.setOptions({ base });
      }
      case 'complete':
      default:
        return this.clone();
    }
  }

  drawOnUp(drag: Drag) {
    switch (this.drawing) {
      case 0:
        const hotZone = this.hotZone(drag.current);
        return {
          entity: this.setOptions({ drawing: 'complete' }),
          hitCancel: hotZone === 'point1',
        };
      case 'complete':
      default:
        return { entity: this.clone() };
    }
  }
}
// class Measureline {
//   name = EntityModelName.measureline;
//   constructor(
//     public readonly point1: Vector2,
//     public readonly point2: Vector2,
//     public readonly modelMatrix: Matrix3
//   ) {}
// }

// class Entity2dBase<T extends BaseModelName> {
//   constructor(public geometry: BaseModel) {}
// }

// const a = new Entity2dBase<BaseModelName.box>({
//   name: BaseModelName.box,
//   center: new Vector2(),
//   size: new Vector2(),
//   modelMatrix: new Matrix3(),
// });
type Maybe<T> = null | undefined | { be: true; value: T };
interface Drag {
  tag: string; // 'mousedown' | 'mouosemove' | 'mouseup';
  origin: Vector2;
  last: Vector2;
  current: Vector2;
}

function onMove(
  operationOn: Maybe<Entity2d>,
  hotZone: Zones | string,
  drag: Drag
): {
  operationOn: Maybe<Entity2d>;
  hotZone: Zones | string;
  last: Maybe<Entity2d>;
  cancelOn: Maybe<Entity2d>;
} {
  if (operationOn?.be) {
    switch (hotZone) {
      case Zones.move: {
        return {
          operationOn: {
            be: true,
            value: operationOn.value.moveOnMove(drag),
          },
          hotZone,
          last: undefined,
          cancelOn: undefined,
        };
      }
      case Zones.rotate: {
        return {
          operationOn: {
            be: true,
            value: operationOn.value.rotateOnMove(drag),
          },
          hotZone,
          last: undefined,
          cancelOn: undefined,
        };
      }
      case Zones.scale:
      case Zones.none:
        return {
          operationOn: undefined,
          hotZone: Zones.none,
          last: undefined,
          cancelOn: undefined,
        };
      default: {
        return {
          operationOn: {
            be: true,
            value: operationOn.value.editOnOtherZoneOnMove(hotZone, drag),
          },
          hotZone,
          last: undefined,
          cancelOn: undefined,
        };
      }
    }
  } else {
    return {
      operationOn: undefined,
      hotZone: Zones.none,
      last: undefined,
      cancelOn: undefined,
    };
  }
}

function editEntity2d( // enable plural  extension
  operationOn: Maybe<Entity2d>,
  hotZone: Zones | string,
  mouseOn: Maybe<Entity2d>,
  drag: Drag
): {
  operationOn: Maybe<Entity2d>;
  hotZone: Zones | string;
  last: Maybe<Entity2d>;
  cancelOn: Maybe<Entity2d>;
} {
  switch (true) {
    case drag.tag === 'mousedown' && mouseOn?.be && operationOn?.be:
      return {
        operationOn: {
          be: true,
          value: mouseOn.value.clone().setOptions({ editing: true }),
        },
        hotZone: mouseOn.value.hotZone(drag.current),
        last: {
          be: true,
          value: operationOn.value.setOptions({ editing: false }),
        },
        cancelOn: undefined,
      };
    case drag.tag === 'mousedown' && mouseOn?.be && !operationOn?.be:
      return {
        operationOn: {
          be: true,
          value: mouseOn.value.clone().setOptions({ editing: true }),
        },
        hotZone: mouseOn.value.hotZone(drag.current),
        last: undefined,
        cancelOn: undefined,
      };
    case drag.tag === 'mousedown' && !mouseOn?.be && operationOn?.be:
      return {
        last: {
          be: true,
          value: operationOn.value.setOptions({ editing: false }),
        },
        operationOn: undefined,
        hotZone: Zones.none,
        cancelOn: undefined,
      };
    case drag.tag === 'mousedown' && !mouseOn?.be && !operationOn?.be:
      return {
        operationOn: undefined,
        hotZone: Zones.none,
        last: undefined,
        cancelOn: undefined,
      };
    case drag.tag === 'mousemove' && mouseOn?.be && operationOn?.be:
    case drag.tag === 'mousedmove' && mouseOn?.be && !operationOn?.be:
    case drag.tag === 'mousemove' && !mouseOn?.be && operationOn?.be:
    case drag.tag === 'mousemove' && !mouseOn?.be && !operationOn?.be:
      return onMove(operationOn, hotZone, drag);
    case drag.tag === 'mouseup' && mouseOn?.be && operationOn?.be:
    case drag.tag === 'mouseup' && mouseOn?.be && !operationOn?.be:
    case drag.tag === 'mouseup' && !mouseOn?.be && operationOn?.be:
    case drag.tag === 'mouseup' && !mouseOn?.be && !operationOn?.be:
      return { operationOn, hotZone, last: undefined, cancelOn: undefined };
    default:
      return { operationOn, hotZone, last: undefined, cancelOn: undefined };
  }
}

export interface CreatEntityOptions {
  id: string;
  index: number;
  roiType: RoiType;
  modelMatrix: Matrix3;
  roiRadiansRange: { start: number; end: number };
}

function creatEntity2dFirst(
  type: EntityModelName,
  current: Vector2,
  options: Partial<CreatEntityOptions> = {}
): Entity2d {
  const origin: CreatEntityOptions = {
    id: uuid(),
    index: 0,
    roiType: RoiType.rectangle,
    modelMatrix: new Matrix3(),
    roiRadiansRange: { start: 0, end: 2 * Math.PI },
  };
  const initialOptions = { ...origin, ...options };
  console.log(options, initialOptions);
  const farPoint = new Vector2(Infinity, Infinity);
  switch (type) {
    case EntityModelName.measureline:
      return new Measureline(
        {
          name: EntityModelName.measureline,
          point1: current,
          point2: current,
        },
        initialOptions.id,
        initialOptions.index,
        initialOptions.modelMatrix,
        true,
        true,
        0
      );
    case EntityModelName.angle:
      return new Angle(
        {
          name: EntityModelName.angle,
          point1: current,
          point2: current,
          point3: farPoint,
        },
        initialOptions.id,
        initialOptions.index,
        initialOptions.modelMatrix,
        true,
        true,
        0
      );
    case EntityModelName.cobeAngle:
      return new CobeAngle(
        {
          name: EntityModelName.cobeAngle,
          point1: current,
          point2: current,
          point3: farPoint,
          point4: farPoint,
        },
        initialOptions.id,
        initialOptions.index,
        initialOptions.modelMatrix,
        true,
        true,
        0
      );
    case EntityModelName.roi:
      return new Roi(
        {
          name: EntityModelName.roi,
          roiType: initialOptions.roiType,
          point1: current,
          point2: current,
          radiansRange: initialOptions.roiRadiansRange,
        },
        initialOptions.id,
        initialOptions.index,
        new Matrix3(),
        true,
        true,
        0
      );
  }
}

function drawEntity2d(
  type: EntityModelName,
  operationOn: Maybe<Entity2d>,
  drag: Drag,
  options?: Partial<CreatEntityOptions>
): {
  operationOn: Maybe<Entity2d>;
  hotZone: Zones;
  cancelOn: Maybe<Entity2d>;
  last: Maybe<Entity2d>;
  finished?: boolean;
} {
  switch (true) {
    case drag.tag === 'mousedown' && !operationOn?.be: {
      return {
        operationOn: {
          be: true,
          value: creatEntity2dFirst(type, drag.current, options ? options : {}),
        },
        last: undefined,
        hotZone: Zones.none,
        cancelOn: undefined,
      };
    }

    case drag.tag === 'mousemove' && !operationOn?.be:
    case drag.tag === 'mouseup' && !operationOn?.be:
      return {
        operationOn,
        last: undefined,
        hotZone: Zones.none,
        cancelOn: undefined,
      };
    case drag.tag === 'mousedown' && operationOn?.be: {
      return {
        operationOn: { be: true, value: operationOn.value.drawOnDown(drag) },
        last: undefined,
        hotZone: Zones.none,
        cancelOn: undefined,
      };
    }
    case drag.tag === 'mousemove' && operationOn?.be:
      return {
        operationOn: {
          be: true,
          value: operationOn.value.drawOnMove(drag),
        },
        last: undefined,
        hotZone: Zones.none,
        cancelOn: undefined,
      };
    case drag.tag === 'mouseup' && operationOn?.be: {
      const { entity, hitCancel } = operationOn.value.drawOnUp(drag);
      return {
        operationOn: { be: true, value: entity },
        last: undefined,
        hotZone: Zones.none,
        cancelOn: hitCancel ? { be: true, value: entity } : undefined,
        finished: entity.drawing === 'complete',
      };
    }
    default:
      return {
        operationOn,
        last: undefined,
        hotZone: Zones.none,
        cancelOn: undefined,
      };
  }
}

export enum Mode {
  select = 'select',
  draw = 'draw',
}
export type ModeReal =
  | { mode: Mode.select }
  | {
      mode: Mode.draw;
      name: EntityModelName;
      options?: Partial<CreatEntityOptions>;
    };

export type ModeRealOption =
  | 'select'
  | 'draw measure line'
  | 'draw angle'
  | 'draw cobe angle'
  | 'draw roi rectangle'
  | 'draw roi elipse';

export function optionToModeReal(option: ModeRealOption): ModeReal {
  let modeReal: ModeReal;
  switch (option) {
    case 'select':
      modeReal = { mode: Mode.select };
      break;
    case 'draw measure line':
      modeReal = { mode: Mode.draw, name: EntityModelName.measureline };
      break;
    case 'draw angle':
      modeReal = { mode: Mode.draw, name: EntityModelName.angle };
      break;
    case 'draw cobe angle':
      modeReal = { mode: Mode.draw, name: EntityModelName.cobeAngle };
      break;
    case 'draw roi rectangle':
      modeReal = {
        mode: Mode.draw,
        name: EntityModelName.roi,
        options: { roiType: RoiType.rectangle },
      };
      break;
    case 'draw roi elipse':
      modeReal = {
        mode: Mode.draw,
        name: EntityModelName.roi,
        options: { roiType: RoiType.elipse },
      };
      break;
    default:
      modeReal = { mode: Mode.select };
  }
  return modeReal;
}

export function editEvent$(
  es$: Rx.Observable<Entity2d[]>,
  p$: Rx.Observable<Vector2>,
  d$: Rx.Observable<Drag>, // single drag
  mode$: Rx.Observable<ModeReal>
) {
  const mouseOnE$: Rx.Observable<Maybe<Entity2d>> = Rx.combineLatest(
    es$,
    p$
  ).pipe(
    Ro.map(([es, p]) => {
      const result = es
        .filter((e) => e.isOn(p))
        .sort((a, b) => b.index - a.index);
      return result;
    }),
    Ro.map((es) => (es.length > 0 ? { be: true, value: es[0] } : undefined))
  );

  const editEntity$ = d$.pipe(
    Ro.withLatestFrom(mouseOnE$),
    Ro.scan(
      (
        acc: {
          operationOn: Maybe<Entity2d>;
          hotZone: Zones | string;
          last: Maybe<Entity2d>;
          cancelOn: Maybe<Entity2d>;
        },
        cur: [Drag, Maybe<Entity2d>]
      ) => editEntity2d(acc.operationOn, acc.hotZone, cur[1], cur[0]),
      {
        operationOn: undefined,
        hotZone: Zones.none,
        last: undefined,
        cancelOn: undefined,
      }
    )
  );

  const eventEdit$ = mode$.pipe(
    Ro.switchMap((m) => (m.mode === Mode.select ? editEntity$ : Rx.EMPTY))
  );

  return eventEdit$;
}

export const drawEvent$ = (
  //   name: EntityModelName,
  d$: Rx.Observable<Drag>, // no cancel
  mode$: Rx.Observable<ModeReal>
) => {
  const drawEntityOrigin$ = (
    name: EntityModelName,
    options?: Partial<CreatEntityOptions>
  ) =>
    d$.pipe(
      Ro.scan(
        (
          acc: {
            operationOn: Maybe<Entity2d>;
            hotZone: Zones;
            cancelOn: Maybe<Entity2d>;
            last: Maybe<Entity2d>;
            finished?: boolean;
          },
          cur: Drag
        ) => drawEntity2d(name, acc.operationOn, cur, options),
        {
          operationOn: undefined,
          hotZone: Zones.none,
          last: undefined,
          cancelOn: undefined,
        }
      ),
      Ro.share()
    );

  const drawEntity$ = (
    name: EntityModelName,
    options?: Partial<CreatEntityOptions>
  ) => {
    const origin$ = drawEntityOrigin$(name, options);
    const first = origin$.pipe(Ro.first());
    const cancel = origin$.pipe(
      Ro.filter((result) => result.finished === true)
    );
    return origin$.pipe(
      Ro.windowToggle(first, () => cancel),
      Ro.switchAll()
    );
  };

  //   return drawEntity$;
  const eventDraw$ = mode$.pipe(
    Ro.tap((x) => console.log(x)),
    Ro.switchMap((m) =>
      m.mode === Mode.draw ? drawEntity$(m.name, m.options) : Rx.EMPTY
    )
  );
  return eventDraw$;
};
