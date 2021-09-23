import { cons } from 'fp-ts/lib/ReadonlyNonEmptyArray';
import { Matrix3, Matrix4, Vector2, Vector3 } from 'three';
import { v4 as uuid } from 'uuid';

export interface Drag {
  tag: string; // 'mousedown' | 'mouosemove' | 'mouseup';
  origin: Vector2;
  last: Vector2;
  current: Vector2;
}

export enum EntityType {
  measureLine = 'measureline',
  practor = 'practor',
}

export type Maybe<T> = null | undefined | { be: true; value: T };

export enum Zones {
  body = 'body',
  none = 'none',
  point_1 = 'point_1',
  point_1_r = 'point_1_r',
  point_2 = 'point_2',
  point_2_r = 'point_2_r',
  line_1 = 'line_1',
  line_2 = 'line_2',
  text_1 = 'text_1',
  text_2 = 'text_2',
  angle_1 = 'angle_1',
  centre_of_gravity = 'centre_of_gravity',
  rotation = 'rotation',
  move = 'move',
}

interface Entity2dBase {
  id: string;
  typeName: EntityType;
  modelMatrix: Matrix4;
  editing: boolean;
  drawing: number;
  hovering: boolean;
  hotZone(p: Vector2): Zones;
  isOn(p: Vector2): boolean;
  setOptions(u: Partial<Entity2dBase>): Entity2dBase;
  editEvent(
    operationOn: Maybe<Entity2dBase>,
    hotZone: Zones,
    mouseOn: Maybe<Entity2dBase>,
    drag: Drag
  ): {
    operationOn: Maybe<Entity2dBase>;
    hotZone: Zones;
    last: Maybe<Entity2dBase>;
    cancelOn: Maybe<Entity2dBase>;
  };
}

function onCircle(
  p: Vector2,
  center: Vector2,
  radiusRange: { start: number; end: number },
  radiansRange: { start: number; end: number } = {
    start: 0,
    end: 2 * Math.PI,
  }
) {
  const radians = p.angle();
  return (
    p.distanceTo(center) < radiusRange.end &&
    p.distanceTo(center) >= radiusRange.start &&
    radians > radiansRange.start &&
    radians <= radiansRange.end
  );
}
function onLine(p: Vector2, point_1: Vector2, point_2: Vector2, width: number) {
  const normal = point_2.clone().add(point_1.clone().multiplyScalar(-1));
  // const xAxis = new Vector2(1,0);

  const angle = normal.angle();
  const centre = point_1.clone().add(point_2.clone()).multiplyScalar(0.5);

  const trans = new Matrix3().translate(-centre.x, -centre.y);
  const transInverse = trans.clone().invert();
  const rotation = new Matrix3().rotate(angle);

  const affine = transInverse.clone().multiply(rotation).multiply(trans);

  const point_1_r = point_1.clone().applyMatrix3(affine);
  const point_2_r = point_2.clone().applyMatrix3(affine);

  const p_r = p.clone().applyMatrix3(affine);

  const left = Math.min(point_1_r.x, point_2_r.x) - width;
  const right = Math.max(point_1_r.x, point_2_r.x) + width;
  const top = Math.min(point_1_r.y, point_2_r.y) - width;
  const bottom = Math.max(point_1_r.y, point_2_r.y) + width;

  return p_r.x > left && p_r.x < right && p_r.y > top && p_r.y < bottom;
}

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

export class ToolBase {
  zones: Zones[] = [];
  constructor() {}
}

export interface MeasureLine2dState {
  id: string;
  model: MeasureLine2d;
}
export class MeasureLine2d {
  type = EntityType.measureLine;
  zones = [
    Zones.line_1,
    Zones.point_1,
    Zones.point_2,
    Zones.rotation,
    Zones.text_1,
  ];
  drawingState = [0, 1, 2]; //

  moveSelfZones = [Zones.point_1, Zones.point_2];
  moveBodyZones = [Zones.centre_of_gravity, Zones.line_1];
  rotationBodyZones = [];

