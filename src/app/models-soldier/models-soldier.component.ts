import { Component, OnInit } from '@angular/core';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';
import { Stats } from 'three-stats';
import { fromEvent } from 'rxjs';
import {
  Group,
  Skeleton,
  SkeletonHelper,
  AnimationMixer,
  AnimationAction,
} from 'three';

@Component({
  selector: 'app-models-soldier',
  templateUrl: './models-soldier.component.html',
  styleUrls: ['./models-soldier.component.less'],
})
export class ModelsSoldierComponent implements OnInit {
  container: HTMLDivElement;
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  clock = new THREE.Clock();
  scene = new THREE.Scene();
  hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  dirLight = new THREE.DirectionalLight(0xffffff);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  model = new Group();
  skeleton = new SkeletonHelper(this.model);
  mixer = new AnimationMixer(this.model);
  idleAction: AnimationAction;
  walkAction: AnimationAction;
  runAction: AnimationAction;
  idleWeight = 0;
  walkWeight = 1.0;
  runWeight = 0;
  singleStepMode = false;

  stats = new Stats();

  constructor() {
    this.container = document.getElementById('container') as HTMLDivElement;
  }

  ngOnInit(): void {
    this.container = document.getElementById('container') as HTMLDivElement;
    this.camera.position.set(1, 2, -3);
    this.camera.lookAt(0, 1, 0);

    this.scene.background = new THREE.Color(0xa0a0a0);
    // this.scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

    this.hemiLight.position.set(0, 20, 0);
    this.scene.add(this.hemiLight);

    this.dirLight.position.set(-3, 10, -10);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.camera.top = 2;
    this.dirLight.shadow.camera.bottom = -2;
    this.dirLight.shadow.camera.left = -2;
    this.dirLight.shadow.camera.right = 2;
    this.dirLight.shadow.camera.near = 0.1;
    this.dirLight.shadow.camera.far = 40;
    this.scene.add(this.dirLight);

    // scene.add( new CameraHelper( light.shadow.camera ) );

    // ground

    const mesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(100, 100),
      new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const loader = new GLTFLoader();
    loader.load('assets/models/Soldier.glb', (gltf) => {
      console.log(gltf.scene, this.scene);
      this.model = gltf.scene;
      this.scene.add(this.model);
      this.model.traverse((o) => (o.castShadow = true));
      this.scene.add(this.skeleton);
      const animations = gltf.animations;
      this.idleAction = this.mixer.clipAction(animations[0]);
      this.walkAction = this.mixer.clipAction(animations[1]);
      this.runAction = this.mixer.clipAction(animations[2]);

      this.setWeight(this.idleAction, 0);
      this.setWeight(this.walkAction, 1.0);
      this.setWeight(this.runAction, 0);

      this.idleAction.play();
      this.walkAction.play();
      this.runAction.play();

      console.log(this.idleAction);
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    this.container.appendChild(this.stats.dom);

    fromEvent(this.container, 'onWindowResize').subscribe(
      (x) => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
      },
      (e) => console.error(e)
    );
    this.animate();
  }
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  setWeight(action: AnimationAction, weight: number) {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);
  }
  animate() {
    // Render loop

    requestAnimationFrame(() => this.animate());

    this.idleWeight = this.idleAction.getEffectiveWeight();
    this.walkWeight = this.walkAction.getEffectiveWeight();
    this.runWeight = this.runAction.getEffectiveWeight();

    // Get the time elapsed since the last frame, used for mixer update (if not in single step mode)

    let mixerUpdateDelta = this.clock.getDelta();

    // If in single step mode, make one step and then do nothing (until the user clicks again)

    // Update the animation mixer, the stats panel, and render this frame

    this.mixer.update(mixerUpdateDelta);

    this.stats.update();

    this.renderer.render(this.scene, this.camera);
  }
}
