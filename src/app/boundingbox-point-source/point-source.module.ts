import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoundingboxPointSourceComponent } from './boundingbox-point-source.component';
import { ThreeViewComponent } from './three-view/three-view.component';
import { SingleViewComponent } from './single-view/single-view.component';

@NgModule({
  declarations: [
    BoundingboxPointSourceComponent,
    ThreeViewComponent,
    SingleViewComponent,
  ],
  imports: [CommonModule],
  exports: [BoundingboxPointSourceComponent],
})
export class PointSourceModule {}
