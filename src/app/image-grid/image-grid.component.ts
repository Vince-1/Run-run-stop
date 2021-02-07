import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { ElementRef } from '@angular/core';
import { RendererFactory2 } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import {
  BoxBufferGeometry,
  Color,
  DoubleSide,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneBufferGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { tomoShader } from '../share/shader';
import { shaders } from '../share/shader-fragments';

@Component({
  selector: 'app-image-grid',
  templateUrl: './image-grid.component.html',
  styleUrls: ['./image-grid.component.less'],
})
export class ImageGridComponent implements OnInit {
  scene = new Scene();
  camera = new OrthographicCamera(
    -window.innerWidth / 2,
    window.innerWidth / 2,
    -window.innerHeight / 2,
    window.innerHeight / 2
  );
  renderer: WebGLRenderer;
  orbit: OrbitControls;
  z = 50;

  canvas: HTMLCanvasElement;
  contex: WebGL2RenderingContext;

  shader1 = new ShaderMaterial(tomoShader);
  plane1 = new Mesh(
    new PlaneBufferGeometry(100, 100),
    // new MeshBasicMaterial({ color: new Color('red'), side: DoubleSide })
    this.shader1
  );
  plane2 = new Mesh(
    new PlaneBufferGeometry(100, 100),
    new MeshBasicMaterial({ color: new Color('yellow'), side: DoubleSide })
  );

  constructor(private ef: ElementRef, rendererFactory: RendererFactory2) {
    const renderer2 = rendererFactory.createRenderer(null, null);
    this.canvas = renderer2.createElement('canvas') as HTMLCanvasElement;
    this.contex = this.canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
    });
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      context: this.contex,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera.position.z = 10;
    this.renderer.render(this.scene, this.camera);
    this.ef.nativeElement.appendChild(this.renderer.domElement);

    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    this.scene.add(this.plane1);
    this.scene.add(this.plane2);
    this.animate();
  }

  ngOnInit(): void {
    this.plane1.position.set(300, 0, 0);
    const a = new Matrix4().makeScale(100, 1, 1);
    console.log( a.invert());
    console.log(a);
    console.log(this.shader1.uniforms.planAffineInverse.value);
  }
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  animate() {
    requestAnimationFrame(() => this.animate());
    this.render();
  }
}
