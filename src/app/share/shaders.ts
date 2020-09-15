export namespace shaders {
  export const cube = {
    vertex: `
          varying highp vec3 vTextureCoord;
          
          void main(void) {
            vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_Position = p;
            vTextureCoord = vec3( modelMatrix * vec4(position, 1.0));
          }
          `,
    frag: `
          uniform highp sampler3D img;
          // uniform highp sampler2D img;
          uniform highp vec3 center;
          uniform highp vec3 shape;
          uniform highp vec3 size;
          
          varying highp vec3 vTextureCoord;
          
          void main() {
            float x = (vTextureCoord.x - center.x) / size.x + 0.5;
            float y = (vTextureCoord.y - center.y) / size.y + 0.5;
            float z = (vTextureCoord.z - center.z) / size.z + 0.5;
            
            // vec4 texColor = texture(img,vec3(x,y,z));
            // gl_FragColor = texColor;
            gl_FragColor = vec4(x, y, z, 1.0);
          }
          `,
  };
  export const conway = {
    vertex: `
          varying highp vec3 vTextureCoord;
          
          void main(void) {
            vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_Position = p;
            vTextureCoord = vec3( modelMatrix * vec4(position, 1.0));
          }
          `,
    frag: `
          uniform highp sampler2D img;
          uniform highp vec2 center;
          uniform highp vec2 shape;
          uniform highp vec2 size;
          
          varying highp vec3 vTextureCoord;
          
          void main() {
            float x = (vTextureCoord.x - center.x) / size.x + 0.5;
            float y = (vTextureCoord.y - center.y) / size.y + 0.5;
            
            // vec4 texColor = texture(img,vec2(x,y));
            // gl_FragColor = texColor;
            gl_FragColor = vec4(x, y, (x + y) / 2.0, 1.0);
          }
       `,
  };
}
