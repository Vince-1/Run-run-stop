import { Component, OnInit, ɵConsole } from '@angular/core';
import * as THREE from 'three';
import {
  BufferGeometry,
  Color,
  DoubleSide,
  FrontSide,
  Group,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  Matrix4,
  Mesh,
  Vector,
  Vector2,
  Vector3,
} from 'three';
import { loadStubData, StubImage3D } from '../share/stub';
import { makeArray, makeTexture3d, transform16to32 } from '../share/utils';
import { createDrag } from '../share/drag';
import { fromEvent } from 'rxjs';
import { Slider } from '../share/direction';

@Component({
  selector: 'app-sigle-canvas',
  templateUrl: './sigle-canvas.component.html',
  styleUrls: ['./sigle-canvas.component.less'],
})
export class SigleCanvasComponent implements OnInit {
  camera = new THREE.OrthographicCamera(
    -window.innerWidth / 2,
    window.innerWidth / 2,
    -window.innerHeight / 2,
    window.innerHeight / 2,
    -10000,
    10000
  );
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();
  geometry = new THREE.PlaneBufferGeometry(800, 500);
  geometryYZ = new THREE.PlaneBufferGeometry(800, 500);
  geometryXZ = new THREE.PlaneBufferGeometry(800, 500);
  raycaster = new THREE.Raycaster();
  // material = new THREE.MeshBasicMaterial({color:new THREE.Color('red')});
  material = new THREE.ShaderMaterial({
    uniforms: {
      img: { value: makeTexture3d(makeArray(1000), 10, 10, 10) },
      planAffine: { value: new Matrix4() },
      planAffineInverse: { value: new Matrix4() },
      imageAffine: { value: new Matrix4() },
      imageAffineInverse: { value: new Matrix4() },
    },
    vertexShader: vertex,
    fragmentShader: frag,
    transparent:true,
    side: DoubleSide,
    
  });

  materialYZ = new THREE.ShaderMaterial({
    uniforms: {
      img: { value: makeTexture3d(makeArray(1000), 10, 10, 10) },
      planAffine: { value: new Matrix4() },
      planAffineInverse: { value: new Matrix4() },
      imageAffine: { value: new Matrix4() },
      imageAffineInverse: { value: new Matrix4() },
    },
    vertexShader: vertex,
    fragmentShader: frag,
    transparent:true,
    side: DoubleSide,
    
  });

  materialXZ = new THREE.ShaderMaterial({
    uniforms: {
      img: { value: makeTexture3d(makeArray(1000), 10, 10, 10) },
      planAffine: { value: new Matrix4() },
      planAffineInverse: { value: new Matrix4() },
      imageAffine: { value: new Matrix4() },
      imageAffineInverse: { value: new Matrix4() },
    },
    vertexShader: vertex,
    fragmentShader: frag,
    transparent:true,
    side: DoubleSide,
    
  });
  
  mesh = new THREE.Mesh(this.geometry, this.material);
  meshYZ = new THREE.Mesh(this.geometryYZ, this.materialYZ);
  meshXZ = new THREE.Mesh(this.geometryXZ, this.materialXZ);

  rotation: number = 0;
  scale: number = 1;
  z=new Vector3(0,0,0);
  RX=Math.PI*0.0;
  RY = Math.PI*0.0;
  trans = new Vector3(0, 0, 0);
  LineXYposition = new Vector2(0,0);
  keydown = 0;
  slider: Slider = Slider.y;
  line1material = new LineDashedMaterial({
    color: new Color(1.0, 0, 0),
    linewidth: 40,
    dashSize:40,
    gapSize:40,
    transparent:true,
    opacity:1.0,
    side:FrontSide
  });
  line1geometry = new BufferGeometry().setFromPoints([
    new Vector3(0, 0, -0),
    new Vector3(0, 0, 500),
  ]);

  line2material = new LineDashedMaterial({
    color: new Color(0, 1.0, 0),
    linewidth: 40,
    dashSize:40,
    gapSize:40,
    transparent:true,
    opacity:0.5,
    side:DoubleSide
  });
  line2geometry = new BufferGeometry().setFromPoints([
    new Vector3(0, 0, 0),
    new Vector3(500, 0, 0),
  ]);

