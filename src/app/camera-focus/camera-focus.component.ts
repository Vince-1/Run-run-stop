import { Component, OnInit } from '@angular/core';

import * as THREE from 'three';
import { Color, Vector2, Vector3 } from 'three';
import { fromEvent, Observable, Subject, merge } from 'rxjs';
import { takeUntil, switchMap, map, scan } from 'rxjs/operators';

export interface Ng3MouseDragEvent{
  origin:Vector2;
  current:Vector2;
  last:Vector2;
  tag:'mouseup'|'mousedown'|'mousemove'|'mouseleave'|'mouseenter';
}

interface MouseEvent {
  layerX: number | undefined;
  layerY: number | undefined;
}


@Component({
  selector: 'app-camera-focus',
  templateUrl: './camera-focus.component.html',
  styleUrls: ['./camera-focus.component.less']
})
export class CameraFocusComponent implements OnInit {

  camera= new THREE.OrthographicCamera(5000,-5000,-5000,5000,-10000,10000);
  scene= new THREE.Scene;
  renderer = new THREE.WebGLRenderer();
  geometry = new THREE.BoxBufferGeometry(100,100,100);
  material = new THREE.MeshBasicMaterial({color:new THREE.Color('red')});
  mesh =  new THREE.Mesh(this.geometry,this.material);
  scale =1;
  mouseCoords = new Vector2(0,0);
  center =  new Vector2(-100 ,0);
  p = new Vector3(0,0,0);
  size = new Vector2(800,400);
  meshSize = 100;

  drag$:Observable<Ng3MouseDragEvent>;
  up$:Observable<{
    position:Vector2;
    tag:"mouseup"|"mousedown"|"mousemove"|"mouseleave"|"mouseenter";
  }>;
  stop = new Subject<void>();
  leave$:Observable<{
    position:Vector2;
    tag:"mouseup"|"mousedown"|"mousemove"|"mouseleave"|"mouseenter";
  }>;
  down$:Observable<{
    position:Vector2;
    tag:"mouseup"|"mousedown"|"mousemove"|"mouseleave"|"mouseenter";
  }>;
  position$:Observable<{
    position:Vector2;
    tag:"mouseup"|"mousedown"|"mousemove"|"mouseleave"|"mouseenter";
  }>;


  constructor(){


    this.up$ = this.fromEventCurrentPosition('mouseup').pipe();
    this.leave$ = this.fromEventCurrentPosition('mouseleave').pipe();
    this.down$ = this.fromEventCurrentPosition('mousedown').pipe();
    this.position$=this.fromEventCurrentPosition('mousemove').pipe();
    this.drag$ = this.creatDrag$();

    fromEvent(this.renderer.domElement,'mousedown').subscribe(
      x=>{
        this.setMouseCoords((x as unknown as MouseEvent).layerX,(x as unknown as MouseEvent).layerY,1);
       
      }
    )

    fromEvent(this.renderer.domElement,'mousewheel').subscribe(
      x=>{
        x.preventDefault();
        this.setMouseCoords((x as unknown as MouseEvent).layerX,(x as unknown as MouseEvent).layerY,Math.abs((x as MouseWheelEvent).deltaY)/(x as MouseWheelEvent).deltaY);
      }
    )
    
  }

  setMouseCoords(x: number, y: number,dt:number) {

    
    this.mouseCoords.set((x / this.renderer.domElement.clientWidth) * 2 - 1, - (y / this.renderer.domElement.clientHeight) * 2 + 1);

    this.p = new Vector3(this.mouseCoords.x,this.mouseCoords.y,-1).unproject(this.camera);
    let a =this.scale;

    if(dt>0){
    this.scale = this.scale+0.05;}
    else{
      this.scale =this.scale -0.01;
    }
    
    console.log(this.scale);
    console.log(this.p);
    let Cx = this.p.x /this.scale - this.p.x/a;
    let Cy = this.p.y /this.scale -this.p.y/a;
    this.center = new Vector2(this.center.x + Cx,this.center.y + Cy);
    a =this.scale;
    console.log(this.center);
    this.setscale();

  }

  ngOnInit(): void {
    // init();
    // animate();
    this.drag$.subscribe(
      (p)=>{
        this.setMouseCoords(p.origin.x,p.origin.y,(p.current.y-p.last.y))
      }
    )
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    this.scene.add(this.mesh);
    let center = new Vector2(this.center.x *this.scale,this.center.y * this.scale);
    // this.mesh.position.x = 100;
    
   
    this.camera.top = (center.y - this.size.y / 2* this.scale);
    this.camera.bottom = (center.y + this.size.y /2* this.scale);
    this.camera.left = (center.x - this.size.x / 2* this.scale) ;
    this.camera.right = (center.x + this.size.x/2* this.scale) ;
    this.camera.updateProjectionMatrix();
    
    // this.camera.lookAt(0,0,0);
    // this.camera.up.set(0,-1,0);
    
    // this.camera.updateProjectionMatrix();
    this.camera.position.set(0,0,1000);


    
    
    
    
    // this.camera.position.set(0,100,100);
    // this.camera.lookAt(0,0,0);
    // this.camera.rotateZ(Math.PI/2);
    // this.camera.rotateZ(Math.PI/4);
    this.render();

  }


  fromEventCurrentPosition(
    name:'mouseup'|'mousedown'|'mousemove'|'mouseleave'|'mouseenter',
  ){
    const element = this.renderer.domElement;
    return fromEvent<MouseEvent>(element,name).pipe(
      map((e:MouseEvent)=>{
        const p = new Vector2(e.layerX,e.layerY);
        return {
          position:p,
          tag:name,
        }
      }),
      takeUntil(this.stop),
    )

  }

  creatDrag$():Observable<Ng3MouseDragEvent>{
    const cancel = merge(this.up$,this.leave$);
    return this.down$.pipe(
      switchMap(
        (d)=>{
          return merge(this.down$,this.position$).pipe(
            map(
              (c)=>{
                return {
                  origin:d.position,
                  current:c.position,
                  last:c.position,
                  tag:c.tag
                };
              }
            ),
            takeUntil(cancel),
          );
        }
      ),
      takeUntil(this.stop),
      scan((acc,cur)=>({...cur,last:acc.current})),
    );
  }


  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    document.body.removeChild(this.renderer.domElement);
  }


  setscale(){
   
    
    // this.camera.lookAt(0,0,0);
  
   
    let center = new Vector2(this.center.x *this.scale,this.center.y * this.scale);
    // this.mesh.position.x = 100;
    console.log(center);
    
    this.camera.top = (center.y - this.size.y / 2* this.scale);
    this.camera.bottom = (center.y + this.size.y /2* this.scale);
    this.camera.left = (center.x - this.size.x / 2* this.scale) ;
    this.camera.right = (center.x + this.size.x/2* this.scale) ;
    this.camera.updateProjectionMatrix();
    
    // this.camera.lookAt(0,0,0);
    // this.camera.up.set(0,-1,0);
    
    // this.camera.updateProjectionMatrix();
    this.camera.position.set(0,0,1000);
  }


  render(){
    requestAnimationFrame(() => {
      this.render();
    })
    this.renderer.render(this.scene,this.camera);
  }

}
