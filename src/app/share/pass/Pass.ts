import * as THREE from 'three';
import { WebGLRenderer, WebGLRenderTarget } from 'three';

export class Pass {
  // if set to true, the pass is processed by the composer
  enabled = true;

  // if set to true, the pass indicates to swap read and write buffer after rendering
  needsSwap = true;

  // if set to true, the pass clears its buffer before rendering
  clear = false;

  // if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
  renderToScreen = false;
  constructor() {}

  setSize(width: number, height: number) {}

  render(
    renderer?: WebGLRenderer,
    writeBuffer?: WebGLRenderTarget,
    readBuffer?: WebGLRenderTarget,
    deltaTime?: number,
    maskActive?: boolean
  ) {
    console.error('THREE.Pass: .render() must be implemented in derived pass.');
  }
}

// Helper for passes that need to fill the viewport with a single quad.

const _camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// https://github.com/mrdoob/three.js/pull/21358

const _geometry = new THREE.BufferGeometry();
_geometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3)
);
_geometry.setAttribute(
  'uv',
  new THREE.Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2)
);

export class FullScreenQuad {
  _mesh: THREE.Mesh;
  constructor(material: THREE.Material) {
    this._mesh = new THREE.Mesh(_geometry, material);
  }

  dispose() {
    this._mesh.geometry.dispose();
  }

  render(renderer: THREE.Renderer) {
    renderer.render(this._mesh, _camera);
  }

  get material() {
    return this._mesh.material;
  }

  set material(value: THREE.Material | THREE.Material[]) {
    this._mesh.material = value;
  }
}
