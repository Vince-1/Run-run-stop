const dataHost = `http://localhost:4200/assets`;
export interface Vec3<T> {
    x: T;
    y: T;
    z: T;
  }
export interface StubDataMeta {
    path: string;
    shape: Vec3<number>;
    pixelSize: Vec3<number>;
    dtype: 'uint16' | 'float64';
    scale: number;
    offset: number;
  }
export const StubImage3D: {
    [key: string]: StubDataMeta;
  } = {
    pet: {
      path: `${dataHost}/rabbit_images/rabbit1d_wholebody_pet.bin`,
      shape: {
        x: 240,
        y: 240,
        z: 424,
      },
      pixelSize: {
        x: 1,
        y: 1,
        z: 1,
      },
      dtype: 'uint16',
      scale: 1000,
      offset: 0,
    },
    ct: {
      path: `${dataHost}/rabbit_images/rabbit1d_wholebody_ct.uint16.bin`,
      shape: {
        x: 240,
        y: 240,
        z: 424,
      },
      pixelSize: {
        x: 1,
        y: 1,
        z: 1,
      },
      dtype: 'uint16',
      scale: 2048,
      offset: 0.0,
    },
    petHead: {
      path: `${dataHost}/head_pet/pet_img.bin`,
      shape: {
        x: 344,
        y: 344,
        z: 127,
      },
      pixelSize: {
        x: 1,
        y: 1,
        z: 1,
      },
      dtype: 'uint16',
      scale: 6895,
      offset: 0.0,
    },
    mriHead: {
      path: `${dataHost}/head_pet/mri_img.bin`,
      shape: {
        x: 512,
        y: 512,
        z: 192,
      },
      pixelSize: {
        x: 250 / 512,
        y: 250 / 512,
        z: 1,
      },
      dtype: 'uint16',
      scale: 774.2,
      offset: 0.0,
    },
  };
  export interface Image3D {
    readonly shape: Vec3<number>;
    readonly pixelSize: Vec3<number>;
    readonly center: Vec3<number>;
    readonly dtype: 'uint16' | 'float32' | 'float64';
    readonly data: ArrayBuffer;
  }

  export function pure<T>(value: T) {
    return {
      x: value,
      y: value,
      z: value,
    };
  }

  export async function loadStubData(meta: StubDataMeta): Promise<Image3D> {
    // export async function loadStubData(meta: StubDataMeta): Promise<Image3D> {
    const r = await fetch(meta.path);
    const b = await r.arrayBuffer();
    console.log(r, b);
    return {
      shape: meta.shape,
      pixelSize: meta.pixelSize,
      dtype: meta.dtype,
      data: b,
      center: pure(0.0),
    };
  }

  export async function loadF32Image(meta: StubDataMeta): Promise<Image3D> {
    const img = await loadStubData(meta);
    const rawArray =
      meta.dtype === 'float64'
        ? new Float64Array(img.data)
        : new Uint16Array(img.data);
    const data = new Float32Array(rawArray.length);
    //   console.log(rawArray.reduce((p, c) => Math.min(p, c), 10000));
    //   console.log(rawArray.reduce((p, c) => Math.max(p, c), -100000));
  
    for (let i = 0; i < rawArray.length; i++) {
      data[i] = rawArray[i] / meta.scale + meta.offset;
      // data[i] = rawArray[i] / 2048 + meta.offset;
    }
    const f32Img: Image3D = {
      ...img,
      dtype: 'float32',
      data,
    };
    // console.log(f32Img);
    // console.log(data.reduce((p, c) => Math.min(p, c), 10000));
    // console.log(data.reduce((p, c) => Math.max(p, c), -100000));
  
    return f32Img;
  }