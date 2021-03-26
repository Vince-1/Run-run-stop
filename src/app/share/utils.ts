import {
  DataTexture3D,
  RedFormat,
  FloatType,
  LinearFilter,
  DataTexture,
  Matrix4,
  NearestFilter,
  TypedArray,
  IntType,
  UnsignedIntType,
  HalfFloatType,
  AlphaFormat,
  RGBFormat,
  RGBAFormat,
  LuminanceFormat,
  LuminanceAlphaFormat,
  RGBEFormat,
  DepthFormat,
  DepthStencilFormat,
  RedIntegerFormat,
  RGFormat,
  RGIntegerFormat,
  RGBIntegerFormat,
  RGBAIntegerFormat,
  ShortType,
  UnsignedShortType,
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

export function makeTexture3d(img: TypedArray, x = 100, y = 100, z = 1) {
  if (x * y * z !== img.length) {
    throw Error('shape not match image');
  }
  const texture = new DataTexture3D(img, x, y, z);
  texture.format = RedIntegerFormat;
  texture.internalFormat = 'R16UI';
  texture.type = UnsignedShortType;
  // texture.type = HalfFloatType;
  // // texture.magFilter = NearestFilter;
  // // texture.minFilter = NearestFilter;
  // texture.magFilter = LinearFilter;
  // texture.minFilter = LinearFilter;
  texture.unpackAlignment = 1;
  console.log(texture);
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
  // const a = f32Array.sort((a, b) => (a > b ? a : b));
  // console.log(a);
  return f32Array;
  // return rawArray;
}

// function toHalf(val: number) {
//   floatView[0] = val;
//   var x = int32View[0];

//   var bits = (x >> 16) & 0x8000; /* Get the sign */
//   var m = (x >> 12) & 0x07ff; /* Keep one extra bit for rounding */
//   var e = (x >> 23) & 0xff; /* Using int is faster here */

//   /* If zero, or denormal, or exponent underflows too much for a denormal
//    * half, return signed zero. */
//   if (e < 103) return bits;

//   /* If NaN, return NaN. If Inf or exponent overflow, return Inf. */
//   if (e > 142) {
//     bits |= 0x7c00;
//     /* If exponent was 0xff and one mantissa bit was set, it means NaN,
//      * not Inf, so make sure we set one mantissa bit too. */
//     bits |= (e == 255 ? 0 : 1) && x & 0x007fffff;
//     return bits;
//   }

//   /* If exponent underflows but not too much, return a denormal */
//   if (e < 113) {
//     m |= 0x0800;
//     /* Extra rounding may overflow and set mantissa to 0 and exponent
//      * to 1, which is OK. */
//     bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1);
//     return bits;
//   }

//   bits |= ((e - 112) << 10) | (m >> 1);
//   /* Extra rounding. An overflow will set mantissa to 0 and increment
//    * the exponent, which is OK. */
//   bits += m & 1;
//   return bits;
// }
