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
  CircleBufferGeometry,
  Matrix4,
  Matrix3,
  Line,
  BufferGeometry,
  Group,
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

import * as I from 'monocle-ts/lib/Iso';
import * as T from 'monocle-ts/Traversal';
import * as lodash from 'lodash';
import { StoreByArray, WithId } from '../share/store';
import {
  Drag,
  editMeasureLine2d,
  MeasureLine2d,
  MeasureLine2dState,
} from './entity-2d-model';
import { measurelineEvent$, Mode } from './entity-event';
import { number } from 'fp-ts';
import { Iso } from 'monocle-ts';

import * as generics from '../ts-docs/generics';
import { Maybe } from '../share/maybe';
// import { drawEvent$, Entity2d } from './entity-geometry';

import * as eg from './entity-geometry';

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

  renderer?: WebGLRenderer;
  orbit?: OrbitControls;
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

  canvas?: HTMLCanvasElement;

  mouse$?: Rx.Observable<{ x: number; y: number }>;

  toolStore = new StoreByArray<WithId, MeasureLine2d>();

  modeSubject = new Subject<Mode>();
  modeRealOptionSubject = new Rx.BehaviorSubject<eg.ModeRealOption>('select');

  modeRealSubject = new Rx.BehaviorSubject<eg.ModeReal>({
    mode: eg.Mode.select,
  });

  // modeReal$ = this.modeRealSubject.asObservable().pipe(Ro.share());
  modeRealOption$ = this.modeRealOptionSubject.pipe(Ro.shareReplay());
  modeReal$ = this.modeRealOption$.pipe(Ro.map(eg.optionToModeReal));

  modeRealOptions: eg.ModeRealOption[] = [
    'select',
    'draw measure line',
    'draw angle',
    'draw cobe angle',
    'draw roi rectangle',
    'draw roi elipse',
  ];

  entityStore = new StoreByArray<WithId, eg.Entity2d>();
  entities$ = this.entityStore.state$.pipe(Ro.shareReplay());
  editingEntities$ = this.entities$.pipe(
    Ro.map((es) => es.filter((e) => e.editing)),
    Ro.filter((es) => es.length > 0),
    Ro.distinctUntilChanged((a, b) => lodash.isEqual(a, b)),
    Ro.shareReplay()
  );
  @ViewChild('canvas', { static: true }) set canvasRef(
    c: ElementRef<HTMLCanvasElement>
  ) {
    console.log(c);
    this.canvas = c.nativeElement;
  }

  @ViewChild('toRemove', { static: true }) toReomve!: ElementRef<HTMLElement>;

  @ViewChild('fileSelector', { static: true })
  fileSelector?: ElementRef<HTMLInputElement>;

  constructor(private ef: ElementRef, rendererFactory: RendererFactory2) {
    this.entities$.subscribe(
      (x) => {},
      (e) => console.error(e)
    );
    console.log(lodash.isNaN(Infinity - 100));
    const interval = Rx.interval(1000);
    const first = interval.pipe(Ro.first());
    const cancel = interval.pipe(Ro.filter((x) => x === 3));

    // cancel.subscribe(
    //   (x) => console.log(x),
    //   (e) => console.error(e)
    // );
    interval.pipe(
      Ro.windowToggle(first, () => cancel),
      Ro.switchAll()
    );
    // .subscribe(
    //   (x) => console.log(x),
    //   (e) => console.error(e)
    // );

    const move$ = fromEvent<MouseEvent>(document.body, 'mousemove');

    move$.pipe(
      Ro.windowToggle(move$.pipe(Ro.first()), () =>
        move$.pipe(Ro.filter((x) => x.clientY > 500))
      ),
      Ro.switchAll()
    );
    // .subscribe(
    //   (x) => console.log(x),
    //   (e) => console.error(e)
    // );

    // interval.subscribe(
    //   (x) => console.log(x),
    //   (e) => console.error(e)
    // );

    const maybeTest: Maybe<number> = null;
    console.log(maybeTest?.be);

    interface TestProperty {
      x: number;
      y: number;
    }
    console.log(new Vector2(1, -1).angle());

    console.log(generics.l);
    console.log(generics.l2);

    const xxxx = { '1': 1, '2': 2 };
    console.log(xxxx[0]);
    console.log(xxxx[1]);
    console.log(xxxx[2]);

    type A = { x: number; y: number };
    type B = { x: number };

    type C = A extends B ? string : number;

    const xx = { x: 100, y: 200 };
    for (let i in xx) {
      console.log(i);
    }

    function xxx() {
      var mmm = 1;
      if (true) {
        var xxxx = 2;
      }
      return xxxx;
    }
    xxx();

    enum aa {
      'xxx' = 'x0',
      y = 'y0',
      z = 1,
    }
    for (let i in aa) {
      console.log(i);
      console.log(i === 'xxx');
      console.log(typeof i);
    }
    const point = new Vector2(1, 0);
    const r = new Matrix3().rotate(Math.PI * 0.5);
    const t = new Matrix3().translate(1, 0);

    const affine = r.clone().multiply(t);
    const affine2 = t.clone().multiply(r);

    const result1 = point.clone().applyMatrix3(affine);
    const result2 = point.clone().applyMatrix3(affine2);

    console.log(result1, result2);
    console.log(t, t.clone().invert());
    console.log(
      new Vector2(1, 0).angle(),
      new Vector2(0, 1).angle(),
      new Vector2(0, -1).angle(),
      new Vector2(1, -0.00001).angle(),
      new Vector2(1, 0).applyMatrix3(r).angle()
    );

    const line1 = new Vector2(1, 0);
    window['line1'] = line1;

    const s2nISO = I.iso(
      (s: string) => parseFloat(s),
      (n: number) => n.toString()
    );

    const n2sIso = I.reverse(s2nISO);
    const s2nOption = I.asOptional(s2nISO);
    const n2n = I.id();

    const n2sTranversal = T.id();

    // const n2sOption = O.optional( (s:number) =>  )
    console.log(I.Category);
    console.log(s2nISO.get('123a'));
    console.log(n2sIso.get(123));
    console.log(n2n.get(1));

    window['I'] = I;
    window['s2nISO'] = s2nISO;
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
    this.scene.add(this.plane);
    // this.renderer.render(this.scene, this.camera);
  }

  setModeReal(option: eg.ModeRealOption) {
    this.modeRealOptionSubject.next(option);
  }
  loadFile(event: InputEvent) {
    console.log(event);
    console.log(this.fileSelector!.nativeElement);
    console.log(this.fileSelector!.nativeElement.files);
    if (this.fileSelector !== null && this.fileSelector !== undefined) {
      const l = this.fileSelector.nativeElement.files!.length;

      const files = this.fileSelector.nativeElement.files!;
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
  showToolStore() {
    console.log(this.toolStore.currentState());
    console.log(this.entityStore.currentState());
    console.log(this.scene.children);
  }
  ngOnInit(): void {
    interface xx {
      a: number;
      b?: number;
    }

    const aa: Required<xx> = { a: 1, b: 2 };
    const bb: xx = { a: 1 };
    // const x = (v: Maybe<number>) => {
    //   v.be;
    // };

    // Rx.interval(1000)
    //   .pipe(
    //     Ro.groupBy(
    //       (i) => i % 3,
    //       (i) => i,
    //       (g) => g.pipe(Ro.take(2))
    //     ),
    //     Ro.mergeMap((i) => {
    //       console.log(i.key);
    //       return i;
    //     })
    //   )
    //   .subscribe(
    //     (x) => console.log(x),
    //     (e) => console.error(e)
    //   );
    console.log(this.canvas);
    console.log(this.toReomve);
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      context: this.canvas!.getContext('webgl2', {
        alpha: true,
        antialias: true,
      })!,
    });
    // this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setSize(1000, 1000);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera = new OrthographicCamera(-500, 500, -500, 500);

    this.camera.position.z = 1000;

    // this.scene.add(this.plane);
    this.renderer.render(this.scene, this.camera);
    console.log(this.plane);
    printMatrix4(this.plane.matrixWorld);
    const a = new Vector3();
    a.setFromMatrixPosition(this.plane.modelViewMatrix);
    console.log(a);

    console.log(this.camera);

    this.forMonocle();
    // this.ef.nativeElement.appendChild(this.renderer.domElement);
    this.aninmate();
    fromEvent(this.ef.nativeElement, 'mousewheel').subscribe(
      (x) => {
        // x.preventDefault();
        const xx = x as WheelEvent;
        this.updateSlicer(
          this.shaderMaterial.uniforms.slicer.value +
            xx.deltaY / Math.abs(xx.deltaY)
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

    const down$ = fromEvent(
      document.body,
      'mousedown'
    ) as Rx.Observable<MouseEvent>;
    const move$ = fromEvent(
      document.body,
      'mousemove'
    ) as Rx.Observable<MouseEvent>;
    const up$ = fromEvent(document.body, 'mouseup').pipe(
      // (e) => Rx.merge(e, Rx.of('cancel'))
      Ro.mergeMap((e) => Rx.merge(Rx.of(e), Rx.of('cancel')))
    ) as Rx.Observable<MouseEvent | 'cancel'>;
    const cancelUp$ = up$.pipe(Ro.filter((x) => x === 'cancel'));
    const eventUp$ = up$.pipe(
      Ro.filter((x) => x !== 'cancel')
    ) as Rx.Observable<MouseEvent>;

    const leave$ = fromEvent(
      document.body,
      'mouseleave'
    ) as Rx.Observable<MouseEvent>;

    const body$ = Rx.merge(down$, move$, eventUp$);

    const cancel$ = Rx.merge(eventUp$);
    body$.pipe(
      Ro.windowToggle(down$, () => eventUp$),
      Ro.mergeAll()
    );
    // .subscribe(
    //   (x) => console.log(x.type),
    //   (e) => console.error(e)
    // );

    // down$
    //   .pipe(
    //     Ro.switchMap(
    //       (d) =>
    //         move$
    //           .pipe(
    //             Ro.startWith(d),
    //             Ro.takeUntil(cancelUp$)

    //             // Ro.endWith({ type: 'up' })
    //           )
    //           .pipe((f) => Rx.merge(f, f.pipe(Ro.last())))
    //       // Rx.concat(
    //       //   move$.pipe(Ro.takeUntil(cancelUp$)),
    //       //   eventUp$.pipe(Ro.take(1))
    //       // ).pipe(Ro.startWith(d))
    //     )
    //   )
    //   .subscribe(
    //     (x) => console.log(x.type),
    //     (e) => console.error(e)
    //   );

    const point = new Mesh(
      new CircleBufferGeometry(10),
      new MeshBasicMaterial({ side: DoubleSide, color: new Color('red') })
    );

    const pointGreen = new Mesh(
      new CircleBufferGeometry(10),
      new MeshBasicMaterial({ side: DoubleSide, color: new Color('green') })
    );

    const point2 = point.clone();
    const point3 = point.clone();

    new Vector3(-1, 1, 0).unproject(this.camera);
    pointGreen.position.set(100, 100, 0);
    // pointGreen.geometry.translate(100, 0, 0);
    this.scene.add(point, point2, point3, pointGreen);
    this.mouse$ = fromEvent<MouseEvent>(
      this.renderer.domElement,
      'mousemove'
    ).pipe(Ro.map((m) => ({ x: m.offsetX - 500, y: m.offsetY - 500 })));

    const point$ = this.mouse$.pipe(Ro.map((p) => new Vector3(p.x, p.y, 0)));

    const mode$ = Rx.of(Mode.draw);

    const entities$ = Rx.of([1, 2, 3]);
    const isOn = (n: number, p: Vector3) => p.x / n > 50;

    const mouseOnEntities$ = Rx.combineLatest(point$, entities$).pipe(
      Ro.map(([p, es]) => es.filter((e) => isOn(e, p)).sort()),
      Ro.map((es) => (es.length > 0 ? es[es.length - 1] : 0))
    );

    const drag$ = new Rx.Observable<{
      tag: 'mousedown' | 'mousemove' | 'mouseup';
      origin: Vector3;
      current: Vector3;
      last: Vector3;
    }>((o) => {
      o.next({
        tag: 'mousedown',
        current: new Vector3(),
        origin: new Vector3(),
        last: new Vector3(),
      });
    });

    const editEntities = (
      edit: (
        current: number,
        selected: number,
        drag: {
          tag: 'mousedown' | 'mousemove' | 'mouseup';
          origin: Vector3;
          current: Vector3;
          last: Vector3;
        }
      ) => { current: number; selected: number }
    ) =>
      drag$.pipe(
        Ro.withLatestFrom(mouseOnEntities$),
        Ro.scan(
          (
            acc: {
              current: number;
              selected: number;
            },
            cur: [
              {
                tag: 'mousedown' | 'mousemove' | 'mouseup';
                origin: Vector3;
                current: Vector3;
                last: Vector3;
              },
              number
            ]
          ) => {
            const ns = edit(acc.current, cur[1], cur[0]);
            const result = { current: ns.current, selected: ns.selected };
            return result;
          }
        )
      );

    const drawEntity = (
      draw: (
        n: number,
        d: {
          tag: 'mousedown' | 'mousemove' | 'mouseup';
          origin: Vector3;
          current: Vector3;
          last: Vector3;
        }
      ) => number
    ) =>
      drag$.pipe(
        Ro.scan(
          (
            acc: {
              entity: number;
            },
            cur: {
              tag: 'mousedown' | 'mousemove' | 'mouseup';
              origin: Vector3;
              current: Vector3;
              last: Vector3;
            }
          ) => {
            return { entity: draw(acc.entity, cur) };
          }
        )
      );

    const editFunc = (
      current: number,
      selected: number,
      drag: {
        tag: 'mousedown' | 'mousemove' | 'mouseup';
        origin: Vector3;
        current: Vector3;
        last: Vector3;
      }
    ) => ({ current, selected });

    const drawFunc = (
      n: number,
      d: {
        tag: 'mousedown' | 'mousemove' | 'mouseup';
        origin: Vector3;
        current: Vector3;
        last: Vector3;
      }
    ) => n;
    const selectMode$ = mode$.pipe(
      Ro.switchMap((m) => (m === 'draw' ? Rx.EMPTY : editEntities(editFunc)))
    );
    const drawMode$ = mode$.pipe(
      Ro.switchMap((m) => (m === 'select' ? Rx.EMPTY : drawEntity(drawFunc)))
    );

    mouseOnEntities$.subscribe(
      (x) => {},
      (e) => console.error(e)
    );

    point$.pipe(Ro.bufferCount(3, 1)).subscribe(
      (p) => {
        // point.position.set(p[0].x, p[0].y, 0);
        // point2.position.set(p[1].x, p[1].y, 0);
        // point3.position.set(p[2].x, p[2].y, 0);

        [point, pointGreen].forEach((m) => {
          if (m.position.distanceTo(p[0]) < 15) {
            m.position.set(p[0].x, p[0].y, 0);
          }
        });

        if (p[0].distanceTo(pointGreen.position) < 15) {
          pointGreen.position.add(
            pointGreen.position.clone().add(p[0].clone().multiplyScalar(-1))
          );
        }
      },
      (e) => console.error(e)
    );

    fromEvent<MouseEvent>(this.renderer.domElement, 'mousedown').subscribe(
      (x) => {
        const client = new Vector3(
          (x.offsetX - 500) / 500,
          (x.offsetY - 500) / 500,
          0
        );
        // const worldVector = client.unproject(this.camera);
        // console.log(worldVector);
      },
      (e) => console.error(e)
    );

    const measueline1 = new MeasureLine2d(
      new Vector2(-250, -250),
      new Vector2(0, 0),
      'm1',
      3
    );
    const measueline2 = new MeasureLine2d(
      new Vector2(250, 250),
      new Vector2(100, 100),
      'm2',
      2
    );

    const m1 = {
      start: new Mesh(
        new CircleBufferGeometry(10),
        new MeshBasicMaterial({ side: DoubleSide, color: new Color('blue') })
      ),
      end: new Mesh(
        new CircleBufferGeometry(10),
        new MeshBasicMaterial({ side: DoubleSide, color: new Color('white') })
      ),
      line: new Line(
        new BufferGeometry().setFromPoints([
          new Vector3(-100, -100, 0),
          new Vector3(100, 100, 0),
        ]),
        new MeshBasicMaterial({ side: DoubleSide, color: new Color('green') })
      ),
    };
    const m2 = {
      start: new Mesh(
        new CircleBufferGeometry(10),
        new MeshBasicMaterial({ side: DoubleSide, color: new Color('red') })
      ),
      end: new Mesh(
        new CircleBufferGeometry(10),
        new MeshBasicMaterial({ side: DoubleSide, color: new Color('black') })
      ),
      line: new Line(
        new BufferGeometry().setFromPoints([
          new Vector3(-100, -100, 0),
          new Vector3(100, 100, 0),
        ]),
        new MeshBasicMaterial({ side: DoubleSide, color: new Color('green') })
      ),
    };
    // this.toolStore.insertMany([measueline1, measueline2]).subscribe(
    //   (x) => console.log(x),
    //   (e) => console.error(e)
    // );

    // this.scene.add(m1.start, m1.end, m1.line);
    // this.scene.add(m2.start, m2.end, m2.line);

    // const m1$ = this.toolStore.state$.pipe(
    //   Ro.map((ms) => ms.find((m) => m.id === 'm1')),
    //   Ro.distinctUntilChanged()
    // );

    // const m2$ = this.toolStore.state$.pipe(
    //   Ro.map((ms) => ms.find((m) => m.id === 'm2')),
    //   Ro.distinctUntilChanged()
    // );

    const parseMeasurelineFunc = (
      m: MeasureLine2d,
      entity: { start: Mesh; end: Mesh; line: Line }
    ) => {
      const s = m.start.clone().applyMatrix3(m.modelMatrix);
      const start_position = new Vector3(s.x, s.y, 0);
      const e = m.end.clone().applyMatrix3(m.modelMatrix);
      const end_position = new Vector3(e.x, e.y, 0);

      entity.start.position.set(s.x, s.y, 0);
      entity.end.position.set(e.x, e.y, 0);
      entity.line.geometry = new BufferGeometry().setFromPoints([
        start_position,
        end_position,
      ]);
    };

    // m1$.subscribe(
    //   (m) => {
    //     parseMeasurelineFunc(m, m1);
    //   },
    //   (e) => console.error(e)
    // );
    // m2$.subscribe(
    //   (m) => {
    //     parseMeasurelineFunc(m, m2);
    //   },
    //   (e) => console.error(e)
    // );

    const singleDrag$ = this.createDrag2(this.renderer.domElement);
    const continuouseDrag$ = this.createDrag2(this.renderer.domElement, true);

    const nullSubject = new Subject<null>();

    // this.createDrag2(
    //   this.renderer.domElement,
    //   nullSubject.asObservable()
    // ).subscribe(
    //   (x) => console.log(x),
    //   (e) => console.error(e)
    // );

    const a1 = '1';
    const b1 = 2;
    const condition = ['1', 2];
    switch (true) {
      case ['1', 2] === ['1', 2]: {
        console.log('asdasdasd');
      }
      case a1 === '1' && b1 === 2: {
        console.log('case2');
      }
      default:
        console.log('default');
    }

    const condition2 = { a: '1', b: 2 };
    switch (condition2) {
      case { a: '1', b: 2 }: {
        console.log('case1');
      }
      default: {
        console.log('default1');
      }
    }

    const measureline$ = measurelineEvent$(
      this.toolStore.state$,
      this.mouse$.pipe(Ro.map((m) => new Vector2(m.x, m.y))),
      singleDrag$,
      this.modeSubject.asObservable()
    );

    // const eventDrawEntity$ = this.modeSubject.asObservable().pipe(
    //   Ro.tap((x) => console.log(x)),
    //   Ro.switchMap((m) =>
    //     m === Mode.draw
    //       ? eg.drawEvent$(
    //           eg.EntityModelName.measureline,
    //           this.createDrag2(this.renderer.domElement, true)
    //         )
    //       : Rx.EMPTY
    //   )
    // );

    const eventDrawEntity$ = eg.drawEvent$(continuouseDrag$, this.modeReal$);

    const eventEditEntity$ = eg.editEvent$(
      this.entityStore.state$,
      this.mouse$.pipe(Ro.map((m) => new Vector2(m.x, m.y))),
      singleDrag$,
      this.modeReal$
    );

    const testI = Rx.interval(100);
    const testI2 = Ro.delay(1000)(Rx.interval(1000));

    measureline$.eventEdit$.subscribe(
      (x) => {
        // console.log('edit: ', x);
        // if (x.operationOn?.be) {
        //   this.toolStore.update(x.operationOn.value).subscribe(
        //     (x) => console.log(x),
        //     (e) => console.error(e)
        //   );
        // }
      },
      (e) => console.error(e)
    );

    measureline$.eventDraw$.subscribe(
      (x) => {
        // console.log('draw: ', x);
        // if (x.operationOn?.be) {
        //   this.toolStore.upsertMany(x.operationOn.value).subscribe(
        //     (x) => console.log(x),
        //     (e) => console.error(e)
        //   );
        // }
        // if (x.cancelOn?.be) {
        //   this.scene.remove(this.scene.getObjectByName(x.cancelOn.value.id));
        //   this.toolStore.remove(x.cancelOn.value).subscribe(
        //     (x) => console.log(x),
        //     (e) => console.error(e)
        //   );
        // }
        // if (x.finished) {
        //   this.setMode(Mode.select);
        // }
      },
      (e) => console.error(e)
    );

    eventEditEntity$.subscribe(
      (x) => {
        // console.log('edit: ', x);
        if (x.operationOn?.be) {
          this.entityStore.update(x.operationOn.value).subscribe(
            (x) => console.log(x),
            (e) => console.error(e)
          );
        }
        if (x.last?.be) {
          this.entityStore.update(x.last.value).subscribe(
            (x) => console.log(x),
            (e) => console.error(e)
          );
        }
      },
      (e) => console.error(e)
    );

    eventDrawEntity$.subscribe(
      (x) => {
        console.log('draw: ', x);
        if (x.operationOn?.be) {
          this.entityStore.upsertMany(x.operationOn.value).subscribe(
            (x) => console.log(x),
            (e) => console.error(e)
          );
        }
        if (x.cancelOn?.be) {
          this.scene.remove(this.scene.getObjectByName(x.cancelOn.value.id));
          this.entityStore.remove(x.cancelOn.value).subscribe(
            (x) => console.log(x),
            (e) => console.error(e)
          );
        }
        if (x.finished) {
          // this.setMode(Mode.select);

          this.setModeReal('select');
        }
      },
      (e) => console.error(e)
    );
    const observableOnId = <T extends { id: string }>(
      store: StoreByArray<WithId, T>,
      id: string
    ) =>
      store.state$.pipe(
        Ro.map((ts) => ts.find((t) => t.id === id)),
        Ro.takeWhile((x) => x !== undefined),
        Ro.distinctUntilChanged()
      );

    const changeStore$ = <T extends { id: string }>(
      store: StoreByArray<WithId, T>
    ): Rx.Observable<T> =>
      store.state$.pipe(
        Ro.map((ts) => ts.map((t) => t.id)),
        Ro.distinctUntilChanged((a, b) => lodash.isEqual(a, b)),
        Ro.mergeMap((ts) => Rx.merge(...ts.map((t) => Rx.of(t)))),
        Ro.groupBy(
          (t) => t,
          (t) => t,
          (g) => g.pipe(Ro.switchMap((i) => observableOnId(store, i)))
        ),
        Ro.mergeMap((i$) =>
          i$.pipe(
            Ro.distinctUntilChanged(),
            Ro.mergeMap((i) => observableOnId(store, i))
          )
        )
      );

    const changeTool$ = changeStore$(this.toolStore);
    const changeEntity$ = changeStore$(this.entityStore);

    console.log(this.scene);
    changeTool$.subscribe(
      (t) => {
        // console.log(t);
        const group = this.scene.getObjectByName(t.id);
        const m =
          group === undefined
            ? {
                start: new Mesh(
                  new CircleBufferGeometry(10),
                  new MeshBasicMaterial({
                    side: DoubleSide,
                    color: new Color('red'),
                  })
                ),
                end: new Mesh(
                  new CircleBufferGeometry(10),
                  new MeshBasicMaterial({
                    side: DoubleSide,
                    color: new Color('black'),
                  })
                ),
                line: new Line(
                  new BufferGeometry().setFromPoints([
                    new Vector3(-100, -100, 0),
                    new Vector3(100, 100, 0),
                  ]),
                  new MeshBasicMaterial({
                    side: DoubleSide,
                    color: new Color('green'),
                  })
                ),
              }
            : {
                start: group.getObjectByName('start') as Mesh,
                end: group.getObjectByName('end') as Mesh,
                line: group.getObjectByName('line') as Line,
              };
        m.start.name = 'start';
        m.end.name = 'end';
        m.line.name = 'line';
        parseMeasurelineFunc(t, m);

        if (group === undefined) {
          console.log('scene', this.scene);
          const newGroup = new Group();
          newGroup.name = t.id;
          newGroup.add(m.start, m.end, m.line);
          this.scene.add(newGroup);
        }
      },
      (e) => console.error(e)
    );

    changeEntity$.subscribe(
      (e) => {
        let group = this.scene.getObjectByName(e.id);
        const baseModels = e.baseModel();
        const keys = Object.keys(baseModels);
        type temp = { [Property in keyof typeof baseModels]: string };
        // console.log(keys);
        const matrix = this.matrix3ToMatirx4(e.modelMatrix);
        if (group === undefined) {
          group = new Group();
          group.name = e.id;
          keys.map((key) => {
            const baseModel = baseModels[key];
            // const geometry = eg.toGeometry(baseModel);
            // // const material = this.getMeshBasicMaterial(new Color('green'));
            // const material = new MeshBasicMaterial({
            //   color: new Color('red'),
            //   // side: DoubleSide,
            // });
            // const mesh = new Mesh(geometry, material);
            const mesh = eg.toMesh(baseModel);
            mesh.name = key;
            group.add(mesh);
          });
          this.scene.add(group);
        } else {
          keys.map((key) => {
            const baseModel = baseModels[key];
            const entity = group.getObjectByName(key) as Mesh;

            entity.geometry.dispose();
            entity.geometry = eg.toGeometry(baseModel);
          });
        }
        // group.applyMatrix4(group.matrix.clone().invert().multiply(matrix));
        group.applyMatrix4(
          matrix.clone().multiply(group.matrix.clone().invert())
        );
        // group.position.set(100, 100, 0);
        // group.matrix.copy(matrix);
        // group.updateMatrix();
        // group.modelViewMatrix.copy(matrix);
        // group.matrixWorld.copy(matrix);
        // group.matrixWorldNeedsUpdate = true;
      },
      (e) => console.error(e)
    );
    const testArray = new Matrix3().translate(10, 0).toArray();
    console.log(testArray);
  }

  matrix3ToMatirx4(m3: Matrix3) {
    const m3Array = m3.toArray();
    const m4Array = new Matrix4().toArray();
    m4Array[0] = m3Array[0];
    m4Array[1] = m3Array[1];
    m4Array[4] = m3Array[3];
    m4Array[5] = m3Array[4];

    m4Array[3] = m3Array[2];
    m4Array[7] = m3Array[5];
    m4Array[12] = m3Array[6];
    m4Array[13] = m3Array[7];

    m4Array[15] = m3Array[8];

    return new Matrix4().fromArray(m4Array);
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
    this.renderer!.render(this.scene, this.camera);
  }
  aninmate() {
    requestAnimationFrame(() => this.aninmate());
    this.render();
  }
  updateSlicer(s: number) {
    this.shaderMaterial.uniforms.slicer.value = s;
    console.log(s);
  }

  setMode(value: Mode) {
    console.log(value === 'select', value === Mode.select);
    const m = value === 'select' ? Mode.select : Mode.draw;
    this.modeSubject.next(m);
  }

  select(id: string) {
    const entity = this.entityStore.currentState().find((e) => e.id === id);
    this.entityStore
      .upsertMany(entity?.setOptions({ editing: !entity.editing }))
      .subscribe(
        (x) => console.log('remove: ', x),
        (e) => console.error(e)
      );
  }
  // removeEntityById(id: string) {
  //   this.entityStore
  //     .get$({ id })
  //     .pipe(Ro.switchMap((e) => this.entityStore.remove(e)))
  //     .subscribe(
  //       (x) => console.log('remove: ', x),
  //       (e) => console.error(e)
  //     );
  // }
  removeEntitiesFromScene(entities: eg.Entity2d[]) {
    const groups = entities
      .map((e) => this.scene.getObjectByName(e.id))
      .filter((e) => !lodash.isNil(e)) as Group[];
    const geomeries = lodash.flatten(
      groups.map((g) => g.children.map((m) => (m as Mesh).geometry))
    );
    geomeries.forEach((g) => {
      if (g) {
        g.dispose();
      }
    });
    this.scene.remove(...groups);
  }
  removeEditing() {
    const entities = this.entityStore.currentState().filter((e) => e.editing);
    this.entityStore.removeMany(...entities).subscribe(
      (x) => console.log('remove: ', x),
      (e) => console.error(e)
    );
    this.removeEntitiesFromScene(entities);
  }

  // removeEntities(es: eg.Entity2d[]) {
  //   this.entityStore.removeMany(...es).subscribe(
  //     (x) => console.log(x),
  //     (e) => console.error(e)
  //   );
  //   const groups = es
  //     .map((e) => this.scene.getObjectByName(e.id))
  //     .filter((e) => !lodash.isNil(e)) as Group[];
  //   const geomeries = lodash.flatten(
  //     groups.map((g) => g.children.map((m) => (m as Mesh).geometry))
  //   );
  //   console.log(groups);
  //   geomeries.forEach((g) => {
  //     if (g) {
  //       g.dispose();
  //     }
  //   });
  //   this.scene.remove(...groups);
  // }
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

  // creatDragWithCancel(element:HTMLElement,cance) {}

  createDrag2(element: HTMLElement, isContinuous: boolean = false) {
    const down$ = fromEvent(element, 'mousedown') as Rx.Observable<MouseEvent>;
    const move$ = fromEvent(element, 'mousemove') as Rx.Observable<MouseEvent>;
    const up$ = fromEvent(
      element,
      'mouseup'
    ).pipe() as Rx.Observable<MouseEvent>;
    const leave$ = fromEvent(
      element,
      'mouseleave'
    ) as Rx.Observable<MouseEvent>;

    // const cancel = cancel$ === undefined ? Rx.merge(up$, leave$) : cancel$;
    const cancel$ = Rx.merge(up$, leave$);

    const body$ = Rx.merge(down$, move$, cancel$);
    const singleDrag$ = body$.pipe(
      Ro.windowToggle(down$, () => cancel$),
      Ro.mergeAll()
    );
    const continuouseDrag$ = down$.pipe(
      Ro.switchMap((d) => body$.pipe(Ro.startWith(d)))
    );

    const f$ = (isContinuous ? continuouseDrag$ : singleDrag$).pipe(
      Ro.scan(
        (
          acc: {
            origin: Vector2;
            current: Vector2;
            last: Vector2;
            tag: string;
          },
          cur: MouseEvent
        ) => ({
          origin:
            cur.type === 'mousedown'
              ? new Vector2(cur.offsetX - 500, cur.offsetY - 500)
              : acc.origin,
          last:
            cur.type === 'mousedown'
              ? new Vector2(cur.offsetX - 500, cur.offsetY - 500)
              : acc.current,
          tag: cur.type === 'mouseleave' ? 'mouseup' : cur.type,
          current: new Vector2(cur.offsetX - 500, cur.offsetY - 500),
          // last: acc.current,
        }),
        {
          origin: new Vector2(0, 0),
          current: new Vector2(0, 0),
          last: new Vector2(0, 0),
          tag: 'mousedown',
        }
      )
      // )
      // )
    );

    return f$;
  }

  getMeshBasicMaterial(color: Color) {
    return new MeshBasicMaterial({ color, side: DoubleSide });
  }
  createDrag(element: HTMLElement) {
    const down$ = fromEvent(element, 'mousedown') as Rx.Observable<MouseEvent>;
    const move$ = fromEvent(element, 'mousemove') as Rx.Observable<MouseEvent>;
    const up$ = fromEvent(
      element,
      'mouseup'
    ).pipe() as Rx.Observable<MouseEvent>;
    const leave$ = fromEvent(
      element,
      'mouseleave'
    ) as Rx.Observable<MouseEvent>;
    const cancel = Rx.merge(up$, leave$).pipe(Ro.tap((x) => console.log(x)));
    // const f1$ = Ro.windowToggle(Rx.merge(down$, move$, cancel), (i) =>
    //   ['mouseup', 'mouseleave'].includes(i.type)?
    // );
    const f$: Rx.Observable<Drag> = down$.pipe(
      Ro.switchMap((d: MouseEvent) => {
        return Rx.merge(move$)
          .pipe(
            Ro.takeUntil(cancel),
            Ro.startWith(d),
            Ro.map((c: MouseEvent) => {
              return {
                origin: new Vector2(d.offsetX - 500, d.offsetY - 500),
                current: new Vector2(c.offsetX - 500, c.offsetY - 500),
                last: new Vector2(c.offsetX - 500, c.offsetY - 500),
                tag: c.type,
              };
            }),
            scan(
              (acc, cur) => ({
                ...cur,
                // last: cur.tag === 'mousedown' ? cur.current : acc.current,
                last: acc.current,
              }),
              {
                origin: new Vector2(d.offsetX, d.offsetY),
                current: new Vector2(d.offsetX, d.offsetY),
                last: new Vector2(d.offsetX, d.offsetY),
                tag: d.type,
              }
            )
          )
          .pipe((f) =>
            Rx.merge(
              f,
              f.pipe(
                Ro.last(),
                Ro.map((x) => ({ ...x, tag: 'mouseup' }))
              )
            )
          );
      })
    );
    return f$;
  }
}
