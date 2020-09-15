import {
  DataTexture3D,
  RedFormat,
  FloatType,
  LinearFilter,
  DataTexture,
} from 'three';

export function makeArray(n: number = 10000, x = 100, y = 100, z = 1) {
  let img = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    if (i % 500 === 0) {
      // img[i] = i ;
    }
    img[i] = i / n;
  }
  console.log(img);
  return img;
}

export function makeTexture2d(img: Float32Array, x = 100, y = 100) {
  if (x * y !== img.length) {
    throw Error('shape not match img');
  }
  const texture = new DataTexture(img, 100, 100);
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
