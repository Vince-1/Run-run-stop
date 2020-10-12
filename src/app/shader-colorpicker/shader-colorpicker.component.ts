import { Component } from '@angular/core';
import * as THREE from 'three';
import { ShaderMaterial, MeshBasicMaterial, Color, Vector2 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { map, mapTo, takeUntil, switchMap, scan } from 'rxjs/operators';
import { Observable, fromEvent, Subject, merge } from 'rxjs';
export interface Ng3MosueDragEvent {
  origin: Vector2;
  current: Vector2;
  last: Vector2;
  tag: 'mouseup' | 'mousedown' | 'mousemove' | 'mouseleave' | 'mouseenter';
}
interface MouseEvent {
  layerX: number | undefined;
  layerY: number | undefined;
}
@Component({
  selector: 'shader-colorpicker',
  templateUrl: './shader-colorpicker.component.html',
  styleUrls: ['./shader-colorpicker.component.less']
})
export class ShaderColorpickerComponent {
  geometry1 = new THREE.PlaneBufferGeometry(512, 512);
  geometry2 = new THREE.PlaneBufferGeometry(512, 512);
  geometry3 = new THREE.PlaneBufferGeometry(512, 512);
  geometry4 = new THREE.PlaneBufferGeometry(100, 100);
  geometry5 = new THREE.PlaneBufferGeometry(720, 20);
  geometry6 = new THREE.CircleBufferGeometry(12,);
  geometry7 = new THREE.PlaneBufferGeometry(720, 20);
  geometry8 = new THREE.CircleBufferGeometry(12,);
  geometry9 = new THREE.CircleBufferGeometry(12);
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  // camera = new THREE.OrthographicCamera(- 512 * window.innerWidth / window.innerHeight , 512 * window.innerWidth / window.innerHeight , 512 , - 512 ,);
  scene = new THREE.Scene();
  alpha:number=0.5;
  renderer = new THREE.WebGLRenderer();
  material1: ShaderMaterial;
  material2: ShaderMaterial;
  raycaster1 = new THREE.Raycaster();
  raycaster2 = new THREE.Raycaster();
  raycaster3 = new THREE.Raycaster();
  mesh1: THREE.Mesh;
  mesh2: THREE.Mesh;
  mesh3: THREE.Mesh;
  mesh4: THREE.Mesh;
  mesh5: THREE.Mesh;
  mesh6: THREE.Mesh;
  mesh7: THREE.Mesh;
  mesh8: THREE.Mesh;
  mesh9: THREE.Mesh;
  container: HTMLElement;
  move?: Observable<Event>;
  drag$: Observable<Ng3MosueDragEvent>;
  up$: Observable<{
    position: Vector2;
    tag: "mouseup" | "mousedown" | "mousemove" | "mouseleave" | "mouseenter";
}>;
  stop = new Subject<void>();
  leave$ : Observable<{
    position: Vector2;
    tag: "mouseup" | "mousedown" | "mousemove" | "mouseleave" | "mouseenter";
}>;
  down$ : Observable<{
    position: Vector2;
    tag: "mouseup" | "mousedown" | "mousemove" | "mouseleave" | "mouseenter";
}>;

  position$ : Observable<{
    position: Vector2;
    tag: "mouseup" | "mousedown" | "mousemove" | "mouseleave" | "mouseenter";
}>;
  controls: OrbitControls;
  color =260;
  colorMaterial:MeshBasicMaterial;
  showMaterial:MeshBasicMaterial;
  pickerMaterial:ShaderMaterial;
  alphaMaterial:ShaderMaterial;
  alphapicker:MeshBasicMaterial;
  colorpicker:MeshBasicMaterial;
  mouseCoords = new THREE.Vector2();
  mouseMoved = false;
  HSV_S:number=0.5;
  HSV_V:number=0.5;
  HSL_S:number;
  HSL_L:number;
  R:number;
  G:number;
  B:number;



  constructor() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    this.up$ = this.fromEventCurrentPosition('mouseup')
    .pipe

    ();
    this.leave$ = this.fromEventCurrentPosition('mouseleave')
    .pipe
    // sampleTime(sampleTimeInW.mouseEvent),
    ();
    this.down$ = this.fromEventCurrentPosition('mousedown')
    .pipe
    // sampleTime(sampleTimeInW.mouseEvent),
    ();

    this.position$ = this.fromEventCurrentPosition('mousemove')
    .pipe
    // sampleTime(sampleTimeInW.mouseEvent),
    ();
    this.drag$ = this.createDrag$();

  }

  ngOnInit(): void {

    this.move =
        fromEvent(this.renderer.domElement, 'mousedown');
      this.move.subscribe(x => {
        // this.onDocumentMouseMove((x as MouseEvent).clientX, (x as MouseEvent).clientY);
        this.onDocumentMouseMove((x as unknown as MouseEvent).layerX!, (x as unknown as MouseEvent).layerY!);
        
      })
    this.drag$.subscribe(
      (p) => {
        console.log(p);
        const point = new Vector2(p.current.x, p.current.y);
        this.onDocumentMouseMove(point.x, point.y);
      },
      e => console.error(e)
    )

    this.shader();
    this.render();
    this.rgbchange();
  }

  onDocumentMouseMove(x: number, y: number) {
    let a = x; let b = y;
    this.setMouseCoords(a, b);

  }
  setMouseCoords(x: number, y: number) {
    
    this.mouseCoords.set((x / this.renderer.domElement.clientWidth) * 2 - 1, - (y / this.renderer.domElement.clientHeight) * 2 + 1);
    this.mouseMoved = true;
  }

  rgbchange(){
    this.R=200;
    this.G=50;
    this.B=0;
    let var_R = ( this.R / 255 )
    let var_G = ( this.G / 255 )
    let var_B = ( this.B / 255 )
     
    let var_Min = Math.min( var_R, var_G, var_B )    //Min. value of RGB
    let var_Max = Math.max( var_R, var_G, var_B )    //Max. value of RGB
    let del_Max = var_Max - var_Min             //Delta RGB value
     
    this.HSV_V = var_Max
     
     if ( del_Max == 0 )                     //This is a gray, no chroma...
     {
        this.color = 0;
        this.HSV_S = 0;
     }
     else                                    //Chromatic data...
     {
        this.HSV_S = del_Max / var_Max
     
       let del_R = ( ( ( var_Max - var_R ) / 6 ) + ( del_Max / 2 ) ) / del_Max
       let del_G = ( ( ( var_Max - var_G ) / 6 ) + ( del_Max / 2 ) ) / del_Max
       let del_B = ( ( ( var_Max - var_B ) / 6 ) + ( del_Max / 2 ) ) / del_Max
     
        if      ( var_R == var_Max ) this.color = del_B - del_G
        else if ( var_G == var_Max ) this.color = ( 1 / 3 ) + del_R - del_B
        else if ( var_B == var_Max ) this.color = ( 2 / 3 ) + del_G - del_R
     
         if ( this.color < 0 ) this.color += 1
         if ( this.color > 1 ) this.color -= 1
         this.color=Math.round(this.color*360);
     }
     let h1 = this.color;
     
     this.HSL_S = (this.HSV_S * this.HSV_V / ((h1 = (2 - this.HSV_S) * this.HSV_V) < 1 ? h1 : 2 - h1)) || 0,
         this.HSL_L = h1 / 2;
         this.mesh4.material=new THREE.MeshBasicMaterial({ color: `hsl(${this.color},${Math.round(this.HSL_S *100) }%,${Math.round(this.HSL_L*100)}%)`,transparent:true,opacity:this.alpha });;
         this.mesh3.material= new THREE.MeshBasicMaterial({ color: `hsl(${this.color},100%,50%)`, });;
         console.log(this.color);
         let picker = this.color/360 * 720 -360;
         let X= this.HSV_S*512-256;
         let Y =this.HSV_V*512-256;
         this.mesh9.position.x=X;
         this.mesh9.position.y=Y;
        this.mesh6.position.x=picker;
  }


  shader() {
    // this.container = document.createElement('div');
    // document.body.appendChild(this.container);
    this.camera.position.set(0, 0, 550);
    // this.renderer.setPixelRatio(window.devicePixelRatio);
    // this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.material1 = new THREE.ShaderMaterial({
      uniforms: {},
      transparent: true,
      // opacity: 0.5,
      vertexShader: Vertex,
      fragmentShader: fragment,
    });
    this.material2 = new THREE.ShaderMaterial({
      uniforms: {},
      transparent: true,
      // opacity: 0.5,
      vertexShader: Vertex1,
      fragmentShader: fragment1,
    });
    this.pickerMaterial = new THREE.ShaderMaterial({
      uniforms: {},
      transparent: true,
      // opacity: 0.5,
      vertexShader: Vertex2,
      fragmentShader: fragment2,
    });
    this.alphaMaterial =new THREE.ShaderMaterial({
      uniforms: {"color":{value:null}},
      transparent: true,
      // opacity: 0.5,
      vertexShader: Vertex3,
      fragmentShader: fragment3,
    });
    this.mesh7 = new THREE.Mesh(this.geometry7,this.alphaMaterial);
    this.mesh7.translateY(340);
    this.scene.add(this.mesh7);
    // this.material1.depthTest=false;
    // this.material2.depthTest=false;
    // this.material2.depthWrite=false;
    
    this.colorMaterial = new THREE.MeshBasicMaterial({ color: `hsl(${this.color},100%,50%)`, });
    this.showMaterial = new THREE.MeshBasicMaterial({ color: `hsl(${this.color},100%,50%)`, });
   // let pickerMaterial = new THREE.MeshBasicMaterial({ color: `hsl(300,100%,50%)`, });

    let circlematerial = new THREE.MeshBasicMaterial({ color:new Color('white'), });
    this.alphapicker = new THREE.MeshBasicMaterial({ color:new Color('white'), });
    this.mesh8 = new THREE.Mesh(this.geometry8,this.alphapicker);
    this.mesh8.translateY(340);
    this.mesh8.position.z=1.0;
    this.scene.add(this.mesh8);
    this.colorpicker = new THREE.MeshBasicMaterial({ color:new Color('white'), });
    this.mesh9 = new THREE.Mesh(this.geometry9,this.colorpicker);
    this.mesh9.position.z=1.0;
    this.scene.add(this.mesh9);

    this.mesh6 = new THREE.Mesh(this.geometry6,circlematerial);
    this.mesh6.translateY(300);
    this.scene.add(this.mesh6);
    this.mesh6.position.z=1.0;
    this.mesh5 = new THREE.Mesh(this.geometry5,this.pickerMaterial);
    this.mesh5.translateY(300);
    this.scene.add(this.mesh5);
    this.mesh4 = new THREE.Mesh(this.geometry4,this.showMaterial);
    this.mesh1 = new THREE.Mesh(this.geometry1, this.material1);
    this.mesh3 = new THREE.Mesh(this.geometry3,this.colorMaterial);
    this.scene.add(this.mesh3);
    this.mesh4.translateX(400);
    this.scene.add(this.mesh4);
    // this.mesh1.position.z = - 10;
    this.scene.add(this.mesh1);
    // let red = new MeshBasicMaterial({ color: new Color('red'), transparent: true, opacity: 0.5 })
    this.mesh2 = new THREE.Mesh(this.geometry2, this.material2);
    // this.mesh2.position.z = - 11;
    this.scene.add(this.mesh2);

  }

  fromEventCurrentPosition(
    name: 'mouseup' | 'mousedown' | 'mousemove' | 'mouseleave' | 'mouseenter',
  ) {
    // const element =
    const element = this.renderer.domElement;
    return fromEvent<MouseEvent>(element, name).pipe(
      map((e: MouseEvent) => {
        const p = new Vector2(e.layerX, e.layerY);
        return {
          position: p,
          tag: name,
        };
      }),
      // map(p => { {position: this.sceneService.clientPosition2ScenePosition(p.position), tag: p.tag} }
      // ),
      // map((p: Vector2) => { return {position: this.sceneService.clientPosition2ScenePosition(p),tag: name} } ),
      takeUntil(this.stop),
    );
  }
  createDrag$(): Observable<Ng3MosueDragEvent> {
    const cancel = merge(this.up$, this.leave$);
    return this.down$.pipe(
      switchMap((d) => {
        return merge(this.down$, this.position$).pipe(
          map((c) => {
            return {
              origin: d.position,
              current: c.position,
              last: c.position,
              tag: c.tag,
            };
          }),
          takeUntil(cancel),
        );
      }),
      takeUntil(this.stop),
      scan((acc, cur) => ({ ...cur, last: acc.current })),
    );
  }

  render() {
    if (this.mouseMoved) {
      this.mouseMoved = false;
    this.raycaster1.setFromCamera(this.mouseCoords, this.camera);
    var intersects = this.raycaster1.intersectObject(this.mesh5);
    if (intersects.length > 0) {
      let point = intersects[0].point;
      this.color = Math.round((point.x +360)/720 * 360);
     
     
      this.mesh6.position.x = point.x;
      this.alphaMaterial.uniforms.color.value = this.color;
    //  this.mesh7.material =new THREE.MeshBasicMaterial({ color: `hsl(${this.color},100%,50%)`, });
    }
    this.raycaster2.setFromCamera(this.mouseCoords, this.camera);
    var intersects2 = this.raycaster2.intersectObject(this.mesh7);
    if (intersects2.length > 0) {
      let point1 = intersects2[0].point;
      this.alpha = (point1.x +360)/720 ;
      this.mesh8.position.x = point1.x;
     
    //  this.mesh7.material =new THREE.MeshBasicMaterial({ color: `hsl(${this.color},100%,50%)`, });
    }
    this.raycaster3.setFromCamera(this.mouseCoords, this.camera);
    var intersects3 = this.raycaster3.intersectObject(this.mesh1);
    if (intersects3.length > 0) {
      let point2 = intersects3[0].point;
      this.mesh9.position.x=point2.x;
      this.mesh9.position.y=point2.y;
      this.HSV_S=Math.round((point2.x+256)/512*100)/100;
      this.HSV_V=Math.round((256+point2.y)/512*100)/100;
     
    //  this.mesh7.material =new THREE.MeshBasicMaterial({ color: `hsl(${this.color},100%,50%)`, });
    }
    let H=this.color;
    this.HSL_S=(this.HSV_S*this.HSV_V/ ((H = (2 - this.HSV_S) * this.HSV_V) < 1 ? H : 2 - H)) || 0;
    this.HSL_S = Math.round(this.HSL_S*100)/100;
    this.HSL_L = H / 2;
    this.HSL_L =Math.round(this.HSL_L*100)/100;
    this.mesh4.material=new THREE.MeshBasicMaterial({ color: `hsl(${this.color},${Math.round(this.HSL_S *100) }%,${Math.round(this.HSL_L*100)}%)`,transparent:true,opacity:this.alpha });;
    this.mesh3.material= new THREE.MeshBasicMaterial({ color: `hsl(${this.color},100%,50%)`, });;
    
    if (this.HSV_S == 0)
    this.R=this.G=this.B=Math.round(this.HSV_V*255);
    else{
    const h= this.color / 60;
   
    const i = Math.floor(h);
    const f = h - i;
    const p = this.HSV_V * (1 - this.HSV_S);
    const q = this.HSV_V * (1 - f * this.HSV_S);
    const t = this.HSV_V * (1 - (1 - f) * this.HSV_S);
    let r = 0, g = 0, b1 = 0;
    switch (i) {
        case 0: r = this.HSV_V; g = t; b1 = p; break;
        case 1: r = q; g = this.HSV_V; b1 = p; break;
        case 2: r = p; g = this.HSV_V; b1 = t; break;
        case 3: r = p; g = q; b1 = this.HSV_V; break;
        case 4: r = t; g = p; b1 = this.HSV_V; break;
        case 5: r = this.HSV_V, g = p, b1 = q; break;
    }
    this.R = Math.round(r * 255); this.G = Math.round(g * 255); this.B = Math.round(b1 * 255);
    }
   console.log("H:",this.color,"S:",this.HSV_S,"V:",this.HSV_V);}
   console.log("R:",this.R,"G:",this.G,"B:",this.B);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => {
      this.render();
    });
  }
}