  line3material = new LineDashedMaterial({
    color: new Color(0, 0, 1.0),
    linewidth: 40,
    dashSize:40,
    gapSize:40,
    transparent:true,
    opacity:1.0,
    side:DoubleSide
  });
  line3geometry = new BufferGeometry().setFromPoints([
    new Vector3(0, 0, 0),
    new Vector3(0, -500, 0),
  ]);

  lineXmaterial = new LineDashedMaterial({
    color: new Color(0, 1.0, 0),
    linewidth: 40,
    dashSize:40,
    gapSize:40,
    transparent:true,
    opacity:1.0,
    side:DoubleSide
  });
  lineXgeometry = new BufferGeometry().setFromPoints([
    new Vector3(-400, 0, 0),
    new Vector3(400, 0, 0),
  ]);
  lineXMesh = new Line(this.lineXgeometry, this.lineXmaterial);

  lineYmaterial = new LineDashedMaterial({
    color: new Color(0, 0, 1.0),
    linewidth: 40,
    dashSize:40,
    gapSize:40,
    transparent:true,
    opacity:1.0,
    side:DoubleSide
  });
  lineYgeometry = new BufferGeometry().setFromPoints([
    new Vector3(0, -300, 0),
    new Vector3(0, 300, 0),
  ]);
  lineYMesh = new Line(this.lineYgeometry, this.lineYmaterial);



  line1Mesh = new Line(this.line1geometry, this.line1material);
  line2Mesh = new Line(this.line2geometry, this.line2material);
  line3Mesh = new Line(this.line3geometry, this.line3material);

  meshGroup = new Group();
  meshGroupXY= new Group();
  
  constructor() {
    loadStubData(StubImage3D.ct).then((x) => {
      console.log(x);
      this.material.uniforms.img.value = makeTexture3d(
        transform16to32(x.data),
        x.shape.x,
        x.shape.y,
        x.shape.z
      );
      this.materialYZ.uniforms.img.value = makeTexture3d(
        transform16to32(x.data),
        x.shape.x,
        x.shape.y,
        x.shape.z
      );
      this.materialXZ.uniforms.img.value = makeTexture3d(
        transform16to32(x.data),
        x.shape.x,
        x.shape.y,
        x.shape.z
      );
    });
    // this.planeAffine(
    //   this.rotation,
    //   this.scale,
    //   this.z,
    //   this.trans,
    //   this.slider
    // );
    // this.rotation = Math.PI * 0.2;
    let imageAffineStandard = new Matrix4();
    imageAffineStandard.set(
      240,
      0,
      0,
      0,
      0,
      240,
      0,
      0,
      0,
      0,
      424,
      0,
      0,
      0,
      0,
      1
    );
    let imageInverse = new Matrix4().getInverse(imageAffineStandard);
    this.material.uniforms.imageAffineInverse.value = imageInverse;
    this.materialYZ.uniforms.imageAffineInverse.value = imageInverse;
    this.materialXZ.uniforms.imageAffineInverse.value = imageInverse;

    fromEvent(window.document, 'keydown').subscribe((e) => {
      (e as KeyboardEvent).preventDefault();
      if ((e as KeyboardEvent).ctrlKey) {
        this.keydown = 1;

      }
    });

    fromEvent(window.document, 'keyup').subscribe((e) => {
      if (!(e as KeyboardEvent).ctrlKey){
      this.keydown = 0;
      }
    });

    fromEvent(window.document, 'keydown').subscribe((e) => {
      (e as KeyboardEvent).preventDefault();
      if ((e as KeyboardEvent).keyCode === 87) {
        this.scale += 0.1;
      }
    });

    fromEvent(this.renderer.domElement, 'mousewheel').subscribe(
      (event: MouseWheelEvent) => {
        event.preventDefault();
        this.z.z = this.z.z + event.deltaY / Math.abs(event.deltaY);
      }
    );
 

    const drag1 = createDrag(this.renderer.domElement);
    drag1.subscribe((p) => {
      const currentpoint = new Vector2(p.current.x, p.current.y);
      const origionpoint = new Vector2(p.origin.x, p.origin.y);
      const lastpoint = new Vector2(p.last.x, p.last.y);
      const origionScene = this.setCoords(origionpoint);
      const currentScene = this.setCoords(currentpoint);
      const lastScene = this.setCoords(lastpoint);
      let last = new Vector3(0.0, 0, 0);
      let current = new Vector3(0, 0, 0);
      let origion = new Vector3(0, 0, 0);

      // console.log(p);
      this.raycaster.setFromCamera(origionScene, this.camera);
      let intersects = this.raycaster.intersectObject(this.mesh);
      if (intersects.length > 0) {
        origion = intersects[0].point;
        // console.log(point);

        let rastercurrent = new THREE.Raycaster();
        rastercurrent.setFromCamera(currentScene, this.camera);
        let intersectsCurrent = rastercurrent.intersectObject(this.mesh);
        if (intersectsCurrent.length > 0) {
          // console.log(intersectsCurrent[0].point);
          current = intersectsCurrent[0].point;
        }

        let rasterlast = new THREE.Raycaster();
        rasterlast.setFromCamera(lastScene, this.camera);
        let intersectLastt = rasterlast.intersectObject(this.mesh);
        if (intersectLastt.length > 0) {
          // console.log(intersectLastt[0].point);
          last = intersectLastt[0].point;
        }

        if (p.button === 0 && this.keydown === 1) {
          let Dxy = new Vector2(current.x - last.x, current.y - last.y);
          Dxy.rotateAround(new Vector2(0, 0), this.rotation);
          this.trans.x = this.trans.x - Dxy.x;
          this.trans.y = this.trans.y - Dxy.y;

          this.LineXYposition.x= this.LineXYposition.x+current.x-last.x;
          this.LineXYposition.y= this.LineXYposition.y +current.y-last.y;
          this.meshGroupXY.position.set(this.LineXYposition.x,this.LineXYposition.y,0);
        }

        if (p.button === 2 && this.keydown === 1) {
          this.rotateByDrag(current.x, last.x, current.y, last.y);

        }

        if (p.button === 1 && this.keydown === 1) {
          let b = new Vector2(this.trans.x, this.trans.y);
          b.rotateAround(new Vector2(0, 0), -this.rotation);

          let point1 = new Vector2(
            (origion.x + b.x) * this.scale,
            (origion.y + b.y) * this.scale
          );
          this.middleButton(
            current.y - last.y,
            new Vector2(point1.x, point1.y),
            new Vector2(origion.x,origion.y)
          );
        }

        if(p.button===0 && this.keydown===0){
          this.LineXYposition=new Vector2(current.x,current.y);
          this.meshGroupXY.position.set(current.x,current.y,0);
        }

      }
    });
  }

