import { Either } from 'fp-ts/lib/Either';
import * as Rx from 'rxjs';
import * as Ro from 'rxjs/operators';
import * as fp from 'fp-ts';
import { Vector2, Vector3 } from 'three';
import {
  Drag,
  drawMeasuraline2d,
  editMeasureLine2d,
  EntityType,
  Maybe,
  MeasureLine2d,
  Zones,
} from './entity-2d-model';

export interface D<T, E> {
  tag: T;
  event: E;
}
export interface Entity<P, M> {
  id: string;
  typeName: EntityType;
  isOn: (p: P) => boolean;
  on: boolean;
  index: number;
  value: M;
  // edit: (
  //   operationOn: Maybe<Entity<P, M, T, E>>,
  //   mouseOn: Maybe<Entity<P, M, T, E>>,
  //   drag: D<T, E>,
  // ) => {
  //   operationOn: Maybe<Entity<P, M, T, E>>;
  //   mouseOn: Maybe<Entity<P, M, T, E>>;
  // };
  // draw: (
  //   operationOn: Maybe<Entity<P, M, T, E>>,
  //   drag: D<T, E>,
  // ) => Maybe<Entity<P, M, T, E>>;
}
export enum Mode {
  select = 'select',
  draw = 'draw',
}

interface Drawable<T> {
  draw: (entity: Maybe<T>) => T;
}
// const p: Plane;
// const Drawable : Drawable<Plane> = {
//           draw: ()
// }

function work<T>(D: Drawable<T>, entity: Maybe<T>): T {
  return D.draw(entity);
}

// const result = work(Drawable, p)

// type Maybe2<T> = Either<{ isNil: false; value: T }, { isNil: true }>;

function editFunc(typeName: string) {}
function drawFunc(typeName: EntityType) {
  switch (typeName) {
    case EntityType.measureLine:
      return;
    case EntityType.practor:
      return;
  }
}

// type EventH<P, M, T, E> = (es$: Rx.Observable<...>): any;

// declare function compose<P, T, E, M0, M1> (e0: EventH<P, M0, T, E>, e1: EventH<P, M1, T, E>): EventH<P, Either<M0, M1>, T, E>

// const x : Rx.Observable< Either< Maybe<Entity<P, M>>, Maybe< Entity<P, M> > > > = null;

// const x : Either< Maybe<Entity<P, M0>>, Maybe< Entity<P, M1> > >  = null;

// matchEither(x, (onLeft: Some<M0> | None => ), onRight  Some<M1> | None=> )

// const add : (a: number, b: number) => number

// add(add(1, 2),3)

// addC : (b: number) => (a: number) => number

// pipe(
//           1,
//           addC(2),
//           addC(3),
//           addC(4)
// )

// Either<A, Either<B, C>> -> A | B | C

// Either<A, B> => A | B

