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

            vec4 texColor = (y_g < 0.9 && x_g < 0.9) ? texture(img,vec3(crop_x,crop_y,z_g)) : vec4(x,y,z,1.0);
            // vec4 texColor = texture(img,vec3(y_g,x_g,z_g));
            
            // vec4 texColor = texture(img,vec3(x,y,z));
            gl_FragColor = texColor;
            // gl_FragColor = vec4(x, y, z, 1.0);
          }
          `,
  };
  export const tomo = {
    vertex: `
          varying highp vec3 vTextureCoord;
          varying highp vec3 clientP;
          
          void main(void) {
            vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            clientP = p.xyz;
            gl_Position = p;
            vTextureCoord = vec3( modelMatrix * vec4(position, 1.0));
            // vTextureCoord = position;
          }
          `,
    frag: `

    struct ttt {
      highp sampler3D image;
      mat4 affines;
    };

    varying highp vec3 clientP;

    uniform highp sampler3D imgs[5];
    uniform highp sampler3D img;

    uniform ttt xxx[5];
    uniform mat4 testM4;

    uniform highp sampler2D imgss[2];
    uniform highp sampler2D colormap;
    varying highp vec3 vTextureCoord;
    uniform highp vec3 center;
    uniform highp vec3 shape;
    uniform highp vec2 windowSize;
    uniform float slicer;
    uniform highp vec2 window;

    uniform highp float test[3];
    // uniform highp float direction;
    // uninform highp float slicer;


    void main() {

      float x = (vTextureCoord.x - center.x) / windowSize.x  + 0.5;
      // float x = 0.5 ;
      float y = (vTextureCoord.y - center.y ) / windowSize.y + 0.5;
      // float z = (vTextureCoord.z - center.z ) / 1000.0 + 0.5;
      float z = slicer / shape.z;
      // vec4 texColor = texture(img,vec3(x,y,z));
      vec4 texColor = texture(imgs[1],vec3(x,y,z));
      vec4 texColor1 = texture(imgs[1],vec3(x,y,z));
      // vec4 texColor = texture(xxx[0].image,vec3(x,y,z));
      float level = max(min((texColor.r - window.x) / (window.y - window.x),1.0),0.0);
      vec4 cmColor = texture2D(colormap, vec2(level,0.5));

      gl_FragColor = cmColor;

      if(vTextureCoord.x > 10.0 ) {
        gl_FragColor = vec4(0.5,1.0,1.0,1.0);
      }
      if(vTextureCoord.z == 10.0 ) {
        gl_FragColor = vec4(0.5,0.5,1.0,1.0);
      }
      // if(clientP.z > -0.001 ) {
      //   gl_FragColor = vec4(0.5,0.5,1.0,1.0);
      // }
      // if(test[0] == 1.0) {
      //   gl_FragColor = vec4(0.5,1.0,1.0,1.0);  
      // }

      // if( texture2D(imgss[0],vec2(0.5,0.5)).x > 0.0) {
      //   gl_FragColor = vec4(0.5,1.0,1.0,1.0);  
      // }
      // if( texture(imgs[0],vec3(0.5,0.5,0.5)).x > 0.0) {
      //   gl_FragColor = vec4(0.1,0.1,1.0,1.0);  
      // }

      // if( texture(xxx[0].image,vec3(0.5,0.5,0.5)).x > 0.0) {
      //   gl_FragColor = vec4(0.1,0.1,1.0,1.0);  
      // }

      // if(xxx[0].affines[0][0] == 1.0) {
      //     gl_FragColor = vec4(0.1,1.0,1.0,1.0);  
      // }
      //   if(testM4[0][0] == 1.0) {
      //     gl_FragColor = vec4(0.1,1.0,1.0,1.0);  
      //  }

      //  if(viewMatrix[1][1] == 1.0) {
      //   gl_FragColor = vec4(0.1,1.0,1.0,1.0);  
      //  }

      // mat4 tm = mat4(1.0);

      // if(tm[0][0] == 1.0) {
      //   gl_FragColor = vec4(0.1,0.1,1.0,1.0);  
      // }
  }
          `,
  };
}
