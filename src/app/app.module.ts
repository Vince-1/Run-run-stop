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
  ],
  imports: [
    BrowserModule,

    FormsModule,
    RouterModule.forRoot([
      { path: 'soldiers', component: ModelsSoldierComponent },
      { path: 'phoenix', component: ModelsPhoenixComponent },
      { path: 'conway', component: ConwayLifeGameComponent },
      { path: 'shader demo', component: ShaderDmeosComponent },
      { path: 'tile image', component: TileImageComponent },
      { path: 'gpuinteractive',component:GpuinteractiveComponent},
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
