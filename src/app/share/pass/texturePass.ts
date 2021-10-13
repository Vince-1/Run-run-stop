import {
  IUniform,
  RenderTarget,
  ShaderMaterial,
  Texture,
  UniformsUtils,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { CopyShader } from '../shaders/copyShaders';
import { FullScreenQuad, Pass } from './Pass';

export class TexturePass extends Pass {
  map: Texture;
  opacity: number;
  uniforms: { [uniform: string]: IUniform };
  material: ShaderMaterial;
  fsQuad = new FullScreenQuad(null);
  constructor(map: Texture, opacity: number) {
    super();

    if (CopyShader === undefined)
      console.error('THREE.TexturePass relies on CopyShader');

    const shader = CopyShader;

    this.map = map;
    this.opacity = opacity !== undefined ? opacity : 1.0;

    this.uniforms = UniformsUtils.clone(shader.uniforms);

    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      depthTest: false,
      depthWrite: false,
    });

    this.needsSwap = false;
  }

  render(
    renderer?: WebGLRenderer,
    writeBuffer?: WebGLRenderTarget,
    readBuffer?: WebGLRenderTarget /*, deltaTime, maskActive */
  ) {
    const oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;

    this.fsQuad.material = this.material;

    this.uniforms['opacity'].value = this.opacity;
    this.uniforms['tDiffuse'].value = this.map;
    this.material.transparent = this.opacity < 1.0;

    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
    if (this.clear) renderer.clear();
    this.fsQuad.render(renderer);

    renderer.autoClear = oldAutoClear;
  }
}