  middleButton(dy: number, point: Vector2,origion:Vector2) {
    let scale = dy;
    const origionScale = this.scale;
    if (scale > 0 && this.scale >= 0.2) {
      this.scale -= 0.1;
    }
    if (scale < 0) {
      this.scale += 0.1;
    }

    const Cx = point.x / this.scale - point.x / origionScale;
    const Cy = point.y / this.scale - point.y / origionScale;
    let dxy = new Vector2(Cx, Cy);
    let result = dxy.rotateAround(new Vector2(0, 0), this.rotation);
    console.log(point, result);
    this.trans.x = this.trans.x + result.x;
    this.trans.y = this.trans.y + result.y;

    let LineXY=new Vector2(this.LineXYposition.x-origion.x,this.LineXYposition.y - origion.y);

    let  Cxline = LineXY.x - LineXY.x*origionScale /this.scale;
    let  Cyline = LineXY.y - LineXY.y*origionScale / this.scale;



    this.LineXYposition.x=this.LineXYposition.x -Cxline;
    this.LineXYposition.y=this.LineXYposition.y -Cyline;
    this.meshGroupXY.position.set(this.LineXYposition.x,this.LineXYposition.y,0);
  }

  rotateByDrag(Cx: number, Ox: number, Cy: number, Oy: number) {
    let result = this.rotateCenter(Cx, Ox, Cy, Oy);
    const currentAngle = Math.atan2(result.cx, result.cy);
    const originAngle = Math.atan2(result.ox, result.oy);

    let angle = currentAngle - originAngle;
    // if (Cy * Oy < 0) {
    //   angle += Math.PI;
    // }

    if (angle !== NaN) {
      this.rotation += angle;
      let a = new Vector2(this.trans.x, this.trans.y);
      a.rotateAround(new Vector2(0, 0), angle);
      this.trans.x = a.x;
      this.trans.y = a.y;

      let transXY = new Vector2(this.trans.x,this.trans.y);
      let transXYrotate= transXY.rotateAround(new Vector2(0,0),-this.rotation);
      let XYplane=new Vector2(this.LineXYposition.x+transXYrotate.x,this.LineXYposition.y+transXYrotate.y);
      let XYplanerotate=XYplane.rotateAround(new Vector2(0,0),-angle);
      this.LineXYposition.x =-transXYrotate.x+XYplanerotate.x;
      this.LineXYposition.y=-transXYrotate.y +XYplanerotate.y;
      this.meshGroupXY.setRotationFromAxisAngle(new Vector3(0,0,1),-this.rotation);

    }
  }

