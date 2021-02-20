import { Component, OnInit, ElementRef, RendererFactory2 } from '@angular/core';
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  Vector3,
  ShaderMaterial,
  Mesh,
  PlaneBufferGeometry,
  Vector2,
  DoubleSide,
  MeshBasicMaterial,
  Color,
  Texture,
  TextureLoader,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { shaders } from '../share/shaders';
import { makeTexture3d, makeArray, transform16to32 } from '../share/utils';
import {
  loadStubData,
  StubImage3D,
  loadColormap,
  Textures,
} from '../share/stub';
import { Image3D } from '../share/image3d';
import { fromEvent } from 'rxjs';

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

  tx = 100;
  ty = 1024;
  tz = 4096;
  data = makeArray(this.tx * this.ty * this.tz, 'random');
  

  renderer: WebGLRenderer;
  orbit: OrbitControls;
  z = 50;
  shape = new Vector3(10, 10, 10);
  size = new Vector3(10, 10, 10);
  shaderMaterial = new ShaderMaterial({
    uniforms: {
      img: {
        value: makeTexture3d(
          this.data,
          this.tx,
          this.ty,
          this.tz
        ),
      },
      colormap: {
        value: new TextureLoader().load('assets/textures/cm_petct.png'),
      },
      center: { value: new Vector3(0, 0, 0) },
      shape: { value: new Vector3(this.tx, this.tz, this.ty) },
      pixelSize: { value: new Vector3(1, 1, 1) },
      window: { value: new Vector2(0, 1) },
      windowSize: {
        value: new Vector2(this.tx, this.tz),
      },
      view: { value: 0 }, // 0,1,2 = xy,yz,xz
      slicer: { value: 5.0 },
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
    new PlaneBufferGeometry(this.tx, this.tz),
    // this.redMaterial
    this.shaderMaterial
  );

  constructor(private ef: ElementRef, rendererFactory: RendererFactory2) {
    const renderer2 = rendererFactory.createRenderer(null, null);
    const canvas = renderer2.createElement('canvas') as HTMLCanvasElement;
    const context = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
    });
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      context: context,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera.position.z = 1000;
    // this.camera.up = new Vector3(0, -1, 0);
    this.scene.add(this.plane);
    this.renderer.render(this.scene, this.camera);
  }

  ngOnInit(): void {
    this.ef.nativeElement.appendChild(this.renderer.domElement);
    this.aninmate();
    fromEvent(this.ef.nativeElement, 'mousewheel').subscribe(
      (x: MouseWheelEvent) => {
        x.preventDefault();
        this.updateSlicer(
          this.shaderMaterial.uniforms.slicer.value +
            x.deltaY / Math.abs(x.deltaY)
        );
      },
      (e) => console.error(e)
    );

    // loadStubData(StubImage3D.ct).then(
    //   (x) => {
    //     console.log(x);
    //     this.setImage(x);
    //   },
    //   (e) => console.error(e)
    // );
    loadColormap(Textures.gray).then();
    console.log(this.shaderMaterial.uniforms.img.value);

    let a = new Float32Array(209715200);
      for (let i = 0;i<=209715200;i++){
        a[i]=this.data[i];
      }
      this.shaderMaterial.uniforms.img.value =makeTexture3d(a,this.tx,this.ty,2048);
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
}
