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
            
            vec4 texColor = texture(img,vec3(x,y,z));
            gl_FragColor = texColor;
            // gl_FragColor = vec4(x, y, z, 1.0);
          }
          `,
  };
  export const plane = {
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
            
            // vec4 texColor = texture2D(img,vec2(x,y));
            // gl_FragColor = texColor;
            gl_FragColor = vec4(x, y, (x + y) / 2.0, 1.0); 
          }
       `,
  };
  export const conway = {
    vertex: `
          varying highp vec2 vTextureCoord;
          
          void main(void) {
            vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_Position = p;
            // gl_PointSize = 10.0;
            // gl_Position = vec4(0.0,0.0,0.0,1.0);
            vTextureCoord = vec2( modelMatrix * vec4(position, 1.0));
          }
          `,
    frag: `
          uniform highp sampler2D img;
          uniform highp vec2 center;
          uniform highp vec2 shape;
          uniform highp vec2 size;
          
          varying highp vec2 vTextureCoord;
          
          void main() {
            float x = (vTextureCoord.x - center.x) / size.x + 0.5;
            float y = (vTextureCoord.y - center.y) / size.y + 0.5;
            
            vec2 vCoord = (vTextureCoord - center) / size + 0.5;

            float total = 0.0;
            total += (texture2D(img, vCoord + vec2(-1.0,-1.0) / size).x > 0.5) ? 1.0:0.0;
            total += (texture2D(img, vCoord + vec2(-1.0,0.0) / size).x > 0.5) ? 1.0:0.0;
            total += (texture2D(img, vCoord + vec2(-1.0,1.0) / size).x > 0.5) ? 1.0:0.0;
            total += (texture2D(img, vCoord + vec2(0.0,-1.0) / size).x > 0.5) ? 1.0:0.0;
            total += (texture2D(img, vCoord + vec2(0.0,1.0) / size).x > 0.5) ? 1.0:0.0;
            total += (texture2D(img, vCoord + vec2(1.0,-1.0) / size).x > 0.5) ? 1.0:0.0;
            total += (texture2D(img, vCoord + vec2(1.0,0.0) / size).x > 0.5) ? 1.0:0.0;
            total += (texture2D(img, vCoord + vec2(1.0,1.0) / size).x > 0.5) ? 1.0:0.0;

            vec3 old = texture2D(img, vCoord).xyz;

            vec4 cell = vec4(0.0);

            if( old.x == 0.0 ) {
              if( total == 3.0) {
                cell = vec4(1.0,1.0,1.0,1.0);
              } else {
                cell = vec4(0.0,0.0,0.0,1.0);
              }
            } else {
              if( total == 2.0 || total == 3.0) {
                cell = vec4(1.0,1.0,1.0,1.0);
              } else {
                cell = vec4(0.0,0.0,0.0,1.0);
              }
            }
            // if(total == 1.0) {
            //   gl_FragColor = vec4(0.0,0.0,0.0,1.0);
            // } else {
            //   gl_FragColor = vec4(x, y, (x + y) / 2.0, 1.0);
            // }
            gl_FragColor = cell;

            // vec4 texColor = texture2D(img,vCoord);
            // gl_FragColor = texColor;
            // gl_FragColor = vec4(x, y, (x + y) / 2.0, 1.0);
            // gl_FragColor = vec4(0.0,0.0,0.0,1.0);

          }
       `,
  };
  export const tile = {
    vertex: `
          varying highp vec3 vTextureCoord;
          
          void main(void) {
            vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_Position = p;
            // vTextureCoord = vec3( modelMatrix * vec4(position, 1.0));
            vTextureCoord = position;
          }
          `,
    frag: `
          uniform highp sampler3D img;
          // uniform highp sampler2D img;
          uniform highp vec3 center;
          uniform highp vec3 shape;
          uniform highp vec3 size;
          uniform float z;
          uniform highp vec2 grid;
          uniform highp vec2 windowSize;

          varying highp vec3 vTextureCoord;
          
          void main() {
            float x = (vTextureCoord.x - center.x) / windowSize.x + 0.5;
            float y = (vTextureCoord.y - center.y) / windowSize.y + 0.5;
            
            float x_g = fract(x * grid.x);
            float y_g = fract(y * grid.y);

            float crop_y = y_g / 0.9;
            float crop_x = x_g / 0.9;

            // float x_g = 1.0 - fract(x * grid.x);
            // float y_g = 1.0 - fract(y * grid.y);

            float row = floor(x * grid.x);
            float col = floor(y * grid.y);

            float z_g = (row* grid.y + col + z * 10.0) / size.z;

            vec4 texColor = (y_g < 0.9 && x_g < 0.9) ? vec4(texture(img,vec3(crop_x,crop_y,z_g)).xxx,1.0) : vec4(x,y,z,1.0);
            // vec4 texColor = texture(img,vec3(y_g,x_g,z_g));
            
            // vec4 texColor = texture(img,vec3(x,y,z));
            gl_FragColor = texColor;
            // gl_FragColor = vec4(texColor.xxx,1.0);
            // gl_FragColor = vec4(x, y, z, 1.0);
          }
          `,
  };
  export const tomo = {
    vertex: `
          varying highp vec3 vTextureCoord;
          
          void main(void) {
            vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_Position = p;
            // vTextureCoord = vec3( modelMatrix * vec4(position, 1.0));
            vTextureCoord = position;
          }
          `,
    frag: `
    uniform highp sampler3D img;
    uniform highp sampler2D colormap;
    varying highp vec3 vTextureCoord;
    uniform highp vec3 center;
    uniform highp vec3 shape;
    uniform highp vec2 windowSize;
    uniform float slicer;
    uniform highp vec2 window;
    // uniform highp float direction;
    // uninform highp float slicer;


    void main() {

      float x = (vTextureCoord.x - center.x) / windowSize.x  + 0.5;
      // float x = 0.5 ;
      float y = (vTextureCoord.y - center.y ) / windowSize.y + 0.5;
      // float z = (vTextureCoord.z - center.z ) / 1000.0 + 0.5;
      float z = slicer / shape.z;
      vec4 texColor = texture(img,vec3(x,y,z));
      float level = max(min((texColor.r - window.x) / (window.y - window.x),1.0),0.0);
      vec4 cmColor = texture2D(colormap, vec2(level,0.5));
      gl_FragColor = cmColor;

      // if(y > 0.5) {
      //   gl_FragColor = vec4(0.5,0,0,1.0);
      // }
  }
          `,
  };
  export const singleImage3d = {
    vertex: `
          varying highp vec3 vTextureCoord;
          uniform highp mat4 planAffine;
          uniform highp mat4 planAffineInverse;
          
          void main(void) {
            vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_Position = p;
            // vTextureCoord = vec3( modelMatrix * vec4(position, 1.0));
            vTextureCoord = (planAffine * vec4(position,1.0)).xyz;
          }
          `,
    frag: `
  
    varying highp vec3 vTextureCoord;
  
    uniform highp sampler3D image;
    uniform highp mat4 imageAffine;
    uniform highp mat4 imageAffineInverse;
    
    uniform highp mat4 planeAffine;
    uniform highp mat4 planeAffineInverse;
  
    uniform highp sampler2D colormap;
    uniform highp vec2 window;
  
  
    void main() {
      
      vec3 sampleCoord = (imageAffineInverse * vec4(vTextureCoord,1.0)).xyz + 0.5;
      vec4 texColor = texture(image,vec3(sampleCoord.xy,0.5));
      float level = max(min((texColor.r - window.x) / (window.y - window.x),1.0),0.0);
      vec4 cmColor = texture2D(colormap,vec2(level,0.5));
      
      vec4 grayColor = vec4(level,level,level,1.0);

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
      gl_FragColor = cmColor;
      // gl_FragColor = grayColor;
      // gl_FragColor = texColor;

      // bool t = level > 0.0;
      // if(t) {
      //   gl_FragColor = vec4(0.5,0.0,0.0,1.0);
      // }
      
    }
          `,
  };
}