  constructor(
    readonly start: Vector2,
    readonly end: Vector2,
    readonly id: string,
    readonly index = 0,
    readonly modelMatrix: Matrix3 = new Matrix3(),
    readonly hovering: boolean = false,
    readonly editing: boolean = false,
    readonly drawing: number = 0
  ) {}
  getRotationPoint() {
    return this.start
      .clone()
      .applyMatrix3(this.modelMatrix)
      .add(this.end.clone().applyMatrix3(this.modelMatrix))
      .multiplyScalar(0.5);
  }
  hotZone(p: Vector2) {
    const centre_of_gravity = this.getRotationPoint();
    const start_r = this.start.clone().applyMatrix3(this.modelMatrix);
    const end_r = this.end.clone().applyMatrix3(this.modelMatrix);

    const onLine1 = onLine(p, start_r, end_r, 10);
    const onPoint_1 = onCircle(p, start_r, { start: 0, end: 10 });
    const onPoint_2 = onCircle(p, end_r, { start: 0, end: 10 });
    const onRotation =
      onCircle(p, centre_of_gravity, {
        start: 10,
        end: 15,
      }) ||
      onCircle(p, start_r, { start: 10, end: 15 }) ||
      onCircle(p, end_r, { start: 10, end: 15 });
    return onPoint_1
      ? Zones.point_1
      : onPoint_2
      ? Zones.point_2
      : onLine1
      ? Zones.line_1
      : onRotation
      ? Zones.rotation
      : Zones.none;
  }
  isOn(p: Vector2) {
    return !(this.hotZone(p) === Zones.none);
  }

