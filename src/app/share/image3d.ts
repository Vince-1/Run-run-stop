export interface Image3D {
  readonly shape: Vec3<number>;
  readonly pixelSize: Vec3<number>;
  readonly center: Vec3<number>;
  readonly dtype: 'uint16' | 'float32' | 'float64';
  readonly data: ArrayBuffer;
}
export function imageSize(img: Image3D): Vec3<number> {
  return {
    x: img.shape.x * img.pixelSize.x,
    y: img.shape.y * img.pixelSize.y,
    z: img.shape.z * img.pixelSize.z,
  };
}
export interface Vec3<T> {
  x: T;
  y: T;
  z: T;
}
export function map<A, B>(v: Vec3<A>, f: (x: A) => B): Vec3<B> {
  return {
    x: f(v.x),
    y: f(v.y),
    z: f(v.z),
  };
}
export function liftA2<A, B, C>(
  f: (a: A, b: B) => C,
): (a: Vec3<A>) => (b: Vec3<B>) => Vec3<C> {
  return (a: Vec3<A>) => (b: Vec3<B>) => {
    const result: Vec3<C> = {
      x: f(a.x, b.x),
      y: f(a.y, b.y),
      z: f(a.z, b.z),
    };
    return result;
  };
}
export function pure<T>(value: T) {
  return {
    x: value,
    y: value,
    z: value,
  };
}
function uncurry2<A, B, C>(f: (a: A) => (b: B) => C): (a: A, b: B) => C {
  return (a, b) => f(a)(b);
}
export const addVec3 = uncurry2(
  liftA2<number, number, number>((a, b) => a + b),
);
export const subVec3 = uncurry2(
  liftA2<number, number, number>((a, b) => a - b),
);
export const mulVec3 = uncurry2(
  liftA2<number, number, number>((a, b) => a * b),
);

export interface ColorMapWindow {
  vmin: number;
  vmax: number;
}