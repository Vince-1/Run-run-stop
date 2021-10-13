import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import {
  ArrayCamera,
  BoxBufferGeometry,
  Camera,
  Color,
  DoubleSide,
  Euler,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneBufferGeometry,
  Quaternion,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three';
import { EffectComposer } from '../share/pass/effectComposer';
import { RenderPass } from '../share/pass/RenderPass';
import { ShaderPass } from '../share/pass/shaderPass';
import { DotScreenShader } from '../share/shaders/DotScreenShader';
import { sampleValueShder } from '../share/sampleVlaueShader';
import { makeArray, makeTexture3d } from '../share/utils';
import { DragControls } from '../share/controls/dragControls';
import { TrackballControls } from '../share/controls/trackBall';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { array } from 'fp-ts';

@Component({
  selector: 'app-processing-pass',
  templateUrl: './processing-pass.component.html',
  styleUrls: ['./processing-pass.component.less'],
})
export class ProcessingPassComponent implements OnInit {
  scene: Scene;
  cameraOrth: Camera;
  camera1: PerspectiveCamera;
  camera2: PerspectiveCamera;

  cameraArray: ArrayCamera;
  renderer: WebGLRenderer = new WebGLRenderer();

  width = 1000;
  height = 1000;

  plane: Mesh;

  planeShader = new ShaderMaterial({
    uniforms: {
      samplePosition: { value: new Vector3() },
      data: {
        value: makeTexture3d(makeArray(1000000, 'linear'), 100, 100, 100),
      },
    },
    side: DoubleSide,
    vertexShader: sampleValueShder.vertex,
    fragmentShader: sampleValueShder.frag,
  });

  basicMaterial = new MeshBasicMaterial({
    color: new Color('green'),
    side: DoubleSide,
  });

  @ViewChild('canvas', { static: true })
  canvasRef?: ElementRef<HTMLCanvasElement>;

  composer = new EffectComposer(this.renderer);

  constructor() {
    this.scene = new Scene();
    this.cameraOrth = new OrthographicCamera(
      -this.width / 2,
      this.width / 2,
      -this.height / 2,
      this.height / 2
    );
    // this.cameraOrth = new PerspectiveCamera(1000, 1, 0, 1000);
    this.cameraOrth.position.z = 1000;

    this.camera1 = new PerspectiveCamera(1000, 1, -1000, 1000);
    this.camera1.position.z = 1000;
    this.camera1.setViewOffset(1000, 1000, 0, 0, 1000, 1000);

    this.camera2 = new PerspectiveCamera(1000, 1, -1000, 1000);
    this.camera2.position.z = 1000;
    this.camera2.setViewOffset(1000, 1000, 500, 500, 500, 500);

    this.cameraArray = new ArrayCamera([this.camera1, this.camera2]);

    this.plane = new Mesh(
      new PlaneBufferGeometry(100, 100),
      this.basicMaterial
    );
    this.scene.add(this.plane);
    this.scene.background = new Color('black');
  }

  ngOnInit(): void {
    this.renderer.dispose();
    this.renderer = new WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      context: this.canvasRef.nativeElement.getContext('webgl2', {
        alpha: true,
        antialias: true,
      }),
    });
    // this.composer = new EffectComposer(this.renderer);
    this.renderer.setSize(this.width, this.height);
    this.animate();

    const renderPass = new RenderPass(this.scene, this.cameraOrth);
    const dotScreenShader = new ShaderPass(DotScreenShader);

    // this.composer.addPass(renderPass);
    // this.composer.addPass(dotScreenShader);

    // const dragControls = new DragControls(
    //   this.scene.children,
    //   this.cameraOrth,
    //   this.renderer.domElement
    // );
    // const trackballControls = new TrackballControls(
    //   this.camera1,
    //   this.renderer.domElement
    // );

    const orbitControls = new OrbitControls(
      this.camera1,
      this.renderer.domElement
    );
    new Uint8Array(100).forEach((x) => this.scene.add(this.getBox()));
    fromEvent(this.renderer.domElement, 'pointerdown').subscribe(
      (x) => console.log(x),
      (e) => console.error(e)
    );
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.render();
  }
  render() {
    // this.renderer.render(this.scene, this.cameraOrth);
    // this.renderer.render(this.scene, this.camera2);
    this.renderer.render(this.scene, this.camera1);

    // this.renderer.render(this.scene, this.cameraArray);
    // this.composer.render();
  }

  getBox() {
    const g = new BoxBufferGeometry(
      Math.random() * 200,
      Math.random() * 200,
      Math.random() * 200
    );
    const m = new MeshBasicMaterial({ color: Math.random() * 0xffffff });
    const position = new Vector3(
      Math.random() * 500 - 500,
      Math.random() * 500 - 500,
      Math.random() * 500 - 500
    );
    const box = new Mesh(g, m);
    // box.position.set(position.x, position.y, position.z);

    const rotation = new Euler();
    // rotation.x = Math.random() * 2 * Math.PI;
    // rotation.y = Math.random() * 2 * Math.PI;
    // rotation.z = Math.random() * 2 * Math.PI;

    const scale = new Vector3();
    scale.x = Math.random() + 1;
    scale.y = Math.random() + 1;
    scale.z = Math.random() + 1;

    const quaternion = new Quaternion();
    quaternion.setFromEuler(rotation);

    const matrix = new Matrix4();
    matrix.compose(position, quaternion, scale);

    g.applyMatrix4(matrix);
    return box;
  }
}