  rotateCenter(Cx: number, Ox: number, Cy: number, Oy: number) {
    let a = new Vector2(this.trans.x, this.trans.y);
    a.rotateAround(new Vector2(0, 0), -this.rotation);

    return {
      cx: Cx + a.x,
      ox: Ox + a.x,
      cy: Cy + a.y,
      oy: Oy + a.y,
    };
    // return {
    //   cx: Cx ,
    //   ox: Ox,
    //   cy: Cy,
    //   oy: Oy ,
    // };
  }

  setCoords(point: Vector2) {
    const x = (point.x / this.renderer.domElement.clientWidth) * 2 - 1;
    const y = -(point.y / this.renderer.domElement.clientHeight) * 2 + 1;
    return new Vector2(x, y);
  }

  ngOnInit(): void {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    this.mesh.position.set(0, 0, 0);
    this.meshYZ.position.set(850,-300,0);
    this.meshXZ.position.set(820,300,0);
    this.scene.add(this.mesh,this.meshYZ,this.meshXZ);
    this.meshGroup.add(this.line1Mesh,this.line2Mesh,this.line3Mesh);
    this.scene.add(this.meshGroup);
    // this.lineXMesh.position.y=100;
    // this.lineYMesh.position.x = -100;
    this.meshGroupXY.add(this.lineXMesh,this.lineYMesh);
    this.scene.add(this.meshGroupXY);
    this.meshGroup.position.set(-1200,0,500);
    this.camera.position.set(0, 0, 3000);
    this.camera.lookAt(0.0, 0, 0);
  
    this.render();

  }

  planeAffineWhole(select: {
    scale: number;
    rotate: number;
    rotateX: number;
    rotateY: number;
    calibration: Vector3;
    trans: Vector3;
  }) {
    const center = new Vector3(
      0,
      Math.cos(select.rotateX),
      Math.sin(select.rotateX)
    );
    const operationToY = new Matrix4().makeRotationAxis(center, select.rotateY);
    const operationToX = new Matrix4().makeRotationX(select.rotateX);
    let trans1 = new Vector3(select.trans.x, select.trans.y, select.trans.z);

    let a = trans1.applyMatrix4(operationToX);
    let b = a.applyMatrix4(operationToY);
    
 
    const operation1 = new Matrix4().makeRotationZ(select.rotate);
    const operation2 = new Matrix4().makeTranslation(
      select.calibration.x,
      select.calibration.y,
      select.calibration.z
    );
    const operation3 = new Matrix4().makeScale(
      select.scale,
      select.scale,
      select.scale
    );

    const operation4 = new Matrix4().makeTranslation(
      b.x * this.scale,
      b.y * this.scale,
      b.z * this.scale
    );

    const planAffine = multiMatrix4([
      operation4,
      operation2,
      operationToY,
      operationToX,
      operation1,
      operation3,
    ]);

    // this.material.uniforms.planAffine.value = planAffine;
    // this.materialYZ.uniforms.planAffine.value = planAffine;
    // this.materialXZ.uniforms.planAffine.value = planAffine;
    this.z =this.sliderCompute();
    return planAffine;
  }

