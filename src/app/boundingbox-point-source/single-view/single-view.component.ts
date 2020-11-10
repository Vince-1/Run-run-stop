import {
  Component,
  OnInit,
  Input,
  RendererFactory2,
  Renderer2,
} from '@angular/core';
import { Maybe } from 'src/app/share/maybe';
import { Image3D } from 'src/app/share/image3d';
import {
  Texture,
  Scene,
  OrthographicCamera,
  Vector3,
  Vector2,
  WebGLRenderer,
  ShaderMaterial,
  BoxBufferGeometry,
  Mesh,
} from 'three';
import { rangeW } from 'src/app/share/range';
import { Image3DThreeView } from 'src/app/share/direction';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-single-view',
  templateUrl: './single-view.component.html',
  styleUrls: ['./single-view.component.less'],
})
export class SingleViewComponent implements OnInit {
  @Input() set image(i: Maybe<Image3D>) {
    if (i?.be) {
      this.imageUpdate(i.value);
    } else {
      console.warn('image is: ', i);
    }
  }
  @Input() set colorMap(c: Maybe<Texture>) {
    if (c?.be) {
      this.colormapUpdate(c.value);
    } else {
      console.warn('colormap is: ', c);
    }
  }
  @Input() set window(w: Maybe<rangeW>) {
    if (w?.be) {
      this.windowUpdate(w.value);
    } else {
      console.warn('window is: ', w);
    }
  }
  @Input() set view(d: Maybe<Image3DThreeView>) {
    if (d?.be) {
      this.viewUpdate(d.value);
    } else {
      console.warn('view is: ', d);
      rangeW
    }
  }
  @Input() cameraSize = new Vector2(500, 500);
  @Input() canvasSize = new Vector2(500, 500);
  scene = new Scene();
  camera = new OrthographicCamera(
    -this.cameraSize.x / 2,
    this.cameraSize.x / 2,
    -this.cameraSize.y / 2,
    this.cameraSize.y / 2
  );
  renderer: WebGLRenderer;
  orbit: OrbitControls;

  angularRenderer2: Renderer2;

  shaderMaterial: ShaderMaterial = new ShaderMaterial({
    uniforms:{}
  });
  box = new Mesh(new BoxBufferGeometry(), this.shaderMaterial);

  constructor(rendererFactory: RendererFactory2) {
    this.angularRenderer2 = rendererFactory.createRenderer(null, null);
    const canvas = this.angularRenderer2.createElement('canvas');
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      context: canvas.getContext('webgl2', { alpha: true, antialias: true }),
    });
    this.renderer.setSize(this.canvasSize.x, this.canvasSize.y);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.scene.add(this.box);
  }

  ngOnInit(): void {}
  imageUpdate(image: Image3D) {}
  colormapUpdate(colormap: Texture) {}
  windowUpdate(window: rangeW) {}
  viewUpdate(view: Image3DThreeView) {}
}
