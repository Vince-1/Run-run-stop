import {
  DataTexture3D,
  RedFormat,
  FloatType,
  LinearFilter,
  DataTexture,
  Matrix4,
} from 'three';

export function makeArray(
  n: number = 10000,
  filter: 'linear' | 'random' | 'customize' = 'linear',
  x = 100,
  y = 100,
  z = 1
) {
  let img = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    switch (filter) {
      case 'linear':
        img[i] = i / n;
        break;
      case 'random':
        img[i] = Math.random();
        break;
      case 'customize':
        break;
    }
  }
  console.log(img);
  return img;
}

export function makeTexture2d(img: Float32Array, x = 100, y = 100) {
  if (x * y !== img.length) {
    throw Error('shape not match img');
  }
  const texture = new DataTexture(img, x, y);
  texture.format = RedFormat;
  texture.type = FloatType;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.unpackAlignment = 1;
  return texture;
}

export function makeTexture3d(img: Float32Array, x = 100, y = 100, z = 1) {
  if (x * y * z !== img.length) {
    throw Error('shape not match image');
  }
  const texture = new DataTexture3D(img, x, y, z);
  texture.format = RedFormat;
  texture.type = FloatType;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.unpackAlignment = 1;
  return texture;
}

export function printMatrix4(m: Matrix4) {
  for (let i = 0; i < 4; i++) {
    const row = [];
    for (let j = 0; j < 4; j++) {
      row.push(m.elements[i + j * 4]);
    }
    console.log(row.join(', '));
  }
}

export function transform16to32(arrayBuffer: ArrayBuffer) {
  const rawArray = new Uint16Array(arrayBuffer);
  const f32Array = new Float32Array(rawArray.length);
  for (let i = 0; i < rawArray.length; i++) {
    f32Array[i] = rawArray[i] / 1000;
  }
  //   const a = f32Array.sort((a, b) => (a > b ? a : b));
  //   console.log(a);
  return f32Array;
}