  clone() {
    return new MeasureLine2d(
      this.start,
      this.end,
      this.id,
      this.index,
      this.modelMatrix,
      this.hovering,
      this.editing,
      this.drawing
    );
  }
  setOptions(u: Partial<MeasureLine2d>) {
    const update = updateClass<MeasureLine2d>(
      (x) =>
        new MeasureLine2d(
          x.start,
          x.end,
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
}

type EntityModel = MeasureLine2d;

export function editMeasureLine2d( // TODO: editEvent<T>
  operationOn: Maybe<MeasureLine2d>,
  hotZone: Zones,
  mouseOn: Maybe<MeasureLine2d>,
  drag: Drag
): {
  operationOn: Maybe<MeasureLine2d>;
  hotZone: Zones;
  last: Maybe<MeasureLine2d>;
  cancelOn: Maybe<MeasureLine2d>;
} {
  switch (drag.tag) {
    case 'mousedown': {
      if (mouseOn?.be) {
        if (operationOn?.be) {
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
        } else {
          return {
            operationOn: {
              be: true,
              value: mouseOn.value.clone().setOptions({ editing: true }),
            },
            hotZone: mouseOn.value.hotZone(drag.current),
            last: undefined,
            cancelOn: undefined,
          };
        }
      } else {
        if (operationOn?.be) {
          return {
            last: {
              be: true,
              value: operationOn.value.setOptions({ editing: false }),
            },
            operationOn: undefined,
            hotZone: Zones.none,
            cancelOn: undefined,
          };
        } else {
          return {
            operationOn: undefined,
            hotZone: Zones.none,
            last: undefined,
            cancelOn: undefined,
          };
        }
      }
    }
    case 'mousemove': {
      return editMeasureline2dOnMousemove(operationOn, hotZone, drag);
    }
    case 'mouseup': {
      return { operationOn, hotZone, last: undefined, cancelOn: undefined };
    }
  }
}

export function drawMeasuraline2d(
  operationOn: Maybe<MeasureLine2d>,
  hotZone: Zones,
  drag: Drag,
  type: string = 'measuline2d'
): {
  operationOn: Maybe<MeasureLine2d>;
  hotZone: Zones;
  last: Maybe<MeasureLine2d>;
  cancelOn: Maybe<MeasureLine2d>;
  finished?: boolean;
} {
  switch (drag.tag) {
    case 'mousedown':
      if (operationOn?.be) {
        if (operationOn.value.drawing === 0) {
          // would not occurn
          return {
            operationOn: undefined,
            cancelOn: operationOn,
            last: undefined,
            hotZone: Zones.none,
          };
        } else {
          const hotZone = operationOn.value.hotZone(drag.current);
          console.log(hotZone);
          return hotZone === Zones.none
            ? {
                operationOn: {
                  be: true,
                  value: new MeasureLine2d(
                    drag.current,
                    drag.current,
                    uuid(),
                    0,
                    new Matrix3(),
                    false,
                    true,
                    0
                  ),
                },
                last: {
                  be: true,
                  value: operationOn.value
                    .clone()
                    .setOptions({ editing: false }),
                },
                hotZone: Zones.none,
                cancelOn: undefined,
              }
            : {
                operationOn: {
                  be: true,
                  value: operationOn.value
                    .clone()
                    .setOptions({ editing: true }),
                },
                last: undefined,
                hotZone: hotZone,
                cancelOn: undefined,
              };
        }
      } else {
        return {
          operationOn: {
            be: true,
            value: new MeasureLine2d(
              drag.current,
              drag.current,
              uuid(),
              0,
              new Matrix3(),
              false,
              true,
              0
            ),
          },
          last: undefined,
          hotZone: Zones.none,
          cancelOn: undefined,
        };
      }
    case 'mousemove':
      if (operationOn?.be) {
        if (operationOn.value.drawing === 0) {
          return {
            operationOn: {
              be: true,
              value: operationOn.value
                .clone()
                .setOptions({ editing: true, end: drag.current }),
            },
            last: undefined,
            hotZone,
            cancelOn: undefined,
          };
        } else {
          const r = editMeasureline2dOnMousemove(operationOn, hotZone, drag);
          return r;
        }
      } else {
        return {
          operationOn,
          last: undefined,
          hotZone: Zones.none,
          cancelOn: undefined,
        };
      }
    case 'mouseup':
      if (operationOn?.be) {
        if (operationOn.value.drawing === 0) {
          const currentZone = operationOn.value.hotZone(drag.current);
          console.log('xxxxxxxxxxxxxxxxxxx');
          return currentZone === Zones.point_1
            ? {
                operationOn: undefined,
                last: undefined,
                hotZone: Zones.none,
                cancelOn: operationOn,
                finished: true,
              }
            : {
                operationOn: {
                  be: true,
                  value: operationOn.value
                    .clone()
                    .setOptions({ drawing: 1, editing: true }),
                },

                last: undefined,
                hotZone: Zones.none,
                cancelOn: undefined,
                finished: true,
              };
        } else {
          return {
            operationOn: operationOn,
            last: undefined,
            hotZone: Zones.none,
            cancelOn: undefined,
            finished: true,
          };
        }
      } else {
        return {
          operationOn,
          last: undefined,
          hotZone: Zones.none,
          cancelOn: undefined,
          finished: true,
        };
      }
  }
}
function editMeasureline2dOnMousemove(
  operationOn: Maybe<MeasureLine2d>,
  hotZone: Zones,
  drag: Drag
): {
  operationOn: Maybe<MeasureLine2d>;
  hotZone: Zones;
  last: Maybe<MeasureLine2d>;
  cancelOn: Maybe<MeasureLine2d>;
} {
  // operationOn[operationOn.value.zones[0]]
  if (operationOn?.be) {
    switch (hotZone) {
      case Zones.point_1: {
        // edit event: point move
        return {
          operationOn: {
            be: true,
            value: operationOn.value.setOptions({
              start: drag.current
                .clone()
                .applyMatrix3(operationOn.value.modelMatrix.clone().invert()),
            }),
          },
          hotZone,
          last: undefined,
          cancelOn: undefined,
        };
      }
      case Zones.point_2: {
        return {
          operationOn: {
            be: true,
            value: operationOn.value.setOptions({
              end: drag.current
                .clone()
                .applyMatrix3(operationOn.value.modelMatrix.clone().invert()),
            }),
          },
          hotZone,
          last: undefined,
          cancelOn: undefined,
        };
      }
      case Zones.line_1: {
        // edit event: body move
        const delta = drag.last.clone().multiplyScalar(-1).add(drag.current);

        // console.log(delta);
        // console.log(drag);
        const trans = new Matrix3().translate(delta.x, delta.y);

        return {
          operationOn: {
            be: true,
            value: operationOn.value.setOptions({
              modelMatrix: trans
                .clone()
                .multiply(operationOn.value.modelMatrix.clone()),
            }),
          },
          hotZone,
          last: undefined,
          cancelOn: undefined,
        };
      }
      case Zones.rotation: {
        const rotationPoint = operationOn.value.getRotationPoint();
        const current_beam = drag.current
          .clone()
          .add(rotationPoint.clone().multiplyScalar(-1));
        const last_beam = drag.last
          .clone()
          .add(rotationPoint.clone().multiplyScalar(-1));
        const delta_angle = last_beam.angle() - current_beam.angle(); // 旋转为顺时针

        const rotation = new Matrix3().rotate(delta_angle);
        const trans = new Matrix3().translate(
          -rotationPoint.x,
          -rotationPoint.y
        );

        const transInverse = trans.clone().invert();
        const affine = transInverse.clone().multiply(rotation).multiply(trans);

        return {
          operationOn: {
            be: true,
            value: operationOn.value.setOptions({
              modelMatrix: affine
                .clone()
                .multiply(operationOn.value.modelMatrix),
            }),
          },
          hotZone,
          last: undefined,
          cancelOn: undefined,
        };
      }
      case Zones.none: {
        return {
          operationOn: undefined,
          hotZone: Zones.none,
          last: undefined,
          cancelOn: undefined,
        };
      }
    }
  } else {
    const r = {
      operationOn: undefined,
      hotZone: Zones.none,
      last: undefined,
      cancelOn: undefined,
    };
    return r;
  }
}
