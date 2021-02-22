import { Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { DoubleSide, Matrix4, Vector2, Vector3 } from 'three';
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
  geometry = new THREE.PlaneBufferGeometry(1000, 1000);
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
    side: DoubleSide,
    vertexShader: vertex,
    fragmentShader: frag,
  });
  mesh = new THREE.Mesh(this.geometry, this.material);

  rotation: number = 0;
  scale: number = 1;
  z: number = 10;
  trans = new Vector3(0, 0, 0);
  keydown = 1;
  slider: Slider = Slider.reedom;
  constructor() {
    loadStubData(StubImage3D.ct).then((x) => {
      console.log(x);
      this.material.uniforms.img.value = makeTexture3d(
        transform16to32(x.data),
        x.shape.x,
        x.shape.y,
        x.shape.z
      );
    });
    this.planeAffine(
      this.rotation,
      this.scale,
      this.z,
      this.trans,
      this.slider
    );
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

    // fromEvent(window.document, 'keydown').subscribe((e) => {
    //   (e as KeyboardEvent).preventDefault();
    //   if ((e as KeyboardEvent).ctrlKey) {
    //     this.keydown = 1;

    //   }
    // });
    fromEvent(window.document, 'keydown').subscribe((e) => {
      (e as KeyboardEvent).preventDefault();
      if ((e as KeyboardEvent).keyCode === 87) {
        this.scale += 0.1;
      }
    });
    // fromEvent(window.document, 'keyup').subscribe((e) => {
    //   if (!(e as KeyboardEvent).ctrlKey){
    //   this.keydown = 0;
    //   }
    // });

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
            new Vector2(point1.x, point1.y)
          );
        }

        this.planeAffine(
          this.rotation,
          this.scale,
          this.z,
          this.trans,
          this.slider
        );
      }
    });
  }

  middleButton(dy: number, point: Vector2) {
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
    this.scene.add(this.mesh);
    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(0.0, 0, 0);

    this.render();
    console.log(this.camera);
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
        let rotateX = Math.PI*0.5;
        let rotateY = Math.PI*0.0;
        // operation1 = operation1.makeRotationX(rotateX);
        operation1 = operation1.makeRotationZ(rotation);
        operation2 = operation2.makeTranslation(0, 0, 0);
        operation3 = operation3.makeScale(scale, scale, scale);
        operation4 = operation4.makeTranslation(
          trans.x * this.scale *Math.cos(rotateY),
          trans.y * this.scale*Math.cos(rotateX),
          trans.y * this.scale*Math.sin(rotateX)-trans.x *this.scale*Math.sin(rotateY)
        );
        const operationToY = new Matrix4().makeRotationY(rotateY);
        const operationToX = new Matrix4().makeRotationX(rotateX);




       
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

  render() {
    requestAnimationFrame(() => {
      this.render();
    });
    this.renderer.render(this.scene, this.camera);
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


// if(vTextureCoord.z>0.0){
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