const Vertex = `

varying highp vec3 vTextureCoord;
void main(){
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p;
  vTextureCoord = vec3( modelMatrix * vec4(position, 1.0));
}
`;
const fragment = `
varying highp vec3 vTextureCoord;

void main(){
  vec2 uv = vec2((vTextureCoord.x +256.0)/ 512.0,(vTextureCoord.y +256.0)/ 512.0);
  // vec4 heightmapValue = texture2D(colortexture, uv );
  // gl_FragColor = heightmapValue;
  float alpha =1.0- (vTextureCoord.x +256.0)/ 512.0;
  gl_FragColor = vec4(1.0,1.0,1.0,alpha) ;
}
`;
const Vertex1 = `

varying highp vec3 vTextureCoord;
void main(){
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p;
  vTextureCoord = vec3( modelMatrix * vec4(position, 0.0));
}
`;
const fragment1 = `
varying highp vec3 vTextureCoord;

void main(){
  vec2 uv = vec2((vTextureCoord.x +256.0)/ 512.0,(vTextureCoord.y +256.0)/ 512.0);
  // vec4 heightmapValue = texture2D(colortexture, uv );
  // gl_FragColor = heightmapValue;
  float alpha = 1.0- (vTextureCoord.y +256.0) / 512.0;
  gl_FragColor = vec4(0.0,0.0,0.0,alpha) ;
}
`;
const Vertex2 = `

varying highp vec3 vTextureCoord;
void main(){
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p;
  vTextureCoord = vec3( modelMatrix * vec4(position, 0.0));
}
`;
const fragment2 = `
varying highp vec3 vTextureCoord;

void main(){
  vec2 uv = vec2((vTextureCoord.x +256.0)/ 512.0,(vTextureCoord.y +256.0)/ 512.0);
  // vec4 heightmapValue = texture2D(colortexture, uv );
  // gl_FragColor = heightmapValue;
  float h = ( vTextureCoord.x + 360.0) /720.0 *360.0 /60.0;
  float i = float(floor(h));
  float f= h -i;
  float p =0.0;
  float q=1.0 -f;
  float t = f;
  float r= 0.0;
  float g=0.0;
  float b =0.0;
  if (i == 0.0){r=1.0;g=t;b=p;}
  else if (i==1.0){ r=q;g=1.0;b=p;}
  else if (i == 2.0 ) { r=p;g=1.0;b=t;}
  else if (i==3.0) { r= p; g=q;b=1.0;}
  else if (i==4.0) { r=t;g=p;b=1.0;}
  else if (i==5.0) { r=1.0;g=p;b=q;}

  gl_FragColor = vec4(r,g,b,1.0) ;
}
`;

