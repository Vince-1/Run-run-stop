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
import { shaders } from '../share/shaders';
import { makeTexture2d, makeArray, makeTexture3d } from '../share/utils';

@Component({
  selector: 'app-shader-dmeos',
  templateUrl: './shader-dmeos.component.html',
  styleUrls: ['./shader-dmeos.component.less'],
})
export class ShaderDmeosComponent implements OnInit, OnDestroy {
  scene = new Scene();
  camera = new OrthographicCamera(
    -window.innerWidth / 2,
    window.innerWidth / 2,
    -window.innerHeight / 2,
    window.innerHeight / 2
  );
  renderer: WebGLRenderer;
  orbit: OrbitControls;
  shaderM: ShaderMaterial;
  cube: Mesh;
  plane: Mesh;

  bufferScene = new Scene();
  bufferTexture = new WebGLRenderTarget(800, 600, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
  });

  constructor() {
    const canvas = document.createElement('canvas');
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      context: canvas.getContext('webgl2', { alpha: true, antialias: false }),
    });
    document.body.appendChild(this.renderer.domElement);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.render(this.scene, this.camera);

    this.orbit = new OrbitControls(this.camera, this.renderer.domElement); // add orbit
    this.cube = new Mesh(
      new BoxBufferGeometry(300, 300, 300),
      new ShaderMaterial({
        uniforms: {
          img: { value: makeTexture3d(makeArray(1000), 10, 10, 10) },
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
      // new PlaneBufferGeometry(300, 300),
      this.shaderM
      // new MeshBasicMaterial({
      //   color: new Color(0.0, 0.5, 0.5),
      //   side: DoubleSide,
      // })
    );
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
    this.camera.position.z = 1500;
    this.camera.up = new Vector3(0, 0, -1);
    // this.scene.background = new Color('black');
    this.renderer.render(this.scene, this.camera);

    this.scene.add(this.cube);

    // this.bufferScene.add(this.plane);

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
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    document.body.removeChild(this.renderer.domElement);
  }
  animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);

    // this.renderer.setRenderTarget(this.bufferTexture);
    // this.renderer.render(this.bufferScene, this.camera);
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
    let px = (event.offsetX / this.renderer.domElement.width) * 2 - 1;
    let py = -(event.offsetY / this.renderer.domElement.height) * 2 + 1;
    let p = new Vector3(px, py, 0).unproject(this.camera); // screen to scene
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
    let tCoord = new Vector3(px, py, 0);
    tCoord.applyMatrix4(this.plane.matrixWorld);
    console.log(tCoord);
    // tCoord.applyMatrix4(new Matrix4().getInverse(this.plane.matrixWorld));
    // console.log(tCoord);
    console.log(tCoord.x / 2 + 0.5, tCoord.y / 2 + 0.5);
    console.log(this.plane.material);
  }
}
