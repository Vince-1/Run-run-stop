import { Component, OnInit } from '@angular/core';

import * as THREE from 'three';
import { Color, Vector2, Vector3, MeshBasicMaterial } from 'three';

@Component({
  selector: 'app-test-planegeometry',
  templateUrl: './test-planegeometry.component.html',
  styleUrls: ['./test-planegeometry.component.less']
})
export class TestPlanegeometryComponent implements OnInit {

  scene=new  THREE.Scene;
  camera= new THREE.Camera;
  renderer=new THREE.WebGLRenderer();
  geometry=new THREE.PlaneBufferGeometry(3000,1000);
  material=new MeshBasicMaterial({color:new THREE.Color('red')});
  mesh=new THREE.Mesh(this.geometry,this.material);

  constructor() { }

  ngOnInit(): void {

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    this.scene.add(this.mesh);
    this.render();
  }

  render(){
    requestAnimationFrame(() => {
      this.render();
    })
    this.renderer.render(this.scene,this.camera);
  }

}
