import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  Mesh,
  PlaneBufferGeometry,
  MeshBasicMaterial,
  Color,
  DoubleSide,
  Vector3,
  ShaderMaterial,
  Vector2,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { StubImage3D, loadStubData } from '../share/stub';
import { makeTexture3d, makeArray, transform16to32 } from '../share/utils';
import { shaders } from '../share/shaders';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-tile-image',
  templateUrl: './tile-image.component.html',
  styleUrls: ['./tile-image.component.less'],
})
export class TileImageComponent implements OnInit, OnDestroy {
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
  shape = new Vector3(10, 10, 10);
  size = new Vector3(10, 10, 10);
  shaderMaterial: ShaderMaterial = new ShaderMaterial({
    uniforms: {
      img: { value: makeTexture3d(makeArray(1000), 10, 10, 10) },
      center: { value: new Vector3(0, 0, 0) },
      size: { value: new Vector3(300, 300, 300) },
      shape: { value: new Vector3(10, 10, 10) },
      z: { value: 0.5 },
      grid: { value: new Vector2(5.0, 5.0) },
      windowSize: {
        value: new Vector2(window.innerWidth, window.innerHeight),
      },
    },
    vertexShader: shaders.tile.vertex,
    fragmentShader: shaders.tile.frag,
    side: DoubleSide,
  });
  redMaterial = new MeshBasicMaterial({ color: new Color('red') });
  plane = new Mesh(
    new PlaneBufferGeometry(window.innerWidth, window.innerHeight),
    this.shaderMaterial
  );
  constructor() {
    const canvas = document.createElement('canvas');
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      context: canvas.getContext('webgl2', { alpha: true, antialias: true }),
    });
    document.body.appendChild(this.renderer.domElement);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera.position.z = 1000;
    this.camera.up = new Vector3(0, 0, -1);

    this.scene.add(this.plane);

    fromEvent(this.renderer.domElement, 'mousewheel').subscribe(
      (event: MouseWheelEvent) => {
        event.preventDefault();
        console.log(event);
        this.changeZ(this.z + event.deltaY / Math.abs(event.deltaY));
      }
    );
    // this.orbit = new OrbitControls(this.camera, canvas);

    this.animate();
  }

  ngOnInit(): void {
    loadStubData(StubImage3D.petHead).then(
      (x) => {
        console.log(x);
        this.shaderMaterial.uniforms.img.value = makeTexture3d(
          transform16to32(x.data),
          x.shape.x,
          x.shape.y,
          x.shape.z
        );
        this.shaderMaterial.uniforms.size.value = new Vector3(
          x.shape.x * x.pixelSize.x,
          x.shape.y * x.pixelSize.x,
          x.shape.z * x.pixelSize.x
        );
        // this.plane.material = this.shaderMaterial;
        this.shape = new Vector3(x.shape.x, x.shape.y, x.shape.z);
        this.size = new Vector3(
          x.shape.x * x.pixelSize.x,
          x.shape.y * x.pixelSize.x,
          x.shape.z * x.pixelSize.x
        );
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
  }

  changeZ(value: number) {
    this.z = value;
    this.shaderMaterial.uniforms.z.value = this.z / 100;
  }
}
