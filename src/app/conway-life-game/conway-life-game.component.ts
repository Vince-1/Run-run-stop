import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  Mesh,
  PlaneBufferGeometry,
  ShaderMaterial,
  NearestFilter,
  LinearFilter,
  Matrix4,
  Vector3,
  DoubleSide,
  WebGLRenderTarget,
  Vector2,
  RGBFormat,
  DepthTexture,
  FloatType,
  MeshBasicMaterial,
  Color,
  DataTexture,
  RedFormat,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { fromEvent, throwError } from 'rxjs';
import { shaders } from '../share/shaders';
import { makeTexture3d, makeArray, makeTexture2d } from '../share/utils';

@Component({
  selector: 'app-conway-life-game',
  templateUrl: './conway-life-game.component.html',
  styleUrls: ['./conway-life-game.component.less'],
})
export class ConwayLifeGameComponent implements OnInit, OnDestroy {
  scene = new Scene();
  cameraOut = new OrthographicCamera(
    -window.innerWidth / 2,
    window.innerWidth / 2,
    -window.innerHeight / 2,
    window.innerHeight / 2
  );
  camera = new OrthographicCamera(
    -window.innerWidth / 2,
    window.innerWidth / 2,
    -window.innerHeight / 2,
    window.innerHeight / 2
  );
  renderer: WebGLRenderer;
  orbit: OrbitControls;
  shaderM: ShaderMaterial;
  plane: Mesh;
  planeOut: Mesh;

  frameTexture: DataTexture;
  // planeTop: Mesh;
  b = 5;
  a = this.b - 1;

  planeTop = new Mesh(
    new PlaneBufferGeometry(800, 600),
    new MeshBasicMaterial({
      color: new Color('red'),
      side: DoubleSide,
      // map: this.frameTexture,
    })
  );
  bufferScene = new Scene();
  bufferTarget = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    format: RedFormat,
    depthBuffer: true,
  });

  tx = 16384;
  ty = 16385;

  constructor() {
    console.log(this.a, this.b);
    this.b -= 1;
    console.log(this.a, this.b);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
    });
    console.log(context);
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      context: context,
    });
    document.body.appendChild(this.renderer.domElement);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.orbit = new OrbitControls(this.cameraOut, this.renderer.domElement); // add orbit

    this.shaderM = new ShaderMaterial({
      uniforms: {
        img: {
          value: makeTexture2d(
            makeArray(this.tx * this.ty, 'random'),
            this.tx,
            this.ty
          ),
        },
        // img: {
        //   value: makeTexture2d(
        //     new Float32Array([0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0]),
        //     // new Float32Array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]),
        //     4,
        //     4
        //   ),
        // },
        center: { value: new Vector2(0, 0) },
        size: { value: new Vector2(window.innerWidth, window.innerHeight) },
        shape: { value: new Vector2(this.tx, this.ty) },
      },
      vertexShader: shaders.conway.vertex,
      fragmentShader: shaders.conway.frag,
      side: DoubleSide,
    });
    this.plane = new Mesh(
      new PlaneBufferGeometry(window.innerWidth, window.innerHeight),
      this.shaderM
    );
    this.planeOut = new Mesh(
      new PlaneBufferGeometry(window.innerWidth, window.innerHeight),
      new MeshBasicMaterial({
        // color: new Color('red'),
        map: this.bufferTarget.texture,
        side: DoubleSide,
      })
    );

    this.bufferScene.add(this.plane);
    this.scene.add(this.planeOut);

    this.frameTexture = new DataTexture(
      new Float32Array(480000),
      800,
      600,
      RedFormat
    );

    this.planeTop.position.z = 100;
    this.scene.add(this.planeTop);
    // this.renderer.getContext()
    // if (!this.renderer.context.getExtension('OES_texture_float')) {
    //   alert('OES_texture_float is not supported :(');
    // }
  }

  ngOnInit(): void {
    this.cameraOut.position.z = 1500;
    this.cameraOut.up = new Vector3(0, 0, -1);
    // this.scene.background = new Color('black');
    this.renderer.render(this.scene, this.cameraOut);

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
    // this.renderer.render(this.scene, this.camera);

    // this.renderer.setRenderTarget(this.bufferTarget);
    this.renderer.render(this.bufferScene, this.cameraOut);

    // this.renderer.setRenderTarget(null);
    // this.renderer.copyFramebufferToTexture(
    //   new Vector2(100, 100),
    //   this.frameTexture
    // );
    // this.renderer.clearDepth();
    // this.renderer.render(this.scene, this.cameraOut);
  }

  showMatrix() {
    console.log(
      'projection matrix: ',
      this.cameraOut.projectionMatrix,
      this.cameraOut.projectionMatrixInverse
    );
    console.log('world matrix: ', this.plane.matrix, this.plane.matrixWorld);
    console.log('modelView matrix: ', this.plane.modelViewMatrix);
    console.log(
      'test: ',
      new Matrix4().multiplyMatrices(
        this.plane.matrixWorld,
        this.cameraOut.projectionMatrixInverse
      )
    );
  }
  coordTrans(event: MouseEvent) {
    let px = (event.offsetX / this.renderer.domElement.width) * 2 - 1;
    let py = -(event.offsetY / this.renderer.domElement.height) * 2 + 1;
    let p = new Vector3(px, py, 0).unproject(this.cameraOut); // screen to scene
    console.log(p);
    p.applyMatrix4(
      new Matrix4().multiplyMatrices(
        this.cameraOut.projectionMatrix,
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
