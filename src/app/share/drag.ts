import { fromEvent, merge, Observable, Subject } from 'rxjs';
import {
  map,
  switchMap,
  startWith,
  takeUntil,
  scan,
  repeat,
  elementAt,
  tap,
} from 'rxjs/operators';
import { Vector2 } from 'three';

export interface Drags {
  origin: Vector2;
  current: Vector2;
  last: Vector2;
  tag: string; // 'mousedown' | 'mousemove' | 'mouseup';
  button:number;
}

// export function createDrag(element: HTMLElement) {
//   const down$ = fromEvent(element, 'mousedown') as Observable<MouseEvent>;
//   const position$ = fromEvent(element, 'mousemove') as Observable<MouseEvent>;
//   const up$ = fromEvent(element, 'mouseup') as Observable<MouseEvent>;
//   const leave$ = fromEvent(element, 'mouseleave') as Observable<MouseEvent>;
//   const cancel$ = merge(up$, leave$).pipe(repeat(2), elementAt(2));
//   const f$: Observable<Drags> = down$.pipe(
//     switchMap((d: MouseEvent) => {
//       return merge(position$, up$, leave$).pipe(
//         startWith(d),
//         map((c: MouseEvent) => {
//           return {
//             origin: new Vector2(d.offsetX, d.offsetY),
//             current: new Vector2(c.offsetX, c.offsetY),
//             last: new Vector2(c.offsetX, c.offsetY),
//             tag: c.type,
//           };
//         }),
//         takeUntil(cancel$),
//         scan((acc, cur) => ({
//           ...cur,
//           last: cur.tag === 'mousedown' ? cur.current : acc.current,
//         }))
//       );
//     })
//   );
//   return f$;
// }
const stop = new Subject<void>();
export function createDrag(element: HTMLElement) {
  const down$ = fromEvent(element, 'mousedown') as Observable<MouseEvent>;
  const position$ = fromEvent(element, 'mousemove') as Observable<MouseEvent>;
  const up$ = fromEvent(element, 'mouseup') as Observable<MouseEvent>;
  const leave$ = fromEvent(element, 'mouseleave') as Observable<MouseEvent>;
  const cancel = merge(up$, leave$);
  const f$: Observable<Drags> = down$.pipe(
    switchMap((d: MouseEvent) => {
        d.preventDefault();
      return merge(down$, position$).pipe(
        startWith(d),
        tap((e) => e.preventDefault()),
        map((c: MouseEvent) => {
          return {
            origin: new Vector2(d.offsetX, d.offsetY),
            current: new Vector2(c.offsetX, c.offsetY),
            last: new Vector2(c.offsetX, c.offsetY),
            tag: c.type,
            button:d.button
          };
        }),
        takeUntil(cancel)
      );
    }),
    takeUntil(stop),
            scan((acc, cur) => ({
          ...cur,
          last: cur.tag === 'mousedown' ? cur.current : acc.current,
        }))
    // takeUntil(cancel)
  );
  return f$;
}
