import { ElementRef } from '@angular/core';
import { RendererFactory2 } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { fromEvent, interval } from 'rxjs';
import {
  Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneBufferGeometry,
  Raycaster,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { tomoShader } from '../share/shader';
import * as L from 'lodash';

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

  shader1 = new ShaderMaterial(tomoShader());
  plane1 = new Mesh(
    new PlaneBufferGeometry(100, 100),
    // new MeshBasicMaterial({ color: new Color('red'), side: DoubleSide })
    this.shader1
  );
  plane2 = new Mesh(
    new PlaneBufferGeometry(100, 100),
    new MeshBasicMaterial({ color: new Color('yellow'), side: DoubleSide })
  );

  raycaster = new Raycaster();

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
      // antialias: true,
      // alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera.position.z = 10;
    this.renderer.setClearColor(new Color('black'));
    this.renderer.render(this.scene, this.camera);
    this.ef.nativeElement.appendChild(this.renderer.domElement);

    // this.orbit = new OrbitControls(this.camera, this.renderer.domElement);

    this.scene.add(this.plane1);
    this.scene.add(this.plane2);
  }

  ngOnInit(): void {
    console.log(L.isEqual({ x: 100, y: 50 }, { x: 100, y: 100 }));

    this.animate();
    this.plane1.position.set(300, 0, 0);

    // fromEvent(this.ef.nativeElement, 'mousedown').subscribe(
    //   (e: MouseEvent) => {
    //     // const coord = new Vector2(
    //     //   (e.offsetX / window.innerWidth) * 2 - 1,
    //     //   -(e.offsetY / window.innerHeight) * 2 + 1
    //     // );
    //     const coord = new Vector2(0, 0);
    //     this.raycaster.setFromCamera(coord, this.camera);
    //     const intersection = this.raycaster.intersectObject(this.plane2);
    //     console.log(e, coord, intersection);
    //     if (intersection.length > 0) {
    //       intersection.forEach((i) => {
    //         console.log(i.distanceToRay);
    //         console.log(i.object);
    //       });
    //     }
    //   },
    //   (e) => console.error(e)
    // );

    // const a = interval(10000);
    // fromEvent(this.ef.nativeElement, 'mousedown')
    //   .pipe(withLatestFrom(a))
    //   .subscribe(
    //     (x) => console.log(x),
    //     (e) => console.log(e)
    //   );
  }
  render() {
    this.renderer.render(this.scene, this.camera);
    // this.renderer.render(this.scene, this.cameraArray);
  }
  animate() {
    requestAnimationFrame(() => this.animate());
    this.render();
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.ef.nativeElement.removeChild(this.renderer.domElement);
  }
}
