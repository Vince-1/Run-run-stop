import {
  Camera,
  Color,
  Material,
  Renderer,
  RenderTarget,
  Scene,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { Pass } from './Pass';

class RenderPass extends Pass {
  scene: Scene;
  camera: Camera;
  overrideMaterial: Material;
  clearColor: Color;
  clearAlpha: number;
  clear = true;
  clearDepth = false;
  needsSwap = false;
  _oldClearColor = new Color();

  constructor(
    scene: Scene,
    camera: Camera,
    overrideMaterial?: Material,
    clearColor?: Color,
    clearAlpha?: number
  ) {
    super();

    this.scene = scene;
    this.camera = camera;

    this.overrideMaterial = overrideMaterial;

    this.clearColor = clearColor;
    this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 0;
  }

  render(
    renderer?: WebGLRenderer,
    writeBuffer?: WebGLRenderTarget,
    readBuffer?: WebGLRenderTarget /*, deltaTime, maskActive */
  ) {
    const oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;

    let oldClearAlpha: number, oldOverrideMaterial: Material;

    if (this.overrideMaterial !== undefined) {
      oldOverrideMaterial = this.scene.overrideMaterial;

      this.scene.overrideMaterial = this.overrideMaterial;
    }

    if (this.clearColor) {
      renderer.getClearColor(this._oldClearColor);
      oldClearAlpha = renderer.getClearAlpha();

      renderer.setClearColor(this.clearColor, this.clearAlpha);
    }

    if (this.clearDepth) {
      renderer.clearDepth();
    }

    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);

    // TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
    if (this.clear)
      renderer.clear(
        renderer.autoClearColor,
        renderer.autoClearDepth,
        renderer.autoClearStencil
      );
    renderer.render(this.scene, this.camera);

    if (this.clearColor) {
      renderer.setClearColor(this._oldClearColor, oldClearAlpha);
    }

    if (this.overrideMaterial !== undefined) {
      this.scene.overrideMaterial = oldOverrideMaterial;
    }

    renderer.autoClear = oldAutoClear;
  }
}

export { RenderPass };