const Vertex3 = `
uniform float color;
varying highp vec3 vTextureCoord;
void main(){
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p;
  vTextureCoord = vec3( modelMatrix * vec4(position, 0.0));
}
`;
const fragment3 = `
uniform float color;
varying highp vec3 vTextureCoord;


void main(){

  vec2 uv = vec2((vTextureCoord.x +256.0)/ 512.0,(vTextureCoord.y +256.0)/ 512.0);
  // vec4 heightmapValue = texture2D(colortexture, uv );
  // gl_FragColor = heightmapValue;
  float h = color  /60.0;
  float i = float(floor(h));
  float f= h -i;
  float p =0.0;
  float q=1.0 -f;
  float t = f;
  float r= 0.0;
  float g=0.0;
  float b =0.0;
  if (i == 0.0){r=1.0;g=t;b=p;}
  else if (i==1.0){ r=q;g=1.0;b=p;}
  else if (i == 2.0 ) { r=p;g=1.0;b=t;}
  else if (i==3.0) { r= p; g=q;b=1.0;}
  else if (i==4.0) { r=t;g=p;b=1.0;}
  else if (i==5.0) { r=1.0;g=p;b=q;}


  float alpha =  (vTextureCoord.x +256.0) / 512.0;
  gl_FragColor = vec4(r,g,b,alpha) ;
}
`;