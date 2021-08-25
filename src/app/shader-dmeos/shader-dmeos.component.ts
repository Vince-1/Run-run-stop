import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  Mesh,
  PlaneBufferGeometry,
  MeshBasicMaterial,
  Color,
  PlaneGeometry,
  BoxGeometry,
  PerspectiveCamera,
  ShaderMaterial,
  DataTexture,
  RedFormat,
  FloatType,
  NearestFilter,
  LinearFilter,
  Matrix4,
  Vector3,
  DoubleSide,
  FrontSide,
  BackSide,
  WebGLRenderTarget,
  DataTexture3D,
  BoxBufferGeometry,
  Vector2,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { fromEvent, throwError } from 'rxjs';
import { shaders } from '../share/shader-fragments';
import { makeTexture2d, makeArray, makeTexture3d } from '../share/utils';
import { ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { parseDicom } from 'dicom-parser';

@Component({
  selector: 'app-shader-dmeos',
  templateUrl: './shader-dmeos.component.html',
  styleUrls: ['./shader-dmeos.component.less'],
})
export class ShaderDmeosComponent implements OnInit, OnDestroy {
  width = 1000;
  height = 1000;
  scene = new Scene();
  camera = new OrthographicCamera(
    -this.width / 2,
    this.width / 2,
    -this.height / 2,
    this.height / 2
  );
  renderer: WebGLRenderer;
  orbit: OrbitControls;
  shaderM: ShaderMaterial;
  shaderCube: ShaderMaterial;
  cube: Mesh;
  plane: Mesh;

  bufferScene = new Scene();
  bufferTexture = new WebGLRenderTarget(800, 600, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
  });

  time = new Date().toString();

  imageTexture: DataTexture3D = makeTexture3d(makeArray(250000), 50, 50, 100);
  @ViewChild('cubeDemo', { static: true })
  demoCanvas: ElementRef<HTMLCanvasElement>;

  constructor(private ef: ElementRef) {
    // const canvas = document.createElement('canvas');
  }
  printMatrix4(m: Matrix4) {
    for (let i = 0; i < 4; i++) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        row.push(m.elements[i + j * 4]);
      }
      console.log(row.join(', '));
    }
  }
  ngOnInit(): void {
    const a = new Date();
    console.log(a, a.getMilliseconds());
    this.renderer = new WebGLRenderer({
      canvas: this.demoCanvas.nativeElement,
      context: this.demoCanvas.nativeElement.getContext('webgl2', {
        alpha: true,
        antialias: true,
      }),
    });
    // this.ef.nativeElement.appendChild(this.renderer.domElement);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.render(this.scene, this.camera);

    // this.shaderCube  = new Mesh()
    this.orbit = new OrbitControls(this.camera, this.renderer.domElement); // add orbit
    this.cube = new Mesh(
      new BoxBufferGeometry(300, 300, 300),
      new ShaderMaterial({
        uniforms: {
          img: { value: this.imageTexture },
          center: { value: new Vector3(0, 0, 0) },
          size: { value: new Vector3(300, 300, 300) },
          shape: { value: new Vector3(10, 10, 10) },
        },
        vertexShader: shaders.cube.vertex,
        fragmentShader: shaders.cube.frag,
        side: DoubleSide,
      })
    );
    this.shaderM = new ShaderMaterial({
      uniforms: {
        img: { value: makeTexture2d(makeArray(10000), 100, 100) },
        center: { value: new Vector2(0, 0) },
        size: { value: new Vector2(window.innerWidth, window.innerHeight) },
        shape: { value: new Vector2(100, 100) },
      },
      vertexShader: shaders.conway.vertex,
      fragmentShader: shaders.conway.frag,
      side: DoubleSide,
    });
    this.plane = new Mesh(
      new PlaneBufferGeometry(window.innerWidth, window.innerHeight),
      this.shaderM
    );

    this.camera.position.z = 1500;
    this.camera.up = new Vector3(0, 0, -1);
    // this.scene.background = new Color('black');
    this.renderer.render(this.scene, this.camera);

    // this.scene.add(this.cube);

    // this.scene.add(this.plane);

    this.animate();
    fromEvent(this.renderer.domElement, 'mousedown').subscribe(
      (x: MouseEvent) => {
        console.log(x);
        this.coordTrans(x);
      },
      (e) => console.error(e)
    );
  }

  ngOnDestroy(): void {
    this.ef.nativeElement.removeChild(this.renderer.domElement);
  }
  animate() {
    requestAnimationFrame(() => this.animate());
    this.time = new Date().toString();
    this.renderer.render(this.scene, this.camera);

    // this.renderer.setRenderTarget(this.bufferTexture);
    // this.renderer.render(this.bufferScene, this.camera);
  }

  makeTexture() {
    const [x, y, z] = [500, 500, 500];
    console.time('make array:');
    const data = makeArray(x * y * z, 'random');
    console.timeEnd('make array:');
    console.time('make texture:');

    const t = makeTexture3d(data, x, y, z);
    this.imageTexture = t;
    console.timeEnd('make texture:');
    // this.sh;
  }

  setTexture() {
    console.time('set texture');
    (this.cube.material as ShaderMaterial).uniforms['img'].value =
      this.imageTexture;
    console.timeEnd('set texture');
  }
  makeMesh() {
    console.time('makeMesh');
    const cube = new Mesh(
      new BoxBufferGeometry(300, 300, 300),
      new ShaderMaterial({
        uniforms: {
          img: { value: this.imageTexture },
          center: { value: new Vector3(0, 0, 0) },
          size: { value: new Vector3(300, 300, 300) },
          shape: { value: new Vector3(10, 10, 10) },
        },
        vertexShader: shaders.cube.vertex,
        fragmentShader: shaders.cube.frag,
        side: DoubleSide,
      })
    );
    console.timeEnd('makeMesh');
    console.time('toScene');
    this.scene.add(cube);
    console.timeEnd('toScene');
  }

  showMatrix() {
    console.log(
      'projection matrix: ',
      this.camera.projectionMatrix,
      this.camera.projectionMatrixInverse
    );
    console.log('world matrix: ', this.plane.matrix, this.plane.matrixWorld);
    console.log('modelView matrix: ', this.plane.modelViewMatrix);
    console.log(
      'test: ',
      new Matrix4().multiplyMatrices(
        this.plane.matrixWorld,
        this.camera.projectionMatrixInverse
      )
    );
  }
  coordTrans(event: MouseEvent) {
    const px = (event.offsetX / this.renderer.domElement.width) * 2 - 1;
    const py = -(event.offsetY / this.renderer.domElement.height) * 2 + 1;
    const p = new Vector3(px, py, 0).unproject(this.camera); // screen to scene
    console.log(p);
    p.applyMatrix4(
      new Matrix4().multiplyMatrices(
        this.camera.projectionMatrix,
        this.plane.modelViewMatrix
      )
    ); // scene to screen
    console.log(
      this.renderer.domElement.width,
      this.renderer.domElement.height
    );
    console.log(event.offsetX, event.offsetY);
    console.log(p);
    console.log(((p.x + 1) / 2) * this.renderer.domElement.width); // screen to scene again
    console.log(-((p.y - 1) / 2) * this.renderer.domElement.height);
    const tCoord = new Vector3(px, py, 0);
    tCoord.applyMatrix4(this.plane.matrixWorld);
    console.log(tCoord);
    // tCoord.applyMatrix4(new Matrix4().getInverse(this.plane.matrixWorld));
    // console.log(tCoord);
    console.log(tCoord.x / 2 + 0.5, tCoord.y / 2 + 0.5);
    console.log(this.plane.material);
  }
}
