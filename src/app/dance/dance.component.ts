import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  BoxGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Fog,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

@Component({
  selector: 'app-dance',
  templateUrl: './dance.component.html',
  styleUrls: ['./dance.component.less'],
})
export class DanceComponent implements OnInit, OnDestroy {
  scene = new Scene();
  camera = new PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer: WebGLRenderer;
  orbit: OrbitControls;

  floor = new Mesh(
    new PlaneGeometry(3000, 3000),
    new MeshPhongMaterial({ color: 0x683b9 })
  );
  driLight = new DirectionalLight(0xfcf3cf, 0.6);
  hemLight = new HemisphereLight(0xebf5fb, 0x683b9, 0.6);

  testBox = new Mesh(
    new BoxGeometry(10, 10, 10),
    new MeshBasicMaterial({ side: DoubleSide, color: new Color('red') })
  );
  constructor() {
    const canvas = document.createElement('canvas');
    this.renderer = new WebGLRenderer({
      canvas,
      // context: canvas.getContext('webgl2', {
      //   alpha: true,
      //   antialias: true,
      // }),
      antialias: true,
    });
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    this.camera.position.z = 10;

    this.floor.rotation.x = -0.5 * Math.PI;
    this.floor.position.y = -0.001;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    this.driLight.position.set(-10, 8, -5);
    this.driLight.castShadow = true;
    this.driLight.shadow.mapSize = new Vector2(1024, 1024);
    this.scene.add(this.driLight);

    this.hemLight.position.set(0, 48, 0);
    this.scene.add(this.hemLight);

    this.scene.background = new Color('#eee');
    this.scene.fog = new Fog(new Color('#eee').getHex(), 20, 100);
    this.animate();
  }

  ngOnInit(): void {
    const saraLoader = new GLTFLoader();
    saraLoader.load('assets/seraphine/scene.gltf', (gltf) => {
      console.log(gltf);
      const model = gltf.scene;
      // const o = model.children[0];
      // const explosionTexture = new TextureLoader().load(
      //   'assets/seraphine/textures/Mat_cwfyfr1_userboy17.bmp_diffuse.png'
      // );
      // explosionTexture.flipY = false;
      // const material = new MeshBasicMaterial({
      //   map: explosionTexture,
      // });
      // (o as Mesh).material = material;
      // (o as Mesh).castShadow = true;
      // o.receiveShadow = true;

      model.traverse((o) => {
        const explosionTexture = new TextureLoader().load(
          'assets/seraphine/textures/Mat_cwfyfr1_userboy17.bmp_diffuse.png'
        );
        explosionTexture.flipY = false;
        const material = new MeshBasicMaterial({
          map: explosionTexture,
        });
        (o as Mesh).material = material;
        (o as Mesh).castShadow = true;
        o.receiveShadow = true;
      });
      this.scene.add(model);
    });
  }
  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    document.body.removeChild(this.renderer.domElement);
  }
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  animate() {
    requestAnimationFrame(() => this.animate());
    this.render();
  }
}
