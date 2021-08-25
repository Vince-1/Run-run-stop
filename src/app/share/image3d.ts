import { Vector3 } from 'three';
import { InfoConcernDicom } from './dicomTag';

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
export function DicomInfoToImage3d(d: InfoConcernDicom): Image3D {
  // 暂时的
  const shape = new Vector3(d.columns, d.rows, d.numberOfFrames);
  const pixelSize = new Vector3(
    d.pixelSpacing[0],
    d.pixelSpacing[1],
    d.sliceThickness
  );
  const x = d.imagePosition[0] + (d.columns / 2) * d.pixelSpacing[0];
  const y = d.imagePosition[1] + (d.rows / 2) * d.pixelSpacing[1];
  // const z = d.imagePosition[2] + (d.numberOfFrames / 2) * d.sliceThickness;
  const z = d.sliceLocation;

  const center = new Vector3(x, y, z);
  const dtype = 'uint16';
  const data = d.pixelData.buffer;
  const tag = 'image';

  return { shape, pixelSize, center, dtype, data, tag };
}
