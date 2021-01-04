export function rgbToHex(r: number, g: number, b: number): string {
  let hex = ((r << 16) | (g << 8) | b).toString(16);
  return '#' + new Array(Math.abs(hex.length - 7)).join('0') + hex;
}

export function hexToRgb(hex: string): number[] {
  let rgb: number[] = [];
  for (var i = 1; i < 7; i += 2) {
    rgb.push(parseInt('0x' + hex.slice(i, i + 2)));
  }
  return rgb;
}

export function gradient(startColor: string, endColor: string, step: number) {
  let sColor = hexToRgb(startColor);
  let eColor = hexToRgb(endColor);
  let rStep = (eColor[0] - sColor[0]) / step;
  let gStep = (eColor[1] - sColor[1]) / step;
  let bStep = (eColor[2] - sColor[2]) / step;

  var gradientColorArr = [];
  for (var i = 0; i < step; i++) {
    gradientColorArr.push(
      rgbToHex(
        rStep * i + sColor[0],
        gStep * i + sColor[1],
        bStep * i + sColor[2]
      )
    );
  }
  return gradientColorArr;
}

// how to use:
// gradient("#000011", "#001100", 10)
