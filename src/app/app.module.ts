import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { ModelsSoldierComponent } from './models-soldier/models-soldier.component';
import { ModelsPhoenixComponent } from './models-phoenix/models-phoenix.component';
import { ConwayLifeGameComponent } from './conway-life-game/conway-life-game.component';
import { ShaderDmeosComponent } from './shader-dmeos/shader-dmeos.component';
import { TileImageComponent } from './tile-image/tile-image.component';


import { FormsModule } from '@angular/forms';
import { TableManagementComponent } from './table-management/table-management.component';
import { GpuinteractiveComponent } from './Gpuinteractive/Gpuinteractive.component';
import { ColorshowComponent } from './colorshow/colorshow.component';
import { ColorPicker} from './color-picker/color-picker.component';
import { ShaderColorpickerComponent } from './shader-colorpicker/shader-colorpicker.component';
import { ShaderColorpickerGpuComponent } from './shader-colorpicker-gpu/shader-colorpicker-gpu.component';
import { CameraFocusComponent } from './camera-focus/camera-focus.component';
import { WireframComponent } from './wirefram/wirefram.component';
import { TestPlanegeometryComponent } from './test-planegeometry/test-planegeometry.component';

import { BoundingboxPointSourceComponent } from './boundingbox-point-source/boundingbox-point-source.component';
import { ThreeViewComponent } from './boundingbox-point-source/three-view/three-view.component';
import { SingleViewComponent } from './boundingbox-point-source/single-view/single-view.component';
import { PointSourceModule } from './boundingbox-point-source/point-source.module';
import { TomoComponent } from './tomo/tomo.component';
import { DanceComponent } from './dance/dance.component';
import { AudioPlayerComponent } from './audio-player/audio-player.component';

@NgModule({
  declarations: [
    AppComponent,
    ModelsSoldierComponent,
    ModelsPhoenixComponent,
    ConwayLifeGameComponent,
    ShaderDmeosComponent,
    TileImageComponent,
    TableManagementComponent,
    GpuinteractiveComponent,
    ColorshowComponent,
    ColorPicker,
    ShaderColorpickerComponent,
    ShaderColorpickerGpuComponent,
    CameraFocusComponent,
    WireframComponent,
    TestPlanegeometryComponent,
  ],
 
  imports: [
    BrowserModule,
    FormsModule,
    PointSourceModule,
    // ToolsModule,
    RouterModule.forRoot([
      { path: 'soldiers', component: ModelsSoldierComponent },
      { path: 'phoenix', component: ModelsPhoenixComponent },
      { path: 'conway', component: ConwayLifeGameComponent },
      { path: 'shader demo', component: ShaderDmeosComponent },
      { path: 'tile image', component: TileImageComponent },
      { path: 'gpuinteractive',component:GpuinteractiveComponent},
      { path: 'colorpicker',component:ColorshowComponent},
      { path: 'shader-colorpicker',component:ShaderColorpickerComponent},
      {path: 'shader-colorpicker-gpu',component: ShaderColorpickerGpuComponent},
      {path:'camera focus',component:CameraFocusComponent},
      {path:'testwirefram',component:WireframComponent},
      {path:'testPlaneGeometry',component:TestPlanegeometryComponent},
      {
        path: 'boudingbox point source',
        component: BoundingboxPointSourceComponent,
      },
      {
        path: 'tomo',
        component: TomoComponent,
      },
      { path: 'dance', component: DanceComponent },
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
