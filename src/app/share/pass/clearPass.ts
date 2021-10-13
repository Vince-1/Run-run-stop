import { Color, WebGLRenderer, WebGLRenderTarget } from 'three';
import { Pass } from './Pass';

export class ClearPass extends Pass {
  clearColor: Color;
  clearAlpha: number;
  _oldClearColor: Color;
  constructor(clearColor: Color, clearAlpha: number) {
    super();

    this.needsSwap = false;

    this.clearColor =
      clearColor !== undefined ? clearColor : new Color(0x000000);
    this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 0;
    this._oldClearColor = new Color();
  }

  render(
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget /*, deltaTime, maskActive */
  ) {
    let oldClearAlpha: number;

    if (this.clearColor) {
      renderer.getClearColor(this._oldClearColor);
      oldClearAlpha = renderer.getClearAlpha();

      renderer.setClearColor(this.clearColor, this.clearAlpha);
    }

    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
    renderer.clear();

    if (this.clearColor) {
      renderer.setClearColor(this._oldClearColor, oldClearAlpha);
    }
  }
}