  sliderCompute(){
    let transXY = new Vector2(this.trans.x,this.trans.y);
    let transXYrotate = transXY.rotateAround(new Vector2(0,0),-this.rotation);
    let D = new Vector2(this.LineXYposition.x +transXYrotate.x,this.LineXYposition.y+transXYrotate.y);
    let Drotate = D.rotateAround(new Vector2(0,0),this.rotation);
    let Dxyz = new Vector3(Drotate.x,Drotate.y,0);
    let DxyzRotateX = Dxyz.applyMatrix4(new Matrix4().makeRotationX(this.RX));

    const center = new Vector3(
      0,
      Math.cos(this.RX),
      Math.sin(this.RX)
    );
    const a = new Matrix4().makeRotationAxis(center, this.RY);
    const DxyzRotateY = DxyzRotateX.applyMatrix4(a);
    return DxyzRotateY;

  }

  render() {
    requestAnimationFrame(() => {
      this.render();
    });
    // this.planeAffine(
    //   this.rotation,
    //   this.scale,
    //   this.z,
    //   this.trans,
    //   this.slider
    // );
    // this.planeAffineWhole(
    //   new Vector3(this.scale, this.scale, this.scale),
    //   this.rotation,
    //   Math.PI * 0.25,
    //   -Math.PI * 0.25,
    //   new Vector3(0, 0, this.z),
    //   this.trans
    // );
    
    let z = {
      scale: this.scale,
      rotate: this.rotation,
      rotateX:this.RX,
      rotateY: this.RY,
      calibration: new Vector3(0,0,this.z.z),
      trans: this.trans,
    };
    let X = {
      scale: this.scale,
      rotate: this.rotation,
      rotateX:this.RX,
      rotateY: this.RY+Math.PI*0.5,
      calibration: new Vector3(this.z.x,0,0),
      trans: this.trans,
    };
    let Y = {
      scale: this.scale,
      rotate: this.rotation,
      rotateX:this.RX+Math.PI*0.5,
      rotateY: this.RY,
      calibration: new Vector3(0,this.z.y,0),
      trans: this.trans,
    };


    this.meshGroup.setRotationFromAxisAngle(new Vector3(1,0,0),z.rotateX);
    this.meshGroup.rotateOnWorldAxis(new Vector3(0,-Math.sin(z.rotateX),Math.cos(z.rotateX)),z.rotateY);

    this.meshGroupXY.position.set(this.LineXYposition.x,this.LineXYposition.y,0);
    // this.planeAffineWhole(z);
    this.material.uniforms.planAffine.value = this.planeAffineWhole(z);
    this.materialYZ.uniforms.planAffine.value = this.planeAffineWhole(X);
    this.materialXZ.uniforms.planAffine.value = this.planeAffineWhole(Y);
    this.renderer.render(this.scene, this.camera);
  }

