import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { get } from 'lodash';
import { Vector3, TextureLoader, Texture } from 'three';
import { Image3D } from './image3d';
export interface StubDataMeta {
  path: string;
  shape: Vector3;
  pixelSize: Vector3;
  dtype: 'uint16' | 'float32';
  scale: number;
  offset: number;
}
const dataHost = `http://localhost:4201/assets`;
export const Textures = {
  gray: `${dataHost}/textures/cm_gray.png`,
  viridis: `${dataHost}/textures/cm_viridis.png`,
  petCT: `${dataHost}/textures/cm_petct.png`,
};
export const StubImage3D: {
  [key: string]: StubDataMeta;
} = {
  pet: {
    path: `${dataHost}/rabbit_images/rabbit1d_wholebody_pet.bin`,
    shape: new Vector3(240, 240, 424),
    pixelSize: new Vector3(1, 1, 1),
    dtype: 'uint16',
    scale: 1000,
    offset: 0,
  },
  ct: {
    path: `${dataHost}/rabbit_images/rabbit1d_wholebody_ct.uint16.bin`,
    shape: new Vector3(240, 240, 424),
    pixelSize: new Vector3(1, 1, 1),
    dtype: 'uint16',
    scale: 2048,
    offset: 0.0,
  },
  petHead: {
    path: `${dataHost}/head_pet/pet_img.bin`,
    shape: new Vector3(344, 344, 127),
    pixelSize: new Vector3(1, 1, 1),
    dtype: 'uint16',
    scale: 6895,
    offset: 0.0,
  },
  mriHead: {
    path: `${dataHost}/head_pet/mri_img.bin`,
    shape: new Vector3(512, 512, 192),
    pixelSize: new Vector3(250 / 512, 250 / 512, 1),
    dtype: 'uint16',
    scale: 774.2,
    offset: 0.0,
  },
};

export async function loadStubData(meta: StubDataMeta): Promise<Image3D> {
  const r = await fetch(meta.path);
  const b = await r.arrayBuffer();
  return {
    shape: meta.shape,
    pixelSize: meta.pixelSize,
    dtype: meta.dtype,
    data: b,
    center: new Vector3(0, 0, 0),
    tag: 'image',
  };
}

export async function loadColormap(url: string): Promise<THREE.Texture> {
  const result = new Promise<THREE.Texture>((resolve, reject) => {
    const texture = new TextureLoader().load(
      url,
      () => {
        resolve(texture);
      },
      undefined,
      (e) => reject(e)
    );
  });
  return result;
}

export function loadColormap0(url: string): THREE.Texture {
  let result = new Texture();
  const texture = new TextureLoader().load(
    url,
    () => {
      result = texture;
    },
    undefined,
    (e) => console.error(e)
  );

  return result;
}
