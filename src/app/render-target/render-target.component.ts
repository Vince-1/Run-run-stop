import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import {
  Camera,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneBufferGeometry,
  RenderTarget,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { sampleValueShder } from '../share/sampleVlaueShader';
import { makeArray, makeTexture3d } from '../share/utils';

@Component({
  selector: 'app-render-target',
  templateUrl: './render-target.component.html',
  styleUrls: ['./render-target.component.less'],
})
export class RenderTargetComponent implements OnInit {
  scene: Scene;
  camera: Camera;
  renderer: WebGLRenderer;

  rtScene: Scene;
  rtCamera: Camera;
  rtRenderer: WebGLRenderer;
  rtRenderTarget: WebGLRenderTarget;

  rtPlane: Mesh;

  width = 1000;
  height = 1000;

  rtPlaneShader = new ShaderMaterial({
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

  @ViewChild('canvas', { static: true })
  canvasRef: ElementRef<HTMLCanvasElement>;

  constructor(public ef: ElementRef) {
    this.scene = new Scene();
    this.camera = new OrthographicCamera(
      -this.width / 2,
      this.width / 2,
      -this.height / 2,
      this.height / 2
    );
    this.camera.position.z = 100;
    this.rtScene = new Scene();
    this.rtCamera = new OrthographicCamera(-1, 1, -1, 1);
    this.rtRenderTarget = new WebGLRenderTarget(this.width, this.height);
    this.rtRenderer = new WebGLRenderer({ antialias: true });
    this.rtRenderer.setRenderTarget(this.rtRenderTarget);
    this.rtPlane = new Mesh(
      new PlaneBufferGeometry(200, 200),
      // new MeshBasicMaterial({ color: new Color('red'), side: DoubleSide })
      this.rtPlaneShader
    );

    this.scene.add(this.rtPlane);
  }

  ngOnInit(): void {
    const context = this.canvasRef.nativeElement.getContext('webgl2', {
      alpha: true,
      antialias: true,
    });
    this.renderer = new WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      context,
    });
    this.renderer.setSize(this.width, this.height);
    // this.renderer.setRenderTarget(this.rtRenderTarget);
    this.animate();

    const move$ = fromEvent<MouseEvent>(this.renderer.domElement, 'mousemove');
    move$.subscribe(
      (event) => {
        const coord = new Vector2(event.offsetX, event.offsetY);
        console.log(coord);
        const buffer = new Uint8Array(4);
        this.rtRenderer.readRenderTargetPixels(
          this.rtRenderTarget,
          coord.x,
          coord.y,
          1,
          1,
          buffer
        );
        console.log(buffer);
      },
      (e) => console.error(e)
    );
  }

  render() {
    // this.renderer.setRenderTarget(this.rtRenderTarget);
    this.renderer.render(this.scene, this.camera);
    this.rtRenderer.render(this.scene, this.camera);
  }
  animate() {
    requestAnimationFrame(() => this.animate());
    this.render();
  }
}
