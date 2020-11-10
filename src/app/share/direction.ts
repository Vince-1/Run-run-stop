export enum Image3DThreeView {
  Transverse = 'Transverse',
  Coronal = 'Coronal',
  Sagittal = 'Sagittal',
}

export function viewToNumber(v: Image3DThreeView): number {
  switch (v) {
    case Image3DThreeView.Transverse:
      return 1;
    case Image3DThreeView.Coronal:
      return 2;
    case Image3DThreeView.Sagittal:
      return 0;
  }
}