export function event<P, M, T, E>(
  es$: Rx.Observable<Entity<P, M>[]>,
  p$: Rx.Observable<P>,
  d$: Rx.Observable<Drag>,
  mode$: Rx.Observable<Mode>,
  drawType$: Rx.Observable<EntityType>,
  edit: (
    operationOn: Maybe<Entity<P, M>>,
    mouseOn: Maybe<Entity<P, M>>,
    drag: Drag
  ) => {
    operationOn: Maybe<Entity<P, M>>;
    mouseOn: Maybe<Entity<P, M>>;
  }

  // draw: (
  //   operationOn: Maybe<Entity<P, M>>,
  //   drag: Drag,
  // ) => Maybe<Entity<P, M>>,
) {
  const mouseOnE$: Rx.Observable<Maybe<Entity<P, M>>> = Rx.combineLatest(
    es$,
    p$
  ).pipe(
    Ro.map(([es, p]) =>
      es.filter((e) => e.isOn(p)).sort((a, b) => b.index - a.index)
    ),
    Ro.map((es) => (es.length > 0 ? { be: true, value: es[0] } : undefined))
  );

  //   const editEntity$ = (
  //     edit: (
  //       operationOn: Maybe<Entity<P, M, T, E>>,
  //       mouseOn: Maybe<Entity<P, M, T, E>>,
  //       drag: D<T, E>,
  //     ) => {
  //       operationOn: Maybe<Entity<P, M, T, E>>;
  //       mouseOn: Maybe<Entity<P, M, T, E>>;
  //     },
  //   ) =>
  //     d$.pipe(
  //       Ro.withLatestFrom(mouseOnE$),
  //       Ro.scan(
  //         (
  //           acc: {
  //             operationOn: Maybe<Entity<P, M, T, E>>;
  //             mouseOn: Maybe<Entity<P, M, T, E>>;
  //           },
  //           cur: [D<T, E>, Maybe<Entity<P, M, T, E>>],
  //         ) => edit(acc.operationOn, cur[1], cur[0]),
  //         { operationOn: { isNil: true }, mouseOn: { isNil: true } },
  //       ),
  //     );

  const editEntity$ = d$.pipe(
    Ro.withLatestFrom(mouseOnE$),
    Ro.scan(
      (
        acc: {
          operationOn: Maybe<Entity<P, M>>;
          mouseOn: Maybe<Entity<P, M>>;
        },
        cur: [Drag, Maybe<Entity<P, M>>]
      ) => {
        return acc.operationOn?.be
          ? edit(acc.operationOn, cur[1], cur[0])
          : cur[1]?.be
          ? edit(acc.operationOn, cur[1], cur[0])
          : acc;
      },
      { operationOn: undefined, mouseOn: undefined }
    )
  );

  // const drawEntity$ = (
  //   draw: (
  //     operationOn: Maybe<Entity<P, M>>,
  //     drag: Drag,
  //   ) => Maybe<Entity<P, M>>,
  // ) =>
  //   d$.pipe(
  //     Ro.scan(
  //       (acc: Maybe<Entity<P, M>>, cur: Drag) => draw(acc, cur),
  //       {
  //         isNil: true,
  //       },
  //     ),
  //   );

  // const drawEntity2$ = (
  //   draw: (
  //     operationOn: Maybe<Entity<P, M>>,
  //     drag: Drag,
  //   ) => Maybe<Entity<P, M>>,
  // ) =>
  //   drawType$.pipe(
  //     Ro.switchMap((typeName) =>
  //       d$.pipe(
  //         Ro.scan(
  //           (acc: Maybe<Entity<P, M>>, cur: Drag) =>
  //             acc.isNil ? draw(acc, cur) : acc.value.draw(acc, cur),
  //           {
  //             isNil: true,
  //           },
  //         ),
  //       ),
  //     ),
  //   );

  const eventEdit$ = mode$.pipe(
    Ro.switchMap((m) => (m === Mode.select ? editEntity$ : Rx.EMPTY))
  );
  // const eventDraw$ = mode$.pipe(
  //   Ro.switchMap((m) => (m === Mode.draw ? drawEntity$(draw) : Rx.EMPTY)),
  // );
  return eventEdit$;
}

export function measurelineEvent$(
  es$: Rx.Observable<MeasureLine2d[]>,
  p$: Rx.Observable<Vector2>,
  d$: Rx.Observable<Drag>,
  mode$: Rx.Observable<Mode>
) {
  const mouseOnE$: Rx.Observable<Maybe<MeasureLine2d>> = Rx.combineLatest(
    es$,
    p$
  ).pipe(
    Ro.map(([es, p]) =>
      es.filter((e) => e.isOn(p)).sort((a, b) => b.index - a.index)
    ),
    Ro.map((es) => (es.length > 0 ? { be: true, value: es[0] } : undefined))
  );

  const editEntity$ = d$.pipe(
    Ro.withLatestFrom(mouseOnE$),
    Ro.scan(
      (
        acc: {
          operationOn: Maybe<MeasureLine2d>;
          hotZone: Zones;
          last: Maybe<MeasureLine2d>;
          cancelOn: Maybe<MeasureLine2d>;
        },
        cur: [Drag, Maybe<MeasureLine2d>]
      ) => {
        const r: {
          operationOn: Maybe<MeasureLine2d>;
          hotZone: Zones;
          last: Maybe<MeasureLine2d>;
          cancelOn: Maybe<MeasureLine2d>;
        } = editMeasureLine2d(acc.operationOn, acc.hotZone, cur[1], cur[0]);
        return r;
      },
      {
        operationOn: undefined,
        hotZone: Zones.none,
        last: undefined,
        cancelOn: undefined,
      }
    )
  );

  const drawEntity$ = d$.pipe(
    Ro.scan(
      (
        acc: {
          operationOn: Maybe<MeasureLine2d>;
          hotZone: Zones;
          cancelOn: Maybe<MeasureLine2d>;
          last: Maybe<MeasureLine2d>;
          finished?: boolean;
        },
        cur: Drag
      ) => {
        return drawMeasuraline2d(acc.operationOn, acc.hotZone, cur);
      },
      {
        operationOn: undefined,
        cancelOn: undefined,
        last: undefined,
        hotZone: Zones.none,
      }
    )
  );
  const eventEdit$ = mode$.pipe(
    Ro.tap((x) => console.log(x, x === Mode.select)),
    Ro.switchMap((m) => (m === Mode.select ? editEntity$ : Rx.EMPTY))
  );
  const eventDraw$ = mode$.pipe(
    Ro.switchMap((m) => (m === Mode.draw ? drawEntity$ : Rx.EMPTY))
  );
  return { eventEdit$, eventDraw$ };
}
