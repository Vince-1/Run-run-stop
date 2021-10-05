export const sampleValueShder = {
  vertex: `
  varying vec3 p;
  void main(void) {
            gl_Position = vec4(position,1.0);
            p = position;
          //   p = gl_Coord;
  }
          `,
  frag: `
  varying vec3 p;
  void main() {
            float x = p.x/2.0 + 1.0;
            float y = p.y/2.0 + 1.0;
          gl_FragColor = vec4(x,y,0.0,1.0);

          if(gl_FragCoord.x > 500.0) {
                    gl_FragColor = vec4(1.0,0,0,1.0);
          }
  }`,
};
