import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { ModelsSoldierComponent } from './models-soldier/models-soldier.component';
import { ModelsPhoenixComponent } from './models-phoenix/models-phoenix.component';
import { ConwayLifeGameComponent } from './conway-life-game/conway-life-game.component';
import { ShaderDmeosComponent } from './shader-dmeos/shader-dmeos.component';

@NgModule({
  declarations: [
    AppComponent,
    ModelsSoldierComponent,
    ModelsPhoenixComponent,
    ConwayLifeGameComponent,
    ShaderDmeosComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      { path: 'soldiers', component: ModelsSoldierComponent },
      { path: 'phoenix', component: ModelsPhoenixComponent },
      { path: 'conway', component: ConwayLifeGameComponent },
      { path: 'shader demo', component: ShaderDmeosComponent },
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