  planeAffine(
    rotation: number,
    scale: number,
    z: number,
    trans: Vector3,
    slider: Slider
  ) {
    let operation1 = new Matrix4();
    let operation2 = new Matrix4();
    let operation3 = new Matrix4();
    let operation4 = new Matrix4();
    let operationToxyz = new Matrix4();

    switch (slider) {
      case 'y': {
        operation1 = operation1.makeRotationY(rotation);
        operation2 = operation2.makeTranslation(0, z, 0);
        operation3 = operation3.makeScale(scale, -scale, scale);
        operation4 = operation4.makeTranslation(
          trans.x * this.scale,
          trans.z * this.scale,
          -trans.y * this.scale
        );
        operationToxyz = operationToxyz.makeRotationX(Math.PI * 0.5);
        const planAffine = multiMatrix4([
          // operationToxyz,
          operation4,
          operation2,
          operation1,
          operationToxyz,
          operation3,
        ]);

        this.material.uniforms.planAffine.value = planAffine;
        break;
      }

      case 'z': {
        operation1 = operation1.makeRotationZ(rotation);
        operation2 = operation2.makeTranslation(0, 0, z);
        operation3 = operation3.makeScale(scale, scale, scale);
        operation4 = operation4.makeTranslation(
          trans.x * this.scale,
          trans.y * this.scale,
          trans.z * this.scale
        );
        operationToxyz = operationToxyz.makeRotationZ(Math.PI * 0.0);
        const planAffine = multiMatrix4([
          // operationToxyz,
          operation4,
          operation2,
          operation1,
          operationToxyz,
          operation3,
        ]);

        this.material.uniforms.planAffine.value = planAffine;
        break;
      }

      case 'x': {
        operation1 = operation1.makeRotationX(rotation);
        operation2 = operation2.makeTranslation(z, 0, 0);
        operation3 = operation3.makeScale(scale, scale, scale);
        operation4 = operation4.makeTranslation(
          trans.z * this.scale,
          trans.y * this.scale,
          -trans.x * this.scale
        );
        operationToxyz = operationToxyz.makeRotationY(Math.PI * 0.5);
        const planAffine = multiMatrix4([
          // operationToxyz,
          operation4,
          operation2,
          operation1,
          operationToxyz,
          operation3,
        ]);

        this.material.uniforms.planAffine.value = planAffine;
        break;
      }

      case 'reedom': {
        let rotateX = Math.PI * 0.25;
        let rotateY = -Math.PI * 0.25;

        const center = new Vector3(0, Math.cos(rotateX), Math.sin(rotateX));
        console.log(center);
        const operationToY = new Matrix4().makeRotationAxis(center, rotateY);
        // const operationToY = new Matrix4().makeRotationY(rotateY);
        const operationToX = new Matrix4().makeRotationX(rotateX);

        let trans1 = new Vector3(trans.x, trans.y, trans.z);

        let a = trans1.applyMatrix4(operationToX);
        let b = a.applyMatrix4(operationToY);

        // operation1 = operation1.makeRotationX(rotateX);
        operation1 = operation1.makeRotationZ(rotation);
        operation2 = operation2.makeTranslation(0, 0, z);
        operation3 = operation3.makeScale(scale, scale, scale);
        operation4 = operation4.makeTranslation(
          // trans.x * this.scale *Math.cos(rotateY),
          // trans.y * this.scale*Math.cos(rotateX),
          // trans.y * this.scale*Math.sin(rotateX)-trans.x *this.scale*Math.sin(rotateY)
          // 0,0,0
          b.x * this.scale,
          b.y * this.scale,
          b.z * this.scale
        );

        const planAffine = multiMatrix4([
          // operationToxyz,
          operation4,
          operation2,
          operationToY,
          operationToX,
          operation1,
          operation3,
        ]);

        this.material.uniforms.planAffine.value = planAffine;
        break;
      }
    }
    // operation4 = operation4.makeTranslation(trans.x, trans.y, trans.z);
  }

}

function multiMatrix4(ms: Matrix4[]): Matrix4 {
  if (ms.length === 0) {
    throw Error('one more matrix4 is needed');
  }
  if (ms.length === 1) {
    return ms[0];
  } else {
    let multi = new Matrix4().multiplyMatrices(ms[0], ms[1]);
    ms.shift();
    ms.shift();
    ms.unshift(multi);
    return multiMatrix4(ms);
  }
}

const vertex = `
varying highp vec3 vTextureCoord;
uniform highp mat4 planAffine;
uniform highp mat4 planAffineInverse;

void main(void) {
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p;
  
  vTextureCoord = (planAffine * vec4(position,1.0)).xyz;

}
`;
const frag = `

varying highp vec3 vTextureCoord;

uniform highp sampler3D img;
uniform highp mat4 imageAffine;
uniform highp mat4 imageAffineInverse;

uniform highp mat4 planeAffine;
uniform highp mat4 planeAffineInverse;



void main() {

// float x = vTextureCoord.x /240.0 +0.5;
// float y = vTextureCoord.y /240.0 +0.5;
// float z = vTextureCoord.z - 0.5;

vec3 sampleCoord = (imageAffineInverse * vec4(vTextureCoord,1.0)).xyz +0.5;

if(sampleCoord.x>0.0 && sampleCoord.y>0.0 && sampleCoord.x <1.0 && sampleCoord.y<1.0&& sampleCoord.z>0.0 && sampleCoord.z<1.0){
  float tex= texture(img,vec3(sampleCoord.x,sampleCoord.y,sampleCoord.z)).r;

  gl_FragColor = vec4(tex,tex,tex,tex);
}else{
  gl_FragColor = vec4(1.0,1.0,0.0,1.0);
}


// if(sampleCoord.z<0.0){
//   gl_FragColor = vec4(1.0,0.0,0.0,1.0);
// }

}
`;
export function printMatrix4(m: Matrix4) {
  for (let i = 0; i < 4; i++) {
    const row = [];
    for (let j = 0; j < 4; j++) {
      row.push(m.elements[i + j * 4]);
    }
    console.log(row.join(', '));
  }
}
