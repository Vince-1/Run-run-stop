import { Component, OnInit, ElementRef, RendererFactory2 } from '@angular/core';
import {
  Scene,
  WebGLRenderer,
  Vector3,
  Mesh,
  Vector2,
  DoubleSide,
  Color,
  Texture,
  TextureLoader,
  OrthographicCamera,
  ShaderMaterial,
  MeshBasicMaterial,
  PlaneBufferGeometry,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { shaders } from '../share/shader-fragments';
import {
  makeTexture3d,
  makeArray,
  transform16to32,
  printMatrix4,
} from '../share/utils';
import {
  loadStubData,
  StubImage3D,
  loadColormap,
  Textures,
} from '../share/stub';
import { Image3D } from '../share/image3d';
import { fromEvent, Subject } from 'rxjs';

import * as Rx from 'rxjs';
import * as Ro from 'rxjs/operators';

import * as assert from 'assert';
import * as L from 'monocle-ts/Lens';
import { pipe } from 'fp-ts/function';
import * as O from 'monocle-ts/Optional';
import { some, none } from 'fp-ts/Option';
import { ViewChild } from '@angular/core';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { cons } from 'fp-ts/lib/ReadonlyNonEmptyArray';
import { parseDicom } from 'dicom-parser';
import {
  dicomFileReaderOnload,
  dicomReader,
  dicomReader2,
  getDataByVR,
  getDataType,
  imageInfoConcernDicomTag,
  InfoConcernDicom,
  ValueRepresentation,
} from '../share/dicomTag';
import { scan } from 'rxjs/operators';

@Component({
  selector: 'app-tomo',
  templateUrl: './tomo.component.html',
  styleUrls: ['./tomo.component.less'],
})
export class TomoComponent implements OnInit {
  scene = new Scene();
  width = window.innerWidth;
  height = window.innerHeight;
  camera = new OrthographicCamera(
    -window.innerWidth / 2,
    window.innerWidth / 2,
    -window.innerHeight / 2,
    window.innerHeight / 2
  );

  // tx = 2048;
  // ty = 2048;
  // tz = 100;
  tx = 100;
  ty = 100;
  tz = 100;

  renderer: WebGLRenderer;
  orbit: OrbitControls;
  z = 50;
  shape = new Vector3(10, 10, 10);
  size = new Vector3(10, 10, 10);
  shaderMaterial = new ShaderMaterial({
    uniforms: {
      img: {
        value: makeTexture3d(
          makeArray(this.tx * this.ty * this.tz, 'random'),
          this.tx,
          this.ty,
          this.tz
        ),
      },
      colormap: {
        value: new TextureLoader().load('assets/textures/cm_petct.png'),
      },
      center: { value: new Vector3(0, 0, 0) },
      shape: { value: new Vector3(this.tx, this.ty, this.tz) },
      pixelSize: { value: new Vector3(1, 1, 1) },
      window: { value: new Vector2(0, 1) },
      windowSize: {
        value: new Vector2(this.width, this.height),
      },
      view: { value: 0 }, // 0,1,2 = xy,yz,xz
      slicer: { value: 1.0 },
    },
    vertexShader: shaders.tomo.vertex,
    fragmentShader: shaders.tomo.frag,
    side: DoubleSide,
  });
  redMaterial = new MeshBasicMaterial({
    color: new Color('red'),
    side: DoubleSide,
  });
  plane = new Mesh(
    new PlaneBufferGeometry(window.innerWidth, window.innerHeight),
    // this.redMaterial
    this.shaderMaterial
  );

  canvas: HTMLCanvasElement;
  @ViewChild('canvas', { static: true }) set canvasRef(
    c: ElementRef<HTMLCanvasElement>
  ) {
    console.log(c);
    this.canvas = c.nativeElement;
  }

  @ViewChild('toRemove', { static: true }) toReomve!: ElementRef<HTMLElement>;

  @ViewChild('fileSelector', { static: true })
  fileSelector: ElementRef<HTMLInputElement>;

  // fileReader = new FileReader();
  // readDicomSubject = new Subject<InfoConcernDicom>();

  // data = new Uint8Array();

  constructor(private ef: ElementRef, rendererFactory: RendererFactory2) {
    const a = new Subject();
    const b = new Subject();

    const c = new Rx.Observable((o) => {
      o.next('x');

      o.next('y');

      o.next('z');
      o.complete();
    });

    const d = new Rx.Observable((o) => {
      setTimeout(() => {
        o.next('d');
        o.next('dd');
        return function ssss() {
          console.log('ssss');
        };
      }, 1000);
    });

    Rx.combineLatest(c, d).subscribe(
      (x) => console.log(x),
      (e) => console.error(e),
      () => console.log('complete')
    );

    a.subscribe(b);

    a.asObservable().subscribe(
      (x) => console.log(x),
      (e) => console.error(e)
    );
    b.asObservable().subscribe(
      (x) => console.log('bbb', x),
      (e) => console.error(e)
    );

    a.next('a');
    // console.log(this.canvas);
    // const renderer2 = rendererFactory.createRenderer(null, null);
    // const canvas = renderer2.createElement('canvas') as HTMLCanvasElement;
    // this.renderer = new WebGLRenderer({
    //   canvas,
    //   context: canvas.getContext('webgl2', { alpha: true, antialias: true }),
    // });
    // this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.setPixelRatio(window.devicePixelRatio);
    // this.camera.position.z = 1000;
    // this.scene.add(this.plane);
    // this.renderer.render(this.scene, this.camera);
  }

  loadFile(event: InputEvent) {
    console.log(event);
    console.log(this.fileSelector.nativeElement);
    console.log(this.fileSelector.nativeElement.files);
    if (this.fileSelector !== undefined) {
      const l = this.fileSelector.nativeElement.files.length;

      const files = this.fileSelector.nativeElement.files;
      const infos = new Array(l)
        .fill(0)
        .map((f, index) => dicomReader2<InfoConcernDicom>(files[index]));

      Rx.zip(...infos).subscribe(
        (x) => {
          // const image3d = this.updateImage3D(x,);
          // this.setImage(image3d);
          console.log(x);
        },
        (e) => console.error(e)
      );
      // const a = dicomReader2<InfoConcernDicom>(
      //   this.fileSelector.nativeElement.files[0]
      // );
      // a.subscribe(
      //   (x) => console.log(x),
      //   (e) => console.error(e)
      // );

      // for (let i = 0; i < l; i++) {
      //   const f = this.fileSelector.nativeElement.files[i];
      //   const reader = dicomReader<InfoConcernDicom>((info: InfoConcernDicom) =>
      //     this.readDicomSubject.next(info)
      //   );
      //   // new Rx.Observable().
      //   reader.readAsArrayBuffer(f);
      // }
    }
  }

  reMove() {
    this.toReomve.nativeElement.remove();
  }
  ngOnInit(): void {
    // this.readDicomSubject
    //   .asObservable()
    //   .pipe(
    //     // TODO: NEED MORE
    //     scan(
    //       (
    //         acc: { info: InfoConcernDicom; max: number },
    //         cur: InfoConcernDicom
    //       ) => ({
    //         info: cur,
    //         max: acc.max <= cur.instanceNumber ? cur.instanceNumber : acc.max,
    //       }),
    //       { info: {} as InfoConcernDicom, max: 0 }
    //     )
    //   )
    //   .subscribe(
    //     (info) => {
    //       console.log(info);
    //       if (info.max === 0) {
    //       } else {
    //         const image3d = this.updateImage3D(info.info, info.max);
    //         this.setImage(image3d);
    //       }
    //     },
    //     (e) => console.error(e)
    //   );
    console.log(this.canvas);
    console.log(this.toReomve);
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      context: this.canvas.getContext('webgl2', {
        alpha: true,
        antialias: true,
      }),
    });
    // this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setSize(1000, 1000);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera.position.z = 1000;
    this.scene.add(this.plane);
    this.renderer.render(this.scene, this.camera);

    console.log(this.plane);
    printMatrix4(this.plane.matrixWorld);
    const a = new Vector3();
    a.setFromMatrixPosition(this.plane.modelViewMatrix);
    console.log(a);

    this.forMonocle();
    // this.ef.nativeElement.appendChild(this.renderer.domElement);
    this.aninmate();
    fromEvent(this.ef.nativeElement, 'mousewheel').subscribe(
      (x: MouseWheelEvent) => {
        // x.preventDefault();
        this.updateSlicer(
          this.shaderMaterial.uniforms.slicer.value +
            x.deltaY / Math.abs(x.deltaY)
        );
      },
      (e) => console.error(e)
    );

    loadStubData(StubImage3D.ct).then(
      (x) => {
        console.log(x);
        this.setImage(x);
      },
      (e) => console.error(e)
    );
    loadColormap(Textures.gray).then();
    // const array = new Float32Array(1000000);
    // for (let i = 10000; i < 11000; i++) {
    //   array[i] = 0.9;
    // }
    // const imageT = makeTexture3d(array, 100, 100, 100);
    // this.shaderMaterial.uniforms.img.value = imageT;
    // console.log(imageT)
  }
  setImage(img: Image3D) {
    // this.shaderMaterial.uniforms.img.value = img;
    this.shaderMaterial.uniforms.img.value = makeTexture3d(
      transform16to32(img.data),
      img.shape.x,
      img.shape.y,
      img.shape.z
    );
    this.shaderMaterial.uniforms.pixelSize.value = img.pixelSize;
    this.shaderMaterial.uniforms.shape.value = img.shape;
  }
  setColormap(c: Texture) {}
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  aninmate() {
    requestAnimationFrame(() => this.aninmate());
    this.render();
  }
  updateSlicer(s: number) {
    this.shaderMaterial.uniforms.slicer.value = s;
    console.log(s);
  }

  forMonocle() {
    interface Street {
      num: number;
      name: string;
    }
    interface Address {
      city: string;
      street: Street;
    }
    interface Company {
      name: string;
      address: Address;
    }
    interface Employee {
      name: string;
      company: Company;
    }
    const employee: Employee = {
      name: 'john',
      company: {
        name: 'awesome inc',
        address: {
          city: 'london',
          street: {
            num: 23,
            name: 'high street',
          },
        },
      },
    };

    const capitalize = (s: string): string =>
      s.substring(0, 1).toUpperCase() + s.substring(1);

    const employeeCapitalized = {
      ...employee,
      company: {
        ...employee.company,
        address: {
          ...employee.company.address,
          street: {
            ...employee.company.address.street,
            name: capitalize(employee.company.address.street.name),
          },
        },
      },
    };

    const capitalizeName = pipe(
      L.id<Employee>(),
      L.prop('company'),
      L.prop('address'),
      L.prop('street'),
      L.prop('name'),
      L.modify(capitalize)
    );

    console.log(capitalizeName(employee), employeeCapitalized);
    // assert.deepStrictEqual(capitalizeName(employee), employeeCapitalized);

    const firstLetterOptional: O.Optional<string, string> = {
      getOption: (s) => (s.length > 0 ? some(s[0]) : none),
      set: (a) => (s) => s.length > 0 ? a + s.substring(1) : s,
    };

    const firstLetter = pipe(
      L.id<Employee>(),
      L.prop('company'),
      L.prop('address'),
      L.prop('street'),
      L.prop('name'),
      L.composeOptional(firstLetterOptional)
    );

    // assert.deepStrictEqual(
    //   pipe(
    //     firstLetter,
    //     O.modify((s) => s.toUpperCase())
    //   )(employee),
    //   employeeCapitalized
    // );
    console.log(
      pipe(
        firstLetter,
        O.modify((s) => s.toUpperCase())
      )(employee),
      employeeCapitalized
    );
  }

  // updateImage3D(d: InfoConcernDicom, max: number): Image3D {
  //   if (d.numberOfFrames > 1) {
  //     throw Error('xx');
  //   }
  //   const shape = new Vector3(d.columns, d.rows, max);
  //   const pixelSize = new Vector3(
  //     d.pixelSpacing[0],
  //     d.pixelSpacing[1],
  //     d.sliceThickness
  //   );
  //   const x = d.imagePosition[0] + (shape.x / 2) * pixelSize.x;
  //   const y = d.imagePosition[1] + (shape.y / 2) * pixelSize.y;
  //   const z = d.imagePosition[2] + (shape.z / 2) * pixelSize.z;
  //   // const z = d.sliceLocation;
  //   const center = new Vector3(x, y, z);
  //   const length = shape.x * shape.y * shape.z;
  //   const index = d.instanceNumber;

  //   const start = (shape.x - 1) * (shape.y - 1) * (index - 1);

  //   const arrayConstructor = getDataType(d.pixelRepresentation, d.bitStored);
  //   // const origin = new arrayConstructor(this.data.buffer);
  //   const newArray = new arrayConstructor(d.pixelData.buffer);

  //   const dtype = 'uint16';
  //   const tag = 'image';

  //   console.log(d, length, index, start);
  //   if (origin.length === length) {
  //     origin.set(newArray, start);
  //     return { shape, pixelSize, center, dtype, data: origin, tag };
  //   } else {
  //     const newData = new arrayConstructor(length);
  //     console.log(origin, newData, newArray);
  //     newData.set(origin);
  //     newData.set(newArray, start);
  //     // this.data = new Uint8Array(newData.buffer);
  //     return { shape, pixelSize, center, dtype, data: newData, tag };
  //   }
  // }
}
