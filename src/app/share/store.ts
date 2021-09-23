import { Subject, Observable, BehaviorSubject } from 'rxjs';

import {
  scan,
  startWith,
  distinctUntilChanged,
  map,
  filter,
  tap,
} from 'rxjs/operators';

// TODO: better store implmentation
export type Reducer<T> = (state: T, index: number) => T;
export type MetaReducer<T, R> = (s: Store<T>) => Store<R>;
export interface Store<T> {
  state$: Observable<T>;
  // dispatch(action: Reducer<T>): Observable<never>;
  dispatch(action: Reducer<T>): Observable<T>;
  complete(): void;
  currentState(): T;
}
export function store<T>(init: T): Store<T> {
  const action$ = new Subject<Reducer<T>>();
  const subject = new BehaviorSubject<T>(init);
  action$
    .pipe(
      scan<Reducer<T>, T>((s, a, i) => a(s, i), init),
      startWith(init),
      distinctUntilChanged()
    )
    .subscribe(subject);
  function complete() {
    action$.complete();
    subject.complete();
  }

  return {
    dispatch: (action) =>
      new Observable<T>((obs) => {
        action$.next(action);
        obs.complete();
      }),
    state$: subject.asObservable(),
    currentState: () => subject.value,
    complete,
  };
}

// Store implemented via array, and stored items is required to have {id: string} interface
export interface WithId {
  id: string;
}

export type Item<T> = T & WithId;

export type EqOp<T> = (a: T) => (b: T) => boolean;

export const eqId: EqOp<WithId> = (a) => (b) => a.id === b.id;

export class StoreByArray<E extends WithId, T extends E> implements Store<T[]> {
  /**
   * E is minimal type to apply to equalTo
   * T is type of object stored
   * e.g. if T = { name: string, id: string }, E could be { id: string }
   */
  readonly state$: Observable<T[]>;
  constructor(private equalTo: EqOp<E> = eqId) {
    this.s = store<T[]>([]);
    this.state$ = this.s.state$;
  }
  private s: Store<T[]>;
  dispatch(action: Reducer<T[]>) {
    return this.s.dispatch(action);
  }
  currentState() {
    return this.s.currentState();
  }
  complete() {
    this.s.complete();
  }
  get$(key: E): Observable<T> {
    return this.state$.pipe(
      map((items) => items.find(this.equalTo(key))),
      filter((item): item is T => item !== undefined),
      distinctUntilChanged()
    );
  }
  filter$(fn: (x: T) => boolean): Observable<T[]> {
    return this.state$.pipe(map((state) => state.filter(fn)));
  }
  setState(state: T[]) {
    return this.dispatch(() => state);
  }
  // insertMany(insertItems: T[]) {
  //   return this.dispatch((items: T[]) => {
  //     const finalInsertItems = insertItems.filter((insertItem) =>
  //       items.map((i) => i.id).includes(insertItem.id),
  //     );
  //     const existItems = insertItems.filter(
  //       (insertItem) => !items.map((i) => i.id).includes(insertItem.id),
  //     );
  //     console.warn(`Items with ids: ${existItems} already exist`);
  //     return [...items, ...finalInsertItems];
  //   });
  // }
  insertMany(insertItems: T[]) {
    return this.dispatch((items: T[]) =>
      insertArray<T>(items, insertItems, this.equalTo)
    );
  }
  insert(item: T) {
    return this.dispatch((items: T[]) => {
      if (items.find(this.equalTo(item)) !== undefined) {
        throw Error(`Item with id: ${item.id} already exists.`);
      } else {
        return [...items, item];
      }
    }).pipe(map((x) => [item]));
  }
  remove(item: T) {
    return this.dispatch((items: T[]) =>
      items.filter((i) => !this.equalTo(item)(i))
    );
  }
  update(...values: T[]) {
    return this.dispatch((items: T[]) =>
      updateArray<T>(items, values, this.equalTo)
    );
  }
  clear() {
    return this.setState([]);
  }
  upsertMany(...values: T[]) {
    return this.dispatch((items: T[]) =>
      upsertArray<T>(items, values, this.equalTo)
    );
  }
}

function updateArray<T extends WithId>(
  items: T[],
  values: T[],
  eq: EqOp<T>
): T[] {
  values.forEach((v) => {
    if (items.find((i) => eq(v)(i)) === undefined) {
      throw Error(`Item with id: ${v.id} not exists.`);
    }
  });
  return items.map((x) => {
    const found = values.find((v) => eq(x)(v));
    return found === undefined ? x : found;
  });
}

function insertArray<T extends WithId>(
  items: T[],
  values: T[],
  eq: EqOp<T>
): T[] {
  values.forEach((v) => {
    if (items.find((i) => eq(v)(i)) !== undefined) {
      throw Error(`Item with id: ${v.id} already exists.`);
    }
  });
  const finalInsertItems = values.filter(
    (value) => items.find((i) => eq(value)(i)) === undefined
  );

  return [...items, ...finalInsertItems];
}

function upsertArray<T extends WithId>(
  items: T[],
  values: T[],
  eq: EqOp<T>
): T[] {
  const finalInsertItems = values.filter(
    (value) => items.find((i) => eq(value)(i)) === undefined
  );
  // const existItems = values.filter(
  //   // (value) => !items.map((i) => i.id).includes(value.id),
  //   (value) => items.find((i) => eq(value)(i) !== undefined),
  // );

  const afterUpdate = items.map((x) => {
    const found = values.find((v) => eq(x)(v));
    return found === undefined ? x : found;
  });
  return [...afterUpdate, ...finalInsertItems];
}
