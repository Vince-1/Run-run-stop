import { DoubleSide, Matrix4, Texture, Vector2 } from 'three';
import { shaders } from './shader-fragments';
import { makeArray, makeTexture3d } from './utils';

export const tomoShader = {
  uniforms: {
    //     image: { value: makeTexture3d(new Float32Array(1), 1, 1, 1) },
    image: { value: makeTexture3d(makeArray(10000, 'random'), 100, 100, 1) },
    colormap: { value: new Texture() },
    window: { value: new Vector2(0, 1) },
    planAffine: { value: new Matrix4() },
    planAffineInverse: { value: new Matrix4() },
    imageAffine: { value: new Matrix4().makeScale(100, 100, 1) },
    imageAffineInverse: {
      value: new Matrix4().makeScale(100, 100, 1).invert(),
    },
  },
  vertexShader: shaders.singleImage3d.vertex,
  fragmentShader: shaders.singleImage3d.frag,
  side: DoubleSide,
};
