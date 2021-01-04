import { Vector3 } from 'three';

export interface Image3D {
  readonly shape: Vector3;
  readonly pixelSize: Vector3;
  readonly center: Vector3;
  readonly dtype: 'uint16' | 'float32';
  readonly data: ArrayBuffer;
  readonly tag: 'image' | 'mask';
}

export function imageSize(img: Image3D): Vector3 {
  return new Vector3().multiplyVectors(img.shape, img.pixelSize);
}
