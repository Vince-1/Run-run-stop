function getProperty<Type, Key extends keyof Type>(obj: Type, key: Key) {
  return obj[key];
}

let x = { a: 1, b: 2, c: 3, d: 4 };

getProperty(x, 'a');
// getProperty(x, 'm');
class BeeKeeper {
  hasMask: boolean = true;
}

class ZooKeeper {
  nametag: string = 'Mikle';
}

class Animal {
  numLegs: number = 4;
}

class Bee extends Animal {
  keeper: BeeKeeper = new BeeKeeper();
}

class Lion extends Animal {
  constructor(public x: number) {
    super();
  }
  keeper: ZooKeeper = new ZooKeeper();
}

function createInstance<A extends Animal>(c: new (...args: any[]) => A): A {
  return new c();
}

createInstance(Lion).keeper.nametag;
createInstance(Bee).keeper.hasMask;

export const l = createInstance(Lion); // l.x is undefined
export const l2 = new Lion(1);

interface Box1 {
  center: number;
  size: number;
}
interface Box2 {
  left: number;
  right: number;
}
type Box = <R>(onBox1: (b: Box1) => R, onBox2: (b: Box2) => R) => R;

const box1 =
  (box1: Box1): Box =>
  (onBox1, _) =>
    onBox1(box1);
const box2 =
  (box2: Box2): Box =>
  (_, onBox2) =>
    onBox2(box2);

function size(b: Box): number {
  return b(
    ({ size }) => size,
    ({ left, right }) => right - left
  );
}

interface BoxPattern<T> {
  visitBox1(b: Box1): T;
  visitBox2(b: Box2): T;
}

interface BoxU {
  accept<R>(pattern: BoxPattern<R>): R;
}

const box1u = (box1: Box1): BoxU => ({ accept: (p) => p.visitBox1(box1) });
const box2u = (box2: Box2): BoxU => ({ accept: (p) => p.visitBox2(box2) });

function size2(b: BoxU): number {
  return b.accept({
    visitBox1(b) {
      return b.size;
    },
    visitBox2(b) {
      return b.right - b.left;
    },
  });
}
