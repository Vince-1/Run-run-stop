import { Component, OnInit } from '@angular/core';
// import { init,animate,renderer } from './test';
import * as THREE from 'three';
import { Color, Vector2, Vector3 } from 'three';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-wirefram',
  templateUrl: './wirefram.component.html',
  styleUrls: ['./wirefram.component.less']
})
export class WireframComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // init();
    // animate();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    // document.body.removeChild(renderer.domElement);
  }

}
