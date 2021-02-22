const vertex = `
varying highp vec3 vTextureCoord;

void main(void) {
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p;
  // vTextureCoord = vec3( modelMatrix * vec4(position, 1.0));
  vTextureCoord = position;
}
`;

const structDefinition = [
  'struct Table {',
  '  highp sampler 3D image;',
  '  mat4 affine',
];

const parameters = [
  'uniform highp sample2D colormap;',
  'uniform highp vec3 vTextureCoord;',
  'uniform highp vec3 center;',
  'uniform highp vec3 shape;',
  'uniform highp vec2 windowSize;',
  'uniform highp vec2 windowPosition;',
  'unifrom highp vec2 window;',
  'uniform float slicer;',
  'uniform float view;',
  'uniform float pet;',
  'uniform mat4 planeAffine ',
  'float x,y,z;',
];

const functions = [
  '    void setSampleCoord(float xs,float ys) {',
  'if(view == 0.0) {',
  '       if(pet == 0.0) {',
  '                 y = 1.0 - ys;',
  '                 x = 1.0 - xs;',
  '       } else {',
  '                 y = xs;',
  '                 x = ys;',
  '       }',
  '                 z = (slicer + 0.5) / shape.z;',
  '       } else if(view == 1.0) {',
  '                 y = xs;',
  '                 z = ys;',
  '                 x = (slicer + 0.5) / shape.x;',
  '       } else {',
  '                 z = 1.0 - xs;',
  '                 x = ys;',
  '                 y = (slicer + 0.5) / shape.y;',
  '                 }',
  '       }',
];

const main = [
  'void main() {',

  '                    float xs = (vTextureCoord.x - windowPosition.x) / windowSize.x  + 0.5; ',
  '                    float ys = (vTextureCoord.y - windowPosition.y) / windowSize.y +0.5 ;',

  '                    setSampleCoord(xs,ys);',

  '                    vec4 texColor = texture(image,vec3(x,y,z));',

  '                    float level = max(min((texColor.r - window.x) / (window.y - window.x),1.0),0.0);',

  '                    vec4 cmColor = texture2D(colormap, vec2(level,0.5));',

  '                    vec4 test = vec4(level,level,level,1.0);',

  '                    gl_FragColor = test;',
  '                    // gl_FragColor = texColor;',
  '                    // gl_FragColor = cmColor;',

  '                }',
];

export class shaderTablesConstructor {
  whichTableBody = [];
  whichTableStart = [
    'highp Table whichTable (vec3 p) {',
    //     ...this.whichTableBody,

    //     '     if(inTable(p,table0)) {',
    //     '               return tabel0;',
    //     '     }',
    //     '     if(inTable(p,table0)) {',
    //     '               return tabel0;',
    //     '     }',
  ];
  whichTableEnd = [
    '          return table0',
    '}',
    'bool inTable (vec3 p,Table t) {',
    '     vec3 coord = (vec4(p,1.0) * t.affine).xyz;',
    '     return (coord.x >= 0.0 && coord.x <= 1.0 && coord.y >= 0.0 && coord.y <= 1.0 && coord.z >=0.0 && coord.z <= 1.0)',
    '}',
  ];

  parametersExtra = [];
  constructor() {}
  addTableSample3D(i: number) {
    const para = 'uniform Table table' + i.toString() + ';';
    const whichTableBody = [
      'if(inTable(p,table' + i.toString() + ')) {',
      '         return table' + i.toString() + ';',
      '   }',
    ];
    return { para, whichTableBody };
  }

  setTables(n: number) {
    let para = [];
    let whichTableBody = [];
    for (let i = 0; i++; i < n) {
      const mid = this.addTableSample3D(i);
      para = [...para, mid.para];
      whichTableBody = [...whichTableBody, ...mid.whichTableBody];
    }
    this.parametersExtra = para;
    this.whichTableBody = whichTableBody;
    return this.getFrag();
  }

  getVertex() {
    return vertex;
  }
  getFrag() {
    return [
      ...structDefinition,
      ...parameters,
      ...this.parametersExtra,
      ...functions,
      ...this.whichTableStart,
      ...this.whichTableBody,
      ...this.whichTableEnd,
      ...main,
    ];
  }
}
